import fetch from 'node-fetch';
import { log } from '../vite';

// Google Sheets App Script webhook for receipt rewards logging
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw3cDppOWbfrgrTMpt_fodCOWGlcmmAnEuAb2n8cST1sQtiyYrcetoljbPbgE05kMFV/exec';

// Google Sheets App Script webhook for manual review when AI validation fails
// Updated to use the new receipt collection sheet URL
const MANUAL_REVIEW_WEBHOOK_URL = process.env.MANUAL_REVIEW_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxpPTrjbN0kmMppz_XOpti-kTDA9dpriLC81h1XYIhpPaRZI6sImPc0soooCWyP1UIMcQ/exec';

// Google Sheets App Script webhook for updating receipt approval status
const RECEIPT_APPROVAL_WEBHOOK_URL = process.env.RECEIPT_APPROVAL_WEBHOOK_URL || GOOGLE_SHEETS_WEBHOOK_URL;

/**
 * Sends receipt and user data to Google Sheets for DAO auditing and developer review
 * @param receiptData The receipt data to log
 * @param userData The user data associated with the receipt
 * @param rewardDetails Optional reward calculation details
 * @returns A promise that resolves when the webhook has been sent
 */
/**
 * Interface defining required fields for Google Sheets webhook
 */
interface RequiredWebhookFields {
  // Critical fields that must be present
  storeName: string;
  purchaseDate: string;
  amount: number;
  tokenReward: number;
  containsPreOwnedItems: boolean;
  
  // Optional but important fields
  paymentMethod?: {
    method: string;  // e.g., "VISA", "CASH", "MASTERCARD", "VECHAIN VISA"
    cardLastFour?: string | null;
    isDigital: boolean;
  };
  isVeChainVisa?: boolean;
  preOwnedKeywordsFound?: string[];
  sustainabilityCategory?: string;
  reasons?: string[];
}

/**
 * Validates that all required fields for Google Sheets are present
 * @param data Object to validate for required webhook fields
 * @returns A validation result with details about missing fields
 */
function validateRequiredWebhookFields(data: any): { 
  isValid: boolean; 
  missingFields: string[];
  updatedData: Partial<RequiredWebhookFields>;
} {
  const result = {
    isValid: true,
    missingFields: [] as string[],
    updatedData: {} as Partial<RequiredWebhookFields>
  };
  
  // Check for store name - critical field
  if (!data.storeName || data.storeName === 'Unknown Store' || data.storeName === '') {
    result.missingFields.push('storeName');
    result.isValid = false;
  } else {
    result.updatedData.storeName = data.storeName;
  }
  
  // Check for purchase date - critical field
  // Use a triple fallback mechanism to ensure we always have a valid date
  let purchaseDateToUse = data.purchaseDate;
  
  // First fallback: Try purchaseDate from receipt data
  if (purchaseDateToUse === undefined || purchaseDateToUse === null) {
    console.log(`[WEBHOOK] Missing purchase date in primary field, checking additionalData`);
    // Second fallback: Try receipt.purchaseDate if it exists
    purchaseDateToUse = data.receipt?.purchaseDate;
  }
  
  // Third fallback: If still undefined, use today's date
  if (purchaseDateToUse === undefined || purchaseDateToUse === null) {
    console.log(`[WEBHOOK] Missing purchase date in all fallbacks, using today's date`);
    const todayFormatted = new Date().toISOString().split('T')[0];
    result.updatedData.purchaseDate = todayFormatted;
    // Don't mark as invalid since we're using a fallback
    result.isValid = true;
  } else {
    // Ensure date is always formatted as YYYY-MM-DD string for Google Sheets
    try {
      // Handle both Date objects and ISO strings
      const dateObj = purchaseDateToUse instanceof Date 
        ? purchaseDateToUse 
        : new Date(purchaseDateToUse);
      
      // Format as YYYY-MM-DD
      const formattedDate = dateObj.toISOString().split('T')[0];
      result.updatedData.purchaseDate = formattedDate;
      
      // Log the date transformation
      console.log(`[WEBHOOK] Purchase date transformed: ${purchaseDateToUse} → ${formattedDate}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[WEBHOOK] Error formatting purchase date: ${errorMessage}`);
      // Use today's date as fallback in case of error
      const todayFormatted = new Date().toISOString().split('T')[0];
      result.updatedData.purchaseDate = todayFormatted;
      console.log(`[WEBHOOK] Date error, using today's date: ${todayFormatted}`);
    }
  }
  
  // Check for amount - critical field with fallback mechanism
  // Try multiple places where amount might be stored
  let amountToUse = data.amount;
  
  // First fallback: Check normal amount field
  if (amountToUse === undefined || amountToUse === null) {
    console.log(`[WEBHOOK] Missing amount in primary field, checking purchaseAmount`);
    // Try alternate field names
    amountToUse = data.purchaseAmount || data.totalAmount;
  }
  
  // Second fallback: Try receipt.amount or purchase_amount if it exists
  if (amountToUse === undefined || amountToUse === null) {
    console.log(`[WEBHOOK] Missing amount in secondary fields, checking receipt data`);
    amountToUse = data.receipt?.amount || data.purchase_amount;
  }
  
  // Final fallback: If all attempts fail, use 0
  if (amountToUse === undefined || amountToUse === null) {
    console.log(`[WEBHOOK] Missing amount in all fallbacks, using zero as default`);
    result.updatedData.amount = 0;
    // Don't mark as invalid since we're using a fallback
  } else {
    const numericAmount = parseFloat(String(amountToUse));
    
    if (isNaN(numericAmount)) {
      console.log(`[WEBHOOK] Invalid amount format: ${amountToUse}, using zero as default`);
      // Default to zero but don't invalidate the whole submission
      result.updatedData.amount = 0;
    } else {
      // Round to 2 decimal places for consistency
      result.updatedData.amount = Math.round(numericAmount * 100) / 100;
    }
  }
  
  // Check for token reward - critical field with multiple fallbacks
  let tokenReward = data.tokenReward;
  
  // First fallback: Check if rewardDetails has finalReward
  if (tokenReward === undefined || tokenReward === null) {
    console.log(`[WEBHOOK] Missing tokenReward in primary field, checking rewardDetails`);
    tokenReward = data.rewardDetails?.finalReward || 
                 data.finalReward || 
                 data.reward || 
                 data.rewardInfo?.finalReward;
  }
  
  // Second fallback: Look in receipt data
  if (tokenReward === undefined || tokenReward === null) {
    console.log(`[WEBHOOK] Missing tokenReward in all secondary fields, checking receipt data`);
    tokenReward = data.receipt?.tokenReward || 
                 data.receipt?.finalReward || 
                 data.rewardInfo?.finalReward;
  }
  
  // Final fallback: Default to appropriate tokens for transportation receipts or 0 otherwise
  if (tokenReward === undefined || tokenReward === null) {
    // Check if this is a transportation receipt (based on store name in previous validations)
    const storeNameForCheck = (result.updatedData.storeName || '').toLowerCase();
    if (storeNameForCheck.includes('uber') || storeNameForCheck.includes('lyft') || storeNameForCheck.includes('ride')) {
      console.log(`[WEBHOOK] Missing tokenReward, but detected rideshare service "${result.updatedData.storeName}", using 6 as default`);
      tokenReward = 6;
    } else if (storeNameForCheck.includes('bus') || storeNameForCheck.includes('metro') || storeNameForCheck.includes('transit') || 
               storeNameForCheck.includes('rail') || storeNameForCheck.includes('subway')) {
      console.log(`[WEBHOOK] Missing tokenReward, but detected public transit "${result.updatedData.storeName}", using 4 as default`);
      tokenReward = 4;
    } else {
      console.log(`[WEBHOOK] Missing tokenReward in all fallbacks, using default value of 0`);
      tokenReward = 0;
    }
  }
  
  // Parse to ensure it's a number
  const numericReward = parseFloat(String(tokenReward));
  if (isNaN(numericReward)) {
    console.log(`[WEBHOOK] Invalid tokenReward format: ${tokenReward}, using zero as default`);
    result.updatedData.tokenReward = 0;
  } else {
    // Round to 1 decimal place for consistency
    result.updatedData.tokenReward = Math.round(numericReward * 10) / 10;
  }
  
  // Check for pre-owned status - important field
  const containsPreOwnedItems = 
    data.containsPreOwnedItems !== undefined ? data.containsPreOwnedItems : false;
  result.updatedData.containsPreOwnedItems = containsPreOwnedItems;
  
  // Handle payment method details
  if (data.paymentMethod) {
    // If it's already a properly formatted payment method object
    if (typeof data.paymentMethod === 'object' && data.paymentMethod !== null) {
      result.updatedData.paymentMethod = {
        method: data.paymentMethod.method || 'UNKNOWN',
        cardLastFour: data.paymentMethod.cardLastFour || null,
        isDigital: data.paymentMethod.isDigital === true
      };
    } 
    // If it's just a string (e.g., "VISA", "CASH")
    else if (typeof data.paymentMethod === 'string') {
      result.updatedData.paymentMethod = {
        method: data.paymentMethod,
        cardLastFour: undefined, // Use undefined instead of null to satisfy TypeScript
        isDigital: data.paymentMethod !== 'CASH' // Assume digital if not cash
      };
    }
    
    // Detect VeChain Visa card
    if (result.updatedData.paymentMethod?.method === 'VISA' || 
        result.updatedData.paymentMethod?.method === 'VECHAIN VISA') {
      if (result.updatedData.paymentMethod.cardLastFour) {
        // Check if it's a VeChain Visa card by last 4 digits
        const isVeChainVisa = ['5656', '7890', '1234'].includes(result.updatedData.paymentMethod.cardLastFour);
        result.updatedData.isVeChainVisa = isVeChainVisa;
      }
    }
  }
  
  // Handle pre-owned keywords
  if (data.preOwnedKeywordsFound && Array.isArray(data.preOwnedKeywordsFound)) {
    result.updatedData.preOwnedKeywordsFound = data.preOwnedKeywordsFound;
  }
  
  // Handle sustainability category
  if (data.sustainabilityCategory) {
    result.updatedData.sustainabilityCategory = data.sustainabilityCategory;
  } else if (data.sustainableCategory) {
    result.updatedData.sustainabilityCategory = data.sustainableCategory;
  } else if (data.purchaseCategory) {
    result.updatedData.sustainabilityCategory = data.purchaseCategory;
  } else if (data.category) {
    result.updatedData.sustainabilityCategory = data.category;
  } else {
    // Default to transportation category
    result.updatedData.sustainabilityCategory = "sustainable_transportation";
  }
  
  // Force sustainability category to be a string (since the webhook expects a string)
  if (result.updatedData.sustainabilityCategory) {
    result.updatedData.sustainabilityCategory = String(result.updatedData.sustainabilityCategory);
    console.log(`[WEBHOOK] Using sustainability category: ${result.updatedData.sustainabilityCategory}`);
  }
  
  // Handle validation reasons
  if (data.reasons && Array.isArray(data.reasons)) {
    result.updatedData.reasons = data.reasons;
  }
  
  return result;
}

/**
 * Sends receipt to Google Sheets for manual review when AI validation fails or has low confidence
 * @param userId User ID 
 * @param storeName Store name detected from receipt (may be incomplete/incorrect)
 * @param purchaseDate Date of purchase from receipt
 * @param totalAmount Total amount from receipt
 * @param imageUrl URL to the uploaded receipt image (if available)
 * @param notes Additional notes about the validation issue
 * @param confidence Confidence score from AI validation (if available)
 * @returns Promise resolving to success status
 */
export async function sendReceiptForManualReview(
  userId: string | number,
  walletAddress: string | null,
  storeName: string | null,
  purchaseDate: string | null,
  totalAmount: number | null,
  imageUrl: string | null,
  notes: string,
  confidence: number = 0
): Promise<boolean> {
  try {
    console.log(`[MANUAL REVIEW] Processing transportation receipt for manual review - User: ${userId}`);
    
    // ✅ TRANSPORTATION FOCUS: Determine review type based on transportation service
    const storeNameLower = (storeName || '').toLowerCase();
    const notesLower = (notes || '').toLowerCase(); // Fix crash risk
    
    let reviewType = 'TRANSPORTATION VALIDATION';
    let reviewReason = "Transportation receipt requires manual validation";
    
    // Check for specific transportation types that commonly need manual review
    if (storeNameLower.includes('bus') || storeNameLower.includes('metro') || storeNameLower.includes('transit') ||
        notesLower.includes('bus') || notesLower.includes('metro') || notesLower.includes('transit')) {
      reviewType = 'PUBLIC TRANSIT VALIDATION';
      reviewReason = "Public transit receipts vary by city/state and require manual verification";
    } else if (storeNameLower.includes('rail') || storeNameLower.includes('subway') || storeNameLower.includes('lightrail') || storeNameLower.includes('light rail') || 
               storeNameLower.includes('tram') || storeNameLower.includes('streetcar') ||
               notesLower.includes('rail') || notesLower.includes('subway') || notesLower.includes('lightrail') || notesLower.includes('light rail') ||
               notesLower.includes('tram') || notesLower.includes('streetcar')) {
      reviewType = 'RAIL TRANSIT VALIDATION';
      reviewReason = "Rail/subway receipts have varied formats requiring manual verification";
    } else if (storeNameLower.includes('bike') || storeNameLower.includes('scooter') || storeNameLower.includes('e-bike') || storeNameLower.includes('ebike') ||
               storeNameLower.includes('e-scooter') || storeNameLower.includes('escooter') || storeNameLower.includes('bike share') || storeNameLower.includes('scooter share') ||
               notesLower.includes('bike') || notesLower.includes('scooter') || notesLower.includes('e-bike') || notesLower.includes('ebike') ||
               notesLower.includes('e-scooter') || notesLower.includes('escooter') || notesLower.includes('bike share') || notesLower.includes('scooter share')) {
      reviewType = 'SUSTAINABLE TRANSPORT VALIDATION';
      reviewReason = "Bike/scooter sharing receipt needs manual verification";
    }
    
    console.log(`[MANUAL REVIEW] Review Type: ${reviewType} - ${reviewReason}`);
    
    // Validate required fields
    if (!userId) {
      console.error('[MANUAL REVIEW ERROR] Missing required user ID');
      return false;
    }
    
    // Use appropriate fallbacks for missing data
    const normalizedStoreName = storeName || 'Unknown Store';
    const normalizedPurchaseDate = purchaseDate || new Date().toISOString().split('T')[0];
    const normalizedAmount = totalAmount || 0;
    
    // Create payload structure matching Google Sheets expected format
    const payload = {
      // Required fields from the task specification - both camelCase and snake_case for compatibility
      receiptId: Math.floor(Math.random() * 1000000), // Generate a temporary ID
      receipt_id: Math.floor(Math.random() * 1000000), // Generate a temporary ID
      userId: String(userId),
      user_id: String(userId),
      username: "Manual Review User",
      walletAddress: walletAddress || '',
      wallet_address: walletAddress || '',
      storeName: normalizedStoreName,
      store_name: normalizedStoreName,
      storeId: 0,
      store_id: 0,
      purchaseDate: normalizedPurchaseDate,
      purchase_date: normalizedPurchaseDate,
      purchaseAmount: normalizedAmount,
      purchase_amount: normalizedAmount,
      amount: normalizedAmount,
      
      // Category and sustainability information
      receiptCategory: "transportation-pending-review",
      receipt_category: "transportation-pending-review",
      sustainabilityCategory: "sustainable_transportation",
      sustainability_category: "sustainable_transportation",
      transportationType: reviewType.includes('PUBLIC TRANSIT') ? 'public_transit' : 
                         reviewType.includes('RAIL') ? 'rail_transit' : 
                         reviewType.includes('SUSTAINABLE') ? 'sustainable_transport' : 'general_transportation',
      transportation_type: reviewType.includes('PUBLIC TRANSIT') ? 'public_transit' : 
                          reviewType.includes('RAIL') ? 'rail_transit' : 
                          reviewType.includes('SUSTAINABLE') ? 'sustainable_transport' : 'general_transportation',
      
      // Payment information
      paymentMethod: {},
      payment_method: {},
      
      // Reward information - estimates for manual review
      baseReward: normalizedAmount > 0 ? 8 : 0, // Standard base reward for receipts
      base_reward: normalizedAmount > 0 ? 8 : 0,
      estimatedReward: normalizedAmount > 0 ? 10 : 0, // Estimated reward with streak/bonuses
      estimated_reward: normalizedAmount > 0 ? 10 : 0, 
      tokenReward: 0, // Still 0 until approved
      token_reward: 0, // Still 0 until approved
      finalReward: 0, // Still 0 until approved
      final_reward: 0, // Still 0 until approved
      pendingApproval: true,
      pending_approval: true,
      
      // Review status
      needsManualReview: true,
      needs_manual_review: true,
      isAcceptable: false,
      is_acceptable: false,
      manualReviewRequested: true,
      manual_review_requested: true,
      actionRequired: `NEEDS REVIEW - ${reviewType}`,
      action_required: `NEEDS REVIEW - ${reviewType}`,
      
      // Additional helpful fields
      confidenceScore: confidence || 0,
      confidence_score: confidence || 0,
      timestamp: new Date().toISOString(),
      eventType: 'manual_review',
      event_type: 'manual_review',
      isTestMode: false,
      is_test_mode: false,
      appVersion: '1.0.4',
      app_version: '1.0.4',
      
      // For debugging, log the entire payload
      _debugPayload: true,
      retryCount: 0, // For retry logic
      notes: notes || reviewReason,
      validation_reasons: notes || reviewReason,
      transportation_keywords_found: [reviewType, 'TRANSPORTATION', 'SUSTAINABLE'],
      transportationKeywordsFound: [reviewType, 'TRANSPORTATION', 'SUSTAINABLE'],
      transportation_evidence: `Receipt identified as ${reviewType.toLowerCase()} requiring manual verification for transportation service validation`,
      transportationEvidence: `Receipt identified as ${reviewType.toLowerCase()} requiring manual verification for transportation service validation`,
      
      // Critical: Include receipt image for manual reviewers
      imageUrl: imageUrl || null,
      image_url: imageUrl || null,
      receiptImageUrl: imageUrl || null,
      receipt_image_url: imageUrl || null,
      
      // Debug information
      debugHasReceipt: false,
      _debug_has_receipt: false,
      debugHasUser: true,
      _debug_has_user: true
    };
    
    console.log(`[MANUAL REVIEW] Payload prepared: Store: ${payload.storeName}, Date: ${payload.purchaseDate}, Amount: ${payload.amount}`);
    
    // Implement retry logic
    const MAX_RETRIES = 3;
    let attempts = 0;
    let success = false;
    
    while (attempts < MAX_RETRIES && !success) {
      attempts++;
      
      try {
        // Set up timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Update retry count in payload (for logging)
        const updatedPayload = { ...payload, retryCount: attempts - 1 };
        
        // Send the webhook request
        const response = await fetch(MANUAL_REVIEW_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Source': 'RecircleRewards-App',
            'X-Event-Type': 'manual_review',
            'X-Retry-Count': String(attempts - 1)
          },
          body: JSON.stringify(updatedPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check response
        if (response.ok) {
          console.log(`[MANUAL REVIEW] ✅ Receipt sent for manual review successfully`);
          success = true;
          break;
        } else {
          const errorText = await response.text();
          console.error(`[MANUAL REVIEW ERROR] Attempt ${attempts}/${MAX_RETRIES} failed: ${errorText}`);
          
          // Wait before retrying (exponential backoff)
          if (attempts < MAX_RETRIES) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
            console.log(`[MANUAL REVIEW] Retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
        }
      } catch (error) {
        console.error(`[MANUAL REVIEW ERROR] Attempt ${attempts}/${MAX_RETRIES} exception: ${error instanceof Error ? error.message : String(error)}`);
        
        // Wait before retrying (exponential backoff)
        if (attempts < MAX_RETRIES) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
          console.log(`[MANUAL REVIEW] Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    return success;
  } catch (error) {
    // Handle errors
    console.error(`[MANUAL REVIEW ERROR] Exception sending receipt for manual review: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

export async function logReceiptToGoogleSheets(
  receiptData: any, 
  userData: any, 
  rewardDetails?: {
    baseReward: number;
    streakMultiplier: number;
    digitalBonus: number;
    veChainBonus: number;
    finalReward: number;
    userWalletAddress?: string;
  },
  eventType: 'validation' | 'submission' = 'submission',
  additionalData?: {
    storeName?: string;
    containsPreOwnedItems?: boolean;
    sustainableCategory?: string;
    preOwnedKeywordsFound?: string[];
    paymentMethod?: any;
  }
) {
  try {
    // Log webhook invocation details for debugging
    console.log(`[WEBHOOK] Google Sheets logging triggered - Event Type: ${eventType}`);
    
    // Combine all data sources for validation
    const combinedData = {
      ...receiptData,
      rewardDetails,
      ...(additionalData || {})
    };
    
    // Use store info from additional data if available
    if (additionalData?.storeName && !receiptData.storeName) {
      combinedData.storeName = additionalData.storeName;
    }
    
    // Get store name from storeId if available and no storeName exists
    if (!combinedData.storeName && receiptData.storeId) {
      console.log(`[WEBHOOK] Attempting to use storeId ${receiptData.storeId} to get storeName`);
      combinedData.storeName = `Store ID ${receiptData.storeId}`;
    }
    
    // Perform validation of required fields
    const validation = validateRequiredWebhookFields(combinedData);
    
    // If missing critical fields, log error and don't send the webhook
    if (!validation.isValid) {
      console.error(`[WEBHOOK ERROR] Missing required fields for Google Sheets: ${validation.missingFields.join(', ')}`);
      
      // Detailed diagnostic info about the missing fields
      console.error('[WEBHOOK VALIDATION FAILURE]', {
        missingFields: validation.missingFields,
        receivedFields: {
          storeName: combinedData.storeName || '(missing)',
          purchaseDate: combinedData.purchaseDate || '(missing)',
          amount: combinedData.amount || '(missing)',
          tokenReward: combinedData.tokenReward || rewardDetails?.finalReward || '(missing)',
          containsPreOwnedItems: combinedData.containsPreOwnedItems !== undefined 
                                 ? combinedData.containsPreOwnedItems 
                                 : '(missing)',
        },
        eventType,
        receiptId: receiptData.id || 'unknown'
      });
      
      return false; // Do not proceed with sending incomplete data
    }
    
    // Log validation success
    console.log(`[WEBHOOK] Validation passed for required fields: ${Object.keys(validation.updatedData).join(', ')}`);
    
    // Prepare webhook payload using camelCase keys for Google Apps Script compatibility
    // AND include snake_case duplicates for backward compatibility
    const payload = {
      // Include both camelCase (for Google Apps Script) and snake_case (for backward compatibility)
      // Receipt specific fields
      receiptId: receiptData.id || 0,
      receipt_id: receiptData.id || 0,
      
      storeName: validation.updatedData.storeName || '', // Use validated store name 
      store_name: validation.updatedData.storeName || '', // Use validated store name
      
      storeId: receiptData.storeId || 0,
      store_id: receiptData.storeId || 0,
      
      userId: receiptData.userId || (userData ? userData.id : 0),
      user_id: receiptData.userId || (userData ? userData.id : 0),
      
      username: userData ? userData.username : '',
      
      walletAddress: userData?.walletAddress || rewardDetails?.userWalletAddress || null,
      wallet_address: userData?.walletAddress || rewardDetails?.userWalletAddress || null,
      
      purchaseAmount: validation.updatedData.amount || 0, // Use validated amount
      purchase_amount: validation.updatedData.amount || 0, // Use validated amount
      
      purchaseDate: validation.updatedData.purchaseDate || new Date().toISOString().split('T')[0], // Use validated date or today
      purchase_date: validation.updatedData.purchaseDate || new Date().toISOString().split('T')[0], // Use validated date or today
      
      receiptCategory: validation.updatedData.sustainabilityCategory || "re-use item", // Use detected category or standardized default 
      receipt_category: validation.updatedData.sustainabilityCategory || "re-use item", // Use detected category or standardized default
      
      // Additional sustainability data
      containsPreOwned: validation.updatedData.containsPreOwnedItems, // Use validated value
      contains_pre_owned: validation.updatedData.containsPreOwnedItems, // Use validated value
      
      preOwnedKeywordsFound: Array.isArray(receiptData.preOwnedKeywordsFound) ? 
                          receiptData.preOwnedKeywordsFound.join(', ') : 
                          (additionalData?.preOwnedKeywordsFound || []).join(', '),
      pre_owned_keywords_found: Array.isArray(receiptData.preOwnedKeywordsFound) ? 
                              receiptData.preOwnedKeywordsFound.join(', ') : 
                              (additionalData?.preOwnedKeywordsFound || []).join(', '),
      
      sustainabilityTags: "re-use item", // Standardized tag for all receipts
      sustainability_tags: "re-use item", // Standardized tag for all receipts
      
      // Payment method details
      paymentMethod: receiptData.paymentMethod?.method || receiptData.paymentMethod || 
                   (additionalData?.paymentMethod?.method || additionalData?.paymentMethod || ''),
      payment_method: receiptData.paymentMethod?.method || receiptData.paymentMethod || 
                     (additionalData?.paymentMethod?.method || additionalData?.paymentMethod || ''),
      
      paymentIsDigital: receiptData.paymentMethod?.isDigital || receiptData.isDigitalPayment || false,
      payment_is_digital: receiptData.paymentMethod?.isDigital || receiptData.isDigitalPayment || false,
      
      paymentCardLastFour: receiptData.paymentMethod?.cardLastFour || receiptData.cardLastFour || null,
      payment_card_last_four: receiptData.paymentMethod?.cardLastFour || receiptData.cardLastFour || null,
      
      isVechainVisa: receiptData.isVeChainVisa || false,
      is_vechain_visa: receiptData.isVeChainVisa || false,
      
      // Reward calculation details
      baseReward: rewardDetails?.baseReward || 0,
      base_reward: rewardDetails?.baseReward || 0,
      
      streakMultiplier: rewardDetails?.streakMultiplier || 1.0,
      streak_multiplier: rewardDetails?.streakMultiplier || 1.0,
      
      digitalPaymentBonus: rewardDetails?.digitalBonus || 0,
      digital_payment_bonus: rewardDetails?.digitalBonus || 0,
      
      vechainVisaBonus: rewardDetails?.veChainBonus || 0,
      vechain_visa_bonus: rewardDetails?.veChainBonus || 0,
      
      finalReward: validation.updatedData.tokenReward || 0, // Use validated token reward
      final_reward: validation.updatedData.tokenReward || 0, // Use validated token reward
      tokenReward: validation.updatedData.tokenReward || 0, // Additional alias specifically for tokenReward
      
      // Analysis confidence and validation
      confidenceScore: receiptData.confidence || 0,
      confidence_score: receiptData.confidence || 0,
      
      validationReasons: Array.isArray(receiptData.reasons) ? receiptData.reasons.join('; ') : '',
      validation_reasons: Array.isArray(receiptData.reasons) ? receiptData.reasons.join('; ') : '',
      
      isAcceptable: receiptData.isAcceptable !== undefined ? receiptData.isAcceptable : true,
      is_acceptable: receiptData.isAcceptable !== undefined ? receiptData.isAcceptable : true,
      
      // System metadata
      userStreak: userData?.currentStreak || 0,
      user_streak: userData?.currentStreak || 0,
      
      tokenBalance: userData?.tokenBalance || 0,
      token_balance: userData?.tokenBalance || 0,
      
      timestamp: new Date().toISOString(),
      
      eventType: eventType,
      event_type: eventType,
      
      isTestMode: receiptData.testMode || process.env.NODE_ENV === 'development',
      is_test_mode: receiptData.testMode || process.env.NODE_ENV === 'development',
      
      appVersion: '1.0.4', // Updated version to track this key format change
      app_version: '1.0.4', // Updated version to track this key format change
      
      // Receipt image URL for manual review (secure, token-based)
      imageUrl: (receiptData.id && receiptData.viewToken) 
        ? `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/api/receipt-image/${receiptData.id}?token=${receiptData.viewToken}` 
        : null,
      image_url: (receiptData.id && receiptData.viewToken) 
        ? `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/api/receipt-image/${receiptData.id}?token=${receiptData.viewToken}` 
        : null,
      
      // Fraud detection flags for manual review
      fraudFlags: Array.isArray(receiptData.fraudFlags) ? receiptData.fraudFlags.join(', ') : '',
      fraud_flags: Array.isArray(receiptData.fraudFlags) ? receiptData.fraudFlags.join(', ') : '',
      
      // For debugging - including essential data but not full objects that might cause issues
      debugHasReceipt: !!receiptData,
      _debug_has_receipt: !!receiptData,
      
      debugHasUser: !!userData,
      _debug_has_user: !!userData,
      
      debugHasRewards: !!rewardDetails,
      _debug_has_rewards: !!rewardDetails,
      
      debugWebhookAttemptTime: new Date().toISOString(),
      _debug_webhook_attempt_time: new Date().toISOString()
    };

    // Log more detailed information about the payload
    log(`Sending webhook to Google Sheets for ${eventType} event - Receipt ID: ${receiptData.id || 'new receipt'}`, 'webhooks');
    
    // Log the exact payload that will be sent to Google Sheets (limited to important fields)
    console.log(`[WEBHOOK PAYLOAD] Store: ${payload.store_name}, Date: ${payload.purchase_date}, Amount: ${payload.purchase_amount}, PreOwned: ${payload.contains_pre_owned}, Reward: ${payload.final_reward}, Category: ${payload.receipt_category}`);
    
    // Log full JSON payload for debugging
    console.log(`[WEBHOOK PAYLOAD FULL] ${JSON.stringify(payload)}`);

    // Send the webhook as a POST request with a timeout to avoid hanging
    console.log(`[WEBHOOK] Sending request to: ${GOOGLE_SHEETS_WEBHOOK_URL}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'RecircleRewards-App',
          'X-Event-Type': eventType
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Process the response
      if (!response.ok) {
        const text = await response.text();
        console.warn(`[WEBHOOK] Response not OK: Status ${response.status}, Text: ${text}`);
        throw new Error(`Google Sheets webhook failed with status ${response.status}: ${text}`);
      }

      const responseText = await response.text();
      console.log(`[WEBHOOK] Response received, length: ${responseText.length} characters`);
      
      // Try to parse the response as JSON, but don't fail if it's not valid JSON
      try {
        // Sometimes the response might contain HTML instead of JSON, especially with redirects
        // Strip out any HTML tags before attempting to parse
        const cleanedResponseText = responseText.replace(/<[^>]*>?/gm, '');
        
        // Try to extract JSON part if there's a mixture of HTML and JSON
        let jsonText = cleanedResponseText;
        const jsonStart = cleanedResponseText.indexOf('{');
        const jsonEnd = cleanedResponseText.lastIndexOf('}');
        
        if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
          jsonText = cleanedResponseText.substring(jsonStart, jsonEnd + 1);
        }
        
        // Now try to parse the cleaned text
        const parsedResponse = JSON.parse(jsonText);
        console.log(`[WEBHOOK] Full response (cleaned): ${JSON.stringify(parsedResponse)}`);
        
        // If the Google Sheets webhook reported a failure
        if (parsedResponse.success === false) {
          // Detailed error logging
          console.error(`[WEBHOOK ERROR] Google Sheets returned success:false`);
          console.error(`[WEBHOOK ERROR DETAILS] Error message from Google Sheets: ${parsedResponse.error || 'Unknown error'}`);
          
          // Additional error information for debugging the specific failure
          if (parsedResponse.error && parsedResponse.error.includes("Cannot read properties")) {
            console.error(`[WEBHOOK ERROR ANALYSIS] Google Sheets reported a missing property. This likely means the webhook payload is missing a required field or has an undefined value.`);
            
            // Check which specific field might be missing based on error
            if (parsedResponse.error.includes("purchaseDate")) {
              console.error(`[WEBHOOK ERROR CRITICAL] The purchaseDate field is missing or invalid in the webhook payload.`);
            } else if (parsedResponse.error.includes("storeName")) {
              console.error(`[WEBHOOK ERROR CRITICAL] The storeName field is missing or invalid in the webhook payload.`);
            } else if (parsedResponse.error.includes("amount")) {
              console.error(`[WEBHOOK ERROR CRITICAL] The amount field is missing or invalid in the webhook payload.`);
            }
          }
          
          log(`⚠️ [ALERT] Google Sheets webhook failed - ${parsedResponse.error || 'Unknown error'}`, 'webhooks');
          return false;
        } else {
          // Success case - correctly populated Google Sheet
          console.log(`[WEBHOOK] Full response: ${JSON.stringify(parsedResponse)}`);
          console.log(`[WEBHOOK] ✅ Success! Google Sheets confirmed data received and row added. Receipt ID: ${parsedResponse.receiptId || 'Unknown'}`);
          log('✅ Successfully sent receipt data to Google Sheets', 'webhooks');
          return true;
        }
      } catch (error: unknown) {
        // Not JSON or invalid JSON - this is unusual and should be logged as a warning
        console.warn(`[WEBHOOK] Warning: Response is not valid JSON: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
        
        // Type checking for the error message
        if (error instanceof Error) {
          console.warn(`[WEBHOOK] JSON Parse Error: ${error.message}`);
        } else {
          console.warn(`[WEBHOOK] JSON Parse Error: Unknown error during JSON parsing`);
        }
        
        // Determine if we should consider this a success based on response content
        const isLikelySuccess = responseText.toLowerCase().includes('success') || 
                              !responseText.toLowerCase().includes('error');
        
        if (isLikelySuccess) {
          log('Receipt data sent to Google Sheets with non-standard but likely successful response', 'webhooks');
          return true;
        } else {
          log('⚠️ Receipt data sent to Google Sheets with non-standard response that indicates an error', 'webhooks');
          return false;
        }
      }
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Google Sheets webhook request timed out after 10 seconds');
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: unknown) {
    // Log the error but don't disrupt the application flow
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`⚠️ Error sending receipt data to Google Sheets: ${errorMsg}`, 'webhooks');
    console.error('[WEBHOOK ERROR]', errorMsg);
    
    // Additional debug info
    console.error('[WEBHOOK ERROR DETAILS]', {
      eventType,
      receiptId: receiptData.id || 'unknown',
      storeName: receiptData.storeName || 'unknown',
      errorType: error instanceof Error ? error.name : typeof error,
      timestamp: new Date().toISOString()
    });
    
    return false;
  }
}