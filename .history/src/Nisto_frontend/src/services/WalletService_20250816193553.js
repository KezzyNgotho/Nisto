import { Actor, HttpAgent } from '@dfinity/agent';

class WalletService {
  constructor() {
    this.plugWallet = null;
    this.isPlugConnected = false;
    this.supportedWallets = {
      plug: { name: 'Plug Wallet', priority: 1, features: ['icp', 'tokens', 'nfts'] },
      stoic: { name: 'Stoic Wallet', priority: 2, features: ['icp', 'basic'] },
      internal: { name: 'Nisto Wallet', priority: 3, features: ['fiat', 'tracking'] }
    };
  }

  // ============ PLUG WALLET INTEGRATION ============
  
  async detectWallets() {
    const availableWallets = [];
    
    // Check for Plug Wallet
    if (window.ic?.plug) {
      availableWallets.push({
        type: 'plug',
        name: 'Plug Wallet',
        installed: true,
        connected: await this.isPlugConnected()
      });
    }
    
    // Check for Stoic Wallet
    if (window.ic?.stoic) {
      availableWallets.push({
        type: 'stoic', 
        name: 'Stoic Wallet',
        installed: true,
        connected: false // Add stoic connection check
      });
    }

    // Internal wallet is always available
    availableWallets.push({
      type: 'internal',
      name: 'Nisto Wallet',
      installed: true,
      connected: true
    });

    return availableWallets;
  }

  async connectPlugWallet() {
    try {
      if (!window.ic?.plug) {
        throw new Error('Plug wallet not installed. Please install from https://plugwallet.ooo/');
      }

      const result = await window.ic.plug.requestConnect({
        whitelist: [
          process.env.CANISTER_ID_NESTO_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
          'rdmx6-jaaaa-aaaaa-aaadq-cai', // ICP Ledger
          'mxzaz-hqaaa-aaaar-qaada-cai', // ckBTC Ledger
        ],
        host: process.env.NODE_ENV === 'production' 
          ? 'https://mainnet.dfinity.network'
          : 'http://localhost:4943'
      });

      if (result) {
        this.isPlugConnected = true;
        this.plugWallet = window.ic.plug;
        
        // Get wallet info
        const principalId = await this.plugWallet.getPrincipal();
        const accountId = await this.plugWallet.getAccountId();
        
        return {
          success: true,
          principalId: principalId.toString(),
          accountId,
          walletType: 'plug'
        };
      }
      
      throw new Error('Connection rejected by user');
    } catch (error) {
      console.error('Plug wallet connection failed:', error);
      throw error;
    }
  }

  async disconnectPlugWallet() {
    try {
      if (this.plugWallet) {
        await this.plugWallet.disconnect();
        this.isPlugConnected = false;
        this.plugWallet = null;
      }
      return { success: true };
    } catch (error) {
      console.error('Disconnect failed:', error);
      throw error;
    }
  }

  async isPlugConnected() {
    try {
      if (!window.ic?.plug) return false;
      return await window.ic.plug.isConnected();
    } catch (error) {
      return false;
    }
  }

  // ============ BALANCE MANAGEMENT ============
  
  async getPlugBalances() {
    try {
      if (!this.isPlugConnected || !this.plugWallet) {
        throw new Error('Plug wallet not connected');
      }

      const balances = await this.plugWallet.requestBalance();
      const tokens = await this.plugWallet.getTokens();
      
      return {
        icp: {
          amount: balances[0]?.amount || 0,
          decimals: balances[0]?.decimals || 8,
          symbol: 'ICP'
        },
        tokens: tokens.map(token => ({
          canisterId: token.canisterId,
          amount: token.amount,
          decimals: token.decimals,
          symbol: token.symbol,
          name: token.name
        }))
      };
    } catch (error) {
      console.error('Failed to get Plug balances:', error);
      throw error;
    }
  }

  async getAllWalletBalances(backendService) {
    const walletData = {
      internal: [],
      crypto: [],
      total: { fiat: 0, crypto: 0 }
    };

    try {
      // Get internal Nesto wallets
      const internalWallets = await backendService.getUserWallets();
      if (internalWallets.ok) {
        walletData.internal = internalWallets.ok.map(wallet => ({
          id: wallet.id,
          name: wallet.name,
          type: 'fiat',
          currency: wallet.currency,
          balance: wallet.balance,
          provider: 'nesto'
        }));
        
        // Calculate total fiat value (assuming KES as base)
        walletData.total.fiat = internalWallets.ok.reduce((sum, w) => sum + w.balance, 0);
      }

      // Get Plug wallet balances if connected
      if (this.isPlugConnected) {
        const plugBalances = await this.getPlugBalances();
        
        // Add ICP balance
        walletData.crypto.push({
          id: 'plug_icp',
          name: 'ICP Wallet',
          type: 'crypto',
          currency: 'ICP',
          balance: plugBalances.icp.amount,
          decimals: plugBalances.icp.decimals,
          provider: 'plug'
        });

        // Add token balances
        plugBalances.tokens.forEach(token => {
          walletData.crypto.push({
            id: `plug_${token.canisterId}`,
            name: `${token.name} Wallet`,
            type: 'crypto',
            currency: token.symbol,
            balance: token.amount,
            decimals: token.decimals,
            provider: 'plug'
          });
        });
      }

      return walletData;
    } catch (error) {
      console.error('Failed to get all wallet balances:', error);
      return walletData;
    }
  }

  // ============ TRANSACTION METHODS ============
  
  async sendICP(recipient, amount, memo = '') {
    try {
      if (!this.isPlugConnected || !this.plugWallet) {
        throw new Error('Plug wallet not connected');
      }

      const result = await this.plugWallet.requestTransfer({
        to: recipient,
        amount: amount,
        opts: memo ? { memo: memo } : undefined
      });

      if (result.height) {
        return {
          success: true,
          blockHeight: result.height,
          transactionId: result.height.toString(),
          amount,
          recipient,
          memo
        };
      }

      throw new Error('Transaction failed');
    } catch (error) {
      console.error('ICP transfer failed:', error);
      throw error;
    }
  }

  async sendToken(canisterId, recipient, amount, decimals = 8) {
    try {
      if (!this.isPlugConnected || !this.plugWallet) {
        throw new Error('Plug wallet not connected');
      }

      const result = await this.plugWallet.requestTransferToken({
        canisterId,
        to: recipient,
        amount,
        decimals
      });

      return {
        success: true,
        result,
        canisterId,
        amount,
        recipient
      };
    } catch (error) {
      console.error('Token transfer failed:', error);
      throw error;
    }
  }

  // ============ UTILITY METHODS ============
  
  formatBalance(amount, decimals = 8, symbol = '') {
    const formatted = (amount / Math.pow(10, decimals)).toFixed(4);
    return `${formatted} ${symbol}`.trim();
  }

  formatCurrency(amount, currency = 'KES') {
    if (currency === 'ICP' || currency === 'ckBTC') {
      return this.formatBalance(amount, 8, currency);
    }
    
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  // ============ M-PESA INTEGRATION (Future) ============
  
  async connectMPesa(phoneNumber) {
    // Placeholder for M-Pesa STK Push integration
    throw new Error('M-Pesa integration coming soon');
  }

  async sendMPesa(phoneNumber, amount, description) {
    // Placeholder for M-Pesa send money
    throw new Error('M-Pesa integration coming soon');
  }

  // ============ CROSS-CHAIN BRIDGE (Future) ============
  
  async bridgeToEthereum(amount, ethereumAddress) {
    // Placeholder for cross-chain bridge
    throw new Error('Cross-chain bridge coming soon');
  }
}

// Create singleton instance
const walletService = new WalletService();

export default walletService; 