// Browser-compatible EventEmitter implementation
class SimpleEventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

class RealTimeNotificationService extends SimpleEventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.pollingInterval = null;
    this.lastNotificationId = null;
    this.backendService = null;
    this.pollingEnabled = true;
    this.pollingIntervalMs = 10000; // 10 seconds
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
  }

  // Initialize the service with backend service
  initialize(backendService) {
    this.backendService = backendService;
    console.log('RealTimeNotificationService initialized');
  }

  // Start real-time updates
  async start() {
    if (!this.backendService) {
      console.error('BackendService not provided to RealTimeNotificationService');
      return false;
    }

    if (this.isConnected) {
      console.log('RealTimeNotificationService already running');
      return true;
    }

    try {
      this.isConnected = true;
      this.startPolling();
      this.emit('connected');
      console.log('RealTimeNotificationService started');
      return true;
    } catch (error) {
      console.error('Failed to start RealTimeNotificationService:', error);
      this.isConnected = false;
      this.emit('error', error);
      return false;
    }
  }

  // Stop real-time updates
  stop() {
    if (!this.isConnected) {
      return;
    }

    this.isConnected = false;
    this.stopPolling();
    this.emit('disconnected');
    console.log('RealTimeNotificationService stopped');
  }

  // Start polling for new notifications
  startPolling() {
    if (!this.pollingEnabled || this.pollingInterval) {
      return;
    }

    this.pollingInterval = setInterval(async () => {
      await this.checkForNewNotifications();
    }, this.pollingIntervalMs);

    console.log(`Started polling for notifications every ${this.pollingIntervalMs}ms`);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped polling for notifications');
    }
  }

  // Check for new notifications
  async checkForNewNotifications() {
    if (!this.backendService || !this.isConnected) {
      return;
    }

    try {
      // Get recent notifications
      const result = await this.backendService.getUserNotifications(10, 0);
      
      if (result && result.ok && Array.isArray(result.ok)) {
        const notifications = result.ok;
        
        // Check for new notifications
        const newNotifications = notifications.filter(notification => {
          if (!this.lastNotificationId) {
            return true; // First time, consider all as new
          }
          return notification.id > this.lastNotificationId;
        });

        if (newNotifications.length > 0) {
          // Update last notification ID
          this.lastNotificationId = Math.max(...notifications.map(n => n.id));
          
          // Emit new notifications
          this.emit('newNotifications', newNotifications);
          
          // Emit individual notifications
          newNotifications.forEach(notification => {
            this.emit('notification', notification);
          });

          console.log(`Found ${newNotifications.length} new notifications`);
        }
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
      this.handleError(error);
    }
  }

  // Handle errors and attempt reconnection
  handleError(error) {
    this.emit('error', error);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.reconnect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Attempt to reconnect
  async reconnect() {
    try {
      this.stop();
      await this.start();
      this.reconnectAttempts = 0;
      console.log('Successfully reconnected');
    } catch (error) {
      console.error('Failed to reconnect:', error);
      this.handleError(error);
    }
  }

  // Manually trigger a notification check
  async checkNow() {
    await this.checkForNewNotifications();
  }

  // Update polling interval
  setPollingInterval(intervalMs) {
    this.pollingIntervalMs = intervalMs;
    
    if (this.pollingInterval) {
      this.stopPolling();
      this.startPolling();
    }
  }

  // Enable/disable polling
  setPollingEnabled(enabled) {
    this.pollingEnabled = enabled;
    
    if (enabled && this.isConnected && !this.pollingInterval) {
      this.startPolling();
    } else if (!enabled && this.pollingInterval) {
      this.stopPolling();
    }
  }

  // Get service status
  getStatus() {
    return {
      isConnected: this.isConnected,
      pollingEnabled: this.pollingEnabled,
      pollingIntervalMs: this.pollingIntervalMs,
      reconnectAttempts: this.reconnectAttempts,
      lastNotificationId: this.lastNotificationId
    };
  }

  // Subscribe to specific notification types
  subscribeToType(type, callback) {
    this.on('notification', (notification) => {
      if (notification.type === type) {
        callback(notification);
      }
    });
  }

  // Subscribe to high priority notifications
  subscribeToHighPriority(callback) {
    this.on('notification', (notification) => {
      if (notification.priority === 'high') {
        callback(notification);
      }
    });
  }

  // Subscribe to unread notifications
  subscribeToUnread(callback) {
    this.on('notification', (notification) => {
      if (!notification.read) {
        callback(notification);
      }
    });
  }

  // WebSocket support (for future implementation)
  async connectWebSocket() {
    // This would be implemented when WebSocket support is added
    console.log('WebSocket support not yet implemented');
    return false;
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    // This would be implemented when WebSocket support is added
    console.log('WebSocket support not yet implemented');
  }
}

// Create singleton instance
const realTimeNotificationService = new RealTimeNotificationService();

export default realTimeNotificationService;
