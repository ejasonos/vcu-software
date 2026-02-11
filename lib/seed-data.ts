import type { TelemetrySnapshot } from "./telemetry-store";
import { generateSnapshot, resetSimulation } from "./telemetry-simulator";

export function generateSeedData(count: number = 120): TelemetrySnapshot[] {
  resetSimulation();
  const data: TelemetrySnapshot[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const snapshot = generateSnapshot();
    snapshot.timestamp = new Date(now - (count - i) * 1000).toISOString();
    data.push(snapshot);
  }

  return data;
}
