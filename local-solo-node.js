#!/usr/bin/env node

/**
 * Local VeChain Solo Node Simulator for ReCircle B3TR Testing
 * This creates a local blockchain simulation with B3TR tokens
 */

import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';

const app = express();
app.use(cors());
app.use(express.json());

// Solo node configuration
const SOLO_CONFIG = {
  port: 8669,
  chainId: 0x27, // 39 in decimal (solo network)
  networkName: "VeChain Solo",
  genesis: {
    timestamp: Math.floor(Date.now() / 1000),
    gasLimit: "0x989680"
  }
};

// Pre-funded accounts with private keys (solo node defaults)
const ACCOUNTS = {
  "0x15d009b3a5811fde66f19b2db1d40172d53e5653": {
    privateKey: "0x99f3c8a2b37b8a8e3a9a5e3c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f",
    balance: ethers.parseEther("1000000"), // 1M VET
    vtho: ethers.parseEther("500000") // 500K VTHO
  },
  "0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee": {
    privateKey: "0x88e3c2b37b8a8e3a9a5e3c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    balance: ethers.parseEther("500000"), // 500K VET
    vtho: ethers.parseEther("250000") // 250K VTHO
  },
  "0x119761865b79bea9e7924edaa630942322ca09d1": {
    privateKey: "0x77d3b2a37b8a8e3a9a5e3c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f5",
    balance: ethers.parseEther("100000"), // 100K VET
    vtho: ethers.parseEther("50000") // 50K VTHO
  }
};

// B3TR Token Contract State
const B3TR_CONTRACT = {
  address: "0x5ef79995FE8a89e0812330E4378eB2660ceDe699", // Official B3TR testnet address
  name: "VeBetter Token",
  symbol: "B3TR",
  decimals: 18,
  totalSupply: ethers.parseEther("1000000"), // 1M B3TR
  balances: {
    "0x15d009b3a5811fde66f19b2db1d40172d53e5653": ethers.parseEther("100000"), // 100K B3TR
    "0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee": ethers.parseEther("50000"),  // 50K B3TR  
    "0x119761865b79bea9e7924edaa630942322ca09d1": ethers.parseEther("25000")   // 25K B3TR
  }
};

// Block and transaction storage
let blockNumber = 1;
let transactions = [];
let blocks = [];

// Create genesis block
blocks.push({
  number: 0,
  id: "0x" + "0".repeat(64),
  size: 236,
  parentID: "0x" + "f".repeat(64),
  timestamp: SOLO_CONFIG.genesis.timestamp,
  gasLimit: parseInt(SOLO_CONFIG.genesis.gasLimit, 16),
  gasUsed: 0,
  totalScore: 0,
  txsRoot: "0x" + "0".repeat(64),
  stateRoot: "0x" + "0".repeat(64),
  receiptsRoot: "0x" + "0".repeat(64),
  signer: "0x" + "0".repeat(40),
  isTrunk: true,
  transactions: []
});

// Generate realistic transaction hash
function generateTxHash() {
  return "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Generate realistic block ID
function generateBlockId() {
  return "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// VeChain Thor API Endpoints

// Get best block
app.get('/blocks/best', (req, res) => {
  const bestBlock = blocks[blocks.length - 1] || blocks[0];
  res.json(bestBlock);
});

// Get specific block
app.get('/blocks/:revision', (req, res) => {
  const revision = req.params.revision;
  let block;
  
  if (revision === 'best') {
    block = blocks[blocks.length - 1];
  } else if (revision.startsWith('0x')) {
    block = blocks.find(b => b.id === revision);
  } else {
    const num = parseInt(revision);
    block = blocks.find(b => b.number === num);
  }
  
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }
  
  res.json(block);
});

// Get account info
app.get('/accounts/:address', (req, res) => {
  const address = req.params.address.toLowerCase();
  const account = ACCOUNTS[address];
  
  if (!account) {
    return res.json({
      balance: "0x0",
      energy: "0x0",
      hasCode: false
    });
  }
  
  res.json({
    balance: "0x" + account.balance.toString(16),
    energy: "0x" + account.vtho.toString(16),
    hasCode: false
  });
});

// Get B3TR token balance
app.post('/accounts/*', (req, res) => {
  const clauses = req.body.clauses || [];
  const results = [];
  
  for (const clause of clauses) {
    if (clause.to?.toLowerCase() === B3TR_CONTRACT.address.toLowerCase()) {
      // Decode function call (simplified for balanceOf)
      if (clause.data?.startsWith('0x70a08231')) { // balanceOf selector
        const addressParam = clause.data.slice(34); // Skip selector and padding
        const targetAddress = "0x" + addressParam.slice(24); // Get last 20 bytes
        const balance = B3TR_CONTRACT.balances[targetAddress] || "0";
        
        results.push({
          data: "0x" + balance.toString(16).padStart(64, '0'),
          events: [],
          transfers: [],
          gasUsed: 21000,
          reverted: false,
          vmError: ""
        });
      } else {
        results.push({
          data: "0x",
          events: [],
          transfers: [],
          gasUsed: 21000,
          reverted: false,
          vmError: ""
        });
      }
    } else {
      results.push({
        data: "0x",
        events: [],
        transfers: [],
        gasUsed: 21000,
        reverted: false,
        vmError: ""
      });
    }
  }
  
  res.json(results);
});

// Send transaction (B3TR transfer simulation)
app.post('/transactions', (req, res) => {
  const txBody = req.body;
  
  console.log('📤 Transaction received:', JSON.stringify(txBody, null, 2));
  
  // Generate transaction hash
  const txId = generateTxHash();
  
  // Process B3TR transfers
  if (txBody.clauses) {
    for (const clause of txBody.clauses) {
      if (clause.to?.toLowerCase() === B3TR_CONTRACT.address.toLowerCase()) {
        // Decode transfer function call
        if (clause.data?.startsWith('0xa9059cbb')) { // transfer selector
          const toAddress = "0x" + clause.data.slice(34, 74);
          const amountHex = clause.data.slice(74);
          const amount = BigInt("0x" + amountHex);
          
          console.log(`💰 B3TR Transfer: ${ethers.formatEther(amount)} B3TR to ${toAddress}`);
          
          // Update balances (simplified - no sender balance check)
          if (!B3TR_CONTRACT.balances[toAddress]) {
            B3TR_CONTRACT.balances[toAddress] = "0";
          }
          
          const currentBalance = BigInt(B3TR_CONTRACT.balances[toAddress] || "0");
          B3TR_CONTRACT.balances[toAddress] = (currentBalance + amount).toString();
          
          console.log(`✅ Updated ${toAddress} balance: ${ethers.formatEther(B3TR_CONTRACT.balances[toAddress])} B3TR`);
        }
      }
    }
  }
  
  // Create new block with transaction
  const newBlock = {
    number: blockNumber++,
    id: generateBlockId(),
    size: 500 + Math.floor(Math.random() * 200),
    parentID: blocks[blocks.length - 1].id,
    timestamp: Math.floor(Date.now() / 1000),
    gasLimit: parseInt(SOLO_CONFIG.genesis.gasLimit, 16),
    gasUsed: 21000 * (txBody.clauses?.length || 1),
    totalScore: blockNumber,
    txsRoot: generateBlockId(),
    stateRoot: generateBlockId(),
    receiptsRoot: generateBlockId(),
    signer: "0x" + "0".repeat(40),
    isTrunk: true,
    transactions: [txId]
  };
  
  blocks.push(newBlock);
  
  // Store transaction
  transactions.push({
    id: txId,
    chainTag: txBody.chainTag || 39,
    blockRef: txBody.blockRef || "0x00000000aabbccdd",
    expiration: txBody.expiration || 32,
    clauses: txBody.clauses || [],
    gasPriceCoef: txBody.gasPriceCoef || 0,
    gas: txBody.gas || 21000,
    origin: "0x15d009b3a5811fde66f19b2db1d40172d53e5653", // Default sender
    delegator: txBody.delegator || null,
    size: 200,
    gasUsed: 21000,
    gasPayer: "0x15d009b3a5811fde66f19b2db1d40172d53e5653",
    paid: "0x" + (21000n * 1000000000000000n).toString(16), // 21000 * 1e15 wei
    reward: "0x0",
    reverted: false,
    outputs: []
  });
  
  console.log(`⛓️  New block #${newBlock.number} created with transaction ${txId}`);
  
  res.json({ id: txId });
});

// Get transaction receipt
app.get('/transactions/:txid/receipt', (req, res) => {
  const txId = req.params.txid;
  const tx = transactions.find(t => t.id === txId);
  
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  res.json({
    gasUsed: tx.gasUsed,
    gasPayer: tx.gasPayer,
    paid: tx.paid,
    reward: tx.reward,
    reverted: tx.reverted,
    meta: {
      blockID: blocks.find(b => b.transactions.includes(txId))?.id || generateBlockId(),
      blockNumber: blocks.find(b => b.transactions.includes(txId))?.number || blockNumber - 1,
      blockTimestamp: Math.floor(Date.now() / 1000),
      txID: txId,
      txOrigin: tx.origin
    },
    outputs: tx.outputs
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    network: SOLO_CONFIG.networkName,
    chainId: SOLO_CONFIG.chainId,
    blockNumber: blockNumber - 1,
    b3trContract: B3TR_CONTRACT.address
  });
});

// Start the solo node simulator
app.listen(SOLO_CONFIG.port, '0.0.0.0', () => {
  console.log(`🚀 VeChain Solo Node Simulator started!`);
  console.log(`📡 Network: ${SOLO_CONFIG.networkName} (Chain ID: ${SOLO_CONFIG.chainId})`);
  console.log(`🌐 API URL: http://localhost:${SOLO_CONFIG.port}`);
  console.log(`💰 B3TR Contract: ${B3TR_CONTRACT.address}`);
  console.log(`\n📋 Pre-funded Accounts:`);
  
  Object.entries(ACCOUNTS).forEach(([address, account]) => {
    const b3trBalance = B3TR_CONTRACT.balances[address] || "0";
    console.log(`  ${address}:`);
    console.log(`    VET: ${ethers.formatEther(account.balance)}`);
    console.log(`    VTHO: ${ethers.formatEther(account.vtho)}`);
    console.log(`    B3TR: ${ethers.formatEther(b3trBalance)}`);
  });
  
  console.log(`\n✅ Ready for ReCircle B3TR testing!`);
  console.log(`🧪 Test endpoint: http://localhost:${SOLO_CONFIG.port}/health`);
});