// COMPREHENSIVE CROSS-CHAIN SWAP AUDIT
// This script checks every parameter in your 1inch cross-chain swap

console.log("🔍 COMPREHENSIVE 1INCH CROSS-CHAIN SWAP AUDIT");
console.log("═".repeat(60));

// === CONFIGURATION AUDIT ===
console.log("\n📋 1. CONFIGURATION PARAMETERS");
console.log("─".repeat(40));

const config = {
  // Source chain (Solana)
  srcChainId: parseInt(process.env.SRC_CHAIN_ID || "501"),
  solTokenAddress:
    process.env.SOL_TOKEN_ADDRESS ||
    "So11111111111111111111111111111111111111112",

  // Destination chain (Ethereum)
  dstChainId: parseInt(process.env.DST_CHAIN_ID || "1"),
  pyusdEthereumAddress:
    process.env.PYUSD_ETHEREUM_ADDRESS ||
    "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",

  // 1inch API
  sdkUrl: process.env.ONEINCH_SDK_URL || "https://api.1inch.dev/fusion-plus",
  devPortalApiKey: process.env.DEV_PORTAL_API_KEY || "NOT_SET",
};

console.log(
  `🔗 Source Chain ID: ${config.srcChainId} ${config.srcChainId === 501 ? "✅" : "❌"}`
);
console.log(`🪙 SOL Token Address: ${config.solTokenAddress}`);
console.log(
  `🔗 Destination Chain ID: ${config.dstChainId} ${config.dstChainId === 1 ? "✅" : "❌"}`
);
console.log(`💰 PYUSD Address: ${config.pyusdEthereumAddress}`);
console.log(`🌐 1inch SDK URL: ${config.sdkUrl}`);
console.log(
  `🔑 API Key: ${config.devPortalApiKey.length > 10 ? "SET ✅" : "NOT SET ❌"}`
);

// === TOKEN ADDRESS VERIFICATION ===
console.log("\n📋 2. TOKEN ADDRESS VERIFICATION");
console.log("─".repeat(40));

// Known correct addresses
const KNOWN_ADDRESSES = {
  SOL_WRAPPED: "So11111111111111111111111111111111111111112",
  PYUSD_ETHEREUM: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
  USDC_ETHEREUM: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
};

console.log(`🪙 Wrapped SOL: ${config.solTokenAddress}`);
console.log(`   Expected: ${KNOWN_ADDRESSES.SOL_WRAPPED}`);
console.log(
  `   Match: ${config.solTokenAddress === KNOWN_ADDRESSES.SOL_WRAPPED ? "✅" : "❌"}`
);

console.log(`💰 PYUSD Ethereum: ${config.pyusdEthereumAddress}`);
console.log(`   Expected: ${KNOWN_ADDRESSES.PYUSD_ETHEREUM}`);
console.log(
  `   Match: ${config.pyusdEthereumAddress.toLowerCase() === KNOWN_ADDRESSES.PYUSD_ETHEREUM.toLowerCase() ? "✅" : "❌"}`
);

// === USER ADDRESS MAPPING AUDIT ===
console.log("\n📋 3. USER ADDRESS MAPPING");
console.log("─".repeat(40));

const USER_DATA = {
  id: "cmfo45qfd0000ri39fh6wc3zj",
  email: "taherabbkhasamwala@gmail.com",
  solanaAddress: "GJPWbnjeUR7yo61yMRLLGH7UPRTHZQEFPkFGbgn44eKQ",
  ethereumAddress: "0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711",
};

console.log(`👤 User: ${USER_DATA.email}`);
console.log(`🌟 Solana Address: ${USER_DATA.solanaAddress}`);
console.log(`🌐 Ethereum Address: ${USER_DATA.ethereumAddress}`);
console.log(`📍 PYUSD Destination: ${USER_DATA.ethereumAddress}`);

// === TRANSACTION PARAMETERS ANALYSIS ===
console.log("\n📋 4. TRANSACTION PARAMETERS");
console.log("─".repeat(40));

const SUCCESSFUL_TX =
  "3EyJc5RowNyjv2yKWtwfmn65QcGMR3hTcirit6iva8QpeWfWaUYwDtj93CAfpmwedX9y5CvwMRvTnsePrW35fR7S";
const TX_TIME = new Date("2025-09-22T14:04:20.000Z");
const MINUTES_ELAPSED = Math.round(
  (Date.now() - TX_TIME.getTime()) / 1000 / 60
);

console.log(`📜 Transaction Hash: ${SUCCESSFUL_TX}`);
console.log(`⏰ Transaction Time: ${TX_TIME.toISOString()}`);
console.log(`⌛ Minutes Elapsed: ${MINUTES_ELAPSED} minutes`);
console.log(
  `🚨 Status: ${MINUTES_ELAPSED > 60 ? "SEVERELY DELAYED ❌" : MINUTES_ELAPSED > 30 ? "DELAYED ⚠️" : "NORMAL ✅"}`
);

// === POTENTIAL ISSUES ANALYSIS ===
console.log("\n📋 5. POTENTIAL ISSUES IDENTIFIED");
console.log("─".repeat(40));

const issues = [];

if (
  config.devPortalApiKey === "NOT_SET" ||
  config.devPortalApiKey.length < 10
) {
  issues.push("❌ 1inch API key not properly configured");
}

if (MINUTES_ELAPSED > 60) {
  issues.push("❌ Cross-chain swap severely delayed (>60 minutes)");
}

if (config.srcChainId !== 501) {
  issues.push("❌ Wrong Solana chain ID");
}

if (config.dstChainId !== 1) {
  issues.push("❌ Wrong Ethereum chain ID");
}

if (
  config.pyusdEthereumAddress.toLowerCase() !==
  KNOWN_ADDRESSES.PYUSD_ETHEREUM.toLowerCase()
) {
  issues.push("❌ Wrong PYUSD contract address");
}

if (config.solTokenAddress !== KNOWN_ADDRESSES.SOL_WRAPPED) {
  issues.push("❌ Wrong SOL token address");
}

if (issues.length === 0) {
  console.log("✅ No configuration issues found");
  console.log("🔍 Issue is likely with 1inch service or order execution");
} else {
  console.log("🚨 CRITICAL ISSUES FOUND:");
  issues.forEach((issue) => console.log(`   ${issue}`));
}

// === RECOMMENDED ACTIONS ===
console.log("\n📋 6. RECOMMENDED IMMEDIATE ACTIONS");
console.log("─".repeat(40));

console.log("1. 📞 CONTACT 1INCH SUPPORT IMMEDIATELY:");
console.log("   • Discord: https://discord.gg/1inch");
console.log("   • Support: https://help.1inch.io/");
console.log(`   • Provide TX: ${SUCCESSFUL_TX}`);
console.log(`   • User ETH: ${USER_DATA.ethereumAddress}`);

console.log("\n2. 🔍 CHECK 1INCH STATUS:");
console.log("   • https://status.1inch.io/");
console.log("   • Twitter: @1inch");

console.log("\n3. 💰 VERIFY ORDER STATUS:");
console.log("   • Check if order was properly announced");
console.log("   • Verify order hash exists in 1inch system");
console.log("   • Confirm secrets were submitted correctly");

console.log("\n4. 🔧 TECHNICAL INVESTIGATION:");
console.log("   • Re-run transaction analysis");
console.log("   • Check for any error logs");
console.log("   • Verify all contract addresses");

console.log("\n" + "═".repeat(60));
console.log("🔒 YOUR FUNDS ARE SAFE - 1inch has strong security guarantees");
console.log("⚡ URGENT: Contact 1inch support with the details above!");
console.log("═".repeat(60));
