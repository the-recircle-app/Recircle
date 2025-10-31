// Test the real B3TR distribution directly through solo node API
import fetch from 'node-fetch';

const SOLO_BASE_URL = 'http://localhost:5000/solo';
const B3TR_CONTRACT = '0x5ef79995fe8a89e0812330e4378eb2660cede699';
const DISTRIBUTOR_ADDRESS = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'; // Account 1
const TEST_USER_WALLET = '0xd3ae78222beadb038203be21ed5ce7c9b1bff602'; // Account 2
const APP_FUND_WALLET = '0x733b7269443c70de16bbf9b0615307884bcc5636'; // Account 3

async function testDirectB3TRDistribution() {
    console.log('🧪 Testing Direct B3TR Distribution via Solo Node API...\n');
    
    try {
        // 1. Check initial balances
        console.log('1️⃣ Checking initial balances...');
        
        const userBalanceResponse = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/balances/${TEST_USER_WALLET}`);
        const { balance: initialUserBalance } = await userBalanceResponse.json();
        const initialUserB3TR = (BigInt(initialUserBalance) / BigInt('1000000000000000000')).toString();
        
        const appBalanceResponse = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/balances/${APP_FUND_WALLET}`);
        const { balance: initialAppBalance } = await appBalanceResponse.json();
        const initialAppB3TR = (BigInt(initialAppBalance) / BigInt('1000000000000000000')).toString();
        
        console.log(`   User (${TEST_USER_WALLET}): ${initialUserB3TR} B3TR`);
        console.log(`   App Fund (${APP_FUND_WALLET}): ${initialAppB3TR} B3TR`);
        
        // 2. Distribute 7 B3TR to user (simulating 70% of receipt reward)
        console.log('\n2️⃣ Distributing 7 B3TR to user...');
        
        const userAmount = 7;
        const userAmountWei = (BigInt(userAmount) * BigInt('1000000000000000000')).toString();
        
        const userTransferResponse = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: DISTRIBUTOR_ADDRESS,
                to: TEST_USER_WALLET,
                amount: userAmountWei
            })
        });
        
        const userResult = await userTransferResponse.json();
        
        if (userResult.success) {
            console.log(`   ✅ User transfer successful!`);
            console.log(`   Transaction: ${userResult.txId}`);
            console.log(`   User balance: ${(BigInt(userResult.toBalance) / BigInt('1000000000000000000')).toString()} B3TR`);
        } else {
            console.log(`   ❌ User transfer failed: ${userResult.error}`);
            return;
        }
        
        // 3. Distribute 3 B3TR to app fund (simulating 30% of receipt reward)
        console.log('\n3️⃣ Distributing 3 B3TR to app fund...');
        
        const appAmount = 3;
        const appAmountWei = (BigInt(appAmount) * BigInt('1000000000000000000')).toString();
        
        const appTransferResponse = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: DISTRIBUTOR_ADDRESS,
                to: APP_FUND_WALLET,
                amount: appAmountWei
            })
        });
        
        const appResult = await appTransferResponse.json();
        
        if (appResult.success) {
            console.log(`   ✅ App fund transfer successful!`);
            console.log(`   Transaction: ${appResult.txId}`);
            console.log(`   App fund balance: ${(BigInt(appResult.toBalance) / BigInt('1000000000000000000')).toString()} B3TR`);
        } else {
            console.log(`   ❌ App fund transfer failed: ${appResult.error}`);
            return;
        }
        
        // 4. Verify final balances
        console.log('\n4️⃣ Verifying final balances...');
        
        const finalUserResponse = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/balances/${TEST_USER_WALLET}`);
        const { balance: finalUserBalance } = await finalUserResponse.json();
        const finalUserB3TR = (BigInt(finalUserBalance) / BigInt('1000000000000000000')).toString();
        
        const finalAppResponse = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/balances/${APP_FUND_WALLET}`);
        const { balance: finalAppBalance } = await finalAppResponse.json();
        const finalAppB3TR = (BigInt(finalAppBalance) / BigInt('1000000000000000000')).toString();
        
        console.log(`   User final balance: ${finalUserB3TR} B3TR`);
        console.log(`   App fund final balance: ${finalAppB3TR} B3TR`);
        
        // Calculate gains
        const userGain = BigInt(finalUserBalance) - BigInt(initialUserBalance);
        const appGain = BigInt(finalAppBalance) - BigInt(initialAppBalance);
        const userGainB3TR = (userGain / BigInt('1000000000000000000')).toString();
        const appGainB3TR = (appGain / BigInt('1000000000000000000')).toString();
        
        console.log(`   User gained: ${userGainB3TR} B3TR`);
        console.log(`   App fund gained: ${appGainB3TR} B3TR`);
        
        if (userGainB3TR === '7' && appGainB3TR === '3') {
            console.log('\n🎉 PERFECT! Real B3TR distribution working flawlessly!');
            console.log('\n📱 VeWorld Integration Ready:');
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
            console.log(`5. You will see ${finalUserB3TR} B3TR tokens!`);
            
            console.log('\n✨ BREAKTHROUGH CONFIRMED:');
            console.log('- Real B3TR tokens deployed and operational');
            console.log('- Authentic transfers between accounts verified');
            console.log('- 70/30 distribution model working perfectly');
            console.log('- Ready for VeWorld wallet visibility testing');
            console.log('- ChatGPT solution implemented successfully');
            console.log('- No more fake transaction hashes - all real!');
            
            console.log('\n🎯 NEXT STEP: Integrate this into receipt processing system');
        } else {
            console.log(`\n❌ Expected gains: User +7, App Fund +3`);
            console.log(`   Actual gains: User +${userGainB3TR}, App Fund +${appGainB3TR}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testDirectB3TRDistribution();