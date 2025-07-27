// Simple script to test the token reward calculations

import { calculateReceiptReward } from './server/utils/tokenRewards';

// Test with various receipt amounts
const testAmounts = [10, 27.49, 50, 100, 150, 200, 300, 500];

console.log("TESTING TOKEN REWARD CALCULATIONS");
console.log("================================");

testAmounts.forEach(amount => {
  const reward = calculateReceiptReward({ amount });
  console.log(`\nReceipt amount: $${amount.toFixed(2)}`);
  console.log(`Calculated reward: ${reward} B3TR tokens`);
});

console.log("\nAll tests completed!");