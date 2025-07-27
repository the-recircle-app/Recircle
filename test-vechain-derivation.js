/**
 * Test VeChain wallet derivation using different methods
 */

import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const TESTNET_MNEMONIC = process.env.TESTNET_MNEMONIC;
const TARGET_WALLET = "0x15D009B3A5811fdE66F19b2db1D40172d53E5653";

console.log(`🎯 Target wallet: ${TARGET_WALLET}`);
console.log(`📝 Mnemonic: ${TESTNET_MNEMONIC?.split(' ').slice(0, 3).join(' ')}...`);

// Method 1: Using ethers.Wallet.fromPhrase with VeChain path
console.log(`\n1️⃣ Method 1: ethers.Wallet.fromPhrase`);
try {
  const wallet1 = ethers.Wallet.fromPhrase(TESTNET_MNEMONIC, "m/44'/818'/0'/0/0");
  console.log(`   Address: ${wallet1.address}`);
  console.log(`   Match: ${wallet1.address.toLowerCase() === TARGET_WALLET.toLowerCase()}`);
} catch (error) {
  console.log(`   Error: ${error.message}`);
}

// Method 2: Using ethers.HDNodeWallet
console.log(`\n2️⃣ Method 2: ethers.HDNodeWallet.fromPhrase`);
try {
  const hdNode = ethers.HDNodeWallet.fromPhrase(TESTNET_MNEMONIC);
  const wallet2 = hdNode.derivePath("m/44'/818'/0'/0/0");
  console.log(`   Address: ${wallet2.address}`);
  console.log(`   Match: ${wallet2.address.toLowerCase() === TARGET_WALLET.toLowerCase()}`);
} catch (error) {
  console.log(`   Error: ${error.message}`);
}

// Method 3: Test if mnemonic is valid
console.log(`\n3️⃣ Method 3: Mnemonic validation`);
try {
  const isValid = ethers.Mnemonic.isValidMnemonic(TESTNET_MNEMONIC);
  console.log(`   Mnemonic valid: ${isValid}`);
  console.log(`   Word count: ${TESTNET_MNEMONIC?.split(' ').length}`);
} catch (error) {
  console.log(`   Error: ${error.message}`);
}

// Method 4: Test different account indices
console.log(`\n4️⃣ Method 4: Testing different account indices`);
for (let i = 0; i < 10; i++) {
  try {
    const wallet = ethers.Wallet.fromPhrase(TESTNET_MNEMONIC, `m/44'/818'/0'/0/${i}`);
    console.log(`   Account ${i}: ${wallet.address} ${wallet.address.toLowerCase() === TARGET_WALLET.toLowerCase() ? '✅ MATCH!' : ''}`);
    if (wallet.address.toLowerCase() === TARGET_WALLET.toLowerCase()) {
      console.log(`   🎉 FOUND AT INDEX ${i}!`);
      break;
    }
  } catch (error) {
    console.log(`   Account ${i}: Error - ${error.message}`);
  }
}

// Method 5: Test different change indices
console.log(`\n5️⃣ Method 5: Testing different change indices`);
for (let change = 0; change < 3; change++) {
  for (let account = 0; account < 3; account++) {
    try {
      const path = `m/44'/818'/0'/${change}/${account}`;
      const wallet = ethers.Wallet.fromPhrase(TESTNET_MNEMONIC, path);
      console.log(`   ${path}: ${wallet.address} ${wallet.address.toLowerCase() === TARGET_WALLET.toLowerCase() ? '✅ MATCH!' : ''}`);
      if (wallet.address.toLowerCase() === TARGET_WALLET.toLowerCase()) {
        console.log(`   🎉 FOUND AT PATH ${path}!`);
        process.exit(0);
      }
    } catch (error) {
      console.log(`   ${path}: Error - ${error.message}`);
    }
  }
}

console.log(`\n❌ Still no match found. The mnemonic might not control this wallet.`);