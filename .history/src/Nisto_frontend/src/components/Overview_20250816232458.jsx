import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiActivity, 
  FiPieChart, 
  FiBarChart2,
  FiArrowUpRight,
  FiArrowDownRight,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiSearch,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiZap,
  FiShield,
  FiUsers,
  FiCreditCard,
  FiAward,
  FiGrid,
  FiSend,
  FiZap as FiZapIcon,
  FiPlus,
  FiSettings,
  FiBell,
  FiStar,
  FiTarget,
  FiWallet,
  FiBarChart3,
  FiTrendingUp as FiTrendingUpIcon,
  FiBitcoin,
  FiEthereum,
  FiDollarSign as FiDollarSignIcon,
  FiPercent,
  FiArrowRight
} from 'react-icons/fi';
import { format, subDays, startOfDay, endOfDay, isToday, isYesterday } from 'date-fns';

function Overview() {
  const { 
    cryptoWallets, 
    user, 
    backendService,
    isLoading 
  } = useAuth();

  // State for overview data
  const [overviewData, setOverviewData] = useState({
    totalBalance: 0,
    totalBalanceUSD: 0,
    portfolioChange: 0,
    portfolioChangePercent: 0,
    activeWallets: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0
  });

  const [chartData, setChartData] = useState({
    balanceHistory: [],
    transactionHistory: [],
    portfolioDistribution: [],
    monthlyPerformance: []
  });

  const [insights, setInsights] = useState([]);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Generate mock data for demonstration
  const generateMockData = useMemo(() => {
    const now = new Date();
    const balanceHistory = [];
    const transactionHistory = [];
    const portfolioDistribution = [];
    const monthlyPerformance = [];

    // Generate balance history data
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      balanceHistory.push({
        date: format(date, 'MMM dd'),
        balance: Math.random() * 50000 + 10000,
        change: Math.random() * 2000 - 1000
      });
    }

    // Generate transaction history
    for (let i = 7; i >= 0; i--) {
      const date = subDays(now, i);
      transactionHistory.push({
        date: format(date, 'MMM dd'),
        transactions: Math.floor(Math.random() * 20) + 5,
        volume: Math.random() * 10000 + 1000
      });
    }

    // Generate portfolio distribution
    portfolioDistribution.push(
      { name: 'Bitcoin', value: 45, color: '#f7931a' },
      { name: 'Ethereum', value: 25, color: '#627eea' },
      { name: 'Cardano', value: 15, color: '#0033ad' },
      { name: 'Solana', value: 10, color: '#14f195' },
      { name: 'Others', value: 5, color: '#64748b' }
    );

    // Generate monthly performance
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyPerformance.push({
        month: format(date, 'MMM'),
        performance: Math.random() * 20 - 10,
        volume: Math.random() * 100000 + 50000
      });
    }

    return {
      balanceHistory,
      transactionHistory,
      portfolioDistribution,
      monthlyPerformance
    };
  }, []);

  useEffect(() => {
    setChartData(generateMockData);
  }, [generateMockData]);

  useEffect(() => {
    const calculateOverviewData = () => {
      const totalBalance = cryptoWallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const totalBalanceUSD = totalBalance * 1.2; // Mock conversion rate
      const portfolioChange = Math.random() * 2000 - 1000;
      const portfolioChangePercent = (portfolioChange / totalBalance) * 100;

      setOverviewData({
        totalBalance,
        totalBalanceUSD,
        portfolioChange,
        portfolioChangePercent,
        activeWallets: cryptoWallets?.length || 0,
        totalTransactions: Math.floor(Math.random() * 100) + 50,
        pendingTransactions: Math.floor(Math.random() * 10) + 2,
        completedTransactions: Math.floor(Math.random() * 80) + 40,
        failedTransactions: Math.floor(Math.random() * 5) + 1
      });
    };

    calculateOverviewData();
  }, [cryptoWallets]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? <FiTrendingUp className="text-green-500" /> : <FiTrendingDown className="text-red-500" />;
  };

  // Mock asset data for better visualization
  const mockAssets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, value: 22500, change: 2.5, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', balance: 3.2, value: 9600, change: -1.2, icon: 'Ξ' },
    { symbol: 'ADA', name: 'Cardano', balance: 5000, value: 1500, change: 5.8, icon: '₳' },
    { symbol: 'SOL', name: 'Solana', balance: 25, value: 2400, change: 8.3, icon: '◎' },
    { symbol: 'USDC', name: 'USD Coin', balance: 1000, value: 1000, change: 0.0, icon: '$' }
  ];

  return (
    <div className="overview-container">
      {/* Header Section */}
      <div className="overview-header">
        <div className="overview-title-section">
          <h1 className="overview-title">Dashboard Overview</h1>
          <p className="overview-subtitle">Welcome back, {user?.displayName || 'User'}</p>
        </div>
        <div className="overview-actions">
          <button 
            className="overview-action-btn"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <FiEyeOff /> : <FiEye />}
            {showBalances ? 'Hide' : 'Show'} Balances
          </button>
          <button 
            className="overview-action-btn"
            onClick={() => setIsRefreshing(true)}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Portfolio Summary Card */}
      <div className="portfolio-summary-card">
        <div className="portfolio-header">
          <div className="portfolio-title">
            <FiDollarSignIcon className="portfolio-icon" />
            <span>Portfolio Value</span>
          </div>
          <div className="portfolio-balance">
            {showBalances ? formatCurrency(overviewData.totalBalanceUSD) : '••••••'}
          </div>
          <div className="portfolio-change">
            {getChangeIcon(overviewData.portfolioChange)}
            <span style={{ color: getChangeColor(overviewData.portfolioChange) }}>
              {overviewData.portfolioChangePercent >= 0 ? '+' : ''}
              {overviewData.portfolioChangePercent.toFixed(2)}%
            </span>
            <span className="change-period">vs last week</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <FiWallet />
          </div>
          <div className="quick-stat-content">
            <div className="quick-stat-value">{overviewData.activeWallets}</div>
            <div className="quick-stat-label">Active Wallets</div>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <FiActivity />
          </div>
          <div className="quick-stat-content">
            <div className="quick-stat-value">{formatNumber(overviewData.totalTransactions)}</div>
            <div className="quick-stat-label">Total Transactions</div>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <FiPercent />
          </div>
          <div className="quick-stat-content">
            <div className="quick-stat-value">
              {((overviewData.completedTransactions / overviewData.totalTransactions) * 100).toFixed(1)}%
            </div>
            <div className="quick-stat-label">Success Rate</div>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <FiTrendingUpIcon />
          </div>
          <div className="quick-stat-content">
            <div className="quick-stat-value">+12.5%</div>
            <div className="quick-stat-label">Monthly Growth</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="overview-main-grid">
        {/* Portfolio Performance Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">Portfolio Performance</h3>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="chart-select"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData.balanceHistory}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(249, 115, 22, 0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Distribution */}
        <div className="assets-section">
          <div className="assets-header">
            <h3 className="assets-title">Asset Distribution</h3>
            <button className="view-all-btn">View All <FiArrowRight /></button>
          </div>
          <div className="assets-list">
            {mockAssets.map((asset, index) => (
              <div key={index} className="asset-item">
                <div className="asset-info">
                  <div className="asset-icon">{asset.icon}</div>
                  <div className="asset-details">
                    <div className="asset-name">{asset.name}</div>
                    <div className="asset-balance">
                      {asset.balance} {asset.symbol}
                    </div>
                  </div>
                </div>
                <div className="asset-values">
                  <div className="asset-value">
                    {showBalances ? formatCurrency(asset.value) : '••••••'}
                  </div>
                  <div className={`asset-change ${asset.change >= 0 ? 'positive' : 'negative'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="activity-header">
          <h3 className="activity-title">Recent Activity</h3>
          <button className="activity-view-all">View All</button>
        </div>
        <div className="activity-list">
          {[
            { type: 'receive', message: 'Received 0.5 BTC', time: '2 min ago', amount: '+$22,500' },
            { type: 'send', message: 'Sent 100 USDC', time: '1 hour ago', amount: '-$100' },
            { type: 'swap', message: 'Swapped ETH to SOL', time: '3 hours ago', amount: '$2,400' },
            { type: 'stake', message: 'Staked 500 ADA', time: '5 hours ago', amount: '+$1,500' },
            { type: 'receive', message: 'Received 0.1 BTC', time: '1 day ago', amount: '+$4,500' }
          ].map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'receive' && <FiArrowDownRight />}
                {activity.type === 'send' && <FiArrowUpRight />}
                {activity.type === 'swap' && <FiRefreshCw />}
                {activity.type === 'stake' && <FiZap />}
              </div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
              <div className={`activity-amount ${activity.type}`}>
                {activity.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview; 