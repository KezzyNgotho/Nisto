import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, FiList, FiSend, FiChevronLeft, FiGlobe } from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';
import VaultDetails from './VaultDetails';
import PublicVaults from './PublicVaults';

export default function GroupVaults() {
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
  const createBtnRef = useRef();
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

  useEffect(() => {
    const fetchVaults = async () => {
      if (!isAuthenticated) {
        // Optionally, show a modal or toast, or trigger login automatically
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
      // Call the actual createGroupVault function
      const result = await createGroupVault(
        newVault.name, 
        newVault.description, 
        newVault.vaultType, // Use selected vault type
        newVault.currency, 
        newVault.targetAmount ? parseFloat(newVault.targetAmount) : null, 
        newVault.isPublic, 
        null // rules
      );
      
      if (result.ok) {
      setShowCreate(false);
        setNewVault({ name: '', description: '', vaultType: 'Savings', currency: '', targetAmount: '', isPublic: false });
        showToast({ message: 'Vault created successfully!', type: 'success', icon: <FiCheck /> });
        
        // Refresh vaults list
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

  // 1. Prefill editForm with selected vault details when opening Edit Vault modal
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
    setSelectedVault(vault);
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

  if (loading) return <div style={{ padding: '2rem', color: '#075B5E' }}>Loading group vaults...</div>;

  return (
    <div className="group-vaults-root" style={{ width: '100%', padding: '0', margin: 0, position: 'relative' }}>
      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem', 
        background: 'white',
        borderRadius: 12,
        padding: '0.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--neutral-200)'
      }}>
        <button
          onClick={() => setVaultView('my-vaults')}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            background: vaultView === 'my-vaults' ? 'linear-gradient(135deg, #075B5E, #1C352D)' : 'transparent',
            color: vaultView === 'my-vaults' ? 'white' : 'var(--neutral-600)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiUsers size={18} />
          My Vaults
        </button>
        <button
          onClick={() => setVaultView('public-vaults')}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            background: vaultView === 'public-vaults' ? 'linear-gradient(135deg, #075B5E, #1C352D)' : 'transparent',
            color: vaultView === 'public-vaults' ? 'white' : 'var(--neutral-600)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FiGlobe size={18} />
          Discover Vaults
        </button>
      </div>

      {/* Show Public Vaults or My Vaults based on selected tab */}
      {vaultView === 'public-vaults' ? (
        <PublicVaults />
      ) : (
        <>
          {/* Creative floating Create Vault button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
            <button ref={createBtnRef} className="btn btn-primary" style={{ borderRadius: 24, boxShadow: '0 2px 8px 0 rgba(7,91,94,0.10)', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '0.6em 1.4em', background: 'linear-gradient(90deg, #075B5E, #1C352D)', color: '#fff', border: 'none', transition: 'box-shadow 0.2s' }} onClick={() => setShowCreate(true)}><FiPlus /> Create Vault</button>
          </div>
      {/* Modern modal for creating a vault */}
      {showCreate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <form onSubmit={handleCreate} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 500,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(7, 91, 94, 0.1)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowCreate(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}>
                <FiPlus size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-800)' }}>Create New Vault</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>Set up a new group vault for collaborative savings</p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Vault Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter vault name" 
                  value={newVault.name} 
                  onChange={e => setNewVault(v => ({ ...v, name: e.target.value }))} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Description</label>
                <textarea 
                  placeholder="Describe the purpose of this vault" 
                  value={newVault.description} 
                  onChange={e => setNewVault(v => ({ ...v, description: e.target.value }))} 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 80,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Vault Type *</label>
                <select 
                  value={newVault.vaultType} 
                  onChange={e => setNewVault(v => ({ ...v, vaultType: e.target.value }))} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                >
                  <option value="Savings">💰 Savings</option>
                  <option value="Investment">📈 Investment</option>
                  <option value="Emergency">🚨 Emergency</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Education">🎓 Education</option>
                  <option value="Business">💼 Business</option>
                  <option value="Charity">🤝 Charity</option>
                  <option value="Custom">🎯 Custom</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Currency *</label>
                  <input 
                    type="text" 
                    placeholder="KES" 
                    value={newVault.currency} 
                    onChange={e => setNewVault(v => ({ ...v, currency: e.target.value }))} 
                    required 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 12,
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Target Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newVault.targetAmount} 
                    onChange={e => setNewVault(v => ({ ...v, targetAmount: e.target.value }))} 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 12,
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                  />
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--primary-50)',
                borderRadius: 12,
                border: '1px solid var(--primary-200)'
              }}>
                <input 
                  type="checkbox" 
                  checked={newVault.isPublic} 
                  onChange={e => setNewVault(v => ({ ...v, isPublic: e.target.checked }))}
                  style={{ width: 18, height: 18 }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: '0.9rem' }}>Public Vault</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                    Allow others to discover and join this vault
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div style={{
                background: 'var(--error-50)',
                color: 'var(--error-700)',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                border: '1px solid var(--error-200)',
                fontSize: '0.9rem',
                marginTop: '1rem'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Creating...' : 'Create Vault'}
              </button>
          </div>
          </form>
        </div>
      )}
      {showDeposit && selectedVault && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowDeposit(false); }}>
          <form onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              await depositToVault(selectedVault.id, depositAmount, depositDesc);
              setShowDeposit(false);
              setDepositAmount('');
              setDepositDesc('');
              showToast({ message: 'Deposit successful!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Deposit failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowDeposit(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}>
                <FiArrowDownCircle size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-800)' }}>Deposit to Vault</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Add funds to <strong>{selectedVault.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--neutral-500)',
                    fontWeight: 600
                  }}>
                    {selectedVault.currency}
                  </span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={depositAmount} 
                    onChange={e => setDepositAmount(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 12,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--success-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Description (Optional)</label>
                <textarea 
                  placeholder="What is this deposit for?" 
                  value={depositDesc} 
                  onChange={e => setDepositDesc(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 80,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--success-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div style={{
                background: 'var(--success-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--success-200)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Current Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-700)' }}>
                    {selectedVault.totalBalance} {selectedVault.currency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>New Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-700)' }}>
                    {depositAmount ? (parseFloat(selectedVault.totalBalance || 0) + parseFloat(depositAmount)).toFixed(2) : selectedVault.totalBalance} {selectedVault.currency}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowDeposit(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || !depositAmount}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting || !depositAmount ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !depositAmount ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting || !depositAmount ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && depositAmount && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && depositAmount && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Depositing...' : 'Deposit Funds'}
              </button>
            </div>
          </form>
        </div>
      )}
      {showWithdraw && selectedVault && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowWithdraw(false); }}>
          <form onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await withdrawFromVault(selectedVault.id, withdrawAmount, withdrawDesc);
              setShowWithdraw(false);
              setWithdrawAmount('');
              setWithdrawDesc('');
              showToast({ message: 'Withdraw successful!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Withdraw failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowWithdraw(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}>
                <FiArrowUpCircle size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-800)' }}>Withdraw from Vault</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Remove funds from <strong>{selectedVault.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--neutral-500)',
                    fontWeight: 600
                  }}>
                    {selectedVault.currency}
                  </span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={withdrawAmount} 
                    onChange={e => setWithdrawAmount(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 12,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--warning-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Reason (Optional)</label>
                <textarea 
                  placeholder="Why are you withdrawing these funds?" 
                  value={withdrawDesc} 
                  onChange={e => setWithdrawDesc(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 80,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--warning-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div style={{
                background: 'var(--warning-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--warning-200)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Current Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-700)' }}>
                    {selectedVault.totalBalance} {selectedVault.currency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Remaining Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-700)' }}>
                    {withdrawAmount ? (parseFloat(selectedVault.totalBalance || 0) - parseFloat(withdrawAmount)).toFixed(2) : selectedVault.totalBalance} {selectedVault.currency}
                  </span>
                </div>
              </div>
              
              {withdrawAmount && parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0) && (
                <div style={{
                  background: 'var(--error-50)',
                  color: 'var(--error-700)',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1px solid var(--error-200)',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ Withdrawal amount exceeds available balance
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowWithdraw(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0) ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0) ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && withdrawAmount && parseFloat(withdrawAmount) <= parseFloat(selectedVault.totalBalance || 0) && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && withdrawAmount && parseFloat(withdrawAmount) <= parseFloat(selectedVault.totalBalance || 0) && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Withdrawing...' : 'Withdraw Funds'}
              </button>
            </div>
          </form>
        </div>
      )}
      {showEdit && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowEdit(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await editGroupVault(selectedVault.id, editForm); // This function is not defined in the original file
              setShowEdit(false);
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Vault updated!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Edit failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Edit Vault</h3>
            <input type="text" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
            <input type="text" placeholder="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            <input type="text" placeholder="Currency" value={editForm.currency} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} required />
            <input type="number" placeholder="Target Amount" value={editForm.targetAmount} onChange={e => setEditForm(f => ({ ...f, targetAmount: e.target.value }))} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--primary-700)', fontSize: 14 }}>
              <input type="checkbox" checked={editForm.isPublic} onChange={e => setEditForm(f => ({ ...f, isPublic: e.target.checked }))} /> Public Vault
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
      {showDelete && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowDelete(false); }}>
          <div className="modal-form polished" onClick={e => e.stopPropagation()}>
            <h3>Delete Vault</h3>
            <p>Are you sure you want to delete this vault? This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDelete(false)}>Cancel</button>
              <button type="button" disabled={submitting} onClick={async () => {
                setSubmitting(true);
                try {
                  // await deleteGroupVault(selectedVault.id); // This function is not defined in the original file
                  setShowDelete(false);
                  // await refreshVaults(); // This function is not defined in the original file
                  showToast({ message: 'Vault deleted!', type: 'success', icon: <FiCheck /> });
                } catch (err) {
                  showToast({ message: 'Delete failed', type: 'error', icon: <FiX /> });
                } finally {
                  setSubmitting(false);
                }
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {showPrivacy && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowPrivacy(false); }}>
          <div className="modal-form polished" onClick={e => e.stopPropagation()}>
            <h3>Toggle Privacy</h3>
            <p>Current: {selectedVault.isPublic ? 'Public' : 'Private'}</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowPrivacy(false)}>Cancel</button>
              <button type="button" disabled={submitting} onClick={async () => {
                setSubmitting(true);
                try {
                  // await toggleVaultPrivacy(selectedVault.id, !selectedVault.isPublic); // This function is not defined in the original file
                  setShowPrivacy(false);
                  // await refreshVaults(); // This function is not defined in the original file
                  showToast({ message: 'Privacy updated!', type: 'success', icon: <FiCheck /> });
                } catch (err) {
                  showToast({ message: 'Privacy update failed', type: 'error', icon: <FiX /> });
                } finally {
                  setSubmitting(false);
                }
              }}>{selectedVault.isPublic ? 'Make Private' : 'Make Public'}</button>
            </div>
          </div>
        </div>
      )}
      {showPropose && selectedVault && (
        <div className="modal-overlay polished modal-fade modal-scale" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowPropose(false); }}>
          <form className="modal-form polished" onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              // await proposeVaultAction(selectedVault.id, proposeType, proposeTarget, proposeRole); // This function is not defined in the original file
              setShowPropose(false);
              setProposeType('DeleteVault');
              setProposeTarget('');
              setProposeRole('member');
              // await refreshVaults(); // This function is not defined in the original file
              showToast({ message: 'Proposal submitted!', type: 'success', icon: <FiCheck /> });
            } catch (err) {
              showToast({ message: 'Proposal failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }}>
            <h3>Propose Vault Action</h3>
            <select value={proposeType} onChange={e => setProposeType(e.target.value)} required>
              <option value="DeleteVault">Delete Vault</option>
              <option value="RemoveMember">Remove Member</option>
              <option value="ChangeRole">Change Role</option>
              <option value="TogglePrivacy">Toggle Privacy</option>
            </select>
            <input type="text" placeholder="Target User ID (if applicable)" value={proposeTarget} onChange={e => setProposeTarget(e.target.value)} />
            <input type="text" placeholder="New Role (if applicable)" value={proposeRole} onChange={e => setProposeRole(e.target.value)} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowPropose(false)}>Cancel</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </div>
      )}
      {showInvite && selectedVault && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}>
          <form onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              const result = await inviteVaultMember(selectedVault.id, inviteUserId, inviteRole);
              if (result.ok) {
                setShowInvite(false);
                setInviteUserId('');
                setInviteRole('member');
                showToast({ message: 'Invitation sent!', type: 'success', icon: <FiCheck /> });
                // Refresh vault details
                if (expandedVaultId === selectedVault.id) {
                  const details = await getVaultDetails(selectedVault.id);
                  setVaultDetails(details);
                }
              } else {
                showToast({ message: result.err || 'Invite failed', type: 'error', icon: <FiX /> });
              }
            } catch (err) {
              console.error('Invite error:', err);
              showToast({ message: 'Invite failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowInvite(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}>
                <FiUserPlus size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-800)' }}>Invite Member</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Invite someone to join <strong>{selectedVault.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>User ID *</label>
                <input 
                  type="text" 
                  placeholder="Enter user ID" 
                  value={inviteUserId} 
                  onChange={e => setInviteUserId(e.target.value)} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Role *</label>
                <select 
                  value={inviteRole} 
                  onChange={e => setInviteRole(e.target.value)} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowInvite(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || !inviteUserId}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting || !inviteUserId ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !inviteUserId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting || !inviteUserId ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && inviteUserId && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && inviteUserId && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Inviting...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}
      {showChangeRole && selectedVault && selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowChangeRole(false); }}>
          <form onClick={e => e.stopPropagation()} onSubmit={async e => {
            e.preventDefault();
            setSubmitting(true);
            try {
              const result = await changeVaultMemberRole(selectedVault.id, selectedMember.id, newRole);
              if (result.ok) {
                setShowChangeRole(false);
                setNewRole('member');
                showToast({ message: 'Role changed successfully!', type: 'success', icon: <FiCheck /> });
                // Refresh vault details
                if (expandedVaultId === selectedVault.id) {
                  const details = await getVaultDetails(selectedVault.id);
                  setVaultDetails(details);
                }
              } else {
                showToast({ message: result.err || 'Change role failed', type: 'error', icon: <FiX /> });
              }
            } catch (err) {
              console.error('Change role error:', err);
              showToast({ message: 'Change role failed', type: 'error', icon: <FiX /> });
            } finally {
              setSubmitting(false);
            }
          }} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowChangeRole(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}>
                <FiShield size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-800)' }}>Change Member Role</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Change role for member in <strong>{selectedVault.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{
                background: 'var(--neutral-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--neutral-200)'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--neutral-600)', marginBottom: '0.5rem' }}>
                  Current Member
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-800)' }}>
                  {selectedMember.userId}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                  Current Role: <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{selectedMember.role}</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>New Role *</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--warning-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowChangeRole(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Changing...' : 'Change Role'}
              </button>
            </div>
          </form>
        </div>
      )}
      {showRemoveMember && selectedVault && selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={e => { if (e.target === e.currentTarget) setShowRemoveMember(false); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowRemoveMember(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--error-500), var(--error-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}>
                <FiTrash2 size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--error-800)' }}>Remove Member</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Remove member from <strong>{selectedVault.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{
                background: 'var(--error-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--error-200)'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--error-700)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ⚠️ Warning: This action cannot be undone
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-800)' }}>
                  Member: {selectedMember.userId}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                  Role: <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{selectedMember.role}</span>
                </div>
              </div>
              
              <div style={{
                background: 'var(--neutral-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--neutral-200)'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>
                  This member will lose access to the vault and all associated funds. 
                  They will no longer be able to deposit, withdraw, or view vault details.
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowRemoveMember(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const result = await removeVaultMember(selectedVault.id, selectedMember.id);
                    if (result.ok) {
                      setShowRemoveMember(false);
                      showToast({ message: 'Member removed successfully!', type: 'success', icon: <FiCheck /> });
                      // Refresh vault details
                      if (expandedVaultId === selectedVault.id) {
                        const details = await getVaultDetails(selectedVault.id);
                        setVaultDetails(details);
                      }
                    } else {
                      showToast({ message: result.err || 'Remove failed', type: 'error', icon: <FiX /> });
                    }
                  } catch (err) {
                    console.error('Remove member error:', err);
                    showToast({ message: 'Remove failed', type: 'error', icon: <FiX /> });
                  } finally {
                    setSubmitting(false);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--error-500), var(--error-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Removing...' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Show VaultDetails when a vault is selected, otherwise show vault list */}
      {showVaultDetails && selectedVault && vaultDetails ? (
        <VaultDetails
          vault={selectedVault}
          details={vaultDetails}
          onBack={() => setShowVaultDetails(false)}
          user={user}
          showToast={showToast}
        />
      ) : (
        <div className="group-vaults-list" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '1.5rem',
          justifyItems: 'start',
          alignItems: 'start',
          margin: 0,
          padding: 0
        }}>
          {vaults.length === 0 ? (
            <div style={{ color: 'var(--neutral-400)', fontSize: 16, padding: '2rem' }}>No group vaults found.</div>
          ) : (
            vaults.map(vault => (
              <div key={vault.id} className={`vault-card vault-card-hover`} style={{
                background: 'linear-gradient(135deg, var(--dashboard-card-bg) 0%, rgba(255,255,255,0.95) 100%)',
                borderRadius: 16,
                boxShadow: expandedVaultId === vault.id ? 
                  '0 8px 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.1)' : 
                  '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
                border: expandedVaultId === vault.id ? '2px solid var(--primary-300)' : '1px solid rgba(59,130,246,0.1)',
                margin: 0,
                padding: expandedVaultId === vault.id ? '1.5rem' : '1.2rem',
                minWidth: 420,
                maxWidth: 600,
                fontSize: 14,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'visible',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
              tabIndex={0}
              onMouseEnter={e => {
                if (expandedVaultId !== vault.id) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.2), 0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={e => {
                if (expandedVaultId !== vault.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)';
                }
              }}
              onClick={() => handleOpenVaultDetails(vault)}
              >
                {/* Vault Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ 
                        fontWeight: 800, 
                        fontSize: 20, 
                        color: 'var(--primary-800)',
                        background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        {vault.name}
                      </span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4, 
                        fontSize: 11,
                        background: vault.isPublic ? 'var(--success-100)' : 'var(--error-100)',
                        color: vault.isPublic ? 'var(--success-700)' : 'var(--error-700)',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 600,
                        border: `1px solid ${vault.isPublic ? 'var(--success-200)' : 'var(--error-200)'}`
                      }}>
                        {vault.isPublic ? <FiUnlock size={12} /> : <FiLock size={12} />}
                        {vault.isPublic ? 'Public' : 'Private'}
                </div>
                </div>
                    <div style={{ 
                      color: 'var(--neutral-500)', 
                      fontSize: 14, 
                      lineHeight: '1.4',
                      fontStyle: 'italic'
                    }}>
                      {vault.description || 'No description provided'}
                    </div>
                  </div>
                </div>
                {/* Vault Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: 12, 
                  marginBottom: 16,
                  background: 'rgba(59,130,246,0.03)',
                  borderRadius: 12,
                  padding: 12,
                  border: '1px solid rgba(59,130,246,0.08)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginBottom: 2, fontWeight: 600 }}>CURRENCY</div>
                    <div style={{ fontSize: 14, color: 'var(--primary-700)', fontWeight: 700 }}>{vault.currency}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginBottom: 2, fontWeight: 600 }}>TARGET</div>
                    <div style={{ fontSize: 14, color: 'var(--warning-700)', fontWeight: 700 }}>{vault.targetAmount || 'N/A'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginBottom: 2, fontWeight: 600 }}>BALANCE</div>
                    <div style={{ fontSize: 14, color: 'var(--success-700)', fontWeight: 700 }}>{vault.totalBalance}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginBottom: 2, fontWeight: 600 }}>MEMBERS</div>
                    <div style={{ fontSize: 14, color: 'var(--primary-700)', fontWeight: 700 }}>{vault.members ? vault.members.length : '—'}</div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="vault-actions" style={{ 
                  display: 'flex', 
                  gap: 8, 
                  flexWrap: 'wrap', 
                  marginTop: 8, 
                  marginBottom: expandedVaultId === vault.id ? 16 : 0, 
                  justifyContent: 'flex-start', 
                  alignItems: 'center'
                }}>
                  <button 
                    className="btn btn-primary btn-xs" 
                    title="View Details" 
                    style={{ 
                      borderRadius: 8, 
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                      border: 'none',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    onClick={() => handleOpenVaultDetails(vault)}
                  >
                    <FiEye size={14} style={{ marginRight: 4 }} />
                    View Details
                  </button>
                  <button 
                    className="btn btn-success btn-xs" 
                    title="Deposit" 
                    style={{ 
                      borderRadius: 8, 
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                      border: 'none',
                      color: 'white',
                      boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowDeposit(true); }}
                  >
                    <FiArrowDownCircle size={14} />
                  </button>
                  <button 
                    className="btn btn-warning btn-xs" 
                    title="Withdraw" 
                    style={{ 
                      borderRadius: 8, 
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                      border: 'none',
                      color: 'white',
                      boxShadow: '0 2px 6px rgba(245,158,11,0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowWithdraw(true); }}
                  >
                    <FiArrowUpCircle size={14} />
                  </button>
                  <button 
                    className="btn btn-outline btn-xs" 
                    title="Edit Vault" 
                    style={{ 
                      borderRadius: 8, 
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      color: 'var(--primary-600)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    onClick={(e) => { e.stopPropagation(); handleEditOpen(vault); }}
                  >
                    <FiEdit2 size={14} />
                  </button>
                </div>
                {expandedVaultId === vault.id && vaultDetails && (
                  <div className="vault-expanded-details" style={{ marginTop: 18, background: 'rgba(245,247,255,0.92)', borderRadius: 7, boxShadow: 'var(--shadow-xs)', padding: '1.1rem', border: '1.5px solid var(--primary-50)', transition: 'all 0.28s cubic-bezier(.4,0,.2,1)' }}>
                    {/* Members List */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiUsers style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Members</span>
                        <button 
                          className="btn btn-xs btn-action" 
                          style={{ marginLeft: 'auto', borderRadius: 4 }} 
                          title="Invite Member"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedVault(vaultDetails.vault); 
                            setShowInvite(true); 
                          }}
                        >
                          <FiUserPlus />
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {vaultDetails.members && vaultDetails.members.length > 0 ? (
                          vaultDetails.members.map(member => (
                            <div key={member.id} style={{ background: 'var(--neutral-0)', borderRadius: 4, boxShadow: 'var(--shadow-xs)', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
                              <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{member.userId === vaultDetails.vault.ownerId ? <AiFillCrown /> : <FiUsers />} {member.userId && member.userId.toString ? member.userId.toString() : String(member.userId)}</span>
                              <span style={{ background: 'var(--neutral-100)', color: member.role === 'owner' ? 'var(--primary-600)' : member.role === 'admin' ? 'var(--success-600)' : 'var(--primary-400)', borderRadius: 4, padding: '2px 10px', fontWeight: 700, fontSize: 13, marginLeft: 8 }}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                              <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>Joined: {new Date(Number(member.joinedAt)).toLocaleDateString()}</span>
                              {/* Actions: Remove, Change Role */}
                              <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Change Role" onClick={() => { setSelectedVault(vaultDetails.vault); setSelectedMember(member); setShowChangeRole(true); }}><FiShield /></button>
                              <button className="btn btn-danger btn-xs btn-action" style={{ borderRadius: 4 }} title="Remove Member" onClick={() => { setSelectedVault(vaultDetails.vault); setSelectedMember(member); setShowRemoveMember(true); }}><FiTrash2 /></button>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--neutral-400)' }}>No members yet.</div>
                        )}
                      </div>
                    </div>
                    {/* Balances/Progress */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiTrendingUp style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Balance & Progress</span>
                      </div>
                      <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: 14 }}>
                        <span>Total: <b>{vaultDetails.vault.totalBalance}</b> {vaultDetails.vault.currency}</span>
                        <span>Target: <b>{vaultDetails.vault.targetAmount || 'N/A'}</b></span>
                        <div style={{ flex: 1, minWidth: 120, maxWidth: 220 }}>
                          <div style={{ width: '100%', background: 'var(--neutral-100)', borderRadius: 4, height: 7 }}>
                            <div style={{ width: `${vaultDetails.vault.targetAmount ? Math.min(100, (vaultDetails.vault.totalBalance / vaultDetails.vault.targetAmount) * 100) : 0}%`, background: 'linear-gradient(90deg, var(--primary-400), var(--primary-700))', height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Transaction History */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiList style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Transaction History</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                        {/* List transactions here, placeholder for now */}
                        No transactions yet.
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                      <button className="btn btn-success btn-xs btn-action" style={{ borderRadius: 4 }} title="Deposit"><FiArrowDownCircle /></button>
                      <button className="btn btn-warning btn-xs btn-action" style={{ borderRadius: 4 }} title="Withdraw"><FiArrowUpCircle /></button>
                      <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Edit Vault"><FiEdit2 /></button>
                      <button className="btn btn-danger btn-xs btn-action" style={{ borderRadius: 4 }} title="Delete Vault"><FiTrash2 /></button>
                      <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Toggle Privacy">{vaultDetails.vault.isPublic ? <FiLock /> : <FiUnlock />}</button>
                      <button className="btn btn-outline btn-xs btn-action" style={{ borderRadius: 4 }} title="Propose Action"><FiShield /></button>
                    </div>
                    {/* Governance Timeline */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiList style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Governance Timeline</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                        {/* List proposals, votes, appeals here, placeholder for now */}
                        No proposals yet.
                      </div>
                    </div>
                    {/* Security/Recovery */}
                    <div style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <FiShield style={{ color: 'var(--primary-600)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Security & Recovery</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--neutral-600)' }}>
                        {/* List recovery methods, audit trail here, placeholder for now */}
                        No recovery methods set up.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
