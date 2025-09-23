import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import pushNotificationService from '../services/PushNotificationService';
import realTimeNotificationService from '../services/RealTimeNotificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [realTimeStatus, setRealTimeStatus] = useState({
    isConnected: false,
    pollingEnabled: true,
    reconnectAttempts: 0
  });

  // Initialize push notification service
  useEffect(() => {
    const updatePermission = () => {
      const status = pushNotificationService.getPermissionStatus();
      console.log('Push notification status:', status);
    };

    updatePermission();
    const interval = setInterval(updatePermission, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize real-time notification service
  useEffect(() => {
    // This will be initialized when the backend service is available
    // The backend service will be passed from AuthContext
  }, []);

  // Initialize real-time service when backend is available
  const initializeRealTimeService = useCallback((backendService) => {
    if (backendService) {
      realTimeNotificationService.initialize(backendService);
      
      // Set up event listeners
      realTimeNotificationService.on('connected', () => {
        setRealTimeStatus(prev => ({ ...prev, isConnected: true }));
      });

      realTimeNotificationService.on('disconnected', () => {
        setRealTimeStatus(prev => ({ ...prev, isConnected: false }));
      });

      realTimeNotificationService.on('error', (error) => {
        console.error('Real-time notification error:', error);
      });

      realTimeNotificationService.on('newNotifications', (newNotifications) => {
        setNotifications(prev => [...newNotifications, ...prev]);
        
        // Show push notifications for new, unread notifications
        newNotifications.forEach(notification => {
          if (!notification.read && pushNotificationService.getPermissionStatus().canShow) {
            pushNotificationService.showNotification(notification);
          }
        });
      });

      realTimeNotificationService.on('notification', (notification) => {
        // Handle individual notification
        console.log('New real-time notification:', notification);
      });

      // Start the service
      realTimeNotificationService.start();
    }
  }, []);

  // Add a notification
  const addNotification = useCallback((notification) => {
    const newNotification = { ...notification, id: notification.id || Date.now() };
    
    setNotifications((prev) => [newNotification, ...prev]);

    // Show push notification for new, unread notifications
    if (!notification.read && pushNotificationService.getPermissionStatus().canShow) {
      pushNotificationService.showNotification(newNotification);
    }
  }, []);

  // Remove a notification by id
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Show toast notification
  const showToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    // This would integrate with a toast notification system
    console.log('Toast notification:', { type, title, message, duration });
  }, []);

  // Real-time service controls
  const startRealTimeService = useCallback(async () => {
    try {
      await realTimeNotificationService.start();
    } catch (error) {
      console.error('Failed to start real-time service:', error);
    }
  }, []);

  const stopRealTimeService = useCallback(() => {
    realTimeNotificationService.stop();
  }, []);

  const setPollingInterval = useCallback((intervalMs) => {
    realTimeNotificationService.setPollingInterval(intervalMs);
  }, []);

  const setPollingEnabled = useCallback((enabled) => {
    realTimeNotificationService.setPollingEnabled(enabled);
    setRealTimeStatus(prev => ({ ...prev, pollingEnabled: enabled }));
  }, []);

  const getRealTimeStatus = useCallback(() => {
    return realTimeNotificationService.getStatus();
  }, []);

  // Subscribe to specific notification types
  const subscribeToType = useCallback((type, callback) => {
    realTimeNotificationService.subscribeToType(type, callback);
  }, []);

  const subscribeToHighPriority = useCallback((callback) => {
    realTimeNotificationService.subscribeToHighPriority(callback);
  }, []);

  const subscribeToUnread = useCallback((callback) => {
    realTimeNotificationService.subscribeToUnread(callback);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realTimeNotificationService.stop();
    };
  }, []);

  const value = {
    notifications,
    realTimeStatus,
    addNotification,
    removeNotification,
    markAllAsRead,
    clearNotifications,
    showToast,
    initializeRealTimeService,
    startRealTimeService,
    stopRealTimeService,
    setPollingInterval,
    setPollingEnabled,
    getRealTimeStatus,
    subscribeToType,
    subscribeToHighPriority,
    subscribeToUnread,
    requestPushPermission: pushNotificationService.requestPermission.bind(pushNotificationService),
    getPushPermissionStatus: pushNotificationService.getPermissionStatus.bind(pushNotificationService),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 