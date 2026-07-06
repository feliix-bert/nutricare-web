"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Send, X, MessageSquare, CheckCheck, Trash2 } from "lucide-react";
import {
  useConsultationList,
  useConsultationMessages,
  useSendConsultationMessage,
  useCloseConsultation,
  useDeleteConsultationMessage,
} from "@/features/medic/hooks/useConsultation";
import { MedicShell } from "@/components/layout/MedicShell";
import { Avatar } from "@/components/common/Avatar";
import { useAuthStore } from "@/stores/authStore";
import type { Consultation } from "@/features/medic/types/consultation.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function calcAge(birthDate: string) {
  const b = new Date(birthDate);
  const n = new Date();
  const m = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
  return m < 24 ? `${m} mo` : `${Math.floor(m / 12)} yr`;
}

// ─── Conversation Row ─────────────────────────────────────────────────────────
function ConvRow({ c, isActive, onClick }: { c: Consultation; isActive: boolean; onClick: () => void }) {
  const child = c.children;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all ${
        isActive ? "bg-teal-50 border-r-4 border-teal-500" : "hover:bg-slate-50 border-r-4 border-transparent"
      }`}
    >
      <div className="relative">
        <Avatar seed={child?.name ?? "P"} variant="parent" size="md" />
        {c.status === "OPEN" && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-extrabold truncate ${isActive ? "text-teal-900" : "text-slate-800"}`}>
            {child?.name ?? "Patient"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {formatTime(c.updated_at ?? c.created_at)}
          </span>
        </div>
        <p className={`text-xs truncate font-bold ${isActive ? "text-teal-600" : "text-slate-400"}`}>
          {c.status === "OPEN" ? "Active consultation" : "Completed"}
        </p>
      </div>
    </button>
  );
}

// ─── Message Bubble with Delete ───────────────────────────────────────────────
function Bubble({
  messageId,
  content,
  timestamp,
  isSelf,
  isDeleted,
  senderName,
  onDelete,
}: {
  messageId: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
  isDeleted?: boolean;
  senderName?: string;
  onDelete?: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isDeleted) {
    return (
      <div className={`flex gap-3 ${isSelf ? "flex-row-reverse" : "flex-row"} items-end mb-4`}>
        {!isSelf && <Avatar seed={senderName ?? "U"} variant="parent" size="sm" />}
        <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
          <div className="px-4 py-2.5 rounded-3xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-semibold italic text-slate-400">Pesan telah dihapus</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isSelf ? "flex-row-reverse" : "flex-row"} items-end group mb-4`}>
      {!isSelf && <Avatar seed={senderName ?? "U"} variant="parent" size="sm" />}
      <div className={`flex flex-col max-w-[70%] ${isSelf ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 py-3.5 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm ${
            isSelf
              ? "bg-teal-500 text-white rounded-br-sm"
              : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
          }`}
        >
          {content}
        </div>
        <div className={`flex items-center gap-2 mt-1.5 px-2 ${isSelf ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(timestamp)}
          </span>
          {isSelf && <CheckCheck size={12} className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
          {/* Delete button — only shows for own messages on hover */}
          {isSelf && onDelete && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-md border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-500">Hapus?</span>
                  <button
                    onClick={() => { onDelete(messageId); setShowDeleteConfirm(false); }}
                    className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 px-1"
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-[10px] font-extrabold text-slate-400 hover:text-slate-600 px-1"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition-colors"
                  title="Hapus pesan"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MedicConsultationsPage() {
  const user = useAuthStore((s) => s.user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [msg, setMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: consultations, isLoading: listLoading } = useConsultationList();
  const { data: messages, isLoading: msgsLoading } = useConsultationMessages(selectedId);
  const sendMut = useSendConsultationMessage(selectedId);
  const closeMut = useCloseConsultation();
  const deleteMut = useDeleteConsultationMessage(selectedId);

  const selected = (consultations ?? []).find((c: Consultation) => c.id === selectedId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = (consultations ?? []).filter((c: Consultation) => {
    const q = searchQ.toLowerCase();
    return (c.children?.name?.toLowerCase() ?? "").includes(q);
  });

  const doSend = async () => {
    if (!msg.trim() || !selectedId || !user) return;
    const t = msg.trim();
    setMsg("");
    await sendMut.mutateAsync({ consultation_id: selectedId, sender_id: user.id, content: t });
    inputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMut.mutate(messageId);
  };

  return (
    <MedicShell noPadding>
      <div className="flex flex-col md:flex-row h-full">

        {/* ── Left: Conversation List ── */}
        <aside className={`flex flex-col w-full md:w-80 lg:w-96 border-r border-slate-100 bg-white ${selectedId ? "hidden md:flex" : "flex"}`}>
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Messages</h1>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full rounded-full bg-slate-50 border-none pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="p-6 text-center text-slate-400 font-bold">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-bold">No conversations found.</div>
            ) : (
              filtered.map((c: Consultation) => (
                <ConvRow key={c.id} c={c} isActive={selectedId === c.id} onClick={() => setSelectedId(c.id)} />
              ))
            )}
          </div>
        </aside>

        {/* ── Right: Chat Area ── */}
        <div className={`flex-1 flex flex-col bg-slate-50 relative ${selectedId ? "flex" : "hidden md:flex"}`}>
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                <MessageSquare size={32} className="text-teal-200" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Your Messages</h2>
              <p className="text-sm font-bold text-slate-400">Select a conversation to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button className="md:hidden p-2 bg-slate-50 rounded-full" onClick={() => setSelectedId(null)}>
                    <X size={16} className="text-slate-500" />
                  </button>
                  <Avatar seed={selected?.children?.name ?? "P"} variant="parent" size="md" />
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 leading-none mb-1">
                      {selected?.children?.name ?? "Patient"}
                    </h2>
                    <p className="text-xs font-bold text-slate-400">
                      {selected?.children?.birth_date ? calcAge(selected.children.birth_date) : "—"} ·{" "}
                      <span className={selected?.status === "OPEN" ? "text-lime-500" : "text-slate-400"}>
                        {selected?.status === "OPEN" ? "Active" : "Closed"}
                      </span>
                    </p>
                  </div>
                </div>
                {selected?.status === "OPEN" && (
                  <button
                    onClick={() => { if (confirm("Tutup konsultasi ini?")) closeMut.mutate(selectedId!); }}
                    disabled={closeMut.isPending}
                    className="px-4 py-2 rounded-full bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors"
                  >
                    Close Chat
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {msgsLoading ? (
                  <div className="text-center text-slate-400 font-bold">Loading messages...</div>
                ) : !messages || messages.length === 0 ? (
                  <div className="text-center text-slate-400 font-bold mt-10">No messages yet. Say hello! 👋</div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <span className="px-4 py-1.5 bg-slate-200/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {relativeDate(messages[0].created_at)}
                      </span>
                    </div>
                    <AnimatePresence initial={false}>
                      {messages.map((m) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Bubble
                            messageId={m.id}
                            content={m.content}
                            timestamp={m.created_at}
                            isSelf={m.sender_id === user?.id}
                            isDeleted={(m as any).is_deleted ?? false}
                            senderName={(m.users as any)?.name}
                            onDelete={m.sender_id === user?.id ? handleDeleteMessage : undefined}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={endRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              {selected?.status === "OPEN" ? (
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
                      placeholder="Type your message... (Enter to send)"
                      className="flex-1 resize-none bg-slate-50 rounded-3xl px-5 py-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 max-h-32 shadow-inner"
                      onInput={(e) => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = "auto";
                        t.style.height = Math.min(t.scrollHeight, 128) + "px";
                      }}
                    />
                    <button
                      onClick={doSend}
                      disabled={!msg.trim() || sendMut.isPending}
                      className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-teal-600 hover:scale-105 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send size={18} className="ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 text-center text-sm font-bold text-slate-400">
                  This consultation is closed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MedicShell>
  );
}
