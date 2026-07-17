import type { Server as HttpServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import type { Monitor } from "../scheduler/monitor.js";
import type { ResolvedConfig } from "../types/collector.js";

export function createWebSocketServer(server: HttpServer, monitor: Monitor, config: ResolvedConfig): WebSocketServer {
  const wsServer = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const hostHeader = request.headers.host ?? `${config.server.host}:${config.server.port}`;
    const pathname = new URL(request.url ?? "/", `http://${hostHeader}`).pathname;
    if (pathname !== config.server.wsPath) {
      socket.destroy();
      return;
    }

    wsServer.handleUpgrade(request, socket, head, (client) => {
      wsServer.emit("connection", client, request);
    });
  });

  monitor.on("update", (snapshot: unknown) => {
    const payload = JSON.stringify(snapshot);
    for (const client of wsServer.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });

  wsServer.on("connection", (client) => {
    client.send(JSON.stringify(monitor.snapshot()));
  });

  return wsServer;
}
