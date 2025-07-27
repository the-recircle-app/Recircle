/**
 * Enhanced VeChain Wallet Derivation Path Finder
 * This tests comprehensive derivation paths including VeWorld-specific patterns
 */

import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const TESTNET_MNEMONIC = process.env.TESTNET_MNEMONIC;
const TARGET_WALLET = "0x15D009B3A5811fdE66F19b2db1D40172d53E5653";

if (!TESTNET_MNEMONIC) {
  console.log("❌ TESTNET_MNEMONIC not found in environment");
  process.exit(1);
}

console.log(`🎯 TARGET WALLET: ${TARGET_WALLET}`);
console.log(`📝 MNEMONIC: ${TESTNET_MNEMONIC.split(' ').slice(0, 3).join(' ')}... (${TESTNET_MNEMONIC.split(' ').length} words)`);

// Validate mnemonic
if (!ethers.Mnemonic.isValidMnemonic(TESTNET_MNEMONIC)) {
  console.log("❌ Invalid mnemonic phrase");
  process.exit(1);
}

// Extended derivation paths for VeWorld compatibility
const derivationPaths = [];

// VeChain standard paths with extended account indices (VeWorld might use higher indices)
for (let account = 0; account < 20; account++) {
  derivationPaths.push(`m/44'/818'/0'/0/${account}`);
}

// Different change indices
for (let change = 0; change < 5; change++) {
  for (let account = 0; account < 10; account++) {
    derivationPaths.push(`m/44'/818'/0'/${change}/${account}`);
  }
}

// Different wallet indices
for (let wallet = 0; wallet < 5; wallet++) {
  for (let account = 0; account < 5; account++) {
    derivationPaths.push(`m/44'/818'/${wallet}'/0/${account}`);
  }
}

// Ethereum paths (some VeChain wallets use these)
for (let account = 0; account < 20; account++) {
  derivationPaths.push(`m/44'/60'/0'/0/${account}`);
}

// Legacy and alternative formats
const additionalPaths = [
  // Direct account paths
  "m/44'/818'/0'",
  "m/44'/818'/1'", 
  "m/44'/818'/2'",
  "m/44'/60'/0'",
  "m/44'/60'/1'",
  
  // Simplified paths
  "m/44'/818'/0",
  "m/44'/818'/1",
  "m/44'/60'/0",
  "m/44'/60'/1",
  
  // Root paths
  "m/0'/0'/0'",
  "m/0/0/0",
  
  // Other standards
  "m/84'/0'/0'/0/0", // Native SegWit
  "m/49'/0'/0'/0/0", // SegWit
];

derivationPaths.push(...additionalPaths);

async function findWalletDerivation() {
  console.log(`\n🔍 Testing ${derivationPaths.length} derivation paths...\n`);
  
  let foundPaths = [];
  
  for (let i = 0; i < derivationPaths.length; i++) {
    const path = derivationPaths[i];
    
    try {
      const wallet = ethers.Wallet.fromPhrase(TESTNET_MNEMONIC, path);
      const address = wallet.address;
      
      // Show progress every 50 paths
      if (i % 50 === 0) {
        console.log(`Progress: ${i}/${derivationPaths.length} paths tested...`);
      }
      
      if (address.toLowerCase() === TARGET_WALLET.toLowerCase()) {
        console.log(`\n🎉 MATCH FOUND! 🎉`);
        console.log(`✅ Derivation path: ${path}`);
        console.log(`✅ Address: ${address}`);
        console.log(`✅ Private key: ${wallet.privateKey}`);
        
        foundPaths.push({ path, address, privateKey: wallet.privateKey });
      }
    } catch (error) {
      // Skip invalid paths silently
      continue;
    }
  }
  
  if (foundPaths.length > 0) {
    console.log(`\n🎯 SUCCESS! Found ${foundPaths.length} matching path(s):`);
    foundPaths.forEach((result, index) => {
      console.log(`\n${index + 1}. Path: ${result.path}`);
      console.log(`   Address: ${result.address}`);
      console.log(`   Private Key: ${result.privateKey}`);
    });
    
    console.log(`\n✅ Use this in your .env file:`);
    console.log(`VECHAIN_PRIVATE_KEY=${foundPaths[0].privateKey}`);
    
    return foundPaths[0];
  }
  
  // If no match found, show some sample addresses for comparison
  console.log(`\n❌ No match found. Here are some sample addresses from your mnemonic:`);
  for (let i = 0; i < 10; i++) {
    try {
      const wallet = ethers.Wallet.fromPhrase(TESTNET_MNEMONIC, `m/44'/818'/0'/0/${i}`);
      console.log(`   m/44'/818'/0'/0/${i}: ${wallet.address}`);
    } catch (error) {
      continue;
    }
  }
  
  console.log(`\n💡 Possible solutions:`);
  console.log(`1. Double-check your VeWorld wallet address`);
  console.log(`2. Verify the 12-word phrase is correct`);
  console.log(`3. The wallet might use a non-standard derivation`);
  console.log(`4. Export private key directly from VeWorld Settings`);
  
  return null;
}

findWalletDerivation()
  .then(result => {
    if (result) {
      console.log(`\n🚀 Ready to enable real blockchain transactions!`);
    }
  })
  .catch(error => {
    console.error("Error:", error);
  });