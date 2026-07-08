import { create } from "zustand";

export type BlockchainRecord = {
  id: string;
  childId: string;
  childName: string;
  weight: number;
  height: number;
  ageMonths: number;
  status: "NORMAL" | "AT_RISK" | "STUNTED" | "SEVERELY_STUNTED";
  timestamp: string;
  blockNumber: number;
  txHash: string;
  gasFee: string;
};

type VaultState = {
  records: BlockchainRecord[];
  addRecord: (record: Omit<BlockchainRecord, "id" | "blockNumber" | "txHash" | "gasFee" | "timestamp">) => BlockchainRecord;
};

export const useVaultStore = create<VaultState>((set) => ({
  records: [],
  addRecord: (record) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC";
    const blockNumber = 1206000 + Math.floor(Math.random() * 5000);
    const txHash = `0x${Math.random().toString(16).slice(2)}...${Math.random().toString(16).slice(2)}`;
    const gasFee = `${(0.0004 + Math.random() * 0.0001).toFixed(5)} GZI`;

    const newRecord: BlockchainRecord = {
      ...record,
      id: `rec_${Date.now()}`,
      timestamp,
      blockNumber,
      txHash,
      gasFee,
    };

    set((state) => ({ records: [newRecord, ...state.records] }));
    return newRecord;
  },
}));
