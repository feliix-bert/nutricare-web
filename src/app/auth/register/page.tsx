"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Check, ArrowLeft } from "lucide-react";

type FormErrors = { name?: string; email?: string; password?: string };

const validate = (name: string, email: string, password: string): FormErrors => {
  const errs: FormErrors = {};
  if (!name.trim()) errs.name = "Nama wajib diisi.";
  if (!email) errs.email = "Email wajib diisi.";
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Format email tidak valid.";
  if (!password) errs.password = "Password wajib diisi.";
  else if (password.length < 8) errs.password = "Password minimal 8 karakter.";
  return errs;
};

const BENEFITS = [
  "Pemantauan berat & tinggi badan dengan grafik WHO",
  "Scan & analisis MPASI otomatis berbasis AI",
  "Konsultasi gizi kapan saja langsung dari aplikasi",
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(nameRef.current, emailRef.current, passwordRef.current);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    const success = await register({
      name: nameRef.current.trim(),
      email: emailRef.current,
      password: passwordRef.current,
    });
    if (success) {
      alert("Pendaftaran berhasil! Silakan masuk.");
      router.replace("/auth/sign-in");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-shrink-0">
        <Image
          src="/image1.png"
          alt="TumbuhSehat"
          fill
          priority
          sizes="52vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,35,30,0.55) 0%, rgba(10,35,30,0.28) 30%, rgba(10,35,30,0.72) 68%, rgba(10,35,30,0.92) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <BrandLogo variant="compact" priority onDark />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60 mb-4">
              Bergabung Sekarang
            </p>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.2] tracking-tight mb-5">
              Mulai Perjalanan Sehat<br />
              Si Kecil Bersama Kami
            </h2>
            <div className="flex flex-col gap-3">
              {BENEFITS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </div>
                  <span className="text-sm text-white/80 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-full">
              <div className="flex -space-x-2">
                {["D","E","F"].map((l) => (
                  <div key={l} className="w-6 h-6 rounded-full bg-secondary-light flex items-center justify-center text-[9px] font-bold text-secondary-on-container border-2 border-white/20">{l}</div>
                ))}
              </div>
              <span className="text-xs text-white/80 font-medium">Gratis untuk keluarga Indonesia</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="mb-6 lg:hidden flex justify-center">
            <BrandLogo variant="full" priority />
          </div>

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            Kembali
          </button>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[26px] font-extrabold text-on-surface tracking-tight leading-tight">
              Buat Akun TumbuhSehat
            </h1>
            <p className="text-sm text-on-surface-variant mt-1.5">
              Daftar gratis dan mulai pantau gizi si kecil
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-danger bg-danger-light px-4 py-3 rounded-xl border border-danger/12"
              >
                {error.message}
              </motion.p>
            )}
            <InputField
              label="Nama Lengkap"
              placeholder="Nama kamu"
              onChange={(e) => { nameRef.current = e.target.value; }}
              error={formErrors.name}
            />
            <InputField
              label="Email"
              type="email"
              placeholder="contoh@email.com"
              onChange={(e) => { emailRef.current = e.target.value; }}
              error={formErrors.email}
            />
            <InputField
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              onChange={(e) => { passwordRef.current = e.target.value; }}
              error={formErrors.password}
              showPasswordToggle
            />
            <Button type="submit" loading={isLoading} variant="glow" className="w-full mt-1">
              Daftar Sekarang
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Sudah punya akun?{" "}
            <Link href="/auth/sign-in" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Masuk
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
