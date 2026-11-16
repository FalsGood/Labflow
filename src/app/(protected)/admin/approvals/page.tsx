"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { BorrowingPublic } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export default function AdminApprovalsPage() {
  const { addToast } = useAppStore();

  const [requests, setRequests] = useState<BorrowingPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [approveItem, setApproveItem] = useState<BorrowingPublic | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [approving, setApproving] = useState(false);

  const [rejectItem, setRejectItem] = useState<BorrowingPublic | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/borrowings?status=pending&pageSize=50");
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } catch {
      addToast("Gagal memuat persetujuan", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleApprove = async () => {
    if (!approveItem) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/borrowings/${approveItem.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: approveNotes || undefined }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menyetujui peminjaman", "error");
        return;
      }
      addToast(`Permintaan ${approveItem.transactionCode} disetujui! Stok terpotong.`, "success");
      setApproveItem(null);
      setApproveNotes("");
      fetchPendingRequests();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectItem) return;
    if (!rejectReason || rejectReason.trim().length < 5) {
      addToast("Alasan penolakan minimal 5 karakter", "warning");
      return;
    }
    setRejecting(true);
    try {
      const res = await fetch(`/api/borrowings/${rejectItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: rejectReason }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menolak permintaan", "error");
        return;
      }
      addToast(`Permintaan ${rejectItem.transactionCode} ditolak.`, "info");
      setRejectItem(null);
      setRejectReason("");
      fetchPendingRequests();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setRejecting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.transactionCode.toLowerCase().includes(q) ||
      r.user.name.toLowerCase().includes(q) ||
      r.user.nisnNip.toLowerCase().includes(q) ||
      r.item.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">Pusat Persetujuan Peminjaman</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Verifikasi permohonan siswa. Persetujuan akan otomatis mengurangi stok barang.
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" />
          {requests.length} Menunggu Persetujuan
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode transaksi, nama siswa, atau alat..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Requests Grid (Stockita Style) */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">Memuat daftar persetujuan...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Semua Permintaan Sudah Diproses!</h3>
          <p className="text-xs text-slate-400 mt-0.5">Tidak ada antrean persetujuan pinjaman saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 border-t-4 border-t-amber-500 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                    {req.transactionCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Menunggu Verifikasi
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Peminjam</span>
                    <p className="font-bold text-slate-900">{req.user.name}</p>
                    <p className="text-slate-500 text-[11px]">NISN: {req.user.nisnNip}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Peralatan</span>
                    <p className="font-bold text-slate-900">{req.item.name}</p>
                    <p className="text-emerald-700 font-bold text-[11px]">Jumlah: {req.quantity} Unit</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Jadwal: {formatDate(req.borrowDate)} s/d {formatDate(req.returnExpectedDate)}
                </div>

                {req.notes && (
                  <p className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 italic">
                    &quot;{req.notes}&quot;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRejectItem(req);
                    setRejectReason("");
                  }}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                >
                  <XCircle className="w-3.5 h-3.5" /> Tolak
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setApproveItem(req);
                    setApproveNotes("");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Setujui
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={Boolean(approveItem)} onClose={() => setApproveItem(null)} title="Setujui Peminjaman">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Setujui peminjaman untuk <strong>{approveItem?.item.name}</strong> ({approveItem?.quantity} unit).
            Stok fisik barang akan otomatis dipotong.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Laboran (Opsional)</label>
            <textarea
              rows={2}
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setApproveItem(null)}>
              Batal
            </Button>
            <Button size="sm" loading={approving} onClick={handleApprove}>
              Konfirmasi Setujui
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(rejectItem)} onClose={() => setRejectItem(null)} title="Tolak Peminjaman">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">Alasan penolakan:</p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Jelaskan alasan penolakan..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectItem(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" loading={rejecting} onClick={handleReject}>
              Konfirmasi Tolak
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
