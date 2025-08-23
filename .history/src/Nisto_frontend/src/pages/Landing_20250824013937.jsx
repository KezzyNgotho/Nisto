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
              <a href="/" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Home</a>
              <a href="/features" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Features</a>
              <a href="/extension" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Extension</a>
              <a href="/tokenomics" className="nav-link" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginRight: '24px' }}>Tokenomics</a>
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
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          
          <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
                <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
              </svg>
              Home
            </a>
            <a href="/features" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              Features
            </a>
            <a href="/extension" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
              </svg>
              Extension
            </a>
            <a href="/tokenomics" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
              </svg>
              Tokenomics
            </a>
              {!isAuthenticated && (
                <>
                <button onClick={() => { setMobileMenuOpen(false); handleLaunchApp(); }} 
                        className="btn btn-primary" disabled={isLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                  </svg>
                    {isLoading ? 'Loading...' : 'Launch App'}
                  </button>
                <button onClick={() => { setMobileMenuOpen(false); handleInstallExtension(); }} 
                        className="btn btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                    <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
                      </svg>
                  Get Extension
                  </button>
                </>
              )}
            </div>
        </div>
      </nav>

            {/* Hero Section */}
      <section className="hero-section" style={{ 
        backgroundColor: theme.colors.background.secondary,
        padding: '120px 0 80px 0',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="hero-container" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center'
        }}>
          
          {/* Left Column - Content */}
          <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Badge */}
            <div className="hero-badge" style={{ 
              backgroundColor: theme.colors.background?.primary || theme.colors.background, 
              padding: '12px 20px', 
              borderRadius: '24px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              width: 'fit-content',
              border: `1px solid ${theme.colors.border.primary}`
            }}>
              <svg className="badge-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.primary}/>
                  </svg>
              <span style={{ color: theme.colors.text.secondary, fontSize: '13px', fontWeight: '500' }}>Live on Internet Computer</span>
          </div>
          
            {/* Title */}
            <div className="hero-title-section">
              <h1 className="hero-title" style={{ margin: 0, lineHeight: '1.2' }}>
                <span className="title-line" style={{ 
                  color: theme.colors.text.primary, 
                  fontSize: '48px', 
                  fontWeight: '700', 
                  display: 'block', 
                  marginBottom: '12px' 
                }}>The Future of</span>
                <span className="title-line" style={{ 
                  color: theme.colors.primary, 
                  fontSize: '48px', 
                  fontWeight: '700', 
                  display: 'block', 
                  marginBottom: '24px' 
                }}>Social Finance</span>
              </h1>
              </div>

            {/* Subtitle */}
            <div className="hero-subtitle-section">
              <p className="hero-subtitle" style={{ 
                color: theme.colors.text.secondary, 
                fontSize: '18px', 
                fontWeight: '400', 
                lineHeight: '1.6', 
                margin: 0,
                maxWidth: '500px'
              }}>
                DeFi, social trading, and AI-powered insights on the Internet Computer. 
                Kenya's first decentralized finance ecosystem with lightning-fast transactions.
            </p>
          </div>
          
            {/* Stats */}
            <div className="hero-stats" style={{ 
              display: 'flex', 
              gap: '32px', 
              marginTop: '16px'
            }}>
              <div className="stat-item">
                <div style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>10K+</div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Active Users</div>
              </div>
              <div className="stat-item">
                <div style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>$2.5M</div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Trading Volume</div>
            </div>
              <div className="stat-item">
                <div style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>99.9%</div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Uptime</div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="hero-actions" style={{ 
              display: 'flex', 
              gap: '16px', 
              marginTop: '16px'
            }}>
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg hero-cta"
                      style={{ 
                        backgroundColor: theme.colors.primary, 
                        color: theme.colors.white, 
                        border: 'none', 
                        borderRadius: '12px', 
                        padding: '16px 32px', 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}>
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                </svg>
                Launch App
              </button>
              <button 
                onClick={handleInstallExtension}
                className="btn btn-secondary btn-lg hero-cta"
                style={{ 
                  backgroundColor: 'transparent', 
                  color: theme.colors.text.primary, 
                  border: `2px solid ${theme.colors.border.primary}`, 
                  borderRadius: '12px', 
                  padding: '16px 32px', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}>
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill="currentColor"/>
                </svg>
                Get Extension
              </button>
              </div>
            </div>
            
          {/* Right Column - Visual Mockups */}
          <div className="hero-visual" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '32px'
          }}>
            
            {/* Desktop Dashboard Mockup */}
            <div className="desktop-mockup" style={{ 
              width: '100%',
              maxWidth: '400px'
            }}>
              <div className="demo-card" style={{ 
                backgroundColor: theme.colors.background?.primary || theme.colors.background, 
                borderRadius: '16px', 
                border: `1px solid ${theme.colors.border.primary}`, 
                padding: '32px', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                {/* Browser Header */}
                <div className="demo-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: `1px solid ${theme.colors.border.primary}`
                }}>
                  <div className="demo-dots" style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.error }}></span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.warning }}></span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.success }}></span>
              </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.colors.text.secondary, 
                    fontWeight: '500',
                    backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.colors.border.primary}`
                  }}>nisto.finance</div>
            </div>
            
                {/* Dashboard Content */}
                <div className="demo-content">
                  <div className="demo-balance" style={{ marginBottom: '24px' }}>
                    <span className="balance-label" style={{ 
                      color: theme.colors.text.secondary, 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      display: 'block', 
                      marginBottom: '8px' 
                    }}>Total Portfolio Value</span>
                    <span className="balance-amount" style={{ 
                      color: theme.colors.text.primary, 
                      fontSize: '32px', 
                      fontWeight: '700', 
                      display: 'block',
                      marginBottom: '8px'
                    }}>KES 125,890</span>
                    <span style={{ 
                      color: theme.colors.success, 
                      fontSize: '16px', 
                      fontWeight: '600' 
                    }}>+12.5% today</span>
            </div>
            
                  <div className="demo-stats" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '16px' 
                  }}>
                    <div className="stat" style={{ 
                      backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                      padding: '16px',
                      borderRadius: '12px',
                      border: `1px solid ${theme.colors.border.primary}`
                    }}>
                      <span className="stat-value" style={{ 
                        color: theme.colors.success, 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        display: 'block',
                        marginBottom: '4px'
                      }}>₿0.024</span>
                      <span className="stat-label" style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: '12px', 
                        fontWeight: '500' 
                      }}>Bitcoin</span>
              </div>
                    <div className="stat" style={{ 
                      backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                      padding: '16px',
                      borderRadius: '12px',
                      border: `1px solid ${theme.colors.border.primary}`
                    }}>
                      <span className="stat-value" style={{ 
                        color: theme.colors.primary, 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        display: 'block',
                        marginBottom: '4px'
                      }}>Ξ0.85</span>
                      <span className="stat-label" style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: '12px', 
                        fontWeight: '500' 
                      }}>Ethereum</span>
            </div>
          </div>
        </div>
            </div>
          </div>
          
            {/* Mobile App Mockup */}
            <div className="mobile-mockup" style={{ 
              display: 'flex', 
              justifyContent: 'center',
              transform: 'translateY(-20px)'
            }}>
              <div className="phone-frame" style={{ 
                width: '240px', 
                height: '480px', 
                backgroundColor: theme.colors.background?.primary || theme.colors.background,
                borderRadius: '24px', 
                border: `3px solid ${theme.colors.border.primary}`,
                padding: '6px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                position: 'relative'
              }}>
                {/* Phone Notch */}
                <div style={{ 
                  position: 'absolute', 
                  top: '6px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '4px',
                  backgroundColor: theme.colors.border.primary,
                  borderRadius: '2px',
                  zIndex: 2
                }}></div>
                
                {/* Phone Screen */}
                <div className="phone-screen" style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: theme.colors.background?.primary || theme.colors.background,
                  borderRadius: '18px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* App Header */}
                  <div className="app-header" style={{ 
                    backgroundColor: theme.colors.primary,
                    padding: '20px 16px 16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        backgroundColor: theme.colors.white,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: '700' }}>N</span>
                </div>
                      <span style={{ color: theme.colors.white, fontSize: '18px', fontWeight: '700' }}>Nisto</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill={theme.colors.white}/>
                      </svg>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.white}/>
                      </svg>
                  </div>
                    </div>

                  {/* App Content */}
                  <div className="app-content" style={{ padding: '20px' }}>
                    {/* Balance Card */}
                    <div style={{ 
                      backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '20px',
                      border: `1px solid ${theme.colors.border.primary}`
                    }}>
                      <div style={{ color: theme.colors.text.secondary, fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Total Balance</div>
                      <div style={{ color: theme.colors.text.primary, fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>KES 125,890</div>
                      <div style={{ color: theme.colors.success, fontSize: '16px', fontWeight: '600' }}>+12.5% today</div>
              </div>
              
                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                      <button style={{ 
                        flex: 1,
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.white,
                        border: 'none',
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>Send</button>
                      <button style={{ 
                        flex: 1,
                        backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>Receive</button>
                      <button style={{ 
                        flex: 1,
                        backgroundColor: theme.colors.background?.secondary || theme.colors.background,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>Swap</button>
              </div>
              
                    {/* Recent Transactions */}
                    <div>
                      <div style={{ color: theme.colors.text.primary, fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Recent Activity</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '12px', 
                          backgroundColor: theme.colors.background?.secondary || theme.colors.background, 
                          borderRadius: '10px',
                          border: `1px solid ${theme.colors.border.primary}`
                        }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            backgroundColor: theme.colors.success,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.white}/>
                            </svg>
                </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.colors.text.primary, fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Received BTC</div>
                            <div style={{ color: theme.colors.text.secondary, fontSize: '11px' }}>2 minutes ago</div>
                    </div>
                          <div style={{ color: theme.colors.success, fontSize: '13px', fontWeight: '700' }}>+₿0.001</div>
              </div>
              
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '12px', 
                          backgroundColor: theme.colors.background?.secondary || theme.colors.background, 
                          borderRadius: '10px',
                          border: `1px solid ${theme.colors.border.primary}`
                        }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            backgroundColor: theme.colors.primary,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.white}/>
                            </svg>
                </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: theme.colors.text.primary, fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>Sent ETH</div>
                            <div style={{ color: theme.colors.text.secondary, fontSize: '11px' }}>1 hour ago</div>
                    </div>
                          <div style={{ color: theme.colors.error, fontSize: '13px', fontWeight: '700' }}>-Ξ0.05</div>
                  </div>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{ backgroundColor: theme.colors.background.secondary }}>
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

      {/* Join Waiting List Section */}
      <section className="waiting-list-section" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background }}>
        <div className="waiting-list-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700' }}>
              <svg className="waiting-list-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill={theme.colors.primary}/>
                <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill={theme.colors.primary}/>
              </svg>
              Join the Waiting List
            </h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>
              Be among the first to experience the future of social finance
            </p>
          </div>
          
          <div className="waiting-list-content">
            <div className="waiting-list-info">
              <div className="benefits-list">
                <div className="benefit-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <svg className="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke={theme.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.success}/>
                  </svg>
                  <div className="benefit-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Early Access</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Get exclusive early access to new features and updates.</p>
                  </div>
                </div>
                
                <div className="benefit-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <svg className="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.success}/>
                  </svg>
                  <div className="benefit-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Priority Support</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Receive priority customer support and dedicated assistance.</p>
                      </div>
                    </div>
                
                <div className="benefit-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <svg className="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.success}/>
                  </svg>
                  <div className="benefit-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Exclusive Rewards</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Earn exclusive rewards and bonuses for being an early adopter.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="waiting-list-form">
              <div className="form-card" style={{ backgroundColor: theme.colors.background?.secondary || theme.colors.background, borderRadius: '12px', padding: '32px', border: `1px solid ${theme.colors.border.primary}` }}>
                <h3 style={{ color: theme.colors.text.primary, fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Get Early Access</h3>
                <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginBottom: '24px', lineHeight: '1.5' }}>
                  Join thousands of users waiting to experience the future of DeFi
                </p>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: `1px solid ${theme.colors.border.primary}`, 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      backgroundColor: theme.colors.background?.primary || theme.colors.background,
                      color: theme.colors.text.primary
                    }}
                  />
                </div>
                
                <button 
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    backgroundColor: theme.colors.primary, 
                    color: theme.colors.white, 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '12px 24px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    cursor: 'pointer' 
                  }}
                >
                  Join Waiting List
                </button>
                
                <p style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400', marginTop: '12px', textAlign: 'center' }}>
                  No spam, unsubscribe at any time
                </p>
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
              Join the biggest airdrop in African DeFi history
            </p>
          </div>
          
          <div className="airdrop-content">
            <div className="airdrop-info">
              <div className="airdrop-details">
                <div className="airdrop-stat" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: theme.colors.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.white}/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: theme.colors.text.primary, fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>1,000,000 NESTO</div>
                    <div style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Total Airdrop Value</div>
                  </div>
            </div>
            
                <div className="airdrop-stat" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: theme.colors.success,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 4C16 5.1 15.1 6 14 6C12.9 6 12 5.1 12 4C12 2.9 12.9 2 14 2C15.1 2 16 2.9 16 4Z" fill={theme.colors.white}/>
                      <path d="M8 4C8 5.1 7.1 6 6 6C4.9 6 4 5.1 4 4C4 2.9 4.9 2 6 2C7.1 2 8 2.9 8 4Z" fill={theme.colors.white}/>
                      <path d="M16 20C16 21.1 15.1 22 14 22C12.9 22 12 21.1 12 20C12 18.9 12.9 18 14 18C15.1 18 16 18.9 16 20Z" fill={theme.colors.white}/>
                      <path d="M8 20C8 21.1 7.1 22 6 22C4.9 22 4 21.1 4 20C4 18.9 4.9 18 6 18C7.1 18 8 18.9 8 20Z" fill={theme.colors.white}/>
                      <path d="M12 12C12 13.1 11.1 14 10 14C8.9 14 8 13.1 8 12C8 10.9 8.9 10 10 10C11.1 10 12 10.9 12 12Z" fill={theme.colors.white}/>
                      <path d="M16 12C16 13.1 15.1 14 14 14C12.9 14 12 13.1 12 12C12 10.9 12.9 10 14 10C15.1 10 16 10.9 16 12Z" fill={theme.colors.white}/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: theme.colors.text.primary, fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>10,000 Users</div>
                    <div style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Eligible Participants</div>
                  </div>
            </div>
            
                <div className="airdrop-stat" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: theme.colors.warning,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill={theme.colors.white}/>
                      <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill={theme.colors.white}/>
                    </svg>
            </div>
                  <div>
                    <div style={{ color: theme.colors.text.primary, fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>100 NESTO</div>
                    <div style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>Per User</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="airdrop-form">
              <div className="form-card" style={{ backgroundColor: theme.colors.background?.secondary || theme.colors.background, borderRadius: '16px', padding: '32px', border: `1px solid ${theme.colors.border.primary}` }}>
                <h3 style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Join the Airdrop</h3>
                <p style={{ color: theme.colors.text.secondary, fontSize: '16px', fontWeight: '400', marginBottom: '24px', lineHeight: '1.5' }}>
                  Be among the first 10,000 users to receive free NESTO tokens
                </p>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      border: `1px solid ${theme.colors.border.primary}`, 
                      borderRadius: '12px', 
                      fontSize: '16px', 
                      backgroundColor: theme.colors.background?.primary || theme.colors.background,
                      color: theme.colors.text.primary
                    }}
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <input 
                    type="text" 
                    placeholder="Your ICP wallet address"
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      border: `1px solid ${theme.colors.border.primary}`, 
                      borderRadius: '12px', 
                      fontSize: '16px', 
                      backgroundColor: theme.colors.background?.primary || theme.colors.background,
                      color: theme.colors.text.primary
                    }}
                  />
          </div>
          
          <button 
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    backgroundColor: theme.colors.primary, 
                    color: theme.colors.white, 
                    border: 'none', 
                    borderRadius: '12px', 
                    padding: '16px 24px', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Join Airdrop
          </button>
                
                <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginTop: '16px', textAlign: 'center' }}>
                  Airdrop distribution starts on March 1st, 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Waiting List Section */}
      <section className="waiting-list-section" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background }}>
        <div className="waiting-list-container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: theme.colors.text.primary, fontSize: '24px', fontWeight: '700' }}>
              <svg className="waiting-list-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill={theme.colors.primary}/>
                <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z" fill={theme.colors.primary}/>
              </svg>
              Join the Waiting List
            </h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400' }}>
              Be among the first to experience the future of social finance
            </p>
          </div>
          
          <div className="waiting-list-content">
            <div className="waiting-list-info">
              <div className="benefits-list">
                <div className="benefit-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <svg className="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke={theme.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.success}/>
                  </svg>
                  <div className="benefit-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Early Access</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Get exclusive early access to new features and updates.</p>
              </div>
                </div>
                
                <div className="benefit-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <svg className="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.success}/>
                  </svg>
                  <div className="benefit-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Priority Support</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Receive priority customer support and dedicated assistance.</p>
                </div>
              </div>
              
                <div className="benefit-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <svg className="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.success}/>
                  </svg>
                  <div className="benefit-content">
                    <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>Exclusive Rewards</h4>
                    <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>Earn exclusive rewards and bonuses for being an early adopter.</p>
                </div>
                </div>
                </div>
              </div>
              
            <div className="waiting-list-form">
              <div className="form-card" style={{ backgroundColor: theme.colors.background?.secondary || theme.colors.background, borderRadius: '12px', padding: '32px', border: `1px solid ${theme.colors.border.primary}` }}>
                <h3 style={{ color: theme.colors.text.primary, fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Get Early Access</h3>
                <p style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginBottom: '24px', lineHeight: '1.5' }}>
                  Join thousands of users waiting to experience the future of DeFi
                </p>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: `1px solid ${theme.colors.border.primary}`, 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      backgroundColor: theme.colors.background?.primary || theme.colors.background,
                      color: theme.colors.text.primary
                    }}
                  />
            </div>
            
                <button 
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    backgroundColor: theme.colors.primary, 
                    color: theme.colors.white, 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '12px 24px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    cursor: 'pointer' 
                  }}
                >
                  Join Waiting List
              </button>
                
                <p style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400', marginTop: '12px', textAlign: 'center' }}>
                  No spam, unsubscribe at any time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ backgroundColor: theme.colors.background?.primary || theme.colors.background, borderTop: `1px solid ${theme.colors.border.primary}` }}>
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo" style={{ backgroundColor: theme.colors.primary, width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="logo-text" style={{ color: theme.colors.white, fontSize: '16px', fontWeight: '600' }}>N</span>
                </div>
              <span className="logo-text" style={{ color: theme.colors.text.primary, fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Nisto</span>
              <p className="footer-description" style={{ color: theme.colors.text.secondary, fontSize: '14px', fontWeight: '400', marginTop: '12px', lineHeight: '1.5' }}>
                The future of social finance on the Internet Computer. DeFi, social trading, and AI-powered insights for the African market.
              </p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Platform</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px' }}><a href="#features" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Features</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#extension" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Browser Extension</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#tokenomics" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Tokenomics</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Mobile App</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Developers</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Documentation</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>API Reference</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>SDK</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>GitHub</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>About Us</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Blog</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Careers</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Press Kit</a></li>
                </ul>
          </div>
          
              <div className="footer-section">
                <h4 style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Support</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Help Center</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Contact Us</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Status</a></li>
                  <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: theme.colors.text.secondary, textDecoration: 'none', fontSize: '14px', fontWeight: '400', transition: 'color 0.2s ease' }}>Security</a></li>
                </ul>
                </div>
                </div>
              </div>
              
          <div className="footer-bottom">
              <div className="footer-legal">
              <span style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400' }}>© 2024 Nisto Finance. All rights reserved.</span>
              <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                <a href="#" style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#" style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#" style={{ color: theme.colors.text.secondary, fontSize: '12px', fontWeight: '400', textDecoration: 'none' }}>Cookie Policy</a>
                </div>
              </div>
            <div className="footer-social">
              <a href="#" style={{ color: theme.colors.text.secondary, marginLeft: '16px', fontSize: '14px', fontWeight: '400', textDecoration: 'none' }}>Twitter</a>
              <a href="#" style={{ color: theme.colors.text.secondary, marginLeft: '16px', fontSize: '14px', fontWeight: '400', textDecoration: 'none' }}>Discord</a>
              <a href="#" style={{ color: theme.colors.text.secondary, marginLeft: '16px', fontSize: '14px', fontWeight: '400', textDecoration: 'none' }}>Telegram</a>
              <a href="#" style={{ color: theme.colors.text.secondary, marginLeft: '16px', fontSize: '14px', fontWeight: '400', textDecoration: 'none' }}>LinkedIn</a>
            </div>
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