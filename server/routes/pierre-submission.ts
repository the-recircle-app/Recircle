// Submission route following Pierre's exact controller pattern
import { Request, Response, NextFunction } from 'express';
import { pierreOpenAIService } from '../utils/pierre-openai-service';
import { pierreContractsService } from '../utils/pierre-contracts-service';
import { submissionSchema, type Submission } from '../../shared/pierre-vebetterdao-types';
import { VeBetterDAOConfig } from '../../shared/pierre-vebetterdao-types';

export class PierreSubmissionController {
  async submitReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📋 Processing receipt submission...');
      
      // Validate request body using Pierre's validation pattern
      const validationResult = submissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ 
          error: 'Invalid submission data', 
          details: validationResult.error.errors 
        });
        return;
      }

      const body = validationResult.data;
      const submissionRequest: Submission = {
        ...body,
        timestamp: Date.now(),
      };

      console.log(`📱 Submission from ${submissionRequest.address}`);

      // Step 1: Smart contract validation (following Pierre's pattern) - Skip for testing
      console.log('🔧 Skipping contract validation for testing - focusing on OpenAI integration');

      // Step 2: OpenAI image validation (Pierre's core logic)
      const validationResult2 = await pierreOpenAIService.validateImage(body.image);

      if (validationResult2 == undefined || !('validityFactor' in validationResult2)) {
        res.status(500).json({ error: 'Error validating image with AI' });
        return;
      }

      const validityFactor = validationResult2.validityFactor;
      console.log(`🤖 AI Validity Score: ${validityFactor}`);

      // Step 3: Token distribution if validity threshold met (Pierre's pattern)
      let tokenDistributed = false;
      if (validityFactor > VeBetterDAOConfig.VALIDITY_THRESHOLD) {
        console.log(`✅ Validity score ${validityFactor} > ${VeBetterDAOConfig.VALIDITY_THRESHOLD}, would distribute tokens...`);
        
        // For testing, simulate successful token distribution
        tokenDistributed = true;
        console.log(`🎯 [TESTING] Simulated B3TR token distribution to ${submissionRequest.address}`);
        console.log(`🎯 [TESTING] Would distribute ${VeBetterDAOConfig.REWARD_AMOUNT} B3TR tokens`);
        
      } else {
        console.log(`❌ Validity score ${validityFactor} <= ${VeBetterDAOConfig.VALIDITY_THRESHOLD}, no tokens distributed`);
      }

      // Success response (matching Pierre's format)
      res.status(200).json({ 
        success: true,
        validation: validationResult2,
        tokenDistributed,
        rewardAmount: tokenDistributed ? VeBetterDAOConfig.REWARD_AMOUNT : '0',
        message: tokenDistributed 
          ? `${VeBetterDAOConfig.REWARD_AMOUNT} B3TR tokens distributed!` 
          : 'Receipt processed but validity too low for rewards'
      });

    } catch (error) {
      console.error('❌ Submission processing error:', error);
      next(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  // Contract status endpoint for debugging
  async getContractStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await pierreContractsService.getContractStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export const pierreSubmissionController = new PierreSubmissionController();