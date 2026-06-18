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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden lg:overflow-auto">

      {/* ── Mobile UI (Ref Image 2) ── */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white">
        {/* Top curved header */}
        <div className="bg-[#2a4d3f] rounded-bl-[4rem] flex items-center px-6 pb-12 pt-16 relative overflow-hidden z-10 shadow-md">
           <div className="absolute top-8 right-12 w-10 h-10 bg-yellow-400 rounded-full opacity-50 blur-sm" />
           <div className="absolute -bottom-2 -left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-50 blur-sm" />
           <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center bg-[#ffc529] rounded-full text-[#2a4d3f] shadow-sm active:scale-95 transition-transform z-10">
             <ArrowLeft size={16} strokeWidth={3} />
           </button>
           <h1 className="text-[22px] font-extrabold text-white tracking-tight ml-4 z-10">Create Account</h1>
        </div>

        {/* Form area */}
        <div className="flex-1 px-8 pt-10 pb-8 flex flex-col relative z-20 -mt-4 bg-white rounded-tr-[3rem]">
          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            {error && <p className="text-xs text-red-500 font-bold">{error.message}</p>}
            
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
              <input 
                type="text" 
                placeholder="John Williams"
                className="border-b border-[#ffc529] py-1.5 text-sm font-extrabold text-gray-900 focus:outline-none placeholder-gray-300"
                onChange={(e) => { nameRef.current = e.target.value; }}
              />
              {formErrors.name && <span className="text-[10px] text-red-500 mt-1">{formErrors.name}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <input 
                type="email" 
                className="border-b border-gray-200 focus:border-[#ffc529] py-1.5 text-sm font-extrabold text-gray-900 focus:outline-none transition-colors"
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

            <button type="submit" className="w-full bg-[#6a9071] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6a9071]/30 mt-6 active:scale-[0.98] transition-transform">
              {isLoading ? "LOADING..." : "LOGIN"}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-gray-500 mt-auto pt-8">
            Already have an account? <Link href="/auth/sign-in" className="text-gray-900">LOGIN</Link>
          </p>
        </div>

        {/* Decorative background circles */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden lg:hidden">
          <div className="absolute top-1/3 -right-20 w-[350px] h-[350px] bg-[#ffc529] rounded-full" />
        </div>
      </div>

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

      {/* ── Right panel ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
