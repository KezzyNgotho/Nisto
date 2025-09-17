import React, { useState, useEffect } from 'react';
import { 
  FiInstagram, FiTwitter, FiFacebook, FiLinkedin, FiYoutube,
  FiShare2, FiTrendingUp, FiUsers, FiAward, FiGift,
  FiMessageCircle, FiHeart, FiDownload, FiExternalLink
} from 'react-icons/fi';
import { BiMoney, BiTransfer, BiGroup, BiWorld } from 'react-icons/bi';
import './SocialIntegrationHub.scss';

const SocialIntegrationHub = () => {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [socialStats, setSocialStats] = useState({
    followers: 12500,
    engagement: 8.7,
    reach: 45000,
    viralPosts: 23
  });
  const [viralCampaigns, setViralCampaigns] = useState([]);
  const [influencerPartnerships, setInfluencerPartnerships] = useState([]);
  const [socialFeatures, setSocialFeatures] = useState([]);

  useEffect(() => {
    // Mock data for viral campaigns
    setViralCampaigns([
      {
        id: 1,
        title: "Money Transfer Challenge",
        platform: "instagram",
        description: "Send money to 3 friends and share your story",
        hashtag: "#NistoChallenge",
        participants: 1250,
        reach: 45000,
        status: "active"
      },
      {
        id: 2,
        title: "Split Bill Stories",
        platform: "whatsapp",
        description: "Share your group bill splitting moments",
        hashtag: "#NistoSplit",
        participants: 890,
        reach: 32000,
        status: "trending"
      },
      {
        id: 3,
        title: "Financial Freedom Reels",
        platform: "tiktok",
        description: "Create content about financial independence",
        hashtag: "#NistoFreedom",
        participants: 2100,
        reach: 78000,
        status: "viral"
      }
    ]);

    // Mock influencer partnerships
    setInfluencerPartnerships([
      {
        id: 1,
        name: "Sarah Finance",
        platform: "instagram",
        followers: "125K",
        engagement: "4.2%",
        category: "Finance",
        status: "active",
        avatar: "👩‍💼"
      },
      {
        id: 2,
        name: "Mike Crypto",
        platform: "youtube",
        followers: "89K",
        engagement: "6.8%",
        category: "Crypto",
        status: "pending",
        avatar: "👨‍💻"
      },
      {
        id: 3,
        name: "Emma Lifestyle",
        platform: "tiktok",
        followers: "250K",
        engagement: "8.1%",
        category: "Lifestyle",
        status: "active",
        avatar: "👩‍🎨"
      }
    ]);

    // Social features
    setSocialFeatures([
      {
        id: 1,
        title: "Instagram Money Stories",
        description: "Share money transfers as Instagram stories with custom stickers",
        icon: <FiInstagram />,
        status: "live",
        users: 8900
      },
      {
        id: 2,
        title: "WhatsApp Payment Groups",
        description: "Create payment groups and split bills seamlessly",
        icon: <FiMessageCircle />,
        status: "live",
        users: 12400
      },
      {
        id: 3,
        title: "Twitter Money Threads",
        description: "Share financial tips and money transfer experiences",
        icon: <FiTwitter />,
        status: "beta",
        users: 5600
      },
      {
        id: 4,
        title: "TikTok Financial Content",
        description: "Create viral financial education content",
        icon: <FiTrendingUp />,
        status: "coming_soon",
        users: 0
      }
    ]);
  }, []);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: <FiInstagram />, color: '#E4405F' },
    { id: 'whatsapp', name: 'WhatsApp', icon: <FiMessageCircle />, color: '#25D366' },
    { id: 'twitter', name: 'Twitter', icon: <FiTwitter />, color: '#1DA1F2' },
    { id: 'tiktok', name: 'TikTok', icon: <FiTrendingUp />, color: '#000000' },
    { id: 'youtube', name: 'YouTube', icon: <FiYoutube />, color: '#FF0000' },
    { id: 'linkedin', name: 'LinkedIn', icon: <FiLinkedin />, color: '#0077B5' }
  ];

  const handlePlatformIntegration = (platform) => {
    setActivePlatform(platform);
    // Here you would integrate with the actual platform APIs
    console.log(`Integrating with ${platform}`);
  };

  const launchViralCampaign = (campaign) => {
    // Launch viral campaign logic
    console.log(`Launching campaign: ${campaign.title}`);
  };

  const connectInfluencer = (influencer) => {
    // Connect with influencer logic
    console.log(`Connecting with ${influencer.name}`);
  };

  const renderPlatformIntegration = () => (
    <div className="platform-integration">
      <div className="platform-grid">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className={`platform-card ${activePlatform === platform.id ? 'active' : ''}`}
            onClick={() => handlePlatformIntegration(platform.id)}
            style={{ '--platform-color': platform.color }}
          >
            <div className="platform-icon">
              {platform.icon}
            </div>
            <span className="platform-name">{platform.name}</span>
            <div className="integration-status">
              {activePlatform === platform.id ? 'Connected' : 'Connect'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderViralCampaigns = () => (
    <div className="viral-campaigns">
      <div className="section-header">
        <h3>🚀 Viral Campaigns</h3>
        <p>Make your wallet go viral across all platforms</p>
      </div>
      
      <div className="campaigns-grid">
        {viralCampaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-card">
            <div className="campaign-header">
              <div className="campaign-platform">
                {platforms.find(p => p.id === campaign.platform)?.icon}
                <span className="platform-name">{campaign.platform}</span>
              </div>
              <span className={`campaign-status ${campaign.status}`}>
                {campaign.status}
              </span>
            </div>
            
            <h4 className="campaign-title">{campaign.title}</h4>
            <p className="campaign-description">{campaign.description}</p>
            
            <div className="campaign-hashtag">
              <span className="hashtag">{campaign.hashtag}</span>
            </div>
            
            <div className="campaign-stats">
              <div className="stat">
                <span className="stat-value">{campaign.participants}</span>
                <span className="stat-label">Participants</span>
              </div>
              <div className="stat">
                <span className="stat-value">{campaign.reach.toLocaleString()}</span>
                <span className="stat-label">Reach</span>
              </div>
            </div>
            
            <button 
              className="launch-btn"
              onClick={() => launchViralCampaign(campaign)}
            >
              Launch Campaign
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInfluencerPartnerships = () => (
    <div className="influencer-partnerships">
      <div className="section-header">
        <h3>🌟 Influencer Partnerships</h3>
        <p>Connect with top influencers to boost your wallet's reach</p>
      </div>
      
      <div className="influencers-grid">
        {influencerPartnerships.map((influencer) => (
          <div key={influencer.id} className="influencer-card">
            <div className="influencer-avatar">
              <span className="avatar-emoji">{influencer.avatar}</span>
            </div>
            
            <div className="influencer-info">
              <h4 className="influencer-name">{influencer.name}</h4>
              <div className="influencer-platform">
                {platforms.find(p => p.id === influencer.platform)?.icon}
                <span>{influencer.platform}</span>
              </div>
              <span className="influencer-category">{influencer.category}</span>
            </div>
            
            <div className="influencer-stats">
              <div className="stat">
                <span className="stat-value">{influencer.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{influencer.engagement}</span>
                <span className="stat-label">Engagement</span>
              </div>
            </div>
            
            <div className="influencer-actions">
              <span className={`partnership-status ${influencer.status}`}>
                {influencer.status}
              </span>
              <button 
                className="connect-btn"
                onClick={() => connectInfluencer(influencer)}
              >
                {influencer.status === 'active' ? 'Manage' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialFeatures = () => (
    <div className="social-features">
      <div className="section-header">
        <h3>🔗 Social Features</h3>
        <p>Integrate your wallet with popular social platforms</p>
      </div>
      
      <div className="features-grid">
        {socialFeatures.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">
              {feature.icon}
            </div>
            
            <div className="feature-content">
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-stats">
                <span className="users-count">{feature.users.toLocaleString()} users</span>
                <span className={`feature-status ${feature.status}`}>
                  {feature.status}
                </span>
              </div>
            </div>
            
            <div className="feature-actions">
              {feature.status === 'live' && (
                <button className="action-btn">
                  <FiExternalLink />
                </button>
              )}
              {feature.status === 'beta' && (
                <button className="action-btn">
                  <FiDownload />
                </button>
              )}
              {feature.status === 'coming_soon' && (
                <button className="action-btn disabled">
                  <FiHeart />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialAnalytics = () => (
    <div className="social-analytics">
      <div className="section-header">
        <h3>📊 Social Analytics</h3>
        <p>Track your wallet's social media performance</p>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon">
            <FiUsers />
          </div>
          <div className="analytics-content">
            <span className="analytics-value">{socialStats.followers.toLocaleString()}</span>
            <span className="analytics-label">Total Followers</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <FiHeart />
          </div>
          <div className="analytics-content">
            <span className="analytics-value">{socialStats.engagement}%</span>
            <span className="analytics-label">Engagement Rate</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <FiTrendingUp />
          </div>
          <div className="analytics-content">
            <span className="analytics-value">{socialStats.reach.toLocaleString()}</span>
            <span className="analytics-label">Total Reach</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <FiAward />
          </div>
          <div className="analytics-content">
            <span className="analytics-value">{socialStats.viralPosts}</span>
            <span className="analytics-label">Viral Posts</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="social-integration-hub">
      <div className="hub-header">
        <h2>🌐 Social Integration Hub</h2>
        <p>Make your wallet popular by integrating with existing social platforms</p>
      </div>

      {renderSocialAnalytics()}
      {renderPlatformIntegration()}
      {renderViralCampaigns()}
      {renderInfluencerPartnerships()}
      {renderSocialFeatures()}

      <div className="hub-footer">
        <div className="viral-tips">
          <h4>💡 Tips to Go Viral</h4>
          <ul>
            <li>Use trending hashtags in your money transfer stories</li>
            <li>Create engaging content about financial freedom</li>
            <li>Partner with micro-influencers in your niche</li>
            <li>Run user-generated content campaigns</li>
            <li>Share success stories and testimonials</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocialIntegrationHub;
