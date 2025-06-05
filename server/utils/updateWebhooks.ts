/**
 * Webhook utilities for sending updates to Google Sheets
 * These functions handle updating existing entries in Google Sheets
 */

import fetch from "node-fetch";
import { log } from "../vite";

// Google Sheets webhook URL - replace with your Apps Script deployment URL
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzDqopOu-WNEt9vxOn9Qrm0aD4K9gOnzj7AgRw-zXLJ8BtYk5_0V8d0dDyv816J-Eb3/exec";

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