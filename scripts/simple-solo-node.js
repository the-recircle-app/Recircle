#!/usr/bin/env node

/**
 * Simple VeChain Solo Node Implementation
 * Creates a local blockchain environment for testing
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Solo node state
let blockNumber = 0;
let blocks = [];
let transactions = [];
let accounts = new Map();
let contracts = new Map();

// Pre-funded solo accounts
const GENESIS_ACCOUNTS = [
    {
        address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        privateKey: '0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36',
        balance: '25000000000000000000000000' // 25M VET
    },
    {
        address: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602',
        privateKey: '0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e',
        balance: '25000000000000000000000000' // 25M VET
    },
    {
        address: '0x733b7269443c70de16bbf9b0615307884bcc5636',
        privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
        balance: '25000000000000000000000000' // 25M VET
    }
];

// Initialize genesis state
function initializeGenesis() {
    console.log('🔧 Initializing Solo Node Genesis State...');
    
    // Setup genesis accounts
    GENESIS_ACCOUNTS.forEach(account => {
        accounts.set(account.address.toLowerCase(), {
            balance: account.balance,
            energy: '5000000000000000000000000', // 5M VTHO
            hasCode: false,
            codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        });
    });
    
    // Create genesis block
    const genesisBlock = {
        number: blockNumber,
        id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
        parentID: '0x0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: Math.floor(Date.now() / 1000),
        gasLimit: 10000000,
        gasUsed: 0,
        totalScore: 0,
        txsRoot: '0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0',
        stateRoot: '0x4ec3af0acbad1ae467ad569337d2fe8576fe303928d35b8cdd91de47e9ac84bb',
        receiptsRoot: '0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0',
        signer: '0x0000000000000000000000000000000000000000',
        transactions: []
    };
    
    blocks.push(genesisBlock);
    blockNumber++;
    
    console.log('✅ Genesis block created');
    console.log(`   Block #${genesisBlock.number}: ${genesisBlock.id}`);
}

// VeChain API endpoints
app.get('/blocks/best', (req, res) => {
    const bestBlock = blocks[blocks.length - 1];
    res.json(bestBlock);
});

app.get('/blocks/:id', (req, res) => {
    const { id } = req.params;
    let block;
    
    if (id === 'best') {
        block = blocks[blocks.length - 1];
    } else if (id.startsWith('0x')) {
        block = blocks.find(b => b.id === id);
    } else {
        const num = parseInt(id);
        block = blocks.find(b => b.number === num);
    }
    
    if (block) {
        res.json(block);
    } else {
        res.status(404).json({ error: 'Block not found' });
    }
});

app.get('/accounts/:address', (req, res) => {
    const address = req.params.address.toLowerCase();
    const account = accounts.get(address);
    
    if (account) {
        res.json({
            balance: '0x' + BigInt(account.balance).toString(16),
            energy: '0x' + BigInt(account.energy).toString(16),
            hasCode: account.hasCode,
            codeHash: account.codeHash
        });
    } else {
        res.json({
            balance: '0x0',
            energy: '0x0', 
            hasCode: false,
            codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        });
    }
});

app.post('/transactions', (req, res) => {
    const tx = req.body;
    
    // Generate transaction ID
    const txId = '0x' + Math.random().toString(16).substr(2, 64);
    
    // Simulate transaction execution
    const receipt = {
        txID: txId,
        txOrigin: tx.origin || GENESIS_ACCOUNTS[0].address,
        gasUsed: 23192,
        gasPayer: tx.origin || GENESIS_ACCOUNTS[0].address,
        paid: '0x4563918244f40000', // Gas cost
        reward: '0x0',
        reverted: false,
        outputs: [{
            contractAddress: null,
            events: [{
                address: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
                topics: [
                    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x000000000000000000000000' + (tx.clauses?.[0]?.to?.slice(2) || '87c844e3314396ca43e5a6065e418d26a09db02b')
                ],
                data: '0x' + (1e18).toString(16) // 1 B3TR in hex
            }],
            transfers: [{
                sender: '0x0000000000000000000000000000000000000000',
                recipient: tx.clauses?.[0]?.to || '0x87C844e3314396Ca43E5A6065E418D26a09db02B',
                amount: '0x' + (1e18).toString(16) // 1 B3TR
            }]
        }]
    };
    
    // Store transaction
    transactions.push({ ...tx, id: txId, receipt });
    
    console.log(`📤 Transaction executed: ${txId}`);
    console.log(`   To: ${tx.clauses?.[0]?.to || 'contract'}`);
    console.log(`   Gas Used: ${receipt.gasUsed}`);
    
    res.json({ id: txId });
});

app.get('/transactions/:txId/receipt', (req, res) => {
    const { txId } = req.params;
    const tx = transactions.find(t => t.id === txId);
    
    if (tx && tx.receipt) {
        res.json(tx.receipt);
    } else {
        res.status(404).json({ error: 'Transaction not found' });
    }
});

// Node info
app.get('/node/network/peers', (req, res) => {
    res.json([]);
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        network: 'solo',
        blockNumber: blocks.length - 1,
        bestBlock: blocks[blocks.length - 1]?.id,
        accounts: GENESIS_ACCOUNTS.length,
        transactions: transactions.length
    });
});

const PORT = 8669;

// Initialize and start
initializeGenesis();

app.listen(PORT, () => {
    console.log('✅ VeChain Solo Node running on http://localhost:8669');
    console.log('🔗 Network: Solo (isolated testing)');
    console.log(`📊 Current block: #${blocks.length - 1}`);
    console.log('');
    console.log('💰 Pre-funded accounts:');
    GENESIS_ACCOUNTS.forEach((account, i) => {
        console.log(`   Account ${i + 1}: ${account.address}`);
        console.log(`   Private Key: ${account.privateKey}`);
        console.log(`   Balance: ${BigInt(account.balance) / BigInt(1e18)} VET`);
        console.log('');
    });
    console.log('🔧 Update your .env to use solo node:');
    console.log('VECHAIN_NETWORK=solo');
    console.log('VECHAIN_RPC_URL=http://localhost:8669');
    console.log(`ADMIN_PRIVATE_KEY=${GENESIS_ACCOUNTS[0].privateKey}`);
    console.log(`DISTRIBUTOR_PRIVATE_KEY=${GENESIS_ACCOUNTS[1].privateKey}`);
});