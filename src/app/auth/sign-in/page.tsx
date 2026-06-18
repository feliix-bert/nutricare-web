"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Check } from "lucide-react";

type FormErrors = { email?: string; password?: string };

const validate = (email: string, password: string): FormErrors => {
  const errs: FormErrors = {};
  if (!email) errs.email = "Email wajib diisi.";
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Format email tidak valid.";
  if (!password) errs.password = "Password wajib diisi.";
  else if (password.length < 8) errs.password = "Password minimal 8 karakter.";
  return errs;
};

const FEATURES = [
  "Pantau tumbuh kembang anak secara real-time",
  "Analisis nutrisi MPASI berbasis kecerdasan buatan",
  "Catatan imunisasi & jadwal kesehatan lengkap",
];

export default function SignInPage() {
  const { login, isLoading, error } = useAuth();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(emailRef.current, passwordRef.current);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    await login({ email: emailRef.current, password: passwordRef.current });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ── Left panel — image + brand ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-shrink-0">
        {/* Photo */}
        <Image
          src="/image1.png"
          alt="TumbuhSehat"
          fill
          priority
          sizes="52vw"
          className="object-cover object-center"
        />

        {/* Deep bottom-to-top gradient so text on bottom is always legible */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,35,30,0.55) 0%, rgba(10,35,30,0.30) 35%, rgba(10,35,30,0.70) 70%, rgba(10,35,30,0.90) 100%)",
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          {/* Logo — top */}
          <div>
            <BrandLogo variant="compact" priority onDark />
          </div>

          {/* Copy — bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60 mb-4">
              Platform Gizi Anak Terpercaya
            </p>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.2] tracking-tight mb-5">
              Pantau Tumbuh Kembang<br />
              Si Kecil Setiap Hari
            </h2>
            <div className="flex flex-col gap-3">
              {FEATURES.map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </div>
                  <span className="text-sm text-white/80 leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>

            {/* Testimonial chip */}
            <div className="mt-8 inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-full">
              <div className="flex -space-x-2">
                {["A","B","C"].map((l) => (
                  <div key={l} className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-[9px] font-bold text-primary border-2 border-white/20">{l}</div>
                ))}
              </div>
              <span className="text-xs text-white/80 font-medium">10.000+ keluarga sudah bergabung</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden flex justify-center">
            <BrandLogo variant="full" priority />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[26px] font-extrabold text-on-surface tracking-tight leading-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-sm text-on-surface-variant mt-1.5">
              Masuk ke akun <span className="font-semibold text-primary">TumbuhSehat</span> Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            <div className="flex justify-end -mt-1">
              <button type="button" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                Lupa password?
              </button>
            </div>
            <Button type="submit" loading={isLoading} variant="glow" className="w-full mt-1">
              Masuk
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
