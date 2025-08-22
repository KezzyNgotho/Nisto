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
import DepositFunds from './DepositFunds';

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

  const handleSend = async () => {
    if (!sendData.toAddress || !sendData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Implement send logic here
      setShowSendModal(false);
      setSendData({ toAddress: '', amount: '', memo: '' });
      alert('Transaction sent successfully!');
    } catch (error) {
      console.error('Failed to send transaction:', error);
      alert('Failed to send transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, walletId) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(walletId);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatBalance = (balance) => {
    if (!balance || isNaN(balance)) return '0.00';
    return parseFloat(balance).toFixed(4);
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getWalletIcon = (currency) => {
    const icons = {
      'NST': '🪙',
      'ICP': '⚡',
      'ckBTC': '₿',
      'ckETH': 'Ξ',
      'CHAT': '💬',
      'SNS1': '🏛️',
      'KINIC': '🚀',
      'MODCLUB': '🎭',
      'BOOM': '💥',
      'DRAGGINZ': '🐉',
      'ELNA': '🌟',
      'GLDT': '🥇',
      'NANAS': '🍌',
      'PANDA': '🐼',
      'SEERS': '🔮',
      'DSCVR': '🔍',
      'CYCLES': '⚙️',
      'DKUMA': '🦁',
      'OPENCHAT': '💭'
    };
    return icons[currency] || '💰';
  };

  const getNetworkInfo = (currency) => {
    const networks = {
      'NST': { name: 'Nisto Token', color: '#667eea' },
      'ICP': { name: 'Internet Computer', color: '#3b82f6' },
      'ckBTC': { name: 'Bitcoin (ckBTC)', color: '#f59e0b' },
      'ckETH': { name: 'Ethereum (ckETH)', color: '#8b5cf6' },
      'CHAT': { name: 'OpenChat', color: '#10b981' },
      'SNS1': { name: 'SNS Governance', color: '#ef4444' },
      'KINIC': { name: 'Kinic', color: '#06b6d4' },
      'MODCLUB': { name: 'Modclub', color: '#8b5cf6' },
      'BOOM': { name: 'Boom', color: '#f97316' },
      'DRAGGINZ': { name: 'Dragginz', color: '#dc2626' },
      'ELNA': { name: 'Elna', color: '#059669' },
      'GLDT': { name: 'Gold', color: '#fbbf24' },
      'NANAS': { name: 'Nanas', color: '#fbbf24' },
      'PANDA': { name: 'Panda', color: '#000000' },
      'SEERS': { name: 'Seers', color: '#7c3aed' },
      'DSCVR': { name: 'DSCVR', color: '#3b82f6' },
      'CYCLES': { name: 'Cycles', color: '#06b6d4' },
      'DKUMA': { name: 'Dkuma', color: '#f59e0b' },
      'OPENCHAT': { name: 'OpenChat', color: '#ec4899' }
    };
    return networks[currency] || { name: 'Unknown Network', color: '#6b7280' };
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#64748b'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Loading wallets...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0'
      }}>
        <div>
          <h2 style={{ 
            margin: '0 0 0.25rem 0', 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#1e293b' 
          }}>
            Wallets
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#64748b' 
          }}>
            Manage your digital assets securely
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={refreshCryptoWallets}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FiRefreshCw size={16} />
          </button>
          
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
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <FiPlus size={16} />
            Add Wallet
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#f0f9ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6'
          }}>
            <FiDollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              {cryptoWallets.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Wallets</div>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#f0fdf4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <FiTrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              ${cryptoWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Value</div>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#fef3c7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <FiActivity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              {cryptoWallets.filter(w => w.isActive).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Wallets</div>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1rem'
      }}>
        {cryptoWallets.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem',
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
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>
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
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              Create Wallet
            </button>
          </div>
        ) : (
          cryptoWallets.map((wallet) => {
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
                    width: '40px',
                    height: '40px',
                    background: networkInfo.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.125rem'
                  }}>
                    {getWalletIcon(wallet.currency)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.125rem' }}>
                      {wallet.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {networkInfo.name}
                    </div>
                  </div>
                  {wallet.currency === 'NST' && (
                    <div style={{
                      padding: '0.25rem 0.5rem',
                      background: '#f0fdf4',
                      color: '#059669',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Primary
                    </div>
                  )}
                </div>

                {/* Balance */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Balance
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                      {showBalances[wallet.id] ? formatBalance(wallet.balance) : '••••••'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBalances(prev => ({ ...prev, [wallet.id]: !prev[wallet.id] }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.375rem',
                      color: '#64748b',
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {showBalances[wallet.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Address */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  fontFamily: 'monospace'
                }}>
                  <span>{formatAddress(wallet.address || 'No address')}</span>
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
                      fontWeight: 500,
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
                      fontWeight: 500,
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
          })
        )}
      </div>

      {/* Modals would go here - keeping the existing modal logic */}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CryptoWallets; 