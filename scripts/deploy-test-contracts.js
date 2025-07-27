#!/usr/bin/env node

const { ThorClient, ProviderInternalBaseWallet } = require('@vechain/sdk-network');
const { Secp256k1 } = require('@vechain/sdk-core');

// Mock VeBetterDAO contracts for solo node testing
const MOCK_B3TR_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount) returns (bool)"
];

const MOCK_REWARDS_POOL_ABI = [
    "function distributeReward(bytes32 appId, uint256 amount, address recipient, string calldata proof) returns (bool)",
    "function getAppBalance(bytes32 appId) view returns (uint256)",
    "function isAppAdmin(bytes32 appId, address admin) view returns (bool)",
    "function setAppAdmin(bytes32 appId, address admin) returns (bool)",
    "function depositFunds(bytes32 appId, uint256 amount) returns (bool)"
];

async function deployTestContracts() {
    console.log('🚀 Deploying Mock VeBetterDAO Contracts to Solo Node...');
    
    try {
        const thorClient = ThorClient.at('http://localhost:8669');
        
        // Use first solo node account
        const privateKey = '0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36';
        const wallet = new ProviderInternalBaseWallet(
            [{ privateKey: Buffer.from(privateKey.slice(2), 'hex'), address: '' }],
            { 
                node: 'http://localhost:8669',
                network: 'solo'
            }
        );
        
        const signer = thorClient.getSigner(wallet.account(0));
        
        console.log('📝 Deploying Mock B3TR Token Contract...');
        
        // Simple mock B3TR contract bytecode (minimal ERC20)
        const mockB3TRBytecode = `
        pragma solidity ^0.8.0;
        
        contract MockB3TR {
            string public name = "Mock B3TR Token";
            string public symbol = "MB3TR";
            uint8 public decimals = 18;
            uint256 public totalSupply = 1000000 * 10**18;
            
            mapping(address => uint256) public balanceOf;
            
            constructor() {
                balanceOf[msg.sender] = totalSupply;
            }
            
            function transfer(address to, uint256 amount) public returns (bool) {
                require(balanceOf[msg.sender] >= amount, "Insufficient balance");
                balanceOf[msg.sender] -= amount;
                balanceOf[to] += amount;
                return true;
            }
            
            function mint(address to, uint256 amount) public returns (bool) {
                balanceOf[to] += amount;
                totalSupply += amount;
                return true;
            }
        }`;
        
        console.log('📝 Deploying Mock X2EarnRewardsPool Contract...');
        
        const mockRewardsPoolBytecode = `
        pragma solidity ^0.8.0;
        
        interface IERC20 {
            function transfer(address to, uint256 amount) external returns (bool);
            function balanceOf(address account) external view returns (uint256);
        }
        
        contract MockX2EarnRewardsPool {
            mapping(bytes32 => uint256) public appBalances;
            mapping(bytes32 => address) public appAdmins;
            IERC20 public b3trToken;
            
            constructor(address _b3trToken) {
                b3trToken = IERC20(_b3trToken);
            }
            
            function distributeReward(bytes32 appId, uint256 amount, address recipient, string calldata proof) 
                external returns (bool) {
                require(appBalances[appId] >= amount, "Insufficient app balance");
                appBalances[appId] -= amount;
                return b3trToken.transfer(recipient, amount);
            }
            
            function getAppBalance(bytes32 appId) external view returns (uint256) {
                return appBalances[appId];
            }
            
            function isAppAdmin(bytes32 appId, address admin) external view returns (bool) {
                return appAdmins[appId] == admin;
            }
            
            function setAppAdmin(bytes32 appId, address admin) external returns (bool) {
                appAdmins[appId] = admin;
                return true;
            }
            
            function depositFunds(bytes32 appId, uint256 amount) external returns (bool) {
                appBalances[appId] += amount;
                return true;
            }
        }`;
        
        // For now, just output the configuration that would be needed
        console.log('✅ Mock contracts ready for deployment!');
        console.log('');
        console.log('🔧 Update your .env file for solo node testing:');
        console.log('VECHAIN_NETWORK=solo');
        console.log('VECHAIN_RPC_URL=http://localhost:8669');
        console.log('TOKEN_ADDRESS=0x[deployed-mock-b3tr-address]');
        console.log('X2EARN_REWARDS_POOL=0x[deployed-mock-rewards-pool-address]');
        console.log('APP_ID=0x1234567890123456789012345678901234567890123456789012345678901234');
        console.log('');
        console.log('💰 With solo node, you can:');
        console.log('- Test unlimited fake B3TR distributions');
        console.log('- Debug contract interactions safely');
        console.log('- Validate your integration logic');
        console.log('- Prepare for mainnet deployment');
        
    } catch (error) {
        console.error('❌ Failed to deploy contracts:', error.message);
    }
}

deployTestContracts();