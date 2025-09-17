import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
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
import { useAuth } from '../contexts/AuthContext';

const SwapInterface = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState('market_cap_rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [quoteCurrency, setQuoteCurrency] = useState('USD');
  const [swapForm, setSwapForm] = useState({
    fromCurrency: 'ICP',
    toCurrency: 'BTC',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5
  });
  const [swapLoading, setSwapLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [swapHistory, setSwapHistory] = useState([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load currencies on component mount
  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      console.log('🔄 SwapInterface: Loading currencies...');
      const data = await MarketDataService.getAllCurrencies();
      console.log('✅ SwapInterface: Loaded currencies:', data.length);
      setCurrencies(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ SwapInterface: Error loading currencies:', error);
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort currencies
  const filteredAndSortedCurrencies = useMemo(() => {
    let filtered = currencies;

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = currencies.filter(currency =>
        currency.name.toLowerCase().includes(searchLower) ||
        currency.symbol.toLowerCase().includes(searchLower) ||
        currency.id.toLowerCase().includes(searchLower)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortField] || 0;
      let bValue = b[sortField] || 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [currencies, debouncedSearchTerm, sortField, sortDirection]);

  // Calculate exchange rate
  const calculateRate = useCallback(async (from, to) => {
    if (!from || !to || from === to) return 0;
    
    try {
      console.log(`🔄 SwapInterface: Calculating rate ${from} → ${to}`);
      
      // Try 1inch first for real-time rates
      const oneInchRate = await OneInchService.getRealTimePrice(from, to);
      if (oneInchRate > 0) {
        console.log(`✅ SwapInterface: 1inch rate found: ${oneInchRate}`);
        setExchangeRate(oneInchRate);
        return oneInchRate;
      }
      
      // Fallback to MarketDataService
      const marketRate = await MarketDataService.getExchangeRate(from, to);
      console.log(`✅ SwapInterface: Market rate found: ${marketRate}`);
      setExchangeRate(marketRate);
      return marketRate;
    } catch (error) {
      console.error(`❌ SwapInterface: Error calculating rate:`, error);
      return 0;
    }
  }, []);

  // Update exchange rate when currencies change
  useEffect(() => {
    if (swapForm.fromCurrency && swapForm.toCurrency) {
      calculateRate(swapForm.fromCurrency, swapForm.toCurrency);
    }
  }, [swapForm.fromCurrency, swapForm.toCurrency, calculateRate]);

  // Calculate output amount when input changes
  useEffect(() => {
    if (swapForm.fromAmount && exchangeRate > 0) {
      const output = parseFloat(swapForm.fromAmount) * exchangeRate;
      setSwapForm(prev => ({
        ...prev,
        toAmount: output.toFixed(6)
      }));
    }
  }, [swapForm.fromAmount, exchangeRate]);

  const handleSwap = async () => {
    if (!swapForm.fromAmount || !swapForm.toAmount) {
      toast.error('Please enter amounts');
      return;
    }

    try {
      setSwapLoading(true);
      console.log('🔄 SwapInterface: Executing swap...');
      
      const swapRequest = {
        fromToken: swapForm.fromCurrency,
        toToken: swapForm.toCurrency,
        amount: parseFloat(swapForm.fromAmount),
        slippage: swapForm.slippage / 100
      };

      const result = await OneInchService.executeSwap(swapRequest);
      console.log('✅ SwapInterface: Swap executed:', result);

      if (result.success) {
        toast.success('Swap executed successfully!');
        
        // Add to history
        const newSwap = {
          id: Date.now(),
          from: swapForm.fromCurrency,
          to: swapForm.toCurrency,
          fromAmount: swapForm.fromAmount,
          toAmount: swapForm.toAmount,
          rate: exchangeRate,
          timestamp: new Date(),
          txHash: result.transactionData?.tx?.hash || 'N/A',
          gasUsed: result.gasEstimate || 'N/A'
        };
        
        setSwapHistory(prev => [newSwap, ...prev]);
        
        // Reset form
        setSwapForm(prev => ({
          ...prev,
          fromAmount: '',
          toAmount: ''
        }));
      } else {
        toast.error('Swap failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ SwapInterface: Swap error:', error);
      toast.error('Swap failed: ' + error.message);
    } finally {
      setSwapLoading(false);
    }
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary" />
      : <ArrowDown className="w-4 h-4 text-primary" />;
  };

  const formatPrice = (price) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const refreshData = async () => {
    await loadCurrencies();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Nisto Swap</h1>
          <Badge variant="outline" className="ml-2">
            {currencies.length.toLocaleString()} tokens
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Swap Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Available Tokens</div>
            <div className="text-2xl font-bold">{currencies.length.toLocaleString()}</div>
            {debouncedSearchTerm && (
              <div className="text-xs text-muted-foreground">
                Filtered from {currencies.length.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Exchange Rate</div>
            <div className="text-2xl font-bold">
              {exchangeRate > 0 ? `1:${exchangeRate.toFixed(6)}` : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {swapForm.fromCurrency} → {swapForm.toCurrency}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Swaps</div>
            <div className="text-2xl font-bold">{swapHistory.length}</div>
            <div className="text-xs text-muted-foreground">This session</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Slippage</div>
            <div className="text-2xl font-bold">{swapForm.slippage}%</div>
            <div className="text-xs text-muted-foreground">Tolerance</div>
          </CardContent>
        </Card>
      </div>

      {/* Swap Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Execute Swap</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Swap Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <div className="flex space-x-2">
                <select
                  value={swapForm.fromCurrency}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, fromCurrency: e.target.value }))}
                  className="flex-1 p-3 border rounded-lg bg-background"
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.symbol}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={swapForm.fromAmount}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, fromAmount: e.target.value }))}
                  className="w-32"
                />
              </div>
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <div className="flex space-x-2">
                <select
                  value={swapForm.toCurrency}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, toCurrency: e.target.value }))}
                  className="flex-1 p-3 border rounded-lg bg-background"
                >
                  {currencies.map(currency => (
                    <option key={currency.id} value={currency.symbol}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={swapForm.toAmount}
                  readOnly
                  className="w-32 bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Slippage Setting */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Slippage Tolerance</label>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1.0, 3.0].map(slippage => (
                <Button
                  key={slippage}
                  variant={swapForm.slippage === slippage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSwapForm(prev => ({ ...prev, slippage }))}
                >
                  {slippage}%
                </Button>
              ))}
              <Input
                type="number"
                placeholder="Custom"
                value={swapForm.slippage}
                onChange={(e) => setSwapForm(prev => ({ ...prev, slippage: parseFloat(e.target.value) || 0 }))}
                className="w-20"
                min="0"
                max="50"
                step="0.1"
              />
            </div>
          </div>

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={swapLoading || !swapForm.fromAmount || !swapForm.toAmount}
            className="w-full flex items-center justify-center space-x-2"
            size="lg"
          >
            {swapLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Swapping...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Swap</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Token List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Tokens</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tokens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 w-80"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {debouncedSearchTerm && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                Found {filteredAndSortedCurrencies.length.toLocaleString()} results for "{debouncedSearchTerm}"
              </span>
              <Button variant="ghost" size="sm" onClick={clearSearch} className="h-6 px-2">
                Clear
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading tokens...</p>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('market_cap_rank')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          {getSortIcon('market_cap_rank')}
                        </div>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('current_price')}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Price</span>
                          {getSortIcon('current_price')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('price_change_percentage_24h')}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>24h %</span>
                          {getSortIcon('price_change_percentage_24h')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('market_cap')}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Market Cap</span>
                          {getSortIcon('market_cap')}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCurrencies.map((currency) => (
                      <TableRow key={currency.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {currency.market_cap_rank || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {currency.symbol?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{currency.name}</div>
                              <div className="text-sm text-muted-foreground uppercase">
                                {currency.symbol}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(currency.current_price || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end space-x-1 ${
                            (currency.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(currency.price_change_percentage_24h || 0) >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>
                              {(currency.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                              {(currency.price_change_percentage_24h || 0).toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatMarketCap(currency.market_cap || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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
                        Rate: 1:{swap.rate.toFixed(6)}
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
