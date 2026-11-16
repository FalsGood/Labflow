"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardCheck,
  RotateCcw,
  Users,
  Activity,
  BookOpen,
  History,
  FlaskConical,
  LogOut,
  ChevronRight,
  Shield,
  PlusCircle,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Command Center", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/admin/items", label: "Inventaris Alat", icon: <Package className="w-5 h-5" /> },
  { href: "/admin/categories", label: "Kategori Lab", icon: <Tags className="w-5 h-5" /> },
  { href: "/admin/approvals", label: "Persetujuan", icon: <ClipboardCheck className="w-5 h-5" /> },
  { href: "/admin/returns", label: "Pos Pengembalian", icon: <RotateCcw className="w-5 h-5" /> },
  { href: "/admin/users", label: "Direktori Pengguna", icon: <Users className="w-5 h-5" /> },
  { href: "/admin/logs", label: "Audit Trail Log", icon: <Activity className="w-5 h-5" /> },
];

const studentNav: NavItem[] = [
  { href: "/dashboard/student", label: "Dashboard Siswa", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/borrow/new", label: "Pinjam Alat Baru", icon: <PlusCircle className="w-5 h-5" /> },
  { href: "/catalog", label: "Katalog Inventaris", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/history", label: "Riwayat Peminjaman", icon: <History className="w-5 h-5" /> },
];

export function Sidebar() {
  const { user, setUser, addToast } = useAppStore();
  const pathname = usePathname();

  const navItems = user?.role === "admin" ? adminNav : studentNav;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    addToast("Berhasil keluar", "success");
    window.location.href = "/auth/login";
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-0.5">
            Lab<span className="text-emerald-400">Flow</span>
          </span>
          <p className="text-[10px] text-slate-400 font-medium">Smart Lab Management</p>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name.split(" ")[0]}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Shield className="w-3 h-3" />
                <span className="capitalize">{user.role === "admin" ? "Laboran / Admin" : "Siswa"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-200" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
