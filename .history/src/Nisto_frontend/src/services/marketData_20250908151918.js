// Market Data Service for Nisto Swap Module
// Handles real-time price feeds, exchange rates, and market data

class MarketDataService {
  constructor() {
    this.baseURLs = {
      coingecko: 'https://api.coingecko.com/api/v3',
      fixer: 'https://api.fixer.io/v1',
      binance: 'https://api.binance.com/api/v3',
      icNetwork: 'https://ic-api.internetcomputer.org/api/v3'
    };
    
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.retryAttempts = 3;
  }

  // Get all available cryptocurrencies from CoinGecko
  async getAllCryptocurrencies() {
    try {
      const cacheKey = 'all_cryptocurrencies';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Fetch multiple pages to get more cryptocurrencies including smaller ones
      const allCryptos = [];
      const pages = [1, 2, 3, 4, 5]; // Get top 500 cryptocurrencies
      
      for (const page of pages) {
        try {
          const response = await fetch(
            `${this.baseURLs.coingecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=24h`
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch page ${page}, continuing...`);
            continue;
          }
          
          const data = await response.json();
          allCryptos.push(...data);
          
          // Add small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Error fetching page ${page}:`, error);
          continue;
        }
      }
      
      this.setCachedData(cacheKey, allCryptos);
      return allCryptos;
    } catch (error) {
      console.error('Error fetching all cryptocurrencies:', error);
      return this.getFallbackCryptocurrencies();
    }
  }

  // Get real-time crypto prices from CoinGecko
  async getCryptoPrices(currencyIds = ['tether', 'usd-coin', 'dai', 'internet-computer']) {
    try {
      const cacheKey = `crypto_prices_${currencyIds.join('_')}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await fetch(
        `${this.baseURLs.coingecko}/simple/price?ids=${currencyIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return this.getFallbackPrices();
    }
  }

  // Get fiat exchange rates
  async getFiatRates(baseCurrency = 'USD', targetCurrencies = ['KES']) {
    try {
      const cacheKey = `fiat_rates_${baseCurrency}_${targetCurrencies.join('_')}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Using free alternative since Fixer requires API key
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching fiat rates:', error);
      return this.getFallbackFiatRates();
    }
  }

  // Get ICP gas price from IC network
  async getICPGasPrice() {
    try {
      const cacheKey = 'icp_gas_price';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Mock ICP gas price - in production, this would come from IC network
      const gasPrice = {
        price: 0.001, // ICP
        priceUSD: 0.012, // ~$12 per ICP
        timestamp: Date.now()
      };
      
      this.setCachedData(cacheKey, gasPrice);
      return gasPrice;
    } catch (error) {
      console.error('Error fetching ICP gas price:', error);
      return { price: 0.001, priceUSD: 0.012, timestamp: Date.now() };
    }
  }

  // Get NST token price (custom oracle)
  async getNSTPrice() {
    try {
      const cacheKey = 'nst_price';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Mock NST price - in production, this would come from Nisto's price oracle
      const nstPrice = {
        price: 0.85, // USD
        change24h: 5.25, // %
        volume24h: 125000, // USD
        timestamp: Date.now()
      };
      
      this.setCachedData(cacheKey, nstPrice);
      return nstPrice;
    } catch (error) {
      console.error('Error fetching NST price:', error);
      return { price: 0.85, change24h: 5.25, volume24h: 125000, timestamp: Date.now() };
    }
  }

  // Get market overview data
  async getMarketOverview() {
    try {
      const cacheKey = 'market_overview';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [cryptoPrices, nstData] = await Promise.all([
        this.getCryptoPrices(),
        this.getNSTPrice()
      ]);

      const marketData = {
        totalVolume24h: 2400000, // USD
        totalPairs: 25,
        averageFee: 0.1, // %
        activeUsers: 1250,
        timestamp: Date.now()
      };
      
      this.setCachedData(cacheKey, marketData);
      return marketData;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return this.getFallbackMarketOverview();
    }
  }

  // Calculate real-time exchange rate between two currencies
  async calculateExchangeRate(fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) return 1;

      // Get prices for both currencies
      const [cryptoPrices, fiatRates, nstData] = await Promise.all([
        this.getCryptoPrices(),
        this.getFiatRates(),
        this.getNSTPrice()
      ]);

      let fromPrice = 1;
      let toPrice = 1;

      // Determine from currency price
      if (fromCurrency === 'USDT') fromPrice = cryptoPrices.tether?.usd || 1;
      else if (fromCurrency === 'USDC') fromPrice = cryptoPrices['usd-coin']?.usd || 1;
      else if (fromCurrency === 'DAI') fromPrice = cryptoPrices.dai?.usd || 1;
      else if (fromCurrency === 'NST') fromPrice = nstData.price;
      else if (fromCurrency === 'KES') fromPrice = fiatRates.rates?.KES || 0.0065;

      // Determine to currency price
      if (toCurrency === 'USDT') toPrice = cryptoPrices.tether?.usd || 1;
      else if (toCurrency === 'USDC') toPrice = cryptoPrices['usd-coin']?.usd || 1;
      else if (toCurrency === 'DAI') toPrice = cryptoPrices.dai?.usd || 1;
      else if (toCurrency === 'NST') toPrice = nstData.price;
      else if (toCurrency === 'KES') toPrice = fiatRates.rates?.KES || 0.0065;

      return toPrice / fromPrice;
    } catch (error) {
      console.error('Error calculating exchange rate:', error);
      return 1; // Fallback to 1:1 ratio
    }
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fallback data for when APIs fail
  getFallbackCryptocurrencies() {
    return [
      {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether USD',
        current_price: 1.00,
        price_change_percentage_24h: 0.00,
        market_cap: 80000000000,
        total_volume: 50000000000,
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
      },
      {
        id: 'usd-coin',
        symbol: 'usdc',
        name: 'USD Coin',
        current_price: 1.00,
        price_change_percentage_24h: 0.00,
        market_cap: 30000000000,
        total_volume: 20000000000,
        image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
      },
      {
        id: 'dai',
        symbol: 'dai',
        name: 'Dai Stablecoin',
        current_price: 1.00,
        price_change_percentage_24h: 0.01,
        market_cap: 5000000000,
        total_volume: 1000000000,
        image: 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png'
      },
      {
        id: 'internet-computer',
        symbol: 'icp',
        name: 'Internet Computer',
        current_price: 12.00,
        price_change_percentage_24h: 2.5,
        market_cap: 5000000000,
        total_volume: 100000000,
        image: 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png'
      },
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000.00,
        price_change_percentage_24h: 1.2,
        market_cap: 850000000000,
        total_volume: 20000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3000.00,
        price_change_percentage_24h: 0.8,
        market_cap: 360000000000,
        total_volume: 15000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
    ];
  }

  getFallbackPrices() {
    return {
      tether: { usd: 1.00, usd_24h_change: 0.00 },
      'usd-coin': { usd: 1.00, usd_24h_change: 0.00 },
      dai: { usd: 1.00, usd_24h_change: 0.01 },
      'internet-computer': { usd: 12.00, usd_24h_change: 2.5 }
    };
  }

  getFallbackFiatRates() {
    return {
      rates: {
        KES: 0.0065
      },
      base: 'USD',
      date: new Date().toISOString().split('T')[0]
    };
  }

  getFallbackMarketOverview() {
    return {
      totalVolume24h: 2400000,
      totalPairs: 25,
      averageFee: 0.1,
      activeUsers: 1250,
      timestamp: Date.now()
    };
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache() {
    this.cache.clear();
  }

  // Get cache status
  getCacheStatus() {
    const status = {};
    for (const [key, value] of this.cache.entries()) {
      status[key] = {
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp > this.cacheTimeout
      };
    }
    return status;
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

export default marketDataService;
