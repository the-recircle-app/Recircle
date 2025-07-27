import rateLimit from 'express-rate-limit';

// General API rate limiting optimized for autoscale
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Increased limit for autoscale instances
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Strict rate limiting for receipt validation (prevent abuse)
export const receiptValidationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 receipt validations per hour per IP
  message: {
    error: 'Too many receipt validation attempts. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for receipt submission (prevent spam)
export const receiptSubmissionRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 submissions per day per IP
  message: {
    error: 'Daily submission limit reached. You can submit up to 10 receipts per day.',
    retryAfter: '24 hours'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication endpoints rate limiting (prevent brute force)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Admin endpoints rate limiting
export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for admin operations
  message: {
    error: 'Admin rate limit exceeded.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});