import { BackendService } from './BackendService';

class SimpleNotificationService {
  constructor() {
    this.backendService = new BackendService();
  }

  async createTestNotification(type, title, message, priority = 'medium') {
    try {
      const notificationData = {
        type: this.createNotificationType(type),
        title,
        message,
        priority,
        metadata: null,
        actionUrl: null,
        expiresAt: null
      };

      const result = await this.backendService.createNotification(notificationData);
      console.log('Notification created:', result);
      return result;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  createNotificationType(type) {
    switch (type) {
      case 'transaction':
        return {
          Transaction: {
            amount: 100.0,
            currency: "USD",
            status: "completed"
          }
        };
      case 'security':
        return {
          Security: {
            event: "login",
            severity: "info",
            action: null
          }
        };
      case 'vault':
        return {
          Vault: {
            vaultId: "vault-123",
            action: "deposit",
            amount: 50.0
          }
        };
      case 'system':
        return {
          System: {
            message: "System maintenance",
            priority: "low"
          }
        };
      default:
        return {
          System: {
            message: "General notification",
            priority: "low"
          }
        };
    }
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

  async getUnreadCount() {
    try {
      return await this.backendService.getUnreadNotificationCount();
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

export default new SimpleNotificationService();
