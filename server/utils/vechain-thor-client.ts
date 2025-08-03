/**
 * VeChain Thor Client Implementation
 * Replaces ethers.js JsonRpcProvider with proper VeChain Thor SDK
 */

import { ThorClient, VeChainProvider } from '@vechain/sdk-network';
import { Address, TransactionHandler, VeChainPrivateKeySigner } from '@vechain/sdk-core';
import { HDNodeWallet } from 'ethers';

// VeChain testnet Thor REST API endpoints (working!)
const THOR_TESTNET_ENDPOINTS = [
    'https://testnet.veblocks.net',
    'https://sync-testnet.veblocks.net'
];

/**
 * Creates a VeChain Thor client for testnet
 */
export async function createThorTestnetClient(): Promise<ThorClient> {
    for (const endpoint of THOR_TESTNET_ENDPOINTS) {
        try {
            console.log(`[THOR] Attempting to connect to: ${endpoint}`);
            
            // Test the endpoint first
            const response = await fetch(`${endpoint}/v1/blocks/best`);
            if (response.ok) {
                const block = await response.json();
                console.log(`[THOR] ✅ Connected to ${endpoint}, best block: ${block.number}`);
                
                // Create VeChain provider and Thor client
                const provider = new VeChainProvider(
                    ThorClient.at(endpoint),
                    new VeChainPrivateKeySigner(Buffer.alloc(32, 0)), // Dummy signer for read operations
                    false // Disable fee delegation
                );
                
                return ThorClient.at(endpoint);
            }
        } catch (error) {
            console.log(`[THOR] ❌ Failed ${endpoint}:`, error.message);
            continue;
        }
    }
    
    throw new Error('No working VeChain Thor testnet endpoints found');
}

/**
 * Creates a VeChain signer from mnemonic for transactions
 */
export function createThorSigner(mnemonic: string): VeChainPrivateKeySigner {
    const wallet = HDNodeWallet.fromPhrase(mnemonic);
    const privateKeyBuffer = Buffer.from(wallet.privateKey.slice(2), 'hex');
    return new VeChainPrivateKeySigner(privateKeyBuffer);
}

/**
 * Test VeChain Thor connectivity
 */
export async function testThorConnectivity(): Promise<void> {
    try {
        const thorClient = await createThorTestnetClient();
        const bestBlock = await thorClient.blocks.getBestBlock();
        console.log(`[THOR] ✅ Thor client working, best block: ${bestBlock.number}`);
        
        // Test account query
        const testAddress = Address.of('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
        const account = await thorClient.accounts.getAccount(testAddress);
        console.log(`[THOR] ✅ Account query working, balance: ${account.balance}`);
        
    } catch (error) {
        console.error('[THOR] ❌ Thor connectivity test failed:', error);
        throw error;
    }
}