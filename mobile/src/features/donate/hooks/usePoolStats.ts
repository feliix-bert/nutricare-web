import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  SEPOLIA_RPC_URL,
  SEPOLIA_CHAIN_ID,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from '../config'
import type { PoolStats, Donation, UsePoolStatsReturn } from '../types'

let simulatedBalance = 2.5
let simulatedTotalDonated = 5.2
let simulatedDonorCount = 18
let simulatedWalletBalance = 1

export function addSimulatedDonation(amountEth: number) {
  simulatedBalance += amountEth
  simulatedTotalDonated += amountEth
  simulatedDonorCount += 1
}

export function getSimulatedWalletBalance(): number {
  return simulatedWalletBalance
}

export function deductSimulatedDonation(amountEth: number): string | null {
  if (amountEth > simulatedWalletBalance) {
    return `Saldo tidak cukup. Saldo kamu: ${simulatedWalletBalance.toFixed(4)} ETH`
  }
  simulatedWalletBalance -= amountEth
  return null
}

function buildMockStats(): PoolStats {
  return {
    balance: simulatedBalance.toFixed(4),
    totalDonated: simulatedTotalDonated.toFixed(4),
    totalDisbursed: '2.7000',
    donorCount: simulatedDonorCount,
    beneficiaryCount: 5,
    contractAddress: '0x_simulated',
    isSimulated: true,
  }
}

const MOCK_DONATIONS: Donation[] = [
  {
    donor: '0x742d35Cc6634C0532925a3b8D4C9C0532925a3',
    amount: '0.5000',
    message: 'Semangat anak Indonesia!',
    timestamp: Date.now() / 1000 - 3600,
  },
  {
    donor: '0x8Ba1f109551bD432803012645Hac136Ba1f109',
    amount: '0.1000',
    message: 'Untuk adik-adik kita',
    timestamp: Date.now() / 1000 - 7200,
  },
  {
    donor: '0x1f9840a85d5aF5bf1D1762F925BDad5aF5bf1D',
    amount: '1.0000',
    message: '',
    timestamp: Date.now() / 1000 - 86400,
  },
]

export function usePoolStats(): UsePoolStatsReturn {
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!CONTRACT_ADDRESS) {
      await new Promise(r => setTimeout(r, 800))
      setStats(buildMockStats())
      setDonations(MOCK_DONATIONS)
      setLoading(false)
      return
    }

    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL, {
        chainId: SEPOLIA_CHAIN_ID,
        name: 'sepolia',
      })

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      const [rawStats, rawDonations] = await Promise.all([
        contract.getStats(),
        contract.getDonations(),
      ])

      setStats({
        balance: parseFloat(ethers.formatEther(rawStats[0])).toFixed(4),
        totalDonated: parseFloat(ethers.formatEther(rawStats[1])).toFixed(4),
        totalDisbursed: parseFloat(ethers.formatEther(rawStats[2])).toFixed(4),
        donorCount: Number(rawStats[3]),
        beneficiaryCount: Number(rawStats[4]),
        contractAddress: CONTRACT_ADDRESS,
        isSimulated: false,
      })

      const formattedDonations: Donation[] = [...rawDonations]
        .slice(-15)
        .reverse()
        .map((d: any) => ({
          donor: d.donor,
          amount: parseFloat(ethers.formatEther(d.amount)).toFixed(4),
          message: d.message,
          timestamp: Number(d.timestamp),
        }))

      setDonations(formattedDonations)

    } catch (err) {
      console.error('Error fetch pool stats:', err)
      setError('Gagal memuat data pool')
      setStats(buildMockStats())
      setDonations(MOCK_DONATIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { stats, donations, loading, error, refetch: fetchData }
}
