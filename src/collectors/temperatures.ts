import si from "systeminformation";
import type { TemperatureMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";

export const createTemperatureCollector = createCollector<TemperatureMetrics>(
  "temperatures",
  "temperatures",
  async () => {
    const [cpu, graphics] = await Promise.all([si.cpuTemperature(), si.graphics()]);
    const controller = graphics.controllers[0];
    const gpuTemperature =
      typeof controller?.temperatureGpu === "number"
        ? controller.temperatureGpu
        : null;
    const fanSpeed = typeof controller?.fanSpeed === "number" ? controller.fanSpeed : null;

    return {
      cpuCelsius: typeof cpu.main === "number" && cpu.main > 0 ? Number(cpu.main.toFixed(1)) : null,
      gpuCelsius: typeof gpuTemperature === "number" ? Number(gpuTemperature.toFixed(1)) : null,
      fanRpm: typeof fanSpeed === "number" ? Number(fanSpeed.toFixed(0)) : null
    };
  }
);
