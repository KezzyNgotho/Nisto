import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { handleError, handleSuccess } from '../utils/errorHandler';
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
  FiTrendingUp,
  FiCreditCard,
  FiHome,
  FiTruck,
  FiBook,
  FiHeart,
  FiGift,
  FiCamera,
  FiMusic,
  FiTv,
  FiPhone,
  FiMail,
  FiUser,
  FiHash,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiTag,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiX
} from 'react-icons/fi';

const PayBills = () => {
  const { cryptoWallets, backendService } = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();
  
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
  const [tillNumber, setTillNumber] = useState('');
  const [reference, setReference] = useState('');
  const [network, setNetwork] = useState('');
  const [bundleType, setBundleType] = useState('');

  // Load available bills from backend
  useEffect(() => {
    const loadBills = async () => {
      try {
        const bills = await backendService?.getAvailableBills();
        setAvailableBills(bills || []);
      } catch (error) {
        handleError(error, 'payment', showToast);
        // Fallback to mock data if backend fails
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
                                color: theme.colors.success,
            fields: ['paybillNumber', 'accountNumber'],
            serviceIcon: '📱'
          },
          {
            id: 'buy-goods',
            name: 'Buy Goods',
            icon: FiShoppingCart,
            description: 'Pay for goods and services using Till Number',
            paybillNumber: '174379',
            accountType: 'Till',
            status: 'active',
            requiresPaybill: false,
            color: '#ef4444',
            fields: ['tillNumber', 'reference'],
            serviceIcon: '🛒'
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
            color: '#06b6d4',
            fields: ['recipientPhone', 'recipientName', 'reference'],
            serviceIcon: '💸'
          },
          {
            id: 'airtime',
            name: 'Airtime',
            icon: FiPhone,
            description: 'Buy airtime for any network',
            paybillNumber: '',
            accountType: 'Airtime',
            status: 'active',
            requiresPaybill: false,
            color: '#ec4899',
            fields: ['phoneNumber', 'network'],
            serviceIcon: '📞'
          },
          {
            id: 'data-bundle',
            name: 'Data Bundle',
            icon: FiWifi,
            description: 'Buy internet data bundles',
            paybillNumber: '',
            accountType: 'Data Bundle',
            status: 'active',
            requiresPaybill: false,
            color: '#8b5cf6',
            fields: ['phoneNumber', 'bundleType'],
            serviceIcon: '📶'
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
      const errorMessage = handleError(err, 'payment', showToast);
      setError(errorMessage);
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

    // Validate based on specific service type
    switch (selectedBill.id) {
      case 'mpesa-paybill':
        if (!paybillNumber || !accountNumber) {
          setError('Please fill in paybill number and account number');
          return;
        }
        break;
      
      case 'buy-goods':
        if (!tillNumber || !reference) {
          setError('Please fill in till number and reference');
          return;
        }
        break;
      
      case 'send-money':
        if (!recipientPhone || !recipientName) {
          setError('Please fill in recipient phone number and name');
          return;
        }
        break;
      
      case 'airtime':
        if (!phoneNumber || !network) {
          setError('Please fill in phone number and select network');
          return;
        }
        break;
      
      case 'data-bundle':
        if (!phoneNumber || !bundleType) {
          setError('Please fill in phone number and select bundle type');
          return;
        }
        break;
      
      default:
        setError('Invalid service selected');
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

      // Show success message
      handleSuccess('bill', 'payment', showToast, `${selectedBill.name} payment completed successfully!`);

      // Reset form
      setKesAmount('');
      setUsdtAmount('');
      setWalletCurrencyAmount('');
      setPaybillNumber('');
      setAccountNumber('');
      setRecipientPhone('');
      setRecipientName('');
      setTillNumber('');
      setReference('');
      setPhoneNumber('');
      setNetwork('');
      setBundleType('');
      setSelectedBill(null);
      setSelectedWallet(null);

    } catch (err) {
      const errorMessage = handleError(err, 'payment', showToast);
      setError(errorMessage);
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
          color: theme.colors.text.primary,
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
          color: theme.colors.text.secondary,
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
              color: theme.colors.text.primary,
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
                color: theme.colors.primary,
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
              <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.5rem' }}>USDT/KES Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: theme.colors.text.primary }}>
                {conversionRate ? `$${conversionRate.toFixed(2)}` : 'Loading...'}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.5rem' }}>Last Updated</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: theme.colors.text.primary }}>
                {lastRateUpdate ? lastRateUpdate.toLocaleTimeString() : 'Never'}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginBottom: '0.5rem' }}>Source</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: theme.colors.text.primary }}>
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
            color: theme.colors.text.primary,
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
              fontWeight: '500', color: theme.colors.text.secondary 
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
                  border: `2px solid ${selectedBill?.id === bill.id ? bill.color : theme.colors.border.primary}`,
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (selectedBill?.id !== bill.id) {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = `0 8px 25px ${bill.color}20`;
                    e.target.style.borderColor = bill.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedBill?.id !== bill.id) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = theme.colors.border.primary;
                  }
                }}
              >
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100%',
                  height: '100%',
                  background: `radial-gradient(circle, ${bill.color}10 0%, transparent 70%)`,
                  opacity: selectedBill?.id === bill.id ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }} />
                
                {/* Icon Container */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `linear-gradient(135deg, ${bill.color} 0%, ${bill.color}dd 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: `0 4px 12px ${bill.color}40`,
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '24px'
                }}>
                  {bill.serviceIcon || '💳'}
                </div>
                
                {/* Service Info */}
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '700', 
                    color: selectedBill?.id === bill.id ? bill.color : '#1e293b', 
                    marginBottom: '0.25rem',
                    transition: 'color 0.3s ease'
                  }}>
                    {bill.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: theme.colors.text.secondary,
                    lineHeight: '1.3'
                  }}>
                    {bill.description}
                  </div>
                  
                  {/* Status Badge */}
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: bill.status === 'active' ? '#10b981' : '#ef4444',
                    color: 'white',
                    borderRadius: '0.5rem',
                    fontSize: '0.625rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {bill.status}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                {selectedBill?.id === bill.id && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '20px',
                    height: '20px',
                    background: bill.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    <FiCheck size={12} />
                  </div>
                )}
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
              color: theme.colors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiCreditCard size={16} style={{ color: theme.colors.primary }} />
              Select Wallet
            </label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                style={{
                  background: 'white',
                  border: `1px solid ${theme.colors.border.primary}`,
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
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.text.primary }}>
                        {selectedWallet.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                        {selectedWallet.balance?.toFixed(4) || '0.0000'} {selectedWallet.currency}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: theme.colors.text.secondary }}>Choose wallet</span>
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
                  border: `1px solid ${theme.colors.border.primary}`,
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
                        padding: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                        borderBottom: `1px solid ${theme.colors.border.primary}`
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: wallet.currency === 'NST' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 
                                   wallet.currency === 'ICP' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
                                   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {wallet.currency}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          marginBottom: '0.125rem'
                        }}>
                          {wallet.name}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <FiDollarSign size={12} />
                          {wallet.balance?.toFixed(4) || '0.0000'} {wallet.currency}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontSize: '0.625rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        Active
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
              color: theme.colors.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiDollarSign size={16} style={{ color: theme.colors.success }} />
              Amount (KES)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={kesAmount}
                onChange={(e) => handleKesAmountChange(e.target.value)}
                placeholder="Enter amount in KES"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.colors.text.secondary
              }}>
                <FiDollarSign size={16} />
            </div>
          </div>
        </div>

          {/* Conversion Display */}
          {kesAmount && conversionRate && (
            <div style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              border: `1px solid ${theme.colors.border.primary}`
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: theme.colors.background.secondary,
                  borderRadius: '0.5rem',
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FiDollarSign size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.success, marginBottom: '0.25rem', fontWeight: '500' }}>KES Amount</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.success }}>
                      {parseFloat(kesAmount).toLocaleString()} KES
                    </div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                                     padding: '0.75rem',
                   background: theme.colors.background.secondary,
                  borderRadius: '0.5rem',
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FiTrendingUp size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.primary, marginBottom: '0.25rem', fontWeight: '500' }}>USDT Equivalent</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.primary }}>
                      {usdtAmount} USDT
                    </div>
                  </div>
                </div>
                {selectedWallet && walletCurrencyAmount && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: theme.colors.background.secondary,
                    borderRadius: '0.5rem',
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: selectedWallet.currency === 'NST' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 
                                 selectedWallet.currency === 'ICP' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
                                 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {selectedWallet.currency}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.primary, marginBottom: '0.25rem', fontWeight: '500' }}>Wallet Amount</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: theme.colors.primary }}>
                        {walletCurrencyAmount} {selectedWallet.currency}
                      </div>
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
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiHash size={14} style={{ color: theme.colors.primary }} />
                    Paybill Number
                  </label>
                  <div style={{ position: 'relative' }}>
                 <input
                   type="text"
                   value={paybillNumber}
                   onChange={(e) => setPaybillNumber(e.target.value)}
                   placeholder="Enter paybill number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiHash size={14} />
               </div>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiFileText size={14} style={{ color: theme.colors.primary }} />
                    Account Number
                  </label>  
                  <div style={{ position: 'relative' }}>
                 <input
                   type="text"
                   value={accountNumber}
                   onChange={(e) => setAccountNumber(e.target.value)}
                   placeholder="Enter account number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiFileText size={14} />
                    </div>
                  </div>
                </div>
              </div>
              

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiTv size={14} style={{ color: theme.colors.primary }} />
                    Package Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Select package</option>
                      <option value="basic">Basic Package</option>
                      <option value="premium">Premium Package</option>
                      <option value="sports">Sports Package</option>
                      <option value="movies">Movies Package</option>
                    </select>
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiFileText size={14} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buy Goods Fields */}
         {selectedBill && selectedBill.id === 'buy-goods' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiShoppingCart size={14} style={{ color: theme.colors.primary }} />
                    Till Number
                  </label>
                  <div style={{ position: 'relative' }}>
                 <input
                   type="text"
                      value={tillNumber}
                      onChange={(e) => setTillNumber(e.target.value)}
                   placeholder="Enter till number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiShoppingCart size={14} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiTag size={14} style={{ color: theme.colors.primary }} />
                    Reference
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Enter reference"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiTag size={14} />
                    </div>
                  </div>
               </div>
             </div>
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
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiPhone size={14} style={{ color: theme.colors.primary }} />
                    Recipient Phone
                  </label>
                  <div style={{ position: 'relative' }}>
                  <input
                      type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiPhone size={14} />
                </div>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiUser size={14} style={{ color: theme.colors.primary }} />
                    Recipient Name
                  </label>
                  <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiUser size={14} />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: theme.colors.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FiTag size={14} style={{ color: theme.colors.primary }} />
                  Reference
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter reference (optional)"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid ${theme.colors.border.primary}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.text.secondary
                  }}>
                    <FiTag size={14} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Airtime Fields */}
          {selectedBill && selectedBill.id === 'airtime' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiPhone size={14} style={{ color: theme.colors.primary }} />
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                          border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiPhone size={14} />
                  </div>
              </div>
            </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiWifi size={14} style={{ color: theme.colors.primary }} />
                    Network
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Select network</option>
                      <option value="safaricom">Safaricom</option>
                      <option value="airtel">Airtel</option>
                      <option value="telkom">Telkom</option>
                    </select>
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiWifi size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Bundle Fields */}
          {selectedBill && selectedBill.id === 'data-bundle' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiPhone size={14} style={{ color: theme.colors.primary }} />
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiPhone size={14} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: theme.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiWifi size={14} style={{ color: theme.colors.primary }} />
                    Bundle Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={bundleType}
                      onChange={(e) => setBundleType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Select bundle</option>
                      <option value="daily">Daily Bundle</option>
                      <option value="weekly">Weekly Bundle</option>
                      <option value="monthly">Monthly Bundle</option>
                      <option value="night">Night Bundle</option>
                    </select>
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.text.secondary
                    }}>
                      <FiWifi size={14} />
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '0.75rem',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '0.5rem',
                              color: theme.colors.error.hex,
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
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '0.5rem',
              color: theme.colors.success,
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
          {selectedBill && (
              <button
             onClick={handlePayment}
             disabled={loading || !selectedBill || !selectedWallet || !kesAmount}
            style={{
              width: '100%',
              padding: '0.875rem',
                              background: loading || !selectedBill || !selectedWallet || !kesAmount 
                 ? theme.colors.background.secondary 
                  : `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
              border: 'none',
              borderRadius: '0.5rem',
              color: loading || !selectedBill || !selectedWallet || !kesAmount 
                ? theme.colors.text.secondary 
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
          )}  
      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: theme.colors.background.secondary,
            borderRadius: '1rem',
            padding: '1.5rem',
            border: `1px solid ${theme.colors.border.primary}`
          }}>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem', 
              color: theme.colors.text.secondary,
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
                  border: `1px solid ${theme.colors.border.primary}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                                             background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <FiCheckCircle size={16} />
           </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.text.secondary }}>
                        {transaction.bill}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                        {transaction.recipient} • {transaction.timestamp.toLocaleString()}
                      </div>
                </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.success }}>
                      {transaction.amount} KES
          </div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
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
