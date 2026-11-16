import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/ToastContainer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LabFlow — Sistem Manajemen Inventaris Laboratorium",
  description: "Platform peminjaman dan manajemen inventaris laboratorium sekolah yang modern dan efisien.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
