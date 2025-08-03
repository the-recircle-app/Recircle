/**
 * REAL BLOCKCHAIN FIX - Replace ethers.js with VeChain Thor SDK
 * This module implements actual VeChain blockchain transactions
 */

import { ThorClient } from '@vechain/sdk-network';
import { Address, Transaction, Clause, VeChainPrivateKeySigner } from '@vechain/sdk-core';
import { HDNodeWallet } from 'ethers';

// Working VeChain Thor REST API endpoints
const THOR_ENDPOINTS = [
    'https://testnet.veblocks.net',
    'https://sync-testnet.veblocks.net'
];

// VeBetterDAO contract addresses
const CONTRACTS = {
    X2EARN_REWARDS_POOL: '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
    B3TR_TOKEN: '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F'
};

/**
 * Real VeChain blockchain distribution (replaces ethers.js)
 */
export async function distributeRealVeChainB3TR(
    recipientAddress: string, 
    amount: number,
    userId: number
): Promise<{
    success: boolean;
    txId?: string;
    explorerUrl?: string;
    error?: string;
}> {
    try {
        console.log(`[REAL-BLOCKCHAIN] 🚀 Starting REAL VeChain B3TR distribution`);
        console.log(`[REAL-BLOCKCHAIN] Recipient: ${recipientAddress}`);
        console.log(`[REAL-BLOCKCHAIN] Amount: ${amount} B3TR`);

        // Get credentials
        const mnemonic = process.env.VECHAIN_MNEMONIC || process.env.DISTRIBUTOR_MNEMONIC;
        if (!mnemonic) {
            throw new Error('No VeChain mnemonic found');
        }

        // Create Thor client with first working endpoint
        const thorClient = await createThorClient();
        
        // Create signer
        const wallet = HDNodeWallet.fromPhrase(mnemonic);
        const privateKeyBuffer = Buffer.from(wallet.privateKey.slice(2), 'hex');
        const signer = new VeChainPrivateKeySigner(privateKeyBuffer);

        console.log(`[REAL-BLOCKCHAIN] Distributor wallet: ${wallet.address}`);

        // Create B3TR transfer clause
        const amountWei = (amount * 1e18).toString(); // Convert to wei
        const transferData = encodeBEP20Transfer(recipientAddress, amountWei);
        
        const clause: Clause = {
            to: CONTRACTS.B3TR_TOKEN,
            value: '0x0',
            data: transferData
        };

        // Get best block for transaction reference  
        const bestBlock = await thorClient.blocks.getBestBlock();
        
        // Build transaction
        const transaction = new Transaction({
            chainTag: parseInt(bestBlock.id.slice(-2), 16),
            blockRef: bestBlock.id.slice(0, 18),
            expiration: 1000,
            clauses: [clause],
            gasPriceCoef: 0,
            gas: '200000', 
            dependsOn: null,
            nonce: Date.now().toString()
        });

        // Sign transaction
        const signedTx = await signer.signTransaction(transaction);
        
        // Send transaction
        const txResponse = await thorClient.transactions.sendTransaction(signedTx);
        
        console.log(`[REAL-BLOCKCHAIN] ✅ Transaction sent: ${txResponse.id}`);

        return {
            success: true,
            txId: txResponse.id,
            explorerUrl: `https://explore-testnet.vechain.org/transactions/${txResponse.id}`
        };

    } catch (error) {
        console.error('[REAL-BLOCKCHAIN] ❌ Real blockchain transaction failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create Thor client with first working endpoint
 */
async function createThorClient(): Promise<ThorClient> {
    for (const endpoint of THOR_ENDPOINTS) {
        try {
            console.log(`[THOR] Testing ${endpoint}...`);
            
            const response = await fetch(`${endpoint}/v1/blocks/best`);
            if (response.ok) {
                const block = await response.json();
                console.log(`[THOR] ✅ Connected to ${endpoint}, block: ${block.number}`);
                return ThorClient.at(endpoint);
            }
        } catch (error) {
            console.log(`[THOR] ❌ Failed ${endpoint}: ${error.message}`);
            continue;
        }
    }
    throw new Error('No working Thor endpoints found');
}

/**
 * Encode BEP20 transfer function call
 */
function encodeBEP20Transfer(to: string, amount: string): string {
    // transfer(address,uint256) method signature
    const methodId = '0xa9059cbb';
    
    // Pad address to 32 bytes (remove 0x prefix)
    const addressPadded = to.slice(2).padStart(64, '0');
    
    // Convert amount to hex and pad to 32 bytes
    const amountBigInt = BigInt(amount);
    const amountHex = amountBigInt.toString(16).padStart(64, '0');
    
    return methodId + addressPadded + amountHex;
}

/**
 * Test VeChain Thor connectivity
 */
export async function testRealBlockchainConnection(): Promise<{
    working: boolean;
    endpoint?: string;
    blockNumber?: number;
    error?: string;
}> {
    try {
        const thorClient = await createThorClient();
        const bestBlock = await thorClient.blocks.getBestBlock();
        
        return {
            working: true,
            endpoint: thorClient.baseURL,
            blockNumber: bestBlock.number
        };
    } catch (error) {
        return {
            working: false,
            error: error.message
        };
    }
}