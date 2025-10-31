/**
 * Test VeBetterDAO App Registration and Authorization Status
 * This script checks if ReCircle is properly registered and authorized in VeBetterDAO
 */

import { ThorClient, VeChainProvider, ProviderInternalBaseWallet } from '@vechain/sdk-network';
import * as thor from 'thor-devkit';
import dotenv from 'dotenv';
dotenv.config();

const VEBETTERDAO_CONFIG = {
    X2EARN_REWARDS_POOL: '0x6Bee7DDab6c99d5B2Af0554EaEA484CE18F52631', // Official testnet
    APP_ID: '0x5265436972636c6500000000000000000000000000000000000000000000000000000000', // "ReCircle" as bytes32
    B3TR_TOKEN: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699', // Official testnet B3TR
    DISTRIBUTOR: '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee'
};

async function testVeBetterDAOStatus() {
    try {
        console.log('🔍 TESTING VEBETTERDAO APP REGISTRATION STATUS');
        console.log('=' .repeat(60));
        
        // Connect to VeChain testnet
        const thorClient = ThorClient.at('https://testnet.vechain.org');
        
        // Get distributor wallet from mnemonic
        const distributorMnemonic = process.env.DISTRIBUTOR_MNEMONIC;
        if (!distributorMnemonic) {
            throw new Error('DISTRIBUTOR_MNEMONIC required');
        }
        
        const words = distributorMnemonic.trim().split(/\s+/);
        const privateKeyBuffer = thor.mnemonic.derivePrivateKey(words);
        const distributorAddress = thor.address.fromPrivateKey(privateKeyBuffer);
        
        console.log(`📋 App Information:`);
        console.log(`   App ID: ${VEBETTERDAO_CONFIG.APP_ID}`);
        console.log(`   App ID (string): "ReCircle"`);
        console.log(`   X2EarnRewardsPool: ${VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL}`);
        console.log(`   Distributor: ${distributorAddress.digits}`);
        console.log(`   Expected: ${VEBETTERDAO_CONFIG.DISTRIBUTOR}`);
        console.log(`   Match: ${distributorAddress.digits.toLowerCase() === VEBETTERDAO_CONFIG.DISTRIBUTOR.toLowerCase()}`);
        console.log('');
        
        // Test 1: Check X2EarnRewardsPool contract
        console.log('🧪 TEST 1: X2EarnRewardsPool Contract Status');
        console.log('-'.repeat(50));
        
        try {
            // Check if contract exists and is accessible
            const contractCode = await thorClient.accounts.getAccount(VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL);
            if (contractCode.code) {
                console.log('✅ X2EarnRewardsPool contract exists and has code');
                console.log(`   Code length: ${contractCode.code.length} bytes`);
            } else {
                console.log('❌ X2EarnRewardsPool contract not found or no code');
            }
        } catch (error) {
            console.log(`❌ Error accessing X2EarnRewardsPool: ${error.message}`);
        }
        
        // Test 2: Check B3TR Token Contract
        console.log('\\n🧪 TEST 2: B3TR Token Contract Status');
        console.log('-'.repeat(50));
        
        try {
            const b3trCode = await thorClient.accounts.getAccount(VEBETTERDAO_CONFIG.B3TR_TOKEN);
            if (b3trCode.code) {
                console.log('✅ B3TR token contract exists and has code');
                console.log(`   Code length: ${b3trCode.code.length} bytes`);
            } else {
                console.log('❌ B3TR token contract not found or no code');
            }
        } catch (error) {
            console.log(`❌ Error accessing B3TR contract: ${error.message}`);
        }
        
        // Test 3: Check distributor wallet B3TR balance
        console.log('\\n🧪 TEST 3: Distributor Wallet B3TR Balance');
        console.log('-'.repeat(50));
        
        try {
            // Create balanceOf call
            const balanceOfABI = [{
                name: 'balanceOf',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ name: '', type: 'uint256' }],
                constant: true,
                type: 'function'
            }];
            
            const contract = thorClient.contracts.load(VEBETTERDAO_CONFIG.B3TR_TOKEN, balanceOfABI);
            const balanceResult = await contract.read.balanceOf(distributorAddress.digits);
            
            const balanceWei = balanceResult.toString();
            const balanceB3TR = parseFloat(balanceWei) / 1e18;
            
            console.log(`✅ Distributor B3TR balance: ${balanceB3TR.toFixed(2)} B3TR`);
            console.log(`   Balance (wei): ${balanceWei}`);
            
            if (balanceB3TR > 0) {
                console.log('✅ Distributor has B3TR tokens for distribution');
            } else {
                console.log('❌ Distributor has no B3TR tokens');
            }
        } catch (error) {
            console.log(`❌ Error checking B3TR balance: ${error.message}`);
        }
        
        // Test 4: Check if app can call distributeReward (simulation)
        console.log('\\n🧪 TEST 4: VeBetterDAO Distribution Authorization');
        console.log('-'.repeat(50));
        
        try {
            // Create provider and signer
            const provider = new VeChainProvider(
                thorClient,
                new ProviderInternalBaseWallet([
                    { privateKey: privateKeyBuffer, address: distributorAddress.digits }
                ]),
                true
            );
            
            const signer = await provider.getSigner(0);
            
            // Try to simulate distributeReward call
            const distributeRewardABI = [{
                name: 'distributeReward',
                inputs: [
                    { name: 'appId', type: 'bytes32' },
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint256' }
                ],
                outputs: [{ name: '', type: 'bool' }],
                constant: false,
                type: 'function'
            }];
            
            const rewardsContract = thorClient.contracts.load(VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL, distributeRewardABI);
            
            // Simulate small distribution (0.1 B3TR)
            const testAmount = '100000000000000000'; // 0.1 B3TR in wei
            const testRecipient = '0x87C844e3314396Ca43E5A6065E418D26a09db02B';
            
            console.log(`📝 Simulating distributeReward call:`);
            console.log(`   App ID: ${VEBETTERDAO_CONFIG.APP_ID}`);
            console.log(`   Recipient: ${testRecipient}`);
            console.log(`   Amount: 0.1 B3TR (${testAmount} wei)`);
            console.log(`   Distributor: ${distributorAddress.digits}`);
            
            // Try to execute the transaction
            const result = await rewardsContract.transact.distributeReward(
                VEBETTERDAO_CONFIG.APP_ID,
                testRecipient,
                testAmount
            ).call(signer);
            
            const receipt = await result.wait();
            
            console.log(`✅ Distribution transaction executed:`);
            console.log(`   Transaction Hash: ${receipt.meta.txID}`);
            console.log(`   Gas Used: ${receipt.gasUsed}`);
            console.log(`   Reverted: ${receipt.reverted}`);
            console.log(`   Block: ${receipt.meta.blockNumber}`);
            
            if (receipt.reverted) {
                console.log('❌ Transaction reverted - app may not be authorized');
                console.log('   This means ReCircle is not properly registered for token distribution');
            } else {
                console.log('✅ Transaction succeeded - app is properly authorized!');
                
                // Check for transfer events
                if (receipt.outputs && receipt.outputs[0] && receipt.outputs[0].transfers.length > 0) {
                    console.log(`✅ B3TR tokens transferred: ${receipt.outputs[0].transfers.length} transfer(s)`);
                    receipt.outputs[0].transfers.forEach((transfer, i) => {
                        console.log(`   Transfer ${i + 1}: ${transfer.amount} B3TR to ${transfer.recipient}`);
                    });
                } else {
                    console.log('⚠️  No transfer events - distribution may have failed in contract');
                }
            }
            
        } catch (error) {
            console.log(`❌ Error testing distribution authorization: ${error.message}`);
            console.log('   This could mean:');
            console.log('   1. App not registered in VeBetterDAO governance');
            console.log('   2. Distributor wallet not authorized');
            console.log('   3. No B3TR allocation available for app');
        }
        
        console.log('\\n' + '='.repeat(60));
        console.log('🎯 SUMMARY:');
        console.log('If all tests pass, ReCircle should be able to distribute B3TR tokens');
        console.log('If authorization fails, the app needs proper VeBetterDAO registration');
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testVeBetterDAOStatus();