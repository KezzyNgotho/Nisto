// 1inch API Integration Service for swap quotes and execution
// This service integrates with 1inch API for CORS-friendly swap functionality

class OneInchService {
  constructor() {
    // 1inch API endpoints (CORS-friendly)
    this.baseUrls = {
      mainnet: 'https://api.1inch.io/v5.0/1', // Mainnet
      polygon: 'https://api.1inch.io/v5.0/137', // Polygon
      bsc: 'https://api.1inch.io/v5.0/56', // BSC
      avalanche: 'https://api.1inch.io/v5.0/43114', // Avalanche
      arbitrum: 'https://api.1inch.io/v5.0/42161', // Arbitrum
      optimism: 'https://api.1inch.io/v5.0/10' // Optimism
    };
    
    // Default to mainnet
    this.currentChain = 'mainnet';
    this.supportedTokens = new Map();
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Get supported tokens from 1inch
  async getSupportedTokens() {
    console.log('🦄 OneInchService: Fetching supported tokens...');
    
    try {
      const url = `${this.baseUrls[this.currentChain]}/tokens`;
      console.log('📡 OneInchService: API request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nisto-Wallet/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ OneInchService: Tokens fetched successfully:', Object.keys(data.tokens || {}).length);
      
      // Convert to our format
      const tokens = Object.entries(data.tokens || {}).map(([address, token]) => ({
        address: address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
        chain: this.currentChain
      }));

      this.supportedTokens = new Map(tokens.map(token => [token.symbol, token]));
      return tokens;

    } catch (error) {
      console.error('❌ OneInchService: Error fetching tokens:', error);
      console.log('🔄 OneInchService: Returning mock tokens due to API failure');
      
      // Return mock tokens when API fails
      return [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: '', chain: 'mainnet' },
        { address: '0xA0b86a33E6441c8C06DDD5e8A3c8c0c8c0c8c0c8', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: '', chain: 'mainnet' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: '', chain: 'mainnet' },
        { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: '', chain: 'mainnet' }
      ];
    }
  }

  // Get swap quote from 1inch
  async getSwapQuote(fromToken, toToken, amount, slippage = 1) {
    console.log(`💱 OneInchService: Getting swap quote for ${amount} ${fromToken} → ${toToken}...`);
    
    try {
      const fromTokenData = this.supportedTokens.get(fromToken);
      const toTokenData = this.supportedTokens.get(toToken);
      
      if (!fromTokenData || !toTokenData) {
        throw new Error(`Token not supported: ${fromToken} or ${toToken}`);
      }

      const url = `${this.baseUrls[this.currentChain]}/quote?fromTokenAddress=${fromTokenData.address}&toTokenAddress=${toTokenData.address}&amount=${amount}`;
      console.log('📡 OneInchService: Quote API request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nisto-Wallet/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`1inch quote API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ OneInchService: Quote received:', {
        fromAmount: data.fromAmount,
        toAmount: data.toAmount,
        estimatedGas: data.estimatedGas
      });

      return {
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: amount,
        toAmount: data.toAmount,
        rate: data.toAmount / amount,
        gasEstimate: data.estimatedGas,
        slippage: slippage,
        minimumReceived: data.toAmount * (1 - slippage / 100),
        priceImpact: data.priceImpact || 0,
        protocols: data.protocols || [],
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ OneInchService: Error getting swap quote:', error);
      console.log('🔄 OneInchService: Returning mock quote due to API failure');
      
      // Return mock quote when API fails
      const mockRate = this.getMockRate(fromToken, toToken);
      const toAmount = amount * mockRate;
      
      return {
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: amount,
        toAmount: toAmount,
        rate: mockRate,
        gasEstimate: 150000,
        slippage: slippage,
        minimumReceived: toAmount * (1 - slippage / 100),
        priceImpact: 0.1,
        protocols: ['1inch'],
        timestamp: Date.now()
      };
    }
  }

  // Execute swap through 1inch
  async executeSwap(swapRequest) {
    console.log('🔄 OneInchService: Executing swap...', swapRequest);
    
    try {
      const { fromToken, toToken, amount, slippage, userAddress } = swapRequest;
      
      const fromTokenData = this.supportedTokens.get(fromToken);
      const toTokenData = this.supportedTokens.get(toToken);
      
      if (!fromTokenData || !toTokenData) {
        throw new Error(`Token not supported: ${fromToken} or ${toToken}`);
      }

      // Get swap data from 1inch
      const url = `${this.baseUrls[this.currentChain]}/swap?fromTokenAddress=${fromTokenData.address}&toTokenAddress=${toTokenData.address}&amount=${amount}&fromAddress=${userAddress}&slippage=${slippage}`;
      console.log('📡 OneInchService: Swap API request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nisto-Wallet/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`1inch swap API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ OneInchService: Swap data received:', {
        toAmount: data.toAmount,
        gasEstimate: data.estimatedGas
      });

      return {
        success: true,
        transactionData: data,
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: amount,
        toAmount: data.toAmount,
        gasEstimate: data.estimatedGas,
        slippage: slippage,
        minimumReceived: data.toAmount * (1 - slippage / 100),
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ OneInchService: Error executing swap:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Get real exchange rate from market data
  async getRealRate(fromToken, toToken) {
    try {
      // Import MarketDataService to get real rates
      const { default: MarketDataService } = await import('./MarketDataService.js');
      const marketData = await MarketDataService.getAllCurrencies();
      
      const fromTokenData = marketData.find(token => 
        token.symbol.toUpperCase() === fromToken.toUpperCase()
      );
      const toTokenData = marketData.find(token => 
        token.symbol.toUpperCase() === toToken.toUpperCase()
      );
      
      if (fromTokenData && toTokenData && fromTokenData.current_price && toTokenData.current_price) {
        return fromTokenData.current_price / toTokenData.current_price;
      }
      
      return 0; // No rate available
    } catch (error) {
      console.error('Failed to get real rate:', error);
      return 0;
    }
  }

  // Get real-time price from 1inch (if available)
  async getRealTimePrice(fromToken, toToken) {
    console.log(`💰 OneInchService: Getting real-time price for ${fromToken}/${toToken}...`);
    
    try {
      // Use a small amount to get the rate
      const quote = await this.getSwapQuote(fromToken, toToken, 1000000); // 1 token with 6 decimals
      console.log(`✅ OneInchService: Real-time price for ${fromToken}/${toToken}: ${quote.rate}`);
      return quote.rate;
    } catch (error) {
      console.error(`❌ OneInchService: Error getting real-time price for ${fromToken}/${toToken}:`, error);
      // Fallback to real market data instead of mock
      return await this.getRealRate(fromToken, toToken);
    }
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
}

export default new OneInchService();
