"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useTelemetryStore } from "@/lib/telemetry-store";
import { DashboardHeader } from "@/components/dashboard-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function buildTelemetrySummary(
  history: ReturnType<typeof useTelemetryStore.getState>["history"],
  faults: ReturnType<typeof useTelemetryStore.getState>["faults"]
) {
  if (history.length === 0) return "No telemetry data available.";

  const latest = history[history.length - 1];
  const last30 = history.slice(-30);

  const avgVoltage = last30.reduce((a, b) => a + b.voltage, 0) / last30.length;
  const avgCurrent = last30.reduce((a, b) => a + b.current, 0) / last30.length;
  const avgTemp = last30.reduce((a, b) => a + b.temperature, 0) / last30.length;
  const maxTemp = Math.max(...last30.map((s) => s.temperature));
  const maxCurrent = Math.max(...last30.map((s) => s.current));
  const minVoltage = Math.min(...last30.map((s) => s.voltage));

  const packAvg =
    latest.batteryPacks.reduce((a, b) => a + b, 0) / latest.batteryPacks.length;
  const packImbalances = latest.batteryPacks.map(
    (v, i) => `Pack ${i + 1}: ${v.toFixed(2)}V (dev: ${(v - packAvg).toFixed(2)}V)`
  );

  const recentFaults = faults.slice(0, 10);

  return `
CURRENT EV TELEMETRY DATA:
- System Voltage: ${latest.voltage.toFixed(1)}V (30s avg: ${avgVoltage.toFixed(1)}V, min: ${minVoltage.toFixed(1)}V)
- System Current: ${latest.current.toFixed(1)}A (30s avg: ${avgCurrent.toFixed(1)}A, max: ${maxCurrent.toFixed(1)}A)
- Vehicle Speed: ${latest.velocity.toFixed(1)} km/h
- Acceleration: ${latest.acceleration.toFixed(2)} m/s²
- Temperature: ${latest.temperature.toFixed(1)}°C (30s avg: ${avgTemp.toFixed(1)}°C, max: ${maxTemp.toFixed(1)}°C)
- State of Charge: ${latest.soc.toFixed(1)}%
- Power Output: ${latest.power.toFixed(1)} kW

BATTERY PACK VOLTAGES:
${packImbalances.join("\n")}
Pack Average: ${packAvg.toFixed(2)}V
Max Imbalance: ${(Math.max(...latest.batteryPacks) - Math.min(...latest.batteryPacks)).toFixed(2)}V

RECENT FAULT EVENTS (${recentFaults.length}):
${recentFaults.length > 0 ? recentFaults.map((f) => `[${f.severity.toUpperCase()}] ${f.system}: ${f.message}`).join("\n") : "No recent faults."}

DATA HISTORY: ${history.length} snapshots over ${history.length}s
  `.trim();
}

const QUICK_PROMPTS = [
  "Analyze the current system health and predict potential faults",
  "Are there any battery pack imbalances that need attention?",
  "What is the thermal risk assessment for the motor system?",
  "Predict the remaining range based on current consumption patterns",
  "Is the current draw within safe limits for extended operation?",
];

export default function DiagnosticsPage() {
  const [input, setInput] = useState("");
  const history = useTelemetryStore((s) => s.history);
  const faults = useTelemetryStore((s) => s.faults);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/diagnostics" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    const telemetryContext = buildTelemetrySummary(history, faults);
    sendMessage({
      text: `${text}\n\n---\n${telemetryContext}`,
    });
    setInput("");
  };

  const criticalFaults = faults.filter((f) => f.severity === "critical");
  const warningFaults = faults.filter((f) => f.severity === "warning");

  return (
    <>
      <DashboardHeader title="AI Diagnostics" />
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  AI Fault Prediction
                </h2>
                <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
                  Ask the AI to analyze your EV telemetry data, predict faults,
                  and provide maintenance recommendations based on real-time
                  sensor readings.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-secondary-foreground transition-colors hover:bg-muted"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-4 py-3 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground"
                      )}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          // Strip the telemetry context from user messages
                          const text =
                            message.role === "user"
                              ? part.text.split("\n\n---\n")[0]
                              : part.text;
                          return (
                            <div
                              key={index}
                              className="whitespace-pre-wrap leading-relaxed"
                            >
                              {text}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing telemetry data...
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border bg-card px-6 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about system health, predict faults, or request analysis..."
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Panel: Fault Summary */}
        <div className="hidden w-72 flex-col border-l border-border bg-card xl:flex">
          <div className="border-b border-border px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fault Summary
            </p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {/* Health Score */}
              <div className="rounded-lg border border-border bg-secondary p-4 text-center">
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p
                  className={cn(
                    "mt-1 text-3xl font-bold",
                    criticalFaults.length > 0
                      ? "text-destructive"
                      : warningFaults.length > 0
                        ? "text-accent"
                        : "text-primary"
                  )}
                >
                  {Math.max(
                    0,
                    100 - criticalFaults.length * 15 - warningFaults.length * 5
                  )}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">out of 100</p>
              </div>

              {/* Subsystem Status */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Subsystem Status
                </p>
                {[
                  "Battery System",
                  "Thermal Management",
                  "Power Electronics",
                  "Motor Controller",
                  "Charging System",
                ].map((system) => {
                  const systemFaults = faults.filter((f) =>
                    f.system.includes(system.split(" ")[0])
                  );
                  const hasCritical = systemFaults.some(
                    (f) => f.severity === "critical"
                  );
                  const hasWarning = systemFaults.some(
                    (f) => f.severity === "warning"
                  );
                  return (
                    <div
                      key={system}
                      className="flex items-center justify-between border-b border-border/50 py-2"
                    >
                      <span className="text-xs text-foreground">{system}</span>
                      {hasCritical ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : hasWarning ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Key Metrics */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Key Metrics
                </p>
                {history.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: "Voltage",
                        value: `${history[history.length - 1].voltage.toFixed(1)}V`,
                      },
                      {
                        label: "Current",
                        value: `${history[history.length - 1].current.toFixed(1)}A`,
                      },
                      {
                        label: "Temperature",
                        value: `${history[history.length - 1].temperature.toFixed(1)}°C`,
                      },
                      {
                        label: "SoC",
                        value: `${history[history.length - 1].soc.toFixed(1)}%`,
                      },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-muted-foreground">
                          {metric.label}
                        </span>
                        <span className="font-mono text-xs text-foreground">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
