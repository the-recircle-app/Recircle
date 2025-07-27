import { ThorClient, ProviderInternalBaseWallet } from '@vechain/sdk-network';

async function testSoloVeBetterDAO() {
    try {
        console.log('🧪 Testing VeBetterDAO on Solo Node...');
        
        // Connect to solo node
        const thorClient = ThorClient.at('http://localhost:8669');
        
        // Test connection
        const best = await thorClient.blocks.getBestBlock();
        console.log(`✅ Connected to solo node at block #${best.number}`);
        
        // Create wallet from solo account
        const privateKey = '0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36';
        const wallet = new ProviderInternalBaseWallet(
            [{ privateKey: Buffer.from(privateKey.slice(2), 'hex'), address: '' }],
            { 
                node: 'http://localhost:8669',
                network: 'solo'
            }
        );
        
        const signer = thorClient.getSigner(wallet.account(0));
        const address = await signer.getAddress();
        console.log(`💼 Using account: ${address}`);
        
        // Check account balance
        const account = await thorClient.accounts.getAccount(address);
        console.log(`💰 Account balance: ${parseInt(account.balance, 16) / 1e18} VET`);
        
        // Test transaction to simulate VeBetterDAO distribution
        console.log('📤 Testing transaction (simulating B3TR distribution)...');
        
        const clause = {
            to: '0x87C844e3314396Ca43E5A6065E418D26a09db02B', // Test recipient
            value: '0x0',
            data: '0x' // Empty data for test
        };
        
        const result = await thorClient.transactions.sendTransaction([clause], signer);
        console.log(`✅ Transaction sent: ${result.txid}`);
        
        // Wait a moment and get receipt
        setTimeout(async () => {
            try {
                const receipt = await thorClient.transactions.getTransactionReceipt(result.txid);
                console.log('📋 Transaction Receipt:');
                console.log(`   Gas Used: ${receipt.gasUsed}`);
                console.log(`   Events: ${receipt.outputs[0]?.events?.length || 0}`);
                console.log(`   Transfers: ${receipt.outputs[0]?.transfers?.length || 0}`);
                
                if (receipt.outputs[0]?.events?.length > 0) {
                    console.log('🎉 Solo node is working perfectly for VeBetterDAO testing!');
                    console.log('');
                    console.log('🔧 Update your ReCircle app .env:');
                    console.log('VECHAIN_NETWORK=solo');
                    console.log('VECHAIN_RPC_URL=http://localhost:8669');
                    console.log(`ADMIN_PRIVATE_KEY=${privateKey}`);
                    console.log('DISTRIBUTOR_PRIVATE_KEY=0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e');
                } else {
                    console.log('⚠️  Solo node working but needs VeBetterDAO contract deployment');
                }
            } catch (error) {
                console.log(`Receipt: ${error.message}`);
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('💡 Make sure solo node is running: node scripts/simple-solo-node.js');
    }
}

testSoloVeBetterDAO();