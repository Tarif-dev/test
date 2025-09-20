# Testnet Configuration

This project is configured to use **Ethereum Sepolia Testnet** for development and testing.

## Testnet Details

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com`
- **Explorer**: https://sepolia.etherscan.io/

## Getting Testnet ETH

To test your wallet, you'll need some testnet ETH. You can get free testnet ETH from these faucets:

1. **Sepolia Faucet**: https://sepoliafaucet.com/
2. **Alchemy Faucet**: https://sepoliafaucet.net/
3. **Infura Faucet**: https://www.infura.io/faucet/sepolia
4. **Coinbase Faucet**: https://coinbase.com/faucets/ethereum-sepolia-faucet

## Testnet Tokens

The application is configured to detect these testnet tokens:

- **USDC (Testnet)**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **WETH (Testnet)**: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`
- **LINK (Testnet)**: `0x779877A7B0D9E8603169DdbD7836e478b4624789`
- **WBTC (Testnet)**: `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`
- **USDT (Testnet)**: `0x2e234DAe75C793f67A35089C9d99245E1C58470b`

## Getting Testnet Tokens

You can get testnet tokens from:

1. **Uniswap Sepolia**: https://app.uniswap.org/ (switch to Sepolia network)
2. **OpenZeppelin Contracts Wizard**: Deploy your own test tokens
3. **Aave Faucet**: https://staging.aave.com/faucet/ (for AAVE testnet tokens)

## Environment Configuration

Make sure your `.env` file uses the testnet RPC:

```bash
ETHEREUM_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
```

Alternative RPC endpoints:

- Infura: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`

## MetaMask Configuration

To add Sepolia testnet to MetaMask:

1. Open MetaMask
2. Click Networks dropdown
3. Click "Add Network"
4. Enter these details:
   - **Network Name**: Sepolia Test Network
   - **New RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: `https://sepolia.etherscan.io`

## Testing Your Wallet

1. Get your wallet address from the dashboard
2. Get some testnet ETH from a faucet
3. Get some testnet tokens from Uniswap or other sources
4. Refresh your portfolio to see the tokens appear

## Switching to Mainnet

To switch to mainnet for production:

1. Update `ETHEREUM_RPC_URL` to a mainnet RPC
2. Update token addresses in `apps/backend/services/tokens.ts`
3. Remove the "Testnet" labels from the UI
4. Use real price APIs instead of mock prices

⚠️ **Warning**: Never use mainnet for development/testing as it involves real money!
