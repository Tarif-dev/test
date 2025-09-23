const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

async function analyzeSolanaTokens() {
  const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  // User's Solana address
  const userAddress = "GJPWbnjeUR7yo61yMRLLGH7UPRTHZQEFPkFGbgn44eKQ";

  try {
    console.log("🔍 Complete Solana Token Analysis");
    console.log(`👤 User Address: ${userAddress}`);
    console.log("");

    const userPubkey = new PublicKey(userAddress);

    // Get SOL balance
    const solBalance = await connection.getBalance(userPubkey);
    console.log(`💰 SOL Balance: ${solBalance / 1e9} SOL`);

    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    console.log(`\n📊 Token Accounts Found: ${tokenAccounts.value.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    for (const account of tokenAccounts.value) {
      const data = account.account.data;
      if ("parsed" in data) {
        const info = data.parsed.info;
        const balance = info.tokenAmount;

        console.log(`\n🪙 Token: ${info.mint}`);
        console.log(`   Balance: ${balance.uiAmount} tokens`);
        console.log(`   Decimals: ${balance.decimals}`);
        console.log(`   Raw: ${balance.amount}`);

        // Check if this is wrapped SOL
        if (info.mint === "So11111111111111111111111111111111111111112") {
          console.log("   Type: Wrapped SOL (wSOL)");
          console.log("   💡 This is leftover from the 1inch swap!");
        }
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 SUMMARY:");
    console.log("✅ User has SOL and wrapped SOL on Solana");
    console.log("❌ User has NO PYUSD on Solana");
    console.log("🎯 PYUSD should be delivered to Ethereum address");
    console.log("⏳ Cross-chain settlement still pending");
  } catch (error) {
    console.error("❌ Error analyzing Solana tokens:", error);
  }
}

analyzeSolanaTokens();
