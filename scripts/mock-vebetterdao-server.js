#!/usr/bin/env node

/**
 * Mock VeBetterDAO Server for Local Testing
 * Simulates VeBetterDAO smart contracts with fake B3TR tokens
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Mock contract state
let appBalances = new Map();
let userBalances = new Map();
let appAdmins = new Map();
let distributors = new Map();

// Initialize test data
const TEST_APP_ID = '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1';
const ADMIN_WALLET = '0x15d009b3a5811fde66f19b2db1d40172d53e5653';
const DISTRIBUTOR_WALLET = '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee';

// Setup initial state
appBalances.set(TEST_APP_ID, 100000 * 1e18); // 100K fake B3TR
appAdmins.set(TEST_APP_ID, ADMIN_WALLET);
distributors.set(TEST_APP_ID, new Set([DISTRIBUTOR_WALLET]));

console.log('🚀 Starting Mock VeBetterDAO Server...');
console.log(`📱 App ID: ${TEST_APP_ID}`);
console.log(`👤 Admin: ${ADMIN_WALLET}`);
console.log(`🚚 Distributor: ${DISTRIBUTOR_WALLET}`);
console.log(`💰 Initial App Balance: 100,000 fake B3TR`);

// Mock X2EarnRewardsPool.distributeReward
app.post('/mock-contract/distributeReward', (req, res) => {
    const { appId, amount, recipient, proof } = req.body;
    
    console.log(`📤 Distribution Request:`);
    console.log(`  App ID: ${appId}`);
    console.log(`  Amount: ${amount / 1e18} B3TR`);
    console.log(`  Recipient: ${recipient}`);
    console.log(`  Proof: ${proof}`);
    
    // Check authorization
    const appDistributors = distributors.get(appId);
    if (!appDistributors || !appDistributors.has(req.headers['x-distributor'])) {
        return res.status(403).json({
            success: false,
            error: 'Distributor not authorized',
            txHash: null
        });
    }
    
    // Check app balance
    const appBalance = appBalances.get(appId) || 0;
    if (appBalance < amount) {
        return res.status(400).json({
            success: false,
            error: 'Insufficient app balance',
            appBalance: appBalance / 1e18,
            requested: amount / 1e18
        });
    }
    
    // Simulate successful distribution
    appBalances.set(appId, appBalance - amount);
    const currentUserBalance = userBalances.get(recipient) || 0;
    userBalances.set(recipient, currentUserBalance + amount);
    
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log(`✅ Distribution successful!`);
    console.log(`  Transaction: ${mockTxHash}`);
    console.log(`  New app balance: ${(appBalance - amount) / 1e18} B3TR`);
    console.log(`  User balance: ${(currentUserBalance + amount) / 1e18} B3TR`);
    
    res.json({
        success: true,
        txHash: mockTxHash,
        appBalance: (appBalance - amount) / 1e18,
        userBalance: (currentUserBalance + amount) / 1e18,
        gasUsed: 23192,
        events: [{
            address: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            data: amount.toString(16)
        }],
        transfers: [{
            sender: '0x0000000000000000000000000000000000000000',
            recipient: recipient,
            amount: amount.toString()
        }]
    });
});

// Mock balance queries
app.get('/mock-contract/appBalance/:appId', (req, res) => {
    const balance = appBalances.get(req.params.appId) || 0;
    res.json({ balance: balance / 1e18 });
});

app.get('/mock-contract/userBalance/:address', (req, res) => {
    const balance = userBalances.get(req.params.address) || 0;
    res.json({ balance: balance / 1e18 });
});

// Mock authorization check
app.get('/mock-contract/isAuthorized/:appId/:distributor', (req, res) => {
    const appDistributors = distributors.get(req.params.appId);
    const authorized = appDistributors && appDistributors.has(req.params.distributor);
    res.json({ authorized });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        service: 'Mock VeBetterDAO Server',
        apps: Array.from(appBalances.keys()).map(appId => ({
            appId,
            balance: appBalances.get(appId) / 1e18,
            admin: appAdmins.get(appId),
            distributors: Array.from(distributors.get(appId) || [])
        })),
        totalUsers: userBalances.size,
        totalDistributed: Array.from(userBalances.values()).reduce((sum, balance) => sum + balance, 0) / 1e18
    });
});

const PORT = 8669;
app.listen(PORT, () => {
    console.log(`✅ Mock VeBetterDAO Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('🔧 Update your .env to use mock server:');
    console.log('TEST_MODE=true');
    console.log('MOCK_VEBETTERDAO_URL=http://localhost:8669');
    console.log('');
    console.log('📊 Available endpoints:');
    console.log('  POST /mock-contract/distributeReward');
    console.log('  GET  /mock-contract/appBalance/:appId');
    console.log('  GET  /mock-contract/userBalance/:address');
    console.log('  GET  /status');
});