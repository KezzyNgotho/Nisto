// Popup Script for Nesto Browser Extension

document.addEventListener('DOMContentLoaded', function() {
  console.log('Nesto Extension Popup Loaded');
  
  // Get DOM elements
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const accountInfo = document.getElementById('accountInfo');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const balanceSection = document.getElementById('balanceSection');
  const balance = document.getElementById('balance');
  const identityList = document.getElementById('identityList');
  const createIdentityBtn = document.getElementById('createIdentityBtn');
  const sendBtn = document.getElementById('sendBtn');
  const receiveBtn = document.getElementById('receiveBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  
  // Initialize popup
  initializePopup();
  
  // Event listeners
  connectBtn.addEventListener('click', handleConnect);
  disconnectBtn.addEventListener('click', handleDisconnect);
  createIdentityBtn.addEventListener('click', handleCreateIdentity);
  sendBtn.addEventListener('click', handleSend);
  receiveBtn.addEventListener('click', handleReceive);
  settingsBtn.addEventListener('click', handleSettings);
  
  // Initialize popup state
  async function initializePopup() {
    try {
      // Get connected identity
      const response = await chrome.runtime.sendMessage({ type: 'GET_CONNECTED_IDENTITY' });
      
      if (response.success && response.isConnected && response.identity) {
        updateConnectedState(response.identity);
      } else {
        updateDisconnectedState();
      }
      
      // Load identities
      loadIdentities();
      
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      updateDisconnectedState();
    }
  }
  
  // Update UI for connected state
  function updateConnectedState(identity) {
    statusDot.classList.remove('disconnected');
    statusText.textContent = 'Connected';
    accountInfo.textContent = `${identity.name || 'Unknown'} (${shortenPrincipal(identity.principal)})`;
    
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'block';
    balanceSection.style.display = 'block';
    
    // Update balance (placeholder for now)
    balance.textContent = `${identity.balance || '0'} ICP`;
  }
  
  // Update UI for disconnected state
  function updateDisconnectedState() {
    statusDot.classList.add('disconnected');
    statusText.textContent = 'Disconnected';
    accountInfo.textContent = 'No account connected';
    
    connectBtn.style.display = 'block';
    disconnectBtn.style.display = 'none';
    balanceSection.style.display = 'none';
  }
  
  // Load identities from storage
  async function loadIdentities() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_IDENTITIES' });
      
      if (response.success) {
        displayIdentities(response.identities);
      } else {
        displayIdentities([]);
      }
    } catch (error) {
      console.error('Failed to load identities:', error);
      displayIdentities([]);
    }
  }
  
  // Display identities in the list
  function displayIdentities(identities) {
    if (identities.length === 0) {
      identityList.innerHTML = `
        <div class="identity-item">
          <div class="identity-name">No identities found</div>
          <div class="identity-principal">Create an identity to get started</div>
        </div>
      `;
      return;
    }
    
    identityList.innerHTML = identities.map(identity => `
      <div class="identity-item" data-principal="${identity.principal}">
        <div class="identity-name">${identity.name || 'Unnamed Identity'}</div>
        <div class="identity-principal">${shortenPrincipal(identity.principal)}</div>
      </div>
    `).join('');
    
    // Add click listeners to identity items
    const identityItems = identityList.querySelectorAll('.identity-item');
    identityItems.forEach(item => {
      item.addEventListener('click', () => {
        const principal = item.dataset.principal;
        const identity = identities.find(id => id.principal === principal);
        if (identity) {
          handleIdentitySelect(identity);
        }
      });
    });
  }
  
  // Handle identity selection
  async function handleIdentitySelect(identity) {
    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'CONNECT_IDENTITY', 
        data: identity 
      });
      
      if (response.success) {
        updateConnectedState(identity);
        
        // Update active state in identity list
        const identityItems = identityList.querySelectorAll('.identity-item');
        identityItems.forEach(item => {
          item.classList.remove('active');
          if (item.dataset.principal === identity.principal) {
            item.classList.add('active');
          }
        });
      }
    } catch (error) {
      console.error('Failed to connect identity:', error);
      showError('Failed to connect identity');
    }
  }
  
  // Handle connect button click
  async function handleConnect() {
    try {
      // Get identities first
      const response = await chrome.runtime.sendMessage({ type: 'GET_IDENTITIES' });
      
      if (response.success && response.identities.length > 0) {
        // Auto-connect to first identity
        await handleIdentitySelect(response.identities[0]);
      } else {
        // No identities available, prompt to create one
        showError('No identities available. Please create one first.');
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      showError('Failed to connect wallet');
    }
  }
  
  // Handle disconnect button click
  async function handleDisconnect() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'DISCONNECT_IDENTITY' });
      
      if (response.success) {
        updateDisconnectedState();
        
        // Remove active state from identity list
        const identityItems = identityList.querySelectorAll('.identity-item');
        identityItems.forEach(item => {
          item.classList.remove('active');
        });
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      showError('Failed to disconnect wallet');
    }
  }
  
  // Handle create identity button click
  function handleCreateIdentity() {
    // Open identity creation page
    chrome.tabs.create({
      url: chrome.runtime.getURL('create-identity.html')
    });
  }
  
  // Handle send button click
  function handleSend() {
    // Open send page
    chrome.tabs.create({
      url: chrome.runtime.getURL('send.html')
    });
  }
  
  // Handle receive button click
  function handleReceive() {
    // Open receive page
    chrome.tabs.create({
      url: chrome.runtime.getURL('receive.html')
    });
  }
  
  // Handle settings button click
  function handleSettings() {
    // Open settings page
    chrome.tabs.create({
      url: chrome.runtime.getURL('settings.html')
    });
  }
  
  // Utility functions
  function shortenPrincipal(principal) {
    if (!principal) return '';
    if (principal.length <= 10) return principal;
    return principal.substring(0, 6) + '...' + principal.substring(principal.length - 4);
  }
  
  function showError(message) {
    // Simple error display - could be enhanced with a proper notification system
    console.error(message);
    // You could add a toast notification here
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'IDENTITY_CONNECTED') {
      updateConnectedState(request.data);
    } else if (request.type === 'IDENTITY_DISCONNECTED') {
      updateDisconnectedState();
    }
  });
});
