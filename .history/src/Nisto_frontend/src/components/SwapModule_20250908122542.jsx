import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiRotateCcw,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowLeft,
  FiInfo,
  FiShield,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import './SwapModule.scss';

const SwapModule = ({ onBack }) => {
  const { user, isAuthenticated, backendService } = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();
  
  // Multi-currency support
  const [currencies] = useState([
    { 
      id: 'USDT', 
      name: 'Tether USD', 
      symbol: 'USDT', 
      icon: '💵',
      price: 1.00,
      balance: 1250.50,
      color: '#26a17b'
    },
    { 
      id: 'USDC', 
      name: 'USD Coin', 
      symbol: 'USDC', 
      icon: '🪙',
      price: 1.00,
      balance: 850.25,
      color: '#2775ca'
    },
    { 
      id: 'DAI', 
      name: 'Dai Stablecoin', 
      symbol: 'DAI', 
      icon: '🟡',
      price: 1.00,
      balance: 420.75,
      color: '#f5ac37'
    },
    { 
      id: 'NST', 
      name: 'Nisto Token', 
      symbol: 'NST', 
      icon: '🚀',
      price: 0.85,
      balance: 1500.00,
      color: '#8b5cf6'
    },
    { 
      id: 'KES', 
      name: 'Kenyan Shilling', 
      symbol: 'KES', 
      icon: '🇰🇪',
      price: 0.0065,
      balance: 50000.00,
      color: '#10b981'
    }
  ]);

  const [swapForm, setSwapForm] = useState({
    fromCurrency: 'USDT',
    toCurrency: 'NST',
    fromAmount: '',
    toAmount: '',
    rate: 0.85,
    slippage: 0.5,
    estimatedTime: '2-5 minutes'
  });

  const [loading, setLoading] = useState(false);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [swapHistory, setSwapHistory] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSwapData();
    }
  }, [isAuthenticated]);

  const loadSwapData = async () => {
    setLoading(true);
    try {
      // Mock data loading - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error loading swap data:', error);
      setLoading(false);
    }
  };

  const handleFromCurrencyChange = (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency) {
      setSwapForm(prev => ({
        ...prev,
        fromCurrency: currencyId,
        rate: calculateRate(currencyId, prev.toCurrency),
        fromAmount: '',
        toAmount: ''
      }));
    }
  };

  const handleToCurrencyChange = (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency) {
      setSwapForm(prev => ({
        ...prev,
        toCurrency: currencyId,
        rate: calculateRate(prev.fromCurrency, currencyId),
        fromAmount: '',
        toAmount: ''
      }));
    }
  };

  const calculateRate = (fromCurrency, toCurrency) => {
    const fromPrice = currencies.find(c => c.id === fromCurrency)?.price || 1;
    const toPrice = currencies.find(c => c.id === toCurrency)?.price || 1;
    return toPrice / fromPrice;
  };

  const handleFromAmountChange = (amount) => {
    const rate = calculateRate(swapForm.fromCurrency, swapForm.toCurrency);
    const toAmount = (parseFloat(amount) * rate).toFixed(6);
    
    setSwapForm(prev => ({
      ...prev,
      fromAmount: amount,
      toAmount: toAmount,
      rate: rate
    }));
  };

  const handleToAmountChange = (amount) => {
    const rate = calculateRate(swapForm.fromCurrency, swapForm.toCurrency);
    const fromAmount = (parseFloat(amount) / rate).toFixed(6);
    
    setSwapForm(prev => ({
      ...prev,
      fromAmount: fromAmount,
      toAmount: amount,
      rate: rate
    }));
  };

  const handleSwap = async () => {
    if (!swapForm.fromAmount || !swapForm.toAmount) {
      showToast('Please enter amounts for both currencies', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock swap transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const swapRecord = {
        id: Date.now(),
        from: `${swapForm.fromAmount} ${swapForm.fromCurrency}`,
        to: `${swapForm.toAmount} ${swapForm.toCurrency}`,
        rate: swapForm.rate,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      setSwapHistory(prev => [swapRecord, ...prev]);
      showToast(`Successfully swapped ${swapForm.fromAmount} ${swapForm.fromCurrency} to ${swapForm.toAmount} ${swapForm.toCurrency}`, 'success');
      
      // Reset form
      setSwapForm(prev => ({
        ...prev,
        fromAmount: '',
        toAmount: ''
      }));
      
    } catch (error) {
      showToast('Failed to process swap', 'error');
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setSwapForm(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      rate: 1 / prev.rate
    }));
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(balance);
  };

  const getCurrencyIcon = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.icon || '💰';
  };

  const getCurrencyName = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.name || currencyId;
  };

  const getCurrencyBalance = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.balance || 0;
  };

  return (
    <div className="swap-module" style={{ background: theme.colors.background.primary }}>
      {/* Header */}
      <div className="swap-header">
        <button 
          className="back-btn"
          onClick={onBack}
          style={{ 
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border}`
          }}
        >
          <FiArrowLeft />
          Back to Overview
        </button>
        
        <div className="header-content">
          <h1 style={{ color: theme.colors.text.primary }}>Currency Swap</h1>
          <p style={{ color: theme.colors.text.secondary }}>
            Exchange between different currencies instantly
          </p>
        </div>
      </div>

      {/* Swap Interface */}
      <div className="swap-interface">
        <div className="swap-container" style={{ 
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border}`
        }}>
          {/* From Currency */}
          <div className="swap-section">
            <label style={{ color: theme.colors.text.primary }}>From</label>
            <div className="currency-input-group">
              <div className="currency-selector">
                <span className="currency-icon">{getCurrencyIcon(swapForm.fromCurrency)}</span>
                <select
                  value={swapForm.fromCurrency}
                  onChange={(e) => handleFromCurrencyChange(e.target.value)}
                  style={{ 
                    background: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.id}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="amount-input">
                <input
                  type="number"
                  value={swapForm.fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  style={{ 
                    background: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                />
                <div className="balance-info">
                  <span style={{ color: theme.colors.text.secondary }}>
                    Balance: {formatBalance(getCurrencyBalance(swapForm.fromCurrency))} {swapForm.fromCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="swap-arrow-container">
            <button 
              className="swap-arrow-btn"
              onClick={swapCurrencies}
              style={{ 
                background: theme.colors.primary,
                color: theme.colors.white
              }}
            >
              <FiRotateCcw />
            </button>
          </div>

          {/* To Currency */}
          <div className="swap-section">
            <label style={{ color: theme.colors.text.primary }}>To</label>
            <div className="currency-input-group">
              <div className="currency-selector">
                <span className="currency-icon">{getCurrencyIcon(swapForm.toCurrency)}</span>
                <select
                  value={swapForm.toCurrency}
                  onChange={(e) => handleToCurrencyChange(e.target.value)}
                  style={{ 
                    background: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.id}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="amount-input">
                <input
                  type="number"
                  value={swapForm.toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  placeholder="0.00"
                  style={{ 
                    background: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                />
                <div className="balance-info">
                  <span style={{ color: theme.colors.text.secondary }}>
                    Balance: {formatBalance(getCurrencyBalance(swapForm.toCurrency))} {swapForm.toCurrency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Details */}
        <div className="swap-details" style={{ 
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div className="detail-row">
            <span style={{ color: theme.colors.text.secondary }}>Exchange Rate</span>
            <span style={{ color: theme.colors.text.primary }}>
              1 {swapForm.fromCurrency} = {swapForm.rate.toFixed(6)} {swapForm.toCurrency}
            </span>
          </div>
          <div className="detail-row">
            <span style={{ color: theme.colors.text.secondary }}>Slippage Tolerance</span>
            <span style={{ color: theme.colors.text.primary }}>
              {swapForm.slippage}%
            </span>
          </div>
          <div className="detail-row">
            <span style={{ color: theme.colors.text.secondary }}>Estimated Time</span>
            <span style={{ color: theme.colors.text.primary }}>
              {swapForm.estimatedTime}
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <button 
          className="swap-btn"
          onClick={handleSwap}
          disabled={loading || !swapForm.fromAmount || !swapForm.toAmount}
          style={{ 
            background: loading ? theme.colors.background.secondary : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            color: theme.colors.white,
            border: 'none'
          }}
        >
          {loading ? (
            <>
              <FiRefreshCw className="spinning" />
              Processing Swap...
            </>
          ) : (
            <>
              <FiRotateCcw />
              Swap Now
            </>
          )}
        </button>
      </div>

      {/* Swap History */}
      {swapHistory.length > 0 && (
        <div className="swap-history">
          <h3 style={{ color: theme.colors.text.primary }}>Recent Swaps</h3>
          <div className="history-list">
            {swapHistory.slice(0, 5).map(swap => (
              <div 
                key={swap.id}
                className="history-item"
                style={{ 
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border}`
                }}
              >
                <div className="swap-info">
                  <div className="swap-amounts">
                    <span style={{ color: theme.colors.text.primary }}>{swap.from}</span>
                    <FiRotateCcw style={{ color: theme.colors.text.secondary }} />
                    <span style={{ color: theme.colors.text.primary }}>{swap.to}</span>
                  </div>
                  <div className="swap-details">
                    <span style={{ color: theme.colors.text.secondary }}>
                      Rate: {swap.rate.toFixed(6)}
                    </span>
                    <span style={{ color: theme.colors.text.secondary }}>
                      {new Date(swap.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="swap-status">
                  <FiCheck style={{ color: '#10b981' }} />
                  <span style={{ color: '#10b981' }}>Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="swap-info-section" style={{ 
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border}`
      }}>
        <div className="info-header">
          <FiInfo style={{ color: theme.colors.primary }} />
          <h4 style={{ color: theme.colors.text.primary }}>Swap Information</h4>
        </div>
        <div className="info-content">
          <div className="info-item">
            <FiShield style={{ color: theme.colors.primary }} />
            <span style={{ color: theme.colors.text.secondary }}>
              All swaps are secured with MPC technology
            </span>
          </div>
          <div className="info-item">
            <FiClock style={{ color: theme.colors.primary }} />
            <span style={{ color: theme.colors.text.secondary }}>
              Transactions typically complete in 2-5 minutes
            </span>
          </div>
          <div className="info-item">
            <FiTrendingUp style={{ color: theme.colors.primary }} />
            <span style={{ color: theme.colors.text.secondary }}>
              Best rates guaranteed with our liquidity network
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapModule;
