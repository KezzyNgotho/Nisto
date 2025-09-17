import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FiBarChart3, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiSearch, 
  FiRefreshCw,
  FiArrowUpDown,
  FiArrowUp,
  FiArrowDown,
  FiDollarSign,
  FiLoader,
  FiX,
  FiFilter,
  FiSettings
} from 'react-icons/fi';
import MarketDataService from '../services/MarketDataService';

const MarketInterface = () => {
  const [allCoins, setAllCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState('market_cap_rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [quoteCurrency, setQuoteCurrency] = useState('USD');
  const [quoteRates, setQuoteRates] = useState({
    USDT: 1,
    USDC: 1,
    ICP: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalCoinsCount, setTotalCoinsCount] = useState(0);

  const COINS_PER_PAGE = 50;
  const SEARCH_DEBOUNCE_MS = 300;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchQuoteRates = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin,internet-computer&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote rates');
      }
      
      const data = await response.json();
      
      setQuoteRates({
        USDT: data.tether?.usd || 1,
        USDC: data['usd-coin']?.usd || 1,
        ICP: data['internet-computer']?.usd || 1
      });
    } catch (error) {
      console.error('Failed to fetch quote rates:', error);
      setQuoteRates({
        USDT: 1,
        USDC: 1,
        ICP: 10
      });
    }
  };

  const fetchMarketData = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log('🔄 MarketInterface: Fetching market data...');
      const data = await MarketDataService.getAllCurrencies();
      console.log('✅ MarketInterface: Loaded market data:', data.length);
      
      if (append) {
        setAllCoins(prev => [...prev, ...data]);
        setDisplayedCoins(prev => [...prev, ...data]);
      } else {
        setAllCoins(data);
        setDisplayedCoins(data);
        setCurrentPage(1);
      }

      // Check if we have more data
      setHasMoreData(data.length === COINS_PER_PAGE);
      
      // Estimate total coins
      if (page === 1) {
        setTotalCoinsCount(10000); // Approximate total
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter and sort coins based on search and sort criteria
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = allCoins;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = allCoins.filter(coin =>
        coin.name.toLowerCase().includes(searchLower) ||
        coin.symbol.toLowerCase().includes(searchLower) ||
        coin.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue === null) aValue = 0;
      if (bValue === null) bValue = 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [allCoins, debouncedSearchTerm, sortField, sortDirection]);

  // Update displayed coins when filters change
  useEffect(() => {
    setDisplayedCoins(filteredAndSortedCoins);
  }, [filteredAndSortedCoins]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const loadMoreCoins = useCallback(async () => {
    if (!hasMoreData || loadingMore || debouncedSearchTerm) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchMarketData(nextPage, true);
  }, [currentPage, hasMoreData, loadingMore, debouncedSearchTerm]);

  // Infinite scroll handler
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight * 1.5;
    
    if (isNearBottom && !loadingMore && hasMoreData && !debouncedSearchTerm) {
      loadMoreCoins();
    }
  }, [loadMoreCoins, loadingMore, hasMoreData, debouncedSearchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchMarketData(), fetchQuoteRates()]);
    };
    
    fetchData();
  }, []);

  const convertPrice = (usdPrice, targetCurrency) => {
    if (targetCurrency === 'USD') return usdPrice;
    
    const rate = quoteRates[targetCurrency];
    return usdPrice / rate;
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

  const formatPrice = (usdPrice, targetCurrency) => {
    const price = convertPrice(usdPrice, targetCurrency);
    const symbol = targetCurrency === 'USD' ? '$' : '';
    const suffix = targetCurrency !== 'USD' ? ` ${targetCurrency}` : '';
    
    if (price < 0.01) {
      return `${symbol}${price.toFixed(6)}${suffix}`;
    } else if (price < 1) {
      return `${symbol}${price.toFixed(4)}${suffix}`;
    } else {
      return `${symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
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

  const formatVolume = (volume) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toLocaleString()}`;
    }
  };

  const getCurrencyIcon = (currency) => {
    switch (currency) {
      case 'USD':
        return <FiDollarSign className="currency-icon" />;
      case 'USDT':
        return <div className="currency-badge usdt">T</div>;
      case 'USDC':
        return <div className="currency-badge usdc">C</div>;
      case 'ICP':
        return <div className="currency-badge icp">I</div>;
      default:
        return <FiDollarSign className="currency-icon" />;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const refreshData = async () => {
    setCurrentPage(1);
    setHasMoreData(true);
    await Promise.all([fetchMarketData(), fetchQuoteRates()]);
  };

  return (
    <div className="market-interface">
      {/* Header */}
      <div className="market-header">
        <div className="market-header-content">
          <div className="market-title-section">
            <div className="title-wrapper">
              <h1 className="market-title">
                <FiBarChart3 className="title-icon" />
                Market Data
              </h1>
              <span className="coins-badge">
                {displayedCoins.length.toLocaleString()} coins
              </span>
            </div>
            {lastUpdated && (
              <p className="market-subtitle">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="market-actions">
            <button 
              className="action-button" 
              onClick={refreshData}
              disabled={loading}
              aria-label="Refresh data"
            >
              <FiRefreshCw className={`icon ${loading ? 'spinning' : ''}`} />
            </button>
            <button className="action-button" aria-label="Settings">
              <FiSettings className="icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Displayed Coins</div>
            <div className="text-2xl font-bold">{displayedCoins.length.toLocaleString()}</div>
            {debouncedSearchTerm && (
              <div className="text-xs text-muted-foreground">
                Filtered from {allCoins.length.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Market Cap</div>
            <div className="text-2xl font-bold">
              {formatMarketCap(displayedCoins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">24h Volume</div>
            <div className="text-2xl font-bold">
              {formatVolume(displayedCoins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">BTC Dominance</div>
            <div className="text-2xl font-bold">
              {displayedCoins.length > 0 && displayedCoins[0]?.symbol?.toLowerCase() === 'btc' 
                ? `${((displayedCoins[0].market_cap / displayedCoins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0)) * 100).toFixed(1)}%`
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Quote Currency Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Market Data</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, symbol, or ID..."
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
                Found {displayedCoins.length.toLocaleString()} results for "{debouncedSearchTerm}"
              </span>
              <Button variant="ghost" size="sm" onClick={clearSearch} className="h-6 px-2">
                Clear
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Quote Currency Tabs */}
          <Tabs value={quoteCurrency} onValueChange={(value) => setQuoteCurrency(value)} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="USD" className="flex items-center space-x-2">
                {getCurrencyIcon('USD')}
                <span>USD</span>
              </TabsTrigger>
              <TabsTrigger value="USDT" className="flex items-center space-x-2">
                {getCurrencyIcon('USDT')}
                <span>USDT</span>
              </TabsTrigger>
              <TabsTrigger value="USDC" className="flex items-center space-x-2">
                {getCurrencyIcon('USDC')}
                <span>USDC</span>
              </TabsTrigger>
              <TabsTrigger value="ICP" className="flex items-center space-x-2">
                {getCurrencyIcon('ICP')}
                <span>ICP</span>
              </TabsTrigger>
            </TabsList>

            {/* Exchange Rate Info */}
            {quoteCurrency !== 'USD' && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Exchange Rate:</span>
                  <span className="font-medium">
                    1 {quoteCurrency} = ${quoteRates[quoteCurrency].toFixed(4)} USD
                  </span>
                </div>
              </div>
            )}

            <TabsContent value={quoteCurrency} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading market data...</p>
                  </div>
                  {/* Loading skeletons */}
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
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[600px]" onScrollCapture={handleScroll}>
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
                              <span>Price ({quoteCurrency})</span>
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
                            onClick={() => handleSort('total_volume')}
                          >
                            <div className="flex items-center justify-end space-x-1">
                              <span>24h Volume</span>
                              {getSortIcon('total_volume')}
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
                        {displayedCoins.map((coin) => (
                          <TableRow key={coin.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {coin.market_cap_rank || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs font-bold">
                                    {coin.symbol?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{coin.name}</div>
                                  <div className="text-sm text-muted-foreground uppercase">
                                    {coin.symbol}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(coin.current_price || 0, quoteCurrency)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className={`flex items-center justify-end space-x-1 ${
                                (coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(coin.price_change_percentage_24h || 0) >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span>
                                  {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                                  {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatVolume(coin.total_volume || 0)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMarketCap(coin.market_cap || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Load More Indicator */}
                    {loadingMore && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-muted-foreground">Loading more coins...</span>
                      </div>
                    )}
                    
                    {/* End of Data Indicator */}
                    {!hasMoreData && !debouncedSearchTerm && displayedCoins.length > 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>You've reached the end of the list</p>
                        <p className="text-sm">Showing {displayedCoins.length.toLocaleString()} coins</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* No Results State */}
      {displayedCoins.length === 0 && !loading && debouncedSearchTerm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No coins found</h3>
            <p className="text-muted-foreground mb-4">
              No results found for "{debouncedSearchTerm}". Try searching with different terms.
            </p>
            <Button variant="outline" onClick={clearSearch}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More Button (fallback for manual loading) */}
      {hasMoreData && !debouncedSearchTerm && !loadingMore && displayedCoins.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMoreCoins}
            className="flex items-center space-x-2"
          >
            <span>Load More Coins</span>
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketInterface;
