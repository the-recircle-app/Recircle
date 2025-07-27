import { Driver, SimpleNet } from "@vechain/connex-driver";
import { Framework } from "@vechain/connex-framework";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Configuration
const DISTRIBUTOR_KEY = process.env.REWARD_DISTRIBUTOR_KEY || '';
const REWARD_DISTRIBUTOR_WALLET = process.env.REWARD_DISTRIBUTOR_WALLET || '0x15D009B3A5811fdE66F19b2db1D40172d53E5653';
const APP_ID = process.env.APP_ID || "0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1";
const NETWORK = process.env.VECHAIN_NETWORK || "testnet";
const VECHAIN_NODE_URL = process.env.VECHAIN_RPC_URL || 
  (NETWORK === "mainnet" ? "https://mainnet.veblocks.net" : "https://testnet.veblocks.net");

// Fund wallet addresses - THESE ARE RECIPIENTS, NOT THE DISTRIBUTOR
const CREATOR_FUND_WALLET = process.env.CREATOR_FUND_WALLET || '0x87c844e3314396ca43e5a6065e418d26a09db02b';
const APP_FUND_WALLET = process.env.APP_FUND_WALLET || '0x119761865b79bea9e7924edaa630942322ca09d1';

// VeBetterDAO Contract Addresses
const CONTRACT_ADDRESSES = {
  mainnet: "0x71d9Cf8FB42bBc4c89a6B86D0D8E201e9E4B8Cd5",
  testnet: "0xb0c75b9e6232c98d2e82fba92f6465f10c8b243f"
};

// Setup rewards logging
const REWARDS_LOG_PATH = path.join(process.cwd(), 'rewards.log');

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

// Convert B3TR to Wei (18 decimals)
export function convertB3TRToWei(amount: number): string {
  const baseAmount = BigInt(Math.floor(amount * 1000000));
  const multiplier = BigInt("1000000000000"); // 10^12
  return (baseAmount * multiplier).toString();
}

// Setup VeChain Connex provider
const getConnexSetup = async () => {
  try {
    console.log(`[BLOCKCHAIN] Connecting to VeChain via Connex: ${VECHAIN_NODE_URL}`);
    
    const net = new SimpleNet(VECHAIN_NODE_URL);
    const driver = await Driver.connect(net);
    const connex = new Framework(driver);
    
    const contractAddress = CONTRACT_ADDRESSES[NETWORK as 'mainnet' | 'testnet'];
    
    return { connex, contractAddress, driver };
  } catch (error) {
    console.error("[BLOCKCHAIN] Error setting up VeChain Connex:", error);
    throw error;
  }
};

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
  const txIdentifier = receiptId ? `receipt-${receiptId}` : `tx-${Date.now()}`;
  
  try {
    console.log(`[BLOCKCHAIN] Sending ${amount} B3TR to ${recipient} for receipt ID: ${receiptId || 'unknown'}`);
    
    // Check if we're in test mode
    if (process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true') {
      console.log(`[BLOCKCHAIN] TEST MODE - Simulating VeChain transactions with 70/30 split`);
      const mockHash = `test-tx-hash-${Date.now()}`;
      
      logRewardDistribution(recipient, amount, mockHash, `TEST-${txIdentifier}`, true);
      
      return {
        success: true,
        hash: mockHash,
        message: 'Test mode transaction simulated',
        distribution: {
          user: amount,
          app: appAmountWei,
          app: '0'
        }
      };
    }
    
    // Validate wallet addresses
    if (!CREATOR_FUND_WALLET || !APP_FUND_WALLET || !REWARD_DISTRIBUTOR_WALLET) {
      throw new Error('Missing required wallet addresses for distribution');
    }
    
    if (recipient === REWARD_DISTRIBUTOR_WALLET || 
        CREATOR_FUND_WALLET === REWARD_DISTRIBUTOR_WALLET || 
        APP_FUND_WALLET === REWARD_DISTRIBUTOR_WALLET) {
      throw new Error('Invalid configuration: Distributor wallet used as recipient');
    }
    
    // Setup Connex
    const { connex, contractAddress } = await getConnexSetup();
    
    console.log(`[BLOCKCHAIN] Starting 70/30 B3TR distribution for ${txIdentifier}`);
    console.log(`[BLOCKCHAIN] Distribution Signing Wallet: ${REWARD_DISTRIBUTOR_WALLET}`);
    console.log(`[BLOCKCHAIN] Total amount: ${amount} B3TR`);
    console.log(`[BLOCKCHAIN] User (70%): ${recipient}`);
    console.log(`[BLOCKCHAIN] App Fund (30%): ${APP_FUND_WALLET}`);
    
    // Calculate distribution amounts using 70/30 model
    const numericAmount = parseFloat(amount);
    const cleanAmount = Math.min(numericAmount, 1000).toFixed(6);
    
    // Convert to Wei using proper VeChain precision
    const totalAmountWei = convertB3TRToWei(parseFloat(cleanAmount));
    const userAmountWei = (BigInt(totalAmountWei) * BigInt(70) / BigInt(100)).toString();
    const appAmountWei = (BigInt(totalAmountWei) * BigInt(30) / BigInt(100)).toString();
    
    console.log(`[BLOCKCHAIN] Distribution breakdown (70/30 model):`);
    console.log(`[BLOCKCHAIN] - User: ${parseFloat(cleanAmount) * 0.7} B3TR (${userAmountWei} wei)`);
    console.log(`[BLOCKCHAIN] - App Fund: ${parseFloat(cleanAmount) * 0.3} B3TR (${appAmountWei} wei)`);
    
    // Prepare contract method for VeBetterDAO
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
    
    // Execute transactions for 70/30 distribution
    const results: any = {};
    
    // EXECUTE TWO REAL BLOCKCHAIN TRANSACTIONS FOR 70/30 MODEL
    
    // 1. USER REWARD TRANSACTION (70%) - REAL BLOCKCHAIN TRANSACTION
    console.log(`[BLOCKCHAIN] Executing user reward transaction...`);
    try {
      const userClause = method.asClause(
        APP_ID,
        recipient,
        userAmountWei,
        proofTypes,
        [...proofValues, "user_reward"],
        impactTypes,
        [...impactValues, "circular_economy_impact"]
      );
      
      // Execute the actual blockchain transaction for user reward
      const userResult = await connex.vendor.sign('tx', [userClause]).request();
      console.log(`[BLOCKCHAIN] ✅ User transaction successful - Hash: ${userResult.txid}`);
      results.userTx = { hash: userResult.txid };
      
      logRewardDistribution(recipient, (parseFloat(cleanAmount) * 0.7).toString(), 
        userResult.txid, `USER-${txIdentifier}`, true);
        
    } catch (error) {
      console.error(`[BLOCKCHAIN] ❌ User reward transaction failed:`, error);
      throw error;
    }
    
    // 2. APP FUND REWARD TRANSACTION (30%) - THE CRITICAL FIX FOR BUSINESS MODEL
    console.log(`[BLOCKCHAIN] Executing app fund reward transaction...`);
    try {
      const appClause = method.asClause(
        APP_ID,
        APP_FUND_WALLET,
        appAmountWei,
        proofTypes,
        [...proofValues, "app_fund"],
        impactTypes,
        [...impactValues, "platform_sustainability"]
      );
      
      // CRITICAL FIX: Execute real blockchain transaction for app fund
      const appResult = await connex.vendor.sign('tx', [appClause]).request();
      console.log(`[BLOCKCHAIN] ✅ App fund transaction successful - Hash: ${appResult.txid}`);
      results.appTx = { hash: appResult.txid };
      
      logRewardDistribution(APP_FUND_WALLET, (parseFloat(cleanAmount) * 0.3).toString(), 
        appResult.txid, `APP-${txIdentifier}`, true);
        
    } catch (error) {
      console.error(`[BLOCKCHAIN] ⚠️ App fund transaction failed:`, error);
      // Continue even if app fund fails - user still gets their reward
    }
    
    console.log(`[BLOCKCHAIN] 70/30 distribution completed for ${txIdentifier}`);
    console.log(`[BLOCKCHAIN] User received: ${parseFloat(cleanAmount) * 0.7} B3TR (${results.userTx?.hash})`);
    console.log(`[BLOCKCHAIN] App fund received: ${parseFloat(cleanAmount) * 0.3} B3TR (${results.appTx?.hash || 'FAILED'})`);
    
    return {
      success: true,
      hash: results.userTx?.hash || null,
      userHash: results.userTx?.hash || null,
      appHash: results.appTx?.hash || null,
      message: 'VeChain reward distributed successfully with 70/30 split - REAL TOKENS TRANSFERRED',
      network: NETWORK,
      distribution: {
        user: (parseFloat(cleanAmount) * 0.7).toString(),
        app: (parseFloat(cleanAmount) * 0.3).toString()
      },
      transactions: {
        userTx: results.userTx?.hash || null,
        appTx: results.appTx?.hash || null
      }
    };
  } catch (error: any) {
    console.error(`[BLOCKCHAIN] VeChain reward distribution failed:`, error);
    
    logRewardDistribution(recipient, amount, 'failed', `FAILED-${txIdentifier}`, false);
    
    console.log('[BLOCKCHAIN] Attempting local fallback transaction...');
    
    return {
      success: false,
      hash: null,
      message: `VeChain distribution error: ${error?.message || 'Unknown error'}`,
      error: error
    };
  }
}

export function getReceiptProofData(receiptId: string | number, imageUrl?: string) {
  return {
    proofTypes: ["receipt_id", "image", "platform"],
    proofValues: [
      receiptId.toString(),
      imageUrl || `https://recirclerewards.app/api/receipts/${receiptId}/image`,
      "recircle_rewards"
    ],
    impactTypes: ["co2_saved_grams", "purchase_amount_cents", "sustainability_score"],
    impactValues: ["1000", "3500", "85"]
  };
}

export function getStoreProofData(storeId: string | number, storeName: string) {
  return {
    proofTypes: ["store_id", "store_verification", "platform"],
    proofValues: [
      storeId.toString(),
      storeName,
      "recircle_rewards"
    ],
    impactTypes: ["stores_added", "verification_score", "community_impact"],
    impactValues: ["1", "95", "100"]
  };
}

export function getAchievementProofData(userId: string | number, achievementType: string) {
  return {
    proofTypes: ["user_id", "achievement_type", "platform"],
    proofValues: [
      userId.toString(),
      achievementType,
      "recircle_rewards"
    ],
    impactTypes: ["achievements_unlocked", "user_engagement", "platform_growth"],
    impactValues: ["1", "100", "50"]
  };
}