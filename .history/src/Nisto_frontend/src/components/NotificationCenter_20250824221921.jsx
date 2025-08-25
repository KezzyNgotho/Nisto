import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import VaultInvitation from './VaultInvitation';
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
  FiTrash2
} from 'react-icons/fi';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export default function NotificationCenter({ isOpen = true, onClose, className = '', position = 'top-right' }) {
  const { theme } = useTheme();
  const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount
  } = useAuth();

  const {
    notifications: localNotifications,
    addNotification,
    removeNotification,
    markAllAsRead,
    clearNotifications,
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
  const [pushPermission, setPushPermission] = useState('default');
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  // Load notifications and permissions on mount
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }

    if ('Notification' in window) {
      setPushPermission(Notification.permission);

      if (Notification.permission === 'default') {
        const requestPermission = async () => {
          try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
          } catch (error) {
            console.error('Error requesting notification permission:', error);
          }
        };
        requestPermission();
      }
    }
  }, [isOpen]);

  // Load notifications from backend
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getUserNotifications(50, 0);
      if (result && Array.isArray(result)) {
        setNotifications(result);
        console.log('Loaded notifications:', result);
        
        // Debug: Check for vault invitations
        const vaultInvitations = result.filter(n => 
          n.title?.includes('invited to join vault') || 
          n.title === 'Vault Invitation'
        );
        console.log('Found vault invitations:', vaultInvitations);
      } else {
        // Fallback to local notifications if backend fails
        setNotifications(localNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications from backend:', error);
      // Fallback to local notifications
      setNotifications(localNotifications);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load notifications from server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread count from backend
  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      if (typeof count === 'number') {
        setUnreadCount(count);
      } else {
        // Fallback to local count
        setUnreadCount(localNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load unread count from backend:', error);
      // Fallback to local count
      setUnreadCount(localNotifications.filter(n => !n.read).length);
    }
  };

  // Handle mark as read with backend integration
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      // Update unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark notification as read'
      });
    }
  };

  // Handle mark all as read with backend integration
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Update unread count
      setUnreadCount(0);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark all notifications as read'
      });
    }
  };

  // Handle delete notification with backend integration
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count
      loadUnreadCount();
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete notification'
      });
    }
  };

  // Handle vault invitation response
  const handleVaultInvitationResponse = (notificationId, response) => {
    // Remove the invitation notification from the list
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Show success message
    showToast({
      type: 'success',
      title: 'Success',
      message: `Vault invitation ${response}d successfully`
    });
    
    // Reload unread count
    loadUnreadCount();
  };

  // Handle clear all notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    showToast({
      type: 'success',
      title: 'Success',
      message: 'All notifications cleared'
    });
  };

  // Show push notification
  const showPushNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = notification.title || 'Nesto Notification';
      const body = notification.message || 'You have a new notification';
      const icon = '/favicon.ico';
      
      const pushNotification = new Notification(title, {
        body: body,
        icon: icon,
        badge: icon,
        tag: notification.type || 'nesto-notification',
        requireInteraction: notification.priority === 'high',
        data: notification
      });
      
      pushNotification.onclick = () => {
        window.focus();
        pushNotification.close();
        
        if (notification.action?.url) {
          window.location.href = notification.action.url;
        }
      };
      
      if (notification.priority !== 'high') {
        setTimeout(() => {
          pushNotification.close();
        }, 5000);
      }
    }
  };

  // Notification categories with enhanced icons and colors
  const categories = {
    all: { icon: FiBell, label: 'All', color: colors.secondary },
    unread: { icon: FiAlertCircle, label: 'Unread', color: colors.status.error },
    security: { icon: FiShield, label: 'Security', color: colors.status.warning },
    financial: { icon: FiDollarSign, label: 'Financial', color: colors.status.success },
    social: { icon: FiUsers, label: 'Social', color: colors.status.info },
    system: { icon: FiSettings, label: 'System', color: colors.secondary },
    vault: { icon: FiMessageCircle, label: 'Vault', color: colors.status.info }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = notifications.filter(n => {
      // Tab filtering
      if (activeTab === 'unread' && n.read) return false;
      if (activeTab === 'security' && !['warning', 'security', 'alert'].includes(n.type)) return false;
      if (activeTab === 'financial' && !['payment', 'transaction', 'wallet'].includes(n.type)) return false;
      if (activeTab === 'social' && !['message', 'invite', 'social'].includes(n.type)) return false;
      if (activeTab === 'system' && !['system', 'update', 'maintenance'].includes(n.type)) return false;
      if (activeTab === 'vault' && !['vault', 'chat', 'collaboration'].includes(n.type)) return false;
      if (!showArchived && n.archived) return false;

      // Search filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (n.title || '').toLowerCase().includes(query) ||
          (n.message || '').toLowerCase().includes(query) ||
          (n.type || '').toLowerCase().includes(query)
        );
      }

      // Priority filtering
      if (filterPriority !== 'all' && n.priority !== filterPriority) return false;

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp || b.time || 0) - new Date(a.timestamp || a.time || 0);
        case 'oldest':
          return new Date(a.timestamp || a.time || 0) - new Date(b.timestamp || b.time || 0);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        default:
          return 0;
      }
    });

    return filtered;
  }, [notifications, activeTab, searchQuery, sortBy, filterPriority, showArchived]);

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    const iconMap = {
      security: FiShield,
      warning: FiAlertTriangle,
      error: FiAlertCircle,
      success: FiCheckCircle,
      info: FiInfo,
      message: FiMessageCircle,
      payment: FiDollarSign,
      transaction: FiDollarSign,
      wallet: FiDollarSign,
      system: FiSettings,
      update: FiRefreshCw,
      vault: FiUsers,
      social: FiUsers,
      invite: FiMail,
      achievement: FiStar,
      promotion: FiTrendingUp,
      maintenance: FiSettings
    };

    const IconComponent = iconMap[notification.type] || FiBell;
    return <IconComponent size={16} />;
  };

  // Get notification color based on type and priority
  const getNotificationColor = (notification) => {
    if (notification.priority === 'high') return colors.priority.high;
    if (notification.type === 'security' || notification.type === 'warning') return colors.status.warning;
    if (notification.type === 'success') return colors.status.success;
    if (notification.type === 'error') return colors.status.error;
    if (notification.type === 'payment' || notification.type === 'transaction') return colors.status.success;
    return colors.secondary;
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (now - date < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM dd');
    }
  };

  // Handle notification actions
  const handleArchiveNotification = (notificationId) => {
    // Implementation would archive specific notification
    console.log('Archive:', notificationId);
  };

  const handleBulkAction = (action) => {
    if (selectedNotifications.size === 0) return;

    switch (action) {
      case 'markRead':
        selectedNotifications.forEach(id => handleMarkAsRead(id));
        break;
      case 'archive':
        selectedNotifications.forEach(id => handleArchiveNotification(id));
        break;
      case 'delete':
        selectedNotifications.forEach(id => handleDeleteNotification(id));
        break;
    }
    setSelectedNotifications(new Set());
  };

  const toggleNotificationSelection = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };



  // Position styles based on position prop
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      width: '420px',
      maxHeight: '600px',
      background: colors.background,
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
      border: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideDownFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'center':
        return { 
          ...baseStyles, 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          maxHeight: '80vh'
        };
      default:
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for all positions */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: position === 'center' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: position === 'center' ? 'blur(4px)' : 'none',
          zIndex: 9998
        }}
        onClick={onClose}
      />
      
      <div 
        className={`notification-center-floating ${className}`} 
        style={getPositionStyles()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div style={{
          padding: '1.5rem 1.25rem 1rem',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${theme === 'dark' ? '#1F2937' : '#1C352D'} 100%)`,
          color: 'white'
        }}>
                      <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiBell size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    Notifications
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                    {notifications.filter(n => !n.read).length} unread
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* Push Notification Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: pushPermission === 'granted' ? colors.status.success : 
                               pushPermission === 'denied' ? colors.status.error : colors.status.warning
                  }} />
                  {pushPermission === 'granted' ? 'Push ON' : 
                   pushPermission === 'denied' ? 'Push OFF' : 'Push Pending'}
                </div>
                
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClose) onClose();
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                  title="Close notifications"
                >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <FiSearch size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.6)'
            }} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}>
            {Object.entries(categories).map(([key, category]) => {
              const IconComponent = category.icon;
              const isActive = activeTab === key;
              const unreadCount = key === 'all' ? notifications.filter(n => !n.read).length :
                                 key === 'unread' ? notifications.filter(n => !n.read).length :
                                 notifications.filter(n => !n.read && n.type === key).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => !isActive && (e.target.style.background = 'rgba(255,255,255,0.15)')}
                  onMouseLeave={(e) => !isActive && (e.target.style.background = 'rgba(255,255,255,0.1)')}
                >
                  <IconComponent size={14} />
                  {category.label}
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: colors.status.error,
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.625rem',
                      fontWeight: 600
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}>
          {filteredAndSortedNotifications.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1rem',
              color: colors.secondary,
              textAlign: 'center'
            }}>
              <FiBell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                No notifications
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                {searchQuery ? 'No notifications match your search' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredAndSortedNotifications.map((notification) => {
              const isSelected = selectedNotifications.has(notification.id);
              const notificationColor = getNotificationColor(notification);
              
              // Check if this is a vault invitation notification
              const isVaultInvitation = notification.title === 'Vault Invitation' || 
                                       notification.title?.includes('invited to join vault') ||
                                       notification.message?.includes('invited to join vault') ||
                                       (notification.notificationType && 
                                        typeof notification.notificationType === 'object' && 
                                        notification.notificationType.Vault) ||
                                       (notification.metadata && 
                                        JSON.parse(notification.metadata)?.vaultId);
              
              // Debug: Log notification data for vault invitations
              if (notification.title?.includes('invited to join vault') || notification.title === 'Vault Invitation') {
                console.log('Vault invitation notification found:', notification);
                console.log('Is vault invitation:', isVaultInvitation);
              }
              
              // If it's a vault invitation, render the VaultInvitation component
              if (isVaultInvitation) {
                console.log('Rendering VaultInvitation component for:', notification.id);
                return (
                  <VaultInvitation
                    key={notification.id}
                    notification={notification}
                    onResponse={handleVaultInvitationResponse}
                  />
                );
              }
              
              return (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem',
                    margin: '0.25rem',
                    background: notification.read ? colors.background : '#F0F9FF',
                    border: `1px solid ${notification.read ? colors.border : '#BFDBFE'}`,
                    borderLeft: `4px solid ${notificationColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => toggleNotificationSelection(notification.id)}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleNotificationSelection(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: '0.125rem',
                        accentColor: '#075B5E'
                      }}
                    />
                    
                    {/* Notification Icon */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: `${notificationColor}15`,
                      color: notificationColor,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(notification)}
                    </div>
                    
                    {/* Notification Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem'
                      }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          fontWeight: notification.read ? 500 : 700,
                          color: colors.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notification.title || 'Notification'}
                        </h4>
                        <span style={{
                          fontSize: '0.75rem',
                          color: colors.text.secondary,
                          flexShrink: 0,
                          marginLeft: '0.5rem'
                        }}>
                          {formatNotificationTime(notification.timestamp || notification.time)}
                        </span>
                      </div>
                      
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        color: colors.text.muted,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {notification.message}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            background: `${notificationColor}15`,
                            color: notificationColor,
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {notification.type || 'info'}
                          </span>
                          {notification.priority && (
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              background: notification.priority === 'high' ? '#FEE2E2' : 
                                         notification.priority === 'medium' ? '#FEF3C7' : '#F0F9FF',
                              color: notification.priority === 'high' ? colors.status.error : 
                                     notification.priority === 'medium' ? colors.status.warning : colors.status.info,
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}>
                              {notification.priority}
                            </span>
                          )}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.secondary,
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px'
                            }}
                            title="Mark as read"
                          >
                            <FiCheck size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveNotification(notification.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.secondary,
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px'
                            }}
                            title="Archive"
                          >
                            <FiArchive size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.status.error,
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px'
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '8px',
                      height: '8px',
                      background: notificationColor,
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem',
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#075B5E',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#064B4E'}
              onMouseLeave={(e) => e.target.style.background = '#075B5E'}
            >
              Mark All Read
            </button>
            <button
              onClick={handleClearAllNotifications}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'none',
                color: colors.secondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              Clear All
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: colors.secondary
          }}>
            <span>{filteredAndSortedNotifications.length} notifications</span>
            {selectedNotifications.size > 0 && (
              <span>• {selectedNotifications.size} selected</span>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
} 