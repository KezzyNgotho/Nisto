import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FiArrowDown, 
  FiLoader,
  FiRepeat,
  FiZap,
  FiGlobe,
  FiShield,
  FiChevronDown,
  FiRefreshCw,
  FiMaximize2
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import MarketDataService from '../services/MarketDataService';
import OneInchService from '../services/OneInchService';
import SmartWalletService from '../services/SmartWalletService';
import BackendService from '../services/BackendService';
import './SwapInterface.scss';

const SwapInterface = ({ onSwapComplete, settings, onSettingsChange }) => {
  const { theme } = useTheme();
  const auth = useAuth();
  const [tokens, setTokens] = useState([]);
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapQuote, setSwapQuote] = useState(null);
  const [swapStatus, setSwapStatus] = useState({
    isSwapping: false,
    currentStep: '',
    progress: 0,
    error: null
  });
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [tokenSearch, setTokenSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [currentRate, setCurrentRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load tokens on component mount
  useEffect(() => {
    loadTokens();
  }, []);

  // Fetch real-time rate when fromToken or toToken changes
  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      fetchRealTimeRate();
    }
  }, [fromToken, toToken, selectedProvider]);


  const loadTokens = async () => {
    try {
      const marketData = await MarketDataService.getAllCurrencies();
      setTokens(marketData);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      toast.error('Failed to load tokens');
    }
  };

  const fetchRealTimeRate = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setRateLoading(true);
    try {
      let rate = null;
      
      if (selectedProvider === '1inch') {
        rate = await OneInchService.getRealTimePrice(fromToken.id, toToken.id, parseFloat(fromAmount));
      } else if (selectedProvider === 'icp') {
        rate = await ICDEXService.getExchangeRate(fromToken.id, toToken.id);
      } else {
        // Auto - try 1inch first, then fallback
        try {
          rate = await OneInchService.getRealTimePrice(fromToken.id, toToken.id, parseFloat(fromAmount));
        } catch {
          rate = await ICDEXService.getExchangeRate(fromToken.id, toToken.id);
        }
      }

      if (rate) {
        setCurrentRate({
          rate: rate.rate || rate,
          provider: selectedProvider === 'auto' ? 'Best Rate' : selectedProvider,
          lastUpdated: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to fetch real-time rate:', error);
      const fallbackRate = calculateExchangeRate(fromToken, toToken);
      if (fallbackRate) {
        setCurrentRate({
          rate: fallbackRate,
          provider: 'Market Data',
          lastUpdated: Date.now()
        });
      }
    } finally {
      setRateLoading(false);
    }
  };

  const calculateExchangeRate = (from, to) => {
    if (!from || !to || !from.current_price || !to.current_price) return null;
    return from.current_price / to.current_price;
  };

  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    setFromAmount(value);
    
    if (value && fromToken && toToken) {
      const rate = currentRate?.rate || calculateExchangeRate(fromToken, toToken);
      if (rate) {
        setToAmount((parseFloat(value) * rate).toFixed(6));
      }
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (e) => {
    const value = e.target.value;
    setToAmount(value);
    
    if (value && fromToken && toToken) {
      const rate = currentRate?.rate || calculateExchangeRate(fromToken, toToken);
      if (rate) {
        setFromAmount((parseFloat(value) / rate).toFixed(6));
      }
    } else {
      setFromAmount('');
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleTokenSelect = (token) => {
    if (showTokenSelector === 'from') {
      setFromToken(token);
    } else if (showTokenSelector === 'to') {
      setToToken(token);
    }
    setShowTokenSelector(null);
    setTokenSearch('');
  };

  const filteredTokens = useMemo(() => {
    if (!tokenSearch) return tokens.slice(0, 20);
    return tokens.filter(token => 
      token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
    ).slice(0, 20);
  }, [tokens, tokenSearch]);


  const analyzePortfolio = async () => {
    if (!auth?.principal || !auth?.backendService) return;
    setAiLoading(true);
    try {
      const currentPortfolio = tokens.map(t => ({
        tokenId: t.id,
        symbol: t.symbol,
        balance: t.balance || 0,
        price: t.current_price || 0
      }));
      const marketData = { timestamp: Date.now(), source: 'coingecko' };
      const result = await auth.backendService.analyzePortfolioAndSwap(auth.principal, currentPortfolio, marketData);
      setAiAnalysis(result);
      toast.success('Portfolio analysis complete');
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      toast.error('Portfolio analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const autoHedge = async () => {
    if (!auth?.principal || !auth?.backendService) return;
    setAiLoading(true);
    try {
      const currentPortfolio = tokens.map(t => ({
        tokenId: t.id,
        symbol: t.symbol,
        balance: t.balance || 0,
        price: t.current_price || 0
      }));
      const marketData = { timestamp: Date.now(), source: 'coingecko' };
      const result = await auth.backendService.autoHedgeNow(auth.principal, currentPortfolio, marketData);
      setAiAnalysis(result);
      if (result.shouldSwap) {
        toast.success('Auto-hedge executed successfully');
      } else {
        toast.info('No hedging needed at this time');
      }
    } catch (error) {
      console.error('Auto-hedge failed:', error);
      toast.error('Auto-hedge failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast.error('Please select tokens and enter amount');
      return;
    }

    setSwapStatus({
      isSwapping: true,
      currentStep: 'Getting quote...',
      progress: 10,
      error: null
    });

    try {
      setSwapStatus(prev => ({ ...prev, currentStep: 'Getting quote...', progress: 30 }));
      const quote = await OneInchService.getSwapQuote(
        fromToken.id,
        toToken.id,
        parseFloat(fromAmount)
      );

      if (!quote) {
        throw new Error('Failed to get swap quote');
      }

      setSwapStatus(prev => ({ ...prev, currentStep: 'Executing swap...', progress: 60 }));
      const result = await OneInchService.executeSwap(quote);

      if (result.success) {
        setSwapStatus(prev => ({ ...prev, currentStep: 'Swap completed!', progress: 100 }));
        
        await SmartWalletService.addSwapRecord({
          fromToken: fromToken.id,
          toToken: toToken.id,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount),
          rate: currentRate?.rate || calculateExchangeRate(fromToken, toToken),
          provider: selectedProvider,
          timestamp: Date.now(),
          txHash: result.txHash
        });

        toast.success('Swap completed successfully!');
        onSwapComplete && onSwapComplete(result);
        
        setFromAmount('');
        setToAmount('');
        setSwapQuote(null);
      } else {
        throw new Error(result.error || 'Swap failed');
      }
    } catch (error) {
      console.error('Swap failed:', error);
      setSwapStatus(prev => ({ 
        ...prev, 
        error: error.message,
        isSwapping: false 
      }));
      toast.error(`Swap failed: ${error.message}`);
    }
  };

  const providers = [
    { id: 'auto', name: 'Smart Swap', icon: FiZap, description: 'Best Rate' },
    { id: '1inch', name: 'Global Exchange', icon: FiGlobe, description: 'Multiple Sources' },
    { id: 'icp', name: 'Secure Exchange', icon: FiShield, description: 'Built-in Safety' }
  ];

  return (
    <div className="swap-interface" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background }}>
      {/* Provider Selection */}
      <div className="provider-section">
        <div className="provider-options">
          {providers.map(provider => {
            const Icon = provider.icon;
            return (
              <button
                key={provider.id}
                className={`provider-btn ${selectedProvider === provider.id ? 'active' : ''}`}
                onClick={() => setSelectedProvider(provider.id)}
                style={{
                  backgroundColor: selectedProvider === provider.id ? theme.colors.primary : 'transparent',
                  color: selectedProvider === provider.id ? theme.colors.white : theme.colors.text?.secondary || theme.colors.text
                }}
              >
                <Icon className="provider-icon" />
                <div className="provider-info">
                  <span className="provider-name">{provider.name}</span>
                  <span className="provider-desc">{provider.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Swap Card */}
        <div className="swap-card" style={{
          backgroundColor: theme.colors.background?.secondary || theme.colors.background,
          borderColor: theme.colors.border?.primary || theme.colors.border
        }}>
          {/* Token Inputs Row */}
          <div className="token-inputs-row">
            {/* From Token Input */}
            <div className="token-input-group from-token">
              <div className="input-label">From</div>
              <div className="token-input-container" style={{
                backgroundColor: theme.colors.background?.primary || theme.colors.background,
                borderColor: theme.colors.border?.primary || theme.colors.border
              }}>
                <div className="amount-section">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={handleFromAmountChange}
                    className="amount-input"
                    min="0"
                    style={{
                      color: theme.colors.text?.primary || theme.colors.text
                    }}
                  />
                  <button 
                    className="max-btn"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.white
                    }}
                  >
                    MAX
                  </button>
                </div>
                <button 
                  className="token-selector"
                  onClick={() => setShowTokenSelector('from')}
                  style={{
                    backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                    borderColor: theme.colors.border?.primary || theme.colors.border
                  }}
                >
                  {fromToken ? (
                    <div className="selected-token">
                      <img src={fromToken.image} alt={fromToken.symbol} className="token-icon" />
                      <span className="token-symbol" style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                        {fromToken.symbol.toUpperCase()}
                      </span>
                      <FiChevronDown className="chevron" style={{ color: theme.colors.text?.secondary || theme.colors.text }} />
                    </div>
                  ) : (
                    <div className="select-token" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                      <span>Select Token</span>
                      <FiChevronDown className="chevron" />
                    </div>
                  )}
                </button>
              </div>
              {fromToken && (
                <div className="token-balance" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                  Balance: {fromToken.balance || '0.00'} {fromToken.symbol.toUpperCase()}
                </div>
              )}
            </div>

            {/* Swap Direction Button */}
            <div className="swap-direction">
              <button 
                className="swap-direction-btn" 
                onClick={handleSwapTokens}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white
                }}
              >
                <FiArrowDown />
              </button>
            </div>

            {/* To Token Input */}
            <div className="token-input-group to-token">
              <div className="input-label">To</div>
              <div className="token-input-container" style={{
                backgroundColor: theme.colors.background?.primary || theme.colors.background,
                borderColor: theme.colors.border?.primary || theme.colors.border
              }}>
                <div className="amount-section">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={handleToAmountChange}
                    className="amount-input"
                    min="0"
                    style={{
                      color: theme.colors.text?.primary || theme.colors.text
                    }}
                  />
                </div>
                <button 
                  className="token-selector"
                  onClick={() => setShowTokenSelector('to')}
                  style={{
                    backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                    borderColor: theme.colors.border?.primary || theme.colors.border
                  }}
                >
                  {toToken ? (
                    <div className="selected-token">
                      <img src={toToken.image} alt={toToken.symbol} className="token-icon" />
                      <span className="token-symbol" style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                        {toToken.symbol.toUpperCase()}
                      </span>
                      <FiChevronDown className="chevron" style={{ color: theme.colors.text?.secondary || theme.colors.text }} />
                    </div>
                  ) : (
                    <div className="select-token" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                      <span>Select Token</span>
                      <FiChevronDown className="chevron" />
                    </div>
                  )}
                </button>
              </div>
              {toToken && (
                <div className="token-balance" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                  Balance: {toToken.balance || '0.00'} {toToken.symbol.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Rate Display */}
          {currentRate && (
            <div className="rate-display" style={{
              backgroundColor: theme.colors.background?.primary || theme.colors.background,
              borderColor: theme.colors.border?.primary || theme.colors.border
            }}>
              <div className="rate-info">
                <span className="rate-label" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>Rate:</span>
                <span className="rate-value" style={{ color: theme.colors.primary }}>
                  1 {fromToken?.symbol.toUpperCase()} = {currentRate.rate.toFixed(6)} {toToken?.symbol.toUpperCase()}
                </span>
              </div>
              <div className="rate-provider" style={{
                backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                color: theme.colors.text?.secondary || theme.colors.text
              }}>
                via {currentRate.provider}
                {rateLoading && <FiLoader className="loading-icon" />}
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            className={`swap-button ${(!fromToken || !toToken || !fromAmount || loadingQuote || swapStatus.isSwapping) ? 'disabled' : ''}`}
            onClick={handleSwap}
            disabled={!fromToken || !toToken || !fromAmount || loadingQuote || swapStatus.isSwapping}
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.white
            }}
          >
            {swapStatus.isSwapping ? (
              <>
                <FiLoader className="spinning" />
                {swapStatus.currentStep} ({swapStatus.progress}%)
              </>
            ) : (
              'Swap Tokens'
            )}
          </button>

          {/* Swap Progress */}
          {swapStatus.isSwapping && (
            <div className="swap-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${swapStatus.progress}%`,
                    backgroundColor: theme.colors.primary
                  }}
                />
              </div>
              <div className="progress-text" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                {swapStatus.currentStep}
              </div>
            </div>
          )}

          {/* Error Display */}
          {swapStatus.error && (
            <div className="error-display" style={{
              backgroundColor: theme.colors.error + '20',
              borderColor: theme.colors.error,
              color: theme.colors.error
            }}>
              <span>{swapStatus.error}</span>
            </div>
          )}
        </div>

        {/* AI Smart Wallet Actions */}
        {settings.autoHedging && (
          <div className="ai-actions-panel" style={{
            backgroundColor: theme.colors.background?.secondary || theme.colors.background,
            borderColor: theme.colors.border?.primary || theme.colors.border
          }}>
            <div className="ai-actions-header">
              <h4 style={{ color: theme.colors.text?.primary || theme.colors.text }}>AI Smart Wallet</h4>
              <div className="ai-status" style={{ color: theme.colors.primary }}>
                Risk Threshold: {settings.riskThreshold}% | Stablecoin: {settings.stablecoinPreference}
              </div>
            </div>
            
            <div className="ai-actions-buttons">
              <button
                className="analyze-btn"
                onClick={analyzePortfolio}
                disabled={aiLoading}
                style={{
                  backgroundColor: theme.colors.background?.primary || theme.colors.background,
                  borderColor: theme.colors.border?.primary || theme.colors.border,
                  color: theme.colors.text?.primary || theme.colors.text
                }}
              >
                {aiLoading ? 'Analyzing...' : 'Analyze Portfolio'}
              </button>
              <button
                className="auto-hedge-btn"
                onClick={autoHedge}
                disabled={aiLoading}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white
                }}
              >
                {aiLoading ? 'Hedging...' : 'Auto-Hedge Now'}
              </button>
            </div>

            {aiAnalysis && (
              <div className="ai-analysis-result" style={{
                backgroundColor: theme.colors.background?.primary || theme.colors.background,
                borderColor: theme.colors.border?.primary || theme.colors.border
              }}>
                <div className="analysis-content">
                  <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                    Risk Level: <span style={{ color: theme.colors.primary }}>{aiAnalysis.riskLevel || 'Medium'}</span>
                  </p>
                  <p style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                    Recommendation: <span style={{ color: theme.colors.primary }}>{aiAnalysis.recommendation || 'Hold'}</span>
                  </p>
                  {aiAnalysis.shouldSwap && (
                    <p style={{ color: theme.colors.primary }}>
                      ✅ Auto-hedge executed: {aiAnalysis.swapDetails || '10% of risky assets hedged'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Token Selector Modal */}
      {showTokenSelector && (
        <div className="token-selector-modal" onClick={() => setShowTokenSelector(null)}>
          <div className="token-selector-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: theme.colors.background?.secondary || theme.colors.background,
            borderColor: theme.colors.border?.primary || theme.colors.border
          }}>
            <div className="token-selector-header" style={{
              borderBottomColor: theme.colors.border?.primary || theme.colors.border
            }}>
              <h3 style={{ color: theme.colors.text?.primary || theme.colors.text }}>Select Token</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowTokenSelector(null)}
                style={{
                  backgroundColor: theme.colors.background?.primary || theme.colors.background,
                  color: theme.colors.text?.secondary || theme.colors.text
                }}
              >
                ×
              </button>
            </div>
            <div className="token-search" style={{
              borderBottomColor: theme.colors.border?.primary || theme.colors.border
            }}>
              <input
                type="text"
                placeholder="Search token..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                style={{
                  backgroundColor: theme.colors.background?.primary || theme.colors.background,
                  borderColor: theme.colors.border?.primary || theme.colors.border,
                  color: theme.colors.text?.primary || theme.colors.text
                }}
              />
            </div>
            <div className="token-list">
              {filteredTokens.map(token => (
                <button
                  key={token.id}
                  className="token-option"
                  onClick={() => handleTokenSelect(token)}
                  style={{
                    color: theme.colors.text?.primary || theme.colors.text
                  }}
                >
                  <div className="token-info">
                    <img src={token.image} alt={token.symbol} className="token-icon" />
                    <div className="token-details">
                      <span className="token-symbol" style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                        {token.symbol.toUpperCase()}
                      </span>
                      <span className="token-name" style={{ color: theme.colors.text?.secondary || theme.colors.text }}>
                        {token.name}
                      </span>
                    </div>
                  </div>
                  <span className="token-price" style={{ color: theme.colors.text?.primary || theme.colors.text }}>
                    ${token.current_price?.toFixed(2) || 'N/A'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInterface;