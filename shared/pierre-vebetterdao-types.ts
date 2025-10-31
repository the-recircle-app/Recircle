// Pierre's VeBetterDAO integration types - learned from x-app-template analysis
import { z } from "zod";
import { getVeChainConfig } from "./vechain-config";

// Submission interface matching Pierre's pattern
export interface Submission {
  address: string;
  deviceID: string;
  image: string; // base64 encoded image
  timestamp: number;
}

// OpenAI validation result structure from Pierre's system
export interface ValidationResult {
  validityFactor: number; // 0-1 score from OpenAI Vision API
  reasoning?: string;
  confidence?: number;
}

// Get current network configuration
const vchainConfig = getVeChainConfig();

// VeBetterDAO contract configuration (inspired by Pierre's config pattern)
export const VeBetterDAOConfig = {
  // Use network-aware contract addresses from shared config
  TOKEN_ADDRESS: vchainConfig.contracts.b3trToken,
  CONTRACT_ADDRESS: vchainConfig.contracts.x2earnRewardsPool,
  X2EARN_REWARDS_POOL: vchainConfig.contracts.x2earnRewardsPool,
  X2EARN_APPS: process.env.X2EARN_APPS || "0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153",
  APP_ID: process.env.RECIRCLE_APP_ID || "0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1", // Real app ID
  CYCLE_DURATION: 60480, // ~1 week in blocks
  MAX_SUBMISSIONS_PER_CYCLE: 10,
  REWARD_AMOUNT: process.env.REWARD_AMOUNT || "1", // B3TR tokens per valid submission
  VALIDITY_THRESHOLD: 0.4, // Lower threshold for testing - Lyft rides should qualify // Pierre's threshold for token distribution
};

// Validation schemas following Pierre's pattern
export const submissionSchema = z.object({
  address: z.string().min(42).max(42), // VeChain address format
  deviceID: z.string(),
  image: z.string(), // base64 encoded
});

export type SubmissionRequest = z.infer<typeof submissionSchema>;

// Network configuration matching Pierre's approach - now network-aware
export const NetworkConfig = {
  NETWORK_URL: vchainConfig.thorEndpoints[0], // Use first Thor endpoint from network config
  NETWORK_TYPE: vchainConfig.network,
  ADMIN_MNEMONIC: process.env.DISTRIBUTOR_PRIVATE_KEY || "", // Use real distributor key
  ADMIN_ADDRESS: process.env.ADMIN_ADDRESS || "",
};

// Contract ABI for VeBetterDAO X2EarnRewardsPool contract
export const RECIRCLE_EARN_ABI: any[] = [
  {
    "inputs": [
      {"internalType": "bytes32", "name": "appId", "type": "bytes32"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "string", "name": "proof", "type": "string"}
    ],
    "name": "distributeReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "appId", "type": "bytes32"}],
    "name": "availableFunds",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentCycle",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view", 
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cycleDuration",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSubmissionsPerCycle", 
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "cycle", "type": "uint256"}
    ],
    "name": "isUserMaxSubmissionsReached",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];