import React, { useState, useEffect, useRef } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const collectMetrics = () => {
    const newMetrics = {
      timestamp: Date.now(),
      // Core Web Vitals
      lcp: getLCP(),
      fid: getFID(),
      cls: getCLS(),
      // Performance metrics
      fcp: getFCP(),
      ttfb: getTTFB(),
      // Memory usage
      memory: getMemoryUsage(),
      // Network info
      connection: getConnectionInfo(),
      // Page load metrics
      loadTime: getLoadTime(),
      domContentLoaded: getDOMContentLoaded(),
      // Resource metrics
      resources: getResourceMetrics()
    };

    setMetrics(newMetrics);
    setHistory(prev => [...prev.slice(-9), newMetrics]); // Keep last 10 entries
  };

  const getLCP = () => {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(null);
      }
    });
  };

  const getFID = () => {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            resolve(entry.processingStart - entry.startTime);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(null);
      }
    });
  };

  const getCLS = () => {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } else {
        resolve(null);
      }
    });
  };

  const getFCP = () => {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  };

  const getTTFB = () => {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    return navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : null;
  };

  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
      };
    }
    return null;
  };

  const getConnectionInfo = () => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  };

  const getLoadTime = () => {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    return navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart : null;
  };

  const getDOMContentLoaded = () => {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    return navigationEntry ? navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart : null;
  };

  const getResourceMetrics = () => {
    const resources = performance.getEntriesByType('resource');
    return {
      total: resources.length,
      totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
      averageLoadTime: resources.reduce((sum, resource) => sum + resource.duration, 0) / resources.length
    };
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectMetrics(); // Initial collection
    intervalRef.current = setInterval(collectMetrics, 5000); // Collect every 5 seconds
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getPerformanceGrade = (value, thresholds) => {
    if (value <= thresholds.good) return { grade: 'A', color: 'success' };
    if (value <= thresholds.needsImprovement) return { grade: 'B', color: 'warning' };
    return { grade: 'C', color: 'error' };
  };

  const getLCPGrade = (lcp) => {
    if (!lcp) return { grade: 'N/A', color: 'gray' };
    return getPerformanceGrade(lcp, { good: 2500, needsImprovement: 4000 });
  };

  const getFIDGrade = (fid) => {
    if (!fid) return { grade: 'N/A', color: 'gray' };
    return getPerformanceGrade(fid, { good: 100, needsImprovement: 300 });
  };

  const getCLSGrade = (cls) => {
    if (!cls) return { grade: 'N/A', color: 'gray' };
    return getPerformanceGrade(cls, { good: 0.1, needsImprovement: 0.25 });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="performance-monitor">
      <div className="performance-monitor__header">
        <h2 className="performance-monitor__title">Performance Monitor</h2>
        <p className="performance-monitor__description">
          Real-time performance metrics and Core Web Vitals
        </p>
      </div>

      <div className="performance-monitor__controls">
        <button 
          className={`btn ${isMonitoring ? 'btn-secondary' : 'btn-primary'}`}
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
        
        {isMonitoring && (
          <div className="monitoring-indicator">
            <div className="monitoring-dot"></div>
            <span>Monitoring active</span>
          </div>
        )}
      </div>

      {Object.keys(metrics).length > 0 && (
        <div className="performance-metrics">
          {/* Core Web Vitals */}
          <div className="metrics-section">
            <h3 className="metrics-section__title">Core Web Vitals</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-card__header">
                  <h4 className="metric-card__name">LCP</h4>
                  <span className={`metric-grade metric-grade--${getLCPGrade(metrics.lcp).color}`}>
                    {getLCPGrade(metrics.lcp).grade}
                  </span>
                </div>
                <div className="metric-card__value">
                  {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
                </div>
                <div className="metric-card__description">
                  Largest Contentful Paint
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card__header">
                  <h4 className="metric-card__name">FID</h4>
                  <span className={`metric-grade metric-grade--${getFIDGrade(metrics.fid).color}`}>
                    {getFIDGrade(metrics.fid).grade}
                  </span>
                </div>
                <div className="metric-card__value">
                  {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
                </div>
                <div className="metric-card__description">
                  First Input Delay
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card__header">
                  <h4 className="metric-card__name">CLS</h4>
                  <span className={`metric-grade metric-grade--${getCLSGrade(metrics.cls).color}`}>
                    {getCLSGrade(metrics.cls).grade}
                  </span>
                </div>
                <div className="metric-card__value">
                  {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </div>
                <div className="metric-card__description">
                  Cumulative Layout Shift
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="metrics-section">
            <h3 className="metrics-section__title">Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-card__header">
                  <h4 className="metric-card__name">FCP</h4>
                </div>
                <div className="metric-card__value">
                  {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
                </div>
                <div className="metric-card__description">
                  First Contentful Paint
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card__header">
                  <h4 className="metric-card__name">TTFB</h4>
                </div>
                <div className="metric-card__value">
                  {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
                </div>
                <div className="metric-card__description">
                  Time to First Byte
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card__header">
                  <h4 className="metric-card__name">Load Time</h4>
                </div>
                <div className="metric-card__value">
                  {metrics.loadTime ? `${Math.round(metrics.loadTime)}ms` : 'N/A'}
                </div>
                <div className="metric-card__description">
                  Page Load Time
                </div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memory && (
            <div className="metrics-section">
              <h3 className="metrics-section__title">Memory Usage</h3>
              <div className="memory-usage">
                <div className="memory-bar">
                  <div 
                    className="memory-bar__fill"
                    style={{ 
                      width: `${(metrics.memory.used / metrics.memory.limit) * 100}%` 
                    }}
                  />
                </div>
                <div className="memory-stats">
                  <span>{metrics.memory.used}MB used</span>
                  <span>{metrics.memory.total}MB total</span>
                  <span>{metrics.memory.limit}MB limit</span>
                </div>
              </div>
            </div>
          )}

          {/* Network Info */}
          {metrics.connection && (
            <div className="metrics-section">
              <h3 className="metrics-section__title">Network Information</h3>
              <div className="network-info">
                <div className="network-item">
                  <span className="network-label">Connection Type:</span>
                  <span className="network-value">{metrics.connection.effectiveType}</span>
                </div>
                <div className="network-item">
                  <span className="network-label">Download Speed:</span>
                  <span className="network-value">{metrics.connection.downlink} Mbps</span>
                </div>
                <div className="network-item">
                  <span className="network-label">Round Trip Time:</span>
                  <span className="network-value">{metrics.connection.rtt}ms</span>
                </div>
                <div className="network-item">
                  <span className="network-label">Data Saver:</span>
                  <span className="network-value">{metrics.connection.saveData ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Resource Metrics */}
          {metrics.resources && (
            <div className="metrics-section">
              <h3 className="metrics-section__title">Resource Metrics</h3>
              <div className="resource-metrics">
                <div className="resource-item">
                  <span className="resource-label">Total Resources:</span>
                  <span className="resource-value">{metrics.resources.total}</span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Total Size:</span>
                  <span className="resource-value">
                    {Math.round(metrics.resources.totalSize / 1024)}KB
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Average Load Time:</span>
                  <span className="resource-value">
                    {Math.round(metrics.resources.averageLoadTime)}ms
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance History */}
      {history.length > 0 && (
        <div className="performance-history">
          <h3 className="history-title">Performance History</h3>
          <div className="history-chart">
            {history.map((entry, index) => (
              <div key={index} className="history-entry">
                <div className="history-time">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                <div className="history-metrics">
                  <span>LCP: {entry.lcp ? Math.round(entry.lcp) : 'N/A'}ms</span>
                  <span>FID: {entry.fid ? Math.round(entry.fid) : 'N/A'}ms</span>
                  <span>CLS: {entry.cls ? entry.cls.toFixed(3) : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
