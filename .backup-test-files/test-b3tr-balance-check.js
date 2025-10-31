// Direct B3TR balance check for treasury wallet
import { ThorClient } from '@vechain/sdk-network';

async function checkB3TRBalance() {
    const TREASURY_WALLET = '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
    const B3TR_CONTRACT = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
    
    console.log('=== B3TR BALANCE CHECK ===');
    console.log(`Treasury: ${TREASURY_WALLET}`);
    console.log(`B3TR Contract: ${B3TR_CONTRACT}`);
    
    try {
        const thorClient = ThorClient.fromUrl('https://testnet.vechain.org');
        
        // Manual balanceOf call using raw transaction
        const balanceOfSignature = '0x70a08231'; // balanceOf(address)
        const encodedAddress = TREASURY_WALLET.toLowerCase().replace('0x', '').padStart(64, '0');
        const callData = balanceOfSignature + encodedAddress;
        
        console.log('\n1. Manual balanceOf call...');
        console.log(`Call data: ${callData}`);
        
        // Execute read call using correct method
        const callClause = {
            to: B3TR_CONTRACT,
            value: '0x0',
            data: '0x' + callData.slice(2)
        };
        
        const result = await thorClient.transactions.simulateTransaction([callClause]);
        
        console.log('Simulation result:', result);
        
        if (result && result[0] && result[0].data && result[0].data !== '0x') {
            const balance = BigInt(result[0].data);
            const balanceFormatted = balance / (10n ** 18n);
            console.log(`✅ Treasury Balance: ${balance.toString()} wei`);
            console.log(`✅ Treasury Balance: ${balanceFormatted.toString()} B3TR`);
            
            if (balance === 0n) {
                console.log('\n❌ PROBLEM FOUND: Treasury wallet has 0 B3TR tokens!');
                console.log('This explains why transfers succeed but move no tokens.');
                console.log('VeWorld showing 2,659.33 B3TR is cached/incorrect data.');
            } else {
                console.log('\n✅ Treasury has sufficient B3TR for transfers');
            }
        } else {
            console.log('❌ balanceOf call failed or returned no data');
            console.log('Full result:', JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Balance check failed:', error.message);
    }
}

checkB3TRBalance();