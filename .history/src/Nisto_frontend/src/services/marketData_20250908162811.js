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

      // Use CORS proxy for localhost development
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const targetUrl = `${this.baseURLs.coingecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      this.setCachedData(cacheKey, data);
      return data;
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

      // Get real-time prices for both currencies from CoinGecko
      const fromPrice = await this.getCurrencyPrice(fromCurrency);
      const toPrice = await this.getCurrencyPrice(toCurrency);

      if (!fromPrice || !toPrice) {
        throw new Error(`Unable to get prices for ${fromCurrency} or ${toCurrency}`);
      }

      // Calculate exchange rate: fromPrice / toPrice
      // This gives us how many units of toCurrency we get for 1 unit of fromCurrency
      const rate = fromPrice / toPrice;
      return rate;
    } catch (error) {
      console.error('Error calculating exchange rate:', error);
      throw error;
    }
  }

  // Get real-time price for any currency (like Binance)
  async getCurrencyPrice(currencySymbol) {
    try {
      const cacheKey = `price_${currencySymbol}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Use CORS proxy for localhost development
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      
      // First try to get price from CoinGecko by symbol
      const targetUrl = `${this.baseURLs.coingecko}/simple/price?ids=${currencySymbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

      if (response.ok) {
        const data = await response.json();
        const price = data[currencySymbol.toLowerCase()]?.usd;
        if (price) {
          this.setCachedData(cacheKey, price);
          return price;
        }
      }

      // If direct symbol lookup fails, search for the currency
      const searchTargetUrl = `${this.baseURLs.coingecko}/search?query=${currencySymbol}`;
      const searchResponse = await fetch(proxyUrl + encodeURIComponent(searchTargetUrl));

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.coins && searchData.coins.length > 0) {
          const coin = searchData.coins[0];
          const coinId = coin.id;
          
          // Get price using the found coin ID
          const priceTargetUrl = `${this.baseURLs.coingecko}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
          const priceResponse = await fetch(proxyUrl + encodeURIComponent(priceTargetUrl));

          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            const price = priceData[coinId]?.usd;
            if (price) {
              this.setCachedData(cacheKey, price);
              return price;
            }
          }
        }
      }

      throw new Error(`Price not found for ${currencySymbol}`);
    } catch (error) {
      console.error(`Error getting price for ${currencySymbol}:`, error);
      throw error;
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

  // Search for specific cryptocurrencies
  async searchCryptocurrencies(query) {
    try {
      const cacheKey = `search_${query.toLowerCase()}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await fetch(
        `${this.baseURLs.coingecko}/search?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error searching cryptocurrencies:', error);
      return { coins: [] };
    }
  }

  // Get specific cryptocurrencies by IDs (for PEPE, TRUMP, etc.)
  async getSpecificCryptocurrencies(coinIds = ['pepe', 'maga', 'trump']) {
    try {
      const cacheKey = `specific_cryptos_${coinIds.join('_')}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await fetch(
        `${this.baseURLs.coingecko}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching specific cryptocurrencies:', error);
      return [];
    }
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
