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
  FiUnlock
} from 'react-icons/fi';
import { BiMoney, BiTransfer, BiGroup } from 'react-icons/bi';
import './MPCWallet.scss';

const MPCWallet = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [mpcWallets, setMpcWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [socialTransfers, setSocialTransfers] = useState([]);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showAddParty, setShowAddParty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockMPCWallets = [
      {
        id: 'mpc_wallet_1',
        name: 'Family Wallet',
        threshold: 2,
        totalParties: 3,
        parties: [
          { id: 'party_1', userId: user?.id, role: 'owner', weight: 1, isActive: true },
          { id: 'party_2', userId: 'user_2', role: 'guardian', weight: 1, isActive: true },
          { id: 'party_3', userId: 'user_3', role: 'backup', weight: 1, isActive: true }
        ],
        status: 'active',
        createdAt: Date.now() - 86400000,
        balance: 2500.0,
        currency: 'NST'
      },
      {
        id: 'mpc_wallet_2',
        name: 'Business Account',
        threshold: 3,
        totalParties: 5,
        parties: [
          { id: 'party_4', userId: user?.id, role: 'owner', weight: 1, isActive: true },
          { id: 'party_5', userId: 'user_4', role: 'guardian', weight: 1, isActive: true },
          { id: 'party_6', userId: 'user_5', role: 'guardian', weight: 1, isActive: true },
          { id: 'party_7', userId: 'user_6', role: 'backup', weight: 1, isActive: true },
          { id: 'party_8', userId: 'user_7', role: 'backup', weight: 1, isActive: true }
        ],
        status: 'active',
        createdAt: Date.now() - 172800000,
        balance: 15000.0,
        currency: 'NST'
      }
    ];

    const mockPendingTransactions = [
      {
        id: 'txn_1',
        mpcWalletId: 'mpc_wallet_1',
        type: 'send',
        amount: 500.0,
        currency: 'NST',
        toAddress: 'user_recipient',
        description: 'Payment for services',
        status: 'pending_approval',
        approvals: [
          { partyId: 'party_1', userId: user?.id, approved: true, timestamp: Date.now() - 3600000 }
        ],
        requiredApprovals: 2,
        expiresAt: Date.now() + 86400000,
        createdAt: Date.now() - 3600000
      },
      {
        id: 'txn_2',
        mpcWalletId: 'mpc_wallet_2',
        type: 'social_transfer',
        amount: 100.0,
        currency: 'NST',
        toAddress: '@instagram_user',
        description: 'Social transfer to Instagram user: @instagram_user',
        status: 'pending_approval',
        approvals: [],
        requiredApprovals: 3,
        expiresAt: Date.now() + 43200000,
        createdAt: Date.now() - 1800000
      }
    ];

    const mockSocialTransfers = [
      {
        id: 'social_1',
        mpcWalletId: 'mpc_wallet_1',
        platform: 'instagram',
        recipient: '@john_doe',
        amount: 50.0,
        currency: 'NST',
        message: 'Thanks for the great content!',
        isPrivate: true,
        status: 'completed',
        createdAt: Date.now() - 7200000
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
        createdAt: Date.now() - 1800000
      }
    ];

    setMpcWallets(mockMPCWallets);
    setPendingTransactions(mockPendingTransactions);
    setSocialTransfers(mockSocialTransfers);
    
    if (mockMPCWallets.length > 0) {
      setSelectedWallet(mockMPCWallets[0]);
    }
  }, [user]);

  const handleCreateWallet = async (walletData) => {
    setIsLoading(true);
    try {
      // In production, call MPC service
      showToast({ message: 'MPC wallet created successfully!', type: 'success' });
      setShowCreateWallet(false);
    } catch (error) {
      showToast({ message: 'Failed to create MPC wallet', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId, approved) => {
    try {
      // In production, call MPC service
      showToast({ 
        message: approved ? 'Transaction approved!' : 'Transaction rejected!', 
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
    <div className="mpc-wallet" style={{ background: theme.colors.background.primary }}>
      {/* Header */}
      <div className="mpc-header" style={{ 
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
              <h1 style={{ color: theme.colors.text.primary }}>MPC Wallets</h1>
              <p style={{ color: theme.colors.text.secondary }}>
                Multi-party computation for enhanced security
              </p>
            </div>
          </div>
          <button
            className="create-wallet-btn"
            onClick={() => setShowCreateWallet(true)}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white,
              border: 'none'
            }}
          >
            <FiPlus size={18} />
            Create MPC Wallet
          </button>
        </div>
      </div>

      <div className="mpc-content">
        {/* Sidebar */}
        <div className="mpc-sidebar" style={{ 
          background: theme.colors.background.secondary,
          borderRight: `1px solid ${theme.colors.border.primary}`
        }}>
          <div className="wallet-list">
            <h3 style={{ color: theme.colors.text.primary }}>Your MPC Wallets</h3>
            {mpcWallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`wallet-item ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
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
                  <div className="wallet-balance">
                    <span style={{ color: theme.colors.text.primary }}>
                      {wallet.balance.toLocaleString()} {wallet.currency}
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
              { id: 'transactions', label: 'Transactions', icon: <BiTransfer /> },
              { id: 'social', label: 'Social Transfers', icon: <FiSend /> },
              { id: 'parties', label: 'Parties', icon: <FiUsers /> },
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
        <div className="mpc-main">
          {activeTab === 'overview' && selectedWallet && (
            <div className="overview-tab">
              <div className="wallet-header">
                <h2 style={{ color: theme.colors.text.primary }}>{selectedWallet.name}</h2>
                <div className="wallet-stats">
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
                      <FiUsers size={24} />
                    </div>
                    <div>
                      <h3 style={{ color: theme.colors.text.primary }}>
                        {selectedWallet.totalParties}
                      </h3>
                      <p style={{ color: theme.colors.text.secondary }}>Parties</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ 
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="stat-icon" style={{ color: theme.colors.primary }}>
                      <FiShield size={24} />
                    </div>
                    <div>
                      <h3 style={{ color: theme.colors.text.primary }}>
                        {selectedWallet.threshold}
                      </h3>
                      <p style={{ color: theme.colors.text.secondary }}>Threshold</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h3 style={{ color: theme.colors.text.primary }}>Recent Activity</h3>
                <div className="activity-list">
                  {pendingTransactions
                    .filter(tx => tx.mpcWalletId === selectedWallet.id)
                    .slice(0, 5)
                    .map((transaction) => (
                    <div key={transaction.id} className="activity-item" style={{
                      background: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.primary}`
                    }}>
                      <div className="activity-icon" style={{ color: getStatusColor(transaction.status) }}>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div className="activity-content">
                        <h4 style={{ color: theme.colors.text.primary }}>
                          {transaction.type === 'social_transfer' ? 'Social Transfer' : 'Transaction'}
                        </h4>
                        <p style={{ color: theme.colors.text.secondary }}>
                          {transaction.description}
                        </p>
                        <div className="activity-meta">
                          <span style={{ color: theme.colors.text.primary }}>
                            {transaction.amount} {transaction.currency}
                          </span>
                          <span style={{ color: theme.colors.text.muted }}>
                            {formatTimeRemaining(transaction.expiresAt)} remaining
                          </span>
                        </div>
                      </div>
                      {transaction.status === 'pending_approval' && (
                        <div className="activity-actions">
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveTransaction(transaction.id, true)}
                            style={{
                              background: theme.colors.success,
                              color: theme.colors.white
                            }}
                          >
                            <FiCheckCircle size={16} />
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleApproveTransaction(transaction.id, false)}
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

          {activeTab === 'transactions' && (
            <div className="transactions-tab">
              <h2 style={{ color: theme.colors.text.primary }}>Pending Transactions</h2>
              <div className="transactions-list">
                {pendingTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-card" style={{
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="transaction-header">
                      <div className="transaction-info">
                        <h3 style={{ color: theme.colors.text.primary }}>
                          {transaction.type === 'social_transfer' ? 'Social Transfer' : 'Transaction'}
                        </h3>
                        <p style={{ color: theme.colors.text.secondary }}>
                          {transaction.description}
                        </p>
                      </div>
                      <div className="transaction-amount" style={{ color: theme.colors.text.primary }}>
                        {transaction.amount} {transaction.currency}
                      </div>
                    </div>
                    
                    <div className="transaction-details">
                      <div className="approval-progress">
                        <div className="progress-bar" style={{ background: theme.colors.background.tertiary }}>
                          <div 
                            className="progress-fill" 
                            style={{ 
                              background: theme.colors.primary,
                              width: `${(transaction.approvals.length / transaction.requiredApprovals) * 100}%`
                            }}
                          />
                        </div>
                        <span style={{ color: theme.colors.text.secondary }}>
                          {transaction.approvals.length}/{transaction.requiredApprovals} approvals
                        </span>
                      </div>
                      
                      <div className="transaction-meta">
                        <span style={{ color: theme.colors.text.muted }}>
                          Expires in {formatTimeRemaining(transaction.expiresAt)}
                        </span>
                        <span style={{ color: getStatusColor(transaction.status) }}>
                          {transaction.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {transaction.status === 'pending_approval' && (
                      <div className="transaction-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleApproveTransaction(transaction.id, true)}
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
                          onClick={() => handleApproveTransaction(transaction.id, false)}
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

          {activeTab === 'social' && (
            <div className="social-tab">
              <h2 style={{ color: theme.colors.text.primary }}>Social Media Transfers</h2>
              <div className="social-transfers-list">
                {socialTransfers.map((transfer) => (
                  <div key={transfer.id} className="social-transfer-card" style={{
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="transfer-header">
                      <div className="platform-icon" style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        color: theme.colors.white
                      }}>
                        {transfer.platform === 'instagram' ? '📷' : 
                         transfer.platform === 'whatsapp' ? '💬' :
                         transfer.platform === 'twitter' ? '🐦' : '📱'}
                      </div>
                      <div className="transfer-info">
                        <h3 style={{ color: theme.colors.text.primary }}>
                          {transfer.platform.charAt(0).toUpperCase() + transfer.platform.slice(1)}
                        </h3>
                        <p style={{ color: theme.colors.text.secondary }}>
                          To: {transfer.recipient}
                        </p>
                      </div>
                      <div className="transfer-amount" style={{ color: theme.colors.text.primary }}>
                        {transfer.isPrivate ? '***' : `${transfer.amount} ${transfer.currency}`}
                      </div>
                    </div>
                    
                    {transfer.message && (
                      <div className="transfer-message" style={{ color: theme.colors.text.secondary }}>
                        "{transfer.message}"
                      </div>
                    )}
                    
                    <div className="transfer-status" style={{ color: getStatusColor(transfer.status) }}>
                      {getStatusIcon(transfer.status)}
                      {transfer.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'parties' && selectedWallet && (
            <div className="parties-tab">
              <div className="parties-header">
                <h2 style={{ color: theme.colors.text.primary }}>Wallet Parties</h2>
                <button
                  className="add-party-btn"
                  onClick={() => setShowAddParty(true)}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: theme.colors.white
                  }}
                >
                  <FiUserPlus size={16} />
                  Add Party
                </button>
              </div>
              
              <div className="parties-list">
                {selectedWallet.parties.map((party) => (
                  <div key={party.id} className="party-card" style={{
                    background: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div className="party-avatar" style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                      color: theme.colors.white
                    }}>
                      {party.role.charAt(0).toUpperCase()}
                    </div>
                    <div className="party-info">
                      <h3 style={{ color: theme.colors.text.primary }}>
                        {party.role.charAt(0).toUpperCase() + party.role.slice(1)}
                      </h3>
                      <p style={{ color: theme.colors.text.secondary }}>
                        Weight: {party.weight}
                      </p>
                    </div>
                    <div className="party-status">
                      {party.isActive ? (
                        <FiUnlock style={{ color: theme.colors.success }} />
                      ) : (
                        <FiLock style={{ color: theme.colors.error.hex }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && selectedWallet && (
            <div className="settings-tab">
              <h2 style={{ color: theme.colors.text.primary }}>Wallet Settings</h2>
              <div className="settings-sections">
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
                
                <div className="setting-section" style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <h3 style={{ color: theme.colors.text.primary }}>Wallet Information</h3>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Created</span>
                    <span style={{ color: theme.colors.text.primary }}>
                      {new Date(selectedWallet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="setting-item">
                    <span style={{ color: theme.colors.text.secondary }}>Wallet ID</span>
                    <span style={{ color: theme.colors.text.primary, fontFamily: 'monospace' }}>
                      {selectedWallet.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Wallet Modal */}
      {showCreateWallet && (
        <CreateMPCWalletModal
          isOpen={showCreateWallet}
          onClose={() => setShowCreateWallet(false)}
          onCreate={handleCreateWallet}
          isLoading={isLoading}
        />
      )}

      {/* Add Party Modal */}
      {showAddParty && (
        <AddPartyModal
          isOpen={showAddParty}
          onClose={() => setShowAddParty(false)}
          walletId={selectedWallet?.id}
        />
      )}
    </div>
  );
};

// Create MPC Wallet Modal Component
const CreateMPCWalletModal = ({ isOpen, onClose, onCreate, isLoading }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    threshold: 2,
    parties: [],
    description: ''
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="modal-content" style={{
        background: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <div className="modal-header">
          <h2 style={{ color: theme.colors.text.primary }}>Create MPC Wallet</h2>
          <button onClick={onClose} style={{ color: theme.colors.text.secondary }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Wallet Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
              placeholder="Enter wallet name"
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Threshold (2-5)</label>
            <input
              type="number"
              min="2"
              max="5"
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value)})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
              placeholder="Optional description"
              rows="3"
            />
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
            disabled={isLoading || !formData.name}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white
            }}
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Party Modal Component
const AddPartyModal = ({ isOpen, onClose, walletId }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    userId: '',
    role: 'guardian'
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="modal-content" style={{
        background: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border.primary}`
      }}>
        <div className="modal-header">
          <h2 style={{ color: theme.colors.text.primary }}>Add Party</h2>
          <button onClick={onClose} style={{ color: theme.colors.text.secondary }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>User ID</label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
              placeholder="Enter user ID or username"
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: theme.colors.text.primary }}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary
              }}
            >
              <option value="guardian">Guardian</option>
              <option value="backup">Backup</option>
              <option value="family">Family</option>
              <option value="business">Business</option>
            </select>
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
            onClick={() => {
              // Handle add party
              onClose();
            }}
            disabled={!formData.userId}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.white
            }}
          >
            Add Party
          </button>
        </div>
      </div>
    </div>
  );
};

export default MPCWallet;
