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
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:overflow-auto">

      {/* ── Mobile UI ── */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white">

        {/* Hero image with overlay */}
        <div className="relative h-[46vh] min-h-[260px] flex-shrink-0 overflow-hidden">
          <Image
            src="/image1.png"
            alt="TumbuhSehat"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[center_25%]"
          />
          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(10,35,30,0.55) 0%, rgba(10,35,30,0.28) 40%, rgba(10,35,30,0.78) 80%, rgba(10,35,30,0.96) 100%)",
            }}
          />
          {/* Back button — top left */}
          <button
            onClick={() => router.back()}
            className="absolute top-10 left-6 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30 active:scale-90 transition-transform z-10"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          {/* Brand — centered vertically & horizontally in the image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-7 z-10">
            <BrandLogo variant="compact" priority onDark />
            <p className="text-white/75 text-sm font-medium leading-snug text-center">
              Daftar gratis &amp; mulai pantau gizi si kecil hari ini
            </p>
          </div>
        </div>

        {/* Form card — slides up over the image */}
        <div className="flex-1 bg-white rounded-t-[2.5rem] -mt-16 relative z-10 px-7 pt-8 pb-10 flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.10)]">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Buat Akun</h2>
          <p className="text-sm font-medium text-gray-500 mb-7">
            Bergabung dengan <span className="font-bold text-primary">TumbuhSehat</span> sekarang
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4 flex-1">
            {error && (
              <p className="text-xs text-red-500 font-semibold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                {error.message}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama kamu"
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary/50 focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400"
                onChange={(e) => { nameRef.current = e.target.value; }}
              />
              {formErrors.name && <span className="text-[11px] text-red-500 font-medium mt-0.5">{formErrors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                placeholder="contoh@email.com"
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary/50 focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400"
                onChange={(e) => { emailRef.current = e.target.value; }}
              />
              {formErrors.email && <span className="text-[11px] text-red-500 font-medium mt-0.5">{formErrors.email}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="Minimal 8 karakter"
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary/50 focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400"
                onChange={(e) => { passwordRef.current = e.target.value; }}
              />
              {formErrors.password && <span className="text-[11px] text-red-500 font-medium mt-0.5">{formErrors.password}</span>}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 mt-3 active:scale-[0.98] transition-all text-sm tracking-wide"
            >
              {isLoading ? "Memuat..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-xs font-semibold text-gray-500 mt-8">
            Sudah punya akun?{" "}
            <Link href="/auth/sign-in" className="font-bold text-primary">
              Masuk
            </Link>
          </p>
        </div>
      </div>

      {/* ── Desktop: Left panel ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-shrink-0">
        <Image
          src="/image1.png"
          alt="TumbuhSehat"
          fill
          priority
          quality={100}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-[center_25%]"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h2 className="text-3xl xl:text-[40px] font-medium text-white leading-[1.2] tracking-tight mb-3">
              Mulai perjalanan sehat si kecil bersama kami.
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-3.5 bg-primary rounded-full" />
              <p className="text-[15px] font-medium text-white/80">
                Akses fitur gizi dan kesehatan secara gratis.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Desktop: Right panel ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[380px]"
        >
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            Kembali
          </button>

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
