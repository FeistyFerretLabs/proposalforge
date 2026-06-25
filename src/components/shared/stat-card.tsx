import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        <Icon className="h-5 w-5 text-zinc-400" />
      </div>
      <div className="mt-2 text-3xl font-bold text-zinc-900">{value}</div>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend.value >= 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
