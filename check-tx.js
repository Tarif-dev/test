const { Connection } = require("@solana/web3.js");

async function checkSolanaTransaction() {
  try {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const txSignature =
      "3EyJc5RowNyjv2yKWtwfmn65QcGMR3hTcirit6iva8QpeWfWaUYwDtj93CAfpmwedX9y5CvwMRvTnsePrW35fR7S";

    console.log("🔍 Checking Solana transaction...");
    console.log(`📍 Transaction: ${txSignature}`);
    console.log("");

    const txInfo = await connection.getTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (txInfo) {
      console.log("✅ Transaction found!");
      console.log(`   Slot: ${txInfo.slot}`);
      console.log(
        `   Block Time: ${new Date(txInfo.blockTime * 1000).toISOString()}`
      );
      console.log(`   Status: ${txInfo.meta?.err ? "FAILED" : "SUCCESS"}`);

      if (txInfo.meta?.err) {
        console.log(`   Error: ${JSON.stringify(txInfo.meta.err)}`);
      }

      console.log(`   Fee: ${txInfo.meta?.fee} lamports`);
      console.log(`   Compute Units: ${txInfo.meta?.computeUnitsConsumed}`);

      // Check for any logs mentioning 1inch or cross-chain
      if (txInfo.meta?.logMessages) {
        console.log("");
        console.log("📋 Transaction Logs:");
        txInfo.meta.logMessages.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log}`);
        });
      }
    } else {
      console.log("❌ Transaction not found!");
      console.log("🤔 This could mean:");
      console.log("   - Transaction is very recent and not indexed yet");
      console.log("   - Transaction signature is incorrect");
      console.log("   - RPC node doesn't have this transaction");
    }
  } catch (error) {
    console.error("❌ Error checking transaction:", error);
  }
}

checkSolanaTransaction();
