// Test the real B3TR distribution directly through the backend functions
import { distributeRealB3TR, getSoloB3TRBalance } from './server/utils/solo-b3tr-real.js';

const TEST_USER_WALLET = '0xd3ae78222beadb038203be21ed5ce7c9b1bff602'; // Test account 2
const APP_FUND_WALLET = '0x733b7269443c70de16bbf9b0615307884bcc5636'; // Test account 3

async function testBackendB3TRDistribution() {
    console.log('🧪 Testing Backend Real B3TR Distribution Functions...\n');
    
    try {
        // 1. Check initial balances
        console.log('1️⃣ Checking initial balances...');
        const initialUserBalance = await getSoloB3TRBalance(TEST_USER_WALLET);
        const initialAppBalance = await getSoloB3TRBalance(APP_FUND_WALLET);
        
        console.log(`   User initial balance: ${initialUserBalance} B3TR`);
        console.log(`   App fund initial balance: ${initialAppBalance} B3TR`);
        
        // 2. Distribute 7 B3TR to user (70% of 10 B3TR receipt)
        console.log('\n2️⃣ Distributing 7 B3TR to user...');
        const userResult = await distributeRealB3TR(TEST_USER_WALLET, 7);
        
        if (userResult.success) {
            console.log(`   ✅ User distribution successful!`);
            console.log(`   Transaction hash: ${userResult.txHash}`);
        } else {
            console.log(`   ❌ User distribution failed: ${userResult.error}`);
            return;
        }
        
        // 3. Distribute 3 B3TR to app fund (30% of 10 B3TR receipt)
        console.log('\n3️⃣ Distributing 3 B3TR to app fund...');
        const appFundResult = await distributeRealB3TR(APP_FUND_WALLET, 3);
        
        if (appFundResult.success) {
            console.log(`   ✅ App fund distribution successful!`);
            console.log(`   Transaction hash: ${appFundResult.txHash}`);
        } else {
            console.log(`   ❌ App fund distribution failed: ${appFundResult.error}`);
        }
        
        // 4. Check final balances
        console.log('\n4️⃣ Checking final balances...');
        const finalUserBalance = await getSoloB3TRBalance(TEST_USER_WALLET);
        const finalAppBalance = await getSoloB3TRBalance(APP_FUND_WALLET);
        
        console.log(`   User final balance: ${finalUserBalance} B3TR`);
        console.log(`   App fund final balance: ${finalAppBalance} B3TR`);
        
        // 5. Calculate gains
        const userGain = BigInt(finalUserBalance) - BigInt(initialUserBalance);
        const appGain = BigInt(finalAppBalance) - BigInt(initialAppBalance);
        
        console.log(`   User gained: ${userGain.toString()} B3TR`);
        console.log(`   App fund gained: ${appGain.toString()} B3TR`);
        
        if (userGain === 7n && appGain === 3n) {
            console.log('\n🎉 SUCCESS! Real B3TR distribution working perfectly!');
            console.log('\n📱 VeWorld Setup Instructions:');
            console.log('1. Open VeWorld mobile app');
            console.log('2. Add custom network:');
            console.log('   - Name: Solo Node');
            console.log('   - URL: http://localhost:5000/solo');
            console.log('   - Chain ID: 0x27');
            console.log('3. Add B3TR token:');
            console.log('   - Contract: 0x5ef79995fe8a89e0812330e4378eb2660cede699');
            console.log('   - Symbol: B3TR');
            console.log('   - Decimals: 18');
            console.log(`4. Import wallet using private key for ${TEST_USER_WALLET}`);
            console.log(`5. You should see ${finalUserBalance} B3TR tokens in your wallet!`);
            
            console.log('\n✨ BREAKTHROUGH ACHIEVED:');
            console.log('- Real B3TR tokens deployed and working on solo node');
            console.log('- Actual transfers between accounts confirmed');
            console.log('- 70/30 distribution model operational');
            console.log('- Ready for VeWorld wallet testing');
            console.log('- No more fake transaction hashes!');
        } else {
            console.log('\n❌ Distribution amounts incorrect. Expected user +7, app fund +3');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testBackendB3TRDistribution();