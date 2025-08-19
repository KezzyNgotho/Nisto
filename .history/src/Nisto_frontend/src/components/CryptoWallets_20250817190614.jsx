import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiCopy, 
  FiCheck, 
  FiExternalLink, 
  FiDownload,
  FiEye,
  FiEyeOff,
  FiSend,
  FiActivity,
  FiPlus,
  FiDollarSign,
  FiZap,
  FiCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiShield,
  FiSettings,
  FiArrowRight,
  FiArrowUpRight,
  FiArrowDownRight
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

function CryptoWallets() {
  const { 
    cryptoWallets, 
    createCryptoWallet, 
    updateCryptoWalletBalance, 
    refreshCryptoWallets,
    isLoading,
    backendService
  } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [showBalances, setShowBalances] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWalletData, setNewWalletData] = useState({
    name: '',
    currency: 'ICP',
    isExternal: false,
    address: '',
    externalWalletType: ''
  });
  const [sendData, setSendData] = useState({ toAddress: '', amount: '', memo: '' });

  const supportedCurrencies = [
    'NST', 'ICP', 'ckBTC', 'ckETH', 'CHAT', 'SNS1', 'KINIC', 'MODCLUB', 'BOOM',
    'DRAGGINZ', 'ELNA', 'GLDT', 'NANAS', 'PANDA', 'SEERS', 'DSCVR', 
    'CYCLES', 'DKUMA', 'OPENCHAT'
  ];

  const externalWalletTypes = [
    'Plug', 'Stoic', 'Bitfinity', 'NFID', 'Trust Wallet', 'Coinbase Wallet'
  ];

  useEffect(() => {
    refreshCryptoWallets();
  }, []);

  const handleCreateWallet = async () => {
    if (!newWalletData.name || !newWalletData.currency) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await backendService.createCryptoWallet(
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
      
      alert('Crypto wallet created successfully!');
    } catch (error) {
      console.error('Failed to create crypto wallet:', error);
      alert('Failed to create crypto wallet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendCrypto = async () => {
    if (!sendData.toAddress || !sendData.amount || !selectedWallet) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await backendService.sendCrypto(
        selectedWallet.id,
        sendData.toAddress,
        parseFloat(sendData.amount),
        sendData.memo || ''
      );
      
        setShowSendModal(false);
        setSendData({ toAddress: '', amount: '', memo: '' });
      setSelectedWallet(null);
      
        alert('Transaction sent successfully!');
    } catch (error) {
      console.error('Failed to send crypto:', error);
      alert('Failed to send crypto. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text, walletId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(walletId);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatBalance = (balance) => {
    if (!balance || isNaN(balance)) return '0.00';
    if (balance >= 1000000) return `${(balance / 1000000).toFixed(2)}M`;
    if (balance >= 1000) return `${(balance / 1000).toFixed(2)}K`;
    return balance.toFixed(2);
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const getWalletIcon = (walletType) => {
    const icons = {
      'NST': <FiDollarSign size={20} />,
      'ICP': <FiZap size={20} />,
      'ckBTC': <FiCircle size={20} />,
      'ckETH': <FiZap size={20} />,
      'CHAT': <FiActivity size={20} />,
      'SNS1': <FiActivity size={20} />,
      'KINIC': <FiActivity size={20} />,
      'MODCLUB': <FiActivity size={20} />,
      'BOOM': <FiActivity size={20} />,
      'DRAGGINZ': <FiActivity size={20} />,
      'ELNA': <FiActivity size={20} />,
      'GLDT': <FiDollarSign size={20} />,
      'NANAS': <FiActivity size={20} />,
      'PANDA': <FiActivity size={20} />,
      'SEERS': <FiActivity size={20} />,
      'DSCVR': <FiActivity size={20} />,
      'CYCLES': <FiZap size={20} />,
      'DKUMA': <FiActivity size={20} />,
      'OPENCHAT': <FiActivity size={20} />
    };
    return icons[walletType] || <FiDollarSign size={20} />;
  };

  const getNetworkInfo = (currency) => {
    const networks = {
      'NST': { name: 'Nisto Token Network', color: '#10b981' },
      'ICP': { name: 'Internet Computer', color: '#3b82f6' },
      'ckBTC': { name: 'Bitcoin (ckBTC)', color: '#f59e0b' },
      'ckETH': { name: 'Ethereum (ckETH)', color: '#8b5cf6' },
      'CHAT': { name: 'OpenChat', color: '#06b6d4' },
      'SNS1': { name: 'SNS DAO', color: '#ec4899' },
      'KINIC': { name: 'Kinic', color: '#84cc16' },
      'MODCLUB': { name: 'Modclub', color: '#f97316' },
      'BOOM': { name: 'Boom DAO', color: '#ef4444' },
      'DRAGGINZ': { name: 'Dragginz', color: '#8b5cf6' },
      'ELNA': { name: 'Elna', color: '#06b6d4' },
      'GLDT': { name: 'Gold DAO', color: '#fbbf24' },
      'NANAS': { name: 'Nanas', color: '#f59e0b' },
      'PANDA': { name: 'Panda DAO', color: '#10b981' },
      'SEERS': { name: 'Seers', color: '#3b82f6' },
      'DSCVR': { name: 'DSCVR', color: '#8b5cf6' },
      'CYCLES': { name: 'Cycles', color: '#06b6d4' },
      'DKUMA': { name: 'Dkuma', color: '#f97316' },
      'OPENCHAT': { name: 'OpenChat', color: '#ec4899' }
    };
    return networks[currency] || { name: 'Unknown Network', color: '#6b7280' };
  };

  if (isLoading) {
    return (
      <div className="wallets-loading">
        <div className="loading-spinner"></div>
        <p>Loading wallets...</p>
      </div>
    );
  }

  return (
    <div className="wallets-container">
      {/* Header Section */}
      <div className="wallets-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Wallets</h1>
            <p>Manage your digital assets with enterprise-grade security</p>
            </div>
          <div className="header-actions">
        <button 
              className="btn-refresh"
              onClick={refreshCryptoWallets}
              title="Refresh wallets"
            >
              <FiRefreshCw size={16} />
        </button>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus size={16} />
              Add Wallet
            </button>
          </div>
              </div>
                      </div>

      {/* Stats Overview */}
      <div className="wallets-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FiDollarSign size={20} />
                      </div>
          <div className="stat-content">
            <div className="stat-value">
              {cryptoWallets.length}
                      </div>
            <div className="stat-label">Total Wallets</div>
                    </div>
                  </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp size={20} />
                  </div>
          <div className="stat-content">
            <div className="stat-value">
              ${cryptoWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0).toLocaleString()}
                </div>
            <div className="stat-label">Total Value</div>
              </div>
                </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiActivity size={20} />
              </div>
          <div className="stat-content">
            <div className="stat-value">
              {cryptoWallets.filter(w => w.isActive).length}
                </div>
            <div className="stat-label">Active Wallets</div>
            </div>
      </div>
      </div>

      {/* Wallets Grid */}
      <div className="wallets-grid">
        {cryptoWallets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiDollarSign size={48} />
            </div>
            <h3>No wallets yet</h3>
            <p>Create your first wallet to start managing your digital assets</p>
                <button 
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Wallet
                </button>
                  </div>
        ) : (
          cryptoWallets.map((wallet) => {
            const networkInfo = getNetworkInfo(wallet.currency);
            return (
              <div key={wallet.id} className="wallet-card">
                <div className="wallet-header">
                  <div className="wallet-icon" style={{ backgroundColor: networkInfo.color }}>
                    {getWalletIcon(wallet.currency)}
                  </div>
                  <div className="wallet-info">
                    <h3>{wallet.name}</h3>
                    <span className="wallet-network">{networkInfo.name}</span>
                </div>
                  {wallet.currency === 'NST' && (
                    <div className="primary-badge">Primary</div>
                  )}
          </div>

                <div className="wallet-balance">
                  <div className="balance-amount">
                    <span className="amount">
                      {showBalances[wallet.id] ? formatBalance(wallet.balance) : '••••••'}
                    </span>
                    <span className="currency">{wallet.currency}</span>
                </div>
                  <button 
                    className="btn-toggle-balance"
                    onClick={() => setShowBalances(prev => ({ ...prev, [wallet.id]: !prev[wallet.id] }))}
                  >
                    {showBalances[wallet.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
            </div>

                <div className="wallet-address">
                  <span className="address-text">
                    {formatAddress(wallet.address || 'No address')}
                  </span>
                  <button 
                    className="btn-copy"
                    onClick={() => copyToClipboard(wallet.address || '', wallet.id)}
                    title="Copy address"
                  >
                    {copiedAddress === wallet.id ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
            </div>

                <div className="wallet-actions">
                  <button 
                    className="btn-action btn-send"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setShowSendModal(true);
                    }}
                  >
                    <FiSend size={16} />
                    Send
                  </button>
                  <button 
                    className="btn-action btn-deposit"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setShowDepositModal(true);
                    }}
                  >
                    <FiArrowDownRight size={16} />
                    Deposit
                  </button>
                  <button className="btn-action btn-more">
                    <FiSettings size={16} />
                  </button>
                    </div>
                      </div>
            );
          })
            )}
          </div>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Wallet</h2>
                <button 
                className="btn-close"
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
                  placeholder="Enter wallet name"
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
                )}
              </div>
            <div className="modal-footer">
                <button 
                className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                className="btn-primary"
                  onClick={handleCreateWallet}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Wallet'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && selectedWallet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Send {selectedWallet.currency}</h2>
              <button
                className="btn-close"
                onClick={() => setShowSendModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>To Address</label>
                    <input
                      type="text"
                      value={sendData.toAddress}
                      onChange={(e) => setSendData(prev => ({ ...prev, toAddress: e.target.value }))}
                  placeholder="Enter recipient address"
                    />
                  </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                      value={sendData.amount}
                      onChange={(e) => setSendData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Memo (Optional)</label>
                <input
                  type="text"
                      value={sendData.memo}
                      onChange={(e) => setSendData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="Enter memo"
                    />
            </div>
                </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowSendModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSendCrypto}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedWallet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Deposit {selectedWallet.currency}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowDepositModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="qr-section">
                <div className="qr-code">
                  <QRCodeSVG value={selectedWallet.address || ''} size={200} />
                  </div>
                <div className="address-section">
                  <label>Deposit Address</label>
                  <div className="address-display">
                    <span>{selectedWallet.address || 'No address available'}</span>
              <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(selectedWallet.address || '', 'deposit')}
                    >
                      {copiedAddress === 'deposit' ? <FiCheck size={14} /> : <FiCopy size={14} />}
              </button>
            </div>
          </div>
        </div>
                  </div>
            <div className="modal-footer">
                  <button
                className="btn-secondary"
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