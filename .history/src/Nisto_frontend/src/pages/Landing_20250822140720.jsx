import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { 
  FiShield, 
  FiZap, 
  FiGlobe, 
  FiTrendingUp, 
  FiUsers, 
  FiCheckCircle,
  FiArrowRight,
  FiStar,
  FiDollarSign,
  FiSmartphone,
  FiLock,
  FiAward
} from 'react-icons/fi';
import '../App.scss';

function Landing() {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    transactions: 0,
    countries: 0
  });

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

  // Animate stats on component mount
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        users: 50000,
        transactions: 250000,
        countries: 45
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          users: Math.floor(targetStats.users * progress),
          transactions: Math.floor(targetStats.transactions * progress),
          countries: Math.floor(targetStats.countries * progress)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
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
      setLoginModalOpen(true);
    }
  };

  const handleInstallExtension = () => {
    // Check if the extension is already installed
    if (window.ethereum) {
      alert('Extension already installed!');
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1
        }}>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '100px',
            height: '100px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 7s ease-in-out infinite'
          }}></div>
        </div>

        {/* Navigation */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrollY > 50 ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          padding: '1rem 2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: scrollY > 50 ? '#1e293b' : 'white'
            }}>
              <FiShield size={32} />
              Nisto
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <button
                onClick={handleLaunchApp}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Launch App
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Main Headline */}
          <div style={{
            maxWidth: '800px',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '1.5rem',
              lineHeight: 1.2,
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              The Future of
              <span style={{
                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Digital Finance </span>
              is Here
            </h1>
            
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Experience the most secure, user-friendly crypto wallet with AI-powered insights, 
              seamless payments, and revolutionary DeFi features.
            </p>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '4rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleLaunchApp}
              style={{
                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                border: 'none',
                color: '#1e293b',
                padding: '1rem 2rem',
                borderRadius: '3rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.3)';
              }}
            >
              Get Started Free
              <FiArrowRight size={20} />
            </button>
            
            <button
              onClick={handleInstallExtension}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '3rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiSmartphone size={20} />
              Download App
            </button>
          </div>

          {/* Stats Section */}
          <div style={{
            display: 'flex',
            gap: '3rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '0.5rem',
                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {animatedStats.users.toLocaleString()}+
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Active Users</div>
            </div>
            
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '0.5rem',
                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ${(animatedStats.transactions / 1000).toFixed(0)}M+
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Transactions</div>
            </div>
            
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '0.5rem',
                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {animatedStats.countries}+
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Countries</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            opacity: 0.8
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}>
              <FiShield size={16} />
              Bank-Level Security
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}>
              <FiZap size={16} />
              Instant Transactions
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}>
              <FiGlobe size={16} />
              Global Access
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          opacity: 0.7,
          animation: 'bounce 2s infinite'
        }}>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            Scroll to explore
          </div>
          <div style={{ textAlign: 'center' }}>
            ↓
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Why Choose Nisto?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Experience the perfect blend of security, simplicity, and innovation
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature Cards */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white'
              }}>
                <FiShield size={28} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                Military-Grade Security
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: 1.6
              }}>
                Your assets are protected by the most advanced encryption and security protocols available.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white'
              }}>
                <FiZap size={28} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                Lightning Fast
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: 1.6
              }}>
                Send and receive crypto instantly with our optimized blockchain technology.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white'
              }}>
                <FiTrendingUp size={28} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                AI-Powered Insights
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: 1.6
              }}>
                Get intelligent investment recommendations and market analysis powered by AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '3rem'
          }}>
            Trusted by Crypto Enthusiasts Worldwide
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar key={star} size={32} style={{ color: '#ffd700' }} />
            ))}
            <span style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginLeft: '1rem'
            }}>
              4.9/5 Rating
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} size={16} style={{ color: '#ffd700' }} />
                ))}
              </div>
              <p style={{
                color: '#64748b',
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                "Nisto has completely changed how I manage my crypto. The interface is intuitive and the security features give me peace of mind."
              </p>
              <div style={{
                fontWeight: '600',
                color: '#1e293b'
              }}>
                - Sarah Chen, Crypto Investor
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} size={16} style={{ color: '#ffd700' }} />
                ))}
              </div>
              <p style={{
                color: '#64748b',
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                "The AI insights are incredible! I've made better investment decisions thanks to Nisto's intelligent recommendations."
              </p>
              <div style={{
                fontWeight: '600',
                color: '#1e293b'
              }}>
                - Michael Rodriguez, DeFi Trader
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} size={16} style={{ color: '#ffd700' }} />
                ))}
              </div>
              <p style={{
                color: '#64748b',
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                "Finally, a wallet that's both powerful and easy to use. The payment features are game-changing!"
              </p>
              <div style={{
                fontWeight: '600',
                color: '#1e293b'
              }}>
                - Emma Thompson, Business Owner
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1.5rem'
          }}>
            Ready to Join the Future of Finance?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '3rem',
            lineHeight: 1.6
          }}>
            Start your crypto journey today with the most advanced wallet ever created.
          </p>
          
          <button
            onClick={handleLaunchApp}
            style={{
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              border: 'none',
              color: '#1e293b',
              padding: '1.25rem 3rem',
              borderRadius: '3rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(255, 215, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.3)';
            }}
          >
            Get Started Now
            <FiArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}

export default Landing; 