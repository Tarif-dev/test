const { ethers } = require("ethers");

async function checkWrongAddress() {
  const provider = new ethers.JsonRpcProvider(
    "https://ethereum-rpc.publicnode.com"
  );
  const PYUSD_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";

  // The WRONG address from mock data
  const WRONG_ADDRESS = "0x742c2769a9e8db5ce14c5f1c2b88ff10f9f5b8e9";
  // Your correct address
  const CORRECT_ADDRESS = "0xFAc58ba0CCd5F5b81F7F4B5F6a28515d1a44b711";

  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const contract = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, provider);

  console.log("🔍 CHECKING BOTH ADDRESSES FOR PYUSD");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Check wrong address
    const wrongBalance = await contract.balanceOf(WRONG_ADDRESS);
    const decimals = await contract.decimals();
    const wrongBalanceFormatted = ethers.formatUnits(wrongBalance, decimals);

    console.log(`❌ WRONG Address (from mock): ${WRONG_ADDRESS}`);
    console.log(`   PYUSD Balance: ${wrongBalanceFormatted} PYUSD`);

    // Check correct address
    const correctBalance = await contract.balanceOf(CORRECT_ADDRESS);
    const correctBalanceFormatted = ethers.formatUnits(
      correctBalance,
      decimals
    );

    console.log(`✅ CORRECT Address (yours): ${CORRECT_ADDRESS}`);
    console.log(`   PYUSD Balance: ${correctBalanceFormatted} PYUSD`);

    console.log("");

    if (wrongBalance > 0n) {
      console.log("🎯 FOUND THE ISSUE!");
      console.log(`💰 PYUSD was sent to the WRONG ADDRESS: ${WRONG_ADDRESS}`);
      console.log(`💰 Amount: ${wrongBalanceFormatted} PYUSD`);
      console.log("");
      console.log("🔧 SOLUTION:");
      console.log("The mock data in your code has the wrong Ethereum address.");
      console.log("Your swap worked perfectly, but went to the wrong wallet!");
      console.log("");
      console.log("🚨 YOU NEED TO:");
      console.log("1. Update the mock ethereumAddress in your code");
      console.log(
        "2. Or better yet, fix the backend to return the correct address"
      );
    } else if (correctBalance > 0n) {
      console.log("🎉 PYUSD found in your correct address!");
      console.log("The swap worked and your PYUSD is safe!");
    } else {
      console.log("❌ No PYUSD found in either address");
      console.log("The issue might be elsewhere - contact 1inch support");
    }
  } catch (error) {
    console.error("❌ Error checking addresses:", error);
  }
}

checkWrongAddress();
