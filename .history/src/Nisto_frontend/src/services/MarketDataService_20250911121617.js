// Market Data Service - Fetches live cryptocurrency data from APIs
// This runs in the frontend to bypass ICP HTTP outcall limitations

class MarketDataService {
  constructor() {
    this.baseUrls = {
      coinGecko: 'https://api.coingecko.com/api/v3',
      coinCap: 'https://api.coincap.io/v2',
      coinMarketCap: 'https://pro-api.coinmarketcap.com/v1'
    };
    
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Get all major cryptocurrencies with live data from CoinGecko
  async getAllCurrencies() {
    console.log('🚀 MarketDataService: Starting to fetch all currencies from CoinGecko...');
    
    try {
      // Fetch all cryptocurrencies from CoinGecko (up to 1000+)
      const url = `${this.baseUrls.coinGecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;
      
      console.log('📡 MarketDataService: Making API request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nisto-Wallet/1.0'
        }
      });

      console.log('📊 MarketDataService: API response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ MarketDataService: Received data from CoinGecko:', {
        totalCoins: data.length,
        firstCoin: data[0] ? {
          id: data[0].id,
          symbol: data[0].symbol,
          name: data[0].name,
          price: data[0].current_price
        } : 'No data',
        lastCoin: data[data.length - 1] ? {
          id: data[data.length - 1].id,
          symbol: data[data.length - 1].symbol,
          name: data[data.length - 1].name,
          price: data[data.length - 1].current_price
        } : 'No data'
      });
      
      // Transform CoinGecko data to our format
      const transformedData = data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        image: coin.image,
        icon: 'FiCircle', // Generic icon - no hardcoded mapping
        color: '#6B7280' // Generic color - no hardcoded mapping
      }));

      console.log('🔄 MarketDataService: Transformed data:', {
        totalTransformed: transformedData.length,
        sampleTransformed: transformedData.slice(0, 3).map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: coin.price,
          change24h: coin.change24h
        }))
      });

      return transformedData;

    } catch (error) {
      console.error('❌ MarketDataService: Error fetching currencies:', error);
      console.log('🚫 MarketDataService: Returning empty array (NO FALLBACK DATA)');
      // NO FALLBACK DATA - return empty array if API fails
      return [];
    }
  }

  // Get specific currency price
  async getCurrencyPrice(currencyId) {
    try {
      const url = `${this.baseUrls.coinGecko}/simple/price?ids=${currencyId}&vs_currencies=usd&include_24hr_change=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data[currencyId]?.usd || 0;
    } catch (error) {
      console.error(`Error fetching price for ${currencyId}:`, error);
      return 0;
    }
  }

  // Search currencies
  async searchCurrencies(query) {
    try {
      const url = `${this.baseUrls.coinGecko}/search?query=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.coins?.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: 0, // Will be fetched separately if needed
        change24h: 0,
        marketCap: coin.market_cap_rank,
        volume: null,
        image: coin.thumb,
        icon: this.getIconForSymbol(coin.symbol),
        color: this.getColorForSymbol(coin.symbol)
      })) || [];

    } catch (error) {
      console.error('Error searching currencies:', error);
      return [];
    }
  }

  // Get exchange rate between two currencies
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      const url = `${this.baseUrls.coinGecko}/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data[fromCurrency]?.[toCurrency] || 0;
    } catch (error) {
      console.error(`Error fetching exchange rate ${fromCurrency}/${toCurrency}:`, error);
      return 0;
    }
  }

  // Get trending cryptocurrencies
  async getTrendingCurrencies() {
    try {
      const url = `${this.baseUrls.coinGecko}/search/trending`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.coins?.map(coin => ({
        id: coin.item.id,
        symbol: coin.item.symbol.toUpperCase(),
        name: coin.item.name,
        price: 0, // Will be fetched separately if needed
        change24h: 0,
        marketCap: coin.item.market_cap_rank,
        volume: null,
        image: coin.item.thumb,
        icon: this.getIconForSymbol(coin.item.symbol),
        color: this.getColorForSymbol(coin.item.symbol)
      })) || [];

    } catch (error) {
      console.error('Error fetching trending currencies:', error);
      return [];
    }
  }

  // Helper methods
  getIconForSymbol(symbol) {
    const iconMap = {
      'btc': 'FiBitcoin',
      'eth': 'FiEthereum',
      'sol': 'FiSun',
      'usdt': 'FiDollarSign',
      'usdc': 'FiDollarSign',
      'bnb': 'FiTrendingUp',
      'ada': 'FiLayers',
      'dot': 'FiCircle',
      'matic': 'FiHexagon',
      'avax': 'FiTriangle',
      'link': 'FiLink',
      'atom': 'FiAtom',
      'near': 'FiZap',
      'ftm': 'FiWind',
      'algo': 'FiCpu',
      'icp': 'FiGlobe'
    };
    
    return iconMap[symbol.toLowerCase()] || 'FiCircle';
  }

  getColorForSymbol(symbol) {
    const colorMap = {
      'btc': '#F7931A',
      'eth': '#627EEA',
      'sol': '#9945FF',
      'usdt': '#26A17B',
      'usdc': '#2775CA',
      'bnb': '#F3BA2F',
      'ada': '#0033AD',
      'dot': '#E6007A',
      'matic': '#8247E5',
      'avax': '#E84142',
      'link': '#2A5ADA',
      'atom': '#2E3148',
      'near': '#00C9B4',
      'ftm': '#1969FF',
      'algo': '#000000',
      'icp': '#29ABE2'
    };
    
    return colorMap[symbol.toLowerCase()] || '#6B7280';
  }

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
