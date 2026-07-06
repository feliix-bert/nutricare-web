"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Clock, ChevronRight, Baby, Utensils, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

type SearchResult = {
  type: "child" | "nutrition" | "assessment";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const RECENT_KEY = "nutricare_recent_searches";

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(q: string) {
  const existing = getRecentSearches().filter((s) => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...existing].slice(0, 5)));
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) onClose(); // toggle — parent handles open
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const supabase = createClient();
        const q = query.toLowerCase();

        // Search children
        const { data: children } = await supabase
          .from("children")
          .select("id, name, birth_date")
          .ilike("name", `%${q}%`)
          .limit(5);

        const childResults: SearchResult[] = (children ?? []).map((c: any) => ({
          type: "child" as const,
          id: c.id,
          title: c.name,
          subtitle: `Anak · ${new Date(c.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
          href: `/children/${c.id}`,
        }));

        setResults([...childResults]);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    onClose();
    router.push(result.href);
  };

  const handleRecentSelect = (term: string) => {
    setQuery(term);
  };

  const typeIcon = (type: SearchResult["type"]) => {
    if (type === "child") return <Baby size={14} className="text-primary" />;
    if (type === "nutrition") return <Utensils size={14} className="text-amber-500" />;
    return <Activity size={14} className="text-teal-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              className="w-full max-w-xl bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] overflow-hidden pointer-events-auto"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama anak, assessment..."
                  className="flex-1 text-sm font-semibold text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="p-1 rounded-full hover:bg-slate-100">
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">
                  ESC
                </kbd>
              </div>

              {/* Results / Recent */}
              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="py-8 text-center text-slate-400 font-semibold text-sm">Mencari...</div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    <p className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hasil</p>
                    {results.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {typeIcon(r.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{r.title}</p>
                          <p className="text-xs font-semibold text-slate-400 truncate">{r.subtitle}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="py-8 text-center text-slate-400 font-semibold text-sm">
                    Tidak ditemukan hasil untuk &quot;{query}&quot;
                  </div>
                ) : recentSearches.length > 0 ? (
                  <div className="py-2">
                    <p className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pencarian Terakhir</p>
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleRecentSelect(s)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <Clock size={14} className="text-slate-300" />
                        <span className="text-sm font-semibold text-slate-600">{s}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 font-semibold text-sm">
                    Ketik untuk mencari anak, riwayat assessment...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
