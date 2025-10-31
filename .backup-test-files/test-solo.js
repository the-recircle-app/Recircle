const { ethers } = require('ethers');

async function testSoloNode() {
    try {
        console.log('Testing solo node connection...');
        
        // Test with a simple HTTP request first
        const response = await fetch('http://localhost:8669', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            })
        });
        
        const data = await response.json();
        console.log('✅ Solo node responding:', data);
        
        // Now test with ethers
        const provider = new ethers.JsonRpcProvider('http://localhost:8669');
        const blockNumber = await provider.getBlockNumber();
        console.log('✅ Ethers connection works! Block:', blockNumber);
        
        return true;
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        return false;
    }
}

testSoloNode();