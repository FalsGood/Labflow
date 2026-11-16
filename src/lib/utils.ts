import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMMM yyyy", { locale: localeId });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: localeId });
}

export function generateTransactionCode(): string {
  const now = new Date();
  const dateStr = format(now, "yyyyMMdd");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `TRX-${dateStr}-${random}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
    approved: "bg-sky-100 text-sky-900 border-sky-300 font-semibold",
    rejected: "bg-slate-100 text-slate-700 border-slate-300",
    borrowed: "bg-rose-100 text-rose-800 border-rose-300 font-bold", // "Ambil" style
    returned: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold", // "Masuk" style
    overdue: "bg-rose-600 text-white border-rose-700 font-extrabold shadow-sm animate-pulse",
  };
  return map[status] ?? "bg-slate-100 text-slate-800 border-slate-200";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
    borrowed: "Dipinjam (Keluar)",
    returned: "Kembali (Masuk)",
    overdue: "Terlambat / Menipis",
  };
  return map[status] ?? status;
}

export function getConditionLabel(condition: string): string {
  const map: Record<string, string> = {
    baik: "Baik",
    rusak_ringan: "Rusak Ringan",
    rusak_berat: "Rusak Berat",
  };
  return map[condition] ?? condition;
}

export function getConditionColor(condition: string): string {
  const map: Record<string, string> = {
    baik: "bg-emerald-100 text-emerald-800 border-emerald-300",
    rusak_ringan: "bg-amber-100 text-amber-800 border-amber-300",
    rusak_berat: "bg-rose-100 text-rose-800 border-rose-300",
  };
  return map[condition] ?? "bg-slate-100 text-slate-800";
}

export function isOverdue(returnExpectedDate: string | Date): boolean {
  return new Date() > new Date(returnExpectedDate);
}
