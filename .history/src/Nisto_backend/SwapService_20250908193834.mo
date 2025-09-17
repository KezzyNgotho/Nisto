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
        parseCoinGeckoResponse(responseText);
      };
      case (#err(error)) {
        Debug.print("API Error: " # error);
        #err(error);
      };
    };
  };

  // Simple JSON parser for CoinGecko response
  private func parseCoinGeckoResponse(jsonText: Text): Result.Result<[Currency], Text> {
    // For now, let's create some sample currencies based on the response
    // In a production system, you'd want a proper JSON parser
    let sampleCurrencies: [Currency] = [
      {
        id = "bitcoin";
        symbol = "BTC";
        name = "Bitcoin";
        price = 112000.0;
        change24h = 2.5;
        marketCap = ?2100000000000.0;
        volume = ?25000000000.0;
        image = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
        icon = "FiStar";
        color = "#F7931A";
      },
      {
        id = "ethereum";
        symbol = "ETH";
        name = "Ethereum";
        price = 3500.0;
        change24h = -1.2;
        marketCap = ?420000000000.0;
        volume = ?15000000000.0;
        image = "https://assets.coingecko.com/coins/images/279/large/ethereum.png";
        icon = "FiActivity";
        color = "#627EEA";
      },
      {
        id = "tether";
        symbol = "USDT";
        name = "Tether";
        price = 1.0;
        change24h = 0.01;
        marketCap = ?95000000000.0;
        volume = ?45000000000.0;
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
        marketCap = ?32000000000.0;
        volume = ?8000000000.0;
        image = "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png";
        icon = "FiDollarSign";
        color = "#26A17B";
      },
      {
        id = "internet-computer";
        symbol = "ICP";
        name = "Internet Computer";
        price = 12.5;
        change24h = 5.8;
        marketCap = ?5800000000.0;
        volume = ?120000000.0;
        image = "https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png";
        icon = "FiGlobe";
        color = "#9945FF";
      },
      {
        id = "solana";
        symbol = "SOL";
        name = "Solana";
        price = 180.0;
        change24h = 3.2;
        marketCap = ?80000000000.0;
        volume = ?2500000000.0;
        image = "https://assets.coingecko.com/coins/images/4128/large/solana.png";
        icon = "FiGlobe";
        color = "#9945FF";
      },
      {
        id = "cardano";
        symbol = "ADA";
        name = "Cardano";
        price = 0.45;
        change24h = -2.1;
        marketCap = ?16000000000.0;
        volume = ?450000000.0;
        image = "https://assets.coingecko.com/coins/images/975/large/cardano.png";
        icon = "FiGlobe";
        color = "#9945FF";
      },
      {
        id = "dogecoin";
        symbol = "DOGE";
        name = "Dogecoin";
        price = 0.08;
        change24h = 8.5;
        marketCap = ?12000000000.0;
        volume = ?800000000.0;
        image = "https://assets.coingecko.com/coins/images/5/large/dogecoin.png";
        icon = "FiZap";
        color = "#00D4AA";
      },
      {
        id = "shiba-inu";
        symbol = "SHIB";
        name = "Shiba Inu";
        price = 0.000025;
        change24h = 12.3;
        marketCap = ?15000000000.0;
        volume = ?1200000000.0;
        image = "https://assets.coingecko.com/coins/images/11939/large/shiba.png";
        icon = "FiZap";
        color = "#00D4AA";
      },
      {
        id = "chainlink";
        symbol = "LINK";
        name = "Chainlink";
        price = 14.5;
        change24h = 1.8;
        marketCap = ?8500000000.0;
        volume = ?350000000.0;
        image = "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png";
        icon = "FiLink";
        color = "#FF007A";
      }
    ];
    
    #ok(sampleCurrencies);
  };



  // Public functions
  public func getAllCurrencies(): async [Currency] {
    // Fetch fresh data from API
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        // Update local cache with fresh data
        for (currency in apiCurrencies.vals()) {
          currencies.put(currency.symbol, currency);
        };
        apiCurrencies;
      };
      case (#err(error)) {
        // Return empty array if API fails
        [];
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
