/**
 * Simple Real B3TR Distribution
 * Direct VeChain testnet distribution using VeBetterDAO contracts
 */

import { ThorClient } from '@vechain/sdk-network';
import { Transaction, Clause } from '@vechain/sdk-core';
import * as thor from 'thor-devkit';

// Real VeBetterDAO contract addresses from environment
const CONTRACTS = {
    B3TR_TOKEN: process.env.B3TR_CONTRACT_ADDRESS || '',
    X2EARN_REWARDS_POOL: process.env.X2EARNREWARDSPOOL_ADDRESS || ''
};

// Working VeChain testnet endpoints
const TESTNET_ENDPOINTS = [
    'https://testnet.veblocks.net',
    'https://sync-testnet.veblocks.net'
];

/**
 * Simple B3TR distribution using real VeChain testnet
 */
export async function distributeRealB3TR(
    recipientAddress: string,
    totalAmount: number,
    userId: number
): Promise<{
    success: boolean;
    userReward: number;
    appReward: number;
    transactions: {
        user?: string;
        app?: string;
    };
    explorerUrls: {
        user?: string;
        app?: string;
    };
    network: string;
    error?: string;
}> {
    try {
        console.log(`[REAL-B3TR] 🚀 Starting real B3TR distribution`);
        console.log(`[REAL-B3TR] Total: ${totalAmount} B3TR → User: ${totalAmount * 0.7}, App: ${totalAmount * 0.3}`);

        // Check credentials
        const privateKey = process.env.DISTRIBUTOR_PRIVATE_KEY;
        if (!privateKey || !CONTRACTS.B3TR_TOKEN || !CONTRACTS.X2EARN_REWARDS_POOL) {
            throw new Error('Missing VeBetterDAO credentials or contract addresses');
        }

        // Create Thor client
        const thorClient = new ThorClient(new URL(TESTNET_ENDPOINTS[0]));
        console.log(`[REAL-B3TR] Connected to VeChain testnet`);

        // Get distributor wallet using thor-devkit
        const distributorWallet = thor.HDNode.fromPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
        const distributorAddress = `0x${distributorWallet.address.toString('hex')}`;
        console.log(`[REAL-B3TR] Distributor: ${distributorAddress}`);

        // Calculate 70/30 split
        const userReward = totalAmount * 0.7;
        const appReward = totalAmount * 0.3;
        const appFundAddress = process.env.APP_FUND_WALLET || '0x119761865b79bea9e7924edaa630942322ca09d1';

        // Get best block
        const bestBlock = await thorClient.blocks.getBestBlock();
        console.log(`[REAL-B3TR] Using block ${bestBlock.number} as reference`);

        const results = {
            success: true,
            userReward,
            appReward,
            transactions: {} as any,
            explorerUrls: {} as any,
            network: 'vechain-testnet'
        };

        // Create B3TR transfer clause for user (70%)
        if (userReward > 0) {
            const userAmountWei = thor.units.parseEther(userReward.toString());
            
            const userClause: Clause = {
                to: CONTRACTS.B3TR_TOKEN,
                value: '0x0',
                data: thor.abi.encodeFunction({
                    name: 'transfer',
                    type: 'function',
                    inputs: [
                        { name: 'to', type: 'address' },
                        { name: 'amount', type: 'uint256' }
                    ]
                }, recipientAddress, userAmountWei)
            };

            // Create transaction
            const txBody = {
                chainTag: 0x27, // VeChain testnet
                blockRef: bestBlock.id.slice(0, 18),
                expiration: 32,
                clauses: [userClause],
                gasPriceCoef: 0,
                gas: 200000,
                dependsOn: null,
                nonce: Date.now()
            };

            const tx = new Transaction(txBody);
            const signingHash = tx.getSigningHash();
            const signature = distributorWallet.sign(signingHash);
            tx.setSignature(signature);

            // Send transaction
            const txResult = await thorClient.transactions.sendTransaction(tx);
            
            if (txResult && txResult.id) {
                results.transactions.user = txResult.id;
                results.explorerUrls.user = `https://explore-testnet.vechain.org/transactions/${txResult.id}`;
                console.log(`[REAL-B3TR] ✅ User transaction: ${txResult.id}`);
            }
        }

        // Create B3TR transfer clause for app fund (30%)
        if (appReward > 0) {
            const appAmountWei = thor.units.parseEther(appReward.toString());
            
            const appClause: Clause = {
                to: CONTRACTS.B3TR_TOKEN,
                value: '0x0',
                data: thor.abi.encodeFunction({
                    name: 'transfer',
                    type: 'function',
                    inputs: [
                        { name: 'to', type: 'address' },
                        { name: 'amount', type: 'uint256' }
                    ]
                }, appFundAddress, appAmountWei)
            };

            // Create transaction  
            const txBody = {
                chainTag: 0x27, // VeChain testnet
                blockRef: bestBlock.id.slice(0, 18),
                expiration: 32,
                clauses: [appClause],
                gasPriceCoef: 0,
                gas: 200000,
                dependsOn: null,
                nonce: Date.now() + 1
            };

            const tx = new Transaction(txBody);
            const signingHash = tx.getSigningHash();
            const signature = distributorWallet.sign(signingHash);
            tx.setSignature(signature);

            // Send transaction
            const txResult = await thorClient.transactions.sendTransaction(tx);
            
            if (txResult && txResult.id) {
                results.transactions.app = txResult.id;
                results.explorerUrls.app = `https://explore-testnet.vechain.org/transactions/${txResult.id}`;
                console.log(`[REAL-B3TR] ✅ App transaction: ${txResult.id}`);
            }
        }

        console.log(`[REAL-B3TR] 🎉 Distribution complete! User: ${userReward} B3TR, App: ${appReward} B3TR`);
        return results;

    } catch (error) {
        console.error(`[REAL-B3TR] ❌ Distribution failed:`, error);
        return {
            success: false,
            userReward: 0,
            appReward: 0,
            transactions: {},
            explorerUrls: {},
            network: 'vechain-testnet',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Test if real B3TR distribution is working
 */
export async function testRealB3TRDistribution(): Promise<boolean> {
    try {
        const privateKey = process.env.DISTRIBUTOR_PRIVATE_KEY;
        const hasContracts = CONTRACTS.B3TR_TOKEN && CONTRACTS.X2EARN_REWARDS_POOL;
        
        if (!privateKey || !hasContracts) {
            console.log('[REAL-B3TR] Missing credentials for real distribution');
            return false;
        }

        // Test connection
        const thorClient = new ThorClient(new URL(TESTNET_ENDPOINTS[0]));
        const bestBlock = await thorClient.blocks.getBestBlock();
        
        console.log(`[REAL-B3TR] ✅ Real B3TR distribution ready (block ${bestBlock.number})`);
        return true;
    } catch (error) {
        console.log(`[REAL-B3TR] ❌ Real B3TR distribution not available: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}