/**
 * Solo Node B3TR Distribution
 * Simple B3TR token distribution for VeChain solo node testing
 */

import { ethers } from 'ethers';

// Solo Node Configuration
const SOLO_CONFIG = {
    NETWORK_URL: process.env.SOLO_NETWORK_URL || 'http://localhost:8669',
    B3TR_CONTRACT: process.env.SOLO_B3TR_CONTRACT_ADDRESS || '',
    DEPLOYER_ADDRESS: process.env.SOLO_DEPLOYER_ADDRESS || '',
    PRIVATE_KEY: process.env.SOLO_PRIVATE_KEY || '',
    MNEMONIC: process.env.SOLO_MNEMONIC || '',
};

// B3TR Token ABI (standard ERC20)
const B3TR_ABI = [
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function mint(address to, uint256 amount) external",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
];

interface SoloB3TRResult {
    success: boolean;
    txHash?: string;
    error?: string;
    amount?: number;
    recipient?: string;
}

/**
 * Check if solo node is configured and available
 */
export async function isSoloNodeAvailable(): Promise<boolean> {
    try {
        if (!SOLO_CONFIG.NETWORK_URL || !SOLO_CONFIG.B3TR_CONTRACT || !SOLO_CONFIG.PRIVATE_KEY) {
            console.log('[SOLO] Solo node configuration incomplete');
            return false;
        }

        const provider = new ethers.JsonRpcProvider(SOLO_CONFIG.NETWORK_URL);
        await provider.getBlockNumber();
        
        console.log('[SOLO] Solo node available at', SOLO_CONFIG.NETWORK_URL);
        return true;
    } catch (error) {
        console.log('[SOLO] Solo node not available:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}

/**
 * Distribute B3TR tokens on solo node
 */
export async function distributeSoloB3TR(recipient: string, amount: number): Promise<SoloB3TRResult> {
    try {
        console.log(`[SOLO] Distributing ${amount} B3TR to ${recipient}`);
        
        // Check configuration
        if (!SOLO_CONFIG.B3TR_CONTRACT || !SOLO_CONFIG.PRIVATE_KEY) {
            return {
                success: false,
                error: 'Solo node not configured - missing contract address or private key'
            };
        }

        // Connect to solo node
        const provider = new ethers.JsonRpcProvider(SOLO_CONFIG.NETWORK_URL);
        const wallet = new ethers.Wallet(SOLO_CONFIG.PRIVATE_KEY, provider);
        
        // Connect to B3TR contract
        const b3trContract = new ethers.Contract(SOLO_CONFIG.B3TR_CONTRACT, B3TR_ABI, wallet);
        
        // Convert amount to wei (18 decimals)
        const amountWei = ethers.parseUnits(amount.toString(), 18);
        
        console.log(`[SOLO] Sending ${amount} B3TR (${amountWei}) from ${wallet.address} to ${recipient}`);
        
        // Check if contract has mint function (for testing)
        try {
            const tx = await b3trContract.mint(recipient, amountWei);
            const receipt = await tx.wait();
            
            console.log(`[SOLO] ✅ B3TR minted successfully`);
            console.log(`[SOLO] Transaction hash: ${receipt.hash}`);
            console.log(`[SOLO] Block number: ${receipt.blockNumber}`);
            
            return {
                success: true,
                txHash: receipt.hash,
                amount,
                recipient
            };
            
        } catch (mintError) {
            // If mint fails, try transfer
            console.log('[SOLO] Mint failed, trying transfer...');
            
            const tx = await b3trContract.transfer(recipient, amountWei);
            const receipt = await tx.wait();
            
            console.log(`[SOLO] ✅ B3TR transferred successfully`);
            console.log(`[SOLO] Transaction hash: ${receipt.hash}`);
            
            return {
                success: true,
                txHash: receipt.hash,
                amount,
                recipient
            };
        }
        
    } catch (error) {
        console.log('[SOLO] ❌ Distribution failed:', error instanceof Error ? error.message : 'Unknown error');
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Solo node distribution failed'
        };
    }
}

/**
 * Get B3TR balance on solo node
 */
export async function getSoloB3TRBalance(address: string): Promise<number> {
    try {
        if (!SOLO_CONFIG.B3TR_CONTRACT) {
            return 0;
        }

        const provider = new ethers.JsonRpcProvider(SOLO_CONFIG.NETWORK_URL);
        const b3trContract = new ethers.Contract(SOLO_CONFIG.B3TR_CONTRACT, B3TR_ABI, provider);
        
        const balance = await b3trContract.balanceOf(address);
        const balanceFormatted = parseFloat(ethers.formatUnits(balance, 18));
        
        console.log(`[SOLO] B3TR balance for ${address}: ${balanceFormatted}`);
        return balanceFormatted;
        
    } catch (error) {
        console.log('[SOLO] Failed to get balance:', error instanceof Error ? error.message : 'Unknown error');
        return 0;
    }
}

/**
 * Test solo node B3TR distribution
 */
export async function testSoloB3TR(): Promise<SoloB3TRResult> {
    try {
        console.log('[SOLO] Testing B3TR distribution...');
        
        const testRecipient = '0x435933c8064b4Ae76bE665428e0307eF2cCFAD5c';
        const testAmount = 10;
        
        const result = await distributeSoloB3TR(testRecipient, testAmount);
        
        if (result.success) {
            console.log('[SOLO] ✅ Test distribution successful');
            const balance = await getSoloB3TRBalance(testRecipient);
            console.log(`[SOLO] Test recipient balance: ${balance} B3TR`);
        }
        
        return result;
        
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Test failed'
        };
    }
}