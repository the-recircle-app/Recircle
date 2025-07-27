// Derive the correct private key for distributor wallet 0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee
import * as thor from 'thor-devkit';
import { ethers } from 'ethers';

const mnemonic = process.env.ADMIN_MNEMONIC || process.env.TESTNET_MNEMONIC;

if (!mnemonic) {
    console.log('❌ No mnemonic found in environment variables');
    process.exit(1);
}

console.log('=== DISTRIBUTOR WALLET KEY DERIVATION ===');
console.log(`Target distributor: 0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee`);

try {
    const words = mnemonic.trim().split(/\s+/);
    console.log(`Mnemonic words: ${words.length}`);
    
    // Try multiple derivation paths to find the distributor wallet
    console.log('\nTrying different derivation paths...');
    
    // Method 1: Default thor-devkit derivation (index 0)
    console.log('\n1. Default thor-devkit derivation:');
    const privateKeyBuffer0 = thor.mnemonic.derivePrivateKey(words);
    const privateKey0 = new Uint8Array(privateKeyBuffer0);
    const privateKeyHex0 = '0x' + Buffer.from(privateKey0).toString('hex');
    const wallet0 = new ethers.Wallet(privateKeyHex0);
    console.log(`   Address: ${wallet0.address}`);
    
    // Method 2: BIP-44 derivation with index 1
    console.log('\n2. BIP-44 derivation (index 1):');
    const privateKeyBuffer1 = thor.mnemonic.derivePrivateKey(words, 1);
    const privateKey1 = new Uint8Array(privateKeyBuffer1);
    const privateKeyHex1 = '0x' + Buffer.from(privateKey1).toString('hex');
    const wallet1 = new ethers.Wallet(privateKeyHex1);
    console.log(`   Address: ${wallet1.address}`);
    
    // Method 3: Try ethers HDNode derivation
    console.log('\n3. Ethers HDNode derivation:');
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const wallet2 = hdNode.derivePath("m/44'/818'/0'/0/0"); // VeChain derivation path
    console.log(`   Address: ${wallet2.address}`);
    
    // Method 4: Try index 2, 3, etc.
    for (let i = 2; i <= 5; i++) {
        console.log(`\n${3 + i}. BIP-44 derivation (index ${i}):`);
        try {
            const privateKeyBufferI = thor.mnemonic.derivePrivateKey(words, i);
            const privateKeyI = new Uint8Array(privateKeyBufferI);
            const privateKeyHexI = '0x' + Buffer.from(privateKeyI).toString('hex');
            const walletI = new ethers.Wallet(privateKeyHexI);
            console.log(`   Address: ${walletI.address}`);
            
            if (walletI.address.toLowerCase() === '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee') {
                console.log(`\n✅ FOUND DISTRIBUTOR WALLET AT INDEX ${i}!`);
                console.log(`Private key: ${privateKeyHexI}`);
                process.exit(0);
            }
        } catch (e) {
            console.log(`   Error: ${e.message}`);
        }
    }
    
    // Check if any match
    const targetAddress = '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee';
    if (wallet0.address.toLowerCase() === targetAddress) {
        console.log('\n✅ FOUND: Default derivation matches distributor wallet');
        console.log(`Private key: ${privateKeyHex0}`);
    } else if (wallet1.address.toLowerCase() === targetAddress) {
        console.log('\n✅ FOUND: Index 1 derivation matches distributor wallet');
        console.log(`Private key: ${privateKeyHex1}`);
    } else if (wallet2.address.toLowerCase() === targetAddress) {
        console.log('\n✅ FOUND: Ethers HDNode derivation matches distributor wallet');
        console.log(`Private key: 0x${wallet2.privateKey}`);
    } else {
        console.log('\n❌ DISTRIBUTOR WALLET NOT FOUND in any standard derivation path');
        console.log('The 12-word mnemonic may not generate the distributor wallet 0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee');
    }
    
} catch (error) {
    console.log('❌ Key derivation failed:', error.message);
}