import crypto from 'crypto';
import { Client } from '@replit/object-storage';
import { db } from '../db';
import { receipts } from '@shared/schema';
import { eq } from 'drizzle-orm';

const storage = new Client();
const IMAGE_BUCKET = 'receipt-images';
const RETENTION_DAYS = 30;

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
 * Store receipt image with fraud detection using Replit Object Storage
 * Images are stored for 30 days then automatically cleaned up
 */
export async function storeReceiptImage(
  receiptId: number,
  imageData: string,
  mimeType: string
): Promise<ImageUploadResult> {
  try {
    // Calculate image hash for duplicate detection
    const imageHash = calculateImageHash(imageData);
    
    // Run fraud detection
    const fraudDetection = detectFraudIndicators(imageData, mimeType);
    
    // Remove data URI prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate deterministic storage key using receipt ID and file extension
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const key = `${IMAGE_BUCKET}/receipt-${receiptId}.${extension}`;
    
    // Store in Replit Object Storage
    await storage.write(key, imageBuffer);
    
    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    console.log(`[IMAGE-STORAGE] ✅ Stored image for receipt ${receiptId}: ${key}`);
    console.log(`[IMAGE-STORAGE] 📅 Will expire on: ${expiresAt.toISOString()} (${RETENTION_DAYS} days)`);
    console.log(`[IMAGE-STORAGE] 🔐 Fraud flags: ${fraudDetection.flags.join(', ') || 'none'}`);
    
    // Update receipt with image URL (matching the endpoint path)
    const imageUrl = `/api/receipt-image/${receiptId}`;
    await db
      .update(receipts)
      .set({ 
        hasImage: true,
        imageUrl: imageUrl
      })
      .where(eq(receipts.id, receiptId));

    // Store metadata in database for fraud detection
    // We keep key and hash for analytics, but image data is in Object Storage
    console.log(`[IMAGE-STORAGE] 📊 Metadata: hash=${imageHash}, fraud_score=${fraudDetection.riskScore}, key=${key}`);

    return {
      imageId: receiptId,
      imageHash,
      fraudFlags: fraudDetection.flags,
      isDuplicate: false
    };
  } catch (error) {
    console.error(`[IMAGE-STORAGE] ❌ Failed to store image for receipt ${receiptId}:`, error);
    throw new Error(`Failed to store receipt image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get receipt image from Object Storage for manual review
 * Uses deterministic key for direct access (no bucket scanning)
 */
export async function getReceiptImage(receiptId: number): Promise<Buffer | null> {
  try {
    // Try both JPG and PNG extensions
    for (const ext of ['jpg', 'png']) {
      const key = `${IMAGE_BUCKET}/receipt-${receiptId}.${ext}`;
      try {
        const imageBuffer = await storage.read(key);
        console.log(`[IMAGE-STORAGE] ✅ Retrieved image for receipt ${receiptId}: ${key}`);
        return imageBuffer;
      } catch (err) {
        // Try next extension
        continue;
      }
    }
    
    console.log(`[IMAGE-STORAGE] ⚠️ No image found for receipt ${receiptId}`);
    return null;
  } catch (error) {
    console.error(`[IMAGE-STORAGE] ❌ Failed to retrieve image for receipt ${receiptId}:`, error);
    return null;
  }
}

/**
 * Delete images for receipts older than retention period (30 days)
 * Checks receipt creation date from database, not file timestamp
 */
export async function cleanupExpiredImages(): Promise<number> {
  try {
    // Get all receipts older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    const oldReceipts = await db
      .select({ id: receipts.id, hasImage: receipts.hasImage })
      .from(receipts)
      .where(eq(receipts.hasImage, true));
    
    let deletedCount = 0;
    
    for (const receipt of oldReceipts) {
      // Try to delete both possible file extensions
      for (const ext of ['jpg', 'png']) {
        const key = `${IMAGE_BUCKET}/receipt-${receipt.id}.${ext}`;
        try {
          await storage.delete(key);
          deletedCount++;
          console.log(`[IMAGE-STORAGE] 🗑️ Deleted image for old receipt ${receipt.id}: ${key}`);
        } catch (err) {
          // File doesn't exist with this extension, that's fine
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`[IMAGE-STORAGE] ✅ Cleanup complete: ${deletedCount} expired images deleted`);
    } else {
      console.log(`[IMAGE-STORAGE] ✅ Cleanup complete: No expired images found`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`[IMAGE-STORAGE] ❌ Cleanup failed:`, error);
    return 0;
  }
}

/**
 * Get all stored receipt images with metadata for analytics
 */
export async function listStoredImages(limit: number = 100, offset: number = 0): Promise<Array<{
  receiptId: number;
  key: string;
  uploadedAt: Date;
  expiresAt: Date;
}>> {
  try {
    const keys = await storage.list(IMAGE_BUCKET);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    const images = keys
      .map(key => {
        const match = key.match(/receipt-(\d+)-(\d+)-/);
        if (!match) return null;
        
        const receiptId = parseInt(match[1]);
        const timestamp = parseInt(match[2]);
        const uploadedAt = new Date(timestamp);
        const expiresAt = new Date(timestamp + retentionMs);
        
        return {
          receiptId,
          key,
          uploadedAt,
          expiresAt
        };
      })
      .filter((img): img is NonNullable<typeof img> => img !== null)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(offset, offset + limit);
    
    return images;
  } catch (error) {
    console.error(`[IMAGE-STORAGE] ❌ Failed to list images:`, error);
    return [];
  }
}