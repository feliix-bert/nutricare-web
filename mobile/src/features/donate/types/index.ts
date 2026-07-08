export interface Donation {
  donor: string
  amount: string
  message: string
  timestamp: number
  txHash?: string
}

export interface PoolStats {
  balance: string
  totalDonated: string
  totalDisbursed: string
  donorCount: number
  beneficiaryCount: number
  contractAddress: string
  isSimulated: boolean
}

export interface DonateParams {
  amount: string
  message?: string
}

export interface DonateState {
  loading: boolean
  success: boolean
  error: string | null
  txHash: string | null
}

export interface UseDonateReturn extends DonateState {
  donate: (params: DonateParams) => Promise<void>
  reset: () => void
}

export interface UsePoolStatsReturn {
  stats: PoolStats | null
  donations: Donation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}
