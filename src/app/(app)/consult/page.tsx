"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, Send, Mic, Paperclip, Camera, Apple, Baby, Activity, Droplets, Sparkles, AlertCircle } from "lucide-react";
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
  {
    title: "Mencegah Stunting",
    desc: "Langkah 1000 HPK",
    icon: Activity,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Jadwal MPASI 6 Bulan",
    desc: "Panduan awal makan",
    icon: Baby,
    color: "bg-tertiary/10 text-tertiary-on-container",
  },
  {
    title: "ASI Eksklusif",
    desc: "Manfaat vs MPASI",
    icon: Droplets,
    color: "bg-secondary/10 text-secondary-on-container",
  },
  {
    title: "Kebutuhan Zat Besi",
    desc: "Penting untuk otak",
    icon: Apple,
    color: "bg-accent/10 text-accent",
  },
];

const MOCK_RESPONSES: Record<string, string> = {
  "mencegah stunting":
    "Stunting dapat dicegah dengan memastikan kecukupan gizi pada 1000 Hari Pertama Kehidupan (HPK). Berikan ASI Eksklusif selama 6 bulan pertama, lanjutkan dengan MPASI yang kaya protein hewani, serta jaga sanitasi lingkungan dan imunisasi lengkap.",
  "jadwal mpasi 6 bulan":
    "Untuk bayi usia 6 bulan, mulailah dengan pemberian MPASI 2 kali sehari dengan porsi 2–3 sendok makan sekali makan. Teksturnya harus lumat/halus (puree). Pastikan menu mengandung zat besi seperti hati ayam atau daging merah cincang halus.",
  "asi eksklusif":
    "ASI Eksklusif diberikan selama 6 bulan pertama tanpa tambahan makanan/minuman lain. Setelah 6 bulan, kebutuhan energi bayi meningkat dan tidak lagi tercukupi hanya dari ASI, sehingga wajib diperkenalkan MPASI secara bertahap sambil tetap meneruskan ASI hingga 2 tahun.",
  "kebutuhan zat besi":
    "Zat besi sangat krusial bagi perkembangan otak bayi dan mencegah anemia. Sumber zat besi hewani terbaik meliputi hati ayam, daging sapi cincang, dan kuning telur.",
  default:
    "Tentu Bunda, saya akan membantu menjawab pertanyaan tersebut! Mohon diingat bahwa saran ini bersifat edukatif dan umum.",
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
      className={`flex gap-3 my-5 ${isAi ? "justify-start" : "justify-end"}`}
    >
      {isAi && (
        <div className="flex-shrink-0 mt-auto mb-1">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow animate-pulse-soft">
            <Sparkles size={14} />
          </div>
        </div>
      )}
      
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-5 pt-4 pb-8 ${
          isAi
            ? "surface-glass shadow-card border border-white/40 text-on-surface rounded-[1.5rem] rounded-bl-sm"
            : "gradient-primary shadow-elevated text-white rounded-[1.5rem] rounded-br-sm"
        }`}
      >
        <p className="text-[14.5px] leading-relaxed font-medium">{item.text}</p>
        <span className={`absolute bottom-2.5 right-4 text-[10px] font-bold tracking-wider ${isAi ? "text-on-surface-variant/40" : "text-white/60"}`}>
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
      className="flex gap-3 my-5"
    >
      <div className="flex-shrink-0 mt-auto mb-1">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow">
          <Sparkles size={14} />
        </div>
      </div>
      <div className="px-5 py-4 surface-glass shadow-card border border-white/40 rounded-[1.5rem] rounded-bl-sm flex items-center h-[52px]">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ConsultPage() {
  const [messages, setMessages] = useState<Message[]>([]);
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
    }, 1500);
  };

  const isChatEmpty = messages.length === 0;

  return (
    <PageShell flush>
      <div className="flex items-center justify-center min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8 bg-surface-warm">
        <div className="flex flex-col w-full h-[100dvh] lg:h-[85vh] lg:max-w-4xl lg:rounded-[2.5rem] lg:shadow-elevated lg:border lg:border-white/50 bg-gradient-to-b from-primary-container/30 to-surface-warm overflow-hidden relative">
          
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 bg-transparent z-20 flex-shrink-0">
            <div className="flex items-center gap-3 interactive-card px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white">
                <Sparkles size={12} />
              </div>
              <h1 className="text-[14px] font-bold text-on-surface tracking-tight">TumbuhSehat AI</h1>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover-lift shadow-sm">
              <Avatar seed="Ibu Ani" variant="parent" size="xs" />
            </button>
          </div>

          {/* ── Chat & Welcome Area ── */}
          <div className="flex-1 overflow-y-auto px-5 lg:px-10 pb-36 relative z-10 no-scrollbar">
            
            <AnimatePresence mode="wait">
              {isChatEmpty ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center mt-8 lg:mt-16 h-full"
                >
                  {/* Big Glowing Orb */}
                  <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-soft" />
                    <div className="w-32 h-32 gradient-primary organic-blob shadow-glow animate-float z-10 flex items-center justify-center">
                      <Sparkles size={40} className="text-white/80" />
                    </div>
                  </div>

                  {/* Greeting */}
                  <div className="text-center mb-10 max-w-sm">
                    <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Halo, Bunda!</h2>
                    <p className="text-on-surface-variant text-[15px] font-medium leading-relaxed">
                      Saya adalah AI TumbuhSehat. Ada yang bisa saya bantu untuk si kecil hari ini?
                    </p>
                  </div>

                  {/* Automations / Prompt Cards */}
                  <div className="w-full max-w-lg grid grid-cols-2 gap-3">
                    {QUICK_PROMPTS.map((prompt, idx) => {
                      const Icon = prompt.icon;
                      return (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          key={prompt.title}
                          onClick={() => handleSend(prompt.title)}
                          className="flex flex-col text-left p-4 rounded-3xl bg-white shadow-card hover-lift border border-white/50"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${prompt.color}`}>
                            <Icon size={20} strokeWidth={2.5} />
                          </div>
                          <span className="font-bold text-[13.5px] text-on-surface mb-0.5 leading-tight">{prompt.title}</span>
                          <span className="text-[11px] font-semibold text-on-surface-variant/60">{prompt.desc}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="pt-4"
                >
                  {/* ── Warning Banner in Chat ── */}
                  <div className="bg-tertiary-container/60 border border-tertiary/20 px-4 py-3 rounded-2xl flex items-start gap-3 mb-6 mx-auto max-w-xl">
                    <AlertCircle size={16} className="text-tertiary-on-container flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <p className="text-[12px] text-tertiary-on-container leading-relaxed font-semibold">
                      Konsultasi AI ini hanya bersifat edukatif awal dan tidak menggantikan diagnosis dokter spesialis anak.
                    </p>
                  </div>

                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} item={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} className="h-4" />
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

          {/* ── Floating Input Area ── */}
          <div className="absolute bottom-24 lg:bottom-8 left-0 w-full px-4 lg:px-10 z-30 pointer-events-none flex justify-center">
            <div className="w-full max-w-3xl pointer-events-auto bg-surface-bright/80 backdrop-blur-xl border border-white shadow-elevated rounded-full px-2 py-2 flex items-center gap-1 transition-all hover:shadow-glow">
              
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-primary/5 transition-colors">
                <Paperclip size={20} strokeWidth={2} />
              </button>
              
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-primary/5 transition-colors">
                <Camera size={20} strokeWidth={2} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya TumbuhSehat AI..."
                className="flex-1 bg-transparent px-3 py-3 outline-none text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/40"
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
              />

              {inputText.trim() ? (
                <button 
                  onClick={() => handleSend(inputText)}
                  className="w-11 h-11 rounded-full gradient-primary shadow-md flex items-center justify-center text-white hover:scale-105 transition-transform"
                >
                  <Send size={18} className="ml-1" strokeWidth={2.5} />
                </button>
              ) : (
                <button className="w-11 h-11 rounded-full bg-surface-high flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Mic size={20} strokeWidth={2.5} />
                </button>
              )}

            </div>
          </div>
          
        </div>
      </div>
    </PageShell>
  );
}
