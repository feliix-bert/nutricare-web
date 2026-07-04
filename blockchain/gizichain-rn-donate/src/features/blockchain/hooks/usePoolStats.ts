// src/features/blockchain/hooks/usePoolStats.ts

import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  SEPOLIA_RPC_URL,
  SEPOLIA_CHAIN_ID,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from '../config'
import type { PoolStats, Donation, UsePoolStatsReturn } from '../types'

// ── Data Simulasi ─────────────────────────────────────────────────────────────

const MOCK_STATS: PoolStats = {
  balance: '2.5000',
  totalDonated: '5.2000',
  totalDisbursed: '2.7000',
  donorCount: 18,
  beneficiaryCount: 5,
  contractAddress: '0x_simulated',
  isSimulated: true,
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

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * usePoolStats
 *
 * Hook untuk membaca data pool dari smart contract GiziChainFund.
 * Jika contract belum dikonfigurasi, return data simulasi.
 */
export function usePoolStats(): UsePoolStatsReturn {
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Mode simulasi jika contract belum ada
    if (!CONTRACT_ADDRESS) {
      await new Promise(r => setTimeout(r, 800)) // simulasi loading
      setStats(MOCK_STATS)
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

      // Fetch stats dan donations secara paralel
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

      // Ambil 15 donasi terbaru
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
      // Fallback ke simulasi
      setStats(MOCK_STATS)
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
