/**
 * Solo Node Configuration for Local Testing
 * Configures the app to work with a local VeChain Solo Node environment
 */

// Solo Node Configuration
const SOLO_NODE_CONFIG = {
  // Solo Node runs on localhost:8669 by default
  rpcUrl: 'http://localhost:8669',
  network: 'solo',
  chainId: 39, // Solo node default chain ID
  
  // Pre-funded accounts from Solo Node genesis
  accounts: [
    {
      address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
      balance: '25000000000000000000000000', // 25M VET
      privateKey: 'known_solo_private_key_1'
    },
    {
      address: '0x137053dfbe6c0a43f915ad2efefefdcc2708e975',
      balance: '21046908616500000000000000000', // ~21B VET
      privateKey: 'known_solo_private_key_2'
    }
  ],
  
  // Solo Node API endpoints
  endpoints: {
    blocks: 'http://localhost:8669/blocks',
    transactions: 'http://localhost:8669/transactions',
    accounts: 'http://localhost:8669/accounts'
  }
};

module.exports = SOLO_NODE_CONFIG;