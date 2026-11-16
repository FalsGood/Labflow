import Link from "next/link";
import {
  FlaskConical,
  Package,
  ClipboardCheck,
  BarChart3,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Package className="w-6 h-6 text-emerald-600" />,
      title: "Manajemen Inventaris",
      desc: "CRUD lengkap untuk semua peralatan lab dengan tracking stok real-time.",
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-teal-600" />,
      title: "Sistem Peminjaman",
      desc: "Alur permintaan → persetujuan → serah terima → pengembalian yang terstruktur.",
    },
    {
      icon: <Shield className="w-6 h-6 text-sky-600" />,
      title: "Kontrol Akses RBAC",
      desc: "Peran Admin & Siswa dengan proteksi rute dan validasi ketat di server.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
      title: "Audit Trail Lengkap",
      desc: "Semua aktivitas tercatat otomatis untuk transparansi dan akuntabilitas.",
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      title: "Validasi Transaksi",
      desc: "Pencegahan race condition dengan Prisma transactions & cek stok server-side.",
    },
    {
      icon: <Users className="w-6 h-6 text-slate-700" />,
      title: "Manajemen Pengguna",
      desc: "Direktori pengguna dengan toggle status aktif/nonaktif oleh admin.",
    },
  ];

  const benefits = [
    "Stok tidak pernah minus berkat validasi transaksi database",
    "Notifikasi otomatis peminjaman melewati batas (overdue)",
    "Soft delete — data transaksi historis tetap terjaga",
    "Tampilan responsif, modern, dan intuitif di semua perangkat",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                Lab<span className="text-emerald-600">Flow</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Smart Lab Inventory System
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/catalog"
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 px-3 py-2 rounded-xl transition-colors"
            >
              Katalog
            </Link>
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-sm"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            Kelola Lab Sekolah
            <span className="text-emerald-400"> Lebih Cerdas & Akurat</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            LabFlow adalah sistem manajemen inventaris dan peminjaman peralatan laboratorium sekolah yang modern,
            cepat, dan aman — dibangun dengan Next.js, Prisma, dan TypeScript.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-950/30"
            >
              Daftar Akun Siswa <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/20 transition-all backdrop-blur-sm"
            >
              Buka Katalog Inventaris
            </Link>
          </div>
        </div>
      </section>

      {/* Stats with Colored Top Border Cards */}
      <section className="py-12 px-4 max-w-6xl mx-auto -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-600 shadow-sm text-center">
            <p className="text-3xl font-black text-slate-900">50+</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Item Tersedia</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-600 shadow-sm text-center">
            <p className="text-3xl font-black text-slate-900">5</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Kategori Lab</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-sm text-center">
            <p className="text-3xl font-black text-slate-900">100%</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Transaksi Aman</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-sm text-center">
            <p className="text-3xl font-black text-slate-900">99.9%</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Uptime Real-Time</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Fitur Lengkap Laboratorium Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Dirancang khusus untuk memfasilitasi kebutuhan praktikum siswa serta manajemen inventaris laboran.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 px-4 bg-white border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Alur Peminjaman Terintegrasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-10">
            Dari pengajuan hingga pengembalian, seluruh proses terpantau dengan jelas.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "1", label: "Ajukan Permintaan", color: "border-amber-400 bg-amber-50 text-amber-800" },
              { step: "2", label: "Admin Setujui", color: "border-sky-400 bg-sky-50 text-sky-800" },
              { step: "3", label: "Serah Terima Alat", color: "border-rose-400 bg-rose-50 text-rose-800" },
              { step: "4", label: "Pengembalian & Cek", color: "border-emerald-400 bg-emerald-50 text-emerald-800" },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 ${s.color}`}
              >
                <div className="w-10 h-10 rounded-full bg-white font-black flex items-center justify-center shadow-xs">
                  {s.step}
                </div>
                <p className="text-xs font-bold text-center mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-left bg-slate-50 rounded-3xl p-6 border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm mb-3">✅ Standar Mutu & Integritas Data</h3>
            <ul className="space-y-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-emerald-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Siap Menggunakan LabFlow?</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mb-6">
            Daftar sebagai siswa dan mulai pinjam peralatan laboratorium secara mandiri.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2 text-xs shadow-md"
            >
              Buat Akun Siswa <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="border border-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-xs inline-flex items-center justify-center"
            >
              Masuk sebagai Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-center text-xs text-slate-400">
        <p>© 2026 LabFlow — Naufal Aziz Nabigh Siagian | XII | UAS Ganjil 2026/2027</p>
        <p className="mt-1 text-slate-500">Built with Next.js · Prisma · TypeScript · Tailwind CSS</p>
      </footer>
    </div>
  );
}
