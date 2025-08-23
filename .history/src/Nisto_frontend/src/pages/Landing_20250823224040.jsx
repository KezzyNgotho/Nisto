import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginModal from '../components/LoginModal';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../App.scss';

function Landing() {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleInstallExtension = () => {
    if (window.nesto && window.nesto.isNesto) {
      alert('Nesto Extension is already installed! 🎉');
      return;
    }

    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (!isChrome) {
      alert('Please install Chrome to use the Nisto Extension. We\'ll support other browsers soon!');
      return;
    }

    try {
      const chromeStoreUrl = process.env.NODE_ENV === 'production' 
        ? 'https://chrome.google.com/webstore/detail/nesto-ic-wallet/...'
        : 'https://chrome.google.com/webstore/category/extensions';
      
      window.open(chromeStoreUrl, '_blank');
    } catch (error) {
      console.error('Extension installation error:', error);
      alert('Please install the Nisto extension from the Chrome Web Store to continue.');
    }
  };

  return (
    <div className="landing-page" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background }}>
      <ThemeSwitcher />
      
      {/* Navigation */}
      <nav className="main-nav" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, borderBottom: `1px solid ${theme.colors.border.primary}` }}>
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-logo" style={{ backgroundColor: theme.colors.primary, width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="logo-text" style={{ color: theme.colors.white, fontSize: '16px', fontWeight: '600' }}>N</span>
              </div>
              <span className="brand-name" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Nisto</span>
            </div>
            
            <div className="nav-links-desktop">
              <a href="#home" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Home</a>
              <a href="#features" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Features</a>
              <a href="#extension" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Extension</a>
              <a href="#tokenomics" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Tokenomics</a>
              {!isAuthenticated && (
                <div className="nav-auth-buttons">
                  <button onClick={handleLaunchApp} className="btn btn-primary nav-cta" disabled={isLoading}
                          style={{ backgroundColor: theme.colors.primary, color: theme.colors.white, fontSize: '14px', fontWeight: '500', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    {isLoading ? 'Loading...' : 'Launch App'}
                  </button>
                </div>
              )}
            </div>
            
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          
          {mobileMenuOpen && (
            <div className="mobile-menu" style={{ backgroundColor: theme.colors.background.secondary }}>
              <a href="#home" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}
                 style={{ color: theme.colors.text.secondary }}>Home</a>
              <a href="#features" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}
                 style={{ color: theme.colors.text.secondary }}>Features</a>
              {!isAuthenticated && (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); handleLaunchApp(); }} 
                          className="btn btn-primary" disabled={isLoading}
                          style={{ backgroundColor: theme.colors.primary, color: theme.colors.white }}>
                    {isLoading ? 'Loading...' : 'Launch App'}
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); handleInstallExtension(); }} 
                          className="btn btn-secondary"
                          style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary }}>
                    <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                      <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
                      </svg>
                    Get Extension
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section" style={{ backgroundColor: theme.colors.background.secondary }}>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '8px 16px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <svg className="badge-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.primary}/>
              </svg>
              <span style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '500' }}>Live on Internet Computer</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line" style={{ color: theme.colors.text.primary, fontSize: '28px', fontWeight: '600', lineHeight: '1.3', display: 'block', marginBottom: '8px' }}>The Future of</span>
              <span className="title-line" style={{ color: theme.colors.primary, fontSize: '28px', fontWeight: '600', lineHeight: '1.3', display: 'block', marginBottom: '24px' }}>Social Finance</span>
            </h1>
            <p className="hero-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '15px', fontWeight: '400', lineHeight: '1.6', marginBottom: '32px' }}>
              DeFi, social trading, and AI-powered insights on the Internet Computer. 
              Kenya's first decentralized finance ecosystem.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '16px' }}>
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg hero-cta"
                      style={{ backgroundColor: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                </svg>
                Launch App
              </button>
              <button 
                onClick={handleInstallExtension}
                className="btn btn-secondary btn-lg hero-cta"
                style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border.primary}`, borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
                  </svg>
                Get Extension
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-demo">
              <div className="demo-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div className="demo-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="demo-dots" style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.colors.border.primary }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.colors.border.primary }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.colors.border.primary }}></span>
              </div>
                  <div style={{ fontSize: '12px', color: theme.colors.text.secondary, fontWeight: '500' }}>Nisto Dashboard</div>
              </div>
                <div className="demo-content">
                  <div className="demo-balance" style={{ marginBottom: '20px' }}>
                    <span className="balance-label" style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400', display: 'block', marginBottom: '4px' }}>Total Portfolio</span>
                    <span className="balance-amount" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700', display: 'block' }}>KES 125,890</span>
            </div>
                  <div className="demo-stats" style={{ display: 'flex', gap: '16px' }}>
                    <div className="stat">
                      <span className="stat-value" style={{ color: theme.colors.success, fontSize: '16px', fontWeight: '600', display: 'block' }}>+12.5%</span>
                      <span className="stat-label" style={{ color: theme.colors.text.secondary, fontSize: '11px', fontWeight: '400' }}>Today</span>
          </div>
                    <div className="stat">
                      <span className="stat-value" style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', display: 'block' }}>₿0.024</span>
                      <span className="stat-label" style={{ color: theme.colors.text.secondary, fontSize: '11px', fontWeight: '400' }}>BTC</span>
        </div>
          </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" style={{ backgroundColor: theme.colors.background.secondary }}>
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700' }}>Key Features</h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>
              Everything you need for modern crypto finance
            </p>
          </div>
          
                      <div className="features-grid">
            <div className="feature-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={theme.colors.primary}/>
                <path d="M2 17L12 22L22 17" fill={theme.colors.primary}/>
                <path d="M2 12L12 17L22 12" fill={theme.colors.primary}/>
              </svg>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginTop: '16px' }}>DeFi Integration</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', lineHeight: '1.5', marginTop: '8px' }}>
                Access lending, borrowing, and yield farming protocols seamlessly.
              </p>
            </div>
            
            <div className="feature-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C16 5.1 15.1 6 14 6C12.9 6 12 5.1 12 4C12 2.9 12.9 2 14 2C15.1 2 16 2.9 16 4Z" fill={theme.colors.primary}/>
                <path d="M8 4C8 5.1 7.1 6 6 6C4.9 6 4 5.1 4 4C4 2.9 4.9 2 6 2C7.1 2 8 2.9 8 4Z" fill={theme.colors.primary}/>
                <path d="M16 20C16 21.1 15.1 22 14 22C12.9 22 12 21.1 12 20C12 18.9 12.9 18 14 18C15.1 18 16 18.9 16 20Z" fill={theme.colors.primary}/>
                <path d="M8 20C8 21.1 7.1 22 6 22C4.9 22 4 21.1 4 20C4 18.9 4.9 18 6 18C7.1 18 8 18.9 8 20Z" fill={theme.colors.primary}/>
                <path d="M12 12C12 13.1 11.1 14 10 14C8.9 14 8 13.1 8 12C8 10.9 8.9 10 10 10C11.1 10 12 10.9 12 12Z" fill={theme.colors.primary}/>
                <path d="M16 12C16 13.1 15.1 14 14 14C12.9 14 12 13.1 12 12C12 10.9 12.9 10 14 10C15.1 10 16 10.9 16 12Z" fill={theme.colors.primary}/>
              </svg>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginTop: '16px' }}>Social Trading</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', lineHeight: '1.5', marginTop: '8px' }}>
                Follow top traders and share strategies with the community.
            </p>
          </div>
          
            <div className="feature-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill={theme.colors.primary}/>
                <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill={theme.colors.primary}/>
              </svg>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginTop: '16px' }}>AI Insights</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', lineHeight: '1.5', marginTop: '8px' }}>
                Get personalized investment recommendations and market analysis.
              </p>
              </div>
              
            <div className="feature-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
              <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2ZM17 20H7V4H17V20Z" fill={theme.colors.primary}/>
                <path d="M12 18C13.1 18 14 17.1 14 16C14 14.9 13.1 14 12 14C10.9 14 10 14.9 10 16C10 17.1 10.9 18 12 18Z" fill={theme.colors.primary}/>
              </svg>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginTop: '16px' }}>Mobile Money</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', lineHeight: '1.5', marginTop: '8px' }}>
                Seamlessly connect M-Pesa and Airtel Money for easy crypto on-ramps and off-ramps.
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* Extension Section */}
      <section id="extension" className="extension-section" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background }}>
        <div className="extension-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700' }}>Browser Extension</h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>
              Access Nisto directly from your browser for seamless DeFi interactions
            </p>
          </div>
          
          <div className="extension-content">
            <div className="extension-preview">
              <div className="browser-mockup" style={{ backgroundColor: theme.colors.background.secondary, borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
                <div className="browser-header" style={{ backgroundColor: theme.colors.background.tertiary, padding: '12px', borderBottom: `1px solid ${theme.colors.border.primary}`, borderRadius: '12px 12px 0 0' }}>
                  <div className="browser-controls" style={{ display: 'flex', gap: '8px' }}>
                    <span className="control" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.error }}></span>
                    <span className="control" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.warning }}></span>
                    <span className="control" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.success }}></span>
                  </div>
                  <div className="browser-url" style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '500', textAlign: 'center', marginTop: '8px' }}>nisto.finance</div>
                </div>
                <div className="browser-content" style={{ padding: '24px' }}>
                  <div className="extension-popup" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, borderRadius: '8px', padding: '16px', border: `1px solid ${theme.colors.border.primary}` }}>
                    <div className="popup-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <div className="popup-logo" style={{ backgroundColor: theme.colors.primary, width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: theme.colors.white, fontSize: '12px', fontWeight: '600' }}>N</span>
                      </div>
                      <h4 style={{ color: theme.colors.text.primary, fontSize: '14px', fontWeight: '600', margin: 0 }}>Nisto Wallet</h4>
                    </div>
                    <div className="popup-balance" style={{ marginBottom: '16px' }}>
                      <div className="balance-label" style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400' }}>Total Balance</div>
                      <div className="balance-amount" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '700' }}>KES 125,890</div>
                    </div>
                    <div className="popup-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button className="popup-btn" style={{ backgroundColor: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '500', flex: 1 }}>Send</button>
                      <button className="popup-btn" style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border.primary}`, borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '500', flex: 1 }}>Receive</button>
                      <button className="popup-btn" style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border.primary}`, borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '500', flex: 1 }}>Swap</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="extension-info">
              <div className="extension-features">
                <div className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                  <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill={theme.colors.primary}/>
                  </svg>
                  <div className="feature-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Secure Wallet</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Your keys, your crypto. Non-custodial wallet with hardware wallet support.</p>
                  </div>
                </div>
                
                <div className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                  <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill={theme.colors.primary}/>
                  </svg>
                  <div className="feature-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Instant Transactions</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Lightning-fast transactions on ICP with minimal fees.</p>
                  </div>
                </div>
                
                <div className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                  <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={theme.colors.primary}/>
                    <path d="M2 17L12 22L22 17" fill={theme.colors.primary}/>
                    <path d="M2 12L12 17L22 12" fill={theme.colors.primary}/>
                  </svg>
                  <div className="feature-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>DeFi Integration</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Access DEXs, lending protocols, and yield farms directly from your browser.</p>
                  </div>
                </div>
              </div>
              
              <div className="download-buttons" style={{ marginTop: '32px' }}>
                <button className="btn btn-primary btn-lg" style={{ backgroundColor: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', marginRight: '12px' }}>
                  <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                    <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
                  </svg>
                  Add to Chrome
                </button>
                <button className="btn btn-secondary btn-lg" style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border.primary}`, borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500' }}>
                  <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                    <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
                  </svg>
                  Add to Firefox
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


          
      {/* Tokenomics Section */}
      <section id="tokenomics" className="tokenomics-section" style={{ backgroundColor: theme.colors.background.secondary }}>
        <div className="tokenomics-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700' }}>Tokenomics</h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>
              $NESTO token distribution and utility
            </p>
          </div>
          
          <div className="tokenomics-content">
            <div className="tokenomics-overview">
              <div className="token-stats">
                <div className="stat-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, textAlign: 'center' }}>
                  <div className="stat-number" style={{ color: theme.colors.primary, fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>100M</div>
                  <div className="stat-label" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Total Supply</div>
            </div>
                <div className="stat-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, textAlign: 'center' }}>
                  <div className="stat-number" style={{ color: theme.colors.primary, fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>$0.01</div>
                  <div className="stat-label" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Initial Price</div>
            </div>
                <div className="stat-card" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, textAlign: 'center' }}>
                  <div className="stat-number" style={{ color: theme.colors.primary, fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>ICP</div>
                  <div className="stat-label" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Network</div>
            </div>
          </div>
        </div>
            
            <div className="tokenomics-distribution">
              <h3 style={{ color: theme.colors.text.primary, fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Token Distribution</h3>
              <div className="distribution-chart">
                <div className="distribution-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: theme.colors.background?.primary || theme.colors.background, borderRadius: '8px', marginBottom: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="item-color" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.primary }}></div>
                    <div className="item-content">
                      <div className="item-name" style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600' }}>Public Sale</div>
                      <div className="item-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Community and early supporters</div>
          </div>
                  </div>
                  <div className="item-percentage" style={{ color: theme.colors.primary, fontSize: '18px', fontWeight: '700' }}>40%</div>
              </div>
              
                <div className="distribution-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: theme.colors.background.primary, borderRadius: '8px', marginBottom: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="item-color" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.success }}></div>
                    <div className="item-content">
                      <div className="item-name" style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600' }}>Ecosystem</div>
                      <div className="item-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Development and partnerships</div>
                    </div>
                  </div>
                  <div className="item-percentage" style={{ color: theme.colors.success, fontSize: '18px', fontWeight: '700' }}>30%</div>
                </div>
                
                <div className="distribution-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: theme.colors.background.primary, borderRadius: '8px', marginBottom: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="item-color" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.warning }}></div>
                    <div className="item-content">
                      <div className="item-name" style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600' }}>Team & Advisors</div>
                      <div className="item-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Core team and advisors</div>
                </div>
                  </div>
                  <div className="item-percentage" style={{ color: theme.colors.warning, fontSize: '18px', fontWeight: '700' }}>20%</div>
              </div>
              
                <div className="distribution-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: theme.colors.background.primary, borderRadius: '8px', marginBottom: '12px', border: `1px solid ${theme.colors.border.primary}` }}>
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="item-color" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.error }}></div>
                    <div className="item-content">
                      <div className="item-name" style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600' }}>Reserve Fund</div>
                      <div className="item-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Emergency fund and future initiatives</div>
                </div>
                </div>
                  <div className="item-percentage" style={{ color: theme.colors.error, fontSize: '18px', fontWeight: '700' }}>10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Airdrop Section */}
      <section className="airdrop-section" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background }}>
        <div className="airdrop-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700' }}>
              <svg className="airdrop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.primary}/>
              </svg>
              Massive Airdrop Coming!
            </h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>
              Join Nisto early and earn your share of 100M $NESTO tokens. The earlier you join, the more you earn!
            </p>
          </div>
          
          <div className="airdrop-tiers">
            <div className="tier-card" style={{ backgroundColor: theme.colors.background.secondary, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, textAlign: 'center' }}>
              <div className="tier-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>🥇</div>
              <h3 className="tier-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Early Bird</h3>
              <div className="tier-reward" style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>1,000 NESTO</div>
              <p className="tier-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginBottom: '20px' }}>First 1,000 users to join</p>
              <button className="btn btn-primary" style={{ backgroundColor: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500' }}>
                Join Now
              </button>
            </div>
            
            <div className="tier-card" style={{ backgroundColor: theme.colors.background.secondary, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, textAlign: 'center' }}>
              <div className="tier-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>🥈</div>
              <h3 className="tier-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Beta Tester</h3>
              <div className="tier-reward" style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>500 NESTO</div>
              <p className="tier-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginBottom: '20px' }}>Next 5,000 users</p>
              <button className="btn btn-secondary" style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border.primary}`, borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500' }}>
                Join Now
              </button>
            </div>
            
            <div className="tier-card" style={{ backgroundColor: theme.colors.background.secondary, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.colors.border.primary}`, textAlign: 'center' }}>
              <div className="tier-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>🥉</div>
              <h3 className="tier-title" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Community</h3>
              <div className="tier-reward" style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>100 NESTO</div>
              <p className="tier-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginBottom: '20px' }}>All other users</p>
              <button className="btn btn-secondary" style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border.primary}`, borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '500' }}>
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ backgroundColor: theme.colors.background.secondary }}>
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo" style={{ backgroundColor: theme.colors.primary }}>
                <span className="logo-text" style={{ color: theme.colors.white }}>N</span>
                </div>
              <span className="logo-text" style={{ color: theme.colors.text.primary }}>Nisto</span>
              <p className="footer-description" style={{ color: theme.colors.text.secondary }}>
                The future of social finance on the Internet Computer
              </p>
            </div>
            
            <div className="footer-links">
              <a href="#features" className="footer-link" style={{ color: theme.colors.text.secondary }}>Features</a>
              <button onClick={handleLaunchApp} className="footer-link" style={{ color: theme.colors.text.secondary }}>Launch App</button>
              <a href="#" className="footer-link" style={{ color: theme.colors.text.secondary }}>Twitter</a>
              <a href="#" className="footer-link" style={{ color: theme.colors.text.secondary }}>Discord</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright" style={{ color: theme.colors.text.secondary }}>&copy; 2025 Nisto Finance. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
}

export default Landing; 