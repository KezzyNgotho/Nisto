import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, FiList, FiSend, FiChevronLeft, FiGlobe, FiPieChart, FiAlertTriangle, FiMapPin, FiBookOpen, FiBriefcase, FiHeart, FiFlag } from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';
import VaultDetails from './VaultDetails';
import PublicVaults from './PublicVaults';

export default function GroupVaults() {
  const { theme } = useTheme();
  // Add CSS animations for modals
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { 
    getUserGroupVaults, 
    createGroupVault, 
    getVaultDetails, 
    depositToVault, 
    inviteVaultMember,
    removeVaultMember,
    changeVaultMemberRole,
    user, 
    isAuthenticated, 
    login 
  } = useAuth();
  
  const { showToast } = useNotification();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVaultId, setExpandedVaultId] = useState(null);
  const [vaultDetails, setVaultDetails] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newVault, setNewVault] = useState({ name: '', description: '', vaultType: 'Savings', currency: '', targetAmount: '', isPublic: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const createBtnRef = useRef();
  const dropdownRef = useRef();
  
  // Vault type options with icons
  const vaultTypeOptions = [
    { value: 'Savings', label: 'Savings Vault', icon: FiDollarSign, color: '#10b981', bgColor: '#d1fae5' },
    { value: 'Investment', label: 'Investment Portfolio', icon: FiTrendingUp, color: '#3b82f6', bgColor: '#dbeafe' },
    { value: 'Emergency', label: 'Emergency Fund', icon: FiAlertTriangle, color: '#f59e0b', bgColor: '#fef3c7' },
    { value: 'Travel', label: 'Travel Fund', icon: FiMapPin, color: '#8b5cf6', bgColor: '#ede9fe' },
    { value: 'Education', label: 'Education Fund', icon: FiBookOpen, color: '#06b6d4', bgColor: '#cffafe' },
    { value: 'Business', label: 'Business Capital', icon: FiBriefcase, color: '#84cc16', bgColor: '#ecfccb' },
    { value: 'Charity', label: 'Charity Fund', icon: FiHeart, color: '#ef4444', bgColor: '#fee2e2' },
    { value: 'Custom', label: 'Custom Goal', icon: FiFlag, color: '#6b7280', bgColor: '#f3f4f6' }
  ];

  // Get vault avatar and colors
  const getVaultAvatar = (vaultType) => {
    const vaultTypeStr = typeof vaultType === 'object' ? Object.keys(vaultType)[0] : vaultType;
    const option = vaultTypeOptions.find(opt => opt.value === vaultTypeStr);
    return option || vaultTypeOptions[0];
  };
  
  // Add state for all modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPropose, setShowPropose] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Add useState for all modal form fields
  const [editForm, setEditForm] = useState({ name: '', description: '', currency: '', targetAmount: '', isPublic: false });
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [proposeType, setProposeType] = useState('DeleteVault');
  const [proposeTarget, setProposeTarget] = useState('');
  const [proposeRole, setProposeRole] = useState('member');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [newRole, setNewRole] = useState('member');
  const [showVaultDetails, setShowVaultDetails] = useState(false);
  const [vaultView, setVaultView] = useState('my-vaults'); // 'my-vaults' or 'public-vaults'
  const [selectedVaultForDetails, setSelectedVaultForDetails] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchVaults = async () => {
      if (!isAuthenticated) {
        await login();
        return;
      }
      setLoading(true);
      try {
        const vs = await getUserGroupVaults();
        setVaults(vs || []);
      } catch (err) {
        setVaults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVaults();
  }, [getUserGroupVaults, isAuthenticated, login]);

  const handleExpand = async (vaultId) => {
    if (expandedVaultId === vaultId) {
      setExpandedVaultId(null);
      setVaultDetails(null);
    } else {
      setExpandedVaultId(vaultId);
      try {
        const details = await getVaultDetails(vaultId);
        setVaultDetails(details);
      } catch {
        setVaultDetails(null);
        showToast({ message: 'Failed to load vault details', type: 'error', icon: <FiDollarSign /> });
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await createGroupVault(
        newVault.name, 
        newVault.description, 
        newVault.vaultType,
        newVault.currency, 
        newVault.targetAmount ? parseFloat(newVault.targetAmount) : null, 
        newVault.isPublic, 
        null
      );
      
      if (result.ok) {
      setShowCreate(false);
        setNewVault({ name: '', description: '', vaultType: 'Savings', currency: '', targetAmount: '', isPublic: false });
        showToast({ message: 'Vault created successfully!', type: 'success', icon: <FiCheck /> });
        
      if (getUserGroupVaults) {
        const userVaults = await getUserGroupVaults();
        setVaults(userVaults || []);
        }
      } else {
        setError(result.err || 'Failed to create vault');
        showToast({ message: result.err || 'Failed to create vault', type: 'error', icon: <FiDollarSign /> });
      }
    } catch (err) {
      console.error('Create vault error:', err);
      setError('Failed to create vault');
      showToast({ message: 'Failed to create vault', type: 'error', icon: <FiDollarSign /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (vault) => {
    setSelectedVault(vault);
    setEditForm({
      name: vault.name || '',
      description: vault.description || '',
      currency: vault.currency || '',
      targetAmount: vault.targetAmount || '',
      isPublic: vault.isPublic || false
    });
    setShowEdit(true);
  };

  const handleOpenVaultDetails = async (vault) => {
    setSelectedVaultForDetails(vault);
    setShowVaultDetails(true);
    try {
      console.log('Getting vault details for vault:', vault.id);
      const details = await getVaultDetails(vault.id);
      console.log('Vault details received:', details);
      setVaultDetails(details);
    } catch (error) {
      console.error('Error getting vault details:', error);
      setVaultDetails(null);
      showToast({ message: 'Failed to load vault details', type: 'error', icon: <FiDollarSign /> });
    }
  };

  const handleBackToVaults = () => {
    setShowVaultDetails(false);
    setSelectedVaultForDetails(null);
    setVaultDetails(null);
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      color: theme.colors.text.secondary,
      fontSize: '1rem'
    }}>
      Loading group vaults...
    </div>
  );

  return (
    <div style={{ width: '100%', padding: '0', margin: 0 }}>
      {/* Sleek Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem', 
        background: theme.colors.white,
        borderRadius: '0.75rem',
        padding: '0.5rem',
        border: `1px solid ${theme.colors.border.secondary}`,
        boxShadow: `0 2px 8px ${theme.colors.shadow.light}`
      }}>
        <button
          onClick={() => setVaultView('my-vaults')}
          style={{
            flex: 1,
            padding: '1rem 1.5rem',
            border: 'none',
            borderRadius: '0.75rem',
            background: vaultView === 'my-vaults' ? theme.colors.primary : 'transparent',
            color: vaultView === 'my-vaults' ? theme.colors.white : theme.colors.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiUsers size={16} />
          My Vaults
        </button>
        <button
          onClick={() => setVaultView('public-vaults')}
          style={{
            flex: 1,
            padding: '1rem 1.5rem',
            border: 'none',
            borderRadius: '0.75rem',
            background: vaultView === 'public-vaults' ? theme.colors.primary : 'transparent',
            color: vaultView === 'public-vaults' ? theme.colors.white : theme.colors.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiGlobe size={16} />
          Discover Vaults
        </button>
      </div>

      {/* Show Public Vaults or My Vaults based on selected tab */}
      {vaultView === 'public-vaults' ? (
        <PublicVaults />
      ) : showVaultDetails && selectedVaultForDetails && vaultDetails ? (
        /* Show Vault Details Component */
        <VaultDetails
          vault={selectedVaultForDetails}
          details={vaultDetails}
          onBack={handleBackToVaults}
          user={user}
          showToast={showToast}
        />
      ) : (
        /* Show Vault Cards */
        <>
          {/* Minimal Create Vault Button */}
        <div style={{
          display: 'flex',
            justifyContent: 'flex-end', 
          alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <button 
              ref={createBtnRef} 
              style={{ 
                padding: '0.75rem 1.5rem',
                background: theme.colors.primary,
                color: theme.colors.white,
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
                boxShadow: 'none'
              }} 
              onClick={() => setShowCreate(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = `0 4px 12px ${theme.colors.shadow.medium}`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FiPlus size={16} />
              Create Vault
            </button>
              </div>
              
          {/* Sleek Vault Grid */}
              <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '2rem',
            margin: 0,
            padding: 0
          }}>
            {vaults.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: theme.colors.text.secondary, 
                fontSize: '1rem', 
                padding: '3rem',
                background: theme.colors.white,
                borderRadius: '0.75rem',
                border: `1px solid ${theme.colors.border.secondary}`,
                boxShadow: `0 2px 8px ${theme.colors.shadow.light}`
              }}>
                No group vaults found.
              </div>
            ) : (
              vaults.map(vault => (
                <div key={vault.id} style={{
                  background: theme.colors.white,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'none'
                }} 
                onClick={() => handleOpenVaultDetails(vault)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 8px 24px ${theme.colors.shadow.medium}`;
                  e.target.style.borderColor = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = theme.colors.border.secondary;
                }}>
                  {/* Enhanced Header with Avatar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                      {/* Vault Avatar */}
                      {(() => {
                        const vaultAvatar = getVaultAvatar(vault.vaultType);
                        const IconComponent = vaultAvatar.icon;
                        return (
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: `linear-gradient(135deg, ${vaultAvatar.color} 0%, ${vaultAvatar.color}dd 100%)`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${vaultAvatar.color}40`,
                            flexShrink: 0
                          }}>
                            <IconComponent size={20} color="white" />
                          </div>
                        );
                      })()}
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: 600, 
                          color: theme.colors.text.primary,
                          margin: '0 0 0.5rem 0',
                          letterSpacing: '-0.025em'
                        }}>
                          {vault.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: vault.isPublic ? theme.colors.success : theme.colors.primary,
                            color: 'white',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {vault.isPublic ? <FiGlobe size={10} /> : <FiLock size={10} />}
                            {vault.isPublic ? 'Public' : 'Private'}
                          </span>
                          {(() => {
                            const vaultAvatar = getVaultAvatar(vault.vaultType);
                            return (
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: vaultAvatar.bgColor,
                                color: vaultAvatar.color,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                border: `1px solid ${vaultAvatar.color}30`
                              }}>
                                {vaultAvatar.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
              
                  {/* Sleek Description */}
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: theme.colors.text.secondary,
                    lineHeight: '1.4',
                    margin: '0 0 1.5rem 0',
                    fontWeight: 400
                  }}>
                    {vault.description || 'No description provided'}
                  </p>

                  {/* Sleek Stats Row */}
              <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    padding: '1.25rem',
                    background: (() => {
                      const vaultAvatar = getVaultAvatar(vault.vaultType);
                      return `linear-gradient(135deg, ${vaultAvatar.bgColor} 0%, ${theme.colors.white} 100%)`;
                    })(),
                    borderRadius: '0.75rem',
                    border: (() => {
                      const vaultAvatar = getVaultAvatar(vault.vaultType);
                      return `1px solid ${vaultAvatar.color}20`;
                    })(),
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '100%',
                      height: '100%',
                      background: (() => {
                        const vaultAvatar = getVaultAvatar(vault.vaultType);
                        return `radial-gradient(circle, ${vaultAvatar.color}10 0%, transparent 70%)`;
                      })(),
                      borderRadius: '50%',
                      zIndex: 0
                    }} />
                    
                    <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        color: (() => {
                          const vaultAvatar = getVaultAvatar(vault.vaultType);
                          return vaultAvatar.color;
                        })(), 
                        fontWeight: 700, 
                        letterSpacing: '-0.025em' 
                      }}>
                        {vault.totalBalance || '0'}
                      </div>
                    </div>
                    <div style={{ 
                      width: '1px', 
                      height: '2.5rem', 
                      background: (() => {
                        const vaultAvatar = getVaultAvatar(vault.vaultType);
                        return `${vaultAvatar.color}30`;
                      })(),
                      position: 'relative',
                      zIndex: 1
                    }} />
                    <div style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currency</div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        color: theme.colors.text.primary, 
                        fontWeight: 700, 
                        letterSpacing: '-0.025em' 
                      }}>
                        {vault.currency || 'NST'}
                      </div>
                    </div>
                  </div>
            
                  {/* Enhanced Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    justifyContent: 'space-between'
                  }}>
                    <button 
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        background: (() => {
                          const vaultAvatar = getVaultAvatar(vault.vaultType);
                          return `linear-gradient(135deg, ${vaultAvatar.color} 0%, ${vaultAvatar.color}dd 100%)`;
                        })(),
                        border: 'none',
                        color: theme.colors.white,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenVaultDetails(vault); 
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 8px 24px ${(() => {
                          const vaultAvatar = getVaultAvatar(vault.vaultType);
                          return `${vaultAvatar.color}40`;
                        })()}`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <FiEye size={12} />
                      </div>
                      <span style={{ fontWeight: 600 }}>View</span>
                    </button>
                    <button 
                      style={{ 
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        background: theme.colors.success,
                        border: 'none',
                        color: theme.colors.white,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowDeposit(true); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = `0 4px 12px ${theme.colors.shadow.medium}`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
              <div style={{
                        width: '16px',
                        height: '16px',
                borderRadius: '4px',
                background: theme.colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                        <FiArrowDownCircle size={12} />
              </div>
                    </button>
                    <button 
                    style={{
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                      fontWeight: 500,
                        background: theme.colors.warning,
                        border: 'none',
                        color: theme.colors.white,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowWithdraw(true); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = `0 4px 12px ${theme.colors.shadow.medium}`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
              <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: theme.colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FiArrowUpCircle size={12} />
                </div>
                    </button>
              <button 
                style={{
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                  fontWeight: 500,
                        background: theme.colors.white,
                        border: `1px solid ${theme.colors.border.secondary}`,
                        color: theme.colors.text.secondary,
                        borderRadius: '0.5rem',
                  cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleEditOpen(vault); }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = `0 4px 12px ${theme.colors.shadow.light}`;
                        e.target.style.borderColor = theme.colors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = theme.colors.border.secondary;
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: `${theme.colors.text.secondary}1a`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FiEdit2 size={12} />
            </div>
                    </button>
        </div>
            </div>
              ))
            )}
            </div>
        </>
      )}

      {/* Create Vault Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `${theme.colors.black}99`,
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <form onSubmit={handleCreate} style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: 600,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowCreate(false)} style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: theme.colors.black,
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.colors.text.secondary,
              transition: 'all 0.2s'
            }}>
              <FiX size={14} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                boxShadow: `0 8px 24px ${theme.colors.shadow.medium}`
              }}>
                <FiPlus size={24} color="white" />
              </div>
                             <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text.primary }}>Create New Vault</h2>
               <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Set up a new group vault for collaborative savings</p>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* First Row - Name and Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Vault Name *</label>
                <input 
                  type="text" 
                    placeholder="Enter vault name" 
                    value={newVault.name} 
                    onChange={e => setNewVault(v => ({ ...v, name: e.target.value }))} 
                  required 
                  style={{
                    width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.border.primary}
                />
              </div>
              <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Type *</label>
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        outline: 'none',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                      onBlur={(e) => e.target.style.borderColor = theme.colors.border.primary}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {(() => {
                          const selectedOption = vaultTypeOptions.find(opt => opt.value === newVault.vaultType);
                          const IconComponent = selectedOption?.icon || FiDollarSign;
                          return (
                            <>
                              <IconComponent size={16} color={theme.colors.primary} />
                              <span>{selectedOption?.label || 'Select Type'}</span>
                            </>
                          );
                        })()}
                      </div>
                      <FiChevronDown size={16} color={theme.colors.text.secondary} />
                    </button>
                    
                    {showTypeDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        boxShadow: `0 4px 12px ${theme.colors.shadow.medium}`,
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: '0.25rem'
                      }}>
                        {vaultTypeOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setNewVault(v => ({ ...v, vaultType: option.value }));
                                setShowTypeDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: newVault.vaultType === option.value ? theme.colors.primary : theme.colors.text.primary,
                                fontWeight: newVault.vaultType === option.value ? 600 : 400,
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = theme.colors.white;
                                e.target.style.color = theme.colors.primary;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = newVault.vaultType === option.value ? theme.colors.primary : theme.colors.text.primary;
                              }}
                            >
                              <IconComponent size={16} color={newVault.vaultType === option.value ? theme.colors.primary : theme.colors.text.secondary} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
              </div>
            </div>
            
              {/* Second Row - Currency and Target */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Currency *</label>
                  <input 
                    type="text" 
                    placeholder="KES" 
                    value={newVault.currency} 
                    onChange={e => setNewVault(v => ({ ...v, currency: e.target.value }))} 
                    required 
                style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                  transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.border.primary}
                  />
            </div>
              <div>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Target Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newVault.targetAmount} 
                    onChange={e => setNewVault(v => ({ ...v, targetAmount: e.target.value }))} 
                  style={{
                    width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.border.primary}
                  />
              </div>
            </div>
            
              {/* Third Row - Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600, color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Description</label>
                <textarea 
                  placeholder="Describe the purpose of this vault" 
                  value={newVault.description} 
                  onChange={e => setNewVault(v => ({ ...v, description: e.target.value }))} 
                style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 60,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.colors.border.primary}
                />
            </div>
              
              {/* Fourth Row - Public Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: theme.colors.white,
                borderRadius: '0.5rem',
                border: `1px solid ${theme.colors.border.primary}`
              }}>
                <input 
                  type="checkbox" 
                  checked={newVault.isPublic} 
                  onChange={e => setNewVault(v => ({ ...v, isPublic: e.target.checked }))}
                  style={{ width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: theme.colors.primary, fontSize: '0.8rem' }}>Public Vault</div>
                  <div style={{ fontSize: '0.7rem', color: theme.colors.text.secondary, marginTop: '0.125rem' }}>
                    Allow others to discover and join this vault
              </div>
            </div>
                </div>
              </div>
              
            {error && (
              <div style={{
                background: theme.colors.white,
                color: theme.colors.error,
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.colors.error}`,
                fontSize: '0.8rem',
                marginTop: '1rem'
              }}>
                {error}
                </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: theme.colors.text.secondary,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: submitting ? theme.colors.text.secondary : theme.colors.primary,
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
              >
                {submitting ? 'Creating...' : 'Create Vault'}
                  </button>
                </div>
          </form>
          </div>
      )}
    </div>
  );
}
    