const { ethers } = require("ethers");

async function checkPYUSDBalance() {
  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-rpc.publicnode.com"
    );

    // PYUSD contract details
    const PYUSD_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
    const USER_ADDRESS = "0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711";

    // ERC20 ABI for balance checking
    const ERC20_ABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)",
    ];

    console.log("🔍 Checking PYUSD balance...");
    console.log(`📍 User Address: ${USER_ADDRESS}`);
    console.log(`💰 PYUSD Contract: ${PYUSD_ADDRESS}`);
    console.log(`🌐 RPC: https://ethereum-rpc.publicnode.com`);
    console.log("");

    // Create contract instance
    const contract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, provider);

    // Get token info and balance
    const [name, symbol, decimals, balance] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(USER_ADDRESS),
    ]);

    const balanceFormatted = ethers.formatUnits(balance, decimals);

    console.log("✅ PYUSD Token Information:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log("");
    console.log("💰 Balance Results:");
    console.log(`   Raw Balance: ${balance.toString()} (smallest units)`);
    console.log(`   Formatted Balance: ${balanceFormatted} ${symbol}`);
    console.log("");

    if (balance > 0n) {
      console.log("🎉 USER HAS PYUSD BALANCE!");
      console.log(`💵 Amount: ${balanceFormatted} PYUSD`);
    } else {
      console.log("❌ No PYUSD balance found");
      console.log("🤔 This could mean:");
      console.log("   - The cross-chain swap hasn't completed yet");
      console.log("   - The swap went to a different address");
      console.log("   - There was an issue with the swap");
    }
  } catch (error) {
    console.error("❌ Error checking PYUSD balance:", error);
  }
}

checkPYUSDBalance();
