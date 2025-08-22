import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import pushNotificationService from '../services/PushNotificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [pushPermission, setPushPermission] = useState('default');
  let toastId = 0;

  // Initialize push notification service
  useEffect(() => {
    const updatePermission = () => {
      const status = pushNotificationService.getPermissionStatus();
      setPushPermission(status.permission);
    };

    updatePermission();
    
    // Listen for permission changes
    if ('Notification' in window) {
      // Note: There's no direct event for permission changes, but we can check periodically
      const interval = setInterval(updatePermission, 5000);
      return () => clearInterval(interval);
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

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Show a toast
  const showToast = useCallback((toast) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    notifications,
    toasts,
    addNotification,
    removeNotification,
    markAllAsRead,
    clearNotifications,
    showToast,
    removeToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
} 