// Test treasury wallet derivation from existing mnemonic
import { ethers } from 'ethers';
import bip39 from 'bip39';
import fs from 'fs';

console.log('[TREASURY-TEST] Testing BIP-39 derivation for treasury wallet...');

// Check if we can find the mnemonic from environment or existing config
const potentialSources = [
    process.env.VECHAIN_MNEMONIC,
    process.env.MNEMONIC,
    process.env.WALLET_MNEMONIC,
    process.env.SEED_PHRASE
];

let foundMnemonic = null;
potentialSources.forEach((source, index) => {
    if (source) {
        console.log(`[TREASURY-TEST] Found mnemonic source ${index + 1}: ${source.split(' ').slice(0, 2).join(' ')}...`);
        foundMnemonic = source;
    }
});

if (!foundMnemonic) {
    console.log('[TREASURY-TEST] ❌ No mnemonic found in any environment variable');
    console.log('[TREASURY-TEST] Checking wallet configuration files...');
    
    // Check if there's a wallet config file
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const mnemonicMatch = envContent.match(/MNEMONIC[^=]*=(.+)/i);
        if (mnemonicMatch) {
            foundMnemonic = mnemonicMatch[1].trim().replace(/['"]/g, '');
            console.log('[TREASURY-TEST] Found mnemonic in .env file');
        }
    }
}

if (foundMnemonic) {
    console.log('[TREASURY-TEST] Testing wallet derivation...');
    
    try {
        // Test standard VeChain derivation path
        const hdNode = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(foundMnemonic));
        const standardWallet = hdNode.derivePath("m/44'/818'/0'/0/0");
        
        console.log('[TREASURY-TEST] Standard VeChain wallet:', standardWallet.address);
        console.log('[TREASURY-TEST] Expected treasury:', '0x15d009b3a5811fde66f19b2db1d40172d53e5653');
        console.log('[TREASURY-TEST] Expected distributor:', '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee');
        
        // Check if this matches either expected address
        const matchesTreasury = standardWallet.address.toLowerCase() === '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
        const matchesDistributor = standardWallet.address.toLowerCase() === '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee';
        
        console.log('[TREASURY-TEST] Standard derivation matches treasury:', matchesTreasury);
        console.log('[TREASURY-TEST] Standard derivation matches distributor:', matchesDistributor);
        
        if (matchesTreasury) {
            console.log('[TREASURY-TEST] ✅ SUCCESS: Standard derivation gives us the treasury wallet!');
            console.log('[TREASURY-TEST] Treasury wallet has 26.59K B3TR tokens ready to transfer');
        } else if (matchesDistributor) {
            console.log('[TREASURY-TEST] ⚠️  Standard derivation gives us distributor wallet (may be empty)');
            console.log('[TREASURY-TEST] Need different derivation path for treasury wallet');
        } else {
            console.log('[TREASURY-TEST] ❌ Standard derivation matches neither wallet');
            
            // Try alternative derivation paths
            const alternativePaths = [
                "m/44'/818'/0'/0/1",
                "m/44'/60'/0'/0/0",
                "m/44'/60'/0'/0/1", 
                "m/44'/818'/1'/0/0"
            ];
            
            console.log('[TREASURY-TEST] Trying alternative derivation paths...');
            alternativePaths.forEach(path => {
                const altWallet = hdNode.derivePath(path);
                console.log(`[TREASURY-TEST] Path ${path}: ${altWallet.address}`);
                
                if (altWallet.address.toLowerCase() === '0x15d009b3a5811fde66f19b2db1d40172d53e5653') {
                    console.log(`[TREASURY-TEST] ✅ FOUND TREASURY WALLET with path: ${path}`);
                }
                if (altWallet.address.toLowerCase() === '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee') {
                    console.log(`[TREASURY-TEST] ✅ FOUND DISTRIBUTOR WALLET with path: ${path}`);
                }
            });
        }
        
    } catch (error) {
        console.log('[TREASURY-TEST] ❌ Error deriving wallet:', error.message);
    }
} else {
    console.log('[TREASURY-TEST] ❌ No mnemonic available for testing');
    console.log('[TREASURY-TEST] Available environment variables:', Object.keys(process.env).filter(key => key.includes('MNEMONIC') || key.includes('SEED') || key.includes('WALLET')));
}