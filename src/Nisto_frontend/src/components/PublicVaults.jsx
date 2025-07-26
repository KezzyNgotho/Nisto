import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, 
  FiLock, FiUnlock, FiEye, FiShield, FiArrowRight, FiSearch, FiFilter
} from 'react-icons/fi';

export default function PublicVaults() {
  const { getPublicVaults, joinGroupVault, user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [publicVaults, setPublicVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningVault, setJoiningVault] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchPublicVaults = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const vaults = await getPublicVaults();
        setPublicVaults(vaults || []);
      } catch (err) {
        console.error('Failed to fetch public vaults:', err);
        setPublicVaults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicVaults();
  }, [getPublicVaults, isAuthenticated]);

  const handleJoinVault = async (vaultId) => {
    setJoiningVault(vaultId);
    try {
      const result = await joinGroupVault(vaultId);
      if (result.ok) {
        showToast({ 
          message: 'Successfully joined vault!', 
          type: 'success', 
          icon: <FiCheck /> 
        });
        // Remove the vault from the list since user is now a member
        setPublicVaults(prev => prev.filter(vault => vault.id !== vaultId));
      } else {
        showToast({ 
          message: result.err || 'Failed to join vault', 
          type: 'error', 
          icon: <FiX /> 
        });
      }
    } catch (err) {
      console.error('Join vault error:', err);
      showToast({ 
        message: 'Failed to join vault', 
        type: 'error', 
        icon: <FiX /> 
      });
    } finally {
      setJoiningVault(null);
    }
  };

  const filteredVaults = publicVaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || vault.vaultType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getVaultTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'savings': return <FiTarget />;
      case 'investment': return <FiTrendingUp />;
      case 'emergency': return <FiShield />;
      default: return <FiDollarSign />;
    }
  };

  const getVaultTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'savings': return 'var(--success-500)';
      case 'investment': return 'var(--primary-500)';
      case 'emergency': return 'var(--warning-500)';
      default: return 'var(--neutral-500)';
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <FiLock size={48} style={{ color: 'var(--neutral-400)', marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--neutral-700)' }}>
          Authentication Required
        </h3>
        <p style={{ margin: 0, color: 'var(--neutral-600)' }}>
          Please log in to browse public vaults
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: 'var(--neutral-800)' 
        }}>
          Discover Public Vaults
        </h1>
        <p style={{ 
          margin: 0, 
          color: 'var(--neutral-600)', 
          fontSize: '1.1rem' 
        }}>
          Join community vaults and start saving together
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <FiSearch style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--neutral-400)'
          }} />
          <input
            type="text"
            placeholder="Search vaults..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '2px solid var(--neutral-200)',
              borderRadius: 12,
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid var(--neutral-200)',
            borderRadius: 12,
            fontSize: '1rem',
            outline: 'none',
            background: 'white',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="all">All Types</option>
          <option value="savings">Savings</option>
          <option value="investment">Investment</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid var(--neutral-200)',
            borderTop: '4px solid var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Vaults Grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredVaults.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--neutral-500)'
            }}>
              <FiSearch size={48} style={{ marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No vaults found</h3>
              <p style={{ margin: 0 }}>
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No public vaults available at the moment'}
              </p>
            </div>
          ) : (
            filteredVaults.map((vault) => (
              <div key={vault.id} style={{
                background: 'white',
                borderRadius: 16,
                padding: '1.5rem',
                border: '1px solid var(--neutral-200)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              }}>
                
                {/* Vault Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${getVaultTypeColor(vault.vaultType)}, ${getVaultTypeColor(vault.vaultType)}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <div style={{ color: 'white', fontSize: '1.2rem' }}>
                      {getVaultTypeIcon(vault.vaultType)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 0.25rem 0', 
                      fontSize: '1.2rem', 
                      fontWeight: 600,
                      color: 'var(--neutral-800)'
                    }}>
                      {vault.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--neutral-600)'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: 'var(--neutral-100)',
                        borderRadius: 6,
                        fontWeight: 500
                      }}>
                        {vault.vaultType}
                      </span>
                      <FiUsers size={14} />
                      <span>{vault.members?.length || 0} members</span>
                    </div>
                  </div>
                </div>

                {/* Vault Description */}
                {vault.description && (
                  <p style={{
                    margin: '0 0 1rem 0',
                    color: 'var(--neutral-600)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5
                  }}>
                    {vault.description}
                  </p>
                )}

                {/* Vault Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                      Current Balance
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success-700)' }}>
                      {vault.totalBalance} {vault.currency}
                    </div>
                  </div>
                  {vault.targetAmount && (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                        Target Amount
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                        {vault.targetAmount} {vault.currency}
                      </div>
                    </div>
                  )}
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinVault(vault.id)}
                  disabled={joiningVault === vault.id}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: joiningVault === vault.id ? 'not-allowed' : 'pointer',
                    opacity: joiningVault === vault.id ? 0.7 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (joiningVault !== vault.id) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {joiningVault === vault.id ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Joining...
                    </>
                  ) : (
                    <>
                      <FiArrowRight size={16} />
                      Join Vault
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 