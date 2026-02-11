"use client";

import { useTelemetryStore } from "@/lib/telemetry-store";
import { DashboardHeader } from "@/components/dashboard-header";
import { MetricCard } from "@/components/metric-card";
import { TelemetryChart } from "@/components/telemetry-chart";
import { FaultLog } from "@/components/fault-log";
import {
  Zap,
  Gauge,
  Thermometer,
  Activity,
  Battery,
  BoltIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function getStatus(value: number, warning: number, critical: number, inverted = false) {
  if (inverted) {
    if (value < critical) return "critical" as const;
    if (value < warning) return "warning" as const;
    return "normal" as const;
  }
  if (value > critical) return "critical" as const;
  if (value > warning) return "warning" as const;
  return "normal" as const;
}

export default function DashboardPage() {
  const history = useTelemetryStore((s) => s.history);
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading telemetry data...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader title="Dashboard Overview" />
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="Voltage"
              value={latest.voltage.toFixed(1)}
              unit="V"
              icon={Zap}
              status={getStatus(latest.voltage, 345, 335, true)}
              subtitle={`Pack: ${(latest.voltage / 8).toFixed(1)}V avg`}
            />
            <MetricCard
              label="Current"
              value={latest.current.toFixed(1)}
              unit="A"
              icon={BoltIcon}
              status={getStatus(latest.current, 350, 420)}
              subtitle={`Power: ${latest.power.toFixed(1)} kW`}
            />
            <MetricCard
              label="Speed"
              value={latest.velocity.toFixed(1)}
              unit="km/h"
              icon={Gauge}
              status="normal"
              subtitle={`Accel: ${latest.acceleration.toFixed(2)} m/s²`}
            />
            <MetricCard
              label="Acceleration"
              value={latest.acceleration.toFixed(2)}
              unit="m/s²"
              icon={Activity}
              status={getStatus(Math.abs(latest.acceleration), 3, 3.8)}
            />
            <MetricCard
              label="Temperature"
              value={latest.temperature.toFixed(1)}
              unit="°C"
              icon={Thermometer}
              status={getStatus(latest.temperature, 55, 65)}
              subtitle="Motor / Controller"
            />
            <MetricCard
              label="SoC"
              value={latest.soc.toFixed(1)}
              unit="%"
              icon={Battery}
              status={getStatus(latest.soc, 15, 5, true)}
              subtitle="State of Charge"
            />
          </div>

          {/* Charts Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TelemetryChart
              data={history}
              dataKey="voltage"
              title="System Voltage"
              color="hsl(152 60% 48%)"
              unit="V"
              showArea
              domain={[320, 420]}
            />
            <TelemetryChart
              data={history}
              dataKey="current"
              title="System Current"
              color="hsl(199 89% 48%)"
              unit="A"
              showArea
              domain={[0, "auto"]}
            />
            <TelemetryChart
              data={history}
              dataKey="velocity"
              title="Vehicle Speed"
              color="hsl(152 60% 48%)"
              unit="km/h"
              domain={[0, "auto"]}
            />
            <TelemetryChart
              data={history}
              dataKey="temperature"
              title="Temperature"
              color="hsl(38 92% 50%)"
              unit="°C"
              showArea
              domain={[15, 80]}
            />
          </div>

          {/* Bottom Section */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TelemetryChart
              data={history}
              dataKey="power"
              title="Power Output"
              color="hsl(262 60% 55%)"
              unit="kW"
              showArea
              domain={[0, "auto"]}
            />
            <FaultLog />
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
