import type { AnalysisFinding, MetricsSnapshot } from "../types/metrics.js";

function percent(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function analyzeSnapshot(snapshot: MetricsSnapshot): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];

  const gpu = snapshot.gpu;
  const ram = snapshot.ram;
  const swap = snapshot.swap;
  const temperature = snapshot.temperatures;
  const history = snapshot.history?.last10Minutes ?? [];

  if (gpu?.vram?.totalBytes && gpu.vram.usedBytes) {
    const usedPercent = (gpu.vram.usedBytes / gpu.vram.totalBytes) * 100;
    if (usedPercent >= 95) {
      findings.push({
        severity: "warning",
        source: "gpu.vram",
        message: "VRAM almost full. Model may spill into RAM.",
        suggestion: "Lower context length, use a smaller quantization, or free other GPU workloads.",
        details: { usedPercent: Number(usedPercent.toFixed(1)) }
      });
    }
  }

  if (swap && swap.usedBytes > 0) {
    const first = history[0]?.swapUsedBytes ?? null;
    const last = history[history.length - 1]?.swapUsedBytes ?? null;
    if (typeof first === "number" && typeof last === "number" && last > first) {
      findings.push({
        severity: "warning",
        source: "swap",
        message: "Swap usage detected. Inference performance may decrease.",
        suggestion: "Reduce concurrent model load or increase RAM / swap.",
        details: { startBytes: first, endBytes: last }
      });
    }
  } else if (swap && swap.totalBytes === 0) {
    findings.push({
      severity: "info",
      source: "swap",
      message: "No swap is configured.",
      suggestion: "Create swap for better stability."
    });
  }

  const ramUsage = percent(ram?.usagePercent);
  if (ramUsage !== null && ramUsage >= 90) {
    findings.push({
      severity: "critical",
      source: "ram",
      message: "Memory exhaustion likely.",
      suggestion: "Stop background workloads, lower model concurrency, or add more RAM.",
      details: { usagePercent: Number(ramUsage.toFixed(1)) }
    });
  }

  const temp = percent(temperature?.gpuCelsius ?? temperature?.cpuCelsius);
  if (temp !== null && temp >= 85) {
    findings.push({
      severity: "warning",
      source: "temperature",
      message: "GPU temperature is high.",
      suggestion: "Improve cooling or reduce sustained load.",
      details: { celsius: Number(temp.toFixed(1)) }
    });
  }

  const gpuUsage = percent(gpu?.usagePercent);
  if (gpuUsage !== null && gpuUsage >= 95) {
    findings.push({
      severity: "warning",
      source: "gpu.usage",
      message: "GPU utilization is saturated.",
      suggestion: "Inference may queue behind competing GPU work."
    });
  }

  const hasRecentDrop = history.length >= 2
    ? (history[history.length - 2]?.generationSpeed ?? null) !== null &&
      (history[history.length - 1]?.generationSpeed ?? null) !== null &&
      (history[history.length - 1]?.generationSpeed ?? 0) < (history[history.length - 2]?.generationSpeed ?? 0) * 0.8
    : false;

  if (hasRecentDrop && (swap?.usedBytes ?? 0) > 0) {
    findings.push({
      severity: "warning",
      source: "analysis",
      message: "Inference appears slower and swap is active.",
      suggestion: "Move the model to more VRAM or reduce context / concurrency."
    });
  }

  return findings;
}

