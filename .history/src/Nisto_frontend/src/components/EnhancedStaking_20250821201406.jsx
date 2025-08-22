import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiTrendingUp, 
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
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const EnhancedStaking = () => {
  const auth = useAuth();
  const [stakingData, setStakingData] = useState({
    stakedAmount: 0,
    totalRewardsEarned: 0,
    pendingRewards: 0,
    isStaking: false,
    totalStaked: 0,
    totalStakers: 0
  });
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [autoCompound, setAutoCompound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Mock APY - in real implementation this would come from the contract
  const APY = 12.5;

  // Load staking data
  const loadStakingData = useCallback(async () => {
    if (!auth?.principal || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      const [stakingInfo, totalBalance, totalStaked] = await Promise.all([
        auth.backendService.getStakingInfo(auth.principal),
        auth.backendService.getTotalBalance(auth.principal),
        auth.backendService.getTotalStaked()
      ]);
      
      const pendingRewards = calculatePendingRewards(stakingInfo, APY);
      
      setStakingData({
        stakedAmount: Number(stakingInfo.stakedAmount) / 100000000,
        totalRewardsEarned: Number(stakingInfo.totalRewardsEarned) / 100000000,
        pendingRewards,
        isStaking: stakingInfo.isStaking,
        totalStaked: Number(totalStaked) / 100000000,
        totalStakers: 1250 // Mock data
      });
    } catch (error) {
      console.error('Error loading staking data:', error);
      setError('Failed to load staking data');
    } finally {
      setLoading(false);
    }
  }, [auth?.principal, auth?.backendService]);

  // Calculate pending rewards
  const calculatePendingRewards = (stakingInfo, apy) => {
    if (!stakingInfo.isStaking || !stakingInfo.stakedAmount) return 0;
    
    const stakedAmount = Number(stakingInfo.stakedAmount) / 100000000;
    const dailyRate = apy / 365 / 100;
    const daysStaked = 7; // Mock - would calculate actual days
    
    return stakedAmount * dailyRate * daysStaked;
  };

  // Handle stake
  const handleStake = async () => {
    if (!stakeAmount || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      const result = await auth.backendService.stake(BigInt(Math.floor(Number(stakeAmount) * 100000000)));
      
      if (result.ok) {
        setMessage('Successfully staked tokens!');
        setStakeAmount('');
        setTimeout(() => loadStakingData(), 1000);
      } else {
        setError(`Staking failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Staking error:', error);
      setError('Staking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle unstake
  const handleUnstake = async () => {
    if (!unstakeAmount || !auth?.backendService) return;
    
    try {
      setLoading(true);
      setError('');
      
      const result = await auth.backendService.unstake(BigInt(Math.floor(Number(unstakeAmount) * 100000000)));
      
      if (result.ok) {
        setMessage('Successfully unstaked tokens!');
        setUnstakeAmount('');
        setTimeout(() => loadStakingData(), 1000);
      } else {
        setError(`Unstaking failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      setError('Unstaking failed. Please try again.');
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
      
      const result = await auth.backendService.claimRewards();
      
      if (result.ok) {
        setMessage(`Successfully claimed ${result.ok} rewards!`);
        setTimeout(() => loadStakingData(), 1000);
      } else {
        setError(`Claim failed: ${result.err}`);
      }
    } catch (error) {
      console.error('Claim error:', error);
      setError('Claim failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadStakingData();
  }, [loadStakingData]);

  // Calculate earnings projections
  const calculateProjections = (amount, apy) => {
    const daily = amount * (apy / 365 / 100);
    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = amount * (apy / 100);
    
    return { daily, weekly, monthly, yearly };
  };

  const projections = calculateProjections(stakingData.stakedAmount, APY);

  return (
    <div className="token-form">
      <h3>
        <FiTrendingUp style={{ color: '#2563eb' }} />
        <span>Enhanced Staking</span>
      </h3>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          color: '#991b1b',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {message && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: '#ecfdf5',
          borderLeft: '4px solid #10b981',
          color: '#065f46',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCheckCircle />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Staking Overview */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        borderRadius: '0.5rem', 
        padding: '1rem', 
        marginBottom: '1.5rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontWeight: '600' }}>Current APY</span>
          <span style={{ color: '#10b981', fontWeight: '600' }}>{APY}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#6b7280' }}>Staked Amount</span>
          <span>{stakingData.stakedAmount.toFixed(6)} NST</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#6b7280' }}>Pending Rewards</span>
          <span>{stakingData.pendingRewards.toFixed(6)} NST</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Total Earned</span>
          <span>{stakingData.totalRewardsEarned.toFixed(6)} NST</span>
        </div>
      </div>

      {/* Staking Actions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="token-form-group">
          <label className="token-form-label">Stake Amount (NST)</label>
          <input
            type="number"
            placeholder="0.0"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="token-form-input"
          />
        </div>
        <button
          onClick={handleStake}
          disabled={loading || !stakeAmount}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <FiZap />
          <span>Stake Tokens</span>
        </button>

        <div className="token-form-group">
          <label className="token-form-label">Unstake Amount (NST)</label>
          <input
            type="number"
            placeholder="0.0"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            className="token-form-input"
          />
        </div>
        <button
          onClick={handleUnstake}
          disabled={loading || !unstakeAmount}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <FiClock />
          <span>Unstake Tokens</span>
        </button>

        <button
          onClick={handleClaimRewards}
          disabled={loading || stakingData.pendingRewards <= 0}
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          <FiActivity />
          <span>Claim Rewards ({stakingData.pendingRewards.toFixed(6)} NST)</span>
        </button>
      </div>

      {/* Auto Compound Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Auto Compound</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Automatically reinvest rewards</div>
        </div>
        <button
          onClick={() => setAutoCompound(!autoCompound)}
          className={`btn ${autoCompound ? 'btn-success' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          {autoCompound ? <FiPlay /> : <FiPause />}
          <span>{autoCompound ? 'Enabled' : 'Disabled'}</span>
        </button>
      </div>

      {/* Earnings Projections */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        borderRadius: '0.5rem', 
        padding: '1rem', 
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiActivity />
          <span>Earnings Projections</span>
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Daily</span>
            <span>{projections.daily.toFixed(6)} NST</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Weekly</span>
            <span>{projections.weekly.toFixed(6)} NST</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Monthly</span>
            <span>{projections.monthly.toFixed(6)} NST</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Yearly</span>
            <span>{projections.yearly.toFixed(6)} NST</span>
          </div>
        </div>
      </div>

      {/* Staking Statistics */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        borderRadius: '0.5rem', 
        padding: '1rem',
        fontSize: '0.875rem'
      }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBarChart2 />
          <span>Staking Statistics</span>
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Total Staked</span>
            <span>{stakingData.totalStaked.toFixed(2)} NST</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Total Stakers</span>
            <span>{stakingData.totalStakers.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStaking;
