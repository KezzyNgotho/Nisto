import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FiX } from 'react-icons/fi';

export default function ToastNotification() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="toast-container top-right">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast${toast.type ? ' ' + toast.type : ''}`}>
          <div className="toast-content">
            <span>{toast.icon}</span>
            <span>{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}><FiX /></button>
        </div>
      ))}
    </div>
  );
} 