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
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import JSON "mo:json/JSON";

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
  
  // Cache duration (30 seconds)
  private let CACHE_DURATION = 30;
  
  // HTTP outcalls
  private let ic = actor "aaaaa-aa" : actor {
    http_request : HttpRequest -> async HttpResponse;
  };
  
  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [(Text, Text)];
    body : ?Blob;
  };
  
  public type HttpResponse = {
    status_code : Nat16;
    headers : [(Text, Text)];
    body : Blob;
  };

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

  // Real API functions using HTTP outcalls
  private func makeHttpRequest(url: Text): async Result.Result<Text, Text> {
    let request: HttpRequest = {
      method = "GET";
      url = url;
      headers = [
        ("User-Agent", "Nisto-SwapService/1.0"),
        ("Accept", "application/json")
      ];
      body = null;
    };

    try {
      let response = await ic.http_request(request);
      
      if (response.status_code == 200) {
        let bodyText = Text.decodeUtf8(response.body);
        switch (bodyText) {
          case (?text) { #ok(text) };
          case (null) { #err("Failed to decode response body") };
        };
      } else {
        #err("HTTP error: " # Nat16.toText(response.status_code));
      };
    } catch (error) {
      #err("Request failed: " # debug_show(error));
    };
  };

  private func fetchCryptocurrencies(): async Result.Result<[Currency], Text> {
    let url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h";
    
    switch (await makeHttpRequest(url)) {
      case (#ok(responseText)) {
        // Parse JSON response and convert to Currency array
        switch (JSON.parse(responseText)) {
          case (#ok(json)) {
            switch (JSON.getArray(json)) {
              case (#ok(array)) {
                let currencies = Buffer.Buffer<Currency>(array.size());
                for (item in array.vals()) {
                  switch (parseCurrencyFromJson(item)) {
                    case (#ok(currency)) { currencies.add(currency) };
                    case (#err(_)) { /* Skip invalid items */ };
                  };
                };
                #ok(Buffer.toArray(currencies));
              };
              case (#err(_)) { #err("Invalid JSON array") };
            };
          };
          case (#err(_)) { #err("Invalid JSON") };
        };
      };
      case (#err(error)) {
        Debug.print("API Error: " # error);
        // Fallback to mock data
        #ok(await getMockCurrencies());
      };
    };
  };

  private func fetchCurrencyPrice(currencyId: Text): async Result.Result<Float, Text> {
    let cacheKey = currencyId;
    let now = Time.now();
    
    // Check cache first
    switch (priceCache.get(cacheKey)) {
      case (?(price, timestamp)) {
        if (now - timestamp < CACHE_DURATION * 1000000000) { // 30 seconds in nanoseconds
          return #ok(price);
        };
      };
      case (null) {};
    };

    let url = "https://api.coingecko.com/api/v3/simple/price?ids=" # currencyId # "&vs_currencies=usd";
    
    switch (await makeHttpRequest(url)) {
      case (#ok(responseText)) {
        // Parse JSON and extract price
        switch (JSON.parse(responseText)) {
          case (#ok(json)) {
            switch (JSON.getObject(json)) {
              case (#ok(obj)) {
                switch (JSON.getObjectField(obj, currencyId)) {
                  case (#ok(currencyObj)) {
                    switch (JSON.getObjectField(currencyObj, "usd")) {
                      case (#ok(priceJson)) {
                        switch (JSON.getNumber(priceJson)) {
                          case (#ok(price)) {
                            let floatPrice = Float.fromInt(Int.abs(Int.fromText(price)));
                            priceCache.put(cacheKey, (floatPrice, now));
                            #ok(floatPrice);
                          };
                          case (#err(_)) { #err("Invalid price format") };
                        };
                      };
                      case (#err(_)) { #err("Price field not found") };
                    };
                  };
                  case (#err(_)) { #err("Currency not found in response") };
                };
              };
              case (#err(_)) { #err("Invalid JSON object") };
            };
          };
          case (#err(_)) { #err("Invalid JSON") };
        };
      };
      case (#err(error)) {
        Debug.print("Price fetch error: " # error);
        // Fallback to mock price
        let mockPrice = getMockPrice(currencyId);
        priceCache.put(cacheKey, (mockPrice, now));
        #ok(mockPrice);
      };
    };
  };

  // Mock data helpers (will be replaced with real parsing)
  private func getMockCurrencies(): async [Currency] {
    [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
        id = "binancecoin";
        symbol = "BNB";
        name = "BNB";
        price = 650.0;
        change24h = 1.8;
        marketCap = ?95000000000.0;
        volume = ?2000000000.0;
        image = "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png";
        icon = "FiTarget";
        color = "#F3BA2F";
      },
      {
        id = "cardano";
        symbol = "ADA";
        name = "Cardano";
        price = 0.45;
        change24h = -2.1;
        marketCap = ?15000000000.0;
        volume = ?300000000.0;
        image = "https://assets.coingecko.com/coins/images/975/large/cardano.png";
        icon = "FiGlobe";
        color = "#0033AD";
      },
      {
        id = "avalanche-2";
        symbol = "AVAX";
        name = "Avalanche";
        price = 35.0;
        change24h = 4.2;
        marketCap = ?13000000000.0;
        volume = ?400000000.0;
        image = "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png";
        icon = "FiGlobe";
        color = "#E84142";
      },
      {
        id = "chainlink";
        symbol = "LINK";
        name = "Chainlink";
        price = 14.5;
        change24h = 1.3;
        marketCap = ?8000000000.0;
        volume = ?200000000.0;
        image = "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png";
        icon = "FiLink";
        color = "#2A5ADA";
      },
      {
        id = "polkadot";
        symbol = "DOT";
        name = "Polkadot";
        price = 6.8;
        change24h = -0.8;
        marketCap = ?8000000000.0;
        volume = ?150000000.0;
        image = "https://assets.coingecko.com/coins/images/12171/large/polkadot.png";
        icon = "FiGlobe";
        color = "#E6007A";
      },
      {
        id = "litecoin";
        symbol = "LTC";
        name = "Litecoin";
        price = 85.0;
        change24h = 2.1;
        marketCap = ?6000000000.0;
        volume = ?300000000.0;
        image = "https://assets.coingecko.com/coins/images/2/large/litecoin.png";
        icon = "FiStar";
        color = "#BFBBBB";
      },
      {
        id = "uniswap";
        symbol = "UNI";
        name = "Uniswap";
        price = 6.2;
        change24h = 3.5;
        marketCap = ?4000000000.0;
        volume = ?100000000.0;
        image = "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png";
        icon = "FiTarget";
        color = "#FF007A";
      }
    ];
  };

  private func getMockPrice(currencyId: Text): Float {
    switch (currencyId) {
      case ("bitcoin") { 112000.0 };
      case ("ethereum") { 3456.0 };
      case ("tether") { 1.0 };
      case ("usd-coin") { 1.0 };
      case ("internet-computer") { 12.0 };
      case ("solana") { 180.0 };
      case ("dogecoin") { 0.35 };
      case ("pepe") { 0.00001234 };
      case ("binancecoin") { 650.0 };
      case ("cardano") { 0.45 };
      case ("avalanche-2") { 35.0 };
      case ("chainlink") { 14.5 };
      case ("polkadot") { 6.8 };
      case ("litecoin") { 85.0 };
      case ("uniswap") { 6.2 };
      case (_) { 1.0 };
    };
  };

  // Initialize on deployment
  initializeMockData();

  // Public functions
  public func getAllCurrencies(): async [Currency] {
    // Try to fetch fresh data from API
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        // Update local cache with fresh data
        for (currency in apiCurrencies.vals()) {
          currencies.put(currency.symbol, currency);
        };
        apiCurrencies;
      };
      case (#err(_)) {
        // Fallback to cached data
        let buffer = Buffer.Buffer<Currency>(currencies.size());
        for (currency in currencies.vals()) {
          buffer.add(currency);
        };
        Buffer.toArray(buffer);
      };
    };
  };

  public query func getCurrency(symbol: Text): async ?Currency {
    currencies.get(symbol);
  };

  public func searchCurrencies(searchQuery: Text): async [Currency] {
    // First try to get fresh data from API
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        // Update local cache
        for (currency in apiCurrencies.vals()) {
          currencies.put(currency.symbol, currency);
        };
      };
      case (#err(_)) {
        // Continue with cached data
      };
    };

    // Search in all currencies
    let buffer = Buffer.Buffer<Currency>(10);
    let lowerQuery = Text.toLowercase(searchQuery);
    
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

  public func calculateExchangeRate(fromCurrency: Text, toCurrency: Text): async Result.Result<Float, Text> {
    // Try to get fresh prices from API
    let fromPriceResult = await fetchCurrencyPrice(fromCurrency);
    let toPriceResult = await fetchCurrencyPrice(toCurrency);
    
    switch (fromPriceResult, toPriceResult) {
      case (#ok(fromPrice), #ok(toPrice)) {
        let rate = fromPrice / toPrice;
        #ok(rate);
      };
      case (#err(_), _) {
        // Fallback to cached data
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
      case (_, #err(_)) {
        // Fallback to cached data
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
    };
  };

  public func calculateSwapAmount(fromCurrency: Text, toCurrency: Text, fromAmount: Float): async Result.Result<Float, Text> {
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

  // Data refresh functions
  public func refreshAllCurrencies(): async Result.Result<[Currency], Text> {
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        // Clear and update currencies
        currencies.clear();
        for (currency in apiCurrencies.vals()) {
          currencies.put(currency.symbol, currency);
        };
        #ok(apiCurrencies);
      };
      case (#err(error)) {
        #err(error);
      };
    };
  };

  public func refreshCurrencyPrice(symbol: Text): async Result.Result<Float, Text> {
    await fetchCurrencyPrice(symbol);
  };

  public func updateMarketDataFromAPI(): async Result.Result<MarketData, Text> {
    // This would fetch real market data from APIs
    // For now, return current market data
    switch (marketData.get("current")) {
      case (?data) { #ok(data) };
      case (null) { #err("No market data available") };
    };
  };

  // Admin functions
  public func clearAllData(): async () {
    currencies.clear();
    swapHistory.clear();
    userSwapHistory.clear();
    marketData.clear();
    gasFees.clear();
    priceCache.clear();
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
