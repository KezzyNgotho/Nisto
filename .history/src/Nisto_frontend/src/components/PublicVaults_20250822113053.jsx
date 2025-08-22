import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiUsers, 
  FiDollarSign, 
  FiTarget, 
  FiCalendar,
  FiEye,
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiGlobe,
  FiTrendingUp,
  FiStar
} from 'react-icons/fi';

const PublicVaults = () => {
  const { showToast } = useNotification();
  const { user, getPublicVaults, joinVault } = useAuth();
  const [publicVaults, setPublicVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadPublicVaults();
  }, []);

  const loadPublicVaults = async () => {
    setLoading(true);
    try {
      const vaults = await getPublicVaults();
      setPublicVaults(vaults || []);
    } catch (error) {
      console.error('Error loading public vaults:', error);
      showToast({ message: 'Failed to load public vaults', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVault = async (vaultId) => {
    try {
      await joinVault(vaultId);
      showToast({ message: 'Successfully joined vault!', type: 'success' });
      loadPublicVaults(); // Refresh the list
    } catch (error) {
      console.error('Error joining vault:', error);
      showToast({ message: 'Failed to join vault', type: 'error' });
    }
  };

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
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredVaults = publicVaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vault.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || vault.vaultType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        color: '#64748b'
      }}>
        Loading public vaults...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.875rem', fontWeight: '600', color: '#1e293b' }}>
          Public Vaults
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
          Discover and join public vaults created by the community
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'white'
              }}
            />
          </div>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            background: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">All Types</option>
          <option value="Savings">Savings</option>
          <option value="Investment">Investment</option>
          <option value="Emergency">Emergency</option>
          <option value="Travel">Travel</option>
          <option value="Education">Education</option>
        </select>
      </div>

      {/* Vaults Grid */}
      {filteredVaults.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredVaults.map((vault) => (
            <div key={vault.id} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              transition: 'all 0.2s',
              cursor: 'pointer',
              ':hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}>
              {/* Vault Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                    {vault.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiGlobe style={{ color: '#3b82f6', fontSize: '0.875rem' }} />
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Public • {vault.vaultType}
                    </span>
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#059669'
                }}>
                  {vault.memberCount || 0} members
                </div>
              </div>

              {/* Description */}
              <p style={{
                margin: '0 0 1rem 0',
                color: '#64748b',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {vault.description || 'No description available'}
              </p>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    Current Balance
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#059669' }}>
                    {formatAmount(vault.balance || 0)} {vault.currency || 'NST'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    Target Amount
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#d97706' }}>
                    {formatAmount(vault.targetAmount || 0)} {vault.currency || 'NST'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {vault.targetAmount && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Progress</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {Math.round((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min((Number(vault.balance || 0) / Number(vault.targetAmount)) * 100, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Created {formatDate(vault.createdAt)}
                </div>
                <button
                  onClick={() => handleJoinVault(vault.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.2s'
                  }}
                >
                  <FiUserPlus size={16} />
                  Join Vault
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#64748b'
        }}>
          <FiSearch size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '500' }}>
            No vaults found
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No public vaults are available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicVaults;
