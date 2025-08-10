/**
 * Simple Treasury Distribution
 * 
 * Uses the PROVEN working-distribution.ts pattern but sources tokens 
 * from VeBetterDAO treasury instead of personal wallet
 */

import * as thor from 'thor-devkit';

const TESTNET_RPC = 'https://testnet.vechain.org';
const CONTRACTS = {
  B3TR_TOKEN: process.env.B3TR_CONTRACT_ADDRESS || '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F',
  X2EARN_REWARDS_POOL: process.env.X2EARNREWARDSPOOL_ADDRESS || '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38'
};

// Use VeBetterDAO treasury wallet instead of personal wallet
const TREASURY_PRIVATE_KEY = process.env.TREASURY_DISTRIBUTOR_KEY;

// ERC20 transfer function signature (same as working-distribution.ts)
const ERC20_TRANSFER_SIG = 'transfer(address,uint256)';

interface TreasuryDistributionResult {
  success: boolean;
  userAmount: number;
  appAmount: number;
  transactions: {
    user: string;
    app: string;
  };
  network: string;
  method: 'treasury-direct-transfer';
}

/**
 * Distribute B3TR tokens using direct ERC20 transfers from VeBetterDAO treasury
 * This uses the EXACT same pattern as working-distribution.ts but with treasury keys
 */
export async function distributeTreasuryB3TR(
  recipientAddress: string,
  totalAmount: number,
  receiptId: number
): Promise<TreasuryDistributionResult> {
  
  console.log(`[TREASURY-SIMPLE] 🏛️ Distributing ${totalAmount} B3TR from VeBetterDAO treasury`);
  console.log(`[TREASURY-SIMPLE] Using PROVEN working-distribution.ts pattern`);
  
  // Check environment
  const treasuryKey = TREASURY_PRIVATE_KEY || process.env.DISTRIBUTOR_PRIVATE_KEY;
  console.log(`[TREASURY-SIMPLE] Treasury key: ${treasuryKey ? 'SET' : 'MISSING'}`);
  console.log(`[TREASURY-SIMPLE] B3TR contract: ${CONTRACTS.B3TR_TOKEN}`);
  
  if (!treasuryKey) {
    throw new Error('Treasury distributor private key not configured');
  }

  // Create treasury wallet (same pattern as working-distribution.ts)
  let treasuryPrivateKey: Buffer;
  let treasuryAddress: string;
  try {
    const cleanPrivateKey = treasuryKey.startsWith('0x') ? treasuryKey.slice(2) : treasuryKey;
    
    if (cleanPrivateKey.length !== 64) {
      throw new Error(`Invalid treasury key length: ${cleanPrivateKey.length}, expected 64 hex characters`);
    }
    
    treasuryPrivateKey = Buffer.from(cleanPrivateKey, 'hex');
    
    // Derive address using thor-devkit (same as working system)
    const publicKey = thor.secp256k1.derivePublicKey(treasuryPrivateKey);
    treasuryAddress = thor.address.fromPublicKey(publicKey);
    console.log(`[TREASURY-SIMPLE] Treasury wallet: ${treasuryAddress}`);
  } catch (error) {
    throw new Error(`Treasury wallet creation failed: ${error}`);
  }

  // Calculate 70/30 split (same as working system)
  const userReward = totalAmount * 0.7;
  const appReward = totalAmount * 0.3;
  const appFundAddress = process.env.APP_FUND_WALLET || '0x119761865b79bea9e7924edaa630942322ca09d1';

  // Convert to wei (same as working system)
  const userAmountWei = BigInt(Math.floor(userReward * 1e18)).toString();
  const appAmountWei = BigInt(Math.floor(appReward * 1e18)).toString();

  console.log(`[TREASURY-SIMPLE] User: ${userReward} B3TR (${userAmountWei} wei) → ${recipientAddress}`);
  console.log(`[TREASURY-SIMPLE] App: ${appReward} B3TR (${appAmountWei} wei) → ${appFundAddress}`);

  // Encode ERC20 transfer calls (EXACT same as working-distribution.ts)
  const transferSelector = thor.keccak256(ERC20_TRANSFER_SIG).slice(0, 4);
  
  // User transfer data
  const userTransferData = Buffer.concat([
    transferSelector,
    Buffer.from(recipientAddress.slice(2).padStart(64, '0'), 'hex'),
    Buffer.from(BigInt(userAmountWei).toString(16).padStart(64, '0'), 'hex')
  ]);

  // App transfer data
  const appTransferData = Buffer.concat([
    transferSelector,
    Buffer.from(appFundAddress.slice(2).padStart(64, '0'), 'hex'),
    Buffer.from(BigInt(appAmountWei).toString(16).padStart(64, '0'), 'hex')
  ]);

  // Get best block (same as working system)
  console.log(`[TREASURY-SIMPLE] Fetching best block from ${TESTNET_RPC}/blocks/best`);
  const response = await fetch(`${TESTNET_RPC}/blocks/best`);
  if (!response.ok) {
    throw new Error(`Failed to fetch best block: ${response.status} ${response.statusText}`);
  }
  
  const bestBlock = await response.json();
  console.log(`[TREASURY-SIMPLE] Using block ${bestBlock.number} (${bestBlock.id})`);

  // Build transactions (same pattern as working system)
  const baseNonce = Date.now();

  // User transaction
  const userTxBody = {
    chainTag: 0x27,
    blockRef: bestBlock.id.slice(0, 18),
    expiration: 32,
    clauses: [{
      to: CONTRACTS.B3TR_TOKEN,
      value: '0x0',
      data: '0x' + userTransferData.toString('hex')
    }],
    gasPriceCoef: 0,
    gas: 50000,
    dependsOn: null,
    nonce: baseNonce
  };

  // App fund transaction
  const appTxBody = {
    chainTag: 0x27,
    blockRef: bestBlock.id.slice(0, 18),
    expiration: 32,
    clauses: [{
      to: CONTRACTS.B3TR_TOKEN,
      value: '0x0',
      data: '0x' + appTransferData.toString('hex')
    }],
    gasPriceCoef: 0,
    gas: 50000,
    dependsOn: null,
    nonce: baseNonce + 1
  };

  // Sign and submit transactions (same as working system)
  console.log(`[TREASURY-SIMPLE] Signing transactions with treasury wallet...`);
  
  const userTx = new thor.Transaction(userTxBody);
  const userSigningHash = userTx.signingHash();
  const userSignature = thor.secp256k1.sign(userSigningHash, treasuryPrivateKey);
  userTx.signature = userSignature;

  const appTx = new thor.Transaction(appTxBody);
  const appSigningHash = appTx.signingHash();
  const appSignature = thor.secp256k1.sign(appSigningHash, treasuryPrivateKey);
  appTx.signature = appSignature;

  // Submit transactions
  const userRawTx = '0x' + userTx.encode().toString('hex');
  const appRawTx = '0x' + appTx.encode().toString('hex');

  console.log(`[TREASURY-SIMPLE] Submitting user transaction...`);
  const userSubmitResponse = await fetch(`${TESTNET_RPC}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: userRawTx })
  });

  const userSubmitResult = await userSubmitResponse.json();
  if (!userSubmitResponse.ok) {
    throw new Error(`User transaction failed: ${JSON.stringify(userSubmitResult)}`);
  }

  console.log(`[TREASURY-SIMPLE] Submitting app transaction...`);
  const appSubmitResponse = await fetch(`${TESTNET_RPC}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: appRawTx })
  });

  const appSubmitResult = await appSubmitResponse.json();
  if (!appSubmitResponse.ok) {
    throw new Error(`App transaction failed: ${JSON.stringify(appSubmitResult)}`);
  }

  const userTxHash = userSubmitResult.id || ('0x' + userTx.id!.toString('hex'));
  const appTxHash = appSubmitResult.id || ('0x' + appTx.id!.toString('hex'));

  console.log(`[TREASURY-SIMPLE] ✅ Treasury Distribution Complete!`);
  console.log(`[TREASURY-SIMPLE] User TX: ${userTxHash}`);
  console.log(`[TREASURY-SIMPLE] App TX: ${appTxHash}`);
  console.log(`[TREASURY-SIMPLE] Source: VeBetterDAO Treasury wallet`);
  console.log(`[TREASURY-SIMPLE] Method: Direct ERC20 transfer (proven pattern)`);

  return {
    success: true,
    userAmount: userReward,
    appAmount: appReward,
    transactions: {
      user: userTxHash,
      app: appTxHash
    },
    network: 'VeChain Testnet',
    method: 'treasury-direct-transfer'
  };
}

export default { distributeTreasuryB3TR };