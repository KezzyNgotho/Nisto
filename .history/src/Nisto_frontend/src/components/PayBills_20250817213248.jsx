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
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');

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
            status: 'active',
            requiresPaybill: true
          },
          {
            id: 'electricity',
            name: 'Electricity Bill',
            icon: FiCreditCard,
            description: 'Kenya Power & Lighting Co.',
            paybillNumber: '888888',
            accountType: 'Paybill',
            status: 'active',
            requiresPaybill: true
          },
          {
            id: 'water',
            name: 'Water Bill',
            icon: FiCreditCard,
            description: 'Nairobi Water & Sewerage Co.',
            paybillNumber: '888999',
            accountType: 'Paybill',
            status: 'active',
            requiresPaybill: true
          },
                     {
             id: 'buy-goods',
             name: 'Buy Goods',
             icon: FiCreditCard,
             description: 'Pay for goods and services',
             paybillNumber: '174379',
             accountType: 'Buy Goods',
             status: 'active',
             requiresPaybill: false
           },
          {
            id: 'send-money',
            name: 'Send Money',
            icon: FiSmartphone,
            description: 'Send money to phone number',
            paybillNumber: '',
            accountType: 'Send Money',
            status: 'active',
            requiresPaybill: false
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
    // Validate required fields based on bill type
    if (!selectedBill || !selectedWallet || !kesAmount) {
      setError('Please fill in all required fields');
      return;
    }

    // Additional validation for paybill bills
    if (selectedBill.requiresPaybill && (!paybillNumber || !accountNumber)) {
      setError('Please fill in paybill number and account number');
      return;
    }

    // Additional validation for send money
    if (selectedBill.id === 'send-money' && (!recipientPhone || !recipientName)) {
      setError('Please fill in recipient phone and name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');

      const paymentData = {
        billId: selectedBill.id,
        walletId: selectedWallet.id,
        walletCurrency: selectedWallet.currency,
        walletAmount: parseFloat(walletCurrencyAmount),
        usdtAmount: parseFloat(usdtAmount),
        kesAmount: parseFloat(kesAmount),
        phoneNumber,
        paybillNumber: selectedBill.requiresPaybill ? paybillNumber : selectedBill.paybillNumber,
        accountReference: selectedBill.requiresPaybill ? accountNumber : selectedBill.name
      };

      // Add additional fields based on bill type
      if (selectedBill.id === 'send-money') {
        paymentData.recipientPhone = recipientPhone;
        paymentData.recipientName = recipientName;
      }

      const paymentResult = await backendService.processPaybillPayment(paymentData);

      setPaymentStatus('success');
      await loadTransactionHistory();

      // Reset form
      setKesAmount('');
      setUsdtAmount('');
      setWalletCurrencyAmount('');
      setPhoneNumber('');
      setPaybillNumber('');
      setAccountNumber('');
      setRecipientPhone('');
      setRecipientName('');
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

      {/* Payment Form */}
      <div className="payment-form">
        {/* Bill Selection */}
        <div className="form-section">
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
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Selection */}
        <div className="form-section">
          <div className="form-group">
            <label>Wallet</label>
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
                  <span className="placeholder">Choose wallet</span>
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
        </div>

                 {/* Paybill Fields - Show only for paybill bills */}
         {selectedBill && selectedBill.requiresPaybill && (
           <div className="form-section">
             <div className="form-row">
               <div className="form-group">
                 <label>Paybill Number</label>
                 <input
                   type="text"
                   value={paybillNumber}
                   onChange={(e) => setPaybillNumber(e.target.value)}
                   placeholder="Enter paybill number"
                   className="paybill-input"
                 />
               </div>
               <div className="form-group">
                 <label>Account Number</label>
                 <input
                   type="text"
                   value={accountNumber}
                   onChange={(e) => setAccountNumber(e.target.value)}
                   placeholder="Enter account number"
                   className="account-input"
                 />
               </div>
             </div>
           </div>
         )}

         {/* Buy Goods Fields - Show only for buy goods */}
         {selectedBill && selectedBill.id === 'buy-goods' && (
           <div className="form-section">
             <div className="form-row">
               <div className="form-group">
                 <label>Till Number</label>
                 <input
                   type="text"
                   value={paybillNumber}
                   onChange={(e) => setPaybillNumber(e.target.value)}
                   placeholder="Enter till number"
                   className="paybill-input"
                 />
               </div>
             </div>
           </div>
         )}

                                   {/* Send Money Fields - Show only for send money */}
          {selectedBill && selectedBill.id === 'send-money' && (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Phone</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="254712345678"
                    className="recipient-phone-input"
                  />
                </div>
                <div className="form-group">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="recipient-name-input"
                  />
                </div>
              </div>
            </div>
          )}

        {/* Amount */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Amount (KES)</label>
              <div className="amount-input">
                <input
                  type="number"
                  value={kesAmount}
                  onChange={(e) => handleKesAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                />
                {usdtAmount && (
                  <div className="conversion-display">
                    <span>{usdtAmount} USDT</span>
                  </div>
                )}
              </div>
            </div>

            {selectedWallet && walletCurrencyAmount && (
              <div className="form-group">
                <label>Amount ({selectedWallet.currency})</label>
                <div className="wallet-amount">
                  <span>{walletCurrencyAmount} {selectedWallet.currency}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Button */}
        <div className="form-section">
                     <button
             className="btn btn-primary payment-btn"
             onClick={handlePayment}
             disabled={loading || !selectedBill || !selectedWallet || !kesAmount}
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

        {/* Messages */}
        {error && (
          <div className="error-message">
            <FiXCircle />
            <span>{error}</span>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="success-message">
            <FiCheckCircle />
            <span>Payment successful!</span>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <h3>Recent Transactions</h3>
        {transactionHistory.length === 0 ? (
          <div className="empty-history">
            <FiInfo />
            <span>No transactions yet</span>
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
