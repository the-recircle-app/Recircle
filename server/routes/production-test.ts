/**
 * Production blockchain testing endpoint
 */

import { Router } from 'express';

const router = Router();

/**
 * Test production blockchain distribution
 */
router.post('/test-production-distribution', async (req, res) => {
    try {
        console.log('[PROD-TEST] Testing production blockchain distribution...');
        
        const testWallet = req.body.wallet || '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
        
        // Import the distribution function
        const { distributeRealB3TRPierreStyle } = await import('../utils/pierre-inspired-real-blockchain.js');
        
        // Test with 1 B3TR
        const result = await distributeRealB3TRPierreStyle(testWallet, 1, 999);
        
        console.log('[PROD-TEST] Distribution result:', result);
        
        res.json({
            success: result.success,
            message: result.success ? 'Production B3TR distribution successful!' : 'Distribution failed',
            result: result,
            environment: process.env.NODE_ENV,
            hasCredentials: {
                privateKey: !!process.env.DISTRIBUTOR_PRIVATE_KEY,
                b3trContract: !!process.env.B3TR_CONTRACT_ADDRESS,
                rewardsPool: !!process.env.X2EARNREWARDSPOOL_ADDRESS
            }
        });
        
    } catch (error) {
        console.error('[PROD-TEST] Production test failed:', error);
        res.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            environment: process.env.NODE_ENV
        });
    }
});

export default router;