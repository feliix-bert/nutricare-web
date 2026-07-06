"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet, Heart, Shield, ExternalLink, CheckCircle2,
  AlertCircle, Loader2, Copy, ChevronRight, X, Coins,
  TrendingUp, Users, Globe
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { useVault } from "@/features/vault/hooks/useVault";
import type { VaultRecipient } from "@/features/vault/types/vault.types";

const EXPLORER = "https://amoy.polygonscan.com";
const NETWORK_NAME = "Polygon Amoy";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shortAddr(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

function formatDate(ts: number) {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── WalletButton ─────────────────────────────────────────────────────────────
function WalletButton({
  wallet, onConnect, onDisconnect,
}: {
  wallet: { address: string | null; isConnected: boolean; isConnecting: boolean; error: string | null };
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddr = () => {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (wallet.isConnecting) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-violet-100 text-violet-600 font-bold text-sm">
        <Loader2 size={16} className="animate-spin" />
        Menghubungkan...
      </button>
    );
  }

  if (wallet.isConnected && wallet.address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {shortAddr(wallet.address)}
          <button onClick={copyAddr} className="hover:text-green-900 transition-colors">
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <button
          onClick={onDisconnect}
          className="px-3 py-2 rounded-full bg-slate-100 text-slate-500 text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform"
    >
      <Wallet size={16} />
      Hubungkan Wallet
    </button>
  );
}

// ─── RecipientCard ────────────────────────────────────────────────────────────
function RecipientCard({
  recipient, onDonate,
}: {
  recipient: VaultRecipient;
  onDonate: (r: VaultRecipient) => void;
}) {
  const totalNum = Number(recipient.totalReceived) / 1e18;
  const targetNum = Number(recipient.targetAmount) / 1e18;
  const pct = targetNum > 0 ? Math.min(Math.round((totalNum / targetNum) * 100), 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex flex-col bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      {/* Card top band */}
      <div className="h-2 bg-gradient-to-r from-violet-400 to-indigo-500" />

      <div className="p-5 flex flex-col flex-1">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center font-extrabold text-violet-600 text-lg">
            {recipient.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-slate-800 truncate">{recipient.name}</p>
            {recipient.childName && (
              <p className="text-xs font-semibold text-slate-400 truncate">
                Anak: {recipient.childName}
              </p>
            )}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
            recipient.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
          }`}>
            {recipient.isActive ? "Aktif" : "Tutup"}
          </span>
        </div>

        {/* Progress */}
        {targetNum > 0 ? (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
              <span>Terkumpul: {totalNum.toFixed(4)} MATIC</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500"
              />
            </div>
            <p className="text-[10px] font-semibold text-slate-300 mt-1">
              Target: {targetNum.toFixed(4)} MATIC
            </p>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 py-2">
            <Coins size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-slate-400">
              Total diterima: {totalNum.toFixed(4)} MATIC
            </span>
          </div>
        )}

        {/* Wallet address */}
        <a
          href={`${EXPLORER}/address/${recipient.walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-violet-500 transition-colors mb-4"
        >
          <ExternalLink size={11} />
          {shortAddr(recipient.walletAddress)}
        </a>

        <div className="mt-auto">
          <button
            onClick={() => onDonate(recipient)}
            disabled={!recipient.isActive}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <Heart size={14} />
            Donasi Sekarang
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DonateModal ─────────────────────────────────────────────────────────────
const PRESET_AMOUNTS = ["0.01", "0.05", "0.1", "0.5"];

function DonateModal({
  recipient,
  isDonating,
  error,
  lastTxHash,
  onDonate,
  onClose,
}: {
  recipient: VaultRecipient | null;
  isDonating: boolean;
  error: string | null;
  lastTxHash: string | null;
  onDonate: (recipientId: string, amount: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("0.01");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!recipient || !amount || Number(amount) <= 0) return;
    const ok = await onDonate(recipient.id, amount);
    if (ok) setSuccess(true);
  };

  return (
    <AnimatePresence>
      {recipient && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={!isDonating ? onClose : undefined}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="w-full max-w-sm bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] overflow-hidden pointer-events-auto"
            >
              {/* Header gradient */}
              <div className="h-1 bg-gradient-to-r from-violet-400 to-indigo-600" />

              <div className="p-6">
                {!isDonating && !success && (
                  <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={16} className="text-slate-400" />
                  </button>
                )}

                {success ? (
                  <div className="flex flex-col items-center text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 size={32} className="text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-extrabold text-slate-800 mb-2">Donasi Berhasil! 🎉</h3>
                    <p className="text-sm font-semibold text-slate-500 mb-4">
                      Terima kasih telah membantu keluarga {recipient.name}
                    </p>
                    {lastTxHash && (
                      <a
                        href={`${EXPLORER}/tx/${lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 mb-6"
                      >
                        <ExternalLink size={12} />
                        Lihat Transaksi di Blockchain
                      </a>
                    )}
                    <button
                      onClick={onClose}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold"
                    >
                      Tutup
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-extrabold text-slate-800 mb-1">Donasi ke</h3>
                    <p className="text-sm font-bold text-violet-600 mb-5">{recipient.name}</p>

                    {/* Preset amounts */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {PRESET_AMOUNTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setAmount(p)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all ${
                            amount === p
                              ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Custom amount */}
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">MATIC</span>
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-16 pr-4 py-3.5 rounded-2xl bg-slate-50 text-slate-800 font-extrabold text-right focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>

                    <p className="text-[11px] font-semibold text-slate-400 text-center mb-4">
                      Network: {NETWORK_NAME} · Gas fee berlaku
                    </p>

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-100 mb-4">
                        <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
                        <p className="text-xs font-semibold text-rose-600">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={isDonating || !amount || Number(amount) <= 0}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                    >
                      {isDonating ? (
                        <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                      ) : (
                        <><Heart size={16} /> Kirim {amount} MATIC</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Vault Page ──────────────────────────────────────────────────────────
export default function VaultPage() {
  const {
    wallet, connect, disconnect,
    recipients, history, isLoading,
    isDonating, donateError, lastTxHash,
    handleDonate, formatMatic,
  } = useVault();

  const [selectedRecipient, setSelectedRecipient] = useState<VaultRecipient | null>(null);
  const [activeTab, setActiveTab] = useState<"recipients" | "history">("recipients");

  const totalDonated = history.reduce((acc, h) => acc + Number(h.amount) / 1e18, 0);

  return (
    <PageShell
      header={
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-1">GiziChain</p>
            <h1 className="text-2xl font-extrabold text-on-surface">Vault Donasi</h1>
          </div>
          <WalletButton wallet={wallet} onConnect={connect} onDisconnect={disconnect} />
        </div>
      }
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[2rem] mb-6 p-6 md:p-8 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-400/30 blur-2xl translate-y-8 -translate-x-8" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/70">Blockchain Verified</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight">
            Bersama Lawan Stunting 💜
          </h2>
          <p className="text-sm font-semibold text-white/80 mb-6 max-w-md">
            Setiap donasi tercatat permanen di blockchain Polygon. Transparan, aman, dan langsung ke keluarga penerima.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Penerima", value: String(recipients.length) },
              { icon: TrendingUp, label: "Total Donasi", value: `${totalDonated.toFixed(3)} MATIC` },
              { icon: Globe, label: "Network", value: "Polygon Amoy" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <Icon size={14} className="text-white/70 mb-1" />
                <p className="text-xs font-bold text-white/70">{label}</p>
                <p className="text-sm font-extrabold text-white truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet warning if not connected */}
      {!wallet.isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6"
        >
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Wallet belum terhubung</p>
            <p className="text-xs font-semibold text-amber-600">Hubungkan MetaMask untuk berdonasi</p>
          </div>
          <button onClick={connect} className="px-4 py-2 rounded-full bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors">
            Connect
          </button>
        </motion.div>
      )}

      {/* Tab Switch */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 w-fit">
        {(["recipients", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "recipients" ? "🤝 Penerima" : "📋 Riwayat"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "recipients" ? (
        isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-violet-400" />
          </div>
        ) : recipients.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <Heart size={28} className="text-violet-300" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-700 mb-2">Belum Ada Penerima</h3>
            <p className="text-sm font-semibold text-slate-400 max-w-xs">
              Daftar penerima donasi akan tampil di sini setelah terdaftar di smart contract.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipients.map((r) => (
              <RecipientCard key={r.id} recipient={r} onDonate={setSelectedRecipient} />
            ))}
          </div>
        )
      ) : (
        /* History Tab */
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Coins size={28} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-700 mb-2">Belum Ada Transaksi</h3>
              <p className="text-sm font-semibold text-slate-400">Riwayat donasi akan muncul setelah ada transaksi.</p>
            </div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {shortAddr(h.donor)} → Penerima #{h.recipientId}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {(Number(h.amount) / 1e18).toFixed(4)} MATIC · {formatDate(h.timestamp)}
                  </p>
                </div>
                <a
                  href={`${EXPLORER}/tx/${h.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-700 transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Donate Modal */}
      <DonateModal
        recipient={selectedRecipient}
        isDonating={isDonating}
        error={donateError}
        lastTxHash={lastTxHash}
        onDonate={handleDonate}
        onClose={() => setSelectedRecipient(null)}
      />
    </PageShell>
  );
}
