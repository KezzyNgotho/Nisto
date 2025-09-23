class PushNotificationService {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    this.permission = Notification.permission;
    
    // Request permission if not already granted
    if (this.permission === 'default') {
      try {
        this.permission = await Notification.requestPermission();
        console.log('Push notification permission:', this.permission);
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        this.permission = 'denied';
      }
    }
  }

  async requestPermission() {
    if (!this.isSupported) return false;
    
    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  showNotification(notification) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission denied');
      return null;
    }

    try {
      const title = notification.title || 'Nesto Notification';
      const body = notification.message || 'You have a new notification';
      const icon = notification.icon || '/favicon.ico';
      
      const options = {
        body: body,
        icon: icon,
        badge: icon,
        tag: notification.type || 'nesto-notification',
        requireInteraction: notification.priority === 'high',
        silent: false,
        data: notification,
        actions: notification.actions || [],
        ...notification.options
      };

      const pushNotification = new Notification(title, options);
      
      // Handle click events
      pushNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        pushNotification.close();
        
        // Navigate to relevant section if specified
        if (notification.action?.url) {
          window.location.href = notification.action.url;
        }
        
        // Trigger custom click handler if provided
        if (notification.onClick) {
          notification.onClick(notification);
        }
      };

      // Handle close events
      pushNotification.onclose = () => {
        if (notification.onClose) {
          notification.onClose(notification);
        }
      };

      // Auto-close after specified duration (default: 5 seconds for non-high priority)
      const duration = notification.duration || (notification.priority === 'high' ? 0 : 5000);
      if (duration > 0) {
        setTimeout(() => {
          pushNotification.close();
        }, duration);
      }

      return pushNotification;
    } catch (error) {
      console.error('Error showing push notification:', error);
      return null;
    }
  }

  showSecurityAlert(alert) {
    return this.showNotification({
      title: 'Security Alert',
      message: alert.message,
      type: 'security',
      priority: 'high',
      icon: '/security-icon.png',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      ...alert
    });
  }

  showPaymentNotification(payment) {
    return this.showNotification({
      title: 'Payment Notification',
      message: payment.message,
      type: 'payment',
      priority: 'medium',
      icon: '/payment-icon.png',
      duration: 8000,
      ...payment
    });
  }

  showVaultNotification(vault) {
    return this.showNotification({
      title: 'Vault Update',
      message: vault.message,
      type: 'vault',
      priority: 'medium',
      icon: '/vault-icon.png',
      ...vault
    });
  }

  showSystemNotification(system) {
    return this.showNotification({
      title: 'System Update',
      message: system.message,
      type: 'system',
      priority: 'low',
      icon: '/system-icon.png',
      duration: 4000,
      ...system
    });
  }

  // Batch notifications
  showBatchNotifications(notifications) {
    const results = [];
    
    notifications.forEach((notification, index) => {
      // Stagger notifications to avoid overwhelming the user
      setTimeout(() => {
        const result = this.showNotification(notification);
        results.push(result);
      }, index * 1000); // 1 second delay between notifications
    });

    return results;
  }

  // Close all notifications
  closeAll() {
    if (this.isSupported) {
      // Note: This is a browser limitation - we can't programmatically close all notifications
      // Users need to close them manually or they auto-close based on duration
      console.log('Cannot programmatically close all notifications');
    }
  }

  // Get permission status
  getPermissionStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      canShow: this.isSupported && this.permission === 'granted'
    };
  }

  // Subscribe to push notifications (for future implementation)
  async subscribeToPush() {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Permission denied');
      }
    }

    // This would integrate with a push service like Firebase Cloud Messaging
    // For now, we'll just return success
    console.log('Push notification subscription would be implemented here');
    return { success: true };
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    console.log('Push notification unsubscription would be implemented here');
    return { success: true };
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
