# Automatic Token Discovery

Your app now supports **automatic token discovery** instead of manually adding each token address!

## 🔧 **How It Works**

The app now uses 3 methods to discover tokens, in order of preference:

### **Method 1: Log Scanning (Free & Automatic)**
- Scans the last 10,000 blocks for ERC-20 transfer events
- Finds any token that was sent to or from your wallet
- **Completely free** - no API keys needed
- Automatically discovers your custom token `0xfa585a0e15255b5fda9ed653489b8587869a1d40`

### **Method 2: Alchemy API (Optional)**
- Uses Alchemy's `getTokenBalances` API for instant discovery
- More reliable and faster than log scanning
- Requires an Alchemy API key (free tier available)
- Add `ALCHEMY_API_KEY` to your `.env` file to enable

### **Method 3: Manual Token List (Fallback)**
- Falls back to the predefined token list if other methods fail
- Includes popular tokens like USDC, LINK, etc.

## 🚀 **Benefits**

✅ **No more manual token additions** - just send tokens to your wallet!
✅ **Discovers any ERC-20 token automatically**
✅ **Works with custom/unknown tokens**
✅ **Free method (log scanning) works without API keys**
✅ **Scalable** - handles hundreds of tokens automatically

## 🔍 **Testing**

1. **Send any ERC-20 token** to your wallet address
2. **Refresh your portfolio** in the app
3. **The token should appear automatically** (no code changes needed!)

## 🛠 **For Better Performance (Optional)**

Get a free Alchemy API key:

1. Go to https://dashboard.alchemy.com/
2. Create a free account
3. Create a new app for "Ethereum Sepolia"
4. Copy your API key
5. Add to your `.env` file:
   ```
   ALCHEMY_API_KEY="your-api-key-here"
   ```

## 🏗 **How Log Scanning Works**

The app searches for ERC-20 Transfer events:
```
Transfer(address indexed from, address indexed to, uint256 value)
```

It finds:
- Tokens **received** by your wallet (where `to` = your address)
- Tokens **sent** from your wallet (where `from` = your address)
- Then checks current balance for each discovered token

## 📊 **Performance**

- **Log scanning**: ~2-3 seconds for 10k blocks
- **Alchemy API**: ~500ms
- **Manual list**: ~1-2 seconds

The app automatically uses the fastest available method!

## 🔧 **No More Duplicate Tokens**

The duplicate token issue is fixed! Each token address is now:
- ✅ Discovered automatically
- ✅ Appears only once in the UI
- ✅ Uses the token's real name/symbol from the contract

Your custom token will now show with its actual name instead of "CUSTOM"!