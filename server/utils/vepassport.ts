/**
 * VePassport Integration
 * 
 * Reads bot signaling data from VeBetterDAO's VePassport contract
 * to check if a wallet is considered a legitimate person before distributing rewards.
 * 
 * This is a READ-ONLY integration - anyone can fetch signals without endorsement.
 * Writing signals (flagging wallets) requires signal admin permissions.
 */

import { getVeChainConfig, isMainnet } from '../../shared/vechain-config';

const VEPASSPORT_ABI = [
  {
    "inputs": [{ "name": "_user", "type": "address" }],
    "name": "isPerson",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_user", "type": "address" }],
    "name": "signaledCounter",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "signalingThreshold",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

interface VePassportStatus {
  isPerson: boolean;
  signalCount: number;
  threshold: number;
  checked: boolean;
  error?: string;
}

/**
 * Check if a wallet passes VePassport personhood verification
 * Returns true if the wallet is considered a legitimate person
 * 
 * On testnet, always returns true (VePassport only exists on mainnet)
 */
export async function checkVePassport(walletAddress: string): Promise<VePassportStatus> {
  const config = getVeChainConfig();
  
  if (!isMainnet() || !config.contracts.vePassport) {
    console.log(`[VEPASSPORT] Skipping check - testnet or no VePassport contract configured`);
    return {
      isPerson: true,
      signalCount: 0,
      threshold: 0,
      checked: false
    };
  }
  
  try {
    console.log(`[VEPASSPORT] Checking personhood for wallet: ${walletAddress}`);
    
    const endpoint = config.thorEndpoints[0];
    const contractAddress = config.contracts.vePassport;
    
    const [isPersonResult, signalCountResult, thresholdResult] = await Promise.all([
      callVePassportFunction(endpoint, contractAddress, 'isPerson', walletAddress),
      callVePassportFunction(endpoint, contractAddress, 'signaledCounter', walletAddress),
      callVePassportFunction(endpoint, contractAddress, 'signalingThreshold', null)
    ]);
    
    const isPerson = isPersonResult === true || isPersonResult === '0x0000000000000000000000000000000000000000000000000000000000000001';
    const signalCount = typeof signalCountResult === 'number' ? signalCountResult : parseInt(signalCountResult || '0', 16);
    const threshold = typeof thresholdResult === 'number' ? thresholdResult : parseInt(thresholdResult || '0', 16);
    
    console.log(`[VEPASSPORT] Result for ${walletAddress}: isPerson=${isPerson}, signals=${signalCount}, threshold=${threshold}`);
    
    return {
      isPerson,
      signalCount,
      threshold,
      checked: true
    };
    
  } catch (error: any) {
    console.error(`[VEPASSPORT] Error checking wallet ${walletAddress}:`, error.message);
    return {
      isPerson: true,
      signalCount: 0,
      threshold: 0,
      checked: false,
      error: error.message
    };
  }
}

/**
 * Call a VePassport contract function using Thor REST API
 */
async function callVePassportFunction(
  endpoint: string, 
  contractAddress: string, 
  functionName: string,
  walletAddress: string | null
): Promise<any> {
  const functionSignatures: Record<string, string> = {
    'isPerson': '0x9c5d0d04',
    'signaledCounter': '0x7c3c9e6d',
    'signalingThreshold': '0x9f9106d1'
  };
  
  let data = functionSignatures[functionName];
  
  if (walletAddress) {
    const paddedAddress = walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
    data += paddedAddress;
  }
  
  const response = await fetch(`${endpoint}/accounts/${contractAddress}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clauses: [{
        to: contractAddress,
        value: '0x0',
        data: data
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Thor API error: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result && result[0] && result[0].data) {
    return result[0].data;
  }
  
  return null;
}

/**
 * Check if wallet should be blocked from receiving rewards
 * Returns { blocked: true, reason: string } if wallet fails VePassport check
 */
export async function shouldBlockReward(walletAddress: string): Promise<{ blocked: boolean; reason?: string; status?: VePassportStatus }> {
  const status = await checkVePassport(walletAddress);
  
  if (!status.checked) {
    return { blocked: false, status };
  }
  
  if (!status.isPerson) {
    return {
      blocked: true,
      reason: `This wallet has been flagged by the VeBetterDAO community (${status.signalCount} signals). Please visit VeBetterDAO to learn more about VePassport verification.`,
      status
    };
  }
  
  return { blocked: false, status };
}
