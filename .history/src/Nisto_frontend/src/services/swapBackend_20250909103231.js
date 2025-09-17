import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/Nisto_backend';

class SwapBackendService {
  constructor() {
    this.agent = null;
    this.actor = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create agent
      this.agent = new HttpAgent({
        host: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:4943' 
          : 'https://ic0.app'
      });

      // In development, fetch the root key
      if (process.env.NODE_ENV === 'development') {
        await this.agent.fetchRootKey();
      }

      // Create actor
      const canisterId = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_BACKEND_CANISTER_ID || 'rrkah-fqaaa-aaaah-qcvmq-cai'
        : process.env.REACT_APP_BACKEND_CANISTER_ID;

      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: canisterId
      });

      this.isInitialized = true;
      console.log('SwapBackendService initialized with main backend canister:', canisterId);
    } catch (error) {
      console.error('Failed to initialize SwapBackendService:', error);
      throw error;
    }
  }

  // Currency management
  async getAllCurrencies() {
    await this.initialize();
    try {
      const currencies = await this.actor.getAllCurrencies();
      return currencies.map(currency => ({
        id: currency.id,
        symbol: currency.symbol,
        name: currency.name,
        price: currency.price,
        change24h: currency.change24h,
        marketCap: currency.marketCap?.[0],
        volume: currency.volume?.[0],
        image: currency.image,
        icon: currency.icon,
        color: currency.color
      }));
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  async getCurrency(symbol) {
    await this.initialize();
    try {
      const currency = await this.actor.getCurrency(symbol);
      if (currency) {
        return {
          id: currency.id,
          symbol: currency.symbol,
          name: currency.name,
          price: currency.price,
          change24h: currency.change24h,
          marketCap: currency.marketCap?.[0],
          volume: currency.volume?.[0],
          image: currency.image,
          icon: currency.icon,
          color: currency.color
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching currency:', error);
      throw error;
    }
  }

  async searchCurrencies(query) {
    await this.initialize();
    try {
      const currencies = await this.actor.searchCurrencies(query);
      return currencies.map(currency => ({
        id: currency.id,
        symbol: currency.symbol,
        name: currency.name,
        price: currency.price,
        change24h: currency.change24h,
        marketCap: currency.marketCap?.[0],
        volume: currency.volume?.[0],
        image: currency.image,
        icon: currency.icon,
        color: currency.color
      }));
    } catch (error) {
      console.error('Error searching currencies:', error);
      throw error;
    }
  }

  // Market data
  async getMarketData() {
    await this.initialize();
    try {
      const data = await this.actor.getMarketData();
      if (data) {
        return {
          totalVolume24h: data.totalVolume24h,
          totalPairs: data.totalPairs,
          averageFee: data.averageFee,
          activeUsers: data.activeUsers,
          timestamp: data.timestamp
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Exchange rate calculations
  async calculateExchangeRate(fromCurrency, toCurrency) {
    await this.initialize();
    try {
      const result = await this.actor.calculateExchangeRate(fromCurrency, toCurrency);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error calculating exchange rate:', error);
      throw error;
    }
  }

  async calculateSwapAmount(fromCurrency, toCurrency, fromAmount) {
    await this.initialize();
    try {
      const result = await this.actor.calculateSwapAmount(fromCurrency, toCurrency, fromAmount);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error calculating swap amount:', error);
      throw error;
    }
  }

  // Gas fee calculations
  async getGasFee(fromCurrency, toCurrency) {
    await this.initialize();
    try {
      const gasFee = await this.actor.getGasFee(fromCurrency, toCurrency);
      if (gasFee) {
        return {
          amount: gasFee.amount,
          currency: gasFee.currency,
          usdEquivalent: gasFee.usdEquivalent,
          estimatedTime: gasFee.estimatedTime,
          swapType: gasFee.swapType
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching gas fee:', error);
      throw error;
    }
  }

  async calculatePriceImpact(fromCurrency, toCurrency, fromAmount) {
    await this.initialize();
    try {
      return await this.actor.calculatePriceImpact(fromCurrency, toCurrency, fromAmount);
    } catch (error) {
      console.error('Error calculating price impact:', error);
      throw error;
    }
  }

  // Swap execution
  async executeSwap(swapRequest) {
    await this.initialize();
    try {
      const result = await this.actor.executeSwap({
        fromCurrency: swapRequest.fromCurrency,
        toCurrency: swapRequest.toCurrency,
        fromAmount: swapRequest.fromAmount,
        slippage: swapRequest.slippage,
        userPrincipal: swapRequest.userPrincipal
      });

      if (result.ok) {
        return {
          success: result.ok.success,
          transactionId: result.ok.transactionId?.[0],
          fromAmount: result.ok.fromAmount,
          toAmount: result.ok.toAmount,
          rate: result.ok.rate,
          gasFee: result.ok.gasFee,
          priceImpact: result.ok.priceImpact,
          minimumReceived: result.ok.minimumReceived,
          timestamp: result.ok.timestamp,
          error: result.ok.error?.[0]
        };
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  // Swap history
  async getSwapHistory(userPrincipal) {
    await this.initialize();
    try {
      const history = await this.actor.getSwapHistory(userPrincipal);
      return history.map(swap => ({
        id: swap.id,
        fromCurrency: swap.fromCurrency,
        toCurrency: swap.toCurrency,
        fromAmount: swap.fromAmount,
        toAmount: swap.toAmount,
        rate: swap.rate,
        gasFee: swap.gasFee,
        priceImpact: swap.priceImpact,
        status: swap.status,
        timestamp: swap.timestamp,
        userPrincipal: swap.userPrincipal
      }));
    } catch (error) {
      console.error('Error fetching swap history:', error);
      throw error;
    }
  }

  async getSwapById(swapId) {
    await this.initialize();
    try {
      const swap = await this.actor.getSwapById(swapId);
      if (swap) {
        return {
          id: swap.id,
          fromCurrency: swap.fromCurrency,
          toCurrency: swap.toCurrency,
          fromAmount: swap.fromAmount,
          toAmount: swap.toAmount,
          rate: swap.rate,
          gasFee: swap.gasFee,
          priceImpact: swap.priceImpact,
          status: swap.status,
          timestamp: swap.timestamp,
          userPrincipal: swap.userPrincipal
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching swap by ID:', error);
      throw error;
    }
  }

  // Admin functions (for development/testing)
  async updateCurrencyPrice(symbol, newPrice) {
    await this.initialize();
    try {
      return await this.actor.updateCurrencyPrice(symbol, newPrice);
    } catch (error) {
      console.error('Error updating currency price:', error);
      throw error;
    }
  }

  async addCurrency(currency) {
    await this.initialize();
    try {
      return await this.actor.addCurrency({
        id: currency.id,
        symbol: currency.symbol,
        name: currency.name,
        price: currency.price,
        change24h: currency.change24h,
        marketCap: currency.marketCap ? [currency.marketCap] : [],
        volume: currency.volume ? [currency.volume] : [],
        image: currency.image,
        icon: currency.icon,
        color: currency.color
      });
    } catch (error) {
      console.error('Error adding currency:', error);
      throw error;
    }
  }

  async updateMarketData(data) {
    await this.initialize();
    try {
      return await this.actor.updateMarketData({
        totalVolume24h: data.totalVolume24h,
        totalPairs: data.totalPairs,
        averageFee: data.averageFee,
        activeUsers: data.activeUsers,
        timestamp: data.timestamp
      });
    } catch (error) {
      console.error('Error updating market data:', error);
      throw error;
    }
  }

  async getStats() {
    await this.initialize();
    try {
      return await this.actor.getStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Clear all data (for testing)
  async clearAllData() {
    await this.initialize();
    try {
      return await this.actor.clearAllData();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const swapBackendService = new SwapBackendService();

export default swapBackendService;
