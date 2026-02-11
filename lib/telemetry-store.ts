import { create } from "zustand";

export interface TelemetrySnapshot {
  timestamp: string;
  voltage: number;
  current: number;
  velocity: number;
  acceleration: number;
  temperature: number;
  batteryPacks: number[];
  soc: number;
  power: number;
}

export interface FaultEvent {
  id: string;
  timestamp: string;
  severity: "normal" | "warning" | "critical";
  system: string;
  message: string;
  value: number;
  threshold: number;
}

interface TelemetryState {
  history: TelemetrySnapshot[];
  faults: FaultEvent[];
  isStreaming: boolean;
  addSnapshot: (snapshot: TelemetrySnapshot) => void;
  addFault: (fault: FaultEvent) => void;
  setStreaming: (streaming: boolean) => void;
  clearHistory: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  history: [],
  faults: [],
  isStreaming: true,
  addSnapshot: (snapshot) =>
    set((state) => ({
      history: [...state.history.slice(-299), snapshot],
    })),
  addFault: (fault) =>
    set((state) => ({
      faults: [fault, ...state.faults].slice(0, 50),
    })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  clearHistory: () => set({ history: [], faults: [] }),
}));
