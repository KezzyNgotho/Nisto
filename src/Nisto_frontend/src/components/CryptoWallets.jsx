import React,{ useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiCopy, 
  FiCheck, 
  FiExternalLink, 
  FiDownload,
  FiMaximize2,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

function CryptoWallets() {
  const { 
    cryptoWallets, 
    createCryptoWallet, 
    updateCryptoWalletBalance, 
    refreshCryptoWallets,
    isLoading,
    actor
  } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [newWalletData, setNewWalletData] = useState({
    name: '',
    currency: 'ICP',
    isExternal: false,
    address: '',
    externalWalletType: ''
  });
  const [newBalance, setNewBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [showFullAddress, setShowFullAddress] = useState({});
  const [depositAddresses, setDepositAddresses] = useState({});
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const supportedCurrencies = [
    'ICP', 'ckBTC', 'ckETH', 'CHAT', 'SNS1', 'KINIC', 'MODCLUB', 'BOOM',
    'DRAGGINZ', 'ELNA', 'GLDT', 'NANAS', 'PANDA', 'SEERS', 'DSCVR', 
    'CYCLES', 'DKUMA', 'OPENCHAT'
  ];

  const externalWalletTypes = [
    'Plug', 'Stoic', 'Bitfinity', 'NFID', 'MetaMask', 'Trust Wallet', 'Coinbase Wallet'
  ];

  useEffect(() => {
    refreshCryptoWallets();
  }, []);

  // Load deposit address when deposit modal is opened
  useEffect(() => {
    if (showDepositModal && selectedWallet && !depositAddresses[selectedWallet.currency]) {
      getDepositAddress(selectedWallet.currency);
    }
  }, [showDepositModal, selectedWallet]);

  // Remove the separate useEffect for loading deposit addresses
  // We'll load them on-demand instead

  // Load real deposit addresses from backend - simplified version
  const loadDepositAddresses = async () => {
    if (!actor || !cryptoWallets || cryptoWallets.length === 0) return;
    
    setIsLoadingAddresses(true);
    try {
      // Only load addresses if user has crypto wallets
      const result = await actor.getDepositAddresses();
      if ('ok' in result) {
        const addresses = {};
        result.ok.forEach(([currency, address]) => {
          addresses[currency] = address;
        });
        setDepositAddresses(addresses);
      }
    } catch (error) {
      console.error('Failed to load deposit addresses:', error);
      // Don't fail the entire component if addresses fail to load
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Get deposit address for a specific wallet - improved with timeout
  const getDepositAddress = async (currency) => {
    if (!actor) {
      const fallbackAddress = generateFallbackAddress(currency);
      setDepositAddresses(prev => ({
        ...prev,
        [currency]: fallbackAddress
      }));
      return fallbackAddress;
    }
    
    // Check if we already have the address
    if (depositAddresses[currency]) {
      return depositAddresses[currency];
    }
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Address loading timeout')), 5000); // 5 second timeout
      });
      
      const resultPromise = actor.getDepositAddress(currency);
      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      if ('ok' in result) {
        // Update the addresses cache
        setDepositAddresses(prev => ({
          ...prev,
          [currency]: result.ok
        }));
        return result.ok;
      } else {
        console.error('Failed to get deposit address for', currency, ':', result.err);
        // Generate and store fallback address
        const fallbackAddress = generateFallbackAddress(currency);
        setDepositAddresses(prev => ({
          ...prev,
          [currency]: fallbackAddress
        }));
        return fallbackAddress;
      }
    } catch (error) {
      console.error('Failed to get deposit address for', currency, ':', error);
      // Generate and store fallback address
      const fallbackAddress = generateFallbackAddress(currency);
      setDepositAddresses(prev => ({
        ...prev,
        [currency]: fallbackAddress
      }));
      return fallbackAddress;
    }
  };

  // Generate a simple fallback address when backend fails
  const generateFallbackAddress = (currency) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    
    switch (currency) {
      case 'ICP':
        return `2vxsx-fae${timestamp}${random}`;
      case 'ckBTC':
        return `bc1${timestamp}${random}`;
      case 'ckETH':
        return `0x${timestamp}${random}`;
      default:
        return `${currency.toLowerCase()}_${timestamp}${random}`;
    }
  };

  const handleCreateWallet = async () => {
    if (!newWalletData.name || !newWalletData.currency) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCryptoWallet(
        newWalletData.name,
        newWalletData.currency,
        newWalletData.isExternal,
        newWalletData.isExternal ? newWalletData.externalWalletType : null,
        newWalletData.address || null
      );
      
      setShowCreateModal(false);
      setNewWalletData({
        name: '',
        currency: 'ICP',
        isExternal: false,
        address: '',
        externalWalletType: ''
      });
      
      // Refresh addresses after creating new wallet
      await loadDepositAddresses();
      
      alert('Crypto wallet created successfully!');
    } catch (error) {
      console.error('Failed to create crypto wallet:', error);
      alert('Failed to create crypto wallet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedWallet || !newBalance || isNaN(newBalance)) {
      alert('Please enter a valid balance');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert to number to ensure we're not mixing BigInt with regular numbers
      const numericBalance = parseFloat(newBalance);
      await updateCryptoWalletBalance(selectedWallet.id, numericBalance);
      
      setShowBalanceModal(false);
      setSelectedWallet(null);
      setNewBalance('');
      
      alert('Balance updated successfully!');
    } catch (error) {
      console.error('Failed to update balance:', error);
      alert('Failed to update balance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAddress = async (address, walletId) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(walletId);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      alert('Failed to copy address. Please copy manually.');
    }
  };

  const toggleAddressVisibility = (walletId) => {
    setShowFullAddress(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  const formatBalance = (balance) => {
    if (!balance && balance !== 0) return '0.000000';
    
    // Convert BigInt to number if needed
    let numericBalance;
    if (typeof balance === 'bigint') {
      numericBalance = Number(balance);
    } else {
      numericBalance = Number(balance);
    }
    
    if (isNaN(numericBalance)) return '0.000000';
    
    return numericBalance.toFixed(6);
  };

  const formatAddress = (address, walletId) => {
    if (!address || address === 'Loading...' || address === 'Error loading address') {
      return address || 'No address';
    }
    
    if (showFullAddress[walletId]) {
      return address;
    }
    
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const getWalletIcon = (walletType) => {
    const icons = {
      'ICP': '⭕',
      'ckBTC': '₿',
      'ckETH': '⟠',
      'CHAT': '💬',
      'SNS1': '🔗',
      'KINIC': '🎬',
      'MODCLUB': '🛡️',
      'BOOM': '💥',
      'DRAGGINZ': '🐉',
      'ELNA': '🌟',
      'GLDT': '��',
      'NANAS': '🍌',
      'PANDA': '🐼',
      'SEERS': '👁️',
      'DSCVR': '🔍',
      'CYCLES': '⚡',
      'DKUMA': '🐻',
      'OPENCHAT': '💬'
    };
    return icons[walletType] || '🪙';
  };

  const getNetworkInfo = (currency) => {
    const networks = {
      'ICP': { name: 'Internet Computer', explorer: 'https://dashboard.internetcomputer.org/account/' },
      'ckBTC': { name: 'Bitcoin (ckBTC)', explorer: 'https://dashboard.internetcomputer.org/bitcoin' },
      'ckETH': { name: 'Ethereum (ckETH)', explorer: 'https://dashboard.internetcomputer.org/ethereum' },
      'CHAT': { name: 'OpenChat', explorer: 'https://oc.app' },
      'SNS1': { name: 'SNS DAO', explorer: 'https://dashboard.internetcomputer.org/sns' },
      'KINIC': { name: 'Kinic', explorer: 'https://kinic.io' },
      'MODCLUB': { name: 'Modclub', explorer: 'https://modclub.ai' },
      'BOOM': { name: 'Boom DAO', explorer: 'https://boomdao.ooo' },
      'DRAGGINZ': { name: 'Dragginz', explorer: 'https://dragginz.com' },
      'ELNA': { name: 'Elna', explorer: 'https://elna.ai' },
      'GLDT': { name: 'Gold DAO', explorer: 'https://golddao.ooo' },
      'NANAS': { name: 'Nanas', explorer: 'https://nanas.com' },
      'PANDA': { name: 'Panda DAO', explorer: 'https://pandadao.ooo' },
      'SEERS': { name: 'Seers', explorer: 'https://seers.com' },
      'DSCVR': { name: 'DSCVR', explorer: 'https://dscvr.one' },
      'CYCLES': { name: 'Cycles', explorer: 'https://dashboard.internetcomputer.org/cycles' },
      'DKUMA': { name: 'Dkuma', explorer: 'https://dkuma.com' },
      'OPENCHAT': { name: 'OpenChat', explorer: 'https://oc.app' }
    };
    return networks[currency] || { name: 'Unknown Network', explorer: '#' };
  };

  if (isLoading) {
    return (
      <div className="crypto-wallets-loading">
        <div className="loading-spinner"></div>
        <p>Loading crypto wallets...</p>
      </div>
    );
  }

  return (
    <div className="crypto-wallets">
      <div className="crypto-wallets-header">
        <h2>Your Crypto Wallets</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="btn-icon">+</span>
          Create Wallet
        </button>
      </div>

      <div className="crypto-wallets-grid" style={{display: 'flex', flexWrap: 'wrap', gap: '1.1rem', width: '100%', marginBottom: '1.5rem'}}>
        {cryptoWallets.length === 0 ? (
          <div className="no-wallets">
            <div className="no-wallets-icon">🪙</div>
            <h3>No Crypto Wallets</h3>
            <p>You don't have any crypto wallets yet. Create your first wallet to get started!</p>
          </div>
        ) : (
          cryptoWallets.map((wallet) => (
            <div key={wallet.id} className="dashboard-card" style={{flex: '1 1 260px', minWidth: '260px', maxWidth: '400px', alignItems: 'flex-start', padding: '0.9rem 1rem 0.7rem 1rem', gap: '0.5rem', position: 'relative', boxShadow: 'var(--shadow-sm)'}}>
              <div className="wallet-icon" style={{fontSize: '1.5rem', width: '32px', height: '32px', marginBottom: '0.2rem'}}>{getWalletIcon(wallet.currency)}</div>
              <div className="stat-number">{formatBalance(wallet.balance)}</div>
              <div className="stat-label">{wallet.name} <span style={{color: 'var(--primary-600)', fontWeight: 600}}>{wallet.currency}</span></div>
              <div className="wallet-actions" style={{display: 'flex', gap: '0.4rem', marginTop: '0.3rem'}}>
                <button className="btn btn-primary btn-sm" onClick={() => { setSelectedWallet(wallet); setShowDepositModal(true); }}><FiDownload /> Deposit</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedWallet(wallet); setShowBalanceModal(true); }}>Balance</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedWallet(wallet); setShowFullAddress(prev => ({ ...prev, [wallet.id]: !prev[wallet.id] })); }}>Address</button>
              </div>
              {showFullAddress[wallet.id] && (
                <div className="wallet-address" style={{marginTop: '0.3rem', fontSize: '0.92rem', color: 'var(--primary-700)', fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}>
                  {formatAddress(wallet.address || 'No address')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-left">
              <div className="wallet-icon-large">🪙</div>
              <p className="desc">Create a new wallet to manage your digital assets securely and easily.</p>
            </div>
            <div className="modal-right">
              <div className="modal-header">
                <h3>Create New Crypto Wallet</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Wallet Name</label>
                  <input
                    type="text"
                    value={newWalletData.name}
                    onChange={(e) => setNewWalletData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My ICP Wallet"
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={newWalletData.currency}
                    onChange={(e) => setNewWalletData(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    {supportedCurrencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newWalletData.isExternal}
                      onChange={(e) => setNewWalletData(prev => ({ ...prev, isExternal: e.target.checked }))}
                    />
                    External Wallet
                  </label>
                </div>
                {newWalletData.isExternal && (
                  <>
                    <div className="form-group">
                      <label>External Wallet Type</label>
                      <select
                        value={newWalletData.externalWalletType}
                        onChange={(e) => setNewWalletData(prev => ({ ...prev, externalWalletType: e.target.value }))}
                      >
                        <option value="">Select wallet type</option>
                        {externalWalletTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Wallet Address</label>
                      <input
                        type="text"
                        value={newWalletData.address}
                        onChange={(e) => setNewWalletData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter external wallet address"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateWallet}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {showBalanceModal && selectedWallet && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Balance</h3>
              <button 
                className="modal-close"
                onClick={() => setShowBalanceModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Balance ({selectedWallet.currency})</label>
                <input
                  type="number"
                  step="0.000001"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0.000000"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowBalanceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateBalance}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedWallet && (
        <div className="modal-overlay">
          <div className="modal deposit-modal">
            <div className="modal-header">
              <h3>Deposit {selectedWallet.currency}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDepositModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="qr-section">
                <div className="qr-code-placeholder">
                  {depositAddresses[selectedWallet.currency] ? (
                    <QRCodeSVG
                      value={depositAddresses[selectedWallet.currency]}
                      size={120}
                      level="H"
                      includeMargin
                    />
                  ) : (
                    <FiMaximize2 size={120} />
                  )}
                  <p>
                    Scan this QR code or copy the address below to deposit {selectedWallet.currency}.
                  </p>
                </div>
              </div>
              <div className="instructions">
                <h4>How to Deposit</h4>
                <ol>
                  <li>Scan the QR code or copy the address below.</li>
                  <li>Send {selectedWallet.currency} from your external wallet (e.g., Binance, Coinbase).</li>
                  <li>Wait for network confirmation (usually 2-5 minutes).</li>
                  <li>Check your balance after deposit is confirmed.</li>
                </ol>
              </div>
              <div className="address-section">
                <h4>Deposit Address</h4>
                <div className="address-display">
                  <p className="address-text">
                    {depositAddresses[selectedWallet.currency] || 'Loading...'}
                  </p>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopyAddress(depositAddresses[selectedWallet.currency], selectedWallet.id)}
                    disabled={!depositAddresses[selectedWallet.currency]}
                  >
                    {copiedAddress === selectedWallet.id ? <FiCheck /> : <FiCopy />}
                    {copiedAddress === selectedWallet.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="network-info">
                <h4>Network Information</h4>
                <p><strong>Network:</strong> {getNetworkInfo(selectedWallet.currency).name}</p>
                <p><strong>Minimum Deposit:</strong> 0.000001 {selectedWallet.currency}</p>
                <p><strong>Confirmation Time:</strong> ~2-5 minutes</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDepositModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CryptoWallets; 