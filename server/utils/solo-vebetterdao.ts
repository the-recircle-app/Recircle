/**
 * Solo Node VeBetterDAO Integration
 * Real B3TR distribution using the working integrated Solo node
 */

const SOLO_BASE_URL = 'http://localhost:5000';
const B3TR_CONTRACT_ADDRESS = '0x5ef79995fe8a89e0812330e4378eb2660cede699';

// Pre-funded distributor account from solo node
const SOLO_DISTRIBUTOR = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';

interface SoloDistributionResult {
    success: boolean;
    txHash?: string;
    amount?: string;
    recipient?: string;
    error?: string;
}

/**
 * Distribute real B3TR tokens using integrated Solo node
 */
export async function distributeSoloVeBetterDAO(
    recipient: string,
    amount: number
): Promise<SoloDistributionResult> {
    try {
        console.log(`[SOLO-VEBETTERDAO] Distributing ${amount} B3TR to ${recipient}`);
        
        // Convert amount to wei (B3TR has 18 decimals)
        const amountWei = (BigInt(amount) * BigInt('1000000000000000000')).toString();
        
        // Execute B3TR transfer using Solo node
        const transferResponse = await fetch(`${SOLO_BASE_URL}/solo/contracts/${B3TR_CONTRACT_ADDRESS}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: SOLO_DISTRIBUTOR,
                to: recipient,
                amount: amountWei
            })
        });
        
        const transferResult = await transferResponse.json();
        
        if (transferResult.success && transferResult.txId) {
            console.log(`[SOLO-VEBETTERDAO] ✅ Successfully distributed ${amount} B3TR`);
            console.log(`[SOLO-VEBETTERDAO] Transaction: ${transferResult.txId}`);
            
            return {
                success: true,
                txHash: transferResult.txId,
                amount: amount.toString(),
                recipient
            };
        } else {
            console.log(`[SOLO-VEBETTERDAO] ❌ Distribution failed: ${transferResult.error}`);
            return {
                success: false,
                error: transferResult.error || 'Solo node transfer failed'
            };
        }
        
    } catch (error) {
        console.error('[SOLO-VEBETTERDAO] Distribution error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check B3TR balance on Solo node
 */
export async function getSoloB3TRBalance(address: string): Promise<string> {
    try {
        const response = await fetch(`${SOLO_BASE_URL}/solo/contracts/${B3TR_CONTRACT_ADDRESS}/balances/${address}`);
        const result = await response.json();
        
        // Convert from wei to B3TR (18 decimals)
        const balanceWei = BigInt(result.balance || '0');
        const balanceB3TR = balanceWei / BigInt('1000000000000000000');
        
        return balanceB3TR.toString();
    } catch (error) {
        console.error('[SOLO-VEBETTERDAO] Balance check error:', error);
        return '0';
    }
}

/**
 * Test Solo VeBetterDAO distribution
 */
export async function testSoloVeBetterDAO(): Promise<SoloDistributionResult> {
    console.log('[SOLO-VEBETTERDAO] Testing distribution system...');
    
    const testRecipient = '0xd3ae78222beadb038203be21ed5ce7c9b1bff602';
    const testAmount = 3;
    
    const result = await distributeSoloVeBetterDAO(testRecipient, testAmount);
    
    if (result.success) {
        console.log('[SOLO-VEBETTERDAO] ✅ Test successful');
        const balance = await getSoloB3TRBalance(testRecipient);
        console.log(`[SOLO-VEBETTERDAO] Recipient balance: ${balance} B3TR`);
    }
    
    return result;
}

/**
 * Check if Solo node is available
 */
export async function isSoloVeBetterDAOAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${SOLO_BASE_URL}/solo/status`);
        const status = await response.json();
        return status.ready === true;
    } catch (error) {
        return false;
    }
}