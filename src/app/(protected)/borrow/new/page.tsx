"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FlaskConical, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { ItemPublic } from "@/types";
import { Button } from "@/components/ui/Button";
import { ConditionBadge, StockBadge } from "@/components/ui/Badge";

export default function NewBorrowPage() {
  const router = useRouter();
  const { addToast } = useAppStore();

  const [items, setItems] = useState<ItemPublic[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [borrowDate, setBorrowDate] = useState("");
  const [returnExpectedDate, setReturnExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setBorrowDate(today);
    setReturnExpectedDate(nextWeek);

    fetch("/api/items?pageSize=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      addToast("Pilih peralatan yang ingin dipinjam", "warning");
      return;
    }
    if (!selectedItem || quantity > selectedItem.availableStock) {
      addToast(`Jumlah melebihi stok tersedia (${selectedItem?.availableStock ?? 0})`, "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantity: Number(quantity),
          borrowDate: new Date(borrowDate).toISOString(),
          returnExpectedDate: new Date(returnExpectedDate).toISOString(),
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal mengajukan peminjaman", "error");
        return;
      }

      addToast("Permintaan peminjaman berhasil diajukan!", "success");
      router.push("/dashboard/student");
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/student">
          <Button variant="outline" size="sm" className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ajukan Peminjaman Peralatan Lab</h1>
          <p className="text-xs text-slate-500">Lengkapi formulir peminjaman berikut dengan data yang valid.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
      >
        {loading ? (
          <div className="py-12 text-center text-slate-400">Memuat data peralatan...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Pilih Alat / Bahan Praktikum *
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              >
                <option value="">-- Pilih peralatan laboratorium --</option>
                {items
                  .filter((i) => !i.isDeleted)
                  .map((item) => (
                    <option key={item.id} value={item.id} disabled={item.availableStock <= 0}>
                      {item.name} ({item.itemCode}) — Stok Tersedia: {item.availableStock}
                    </option>
                  ))}
              </select>
            </div>

            {selectedItem && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">{selectedItem.name}</span>
                    <span className="text-xs text-emerald-700 font-mono font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedItem.itemCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Lokasi: {selectedItem.location}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <ConditionBadge condition={selectedItem.condition} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium mb-1">Ketersediaan</p>
                  <StockBadge available={selectedItem.availableStock} total={selectedItem.totalStock} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Jumlah Unit *
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedItem ? selectedItem.availableStock : 99}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Tanggal Pinjam *
                </label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Perkiraan Selesai *
                </label>
                <input
                  type="date"
                  value={returnExpectedDate}
                  onChange={(e) => setReturnExpectedDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Keperluan / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan tujuan peminjaman, nama kelompok, atau eksperimen yang dilakukan..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Permintaan akan diverifikasi terlebih dahulu oleh laboran.
              </div>
              <Button type="submit" loading={submitting} size="lg" className="gap-2 w-full sm:w-auto">
                <Send className="w-4 h-4" /> Kirim Pengajuan
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

