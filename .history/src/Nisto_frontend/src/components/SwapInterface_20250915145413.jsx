import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FiArrowRightLeft, 
  FiArrowDown, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiInfo,
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiZap,
  FiArrowLeftRight,
  FiWifi,
  FiGlobe,
  FiShield,
  FiClock,
  FiLayers,
  FiLoader,
  FiX,
  FiSettings,
  FiSwap
} from 'react-icons/fi';
import MarketDataService from '../services/MarketDataService';
import OneInchService from '../services/OneInchService';
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('auto');

  // Load tokens on component mount
  useEffect(() => {
    loadTokens();
  }, []);

  // Load tokens from market data service
  const loadTokens = async () => {
    try {
      const marketData = await MarketDataService.getMarketData();
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

      // Try 1inch first for real-time rates
      const oneInchRate = await OneInchService.getRealTimePrice(fromTokenData.symbol, toTokenData.symbol);
      if (oneInchRate > 0) {
        const quote = {
          fromAmount: amount,
          toAmount: amount * oneInchRate,
          exchangeRate: oneInchRate,
          reverseExchangeRate: 1 / oneInchRate,
          priceImpact: 0.1, // Simulated
          fees: {
            network: 0.001,
            protocol: 0.003
          },
          provider: '1INCH',
          estimatedTime: '30s-5min'
        };
        return quote;
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
  }, [tokens]);

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

  // Execute swap
  const executeSwap = async () => {
    if (!swapQuote) return;

      setSwapStatus({
        isSwapping: true,
      currentStep: 'Initializing swap...',
      progress: 10,
      error: null
    });

    try {
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
      setShowConfirmDialog(false);
      
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

  // Get provider badge
  const getProviderBadge = (provider) => {
    switch (provider) {
      case 'ICP_DEX':
        return (
          <span className="badge">
            <Network className="w-3 h-3" />
            <span>ICP DEX</span>
          </span>
        );
      case '1INCH':
        return (
          <span className="badge">
            <Globe className="w-3 h-3" />
            <span>1inch</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="swap-interface">
      {/* Header */}
      <div className="swap-header">
        <div className="swap-header-content">
          <div className="header-left">
            <h1 className="swap-title">
              <FiSwap className="title-icon" />
              Token Swap
            </h1>
          </div>

          <div className="header-center">
            <div className="swap-status">
              <div className="status-item">
                <span className="status-label">Provider</span>
                <span className="status-value">Auto-Routing</span>
              </div>
              <div className="status-item">
                <span className="status-label">Network</span>
                <span className="status-value">ICP</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button className="action-button" aria-label="Settings">
              <FiSettings className="icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Swap Status */}
      {swapStatus.isSwapping && (
        <div className="swap-status-alert">
          <div className="status-content">
            <FiRefreshCw className="status-icon spinning" />
            <div className="status-details">
              <div className="status-text">
                <strong>Swap in progress:</strong> {swapStatus.currentStep}
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{width: `${swapStatus.progress}%`}}></div>
              </div>
            </div>
            <div className="progress-percentage">{swapStatus.progress}%</div>
          </div>
        </div>
      )}

      {/* Swap Error */}
      {swapStatus.error && (
        <div className="swap-error-alert">
          <FiXCircle className="error-icon" />
          <div className="error-content">
            <strong>Swap Failed:</strong> {swapStatus.error}
          </div>
        </div>
      )}

      {/* Main Swap Interface */}
      <div className="swap-container">
        <div className="swap-form">
          {/* From Token */}
          <div className="token-section">
            <div className="token-header">
              <label className="token-label">From</label>
              <div className="token-balance">
                Balance: {getToken(fromToken)?.balance || '0.00'}
              </div>
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

          {/* Swap Arrow */}
          <div className="swap-arrow-container">
            <button className="swap-arrow-button">
              <FiArrowDown className="arrow-icon" />
            </button>
          </div>

          {/* To Token */}
          <div className="token-section">
            <div className="token-header">
              <label className="token-label">To</label>
              <div className="token-balance">
                Balance: {getToken(toToken)?.balance || '0.00'}
              </div>
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

          {/* Quote Information */}
          {swapQuote && (
            <div className="quote-section">
              <div className="quote-header">
                <span className="quote-title">Quote Details</span>
                <div className="provider-badge">
                  {getProviderBadge(swapQuote.provider)}
                </div>
              </div>
              <div className="quote-details">
                <div className="quote-item">
                  <span className="quote-label">Rate</span>
                  <span className="quote-value">
                    1 {getToken(fromToken)?.symbol} = {swapQuote.exchangeRate.toFixed(6)} {getToken(toToken)?.symbol}
                  </span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">Estimated Time</span>
                  <span className="quote-value">{swapQuote.estimatedTime}</span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">Price Impact</span>
                  <span className="quote-value">{swapQuote.priceImpact}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            className="swap-button"
            onClick={() => setShowConfirmDialog(true)}
            disabled={!swapQuote || swapStatus.isSwapping}
          >
            {swapStatus.isSwapping ? (
              <>
                <FiLoader className="button-icon spinning" />
                Swapping...
              </>
            ) : (
              <>
                <FiArrowRightLeft className="button-icon" />
                Swap Tokens
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Swap Interface */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <span>Swap Tokens</span>
            {swapQuote && getProviderBadge(swapQuote.provider)}
          </h3>
        </div>
        <div className="card-content">
          <div className="swap-form">
          {/* From Token */}
            <div className="swap-section">
              <label className="swap-label">From</label>
              <div className="token-input-group">
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
                <input
                type="number"
                value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
          </div>

            {/* Swap Arrow */}
            <div className="swap-arrow-container">
              <button className="swap-arrow-btn">
              <ArrowDown className="w-4 h-4" />
              </button>
          </div>

          {/* To Token */}
            <div className="swap-section">
              <label className="swap-label">To</label>
              <div className="token-input-group">
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
                <input
                type="number"
                value={toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
            </div>

            {/* Swap Quote Info */}
            {swapQuote && (
              <div className="quote-info">
                <div className="quote-details">
                  <div className="quote-item">
                    <span>Rate:</span>
                    <span>1 {getToken(fromToken)?.symbol} = {swapQuote.exchangeRate.toFixed(6)} {getToken(toToken)?.symbol}</span>
                  </div>
                  <div className="quote-item">
                    <span>Provider:</span>
                    {getProviderBadge(swapQuote.provider)}
                  </div>
                  <div className="quote-item">
                    <span>Estimated time:</span>
                    <span>{swapQuote.estimatedTime}</span>
                  </div>
                </div>
            </div>
          )}
          
            {/* Swap Button */}
            <button
              className="swap-btn"
              onClick={() => setShowConfirmDialog(true)}
              disabled={!swapQuote || swapStatus.isSwapping}
            >
              {swapStatus.isSwapping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Swapping...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  Swap Tokens
                </>
              )}
            </button>
                      </div>
                    </div>
                  </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Confirm Swap</h3>
              <button 
                className="dialog-close"
                onClick={() => setShowConfirmDialog(false)}
              >
                <X className="w-4 h-4" />
              </button>
                    </div>
            <div className="dialog-content">
              <div className="swap-summary">
                <div className="swap-item">
                  <span>You're swapping:</span>
                  <span>{fromAmount} {getToken(fromToken)?.symbol}</span>
                    </div>
                <div className="swap-item">
                  <span>You'll receive:</span>
                  <span>{toAmount} {getToken(toToken)?.symbol}</span>
                  </div>
                <div className="swap-item">
                  <span>Provider:</span>
                  {getProviderBadge(swapQuote?.provider)}
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={executeSwap}
                disabled={swapStatus.isSwapping}
              >
                {swapStatus.isSwapping ? 'Swapping...' : 'Confirm Swap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInterface;