// API Configuration for Nisto
// Centralized configuration for all external API endpoints

export const API_CONFIG = {
  // Market Data APIs
  MARKET_DATA: {
    COINGECKO: {
      baseURL: 'https://api.coingecko.com/api/v3',
      endpoints: {
        prices: '/simple/price',
        marketData: '/coins/markets',
        trending: '/search/trending'
      },
      rateLimit: 50, // requests per minute
      timeout: 10000 // 10 seconds
    },
    
    EXCHANGE_RATE: {
      baseURL: 'https://api.exchangerate-api.com/v4',
      endpoints: {
        latest: '/latest',
        historical: '/history'
      },
      rateLimit: 1000, // requests per month (free tier)
      timeout: 5000
    },
    
    BINANCE: {
      baseURL: 'https://api.binance.com/api/v3',
      endpoints: {
        ticker: '/ticker/price',
        orderBook: '/depth',
        trades: '/trades'
      },
      rateLimit: 1200, // requests per minute
      timeout: 5000
    }
  },

  // Nisto Backend APIs
  NISTO_BACKEND: {
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:4943',
    endpoints: {
      swap: '/api/swap',
      balance: '/api/balance',
      history: '/api/history',
      gasFee: '/api/gas-fee',
      priceOracle: '/api/price-oracle'
    },
    timeout: 15000
  },

  // Internet Computer APIs
  IC_NETWORK: {
    baseURL: 'https://ic-api.internetcomputer.org/api/v3',
    endpoints: {
      canister: '/canister',
      transaction: '/transaction',
      gasPrice: '/gas-price'
    },
    timeout: 10000
  },

  // Cache Configuration
  CACHE: {
    defaultTTL: 30000, // 30 seconds
    maxSize: 100, // maximum cached items
    cleanupInterval: 300000 // 5 minutes
  },

  // Retry Configuration
  RETRY: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2
  }
};

// Environment-specific configurations
export const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    ...API_CONFIG,
    // Override for development
    ...(isDevelopment && {
      MARKET_DATA: {
        ...API_CONFIG.MARKET_DATA,
        // Use mock data in development
        useMockData: true
      }
    }),
    // Override for production
    ...(isProduction && {
      CACHE: {
        ...API_CONFIG.CACHE,
        defaultTTL: 60000 // 1 minute in production
      }
    })
  };
};

export default API_CONFIG;
