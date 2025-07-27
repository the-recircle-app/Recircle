/**
 * VeChain Thor Testnet Configuration
 * 
 * This file contains the configuration for connecting to the VeChain Thor testnet.
 * We use this environment for development and testing before deploying to mainnet.
 */

export const TESTNET_CONFIG = {
  // Thor testnet node URL
  nodeUrl: 'https://testnet.veblocks.net',
  
  // Testnet network ID
  networkId: '0x27', // '39' in decimal, represents the testnet network
  
  // Block explorer URL for testnet
  explorerUrl: 'https://explore-testnet.vechain.org',
  
  // VIP-180 token parameters for testing
  tokenConfig: {
    // This will be populated with our actual deployed test token contract
    b3trTokenAddress: '0x0000000000000000000000000000000000000000',
    
    // Token specifications according to VIP-180 standard
    name: 'B3TR Test Token',
    symbol: 'B3TR',
    decimals: 18,
  },
  
  // Multi-Party Payment (MPP) configuration
  mppConfig: {
    // Master account that will sponsor transaction fees
    sponsorAddress: '0x0000000000000000000000000000000000000000',
    // Credit plan for sponsored users (in VTHO)
    creditPlan: {
      credit: '5000000000000000000', // 5 VTHO
      recoveryRate: '1000000000000000000' // 1 VTHO per day
    }
  }
};

// Pre-compiled contract ABIs (Application Binary Interfaces)
export const PRECOMPILED_CONTRACTS = {
  // Prototype implementation for VIP-180 Token
  vip180Token: [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [{ "name": "", "type": "string" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        { "name": "_spender", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "name": "approve",
      "outputs": [{ "name": "success", "type": "bool" }],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{ "name": "", "type": "uint256" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        { "name": "_from", "type": "address" },
        { "name": "_to", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "name": "transferFrom",
      "outputs": [{ "name": "success", "type": "bool" }],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{ "name": "", "type": "uint8" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{ "name": "_owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "balance", "type": "uint256" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{ "name": "", "type": "string" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        { "name": "_to", "type": "address" },
        { "name": "_value", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "name": "success", "type": "bool" }],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        { "name": "_owner", "type": "address" },
        { "name": "_spender", "type": "address" }
      ],
      "name": "allowance",
      "outputs": [{ "name": "remaining", "type": "uint256" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "_from", "type": "address" },
        { "indexed": true, "name": "_to", "type": "address" },
        { "indexed": false, "name": "_value", "type": "uint256" }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "_owner", "type": "address" },
        { "indexed": true, "name": "_spender", "type": "address" },
        { "indexed": false, "name": "_value", "type": "uint256" }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        { "name": "_to", "type": "address" },
        { "name": "_amount", "type": "uint256" }
      ],
      "name": "mint",
      "outputs": [{ "name": "", "type": "bool" }],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
  // Prototype for Multi-Party Payment (MPP) Contract
  mpp: [
    {
      "constant": false,
      "inputs": [
        { "name": "_credit", "type": "uint256" },
        { "name": "_recoveryRate", "type": "uint256" }
      ],
      "name": "setCreditPlan",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        { "name": "_user", "type": "address" },
        { "name": "_credit", "type": "uint256" }
      ],
      "name": "setUserCredit",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{ "name": "_sponsor", "type": "address" }],
      "name": "selectSponsor",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [{ "name": "_user", "type": "address" }],
      "name": "sponsor",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{ "name": "_user", "type": "address" }],
      "name": "getCreditPlan",
      "outputs": [
        { "name": "credit", "type": "uint256" },
        { "name": "recoveryRate", "type": "uint256" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ]
};