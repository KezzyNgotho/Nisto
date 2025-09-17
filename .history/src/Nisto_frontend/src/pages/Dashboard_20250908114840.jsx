import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimestamp } from '../utils/typeUtils';
import BackendService from '../services/BackendService';
import '../App.scss';
import { 
  FiHome, 
  FiSend, 
  FiDownload, 
  FiUser, 
  FiLogOut, 
  FiPlus,
  FiEye,
  FiEyeOff,
  FiDollarSign,
  FiBell,
  FiSettings,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiRefreshCw,
  FiX,
  FiCopy,
  FiMail,
  FiPhone,
  FiSmartphone,
  FiMessageCircle
} from 'react-icons/fi';
import { BiCoin, BiWallet } from 'react-icons/bi';

import { useNotification } from '../contexts/NotificationContext';
import { handleSuccess } from '../utils/errorHandler';
import CryptoWallets from '../components/CryptoWallets';
import EnhancedWallet from '../components/EnhancedWallet';
import TokenDashboard from '../components/TokenDashboard';
import GroupVaults from '../components/GroupVaults';
import PayBills from '../components/PayBills';
import Profile from './Profile';
import UserDisplay from '../components/UserDisplay';
import AIFinancialAssistant from '../components/AIFinancialAssistant';
import SocialWallet from '../components/SocialWallet';
import SocialIntegrationHub from '../components/SocialIntegrationHub';
import MPCWallet from '../components/MPCWallet';
import EnhancedAccountRecovery from '../components/EnhancedAccountRecovery';
import SafeIcon from '../components/SafeIcon';




// Initialize backend service
const backendService = new BackendService();

function Dashboard() {
  const auth = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryMethods, setRecoveryMethods] = useState([]);
  const [sendForm, setSendForm] = useState({
    amount: '',
    toAddress: '',
    description: ''
  });
  const [userStats, setUserStats] = useState({
    totalBalance: 0,
    walletCount: 0,
    recentActivity: []
  });
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  
  if (!auth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: theme.colors.text.secondary
      }}>
        Loading wallet...
      </div>
    );
  }

  const { 
    user, 
    logout, 
    isAuthenticated, 
    isLoading: authLoading, 
    principal, 
    cryptoWallets,
    refreshCryptoWallets,
    getUserRecoveryMethods,
    getUserNotifications,
    getUnreadNotificationCount
  } = auth;
  
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from backend
  const loadNotifications = async () => {
    try {
      const backendNotifications = await getUserNotifications(10, 0);
      setNotifications(backendNotifications || []);
      
      const count = await getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Send function
  const handleSend = async () => {
    if (!sendForm.amount || !sendForm.toAddress || !selectedWallet) {
      showToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      const result = await backendService.sendCrypto(
        selectedWallet.id,
        sendForm.toAddress,
        BigInt(Math.floor(Number(sendForm.amount) * 100000000)),
        sendForm.description || ''
      );
      
      if (result && result.ok) {
        showToast({ message: 'Transaction sent successfully!', type: 'success' });
        setSendForm({ amount: '', toAddress: '', description: '' });
        setShowSendModal(false);
        // Refresh wallets
        if (refreshCryptoWallets) {
          refreshCryptoWallets();
        }
      } else {
        showToast({ message: `Transaction failed: ${result?.err || 'Unknown error'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error sending crypto:', error);
      // Show error toast
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      // Show success toast
    } catch (error) {
      console.error('Copy failed:', error);
      // Show error toast
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!isAuthenticated) {
        navigate('/');
        return;
      }
      setIsLoading(true);
      try {
        await refreshCryptoWallets();
        // Load recovery methods
        const methods = await getUserRecoveryMethods();
        console.log('Loaded recovery methods:', methods);
        setRecoveryMethods(methods || []);
        
        // Load notifications
        await loadNotifications();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, navigate, refreshCryptoWallets, getUserRecoveryMethods]);

  useEffect(() => {
    const calculateStats = () => {
      const totalBalance = cryptoWallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const walletCount = cryptoWallets?.length || 0;
      setUserStats({
        totalBalance,
        walletCount,
        recentActivity: [
          { icon: BiWallet, text: 'Wallet synced', time: '2 min ago' },
          { icon: FiSend, text: 'Payment sent', time: '1 hour ago' },
          { icon: FiDownload, text: 'Payment received', time: '3 hours ago' }
        ]
      });
    };
    calculateStats();
  }, [cryptoWallets]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatBalance = (balance) => {
    if (!balance || isNaN(balance)) return '$0.00';
    if (balance >= 1000000) return `$${(balance / 1000000).toFixed(1)}M`;
    if (balance >= 1000) return `$${(balance / 1000).toFixed(1)}K`;
    return `$${balance.toFixed(2)}`;
  };

  // Recovery method helper functions
  const getRecoveryMethodIcon = (methodType) => {
    switch (methodType) {
      case 'email':
        return <FiMail size={20} />;
      case 'phone':
        return <FiPhone size={20} />;
      case 'authenticator':
        return <FiSmartphone size={20} />;
      case 'security':
        return <FiKey size={20} />;
      default:
        return <FiShield size={20} />;
    }
  };

  const getRecoveryMethodColor = (methodType) => {
    switch (methodType) {
      case 'email':
        return theme.colors.primary;
      case 'phone':
        return theme.colors.success;
      case 'authenticator':
        return theme.colors.info;
      case 'security':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getRecoveryMethodLabel = (methodType) => {
    switch (methodType) {
      case 'email':
        return 'Email Recovery';
      case 'phone':
        return 'SMS Recovery';
      case 'authenticator':
        return 'Authenticator App';
      case 'security':
        return 'Security Questions';
      default:
        return 'Recovery Method';
    }
  };

  const getRecoveryMethodValue = (method) => {
    try {
      if (method.methodType === 'security' && method.value) {
        const securityData = JSON.parse(method.value);
        return securityData.question || 'Security Questions';
      }
      return method.value || 'Not specified';
    } catch (error) {
      return method.value || 'Not specified';
    }
  };

  // Helper function to format timestamps from nanoseconds to readable dates
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      // Convert nanoseconds to milliseconds (divide by 1,000,000)
      const milliseconds = parseInt(timestamp) / 1000000;
      const date = new Date(milliseconds);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.interactive.hover} 100%)`,
        color: theme.colors.white
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Loading wallet...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.interactive.secondary,
      display: 'flex'
    }}>
      {/* Sidebar */}
      <aside 
        style={{
          width: sidebarCollapsed ? '80px' : '280px',
          background: `linear-gradient(180deg, ${theme.colors.white} 0%, ${theme.colors.background} 100%)`,
          borderRight: `1px solid ${theme.colors.border.secondary}`,
          padding: sidebarCollapsed ? '1rem 0.5rem' : '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none'
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Nesto Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: sidebarCollapsed ? '0.75rem' : '1rem',
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
          borderRadius: '0.5rem',
          color: theme.colors.white,
          marginBottom: '1.5rem',
          fontSize: sidebarCollapsed ? '1.5rem' : '1.125rem',
          fontWeight: '700',
          letterSpacing: '0.025em',
          border: 'none',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none'
        }}>
          {sidebarCollapsed ? 'N' : 'Nesto'}
          
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.colors.white,
              fontSize: '0.75rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: sidebarCollapsed ? 0 : 1,
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              backdropFilter: 'blur(10px)'
            }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            ◀
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            {!sidebarCollapsed && (
              <h3 style={{ 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                color: theme.colors.text.muted, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                marginBottom: '0.75rem', 
                textAlign: 'left',
                paddingLeft: '0.5rem'
              }}>
                Wallet
              </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'overview' ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}25 100%)` : 'transparent',
                  border: activeTab === 'overview' ? `1px solid ${theme.colors.primary}30` : '1px solid transparent',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  color: activeTab === 'overview' ? theme.colors.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'overview' ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Overview' : ''}
                onMouseEnter={(e) => {
                  if (activeTab !== 'overview') {
                    e.target.style.background = `${theme.colors.primary}10`;
                    e.target.style.borderColor = `${theme.colors.primary}20`;
                    e.target.style.color = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'overview') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                <FiHome size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Overview'}
              </button>
              
              <button
                onClick={() => setActiveTab('wallets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'wallets' ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}25 100%)` : 'transparent',
                  border: activeTab === 'wallets' ? `1px solid ${theme.colors.primary}30` : '1px solid transparent',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  color: activeTab === 'wallets' ? theme.colors.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'wallets' ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Wallets' : ''}
                onMouseEnter={(e) => {
                  if (activeTab !== 'wallets') {
                    e.target.style.background = `${theme.colors.primary}10`;
                    e.target.style.borderColor = `${theme.colors.primary}20`;
                    e.target.style.color = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'wallets') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                <BiWallet size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Wallets'}
              </button>
              
              <button
                onClick={() => setActiveTab('enhanced-wallet')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'enhanced-wallet' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: activeTab === 'enhanced-wallet' ? theme.colors.text.primary : theme.colors.text.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: sidebarCollapsed ? '0' : '0.9rem',
                  fontWeight: '500',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={sidebarCollapsed ? 'Multi-Currency' : ''}
                onMouseEnter={(e) => {
                  if (activeTab !== 'enhanced-wallet') {
                    e.target.style.background = `${theme.colors.primary}10`;
                    e.target.style.borderColor = `${theme.colors.primary}20`;
                    e.target.style.color = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'enhanced-wallet') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                <FiDollarSign size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Multi-Currency'}
              </button>
              
              <button
                onClick={() => setActiveTab('tokens')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'tokens' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: activeTab === 'tokens' ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'tokens' ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Tokens' : ''}
              >
                <BiCoin size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Tokens'}
              </button>
              

            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {!sidebarCollapsed && (
              <h3 style={{ 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                color: theme.colors.text.muted, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                marginBottom: '0.75rem',
                paddingLeft: '0.5rem'
              }}>
                Features
              </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                onClick={() => setActiveTab('vaults')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'vaults' ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}25 100%)` : 'transparent',
                  border: activeTab === 'vaults' ? `1px solid ${theme.colors.primary}30` : '1px solid transparent',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  color: activeTab === 'vaults' ? theme.colors.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'vaults' ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Group Vaults' : ''}
                onMouseEnter={(e) => {
                  if (activeTab !== 'vaults') {
                    e.target.style.background = `${theme.colors.primary}10`;
                    e.target.style.borderColor = `${theme.colors.primary}20`;
                    e.target.style.color = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'vaults') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                <FiUsers size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Group Vaults'}
              </button>
              
              <button
                onClick={() => setActiveTab('payments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'payments' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: activeTab === 'payments' ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'payments' ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Payments' : ''}
              >
                <FiDollarSign size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Payments'}
              </button>
              
              <button
                onClick={() => setActiveTab('ai')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'ai' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: activeTab === 'ai' ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'ai' ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'AI Assistant' : ''}
              >
                <FiTrendingUp size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'AI Assistant'}
              </button>
              
              <button
                onClick={() => setActiveTab('social')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'social' ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}25 100%)` : 'transparent',
                  border: activeTab === 'social' ? `1px solid ${theme.colors.primary}30` : 'transparent',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  color: activeTab === 'social' ? theme.colors.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'social' ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Social Media' : ''}
                onMouseEnter={(e) => {
                  if (activeTab !== 'social') {
                    e.target.style.background = `${theme.colors.primary}10`;
                    e.target.style.borderColor = `${theme.colors.primary}20`;
                    e.target.style.color = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'social') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
              >
                <FiMessageCircle size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Social Media'}
              </button>
              <button
                onClick={() => setActiveTab('social-hub')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'social-hub' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: activeTab === 'social-hub' ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'social-hub' ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'social-hub') {
                    e.target.style.background = theme.colors.interactive.tertiary;
                    e.target.style.borderColor = theme.colors.border.secondary;
                    e.target.style.color = theme.colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'social-hub') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
                title={sidebarCollapsed ? 'Social Hub' : ''}
              >
                <FiTrendingUp size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Social Hub'}
              </button>
              
              {/* MPC Wallet Button */}
              <button
                className={`sidebar-btn ${activeTab === 'mpc-wallet' ? 'active' : ''}`}
                onClick={() => setActiveTab('mpc-wallet')}
                style={{
                  background: activeTab === 'mpc-wallet' ? `${theme.colors.primary}15` : 'transparent',
                  borderColor: activeTab === 'mpc-wallet' ? theme.colors.primary : 'transparent',
                  color: activeTab === 'mpc-wallet' ? theme.colors.primary : theme.colors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'mpc-wallet') {
                    e.target.style.background = `${theme.colors.primary}08`;
                    e.target.style.borderColor = `${theme.colors.primary}30`;
                    e.target.style.color = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'mpc-wallet') {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = theme.colors.text.secondary;
                  }
                }}
                title={sidebarCollapsed ? 'MPC Wallet' : ''}
              >
                <FiShield size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'MPC Wallet'}
              </button>

            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {!sidebarCollapsed && (
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Security
              </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                onClick={() => setActiveTab('recovery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'recovery' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: activeTab === 'recovery' ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'recovery' ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Recovery' : ''}
              >
                <FiShield size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Recovery'}
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                  background: activeTab === 'notifications' ? theme.colors.interactive.secondary : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: activeTab === 'notifications' ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: activeTab === 'notifications' ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  width: '100%',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative'
                }}
                title={sidebarCollapsed ? 'Notifications' : ''}
              >
                <FiBell size={sidebarCollapsed ? 20 : 18} />
                {!sidebarCollapsed && 'Notifications'}
              </button>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sidebarCollapsed ? '0' : '0.75rem',
            padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
            background: 'transparent',
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: theme.colors.error,
            fontWeight: 500,
            transition: 'all 0.2s',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            position: 'relative'
          }}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <FiLogOut size={sidebarCollapsed ? 20 : 18} />
          {!sidebarCollapsed && 'Logout'}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          background: theme.colors.white,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                color: theme.colors.text.secondary,
                borderRadius: '0.5rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? '▶' : '◀'}
            </button>
            
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: theme.colors.text.primary }}>
                {activeTab === 'overview' && 'Welcome'}
                {activeTab === 'wallets' && 'Wallets'}
                {activeTab === 'enhanced-wallet' && 'Multi-Currency Wallet'}
                {activeTab === 'tokens' && 'Tokens'}
                {activeTab === 'vaults' && 'Group Vaults'}
                {activeTab === 'payments' && 'Payments'}
                        {activeTab === 'ai' && 'AI Assistant'}
        {activeTab === 'social' && 'Social Media Money Transfer'}
        {activeTab === 'social-hub' && 'Social Integration Hub'}
        {activeTab === 'mpc-wallet' && 'MPC Wallets'}
        {activeTab === 'recovery' && 'Account Recovery'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'profile' && 'Profile'}
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                {activeTab === 'overview' && 'Your wallet overview and quick actions'}
                {activeTab === 'wallets' && 'Manage your crypto wallets'}
                {activeTab === 'tokens' && 'NST token management and trading'}
                {activeTab === 'vaults' && 'Collaborative savings and investments'}
                {activeTab === 'payments' && 'Send and receive payments'}
                        {activeTab === 'ai' && 'AI-powered financial assistance'}
        {activeTab === 'social' && 'Send money through any social media platform'}
        {activeTab === 'social-hub' && 'Make your wallet popular and viral across social platforms'}
        {activeTab === 'mpc-wallet' && 'Multi-party computation wallets for enhanced security'}
        {activeTab === 'recovery' && 'Account recovery and security'}
                {activeTab === 'profile' && 'Profile and account settings'}
              </p>
          </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Balance Toggle */}
            <button
              onClick={() => setShowBalances(!showBalances)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                color: theme.colors.text.secondary,
                borderRadius: '0.5rem',
                transition: 'all 0.2s'
              }}
              title={showBalances ? 'Hide Balances' : 'Show Balances'}
            >
              {showBalances ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
            
            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: theme.colors.text.secondary,
                  borderRadius: '0.5rem',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
                title="Notifications"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: theme.colors.error,
                    color: theme.colors.white,
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: theme.colors.white,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  width: '320px',
                  maxHeight: '400px',
                  overflow: 'auto',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem',
                      borderBottom: `1px solid ${theme.colors.border.primary}`,
                      paddingBottom: '0.5rem'
                    }}>
                      <h4 style={{ margin: 0, color: theme.colors.text.primary }}>Notifications</h4>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        color: theme.colors.text.secondary 
                      }}>
                        {unreadCount} unread
                      </span>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem',
                        color: theme.colors.text.secondary 
                      }}>
                        <FiBell size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No notifications</p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.map((notification) => (
                          <div key={notification.id} style={{
                            padding: '0.75rem',
                            margin: '0.5rem 0',
                            background: notification.isRead ? 'transparent' : theme.colors.background.secondary,
                            borderRadius: '0.5rem',
                            border: `1px solid ${notification.isRead ? 'transparent' : theme.colors.border.primary}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = theme.colors.background.secondary;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = notification.isRead ? 'transparent' : theme.colors.background.secondary;
                          }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start',
                              marginBottom: '0.25rem'
                            }}>
                              <h5 style={{ 
                                margin: 0, 
                                fontSize: '0.875rem',
                                color: theme.colors.text.primary,
                                fontWeight: notification.isRead ? 'normal' : '600'
                              }}>
                                {notification.title}
                              </h5>
                              <span style={{
                                fontSize: '0.75rem',
                                color: theme.colors.text.secondary
                              }}>
                                {formatTimestamp(notification.createdAt)}
                              </span>
                            </div>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '0.8rem',
                              color: theme.colors.text.secondary,
                              lineHeight: '1.4'
                            }}>
                              {notification.message}
                            </p>
                            {!notification.isRead && (
                              <div style={{
                                width: '8px',
                                height: '8px',
                                background: theme.colors.primary,
                                borderRadius: '50%',
                                marginTop: '0.5rem'
                              }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Divider */}
            <div style={{
              width: '1px',
              height: '24px',
              background: theme.colors.border.primary,
              margin: '0 0.25rem'
            }} />
            
            {/* Username Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: `linear-gradient(135deg, ${theme.colors.interactive.secondary} 0%, ${theme.colors.border.primary} 100%)`,
              borderRadius: '0.75rem',
              border: `1px solid ${theme.colors.border.primary}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('profile')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            title="View Profile"
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.interactive.hover} 100%)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.white,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.text.primary }}>
                  {user?.username || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                  View Profile
                </div>
              </div>
            </div>
          </div>
      </header>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div style={{ width: '100%' }}>
              {/* Balance Card */}
              <div style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.interactive.hover} 100%)`,
                borderRadius: '1rem',
                padding: '2rem',
                color: theme.colors.white,
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', opacity: 0.9 }}>Total Balance</h2>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                    {showBalances ? formatBalance(userStats.totalBalance) : '••••••'}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ opacity: 0.8 }}>Wallets:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{userStats.walletCount}</span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.8 }}>Status:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: theme.colors.success }}>● Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <button
                  onClick={() => {
                    if (cryptoWallets && cryptoWallets.length > 0) {
                      setSelectedWallet(cryptoWallets[0]); // Use first wallet as default
                      setShowSendModal(true);
                    } else {
                      setActiveTab('wallets'); // Navigate to wallets if none exist
                    }
                  }}
                  style={{
                    background: theme.colors.white,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow.light}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.borderColor = theme.colors.border.secondary;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: theme.colors.success,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white
                  }}>
                    <FiSend size={16} />
                  </div>
                  <span style={{ fontWeight: 500, color: theme.colors.text.primary, fontSize: '0.8rem' }}>Send</span>
                </button>

                <button
                  onClick={() => {
                    if (cryptoWallets && cryptoWallets.length > 0) {
                      setSelectedWallet(cryptoWallets[0]); // Use first wallet as default
                      setShowReceiveModal(true);
                    } else {
                      setActiveTab('wallets'); // Navigate to wallets if none exist
                    }
                  }}
                  style={{
                    background: theme.colors.white,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow.light}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.borderColor = theme.colors.border.secondary;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: theme.colors.primary,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white
                  }}>
                    <FiDownload size={16} />
                  </div>
                  <span style={{ fontWeight: 500, color: theme.colors.text.primary, fontSize: '0.8rem' }}>Receive</span>
                </button>

                <button
                  onClick={() => setActiveTab('wallets')}
                  style={{
                    background: theme.colors.white,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow.light}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.borderColor = theme.colors.border.secondary;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: theme.colors.warning,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white
                  }}>
                    <FiPlus size={16} />
                  </div>
                  <span style={{ fontWeight: 500, color: theme.colors.text.primary, fontSize: '0.8rem' }}>Add Wallet</span>
                </button>

                <button
                  onClick={() => setActiveTab('tokens')}
                  style={{
                    background: theme.colors.white,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow.light}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.borderColor = theme.colors.border.secondary;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: theme.colors.info,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white
                  }}>
                    <BiCoin size={16} />
                  </div>
                  <span style={{ fontWeight: 500, color: theme.colors.text.primary, fontSize: '0.8rem' }}>Tokens</span>
                </button>


              </div>

              {/* Wallet Summary */}
              <div style={{
                background: theme.colors.white,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: theme.colors.text.primary }}>
                    Your Wallets
                  </h3>
                  <button
                    onClick={() => setActiveTab('wallets')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.colors.primary,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    View All
                  </button>
                </div>
                
                {cryptoWallets && cryptoWallets.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {cryptoWallets.slice(0, 3).map((wallet) => (
                      <div key={wallet.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: theme.colors.interactive.secondary,
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border.primary}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: wallet.currency === 'NST' ? theme.colors.info : 
                                       wallet.currency === 'ICP' ? theme.colors.primary : theme.colors.warning,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.colors.white,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {wallet.currency}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.colors.text.primary }}>
                              {wallet.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                              {wallet.currency}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.colors.text.primary }}>
                            {showBalances ? `${wallet.balance?.toFixed(4) || '0.0000'}` : '••••••'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                            {wallet.isPrimary ? 'Primary' : 'Secondary'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {cryptoWallets.length > 3 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        color: theme.colors.text.secondary,
                        fontSize: '0.75rem'
                      }}>
                        +{cryptoWallets.length - 3} more wallets
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: theme.colors.text.secondary
                  }}>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      No wallets yet
                    </div>
                    <button
                      onClick={() => setActiveTab('wallets')}
                      style={{
                        background: theme.colors.primary,
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        color: theme.colors.white,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      Create Wallet
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div style={{
                background: theme.colors.white,
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: `1px solid ${theme.colors.border.primary}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: theme.colors.text.primary }}>Recent Activity</h3>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.colors.primary,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    View All
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {userStats.recentActivity.map((activity, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: theme.colors.interactive.secondary
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: theme.colors.border.primary,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.text.secondary
                      }}>
                        <activity.icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.colors.text.primary }}>
                          {activity.text}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div style={{ width: '100%' }}>
              <CryptoWallets />
            </div>
          )}

          {activeTab === 'enhanced-wallet' && (
            <div style={{ width: '100%' }}>
              <EnhancedWallet />
            </div>
          )}

          {activeTab === 'tokens' && (
            <div style={{ width: '100%' }}>
              <TokenDashboard />
            </div>
          )}

          {activeTab === 'vaults' && (
            <div style={{ width: '100%' }}>
              <GroupVaults />
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ width: '100%' }}>
              <PayBills />
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ width: '100%' }}>
              <AIFinancialAssistant />
            </div>
          )}

                         {activeTab === 'social' && (
          <div style={{ width: '100%' }}>
            <SocialWallet />
          </div>
        )}
        {activeTab === 'social-hub' && (
          <div style={{ width: '100%' }}>
            <SocialIntegrationHub />
          </div>
        )}
        {activeTab === 'mpc-wallet' && (
          <div style={{ width: '100%' }}>
            <MPCWallet />
          </div>
        )}

          {activeTab === 'recovery' && (
            <div style={{ width: '100%', padding: '1.5rem' }}>
              {/* Recovery Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.875rem', fontWeight: '600', color: theme.colors.text.primary }}>
                  Account Recovery
                </h2>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: '1rem' }}>
                  Set up and manage your account recovery methods
                </p>
              </div>
          {activeTab === 'notifications' && (
            <div style={{ width: '100%', padding: '1.5rem' }}>

            </div>
          )}

              {/* Recovery Methods Overview */}
              <div style={{
                background: theme.colors.white,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: theme.colors.text.primary }}>
                    Recovery Methods
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={async () => {
                        try {
                          const methods = await getUserRecoveryMethods();
                          setRecoveryMethods(methods || []);
                          showToast({ message: 'Recovery methods refreshed', type: 'success' });
                        } catch (error) {
                          console.error('Error refreshing recovery methods:', error);
                          showToast({ message: 'Failed to refresh recovery methods', type: 'error' });
                        }
                      }}
                      style={{
                        background: 'white',
                        color: theme.colors.text.secondary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <FiRefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => setShowRecoveryModal(true)}
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                        color: theme.colors.white,
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <FiPlus size={16} />
                      Add Recovery Method
                    </button>
                  </div>
                </div>

                {/* Recovery Methods Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {recoveryMethods.length > 0 ? (
                    recoveryMethods.map((method, index) => (
                      <div key={index} style={{
                        background: theme.colors.white,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: getRecoveryMethodColor(method.methodType),
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {getRecoveryMethodIcon(method.methodType)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.25rem' }}>
                            {getRecoveryMethodLabel(method.methodType)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                            {getRecoveryMethodValue(method)}
                          </div>
                                                {method.createdAt && (
                        <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginTop: '0.25rem' }}>
                          Added {formatTimestamp(method.createdAt)}
                        </div>
                      )}
                      {method.verifiedAt && (
                        <div style={{ fontSize: '0.75rem', color: theme.colors.success, marginTop: '0.25rem' }}>
                          Verified {formatTimestamp(method.verifiedAt)}
                        </div>
                      )}
                        </div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: method.verifiedAt ? theme.colors.success : theme.colors.warning,
                          borderRadius: '50%'
                        }} title={method.verifiedAt ? 'Verified' : 'Pending verification'} />
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: theme.colors.interactive.secondary,
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '0.5rem',
                      padding: '2rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: theme.colors.border.primary,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: theme.colors.text.secondary
                      }}>
                        <FiShield size={24} />
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
                        No Recovery Methods
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                        Add recovery methods to secure your account
                      </div>
                    </div>
                  )}
                </div>
              </div>

                             {/* Recovery Security Info */}
               <div style={{
                 background: theme.colors.interactive.secondary,
                 border: `1px solid ${theme.colors.border.primary}`,
                 borderRadius: '0.75rem',
                 padding: '1.5rem'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{
                     width: '40px',
                     height: '40px',
                     background: theme.colors.text.secondary,
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: 'white'
                   }}>
                     <FiShield size={20} />
                   </div>
                   <div>
                     <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                       Account Security
                     </h4>
                     <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                       Add recovery methods to secure your account access
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ width: '100%' }}>
              <Profile />
            </div>
          )}
        </div>
        </main>

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
              background: theme.colors.warning,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: theme.colors.warning
            }}>
              <FiSend size={24} />
      </div>
            
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600', color: theme.colors.text.primary }}>
              Send {selectedWallet.currency}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary }}>
                Amount
              </label>
              <input
                type="number"
                value={sendForm.amount}
                onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter amount"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary }}>
                To Address
              </label>
              <input
                type="text"
                value={sendForm.toAddress}
                onChange={(e) => setSendForm(prev => ({ ...prev, toAddress: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter recipient address"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary }}>
                Description (Optional)
              </label>
              <input
                type="text"
                value={sendForm.description}
                onChange={(e) => setSendForm(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.colors.border.primary}`,
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
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: theme.colors.text.primary,
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
                  background: theme.colors.primary,
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

      {/* Receive Modal */}
      {showReceiveModal && selectedWallet && (
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
              onClick={() => setShowReceiveModal(false)}
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
              background: theme.colors.success,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: theme.colors.success
            }}>
              <FiDownload size={24} />
            </div>
            
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600', color: theme.colors.text.primary }}>
              Receive {selectedWallet.currency}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: theme.colors.text.primary }}>
                Your Address
              </label>
              <div style={{
                padding: '0.75rem',
                background: theme.colors.interactive.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: theme.colors.text.primary,
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
              background: theme.colors.success,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '0.5rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: theme.colors.success,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <FiDownload size={16} />
                <span>Share this address to receive {selectedWallet.currency}</span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem', 
                color: theme.colors.text.secondary,
                lineHeight: '1.4'
              }}>
                Anyone can send {selectedWallet.currency} to this address. The funds will appear in your wallet once the transaction is confirmed on the network.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => copyToClipboard(selectedWallet.address || '')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: theme.colors.success,
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
                onClick={() => setShowReceiveModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                    border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: theme.colors.text.primary,
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

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <EnhancedAccountRecovery
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
                      onRecoveryComplete={async () => {
              setShowRecoveryModal(false);
              handleSuccess('add', 'recovery', showToast);
              // Refresh recovery methods
              try {
                const methods = await getUserRecoveryMethods();
                setRecoveryMethods(methods || []);
              } catch (error) {
                console.error('Error refreshing recovery methods:', error);
              }
            }}
          mode="setup"
        />
      )}
      

      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard; 