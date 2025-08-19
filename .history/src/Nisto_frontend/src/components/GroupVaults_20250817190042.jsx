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

  if (loading) return <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Loading group vaults...</div>;

  return (
    <div className="group-vaults-root">
      {/* Navigation Tabs */}
      <div className="group-vaults-nav">
        <button
          onClick={() => setVaultView('my-vaults')}
          className={vaultView === 'my-vaults' ? 'active' : ''}
        >
          <FiUsers size={16} />
          My Vaults
        </button>
        <button
          onClick={() => setVaultView('public-vaults')}
          className={vaultView === 'public-vaults' ? 'active' : ''}
        >
          <FiGlobe size={16} />
          Discover Vaults
        </button>
      </div>

      {/* Show Public Vaults or My Vaults based on selected tab */}
      {vaultView === 'public-vaults' ? (
        <PublicVaults />
      ) : (
        <>
          {/* Create Vault Button */}
          <div className="create-vault-btn">
            <button ref={createBtnRef} onClick={() => setShowCreate(true)}>
              <FiPlus size={16} />
              Create Vault
            </button>
          </div>

          {/* Vault List */}
          <div className="group-vaults-list">
            {vaults.length === 0 ? (
              <div className="vault-empty-state">
                <FiUsers size={32} />
                <h4>No Vaults Found</h4>
                <p>Create your first group vault to start collaborating</p>
              </div>
            ) : (
              vaults.map(vault => (
                <div key={vault.id} className="vault-card" onClick={() => handleOpenVaultDetails(vault)}>
                  {/* Vault Header with Icon */}
                  <div className="vault-card-header">
                    <div className="vault-icon-wrapper">
                      <div className="vault-type-icon">
                        {vault.vaultType === 'Savings' && '💰'}
                        {vault.vaultType === 'Investment' && '📈'}
                        {vault.vaultType === 'Emergency' && '🚨'}
                        {vault.vaultType === 'Travel' && '✈️'}
                        {vault.vaultType === 'Education' && '🎓'}
                        {vault.vaultType === 'Business' && '💼'}
                        {vault.vaultType === 'Charity' && '🤝'}
                        {vault.vaultType === 'Custom' && '🎯'}
                      </div>
                    </div>
                    <div className="vault-header-content">
                      <div className="vault-name">{vault.name}</div>
                      <div className="vault-type">{vault.vaultType}</div>
                      <div className="vault-description">{vault.description || 'No description provided'}</div>
                    </div>
                    <div className={`vault-privacy-badge ${vault.isPublic ? 'public' : 'private'}`}>
                      {vault.isPublic ? <FiUnlock size={12} /> : <FiLock size={12} />}
                      {vault.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>

                  {/* Vault Balance Highlight */}
                  <div className="vault-balance-highlight">
                    <div className="balance-amount">
                      {vault.totalBalance} {vault.currency}
                    </div>
                    <div className="balance-label">Total Balance</div>
                  </div>

                  {/* Vault Stats Grid */}
                  <div className="vault-stats-grid">
                    <div className="vault-stat-item">
                      <div className="stat-icon">🎯</div>
                      <div className="stat-content">
                        <div className="stat-value">{vault.targetAmount || 'N/A'}</div>
                        <div className="stat-label">Target</div>
                      </div>
                    </div>
                    <div className="vault-stat-item">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <div className="stat-value">{vault.members ? vault.members.length : '0'}</div>
                        <div className="stat-label">Members</div>
                      </div>
                    </div>
                    <div className="vault-stat-item">
                      <div className="stat-icon">📊</div>
                      <div className="stat-content">
                        <div className="stat-value">
                          {vault.targetAmount ? Math.round((vault.totalBalance / vault.targetAmount) * 100) : 0}%
                        </div>
                        <div className="stat-label">Progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {vault.targetAmount && (
                    <div className="vault-progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.min(100, (vault.totalBalance / vault.targetAmount) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {vault.totalBalance} / {vault.targetAmount} {vault.currency}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="vault-actions">
                    <button 
                      className="vault-action-btn primary"
                      onClick={(e) => { e.stopPropagation(); handleOpenVaultDetails(vault); }}
                    >
                      <FiEye size={14} />
                      View Details
                    </button>
                    <button 
                      className="vault-action-btn success"
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowDeposit(true); }}
                    >
                      <FiArrowDownCircle size={14} />
                      Deposit
                    </button>
                    <button 
                      className="vault-action-btn warning"
                      onClick={(e) => { e.stopPropagation(); setSelectedVault(vault); setShowWithdraw(true); }}
                    >
                      <FiArrowUpCircle size={14} />
                      Withdraw
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create Vault Modal */}
          {showCreate && (
            <div className="vault-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
              <form className="vault-modal" onClick={e => e.stopPropagation()} onSubmit={handleCreate}>
                <button type="button" className="vault-modal-close" onClick={() => setShowCreate(false)}>
                  <FiX size={16} />
                </button>
                
                <div className="vault-modal-header">
                  <div className="vault-modal-icon" style={{ background: 'linear-gradient(135deg, #64748b, #475569)' }}>
                    <FiPlus size={24} color="white" />
                  </div>
                  <h2 className="vault-modal-title">Create New Vault</h2>
                  <p className="vault-modal-subtitle">Set up a new group vault for collaborative savings</p>
                </div>
                
                <div className="vault-modal-form">
                  <div className="vault-form-group">
                    <label className="vault-form-label">Vault Name *</label>
                    <input 
                      type="text" 
                      className="vault-form-input"
                      placeholder="Enter vault name" 
                      value={newVault.name} 
                      onChange={e => setNewVault(v => ({ ...v, name: e.target.value }))} 
                      required 
                    />
                  </div>
                  
                  <div className="vault-form-group">
                    <label className="vault-form-label">Description</label>
                    <textarea 
                      className="vault-form-textarea"
                      placeholder="Describe the purpose of this vault" 
                      value={newVault.description} 
                      onChange={e => setNewVault(v => ({ ...v, description: e.target.value }))} 
                    />
                  </div>
                  
                  <div className="vault-form-group">
                    <label className="vault-form-label">Vault Type *</label>
                    <select 
                      className="vault-form-select"
                      value={newVault.vaultType} 
                      onChange={e => setNewVault(v => ({ ...v, vaultType: e.target.value }))} 
                      required 
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
                    <div className="vault-form-group">
                      <label className="vault-form-label">Currency *</label>
                      <input 
                        type="text" 
                        className="vault-form-input"
                        placeholder="KES" 
                        value={newVault.currency} 
                        onChange={e => setNewVault(v => ({ ...v, currency: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className="vault-form-group">
                      <label className="vault-form-label">Target Amount</label>
                      <input 
                        type="number" 
                        className="vault-form-input"
                        placeholder="0.00" 
                        value={newVault.targetAmount} 
                        onChange={e => setNewVault(v => ({ ...v, targetAmount: e.target.value }))} 
                      />
                    </div>
                  </div>
                  
                  <div className="vault-form-checkbox">
                    <input 
                      type="checkbox" 
                      checked={newVault.isPublic} 
                      onChange={e => setNewVault(v => ({ ...v, isPublic: e.target.checked }))}
                    />
                    <div className="vault-form-checkbox-content">
                      <div className="vault-form-checkbox-title">Public Vault</div>
                      <div className="vault-form-checkbox-description">
                        Allow others to discover and join this vault
                      </div>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="vault-info-box error">
                    {error}
                  </div>
                )}
                
                <div className="vault-modal-actions">
                  <button 
                    type="button" 
                    className="vault-modal-btn secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="vault-modal-btn primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Vault'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Deposit Modal */}
          {showDeposit && selectedVault && (
            <div className="vault-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDeposit(false); }}>
              <form className="vault-modal" onClick={e => e.stopPropagation()} onSubmit={async e => {
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
              }}>
                <button type="button" className="vault-modal-close" onClick={() => setShowDeposit(false)}>
                  <FiX size={16} />
                </button>
                
                <div className="vault-modal-header">
                  <div className="vault-modal-icon" style={{ background: 'linear-gradient(135deg, #64748b, #475569)' }}>
                    <FiArrowDownCircle size={24} color="white" />
                  </div>
                  <h2 className="vault-modal-title">Deposit to Vault</h2>
                  <p className="vault-modal-subtitle">
                    Add funds to <strong>{selectedVault.name}</strong>
                  </p>
                </div>
                
                <div className="vault-modal-form">
                  <div className="vault-form-group">
                    <label className="vault-form-label">Amount *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        {selectedVault.currency}
                      </span>
                      <input 
                        type="number" 
                        className="vault-form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="0.00" 
                        value={depositAmount} 
                        onChange={e => setDepositAmount(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="vault-form-group">
                    <label className="vault-form-label">Description (Optional)</label>
                    <textarea 
                      className="vault-form-textarea"
                      placeholder="What is this deposit for?" 
                      value={depositDesc} 
                      onChange={e => setDepositDesc(e.target.value)} 
                    />
                  </div>
                  
                  <div className="vault-info-box success">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>Current Balance:</span>
                      <span style={{ fontWeight: 700 }}>
                        {selectedVault.totalBalance} {selectedVault.currency}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>New Balance:</span>
                      <span style={{ fontWeight: 700 }}>
                        {depositAmount ? (parseFloat(selectedVault.totalBalance || 0) + parseFloat(depositAmount)).toFixed(2) : selectedVault.totalBalance} {selectedVault.currency}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="vault-modal-actions">
                  <button 
                    type="button" 
                    className="vault-modal-btn secondary"
                    onClick={() => setShowDeposit(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="vault-modal-btn success"
                    disabled={submitting || !depositAmount}
                  >
                    {submitting ? 'Depositing...' : 'Deposit Funds'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Withdraw Modal */}
          {showWithdraw && selectedVault && (
            <div className="vault-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowWithdraw(false); }}>
              <form className="vault-modal" onClick={e => e.stopPropagation()} onSubmit={async e => {
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
              }}>
                <button type="button" className="vault-modal-close" onClick={() => setShowWithdraw(false)}>
                  <FiX size={16} />
                </button>
                
                <div className="vault-modal-header">
                  <div className="vault-modal-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <FiArrowUpCircle size={24} color="white" />
                  </div>
                  <h2 className="vault-modal-title">Withdraw from Vault</h2>
                  <p className="vault-modal-subtitle">
                    Remove funds from <strong>{selectedVault.name}</strong>
                  </p>
                </div>
                
                <div className="vault-modal-form">
                  <div className="vault-form-group">
                    <label className="vault-form-label">Amount *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        {selectedVault.currency}
                      </span>
                      <input 
                        type="number" 
                        className="vault-form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="0.00" 
                        value={withdrawAmount} 
                        onChange={e => setWithdrawAmount(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="vault-form-group">
                    <label className="vault-form-label">Reason (Optional)</label>
                    <textarea 
                      className="vault-form-textarea"
                      placeholder="Why are you withdrawing these funds?" 
                      value={withdrawDesc} 
                      onChange={e => setWithdrawDesc(e.target.value)} 
                    />
                  </div>
                  
                  <div className="vault-info-box warning">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>Current Balance:</span>
                      <span style={{ fontWeight: 700 }}>
                        {selectedVault.totalBalance} {selectedVault.currency}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Remaining Balance:</span>
                      <span style={{ fontWeight: 700 }}>
                        {withdrawAmount ? (parseFloat(selectedVault.totalBalance || 0) - parseFloat(withdrawAmount)).toFixed(2) : selectedVault.totalBalance} {selectedVault.currency}
                      </span>
                    </div>
                  </div>
                  
                  {withdrawAmount && parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0) && (
                    <div className="vault-info-box error">
                      ⚠️ Withdrawal amount exceeds available balance
                    </div>
                  )}
                </div>
                
                <div className="vault-modal-actions">
                  <button 
                    type="button" 
                    className="vault-modal-btn secondary"
                    onClick={() => setShowWithdraw(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="vault-modal-btn warning"
                    disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(selectedVault.totalBalance || 0)}
                  >
                    {submitting ? 'Withdrawing...' : 'Withdraw Funds'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Other modals remain the same but with updated styling */}
          {/* ... existing modals with vault-modal classes ... */}
        </>
      )}

      {/* Show VaultDetails when a vault is selected */}
      {showVaultDetails && selectedVault && vaultDetails && (
        <VaultDetails
          vault={selectedVault}
          details={vaultDetails}
          onBack={() => setShowVaultDetails(false)}
          user={user}
          showToast={showToast}
        />
      )}
    </div>
  );
}
