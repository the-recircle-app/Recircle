// Check if treasury wallet has permission to transfer B3TR tokens
import { ThorClient } from '@vechain/sdk-network';

async function checkTokenPermissions() {
    const TREASURY_WALLET = '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
    const B3TR_CONTRACT = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
    
    console.log('=== B3TR TOKEN PERMISSIONS CHECK ===');
    console.log(`Treasury: ${TREASURY_WALLET}`);
    console.log(`B3TR Contract: ${B3TR_CONTRACT}`);
    
    try {
        const thorClient = ThorClient.fromUrl('https://testnet.vechain.org');
        
        // Check 1: Is the contract paused?
        console.log('\n1. Checking if B3TR contract is paused...');
        const pausedSignature = '0x5c975abb'; // paused()
        const pausedClause = {
            to: B3TR_CONTRACT,
            value: '0x0',
            data: pausedSignature
        };
        
        const pausedResult = await thorClient.transactions.simulateTransaction([pausedClause]);
        const isPaused = pausedResult[0].data === '0x0000000000000000000000000000000000000000000000000000000000000001';
        console.log(`Contract paused: ${isPaused}`);
        
        // Check 2: Does treasury wallet have the MINTER_ROLE or similar?
        console.log('\n2. Checking treasury wallet roles...');
        const minterRole = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'; // MINTER_ROLE
        const hasRoleSignature = '0x91d14854'; // hasRole(bytes32,address)
        const encodedRole = minterRole.slice(2);
        const encodedAddress = TREASURY_WALLET.toLowerCase().replace('0x', '').padStart(64, '0');
        const hasRoleData = hasRoleSignature + encodedRole + encodedAddress;
        
        const roleClause = {
            to: B3TR_CONTRACT,
            value: '0x0',
            data: hasRoleData
        };
        
        const roleResult = await thorClient.transactions.simulateTransaction([roleClause]);
        const hasMinterRole = roleResult[0].data === '0x0000000000000000000000000000000000000000000000000000000000000001';
        console.log(`Has MINTER_ROLE: ${hasMinterRole}`);
        
        // Check 3: Try a small transfer simulation with different recipient
        console.log('\n3. Testing transfer with different approach...');
        
        // Check if it's a supply issue - try transferring to treasury itself (should always work)
        const selfTransferSignature = '0xa9059cbb'; // transfer(address,uint256)
        const encodedSelfRecipient = TREASURY_WALLET.toLowerCase().replace('0x', '').padStart(64, '0');
        const smallAmount = '1'; // 1 wei
        const encodedSmallAmount = BigInt(smallAmount).toString(16).padStart(64, '0');
        const selfTransferData = selfTransferSignature + encodedSelfRecipient + encodedSmallAmount;
        
        const selfTransferClause = {
            to: B3TR_CONTRACT,
            value: '0x0',
            data: selfTransferData
        };
        
        const selfResult = await thorClient.transactions.simulateTransaction([selfTransferClause]);
        console.log('Self-transfer result:', selfResult[0]);
        
        if (selfResult[0].reverted) {
            console.log('❌ Even self-transfer fails - wallet cannot spend its own tokens');
            console.log('This suggests tokens are locked or held by contract, not directly owned');
        } else {
            console.log('✅ Self-transfer works - issue is with recipient or amount');
        }
        
    } catch (error) {
        console.log('❌ Permission check failed:', error.message);
    }
}

checkTokenPermissions();