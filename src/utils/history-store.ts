import type { HistoryMetrics, HistorySeriesPoint, MetricsSnapshot } from "../types/metrics.js";

export class HistoryStore {
  private readonly samples: HistorySeriesPoint[] = [];

  public constructor(
    private readonly seconds: number,
    private readonly tenMinutes: number,
    private readonly hour: number
  ) {}

  public push(snapshot: MetricsSnapshot): void {
    const point: HistorySeriesPoint = {
      timestamp: snapshot.timestamp,
      cpuUsage: snapshot.cpu?.usage ?? null,
      ramUsedBytes: snapshot.ram?.usedBytes ?? null,
      swapUsedBytes: snapshot.swap?.usedBytes ?? null,
      gpuUsagePercent: snapshot.gpu?.usagePercent ?? null,
      vramUsedBytes: snapshot.gpu?.vram?.usedBytes ?? null,
      temperatureCelsius: snapshot.temperatures?.gpuCelsius ?? snapshot.temperatures?.cpuCelsius ?? null,
      generationSpeed: this.extractGenerationSpeed(snapshot)
    };
    this.samples.push(point);
    const maxSamples = Math.max(this.hour, this.tenMinutes, this.seconds) + 5;
    if (this.samples.length > maxSamples) {
      this.samples.splice(0, this.samples.length - maxSamples);
    }
  }

  public snapshot(): HistoryMetrics {
    return {
      last60Seconds: this.sliceWindow(this.seconds),
      last10Minutes: this.sliceWindow(this.tenMinutes),
      lastHour: this.sliceWindow(this.hour)
    };
  }

  private sliceWindow(windowSeconds: number): HistorySeriesPoint[] {
    const cutoff = Date.now() - windowSeconds * 1000;
    return this.samples.filter((sample) => Date.parse(sample.timestamp) >= cutoff);
  }

  private extractGenerationSpeed(snapshot: MetricsSnapshot): number | null {
    const ollama = snapshot.ollama;
    if (!ollama) {
      return null;
    }
    const latest = ollama.running[0];
    if (!latest) {
      return null;
    }
    const candidate = latest.cpuPercent ?? latest.gpuPercent;
    return typeof candidate === "number" ? candidate : null;
  }
}

