import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiBell, FiCheck, FiX, FiAlertCircle, FiShield, FiDollarSign, FiUsers, FiSettings, FiRefreshCw } from 'react-icons/fi';

export default function NotificationTestPanel() {
  const { 
    notifications, 
    realTimeStatus,
    addNotification, 
    showToast,
    startRealTimeService,
    stopRealTimeService,
    setPollingInterval,
    setPollingEnabled,
    getRealTimeStatus,
    subscribeToType,
    subscribeToHighPriority,
    subscribeToUnread
  } = useNotification();

  const { 
    getUserNotifications, 
    createNotification, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount 
  } = useAuth();

  const { theme } = useTheme();

  // Theme-based colors
  const colors = {
    primary: theme === 'dark' ? '#10B981' : '#075B5E',
    secondary: theme === 'dark' ? '#6B7280' : '#6B7280',
    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    surface: theme === 'dark' ? '#374151' : '#F9FAFB',
    border: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    text: {
      primary: theme === 'dark' ? '#F9FAFB' : '#1F2937',
      secondary: theme === 'dark' ? '#D1D5DB' : '#6B7280',
      muted: theme === 'dark' ? '#9CA3AF' : '#9CA3AF'
    },
    status: {
      success: theme === 'dark' ? '#10B981' : '#10B981',
      warning: theme === 'dark' ? '#F59E0B' : '#F59E0B',
      error: theme === 'dark' ? '#EF4444' : '#EF4444',
      info: theme === 'dark' ? '#3B82F6' : '#3B82F6'
    },
    priority: {
      high: theme === 'dark' ? '#EF4444' : '#EF4444',
      medium: theme === 'dark' ? '#F59E0B' : '#F59E0B',
      low: theme === 'dark' ? '#3B82F6' : '#3B82F6'
    }
  };

  const [backendNotifications, setBackendNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({});

  // Load backend notifications
  const loadBackendNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getUserNotifications(20, 0);
      if (result && Array.isArray(result)) {
        setBackendNotifications(result);
      }
    } catch (error) {
      console.error('Failed to load backend notifications:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load backend notifications'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // Test backend notification creation
  const testCreateNotification = async () => {
    try {
      const testNotification = {
        title: 'Test Backend Notification',
        message: 'This notification was created via backend API',
        type: 'test',
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      const result = await createNotification(testNotification);
      setTestResults(prev => ({
        ...prev,
        createNotification: result ? 'Success' : 'Failed'
      }));

      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Test notification created via backend'
        });
        loadBackendNotifications();
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Failed to create test notification:', error);
      setTestResults(prev => ({
        ...prev,
        createNotification: 'Error: ' + error.message
      }));
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create test notification'
      });
    }
  };

  // Test mark as read
  const testMarkAsRead = async (notificationId) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      setTestResults(prev => ({
        ...prev,
        markAsRead: result ? 'Success' : 'Failed'
      }));

      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Notification marked as read'
        });
        loadBackendNotifications();
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setTestResults(prev => ({
        ...prev,
        markAsRead: 'Error: ' + error.message
      }));
    }
  };

  // Test mark all as read
  const testMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      setTestResults(prev => ({
        ...prev,
        markAllAsRead: result ? 'Success' : 'Failed'
      }));

      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'All notifications marked as read'
        });
        loadBackendNotifications();
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setTestResults(prev => ({
        ...prev,
        markAllAsRead: 'Error: ' + error.message
      }));
    }
  };

  // Test delete notification
  const testDeleteNotification = async (notificationId) => {
    try {
      const result = await deleteNotification(notificationId);
      setTestResults(prev => ({
        ...prev,
        deleteNotification: result ? 'Success' : 'Failed'
      }));

      if (result) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Notification deleted'
        });
        loadBackendNotifications();
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setTestResults(prev => ({
        ...prev,
        deleteNotification: 'Error: ' + error.message
      }));
    }
  };

  // Test real-time service
  const testRealTimeService = async () => {
    try {
      await startRealTimeService();
      setTestResults(prev => ({
        ...prev,
        realTimeService: 'Started'
      }));
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Real-time service started'
      });
    } catch (error) {
      console.error('Failed to start real-time service:', error);
      setTestResults(prev => ({
        ...prev,
        realTimeService: 'Error: ' + error.message
      }));
    }
  };

  // Set up subscriptions
  useEffect(() => {
    // Subscribe to security notifications
    subscribeToType('security', (notification) => {
      console.log('Security notification received:', notification);
      showToast({
        type: 'warning',
        title: 'Security Alert',
        message: notification.message
      });
    });

    // Subscribe to high priority notifications
    subscribeToHighPriority((notification) => {
      console.log('High priority notification received:', notification);
      showToast({
        type: 'error',
        title: 'High Priority',
        message: notification.message
      });
    });

    // Subscribe to unread notifications
    subscribeToUnread((notification) => {
      console.log('Unread notification received:', notification);
    });
  }, [subscribeToType, subscribeToHighPriority, subscribeToUnread, showToast]);

  // Load data on mount
  useEffect(() => {
    loadBackendNotifications();
    loadUnreadCount();
  }, []);

  return (
    <div style={{
      padding: '2rem',
      background: colors.background,
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      margin: '2rem 0'
    }}>
      <h2 style={{ 
        color: colors.text.primary, 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <FiBell size={24} />
        Notification System Test Panel
      </h2>

      {/* Status Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem',
          background: theme === 'dark' ? '#1E3A8A' : '#F0F9FF',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#3B82F6' : '#BFDBFE'}`
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: colors.status.info }}>Local Notifications</h4>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: colors.status.info }}>
            {notifications.length}
          </p>
        </div>

        <div style={{
          padding: '1rem',
          background: theme === 'dark' ? '#451A03' : '#FEF3C7',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#F59E0B' : '#FCD34D'}`
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: colors.status.warning }}>Backend Notifications</h4>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: colors.status.warning }}>
            {backendNotifications.length}
          </p>
        </div>

        <div style={{
          padding: '1rem',
          background: theme === 'dark' ? '#7F1D1D' : '#FEE2E2',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#EF4444' : '#FCA5A5'}`
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: colors.status.error }}>Unread Count</h4>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: colors.status.error }}>
            {unreadCount}
          </p>
        </div>

        <div style={{
          padding: '1rem',
          background: realTimeStatus.isConnected ? 
            (theme === 'dark' ? '#14532D' : '#D1FAE5') : 
            (theme === 'dark' ? '#7F1D1D' : '#FEE2E2'),
          borderRadius: '8px',
          border: `1px solid ${realTimeStatus.isConnected ? 
            (theme === 'dark' ? '#10B981' : '#A7F3D0') : 
            (theme === 'dark' ? '#EF4444' : '#FCA5A5')}`
        }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: realTimeStatus.isConnected ? colors.status.success : colors.status.error
          }}>
            Real-time Status
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            color: realTimeStatus.isConnected ? colors.status.success : colors.status.error
          }}>
            {realTimeStatus.isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={loadBackendNotifications}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1rem',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <FiRefreshCw size={16} style={{ marginRight: '0.5rem' }} />
          {isLoading ? 'Loading...' : 'Refresh Backend Data'}
        </button>

        <button
          onClick={testCreateNotification}
          style={{
            padding: '0.75rem 1rem',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <FiBell size={16} style={{ marginRight: '0.5rem' }} />
          Create Test Notification
        </button>

        <button
          onClick={testMarkAllAsRead}
          style={{
            padding: '0.75rem 1rem',
            background: colors.status.info,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <FiCheck size={16} style={{ marginRight: '0.5rem' }} />
          Mark All as Read
        </button>

        <button
          onClick={testRealTimeService}
          style={{
            padding: '0.75rem 1rem',
            background: realTimeStatus.isConnected ? colors.status.error : colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {realTimeStatus.isConnected ? (
            <>
              <FiX size={16} style={{ marginRight: '0.5rem' }} />
              Stop Real-time Service
            </>
          ) : (
            <>
              <FiSettings size={16} style={{ marginRight: '0.5rem' }} />
              Start Real-time Service
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div style={{
          padding: '1rem',
          background: colors.surface,
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          marginBottom: '2rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: colors.text.primary }}>Test Results</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} style={{
                  padding: '0.5rem',
                  background: result.includes('Success') ? 
                    (theme === 'dark' ? '#14532D' : '#D1FAE5') : 
                    result.includes('Error') ? 
                    (theme === 'dark' ? '#7F1D1D' : '#FEE2E2') : 
                    (theme === 'dark' ? '#451A03' : '#FEF3C7'),
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  color: result.includes('Success') ? colors.status.success : 
                         result.includes('Error') ? colors.status.error : colors.status.warning
                }}>
                  <strong>{test}:</strong> {result}
                </div>
              ))}
            </div>
        </div>
      )}

      {/* Backend Notifications List */}
      <div style={{
        background: colors.surface,
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        padding: '1rem'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: colors.text.primary }}>Backend Notifications</h4>
        {backendNotifications.length === 0 ? (
          <p style={{ color: colors.text.secondary, textAlign: 'center', padding: '2rem' }}>
            No backend notifications found
          </p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {backendNotifications.map((notification) => (
              <div key={notification.id} style={{
                padding: '1rem',
                margin: '0.5rem 0',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h5 style={{ margin: '0 0 0.25rem 0', color: colors.text.primary }}>
                    {notification.title || 'Untitled'}
                  </h5>
                  <p style={{ margin: '0 0 0.25rem 0', color: colors.text.secondary, fontSize: '0.875rem' }}>
                    {notification.message}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      background: '#F3F4F6',
                      borderRadius: '4px',
                      color: colors.text.primary
                    }}>
                      {notification.type || 'unknown'}
                    </span>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      background: notification.read ? '#D1FAE5' : '#FEE2E2',
                      borderRadius: '4px',
                      color: notification.read ? '#065F46' : '#DC2626'
                    }}>
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!notification.read && (
                    <button
                      onClick={() => testMarkAsRead(notification.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: colors.status.info,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => testDeleteNotification(notification.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: colors.status.error,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
