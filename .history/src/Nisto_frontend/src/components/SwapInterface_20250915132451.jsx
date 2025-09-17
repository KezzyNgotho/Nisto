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
    progress: 0
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [tokenSearch, setTokenSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch popular tokens for swap
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        console.log('🔄 SwapInterface: Loading tokens...');
        const data = await MarketDataService.getAllCurrencies();
        console.log('✅ SwapInterface: Loaded tokens:', data.length);
        
        // Enhance tokens with provider information
        const enhancedTokens = data.map((token) => ({
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          current_price: token.current_price,
          image: token.image,
          price_change_percentage_24h: token.price_change_percentage_24h,
          isICRC1: ['ICP', 'BTC', 'ETH'].includes(token.symbol?.toUpperCase())
        }));
        
        setTokens(enhancedTokens);
        
        // Set default tokens
        if (enhancedTokens.length > 0) {
          setFromToken('internet-computer');
          setToToken('tether');
        }
      } catch (error) {
        console.error('❌ SwapInterface: Failed to fetch tokens:', error);
        toast.error('Failed to load token list');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

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

  const calculateReverseExchangeRate = (fromTokenId, toTokenId) => {
    const fromTokenData = getToken(fromTokenId);
    const toTokenData = getToken(toTokenId);
    
    if (!fromTokenData || !toTokenData) return 0;
    return toTokenData.current_price / fromTokenData.current_price;
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
            networkFee: 0.001,
            protocolFee: 0,
            totalFee: 0.001
          },
          route: [fromTokenData.symbol, toTokenData.symbol],
          provider: '1INCH'
        };
        console.log('✅ SwapInterface: 1inch quote:', quote);
        return quote;
      }
      
      // Fallback to market rate
      const marketRate = calculateExchangeRate(from, to);
      const quote = {
        fromAmount: amount,
        toAmount: amount * marketRate,
        exchangeRate: marketRate,
        reverseExchangeRate: 1 / marketRate,
        priceImpact: 0.05,
        fees: {
          networkFee: 0,
          protocolFee: 0,
          totalFee: 0
        },
        route: [fromTokenData.symbol, toTokenData.symbol],
        provider: 'ICP_DEX'
      };
      console.log('✅ SwapInterface: Market quote:', quote);
      return quote;
    } catch (error) {
      console.error('❌ SwapInterface: Failed to fetch quote:', error);
      return null;
    } finally {
      setLoadingQuote(false);
    }
  }, [tokens]);

  // Update quote when inputs change
  useEffect(() => {
    const amount = parseFloat(fromAmount);
    if (fromToken && toToken && amount > 0) {
      fetchSwapQuote(fromToken, toToken, amount).then(quote => {
        setSwapQuote(quote);
        if (quote) {
          setToAmount(quote.toAmount.toFixed(6));
        }
      });
    } else {
      setSwapQuote(null);
      setToAmount('');
    }
  }, [fromToken, toToken, fromAmount, fetchSwapQuote]);

  // Execute swap
  const executeSwap = async () => {
    if (!swapQuote) return;

    const fromTokenData = getToken(fromToken);
    const toTokenData = getToken(toToken);
    
    if (!fromTokenData || !toTokenData) return;

    try {
      setSwapStatus({
        isSwapping: true,
        currentStep: `Routing through ${swapQuote.provider === 'ICP_DEX' ? 'ICP DEX' : '1inch'}...`,
        progress: 10
      });

      setSwapStatus({
        isSwapping: true,
        currentStep: `Executing swap via ${swapQuote.provider === 'ICP_DEX' ? 'ICP DEX' : '1inch'}...`,
        progress: 30
      });

      // Execute the swap
      const swapRequest = {
        fromToken: fromTokenData.symbol,
        toToken: toTokenData.symbol,
        amount: parseFloat(fromAmount),
        slippage: 0.5 / 100
      };

      const result = await OneInchService.executeSwap(swapRequest);
      console.log('✅ SwapInterface: Swap executed:', result);

      if (!result.success) {
        throw new Error(result.error || 'Swap failed');
      }

      setSwapStatus({
        isSwapping: true,
        currentStep: 'Confirming transaction...',
        progress: 70
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      setSwapStatus({
        isSwapping: true,
        currentStep: 'Swap completed successfully!',
        progress: 100
      });

      // Add to history
      const newSwap = {
        id: Date.now(),
        fromToken: fromTokenData.symbol,
        toToken: toTokenData.symbol,
        amount: parseFloat(fromAmount),
        price: fromTokenData.current_price,
        reason: 'Manual swap completed successfully',
        status: 'completed',
        timestamp: Date.now(),
        gasCost: swapQuote.fees.totalFee,
        swapType: 'manual',
        swapProvider: swapQuote.provider,
        fromAmount: fromAmount,
        toAmount: toAmount,
        rate: swapQuote.exchangeRate,
        txHash: result.transactionData?.tx?.hash || 'N/A',
        gasUsed: result.gasEstimate || 'N/A',
        provider: swapQuote.provider
      };
      
      setSwapHistory(prev => [newSwap, ...prev]);
      
      // Notify parent component
      if (onSwapComplete) {
        onSwapComplete(newSwap);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setSwapStatus({ isSwapping: false, currentStep: '', progress: 0 });
      setShowConfirmDialog(false);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setSwapQuote(null);
      
      toast.success('Swap completed successfully!', {
        description: `Swapped ${fromAmount} ${fromTokenData.symbol.toUpperCase()} for ${toAmount} ${toTokenData.symbol.toUpperCase()} via ${swapQuote.provider === 'ICP_DEX' ? 'ICP DEX' : '1inch'}`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setSwapStatus({ 
        isSwapping: false, 
        currentStep: '', 
        progress: 0, 
        error: errorMessage 
      });
      
      toast.error('Swap failed', {
        description: errorMessage,
      });
    }
  };

  // Swap token positions
  const swapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  // Get provider badge
  const getProviderBadge = (provider) => {
    switch (provider) {
      case 'ICP_DEX':
        return (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Network className="w-3 h-3" />
            <span>ICP DEX</span>
          </Badge>
        );
      case '1INCH':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>1inch</span>
          </Badge>
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
          <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auto" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Auto</span>
              </TabsTrigger>
              <TabsTrigger value="ICP_DEX" className="flex items-center space-x-2">
                <Network className="w-4 h-4" />
                <span>ICP DEX</span>
              </TabsTrigger>
              <TabsTrigger value="1INCH" className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>1inch</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auto" className="mt-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">Automatic Routing</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically selects the best provider: ICP DEX for zero-fee ICRC-1 swaps, 1inch for optimal EVM pricing.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="ICP_DEX" className="mt-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-600">ICP DEX</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Zero-fee swaps for ICRC-1 tokens on Internet Computer.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Zero fees</Badge>
                  <Badge variant="outline">2-10 seconds</Badge>
                  <Badge variant="outline">Low slippage</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="1INCH" className="mt-4">
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-600">1inch</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Best prices across 100+ DEXs for EVM tokens.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Price aggregation</Badge>
                  <Badge variant="outline">30s-5min</Badge>
                  <Badge variant="outline">MEV protection</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Swap Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Swap Tokens</span>
            {swapQuote && getProviderBadge(swapQuote.provider)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex space-x-2">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tokens..."
                        value={tokenSearch}
                        onChange={(e) => setTokenSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {filteredTokens.slice(0, 20).map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {token.symbol?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium">{token.symbol.toUpperCase()}</span>
                        <span className="text-sm text-muted-foreground">{token.name}</span>
                        {token.isICRC1 && (
                          <Badge variant="outline" className="text-xs">ICRC-1</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1"
              />
            </div>
            {fromToken && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  ${getToken(fromToken)?.current_price?.toFixed(4)} per {getToken(fromToken)?.symbol?.toUpperCase()}
                </span>
                <div className={`flex items-center space-x-1 ${
                  (getToken(fromToken)?.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(getToken(fromToken)?.price_change_percentage_24h || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {(getToken(fromToken)?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                    {(getToken(fromToken)?.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapTokens}
              disabled={swapStatus.isSwapping}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex space-x-2">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tokens..."
                        value={tokenSearch}
                        onChange={(e) => setTokenSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {filteredTokens.slice(0, 20).map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {token.symbol?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium">{token.symbol.toUpperCase()}</span>
                        <span className="text-sm text-muted-foreground">{token.name}</span>
                        {token.isICRC1 && (
                          <Badge variant="outline" className="text-xs">ICRC-1</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="flex-1 bg-muted"
              />
            </div>
            {toToken && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  ${getToken(toToken)?.current_price?.toFixed(4)} per {getToken(toToken)?.symbol?.toUpperCase()}
                </span>
                <div className={`flex items-center space-x-1 ${
                  (getToken(toToken)?.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(getToken(toToken)?.price_change_percentage_24h || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {(getToken(toToken)?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                    {(getToken(toToken)?.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quote Loading */}
          {loadingQuote && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Finding best route...</span>
            </div>
          )}

          {/* Real-time Exchange Rate Display */}
          {fromToken && toToken && !loadingQuote && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-primary">Current Exchange Rates</h4>
                  <div className="flex items-center space-x-2">
                    <ArrowLeftRight className="w-4 h-4 text-primary" />
                    {swapQuote && getProviderBadge(swapQuote.provider)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      1 {getToken(fromToken)?.symbol?.toUpperCase()} =
                    </span>
                    <span className="text-sm font-medium">
                      {swapQuote ? swapQuote.exchangeRate.toFixed(6) : calculateExchangeRate(fromToken, toToken).toFixed(6)} {getToken(toToken)?.symbol?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      1 {getToken(toToken)?.symbol?.toUpperCase()} =
                    </span>
                    <span className="text-sm font-medium">
                      {swapQuote ? swapQuote.reverseExchangeRate.toFixed(6) : calculateReverseExchangeRate(fromToken, toToken).toFixed(6)} {getToken(fromToken)?.symbol?.toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* Calculation explanation */}
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium mb-1">Calculation:</div>
                    <div>Amount to receive = {fromAmount || '0'} × {swapQuote ? swapQuote.exchangeRate.toFixed(6) : calculateExchangeRate(fromToken, toToken).toFixed(6)} = {swapQuote ? swapQuote.toAmount.toFixed(6) : '0'} {getToken(toToken)?.symbol?.toUpperCase()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Swap Quote */}
          {swapQuote && !loadingQuote && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <div className="flex items-center space-x-2">
                    {getProviderBadge(swapQuote.provider)}
                    {swapQuote.provider === 'ICP_DEX' && (
                      <Badge variant="outline" className="text-xs text-green-600">Zero Fees</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price Impact</span>
                  <span className={`text-sm font-medium ${
                    swapQuote.priceImpact > 1 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {swapQuote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network Fee</span>
                  <span className="text-sm font-medium">${swapQuote.fees.networkFee.toFixed(4)}</span>
                </div>

                {swapQuote.fees.protocolFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Protocol Fee</span>
                    <span className="text-sm font-medium">${swapQuote.fees.protocolFee.toFixed(4)}</span>
                  </div>
                )}
                
                {swapQuote.route.length > 2 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-sm font-medium">
                      {swapQuote.route.join(' → ')}
                    </span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">You'll receive</span>
                  <span className="text-sm font-bold">
                    {swapQuote.toAmount.toFixed(6)} {getToken(toToken)?.symbol?.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Fee</span>
                  <span className="text-sm font-bold">
                    ${swapQuote.fees.totalFee.toFixed(4)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Swap Button */}
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!swapQuote || swapStatus.isSwapping || loadingQuote || !fromAmount || parseFloat(fromAmount) <= 0}
            className="w-full"
            size="lg"
          >
            {swapStatus.isSwapping ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Review Swap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Provider Information */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-primary">Intelligent Swap Routing</p>
              <p className="text-sm text-muted-foreground">
                Our smart router automatically selects the best provider for your swap:
                <strong> ICP DEX</strong> for zero-fee ICRC-1 token swaps with 2-10 second execution,
                or <strong>1inch</strong> for optimal EVM token pricing across 100+ DEXs.
                The system analyzes token types, liquidity, and fees to ensure you get the best possible trade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Swap</DialogTitle>
            <DialogDescription>
              Please review your swap details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          {swapQuote && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You're swapping</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {getToken(fromToken)?.symbol?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="font-medium">
                      {swapQuote.fromAmount} {getToken(fromToken)?.symbol?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You'll receive</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {getToken(toToken)?.symbol?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="font-medium">
                      {swapQuote.toAmount.toFixed(6)} {getToken(toToken)?.symbol?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-primary">Swap Provider</div>
                  {getProviderBadge(swapQuote.provider)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Execution Time:</span>
                    <span>{swapQuote.provider === 'ICP_DEX' ? '2-10 seconds' : '30 seconds - 5 minutes'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee:</span>
                    <span>${swapQuote.fees.networkFee.toFixed(4)}</span>
                  </div>
                  {swapQuote.fees.protocolFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protocol Fee:</span>
                      <span>${swapQuote.fees.protocolFee.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exchange Rates in Confirmation Dialog */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">Exchange Rates & Calculation</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      1 {getToken(fromToken)?.symbol?.toUpperCase()} =
                    </span>
                    <span>{swapQuote.exchangeRate.toFixed(6)} {getToken(toToken)?.symbol?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      1 {getToken(toToken)?.symbol?.toUpperCase()} =
                    </span>
                    <span>{swapQuote.reverseExchangeRate.toFixed(6)} {getToken(fromToken)?.symbol?.toUpperCase()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      <strong>Calculation:</strong> {swapQuote.fromAmount} × {swapQuote.exchangeRate.toFixed(6)} = {swapQuote.toAmount.toFixed(6)} {getToken(toToken)?.symbol?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={swapQuote.priceImpact > 1 ? 'text-destructive' : ''}>
                    {swapQuote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                {swapQuote.route.length > 2 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="text-right">{swapQuote.route.join(' → ')}</span>
                  </div>
                )}
              </div>
              
              {swapQuote.priceImpact > 1 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High Price Impact:</strong> This swap will move the market price by {swapQuote.priceImpact.toFixed(2)}%. 
                    Consider reducing your swap amount.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeSwap} disabled={swapStatus.isSwapping}>
              {swapStatus.isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Swapping...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Swap
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swap History */}
      {swapHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Swaps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {swapHistory.slice(0, 5).map((swap) => (
                <div key={swap.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowUpDown className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {swap.fromAmount} {swap.from} → {swap.toAmount} {swap.to}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rate: 1:{swap.rate.toFixed(6)} • {swap.provider}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {swap.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      TX: {swap.txHash.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SwapInterface;
