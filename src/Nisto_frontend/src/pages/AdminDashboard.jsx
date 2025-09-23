import React, { useState } from 'react';
import { useToast } from '../components/ui/ToastManager';
import SecurityAudit from '../components/security/SecurityAudit';
import PerformanceMonitor from '../components/performance/PerformanceMonitor';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { success, error, info } = useToast();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    info(`Switched to ${tabs.find(t => t.id === tabId)?.label} tab`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'security':
        return <SecurityAudit />;
      case 'performance':
        return <PerformanceMonitor />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'users':
        return <UsersTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div className="admin-dashboard__title">
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage your Nisto application</p>
        </div>
        <div className="admin-dashboard__actions">
          <button 
            className="btn btn-primary"
            onClick={() => success('System status updated successfully!')}
          >
            Refresh Status
          </button>
        </div>
      </div>

      <div className="admin-dashboard__content">
        <div className="admin-dashboard__sidebar">
          <nav className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav__item ${activeTab === tab.id ? 'admin-nav__item--active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="admin-nav__icon">{tab.icon}</span>
                <span className="admin-nav__label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="admin-dashboard__main">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = () => {
  const stats = [
    { label: 'Total Users', value: '12,543', change: '+12%', trend: 'up' },
    { label: 'Active Sessions', value: '1,234', change: '+5%', trend: 'up' },
    { label: 'Transactions Today', value: '567', change: '-2%', trend: 'down' },
    { label: 'Revenue', value: '$45,678', change: '+18%', trend: 'up' }
  ];

  return (
    <div className="overview-tab">
      <div className="overview-header">
        <h2>System Overview</h2>
        <p>Real-time metrics and system status</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card__content">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
            <div className={`stat-card__change stat-card__change--${stat.trend}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="overview-sections">
        <div className="overview-section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-content">
                <div className="activity-title">New user registered</div>
                <div className="activity-time">2 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <div className="activity-title">Transaction completed</div>
                <div className="activity-time">5 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🔒</div>
              <div className="activity-content">
                <div className="activity-title">Security audit passed</div>
                <div className="activity-time">10 minutes ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-section">
          <h3>System Health</h3>
          <div className="health-indicators">
            <div className="health-indicator health-indicator--good">
              <div className="health-indicator__status">🟢</div>
              <div className="health-indicator__label">API Status</div>
            </div>
            <div className="health-indicator health-indicator--good">
              <div className="health-indicator__status">🟢</div>
              <div className="health-indicator__label">Database</div>
            </div>
            <div className="health-indicator health-indicator--warning">
              <div className="health-indicator__status">🟡</div>
              <div className="health-indicator__label">Cache</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsTab = () => {
  return (
    <div className="analytics-tab">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <p>User behavior and business metrics</p>
      </div>
      
      <div className="analytics-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">📈</div>
          <h3>Analytics Coming Soon</h3>
          <p>Advanced analytics and reporting features will be available in the next update.</p>
        </div>
      </div>
    </div>
  );
};

const UsersTab = () => {
  return (
    <div className="users-tab">
      <div className="users-header">
        <h2>User Management</h2>
        <p>Manage users and permissions</p>
      </div>
      
      <div className="users-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">👥</div>
          <h3>User Management Coming Soon</h3>
          <p>User management and permission controls will be available in the next update.</p>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = () => {
  return (
    <div className="settings-tab">
      <div className="settings-header">
        <h2>System Settings</h2>
        <p>Configure application settings and preferences</p>
      </div>
      
      <div className="settings-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">⚙️</div>
          <h3>Settings Coming Soon</h3>
          <p>System configuration and settings will be available in the next update.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
