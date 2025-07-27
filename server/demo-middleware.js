// Demo Middleware for ReCircle Platform
// This file contains sanitized middleware examples for GitHub demonstration
// Production implementation includes enhanced security and rate limiting

const express = require('express');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
};

// CORS middleware for development
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Input validation middleware
const validateInput = (req, res, next) => {
  // Basic input sanitization
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip);
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);
    next();
  };
};

// Authentication middleware (demo version)
const authenticateDemo = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  // Demo authentication - in production this would verify JWT tokens
  const token = authHeader.split(' ')[1];
  if (token === 'demo_token') {
    req.user = {
      id: 'demo_user_102',
      walletAddress: 'demo_wallet_address',
      role: 'user'
    };
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Middleware Error:', err);
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Request size limiter
const requestSizeLimit = express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf.length > 10 * 1024 * 1024) {
      throw new Error('Request entity too large');
    }
  }
});

module.exports = {
  requestLogger,
  corsMiddleware,
  validateInput,
  rateLimit,
  authenticateDemo,
  errorHandler,
  securityHeaders,
  requestSizeLimit
};