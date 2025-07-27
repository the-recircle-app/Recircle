// Simple direct B3TR transfer test to bypass VeBetterDAO allocation system
import { ThorClient, VeChainProvider, ProviderInternalBaseWallet } from '@vechain/sdk-network';
import { ABIFunction, HexUInt } from '@vechain/sdk-core';
import { ethers } from 'ethers';

const TESTNET_URL = 'https://testnet.vechain.org';
const B3TR_TOKEN = "0x5EF79995FE8a89e0812330E4378eB2660ceDe699";
const TREASURY_WALLET = "0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee";

async function testDirectB3TR() {
    console.log('[B3TR-DIRECT] Testing direct B3TR token transfer...');
    console.log('[B3TR-DIRECT] This bypasses VeBetterDAO allocation system since governance is frozen');
    
    // Check environment
    const privateKey = process.env.VECHAIN_PRIVATE_KEY;
    if (!privateKey) {
        console.error('[B3TR-DIRECT] ❌ VECHAIN_PRIVATE_KEY not found');
        return { success: false, error: 'Missing private key' };
    }
    
    try {
        // Connect to VeChain testnet
        const thorClient = new ThorClient(new URL(TESTNET_URL));
        console.log('[B3TR-DIRECT] ✅ Connected to VeChain testnet');
        
        // Create wallet
        const wallet = new ProviderInternalBaseWallet([{
            privateKey: Buffer.from(privateKey.replace('0x', ''), 'hex'),
            address: TREASURY_WALLET
        }]);
        
        const provider = new VeChainProvider(thorClient, wallet);
        const signer = provider.getSigner(TREASURY_WALLET);
        
        console.log('[B3TR-DIRECT] Treasury wallet:', TREASURY_WALLET);
        console.log('[B3TR-DIRECT] Target recipient: 0x9bf41f1ecd0e925c6158c98beb569526f9721300');
        console.log('[B3TR-DIRECT] Amount: 4.20 B3TR');
        
        // B3TR token transfer function
        const transferFunction = ABIFunction.from({
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
        
        const transferArgs = [
            '0x9bf41f1ecd0e925c6158c98beb569526f9721300',
            ethers.parseUnits('4.20', 18).toString()
        ];
        
        console.log('[B3TR-DIRECT] Executing direct B3TR transfer...');
        
        // Execute transaction with gas sponsorship
        const txResult = await thorClient.transactions.executeTransaction(
            signer,
            B3TR_TOKEN,
            transferFunction,
            transferArgs,
            {
                delegationUrl: 'https://sponsor-testnet.vechain.energy/by/90'
            }
        );
        
        console.log('[B3TR-DIRECT] ✅ Transaction sent:', txResult.id);
        console.log('[B3TR-DIRECT] Waiting for confirmation...');
        
        // Wait for confirmation
        const receipt = await thorClient.transactions.waitForTransaction(txResult.id);
        
        console.log('[B3TR-DIRECT] Block:', receipt.meta.blockNumber);
        console.log('[B3TR-DIRECT] Gas used:', receipt.gasUsed);
        
        if (receipt.reverted) {
            console.log('[B3TR-DIRECT] ❌ Transaction reverted');
            console.log('[B3TR-DIRECT] Possible issues:');
            console.log('[B3TR-DIRECT] - Treasury lacks sufficient B3TR balance');
            console.log('[B3TR-DIRECT] - B3TR contract permissions');
            console.log('[B3TR-DIRECT] - Contract address incorrect');
            
            return { 
                success: false, 
                error: 'Direct B3TR transfer reverted',
                txHash: txResult.id,
                receipt: receipt 
            };
        }
        
        console.log('[B3TR-DIRECT] ✅ SUCCESS! Direct B3TR transfer completed');
        console.log('[B3TR-DIRECT] 4.20 B3TR transferred from treasury to user');
        console.log('[B3TR-DIRECT] VeWorld wallet should show updated balance');
        console.log('[B3TR-DIRECT] Transaction hash:', txResult.id);
        
        return {
            success: true,
            txHash: txResult.id,
            receipt: receipt,
            approach: 'direct_b3tr_transfer',
            message: 'Bypassed VeBetterDAO allocation system successfully'
        };
        
    } catch (error) {
        console.error('[B3TR-DIRECT] Error:', error);
        return { 
            success: false, 
            error: error.message || 'Unknown error'
        };
    }
}

testDirectB3TR()
    .then(result => {
        console.log('\n[B3TR-DIRECT] FINAL RESULT:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n[B3TR-DIRECT] UNHANDLED ERROR:', error);
        process.exit(1);
    });