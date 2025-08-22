import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiAward, 
  FiZap, 
  FiClock, 
  FiRefreshCw,
  FiActivity,
  FiTarget,
  FiBarChart2,
  FiDollarSign,
  FiPercent,
  FiPlay,
  FiPause,
  FiSettings,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCalendar,
  FiRepeat,
  FiShield
} from 'react-icons/fi';

const EnhancedStaking = () => {
  const auth = useAuth();
  const [stakingData, setStakingData] = useState({
    stakedAmount: 0,
    totalRewards: 0,
    pendingRewards: 0,
    apy: 12.5, // Default APY
    compoundFrequency: 'daily',
    isStaking: false,
    stakingStartTime: null,
    lastRewardTime: null,
    totalStaked: 0,
    totalStakers: 0
  });
  
  const [stakingForm, setStakingForm] = useState({
    amount: '',
    autoCompound: false,
    compoundFrequency: 'daily'
  });
  
  const [unstakingForm, setUnstakingForm] = useState({
    amount: ''
  });
  
  const [projections, setProjections] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showProjections, setShowProjections] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load staking data
  const loadStakingData = useCallback(async () => {
    if (!auth?.user || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      const [stakingInfo, totalBalance, totalStaked] = await Promise.all([
        auth.backendService.getStakingInfo(auth.user.id),
        auth.backendService.getTotalBalance(auth.user.id),
        auth.backendService.getTotalStaked()
      ]);
      
      if (stakingInfo) {
        const apy = 12.5; // This would come from backend in real implementation
        const pendingRewards = calculatePendingRewards(stakingInfo, apy);
        
        setStakingData({
          stakedAmount: Number(stakingInfo.stakedAmount),
          totalRewards: Number(stakingInfo.totalRewardsEarned),
          pendingRewards,
          apy,
          compoundFrequency: 'daily',
          isStaking: stakingInfo.isStaking,
          stakingStartTime: stakingInfo.stakingStartTime,
          lastRewardTime: stakingInfo.lastRewardTime,
          totalStaked: Number(totalStaked),
          totalStakers: 1250 // Mock data - would come from backend
        });
        
        // Calculate projections
        calculateProjections(Number(stakingInfo.stakedAmount), apy);
      }
    } catch (error) {
      console.error('Error loading staking data:', error);
      setError('Failed to load staking data');
    } finally {
      setLoading(false);
    }
  }, [auth?.user, auth?.backendService]);

  // Calculate pending rewards
  const calculatePendingRewards = (stakingInfo, apy) => {
    if (!stakingInfo.isStaking || !stakingInfo.stakingStartTime) return 0;
    
    const now = Date.now() * 1000000; // Convert to nanoseconds
    const lastReward = stakingInfo.lastRewardTime || stakingInfo.stakingStartTime;
    const timeDiff = Number(now) - Number(lastReward);
    const daysDiff = timeDiff / (1000000000 * 60 * 60 * 24); // Convert to days
    
    const dailyRate = apy / 365 / 100;
    const pendingRewards = Number(stakingInfo.stakedAmount) * dailyRate * daysDiff;
    
    return Math.max(0, pendingRewards);
  };

  // Calculate earnings projections
  const calculateProjections = (stakedAmount, apy) => {
    if (!stakedAmount || stakedAmount <= 0) {
      setProjections({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
      return;
    }
    
    const dailyRate = apy / 365 / 100;
    const weeklyRate = apy / 52 / 100;
    const monthlyRate = apy / 12 / 100;
    const yearlyRate = apy / 100;
    
    setProjections({
      daily: stakedAmount * dailyRate,
      weekly: stakedAmount * weeklyRate,
      monthly: stakedAmount * monthlyRate,
      yearly: stakedAmount * yearlyRate
    });
  };

  // Handle stake
  const handleStake = async () => {
    if (!stakingForm.amount || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      const amount = BigInt(Math.floor(Number(stakingForm.amount) * 100000000)); // Convert to smallest unit
      await auth.backendService.stake(amount);
      
      setMessage('Successfully staked tokens!');
      setStakingForm({ ...stakingForm, amount: '' });
      
      // Reload data
      setTimeout(loadStakingData, 1000);
    } catch (error) {
      console.error('Staking error:', error);
      setError(`Staking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle unstake
  const handleUnstake = async () => {
    if (!unstakingForm.amount || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      const amount = BigInt(Math.floor(Number(unstakingForm.amount) * 100000000));
      await auth.backendService.unstake(amount);
      
      setMessage('Successfully unstaked tokens!');
      setUnstakingForm({ amount: '' });
      
      // Reload data
      setTimeout(loadStakingData, 1000);
    } catch (error) {
      console.error('Unstaking error:', error);
      setError(`Unstaking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle claim rewards
  const handleClaimRewards = async () => {
    if (!auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      await auth.backendService.claimRewards();
      
      setMessage('Successfully claimed rewards!');
      
      // Reload data
      setTimeout(loadStakingData, 1000);
    } catch (error) {
      console.error('Claim error:', error);
      setError(`Claim failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    loadStakingData();
    
    if (autoRefresh) {
      const interval = setInterval(loadStakingData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [loadStakingData, autoRefresh]);

  // Format balance
  const formatBalance = (balance) => {
    if (!balance) return '0';
    return (Number(balance) / 100000000).toFixed(8);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = Date.now() * 1000000;
    const diff = Number(now) - Number(timestamp);
    const days = Math.floor(diff / (1000000000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000000000 * 60 * 60 * 24)) / (1000000000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="enhanced-staking">
      {/* Header */}
      <div className="staking-header">
        <div className="staking-header-left">
          <div className="staking-icon">
            <FiAward />
          </div>
          <div>
            <h1 className="staking-title">Enhanced Staking</h1>
            <p className="staking-subtitle">Earn rewards with compound interest</p>
          </div>
        </div>
        <div className="staking-header-actions">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn btn-secondary ${autoRefresh ? 'active' : ''}`}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? <FiPause /> : <FiPlay />}
          </button>
          <button
            onClick={loadStakingData}
            disabled={loading}
            className="btn btn-primary"
          >
            <FiRefreshCw style={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}
      
      {message && (
        <div className="alert alert-success">
          <FiCheckCircle />
          <span>{message}</span>
        </div>
      )}

      {/* Staking Stats Grid */}
      <div className="staking-stats-grid">
        {/* APY Card */}
        <div className="staking-stat-card apy-card">
          <div className="staking-stat-header">
            <div className="staking-stat-icon">
              <FiTrendingUp />
            </div>
            <span className="staking-stat-label">Current APY</span>
          </div>
          <h3 className="staking-stat-value apy-value">
            {stakingData.apy.toFixed(2)}%
          </h3>
          <p className="staking-stat-description">
            Annual Percentage Yield
          </p>
          <div className="apy-indicator">
            <FiArrowUpRight />
            <span>High Yield</span>
          </div>
        </div>

        {/* Staked Amount */}
        <div className="staking-stat-card">
          <div className="staking-stat-header">
            <div className="staking-stat-icon">
              <FiTarget />
            </div>
            <span className="staking-stat-label">Staked Amount</span>
          </div>
          <h3 className="staking-stat-value">
            {formatBalance(stakingData.stakedAmount)} NST
          </h3>
          <p className="staking-stat-description">
            {stakingData.isStaking ? 'Active Staking' : 'Not Staking'}
          </p>
        </div>

        {/* Pending Rewards */}
        <div className="staking-stat-card">
          <div className="staking-stat-header">
            <div className="staking-stat-icon">
              <FiZap />
            </div>
            <span className="staking-stat-label">Pending Rewards</span>
          </div>
          <h3 className="staking-stat-value">
            {formatBalance(stakingData.pendingRewards)} NST
          </h3>
          <p className="staking-stat-description">
            Ready to claim
          </p>
        </div>

        {/* Total Rewards */}
        <div className="staking-stat-card">
          <div className="staking-stat-header">
            <div className="staking-stat-icon">
              <FiAward />
            </div>
            <span className="staking-stat-label">Total Earned</span>
          </div>
          <h3 className="staking-stat-value">
            {formatBalance(stakingData.totalRewards)} NST
          </h3>
          <p className="staking-stat-description">
            All time rewards
          </p>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="staking-actions-grid">
        {/* Stake Tokens */}
        <div className="staking-action-card">
          <h3>
            <FiTrendingUp />
            <span>Stake Tokens</span>
          </h3>
          <div className="staking-form">
            <div className="form-group">
              <label>Amount to Stake (NST)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={stakingForm.amount}
                onChange={(e) => setStakingForm({...stakingForm, amount: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={stakingForm.autoCompound}
                  onChange={(e) => setStakingForm({...stakingForm, autoCompound: e.target.checked})}
                />
                <span>Auto-compound rewards</span>
              </label>
            </div>
            <button
              onClick={handleStake}
              disabled={loading || !stakingForm.amount}
              className="btn btn-success btn-full"
            >
              <FiTrendingUp />
              <span>Stake Tokens</span>
            </button>
          </div>
        </div>

        {/* Unstake Tokens */}
        <div className="staking-action-card">
          <h3>
            <FiTrendingDown />
            <span>Unstake Tokens</span>
          </h3>
          <div className="staking-form">
            <div className="form-group">
              <label>Amount to Unstake (NST)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={unstakingForm.amount}
                onChange={(e) => setUnstakingForm({amount: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="unstake-info">
              <FiInfo />
              <span>No lock period - unstake anytime</span>
            </div>
            <button
              onClick={handleUnstake}
              disabled={loading || !unstakingForm.amount}
              className="btn btn-warning btn-full"
            >
              <FiTrendingDown />
              <span>Unstake Tokens</span>
            </button>
          </div>
        </div>

        {/* Claim Rewards */}
        <div className="staking-action-card">
          <h3>
            <FiZap />
            <span>Claim Rewards</span>
          </h3>
          <div className="staking-form">
            <div className="rewards-display">
              <div className="rewards-amount">
                {formatBalance(stakingData.pendingRewards)} NST
              </div>
              <div className="rewards-label">Available to claim</div>
            </div>
            <button
              onClick={handleClaimRewards}
              disabled={loading || stakingData.pendingRewards <= 0}
              className="btn btn-primary btn-full"
            >
              <FiZap />
              <span>Claim Rewards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Projections */}
      <div className="projections-section">
        <div className="projections-header">
          <h3>
            <FiCalculator />
            <span>Earnings Projections</span>
          </h3>
          <button
            onClick={() => setShowProjections(!showProjections)}
            className="btn btn-secondary"
          >
            {showProjections ? 'Hide' : 'Show'} Projections
          </button>
        </div>
        
        {showProjections && (
          <div className="projections-grid">
            <div className="projection-card">
              <div className="projection-period">Daily</div>
              <div className="projection-amount">
                {formatBalance(projections.daily)} NST
              </div>
              <div className="projection-value">
                {formatCurrency(projections.daily * 0.1)} {/* Mock USD value */}
              </div>
            </div>
            <div className="projection-card">
              <div className="projection-period">Weekly</div>
              <div className="projection-amount">
                {formatBalance(projections.weekly)} NST
              </div>
              <div className="projection-value">
                {formatCurrency(projections.weekly * 0.1)}
              </div>
            </div>
            <div className="projection-card">
              <div className="projection-period">Monthly</div>
              <div className="projection-amount">
                {formatBalance(projections.monthly)} NST
              </div>
              <div className="projection-value">
                {formatCurrency(projections.monthly * 0.1)}
              </div>
            </div>
            <div className="projection-card">
              <div className="projection-period">Yearly</div>
              <div className="projection-amount">
                {formatBalance(projections.yearly)} NST
              </div>
              <div className="projection-value">
                {formatCurrency(projections.yearly * 0.1)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staking Info */}
      <div className="staking-info-grid">
                 <div className="staking-info-card">
           <h3>
             <FiBarChart2 />
             <span>Staking Statistics</span>
           </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Total Staked</span>
              <span className="info-value">{formatBalance(stakingData.totalStaked)} NST</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Stakers</span>
              <span className="info-value">{stakingData.totalStakers.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Staking Since</span>
              <span className="info-value">
                {stakingData.stakingStartTime ? formatTimeAgo(stakingData.stakingStartTime) : 'Not staking'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Reward</span>
              <span className="info-value">
                {stakingData.lastRewardTime ? formatTimeAgo(stakingData.lastRewardTime) : 'Never'}
              </span>
            </div>
          </div>
        </div>

        <div className="staking-info-card">
          <h3>
            <FiShield />
            <span>Staking Benefits</span>
          </h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <FiCheckCircle />
              <span>High APY returns (12.5%)</span>
            </div>
            <div className="benefit-item">
              <FiCheckCircle />
              <span>No lock period</span>
            </div>
            <div className="benefit-item">
              <FiCheckCircle />
              <span>Auto-compound option</span>
            </div>
            <div className="benefit-item">
              <FiCheckCircle />
              <span>Governance voting rights</span>
            </div>
            <div className="benefit-item">
              <FiCheckCircle />
              <span>Platform fee discounts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStaking;
