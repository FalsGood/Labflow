"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  PlusCircle,
  Calendar,
  XCircle,
  ArrowRight,
  BookOpen,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { BorrowingPublic, ItemPublic } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

function StudentDashboardContent() {
  const { user, addToast } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [borrowings, setBorrowings] = useState<BorrowingPublic[]>([]);
  const [items, setItems] = useState<ItemPublic[]>([]);
  const [loading, setLoading] = useState(true);

  // New borrow modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [borrowDate, setBorrowDate] = useState("");
  const [returnExpectedDate, setReturnExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cancel modal state
  const [cancelModalItem, setCancelModalItem] = useState<BorrowingPublic | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setBorrowDate(today);
    setReturnExpectedDate(nextWeek);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resBorrowings, resItems] = await Promise.all([
        fetch("/api/borrowings?pageSize=20"),
        fetch("/api/items?pageSize=100"),
      ]);

      const [dataBorrowings, dataItems] = await Promise.all([
        resBorrowings.json(),
        resItems.json(),
      ]);

      if (dataBorrowings.success) setBorrowings(dataBorrowings.data);
      if (dataItems.success) setItems(dataItems.data);
    } catch {
      addToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const borrowParam = searchParams.get("borrow");
    if (borrowParam) {
      setSelectedItemId(borrowParam);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleSubmitBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      addToast("Pilih peralatan yang ingin dipinjam", "warning");
      return;
    }
    if (!selectedItem || quantity > selectedItem.availableStock) {
      addToast(`Jumlah melebihi stok yang tersedia (${selectedItem?.availableStock ?? 0})`, "error");
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
      setIsModalOpen(false);
      setSelectedItemId("");
      setNotes("");
      setQuantity(1);
      fetchData();
      router.replace("/dashboard/student");
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/borrowings/${cancelModalItem.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal membatalkan permintaan", "error");
        return;
      }
      addToast("Permintaan peminjaman berhasil dibatalkan", "success");
      setCancelModalItem(null);
      fetchData();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setCancelling(false);
    }
  };

  const pendingCount = borrowings.filter((b) => b.status === "pending").length;
  const borrowedCount = borrowings.filter((b) => b.status === "borrowed").length;
  const returnedCount = borrowings.filter((b) => b.status === "returned").length;
  const overdueCount = borrowings.filter((b) => b.status === "overdue").length;

  const activeLoans = borrowings.filter(
    (b) => b.status === "pending" || b.status === "approved" || b.status === "borrowed" || b.status === "overdue"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Card (Stockita Style with Green/Teal Theme) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
            {user?.name ? user.name[0] : "S"}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Siswa Terverifikasi · LabFlow
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Halo, {user?.name ?? "Siswa"}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Portal inventaris dan peminjaman alat laboratorium sekolah UAS 2026/2027.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            + Ajukan Pinjam Alat
          </Button>
          <Link href="/catalog">
            <Button variant="outline" size="md" className="gap-1.5 text-xs font-semibold">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Lihat Katalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards with Colored Top Borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Menunggu</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-500 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-1">
            <PackageCheck className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sedang Dipinjam</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{borrowedCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terlambat</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{overdueCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dikembalikan</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{returnedCount}</p>
        </motion.div>
      </div>

      {/* Active Borrowings Table (Stockita Style) */}
      <div className="bg-white rounded-3xl border border-sky-400 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Status Peminjaman Aktif</h2>
              <p className="text-[11px] text-slate-500">Pantau status persetujuan laboran dan batas waktu pengembalian alat.</p>
            </div>
          </div>
          <Link href="/history" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            Semua Riwayat <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Memuat data peminjaman...</div>
        ) : activeLoans.length === 0 ? (
          <div className="p-10 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada peminjaman aktif</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Peralatan yang sedang kamu pinjam akan tercantum di sini.</p>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              + Ajukan Pinjam Alat
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Kode Transaksi</th>
                  <th className="py-3 px-4">Nama Peralatan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-3">Jumlah</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Batas Kembali</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((b) => {
                  const isBorrowed = b.status === "borrowed" || b.status === "overdue";
                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${
                        isBorrowed ? "bg-rose-50/70" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.transactionCode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{b.item.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{b.item.category.name}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{b.quantity} unit</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(b.borrowDate)}</td>
                      <td className="py-3.5 px-4">
                        <span className={b.status === "overdue" ? "text-rose-600 font-black" : "text-slate-700 font-medium"}>
                          {formatDate(b.returnExpectedDate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {b.status === "pending" ? (
                          <button
                            onClick={() => setCancelModalItem(b)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Batalkan
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Terkunci</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Borrow Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.replace("/dashboard/student");
        }}
        title="Form Pengajuan Peminjaman Alat Lab"
      >
        <form onSubmit={handleSubmitBorrow} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Alat Laboratorium *</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Pilih Alat --</option>
              {items
                .filter((item) => !item.isDeleted)
                .map((item) => (
                  <option key={item.id} value={item.id} disabled={item.availableStock <= 0}>
                    {item.name} ({item.itemCode}) — Tersedia: {item.availableStock}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah *</label>
              <input
                type="number"
                min={1}
                max={selectedItem ? selectedItem.availableStock : 99}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tgl Pinjam *</label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tgl Kembali *</label>
              <input
                type="date"
                value={returnExpectedDate}
                onChange={(e) => setReturnExpectedDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Keperluan (Opsional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Praktikum Routing MikroTik Bab 3..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                router.replace("/dashboard/student");
              }}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Ajukan Permintaan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalItem)}
        onClose={() => setCancelModalItem(null)}
        title="Batalkan Permintaan Peminjaman"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Apakah Anda yakin ingin membatalkan permintaan pinjam{" "}
            <strong>{cancelModalItem?.item.name}</strong> ({cancelModalItem?.transactionCode})?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalItem(null)}>
              Kembali
            </Button>
            <Button variant="danger" size="sm" loading={cancelling} onClick={handleConfirmCancel}>
              Ya, Batalkan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat dashboard...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
