import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { runAllTests } from '../utils/userba';

function BackendTest() {
  const { isAuthenticated, user, login, logout, backend, generateUsername, retryInitialization } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toISOString() }]);
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    addTestResult('Backend Connection', 'running', 'Testing connection to backend canister...');
    
    console.log('BackendTest: Testing backend connection...');
    console.log('BackendTest: backend value:', backend);
    console.log('BackendTest: backend type:', typeof backend);
    
    try {
      if (!backend) {
        console.log('BackendTest: Backend is null/undefined');
        addTestResult('Backend Connection', 'failed', 'BackendService not initialized');
        return;
      }

      // Test basic backend connection
      const actor = await backend.ensureActor();
      if (actor) {
        addTestResult('Backend Connection', 'passed', 'Successfully connected to backend canister');
      } else {
        addTestResult('Backend Connection', 'failed', 'Failed to create actor');
      }
    } catch (error) {
      if (error.message.includes('fetch') || error.message.includes('localhost:4943')) {
        addTestResult('Backend Connection', 'failed', 'Cannot connect to dfx local network. Please ensure dfx is running with: dfx start --clean --background');
      } else {
        addTestResult('Backend Connection', 'failed', `Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    addTestResult('Authentication', 'running', 'Testing Internet Identity authentication...');
    
    try {
      await login();
      addTestResult('Authentication', 'passed', 'Successfully authenticated with Internet Identity');
    } catch (error) {
      addTestResult('Authentication', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUserCreation = async () => {
    setIsLoading(true);
    addTestResult('User Creation', 'running', 'Testing user account creation...');
    
    try {
      if (!backend) {
        addTestResult('User Creation', 'failed', 'BackendService not initialized');
        return;
      }

      const userData = await backend.getUser();
      if (userData) {
        addTestResult('User Creation', 'passed', `User account exists: ${userData.displayName || userData.username || 'No name set'}`);
      } else {
        addTestResult('User Creation', 'failed', 'No user data returned');
      }
    } catch (error) {
      addTestResult('User Creation', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUsernameUpdate = async () => {
    setIsLoading(true);
    addTestResult('Username Update', 'running', 'Testing username update functionality...');
    
    try {
      if (!backend) {
        addTestResult('Username Update', 'failed', 'BackendService not initialized');
        return;
      }

      const testDisplayName = `TestUser_${Date.now()}`;
      const result = await backend.updateUser(testDisplayName, null);
      
      if (result) {
        addTestResult('Username Update', 'passed', `Successfully updated display name to: ${testDisplayName}`);
      } else {
        addTestResult('Username Update', 'failed', 'Update returned no result');
      }
    } catch (error) {
      addTestResult('Username Update', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPrincipalFetching = async () => {
    setIsLoading(true);
    addTestResult('Principal Fetching', 'running', 'Testing principal fetching...');
    
    try {
      if (!backend) {
        addTestResult('Principal Fetching', 'failed', 'BackendService not initialized');
        return;
      }

      const principal = backend.getCurrentPrincipal();
      
      if (principal) {
        addTestResult('Principal Fetching', 'passed', `Successfully fetched principal: ${principal}`);
      } else {
        addTestResult('Principal Fetching', 'failed', 'No principal available');
      }
    } catch (error) {
      addTestResult('Principal Fetching', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDfxConnection = async () => {
    setIsLoading(true);
    addTestResult('DFX Connection', 'running', 'Testing connection to dfx local network...');
    
    try {
      if (!backend) {
        addTestResult('DFX Connection', 'failed', 'BackendService not initialized');
        return;
      }

      const dfxRunning = await backend.checkDfxConnection();
      
      if (dfxRunning) {
        addTestResult('DFX Connection', 'passed', 'Successfully connected to dfx local network');
      } else {
        addTestResult('DFX Connection', 'failed', 'Cannot connect to dfx local network. Please ensure dfx is running.');
      }
    } catch (error) {
      addTestResult('DFX Connection', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRetryInitialization = async () => {
    setIsLoading(true);
    addTestResult('Retry Initialization', 'running', 'Testing backend re-initialization...');
    
    try {
      if (!retryInitialization) {
        addTestResult('Retry Initialization', 'failed', 'retryInitialization function not available');
        return;
      }

      const result = await retryInitialization();
      
      if (result !== undefined) {
        addTestResult('Retry Initialization', 'passed', `Successfully re-initialized backend. Result: ${result}`);
      } else {
        addTestResult('Retry Initialization', 'failed', 'Re-initialization returned undefined');
      }
    } catch (error) {
      addTestResult('Retry Initialization', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUsernameGeneration = async () => {
    setIsLoading(true);
    addTestResult('Username Generation', 'running', 'Testing automatic username generation...');
    
    try {
      if (!generateUsername) {
        addTestResult('Username Generation', 'failed', 'generateUsername function not available');
        return;
      }

      const generatedUsername = await generateUsername();
      
      if (generatedUsername) {
        addTestResult('Username Generation', 'passed', `Successfully generated username: ${generatedUsername}`);
      } else {
        addTestResult('Username Generation', 'failed', 'Username generation returned null');
      }
    } catch (error) {
      addTestResult('Username Generation', 'failed', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUsernameUtils = () => {
    addTestResult('Username Utils', 'running', 'Testing username utility functions...');
    
    try {
      runAllTests();
      addTestResult('Username Utils', 'passed', 'All username utility tests passed');
    } catch (error) {
      addTestResult('Username Utils', 'failed', `Error: ${error.message}`);
    }
  };

  const checkBackendState = () => {
    console.log('BackendTest: Checking backend state...');
    console.log('BackendTest: backend from useAuth:', backend);
    console.log('BackendTest: isAuthenticated:', isAuthenticated);
    console.log('BackendTest: user:', user);
    
    addTestResult('Backend State Check', 'info', `Backend: ${backend ? 'Present' : 'Null'}, Auth: ${isAuthenticated}, User: ${user ? 'Present' : 'None'}`);
  };

  const runAllBackendTests = async () => {
    setTestResults([]);
    setIsLoading(true);
    
    // Run tests in sequence
    await testDfxConnection();
    await testBackendConnection();
    await testRetryInitialization();
    await testAuthentication();
    await testPrincipalFetching();
    await testUserCreation();
    await testUsernameUpdate();
    await testUsernameGeneration();
    testUsernameUtils();
    
    setIsLoading(false);
  };

  return (
    <div className="backend-test">
      <h2>Backend Authentication & Username Test</h2>
      
      <div className="test-controls">
        <button 
          onClick={runAllBackendTests} 
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={testDfxConnection} 
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Test DFX Connection
        </button>
        
        <button 
          onClick={testRetryInitialization} 
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Test Retry Initialization
        </button>
        
        <button 
          onClick={testPrincipalFetching} 
          disabled={isLoading || !isAuthenticated}
          className="btn btn-secondary"
        >
          Test Principal Fetching
        </button>
        
        <button 
          onClick={testUsernameGeneration} 
          disabled={isLoading || !isAuthenticated}
          className="btn btn-secondary"
        >
          Test Username Generation
        </button>
        
        <button 
          onClick={checkBackendState} 
          className="btn btn-secondary"
        >
          Check Backend State
        </button>
        
        <button 
          onClick={() => setTestResults([])} 
          className="btn btn-secondary"
        >
          Clear Results
        </button>
      </div>

      <div className="auth-status">
        <h3>Authentication Status</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? (user.displayName || user.username || 'No name') : 'None'}</p>
        <p><strong>Principal:</strong> {backend?.getCurrentPrincipal() || user?.principal || 'None'}</p>
        <p><strong>Backend Initialized:</strong> {backend?.isInitialized() ? 'Yes' : 'No'}</p>
        <p><strong>Actor Available:</strong> {backend?.hasActor() ? 'Yes' : 'No'}</p>
        <p><strong>Canister ID:</strong> {backend ? 'bkyz2-fmaaa-aaaaa-qaaaq-cai' : 'None'}</p>
        <p><strong>Environment:</strong> {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'Local' : 'Production'}</p>
      </div>

      <div className="test-results">
        <h3>Test Results</h3>
        {testResults.length === 0 ? (
          <p>No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div className="results-list">
            {testResults.map((result, index) => (
              <div key={index} className={`test-result ${result.result}`}>
                <span className="test-name">{result.test}</span>
                                 <span className={`test-status ${result.result}`}>
                   {result.result === 'passed' ? '✅' : 
                    result.result === 'failed' ? '❌' : 
                    result.result === 'info' ? 'ℹ️' : '⏳'}
                   {result.result}
                 </span>
                <span className="test-details">{result.details}</span>
                <span className="test-time">{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

             <style>{`
         .backend-test {
           padding: 20px;
           max-width: 800px;
           margin: 0 auto;
         }
         
         .test-controls {
           margin-bottom: 20px;
           display: flex;
           gap: 10px;
         }
         
         .auth-status {
           background: #f5f5f5;
           padding: 15px;
           border-radius: 8px;
           margin-bottom: 20px;
         }
         
         .test-results {
           background: #fff;
           border: 1px solid #ddd;
           border-radius: 8px;
           padding: 15px;
         }
         
         .results-list {
           display: flex;
           flex-direction: column;
           gap: 10px;
         }
         
         .test-result {
           display: grid;
           grid-template-columns: 1fr auto 2fr auto;
           gap: 15px;
           padding: 10px;
           border-radius: 4px;
           border-left: 4px solid #ddd;
         }
         
         .test-result.passed {
           background: #f0f9ff;
           border-left-color: #10b981;
         }
         
         .test-result.failed {
           background: #fef2f2;
           border-left-color: #ef4444;
         }
         
         .test-result.running {
           background: #fffbeb;
           border-left-color: #f59e0b;
         }
         
         .test-result.info {
           background: #f0f9ff;
           border-left-color: #3b82f6;
         }
         
         .test-status {
           font-weight: bold;
         }
         
         .test-status.passed {
           color: #10b981;
         }
         
         .test-status.failed {
           color: #ef4444;
         }
         
         .test-status.running {
           color: #f59e0b;
         }
         
         .test-status.info {
           color: #3b82f6;
         }
         
         .test-time {
           font-size: 0.8em;
           color: #666;
         }
       `}</style>
    </div>
  );
}

export default BackendTest;
