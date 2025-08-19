import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLocation } from '../hooks/useLocation';
import {
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiShoppingCart,
  FiZap,
  FiWifi,
  FiDroplet,
  FiMonitor,
  FiBook,
  FiHome,
  FiMapPin,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiLoader,
  FiX
} from 'react-icons/fi';

// Simple Exchange Rate Service
class ExchangeRateService {
  // Get exchange rate (simplified)
  static async getExchangeRate(fromCurrency, toCurrency) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency.toLowerCase()}&vs_currencies=${toCurrency.toLowerCase()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data[fromCurrency.toLowerCase()]?.[toCurrency.toLowerCase()] || 1;
      }
      
      // Fallback rates
      const fallbackRates = {
        'usdt': { 'kes': 3200, 'usd': 1.0 },
        'usdc': { 'kes': 3200, 'usd': 1.0 }
      };
      return fallbackRates[fromCurrency.toLowerCase()]?.[toCurrency.toLowerCase()] || 1;
    } catch (error) {
      console.error('Exchange rate error:', error);
      return 3200; // Fallback KES to USD rate
    }
  }
}

const EnhancedPaymentMethods = () => {
  const { isAuthenticated, isLoading: authLoading, backend } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  
  // State
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment types
  const paymentTypes = [
    {
      id: 'paybill',
      name: 'Pay Bill',
      icon: <FiCreditCard />,
      color: '#3B82F6',
      description: 'Pay electricity, water, internet bills'
    },
    {
      id: 'buygoods',
      name: 'Buy Goods',
      icon: <FiShoppingCart />,
      color: '#10B981',
      description: 'Purchase goods and services'
    }
  ];

  // Get exchange rate when amount changes
  useEffect(() => {
    const getRate = async () => {
      if (amount && parseFloat(amount) > 0) {
        const rate = await ExchangeRateService.getExchangeRate('usdt', 'kes');
        setExchangeRate(rate);
        const usd = parseFloat(amount) / rate;
        setUsdAmount(usd.toFixed(2));
      } else {
        setUsdAmount('');
        setExchangeRate(null);
      }
    };

    getRate();
  }, [amount]);

  // Handle payment
  const handlePayment = async () => {
    if (!paymentType || !amount || parseFloat(amount) <= 0) {
      showNotification('error', 'Please fill in all fields');
      return;
    }

    setProcessing(true);
    
    try {
      // Call backend to process payment
      const result = await backend.processSimplePayment(
        paymentType,
        parseFloat(amount),
        'KES',
        parseFloat(usdAmount),
        exchangeRate,
        location.country ? `${location.city}, ${location.country}` : null
      );
      
      if (result.ok) {
        const payment = result.ok;
        const statusMessage = payment.status === 'completed' 
          ? 'Payment completed successfully!' 
          : payment.status === 'failed' 
            ? 'Payment failed. Please try again.' 
            : 'Payment is being processed...';
        
        showNotification(
          payment.status === 'completed' ? 'success' : 
          payment.status === 'failed' ? 'error' : 'info',
          statusMessage
        );
        
        if (payment.status !== 'processing') {
          setShowPaymentModal(false);
          
          // Reset form
          setPaymentType('');
          setAmount('');
          setUsdAmount('');
          setExchangeRate(null);
        }
      } else {
        showNotification('error', result.err || 'Payment failed');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      showNotification('error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <FiShield className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please log in to make payments</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Bills</h1>
        <p className="text-gray-600">
          Quick and secure payments with automatic currency conversion
          {location.country && (
            <span className="flex items-center justify-center mt-2 text-sm text-gray-500">
              <FiMapPin className="mr-1" />
              {location.city}, {location.country}
            </span>
          )}
        </p>
      </div>

      {/* Payment Type Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setPaymentType(type.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                paymentType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <div 
                  className="p-3 rounded-lg mr-4"
                  style={{ backgroundColor: `${type.color}20`, color: type.color }}
                >
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      {paymentType && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (KES)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-gray-500 font-medium">KES</span>
                </div>
              </div>
            </div>

            {/* USD Equivalent */}
            {usdAmount && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">USD Equivalent:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${usdAmount}
                  </span>
                </div>
                {exchangeRate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Rate: 1 USD = {exchangeRate.toLocaleString()} KES
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pay Button */}
      {paymentType && amount && parseFloat(amount) > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiArrowRight className="mr-2" />
            Pay {amount} KES
          </button>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirm Payment
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  {paymentTypes.find(t => t.id === paymentType)?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {paymentTypes.find(t => t.id === paymentType)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {paymentTypes.find(t => t.id === paymentType)?.description}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Local Amount:</span>
                    <span className="font-semibold">{amount} KES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">USD Amount:</span>
                    <span className="font-semibold">${usdAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Exchange Rate:</span>
                    <span>1 USD = {exchangeRate?.toLocaleString()} KES</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPaymentMethods;
