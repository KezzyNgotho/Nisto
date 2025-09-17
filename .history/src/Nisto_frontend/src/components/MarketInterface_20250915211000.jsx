import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FiBarChart, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiSearch, 
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiDollarSign,
  FiLoader,
  FiX,
  FiFilter,
  FiSettings,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import MarketDataService from '../services/MarketDataService';
import './MarketInterface.scss';

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
      console.log('✅ MarketInterface: Loaded market data:', {
        totalCoins: data.length,
        sampleCoins: data.slice(0, 3).map(coin => ({
          symbol: coin.symbol,
          name: coin.name,
          price: coin.current_price,
          change24h: coin.change24h
        }))
      });
      
      if (append) {
        setAllCoins(prev => [...prev, ...data]);
        setDisplayedCoins(prev => [...prev, ...data]);
      } else {
        setAllCoins(data);
        setDisplayedCoins(data);
        setCurrentPage(1);
      }

      // Check if we have more data
      setHasMoreData(data.length >= COINS_PER_PAGE);
      
      // Set total coins count
      if (page === 1) {
        setTotalCoinsCount(data.length);
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

      // Handle different field mappings
      if (sortField === 'market_cap_rank') {
        aValue = a.rank || a.market_cap_rank || 0;
        bValue = b.rank || b.market_cap_rank || 0;
      } else if (sortField === 'current_price') {
        aValue = a.current_price || a.price || 0;
        bValue = b.current_price || b.price || 0;
      } else if (sortField === 'price_change_percentage_24h') {
        aValue = a.change24h || a.price_change_percentage_24h || 0;
        bValue = b.change24h || b.price_change_percentage_24h || 0;
      } else if (sortField === 'total_volume') {
        aValue = a.volume || a.total_volume || 0;
        bValue = b.volume || b.total_volume || 0;
      } else if (sortField === 'market_cap') {
        aValue = a.marketCap || a.market_cap || 0;
        bValue = b.marketCap || b.market_cap || 0;
      }

      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;

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
      return <FiChevronUp className="sort-icon inactive" />;
    }
    return sortDirection === 'asc' 
      ? <FiChevronUp className="sort-icon active" />
      : <FiChevronDown className="sort-icon active" />;
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
          <div className="header-left">
            <h1 className="market-title">
              <FiBarChart className="title-icon" />
              Cryptocurrency Market
            </h1>
          </div>

          <div className="header-center">
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-label">Coins</span>
                <span className="stat-value">{displayedCoins.length.toLocaleString()}</span>
              </div>
              {lastUpdated && (
                <div className="stat-item">
                  <span className="stat-label">Last Updated</span>
                  <span className="stat-value">{lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <button 
              className="refresh-button" 
              onClick={refreshData}
              disabled={loading}
              aria-label="Refresh data"
            >
              <FiRefreshCw className={`icon ${loading ? 'spinning' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Market Stats */}

      {/* Search and Currency Selection */}
      <div className="market-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, symbol, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
          
          {debouncedSearchTerm && (
            <div className="search-results">
              <span className="results-text">
                Found {displayedCoins.length.toLocaleString()} results for "{debouncedSearchTerm}"
              </span>
              <button className="clear-button" onClick={clearSearch}>
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Currency Tabs */}
        <div className="currency-tabs">
          <button 
            className={`currency-tab ${quoteCurrency === 'USD' ? 'active' : ''}`}
            onClick={() => setQuoteCurrency('USD')}
          >
            {getCurrencyIcon('USD')}
            <span>USD</span>
          </button>
          <button 
            className={`currency-tab ${quoteCurrency === 'USDT' ? 'active' : ''}`}
            onClick={() => setQuoteCurrency('USDT')}
          >
            {getCurrencyIcon('USDT')}
            <span>USDT</span>
          </button>
          <button 
            className={`currency-tab ${quoteCurrency === 'USDC' ? 'active' : ''}`}
            onClick={() => setQuoteCurrency('USDC')}
          >
            {getCurrencyIcon('USDC')}
            <span>USDC</span>
          </button>
          <button 
            className={`currency-tab ${quoteCurrency === 'ICP' ? 'active' : ''}`}
            onClick={() => setQuoteCurrency('ICP')}
          >
            {getCurrencyIcon('ICP')}
            <span>ICP</span>
          </button>
        </div>

        {/* Exchange Rate Info */}
        {quoteCurrency !== 'USD' && (
          <div className="exchange-rate-info">
            <span className="rate-label">Exchange Rate:</span>
            <span className="rate-value">
              1 {quoteCurrency} = ${quoteRates[quoteCurrency].toFixed(4)} USD
            </span>
          </div>
        )}
      </div>
      {/* Market Table */}
      <div className="market-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-content">
              <FiLoader className="loading-spinner" />
              <p className="loading-text">Loading market data...</p>
            </div>
            {/* Loading skeletons */}
            <div className="loading-skeletons">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                  <div className="skeleton-value"></div>
                  <div className="skeleton-value"></div>
                  <div className="skeleton-value"></div>
                  <div className="skeleton-value"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="market-table-wrapper" onScroll={handleScroll}>
            <div className="market-table">
              {/* Table Header */}
              <div className="table-header">
                <div 
                  className="header-cell sortable"
                  onClick={() => handleSort('market_cap_rank')}
                >
                  <span>#</span>
                  {getSortIcon('market_cap_rank')}
                </div>
                <div className="header-cell">Name</div>
                <div 
                  className="header-cell sortable text-right"
                  onClick={() => handleSort('current_price')}
                >
                  <span>Price ({quoteCurrency})</span>
                  {getSortIcon('current_price')}
                </div>
                <div 
                  className="header-cell sortable text-right"
                  onClick={() => handleSort('price_change_percentage_24h')}
                >
                  <span>24h %</span>
                  {getSortIcon('price_change_percentage_24h')}
                </div>
                <div 
                  className="header-cell sortable text-right"
                  onClick={() => handleSort('total_volume')}
                >
                  <span>24h Volume</span>
                  {getSortIcon('total_volume')}
                </div>
                <div 
                  className="header-cell sortable text-right"
                  onClick={() => handleSort('market_cap')}
                >
                  <span>Market Cap</span>
                  {getSortIcon('market_cap')}
                </div>
              </div>

              {/* Table Body */}
              <div className="table-body">
                {displayedCoins.map((coin) => (
                  <div key={coin.id} className="table-row">
                    <div className="table-cell rank">
                      {coin.market_cap_rank || 'N/A'}
                    </div>
                    <div className="table-cell name">
                      <div className="coin-info">
                        <div className="coin-avatar">
                          {coin.symbol?.charAt(0) || '?'}
                        </div>
                        <div className="coin-details">
                          <div className="coin-name">{coin.name}</div>
                          <div className="coin-symbol">{coin.symbol}</div>
                        </div>
                      </div>
                    </div>
                    <div className="table-cell price text-right">
                      {formatPrice(coin.current_price || 0, quoteCurrency)}
                    </div>
                    <div className="table-cell change text-right">
                      <div className={`change-value ${
                        (coin.price_change_percentage_24h || 0) >= 0 ? 'positive' : 'negative'
                      }`}>
                        {(coin.price_change_percentage_24h || 0) >= 0 ? (
                          <FiTrendingUp className="change-icon" />
                        ) : (
                          <FiTrendingDown className="change-icon" />
                        )}
                        <span>
                          {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                          {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="table-cell volume text-right">
                      {formatVolume(coin.total_volume || 0)}
                    </div>
                    <div className="table-cell market-cap text-right">
                      {formatMarketCap(coin.market_cap || 0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Indicator */}
              {loadingMore && (
                <div className="load-more-indicator">
                  <FiLoader className="loading-spinner" />
                  <span>Loading more coins...</span>
                </div>
              )}
              
              {/* End of Data Indicator */}
              {!hasMoreData && !debouncedSearchTerm && displayedCoins.length > 0 && (
                <div className="end-indicator">
                  <p>You've reached the end of the list</p>
                  <p className="end-subtitle">Showing {displayedCoins.length.toLocaleString()} coins</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No Results State */}
      {displayedCoins.length === 0 && !loading && debouncedSearchTerm && (
        <div className="no-results">
          <div className="no-results-content">
            <FiSearch className="no-results-icon" />
            <h3 className="no-results-title">No coins found</h3>
            <p className="no-results-text">
              No results found for "{debouncedSearchTerm}". Try searching with different terms.
            </p>
            <button className="clear-search-button" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
        </div>
      )}

      {/* Load More Button (fallback for manual loading) */}
      {hasMoreData && !debouncedSearchTerm && !loadingMore && displayedCoins.length > 0 && (
        <div className="load-more-section">
          <button 
            className="load-more-button"
            onClick={loadMoreCoins}
          >
            <span>Load More Coins</span>
            <FiArrowDown className="load-more-icon" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketInterface;
