import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { Certificate } from 'thor-devkit';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        isAdmin: boolean;
        walletAddress: string;
      };
    }
  }
}

/**
 * VeChain certificate-based authentication middleware
 * Verifies wallet signatures instead of trusting client headers
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for VeChain certificate in Authorization header
    const authHeader = req.headers.authorization;
    
    // Fallback to legacy header system for backwards compatibility during transition
    const legacyUserId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
    
    let walletAddress: string | null = null;
    
    // Try VeChain certificate validation first
    if (authHeader) {
      try {
        // Support both raw base64 and "Bearer <base64>" formats
        const certificateToken = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7)
          : authHeader;
          
        // Decode base64 certificate
        const decodedAuthHeader = Buffer.from(certificateToken, 'base64').toString('utf-8');
        const decodedCertificate = JSON.parse(decodedAuthHeader);
        
        // Verify certificate signature using thor-devkit
        Certificate.verify(decodedCertificate);
        
        // STRICT SECURITY VALIDATIONS (all required)
        const now = Math.floor(Date.now() / 1000);
        const maxAge = 300; // 5 minutes
        const maxFutureSkew = 60; // 1 minute future tolerance
        
        // 1. TIMESTAMP REQUIRED (prevents indefinite replay)
        if (!decodedCertificate.timestamp || typeof decodedCertificate.timestamp !== 'number') {
          return res.status(401).json({ 
            error: 'Invalid certificate format',
            message: 'Certificate must include valid timestamp'
          });
        }
        
        // 2. TIMESTAMP VALIDATION (prevents replay attacks)
        const certAge = now - decodedCertificate.timestamp;
        if (certAge > maxAge) {
          return res.status(401).json({ 
            error: 'Certificate expired',
            message: 'Please reconnect your wallet - session expired'
          });
        }
        
        if (certAge < -maxFutureSkew) {
          return res.status(401).json({ 
            error: 'Certificate timestamp invalid',
            message: 'Certificate timestamp is too far in the future'
          });
        }
        
        // 3. PURPOSE VALIDATION (prevents cross-service replay)
        if (decodedCertificate.purpose !== 'identification') {
          return res.status(401).json({ 
            error: 'Invalid certificate purpose',
            message: 'Certificate must be for identification purpose'
          });
        }
        
        // 4. DOMAIN VALIDATION REQUIRED (prevents cross-domain replay)
        if (!decodedCertificate.domain) {
          return res.status(401).json({ 
            error: 'Certificate domain required',
            message: 'Certificate must include domain for security validation'
          });
        }
        
        // SECURE DOMAIN VALIDATION: Use hardcoded allowlist (never trust client headers!)
        const productionDomains = [
          process.env.APP_DOMAIN,
          ...(process.env.REPLIT_DOMAINS || '').split(',').filter(Boolean)
        ].filter(Boolean).map(domain => domain.toLowerCase());
        
        // PRODUCTION SECURITY GUARD: Require explicit domain configuration in production
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction && productionDomains.length === 0) {
          console.error('[VECHAIN-AUTH] SECURITY ERROR: Production requires APP_DOMAIN or REPLIT_DOMAINS configuration');
          return res.status(500).json({ 
            error: 'Server configuration error',
            message: 'Authentication system requires domain configuration'
          });
        }
        
        // Build allowed domains list (exclude localhost in production)
        const allowedDomains = isProduction 
          ? productionDomains
          : ['localhost', '127.0.0.1', ...productionDomains];
        
        // Normalize certificate domain (remove port, lowercase)
        const certDomain = decodedCertificate.domain.split(':')[0].toLowerCase();
        
        if (!allowedDomains.includes(certDomain)) {
          console.error('[VECHAIN-AUTH] Domain not in allowlist:', certDomain, 'Allowed:', allowedDomains);
          return res.status(401).json({ 
            error: 'Certificate domain not allowed',
            message: 'Certificate domain is not authorized for this application'
          });
        }
        
        // Extract verified wallet address
        walletAddress = decodedCertificate.signer?.toLowerCase();
        if (!walletAddress) {
          return res.status(401).json({ 
            error: 'Invalid certificate format',
            message: 'Certificate must include valid signer address'
          });
        }
        
        console.log('[VECHAIN-AUTH] ✅ Certificate verified for wallet:', walletAddress);
        
      } catch (certError) {
        // FULLY SANITIZED LOGGING - no certificate fragments exposed
        const errorType = certError instanceof SyntaxError ? 'PARSE_ERROR' : 
                         certError.name === 'ThorDevKitError' ? 'SIGNATURE_ERROR' :
                         'UNKNOWN_ERROR';
        console.error(`[VECHAIN-AUTH] Certificate validation failed: ${errorType}`);
        
        return res.status(401).json({ 
          error: 'Invalid wallet signature',
          message: 'Please reconnect your wallet to authenticate'
        });
      }
    }
    
    // LEGACY AUTHENTICATION DISABLED FOR SECURITY
    // Legacy headers are completely insecure and allow account takeover
    if (!walletAddress && legacyUserId) {
      console.log('[VECHAIN-AUTH] ❌ Legacy authentication DISABLED for security - certificate required');
      return res.status(401).json({ 
        error: 'Certificate required',
        message: 'Legacy authentication disabled for security. Please connect your wallet with proper VeChain certificate.'
      });
    }
    
    if (!walletAddress) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please connect your wallet to access this endpoint'
      });
    }

    // Get user by cryptographically verified wallet address ONLY
    const user = await storage.getUserByWalletAddress(walletAddress);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Wallet not registered - please connect your wallet first'
      });
    }

    // Attach verified user info to request
    req.user = {
      id: user.id,
      isAdmin: user.isAdmin || false,
      walletAddress: user.walletAddress || ''
    };

    next();
  } catch (error) {
    console.error('[VECHAIN-AUTH] Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication system error',
      message: 'Please try again later'
    });
  }
};

/**
 * Admin-only access middleware
 * Must be used after requireAuth
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'This endpoint requires administrator privileges'
    });
  }

  next();
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    const resourceUserId = parseInt(req.params[paramName]);
    if (isNaN(resourceUserId)) {
      return res.status(400).json({ 
        error: 'Invalid resource ID',
        message: `Invalid ${paramName} parameter`
      });
    }

    // Allow admin to access any resource
    if (req.user.isAdmin) {
      return next();
    }

    // Check ownership
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

/**
 * Receipt access control middleware
 * Ensures user can only access their own receipts or admin can access all
 */
export const requireReceiptAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    const receiptId = parseInt(req.params.id || req.params.receiptId);
    if (isNaN(receiptId)) {
      return res.status(400).json({ 
        error: 'Invalid receipt ID',
        message: 'Valid receipt ID required'
      });
    }

    // Admin can access all receipts
    if (req.user.isAdmin) {
      return next();
    }

    // Check if receipt belongs to user
    const receipt = await storage.getReceipt(receiptId);
    if (!receipt) {
      return res.status(404).json({ 
        error: 'Receipt not found',
        message: 'The requested receipt does not exist'
      });
    }

    if (receipt.userId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access your own receipts'
      });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Receipt access control error:', error);
    return res.status(500).json({ 
      error: 'Access control system error',
      message: 'Please try again later'
    });
  }
};