import { useState, useEffect } from 'react';
import walletService from '../services/WalletService';

function WalletConnector({ onWalletConnect, onWalletDisconnect }) {
  const [availableWallets, setAvailableWallets] = useState([]);
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    detectWallets();
  }, []);

  const detectWallets = async () => {
    try {
      const wallets = await walletService.detectWallets();
      setAvailableWallets(wallets);
      
      // Set connected wallets
      const connected = wallets.filter(w => w.connected);
      setConnectedWallets(connected);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
      setError('Failed to detect wallets');
    }
  };

  const handleConnectWallet = async (walletType) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      switch (walletType) {
        case 'plug':
          result = await walletService.connectPlugWallet();
          break;
        case 'stoic':
          // Add Stoic connection logic
          throw new Error('Stoic wallet integration coming soon');
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      if (result.success) {
        await detectWallets(); // Refresh wallet list
        onWalletConnect?.(result);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async (walletType) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      switch (walletType) {
        case 'plug':
          result = await walletService.disconnectPlugWallet();
          break;
        default:
          throw new Error(`Cannot disconnect ${walletType}`);
      }

      if (result.success) {
        await detectWallets(); // Refresh wallet list
        onWalletDisconnect?.(walletType);
      }
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletIcon = (walletType) => {
    switch (walletType) {
      case 'plug': return '🔌';
      case 'stoic': return '🏛️';
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

      <style jsx>{`
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