import os from "node:os";
import si from "systeminformation";
import type { CpuMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";

export const createCpuCollector = createCollector<CpuMetrics>("cpu", "cpu", async () => {
  const load = await si.currentLoad();
  const speed = await si.cpuCurrentSpeed();
  const cores = os.cpus().length;

  return {
    usage: Number(load.currentLoad.toFixed(1)),
    cores,
    threads: cores,
    loadAverage: os.loadavg() as [number, number, number],
    frequencyMhz: Number((speed.avg ?? speed.max ?? 0).toFixed(0)),
    uptimeSeconds: Math.floor(os.uptime())
  };
});

