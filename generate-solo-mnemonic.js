#!/usr/bin/env node
import { ethers } from 'ethers';
import crypto from 'crypto';

console.log('🔍 Creating VeWorld-compatible wallet for ReCircle testing...');

// Generate a fresh wallet with proper mnemonic
const mnemonic = ethers.Mnemonic.fromEntropy(crypto.randomBytes(16));
const newWallet = ethers.HDNodeWallet.fromPhrase(mnemonic.phrase, "m/44'/818'/0'/0/0");

console.log('\n✅ NEW VEWORLD WALLET CREATED:');
console.log('📝 Mnemonic (12 words):', mnemonic.phrase);
console.log('📍 Address:', newWallet.address);
console.log('🔑 Private Key:', newWallet.privateKey);
console.log('🛣️  Derivation Path: m/44\'/818\'/0\'/0/0');

console.log('\n📋 VeWorld Import Instructions:');
console.log('1. Open VeWorld app');
console.log('2. Select "Import Wallet"');
console.log('3. Choose "Seed Phrase"');
console.log('4. Enter the 12-word mnemonic above');
console.log('5. Set wallet name (e.g., "ReCircle Test")');

// Also verify that the standard Solo accounts work
const SOLO_ACCOUNTS = [
    { address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed', privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113b37a7c0f456fca3fcfd623a6' },
    { address: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602', privateKey: '0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e' },
    { address: '0x733b7269443c70de16bbf9b0615307884bcc5636', privateKey: '0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36' }
];

console.log('\n🔍 Verifying Solo accounts...');
SOLO_ACCOUNTS.forEach((account, index) => {
    try {
        const testWallet = new ethers.Wallet(account.privateKey);
        const matches = testWallet.address.toLowerCase() === account.address.toLowerCase();
        console.log(`Account ${index + 1}: ${matches ? '✅' : '❌'} ${account.address}`);
        if (!matches) {
            console.log(`  Expected: ${account.address}`);
            console.log(`  Got: ${testWallet.address}`);
        }
    } catch (error) {
        console.log(`Account ${index + 1}: ❌ Error - ${error.message}`);
    }
});

console.log('\n⚠️ Next step: Transfer B3TR tokens to this new wallet from Solo accounts');
console.log('   Use the web app to create user with this wallet address');
console.log('   Solo accounts will transfer B3TR to this VeWorld wallet');

// Verify this mnemonic derives to our target
try {
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic.phrase);
    const derivedWallet = hdNode.derivePath("m/44'/818'/0'/0/0");
    
    console.log('\n🔍 Verification:');
    console.log('Derived Address:', derivedWallet.address);
    console.log('Derived Private Key:', derivedWallet.privateKey);
    console.log('Matches target address:', derivedWallet.address.toLowerCase() === TARGET_ADDRESS.toLowerCase());
    console.log('Matches target private key:', derivedWallet.privateKey === TARGET_PRIVATE_KEY);
    
    if (derivedWallet.address.toLowerCase() === TARGET_ADDRESS.toLowerCase()) {
        console.log('\n✅ SUCCESS! Use this 12-word phrase in VeWorld:');
        console.log('📝', mnemonic.phrase);
        console.log('\n📋 Wallet Details:');
        console.log('Address:', derivedWallet.address);
        console.log('Private Key:', derivedWallet.privateKey);
        console.log('Derivation Path: m/44\'/818\'/0\'/0/0');
    } else {
        console.log('\n❌ Generated mnemonic does not derive to target address');
        
        // Try alternative approach - check if this is from a standard test mnemonic
        const testMnemonics = [
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            'test test test test test test test test test test test junk',
            'all all all all all all all all all all all all',
            'deny green color explain casual arch evidence deer what blade motor embargo'
        ];
        
        console.log('\n🧪 Trying known test mnemonics...');
        for (const testMnemonic of testMnemonics) {
            try {
                const testHdNode = ethers.HDNodeWallet.fromPhrase(testMnemonic);
                for (let i = 0; i < 10; i++) {
                    const testWallet = testHdNode.derivePath(`m/44'/818'/0'/0/${i}`);
                    if (testWallet.address.toLowerCase() === TARGET_ADDRESS.toLowerCase()) {
                        console.log(`✅ FOUND! Mnemonic: ${testMnemonic}`);
                        console.log(`Derivation Path: m/44'/818'/0'/0/${i}`);
                        process.exit(0);
                    }
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Create a custom mnemonic that will work for VeWorld
        console.log('\n🛠️ Creating custom VeWorld-compatible wallet...');
        const newMnemonic = ethers.Mnemonic.fromEntropy(crypto.randomBytes(16));
        const newHdNode = ethers.HDNodeWallet.fromPhrase(newMnemonic.phrase);
        const newWallet = newHdNode.derivePath("m/44'/818'/0'/0/0");
        
        console.log('\n✅ NEW WALLET FOR TESTING:');
        console.log('Mnemonic:', newMnemonic.phrase);
        console.log('Address:', newWallet.address);
        console.log('Private Key:', newWallet.privateKey);
        console.log('\n⚠️  This is a new wallet - you\'ll need to fund it with B3TR tokens');
    }
    
} catch (error) {
    console.log('❌ Error verifying mnemonic:', error.message);
}