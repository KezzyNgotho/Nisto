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
  const [isUninstalling, setIsUninstalling] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '📦' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'productivity', icon: '⚡', name: 'Productivity' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'utilities', name: 'Utilities', icon: '🔧' }
  ];

  useEffect(() => {
    // Load available plugins (mocked)
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
        icon: '📊',
        screenshots: [],
        reviews: [
          { user: 'Alice', rating: 5, comment: 'Super useful for my monthly budget!' },
          { user: 'Bob', rating: 4, comment: 'Great insights, easy to use.' }
        ]
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
        icon: '₿',
        screenshots: [],
        reviews: [
          { user: 'Eve', rating: 5, comment: 'Love the real-time updates!' }
        ]
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
        icon: '🎯',
        screenshots: [],
        reviews: [
          { user: 'Charlie', rating: 5, comment: 'Fun way to save with friends!' }
        ]
      },
      {
        id: 4,
        name: 'Bill Reminder',
        description: 'Never miss a bill payment with smart reminders',
        category: 'utilities',
        author: 'UtilitySoft',
        version: '1.0.0',
        rating: 4.7,
        downloads: 12000,
        size: '1.2 MB',
        price: 0,
        tags: ['bills', 'reminders', 'utilities'],
        features: ['Smart reminders', 'Recurring bills', 'Calendar sync'],
        status: 'available',
        icon: '⏰',
        screenshots: [],
        reviews: []
      }
    ]);
    // Mock: user has installed plugin 2
    setInstalledPlugins([2]);
  }, []);

  // Filtered plugins for marketplace
  const filteredPlugins = plugins.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Plugins user has installed
  const userInstalledPlugins = plugins.filter(p => installedPlugins.includes(p.id));

  // Handlers
  const handlePluginSelect = (plugin) => {
    setSelectedPlugin(plugin);
    setShowPluginModal(true);
  };

  const handleInstallPlugin = async (plugin) => {
    setIsInstalling(true);
    setTimeout(() => {
      setInstalledPlugins(prev => [...prev, plugin.id]);
      setIsInstalling(false);
    }, 1000);
  };

  const handleUninstallPlugin = async (plugin) => {
    setIsUninstalling(true);
    setTimeout(() => {
      setInstalledPlugins(prev => prev.filter(id => id !== plugin.id));
      setIsUninstalling(false);
      setShowPluginModal(false);
    }, 1000);
  };

  // UI
  return (
    <div className="plugin-marketplace-root" style={{ width: '100%', padding: 0, margin: 0, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--neutral-100)', padding: '0 2rem 1.2rem 2rem', background: 'white', position: 'sticky', top: 0, zIndex: 2 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0, color: 'var(--primary-700)', letterSpacing: '-1px' }}>Plug-in Marketplace</h2>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`tab-btn${activeTab==='marketplace'?' active':''}`} onClick={()=>setActiveTab('marketplace')} style={{ padding: '0.6rem 1.4rem', borderRadius: 8, border: 'none', background: activeTab==='marketplace' ? 'var(--primary-600)' : 'var(--neutral-100)', color: activeTab==='marketplace' ? 'white' : 'var(--neutral-600)', fontWeight: 600, fontSize: 16, transition: 'all 0.18s', boxShadow: activeTab==='marketplace' ? '0 2px 8px 0 rgba(59,130,246,0.10)' : 'none', cursor: 'pointer' }}>Marketplace</button>
          <button className={`tab-btn${activeTab==='installed'?' active':''}`} onClick={()=>setActiveTab('installed')} style={{ padding: '0.6rem 1.4rem', borderRadius: 8, border: 'none', background: activeTab==='installed' ? 'var(--primary-600)' : 'var(--neutral-100)', color: activeTab==='installed' ? 'white' : 'var(--neutral-600)', fontWeight: 600, fontSize: 16, transition: 'all 0.18s', boxShadow: activeTab==='installed' ? '0 2px 8px 0 rgba(59,130,246,0.10)' : 'none', cursor: 'pointer' }}>Installed</button>
        </div>
      </div>
      {/* Search and filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', padding: '0 2rem' }}>
        <input
          type="text"
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '0.7rem 1.2rem', borderRadius: 8, border: '1px solid var(--neutral-200)', fontSize: 16, background: 'var(--neutral-50)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ padding: '0.7rem 1.2rem', borderRadius: 8, border: '1px solid var(--neutral-200)', fontSize: 16, background: 'var(--neutral-50)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>
      {/* Plugin grid/list */}
      <div className="plugin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, padding: '0 2rem 2rem 2rem' }}>
        {(activeTab === 'marketplace' ? filteredPlugins : userInstalledPlugins).length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--neutral-400)', fontSize: 18, padding: '3rem 0' }}>
            No plugins found.
          </div>
        ) : (
          (activeTab === 'marketplace' ? filteredPlugins : userInstalledPlugins).map(plugin => (
            <div key={plugin.id} className="plugin-card" style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', minHeight: 220, transition: 'box-shadow 0.2s, transform 0.18s', cursor: 'pointer', border: '1px solid var(--neutral-100)' }}
              onClick={()=>handlePluginSelect(plugin)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{plugin.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plugin.name}</div>
              <div style={{ color: 'var(--neutral-500)', fontSize: 15, marginBottom: 8 }}>{plugin.description}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ background: 'var(--neutral-100)', borderRadius: 6, padding: '2px 8px', fontSize: 13 }}>{plugin.category}</span>
                <span style={{ color: '#f5b50a', fontWeight: 600, fontSize: 13 }}>★ {plugin.rating}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--neutral-400)' }}>{plugin.downloads.toLocaleString()} installs</div>
              {installedPlugins.includes(plugin.id) && (
                <div style={{ position: 'absolute', top: 18, right: 18, background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 8, padding: '2px 10px', fontSize: 13, fontWeight: 600 }}>Installed</div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Plugin details modal */}
      {showPluginModal && selectedPlugin && (
        <div className="plugin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }} onClick={()=>setShowPluginModal(false)}>
          <div className="plugin-modal" style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.18)', padding: 36, minWidth: 340, maxWidth: 420, width: '100%', position: 'relative', animation: 'slideUp 0.22s' }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowPluginModal(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: 'var(--neutral-400)', cursor: 'pointer' }}><FiX /></button>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{selectedPlugin.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{selectedPlugin.name}</div>
            <div style={{ color: 'var(--neutral-500)', fontSize: 15, marginBottom: 10 }}>{selectedPlugin.description}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ background: 'var(--neutral-100)', borderRadius: 6, padding: '2px 8px', fontSize: 13 }}>{selectedPlugin.category}</span>
              <span style={{ color: '#f5b50a', fontWeight: 600, fontSize: 13 }}>★ {selectedPlugin.rating}</span>
              <span style={{ fontSize: 13, color: 'var(--neutral-400)' }}>{selectedPlugin.downloads.toLocaleString()} installs</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 8 }}>By {selectedPlugin.author} • v{selectedPlugin.version} • {selectedPlugin.size}</div>
            <div style={{ marginBottom: 12 }}>
              {selectedPlugin.features && selectedPlugin.features.map((f, i) => (
                <span key={i} style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 6 }}>{f}</span>
              ))}
            </div>
            {/* Install/Uninstall button */}
            {installedPlugins.includes(selectedPlugin.id) ? (
              <button className="btn btn-danger" style={{ width: '100%', marginBottom: 10, fontWeight: 600, fontSize: 16, borderRadius: 8, transition: 'all 0.18s' }} onClick={()=>handleUninstallPlugin(selectedPlugin)} disabled={isUninstalling}>{isUninstalling ? 'Uninstalling...' : 'Uninstall'}</button>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10, fontWeight: 600, fontSize: 16, borderRadius: 8, transition: 'all 0.18s' }} onClick={()=>handleInstallPlugin(selectedPlugin)} disabled={isInstalling}>{isInstalling ? 'Installing...' : 'Install'}</button>
            )}
            {/* Reviews */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Reviews</div>
              {selectedPlugin.reviews && selectedPlugin.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedPlugin.reviews.map((r, i) => (
                    <div key={i} style={{ background: 'var(--neutral-100)', borderRadius: 6, padding: '6px 10px', fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>{r.user}</span>: <span style={{ color: '#f5b50a' }}>★ {r.rating}</span> <span style={{ color: 'var(--neutral-600)' }}>{r.comment}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--neutral-400)', fontSize: 14 }}>No reviews yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PluginSystem; 