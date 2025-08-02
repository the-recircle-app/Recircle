/**
 * Receipt API Routes - ReCircle Production System
 * Real OpenAI Vision API integration with VeBetterDAO token distribution
 */

import express from 'express';
import { pierreOpenAIService } from '../utils/pierre-openai-service.js';
import { distributeB3TRTokensSimple } from '../utils/simple-solo-rewards.js';

const router = express.Router();

/**
 * POST /api/receipts/validate
 * Validates a receipt for sustainable purchase rewards
 * 
 * Production implementation includes:
 * - OpenAI Vision API integration
 * - Real-time image analysis
 * - Confidence scoring and classification
 * - VeBetterDAO reward distribution
 */
router.post('/validate', async (req, res) => {
  try {
    const { userId, walletAddress, image, storeHint, purchaseDate, amount } = req.body;
    
    console.log(`[RECEIPT] Processing receipt validation for user ${userId}`);
    console.log(`[RECEIPT] Wallet: ${walletAddress}`);
    
    if (!image) {
      console.error('[RECEIPT] No image data received in request body');
      return res.status(400).json({ error: 'Missing or invalid image data. Please provide base64 encoded image.' });
    }
    
    // Validate base64 image format
    if (typeof image !== 'string' || image.length < 100) {
      console.error('[RECEIPT] Invalid image data:', {
        hasImage: !!image,
        imageType: typeof image,
        imageLength: image?.length || 0,
        firstChars: image?.substring(0, 50) || 'none'
      });
      return res.status(400).json({ error: 'Missing or invalid image data. Please provide base64 encoded image.' });
    }
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required for token distribution' });
    }
    
    // Use Pierre's OpenAI Vision API for real receipt analysis
    console.log(`[RECEIPT] 🔍 Starting OpenAI image analysis...`);
    console.log(`[RECEIPT] Image size: ${image.length} characters`);
    
    const aiValidation = await pierreOpenAIService.validateImage(image);
    
    console.log(`[RECEIPT] 🤖 OpenAI validation result:`, aiValidation);
    
    if (!aiValidation || !('validityFactor' in aiValidation)) {
      console.error('[RECEIPT] ❌ AI validation failed - no valid response from OpenAI');
      console.error('[RECEIPT] Received:', aiValidation);
      throw new Error('AI validation failed - could not analyze receipt image');
    }
    
    const validityScore = aiValidation.validityFactor;
    const isValid = validityScore > 0.5; // Pierre's threshold
    
    console.log(`[RECEIPT] AI Validity Score: ${validityScore}`);
    console.log(`[RECEIPT] Receipt Valid: ${isValid}`);
    
    // Calculate reward based on validity (Pierre's model)
    const baseReward = 10; // B3TR tokens
    const estimatedReward = isValid ? baseReward * validityScore : 0;
    
    let tokenDistributed = false;
    let txHash = null;
    
    // Distribute B3TR tokens if receipt is valid (Pierre's pattern)
    if (isValid && estimatedReward > 0) {
      try {
        const distributionResult = await distributeB3TRTokensSimple(
          userId,
          walletAddress,
          estimatedReward,
          `ReCircle sustainable transportation receipt validation`
        );
        
        if (distributionResult.success) {
          tokenDistributed = true;
          txHash = distributionResult.txHash;
          console.log(`[RECEIPT] ✅ Distributed ${estimatedReward} B3TR tokens to ${walletAddress}`);
        }
      } catch (error) {
        console.error(`[RECEIPT] Token distribution failed:`, error);
        // Continue processing but mark as not distributed
      }
    }
    
    // Return comprehensive validation result (ReCircle format)
    const validationResult = {
      isValid,
      storeName: "Transportation Service", // For transportation receipts
      isSustainableStore: isValid,
      confidence: aiValidation.confidence || 0.7,
      estimatedReward: Math.round(estimatedReward * 100) / 100,
      actualReward: tokenDistributed ? estimatedReward : 0,
      reasons: [aiValidation.reasoning || "AI analysis completed"],
      category: "transportation",
      sentForManualReview: false,
      tokenDistributed,
      txHash,
      aiValidation: {
        validityScore,
        reasoning: aiValidation.reasoning || "Receipt analysis completed",
        confidence: aiValidation.confidence || 0.7
      }
    };
    
    res.json(validationResult);
  } catch (error) {
    console.error('[RECEIPT] Validation error:', error);
    res.status(500).json({ error: 'Receipt validation failed' });
  }
});

/**
 * GET /api/receipts/:userId
 * Retrieves user's receipt history
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Internal database query redacted for privacy
    const mockReceipts = [
      {
        id: 1,
        storeName: "Demo Thrift Store",
        amount: 25.50,
        rewardAmount: 8,
        purchaseDate: "2025-05-20",
        category: "thrift_store"
      }
    ];
    
    res.json(mockReceipts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

export default router;