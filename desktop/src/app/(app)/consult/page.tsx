"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, Sparkles, Send, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { MessageCircleIcon } from "@/components/icons/message-circle";

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
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 my-3 ${isAi ? "justify-start" : "justify-end"}`}
    >
      {isAi && (
        <div className="relative self-end flex-shrink-0">
          <Avatar seed="gemini-ai" variant="ai" size="sm" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] md:max-w-[68%] px-4 py-3 rounded-2xl transition-shadow ${
          isAi
            ? "bg-white border border-outline-variant/10 shadow-card rounded-bl-lg hover:shadow-card-hover"
            : "gradient-primary text-white shadow-card rounded-br-lg hover:shadow-elevated"
        }`}
      >
        <p className={`text-[14.5px] leading-relaxed ${isAi ? "text-on-surface" : "text-white"}`}>{item.text}</p>
        <p className={`text-[11px] mt-2 text-right ${isAi ? "text-on-surface-variant/40" : "text-white/50"}`}>{item.time}</p>
      </div>
      {!isAi && <Avatar seed="Ibu Ani" variant="parent" size="sm" className="self-end flex-shrink-0" />}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex gap-3 my-3"
    >
      <div className="relative self-end flex-shrink-0">
        <Avatar seed="gemini-ai" variant="ai" size="sm" />
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white" />
      </div>
      <div className="px-4 py-3.5 rounded-2xl bg-white border border-outline-variant/10 shadow-card rounded-bl-lg">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/50"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
          <span className="text-xs text-on-surface-variant ml-2 font-medium">Mengetik...</span>
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
      time: formatTimeLocal(),
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
    <PageShell title="Konsultasi AI" subtitle="Tanya seputar gizi dan tumbuh kembang" maxWidth="7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 min-h-[calc(100vh-8rem)]">

        {/* ── Chat Panel ── */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-[2rem] border border-outline-variant/8 shadow-card overflow-hidden min-h-[70vh] lg:min-h-0">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar seed="gemini-ai" variant="ai" size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-secondary border-2 border-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-on-surface tracking-tight">TumbuhSehat AI Advisor</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs text-on-surface-variant font-medium">Online · Siap Membantu</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/50 text-xs font-bold text-primary">
                <Sparkles size={11} />
                AI Powered
              </span>
              <button className="w-9 h-9 rounded-xl bg-white/70 border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/20 hover:border-primary/20 hover:scale-110 transition-all duration-300">
                <Info size={17} />
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-tertiary-container/20 border-b border-tertiary/8 px-5 py-2.5 flex items-start gap-2">
            <Leaf size={13} className="text-tertiary-on-container flex-shrink-0 mt-0.5" />
            <p className="text-xs text-tertiary-on-container/80 leading-relaxed font-medium">
              Konsultasi AI ini bersifat edukatif dan tidak menggantikan diagnosis dari dokter anak.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 bg-surface-warm/30">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} item={msg} />
              ))}
            </AnimatePresence>
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-outline-variant/8 bg-white">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya konsultasi gizi di sini..."
                className="flex-1 bg-surface-warm rounded-2xl px-5 py-3.5 text-sm outline-none border border-outline-variant/12 focus:border-primary/30 focus:ring-2 focus:ring-primary/8 transition-all duration-300 placeholder:text-on-surface-variant/40"
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim()}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  inputText.trim()
                    ? "gradient-primary text-white shadow-card hover:shadow-glow"
                    : "bg-surface-high text-on-surface-variant/30"
                }`}
              >
                <Send size={17} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-4">
          {/* Quick Prompts */}
          <Card variant="accent" className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center text-primary shadow-sm">
                <MessageCircleIcon size={18} />
              </div>
              <div>
                <h2 className="font-bold text-on-surface text-sm tracking-tight">Saran Pertanyaan</h2>
                <p className="text-xs text-on-surface-variant/60 font-medium">Pilih topik di bawah</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <motion.button
                  key={prompt}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSend(prompt)}
                  className="group text-left px-4 py-3 rounded-xl bg-white/80 border border-outline-variant/8 hover:bg-white hover:border-primary/20 hover:shadow-card transition-all duration-300 text-sm font-semibold text-primary flex items-center justify-between"
                >
                  <span>{prompt}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-primary transition-opacity duration-200">→</span>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Tip Hari Ini */}
          <Card variant="warm" className="p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-tertiary-container/60 flex items-center justify-center">
                <Sparkles size={15} className="text-tertiary-on-container" />
              </div>
              <h3 className="font-bold text-on-surface text-sm tracking-tight">Tips Hari Ini</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Perkenalkan protein hewani (telur, ikan, daging) pada MPASI usia 6 bulan untuk mencegah defisiensi zat besi dan mendukung perkembangan otak optimal.
            </p>
          </Card>



        </aside>
      </div>

      {/* Mobile quick prompts */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-4 px-1"
        >
          <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mb-2.5">Saran Pertanyaan</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {QUICK_PROMPTS.map((prompt) => (
              <motion.button
                key={prompt}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend(prompt)}
                className="group flex-shrink-0 px-4 py-2.5 rounded-full bg-primary-container/40 border border-primary/10 text-sm font-semibold text-primary hover:bg-primary-container/60 hover:border-primary/20 hover:shadow-sm transition-all duration-300"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </PageShell>
  );
}
