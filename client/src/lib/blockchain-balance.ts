/**
 * Read real B3TR token balance from VeChain blockchain using official VIP-180 patterns
 * Based on VeChain docs: https://docs.vechain.org/developer-resources/sdks-and-providers/connex/api-specification
 * VIP-180 is VeChain's fungible token standard (superset of ERC-20)
 */

// B3TR contract address on VeChain (VIP-180 token)
const B3TR_CONTRACT_ADDRESS = "0x5ef79995fe8a89e0812330e4378eb2660cede699";

// Standard VIP-180 balanceOf ABI (compatible with ERC-20 but enhanced for VeChain)
const BALANCE_OF_ABI = {
  "constant": true,
  "inputs": [{"name": "_owner", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"name": "balance", "type": "uint256"}],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
};

/**
 * Read B3TR token balance from user's VeWorld wallet using Connex
 * Following official VeChain documentation patterns
 */
export async function readWalletB3TRBalance(walletAddress: string): Promise<number> {
  try {
    // Check if Connex is available (VeWorld wallet)
    if (!window.connex) {
      console.log("[BALANCE] Connex not available, falling back to API");
      return 0;
    }

    // Create method instance following VeChain docs pattern
    const balanceOfMethod = window.connex.thor
      .account(B3TR_CONTRACT_ADDRESS)
      .method(BALANCE_OF_ABI);

    // Call the balanceOf function with wallet address
    const result = await balanceOfMethod.call(walletAddress);
    
    // Check for contract call errors
    if (result.reverted) {
      console.warn("[BALANCE] Contract call reverted for:", walletAddress);
      return 0;
    }
    
    if (result.decoded && result.decoded[0]) {
      // Convert from wei to B3TR (18 decimals)
      const balanceWei = result.decoded[0];
      const balanceB3TR = parseFloat(balanceWei) / Math.pow(10, 18);
      
      console.log(`[BALANCE] Real wallet B3TR balance for ${walletAddress}: ${balanceB3TR} B3TR`);
      console.log(`[BALANCE] Gas used: ${result.gasUsed}`);
      return balanceB3TR;
    }
    
    return 0;
  } catch (error) {
    console.error("[BALANCE] Error reading wallet B3TR balance:", error);
    return 0;
  }
}

/**
 * Alternative method using VeChain Thor REST API if Connex is not available
 * Following VeChain Thor API specification patterns for VIP-180 tokens
 */
export async function readWalletB3TRBalanceAPI(walletAddress: string): Promise<number> {
  try {
    // Encode the balanceOf call data using standard VIP-180 pattern (ERC-20 compatible)
    const balanceOfSelector = "0x70a08231"; // balanceOf(address) function selector
    const paddedAddress = walletAddress.slice(2).padStart(64, '0');
    const callData = balanceOfSelector + paddedAddress;
    
    // Call our backend VeChain proxy API
    const response = await fetch('/api/vechain/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress: B3TR_CONTRACT_ADDRESS,
        data: callData,
        caller: walletAddress
      })
    });
    
    if (!response.ok) {
      throw new Error(`VeChain API call failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check for successful contract call
    if (result.data && result.data !== '0x' && !result.reverted) {
      // Convert hex result to decimal, then from wei to B3TR
      const balanceWei = BigInt(result.data);
      const balanceB3TR = Number(balanceWei) / Math.pow(10, 18);
      
      console.log(`[BALANCE] Real wallet B3TR balance (Thor API) for ${walletAddress}: ${balanceB3TR} B3TR`);
      console.log(`[BALANCE] Gas used: ${result.gasUsed}`);
      return balanceB3TR;
    }
    
    if (result.reverted) {
      console.warn("[BALANCE] Thor API contract call reverted for:", walletAddress);
    }
    
    return 0;
  } catch (error) {
    console.error("[BALANCE] Error reading wallet B3TR balance via Thor API:", error);
    return 0;
  }
}

/**
 * Cache for balance results to avoid excessive blockchain calls
 */
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Get cached balance or fetch fresh if cache expired
 */
export async function getCachedB3TRBalance(walletAddress: string): Promise<number> {
  const cacheKey = walletAddress.toLowerCase();
  const cached = balanceCache.get(cacheKey);
  
  // Return cached balance if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[BALANCE] Using cached balance for ${walletAddress}: ${cached.balance} B3TR`);
    return cached.balance;
  }
  
  // Fetch fresh balance
  let balance = await readWalletB3TRBalance(walletAddress);
  
  // Fallback to API if Connex failed
  if (balance === 0) {
    balance = await readWalletB3TRBalanceAPI(walletAddress);
  }
  
  // Cache the result
  balanceCache.set(cacheKey, {
    balance,
    timestamp: Date.now()
  });
  
  return balance;
}