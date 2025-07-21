import React,{ useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiGrid, 
  FiSearch, 
  FiDownload, 
  FiStar, 
  FiUsers, 
  FiSettings,
  FiPlay,
  FiPause,
  FiTrash2,
  FiInfo,
  FiExternalLink,
  FiFilter,
  FiHeart,
  FiShare2,
  FiCheck,
  FiX,
  FiPackage,
  FiCode,
  FiZap
} from 'react-icons/fi';

function PluginSystem() {
  const { user, principal } = useAuth();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [plugins, setPlugins] = useState([]);
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [showPluginModal, setShowPluginModal] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '📦' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'productivity', icon: '⚡', name: 'Productivity' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'utilities', name: 'Utilities', icon: '🔧' }
  ];

  useEffect(() => {
    // Load available plugins
    setPlugins([
      {
        id: 1,
        name: 'Budget Tracker Pro',
        description: 'Advanced budgeting and expense tracking with AI insights',
        category: 'finance',
        author: 'Nesto Team',
        version: '1.2.0',
        rating: 4.8,
        downloads: 15420,
        size: '2.3 MB',
        price: 0,
        tags: ['budgeting', 'expenses', 'ai', 'analytics'],
        features: ['AI-powered insights', 'Multi-currency support', 'Export reports'],
        status: 'available',
        icon: '📊'
      },
      {
        id: 2,
        name: 'Crypto Portfolio Manager',
        description: 'Track and manage your cryptocurrency investments',
        category: 'finance',
        author: 'CryptoDev',
        version: '2.1.0',
        rating: 4.6,
        downloads: 8920,
        size: '1.8 MB',
        price: 0,
        tags: ['crypto', 'portfolio', 'trading', 'defi'],
        features: ['Real-time prices', 'Portfolio tracking', 'DeFi integration'],
        status: 'available',
        icon: '₿'
      },
      {
        id: 3,
        name: 'Social Savings Challenge',
        description: 'Create and join savings challenges with friends',
        category: 'social',
        author: 'SocialFinance',
        version: '1.0.5',
        rating: 4.9,
        downloads: 23450,
        size: '3.1 MB',
        price: 0,
        tags: ['savings', 'social', 'challenges', 'gamification'],
        features: ['Group challenges', 'Progress tracking', 'Rewards system'],
        status: 'available',
        icon: '🎯'
      },
      {
        id: 4,
        name: 'Bill Reminder',
        description: 'Never miss a bill payment with smart reminders',
        category: 'utilities',
        author: 'ReminderPro',
        version: '1.1.2',
        rating: 4.7,
        downloads: 18760,
        size: '1.2 MB',
        price: 0,
        tags: ['bills', 'reminders', 'automation'],
        features: ['Smart reminders', 'Payment tracking', 'Auto-categorization'],
        status: 'available',
        icon: '📅'
      },
      {
        id: 5,
        name: 'Investment Simulator',
        description: 'Practice investing with virtual money',
        category: 'finance',
        author: 'InvestSim',
        version: '1.3.0',
        rating: 4.5,
        downloads: 12340,
        size: '4.2 MB',
        price: 0,
        tags: ['investing', 'simulation', 'education'],
        features: ['Virtual trading', 'Market data', 'Learning modules'],
        status: 'available',
        icon: '📈'
      },
      {
        id: 6,
        name: 'Expense Splitter',
        description: 'Split expenses with friends and family easily',
        category: 'social',
        author: 'SplitWise',
        version: '1.0.8',
        rating: 4.8,
        downloads: 9870,
        size: '2.7 MB',
        price: 0,
        tags: ['expenses', 'splitting', 'social'],
        features: ['Group expenses', 'Payment tracking', 'Settlement'],
        status: 'available',
        icon: '✂️'
      }
    ]);

    // Load installed plugins
    setInstalledPlugins([
      {
        id: 1,
        name: 'Budget Tracker Pro',
        version: '1.2.0',
        status: 'active',
        lastUsed: new Date(Date.now() - 86400000),
        icon: '📊'
      },
      {
        id: 3,
        name: 'Social Savings Challenge',
        version: '1.0.5',
        status: 'active',
        lastUsed: new Date(Date.now() - 172800000),
        icon: '🎯'
      }
    ]);
  }, []);

  const handlePluginSelect = (plugin) => {
    setSelectedPlugin(plugin);
    setShowPluginModal(true);
  };

  const handleInstallPlugin = async (plugin) => {
    setIsInstalling(true);
    
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to installed plugins
      const installedPlugin = {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        status: 'active',
        lastUsed: new Date(),
        icon: plugin.icon
      };
      
      setInstalledPlugins(prev => [...prev, installedPlugin]);
      setShowPluginModal(false);
      setSelectedPlugin(null);
      
      alert(`${plugin.name} installed successfully!`);
    } catch (error) {
      console.error('Installation failed:', error);
      alert('Installation failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstallPlugin = async (plugin) => {
    if (confirm(`Are you sure you want to uninstall ${plugin.name}?`)) {
      setInstalledPlugins(prev => prev.filter(p => p.id !== plugin.id));
      alert(`${plugin.name} uninstalled successfully!`);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-gray-500';
      case 'updating': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="plugin-system">
      <div className="plugin-header">
        <div className="plugin-header-content">
          <div className="plugin-icon">
            <FiGrid />
          </div>
          <div className="plugin-info">
            <h2>Plugin Marketplace</h2>
            <p>Discover and install powerful mini-apps to enhance your Nisto experience</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="plugin-nav">
        <button 
          className={`nav-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <FiPackage />
          <span>Marketplace</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'installed' ? 'active' : ''}`}
          onClick={() => setActiveTab('installed')}
        >
          <FiDownload />
          <span>Installed</span>
        </button>
      </div>

      <div className="plugin-content">
        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="marketplace-section">
            {/* Search and Filters */}
            <div className="marketplace-controls">
              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="category-filter">
                <FiFilter />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plugins Grid */}
            <div className="plugins-grid">
              {filteredPlugins.map((plugin) => (
                <div key={plugin.id} className="plugin-card">
                  <div className="plugin-header">
                    <div className="plugin-icon">
                      <span className="plugin-emoji">{plugin.icon}</span>
                    </div>
                    <div className="plugin-info">
                      <h4>{plugin.name}</h4>
                      <p>{plugin.description}</p>
                      <div className="plugin-meta">
                        <span className="author">by {plugin.author}</span>
                        <span className="version">v{plugin.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="plugin-stats">
                    <div className="stat-item">
                      <FiStar className="text-yellow-500" />
                      <span>{plugin.rating}</span>
                    </div>
                    <div className="stat-item">
                      <FiDownload />
                      <span>{plugin.downloads.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <FiPackage />
                      <span>{plugin.size}</span>
                    </div>
                  </div>

                  <div className="plugin-tags">
                    {plugin.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="plugin-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePluginSelect(plugin)}
                    >
                      <FiInfo />
                      Details
                    </button>
                    <button className="btn btn-secondary">
                      <FiHeart />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Installed Tab */}
        {activeTab === 'installed' && (
          <div className="installed-section">
            <h3>Installed Plugins</h3>
            <div className="installed-plugins">
              {installedPlugins.map((plugin) => (
                <div key={plugin.id} className="installed-plugin-card">
                  <div className="plugin-info">
                    <div className="plugin-icon">
                      <span className="plugin-emoji">{plugin.icon}</span>
                    </div>
                    <div className="plugin-details">
                      <h4>{plugin.name}</h4>
                      <p>Version {plugin.version}</p>
                      <span className="last-used">
                        Last used: {plugin.lastUsed.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="plugin-status">
                    <span className={`status ${getStatusColor(plugin.status)}`}>
                      {plugin.status}
                    </span>
                  </div>

                  <div className="plugin-actions">
                    <button className="btn btn-secondary btn-sm">
                      <FiPlay />
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      <FiSettings />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleUninstallPlugin(plugin)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}

              {installedPlugins.length === 0 && (
                <div className="no-plugins">
                  <FiPackage className="no-plugins-icon" />
                  <h4>No plugins installed</h4>
                  <p>Browse the marketplace to discover and install plugins</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('marketplace')}
                  >
                    Browse Marketplace
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Plugin Details Modal */}
      {showPluginModal && selectedPlugin && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <div className="modal-title">
                <span className="plugin-emoji">{selectedPlugin.icon}</span>
                <h3>{selectedPlugin.name}</h3>
              </div>
              <button 
                className="btn btn-icon"
                onClick={() => setShowPluginModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="plugin-details">
                <div className="plugin-description">
                  <p>{selectedPlugin.description}</p>
                </div>

                <div className="plugin-stats-detail">
                  <div className="stat-item">
                    <span>Author:</span>
                    <span>{selectedPlugin.author}</span>
                  </div>
                  <div className="stat-item">
                    <span>Version:</span>
                    <span>{selectedPlugin.version}</span>
                  </div>
                  <div className="stat-item">
                    <span>Size:</span>
                    <span>{selectedPlugin.size}</span>
                  </div>
                  <div className="stat-item">
                    <span>Downloads:</span>
                    <span>{selectedPlugin.downloads.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span>Rating:</span>
                    <span>
                      <FiStar className="text-yellow-500" />
                      {selectedPlugin.rating}
                    </span>
                  </div>
                </div>

                <div className="plugin-features">
                  <h4>Features</h4>
                  <ul>
                    {selectedPlugin.features.map((feature, index) => (
                      <li key={index}>
                        <FiCheck className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plugin-tags-detail">
                  <h4>Tags</h4>
                  <div className="tags-list">
                    {selectedPlugin.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPluginModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleInstallPlugin(selectedPlugin)}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <>
                    <FiDownload className="spinning" />
                    Installing...
                  </>
                ) : (
                  <>
                    <FiDownload />
                    Install Plugin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PluginSystem; 