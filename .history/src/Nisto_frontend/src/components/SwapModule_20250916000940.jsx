import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import SwapInterface from './SwapInterface';
import SwapHistory from './SwapHistory';
import MarketInterface from './MarketInterface';
import SmartWalletService from '../services/SmartWalletService';
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
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    slippageTolerance: 0.5,
    transactionDeadline: 20,
    autoHedging: true,
    riskThreshold: 10,
    stablecoinPreference: 'USDC',
    defaultProvider: 'auto'
  });
  const [smartWalletService] = useState(() => new SmartWalletService());

  // Function to add swap to history (called from SwapInterface)
  const addToHistory = (swapData) => {
    setSwapHistory(prev => [swapData, ...prev]);
  };

  // Load settings from SmartWallet
  const loadSettings = async () => {
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
            <button className="action-button" aria-label="Refresh">
              <FiRefreshCw className="icon" />
            </button>
            <button 
              className="action-button" 
              aria-label="Settings"
              onClick={() => setShowSettings(true)}
            >
              <FiSettings className="icon" />
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>Swap Settings</h2>
              <button 
                className="close-button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>
            
            <div className="settings-content">
              <div className="settings-section">
                <h3>General Settings</h3>
                <div className="setting-item">
                  <label>Default Slippage Tolerance</label>
                  <select 
                    value={settings.slippageTolerance}
                    onChange={(e) => setSettings(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) }))}
                  >
                    <option value="0.1">0.1%</option>
                    <option value="0.5">0.5%</option>
                    <option value="1.0">1.0%</option>
                    <option value="3.0">3.0%</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <label>Transaction Deadline</label>
                  <select 
                    value={settings.transactionDeadline}
                    onChange={(e) => setSettings(prev => ({ ...prev, transactionDeadline: parseInt(e.target.value) }))}
                  >
                    <option value="10">10 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>

              <div className="settings-section">
                <h3>AI SmartWallet Settings</h3>
                <div className="setting-item">
                  <label>Auto-Hedging</label>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="autoHedging" 
                      checked={settings.autoHedging}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoHedging: e.target.checked }))}
                    />
                    <label htmlFor="autoHedging" className="toggle-label">
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label>Risk Threshold</label>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={settings.riskThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, riskThreshold: parseInt(e.target.value) }))}
                    className="risk-slider"
                  />
                  <span className="risk-value">{settings.riskThreshold}%</span>
                </div>
                
                <div className="setting-item">
                  <label>Preferred Stablecoin</label>
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

              <div className="settings-section">
                <h3>Provider Settings</h3>
                <div className="setting-item">
                  <label>Default Swap Provider</label>
                  <select defaultValue="auto">
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
                  showToast('Settings saved successfully!', 'success');
                  setShowSettings(false);
                }}
              >
                Save Settings
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapModule;