import { EventEmitter } from "node:events";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { TTLCache } from "../utils/cache.js";
import { analyzeSnapshot } from "../utils/analysis.js";
import { loadCollectors } from "../utils/collector-loader.js";
import { createLogger } from "../utils/logger.js";
import { getPlatformInfo } from "../utils/platform.js";
import { HistoryStore } from "../utils/history-store.js";
import type {
  Collector,
  CollectorContext,
  ResolvedConfig
} from "../types/collector.js";
import type {
  CpuMetrics,
  DiskMetrics,
  GpuMetrics,
  HistoryMetrics,
  LlamaCppMetrics,
  MetricsSnapshot,
  NetworkMetrics,
  OllamaMetrics,
  ProcessMetrics,
  RamMetrics,
  SwapMetrics,
  TemperatureMetrics
} from "../types/metrics.js";
import { runCommand } from "../utils/exec.js";

interface TimedCollector {
  collector: Collector<unknown>;
  timer: NodeJS.Timeout | null;
  running: boolean;
}

type CollectorValues = {
  cpu: CpuMetrics | null;
  ram: RamMetrics | null;
  swap: SwapMetrics | null;
  gpu: GpuMetrics | null;
  disk: DiskMetrics | null;
  network: NetworkMetrics | null;
  temperatures: TemperatureMetrics | null;
  ollama: OllamaMetrics | null;
  llamacpp: LlamaCppMetrics | null;
  processes: ProcessMetrics | null;
  history: HistoryMetrics | null;
};

const EMPTY_VALUES: CollectorValues = {
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
  history: null
};

export class Monitor extends EventEmitter {
  private readonly logger = createLogger();
  private readonly cache = new TTLCache();
  private readonly historyStore: HistoryStore;
  private readonly platform = getPlatformInfo();
  private readonly collectors = new Map<string, TimedCollector>();
  private readonly values: CollectorValues = { ...EMPTY_VALUES };
  private readonly collectorHealth = new Map<string, Awaited<ReturnType<Collector<unknown>["health"]>>>();
  private loaded = false;
  private persistTimer: NodeJS.Timeout | null = null;
  private started = false;

  public constructor(private readonly config: ResolvedConfig) {
    super();
    this.historyStore = new HistoryStore(config.history.seconds, config.history.tenMinutes, config.history.hour);
  }

  public async start(): Promise<void> {
    if (this.started) {
      return;
    }
    if (!this.loaded) {
      await this.load();
    }
    for (const [id, timedCollector] of this.collectors.entries()) {
      await timedCollector.collector.initialize(this.createContext());
      this.scheduleCollector(id, timedCollector);
      void this.runCollector(id);
    }
    this.started = true;
  }

  public async stop(): Promise<void> {
    for (const timedCollector of this.collectors.values()) {
      if (timedCollector.timer) {
        clearInterval(timedCollector.timer);
      }
      await timedCollector.collector.dispose();
      timedCollector.timer = null;
    }
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    this.started = false;
  }

  public snapshot(): MetricsSnapshot {
    const base: MetricsSnapshot = {
      timestamp: new Date().toISOString(),
      cpu: this.values.cpu,
      ram: this.values.ram,
      swap: this.values.swap,
      gpu: this.values.gpu,
      disk: this.values.disk,
      network: this.values.network,
      temperatures: this.values.temperatures,
      ollama: this.values.ollama,
      llamacpp: this.values.llamacpp,
      processes: this.values.processes,
      history: this.values.history ?? this.historyStore.snapshot(),
      analysis: []
    };
    return {
      ...base,
      analysis: analyzeSnapshot(base)
    };
  }

  public getCollectorHealth(): Record<string, Awaited<ReturnType<Collector<unknown>["health"]>>> {
    return Object.fromEntries(this.collectorHealth.entries());
  }

  public async health(): Promise<{
    status: "ok" | "degraded" | "error";
    collectors: Record<string, Awaited<ReturnType<Collector<unknown>["health"]>>>;
  }> {
    const collectors = this.getCollectorHealth();
    const values = Object.values(collectors);
    const status = values.some((entry) => entry.status === "error")
      ? "error"
      : values.some((entry) => entry.status === "degraded")
        ? "degraded"
        : "ok";
    return { status, collectors };
  }

  public async load(): Promise<void> {
    const context = this.createContext();
    const registry = await loadCollectors(context);
    for (const [id, collector] of Object.entries(registry)) {
      if (!collector) {
        continue;
      }
      this.collectors.set(id, { collector, timer: null, running: false });
    }
    this.loaded = true;
  }

  public async runAll(): Promise<void> {
    await Promise.all([...this.collectors.keys()].map(async (id) => this.runCollector(id)));
  }

  private createContext(): CollectorContext {
    return {
      runCommand,
      cache: this.cache,
      history: this.historyStore,
      config: this.config,
      platform: this.platform,
      logger: this.logger,
      snapshot: () => this.snapshot()
    };
  }

  private scheduleCollector(id: string, timedCollector: TimedCollector): void {
    timedCollector.timer = setInterval(() => {
      void this.runCollector(id);
    }, timedCollector.collector.intervalMs);
    timedCollector.timer.unref?.();
  }

  private async runCollector(id: string): Promise<void> {
    const timedCollector = this.collectors.get(id);
    if (!timedCollector || timedCollector.running) {
      return;
    }
    timedCollector.running = true;
    try {
      const value = await timedCollector.collector.collect(this.createContext());
      if (value !== null) {
        this.assignValue(id, value);
      }
      const health = await timedCollector.collector.health();
      this.collectorHealth.set(id, health);
      this.emit("update", this.snapshot());
      this.schedulePersist();
    } catch (error) {
      const message = error instanceof Error ? error.message : "collector failed";
      this.logger.warn(`collector ${id} execution failed`, { error: message });
      this.collectorHealth.set(id, {
        status: "error",
        message,
        checkedAt: new Date().toISOString()
      });
    } finally {
      timedCollector.running = false;
    }
  }

  private assignValue(id: string, value: unknown): void {
    if (id in this.values) {
      (this.values as Record<string, unknown>)[id] = value;
    }
  }

  private schedulePersist(): void {
    if (this.persistTimer) {
      return;
    }
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      void this.persistState();
    }, 250);
    this.persistTimer.unref?.();
  }

  private async persistState(): Promise<void> {
    const statePath = resolve(process.cwd(), this.config.server.stateFile);
    try {
      await writeFile(statePath, JSON.stringify(this.snapshot(), null, 2), "utf8");
    } catch {
      // Ignore persistence errors.
    }
  }
}
