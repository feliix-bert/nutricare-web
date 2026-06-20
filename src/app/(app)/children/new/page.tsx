"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Baby } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateChild } from "@/features/children/hooks/useChildren";
import type { Gender } from "@/features/children/types/child.types";
import { cn } from "@/utils/cn";

export default function NewChildPage() {
  const router = useRouter();
  const createChild = useCreateChild();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    birthDate?: string;
    gender?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
    if (!gender) newErrors.gender = "Pilih jenis kelamin";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createChild.mutate(
      { name: name.trim(), birthDate, gender: gender! },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  return (
    <PageShell flush>
      <div className="flex flex-col min-h-[100dvh] lg:min-h-[calc(100vh-2rem)] lg:py-8 items-center bg-surface-warm/30 lg:bg-transparent">
        <div className="w-full max-w-md flex flex-col flex-1 lg:flex-none lg:rounded-[2.5rem] lg:bg-white lg:shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden lg:border lg:border-outline-variant/20 relative">
          
          {/* Header */}
          <div className="relative pt-12 pb-8 px-6 lg:px-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-on-surface hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center mb-5 border-[6px] border-white/50 backdrop-blur-sm relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none" />
                <Baby size={44} strokeWidth={1.5} className="text-primary" />
              </div>
              <h1 className="text-[1.75rem] leading-tight font-extrabold text-on-surface mb-2">Profil Anak</h1>
              <p className="text-[15px] leading-relaxed text-on-surface-variant max-w-[280px]">
                Lengkapi data anak untuk mulai memantau tumbuh kembangnya.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-6 lg:px-8 pb-10 pt-2 bg-white lg:bg-transparent rounded-t-[2.5rem] lg:rounded-none relative z-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
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

              <div className="flex flex-col gap-3 mt-2">
                <label className="text-[15px] font-bold text-on-surface pl-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={cn(
                      "flex flex-col items-center justify-center py-5 px-2 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden",
                      gender === 'MALE'
                        ? "border-primary bg-primary/5 shadow-[0_4px_20px_rgba(45,138,126,0.12)] scale-[1.02]"
                        : "border-outline-variant/20 bg-surface-warm hover:border-outline-variant/40"
                    )}
                  >
                    <div className={cn(
                      "w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center mb-3 transition-colors",
                      gender === 'MALE' ? "bg-primary/10" : "bg-white shadow-sm"
                    )}>
                      <Baby size={26} strokeWidth={2} className={gender === 'MALE' ? "text-primary" : "text-outline/70"} />
                    </div>
                    <span className={cn(
                      "text-[15px] font-bold",
                      gender === 'MALE' ? "text-primary" : "text-on-surface-variant"
                    )}>Laki-laki</span>
                    
                    {gender === 'MALE' && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={cn(
                      "flex flex-col items-center justify-center py-5 px-2 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden",
                      gender === 'FEMALE'
                        ? "border-[#e05a88] bg-[#e05a88]/5 shadow-[0_4px_20px_rgba(224,90,136,0.12)] scale-[1.02]" 
                        : "border-outline-variant/20 bg-surface-warm hover:border-outline-variant/40"
                    )}
                  >
                    <div className={cn(
                      "w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center mb-3 transition-colors",
                      gender === 'FEMALE' ? "bg-[#e05a88]/10" : "bg-white shadow-sm"
                    )}>
                      <Baby size={26} strokeWidth={2} className={gender === 'FEMALE' ? "text-[#e05a88]" : "text-outline/70"} />
                    </div>
                    <span className={cn(
                      "text-[15px] font-bold",
                      gender === 'FEMALE' ? "text-[#e05a88]" : "text-on-surface-variant"
                    )}>Perempuan</span>

                    {gender === 'FEMALE' && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#e05a88] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                </div>
                {errors.gender && <p className="text-xs font-medium text-danger pl-1 mt-1">{errors.gender}</p>}
              </div>

              <div className="mt-8 mb-2">
                <Button 
                  type="submit" 
                  className="w-full h-[3.5rem] text-[1.05rem] font-extrabold rounded-[1.25rem] shadow-[0_8px_24px_rgba(45,138,126,0.25)] hover:shadow-[0_12px_28px_rgba(45,138,126,0.35)] transition-all"
                  isLoading={createChild.isPending}
                >
                  Simpan Profil
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
