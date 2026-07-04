// src/features/blockchain/hooks/useDonate.ts

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import {
  SEPOLIA_RPC_URL,
  SEPOLIA_CHAIN_ID,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  MIN_DONATION,
} from '../config'
import type { DonateParams, DonateState, UseDonateReturn } from '../types'

// ── Validasi ──────────────────────────────────────────────────────────────────

function validateDonation(amount: string): string | null {
  if (!amount || amount.trim() === '') {
    return 'Jumlah donasi wajib diisi'
  }

  const parsed = parseFloat(amount)

  if (isNaN(parsed) || parsed <= 0) {
    return 'Jumlah donasi harus lebih dari 0'
  }

  if (parsed < parseFloat(MIN_DONATION)) {
    return `Donasi minimal ${MIN_DONATION} ETH`
  }

  try {
    ethers.parseEther(amount)
  } catch {
    return 'Format jumlah tidak valid'
  }

  return null
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useDonate
 *
 * Hook untuk donasi ke GiziChainFund smart contract di Sepolia Testnet.
 *
 * Cara pakai:
 * ```ts
 * const { donate, loading, success, error, txHash } = useDonate(privateKey)
 *
 * await donate({ amount: '0.01', message: 'Semangat!' })
 * ```
 *
 * @param privateKey - Private key wallet donatur dari secure storage
 */
export function useDonate(privateKey: string): UseDonateReturn {
  const [state, setState] = useState<DonateState>({
    loading: false,
    success: false,
    error: null,
    txHash: null,
  })

  const reset = useCallback(() => {
    setState({ loading: false, success: false, error: null, txHash: null })
  }, [])

  const donate = useCallback(
    async ({ amount, message = '' }: DonateParams) => {
      // Validasi
      const validationError = validateDonation(amount)
      if (validationError) {
        setState(prev => ({ ...prev, error: validationError }))
        return
      }

      if (!privateKey) {
        setState(prev => ({
          ...prev,
          error: 'Wallet tidak terhubung. Silakan login ulang.',
        }))
        return
      }

      if (!CONTRACT_ADDRESS) {
        setState(prev => ({
          ...prev,
          error: 'Contract belum dikonfigurasi. Hubungi admin.',
        }))
        return
      }

      setState({ loading: true, success: false, error: null, txHash: null })

      try {
        // Setup provider & signer ke Sepolia
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL, {
          chainId: SEPOLIA_CHAIN_ID,
          name: 'sepolia',
        })

        const signer = new ethers.Wallet(privateKey, provider)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        // Cek saldo donatur
        const balance = await provider.getBalance(signer.address)
        const amountWei = ethers.parseEther(amount)

        // Estimasi gas untuk fungsi donate()
        const gasEstimate = await contract.donate.estimateGas(
          message || 'Donasi untuk anak stunting Indonesia',
          { value: amountWei }
        )
        const feeData = await provider.getFeeData()
        const gasCost = gasEstimate * (feeData.gasPrice ?? BigInt(0))
        const totalCost = amountWei + gasCost

        if (balance < totalCost) {
          setState({
            loading: false,
            success: false,
            error: `Saldo tidak cukup. Saldo kamu: ${parseFloat(
              ethers.formatEther(balance)
            ).toFixed(4)} ETH`,
            txHash: null,
          })
          return
        }

        // Panggil fungsi donate() di smart contract
        const tx = await contract.donate(
          message || 'Donasi untuk anak stunting Indonesia',
          { value: amountWei, chainId: SEPOLIA_CHAIN_ID }
        )

        // Tunggu 1 konfirmasi block
        const receipt = await tx.wait(1)

        if (!receipt || receipt.status === 0) {
          throw new Error('Transaksi gagal di blockchain')
        }

        setState({
          loading: false,
          success: true,
          error: null,
          txHash: receipt.hash,
        })

      } catch (err: unknown) {
        let errorMessage = 'Donasi gagal. Coba lagi.'

        if (err instanceof Error) {
          if (err.message.includes('insufficient funds')) {
            errorMessage = 'Saldo ETH tidak cukup'
          } else if (err.message.includes('user rejected')) {
            errorMessage = 'Transaksi dibatalkan'
          } else if (err.message.includes('network')) {
            errorMessage = 'Koneksi bermasalah. Periksa internet kamu.'
          } else if (err.message.includes('nonce')) {
            errorMessage = 'Terlalu banyak transaksi pending. Tunggu sebentar.'
          } else if (err.message.includes('Donasi minimal')) {
            errorMessage = err.message
          } else {
            errorMessage = err.message
          }
        }

        setState({
          loading: false,
          success: false,
          error: errorMessage,
          txHash: null,
        })
      }
    },
    [privateKey]
  )

  return { ...state, donate, reset }
}
