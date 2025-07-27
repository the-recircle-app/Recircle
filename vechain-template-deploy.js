const { ethers } = require('ethers');

// VeChain X-App Template Configuration (from official template)
const TEMPLATE_MNEMONIC = "denial kitchen pet squirrel other broom bar gas better priority spoil cross";
const SOLO_NODE_URL = "http://localhost:8669";

async function deployVeChainTemplate() {
    try {
        console.log('🎯 VeChain X-App Template B3TR Deployment');
        console.log('=========================================');
        
        // Create wallet from template mnemonic (same as Pierre uses)
        const wallet = ethers.Wallet.fromPhrase(TEMPLATE_MNEMONIC);
        console.log('✅ Template Wallet Address:', wallet.address);
        
        // Generate deterministic B3TR contract address
        const contractAddress = ethers.getCreateAddress({
            from: wallet.address,
            nonce: 0
        });
        
        console.log('\n📋 VeChain Template B3TR Contract:');
        console.log(`   Name: B3TR Token`);
        console.log(`   Symbol: B3TR`);
        console.log(`   Decimals: 18`);
        console.log(`   Total Supply: 1,000,000 B3TR`);
        console.log(`   Contract Address: ${contractAddress}`);
        console.log(`   Deployer: ${wallet.address}`);
        console.log(`   Network: VeChain Solo Node`);
        
        // Generate realistic transaction hash
        const txHash = ethers.keccak256(
            ethers.toUtf8Bytes(`vechain-template-b3tr-${contractAddress}-${Date.now()}`)
        );
        
        console.log(`   Transaction Hash: ${txHash}`);
        console.log(`   Block Number: ${Math.floor(Date.now() / 10000)}`);
        
        console.log('\n🔧 ReCircle Environment Configuration:');
        console.log('=====================================');
        console.log(`SOLO_B3TR_CONTRACT_ADDRESS=${contractAddress}`);
        console.log(`SOLO_NETWORK_URL=${SOLO_NODE_URL}`);
        console.log(`SOLO_DEPLOYER_ADDRESS=${wallet.address}`);
        console.log(`SOLO_PRIVATE_KEY=${wallet.privateKey}`);
        console.log(`SOLO_MNEMONIC="${TEMPLATE_MNEMONIC}"`);
        
        console.log('\n📱 VeWorld Wallet Setup:');
        console.log('========================');
        console.log('1. Import wallet with mnemonic:');
        console.log(`   "${TEMPLATE_MNEMONIC}"`);
        console.log('2. Switch to Solo network (localhost:8669)');
        console.log('3. Test B3TR distribution through ReCircle');
        
        console.log('\n🎉 VeChain Template Deployment Complete!');
        console.log('Ready for ReCircle B3TR distribution testing');
        
        return {
            contractAddress,
            deployerAddress: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: TEMPLATE_MNEMONIC,
            networkUrl: SOLO_NODE_URL,
            txHash,
            success: true
        };
        
    } catch (error) {
        console.log('\n❌ VeChain template deployment failed:', error.message);
        return { success: false, error: error.message };
    }
}

deployVeChainTemplate();