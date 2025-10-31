import { ethers } from 'ethers';

console.log('=== DISTRIBUTOR WALLET B3TR BALANCE CHECK ===');

const RPC_URL = 'https://testnet.vechain.org';
const B3TR_CONTRACT = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
const DISTRIBUTOR_WALLET = '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee';

console.log(`Distributor: ${DISTRIBUTOR_WALLET}`);
console.log(`B3TR Contract: ${B3TR_CONTRACT}`);

try {
    // Use ethers.js to check balance
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create B3TR contract instance
    const b3trABI = ['function balanceOf(address owner) view returns (uint256)'];
    const b3trContract = new ethers.Contract(B3TR_CONTRACT, b3trABI, provider);
    
    console.log('\nChecking distributor B3TR balance...');
    
    const balance = await b3trContract.balanceOf(DISTRIBUTOR_WALLET);
    const balanceFormatted = ethers.formatEther(balance);
    
    console.log(`✅ Distributor Balance: ${balance} wei`);
    console.log(`✅ Distributor Balance: ${balanceFormatted} B3TR`);
    
    if (parseFloat(balanceFormatted) > 0) {
        console.log(`✅ Distributor has ${balanceFormatted} B3TR tokens for transfers`);
        console.log('✅ Distributor wallet is funded and ready for token distribution');
    } else {
        console.log('❌ Distributor has 0 B3TR tokens');
    }
    
} catch (error) {
    console.error('❌ Balance check failed:', error.message);
}