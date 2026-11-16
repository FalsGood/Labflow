"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Search, Shield, UserCheck, UserX, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { UserPublic } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const { user: currentUser, addToast } = useAppStore();

  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "12",
        search,
      });

      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setTotalPages(json.totalPages);
        setTotalCount(json.total);
      }
    } catch {
      addToast("Gagal memuat pengguna", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleToggleStatus = async (user: UserPublic) => {
    if (user.id === currentUser?.userId) {
      addToast("Anda tidak dapat menonaktifkan akun Anda sendiri", "warning");
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal mengubah status", "error");
        return;
      }
      addToast(`Status ${user.name} berhasil diubah menjadi ${!user.isActive ? "Aktif" : "Nonaktif"}`, "success");
      fetchUsers();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    }
  };

  const handleToggleRole = async (user: UserPublic) => {
    if (user.id === currentUser?.userId) {
      addToast("Anda tidak dapat mengubah peran akun Anda sendiri", "warning");
      return;
    }

    const newRole = user.role === "admin" ? "siswa" : "admin";
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal mengubah role", "error");
        return;
      }
      addToast(`Peran ${user.name} berhasil diubah menjadi ${newRole.toUpperCase()}`, "success");
      fetchUsers();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Direktori Pengguna & Siswa</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akses, aktivasi akun, dan hak istimewa peran (RBAC) pada sistem LabFlow.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          Total Terdaftar: <strong className="text-emerald-700 font-bold">{totalCount} Pengguna</strong>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, email, atau NISN/NIP..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">Tidak ada pengguna ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nama Lengkap</th>
                  <th className="py-3.5 px-6">NISN / NIP</th>
                  <th className="py-3.5 px-6">Email & Kontak</th>
                  <th className="py-3.5 px-6">Peran (Role)</th>
                  <th className="py-3.5 px-6">Status Akun</th>
                  <th className="py-3.5 px-6">Terdaftar Sejak</th>
                  <th className="py-3.5 px-6 text-right">Kelola Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.userId;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            {isSelf && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                Akun Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-700">{u.nisnNip}</td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <p className="font-medium text-slate-800">{u.email}</p>
                        <p className="text-slate-400">{u.phoneNumber ?? "-"}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            u.role === "admin"
                              ? "bg-slate-900 text-white border-slate-800"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role === "admin" ? "Admin / Laboran" : "Siswa"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isSelf}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-100"
                            title="Ganti Peran Admin / Siswa"
                          >
                            Ubah Role
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf}
                            className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.isActive
                                ? "text-rose-600 hover:bg-rose-50 border border-rose-200"
                                : "text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                            }`}
                            title="Toggle Status Aktif / Nonaktif"
                          >
                            {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}

