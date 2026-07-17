import si from "systeminformation";
import type { ProcessMetrics, ProcessStat } from "../types/metrics.js";
import { createCollector } from "./shared.js";
import { runCommand } from "../utils/exec.js";
import { toLines } from "../utils/text.js";

async function getNvidiaProcessMap(): Promise<Map<number, number>> {
  const result = await runCommand(
    "nvidia-smi",
    ["--query-compute-apps=pid,used_memory", "--format=csv,noheader,nounits"],
    { timeoutMs: 3000 }
  );
  const map = new Map<number, number>();
  if (result.code !== 0) {
    return map;
  }
  for (const line of toLines(result.stdout)) {
    const [pidRaw, memoryRaw] = line.split(",").map((part) => part.trim());
    const pid = Number(pidRaw);
    const memory = Number(memoryRaw);
    if (Number.isFinite(pid) && Number.isFinite(memory)) {
      map.set(pid, memory);
    }
  }
  return map;
}

export const createProcessCollector = createCollector<ProcessMetrics>("processes", "processes", async () => {
  const [processes, gpuProcesses, gpuInfo, memory] = await Promise.all([
    si.processes(),
    getNvidiaProcessMap(),
    si.graphics().catch(() => null),
    si.mem().catch(() => null)
  ]);
  const totalVramMiB = gpuInfo?.controllers[0]?.vram ?? null;
  const topProcesses = processes.list
    .map((entry) => {
      const raw = entry as unknown as Record<string, unknown>;
      const pid = Number(entry.pid ?? 0);
      const gpuMemoryMiB = gpuProcesses.get(pid) ?? null;
      const gpuPercent =
        totalVramMiB && gpuMemoryMiB !== null ? Number(((gpuMemoryMiB / totalVramMiB) * 100).toFixed(1)) : null;
      const memTotal = memory?.total ?? 0;
      const memoryPercent = Number(raw.pmem ?? raw.mem ?? 0);
      const cpuPercent = Number(raw.pcpu ?? raw.cpu ?? 0);
      const ramBytes = memTotal > 0 ? Math.round((memoryPercent / 100) * memTotal) : 0;

      const stat: ProcessStat = {
        pid,
        command: String(raw.name ?? raw.command ?? raw.params ?? ""),
        cpuPercent: Number(cpuPercent.toFixed(1)),
        ramBytes,
        gpuPercent
      };
      return stat;
    })
    .sort((left, right) => right.cpuPercent - left.cpuPercent || right.ramBytes - left.ramBytes)
    .slice(0, 25);

  return {
    processes: topProcesses
  };
});
