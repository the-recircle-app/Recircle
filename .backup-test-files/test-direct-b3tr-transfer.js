import { createThorClient } from './server/utils/vechain-sdk-client.js';
import { VeChainProvider, ProviderInternalBaseWallet } from '@vechain/sdk-network';
import { ABIFunction, HexUInt } from '@vechain/sdk-core';
import { ethers } from 'ethers';

// Test configuration
const VEBETTERDAO_CONFIG = {
    B3TR_TOKEN: "0x5EF79995FE8a89e0812330E4378eB2660ceDe699", // B3TR token contract on testnet
    REWARD_DISTRIBUTOR: "0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee", // Treasury wallet from screenshot
};

async function testDirectB3TRTransfer() {
    try {
        console.log('[DIRECT-TEST] Starting direct B3TR token transfer test...');
        console.log('[DIRECT-TEST] Recipient: 0x9bf41f1ecd0e925c6158c98beb569526f9721300');
        console.log('[DIRECT-TEST] Amount: 3.14 B3TR');
        
        // Step 1: Connect to VeChain testnet
        const thorClient = await createThorClient();
        if (!thorClient) {
            throw new Error('Failed to connect to VeChain testnet');
        }
        console.log('[DIRECT-TEST] ✅ Connected to VeChain testnet');
        
        // Step 2: Load private key from environment
        const privateKey = process.env.VECHAIN_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('VECHAIN_PRIVATE_KEY not found in environment');
        }
        
        // Step 3: Create wallet and provider
        const wallet = new ProviderInternalBaseWallet([{
            privateKey: Buffer.from(privateKey.replace('0x', ''), 'hex'),
            address: VEBETTERDAO_CONFIG.REWARD_DISTRIBUTOR
        }]);
        
        const provider = new VeChainProvider(thorClient, wallet);
        const signer = provider.getSigner(VEBETTERDAO_CONFIG.REWARD_DISTRIBUTOR);
        
        console.log('[DIRECT-TEST] ✅ Wallet and signer created');
        console.log('[DIRECT-TEST] Treasury wallet:', VEBETTERDAO_CONFIG.REWARD_DISTRIBUTOR);
        
        // Step 4: Prepare B3TR token transfer (ERC20 transfer function)
        const transferAbiFunction = ABIFunction.from({
            name: 'transfer',
            inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            constant: false,
            payable: false,
            type: 'function'
        });
        
        const transferAmount = ethers.parseUnits('3.14', 18).toString();
        const transferArgs = [
            '0x9bf41f1ecd0e925c6158c98beb569526f9721300', // Recipient
            transferAmount // 3.14 B3TR in wei
        ];
        
        console.log('[DIRECT-TEST] Transfer arguments prepared:');
        console.log('[DIRECT-TEST] - Contract:', VEBETTERDAO_CONFIG.B3TR_TOKEN);
        console.log('[DIRECT-TEST] - To:', transferArgs[0]);
        console.log('[DIRECT-TEST] - Amount:', transferArgs[1]);
        
        // Step 5: Execute direct B3TR token transfer with gas sponsorship
        console.log('[DIRECT-TEST] Executing direct B3TR token transfer...');
        
        const transactionResult = await thorClient.transactions.executeTransaction(
            signer,
            VEBETTERDAO_CONFIG.B3TR_TOKEN,
            transferAbiFunction,
            transferArgs,
            {
                delegationUrl: 'https://sponsor-testnet.vechain.energy/by/90'
            }
        );
        
        console.log('[DIRECT-TEST] ✅ Transaction executed:', transactionResult.id);
        
        // Step 6: Wait for confirmation
        console.log('[DIRECT-TEST] Waiting for transaction confirmation...');
        const txReceipt = await thorClient.transactions.waitForTransaction(transactionResult.id);
        
        console.log('[DIRECT-TEST] Transaction confirmed in block:', txReceipt.meta.blockNumber);
        console.log('[DIRECT-TEST] Gas used:', txReceipt.gasUsed);
        
        // Step 7: Check if transfer succeeded
        if (txReceipt.reverted) {
            console.log('[DIRECT-TEST] ❌ TRANSFER REVERTED');
            console.log('[DIRECT-TEST] Possible reasons:');
            console.log('[DIRECT-TEST] 1. Insufficient B3TR balance in treasury wallet');
            console.log('[DIRECT-TEST] 2. B3TR token contract address incorrect');
            console.log('[DIRECT-TEST] 3. Permission or approval issue');
            
            return {
                success: false,
                error: 'Direct B3TR transfer failed - check treasury balance and permissions',
                txHash: transactionResult.id,
                receipt: txReceipt
            };
        }
        
        console.log('[DIRECT-TEST] ✅ DIRECT B3TR TRANSFER SUCCEEDED!');
        console.log('[DIRECT-TEST] 3.14 B3TR tokens transferred successfully');
        console.log('[DIRECT-TEST] Transaction hash:', transactionResult.id);
        console.log('[DIRECT-TEST] VeWorld wallet should now show updated B3TR balance!');
        
        return {
            success: true,
            txHash: transactionResult.id,
            receipt: txReceipt,
            message: 'Direct B3TR transfer successful - bypassed VeBetterDAO allocation system'
        };
        
    } catch (error) {
        console.error('[DIRECT-TEST] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Run the test
testDirectB3TRTransfer()
    .then(result => {
        console.log('\n[DIRECT-TEST] FINAL RESULT:');
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n[DIRECT-TEST] UNHANDLED ERROR:', error);
        process.exit(1);
    });

export { testDirectB3TRTransfer };