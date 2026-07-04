import React from "react";
import { Info } from "lucide-react";

export const DisclaimerText = () => {
  return (
    <div className="bg-amber-500/5 border border-amber-500/25 rounded-[24px] p-4 flex flex-row items-start gap-3">
      <div className="bg-amber-500/10 p-2 rounded-full mt-0.5">
        <Info size={16} color="#b45309" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-0.5">
          Peringatan Klinis
        </p>
        <p className="text-[11px] text-amber-800/90 leading-4 font-semibold">
          Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.
        </p>
      </div>
    </div>
  );
};

