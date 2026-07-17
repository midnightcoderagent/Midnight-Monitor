import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createHttpServer } from "./api/http.js";
import { createWebSocketServer } from "./api/websocket.js";
import { loadConfig } from "./config/load.js";
import { Monitor } from "./scheduler/monitor.js";
import { createLogger } from "./utils/logger.js";
import { runCommand } from "./utils/exec.js";
import si from "systeminformation";

interface CliState {
  command: string;
  configPath?: string | undefined;
}

function parseArgs(argv: string[]): CliState {
  const [, , ...rest] = argv;
  const command = rest[0] && !rest[0].startsWith("-") ? rest[0] : "start";
  const configIndex = rest.findIndex((arg) => arg === "--config" || arg === "-c");
  const configPath = configIndex >= 0 ? rest[configIndex + 1] : undefined;
  return { command, configPath };
}

async function ensurePidFile(pidFile: string, pid: number): Promise<void> {
  await writeFile(pidFile, String(pid), "utf8");
}

async function removePidFile(pidFile: string): Promise<void> {
  try {
    await unlink(pidFile);
  } catch {
    // ignore
  }
}

async function isAlive(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function readPid(pidFile: string): Promise<number | null> {
  try {
    const raw = await readFile(pidFile, "utf8");
    const parsed = Number(raw.trim());
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function startService(configPath?: string): Promise<void> {
  const config = await loadConfig(process.cwd(), configPath);
  const logger = createLogger();
  const monitor = new Monitor(config);
  await monitor.start();
  const server = createHttpServer(monitor, config);
  createWebSocketServer(server, monitor, config);

  await new Promise<void>((resolveReady) => {
    server.listen(config.server.port, config.server.host, () => {
      resolveReady();
    });
  });

  await ensurePidFile(resolve(process.cwd(), config.server.pidFile), process.pid);
  logger.info(`Midnight Monitor listening on http://${config.server.host}:${config.server.port}`);

  const shutdown = async () => {
    await monitor.stop();
    await new Promise<void>((resolveClosed) => {
      server.close(() => resolveClosed());
    });
    await removePidFile(resolve(process.cwd(), config.server.pidFile));
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

async function spawnDetached(configPath?: string): Promise<void> {
  const entry = process.argv[1] ?? new URL("./index.js", import.meta.url).pathname;
  const useTsx = entry.endsWith(".ts");
  const command = useTsx ? "tsx" : process.execPath;
  const args = [entry, "serve"];
  if (configPath) {
    args.push("--config", configPath);
  }
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (configPath) {
    env.MIDNIGHT_MONITOR_CONFIG = configPath;
  }
  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
    env
  });
  child.unref();
  console.log(`Started midnight-monitor with PID ${child.pid ?? "unknown"}`);
}

async function stopService(configPath?: string): Promise<void> {
  const config = await loadConfig(process.cwd(), configPath);
  const pidFile = resolve(process.cwd(), config.server.pidFile);
  const pid = await readPid(pidFile);
  if (!pid) {
    console.log("midnight-monitor is not running");
    return;
  }
  if (await isAlive(pid)) {
    process.kill(pid, "SIGTERM");
    console.log(`Stopped midnight-monitor (${pid})`);
  }
  await removePidFile(pidFile);
}

async function statusService(configPath?: string): Promise<void> {
  const config = await loadConfig(process.cwd(), configPath);
  const pidFile = resolve(process.cwd(), config.server.pidFile);
  const pid = await readPid(pidFile);
  const alive = pid !== null && (await isAlive(pid));
  let health = "down";
  if (alive) {
    try {
      const response = await fetch(`http://${config.server.host}:${config.server.port}/health`);
      if (response.ok) {
        health = "ok";
      }
    } catch {
      health = "down";
    }
  }
  console.log(JSON.stringify({ running: alive, pid, health }, null, 2));
}

async function doctor(): Promise<void> {
  const systemInformation = si as typeof si & {
    memSwap: () => Promise<{ total?: number; used?: number; free?: number }>;
  };
  const checks: Array<{ name: string; status: "ok" | "warn" | "fail"; detail: string }> = [];
  checks.push({
    name: "node",
    status: process.versions.node.startsWith("22.") || Number(process.versions.node.split(".")[0] ?? 0) >= 22 ? "ok" : "fail",
    detail: `Node ${process.versions.node}`
  });

  const ollama = await runCommand("ollama", ["--version"], { timeoutMs: 2000 });
  checks.push({
    name: "ollama",
    status: ollama.code === 0 ? "ok" : "warn",
    detail: ollama.code === 0 ? ollama.stdout.trim() : "not installed"
  });

  const swap = await systemInformation.memSwap().catch(() => null);
  checks.push({
    name: "swap",
    status: swap && (swap.total ?? 0) > 0 ? "ok" : "warn",
    detail: swap && (swap.total ?? 0) > 0 ? "enabled" : "not configured"
  });

  const memory = await si.mem().catch(() => null);
  checks.push({
    name: "ram",
    status: memory ? "ok" : "warn",
    detail: memory ? `${Math.round((memory.total / 1024 / 1024 / 1024) * 10) / 10} GB` : "unknown"
  });

  const graphics = await si.graphics().catch(() => null);
  checks.push({
    name: "gpu",
    status: graphics && graphics.controllers.length > 0 ? "ok" : "warn",
    detail: graphics && graphics.controllers.length > 0 ? graphics.controllers[0]?.model ?? "detected" : "not detected"
  });

  const disk = await si.fsSize().catch(() => []);
  const diskTotal = disk.reduce((sum, entry) => sum + Number(entry.size ?? 0), 0);
  checks.push({
    name: "disk",
    status: diskTotal > 0 ? "ok" : "warn",
    detail: diskTotal > 0 ? `${Math.round((diskTotal / 1024 / 1024 / 1024) * 10) / 10} GB` : "unknown"
  });

  console.log(JSON.stringify(checks, null, 2));
}

async function benchmark(): Promise<void> {
  const cpuStart = performance.now();
  let hash = createHash("sha256");
  for (let index = 0; index < 100_000; index += 1) {
    hash = hash.update(randomBytes(32));
  }
  hash.digest("hex");
  const cpuMs = performance.now() - cpuStart;

  const memoryStart = performance.now();
  const buffer = new Uint8Array(64 * 1024 * 1024);
  const copy = new Uint8Array(buffer.length);
  copy.set(buffer);
  const memoryMs = performance.now() - memoryStart;

  const diskStart = performance.now();
  const tempPath = resolve(process.cwd(), ".midnight-monitor-benchmark.tmp");
  await writeFile(tempPath, randomBytes(8 * 1024 * 1024));
  await unlink(tempPath).catch(() => undefined);
  const diskMs = performance.now() - diskStart;

  const gpuStart = performance.now();
  await si.graphics().catch(() => null);
  const gpuMs = performance.now() - gpuStart;

  console.log(
    JSON.stringify(
      {
        cpuMs: Number(cpuMs.toFixed(1)),
        memoryMs: Number(memoryMs.toFixed(1)),
        diskMs: Number(diskMs.toFixed(1)),
        gpuDetectionMs: Number(gpuMs.toFixed(1))
      },
      null,
      2
    )
  );
}

async function main(): Promise<void> {
  const { command, configPath } = parseArgs(process.argv);
  switch (command) {
    case "serve":
      await startService(configPath);
      return;
    case "stop":
      await stopService(configPath);
      return;
    case "status":
      await statusService(configPath);
      return;
    case "doctor":
      await doctor();
      return;
    case "benchmark":
      await benchmark();
      return;
    case "start":
    default:
      await spawnDetached(configPath);
      return;
  }
}

await main();
