/**
 * Test endpoint for Pierre-style real blockchain integration
 */

import { Router } from 'express';
import { testPierreStyleConnection, distributeRealB3TRPierreStyle } from '../utils/pierre-inspired-real-blockchain.js';

const router = Router();

/**
 * Test real blockchain connectivity
 */
router.get('/test-real-connection', async (req, res) => {
    try {
        console.log('[TEST] Testing Pierre-style real blockchain connection...');
        
        const result = await testPierreStyleConnection();
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Real VeChain blockchain connection working!',
                endpoint: result.endpoint,
                blockNumber: result.blockNumber,
                distributorAddress: result.distributorAddress,
                network: 'VeChain Testnet'
            });
        } else {
            res.json({
                success: false,
                message: 'Real blockchain connection failed',
                error: result.error,
                fallback: 'Will use Pierre-style solo node instead'
            });
        }
        
    } catch (error) {
        console.error('[TEST] Real blockchain test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test real blockchain B3TR distribution
 */
router.post('/test-real-distribution', async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        
        if (!recipient || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing recipient or amount'
            });
        }
        
        console.log(`[TEST] Testing real B3TR distribution: ${amount} B3TR to ${recipient}`);
        
        const result = await distributeRealB3TRPierreStyle(recipient, amount, 999);
        
        res.json({
            success: result.success,
            message: result.success ? 'Real blockchain distribution successful!' : 'Distribution failed',
            userReward: result.userReward,
            appReward: result.appReward,
            transactions: result.transactions,
            explorerUrls: result.explorerUrls,
            network: result.network,
            error: result.error
        });
        
    } catch (error) {
        console.error('[TEST] Real distribution test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;