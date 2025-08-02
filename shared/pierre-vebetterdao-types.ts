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
  TOKEN_ADDRESS: process.env.B3TR_TOKEN_ADDRESS || "0x0dd62dac6abb12bd62a58469b34f4d986697ef19",
  CONTRACT_ADDRESS: process.env.RECIRCLE_CONTRACT_ADDRESS || "",
  X2EARN_REWARDS_POOL: process.env.X2EARN_REWARDS_POOL || "0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38",
  X2EARN_APPS: process.env.X2EARN_APPS || "0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153",
  APP_ID: process.env.RECIRCLE_APP_ID || "",
  CYCLE_DURATION: 60480, // ~1 week in blocks
  MAX_SUBMISSIONS_PER_CYCLE: 10,
  REWARD_AMOUNT: process.env.REWARD_AMOUNT || "1", // B3TR tokens per valid submission
  VALIDITY_THRESHOLD: 0.5, // Pierre's threshold for token distribution
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
  NETWORK_URL: process.env.NETWORK_URL || "http://localhost:8669", // Solo node default
  NETWORK_TYPE: process.env.NETWORK_TYPE || "solo",
  ADMIN_MNEMONIC: process.env.ADMIN_MNEMONIC || "",
  ADMIN_ADDRESS: process.env.ADMIN_ADDRESS || "",
};

// Contract ABI will be added after deployment (Pierre's pattern)
export const RECIRCLE_EARN_ABI: any[] = [
  // Will be populated with actual ABI after contract deployment
];