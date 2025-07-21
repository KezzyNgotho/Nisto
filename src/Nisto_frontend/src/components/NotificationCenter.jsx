import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FiBell, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

export default function NotificationCenter() {
  const {
    notifications,
    markAllAsRead,
    clearNotifications,
  } = useNotification();
  const [activeTab, setActiveTab] = React.useState('all');

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'security') return n.type === 'warning' || n.type === 'security';
    return true;
  });

  return (
    <div className="notification-center">
      <div className="notification-header">
        <FiBell className="notification-icon" />
        <h3>Notifications</h3>
        <div className="notification-actions">
          <button className="btn-text" onClick={markAllAsRead}><FiCheck /> Mark all as read</button>
          <button className="btn-text" onClick={clearNotifications}><FiX /> Clear all</button>
        </div>
      </div>
      <div className="notification-tabs">
        <button className={`tab${activeTab==='all'?' active':''}`} onClick={()=>setActiveTab('all')}>All</button>
        <button className={`tab${activeTab==='unread'?' active':''}`} onClick={()=>setActiveTab('unread')}>Unread</button>
        <button className={`tab${activeTab==='security'?' active':''}`} onClick={()=>setActiveTab('security')}>Security</button>
      </div>
      <div className="notifications-list">
        {filtered.length === 0 ? (
          <div className="empty-notifications">
            <FiAlertCircle className="empty-icon" />
            <p>No notifications</p>
          </div>
        ) : filtered.map(n => (
          <div key={n.id} className={`notification-item${n.read ? '' : ' unread'}`}>
            <div className="notification-content">
              <div className="notification-title">{n.title || 'Notification'}</div>
              <div className="notification-message">{n.message}</div>
              <div className="notification-meta">
                <span className="notification-time">{n.time || ''}</span>
                <span className="notification-type">{n.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 