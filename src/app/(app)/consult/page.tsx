"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { SendIcon } from "@/components/icons/send";
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
    "Untuk bayi usia 6 bulan, mulailah dengan pemberian MPASI 2 kali sehari dengan porsi 2-3 sendok makan sekali makan. Teksturnya harus lumat/halus (puree). Pastikan menu mengandung zat besi seperti hati ayam atau daging merah cincang halus.",
  "asi eksklusif vs mpasi":
    "ASI Eksklusif diberikan selama 6 bulan pertama tanpa tambahan makanan/minuman lain. Setelah 6 bulan, kebutuhan energi bayi meningkat dan tidak lagi tercukupi hanya dari ASI, sehingga wajib diperkenalkan MPASI secara bertahap sambil tetap meneruskan ASI hingga 2 tahun.",
  "kebutuhan zat besi":
    "Zat besi sangat krusial bagi perkembangan otak bayi dan mencegah anemia. Sumber zat besi hewani terbaik meliputi hati ayam, daging sapi cincang, dan kuning telur.",
  default:
    "Halo Bunda! Saya Gemini AI, konsultan kesehatan anak Anda. Untuk menjaga tumbuh kembang si kecil tetap optimal, pastikan ia mendapatkan makanan padat nutrisi tinggi protein hewani serta lakukan pemantauan berat dan tinggi badan secara berkala.",
};

function formatTimeLocal() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

let msgIdCounter = 100;

function MessageBubble({ item }: { item: Message }) {
  const isAi = item.sender === "ai";

  return (
    <div className={`flex gap-3 my-3 ${isAi ? "justify-start" : "justify-end"}`}>
      {isAi && <Avatar seed="gemini-ai" variant="ai" size="sm" className="self-end flex-shrink-0" />}
      <div
        className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
          isAi
            ? "bg-surface-lowest border border-outline-variant/15 rounded-bl-md"
            : "bg-primary text-white rounded-br-md"
        }`}
      >
        <p className={`text-base leading-relaxed ${isAi ? "text-on-surface" : "text-white"}`}>{item.text}</p>
        <p className={`text-xs mt-2 text-right ${isAi ? "text-outline" : "text-white/70"}`}>{item.time}</p>
      </div>
      {!isAi && <Avatar seed="Ibu Ani" variant="parent" size="sm" className="self-end flex-shrink-0" />}
    </div>
  );
}

export default function ConsultPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: "Halo Bunda! Saya konsultan AI GiziChain siap menjawab pertanyaan seputar tumbuh kembang, nutrisi MPASI, dan kesehatan si kecil. Ada yang bisa saya bantu hari ini?",
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
    }, 1000);
  };

  return (
    <PageShell title="Konsultasi AI" subtitle="Tanya seputar gizi dan tumbuh kembang" maxWidth="7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 min-h-[calc(100vh-8rem)]">
        <div className="lg:col-span-8 flex flex-col bg-surface-lowest rounded-3xl border border-outline-variant/15 overflow-hidden min-h-[70vh] lg:min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
              <Avatar seed="gemini-ai" variant="ai" size="md" />
              <div>
                <h1 className="text-base font-bold text-on-surface">Gemini Health Advisor</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-xs text-outline">Aktif</span>
                </div>
              </div>
            </div>
            <button className="w-9 h-9 rounded-full bg-surface-low flex items-center justify-center text-outline hover:bg-surface-dim transition-colors">
              <Info size={18} />
            </button>
          </div>

          <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex items-start gap-2">
            <Info size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-amber-900/90 leading-relaxed">
              Konsultasi AI ini bersifat edukatif dan tidak menggantikan diagnosis dari dokter anak.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} item={msg} />
            ))}
            {isTyping && (
              <div className="flex gap-3 my-3">
                <Avatar seed="gemini-ai" variant="ai" size="sm" />
                <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant/10 rounded-bl-md">
                  <span className="text-sm text-outline">Mengetik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-outline-variant/10 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanya konsultasi gizi di sini..."
              className="flex-1 bg-surface-low rounded-full px-5 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                inputText.trim() ? "bg-primary text-white" : "bg-surface-low text-outline opacity-60"
              }`}
            >
              <SendIcon size={18} />
            </button>
          </div>
        </div>

        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5">
          <div className="bg-primary-container/50 rounded-3xl p-6 border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-surface-lowest flex items-center justify-center text-primary">
                <MessageCircleIcon size={20} />
              </div>
              <h2 className="font-bold text-on-surface">Saran Pertanyaan</h2>
            </div>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-4 py-3 rounded-2xl bg-surface-lowest border border-outline-variant/10 hover:bg-white transition-colors text-sm font-semibold text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-secondary-container/40 rounded-3xl p-6 border border-secondary/10">
            <h3 className="font-bold text-on-surface mb-2">Tips Hari Ini</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Perkenalkan protein hewani (telur, ikan, daging) pada MPASI usia 6 bulan untuk mencegah defisiensi zat besi.
            </p>
          </div>
        </aside>
      </div>

      {messages.length === 1 && (
        <div className="lg:hidden mt-4 px-1">
          <p className="text-xs font-bold text-outline uppercase tracking-wide mb-2">Saran Pertanyaan</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="flex-shrink-0 px-4 py-2 rounded-full bg-primary-light/60 border border-primary/15 text-sm font-semibold text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
