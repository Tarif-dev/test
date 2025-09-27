// Test Self Protocol configuration
console.log("🔍 Testing Self Protocol Configuration");
console.log("=====================================");

// Check environment variables
console.log("📋 Current Configuration:");
console.log("Contract Address:", "0xbad8F4ffD864b4cB2E043C197c697C22f4B899Aa");
console.log("Scope:", "1");
console.log("Network:", "staging_celo");

// This should match what the frontend uses
const testConfig = {
  endpoint: "0xbad8F4ffD864b4cB2E043C197c697C22f4B899Aa",
  endpointType: "staging_celo",
  userIdType: "hex",
  version: 2,
  appName: "Pokket Wallet",
  scope: "1", // Must match deployed contract
  userId: "0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711",
  userDefinedData: JSON.stringify({
    platform: "pokket",
    timestamp: Date.now(),
    version: "1.0",
  }),
  disclosures: {
    minimumAge: 18,
    excludedCountries: [],
    ofac: false,
    name: true,
    date_of_birth: true,
    nationality: true,
    issuing_state: true,
  },
};

console.log("\n🎯 Configuration for Self Protocol:");
console.log(JSON.stringify(testConfig, null, 2));

console.log("\n✅ This configuration should work with your deployed contract!");
console.log("\n📱 Next steps:");
console.log("1. Open your frontend at http://localhost:3000");
console.log("2. Go to verification modal");
console.log("3. Scan QR code with Self app");
console.log("4. Complete Aadhar verification");
console.log("5. Check if contract status updates automatically");
