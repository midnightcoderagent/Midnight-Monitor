import { describe, expect, it } from "vitest";
import { HistoryStore } from "../src/utils/history-store.js";
import type { MetricsSnapshot } from "../src/types/metrics.js";

function makeSnapshot(cpuUsage: number, usedBytes: number): MetricsSnapshot {
  return {
    timestamp: new Date().toISOString(),
    cpu: {
      usage: cpuUsage,
      cores: 8,
      threads: 16,
      loadAverage: [0, 0, 0],
      frequencyMhz: 3000,
      uptimeSeconds: 10
    },
    ram: {
      totalBytes: 1000,
      usedBytes,
      freeBytes: 1000 - usedBytes,
      cacheBytes: 0,
      buffersBytes: 0,
      usagePercent: (usedBytes / 1000) * 100
    },
    swap: null,
    gpu: null,
    disk: null,
    network: null,
    temperatures: null,
    ollama: null,
    llamacpp: null,
    processes: null,
    history: {
      last60Seconds: [],
      last10Minutes: [],
      lastHour: []
    },
    analysis: []
  };
}

describe("HistoryStore", () => {
  it("keeps rolling snapshots", () => {
    const history = new HistoryStore(60, 600, 3600);
    history.push(makeSnapshot(10, 100));
    history.push(makeSnapshot(20, 200));
    const snapshot = history.snapshot();
    expect(snapshot.last60Seconds.length).toBe(2);
  });
});

