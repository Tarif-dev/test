// Load environment variables first
import "dotenv/config";

import { DatabaseService } from "./apps/backend/services/database.js";
import { AuthService } from "./apps/backend/services/auth.js";

async function getPrivateKey(address) {
  try {
    console.log(`Looking up private key for address: ${address}`);

    const dbService = new DatabaseService();
    const authService = new AuthService();

    // Find user by address
    const user = await dbService.findUserByAddress(address);
    if (!user) {
      console.error(`❌ User with address ${address} not found in database`);
      return;
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(
      `🔐 Encrypted private key length: ${user.encryptedPrivateKey?.length || 0}`
    );
    console.log(
      `🔐 Encrypted private key: ${user.encryptedPrivateKey?.substring(0, 50)}...`
    );

    if (!user.encryptedPrivateKey) {
      console.error("❌ No encrypted private key found for this user!");
      return;
    }

    // Decrypt the private key
    const privateKey = authService.decryptPrivateKey(user.encryptedPrivateKey);

    console.log(`🔑 Private key: ${privateKey}`);
    console.log(
      `\n✅ Copy this private key to use with the set-config-id endpoint`
    );
  } catch (error) {
    console.error("❌ Error getting private key:", error);
  }
}

// Get address from command line argument
const address = process.argv[2];
if (!address) {
  console.error("Usage: node get_private_key.js <ethereum_address>");
  process.exit(1);
}

getPrivateKey(address);
