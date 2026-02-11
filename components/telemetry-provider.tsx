"use client";

import React from "react"

import { useEffect, useRef } from "react";
import { useTelemetryStore } from "@/lib/telemetry-store";
import {
  generateSnapshot,
  checkFaults,
} from "@/lib/telemetry-simulator";
import { generateSeedData } from "@/lib/seed-data";

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const addSnapshot = useTelemetryStore((s) => s.addSnapshot);
  const addFault = useTelemetryStore((s) => s.addFault);
  const isStreaming = useTelemetryStore((s) => s.isStreaming);
  const history = useTelemetryStore((s) => s.history);
  const seeded = useRef(false);

  // Seed initial data
  useEffect(() => {
    if (seeded.current || history.length > 0) return;
    seeded.current = true;
    const seedData = generateSeedData(120);
    seedData.forEach((snapshot) => {
      addSnapshot(snapshot);
    });
  }, [addSnapshot, history.length]);

  // Stream new data
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const snapshot = generateSnapshot();
      addSnapshot(snapshot);

      const faults = checkFaults(snapshot);
      faults.forEach((fault) => addFault(fault));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, addSnapshot, addFault]);

  return <>{children}</>;
}
