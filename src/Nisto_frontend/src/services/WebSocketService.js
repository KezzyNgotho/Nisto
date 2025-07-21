class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.heartbeatInterval = null;
    this.listeners = new Map();
    this.connectionId = null;
    this.userId = null;
    this.isConnected = false;
    this.pendingMessages = [];
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket server URL
   * @param {number} userId - User ID for authentication
   */
  connect(url = 'ws://localhost:8080', userId = null) {
    try {
      this.userId = userId;
      console.log('Connecting to WebSocket:', url);
      
      this.ws = new WebSocket(url);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen(event) {
    console.log('WebSocket connected successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Send authentication if user ID is provided
    if (this.userId) {
      this.send({
        type: 'auth',
        userId: this.userId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send any pending messages
    this.sendPendingMessages();
    
    // Notify listeners
    this.notifyListeners('connected', { userId: this.userId });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      switch (data.type) {
        case 'auth_success':
          this.connectionId = data.connectionId;
          console.log('WebSocket authenticated, connection ID:', this.connectionId);
          break;
          
        case 'alert':
          this.handleAlert(data);
          break;
          
        case 'notification':
          this.handleNotification(data);
          break;
          
        case 'heartbeat':
          this.handleHeartbeat(data);
          break;
          
        case 'transaction_update':
          this.handleTransactionUpdate(data);
          break;
          
        case 'goal_progress':
          this.handleGoalProgress(data);
          break;
          
        case 'budget_alert':
          this.handleBudgetAlert(data);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
          this.notifyListeners('message', data);
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, event.data);
    }
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.isConnected = false;
    this.stopHeartbeat();
    
    this.notifyListeners('disconnected', { 
      code: event.code, 
      reason: event.reason 
    });
    
    // Attempt reconnection if not intentionally closed
    if (event.code !== 1000) {
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.notifyListeners('error', error);
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyListeners('max_reconnect_reached');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle heartbeat response
   */
  handleHeartbeat(data) {
    console.log('Heartbeat response received');
  }

  /**
   * Handle alert notifications
   */
  handleAlert(data) {
    console.log('Alert received:', data);
    
    // Store alert in local storage for persistence
    this.storeAlert(data);
    
    // Show browser notification if permitted
    this.showBrowserNotification(data);
    
    // Notify listeners
    this.notifyListeners('alert', data);
  }

  /**
   * Handle general notifications
   */
  handleNotification(data) {
    console.log('Notification received:', data);
    this.notifyListeners('notification', data);
  }

  /**
   * Handle transaction updates
   */
  handleTransactionUpdate(data) {
    console.log('Transaction update received:', data);
    this.notifyListeners('transaction_update', data);
  }

  /**
   * Handle goal progress updates
   */
  handleGoalProgress(data) {
    console.log('Goal progress update received:', data);
    this.notifyListeners('goal_progress', data);
  }

  /**
   * Handle budget alerts
   */
  handleBudgetAlert(data) {
    console.log('Budget alert received:', data);
    
    // Show high-priority notification for budget alerts
    this.showBrowserNotification({
      ...data,
      options: {
        ...data.options,
        requireInteraction: true,
        tag: 'budget-alert'
      }
    });
    
    this.notifyListeners('budget_alert', data);
  }

  /**
   * Send message to WebSocket server
   */
  send(data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        console.log('Message sent:', data);
      } catch (error) {
        console.error('Error sending message:', error);
        this.pendingMessages.push(data);
      }
    } else {
      console.log('WebSocket not connected, queuing message');
      this.pendingMessages.push(data);
    }
  }

  /**
   * Send pending messages when connection is restored
   */
  sendPendingMessages() {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      this.send(message);
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data = null) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Store alert in local storage
   */
  storeAlert(alertData) {
    try {
      const storageKey = `nesto_alerts_${this.userId}`;
      let alerts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new alert
      alerts.unshift({
        ...alertData,
        receivedAt: new Date().toISOString(),
        read: false,
        id: alertData.notification?.id || `alert_${Date.now()}`
      });
      
      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts = alerts.slice(0, 100);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(alerts));
      
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  /**
   * Get stored alerts from local storage
   */
  getStoredAlerts(limit = 50) {
    try {
      const storageKey = `nesto_alerts_${this.userId}`;
      const alerts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return limit > 0 ? alerts.slice(0, limit) : alerts;
    } catch (error) {
      console.error('Error getting stored alerts:', error);
      return [];
    }
  }

  /**
   * Mark alert as read
   */
  markAlertAsRead(alertId) {
    try {
      const storageKey = `nesto_alerts_${this.userId}`;
      let alerts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const alertIndex = alerts.findIndex(alert => alert.id === alertId);
      if (alertIndex > -1) {
        alerts[alertIndex].read = true;
        alerts[alertIndex].readAt = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(alerts));
        
        // Notify server
        this.send({
          type: 'mark_alert_read',
          alertId: alertId,
          userId: this.userId
        });
        
        return true;
      }
      
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
    
    return false;
  }

  /**
   * Show browser notification
   */
  async showBrowserNotification(alertData) {
    try {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      if (Notification.permission === 'granted') {
        const title = alertData.template?.title || 'Nesto Notification';
        const body = alertData.template?.message || alertData.alert?.message || 'You have a new notification';
        const icon = '/favicon.ico';
        
        const notification = new Notification(title, {
          body: body,
          icon: icon,
          badge: icon,
          tag: alertData.alert?.type || 'nesto-alert',
          requireInteraction: false,
          ...alertData.options
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Navigate to relevant section if specified
          if (alertData.action?.url) {
            window.location.href = alertData.action.url;
          }
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
      
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      connectionId: this.connectionId,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      pendingMessages: this.pendingMessages.length
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    console.log('Disconnecting WebSocket');
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
    }
    
    this.isConnected = false;
    this.connectionId = null;
    this.ws = null;
  }

  /**
   * Subscribe to transaction updates
   */
  subscribeToTransactions() {
    this.send({
      type: 'subscribe',
      channel: 'transactions',
      userId: this.userId
    });
  }

  /**
   * Subscribe to goal updates
   */
  subscribeToGoals() {
    this.send({
      type: 'subscribe',
      channel: 'goals',
      userId: this.userId
    });
  }

  /**
   * Subscribe to budget alerts
   */
  subscribeToBudgets() {
    this.send({
      type: 'subscribe',
      channel: 'budgets',
      userId: this.userId
    });
  }
}

// Export singleton instance
export default new WebSocketService(); 