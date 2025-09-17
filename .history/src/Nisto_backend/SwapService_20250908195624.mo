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
  
  private transient let swapHistory = HashMap.HashMap<Text, SwapHistory>(100, Text.equal, Text.hash);
  private transient let userSwapHistory = HashMap.HashMap<Principal, [Text]>(100, Principal.equal, Principal.hash);
  
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

  // Production JSON parser for CoinGecko response
  private func parseCoinGeckoResponse(jsonText: Text): Result.Result<[Currency], Text> {
    let currencies = Buffer.Buffer<Currency>(0);
    
    // Parse JSON array of currency objects
    var json = jsonText;
    
    // Remove outer brackets and split by objects
    if (Text.startsWith(json, #text "[")) {
      json := Text.trimStart(json, #text "[");
    };
    if (Text.endsWith(json, #text "]")) {
      json := Text.trimEnd(json, #text "]");
    };
    
    // Split by objects (look for }{ pattern)
    let objects = Text.split(json, #text "},{");
    let objectsArray = Iter.toArray(objects);
    
    for (obj in objectsArray.vals()) {
      var cleanObj = obj;
      
      // Clean up object boundaries
      if (Text.startsWith(cleanObj, #text "{")) {
        cleanObj := Text.trimStart(cleanObj, #text "{");
      };
      if (Text.endsWith(cleanObj, #text "}")) {
        cleanObj := Text.trimEnd(cleanObj, #text "}");
      };
      
      // Parse individual currency object
      let currency = parseCurrencyObject(cleanObj);
      currencies.add(currency);
    };
    
    #ok(Buffer.toArray(currencies));
  };

  // Parse individual currency object from JSON
  private func parseCurrencyObject(objText: Text): Currency {
    let id = extractStringField(objText, "id");
    let symbol = extractStringField(objText, "symbol");
    let name = extractStringField(objText, "name");
    let price = extractFloatField(objText, "current_price");
    let change24h = extractFloatField(objText, "price_change_percentage_24h");
    let marketCap = extractOptionalFloatField(objText, "market_cap");
    let volume = extractOptionalFloatField(objText, "total_volume");
    let image = extractStringField(objText, "image");
    
    // Generate icon and color based on currency characteristics
    let icon = generateIcon(symbol, name);
    let color = generateColor(symbol, name);
    
    {
      id = id;
      symbol = Text.toUppercase(symbol);
      name = name;
      price = price;
      change24h = change24h;
      marketCap = marketCap;
      volume = volume;
      image = image;
      icon = icon;
      color = color;
    };
  };

  // Extract string field from JSON object
  private func extractStringField(objText: Text, fieldName: Text): Text {
    let pattern = "\"" # fieldName # "\":\"";
    switch (findPattern(objText, pattern)) {
      case null { "" };
      case (?start) {
        let startPos = start + Text.size(pattern);
        let remaining = Text.slice(objText, startPos, Text.size(objText));
        switch (findPattern(remaining, "\"")) {
          case null { "" };
          case (?end) {
            Text.slice(remaining, 0, end);
          };
        };
      };
    };
  };

  // Extract float field from JSON object
  private func extractFloatField(objText: Text, fieldName: Text): Float {
    let pattern = "\"" # fieldName # "\":";
    let findIter = Text.find(objText, #text pattern);
    switch (findIter.next()) {
      case null { 0.0 };
      case (?start) {
        let startPos = start + Text.size(pattern);
        let remaining = Text.slice(objText, startPos, Text.size(objText));
        let commaIter = Text.find(remaining, #text ",");
        switch (commaIter.next()) {
          case null {
            // Last field, look for closing brace
            let braceIter = Text.find(remaining, #text "}");
            switch (braceIter.next()) {
              case null { 0.0 };
              case (?end) {
                let valueText = Text.slice(remaining, 0, end);
                parseFloat(valueText);
              };
            };
          };
          case (?end) {
            let valueText = Text.slice(remaining, 0, end);
            parseFloat(valueText);
          };
        };
      };
    };
  };

  // Extract optional float field from JSON object
  private func extractOptionalFloatField(objText: Text, fieldName: Text): ?Float {
    let pattern = "\"" # fieldName # "\":";
    let findIter = Text.find(objText, #text pattern);
    switch (findIter.next()) {
      case null { null };
      case (?start) {
        let startPos = start + Text.size(pattern);
        let remaining = Text.slice(objText, startPos, Text.size(objText));
        let commaIter = Text.find(remaining, #text ",");
        switch (commaIter.next()) {
          case null {
            // Last field, look for closing brace
            let braceIter = Text.find(remaining, #text "}");
            switch (braceIter.next()) {
              case null { null };
              case (?end) {
                let valueText = Text.slice(remaining, 0, end);
                if (valueText == "null") {
                  null;
                } else {
                  ?parseFloat(valueText);
                };
              };
            };
          };
          case (?end) {
            let valueText = Text.slice(remaining, 0, end);
            if (valueText == "null") {
              null;
            } else {
              ?parseFloat(valueText);
            };
          };
        };
      };
    };
  };

  // Parse float from text
  private func parseFloat(text: Text): Float {
    // Simple float parser - handles basic decimal numbers
    let cleanText = Text.trim(text, #char ' ');
    if (cleanText == "null" or cleanText == "") {
      return 0.0;
    };
    
    // Convert to float using Nat parsing and division
    // This is a simplified parser - in production you'd want a more robust one
    let parts = Text.split(cleanText, #text ".");
    let partsArray = Iter.toArray(parts);
    
    if (partsArray.size() == 1) {
      // Integer
      switch (Nat.fromText(cleanText)) {
        case null { 0.0 };
        case (?n) { Float.fromInt(n) };
      };
    } else if (partsArray.size() == 2) {
      // Decimal
      let integerPart = partsArray[0];
      let decimalPart = partsArray[1];
      switch (Nat.fromText(integerPart), Nat.fromText(decimalPart)) {
        case (?intPart, ?decPart) {
          let divisor = Float.fromInt(10 ** Text.size(decimalPart));
          Float.fromInt(intPart) + (Float.fromInt(decPart) / divisor);
        };
        case (_, _) { 0.0 };
      };
    } else {
      0.0;
    };
  };

  // Generate icon based on currency characteristics
  private func generateIcon(symbol: Text, name: Text): Text {
    let lowerSymbol = Text.toLowercase(symbol);
    let lowerName = Text.toLowercase(name);
    
    // Stable coins
    if (Text.contains(lowerSymbol, #text "usd") or Text.contains(lowerSymbol, #text "dai") or Text.contains(lowerSymbol, #text "busd")) {
      return "FiDollarSign";
    };
    // Bitcoin variants
    if (Text.contains(lowerSymbol, #text "btc") or Text.contains(lowerName, #text "bitcoin")) {
      return "FiStar";
    };
    // Ethereum variants
    if (Text.contains(lowerSymbol, #text "eth") or Text.contains(lowerName, #text "ethereum")) {
      return "FiActivity";
    };
    // Meme coins
    if (Text.contains(lowerName, #text "dog") or Text.contains(lowerName, #text "cat") or Text.contains(lowerName, #text "moon") or 
        Text.contains(lowerName, #text "safe") or Text.contains(lowerName, #text "baby") or Text.contains(lowerName, #text "floki") or
        Text.contains(lowerName, #text "pepe") or Text.contains(lowerName, #text "shib") or Text.contains(lowerName, #text "bonk")) {
      return "FiZap";
    };
    // DeFi tokens
    if (Text.contains(lowerName, #text "swap") or Text.contains(lowerName, #text "dex") or Text.contains(lowerName, #text "uni") or
        Text.contains(lowerName, #text "pancake") or Text.contains(lowerName, #text "sushi")) {
      return "FiTarget";
    };
    // Layer 1 blockchains
    if (Text.contains(lowerName, #text "chain") or Text.contains(lowerName, #text "network") or Text.contains(lowerSymbol, #text "dot") or
        Text.contains(lowerSymbol, #text "ada") or Text.contains(lowerSymbol, #text "sol") or Text.contains(lowerSymbol, #text "avax")) {
      return "FiGlobe";
    };
    // Default
    return "FiCircle";
  };

  // Generate color based on currency characteristics
  private func generateColor(symbol: Text, name: Text): Text {
    let lowerSymbol = Text.toLowercase(symbol);
    let lowerName = Text.toLowercase(name);
    
    // Stable coins - Green
    if (Text.contains(lowerSymbol, #text "usd") or Text.contains(lowerSymbol, #text "dai") or Text.contains(lowerSymbol, #text "busd")) {
      return "#26A17B";
    };
    // Bitcoin variants - Orange
    if (Text.contains(lowerSymbol, #text "btc") or Text.contains(lowerName, #text "bitcoin")) {
      return "#F7931A";
    };
    // Ethereum variants - Blue
    if (Text.contains(lowerSymbol, #text "eth") or Text.contains(lowerName, #text "ethereum")) {
      return "#627EEA";
    };
    // Meme coins - Bright colors
    if (Text.contains(lowerName, #text "dog") or Text.contains(lowerName, #text "cat") or Text.contains(lowerName, #text "moon") or 
        Text.contains(lowerName, #text "safe") or Text.contains(lowerName, #text "baby") or Text.contains(lowerName, #text "floki") or
        Text.contains(lowerName, #text "pepe") or Text.contains(lowerName, #text "shib") or Text.contains(lowerName, #text "bonk")) {
      return "#00D4AA";
    };
    // DeFi tokens - Purple
    if (Text.contains(lowerName, #text "swap") or Text.contains(lowerName, #text "dex") or Text.contains(lowerName, #text "uni") or
        Text.contains(lowerName, #text "pancake") or Text.contains(lowerName, #text "sushi")) {
      return "#FF007A";
    };
    // Layer 1 blockchains - Blue
    if (Text.contains(lowerName, #text "chain") or Text.contains(lowerName, #text "network") or Text.contains(lowerSymbol, #text "dot") or
        Text.contains(lowerSymbol, #text "ada") or Text.contains(lowerSymbol, #text "sol") or Text.contains(lowerSymbol, #text "avax")) {
      return "#9945FF";
    };
    // Default
    return "#666666";
  };



  // Public functions
  public func getAllCurrencies(): async [Currency] {
    // Fetch fresh data from API - no caching, no fallbacks
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        apiCurrencies;
      };
      case (#err(error)) {
        // Return empty array if API fails - no fallback data
        [];
      };
    };
  };

  public func searchCurrencies(searchQuery: Text): async [Currency] {
    // For now, return all currencies and let frontend filter
    // In production, you'd implement server-side search
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        apiCurrencies;
      };
      case (#err(error)) {
        [];
      };
    };
  };

  public func calculateExchangeRate(fromCurrency: Text, toCurrency: Text): async Float {
    // Get fresh data from API and calculate real exchange rates
    switch (await fetchCryptocurrencies()) {
      case (#ok(apiCurrencies)) {
        // Find the currencies in the API data
        let fromCurrencyData = Array.find<Currency>(apiCurrencies, func(c) { c.symbol == fromCurrency });
        let toCurrencyData = Array.find<Currency>(apiCurrencies, func(c) { c.symbol == toCurrency });
        
        switch (fromCurrencyData, toCurrencyData) {
          case (?from, ?to) {
            // Calculate exchange rate: fromCurrency price / toCurrency price
            if (to.price > 0.0) {
              from.price / to.price;
            } else {
              0.0; // Return 0 if invalid price
            };
          };
          case (_, _) {
            // Return 0 if currencies not found in API
            0.0;
          };
        };
      };
      case (#err(error)) {
        // Return 0 if API fails - no fallback data
        0.0;
      };
    };
  };

  public query func getStats(): async {
    totalCurrencies: Nat;
    totalSwaps: Nat;
    totalUsers: Nat;
  } {
    {
      totalCurrencies = 0; // No local cache, always fetch from API
      totalSwaps = swapHistory.size();
      totalUsers = userSwapHistory.size();
    };
  };
}
