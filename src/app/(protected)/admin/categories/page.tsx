"use client";

import { useEffect, useState, useCallback } from "react";
import { Tags, Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { CategoryPublic } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

const defaultFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const { addToast } = useAppStore();

  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryPublic | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  // Modal Delete
  const [deleteTarget, setDeleteTarget] = useState<CategoryPublic | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch {
      addToast("Gagal memuat kategori", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: CategoryPublic) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
    });
    setIsFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    // Generate slug automatically when creating
    if (!editingCategory) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, name, slug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menyimpan kategori", "error");
        return;
      }

      addToast(
        editingCategory ? "Kategori berhasil diperbarui" : "Kategori baru berhasil ditambahkan",
        "success"
      );
      setIsFormOpen(false);
      fetchCategories();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menghapus kategori", "error");
        return;
      }
      addToast("Kategori berhasil dihapus", "success");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tags className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Kategori Laboratorium</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola pengelompokan peralatan (Perangkat Jaringan, Kabel LAN, Alat IoT, Janitor, dsb.).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kategori Baru
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau slug kategori..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat kategori...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">Tidak ada kategori ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nama Kategori</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6">Deskripsi</th>
                  <th className="py-3.5 px-6">Jumlah Item Terkait</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                        {c.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {c.description || "-"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        {c._count?.items ?? 0} Item
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kategori *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Perangkat Jaringan"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slug URL (Hanya huruf kecil, angka, dan strip) *
            </label>
            <input
              type="text"
              required
              pattern="^[a-z0-9-]+$"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="perangkat-jaringan"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan jenis peralatan yang masuk dalam kategori ini..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {editingCategory ? "Simpan Perubahan" : "Buat Kategori"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kategori"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus kategori <strong>{deleteTarget?.name}</strong>?
          </p>
          {(deleteTarget?._count?.items ?? 0) > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              ⚠️ Kategori ini masih memiliki {deleteTarget?._count?.items} item inventaris terkait.
              Sistem akan menolak penghapusan untuk menjaga integritas data relasional.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

