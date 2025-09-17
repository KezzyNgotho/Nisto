import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import SwapInterface from './SwapInterface';
import SwapHistory from './SwapHistory';
import MarketInterface from './MarketInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FiArrowLeft,
  FiSettings,
  FiRefreshCw,
  FiHistory,
  FiBarChart3
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

      {/* Main Content with Tabs */}
      <div className="swap-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="swap" className="flex items-center space-x-2">
              <FiRefreshCw className="w-4 h-4" />
              <span>Swap</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center space-x-2">
              <FiBarChart3 className="w-4 h-4" />
              <span>Market</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <FiHistory className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="mt-0">
            <SwapInterface onSwapComplete={addToHistory} />
          </TabsContent>

          <TabsContent value="market" className="mt-0">
            <MarketInterface />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <SwapHistory swapHistory={swapHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SwapModule;