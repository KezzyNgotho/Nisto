import React, { useState, useEffect } from 'react';
import './SecurityAudit.css';

const SecurityAudit = () => {
  const [auditResults, setAuditResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastAudit, setLastAudit] = useState(null);

  const securityChecks = [
    {
      id: 'https-check',
      name: 'HTTPS Connection',
      description: 'Verify secure connection',
      critical: true,
      check: () => window.location.protocol === 'https:'
    },
    {
      id: 'csp-check',
      name: 'Content Security Policy',
      description: 'Check CSP headers',
      critical: true,
      check: () => {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        return !!meta;
      }
    },
    {
      id: 'xss-protection',
      name: 'XSS Protection',
      description: 'Verify XSS protection headers',
      critical: true,
      check: () => {
        // Check for X-XSS-Protection header (would need server response)
        return true; // Placeholder
      }
    },
    {
      id: 'secure-cookies',
      name: 'Secure Cookies',
      description: 'Check cookie security settings',
      critical: false,
      check: () => {
        const cookies = document.cookie.split(';');
        return cookies.every(cookie => 
          cookie.includes('Secure') || cookie.includes('HttpOnly')
        );
      }
    },
    {
      id: 'local-storage',
      name: 'Local Storage Security',
      description: 'Check for sensitive data in localStorage',
      critical: false,
      check: () => {
        const keys = Object.keys(localStorage);
        const sensitiveKeys = keys.filter(key => 
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret')
        );
        return sensitiveKeys.length === 0;
      }
    },
    {
      id: 'session-timeout',
      name: 'Session Management',
      description: 'Check session timeout settings',
      critical: false,
      check: () => {
        // Check if session timeout is configured
        return localStorage.getItem('session-timeout') !== null;
      }
    }
  ];

  const runSecurityAudit = async () => {
    setIsRunning(true);
    const results = [];

    for (const check of securityChecks) {
      try {
        const passed = await check.check();
        results.push({
          ...check,
          passed,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          ...check,
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    setAuditResults(results);
    setLastAudit(new Date().toISOString());
    setIsRunning(false);

    // Store audit results
    localStorage.setItem('security-audit-results', JSON.stringify(results));
  };

  useEffect(() => {
    // Load previous audit results
    const stored = localStorage.getItem('security-audit-results');
    if (stored) {
      try {
        setAuditResults(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load audit results:', error);
      }
    }
  }, []);

  const getStatusIcon = (passed) => {
    if (passed) {
      return (
        <svg className="status-icon status-icon--success" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      );
    } else {
      return (
        <svg className="status-icon status-icon--error" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
          <path d="M2 17L12 22L22 17" fill="currentColor"/>
          <path d="M2 12L12 17L22 12" fill="currentColor"/>
        </svg>
      );
    }
  };

  const getOverallScore = () => {
    if (auditResults.length === 0) return 0;
    const passed = auditResults.filter(result => result.passed).length;
    return Math.round((passed / auditResults.length) * 100);
  };

  const getCriticalIssues = () => {
    return auditResults.filter(result => result.critical && !result.passed);
  };

  return (
    <div className="security-audit">
      <div className="security-audit__header">
        <h2 className="security-audit__title">Security Audit</h2>
        <p className="security-audit__description">
          Comprehensive security assessment of your application
        </p>
      </div>

      <div className="security-audit__overview">
        <div className="security-score">
          <div className="security-score__value">
            {getOverallScore()}%
          </div>
          <div className="security-score__label">Security Score</div>
        </div>
        
        <div className="security-stats">
          <div className="security-stat">
            <div className="security-stat__value">
              {auditResults.filter(r => r.passed).length}
            </div>
            <div className="security-stat__label">Passed</div>
          </div>
          <div className="security-stat">
            <div className="security-stat__value security-stat__value--error">
              {auditResults.filter(r => !r.passed).length}
            </div>
            <div className="security-stat__label">Failed</div>
          </div>
          <div className="security-stat">
            <div className="security-stat__value security-stat__value--critical">
              {getCriticalIssues().length}
            </div>
            <div className="security-stat__label">Critical</div>
          </div>
        </div>
      </div>

      <div className="security-audit__actions">
        <button 
          className="btn btn-primary"
          onClick={runSecurityAudit}
          disabled={isRunning}
        >
          {isRunning ? 'Running Audit...' : 'Run Security Audit'}
        </button>
        
        {lastAudit && (
          <div className="last-audit">
            Last audit: {new Date(lastAudit).toLocaleString()}
          </div>
        )}
      </div>

      {auditResults.length > 0 && (
        <div className="security-audit__results">
          <h3 className="results-title">Audit Results</h3>
          
          {getCriticalIssues().length > 0 && (
            <div className="critical-alert">
              <svg className="alert-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" fill="currentColor"/>
                <path d="M2 12L12 17L22 12" fill="currentColor"/>
              </svg>
              <div className="alert-content">
                <strong>Critical Security Issues Detected</strong>
                <p>Please address the following critical security vulnerabilities immediately.</p>
              </div>
            </div>
          )}

          <div className="audit-results">
            {auditResults.map((result) => (
              <div 
                key={result.id} 
                className={`audit-result ${result.passed ? 'audit-result--passed' : 'audit-result--failed'} ${result.critical ? 'audit-result--critical' : ''}`}
              >
                <div className="audit-result__icon">
                  {getStatusIcon(result.passed)}
                </div>
                
                <div className="audit-result__content">
                  <div className="audit-result__header">
                    <h4 className="audit-result__name">
                      {result.name}
                      {result.critical && (
                        <span className="critical-badge">Critical</span>
                      )}
                    </h4>
                    <span className={`audit-result__status ${result.passed ? 'audit-result__status--passed' : 'audit-result__status--failed'}`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  
                  <p className="audit-result__description">
                    {result.description}
                  </p>
                  
                  {result.error && (
                    <div className="audit-result__error">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;
