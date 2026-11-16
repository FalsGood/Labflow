"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Filter, FlaskConical, Package, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ItemPublic, CategoryPublic } from "@/types";
import { StockBadge, ConditionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [items, setItems] = useState<ItemPublic[]>([]);
  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, categoryId, page: String(page), pageSize: "12" });
    const res = await fetch(`/api/items?${params}`);
    const json = await res.json();
    if (json.success) {
      setItems(json.data);
      setTotalPages(json.totalPages);
    }
    setLoading(false);
  }, [search, categoryId, page]);

  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); }); }, []);
  useEffect(() => { const t = setTimeout(fetchItems, 300); return () => clearTimeout(t); }, [fetchItems]);

  const handleBorrow = (item: ItemPublic) => {
    if (!user) { router.push(`/auth/login?from=/catalog`); return; }
    if (user.role === "admin") return;
    router.push(`/dashboard/student?borrow=${item.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Katalog Inventaris Lab</h1>
          </div>
          <p className="text-slate-500 text-sm">Telusuri dan pinjam peralatan laboratorium sekolah</p>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari nama atau kode item..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">Tidak ada item ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba ubah filter pencarian Anda</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FlaskConical className="w-16 h-16 text-slate-300" />
                  )}
                  <div className="absolute top-3 left-3">
                    <StockBadge available={item.availableStock} total={item.totalStock} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {item.itemCode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.category.name}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 flex-1 leading-snug">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <ConditionBadge condition={item.condition} />
                  </div>
                  <p className="text-xs text-slate-500 mb-4">📍 {item.location}</p>

                  {item.availableStock > 0 ? (
                    <Button
                      onClick={() => handleBorrow(item)}
                      size="sm"
                      className="w-full"
                      variant={user?.role === "admin" ? "ghost" : "primary"}
                      disabled={user?.role === "admin"}
                    >
                      {user?.role === "admin" ? "Hanya Siswa" : "Pinjam Sekarang"}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Stok Habis
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
