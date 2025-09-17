// Market Data Service - Fetches live cryptocurrency data from APIs
// This runs in the frontend to bypass ICP HTTP outcall limitations

class MarketDataService {
  constructor() {
    // Multiple API endpoints for redundancy
    this.baseUrls = {
      coinGecko: 'https://api.coingecko.com/api/v3',
      coinGeckoPro: 'https://pro-api.coingecko.com/api/v3',
      coinCap: 'https://api.coincap.io/v2',
      cryptoCompare: 'https://min-api.cryptocompare.com/data',
      binance: 'https://api.binance.com/api/v3'
    };
    
    // CORS proxy options
    this.corsProxies = [
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url=',
      'https://thingproxy.freeboard.io/fetch/'
    ];
    
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.currentApiIndex = 0;
    this.apiKeys = {
      coinGecko: import.meta.env.VITE_COINGECKO_API_KEY || null,
      cryptoCompare: import.meta.env.VITE_CRYPTOCOMPARE_API_KEY || null
    };
    
    console.log('🚀 MarketDataService: Initialized with multiple API endpoints and CORS proxies for redundancy');
  }

  // Helper method to make CORS-friendly requests
  async makeCorsRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nisto-Wallet/1.0'
      },
      mode: 'cors'
    };

    // Try direct request first
    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn('Direct request failed, trying CORS proxy...', error.message);
    }

    // Try with CORS proxy
    for (const proxy of this.corsProxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl, { ...defaultOptions, ...options });
        if (response.ok) {
          console.log(`✅ CORS proxy successful: ${proxy}`);
          return response;
        }
      } catch (error) {
        console.warn(`CORS proxy failed: ${proxy}`, error.message);
        continue;
      }
    }

    throw new Error('All CORS methods failed');
  }

  // Get all major cryptocurrencies with live data from multiple APIs
  async getAllCurrencies() {
    console.log('🚀 MarketDataService: Starting to fetch all currencies with fallback APIs...');
    
    // Try multiple APIs in order of preference
    const apis = [
      () => this.fetchFromCoinGecko(),
      () => this.fetchFromCoinCap(),
      () => this.fetchFromBinance()
    ];

    for (let i = 0; i < apis.length; i++) {
      try {
        console.log(`📡 MarketDataService: Trying API ${i + 1}/${apis.length}...`);
        const data = await apis[i]();
        if (data && data.length > 0) {
          console.log(`✅ MarketDataService: Successfully fetched ${data.length} currencies from API ${i + 1}`);
          return data;
        }
      } catch (error) {
        console.warn(`⚠️ MarketDataService: API ${i + 1} failed:`, error.message);
        continue;
      }
    }

    console.error('❌ MarketDataService: All APIs failed, returning empty array');
    return [];
  }

  // Fetch from CoinGecko API
  async fetchFromCoinGecko() {
    const url = `${this.baseUrls.coinGecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y&include_24hr_change=true&include_24hr_vol=true&include_24hr_price_change=true&include_last_updated_at=true`;
    
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Nisto-Wallet/1.0'
    };

    // Add API key if available
    if (this.apiKeys.coinGecko) {
      headers['x-cg-pro-api-key'] = this.apiKeys.coinGecko;
    }

    const response = await this.makeCorsRequest(url, { headers });
    const data = await response.json();
    return this.transformCoinGeckoData(data);
  }

  // Fetch from CoinCap API
  async fetchFromCoinCap() {
    const url = `${this.baseUrls.coinCap}/assets?limit=100`;
    const response = await this.makeCorsRequest(url);
    const data = await response.json();
    return this.transformCoinCapData(data.data);
  }

  // Fetch from Binance API
  async fetchFromBinance() {
    const url = `${this.baseUrls.binance}/ticker/24hr`;
    const response = await this.makeCorsRequest(url);
      const data = await response.json();
    return this.transformBinanceData(data);
  }
      
  // Transform CoinGecko data to our format
  transformCoinGeckoData(data) {
    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price || 0,
      price: coin.current_price || 0,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap || 0,
      volume: coin.total_volume || 0,
      image: coin.image || '',
      icon: 'FiCircle',
      color: '#6B7280',
      rank: coin.market_cap_rank || 0,
      ath: coin.ath || 0,
      atl: coin.atl || 0,
      price_change_24h: coin.price_change_24h || 0,
      market_cap_change_24h: coin.market_cap_change_24h || 0,
      total_supply: coin.total_supply || 0,
      circulating_supply: coin.circulating_supply || 0,
      max_supply: coin.max_supply || null,
      // Additional comprehensive data
      price_change_percentage_1h: coin.price_change_percentage_1h || 0,
      price_change_percentage_7d: coin.price_change_percentage_7d || 0,
      price_change_percentage_14d: coin.price_change_percentage_14d || 0,
      price_change_percentage_30d: coin.price_change_percentage_30d || 0,
      price_change_percentage_200d: coin.price_change_percentage_200d || 0,
      price_change_percentage_1y: coin.price_change_percentage_1y || 0,
      market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h || 0,
      fully_diluted_valuation: coin.fully_diluted_valuation || 0,
      high_24h: coin.high_24h || 0,
      low_24h: coin.low_24h || 0,
      last_updated: coin.last_updated || '',
      sparkline_in_7d: coin.sparkline_in_7d || null
    })).sort((a, b) => b.current_price - a.current_price); // Sort by price descending
  }

  // Transform CoinCap data to our format
  transformCoinCapData(data) {
    return data.map(coin => ({
          id: coin.id,
      symbol: coin.symbol.toUpperCase(),
          name: coin.name,
      current_price: parseFloat(coin.priceUsd) || 0,
      price: parseFloat(coin.priceUsd) || 0,
      change24h: parseFloat(coin.changePercent24Hr) || 0,
      marketCap: parseFloat(coin.marketCapUsd) || 0,
      volume: parseFloat(coin.volumeUsd24Hr) || 0,
      image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
      icon: 'FiCircle',
      color: '#6B7280',
      rank: coin.rank || 0,
      ath: parseFloat(coin.vwap24Hr) || 0,
      atl: parseFloat(coin.vwap24Hr) || 0,
      price_change_24h: parseFloat(coin.changePercent24Hr) || 0,
      market_cap_change_24h: 0,
      total_supply: parseFloat(coin.supply) || 0,
      circulating_supply: parseFloat(coin.supply) || 0,
      max_supply: parseFloat(coin.maxSupply) || null
    })).sort((a, b) => b.current_price - a.current_price); // Sort by price descending
  }

  // Transform Binance data to our format
  transformBinanceData(data) {
    return data.slice(0, 100).map(coin => ({
      id: coin.symbol.toLowerCase(),
      symbol: coin.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', ''),
      name: coin.symbol,
      current_price: parseFloat(coin.lastPrice) || 0,
      price: parseFloat(coin.lastPrice) || 0,
      change24h: parseFloat(coin.priceChangePercent) || 0,
      marketCap: parseFloat(coin.volume) * parseFloat(coin.lastPrice) || 0,
      volume: parseFloat(coin.volume) || 0,
      image: '',
      icon: 'FiCircle',
      color: '#6B7280',
      rank: 0,
      ath: parseFloat(coin.highPrice) || 0,
      atl: parseFloat(coin.lowPrice) || 0,
      price_change_24h: parseFloat(coin.priceChange) || 0,
      market_cap_change_24h: 0,
      total_supply: 0,
      circulating_supply: 0,
      max_supply: null
    })).sort((a, b) => b.current_price - a.current_price); // Sort by price descending
  }


  // Get specific currency price with fallback
  async getCurrencyPrice(currencyId) {
    console.log(`💰 MarketDataService: Fetching price for ${currencyId}...`);
    
    // Try multiple APIs for price
    const priceApis = [
      () => this.getPriceFromCoinGecko(currencyId),
      () => this.getPriceFromCoinCap(currencyId),
      () => this.getPriceFromBinance(currencyId)
    ];

    for (let i = 0; i < priceApis.length; i++) {
      try {
        const price = await priceApis[i]();
        if (price > 0) {
          console.log(`✅ MarketDataService: Price for ${currencyId}: $${price} (from API ${i + 1})`);
      return price;
        }
    } catch (error) {
        console.warn(`⚠️ MarketDataService: Price API ${i + 1} failed for ${currencyId}:`, error.message);
        continue;
      }
    }

    console.error(`❌ MarketDataService: All price APIs failed for ${currencyId}`);
      return 0;
    }

  // Get price from CoinGecko
  async getPriceFromCoinGecko(currencyId) {
    const url = `${this.baseUrls.coinGecko}/simple/price?ids=${currencyId}&vs_currencies=usd&include_24hr_change=true`;
    const response = await this.makeCorsRequest(url);
    const data = await response.json();
    return data[currencyId]?.usd || 0;
  }

  // Get price from CoinCap
  async getPriceFromCoinCap(currencyId) {
    const url = `${this.baseUrls.coinCap}/assets/${currencyId}`;
    const response = await this.makeCorsRequest(url);
    const data = await response.json();
    return parseFloat(data.data?.priceUsd) || 0;
  }

  // Get price from Binance
  async getPriceFromBinance(currencyId) {
    const symbol = currencyId.toUpperCase() + 'USDT';
    const url = `${this.baseUrls.binance}/ticker/price?symbol=${symbol}`;
    const response = await this.makeCorsRequest(url);
    const data = await response.json();
    return parseFloat(data.price) || 0;
  }

  // Search currencies with fallback
  async searchCurrencies(query) {
    console.log(`🔍 MarketDataService: Searching for "${query}"...`);
    
    try {
      // First try to get all currencies and filter locally
      const allCurrencies = await this.getAllCurrencies();
      const filtered = allCurrencies.filter(coin => 
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
      
      if (filtered.length > 0) {
        console.log(`✅ MarketDataService: Found ${filtered.length} results for "${query}"`);
        return filtered;
      }

      // If no results, try CoinGecko search API
      const url = `${this.baseUrls.coinGecko}/search?query=${encodeURIComponent(query)}`;
      const response = await this.makeCorsRequest(url);
      
      const data = await response.json();
      console.log(`✅ MarketDataService: Search results for "${query}":`, {
        totalResults: data.coins?.length || 0
      });
      
      return data.coins?.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: 0,
        price: 0,
        change24h: 0,
        marketCap: coin.market_cap_rank,
        volume: null,
        image: coin.thumb,
        icon: 'FiCircle',
        color: '#6B7280'
      })) || [];

    } catch (error) {
      console.error('❌ MarketDataService: Error searching currencies:', error);
      return [];
    }
  }

  // Get exchange rate between two currencies with fallback
  async getExchangeRate(fromCurrency, toCurrency) {
    console.log(`💱 MarketDataService: Getting exchange rate ${fromCurrency}/${toCurrency}...`);
    
    try {
      // Get prices for both currencies and calculate rate
      const [fromPrice, toPrice] = await Promise.all([
        this.getCurrencyPrice(fromCurrency),
        this.getCurrencyPrice(toCurrency)
      ]);
      
      if (fromPrice > 0 && toPrice > 0) {
        const rate = fromPrice / toPrice;
        console.log(`✅ MarketDataService: Exchange rate ${fromCurrency}/${toCurrency}: ${rate}`);
        return rate;
      }
      
      // Fallback to direct API call
      const url = `${this.baseUrls.coinGecko}/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`;
      const response = await this.makeCorsRequest(url);
      
      const data = await response.json();
      const rate = data[fromCurrency]?.[toCurrency] || 0;
      console.log(`✅ MarketDataService: Exchange rate ${fromCurrency}/${toCurrency}: ${rate}`);
      
      return rate;
    } catch (error) {
      console.error(`❌ MarketDataService: Error fetching exchange rate ${fromCurrency}/${toCurrency}:`, error);
      return 0;
    }
  }

  // Get trending cryptocurrencies
  async getTrendingCurrencies() {
    console.log('🔥 MarketDataService: Fetching trending currencies...');
    
    try {
      const url = `${this.baseUrls.coinGecko}/search/trending`;
      
      console.log('📡 MarketDataService: Trending API request to:', url);
      
      const response = await this.makeCorsRequest(url);
      const data = await response.json();
      
      console.log('✅ MarketDataService: Received trending data:', {
        totalTrending: data.coins?.length || 0,
        sampleTrending: data.coins?.slice(0, 3).map(coin => ({
          id: coin.item.id,
          symbol: coin.item.symbol,
          name: coin.item.name
        })) || []
      });
      
      // Fetch prices for all trending currencies
      const trendingWithPrices = await Promise.all(
        data.coins?.map(async (coin) => {
          try {
            const price = await this.getCurrencyPrice(coin.item.id);
            return {
              id: coin.item.id,
              symbol: coin.item.symbol.toUpperCase(),
              name: coin.item.name,
              price: price,
              change24h: 0, // Will be fetched separately if needed
              marketCap: coin.item.market_cap_rank,
              volume: null,
              image: coin.item.thumb,
              icon: 'FiCircle', // Generic icon
              color: '#6B7280' // Generic color
            };
          } catch (error) {
            console.error(`❌ MarketDataService: Error fetching price for trending ${coin.item.id}:`, error);
            return {
              id: coin.item.id,
              symbol: coin.item.symbol.toUpperCase(),
              name: coin.item.name,
              price: 0,
              change24h: 0,
              marketCap: coin.item.market_cap_rank,
              volume: null,
              image: coin.item.thumb,
              icon: 'FiCircle',
              color: '#6B7280'
            };
          }
        }) || []
      );

      console.log('✅ MarketDataService: Trending currencies with prices:', {
        totalTrending: trendingWithPrices.length,
        sampleTrending: trendingWithPrices.slice(0, 3).map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: coin.price
        }))
      });

      return trendingWithPrices;

    } catch (error) {
      console.error('❌ MarketDataService: Error fetching trending currencies:', error);
      return [];
    }
  }

  // Helper methods - NO HARDCODED MAPPINGS
  // All icons and colors are now generic to avoid hardcoding

  // NO FALLBACK DATA - All data must come from live APIs

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
}

// Export singleton instance
export default new MarketDataService();
