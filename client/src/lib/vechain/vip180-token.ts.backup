/**
 * VIP-180 Token Implementation
 * 
 * This file contains the implementation of VIP-180 token standard (VeChain's ERC-20 equivalent)
 * for the B3TR token. It provides functions for interacting with the token contract.
 */

// BUILD_TEMP: import { Framework } from '@vechain/connex-framework';
// BUILD_TEMP: import { Driver, SimpleNet } from '@vechain/connex-driver';
import { TESTNET_CONFIG, PRECOMPILED_CONTRACTS } from './testnet-config';

// Initialize Connex instance
let connex: Framework | null = null;

/**
 * Initialize connection to VeChain Thor blockchain
 * @param network - 'main' for mainnet, 'test' for testnet
 * @returns Connex framework instance
 */
export async function initConnex(network: 'main' | 'test' = 'test'): Promise<Framework> {
  if (connex) return connex;
  
  try {
    // Use testnet configuration
    const nodeUrl = TESTNET_CONFIG.nodeUrl;
    
    // Create a driver connecting to the specified node
    const driver = await Driver.connect(new SimpleNet(nodeUrl));
    
    // Create a Connex framework instance using the driver
    connex = new Framework(driver);
    
    console.log(`Connected to VeChain Thor ${network === 'main' ? 'mainnet' : 'testnet'}`);
    return connex;
  } catch (error) {
    console.error('Failed to initialize Connex:', error);
    throw error;
  }
}

/**
 * Get B3TR token balance for an address
 * @param address - The wallet address to check
 * @returns Token balance as a formatted string with decimals
 */
export async function getTokenBalance(address: string): Promise<string> {
  try {
    const connexInstance = await initConnex();
    const tokenAddress = TESTNET_CONFIG.tokenConfig.b3trTokenAddress;
    
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('Token address not configured - using mock balance');
      return '100.0'; // Mock balance for development
    }
    
    // Create a contract visitor instance for the token
    const tokenContract = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'balanceOf'));
    
    // Call the balanceOf method
    const result = await tokenContract.call(address);
    
    // Convert balance from wei to token units (considering decimals)
    const decimals = TESTNET_CONFIG.tokenConfig.decimals;
    const balance = result.decoded[0];
    const formattedBalance = (parseInt(balance) / Math.pow(10, decimals)).toFixed(2);
    
    return formattedBalance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0.00';
  }
}

/**
 * Transfer B3TR tokens to another address
 * 
 * @param to - Recipient address
 * @param amount - Amount to transfer (in token units, not wei)
 * @returns Transaction ID if successful
 */
export async function transferTokens(
  to: string, 
  amount: number
): Promise<{ txid: string } | null> {
  try {
    const connexInstance = await initConnex();
    const tokenAddress = TESTNET_CONFIG.tokenConfig.b3trTokenAddress;
    
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('Token address not configured - using mock transaction');
      return { 
        txid: '0x' + Array(64).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      };
    }
    
    // Prepare the transfer transaction
    const transferMethod = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'transfer'));
    
    // Convert amount to wei (considering decimals)
    const decimals = TESTNET_CONFIG.tokenConfig.decimals;
    const amountInWei = (amount * Math.pow(10, decimals)).toString();
    
    // Create the clause for the transaction
    const clause = transferMethod.asClause(to, amountInWei);
    
    // Request signing and send the transaction
    const signingService = connexInstance.vendor.sign('tx', [clause]);
    const signedTx = await signingService.request();
    
    return { txid: signedTx.txid };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return null;
  }
}

/**
 * Mint new B3TR tokens (only callable by contract owner/minter)
 * 
 * @param to - Recipient address
 * @param amount - Amount to mint (in token units, not wei)
 * @returns Transaction ID if successful
 */
export async function mintTokens(
  to: string, 
  amount: number
): Promise<{ txid: string } | null> {
  try {
    const connexInstance = await initConnex();
    const tokenAddress = TESTNET_CONFIG.tokenConfig.b3trTokenAddress;
    
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('Token address not configured - using mock transaction');
      return { 
        txid: '0x' + Array(64).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      };
    }
    
    // Prepare the mint transaction
    const mintMethod = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'mint'));
    
    // Convert amount to wei (considering decimals)
    const decimals = TESTNET_CONFIG.tokenConfig.decimals;
    const amountInWei = (amount * Math.pow(10, decimals)).toString();
    
    // Create the clause for the transaction
    const clause = mintMethod.asClause(to, amountInWei);
    
    // Request signing and send the transaction
    const signingService = connexInstance.vendor.sign('tx', [clause]);
    const signedTx = await signingService.request();
    
    return { txid: signedTx.txid };
  } catch (error) {
    console.error('Error minting tokens:', error);
    return null;
  }
}

/**
 * Get token information (name, symbol, decimals, total supply)
 * 
 * @returns Token information object
 */
export async function getTokenInfo(): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}> {
  try {
    const connexInstance = await initConnex();
    const tokenAddress = TESTNET_CONFIG.tokenConfig.b3trTokenAddress;
    
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return {
        name: TESTNET_CONFIG.tokenConfig.name,
        symbol: TESTNET_CONFIG.tokenConfig.symbol,
        decimals: TESTNET_CONFIG.tokenConfig.decimals,
        totalSupply: '1000000.00' // Mock total supply for development
      };
    }
    
    // Create contract visitors for each property
    const nameMethod = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'name'));
    
    const symbolMethod = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'symbol'));
    
    const decimalsMethod = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'decimals'));
    
    const totalSupplyMethod = connexInstance.thor.account(tokenAddress)
      .method(PRECOMPILED_CONTRACTS.vip180Token.find(abi => abi.name === 'totalSupply'));
    
    // Call methods in parallel
    const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = await Promise.all([
      nameMethod.call(),
      symbolMethod.call(),
      decimalsMethod.call(),
      totalSupplyMethod.call()
    ]);
    
    // Get results
    const name = nameResult.decoded[0];
    const symbol = symbolResult.decoded[0];
    const decimals = decimalsResult.decoded[0];
    
    // Format total supply
    const totalSupplyWei = totalSupplyResult.decoded[0];
    const totalSupply = (parseInt(totalSupplyWei) / Math.pow(10, decimals)).toFixed(2);
    
    return { name, symbol, decimals, totalSupply };
  } catch (error) {
    console.error('Error getting token info:', error);
    return {
      name: TESTNET_CONFIG.tokenConfig.name,
      symbol: TESTNET_CONFIG.tokenConfig.symbol,
      decimals: TESTNET_CONFIG.tokenConfig.decimals,
      totalSupply: '0.00'
    };
  }
}