"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
};

const colors = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-950",
  error: "bg-rose-50 border-rose-200 text-rose-950",
  info: "bg-sky-50 border-sky-200 text-sky-950",
  warning: "bg-amber-50 border-amber-200 text-amber-950",
};

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-xs",
              colors[toast.type]
            )}
          >
            {icons[toast.type]}
            <p className="flex-1 text-xs font-semibold leading-relaxed">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
