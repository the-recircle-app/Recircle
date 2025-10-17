import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { Certificate } from 'thor-devkit';

/**
 * Gift card purchase authentication middleware
 * Accepts EITHER:
 * 1. VeChain certificate (for desktop/legacy users)
 * 2. Wallet address from request body (verified later via blockchain transaction)
 * 
 * This allows VeWorld mobile users (who use VeChain Kit) to purchase without certificates,
 * while maintaining security via on-chain transaction verification.
 */
export const requireGiftCardAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const { connectedWallet } = req.body;
    
    let walletAddress: string | null = null;
    
    // Try VeChain certificate first (for desktop/certificate-based auth)
    if (authHeader) {
      try {
        const certificateToken = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7)
          : authHeader;
          
        const decodedAuthHeader = Buffer.from(certificateToken, 'base64').toString('utf-8');
        const decodedCertificate = JSON.parse(decodedAuthHeader);
        
        Certificate.verify(decodedCertificate);
        
        // Basic certificate validation
        const now = Math.floor(Date.now() / 1000);
        const maxAge = 300;
        
        if (!decodedCertificate.timestamp || (now - decodedCertificate.timestamp) > maxAge) {
          return res.status(401).json({ 
            error: 'Certificate expired',
            message: 'Please reconnect your wallet'
          });
        }
        
        if (decodedCertificate.purpose !== 'identification') {
          return res.status(401).json({ 
            error: 'Invalid certificate purpose'
          });
        }
        
        walletAddress = decodedCertificate.signer?.toLowerCase();
        console.log('[GIFT-CARD-AUTH] ✅ Certificate verified for wallet:', walletAddress);
        
      } catch (certError) {
        console.log('[GIFT-CARD-AUTH] Certificate validation failed, trying wallet-based auth');
        // Fall through to wallet-based auth
      }
    }
    
    // Fallback to wallet-based auth (for VeWorld mobile/VeChain Kit users)
    if (!walletAddress && connectedWallet) {
      walletAddress = connectedWallet.toLowerCase();
      console.log('[GIFT-CARD-AUTH] ✅ Using wallet-based auth for:', walletAddress);
      console.log('[GIFT-CARD-AUTH] (Transaction verification will confirm wallet ownership)');
    }
    
    if (!walletAddress) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please connect your wallet or provide valid credentials'
      });
    }

    // Get user by wallet address
    const user = await storage.getUserByWalletAddress(walletAddress);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Wallet not registered - please connect your wallet first'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      isAdmin: user.isAdmin || false,
      walletAddress: user.walletAddress || ''
    };

    next();
  } catch (error) {
    console.error('[GIFT-CARD-AUTH] Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication system error',
      message: 'Please try again later'
    });
  }
};
