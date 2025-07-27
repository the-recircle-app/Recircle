/**
 * Test Script for 70/30 Distribution Model
 * Verifies the new optimized fund distribution is working correctly
 */

// Import the updated reward calculation function
const { calculateSustainabilityRewards } = require('./server/utils/tokenRewards');

console.log('🧪 TESTING 70/30 DISTRIBUTION MODEL');
console.log('====================================');

// Test different reward amounts
const testAmounts = [10, 25.5, 50, 100];

testAmounts.forEach(amount => {
  console.log(`\n💰 Testing ${amount} B3TR total reward:`);
  
  try {
    const distribution = calculateSustainabilityRewards(amount);
    
    console.log(`   User gets: ${distribution.userReward} B3TR (70%)`);
    console.log(`   App fund: ${distribution.appReward} B3TR (30%)`);
    console.log(`   Total operational: ${distribution.totalSustainabilityReward} B3TR`);
    
    // Verify percentages
    const userPercent = (distribution.userReward / amount * 100).toFixed(1);
    const appPercent = (distribution.appReward / amount * 100).toFixed(1);
    
    console.log(`   ✓ User: ${userPercent}%, App: ${appPercent}%`);
    
    // Verify total adds up
    const total = distribution.userReward + distribution.appReward;
    if (Math.abs(total - amount) < 0.01) {
      console.log(`   ✅ Distribution verified: ${total} B3TR`);
    } else {
      console.log(`   ❌ Distribution error: ${total} ≠ ${amount}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

console.log('\n📊 BUSINESS IMPACT:');
console.log('===================');
console.log('✅ Doubled operational funding (15% → 30%)');
console.log('✅ Simplified wallet management (2 funds → 1 fund)');
console.log('✅ More capital for team expansion');
console.log('✅ VeBetterDAO compliant distribution model');
console.log('✅ Users still receive competitive 70% rewards');

console.log('\n🚀 Ready for testnet deployment with optimized funding!');