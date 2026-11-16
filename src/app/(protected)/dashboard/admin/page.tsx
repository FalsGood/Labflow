"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Layers,
  AlertTriangle,
  RotateCcw,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Moon,
  Tags,
  Activity,
  Edit2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { BorrowingPublic, ItemPublic, CategoryPublic } from "@/types";
import { StatusBadge, StockBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user, addToast } = useAppStore();

  const [items, setItems] = useState<ItemPublic[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingPublic[]>([]);
  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter for History Activity
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Approval Modals
  const [approveModalItem, setApproveModalItem] = useState<BorrowingPublic | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [approving, setApproving] = useState(false);

  const [rejectModalItem, setRejectModalItem] = useState<BorrowingPublic | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resItems, resBorrowings, resCategories] = await Promise.all([
        fetch("/api/items?pageSize=100"),
        fetch("/api/borrowings?pageSize=50"),
        fetch("/api/categories"),
      ]);

      const [dataItems, dataBorrowings, dataCategories] = await Promise.all([
        resItems.json(),
        resBorrowings.json(),
        resCategories.json(),
      ]);

      if (dataItems.success) setItems(dataItems.data);
      if (dataBorrowings.success) setBorrowings(dataBorrowings.data);
      if (dataCategories.success) setCategories(dataCategories.data);
    } catch {
      addToast("Gagal memuat data dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    if (!approveModalItem) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/borrowings/${approveModalItem.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: approveNotes || undefined }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menyetujui peminjaman", "error");
        return;
      }
      addToast("Peminjaman disetujui & stok otomatis terpotong!", "success");
      setApproveModalItem(null);
      setApproveNotes("");
      fetchData();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalItem) return;
    if (!rejectReason || rejectReason.trim().length < 5) {
      addToast("Alasan penolakan minimal 5 karakter", "warning");
      return;
    }
    setRejecting(true);
    try {
      const res = await fetch(`/api/borrowings/${rejectModalItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: rejectReason }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menolak permintaan", "error");
        return;
      }
      addToast("Permintaan peminjaman ditolak", "info");
      setRejectModalItem(null);
      setRejectReason("");
      fetchData();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setRejecting(false);
    }
  };

  // Metrics
  const activeItems = items.filter((i) => !i.isDeleted);
  const totalItemCount = activeItems.length;
  const totalStockCount = activeItems.reduce((acc, curr) => acc + curr.totalStock, 0);
  const lowStockCount = activeItems.filter((i) => i.availableStock <= 3).length;

  // Filtered History Activity List
  const filteredBorrowings = borrowings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !searchQuery ||
      b.item.name.toLowerCase().includes(q) ||
      b.user.name.toLowerCase().includes(q) ||
      b.transactionCode.toLowerCase().includes(q);
    const matchCategory = !categoryFilter || b.item.category.name === categoryFilter;
    return matchQuery && matchCategory;
  });

  const avatarColors = [
    "bg-emerald-600",
    "bg-sky-600",
    "bg-purple-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-teal-600",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card (Stockita Style) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              Lab<span className="text-emerald-600">Flow</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Smart Lab Inventory Management System</p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/items">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              Kelola Item
            </Button>
          </Link>
          <Link href="/admin/approvals">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Persetujuan ({borrowings.filter((b) => b.status === "pending").length})
            </Button>
          </Link>
          <Link href="/admin/returns">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
              Pengembalian
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards (Accent Top Borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total Item (Green Top Border) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 border-t-4 border-t-emerald-600 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-600 tracking-wide">Total Item</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{totalItemCount}</p>
        </motion.div>

        {/* Card 2: Total Stok (Red Top Border) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 border-t-4 border-t-rose-600 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-600 tracking-wide">Total Stok Fisik</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{totalStockCount}</p>
        </motion.div>

        {/* Card 3: Stok Menipis (Blue/Cyan Top Border) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 border-t-4 border-t-sky-500 shadow-xs flex flex-col items-center justify-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-600 tracking-wide">Stok Menipis (≤ 3)</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{lowStockCount}</p>
        </motion.div>
      </div>

      {/* Main Work Station: Left (Manage Inventory / Approvals) & Right (History Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Action Panel (Manage Inventory) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-emerald-600 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-500">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                +
              </div>
              <h2 className="text-base font-extrabold text-slate-800">Aksi Cepat Inventaris</h2>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Jalankan alur mutasi barang lab sekolah secara instan dan aman.
            </p>

            <div className="space-y-3">
              <Link href="/admin/items" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 gap-2 text-xs font-bold shadow-xs">
                  <Plus className="w-4 h-4" />
                  + Barang Masuk (Tambah Item)
                </Button>
              </Link>

              <Link href="/admin/approvals" className="block">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 gap-2 text-xs font-bold shadow-xs">
                  <RotateCcw className="w-4 h-4" />
                  Verifikasi Peminjaman ({borrowings.filter((b) => b.status === "pending").length})
                </Button>
              </Link>

              <Link href="/admin/returns" className="block">
                <Button variant="outline" className="w-full py-3 gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Pos Pengembalian Alat
                </Button>
              </Link>
            </div>

            {/* Quick Overdue Alert Box */}
            {borrowings.some((b) => b.status === "overdue") && (
              <div className="mt-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  Perhatian Peminjaman Terlambat!
                </div>
                <p className="text-[11px] text-rose-800">
                  Terdapat {borrowings.filter((b) => b.status === "overdue").length} alat melewati tenggat pengembalian.
                </p>
                <Link href="/admin/returns" className="text-[11px] font-bold text-rose-700 hover:underline inline-block pt-1">
                  Periksa Pos Pengembalian →
                </Link>
              </div>
            )}
          </div>

          {/* Categories Quick Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Kategori Alat Lab</h3>
              <Link href="/admin/categories" className="text-xs font-bold text-emerald-600 hover:underline">
                Kelola
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {c.name} ({c._count?.items ?? 0})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: History Activity Table (Stockita Style) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-sky-400 shadow-xs p-6 space-y-5">
            {/* Title & Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">History Activity</h2>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari barang / nama orang..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Table */}
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat aktivitas laboratorium...</div>
            ) : filteredBorrowings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Tidak ada riwayat aktivitas ditemukan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">No</th>
                      <th className="py-3 px-3">Avatar</th>
                      <th className="py-3 px-4">Nama Orang</th>
                      <th className="py-3 px-4">Nama Barang</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4">Waktu Input</th>
                      <th className="py-3 px-3">Stok</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBorrowings.map((b, idx) => {
                      const isBorrowed = b.status === "borrowed" || b.status === "overdue";
                      const isReturned = b.status === "returned";
                      const isPending = b.status === "pending";
                      const relatedItem = items.find((i) => i.id === b.item.id);
                      const isStockLow = relatedItem ? relatedItem.availableStock <= 3 : false;
                      const initials = b.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      const avatarBg = avatarColors[idx % avatarColors.length];

                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors ${
                            isBorrowed
                              ? "bg-rose-50/70 text-slate-900 font-medium"
                              : "hover:bg-slate-50/80 text-slate-800"
                          }`}
                        >
                          <td className="py-3 px-3 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div
                              className={`w-7 h-7 rounded-full text-white font-extrabold flex items-center justify-center text-[10px] shadow-xs ${avatarBg}`}
                            >
                              {initials}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{b.user.name}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{b.item.name}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {b.item.category.name}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {isBorrowed ? (
                              <span className="font-extrabold text-rose-600">Dipinjam</span>
                            ) : isReturned ? (
                              <span className="font-extrabold text-emerald-600">Kembali</span>
                            ) : isPending ? (
                              <span className="font-extrabold text-amber-600">Pending</span>
                            ) : (
                              <span className="font-extrabold text-sky-600">Disetujui</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                            {formatDate(b.borrowDate)}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            {isBorrowed ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px] w-fit">
                                  -{b.quantity} Dipinjam
                                </span>
                                {isStockLow && relatedItem && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit">
                                    ⚠️ Sisa {relatedItem.availableStock}
                                  </span>
                                )}
                              </div>
                            ) : isReturned ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                                +{b.quantity} Kembali
                              </span>
                            ) : (
                              <span className="text-slate-600 font-semibold">{b.quantity} unit</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {isPending ? (
                                <button
                                  onClick={() => {
                                    setApproveModalItem(b);
                                    setApproveNotes("");
                                  }}
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                                  title="Setujui"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setRejectModalItem(b);
                                    setRejectReason("");
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                                  title="Rincian / Tolak"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={Boolean(approveModalItem)}
        onClose={() => setApproveModalItem(null)}
        title="Setujui Peminjaman Alat"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Persetujuan akan memotong stok tersedia dari alat secara otomatis.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p><strong>Peminjam:</strong> {approveModalItem?.user.name}</p>
            <p><strong>Alat:</strong> {approveModalItem?.item.name} ({approveModalItem?.quantity} unit)</p>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Laboran (Opsional)</label>
            <textarea
              rows={2}
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setApproveModalItem(null)}>
              Batal
            </Button>
            <Button size="sm" loading={approving} onClick={handleApprove}>
              Konfirmasi Setujui
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectModalItem)}
        onClose={() => setRejectModalItem(null)}
        title="Tolak Pengajuan Peminjaman"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">Harap sertakan alasan penolakan permohonan alat ini:</p>
          <div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Alat sedang diservis / jadwal praktikum tabrakan..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalItem(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" loading={rejecting} onClick={handleReject}>
              Tolak Permintaan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
