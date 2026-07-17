import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Monitor } from "../scheduler/monitor.js";
import type { MetricsSnapshot } from "../types/metrics.js";
import type { ResolvedConfig } from "../types/collector.js";
import { getDashboardCss, getDashboardHtml, getDashboardJs } from "../ui/dashboard.js";

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body).toString());
  response.end(body);
}

function sliceSnapshot(snapshot: MetricsSnapshot, path: string): unknown {
  switch (path) {
    case "/cpu":
      return snapshot.cpu;
    case "/memory":
      return snapshot.ram;
    case "/swap":
      return snapshot.swap;
    case "/gpu":
      return snapshot.gpu;
    case "/disk":
      return snapshot.disk;
    case "/network":
      return snapshot.network;
    case "/ollama":
      return snapshot.ollama;
    case "/history":
      return snapshot.history;
    case "/processes":
      return snapshot.processes;
    case "/metrics":
      return snapshot;
    default:
      return null;
  }
}

export function createHttpServer(monitor: Monitor, config: ResolvedConfig) {
  return createServer(async (request: IncomingMessage, response: ServerResponse) => {
    const hostHeader = request.headers.host ?? `${config.server.host}:${config.server.port}`;
    const path = new URL(request.url ?? "/", `http://${hostHeader}`).pathname;
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "method_not_allowed" });
      return;
    }
    if (path === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }
    if (path === "/") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(getDashboardHtml());
      return;
    }
    if (path === "/app.css") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/css; charset=utf-8");
      response.end(getDashboardCss());
      return;
    }
    if (path === "/app.js") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/javascript; charset=utf-8");
      response.end(getDashboardJs());
      return;
    }
    if (
      path === "/metrics" ||
      path === "/cpu" ||
      path === "/memory" ||
      path === "/swap" ||
      path === "/gpu" ||
      path === "/disk" ||
      path === "/network" ||
      path === "/ollama" ||
      path === "/history" ||
      path === "/processes"
    ) {
      sendJson(response, 200, sliceSnapshot(monitor.snapshot(), path));
      return;
    }
    sendJson(response, 404, { error: "not_found" });
  });
}
