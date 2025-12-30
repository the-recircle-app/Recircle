import { db } from "../db";
import { receiptImages } from "@shared/schema";
import { lt, sql } from "drizzle-orm";

const RETENTION_DAYS = 30;

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  oldestRetained?: Date;
  error?: string;
}

export async function cleanupOldImages(): Promise<CleanupResult> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  console.log(`[IMAGE-CLEANUP] Starting cleanup of images older than ${cutoffDate.toISOString()}`);

  try {
    const oldImages = await db
      .select({ id: receiptImages.id, uploadedAt: receiptImages.uploadedAt })
      .from(receiptImages)
      .where(lt(receiptImages.uploadedAt, cutoffDate));

    if (oldImages.length === 0) {
      console.log(`[IMAGE-CLEANUP] No images older than ${RETENTION_DAYS} days found`);
      return {
        success: true,
        deletedCount: 0
      };
    }

    console.log(`[IMAGE-CLEANUP] Found ${oldImages.length} images to delete`);

    const deleted = await db
      .delete(receiptImages)
      .where(lt(receiptImages.uploadedAt, cutoffDate))
      .returning({ id: receiptImages.id });

    const newestRetained = await db
      .select({ uploadedAt: receiptImages.uploadedAt })
      .from(receiptImages)
      .orderBy(receiptImages.uploadedAt)
      .limit(1);

    console.log(`[IMAGE-CLEANUP] Successfully deleted ${deleted.length} old receipt images`);

    return {
      success: true,
      deletedCount: deleted.length,
      oldestRetained: newestRetained[0]?.uploadedAt || undefined
    };
  } catch (error) {
    console.error("[IMAGE-CLEANUP] Error during cleanup:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function getStorageStats(): Promise<{
  totalImages: number;
  imagesOlderThan30Days: number;
  oldestImageDate?: Date;
  newestImageDate?: Date;
  estimatedSizeBytes?: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    const stats = await db
      .select({
        totalCount: sql<number>`count(*)::int`,
        oldCount: sql<number>`count(*) filter (where ${receiptImages.uploadedAt} < ${cutoffDate})::int`,
        oldestDate: sql<Date>`min(${receiptImages.uploadedAt})`,
        newestDate: sql<Date>`max(${receiptImages.uploadedAt})`,
        totalSize: sql<number>`coalesce(sum(${receiptImages.fileSize}), 0)::int`
      })
      .from(receiptImages);

    const result = stats[0];

    return {
      totalImages: result?.totalCount || 0,
      imagesOlderThan30Days: result?.oldCount || 0,
      oldestImageDate: result?.oldestDate || undefined,
      newestImageDate: result?.newestDate || undefined,
      estimatedSizeBytes: result?.totalSize || 0
    };
  } catch (error) {
    console.error("[IMAGE-CLEANUP] Error getting storage stats:", error);
    return {
      totalImages: 0,
      imagesOlderThan30Days: 0
    };
  }
}
