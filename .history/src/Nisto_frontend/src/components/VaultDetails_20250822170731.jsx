import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiUsers, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, 
  FiEdit2, FiTrash2, FiUserPlus, FiEye, FiShield, FiArrowDownCircle, FiArrowUpCircle, 
  FiSend, FiGlobe, FiMessageCircle, FiMoreVertical, FiSmile, FiPaperclip, FiSearch, FiBell, FiSettings,
  FiCalendar, FiEyeOff
} from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';

export default function VaultDetails({ vault, details, onBack, user, showToast }) {
  const { theme } = useTheme();
  const { 
    depositToVault, withdrawFromVault, editGroupVault, deleteGroupVault, 
    inviteVaultMember, removeVaultMember, changeVaultMemberRole, toggleVaultPrivacy
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [editForm, setEditForm] = useState({
    name: vault?.name || '',
    description: vault?.description || '',
    currency: vault?.currency || '',
    targetAmount: vault?.targetAmount || '',
    isPublic: vault?.isPublic || false
  });
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  if (!vault) return null;

  const isOwner = vault.owner === user?.principal;
  const isAdmin = vault.members?.some(m => m.userId === user?.principal && m.role === 'admin');
  const canManage = isOwner || isAdmin;

  const formatAmount = (amount) => {
    if (typeof amount === 'bigint') {
      return (Number(amount) / 100000000).toFixed(8);
    }
    return amount?.toString() || '0';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <AiFillCrown style={{ color: theme.colors.warning }} />;
      case 'admin': return <FiShield style={{ color: theme.colors.primary }} />;
      case 'member': return <FiUsers style={{ color: theme.colors.text.secondary }} />;
      default: return <FiUsers />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return theme.colors.warning;
      case 'admin': return theme.colors.primary;
      case 'member': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      content: newMessage,
      senderId: user?.principal,
      senderName: user?.displayName || user?.username || 'You',
      timestamp: Date.now() * 1000000,
      isOwn: true
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: theme.colors.white,
        borderRadius: '1.5rem',
        maxWidth: '1000px',
        width: '95%',
        maxHeight: '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem 2rem 1.5rem 2rem',
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${theme.colors.white} 0%, ${theme.colors.border.secondary} 100%)`
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                color: theme.colors.text.primary,
                letterSpacing: '-0.025em'
              }}>
                {vault.name}
              </h2>
              <div style={{
                padding: '0.25rem 0.75rem',
                background: theme.colors.primary + '10',
                color: theme.colors.primary,
                borderRadius: '2rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {typeof vault.vaultType === 'object' ? (vault.vaultType.Savings || 'Savings') : vault.vaultType}
              </div>
            </div>
            <p style={{ 
              margin: 0, 
              color: theme.colors.text.secondary, 
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {vault.isPublic ? <FiGlobe size={14} /> : <FiLock size={14} />}
              {vault.isPublic ? 'Public' : 'Private'} Vault • {vault.memberCount || 0} members
            </p>
          </div>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: theme.colors.text.secondary,
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme.colors.border.secondary;
              e.target.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = theme.colors.text.secondary;
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          background: theme.colors.border.secondary
        }}>
          {['overview', 'members', 'transactions', 'chat', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                background: activeTab === tab ? theme.colors.white : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${theme.colors.primary}` : 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab ? '600' : '500',
                color: activeTab === tab ? theme.colors.primary : theme.colors.text.secondary,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                letterSpacing: '0.025em'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
          {activeTab === 'overview' && (
            <div>
              {/* Vault Info Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.success}10 0%, ${theme.colors.success}05 100%)`,
                  border: `1px solid ${theme.colors.success}20`,
                  borderRadius: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: theme.colors.success,
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.white
                    }}>
                      <FiDollarSign size={20} />
                    </div>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: theme.colors.success,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Current Balance
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '700', 
                    color: theme.colors.success,
                    marginBottom: '0.5rem'
                  }}>
                    {showBalances ? formatAmount(vault.balance || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                    Available for transactions
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.warning}10 0%, ${theme.colors.warning}05 100%)`,
                  border: `1px solid ${theme.colors.warning}20`,
                  borderRadius: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: theme.colors.warning,
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.white
                    }}>
                      <FiTarget size={20} />
                    </div>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: theme.colors.warning,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Target Amount
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '700', 
                    color: theme.colors.warning,
                    marginBottom: '0.5rem'
                  }}>
                    {showBalances ? formatAmount(vault.targetAmount || 0) : '***'} {vault.currency || 'NST'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                    Goal to achieve
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.primary}10 0%, ${theme.colors.primary}05 100%)`,
                  border: `1px solid ${theme.colors.primary}20`,
                  borderRadius: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: theme.colors.primary,
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.white
                    }}>
                      <FiUsers size={20} />
                    </div>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: theme.colors.primary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Members
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '700', 
                    color: theme.colors.primary,
                    marginBottom: '0.5rem'
                  }}>
                    {vault.memberCount || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                    Active participants
                  </div>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.text.secondary}10 0%, ${theme.colors.text.secondary}05 100%)`,
                  border: `1px solid ${theme.colors.text.secondary}20`,
                  borderRadius: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: theme.colors.text.secondary,
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.white
                    }}>
                      <FiCalendar size={20} />
                    </div>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: theme.colors.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Created
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: theme.colors.text.primary,
                    marginBottom: '0.5rem'
                  }}>
                    {formatDate(vault.createdAt)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                    Vault established
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: theme.colors.text.primary 
                }}>
                  Description
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: theme.colors.text.secondary, 
                  lineHeight: '1.7',
                  fontSize: '0.95rem'
                }}>
                  {vault.description || 'No description available'}
                </p>
              </div>

              {/* Progress Bar */}
              {vault.targetAmount && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1rem',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: theme.colors.text.primary 
                    }}>
                      Progress
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: theme.colors.text.secondary,
                      fontWeight: '500'
                    }}>
                      {Math.round((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: theme.colors.border.primary,
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${Math.min((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100, 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${theme.colors.success}, ${theme.colors.success}dd)`,
                      transition: 'width 0.8s ease',
                      borderRadius: '6px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        animation: 'shimmer 2s infinite'
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <button style={{
                  padding: '1rem 1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${theme.colors.success}30`
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 8px 20px ${theme.colors.success}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 12px ${theme.colors.success}30`;
                }}
                >
                  <FiArrowUpCircle size={18} />
                  Deposit
                </button>
                <button style={{
                  padding: '1rem 1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.warning} 0%, ${theme.colors.warning}dd 100%)`,
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${theme.colors.warning}30`
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 8px 20px ${theme.colors.warning}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 12px ${theme.colors.warning}30`;
                }}
                >
                  <FiArrowDownCircle size={18} />
                  Withdraw
                </button>
                <button style={{
                  padding: '1rem 1.5rem',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${theme.colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 8px 20px ${theme.colors.primary}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 12px ${theme.colors.primary}30`;
                }}
                >
                  <FiUserPlus size={18} />
                  Invite Member
                </button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem' 
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: theme.colors.text.primary 
                }}>
                  Members ({vault.members?.length || 0})
                </h3>
                {canManage && (
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: theme.colors.primary,
                    color: theme.colors.white,
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}>
                    <FiUserPlus size={16} />
                    Invite Member
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {vault.members?.map((member, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    background: theme.colors.white,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: '1rem',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        background: getRoleColor(member.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.white,
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        {getRoleIcon(member.role)}
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          color: theme.colors.text.primary,
                          fontSize: '1rem',
                          marginBottom: '0.25rem'
                        }}>
                          {member.displayName || member.username || 'Unknown User'}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: theme.colors.text.secondary 
                        }}>
                          {member.userId?.slice(0, 8)}...{member.userId?.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        background: getRoleColor(member.role) + '15',
                        color: getRoleColor(member.role),
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        letterSpacing: '0.05em'
                      }}>
                        {member.role}
                      </span>
                      {canManage && member.role !== 'owner' && (
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: theme.colors.text.secondary,
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          transition: 'all 0.2s'
                        }}>
                          <FiEdit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )) || (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: theme.colors.text.secondary 
                  }}>
                    No members found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 style={{ 
                margin: '0 0 2rem 0', 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: theme.colors.text.primary 
              }}>
                Recent Transactions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {details?.transactions?.map((tx, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    background: theme.colors.white,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: '1rem',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        background: tx.type === 'deposit' ? theme.colors.success : theme.colors.error,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.white
                      }}>
                        {tx.type === 'deposit' ? <FiArrowUpCircle size={20} /> : <FiArrowDownCircle size={20} />}
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          color: theme.colors.text.primary, 
                          textTransform: 'capitalize',
                          fontSize: '1rem',
                          marginBottom: '0.25rem'
                        }}>
                          {tx.type}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: theme.colors.text.secondary 
                        }}>
                          {tx.description || 'No description'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: tx.type === 'deposit' ? theme.colors.success : theme.colors.error,
                        fontSize: '1.125rem',
                        marginBottom: '0.25rem'
                      }}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount)} {vault.currency || 'NST'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.text.secondary }}>
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: theme.colors.text.secondary 
                  }}>
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              minHeight: '500px'
            }}>
              {/* Chat Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: `1px solid ${theme.colors.border.primary}`
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: theme.colors.text.primary 
                }}>
                  Vault Chat
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: theme.colors.success + '15',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    color: theme.colors.success,
                    fontWeight: '500'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: theme.colors.success 
                    }} />
                    {vault.members?.length || 0} members online
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                marginBottom: '1.5rem',
                padding: '1rem',
                background: theme.colors.border.secondary,
                borderRadius: '1rem',
                border: `1px solid ${theme.colors.border.primary}`,
                maxHeight: '400px'
              }}
              ref={chatContainerRef}
              >
                {chatMessages.length > 0 ? (
                  chatMessages.map((message, index) => (
                    <div key={index} style={{
                      marginBottom: '1.5rem',
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: message.isOwn ? 'flex-end' : 'flex-start'
                    }}>
                      {!message.isOwn && (
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: theme.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.colors.white,
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {(message.senderName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ 
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.isOwn ? 'flex-end' : 'flex-start'
                      }}>
                        {!message.isOwn && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            marginBottom: '0.5rem' 
                          }}>
                            <span style={{ 
                              fontWeight: '600', 
                              color: theme.colors.text.primary,
                              fontSize: '0.875rem'
                            }}>
                              {message.senderName || 'Unknown User'}
                            </span>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: theme.colors.text.secondary 
                            }}>
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        )}
                        <div style={{
                          padding: '1rem 1.25rem',
                          background: message.isOwn ? theme.colors.primary : theme.colors.white,
                          color: message.isOwn ? theme.colors.white : theme.colors.text.primary,
                          borderRadius: message.isOwn ? '1.25rem 1.25rem 0.5rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.5rem',
                          border: message.isOwn ? 'none' : `1px solid ${theme.colors.border.primary}`,
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          boxShadow: message.isOwn ? `0 2px 8px ${theme.colors.primary}30` : '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {message.content}
                        </div>
                        {message.isOwn && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: theme.colors.text.secondary,
                            marginTop: '0.25rem'
                          }}>
                            {formatDate(message.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: theme.colors.text.secondary,
                    fontStyle: 'italic'
                  }}>
                    <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                      No messages yet
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                      Start the conversation with your vault members!
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-end',
                background: theme.colors.white,
                padding: '1.5rem',
                borderRadius: '1rem',
                border: `1px solid ${theme.colors.border.primary}`
              }}>
                <div style={{ flex: 1 }}>
                  <textarea
                    ref={messageInputRef}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      maxHeight: '120px',
                      padding: '1rem 1.25rem',
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s',
                      background: theme.colors.white
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}15`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border.primary;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '1rem 1.5rem',
                    background: newMessage.trim() ? theme.colors.primary : theme.colors.border.primary,
                    color: newMessage.trim() ? theme.colors.white : theme.colors.text.secondary,
                    border: 'none',
                    borderRadius: '1rem',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    height: '60px',
                    transition: 'all 0.2s',
                    boxShadow: newMessage.trim() ? `0 4px 12px ${theme.colors.primary}30` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (newMessage.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 20px ${theme.colors.primary}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newMessage.trim()) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = `0 4px 12px ${theme.colors.primary}30`;
                    }
                  }}
                >
                  <FiSend size={18} />
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && canManage && (
            <div>
              <h3 style={{ 
                margin: '0 0 2rem 0', 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: theme.colors.text.primary 
              }}>
                Vault Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  background: theme.colors.white,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}>
                  <span>Edit Vault</span>
                  <FiEdit2 size={16} />
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  background: theme.colors.white,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}>
                  <span>Change Privacy</span>
                  {vault.isPublic ? <FiGlobe size={16} /> : <FiLock size={16} />}
                </button>
                {isOwner && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    background: theme.colors.error + '10',
                    border: `1px solid ${theme.colors.error}30`,
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: theme.colors.error,
                    transition: 'all 0.2s'
                  }}>
                    <span>Delete Vault</span>
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 