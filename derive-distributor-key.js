#!/usr/bin/env node

/**
 * Derive private key from distributor mnemonic for VeBetterDAO role separation
 */

import { ethers } from 'ethers';
import * as bip39 from 'bip39';

async function deriveDistributorKey() {
    try {
        // Distributor mnemonic provided by user
        const distributorMnemonic = "thank bomb dinosaur leopard civil afford giraffe happy artwork pledge van judge";
        const expectedAddress = '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee';
        
        console.log('Deriving distributor wallet using BIP-39 method...');
        console.log('Expected address:', expectedAddress);
        
        // Validate mnemonic first
        if (!bip39.validateMnemonic(distributorMnemonic)) {
            console.log('❌ Invalid mnemonic phrase!');
            return;
        }
        console.log('✅ Mnemonic is valid');
        
        // Generate seed from mnemonic
        const seed = bip39.mnemonicToSeedSync(distributorMnemonic);
        console.log('Seed generated from mnemonic');
        
        // Try different derivation paths that VeWorld might use
        const derivationPaths = [
            "m/44'/818'/0'/0/0",     // VeChain standard path
            "m/44'/60'/0'/0/0",      // Ethereum standard path  
            "m/44'/818'/0'/0/1",     // VeChain path index 1
            "m/44'/60'/0'/0/1",      // Ethereum path index 1
            "m/44'/818'/1'/0/0",     // VeChain account 1
            "m/44'/60'/1'/0/0",      // Ethereum account 1
            "m/44'/818'/0'/0",       // VeChain without last index
            "m/44'/60'/0'/0",        // Ethereum without last index
        ];
        
        let foundMatch = false;
        
        // Create HD wallet from seed
        const masterNode = ethers.HDNodeWallet.fromSeed(seed);
        
        for (let i = 0; i < derivationPaths.length; i++) {
            try {
                const path = derivationPaths[i];
                console.log(`\nTrying derivation path: ${path}`);
                
                // Derive wallet from master node
                const wallet = masterNode.derivePath(path);
                
                console.log('Derived Address:', wallet.address);
                
                if (wallet.address.toLowerCase() === expectedAddress.toLowerCase()) {
                    console.log('✅ MATCH FOUND!');
                    console.log('\n=== DISTRIBUTOR WALLET INFO ===');
                    console.log('Address:', wallet.address);
                    console.log('Private Key:', wallet.privateKey);
                    console.log('Derivation Path:', path);
                    console.log('Mnemonic:', distributorMnemonic);
                    
                    // Output environment variable format
                    console.log('\n=== ENVIRONMENT VARIABLES ===');
                    console.log(`DISTRIBUTOR_PRIVATE_KEY=${wallet.privateKey}`);
                    console.log(`VECHAIN_PRIVATE_KEY=${wallet.privateKey}`);
                    
                    foundMatch = true;
                    break;
                }
            } catch (error) {
                console.log(`Error with path ${derivationPaths[i]}:`, error.message);
            }
        }
        
        if (!foundMatch) {
            console.log('\n❌ No matching derivation path found!');
            console.log('Trying additional indexes...');
            
            // Try multiple indexes for VeChain path
            for (let accountIndex = 0; accountIndex < 10; accountIndex++) {
                for (let addressIndex = 0; addressIndex < 10; addressIndex++) {
                    try {
                        const path = `m/44'/818'/0'/${accountIndex}/${addressIndex}`;
                        const wallet = masterNode.derivePath(path);
                        
                        if (wallet.address.toLowerCase() === expectedAddress.toLowerCase()) {
                            console.log('✅ MATCH FOUND!');
                            console.log('\n=== DISTRIBUTOR WALLET INFO ===');
                            console.log('Address:', wallet.address);
                            console.log('Private Key:', wallet.privateKey);
                            console.log('Derivation Path:', path);
                            
                            // Output environment variable format
                            console.log('\n=== ENVIRONMENT VARIABLES ===');
                            console.log(`DISTRIBUTOR_PRIVATE_KEY=${wallet.privateKey}`);
                            console.log(`VECHAIN_PRIVATE_KEY=${wallet.privateKey}`);
                            
                            foundMatch = true;
                            break;
                        }
                    } catch (error) {
                        // Continue trying
                    }
                }
                if (foundMatch) break;
            }
        }
        
        if (!foundMatch) {
            console.log('\n❌ Still no match found!');
            console.log('Please double-check the mnemonic phrase or provide the private key directly.');
            
            // Show default derivation for reference
            const defaultWallet = masterNode.derivePath("m/44'/818'/0'/0/0");
            console.log('\nDefault VeChain derivation result:');
            console.log('Address:', defaultWallet.address);
            console.log('Private Key:', defaultWallet.privateKey);
        }
        
    } catch (error) {
        console.error('Error deriving distributor key:', error);
    }
}

deriveDistributorKey();