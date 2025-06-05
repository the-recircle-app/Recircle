/**
 * VeBetterDAO Reward Distribution Integration
 * Direct integration with VeBetterDAO's smart contract system using your registered APP_ID
 */

import { ethers } from 'ethers';

// VeBetterDAO Configuration from environment
const VEBETTERDAO_CONFIG = {
    APP_ID: process.env.APP_ID || '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
    X2EARN_APPS: process.env.X2EARN_APPS || '0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153',
    X2EARN_REWARDS_POOL: process.env.X2EARN_REWARDS_POOL || '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
    B3TR_TOKEN: process.env.TOKEN_ADDRESS || '0x0dd62dac6abb12bd62a58469b34f4d986697ef19',
    REWARD_DISTRIBUTOR: process.env.REWARD_DISTRIBUTOR_WALLET || '0x15D009B3A5811fdE66F19b2db1D40172d53E5653',
    RPC_URL: process.env.VECHAIN_RPC_URL || 'https://sync-testnet.vechain.org',
    NETWORK: process.env.VECHAIN_NETWORK || 'testnet'
};

// VeBetterDAO X2EarnRewardsPool ABI
const REWARDS_POOL_ABI = [
    "function distributeReward(bytes32 appId, address recipient, uint256 amount) external returns (bool)",
    "function distributeRewardWithProof(bytes32 appId, address recipient, uint256 amount, string[] calldata proofTypes, string[] calldata proofValues) external returns (bool)",
    "function distributeRewardWithProofAndMetadata(bytes32 appId, address recipient, uint256 amount, string[] calldata proofTypes, string[] calldata proofValues, string[] calldata impactTypes, string[] calldata impactValues) external returns (bool)",
    "function getAppBalance(bytes32 appId) external view returns (uint256)",
    "function isAppAdmin(bytes32 appId, address admin) external view returns (bool)"
];

export interface RewardDistributionData {
    recipient: string;
    amount: number; // B3TR amount
    receiptData: {
        storeName: string;
        category: string;
        totalAmount: number;
        confidence: number;
        ipfsHash?: string;
    };
    environmentalImpact: {
        co2SavedGrams: number;
        sustainabilityCategory: string;
    };
}

/**
 * Distribute B3TR rewards through VeBetterDAO's smart contract system
 */
export async function distributeVeBetterDAOReward(rewardData: RewardDistributionData): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
}> {
    try {
        console.log(`[VEBETTERDAO] Distributing ${rewardData.amount} B3TR to ${rewardData.recipient}`);
        
        // Check if we're in test mode
        if (process.env.TEST_MODE === 'true') {
            console.log('[VEBETTERDAO] TEST MODE - Simulating reward distribution');
            return {
                success: true,
                txHash: '0x' + Math.random().toString(16).substring(2, 66)
            };
        }

        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(VEBETTERDAO_CONFIG.RPC_URL);
        
        const mnemonic = process.env.TESTNET_MNEMONIC;
        if (!mnemonic) {
            throw new Error('TESTNET_MNEMONIC required for blockchain transactions');
        }
        
        const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
        
        // Verify wallet is the authorized reward distributor
        if (wallet.address.toLowerCase() !== VEBETTERDAO_CONFIG.REWARD_DISTRIBUTOR.toLowerCase()) {
            console.warn(`[VEBETTERDAO] Wallet mismatch: ${wallet.address} vs ${VEBETTERDAO_CONFIG.REWARD_DISTRIBUTOR}`);
        }
        
        // Connect to VeBetterDAO rewards pool contract
        const rewardsPool = new ethers.Contract(
            VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL,
            REWARDS_POOL_ABI,
            wallet
        );
        
        // Prepare proof data
        const proofTypes = [
            'receipt_validation',
            'store_verification', 
            'sustainability_category',
            'ai_confidence_score'
        ];
        
        const proofValues = [
            rewardData.receiptData.ipfsHash || 'validated',
            rewardData.receiptData.storeName,
            rewardData.receiptData.category,
            rewardData.receiptData.confidence.toString()
        ];
        
        // Prepare environmental impact metadata
        const impactTypes = [
            'co2_saved_grams',
            'purchase_amount_cents',
            'sustainability_score'
        ];
        
        const impactValues = [
            rewardData.environmentalImpact.co2SavedGrams.toString(),
            rewardData.receiptData.totalAmount.toString(),
            '95' // High sustainability score for validated receipts
        ];
        
        // Convert B3TR amount to wei (18 decimals)
        const rewardAmountWei = ethers.parseEther(rewardData.amount.toString());
        
        console.log(`[VEBETTERDAO] Calling distributeRewardWithProofAndMetadata:`);
        console.log(`  - App ID: ${VEBETTERDAO_CONFIG.APP_ID}`);
        console.log(`  - Recipient: ${rewardData.recipient}`);
        console.log(`  - Amount: ${rewardData.amount} B3TR (${rewardAmountWei} wei)`);
        console.log(`  - Store: ${rewardData.receiptData.storeName}`);
        console.log(`  - Category: ${rewardData.receiptData.category}`);
        
        // Execute reward distribution with comprehensive proof and impact data
        const tx = await rewardsPool.distributeRewardWithProofAndMetadata(
            VEBETTERDAO_CONFIG.APP_ID,
            rewardData.recipient,
            rewardAmountWei,
            proofTypes,
            proofValues,
            impactTypes,
            impactValues,
            {
                gasLimit: 300000, // Set reasonable gas limit
                gasPrice: ethers.parseUnits('1', 'gwei')
            }
        );
        
        console.log(`[VEBETTERDAO] Transaction submitted: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        
        console.log(`[VEBETTERDAO] ✅ Reward distributed successfully!`);
        console.log(`  - Transaction: ${receipt.hash}`);
        console.log(`  - Block: ${receipt.blockNumber}`);
        console.log(`  - Gas used: ${receipt.gasUsed}`);
        
        return {
            success: true,
            txHash: receipt.hash
        };
        
    } catch (error) {
        console.error('[VEBETTERDAO] Reward distribution failed:', error);
        
        let errorMessage = error.message;
        
        if (error.message.includes('insufficient funds')) {
            errorMessage = 'App needs B3TR tokens for distribution - contact VeBetterDAO team';
        } else if (error.message.includes('unauthorized')) {
            errorMessage = 'Reward distributor not authorized for this app';
        } else if (error.message.includes('network')) {
            errorMessage = 'VeChain network connection failed';
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Check VeBetterDAO app balance and authorization status
 */
export async function checkVeBetterDAOStatus(): Promise<{
    appBalance: string;
    isAuthorized: boolean;
    error?: string;
}> {
    try {
        const provider = new ethers.JsonRpcProvider(VEBETTERDAO_CONFIG.RPC_URL);
        const mnemonic = process.env.TESTNET_MNEMONIC;
        
        if (!mnemonic) {
            return { appBalance: '0', isAuthorized: false, error: 'Mnemonic required' };
        }
        
        const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
        const rewardsPool = new ethers.Contract(
            VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL,
            REWARDS_POOL_ABI,
            wallet
        );
        
        // Check app balance
        const balance = await rewardsPool.getAppBalance(VEBETTERDAO_CONFIG.APP_ID);
        const balanceFormatted = ethers.formatEther(balance);
        
        // Check authorization (simplified check)
        const isAuthorized = wallet.address.toLowerCase() === VEBETTERDAO_CONFIG.REWARD_DISTRIBUTOR.toLowerCase();
        
        console.log(`[VEBETTERDAO] Status check - Balance: ${balanceFormatted} B3TR, Authorized: ${isAuthorized}`);
        
        return {
            appBalance: balanceFormatted,
            isAuthorized,
        };
        
    } catch (error) {
        console.error('[VEBETTERDAO] Status check failed:', error);
        return {
            appBalance: '0',
            isAuthorized: false,
            error: error.message
        };
    }
}

/**
 * Integration helper for existing reward distribution
 */
export async function integrateWithExistingRewards(
    userId: number,
    walletAddress: string,
    receiptData: any,
    calculatedReward: number
): Promise<boolean> {
    try {
        // Prepare reward distribution data
        const rewardData: RewardDistributionData = {
            recipient: walletAddress,
            amount: calculatedReward,
            receiptData: {
                storeName: receiptData.storeName || 'Unknown Store',
                category: receiptData.category || 'sustainable_purchase',
                totalAmount: receiptData.totalAmount || 0,
                confidence: receiptData.confidence || 95,
                ipfsHash: receiptData.ipfsHash
            },
            environmentalImpact: {
                co2SavedGrams: calculateCO2Impact(receiptData),
                sustainabilityCategory: receiptData.category || 'circular_economy'
            }
        };
        
        const result = await distributeVeBetterDAOReward(rewardData);
        
        if (result.success) {
            console.log(`[VEBETTERDAO] Successfully distributed ${calculatedReward} B3TR to user ${userId}`);
            console.log(`[VEBETTERDAO] Transaction: ${result.txHash}`);
            return true;
        } else {
            console.error(`[VEBETTERDAO] Distribution failed for user ${userId}: ${result.error}`);
            return false;
        }
        
    } catch (error) {
        console.error('[VEBETTERDAO] Integration error:', error);
        return false;
    }
}

/**
 * Calculate environmental impact based on receipt data
 */
function calculateCO2Impact(receiptData: any): number {
    const amount = receiptData.totalAmount || 0;
    const category = receiptData.category || '';
    
    // CO2 savings calculations (grams per dollar spent)
    if (category.includes('thrift') || category.includes('secondhand')) {
        return Math.round((amount / 100) * 230); // 2.3kg CO2 per $10 thrift shopping
    } else if (category.includes('gaming') || category.includes('preowned')) {
        return Math.round((amount / 100) * 150); // 1.5kg CO2 per $10 pre-owned gaming
    } else if (category.includes('rideshare') || category.includes('transport')) {
        return Math.round((amount / 100) * 50); // 0.5kg CO2 per $10 rideshare vs private car
    } else if (category.includes('ev') || category.includes('electric')) {
        return Math.round((amount / 100) * 300); // 3kg CO2 per $10 EV vs gas car
    }
    
    return Math.round((amount / 100) * 100); // Default 1kg CO2 per $10
}

// Export configuration for debugging
export const VeBetterDAOConfig = VEBETTERDAO_CONFIG;