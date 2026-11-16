"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  History,
  Search,
  Filter,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { BorrowingPublic } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function StudentHistoryPage() {
  const { addToast } = useAppStore();

  const [borrowings, setBorrowings] = useState<BorrowingPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [selectedDetail, setSelectedDetail] = useState<BorrowingPublic | null>(null);

  // Cancel Confirmation Modal
  const [cancelTarget, setCancelTarget] = useState<BorrowingPublic | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/borrowings?${params}`);
      const json = await res.json();
      if (json.success) {
        setBorrowings(json.data);
        setTotalPages(json.totalPages);
        setTotalCount(json.total);
      }
    } catch {
      addToast("Gagal memuat riwayat", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, addToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCancelRequest = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/borrowings/${cancelTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal membatalkan permintaan", "error");
        return;
      }
      addToast("Permintaan berhasil dibatalkan", "success");
      setCancelTarget(null);
      fetchHistory();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setCancelling(false);
    }
  };

  const filteredBorrowings = borrowings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.transactionCode.toLowerCase().includes(q) ||
      b.item.name.toLowerCase().includes(q) ||
      b.item.itemCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Peminjaman Saya</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Arsip lengkap semua transaksi dan status peminjaman inventaris laboratorium sekolah.
          </p>
        </div>
        <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          Total Transaksi: <strong className="text-emerald-700 font-bold">{totalCount}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode transaksi, nama alat, atau kode barang..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="approved">Disetujui (Siap Ambil)</option>
            <option value="borrowed">Sedang Dipinjam</option>
            <option value="returned">Sudah Dikembalikan</option>
            <option value="overdue">Terlambat</option>
            <option value="rejected">Ditolak / Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat riwayat peminjaman...</p>
          </div>
        ) : filteredBorrowings.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">Tidak ada riwayat ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Kode Transaksi</th>
                  <th className="py-3.5 px-6">Alat Laboratorium</th>
                  <th className="py-3.5 px-6">Qty</th>
                  <th className="py-3.5 px-6">Tanggal Pinjam</th>
                  <th className="py-3.5 px-6">Tenggat Kembali</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-emerald-800">
                      <span className="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        {b.transactionCode}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{b.item.name}</p>
                      <p className="text-xs text-slate-500">{b.item.itemCode} · {b.item.category.name}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {b.quantity} unit
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {formatDate(b.borrowDate)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={b.status === "overdue" ? "text-rose-600 font-bold" : "text-slate-700"}>
                        {formatDate(b.returnExpectedDate)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDetail(b)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-xl transition-colors border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>

                        {b.status === "pending" && (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl transition-colors border border-rose-200"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        title="Rincian Transaksi Peminjaman"
      >
        {selectedDetail && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Kode Transaksi</p>
                <p className="font-mono font-bold text-emerald-800">{selectedDetail.transactionCode}</p>
              </div>
              <StatusBadge status={selectedDetail.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500">Nama Alat</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.item.name}</p>
                <p className="text-slate-500">{selectedDetail.item.itemCode}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500">Jumlah Dipinjam</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedDetail.quantity} Unit</p>
                <p className="text-slate-500">Kategori: {selectedDetail.item.category.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Pengajuan:</span>
                <span className="font-medium text-slate-800">{formatDateTime(selectedDetail.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Pinjam:</span>
                <span className="font-medium text-slate-800">{formatDate(selectedDetail.borrowDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tenggat Kembali:</span>
                <span className="font-medium text-slate-800">{formatDate(selectedDetail.returnExpectedDate)}</span>
              </div>
              {selectedDetail.returnActualDate && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Dikembalikan Pada:</span>
                  <span className="font-medium text-emerald-700">{formatDate(selectedDetail.returnActualDate)}</span>
                </div>
              )}
            </div>

            {selectedDetail.notes && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Catatan Siswa:</span>
                <p className="text-slate-600 mt-0.5">{selectedDetail.notes}</p>
              </div>
            )}

            {selectedDetail.adminNotes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <span className="font-semibold">Catatan Petugas Lab:</span>
                <p className="mt-0.5">{selectedDetail.adminNotes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setSelectedDetail(null)} size="sm">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Batalkan Pengajuan Peminjaman"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin membatalkan pengajuan peminjaman untuk transaksi{" "}
            <strong className="font-mono text-gray-900">{cancelTarget?.transactionCode}</strong> ({cancelTarget?.item.name})?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Kembali
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancelRequest}>
              Ya, Batalkan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

