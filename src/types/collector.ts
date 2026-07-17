import type {
  CpuMetrics,
  DiskMetrics,
  GpuMetrics,
  HistoryMetrics,
  MetricsSnapshot,
  LlamaCppMetrics,
  NetworkMetrics,
  OllamaMetrics,
  ProcessMetrics,
  RamMetrics,
  SwapMetrics,
  TemperatureMetrics
} from "./metrics.js";

export interface CollectorHealth {
  status: "ok" | "degraded" | "error";
  message?: string | undefined;
  checkedAt: string;
}

export interface CollectorDependencies {
  runCommand: <T>(command: string, args: string[], options?: CommandOptions<T>) => Promise<CommandResult<T>>;
  cache: Cache;
  history: HistoryStore;
  config: ResolvedConfig;
  platform: PlatformInfo;
  logger: Logger;
  snapshot: () => MetricsSnapshot;
}

export interface CommandOptions<T> {
  timeoutMs?: number;
  parse?: (output: string) => T;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export interface CommandResult<T> {
  stdout: string;
  stderr: string;
  code: number;
  value?: T | undefined;
}

export interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export interface Cache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs: number): void;
  getOrSet<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T>;
}

export interface PlatformInfo {
  isWindows: boolean;
  isLinux: boolean;
  isMac: boolean;
  hostname: string;
}

export interface HistoryStore {
  push(snapshot: MetricsSnapshot): void;
  snapshot(): HistoryMetrics;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface ResolvedIntervals {
  cpu: number;
  ram: number;
  swap: number;
  gpu: number;
  disk: number;
  temperatures: number;
  network: number;
  processes: number;
  ollama: number;
  llamacpp: number;
  history: number;
}

export interface ResolvedConfig {
  server: {
    host: string;
    port: number;
    wsPath: string;
    pidFile: string;
    stateFile: string;
  };
  history: {
    seconds: number;
    tenMinutes: number;
    hour: number;
  };
  collectors: {
    enabled: string[];
    modules: string[];
  };
  intervals: ResolvedIntervals;
}

export interface CollectorContext extends CollectorDependencies {}

export interface CollectorModule<T> {
  createCollector: (deps: CollectorDependencies) => Collector<T>;
}

export interface Collector<T> {
  readonly id: string;
  readonly intervalMs: number;
  initialize(context: CollectorContext): Promise<void> | void;
  collect(context: CollectorContext): Promise<T | null>;
  health(): Promise<CollectorHealth>;
  dispose(): Promise<void> | void;
}

export interface CollectorRegistry {
  cpu?: Collector<CpuMetrics>;
  ram?: Collector<RamMetrics>;
  swap?: Collector<SwapMetrics>;
  gpu?: Collector<GpuMetrics>;
  disk?: Collector<DiskMetrics>;
  network?: Collector<NetworkMetrics>;
  temperatures?: Collector<TemperatureMetrics>;
  ollama?: Collector<OllamaMetrics>;
  llamacpp?: Collector<LlamaCppMetrics>;
  processes?: Collector<ProcessMetrics>;
  history?: Collector<HistoryMetrics>;
  [key: string]: Collector<unknown> | undefined;
}
