"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

type FormErrors = { email?: string; password?: string };

const validate = (email: string, password: string): FormErrors => {
  const errs: FormErrors = {};
  if (!email) errs.email = "Email wajib diisi.";
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Format email tidak valid.";
  if (!password) errs.password = "Password wajib diisi.";
  else if (password.length < 8) errs.password = "Password minimal 8 karakter.";
  return errs;
};

export default function SignInPage() {
  const { login, isLoading, error } = useAuth();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(emailRef.current, passwordRef.current);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    await login({ email: emailRef.current, password: passwordRef.current });
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-primary-container/40 border-r border-primary/10">
        <div className="max-w-md text-center">
          <BrandLogo size="lg" align="center" priority className="mx-auto mb-8" />
          <p className="text-base text-on-surface-variant leading-relaxed">
            Pantau tumbuh kembang dan gizi MPASI anak dengan bantuan AI — ramah untuk seluruh keluarga.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <BrandLogo size="lg" align="center" priority className="mx-auto" />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-on-surface">Masuk</h2>
            <p className="text-sm text-outline -mt-2">Selamat datang kembali</p>

            {error && (
              <div className="p-3.5 rounded-2xl bg-danger-light">
                <p className="text-sm font-medium text-danger">{error.message}</p>
              </div>
            )}

            <InputField
              label="Email"
              type="email"
              placeholder="example@email.com"
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
              Masuk
            </Button>
          </form>

          <div className="flex justify-center items-center mt-8 gap-1.5">
            <span className="text-sm text-outline">Belum punya akun?</span>
            <Link href="/auth/register" className="text-sm font-bold text-primary hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
