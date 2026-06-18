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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:overflow-auto">
      
      {/* ── Mobile UI (Ref Image 2) ── */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white">
        {/* Top curved header */}
        <div className="bg-[#2a4d3f] rounded-bl-[4rem] flex flex-col items-center justify-center pb-12 pt-20 relative overflow-hidden z-10 shadow-md">
           <div className="absolute top-10 right-10 w-8 h-8 bg-yellow-400 rounded-full opacity-50 blur-sm" />
           <div className="absolute bottom-10 -left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-50 blur-sm" />
           <div className="w-20 h-20 bg-[#ffc529] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
             <div className="flex gap-1.5 transform rotate-12">
               <div className="w-1.5 h-6 bg-white rounded-full" />
               <div className="w-1.5 h-8 bg-white rounded-full -mt-1" />
               <div className="w-1.5 h-6 bg-white rounded-full" />
             </div>
           </div>
           <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back!</h1>
        </div>

        {/* Form area */}
        <div className="flex-1 px-8 pt-10 pb-8 flex flex-col justify-center relative z-20 -mt-4 bg-white rounded-tr-[3rem]">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error && <p className="text-xs text-red-500 font-bold">{error.message}</p>}
            
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="johnwilliams@gmail.com"
                className="border-b border-[#ffc529] py-1.5 text-sm font-extrabold text-gray-900 focus:outline-none placeholder-gray-300"
                onChange={(e) => { emailRef.current = e.target.value; }}
              />
              {formErrors.email && <span className="text-[10px] text-red-500 mt-1">{formErrors.email}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <input 
                type="password" 
                className="border-b border-gray-200 focus:border-[#ffc529] py-1.5 text-sm font-extrabold text-gray-900 focus:outline-none transition-colors"
                onChange={(e) => { passwordRef.current = e.target.value; }}
              />
              {formErrors.password && <span className="text-[10px] text-red-500 mt-1">{formErrors.password}</span>}
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                   {/* checkmark placeholder */}
                </div>
                <span className="text-xs font-bold text-gray-600">Remember me</span>
              </label>
              <span className="text-xs font-bold text-gray-600">Forgot Password?</span>
            </div>

            <button type="submit" className="w-full bg-[#6a9071] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6a9071]/30 mt-4 active:scale-[0.98] transition-transform">
              {isLoading ? "LOADING..." : "LOGIN"}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-gray-500 mt-auto pt-8">
            Don&apos;t have an account? <Link href="/auth/register" className="text-gray-900">SIGN UP</Link>
          </p>
        </div>
        
        {/* Decorative background circles */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden lg:hidden">
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#ffc529] rounded-full" />
        </div>
      </div>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h2 className="text-3xl xl:text-[40px] font-medium text-white leading-[1.2] tracking-tight mb-3">
              Kami siap mendampingi tumbuh kembang si kecil.
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-3.5 bg-primary rounded-full" />
              <p className="text-[15px] font-medium text-white/80">
                Menghadirkan layanan gizi terbaik untuk keluarga.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
