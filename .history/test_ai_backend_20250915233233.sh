#!/bin/bash

# Test AI SmartWallet Backend Functionality

echo "🧠 Testing AI SmartWallet Backend..."

# Test 1: Save AI User Preferences
echo "📝 Test 1: Saving AI User Preferences..."
/home/kezzy/.local/share/dfx/bin/dfx canister call Nisto_backend saveAIUserPreferences '("test_user_123", record {
  thresholdPercentage = 15;
  timeWindowMinutes = 30;
  stablecoinPreference = "USDC";
  autoHedgingEnabled = true;
  allocationLimit = 50;
  intermediaryTokenPreference = opt "USDC";
  preferredSwapProvider = opt "auto"
})'

echo ""

# Test 2: Get AI User Preferences
echo "📖 Test 2: Getting AI User Preferences..."
dfx canister call Nisto_backend getAIUserPreferences '("test_user_123")'

echo ""

# Test 3: Test Portfolio Analysis
echo "🔍 Test 3: Testing AI Portfolio Analysis..."
dfx canister call Nisto_backend analyzePortfolioAndSwap '("test_user_123", vec {
  record {
    symbol = "BTC";
    amount = 0.1;
    value = 4500.0;
    percentage = 60.0;
    change24h = -8.5;
    riskLevel = "high"
  };
  record {
    symbol = "ETH";
    amount = 2.0;
    value = 3000.0;
    percentage = 40.0;
    change24h = -5.2;
    riskLevel = "medium"
  }
}, vec {
  record {
    id = "bitcoin";
    symbol = "BTC";
    name = "Bitcoin";
    price = 45000.0;
    change24h = -8.5;
    marketCap = opt 850000000000.0;
    volume = opt 25000000000.0;
    image = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
    icon = "FiCircle";
    color = "#F7931A"
  };
  record {
    id = "ethereum";
    symbol = "ETH";
    name = "Ethereum";
    price = 3000.0;
    change24h = -5.2;
    marketCap = opt 360000000000.0;
    volume = opt 15000000000.0;
    image = "https://assets.coingecko.com/coins/images/279/large/ethereum.png";
    icon = "FiCircle";
    color = "#627EEA"
  }
})'

echo ""

# Test 4: Add AI Swap Record
echo "📊 Test 4: Adding AI Swap Record..."
dfx canister call Nisto_backend addAISwapRecord '("test_user_123", "BTC", "USDC", 0.05, 45000.0, "AI detected high volatility, hedging position", "completed", null, vec {"BTC -> USDC"}, 0, null, opt 0.001, "auto_hedge", "auto")'

echo ""

# Test 5: Get AI Swap History
echo "📈 Test 5: Getting AI Swap History..."
dfx canister call Nisto_backend getAISwapHistory '("test_user_123")'

echo ""

# Test 6: Get All AI User IDs
echo "👥 Test 6: Getting All AI User IDs..."
dfx canister call Nisto_backend getAllAIUserIds

echo ""
echo "✅ AI SmartWallet Backend Testing Complete!"
