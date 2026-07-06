"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope, CheckCircle2, UserX } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { useChild, useUpdateChildMedic } from "@/features/children/hooks/useChildren";
import { useAvailableDoctors } from "@/features/medic/hooks/useDoctors";
import { cn } from "@/utils/cn";

export default function ChooseDoctorPage() {
  const router = useRouter();
  const { childId } = useParams<{ childId: string }>();

  const { data: child, isLoading: childLoading } = useChild(childId);
  const { data: doctors, isLoading: doctorsLoading } = useAvailableDoctors();
  const updateMedicMut = useUpdateChildMedic(childId);

  const [selectedMedicId, setSelectedMedicId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (child && !initialized) {
      setSelectedMedicId(child.medicId ?? null);
      setInitialized(true);
    }
  }, [child, initialized]);

  const handleSave = () => {
    updateMedicMut.mutate(selectedMedicId, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  if (childLoading) {
    return (
      <PageShell flush>
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!child) {
    return (
      <PageShell flush>
        <div className="flex items-center justify-center min-h-[100dvh]">
          <p className="text-on-surface-variant font-bold">Profil anak tidak ditemukan.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell flush>
      <div className="flex flex-col min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8 items-center bg-surface-warm/30 lg:bg-transparent">
        <div className="w-full max-w-md flex flex-col flex-1 lg:flex-none lg:rounded-[2.5rem] lg:bg-white lg:shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden lg:border lg:border-outline-variant/20 relative">

          {/* Header */}
          <div className="relative pt-12 pb-8 px-6 lg:px-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
            <button
              onClick={() => router.back()}
              className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-on-surface hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center mb-5 border-[6px] border-white/50 backdrop-blur-sm relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none" />
                <Stethoscope size={40} strokeWidth={1.5} className="text-primary" />
              </div>
              <h1 className="text-[1.75rem] leading-tight font-extrabold text-on-surface mb-2">
                Pilih Dokter
              </h1>
              <p className="text-[15px] leading-relaxed text-on-surface-variant max-w-[280px]">
                Pilih dokter pendamping untuk <span className="font-bold text-on-surface">{child.name}</span>.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 lg:px-8 pb-10 pt-4 bg-white lg:bg-transparent rounded-t-[2.5rem] lg:rounded-none relative z-10 overflow-y-auto">
            <div className="flex flex-col gap-4">
              
              {/* Skip option */}
              <button
                type="button"
                onClick={() => setSelectedMedicId(null)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                  selectedMedicId === null
                    ? "border-outline-variant/60 bg-slate-50"
                    : "border-outline-variant/20 bg-white hover:bg-slate-50/50"
                )}
              >
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0", selectedMedicId === null ? "bg-slate-200" : "bg-slate-100")}>
                  <UserX size={20} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface text-[15px]">Tidak menggunakan dokter</p>
                  <p className="text-[12px] text-on-surface-variant">Konsultasi hanya menggunakan AI NutriBot</p>
                </div>
                {selectedMedicId === null && <CheckCircle2 size={20} className="text-slate-400 flex-shrink-0" />}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-outline-variant/20" />
                <span className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Pilih Dokter</span>
                <div className="flex-1 h-px bg-outline-variant/20" />
              </div>

              {/* Doctor list */}
              {doctorsLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-[70px] rounded-2xl bg-surface-warm/60 animate-pulse" />
                  ))}
                </div>
              ) : !doctors || doctors.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant text-sm font-semibold">
                  Belum ada dokter terdaftar
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {doctors.map((doc) => {
                    const isSelected = selectedMedicId === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedMedicId(doc.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_4px_16px_rgba(45,138,126,0.12)]"
                            : "border-outline-variant/20 bg-white hover:bg-surface-warm/50 hover:border-outline-variant/40"
                        )}
                      >
                        <div className={cn(
                          "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-extrabold text-[15px]",
                          isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        )}>
                          {doc.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-bold text-[15px] truncate", isSelected ? "text-primary" : "text-on-surface")}>
                            {doc.name}
                          </p>
                          <p className="text-[12px] text-on-surface-variant font-semibold">
                            Dokter Gizi & Tumbuh Kembang
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 size={20} className="text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 mb-2">
                <Button
                  onClick={handleSave}
                  loading={updateMedicMut.isPending}
                  className="w-full h-[3.5rem] text-[1.05rem] font-extrabold rounded-[1.25rem] shadow-[0_8px_24px_rgba(45,138,126,0.25)] hover:shadow-[0_12px_28px_rgba(45,138,126,0.35)] transition-all"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
