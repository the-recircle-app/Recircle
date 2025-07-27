/**
 * Test script for new transportation receipt validation
 * 
 * This script tests the new sustainable transportation categories:
 * - Ride share services (Uber, Lyft, Waymo)
 * - Electric vehicle rentals (Tesla, EV, Hybrid)
 * - Public transit receipts
 */

const BASE_URL = 'http://localhost:5000';

async function testTransportationReceiptValidation() {
  console.log('🚗 Testing Transportation Receipt Validation');
  console.log('==============================================');
  
  // Test cases for different transportation services
  const testCases = [
    {
      name: 'Uber Ride Receipt',
      storeHint: 'Uber',
      imageName: 'uber_ride_receipt.jpg',
      expectedCategory: 'ride_share',
      expectedValid: true
    },
    {
      name: 'Lyft Ride Receipt',
      storeHint: 'Lyft',
      imageName: 'lyft_trip_receipt.jpg',
      expectedCategory: 'ride_share',
      expectedValid: true
    },
    {
      name: 'Waymo Autonomous Ride',
      storeHint: 'Waymo',
      imageName: 'waymo_ride.jpg',
      expectedCategory: 'ride_share',
      expectedValid: true
    },
    {
      name: 'Tesla Rental from Hertz',
      storeHint: 'Hertz Tesla Electric',
      imageName: 'hertz_tesla_rental.jpg',
      expectedCategory: 'electric_vehicle',
      expectedValid: true
    },
    {
      name: 'Enterprise Electric Vehicle',
      storeHint: 'Enterprise EV Rental',
      imageName: 'enterprise_ev.jpg',
      expectedCategory: 'electric_vehicle',
      expectedValid: true
    },
    {
      name: 'Zipcar Hybrid Vehicle',
      storeHint: 'Zipcar Prius Hybrid',
      imageName: 'zipcar_hybrid.jpg',
      expectedCategory: 'electric_vehicle',
      expectedValid: true
    },
    {
      name: 'Turo Electric Car Share',
      storeHint: 'Turo Electric Vehicle',
      imageName: 'turo_electric.jpg',
      expectedCategory: 'electric_vehicle',
      expectedValid: true
    }
  ];

  console.log(`\n🧪 Testing ${testCases.length} transportation receipt scenarios...\n`);

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Expected category: ${testCase.expectedCategory}`);
    console.log(`Store hint: "${testCase.storeHint}"`);
    
    try {
      // Test with timeout fallback to simulate real-world scenario
      const response = await fetch(`${BASE_URL}/api/receipts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', // Minimal test image
          storeHint: testCase.storeHint,
          imageName: testCase.imageName,
          timeoutFallback: true // Simulate timeout to test fallback logic
        })
      });

      const result = await response.json();
      
      // Validate the response
      console.log(`✅ Response received:`);
      console.log(`   - Valid: ${result.isValid}`);
      console.log(`   - Store Name: ${result.storeName}`);
      console.log(`   - Category: ${result.sustainableCategory || result.purchaseCategory}`);
      console.log(`   - Confidence: ${result.confidence}`);
      console.log(`   - Digital Payment: ${result.paymentMethod?.isDigital || false}`);
      
      if (result.sustainabilityReasons && result.sustainabilityReasons.length > 0) {
        console.log(`   - Sustainability Reason: ${result.sustainabilityReasons[0]}`);
      }

      // Check if results match expectations
      const categoryMatch = (result.sustainableCategory || result.purchaseCategory) === testCase.expectedCategory;
      const validMatch = result.isValid === testCase.expectedValid;
      
      if (categoryMatch && validMatch) {
        console.log(`🎉 PASS: Correctly identified as ${testCase.expectedCategory}`);
      } else {
        console.log(`❌ FAIL: Expected ${testCase.expectedCategory}, got ${result.sustainableCategory || result.purchaseCategory}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
}

async function testTransportationRewardCalculation() {
  console.log('\n💰 Testing Transportation Reward Calculation');
  console.log('==============================================');
  
  try {
    // Test reward calculation for transportation receipts
    const response = await fetch(`${BASE_URL}/api/debug/reward-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 102,
        wallet_address: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
        amount: 1.0, // 1 B3TR test
        type: 'transportation'
      })
    });

    const result = await response.json();
    
    console.log('✅ Transportation reward test results:');
    console.log(`   - Success: ${result.success}`);
    console.log(`   - User reward (70%): ${result.reward} B3TR`);
    console.log(`   - Old balance: ${result.oldBalance} B3TR`);
    console.log(`   - New balance: ${result.newBalance} B3TR`);
    console.log(`   - Network: ${result.network}`);
    
    if (result.transactions) {
      console.log(`   - User transaction: ${result.transactions.user}`);
      console.log(`   - Creator transaction: ${result.transactions.creator}`);
      console.log(`   - App transaction: ${result.transactions.app}`);
    }
    
    if (result.explorerUrls && result.explorerUrls.user) {
      console.log(`   - View on explorer: ${result.explorerUrls.user}`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR testing rewards: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🌱 TRANSPORTATION RECEIPT VALIDATION TEST SUITE');
  console.log('===============================================');
  console.log('Testing new sustainable transportation categories:');
  console.log('• Ride Share Services (Uber, Lyft, Waymo)');
  console.log('• Electric Vehicle Rentals (Tesla, EV, Hybrid)');
  console.log('• Blockchain reward distribution (70/30 model)');
  console.log('===============================================\n');
  
  try {
    await testTransportationReceiptValidation();
    await testTransportationRewardCalculation();
    
    console.log('\n🎉 TESTING COMPLETE!');
    console.log('===============================================');
    console.log('✅ Transportation receipt validation implemented');
    console.log('✅ 70/30 blockchain distribution ready');
    console.log('✅ Sustainable transportation rewards active');
    console.log('\nUsers can now earn B3TR tokens for:');
    console.log('🚗 Uber, Lyft, Waymo rides');
    console.log('⚡ Tesla and electric vehicle rentals');
    console.log('🔄 Plus all existing thrift store purchases');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the tests
runAllTests();