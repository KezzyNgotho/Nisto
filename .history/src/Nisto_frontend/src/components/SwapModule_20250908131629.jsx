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
  FiCheck,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiEyeOff,
  FiZap,
  FiStar,
  FiGlobe,
  FiTarget
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
      icon: FiDollarSign,
      price: 1.00,
      balance: 1250.50,
      color: '#26a17b',
      change: 0.00
    },
    { 
      id: 'USDC', 
      name: 'USD Coin', 
      symbol: 'USDC', 
      icon: FiZap,
      price: 1.00,
      balance: 850.25,
      color: '#2775ca',
      change: 0.00
    },
    { 
      id: 'DAI', 
      name: 'Dai Stablecoin', 
      symbol: 'DAI', 
      icon: FiTarget,
      price: 1.00,
      balance: 420.75,
      color: '#f5ac37',
      change: 0.01
    },
    { 
      id: 'NST', 
      name: 'Nisto Token', 
      symbol: 'NST', 
      icon: FiStar,
      price: 0.85,
      balance: 1500.00,
      color: '#8b5cf6',
      change: 5.25
    },
    { 
      id: 'KES', 
      name: 'Kenyan Shilling', 
      symbol: 'KES', 
      icon: FiGlobe,
      price: 0.0065,
      balance: 50000.00,
      color: '#10b981',
      change: -0.5
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
  const [showBalances, setShowBalances] = useState(true);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const getCurrencyIcon = (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency && currency.icon) {
      const IconComponent = currency.icon;
      return <IconComponent size={20} style={{ color: currency.color }} />;
    }
    return <FiDollarSign size={20} style={{ color: theme.colors.text.secondary }} />;
  };

  const getCurrencyName = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.name || currencyId;
  };

  const getCurrencyBalance = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.balance || 0;
  };

  const getCurrencyChange = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.change || 0;
  };

  return (
    <div className="swap-module">
      {/* Header Section */}
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
            Exchange between different currencies with the best rates
          </p>
        </div>

        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={loadSwapData}
            disabled={loading}
            style={{ 
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button 
            className="balance-toggle"
            onClick={() => setShowBalances(!showBalances)}
            style={{ 
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            {showBalances ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="swap-content-grid">
        {/* Left Column - Swap Interface & Market Overview */}
        <div className="swap-interface-column">
          {/* Market Overview */}
          <div className="market-overview-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Market Overview</h3>
              <FiActivity style={{ color: theme.colors.primary }} />
            </div>
            <div className="market-stats">
              <div className="stat-row">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>24h Volume</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>$2.4M</span>
              </div>
              <div className="stat-row">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Total Pairs</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>25</span>
              </div>
              <div className="stat-row">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Avg. Fee</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>0.1%</span>
              </div>
            </div>
          </div>

          {/* Swap Card */}
          <div className="swap-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Swap Currencies</h3>
              <div className="swap-stats">
                <div className="stat-item">
                  <span style={{ color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Rate</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: '0.875rem', fontWeight: '600' }}>
                    1 {swapForm.fromCurrency} = {swapForm.rate.toFixed(6)} {swapForm.toCurrency}
                  </span>
                </div>
                <div className="stat-item">
                  <span style={{ color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Slippage</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: '0.875rem', fontWeight: '600' }}>{swapForm.slippage}%</span>
                </div>
              </div>
            </div>

            <div className="swap-container">
              {/* From and To Currencies in Row */}
              <div className="swap-row">
                {/* From Currency */}
                <div className="swap-section">
                  <label style={{ color: theme.colors.text.primary }}>From</label>
                  <div className="currency-input-group">
                    <div className="currency-selector">
                      <div className="currency-icon">{getCurrencyIcon(swapForm.fromCurrency)}</div>
                      <select
                        value={swapForm.fromCurrency}
                        onChange={(e) => handleFromCurrencyChange(e.target.value)}
                        style={{ 
                          background: 'transparent',
                          color: theme.colors.text.primary
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
                          background: 'transparent',
                          color: theme.colors.text.primary
                        }}
                      />
                      <div className="balance-info">
                        <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>
                          Balance: {showBalances ? formatBalance(getCurrencyBalance(swapForm.fromCurrency)) : '••••••'} {swapForm.fromCurrency}
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
                      <div className="currency-icon">{getCurrencyIcon(swapForm.toCurrency)}</div>
                      <select
                        value={swapForm.toCurrency}
                        onChange={(e) => handleToCurrencyChange(e.target.value)}
                        style={{ 
                          background: 'transparent',
                          color: theme.colors.text.primary
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
                          background: 'transparent',
                          color: theme.colors.text.primary
                        }}
                      />
                      <div className="balance-info">
                        <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>
                          Balance: {showBalances ? formatBalance(getCurrencyBalance(swapForm.toCurrency)) : '••••••'} {swapForm.toCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <button 
              className="swap-btn"
              onClick={handleSwap}
              disabled={loading || !swapForm.fromAmount || !swapForm.toAmount}
              style={{ 
                background: loading ? theme.colors.background.primary : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
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
            <div className="swap-history-card" style={{ 
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div className="card-header">
                <h3 style={{ color: theme.colors.text.primary }}>Recent Swaps</h3>
                <span style={{ color: theme.colors.text.secondary }}>{swapHistory.length} transactions</span>
              </div>
              <div className="history-list">
                {swapHistory.slice(0, 3).map(swap => (
                  <div 
                    key={swap.id}
                    className="history-item"
                    style={{ 
                      background: theme.colors.background.primary,
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
        </div>

        {/* Right Column - Currencies & Security */}
        <div className="market-info-column">
          {/* Available Currencies */}
          <div className="currencies-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Available Currencies</h3>
              <span style={{ color: theme.colors.text.secondary }}>{currencies.length} assets</span>
            </div>
            <div className="currencies-list">
              {currencies.map(currency => (
                <div 
                  key={currency.id}
                  className="currency-item"
                  style={{ 
                    background: theme.colors.background.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  <div className="currency-info">
                    <div className="currency-icon">{getCurrencyIcon(currency.id)}</div>
                    <div className="currency-details">
                      <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>{currency.symbol}</span>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>{currency.name}</span>
                    </div>
                  </div>
                  <div className="currency-stats">
                    <div className="currency-price" style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>
                      {showBalances ? formatPrice(currency.price) : '••••••'}
                    </div>
                    <div 
                      className="currency-change"
                      style={{ 
                        color: currency.change >= 0 ? '#10b981' : '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {currency.change >= 0 ? '+' : ''}{currency.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Info */}
          <div className="security-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Security</h3>
              <FiShield style={{ color: theme.colors.primary }} />
            </div>
            <div className="security-info">
              <div className="security-item">
                <FiShield style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  MPC-protected transactions
                </span>
              </div>
              <div className="security-item">
                <FiClock style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  {swapForm.estimatedTime} processing time
                </span>
              </div>
              <div className="security-item">
                <FiTrendingUp style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  Best rates guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapModule;