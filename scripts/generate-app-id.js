/**
 * Generate APP_ID for ReCircle based on VeBetterDAO standard
 * Creates a deterministic APP_ID from app name and admin wallet
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ReCircle app metadata
const APP_NAME = 'ReCircle';
const ADMIN_WALLET = process.env.CREATOR_FUND_WALLET || '0x87c844e3314396ca43e5a6065e418d26a09db02b';

function generateAppId(appName, adminWallet) {
  // This matches VeBetterDAO's getAppId function logic
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ['string', 'string'],
    [appName, adminWallet]
  );
  return ethers.keccak256(encoded);
}

function saveAppIdToEnv(appId) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    const appIdLine = `VITE_TESTNET_APP_ID=${appId}`;
    
    if (envContent.includes('VITE_TESTNET_APP_ID=')) {
      envContent = envContent.replace(/VITE_TESTNET_APP_ID=.*/g, appIdLine);
    } else {
      envContent += envContent.endsWith('\n') ? appIdLine + '\n' : '\n' + appIdLine + '\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('APP_ID saved to .env file');
    
  } catch (error) {
    console.error('Failed to save APP_ID to .env file:', error.message);
  }
}

// Generate and save APP_ID
const appId = generateAppId(APP_NAME, ADMIN_WALLET);
console.log('Generated APP_ID for ReCircle:', appId);
console.log('App Name:', APP_NAME);
console.log('Admin Wallet:', ADMIN_WALLET);

saveAppIdToEnv(appId);

export { generateAppId };