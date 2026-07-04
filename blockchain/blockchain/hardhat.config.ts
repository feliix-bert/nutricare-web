import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Menggunakan RPC publik Sepolia bawaan jika tidak ada di .env
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ?? "https://eth-sepolia.g.alchemy.com/v2/wJjCarFIiNTC8UAYycac6";

// Private key kamu sudah langsung dimasukkan di sini
const DEPLOYER_PRIVATE_KEY = 
  process.env.DEPLOYER_PRIVATE_KEY ?? "88fe67e1955429613d2f477838d4dfc899dbac98cfaea89a0d8dc73312dd3cc0";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111, // Chain ID khusus untuk Ethereum Sepolia
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;