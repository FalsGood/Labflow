"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  History,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, setUser, addToast } = useAppStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    addToast("Berhasil keluar", "success");
    window.location.href = "/auth/login";
  };

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/catalog", label: "Katalog Inventaris" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with emerald/teal theme */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                Lab<span className="text-emerald-600">Flow</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Smart Lab Inventory System
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg",
                  pathname === link.href
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/student"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard ({user.role === "admin" ? "Admin" : "Siswa"})
                </Link>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-sm"
                >
                  Daftar Siswa
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-3 space-y-2 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 font-medium text-slate-700 hover:text-emerald-700"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/student"}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-emerald-700 font-bold"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block py-2 text-rose-600 font-semibold w-full text-left"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-slate-700"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-emerald-700 font-bold"
                  >
                    Daftar Akun
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
