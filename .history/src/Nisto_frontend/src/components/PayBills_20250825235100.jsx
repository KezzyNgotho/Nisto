import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { handleError, handleSuccess } from '../utils/errorHandler';
import { 
  FiDollarSign, 
  FiSmartphone, 
  FiArrowRight, 
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiChevronDown,
  FiWifi,
  FiShoppingCart,
  FiSend,
  FiTrendingUp,
  FiPhone,
  FiUser,
  FiHash,
  FiTag,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiX
} from 'react-icons/fi';

const PayBills = () => {
  const { cryptoWallets, backendService } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(null);
  const [kesAmount, setKesAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);
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
        console.log('Backend bills:', bills); // Debug log
        setAvailableBills(bills || []);
      } catch (error) {
        console.log('Backend failed, using mock data:', error);
        handleError(error, 'payment', showToast);
        // Fallback to mock data
        setAvailableBills([
          {
            id: 'mpesa-paybill',
            name: 'M-Pesa Paybill',
            icon: FiSmartphone,
            description: 'Pay bills using M-Pesa',
            paybillNumber: '174379',
            accountType: 'Paybill',
            status: 'active',
            color: theme?.colors?.primary || '#113F67',
            fields: ['paybillNumber', 'accountNumber']
          },
          {
            id: 'buy-goods',
            name: 'Buy Goods',
            icon: FiShoppingCart,
            description: 'Pay for goods and services using Till Number',
            paybillNumber: '174379',
            accountType: 'Till',
            status: 'active',
            color: theme?.colors?.error?.hex || '#dc3545',
            fields: ['tillNumber', 'reference']
          },
          {
            id: 'send-money',
            name: 'Send Money',
            icon: FiSend,
            description: 'Send money to phone number',
            paybillNumber: '',
            accountType: 'Send Money',
            status: 'active',
            color: theme?.colors?.info || '#17a2b8',
            fields: ['recipientPhone', 'recipientName', 'reference']
          },
          {
            id: 'airtime',
            name: 'Airtime',
            icon: FiPhone,
            description: 'Buy airtime for any network',
            paybillNumber: '',
            accountType: 'Airtime',
            status: 'active',
            color: theme?.colors?.warning || '#ffc107',
            fields: ['phoneNumber', 'network']
          },
          {
            id: 'data-bundle',
            name: 'Data Bundle',
            icon: FiWifi,
            description: 'Buy internet data bundles',
            paybillNumber: '',
            accountType: 'Data Bundle',
            status: 'active',
            color: theme?.colors?.success || '#28a745',
            fields: ['phoneNumber', 'bundleType']
          }
        ]);
      }
    };
    
    loadBills();
  }, [backendService, theme]);

  // Fetch USDT to KES conversion rate
  const fetchConversionRate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rate = await backendService?.getUSDTtoKESRate();
      setConversionRate(rate || 135.50);
      
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
      const usdt = kes / conversionRate;
      setUsdtAmount(usdt.toFixed(6));
    } else {
      setUsdtAmount('');
    }
  };

  // Handle bill payment
  const handlePayment = async () => {
    if (!selectedBill || !selectedWallet || !kesAmount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      handleSuccess('bill', 'payment', showToast, `${selectedBill.name} payment completed successfully!`);

      // Reset form
      setKesAmount('');
      setUsdtAmount('');
      setPaybillNumber('');
      setAccountNumber('');
      setRecipientPhone('');
      setRecipientName('');
      setTillNumber('');
      setReference('');
      setNetwork('');
      setBundleType('');
      setSelectedBill(null);
      setSelectedWallet(null);

    } catch (err) {
      const errorMessage = handleError(err, 'payment', showToast);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load conversion rate on component mount
  useEffect(() => {
    fetchConversionRate();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: theme?.colors?.text?.primary || '#1e293b',
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
          color: theme?.colors?.text?.secondary || '#64748b',
          margin: 0
        }}>
          Pay bills and send money using your crypto wallets
        </p>
      </div>

      {/* Exchange Rate Card */}
      <div style={{ 
        marginBottom: '2rem',
        backgroundColor: theme?.colors?.background?.secondary || '#f8fafc',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: `1px solid ${theme?.colors?.border?.primary || '#e2e8f0'}`
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
            color: theme?.colors?.text?.primary || '#1e293b',
            margin: 0
          }}>
            Exchange Rate
          </h4>
          <button 
            onClick={fetchConversionRate}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: theme?.colors?.primary || '#113F67',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem'
            }}
          >
            <FiRefreshCw size={16} style={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none' 
            }} />
          </button>
        </div>
        
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: theme?.colors?.text?.primary || '#1e293b' }}>
          {conversionRate ? `1 USDT = ${conversionRate.toFixed(2)} KES` : 'Loading...'}
        </div>
      </div>

      {/* Service Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: theme?.colors?.text?.primary || '#1e293b',
          marginBottom: '1rem'
        }}>
          Select Service
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {availableBills.map((bill) => (
            <div
              key={bill.id}
              onClick={() => setSelectedBill(bill)}
              style={{
                padding: '1.5rem',
                borderRadius: '1rem',
                border: `2px solid ${selectedBill?.id === bill.id ? bill.color : theme?.colors?.border?.primary || '#e2e8f0'}`,
                background: selectedBill?.id === bill.id ? theme?.colors?.white || '#ffffff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: bill.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <bill.icon size={24} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: selectedBill?.id === bill.id ? bill.color : theme?.colors?.text?.primary || '#1e293b',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {bill.name}
                  </h4>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: theme?.colors?.text?.secondary || '#64748b',
                    margin: 0
                  }}>
                    {bill.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Form */}
      {selectedBill && (
        <div style={{ 
          backgroundColor: theme?.colors?.background?.secondary || '#f8fafc',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: `1px solid ${theme?.colors?.border?.primary || '#e2e8f0'}`
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: theme?.colors?.text?.primary || '#1e293b',
            marginBottom: '1.5rem'
          }}>
            {selectedBill.name} Payment
          </h3>

          {/* Amount Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: theme?.colors?.text?.primary || '#374151'
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
                border: `1px solid ${theme?.colors?.border?.primary || '#d1d5db'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                background: theme?.colors?.white || '#ffffff'
              }}
            />
            {usdtAmount && (
              <div style={{ 
                fontSize: '0.875rem', 
                color: theme?.colors?.text?.secondary || '#64748b', 
                marginTop: '0.5rem' 
              }}>
                ≈ {parseFloat(usdtAmount).toFixed(6)} USDT
              </div>
            )}
          </div>

          {/* Wallet Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: theme?.colors?.text?.primary || '#374151'
            }}>
              Select Wallet
            </label>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme?.colors?.border?.primary || '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  background: theme?.colors?.white || '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: theme?.colors?.text?.primary || '#1e293b'
                }}
              >
                <span style={{ color: selectedWallet ? theme?.colors?.text?.primary || '#1e293b' : theme?.colors?.text?.muted || '#64748b' }}>
                  {selectedWallet ? `${selectedWallet.currency} Wallet` : 'Select a wallet'}
                </span>
                <FiChevronDown size={16} />
              </button>
              
              {showWalletDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: theme?.colors?.white || '#ffffff',
                  border: `1px solid ${theme?.colors?.border?.primary || '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  marginTop: '0.25rem',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {cryptoWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowWalletDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: theme?.colors?.text?.primary || '#1e293b'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = theme?.colors?.background?.secondary || '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <span>{wallet.currency} Wallet</span>
                      <span style={{ color: theme?.colors?.text?.secondary || '#64748b' }}>
                        {wallet.balance} {wallet.currency}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '0.75rem',
              background: theme?.colors?.error?.hex || '#fef2f2',
              border: `1px solid ${theme?.colors?.error?.hex || '#fecaca'}`,
              borderRadius: '0.5rem',
              color: theme?.colors?.error?.hex || '#dc2626',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !selectedBill || !kesAmount}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading || !selectedBill || !kesAmount 
                ? theme?.colors?.border?.secondary || '#e5e7eb' 
                : selectedBill.color,
              color: loading || !selectedBill || !kesAmount ? theme?.colors?.text?.muted || '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || !selectedBill || !kesAmount ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
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