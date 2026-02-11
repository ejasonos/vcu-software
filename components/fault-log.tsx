"use client";

import { useTelemetryStore } from "@/lib/telemetry-store";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FaultLog() {
  const faults = useTelemetryStore((s) => s.faults);

  if (faults.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Event Log
        </p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="mb-2 h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            All systems operating normally
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Event Log
        </p>
        <span className="text-xs text-muted-foreground">
          {faults.length} event{faults.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ScrollArea className="h-[280px]">
        <div className="flex flex-col gap-2">
          {faults.slice(0, 20).map((fault) => (
            <div
              key={fault.id}
              className={cn(
                "flex items-start gap-3 rounded-md border px-3 py-2.5",
                fault.severity === "critical"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-accent/30 bg-accent/5"
              )}
            >
              {fault.severity === "critical" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      fault.severity === "critical"
                        ? "text-destructive"
                        : "text-accent"
                    )}
                  >
                    {fault.system}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(fault.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {fault.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
