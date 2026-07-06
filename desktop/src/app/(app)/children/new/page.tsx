"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Baby, Stethoscope, CheckCircle2, UserX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageShell } from "@/components/layout/PageShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateChild } from "@/features/children/hooks/useChildren";
import { useAvailableDoctors } from "@/features/medic/hooks/useDoctors";
import type { Gender } from "@/features/children/types/child.types";
import { cn } from "@/utils/cn";

const STEPS = ["info", "gender", "doctor"] as const;
type Step = (typeof STEPS)[number];

export default function NewChildPage() {
  const router = useRouter();
  const createChild = useCreateChild();
  const { data: doctors, isLoading: doctorsLoading } = useAvailableDoctors();

  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [selectedMedicId, setSelectedMedicId] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ name?: string; birthDate?: string; gender?: string }>({});

  const validateInfo = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateGender = () => {
    if (!gender) {
      setErrors({ gender: "Pilih jenis kelamin" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === "info" && validateInfo()) setStep("gender");
    else if (step === "gender" && validateGender()) setStep("doctor");
  };

  const handleSubmit = () => {
    if (!name || !birthDate || !gender) return;
    createChild.mutate(
      { name: name.trim(), birthDate, gender, medicId: selectedMedicId },
      { onSuccess: () => router.push("/") }
    );
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <PageShell flush>
      <div className="flex flex-col min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8 items-center bg-surface-warm/30 lg:bg-transparent">
        <div className="w-full max-w-md flex flex-col flex-1 lg:flex-none lg:rounded-[2.5rem] lg:bg-white lg:shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden lg:border lg:border-outline-variant/20 relative">

          {/* Header */}
          <div className="relative pt-12 pb-8 px-6 lg:px-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
            <button
              type="button"
              onClick={() => step === "info" ? router.back() : setStep(STEPS[stepIndex - 1])}
              className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-on-surface hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Step indicator */}
            <div className="absolute top-7 right-6 flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i <= stepIndex ? "bg-primary w-6" : "bg-outline-variant/30 w-3"
                  )}
                />
              ))}
            </div>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center mb-5 border-[6px] border-white/50 backdrop-blur-sm relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none" />
                {step === "doctor"
                  ? <Stethoscope size={40} strokeWidth={1.5} className="text-primary" />
                  : <Baby size={44} strokeWidth={1.5} className="text-primary" />
                }
              </div>
              <h1 className="text-[1.75rem] leading-tight font-extrabold text-on-surface mb-2">
                {step === "info" && "Profil Anak"}
                {step === "gender" && "Jenis Kelamin"}
                {step === "doctor" && "Pilih Dokter"}
              </h1>
              <p className="text-[15px] leading-relaxed text-on-surface-variant max-w-[280px]">
                {step === "info" && "Lengkapi data anak untuk mulai memantau tumbuh kembangnya."}
                {step === "gender" && "Pilih jenis kelamin anak Anda."}
                {step === "doctor" && "Pilih dokter yang akan mendampingi tumbuh kembang anak. Bisa diubah kapan saja."}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-6 lg:px-8 pb-10 pt-4 bg-white lg:bg-transparent rounded-t-[2.5rem] lg:rounded-none relative z-10 overflow-y-auto">
            <AnimatePresence mode="wait">

              {/* ── Step 1: Info ── */}
              {step === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-[15px] font-bold text-on-surface pl-1">Nama Panggilan</label>
                    <Input
                      placeholder="Mis. Budi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      isInvalid={!!errors.name}
                      className="bg-surface-warm/50 border-outline-variant/30 h-[54px] rounded-[1.25rem]"
                    />
                    {errors.name && <p className="text-xs font-medium text-danger pl-1 mt-0.5">{errors.name}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[15px] font-bold text-on-surface pl-1">Tanggal Lahir</label>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      isInvalid={!!errors.birthDate}
                      className="bg-surface-warm/50 border-outline-variant/30 h-[54px] rounded-[1.25rem] text-on-surface"
                    />
                    {errors.birthDate && <p className="text-xs font-medium text-danger pl-1 mt-0.5">{errors.birthDate}</p>}
                  </div>

                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-[3.5rem] text-[1.05rem] font-extrabold rounded-[1.25rem] shadow-[0_8px_24px_rgba(45,138,126,0.25)]"
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Gender ── */}
              {step === "gender" && (
                <motion.div
                  key="gender"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setGender("MALE")}
                      className={cn(
                        "flex flex-col items-center justify-center py-8 px-2 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden",
                        gender === "MALE"
                          ? "border-primary bg-primary/5 shadow-[0_4px_20px_rgba(45,138,126,0.12)] scale-[1.02]"
                          : "border-outline-variant/20 bg-surface-warm hover:border-outline-variant/40"
                      )}
                    >
                      <div className={cn("w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center mb-3 transition-colors", gender === "MALE" ? "bg-primary/10" : "bg-white shadow-sm")}>
                        <Baby size={28} strokeWidth={2} className={gender === "MALE" ? "text-primary" : "text-outline/70"} />
                      </div>
                      <span className={cn("text-[16px] font-bold", gender === "MALE" ? "text-primary" : "text-on-surface-variant")}>Laki-laki</span>
                      {gender === "MALE" && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setGender("FEMALE")}
                      className={cn(
                        "flex flex-col items-center justify-center py-8 px-2 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden",
                        gender === "FEMALE"
                          ? "border-[#e05a88] bg-[#e05a88]/5 shadow-[0_4px_20px_rgba(224,90,136,0.12)] scale-[1.02]"
                          : "border-outline-variant/20 bg-surface-warm hover:border-outline-variant/40"
                      )}
                    >
                      <div className={cn("w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center mb-3 transition-colors", gender === "FEMALE" ? "bg-[#e05a88]/10" : "bg-white shadow-sm")}>
                        <Baby size={28} strokeWidth={2} className={gender === "FEMALE" ? "text-[#e05a88]" : "text-outline/70"} />
                      </div>
                      <span className={cn("text-[16px] font-bold", gender === "FEMALE" ? "text-[#e05a88]" : "text-on-surface-variant")}>Perempuan</span>
                      {gender === "FEMALE" && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#e05a88] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  </div>
                  {errors.gender && <p className="text-xs font-medium text-danger pl-1">{errors.gender}</p>}

                  <div className="mt-2">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-[3.5rem] text-[1.05rem] font-extrabold rounded-[1.25rem] shadow-[0_8px_24px_rgba(45,138,126,0.25)]"
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Pilih Dokter ── */}
              {step === "doctor" && (
                <motion.div
                  key="doctor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
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
                      <p className="font-bold text-on-surface text-[15px]">Lewati dulu</p>
                      <p className="text-[12px] text-on-surface-variant">Pilih dokter nanti dari profil anak</p>
                    </div>
                    {selectedMedicId === null && <CheckCircle2 size={20} className="text-slate-400 flex-shrink-0" />}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-outline-variant/20" />
                    <span className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Atau pilih dokter</span>
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
                            {/* Avatar */}
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
                      type="button"
                      onClick={handleSubmit}
                      loading={createChild.isPending}
                      className="w-full h-[3.5rem] text-[1.05rem] font-extrabold rounded-[1.25rem] shadow-[0_8px_24px_rgba(45,138,126,0.25)] hover:shadow-[0_12px_28px_rgba(45,138,126,0.35)] transition-all"
                    >
                      Simpan Profil Anak
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
