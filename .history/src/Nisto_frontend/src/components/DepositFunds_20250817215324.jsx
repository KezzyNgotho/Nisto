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
      {/* Header */}
      <div className="deposit-header">
        <h2>Deposit Funds</h2>
        <div className="rate-display">
          <span>1 USDT = {conversionRate ? conversionRate.toFixed(2) : '...'} KES</span>
          <button 
            className="btn btn-text"
            onClick={fetchConversionRate}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="deposit-form">
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Amount (KES)</label>
              <div className="amount-input">
                <input
                  type="number"
                  value={kesAmount}
                  onChange={(e) => handleKesAmountChange(e.target.value)}
                  placeholder="Enter amount in KES"
                  min="10"
                  step="1"
                />
                {usdtAmount && (
                  <div className="conversion-display">
                    <span>{usdtAmount} USDT</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="phone-input"
              />
            </div>
          </div>
        </div>

        {/* Deposit Button */}
        <div className="form-section">
          <button
            className="btn btn-primary deposit-btn"
            onClick={handleDeposit}
            disabled={loading || !kesAmount || !phoneNumber}
          >
            {loading ? (
              <>
                <FiRefreshCw className="spin" />
                Processing...
              </>
            ) : (
              <>
                <FiSmartphone />
                Deposit {kesAmount ? `${kesAmount} KES` : 'Funds'}
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="error-message">
            <FiXCircle />
            <span>{error}</span>
          </div>
        )}

        {depositStatus === 'success' && (
          <div className="success-message">
            <FiCheckCircle />
            <span>STK Push sent! Check your phone for Mpesa prompt</span>
          </div>
        )}

        {/* Info */}
        <div className="info-section">
          <div className="info-item">
            <FiInfo />
            <span>Minimum deposit: 10 KES</span>
          </div>
          <div className="info-item">
            <FiInfo />
            <span>Funds will be converted to USDT at current market rate</span>
          </div>
          <div className="info-item">
            <FiInfo />
            <span>USDT will be added to your Nisto wallet after confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositFunds;
