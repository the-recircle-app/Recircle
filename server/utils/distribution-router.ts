/**
 * Distribution Router - Choose between personal wallet or VeBetterDAO treasury
 * 
 * This module allows switching between two distribution methods:
 * 1. Personal Wallet (current system) - tokens from distributor's personal balance
 * 2. VeBetterDAO Treasury (enhanced security) - tokens from VeBetterDAO treasury
 */

// Import functions will be done dynamically to avoid module loading issues

// Configuration - set this to choose your distribution method
const USE_VEBETTERDAO_TREASURY = process.env.USE_VEBETTERDAO_TREASURY === 'true';
console.log(`[DISTRIBUTION-ROUTER] Treasury mode: ${USE_VEBETTERDAO_TREASURY} (env: ${process.env.USE_VEBETTERDAO_TREASURY})`);

interface DistributionParams {
  recipientAddress: string;
  totalAmount: number;
  isTestMode?: boolean;
}

interface DistributionResult {
  success: boolean;
  userTxHash?: string;
  appTxHash?: string;
  userAmount: number;
  appAmount: number;
  method: 'personal-wallet' | 'treasury';
  error?: string;
}

/**
 * Main distribution function that routes to the appropriate system
 */
export async function distributeRewards(params: DistributionParams): Promise<DistributionResult> {
  console.log(`[DISTRIBUTION-ROUTER] Using ${USE_VEBETTERDAO_TREASURY ? 'VeBetterDAO Treasury' : 'Personal Wallet'} system`);
  
  try {
    if (USE_VEBETTERDAO_TREASURY) {
      // Use VeBetterDAO Treasury system (enhanced security)
      console.log(`🏛️ [TREASURY] Distributing ${params.totalAmount} B3TR from VeBetterDAO treasury`);
      const { distributeTreasuryReward } = await import('./vebetterdao-treasury');
      const result = await distributeTreasuryReward(
        params.recipientAddress,
        params.totalAmount,
        `Reward distribution: ${new Date().toISOString()}`
      );
      
      if (result.success) {
        return {
          success: true,
          userTxHash: result.txHash,
          appTxHash: result.txHash, // Treasury uses single transaction
          userAmount: result.userAmount || 0,
          appAmount: result.appAmount || 0,
          method: 'treasury'
        };
      } else {
        throw new Error(result.error || 'Treasury distribution failed');
      }
    } else {
      // Use Personal Wallet system (current/proven)
      console.log(`💰 [PERSONAL] Distributing ${params.totalAmount} B3TR from personal wallet`);
      const { distributeRealB3TR } = await import('./working-distribution');
      const result = await distributeRealB3TR(
        params.recipientAddress,
        params.totalAmount,
        0 // userId not needed for distribution
      );
      
      return {
        success: true,
        userTxHash: result.transactions.user,
        appTxHash: result.transactions.app,
        userAmount: result.userReward,
        appAmount: result.appReward,
        method: 'personal-wallet'
      };
    }
  } catch (error) {
    console.error(`[DISTRIBUTION-ROUTER] Distribution failed:`, error);
    return {
      success: false,
      userAmount: 0,
      appAmount: 0,
      method: USE_VEBETTERDAO_TREASURY ? 'treasury' : 'personal-wallet',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get current distribution method info
 */
export function getDistributionInfo() {
  return {
    method: USE_VEBETTERDAO_TREASURY ? 'treasury' : 'personal-wallet',
    description: USE_VEBETTERDAO_TREASURY 
      ? 'VeBetterDAO Treasury (enhanced security - tokens from treasury)'
      : 'Personal Wallet (current system - tokens from distributor wallet)',
    benefits: USE_VEBETTERDAO_TREASURY 
      ? [
          'Tokens come from VeBetterDAO treasury, not personal wallet',
          'Enhanced security and audit trail',
          'Cannot exceed VeBetterDAO allocation limits',
          'Distributor wallet only needs gas for authorization'
        ]
      : [
          'Proven reliable system',
          'Direct control over token distribution',
          'Faster transaction processing',
          'No dependency on external treasury contracts'
        ]
  };
}

// Legacy alias for backward compatibility
export const distributeTokens = distributeRewards;