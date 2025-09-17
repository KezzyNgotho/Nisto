// API Testing Service for Nisto
// Tests each API endpoint individually to ensure they work

class APITester {
  constructor() {
    this.results = {
      coingecko: { status: 'pending', data: null, error: null },
      exchangeRate: { status: 'pending', data: null, error: null },
      binance: { status: 'pending', data: null, error: null },
      customNST: { status: 'pending', data: null, error: null }
    };
  }

  // Test CoinGecko API
  async testCoinGecko() {
    console.log('🔄 Testing CoinGecko API...');
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.results.coingecko = {
        status: 'success',
        data: data.slice(0, 5), // Show first 5 for testing
        error: null
      };
      
      console.log('✅ CoinGecko API working!', data.slice(0, 3));
      return data;
    } catch (error) {
      this.results.coingecko = {
        status: 'error',
        data: null,
        error: error.message
      };
      console.error('❌ CoinGecko API failed:', error.message);
      throw error;
    }
  }

  // Test ExchangeRate API
  async testExchangeRate() {
    console.log('🔄 Testing ExchangeRate API...');
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.results.exchangeRate = {
        status: 'success',
        data: {
          base: data.base,
          rates: {
            KES: data.rates.KES,
            EUR: data.rates.EUR,
            GBP: data.rates.GBP
          }
        },
        error: null
      };
      
      console.log('✅ ExchangeRate API working!', data.rates.KES);
      return data;
    } catch (error) {
      this.results.exchangeRate = {
        status: 'error',
        data: null,
        error: error.message
      };
      console.error('❌ ExchangeRate API failed:', error.message);
      throw error;
    }
  }

  // Test Binance API
  async testBinance() {
    console.log('🔄 Testing Binance API...');
    try {
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.results.binance = {
        status: 'success',
        data: data,
        error: null
      };
      
      console.log('✅ Binance API working!', data);
      return data;
    } catch (error) {
      this.results.binance = {
        status: 'error',
        data: null,
        error: error.message
      };
      console.error('❌ Binance API failed:', error.message);
      throw error;
    }
  }

  // Test Custom NST Price (Mock)
  async testCustomNST() {
    console.log('🔄 Testing Custom NST Price...');
    try {
      // Mock NST price - in production this would come from your backend
      const mockNSTData = {
        price: 0.85,
        change24h: 5.25,
        volume24h: 125000,
        timestamp: Date.now()
      };
      
      this.results.customNST = {
        status: 'success',
        data: mockNSTData,
        error: null
      };
      
      console.log('✅ Custom NST Price working!', mockNSTData);
      return mockNSTData;
    } catch (error) {
      this.results.customNST = {
        status: 'error',
        data: null,
        error: error.message
      };
      console.error('❌ Custom NST Price failed:', error.message);
      throw error;
    }
  }

  // Test all APIs
  async testAllAPIs() {
    console.log('🚀 Starting API tests...');
    const results = {};
    
    try {
      results.coingecko = await this.testCoinGecko();
    } catch (error) {
      console.log('CoinGecko failed, continuing...');
    }
    
    try {
      results.exchangeRate = await this.testExchangeRate();
    } catch (error) {
      console.log('ExchangeRate failed, continuing...');
    }
    
    try {
      results.binance = await this.testBinance();
    } catch (error) {
      console.log('Binance failed, continuing...');
    }
    
    try {
      results.customNST = await this.testCustomNST();
    } catch (error) {
      console.log('Custom NST failed, continuing...');
    }
    
    console.log('📊 API Test Results:', this.results);
    return this.results;
  }

  // Get test results
  getResults() {
    return this.results;
  }

  // Get working APIs
  getWorkingAPIs() {
    return Object.entries(this.results)
      .filter(([key, result]) => result.status === 'success')
      .map(([key, result]) => key);
  }

  // Get failed APIs
  getFailedAPIs() {
    return Object.entries(this.results)
      .filter(([key, result]) => result.status === 'error')
      .map(([key, result]) => ({ api: key, error: result.error }));
  }
}

// Create singleton instance
const apiTester = new APITester();

export default apiTester;
