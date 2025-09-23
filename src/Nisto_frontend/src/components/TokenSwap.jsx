import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiRefreshCw, FiSettings, FiArrowRight, FiTrendingUp, FiAlertCircle, FiInfo } from 'react-icons/fi';

const TokenSwap = () => {
  const auth = useAuth();
  const [swapData, setSwapData] = useState({
    fromToken: 'NST',
    toToken: 'ICP',
    fromAmount: '',
    toAmount: ''
  });
  const [balances, setBalances] = useState({
    nst: 0,
    icp: 0
  });
  const [settings, setSettings] = useState({
    slippageTolerance: 0.5,
    transactionDeadline: 20,
    expertMode: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load balances
  const loadBalances = useCallback(async () => {
    if (!auth?.principal || !auth?.backendService) return;
    
    try {
      const [nstBalance, icpBalance] = await Promise.all([
        auth.backendService.balanceOf(auth.principal),
        auth.backendService.getUserCryptoWallets()
      ]);
      
      setBalances({
        nst: Number(nstBalance) / 100000000,
        icp: icpBalance?.icp || 0
      });
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  }, [auth?.principal, auth?.backendService, swapData.fromToken, swapData.toToken]);

  // Calculate swap amounts
  const calculateSwap = useCallback((amount, fromToken, toToken) => {
    if (!amount || amount <= 0) return '';
    
    // Mock exchange rate (1 NST = 0.1 ICP)
    const rate = fromToken === 'NST' ? 0.1 : 10;
    return (amount * rate).toFixed(6);
  }, []);

  // Handle amount changes
  const handleFromAmountChange = (value) => {
    setSwapData(prev => ({
      ...prev,
      fromAmount: value,
      toAmount: calculateSwap(value, prev.fromToken, prev.toToken)
    }));
  };

  const handleToAmountChange = (value) => {
    setSwapData(prev => ({
      ...prev,
      toAmount: value,
      fromAmount: calculateSwap(value, prev.toToken, prev.fromToken)
    }));
  };

  // Switch tokens
  const switchTokens = () => {
    setSwapData(prev => ({
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount
    }));
  };

  // Execute swap
  const executeSwap = async () => {
    if (!swapData.fromAmount || !swapData.toAmount) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSwapData({ fromToken: 'NST', toToken: 'ICP', fromAmount: '', toAmount: '' });
      await loadBalances();
    } catch (error) {
      setError('Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load balances on mount
  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const maxFromAmount = swapData.fromToken === 'NST' ? balances.nst : balances.icp;
  const price = swapData.fromToken === 'NST' ? 0.1 : 10;
  const priceImpact = 0.02; // 2%
  const networkFee = 0.001; // 0.001 ICP
  const minimumReceived = swapData.toAmount ? (Number(swapData.toAmount) * (1 - settings.slippageTolerance / 100)).toFixed(6) : '0';

  return (
    <div className="token-form" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3>
          <FiRefreshCw style={{ color: '#2563eb' }} />
          <span>Swap Tokens</span>
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-text"
          style={{ padding: '0.5rem' }}
        >
          <FiSettings />
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Swap Settings</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="token-form-group">
                <label className="token-form-label">Slippage Tolerance (%)</label>
                <input
                  type="number"
                  value={settings.slippageTolerance}
                  onChange={(e) => setSettings(prev => ({ ...prev, slippageTolerance: Number(e.target.value) }))}
                  className="token-form-input"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
              </div>
              
              <div className="token-form-group">
                <label className="token-form-label">Transaction Deadline (minutes)</label>
                <input
                  type="number"
                  value={settings.transactionDeadline}
                  onChange={(e) => setSettings(prev => ({ ...prev, transactionDeadline: Number(e.target.value) }))}
                  className="token-form-input"
                  min="1"
                  max="60"
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'end' }}>
                <input
                  type="checkbox"
                  id="expertMode"
                  checked={settings.expertMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, expertMode: e.target.checked }))}
                />
                <label htmlFor="expertMode" style={{ fontSize: '0.875rem' }}>Expert Mode</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Token Inputs in One Row */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          gap: '1rem', 
          alignItems: 'end',
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          {/* From Token */}
          <div>
            <label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#64748b', 
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              From
            </label>
            <div style={{ 
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <input
                type="number"
                placeholder="0.0"
                value={swapData.fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 4rem 1rem 1rem',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  backgroundColor: 'transparent'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                right: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {swapData.fromToken}
                </span>
                <button
                  onClick={() => handleFromAmountChange(maxFromAmount.toString())}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  MAX
                </button>
              </div>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748b', 
              marginTop: '0.5rem',
              fontWeight: '500'
            }}>
              Balance: {maxFromAmount.toFixed(6)} {swapData.fromToken}
            </div>
          </div>

          {/* Switch Button */}
          <button
            onClick={switchTokens}
            style={{
              padding: '0.75rem',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e2e8f0';
              e.target.style.color = '#475569';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.color = '#64748b';
            }}
          >
            <FiArrowRight size={16} />
          </button>

          {/* To Token */}
          <div>
            <label style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#64748b', 
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              To
            </label>
            <div style={{ 
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <input
                type="number"
                placeholder="0.0"
                value={swapData.toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 4rem 1rem 1rem',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  backgroundColor: 'transparent'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                right: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)' 
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {swapData.toToken}
                </span>
              </div>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748b', 
              marginTop: '0.5rem',
              fontWeight: '500'
            }}>
              Balance: {(swapData.toToken === 'ICP' ? balances.icp : balances.nst).toFixed(6)} {swapData.toToken}
            </div>
          </div>
        </div>
      </div>

      {/* Swap Details */}
      {swapData.fromAmount && swapData.toAmount && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            fontSize: '0.875rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Swap Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Price</span>
                <span style={{ fontWeight: '500' }}>1 {swapData.fromToken} = {price} {swapData.toToken}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Price Impact</span>
                <span style={{ color: priceImpact > 1 ? '#dc2626' : '#64748b', fontWeight: '500' }}>{priceImpact}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Network Fee</span>
                <span style={{ fontWeight: '500' }}>{networkFee} ICP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Minimum Received</span>
                <span style={{ fontWeight: '500' }}>{minimumReceived} {swapData.toToken}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={executeSwap}
          disabled={loading || !swapData.fromAmount || !swapData.toAmount || Number(swapData.fromAmount) > maxFromAmount}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            backgroundColor: loading || !swapData.fromAmount || !swapData.toAmount || Number(swapData.fromAmount) > maxFromAmount ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: loading || !swapData.fromAmount || !swapData.toAmount || Number(swapData.fromAmount) > maxFromAmount ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading && swapData.fromAmount && swapData.toAmount && Number(swapData.fromAmount) <= maxFromAmount) {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && swapData.fromAmount && swapData.toAmount && Number(swapData.fromAmount) <= maxFromAmount) {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {loading ? (
            <>
              <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
              <span>Swapping...</span>
            </>
          ) : (
            <>
              <FiTrendingUp />
              <span>Swap {swapData.fromToken} for {swapData.toToken}</span>
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            color: '#991b1b',
            fontSize: '0.875rem',
            border: '1px solid #fecaca'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div style={{
          padding: '1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          color: '#1e40af',
          fontSize: '0.875rem',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiInfo />
            <span>Swaps are executed instantly with minimal slippage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSwap;
