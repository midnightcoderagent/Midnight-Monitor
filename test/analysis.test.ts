import { describe, expect, it } from "vitest";
import { analyzeSnapshot } from "../src/utils/analysis.js";
import type { MetricsSnapshot } from "../src/types/metrics.js";

function createSnapshot(overrides: Partial<MetricsSnapshot>): MetricsSnapshot {
  return {
    timestamp: "2026-07-17T12:00:00.000Z",
    cpu: null,
    ram: null,
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
    analysis: [],
    ...overrides
  };
}

describe("analyzeSnapshot", () => {
  it("flags high ram usage", () => {
    const findings = analyzeSnapshot(
      createSnapshot({
        ram: {
          totalBytes: 100,
          usedBytes: 95,
          freeBytes: 5,
          cacheBytes: 0,
          buffersBytes: 0,
          usagePercent: 95
        }
      })
    );
    expect(findings.some((finding) => finding.severity === "critical")).toBe(true);
  });
});

