import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import JSON "mo:serde/JSON";
import HTTP "mo:http/Http";
import Blob "mo:base/Blob";
import Char "mo:base/Char";

actor SwapService {
  
  // Types
  public type Currency = {
    id: Text;
    symbol: Text;
    name: Text;
    price: Float;
    change24h: Float;
    marketCap: ?Float;
    volume: ?Float;
    image: Text;
    icon: Text;
    color: Text;
  };

  public type SwapRequest = {
    fromCurrency: Text;
    toCurrency: Text;
    fromAmount: Float;
    slippage: Float;
    userPrincipal: Principal;
  };

  public type SwapResult = {
    success: Bool;
    transactionId: ?Text;
    fromAmount: Float;
    toAmount: Float;
    rate: Float;
    gasFee: Float;
    priceImpact: Float;
    minimumReceived: Float;
    timestamp: Int;
    error: ?Text;
  };

  public type MarketData = {
    totalVolume24h: Float;
    totalPairs: Nat;
    averageFee: Float;
    activeUsers: Nat;
    timestamp: Int;
  };

  public type GasFeeInfo = {
    amount: Float;
    currency: Text;
    usdEquivalent: Float;
    estimatedTime: Text;
    swapType: Text;
  };

  public type SwapHistory = {
    id: Text;
    fromCurrency: Text;
    toCurrency: Text;
    fromAmount: Float;
    toAmount: Float;
    rate: Float;
    gasFee: Float;
    priceImpact: Float;
    status: Text;
    timestamp: Int;
    userPrincipal: Principal;
  };

  // State
  private var nextSwapId: Nat = 1;
  private var nextHistoryId: Nat = 1;
  
  private let currencies = HashMap.HashMap<Text, Currency>(100, Text.equal, Text.hash);
  private let swapHistory = HashMap.HashMap<Text, SwapHistory>(100, Text.equal, Text.hash);
  private let userSwapHistory = HashMap.HashMap<Principal, [Text]>(100, Principal.equal, Principal.hash);
  private let marketData = HashMap.HashMap<Text, MarketData>(1, Text.equal, Text.hash);
  private let gasFees = HashMap.HashMap<Text, GasFeeInfo>(10, Text.equal, Text.hash);
  private let priceCache = HashMap.HashMap<Text, (Float, Int)>(100, Text.equal, Text.hash);
  
  // HTTP client for API calls
  private let http = HTTP.HttpOutcall();
  
  // API endpoints
  private let COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
  private let CACHE_DURATION = 30; // 30 seconds cache

  // Mock data for development (will be replaced with real API calls)
  private func initializeMockData() {
    // Initialize popular cryptocurrencies
    let btc: Currency = {
      id = "bitcoin";
      symbol = "BTC";
      name = "Bitcoin";
      price = 112000.0;
      change24h = 2.5;
      marketCap = ?850000000000.0;
      volume = ?25000000000.0;
      image = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
      icon = "FiStar";
      color = "#F7931A";
    };
    
    let eth: Currency = {
      id = "ethereum";
      symbol = "ETH";
      name = "Ethereum";
      price = 3456.0;
      change24h = -1.2;
      marketCap = ?360000000000.0;
      volume = ?15000000000.0;
      image = "https://assets.coingecko.com/coins/images/279/large/ethereum.png";
      icon = "FiActivity";
      color = "#627EEA";
    };
    
    let usdt: Currency = {
      id = "tether";
      symbol = "USDT";
      name = "Tether USD";
      price = 1.0;
      change24h = 0.1;
      marketCap = ?80000000000.0;
      volume = ?50000000000.0;
      image = "https://assets.coingecko.com/coins/images/325/large/Tether.png";
      icon = "FiDollarSign";
      color = "#26A17B";
    };
    
    let usdc: Currency = {
      id = "usd-coin";
      symbol = "USDC";
      name = "USD Coin";
      price = 1.0;
      change24h = 0.0;
      marketCap = ?30000000000.0;
      volume = ?20000000000.0;
      image = "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png";
      icon = "FiDollarSign";
      color = "#2775CA";
    };
    
    let icp: Currency = {
      id = "internet-computer";
      symbol = "ICP";
      name = "Internet Computer";
      price = 12.0;
      change24h = 2.5;
      marketCap = ?5000000000.0;
      volume = ?100000000.0;
      image = "https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png";
      icon = "FiGlobe";
      color = "#29BEEE";
    };
    
    let sol: Currency = {
      id = "solana";
      symbol = "SOL";
      name = "Solana";
      price = 180.0;
      change24h = 3.2;
      marketCap = ?80000000000.0;
      volume = ?1500000000.0;
      image = "https://assets.coingecko.com/coins/images/4128/large/solana.png";
      icon = "FiGlobe";
      color = "#9945FF";
    };
    
    let doge: Currency = {
      id = "dogecoin";
      symbol = "DOGE";
      name = "Dogecoin";
      price = 0.35;
      change24h = 5.1;
      marketCap = ?50000000000.0;
      volume = ?800000000.0;
      image = "https://assets.coingecko.com/coins/images/5/large/dogecoin.png";
      icon = "FiZap";
      color = "#C2A633";
    };
    
    let pepe: Currency = {
      id = "pepe";
      symbol = "PEPE";
      name = "Pepe";
      price = 0.00001234;
      change24h = 15.6;
      marketCap = ?5000000000.0;
      volume = ?500000000.0;
      image = "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg";
      icon = "FiZap";
      color = "#00D4AA";
    };

    currencies.put("BTC", btc);
    currencies.put("ETH", eth);
    currencies.put("USDT", usdt);
    currencies.put("USDC", usdc);
    currencies.put("ICP", icp);
    currencies.put("SOL", sol);
    currencies.put("DOGE", doge);
    currencies.put("PEPE", pepe);

    // Initialize market data
    let market: MarketData = {
      totalVolume24h = 2400000.0;
      totalPairs = 25;
      averageFee = 0.1;
      activeUsers = 1250;
      timestamp = Time.now();
    };
    marketData.put("current", market);

    // Initialize gas fees
    let icGasFee: GasFeeInfo = {
      amount = 0.0001;
      currency = "ICP";
      usdEquivalent = 0.0012;
      estimatedTime = "~2 seconds";
      swapType = "IC Native";
    };
    
    let crossChainGasFee: GasFeeInfo = {
      amount = 0.005;
      currency = "ETH";
      usdEquivalent = 17.28;
      estimatedTime = "~5 minutes";
      swapType = "Cross-Chain";
    };
    
    let fiatGasFee: GasFeeInfo = {
      amount = 0.001;
      currency = "USDT";
      usdEquivalent = 0.001;
      estimatedTime = "~1 minute";
      swapType = "Fiat Bridge";
    };

    gasFees.put("IC_NATIVE", icGasFee);
    gasFees.put("CROSS_CHAIN", crossChainGasFee);
    gasFees.put("FIAT_BRIDGE", fiatGasFee);
  };

  // Initialize on deployment
  initializeMockData();

  // Public functions
  public query func getAllCurrencies(): async [Currency] {
    let buffer = Buffer.Buffer<Currency>(currencies.size());
    for (currency in currencies.vals()) {
      buffer.add(currency);
    };
    Buffer.toArray(buffer);
  };

  public query func getCurrency(symbol: Text): async ?Currency {
    currencies.get(symbol);
  };

  public query func searchCurrencies(query: Text): async [Currency] {
    let buffer = Buffer.Buffer<Currency>(10);
    let lowerQuery = Text.toLowercase(query);
    
    for (currency in currencies.vals()) {
      let symbolMatch = Text.contains(Text.toLowercase(currency.symbol), #text lowerQuery);
      let nameMatch = Text.contains(Text.toLowercase(currency.name), #text lowerQuery);
      let idMatch = Text.contains(Text.toLowercase(currency.id), #text lowerQuery);
      
      if (symbolMatch or nameMatch or idMatch) {
        buffer.add(currency);
      };
    };
    Buffer.toArray(buffer);
  };

  public query func getMarketData(): async ?MarketData {
    marketData.get("current");
  };

  public query func calculateExchangeRate(fromCurrency: Text, toCurrency: Text): async Result.Result<Float, Text> {
    let fromCurrencyData = currencies.get(fromCurrency);
    let toCurrencyData = currencies.get(toCurrency);
    
    switch (fromCurrencyData, toCurrencyData) {
      case (?from, ?to) {
        let rate = from.price / to.price;
        #ok(rate);
      };
      case (null, _) {
        #err("From currency not found: " # fromCurrency);
      };
      case (_, null) {
        #err("To currency not found: " # toCurrency);
      };
    };
  };

  public query func calculateSwapAmount(fromCurrency: Text, toCurrency: Text, fromAmount: Float): async Result.Result<Float, Text> {
    switch (await calculateExchangeRate(fromCurrency, toCurrency)) {
      case (#ok(rate)) {
        let toAmount = fromAmount * rate;
        #ok(toAmount);
      };
      case (#err(msg)) {
        #err(msg);
      };
    };
  };

  public query func getGasFee(fromCurrency: Text, toCurrency: Text): async ?GasFeeInfo {
    // Determine swap type based on currencies
    let isICNative = (fromCurrency == "ICP" or toCurrency == "ICP");
    let isStablecoin = (fromCurrency == "USDT" or fromCurrency == "USDC" or 
                       toCurrency == "USDT" or toCurrency == "USDC");
    
    if (isICNative) {
      gasFees.get("IC_NATIVE");
    } else if (isStablecoin) {
      gasFees.get("FIAT_BRIDGE");
    } else {
      gasFees.get("CROSS_CHAIN");
    };
  };

  public query func calculatePriceImpact(fromCurrency: Text, toCurrency: Text, fromAmount: Float): async Float {
    // Mock price impact calculation (0.1% to 2% based on amount)
    let baseImpact = 0.1;
    let amountFactor = Float.min(fromAmount / 10000.0, 2.0);
    baseImpact + amountFactor;
  };

  public func executeSwap(request: SwapRequest): async Result.Result<SwapResult, Text> {
    let swapId = "swap_" # Nat.toText(nextSwapId);
    nextSwapId += 1;

    // Validate currencies exist
    let fromCurrencyData = currencies.get(request.fromCurrency);
    let toCurrencyData = currencies.get(request.toCurrency);
    
    switch (fromCurrencyData, toCurrencyData) {
      case (?from, ?to) {
        // Calculate swap details
        let rate = from.price / to.price;
        let toAmount = request.fromAmount * rate;
        let priceImpact = await calculatePriceImpact(request.fromCurrency, request.toCurrency, request.fromAmount);
        let minimumReceived = toAmount * (1.0 - request.slippage / 100.0);
        
        // Get gas fee
        let gasFeeInfo = await getGasFee(request.fromCurrency, request.toCurrency);
        let gasFee = switch (gasFeeInfo) {
          case (?fee) { fee.amount };
          case (null) { 0.001 };
        };

        // Create swap result
        let swapResult: SwapResult = {
          success = true;
          transactionId = ?swapId;
          fromAmount = request.fromAmount;
          toAmount = toAmount;
          rate = rate;
          gasFee = gasFee;
          priceImpact = priceImpact;
          minimumReceived = minimumReceived;
          timestamp = Time.now();
          error = null;
        };

        // Add to history
        let historyEntry: SwapHistory = {
          id = swapId;
          fromCurrency = request.fromCurrency;
          toCurrency = request.toCurrency;
          fromAmount = request.fromAmount;
          toAmount = toAmount;
          rate = rate;
          gasFee = gasFee;
          priceImpact = priceImpact;
          status = "completed";
          timestamp = Time.now();
          userPrincipal = request.userPrincipal;
        };

        swapHistory.put(swapId, historyEntry);
        
        // Add to user's history
        let userHistory = userSwapHistory.get(request.userPrincipal);
        let updatedHistory = switch (userHistory) {
          case (?history) {
            let buffer = Buffer.fromArray<Text>(history);
            buffer.add(swapId);
            Buffer.toArray(buffer);
          };
          case (null) {
            [swapId];
          };
        };
        userSwapHistory.put(request.userPrincipal, updatedHistory);

        #ok(swapResult);
      };
      case (null, _) {
        #err("From currency not found: " # request.fromCurrency);
      };
      case (_, null) {
        #err("To currency not found: " # request.toCurrency);
      };
    };
  };

  public query func getSwapHistory(userPrincipal: Principal): async [SwapHistory] {
    let userHistory = userSwapHistory.get(userPrincipal);
    switch (userHistory) {
      case (?historyIds) {
        let buffer = Buffer.Buffer<SwapHistory>(historyIds.size());
        for (id in historyIds.vals()) {
          switch (swapHistory.get(id)) {
            case (?history) { buffer.add(history); };
            case (null) {};
          };
        };
        Buffer.toArray(buffer);
      };
      case (null) {
        [];
      };
    };
  };

  public query func getSwapById(swapId: Text): async ?SwapHistory {
    swapHistory.get(swapId);
  };

  public func updateCurrencyPrice(symbol: Text, newPrice: Float): async Bool {
    switch (currencies.get(symbol)) {
      case (?currency) {
        let updatedCurrency: Currency = {
          id = currency.id;
          symbol = currency.symbol;
          name = currency.name;
          price = newPrice;
          change24h = currency.change24h;
          marketCap = currency.marketCap;
          volume = currency.volume;
          image = currency.image;
          icon = currency.icon;
          color = currency.color;
        };
        currencies.put(symbol, updatedCurrency);
        true;
      };
      case (null) {
        false;
      };
    };
  };

  public func addCurrency(currency: Currency): async Bool {
    currencies.put(currency.symbol, currency);
    true;
  };

  public func updateMarketData(data: MarketData): async Bool {
    marketData.put("current", data);
    true;
  };

  // Admin functions
  public func clearAllData(): async () {
    currencies.clear();
    swapHistory.clear();
    userSwapHistory.clear();
    marketData.clear();
    gasFees.clear();
    nextSwapId := 1;
    nextHistoryId := 1;
    initializeMockData();
  };

  public query func getStats(): async {
    totalCurrencies: Nat;
    totalSwaps: Nat;
    totalUsers: Nat;
  } {
    {
      totalCurrencies = currencies.size();
      totalSwaps = swapHistory.size();
      totalUsers = userSwapHistory.size();
    };
  };
}
