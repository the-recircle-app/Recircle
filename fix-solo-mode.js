#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Solo mode detection...');

const soloNodePath = path.join(__dirname, 'server', 'solo-node.ts');

if (!fs.existsSync(soloNodePath)) {
    console.error('❌ server/solo-node.ts not found');
    process.exit(1);
}

let content = fs.readFileSync(soloNodePath, 'utf8');

// Find and replace the Solo mode detection logic
const oldPattern = /const soloEnabled = process\.env\.VITE_SOLO_MODE_ENABLED.*?development.*?;/s;
const newCode = `const soloEnabled = true; // Force enable for local development`;

if (content.includes('const soloEnabled = true')) {
    console.log('✅ Solo mode already enabled');
} else if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newCode);
    fs.writeFileSync(soloNodePath, content);
    console.log('✅ Solo mode detection fixed');
    console.log('🚀 Restart your server with: tsx server/index.ts');
} else {
    console.log('⚠️  Could not find Solo mode detection pattern');
    console.log('Please manually edit server/solo-node.ts and change soloEnabled to true');
}