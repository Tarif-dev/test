const { Connection, PublicKey } = require("@solana/web3.js");
const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = require("@solana/spl-token");

async function checkPYUSDOnSolana() {
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  
  // User's Solana address
  const userAddress = "GJPWbnjeUR7yo61yMRLLGH7UPRTHZQEFPkFGbgn44eKQ";
  
  // PYUSD on Solana mainnet address
  const PYUSD_SOLANA_MINT = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"; // PYUSD on Solana
  
  try {
    console.log("🔍 Checking PYUSD token accounts on Solana...");
    console.log(`👤 User Address: ${userAddress}`);
    console.log(`🪙 PYUSD Mint: ${PYUSD_SOLANA_MINT}`);
    console.log("");
    
    const userPubkey = new PublicKey(userAddress);
    const pyusdMint = new PublicKey(PYUSD_SOLANA_MINT);
    
    // Get the associated token account address for PYUSD
    const associatedTokenAccount = await getAssociatedTokenAddress(
      pyusdMint,
      userPubkey
    );
    
    console.log(`📍 Associated Token Account: ${associatedTokenAccount.toString()}`);
    
    // Check if the ATA exists and get balance
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    
    if (!accountInfo) {
      console.log("❌ No PYUSD Associated Token Account found");
      console.log("ℹ️  User has never received PYUSD on Solana");
    } else {
      console.log("✅ PYUSD Associated Token Account exists!");
      
      // Parse the token account data to get balance
      const tokenAccountInfo = await connection.getParsedAccountInfo(associatedTokenAccount);
      
      if (tokenAccountInfo.value && tokenAccountInfo.value.data) {
        const parsedData = tokenAccountInfo.value.data;
        if ('parsed' in parsedData) {
          const balance = parsedData.parsed.info.tokenAmount;
          console.log(`💰 PYUSD Balance: ${balance.uiAmount} PYUSD`);
          console.log(`📊 Raw Amount: ${balance.amount} (decimals: ${balance.decimals})`);
          
          if (parseFloat(balance.uiAmount) > 0) {
            console.log("🎉 User has PYUSD on Solana!");
          } else {
            console.log("💸 PYUSD account exists but balance is 0");
          }
        }
      }
    }
    
    console.log("");
    console.log("📋 Additional Information:");
    console.log("• Cross-chain swaps typically deliver to destination chain (Ethereum)");
    console.log("• PYUSD might be on Ethereum instead of Solana");
    console.log("• Check Ethereum address: 0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711");
    
    // Also check all token accounts for this user
    console.log("\n🔍 Checking ALL token accounts for this user...");
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    console.log(`📊 Found ${tokenAccounts.value.length} token accounts:`);
    
    for (const account of tokenAccounts.value) {
      const data = account.account.data;
      if ('parsed' in data) {
        const info = data.parsed.info;
        const balance = info.tokenAmount;
        if (parseFloat(balance.uiAmount) > 0) {
          console.log(`  💰 ${info.mint}: ${balance.uiAmount} tokens`);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error checking PYUSD on Solana:", error);
  }
}

checkPYUSDOnSolana();