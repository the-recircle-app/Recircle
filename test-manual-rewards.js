// Manual test script for token reward calculations
import { calculateReceiptReward, calculateStoreAdditionReward, calculateAchievementReward } from './server/utils/tokenRewards.js';

// Test with various receipt amounts
const testAmounts = [10, 27.49, 50, 100, 150, 200, 300, 500];

console.log("TESTING UPDATED TOKEN REWARD CALCULATIONS");
console.log("========================================");

console.log("\n1. RECEIPT VERIFICATION REWARDS:");
testAmounts.forEach(amount => {
  const reward = calculateReceiptReward({ amount });
  console.log(`Receipt amount: $${amount.toFixed(2)} → Reward: ${reward} B3TR tokens`);
});

console.log("\n2. STORE ADDITION REWARD:");
const storeReward = calculateStoreAdditionReward();
console.log(`Adding a new thrift store → Reward: ${storeReward} B3TR tokens`);

console.log("\n3. ACHIEVEMENT REWARDS:");
const achievements = ['first_receipt', 'five_receipts', 'ten_receipts', 'monthly_record', 'first_store', 'token_milestone'];
achievements.forEach(achievement => {
  const reward = calculateAchievementReward(achievement);
  console.log(`${achievement} → Reward: ${reward} B3TR tokens`);
});

console.log("\nAll tests completed!");