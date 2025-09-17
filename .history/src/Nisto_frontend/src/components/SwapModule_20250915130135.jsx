import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import SwapInterface from './SwapInterface';
import SwapHistory from './SwapHistory';
import MarketInterface from './MarketInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
      {/* Modern Header */}
      <div className="swap-header">
        <div className="swap-header-content">
          <button 
            className="back-button"
            onClick={onBack}
            aria-label="Go back"
          >
            <FiArrowLeft className="icon" />
            <span>Back</span>
          </button>
          
          <div className="swap-title-section">
            <div className="title-wrapper">
              <h1 className="swap-title">
                <FiZap className="title-icon" />
                Nisto Swap
              </h1>
              <Badge variant="secondary" className="status-badge">
                <FiShield className="badge-icon" />
                Secure
              </Badge>
            </div>
            <p className="swap-subtitle">
              {isAuthenticated 
                ? `Welcome back, ${user?.name || 'User'}! Ready to swap?` 
                : 'Connect your wallet to start swapping tokens'
              }
            </p>
          </div>

          <div className="swap-actions">
            <button 
              className="action-button"
              aria-label="Refresh"
            >
              <FiRefreshCw className="icon" />
            </button>
            <button 
              className="action-button"
              aria-label="Settings"
            >
              <FiSettings className="icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="swap-stats-grid">
        <Card className="stat-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <FiActivity />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Volume</span>
              <span className="stat-value">$2.4M</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-info">
              <span className="stat-label">24h Change</span>
              <span className="stat-value positive">+12.5%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <FiShield />
            </div>
            <div className="stat-info">
              <span className="stat-label">Security Score</span>
              <span className="stat-value">99.9%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Modern Tab System */}
      <div className="swap-content">
        <div className="modern-tab-system">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <div className="tab-nav-container">
              <button 
                className={`tab-nav-item ${activeTab === 'swap' ? 'active' : ''}`}
                onClick={() => setActiveTab('swap')}
              >
                <div className="tab-nav-content">
                  <div className="tab-nav-icon">
                    <FiRefreshCw />
                  </div>
                  <span className="tab-nav-label">Swap</span>
                  <div className="tab-nav-indicator"></div>
                </div>
              </button>
              
              <button 
                className={`tab-nav-item ${activeTab === 'market' ? 'active' : ''}`}
                onClick={() => setActiveTab('market')}
              >
                <div className="tab-nav-content">
                  <div className="tab-nav-icon">
                    <FiTrendingUp />
                  </div>
                  <span className="tab-nav-label">Market</span>
                  <div className="tab-nav-indicator"></div>
                </div>
              </button>
              
              <button 
                className={`tab-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <div className="tab-nav-content">
                  <div className="tab-nav-icon">
                    <FiClock />
                  </div>
                  <span className="tab-nav-label">History</span>
                  <div className="tab-nav-indicator"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content-container">
            {activeTab === 'swap' && (
              <div className="tab-panel active">
                <div className="panel-header">
                  <div className="panel-title">
                    <FiZap className="panel-icon" />
                    <h3>Token Swap</h3>
                    <Badge variant="secondary" className="panel-badge">
                      <FiShield className="badge-icon" />
                      Secure
                    </Badge>
                  </div>
                </div>
                <div className="panel-content">
                  <SwapInterface onSwapComplete={addToHistory} />
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="tab-panel active">
                <div className="panel-header">
                  <div className="panel-title">
                    <FiTrendingUp className="panel-icon" />
                    <h3>Market Data</h3>
                    <Badge variant="secondary" className="panel-badge">
                      <FiActivity className="badge-icon" />
                      Live
                    </Badge>
                  </div>
                </div>
                <div className="panel-content">
                  <MarketInterface />
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="tab-panel active">
                <div className="panel-header">
                  <div className="panel-title">
                    <FiClock className="panel-icon" />
                    <h3>Swap History</h3>
                    <Badge variant="secondary" className="panel-badge">
                      <span className="badge-text">{swapHistory.length} swaps</span>
                    </Badge>
                  </div>
                </div>
                <div className="panel-content">
                  <SwapHistory swapHistory={swapHistory} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapModule;