#!/usr/bin/env node

import { ethers } from 'ethers';

async function testSoloConnection() {
  console.log('🔍 Testing Solo Node Connection...');
  
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8669');
    
    // Test basic connection
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network);
    
    // Test account balance
    const balance = await provider.getBalance('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
    console.log('💰 Account balance:', ethers.formatEther(balance), 'VET');
    
    // Test sending a transaction
    const wallet = ethers.Wallet.fromPhrase(
      'denial kitchen pet squirrel other broom bar gas better priority spoil cross',
      provider
    );
    
    console.log('📡 Testing transaction...');
    const tx = {
      to: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602',
      value: ethers.parseEther('1'),
      gasLimit: 21000,
      gasPrice: 1000000000
    };
    
    const result = await wallet.sendTransaction(tx);
    console.log('✅ Transaction sent:', result.hash);
    
    const receipt = await result.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testSoloConnection();