import os from "node:os";
import si from "systeminformation";
import type { RamMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";

export const createRamCollector = createCollector<RamMetrics>("ram", "ram", async () => {
  const memory = await si.mem();
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;

  return {
    totalBytes,
    usedBytes,
    freeBytes,
    cacheBytes: memory.cached ?? 0,
    buffersBytes: memory.buffers ?? 0,
    usagePercent: totalBytes > 0 ? Number(((usedBytes / totalBytes) * 100).toFixed(1)) : 0
  };
});

