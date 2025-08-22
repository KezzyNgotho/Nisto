// Injected Script for Nesto Browser Extension
// This script provides the wallet interface to IC dapps

(function() {
  'use strict';
  
  console.log('Nesto Wallet Provider Injected');
  
  // Create the Nesto provider
  const NestoProvider = {
    isNesto: true,
    isConnected: false,
    selectedAccount: null,
    
    // Provider events
    on: function(eventName, callback) {
      if (!this._events) this._events = {};
      if (!this._events[eventName]) this._events[eventName] = [];
      this._events[eventName].push(callback);
    },
    
    removeListener: function(eventName, callback) {
      if (!this._events || !this._events[eventName]) return;
      this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    },
    
    emit: function(eventName, data) {
      if (!this._events || !this._events[eventName]) return;
      this._events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Nesto provider event error:', error);
        }
      });
    },
    
    // Check if wallet is connected
    async isConnected() {
      if (window.nestoWallet) {
        return await window.nestoWallet.isConnected();
      }
      return false;
    },
    
    // Request account access
    async requestAccounts() {
      if (window.nestoWallet) {
        return await window.nestoWallet.requestAccounts();
      }
      throw new Error('Nesto wallet not available');
    },
    
    // Get accounts
    async getAccounts() {
      if (window.nestoWallet) {
        const identity = await window.nestoWallet.getIdentity();
        return identity ? [identity.principal] : [];
      }
      return [];
    },
    
    // Sign transaction
    async signTransaction(transaction) {
      if (window.nestoWallet) {
        return await window.nestoWallet.signTransaction(transaction);
      }
      throw new Error('Nesto wallet not available');
    },
    
    // Sign message
    async signMessage(message) {
      if (window.nestoWallet) {
        return await window.nestoWallet.signMessage(message);
      }
      throw new Error('Nesto wallet not available');
    },
    
    // Connect to wallet
    async connect() {
      if (window.nestoWallet) {
        const identity = await window.nestoWallet.connect();
        this.isConnected = true;
        this.selectedAccount = identity.principal;
        this.emit('accountsChanged', [identity.principal]);
        return identity;
      }
      throw new Error('Nesto wallet not available');
    },
    
    // Disconnect from wallet
    async disconnect() {
      if (window.nestoWallet) {
        await window.nestoWallet.disconnect();
        this.isConnected = false;
        this.selectedAccount = null;
        this.emit('accountsChanged', []);
      }
    },
    
    // Get account info
    async getAccountInfo() {
      if (window.nestoWallet) {
        return await window.nestoWallet.getAccountInfo();
      }
      throw new Error('Nesto wallet not available');
    },
    
    // IC-specific methods
    async callCanister(canisterId, method, args) {
      if (window.nestoWallet) {
        const transaction = {
          type: 'canister_call',
          canisterId,
          method,
          args,
          timestamp: Date.now()
        };
        return await window.nestoWallet.signTransaction(transaction);
      }
      throw new Error('Nesto wallet not available');
    },
    
    async transferICP(to, amount) {
      if (window.nestoWallet) {
        const transaction = {
          type: 'icp_transfer',
          to,
          amount,
          timestamp: Date.now()
        };
        return await window.nestoWallet.signTransaction(transaction);
      }
      throw new Error('Nesto wallet not available');
    }
  };
  
  // Listen for wallet events
  window.addEventListener('nestoIdentityConnected', (event) => {
    NestoProvider.isConnected = true;
    NestoProvider.selectedAccount = event.detail.principal;
    NestoProvider.emit('accountsChanged', [event.detail.principal]);
    NestoProvider.emit('connect', event.detail);
  });
  
  window.addEventListener('nestoIdentityDisconnected', () => {
    NestoProvider.isConnected = false;
    NestoProvider.selectedAccount = null;
    NestoProvider.emit('accountsChanged', []);
    NestoProvider.emit('disconnect');
  });
  
  // Expose the provider to the page
  window.nesto = NestoProvider;
  
  // Also expose as window.ethereum for compatibility (with IC methods)
  if (!window.ethereum) {
    window.ethereum = {
      ...NestoProvider,
      isMetaMask: false,
      isNesto: true,
      chainId: '0x1', // IC doesn't use chainId, but some dapps expect it
      
      // Override request method for IC compatibility
      async request(request) {
        switch (request.method) {
          case 'eth_requestAccounts':
            return await NestoProvider.requestAccounts();
          case 'eth_accounts':
            return await NestoProvider.getAccounts();
          case 'eth_chainId':
            return '0x1'; // IC chain ID
          case 'personal_sign':
            return await NestoProvider.signMessage(request.params[0]);
          case 'ic_requestAccounts':
            return await NestoProvider.requestAccounts();
          case 'ic_accounts':
            return await NestoProvider.getAccounts();
          case 'ic_signTransaction':
            return await NestoProvider.signTransaction(request.params[0]);
          case 'ic_callCanister':
            return await NestoProvider.callCanister(
              request.params[0],
              request.params[1],
              request.params[2]
            );
          case 'ic_transferICP':
            return await NestoProvider.transferICP(
              request.params[0],
              request.params[1]
            );
          default:
            throw new Error(`Method ${request.method} not supported`);
        }
      }
    };
  }
  
  // Notify the page that the provider is ready
  window.dispatchEvent(new CustomEvent('nestoProviderReady', {
    detail: NestoProvider
  }));
  
  console.log('Nesto provider ready and exposed to page');
})();
