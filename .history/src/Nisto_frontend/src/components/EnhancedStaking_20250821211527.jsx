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
    <div className="token-form" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <h3>
        <FiTrendingUp style={{ color: '#2563eb' }} />
        <span>Enhanced Staking</span>
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

      {/* APY Highlight Card */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '2.5rem',
          color: '#166534',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              fontSize: '0.875rem', 
              opacity: 0.8, 
              marginBottom: '0.75rem',
              fontWeight: '500',
              letterSpacing: '0.05em'
            }}>
              ANNUAL STAKING REWARD
            </div>
            <div style={{ 
              fontSize: '4rem', 
              fontWeight: '800', 
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em'
            }}>
              {APY}%
            </div>
            <div style={{ 
              fontSize: '1rem', 
              opacity: 0.8,
              fontWeight: '400',
              letterSpacing: '0.02em'
            }}>
              Annual Percentage Yield
            </div>
          </div>
        </div>
      </div>

      {/* Staking Stats */}
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
            <FiBarChart2 />
            <span>Your Staking Overview</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Staked Amount</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {stakingData.stakedAmount.toFixed(6)} NST
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Pending Rewards</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#10b981' }}>
                {stakingData.pendingRewards.toFixed(6)} NST
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Total Earned</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {stakingData.totalRewardsEarned.toFixed(6)} NST
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Status</div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: stakingData.isStaking ? '#10b981' : '#64748b'
              }}>
                {stakingData.isStaking ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Actions */}
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
            <FiZap />
            <span>Staking Actions</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Stake */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                Stake Amount (NST)
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleStake}
                disabled={loading || !stakeAmount}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading || !stakeAmount ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading || !stakeAmount ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiZap size={16} />
                <span>Stake Tokens</span>
              </button>
            </div>

            {/* Unstake */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                Unstake Amount (NST)
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleUnstake}
                disabled={loading || !unstakeAmount}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading || !unstakeAmount ? '#94a3b8' : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading || !unstakeAmount ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiClock size={16} />
                <span>Unstake Tokens</span>
              </button>
            </div>

            {/* Claim Rewards */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                Available to Claim
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#10b981', 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
                border: '1px solid #bbf7d0'
              }}>
                {stakingData.pendingRewards.toFixed(6)} NST
              </div>
              <button
                onClick={handleClaimRewards}
                disabled={loading || stakingData.pendingRewards <= 0}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading || stakingData.pendingRewards <= 0 ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading || stakingData.pendingRewards <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiActivity size={16} />
                <span>Claim Rewards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Compound Toggle */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                Auto Compound
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Automatically reinvest rewards for compound growth
              </div>
            </div>
            <button
              onClick={() => setAutoCompound(!autoCompound)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: autoCompound ? '#10b981' : '#64748b',
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
              {autoCompound ? <FiPlay size={16} /> : <FiPause size={16} />}
              <span>{autoCompound ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Projections */}
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
            <FiActivity />
            <span>Earnings Projections</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Daily', value: projections.daily, color: '#3b82f6' },
              { label: 'Weekly', value: projections.weekly, color: '#8b5cf6' },
              { label: 'Monthly', value: projections.monthly, color: '#10b981' },
              { label: 'Yearly', value: projections.yearly, color: '#f59e0b' }
            ].map((projection, index) => (
              <div key={index} style={{ 
                backgroundColor: 'white', 
                padding: '1rem', 
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  {projection.label}
                </div>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: projection.color
                }}>
                  {projection.value.toFixed(6)} NST
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Statistics */}
      <div>
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
            <FiTarget />
            <span>Global Statistics</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Total Staked
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                {stakingData.totalStaked.toFixed(2)} NST
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Total Stakers
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                {stakingData.totalStakers.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStaking;
