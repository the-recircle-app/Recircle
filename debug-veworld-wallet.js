/**
 * Debug VeWorld wallet derivation mystery
 * Let's check if there are any other derivation methods being used
 */

import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const MNEMONIC = process.env.TESTNET_MNEMONIC;
const TARGET_WALLET = "0x15D009B3A5811fdE66F19b2db1D40172d53E5653";

console.log(`🔍 DEBUG: VeWorld Wallet Derivation Mystery`);
console.log(`========================================`);
console.log(`Target: ${TARGET_WALLET}`);
console.log(`Mnemonic: ${MNEMONIC}`);

// Test 1: Verify mnemonic validity
console.log(`\n1️⃣ Mnemonic Validation:`);
const isValid = ethers.Mnemonic.isValidMnemonic(MNEMONIC);
console.log(`   Valid: ${isValid}`);
console.log(`   Length: ${MNEMONIC.split(' ').length} words`);

// Test 2: Check if all paths really generate the same address
console.log(`\n2️⃣ Derivation Path Test (first 20):`);
const addresses = new Set();
for (let i = 0; i < 20; i++) {
  try {
    const wallet = ethers.Wallet.fromPhrase(MNEMONIC, `m/44'/818'/0'/0/${i}`);
    addresses.add(wallet.address);
    console.log(`   m/44'/818'/0'/0/${i}: ${wallet.address}`);
  } catch (error) {
    console.log(`   m/44'/818'/0'/0/${i}: ERROR`);
  }
}
console.log(`   Unique addresses found: ${addresses.size}`);

// Test 3: Try completely different approaches
console.log(`\n3️⃣ Alternative Derivation Methods:`);

// Method 1: Direct HD node derivation
try {
  const hdNode = ethers.HDNodeWallet.fromPhrase(MNEMONIC);
  console.log(`   Root HD Node: ${hdNode.address}`);
  
  // Try deriving from root
  const derived = hdNode.derivePath("m/44'/818'/0'/0/0");
  console.log(`   Derived from root: ${derived.address}`);
} catch (error) {
  console.log(`   HD Node method failed: ${error.message}`);
}

// Method 2: Check if it's using Ethereum derivation
try {
  const ethWallet = ethers.Wallet.fromPhrase(MNEMONIC, "m/44'/60'/0'/0/0");
  console.log(`   Ethereum path: ${ethWallet.address}`);
} catch (error) {
  console.log(`   Ethereum path failed: ${error.message}`);
}

// Test 4: Check the exact words
console.log(`\n4️⃣ Mnemonic Word Analysis:`);
const words = MNEMONIC.split(' ');
console.log(`   Words: [${words.map((w, i) => `${i+1}:${w}`).join(', ')}]`);

// Test 5: Try manual seed generation
console.log(`\n5️⃣ Manual Seed Generation:`);
try {
  const mnemonic = ethers.Mnemonic.fromPhrase(MNEMONIC);
  console.log(`   Mnemonic object created successfully`);
  console.log(`   Entropy: ${mnemonic.entropy}`);
  
  // Try creating wallet directly from mnemonic object
  const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic);
  console.log(`   Direct from mnemonic: ${wallet.address}`);
} catch (error) {
  console.log(`   Manual seed failed: ${error.message}`);
}

console.log(`\n❓ CONCLUSION:`);
console.log(`The mnemonic "${MNEMONIC}"`);
console.log(`generates wallet: 0x412f31cfa5677E86c2ABE3378E1B84a8EB5c2Fa6`);
console.log(`but VeWorld shows: ${TARGET_WALLET}`);
console.log(`\nPossible explanations:`);
console.log(`1. VeWorld imported this wallet via private key, not mnemonic`);
console.log(`2. VeWorld uses a proprietary derivation method`);
console.log(`3. The address shown might be from a different account/wallet`);
console.log(`4. VeWorld might have multiple wallets under one recovery phrase`);

console.log(`\n💡 NEXT STEPS:`);
console.log(`1. In VeWorld, go to Settings → Export Private Key for 0x15D0...5653`);
console.log(`2. Or check if VeWorld has multiple accounts/wallets`);
console.log(`3. Verify this is the correct address by checking transaction history`);