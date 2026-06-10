"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

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
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    const success = await register({
      name: nameRef.current.trim(),
      email: emailRef.current,
      password: passwordRef.current,
    });
    if (success) {
      alert("Pendaftaran Berhasil! Akun kamu sudah dibuat. Silakan masuk.");
      router.replace("/auth/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-secondary-container/30 border-r border-secondary/10">
        <div className="max-w-md text-center">
          <BrandLogo size="lg" align="center" priority className="mx-auto mb-8" />
          <h1 className="text-2xl font-bold text-secondary-on-container mb-3">Mulai Perjalanan Gizi</h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Catat MPASI, pantau pertumbuhan, dan dapatkan saran gizi dari AI — semua dalam satu tempat.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <BrandLogo size="sm" align="center" className="mx-auto mb-5 lg:hidden" />
            <button
              onClick={() => router.back()}
              className="text-sm font-semibold text-primary hover:underline mb-4"
            >
              ← Kembali
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Buat Akun</h1>
            <p className="text-sm text-outline mt-1">Daftar untuk mulai memantau tumbuh kembang anak</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-danger-light">
                <p className="text-sm font-medium text-danger">{error.message}</p>
              </div>
            )}

            <InputField
              label="Nama Lengkap"
              placeholder="Nama kamu"
              onChange={(e) => {
                nameRef.current = e.target.value;
              }}
              error={formErrors.name}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="contoh@email.com"
              onChange={(e) => {
                emailRef.current = e.target.value;
              }}
              error={formErrors.email}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              onChange={(e) => {
                passwordRef.current = e.target.value;
              }}
              error={formErrors.password}
              showPasswordToggle
            />

            <Button type="submit" loading={isLoading} className="mt-2 w-full">
              Daftar
            </Button>
          </form>

          <div className="flex justify-center items-center mt-8 gap-1.5">
            <span className="text-sm text-outline">Sudah punya akun?</span>
            <Link href="/auth/sign-in" className="text-sm font-bold text-primary hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
