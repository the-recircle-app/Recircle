/**
 * Test Wei conversion to identify the source of the blockchain overflow
 */

import { ethers } from 'ethers';

function testWeiConversion() {
  console.log('🧪 Testing Wei conversion logic\n');

  // Test various B3TR amounts
  const testAmounts = ['8', '14', '15', '25', '100'];
  
  testAmounts.forEach(amount => {
    try {
      console.log(`Testing ${amount} B3TR:`);
      
      // Convert using ethers.parseEther (what our code does)
      const totalAmountWei = ethers.parseEther(amount);
      console.log(`  Total Wei: ${totalAmountWei.toString()}`);
      console.log(`  Total Wei length: ${totalAmountWei.toString().length} characters`);
      
      // Calculate percentages
      const userAmountWei = (totalAmountWei * BigInt(70)) / BigInt(100);
      const creatorAmountWei = (totalAmountWei * BigInt(15)) / BigInt(100);
      const appAmountWei = (totalAmountWei * BigInt(15)) / BigInt(100);
      
      console.log(`  User (70%): ${userAmountWei.toString()}`);
      console.log(`  Creator (15%): ${creatorAmountWei.toString()}`);
      console.log(`  App (15%): ${appAmountWei.toString()}`);
      
      // Check if any value contains scientific notation or is too large
      const userString = userAmountWei.toString();
      const creatorString = creatorAmountWei.toString();
      const appString = appAmountWei.toString();
      
      if (userString.includes('e') || userString.length > 30) {
        console.log(`  ❌ OVERFLOW DETECTED in user amount: ${userString}`);
      }
      if (creatorString.includes('e') || creatorString.length > 30) {
        console.log(`  ❌ OVERFLOW DETECTED in creator amount: ${creatorString}`);
      }
      if (appString.includes('e') || appString.length > 30) {
        console.log(`  ❌ OVERFLOW DETECTED in app amount: ${appString}`);
      }
      
      console.log(`  ✅ Conversion successful for ${amount} B3TR\n`);
      
    } catch (error) {
      console.log(`  ❌ Error converting ${amount} B3TR:`, error.message);
    }
  });
  
  // Test the exact problematic value
  console.log('Testing problematic overflow value:');
  const problematicValue = '6.51746812596567e+76';
  console.log(`Value: ${problematicValue}`);
  console.log(`Scientific notation: ${problematicValue.includes('e')}`);
  console.log(`Length: ${problematicValue.length}`);
  
  // Test if this could come from double conversion
  console.log('\nTesting double conversion scenario:');
  const normalWei = ethers.parseEther('15');
  console.log(`Normal 15 B3TR in Wei: ${normalWei.toString()}`);
  
  try {
    // What if we accidentally convert Wei back to ether string then to Wei again?
    const etherString = ethers.formatEther(normalWei);
    console.log(`Converted back to ether string: ${etherString}`);
    const doubleConvertedWei = ethers.parseEther(etherString);
    console.log(`Double converted Wei: ${doubleConvertedWei.toString()}`);
  } catch (error) {
    console.log('Double conversion error:', error.message);
  }
}

testWeiConversion();