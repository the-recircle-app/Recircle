import thor from 'thor-devkit';
import { ethers } from 'ethers';

console.log('=== DISTRIBUTOR WALLET B3TR BALANCE CHECK ===');

const RPC_URL = 'https://testnet.vechain.org';
const B3TR_CONTRACT = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
const DISTRIBUTOR_WALLET = '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee';

console.log(`Distributor: ${DISTRIBUTOR_WALLET}`);
console.log(`B3TR Contract: ${B3TR_CONTRACT}`);

try {
    const thorClient = thor.createHttpClient(RPC_URL);
    
    // Manual balanceOf call for distributor wallet
    console.log('\n1. Checking distributor B3TR balance...');
    
    // Create balanceOf call data
    const balanceOfABI = new ethers.Interface(['function balanceOf(address owner) view returns (uint256)']);
    const callData = balanceOfABI.encodeFunctionData('balanceOf', [DISTRIBUTOR_WALLET]);
    
    console.log(`Call data: ${callData}`);
    
    const result = await thorClient.request('POST', '/accounts/' + B3TR_CONTRACT, {
        value: '0x0',
        data: callData,
        caller: DISTRIBUTOR_WALLET
    });
    
    console.log('Raw result:', result);
    
    if (result && result.data) {
        const balance = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], result.data)[0];
        const balanceFormatted = ethers.formatEther(balance);
        
        console.log(`✅ Distributor Balance: ${balance} wei`);
        console.log(`✅ Distributor Balance: ${balanceFormatted} B3TR`);
        
        if (parseFloat(balanceFormatted) > 0) {
            console.log('✅ Distributor has B3TR tokens for transfers');
        } else {
            console.log('❌ Distributor has 0 B3TR tokens - this explains authorization failure');
        }
    } else {
        console.log('❌ Failed to get balance');
    }
    
} catch (error) {
    console.error('❌ Balance check failed:', error.message);
}