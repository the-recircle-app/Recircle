/**
 * Helper script to determine your current ReCircle app URL
 * Run this to get the correct webhook URL for your Google Apps Script
 */

console.log("\n🔗 CURRENT RECIRCLE APP INFORMATION:");
console.log("=====================================");

// Method 1: Check if environment variables are available
if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
  const appUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.app`;
  console.log("✅ App URL:", appUrl);
  console.log("✅ Webhook Endpoint:", appUrl + "/api/receipt-approved");
} else {
  console.log("⚠️ Environment variables not available in this context");
}

// Method 2: Provide instructions for manual determination
console.log("\n📋 MANUAL INSTRUCTIONS:");
console.log("1. Look at your browser URL when viewing this Replit");
console.log("2. Your app URL format: https://[repl-name].[username].replit.app");
console.log("3. Your webhook endpoint: [your-app-url]/api/receipt-approved");

console.log("\n🔧 GOOGLE APPS SCRIPT UPDATE STEPS:");
console.log("1. Open your Google Sheet with the receipt submissions");
console.log("2. Go to Extensions > Apps Script");
console.log("3. Replace the WEBHOOK_URL with your correct app URL");
console.log("4. Update column indices to match your sheet structure");
console.log("5. Save and deploy a new version");

console.log("\n✅ Once updated, test by marking a receipt as 'Approved' in your sheet");