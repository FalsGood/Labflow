"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterInput } from "@/lib/validators";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      addToast(json.error ?? "Registrasi gagal", "error");
      return;
    }
    setUser(json.data);
    addToast("Akun berhasil dibuat!", "success");
    window.location.href = "/dashboard/student";
  };

  const fields = [
    { name: "name" as const, label: "Nama Lengkap", placeholder: "Masukkan nama lengkap", type: "text" },
    { name: "email" as const, label: "Email", placeholder: "nama@sekolah.sch.id", type: "email" },
    { name: "nisnNip" as const, label: "NISN", placeholder: "10 digit NISN", type: "text" },
    { name: "phoneNumber" as const, label: "No. HP (opsional)", placeholder: "08xxxxxxxxxx", type: "tel" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Siswa</h1>
            <p className="text-slate-500 text-sm mt-1">Buat akun untuk meminjam peralatan lab</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                <input
                  {...register(f.name)}
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white text-slate-800"
                />
                {errors[f.name] && <p className="text-rose-600 text-xs mt-1 font-medium">{errors[f.name]?.message}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 karakter"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-12 bg-white text-slate-800"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Ulangi password"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white text-slate-800"
              />
              {errors.confirmPassword && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Buat Akun
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-emerald-700 font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
