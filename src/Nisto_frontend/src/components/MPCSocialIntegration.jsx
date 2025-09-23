import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiShield, 
  FiUsers, 
  FiCheckCircle, 
  FiX, 
  FiClock, 
  FiSend, 
  FiPlus,
  FiEye,
  FiEyeOff,
  FiSettings,
  FiUserPlus,
  FiActivity,
  FiTrendingUp,
  FiLock,
  FiUnlock,
  FiInstagram,
  FiMessageCircle,
  FiTwitter,
  FiVideo,
  FiHeart,
  FiShare2
} from 'react-icons/fi';
import { BiMoney, BiTransfer, BiGroup, BiWorld } from 'react-icons/bi';
import './MPCSocialIntegration.scss';

const MPCSocialIntegration = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [mpcWallets, setMpcWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [pendingSocialTransfers, setPendingSocialTransfers] = useState([]);
  const [socialStats, setSocialStats] = useState({});
  const [showCreateTransfer, setShowCreateTransfer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockMPCWallets = [
      {
        id: 'mpc_wallet_1',
        name: 'Family Social Wallet',
        threshold: 2,
        totalParties: 3,
        parties: [
          { id: 'party_1', userId: user?.id, role: 'owner', weight: 1, isActive: true },
          { id: 'party_2', userId: 'user_2', role: 'guardian', weight: 1, isActive: true },
          { id: 'party_3', userId: 'user_3', role: 'backup', weight: 1, isActive: true }
        ],
        status: 'active',
        balance: 2500.0,
        currency: 'NST',
        socialTransfers: 15,
        totalSent: 1250.0
      }
    ];

    const mockPendingTransfers = [
      {
        id: 'social_1',
        mpcWalletId: 'mpc_wallet_1',
        platform: 'instagram',
        recipient: '@john_doe',
        amount: 50.0,
        currency: 'NST',
        message: 'Thanks for the great content!',
        isPrivate: true,
        status: 'pending_approval',
        approvals: [
          { partyId: 'party_1', userId: user?.id, approved: true, timestamp: Date.now() - 3600000 }
        ],
        requiredApprovals: 2,
        expiresAt: Date.now() + 86400000,
        createdAt: Date.now() - 3600000
      },
      {
        id: 'social_2',
        mpcWalletId: 'mpc_wallet_1',
        platform: 'whatsapp',
        recipient: '+254712345678',
        amount: 200.0,
        currency: 'NST',
        message: 'Split the dinner bill',
        isPrivate: false,
        status: 'pending_approval',
        approvals: [],
        requiredApprovals: 2,
        expiresAt: Date.now() + 43200000,
        createdAt: Date.now() - 1800000
      }
    ];

    const mockSocialStats = {
      totalTransfers: 47,
      totalAmount: 3250.0,
      platforms: {
        instagram: { transfers: 18, amount: 1200.0 },
        whatsapp: { transfers: 15, amount: 1500.0 },
        twitter: { transfers: 8, amount: 400.0 },
        telegram: { transfers: 6, amount: 150.0 }
      },
      monthlyGrowth: 23.5,
      viralScore: 87
    };

    setMpcWallets(mockMPCWallets);
    setPendingSocialTransfers(mockPendingTransfers);
    setSocialStats(mockSocialStats);
    
    if (mockMPCWallets.length > 0) {
      setSelectedWallet(mockMPCWallets[0]);
    }
  }, [user]);

  const handleCreateSocialTransfer = async (transferData) => {
    setIsLoading(true);
    try {
      // In production, call MPC service
      showToast({ message: 'Social transfer created! Awaiting approvals.', type: 'success' });
      setShowCreateTransfer(false);
    } catch (error) {
      showToast({ message: 'Failed to create social transfer', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransfer = async (transferId, approved) => {
    try {
      // In production, call MPC service
      showToast({ 
        message: approved ? 'Transfer approved!' : 'Transfer rejected!', 
        type: approved ? 'success' : 'warning' 
      });
    } catch (error) {
      showToast({ message: 'Failed to process approval', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'pending_approval': return theme.colors.warning;
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error.hex;
      case 'expired': return theme.colors.text.muted;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle />;
      case 'pending_approval': return <FiClock />;
      case 'approved': return <FiCheckCircle />;
      case 'rejected': return <FiX />;
      case 'expired': return <FiClock />;
      default: return <FiActivity />;
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram': return <FiInstagram />;
      case 'whatsapp': return <FiMessageCircle />;
      case 'twitter': return <FiTwitter />;
      case 'telegram': return <FiMessageCircle />;
      default: return <FiShare2 />;
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="mpc-social-integration" style={{ background: theme.colors.background.primary }}>
      {/* Header */}
      <div className="integration-header" style={{ 
        background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10)`,
        borderBottom: `1px solid ${theme.colors.border.primary}`
      }}>
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon" style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white
            }}>
              <FiShield size={24} />
            </div>
            <div>
              <h1 style={{ color: theme.colors.text.primary }}>MPC Social Integration</h1>
              <p style={{ color: theme.colors.text.secondary }}>
                Secure social media money transfers with multi-party approval
              </p>
            </div>
          </div>
          <button
            className="create-transfer-btn"
            onClick={() => setShowCreateTransfer(true)}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white,
              border: 'none'
            }}
          >
            <FiPlus size={18} />
            Create Transfer
          </button>
        </div>
      </div>

      <div className="integration-content">
        {/* Sidebar */}
        <div className="integration-sidebar" style={{ 
          background: theme.colors.background.secondary,
          borderRight: `1px solid ${theme.colors.border.primary}`
        }}>
          <div className="wallet-selector">
            <h3 style={{ color: theme.colors.text.primary }}>Select MPC Wallet</h3>
            {mpcWallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`wallet-option ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
                onClick={() => setSelectedWallet(wallet)}
                style={{
                  background: selectedWallet?.id === wallet.id 
                    ? `${theme.colors.primary}10` 
                    : 'transparent',
                  border: selectedWallet?.id === wallet.id 
                    ? `1px solid ${theme.colors.primary}` 
                    : `1px solid ${theme.colors.border.primary}`
                }}
              >
                <div className="wallet-info">
                  <h4 style={{ color: theme.colors.text.primary }}>{wallet.name}</h4>
                  <p style={{ color: theme.colors.text.secondary }}>
                    {wallet.threshold}/{wallet.totalParties} threshold
                  </p>
                  <div className="wallet-stats">
                    <span style={{ color: theme.colors.text.primary }}>
                      {wallet.balance.toLocaleString()} {wallet.currency}
                    </span>
                    <span style={{ color: theme.colors.text.secondary }}>
                      {wallet.socialTransfers} transfers
                    </span>
                  </div>
                </div>
                <div className="wallet-status" style={{ color: getStatusColor(wallet.status) }}>
                  {getStatusIcon(wallet.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="nav-tabs">
            {[
              { id: 'overview', label: 'Overview', icon: <FiActivity /> },
              { id: 'pending', label: 'Pending', icon: <FiClock /> },
              { id: 'analytics', label: 'Analytics', icon: <FiTrendingUp /> },
              { id: 'platforms', label: 'Platforms', icon: <BiWorld /> },
              { id: 'settings', label: 'Settings', icon: <FiSettings /> }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  color: activeTab === tab.id ? theme.colors.primary : theme.colors.text.secondary,
                  background: activeTab === tab.id ? `${theme.colors.primary}10` : 'transparent'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="integration-main">
          {activeTab === 'overview' && selectedWallet && (
            <div className="overview-tab">
              <div className="wallet-overview">
                <h2 style={{ color: theme.colors.text.primary }}>{selectedWallet.name}</h2>
                <div className="overview-stats">
                  <div className="stat-card" style={{ 
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="stat-icon" style={{ color: theme.colors.primary }}>
                      <BiMoney size={24} />
                    </div>
                    <div>
                      <h3 style={{ color: theme.colors.text.primary }}>
                        {selectedWallet.balance.toLocaleString()}
                      </h3>
                      <p style={{ color: theme.colors.text.secondary }}>{selectedWallet.currency}</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ 
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="stat-icon" style={{ color: theme.colors.primary }}>
                      <FiSend size={24} />
                    </div>
                    <div>
                      <h3 style={{ color: theme.colors.text.primary }}>
                        {selectedWallet.socialTransfers}
                      </h3>
                      <p style={{ color: theme.colors.text.secondary }}>Social Transfers</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ 
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="stat-icon" style={{ color: theme.colors.primary }}>
                      <FiUsers size={24} />
                    </div>
                    <div>
                      <h3 style={{ color: theme.colors.text.primary }}>
                        {selectedWallet.totalParties}
                      </h3>
                      <p style={{ color: theme.colors.text.secondary }}>Parties</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Social Transfers */}
              <div className="recent-transfers">
                <h3 style={{ color: theme.colors.text.primary }}>Recent Social Transfers</h3>
                <div className="transfers-list">
                  {pendingSocialTransfers
                    .filter(transfer => transfer.mpcWalletId === selectedWallet.id)
                    .slice(0, 5)
                    .map((transfer) => (
                    <div key={transfer.id} className="transfer-item" style={{
                      background: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.primary}`
                    }}>
                      <div className="transfer-icon" style={{ color: theme.colors.primary }}>
                        {getPlatformIcon(transfer.platform)}
                      </div>
                      <div className="transfer-content">
                        <h4 style={{ color: theme.colors.text.primary }}>
                          {transfer.platform.charAt(0).toUpperCase() + transfer.platform.slice(1)}
                        </h4>
                        <p style={{ color: theme.colors.text.secondary }}>
                          To: {transfer.recipient}
                        </p>
                        <div className="transfer-meta">
                          <span style={{ color: theme.colors.text.primary }}>
                            {transfer.isPrivate ? '***' : `${transfer.amount} ${transfer.currency}`}
                          </span>
                          <span style={{ color: theme.colors.text.muted }}>
                            {formatTimeRemaining(transfer.expiresAt)} remaining
                          </span>
                        </div>
                      </div>
                      {transfer.status === 'pending_approval' && (
                        <div className="transfer-actions">
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveTransfer(transfer.id, true)}
                            style={{
                              background: theme.colors.success,
                              color: theme.colors.white
                            }}
                          >
                            <FiCheckCircle size={16} />
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleApproveTransfer(transfer.id, false)}
                            style={{
                              background: theme.colors.error.hex,
                              color: theme.colors.white
                            }}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="pending-tab">
              <h2 style={{ color: theme.colors.text.primary }}>Pending Social Transfers</h2>
              <div className="pending-transfers-list">
                {pendingSocialTransfers.map((transfer) => (
                  <div key={transfer.id} className="pending-transfer-card" style={{
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="transfer-header">
                      <div className="platform-info">
                        <div className="platform-icon" style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                          color: theme.colors.white
                        }}>
                          {getPlatformIcon(transfer.platform)}
                        </div>
                        <div className="transfer-details">
                          <h3 style={{ color: theme.colors.text.primary }}>
                            {transfer.platform.charAt(0).toUpperCase() + transfer.platform.slice(1)} Transfer
                          </h3>
                          <p style={{ color: theme.colors.text.secondary }}>
                            To: {transfer.recipient}
                          </p>
                          {transfer.message && (
                            <p style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                              "{transfer.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="transfer-amount" style={{ color: theme.colors.text.primary }}>
                        {transfer.isPrivate ? '***' : `${transfer.amount} ${transfer.currency}`}
                      </div>
                    </div>
                    
                    <div className="approval-progress">
                      <div className="progress-bar" style={{ background: theme.colors.background.tertiary }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            background: theme.colors.primary,
                            width: `${(transfer.approvals.length / transfer.requiredApprovals) * 100}%`
                          }}
                        />
                      </div>
                      <span style={{ color: theme.colors.text.secondary }}>
                        {transfer.approvals.length}/{transfer.requiredApprovals} approvals
                      </span>
                    </div>
                    
                    <div className="transfer-meta">
                      <span style={{ color: theme.colors.text.muted }}>
                        Expires in {formatTimeRemaining(transfer.expiresAt)}
                      </span>
                      <span style={{ color: getStatusColor(transfer.status) }}>
                        {transfer.status.replace('_', ' ')}
                      </span>
                    </div>

                    {transfer.status === 'pending_approval' && (
                      <div className="transfer-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleApproveTransfer(transfer.id, true)}
                          style={{
                            background: theme.colors.success,
                            color: theme.colors.white
                          }}
                        >
                          <FiCheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleApproveTransfer(transfer.id, false)}
                          style={{
                            background: theme.colors.error.hex,
                            color: theme.colors.white
                          }}
                        >
                          <FiX size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <h2 style={{ color: theme.colors.text.primary }}>Social Transfer Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card" style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <h3 style={{ color: theme.colors.text.primary }}>Total Transfers</h3>
                  <div className="metric-value" style={{ color: theme.colors.primary }}>
                    {socialStats.totalTransfers}
                  </div>
                  <div className="metric-change" style={{ color: theme.colors.success }}>
                    +{socialStats.monthlyGrowth}% this month
                  </div>
                </div>
                
                <div className="analytics-card" style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <h3 style={{ color: theme.colors.text.primary }}>Total Amount</h3>
                  <div className="metric-value" style={{ color: theme.colors.primary }}>
                    {socialStats.totalAmount.toLocaleString()} NST
                  </div>
                  <div className="metric-change" style={{ color: theme.colors.success }}>
                    +{socialStats.monthlyGrowth}% this month
                  </div>
                </div>
                
                <div className="analytics-card" style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <h3 style={{ color: theme.colors.text.primary }}>Viral Score</h3>
                  <div className="metric-value" style={{ color: theme.colors.primary }}>
                    {socialStats.viralScore}
                  </div>
                  <div className="metric-change" style={{ color: theme.colors.success }}>
                    High engagement
                  </div>
                </div>
              </div>
              
              <div className="platform-breakdown">
                <h3 style={{ color: theme.colors.text.primary }}>Platform Breakdown</h3>
                <div className="platform-stats">
                  {Object.entries(socialStats.platforms).map(([platform, stats]) => (
                    <div key={platform} className="platform-stat" style={{
                      background: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.primary}`
                    }}>
                      <div className="platform-icon" style={{ color: theme.colors.primary }}>
                        {getPlatformIcon(platform)}
                      </div>
                      <div className="platform-info">
                        <h4 style={{ color: theme.colors.text.primary }}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </h4>
                        <p style={{ color: theme.colors.text.secondary }}>
                          {stats.transfers} transfers • {stats.amount} NST
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="platforms-tab">
              <h2 style={{ color: theme.colors.text.primary }}>Platform Integration</h2>
              <div className="platforms-grid">
                {[
                  { id: 'instagram', name: 'Instagram', icon: <FiInstagram />, connected: true, transfers: 18 },
                  { id: 'whatsapp', name: 'WhatsApp', icon: <FiMessageCircle />, connected: true, transfers: 15 },
                  { id: 'twitter', name: 'Twitter', icon: <FiTwitter />, connected: true, transfers: 8 },
                  { id: 'telegram', name: 'Telegram', icon: <FiMessageCircle />, connected: false, transfers: 0 },
                  { id: 'discord', name: 'Discord', icon: <FiMessageCircle />, connected: false, transfers: 0 },
                  { id: 'slack', name: 'Slack', icon: <FiMessageCircle />, connected: false, transfers: 0 }
                ].map((platform) => (
                  <div key={platform.id} className="platform-card" style={{
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="platform-header">
                      <div className="platform-icon" style={{
                        background: platform.connected 
                          ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                          : theme.colors.background.tertiary,
                        color: platform.connected ? theme.colors.white : theme.colors.text.muted
                      }}>
                        {platform.icon}
                      </div>
                      <div className="connection-status" style={{
                        color: platform.connected ? theme.colors.success : theme.colors.text.muted
                      }}>
                        {platform.connected ? <FiCheckCircle /> : <FiX />}
                      </div>
                    </div>
                    <div className="platform-info">
                      <h3 style={{ color: theme.colors.text.primary }}>{platform.name}</h3>
                      <p style={{ color: theme.colors.text.secondary }}>
                        {platform.transfers} transfers
                      </p>
                    </div>
                    <div className="platform-actions">
                      {platform.connected ? (
                        <button
                          className="manage-btn"
                          style={{
                            background: theme.colors.primary,
                            color: theme.colors.white
                          }}
                        >
                          Manage
                        </button>
                      ) : (
                        <button
                          className="connect-btn"
                          style={{
                            background: theme.colors.background.tertiary,
                            color: theme.colors.text.primary,
                            border: `1px solid ${theme.colors.border.primary}`
                          }}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && selectedWallet && (
            <div className="settings-tab">
              <h2 style={{ color: theme.colors.text.primary }}>MPC Social Settings</h2>
              <div className="settings-sections">
                <div className="setting-section" style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <h3 style={{ color: theme.colors.text.primary }}>Transfer Settings</h3>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Auto-approve small amounts</span>
                    <span style={{ color: theme.colors.text.primary }}>Disabled</span>
                  </div>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Default privacy mode</span>
                    <span style={{ color: theme.colors.text.primary }}>Private</span>
                  </div>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Transfer timeout</span>
                    <span style={{ color: theme.colors.text.primary }}>24 hours</span>
                  </div>
                </div>
                
                <div className="setting-section" style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <h3 style={{ color: theme.colors.text.primary }}>Security Settings</h3>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Threshold</span>
                    <span style={{ color: theme.colors.text.primary }}>
                      {selectedWallet.threshold} of {selectedWallet.totalParties}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Status</span>
                    <span style={{ color: getStatusColor(selectedWallet.status) }}>
                      {selectedWallet.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Transfer Modal */}
      {showCreateTransfer && (
        <CreateSocialTransferModal
          isOpen={showCreateTransfer}
          onClose={() => setShowCreateTransfer(false)}
          onCreate={handleCreateSocialTransfer}
          isLoading={isLoading}
          selectedWallet={selectedWallet}
        />
      )}
    </div>
  );
};

// Create Social Transfer Modal Component
const CreateSocialTransferModal = ({ isOpen, onClose, onCreate, isLoading, selectedWallet }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    platform: 'instagram',
    recipient: '',
    amount: '',
    message: '',
    isPrivate: true
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="modal-content" style={{
        background: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <div className="modal-header">
          <h2 style={{ color: theme.colors.text.primary }}>Create Social Transfer</h2>
          <button onClick={onClose} style={{ color: theme.colors.text.secondary }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({...formData, platform: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
            >
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="twitter">Twitter</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Recipient</label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({...formData, recipient: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
              placeholder="Username, phone number, or handle"
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Amount (NST)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Message (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
              placeholder="Add a message with your transfer"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                style={{ marginRight: '0.5rem' }}
              />
              Private transfer (hide amount from recipient)
            </label>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            onClick={onClose}
            style={{
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate(formData)}
            disabled={isLoading || !formData.recipient || !formData.amount}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white
            }}
          >
            {isLoading ? 'Creating...' : 'Create Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MPCSocialIntegration;
