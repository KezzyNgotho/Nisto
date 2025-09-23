# 🔧 API Testing Guide for Nisto

## 🚀 How to Test APIs

### **Step 1: Access the API Tester**
1. Start your development server: `npm start`
2. Go to: `http://localhost:3000/api-test`
3. You'll see the API Testing Dashboard

### **Step 2: Test Each API Individually**

#### **✅ CoinGecko API (FREE - No Key Required)**
- **What it does**: Gets cryptocurrency prices and market data
- **Rate limit**: 50 calls/minute
- **Click "Test API"** to test it
- **Expected result**: Should return Bitcoin, Ethereum, and other crypto prices

#### **✅ ExchangeRate-API (FREE - No Key Required)**
- **What it does**: Gets fiat currency exchange rates (USD, KES, EUR, etc.)
- **Rate limit**: 1000 calls/month
- **Click "Test API"** to test it
- **Expected result**: Should return KES exchange rate

#### **✅ Binance API (FREE - No Key Required)**
- **What it does**: Gets real-time trading data
- **Rate limit**: 1200 calls/minute
- **Click "Test API"** to test it
- **Expected result**: Should return BTC/USDT price

#### **✅ Custom NST Oracle (Mock)**
- **What it does**: Gets Nisto token price (currently mock data)
- **Rate limit**: Unlimited
- **Click "Test API"** to test it
- **Expected result**: Should return mock NST price

### **Step 3: Test All APIs at Once**
- Click **"Test All APIs"** button
- Watch as each API is tested individually
- See the results for each one

## 📊 Understanding the Results

### **✅ Success (Green)**
- API is working correctly
- Data is being fetched successfully
- You can see the actual data returned

### **❌ Failed (Red)**
- API is not working
- Check the error message
- May be due to network issues or API changes

## 🔧 Troubleshooting

### **If CoinGecko Fails:**
- Check your internet connection
- Try again in a few minutes
- CoinGecko may be temporarily down

### **If ExchangeRate Fails:**
- Check your internet connection
- Try again later
- Free tier may have hit limit

### **If Binance Fails:**
- Check your internet connection
- Binance may be blocking requests
- Try using a VPN if needed

### **If All APIs Fail:**
- Check your internet connection
- Check browser console for errors
- Try refreshing the page

## 🎯 What to Do Next

### **If All APIs Work:**
✅ **Great!** Your swap module will work with real data
- Proceed to backend development
- All market data will be live

### **If Some APIs Fail:**
⚠️ **Partial Success** - The app will still work
- Working APIs will provide real data
- Failed APIs will use fallback mock data
- You can still proceed to backend

### **If All APIs Fail:**
❌ **Need to Fix** - Check your setup
- Verify internet connection
- Check if you're behind a firewall
- Try using a different network

## 🚀 Next Steps

Once APIs are working:
1. **Test the Swap Module** - Go to `/dashboard` and try the swap feature
2. **Check Real-time Updates** - Prices should update every 30 seconds
3. **Proceed to Backend** - Start building the backend services

## 📞 Need Help?

If you're having issues:
1. Check the browser console for errors
2. Try testing each API individually
3. Check your internet connection
4. Try refreshing the page

---

**Remember**: All these APIs are FREE and don't require API keys! 🎉
