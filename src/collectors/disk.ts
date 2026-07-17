import si from "systeminformation";
import type { DiskFsUsage, DiskMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";
import { runCommand as runDf } from "../utils/exec.js";

async function getLinuxInodes(): Promise<Map<string, number>> {
  if (process.platform !== "linux") {
    return new Map<string, number>();
  }
  const result = await runDf("df", ["-iP"]);
  const map = new Map<string, number>();
  if (result.code !== 0) {
    return map;
  }
  const lines = result.stdout.trim().split(/\r?\n/);
  for (const line of lines.slice(1)) {
    const columns = line.trim().split(/\s+/);
    if (columns.length < 6) {
      continue;
    }
    const usePercent = Number(columns[4].replace("%", ""));
    const mount = columns.slice(5).join(" ");
    if (Number.isFinite(usePercent)) {
      map.set(mount, usePercent);
    }
  }
  return map;
}

export const createDiskCollector = createCollector<DiskMetrics>("disk", "disk", async () => {
  const [filesystems, inodes] = await Promise.all([si.fsSize(), getLinuxInodes()]);
  const mapped: DiskFsUsage[] = filesystems.map((entry) => {
    const raw = entry as unknown as Record<string, unknown>;
    const fs = String(raw.fs ?? raw.fileSystem ?? raw.mount ?? "");
    const mount = String(raw.mount ?? raw.mountpoint ?? raw.mountPoint ?? "");
    const totalBytes = Number(raw.size ?? 0);
    const usedBytes = Number(raw.used ?? 0);
    const freeBytes = Number(raw.available ?? Math.max(0, totalBytes - usedBytes));
    const inodeUsagePercent = inodes.get(mount) ?? null;

    return {
      fs,
      mount,
      type: String(raw.type ?? ""),
      totalBytes,
      usedBytes,
      freeBytes,
      usagePercent: totalBytes > 0 ? Number(((usedBytes / totalBytes) * 100).toFixed(1)) : 0,
      readOnly: Boolean(raw.rw === false),
      inodeUsagePercent
    };
  });
  return { filesystems: mapped };
});
