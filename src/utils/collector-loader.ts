import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import type {
  Collector,
  CollectorContext,
  CollectorRegistry
} from "../types/collector.js";

type ModuleShape = Record<string, unknown>;

function isCollector(value: unknown): value is Collector<unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<Collector<unknown>>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.intervalMs === "number" &&
    typeof candidate.collect === "function" &&
    typeof candidate.health === "function" &&
    typeof candidate.dispose === "function" &&
    typeof candidate.initialize === "function"
  );
}

async function loadModule(filePath: string): Promise<ModuleShape | null> {
  try {
    const loaded = (await import(resolveModuleUrl(filePath))) as ModuleShape;
    return loaded;
  } catch {
    return null;
  }
}

function createCollectiblesFromModule(moduleShape: ModuleShape, deps: CollectorContext): Collector<unknown>[] {
  const collectors: Collector<unknown>[] = [];

  for (const [exportName, exported] of Object.entries(moduleShape)) {
    if (exportName === "default" && typeof exported === "function") {
      const collector = (exported as (context: CollectorContext) => unknown)(deps);
      if (isCollector(collector)) {
        collectors.push(collector);
      }
    }
    if (/^create.*Collector$/.test(exportName) && typeof exported === "function") {
      const collector = (exported as (context: CollectorContext) => unknown)(deps);
      if (isCollector(collector)) {
        collectors.push(collector);
      }
    }
  }

  return collectors;
}

export async function loadCollectors(deps: CollectorContext): Promise<CollectorRegistry> {
  const registry: CollectorRegistry = {};
  const loadedIds = new Set<string>();
  const collectorsDir = fileURLToPath(new URL("../collectors/", import.meta.url));
  const entries = await readdir(collectorsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".js") && !entry.name.endsWith(".ts")) {
      continue;
    }
    if (entry.name === "shared.ts" || entry.name === "shared.js" || entry.name === "index.ts" || entry.name === "index.js") {
      continue;
    }
    const moduleShape = await loadModule(join(collectorsDir, entry.name));
    if (!moduleShape) {
      continue;
    }
    const collectorList = createCollectiblesFromModule(moduleShape, deps);
    for (const collector of collectorList) {
      if (!deps.config.collectors.enabled.includes(collector.id)) {
        continue;
      }
      registry[collector.id] = collector;
      loadedIds.add(collector.id);
    }
  }

  for (const moduleSpecifier of deps.config.collectors.modules) {
    const moduleShape = await loadModule(resolveModuleSpecifier(moduleSpecifier));
    if (!moduleShape) {
      continue;
    }
    const collectorList = createCollectiblesFromModule(moduleShape, deps);
    for (const collector of collectorList) {
      if (!deps.config.collectors.enabled.includes(collector.id) || loadedIds.has(collector.id)) {
        continue;
      }
      registry[collector.id] = collector;
      loadedIds.add(collector.id);
    }
  }

  for (const packageName of await autoDiscoverPackages()) {
    const moduleShape = await loadModule(resolveModuleSpecifier(packageName));
    if (!moduleShape) {
      continue;
    }
    const collectorList = createCollectiblesFromModule(moduleShape, deps);
    for (const collector of collectorList) {
      if (!deps.config.collectors.enabled.includes(collector.id) || loadedIds.has(collector.id)) {
        continue;
      }
      registry[collector.id] = collector;
      loadedIds.add(collector.id);
    }
  }

  return registry;
}

function resolveModuleSpecifier(specifier: string): string {
  if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("file:")) {
    return resolve(process.cwd(), specifier);
  }
  return specifier;
}

function resolveModuleUrl(specifier: string): string {
  if (specifier.startsWith("file:")) {
    return specifier;
  }
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    return pathToFileURL(resolve(process.cwd(), specifier)).href;
  }
  return specifier;
}

async function autoDiscoverPackages(): Promise<string[]> {
  const cwdNodeModules = join(process.cwd(), "node_modules");
  try {
    const entries = await readdir(cwdNodeModules, { withFileTypes: true });
    const packages: string[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (entry.name.startsWith("midnight-monitor-collector-")) {
        packages.push(entry.name);
      }
    }
    return packages;
  } catch {
    return [];
  }
}
