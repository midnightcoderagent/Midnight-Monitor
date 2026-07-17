import si from "systeminformation";
import type { LlamaCppMetrics, LlamaCppProcess } from "../types/metrics.js";
import { getFlagNumber, getFlagValue } from "../utils/command-line.js";
import { createCollector } from "./shared.js";

function matchesLlamaCpp(command: string): boolean {
  return /(^|\/)(llama-server|llama-cli|main)(\s|$)/i.test(command) || command.toLowerCase().includes("llama.cpp");
}

function parseProcess(command: string, pid: number): LlamaCppProcess {
  const args = command.split(/\s+/).slice(1);
  return {
    pid,
    command,
    modelPath: getFlagValue(args, ["--model", "--model-path", "-m"]),
    contextLength: getFlagNumber(args, ["--ctx-size", "--ctx_size", "-c"]),
    threads: getFlagNumber(args, ["--threads", "-t"]),
    gpuLayers: getFlagNumber(args, ["--gpu-layers", "-ngl"]),
    gpuPercent: null
  };
}

export const createLlamaCppCollector = createCollector<LlamaCppMetrics>("llamacpp", "llamacpp", async () => {
  const processes = await si.processes();
  const running = processes.list
    .map((entry) => {
      const command = String(entry.params ?? entry.name ?? "");
      if (!matchesLlamaCpp(command)) {
        return null;
      }
      return parseProcess(command, Number(entry.pid ?? 0));
    })
    .filter((value): value is LlamaCppProcess => value !== null);

  return { running };
});

