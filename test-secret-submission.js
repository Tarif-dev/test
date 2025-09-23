// Test secret submission in isolation
console.log("🧪 ISOLATED SECRET SUBMISSION TEST");
console.log("═══════════════════════════════════════");

import { FusionSDK, NetworkEnum } from "@1inch/fusion-sdk";
import fetch from "node-fetch";

const config = {
  API_KEY: "7FDmZu6NJ50FD9SU8ZyaHgTnIqmELBbH",
  PRIVATE_KEY:
    "16aa8add3c0d2e74eba1d43d68fb01e825d3bf8c9f89ac8aa24b92063aa78b8b",
};

const SDK = new FusionSDK({
  url: "https://api.1inch.dev/fusion-plus",
  network: NetworkEnum.ETHEREUM,
  authKey: config.API_KEY,
});

async function testSecretSubmission() {
  console.log("🔍 Testing secret submission for recent order...\n");

  const orderHash = "GNiR4gY6CCf9sYeCp3BfDkJRPTCJojfMpmGTLodmdbhA";

  try {
    console.log("📋 Order Hash:", orderHash);
    console.log("⏰ Starting test at:", new Date().toISOString());

    // Step 1: Check current order status
    console.log("\n🔍 STEP 1: Checking order status...");
    const order = await SDK.getOrderStatus(orderHash);
    console.log("📊 Order Status:", order.status);
    console.log("🔄 Fill Count:", order.fills?.length || 0);

    if (!order.fills || order.fills.length === 0) {
      console.log("❌ No fills found - secret submission not possible");
      return;
    }

    // Step 2: Get secrets
    console.log("\n🔑 STEP 2: Getting secrets...");
    const secrets = await SDK.getSecretsByOrderHash(orderHash);
    console.log("🔍 Secrets Response:", JSON.stringify(secrets, null, 2));

    if (!secrets || !Array.isArray(secrets) || secrets.length === 0) {
      console.log("❌ No secrets available");
      return;
    }

    // Step 3: Check if secrets are ready
    console.log("\n✅ STEP 3: Processing secrets...");
    for (let i = 0; i < secrets.length; i++) {
      const secret = secrets[i];
      console.log(`\n🔑 Secret ${i}:`);
      console.log("  - Hash:", secret.secretHash);
      console.log("  - Ready to submit:", !secret.submittedSecret);

      if (!secret.submittedSecret) {
        console.log(`\n🚀 STEP 4: Attempting to submit secret ${i}...`);

        try {
          // This is the critical call that's been failing
          console.log("📡 Making SDK.submitSecret() call...");
          const result = await SDK.submitSecret(orderHash, secret.secretHash);
          console.log(
            "✅ Secret submission result:",
            JSON.stringify(result, null, 2)
          );
        } catch (secretError) {
          console.log("❌ SECRET SUBMISSION FAILED:");
          console.log("  Error type:", secretError.constructor.name);
          console.log("  Error message:", secretError.message);
          console.log("  Error stack:", secretError.stack);

          // Check if it's an API error
          if (secretError.response) {
            console.log("  API Response Status:", secretError.response.status);
            try {
              const errorText = await secretError.response.text();
              console.log("  API Response Body:", errorText);
            } catch (e) {
              console.log("  Could not read API response body");
            }
          }
        }
      } else {
        console.log(`⏭️  Secret ${i} already submitted`);
      }
    }
  } catch (error) {
    console.log("\n💥 MAIN ERROR:");
    console.log("Error type:", error.constructor.name);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
  }

  console.log("\n🏁 Test completed at:", new Date().toISOString());
}

// Run the test
testSecretSubmission().catch(console.error);
