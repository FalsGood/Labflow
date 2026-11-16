import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "teal";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold",
  teal: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-semibold",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold",
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-semibold",
  ghost: "hover:bg-slate-100 text-slate-600 font-medium",
  outline: "border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-2.5 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
