import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DEFAULT_CONFIG } from "./defaults.js";
import type { ResolvedConfig } from "../types/collector.js";

interface PartialServerConfig {
  host?: string;
  port?: number;
  wsPath?: string;
  pidFile?: string;
  stateFile?: string;
}

interface PartialHistoryConfig {
  seconds?: number;
  tenMinutes?: number;
  hour?: number;
}

interface PartialCollectorConfig {
  enabled?: string[];
  modules?: string[];
}

interface PartialIntervalsConfig {
  cpu?: number;
  ram?: number;
  swap?: number;
  gpu?: number;
  disk?: number;
  temperatures?: number;
  network?: number;
  processes?: number;
  ollama?: number;
  llamacpp?: number;
  history?: number;
}

interface PartialConfig {
  server?: PartialServerConfig;
  history?: PartialHistoryConfig;
  collectors?: PartialCollectorConfig;
  intervals?: PartialIntervalsConfig;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? [...value]
    : fallback;
}

export async function loadConfig(cwd: string, explicitPath?: string): Promise<ResolvedConfig> {
  const path = explicitPath ?? process.env.MIDNIGHT_MONITOR_CONFIG ?? resolve(cwd, "midnight-monitor.config.json");

  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as PartialConfig;
    return mergeConfig(parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function mergeConfig(input: PartialConfig): ResolvedConfig {
  const server = isRecord(input.server) ? input.server : {};
  const history = isRecord(input.history) ? input.history : {};
  const collectors = isRecord(input.collectors) ? input.collectors : {};
  const intervals = isRecord(input.intervals) ? input.intervals : {};

  return {
    server: {
      host: toString(server.host, DEFAULT_CONFIG.server.host),
      port: toNumber(server.port, DEFAULT_CONFIG.server.port),
      wsPath: toString(server.wsPath, DEFAULT_CONFIG.server.wsPath),
      pidFile: toString(server.pidFile, DEFAULT_CONFIG.server.pidFile),
      stateFile: toString(server.stateFile, DEFAULT_CONFIG.server.stateFile)
    },
    history: {
      seconds: toNumber(history.seconds, DEFAULT_CONFIG.history.seconds),
      tenMinutes: toNumber(history.tenMinutes, DEFAULT_CONFIG.history.tenMinutes),
      hour: toNumber(history.hour, DEFAULT_CONFIG.history.hour)
    },
    collectors: {
      enabled: toStringArray(collectors.enabled, DEFAULT_CONFIG.collectors.enabled),
      modules: toStringArray(collectors.modules, DEFAULT_CONFIG.collectors.modules)
    },
    intervals: {
      cpu: toNumber(intervals.cpu, DEFAULT_CONFIG.intervals.cpu),
      ram: toNumber(intervals.ram, DEFAULT_CONFIG.intervals.ram),
      swap: toNumber(intervals.swap, DEFAULT_CONFIG.intervals.swap),
      gpu: toNumber(intervals.gpu, DEFAULT_CONFIG.intervals.gpu),
      disk: toNumber(intervals.disk, DEFAULT_CONFIG.intervals.disk),
      temperatures: toNumber(intervals.temperatures, DEFAULT_CONFIG.intervals.temperatures),
      network: toNumber(intervals.network, DEFAULT_CONFIG.intervals.network),
      processes: toNumber(intervals.processes, DEFAULT_CONFIG.intervals.processes),
      ollama: toNumber(intervals.ollama, DEFAULT_CONFIG.intervals.ollama),
      llamacpp: toNumber(intervals.llamacpp, DEFAULT_CONFIG.intervals.llamacpp),
      history: toNumber(intervals.history, DEFAULT_CONFIG.intervals.history)
    }
  };
}
