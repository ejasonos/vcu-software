"use client";

import { useTelemetryStore } from "@/lib/telemetry-store";
import { DashboardHeader } from "@/components/dashboard-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function PackStatusBadge({ status }: { status: "normal" | "warning" | "critical" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "normal" && "bg-primary/10 text-primary",
        status === "warning" && "bg-accent/10 text-accent",
        status === "critical" && "bg-destructive/10 text-destructive"
      )}
    >
      {status === "normal" ? "Normal" : status === "warning" ? "Warning" : "Critical"}
    </span>
  );
}

const CustomBarTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{payload[0].payload.name}</p>
        <p className="text-sm font-semibold text-foreground">
          {payload[0].value.toFixed(2)} V
        </p>
      </div>
    );
  }
  return null;
};

export default function BatteryPage() {
  const history = useTelemetryStore((s) => s.history);
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <>
        <DashboardHeader title="Battery Analysis" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading battery data...</p>
        </div>
      </>
    );
  }

  const packAvg =
    latest.batteryPacks.reduce((a, b) => a + b, 0) / latest.batteryPacks.length;
  const packMin = Math.min(...latest.batteryPacks);
  const packMax = Math.max(...latest.batteryPacks);
  const imbalance = packMax - packMin;

  const barData = latest.batteryPacks.map((v, i) => ({
    name: `Pack ${i + 1}`,
    voltage: v,
    deviation: Math.abs(v - packAvg),
    fill:
      Math.abs(v - packAvg) > 3.5
        ? "hsl(0 72% 51%)"
        : Math.abs(v - packAvg) > 2
          ? "hsl(38 92% 50%)"
          : "hsl(152 60% 48%)",
  }));

  // Historical pack data for the last 60 points
  const packHistory = history.slice(-60).map((snapshot, index) => {
    const entry: Record<string, unknown> = {
      time: new Date(snapshot.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      index,
    };
    snapshot.batteryPacks.forEach((v, i) => {
      entry[`pack${i + 1}`] = v;
    });
    return entry;
  });

  const packColors = [
    "hsl(152 60% 48%)",
    "hsl(199 89% 48%)",
    "hsl(38 92% 50%)",
    "hsl(0 72% 51%)",
    "hsl(262 60% 55%)",
    "hsl(152 60% 68%)",
    "hsl(199 89% 68%)",
    "hsl(38 92% 70%)",
  ];

  return (
    <>
      <DashboardHeader title="Battery Analysis" />
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                System Voltage
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {latest.voltage.toFixed(1)}{" "}
                <span className="text-sm text-muted-foreground">V</span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Average Pack
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {packAvg.toFixed(2)}{" "}
                <span className="text-sm text-muted-foreground">V</span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Imbalance
              </p>
              <p
                className={cn(
                  "mt-2 text-2xl font-bold",
                  imbalance > 3.5
                    ? "text-destructive"
                    : imbalance > 2
                      ? "text-accent"
                      : "text-primary"
                )}
              >
                {imbalance.toFixed(2)}{" "}
                <span className="text-sm text-muted-foreground">V</span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                State of Charge
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {latest.soc.toFixed(1)}{" "}
                <span className="text-sm text-muted-foreground">%</span>
              </p>
            </div>
          </div>

          {/* Pack Voltage Bar Chart */}
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Battery Pack Voltages
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-[10px] text-muted-foreground">Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-[10px] text-muted-foreground">Critical</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220 14% 18%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(215 15% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[
                    Math.floor(packMin - 2),
                    Math.ceil(packMax + 2),
                  ]}
                  width={45}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="voltage"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(152 60% 48%)"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pack Details Table */}
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pack Details
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                      Pack
                    </th>
                    <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                      Voltage
                    </th>
                    <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                      Deviation
                    </th>
                    <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {latest.batteryPacks.map((v, i) => {
                    const deviation = Math.abs(v - packAvg);
                    const status =
                      deviation > 3.5
                        ? ("critical" as const)
                        : deviation > 2
                          ? ("warning" as const)
                          : ("normal" as const);
                    return (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2.5 text-sm text-foreground">
                          Pack {i + 1}
                        </td>
                        <td className="py-2.5 text-right font-mono text-sm text-foreground">
                          {v.toFixed(2)} V
                        </td>
                        <td
                          className={cn(
                            "py-2.5 text-right font-mono text-sm",
                            status === "normal" && "text-muted-foreground",
                            status === "warning" && "text-accent",
                            status === "critical" && "text-destructive"
                          )}
                        >
                          {deviation > 0.01 ? "+" : ""}
                          {(v - packAvg).toFixed(2)} V
                        </td>
                        <td className="py-2.5 text-right">
                          <PackStatusBadge status={status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Pack Voltages */}
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pack Voltage History
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: packColors[i] }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      P{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={packHistory}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220 14% 18%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={60}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[38, 54]}
                  width={45}
                />
                {Array.from({ length: 8 }, (_, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`pack${i + 1}`}
                    stroke={packColors[i]}
                    strokeWidth={1.5}
                    dot={false}
                    animationDuration={300}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
