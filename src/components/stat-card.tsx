import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
}) {
  const toneCls = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight truncate">{value}</div>
          {delta && <div className={cn("mt-1 text-xs text-muted-foreground")}>{delta}</div>}
        </div>
        <div className={cn("size-10 rounded-lg grid place-items-center shrink-0", toneCls)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
