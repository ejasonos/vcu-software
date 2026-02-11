import type { TelemetrySnapshot, FaultEvent } from "./telemetry-store";

let tickCount = 0;
let baseVoltage = 400;
let baseCurrent = 120;
let baseVelocity = 60;
let baseAcceleration = 0;
let baseTemperature = 35;
let baseSoc = 85;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function gaussianNoise(mean: number, stdDev: number) {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function generateSnapshot(): TelemetrySnapshot {
  tickCount++;

  // Simulate driving patterns: acceleration, cruising, braking cycles
  const cycle = Math.sin(tickCount * 0.02) * 0.5 + Math.sin(tickCount * 0.005) * 0.3;
  const brakingEvent = Math.random() < 0.02;
  const accelerationEvent = Math.random() < 0.03;

  if (accelerationEvent) {
    baseAcceleration = clamp(baseAcceleration + gaussianNoise(2, 1), -4, 4);
  } else if (brakingEvent) {
    baseAcceleration = clamp(baseAcceleration - gaussianNoise(3, 1), -4, 4);
  } else {
    baseAcceleration = baseAcceleration * 0.95 + gaussianNoise(0, 0.3);
  }

  baseVelocity = clamp(baseVelocity + baseAcceleration * 0.5 + cycle * 2, 0, 180);
  baseCurrent = clamp(
    Math.abs(baseAcceleration) * 40 + baseVelocity * 0.8 + gaussianNoise(0, 5),
    0,
    500
  );
  baseVoltage = clamp(400 - baseCurrent * 0.05 + gaussianNoise(0, 2), 320, 420);
  baseTemperature = clamp(
    baseTemperature + baseCurrent * 0.002 - (baseTemperature - 25) * 0.01 + gaussianNoise(0, 0.2),
    15,
    80
  );
  baseSoc = clamp(baseSoc - baseCurrent * 0.0001, 0, 100);

  const power = (baseVoltage * baseCurrent) / 1000; // kW

  // 8 battery packs with slight variation
  const nominalPackVoltage = baseVoltage / 8;
  const batteryPacks = Array.from({ length: 8 }, (_, i) => {
    const drift = i === 3 && tickCount > 100 ? -gaussianNoise(1.5, 0.5) : 0;
    return clamp(
      nominalPackVoltage + gaussianNoise(0, 0.3) + drift,
      38,
      54
    );
  });

  return {
    timestamp: new Date().toISOString(),
    voltage: Math.round(baseVoltage * 100) / 100,
    current: Math.round(baseCurrent * 100) / 100,
    velocity: Math.round(baseVelocity * 100) / 100,
    acceleration: Math.round(baseAcceleration * 100) / 100,
    temperature: Math.round(baseTemperature * 100) / 100,
    batteryPacks: batteryPacks.map((v) => Math.round(v * 100) / 100),
    soc: Math.round(baseSoc * 10) / 10,
    power: Math.round(power * 100) / 100,
  };
}

export function checkFaults(snapshot: TelemetrySnapshot): FaultEvent[] {
  const faults: FaultEvent[] = [];

  if (snapshot.temperature > 55) {
    faults.push({
      id: `fault-${Date.now()}-temp`,
      timestamp: snapshot.timestamp,
      severity: snapshot.temperature > 65 ? "critical" : "warning",
      system: "Thermal Management",
      message: `Motor temperature ${snapshot.temperature > 65 ? "critically high" : "elevated"}: ${snapshot.temperature}°C`,
      value: snapshot.temperature,
      threshold: snapshot.temperature > 65 ? 65 : 55,
    });
  }

  if (snapshot.current > 350) {
    faults.push({
      id: `fault-${Date.now()}-current`,
      timestamp: snapshot.timestamp,
      severity: snapshot.current > 420 ? "critical" : "warning",
      system: "Power Electronics",
      message: `Overcurrent ${snapshot.current > 420 ? "critical" : "detected"}: ${snapshot.current}A`,
      value: snapshot.current,
      threshold: snapshot.current > 420 ? 420 : 350,
    });
  }

  if (snapshot.voltage < 340) {
    faults.push({
      id: `fault-${Date.now()}-voltage`,
      timestamp: snapshot.timestamp,
      severity: snapshot.voltage < 330 ? "critical" : "warning",
      system: "Battery System",
      message: `Undervoltage ${snapshot.voltage < 330 ? "critical" : "warning"}: ${snapshot.voltage}V`,
      value: snapshot.voltage,
      threshold: snapshot.voltage < 330 ? 330 : 340,
    });
  }

  // Check for battery pack imbalance
  const packAvg = snapshot.batteryPacks.reduce((a, b) => a + b, 0) / snapshot.batteryPacks.length;
  snapshot.batteryPacks.forEach((packV, i) => {
    const deviation = Math.abs(packV - packAvg);
    if (deviation > 2) {
      faults.push({
        id: `fault-${Date.now()}-pack${i}`,
        timestamp: snapshot.timestamp,
        severity: deviation > 3.5 ? "critical" : "warning",
        system: `Battery Pack ${i + 1}`,
        message: `Pack ${i + 1} voltage deviation: ${packV}V (avg: ${packAvg.toFixed(1)}V)`,
        value: packV,
        threshold: packAvg,
      });
    }
  });

  if (snapshot.soc < 10) {
    faults.push({
      id: `fault-${Date.now()}-soc`,
      timestamp: snapshot.timestamp,
      severity: snapshot.soc < 5 ? "critical" : "warning",
      system: "Battery System",
      message: `Low state of charge: ${snapshot.soc}%`,
      value: snapshot.soc,
      threshold: snapshot.soc < 5 ? 5 : 10,
    });
  }

  return faults;
}

export function resetSimulation() {
  tickCount = 0;
  baseVoltage = 400;
  baseCurrent = 120;
  baseVelocity = 60;
  baseAcceleration = 0;
  baseTemperature = 35;
  baseSoc = 85;
}
