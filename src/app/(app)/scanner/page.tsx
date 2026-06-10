"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, ScanLine, Zap } from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // Trigger the hidden file input which opens the native camera or file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload delay
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
    <div className="flex flex-col h-screen bg-black relative overflow-hidden text-white">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Top Header */}
      <div className="flex flex-row justify-between items-center px-6 py-4 absolute top-0 left-0 right-0 z-10 pt-8">
        <button
          onClick={handleGoBack}
          aria-label="Kembali"
          className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={20} color="#ffffff" />
        </button>
        <span className="text-white font-bold text-base">AI Vision Scan</span>
        <div className="w-10 h-10" />
      </div>

      {/* Simulated Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center">
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 bg-black/70 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
            <div className="animate-bounce">
              <span className="text-4xl">⚡</span>
            </div>
            <span className="text-white font-bold text-sm">Mengupload Gambar...</span>
            <span className="text-xs text-gray-400">Gemini sedang memproses data</span>
          </div>
        ) : (
          <div className="w-72 h-72 border-2 border-primary border-dashed rounded-[32px] flex flex-col items-center justify-center opacity-65 p-6 text-center bg-black/20">
            <ScanLine size={64} color="#3e646a" className="mb-3" />
            <span className="text-white text-xs font-medium px-4">
              Posisikan piring makanan si kecil di dalam kotak ini
            </span>
          </div>
        )}
      </div>

      {/* Camera Controls Panel */}
      <div className="px-6 pb-12 pt-6 bg-zinc-900 border-t border-zinc-800 flex flex-col gap-6 w-full">
        <p className="text-zinc-400 text-xs text-center leading-4 max-w-sm mx-auto">
          Arahkan kamera ke MPASI buatan sendiri atau makanan si kecil untuk mendeteksi bahan makanan, porsi, dan taksiran kalori secara instan.
        </p>

        <div className="flex flex-row justify-around items-center w-full max-w-sm mx-auto">
          {/* Gallery Upload Option */}
          <button
            onClick={handleCapture} // On web, we use the same input for both
            aria-label="Pilih dari Galeri"
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">
              <ImageIcon size={20} color="#ffffff" />
            </div>
            <span className="text-zinc-400 text-[10px] font-bold">Galeri</span>
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={isUploading}
            aria-label="Ambil Foto"
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-gray-200 transition-colors" />
          </button>

          {/* Flash Toggle */}
          <button aria-label="Nyalakan Flash" className="flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <Zap size={20} color="#ffffff" />
            </div>
            <span className="text-zinc-400 text-[10px] font-bold">Flash</span>
          </button>
        </div>
      </div>
    </div>
  );
}
