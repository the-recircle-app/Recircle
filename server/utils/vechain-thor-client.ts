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
            const response = await fetch(`${endpoint}/blocks/best`);
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
 * Get VTHO balance for an address
 * @param address - VeChain address to check VTHO balance for
 * @returns VTHO balance as a number (in VTHO units, not wei)
 */
export async function getVTHOBalance(address: string): Promise<number> {
    try {
        const thorClient = await createThorClient();
        const account = await thorClient.accounts.getAccount(Address.of(address));
        
        // VeChain energy (VTHO) has 18 decimals, same as VET
        // Convert from wei to VTHO units
        const vthoBalance = parseFloat(account.energy) / Math.pow(10, 18);
        
        console.log(`[THOR] 💰 VTHO balance for ${address}: ${vthoBalance.toFixed(2)} VTHO`);
        return vthoBalance;
        
    } catch (error) {
        console.error(`[THOR] ❌ Failed to get VTHO balance for ${address}:`, error);
        return 0; // Return 0 if we can't check balance (assume needs sponsoring)
    }
}

/**
 * Check if user needs transaction sponsoring based on VTHO balance
 * Users with less than 10 VTHO are considered to need sponsoring
 * @param address - User's VeChain address
 * @returns true if user needs sponsoring, false if they have enough VTHO
 */
export async function shouldSponsorUser(address: string): Promise<boolean> {
    const vthoBalance = await getVTHOBalance(address);
    const minimumVTHO = 10; // Users need at least 10 VTHO to pay their own fees
    
    const needsSponsoring = vthoBalance < minimumVTHO;
    console.log(`[THOR] 🤔 User ${address} needs sponsoring: ${needsSponsoring} (balance: ${vthoBalance.toFixed(2)} VTHO)`);
    
    return needsSponsoring;
}

/**
 * Test VeChain Thor connectivity
 */
export async function testThorConnectivity(): Promise<void> {
    try {
        const thorClient = await createThorClient();
        const bestBlockRef = await thorClient.blocks.getBestBlockRef();
        console.log(`[THOR] ✅ Thor client working, best block ref: ${bestBlockRef}`);
        
        // Test account query
        const testAddress = Address.of('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
        const account = await thorClient.accounts.getAccount(testAddress);
        console.log(`[THOR] ✅ Account query working, VET balance: ${account?.balance}`);
        
        // Test VTHO balance checking
        await getVTHOBalance('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
        
    } catch (error) {
        console.error('[THOR] ❌ Thor connectivity test failed:', error);
        throw error;
    }
}