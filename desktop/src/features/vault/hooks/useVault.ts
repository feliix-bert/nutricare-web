"use client";

import { useState, useEffect, useCallback } from "react";
import {
  connectWallet,
  getRecipients,
  donate,
  getDonationHistory,
  formatMatic,
} from "../services/vault.service";
import type { VaultRecipient, DonationRecord, WalletState } from "../types/vault.types";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setWallet((w) => ({ ...w, isConnecting: true, error: null }));
    try {
      const address = await connectWallet();
      setWallet({ address, chainId: 80002, isConnected: true, isConnecting: false, error: null });
    } catch (e: any) {
      setWallet((w) => ({ ...w, isConnecting: false, error: e.message ?? "Gagal menghubungkan wallet" }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ address: null, chainId: null, isConnected: false, isConnecting: false, error: null });
  }, []);

  // Listen for account changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const onAccounts = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else setWallet((w) => ({ ...w, address: accounts[0], isConnected: true }));
    };
    eth.on("accountsChanged", onAccounts);
    return () => eth.removeListener("accountsChanged", onAccounts);
  }, [disconnect]);

  return { wallet, connect, disconnect };
}

export function useVault() {
  const { wallet, connect, disconnect } = useWallet();
  const [recipients, setRecipients] = useState<VaultRecipient[]>([]);
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const loadRecipients = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await getRecipients();
      setRecipients(r);
    } catch {
      setRecipients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const h = await getDonationHistory();
      setHistory(h);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadRecipients();
    loadHistory();
  }, [loadRecipients, loadHistory]);

  const handleDonate = useCallback(
    async (recipientId: string, amountMatic: string): Promise<boolean> => {
      if (!wallet.isConnected) {
        await connect();
        return false;
      }
      setIsDonating(true);
      setDonateError(null);
      setLastTxHash(null);
      try {
        const { txHash } = await donate(recipientId, amountMatic);
        setLastTxHash(txHash);
        // Refresh data
        await loadRecipients();
        await loadHistory();
        return true;
      } catch (e: any) {
        const msg = e?.info?.error?.message ?? e?.message ?? "Donasi gagal";
        setDonateError(msg.includes("user rejected") ? "Transaksi dibatalkan oleh pengguna." : msg);
        return false;
      } finally {
        setIsDonating(false);
      }
    },
    [wallet, connect, loadRecipients, loadHistory]
  );

  return {
    wallet,
    connect,
    disconnect,
    recipients,
    history,
    isLoading,
    isDonating,
    donateError,
    lastTxHash,
    handleDonate,
    formatMatic,
  };
}
