import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import SwapInterface from './SwapInterface';
import { 
  FiArrowLeft,
  FiSettings
} from 'react-icons/fi';
import './SwapModule.scss';

const SwapModule = ({ onBack }) => {
  const { user, isAuthenticated, backendService } = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();

  return (
    <div className={`swap-module ${theme}`}>
      {/* Header */}
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
            <h1 className="swap-title">Nisto Swap</h1>
            <p className="swap-subtitle">
              {isAuthenticated 
                ? `Welcome back, ${user?.name || 'User'}!` 
                : 'Connect your wallet to start swapping'
              }
            </p>
          </div>

          <div className="swap-actions">
            <button 
              className="settings-button"
              aria-label="Settings"
            >
              <FiSettings className="icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Swap Interface */}
      <div className="swap-content">
        <SwapInterface />
      </div>
    </div>
  );
};

export default SwapModule;