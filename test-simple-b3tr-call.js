// Simple test to verify B3TR contract interaction works
import { ThorClient } from '@vechain/sdk-network';
import { ABIFunction } from '@vechain/sdk-core';

async function testB3TRContract() {
    const TREASURY_WALLET = '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
    const B3TR_CONTRACT = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
    
    console.log('Testing B3TR contract interaction...');
    console.log(`Treasury: ${TREASURY_WALLET}`);
    console.log(`B3TR Contract: ${B3TR_CONTRACT}`);
    
    try {
        const thorClient = ThorClient.fromUrl('https://testnet.vechain.org');
        
        // Test 1: Check totalSupply (should always work for ERC-20)
        const totalSupplyFunction = new ABIFunction({
            name: 'totalSupply',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }],
            constant: true,
            payable: false,
            type: 'function'
        });
        
        console.log('\n1. Testing totalSupply() call...');
        const totalSupplyResult = await thorClient.contracts.executeFunction(
            B3TR_CONTRACT,
            totalSupplyFunction,
            []
        );
        
        if (totalSupplyResult && totalSupplyResult.decoded) {
            console.log('✅ totalSupply() works! Contract is valid ERC-20');
            console.log('Total supply:', totalSupplyResult.decoded[0]);
        } else {
            console.log('❌ totalSupply() failed - not a valid ERC-20 contract');
        }
        
        // Test 2: Check name() function
        const nameFunction = new ABIFunction({
            name: 'name',
            inputs: [],
            outputs: [{ name: '', type: 'string' }],
            constant: true,
            payable: false,
            type: 'function'
        });
        
        console.log('\n2. Testing name() call...');
        const nameResult = await thorClient.contracts.executeFunction(
            B3TR_CONTRACT,
            nameFunction,
            []
        );
        
        if (nameResult && nameResult.decoded) {
            console.log('✅ name() works! Token name:', nameResult.decoded[0]);
        } else {
            console.log('❌ name() failed');
        }
        
    } catch (error) {
        console.log('❌ Contract test failed:', error.message);
    }
}

testB3TRContract();