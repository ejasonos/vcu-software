"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface TelemetryChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  title: string;
  color: string;
  unit: string;
  height?: number;
  showArea?: boolean;
  domain?: [number | string, number | string];
}

export function TelemetryChart({
  data,
  dataKey,
  title,
  color,
  unit,
  height = 200,
  showArea = false,
  domain,
}: TelemetryChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    index,
    time: item.timestamp
      ? new Date(item.timestamp as string).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : index.toString(),
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-sm font-semibold text-foreground">
            {payload[0].value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  if (showArea) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              domain={domain}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#gradient-${dataKey})`}
              strokeWidth={1.5}
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
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
            domain={domain}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
