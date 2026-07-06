"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Info, Send, ChevronDown, Bot, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { useChatHistory, useSendMessage, usePredictionContextQuery } from "@/features/consult/hooks/useChat";
import { useSearchParams } from "next/navigation";
import { useChildrenList } from "@/features/children/hooks/useChildren";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 600;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeLocal(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  NORMAL:            { label: "Normal",          color: "text-secondary" },
  AT_RISK:           { label: "Berisiko",         color: "text-orange-500" },
  STUNTED:           { label: "Stunting",          color: "text-red-500" },
  SEVERELY_STUNTED:  { label: "Stunting Berat",   color: "text-red-700" },
};

// ---------------------------------------------------------------------------
// Sub-komponen: Message Bubble
// ---------------------------------------------------------------------------

type BubbleProps = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
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

// ---------------------------------------------------------------------------
// Sub-komponen: Typing Indicator
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-komponen: Selector Prediksi (Anak)
// ---------------------------------------------------------------------------

type SelectorItem = {
  childId: string;
  predictionId?: string;
  childName: string;
  ageMonths: number;
  status?: string;
};

type PredictionSelectorProps = {
  items: SelectorItem[];
  selected: string | null;
  onSelect: (predictionId: string) => void;
};

function PredictionSelector({ items, selected, onSelect }: PredictionSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((i) => i.predictionId && i.predictionId === selected);

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
        {selectedItem?.status && (
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
              const isSelected = item.predictionId === selected && !!selected;
              const hasPrediction = !!item.predictionId;
              
              return (
                <li key={item.childId}>
                  <button
                    role="option"
                    aria-selected={isSelected}
                    disabled={!hasPrediction}
                    onClick={() => {
                      if (hasPrediction) {
                        onSelect(item.predictionId!);
                        setOpen(false);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-colors ${
                      isSelected ? "bg-primary-container/20" : ""
                    } ${hasPrediction ? "hover:bg-surface-warm cursor-pointer" : "opacity-60 cursor-not-allowed bg-surface-dim"}`}
                  >
                    <span className="text-[13px] font-bold text-on-surface">{item.childName}</span>
                    <span className="text-[11px] text-on-surface-variant">
                      {item.ageMonths} bulan
                      {hasPrediction && item.status ? (
                        <>
                          {" · "}
                          <span className={`font-semibold ${STATUS_LABEL[item.status]?.color ?? ""}`}>
                            {STATUS_LABEL[item.status]?.label ?? item.status}
                          </span>
                        </>
                      ) : (
                        <>
                          {" · "}
                          <span className="italic">Belum ada hasil deteksi</span>
                        </>
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
// Sub-komponen: Empty State (belum pilih anak)
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-5">
        <Bot size={30} className="text-primary" />
      </div>
      <h2 className="text-[17px] font-bold text-on-surface mb-2">Belum ada konteks</h2>
      <p className="text-[14px] text-on-surface-variant leading-relaxed max-w-xs">
        Pilih anak dari daftar di atas, atau mulai dari halaman <strong>Riwayat Pemeriksaan Anak</strong> agar AI dapat membaca hasil skrining secara spesifik.
      </p>
      <div className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-primary-container/20 rounded-full">
        <ShieldCheck size={13} className="text-primary" />
        <span className="text-[12px] font-semibold text-primary">Percakapan diproteksi & tidak dapat dimanipulasi</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponen: Error State
// ---------------------------------------------------------------------------

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 px-4 py-3 mx-4 my-2 bg-red-50 border border-red-100 rounded-2xl"
    >
      <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
      <p className="text-[13px] text-red-700 flex-1 leading-snug">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-[12px] font-bold text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
      >
        <RefreshCw size={12} />
        Coba lagi
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ChatView — di-extract supaya key=predictionId reset state otomatis
// ---------------------------------------------------------------------------

function ChatView({
  context,
  predictionId,
}: {
  context: NonNullable<ReturnType<typeof usePredictionContextQuery>["data"]>;
  predictionId: string;
}) {
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const { data: historyData } = useChatHistory(predictionId);
  const sendMutation = useSendMessage(predictionId);

  // Render-time init: sync history ke local state sekali (set-state di render aman, gak cascade)
  const historyMessages = useMemo(() => historyData?.messages ?? [], [historyData]);
  const initialized = useRef(false);
  if (historyMessages.length > 0 && localMessages.length === 0 && !initialized.current) {
    initialized.current = true;
    setLocalMessages(historyMessages);
  }

  // Auto-scroll ke bawah
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, sendMutation.isPending]);

  const handleSend = useCallback(
    async (text: string) => {
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
        const result = await sendMutation.mutateAsync({
          predictionId,
          message: trimmed,
          context,
        });

        const aiMsg = {
          id: `ai_${Date.now()}`,
          role: "assistant" as const,
          content: result.reply,
          timestamp: new Date().toISOString(),
        };
        setLocalMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== optimisticUserMsg.id);
          return [...filtered, optimisticUserMsg, aiMsg];
        });

        if (result.suggestedQuestions?.length) {
          setSuggestedQuestions(result.suggestedQuestions);
        }
      } catch (err: unknown) {
        setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
        setSendError(
          err instanceof Error
            ? err.message
            : "Gagal mengirim pesan. Periksa koneksi internet Anda.",
        );
        setLastFailedMessage(trimmed);
      }
    },
    [predictionId, context, sendMutation],
  );

  const quickPrompts =
    suggestedQuestions.length > 0
      ? suggestedQuestions
      : [
          "Bagaimana cara mencegah stunting?",
          "Jadwal MPASI 6 bulan",
          "ASI eksklusif vs MPASI",
          "Kebutuhan zat besi bayi",
        ];

  return (
    <>
      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-surface-warm">
        {/* Pesan sapaan awal jika belum ada history */}
        {localMessages.length === 0 && (
          <MessageBubble
            role="assistant"
            content={`Halo! Saya siap membantu konsultasi tumbuh kembang ${context.childName} (${context.ageMonths} bulan). Status saat ini: ${STATUS_LABEL[context.status]?.label ?? context.status}. Silakan ajukan pertanyaan seputar gizi, MPASI, atau tumbuh kembang si kecil.`}
            timestamp={new Date().toISOString()}
          />
        )}

        <AnimatePresence mode="popLayout">
          {localMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}
        </AnimatePresence>

        {sendMutation.isPending && <TypingIndicator />}

        {sendError && (
          <ErrorBanner
            message={sendError}
            onRetry={() => {
              if (lastFailedMessage) {
                void handleSend(lastFailedMessage);
              }
            }}
          />
        )}

        <div ref={scrollRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="bg-surface-warm pt-3 pb-24 lg:pb-6 px-4 flex flex-col gap-3 flex-shrink-0 border-t border-outline-variant/5">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-on-surface-variant/50 uppercase tracking-widest pl-1">
            Saran Pertanyaan:
          </span>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(inputText);
                }
              }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-[10px] font-medium ${
                inputText.length > MAX_MESSAGE_LENGTH * 0.9 ? "text-orange-500" : "text-on-surface-variant/30"
              }`}>
                {inputText.length}/{MAX_MESSAGE_LENGTH}
              </span>
              <button
                id="chat-send-button"
                onClick={() => void handleSend(inputText)}
                disabled={!inputText.trim() || sendMutation.isPending}
                aria-label="Kirim pesan"
                className={`w-7 h-7 flex items-center justify-center transition-all ${
                  inputText.trim() && !sendMutation.isPending
                    ? "text-primary scale-110"
                    : "text-on-surface-variant/30"
                }`}
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
// Halaman Utama
// ---------------------------------------------------------------------------

export default function ConsultPage() {
  const searchParams = useSearchParams();
  const predictionIdFromUrl = searchParams.get('predictionId');

  const [selectedPredictionId, setSelectedPredictionId] = useState<string | null>(predictionIdFromUrl);

  const { data: context } = usePredictionContextQuery(selectedPredictionId);

  const { data: childrenData } = useChildrenList(0, 50);

  const availableItems: SelectorItem[] = childrenData?.data
    .map(child => ({
      childId: child.id,
      predictionId: child.latestPrediction?.predictionId,
      childName: child.name,
      ageMonths: child.ageMonths,
      status: child.latestPrediction?.status,
    })) || [];

  const hasContext = !!selectedPredictionId && !!context;

  return (
    <PageShell flush>
      <div className="flex items-center justify-center min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8">
        <div className="flex flex-col w-full h-[100dvh] lg:h-[85vh] lg:max-w-4xl lg:rounded-[2.5rem] lg:shadow-elevated lg:border lg:border-outline-variant/10 bg-surface-warm overflow-hidden relative">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-surface-warm border-b border-outline-variant/10 z-20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar seed="gemini-ai" variant="ai" size="sm" className="bg-primary-container border-none shadow-none text-primary" />
              <div className="flex flex-col">
                <h1 className="text-[15px] font-bold text-on-surface tracking-tight leading-none mb-1">
                  TumbuhSehat Advisor
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-[11px] text-on-surface-variant font-semibold">Aktif</span>
                </div>
              </div>
            </div>

            {/* Selector Prediksi */}
            <PredictionSelector
              items={availableItems}
              selected={selectedPredictionId}
              onSelect={setSelectedPredictionId}
            />
          </div>

          {/* ── Disclaimer Banner ── */}
          <div className="bg-tertiary-container/40 border-b border-tertiary/15 px-5 py-3 flex items-start gap-2.5 flex-shrink-0">
            <Info size={14} className="text-tertiary-on-container flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-[11px] md:text-[12px] text-tertiary-on-container leading-relaxed font-bold">
              Hasil konsultasi AI ini bersifat edukatif dan <span className="underline">bukan diagnosis medis</span>. Selalu konsultasikan keputusan kesehatan dengan dokter atau tenaga kesehatan.
            </p>
          </div>

          {/* ── Chat Area — key= selectedPredictionId resets state on switch ── */}
          <div key={selectedPredictionId ?? "no-selection"} className="flex-1 flex flex-col overflow-hidden">
            {!hasContext ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState />
              </div>
            ) : (
              <ChatView context={context} predictionId={selectedPredictionId} />
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
