// Pierre's VeBetterDAO integration types - learned from x-app-template analysis
import { z } from "zod";

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

// VeBetterDAO contract configuration (inspired by Pierre's config pattern)
export const VeBetterDAOConfig = {
  // These will be updated dynamically like Pierre's system
  TOKEN_ADDRESS: process.env.B3TR_CONTRACT_ADDRESS || "0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F",
  CONTRACT_ADDRESS: process.env.X2EARNREWARDSPOOL_ADDRESS || "0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38", // Use real rewards pool
  X2EARN_REWARDS_POOL: process.env.X2EARNREWARDSPOOL_ADDRESS || "0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38",
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

// Network configuration matching Pierre's approach
export const NetworkConfig = {
  NETWORK_URL: process.env.NETWORK_URL || "https://vethor-node-test.vechaindev.com", // Use real testnet
  NETWORK_TYPE: process.env.NETWORK_TYPE || "testnet",
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
  }
];