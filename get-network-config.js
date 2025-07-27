#!/usr/bin/env node

// Get your computer's IP address for VeWorld setup
import { networkInterfaces } from 'os';

console.log('🌐 VeWorld Network Configuration Helper');
console.log('==========================================\n');

// Get local IP addresses
const interfaces = networkInterfaces();
const addresses = [];

for (const [name, nets] of Object.entries(interfaces)) {
    for (const net of nets || []) {
        // Skip loopback and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
            addresses.push({ interface: name, address: net.address });
        }
    }
}

console.log('📱 VeWorld Setup Instructions:');
console.log('1. Open VeWorld app');
console.log('2. Go to Networks → Add Custom Network');
console.log('3. Use one of these RPC URLs:\n');

// Primary option (localhost)
console.log('🏠 Option 1 - Localhost (if on same device):');
console.log('   Network Name: ReCircle Solo');
console.log('   RPC URL: http://localhost:5000/solo');
console.log('   Chain ID: 39');
console.log('   Symbol: VET\n');

// IP address options
if (addresses.length > 0) {
    console.log('📡 Option 2 - Network IP (recommended for mobile):');
    addresses.forEach((addr, index) => {
        console.log(`   ${index + 1}. RPC URL: http://${addr.address}:5000/solo`);
        console.log(`      Interface: ${addr.interface}`);
    });
    console.log('\n   Use the same Chain ID (39) and Symbol (VET)');
} else {
    console.log('❌ No network interfaces found');
}

console.log('\n🪙 B3TR Token Configuration:');
console.log('   Token Address: 0x5ef79995FE8a89e0812330E4378eB2660ceDe699');
console.log('   Symbol: B3TR');
console.log('   Decimals: 18');

console.log('\n✅ Your Wallet: 0x865306084235Bf804c8Bba8a8d56890940ca8F0b');
console.log('💰 Balance: 25 B3TR tokens waiting!');
console.log('🔗 Transaction: 0x1f13d50b7e9d5');

console.log('\n🔧 Troubleshooting:');
console.log('• Make sure your phone and computer are on the same WiFi');
console.log('• Try different IP addresses if one doesn\'t work');
console.log('• Check that ReCircle server is running at http://localhost:5000');

// Test current setup
console.log('\n🧪 Testing current setup...');
try {
    const response = await fetch('http://localhost:5000/solo/block/best');
    if (response.ok) {
        console.log('✅ Solo node is running correctly');
    } else {
        console.log('❌ Solo node not responding');
    }
} catch (error) {
    console.log('❌ Connection failed:', error.message);
}