"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Info, Send, ChevronDown, Bot, AlertCircle, RefreshCw,
  ShieldCheck, Sparkles, Stethoscope, MessageCircle, ChevronRight, UserX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import {
  useChatHistory,
  useSendMessage,
  usePredictionContextQuery,
  useChildBasicContextQuery,
} from "@/features/consult/hooks/useChat";
import { useChildrenList } from "@/features/children/hooks/useChildren";
import { useAuthStore } from "@/stores/authStore";
import {
  useParentConsultations,
  useStartConsultation,
} from "@/features/consult/hooks/useDoctorConsult";
import type { PredictionContext } from "@/features/consult/types/consult.types";
import type { Consultation } from "@/features/medic/types/consultation.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 600;

type TabType = "ai" | "doctor";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeLocal(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  NORMAL:           { label: "Normal",        color: "text-secondary" },
  AT_RISK:          { label: "Berisiko",       color: "text-orange-500" },
  STUNTED:          { label: "Stunting",       color: "text-red-500" },
  SEVERELY_STUNTED: { label: "Stunting Berat", color: "text-red-700" },
};

// ---------------------------------------------------------------------------
// AI Chat Sub-components
// ---------------------------------------------------------------------------

type BubbleProps = { role: "user" | "assistant"; content: string; timestamp: string };

const MessageBubble = React.memo(function MessageBubble({ role, content, timestamp }: BubbleProps) {
  const isAi = role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex gap-2.5 my-4 ${isAi ? "justify-start" : "justify-end"}`}
    >
      {isAi && (
        <Avatar seed="gemini-ai" variant="ai" size="xs" className="self-end mb-1 bg-surface-dim border-none shadow-none" />
      )}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-4 pt-3.5 pb-7 ${
          isAi
            ? "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-outline-variant/10 text-on-surface rounded-[1.25rem] rounded-bl-sm"
            : "gradient-primary shadow-sm text-white rounded-[1.25rem] rounded-br-sm"
        }`}
      >
        <div className="text-[14.5px] leading-relaxed markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        <span className={`absolute bottom-2 right-3 text-[10px] font-medium ${isAi ? "text-on-surface-variant/50" : "text-white/70"}`}>
          {formatTimeLocal(timestamp)}
        </span>
      </div>
      {!isAi && (
        <Avatar seed="Ibu Ani" variant="parent" size="xs" className="self-end mb-1 border-none shadow-none" />
      )}
    </motion.div>
  );
});

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex gap-2.5 my-4"
    >
      <Avatar seed="gemini-ai" variant="ai" size="xs" className="self-end mb-1 bg-surface-dim border-none shadow-none" />
      <div className="px-4 py-3.5 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-outline-variant/10 rounded-[1.25rem] rounded-bl-sm">
        <div className="flex gap-1.5 items-center h-full">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

type SelectorItem = {
  childId: string;
  predictionId?: string;
  childName: string;
  ageMonths: number;
  status?: string;
};

function ChildSelector({ items, selectedChildId, onSelect }: {
  items: SelectorItem[];
  selectedChildId: string | null;
  onSelect: (childId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((i) => i.childId === selectedChildId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-high border border-outline-variant/20 hover:bg-surface-dim transition-colors text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Bot size={14} className="text-primary flex-shrink-0" />
        <span className="text-[13px] font-semibold text-on-surface max-w-[140px] truncate">
          {selectedItem ? selectedItem.childName : "Pilih Anak"}
        </span>
        {selectedItem?.status && selectedItem.predictionId && (
          <span className={`text-[11px] font-bold ${STATUS_LABEL[selectedItem.status]?.color ?? "text-on-surface-variant"}`}>
            · {STATUS_LABEL[selectedItem.status]?.label}
          </span>
        )}
        <ChevronDown size={13} className={`text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-elevated border border-outline-variant/15 overflow-hidden z-50"
          >
            {items.map((item) => {
              const isSelected = item.childId === selectedChildId;
              const hasPrediction = !!item.predictionId;
              return (
                <li key={item.childId}>
                  <button
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onSelect(item.childId); setOpen(false); }}
                    className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-colors cursor-pointer ${isSelected ? "bg-primary-container/20" : "hover:bg-surface-warm"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-on-surface">{item.childName}</span>
                      {!hasPrediction && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Umum</span>
                      )}
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      {item.ageMonths} bulan
                      {hasPrediction && item.status ? (
                        <> · <span className={`font-semibold ${STATUS_LABEL[item.status]?.color ?? ""}`}>{STATUS_LABEL[item.status]?.label ?? item.status}</span></>
                      ) : (
                        <> · <span className="italic text-orange-500">Belum ada skrining</span></>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Chat View
// ---------------------------------------------------------------------------

function ChatView({ context, childId, predictionId, isGeneralMode }: {
  context: PredictionContext;
  childId: string;
  predictionId: string | null;
  isGeneralMode: boolean;
}) {
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const { data: historyData } = useChatHistory(predictionId);
  const sendMutation = useSendMessage(predictionId, childId);

  const historyMessages = useMemo(() => historyData?.messages ?? [], [historyData]);
  const initialized = useRef(false);
  if (historyMessages.length > 0 && localMessages.length === 0 && !initialized.current) {
    initialized.current = true;
    setLocalMessages(historyMessages);
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, sendMutation.isPending]);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setSendError(null);
    setLastFailedMessage(null);
    setInputText("");
    const optimisticUserMsg = {
      id: `optimistic_user_${Date.now()}`,
      role: "user" as const,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimisticUserMsg]);
    try {
      const result = await sendMutation.mutateAsync({ predictionId: predictionId ?? undefined, childId, message: trimmed, context });
      const aiMsg = { id: `ai_${Date.now()}`, role: "assistant" as const, content: result.reply, timestamp: new Date().toISOString() };
      setLocalMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== optimisticUserMsg.id);
        return [...filtered, optimisticUserMsg, aiMsg];
      });
      if (result.suggestedQuestions?.length) setSuggestedQuestions(result.suggestedQuestions);
    } catch (err: unknown) {
      setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
      setSendError(err instanceof Error ? err.message : "Gagal mengirim pesan. Periksa koneksi internet Anda.");
      setLastFailedMessage(trimmed);
    }
  }, [childId, predictionId, context, sendMutation]);

  const quickPrompts = suggestedQuestions.length > 0 ? suggestedQuestions : isGeneralMode
    ? ["Makanan bergizi untuk anak usia saya?", "Kapan harus mulai MPASI?", "Jadwal makan bayi 6 bulan", "Tanda anak tumbuh normal"]
    : ["Bagaimana cara mencegah stunting?", "Jadwal MPASI 6 bulan", "ASI eksklusif vs MPASI", "Kebutuhan zat besi bayi"];

  const welcomeMessage = isGeneralMode
    ? `Halo! Saya NutriBot, asisten gizi anak dari NutriCare. Saya siap membantu menjawab pertanyaan seputar gizi dan tumbuh kembang ${context.childName} (${context.ageMonths} bulan).\n\n> 💡 Untuk mendapat analisis yang lebih spesifik, lakukan **skrining stunting** melalui menu Assessment di aplikasi.`
    : `Halo! Saya siap membantu konsultasi tumbuh kembang **${context.childName}** (${context.ageMonths} bulan). Status saat ini: **${STATUS_LABEL[context.status]?.label ?? context.status}**. Silakan ajukan pertanyaan seputar gizi, MPASI, atau tumbuh kembang si kecil.`;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-surface-warm">
        {localMessages.length === 0 && (
          <MessageBubble role="assistant" content={welcomeMessage} timestamp={new Date().toISOString()} />
        )}
        <AnimatePresence mode="popLayout">
          {localMessages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          ))}
        </AnimatePresence>
        {sendMutation.isPending && <TypingIndicator />}
        {sendError && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 px-4 py-3 mx-4 my-2 bg-red-50 border border-red-100 rounded-2xl"
          >
            <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            <p className="text-[13px] text-red-700 flex-1 leading-snug">{sendError}</p>
            <button onClick={() => lastFailedMessage && void handleSend(lastFailedMessage)} className="flex items-center gap-1 text-[12px] font-bold text-red-600 hover:text-red-700 transition-colors flex-shrink-0">
              <RefreshCw size={12} /> Coba lagi
            </button>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="bg-surface-warm pt-3 pb-24 lg:pb-6 px-4 flex flex-col gap-3 flex-shrink-0 border-t border-outline-variant/5">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-on-surface-variant/50 uppercase tracking-widest pl-1">Saran Pertanyaan:</span>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => void handleSend(prompt)}
                disabled={sendMutation.isPending}
                className="flex-shrink-0 px-4 py-2 bg-primary-container/30 border border-primary/10 rounded-full text-[13px] font-bold text-primary-on-container hover:bg-primary-container/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-surface-high rounded-2xl flex flex-col px-4 py-3 shadow-inner">
            <input
              id="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={`Tanya soal ${context.childName}...`}
              disabled={sendMutation.isPending}
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-1 bg-transparent outline-none text-[14px] text-on-surface font-medium placeholder:text-on-surface-variant/40 disabled:cursor-not-allowed"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(inputText); } }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-[10px] font-medium ${inputText.length > MAX_MESSAGE_LENGTH * 0.9 ? "text-orange-500" : "text-on-surface-variant/30"}`}>
                {inputText.length}/{MAX_MESSAGE_LENGTH}
              </span>
              <button
                id="chat-send-button"
                onClick={() => void handleSend(inputText)}
                disabled={!inputText.trim() || sendMutation.isPending}
                aria-label="Kirim pesan"
                className={`w-7 h-7 flex items-center justify-center transition-all ${inputText.trim() && !sendMutation.isPending ? "text-primary scale-110" : "text-on-surface-variant/30"}`}
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Doctor Consultation Tab
// ---------------------------------------------------------------------------

function DoctorConsultTab({ parentId }: { parentId: string }) {
  const router = useRouter();
  const { data: childrenData } = useChildrenList(0, 50);
  const { data: consultations, isLoading } = useParentConsultations(parentId);
  const startMut = useStartConsultation();
  const [startingChildId, setStartingChildId] = useState<string | null>(null);

  const children = childrenData?.data ?? [];
  const consultMap = useMemo(() => {
    const map = new Map<string, Consultation>();
    (consultations ?? []).forEach((c) => {
      // Map by child_id, prefer OPEN over CLOSED
      const existing = map.get(c.child_id);
      if (!existing || (c.status === "OPEN" && existing.status !== "OPEN")) {
        map.set(c.child_id, c);
      }
    });
    return map;
  }, [consultations]);

  const handleStart = async (child: typeof children[number]) => {
    if (!child.medicId) return;
    setStartingChildId(child.id);
    try {
      const consult = await startMut.mutateAsync({
        child_id: child.id,
        medic_id: child.medicId,
        parent_id: parentId,
      });
      router.push(`/consult/${consult.id}`);
    } finally {
      setStartingChildId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-4 px-4 py-6">
        {[1, 2].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-surface-warm animate-pulse" />
        ))}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-5">
          <Stethoscope size={28} className="text-primary" />
        </div>
        <h2 className="text-[17px] font-bold text-on-surface mb-2">Belum ada profil anak</h2>
        <p className="text-[14px] text-on-surface-variant leading-relaxed max-w-xs">
          Tambahkan profil anak terlebih dahulu untuk dapat berkonsultasi dengan dokter.
        </p>
        <button
          onClick={() => router.push("/children/new")}
          className="mt-6 px-6 py-3 rounded-full gradient-primary text-white font-bold text-[14px] shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
        >
          + Tambah Profil Anak
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 bg-surface-warm flex flex-col gap-3 pb-24 lg:pb-6">
      <p className="text-[11px] font-extrabold text-on-surface-variant/50 uppercase tracking-widest pl-1">Anak Anda</p>
      {children.map((child) => {
        const existingConsult = consultMap.get(child.id);
        const hasDoctor = !!child.medicId;
        const isOpen = existingConsult?.status === "OPEN";
        const isStarting = startingChildId === child.id;

        return (
          <motion.div
            key={child.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-[1.5rem] border border-outline-variant/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            {/* Child info */}
            <div className="px-5 pt-4 pb-3 flex items-center gap-3">
              <Avatar seed={child.name} variant="parent" size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface text-[15px] truncate">{child.name}</p>
                <p className="text-[12px] text-on-surface-variant">{child.ageMonths} bulan</p>
              </div>
              {existingConsult && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOpen ? "bg-secondary/15 text-secondary" : "bg-slate-100 text-slate-500"}`}>
                  {isOpen ? "Aktif" : "Selesai"}
                </span>
              )}
            </div>

            {/* Doctor info */}
            <div className={`mx-5 mb-4 px-4 py-3 rounded-2xl flex items-center gap-3 ${hasDoctor ? "bg-primary/5 border border-primary/10" : "bg-slate-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${hasDoctor ? "bg-primary/10" : "bg-slate-200"}`}>
                {hasDoctor ? <Stethoscope size={14} className="text-primary" /> : <UserX size={14} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {hasDoctor ? (
                  <>
                    <p className="text-[12px] font-bold text-primary truncate">{child.medicName}</p>
                    <p className="text-[11px] text-on-surface-variant">Dokter pendamping</p>
                  </>
                ) : (
                  <>
                    <p className="text-[12px] font-bold text-slate-500">Belum ada dokter</p>
                    <p className="text-[11px] text-on-surface-variant">Pilih dokter dari profil anak</p>
                  </>
                )}
              </div>

              {hasDoctor ? (
                <button
                  onClick={() => {
                    if (existingConsult && isOpen) {
                      router.push(`/consult/${existingConsult.id}`);
                    } else {
                      void handleStart(child);
                    }
                  }}
                  disabled={isStarting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-primary text-white text-[12px] font-bold hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100 shadow-sm shadow-primary/30"
                >
                  {isStarting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageCircle size={12} />
                      {existingConsult && isOpen ? "Lanjut Chat" : "Mulai Konsultasi"}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/children/${child.id}/doctor`)}
                  className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                >
                  Pilih <ChevronRight size={12} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Past consultations */}
      {consultations && consultations.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] font-extrabold text-on-surface-variant/50 uppercase tracking-widest pl-1 mb-3">Riwayat Konsultasi</p>
          <div className="flex flex-col gap-2">
            {(consultations as Consultation[]).filter(c => c.status === "CLOSED").slice(0, 5).map(c => (
              <button
                key={c.id}
                onClick={() => router.push(`/consult/${c.id}`)}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-outline-variant/10 text-left hover:bg-surface-warm transition-colors"
              >
                <Avatar seed={c.children?.name ?? "A"} variant="parent" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-on-surface truncate">{c.children?.name}</p>
                  <p className="text-[11px] text-on-surface-variant">Selesai · {new Date(c.updated_at).toLocaleDateString("id-ID")}</p>
                </div>
                <ChevronRight size={14} className="text-on-surface-variant/40" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ConsultPage() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const predictionIdFromUrl = searchParams.get("predictionId");

  const [activeTab, setActiveTab] = useState<TabType>("ai");
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: childrenData } = useChildrenList(0, 50);

  const availableItems: SelectorItem[] = childrenData?.data.map((child) => ({
    childId: child.id,
    predictionId: child.latestPrediction?.predictionId,
    childName: child.name,
    ageMonths: child.ageMonths,
    status: child.latestPrediction?.status,
  })) ?? [];

  useEffect(() => {
    if (predictionIdFromUrl && availableItems.length > 0 && !selectedChildId) {
      const match = availableItems.find((i) => i.predictionId === predictionIdFromUrl);
      if (match) setSelectedChildId(match.childId);
    }
  }, [predictionIdFromUrl, availableItems, selectedChildId]);

  const selectedItem = availableItems.find((i) => i.childId === selectedChildId) ?? null;
  const hasPrediction = !!selectedItem?.predictionId;

  const { data: predictionContext } = usePredictionContextQuery(
    hasPrediction ? (selectedItem?.predictionId ?? null) : null,
  );
  const { data: childContext } = useChildBasicContextQuery(
    !hasPrediction && !!selectedChildId ? selectedChildId : null,
  );

  const context = predictionContext ?? childContext ?? null;
  const hasContext = !!selectedChildId && !!context;
  const isGeneralMode = hasContext && !predictionContext;

  return (
    <PageShell flush>
      <div className="flex items-center justify-center min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8">
        <div className="flex flex-col w-full h-[100dvh] lg:h-[85vh] lg:max-w-4xl lg:rounded-[2.5rem] lg:shadow-elevated lg:border lg:border-outline-variant/10 bg-surface-warm overflow-hidden relative">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-surface-warm border-b border-outline-variant/10 z-20 flex-shrink-0">
            {/* Left: Title + active tab indicator */}
            <div className="flex items-center gap-3">
              {activeTab === "ai" ? (
                <>
                  <Avatar seed="gemini-ai" variant="ai" size="sm" className="bg-primary-container border-none shadow-none text-primary" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h1 className="text-[15px] font-bold text-on-surface tracking-tight leading-none">NutriBot</h1>
                      {isGeneralMode && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          <Sparkles size={9} /> Mode Umum
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-[11px] text-on-surface-variant font-semibold">Aktif</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope size={16} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-[15px] font-bold text-on-surface tracking-tight leading-none">Konsultasi Dokter</h1>
                    <span className="text-[11px] text-on-surface-variant font-semibold mt-0.5">Real-time chat</span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Tab switcher or child selector */}
            <div className="flex items-center gap-2">
              {activeTab === "ai" && (
                <ChildSelector items={availableItems} selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
              )}
            </div>
          </div>

          {/* ── Tab Bar ── */}
          <div className="flex bg-surface-warm border-b border-outline-variant/10 px-5 gap-1 flex-shrink-0">
            {[
              { key: "ai" as TabType, label: "AI NutriBot", icon: Bot },
              { key: "doctor" as TabType, label: "Dokter", icon: Stethoscope },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-bold transition-all border-b-2 ${
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant/60 hover:text-on-surface-variant"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Disclaimer (AI tab only) ── */}
          {activeTab === "ai" && (
            <div className="bg-tertiary-container/40 border-b border-tertiary/15 px-5 py-3 flex items-start gap-2.5 flex-shrink-0">
              <Info size={14} className="text-tertiary-on-container flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-[11px] md:text-[12px] text-tertiary-on-container leading-relaxed font-bold">
                Hasil konsultasi AI ini bersifat edukatif dan <span className="underline">bukan diagnosis medis</span>. Selalu konsultasikan keputusan kesehatan dengan dokter atau tenaga kesehatan.
              </p>
            </div>
          )}

          {/* ── Content Area ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "ai" ? (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div key={selectedChildId ?? "no-selection"} className="flex-1 flex flex-col overflow-hidden">

                    {!hasContext ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center px-6 py-12 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-5">
                            <Bot size={30} className="text-primary" />
                          </div>
                          <h2 className="text-[17px] font-bold text-on-surface mb-2">Pilih anak terlebih dahulu</h2>
                          <p className="text-[14px] text-on-surface-variant leading-relaxed max-w-xs">
                            Pilih anak dari daftar di atas. Anak yang sudah memiliki hasil skrining akan mendapat respons yang lebih spesifik.
                          </p>
                          <div className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-primary-container/20 rounded-full">
                            <ShieldCheck size={13} className="text-primary" />
                            <span className="text-[12px] font-semibold text-primary">Percakapan diproteksi &amp; tidak dapat dimanipulasi</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ChatView context={context!} childId={selectedChildId!} predictionId={selectedItem?.predictionId ?? null} isGeneralMode={isGeneralMode} />
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="doctor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {user ? (
                    <DoctorConsultTab parentId={user.id} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant">Memuat...</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
