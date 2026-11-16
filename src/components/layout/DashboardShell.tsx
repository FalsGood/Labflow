"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useAppStore } from "@/store/appStore";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardLayoutProps) {
  const { setUser } = useAppStore();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.data); });
  }, [setUser]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}
