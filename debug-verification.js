// Debug script to check verification status
console.log("🔍 Debugging verification status...");

// Check if we can get the user's address
const checkUserAddress = async () => {
  try {
    // Try to get user info from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("❌ No auth token found");
      return null;
    }

    console.log("✅ Auth token found");

    // Try to fetch user profile
    const response = await fetch("http://localhost:3001/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const userAddress = data.user.publicAddress;
      console.log("✅ User address:", userAddress);

      // Now check verification status
      console.log("🔍 Checking verification status...");
      const verifyResponse = await fetch(
        `http://localhost:3001/verification/status/${userAddress}`
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log("✅ Verification status:", verifyData);

        if (verifyData.isVerified) {
          console.log("🎉 User is verified on blockchain!");
        } else {
          console.log("⏳ User is not verified on blockchain yet");
        }
      } else {
        console.log(
          "❌ Failed to check verification:",
          verifyResponse.status,
          verifyResponse.statusText
        );
      }

      return userAddress;
    } else {
      console.log("❌ Failed to get user profile:", response.status);
      return null;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return null;
  }
};

checkUserAddress();
