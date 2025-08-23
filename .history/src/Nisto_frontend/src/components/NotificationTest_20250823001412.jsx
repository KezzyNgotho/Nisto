import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiBell, FiPlus, FiCheck, FiX } from 'react-icons/fi';

export default function NotificationTest() {
  const { theme } = useTheme();
  const { createNotification, getUserNotifications, getUnreadNotificationCount } = useAuth();
  const { showToast } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Test notification types
  const testNotifications = [
    {
      type: { Transaction: { amount: 100.0, currency: "USD", status: "completed" } },
      title: "Payment Successful",
      message: "Your payment of $100 has been processed successfully.",
      priority: "medium"
    },
    {
      type: { Security: { event: "login", severity: "info", action: null } },
      title: "New Login Detected",
      message: "A new device has logged into your account.",
      priority: "high"
    },
    {
      type: { Vault: { vaultId: "vault-123", action: "deposit", amount: 50.0 } },
      title: "Vault Deposit",
      message: "You've received a deposit of $50 in your vault.",
      priority: "medium"
    },
    {
      type: { System: { message: "System maintenance", priority: "low" } },
      title: "System Update",
      message: "Scheduled maintenance will begin in 30 minutes.",
      priority: "low"
    }
  ];

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getUserNotifications(10, 0);
      if (result && Array.isArray(result)) {
        setNotifications(result);
      }
      
      const count = await getUnreadNotificationCount();
      setUnreadCount(count || 0);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: `Loaded ${result?.length || 0} notifications`
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load notifications'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestNotification = async (notificationData) => {
    try {
      const result = await createNotification({
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        metadata: null,
        actionUrl: null,
        expiresAt: null
      });
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Test notification created'
      });
      
      // Reload notifications
      await loadNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create notification'
      });
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: theme.colors.white,
      borderRadius: '0.5rem',
      border: `1px solid ${theme.colors.border.secondary}`,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <FiBell size={24} color={theme.colors.primary} />
        <h2 style={{
          margin: 0,
          color: theme.colors.text.primary,
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          Notification System Test
        </h2>
        {unreadCount > 0 && (
          <span style={{
            background: theme.colors.error,
            color: theme.colors.white,
            padding: '0.25rem 0.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={loadNotifications}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: '0.375rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Load Notifications'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          color: theme.colors.text.primary,
          fontSize: '1.125rem',
          fontWeight: 600
        }}>
          Create Test Notifications
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {testNotifications.map((notification, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '0.375rem',
                background: theme.colors.background
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{
                  margin: 0,
                  color: theme.colors.text.primary,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  {notification.title}
                </h4>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  background: notification.priority === 'high' ? `${theme.colors.error}15` :
                             notification.priority === 'medium' ? `${theme.colors.warning}15` :
                             `${theme.colors.text.secondary}15`,
                  color: notification.priority === 'high' ? theme.colors.error :
                         notification.priority === 'medium' ? theme.colors.warning :
                         theme.colors.text.secondary,
                  fontWeight: 500
                }}>
                  {notification.priority}
                </span>
              </div>
              <p style={{
                margin: '0 0 1rem 0',
                color: theme.colors.text.secondary,
                fontSize: '0.8rem',
                lineHeight: 1.4
              }}>
                {notification.message}
              </p>
              <button
                onClick={() => createTestNotification(notification)}
                style={{
                  padding: '0.5rem 1rem',
                  background: theme.colors.primary,
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <FiPlus size={12} />
                Create
              </button>
            </div>
          ))}
        </div>
      </div>

      {notifications.length > 0 && (
        <div>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: theme.colors.text.primary,
            fontSize: '1.125rem',
            fontWeight: 600
          }}>
            Recent Notifications ({notifications.length})
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {notifications.slice(0, 5).map((notification, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: '0.375rem',
                  background: notification.isRead ? theme.colors.white : `${theme.colors.primary}05`
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    margin: 0,
                    color: theme.colors.text.primary,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {notification.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      background: notification.priority === 'high' ? `${theme.colors.error}15` :
                                 notification.priority === 'medium' ? `${theme.colors.warning}15` :
                                 `${theme.colors.text.secondary}15`,
                      color: notification.priority === 'high' ? theme.colors.error :
                             notification.priority === 'medium' ? theme.colors.warning :
                             theme.colors.text.secondary,
                      fontWeight: 500
                    }}>
                      {notification.priority}
                    </span>
                    {!notification.isRead && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: theme.colors.primary
                      }} />
                    )}
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  color: theme.colors.text.secondary,
                  fontSize: '0.8rem',
                  lineHeight: 1.4
                }}>
                  {notification.message}
                </p>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: theme.colors.text.muted
                }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
