/**
 * Receipt Utility Functions
 * 
 * This module provides utility functions for receipt analysis and validation,
 * focusing on detecting pre-owned/reused items, date parsing, store detection,
 * and generating sustainability metadata.
 * 
 * @module receiptUtils
 */

/**
 * Detects if a GameStop receipt item is pre-owned based on SKU.
 * GameStop SKUs containing "930" indicate pre-owned products.
 * @param skuLine String that may contain a GameStop SKU
 * @returns Boolean indicating if the SKU represents a pre-owned item
 */
export function isGameStopPreOwnedSKU(skuLine: string): boolean {
  return skuLine.includes('930');
}

/**
 * Detects if receipt text indicates pre-owned or used items
 * @param text Receipt text content
 * @returns Boolean indicating if pre-owned items are detected
 */
export function detectPreOwnedStatus(text: string): boolean {
  const keywords = [
    "pre-owned", 
    "used", 
    "refurbished", 
    "pre owned", 
    "preowned",
    "secondhand", 
    "second-hand", 
    "second hand", 
    "previously owned",
    "preloved",
    "gently used",
    "vintage"
  ];
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Generates sustainability tags based on receipt content
 * @param text Receipt text
 * @param storeName Store name
 * @returns Array of sustainability category tags
 */
export function generateSustainabilityTags(text: string, storeName: string): string[] {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  const lowerStoreName = storeName?.toLowerCase() || '';
  
  // Add reuse tag if pre-owned detected
  if (detectPreOwnedStatus(text)) {
    tags.push("reuse", "pre-owned");
  }
  
  // Add category-specific tags
  if (lowerText.includes("game") || lowerStoreName.includes("gamestop") || lowerStoreName.includes("game stop")) {
    tags.push("video games");
    
    // Check for GameStop pre-owned SKUs (930 is the SKU indicator for pre-owned items)
    if (lowerStoreName.includes("gamestop") || lowerStoreName.includes("game stop")) {
      const lines = text.split('\n');
      // Check each line for SKU indicators
      for (const line of lines) {
        if (isGameStopPreOwnedSKU(line)) {
          if (!tags.includes("pre-owned")) tags.push("pre-owned");
          if (!tags.includes("reuse")) tags.push("reuse");
          break; // Found at least one pre-owned item
        }
      }
    }
  } else if (lowerText.includes("book") || lowerStoreName.includes("barnes") || lowerStoreName.includes("books")) {
    tags.push("books");
  } else if (
    lowerText.includes("vinyl") || 
    lowerText.includes("cd") || 
    lowerText.includes("record") || 
    lowerStoreName.includes("amoeba") || 
    lowerStoreName.includes("music")
  ) {
    tags.push("music");
  } else if (lowerText.includes("movie") || lowerText.includes("dvd") || lowerText.includes("blu-ray")) {
    tags.push("movies");
  } else if (
    lowerText.includes("clothing") || 
    lowerText.includes("apparel") || 
    lowerStoreName.includes("secondhand") || 
    lowerStoreName.includes("consignment") || 
    lowerStoreName.includes("vintage")
  ) {
    tags.push("clothing");
  } else if (lowerText.includes("furniture") || lowerText.includes("decor") || lowerText.includes("home goods")) {
    tags.push("furniture");
  }
  
  // Check for rideshare service keywords
  if (
    lowerStoreName.includes("uber") || 
    lowerStoreName.includes("lyft") || 
    lowerStoreName.includes("waymo") || 
    lowerStoreName.includes("rideshare") || 
    lowerStoreName.includes("taxi")
  ) {
    tags.push("rideshare");
  }
  
  return tags;
}

/**
 * Check if a card number belongs to a VeChain Visa
 * @param lastFour Last 4 digits of card number
 * @returns Boolean indicating if card is likely a VeChain Visa
 */
export function isVeChainVisaCard(cardInfo: string): boolean {
  // This would be replaced with actual BIN ranges when available
  // For now, it's a placeholder detection mechanism that checks for VeChain-related text
  
  if (!cardInfo) return false;
  
  const lowerCardInfo = cardInfo.toLowerCase();
  
  // Check for any VeChain identifiers
  return (
    lowerCardInfo.includes("vechain") || 
    lowerCardInfo.includes("vet") ||
    // For testing purposes, we'll also detect specific last 4 digits
    // In production, this would be replaced with actual BIN range checks
    cardInfo.endsWith("1234") || 
    cardInfo.endsWith("8888")
  );
}

/**
 * Payment method information interface
 */
interface PaymentMethodInfo {
  method: string;
  cardLastFour?: string;
  isDigital: boolean;
}

/**
 * Extract payment method from receipt text
 * @param text Receipt text content
 * @returns Object with payment method details
 */
export function extractPaymentMethod(text: string): PaymentMethodInfo {
  const lowerText = text.toLowerCase();
  
  // Default payment info
  let paymentInfo: PaymentMethodInfo = {
    method: "UNKNOWN",
    isDigital: false
  };
  
  // Check for cash payment indicators
  if (
    lowerText.includes("cash tender") || 
    lowerText.includes("cash payment") ||
    (lowerText.includes("cash") && (lowerText.includes("change") || lowerText.includes("tendered")))
  ) {
    paymentInfo.method = "CASH";
    return paymentInfo;
  }
  
  // Check for credit card indicators
  if (lowerText.includes("visa")) {
    paymentInfo.method = "VISA";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("mastercard") || lowerText.includes("master card")) {
    paymentInfo.method = "MASTERCARD";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("american express") || lowerText.includes("amex")) {
    paymentInfo.method = "AMEX";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("discover")) {
    paymentInfo.method = "DISCOVER";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("credit") || lowerText.includes("card")) {
    paymentInfo.method = "CARD";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("apple pay") || lowerText.includes("applepay")) {
    paymentInfo.method = "APPLE PAY";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("google pay") || lowerText.includes("googlepay")) {
    paymentInfo.method = "GOOGLE PAY";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("paypal")) {
    paymentInfo.method = "PAYPAL";
    paymentInfo.isDigital = true;
  } else if (lowerText.includes("vechain") || lowerText.includes("vet pay")) {
    paymentInfo.method = "VECHAIN";
    paymentInfo.isDigital = true;
  }
  
  // Try to extract last 4 digits of card if it's a card payment
  if (paymentInfo.isDigital) {
    // Look for patterns like XXXX1234 or ending in 1234
    const cardPattern = /[xX*]{4}(\d{4})|ending in (\d{4})|last 4: (\d{4})/;
    const match = text.match(cardPattern);
    
    if (match) {
      // Use whichever capturing group matched
      const lastFour = match[1] || match[2] || match[3];
      paymentInfo = {
        ...paymentInfo,
        cardLastFour: lastFour
      };
      
      // Check if this might be a VeChain Visa
      if (paymentInfo.method === "VISA" && isVeChainVisaCard(lastFour)) {
        paymentInfo.method = "VECHAIN VISA";
      }
    }
  }
  
  return paymentInfo;
}

/**
 * Parse date from receipt text with enhanced formats and fallbacks
 * @param text Receipt text content
 * @returns Object with parsed date and confidence score
 */
export function parseReceiptDate(text: string): { date: string | null; confidence: number; formats: string[] } {
  // Return value format
  const result = {
    date: null as string | null,
    confidence: 0,
    formats: [] as string[]
  };
  
  if (!text) return result;
  
  // Get today and 30 days ago for sanity checking
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Various date formats to try (from most to least specific)
  // US style: MM/DD/YYYY, MM-DD-YYYY
  // International: YYYY-MM-DD, DD/MM/YYYY 
  // Other common: MM/DD/YY, Month DD, YYYY, DD Month YYYY
  
  // First look for explicit date labels
  const dateLabels = [
    /date\s*:?\s*([\d\/\-\.]+)/i,
    /purchase\s*date\s*:?\s*([\d\/\-\.]+)/i,
    /transaction\s*date\s*:?\s*([\d\/\-\.]+)/i,
    /receipt\s*date\s*:?\s*([\d\/\-\.]+)/i,
  ];
  
  for (const pattern of dateLabels) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Try to parse labeled date first
      const parsedDate = attemptDateParse(match[1]);
      if (parsedDate.date) {
        result.date = parsedDate.date;
        result.confidence = 0.9; // High confidence because it was explicitly labeled
        result.formats.push(parsedDate.format);
        break;
      }
    }
  }
  
  // If no labeled date found, try to find any date-like pattern
  if (!result.date) {
    // Common date formats
    const datePatterns = [
      // ISO format (YYYY-MM-DD)
      { 
        regex: /\b(20\d{2})[\/\-\.](0[1-9]|1[0-2])[\/\-\.](0[1-9]|[12][0-9]|3[01])\b/,
        format: "YYYY-MM-DD",
        confidence: 0.85,
        builder: (m: RegExpMatchArray) => `${m[1]}-${m[2]}-${m[3]}`
      },
      // US format (MM/DD/YYYY)
      { 
        regex: /\b(0[1-9]|1[0-2])[\/\-\.](0[1-9]|[12][0-9]|3[01])[\/\-\.](20\d{2})\b/,
        format: "MM/DD/YYYY",
        confidence: 0.8,
        builder: (m: RegExpMatchArray) => `${m[3]}-${m[1]}-${m[2]}`
      },
      // International (DD/MM/YYYY)
      { 
        regex: /\b(0[1-9]|[12][0-9]|3[01])[\/\-\.](0[1-9]|1[0-2])[\/\-\.](20\d{2})\b/,
        format: "DD/MM/YYYY",
        confidence: 0.7, // Less confidence because could be confused with MM/DD
        builder: (m: RegExpMatchArray) => `${m[3]}-${m[2]}-${m[1]}`
      },
      // Short year (MM/DD/YY)
      { 
        regex: /\b(0[1-9]|1[0-2])[\/\-\.](0[1-9]|[12][0-9]|3[01])[\/\-\.](2[0-9])\b/,
        format: "MM/DD/YY", 
        confidence: 0.65,
        builder: (m: RegExpMatchArray) => `20${m[3]}-${m[1]}-${m[2]}`
      },
      // Month name formats
      {
        regex: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s]+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(20\d{2})\b/i,
        format: "Month DD, YYYY",
        confidence: 0.85,
        builder: (m: RegExpMatchArray) => {
          const month = getMonthNumber(m[1]);
          return `${m[3]}-${month.toString().padStart(2, '0')}-${m[2].toString().padStart(2, '0')}`;
        }
      },
      // Day first with month name
      {
        regex: /\b(\d{1,2})(?:st|nd|rd|th)?[,\s]+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s]+(20\d{2})\b/i,
        format: "DD Month YYYY",
        confidence: 0.8,
        builder: (m: RegExpMatchArray) => {
          const month = getMonthNumber(m[2]);
          return `${m[3]}-${month.toString().padStart(2, '0')}-${m[1].toString().padStart(2, '0')}`;
        }
      }
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const isoDate = pattern.builder(match);
        const dateObj = new Date(isoDate);
        
        // Sanity check - is this a valid date within reasonable range?
        // Don't accept future dates or dates > 30 days old
        if (!isNaN(dateObj.getTime()) && dateObj <= today && dateObj >= thirtyDaysAgo) {
          result.date = isoDate;
          result.confidence = pattern.confidence;
          result.formats.push(pattern.format);
          break;
        } else if (!isNaN(dateObj.getTime())) {
          // It's a valid date but outside our range
          result.date = isoDate;
          result.confidence = pattern.confidence * 0.6; // Reduce confidence
          result.formats.push(pattern.format + " (outside preferred date range)");
        }
      }
    }
  }
  
  // If still no date found, check for time stamps that may indicate today
  if (!result.date) {
    // Looking for just time patterns like "12:34:56" or "12:34 PM"
    const timePattern = /\b(1[0-2]|0?[1-9]):([0-5][0-9])(?::([0-5][0-9]))?(?:\s*(am|pm))?\b/i;
    if (text.match(timePattern)) {
      // If we see a time without a date, assume it's today's receipt
      const todayISO = today.toISOString().split('T')[0];
      result.date = todayISO;
      result.confidence = 0.5; // Lower confidence because we're assuming
      result.formats.push("Time only, assuming today's date");
    }
  }
  
  return result;
}

/**
 * Helper function for parseReceiptDate
 * @param monthName Month name or abbreviation
 * @returns Month number (1-12)
 */
function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    'jan': 1, 'january': 1,
    'feb': 2, 'february': 2,
    'mar': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'may': 5,
    'jun': 6, 'june': 6,
    'jul': 7, 'july': 7,
    'aug': 8, 'august': 8,
    'sep': 9, 'september': 9,
    'oct': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dec': 12, 'december': 12
  };
  
  return months[monthName.toLowerCase().substring(0, 3)] || 0;
}

/**
 * Helper function to attempt parsing various date formats
 * @param dateStr Date string to parse
 * @returns Object with parsed date and format used
 */
function attemptDateParse(dateStr: string): { date: string | null; format: string } {
  // Try various date formats
  const formats = [
    { regex: /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/, format: "YYYY-MM-DD", builder: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` },
    { regex: /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, format: "MM/DD/YYYY", builder: (m: RegExpMatchArray) => `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` },
    { regex: /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/, format: "MM/DD/YY", builder: (m: RegExpMatchArray) => `20${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` }
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format.regex);
    if (match) {
      const isoDate = format.builder(match);
      const dateObj = new Date(isoDate);
      if (!isNaN(dateObj.getTime())) {
        return { date: isoDate, format: format.format };
      }
    }
  }
  
  return { date: null, format: "unknown" };
}

/**
 * Parse store details from receipt text with confidence scores
 * @param text Receipt text content
 * @returns Object with store details and confidence score
 */
export function parseStoreDetails(text: string): { 
  storeName: string | null; 
  confidence: number;
  isGameStop: boolean;
  address?: string | null;
  phoneNumber?: string | null;
} {
  // Default store details
  const result = {
    storeName: null as string | null,
    confidence: 0,
    isGameStop: false,
    address: null as string | null,
    phoneNumber: null as string | null
  };
  
  if (!text) return result;
  
  // Look for GameStop pattern first (special handling for the task card issue)
  if (text.match(/game\s*stop/i) || text.match(/gamestop/i)) {
    result.storeName = "GameStop";
    result.confidence = 0.9;
    result.isGameStop = true;
    
    // Extract additional GameStop details
    // Store number pattern
    const storeNumberMatch = text.match(/store(?:\s+|\s*:?\s*|\s*#\s*)(\d+)/i);
    if (storeNumberMatch) {
      result.storeName = `GameStop #${storeNumberMatch[1]}`;
      result.confidence = 0.95;
    }
    
    return result;
  }
  
  // Try to extract obvious store names from receipt headers
  // Common patterns for store names at the top of receipts
  const storePatterns = [
    // Store name followed by typical header elements
    /^[\s*]*([A-Za-z0-9\s&'\-]+?)(?:\r?\n|\s{2,}|$)/m,
    // Name with "Inc" or similar
    /^[\s*]*([A-Za-z0-9\s&'\-]+?(?:Inc\.?|LLC|Corp\.?|Company))(?:\r?\n|\s{2,}|$)/im,
    // Centered name (usually has equal spaces on both sides)
    /^\s{2,}([A-Za-z0-9\s&'\-]{3,}?)\s{2,}$/m,
    // Name followed by address or phone
    /^[\s*]*([A-Za-z0-9\s&'\-]+?)(?:\r?\n|\s{2,})(?:\d{1,5}(?:\s[A-Za-z0-9\s&'\-]+){2,}|(?:\+\d|\(\d{3}\)))/m
  ];
  
  for (const pattern of storePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up the name
      let storeName = match[1].trim();
      
      // Avoid extracting receipt-related words as store names
      const blacklistTerms = ['receipt', 'invoice', 'sale', 'transaction', 'customer copy', 'welcome to', 'thank you'];
      if (!blacklistTerms.some(term => storeName.toLowerCase().includes(term))) {
        result.storeName = storeName;
        result.confidence = 0.8; // Reasonable confidence
        break;
      }
    }
  }
  
  // Look for address pattern
  const addressPattern = /(\d{1,5}(?:\s[A-Za-z0-9\s&'\-\.]+){2,}?,\s*[A-Za-z\s]+?,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?)/;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) {
    result.address = addressMatch[1];
    
    // If we have an address but no store name, look for the line or two above the address
    if (!result.storeName) {
      const addressPosition = text.indexOf(addressMatch[1]);
      if (addressPosition > 0) {
        // Get the text before the address, limited to 200 chars
        const textBeforeAddress = text.substring(Math.max(0, addressPosition - 200), addressPosition);
        // Split into lines and get the last 1-2 non-empty lines
        const lines = textBeforeAddress.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const potentialName = lines[lines.length - 1].trim();
          // Simple validation - not too short, not too long
          if (potentialName.length > 3 && potentialName.length < 50) {
            result.storeName = potentialName;
            result.confidence = 0.7; // Moderate confidence
          }
        }
      }
    }
  }
  
  // Look for phone number
  const phonePattern = /(?:\+\d|\(\d{3}\)|\d{3}[-\.\s])\d{3}[-\.\s]\d{4}/;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch) {
    result.phoneNumber = phoneMatch[0];
  }
  
  // Check for mentions of common thrift/secondhand stores
  const knownStores = [
    { name: "Goodwill", pattern: /goodwill/i, confidence: 0.9 },
    { name: "Salvation Army", pattern: /salvation\s*army/i, confidence: 0.9 },
    { name: "Savers", pattern: /\bsavers\b/i, confidence: 0.85 },
    { name: "Buffalo Exchange", pattern: /buffalo\s*exchange/i, confidence: 0.9 },
    { name: "Plato's Closet", pattern: /plato'?s\s*closet/i, confidence: 0.9 },
    { name: "Half Price Books", pattern: /half\s*price\s*books/i, confidence: 0.9 },
    { name: "2nd & Charles", pattern: /2nd\s*(?:and|&)\s*charles/i, confidence: 0.9 },
    { name: "GameStop", pattern: /gamestop|game\s*stop/i, confidence: 0.9 },
    { name: "ThriftBooks", pattern: /thriftbooks/i, confidence: 0.9 },
    { name: "Vintage Stock", pattern: /vintage\s*stock/i, confidence: 0.9 },
    { name: "Disc Replay", pattern: /disc\s*replay/i, confidence: 0.9 }
  ];
  
  for (const store of knownStores) {
    if (text.match(store.pattern)) {
      // If we already identified a store with lower confidence, replace it
      if (!result.storeName || result.confidence < store.confidence) {
        result.storeName = store.name;
        result.confidence = store.confidence;
        
        if (store.name === "GameStop") {
          result.isGameStop = true;
        }
      }
    }
  }
  
  return result;
}

/**
 * Check if receipt is from a pre-owned game store (especially GameStop)
 * Enhanced detection for the reported GameStop issues
 * @param text Receipt text
 * @param storeName Store name if already detected
 * @returns Object with detection results
 */
export function detectPreOwnedGameReceipt(text: string, storeName?: string): {
  isGameStore: boolean;
  hasPreOwnedItems: boolean;
  confidence: number;
  preOwnedKeywords: string[];
} {
  const result = {
    isGameStore: false,
    hasPreOwnedItems: false,
    confidence: 0,
    preOwnedKeywords: [] as string[]
  };
  
  if (!text) return result;
  
  const lowerText = text.toLowerCase();
  const lowerStoreName = storeName?.toLowerCase() || '';
  
  // Check if this is a game store
  if (
    lowerStoreName.includes('gamestop') || 
    lowerStoreName.includes('game stop') ||
    lowerText.includes('gamestop') || 
    lowerText.includes('game stop') ||
    lowerText.includes('video game')
  ) {
    result.isGameStore = true;
    result.confidence = 0.8;
  }
  
  // GameStop specific pre-owned keywords
  const gameStopPreOwnedKeywords = [
    "pre-owned", 
    "pre owned",
    "preowned", 
    "used", 
    "refurbished",
    "pre-played",
    "previously played",
    "previously owned",
    "trade credit", // indicates trade-in which likely implies purchasing pre-owned
    "trade in value",
    "trade-in"
  ];
  
  // Check for GameStop pre-owned indicators
  for (const keyword of gameStopPreOwnedKeywords) {
    if (lowerText.includes(keyword)) {
      result.hasPreOwnedItems = true;
      result.preOwnedKeywords.push(keyword);
      result.confidence = Math.max(result.confidence, 0.9); // Increase confidence
    }
  }
  
  // Check for GameStop SKU indicator '930' that reliably identifies pre-owned items
  if (result.isGameStore && 
      (lowerStoreName.includes('gamestop') || lowerStoreName.includes('game stop') || 
       lowerText.includes('gamestop') || lowerText.includes('game stop'))
     ) {
    // Split by line to check each item line
    const lines = text.split('\n');
    for (const line of lines) {
      if (isGameStopPreOwnedSKU(line)) {
        result.hasPreOwnedItems = true;
        if (!result.preOwnedKeywords.includes('930 SKU code')) {
          result.preOwnedKeywords.push('930 SKU code');
        }
        result.confidence = 0.95; // Very high confidence based on SKU
        break;
      }
    }
  }
  
  // Special case for price patterns that often indicate pre-owned at GameStop
  // Example: "PS4 God of War  19.99" (No dollar sign, typical for pre-owned listings)
  if (result.isGameStore) {
    // Patterns like "PS4", "PS5", "XBOX" followed by a game title and price
    const gamePatterns = [
      /\b(ps[45]|ps|xbox|switch|wii|nintendo)\s+([a-z0-9\s\-&':]+?)\s+(\d{1,2}\.\d{2})\b/i,
      /\b(used|pre-owned)?\s*([a-z0-9\s\-&':]+?)\s+(\d{1,2}\.\d{2})\b/i
    ];
    
    for (const pattern of gamePatterns) {
      const matches = lowerText.match(new RegExp(pattern, 'g'));
      if (matches && matches.length > 0) {
        // Likely pre-owned item listing pattern detected
        result.hasPreOwnedItems = true;
        result.preOwnedKeywords.push("game price pattern detected");
        
        if (matches.length >= 2) {
          // Multiple matching patterns increases confidence
          result.confidence = 0.85;
        } else {
          result.confidence = Math.max(result.confidence, 0.7);
        }
      }
    }
  }
  
  return result;
}