import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUsers, 
  FiShield, 
  FiLock, 
  FiUnlock, 
  FiPlus, 
  FiSettings, 
  FiTrendingUp, 
  FiDollarSign, 
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiUserPlus,
  FiUserMinus,
  FiShare2
} from 'react-icons/fi';

const GroupVaults = () => {
  const auth = useAuth();
  const [vaults, setVaults] = useState([]);
  const [selectedVault, setSelectedVault] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form states
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [vaultType, setVaultType] = useState('savings'); // savings, investment, emergency
  const [maxMembers, setMaxMembers] = useState(10);
  const [joinCode, setJoinCode] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  // Mock data for demonstration
  const mockVaults = [
    {
      id: 1,
      name: 'Family Emergency Fund',
      description: 'Emergency savings for the family',
      type: 'emergency',
      balance: 2500.00,
      members: 4,
      maxMembers: 6,
      isPublic: false,
      monthlyGoal: 500,
      createdAt: '2024-01-15',
      owner: auth?.principal || 'user1',
      members: [
        { id: 1, name: 'John Doe', contribution: 800, role: 'owner' },
        { id: 2, name: 'Jane Smith', contribution: 600, role: 'member' },
        { id: 3, name: 'Bob Johnson', contribution: 550, role: 'member' },
        { id: 4, name: 'Alice Brown', contribution: 550, role: 'member' }
      ]
    },
    {
      id: 2,
      name: 'Investment Pool',
      description: 'Group investment in DeFi protocols',
      type: 'investment',
      balance: 15000.00,
      members: 8,
      maxMembers: 12,
      isPublic: true,
      monthlyGoal: 2000,
      createdAt: '2024-02-01',
      owner: 'user2',
      members: [
        { id: 1, name: 'John Doe', contribution: 2000, role: 'member' },
        { id: 2, name: 'Jane Smith', contribution: 1800, role: 'member' },
        { id: 3, name: 'Bob Johnson', contribution: 2200, role: 'member' },
        { id: 4, name: 'Alice Brown', contribution: 1600, role: 'member' },
        { id: 5, name: 'Charlie Wilson', contribution: 1900, role: 'member' },
        { id: 6, name: 'Diana Davis', contribution: 2100, role: 'member' },
        { id: 7, name: 'Eve Miller', contribution: 1700, role: 'member' },
        { id: 8, name: 'Frank Garcia', contribution: 1700, role: 'member' }
      ]
    }
  ];

  // Load vaults data
  const loadVaults = useCallback(async () => {
    if (!auth?.principal || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Mock API call - replace with actual backend call
      // const userVaults = await auth.backendService.getUserVaults(auth.principal);
      
      setVaults(mockVaults);
    } catch (error) {
      console.error('Error loading vaults:', error);
      setError('Failed to load vaults');
    } finally {
      setLoading(false);
    }
  }, [auth?.principal, auth?.backendService]);

  // Create new vault
  const handleCreateVault = async () => {
    if (!vaultName || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Mock API call - replace with actual backend call
      // const result = await auth.backendService.createVault({
      //   name: vaultName,
      //   description: vaultDescription,
      //   type: vaultType,
      //   maxMembers,
      //   owner: auth.principal
      // });
      
      setMessage('Vault created successfully!');
      setVaultName('');
      setVaultDescription('');
      setVaultType('savings');
      setMaxMembers(10);
      setShowCreateModal(false);
      setTimeout(() => loadVaults(), 1000);
    } catch (error) {
      console.error('Vault creation error:', error);
      setError('Failed to create vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join vault
  const handleJoinVault = async () => {
    if (!joinCode || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Mock API call - replace with actual backend call
      // const result = await auth.backendService.joinVault(joinCode, auth.principal);
      
      setMessage('Successfully joined vault!');
      setJoinCode('');
      setShowJoinModal(false);
      setTimeout(() => loadVaults(), 1000);
    } catch (error) {
      console.error('Join vault error:', error);
      setError('Failed to join vault. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Contribute to vault
  const handleContribute = async (vaultId) => {
    if (!contributionAmount || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Mock API call - replace with actual backend call
      // const result = await auth.backendService.contributeToVault(
      //   vaultId, 
      //   BigInt(Math.floor(Number(contributionAmount) * 100000000)),
      //   auth.principal
      // );
      
      setMessage(`Successfully contributed ${contributionAmount} NST!`);
      setContributionAmount('');
      setTimeout(() => loadVaults(), 1000);
    } catch (error) {
      console.error('Contribution error:', error);
      setError('Failed to contribute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  // Calculate vault statistics
  const calculateVaultStats = (vault) => {
    const totalContributions = vault.members.reduce((sum, member) => sum + member.contribution, 0);
    const averageContribution = totalContributions / vault.members.length;
    const progress = (vault.balance / vault.monthlyGoal) * 100;
    
    return { totalContributions, averageContribution, progress };
  };

  return (
    <div className="token-form" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <h3>
        <FiShield style={{ color: '#2563eb' }} />
        <span>Group Vaults</span>
      </h3>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          color: '#991b1b',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          border: '1px solid #fecaca'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#ecfdf5',
          borderLeft: '4px solid #10b981',
          color: '#065f46',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCheckCircle />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem', 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FiUsers />
            <span>Vault Actions</span>
          </h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <FiPlus size={16} />
              <span>Create Vault</span>
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <FiUserPlus size={16} />
              <span>Join Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vaults List */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem', 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FiShield />
            <span>Your Vaults</span>
          </h4>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {vaults.map((vault) => {
              const stats = calculateVaultStats(vault);
              return (
                <div key={vault.id} style={{ 
                  backgroundColor: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedVault(vault)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                        {vault.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {vault.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiUsers size={12} />
                          {vault.members.length}/{vault.maxMembers} members
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {vault.isPublic ? <FiUnlock size={12} /> : <FiLock size={12} />}
                          {vault.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.625rem',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          backgroundColor: 
                            vault.type === 'emergency' ? '#fef3c7' : 
                            vault.type === 'investment' ? '#dbeafe' : '#dcfce7',
                          color: 
                            vault.type === 'emergency' ? '#92400e' : 
                            vault.type === 'investment' ? '#1e40af' : '#166534'
                        }}>
                          {vault.type}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                        ${vault.balance.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Monthly Goal: ${vault.monthlyGoal}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      <span>Progress</span>
                      <span>{Math.min(stats.progress, 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '0.5rem', 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '0.25rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${Math.min(stats.progress, 100)}%`, 
                        height: '100%', 
                        backgroundColor: '#10b981',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Avg Contribution</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                        ${stats.averageContribution.toFixed(0)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Members</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                        {vault.members.length}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Created</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                        {new Date(vault.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Create New Vault</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Vault Name
              </label>
              <input
                type="text"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                placeholder="Enter vault name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Description
              </label>
              <textarea
                value={vaultDescription}
                onChange={(e) => setVaultDescription(e.target.value)}
                placeholder="Describe your vault's purpose"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Vault Type
              </label>
              <select
                value={vaultType}
                onChange={(e) => setVaultType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                <option value="savings">Savings</option>
                <option value="emergency">Emergency Fund</option>
                <option value="investment">Investment Pool</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Maximum Members
              </label>
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                min="2"
                max="50"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVault}
                disabled={loading || !vaultName}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: loading || !vaultName ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading || !vaultName ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating...' : 'Create Vault'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Vault Modal */}
      {showJoinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Join Vault</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Join Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter vault join code"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowJoinModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinVault}
                disabled={loading || !joinCode}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: loading || !joinCode ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading || !joinCode ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Joining...' : 'Join Vault'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupVaults;
