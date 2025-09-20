/**
 * Smart Sponsoring System for ReCircle
 * Selectively sponsors transactions for users based on VTHO balance
 */

import { getVTHOBalance, shouldSponsorUser } from './vechain-thor-client';
import { getVeChainConfig } from '../../shared/vechain-config';

// Minimum VTHO thresholds for different user types
const VTHO_THRESHOLDS = {
    NEWCOMER: 5,    // Users with less than 5 VTHO need sponsoring
    LOW_BALANCE: 10, // Users with less than 10 VTHO might need sponsoring
    SUFFICIENT: 20   // Users with 20+ VTHO definitely don't need sponsoring
};

export interface SponsoringDecision {
    shouldSponsor: boolean;
    reason: string;
    userMessage: string;
    userVTHOBalance: number;
    estimatedCost: number;
    sponsorUrl?: string;
}

/**
 * Make smart sponsoring decision for a user transaction
 * @param userAddress - User's VeChain wallet address
 * @param transactionType - Type of transaction (e.g., 'reward_distribution', 'achievement_claim')
 * @returns Sponsoring decision with details
 */
export async function makeSponsoringDecision(
    userAddress: string,
    transactionType: string = 'reward_distribution'
): Promise<SponsoringDecision> {
    const vthoBalance = await getVTHOBalance(userAddress);
    const estimatedCost = 4; // Average transaction cost in VTHO
    const config = getVeChainConfig();
    
    // Get appropriate sponsor URL based on network
    const sponsorUrlKey = config.network === 'mainnet' 
        ? 'VECHAIN_MAINNET_SPONSOR_URL' 
        : 'VECHAIN_TESTNET_SPONSOR_URL';
    const sponsorUrl = process.env[sponsorUrlKey];
    
    console.log(`[SMART-SPONSOR] 🧠 Evaluating user ${userAddress}:`);
    console.log(`  - VTHO Balance: ${vthoBalance.toFixed(2)} VTHO`);
    console.log(`  - Transaction Type: ${transactionType}`);
    console.log(`  - Estimated Cost: ${estimatedCost} VTHO`);
    console.log(`  - Network: ${config.network}`);
    
    // Decision logic based on VTHO balance (check most specific conditions first)
    // 1. Check if user can't afford this specific transaction
    if (vthoBalance < estimatedCost) {
        return {
            shouldSponsor: true,
            reason: `Insufficient VTHO for transaction (${vthoBalance.toFixed(2)} < ${estimatedCost})`,
            userMessage: `💪 Don't worry about fees - we've got this ${estimatedCost} VTHO transaction covered!`,
            userVTHOBalance: vthoBalance,
            estimatedCost,
            sponsorUrl
        };
    }
    
    // 2. Newcomers with very low balances get sponsoring to help them get started
    if (vthoBalance < VTHO_THRESHOLDS.NEWCOMER) {
        return {
            shouldSponsor: true,
            reason: `Newcomer with very low balance (${vthoBalance.toFixed(2)} VTHO < ${VTHO_THRESHOLDS.NEWCOMER})`,
            userMessage: `🎉 Welcome! ReCircle will cover your transaction fees (${estimatedCost} VTHO) while you build your VTHO balance.`,
            userVTHOBalance: vthoBalance,
            estimatedCost,
            sponsorUrl
        };
    }
    
    // 3. Users with low-moderate balances get sponsored for reward distributions (helps them build balance)
    if (vthoBalance < VTHO_THRESHOLDS.LOW_BALANCE && transactionType === 'reward_distribution') {
        return {
            shouldSponsor: true,
            reason: `Low balance user earning rewards (${vthoBalance.toFixed(2)} VTHO < ${VTHO_THRESHOLDS.LOW_BALANCE})`,
            userMessage: `🚀 We'll cover your reward transaction fees (${estimatedCost} VTHO) to help you build your balance!`,
            userVTHOBalance: vthoBalance,
            estimatedCost,
            sponsorUrl
        };
    }
    
    // User has sufficient VTHO
    return {
        shouldSponsor: false,
        reason: `User has sufficient VTHO balance (${vthoBalance.toFixed(2)} VTHO >= ${estimatedCost})`,
        userMessage: `✅ You have sufficient VTHO balance (${vthoBalance.toFixed(2)}) to cover this ${estimatedCost} VTHO transaction.`,
        userVTHOBalance: vthoBalance,
        estimatedCost
    };
}

/**
 * Get sponsoring statistics for monitoring
 * @returns Current sponsoring configuration and usage stats
 */
export function getSponsoringStats() {
    const config = getVeChainConfig();
    const sponsorUrlKey = config.network === 'mainnet' 
        ? 'VECHAIN_MAINNET_SPONSOR_URL' 
        : 'VECHAIN_TESTNET_SPONSOR_URL';
    const sponsorUrl = process.env[sponsorUrlKey];
    
    return {
        network: config.network,
        sponsorUrl: sponsorUrl ? '✅ Configured' : '❌ Missing',
        thresholds: VTHO_THRESHOLDS,
        estimatedCostPerTransaction: 4,
        monthlyBudget: {
            transactions500: '$3.50',
            transactions1000: '$7.00',
            transactions2000: '$14.00'
        }
    };
}

/**
 * Check if sponsor URL is properly configured for current network
 * @returns true if sponsor URL is available
 */
export function isSponsorConfigured(): boolean {
    const config = getVeChainConfig();
    const sponsorUrlKey = config.network === 'mainnet' 
        ? 'VECHAIN_MAINNET_SPONSOR_URL' 
        : 'VECHAIN_TESTNET_SPONSOR_URL';
    const sponsorUrl = process.env[sponsorUrlKey];
    
    const isConfigured = !!sponsorUrl;
    console.log(`[SMART-SPONSOR] 🔧 Sponsor URL for ${config.network}: ${isConfigured ? '✅ Configured' : '❌ Missing'}`);
    
    return isConfigured;
}

/**
 * Format sponsoring decision for user display
 * @param decision - Sponsoring decision object
 * @returns User-friendly message about transaction fees
 */
export function formatSponsoringMessage(decision: SponsoringDecision): string {
    if (decision.shouldSponsor) {
        return `🎉 Good news! ReCircle will cover your transaction fees (${decision.estimatedCost} VTHO). ${decision.reason}`;
    } else {
        return `💰 Transaction fee: ~${decision.estimatedCost} VTHO will be paid from your wallet. ${decision.reason}`;
    }
}