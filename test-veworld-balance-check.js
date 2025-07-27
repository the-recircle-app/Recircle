/**
 * Test VeWorld wallet B3TR balance to verify modern SDK transactions
 */
import { ThorClient } from '@vechain/sdk-network';
import { ABIFunction } from '@vechain/sdk-core';

async function checkVeWorldBalance() {
    try {
        const thorClient = ThorClient.at('https://testnet.vechain.org');
        
        // VeWorld test wallet address
        const veWorldWallet = '0x15D009B3A5811fdE66F19b2db1D40172d53E5653';
        
        // B3TR token contract address (testnet)
        const b3trToken = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
        
        console.log('🔍 Checking VeWorld wallet B3TR balance...');
        console.log('Wallet:', veWorldWallet);
        console.log('B3TR Token:', b3trToken);
        
        // Create balanceOf ABI function
        const balanceOfABI = new ABIFunction({
            name: 'balanceOf',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
            constant: true,
            payable: false,
            type: 'function'
        });
        
        // Call balanceOf function
        const clause = {
            to: b3trToken,
            value: '0x0',
            data: balanceOfABI.encodeData([veWorldWallet])
        };
        
        const result = await thorClient.accounts.executeAccountBatch([clause]);
        
        if (result && result[0] && result[0].data) {
            const balanceHex = result[0].data;
            const balanceWei = BigInt(balanceHex);
            const balanceB3TR = Number(balanceWei) / 1e18;
            
            console.log('\n📊 BALANCE RESULTS:');
            console.log('Raw balance (wei):', balanceWei.toString());
            console.log('Balance in B3TR:', balanceB3TR);
            
            if (balanceB3TR > 0) {
                console.log('✅ SUCCESS: VeWorld wallet contains B3TR tokens!');
                console.log('🎯 Modern VeChain SDK implementation is working correctly');
            } else {
                console.log('❌ ISSUE: VeWorld wallet has 0 B3TR tokens');
                console.log('🔧 Tokens may not be reaching VeWorld yet');
            }
        } else {
            console.log('❌ Error: Could not retrieve balance data');
        }
        
    } catch (error) {
        console.error('❌ Error checking VeWorld balance:', error.message);
    }
}

checkVeWorldBalance();