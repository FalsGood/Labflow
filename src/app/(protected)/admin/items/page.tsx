"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Image from "next/image";
import { ItemPublic, CategoryPublic, ItemCondition } from "@/types";
import { StockBadge, ConditionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ItemFormData {
  categoryId: string;
  itemCode: string;
  name: string;
  totalStock: number;
  availableStock: number;
  condition: ItemCondition;
  location: string;
  imageUrl: string;
}

const defaultFormData: ItemFormData = {
  categoryId: "",
  itemCode: "",
  name: "",
  totalStock: 1,
  availableStock: 1,
  condition: "baik",
  location: "",
  imageUrl: "",
};

export default function AdminItemsPage() {
  const { addToast } = useAppStore();

  const [items, setItems] = useState<ItemPublic[]>([]);
  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form Modal (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemPublic | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<ItemPublic | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        search,
        categoryId: selectedCategory,
      });

      const res = await fetch(`/api/items?${params}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setTotalPages(json.totalPages);
        setTotalCount(json.total);
      }
    } catch {
      addToast("Gagal memuat inventaris", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, addToast]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
      });
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchItems, 250);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      ...defaultFormData,
      categoryId: categories[0]?.id ?? "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ItemPublic) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.category.id,
      itemCode: item.itemCode,
      name: item.name,
      totalStock: item.totalStock,
      availableStock: item.availableStock,
      condition: item.condition,
      location: item.location,
      imageUrl: item.imageUrl ?? "",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalStock: Number(formData.totalStock),
          availableStock: Number(formData.availableStock),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menyimpan item", "error");
        return;
      }

      addToast(
        editingItem ? "Item inventaris berhasil diperbarui" : "Item inventaris baru berhasil ditambahkan",
        "success"
      );
      setIsFormOpen(false);
      fetchItems();
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
      const res = await fetch(`/api/items/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        addToast(json.error ?? "Gagal menghapus item", "error");
        return;
      }
      addToast("Item berhasil dihapus / soft-deleted", "success");
      setDeleteTarget(null);
      fetchItems();
    } catch {
      addToast("Terjadi kesalahan server", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">Manajemen Inventaris Alat</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelola stok fisik, nomor inventaris, kondisi barang, dan lokasi simpan.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xs">
          <Plus className="w-4 h-4" />
          + Tambah Item Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kode barang atau nama alat lab..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table (Stockita Style with Colored Border) */}
      <div className="bg-white rounded-3xl border border-sky-400 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Memuat data inventaris...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada item ditemukan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tambah item baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Kode Item</th>
                  <th className="py-3 px-5">Nama Peralatan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Stok (Tersedia / Total)</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-5">Lokasi Simpan</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      {item.imageUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-slate-200 shadow-2xs">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.itemCode}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{item.category?.name ?? "-"}</td>
                    <td className="py-3.5 px-4">
                      <StockBadge available={item.availableStock} total={item.totalStock} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ConditionBadge condition={item.condition} />
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{item.location}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Item"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Halaman {page} dari {totalPages} (Total {totalCount} item)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? "Edit Peralatan Lab" : "Tambah Peralatan Lab Baru"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Item *</label>
              <input
                type="text"
                required
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                placeholder="OPT-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Lab *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Peralatan *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mikroskop Binokuler Olympus"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Stok *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.totalStock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    totalStock: val,
                    availableStock: !editingItem ? val : Math.min(formData.availableStock, val),
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Stok Tersedia *</label>
              <input
                type="number"
                min={0}
                max={formData.totalStock}
                required
                value={formData.availableStock}
                onChange={(e) => setFormData({ ...formData, availableStock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kondisi Fisik *</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi Penyimpanan *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Rak Server A1 - Lab Jaringan"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">URL Gambar / Foto Barang (Opsional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
            {formData.imageUrl && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 rounded-lg overflow-hidden relative border border-slate-200 shrink-0">
                  <Image src={formData.imageUrl} alt="Pratinjau" fill className="object-cover" sizes="48px" />
                </div>
                <span className="text-[11px] text-slate-600 font-medium">Pratinjau foto barang aktif</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Simpan Data Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Hapus Peralatan">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.name}</strong> ({deleteTarget?.itemCode})?
          </p>
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
