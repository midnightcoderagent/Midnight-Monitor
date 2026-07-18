import si from "systeminformation";
import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
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

type NumericRecord = Record<string, unknown>;

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.+-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickNumber(record: NumericRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = parseNumber(record[key]);
    if (value !== null) {
      return value;
    }
  }
  return null;
}

function normalizeVendor(value: string | null | undefined): "NVIDIA" | "AMD" | "Intel" | string {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("nvidia")) return "NVIDIA";
  if (normalized.includes("amd") || normalized.includes("ati") || normalized.includes("radeon")) return "AMD";
  if (normalized.includes("intel")) return "Intel";
  return value?.trim() || "unknown";
}

async function readLinuxSysfsVram(): Promise<GpuMetrics["vram"] | null> {
  try {
    const cards = await readdir("/sys/class/drm", { withFileTypes: true });
    for (const entry of cards) {
      if (!entry.name.startsWith("card")) {
        continue;
      }
      const devicePath = `/sys/class/drm/${entry.name}/device`;
      try {
        const [total, used, free] = await Promise.all([
          readFile(`${devicePath}/mem_info_vram_total`, "utf8").catch(() => null),
          readFile(`${devicePath}/mem_info_vram_used`, "utf8").catch(() => null),
          readFile(`${devicePath}/mem_info_vram_free`, "utf8").catch(() => null)
        ]);
        const totalBytes = parseNumber(total ?? undefined);
        const usedBytes = parseNumber(used ?? undefined);
        const freeBytes = parseNumber(free ?? undefined);
        if (totalBytes !== null || usedBytes !== null || freeBytes !== null) {
          return {
            totalBytes,
            usedBytes,
            freeBytes
          };
        }
      } catch {
        // Try next card.
      }
    }
  } catch {
    // Not Linux or not accessible.
  }
  return null;
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
    model: model.trim(),
    driver: driver.trim(),
    usagePercent: parseNumber(usage),
    temperatureCelsius: parseNumber(temperature),
    powerWatts: parseNumber(power),
    clockMhz: parseNumber(clock),
    encoderPercent: parseNumber(encoder),
    decoderPercent: parseNumber(decoder),
    vram: {
      totalBytes: parseNumber(total) !== null ? parseNumber(total)! * 1024 * 1024 : null,
      usedBytes: parseNumber(used) !== null ? parseNumber(used)! * 1024 * 1024 : null,
      freeBytes: parseNumber(free) !== null ? parseNumber(free)! * 1024 * 1024 : null
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
  const controllers = graphics.controllers ?? [];
  if (!controllers.length) {
    return null;
  }

  const rawControllers = controllers as unknown as NumericRecord[];
  const controller =
    rawControllers.find((entry) => normalizeVendor(String(entry.vendor ?? "")).toLowerCase() !== "intel") ??
    rawControllers[0];
  const vram = (() => {
    const totalBytes =
      pickNumber(controller, ["vram", "vramTotal", "memoryTotal", "memoryTotalDedicated", "memory_total"]) ??
      null;
    const usedBytes =
      pickNumber(controller, ["vramUsed", "vram_used", "memoryUsed", "memoryUsedDedicated", "memory_used"]) ??
      null;
    const freeBytes =
      pickNumber(controller, ["vramFree", "vram_free", "memoryFree", "memoryFreeDedicated", "memory_free"]) ??
      null;
    if (totalBytes !== null || usedBytes !== null || freeBytes !== null) {
      return {
        totalBytes: totalBytes !== null ? Math.round(totalBytes * 1024 * 1024) : null,
        usedBytes: usedBytes !== null ? Math.round(usedBytes * 1024 * 1024) : null,
        freeBytes: freeBytes !== null ? Math.round(freeBytes * 1024 * 1024) : null
      };
    }
    return null;
  })();

  return {
    vendor: normalizeVendor(String(controller.vendor ?? "unknown")),
    model: String(controller.model ?? controller.name ?? "unknown"),
    driver: typeof controller.driverVersion === "string" ? controller.driverVersion : null,
    usagePercent:
      pickNumber(controller, ["utilizationGpu", "utilizationGPU", "gpuUtilization", "loadGpu", "load"]) ??
      pickNumber(controller, ["utilizationMemory", "memoryUtilization"]) ??
      null,
    temperatureCelsius: pickNumber(controller, ["temperatureGpu", "temperature", "temp"]) ?? null,
    powerWatts: pickNumber(controller, ["powerDraw", "power", "powerConsumption"]) ?? null,
    clockMhz:
      pickNumber(controller, ["clockCore", "clockGpu", "clock", "coreClock"]) ??
      pickNumber(controller, ["clockMemory", "memoryClock"]) ??
      null,
    encoderPercent: null,
    decoderPercent: null,
    vram,
    processCount: null
  };
}

async function collectGpu(): Promise<GpuMetrics | null> {
  const sysfsVram = await readLinuxSysfsVram();

  const nvidia = await queryNvidiaSmi();
  if (nvidia) {
    return {
      ...nvidia,
      vram: sysfsVram ?? nvidia.vram ?? null
    };
  }

  const rocm = await queryRocmSmi();
  if (rocm) {
    return {
      ...rocm,
      vram: rocm.vram ?? sysfsVram ?? null
    };
  }

  try {
    const systeminfo = await querySystemInformationGpu();
    if (systeminfo) {
      return {
        ...systeminfo,
        vram: sysfsVram ?? systeminfo.vram ?? null
      };
    }
  } catch {
    // Ignore and fall through to sysfs-only fallback.
  }

  if (sysfsVram) {
    return {
      vendor: "unknown",
      model: "unknown",
      driver: null,
      usagePercent: null,
      temperatureCelsius: null,
      powerWatts: null,
      clockMhz: null,
      encoderPercent: null,
      decoderPercent: null,
      vram: sysfsVram,
      processCount: null
    };
  }

  return null;
}

export const createGpuCollector = createCollector<GpuMetrics>("gpu", "gpu", async () => {
  return collectGpu();
});
