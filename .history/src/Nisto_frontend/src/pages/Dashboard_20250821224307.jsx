import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatTimestamp } from '../utils/typeUtils';
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
  FiRefreshCw
} from 'react-icons/fi';
import { BiCoin, BiWallet } from 'react-icons/bi';
import NotificationCenter from '../components/NotificationCenter';
import ToastNotification from '../components/ToastNotification';
import CryptoWallets from '../components/CryptoWallets';
import TokenDashboard from '../components/TokenDashboard';
import GroupVaults from '../components/GroupVaults';
import PayBills from '../components/PayBills';
import Profile from './Profile';
import UserDisplay from '../components/UserDisplay';

function Dashboard() {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userStats, setUserStats] = useState({
    totalBalance: 0,
    walletCount: 0,
    recentActivity: []
  });
  const [notifications] = useState([
    { id: 1, message: "Transaction completed", time: "2 min ago", read: false, type: "success", icon: "✅" },
    { id: 2, message: "New wallet connected", time: "1 hour ago", read: false, type: "success", icon: "💰" },
    { id: 3, message: "Payment received", time: "3 hours ago", read: true, type: "success", icon: "📥" },
  ]);
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
        color: '#6b7280'
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
        await refreshCryptoWallets();
      } catch (error) {
        console.error('Error loading wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, navigate, refreshCryptoWallets]);

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

  if (authLoading || isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
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
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            N
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Nisto Wallet</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              {principal ? `${principal.slice(0, 8)}...${principal.slice(-8)}` : 'Loading...'}
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
              color: '#64748b',
              borderRadius: '0.5rem',
              transition: 'all 0.2s'
            }}
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
                color: '#64748b',
                borderRadius: '0.5rem',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ef4444',
                  color: 'white',
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
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                width: '320px',
                maxHeight: '400px',
                overflow: 'auto',
                zIndex: 1000
              }}>
                <NotificationCenter />
              </div>
            )}
          </div>
          
          {/* Settings */}
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#64748b',
              borderRadius: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <FiSettings size={20} />
          </button>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#64748b',
              borderRadius: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1.5rem' }}>
        {activeTab === 'overview' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Balance Card */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '1rem',
              padding: '2rem',
              color: 'white',
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
                    <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: '#10b981' }}>● Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setActiveTab('send')}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FiSend size={24} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Send</span>
              </button>

              <button
                onClick={() => setActiveTab('receive')}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FiDownload size={24} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Receive</span>
              </button>

              <button
                onClick={() => setActiveTab('swap')}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FiTrendingUp size={24} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Swap</span>
              </button>

              <button
                onClick={() => setActiveTab('vaults')}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FiUsers size={24} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Vaults</span>
              </button>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>Recent Activity</h3>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
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
                    background: '#f8fafc'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#e2e8f0',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}>
                      <activity.icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                        {activity.text}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiHome size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Send Money</h2>
            </div>
            <CryptoWallets />
          </div>
        )}

        {activeTab === 'receive' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiHome size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Receive Money</h2>
            </div>
            <PayBills />
          </div>
        )}

        {activeTab === 'swap' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiHome size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Token Swap</h2>
            </div>
            <TokenDashboard />
          </div>
        )}

        {activeTab === 'vaults' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiHome size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Group Vaults</h2>
            </div>
            <GroupVaults />
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiHome size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Profile & Settings</h2>
            </div>
            <Profile />
          </div>
        )}
      </main>

      <ToastNotification />
      
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