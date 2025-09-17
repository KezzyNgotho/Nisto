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
    console.log(`💰 MarketDataService: Fetching price for ${currencyId}...`);
    
    try {
      const url = `${this.baseUrls.coinGecko}/simple/price?ids=${currencyId}&vs_currencies=usd&include_24hr_change=true`;
      
      console.log(`📡 MarketDataService: Price API request to:`, url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      const price = data[currencyId]?.usd || 0;
      console.log(`✅ MarketDataService: Price for ${currencyId}: $${price}`);
      
      return price;
    } catch (error) {
      console.error(`❌ MarketDataService: Error fetching price for ${currencyId}:`, error);
      return 0;
    }
  }

  // Search currencies
  async searchCurrencies(query) {
    console.log(`🔍 MarketDataService: Searching for "${query}"...`);
    
    try {
      const url = `${this.baseUrls.coinGecko}/search?query=${encodeURIComponent(query)}`;
      
      console.log(`📡 MarketDataService: Search API request to:`, url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`✅ MarketDataService: Search results for "${query}":`, {
        totalResults: data.coins?.length || 0,
        sampleResults: data.coins?.slice(0, 3).map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name
        })) || []
      });
      
      return data.coins?.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: 0, // Will be fetched separately if needed
        change24h: 0,
        marketCap: coin.market_cap_rank,
        volume: null,
        image: coin.thumb,
        icon: 'FiCircle', // Generic icon
        color: '#6B7280' // Generic color
      })) || [];

    } catch (error) {
      console.error('❌ MarketDataService: Error searching currencies:', error);
      return [];
    }
  }

  // Get exchange rate between two currencies
  async getExchangeRate(fromCurrency, toCurrency) {
    console.log(`💱 MarketDataService: Getting exchange rate ${fromCurrency}/${toCurrency}...`);
    
    try {
      const url = `${this.baseUrls.coinGecko}/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`;
      
      console.log(`📡 MarketDataService: Exchange rate API request to:`, url);
      
      const response = await fetch(url);
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
