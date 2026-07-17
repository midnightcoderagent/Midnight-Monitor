import type { HistoryMetrics } from "../types/metrics.js";
import { createCollector } from "./shared.js";

export const createHistoryCollector = createCollector<HistoryMetrics>("history", "history", async (context) => {
  const history = context.history;
  history.push(context.snapshot());
  return history.snapshot();
});

