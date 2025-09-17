import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  ArrowRightLeft, 
  ArrowDown, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  ArrowLeftRight,
  Network,
  Globe,
  Shield,
  Clock,
  Layers,
  Loader2,
  X
} from 'lucide-react';
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
      {/* Simple Header */}
      <div className="interface-header">
        <h2 className="interface-title">
          <ArrowRightLeft className="title-icon" />
          Token Swap
        </h2>
        <span className="routing-badge">
          <Zap className="badge-icon" />
          Auto-Routing
        </span>
      </div>

      {/* Swap Status Alert */}
      {swapStatus.isSwapping && (
        <div className="alert">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <div className="alert-description">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span><strong>Swap in progress:</strong> {swapStatus.currentStep}</span>
                <span className="text-sm">{swapStatus.progress}%</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{width: `${swapStatus.progress}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Error Alert */}
      {swapStatus.error && (
        <div className="alert alert-error">
          <XCircle className="h-4 w-4" />
          <div className="alert-description">
            <strong>Swap Failed:</strong> {swapStatus.error}
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Layers className="w-5 h-5" />
            <span>Swap Provider</span>
          </h3>
        </div>
        <div className="card-content">
          <div className="tabs">
            <div className="tabs-list">
              <button 
                className={`tab-trigger ${selectedProvider === 'auto' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('auto')}
              >
                <Zap className="w-4 h-4" />
                <span>Auto</span>
              </button>
              <button 
                className={`tab-trigger ${selectedProvider === 'ICP_DEX' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('ICP_DEX')}
              >
                <Network className="w-4 h-4" />
                <span>ICP DEX</span>
              </button>
              <button 
                className={`tab-trigger ${selectedProvider === '1INCH' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('1INCH')}
              >
                <Globe className="w-4 h-4" />
                <span>1inch</span>
              </button>
            </div>

            {selectedProvider === 'auto' && (
              <div className="tab-content mt-4">
                <div className="provider-info">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">Automatic Routing</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically selects the best provider: ICP DEX for zero-fee ICRC-1 swaps, 1inch for optimal EVM pricing.
                  </p>
                </div>
              </div>
            )}

            {selectedProvider === 'ICP_DEX' && (
              <div className="tab-content mt-4">
                <div className="provider-info icp-dex">
                  <div className="flex items-center space-x-2 mb-2">
                    <Network className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-600">ICP DEX</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Zero-fee swaps for ICRC-1 tokens on Internet Computer.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="badge">Zero fees</span>
                    <span className="badge">2-10 seconds</span>
                    <span className="badge">Low slippage</span>
                  </div>
                </div>
              </div>
            )}

            {selectedProvider === '1INCH' && (
              <div className="tab-content mt-4">
                <div className="provider-info oneinch">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-600">1inch</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Best prices across 100+ DEXs for EVM tokens.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="badge">Price aggregation</span>
                    <span className="badge">30s-5min</span>
                    <span className="badge">MEV protection</span>
                  </div>
                </div>
              </div>
            )}
          </div>
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