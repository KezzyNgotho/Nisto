import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiRefreshCw, 
  FiArrowDown, 
  FiArrowUp, 
  FiTrendingUp, 
  FiTrendingDown,
  FiDollarSign,
  FiAlertTriangle,
  FiCheckCircle,
  FiSettings,
  FiInfo,
  FiZap,
  FiShield,
  FiClock,
  FiPercent,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';

const TokenSwap = () => {
  const auth = useAuth();
  const [swapData, setSwapData] = useState({
    fromToken: 'NST',
    toToken: 'ICP',
    fromAmount: '',
    toAmount: '',
    fromBalance: 0,
    toBalance: 0,
    price: 0.1, // Mock price: 1 NST = 0.1 ICP
    priceImpact: 0,
    slippage: 0.5,
    gasFee: 0.0001,
    minimumReceived: 0
  });
  
  const [swapSettings, setSwapSettings] = useState({
    slippageTolerance: 0.5,
    autoSlippage: true,
    deadline: 20, // minutes
    expertMode: false
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [isPriceUp, setIsPriceUp] = useState(true);

  // Load balances
  const loadBalances = useCallback(async () => {
    if (!auth?.principal || !auth?.backendService) return;
    
    try {
      const [nstBalance, icpBalance] = await Promise.all([
        auth.backendService.balanceOf(auth.principal),
        auth.backendService.getUserCryptoWallets()
      ]);
      
      const icpWallet = icpBalance?.find(wallet => wallet.currency === 'ICP');
      
      setSwapData(prev => ({
        ...prev,
        fromBalance: swapData.fromToken === 'NST' ? Number(nstBalance) : (icpWallet?.balance || 0),
        toBalance: swapData.toToken === 'NST' ? Number(nstBalance) : (icpWallet?.balance || 0)
      }));
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  }, [auth?.principal, auth?.backendService, swapData.fromToken, swapData.toToken]);

  // Calculate swap amounts
  const calculateSwap = useCallback((amount, fromToken, toToken) => {
    if (!amount || amount <= 0) {
      setSwapData(prev => ({ ...prev, toAmount: '', priceImpact: 0, minimumReceived: 0 }));
      return;
    }
    
    const price = fromToken === 'NST' ? 0.1 : 10; // 1 NST = 0.1 ICP
    const toAmount = amount * price;
    
    // Calculate price impact (simplified)
    const priceImpact = amount > 1000 ? (amount - 1000) * 0.001 : 0;
    
    // Calculate minimum received with slippage
    const slippageMultiplier = 1 - (swapSettings.slippageTolerance / 100);
    const minimumReceived = toAmount * slippageMultiplier;
    
    setSwapData(prev => ({
      ...prev,
      toAmount: toAmount.toFixed(6),
      priceImpact: Math.min(priceImpact, 5), // Max 5% impact
      minimumReceived: minimumReceived.toFixed(6)
    }));
  }, [swapSettings.slippageTolerance]);

  // Handle from amount change
  const handleFromAmountChange = (amount) => {
    setSwapData(prev => ({ ...prev, fromAmount: amount }));
    calculateSwap(amount, swapData.fromToken, swapData.toToken);
  };

  // Handle to amount change
  const handleToAmountChange = (amount) => {
    setSwapData(prev => ({ ...prev, toAmount: amount }));
    const fromAmount = amount / (swapData.fromToken === 'NST' ? 0.1 : 10);
    setSwapData(prev => ({ ...prev, fromAmount: fromAmount.toFixed(6) }));
  };

  // Switch tokens
  const switchTokens = () => {
    setSwapData(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      fromBalance: prev.toBalance,
      toBalance: prev.fromBalance
    }));
  };

  // Set max amount
  const setMaxAmount = () => {
    const maxAmount = swapData.fromBalance / 100000000; // Convert from smallest unit
    handleFromAmountChange(maxAmount.toString());
  };

  // Execute swap
  const executeSwap = async () => {
    if (!swapData.fromAmount || !swapData.toAmount || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Validate balances
      const fromAmountInSmallestUnit = BigInt(Math.floor(Number(swapData.fromAmount) * 100000000));
      if (fromAmountInSmallestUnit > swapData.fromBalance) {
        throw new Error('Insufficient balance');
      }
      
      // Validate price impact
      if (swapData.priceImpact > 3 && !swapSettings.expertMode) {
        throw new Error('Price impact too high. Enable expert mode to continue.');
      }
      
      // Simulate swap (in real implementation, this would call the swap contract)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      setMessage('Swap executed successfully!');
      
      // Clear amounts
      setSwapData(prev => ({ ...prev, fromAmount: '', toAmount: '' }));
      
      // Reload balances
      setTimeout(loadBalances, 1000);
    } catch (error) {
      console.error('Swap error:', error);
      setError(`Swap failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  // Format balance
  const formatBalance = (balance) => {
    if (!balance) return '0';
    return (Number(balance) / 100000000).toFixed(8);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get token icon
  const getTokenIcon = (token) => {
    return token === 'NST' ? '🪙' : '⚡';
  };

  // Get token color
  const getTokenColor = (token) => {
    return token === 'NST' ? '#075B5E' : '#FF6B35';
  };

  return (
    <div className="token-swap">
      {/* Header */}
      <div className="swap-header">
        <div className="swap-header-left">
          <div className="swap-icon">
            <FiRefreshCw />
          </div>
          <div>
            <h1 className="swap-title">Token Swap</h1>
            <p className="swap-subtitle">Trade NST ↔ ICP instantly</p>
          </div>
        </div>
        <div className="swap-header-actions">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-secondary"
            title="Swap Settings"
          >
            <FiSettings />
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <FiAlertTriangle />
          <span>{error}</span>
        </div>
      )}
      
      {message && (
        <div className="alert alert-success">
          <FiCheckCircle />
          <span>{message}</span>
        </div>
      )}

      {/* Swap Interface */}
      <div className="swap-interface">
        {/* From Token */}
        <div className="swap-token-card">
          <div className="swap-token-header">
            <div className="swap-token-info">
              <div className="swap-token-icon" style={{ backgroundColor: getTokenColor(swapData.fromToken) + '20' }}>
                {getTokenIcon(swapData.fromToken)}
              </div>
              <div>
                <div className="swap-token-name">{swapData.fromToken}</div>
                <div className="swap-token-balance">
                  Balance: {formatBalance(swapData.fromBalance)}
                </div>
              </div>
            </div>
            <button
              onClick={setMaxAmount}
              className="btn btn-text"
              disabled={!swapData.fromBalance}
            >
              MAX
            </button>
          </div>
          <div className="swap-amount-input">
            <input
              type="number"
              placeholder="0.0"
              value={swapData.fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="swap-input"
            />
            <div className="swap-token-symbol">{swapData.fromToken}</div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="swap-switch-container">
          <button
            onClick={switchTokens}
            className="swap-switch-btn"
            title="Switch tokens"
          >
            <FiArrowDown />
          </button>
        </div>

        {/* To Token */}
        <div className="swap-token-card">
          <div className="swap-token-header">
            <div className="swap-token-info">
              <div className="swap-token-icon" style={{ backgroundColor: getTokenColor(swapData.toToken) + '20' }}>
                {getTokenIcon(swapData.toToken)}
              </div>
              <div>
                <div className="swap-token-name">{swapData.toToken}</div>
                <div className="swap-token-balance">
                  Balance: {formatBalance(swapData.toBalance)}
                </div>
              </div>
            </div>
          </div>
          <div className="swap-amount-input">
            <input
              type="number"
              placeholder="0.0"
              value={swapData.toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              className="swap-input"
            />
            <div className="swap-token-symbol">{swapData.toToken}</div>
          </div>
        </div>

        {/* Swap Details */}
        <div className="swap-details">
          <div className="swap-detail-item">
            <span className="swap-detail-label">
              <FiTrendingUp />
              Price
            </span>
            <span className="swap-detail-value">
              1 {swapData.fromToken} = {swapData.price} {swapData.toToken}
            </span>
          </div>
          
          <div className="swap-detail-item">
            <span className="swap-detail-label">
              <FiPercent />
              Price Impact
            </span>
            <span className={`swap-detail-value ${swapData.priceImpact > 2 ? 'warning' : ''}`}>
              {swapData.priceImpact.toFixed(2)}%
            </span>
          </div>
          
          <div className="swap-detail-item">
            <span className="swap-detail-label">
              <FiZap />
              Network Fee
            </span>
            <span className="swap-detail-value">
              {swapData.gasFee} ICP
            </span>
          </div>
          
          <div className="swap-detail-item">
            <span className="swap-detail-label">
              <FiShield />
              Minimum Received
            </span>
            <span className="swap-detail-value">
              {swapData.minimumReceived} {swapData.toToken}
            </span>
          </div>
          
          <div className="swap-detail-item">
            <span className="swap-detail-label">
              <FiClock />
              Slippage Tolerance
            </span>
            <span className="swap-detail-value">
              {swapSettings.slippageTolerance}%
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={executeSwap}
          disabled={loading || !swapData.fromAmount || !swapData.toAmount}
          className="btn btn-primary btn-swap"
        >
          {loading ? (
            <>
              <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
              <span>Swapping...</span>
            </>
          ) : (
            <>
              <FiRefreshCw />
              <span>Swap {swapData.fromToken} for {swapData.toToken}</span>
            </>
          )}
        </button>

        {/* Price Impact Warning */}
        {swapData.priceImpact > 2 && (
          <div className="swap-warning">
            <FiAlertTriangle />
            <div>
              <div className="swap-warning-title">High Price Impact</div>
              <div className="swap-warning-message">
                This swap will result in a {swapData.priceImpact.toFixed(2)}% price impact. 
                Consider using a smaller amount or enable expert mode.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swap Settings Modal */}
      {showSettings && (
        <div className="swap-settings-modal">
          <div className="swap-settings-content">
            <div className="swap-settings-header">
              <h3>Swap Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-text"
              >
                <FiMaximize2 />
              </button>
            </div>
            
            <div className="swap-settings-body">
              <div className="setting-group">
                <label className="setting-label">Slippage Tolerance</label>
                <div className="slippage-options">
                  {[0.1, 0.5, 1.0].map(slippage => (
                    <button
                      key={slippage}
                      onClick={() => setSwapSettings(prev => ({ ...prev, slippageTolerance: slippage }))}
                      className={`btn btn-outline ${swapSettings.slippageTolerance === slippage ? 'active' : ''}`}
                    >
                      {slippage}%
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={swapSettings.slippageTolerance}
                    onChange={(e) => setSwapSettings(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) || 0 }))}
                    className="slippage-input"
                  />
                </div>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">Transaction Deadline</label>
                <input
                  type="number"
                  value={swapSettings.deadline}
                  onChange={(e) => setSwapSettings(prev => ({ ...prev, deadline: parseInt(e.target.value) || 20 }))}
                  className="setting-input"
                />
                <span className="setting-unit">minutes</span>
              </div>
              
              <div className="setting-group">
                <label className="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    checked={swapSettings.expertMode}
                    onChange={(e) => setSwapSettings(prev => ({ ...prev, expertMode: e.target.checked }))}
                  />
                  <span>Expert Mode</span>
                </label>
                <div className="setting-description">
                  Bypass price impact warnings and allow high slippage trades
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart Placeholder */}
      <div className="swap-chart">
        <div className="chart-header">
          <h3>Price Chart</h3>
          <div className="chart-controls">
            <button className="btn btn-outline">1H</button>
            <button className="btn btn-outline active">24H</button>
            <button className="btn btn-outline">7D</button>
            <button className="btn btn-outline">1M</button>
          </div>
        </div>
        <div className="chart-placeholder">
          <div className="chart-info">
            <div className="chart-price">
              <span className="chart-price-value">1 NST = 0.1 ICP</span>
            </div>
            <div className="chart-change">
              <FiTrendingUp style={{ color: '#10b981' }} />
              <span style={{ color: '#10b981' }}>+2.5%</span>
            </div>
          </div>
          <div className="chart-visual">
            <div className="chart-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSwap;
