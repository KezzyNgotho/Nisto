import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

/**
 * ICP Native Notification Service
 * Leverages Internet Computer's capabilities for advanced notifications
 */
class ICNotificationService {
  constructor() {
    this.agent = null;
    this.actor = null;
    this.authClient = null;
    this.principal = null;
    this.isInitialized = false;
    this.serviceWorker = null;
    this.pushManager = null;
    this.subscription = null;
  }

  /**
   * Initialize the ICP notification service
   */
  async init() {
    try {
      // Initialize Internet Identity
      this.authClient = await AuthClient.create();
      
      // Check if user is authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      if (!isAuthenticated) {
        console.log('ICNotificationService: User not authenticated');
        return false;
      }

      this.principal = this.authClient.getIdentity().getPrincipal();
      this.agent = new HttpAgent({
        identity: this.authClient.getIdentity(),
        host: window.location.hostname === 'localhost' ? 'http://localhost:4943' : 'https://ic0.app'
      });

      // Initialize service worker for push notifications
      await this.initServiceWorker();
      
      // Initialize push manager
      await this.initPushManager();
      
      this.isInitialized = true;
      console.log('ICNotificationService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('ICNotificationService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize service worker for background notifications
   */
  async initServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/notification-sw.js');
        this.serviceWorker = registration;
        console.log('ICNotificationService: Service worker registered');
        
        // Listen for push events
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
        return registration;
      } catch (error) {
        console.error('ICNotificationService: Service worker registration failed:', error);
      }
    }
    return null;
  }

  /**
   * Initialize push manager for web push notifications
   */
  async initPushManager() {
    if (this.serviceWorker && 'PushManager' in window) {
      try {
        this.pushManager = await this.serviceWorker.pushManager;
        console.log('ICNotificationService: Push manager initialized');
        return this.pushManager;
      } catch (error) {
        console.error('ICNotificationService: Push manager initialization failed:', error);
      }
    }
    return null;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications() {
    if (!this.pushManager) {
      throw new Error('Push manager not available');
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Generate VAPID keys (in production, these should be from your backend)
      const vapidPublicKey = this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || 'your-vapid-public-key');

      // Subscribe to push notifications
      this.subscription = await this.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to backend
      await this.sendSubscriptionToBackend(this.subscription);
      
      console.log('ICNotificationService: Push subscription successful');
      return this.subscription;
    } catch (error) {
      console.error('ICNotificationService: Push subscription failed:', error);
      throw error;
    }
  }

  /**
   * Send push subscription to ICP backend
   */
  async sendSubscriptionToBackend(subscription) {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }

    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')),
        deviceInfo: navigator.userAgent
      };

      // Call backend to store subscription
      await this.actor.addPushSubscription(subscriptionData);
      console.log('ICNotificationService: Subscription sent to backend');
    } catch (error) {
      console.error('ICNotificationService: Failed to send subscription to backend:', error);
      throw error;
    }
  }

  /**
   * Create a notification on ICP backend
   */
  async createNotification(notificationData) {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }

    try {
      const notification = {
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority || 'medium',
        metadata: notificationData.metadata ? JSON.stringify(notificationData.metadata) : null,
        actionUrl: notificationData.actionUrl || null,
        expiresAt: notificationData.expiresAt || null
      };

      const result = await this.actor.createNotification(notification);
      console.log('ICNotificationService: Notification created:', result);
      return result;
    } catch (error) {
      console.error('ICNotificationService: Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications from ICP backend
   */
  async getUserNotifications(limit = 20, offset = 0) {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }

    try {
      const result = await this.actor.getUserNotifications(limit, offset);
      console.log('ICNotificationService: Retrieved notifications:', result);
      return result;
    } catch (error) {
      console.error('ICNotificationService: Failed to get notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }

    try {
      const result = await this.actor.markNotificationAsRead(notificationId);
      console.log('ICNotificationService: Notification marked as read:', result);
      return result;
    } catch (error) {
      console.error('ICNotificationService: Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences) {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }

    try {
      const result = await this.actor.updateNotificationPreferences(preferences);
      console.log('ICNotificationService: Preferences updated:', result);
      return result;
    } catch (error) {
      console.error('ICNotificationService: Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Send cross-canister notification
   */
  async sendCrossCanisterNotification(targetCanisterId, notificationData) {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }

    try {
      const result = await this.actor.sendCrossCanisterNotification(targetCanisterId, notificationData);
      console.log('ICNotificationService: Cross-canister notification sent:', result);
      return result;
    } catch (error) {
      console.error('ICNotificationService: Failed to send cross-canister notification:', error);
      throw error;
    }
  }

  /**
   * Handle service worker messages
   */
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'PUSH_RECEIVED':
        this.handlePushNotification(data.payload);
        break;
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(data.payload);
        break;
      default:
        console.log('ICNotificationService: Unknown message type:', data.type);
    }
  }

  /**
   * Handle incoming push notification
   */
  handlePushNotification(payload) {
    console.log('ICNotificationService: Push notification received:', payload);
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(payload.title, {
        body: payload.message,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        tag: payload.tag || 'ic-notification',
        data: payload,
        requireInteraction: payload.priority === 'critical',
        actions: payload.actions || []
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        if (payload.actionUrl) {
          window.location.href = payload.actionUrl;
        }
      };
    }
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(payload) {
    console.log('ICNotificationService: Notification clicked:', payload);
    
    // Mark as read on backend
    if (payload.notificationId) {
      this.markNotificationAsRead(payload.notificationId);
    }
    
    // Navigate to action URL if provided
    if (payload.actionUrl) {
      window.location.href = payload.actionUrl;
    }
  }

  /**
   * Utility: Convert URL base64 to Uint8Array
   */
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

  /**
   * Utility: Convert ArrayBuffer to base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isAuthenticated: !!this.principal,
      hasServiceWorker: !!this.serviceWorker,
      hasPushManager: !!this.pushManager,
      hasSubscription: !!this.subscription,
      principal: this.principal?.toString()
    };
  }
}

// Create singleton instance
const icNotificationService = new ICNotificationService();

export default icNotificationService;
