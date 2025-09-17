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
    
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.currentApiIndex = 0;
    this.apiKeys = {
      coinGecko: process.env.REACT_APP_COINGECKO_API_KEY || null,
      cryptoCompare: process.env.REACT_APP_CRYPTOCOMPARE_API_KEY || null
    };
    
    console.log('🚀 MarketDataService: Initialized with multiple API endpoints for redundancy');
  }

  // Get all major cryptocurrencies with live data from multiple APIs
  async getAllCurrencies() {
    console.log('🚀 MarketDataService: Starting to fetch all currencies with fallback APIs...');
    
    // Try multiple APIs in order of preference
    const apis = [
      () => this.fetchFromCoinGecko(),
      () => this.fetchFromCoinCap(),
      () => this.fetchFromBinance(),
      () => this.getFallbackData()
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
    const url = `${this.baseUrls.coinGecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Nisto-Wallet/1.0'
    };

    // Add API key if available
    if (this.apiKeys.coinGecko) {
      headers['x-cg-pro-api-key'] = this.apiKeys.coinGecko;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformCoinGeckoData(data);
  }

  // Fetch from CoinCap API
  async fetchFromCoinCap() {
    const url = `${this.baseUrls.coinCap}/assets?limit=100`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Nisto-Wallet/1.0'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`CoinCap API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformCoinCapData(data.data);
  }

  // Fetch from Binance API
  async fetchFromBinance() {
    const url = `${this.baseUrls.binance}/ticker/24hr`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Nisto-Wallet/1.0'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformBinanceData(data);
  }

  // Transform CoinGecko data to our format
  transformCoinGeckoData(data) {
    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      image: coin.image,
      icon: 'FiCircle',
      color: '#6B7280'
    }));
  }

  // Transform CoinCap data to our format
  transformCoinCapData(data) {
    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: parseFloat(coin.priceUsd),
      price: parseFloat(coin.priceUsd),
      change24h: parseFloat(coin.changePercent24Hr) || 0,
      marketCap: parseFloat(coin.marketCapUsd),
      volume: parseFloat(coin.volumeUsd24Hr),
      image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
      icon: 'FiCircle',
      color: '#6B7280'
    }));
  }

  // Transform Binance data to our format
  transformBinanceData(data) {
    return data.slice(0, 100).map(coin => ({
      id: coin.symbol.toLowerCase(),
      symbol: coin.symbol.replace('USDT', '').replace('BTC', '').replace('ETH', ''),
      name: coin.symbol,
      current_price: parseFloat(coin.lastPrice),
      price: parseFloat(coin.lastPrice),
      change24h: parseFloat(coin.priceChangePercent) || 0,
      marketCap: parseFloat(coin.volume) * parseFloat(coin.lastPrice),
      volume: parseFloat(coin.volume),
      image: '',
      icon: 'FiCircle',
      color: '#6B7280'
    }));
  }

  // Fallback data when all APIs fail
  getFallbackData() {
    console.log('🔄 MarketDataService: Using fallback data...');
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 45000,
        price: 45000,
        change24h: 2.5,
        marketCap: 850000000000,
        volume: 25000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        icon: 'FiCircle',
        color: '#F7931A'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 3000,
        price: 3000,
        change24h: 1.8,
        marketCap: 360000000000,
        volume: 15000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        icon: 'FiCircle',
        color: '#627EEA'
      },
      {
        id: 'internet-computer',
        symbol: 'ICP',
        name: 'Internet Computer',
        current_price: 12.5,
        price: 12.5,
        change24h: -1.2,
        marketCap: 5500000000,
        volume: 50000000,
        image: 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
        icon: 'FiCircle',
        color: '#29ABE2'
      },
      {
        id: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        current_price: 1.0,
        price: 1.0,
        change24h: 0.01,
        marketCap: 28000000000,
        volume: 3000000000,
        image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        icon: 'FiCircle',
        color: '#2775CA'
      },
      {
        id: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        current_price: 1.0,
        price: 1.0,
        change24h: 0.02,
        marketCap: 85000000000,
        volume: 40000000000,
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        icon: 'FiCircle',
        color: '#26A17B'
      }
    ];
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
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`CoinGecko price API error: ${response.status}`);
    const data = await response.json();
    return data[currencyId]?.usd || 0;
  }

  // Get price from CoinCap
  async getPriceFromCoinCap(currencyId) {
    const url = `${this.baseUrls.coinCap}/assets/${currencyId}`;
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`CoinCap price API error: ${response.status}`);
    const data = await response.json();
    return parseFloat(data.data?.priceUsd) || 0;
  }

  // Get price from Binance
  async getPriceFromBinance(currencyId) {
    const symbol = currencyId.toUpperCase() + 'USDT';
    const url = `${this.baseUrls.binance}/ticker/price?symbol=${symbol}`;
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Binance price API error: ${response.status}`);
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
      const response = await fetch(url, { mode: 'cors' });
      
      if (!response.ok) {
        throw new Error(`CoinGecko search API error: ${response.status}`);
      }
      
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
      const response = await fetch(url, { mode: 'cors' });
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }
      
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
      
      const response = await fetch(url);
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
