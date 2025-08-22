// Background Service Worker for Nesto Browser Extension
console.log('Nesto Extension Background Service Worker Loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Nesto Extension Installed:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    chrome.storage.local.set({
      isFirstTime: true,
      identities: [],
      settings: {
        autoConnect: false,
        notifications: true,
        theme: 'light'
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.type) {
    case 'GET_IDENTITIES':
      handleGetIdentities(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'SIGN_TRANSACTION':
      handleSignTransaction(request.data, sendResponse);
      return true;
      
    case 'CONNECT_IDENTITY':
      handleConnectIdentity(request.data, sendResponse);
      return true;
      
    case 'DISCONNECT_IDENTITY':
      handleDisconnectIdentity(sendResponse);
      return true;
      
    case 'GET_CONNECTED_IDENTITY':
      handleGetConnectedIdentity(sendResponse);
      return true;
      
    case 'SHOW_NOTIFICATION':
      handleShowNotification(request.data);
      break;
      
    default:
      console.log('Unknown message type:', request.type);
  }
});

// Handle identity management
async function handleGetIdentities(sendResponse) {
  try {
    const result = await chrome.storage.local.get(['identities']);
    sendResponse({ success: true, identities: result.identities || [] });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleConnectIdentity(identityData, sendResponse) {
  try {
    await chrome.storage.local.set({ 
      connectedIdentity: identityData,
      isConnected: true 
    });
    
    // Notify all tabs about the connection
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'IDENTITY_CONNECTED',
          data: identityData
        }).catch(() => {
          // Tab might not have content script
        });
      });
    });
    
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDisconnectIdentity(sendResponse) {
  try {
    await chrome.storage.local.remove(['connectedIdentity', 'isConnected']);
    
    // Notify all tabs about the disconnection
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'IDENTITY_DISCONNECTED'
        }).catch(() => {
          // Tab might not have content script
        });
      });
    });
    
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGetConnectedIdentity(sendResponse) {
  try {
    const result = await chrome.storage.local.get(['connectedIdentity', 'isConnected']);
    sendResponse({ 
      success: true, 
      identity: result.connectedIdentity || null,
      isConnected: result.isConnected || false
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle transaction signing
async function handleSignTransaction(transactionData, sendResponse) {
  try {
    // Get connected identity
    const result = await chrome.storage.local.get(['connectedIdentity']);
    if (!result.connectedIdentity) {
      sendResponse({ success: false, error: 'No identity connected' });
      return;
    }
    
    // Here you would implement the actual signing logic
    // For now, we'll simulate the signing process
    const signedTransaction = await simulateSignTransaction(transactionData, result.connectedIdentity);
    
    sendResponse({ success: true, signedTransaction });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Simulate transaction signing (replace with actual IC signing)
async function simulateSignTransaction(transactionData, identity) {
  // This is a placeholder - implement actual IC transaction signing
  return {
    ...transactionData,
    signature: 'simulated_signature_' + Date.now(),
    signedBy: identity.principal,
    timestamp: Date.now()
  };
}

// Handle notifications
function handleShowNotification(data) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128x128.png',
    title: data.title || 'Nesto',
    message: data.message || 'You have a new notification'
  });
}

// Handle tab updates to inject content scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Check if this is an IC-related site
    if (tab.url.includes('ic0.app') || tab.url.includes('localhost')) {
      // Inject our content script
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(() => {
        // Script might already be injected
      });
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup or handle click
  console.log('Extension icon clicked on tab:', tab.id);
});
