# 🧪 LabFlow — Smart School Lab Inventory & Borrowing System

> **LabFlow** adalah platform web modern untuk manajemen inventaris dan sistem peminjaman peralatan laboratorium sekolah (TKJ, Jaringan, IoT, dan Sarpras Kebersihan). Dibangun dengan arsitektur **Next.js App Router**, **TypeScript**, **Tailwind CSS**, dan **Prisma ORM**.

---

## 🚀 Fitur Unggulan

- **Role-Based Access Control (RBAC):** Pemisahan hak akses antara **Siswa** dan **Admin (Laboran)** dengan otentikasi JWT stateless yang aman.
- **Katalog Inventaris Real-Time:** Penelusuran alat lab dengan filter kategori, live search, dan indikator ketersediaan stok.
- **Sistem Pengajuan Peminjaman:** Siswa dapat memilih alat, menentukan tanggal pinjam, dan batas pengembalian.
- **Admin Command Center:**
  - Persetujuan & penolakan peminjaman alat secara real-time.
  - Stasiun pengembalian fisik dengan inspeksi kondisi alat (Baik, Rusak Ringan, Rusak Berat).
  - Manajemen CRUD Master Data Barang dan Kategori Lab.
  - Manajemen akun pengguna & aktivasi status.
  - Audit Trail Log payload aktivitas seluruh transaksi.
- **Design System Konsisten:** Tampilan bertema **Stockita** yang bersih dan profesional dengan palet Emerald Green, Crimson Rose, dan Slate.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Database & ORM:** SQLite via [Prisma ORM](https://www.prisma.io/)
- **Styling:** Tailwind CSS v4 & Lucide Icons
- **State Management & Toast:** Zustand
- **Form & Validation:** React Hook Form & Zod
- **Security & Auth:** `jose` (Web Crypto JWT) & `bcryptjs`

---

## 📦 Panduan Instalasi Lokal

### 1. Clone Repository
```bash
git clone https://github.com/username/labflow.git
cd labflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### 4. Setup Database & Seed Data
Jalankan migrasi schema dan seeding data katalog komputer & jaringan:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 👥 Akun Demo Pengujian

| Peran (Role) | Email | Password | Akses |
| :--- | :--- | :--- | :--- |
| **Admin (Laboran)** | `admin@labflow.sch.id` | `admin123` | Dashboard Admin `/dashboard/admin`, Kelola Item, Approval, Returns, Logs |
| **Siswa (Student)** | `naufal@student.labflow.sch.id` | `siswa123` | Dashboard Siswa `/dashboard/student`, Pinjam Alat, Riwayat |
| **Siswa 2** | `rina@student.labflow.sch.id` | `siswa123` | Pinjam Alat, Riwayat Peminjaman |

---

## 📁 Struktur Direktori

```text
labflow/
├── prisma/
│   ├── schema.prisma       # Definisi skema database Prisma
│   └── seed.ts             # Data inisialisasi inventaris lab & akun
├── src/
│   ├── app/
│   │   ├── (protected)/    # Rute terlindungi (Admin & Siswa)
│   │   ├── (public)/       # Halaman landing, katalog, login, register
│   │   └── api/            # Route handlers RESTful API
│   ├── components/
│   │   ├── layout/         # Navbar, Sidebar, Shell
│   │   └── ui/             # Reusable UI (Button, Badge, Modal, Toast)
│   ├── lib/                # JWT, Prisma client, validators, utils
│   ├── store/              # Zustand global store
│   ├── types/              # TypeScript interface definitions
│   └── middleware.ts       # Route protection & RBAC middleware
└── public/                 # Aset statis & logo
```

---

## 📄 Lisensi
Dibuat untuk keperluan penilaian **UAS Ganjil 2026/2027** — LabFlow.
Semua hak cipta dilindungi undang-undang.
