/**
 * VeBetterDAO Testnet APP_ID Registration Script
 * Registers ReCircle app with VeBetterDAO's X2EarnApps contract on testnet
 * This is required for proper wallet connection and reward distribution
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// VeBetterDAO X2EarnApps Contract ABI (minimal required functions)
const X2EARN_APPS_ABI = [
  "function submitApp(string memory appName, string memory adminWallet, string memory description, string memory appUrl, string memory appImage, string memory appCategory, bool appIsConnectedToGovernance) external",
  "function getApp(bytes32 appId) external view returns (tuple(bytes32 id, string name, string adminWallet, string description, string appUrl, string appImage, string appCategory, bool appIsConnectedToGovernance, bool appIsActive))",
  "function getAppId(string memory appName, string memory adminWallet) external pure returns (bytes32)",
  "event AppSubmitted(bytes32 indexed appId, string name, string adminWallet)"
];

// VeBetterDAO contract addresses on testnet
const CONTRACTS = {
  X2_EARN_APPS: '0x8f9c9d5460b8b6d35eb76ff4b2e99e9647d12ae1', // Corrected checksum
  RPC_URL: 'https://testnet.veblocks.net',
  CHAIN_ID: 39 // VeChain testnet
};

// ReCircle app metadata
const APP_METADATA = {
  name: 'ReCircle',
  description: 'Sustainable Transportation Rewards Platform - Earn B3TR tokens for eco-friendly transportation choices including rideshare, electric vehicle rentals, and public transit.',
  appUrl: 'https://recircle-rewards.replit.app',
  appImage: 'https://recircle-rewards.replit.app/favicon.ico',
  category: 'Sustainability',
  isConnectedToGovernance: true
};

async function registerReCircleApp() {
  console.log('🚀 Starting VeBetterDAO Testnet Registration...');
  
  // Check required environment variables
  if (!process.env.TESTNET_MNEMONIC) {
    console.error('❌ TESTNET_MNEMONIC environment variable required');
    process.exit(1);
  }

  if (!process.env.CREATOR_FUND_WALLET) {
    console.error('❌ CREATOR_FUND_WALLET environment variable required');
    process.exit(1);
  }

  try {
    // Connect to VeChain testnet
    console.log('🔗 Connecting to VeChain testnet...');
    const provider = new ethers.JsonRpcProvider(CONTRACTS.RPC_URL);
    
    // Create wallet from mnemonic
    const wallet = ethers.Wallet.fromPhrase(process.env.TESTNET_MNEMONIC).connect(provider);
    console.log('👛 Wallet connected:', wallet.address);
    
    // Connect to X2EarnApps contract
    const x2EarnApps = new ethers.Contract(CONTRACTS.X2_EARN_APPS, X2EARN_APPS_ABI, wallet);
    
    // Calculate APP_ID before registration
    const calculatedAppId = await x2EarnApps.getAppId(APP_METADATA.name, process.env.CREATOR_FUND_WALLET);
    console.log('📋 Calculated APP_ID:', calculatedAppId);
    
    // Check if app is already registered
    try {
      const existingApp = await x2EarnApps.getApp(calculatedAppId);
      if (existingApp.id !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log('✅ App already registered!');
        console.log('📱 App Details:', {
          id: existingApp.id,
          name: existingApp.name,
          adminWallet: existingApp.adminWallet,
          isActive: existingApp.appIsActive
        });
        
        // Save APP_ID to environment file
        await saveAppIdToEnv(calculatedAppId);
        return calculatedAppId;
      }
    } catch (error) {
      console.log('📝 App not yet registered, proceeding with registration...');
    }
    
    // Submit app registration
    console.log('📤 Submitting app registration...');
    const tx = await x2EarnApps.submitApp(
      APP_METADATA.name,
      process.env.CREATOR_FUND_WALLET,
      APP_METADATA.description,
      APP_METADATA.appUrl,
      APP_METADATA.appImage,
      APP_METADATA.category,
      APP_METADATA.isConnectedToGovernance
    );
    
    console.log('⏳ Transaction submitted:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Verify registration
    const registeredApp = await x2EarnApps.getApp(calculatedAppId);
    console.log('🎉 Registration successful!');
    console.log('📱 Registered App Details:', {
      id: registeredApp.id,
      name: registeredApp.name,
      adminWallet: registeredApp.adminWallet,
      description: registeredApp.description,
      appUrl: registeredApp.appUrl,
      isActive: registeredApp.appIsActive
    });
    
    // Save APP_ID to environment file
    await saveAppIdToEnv(calculatedAppId);
    
    return calculatedAppId;
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    if (error.code === 'NETWORK_ERROR') {
      console.log('🔧 Network issue detected. Try again or check VeChain testnet status.');
    } else if (error.message.includes('revert')) {
      console.log('🔧 Transaction reverted. Check if app name is already taken or wallet has insufficient funds.');
    }
    
    throw error;
  }
}

async function saveAppIdToEnv(appId) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add VITE_TESTNET_APP_ID
    const appIdLine = `VITE_TESTNET_APP_ID=${appId}`;
    
    if (envContent.includes('VITE_TESTNET_APP_ID=')) {
      // Replace existing line
      envContent = envContent.replace(/VITE_TESTNET_APP_ID=.*/g, appIdLine);
    } else {
      // Add new line
      envContent += envContent.endsWith('\n') ? appIdLine + '\n' : '\n' + appIdLine + '\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('💾 APP_ID saved to .env file');
    
  } catch (error) {
    console.error('⚠️ Failed to save APP_ID to .env file:', error.message);
  }
}

// Run the registration
if (import.meta.url === `file://${process.argv[1]}`) {
  registerReCircleApp()
    .then((appId) => {
      console.log('\n🎉 VeBetterDAO Registration Complete!');
      console.log('📋 Your APP_ID:', appId);
      console.log('\n✅ Next Steps:');
      console.log('1. Deploy your app to HTTPS domain');
      console.log('2. Test wallet connection in VeWorld browser');
      console.log('3. Submit for Creator NFT approval');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Registration failed:', error.message);
      process.exit(1);
    });
}

export { registerReCircleApp };