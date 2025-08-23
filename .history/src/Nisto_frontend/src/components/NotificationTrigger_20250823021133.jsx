import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationCenter from './NotificationCenter';
import { FiBell, FiSettings, FiX } from 'react-icons/fi';

export default function NotificationTrigger() {
  const { addNotification, showToast } = useNotification();
  const { getUnreadNotificationCount } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('top-right');
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
    }
  };

  // Load unread count on mount and when component updates
  useEffect(() => {
    loadUnreadCount();
    
    // Set up interval to refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to load unread notification count:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-trigger-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const positions = [
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'center', label: 'Center' }
  ];

  const addTestNotification = (type, priority = 'medium') => {
    const notification = {
      id: Date.now(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      message: `This is a test ${type} notification with ${priority} priority`,
      type: type,
      priority: priority,
      timestamp: new Date(),
      read: false
    };

    addNotification(notification);
    showToast({
      message: `Added ${type} notification`,
      type: 'success',
      duration: 2000
    });
  };

  return (
    <>
      {/* Notification Bell with Badge */}
      <div className="notification-trigger-container" style={{ position: 'relative', display: 'inline-block' }}>

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.primary,
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.background = theme === 'dark' ? '#374151' : '#F0F9FF'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiBell size={24} />
        </button>

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: colors.status.error,
            color: 'white',
            borderRadius: '50%',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600',
            border: '2px solid white',
            animation: 'pulse 2s infinite',
            padding: unreadCount > 9 ? '0 4px' : '0'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* Position Selector Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '200px',
            marginTop: '0.5rem'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Dropdown Header with Close Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.text.primary }}>
                Position:
              </label>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.text.secondary,
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.target.style.background = colors.surface}
                onMouseLeave={(e) => e.target.style.background = 'none'}
                title="Close"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Position Selector */}
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                width: '100%',
                padding: '0.25rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                background: colors.background,
                color: colors.text.primary
              }}
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>

            {/* Test Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                onClick={() => addTestNotification('security', 'high')}
                style={{
                  padding: '0.5rem',
                  background: theme === 'dark' ? '#7F1D1D' : '#FEF2F2',
                  color: colors.status.error,
                  border: `1px solid ${theme === 'dark' ? '#991B1B' : '#FECACA'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Add Security Alert
              </button>
              <button
                onClick={() => addTestNotification('payment', 'medium')}
                style={{
                  padding: '0.5rem',
                  background: theme === 'dark' ? '#14532D' : '#F0FDF4',
                  color: colors.status.success,
                  border: `1px solid ${theme === 'dark' ? '#166534' : '#BBF7D0'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Add Payment Notification
              </button>
              <button
                onClick={() => addTestNotification('info', 'low')}
                style={{
                  padding: '0.5rem',
                  background: theme === 'dark' ? '#1E3A8A' : '#EFF6FF',
                  color: colors.status.info,
                  border: `1px solid ${theme === 'dark' ? '#1E40AF' : '#BFDBFE'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Add Info Notification
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={position}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
