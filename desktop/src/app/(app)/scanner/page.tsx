"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Image as ImageIcon, ScanLine, Zap, Sparkles } from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        router.push("/scanner/analysis");
      }, 1200);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg, #1a2626 0%, #0d1a1a 100%)" }}>
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-3xl" aria-hidden />

      {/* Top Header */}
      <div className="flex flex-row justify-between items-center px-6 py-4 absolute top-0 left-0 right-0 z-10 pt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          aria-label="Kembali"
          className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/15 transition-colors border border-white/5"
        >
          <ArrowLeft size={20} color="#ffffff" />
        </motion.button>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-tertiary-light" />
          <span className="text-white font-bold text-base">AI Vision Scan</span>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Simulated Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center">
        {isUploading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 bg-white/10 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-3 border-primary/30 border-t-primary"
            />
            <span className="text-white font-bold text-sm">Mengupload Gambar...</span>
            <span className="text-xs text-white/50">Gemini sedang memproses data</span>
          </motion.div>
        ) : (
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-72 h-72 border-2 border-primary/40 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-6 text-center bg-white/5 backdrop-blur-sm"
          >
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-xl" />

            <div className="mb-3">
              <ScanLine size={56} className="text-primary/60" />
            </div>
            <span className="text-white/70 text-xs font-medium px-4 leading-relaxed">
              Posisikan piring makanan si kecil di dalam kotak ini
            </span>
          </motion.div>
        )}
      </div>

      {/* Camera Controls Panel */}
      <div className="px-6 pb-12 pt-6 flex flex-col gap-6 w-full relative z-10" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(13,26,26,0.95) 30%)" }}>
        <p className="text-white/40 text-xs text-center leading-relaxed max-w-sm mx-auto">
          Arahkan kamera ke MPASI buatan sendiri atau makanan si kecil untuk mendeteksi bahan makanan, porsi, dan taksiran kalori secara instan.
        </p>

        <div className="flex flex-row justify-around items-center w-full max-w-sm mx-auto">
          {/* Gallery Upload Option */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            aria-label="Pilih dari Galeri"
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/8 flex items-center justify-center hover:bg-white/15 transition-colors">
              <ImageIcon size={20} color="#ffffff" />
            </div>
            <span className="text-white/50 text-[10px] font-bold">Galeri</span>
          </motion.button>

          {/* Shutter Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            disabled={isUploading}
            aria-label="Ambil Foto"
            className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center p-1 disabled:opacity-50"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
          </motion.button>

          {/* Flash Toggle */}
          <button aria-label="Nyalakan Flash" className="flex flex-col items-center gap-1.5 opacity-40 cursor-not-allowed">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/8 flex items-center justify-center">
              <Zap size={20} color="#ffffff" />
            </div>
            <span className="text-white/50 text-[10px] font-bold">Flash</span>
          </button>
        </div>
      </div>
    </div>
  );
}
