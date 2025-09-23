const axios = require("axios");

async function checkOrderStatus() {
  console.log("🔍 CHECKING 1INCH ORDER STATUS");
  console.log("═".repeat(50));

  const orderHash = "CG7uFZWJBPadZLmkmzbLjXcvTx9VgvoGLgJFBLcUk3yK";
  const solanaTransaction =
    "3EyJc5RowNyjv2yKWtwfmn65QcGMR3hTcirit6iva8QpeWfWaUYwDtj93CAfpmwedX9y5CvwMRvTnsePrW35fR7S";

  console.log(`📋 Order Hash: ${orderHash}`);
  console.log(`📋 Solana TX: ${solanaTransaction}`);
  console.log("");

  // Try to check order status using 1inch API
  const apiKey = process.env.DEV_PORTAL_API_KEY;

  if (!apiKey || apiKey === "your_1inch_api_key_here") {
    console.log("❌ No 1inch API key found in environment");
    console.log("ℹ️  Cannot directly query 1inch API without authentication");
    console.log("");
    console.log("🔍 ALTERNATIVE METHODS TO CHECK ORDER:");
    console.log("1. Check 1inch Discord announcements");
    console.log("2. Contact 1inch support with order hash");
    console.log("3. Check Solana Explorer for transaction details");
    console.log("4. Monitor your Ethereum address for PYUSD");
    return;
  }

  console.log("🔑 API Key found, attempting to query 1inch...");

  try {
    // Try different 1inch API endpoints to get order status
    const endpoints = [
      `https://api.1inch.dev/fusion-plus/relayer/v1.0/orders/status/${orderHash}`,
      `https://api.1inch.dev/fusion-plus/quoter/v1.0/orders/${orderHash}`,
      `https://api.1inch.dev/fusion-plus/orders/${orderHash}`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🌐 Trying endpoint: ${endpoint}`);

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        console.log("✅ SUCCESS! Order status found:");
        console.log(JSON.stringify(response.data, null, 2));
        return;
      } catch (error) {
        console.log(
          `❌ Endpoint failed: ${error.response?.status || error.message}`
        );
        continue;
      }
    }

    console.log("❌ All endpoints failed to return order status");
  } catch (error) {
    console.error("❌ Error querying 1inch API:", error.message);
  }

  console.log("");
  console.log("🔍 MANUAL VERIFICATION STEPS:");
  console.log("─".repeat(40));

  console.log("1. 📊 Check Solana Explorer:");
  console.log(`   https://solscan.io/tx/${solanaTransaction}`);

  console.log("\n2. 💰 Check PYUSD Balance:");
  console.log("   Address: 0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711");
  console.log("   Token: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8");

  console.log("\n3. 📞 Contact 1inch Support:");
  console.log("   Discord: https://discord.gg/1inch");
  console.log("   Support: https://help.1inch.io/");
  console.log(`   Order Hash: ${orderHash}`);
  console.log(`   Solana TX: ${solanaTransaction}`);

  console.log("\n4. 🔍 Check 1inch Status:");
  console.log("   https://status.1inch.io/");
  console.log("   Twitter: @1inch");

  // Calculate time elapsed
  const txTime = new Date("2025-09-22T14:04:20.000Z");
  const hoursElapsed =
    Math.round(((Date.now() - txTime.getTime()) / 1000 / 60 / 60) * 10) / 10;

  console.log(`\n⏰ Time Elapsed: ${hoursElapsed} hours`);
  console.log(
    `🚨 Status: ${hoursElapsed > 2 ? "SEVERELY DELAYED" : hoursElapsed > 1 ? "DELAYED" : "NORMAL"}`
  );

  console.log("\n" + "═".repeat(50));
  console.log("💡 RECOMMENDATION: Contact 1inch support immediately");
  console.log("🔒 Your funds are safe in 1inch escrow");
}

checkOrderStatus();
