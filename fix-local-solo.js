#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Solo Node for local machine...');

// Read the current solo-node.ts file
const soloNodePath = path.join(__dirname, 'server', 'solo-node.ts');

if (!fs.existsSync(soloNodePath)) {
    console.error('❌ server/solo-node.ts not found');
    console.log('Make sure you are running this from the ReCircle root directory');
    process.exit(1);
}

let content = fs.readFileSync(soloNodePath, 'utf8');

// Define the old pattern to replace
const oldPattern = `export function setupSoloNodeRoutes(app: Express) {
    // Force enable Solo mode for local development
    const soloEnabled = true;
    
    console.log('[SOLO-NODE] 🔍 Checking solo mode setup:', {
        VITE_SOLO_MODE_ENABLED: \`'\${process.env.VITE_SOLO_MODE_ENABLED}'\`,
        SOLO_MODE_ENABLED: \`'\${process.env.SOLO_MODE_ENABLED}'\`,
        NODE_ENV: \`'\${process.env.NODE_ENV}'\`,
        soloEnabled
    });
    
    if (!soloEnabled) {
        console.log('[SOLO-NODE] Solo mode disabled, skipping solo node routes');
        return;
    }`;

// Define the new pattern
const newPattern = `export function setupSoloNodeRoutes(app: Express) {
    // Check environment variables with trimming to handle extra spaces
    const viteEnabled = process.env.VITE_SOLO_MODE_ENABLED?.trim() === 'true';
    const soloEnabled = process.env.SOLO_MODE_ENABLED?.trim() === 'true';
    const isDev = process.env.NODE_ENV?.trim() === 'development';
    
    // Enable solo mode if any condition is met or force enable for development
    const finalSoloEnabled = viteEnabled || soloEnabled || isDev;
    
    console.log('[SOLO-NODE] 🔍 Checking solo mode setup:', {
        VITE_SOLO_MODE_ENABLED: \`'\${process.env.VITE_SOLO_MODE_ENABLED}'\`,
        SOLO_MODE_ENABLED: \`'\${process.env.SOLO_MODE_ENABLED}'\`,
        NODE_ENV: \`'\${process.env.NODE_ENV}'\`,
        viteEnabled,
        soloEnabled,
        isDev,
        finalSoloEnabled
    });
    
    if (!finalSoloEnabled) {
        console.log('[SOLO-NODE] Solo mode disabled, skipping solo node routes');
        return;
    }`;

// Check if already fixed
if (content.includes('finalSoloEnabled')) {
    console.log('✅ Solo mode already fixed!');
    process.exit(0);
}

// Replace the pattern
if (content.includes('const soloEnabled = true;')) {
    content = content.replace(oldPattern, newPattern);
    
    // Write the updated content back
    fs.writeFileSync(soloNodePath, content);
    
    console.log('✅ Solo mode detection fixed!');
    console.log('🚀 Now restart your server with: tsx server/index.ts');
    console.log('');
    console.log('You should now see:');
    console.log('  - finalSoloEnabled: true');
    console.log('  - Solo node initialization messages');
    console.log('  - B3TR contract deployment');
    console.log('  - Pre-funded accounts with 100K B3TR each');
} else {
    console.log('⚠️  Could not find the expected pattern to replace');
    console.log('The file may have been modified already or have different content');
    
    // Show current content around the function
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line => line.includes('setupSoloNodeRoutes'));
    if (startIndex !== -1) {
        console.log('\nCurrent content around setupSoloNodeRoutes:');
        for (let i = Math.max(0, startIndex - 2); i < Math.min(lines.length, startIndex + 15); i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
}