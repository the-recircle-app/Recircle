/**
 * Webhook utilities for sending updates to Google Sheets
 * These functions handle updating existing entries in Google Sheets
 */

import fetch from "node-fetch";
import { log } from "../vite";

// Google Sheets webhook URL - uses environment variable with fallback
const GOOGLE_SHEET_WEBHOOK_URL = process.env.RECEIPT_APPROVAL_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbw3cDppOWbfrgrTMpt_fodCOWGlcmmAnEuAb2n8cST1sQtiyYrcetoljbPbgE05kMFV/exec";

/**
 * Send receipt approval update to Google Sheets
 * 
 * @param receiptId The receipt ID to update
 * @param userId The user ID associated with the receipt
 * @param storeName The name of the store on the receipt
 * @param finalReward The final reward amount awarded
 * @param newBalance The user's new token balance after the reward
 * @param walletAddress The user's wallet address
 * @returns Promise resolving to true if update was successful
 */
export async function updateApprovedReceiptStatus(
  receiptId: string, 
  userId: number | string, 
  storeName: string, 
  finalReward: number, 
  newBalance: number,
  walletAddress: string
): Promise<boolean> {
  try {
    // Prepare payload for Google Sheets update
    const payload = {
      event_type: "receipt_approval",
      receiptId: receiptId,
      userId: userId.toString(),
      storeName: storeName,
      finalReward: finalReward,
      newBalance: newBalance,
      walletAddress: walletAddress,
      approvalDate: new Date().toISOString()
    };

    log(`Sending receipt approval update to Google Sheets for receipt ID: ${receiptId}`);

    // Send the update to Google Sheets
    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if the update was successful
    if (response.ok) {
      const data = await response.json();
      log(`Successfully updated Google Sheets with approval status for receipt ${receiptId}`);
      log(`Response from Google Sheets: ${JSON.stringify(data)}`);
      return true;
    } else {
      const errorText = await response.text();
      log(`Error updating Google Sheets: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    log(`Exception updating Google Sheets: ${error}`);
    return false;
  }
}