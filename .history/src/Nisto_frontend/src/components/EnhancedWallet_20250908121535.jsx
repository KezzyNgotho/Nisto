import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiDollarSign, 
  FiPlus, 
  FiSend, 
  FiDownload, 
  FiCopy, 
  FiCheck, 
  FiEye,
  FiEyeOff,
  FiX,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiShield,
  FiStar
} from 'react-icons/fi';
import { BiCoin, BiWallet } from 'react-icons/bi';
import './EnhancedWallet.scss';

const EnhancedWallet = () => {
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
      change: 0.00,
      balance: 1250.50,
      color: '#26a17b'
    },
    { 
      id: 'USDC', 
      name: 'USD Coin', 
      symbol: 'USDC', 
      icon: '🪙',
      price: 1.00,
      change: 0.00,
      balance: 850.25,
      color: '#2775ca'
    },
    { 
      id: 'DAI', 
      name: 'Dai Stablecoin', 
      symbol: 'DAI', 
      icon: '🟡',
      price: 1.00,
      change: 0.01,
      balance: 420.75,
      color: '#f5ac37'
    },
    { 
      id: 'NST', 
      name: 'Nisto Token', 
      symbol: 'NST', 
      icon: '🚀',
      price: 0.85,
      change: 5.25,
      balance: 1500.00,
      color: '#8b5cf6'
    },
    { 
      id: 'KES', 
      name: 'Kenyan Shilling', 
      symbol: 'KES', 
      icon: '🇰🇪',
      price: 0.0065,
      change: -0.5,
      balance: 50000.00,
      color: '#10b981'
    }
  ]);

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);

  const [sendForm, setSendForm] = useState({
    amount: '',
    toAddress: '',
    description: '',
    currency: selectedCurrency.id
  });

  const [depositForm, setDepositForm] = useState({
    amount: '',
    description: '',
    currency: selectedCurrency.id
  });

  const [swapForm, setSwapForm] = useState({
    fromCurrency: selectedCurrency.id,
    toCurrency: 'USDT',
    amount: '',
    rate: 1.00
  });

  // Mock portfolio data
  const [portfolioStats] = useState({
    totalValue: 4021.50,
    totalChange: 4.75,
    totalChangePercent: 0.12,
    assets: 5,
    transactions: 24
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadWalletData();
    }
  }, [isAuthenticated]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Mock data loading - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setLoading(false);
    }
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setShowCurrencyDropdown(false);
    setSendForm(prev => ({ ...prev, currency: currency.id }));
    setDepositForm(prev => ({ ...prev, currency: currency.id }));
  };

  const handleSend = async () => {
    if (!sendForm.amount || !sendForm.toAddress) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock send transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(`Successfully sent ${sendForm.amount} ${sendForm.currency}`, 'success');
      setShowSendModal(false);
      setSendForm({ amount: '', toAddress: '', description: '', currency: selectedCurrency.id });
      loadWalletData();
    } catch (error) {
      showToast('Failed to send transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositForm.amount) {
      showToast('Please enter deposit amount', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock deposit transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(`Successfully deposited ${depositForm.amount} ${depositForm.currency}`, 'success');
      setShowDepositModal(false);
      setDepositForm({ amount: '', description: '', currency: selectedCurrency.id });
      loadWalletData();
    } catch (error) {
      showToast('Failed to process deposit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!swapForm.amount) {
      showToast('Please enter swap amount', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(`Successfully swapped ${swapForm.amount} ${swapForm.fromCurrency} to ${swapForm.toCurrency}`, 'success');
      setShowSwapModal(false);
      setSwapForm(prev => ({ ...prev, amount: '' }));
      loadWalletData();
    } catch (error) {
      showToast('Failed to process swap', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
    showToast(`${type} copied to clipboard`, 'success');
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

  return (
    <div className="enhanced-wallet" style={{ background: theme.colors.background.primary }}>
      {/* Header */}
      <div className="wallet-header">
        <div className="header-left">
          <h2 style={{ color: theme.colors.text.primary }}>Multi-Currency Wallet</h2>
          <p style={{ color: theme.colors.text.secondary }}>
            Manage your digital assets across multiple currencies
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={loadWalletData}
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

      {/* Portfolio Overview */}
      <div className="portfolio-overview">
        <div className="portfolio-card" style={{ 
          background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div className="portfolio-header">
            <h3 style={{ color: theme.colors.text.primary }}>Portfolio Value</h3>
            <div className="portfolio-change" style={{ 
              color: portfolioStats.totalChange >= 0 ? '#10b981' : '#ef4444' 
            }}>
              <FiTrendingUp />
              {portfolioStats.totalChange >= 0 ? '+' : ''}{portfolioStats.totalChangePercent}%
            </div>
          </div>
          <div className="portfolio-value">
            {showBalances ? (
              <span style={{ color: theme.colors.text.primary }}>
                {formatPrice(portfolioStats.totalValue)}
              </span>
            ) : (
              <span style={{ color: theme.colors.text.secondary }}>••••••</span>
            )}
          </div>
          <div className="portfolio-stats">
            <div className="stat">
              <span style={{ color: theme.colors.text.secondary }}>Assets</span>
              <span style={{ color: theme.colors.text.primary }}>{portfolioStats.assets}</span>
            </div>
            <div className="stat">
              <span style={{ color: theme.colors.text.secondary }}>Transactions</span>
              <span style={{ color: theme.colors.text.primary }}>{portfolioStats.transactions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="currency-section">
        <div className="currency-selector">
          <label style={{ color: theme.colors.text.primary }}>Select Currency</label>
          <div className="currency-dropdown">
            <button 
              className="currency-select-btn"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              style={{ 
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text.primary
              }}
            >
              <div className="selected-currency">
                <span className="currency-icon">{selectedCurrency.icon}</span>
                <span className="currency-name">{selectedCurrency.name}</span>
                <span className="currency-symbol">({selectedCurrency.symbol})</span>
              </div>
              {showCurrencyDropdown ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {showCurrencyDropdown && (
              <div className="currency-options" style={{ 
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border}`
              }}>
                {currencies.map(currency => (
                  <button
                    key={currency.id}
                    className={`currency-option ${selectedCurrency.id === currency.id ? 'selected' : ''}`}
                    onClick={() => handleCurrencySelect(currency)}
                    style={{ 
                      color: theme.colors.text.primary,
                      background: selectedCurrency.id === currency.id ? theme.colors.primary + '20' : 'transparent'
                    }}
                  >
                    <span className="currency-icon">{currency.icon}</span>
                    <div className="currency-info">
                      <span className="currency-name">{currency.name}</span>
                      <span className="currency-symbol">{currency.symbol}</span>
                    </div>
                    <div className="currency-balance">
                      {showBalances ? formatBalance(currency.balance) : '••••'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Currency Details */}
      <div className="currency-details">
        <div className="currency-card" style={{ 
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div className="currency-header">
            <div className="currency-info">
              <span className="currency-icon-large">{selectedCurrency.icon}</span>
              <div>
                <h3 style={{ color: theme.colors.text.primary }}>{selectedCurrency.name}</h3>
                <p style={{ color: theme.colors.text.secondary }}>{selectedCurrency.symbol}</p>
              </div>
            </div>
            <div className="currency-price">
              <span style={{ color: theme.colors.text.primary }}>
                {formatPrice(selectedCurrency.price)}
              </span>
              <span 
                className="price-change"
                style={{ 
                  color: selectedCurrency.change >= 0 ? '#10b981' : '#ef4444' 
                }}
              >
                {selectedCurrency.change >= 0 ? '+' : ''}{selectedCurrency.change}%
              </span>
            </div>
          </div>
          
          <div className="currency-balance">
            <div className="balance-amount">
              {showBalances ? (
                <span style={{ color: theme.colors.text.primary }}>
                  {formatBalance(selectedCurrency.balance)} {selectedCurrency.symbol}
                </span>
              ) : (
                <span style={{ color: theme.colors.text.secondary }}>•••••• {selectedCurrency.symbol}</span>
              )}
            </div>
            <div className="balance-usd">
              {showBalances ? (
                <span style={{ color: theme.colors.text.secondary }}>
                  ≈ {formatPrice(selectedCurrency.balance * selectedCurrency.price)}
                </span>
              ) : (
                <span style={{ color: theme.colors.text.secondary }}>≈ ••••••</span>
              )}
            </div>
          </div>

          <div className="currency-actions">
            <button 
              className="action-btn send-btn"
              onClick={() => setShowSendModal(true)}
              style={{ 
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                color: theme.colors.white
              }}
            >
              <FiSend />
              Send
            </button>
            <button 
              className="action-btn receive-btn"
              onClick={() => setShowDepositModal(true)}
              style={{ 
                background: theme.colors.background.primary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <FiDownload />
              Receive
            </button>
            <button 
              className="action-btn swap-btn"
              onClick={() => setShowSwapModal(true)}
              style={{ 
                background: theme.colors.background.primary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <FiArrowUpDown />
              Swap
            </button>
          </div>
        </div>
      </div>

      {/* All Currencies Overview */}
      <div className="all-currencies">
        <h3 style={{ color: theme.colors.text.primary }}>All Assets</h3>
        <div className="currencies-grid">
          {currencies.map(currency => (
            <div 
              key={currency.id}
              className={`currency-item ${selectedCurrency.id === currency.id ? 'active' : ''}`}
              onClick={() => handleCurrencySelect(currency)}
              style={{ 
                background: theme.colors.background.secondary,
                border: `1px solid ${selectedCurrency.id === currency.id ? theme.colors.primary : theme.colors.border}`
              }}
            >
              <div className="currency-item-header">
                <span className="currency-icon">{currency.icon}</span>
                <div className="currency-item-info">
                  <span style={{ color: theme.colors.text.primary }}>{currency.symbol}</span>
                  <span style={{ color: theme.colors.text.secondary }}>{currency.name}</span>
                </div>
                {selectedCurrency.id === currency.id && (
                  <FiStar style={{ color: theme.colors.primary }} />
                )}
              </div>
              <div className="currency-item-balance">
                {showBalances ? (
                  <span style={{ color: theme.colors.text.primary }}>
                    {formatBalance(currency.balance)}
                  </span>
                ) : (
                  <span style={{ color: theme.colors.text.secondary }}>••••••</span>
                )}
              </div>
              <div className="currency-item-value">
                {showBalances ? (
                  <span style={{ color: theme.colors.text.secondary }}>
                    {formatPrice(currency.balance * currency.price)}
                  </span>
                ) : (
                  <span style={{ color: theme.colors.text.secondary }}>••••••</span>
                )}
              </div>
              <div 
                className="currency-item-change"
                style={{ 
                  color: currency.change >= 0 ? '#10b981' : '#ef4444' 
                }}
              >
                {currency.change >= 0 ? '+' : ''}{currency.change}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <div className="modal-header">
              <h3 style={{ color: theme.colors.text.primary }}>Send {selectedCurrency.symbol}</h3>
              <button 
                onClick={() => setShowSendModal(false)}
                style={{ color: theme.colors.text.secondary }}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label style={{ color: theme.colors.text.primary }}>Amount</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    style={{ 
                      background: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border}`
                    }}
                  />
                  <span className="input-suffix" style={{ color: theme.colors.text.secondary }}>
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label style={{ color: theme.colors.text.primary }}>To Address</label>
                <input
                  type="text"
                  value={sendForm.toAddress}
                  onChange={(e) => setSendForm(prev => ({ ...prev, toAddress: e.target.value }))}
                  placeholder="Enter recipient address"
                  style={{ 
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                />
              </div>
              <div className="form-group">
                <label style={{ color: theme.colors.text.primary }}>Description (Optional)</label>
                <input
                  type="text"
                  value={sendForm.description}
                  onChange={(e) => setSendForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a note"
                  style={{ 
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowSendModal(false)}
                style={{ 
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border}`
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSend}
                disabled={loading}
                style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: theme.colors.white
                }}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <div className="modal-header">
              <h3 style={{ color: theme.colors.text.primary }}>Receive {selectedCurrency.symbol}</h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                style={{ color: theme.colors.text.secondary }}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="deposit-address">
                <label style={{ color: theme.colors.text.primary }}>Your {selectedCurrency.symbol} Address</label>
                <div className="address-container">
                  <input
                    type="text"
                    value={`${selectedCurrency.symbol.toLowerCase()}_address_${user?.id || 'user'}_${Date.now()}`}
                    readOnly
                    style={{ 
                      background: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border}`
                    }}
                  />
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(`${selectedCurrency.symbol.toLowerCase()}_address_${user?.id || 'user'}_${Date.now()}`, 'Address')}
                    style={{ 
                      background: theme.colors.primary,
                      color: theme.colors.white
                    }}
                  >
                    {copiedAddress === 'Address' ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
              <div className="deposit-info">
                <div className="info-item">
                  <FiShield style={{ color: theme.colors.primary }} />
                  <span style={{ color: theme.colors.text.secondary }}>
                    Only send {selectedCurrency.symbol} to this address
                  </span>
                </div>
                <div className="info-item">
                  <FiActivity style={{ color: theme.colors.primary }} />
                  <span style={{ color: theme.colors.text.secondary }}>
                    Transactions may take a few minutes to confirm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="modal-overlay" onClick={() => setShowSwapModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <div className="modal-header">
              <h3 style={{ color: theme.colors.text.primary }}>Swap Currencies</h3>
              <button 
                onClick={() => setShowSwapModal(false)}
                style={{ color: theme.colors.text.secondary }}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="swap-container">
                <div className="swap-from">
                  <label style={{ color: theme.colors.text.primary }}>From</label>
                  <div className="swap-input-group">
                    <input
                      type="number"
                      value={swapForm.amount}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      style={{ 
                        background: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    />
                    <select
                      value={swapForm.fromCurrency}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, fromCurrency: e.target.value }))}
                      style={{ 
                        background: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="swap-arrow">
                  <FiArrowUpDown style={{ color: theme.colors.primary }} />
                </div>
                
                <div className="swap-to">
                  <label style={{ color: theme.colors.text.primary }}>To</label>
                  <div className="swap-input-group">
                    <input
                      type="number"
                      value={(parseFloat(swapForm.amount) * swapForm.rate).toFixed(6)}
                      readOnly
                      style={{ 
                        background: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    />
                    <select
                      value={swapForm.toCurrency}
                      onChange={(e) => setSwapForm(prev => ({ ...prev, toCurrency: e.target.value }))}
                      style={{ 
                        background: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="swap-rate">
                <span style={{ color: theme.colors.text.secondary }}>
                  Rate: 1 {swapForm.fromCurrency} = {swapForm.rate} {swapForm.toCurrency}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowSwapModal(false)}
                style={{ 
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border}`
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSwap}
                disabled={loading}
                style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: theme.colors.white
                }}
              >
                {loading ? 'Swapping...' : 'Swap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedWallet;
