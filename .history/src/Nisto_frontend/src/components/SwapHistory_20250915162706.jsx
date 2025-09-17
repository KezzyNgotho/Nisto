import React, { useState } from 'react';
import { 
  FiClock, 
  FiArrowRight, 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw,
  FiAlertTriangle,
  FiRepeat,
  FiInfo,
  FiDollarSign,
  FiFilter,
  FiTrendingUp,
  FiTrendingDown,
  FiZap
} from 'react-icons/fi';
import './SwapHistory.scss';

const SwapHistory = ({ swapHistory = [], isLoading = false }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const formatAmount = (amount, decimals = 2) => {
    return amount.toFixed(decimals);
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === 'bigint') {
      const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
      return date.toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const formatEstimatedTime = (estimatedTime) => {
    if (!estimatedTime) return null;
    if (typeof estimatedTime === 'bigint') {
      const date = new Date(Number(estimatedTime) / 1000000);
      return date.toLocaleString();
    }
    return new Date(estimatedTime).toLocaleString();
  };

  const formatGasCost = (gasCost) => {
    if (!gasCost) return 'N/A';
    return `$${gasCost.toFixed(4)}`;
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle className="status-icon completed" />;
      case 'failed':
        return <FiXCircle className="status-icon failed" />;
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'processing':
        return <FiRefreshCw className="status-icon processing spinning" />;
      default:
        return <FiAlertTriangle className="status-icon unknown" />;
    }
  };

  const getSwapTypeIcon = (swapType) => {
    return swapType === 'auto' ? <FiShield className="type-icon" /> : <FiRepeat className="type-icon" />;
  };

  // Filter swaps based on active filter
  const filteredSwaps = swapHistory.filter(swap => {
    if (activeFilter === 'all') return true;
    return swap.swapType === activeFilter;
  });

  const completedSwaps = filteredSwaps.filter(s => s.status.toLowerCase() === 'completed');
  const failedSwaps = filteredSwaps.filter(s => s.status.toLowerCase() === 'failed');
  const pendingSwaps = filteredSwaps.filter(s => ['pending', 'processing'].includes(s.status.toLowerCase()));
  const autoSwaps = swapHistory.filter(s => s.swapType === 'auto');
  const manualSwaps = swapHistory.filter(s => s.swapType === 'manual');

  if (isLoading) {
    return (
      <div className="swap-history">
        <div className="history-header">
          <h1 className="history-title">Swap History</h1>
        </div>
        <div className="loading-state">
          <FiRefreshCw className="loading-icon spinning" />
          <span>Loading swap history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="swap-history">
      {/* Header */}
      <div className="history-header">
        <h1 className="history-title">Swap History</h1>
        <div className="history-stats">
          <span className="total-swaps">{swapHistory.length} total swaps</span>
        </div>
      </div>

      {/* Status Overview */}
      {swapHistory.length > 0 && (
        <div className="status-overview">
          <div className="stat-item">
            <div className="stat-icon completed">
              <FiCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completedSwaps.length}</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon failed">
              <FiXCircle />
            </div>
            <div className="stat-details">
              <div className="stat-label">Failed</div>
              <div className="stat-value">{failedSwaps.length}</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon pending">
              <FiClock />
            </div>
            <div className="stat-details">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{pendingSwaps.length}</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon auto">
              <FiShield />
            </div>
            <div className="stat-details">
              <div className="stat-label">Auto-Swaps</div>
              <div className="stat-value">{autoSwaps.length}</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon manual">
              <FiRepeat />
            </div>
            <div className="stat-details">
              <div className="stat-label">Manual Swaps</div>
              <div className="stat-value">{manualSwaps.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Swaps Alert */}
      {failedSwaps.length > 0 && (
        <div className="alert alert-warning">
          <FiAlertTriangle className="alert-icon" />
          <div className="alert-content">
            <strong>{failedSwaps.length} swap(s) failed.</strong> Check the details below for error information and retry options.
          </div>
        </div>
      )}

      {swapHistory.length === 0 ? (
        <div className="empty-state">
          <FiShield className="empty-icon" />
          <h3 className="empty-title">No Swaps Yet</h3>
          <p className="empty-description">
            Your swaps will appear here once they're executed.
            Enable auto-hedging in settings or use manual swap to start trading.
          </p>
        </div>
      ) : (
        <div className="swap-activity">
          <div className="activity-header">
            <h2 className="activity-title">Swap Activity</h2>
            <div className="filter-info">
              <FiFilter className="filter-icon" />
              <span>Filter by type</span>
            </div>
          </div>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <FiClock className="tab-icon" />
              <span>All ({swapHistory.length})</span>
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'auto' ? 'active' : ''}`}
              onClick={() => setActiveFilter('auto')}
            >
              <FiShield className="tab-icon" />
              <span>Auto ({autoSwaps.length})</span>
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveFilter('manual')}
            >
              <FiRepeat className="tab-icon" />
              <span>Manual ({manualSwaps.length})</span>
            </button>
          </div>

          <div className="swaps-list">
            {filteredSwaps.map((swap) => (
              <div key={swap.id?.toString() || Math.random()} className="swap-item">
                <div className="swap-header">
                  <div className="swap-type">
                    {getSwapTypeIcon(swap.swapType)}
                    <span className="type-label">{swap.swapType === 'auto' ? 'Auto' : 'Manual'}</span>
                  </div>
                  <div className="swap-status">
                    {getStatusIcon(swap.status)}
                    <span className="status-label">{swap.status}</span>
                  </div>
                </div>
                
                <div className="swap-details">
                  <div className="swap-info">
                    <div className="swap-pair">
                      <span className="token">{swap.fromToken}</span>
                      <FiArrowRight className="arrow-icon" />
                      <span className="token">{swap.toToken}</span>
                    </div>
                    <div className="swap-amount">${formatAmount(swap.amount)}</div>
                    <div className="swap-price">{formatPrice(swap.price)}</div>
                  </div>
                  
                  <div className="swap-meta">
                    <div className="swap-date">{formatTimestamp(swap.timestamp)}</div>
                    <div className="swap-gas">
                      <FiDollarSign className="gas-icon" />
                      <span>{formatGasCost(swap.gasCost)}</span>
                    </div>
                  </div>
                </div>
                
                {swap.reason && (
                  <div className="swap-reason">
                    <span className="reason-text">{swap.reason}</span>
                    {swap.errorMessage && (
                      <span className="error-text">Error: {swap.errorMessage}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Analytics */}
      {swapHistory.length > 0 && (
        <div className="performance-analytics">
          <h2 className="analytics-title">Performance Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-item">
              <div className="analytics-label">Success Rate</div>
              <div className="analytics-value">
                {swapHistory.length > 0 
                  ? ((completedSwaps.length / swapHistory.length) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <div className="analytics-description">
                {completedSwaps.length} of {swapHistory.length} swaps completed
              </div>
            </div>
            
            <div className="analytics-item">
              <div className="analytics-label">Total Volume</div>
              <div className="analytics-value">
                ${swapHistory.reduce((sum, swap) => sum + swap.amount, 0).toFixed(2)}
              </div>
              <div className="analytics-description">
                Across all swap attempts
              </div>
            </div>
            
            <div className="analytics-item">
              <div className="analytics-label">Avg Gas Cost</div>
              <div className="analytics-value">
                ${swapHistory.filter(s => s.gasCost).length > 0
                  ? (swapHistory.reduce((sum, swap) => sum + (swap.gasCost || 0), 0) / swapHistory.filter(s => s.gasCost).length).toFixed(4)
                  : '0.0000'
                }
              </div>
              <div className="analytics-description">
                Per successful transaction
              </div>
            </div>
            
            <div className="analytics-item">
              <div className="analytics-label">Auto vs Manual</div>
              <div className="analytics-value">
                {autoSwaps.length}:{manualSwaps.length}
              </div>
              <div className="analytics-description">
                Auto-hedge to manual ratio
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapHistory;
