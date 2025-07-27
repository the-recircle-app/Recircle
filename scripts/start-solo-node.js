#!/usr/bin/env node

const { Thor } = require('@vechain/thor-solo');
const path = require('path');

async function startSoloNode() {
    console.log('🚀 Starting VeChain Solo Node for VeBetterDAO Testing...');
    
    try {
        const thor = new Thor({
            network: 'solo',
            datadir: path.join(__dirname, '../thor-solo-data'),
            port: 8669,
            verbosity: 3,
            enableAPI: true,
            enableWS: true,
            forkConfig: {
                url: 'https://testnet.vechain.org',
                blockNumber: 'latest'
            }
        });

        await thor.start();
        
        console.log('✅ VeChain Solo Node started successfully!');
        console.log('📡 RPC Endpoint: http://localhost:8669');
        console.log('🔗 Chain ID: 39 (solo network)');
        console.log('');
        console.log('Pre-funded accounts with VET and VTHO:');
        
        // Default solo node accounts
        const accounts = [
            {
                address: '0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa',
                privateKey: '0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36',
                balance: '1000000 VET'
            },
            {
                address: '0x435933c8064b4Ae76bE665428e0307eF2cCFBD68',
                privateKey: '0x2bf40b1b6c2f7c24a7aedc4ea76b6b4b8c7e0e7e9a7a0f3d4f8b9e7b8a6c5e4d',
                balance: '1000000 VET'
            }
        ];
        
        accounts.forEach((account, index) => {
            console.log(`Account ${index + 1}:`);
            console.log(`  Address: ${account.address}`);
            console.log(`  Private Key: ${account.privateKey}`);
            console.log(`  Balance: ${account.balance}`);
            console.log('');
        });
        
        console.log('💡 Update your .env file:');
        console.log('VECHAIN_NETWORK=solo');
        console.log('VECHAIN_RPC_URL=http://localhost:8669');
        console.log('');
        console.log('🧪 Solo node is perfect for testing VeBetterDAO contracts with fake tokens!');
        
        // Keep the process running
        process.on('SIGINT', async () => {
            console.log('\n🛑 Stopping VeChain Solo Node...');
            await thor.stop();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Failed to start solo node:', error.message);
        process.exit(1);
    }
}

startSoloNode();