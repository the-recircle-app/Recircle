// Test correct transfer function encoding
import { ThorClient } from '@vechain/sdk-network';

async function testTransferEncoding() {
    const TREASURY_WALLET = '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
    const B3TR_CONTRACT = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
    const TEST_RECIPIENT = '0x87C844e3314396Ca43E5A6065E418D26a09db02B';
    const AMOUNT_WEI = '1000000000000000000'; // 1 B3TR
    
    console.log('=== TRANSFER ENCODING TEST ===');
    console.log(`Treasury: ${TREASURY_WALLET}`);
    console.log(`Recipient: ${TEST_RECIPIENT}`);
    console.log(`Amount: 1 B3TR (${AMOUNT_WEI} wei)`);
    
    try {
        const thorClient = ThorClient.fromUrl('https://testnet.vechain.org');
        
        // Test 1: Our current encoding
        const functionSignature = '0xa9059cbb'; // transfer(address,uint256)
        const encodedRecipient = TEST_RECIPIENT.toLowerCase().replace('0x', '').padStart(64, '0');
        const encodedAmount = BigInt(AMOUNT_WEI).toString(16).padStart(64, '0');
        const ourEncoding = functionSignature.slice(2) + encodedRecipient + encodedAmount;
        
        console.log('\n1. Our current encoding:');
        console.log(`Function: ${functionSignature}`);
        console.log(`Recipient encoded: ${encodedRecipient}`);
        console.log(`Amount encoded: ${encodedAmount}`);
        console.log(`Full data: 0x${ourEncoding}`);
        
        // Test simulate this transfer
        const testClause = {
            to: B3TR_CONTRACT,
            value: '0x0',
            data: '0x' + ourEncoding
        };
        
        console.log('\n2. Simulating transfer...');
        const result = await thorClient.transactions.simulateTransaction([testClause]);
        console.log('Simulation result:', result[0]);
        
        if (result[0].reverted) {
            console.log('❌ Transfer simulation REVERTED:', result[0].vmError);
        } else if (result[0].transfers && result[0].transfers.length > 0) {
            console.log('✅ Transfer simulation shows token movement!');
            console.log('Transfers:', result[0].transfers);
        } else {
            console.log('⚠️ Transfer simulation succeeded but no token movement');
            console.log(`Gas used: ${result[0].gasUsed} (expected ~60k+)`);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testTransferEncoding();