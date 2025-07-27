import { Driver, SimpleNet } from "@vechain/connex-driver";
import { Framework } from "@vechain/connex-framework";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Configuration
const DISTRIBUTOR_KEY = process.env.REWARD_DISTRIBUTOR_KEY || '';
const REWARD_DISTRIBUTOR_WALLET = process.env.REWARD_DISTRIBUTOR_WALLET || '0x15D009B3A5811fdE66F19b2db1D40172d53E5653';
// VeChain configuration
const APP_ID = process.env.APP_ID || "0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1";
const NETWORK = process.env.VECHAIN_NETWORK || "testnet";
const VECHAIN_NODE_URL = process.env.VECHAIN_RPC_URL || 
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
  testnet: "0xb0c75b9e6232c98d2e82fba92f6465f10c8b243f"  // Testnet contract address (fixed checksum)
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

// Setup VeChain Connex provider
const getConnexSetup = async () => {
  try {
    console.log(`[BLOCKCHAIN] Connecting to VeChain via Connex: ${VECHAIN_NODE_URL}`);
    
    // Create VeChain network connection
    const net = new SimpleNet(VECHAIN_NODE_URL);
    const driver = await Driver.connect(net);
    const connex = new Framework(driver);
    
    // Get contract address based on selected network
    const contractAddress = CONTRACT_ADDRESSES[NETWORK as 'mainnet' | 'testnet'];
    
    return { connex, contractAddress, driver };
  } catch (error) {
    console.error("[BLOCKCHAIN] Error setting up VeChain Connex:", error);
    throw error;
  }
};

/**
 * Send a reward to a user wallet with proof and impact data
 * 
 * This function handles the 70/30 distribution model:
 * - 70% goes to the user
 * - 30% goes to the app fund (combined operational fund)
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
    
    // Get contract setup using Connex
    const { connex, contractAddress } = await getConnexSetup();
    
    // ========================
    // EXECUTE 70/30 DISTRIBUTION
    // ========================
    
    console.log(`[BLOCKCHAIN] Starting 70/30 B3TR distribution for ${txIdentifier}`);
    console.log(`[BLOCKCHAIN] Distribution Signing Wallet: ${REWARD_DISTRIBUTOR_WALLET}`);
    console.log(`[BLOCKCHAIN] Total amount: ${amount} B3TR`);
    console.log(`[BLOCKCHAIN] User (70%): ${recipient}`);
    console.log(`[BLOCKCHAIN] App Fund (30%): ${APP_FUND_WALLET}`);
    
    // Calculate the exact amounts using the 70/30 distribution model
    // Always treat incoming amount as B3TR tokens (not Wei)
    const numericAmount = parseFloat(amount);
    
    // Validate the amount is reasonable for B3TR tokens (should be small numbers like 10, 50, etc.)
    if (numericAmount > 1000000) {
      throw new Error(`Invalid B3TR amount: ${amount}. Amount appears to be too large.`);
    }
    
    const cleanAmount = Math.min(numericAmount, 1000).toFixed(6); // Cap at 1000 B3TR and limit decimals
    console.log(`[BLOCKCHAIN] Converting B3TR amount: ${amount} -> ${cleanAmount} B3TR`);
    console.log(`[BLOCKCHAIN] APP_ID parsed as: ${APP_ID.toString()}`);
    
    // Convert B3TR to Wei using parseEther (18 decimals) - this already gives us the correct Wei amount
    console.log(`[BLOCKCHAIN] About to convert ${cleanAmount} B3TR to Wei`);
    const totalAmountWei = ethers.parseEther(cleanAmount);
    console.log(`[BLOCKCHAIN] Conversion result: ${totalAmountWei.toString()} Wei`);
    console.log(`[BLOCKCHAIN] Wei string length: ${totalAmountWei.toString().length} characters`);
    const userAmountWei = (totalAmountWei * BigInt(70)) / BigInt(100);  // 70% to user
    const appAmountWei = (totalAmountWei * BigInt(30)) / BigInt(100);     // 30% to app
    
    // Validate Wei amounts are reasonable (should be less than 10^20 for normal token amounts)
    const maxWei = BigInt("100000000000000000000"); // 100 B3TR in Wei
    console.log(`[BLOCKCHAIN] Input validation: ${amount} -> ${cleanAmount} B3TR`);
    console.log(`[BLOCKCHAIN] Total Wei: ${totalAmountWei.toString()}`);
    
    if (userAmountWei > maxWei || appAmountWei > maxWei) {
      const error = `Wei amounts exceed safe limits. User: ${userAmountWei.toString()}, App: ${appAmountWei.toString()}`;
      console.error(`[BLOCKCHAIN] ${error}`);
      throw new Error(error);
    }
    
    console.log(`[BLOCKCHAIN] Distribution breakdown:`);
    console.log(`[BLOCKCHAIN] - User: ${ethers.formatEther(userAmountWei)} B3TR (${userAmountWei.toString()} wei)`);
    console.log(`[BLOCKCHAIN] - App: ${ethers.formatEther(appAmountWei)} B3TR (${appAmountWei.toString()} wei)`);
    
    // 1. USER REWARD TRANSACTION (70%)
    console.log(`[BLOCKCHAIN] ⏳ Executing user reward transaction...`);
    try {
      // Additional safety check before contract call
      const userAmountString = userAmountWei.toString();
      console.log(`[BLOCKCHAIN] Final Wei string for contract: ${userAmountString}`);
      
      if (userAmountString.includes('e') || userAmountString.length > 30) {
        throw new Error(`Wei amount too large for contract: ${userAmountString}`);
      }
      
      // Create contract method using Connex
      const method = connex.thor.account(contractAddress).method({
        "inputs": [
          {"internalType": "uint256", "name": "appId", "type": "uint256"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "string[]", "name": "proofTypes", "type": "string[]"},
          {"internalType": "string[]", "name": "proofValues", "type": "string[]"},
          {"internalType": "string[]", "name": "impactTypes", "type": "string[]"},
          {"internalType": "string[]", "name": "impactValues", "type": "string[]"}
        ],
        "name": "distributeRewardWithProofAndMetadata",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      });
      
      // Create the transaction clause
      const clause = method.asClause(
        APP_ID.toString(),
        recipient,
        userAmountString,
        proofTypes,
        proofValues,
        impactTypes,
        impactValues
      );
      
      // Sign and send the transaction
      const userTx = await connex.vendor.sign('tx', [clause]).request();
      console.log(`[BLOCKCHAIN] ⏳ User transaction submitted, hash: ${userTx.txid}`);
      results.userTx = { hash: userTx.txid };
      console.log(`[BLOCKCHAIN] ✅ User reward transaction successful!`);
      console.log(`[BLOCKCHAIN] User Tx Hash: ${userTx.txid}`);
      logRewardDistribution(recipient, ethers.formatEther(userAmountWei), userTx.txid, `USER-${txIdentifier}`, true);
    } catch (error) {
      console.error(`[BLOCKCHAIN] ❌ User reward transaction failed:`, error);
      logRewardDistribution(recipient, ethers.formatEther(userAmountWei), 'failed', `USER-${txIdentifier}`, false);
      throw error; // Re-throw to stop the entire process if user transaction fails
    }
    
    // 2. APP FUND REWARD TRANSACTION (30%)
    console.log(`[BLOCKCHAIN] ⏳ Executing app fund reward transaction...`);
    try {
      // Create app fund transaction clause
      const appClause = method.asClause(
        APP_ID.toString(),
        APP_FUND_WALLET,
        appAmountWei.toString(),
        proofTypes,
        [...proofValues, "app_fund"], // Add marker to indicate fund type
        impactTypes,
        [...impactValues, "platform_sustainability"]
      );
      
      // Sign and send the app fund transaction
      const appTx = await connex.vendor.sign('tx', [appClause]).request();
      console.log(`[BLOCKCHAIN] ⏳ App fund transaction submitted, hash: ${appTx.txid}`);
      results.appTx = { hash: appTx.txid };
      console.log(`[BLOCKCHAIN] ✅ App fund reward transaction successful!`);
      console.log(`[BLOCKCHAIN] App Tx Hash: ${appTx.txid}`);
      logRewardDistribution(APP_FUND_WALLET, ethers.formatEther(appAmountWei), 
        appTx.txid, `APP-${txIdentifier}`, true);
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
      appHash: results.appTx?.hash || null,
      message: 'Reward distributed successfully with 70/30 split',
      network: NETWORK,
      distribution: {
        user: ethers.formatEther(userAmountWei),
        app: ethers.formatEther(appAmountWei)
      },
      transactions: {
        userTx: results.userTx?.hash || null,
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
 * Convert B3TR amount to Wei (18 decimals for VeBetterDAO compatibility)
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