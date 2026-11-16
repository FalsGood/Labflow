import { cn } from "@/lib/utils";
import { getStatusColor, getStatusLabel, getConditionColor, getConditionLabel } from "@/lib/utils";

interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", className)}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge label={getStatusLabel(status)} className={getStatusColor(status)} />;
}

export function ConditionBadge({ condition }: { condition: string }) {
  return <Badge label={getConditionLabel(condition)} className={getConditionColor(condition)} />;
}

export function StockBadge({ available, total }: { available: number; total: number }) {
  const pct = total === 0 ? 0 : (available / total) * 100;
  const color =
    pct === 0
      ? "bg-rose-100 text-rose-800 border-rose-300 font-bold"
      : pct <= 30
      ? "bg-amber-100 text-amber-800 border-amber-300 font-semibold"
      : "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
  return <Badge label={`${available} / ${total}`} className={color} />;
}
