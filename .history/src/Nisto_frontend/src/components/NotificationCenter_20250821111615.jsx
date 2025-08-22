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

export default function NotificationCenter({ isOpen = true, onClose, className = '' }) {
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
  }, [notifications, activeTab, searchQuery, filterPriority, sortBy, showArchived]);

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

    demos.forEach(demo => addNotification(demo));
  };

  if (!isOpen) return null;

  return (
    <div className={`notification-center-enhanced ${className}`} style={{
      width: '420px',
      height: '600px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      border: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
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
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer'
              }}
              title="Settings"
            >
              <FiSettings size={16} />
            </button>
            <button
              onClick={addDemoNotifications}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer'
              }}
              title="Add demo notifications"
            >
              <FiZap size={16} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
                title="Close"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <FiSearch 
            size={16} 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.6)'
            }}
          />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              outline: 'none',
              '::placeholder': { color: 'rgba(255,255,255,0.6)' }
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '0 1rem',
        borderBottom: '1px solid #E5E7EB',
        background: '#F9FAFB'
      }}>
        {Object.entries(categories).map(([key, category]) => {
          const isActive = activeTab === key;
          const IconComponent = category.icon;
          const count = key === 'all' ? notifications.length : 
                       key === 'unread' ? notifications.filter(n => !n.read).length :
                       notifications.filter(n => 
                         key === 'security' ? ['warning', 'security', 'alert'].includes(n.type) :
                         key === 'financial' ? ['payment', 'transaction', 'wallet'].includes(n.type) :
                         key === 'social' ? ['message', 'invite', 'social'].includes(n.type) :
                         key === 'system' ? ['system', 'update', 'maintenance'].includes(n.type) :
                         key === 'vault' ? ['vault', 'chat', 'collaboration'].includes(n.type) :
                         false
                       ).length;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                color: isActive ? category.color : '#6B7280',
                borderBottom: isActive ? `2px solid ${category.color}` : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <IconComponent size={14} />
              {category.label}
              {count > 0 && (
                <span style={{
                  background: isActive ? category.color : '#E5E7EB',
                  color: isActive ? 'white' : '#6B7280',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Controls */}
      {showSettings && (
        <div style={{
          padding: '1rem',
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show Archived
          </label>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#EFF6FF',
          borderBottom: '1px solid #DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#1E40AF' }}>
            {selectedNotifications.size} selected
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleBulkAction('markRead')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3B82F6',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <FiCheck size={14} style={{ marginRight: '0.25rem' }} />
              Mark Read
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <FiArchive size={14} style={{ marginRight: '0.25rem' }} />
              Archive
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <FiTrash2 size={14} style={{ marginRight: '0.25rem' }} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem'
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: '#6B7280'
          }}>
            <FiRefreshCw className="animate-spin" style={{ marginRight: '0.5rem' }} />
            Loading notifications...
          </div>
        ) : filteredAndSortedNotifications.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            color: '#6B7280',
            textAlign: 'center'
          }}>
            <FiAlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
              No notifications
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
              {searchQuery ? 'Try adjusting your search or filters' : 'You\'re all caught up!'}
            </p>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: notificationColor,
                          background: `${notificationColor}15`,
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          fontWeight: 500
                        }}>
                          {notification.type}
                        </span>
                        {notification.priority && notification.priority !== 'medium' && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: notification.priority === 'high' ? '#EF4444' : '#6B7280',
                            fontWeight: 500
                          }}>
                            {notification.priority} priority
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {!notification.read && (
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
                            <FiEye size={12} />
                          </button>
                        )}
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
        <button
          onClick={markAllAsRead}
          disabled={notifications.filter(n => !n.read).length === 0}
          style={{
            background: 'none',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FiCheck size={14} />
          Mark All Read
        </button>
        
        <button
          onClick={clearNotifications}
          disabled={notifications.length === 0}
          style={{
            background: 'none',
            border: '1px solid #EF4444',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FiTrash2 size={14} />
          Clear All
        </button>
      </div>

      {/* Animation Styles */}
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 