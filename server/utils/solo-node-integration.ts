/**
 * Solo Node Integration for Safe VeBetterDAO Testing
 * Provides fake B3TR token distribution in isolated environment
 */

// Solo Node Configuration
const SOLO_CONFIG = {
    rpcUrl: 'http://localhost:8669',
    network: 'solo',
    accounts: {
        admin: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        distributor: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602'
    },
    privateKeys: {
        admin: '0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36',
        distributor: '0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e'
    }
};

export async function isSoloNodeRunning(): Promise<boolean> {
    try {
        const response = await fetch(`${SOLO_CONFIG.rpcUrl}/status`);
        return response.ok;
    } catch {
        return false;
    }
}

export async function distributeSoloB3TR(
    userWallet: string,
    userAmount: number,
    appFundAmount: number,
    proof: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    
    try {
        console.log('🧪 [SOLO] Distributing fake B3TR tokens...');
        console.log(`   User: ${userWallet} -> ${userAmount} B3TR`);
        console.log(`   App Fund: ${appFundAmount} B3TR`);
        
        // Check if solo node is running
        if (!await isSoloNodeRunning()) {
            console.log('❌ [SOLO] Solo node not running. Start with: node scripts/solo-node-simple.js');
            return { success: false, error: 'Solo node not available' };
        }
        
        // Simulate transaction to solo node
        const txData = {
            clauses: [{
                to: userWallet,
                value: '0x0',
                data: '0x' + (userAmount * 1e18).toString(16).padStart(64, '0')
            }],
            gas: 200000,
            gasPrice: '0x0',
            expiration: 32,
            blockRef: '0x00000000aabbccdd',
            nonce: Date.now(),
            dependsOn: null,
            origin: SOLO_CONFIG.accounts.distributor
        };
        
        const response = await fetch(`${SOLO_CONFIG.rpcUrl}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(txData)
        });
        
        if (!response.ok) {
            throw new Error(`Solo node error: ${response.status}`);
        }
        
        const result = await response.json();
        const txHash = result.id;
        
        console.log(`✅ [SOLO] Fake B3TR distribution successful: ${txHash}`);
        
        // Simulate receipt check after delay
        setTimeout(async () => {
            try {
                const receiptResponse = await fetch(`${SOLO_CONFIG.rpcUrl}/transactions/${txHash}/receipt`);
                if (receiptResponse.ok) {
                    const receipt = await receiptResponse.json();
                    console.log(`📋 [SOLO] Receipt: Gas ${receipt.gasUsed}, Events: ${receipt.outputs[0]?.events?.length || 0}`);
                } else {
                    console.log(`📋 [SOLO] Receipt pending for ${txHash}`);
                }
            } catch (error) {
                console.log(`📋 [SOLO] Receipt check: ${error.message}`);
            }
        }, 500);
        
        return { 
            success: true, 
            txHash 
        };
        
    } catch (error) {
        console.error('❌ [SOLO] Distribution failed:', error.message);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

export async function getSoloNodeStatus() {
    try {
        const response = await fetch(`${SOLO_CONFIG.rpcUrl}/status`);
        if (response.ok) {
            const status = await response.json();
            return {
                running: true,
                ...status,
                accounts: SOLO_CONFIG.accounts
            };
        }
    } catch (error) {
        // Solo node not running
    }
    
    return { 
        running: false,
        message: 'Solo node not available. Start with: node scripts/solo-node-simple.js'
    };
}

export function getSoloConfig() {
    return SOLO_CONFIG;
}