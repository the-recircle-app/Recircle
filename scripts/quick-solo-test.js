// Quick test to simulate VeBetterDAO responses for solo testing
const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    console.log(`${req.method} ${req.url}`);
    
    if (req.url === '/blocks/best') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            number: Math.floor(Date.now() / 10000),
            id: '0x' + Math.random().toString(16).substr(2, 64),
            timestamp: Math.floor(Date.now() / 1000)
        }));
    } else if (req.url.startsWith('/accounts/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            balance: '0x15af1d78b58c400000', // 25M VET
            energy: '0x4563918244F40000',   // 5M VTHO
            hasCode: false
        }));
    } else if (req.method === 'POST' && req.url === '/transactions') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const txId = '0x' + Math.random().toString(16).substr(2, 64);
            console.log('📤 Simulated transaction:', txId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: txId }));
        });
    } else if (req.url.includes('/transactions/') && req.url.includes('/receipt')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            txID: req.url.split('/')[2],
            gasUsed: 23192,
            reverted: false,
            outputs: [{
                events: [{
                    address: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
                    topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
                    data: '0x' + (1e18).toString(16)
                }],
                transfers: [{
                    sender: '0x0000000000000000000000000000000000000000',
                    recipient: '0x87C844e3314396Ca43E5A6065E418D26a09db02B',
                    amount: '0x' + (1e18).toString(16)
                }]
            }]
        }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8669, () => {
    console.log('✅ Quick Solo VeChain API running on http://localhost:8669');
    console.log('🧪 Simulates VeChain responses for testing');
    console.log('');
    console.log('🔧 Update your .env for solo testing:');
    console.log('VECHAIN_NETWORK=solo');
    console.log('VECHAIN_RPC_URL=http://localhost:8669');
    console.log('ADMIN_PRIVATE_KEY=0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36');
    console.log('DISTRIBUTOR_PRIVATE_KEY=0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('⚠️  Port 8669 already in use');
    } else {
        console.error('❌ Server error:', err.message);
    }
});