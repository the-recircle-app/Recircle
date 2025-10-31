// Test B3TR tokens on solo node
import fetch from 'node-fetch';

const SOLO_BASE = 'http://localhost:5000/solo';
const B3TR_CONTRACT = '0x5ef79995fe8a89e0812330e4378eb2660cede699';
const TEST_ACCOUNTS = [
    '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
    '0xd3ae78222beadb038203be21ed5ce7c9b1bff602',
    '0x733b7269443c70de16bbf9b0615307884bcc5636'
];

async function testSoloB3TR() {
    console.log('🧪 Testing B3TR tokens on Solo node...\n');
    
    try {
        // 1. Check solo node status
        console.log('1️⃣ Checking Solo node status...');
        const statusResponse = await fetch(`${SOLO_BASE}/status`);
        const status = await statusResponse.json();
        console.log(`   ✅ Solo node ready: ${status.ready}`);
        console.log(`   📦 Chain ID: ${status.chainId}`);
        console.log(`   🔗 Current block: ${status.blockNumber}\n`);
        
        // 2. Check B3TR contract
        console.log('2️⃣ Checking B3TR contract...');
        const contractResponse = await fetch(`${SOLO_BASE}/contracts/${B3TR_CONTRACT}`);
        const contract = await contractResponse.json();
        console.log(`   ✅ Contract name: ${contract.name}`);
        console.log(`   🪙 Symbol: ${contract.symbol}`);
        console.log(`   🔢 Decimals: ${contract.decimals}`);
        console.log(`   💰 Total supply: ${(BigInt(contract.totalSupply) / BigInt('1000000000000000000')).toString()} B3TR\n`);
        
        // 3. Check account balances
        console.log('3️⃣ Checking account B3TR balances...');
        for (let i = 0; i < TEST_ACCOUNTS.length; i++) {
            const account = TEST_ACCOUNTS[i];
            const balanceResponse = await fetch(`${SOLO_BASE}/contracts/${B3TR_CONTRACT}/balances/${account}`);
            const { balance } = await balanceResponse.json();
            const balanceB3TR = (BigInt(balance) / BigInt('1000000000000000000')).toString();
            console.log(`   Account ${i + 1}: ${balanceB3TR} B3TR`);
        }
        console.log();
        
        // 4. Test B3TR transfer
        console.log('4️⃣ Testing B3TR transfer...');
        const transferAmount = '5000000000000000000'; // 5 B3TR
        console.log(`   Transferring 5 B3TR from Account 1 to Account 2...`);
        
        const transferResponse = await fetch(`${SOLO_BASE}/contracts/${B3TR_CONTRACT}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: TEST_ACCOUNTS[0],
                to: TEST_ACCOUNTS[1],
                amount: transferAmount
            })
        });
        
        const transferResult = await transferResponse.json();
        
        if (transferResult.success) {
            console.log(`   ✅ Transfer successful!`);
            console.log(`   📄 Transaction ID: ${transferResult.txId}`);
            console.log(`   💰 From balance: ${(BigInt(transferResult.fromBalance) / BigInt('1000000000000000000')).toString()} B3TR`);
            console.log(`   💰 To balance: ${(BigInt(transferResult.toBalance) / BigInt('1000000000000000000')).toString()} B3TR\n`);
            
            console.log('🎉 SUCCESS! B3TR tokens are working on Solo node!');
            console.log('\n📱 VeWorld Setup Instructions:');
            console.log('1. Open VeWorld mobile app');
            console.log('2. Add custom network:');
            console.log('   - Name: Solo Node');
            console.log('   - URL: http://localhost:5000/solo');
            console.log('   - Chain ID: 0x27');
            console.log('3. Add B3TR token:');
            console.log(`   - Contract: ${B3TR_CONTRACT}`);
            console.log('   - Symbol: B3TR');
            console.log('   - Decimals: 18');
            console.log('4. Import one of these test accounts using private key');
            console.log('5. You should see 100,000 B3TR tokens in your wallet!');
            
        } else {
            console.log(`   ❌ Transfer failed: ${transferResult.error}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSoloB3TR();