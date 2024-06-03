import { HardhatUserConfig } from 'hardhat/config';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
  },
  networks: {
    // for mainnet
    'base-mainnet': {
      url: process.env.BASEMAIN_API_URL,
      accounts: [`0x${process.env.BASEMAIN_PRIVATE_KEY}`],
      // gasPrice: 1000000000,
    },
    // for testnet
    'base-sepolia': {
      // url: 'https://base-sepolia.g.alchemy.com/v2/' + process.env.SEPOLIA_PROJECT_ID,
      // accounts: [process.env.PRIVATE_KEY_SEPOLIA as string],
      url: process.env.SEPOLIA_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      // gasPrice: 1000000000,
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
          apiKey: process.env.ETHERSCAN_API_KEY
        }
      }
    },
    // for local dev environment
    'base-local': {
      url: 'http://localhost:8545',
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASE_ETHERSCAN_API_KEY || ""
    }
  },
  
  defaultNetwork: 'hardhat',
};

export default config;
