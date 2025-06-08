import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    vechain_testnet: {
      url: "https://testnet.vechain.org",
      accounts: process.env.TESTNET_MNEMONIC ? {
        mnemonic: process.env.TESTNET_MNEMONIC,
        path: "m/44'/818'/0'/0",
        initialIndex: 0,
        count: 10,
      } : [],
      gas: 10000000,
    },
    vechain_mainnet: {
      url: "https://mainnet.vechain.org",
      accounts: process.env.MAINNET_MNEMONIC ? {
        mnemonic: process.env.MAINNET_MNEMONIC,
        path: "m/44'/818'/0'/0",
        initialIndex: 0,
        count: 10,
      } : [],
      gas: 10000000,
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

export default config;