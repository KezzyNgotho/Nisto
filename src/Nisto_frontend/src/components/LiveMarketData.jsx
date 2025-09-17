import React, { useState, useEffect } from 'react';
import MarketDataService from '../services/MarketDataService';
import './LiveMarketData.scss';

const LiveMarketData = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);

  // Fetch live market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await MarketDataService.getAllCurrencies();
        setCurrencies(data);
        setFilteredCurrencies(data);
        
        console.log('Live market data fetched:', data.length, 'currencies');
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to fetch live market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter currencies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCurrencies(currencies);
      return;
    }

    const filtered = currencies.filter(currency => 
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCurrencies(filtered);
  }, [searchQuery, currencies]);

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    
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
    if (!volume) return 'N/A';
    
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else {
      return `$${volume.toLocaleString()}`;
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return '#10B981'; // green
    if (change < 0) return '#EF4444'; // red
    return '#6B7280'; // gray
  };

  if (loading) {
    return (
      <div className="live-market-data">
        <div className="market-header">
          <h2>Live Market Data</h2>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Fetching live data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-market-data">
        <div className="market-header">
          <h2>Live Market Data</h2>
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-market-data">
      <div className="market-header">
        <h2>Live Market Data</h2>
        <div className="market-stats">
          <span className="stat">
            <strong>{currencies.length}</strong> currencies
          </span>
          <span className="stat">
            <strong>Live</strong> prices
          </span>
        </div>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
      </div>

      <div className="currencies-grid">
        {filteredCurrencies.map((currency) => (
          <div key={currency.id} className="currency-card">
            <div className="currency-header">
              <div className="currency-info">
                <img 
                  src={currency.image} 
                  alt={currency.name}
                  className="currency-image"
                  onError={(e) => {
                    e.target.src = '/default-coin.png';
                  }}
                />
                <div className="currency-details">
                  <h3 className="currency-name">{currency.name}</h3>
                  <span className="currency-symbol">{currency.symbol}</span>
                </div>
              </div>
              <div className="currency-price">
                {formatPrice(currency.price)}
              </div>
            </div>

            <div className="currency-metrics">
              <div className="metric">
                <span className="metric-label">24h Change</span>
                <span 
                  className="metric-value"
                  style={{ color: getChangeColor(currency.change24h) }}
                >
                  {currency.change24h > 0 ? '+' : ''}{currency.change24h.toFixed(2)}%
                </span>
              </div>
              
              <div className="metric">
                <span className="metric-label">Market Cap</span>
                <span className="metric-value">
                  {formatMarketCap(currency.marketCap)}
                </span>
              </div>
              
              <div className="metric">
                <span className="metric-label">Volume</span>
                <span className="metric-value">
                  {formatVolume(currency.volume)}
                </span>
              </div>
            </div>

            <div className="currency-actions">
              <button className="action-btn primary">
                Swap
              </button>
              <button className="action-btn secondary">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCurrencies.length === 0 && searchQuery && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No cryptocurrencies found</h3>
          <p>Try searching with a different term</p>
        </div>
      )}
    </div>
  );
};

export default LiveMarketData;
