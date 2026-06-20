"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
};

const QUICK_PROMPTS = [
  "Mencegah Stunting",
  "Jadwal MPASI 6 Bulan",
  "ASI Eksklusif vs MPASI",
  "Kebutuhan Zat Besi",
];

const MOCK_RESPONSES: Record<string, string> = {
  "mencegah stunting":
    "Stunting dapat dicegah dengan memastikan kecukupan gizi pada 1000 Hari Pertama Kehidupan (HPK). Berikan ASI Eksklusif selama 6 bulan pertama, lanjutkan dengan MPASI yang kaya protein hewani, serta jaga sanitasi lingkungan dan imunisasi lengkap.",
  "jadwal mpasi 6 bulan":
    "Untuk bayi usia 6 bulan, mulailah dengan pemberian MPASI 2 kali sehari dengan porsi 2–3 sendok makan sekali makan. Teksturnya harus lumat/halus (puree). Pastikan menu mengandung zat besi seperti hati ayam atau daging merah cincang halus.",
  "asi eksklusif vs mpasi":
    "ASI Eksklusif diberikan selama 6 bulan pertama tanpa tambahan makanan/minuman lain. Setelah 6 bulan, kebutuhan energi bayi meningkat dan tidak lagi tercukupi hanya dari ASI, sehingga wajib diperkenalkan MPASI secara bertahap sambil tetap meneruskan ASI hingga 2 tahun.",
  "kebutuhan zat besi":
    "Zat besi sangat krusial bagi perkembangan otak bayi dan mencegah anemia. Sumber zat besi hewani terbaik meliputi hati ayam, daging sapi cincang, dan kuning telur.",
  default:
    "Halo Bunda! Saya konsultan AI TumbuhSehat, siap menjawab pertanyaan seputar tumbuh kembang, nutrisi MPASI, dan kesehatan si kecil. Ada yang bisa saya bantu hari ini?",
};

function formatTimeLocal() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

let msgIdCounter = 100;

function MessageBubble({ item }: { item: Message }) {
  const isAi = item.sender === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
        <p className="text-[14.5px] leading-relaxed">{item.text}</p>
        <span className={`absolute bottom-2 right-3 text-[10px] font-medium ${isAi ? "text-on-surface-variant/50" : "text-white/70"}`}>
          {item.time}
        </span>
      </div>

      {!isAi && (
        <Avatar seed="Ibu Ani" variant="parent" size="xs" className="self-end mb-1 border-none shadow-none" />
      )}
    </motion.div>
  );
}

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

export default function ConsultPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: "Halo Bunda! Saya konsultan AI TumbuhSehat siap menjawab pertanyaan seputar tumbuh kembang, nutrisi MPASI, dan kesehatan si kecil. Ada yang bisa saya bantu hari ini?",
      time: "12:00",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `msg_user_${msgIdCounter++}`,
      sender: "user",
      text,
      time: formatTimeLocal(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let responseText = MOCK_RESPONSES.default;
      for (const key of Object.keys(MOCK_RESPONSES)) {
        if (lowerText.includes(key)) {
          responseText = MOCK_RESPONSES[key];
          break;
        }
      }
      setMessages((prev) => [
        ...prev,
        { id: `msg_ai_${msgIdCounter++}`, sender: "ai", text: responseText, time: formatTimeLocal() },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <PageShell flush>
      <div className="flex items-center justify-center min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8">
      <div className="flex flex-col w-full h-[100dvh] lg:h-[85vh] lg:max-w-4xl lg:rounded-[2.5rem] lg:shadow-elevated lg:border lg:border-outline-variant/10 bg-surface-warm overflow-hidden relative">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-surface-warm border-b border-outline-variant/10 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar seed="gemini-ai" variant="ai" size="sm" className="bg-primary-container border-none shadow-none text-primary" />
            <div className="flex flex-col">
              <h1 className="text-[15px] font-bold text-on-surface tracking-tight leading-none mb-1">TumbuhSehat Advisor</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[11px] text-on-surface-variant font-semibold">Aktif</span>
              </div>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-on-surface-variant/5 flex items-center justify-center text-on-surface-variant hover:bg-on-surface-variant/10 transition-colors">
            <Info size={16} />
          </button>
        </div>

        {/* ── Warning Banner ── */}
        <div className="bg-tertiary-container/40 border-b border-tertiary/15 px-5 py-3 flex items-start gap-2.5 flex-shrink-0">
          <Info size={14} className="text-tertiary-on-container flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-[11px] md:text-[12px] text-tertiary-on-container leading-relaxed font-bold">
            Konsultasi AI ini hanya bersifat edukatif awal dan tidak menggantikan diagnosis atau saran keputusan medis dari dokter anak.
          </p>
        </div>

        {/* ── Chat Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-surface-warm">
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} item={msg} />
            ))}
          </AnimatePresence>
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Bottom Input Area ── */}
        <div className="bg-surface-warm pt-3 pb-24 lg:pb-6 px-4 flex flex-col gap-3 flex-shrink-0 border-t border-outline-variant/5">
          
          {/* Quick Prompts */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-on-surface-variant/50 uppercase tracking-widest pl-1">Saran Pertanyaan:</span>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex-shrink-0 px-4 py-2 bg-primary-container/30 border border-primary/10 rounded-full text-[13px] font-bold text-primary-on-container hover:bg-primary-container/50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-surface-high rounded-full flex items-center px-5 py-3.5 shadow-inner">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya konsultasi gizi di sini..."
                className="flex-1 bg-transparent outline-none text-[14px] text-on-surface font-medium placeholder:text-on-surface-variant/40"
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
              />
              <button 
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim()}
                className={`ml-2 w-7 h-7 flex items-center justify-center transition-all ${
                  inputText.trim() 
                    ? "text-primary scale-110" 
                    : "text-on-surface-variant/30"
                }`}
              >
                <Send size={18} className={inputText.trim() ? "ml-0.5" : ""} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
        </div>
        
      </div>
      </div>
    </PageShell>
  );
}
