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
    <div className="landing-page" style={{ backgroundColor: theme.colors.background.primary }}>
      <ThemeSwitcher />
      
      {/* Navigation */}
      <nav className={`main-nav ${scrollY > 50 ? 'nav-scrolled' : ''}`} 
           style={{ backgroundColor: theme.colors.background.secondary }}>
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-logo" style={{ backgroundColor: theme.colors.primary }}>
                <span className="logo-text" style={{ color: theme.colors.white }}>N</span>
              </div>
              <span className="brand-name" style={{ color: theme.colors.text.primary }}>Nisto</span>
            </div>
            
            <div className="nav-links-desktop">
              <a href="#home" className="nav-link" style={{ color: theme.colors.text.secondary }}>Home</a>
              <a href="#features" className="nav-link" style={{ color: theme.colors.text.secondary }}>Features</a>
              {!isAuthenticated && (
                <div className="nav-auth-buttons">
                  <button onClick={handleLaunchApp} className="btn btn-primary nav-cta" disabled={isLoading}
                          style={{ backgroundColor: theme.colors.primary, color: theme.colors.white }}>
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
                    <span className="btn-icon">🔌</span>
                    Get Extension
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge" style={{ backgroundColor: theme.colors.background.secondary }}>
              <svg className="badge-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={theme.colors.primary}/>
              </svg>
              <span style={{ color: theme.colors.text.secondary }}>Live on Internet Computer</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line" style={{ color: theme.colors.text.primary }}>The Future of</span>
              <span className="title-line gradient-text">Social Finance</span>
            </h1>
            <p className="hero-subtitle" style={{ color: theme.colors.text.secondary }}>
              DeFi, social trading, and AI-powered insights on the Internet Computer. 
              Kenya's first decentralized finance ecosystem.
            </p>
            <div className="hero-actions">
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg hero-cta"
                      style={{ backgroundColor: theme.colors.primary, color: theme.colors.white }}>
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                </svg>
                Launch App
              </button>
              <button 
                onClick={handleInstallExtension}
                className="btn btn-secondary btn-lg hero-cta"
                style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary }}>
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
              <div className="demo-card" style={{ backgroundColor: theme.colors.background.secondary }}>
                <div className="demo-header">
                  <div className="demo-dots">
                    <span style={{ backgroundColor: theme.colors.border.primary }}></span>
                    <span style={{ backgroundColor: theme.colors.border.primary }}></span>
                    <span style={{ backgroundColor: theme.colors.border.primary }}></span>
                  </div>
                </div>
                <div className="demo-content">
                  <div className="demo-balance">
                    <span className="balance-label" style={{ color: theme.colors.text.secondary }}>Total Portfolio</span>
                    <span className="balance-amount" style={{ color: theme.colors.text.primary }}>KES 125,890</span>
                  </div>
                  <div className="demo-stats">
                    <div className="stat">
                      <span className="stat-value" style={{ color: theme.colors.success }}>+12.5%</span>
                      <span className="stat-label" style={{ color: theme.colors.text.secondary }}>Today</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value" style={{ color: theme.colors.text.primary }}>₿0.024</span>
                      <span className="stat-label" style={{ color: theme.colors.text.secondary }}>BTC</span>
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
            <h2 className="section-title" style={{ color: theme.colors.text.primary }}>Key Features</h2>
            <p className="section-subtitle" style={{ color: theme.colors.text.secondary }}>
              Everything you need for modern crypto finance
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" style={{ backgroundColor: theme.colors.background.primary }}>
              <div className="feature-icon">🏦</div>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary }}>DeFi Integration</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary }}>
                Access lending, borrowing, and yield farming protocols seamlessly.
              </p>
            </div>
            
            <div className="feature-card" style={{ backgroundColor: theme.colors.background.primary }}>
              <div className="feature-icon">👥</div>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary }}>Social Trading</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary }}>
                Follow top traders and share strategies with the community.
              </p>
            </div>
            
            <div className="feature-card" style={{ backgroundColor: theme.colors.background.primary }}>
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary }}>AI Insights</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary }}>
                Get personalized investment recommendations and market analysis.
              </p>
            </div>
            
            <div className="feature-card" style={{ backgroundColor: theme.colors.background.primary }}>
              <div className="feature-icon">📱</div>
              <h3 className="feature-title" style={{ color: theme.colors.text.primary }}>Mobile Money</h3>
              <p className="feature-description" style={{ color: theme.colors.text.secondary }}>
                Seamlessly connect M-Pesa and Airtel Money for easy crypto on-ramps and off-ramps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ backgroundColor: theme.colors.background.primary }}>
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title" style={{ color: theme.colors.text.primary }}>Ready to Get Started?</h2>
            <p className="cta-subtitle" style={{ color: theme.colors.text.secondary }}>
              Join thousands of users already managing their crypto portfolio on Nisto
            </p>
            <div className="cta-actions">
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg"
                      style={{ backgroundColor: theme.colors.primary, color: theme.colors.white }}>
                Launch App
              </button>
              <button onClick={handleInstallExtension} className="btn btn-secondary btn-lg"
                      style={{ backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary }}>
                Get Extension
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
            <p className="copyright" style={{ color: theme.colors.text.secondary }}>&copy; 2024 Nisto Finance. All rights reserved.</p>
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