const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function restartSoloNode() {
    try {
        console.log('Stopping current container...');
        await execAsync('docker stop vechain-solo');
        
        console.log('Removing container...');
        await execAsync('docker rm vechain-solo');
        
        console.log('Starting fresh solo node with correct configuration...');
        const cmd = `docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669 --api-cors "*" --api-timeout 60s --api-call-gas-limit 50000000 --api-backtrace`;
        
        await execAsync(cmd);
        
        console.log('Waiting for solo node to initialize...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('Testing connection...');
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider('http://localhost:8669');
        const blockNumber = await provider.getBlockNumber();
        
        console.log('✅ Solo node restarted successfully!');
        console.log('Block number:', blockNumber);
        
    } catch (error) {
        console.log('❌ Restart failed:', error.message);
        console.log('Try manually: docker stop vechain-solo && docker rm vechain-solo');
        console.log('Then: docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669');
    }
}

restartSoloNode();