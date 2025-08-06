/**
 * Read real B3TR token balance from VeChain blockchain
 */

// B3TR contract address on VeChain
const B3TR_CONTRACT_ADDRESS = "0x5ef79995fe8a89e0812330e4378eb2660cede699";

// ERC20 balanceOf function signature
const BALANCE_OF_SIGNATURE = "0x70a08231";

/**
 * Read B3TR token balance from user's VeWorld wallet
 * This connects to the actual blockchain instead of our database
 */
export async function readWalletB3TRBalance(walletAddress: string): Promise<number> {
  try {
    // Check if Connex is available (VeWorld wallet)
    if (!window.connex) {
      console.log("[BALANCE] Connex not available, returning 0");
      return 0;
    }

    // Prepare the contract call for balanceOf(address)
    const balanceCall = window.connex.thor
      .account(B3TR_CONTRACT_ADDRESS)
      .method({
        "constant": true,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
      });

    // Call the balanceOf function
    const result = await balanceCall.call(walletAddress);
    
    if (result && result.decoded && result.decoded[0]) {
      // Convert from wei to B3TR (18 decimals)
      const balanceWei = result.decoded[0];
      const balanceB3TR = parseFloat(balanceWei) / Math.pow(10, 18);
      
      console.log(`[BALANCE] Real wallet B3TR balance for ${walletAddress}: ${balanceB3TR}`);
      return balanceB3TR;
    }
    
    return 0;
  } catch (error) {
    console.error("[BALANCE] Error reading wallet B3TR balance:", error);
    return 0;
  }
}

/**
 * Alternative method using VeChain REST API if Connex is not available
 */
export async function readWalletB3TRBalanceAPI(walletAddress: string): Promise<number> {
  try {
    // Encode the balanceOf call data
    const paddedAddress = walletAddress.slice(2).padStart(64, '0');
    const callData = BALANCE_OF_SIGNATURE + paddedAddress;
    
    // Call VeChain REST API
    const response = await fetch('/api/vechain/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress: B3TR_CONTRACT_ADDRESS,
        data: callData
      })
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.data && result.data !== '0x') {
      // Convert hex result to decimal, then from wei to B3TR
      const balanceWei = parseInt(result.data, 16);
      const balanceB3TR = balanceWei / Math.pow(10, 18);
      
      console.log(`[BALANCE] Real wallet B3TR balance (API) for ${walletAddress}: ${balanceB3TR}`);
      return balanceB3TR;
    }
    
    return 0;
  } catch (error) {
    console.error("[BALANCE] Error reading wallet B3TR balance via API:", error);
    return 0;
  }
}