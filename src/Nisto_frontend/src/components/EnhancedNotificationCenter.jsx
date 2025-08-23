import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiBell, 
  FiCheck, 
  FiX, 
  FiAlertCircle, 
  FiShield, 
  FiDollarSign,
  FiUsers,
  FiMessageCircle,
  FiSettings,
  FiSearch,
  FiFilter,
  FiArchive,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiZap,
  FiTrendingUp,
  FiMail,
  FiPhone,
  FiWifi,
  FiRefreshCw,
  FiMoreHorizontal,
  FiEye,
  FiTrash2,
  FiPieChart,
  FiCreditCard,
  FiLock,
  FiUnlock,
  FiHeart
} from 'react-icons/fi';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export default function EnhancedNotificationCenter({ isOpen = true, onClose, className = '', position = 'top-right' }) {
  const { theme } = useTheme();
  const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
    getUnreadNotificationCount
  } = useAuth();

  const {
    showToast
  } = useNotification();

  // Enhanced state management
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications on mount
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadPreferences();
      loadUnreadCount();
    }
  }, [isOpen]);

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getUserNotifications(50, 0);
      setNotifications(result || []);
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

  // Load preferences
  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await updateNotificationPreferences(newPreferences);
      setPreferences(newPreferences);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Preferences updated'
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(n => {
        switch (activeTab) {
          case 'unread':
            return !n.isRead;
          case 'read':
            return n.isRead;
          case 'archived':
            return n.isArchived;
          default:
            return true;
        }
      });
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [notifications, activeTab, searchQuery, filterPriority, sortBy]);

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction':
        return <FiDollarSign size={16} />;
      case 'security':
        return <FiShield size={16} />;
      case 'vault':
        return <FiPieChart size={16} />;
      case 'social':
        return <FiUsers size={16} />;
      case 'system':
        return <FiInfo size={16} />;
      case 'payment':
        return <FiCreditCard size={16} />;
      case 'recovery':
        return <FiLock size={16} />;
      default:
        return <FiBell size={16} />;
    }
  };

  // Get notification color
  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.primary;
      case 'low':
        return theme.colors.text.secondary;
      default:
        return theme.colors.text.secondary;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`enhanced-notification-center ${className}`}
      style={{
        position: 'fixed',
        top: position.includes('top') ? '80px' : 'auto',
        bottom: position.includes('bottom') ? '20px' : 'auto',
        right: position.includes('right') ? '20px' : 'auto',
        left: position.includes('left') ? '20px' : 'auto',
        width: '400px',
        maxHeight: '600px',
        background: theme.colors.white,
        border: `1px solid ${theme.colors.border.secondary}`,
        borderRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: `1px solid ${theme.colors.border.secondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: theme.colors.background
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBell size={20} color={theme.colors.primary} />
          <h3 style={{ 
            margin: 0, 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: theme.colors.text.primary 
          }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span style={{
              background: theme.colors.error,
              color: theme.colors.white,
              fontSize: '0.75rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.75rem',
              fontWeight: 600
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.primary,
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}
            title="Mark all as read"
          >
            <FiCheck size={16} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.25rem'
            }}
            title="Close"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        padding: '0.75rem',
        borderBottom: `1px solid ${theme.colors.border.secondary}`,
        background: theme.colors.background
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch 
              size={16} 
              style={{
                position: 'absolute',
                left: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.colors.text.secondary
              }}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2rem',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                background: theme.colors.white
              }}
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '0.5rem',
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              background: theme.colors.white
            }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.colors.border.secondary}`,
        background: theme.colors.background
      }}>
        {['all', 'unread', 'read', 'archived'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: activeTab === tab ? theme.colors.primary : 'transparent',
              color: activeTab === tab ? theme.colors.white : theme.colors.text.secondary,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 600 : 500,
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.text.secondary
          }}>
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.text.secondary
          }}>
            <FiBell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              style={{
                padding: '1rem',
                borderBottom: `1px solid ${theme.colors.border.secondary}`,
                background: notification.isRead ? theme.colors.white : `${theme.colors.primary}05`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = notification.isRead ? theme.colors.background : `${theme.colors.primary}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = notification.isRead ? theme.colors.white : `${theme.colors.primary}05`;
              }}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `${getNotificationColor(notification.priority)}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getNotificationColor(notification.priority),
                  flexShrink: 0
                }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      flex: 1
                    }}>
                      {notification.title}
                    </h4>
                    <span style={{
                      fontSize: '0.75rem',
                      color: theme.colors.text.secondary
                    }}>
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: theme.colors.text.secondary,
                    lineHeight: 1.4,
                    marginBottom: '0.5rem'
                  }}>
                    {notification.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      background: `${getNotificationColor(notification.priority)}15`,
                      color: getNotificationColor(notification.priority),
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.text.secondary,
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    opacity: 0,
                    transition: 'opacity 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = 1;
                    e.target.style.color = theme.colors.error;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = 0;
                    e.target.style.color = theme.colors.text.secondary;
                  }}
                  title="Delete notification"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.75rem',
        borderTop: `1px solid ${theme.colors.border.secondary}`,
        background: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: theme.colors.text.secondary
        }}>
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.primary,
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <FiSettings size={14} />
          Settings
        </button>
      </div>
    </div>
  );
}
