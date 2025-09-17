import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import SwapInterface from './SwapInterface';
import SwapHistory from './SwapHistory';
import MarketInterface from './MarketInterface';
import { 
  FiArrowLeft,
  FiSettings,
  FiRefreshCw,
  FiClock,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiActivity
} from 'react-icons/fi';
import './SwapModule.scss';

const SwapModule = ({ onBack }) => {
  const { user, isAuthenticated, backendService } = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('swap');
  const [swapHistory, setSwapHistory] = useState([]);

  // Function to add swap to history (called from SwapInterface)
  const addToHistory = (swapData) => {
    setSwapHistory(prev => [swapData, ...prev]);
  };

  return (
    <div className={`swap-module ${theme}`}>
      {/* Main Content Container */}
      <div className="swap-container">
        {/* Header Section */}
        <div className="swap-header">
          <div className="swap-header-content">
            <button 
              className="back-button"
              onClick={onBack}
              aria-label="Go back"
            >
              <FiArrowLeft className="icon" />
            </button>
            
            <div className="swap-title-section">
              <div className="title-wrapper">
                <h1 className="swap-title">
                  <FiZap className="title-icon" />
                  Nisto Swap
                </h1>
                <span className="status-badge">
                  <FiShield className="badge-icon" />
                  Secure
                </span>
              </div>
              <p className="swap-subtitle">
                {isAuthenticated 
                  ? `Welcome back, ${user?.name || 'User'}!` 
                  : 'Connect your wallet to start trading'
                }
              </p>
            </div>

            <div className="swap-actions">
              <button className="action-button" aria-label="Refresh">
                <FiRefreshCw className="icon" />
              </button>
              <button className="action-button" aria-label="Settings">
                <FiSettings className="icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
      {/*   <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-icon">
              <FiActivity />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Volume</span>
              <span className="stat-value">$2.4M</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-details">
              <span className="stat-label">24h Change</span>
              <span className="stat-value positive">+12.5%</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <FiShield />
            </div>
            <div className="stat-details">
              <span className="stat-label">Security Score</span>
              <span className="stat-value">99.9%</span>
            </div>
          </div>
        </div> */}

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'swap' ? 'active' : ''}`}
            onClick={() => setActiveTab('swap')}
          >
            <FiRefreshCw className="tab-icon" />
            <span>Swap</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            <FiTrendingUp className="tab-icon" />
            <span>Market</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FiClock className="tab-icon" />
            <span>History</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'swap' && (
            <div className="content-panel">
              <SwapInterface onSwapComplete={addToHistory} />
            </div>
          )}

          {activeTab === 'market' && (
            <div className="content-panel">
              <MarketInterface />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="content-panel">
              <SwapHistory swapHistory={swapHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapModule;