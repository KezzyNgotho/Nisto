import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatTimestamp } from '../utils/typeUtils';
import '../App.scss';
import { 
  FiHome, 
  FiCreditCard, 
  FiShield, 
  FiUser, 
  FiLogOut, 
  FiPlus,
  FiMail,
  FiPhone,
  FiKey,
  FiCheck,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiEyeOff,
  FiDollarSign,
  FiLock,
  FiBell,
  FiZap,
  FiGlobe,
  FiAward,
  FiBarChart2,
  FiGrid,
  FiUsers,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { BiCoin, BiWallet } from 'react-icons/bi';
import NotificationCenter from '../components/NotificationCenter';
import ToastNotification from '../components/ToastNotification';
import NotificationDemo from '../components/NotificationDemo';
import RecoverySetup from '../components/RecoverySetup';
import CryptoWallets from '../components/CryptoWallets';
import AIFinancialAssistant from '../components/AIFinancialAssistant';
import EnhancedPaymentMethods from '../components/EnhancedPaymentMethods';
import SocialGames from '../components/SocialGames';
// Temporarily hidden components
// import DeFiTools from '../components/DeFiTools';
// import PluginSystem from '../components/PluginSystem';
import GroupVaults from '../components/GroupVaults';
import TokenDashboard from '../components/TokenDashboard';
import Overview from '../components/Overview';
import PayBills from '../components/PayBills';

function Dashboard() {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecoverySetup, setShowRecoverySetup] = useState(false);
  const [showBalances, setShowBalances] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userStats, setUserStats] = useState({
    totalBalance: 0,
    walletCount: 0,
    recoveryMethodsCount: 0,
    recentActivity: []
  });
  const [notifications] = useState([
    { id: 1, message: "New wallet connected successfully", time: "2 min ago", read: false, type: "success", icon: "💰" },
    { id: 2, message: "Recovery method verified", time: "1 hour ago", read: false, type: "success", icon: "🔐" },
    { id: 3, message: "Transaction completed", time: "3 hours ago", read: true, type: "success", icon: "✅" },
    { id: 4, message: "Security check recommended", time: "1 day ago", read: false, type: "warning", icon: "⚠️" },
    { id: 5, message: "Backup completed", time: "2 days ago", read: true, type: "success", icon: "☁️" },
  ]);
  const [activeNotificationTab, setActiveNotificationTab] = useState('all');
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  
  // Safety check for when auth context is not ready
  if (!auth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading authentication...
      </div>
    );
  }

  const { 
    user, 
    logout, 
    isAuthenticated, 
    isLoading: authLoading, 
    principal, 
    completeRecoverySetup,
    recoveryMethods,
    cryptoWallets,
    refreshRecoveryMethods,
    refreshCryptoWallets
  } = auth;
  
  const unreadCount = notifications.filter(n => !n.read).length;

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
        await Promise.all([
          refreshRecoveryMethods(),
          refreshCryptoWallets()
        ]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, navigate, refreshRecoveryMethods, refreshCryptoWallets]);

  useEffect(() => {
    const calculateStats = () => {
      const totalBalance = cryptoWallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const walletCount = cryptoWallets?.length || 0;
      const recoveryMethodsCount = recoveryMethods?.length || 0;
      setUserStats({
        totalBalance,
        walletCount,
        recoveryMethodsCount,
        recentActivity: [
          { icon: BiWallet, text: 'Wallets synced', time: '2 min ago' },
          { icon: FiShield, text: 'Recovery verified', time: '1 hour ago' },
          { icon: FiCheck, text: 'Profile updated', time: '3 hours ago' }
        ]
      });
    };
    calculateStats();
  }, [cryptoWallets, recoveryMethods]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRecoveryIcon = (type) => {
    switch (type) {
      case 'email': return FiMail;
      case 'phone': return FiPhone;
      case 'backup_email': return FiMail;
      case 'custom': return FiKey;
      default: return FiShield;
    }
  };

  const formatBalance = (balance) => {
    if (!balance || isNaN(balance)) return '$0.00';
    if (balance >= 1000000) return `$${(balance / 1000000).toFixed(1)}M`;
    if (balance >= 1000) return `$${(balance / 1000).toFixed(1)}K`;
    return `$${balance.toFixed(2)}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar (fixed) */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">N</div>
          <span className="logo-text">Nisto</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-link${activeTab==='overview'?' active':''}`} onClick={()=>setActiveTab('overview')}><FiHome /><span>Overview</span></button>
          <button className={`sidebar-link${activeTab==='wallets'?' active':''}`} onClick={()=>setActiveTab('wallets')}><BiWallet /><span>Wallets</span></button>
          <button className={`sidebar-link${activeTab==='tokens'?' active':''}`} onClick={()=>setActiveTab('tokens')}><BiCoin /><span>Tokens</span></button>
          <button className={`sidebar-link${activeTab==='vaults'?' active':''}`} onClick={()=>setActiveTab('vaults')}><FiUsers /><span>Group Vaults</span></button>
          <button className={`sidebar-link${activeTab==='games'?' active':''}`} onClick={()=>setActiveTab('games')}><FiAward /><span>Social Games</span></button>
          {/* Temporarily hidden navigation items */}
          {/* <button className={`sidebar-link${activeTab==='defi'?' active':''}`} onClick={()=>setActiveTab('defi')}><FiBarChart2 /><span>DeFi Tools</span></button> */}
          {/* <button className={`sidebar-link${activeTab==='plugins'?' active':''}`} onClick={()=>setActiveTab('plugins')}><FiGrid /><span>Plugins</span></button> */}
          <button className={`sidebar-link${activeTab==='ai'?' active':''}`} onClick={()=>setActiveTab('ai')}><FiZap /><span>AI Assistant</span></button>
          <button className={`sidebar-link${activeTab==='payments'?' active':''}`} onClick={()=>setActiveTab('payments')}><FiCreditCard /><span>Pay Bills</span></button>
          <button className={`sidebar-link${activeTab==='recovery'?' active':''}`} onClick={()=>setActiveTab('recovery')}><FiShield /><span>Recovery Setup</span></button>
        </nav>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--dashboard-sidebar-link-logout, var(--error-600))' }}><FiLogOut /><span>Logout</span></button>
      </aside>
      {/* Main Area */}
      <div className="dashboard-main">
        {/* Top Bar/Header */}
      <header className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="header-page-indicator">🏦</div>
          </div>
          <div className="dashboard-header-right">
          <div className="dashboard-user-info">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div className="user-details">
                <span className="user-name">{user?.displayName || 'User'}</span>
                <span className="user-principal">{principal ? `${principal.slice(0, 12)}...` : 'Loading...'}</span>
              </div>
            </div>
            <button className="notification-btn-header" onClick={()=>setShowNotifications(!showNotifications)}>
                <FiBell />
              {unreadCount > 0 && <span className="notification-badge-header">{unreadCount}</span>}
            </button>
            <button className="logout-btn-header" onClick={handleLogout}><FiLogOut /></button>
        </div>
      </header>
        {/* Main Content */}
        <main className="dashboard-content">
          {showNotifications && <NotificationCenter />}
          <ToastNotification />
          {/* Main dashboard tabs */}
        {activeTab === 'overview' && <Overview />}
          {activeTab === 'wallets' && <CryptoWallets />}
          {activeTab === 'tokens' && <TokenDashboard />}
          {activeTab === 'vaults' && <GroupVaults />}
          {activeTab === 'games' && <SocialGames />}
          {/* Temporarily hidden components */}
          {/* {activeTab === 'defi' && <DeFiTools />} */}
          {/* {activeTab === 'plugins' && <PluginSystem />} */}
          {activeTab === 'ai' && <AIFinancialAssistant />}
          {activeTab === 'payments' && <EnhancedPaymentMethods />}
          {activeTab === 'recovery' && <RecoverySetup />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 