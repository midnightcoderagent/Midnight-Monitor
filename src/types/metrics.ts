export type Severity = "info" | "warning" | "critical";

export interface AnalysisFinding {
  severity: Severity;
  source: string;
  message: string;
  suggestion?: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface CpuMetrics {
  usage: number;
  cores: number;
  threads: number;
  loadAverage: [number, number, number];
  frequencyMhz: number;
  uptimeSeconds: number;
}

export interface RamMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  cacheBytes: number;
  buffersBytes: number;
  usagePercent: number;
}

export interface SwapMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
}

export interface DiskFsUsage {
  fs: string;
  mount: string;
  type: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
  readOnly: boolean;
  inodeUsagePercent?: number | null;
}

export interface DiskMetrics {
  filesystems: DiskFsUsage[];
}

export interface NetworkInterfaceTraffic {
  interface: string;
  rxBytes: number;
  txBytes: number;
  rxBytesPerSec: number;
  txBytesPerSec: number;
}

export interface NetworkMetrics {
  hostname: string;
  ips: string[];
  traffic: NetworkInterfaceTraffic[];
  totalRxBytesPerSec: number;
  totalTxBytesPerSec: number;
}

export interface TemperatureMetrics {
  cpuCelsius: number | null;
  gpuCelsius: number | null;
  fanRpm: number | null;
}

export interface GpuVramMetrics {
  totalBytes: number | null;
  usedBytes: number | null;
  freeBytes: number | null;
}

export interface GpuMetrics {
  vendor: string;
  model: string;
  driver?: string | null;
  usagePercent?: number | null;
  temperatureCelsius?: number | null;
  powerWatts?: number | null;
  clockMhz?: number | null;
  encoderPercent?: number | null;
  decoderPercent?: number | null;
  vram?: GpuVramMetrics | null;
  processCount?: number | null;
}

export interface OllamaModelInfo {
  name: string;
  size?: string | null;
  modifiedAt?: string | null;
  contextLength?: number | null;
  quantization?: string | null;
  architecture?: string | null;
  license?: string | null;
  parameters?: Record<string, string>;
}

export interface OllamaRunningModel {
  id: string;
  name: string;
  processorSplit?: string | null;
  gpuPercent?: number | null;
  cpuPercent?: number | null;
  size?: string | null;
  expiresAt?: string | null;
  context?: number | null;
  contextLength?: number | null;
  quantization?: string | null;
  architecture?: string | null;
}

export interface OllamaMetrics {
  running: OllamaRunningModel[];
  installed: OllamaModelInfo[];
}

export interface LlamaCppProcess {
  pid: number;
  command: string;
  modelPath?: string | null;
  contextLength?: number | null;
  threads?: number | null;
  gpuLayers?: number | null;
  gpuPercent?: number | null;
}

export interface LlamaCppMetrics {
  running: LlamaCppProcess[];
}

export interface ProcessStat {
  pid: number;
  command: string;
  cpuPercent: number;
  ramBytes: number;
  gpuPercent?: number | null;
}

export interface ProcessMetrics {
  processes: ProcessStat[];
}

export interface HistorySeriesPoint {
  timestamp: string;
  cpuUsage?: number | null;
  ramUsedBytes?: number | null;
  swapUsedBytes?: number | null;
  gpuUsagePercent?: number | null;
  vramUsedBytes?: number | null;
  temperatureCelsius?: number | null;
  generationSpeed?: number | null;
}

export interface HistoryMetrics {
  last60Seconds: HistorySeriesPoint[];
  last10Minutes: HistorySeriesPoint[];
  lastHour: HistorySeriesPoint[];
}

export interface MetricsSnapshot {
  timestamp: string;
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
  analysis: AnalysisFinding[];
}
