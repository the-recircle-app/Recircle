/**
 * Real B3TR Token Distribution on Solo Node
 * Uses our working solo node with real B3TR token contract
 */

// Solo node B3TR contract address
const SOLO_B3TR_ADDRESS = '0x5ef79995fe8a89e0812330e4378eb2660cede699';
const SOLO_BASE_URL = 'http://localhost:5000/solo';

// Pre-funded distributor account from solo node
const DISTRIBUTOR_ADDRESS = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';

export async function distributeRealB3TR(userAddress: string, amount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log(`[SOLO-B3TR] 🎯 Distributing ${amount} B3TR to ${userAddress}`);

    // Convert amount to wei (18 decimals)
    const amountWei = (BigInt(amount) * BigInt('1000000000000000000')).toString();

    // Use solo node's B3TR transfer endpoint
    const response = await fetch(`${SOLO_BASE_URL}/contracts/${SOLO_B3TR_ADDRESS}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: DISTRIBUTOR_ADDRESS,
        to: userAddress,
        amount: amountWei
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`[SOLO-B3TR] ✅ Transfer successful!`);
      console.log(`[SOLO-B3TR] 📄 Transaction hash: ${result.txId}`);
      console.log(`[SOLO-B3TR] 💰 User balance: ${(BigInt(result.toBalance) / BigInt('1000000000000000000')).toString()} B3TR`);

      return {
        success: true,
        txHash: result.txId
      };
    } else {
      console.error(`[SOLO-B3TR] ❌ Transfer failed: ${result.error}`);
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('[SOLO-B3TR] ❌ Distribution failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getSoloB3TRBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`${SOLO_BASE_URL}/contracts/${SOLO_B3TR_ADDRESS}/balances/${address}`);
    const { balance } = await response.json();
    
    // Convert from wei to B3TR
    return (BigInt(balance) / BigInt('1000000000000000000')).toString();
  } catch (error) {
    console.error('[SOLO-B3TR] Error getting balance:', error);
    return '0';
  }
}

export function isSoloB3TRDeployed(): boolean {
  return true; // B3TR is now deployed on our solo node
}