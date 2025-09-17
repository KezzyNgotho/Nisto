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
    try {
      // Fetch all cryptocurrencies from CoinGecko (up to 1000+)
      const url = `${this.baseUrls.coinGecko}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nisto-Wallet/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform CoinGecko data to our format
      return data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        image: coin.image,
        icon: this.getIconForSymbol(coin.symbol),
        color: this.getColorForSymbol(coin.symbol)
      }));

    } catch (error) {
      console.error('Error fetching currencies:', error);
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

  // Fallback data when APIs are unavailable
  getFallbackCurrencies() {
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 45000.0,
        change24h: 2.5,
        marketCap: 900000000000,
        volume: 25000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        icon: 'FiBitcoin',
        color: '#F7931A'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3200.0,
        change24h: 1.8,
        marketCap: 380000000000,
        volume: 15000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        icon: 'FiEthereum',
        color: '#627EEA'
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        price: 95.0,
        change24h: 5.1,
        marketCap: 41000000000,
        volume: 3000000000,
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        icon: 'FiSun',
        color: '#9945FF'
      },
      {
        id: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        price: 1.0,
        change24h: 0.1,
        marketCap: 85000000000,
        volume: 50000000000,
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        icon: 'FiDollarSign',
        color: '#26A17B'
      },
      {
        id: 'internet-computer',
        symbol: 'ICP',
        name: 'Internet Computer',
        price: 12.5,
        change24h: 2.1,
        marketCap: 5800000000,
        volume: 45000000,
        image: 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
        icon: 'FiGlobe',
        color: '#29ABE2'
      }
    ];
  }

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
