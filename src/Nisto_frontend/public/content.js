// Content Script for Nesto Browser Extension
// This script injects into IC dapps to provide wallet functionality

console.log('Nesto Extension Content Script Loaded');

// Inject the Nesto wallet provider into the page
function injectNestoProvider() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = () => {
    console.log('Nesto wallet provider injected');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Create a global Nesto wallet object
window.nestoWallet = {
  isNesto: true,
  version: '1.0.0',
  
  // Check if wallet is connected
  async isConnected() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_CONNECTED_IDENTITY' }, (response) => {
        resolve(response.success && response.isConnected);
      });
    });
  },
  
  // Get connected identity
  async getIdentity() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_CONNECTED_IDENTITY' }, (response) => {
        if (response.success && response.identity) {
          resolve(response.identity);
        } else {
          resolve(null);
        }
      });
    });
  },
  
  // Connect to wallet
  async connect() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GET_IDENTITIES' }, (response) => {
        if (response.success && response.identities.length > 0) {
          // Auto-connect to first identity for now
          const identity = response.identities[0];
          chrome.runtime.sendMessage({ 
            type: 'CONNECT_IDENTITY', 
            data: identity 
          }, (connectResponse) => {
            if (connectResponse.success) {
              resolve(identity);
            } else {
              reject(new Error(connectResponse.error));
            }
          });
        } else {
          reject(new Error('No identities available. Please create one in the Nesto extension.'));
        }
      });
    });
  },
  
  // Disconnect from wallet
  async disconnect() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'DISCONNECT_IDENTITY' }, (response) => {
        resolve(response.success);
      });
    });
  },
  
  // Sign a transaction
  async signTransaction(transaction) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ 
        type: 'SIGN_TRANSACTION', 
        data: transaction 
      }, (response) => {
        if (response.success) {
          resolve(response.signedTransaction);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  },
  
  // Sign a message
  async signMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ 
        type: 'SIGN_MESSAGE', 
        data: message 
      }, (response) => {
        if (response.success) {
          resolve(response.signedMessage);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  },
  
  // Request account access
  async requestAccounts() {
    return new Promise((resolve, reject) => {
      this.connect().then(identity => {
        resolve([identity.principal]);
      }).catch(reject);
    });
  },
  
  // Get account info
  async getAccountInfo() {
    const identity = await this.getIdentity();
    if (!identity) {
      throw new Error('No identity connected');
    }
    
    return {
      principal: identity.principal,
      name: identity.name,
      balance: identity.balance || '0',
      type: 'Internet Computer'
    };
  }
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  switch (request.type) {
    case 'IDENTITY_CONNECTED':
      // Notify the page that an identity was connected
      window.dispatchEvent(new CustomEvent('nestoIdentityConnected', {
        detail: request.data
      }));
      break;
      
    case 'IDENTITY_DISCONNECTED':
      // Notify the page that the identity was disconnected
      window.dispatchEvent(new CustomEvent('nestoIdentityDisconnected'));
      break;
      
    case 'SHOW_NOTIFICATION':
      // Show a notification on the page
      showPageNotification(request.data);
      break;
  }
});

// Show notification on the page
function showPageNotification(data) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #075B5E;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 300px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <div style="font-weight: 600;">${data.title || 'Nesto'}</div>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
        ×
      </button>
    </div>
    <div style="margin-top: 0.5rem; font-size: 0.875rem;">${data.message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Inject the provider when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectNestoProvider);
} else {
  injectNestoProvider();
}

// Also inject when the page is dynamically updated (SPA)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && !window.nestoWallet) {
      injectNestoProvider();
    }
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Expose the wallet to the page
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'NESTO_GET_WALLET') {
    event.source.postMessage({
      type: 'NESTO_WALLET_RESPONSE',
      wallet: window.nestoWallet
    }, event.origin);
  }
});

console.log('Nesto wallet provider ready');
