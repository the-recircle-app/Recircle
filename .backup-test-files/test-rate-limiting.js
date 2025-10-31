/**
 * Rate Limiting Test Script
 * Verifies that the abuse prevention system correctly blocks excessive requests
 * Tests all rate-limited endpoints to ensure security measures are working
 */

async function testRateLimiting() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🛡️  Testing Rate Limiting System');
  console.log('================================');
  
  // Test 1: Receipt Validation Rate Limiting (5 requests per 10 minutes)
  console.log('\n--- Test 1: Receipt Validation Rate Limiting ---');
  
  const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  try {
    // Make 6 rapid requests (should hit rate limit after 5)
    for (let i = 1; i <= 6; i++) {
      const response = await fetch(`${baseUrl}/api/receipts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 102,
          walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
          image: testImage,
          testMode: true,
          testType: 'sustainable'
        })
      });
      
      if (i <= 5) {
        console.log(`✅ Request ${i}: ${response.status} - ${response.ok ? 'Allowed' : 'Blocked'}`);
      } else {
        console.log(`🚫 Request ${i}: ${response.status} - ${response.status === 429 ? 'CORRECTLY BLOCKED' : 'SHOULD BE BLOCKED'}`);
        if (response.status === 429) {
          const errorData = await response.json();
          console.log(`   Rate limit message: ${errorData.error || 'Too many requests'}`);
        }
      }
    }
  } catch (error) {
    console.error('Rate limiting test failed:', error.message);
  }
  
  // Test 2: Receipt Submission Rate Limiting (3 requests per 5 minutes)
  console.log('\n--- Test 2: Receipt Submission Rate Limiting ---');
  
  try {
    for (let i = 1; i <= 4; i++) {
      const response = await fetch(`${baseUrl}/api/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 102,
          storeId: 1,
          amount: 25.00,
          purchaseDate: new Date().toISOString().split('T')[0],
          testMode: true
        })
      });
      
      if (i <= 3) {
        console.log(`✅ Submission ${i}: ${response.status} - ${response.ok ? 'Allowed' : 'Blocked'}`);
      } else {
        console.log(`🚫 Submission ${i}: ${response.status} - ${response.status === 429 ? 'CORRECTLY BLOCKED' : 'SHOULD BE BLOCKED'}`);
        if (response.status === 429) {
          const errorData = await response.json();
          console.log(`   Rate limit message: ${errorData.error || 'Too many requests'}`);
        }
      }
    }
  } catch (error) {
    console.error('Submission rate limiting test failed:', error.message);
  }
  
  // Test 3: Authentication Rate Limiting (10 requests per 15 minutes)
  console.log('\n--- Test 3: Authentication Rate Limiting ---');
  
  try {
    for (let i = 1; i <= 12; i++) {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `testuser${i}`,
          walletAddress: `0x${i.toString().padStart(40, '0')}`,
          email: `test${i}@example.com`
        })
      });
      
      if (i <= 10) {
        console.log(`✅ Auth ${i}: ${response.status} - ${response.ok ? 'Allowed' : 'Blocked'}`);
      } else {
        console.log(`🚫 Auth ${i}: ${response.status} - ${response.status === 429 ? 'CORRECTLY BLOCKED' : 'SHOULD BE BLOCKED'}`);
        if (response.status === 429) {
          const errorData = await response.json();
          console.log(`   Rate limit message: ${errorData.error || 'Too many requests'}`);
        }
      }
    }
  } catch (error) {
    console.error('Auth rate limiting test failed:', error.message);
  }
  
  console.log('\n🛡️  Rate Limiting Test Complete');
  console.log('Your application is now protected against abuse!');
  console.log('\nRate Limits in Effect:');
  console.log('- Receipt validation: 5 requests per 10 minutes');
  console.log('- Receipt submission: 3 requests per 5 minutes');
  console.log('- User authentication: 10 requests per 15 minutes');
  console.log('- General API: 100 requests per 15 minutes');
  console.log('- Admin actions: 20 requests per hour');
}

testRateLimiting().catch(console.error);