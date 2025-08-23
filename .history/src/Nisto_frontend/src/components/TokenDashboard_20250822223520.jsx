import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BackendService from '../services/BackendService';
import { FiSend, FiDownload, FiUpload, FiTrendingUp, FiAward, FiDollarSign, FiActivity, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock, FiUsers, FiZap, FiPlay, FiPause } from 'react-icons/fi';
import EnhancedStaking from './EnhancedStaking';
import TokenSwap from './TokenSwap';

const TokenDashboard = () => {
  const auth = useAuth();
  const { theme } = useTheme();
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
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [transferHistory, setTransferHistory] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  // Initialize backend service when auth is ready
  useEffect(() => {
    if (auth && auth.user) {
      const service = new BackendService();
      setBackendService(service);
    }
  }, [auth]);

  // Auto-load token data when backend service is ready
  useEffect(() => {
    if (backendService && auth?.principal) {
      loadTokenData();
    }
  }, [backendService, auth?.principal]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh || !backendService || !auth?.principal) return;

    const interval = setInterval(() => {
      loadTokenData(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, backendService, auth?.principal]);

  const loadTokenData = useCallback(async (silent = false) => {
    if (!backendService || !auth?.principal) return;
    
    try {
      if (!silent) {
        setRefreshing(true);
      }
      setError(null);

      console.log('Loading token data for principal:', auth.principal);
      
      const [metadata, userBalance, userTotalBalance, userStakingInfo, history] = await Promise.all([
        backendService.getTokenMetadata(),
        backendService.balanceOf(auth.principal),
        backendService.getTotalBalance(auth.principal),
        backendService.getStakingInfo(auth.principal),
        backendService.getTransferHistory(10, 0)
      ]);
      
      setTokenMetadata(metadata);
      setBalance(userBalance);
      setTotalBalance(userTotalBalance);
      setStakingInfo(userStakingInfo);
      setTransferHistory(history);
      setLastRefresh(new Date());
      
      console.log('Token data loaded successfully:', {
        metadata,
        balance: userBalance,
        totalBalance: userTotalBalance,
        stakingInfo: userStakingInfo,
        historyCount: history.length
      });
    } catch (error) {
      console.error('Error loading token data:', error);
      setError('Failed to load token data. Please try refreshing.');
      if (!silent) {
        setMessage('Error loading token data');
      }
    } finally {
      setRefreshing(false);
    }
  }, [backendService, auth?.principal]);

  const handleRefresh = async () => {
    setMessage('');
    await loadTokenData();
  };

  const handleTransfer = async () => {
    if (!backendService || !transferAmount || !transferTo) return;
    
    try {
      setLoading(true);
      setMessage('');
      setError(null);

      console.log('Transferring tokens:', { to: transferTo, amount: transferAmount });
      
      const result = await backendService.transfer(transferTo, BigInt(transferAmount));
      if (result.ok) {
        setMessage('Transfer successful!');
        setTransferAmount('');
        setTransferTo('');
        // Auto-refresh data after successful transfer
        setTimeout(() => loadTokenData(true), 1000);
      } else {
        setError(`Transfer failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setError(`Transfer error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!backendService || !stakeAmount) return;
    
    try {
      setLoading(true);
      setMessage('');
      setError(null);

      console.log('Staking tokens:', stakeAmount);
      
      const result = await backendService.stake(BigInt(stakeAmount));
      if (result.ok) {
        setMessage('Staking successful!');
        setStakeAmount('');
        // Auto-refresh data after successful staking
        setTimeout(() => loadTokenData(true), 1000);
      } else {
        setError(`Staking failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Staking error:', error);
      setError(`Staking error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!backendService || !unstakeAmount) return;
    
    try {
      setLoading(true);
      setMessage('');
      setError(null);

      console.log('Unstaking tokens:', unstakeAmount);
      
      const result = await backendService.unstake(BigInt(unstakeAmount));
      if (result.ok) {
        setMessage('Unstaking successful!');
        setUnstakeAmount('');
        // Auto-refresh data after successful unstaking
        setTimeout(() => loadTokenData(true), 1000);
      } else {
        setError(`Unstaking failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      setError(`Unstaking error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!backendService) return;
    
    try {
      setLoading(true);
      setMessage('');
      setError(null);

      console.log('Claiming rewards...');
      
      const result = await backendService.claimRewards();
      if (result.ok) {
        setMessage(`Rewards claimed: ${result.ok}`);
        // Auto-refresh data after successful claim
        setTimeout(() => loadTokenData(true), 1000);
      } else {
        setError(`Claim failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Claim error:', error);
      setError(`Claim error: ${error.message}`);
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

  const formatTimeAgo = (timestamp) => {
    if (!lastRefresh) return '';
    const now = new Date();
    const diff = now - lastRefresh;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Safety check for when auth context is not ready
  if (!auth) {
    return (
      <div className="token-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
            Loading...
          </h2>
          <p style={{ color: theme.colors.text.secondary }}>Please wait while we initialize the authentication</p>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="token-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: theme.colors.text.primary, marginBottom: '0.5rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: theme.colors.text.secondary }}>Please log in to access the token dashboard</p>
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
        <div className="token-header-actions">
          <div className="auto-refresh-control">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn btn-secondary ${autoRefresh ? 'active' : ''}`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              {autoRefresh ? <FiPause /> : <FiPlay />}
            </button>
            {lastRefresh && (
              <span className="last-refresh">
                Last: {formatTimeAgo(lastRefresh)}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-primary"
          >
            <FiRefreshCw style={{ 
              width: '1rem', 
              height: '1rem',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '0.5rem',
          backgroundColor: `${theme.colors.error}10`,
          borderLeft: `4px solid ${theme.colors.error}`,
          color: theme.colors.error
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Success Message Display */}
      {message && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '0.5rem',
          backgroundColor: `${theme.colors.success}10`,
          borderLeft: `4px solid ${theme.colors.success}`,
          color: theme.colors.success
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
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
            border: `4px solid ${theme.colors.border.secondary}`,
            borderTop: `4px solid ${theme.colors.primary}`,
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
              <div className="token-stat-icon" style={{ backgroundColor: '#ccfbf1' }}>
                <FiDollarSign style={{ color: '#075B5E' }} />
              </div>
              <span className="token-stat-label">Total Supply</span>
            </div>
            <h3 className="token-stat-value">{formatBalance(tokenMetadata.totalSupply)}</h3>
            <p className="token-stat-description">NST Tokens</p>
          </div>

          <div className="token-stat-card">
            <div className="token-stat-header">
              <div className="token-stat-icon" style={{ backgroundColor: `${theme.colors.success}10` }}>
                <FiTrendingUp style={{ color: theme.colors.success }} />
              </div>
              <span className="token-stat-label">Your Balance</span>
            </div>
            <h3 className="token-stat-value">{formatBalance(balance)}</h3>
            <p className="token-stat-description">Available NST</p>
          </div>

          {totalBalance && (
            <div className="token-stat-card">
              <div className="token-stat-header">
                <div className="token-stat-icon" style={{ backgroundColor: `${theme.colors.primary}10` }}>
                  <FiAward style={{ color: theme.colors.primary }} />
                </div>
                <span className="token-stat-label">Staked</span>
              </div>
              <h3 className="token-stat-value">{formatBalance(totalBalance.stakedBalance)}</h3>
              <p className="token-stat-description">Staked NST</p>
            </div>
          )}

          <div className="token-stat-card">
            <div className="token-stat-header">
              <div className="token-stat-icon" style={{ backgroundColor: `${theme.colors.warning}10` }}>
                <FiActivity style={{ color: theme.colors.warning }} />
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
            { id: 'swap', label: 'Swap', icon: FiRefreshCw },
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

          {/* Swap Tab */}
          {activeTab === 'swap' && <TokenSwap />}

          {/* Staking Tab */}
          {activeTab === 'staking' && <EnhancedStaking />}

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