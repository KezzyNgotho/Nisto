import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
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
  const {
    notifications,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    addNotification
  } = useNotification();

  // Enhanced state management
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');

  // Request push notification permission on mount
  useEffect(() => {
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
  }, []);

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
    all: { icon: FiBell, label: 'All', color: '#6B7280' },
    unread: { icon: FiAlertCircle, label: 'Unread', color: '#EF4444' },
    security: { icon: FiShield, label: 'Security', color: '#F59E0B' },
    financial: { icon: FiDollarSign, label: 'Financial', color: '#10B981' },
    social: { icon: FiUsers, label: 'Social', color: '#8B5CF6' },
    system: { icon: FiSettings, label: 'System', color: '#6B7280' },
    vault: { icon: FiMessageCircle, label: 'Vault', color: '#3B82F6' }
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
    if (notification.priority === 'high') return '#EF4444';
    if (notification.type === 'security' || notification.type === 'warning') return '#F59E0B';
    if (notification.type === 'success') return '#10B981';
    if (notification.type === 'error') return '#EF4444';
    if (notification.type === 'payment' || notification.type === 'transaction') return '#10B981';
    return '#6B7280';
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
  const handleMarkAsRead = (notificationId) => {
    // Implementation would update specific notification
    console.log('Mark as read:', notificationId);
  };

  const handleArchiveNotification = (notificationId) => {
    // Implementation would archive specific notification
    console.log('Archive:', notificationId);
  };

  const handleDeleteNotification = (notificationId) => {
    removeNotification(notificationId);
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
        selectedNotifications.forEach(id => removeNotification(id));
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

  // Demo notifications for testing
  const addDemoNotifications = () => {
    const demos = [
      {
        id: Date.now() + 1,
        title: 'Security Alert',
        message: 'New login detected from unknown device',
        type: 'security',
        priority: 'high',
        timestamp: new Date(),
        read: false
      },
      {
        id: Date.now() + 2,
        title: 'Payment Received',
        message: 'You received 150 NST from vault contribution',
        type: 'payment',
        priority: 'medium',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: Date.now() + 3,
        title: 'Vault Invitation',
        message: 'You have been invited to join "Investment Club" vault',
        type: 'vault',
        priority: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      }
    ];

    demos.forEach(demo => {
      addNotification(demo);
      // Show push notification for new notifications
      if (!demo.read) {
        showPushNotification(demo);
      }
    });
  };

  // Position styles based on position prop
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      width: '420px',
      maxHeight: '600px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
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
          background: 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
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
                    background: pushPermission === 'granted' ? '#10B981' : 
                               pushPermission === 'denied' ? '#EF4444' : '#F59E0B'
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
                      background: '#EF4444',
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
              color: '#6B7280',
              textAlign: 'center'
            }}>
              <FiBell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                No notifications
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                {searchQuery ? 'No notifications match your search' : 'You\'re all caught up!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={addDemoNotifications}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
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
                  Add Demo Notifications
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedNotifications.map((notification) => {
              const isSelected = selectedNotifications.has(notification.id);
              const notificationColor = getNotificationColor(notification);
              
              return (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem',
                    margin: '0.25rem',
                    background: notification.read ? 'white' : '#F0F9FF',
                    border: `1px solid ${notification.read ? '#E5E7EB' : '#BFDBFE'}`,
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
                          color: '#1F2937',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notification.title || 'Notification'}
                        </h4>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          flexShrink: 0,
                          marginLeft: '0.5rem'
                        }}>
                          {formatNotificationTime(notification.timestamp || notification.time)}
                        </span>
                      </div>
                      
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        color: '#4B5563',
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
                              color: notification.priority === 'high' ? '#DC2626' : 
                                     notification.priority === 'medium' ? '#D97706' : '#075985',
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
                              color: '#6B7280',
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
                              color: '#6B7280',
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
                              color: '#EF4444',
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
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <button
              onClick={markAllAsRead}
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
              onClick={clearNotifications}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'none',
                color: '#6B7280',
                border: '1px solid #D1D5DB',
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
            color: '#6B7280'
          }}>
            <span>{filteredAndSortedNotifications.length} notifications</span>
            {selectedNotifications.size > 0 && (
              <span>• {selectedNotifications.size} selected</span>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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