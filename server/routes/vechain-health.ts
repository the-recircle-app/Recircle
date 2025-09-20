/**
 * VeChain Network Health Check Endpoint
 * 
 * Provides comprehensive network status and mainnet readiness testing
 * Can test both testnet and mainnet connections without requiring endorsement
 */

import { Router } from 'express';
import { getVeChainConfig, validateMainnetReadiness, isMainnet } from '../../shared/vechain-config';
import { createThorClient, testThorConnectivity } from '../utils/vechain-thor-client';
import { checkTreasuryFunds } from '../utils/vebetterdao-treasury';

const router = Router();

interface HealthCheckResult {
  network: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  config: {
    chainTag: string;
    thorEndpoints: string[];
    explorerUrl: string;
    sponsorUrl: string;
    contracts: {
      b3trToken: string;
      x2earnRewardsPool: string;
    };
  };
  connectivity: {
    thorClient: boolean;
    bestBlock?: string;
    blockHeight?: number;
    error?: string;
  };
  treasury: {
    availableFunds: number;
    endorsementReady: boolean;
    error?: string;
  };
  mainnetReadiness?: {
    ready: boolean;
    missing: string[];
  };
  timestamp: string;
}

/**
 * GET /api/vechain/health
 * Comprehensive VeChain network health check
 */
router.get('/health', async (req, res) => {
  let config: any = null;
  
  try {
    // Try to get config, but don't let it fail the health check for mainnet
    config = getVeChainConfig();
  } catch (configError: any) {
    // Config failed (likely mainnet with missing vars) - continue with degraded health
    console.warn('⚠️ Config failed in health check:', configError.message);
    
    return res.status(503).json({
      network: 'UNKNOWN',
      status: 'degraded',
      error: 'Configuration failed: ' + configError.message,
      mainnetReadiness: validateMainnetReadiness(),
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const result: HealthCheckResult = {
      network: config.network.toUpperCase(),
      status: 'healthy',
      config: {
        chainTag: `0x${config.chainTag.toString(16)}`,
        thorEndpoints: config.thorEndpoints,
        explorerUrl: config.explorerUrl,
        sponsorUrl: config.sponsorUrl ? '***configured***' : 'missing',
        contracts: {
          b3trToken: config.contracts.b3trToken || 'missing',
          x2earnRewardsPool: config.contracts.x2earnRewardsPool || 'missing'
        }
      },
      connectivity: {
        thorClient: false
      },
      treasury: {
        availableFunds: 0,
        endorsementReady: false
      },
      timestamp: new Date().toISOString()
    };

    // Test Thor client connectivity
    try {
      const thorClient = await createThorClient();
      const bestBlock = await thorClient.blocks.getBestBlock();
      
      result.connectivity.thorClient = true;
      if (bestBlock) {
        result.connectivity.bestBlock = bestBlock.id;
        result.connectivity.blockHeight = bestBlock.number;
      }
      
      console.log(`[HEALTH] ✅ ${config.network} Thor client connected, block: ${result.connectivity.blockHeight}`);
    } catch (error: any) {
      result.connectivity.thorClient = false;
      result.connectivity.error = error.message;
      result.status = 'degraded';
      
      console.error(`[HEALTH] ❌ ${config.network} Thor connectivity failed:`, error.message);
    }

    // Test treasury funds (safe to call on both networks)
    try {
      const availableFunds = await checkTreasuryFunds();
      result.treasury.availableFunds = availableFunds;
      result.treasury.endorsementReady = availableFunds > 0;
      
      console.log(`[HEALTH] 💰 Treasury funds: ${availableFunds} B3TR`);
    } catch (error: any) {
      result.treasury.error = error.message;
      console.error(`[HEALTH] ❌ Treasury check failed:`, error.message);
    }

    // Mainnet readiness check (always run to verify configuration)
    const mainnetReadiness = validateMainnetReadiness();
    result.mainnetReadiness = mainnetReadiness;
    
    if (!mainnetReadiness.ready) {
      console.log(`[HEALTH] ⚠️  Mainnet not ready, missing: ${mainnetReadiness.missing.join(', ')}`);
      if (isMainnet()) {
        result.status = 'unhealthy';
      }
    } else {
      console.log(`[HEALTH] ✅ Mainnet configuration complete`);
    }

    // Overall status assessment
    if (!result.connectivity.thorClient) {
      result.status = 'unhealthy';
    } else if (isMainnet() && (!result.treasury.endorsementReady || !mainnetReadiness.ready)) {
      result.status = 'degraded';
    }

    console.log(`[HEALTH] 🏥 ${config.network} Network Status: ${result.status.toUpperCase()}`);
    res.json(result);
    
  } catch (error: any) {
    console.error('[HEALTH] ❌ Health check failed:', error.message);
    res.status(500).json({
      network: 'UNKNOWN',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/vechain/network-info
 * Simple network information endpoint
 */
router.get('/network-info', (req, res) => {
  try {
    const config = getVeChainConfig();
    const mainnetReadiness = validateMainnetReadiness();
    
    res.json({
      current: {
        network: config.network,
        chainTag: `0x${config.chainTag.toString(16)}`,
        ready: config.network === 'testnet' || mainnetReadiness.ready
      },
      testnet: {
        available: true,
        chainTag: '0x27'
      },
      mainnet: {
        available: mainnetReadiness.ready,
        chainTag: '0x4a',
        missing: mainnetReadiness.missing
      },
      switching: {
        instructions: 'Set VECHAIN_NETWORK=mainnet environment variable and restart server',
        currentEnv: process.env.VECHAIN_NETWORK || 'testnet (default)'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;