"use client";

import { useTelemetryStore } from "@/lib/telemetry-store";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetSimulation } from "@/lib/telemetry-simulator";

export function DashboardHeader({ title }: { title: string }) {
  const isStreaming = useTelemetryStore((s) => s.isStreaming);
  const setStreaming = useTelemetryStore((s) => s.setStreaming);
  const clearHistory = useTelemetryStore((s) => s.clearHistory);
  const history = useTelemetryStore((s) => s.history);
  const latest = history[history.length - 1];

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">
          {latest
            ? `Last update: ${new Date(latest.timestamp).toLocaleTimeString()}`
            : "Awaiting data..."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStreaming(!isStreaming)}
          className="gap-2 border-border text-foreground hover:bg-secondary"
        >
          {isStreaming ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isStreaming ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetSimulation();
            clearHistory();
          }}
          className="gap-2 border-border text-foreground hover:bg-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </header>
  );
}
