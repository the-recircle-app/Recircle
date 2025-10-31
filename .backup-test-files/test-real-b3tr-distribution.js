// Test the updated backend with real B3TR distribution
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_WALLET = '0xd3ae78222beadb038203be21ed5ce7c9b1bff602'; // Test account 2

async function testRealB3TRDistribution() {
    console.log('🧪 Testing Real B3TR Distribution through Receipt Processing...\n');
    
    try {
        // 1. Create a test user first
        console.log('1️⃣ Creating test user...');
        const userResponse = await fetch(`${BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'test_user_' + Date.now(),
                password: 'test123',
                walletAddress: TEST_WALLET
            })
        });
        
        let userId;
        if (!userResponse.ok) {
            console.log(`   User creation failed, trying to get existing user...`);
            // Try to find existing user by wallet address
            const existingUserResponse = await fetch(`${BASE_URL}/api/users?wallet=${TEST_WALLET}`);
            if (existingUserResponse.ok) {
                const userData = await existingUserResponse.json();
                userId = userData.id;
                console.log(`   ✅ Found existing user: ID ${userId}`);
            } else {
                console.log(`   ❌ Could not find or create user`);
                return;
            }
        } else {
            const user = await userResponse.json();
            userId = user.id;
            console.log(`   ✅ User created: ID ${userId}, wallet ${user.walletAddress}`);
        }
        
        // 2. Check initial B3TR balance
        console.log('\n2️⃣ Checking initial B3TR balance...');
        const balanceResponse = await fetch(`http://localhost:5000/solo/contracts/0x5ef79995fe8a89e0812330e4378eb2660cede699/balances/${TEST_WALLET}`);
        const { balance: initialBalance } = await balanceResponse.json();
        const initialB3TR = (BigInt(initialBalance) / BigInt('1000000000000000000')).toString();
        console.log(`   Initial balance: ${initialB3TR} B3TR`);
        
        // 3. Submit a test receipt for processing
        console.log('\n3️⃣ Submitting test receipt...');
        
        // Create test receipt data with required schema fields
        const receiptData = {
            storeId: 1, // Assuming store ID 1 exists
            userId: userId, // Use the created user ID
            amount: 25.50,
            purchaseDate: new Date().toISOString(),
            category: 'transportation_rideshare',
            tokenReward: 7, // Expected reward
            needsManualReview: false,
            hasImage: true,
            // Additional data for processing
            walletAddress: TEST_WALLET,
            storeName: 'Uber',
            items: [
                { name: 'UberX Ride - Downtown to Airport', price: 25.50, category: 'transportation' }
            ],
            confidence: 95,
            sustainable: true,
            receiptText: 'Uber Trip Receipt\nUberX Ride - Downtown to Airport\nTotal: $25.50',
            imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        };
        
        const receiptResponse = await fetch(`${BASE_URL}/api/receipts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receiptData)
        });
        
        const receiptResult = await receiptResponse.json();
        console.log('   Receipt response:', receiptResult);
        
        if (receiptResult.success) {
            console.log(`   ✅ Receipt processed successfully!`);
            console.log(`   Receipt ID: ${receiptResult.receiptId}`);
            console.log(`   Rewards calculated: ${receiptResult.rewardCalculation?.totalReward || 'N/A'} B3TR`);
            
            if (receiptResult.blockchainDistribution) {
                console.log(`   Blockchain distribution: ${receiptResult.blockchainDistribution.success ? 'SUCCESS' : 'FAILED'}`);
                if (receiptResult.blockchainDistribution.user?.txHash) {
                    console.log(`   User transaction: ${receiptResult.blockchainDistribution.user.txHash}`);
                }
                if (receiptResult.blockchainDistribution.appFund?.txHash) {
                    console.log(`   App fund transaction: ${receiptResult.blockchainDistribution.appFund.txHash}`);
                }
            }
        } else {
            console.log(`   ❌ Receipt processing failed: ${receiptResult.message}`);
            return;
        }
        
        // 4. Check final B3TR balance
        console.log('\n4️⃣ Checking final B3TR balance...');
        const finalBalanceResponse = await fetch(`http://localhost:5000/solo/contracts/0x5ef79995fe8a89e0812330e4378eb2660cede699/balances/${TEST_WALLET}`);
        const { balance: finalBalance } = await finalBalanceResponse.json();
        const finalB3TR = (BigInt(finalBalance) / BigInt('1000000000000000000')).toString();
        const gained = BigInt(finalBalance) - BigInt(initialBalance);
        const gainedB3TR = (gained / BigInt('1000000000000000000')).toString();
        
        console.log(`   Final balance: ${finalB3TR} B3TR`);
        console.log(`   Tokens gained: ${gainedB3TR} B3TR`);
        
        // 5. Check app fund balance (account 3)
        console.log('\n5️⃣ Checking app fund balance...');
        const appFundAddress = '0x733b7269443c70de16bbf9b0615307884bcc5636';
        const appFundResponse = await fetch(`http://localhost:5000/solo/contracts/0x5ef79995fe8a89e0812330e4378eb2660cede699/balances/${appFundAddress}`);
        const { balance: appFundBalance } = await appFundResponse.json();
        const appFundB3TR = (BigInt(appFundBalance) / BigInt('1000000000000000000')).toString();
        console.log(`   App fund balance: ${appFundB3TR} B3TR`);
        
        if (BigInt(gainedB3TR) > 0) {
            console.log('\n🎉 SUCCESS! Real B3TR tokens distributed successfully!');
            console.log('\n📱 VeWorld Testing Instructions:');
            console.log('1. Open VeWorld mobile app');
            console.log('2. Add custom network:');
            console.log('   - Name: Solo Node');
            console.log('   - URL: http://localhost:5000/solo');
            console.log('   - Chain ID: 0x27');
            console.log('3. Add B3TR token:');
            console.log('   - Contract: 0x5ef79995fe8a89e0812330e4378eb2660cede699');
            console.log('   - Symbol: B3TR');
            console.log('   - Decimals: 18');
            console.log(`4. Import wallet using private key for ${TEST_WALLET}`);
            console.log(`5. You should see ${finalB3TR} B3TR tokens in your wallet!`);
            console.log('\n✨ Real tokens, real transactions, real VeWorld visibility!');
        } else {
            console.log('\n❌ No tokens were distributed. Check the logs above for errors.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRealB3TRDistribution();