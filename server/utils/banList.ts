import { db } from "../db";
import { bannedUsers, BannedUser, InsertBannedUser } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface BanCheckResult {
  isBanned: boolean;
  banType?: "hard" | "soft";
  reason?: string;
  bannedAt?: Date;
}

export async function checkBanStatus(walletAddress: string): Promise<BanCheckResult> {
  if (!walletAddress) {
    return { isBanned: false };
  }

  const normalizedWallet = walletAddress.toLowerCase();
  
  try {
    const activeBan = await db
      .select()
      .from(bannedUsers)
      .where(
        and(
          eq(bannedUsers.walletAddress, normalizedWallet),
          eq(bannedUsers.isActive, true)
        )
      )
      .limit(1);
    
    if (activeBan.length === 0) {
      return { isBanned: false };
    }

    const ban = activeBan[0];
    return {
      isBanned: true,
      banType: ban.banType as "hard" | "soft",
      reason: ban.reason,
      bannedAt: ban.bannedAt || undefined
    };
  } catch (error) {
    console.error("[BAN-LIST] Error checking ban status:", error);
    return { isBanned: false };
  }
}

export async function shouldBlockReward(walletAddress: string): Promise<{ blocked: boolean; reason?: string; requiresManualReview?: boolean }> {
  const banStatus = await checkBanStatus(walletAddress);
  
  if (!banStatus.isBanned) {
    return { blocked: false };
  }

  if (banStatus.banType === "hard") {
    return {
      blocked: true,
      reason: `This wallet has been restricted from receiving rewards. Reason: ${banStatus.reason}`
    };
  }

  if (banStatus.banType === "soft") {
    return {
      blocked: false,
      requiresManualReview: true
    };
  }

  return { blocked: false };
}

export async function addToBanList(
  walletAddress: string,
  banType: "hard" | "soft",
  reason: string,
  bannedBy: string
): Promise<BannedUser> {
  const normalizedWallet = walletAddress.toLowerCase();
  const normalizedBannedBy = bannedBy.toLowerCase();

  const existingBan = await db
    .select()
    .from(bannedUsers)
    .where(
      and(
        eq(bannedUsers.walletAddress, normalizedWallet),
        eq(bannedUsers.isActive, true)
      )
    )
    .limit(1);

  if (existingBan.length > 0) {
    const updated = await db
      .update(bannedUsers)
      .set({
        banType,
        reason,
        bannedBy: normalizedBannedBy,
        bannedAt: new Date()
      })
      .where(eq(bannedUsers.id, existingBan[0].id))
      .returning();
    
    console.log(`[BAN-LIST] Updated existing ban for ${normalizedWallet}: ${banType} - ${reason}`);
    return updated[0];
  }

  const newBan = await db
    .insert(bannedUsers)
    .values({
      walletAddress: normalizedWallet,
      banType,
      reason,
      bannedBy: normalizedBannedBy,
      isActive: true
    })
    .returning();

  console.log(`[BAN-LIST] Added new ban for ${normalizedWallet}: ${banType} - ${reason}`);
  return newBan[0];
}

export async function removeFromBanList(walletAddress: string): Promise<boolean> {
  const normalizedWallet = walletAddress.toLowerCase();

  try {
    const result = await db
      .update(bannedUsers)
      .set({
        isActive: false,
        unbannedAt: new Date()
      })
      .where(
        and(
          eq(bannedUsers.walletAddress, normalizedWallet),
          eq(bannedUsers.isActive, true)
        )
      )
      .returning();

    if (result.length > 0) {
      console.log(`[BAN-LIST] Removed ban for ${normalizedWallet}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[BAN-LIST] Error removing from ban list:", error);
    return false;
  }
}

export async function getBannedUsers(includeInactive = false): Promise<BannedUser[]> {
  try {
    if (includeInactive) {
      return await db.select().from(bannedUsers).orderBy(bannedUsers.bannedAt);
    }
    
    return await db
      .select()
      .from(bannedUsers)
      .where(eq(bannedUsers.isActive, true))
      .orderBy(bannedUsers.bannedAt);
  } catch (error) {
    console.error("[BAN-LIST] Error getting banned users:", error);
    return [];
  }
}

export async function getBanHistory(walletAddress: string): Promise<BannedUser[]> {
  const normalizedWallet = walletAddress.toLowerCase();
  
  try {
    return await db
      .select()
      .from(bannedUsers)
      .where(eq(bannedUsers.walletAddress, normalizedWallet))
      .orderBy(bannedUsers.bannedAt);
  } catch (error) {
    console.error("[BAN-LIST] Error getting ban history:", error);
    return [];
  }
}
