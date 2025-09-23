const { ethers } = require("ethers");

async function monitorPYUSDBalance() {
  const provider = new ethers.JsonRpcProvider(
    "https://ethereum-rpc.publicnode.com"
  );
  const PYUSD_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
  const USER_ADDRESS = "0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711";

  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];

  const contract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, provider);

  console.log("👀 Monitoring PYUSD balance for cross-chain swap completion...");
  console.log(`📍 User Address: ${USER_ADDRESS}`);
  console.log(`💰 PYUSD Contract: ${PYUSD_ADDRESS}`);
  console.log(`⏱️  Checking every 30 seconds...`);
  console.log("");

  let checkCount = 0;
  const maxChecks = 120; // Check for 1 hour (120 * 30 seconds)

  const checkBalance = async () => {
    try {
      checkCount++;
      const balance = await contract.balanceOf(USER_ADDRESS);
      const decimals = await contract.decimals();
      const balanceFormatted = ethers.formatUnits(balance, decimals);

      console.log(
        `🔍 Check ${checkCount}/${maxChecks} - ${new Date().toISOString()}`
      );
      console.log(`   Balance: ${balanceFormatted} PYUSD`);

      if (balance > 0n) {
        console.log("");
        console.log(
          "🎉 PYUSD RECEIVED! Cross-chain swap completed successfully!"
        );
        console.log(`💰 Final Balance: ${balanceFormatted} PYUSD`);
        console.log(
          `💵 USD Value: ~$${(parseFloat(balanceFormatted) * 1.0).toFixed(2)}`
        );
        process.exit(0);
      }

      if (checkCount >= maxChecks) {
        console.log("");
        console.log("⏰ Monitoring timeout reached (1 hour)");
        console.log(
          "🤔 Cross-chain swap may still be pending or there may be an issue"
        );
        console.log(
          "📖 You can continue monitoring manually or check 1inch status"
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error checking balance: ${error.message}`);
    }
  };

  // Initial check
  await checkBalance();

  // Set up interval
  const interval = setInterval(checkBalance, 30000); // 30 seconds

  // Cleanup on exit
  process.on("SIGINT", () => {
    console.log("\n👋 Monitoring stopped by user");
    clearInterval(interval);
    process.exit(0);
  });
}

monitorPYUSDBalance();
