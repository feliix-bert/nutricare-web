"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, CheckCircle2, AlertTriangle, Clock, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChildrenList } from "@/features/children/hooks/useChildren";

type Notif = {
  id: string;
  type: "assessment_done" | "reminder" | "alert";
  title: string;
  body: string;
  href: string;
  time: string;
  read: boolean;
};

function buildNotifications(children: any[]): Notif[] {
  const notifs: Notif[] = [];

  children.forEach((child) => {
    const pred = child.latestPrediction;

    if (pred?.status === "STUNTED" || pred?.status === "SEVERELY_STUNTED") {
      notifs.push({
        id: `alert-${child.id}`,
        type: "alert",
        title: `⚠️ Perhatian: ${child.name}`,
        body: `Status gizi ${pred.status === "STUNTED" ? "stunting" : "stunting parah"}. Segera konsultasi dengan dokter.`,
        href: `/children/${child.id}`,
        time: "Baru saja",
        read: false,
      });
    } else if (pred?.status === "AT_RISK") {
      notifs.push({
        id: `risk-${child.id}`,
        type: "alert",
        title: `${child.name} Perlu Perhatian`,
        body: "Status gizi berisiko. Pantau perkembangan dan lakukan assessment rutin.",
        href: `/children/${child.id}`,
        time: "Hari ini",
        read: false,
      });
    } else if (!pred) {
      notifs.push({
        id: `reminder-${child.id}`,
        type: "reminder",
        title: `Mulai Assessment: ${child.name}`,
        body: "Belum ada data assessment. Lakukan pengukuran pertama sekarang.",
        href: `/children/${child.id}/assessment/body-size`,
        time: "Segera",
        read: false,
      });
    } else {
      notifs.push({
        id: `done-${child.id}`,
        type: "assessment_done",
        title: `${child.name} Tumbuh Sehat`,
        body: "Status gizi normal. Lanjutkan pola makan seimbang dan pemantauan rutin.",
        href: `/children/${child.id}`,
        time: "Hari ini",
        read: true,
      });
    }
  });

  return notifs;
}

const ICON_MAP = {
  assessment_done: <CheckCircle2 size={16} className="text-teal-500" />,
  reminder: <Clock size={16} className="text-amber-500" />,
  alert: <AlertTriangle size={16} className="text-rose-500" />,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function NotificationPanel({ isOpen, onClose }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const { data } = useChildrenList();
  const children = data?.data ?? [];

  const notifications = buildNotifications(children);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/10"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
            className="fixed top-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.10)] border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-700" />
                <h3 className="text-sm font-extrabold text-slate-800">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-extrabold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            {/* Notif List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { onClose(); router.push(n.href); }}
                    className={`w-full flex items-start gap-3 px-5 py-4 border-b border-slate-50 last:border-none text-left transition-colors hover:bg-slate-50 ${!n.read ? "bg-primary/3" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {ICON_MAP[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug mb-0.5 ${!n.read ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 leading-snug line-clamp-2">{n.body}</p>
                      <p className="text-[10px] font-bold text-slate-300 mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
