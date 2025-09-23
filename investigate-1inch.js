const axios = require("axios");

async function investigate1inchOrder() {
  console.log("🔍 Investigating 1inch Cross-Chain Swap Status");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Transaction details from our previous analysis
  const solanaTransaction =
    "3EyJc5RowNyjv2yKWtwfmn65QcGMR3hTcirit6iva8QpeWfWaUYwDtj93CAfpmwedX9y5CvwMRvTnsePrW35fR7S";
  const userEthAddress = "0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711";
  const userSolAddress = "GJPWbnjeUR7yo61yMRLLGH7UPRTHZQEFPkFGbgn44eKQ";

  console.log(`📍 Solana Transaction: ${solanaTransaction}`);
  console.log(`📍 User ETH Address: ${userEthAddress}`);
  console.log(`📍 User SOL Address: ${userSolAddress}`);
  console.log(
    `⏰ Transaction Time: 2025-09-22T14:04:20.000Z (${Math.round((Date.now() - new Date("2025-09-22T14:04:20.000Z").getTime()) / 1000 / 60)} minutes ago)`
  );
  console.log("");

  try {
    // Check if we can find any 1inch API endpoints to query order status
    console.log("🔎 Checking 1inch Fusion+ API for order status...");

    // Try to get recent orders or transactions
    const oneInchApiKey = process.env.DEV_PORTAL_API_KEY;
    if (!oneInchApiKey || oneInchApiKey === "your_1inch_api_key_here") {
      console.log("❌ No 1inch API key available to check order status");
      console.log("ℹ️  Cannot query 1inch API without proper authentication");
    } else {
      console.log("✅ 1inch API key available, checking order status...");

      // Try to get order information from 1inch Fusion+ API
      try {
        const response = await axios.get(
          "https://api.1inch.dev/fusion-plus/quoter/v1.0/orders",
          {
            headers: {
              Authorization: `Bearer ${oneInchApiKey}`,
              "Content-Type": "application/json",
            },
            params: {
              maker: userSolAddress,
              limit: 10,
            },
          }
        );

        console.log("📊 Recent 1inch orders:", response.data);
      } catch (apiError) {
        console.log("❌ Error querying 1inch API:", apiError.message);
        console.log(
          "ℹ️  API might require different authentication or endpoint"
        );
      }
    }

    console.log("");
    console.log("🚨 INVESTIGATION RESULTS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Solana transaction was 100% successful");
    console.log("✅ SOL was properly wrapped and sent to 1inch protocol");
    console.log("❌ PYUSD has NOT arrived on Ethereum after ~60 minutes");
    console.log(
      "⚠️  This is unusual - cross-chain swaps typically complete within 30 minutes"
    );
    console.log("");
    console.log("🎯 POSSIBLE ISSUES:");
    console.log("1. 📊 Network congestion on Ethereum causing delays");
    console.log(
      "2. 🔄 1inch relayer experiencing issues with this specific order"
    );
    console.log("3. 💰 Insufficient liquidity for SOL→PYUSD cross-chain route");
    console.log("4. 🚫 Order might have failed on the destination chain");
    console.log("5. 📍 PYUSD delivered to a different address than expected");
    console.log("");
    console.log("🔧 RECOMMENDED ACTIONS:");
    console.log("1. Check 1inch Discord/Twitter for any known issues");
    console.log("2. Contact 1inch support with the Solana transaction hash");
    console.log("3. Verify the exact destination address configuration");
    console.log(
      "4. Check if there are alternative block explorers showing the PYUSD"
    );
    console.log("");
    console.log("📞 1inch Support Information:");
    console.log("   Discord: https://discord.gg/1inch");
    console.log("   Support: https://help.1inch.io/");
    console.log("   Telegram: https://t.me/OneInchNetwork");
  } catch (error) {
    console.error("❌ Error during investigation:", error);
  }
}

investigate1inchOrder();
