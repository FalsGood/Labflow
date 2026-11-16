"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/lib/validators";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Eye, EyeOff, FlaskConical, Lock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { setUser, addToast } = useAppStore();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Email atau password salah", "error");
        return;
      }
      setUser(json.data);
      addToast(`Selamat datang, ${json.data.name}!`, "success");
      const targetUrl = json.data.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
      window.location.href = targetUrl;
    } catch {
      addToast("Terjadi kesalahan koneksi ke server", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-emerald-100">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk ke LabFlow</h1>
            <p className="text-slate-500 text-xs mt-1 text-center">
              Sistem Informasi Manajemen & Peminjaman Inventaris Laboratorium
            </p>
          </div>

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nama@sekolah.sch.id"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 transition-all bg-white"
                />
              </div>
              {errors.email && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full gap-2 mt-2" size="md">
              Masuk ke Sistem <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Footer note & link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Belum memiliki akun siswa?{" "}
              <Link href="/auth/register" className="text-emerald-700 font-semibold hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
