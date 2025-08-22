import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiDollarSign, 
  FiSmartphone, 
  FiArrowRight, 
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiShield,
  FiChevronDown,
  FiZap,
  FiWifi,
  FiDroplet,
  FiShoppingCart,
  FiSend,
  FiTrendingUp
} from 'react-icons/fi';

const PayBills = () => {
  const { cryptoWallets, backendService } = useAuth();
  
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
      // Comment out backend test calls for now
      // try {
      //   const bills = await backendService?.getAvailableBills();
      //   setAvailableBills(bills || []);
      // } catch (error) {
      //   console.error('Error loading bills:', error);
      //   // Fallback to mock data if backend fails
      // }
      
      // Use original mock data
      setAvailableBills([
          {
            id: 'mpesa-paybill',
            name: 'M-Pesa Paybill',
            icon: FiSmartphone,
            description: 'Pay bills using M-Pesa',
            paybillNumber: '174379',
            accountType: 'Paybill',
            status: 'active',
            requiresPaybill: true,
            color: '#10b981'
          },
          {
            id: 'electricity',
            name: 'Electricity',
            icon: FiZap,
            description: 'Kenya Power & Lighting Co.',
            paybillNumber: '888888',
            accountType: 'Paybill',
            status: 'active',
            requiresPaybill: true,
            color: '#f59e0b'
          },
          {
            id: 'water',
            name: 'Water Bill',
            icon: FiDroplet,
            description: 'Nairobi Water & Sewerage Co.',
            paybillNumber: '888999',
            accountType: 'Paybill',
            status: 'active',
            requiresPaybill: true,
            color: '#3b82f6'
          },
          {
            id: 'internet',
            name: 'Internet',
            icon: FiWifi,
            description: 'Internet & Data Services',
            paybillNumber: '174379',
            accountType: 'Paybill',
            status: 'active',
            requiresPaybill: true,
            color: '#8b5cf6'
          },
                     {
             id: 'buy-goods',
             name: 'Buy Goods',
            icon: FiShoppingCart,
             description: 'Pay for goods and services',
             paybillNumber: '174379',
             accountType: 'Buy Goods',
             status: 'active',
            requiresPaybill: false,
            color: '#ef4444'
           },
          {
            id: 'send-money',
            name: 'Send Money',
            icon: FiSend,
            description: 'Send money to phone number',
            paybillNumber: '',
            accountType: 'Send Money',
            status: 'active',
            requiresPaybill: false,
            color: '#06b6d4'
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
      
      const rate = await backendService?.getUSDTtoKESRate();
      setConversionRate(rate || 135.50);
      setLastRateUpdate(new Date());
      setRateSource('Live Market Rate');
      
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

    // Additional validation for buy goods
    if (selectedBill.id === 'buy-goods' && !paybillNumber) {
      setError('Please fill in till number');
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
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentStatus('success');
      setTransactionHistory(prev => [{
        id: Date.now(),
        bill: selectedBill.name,
        amount: kesAmount,
        status: 'success',
        timestamp: new Date(),
        recipient: selectedBill.id === 'send-money' ? recipientName : accountNumber
      }, ...prev]);

      // Reset form
      setKesAmount('');
      setUsdtAmount('');
      setWalletCurrencyAmount('');
      setPaybillNumber('');
      setAccountNumber('');
      setRecipientPhone('');
      setRecipientName('');
      setSelectedBill(null);
      setSelectedWallet(null);

    } catch (err) {
      setError('Payment failed. Please try again.');
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Load conversion rate on component mount
  useEffect(() => {
    fetchConversionRate();
  }, []);

    return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <FiDollarSign size={24} />
          Payments & Bills
        </h2>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          margin: 0
        }}>
          Pay bills and send money using your crypto wallets
        </p>
      </div>

      {/* Exchange Rate Card */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                $
              </div>
              Exchange Rate
            </h4>
          <button 
            onClick={fetchConversionRate}
            disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }}
            >
              <FiRefreshCw size={16} style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none' 
              }} />
          </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>USDT/KES Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {conversionRate ? `$${conversionRate.toFixed(2)}` : 'Loading...'}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Last Updated</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {lastRateUpdate ? lastRateUpdate.toLocaleTimeString() : 'Never'}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Source</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {rateSource || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
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
            <FiTrendingUp />
            <span>Make Payment</span>
          </h4>

        {/* Bill Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Select Service
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.75rem' 
            }}>
            {availableBills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                  style={{
                    background: selectedBill?.id === bill.id ? 'white' : 'transparent',
                    border: `1px solid ${selectedBill?.id === bill.id ? bill.color : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBill?.id !== bill.id) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBill?.id !== bill.id) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: `linear-gradient(135deg, ${bill.color} 0%, ${bill.color}dd 100%)`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <bill.icon size={20} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.125rem' }}>
                      {bill.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {bill.description}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Select Wallet
            </label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                {selectedWallet ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: selectedWallet.currency === 'NST' ? '#8b5cf6' : 
                                 selectedWallet.currency === 'ICP' ? '#3b82f6' : '#f59e0b',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {selectedWallet.currency}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        {selectedWallet.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {selectedWallet.balance?.toFixed(4) || '0.0000'} {selectedWallet.currency}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#9ca3af' }}>Choose wallet</span>
                )}
                <FiChevronDown size={16} style={{ 
                  transform: showWalletDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} />
              </div>
              
              {showWalletDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {cryptoWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowWalletDropdown(false);
                        if (kesAmount) {
                          handleKesAmountChange(kesAmount);
                        }
                      }}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: wallet.currency === 'NST' ? '#8b5cf6' : 
                                   wallet.currency === 'ICP' ? '#3b82f6' : '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {wallet.currency}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                          {wallet.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {wallet.balance?.toFixed(4) || '0.0000'} {wallet.currency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Amount (KES)
            </label>
            <input
              type="number"
              value={kesAmount}
              onChange={(e) => handleKesAmountChange(e.target.value)}
              placeholder="Enter amount in KES"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'white'
              }}
            />
        </div>

          {/* Conversion Display */}
          {kesAmount && conversionRate && (
            <div style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem' 
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>KES Amount</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                    {parseFloat(kesAmount).toLocaleString()} KES
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>USDT Equivalent</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                    {usdtAmount} USDT
                  </div>
                </div>
                {selectedWallet && walletCurrencyAmount && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Wallet Amount</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                      {walletCurrencyAmount} {selectedWallet.currency}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paybill Fields */}
         {selectedBill && selectedBill.requiresPaybill && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Paybill Number
                  </label>
                 <input
                   type="text"
                   value={paybillNumber}
                   onChange={(e) => setPaybillNumber(e.target.value)}
                   placeholder="Enter paybill number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                 />
               </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Account Number
                  </label>
                 <input
                   type="text"
                   value={accountNumber}
                   onChange={(e) => setAccountNumber(e.target.value)}
                   placeholder="Enter account number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                 />
               </div>
             </div>
           </div>
         )}

          {/* Buy Goods Fields */}
         {selectedBill && selectedBill.id === 'buy-goods' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Till Number
              </label>
                 <input
                   type="text"
                   value={paybillNumber}
                   onChange={(e) => setPaybillNumber(e.target.value)}
                   placeholder="Enter till number"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              />
           </div>
         )}

          {/* Send Money Fields */}
          {selectedBill && selectedBill.id === 'send-money' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Recipient Phone
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Enter phone number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiXCircle size={16} />
              {error}
                  </div>
                )}

          {/* Success Message */}
          {paymentStatus === 'success' && (
            <div style={{
              padding: '0.75rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              color: '#059669',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiCheckCircle size={16} />
              Payment successful! Transaction has been processed.
              </div>
            )}

          {/* Pay Button */}
                     <button
             onClick={handlePayment}
             disabled={loading || !selectedBill || !selectedWallet || !kesAmount}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading || !selectedBill || !selectedWallet || !kesAmount 
                ? '#e2e8f0' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: loading || !selectedBill || !selectedWallet || !kesAmount 
                ? '#64748b' 
                : 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: loading || !selectedBill || !selectedWallet || !kesAmount 
                ? 'not-allowed' 
                : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
           >
            {loading ? (
              <>
                <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <FiArrowRight size={16} />
                Pay {kesAmount ? `${parseFloat(kesAmount).toLocaleString()} KES` : ''}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
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
              <FiTrendingUp />
              <span>Recent Transactions</span>
            </h4>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {transactionHistory.slice(0, 5).map((transaction) => (
                <div key={transaction.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <FiCheckCircle size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        {transaction.bill}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {transaction.recipient} • {transaction.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                      {transaction.amount} KES
          </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {transaction.status}
                </div>
                </div>
              </div>
            ))}
          </div>
      </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PayBills;
