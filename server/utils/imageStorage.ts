import crypto from 'crypto';
import { db } from '../db';
import { receiptImages, receipts } from '@shared/schema';
import { eq, isNull } from 'drizzle-orm';

/**
 * Image storage utility for receipt fraud detection and manual review
 */

export interface ImageUploadResult {
  imageId: number;
  imageHash: string;
  fraudFlags: string[];
  isDuplicate: boolean;
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
 * Store receipt image with fraud detection
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
  }

  // Store the image
  const [storedImage] = await db
    .insert(receiptImages)
    .values({
      receiptId,
      imageData,
      imageHash,
      mimeType,
      fileSize: Math.ceil(imageData.length * 0.75),
      fraudFlags: fraudDetection.flags,
    })
    .returning();

  // Update receipt to indicate it has an image
  await db
    .update(receipts)
    .set({ hasImage: true })
    .where(eq(receipts.id, receiptId));

  return {
    imageId: storedImage.id,
    imageHash,
    fraudFlags: fraudDetection.flags,
    isDuplicate
  };
}

/**
 * Get receipt image for manual review
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
 * Get receipt image by hash (for duplicate checking)
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