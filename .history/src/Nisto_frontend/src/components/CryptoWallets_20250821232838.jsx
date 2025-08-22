import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiDollarSign, 
  FiPlus, 
  FiSend, 
  FiDownload, 
  FiCopy, 
  FiCheck, 
  FiEye, 
  FiEyeOff, 
  FiX,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

const CryptoWallets = () => {
  const { user, isAuthenticated, backendService } = useAuth();
  const { showToast } = useNotification();
  
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showBalances, setShowBalances] = useState({});
  const [copiedAddress, setCopiedAddress] = useState(null);
  
  const [newWallet, setNewWallet] = useState({
    name: '',
    currency: 'ICP',
    address: ''
  });
  
  const [sendForm, setSendForm] = useState({
    amount: '',
    toAddress: '',
    description: ''
  });
  
  const [depositForm, setDepositForm] = useState({
    amount: '',
    description: ''
  });

  // Load crypto wallets
  useEffect(() => {
    const loadWallets = async () => {
      if (!isAuthenticated || !backendService) return;
      
      try {
        setLoading(true);
        // Load wallets from backend
        const wallets = await backendService.getUserCryptoWallets();
        
        // If no wallets exist, auto-create a default NST wallet
        if (!wallets || wallets.length === 0) {
          try {
            console.log('No wallets found, creating default NST wallet...');
            await backendService.createCryptoWallet(
              'Primary Wallet',
              'NST',
              false, // isExternal
              null,  // externalWalletType
              'Auto-created default wallet' // metadata
            );
            
            // Reload wallets after creating default
            const updatedWallets = await backendService.getUserCryptoWallets();
            setCryptoWallets(updatedWallets || []);
            showToast('Default NST wallet created!', 'success');
          } catch (createError) {
            console.error('Failed to create default wallet:', createError);
            showToast('Failed to create default wallet', 'error');
            setCryptoWallets([]);
          }
        } else {
          setCryptoWallets(wallets);
        }
      } catch (error) {
        console.error('Error loading wallets:', error);
        showToast('Failed to load wallets', 'error');
        setCryptoWallets([]);
      } finally {
        setLoading(false);
      }
    };

    loadWallets();
  }, [isAuthenticated, backendService]);

  const getNetworkInfo = (currency) => {
    const networks = {
      NST: { name: 'Nisto Network', color: '#8b5cf6' },
      ICP: { name: 'Internet Computer', color: '#3b82f6' },
      BTC: { name: 'Bitcoin', color: '#f59e0b' },
      ETH: { name: 'Ethereum', color: '#6366f1' }
    };
    return networks[currency] || { name: 'Unknown', color: '#64748b' };
  };

  const getWalletIcon = (currency) => {
    const icons = {
      NST: '🟣',
      ICP: '🔵',
      BTC: '🟡',
      ETH: '🟠'
    };
    return icons[currency] || '💳';
  };

  const formatBalance = (balance) => {
    return `${balance.toFixed(6)}`;
  };

  const formatAddress = (address) => {
    if (!address || address === 'No address') return 'No address';
    if (address.length <= 16) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async (text, walletId) => {
    if (!text || text === 'No address' || text === 'No address available') {
      showToast('No address to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(walletId);
      showToast('Address copied to clipboard!', 'success');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedAddress(walletId);
        showToast('Address copied to clipboard!', 'success');
        setTimeout(() => setCopiedAddress(null), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        showToast('Failed to copy address', 'error');
      }
    }
  };

  const handleCreateWallet = async () => {
    if (!newWallet.name || !newWallet.currency) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const result = await backendService.createCryptoWallet(
        newWallet.name,
        newWallet.currency,
        false, // isExternal
        null,  // externalWalletType
        null   // metadata
      );
      
      if (result) {
        showToast('Wallet created successfully!', 'success');
        setNewWallet({ name: '', currency: 'ICP', address: '' });
        setShowCreateModal(false);
        // Reload wallets
        const wallets = await backendService.getUserCryptoWallets();
        setCryptoWallets(wallets || []);
      } else {
        showToast('Failed to create wallet', 'error');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      showToast(`Failed to create wallet: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleSend = async () => {
    if (!sendForm.amount || !sendForm.toAddress || !selectedWallet) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const result = await backendService.sendCrypto(
        selectedWallet.id,
        sendForm.toAddress,
        BigInt(Math.floor(Number(sendForm.amount) * 100000000)),
        sendForm.description || ''
      );
      
      if (result.ok) {
        showToast('Transaction sent successfully!', 'success');
        setSendForm({ amount: '', toAddress: '', description: '' });
        setShowSendModal(false);
        // Reload wallets to update balances
        const wallets = await backendService.getUserCryptoWallets();
        setCryptoWallets(wallets || []);
      } else {
        showToast(`Transaction failed: ${result.err}`, 'error');
      }
    } catch (error) {
      console.error('Error sending crypto:', error);
      showToast('Failed to send transaction', 'error');
    }
  };

  const handleDeposit = async () => {
    if (!selectedWallet) {
      showToast('No wallet selected', 'error');
      return;
    }

    // For receive/deposit, we just show the address - no actual deposit needed
    showToast('Address copied to clipboard!', 'success');
    setShowDepositModal(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <FiDollarSign size={24} />
          Crypto Wallets
        </h2>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          margin: 0
        }}>
          Manage your digital assets across multiple networks
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem', 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FiBarChart2 />
            <span>Portfolio Overview</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Wallets</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {cryptoWallets.length}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Balance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#10b981' }}>
                {cryptoWallets.reduce((sum, wallet) => sum + wallet.balance, 0).toFixed(2)}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Networks</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#3b82f6' }}>
                {new Set(cryptoWallets.map(w => w.currency)).size}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0
            }}>
              <FiActivity />
              <span>Your Wallets</span>
            </h4>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#3b82f6',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <FiPlus size={14} />
              Add Wallet
            </button>
          </div>

          {cryptoWallets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#f8fafc',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#64748b'
              }}>
                <FiDollarSign size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                No wallets yet
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                Create your first wallet to start managing your digital assets
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Create Wallet
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {cryptoWallets.map((wallet) => {
                const networkInfo = getNetworkInfo(wallet.currency);
                return (
                  <div key={wallet.id} style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    transition: 'all 0.2s'
                  }}>
                    {/* Wallet Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: networkInfo.color,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        {getWalletIcon(wallet.currency)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.125rem' }}>
                          {wallet.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {networkInfo.name}
                        </div>
                      </div>
                      {wallet.isPrimary && (
                        <div style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f0fdf4',
                          color: '#059669',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Primary
                        </div>
                      )}
                    </div>

                    {/* Balance and Address - Horizontal Layout */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {/* Balance */}
                      <div style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>
                            Balance
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                            {showBalances[wallet.id] ? formatBalance(wallet.balance) : '••••••'}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowBalances(prev => ({ ...prev, [wallet.id]: !prev[wallet.id] }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            color: '#64748b',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          {showBalances[wallet.id] ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        </button>
                      </div>

                      {/* Address */}
                      <div style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>
                            Address
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#1e293b', 
                            fontFamily: 'monospace',
                            fontWeight: 500,
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {formatAddress(wallet.address || 'No address')}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(wallet.address || '', wallet.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            color: '#64748b',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          {copiedAddress === wallet.id ? <FiCheck size={12} /> : <FiCopy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setShowSendModal(true);
                        }}
                        style={{
                          flex: 1,
                          background: '#3b82f6',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FiSend size={12} />
                        Send
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setShowDepositModal(true);
                        }}
                        style={{
                          flex: 1,
                          background: '#10b981',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FiDownload size={12} />
                        Receive
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <FiX />
            </button>
            
            <div style={{
              width: '60px',
              height: '60px',
              background: '#f0f9ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#3b82f6'
            }}>
              <FiPlus size={24} />
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
              Create New Wallet
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Wallet Name
              </label>
              <input
                type="text"
                value={newWallet.name}
                onChange={(e) => setNewWallet(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter wallet name"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Currency
              </label>
              <select
                value={newWallet.currency}
                onChange={(e) => setNewWallet(prev => ({ ...prev, currency: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="ICP">ICP - Internet Computer</option>
                <option value="NST">NST - Nisto Token</option>
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWallet}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Create Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && selectedWallet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowSendModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <FiX />
            </button>
            
            <div style={{
              width: '60px',
              height: '60px',
              background: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#f59e0b'
            }}>
              <FiSend size={24} />
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
              Send {selectedWallet.currency}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Amount
              </label>
              <input
                type="number"
                value={sendForm.amount}
                onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter amount"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                To Address
              </label>
              <input
                type="text"
                value={sendForm.toAddress}
                onChange={(e) => setSendForm(prev => ({ ...prev, toAddress: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter recipient address"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Description (Optional)
              </label>
              <input
                type="text"
                value={sendForm.description}
                onChange={(e) => setSendForm(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Transaction description"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowSendModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedWallet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowDepositModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <FiX />
            </button>
            
            <div style={{
              width: '60px',
              height: '60px',
              background: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#10b981'
            }}>
              <FiDownload size={24} />
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
              Receive {selectedWallet.currency}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Your Address
              </label>
              <div style={{
                padding: '0.75rem',
                background: '#f8fafc',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#374151',
                wordBreak: 'break-all',
                maxHeight: '80px',
                overflow: 'auto'
              }}>
                {selectedWallet.address || 'No address available'}
              </div>
            </div>
            
            <div style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: '#059669',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <FiDownload size={16} />
                <span>Share this address to receive {selectedWallet.currency}</span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem', 
                color: '#64748b',
                lineHeight: '1.4'
              }}>
                Anyone can send {selectedWallet.currency} to this address. The funds will appear in your wallet once the transaction is confirmed on the network.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => copyToClipboard(selectedWallet.address || '', selectedWallet.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: '#10b981',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiCopy size={16} />
                Copy Address
              </button>
              <button
                onClick={() => setShowDepositModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoWallets; 