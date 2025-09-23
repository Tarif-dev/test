// Check what announceOrder returns vs what we've been using
console.log("🔍 INVESTIGATING ORDER HASH FORMATS");
console.log("═══════════════════════════════════════");

// Let's check our most recent logs for the actual order announcement
import { execSync } from "child_process";

try {
  console.log("📋 Recent order hashes we've been tracking:");
  console.log(
    "1. GNiR4gY6CCf9sYeCp3BfDkJRPTCJojfMpmGTLodmdbhA (44 chars - Solana tx)"
  );
  console.log(
    "2. CG7uFZWJBPadZLmkmzbLjXcvTx9VgvoGLgJFBLcUk3yK (43 chars - Solana tx)"
  );
  console.log(
    "3. 1rfUchci6pvHjuQhz7MZ9Kfd86jhgrpnj783n3QQEDd (43 chars - Solana tx)"
  );

  console.log("\n❌ PROBLEM IDENTIFIED:");
  console.log(
    "These are all Solana transaction signatures, NOT 1inch order hashes!"
  );
  console.log(
    "1inch expects 66-character Ethereum order hash (0x + 64 hex chars)"
  );

  console.log("\n🤔 THEORY:");
  console.log("We've been confusing two different hashes:");
  console.log("1. announceOrder() returns Ethereum order hash (66 chars)");
  console.log("2. Solana sendTransaction() returns tx signature (43-44 chars)");
  console.log("3. We've been using Solana tx signatures for 1inch API calls!");

  console.log("\n🔧 SOLUTION:");
  console.log("We need to:");
  console.log("1. Store the ACTUAL order hash from announceOrder()");
  console.log("2. Use that for monitoring, not the Solana tx signature");
  console.log("3. Fix our logging to show both hashes clearly");
} catch (error) {
  console.log("Error:", error.message);
}

console.log("\n🎯 NEXT STEP: Fix the hash confusion in our code!");
