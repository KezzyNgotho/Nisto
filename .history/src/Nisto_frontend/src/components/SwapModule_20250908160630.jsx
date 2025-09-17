import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import marketDataService from '../services/marketData';
import { 
  FiRotateCcw,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowLeft,
  FiInfo,
  FiShield,
  FiClock,
  FiCheck,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiEyeOff,
  FiZap,
  FiStar,
  FiGlobe,
  FiTarget,
  FiSettings,
  FiAlertTriangle,
  FiMinus,
  FiPlus
} from 'react-icons/fi';
import './SwapModule.scss';

const SwapModule = ({ onBack }) => {
  const { user, isAuthenticated, backendService } = useAuth();
  const { showToast } = useNotification();
  const { theme } = useTheme();
  
  // Multi-currency support - now loaded dynamically
  const [currencies, setCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  const [swapForm, setSwapForm] = useState({
    fromCurrency: '',
    toCurrency: '',
    fromAmount: '',
    toAmount: '',
    rate: 0,
    slippage: 0.5,
    estimatedTime: '2-5 minutes',
    gasFee: 0.001,
    priceImpact: 0.1,
    gasFeeCurrency: 'ICP',
    gasFeeUSD: 0.001
  });

  const [loading, setLoading] = useState(false);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [swapHistory, setSwapHistory] = useState([]);
  const [showBalances, setShowBalances] = useState(true);
  const [swapStatus, setSwapStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [showSwapPreview, setShowSwapPreview] = useState(false);
  const [showGasFeeDetails, setShowGasFeeDetails] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  
  const slippagePresets = [0.1, 0.5, 1.0, 2.0];

  useEffect(() => {
    if (isAuthenticated) {
      // Load currencies first, then market data
      loadCurrencies().then(() => {
        loadSwapData();
      });
      
      // Set up real-time price updates every 30 seconds
      const priceUpdateInterval = setInterval(() => {
        loadSwapData();
      }, 30000);
      
      return () => clearInterval(priceUpdateInterval);
    }
  }, [isAuthenticated]);

  // Set default currencies when loaded
  useEffect(() => {
    if (currencies.length > 0 && !swapForm.fromCurrency && !swapForm.toCurrency) {
      // Set first two currencies as default
      const firstCurrency = currencies[0];
      const secondCurrency = currencies[1] || currencies[0];
      
      setSwapForm(prev => ({
        ...prev,
        fromCurrency: firstCurrency.id,
        toCurrency: secondCurrency.id
      }));
    }
  }, [currencies]);

  // Update rate when currencies are loaded or when from/to currencies change
  useEffect(() => {
    if (currencies.length > 0 && swapForm.fromCurrency && swapForm.toCurrency) {
      const updateRate = async () => {
        try {
          const rate = await calculateRate(swapForm.fromCurrency, swapForm.toCurrency);
          setSwapForm(prev => ({
            ...prev,
            rate: Number(rate) || 0
          }));
        } catch (error) {
          console.error('Error updating rate:', error);
        }
      };
      updateRate();
    }
  }, [currencies, swapForm.fromCurrency, swapForm.toCurrency]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (swapForm.fromAmount && swapForm.toAmount) {
              handleSwap();
            }
            break;
          case 'r':
            e.preventDefault();
            loadSwapData();
            break;
          case 's':
            e.preventDefault();
            setShowSlippageSettings(!showSlippageSettings);
            break;
          case 'b':
            e.preventDefault();
            setShowBalances(!showBalances);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [swapForm.fromAmount, swapForm.toAmount, showSlippageSettings, showBalances]);

  const loadCurrencies = async () => {
    setCurrenciesLoading(true);
    try {
      // Load all available cryptocurrencies from API (now gets 500+ cryptos)
      const allCryptos = await marketDataService.getAllCryptocurrencies();
      
      // Remove duplicates first, then transform API data to our currency format
      const uniqueCryptos = allCryptos.filter((crypto, index, self) => 
        index === self.findIndex(c => c.symbol.toLowerCase() === crypto.symbol.toLowerCase())
      );
      
      const transformedCurrencies = uniqueCryptos.map(crypto => {
        // Dynamic icon mapping based on crypto characteristics
        const getIcon = (symbol, name) => {
          const lowerSymbol = symbol.toLowerCase();
          const lowerName = name.toLowerCase();
          
          // Stable coins
          if (lowerSymbol.includes('usd') || lowerSymbol.includes('dai') || lowerSymbol.includes('busd')) {
            return FiDollarSign;
          }
          // Bitcoin variants
          if (lowerSymbol.includes('btc') || lowerName.includes('bitcoin')) {
            return FiStar;
          }
          // Ethereum variants
          if (lowerSymbol.includes('eth') || lowerName.includes('ethereum')) {
            return FiActivity;
          }
          // Meme coins (fun/animal themed)
          if (lowerName.includes('dog') || lowerName.includes('cat') || lowerName.includes('moon') || 
              lowerName.includes('safe') || lowerName.includes('baby') || lowerName.includes('floki') ||
              lowerName.includes('pepe') || lowerName.includes('shib') || lowerName.includes('bonk')) {
            return FiZap;
          }
          // Political/controversial tokens
          if (lowerName.includes('trump') || lowerName.includes('maga') || lowerName.includes('biden')) {
            return FiStar;
          }
          // DeFi tokens
          if (lowerName.includes('swap') || lowerName.includes('dex') || lowerName.includes('uni') ||
              lowerName.includes('pancake') || lowerName.includes('sushi')) {
            return FiTarget;
          }
          // Layer 1 blockchains
          if (lowerName.includes('chain') || lowerName.includes('network') || lowerSymbol.includes('dot') ||
              lowerSymbol.includes('ada') || lowerSymbol.includes('sol') || lowerSymbol.includes('avax')) {
            return FiGlobe;
          }
          // Gaming tokens
          if (lowerName.includes('game') || lowerName.includes('play') || lowerName.includes('axie') ||
              lowerName.includes('sand') || lowerName.includes('mana')) {
            return FiZap;
          }
          // Default for any other crypto
          return FiDollarSign;
        };

        // Dynamic color mapping based on crypto characteristics
        const getColor = (symbol, name) => {
          const lowerSymbol = symbol.toLowerCase();
          const lowerName = name.toLowerCase();
          
          // Stable coins - Green
          if (lowerSymbol.includes('usd') || lowerSymbol.includes('dai') || lowerSymbol.includes('busd')) {
            return theme.colors.success || '#26a17b';
          }
          // Bitcoin variants - Orange
          if (lowerSymbol.includes('btc') || lowerName.includes('bitcoin')) {
            return theme.colors.warning || '#f7931a';
          }
          // Ethereum variants - Blue
          if (lowerSymbol.includes('eth') || lowerName.includes('ethereum')) {
            return theme.colors.info || '#627eea';
          }
          // Meme coins - Bright colors
          if (lowerName.includes('dog') || lowerName.includes('cat') || lowerName.includes('moon') || 
              lowerName.includes('safe') || lowerName.includes('baby') || lowerName.includes('floki') ||
              lowerName.includes('pepe') || lowerName.includes('shib') || lowerName.includes('bonk')) {
            return theme.colors.primary || '#8b5cf6';
          }
          // Political tokens - Red/Orange
          if (lowerName.includes('trump') || lowerName.includes('maga') || lowerName.includes('biden')) {
            return theme.colors.error || '#ff6b35';
          }
          // DeFi tokens - Purple
          if (lowerName.includes('swap') || lowerName.includes('dex') || lowerName.includes('uni') ||
              lowerName.includes('pancake') || lowerName.includes('sushi')) {
            return theme.colors.primary || '#8b5cf6';
          }
          // Layer 1 blockchains - Blue
          if (lowerName.includes('chain') || lowerName.includes('network') || lowerSymbol.includes('dot') ||
              lowerSymbol.includes('ada') || lowerSymbol.includes('sol') || lowerSymbol.includes('avax')) {
            return theme.colors.info || '#00bfff';
          }
          // Gaming tokens - Green
          if (lowerName.includes('game') || lowerName.includes('play') || lowerName.includes('axie') ||
              lowerName.includes('sand') || lowerName.includes('mana')) {
            return theme.colors.success || '#00ff00';
          }
          // Default for any other crypto
          return theme.colors.text.secondary || '#6b7280';
        };

        return {
          id: crypto.symbol.toUpperCase(),
          name: crypto.name,
          symbol: crypto.symbol.toUpperCase(),
          icon: getIcon(crypto.symbol, crypto.name),
          price: crypto.current_price,
          balance: Math.random() * 10000, // Mock balance - will be replaced with real data
          color: getColor(crypto.symbol, crypto.name),
          change: crypto.price_change_percentage_24h || 0,
          marketCap: crypto.market_cap,
          volume: crypto.total_volume,
          image: crypto.image
        };
      });

      // Use only API currencies, no hardcoded tokens
      const finalCurrencies = transformedCurrencies.filter((crypto, index, self) => 
        index === self.findIndex(c => c.symbol.toLowerCase() === crypto.symbol.toLowerCase())
      );
      
      setCurrencies(finalCurrencies);
      setCurrenciesLoading(false);
    } catch (error) {
      console.error('Error loading currencies:', error);
      showToast('Failed to load currencies. Please refresh the page.', 'error');
      setCurrencies([]);
      setCurrenciesLoading(false);
    }
  };

  const loadSwapData = async () => {
    setLoading(true);
    try {
      // Load real-time market data
      const [cryptoPrices, fiatRates, nstData, marketOverview] = await Promise.all([
        marketDataService.getCryptoPrices(),
        marketDataService.getFiatRates(),
        marketDataService.getNSTPrice(),
        marketDataService.getMarketOverview()
      ]);

      // Update currencies with real-time data
      setCurrencies(prev => prev.map(currency => {
        let updatedCurrency = { ...currency };
        
        switch (currency.id) {
          case 'USDT':
            updatedCurrency.price = cryptoPrices.tether?.usd || 1.00;
            updatedCurrency.change = cryptoPrices.tether?.usd_24h_change || 0.00;
            break;
          case 'USDC':
            updatedCurrency.price = cryptoPrices['usd-coin']?.usd || 1.00;
            updatedCurrency.change = cryptoPrices['usd-coin']?.usd_24h_change || 0.00;
            break;
          case 'DAI':
            updatedCurrency.price = cryptoPrices.dai?.usd || 1.00;
            updatedCurrency.change = cryptoPrices.dai?.usd_24h_change || 0.01;
            break;
          case 'NST':
            updatedCurrency.price = nstData.price;
            updatedCurrency.change = nstData.change24h;
            break;
          case 'KES':
            updatedCurrency.price = fiatRates.rates?.KES || 0.0065;
            updatedCurrency.change = -0.5; // Mock change for KES
            break;
        }
        
        return updatedCurrency;
      }));

      // Update swap form with new rates
      const newRate = await marketDataService.calculateExchangeRate(
        swapForm.fromCurrency, 
        swapForm.toCurrency
      );
      
      setSwapForm(prev => ({
        ...prev,
        rate: Number(newRate) || 0
      }));

      // Update gas fees
      updateGasFee(swapForm.fromCurrency, swapForm.toCurrency, swapForm.fromAmount);
      
      setLoading(false);
      showToast('Market data updated successfully', 'success');
    } catch (error) {
      console.error('Error loading swap data:', error);
      setLoading(false);
      showToast('Failed to load market data. Using cached data.', 'warning');
    }
  };

  const handleFromCurrencyChange = async (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency) {
      try {
        const rate = await calculateRate(currencyId, swapForm.toCurrency);
        setSwapForm(prev => ({
          ...prev,
          fromCurrency: currencyId,
          rate: Number(rate) || 0,
          fromAmount: '',
          toAmount: ''
        }));
        
        // Update gas fee based on new currency pair
        updateGasFee(currencyId, swapForm.toCurrency, swapForm.fromAmount);
      } catch (error) {
        console.error('Error updating from currency:', error);
      }
    }
  };

  const handleToCurrencyChange = async (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency) {
      try {
        const rate = await calculateRate(swapForm.fromCurrency, currencyId);
        setSwapForm(prev => ({
          ...prev,
          toCurrency: currencyId,
          rate: Number(rate) || 0,
          fromAmount: '',
          toAmount: ''
        }));
        
        // Update gas fee based on new currency pair
        updateGasFee(swapForm.fromCurrency, currencyId, swapForm.fromAmount);
      } catch (error) {
        console.error('Error updating to currency:', error);
      }
    }
  };

  const calculateRate = async (fromCurrency, toCurrency) => {
    try {
      // Use market data service for real-time rates
      const rate = await marketDataService.calculateExchangeRate(fromCurrency, toCurrency);
      return rate;
    } catch (error) {
      console.error('Error calculating rate:', error);
      throw error; // Don't fallback to hardcoded values, let the error propagate
    }
  };

  const handleFromAmountChange = async (amount) => {
    if (!amount || amount === '') {
      setSwapForm(prev => ({
        ...prev,
        fromAmount: '',
        toAmount: ''
      }));
      return;
    }

    try {
      const rate = await calculateRate(swapForm.fromCurrency, swapForm.toCurrency);
      const toAmount = (parseFloat(amount) * rate).toFixed(6);
      
      // Update price impact
      updatePriceImpact(amount);
      
      setSwapForm(prev => ({
        ...prev,
        fromAmount: amount,
        toAmount: toAmount,
        rate: Number(rate) || 0
      }));
    } catch (error) {
      console.error('Error calculating amount:', error);
      showToast('Failed to calculate exchange rate. Please try again.', 'error');
    }
  };

  const handleToAmountChange = async (amount) => {
    if (!amount || amount === '') {
      setSwapForm(prev => ({
        ...prev,
        fromAmount: '',
        toAmount: ''
      }));
      return;
    }

    try {
      const rate = await calculateRate(swapForm.fromCurrency, swapForm.toCurrency);
      const fromAmount = (parseFloat(amount) / rate).toFixed(6);
      
      setSwapForm(prev => ({
        ...prev,
        fromAmount: fromAmount,
        toAmount: amount,
        rate: Number(rate) || 0
      }));
    } catch (error) {
      console.error('Error calculating amount:', error);
      showToast('Failed to calculate exchange rate. Please try again.', 'error');
    }
  };

  const handleSwap = async () => {
    // Validate inputs
    const errors = validateSwapInputs();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }

    setLoading(true);
    setSwapStatus('loading');
    
    try {
      // Mock swap transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSwapStatus('success');
      
      const swapRecord = {
        id: Date.now(),
        from: `${swapForm.fromAmount} ${swapForm.fromCurrency}`,
        to: `${swapForm.toAmount} ${swapForm.toCurrency}`,
        rate: swapForm.rate,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      setSwapHistory(prev => [swapRecord, ...prev]);
      showToast(`Successfully swapped ${swapForm.fromAmount} ${swapForm.fromCurrency} to ${swapForm.toAmount} ${swapForm.toCurrency}`, 'success');
      
      // Reset form after success
      setTimeout(() => {
        setSwapForm(prev => ({
          ...prev,
          fromAmount: '',
          toAmount: ''
        }));
        setSwapStatus('idle');
      }, 2000);
      
    } catch (error) {
      setSwapStatus('error');
      showToast('Failed to process swap', 'error');
      setTimeout(() => setSwapStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setSwapForm(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
      rate: Number(1 / prev.rate) || 0
    }));
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(balance);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const getCurrencyIcon = (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    if (currency && currency.icon) {
      const IconComponent = currency.icon;
      return <IconComponent size={20} style={{ color: currency.color }} />;
    }
    return <FiDollarSign size={20} style={{ color: theme.colors.text.secondary }} />;
  };

  const getCurrencyName = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.name || currencyId;
  };

  const getCurrencyBalance = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.balance || 0;
  };

  const getCurrencyPrice = (currencyId) => {
    const currency = currencies.find(c => c.id === currencyId);
    return currency ? currency.price : 0;
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const getCurrencyChange = (currencyId) => {
    return currencies.find(c => c.id === currencyId)?.change || 0;
  };

  const validateSwapInputs = () => {
    const errors = [];
    
    if (!swapForm.fromAmount || parseFloat(swapForm.fromAmount) <= 0) {
      errors.push('Please enter a valid amount to swap');
    }
    
    if (parseFloat(swapForm.fromAmount) > getCurrencyBalance(swapForm.fromCurrency)) {
      errors.push('Insufficient balance for this swap');
    }
    
    if (swapForm.fromCurrency === swapForm.toCurrency) {
      errors.push('Cannot swap the same currency');
    }
    
    if (swapForm.priceImpact > 5) {
      errors.push('Price impact too high (>5%). Consider reducing swap amount');
    }
    
    return errors;
  };

  const calculatePriceImpact = (amount) => {
    // Mock calculation - in real app, this would be based on liquidity
    const impact = (parseFloat(amount) / 10000) * 100;
    return Math.min(impact, 10); // Cap at 10%
  };

  const updatePriceImpact = (amount) => {
    const impact = calculatePriceImpact(amount);
    setSwapForm(prev => ({ ...prev, priceImpact: impact }));
  };

  const calculateGasFee = (fromCurrency, toCurrency, amount) => {
    // Gas fee calculation based on currency types and amount
    const baseGasFee = 0.001; // Base ICP gas fee
    
    // Different gas fees for different swap types
    if (fromCurrency === 'NST' || toCurrency === 'NST') {
      // Nisto token swaps (on IC) - very low gas
      return {
        gasFee: baseGasFee,
        gasFeeCurrency: 'ICP',
        gasFeeUSD: baseGasFee * 12, // ICP price ~$12
        estimatedTime: '1-2 minutes'
      };
    } else if (fromCurrency === 'USDT' || fromCurrency === 'USDC' || fromCurrency === 'DAI') {
      // Stablecoin swaps (cross-chain) - higher gas
      return {
        gasFee: 0.005,
        gasFeeCurrency: 'ICP',
        gasFeeUSD: 0.005 * 12,
        estimatedTime: '3-5 minutes'
      };
    } else if (fromCurrency === 'KES') {
      // Fiat currency swaps - highest gas (banking integration)
      return {
        gasFee: 0.01,
        gasFeeCurrency: 'ICP',
        gasFeeUSD: 0.01 * 12,
        estimatedTime: '5-10 minutes'
      };
    }
    
    // Default gas fee
    return {
      gasFee: baseGasFee,
      gasFeeCurrency: 'ICP',
      gasFeeUSD: baseGasFee * 12,
      estimatedTime: '2-5 minutes'
    };
  };

  const updateGasFee = (fromCurrency, toCurrency, amount) => {
    const gasInfo = calculateGasFee(fromCurrency, toCurrency, amount);
    setSwapForm(prev => ({
      ...prev,
      gasFee: gasInfo.gasFee,
      gasFeeCurrency: gasInfo.gasFeeCurrency,
      gasFeeUSD: gasInfo.gasFeeUSD,
      estimatedTime: gasInfo.estimatedTime
    }));
  };

  const shouldShowGasFeeProminently = () => {
    // Show gas fees prominently for expensive swaps or when it's a competitive advantage
    return swapForm.gasFeeUSD > 0.05 || // Show if gas > $0.05
           swapForm.fromCurrency === 'KES' || // Always show for fiat swaps
           swapForm.toCurrency === 'KES';
  };

  const getGasFeeMessage = () => {
    if (swapForm.gasFeeUSD < 0.02) {
      return "Ultra-low gas fee! 🚀";
    } else if (swapForm.gasFeeUSD < 0.10) {
      return "Low gas fee - great value! 💰";
    } else {
      return "Gas fee includes banking integration";
    }
  };

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const getFilteredCurrencies = () => {
    if (!currencySearchTerm) return currencies;
    
    // First, try to find in already loaded currencies
    const searchTerm = currencySearchTerm.toLowerCase().trim();
    const localMatches = currencies.filter(currency => 
      currency.name.toLowerCase().includes(searchTerm) ||
      currency.symbol.toLowerCase().includes(searchTerm) ||
      currency.id.toLowerCase().includes(searchTerm) ||
      // Also check if search term is contained in the name or symbol
      searchTerm.includes(currency.symbol.toLowerCase()) ||
      searchTerm.includes(currency.name.toLowerCase())
    );
    
    // If we found local matches, show them
    if (localMatches.length > 0) {
      return localMatches;
    }
    
    // If no local matches and we have search results, show them
    if (searchResults.length > 0) {
      return searchResults;
    }
    
    // If no matches at all, return empty array
    return [];
  };

  // Enhanced search function that searches CoinGecko API
  const performSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search CoinGecko API for the term
      const searchData = await marketDataService.searchCryptocurrencies(searchTerm);
      
      if (searchData.coins && searchData.coins.length > 0) {
        // Transform search results to our currency format
        const transformedResults = searchData.coins.map(coin => {
          const crypto = coin.item;
          
          // Dynamic icon mapping based on crypto characteristics
          const getIcon = (symbol, name) => {
            const lowerSymbol = symbol.toLowerCase();
            const lowerName = name.toLowerCase();
            
            // Stable coins
            if (lowerSymbol.includes('usd') || lowerSymbol.includes('dai') || lowerSymbol.includes('busd')) {
              return FiDollarSign;
            }
            // Bitcoin variants
            if (lowerSymbol.includes('btc') || lowerName.includes('bitcoin')) {
              return FiStar;
            }
            // Ethereum variants
            if (lowerSymbol.includes('eth') || lowerName.includes('ethereum')) {
              return FiActivity;
            }
            // Meme coins (fun/animal themed)
            if (lowerName.includes('dog') || lowerName.includes('cat') || lowerName.includes('moon') || 
                lowerName.includes('safe') || lowerName.includes('baby') || lowerName.includes('floki') ||
                lowerName.includes('pepe') || lowerName.includes('shib') || lowerName.includes('bonk')) {
              return FiZap;
            }
            // Political/controversial tokens
            if (lowerName.includes('trump') || lowerName.includes('maga') || lowerName.includes('biden')) {
              return FiStar;
            }
            // DeFi tokens
            if (lowerName.includes('swap') || lowerName.includes('dex') || lowerName.includes('uni') ||
                lowerName.includes('pancake') || lowerName.includes('sushi')) {
              return FiTarget;
            }
            // Layer 1 blockchains
            if (lowerName.includes('chain') || lowerName.includes('network') || lowerSymbol.includes('dot') ||
                lowerSymbol.includes('ada') || lowerSymbol.includes('sol') || lowerSymbol.includes('avax')) {
              return FiGlobe;
            }
            // Gaming tokens
            if (lowerName.includes('game') || lowerName.includes('play') || lowerName.includes('axie') ||
                lowerName.includes('sand') || lowerName.includes('mana')) {
              return FiZap;
            }
            // Default for any other crypto
            return FiDollarSign;
          };

          // Dynamic color mapping based on crypto characteristics
          const getColor = (symbol, name) => {
            const lowerSymbol = symbol.toLowerCase();
            const lowerName = name.toLowerCase();
            
            // Stable coins - Green
            if (lowerSymbol.includes('usd') || lowerSymbol.includes('dai') || lowerSymbol.includes('busd')) {
              return theme.colors.success || '#26a17b';
            }
            // Bitcoin variants - Orange
            if (lowerSymbol.includes('btc') || lowerName.includes('bitcoin')) {
              return theme.colors.warning || '#f7931a';
            }
            // Ethereum variants - Blue
            if (lowerSymbol.includes('eth') || lowerName.includes('ethereum')) {
              return theme.colors.info || '#627eea';
            }
            // Meme coins - Bright colors
            if (lowerName.includes('dog') || lowerName.includes('cat') || lowerName.includes('moon') || 
                lowerName.includes('safe') || lowerName.includes('baby') || lowerName.includes('floki') ||
                lowerName.includes('pepe') || lowerName.includes('shib') || lowerName.includes('bonk')) {
              return theme.colors.primary || '#8b5cf6';
            }
            // Political tokens - Red/Orange
            if (lowerName.includes('trump') || lowerName.includes('maga') || lowerName.includes('biden')) {
              return theme.colors.error || '#ff6b35';
            }
            // DeFi tokens - Purple
            if (lowerName.includes('swap') || lowerName.includes('dex') || lowerName.includes('uni') ||
                lowerName.includes('pancake') || lowerName.includes('sushi')) {
              return theme.colors.primary || '#8b5cf6';
            }
            // Layer 1 blockchains - Blue
            if (lowerName.includes('chain') || lowerName.includes('network') || lowerSymbol.includes('dot') ||
                lowerSymbol.includes('ada') || lowerSymbol.includes('sol') || lowerSymbol.includes('avax')) {
              return theme.colors.info || '#00bfff';
            }
            // Gaming tokens - Green
            if (lowerName.includes('game') || lowerName.includes('play') || lowerName.includes('axie') ||
                lowerName.includes('sand') || lowerName.includes('mana')) {
              return theme.colors.success || '#00ff00';
            }
            // Default for any other crypto
            return theme.colors.text.secondary || '#6b7280';
          };

          return {
            id: crypto.symbol.toUpperCase(),
            name: crypto.name,
            symbol: crypto.symbol.toUpperCase(),
            icon: getIcon(crypto.symbol, crypto.name),
            price: crypto.price_btc || 0, // CoinGecko search doesn't always have USD price
            balance: Math.random() * 10000, // Mock balance
            color: getColor(crypto.symbol, crypto.name),
            change: 0, // Search results don't have 24h change
            marketCap: crypto.market_cap_rank || null,
            volume: null,
            image: crypto.thumb
          };
        });
        
        // Remove duplicates from search results
        const uniqueSearchResults = transformedResults.filter((crypto, index, self) => 
          index === self.findIndex(c => c.symbol.toLowerCase() === crypto.symbol.toLowerCase())
        );
        
        setSearchResults(uniqueSearchResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(currencySearchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [currencySearchTerm]);

  return (
    <div className="swap-module">
      {/* Header Section */}
      <div className="swap-header">
        <button 
          className="back-btn"
          onClick={onBack}
          style={{ 
            background: 'transparent',
            color: theme.colors.text.primary,
            border: 'none'
          }}
        >
          <FiArrowLeft />
          Back to Overview
        </button>
        
        <div className="header-content">
         {/*  <h1 style={{ color: theme.colors.text.primary }}>Currency Swap</h1> */}
          <p style={{ color: theme.colors.text.secondary }}>
            Exchange between different currencies with the best rates
          </p>
          <div style={{ 
            fontSize: '0.75rem', 
            color: theme.colors.text.secondary, 
            marginTop: '0.5rem',
            opacity: 0.7
          }}>
            <span>Shortcuts: </span>
            <span style={{ color: theme.colors.primary }}>Ctrl+Enter</span> to swap, 
            <span style={{ color: theme.colors.primary }}> Ctrl+R</span> to refresh, 
            <span style={{ color: theme.colors.primary }}> Ctrl+S</span> for settings
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: theme.colors.success, 
            marginTop: '0.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>💡</span>
            <span>Gas fees 99% cheaper than Ethereum!</span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={loadSwapData}
            disabled={loading}
            style={{ 
              background: 'transparent',
              color: theme.colors.text.primary,
              border: 'none'
            }}
            title="Refresh rates"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button 
            className="balance-toggle"
            onClick={() => setShowBalances(!showBalances)}
            style={{ 
              background: 'transparent',
              color: theme.colors.text.primary,
              border: 'none'
            }}
            title={showBalances ? "Hide balances" : "Show balances"}
          >
            {showBalances ? <FiEye /> : <FiEyeOff />}
          </button>
          <button 
            className="settings-btn"
            onClick={() => setShowSlippageSettings(!showSlippageSettings)}
            style={{ 
              background: 'transparent',
              color: theme.colors.text.primary,
              border: 'none'
            }}
            title="Slippage settings"
          >
            <FiSettings />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="swap-content-grid">
        {/* Left Column - Swap Interface & Market Overview */}
        <div className="swap-interface-column">
          {/* Market Overview */}
          <div className="market-overview-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Market Overview</h3>
              <FiActivity style={{ color: theme.colors.primary }} />
            </div>
            <div className="market-stats">
              <div className="stat-row">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>24h Volume</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>$2.4M</span>
              </div>
              <div className="stat-row">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Total Pairs</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>25</span>
              </div>
              <div className="stat-row">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Avg. Fee</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>0.1%</span>
              </div>
            </div>
          </div>

          {/* Swap Card */}
          <div className="swap-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Swap Currencies</h3>
            <div className="swap-stats">
              <div className="stat-item">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Rate</span>
                <span style={{ color: theme.colors.text.primary, fontSize: '0.875rem', fontWeight: '600' }}>
                  1 {swapForm.fromCurrency} = {(Number(swapForm.rate) || 0).toFixed(6)} {swapForm.toCurrency}
                </span>
              </div>
              <div className="stat-item">
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.75rem' }}>Slippage</span>
                <button 
                  onClick={() => setShowSlippageSettings(!showSlippageSettings)}
                  style={{ 
                    color: theme.colors.text.primary, 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {swapForm.slippage}%
                </button>
              </div>
            </div>
            </div>

            <div className="swap-container">
              {/* From and To Currencies in Row */}
              <div className="swap-row">
                {/* From Currency */}
                <div className="swap-section">
                  <label style={{ color: theme.colors.text.primary }}>From</label>
                  <div className="currency-selector">
                    <div className="currency-icon">{getCurrencyIcon(swapForm.fromCurrency)}</div>
                    <select
                      value={swapForm.fromCurrency}
                      onChange={(e) => handleFromCurrencyChange(e.target.value)}
                      style={{ 
                        color: theme.colors.text.primary
                      }}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.symbol} - {currency.name} (${currency.price?.toFixed(2) || '0.00'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    value={swapForm.fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    style={{ 
                      color: theme.colors.text.primary
                    }}
                  />
                  <div className="balance-info">
                    <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>
                      Balance: {showBalances ? formatBalance(getCurrencyBalance(swapForm.fromCurrency)) : '••••••'} {swapForm.fromCurrency}
                    </span>
                    <span style={{ color: theme.colors.text.primary, fontSize: '0.8rem', fontWeight: '600', marginLeft: '1rem' }}>
                      {formatPrice(getCurrencyPrice(swapForm.fromCurrency))}
                    </span>
                  </div>
                </div>

                {/* Swap Arrow */}
                <div className="swap-arrow-container">
                  <button 
                    className="swap-arrow-btn"
                    onClick={swapCurrencies}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary || theme.colors.primary})`,
                      color: theme.colors.text.inverse || theme.colors.white,
                      boxShadow: `0 4px 20px ${theme.colors.shadow?.primary || theme.colors.primary + '20'}`
                    }}
                  >
                    <FiRotateCcw />
                  </button>
                </div>

                {/* To Currency */}
                <div className="swap-section">
                  <label style={{ color: theme.colors.text.primary }}>To</label>
                  <div className="currency-selector">
                    <div className="currency-icon">{getCurrencyIcon(swapForm.toCurrency)}</div>
                    <select
                      value={swapForm.toCurrency}
                      onChange={(e) => handleToCurrencyChange(e.target.value)}
                      style={{ 
                        color: theme.colors.text.primary
                      }}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.symbol} - {currency.name} (${currency.price?.toFixed(2) || '0.00'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    value={swapForm.toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="0.00"
                    style={{ 
                      color: theme.colors.text.primary
                    }}
                  />
                  <div className="balance-info">
                    <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>
                      Balance: {showBalances ? formatBalance(getCurrencyBalance(swapForm.toCurrency)) : '••••••'} {swapForm.toCurrency}
                    </span>
                    <span style={{ color: theme.colors.text.primary, fontSize: '0.8rem', fontWeight: '600', marginLeft: '1rem' }}>
                      {formatPrice(getCurrencyPrice(swapForm.toCurrency))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slippage Settings */}
            {showSlippageSettings && (
              <div className="slippage-settings" style={{ 
                padding: '1rem 1.5rem',
                borderTop: `1px solid ${theme.colors.border}`,
                background: theme.colors.background.primary
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>
                    Slippage Tolerance
                  </label>
                  <p style={{ color: theme.colors.text.secondary, fontSize: '0.8rem', margin: '0.25rem 0' }}>
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                </div>
                
                <div className="slippage-presets" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {slippagePresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => setSwapForm(prev => ({ ...prev, slippage: preset }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: `1px solid ${swapForm.slippage === preset ? theme.colors.primary : theme.colors.border}`,
                        background: swapForm.slippage === preset ? theme.colors.primary : 'transparent',
                        color: swapForm.slippage === preset ? theme.colors.text.inverse : theme.colors.text.primary,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={swapForm.slippage}
                    onChange={(e) => setSwapForm(prev => ({ ...prev, slippage: parseFloat(e.target.value) || 0 }))}
                    min="0.1"
                    max="50"
                    step="0.1"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>%</span>
                </div>
              </div>
            )}

            {/* Swap Preview */}
            {swapForm.fromAmount && swapForm.toAmount && (
              <div className="swap-preview" style={{ 
                padding: '1rem 1.5rem',
                borderTop: `1px solid ${theme.colors.border}`,
                background: theme.colors.background.primary
              }}>
                <h4 style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Swap Preview
                </h4>
                
                <div className="preview-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Price Impact</span>
                    <span style={{ 
                      color: swapForm.priceImpact > 5 ? theme.colors.error : 
                             swapForm.priceImpact > 2 ? theme.colors.warning : 
                             theme.colors.success,
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {swapForm.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Gas Fee</span>
                      {swapForm.gasFeeUSD < 0.02 && (
                        <span style={{ 
                          color: theme.colors.success, 
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          background: `${theme.colors.success}20`,
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          🚀 Ultra Low
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: theme.colors.text.primary, fontSize: '0.8rem', fontWeight: '600' }}>
                        {swapForm.gasFee} {swapForm.gasFeeCurrency}
                      </div>
                      <div style={{ color: theme.colors.text.secondary, fontSize: '0.7rem' }}>
                        ≈ ${swapForm.gasFeeUSD.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Minimum Received</span>
                    <span style={{ color: theme.colors.text.primary, fontSize: '0.8rem', fontWeight: '600' }}>
                      {(parseFloat(swapForm.toAmount) * (1 - swapForm.slippage / 100)).toFixed(6)} {swapForm.toCurrency}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>Estimated Time</span>
                    <span style={{ color: theme.colors.text.primary, fontSize: '0.8rem', fontWeight: '600' }}>
                      {swapForm.estimatedTime}
                    </span>
                  </div>
                  
                  {/* Gas Fee Breakdown */}
                  <div style={{ 
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: `${theme.colors.primary}10`,
                    border: `1px solid ${theme.colors.primary}20`
                  }}>
                    <div style={{ 
                      color: theme.colors.text.primary, 
                      fontSize: '0.8rem', 
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiZap size={14} />
                        Gas Fee Breakdown
                      </div>
                      <button
                        onClick={() => setShowGasFeeDetails(!showGasFeeDetails)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.colors.primary,
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {showGasFeeDetails ? 'Hide' : 'Compare'} vs others
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: theme.colors.text.secondary }}>Network Fee</span>
                        <span style={{ color: theme.colors.text.primary }}>{swapForm.gasFee} {swapForm.gasFeeCurrency}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: theme.colors.text.secondary }}>USD Value</span>
                        <span style={{ color: theme.colors.text.primary }}>${swapForm.gasFeeUSD.toFixed(4)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: theme.colors.text.secondary }}>Swap Type</span>
                        <span style={{ color: theme.colors.text.primary }}>
                          {swapForm.fromCurrency === 'NST' || swapForm.toCurrency === 'NST' ? 'IC Native' : 
                           swapForm.fromCurrency === 'KES' ? 'Fiat Bridge' : 'Cross-Chain'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Gas Fee Comparison */}
                    {showGasFeeDetails && (
                      <div style={{ 
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        background: `${theme.colors.success}10`,
                        border: `1px solid ${theme.colors.success}20`
                      }}>
                        <div style={{ 
                          color: theme.colors.success, 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          💰 Gas Fee Comparison
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                            <span style={{ color: theme.colors.text.secondary }}>Nisto (IC)</span>
                            <span style={{ color: theme.colors.success, fontWeight: '600' }}>${swapForm.gasFeeUSD.toFixed(4)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                            <span style={{ color: theme.colors.text.secondary }}>Ethereum</span>
                            <span style={{ color: theme.colors.error }}>$15-$50</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                            <span style={{ color: theme.colors.text.secondary }}>Polygon</span>
                            <span style={{ color: theme.colors.warning }}>$0.05-$0.20</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                            <span style={{ color: theme.colors.text.secondary }}>BSC</span>
                            <span style={{ color: theme.colors.warning }}>$0.50-$2.00</span>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          background: `${theme.colors.success}20`,
                          fontSize: '0.7rem',
                          color: theme.colors.success,
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          🚀 You save 99%+ vs Ethereum!
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {swapForm.priceImpact > 5 && (
                    <div style={{ 
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: `${theme.colors.error}20`,
                      border: `1px solid ${theme.colors.error}40`,
                      color: theme.colors.error,
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      ⚠️ High price impact detected. Consider reducing swap amount.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button 
              className="swap-btn"
              onClick={handleSwap}
              disabled={loading || !swapForm.fromAmount || !swapForm.toAmount}
              style={{ 
                background: swapStatus === 'success' ? theme.colors.success : 
                          swapStatus === 'error' ? theme.colors.error :
                          loading ? theme.colors.background.secondary : 
                          `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary || theme.colors.primary})`,
                color: theme.colors.text.inverse || theme.colors.white,
                border: 'none',
                boxShadow: `0 4px 20px ${theme.colors.shadow?.primary || theme.colors.primary + '20'}`
              }}
            >
              {swapStatus === 'success' ? (
                <>
                  <FiCheck />
                  Swap Successful!
                </>
              ) : swapStatus === 'error' ? (
                <>
                  <FiInfo />
                  Swap Failed
                </>
              ) : loading ? (
                <>
                  <FiRefreshCw className="spinning" />
                  Processing Swap...
                </>
              ) : (
                <>
                  <FiRotateCcw />
                  Swap Now
                </>
              )}
            </button>
          </div>

          {/* Swap History */}
          {swapHistory.length > 0 && (
            <div className="swap-history-card">
              <div className="history-header">
                <div className="history-title">
                  <FiClock style={{ color: theme.colors.primary }} />
                  <h3 style={{ color: theme.colors.text.primary }}>Recent Swaps</h3>
                </div>
                <div className="history-count" style={{ color: theme.colors.text.secondary }}>
                  {swapHistory.length} transactions
                </div>
              </div>
              
              <div className="history-list">
                {swapHistory.slice(0, 5).map((swap, index) => (
                  <div 
                    key={swap.id}
                    className="history-item"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.background.secondary}20, ${theme.colors.background.primary}20)`,
                      border: `1px solid ${theme.colors.border}40`,
                      borderRadius: '12px'
                    }}
                  >
                    <div className="history-item-header">
                      <div className="swap-direction">
                        <div className="currency-from">
                          <div className="currency-icon-small">
                            {getCurrencyIcon(swap.from.split(' ')[1])}
                          </div>
                          <span style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
                            {swap.from.split(' ')[0]}
                          </span>
                          <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>
                            {swap.from.split(' ')[1]}
                          </span>
                        </div>
                        
                        <div className="swap-arrow">
                          <FiRotateCcw style={{ color: theme.colors.primary }} />
                        </div>
                        
                        <div className="currency-to">
                          <div className="currency-icon-small">
                            {getCurrencyIcon(swap.to.split(' ')[1])}
                          </div>
                          <span style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
                            {swap.to.split(' ')[0]}
                          </span>
                          <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>
                            {swap.to.split(' ')[1]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="swap-status-badge" style={{ 
                        background: `${theme.colors.success}20`,
                        color: theme.colors.success,
                        border: `1px solid ${theme.colors.success}40`
                      }}>
                        <FiCheck size={12} />
                        <span>Completed</span>
                      </div>
                    </div>
                    
                    <div className="history-item-footer">
                      <div className="swap-rate" style={{ color: theme.colors.text.secondary }}>
                        Rate: 1 {swap.from.split(' ')[1]} = {swap.rate} {swap.to.split(' ')[1]}
                      </div>
                      <div className="swap-time" style={{ color: theme.colors.text.secondary }}>
                        {new Date(swap.timestamp).toLocaleDateString()} • {new Date(swap.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Currencies & Security */}
        <div className="market-info-column">
          {/* Available Currencies */}
          <div className="currencies-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Available Currencies</h3>
              <span style={{ color: theme.colors.text.secondary }}>{getFilteredCurrencies().length} assets</span>
            </div>
            
            {/* Currency Search */}
            <div style={{ padding: '0 1.5rem 1rem 1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={isSearching ? "Searching..." : "Search any cryptocurrency..."}
                  value={currencySearchTerm}
                  onChange={(e) => setCurrencySearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: isSearching ? '2.5rem' : '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                {isSearching && (
                  <div style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.primary
                  }}>
                    <FiRefreshCw className="spinning" size={16} />
                  </div>
                )}
              </div>
              {currencySearchTerm && (
                <div style={{
                  fontSize: '0.8rem',
                  color: theme.colors.text.secondary,
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}>
                  {isSearching ? 'Searching CoinGecko...' : 
                   getFilteredCurrencies().length > 0 ? `Found ${getFilteredCurrencies().length} results` :
                   'No results found'}
                </div>
              )}
            </div>
            <div className="currencies-list">
              {currenciesLoading ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '2rem',
                  color: theme.colors.text.secondary
                }}>
                  <FiRefreshCw className="spinning" style={{ marginBottom: '0.5rem' }} />
                  <div>Loading 500+ cryptocurrencies...</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
                    Search for ANY cryptocurrency!
                  </div>
                </div>
              ) : (
                getFilteredCurrencies().map(currency => (
                <div 
                  key={currency.id}
                  className="currency-item"
                  style={{ 
                    background: theme.colors.background.primary,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  <div className="currency-info">
                    <div className="currency-icon">{getCurrencyIcon(currency.id)}</div>
                    <div className="currency-details">
                      <span style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>{currency.symbol}</span>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.8rem' }}>{currency.name}</span>
                    </div>
                  </div>
                  <div className="currency-stats">
                    <div className="currency-price" style={{ color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: '600' }}>
                      {showBalances ? formatPrice(currency.price) : '••••••'}
                    </div>
                    <div 
                      className="currency-change"
                      style={{ 
                        color: currency.change >= 0 ? theme.colors.success || '#10b981' : theme.colors.error || '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {currency.change >= 0 ? '+' : ''}{currency.change}%
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="security-card" style={{ 
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="card-header">
              <h3 style={{ color: theme.colors.text.primary }}>Security</h3>
              <FiShield style={{ color: theme.colors.primary }} />
            </div>
            <div className="security-info">
              <div className="security-item">
                <FiShield style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  MPC-protected transactions
                </span>
              </div>
              <div className="security-item">
                <FiClock style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  {swapForm.estimatedTime} processing time
                </span>
              </div>
              <div className="security-item">
                <FiTrendingUp style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                  Best rates guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapModule;