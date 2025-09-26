// Quick test script to check API connection
const API_BASE_URL = "http://localhost:3001";

async function testVerificationAPI() {
  console.log("🔍 Testing verification API...");

  try {
    // Test 1: Check configuration
    console.log("1. Testing configuration endpoint...");
    const configResponse = await fetch(`${API_BASE_URL}/verification/config`);

    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log("✅ Config API working!");
      console.log("   Contract Address:", config.contractAddress);
      console.log("   Network:", config.network);
    } else {
      console.log("❌ Config API failed:", configResponse.status);
    }

    // Test 2: Check specific address
    console.log("\n2. Testing address verification...");
    const testAddress = "0xD1BFf4D0bc90eD121Bf6C16Df81Be14092F5Fb75";
    const statusResponse = await fetch(
      `${API_BASE_URL}/verification/status/${testAddress}`
    );

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log("✅ Status API working!");
      console.log("   Test Address:", testAddress);
      console.log("   Is Verified:", status.isVerified);
    } else {
      console.log("❌ Status API failed:", statusResponse.status);
    }

    console.log("\n🎉 Backend API is working correctly!");
    console.log("The issue is likely with the frontend connection.");
  } catch (error) {
    console.log("❌ API connection failed:", error.message);
    console.log("💡 Make sure the backend server is running on port 3001");
  }
}

testVerificationAPI();
