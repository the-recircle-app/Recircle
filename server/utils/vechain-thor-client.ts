/**
 * VeChain Thor Client Implementation
 * Replaces ethers.js JsonRpcProvider with proper VeChain Thor SDK
 */

import { ThorClient, VeChainProvider, VeChainPrivateKeySigner } from '@vechain/sdk-network';
import { Address } from '@vechain/sdk-core';
import { HDNodeWallet } from 'ethers';
import { getVeChainConfig } from '../../shared/vechain-config';

/**
 * Creates a VeChain Thor client for current network (testnet/mainnet)
 */
export async function createThorClient(): Promise<ThorClient> {
    const config = getVeChainConfig();
    
    for (const endpoint of config.thorEndpoints) {
        try {
            console.log(`[THOR] Attempting to connect to: ${endpoint}`);
            
            // Test the endpoint first
            const response = await fetch(`${endpoint}/v1/blocks/best`);
            if (response.ok) {
                const block = await response.json();
                console.log(`[THOR] ✅ Connected to ${endpoint}, best block: ${block.number}`);
                
                // Create VeChain provider and Thor client  
                // For read-only operations, we just need the ThorClient
                
                return ThorClient.at(endpoint);
            }
        } catch (error: any) {
            console.log(`[THOR] ❌ Failed ${endpoint}:`, error?.message || 'Unknown error');
            continue;
        }
    }
    
    throw new Error(`No working VeChain Thor ${config.network} endpoints found`);
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
        const thorClient = await createThorClient();
        const bestBlock = await thorClient.blocks.getBestBlock();
        const blockRef = bestBlock.id.slice(0, 18);
        console.log(`[THOR] ✅ Thor client working, best block: ${bestBlock}`);
        
        // Test account query
        const testAddress = Address.of('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
        const account = await thorClient.accounts.getAccount(testAddress);
        console.log(`[THOR] ✅ Account query working, balance: ${account?.balance}`);
        
    } catch (error) {
        console.error('[THOR] ❌ Thor connectivity test failed:', error);
        throw error;
    }
}