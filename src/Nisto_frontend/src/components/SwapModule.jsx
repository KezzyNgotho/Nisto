import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import SwapInterface from './SwapInterface';
import SwapHistory from './SwapHistory';
import MarketInterface from './MarketInterface';
import SmartWalletService from '../services/SmartWalletService.js';
import { 
  FiArrowLeft,
  FiRefreshCw,
  FiClock,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiActivity,
  FiSettings
} from 'react-icons/fi';
import './SwapModule.scss';

const SwapModule = ({ onBack }) => {
  const { user, isAuthenticated, backendService } = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('swap');
  const [swapHistory, setSwapHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    slippageTolerance: 0.5,
    transactionDeadline: 20,
    autoHedging: true,
    riskThreshold: 10,
    stablecoinPreference: 'USDC',
    defaultProvider: 'auto'
  });
  const smartWalletService = useMemo(() => {
    try {
      return SmartWalletService;
    } catch (error) {
      console.error('Failed to get SmartWalletService:', error);
      return null;
    }
  }, []);

  // Function to add swap to history (called from SwapInterface)
  const addToHistory = (swapData) => {
    setSwapHistory(prev => [swapData, ...prev]);
  };

  // Load settings from SmartWallet
  const loadSettings = async () => {
    if (!smartWalletService) return;
    
    try {
      await smartWalletService.initialize();
      const userId = user?.id || 'default_user';
      const preferences = await smartWalletService.getUserPreferences(userId);
      
      if (preferences) {
        setSettings({
          slippageTolerance: 0.5, // Default value
          transactionDeadline: 20, // Default value
          autoHedging: preferences.autoHedgingEnabled || false,
          riskThreshold: preferences.thresholdPercentage || 10,
          stablecoinPreference: preferences.stablecoinPreference || 'USDC',
          defaultProvider: preferences.preferredSwapProvider || 'auto'
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Save settings to SmartWallet
  const saveSettings = async (newSettings) => {
    if (!smartWalletService) {
      showToast('Settings service not available', 'error');
      return;
    }
    
    try {
      await smartWalletService.initialize();
      const userId = user?.id || 'default_user';
      
      const preferences = {
        thresholdPercentage: newSettings.riskThreshold,
        timeWindowMinutes: 30,
        stablecoinPreference: newSettings.stablecoinPreference,
        autoHedgingEnabled: newSettings.autoHedging,
        allocationLimit: 50,
        intermediaryTokenPreference: newSettings.stablecoinPreference,
        preferredSwapProvider: newSettings.defaultProvider
      };

      await smartWalletService.updateUserPreferences(userId, preferences);
      setSettings(newSettings);
      showToast('Settings saved successfully!', 'success');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings', 'error');
    }
  };

  // Load settings on component mount
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  return (
    <div className={`swap-module ${theme}`}>
      {/* Main Content Container */}
      <div className="swap-container">
        {/* Header Section */}
        <div className="swap-controls">
          <button 
            className="back-button"
            onClick={onBack}
            aria-label="Go back"
          >
            <FiArrowLeft className="icon" />
          </button>

          <div className="swap-actions">
            <button 
              className="action-button" 
              aria-label="Settings"
              onClick={() => setShowSettings(true)}
            >
              <FiSettings className="icon" />
            </button>
            <button 
              className="action-button" 
              aria-label="Refresh"
              onClick={() => {
                showToast('Refreshing data...', 'info');
                // Trigger refresh in child components
                window.dispatchEvent(new CustomEvent('refreshSwapData'));
              }}
            >
              <FiRefreshCw className="icon" />
            </button>
        </div>
      </div>

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
              <SwapInterface 
                onSwapComplete={addToHistory} 
                settings={settings}
                onSettingsChange={setSettings}
              />
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>
              <button 
                className="close-button" 
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            
            <div className="settings-content">
              {/* General Settings */}
              <div className="settings-section">
                <h4>General Settings</h4>
                <div className="setting-item">
                  <label>Slippage Tolerance (%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={settings.slippageTolerance}
                    onChange={(e) => setSettings(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) }))}
                  />
                  <span>{settings.slippageTolerance}%</span>
                </div>
                <div className="setting-item">
                  <label>Transaction Deadline (minutes)</label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={settings.transactionDeadline}
                    onChange={(e) => setSettings(prev => ({ ...prev, transactionDeadline: parseInt(e.target.value) }))}
                  />
                  <span>{settings.transactionDeadline} min</span>
                </div>
              </div>

              {/* AI SmartWallet Settings */}
              <div className="settings-section">
                <h4>AI SmartWallet</h4>
                <div className="setting-item">
                  <label>Auto Hedging</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoHedging}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoHedging: e.target.checked }))}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Risk Threshold (%)</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={settings.riskThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, riskThreshold: parseInt(e.target.value) }))}
                  />
                  <span>{settings.riskThreshold}%</span>
                </div>
                <div className="setting-item">
                  <label>Stablecoin Preference</label>
                  <select
                    value={settings.stablecoinPreference}
                    onChange={(e) => setSettings(prev => ({ ...prev, stablecoinPreference: e.target.value }))}
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="DAI">DAI</option>
                  </select>
                </div>
              </div>

              {/* Provider Settings */}
              <div className="settings-section">
                <h4>Default Provider</h4>
                <div className="setting-item">
                  <label>Swap Provider</label>
                  <select
                    value={settings.defaultProvider}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultProvider: e.target.value }))}
                  >
                    <option value="auto">Auto (Best Rate)</option>
                    <option value="1inch">1inch</option>
                    <option value="icp">ICP DEX</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="settings-footer">
              <button 
                className="save-button"
                onClick={() => {
                  saveSettings();
                  setShowSettings(false);
                }}
              >
                Save Settings
              </button>
            </div>
      </div>
        </div>
      )}

    </div>
  );
};

export default SwapModule;