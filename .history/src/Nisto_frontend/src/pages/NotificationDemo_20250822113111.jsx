import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import NotificationTrigger from '../components/NotificationTrigger';
import { FiBell, FiSettings, FiShield, FiDollarSign, FiUsers } from 'react-icons/fi';

export default function NotificationDemo() {
  const { 
    addNotification, 
    showToast, 
    pushPermission, 
    requestPushPermission,
    getPushPermissionStatus 
  } = useNotification();
  
  const [position, setPosition] = useState('top-right');

  const positions = [
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'center', label: 'Center' }
  ];

  const addTestNotification = (type, priority = 'medium', title = null, message = null) => {
    const notification = {
      id: Date.now() + Math.random(),
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      message: message || `This is a test ${type} notification with ${priority} priority`,
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

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (granted) {
        showToast({
          message: 'Push notifications enabled!',
          type: 'success',
          duration: 3000
        });
      } else {
        showToast({
          message: 'Push notifications denied',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      showToast({
        message: 'Error requesting permission',
        type: 'error',
        duration: 3000
      });
    }
  };

  const getPermissionStatus = () => {
    const status = getPushPermissionStatus();
    return status;
  };

  return (
          <div style={{ padding: '2rem', width: '100%' }}>
      <h1 style={{ color: '#075B5E', marginBottom: '2rem' }}>Notification System Demo</h1>
      
      {/* Push Notification Status */}
      <div style={{
        background: '#F0F9FF',
        border: '1px solid #BFDBFE',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#075985' }}>Push Notification Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: getPermissionStatus().canShow ? '#10B981' : 
                         pushPermission === 'denied' ? '#EF4444' : '#F59E0B'
            }} />
            <span style={{ fontWeight: 600 }}>
              Status: {pushPermission === 'granted' ? 'Enabled' : 
                      pushPermission === 'denied' ? 'Disabled' : 'Pending'}
            </span>
          </div>
          
          <button
            onClick={handleRequestPermission}
            disabled={pushPermission === 'granted'}
            style={{
              padding: '0.5rem 1rem',
              background: pushPermission === 'granted' ? '#D1D5DB' : '#075B5E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pushPermission === 'granted' ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {pushPermission === 'granted' ? 'Already Enabled' : 'Enable Push Notifications'}
          </button>
        </div>
      </div>

      {/* Notification Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Position Selector */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Modal Position</h3>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          >
            {positions.map(pos => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
          
          <NotificationTrigger />
        </div>

        {/* Quick Test Buttons */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Quick Test Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => addTestNotification('security', 'high', 'Security Alert', 'Suspicious login detected from unknown device')}
              style={{
                padding: '0.75rem',
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiShield size={16} />
              Security Alert (High Priority)
            </button>
            
            <button
              onClick={() => addTestNotification('payment', 'medium', 'Payment Received', 'You received 150 NST from vault contribution')}
              style={{
                padding: '0.75rem',
                background: '#F0FDF4',
                color: '#16A34A',
                border: '1px solid #BBF7D0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiDollarSign size={16} />
              Payment Notification (Medium Priority)
            </button>
            
            <button
              onClick={() => addTestNotification('vault', 'medium', 'Vault Invitation', 'You have been invited to join "Investment Club" vault')}
              style={{
                padding: '0.75rem',
                background: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiUsers size={16} />
              Vault Notification (Medium Priority)
            </button>
            
            <button
              onClick={() => addTestNotification('system', 'low', 'System Update', 'New features available in your dashboard')}
              style={{
                padding: '0.75rem',
                background: '#F9FAFB',
                color: '#6B7280',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiSettings size={16} />
              System Update (Low Priority)
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400E' }}>How to Test</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400E' }}>
          <li>Click the notification bell icon to open the notification center</li>
          <li>Use the position selector to change where the modal appears</li>
          <li>Click "Enable Push Notifications" to allow browser notifications</li>
          <li>Use the quick test buttons to add different types of notifications</li>
          <li>Check that push notifications appear in your browser/system</li>
          <li>Try different positions: top-right, top-left, bottom-right, bottom-left, center</li>
        </ol>
      </div>

      {/* Features List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>✅ Non-Intrusive Modal</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
            Modal appears as floating overlay without affecting page layout
          </p>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>✅ Multiple Positions</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
            Choose from 5 different positions: corners and center
          </p>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>✅ Push Notifications</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
            Browser notifications with permission management
          </p>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>✅ Priority Levels</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
            High, medium, and low priority notifications
          </p>
        </div>
      </div>
    </div>
  );
}
