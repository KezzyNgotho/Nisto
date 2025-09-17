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

persistent actor SwapService {
  
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

  // State with transient declarations
  private transient var nextSwapId: Nat = 1;
  private transient var nextHistoryId: Nat = 1;
  
  private transient let currencies = HashMap.HashMap<Text, Currency>(100, Text.equal, Text.hash);
  private transient let swapHistory = HashMap.HashMap<Text, SwapHistory>(100, Text.equal, Text.hash);
  private transient let userSwapHistory = HashMap.HashMap<Principal, [Text]>(100, Principal.equal, Principal.hash);
  private transient let marketData = HashMap.HashMap<Text, MarketData>(1, Text.equal, Text.hash);
  private transient let gasFees = HashMap.HashMap<Text, GasFeeInfo>(10, Text.equal, Text.hash);
  private transient let priceCache = HashMap.HashMap<Text, (Float, Int)>(100, Text.equal, Text.hash);
  
  // Cache duration (30 seconds)
  private transient let CACHE_DURATION = 30;
  
  // HTTP outcalls
  private transient let ic = actor "aaaaa-aa" : actor {
    http_request : HttpRequest -> async HttpResponse;
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
        #err("HTTP error occurred");
      };
    } catch (error) {
      #err("Request failed");
    };
  };

  private func fetchCryptocurrencies(): async Result.Result<[Currency], Text> {
    let url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h";
    
    switch (await makeHttpRequest(url)) {
      case (#ok(responseText)) {
        Debug.print("Got API response, length: " # Nat.toText(Text.size(responseText)));
        // TODO: Implement proper JSON parsing
        #err("JSON parsing not implemented yet");
      };
      case (#err(error)) {
        Debug.print("API Error: " # error);
        #err(error);
      };
    };
  };

  // Mock data helpers (fallback only)
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
      }
    ];
  };

  // Initialize
  private func initializeData() {
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
    gasFees.put("IC_NATIVE", icGasFee);
  };

  // Initialize on deployment
  initializeData();

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
