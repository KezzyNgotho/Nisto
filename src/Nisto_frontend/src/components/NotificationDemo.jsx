import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FiBell, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function NotificationDemo() {
  const { addNotification, showToast } = useNotification();

  return (
    <div style={{ padding: 16 }}>
      <h4>Notification Demo</h4>
      <button onClick={() => addNotification({
        title: 'Wallet Connected',
        message: 'New wallet connected successfully',
        type: 'success',
        icon: <FiCheck />, time: new Date().toLocaleTimeString()
      })}>
        Add Success Notification
      </button>
      <button onClick={() => addNotification({
        title: 'Security Alert',
        message: 'Suspicious login detected',
        type: 'warning',
        icon: <FiAlertCircle />, time: new Date().toLocaleTimeString()
      })}>
        Add Security Notification
      </button>
      <button onClick={() => showToast({
        message: 'This is a toast!',
        icon: <FiBell />,
        type: 'info',
        duration: 3000
      })}>
        Show Toast
      </button>
    </div>
  );
} 