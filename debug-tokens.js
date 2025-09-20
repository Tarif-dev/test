import { ethers } from "ethers";

// Debug script to test token fetching
async function debugTokenBalance() {
  try {
    console.log("🔍 Starting token balance debug...");

    // Use Sepolia testnet
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com"
    );

    // Test wallet address - replace with your actual address from the database
    const testAddress = "0xYOUR_WALLET_ADDRESS_HERE"; // Replace this with your actual address

    console.log(`📍 Testing address: ${testAddress}`);

    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Check ETH balance
    const ethBalance = await provider.getBalance(testAddress);
    console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    // USDC contract on Sepolia
    const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const erc20ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)",
    ];

    console.log(`🪙 Checking USDC contract: ${usdcAddress}`);

    const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, provider);

    try {
      // Get contract info
      const [name, symbol, decimals] = await Promise.all([
        usdcContract.name(),
        usdcContract.symbol(),
        usdcContract.decimals(),
      ]);

      console.log(`📜 Token: ${name} (${symbol}), Decimals: ${decimals}`);

      // Get balance
      const balance = await usdcContract.balanceOf(testAddress);
      const balanceFormatted = ethers.formatUnits(balance, decimals);

      console.log(`💵 USDC Balance: ${balanceFormatted} ${symbol}`);
      console.log(`🔢 Raw Balance: ${balance.toString()}`);

      if (balance > 0) {
        console.log(
          "✅ Token balance found! The issue might be in the UI or MetaMask display."
        );
      } else {
        console.log(
          "❌ No token balance found. Check if the transaction was successful."
        );
      }
    } catch (contractError) {
      console.error("❌ Error calling contract functions:", contractError);
      console.log(
        "This might indicate the contract address is wrong or the RPC is having issues."
      );
    }
  } catch (error) {
    console.error("❌ Debug script error:", error);
  }
}

// Run the debug function
console.log("🚀 Token Balance Debug Script");
console.log("==============================");
debugTokenBalance();
