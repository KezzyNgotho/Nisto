import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../App.scss';

function Landing() {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const navigate = useNavigate();

  // Waiting list form state
  const [waitingListForm, setWaitingListForm] = useState({
    email: '',
    role: 'user',
    interests: []
  });

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

  const handleJoinWaitingList = async (e) => {
    e.preventDefault();
    alert(`Thank you ${waitingListForm.email}! You've been added to our waiting list. We'll notify you when Nisto launches!`);
    setWaitingListForm({ email: '', role: 'user', interests: [] });
  };

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // Always show the login modal first
      setLoginModalOpen(true);
    }
  };

  const handleInstallExtension = () => {
    // Check if the extension is already installed
    if (window.nesto && window.nesto.isNesto) {
      alert('Nesto Extension is already installed! 🎉');
      return;
    }

    // Check if we're in Chrome
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (!isChrome) {
      alert('Please install Chrome to use the Nesto Extension. We\'ll support other browsers soon!');
      return;
    }

    // Direct installation like MetaMask - simple and immediate
    try {
      // For both development and production, use Chrome Web Store approach
      // This is exactly how MetaMask does it
      const chromeStoreUrl = process.env.NODE_ENV === 'production' 
        ? 'https://chrome.google.com/webstore/detail/nesto-ic-wallet/...' // Replace with actual URL
        : 'https://chrome.google.com/webstore/category/extensions'; // Fallback for development
      
      // Open Chrome Web Store directly - no modal, no instructions
      window.open(chromeStoreUrl, '_blank');
      
    } catch (error) {
      console.error('Extension installation error:', error);
      // Minimal fallback - just a simple alert
      alert('Please install the Nesto extension from the Chrome Web Store to continue.');
    }
  };



  return (
    <div className="landing-page">
      {/* Theme Switcher */}
      <ThemeSwitcher />
      
      {/* Animated Background */}
      <div className="landing-background">
        <div className="floating-particles"></div>
        <div className="golden-confetti"></div>
      </div>
      
      {/* Enhanced Navigation */}
      <nav className={`main-nav ${scrollY > 50 ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-logo">
                <span className="logo-text">N</span>
              </div>
              <span className="brand-name">Nisto</span>
            </div>
            
            <div className="nav-links-desktop">
              <a href="#home" className="nav-link">Home</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#extension" className="nav-link">Extension</a>
              <a href="#miniapps" className="nav-link">Mini-Apps</a>
              <a href="#developers" className="nav-link">Developers</a>
              <a href="#tokenomics" className="nav-link">Tokenomics</a>
              {!isAuthenticated && (
                <div className="nav-auth-buttons">
                  <button onClick={handleLaunchApp} className="btn btn-primary nav-cta" disabled={isLoading}>
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
            <div className="mobile-menu">
              <a href="#home" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#features" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#extension" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Extension</a>
              <a href="#miniapps" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Mini-Apps</a>
              <a href="#developers" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Developers</a>
              <a href="#tokenomics" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Tokenomics</a>
              {!isAuthenticated && (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); handleLaunchApp(); }} className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Launch App'}
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); handleInstallExtension(); }} className="btn btn-extension">
                    <span className="chrome-logo-mobile">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                        <circle cx="12" cy="12" r="8" fill="white"/>
                        <circle cx="12" cy="12" r="6" fill="#4285F4"/>
                        <path d="M12 2C16.4183 2 20 5.58172 20 10H12V2Z" fill="#EA4335"/>
                        <path d="M20 12C20 16.4183 16.4183 20 12 20V12H20Z" fill="#34A853"/>
                        <path d="M12 20C7.58172 20 4 16.4183 4 12H12V20Z" fill="#FBBC05"/>
                        <path d="M4 12C4 7.58172 7.58172 4 12 4V12H4Z" fill="#4285F4"/>
                      </svg>
                    </span>
                    Download Chrome Extension
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Sleek Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>Live on Internet Computer</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line">The Future of</span>
              <span className="title-line gradient-text">Social Finance</span>
            </h1>
            <p className="hero-subtitle">
              DeFi, social trading, and AI-powered insights on the Internet Computer. 
              Kenya's first decentralized finance ecosystem.
            </p>
            <div className="hero-actions">
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg hero-cta">
                <span className="btn-icon">🚀</span>
                Launch App
              </button>
              <button 
                onClick={handleInstallExtension}
                className="btn btn-secondary btn-lg hero-cta"
                id="install-extension-btn"
              >
                <span className="btn-icon">🔌</span>
                Get Extension
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-demo">
              <div className="demo-card">
                <div className="demo-header">
                  <div className="demo-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="demo-content">
                  <div className="demo-balance">
                    <span className="balance-label">Total Portfolio</span>
                    <span className="balance-amount">KES 125,890</span>
                  </div>
                  <div className="demo-stats">
                    <div className="stat">
                      <span className="stat-value">+12.5%</span>
                      <span className="stat-label">Today</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">₿0.024</span>
                      <span className="stat-label">BTC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Key Features</h2>
            <p className="section-subtitle">
              Everything you need for modern crypto finance
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏦</div>
              <h3 className="feature-title">DeFi Integration</h3>
              <p className="feature-description">Access lending, borrowing, and yield farming protocols seamlessly.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Social Trading</h3>
              <p className="feature-description">Follow top traders and share strategies with the community.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Insights</h3>
              <p className="feature-description">Get personalized investment recommendations and market analysis.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Mobile Money</h3>
              <p className="feature-description">Seamlessly connect M-Pesa and Airtel Money for easy crypto on-ramps and off-ramps.</p>
              <div className="feature-stats">
                <span className="stat">Instant Deposits</span>
                <span className="stat">Low Fees</span>
              </div>
            </div>
            
            <div className="feature-card security">
              <div className="feature-hover-effect"></div>
              <div className="feature-icon security-icon">🔒</div>
              <h3 className="feature-title">Bank-Level Security</h3>
              <p className="feature-description">Multi-signature wallets and hardware security modules protect your assets with institutional-grade security.</p>
              <div className="feature-stats">
                <span className="stat">Multi-sig</span>
                <span className="stat">Hardware HSM</span>
              </div>
            </div>
            
            <div className="feature-card plugins">
              <div className="feature-hover-effect"></div>
              <div className="feature-icon plugins-icon">🧩</div>
              <h3 className="feature-title">Plugin Ecosystem</h3>
              <p className="feature-description">Build and use mini-apps for trading, gaming, NFTs, and custom financial tools in our marketplace.</p>
              <div className="feature-stats">
                <span className="stat">50+ Mini-Apps</span>
                <span className="stat">Developer APIs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mini-Apps Marketplace Section - Coming Soon */}
      <section id="miniapps" className="miniapps-section">
        <div className="miniapps-container">
          <div className="section-header">
            <div className="coming-soon-badge">
              <span className="badge-icon">🚀</span>
              <span>Coming Soon</span>
            </div>
            <h2 className="section-title">Mini-Apps Marketplace</h2>
            <p className="section-subtitle">
              A revolutionary ecosystem where developers can build and users can discover powerful financial mini-apps. 
              From automated trading bots to yield optimizers, everything you need will be at your fingertips.
            </p>
          </div>
          
          <div className="marketplace-preview">
            <div className="preview-header">
              <h3 className="preview-title">What to Expect</h3>
              <p className="preview-description">
                The Mini-Apps Marketplace will be your gateway to a world of financial tools and services, 
                all seamlessly integrated into the Nisto ecosystem.
              </p>
            </div>
            
            <div className="categories-showcase">
              <div className="category-card defi-category">
                <div className="category-header">
                  <div className="category-icon">📈</div>
                  <h4>DeFi & Trading</h4>
                  <span className="app-count">15+ Apps</span>
                </div>
                <div className="category-apps">
                  <div className="app-preview">
                    <div className="app-icon">⚡</div>
                    <div className="app-info">
                      <span className="app-name">Yield Optimizer</span>
                      <span className="app-desc">Automatically find and compound the best yields across protocols</span>
                    </div>
                    <div className="app-status coming-soon">Coming Soon</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">🤖</div>
                    <div className="app-info">
                      <span className="app-name">Trading Bot Builder</span>
                      <span className="app-desc">Create custom trading strategies with no-code tools</span>
                    </div>
                    <div className="app-status beta">Q2 2024</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">🔍</div>
                    <div className="app-info">
                      <span className="app-name">Arbitrage Scanner</span>
                      <span className="app-desc">Discover arbitrage opportunities across exchanges</span>
                    </div>
                    <div className="app-status beta">Beta Soon</div>
                  </div>
                </div>
              </div>
              
              <div className="category-card nft-category">
                <div className="category-header">
                  <div className="category-icon">🖼️</div>
                  <h4>NFT & Gaming</h4>
                  <span className="app-count">12+ Apps</span>
                </div>
                <div className="category-apps">
                  <div className="app-preview">
                    <div className="app-icon">📊</div>
                    <div className="app-info">
                      <span className="app-name">NFT Portfolio Tracker</span>
                      <span className="app-desc">Track your NFT collection value and market trends</span>
                    </div>
                    <div className="app-status coming-soon">Coming Soon</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">🎮</div>
                    <div className="app-info">
                      <span className="app-name">Play-to-Earn Hub</span>
                      <span className="app-desc">Manage gaming assets and track P2E rewards</span>
                    </div>
                    <div className="app-status beta">Q3 2024</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">🛒</div>
                    <div className="app-info">
                      <span className="app-name">NFT Marketplace</span>
                      <span className="app-desc">Buy, sell, and trade NFTs with integrated wallet</span>
                    </div>
                    <div className="app-status planning">Planning</div>
                  </div>
                </div>
              </div>
              
              <div className="category-card analytics-category">
                <div className="category-header">
                  <div className="category-icon">📊</div>
                  <h4>Analytics & Tools</h4>
                  <span className="app-count">10+ Apps</span>
                </div>
                <div className="category-apps">
                  <div className="app-preview">
                    <div className="app-icon">📈</div>
                    <div className="app-info">
                      <span className="app-name">Portfolio Analytics</span>
                      <span className="app-desc">Advanced analytics and performance tracking</span>
                    </div>
                    <div className="app-status beta">Beta</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">💰</div>
                    <div className="app-info">
                      <span className="app-name">Tax Calculator</span>
                      <span className="app-desc">Calculate crypto taxes and generate reports</span>
                    </div>
                    <div className="app-status">Q2 2024</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">⚖️</div>
                    <div className="app-info">
                      <span className="app-name">Risk Assessment</span>
                      <span className="app-desc">Analyze portfolio risk and get recommendations</span>
                    </div>
                    <div className="app-status coming-soon">Coming Soon</div>
                  </div>
                </div>
              </div>
              
              <div className="category-card social-category">
                <div className="category-header">
                  <div className="category-icon">👥</div>
                  <h4>Social & Community</h4>
                  <span className="app-count">8+ Apps</span>
                </div>
                <div className="category-apps">
                  <div className="app-preview">
                    <div className="app-icon">📋</div>
                    <div className="app-info">
                      <span className="app-name">Social Trading</span>
                      <span className="app-desc">Follow and copy successful traders' strategies</span>
                    </div>
                    <div className="app-status beta">Beta</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">👥</div>
                    <div className="app-info">
                      <span className="app-name">Group Investments</span>
                      <span className="app-desc">Pool funds with friends for larger investments</span>
                    </div>
                    <div className="app-status">Q3 2024</div>
                  </div>
                  <div className="app-preview">
                    <div className="app-icon">🗳️</div>
                    <div className="app-info">
                      <span className="app-name">Community Governance</span>
                      <span className="app-desc">Vote on protocol upgrades and decisions</span>
                    </div>
                    <div className="app-status live">Live</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="marketplace-features">
            <div className="features-grid">
              <div className="feature-highlight">
                <div className="feature-icon">🔒</div>
                <h4>Secure by Design</h4>
                <p>All mini-apps go through rigorous security audits and approval processes</p>
                <div className="feature-badge">Security First</div>
              </div>
              <div className="feature-highlight">
                <div className="feature-icon">⚡</div>
                <h4>One-Click Integration</h4>
                <p>Seamlessly integrate with your Nisto wallet and existing portfolio</p>
                <div className="feature-badge">Instant Setup</div>
              </div>
              <div className="feature-highlight">
                <div className="feature-icon">💰</div>
                <h4>Flexible Pricing</h4>
                <p>Free, freemium, and premium models - choose what works for you</p>
                <div className="feature-badge">Fair Pricing</div>
              </div>
              <div className="feature-highlight">
                <div className="feature-icon">🛠️</div>
                <h4>Developer Friendly</h4>
                <p>Built with modern APIs and SDKs for easy development and deployment</p>
                <div className="feature-badge">Open Platform</div>
              </div>
            </div>
          </div>
          
          <div className="marketplace-cta">
            <div className="cta-content">
              <h3>Ready to Explore?</h3>
              <p>Be the first to know when the Mini-Apps Marketplace launches. Join our waiting list for early access and exclusive rewards!</p>
              <button 
                onClick={() => document.getElementById('waiting-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-primary btn-lg marketplace-btn"
              >
                <span className="btn-icon">🚀</span>
                Get Early Access
              </button>
            </div>
            <div className="cta-stats">
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Mini-Apps Planned</div>
                <div className="stat-icon">🎯</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">200+</div>
                <div className="stat-label">Developers Interested</div>
                <div className="stat-icon">👨‍💻</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">Q2 2024</div>
                <div className="stat-label">Launch Target</div>
                <div className="stat-icon">📅</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Developers Section */}
      <section id="developers" className="developers-section">
        <div className="developers-container">
          <div className="section-header">
            <h2 className="section-title">For Developers</h2>
            <p className="section-subtitle">
              Build the future of DeFi with powerful APIs, SDKs, and developer tools
            </p>
          </div>
          
          <div className="developers-content">
            <div className="developers-info">
              <h3>Build on Nisto</h3>
              <p>
                Join our growing ecosystem of developers building innovative DeFi applications. 
                Access powerful APIs, comprehensive documentation, and a supportive community.
              </p>
              
              <div className="developer-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">⚡</div>
                  <span className="benefit-text">RESTful APIs & WebSocket feeds</span>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🔧</div>
                  <span className="benefit-text">SDKs for JavaScript, Python, Rust</span>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">📚</div>
                  <span className="benefit-text">Comprehensive documentation</span>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">💡</div>
                  <span className="benefit-text">Developer support & community</span>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">💰</div>
                  <span className="benefit-text">Revenue sharing for successful apps</span>
                </div>
              </div>
              
              <div className="developer-cta">
                <a href="#" className="developer-btn primary">
                  <span className="btn-icon">🚀</span>
                  Get Started
                </a>
                <a href="#" className="developer-btn secondary">
                  <span className="btn-icon">📖</span>
                  View Docs
                </a>
              </div>
            </div>
            
            <div className="developers-resources">
              <div className="resources-header">
                <h3>Developer Resources</h3>
                <p>Everything you need to start building on Nisto</p>
              </div>
              
              <div className="resources-grid">
                <div className="resource-card">
                  <div className="resource-icon">📖</div>
                  <div className="resource-title">API Documentation</div>
                  <div className="resource-desc">Complete API reference with examples</div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">⚙️</div>
                  <div className="resource-title">SDKs & Libraries</div>
                  <div className="resource-desc">Official SDKs for popular languages</div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">🎯</div>
                  <div className="resource-title">Code Examples</div>
                  <div className="resource-desc">Ready-to-use code snippets</div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">🛠️</div>
                  <div className="resource-title">Developer Tools</div>
                  <div className="resource-desc">Testing and debugging utilities</div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">👥</div>
                  <div className="resource-title">Community</div>
                  <div className="resource-desc">Discord, GitHub, and forums</div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">📝</div>
                  <div className="resource-title">Blog & Updates</div>
                  <div className="resource-desc">Latest news and tutorials</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="developers-stats">
            <div className="dev-stat-card">
              <div className="dev-stat-number">500+</div>
              <div className="dev-stat-label">Active Developers</div>
              <div className="dev-stat-icon">👨‍💻</div>
            </div>
            <div className="dev-stat-card">
              <div className="dev-stat-number">50+</div>
              <div className="dev-stat-label">Mini-Apps Built</div>
              <div className="dev-stat-icon">🧩</div>
            </div>
            <div className="dev-stat-card">
              <div className="dev-stat-number">99.9%</div>
              <div className="dev-stat-label">API Uptime</div>
              <div className="dev-stat-icon">⚡</div>
            </div>
            <div className="dev-stat-card">
              <div className="dev-stat-number">24/7</div>
              <div className="dev-stat-label">Developer Support</div>
              <div className="dev-stat-icon">🛟</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Tokenomics Section */}
      <section id="tokenomics" className="tokenomics-section">
        <div className="tokenomics-container">
          <div className="section-header">
            <h2 className="section-title">$NESTO Tokenomics</h2>
            <p className="section-subtitle">
              Fair distribution and sustainable economics for the Nisto ecosystem
            </p>
          </div>
          
          <div className="tokenomics-content">
            <div className="tokenomics-chart">
              <div className="chart-title">Token Distribution</div>
              <div className="distribution-items">
                <div className="distribution-item community">
                  <div className="item-color"></div>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-name">Community & Users</span>
                      <span className="item-percentage">40%</span>
                    </div>
                    <div className="item-description">Airdrops, rewards, and incentives</div>
                  </div>
                </div>
                
                <div className="distribution-item development">
                  <div className="item-color"></div>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-name">Development Fund</span>
                      <span className="item-percentage">25%</span>
                    </div>
                    <div className="item-description">Platform development and maintenance</div>
                  </div>
                </div>
                
                <div className="distribution-item team">
                  <div className="item-color"></div>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-name">Team & Advisors</span>
                      <span className="item-percentage">15%</span>
                    </div>
                    <div className="item-description">4-year vesting schedule</div>
                  </div>
                </div>
                
                <div className="distribution-item liquidity">
                  <div className="item-color"></div>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-name">Liquidity & Ecosystem</span>
                      <span className="item-percentage">10%</span>
                    </div>
                    <div className="item-description">DEX liquidity and ecosystem development</div>
                  </div>
                </div>
                
                <div className="distribution-item reserve">
                  <div className="item-color"></div>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-name">Reserve Fund</span>
                      <span className="item-percentage">10%</span>
                    </div>
                    <div className="item-description">Emergency fund and future initiatives</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="utility-card">
              <h3 className="utility-title">Token Utility</h3>
              <div className="utility-items">
                <div className="utility-item">
                  <div className="utility-icon">🗳️</div>
                  <div className="utility-content">
                    <div className="utility-name">Governance Voting</div>
                    <div className="utility-description">Vote on platform features and proposals</div>
                  </div>
                </div>
                
                <div className="utility-item">
                  <div className="utility-icon">💰</div>
                  <div className="utility-content">
                    <div className="utility-name">Staking Rewards</div>
                    <div className="utility-description">Earn yield by staking NESTO tokens</div>
                  </div>
                </div>
                
                <div className="utility-item">
                  <div className="utility-icon">💳</div>
                  <div className="utility-content">
                    <div className="utility-name">Platform Fees</div>
                    <div className="utility-description">Reduced fees when using NESTO</div>
                  </div>
                </div>
                
                <div className="utility-item">
                  <div className="utility-icon">🛒</div>
                  <div className="utility-content">
                    <div className="utility-name">Plugin Marketplace</div>
                    <div className="utility-description">Purchase and sell plugins with NESTO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">
              Join thousands of users already managing their crypto portfolio on Nisto
            </p>
            <div className="cta-actions">
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg">
                Launch App
              </button>
              <button onClick={handleInstallExtension} className="btn btn-secondary btn-lg">
                Get Extension
              </button>
            </div>
          </div>
        </div>
      </section>
            <div className="tier-card early-bird">
              <div className="tier-icon">🥇</div>
              <h3 className="tier-title">Early Birds</h3>
              <div className="tier-reward">1,000 NESTO</div>
              <p className="tier-description">First 1,000 users get 1,000 NESTO each</p>
              <div className="tier-status">Limited Time</div>
            </div>
            
            <div className="tier-card power-user">
              <div className="tier-icon">💎</div>
              <h3 className="tier-title">Power Users</h3>
              <div className="tier-reward">Up to 10,000 NESTO</div>
              <p className="tier-description">Complete tasks to earn maximum rewards</p>
              <div className="tier-status">Task-Based</div>
            </div>
            
            <div className="tier-card referral">
              <div className="tier-icon">🔗</div>
              <h3 className="tier-title">Referrals</h3>
              <div className="tier-reward">500 NESTO</div>
              <p className="tier-description">Earn for each successful invitation</p>
              <div className="tier-status">Unlimited</div>
            </div>
          </div>
          
          <button 
            onClick={() => document.getElementById('waiting-list')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-success btn-lg airdrop-cta"
          >
            <span className="btn-icon">🎁</span>
            Claim Your Airdrop
          </button>
        </div>
      </section>

      {/* Enhanced Waiting List Section */}
      <section id="waiting-list" className="waiting-list-section">
        <div className="waiting-list-container">
          <div className="section-header">
            <h2 className="section-title">Join the Revolution</h2>
            <p className="section-subtitle">
              Be among the first to experience the future of social finance. Get early access and exclusive rewards.
            </p>
          </div>
          
          <div className="waiting-list-form-wrapper">
            <form onSubmit={handleJoinWaitingList} className="waiting-list-form">
              <div className="form-header">
                <div className="form-icon">🚀</div>
                <h3>Get Early Access</h3>
              </div>
              
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={waitingListForm.email}
                    onChange={(e) => setWaitingListForm({...waitingListForm, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">I am a...</label>
                  <select
                    className="form-input"
                    value={waitingListForm.role}
                    onChange={(e) => setWaitingListForm({...waitingListForm, role: e.target.value})}
                  >
                    <option value="user">👤 Individual User</option>
                    <option value="developer">👨‍💻 Developer</option>
                    <option value="business">🏢 Business/Institution</option>
                  </select>
                </div>
              </div>
              
              <div className="form-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Early Access</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎁</span>
                  <span>Exclusive Airdrops</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔥</span>
                  <span>Beta Features</span>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg form-submit">
                <span className="btn-icon">🚀</span>
                Join Waiting List
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Enhanced Documentation Section */}
      <section className="docs-section">
        <div className="docs-container">
          <div className="section-header">
            <h2 className="section-title">Learn More</h2>
            <p className="section-subtitle">
              Dive deeper into Nisto's technology, tokenomics, and ecosystem
            </p>
          </div>
          
          <div className="docs-grid">
            <div className="doc-card">
              <div className="doc-icon whitepaper-icon">📄</div>
              <h3 className="doc-title">Whitepaper</h3>
              <p className="doc-description">
                Deep dive into Nisto's architecture, tokenomics, and vision for the future
              </p>
              <button className="btn btn-secondary doc-button">
                <span className="btn-icon">📖</span>
                Read Whitepaper
              </button>
            </div>
            
            <div className="doc-card">
              <div className="doc-icon developer-icon">🛠️</div>
              <h3 className="doc-title">Technical Documentation</h3>
              <p className="doc-description">
                API references, integration guides, and developer resources
              </p>
              <button className="btn btn-secondary doc-button">
                <span className="btn-icon">⚙️</span>
                View Docs
              </button>
            </div>
            
            <div className="doc-card">
              <div className="doc-icon roadmap-icon">🎓</div>
              <h3 className="doc-title">Academy</h3>
              <p className="doc-description">
                Learn DeFi, trading strategies, and blockchain fundamentals
              </p>
              <button className="btn btn-secondary doc-button">
                <span className="btn-icon">🚀</span>
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <span>N</span>
                </div>
                <span className="logo-text">Nisto</span>
              </div>
              <p className="footer-description">
                The future of social finance on the Internet Computer
              </p>
            </div>
            
            <div className="footer-links">
              <a href="#features" className="footer-link">Features</a>
              <button onClick={handleLaunchApp} className="footer-link">Launch App</button>
              <a href="#" className="footer-link">Twitter</a>
              <a href="#" className="footer-link">Discord</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; 2024 Nisto Finance. All rights reserved.</p>
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