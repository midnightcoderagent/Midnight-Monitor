import type { ResolvedConfig } from "../types/collector.js";

export const DEFAULT_CONFIG: ResolvedConfig = {
  server: {
    host: "127.0.0.1",
    port: 9898,
    wsPath: "/ws",
    pidFile: "midnight-monitor.pid",
    stateFile: "midnight-monitor.state.json"
  },
  history: {
    seconds: 60,
    tenMinutes: 600,
    hour: 3600
  },
  collectors: {
    enabled: [
      "cpu",
      "ram",
      "swap",
      "gpu",
      "disk",
      "network",
      "temperatures",
      "processes",
      "ollama",
      "llamacpp",
      "history"
    ],
    modules: []
  },
  intervals: {
    cpu: 1000,
    ram: 1000,
    swap: 1000,
    gpu: 1000,
    disk: 10000,
    temperatures: 5000,
    network: 1000,
    processes: 1000,
    ollama: 2000,
    llamacpp: 2000,
    history: 1000
  }
};

