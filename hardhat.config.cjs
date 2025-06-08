require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    vechain_testnet: {
      url: "https://sync-testnet.vechain.org",
      accounts: process.env.TESTNET_MNEMONIC ? {
        mnemonic: process.env.TESTNET_MNEMONIC,
        path: "m/44'/818'/0'/0",
        initialIndex: 0,
        count: 10,
      } : [],
      gas: 10000000,
      chainId: 100010,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 60000,
  },
};