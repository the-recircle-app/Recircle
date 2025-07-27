import http from 'http';

console.log('🚀 Starting Simple VeChain Solo Node...');

const server = http.createServer((req, res) => {
    // Enhanced CORS headers for VeWorld compatibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const url = req.url;
    
    // Handle CORS preflight for VeWorld
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (url === '/blocks/best') {
        const block = {
            number: Math.floor(Date.now() / 10000),
            id: '0x' + Math.random().toString(16).substr(2, 64),
            parentID: '0x' + Math.random().toString(16).substr(2, 64),
            timestamp: Math.floor(Date.now() / 1000),
            gasLimit: 10000000,
            gasUsed: 0,
            totalScore: 0,
            txsRoot: '0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0',
            stateRoot: '0x4ec3af0acbad1ae467ad569337d2fe8576fe303928d35b8cdd91de47e9ac84bb',
            receiptsRoot: '0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0',
            signer: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            transactions: []
        };
        res.writeHead(200);
        res.end(JSON.stringify(block));
        console.log(`📊 VeWorld requested best block: #${block.number}`);
        
    } else if (url.startsWith('/accounts/')) {
        const account = {
            balance: '0x15af1d78b58c400000', // 25M VET in hex
            energy: '0x4563918244F40000',   // 5M VTHO in hex  
            hasCode: false,
            codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        };
        res.writeHead(200);
        res.end(JSON.stringify(account));
        
    } else if (req.method === 'POST' && url === '/transactions') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const txId = '0x' + Math.random().toString(16).substr(2, 64);
            console.log(`📤 Solo Transaction: ${txId}`);
            
            // Store for receipt lookup
            global.soloTransactions = global.soloTransactions || {};
            global.soloTransactions[txId] = {
                txID: txId,
                txOrigin: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                gasUsed: 23192,
                gasPayer: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                paid: '0x4563918244f40000',
                reward: '0x0',
                reverted: false,
                outputs: [{
                    contractAddress: null,
                    events: [{
                        address: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
                        topics: [
                            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                            '0x000000000000000000000000' + '87c844e3314396ca43e5a6065e418d26a09db02b'
                        ],
                        data: '0x' + (1e18).toString(16)
                    }],
                    transfers: [{
                        sender: '0x0000000000000000000000000000000000000000',
                        recipient: '0x87C844e3314396Ca43E5A6065E418D26a09db02B',
                        amount: '0x' + (1e18).toString(16)
                    }]
                }]
            };
            
            res.writeHead(200);
            res.end(JSON.stringify({ id: txId }));
        });
        
    } else if (url.includes('/transactions/') && url.includes('/receipt')) {
        const txId = url.split('/')[2];
        const receipt = global.soloTransactions?.[txId];
        
        if (receipt) {
            console.log(`📋 Solo Receipt: ${txId} (${receipt.gasUsed} gas)`);
            res.writeHead(200);
            res.end(JSON.stringify(receipt));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Transaction not found' }));
        }
        
    } else if (url === '/status') {
        res.writeHead(200);
        res.end(JSON.stringify({
            network: 'solo',
            message: 'VeChain Solo Node for Testing',
            accounts: [
                '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                '0xd3ae78222beadb038203be21ed5ce7c9b1bff602'
            ]
        }));
        
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

const PORT = 8669;
server.listen(PORT, () => {
    console.log(`✅ VeChain Solo Node running on http://localhost:${PORT}`);
    console.log('🧪 Ready for VeBetterDAO testing with fake B3TR');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('  GET  /blocks/best');
    console.log('  GET  /accounts/:address');
    console.log('  POST /transactions');
    console.log('  GET  /transactions/:id/receipt');
    console.log('  GET  /status');
    console.log('');
    console.log('🔧 Configure ReCircle for solo testing:');
    console.log('VECHAIN_NETWORK=solo');
    console.log('VECHAIN_RPC_URL=http://localhost:8669');
});

server.on('error', (err) => {
    console.error('❌ Solo node error:', err.message);
});