import { readFile } from "node:fs/promises";
import si from "systeminformation";
import type { SwapMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";

function parseMemInfo(input: string): SwapMetrics | null {
  const entries = new Map<string, number>();
  for (const line of input.split(/\r?\n/)) {
    const match = line.match(/^(\w+):\s+(\d+)\s+kB$/);
    if (match) {
      entries.set(match[1], Number(match[2]) * 1024);
    }
  }
  const totalBytes = entries.get("SwapTotal");
  const freeBytes = entries.get("SwapFree");
  if (typeof totalBytes !== "number" || typeof freeBytes !== "number") {
    return null;
  }
  const usedBytes = Math.max(0, totalBytes - freeBytes);
  return {
    totalBytes,
    usedBytes,
    freeBytes,
    usagePercent: totalBytes > 0 ? Number(((usedBytes / totalBytes) * 100).toFixed(1)) : 0
  };
}

async function collectSwap(): Promise<SwapMetrics> {
  const systemInformation = si as typeof si & {
    memSwap: () => Promise<{ total?: number; used?: number; free?: number }>;
  };
  if (process.platform === "linux") {
    try {
      const meminfo = await readFile("/proc/meminfo", "utf8");
      const parsed = parseMemInfo(meminfo);
      if (parsed) {
        return parsed;
      }
    } catch {
      // Fall through.
    }
  }

  if (process.platform === "win32") {
    try {
      const swap = await systemInformation.memSwap();
      return {
        totalBytes: swap.total ?? 0,
        usedBytes: swap.used ?? 0,
        freeBytes: swap.free ?? Math.max(0, (swap.total ?? 0) - (swap.used ?? 0)),
        usagePercent: swap.total ? Number((((swap.used ?? 0) / swap.total) * 100).toFixed(1)) : 0
      };
    } catch {
      // Fall through.
    }
  }

  const swap = await systemInformation.memSwap();
  return {
    totalBytes: swap.total ?? 0,
    usedBytes: swap.used ?? 0,
    freeBytes: swap.free ?? Math.max(0, (swap.total ?? 0) - (swap.used ?? 0)),
    usagePercent: swap.total ? Number((((swap.used ?? 0) / swap.total) * 100).toFixed(1)) : 0
  };
}

export const createSwapCollector = createCollector<SwapMetrics>("swap", "swap", async () => {
  return collectSwap();
});
