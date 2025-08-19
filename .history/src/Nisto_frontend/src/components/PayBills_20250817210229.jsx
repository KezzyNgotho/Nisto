import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiDollarSign, 
  FiCreditCard, 
  FiSmartphone, 
  FiArrowRight, 
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiShield,
  FiChevronDown
} from 'react-icons/fi';

const PayBills = ({ auth, backendService }) => {
  const { cryptoWallets } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(null);
  const [lastRateUpdate, setLastRateUpdate] = useState(null);
  const [rateSource, setRateSource] = useState(null);
  const [kesAmount, setKesAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [walletCurrencyAmount, setWalletCurrencyAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

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
      
      const rate = await backendService.getUSDTtoKESRate();
      setConversionRate(rate);
      setLastRateUpdate(new Date());
      
      // Determine rate source
      if (rate === 135.50) {
        setRateSource('Fallback Rate (Estimated)');
      } else {
        setRateSource('Live Market Rate (Real-time)');
      }
      
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

  // Calculate amounts when KES amount changes
  const handleKesAmountChange = (value) => {
    setKesAmount(value);
    if (conversionRate && value) {
      const kes = parseFloat(value);
      
      // Calculate USDT amount
      const usdt = kes / conversionRate;
      setUsdtAmount(usdt.toFixed(6));
      
      // Calculate wallet currency amount if wallet is selected
      if (selectedWallet) {
        const walletAmount = calculateWalletCurrencyAmount(kes, selectedWallet.currency);
        setWalletCurrencyAmount(walletAmount);
      }
    } else {
      setUsdtAmount('');
      setWalletCurrencyAmount('');
    }
  };

  // Calculate wallet currency amount based on KES
  const calculateWalletCurrencyAmount = (kesAmount, currency) => {
    if (!conversionRate) return '';
    
    // First convert KES to USDT
    const usdtAmount = kesAmount / conversionRate;
    
    // Then convert USDT to wallet currency (simplified for now)
    switch (currency) {
      case 'ckBTC':
        const btcRate = 45000;
        return (usdtAmount / btcRate).toFixed(8);
      case 'ckETH':
        const ethRate = 3000;
        return (usdtAmount / ethRate).toFixed(6);
      case 'ICP':
        const icpRate = 12;
        return (usdtAmount / icpRate).toFixed(4);
      default:
        return usdtAmount.toFixed(2);
    }
  };

  // Handle bill payment
  const handlePayment = async () => {
    if (!selectedBill || !selectedWallet || !kesAmount || !phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');

      const paymentResult = await backendService.processPaybillPayment({
        billId: selectedBill.id,
        walletId: selectedWallet.id,
        walletCurrency: selectedWallet.currency,
        walletAmount: parseFloat(walletCurrencyAmount),
        usdtAmount: parseFloat(usdtAmount),
        kesAmount: parseFloat(kesAmount),
        phoneNumber,
        paybillNumber: selectedBill.paybillNumber,
        accountReference: selectedBill.name
      });

      setPaymentStatus('success');
      await loadTransactionHistory();

      // Reset form
      setKesAmount('');
      setUsdtAmount('');
      setWalletCurrencyAmount('');
      setPhoneNumber('');
      setSelectedBill(null);
      setSelectedWallet(null);

    } catch (err) {
      setPaymentStatus('failed');
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load conversion rate and transaction history on component mount
  useEffect(() => {
    fetchConversionRate();
    loadTransactionHistory();
    
    // Auto-refresh conversion rate every 30 seconds
    const rateInterval = setInterval(() => {
      fetchConversionRate();
    }, 30000);
    
    return () => clearInterval(rateInterval);
  }, []);

  // Load transaction history from backend
  const loadTransactionHistory = async () => {
    try {
      const history = await backendService.getPaybillTransactionHistory();
      setTransactionHistory(history.map(transaction => ({
        id: transaction.id,
        billName: availableBills.find(bill => bill.id === transaction.billId)?.name || 'Unknown Bill',
        usdtAmount: transaction.usdtAmount,
        kesAmount: transaction.kesAmount,
        phoneNumber: transaction.phoneNumber,
        status: transaction.status,
        timestamp: new Date(transaction.createdAt / 1000000).toISOString(),
        mpesaReceipt: transaction.mpesaReceipt?.[0] || null
      })));
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  return (
    <div className="paybills-container">
      {/* Header */}
      <div className="paybills-header">
        <h2>Pay Bills</h2>
        <button 
          className="btn btn-secondary"
          onClick={fetchConversionRate}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spin' : ''} />
          Refresh Rate
        </button>
      </div>

      {/* Conversion Rate */}
      <div className="conversion-rate-card">
        <div className="rate-display">
          <span className="rate-value">1 USDT = {conversionRate ? conversionRate.toFixed(2) : '...'} KES</span>
          <span className="rate-source">{rateSource || 'Loading...'}</span>
        </div>
      </div>

            {/* Payment Form */}
      <div className="payment-form">
        <div className="form-row">
          {/* Bill Selection */}
          <div className="form-group">
            <label>Select Bill</label>
            <div className="bills-row">
              {availableBills.map((bill) => (
                <div
                  key={bill.id}
                  className={`bill-option ${selectedBill?.id === bill.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBill(bill)}
                >
                  <div className="bill-icon">
                    {bill.icon === 'FiSmartphone' ? <FiSmartphone /> : <FiCreditCard />}
                  </div>
                  <div className="bill-label">{bill.name}</div>
                  {selectedBill?.id === bill.id && <div className="bill-selected-indicator" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          {/* Wallet Selection */}
          <div className="form-group">
            <label>Select Wallet</label>
            <div className="wallet-dropdown">
              <div 
                className="wallet-selector"
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              >
                {selectedWallet ? (
                  <div className="selected-wallet">
                    <span className="wallet-name">{selectedWallet.name}</span>
                    <span className="wallet-balance">{selectedWallet.balance} {selectedWallet.currency}</span>
                  </div>
                ) : (
                  <span className="placeholder">Choose a wallet</span>
                )}
                <FiChevronDown className={`dropdown-arrow ${showWalletDropdown ? 'up' : ''}`} />
              </div>
              
              {showWalletDropdown && (
                <div className="wallet-options">
                  {cryptoWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="wallet-option"
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowWalletDropdown(false);
                        if (kesAmount) {
                          handleKesAmountChange(kesAmount);
                        }
                      }}
                    >
                      <div className="wallet-info">
                        <span className="wallet-name">{wallet.name}</span>
                        <span className="wallet-balance">{wallet.balance} {wallet.currency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          </div>
        </div>

        <div className="form-row">
          {/* Amount Input */}
          <div className="form-group">
            <label>KES Amount</label>
            <div className="amount-input">
              <input
                type="number"
                value={kesAmount}
                onChange={(e) => handleKesAmountChange(e.target.value)}
                placeholder="Enter amount in KES"
                min="1"
                step="1"
              />
              {usdtAmount && (
                <div className="conversion-display">
                  <FiArrowRight />
                  <span>{usdtAmount} USDT</span>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Currency Amount */}
          {selectedWallet && walletCurrencyAmount && (
            <div className="form-group">
              <label>Amount in {selectedWallet.currency}</label>
              <div className="wallet-amount">
                <span>{walletCurrencyAmount} {selectedWallet.currency}</span>
                <span className="available">Available: {selectedWallet.balance} {selectedWallet.currency}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Button */}
        <div className="form-row">
          <button
            className="btn btn-primary payment-btn"
            onClick={handlePayment}
            disabled={loading || !selectedBill || !selectedWallet || !kesAmount || !phoneNumber}
          >
            {loading ? (
              <>
                <FiRefreshCw className="spin" />
                Processing...
              </>
            ) : (
              <>
                <FiSmartphone />
                Pay {kesAmount ? `${kesAmount} KES` : 'Bill'}
              </>
            )}
          </button>
        </div>

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
      <div className="transaction-history">
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
                <div className="transaction-info">
                  <h4>{transaction.billName}</h4>
                  <p>{transaction.usdtAmount} USDT → {transaction.kesAmount} KES</p>
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
    </div>
  );
};

export default PayBills;
