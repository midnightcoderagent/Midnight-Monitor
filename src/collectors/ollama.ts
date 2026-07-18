import type { OllamaMetrics, OllamaModelInfo, OllamaRunningModel } from "../types/metrics.js";
import { createCollector } from "./shared.js";
import { runCommand } from "../utils/exec.js";
import { splitColumns, toLines } from "../utils/text.js";

interface OllamaShowCache {
  readonly expiresAt: number;
  readonly data: OllamaModelInfo;
}

const showCache = new Map<string, OllamaShowCache>();

function parseProcessorSplit(processorSplit: string): { cpuPercent: number | null; gpuPercent: number | null } {
  const normalized = processorSplit.trim();
  const cpuMatch = normalized.match(/(\d+(?:\.\d+)?)%\s*(?:.*\b)?CPU\b/i);
  const gpuMatch = normalized.match(/(\d+(?:\.\d+)?)%\s*(?:.*\b)?GPU\b/i);

  if (cpuMatch || gpuMatch) {
    return {
      cpuPercent: cpuMatch ? Number(cpuMatch[1]) : null,
      gpuPercent: gpuMatch ? Number(gpuMatch[1]) : null
    };
  }

  const percentages = [...normalized.matchAll(/(\d+(?:\.\d+)?)%/g)].map((match) => Number(match[1])).filter((value) => Number.isFinite(value));
  if (percentages.length >= 2) {
    return {
      cpuPercent: percentages[0],
      gpuPercent: percentages[1]
    };
  }
  if (percentages.length === 1) {
    if (/gpu/i.test(normalized)) {
      return { cpuPercent: null, gpuPercent: percentages[0] };
    }
    if (/cpu/i.test(normalized)) {
      return { cpuPercent: percentages[0], gpuPercent: null };
    }
  }

  return { cpuPercent: null, gpuPercent: null };
}

function parseRunning(output: string): OllamaRunningModel[] {
  const lines = toLines(output);
  if (lines.length < 2) {
    return [];
  }
  const rows: OllamaRunningModel[] = [];
  for (const line of lines.slice(1)) {
    const columns = splitColumns(line);
    if (columns.length < 4) {
      continue;
    }
    const [name, id, size, processorSplit, context, expiresAt] = columns;
    const split = parseProcessorSplit(processorSplit);
    rows.push({
      name,
      id,
      processorSplit,
      size,
      expiresAt: expiresAt ?? null,
      context: context ? Number(context) || null : null,
      cpuPercent: split.cpuPercent,
      gpuPercent: split.gpuPercent
    });
  }
  return rows;
}

function parseModelList(output: string): Array<{ name: string; size?: string; modifiedAt?: string }> {
  const lines = toLines(output);
  if (lines.length < 2) {
    return [];
  }
  return lines.slice(1).flatMap((line) => {
    const columns = splitColumns(line);
    if (columns.length < 1) {
      return [];
    }
    const [name, , size, modifiedAt] = columns;
    return [{ name, size, modifiedAt }];
  });
}

function parseShow(output: string, model: string): OllamaModelInfo {
  const parameters = new Map<string, string>();
  for (const line of toLines(output)) {
    const match = line.match(/^\s{2,}([a-z][a-z ]+?)\s{2,}(.+)$/i);
    if (match) {
      parameters.set(match[1].trim().toLowerCase(), match[2].trim());
    }
  }

  const contextLength = parameters.get("context length");
  const quantization = parameters.get("quantization");
  const architecture = parameters.get("architecture");
  const license = parameters.get("license");

  return {
    name: model,
    contextLength: contextLength ? Number(contextLength) || null : null,
    parameters: Object.fromEntries(parameters.entries()),
    quantization: quantization ?? null,
    architecture: architecture ?? null,
    license: license ?? null
  };
}

async function showModel(contextKey: string, model: string): Promise<OllamaModelInfo> {
  const cached = showCache.get(contextKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  const result = await runCommand("ollama", ["show", model], { timeoutMs: 5000 });
  const data = result.code === 0 ? parseShow(result.stdout, model) : { name: model };
  showCache.set(contextKey, { expiresAt: Date.now() + 10 * 60 * 1000, data });
  return data;
}

export const createOllamaCollector = createCollector<OllamaMetrics>("ollama", "ollama", async () => {
  const [runningResult, listResult] = await Promise.all([
    runCommand("ollama", ["ps"], { timeoutMs: 5000 }),
    runCommand("ollama", ["list"], { timeoutMs: 5000 })
  ]);

  const running = runningResult.code === 0 ? parseRunning(runningResult.stdout) : [];
  const installedBase = listResult.code === 0 ? parseModelList(listResult.stdout) : [];
  const installed: OllamaModelInfo[] = [];

  for (const model of installedBase.slice(0, 50)) {
    installed.push(await showModel(`ollama.show.${model.name}`, model.name));
  }
  const installedByName = new Map(installed.map((item) => [item.name, item] as const));

  const enrichedRunning = running.map((row) => {
    const contextValue = row.context ?? null;
    const modelInfo = installedByName.get(row.name);
    return {
      ...row,
      context: contextValue,
      size: row.size ?? null,
      expiresAt: row.expiresAt ?? null,
      contextLength: modelInfo?.contextLength ?? null,
      quantization: modelInfo?.quantization ?? null,
      architecture: modelInfo?.architecture ?? null
    };
  });

  return {
    running: enrichedRunning,
    installed
  };
});
