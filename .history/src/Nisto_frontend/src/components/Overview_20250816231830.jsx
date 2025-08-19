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
  FiTrendingUp as FiTrendingUpIcon
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
            onClick={() => setIsRefreshing(true)}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            className="overview-action-btn"
            onClick={() => setExportLoading(true)}
            disabled={exportLoading}
          >
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="overview-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiDollarSign className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Balance</div>
            <div className="stat-value">
              {showBalances ? formatCurrency(overviewData.totalBalanceUSD) : '••••••'}
            </div>
            <div className="stat-change">
              {getChangeIcon(overviewData.portfolioChange)}
              <span style={{ color: getChangeColor(overviewData.portfolioChange) }}>
                {overviewData.portfolioChangePercent >= 0 ? '+' : ''}
                {overviewData.portfolioChangePercent.toFixed(2)}%
              </span>
              <span className="stat-change-period">vs last week</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiWallet className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Wallets</div>
            <div className="stat-value">{overviewData.activeWallets}</div>
            <div className="stat-change">
              <FiTrendingUpIcon className="text-green-500" />
              <span className="text-green-600">+2</span>
              <span className="stat-change-period">this month</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiActivity className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{formatNumber(overviewData.totalTransactions)}</div>
            <div className="stat-change">
              <FiTrendingUpIcon className="text-green-500" />
              <span className="text-green-600">+12%</span>
              <span className="stat-change-period">vs last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiBarChart3 className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">
              {((overviewData.completedTransactions / overviewData.totalTransactions) * 100).toFixed(1)}%
            </div>
            <div className="stat-change">
              <FiCheckCircle className="text-green-500" />
              <span className="text-green-600">98.5%</span>
              <span className="stat-change-period">avg success</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="overview-charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Portfolio Performance</h3>
            <div className="chart-actions">
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

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Portfolio Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData.portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(249, 115, 22, 0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overview-activity-section">
        <div className="activity-header">
          <h3 className="activity-title">Recent Activity</h3>
          <button className="activity-view-all">View All</button>
        </div>
        <div className="activity-list">
          {[
            { type: 'transaction', message: 'Received 0.5 BTC', time: '2 min ago', status: 'completed' },
            { type: 'wallet', message: 'New wallet connected', time: '1 hour ago', status: 'success' },
            { type: 'security', message: '2FA enabled', time: '3 hours ago', status: 'completed' },
            { type: 'transaction', message: 'Sent 100 USDC', time: '5 hours ago', status: 'completed' },
            { type: 'wallet', message: 'Wallet synced', time: '1 day ago', status: 'success' }
          ].map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'transaction' && <FiSend />}
                {activity.type === 'wallet' && <FiWallet />}
                {activity.type === 'security' && <FiShield />}
              </div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
              <div className={`activity-status ${activity.status}`}>
                {activity.status === 'completed' && <FiCheckCircle />}
                {activity.status === 'success' && <FiCheckCircle />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview; 