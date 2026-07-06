/**
 * vault.service.ts
 * Interacts with GiziChainRegistry smart contract on Polygon Amoy.
 * Uses ethers.js v6.
 */

import type { VaultRecipient, DonationRecord } from "../types/vault.types";

const CONTRACT_ADDRESS = "0x8B728afA92Da992b756644A56C0099dCcC4B6D5e";
const POLYGON_AMOY_CHAIN_ID = 80002;

// Load ABI lazily to avoid SSR issues
let cachedAbi: any[] | null = null;
async function getAbi(): Promise<any[]> {
  if (cachedAbi) return cachedAbi;
  const mod = await import("@/lib/abi/GiziChainRegistry.json");
  cachedAbi = mod.abi ?? mod.default?.abi ?? [];
  return cachedAbi!;
}

async function getEthers() {
  return import("ethers");
}

export async function getProvider() {
  if (typeof window === "undefined") throw new Error("Browser only");
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask tidak ditemukan. Install MetaMask terlebih dahulu.");
  const { BrowserProvider } = await getEthers();
  return new BrowserProvider(eth);
}

export async function connectWallet(): Promise<string> {
  const provider = await getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) throw new Error("Tidak ada akun yang tersedia.");

  // Check & switch network to Polygon Amoy
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== POLYGON_AMOY_CHAIN_ID) {
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` },
      ]);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Network not added — add it
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
            chainName: "Polygon Amoy Testnet",
            rpcUrls: ["https://rpc-amoy.polygon.technology"],
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            blockExplorerUrls: ["https://amoy.polygonscan.com"],
          },
        ]);
      } else {
        throw switchError;
      }
    }
  }

  return accounts[0] as string;
}

async function getContract(withSigner = false) {
  const { Contract } = await getEthers();
  const abi = await getAbi();
  const provider = await getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, abi, signer);
  }
  return new Contract(CONTRACT_ADDRESS, abi, provider);
}

export async function getRecipients(): Promise<VaultRecipient[]> {
  try {
    const contract = await getContract();
    // Try to call getRecipients — if it doesn't exist, return mock data
    let result: any[];
    try {
      result = await contract.getRecipients();
    } catch {
      return [];
    }
    return (result ?? []).map((r: any, i: number) => ({
      id: String(i),
      walletAddress: r.wallet ?? r[0] ?? "",
      name: r.name ?? r[1] ?? `Penerima ${i + 1}`,
      childName: r.childName ?? r[2] ?? undefined,
      totalReceived: BigInt(r.totalReceived ?? r[3] ?? 0),
      targetAmount: BigInt(r.targetAmount ?? r[4] ?? 0),
      isActive: r.isActive ?? r[5] ?? true,
    }));
  } catch {
    return [];
  }
}

export async function donate(
  recipientId: string,
  amountMatic: string,
): Promise<{ txHash: string }> {
  const { parseEther } = await getEthers();
  const contract = await getContract(true);
  const value = parseEther(amountMatic);

  let tx: any;
  try {
    // Try calling donate(recipientId) with value
    tx = await contract.donate(recipientId, { value });
  } catch {
    // Fallback: direct transfer (some contracts just accept payable)
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const { parseEther: pe } = await getEthers();
    tx = await signer.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: pe(amountMatic),
    });
  }

  const receipt = await tx.wait();
  return { txHash: receipt.hash ?? tx.hash };
}

export async function getDonationHistory(
  recipientId?: string,
): Promise<DonationRecord[]> {
  try {
    const { ethers } = await getEthers();
    const contract = await getContract();

    // Query Donated events
    const filter = contract.filters.Donated
      ? recipientId
        ? contract.filters.Donated(null, recipientId)
        : contract.filters.Donated()
      : null;

    if (!filter) return [];

    const events = await contract.queryFilter(filter, -10000);
    return events.map((e: any) => ({
      donor: e.args?.donor ?? "",
      recipientId: String(e.args?.recipientId ?? ""),
      amount: BigInt(e.args?.amount ?? 0),
      timestamp: Number(e.args?.timestamp ?? 0),
      txHash: e.transactionHash,
    }));
  } catch {
    return [];
  }
}

export function formatMatic(wei: bigint): string {
  if (wei === 0n) return "0";
  const { formatEther } = require("ethers");
  return parseFloat(formatEther(wei)).toFixed(4);
}
