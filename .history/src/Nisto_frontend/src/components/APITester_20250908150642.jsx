import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import apiTester from '../services/apiTester';
import { 
  FiCheck, 
  FiX, 
  FiRefreshCw, 
  FiExternalLink,
  FiInfo,
  FiZap
} from 'react-icons/fi';

const APITester = () => {
  const { theme } = useTheme();
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState(null);

  const apis = [
    {
      id: 'coingecko',
      name: 'CoinGecko',
      description: 'Cryptocurrency prices and market data',
      endpoint: 'https://api.coingecko.com/api/v3',
      free: true,
      rateLimit: '50 calls/minute',
      testFunction: () => apiTester.testCoinGecko()
    },
    {
      id: 'exchangeRate',
      name: 'ExchangeRate-API',
      description: 'Fiat currency exchange rates',
      endpoint: 'https://api.exchangerate-api.com/v4',
      free: true,
      rateLimit: '1000 calls/month',
      testFunction: () => apiTester.testExchangeRate()
    },
    {
      id: 'binance',
      name: 'Binance',
      description: 'Real-time trading data',
      endpoint: 'https://api.binance.com/api/v3',
      free: true,
      rateLimit: '1200 calls/minute',
      testFunction: () => apiTester.testBinance()
    },
    {
      id: 'customNST',
      name: 'Custom NST Oracle',
      description: 'Nisto token price (mock)',
      endpoint: 'Your Backend API',
      free: true,
      rateLimit: 'Unlimited',
      testFunction: () => apiTester.testCustomNST()
    }
  ];

  const testSingleAPI = async (api) => {
    setSelectedAPI(api.id);
    setTesting(true);
    
    try {
      const result = await api.testFunction();
      setTestResults(prev => ({
        ...prev,
        [api.id]: { status: 'success', data: result, error: null }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [api.id]: { status: 'error', data: null, error: error.message }
      }));
    } finally {
      setTesting(false);
      setSelectedAPI(null);
    }
  };

  const testAllAPIs = async () => {
    setTesting(true);
    try {
      const results = await apiTester.testAllAPIs();
      setTestResults(results);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (apiId) => {
    if (!testResults || !testResults[apiId]) return null;
    
    const result = testResults[apiId];
    if (result.status === 'success') {
      return <FiCheck style={{ color: theme.colors.success }} />;
    } else if (result.status === 'error') {
      return <FiX style={{ color: theme.colors.error }} />;
    }
    return null;
  };

  const getStatusColor = (apiId) => {
    if (!testResults || !testResults[apiId]) return theme.colors.text.secondary;
    
    const result = testResults[apiId];
    if (result.status === 'success') return theme.colors.success;
    if (result.status === 'error') return theme.colors.error;
    return theme.colors.text.secondary;
  };

  return (
    <div style={{ 
      padding: '2rem',
      background: theme.colors.background.primary,
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          color: theme.colors.text.primary, 
          marginBottom: '2rem',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          🔧 API Testing Dashboard
        </h1>
        
        <p style={{ 
          color: theme.colors.text.secondary, 
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Test each API endpoint individually to ensure they work properly. All APIs are FREE and don't require API keys.
        </p>

        {/* Test All Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={testAllAPIs}
            disabled={testing}
            style={{
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary || theme.colors.primary})`,
              color: theme.colors.text.inverse || theme.colors.white,
              fontSize: '1rem',
              fontWeight: '600',
              cursor: testing ? 'not-allowed' : 'pointer',
              opacity: testing ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: `0 4px 20px ${theme.colors.primary}20`
            }}
          >
            {testing ? (
              <FiRefreshCw className="spinning" />
            ) : (
              <FiZap />
            )}
            {testing ? 'Testing All APIs...' : 'Test All APIs'}
          </button>
        </div>

        {/* API Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {apis.map(api => (
            <div
              key={api.id}
              style={{
                background: theme.colors.background.secondary,
                borderRadius: '16px',
                padding: '1.5rem',
                border: `1px solid ${theme.colors.border}`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  color: theme.colors.text.primary, 
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {api.name}
                </h3>
                {getStatusIcon(api.id)}
              </div>

              <p style={{ 
                color: theme.colors.text.secondary, 
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {api.description}
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Endpoint:</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: '0.8rem' }}>{api.endpoint}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Free:</span>
                  <span style={{ color: theme.colors.success, fontSize: '0.8rem', fontWeight: '600' }}>
                    {api.free ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Rate Limit:</span>
                  <span style={{ color: theme.colors.text.primary, fontSize: '0.8rem' }}>{api.rateLimit}</span>
                </div>
              </div>

              <button
                onClick={() => testSingleAPI(api)}
                disabled={testing && selectedAPI === api.id}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedAPI === api.id ? theme.colors.background.primary : theme.colors.primary,
                  color: selectedAPI === api.id ? theme.colors.text.primary : theme.colors.text.inverse,
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: testing && selectedAPI === api.id ? 'not-allowed' : 'pointer',
                  opacity: testing && selectedAPI === api.id ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {testing && selectedAPI === api.id ? (
                  <FiRefreshCw className="spinning" />
                ) : (
                  <FiExternalLink />
                )}
                {testing && selectedAPI === api.id ? 'Testing...' : 'Test API'}
              </button>

              {/* Test Results */}
              {testResults && testResults[api.id] && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: testResults[api.id].status === 'success' 
                    ? `${theme.colors.success}10` 
                    : `${theme.colors.error}10`,
                  border: `1px solid ${testResults[api.id].status === 'success' 
                    ? theme.colors.success 
                    : theme.colors.error}20`
                }}>
                  <div style={{ 
                    color: getStatusColor(api.id),
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {testResults[api.id].status === 'success' ? '✅ Success' : '❌ Failed'}
                  </div>
                  
                  {testResults[api.id].status === 'error' && (
                    <div style={{ 
                      color: theme.colors.error,
                      fontSize: '0.75rem'
                    }}>
                      {testResults[api.id].error}
                    </div>
                  )}
                  
                  {testResults[api.id].status === 'success' && testResults[api.id].data && (
                    <div style={{ 
                      color: theme.colors.text.secondary,
                      fontSize: '0.75rem'
                    }}>
                      <pre style={{ 
                        background: theme.colors.background.primary,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '100px'
                      }}>
                        {JSON.stringify(testResults[api.id].data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {testResults && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1.5rem',
            background: theme.colors.background.secondary,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ 
              color: theme.colors.text.primary, 
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              📊 Test Summary
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {apis.map(api => (
                <div key={api.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: theme.colors.background.primary
                }}>
                  {getStatusIcon(api.id)}
                  <span style={{ 
                    color: theme.colors.text.primary,
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {api.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITester;
