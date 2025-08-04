import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BackendService from '../services/BackendService';
import { FiSend, FiDownload, FiUpload, FiTrendingUp, FiAward, FiDollarSign, FiActivity, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock, FiUsers, FiZap } from 'react-icons/fi';

const TokenDashboard = () => {
  const auth = useAuth();
  
  // Safety check for when auth context is not ready
  if (!auth) {
    return (
      <div className="token-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Loading...
          </h2>
          <p style={{ color: '#6b7280' }}>Please wait while we initialize the authentication</p>
        </div>
      </div>
    );
  }

  const { user } = auth;
  const [backendService, setBackendService] = useState(null);
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(null);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [transferHistory, setTransferHistory] = useState([]);

  useEffect(() => {
    if (user) {
      const service = new BackendService();
      setBackendService(service);
      loadTokenData();
    }
  }, [user]);

  const loadTokenData = async () => {
    if (!backendService || !user) return;
    
    try {
      setLoading(true);
      const [metadata, userBalance, userTotalBalance, userStakingInfo, history] = await Promise.all([
        backendService.getTokenMetadata(),
        backendService.balanceOf(user.id),
        backendService.getTotalBalance(user.id),
        backendService.getStakingInfo(user.id),
        backendService.getTransferHistory(5, 0)
      ]);
      
      setTokenMetadata(metadata);
      setBalance(userBalance);
      setTotalBalance(userTotalBalance);
      setStakingInfo(userStakingInfo);
      setTransferHistory(history);
    } catch (error) {
      console.error('Error loading token data:', error);
      setMessage('Error loading token data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!backendService || !transferAmount || !transferTo) return;
    
    try {
      setLoading(true);
      const result = await backendService.transfer(transferTo, BigInt(transferAmount));
      if (result.ok) {
        setMessage('Transfer successful!');
        setTransferAmount('');
        setTransferTo('');
        loadTokenData();
      } else {
        setMessage(`Transfer failed: ${result.err}`);
      }
    } catch (error) {
      setMessage(`Transfer error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!backendService || !stakeAmount) return;
    
    try {
      setLoading(true);
      const result = await backendService.stake(BigInt(stakeAmount));
      if (result.ok) {
        setMessage('Staking successful!');
        setStakeAmount('');
        loadTokenData();
      } else {
        setMessage(`Staking failed: ${result.err}`);
      }
    } catch (error) {
      setMessage(`Staking error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!backendService || !unstakeAmount) return;
    
    try {
      setLoading(true);
      const result = await backendService.unstake(BigInt(unstakeAmount));
      if (result.ok) {
        setMessage('Unstaking successful!');
        setUnstakeAmount('');
        loadTokenData();
      } else {
        setMessage(`Unstaking failed: ${result.err}`);
      }
    } catch (error) {
      setMessage(`Unstaking error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!backendService) return;
    
    try {
      setLoading(true);
      const result = await backendService.claimRewards();
      if (result.ok) {
        setMessage(`Rewards claimed: ${result.ok}`);
        loadTokenData();
      } else {
        setMessage(`Claim failed: ${result.err}`);
      }
    } catch (error) {
      setMessage(`Claim error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance) => {
    if (!balance) return '0';
    return (Number(balance) / 100000000).toFixed(8);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!user) {
    return (
      <div className="token-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: '#6b7280' }}>Please log in to access the token dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-dashboard">
      {/* Header */}
      <div className="token-header">
        <div className="token-header-left">
          <div className="token-icon">
            <FiDollarSign />
          </div>
          <div>
            <h1 className="token-title">Nisto Token</h1>
            <p className="token-subtitle">Manage your NST tokens and staking rewards</p>
          </div>
        </div>
        <button
          onClick={loadTokenData}
          disabled={loading}
          className="btn btn-primary"
        >
          <FiRefreshCw style={{ 
            width: '1rem', 
            height: '1rem',
            animation: loading ? 'spin 1s linear infinite' : 'none'
          }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '0.5rem',
          borderLeft: '4px solid',
          ...(message.includes('successful') ? {
            backgroundColor: '#ecfdf5',
            borderLeftColor: '#10b981',
            color: '#065f46'
          } : {
            backgroundColor: '#fef2f2',
            borderLeftColor: '#ef4444',
            color: '#991b1b'
          })
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {message.includes('successful') ? 
              <FiCheckCircle style={{ width: '1.25rem', height: '1.25rem' }} /> : 
              <FiAlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />
            }
            <span style={{ fontWeight: '500' }}>{message}</span>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}

      {/* Token Stats Cards */}
      {tokenMetadata && (
        <div className="token-stats-grid">
          <div className="token-stat-card">
            <div className="token-stat-header">
              <div className="token-stat-icon" style={{ backgroundColor: '#dbeafe' }}>
                <FiDollarSign style={{ color: '#2563eb' }} />
              </div>
              <span className="token-stat-label">Total Supply</span>
            </div>
            <h3 className="token-stat-value">{formatBalance(tokenMetadata.totalSupply)}</h3>
            <p className="token-stat-description">NST Tokens</p>
          </div>

          <div className="token-stat-card">
            <div className="token-stat-header">
              <div className="token-stat-icon" style={{ backgroundColor: '#dcfce7' }}>
                <FiTrendingUp style={{ color: '#16a34a' }} />
              </div>
              <span className="token-stat-label">Your Balance</span>
            </div>
            <h3 className="token-stat-value">{formatBalance(balance)}</h3>
            <p className="token-stat-description">Available NST</p>
          </div>

          {totalBalance && (
            <div className="token-stat-card">
              <div className="token-stat-header">
                <div className="token-stat-icon" style={{ backgroundColor: '#f3e8ff' }}>
                  <FiAward style={{ color: '#9333ea' }} />
                </div>
                <span className="token-stat-label">Staked</span>
              </div>
              <h3 className="token-stat-value">{formatBalance(totalBalance.stakedBalance)}</h3>
              <p className="token-stat-description">Staked NST</p>
            </div>
          )}

          <div className="token-stat-card">
            <div className="token-stat-header">
              <div className="token-stat-icon" style={{ backgroundColor: '#fed7aa' }}>
                <FiActivity style={{ color: '#ea580c' }} />
              </div>
              <span className="token-stat-label">Circulating</span>
            </div>
            <h3 className="token-stat-value">{formatBalance(tokenMetadata.circulatingSupply)}</h3>
            <p className="token-stat-description">In Circulation</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="token-tabs">
        <div className="token-tabs-nav">
          {[
            { id: 'overview', label: 'Overview', icon: FiActivity },
            { id: 'transfer', label: 'Transfer', icon: FiSend },
            { id: 'staking', label: 'Staking', icon: FiTrendingUp },
            { id: 'history', label: 'History', icon: FiClock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`token-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="token-tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="token-info-grid">
              {/* Token Information */}
              <div className="token-info-card">
                <h3>
                  <FiDollarSign style={{ color: '#2563eb' }} />
                  <span>Token Information</span>
                </h3>
                <div>
                  <div className="token-info-item">
                    <span className="token-info-label">Name</span>
                    <span className="token-info-value">{tokenMetadata?.name}</span>
                  </div>
                  <div className="token-info-item">
                    <span className="token-info-label">Symbol</span>
                    <span className="token-info-value">{tokenMetadata?.symbol}</span>
                  </div>
                  <div className="token-info-item">
                    <span className="token-info-label">Decimals</span>
                    <span className="token-info-value">{tokenMetadata?.decimals}</span>
                  </div>
                  <div className="token-info-item">
                    <span className="token-info-label">Status</span>
                    <span className="token-info-value" style={{
                      color: tokenMetadata?.isPaused ? '#dc2626' : '#16a34a'
                    }}>
                      {tokenMetadata?.isPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Staking Information */}
              {stakingInfo && (
                <div className="token-info-card">
                  <h3>
                    <FiAward style={{ color: '#9333ea' }} />
                    <span>Staking Status</span>
                  </h3>
                  <div>
                    <div className="token-info-item">
                      <span className="token-info-label">Status</span>
                      <span className="token-info-value" style={{
                        color: stakingInfo.isStaking ? '#16a34a' : '#6b7280'
                      }}>
                        {stakingInfo.isStaking ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="token-info-item">
                      <span className="token-info-label">Staked Amount</span>
                      <span className="token-info-value">
                        {formatBalance(stakingInfo.stakedAmount)} NST
                      </span>
                    </div>
                    <div className="token-info-item">
                      <span className="token-info-label">Total Rewards</span>
                      <span className="token-info-value">
                        {formatBalance(stakingInfo.totalRewardsEarned)} NST
                      </span>
                    </div>
                    <button
                      onClick={handleClaimRewards}
                      disabled={loading}
                      className="btn btn-success"
                      style={{ width: '100%', marginTop: '1rem' }}
                    >
                      <FiZap style={{ width: '1rem', height: '1rem' }} />
                      Claim Rewards
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div className="token-form">
              <h3>
                <FiSend style={{ color: '#2563eb' }} />
                <span>Transfer Tokens</span>
              </h3>
              <div className="token-form-group">
                <label className="token-form-label">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Enter principal ID"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="token-form-input"
                />
              </div>
              <div className="token-form-group">
                <label className="token-form-label">Amount (NST)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="token-form-input"
                />
              </div>
              <button
                onClick={handleTransfer}
                disabled={loading || !transferAmount || !transferTo}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <FiSend style={{ width: '1rem', height: '1rem' }} />
                <span>Send Tokens</span>
              </button>
            </div>
          )}

          {/* Staking Tab */}
          {activeTab === 'staking' && (
            <div className="token-info-grid">
              {/* Stake Tokens */}
              <div className="token-info-card">
                <h3>
                  <FiUpload style={{ color: '#16a34a' }} />
                  <span>Stake Tokens</span>
                </h3>
                <div className="token-form-group">
                  <label className="token-form-label">Amount to Stake (NST)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="token-form-input"
                  />
                </div>
                <button
                  onClick={handleStake}
                  disabled={loading || !stakeAmount}
                  className="btn btn-success"
                  style={{ width: '100%' }}
                >
                  <FiUpload style={{ width: '1rem', height: '1rem' }} />
                  Stake Tokens
                </button>
              </div>

              {/* Unstake Tokens */}
              <div className="token-info-card">
                <h3>
                  <FiDownload style={{ color: '#ea580c' }} />
                  <span>Unstake Tokens</span>
                </h3>
                <div className="token-form-group">
                  <label className="token-form-label">Amount to Unstake (NST)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="token-form-input"
                  />
                </div>
                <button
                  onClick={handleUnstake}
                  disabled={loading || !unstakeAmount}
                  className="btn btn-warning"
                  style={{ width: '100%' }}
                >
                  <FiDownload style={{ width: '1rem', height: '1rem' }} />
                  Unstake Tokens
                </button>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiClock style={{ color: '#6b7280' }} />
                <span>Recent Transactions</span>
              </h3>
              <div>
                {transferHistory.length > 0 ? (
                  transferHistory.map((tx, index) => (
                    <div key={index} className="token-history-item">
                      <div className="token-history-left">
                        <div className="token-history-icon">
                          <FiSend />
                        </div>
                        <div className="token-history-details">
                          <h4>{formatBalance(tx.amount)} NST</h4>
                          <p>To: {formatAddress(tx.to)}</p>
                        </div>
                      </div>
                      <div className="token-history-time">
                        <p className="token-history-date">
                          {new Date(Number(tx.timestamp) / 1000000).toLocaleDateString()}
                        </p>
                        <p className="token-history-time-text">
                          {new Date(Number(tx.timestamp) / 1000000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="token-empty-state">
                    <FiActivity />
                    <h4>No transactions yet</h4>
                    <p>Your transaction history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default TokenDashboard; 