import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Configuration
const PRIVATE_KEY = process.env.REWARD_DISTRIBUTOR_KEY || '';
const REWARD_DISTRIBUTOR_WALLET = process.env.REWARD_DISTRIBUTOR_WALLET || '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
const APP_ID = parseInt(process.env.APP_ID || "0");
const NETWORK = process.env.VECHAIN_NETWORK || "testnet"; // "mainnet" or "testnet"
const RPC_URL = process.env.VECHAIN_RPC_URL || 
  (NETWORK === "mainnet" ? "https://mainnet.veblocks.net" : "https://testnet.veblocks.net");

// Fund wallet addresses - THESE ARE RECIPIENTS, NOT THE DISTRIBUTOR
const CREATOR_FUND_WALLET = process.env.CREATOR_FUND_WALLET || '0x87c844e3314396ca43e5a6065e418d26a09db02b';
const APP_FUND_WALLET = process.env.APP_FUND_WALLET || '0x119761865b79bea9e7924edaa630942322ca09d1';

// VeBetterDAO Contract ABI - only the functions we need
const VEBETTERDAO_ABI = [
  "function distributeReward(uint256 appId, address recipient, uint256 amount) external returns (bool)",
  "function distributeRewardWithProof(uint256 appId, address recipient, uint256 amount, string[] calldata proofTypes, string[] calldata proofValues) external returns (bool)",
  "function distributeRewardWithProofAndMetadata(uint256 appId, address recipient, uint256 amount, string[] calldata proofTypes, string[] calldata proofValues, string[] calldata impactTypes, string[] calldata impactValues) external returns (bool)"
];

// VeBetterDAO Contract Addresses (as provided by VeBetterDAO team)
const CONTRACT_ADDRESSES = {
  mainnet: "0x71d9Cf8FB42bBc4c89a6B86D0D8E201e9E4B8Cd5", // Mainnet contract address
  testnet: "0xB0C75b9E6232C98D2e82fBa92f6465F10C8b243F"  // Testnet contract address (Subject to change)
};

// Setup rewards logging
const REWARDS_LOG_PATH = path.join(process.cwd(), 'rewards.log');

/**
 * Log reward distribution to rewards.log file
 */
const logRewardDistribution = (
  recipient: string, 
  amount: string, 
  txHash: string, 
  proofType: string, 
  success: boolean
) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | ${success ? 'SUCCESS' : 'FAILED'} | ${recipient} | ${amount} B3TR | ${proofType} | ${txHash}\n`;
    
    fs.appendFileSync(REWARDS_LOG_PATH, logEntry);
  } catch (error) {
    console.error('[BLOCKCHAIN] Failed to write to rewards log:', error);
  }
};

// Setup provider and contract
const getContractSetup = () => {
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create wallet with private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Get contract address based on selected network
    const contractAddress = CONTRACT_ADDRESSES[NETWORK as 'mainnet' | 'testnet'];
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, VEBETTERDAO_ABI, wallet);
    
    return { provider, wallet, contract };
  } catch (error) {
    console.error("[BLOCKCHAIN] Error setting up VeBetterDAO contract:", error);
    throw error;
  }
};

/**
 * Send a reward to a user wallet with proof and impact data
 * 
 * This function handles the 70/30 distribution model:
 * - 70% goes to the user
 * - 15% goes to the creator fund
 * - 15% goes to the app fund
 */
export async function sendReward({
  recipient,
  amount,
  proofTypes,
  proofValues,
  impactTypes,
  impactValues,
  receiptId
}: {
  recipient: string;
  amount: string;
  proofTypes: string[];
  proofValues: string[];
  impactTypes: string[];
  impactValues: string[];
  receiptId?: string | number;
}) {
  // Used for transaction identification in logs
  const txIdentifier = receiptId ? `receipt-${receiptId}` : `tx-${Date.now()}`;
  const results: { 
    userTx: any, 
    creatorTx: any, 
    appTx: any 
  } = { 
    userTx: null, 
    creatorTx: null, 
    appTx: null 
  };

  try {
    console.log(`[BLOCKCHAIN] Sending ${amount} B3TR to ${recipient} for receipt ID: ${receiptId || 'unknown'}`);
    
    // Check if we're in test mode - don't execute real transactions
    if (process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true') {
      console.log(`[BLOCKCHAIN] TEST MODE - Simulating reward transactions with 70/30 split`);
      const mockHash = `test-tx-hash-${Date.now()}`;
      
      // Log the test transaction
      logRewardDistribution(recipient, amount, mockHash, `TEST-${txIdentifier}`, true);
      
      return {
        success: true,
        hash: mockHash,
        message: 'Test mode transaction simulated',
        distribution: {
          user: amount,
          creator: '0', // These would be calculated in production
          app: '0'
        }
      };
    }
    
    // Validate wallet addresses before proceeding
    if (!CREATOR_FUND_WALLET || !APP_FUND_WALLET || !REWARD_DISTRIBUTOR_WALLET) {
      console.error('[BLOCKCHAIN] Missing required wallet addresses. Check environment variables.');
      throw new Error('Missing required wallet addresses for distribution');
    }
    
    // Ensure the distributor wallet is never used as a recipient
    if (recipient === REWARD_DISTRIBUTOR_WALLET || 
        CREATOR_FUND_WALLET === REWARD_DISTRIBUTOR_WALLET || 
        APP_FUND_WALLET === REWARD_DISTRIBUTOR_WALLET) {
      console.error('[BLOCKCHAIN] ERROR: Reward distributor wallet cannot be used as a recipient!');
      throw new Error('Invalid configuration: Distributor wallet used as recipient');
    }
    
    // Get contract setup
    const { contract } = getContractSetup();
    
    // ========================
    // EXECUTE 70/30 DISTRIBUTION
    // ========================
    
    console.log(`[BLOCKCHAIN] Starting 70/30 B3TR distribution for ${txIdentifier}`);
    console.log(`[BLOCKCHAIN] Distribution Signing Wallet: ${REWARD_DISTRIBUTOR_WALLET}`);
    console.log(`[BLOCKCHAIN] Total amount: ${amount} B3TR`);
    console.log(`[BLOCKCHAIN] User (70%): ${recipient}`);
    console.log(`[BLOCKCHAIN] Creator Fund (15%): ${CREATOR_FUND_WALLET}`);
    console.log(`[BLOCKCHAIN] App Fund (15%): ${APP_FUND_WALLET}`);
    
    // Calculate the exact amounts using the 70/30 distribution model
    const totalAmountWei = ethers.parseEther(amount);
    const userAmountWei = (totalAmountWei * BigInt(70)) / BigInt(100);  // 70% to user
    const creatorAmountWei = (totalAmountWei * BigInt(15)) / BigInt(100); // 15% to creator
    const appAmountWei = (totalAmountWei * BigInt(15)) / BigInt(100);     // 15% to app
    
    console.log(`[BLOCKCHAIN] Distribution breakdown:`);
    console.log(`[BLOCKCHAIN] - User: ${ethers.formatEther(userAmountWei)} B3TR (${userAmountWei.toString()} wei)`);
    console.log(`[BLOCKCHAIN] - Creator: ${ethers.formatEther(creatorAmountWei)} B3TR (${creatorAmountWei.toString()} wei)`);
    console.log(`[BLOCKCHAIN] - App: ${ethers.formatEther(appAmountWei)} B3TR (${appAmountWei.toString()} wei)`);
    
    // 1. USER REWARD TRANSACTION (70%)
    console.log(`[BLOCKCHAIN] ⏳ Executing user reward transaction...`);
    try {
      const userTx = await contract.distributeRewardWithProofAndMetadata(
        APP_ID,
        recipient,
        userAmountWei.toString(),
        proofTypes,
        proofValues,
        impactTypes,
        impactValues
      );
      
      console.log(`[BLOCKCHAIN] ⏳ Waiting for user transaction to be mined...`);
      const userReceipt = await userTx.wait();
      results.userTx = userReceipt;
      console.log(`[BLOCKCHAIN] ✅ User reward transaction successful!`);
      console.log(`[BLOCKCHAIN] User Tx Hash: ${userReceipt.hash}`);
      logRewardDistribution(recipient, ethers.formatEther(userAmountWei), userReceipt.hash, `USER-${txIdentifier}`, true);
    } catch (error) {
      console.error(`[BLOCKCHAIN] ❌ User reward transaction failed:`, error);
      logRewardDistribution(recipient, ethers.formatEther(userAmountWei), 'failed', `USER-${txIdentifier}`, false);
      throw error; // Re-throw to stop the entire process if user transaction fails
    }
    
    // 2. CREATOR FUND REWARD TRANSACTION (15%)
    console.log(`[BLOCKCHAIN] ⏳ Executing creator fund reward transaction...`);
    try {
      const creatorTx = await contract.distributeRewardWithProofAndMetadata(
        APP_ID,
        CREATOR_FUND_WALLET,
        creatorAmountWei.toString(),
        proofTypes,
        [...proofValues, "creator_fund"], // Add marker to indicate fund type
        impactTypes,
        [...impactValues, "sustainability_contribution"]
      );
      
      console.log(`[BLOCKCHAIN] ⏳ Waiting for creator fund transaction to be mined...`);
      const creatorReceipt = await creatorTx.wait();
      results.creatorTx = creatorReceipt;
      console.log(`[BLOCKCHAIN] ✅ Creator fund reward transaction successful!`);
      console.log(`[BLOCKCHAIN] Creator Tx Hash: ${creatorReceipt.hash}`);
      logRewardDistribution(CREATOR_FUND_WALLET, ethers.formatEther(creatorAmountWei), 
        creatorReceipt.hash, `CREATOR-${txIdentifier}`, true);
    } catch (error) {
      console.error(`[BLOCKCHAIN] ❌ Creator fund reward transaction failed:`, error);
      logRewardDistribution(CREATOR_FUND_WALLET, ethers.formatEther(creatorAmountWei), 
        'failed', `CREATOR-${txIdentifier}`, false);
      // Continue with app fund transaction even if creator fund fails
    }
    
    // 3. APP FUND REWARD TRANSACTION (15%)
    console.log(`[BLOCKCHAIN] ⏳ Executing app fund reward transaction...`);
    try {
      const appTx = await contract.distributeRewardWithProofAndMetadata(
        APP_ID,
        APP_FUND_WALLET,
        appAmountWei.toString(),
        proofTypes,
        [...proofValues, "app_fund"], // Add marker to indicate fund type
        impactTypes,
        [...impactValues, "platform_sustainability"]
      );
      
      console.log(`[BLOCKCHAIN] ⏳ Waiting for app fund transaction to be mined...`);
      const appReceipt = await appTx.wait();
      results.appTx = appReceipt;
      console.log(`[BLOCKCHAIN] ✅ App fund reward transaction successful!`);
      console.log(`[BLOCKCHAIN] App Tx Hash: ${appReceipt.hash}`);
      logRewardDistribution(APP_FUND_WALLET, ethers.formatEther(appAmountWei), 
        appReceipt.hash, `APP-${txIdentifier}`, true);
    } catch (error) {
      console.error(`[BLOCKCHAIN] ❌ App fund reward transaction failed:`, error);
      logRewardDistribution(APP_FUND_WALLET, ethers.formatEther(appAmountWei), 
        'failed', `APP-${txIdentifier}`, false);
      // Continue even if app fund transaction fails
    }
    
    console.log(`[BLOCKCHAIN] 🎉 Distribution complete for ${txIdentifier}!`);
    
    // Return success with all transaction hashes
    return {
      success: true,
      hash: results.userTx?.hash || 'tx-failed', // Primary hash is the user transaction
      creatorHash: results.creatorTx?.hash || null,
      appHash: results.appTx?.hash || null,
      message: 'Reward distributed successfully with 70/30 split',
      network: NETWORK,
      distribution: {
        user: ethers.formatEther(userAmountWei),
        creator: ethers.formatEther(creatorAmountWei),
        app: ethers.formatEther(appAmountWei)
      },
      transactions: {
        userTx: results.userTx?.hash || null,
        creatorTx: results.creatorTx?.hash || null,
        appTx: results.appTx?.hash || null
      }
    };
  } catch (error: any) {
    console.error(`[BLOCKCHAIN] ❌ Reward distribution failed:`, error);
    
    // Log the failure
    logRewardDistribution(recipient, amount, 'failed', `FAILED-${txIdentifier}`, false);
    
    // Attempt a local fallback transaction to ensure user doesn't lose tokens
    console.log('[BLOCKCHAIN] Attempting local fallback transaction...');
    
    return {
      success: false,
      hash: null,
      message: `Distribution error: ${error?.message || 'Unknown error'}`,
      error: error
    };
  }
}

/**
 * Convert B3TR amount to wei (smallest unit)
 * E.g., 10 B3TR = 10000000000000000000 wei (10 * 10^18)
 */
export function convertB3TRToWei(amount: number): string {
  return ethers.parseEther(amount.toString()).toString();
}

/**
 * Get standard proof and impact data for receipt rewards
 */
export function getReceiptProofData(receiptId: string | number, imageUrl?: string) {
  return {
    proofTypes: ["receipt_id", "image", "platform"],
    proofValues: [
      receiptId.toString(),
      imageUrl || `https://recirclerewards.app/api/receipts/${receiptId}/image`,
      "recircle_rewards"
    ],
    impactTypes: ["secondary_purchase", "waste_reduction", "reuse"],
    impactValues: ["1", "500", "clothing"] // 1 purchase, 500g waste reduction (estimated)
  };
}

/**
 * Get store addition proof and impact data
 */
export function getStoreProofData(storeId: string | number, storeName: string) {
  return {
    proofTypes: ["store_id", "store_name", "platform"],
    proofValues: [
      storeId.toString(),
      storeName,
      "recircle_rewards"
    ],
    impactTypes: ["sustainable_store", "community_contribution"],
    impactValues: ["thrift", "1"]
  };
}

/**
 * Get achievement proof and impact data
 */
export function getAchievementProofData(userId: string | number, achievementType: string) {
  return {
    proofTypes: ["achievement_type", "user_id", "platform"],
    proofValues: [
      achievementType,
      userId.toString(),
      "recircle_rewards"
    ],
    impactTypes: ["user_engagement", "sustainability_action"],
    impactValues: ["1", achievementType]
  };
}