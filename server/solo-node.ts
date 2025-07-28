/**
 * Integrated VeChain Solo Node
 * Runs as part of the main Express server for Replit compatibility
 */

import { Express } from 'express';

// Solo node state
let blockNumber = 0;
let blocks: any[] = [];
let transactions: any[] = [];
let accounts = new Map();
let contracts = new Map();

// B3TR Token contract on solo node
const B3TR_CONTRACT_ADDRESS = '0x5ef79995fe8a89e0812330e4378eb2660cede699';
let b3trBalances = new Map();
let b3trTotalSupply = '1000000000000000000000000'; // 1M B3TR

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
    console.log('[SOLO-NODE] 🔧 Initializing Solo Node Genesis State...');
    
    // Setup genesis accounts
    GENESIS_ACCOUNTS.forEach(account => {
        accounts.set(account.address.toLowerCase(), {
            balance: account.balance,
            energy: '5000000000000000000000000', // 5M VTHO
            hasCode: false,
            codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        });
        
        // Give each account 100,000 B3TR tokens for testing
        b3trBalances.set(account.address.toLowerCase(), '100000000000000000000000'); // 100K B3TR
    });
    
    // Deploy B3TR contract to solo node
    contracts.set(B3TR_CONTRACT_ADDRESS.toLowerCase(), {
        name: 'B3TR Token',
        symbol: 'B3TR',
        decimals: 18,
        totalSupply: b3trTotalSupply,
        balances: b3trBalances
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
    
    console.log('[SOLO-NODE] ✅ Genesis block created');
    console.log(`[SOLO-NODE]    Block #${genesisBlock.number}: ${genesisBlock.id}`);
    console.log('[SOLO-NODE] 💰 Pre-funded accounts available:');
    GENESIS_ACCOUNTS.forEach((account, index) => {
        console.log(`[SOLO-NODE]    Account ${index + 1}: ${account.address}`);
    });
    console.log(`[SOLO-NODE] 🪙 B3TR Token deployed at: ${B3TR_CONTRACT_ADDRESS}`);
    console.log(`[SOLO-NODE]    Each account has 100,000 B3TR tokens for testing`);
}

export function setupSoloNodeRoutes(app: Express) {
    // Force enable Solo mode for local development
    const soloEnabled = true;
    
    console.log('[SOLO-NODE] 🔍 Checking solo mode setup:', {
        VITE_SOLO_MODE_ENABLED: `'${process.env.VITE_SOLO_MODE_ENABLED}'`,
        SOLO_MODE_ENABLED: `'${process.env.SOLO_MODE_ENABLED}'`,
        NODE_ENV: `'${process.env.NODE_ENV}'`,
        soloEnabled
    });
    
    if (!soloEnabled) {
        console.log('[SOLO-NODE] Solo mode disabled, skipping solo node routes');
        return;
    }

    console.log('[SOLO-NODE] 🚀 Setting up integrated VeChain Solo Node routes');
    initializeGenesis();

    // Add CORS middleware for all /solo endpoints
    app.use('/solo/*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400');
        
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        next();
    });

    // VeChain API endpoints
    app.get('/solo/blocks/best', (req, res) => {
        const bestBlock = blocks[blocks.length - 1];
        res.json(bestBlock);
    });

    app.get('/solo/blocks/:id', (req, res) => {
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

    app.get('/solo/accounts/:address', (req, res) => {
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

    // B3TR token contract endpoints
    app.get('/solo/contracts/:address', (req, res) => {
        const address = req.params.address.toLowerCase();
        const contract = contracts.get(address);
        
        if (contract) {
            res.json(contract);
        } else {
            res.status(404).json({ error: 'Contract not found' });
        }
    });
    
    // B3TR balance endpoint
    app.get('/solo/contracts/:contractAddress/balances/:address', (req, res) => {
        const { contractAddress, address } = req.params;
        
        if (contractAddress.toLowerCase() === B3TR_CONTRACT_ADDRESS.toLowerCase()) {
            const balance = b3trBalances.get(address.toLowerCase()) || '0';
            res.json({ balance });
        } else {
            res.status(404).json({ error: 'Contract not found' });
        }
    });
    
    // B3TR transfer endpoint
    app.post('/solo/contracts/:contractAddress/transfer', (req, res) => {
        const { contractAddress } = req.params;
        const { from, to, amount } = req.body;
        
        if (contractAddress.toLowerCase() !== B3TR_CONTRACT_ADDRESS.toLowerCase()) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        const fromAddress = from.toLowerCase();
        const toAddress = to.toLowerCase();
        const transferAmount = BigInt(amount);
        
        // Check balance
        const fromBalance = BigInt(b3trBalances.get(fromAddress) || '0');
        if (fromBalance < transferAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        // Execute transfer
        b3trBalances.set(fromAddress, (fromBalance - transferAmount).toString());
        const toBalance = BigInt(b3trBalances.get(toAddress) || '0');
        b3trBalances.set(toAddress, (toBalance + transferAmount).toString());
        
        // Generate transaction
        const txId = '0x' + Math.random().toString(16).substr(2, 64);
        
        const receipt = {
            txID: txId,
            txOrigin: from,
            gasUsed: 23192,
            gasPayer: from,
            paid: '0x4563918244f40000',
            reward: '0x0',
            reverted: false,
            outputs: [{
                contractAddress: contractAddress,
                events: [{
                    address: contractAddress,
                    topics: [
                        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
                        '0x000000000000000000000000' + fromAddress.slice(2),
                        '0x000000000000000000000000' + toAddress.slice(2)
                    ],
                    data: '0x' + transferAmount.toString(16).padStart(64, '0')
                }]
            }]
        };
        
        transactions.push({ from, to, amount, contractAddress, id: txId, receipt });
        
        res.json({
            success: true,
            txId,
            fromBalance: b3trBalances.get(fromAddress),
            toBalance: b3trBalances.get(toAddress)
        });
    });

    app.post('/solo/transactions', (req, res) => {
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
                        '0x000000000000000000000000' + (tx.origin || GENESIS_ACCOUNTS[0].address).slice(2),
                        '0x000000000000000000000000' + (tx.to || GENESIS_ACCOUNTS[1].address).slice(2)
                    ],
                    data: '0x' + (tx.amount || '1000000000000000000').toString(16).padStart(64, '0')
                }]
            }]
        };
        
        transactions.push({ ...tx, id: txId, receipt });
        
        res.json({
            id: txId,
            meta: { blockID: blocks[blocks.length - 1].id, blockNumber: blocks.length - 1 }
        });
    });

    // Solo node status endpoint
    app.get('/solo/status', (req, res) => {
        res.json({
            network: 'solo',
            chainId: '0x27', // VeChain test network ID
            blockNumber: blocks.length - 1,
            accounts: GENESIS_ACCOUNTS.length,
            genesis: blocks[0]?.id,
            ready: true
        });
    });

    console.log('[SOLO-NODE] ✅ Solo Node integrated into Express server');
    console.log('[SOLO-NODE] 🌐 Available at /solo/* endpoints');
}