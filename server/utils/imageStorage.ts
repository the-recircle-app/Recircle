import crypto from 'crypto';
import { db } from '../db';
import { receiptImages, receipts } from '@shared/schema';
import { eq, lt } from 'drizzle-orm';

const RETENTION_DAYS = 30;

/**
 * Image storage utility for receipt fraud detection and manual review
 */

export interface ImageUploadResult {
  imageId: number;
  imageHash: string;
  fraudFlags: string[];
  isDuplicate: boolean;
  viewToken: string; // UUID for secure viewing
}

export interface FraudDetectionResult {
  flags: string[];
  riskScore: number; // 0-100, higher = more suspicious
  isHighRisk: boolean;
}

/**
 * Calculate SHA-256 hash of image data for duplicate detection
 */
export function calculateImageHash(imageData: string): string {
  return crypto.createHash('sha256').update(imageData).digest('hex');
}

/**
 * Detect potential fraud indicators in image data
 */
export function detectFraudIndicators(imageData: string, mimeType: string): FraudDetectionResult {
  const flags: string[] = [];
  let riskScore = 0;

  // Check file size (very small or very large files are suspicious)
  const sizeInBytes = Math.ceil(imageData.length * 0.75); // Approximate decoded size
  if (sizeInBytes < 10000) {
    flags.push('file_too_small');
    riskScore += 25;
  }
  if (sizeInBytes > 5000000) {
    flags.push('file_too_large');
    riskScore += 15;
  }

  // Check for unusual MIME types
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType.toLowerCase())) {
    flags.push('unusual_format');
    riskScore += 30;
  }

  // Check for potential editing indicators in base64 data
  // Look for patterns that might indicate image manipulation
  if (imageData.includes('photoshop') || imageData.includes('GIMP')) {
    flags.push('editing_software_detected');
    riskScore += 40;
  }

  // Check for suspiciously perfect compression ratios
  const compressionRatio = imageData.length / sizeInBytes;
  if (compressionRatio < 0.1 || compressionRatio > 2.0) {
    flags.push('unusual_compression');
    riskScore += 20;
  }

  return {
    flags,
    riskScore: Math.min(riskScore, 100),
    isHighRisk: riskScore >= 50
  };
}

/**
 * Store receipt image with fraud detection in database
 */
export async function storeReceiptImage(
  receiptId: number,
  imageData: string,
  mimeType: string
): Promise<ImageUploadResult> {
  // Calculate image hash for duplicate detection
  const imageHash = calculateImageHash(imageData);
  
  // Check for duplicate images
  const existingImage = await db
    .select()
    .from(receiptImages)
    .where(eq(receiptImages.imageHash, imageHash))
    .limit(1);

  const isDuplicate = existingImage.length > 0;
  
  // Run fraud detection
  const fraudDetection = detectFraudIndicators(imageData, mimeType);
  
  // Add duplicate flag if detected
  if (isDuplicate) {
    fraudDetection.flags.push('duplicate_image');
    fraudDetection.riskScore += 30;
    
    // Return existing image data instead of inserting duplicate
    const existing = existingImage[0];
    console.log(`[IMAGE-STORAGE] ⚠️ Duplicate image detected for receipt ${receiptId}, using existing image ${existing.id}`);
    console.log(`[IMAGE-STORAGE] 🔐 Fraud flags: ${fraudDetection.flags.join(', ')}`);
    
    // Update receipt to indicate it has an image
    await db
      .update(receipts)
      .set({ hasImage: true })
      .where(eq(receipts.id, receiptId));
    
    return {
      imageId: existing.id,
      imageHash: existing.imageHash,
      fraudFlags: fraudDetection.flags,
      isDuplicate: true,
      viewToken: existing.viewToken // Use existing token
    };
  }

  // Generate secure viewing token (UUID v4) for new image
  const viewToken = crypto.randomUUID();

  // Store the new image in database with view token
  const [storedImage] = await db
    .insert(receiptImages)
    .values({
      receiptId,
      imageData,
      imageHash,
      mimeType,
      fileSize: Math.ceil(imageData.length * 0.75),
      viewToken, // Secure token for viewing
      fraudFlags: fraudDetection.flags,
    })
    .returning();

  // Update receipt to indicate it has an image
  await db
    .update(receipts)
    .set({ hasImage: true })
    .where(eq(receipts.id, receiptId));
  
  console.log(`[IMAGE-STORAGE] ✅ Stored image for receipt ${receiptId} in database`);
  console.log(`[IMAGE-STORAGE] 🔐 Fraud flags: ${fraudDetection.flags.join(', ') || 'none'}`);
  console.log(`[IMAGE-STORAGE] 🔑 View token generated (first 8 chars): ${viewToken.substring(0, 8)}...`);

  return {
    imageId: storedImage.id,
    imageHash,
    fraudFlags: fraudDetection.flags,
    isDuplicate: false,
    viewToken // Return token for URL construction
  };
}

/**
 * Get receipt image for manual review (requires valid token)
 * This enforces token-based authentication to prevent enumeration attacks
 */
export async function getReceiptImageByToken(receiptId: number, viewToken: string) {
  const [image] = await db
    .select()
    .from(receiptImages)
    .where(eq(receiptImages.receiptId, receiptId))
    .limit(1);

  // Verify token matches (simple string equality - UUIDs are random enough to prevent timing attacks)
  if (!image || image.viewToken !== viewToken) {
    return null; // Don't reveal whether ID exists without valid token
  }

  return image;
}

/**
 * Get receipt image for manual review (legacy, use getReceiptImageByToken for security)
 * @deprecated Use getReceiptImageByToken instead for secure access
 */
export async function getReceiptImage(receiptId: number) {
  const [image] = await db
    .select()
    .from(receiptImages)
    .where(eq(receiptImages.receiptId, receiptId))
    .limit(1);

  return image || null;
}

/**
 * Delete receipt images older than retention period (30 days)
 * This runs periodically to clean up old images from the database
 */
export async function cleanupExpiredImages(): Promise<number> {
  try {
    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    console.log(`[IMAGE-CLEANUP] 🧹 Starting cleanup of images older than ${cutoffDate.toISOString()}`);
    
    // Delete old receipt images
    const result = await db
      .delete(receiptImages)
      .where(lt(receiptImages.uploadedAt, cutoffDate))
      .returning({ id: receiptImages.id });
    
    const deletedCount = result.length;
    
    if (deletedCount > 0) {
      console.log(`[IMAGE-CLEANUP] ✅ Deleted ${deletedCount} expired images (older than ${RETENTION_DAYS} days)`);
    } else {
      console.log(`[IMAGE-CLEANUP] ✅ No expired images found`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`[IMAGE-CLEANUP] ❌ Cleanup failed:`, error);
    return 0;
  }
}

/**
 * Get image by hash (for duplicate checking)
 */
export async function getImageByHash(imageHash: string) {
  const [image] = await db
    .select()
    .from(receiptImages)
    .where(eq(receiptImages.imageHash, imageHash))
    .limit(1);

  return image || null;
}

/**
 * Mark image as reviewed by admin
 */
export async function markImageReviewed(imageId: number, reviewedBy: number, fraudFlags?: string[]) {
  await db
    .update(receiptImages)
    .set({
      reviewedAt: new Date(),
      reviewedBy,
      fraudFlags: fraudFlags || []
    })
    .where(eq(receiptImages.id, imageId));
}

/**
 * Get all images that need manual review (high fraud risk)
 */
export async function getImagesForReview() {
  return await db
    .select({
      id: receiptImages.id,
      receiptId: receiptImages.receiptId,
      imageHash: receiptImages.imageHash,
      fraudFlags: receiptImages.fraudFlags,
      uploadedAt: receiptImages.uploadedAt,
      fileSize: receiptImages.fileSize,
      mimeType: receiptImages.mimeType
    })
    .from(receiptImages)
    .where(eq(receiptImages.reviewedAt, null));
}