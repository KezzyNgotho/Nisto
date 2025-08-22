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
    <div className="token-form">
      {/* Row 1: Header and Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
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

      {/* Row 2: Settings (Conditional) */}
      {showSettings && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Swap Settings</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

      {/* Row 3: From and To Tokens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
        {/* From Token */}
        <div className="token-form-group">
          <label className="token-form-label">From</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              placeholder="0.0"
              value={swapData.fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="token-form-input"
              style={{ paddingRight: '4rem' }}
            />
            <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{swapData.fromToken}</span>
              <button
                onClick={() => handleFromAmountChange(maxFromAmount.toString())}
                className="btn btn-text"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                MAX
              </button>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Balance: {maxFromAmount.toFixed(6)} {swapData.fromToken}
          </div>
        </div>

        {/* Switch Button */}
        <button
          onClick={switchTokens}
          className="btn btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '50%', width: '2.5rem', height: '2.5rem', alignSelf: 'center' }}
        >
          <FiArrowRight />
        </button>

        {/* To Token */}
        <div className="token-form-group">
          <label className="token-form-label">To</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              placeholder="0.0"
              value={swapData.toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              className="token-form-input"
              style={{ paddingRight: '4rem' }}
            />
            <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{swapData.toToken}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Balance: {(swapData.toToken === 'ICP' ? balances.icp : balances.nst).toFixed(6)} {swapData.toToken}
          </div>
        </div>
      </div>

      {/* Row 4: Swap Details and Button */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start', marginBottom: '1rem' }}>
        {/* Swap Details */}
        {swapData.fromAmount && swapData.toAmount && (
          <div style={{ 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem', 
            padding: '1rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Price</span>
                <span>1 {swapData.fromToken} = {price} {swapData.toToken}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Price Impact</span>
                <span style={{ color: priceImpact > 1 ? '#dc2626' : '#6b7280' }}>{priceImpact}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Network Fee</span>
                <span>{networkFee} ICP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Minimum Received</span>
                <span>{minimumReceived} {swapData.toToken}</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={executeSwap}
          disabled={loading || !swapData.fromAmount || !swapData.toAmount || Number(swapData.fromAmount) > maxFromAmount}
          className="btn btn-primary"
          style={{ height: 'fit-content', minHeight: '3rem' }}
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

      {/* Row 5: Error and Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Error Display */}
        {error && (
          <div style={{
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

        {/* Info */}
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          color: '#1e40af',
          fontSize: '0.875rem'
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
