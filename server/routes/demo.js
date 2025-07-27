// Demo API Routes for ReCircle Platform
// This file contains sanitized route examples for GitHub demonstration
// Production implementation uses additional security layers and validation

const express = require('express');
const router = express.Router();

// User management routes (demo)
router.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Demo response structure
    const demoUser = {
      id: userId,
      walletAddress: 'demo_address_hidden',
      tokenBalance: 15.0,
      receiptsSubmitted: 0,
      currentStreak: 0,
      dailyActions: 0,
      totalImpact: 0,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: demoUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Receipt validation routes (demo)
router.post('/api/receipts/validate', async (req, res) => {
  try {
    const { receiptImage, userId } = req.body;
    
    // Input validation
    if (!receiptImage || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Demo validation response
    const validationResult = {
      id: 'demo_receipt_id',
      isValid: true,
      confidence: 0.92,
      storeName: 'Sustainable Store Demo',
      category: 'secondhand_clothing',
      estimatedReward: 2.5,
      sustainabilityScore: 85,
      validationDetails: {
        storeRecognized: true,
        itemsDetected: ['clothing', 'accessories'],
        priceValidation: true,
        dateValidation: true
      }
    };

    res.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation service unavailable'
    });
  }
});

// Wallet integration routes (demo)
router.post('/api/wallet/connect', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address required'
      });
    }

    // Demo connection response
    const connectionResult = {
      connected: true,
      address: walletAddress,
      network: 'vechain_testnet',
      balance: '15.0 B3TR',
      lastActivity: new Date().toISOString()
    };

    res.json({
      success: true,
      data: connectionResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Wallet connection failed'
    });
  }
});

// Rewards distribution routes (demo)
router.post('/api/rewards/distribute', async (req, res) => {
  try {
    const { userId, receiptId, amount } = req.body;
    
    if (!userId || !receiptId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Demo distribution response
    const distributionResult = {
      transactionId: 'demo_tx_' + Date.now(),
      status: 'completed',
      amount: amount,
      recipient: userId,
      network: 'vechain_thor',
      blockHash: 'demo_block_hash',
      gasUsed: '21000',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: distributionResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Distribution service unavailable'
    });
  }
});

// Sustainability tracking routes (demo)
router.get('/api/impact/stats', async (req, res) => {
  try {
    const impactStats = {
      totalUsers: 2500,
      receiptsProcessed: 15000,
      tokensDistributed: 37500,
      co2Saved: 125.5, // kg
      wasteReduced: 89.2, // kg
      circularTransactions: 12800,
      partnerStores: 150,
      averageReward: 2.5
    };

    res.json({
      success: true,
      data: impactStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stats service unavailable'
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = router;