# Token Not Showing Up - Debugging Guide

## Step 1: Get Your Wallet Address

1. **Start your backend**: `cd apps/backend && bun dev`
2. **Start your frontend**: `cd apps/web && npm run dev`
3. **Login to your app**
4. **Copy your wallet address** from the dashboard

## Step 2: Check Transaction Status

1. Go to **Sepolia Etherscan**: https://sepolia.etherscan.io
2. **Search for your wallet address**
3. **Check if the USDC transfer transaction exists and was successful**
4. Look for transactions to/from your address

## Step 3: Add Tokens to MetaMask Manually

MetaMask doesn't automatically show all tokens. You need to add them manually:

### Add USDC to MetaMask:

1. **Open MetaMask**
2. **Make sure you're on Sepolia Testnet**
3. **Click "Import tokens"** (at the bottom)
4. **Select "Custom token"**
5. **Enter these details**:
   - **Token contract address**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
   - **Token symbol**: `USDC`
   - **Token decimal**: `6`
6. **Click "Add Custom Token"**
7. **Click "Import Tokens"**

### Add other testnet tokens:

- **WETH**: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`
- **LINK**: `0x779877A7B0D9E8603169DdbD7836e478b4624789`

## Step 4: Check Your Network

Make sure MetaMask is connected to **Sepolia Testnet**:

1. **Click the network dropdown** in MetaMask
2. **Select "Sepolia test network"**
3. If you don't see it, add it manually:
   - **Network name**: Sepolia Test Network
   - **New RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com`
   - **Chain ID**: `11155111`
   - **Currency symbol**: `ETH`
   - **Block explorer**: `https://sepolia.etherscan.io`

## Step 5: Debug with Browser Console

1. **Open your app in the browser**
2. **Open browser developer tools** (F12)
3. **Go to Console tab**
4. **Run this command** to check your address:
   ```javascript
   fetch("/debug/user/address", {
     headers: {
       Authorization: "Bearer " + localStorage.getItem("authToken"),
     },
   })
     .then((r) => r.json())
     .then(console.log);
   ```

## Step 6: Manual Token Balance Check

Replace `YOUR_ADDRESS` with your actual wallet address and run this script:

```bash
cd /Applications/Blockchain/Ethereum/tiplink-temp-mono
node debug-tokens.js
```

Don't forget to update the address in the script first!

## Common Issues & Solutions:

### 1. "Token not showing in MetaMask"

- **Solution**: Add the token manually (Step 3)

### 2. "Wrong network"

- **Solution**: Switch to Sepolia testnet (Step 4)

### 3. "Transaction failed"

- **Solution**: Check on Sepolia Etherscan (Step 2)

### 4. "No testnet ETH"

- **Solution**: Get testnet ETH from a faucet first

### 5. "UI shows 0 balance but MetaMask shows tokens"

- **Solution**: There might be a bug in the backend token fetching

## Quick Faucet Links:

- **ETH Faucet**: https://sepoliafaucet.com/
- **Alternative ETH**: https://www.infura.io/faucet/sepolia

## Need Help?

If none of these steps work, check:

1. **Browser console for errors**
2. **Backend logs for errors**
3. **Sepolia Etherscan for your address**
4. **Make sure you sent tokens to the RIGHT address**

The most common issue is that MetaMask doesn't automatically detect tokens - you need to add them manually!
