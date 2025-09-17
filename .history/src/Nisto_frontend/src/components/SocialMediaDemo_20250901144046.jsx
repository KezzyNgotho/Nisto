import React, { useState, useEffect } from 'react';
import SocialMediaHandler from '../services/SocialMediaHandler';
import './SocialMediaDemo.scss';

const SocialMediaDemo = () => {
  const [socialHandler, setSocialHandler] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [demoMessage, setDemoMessage] = useState('');
  const [demoResponse, setDemoResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [platformStats, setPlatformStats] = useState({});
  const [healthStatus, setHealthStatus] = useState({});

  useEffect(() => {
    // Initialize social media handler
    const handler = new SocialMediaHandler();
    setSocialHandler(handler);

    // Get initial stats
    updateStats(handler);
    updateHealthStatus(handler);

    // Update stats every 30 seconds
    const interval = setInterval(() => {
      updateStats(handler);
      updateHealthStatus(handler);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateStats = async (handler) => {
    if (handler) {
      const stats = handler.getPlatformStats();
      setPlatformStats(stats);
    }
  };

  const updateHealthStatus = async (handler) => {
    if (handler) {
      const health = await handler.healthCheck();
      setHealthStatus(health);
    }
  };

  const handleDemoMessage = async () => {
    if (!demoMessage.trim() || !socialHandler) return;

    setIsProcessing(true);
    setDemoResponse('');

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Process the message through the selected platform
      const response = await socialHandler.processMessage(selectedPlatform, {
        text: demoMessage,
        senderId: 'demo_user',
        platform: selectedPlatform
      });

      setDemoResponse(response || 'Message processed successfully!');
    } catch (error) {
      setDemoResponse(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: '📱',
      whatsapp: '💬',
      twitter: '🐦',
      telegram: '📡',
      discord: '🎮',
      slack: '💼'
    };
    return icons[platform] || '🌐';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: '#E4405F',
      whatsapp: '#25D366',
      twitter: '#1DA1F2',
      telegram: '#0088CC',
      discord: '#5865F2',
      slack: '#4A154B'
    };
    return colors[platform] || '#666';
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', users: '1.5B+', features: 'DMs, Stories, Reels' },
    { id: 'whatsapp', name: 'WhatsApp', users: '2B+', features: 'Chats, Groups, Voice' },
    { id: 'twitter', name: 'Twitter/X', users: '500M+', features: 'Tweets, DMs, Spaces' },
    { id: 'telegram', name: 'Telegram', users: '800M+', features: 'Channels, Groups, Bots' },
    { id: 'discord', name: 'Discord', users: '150M+', features: 'Servers, Voice, Gaming' },
    { id: 'slack', name: 'Slack', users: 'Enterprise', features: 'Teams, Channels, Work' }
  ];

  const demoExamples = [
    "Send $50 to @john",
    "Pay @sarah 1000 KES",
    "Transfer $25 to @friend",
    "Gift $10 to @family",
    "Split $100 with @group",
    "Balance",
    "Help"
  ];

  const handleExampleClick = (example) => {
    setDemoMessage(example);
  };

  return (
    <div className="social-media-demo">
      <div className="demo-header">
        <h1>🤖 NISTO Social Media Money Transfer Demo</h1>
        <p>Send money anywhere on social media with one universal system!</p>
      </div>

      <div className="demo-container">
        {/* Platform Selection */}
        <div className="platform-selector">
          <h3>🌍 Choose Your Platform</h3>
          <div className="platform-grid">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`platform-card ${selectedPlatform === platform.id ? 'active' : ''}`}
                onClick={() => setSelectedPlatform(platform.id)}
                style={{ borderColor: getPlatformColor(platform.id) }}
              >
                <div className="platform-icon" style={{ color: getPlatformColor(platform.id) }}>
                  {getPlatformIcon(platform.id)}
                </div>
                <div className="platform-info">
                  <h4>{platform.name}</h4>
                  <p className="platform-users">{platform.users} users</p>
                  <p className="platform-features">{platform.features}</p>
                </div>
                <div className="platform-status">
                  {healthStatus[platform.id]?.status === 'healthy' ? '🟢' : '🔴'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Interface */}
        <div className="demo-interface">
          <div className="demo-message-input">
            <h3>💬 Try It Out</h3>
            <p>Type a money transfer command as if you're on {platforms.find(p => p.id === selectedPlatform)?.name}:</p>
            
            <div className="input-group">
              <input
                type="text"
                value={demoMessage}
                onChange={(e) => setDemoMessage(e.target.value)}
                placeholder={`e.g., "Send $50 to @friend"`}
                className="message-input"
              />
              <button
                onClick={handleDemoMessage}
                disabled={isProcessing || !demoMessage.trim()}
                className="send-button"
                style={{ backgroundColor: getPlatformColor(selectedPlatform) }}
              >
                {isProcessing ? '⏳ Processing...' : '🚀 Send'}
              </button>
            </div>

            {/* Example Commands */}
            <div className="example-commands">
              <h4>💡 Try These Examples:</h4>
              <div className="command-grid">
                {demoExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="example-command"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Demo Response */}
          {demoResponse && (
            <div className="demo-response">
              <h3>🤖 NISTO Bot Response:</h3>
              <div className="response-content">
                <pre>{demoResponse}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Platform Statistics */}
        <div className="platform-stats">
          <h3>📊 Platform Statistics</h3>
          <div className="stats-grid">
            {platforms.map((platform) => (
              <div key={platform.id} className="stat-card">
                <div className="stat-header">
                  <span className="stat-icon">{getPlatformIcon(platform.id)}</span>
                  <h4>{platform.name}</h4>
                </div>
                <div className="stat-details">
                  <div className="stat-item">
                    <span className="stat-label">Status:</span>
                    <span className={`stat-value status-${healthStatus[platform.id]?.status || 'unknown'}`}>
                      {healthStatus[platform.id]?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Active Users:</span>
                    <span className="stat-value">{platformStats[platform.id]?.users || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Transfers:</span>
                    <span className="stat-value">{platformStats[platform.id]?.transfers || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="features-showcase">
          <h3>🚀 Key Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h4>Universal Integration</h4>
              <p>One system works on all social media platforms</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>Natural Language</h4>
              <p>Send money using everyday language</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure Transfers</h4>
              <p>Bank-grade security on every platform</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Instant Processing</h4>
              <p>Money transfers in seconds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h4>Low Fees</h4>
              <p>1% fee, always below market rates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h4>Global Reach</h4>
              <p>Send money to anyone, anywhere</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h3>🔧 How It Works</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Type Command</h4>
                <p>Send a message like "Send $50 to @friend" on any social platform</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>NISTO Bot Responds</h4>
                <p>Our AI bot confirms the transfer details and asks for confirmation</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Confirm Transfer</h4>
                <p>Reply "YES" to confirm, and the money is sent instantly</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Both Users Notified</h4>
                <p>Sender and recipient get instant notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaDemo;
