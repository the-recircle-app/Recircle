/**
 * Json Response Middleware
 * This middleware ensures that all API responses are JSON only and not HTML
 * It prevents Express from responding with HTML for API routes, which can break
 * integrations with external tools like Google Sheets.
 * 
 * Enhanced version to handle all edge cases, particularly Google Sheets integration.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Forces response to be JSON-only for all API routes.
 * This prevents any HTML content from being sent in responses.
 */
export const forceJsonResponse = (req: Request, res: Response, next: NextFunction) => {
  // Store original methods
  const originalJson = res.json;
  const originalSend = res.send;
  const originalEnd = res.end;
  const originalWrite = res.write;
  
  // Override the send method to ensure it sends JSON only
  res.send = function(body: any) {
    // Always set content type to application/json
    res.setHeader('Content-Type', 'application/json');
    
    // Handle different body types
    if (body === undefined || body === null) {
      // Convert null/undefined to empty JSON object
      body = JSON.stringify({});
    } else if (typeof body === 'string') {
      // Check if it's already JSON
      const firstChar = body.trim().charAt(0);
      if (firstChar !== '{' && firstChar !== '[') {
        // If not JSON, convert to JSON
        body = JSON.stringify({ message: body });
      }
      // If it's already JSON, leave it as is
    } else if (typeof body !== 'string') {
      // If it's an object but not a string, stringify it
      try {
        body = JSON.stringify(body);
      } catch (err) {
        console.error('Error stringifying response body:', err);
        body = JSON.stringify({ error: 'Failed to serialize response' });
      }
    }
    
    return originalSend.call(this, body);
  };
  
  // Override the json method to ensure proper JSON handling
  res.json = function(body: any) {
    // Set content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    // Ensure we're sending a valid JSON response
    try {
      // For objects, we'll let Express handle the conversion
      return originalJson.call(this, body);
    } catch (err) {
      console.error('Error in res.json middleware:', err);
      // If we can't stringify normally, send a fallback error JSON
      return originalSend.call(this, JSON.stringify({ error: 'Invalid JSON response' }));
    }
  };
  
  // Override end to ensure we don't end with non-JSON content
  res.end = function(chunk?: any, encoding?: BufferEncoding) {
    if (chunk && typeof chunk === 'string' && !res.headersSent) {
      // If we're ending with a string and no headers sent yet, ensure it's JSON
      res.setHeader('Content-Type', 'application/json');
      
      // Check if it's already JSON
      const firstChar = chunk.trim().charAt(0);
      if (firstChar !== '{' && firstChar !== '[') {
        // If not JSON, convert to JSON
        chunk = JSON.stringify({ message: chunk });
      }
    }
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  // Override write for streaming responses (rarely used for API)
  res.write = function(chunk: any, encodingOrCallback?: BufferEncoding | ((err?: Error) => void)) {
    // Ensure we have JSON content type
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
    }
    
    // Proceed with original write
    return originalWrite.call(this, chunk, encodingOrCallback as any);
  };
  
  next();
};

/**
 * API-specific middleware that ensures all /api/* routes 
 * return proper JSON and not HTML/text responses
 */
export const apiJsonMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If this is an API route (starts with /api/), enforce JSON response
  if (req.path.startsWith('/api/')) {
    forceJsonResponse(req, res, next);
  } else {
    next();
  }
};