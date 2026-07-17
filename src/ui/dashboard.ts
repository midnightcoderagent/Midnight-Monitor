export function getDashboardHtml(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Midnight LLM Monitor</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Midnight LLM Monitor</p>
          <h1>Hardware intelligence em tempo real</h1>
        </div>
        <div class="statusline">
          <span id="connection-pill" class="pill pill-warn">connecting</span>
          <span id="updated-at" class="muted">aguardando dados</span>
        </div>
      </header>

      <section class="section">
        <div class="section-head">
          <h2>Resumo</h2>
          <p>Recursos principais, saúde e pressão de execução.</p>
        </div>
        <div id="summary-grid" class="metric-grid"></div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Análise</h2>
          <p>Leituras automáticas para orientar decisões do Midnight Coder.</p>
        </div>
        <div id="analysis-list" class="analysis-list"></div>
      </section>

      <section class="section split">
        <div class="panel">
          <div class="section-head">
            <h2>Histórico</h2>
            <p>Tendência dos últimos minutos.</p>
          </div>
          <div class="chart-grid">
            <canvas id="chart-cpu" width="640" height="180"></canvas>
            <canvas id="chart-ram" width="640" height="180"></canvas>
            <canvas id="chart-gpu" width="640" height="180"></canvas>
            <canvas id="chart-temp" width="640" height="180"></canvas>
          </div>
        </div>
      </section>

      <section class="section split">
        <div class="panel">
          <div class="section-head">
            <h2>Ollama</h2>
            <p>Modelos em execução e catálogo instalado.</p>
          </div>
          <div id="ollama-running" class="table-wrap"></div>
          <div id="ollama-installed" class="table-wrap"></div>
        </div>
      </section>

      <section class="section split">
        <div class="panel">
          <div class="section-head">
            <h2>Processos</h2>
            <p>Top consumidores de CPU, RAM e GPU.</p>
          </div>
          <div id="processes-table" class="table-wrap"></div>
        </div>
        <div class="panel">
          <div class="section-head">
            <h2>Discos e rede</h2>
            <p>Uso por filesystem e tráfego atual.</p>
          </div>
          <div id="disk-list" class="stack"></div>
          <div id="network-list" class="stack"></div>
        </div>
      </section>
    </main>
    <script src="/app.js"></script>
  </body>
</html>`;
}

export function getDashboardCss(): string {
  return `
:root {
  color-scheme: dark;
  --bg: #07111f;
  --bg-soft: #0d1728;
  --panel: rgba(12, 21, 36, 0.88);
  --panel-border: rgba(148, 163, 184, 0.18);
  --text: #e5eefb;
  --muted: #8ea0bd;
  --accent: #7dd3fc;
  --accent-2: #8b5cf6;
  --good: #34d399;
  --warn: #f59e0b;
  --bad: #f87171;
  --line: rgba(148, 163, 184, 0.12);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(125, 211, 252, 0.08), transparent 30%),
    radial-gradient(circle at top right, rgba(139, 92, 246, 0.08), transparent 24%),
    linear-gradient(180deg, var(--bg), #050b15 70%);
  color: var(--text);
  font: 14px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  padding: 24px;
}

.shell {
  max-width: 1440px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: 34px;
  line-height: 1.08;
}

.statusline {
  display: flex;
  gap: 12px;
  align-items: center;
}

.muted {
  color: var(--muted);
}

.section {
  margin: 0 0 20px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
}

.section-head p {
  color: var(--muted);
  max-width: 64ch;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.metric {
  background: linear-gradient(180deg, rgba(14, 24, 41, 0.96), rgba(8, 16, 28, 0.96));
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px;
  min-height: 112px;
}

.metric .label {
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 11px;
  margin-bottom: 8px;
}

.metric .value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.05;
}

.metric .sub {
  color: var(--muted);
  margin-top: 8px;
  font-size: 12px;
}

.metric.good .value {
  color: var(--good);
}

.metric.warn .value {
  color: var(--warn);
}

.metric.bad .value {
  color: var(--bad);
}

.panel {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.split {
  display: grid;
  grid-template-columns: 1fr;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

canvas {
  width: 100%;
  height: 180px;
  background: rgba(4, 10, 18, 0.7);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.analysis-list,
.stack {
  display: grid;
  gap: 10px;
}

.finding {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(4, 10, 18, 0.55);
}

.finding .title {
  font-weight: 600;
}

.finding .desc {
  color: var(--muted);
  margin-top: 4px;
}

.finding.info {
  box-shadow: inset 3px 0 0 rgba(125, 211, 252, 0.8);
}

.finding.warning {
  box-shadow: inset 3px 0 0 rgba(245, 158, 11, 0.9);
}

.finding.critical {
  box-shadow: inset 3px 0 0 rgba(248, 113, 113, 0.95);
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pill-ok {
  color: var(--good);
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(52, 211, 153, 0.12);
}

.pill-warn {
  color: var(--warn);
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.12);
}

.pill-bad {
  color: var(--bad);
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.12);
}

.table-wrap {
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(4, 10, 18, 0.55);
}

th,
td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

th {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.02);
}

tr:last-child td {
  border-bottom: 0;
}

.mini {
  color: var(--muted);
  font-size: 12px;
}

.bar {
  display: grid;
  grid-template-columns: 90px 1fr 64px;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}

.bar:last-child {
  border-bottom: 0;
}

.track {
  position: relative;
  height: 10px;
  background: rgba(148, 163, 184, 0.14);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}

@media (max-width: 900px) {
  body {
    padding: 16px;
  }

  .topbar,
  .section-head {
    align-items: start;
    flex-direction: column;
  }

  h1 {
    font-size: 28px;
  }
}
`;
}

export function getDashboardJs(): string {
  return `
const state = {
  snapshot: null,
  socket: null
};

const el = (id) => document.getElementById(id);

function fmtBytes(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = Number(value);
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return \`\${current.toFixed(current >= 100 ? 0 : current >= 10 ? 1 : 2)} \${units[index]}\`;
}

function fmtPct(value) {
  return typeof value === "number" ? \`\${value.toFixed(1)}%\` : "n/a";
}

function fmtNum(value) {
  return typeof value === "number" ? value.toFixed(value >= 10 ? 0 : 1) : "n/a";
}

function severityClass(severity) {
  return severity === "critical" ? "critical" : severity === "warning" ? "warning" : "info";
}

function statusClass(percent) {
  if (typeof percent !== "number") return "warn";
  if (percent >= 90) return "bad";
  if (percent >= 70) return "warn";
  return "good";
}

function makeMetric(label, value, sub, tone) {
  return \`
    <article class="metric \${tone}">
      <div class="label">\${label}</div>
      <div class="value">\${value}</div>
      <div class="sub">\${sub}</div>
    </article>
  \`;
}

function renderSummary(snapshot) {
  const cpu = snapshot.cpu ?? {};
  const ram = snapshot.ram ?? {};
  const swap = snapshot.swap ?? {};
  const gpu = snapshot.gpu ?? {};
  const temp = snapshot.temperatures ?? {};
  const network = snapshot.network ?? {};
  const disk = snapshot.disk ?? { filesystems: [] };
  const analysis = snapshot.analysis ?? [];
  const bestFilesystem = disk.filesystems?.[0];

  const cards = [
    makeMetric("CPU", fmtPct(cpu.usage), \`\${cpu.cores ?? "n/a"} cores · \${cpu.frequencyMhz ?? "n/a"} MHz\`, statusClass(cpu.usage)),
    makeMetric("RAM", fmtPct(ram.usagePercent), \`\${fmtBytes(ram.usedBytes)} / \${fmtBytes(ram.totalBytes)}\`, statusClass(ram.usagePercent)),
    makeMetric("Swap", fmtPct(swap.usagePercent), \`\${fmtBytes(swap.usedBytes)} / \${fmtBytes(swap.totalBytes)}\`, statusClass(swap.usagePercent)),
    makeMetric("GPU", fmtPct(gpu.usagePercent), \`\${gpu.vendor ?? "n/a"} · \${gpu.model ?? "n/a"}\`, statusClass(gpu.usagePercent)),
    makeMetric("VRAM", fmtPct(gpu.vram?.totalBytes ? (gpu.vram.usedBytes ?? 0) / gpu.vram.totalBytes * 100 : null), \`\${fmtBytes(gpu.vram?.usedBytes)} / \${fmtBytes(gpu.vram?.totalBytes)}\`, statusClass(gpu.usagePercent)),
    makeMetric("Temp", typeof temp.cpuCelsius === "number" ? \`\${temp.cpuCelsius.toFixed(1)}°C\` : typeof temp.gpuCelsius === "number" ? \`\${temp.gpuCelsius.toFixed(1)}°C\` : "n/a", \`\${temp.fanRpm ?? "n/a"} RPM\`, typeof temp.gpuCelsius === "number" && temp.gpuCelsius >= 85 ? "bad" : "good"),
    makeMetric("Network", \`\${fmtNum(network.totalRxBytesPerSec)} B/s ↓\`, \`\${fmtNum(network.totalTxBytesPerSec)} B/s ↑ · \${network.hostname ?? "n/a"}\`, "good"),
    makeMetric("Disk", bestFilesystem ? \`\${fmtPct(bestFilesystem.usagePercent)}\` : "n/a", bestFilesystem ? \`\${bestFilesystem.mount} · \${fmtBytes(bestFilesystem.usedBytes)} / \${fmtBytes(bestFilesystem.totalBytes)}\` : "sem dados", statusClass(bestFilesystem?.usagePercent))
  ];

  el("summary-grid").innerHTML = cards.join("");

  const pill = el("connection-pill");
  const badFinding = analysis.find((item) => item.severity === "critical");
  const warnFinding = analysis.find((item) => item.severity === "warning");
  pill.className = \`pill \${badFinding ? "pill-bad" : warnFinding ? "pill-warn" : "pill-ok"}\`;
  pill.textContent = badFinding ? "critical" : warnFinding ? "warning" : "ok";

  const updated = el("updated-at");
  updated.textContent = \`atualizado em \${new Date(snapshot.timestamp).toLocaleString("pt-BR")}\`;
}

function renderAnalysis(snapshot) {
  const list = snapshot.analysis ?? [];
  if (!list.length) {
    el("analysis-list").innerHTML = \`
      <div class="finding info">
        <div>
          <div class="title">Sem alertas</div>
          <div class="desc">Nenhuma pressão relevante foi detectada.</div>
        </div>
      </div>
    \`;
    return;
  }
  el("analysis-list").innerHTML = list.map((finding) => \`
    <div class="finding \${severityClass(finding.severity)}">
      <div>
        <div class="title">\${finding.message}</div>
        <div class="desc">\${finding.suggestion ?? finding.source}</div>
      </div>
      <div class="mini">\${finding.severity.toUpperCase()}</div>
    </div>
  \`).join("");
}

function renderTable(containerId, columns, rows) {
  const container = el(containerId);
  if (!rows.length) {
    container.innerHTML = \`<div class="bar"><div class="mini">Sem dados</div></div>\`;
    return;
  }
  container.innerHTML = \`
    <table>
      <thead><tr>\${columns.map((col) => \`<th>\${col}</th>\`).join("")}</tr></thead>
      <tbody>
        \${rows.map((row) => \`<tr>\${row.map((cell) => \`<td>\${cell}</td>\`).join("")}</tr>\`).join("")}
      </tbody>
    </table>
  \`;
}

function renderOllama(snapshot) {
  const running = snapshot.ollama?.running ?? [];
  const installed = snapshot.ollama?.installed ?? [];

  renderTable("ollama-running", ["Modelo", "Processador", "Contexto", "Expira"], running.map((item) => [
    item.name,
    item.processorSplit ?? "n/a",
    item.context ?? "n/a",
    item.expiresAt ?? "n/a"
  ]));

  renderTable("ollama-installed", ["Instalado", "Contexto", "Arquitetura", "Licença"], installed.map((item) => [
    item.name,
    item.contextLength ?? "n/a",
    item.architecture ?? "n/a",
    item.license ?? "n/a"
  ]));
}

function renderProcesses(snapshot) {
  const processes = snapshot.processes?.processes ?? [];
  renderTable("processes-table", ["PID", "Processo", "CPU", "RAM", "GPU"], processes.map((item) => [
    item.pid,
    item.command,
    fmtPct(item.cpuPercent),
    fmtBytes(item.ramBytes),
    item.gpuPercent === null || item.gpuPercent === undefined ? "n/a" : fmtPct(item.gpuPercent)
  ]));
}

function renderBars(containerId, items, labelKey, valueKey, formatValue, tone) {
  const container = el(containerId);
  if (!items.length) {
    container.innerHTML = \`<div class="bar"><div class="mini">Sem dados</div></div>\`;
    return;
  }
  container.innerHTML = items.map((item) => {
    const value = item[valueKey];
    const percent = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
    return \`
      <div class="bar">
        <div>\${item[labelKey]}</div>
        <div class="track"><div class="fill" style="width:\${percent}%; background: linear-gradient(90deg, var(--\${tone}), rgba(255,255,255,0.2));"></div></div>
        <div class="mini">\${formatValue(value)}</div>
      </div>
    \`;
  }).join("");
}

function renderDiskAndNetwork(snapshot) {
  renderBars("disk-list", snapshot.disk?.filesystems ?? [], "mount", "usagePercent", (value) => fmtPct(value), "accent");
  renderBars("network-list", snapshot.network?.traffic ?? [], "interface", "rxBytesPerSec", (value) => \`\${fmtNum(value)} B/s\`, "accent-2");
}

function drawChart(canvas, points, key, color) {
  if (!canvas || !points.length) {
    return;
  }
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(4, 10, 18, 0.7)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  const values = points.map((point) => typeof point[key] === "number" ? Number(point[key]) : null).filter((value) => value !== null);
  if (!values.length) {
    return;
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(1, max - min);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * ratio;
  ctx.beginPath();
  points.forEach((point, index) => {
    const value = typeof point[key] === "number" ? Number(point[key]) : min;
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 24) - 12;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

function renderCharts(snapshot) {
  const points = snapshot.history?.last10Minutes ?? [];
  drawChart(el("chart-cpu"), points, "cpuUsage", "#7dd3fc");
  drawChart(el("chart-ram"), points, "ramUsedBytes", "#34d399");
  drawChart(el("chart-gpu"), points, "gpuUsagePercent", "#8b5cf6");
  drawChart(el("chart-temp"), points, "temperatureCelsius", "#f59e0b");
}

function render(snapshot) {
  state.snapshot = snapshot;
  renderSummary(snapshot);
  renderAnalysis(snapshot);
  renderCharts(snapshot);
  renderOllama(snapshot);
  renderProcesses(snapshot);
  renderDiskAndNetwork(snapshot);
}

function connect() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(\`\${protocol}//\${window.location.host}/ws\`);
  state.socket = socket;
  socket.onopen = () => {
    el("connection-pill").className = "pill pill-ok";
    el("connection-pill").textContent = "online";
  };
  socket.onclose = () => {
    el("connection-pill").className = "pill pill-warn";
    el("connection-pill").textContent = "reconnecting";
    setTimeout(connect, 1500);
  };
  socket.onerror = () => {
    el("connection-pill").className = "pill pill-bad";
    el("connection-pill").textContent = "error";
  };
  socket.onmessage = (event) => {
    try {
      render(JSON.parse(event.data));
    } catch {
      // ignore malformed payloads
    }
  };
}

connect();
`;
}
