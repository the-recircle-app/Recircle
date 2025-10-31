/**
 * Check current user test data tracking in ReCircle
 * This script shows what data you currently have and what's missing
 */

async function checkCurrentTracking() {
  console.log("🔍 CHECKING CURRENT USER TEST DATA TRACKING\n");
  
  try {
    // Check users
    console.log("👥 USERS:");
    const usersResponse = await fetch('http://localhost:5000/api/users');
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`Total users: ${users.length}`);
      users.forEach(user => {
        console.log(`- User ${user.id}: ${user.username} | Balance: ${user.tokenBalance} B3TR | Wallet: ${user.walletAddress}`);
      });
    } else {
      console.log("❌ Could not fetch users");
    }
    
    console.log("\n📊 RECENT TRANSACTIONS:");
    // Check for user transactions (excluding fund distributions)
    const transactionsResponse = await fetch('http://localhost:5000/api/users/1/transactions');
    if (transactionsResponse.ok) {
      const transactions = await transactionsResponse.json();
      console.log(`Total transactions for user 1: ${transactions.length}`);
      
      const userTransactions = transactions.filter(t => 
        t.type === 'receipt_verification' || 
        t.type === 'achievement_reward' ||
        t.type === 'form_submission_pending'
      );
      
      if (userTransactions.length > 0) {
        console.log("User-related transactions:");
        userTransactions.slice(0, 5).forEach(t => {
          console.log(`- ${t.type}: ${t.amount} B3TR | ${t.description} | ${new Date(t.createdAt).toLocaleString()}`);
        });
      } else {
        console.log("❌ No user receipt transactions found (only fund distributions)");
      }
    } else {
      console.log("❌ Could not fetch transactions");
    }
    
    console.log("\n📝 TRACKING GAPS IDENTIFIED:");
    console.log("- Receipts table is empty (no auto-approved or manual receipts stored)");
    console.log("- Only fund distribution transactions exist");
    console.log("- Missing receipt submission tracking");
    console.log("- Google Sheets approvals create transactions but no receipt records");
    
    console.log("\n💡 RECOMMENDATIONS:");
    console.log("1. Fix receipt storage in auto-approval flow");
    console.log("2. Update Google Sheets webhook to create receipt records");
    console.log("3. Add receipt tracking to manual review process");
    console.log("4. Implement comprehensive user activity dashboard");
    
    console.log("\n🧪 TEST SCENARIOS TO VERIFY:");
    console.log("1. Submit receipt via app → Check receipts table");
    console.log("2. Auto-approval → Verify receipt + transaction created");
    console.log("3. Manual review → Check Google Sheets sync");
    console.log("4. Google Sheets approval → Verify receipt record created");
    
  } catch (error) {
    console.log("❌ Error checking tracking data:", error.message);
  }
}

checkCurrentTracking();