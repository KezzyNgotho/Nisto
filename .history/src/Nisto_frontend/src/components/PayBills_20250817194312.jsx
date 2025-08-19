import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiCreditCard, 
  FiSmartphone, 
  FiArrowRight, 
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiShield
} from 'react-icons/fi';

const PayBills = ({ auth, backendService }) => {
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(null);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [kesAmount, setKesAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [error, setError] = useState(null);

  const [availableBills, setAvailableBills] = useState([]);

  // Load available bills from backend
  useEffect(() => {
    const loadBills = async () => {
      try {
        const bills = await backendService.getAvailableBills();
        setAvailableBills(bills);
      } catch (error) {
        console.error('Error loading bills:', error);
        // Fallback to mock data if backend fails
        setAvailableBills([
          {
            id: 'mpesa-paybill',
            name: 'Mpesa Paybill',
            icon: FiSmartphone,
            description: 'Pay bills using Mpesa',
            paybillNumber: '174379',
            accountType: 'Paybill',
            status: 'active'
          },
          {
            id: 'electricity',
            name: 'Electricity Bill',
            icon: FiCreditCard,
            description: 'Kenya Power & Lighting Co.',
            paybillNumber: '888888',
            accountType: 'Paybill',
            status: 'active'
          },
          {
            id: 'water',
            name: 'Water Bill',
            icon: FiCreditCard,
            description: 'Nairobi Water & Sewerage Co.',
            paybillNumber: '888999',
            accountType: 'Paybill',
            status: 'active'
          }
        ]);
      }
    };
    
    loadBills();
  }, [backendService]);

  // Fetch USDT to KES conversion rate
  const fetchConversionRate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend service to get conversion rate
      const rate = await backendService.getUSDTtoKESRate();
      setConversionRate(rate);
      
      // Calculate KES amount if USDT amount is set
      if (usdtAmount) {
        const kes = parseFloat(usdtAmount) * rate;
        setKesAmount(kes.toFixed(2));
      }
    } catch (err) {
      setError('Failed to fetch conversion rate. Please try again.');
      console.error('Error fetching conversion rate:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KES amount when USDT amount changes
  const handleUsdtAmountChange = (value) => {
    setUsdtAmount(value);
    if (conversionRate && value) {
      const kes = parseFloat(value) * conversionRate;
      setKesAmount(kes.toFixed(2));
    } else {
      setKesAmount('');
    }
  };

  // Handle bill payment
  const handlePayment = async () => {
    if (!selectedBill || !usdtAmount || !phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');

      // Call backend service to process payment
      const paymentResult = await backendService.processPaybillPayment({
        billId: selectedBill.id,
        usdtAmount: parseFloat(usdtAmount),
        kesAmount: parseFloat(kesAmount),
        phoneNumber,
        paybillNumber: selectedBill.paybillNumber,
        accountReference: selectedBill.name
      });

      setPaymentStatus('success');
      
      // Add to transaction history
      setTransactionHistory(prev => [{
        id: paymentResult.transactionId,
        billName: selectedBill.name,
        usdtAmount: parseFloat(usdtAmount),
        kesAmount: parseFloat(kesAmount),
        phoneNumber,
        status: 'completed',
        timestamp: new Date().toISOString(),
        mpesaReceipt: paymentResult.mpesaReceipt
      }, ...prev]);

      // Reset form
      setUsdtAmount('');
      setKesAmount('');
      setPhoneNumber('');
      setSelectedBill(null);

    } catch (err) {
      setPaymentStatus('failed');
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load conversion rate on component mount
  useEffect(() => {
    fetchConversionRate();
  }, []);

  return (
    <div className="paybills-container">
      {/* Header */}
      <div className="paybills-header">
        <div className="paybills-header-left">
          <div className="paybills-icon">
            <FiCreditCard />
          </div>
          <div>
            <h2 className="paybills-title">Pay Bills</h2>
            <p className="paybills-subtitle">Convert USDT to KES and pay bills via Mpesa</p>
          </div>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={fetchConversionRate}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spin' : ''} />
          Refresh Rate
        </button>
      </div>

      {/* Conversion Rate Display */}
      <div className="conversion-rate-card">
        <div className="conversion-rate-header">
          <FiDollarSign />
          <h3>USDT to KES Conversion</h3>
        </div>
        <div className="conversion-rate-content">
          {conversionRate ? (
            <div className="rate-display">
              <span className="rate-value">1 USDT = {conversionRate.toFixed(2)} KES</span>
              <span className="rate-note">Live rate from Binance API</span>
            </div>
          ) : (
            <div className="rate-loading">
              <FiRefreshCw className="spin" />
              <span>Loading conversion rate...</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form */}
      <div className="payment-form-card">
        <h3>Payment Details</h3>
        
        {/* Bill Selection */}
        <div className="form-group">
          <label>Select Bill</label>
          <div className="bills-grid">
            {availableBills.map((bill) => (
              <div
                key={bill.id}
                className={`bill-option ${selectedBill?.id === bill.id ? 'selected' : ''}`}
                onClick={() => setSelectedBill(bill)}
              >
                <div className="bill-icon">
                  {bill.icon === 'FiSmartphone' ? <FiSmartphone /> : <FiCreditCard />}
                </div>
                <div className="bill-info">
                  <h4>{bill.name}</h4>
                  <p>{bill.description}</p>
                  <span className="paybill-number">Paybill: {bill.paybillNumber}</span>
                </div>
                {selectedBill?.id === bill.id && (
                  <div className="bill-selected">
                    <FiCheckCircle />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label>USDT Amount</label>
          <div className="amount-input-group">
            <input
              type="number"
              value={usdtAmount}
              onChange={(e) => handleUsdtAmountChange(e.target.value)}
              placeholder="Enter USDT amount"
              min="0.01"
              step="0.01"
              className="amount-input"
            />
            <div className="amount-conversion">
              <FiArrowRight />
              <span>{kesAmount ? `${kesAmount} KES` : 'Calculating...'}</span>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label>Mpesa Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254712345678"
            className="phone-input"
          />
          <small>Enter phone number in international format (254...)</small>
        </div>

        {/* Payment Button */}
        <button
          className="btn btn-primary payment-btn"
          onClick={handlePayment}
          disabled={loading || !selectedBill || !usdtAmount || !phoneNumber}
        >
          {loading ? (
            <>
              <FiRefreshCw className="spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <FiSmartphone />
              Pay {kesAmount ? `${kesAmount} KES` : 'Bill'}
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <FiXCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <div className="success-message">
            <FiCheckCircle />
            <span>Payment successful! Check your Mpesa for confirmation.</span>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="transaction-history-card">
        <h3>Recent Transactions</h3>
        {transactionHistory.length === 0 ? (
          <div className="empty-history">
            <FiInfo />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactionHistory.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  <FiCheckCircle />
                </div>
                <div className="transaction-details">
                  <h4>{transaction.billName}</h4>
                  <p>{transaction.usdtAmount} USDT → {transaction.kesAmount} KES</p>
                  <span className="transaction-phone">{transaction.phoneNumber}</span>
                </div>
                <div className="transaction-status">
                  <span className="status-badge success">Completed</span>
                  <span className="transaction-time">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <FiShield />
        <div>
          <h4>Secure Payment Processing</h4>
          <p>All payments are processed securely through Safaricom's Mpesa API with end-to-end encryption.</p>
        </div>
      </div>
    </div>
  );
};

export default PayBills;
