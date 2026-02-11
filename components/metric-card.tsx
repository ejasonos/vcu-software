"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  status?: "normal" | "warning" | "critical";
  subtitle?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  status = "normal",
  subtitle,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            status === "normal" && "bg-primary/10",
            status === "warning" && "bg-accent/10",
            status === "critical" && "bg-destructive/10"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              status === "normal" && "text-primary",
              status === "warning" && "text-accent",
              status === "critical" && "text-destructive"
            )}
          />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-2xl font-bold",
            status === "normal" && "text-foreground",
            status === "warning" && "text-accent",
            status === "critical" && "text-destructive"
          )}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
      {/* Status indicator bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            status === "normal" && "bg-primary",
            status === "warning" && "bg-accent",
            status === "critical" && "bg-destructive"
          )}
          style={{
            width:
              status === "normal"
                ? "100%"
                : status === "warning"
                  ? "66%"
                  : "33%",
          }}
        />
      </div>
    </div>
  );
}
