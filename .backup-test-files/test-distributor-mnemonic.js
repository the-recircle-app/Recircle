import thor from 'thor-devkit';
import { ethers } from 'ethers';

console.log('=== TESTING DISTRIBUTOR MNEMONIC ===');

// Test the distributor mnemonic from .env
const distributorMnemonic = 'thank bomb dinosaur leopard civil afford giraffe happy artwork pledge van judge';
console.log('Testing distributor mnemonic:', distributorMnemonic);

try {
    const words = distributorMnemonic.trim().split(/\s+/);
    console.log(`Mnemonic words: ${words.length}`);
    
    // Use thor-devkit derivation (same as VeBetterDAO code)
    const privateKeyBuffer = thor.mnemonic.derivePrivateKey(words);
    const privateKey = new Uint8Array(privateKeyBuffer);
    const privateKeyHex = '0x' + Buffer.from(privateKey).toString('hex');
    
    // Calculate address using ethers
    const wallet = new ethers.Wallet(privateKeyHex);
    const address = wallet.address;
    
    console.log(`Derived address: ${address}`);
    console.log(`Expected distributor: 0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee`);
    console.log(`Match: ${address.toLowerCase() === '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee'}`);
    
    if (address.toLowerCase() === '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee') {
        console.log('\n✅ DISTRIBUTOR MNEMONIC DERIVES CORRECTLY');
        console.log(`Private key: ${privateKeyHex}`);
    } else {
        console.log('\n❌ DISTRIBUTOR MNEMONIC MISMATCH');
        console.log('The distributor mnemonic does not derive to the expected wallet');
    }
    
} catch (error) {
    console.log('❌ Derivation failed:', error.message);
}