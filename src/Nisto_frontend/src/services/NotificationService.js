import { BackendService } from './BackendService';

class NotificationService {
  constructor() {
    this.backendService = new BackendService();
    this.pushSubscription = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.init();
  }

  async init() {
    if (this.isSupported) {
      await this.registerServiceWorker();
      await this.requestNotificationPermission();
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/notification-sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async requestNotificationPermission() {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async subscribeToPushNotifications() {
    if (!this.isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      this.pushSubscription = subscription;
      
      // Save subscription to backend
      await this.backendService.addPushSubscription({
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
        deviceInfo: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        })
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications() {
    if (!this.pushSubscription) return;

    try {
      await this.pushSubscription.unsubscribe();
      await this.backendService.removePushSubscription(this.pushSubscription.id);
      this.pushSubscription = null;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }

  async createNotification(type, title, message, priority = 'medium', metadata = null, actionUrl = null) {
    try {
      const notificationData = {
        type: this.createNotificationType(type, metadata),
        title,
        message,
        priority,
        metadata: metadata ? JSON.stringify(metadata) : null,
        actionUrl,
        expiresAt: null
      };

      const result = await this.backendService.createNotification(notificationData);
      
      // Show in-app notification
      this.showInAppNotification(title, message, priority);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        this.showBrowserNotification(title, message, actionUrl);
      }

      return result;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  createNotificationType(type, metadata) {
    switch (type) {
      case 'transaction':
        return {
          Transaction: {
            amount: metadata?.amount || 0,
            currency: metadata?.currency || 'USD',
            status: metadata?.status || 'completed'
          }
        };
      case 'security':
        return {
          Security: {
            event: metadata?.event || 'login',
            severity: metadata?.severity || 'info',
            action: metadata?.action || null
          }
        };
      case 'vault':
        return {
          Vault: {
            vaultId: metadata?.vaultId || '',
            action: metadata?.action || 'deposit',
            amount: metadata?.amount || null
          }
        };
      case 'social':
        return {
          Social: {
            event: metadata?.event || 'message',
            userId: metadata?.userId || '',
            metadata: metadata?.metadata || null
          }
        };
      case 'system':
        return {
          System: {
            message: metadata?.message || '',
            priority: metadata?.priority || 'low'
          }
        };
      case 'payment':
        return {
          Payment: {
            provider: metadata?.provider || '',
            amount: metadata?.amount || 0,
            status: metadata?.status || 'completed'
          }
        };
      case 'recovery':
        return {
          Recovery: {
            method: metadata?.method || '',
            status: metadata?.status || 'pending'
          }
        };
      default:
        return {
          System: {
            message: 'General notification',
            priority: 'low'
          }
        };
    }
  }

  showInAppNotification(title, message, priority = 'medium') {
    // Dispatch custom event for in-app notifications
    const event = new CustomEvent('showNotification', {
      detail: {
        title,
        message,
        priority,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }

  showBrowserNotification(title, message, actionUrl = null) {
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'nesto-notification',
      requireInteraction: false,
      silent: false
    });

    if (actionUrl) {
      notification.onclick = () => {
        window.focus();
        window.location.href = actionUrl;
        notification.close();
      };
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  async getNotifications(limit = 20, offset = 0) {
    try {
      return await this.backendService.getUserNotifications(limit, offset);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId) {
    try {
      return await this.backendService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      return await this.backendService.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      return await this.backendService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      return await this.backendService.getUnreadNotificationCount();
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async updatePreferences(preferences) {
    try {
      return await this.backendService.updateNotificationPreferences(preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  async getPreferences() {
    try {
      return await this.backendService.getNotificationPreferences();
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Notification templates for common events
  async notifyTransactionSuccess(amount, currency, txHash) {
    return this.createNotification('transaction', 
      'Transaction Successful', 
      `Your ${currency} ${amount} transaction has been completed successfully.`,
      'medium',
      { amount, currency, status: 'completed', txHash }
    );
  }

  async notifySecurityEvent(event, severity = 'info') {
    const titles = {
      login: 'New Login Detected',
      logout: 'Logout Successful',
      password_change: 'Password Changed',
      recovery_setup: 'Recovery Method Added'
    };

    const messages = {
      login: 'A new device has logged into your account.',
      logout: 'You have been successfully logged out.',
      password_change: 'Your password has been changed successfully.',
      recovery_setup: 'A new recovery method has been added to your account.'
    };

    return this.createNotification('security',
      titles[event] || 'Security Event',
      messages[event] || 'A security event has occurred.',
      severity === 'critical' ? 'high' : 'medium',
      { event, severity }
    );
  }

  async notifyVaultActivity(vaultId, action, amount = null) {
    const titles = {
      deposit: 'Vault Deposit',
      withdraw: 'Vault Withdrawal',
      create: 'Vault Created',
      join: 'Vault Joined'
    };

    const messages = {
      deposit: amount ? `$${amount} has been deposited to your vault.` : 'A deposit has been made to your vault.',
      withdraw: amount ? `$${amount} has been withdrawn from your vault.` : 'A withdrawal has been made from your vault.',
      create: 'Your new vault has been created successfully.',
      join: 'You have successfully joined a vault.'
    };

    return this.createNotification('vault',
      titles[action] || 'Vault Activity',
      messages[action] || 'Vault activity has occurred.',
      'medium',
      { vaultId, action, amount }
    );
  }

  async notifyPaymentSuccess(provider, amount) {
    return this.createNotification('payment',
      'Payment Successful',
      `Your ${provider} payment of $${amount} has been processed.`,
      'medium',
      { provider, amount, status: 'completed' }
    );
  }

  async notifySystemUpdate(message, priority = 'low') {
    return this.createNotification('system',
      'System Update',
      message,
      priority,
      { message, priority }
    );
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
