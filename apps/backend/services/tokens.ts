import { ethers } from "ethers";
import axios from "axios";

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  logoURI?: string;
  priceUSD?: number;
  valueUSD?: number;
}

export interface PortfolioSummary {
  totalValueUSD: number;
  tokens: TokenInfo[];
  ethBalance: string;
  ethBalanceFormatted: string;
  ethValueUSD?: number;
}

// Standard ERC-20 ABI for getting token info
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

// Popular ERC-20 tokens on Ethereum Sepolia testnet
const POPULAR_TOKENS = [
  {
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
    symbol: "USDC",
    name: "USD Coin (Testnet)",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441e21A97e78b6F4d5bBE7aD7B0e57/logo.png",
  },
  {
    address: "0xfa585a0e15255b5fda9ed653489b8587869a1d40", // Your custom token
    symbol: "CUSTOM",
    name: "Custom Token",
    decimals: 18,
    logoURI: undefined,
  },
  {
    address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // WETH on Sepolia
    symbol: "WETH",
    name: "Wrapped Ether (Testnet)",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // LINK on Sepolia
    symbol: "LINK",
    name: "ChainLink Token (Testnet)",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png",
  },
  {
    address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WBTC on Sepolia
    symbol: "WBTC",
    name: "Wrapped BTC (Testnet)",
    decimals: 8,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  },
  {
    address: "0x2e234DAe75C793f67A35089C9d99245E1C58470b", // USDT on Sepolia (example testnet address)
    symbol: "USDT",
    name: "Tether USD (Testnet)",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  },
];

export class TokenService {
  private provider: ethers.Provider;

  constructor() {
    // Initialize with Sepolia testnet RPC endpoint
    const rpcUrl =
      process.env.ETHEREUM_RPC_URL ||
      "https://ethereum-sepolia-rpc.publicnode.com";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Get ETH balance for an address
   */
  async getETHBalance(
    address: string
  ): Promise<{ balance: string; balanceFormatted: string }> {
    try {
      const balance = await this.provider.getBalance(address);
      const balanceFormatted = ethers.formatEther(balance);

      return {
        balance: balance.toString(),
        balanceFormatted,
      };
    } catch (error) {
      console.error("Error getting ETH balance:", error);
      throw new Error("Failed to get ETH balance");
    }
  }

  /**
   * Get token balance for a specific ERC-20 token
   */
  async getTokenBalance(
    tokenAddress: string,
    userAddress: string
  ): Promise<TokenInfo | null> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.provider
      );

      // Get token info
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name() as Promise<string>,
        contract.symbol() as Promise<string>,
        contract.decimals() as Promise<number>,
        contract.balanceOf(userAddress) as Promise<bigint>,
      ]);

      console.log(
        `🔍 Token ${symbol} (${tokenAddress}): balance = ${balance.toString()}`
      );

      // Check if user has a balance (keep tokens with zero balance for debugging)
      // if (balance === 0n) {
      //   return null;
      // }

      const balanceFormatted = ethers.formatUnits(balance, decimals);

      // Find logo URI from popular tokens list
      const popularToken = POPULAR_TOKENS.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      );

      return {
        address: tokenAddress,
        symbol,
        name,
        decimals: Number(decimals),
        balance: balance.toString(),
        balanceFormatted,
        logoURI: popularToken?.logoURI,
      };
    } catch (error) {
      console.error(`Error getting token balance for ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Get all token balances for popular tokens
   */
  async getTokenBalances(userAddress: string): Promise<TokenInfo[]> {
    try {
      const tokens: TokenInfo[] = [];

      console.log(`🔍 Checking token balances for address: ${userAddress}`);

      // Check balances for popular tokens in parallel
      const balancePromises = POPULAR_TOKENS.map((token) =>
        this.getTokenBalance(token.address, userAddress)
      );

      const results = await Promise.allSettled(balancePromises);

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          console.log(
            `✅ Found token: ${result.value.symbol} - ${result.value.balanceFormatted}`
          );
          tokens.push(result.value);
        } else if (result.status === "fulfilled" && !result.value) {
          console.log(
            `❌ No balance for: ${POPULAR_TOKENS[index]?.symbol || "Unknown"}`
          );
        } else if (result.status === "rejected") {
          console.log(
            `⚠️ Error checking: ${POPULAR_TOKENS[index]?.symbol || "Unknown"}`,
            result.reason
          );
        }
      });

      console.log(`📊 Total tokens found: ${tokens.length}`);
      return tokens;
    } catch (error) {
      console.error("Error getting token balances:", error);
      throw new Error("Failed to get token balances");
    }
  }

  /**
   * Check balance for a specific token address (useful for custom tokens)
   */
  async getCustomTokenBalance(
    tokenAddress: string,
    userAddress: string
  ): Promise<TokenInfo | null> {
    return this.getTokenBalance(tokenAddress, userAddress);
  }

  /**
   * Get token prices from CoinGecko API
   */
  async getTokenPrices(
    tokenAddresses: string[]
  ): Promise<Record<string, number>> {
    try {
      // Map testnet token addresses to their mainnet CoinGecko IDs
      const tokenToCoinGeckoId: Record<string, string> = {
        ethereum: "ethereum", // ETH
        "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238": "usd-coin", // USDC (Testnet maps to real USDC)
        "0x779877a7b0d9e8603169ddbd7836e478b4624789": "chainlink", // LINK (Testnet maps to real LINK)
        "0x7169d38820dfd117c3fa1f22a697dba58d90ba06": "ethereum", // WETH (maps to ETH)
        "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": "wrapped-bitcoin", // WBTC (Testnet maps to real WBTC)
        "0x2e234dae75c793f67a35089c9d99245e1c58470b": "tether", // USDT (Testnet maps to real USDT)
      };

      // Get unique CoinGecko IDs
      const coinGeckoIds = new Set<string>();

      // Always include ETH
      coinGeckoIds.add("ethereum");

      // Add CoinGecko IDs for tokens that have mappings
      tokenAddresses.forEach((address) => {
        const coinGeckoId = tokenToCoinGeckoId[address.toLowerCase()];
        if (coinGeckoId) {
          coinGeckoIds.add(coinGeckoId);
          console.log(`📍 Token ${address} -> CoinGecko ID: ${coinGeckoId}`);
        } else {
          console.log(`❌ No CoinGecko mapping for token: ${address}`);
        }
      });

      // If no valid tokens, just return ETH price
      if (coinGeckoIds.size === 0) {
        coinGeckoIds.add("ethereum");
      }

      const ids = Array.from(coinGeckoIds).join(",");

      console.log(`🔍 Fetching prices for: ${ids}`);

      // Fetch prices from CoinGecko API
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            Accept: "application/json",
          },
        }
      );

      const priceData = response.data;
      console.log(`✅ CoinGecko response:`, priceData);

      // Map back to token addresses
      const prices: Record<string, number> = {};

      // Always set ETH price
      if (priceData.ethereum?.usd) {
        prices["ethereum"] = priceData.ethereum.usd;
      }

      // Map token addresses to their prices
      tokenAddresses.forEach((address) => {
        const coinGeckoId = tokenToCoinGeckoId[address.toLowerCase()];
        if (coinGeckoId && priceData[coinGeckoId]?.usd) {
          prices[address.toLowerCase()] = priceData[coinGeckoId].usd;
          console.log(
            `✅ Mapped ${address} (${coinGeckoId}) -> $${priceData[coinGeckoId].usd}`
          );
        }
      });

      // Add fallback prices for custom tokens or tokens without CoinGecko mapping
      tokenAddresses.forEach((address) => {
        if (!prices[address.toLowerCase()]) {
          // Custom token - use a default price of $1 or $0 for demo
          if (
            address.toLowerCase() ===
            "0xfa585a0e15255b5fda9ed653489b8587869a1d40"
          ) {
            prices[address.toLowerCase()] = 10.0; // Custom token mock price
            console.log(`🔧 Custom token ${address} -> $10.00`);
          } else {
            prices[address.toLowerCase()] = 0; // Unknown tokens get $0
            console.log(`⚠️ No price found for ${address}, using $0`);
          }
        }
      });

      console.log(`💰 Final price mapping:`, prices);
      return prices;
    } catch (error) {
      console.error("Error fetching prices from CoinGecko:", error);

      // Fallback to mock prices if CoinGecko fails
      console.log("🔄 Falling back to mock prices");
      const mockPrices: Record<string, number> = {
        ethereum: 2500, // ETH price
        "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238": 1.0, // USDC (Testnet)
        "0xfa585a0e15255b5fda9ed653489b8587869a1d40": 10.0, // Your custom token (mock price)
        "0x7169d38820dfd117c3fa1f22a697dba58d90ba06": 2500, // WETH (Testnet)
        "0x779877a7b0d9e8603169ddbd7836e478b4624789": 15.2, // LINK (Testnet)
        "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": 45000, // WBTC (Testnet)
        "0x2e234dae75c793f67a35089c9d99245e1c58470b": 1.0, // USDT (Testnet)
      };

      return mockPrices;
    }
  }

  /**
   * Get complete portfolio for a user address
   */
  async getPortfolio(userAddress: string): Promise<PortfolioSummary> {
    try {
      // Get ETH balance
      const ethBalance = await this.getETHBalance(userAddress);

      // Get token balances
      const tokens = await this.getTokenBalances(userAddress);

      // Get all relevant token addresses for price fetching
      const tokenAddresses = tokens.map((token) => token.address);
      const prices = await this.getTokenPrices(tokenAddresses);

      // Calculate USD values
      let totalValueUSD = 0;

      // Add ETH value
      const ethPrice = prices["ethereum"] || 0;
      const ethValueUSD = parseFloat(ethBalance.balanceFormatted) * ethPrice;
      totalValueUSD += ethValueUSD;

      // Add token values and update token info
      const tokensWithPrices = tokens.map((token) => {
        const price = prices[token.address.toLowerCase()] || 0;
        const valueUSD = parseFloat(token.balanceFormatted) * price;
        totalValueUSD += valueUSD;

        return {
          ...token,
          priceUSD: price,
          valueUSD,
        };
      });

      return {
        totalValueUSD,
        tokens: tokensWithPrices,
        ethBalance: ethBalance.balance,
        ethBalanceFormatted: ethBalance.balanceFormatted,
        ethValueUSD,
      };
    } catch (error) {
      console.error("Error getting portfolio:", error);
      throw new Error("Failed to get portfolio data");
    }
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}
