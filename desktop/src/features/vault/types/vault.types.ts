export type VaultRecipient = {
  id: string;
  walletAddress: string;
  name: string;
  childName?: string;
  totalReceived: bigint;
  targetAmount: bigint;
  isActive: boolean;
};

export type DonationRecord = {
  donor: string;
  recipientId: string;
  amount: bigint;
  timestamp: number;
  txHash: string;
};

export type WalletState = {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
};
