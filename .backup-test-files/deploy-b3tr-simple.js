const { ethers } = require('ethers');

async function testConnection() {
    console.log('🔍 Testing solo node connection...');
    
    const endpoints = [
        'http://192.168.12.101:8669',
        'https://192.168.12.101:8669',
        'http://192.168.12.101:8670'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint}...`);
            const provider = new ethers.JsonRpcProvider(endpoint);
            const network = await provider.getNetwork();
            console.log(`✅ Connected to ${endpoint} - Chain ID: ${network.chainId}`);
            return provider;
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
    
    throw new Error('No solo node found');
}

async function deployB3TR() {
    try {
        const provider = await testConnection();
        
        // Test wallet
        const privateKey = '0x7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d';
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log(`Wallet: ${wallet.address}`);
        
        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} VET`);
        
        console.log('✅ Solo node connection successful!');
        console.log('Ready to deploy B3TR contract');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

deployB3TR();