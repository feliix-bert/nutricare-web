"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCheck, Stethoscope, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/stores/authStore";
import { useParentConsultationMessages, useParentSendMessage } from "@/features/consult/hooks/useDoctorConsult";
import { useConsultationList } from "@/features/medic/hooks/useConsultation";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import type { Consultation } from "@/features/medic/types/consultation.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Hari ini";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({
  content,
  timestamp,
  isSelf,
  senderName,
  isOptimistic,
}: {
  content: string;
  timestamp: string;
  isSelf: boolean;
  senderName?: string;
  isOptimistic?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={`flex gap-3 items-end group mb-4 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isSelf && (
        <Avatar seed={senderName ?? "Dokter"} variant="parent" size="sm" />
      )}
      <div className={`flex flex-col max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}>
        {!isSelf && senderName && (
          <span className="text-[11px] font-bold text-primary/70 mb-1 pl-1">{senderName}</span>
        )}
        <div
          className={`px-4 py-3 rounded-[1.25rem] text-[14px] font-semibold leading-relaxed shadow-sm ${
            isSelf
              ? "gradient-primary text-white rounded-br-sm"
              : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
          }`}
        >
          {content}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelf ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] font-semibold text-on-surface-variant/50">{formatTime(timestamp)}</span>
          {isSelf && <CheckCheck size={11} className="text-primary/50" />}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParentChatPage() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [inputText, setInputText] = useState("");
  const [optimisticMsgs, setOptimisticMsgs] = useState<
    { id: string; content: string; timestamp: string }[]
  >([]);
  const [sendError, setSendError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch consultation detail to show doctor info
  const { data: consultations } = useConsultationList();
  const consultation = (consultations ?? []).find(
    (c: Consultation) => c.id === consultationId
  );
  const medicName = (consultation?.users as any)?.name ?? "Dokter";

  const { data: messages, isLoading: msgsLoading } = useParentConsultationMessages(consultationId);
  const sendMut = useParentSendMessage(consultationId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMsgs]);

  // Remove optimistic msgs that have been confirmed by realtime
  useEffect(() => {
    if (messages && optimisticMsgs.length > 0) {
      setOptimisticMsgs([]);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !user || sendMut.isPending) return;

    setSendError(null);
    setInputText("");

    const optimisticId = `optimistic-${Date.now()}`;
    setOptimisticMsgs((prev) => [
      ...prev,
      { id: optimisticId, content: trimmed, timestamp: new Date().toISOString() },
    ]);

    try {
      await sendMut.mutateAsync({
        consultation_id: consultationId,
        sender_id: user.id,
        content: trimmed,
      });
      inputRef.current?.focus();
    } catch {
      setSendError("Gagal mengirim pesan. Coba lagi.");
      setOptimisticMsgs((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(trimmed);
    }
  }, [inputText, user, consultationId, sendMut]);

  const isClosed = consultation?.status === "CLOSED";

  // Group messages by date
  const allMessages = messages ?? [];
  let lastDate = "";

  return (
    <PageShell flush>
      <div className="flex flex-col h-[100dvh] lg:h-[calc(100vh-2rem)] max-w-2xl mx-auto lg:my-8 lg:rounded-[2rem] overflow-hidden bg-surface-warm shadow-elevated">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-5 py-4 bg-white border-b border-outline-variant/10 flex-shrink-0 shadow-sm z-10">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface-warm flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope size={18} className="text-primary" />
            </div>
            {!isClosed && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-extrabold text-on-surface truncate">{medicName}</h1>
            <p className="text-[11px] font-semibold text-on-surface-variant">
              {isClosed ? "Konsultasi selesai" : "Dokter • Online"}
            </p>
          </div>

          {isClosed && (
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500">
              Selesai
            </span>
          )}
        </div>

        {/* ── Chat Area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {msgsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allMessages.length === 0 && optimisticMsgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope size={28} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface text-[16px]">Mulai Konsultasi</p>
                <p className="text-[13px] text-on-surface-variant mt-1 max-w-xs">
                  Sapa dokter dan ceritakan kondisi anak Anda. Dokter akan merespon secepatnya.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {allMessages.map((m) => {
                const dateLabel = formatDate(m.created_at);
                const showDate = dateLabel !== lastDate;
                lastDate = dateLabel;
                return (
                  <React.Fragment key={m.id}>
                    {showDate && (
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 bg-surface-dim rounded-full text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <Bubble
                      content={m.content}
                      timestamp={m.created_at}
                      isSelf={m.sender_id === user?.id}
                      senderName={(m.users as any)?.name ?? medicName}
                    />
                  </React.Fragment>
                );
              })}
              {optimisticMsgs.map((m) => (
                <Bubble
                  key={m.id}
                  content={m.content}
                  timestamp={m.timestamp}
                  isSelf
                  isOptimistic
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>

        {/* ── Error Banner ── */}
        {sendError && (
          <div className="flex items-center gap-2 mx-4 mb-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-[12px] text-red-700 font-semibold flex-1">{sendError}</p>
            <button onClick={() => setSendError(null)} className="text-[11px] font-bold text-red-600 hover:text-red-700">Tutup</button>
          </div>
        )}

        {/* ── Input Area ── */}
        {isClosed ? (
          <div className="px-5 py-4 bg-surface-high border-t border-outline-variant/10 text-center text-[13px] font-bold text-on-surface-variant/60 flex-shrink-0">
            Konsultasi ini sudah ditutup oleh dokter
          </div>
        ) : (
          <div className="px-4 py-3 pb-safe bg-white border-t border-outline-variant/10 flex items-end gap-3 flex-shrink-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
              placeholder="Tulis pesan untuk dokter..."
              className="flex-1 resize-none bg-surface-warm rounded-2xl px-4 py-3 text-[14px] font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 max-h-[120px] placeholder:text-on-surface-variant/40"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!inputText.trim() || sendMut.isPending}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/30 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={17} className="ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
