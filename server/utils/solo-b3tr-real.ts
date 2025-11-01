/**
 * Real B3TR Token Distribution on Solo Node
 * Uses our working solo node with real B3TR token contract
 */

import { getVeChainConfig } from '../../shared/vechain-config';

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
    console.log(`[BALANCE-CHECK] Getting B3TR balance for ${address}`);
    
    // PRIORITY 1: Try real VeChain blockchain balance first (network-aware)
    const blockchainBalance = await getBlockchainB3TRBalance(address);
    if (blockchainBalance !== '0') {
      console.log(`[BALANCE-CHECK] ✅ Found blockchain balance: ${blockchainBalance} B3TR`);
      return blockchainBalance;
    }
    
    // PRIORITY 2: Fallback to solo node for development
    console.log(`[BALANCE-CHECK] No blockchain balance, checking solo node...`);
    const response = await fetch(`${SOLO_BASE_URL}/contracts/${SOLO_B3TR_ADDRESS}/balances/${address}`);
    const { balance } = await response.json();
    
    // Convert from wei to B3TR
    const soloBalance = (BigInt(balance) / BigInt('1000000000000000000')).toString();
    console.log(`[BALANCE-CHECK] Solo node balance: ${soloBalance} B3TR`);
    return soloBalance;
  } catch (error) {
    console.error('[BALANCE-CHECK] Error getting balance:', error);
    return '0';
  }
}

// Get B3TR balance from real VeChain blockchain (network-aware)
async function getBlockchainB3TRBalance(address: string): Promise<string> {
  try {
    // Get network config dynamically
    const config = getVeChainConfig();
    const RPC_URL = config.thorEndpoints[0];
    const B3TR_ADDRESS = config.contracts.b3trToken;
    
    console.log(`[BLOCKCHAIN-BALANCE] Checking ${config.network} balance for ${address} at ${B3TR_ADDRESS}`);
    
    // Call balanceOf function on B3TR contract
    const balanceOfSignature = '0x70a08231'; // balanceOf(address)
    const paddedAddress = address.slice(2).padStart(64, '0'); // Remove 0x and pad to 32 bytes
    
    const response = await fetch(`${RPC_URL}/accounts/${B3TR_ADDRESS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: '0x0',
        data: balanceOfSignature + paddedAddress,
        caller: address
      })
    });
    
    if (!response.ok) {
      console.log(`[BLOCKCHAIN-BALANCE] API call failed: ${response.status}`);
      return '0';
    }
    
    const result = await response.json();
    const balanceHex = result.data;
    
    if (!balanceHex || balanceHex === '0x') {
      console.log(`[BLOCKCHAIN-BALANCE] No balance data returned`);
      return '0';
    }
    
    // Convert hex to BigInt and then to B3TR (18 decimals)
    const balanceWei = BigInt(balanceHex);
    const balanceB3TR = balanceWei / BigInt('1000000000000000000');
    
    console.log(`[BLOCKCHAIN-BALANCE] Raw hex: ${balanceHex}, Wei: ${balanceWei.toString()}, B3TR: ${balanceB3TR.toString()}`);
    return balanceB3TR.toString();
    
  } catch (error) {
    console.error('[BLOCKCHAIN-BALANCE] Error checking blockchain balance:', error);
    return '0';
  }
}

export function isSoloB3TRDeployed(): boolean {
  return true; // B3TR is now deployed on our solo node
}