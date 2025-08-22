import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FiWifi, 
  FiWifiOff, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiExternalLink,
  FiShield,
  FiClock,
  FiAlertTriangle,
  FiZap,
  FiX
} from 'react-icons/fi';
import walletService from '../services/WalletService';

function WalletConnector({ onWalletConnect, onWalletDisconnect }) {
  const [availableWallets, setAvailableWallets] = useState([]);
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [disconnectingWallet, setDisconnectingWallet] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionHealth, setConnectionHealth] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    detectWallets();
  }, []);

  const detectWallets = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const wallets = await walletService.detectWallets();
      setAvailableWallets(wallets);
      
      // Set connected wallets
      const connected = wallets.filter(w => w.connected);
      setConnectedWallets(connected);
      
      // Update connection health for each wallet
      const health = {};
      for (const wallet of wallets) {
        if (wallet.connected) {
          health[wallet.type] = await checkWalletHealth(wallet.type);
        }
      }
      setConnectionHealth(health);
      setLastUpdated(new Date());
      setRetryCount(0);
      
    } catch (error) {
      console.error('Failed to detect wallets:', error);
      setError({
        message: 'Failed to detect wallets',
        details: error.message,
        canRetry: true,
        timestamp: new Date()
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const checkWalletHealth = async (walletType) => {
    try {
      switch (walletType) {
        case 'plug':
          // Check if plug is responsive
          const isConnected = await walletService.isPlugConnected();
          return {
            status: isConnected ? 'healthy' : 'disconnected',
            latency: Math.random() * 100 + 50, // Mock latency
            lastCheck: new Date()
          };
        default:
          return {
            status: 'healthy',
            latency: 0,
            lastCheck: new Date()
          };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date()
      };
    }
  };

  const handleConnectWallet = async (walletType) => {
    setConnectingWallet(walletType);
    setError(null);

    try {
      let result;
      
      switch (walletType) {
        case 'plug':
          // Check if Plug is installed first
          if (!window.ic?.plug) {
            throw new Error('Plug wallet is not installed. Please install it first.');
          }
          result = await walletService.connectPlugWallet();
          break;
        case 'stoic':
          // Add Stoic connection logic
          throw new Error('Stoic wallet integration coming soon. Stay tuned!');
        case 'dfinity':
          throw new Error('DFINITY Wallet integration coming soon. Stay tuned!');
        case 'bitfinity':
          throw new Error('Bitfinity Wallet integration coming soon. Stay tuned!');
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      if (result.success) {
        await detectWallets(false); // Refresh wallet list without showing loading
        onWalletConnect?.(result);
        
        // Show success message
        setError({
          message: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet connected successfully!`,
          type: 'success',
          timestamp: new Date()
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError({
        message: `Failed to connect ${walletType} wallet`,
        details: error.message,
        type: 'error',
        canRetry: true,
        walletType,
        timestamp: new Date()
      });
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnectWallet = async (walletType) => {
    setDisconnectingWallet(walletType);
    setError(null);

    try {
      let result;
      
      switch (walletType) {
        case 'plug':
          result = await walletService.disconnectPlugWallet();
          break;
        default:
          throw new Error(`Cannot disconnect ${walletType} wallet`);
      }

      if (result.success) {
        await detectWallets(false); // Refresh wallet list
        onWalletDisconnect?.(walletType);
        
        // Show success message
        setError({
          message: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet disconnected successfully`,
          type: 'success',
          timestamp: new Date()
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      setError({
        message: `Failed to disconnect ${walletType} wallet`,
        details: error.message,
        type: 'error',
        timestamp: new Date()
      });
    } finally {
      setDisconnectingWallet(null);
    }
  };

  const handleRetry = () => {
    if (error?.canRetry) {
      if (error.walletType) {
        handleConnectWallet(error.walletType);
      } else {
        detectWallets();
      }
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const refreshWallets = () => {
    detectWallets();
  };

  // Auto-refresh wallet status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      detectWallets(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [detectWallets]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const getWalletIcon = (walletType) => {
    switch (walletType) {
      case 'plug': return '🔌';
      case 'stoic': return '🏛️';
      case 'dfinity': return '🌀';
      case 'bitfinity': return '♾️';
      case 'internal': return '🏦';
      default: return '💳';
    }
  };

  const getWalletStatus = (wallet) => {
    if (!wallet.installed) return 'not-installed';
    if (wallet.connected) return 'connected';
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'var(--success-500)';
      case 'available': return 'var(--primary-500)';
      case 'not-installed': return 'var(--neutral-400)';
      default: return 'var(--neutral-400)';
    }
  };

  const getHealthIndicator = (walletType) => {
    const health = connectionHealth[walletType];
    if (!health) return null;

    switch (health.status) {
      case 'healthy':
        return <FiCheckCircle className="health-icon healthy" title="Connection healthy" />;
      case 'disconnected':
        return <FiWifiOff className="health-icon disconnected" title="Connection lost" />;
      case 'error':
        return <FiAlertCircle className="health-icon error" title={`Error: ${health.error}`} />;
      default:
        return <FiClock className="health-icon pending" title="Checking..." />;
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = now - lastUpdated;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="wallet-connector">
      <div className="wallet-connector-header">
        <h3>Connect Wallets</h3>
        <p>Connect your crypto and payment wallets to Nesto</p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="wallets-grid">
        {availableWallets.map(wallet => {
          const status = getWalletStatus(wallet);
          
          return (
            <div key={wallet.type} className={`wallet-card ${status}`}>
              <div className="wallet-card-header">
                <div className="wallet-icon">
                  {getWalletIcon(wallet.type)}
                </div>
                <div className="wallet-info">
                  <h4>{wallet.name}</h4>
                  <span 
                    className="wallet-status"
                    style={{ color: getStatusColor(status) }}
                  >
                    {status === 'connected' ? '✓ Connected' :
                     status === 'available' ? 'Available' :
                     'Not Installed'}
                  </span>
                </div>
              </div>

              <div className="wallet-features">
                {wallet.type === 'plug' && (
                  <div className="feature-tags">
                    <span className="feature-tag">ICP</span>
                    <span className="feature-tag">ckBTC</span>
                    <span className="feature-tag">Tokens</span>
                  </div>
                )}
                {wallet.type === 'internal' && (
                  <div className="feature-tags">
                    <span className="feature-tag">KES</span>
                    <span className="feature-tag">USD</span>
                    <span className="feature-tag">Tracking</span>
                  </div>
                )}
              </div>

              <div className="wallet-actions">
                {status === 'not-installed' && wallet.type === 'plug' && (
                  <a 
                    href="https://plugwallet.ooo/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    Install Plug
                  </a>
                )}
                
                {status === 'available' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleConnectWallet(wallet.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                
                {status === 'connected' && wallet.type !== 'internal' && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDisconnectWallet(wallet.type)}
                    disabled={isLoading}
                  >
                    Disconnect
                  </button>
                )}
                
                {status === 'connected' && wallet.type === 'internal' && (
                  <span className="btn btn-success btn-sm disabled">
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected Wallets Summary */}
      {connectedWallets.length > 0 && (
        <div className="connected-summary">
          <h4>Connected Wallets ({connectedWallets.length})</h4>
          <div className="connected-list">
            {connectedWallets.map(wallet => (
              <div key={wallet.type} className="connected-item">
                <span className="wallet-icon">{getWalletIcon(wallet.type)}</span>
                <span className="wallet-name">{wallet.name}</span>
                <span className="connection-status">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon Features */}
      <div className="coming-soon">
        <h4>Coming Soon</h4>
        <div className="feature-preview">
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>M-Pesa Integration</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌉</span>
            <span>Cross-Chain Bridges</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌾</span>
            <span>DeFi Yield Farming</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span>Multi-Signature Wallets</span>
          </div>
        </div>
      </div>

      <style>{`
        .wallet-connector {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--neutral-200);
        }

        .wallet-connector-header {
          margin-bottom: var(--space-6);
          text-align: center;
        }

        .wallet-connector-header h3 {
          margin: 0 0 var(--space-2) 0;
          color: var(--neutral-900);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .wallet-connector-header p {
          margin: 0;
          color: var(--neutral-600);
          font-size: 0.875rem;
        }

        .error-banner {
          background: var(--error-50);
          border: 1px solid var(--error-200);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--error-700);
          font-size: 0.875rem;
        }

        .wallets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .wallet-card {
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: all 0.2s ease;
        }

        .wallet-card:hover {
          border-color: var(--primary-300);
          box-shadow: var(--shadow-sm);
        }

        .wallet-card.connected {
          border-color: var(--success-300);
          background: var(--success-25);
        }

        .wallet-card.not-installed {
          opacity: 0.7;
        }

        .wallet-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .wallet-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--neutral-100);
          border-radius: var(--radius-lg);
        }

        .wallet-info h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--neutral-900);
        }

        .wallet-status {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .wallet-features {
          margin-bottom: var(--space-3);
        }

        .feature-tags {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
        }

        .feature-tag {
          background: var(--primary-50);
          color: var(--primary-600);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-size: 0.625rem;
          font-weight: 600;
        }

        .wallet-actions {
          display: flex;
          gap: var(--space-2);
        }

        .connected-summary {
          background: var(--success-25);
          border: 1px solid var(--success-200);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .connected-summary h4 {
          margin: 0 0 var(--space-3) 0;
          color: var(--success-700);
          font-size: 1rem;
          font-weight: 600;
        }

        .connected-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .connected-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: white;
          border-radius: var(--radius-md);
        }

        .connection-status {
          margin-left: auto;
          color: var(--success-500);
          font-weight: 600;
        }

        .coming-soon {
          background: var(--neutral-50);
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
        }

        .coming-soon h4 {
          margin: 0 0 var(--space-3) 0;
          color: var(--neutral-700);
          font-size: 1rem;
          font-weight: 600;
        }

        .feature-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-2);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: white;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--neutral-600);
        }

        .feature-icon {
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

export default WalletConnector; 