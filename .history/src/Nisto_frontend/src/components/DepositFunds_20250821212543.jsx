import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiSmartphone, 
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiArrowRight
} from 'react-icons/fi';

const DepositFunds = ({ backendService }) => {
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(null);
  const [kesAmount, setKesAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [depositStatus, setDepositStatus] = useState(null);
  const [error, setError] = useState(null);
  const [lastRateUpdate, setLastRateUpdate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch USDT to KES conversion rate
  const fetchConversionRate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rate = await backendService.getUSDTtoKESRate();
      setConversionRate(rate);
      setLastRateUpdate(new Date());
      
      // Recalculate amounts if KES amount is set
      if (kesAmount) {
        handleKesAmountChange(kesAmount);
      }
    } catch (err) {
      setError('Failed to fetch conversion rate. Please try again.');
      console.error('Error fetching conversion rate:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate USDT amount when KES amount changes
  const handleKesAmountChange = (value) => {
    setKesAmount(value);
    if (conversionRate && value) {
      const kes = parseFloat(value);
      const usdt = kes / conversionRate;
      setUsdtAmount(usdt.toFixed(6));
    } else {
      setUsdtAmount('');
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!kesAmount || !phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(kesAmount) < 10) {
      setError('Minimum deposit amount is 10 KES');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDepositStatus('processing');

      const depositData = {
        kesAmount: parseFloat(kesAmount),
        usdtAmount: parseFloat(usdtAmount),
        phoneNumber,
        conversionRate
      };

      const depositResult = await backendService.initiateMpesaDeposit(depositData);

      setDepositStatus('success');
      setIsModalOpen(false);
      
      // Reset form
      setKesAmount('');
      setUsdtAmount('');
      setPhoneNumber('');

    } catch (err) {
      setDepositStatus('failed');
      setError(err.message || 'Deposit failed. Please try again.');
      console.error('Deposit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load conversion rate on component mount
  useEffect(() => {
    fetchConversionRate();
    
    // Auto-refresh conversion rate every 30 seconds
    const rateInterval = setInterval(() => {
      fetchConversionRate();
    }, 30000);
    
    return () => clearInterval(rateInterval);
  }, []);

  return (
    <div className="deposit-container">
      <button 
        onClick={() => setIsModalOpen(true)} 
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s'
        }}
      >
        <FiSmartphone size={16} /> 
        Deposit
      </button>
      
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }} 
        onClick={() => !loading && setIsModalOpen(false)}
        >
          <div style={{ 
            background: 'white', 
            borderRadius: '1rem', 
            width: '400px', 
            maxWidth: '90vw', 
            padding: '2rem', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
            border: '1px solid #e2e8f0'
          }} 
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiDollarSign style={{ color: '#2563eb' }} />
                <span>Deposit Funds</span>
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Convert KES to USDT and deposit to your wallet
              </p>
            </div>

            {/* Rate Display */}
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              marginBottom: '2rem',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '500' }}>
                1 USDT = {conversionRate ? conversionRate.toFixed(2) : '...'} KES
              </div>
              <button 
                onClick={fetchConversionRate}
                disabled={loading}
                style={{
                  padding: '0.5rem',
                  backgroundColor: loading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiRefreshCw style={{ 
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                  fontSize: '0.875rem'
                }} />
              </button>
            </div>

            {/* Deposit Form */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Amount Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Amount (KES)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={kesAmount}
                      onChange={(e) => handleKesAmountChange(e.target.value)}
                      placeholder="Enter amount in KES"
                      min="10"
                      step="1"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    {usdtAmount && (
                      <div style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.75rem',
                        color: '#10b981',
                        fontWeight: '600',
                        backgroundColor: '#f0fdf4',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #bbf7d0'
                      }}>
                        {usdtAmount} USDT
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
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
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                color: '#991b1b',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                border: '1px solid #fecaca'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiXCircle />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {depositStatus === 'success' && (
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#ecfdf5',
                borderLeft: '4px solid #10b981',
                color: '#065f46',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiCheckCircle />
                  <span>STK Push sent! Check your phone for Mpesa prompt</span>
                </div>
              </div>
            )}

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={loading || !kesAmount || !phoneNumber}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading || !kesAmount || !phoneNumber ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading || !kesAmount || !phoneNumber ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              {loading ? (
                <>
                  <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <FiSmartphone />
                  Deposit {kesAmount ? `${kesAmount} KES` : 'Funds'}
                </>
              )}
            </button>

            {/* Info Section */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.75rem' }}>
                Important Information:
              </div>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiInfo size={12} />
                  <span>Minimum deposit: 10 KES</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiInfo size={12} />
                  <span>Funds will be converted to USDT at current market rate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiInfo size={12} />
                  <span>USDT will be added to your Nisto wallet after confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositFunds;
