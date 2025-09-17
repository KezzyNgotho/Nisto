import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FiArrowDown, 
  FiLoader,
  FiRepeat,
  FiZap,
  FiGlobe,
  FiShield,
  FiSettings,
  FiCpu,
  FiTrendingUp,
  FiAlertTriangle
} from 'react-icons/fi';
import MarketDataService from '../services/MarketDataService';
import OneInchService from '../services/OneInchService';
import SmartWalletService from '../services/SmartWalletService';
import './SwapInterface.scss';

const SwapInterface = ({ onSwapComplete }) => {
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
  const [userPreferences, setUserPreferences] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [autoSwapEnabled, setAutoSwapEnabled] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

  // Load tokens and user preferences on component mount
  useEffect(() => {
    loadTokens();
    loadUserPreferences();
  }, []);

  // Load user preferences from SmartWallet
  const loadUserPreferences = async () => {
    try {
      const userId = 'user_' + Date.now(); // In production, get from auth context
      const preferences = await SmartWalletService.getUserPreferences(userId);
      
      if (preferences) {
        setUserPreferences(preferences);
        setAutoSwapEnabled(preferences.autoHedgingEnabled);
        setSelectedProvider(preferences.preferredSwapProvider || 'auto');
      } else {
        // Set default preferences
        const defaultPreferences = {
          thresholdPercentage: 20,
          timeWindowMinutes: 60,
          stablecoinPreference: 'USDC',
          autoHedgingEnabled: false,
          allocationLimit: 50,
          intermediaryTokenPreference: 'USDC',
          preferredSwapProvider: 'auto'
        };
        setUserPreferences(defaultPreferences);
        await SmartWalletService.saveUserPreferences(userId, defaultPreferences);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  // Load tokens from market data service
  const loadTokens = async () => {
    try {
      const marketData = await MarketDataService.getAllCurrencies();
      setTokens(marketData);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      toast.error('Failed to load tokens');
    }
  };

  // Get token by ID
  const getToken = (tokenId) => {
    return tokens.find(token => token.id === tokenId);
  };

  // Filter tokens based on search
  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    token.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
  );

  // Calculate exchange rates
  const calculateExchangeRate = (fromTokenId, toTokenId) => {
    const fromTokenData = getToken(fromTokenId);
    const toTokenData = getToken(toTokenId);
    
    if (!fromTokenData || !toTokenData) return 0;
    return fromTokenData.current_price / toTokenData.current_price;
  };

  // Fetch swap quote with intelligent routing
  const fetchSwapQuote = useCallback(async (from, to, amount) => {
    if (!from || !to || amount <= 0) return null;

    setLoadingQuote(true);
    try {
      const fromTokenData = getToken(from);
      const toTokenData = getToken(to);
      
      if (!fromTokenData || !toTokenData) return null;

      console.log(`🔄 SwapInterface: Getting quote for ${fromTokenData.symbol} → ${toTokenData.symbol}`);

      // Handle different providers based on selection
      if (selectedProvider === '1inch') {
        try {
          const oneInchRate = await OneInchService.getRealTimePrice(fromTokenData.symbol, toTokenData.symbol);
          if (oneInchRate > 0) {
            return {
              fromAmount: amount,
              toAmount: amount * oneInchRate,
              exchangeRate: oneInchRate,
              reverseExchangeRate: 1 / oneInchRate,
              priceImpact: 0.1,
              fees: { network: 0.001, protocol: 0.003 },
              provider: '1INCH',
              estimatedTime: '30s-5min'
            };
          }
        } catch (error) {
          console.warn('1inch not available for these tokens, falling back to ICP DEX');
        }
      } else if (selectedProvider === 'auto') {
        // Try 1inch first, then fallback to ICP DEX
        try {
          const oneInchRate = await OneInchService.getRealTimePrice(fromTokenData.symbol, toTokenData.symbol);
          if (oneInchRate > 0) {
            return {
              fromAmount: amount,
              toAmount: amount * oneInchRate,
              exchangeRate: oneInchRate,
              reverseExchangeRate: 1 / oneInchRate,
              priceImpact: 0.1,
              fees: { network: 0.001, protocol: 0.003 },
              provider: '1INCH',
              estimatedTime: '30s-5min'
            };
          }
        } catch (error) {
          console.warn('1inch not available, using ICP DEX');
        }
      }
      
      // Fallback to calculated rate
      const rate = calculateExchangeRate(from, to);
      if (rate > 0) {
      const quote = {
        fromAmount: amount,
          toAmount: amount * rate,
          exchangeRate: rate,
          reverseExchangeRate: 1 / rate,
        priceImpact: 0.05,
        fees: {
            network: 0,
            protocol: 0
        },
          provider: 'ICP_DEX',
          estimatedTime: '2-10s'
      };
      return quote;
      }

      return null;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    } finally {
      setLoadingQuote(false);
    }
  }, [tokens, selectedProvider]);

  // Handle amount changes
  const handleFromAmountChange = async (value) => {
    setFromAmount(value);
    if (value && fromToken && toToken) {
      const quote = await fetchSwapQuote(fromToken, toToken, parseFloat(value));
      if (quote) {
        setSwapQuote(quote);
          setToAmount(quote.toAmount.toFixed(6));
        }
    }
  };

  const handleToAmountChange = async (value) => {
    setToAmount(value);
    if (value && fromToken && toToken) {
      const quote = await fetchSwapQuote(toToken, fromToken, parseFloat(value));
      if (quote) {
        setSwapQuote({
          ...quote,
          fromAmount: quote.toAmount,
          toAmount: quote.fromAmount,
          fromToken: toToken,
          toToken: fromToken
        });
        setFromAmount(quote.toAmount.toFixed(6));
      }
    }
  };

  // AI Analysis and Auto-Swap
  const performAIAnalysis = useCallback(async () => {
    if (!userPreferences || !autoSwapEnabled) return;

    try {
      const userId = 'user_' + Date.now(); // In production, get from auth context
      const currentPortfolio = [
        { symbol: fromToken, amount: parseFloat(fromAmount) || 0, change24h: getToken(fromToken)?.change24h || 0 }
      ];
      
      const marketData = await MarketDataService.getAllCurrencies();
      const analysis = await SmartWalletService.analyzePortfolioAndSwap(userId, currentPortfolio, marketData);
      
      setAiAnalysis(analysis);
      
      if (analysis.shouldSwap) {
        toast.success(`AI recommends swap: ${analysis.reason}`);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis failed: ' + error.message);
    }
  }, [userPreferences, autoSwapEnabled, fromToken, fromAmount, tokens]);

  // Execute swap with SmartWallet integration
  const executeSwap = async () => {
    if (!swapQuote) return;

    setSwapStatus({
      isSwapping: true,
      currentStep: 'Initializing swap...',
      progress: 10,
      error: null
    });

    try {
      const userId = 'user_' + Date.now(); // In production, get from auth context
      
      // Record swap in SmartWallet
      await SmartWalletService.addSwapRecord(userId, {
        fromToken: getToken(fromToken)?.symbol || fromToken,
        toToken: getToken(toToken)?.symbol || toToken,
        amount: parseFloat(fromAmount),
        price: swapQuote.exchangeRate,
        reason: 'Manual swap initiated by user',
        status: 'pending',
        errorMessage: null,
        intermediarySteps: [swapQuote.provider],
        retryCount: 0,
        estimatedCompletionTime: Date.now() + 300000, // 5 minutes
        gasCost: swapQuote.fees?.network + swapQuote.fees?.protocol || 0.001,
        swapType: 'manual',
        swapProvider: swapQuote.provider
      });

      // Simulate swap process
      const steps = [
        { step: 'Validating transaction...', progress: 25 },
        { step: 'Submitting to network...', progress: 50 },
        { step: 'Confirming transaction...', progress: 75 },
        { step: 'Finalizing swap...', progress: 100 }
      ];

      for (const { step, progress } of steps) {
        setSwapStatus(prev => ({ ...prev, currentStep: step, progress }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update swap record with success
      await SmartWalletService.addSwapRecord(userId, {
        fromToken: getToken(fromToken)?.symbol || fromToken,
        toToken: getToken(toToken)?.symbol || toToken,
        amount: parseFloat(fromAmount),
        price: swapQuote.exchangeRate,
        reason: 'Manual swap completed successfully',
        status: 'completed',
        errorMessage: null,
        intermediarySteps: [swapQuote.provider],
        retryCount: 0,
        estimatedCompletionTime: Date.now(),
        gasCost: swapQuote.fees?.network + swapQuote.fees?.protocol || 0.001,
        swapType: 'manual',
        swapProvider: swapQuote.provider
      });

      // Complete swap
      setSwapStatus({
        isSwapping: false,
        currentStep: 'Swap completed!',
        progress: 100,
        error: null
      });

      // Add to history
      if (onSwapComplete) {
        onSwapComplete({
          fromToken: getToken(fromToken),
          toToken: getToken(toToken),
          fromAmount: swapQuote.fromAmount,
          toAmount: swapQuote.toAmount,
          timestamp: new Date(),
          status: 'completed'
        });
      }

      toast.success('Swap completed successfully!');
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setSwapQuote(null);

    } catch (error) {
      setSwapStatus({ 
        isSwapping: false, 
        currentStep: '', 
        progress: 0, 
        error: error.message
      });
      toast.error('Swap failed: ' + error.message);
    }
  };

  // Update user preferences
  const updateUserPreferences = async (newPreferences) => {
    try {
      const userId = 'user_' + Date.now(); // In production, get from auth context
      await SmartWalletService.updateUserPreferences(userId, newPreferences);
      setUserPreferences(newPreferences);
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };


  return (
    <div className="swap-interface">



      {/* Swap Controls */}
      <div className="swap-controls">
        {/* AI Auto-Swap Controls */}
        <div className="ai-controls">
          <div className="ai-header">
            <div className="ai-title">
              <FiCpu className="ai-icon" />
              <span>AI Auto-Swap</span>
            </div>
            <div className="ai-actions">
              <button 
                className={`ai-toggle ${autoSwapEnabled ? 'enabled' : 'disabled'}`}
                onClick={() => {
                  const newEnabled = !autoSwapEnabled;
                  setAutoSwapEnabled(newEnabled);
                  if (userPreferences) {
                    updateUserPreferences({
                      ...userPreferences,
                      autoHedgingEnabled: newEnabled
                    });
                  }
                }}
              >
                {autoSwapEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <button 
                className="ai-settings-button"
                onClick={() => setShowAISettings(!showAISettings)}
              >
                <FiSettings className="settings-icon" />
              </button>
            </div>
          </div>

          {autoSwapEnabled && (
            <div className="ai-status">
              <button 
                className="ai-analyze-button"
                onClick={performAIAnalysis}
                disabled={!fromToken || !fromAmount}
              >
                <FiTrendingUp className="analyze-icon" />
                <span>Analyze Portfolio</span>
              </button>
              
              {aiAnalysis && (
                <div className="ai-analysis-result">
                  {aiAnalysis.shouldSwap ? (
                    <div className="ai-recommendation positive">
                      <FiAlertTriangle className="recommendation-icon" />
                      <div className="recommendation-content">
                        <div className="recommendation-title">AI Recommendation</div>
                        <div className="recommendation-text">{aiAnalysis.reason}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="ai-recommendation neutral">
                      <FiTrendingUp className="recommendation-icon" />
                      <div className="recommendation-content">
                        <div className="recommendation-title">Portfolio Analysis</div>
                        <div className="recommendation-text">No immediate action needed</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showAISettings && userPreferences && (
            <div className="ai-settings-panel">
              <div className="settings-section">
                <label className="settings-label">Risk Threshold (%)</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={userPreferences.thresholdPercentage}
                  onChange={(e) => updateUserPreferences({
                    ...userPreferences,
                    thresholdPercentage: parseInt(e.target.value)
                  })}
                  className="settings-slider"
                />
                <span className="settings-value">{userPreferences.thresholdPercentage}%</span>
              </div>
              
              <div className="settings-section">
                <label className="settings-label">Stablecoin Preference</label>
                <select
                  value={userPreferences.stablecoinPreference}
                  onChange={(e) => updateUserPreferences({
                    ...userPreferences,
                    stablecoinPreference: e.target.value
                  })}
                  className="settings-select"
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>

              <div className="settings-section">
                <label className="settings-label">Preferred Provider</label>
                <select
                  value={userPreferences.preferredSwapProvider || 'auto'}
                  onChange={(e) => {
                    const provider = e.target.value;
                    setSelectedProvider(provider);
                    updateUserPreferences({
                      ...userPreferences,
                      preferredSwapProvider: provider
                    });
                  }}
                  className="settings-select"
                >
                  <option value="auto">Auto (Best Rate)</option>
                  <option value="1inch">1inch</option>
                  <option value="icp">ICP DEX</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Provider Selection */}
        <div className="provider-selection">
          <label className="provider-label">Swap Provider</label>
          <div className="provider-options">
            <button 
              className={`provider-option ${selectedProvider === 'auto' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('auto')}
            >
              <FiZap className="provider-icon" />
              <span className="provider-name">Auto</span>
              <span className="provider-desc">Best Rate</span>
            </button>
            <button 
              className={`provider-option ${selectedProvider === '1inch' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('1inch')}
            >
              <FiGlobe className="provider-icon" />
              <span className="provider-name">1inch</span>
              <span className="provider-desc">DEX Aggregator</span>
            </button>
            <button 
              className={`provider-option ${selectedProvider === 'icp' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('icp')}
            >
              <FiShield className="provider-icon" />
              <span className="provider-name">ICP DEX</span>
              <span className="provider-desc">Native</span>
            </button>
          </div>
        </div>

        <div className="swap-form-section">
          <div className="swap-form">
            {/* Token Sections Container */}
            <div className="token-sections-container">
              {/* From Token */}
              <div className="token-section">
              <div className="token-header">
                <label className="token-label">From</label>
              </div>
              <div className="token-input-group">
                <div className="token-selector">
                  <select 
                    value={fromToken} 
                    onChange={(e) => setFromToken(e.target.value)}
                    className="token-select"
                  >
                    <option value="">Select token</option>
                    {filteredTokens.map(token => (
                      <option key={token.id} value={token.id}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="amount-input"
                  />
                  <button className="max-button">MAX</button>
                </div>
                </div>
              </div>

            {/* To Token */}
            <div className="token-section">
              <div className="token-header">
                <label className="token-label">To</label>
              </div>
              <div className="token-input-group">
                <div className="token-selector">
                  <select 
                    value={toToken} 
                    onChange={(e) => setToToken(e.target.value)}
                    className="token-select"
                  >
                    <option value="">Select token</option>
                    {filteredTokens.map(token => (
                      <option key={token.id} value={token.id}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
          </div>
                <div className="amount-input-wrapper">
                  <input
                type="number"
                value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="amount-input"
                  />
                </div>
              </div>
            </div>
            </div>

          {/* Swap Button */}
            <button
              className="swap-button"
              onClick={executeSwap}
              disabled={!swapQuote || swapStatus.isSwapping}
            >
            {swapStatus.isSwapping ? (
              <>
                  <FiLoader className="button-icon spinning" />
                Swapping...
              </>
            ) : (
              <>
                  <FiRepeat className="button-icon" />
                  Swap Tokens
              </>
            )}
            </button>
          </div>
                  </div>
                </div>
                

    </div>
  );
};

export default SwapInterface;