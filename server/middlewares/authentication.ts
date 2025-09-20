import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

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
 * Simple session-based authentication middleware
 * Checks if user ID exists in session and validates against database
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for user ID in headers, query, or body (flexible auth for wallet-based system)
    const userId = req.headers['x-user-id'] || 
                   req.query.userId ||
                   req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please connect your wallet to access this endpoint'
      });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    if (isNaN(userIdNum)) {
      return res.status(401).json({ 
        error: 'Invalid user ID',
        message: 'Valid user authentication required'
      });
    }

    // Validate user exists in database
    const user = await storage.getUser(userIdNum);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Authentication failed - user does not exist'
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
    console.error('[AUTH] Authentication error:', error);
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