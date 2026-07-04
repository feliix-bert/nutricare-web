// src/features/blockchain/config.ts

/**
 * Konfigurasi Smart Contract GiziChainFund
 * Network: Sepolia Testnet (sama seperti fitur transfer)
 */

export const SEPOLIA_CHAIN_ID = 11155111
export const SEPOLIA_RPC_URL =
  process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
export const ETHERSCAN_URL = 'https://sepolia.etherscan.io'

// Address contract GiziChainFund yang sudah di-deploy di Sepolia
export const CONTRACT_ADDRESS =
  process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || ''

// Minimum donasi 0.001 ETH
export const MIN_DONATION = '0.001'

// ABI — hanya fungsi yang dipakai di mobile
export const CONTRACT_ABI = [
  // Donasi
  'function donate(string memory message) external payable',

  // View — baca data pool
  'function getStats() external view returns (uint256 balance, uint256 donated, uint256 disbursed, uint256 donorCount, uint256 beneficiaryCount)',
  'function getDonations() external view returns (tuple(address donor, uint256 amount, uint256 timestamp, string message)[])',
  'function getPoolBalance() external view returns (uint256)',

  // Events
  'event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp, string message)',
  'event FundDisbursed(string childAnonId, address indexed parentWallet, uint256 amount, uint256 timestamp)',
]
