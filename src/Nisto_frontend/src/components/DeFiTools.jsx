import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiPercent,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw,
  FiPlus,
  FiMinus,
  FiArrowUp,
  FiArrowDown,
  FiInfo,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiClock,
  FiShield
} from 'react-icons/fi';


const DeFiTools = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalReturn: 0,
    totalReturnPercentage: 0,
    portfolio: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch data from your backend API
        // For demonstration, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Example data for demonstration
        setData({
          totalValue: 12345.67,
          totalInvested: 10000,
          totalReturn: 2345.67,
          totalReturnPercentage: 23.46,
          portfolio: [
            { name: 'Asset A', value: 5000, invested: 4000, return: 1000, returnPercentage: 25 },
            { name: 'Asset B', value: 3000, invested: 2500, return: 500, returnPercentage: 20 },
            { name: 'Asset C', value: 4345.67, invested: 3500, return: 845.67, returnPercentage: 24.16 },
          ],
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Example asset data for screenshot matching
  const assets = [
    { name: 'ICP', value: 8000, change: 5.26, amount: '50 ICP' },
    { name: 'ckBTC', value: 2500, change: 8.7, amount: '0.5 ckBTC' },
    { name: 'ckETH', value: 2000, change: 14.29, amount: '2 ckETH' },
  ];

  // DeFi Products for the last section
  const defiProducts = [
    {
      icon: <FiTrendingUp size={22} style={{ color: '#1976d2', background: '#e3f0fa', borderRadius: 8, padding: 4 }} />, // blue
      title: 'ICP Staking',
      desc: 'Stake ICP tokens to earn rewards',
      apy: '8.5%',
      risk: { label: 'Low', icon: <FiShield style={{ color: '#059669' }} /> },
      min: '1',
      btn: 'Start Earning',
    },
    {
      icon: <FiPercent size={22} style={{ color: '#1976d2', background: '#e3f0fa', borderRadius: 8, padding: 4 }} />, // blue
      title: 'ckBTC Lending',
      desc: 'Lend ckBTC to earn interest',
      apy: '12.3%',
      risk: { label: 'Medium', icon: <FiInfo style={{ color: '#f59e0b' }} /> },
      min: '0.001',
      btn: 'Start Earning',
    },
    {
      icon: <FiClock size={22} style={{ color: '#1976d2', background: '#e3f0fa', borderRadius: 8, padding: 4 }} />, // blue
      title: 'ICP-ckBTC LP',
      desc: 'Provide liquidity to earn fees',
      apy: '18.7%',
      risk: { label: 'High', icon: <FiAlertCircle style={{ color: '#ef4444' }} /> },
      min: '100',
      btn: 'Start Earning',
    },
  ];

  return (
    <section className="dashboard-section" style={{ padding: 0, margin: 0, background: 'transparent', boxShadow: 'none', border: 'none' }}>
      {/* Blue header bar */}
      <div style={{ background: 'linear-gradient(90deg, #075B5E 0%, #1C352D 100%)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', padding: '1.2rem 2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
        <FiBarChart2 size={28} style={{ marginRight: 12 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>DeFi Tools</div>
          <div style={{ fontSize: 15, opacity: 0.92 }}>Access decentralized finance with local fiat integration</div>
        </div>
      </div>
      {/* Portfolio Overview */}
      <div style={{ padding: '2rem 2.5rem 0 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--neutral-700)' }}>Portfolio Overview</div>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 15 }}><FiRefreshCw /> Refresh</button>
        </div>
        <div className="dashboard-card" style={{ marginBottom: 24, maxWidth: 340 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary-700)' }}>$12,500</div>
          <div style={{ color: 'var(--success-700)', fontWeight: 600, fontSize: 18, marginTop: 2 }}>
            <span style={{ marginRight: 4 }}>&uarr; $850</span>
            <span style={{ color: 'var(--success-600)', fontWeight: 700 }}>(+7.28%)</span>
          </div>
        </div>
        {/* Assets List */}
        <div className="dashboard-section" style={{ background: 'var(--neutral-50)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', padding: '1.2rem 1.5rem', maxWidth: 600 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--neutral-700)', marginBottom: 12 }}>Your Assets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assets.map((asset, idx) => (
              <div key={asset.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 8, padding: '0.9rem 1.2rem', boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgb(0 0 0 / 0.03))' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 700, color: 'var(--neutral-800)', fontSize: 15 }}>{asset.name}</span>
                  <span style={{ color: 'var(--neutral-400)', fontSize: 13 }}>{asset.amount}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: 17 }}>${asset.value.toLocaleString()}</div>
                  <div style={{ color: 'var(--success-700)', fontWeight: 600, fontSize: 14 }}>
                    &uarr; {asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* DeFi Tabs and Products */}
        <div style={{ marginTop: 32 }}>
          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #ccfbf1', marginBottom: 18 }}>
            {['overview', 'swap', 'lending', 'yield'].map(tab => (
              <button
                key={tab}
                className="btn"
                style={{
                  borderRadius: 0,
                  border: 'none',
                  background: activeTab === tab ? '#f0fdfa' : 'transparent',
                  color: activeTab === tab ? '#075B5E' : 'var(--neutral-500)',
                  fontWeight: activeTab === tab ? 700 : 500,
                  borderBottom: activeTab === tab ? '2.5px solid #075B5E' : '2.5px solid transparent',
                  boxShadow: 'none',
                  fontSize: 16,
                  padding: '0.7rem 2.2rem',
                  marginRight: 2,
                  transition: 'all 0.18s',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && <>Overview</>}
                {tab === 'swap' && <><FiRefreshCw style={{ marginRight: 6 }} />Swap</>}
                {tab === 'lending' && <><FiPercent style={{ marginRight: 6 }} />Lending</>}
                {tab === 'yield' && <><FiClock style={{ marginRight: 6 }} />Yield Farming</>}
              </button>
            ))}
          </div>
          {/* DeFi Products */}
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--neutral-700)', marginBottom: 18 }}>DeFi Products</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {defiProducts.map((prod, idx) => (
              <div key={prod.title} className="dashboard-card" style={{ minWidth: 320, maxWidth: 340, flex: 1, padding: '1.2rem 1.3rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  {prod.icon}
                  <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--primary-800)' }}>{prod.title}</span>
                </div>
                <div style={{ color: 'var(--neutral-500)', fontSize: 15, marginBottom: 6 }}>{prod.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 15, color: 'var(--neutral-700)', marginBottom: 6 }}>
                  <span>APY: <b style={{ color: 'var(--primary-700)' }}>{prod.apy}</b></span>
                  <span>Risk: {prod.risk.icon} <b style={{ color: 'var(--neutral-700)' }}>{prod.risk.label}</b></span>
                  <span>Min Amount: <b style={{ color: 'var(--primary-700)' }}>{prod.min}</b></span>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 8, fontWeight: 600, fontSize: 15 }}>{prod.btn}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeFiTools; 