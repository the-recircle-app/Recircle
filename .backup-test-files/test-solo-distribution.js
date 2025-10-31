import { ThorClient, ProviderInternalBaseWallet } from '@vechain/sdk-network';

console.log('🧪 Testing Solo Node VeBetterDAO Distribution...');

async function testSoloDistribution() {
    try {
        // Connect to solo node
        const thorClient = ThorClient.at('http://localhost:8669');
        
        // Test connection
        const status = await fetch('http://localhost:8669/status').then(r => r.json());
        console.log('✅ Solo node status:', status);
        
        // Create wallet from solo account
        const privateKey = '0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e';
        const wallet = new ProviderInternalBaseWallet(
            [{ privateKey: Buffer.from(privateKey.slice(2), 'hex'), address: '' }],
            { 
                node: 'http://localhost:8669',
                network: 'solo'
            }
        );
        
        const walletAccount = wallet.account(0);
        const signer = thorClient.getSigner(walletAccount);
        const address = await signer.getAddress();
        console.log(`💼 Using distributor account: ${address}`);
        
        // Test transaction (simulate B3TR distribution)
        console.log('📤 Testing B3TR distribution transaction...');
        
        const userWallet = '0x87C844e3314396Ca43E5A6065E418D26a09db02B';
        const userAmount = 7; // 7 B3TR
        const appAmount = 3;  // 3 B3TR
        
        const clause = {
            to: userWallet,
            value: '0x0',
            data: '0x' + (userAmount * 1e18).toString(16).padStart(64, '0')
        };
        
        const result = await thorClient.transactions.sendTransaction([clause], signer);
        console.log(`✅ Transaction sent: ${result.txid}`);
        
        // Get receipt
        setTimeout(async () => {
            try {
                const receipt = await thorClient.transactions.getTransactionReceipt(result.txid);
                console.log('📋 Transaction Receipt:');
                console.log(`   Gas Used: ${receipt.gasUsed}`);
                console.log(`   Events: ${receipt.outputs[0]?.events?.length || 0}`);
                console.log(`   Transfers: ${receipt.outputs[0]?.transfers?.length || 0}`);
                
                if (receipt.outputs[0]?.events?.length > 0) {
                    console.log('🎉 Solo node VeBetterDAO simulation working!');
                    console.log('');
                    console.log('🔧 Your ReCircle app can now safely test with:');
                    console.log('- Unlimited fake VET/VTHO for gas');
                    console.log('- Simulated B3TR token distributions');
                    console.log('- Real blockchain-like transaction responses');
                    console.log('- Safe environment for debugging');
                } else {
                    console.log('⚠️  Receipt generated but no events - solo node working');
                }
            } catch (error) {
                console.log(`📋 Receipt check: ${error.message}`);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSoloDistribution();