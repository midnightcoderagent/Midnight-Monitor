import type { Collector, CollectorContext, CollectorHealth, ResolvedIntervals } from "../types/collector.js";

export type CollectorRunner<T> = (context: CollectorContext) => Promise<T | null>;

function intervalFor(
  intervals: ResolvedIntervals,
  id: keyof ResolvedIntervals,
  fallback: number
): number {
  const value = intervals[id];
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createCollector<T>(
  id: string,
  intervalKey: keyof ResolvedIntervals,
  runner: CollectorRunner<T>
): (context: CollectorContext) => Collector<T> {
  return (context: CollectorContext) => {
    let lastError: string | null = null;
    let initialized = false;

    return {
      id,
      intervalMs: intervalFor(context.config.intervals, intervalKey, 1000),
      initialize: async () => {
        initialized = true;
      },
      collect: async (collectorContext: CollectorContext) => {
        try {
          const result = await runner(collectorContext);
          lastError = null;
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : "collector failure";
          lastError = message;
          collectorContext.logger.warn(`collector ${id} failed`, { error: message });
          return null;
        }
      },
      health: async (): Promise<CollectorHealth> => ({
        status: lastError === null && initialized ? "ok" : lastError === null ? "degraded" : "error",
        ...(lastError !== null ? { message: lastError } : initialized ? {} : { message: "not initialized" }),
        checkedAt: new Date().toISOString()
      }),
      dispose: async () => undefined
    };
  };
}
