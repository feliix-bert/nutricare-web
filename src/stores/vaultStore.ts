import { create } from "zustand";
import { randomHex } from "@/utils/random";

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
  records: [
    {
      id: "rec_1",
      childId: "child_001",
      childName: "Andi Santoso",
      weight: 10.2,
      height: 82.5,
      ageMonths: 18,
      status: "AT_RISK",
      timestamp: "2026-06-05 14:23 UTC",
      blockNumber: 1205489,
      txHash: "0x8fa4b7ee87...c5d3a1f9e2b0",
      gasFee: "0.00045 GZI",
    },
    {
      id: "rec_2",
      childId: "child_002",
      childName: "Sari Dewi",
      weight: 7.1,
      height: 65.0,
      ageMonths: 6,
      status: "NORMAL",
      timestamp: "2026-06-07 09:12 UTC",
      blockNumber: 1206124,
      txHash: "0x3ab2c5ff12...e8d9a4b0c7f1",
      gasFee: "0.00042 GZI",
    },
  ],
  addRecord: (record) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC";
    const blockNumber = 1206000 + Math.floor(Math.random() * 5000);
    // Generate mock hash
    const txHash = `0x${randomHex()}...${randomHex()}`;
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
