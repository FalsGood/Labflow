"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RotateCcw,
  CheckCircle,
  PackageCheck,
  Search,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { BorrowingPublic, ItemCondition } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export default function AdminReturnsPage() {
  const { addToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<"handover" | "return">("handover");
  const [borrowings, setBorrowings] = useState<BorrowingPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [handoverItem, setHandoverItem] = useState<BorrowingPublic | null>(null);
  const [handingOver, setHandingOver] = useState(false);

  const [returnItem, setReturnItem] = useState<BorrowingPublic | null>(null);
  const [inspectionCondition, setInspectionCondition] = useState<ItemCondition>("baik");
  const [adminReturnNotes, setAdminReturnNotes] = useState("");
  const [processingReturn, setProcessingReturn] = useState(false);

  const fetchBorrowings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/borrowings?pageSize=100");
      const json = await res.json();
      if (json.success) setBorrowings(json.data);
    } catch {
      addToast("Gagal memuat pos pengembalian", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  const handleConfirmHandover = async () => {
    if (!handoverItem) return;
    setHandingOver(true);
    try {
      const res = await fetch(`/api/borrowings/${handoverItem.id}/handover`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal mengubah status serah terima", "error");
        return;
      }
      addToast(`Barang diserahkan ke ${handoverItem.user.name}. Status: Dipinjam`, "success");
      setHandoverItem(null);
      fetchBorrowings();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setHandingOver(false);
    }
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnItem) return;
    setProcessingReturn(true);
    try {
      const res = await fetch(`/api/borrowings/${returnItem.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition: inspectionCondition,
          adminNotes: adminReturnNotes || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal memproses pengembalian", "error");
        return;
      }
      addToast(
        `Pengembalian ${returnItem.transactionCode} selesai! Stok fisik pulih (+${returnItem.quantity}).`,
        "success"
      );
      setReturnItem(null);
      setAdminReturnNotes("");
      setInspectionCondition("baik");
      fetchBorrowings();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setProcessingReturn(false);
    }
  };

  const readyForHandover = borrowings.filter((b) => b.status === "approved");
  const currentlyBorrowed = borrowings.filter((b) => b.status === "borrowed" || b.status === "overdue");

  const currentList = activeTab === "handover" ? readyForHandover : currentlyBorrowed;

  const filteredList = currentList.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.transactionCode.toLowerCase().includes(q) ||
      b.user.name.toLowerCase().includes(q) ||
      b.user.nisnNip.toLowerCase().includes(q) ||
      b.item.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">Pos Serah Terima & Pengembalian</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola serah terima fisik barang dan inspeksi kondisi saat alat dikembalikan oleh siswa.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("handover")}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "handover"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Siap Diserahkan
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            {readyForHandover.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("return")}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "return"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Sedang Dipinjam & Pengembalian
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
            {currentlyBorrowed.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, nama siswa, atau alat..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table (Stockita Style with Sky Border) */}
      <div className="bg-white rounded-3xl border border-sky-400 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Memuat data pos...</div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Tidak ada data untuk ditampilkan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Kode Transaksi</th>
                  <th className="py-3 px-5">Siswa Peminjam</th>
                  <th className="py-3 px-5">Peralatan</th>
                  <th className="py-3 px-3">Jumlah</th>
                  <th className="py-3 px-4">Tenggat Kembali</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{b.transactionCode}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{b.user.name}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">{b.item.name}</td>
                    <td className="py-3.5 px-3 font-mono font-bold">{b.quantity} unit</td>
                    <td className="py-3.5 px-4">
                      <span className={b.status === "overdue" ? "text-rose-600 font-black" : "text-slate-600"}>
                        {formatDate(b.returnExpectedDate)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {activeTab === "handover" ? (
                        <Button
                          size="sm"
                          onClick={() => setHandoverItem(b)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Serahkan Barang
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReturnItem(b);
                            setInspectionCondition("baik");
                            setAdminReturnNotes("");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Terima & Cek Kondisi
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Handover Modal */}
      <Modal isOpen={Boolean(handoverItem)} onClose={() => setHandoverItem(null)} title="Serahkan Barang">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Konfirmasi bahwa siswa <strong>{handoverItem?.user.name}</strong> telah menerima barang{" "}
            <strong>{handoverItem?.item.name}</strong> ({handoverItem?.quantity} unit).
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setHandoverItem(null)}>
              Batal
            </Button>
            <Button size="sm" loading={handingOver} onClick={handleConfirmHandover}>
              Konfirmasi Diserahkan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={Boolean(returnItem)} onClose={() => setReturnItem(null)} title="Inspeksi Pengembalian">
        <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Periksa kelengkapan fisik alat. Stok barang akan otomatis ditambahkan kembali ke inventaris.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kondisi Alat Saat Ini *</label>
            <select
              value={inspectionCondition}
              onChange={(e) => setInspectionCondition(e.target.value as ItemCondition)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="baik">✅ Baik (Normal & Lengkap)</option>
              <option value="rusak_ringan">⚠️ Rusak Ringan</option>
              <option value="rusak_berat">❌ Rusak Berat</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Pemeriksaan</label>
            <textarea
              rows={2}
              value={adminReturnNotes}
              onChange={(e) => setAdminReturnNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReturnItem(null)}>
              Batal
            </Button>
            <Button type="submit" size="sm" loading={processingReturn}>
              Selesaikan Pengembalian
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
