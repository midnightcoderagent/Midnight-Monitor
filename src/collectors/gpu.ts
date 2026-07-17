import si from "systeminformation";
import type { GpuMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";
import { runCommand } from "../utils/exec.js";
import { toLines } from "../utils/text.js";

interface NvidiaSnapshot {
  vendor: "NVIDIA";
  model: string;
  driver: string | null;
  usagePercent: number | null;
  temperatureCelsius: number | null;
  powerWatts: number | null;
  clockMhz: number | null;
  encoderPercent: number | null;
  decoderPercent: number | null;
  vram: {
    totalBytes: number | null;
    usedBytes: number | null;
    freeBytes: number | null;
  } | null;
  processCount: number | null;
}

async function queryNvidiaSmi(): Promise<NvidiaSnapshot | null> {
  const result = await runCommand(
    "nvidia-smi",
    [
      "--query-gpu=name,driver_version,utilization.gpu,temperature.gpu,power.draw,clocks.sm,memory.total,memory.used,memory.free,utilization.enc,utilization.dec",
      "--format=csv,noheader,nounits"
    ],
    { timeoutMs: 3000 }
  );
  if (result.code !== 0 || result.stdout.trim().length === 0) {
    return null;
  }
  const line = toLines(result.stdout)[0];
  if (!line) {
    return null;
  }
  const columns = line.split(/\s*,\s*/);
  if (columns.length < 11) {
    return null;
  }
  const [model, driver, usage, temperature, power, clock, total, used, free, encoder, decoder] = columns;
  return {
    vendor: "NVIDIA",
    model,
    driver,
    usagePercent: Number(usage) || null,
    temperatureCelsius: Number(temperature) || null,
    powerWatts: Number(power) || null,
    clockMhz: Number(clock) || null,
    encoderPercent: Number(encoder) || null,
    decoderPercent: Number(decoder) || null,
    vram: {
      totalBytes: Number(total) * 1024 * 1024 || null,
      usedBytes: Number(used) * 1024 * 1024 || null,
      freeBytes: Number(free) * 1024 * 1024 || null
    },
    processCount: null
  };
}

async function queryRocmSmi(): Promise<GpuMetrics | null> {
  const result = await runCommand("rocm-smi", ["--showproductname", "--showdriverversion", "--showtemp", "--showuse", "--showmemuse"], {
    timeoutMs: 4000
  });
  if (result.code !== 0) {
    return null;
  }
  const lines = toLines(result.stdout);
  const nameLine = lines.find((line) => line.toLowerCase().includes("card series"));
  const tempLine = lines.find((line) => line.toLowerCase().includes("temperature"));
  const usageLine = lines.find((line) => line.toLowerCase().includes("gpu use"));
  const model = nameLine?.split(":").pop()?.trim() ?? "AMD GPU";
  const temperature = tempLine?.match(/(-?\d+(?:\.\d+)?)/)?.[1];
  const usage = usageLine?.match(/(-?\d+(?:\.\d+)?)/)?.[1];

  return {
    vendor: "AMD",
    model,
    driver: null,
    usagePercent: usage ? Number(usage) : null,
    temperatureCelsius: temperature ? Number(temperature) : null,
    powerWatts: null,
    clockMhz: null,
    encoderPercent: null,
    decoderPercent: null,
    vram: null,
    processCount: null
  };
}

async function querySystemInformationGpu(): Promise<GpuMetrics | null> {
  const graphics = await si.graphics();
  const controller = graphics.controllers[0];
  if (!controller) {
    return null;
  }
  return {
    vendor: String(controller.vendor ?? "unknown"),
    model: String(controller.model ?? "unknown"),
    driver: controller.driverVersion ?? null,
    usagePercent:
      typeof controller.utilizationGpu === "number"
        ? Number(controller.utilizationGpu.toFixed(1))
        : typeof controller.utilizationMemory === "number"
          ? Number(controller.utilizationMemory.toFixed(1))
          : null,
    temperatureCelsius:
      typeof controller.temperatureGpu === "number"
        ? Number(controller.temperatureGpu.toFixed(1))
        : null,
    powerWatts: typeof controller.powerDraw === "number" ? Number(controller.powerDraw.toFixed(1)) : null,
    clockMhz:
      typeof controller.clockCore === "number"
        ? Number(controller.clockCore.toFixed(0))
        : typeof controller.clockMemory === "number"
          ? Number(controller.clockMemory.toFixed(0))
          : null,
    encoderPercent: null,
    decoderPercent: null,
    vram: (() => {
      const raw = controller as unknown as Record<string, unknown>;
      if (typeof raw.vram !== "number") {
        return null;
      }
      const totalBytes = Math.round(raw.vram * 1024 * 1024);
      const usedBytes = typeof raw.vramUsed === "number" ? Math.round(raw.vramUsed * 1024 * 1024) : null;
      const freeBytes = typeof raw.vramFree === "number" ? Math.round(raw.vramFree * 1024 * 1024) : null;
      return { totalBytes, usedBytes, freeBytes };
    })(),
    processCount: null
  };
}

async function collectGpu(): Promise<GpuMetrics | null> {
  const nvidia = await queryNvidiaSmi();
  if (nvidia) {
    return nvidia;
  }

  const rocm = await queryRocmSmi();
  if (rocm) {
    return rocm;
  }

  try {
    return await querySystemInformationGpu();
  } catch {
    return null;
  }
}

export const createGpuCollector = createCollector<GpuMetrics>("gpu", "gpu", async () => {
  return collectGpu();
});
