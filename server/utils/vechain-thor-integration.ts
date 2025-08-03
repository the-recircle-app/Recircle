/**
 * VeChain Thor SDK Integration - REAL BLOCKCHAIN TRANSACTIONS
 * Replaces ethers.js with proper VeChain Thor protocol
 */

import { ThorClient, VeChainProvider, VeChainSigner } from '@vechain/sdk-network';
import { Address, Transaction, Clause, VeChainPrivateKeySigner } from '@vechain/sdk-core';
import { HDNodeWallet } from 'ethers';

// VeChain testnet Thor REST API endpoints (confirmed working)
const THOR_TESTNET_ENDPOINTS = [
    'https://testnet.veblocks.net',
    'https://sync-testnet.veblocks.net'
];

// VeBetterDAO contract addresses
const VEBETTERDAO_CONTRACTS = {
    X2EARN_REWARDS_POOL: '0x2917dE6395de0522b3c8b894a5B0f8f1D85E67B0',
    B3TR_TOKEN: '0x37b56c81c4d3f331e7f32b9e4fe8f4eaaf1f3e9b'
};

export class VeChainThorClient {
    private thorClient: ThorClient;
    private signer: VeChainPrivateKeySigner;
    private provider: VeChainProvider;

    constructor(thorClient: ThorClient, signer: VeChainPrivateKeySigner) {
        this.thorClient = thorClient;
        this.signer = signer;
        this.provider = new VeChainProvider(thorClient, signer, false);
    }

    /**
     * Create Thor client with working testnet endpoint
     */
    static async create(mnemonic: string): Promise<VeChainThorClient> {
        // Create signer from mnemonic
        const wallet = HDNodeWallet.fromPhrase(mnemonic);
        const privateKeyBuffer = Buffer.from(wallet.privateKey.slice(2), 'hex');
        const signer = new VeChainPrivateKeySigner(privateKeyBuffer);

        // Test endpoints to find working one
        for (const endpoint of THOR_TESTNET_ENDPOINTS) {
            try {
                console.log(`[THOR] Testing endpoint: ${endpoint}`);
                
                const response = await fetch(`${endpoint}/v1/blocks/best`);
                if (response.ok) {
                    const block = await response.json();
                    console.log(`[THOR] ✅ Connected to ${endpoint}, block: ${block.number}`);
                    
                    const thorClient = ThorClient.at(endpoint);
                    return new VeChainThorClient(thorClient, signer);
                }
            } catch (error) {
                console.log(`[THOR] ❌ Failed ${endpoint}: ${error.message}`);
                continue;
            }
        }
        
        throw new Error('No working VeChain Thor testnet endpoints found');
    }

    /**
     * Distribute B3TR tokens using real VeChain transactions
     */
    async distributeB3TR(recipientAddress: string, amount: string): Promise<{
        txId: string;
        receipt: any;
        explorerUrl: string;
    }> {
        try {
            console.log(`[THOR] Distributing ${amount} B3TR to ${recipientAddress}`);

            // Create transaction clause for B3TR transfer
            const transferClause: Clause = {
                to: VEBETTERDAO_CONTRACTS.B3TR_TOKEN,
                value: '0x0',
                data: this.encodeBEP20Transfer(recipientAddress, amount)
            };

            // Build transaction
            const bestBlock = await this.thorClient.blocks.getBestBlock();
            const transaction = new Transaction({
                chainTag: bestBlock.id.slice(-2),
                blockRef: bestBlock.id.slice(0, 18),
                expiration: 1000,
                clauses: [transferClause],
                gasPriceCoef: 0,
                gas: '200000',
                dependsOn: null,
                nonce: Date.now().toString()
            });

            // Sign and send transaction
            const signedTx = await this.signer.signTransaction(transaction);
            const txResponse = await this.thorClient.transactions.sendTransaction(signedTx);
            
            console.log(`[THOR] ✅ Transaction sent: ${txResponse.id}`);

            // Wait for receipt
            const receipt = await this.thorClient.transactions.waitForTransaction(txResponse.id);
            
            return {
                txId: txResponse.id,
                receipt: receipt,
                explorerUrl: `https://explore-testnet.vechain.org/transactions/${txResponse.id}`
            };

        } catch (error) {
            console.error('[THOR] ❌ Transaction failed:', error);
            throw error;
        }
    }

    /**
     * Encode BEP20 transfer function call
     */
    private encodeBEP20Transfer(to: string, amount: string): string {
        // transfer(address,uint256) = 0xa9059cbb
        const methodId = '0xa9059cbb';
        const addressPadded = to.slice(2).padStart(64, '0');
        const amountHex = parseInt(amount).toString(16).padStart(64, '0');
        return methodId + addressPadded + amountHex;
    }

    /**
     * Get account balance
     */
    async getBalance(address: string): Promise<string> {
        const account = await this.thorClient.accounts.getAccount(Address.of(address));
        return account.balance;
    }

    /**
     * Test connectivity
     */
    async testConnection(): Promise<void> {
        const bestBlock = await this.thorClient.blocks.getBestBlock();
        console.log(`[THOR] Connection test successful, block: ${bestBlock.number}`);
    }
}

/**
 * Initialize VeChain Thor client for real blockchain transactions
 */
export async function initializeVeChainThor(): Promise<VeChainThorClient | null> {
    try {
        const mnemonic = process.env.VECHAIN_MNEMONIC || process.env.DISTRIBUTOR_MNEMONIC;
        if (!mnemonic) {
            console.log('[THOR] No mnemonic found - using mock transactions');
            return null;
        }

        const thorClient = await VeChainThorClient.create(mnemonic);
        await thorClient.testConnection();
        
        console.log('[THOR] ✅ Real VeChain Thor integration active');
        return thorClient;

    } catch (error) {
        console.error('[THOR] ❌ Failed to initialize Thor client:', error);
        return null;
    }
}