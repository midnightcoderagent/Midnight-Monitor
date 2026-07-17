import os from "node:os";
import si from "systeminformation";
import type { NetworkMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";

interface PreviousSample {
  timestamp: number;
  rxBytes: number;
  txBytes: number;
}

const previousSamples = new Map<string, PreviousSample>();

function getIps(): string[] {
  const interfaces = os.networkInterfaces();
  const ips = new Set<string>();
  for (const entries of Object.values(interfaces)) {
    if (!entries) {
      continue;
    }
    for (const entry of entries) {
      if (entry.family === "IPv4" && !entry.internal) {
        ips.add(entry.address);
      }
    }
  }
  return [...ips];
}

export const createNetworkCollector = createCollector<NetworkMetrics>("network", "network", async (context) => {
  const stats = await si.networkStats();
  const now = Date.now();
  const traffic = stats.map((entry) => {
    const raw = entry as unknown as Record<string, unknown>;
    const name = String(raw.iface ?? raw.ifaceName ?? raw.name ?? "unknown");
    const rxBytes = Number(raw.rx_bytes ?? raw.rxBytes ?? 0);
    const txBytes = Number(raw.tx_bytes ?? raw.txBytes ?? 0);
    const previous = previousSamples.get(name);
    const elapsedSeconds = previous ? Math.max(0.001, (now - previous.timestamp) / 1000) : 1;
    const rxBytesPerSec = previous ? Math.max(0, (rxBytes - previous.rxBytes) / elapsedSeconds) : 0;
    const txBytesPerSec = previous ? Math.max(0, (txBytes - previous.txBytes) / elapsedSeconds) : 0;

    previousSamples.set(name, { timestamp: now, rxBytes, txBytes });

    return {
      interface: name,
      rxBytes,
      txBytes,
      rxBytesPerSec: Number(rxBytesPerSec.toFixed(1)),
      txBytesPerSec: Number(txBytesPerSec.toFixed(1))
    };
  });

  const totalRxBytesPerSec = traffic.reduce((sum, item) => sum + item.rxBytesPerSec, 0);
  const totalTxBytesPerSec = traffic.reduce((sum, item) => sum + item.txBytesPerSec, 0);

  return {
    hostname: context.platform.hostname,
    ips: getIps(),
    traffic,
    totalRxBytesPerSec: Number(totalRxBytesPerSec.toFixed(1)),
    totalTxBytesPerSec: Number(totalTxBytesPerSec.toFixed(1))
  };
});
