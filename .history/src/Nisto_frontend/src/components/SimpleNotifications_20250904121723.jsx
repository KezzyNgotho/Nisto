import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiBell, FiCheck, FiX, FiAlertCircle, FiShield, 
  FiDollarSign, FiUsers, FiMessageCircle, FiSettings,
  FiCheckCircle, FiAlertTriangle, FiInfo, FiZap
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const SimpleNotifications = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock notifications data - replace with real data later
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'payment',
        title: 'Payment Received',
        message: 'You received $50.00 from Sarah Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        priority: 'high',
        icon: <FiDollarSign />,
        color: '#10B981'
      },
      {
        id: 2,
        type: 'vault',
        title: 'Vault Invitation',
        message: 'You\'ve been invited to join "Family Savings" vault',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'medium',
        icon: <FiUsers />,
        color: '#3B82F6'
      },
      {
        id: 3,
        type: 'security',
        title: 'Security Alert',
        message: 'New login detected from Chrome on Windows',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        priority: 'high',
        icon: <FiShield />,
        color: '#EF4444'
      },
      {
        id: 4,
        type: 'system',
        title: 'System Update',
        message: 'New features available! Check out the social media integration.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'low',
        icon: <FiZap />,
        color: '#8B5CF6'
      },
      {
        id: 5,
        type: 'vault',
        title: 'Vault Goal Reached',
        message: 'Congratulations! Your "Vacation Fund" vault has reached its goal.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true,
        priority: 'medium',
        icon: <FiCheckCircle />,
        color: '#10B981'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'payments') return notification.type === 'payment';
    if (activeTab === 'vaults') return notification.type === 'vault';
    if (activeTab === 'security') return notification.type === 'security';
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.text.muted;
      default: return theme.colors.text.muted;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: theme.colors.background.primary,
        borderRadius: '1rem',
        border: `1px solid ${theme.colors.border.primary}`,
        boxShadow: `0 4px 12px ${theme.colors.shadow.light}`
      }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: theme.colors.text.primary,
            margin: '0 0 0.5rem 0'
          }}>
            Notifications
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: theme.colors.text.secondary,
            margin: 0
          }}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = theme.colors.primary;
            }}
          >
            <FiCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: theme.colors.background.secondary,
        padding: '0.5rem',
        borderRadius: '0.75rem',
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'payments', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
          { id: 'vaults', label: 'Vaults', count: notifications.filter(n => n.type === 'vault').length },
          { id: 'security', label: 'Security', count: notifications.filter(n => n.type === 'security').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: activeTab === tab.id ? theme.colors.primary : 'transparent',
              color: activeTab === tab.id ? theme.colors.white : theme.colors.text.secondary,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : theme.colors.primary,
                color: activeTab === tab.id ? theme.colors.white : theme.colors.white,
                padding: '0.25rem 0.5rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                minWidth: '1.5rem',
                textAlign: 'center'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: theme.colors.text.secondary
          }}>
            <FiBell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              No notifications
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              {activeTab === 'unread' ? 'You\'re all caught up!' : 'No notifications in this category.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              style={{
                background: theme.colors.background.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                transition: 'all 0.2s',
                opacity: notification.read ? 0.7 : 1,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 24px ${theme.colors.shadow.light}`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Unread indicator */}
              {!notification.read && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '8px',
                  height: '8px',
                  background: theme.colors.primary,
                  borderRadius: '50%'
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                background: `${notification.color}20`,
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: notification.color,
                fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {notification.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    margin: 0
                  }}>
                    {notification.title}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    color: theme.colors.text.secondary,
                    whiteSpace: 'nowrap',
                    marginLeft: '1rem'
                  }}>
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </span>
                </div>
                
                <p style={{
                  fontSize: '0.875rem',
                  color: theme.colors.text.secondary,
                  lineHeight: '1.5',
                  margin: '0 0 1rem 0'
                }}>
                  {notification.message}
                </p>

                {/* Priority indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: getPriorityColor(notification.priority),
                    borderRadius: '50%'
                  }} />
                  <span style={{
                    fontSize: '0.75rem',
                    color: theme.colors.text.secondary,
                    textTransform: 'capitalize'
                  }}>
                    {notification.priority} priority
                  </span>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border.primary}`,
                        color: theme.colors.text.secondary,
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = theme.colors.background.secondary;
                        e.target.style.color = theme.colors.text.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = theme.colors.text.secondary;
                      }}
                    >
                      <FiCheck size={14} />
                      Mark Read
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(notification.id)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border.primary}`,
                      color: theme.colors.text.secondary,
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = theme.colors.error;
                      e.target.style.color = theme.colors.white;
                      e.target.style.borderColor = theme.colors.error;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = theme.colors.text.secondary;
                      e.target.style.borderColor = theme.colors.border.primary;
                    }}
                  >
                    <FiX size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleNotifications;
