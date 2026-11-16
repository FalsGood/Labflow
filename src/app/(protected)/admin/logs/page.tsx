"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Search, Eye, Shield, Globe, Clock, FileCode } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { ActivityLogPublic } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/utils";

export default function AdminLogsPage() {
  const { addToast } = useAppStore();

  const [logs, setLogs] = useState<ActivityLogPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<ActivityLogPublic | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "15",
      });

      const res = await fetch(`/api/logs?${params}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setTotalPages(json.totalPages);
        setTotalCount(json.total);
      }
    } catch {
      addToast("Gagal memuat log audit", "error");
    } finally {
      setLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes("APPROVED") || action.includes("RETURNED")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (action.includes("REJECTED") || action.includes("CANCELLED") || action.includes("DELETED"))
      return "bg-rose-50 text-rose-800 border-rose-200";
    if (action.includes("CREATED") || action.includes("UPDATED")) return "bg-sky-50 text-sky-800 border-sky-200";
    if (action.includes("LOGIN")) return "bg-slate-100 text-slate-800 border-slate-300";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.user?.name && log.user.name.toLowerCase().includes(q)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(q)) ||
      (log.context && log.context.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Rekam Jejak Sistem</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Log aktivitas seluruh operasi transaksional, persetujuan, serah terima, dan manipulasi inventaris laboratorium.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          Total Rekaman: <strong className="text-emerald-700 font-bold">{totalCount} Entri</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aksi (cth: BORROW_APPROVED), nama peminjam, atau kata kunci context..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat rekam jejak audit...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">Tidak ada log aktivitas ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Waktu Kejadian</th>
                  <th className="py-3.5 px-6">Aksi Operasi</th>
                  <th className="py-3.5 px-6">Pelaku / Pengguna</th>
                  <th className="py-3.5 px-6">Ringkasan Konteks</th>
                  <th className="py-3.5 px-6">Alamat IP</th>
                  <th className="py-3.5 px-6 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block font-mono text-xs px-2.5 py-1 rounded-md font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {log.user ? (
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{log.user.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {log.user.email} ({log.user.role})
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sistem / Tamu</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate font-mono">
                      {log.context || "-"}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-500">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1.5 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Context
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
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

      {/* Context JSON Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Detail Audit Log Payload"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400">Aksi Operasi:</span>
                <p className="font-mono font-bold text-emerald-800 mt-0.5">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-slate-400">Waktu:</span>
                <p className="font-medium text-slate-800 mt-0.5">{formatDateTime(selectedLog.createdAt)}</p>
              </div>
              <div>
                <span className="text-slate-400">User / Pelaksana:</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedLog.user?.name ?? "Sistem"}</p>
              </div>
              <div>
                <span className="text-slate-400">IP Address:</span>
                <p className="font-mono text-slate-800 mt-0.5">{selectedLog.ipAddress ?? "127.0.0.1"}</p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1">
                Data JSON Konteks Transaksi:
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                {selectedLog.context
                  ? JSON.stringify(JSON.parse(selectedLog.context), null, 2)
                  : "{}"}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button onClick={() => setSelectedLog(null)} size="sm">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

