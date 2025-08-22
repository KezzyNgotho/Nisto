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
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
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

    // Direct installation like MetaMask - no modal, just install
    try {
      if (process.env.NODE_ENV === 'production') {
        // Production: Direct Chrome Web Store installation
        const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/nesto-ic-wallet/...'; // Replace with actual URL
        window.open(chromeStoreUrl, '_blank');
      } else {
        // Development: Try to trigger installation directly
        // For now, we'll use a simple approach that works like MetaMask
        const installUrl = `${window.location.origin}/extension-install`;
        
        // Create a temporary iframe to trigger the installation
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = installUrl;
        document.body.appendChild(iframe);
        
        // Remove iframe after a short delay
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
        
        // Show a simple success message
        setTimeout(() => {
          alert('Extension installation initiated! Check your browser toolbar for the Nesto extension.');
        }, 500);
      }
    } catch (error) {
      console.error('Extension installation error:', error);
      // Only show modal as last resort
      setExtensionModalOpen(true);
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
                    🔌 Install Extension
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-background">
          <div className="floating-elements">
            <div className="floating-element crypto">₿</div>
            <div className="floating-element crypto">Ξ</div>
            <div className="floating-element crypto">💰</div>
            <div className="floating-element crypto">🚀</div>
            <div className="floating-element crypto">⚡</div>
            <div className="floating-element crypto">💎</div>
          </div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>Now Live on Internet Computer</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line">The Future of</span>
              <span className="title-line gradient-text">Social Finance</span>
              <span className="title-line">is Here</span>
            </h1>
            <p className="hero-subtitle">
              Nisto combines DeFi, social trading, and AI-powered insights on the Internet Computer. 
              Manage your portfolio, connect with traders, and access exclusive opportunities in Kenya's first decentralized finance ecosystem.
            </p>
            <div className="hero-actions">
              <button onClick={handleLaunchApp} className="btn btn-primary btn-lg hero-cta">
                <span className="btn-icon">🚀</span>
                Launch App
              </button>
              <button 
                onClick={handleInstallExtension}
                className="btn btn-extension btn-lg hero-cta"
                id="install-extension-btn"
              >
                <span className="btn-icon">🔌</span>
                Install Extension
              </button>
              <button 
                onClick={() => document.getElementById('waiting-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-secondary btn-lg hero-cta"
              >
                <span className="btn-icon">📋</span>
                Join Waiting List
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-video-container">
              <div className="video-intro">
                <h3 className="video-title">See Nisto in Action</h3>
                <p className="video-description">Watch our demo to see how Nisto is revolutionizing social finance on the Internet Computer</p>
              </div>
              <div className="youtube-video-wrapper">
                <iframe 
                  width="560" 
                  height="315" 
                  src="https://www.youtube.com/embed/1xIVECmTqvY" 
                  title="Nisto Demo Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  className="youtube-video"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to manage, grow, and socialize your crypto portfolio
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card defi">
              <div className="feature-hover-effect"></div>
              <div className="feature-icon defi-icon">🏦</div>
              <h3 className="feature-title">DeFi Integration</h3>
              <p className="feature-description">Access lending, borrowing, and yield farming protocols directly from your dashboard with seamless integration.</p>
              <div className="feature-stats">
                <span className="stat">50+ Protocols</span>
                <span className="stat">Auto-compound</span>
              </div>
            </div>
            
            <div className="feature-card social">
              <div className="feature-hover-effect"></div>
              <div className="feature-icon social-icon">👥</div>
              <h3 className="feature-title">Social Trading</h3>
              <p className="feature-description">Follow top traders, share strategies, and learn from the community with our advanced social features.</p>
              <div className="feature-stats">
                <span className="stat">Copy Trading</span>
                <span className="stat">Leaderboards</span>
              </div>
            </div>
            
            <div className="feature-card ai">
              <div className="feature-hover-effect"></div>
              <div className="feature-icon ai-icon">🤖</div>
              <h3 className="feature-title">AI-Powered Insights</h3>
              <p className="feature-description">Get personalized investment recommendations and market analysis powered by advanced machine learning.</p>
              <div className="feature-stats">
                <span className="stat">Smart Alerts</span>
                <span className="stat">Risk Analysis</span>
              </div>
            </div>
            
            <div className="feature-card mobile">
              <div className="feature-hover-effect"></div>
              <div className="feature-icon payments-icon">📱</div>
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

      {/* Browser Extension Section */}
      <section id="extension" className="extension-section">
        <div className="extension-container">
          <div className="section-header">
            <h2 className="section-title">Install Nisto Extension</h2>
            <p className="section-subtitle">
              Access Nisto directly from your browser. Trade, manage funds, and interact with DeFi protocols seamlessly.
            </p>
          </div>
          
          <div className="extension-content">
            <div className="extension-preview">
              <div className="browser-mockup">
                <div className="browser-header">
                  <div className="browser-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                  <div className="browser-url">nisto.finance</div>
                </div>
                <div className="browser-content">
                  <div className="extension-popup">
                    <div className="popup-header">
                      <div className="popup-logo">
                        <span>N</span>
                      </div>
                      <h4>Nisto Wallet</h4>
                    </div>
                    <div className="popup-balance">
                      <div className="balance-label">Total Balance</div>
                      <div className="balance-amount">KES 125,890</div>
                    </div>
                    <div className="popup-actions">
                      <button className="popup-btn send">Send</button>
                      <button className="popup-btn receive">Receive</button>
                      <button className="popup-btn swap">Swap</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="extension-info">
              <div className="extension-features">
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-content">
                    <h4>Secure Wallet</h4>
                    <p>Your keys, your crypto. Non-custodial wallet with hardware wallet support.</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-content">
                    <h4>Instant Transactions</h4>
                    <p>Lightning-fast transactions on ICP with minimal fees.</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🌐</div>
                  <div className="feature-content">
                    <h4>DeFi Integration</h4>
                    <p>Access DEXs, lending protocols, and yield farms directly from your browser.</p>
                  </div>
                </div>
              </div>
              
              <div className="download-buttons">
                <button className="btn btn-primary btn-lg download-btn">
                  <span className="btn-icon">🦊</span>
                  Add to Chrome
                </button>
                <button className="btn btn-secondary btn-lg download-btn">
                  <span className="btn-icon">🔥</span>
                  Add to Firefox
                </button>
                <button className="btn btn-secondary btn-lg download-btn">
                  <span className="btn-icon">🦁</span>
                  Add to Safari
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Airdrop Section */}
      <section className="airdrop-section">
        <div className="airdrop-container">
          <div className="airdrop-background">
            <div className="airdrop-particles">
              <div className="particle">🪂</div>
              <div className="particle">💎</div>
              <div className="particle">🎁</div>
              <div className="particle">⚡</div>
              <div className="particle">🚀</div>
            </div>
          </div>
          
          <div className="section-header">
            <h2 className="section-title">
              <span className="airdrop-emoji">🪂</span>
              Massive Airdrop Coming!
            </h2>
            <p className="section-subtitle">
              Join Nisto early and earn your share of 100M $NESTO tokens. The earlier you join, the more you earn!
            </p>
          </div>
          
          <div className="airdrop-tiers">
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
                The future of social finance on the Internet Computer. 
                Empowering Kenya's crypto ecosystem with DeFi, social trading, and AI-powered insights.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <span className="social-icon">🐦</span>
                  <span>Twitter</span>
                </a>
                <a href="#" className="social-link">
                  <span className="social-icon">💼</span>
                  <span>LinkedIn</span>
                </a>
                <a href="#" className="social-link">
                  <span className="social-icon">📘</span>
                  <span>Discord</span>
                </a>
                <a href="#" className="social-link">
                  <span className="social-icon">📱</span>
                  <span>Telegram</span>
                </a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4 className="link-group-title">Platform</h4>
                <div className="link-group-items">
                  <a href="#features" className="footer-link">Features</a>
                  <a href="#tokenomics" className="footer-link">Tokenomics</a>
                  <a href="#extension" className="footer-link">Browser Extension</a>
                  <button onClick={handleLaunchApp} className="footer-link">Launch App</button>
                </div>
              </div>
              
              <div className="link-group">
                <h4 className="link-group-title">Developers</h4>
                <div className="link-group-items">
                  <a href="#developers" className="footer-link">SDKs & APIs</a>
                  <a href="#" className="footer-link">Documentation</a>
                  <a href="#" className="footer-link">GitHub</a>
                  <a href="#" className="footer-link">Discord</a>
                </div>
              </div>
              
              <div className="link-group">
                <h4 className="link-group-title">Company</h4>
                <div className="link-group-items">
                  <a href="#" className="footer-link">About</a>
                  <a href="#" className="footer-link">Blog</a>
                  <a href="#" className="footer-link">Careers</a>
                  <a href="#" className="footer-link">Press Kit</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="footer-badges">
                <div className="badge">
                  <span className="badge-icon">🏆</span>
                  <span>ICP Ecosystem</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">🔒</span>
                  <span>Audited</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">🌍</span>
                  <span>Made in Kenya</span>
                </div>
              </div>
              
              <div className="footer-legal">
                <p className="copyright">&copy; 2024 Nisto Finance. All rights reserved.</p>
                <div className="legal-links">
                  <a href="#" className="legal-link">Privacy Policy</a>
                  <a href="#" className="legal-link">Terms of Service</a>
                  <a href="#" className="legal-link">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />

      {/* Extension Installation Modal */}
      {extensionModalOpen && (
        <div className="extension-modal-overlay" onClick={() => setExtensionModalOpen(false)}>
          <div className="extension-modal" onClick={(e) => e.stopPropagation()}>
            <div className="extension-modal-header">
              <h2 className="extension-modal-title">
                <span className="extension-icon">🔌</span>
                Install Nesto Extension
              </h2>
              <button 
                className="extension-modal-close"
                onClick={() => setExtensionModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="extension-modal-content">
              <div className="extension-preview">
                <div className="extension-preview-header">
                  <h3>Nesto - IC Wallet & Finance</h3>
                  <p>MetaMask-like extension for the Internet Computer</p>
                </div>
                <div className="extension-features">
                  <div className="extension-feature">
                    <span className="feature-icon">🔐</span>
                    <span>Secure Identity Management</span>
                  </div>
                  <div className="extension-feature">
                    <span className="feature-icon">💳</span>
                    <span>IC Wallet Operations</span>
                  </div>
                  <div className="extension-feature">
                    <span className="feature-icon">🌐</span>
                    <span>Dapp Integration</span>
                  </div>
                </div>
              </div>
              
              <div className="installation-steps">
                <h3>Installation Steps</h3>
                {process.env.NODE_ENV === 'production' ? (
                  <div className="production-install">
                    <p>Click the button below to install from Chrome Web Store:</p>
                    <button 
                      className="btn btn-extension btn-lg"
                      onClick={() => {
                        window.open('https://chrome.google.com/webstore/detail/nesto-ic-wallet/...', '_blank');
                        setExtensionModalOpen(false);
                      }}
                    >
                      🚀 Install from Chrome Web Store
                    </button>
                  </div>
                ) : (
                  <div className="development-install">
                    <ol className="install-steps-list">
                      <li>
                        <strong>Download Extension Files</strong>
                        <p>Download the extension files from our repository</p>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => window.open('/manifest-v3.json', '_blank')}
                        >
                          📁 Download Files
                        </button>
                      </li>
                      <li>
                        <strong>Open Chrome Extensions</strong>
                        <p>Navigate to <code>chrome://extensions/</code></p>
                      </li>
                      <li>
                        <strong>Enable Developer Mode</strong>
                        <p>Toggle "Developer mode" in the top right corner</p>
                      </li>
                      <li>
                        <strong>Load Extension</strong>
                        <p>Click "Load unpacked" and select the extension folder</p>
                      </li>
                      <li>
                        <strong>Start Using</strong>
                        <p>The Nesto extension will appear in your toolbar!</p>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
              
              <div className="extension-benefits">
                <h3>Why Install Nesto Extension?</h3>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <h4>One-Click Dapp Connection</h4>
                    <p>Connect to any IC dapp instantly without manual identity management</p>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🔒</span>
                    <h4>Secure Transactions</h4>
                    <p>Sign transactions securely with your stored identities</p>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">💼</span>
                    <h4>Portfolio Management</h4>
                    <p>View balances and manage your IC assets in one place</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Landing; 