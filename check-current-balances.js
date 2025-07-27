// Quick balance check to confirm current status
import fetch from 'node-fetch';

const SOLO_BASE_URL = 'http://localhost:5000/solo';
const B3TR_CONTRACT = '0x5ef79995fe8a89e0812330e4378eb2660cede699';

async function checkCurrentBalances() {
    console.log('🔍 CHECKING CURRENT B3TR BALANCES\n');
    
    const accounts = [
        { name: 'Distributor (Account 1)', address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed' },
        { name: 'Test User (Account 2)', address: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602' },
        { name: 'App Fund (Account 3)', address: '0x733b7269443c70de16bbf9b0615307884bcc5636' }
    ];
    
    console.log('Current B3TR Token Balances:');
    console.log('='.repeat(50));
    
    for (const account of accounts) {
        try {
            const response = await fetch(`${SOLO_BASE_URL}/contracts/${B3TR_CONTRACT}/balances/${account.address}`);
            const { balance } = await response.json();
            const tokenBalance = (BigInt(balance) / BigInt('1000000000000000000')).toString();
            
            console.log(`${account.name}:`);
            console.log(`  Address: ${account.address}`);
            console.log(`  Balance: ${tokenBalance} B3TR`);
            console.log('');
        } catch (error) {
            console.log(`${account.name}: Error checking balance`);
        }
    }
    
    // Check solo node status
    try {
        const statusResponse = await fetch(`${SOLO_BASE_URL}/status`);
        const status = await statusResponse.json();
        console.log('Solo Node Status:');
        console.log(`  Chain ID: ${status.chainId}`);
        console.log(`  Network: Operational ✅`);
        console.log(`  B3TR Contract: ${B3TR_CONTRACT}`);
    } catch (error) {
        console.log('Solo Node Status: ❌ Not accessible');
    }
    
    console.log('\n📱 TO VIEW IN VEWORLD:');
    console.log('1. Add network: http://localhost:5000/solo (Chain ID: 0x27)');
    console.log('2. Add token: 0x5ef79995fe8a89e0812330e4378eb2660cede699');
    console.log('3. Import wallet: 0xd3ae78222beadb038203be21ed5ce7c9b1bff602');
    console.log('4. See your real B3TR tokens! 🎉');
}

checkCurrentBalances();