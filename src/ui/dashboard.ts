export function getDashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
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
          <h1>Hardware intelligence dashboard</h1>
          <p class="lede">Customize layout, resize widgets, and tune colors locally in the browser.</p>
        </div>
        <div class="statusline">
          <button id="appearance-toggle" class="gear-button" type="button" aria-expanded="false" aria-controls="appearance-panel" title="Appearance">
            &#9881;
          </button>
          <span id="connection-pill" class="pill pill-warn">connecting</span>
          <span id="updated-at" class="muted">waiting for data</span>
        </div>
      </header>

      <section id="appearance-panel" class="control-panel panel is-hidden">
        <div class="control-header">
          <div>
            <h2>Appearance</h2>
            <p>These settings are stored in your browser only.</p>
          </div>
          <div class="control-actions">
            <button id="preset-midnight" type="button">Midnight</button>
            <button id="preset-contrast" type="button">Contrast</button>
            <button id="restore-defaults" type="button">Restore defaults</button>
            <button id="reset-theme" type="button">Reset theme</button>
            <button id="reset-layout" type="button">Reset layout</button>
          </div>
        </div>
        <div class="controls">
          <label><span>Background</span><input id="theme-bg" type="color" /></label>
          <label><span>Panel</span><input id="theme-panel" type="color" /></label>
          <label><span>Accent</span><input id="theme-accent" type="color" /></label>
          <label><span>Accent 2</span><input id="theme-accent-2" type="color" /></label>
          <label><span>Text</span><input id="theme-text" type="color" /></label>
          <label><span>Muted</span><input id="theme-muted" type="color" /></label>
          <label><span>Radius</span><input id="theme-radius" type="range" min="0" max="28" value="14" /></label>
        </div>
      </section>

      <section id="dashboard-grid" class="dashboard-grid" aria-live="polite"></section>
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
  --bg-2: #0d1728;
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
  --radius: 14px;
  --grid-gap: 12px;
  --canvas-bg: rgba(4, 10, 18, 0.7);
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

button,
input {
  font: inherit;
}

button {
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
}

button:hover {
  border-color: rgba(125, 211, 252, 0.45);
}

input[type="color"] {
  width: 100%;
  height: 38px;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: transparent;
  padding: 2px;
}

input[type="range"] {
  width: 100%;
}

.shell {
  max-width: 1560px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  margin-bottom: 18px;
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
h3,
p {
  margin: 0;
}

h1 {
  font-size: 34px;
  line-height: 1.08;
}

.lede {
  margin-top: 8px;
  color: var(--muted);
  max-width: 62ch;
}

.statusline {
  display: flex;
  gap: 12px;
  align-items: center;
}

.gear-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.muted {
  color: var(--muted);
}

.panel {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius);
  backdrop-filter: blur(10px);
}

.control-panel {
  padding: 16px;
  margin-bottom: 16px;
}

.control-panel.is-hidden {
  display: none;
}

.control-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 14px;
}

.control-header p {
  color: var(--muted);
}

.control-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: end;
}

.controls {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.controls label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: 36px;
  gap: var(--grid-gap);
}

.widget {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, rgba(14, 24, 41, 0.96), rgba(8, 16, 28, 0.96));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  position: relative;
}

.widget.drag-over {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.widget-header {
  display: flex;
  gap: 10px;
  align-items: start;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--line);
}

.drag-handle {
  user-select: none;
  cursor: grab;
  color: var(--muted);
  font-size: 18px;
  line-height: 1;
  padding-top: 2px;
}

.widget-title {
  flex: 1;
  min-width: 0;
}

.widget-title h3 {
  font-size: 15px;
  line-height: 1.2;
}

.widget-title p {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.widget-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: end;
}

.widget-actions button {
  padding: 5px 9px;
  border-radius: 8px;
  font-size: 12px;
}

.widget-body {
  display: grid;
  gap: 10px;
  padding: 12px;
  overflow: auto;
}

.widget[data-cols="12"] {
  grid-column: span 12;
}

.widget[data-cols="11"] {
  grid-column: span 11;
}

.widget[data-cols="10"] {
  grid-column: span 10;
}

.widget[data-cols="9"] {
  grid-column: span 9;
}

.widget[data-cols="8"] {
  grid-column: span 8;
}

.widget[data-cols="7"] {
  grid-column: span 7;
}

.widget[data-cols="6"] {
  grid-column: span 6;
}

.widget[data-cols="5"] {
  grid-column: span 5;
}

.widget[data-cols="4"] {
  grid-column: span 4;
}

.widget[data-cols="3"] {
  grid-column: span 3;
}

.widget[data-cols="2"] {
  grid-column: span 2;
}

.widget[data-rows="2"] {
  grid-row: span 2;
}

.widget[data-rows="3"] {
  grid-row: span 3;
}

.widget[data-rows="4"] {
  grid-row: span 4;
}

.widget[data-rows="5"] {
  grid-row: span 5;
}

.widget[data-rows="6"] {
  grid-row: span 6;
}

.widget[data-rows="7"] {
  grid-row: span 7;
}

.widget[data-rows="8"] {
  grid-row: span 8;
}

.resize-handle {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 18px;
  height: 18px;
  cursor: nwse-resize;
  border-right: 2px solid rgba(255, 255, 255, 0.35);
  border-bottom: 2px solid rgba(255, 255, 255, 0.35);
  z-index: 2;
  touch-action: none;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.metric {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px;
  min-height: 104px;
  background: rgba(4, 10, 18, 0.42);
}

.metric .label {
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 11px;
  margin-bottom: 8px;
}

.metric .value {
  font-size: 28px;
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
  grid-template-columns: 90px 1fr 68px;
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

canvas {
  width: 100%;
  height: 180px;
  background: var(--canvas-bg);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

@media (max-width: 1100px) {
  body {
    padding: 16px;
  }

  .topbar,
  .control-header {
    align-items: start;
    flex-direction: column;
  }

  .controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .widget[data-cols] {
    grid-column: span 1;
  }
}
`;
}

export function getDashboardJs(): string {
  return [
    "(function () {",
    "  const STORAGE_KEYS = {",
    "    theme: 'midnight-monitor.theme.v2',",
    "    layout: 'midnight-monitor.layout.v2'",
    "  };",
    "",
    "  const DEFAULT_THEME = {",
    "    bg: '#07111f',",
    "    panel: '#0c1524',",
    "    accent: '#7dd3fc',",
    "    accent2: '#8b5cf6',",
    "    text: '#e5eefb',",
    "    muted: '#8ea0bd',",
    "    radius: 14",
    "  };",
    "",
    "  const DEFAULT_LAYOUT = [",
    "    { id: 'overview', cols: 12, rows: 5 },",
    "    { id: 'analysis', cols: 6, rows: 6 },",
    "    { id: 'trends', cols: 6, rows: 6 },",
    "    { id: 'ollama', cols: 7, rows: 7 },",
    "    { id: 'processes', cols: 5, rows: 7 },",
    "    { id: 'resources', cols: 12, rows: 6 }",
    "  ];",
    "",
    "  const WIDGETS = {",
    "    overview: { title: 'Overview', description: 'Core system snapshot.' },",
    "    analysis: { title: 'Analysis', description: 'Automatic hardware guidance.' },",
    "    trends: { title: 'Trends', description: 'Recent history and rates.' },",
    "    ollama: { title: 'Ollama', description: 'Running and installed models.' },",
    "    processes: { title: 'Processes', description: 'Top resource consumers.' },",
    "    resources: { title: 'Storage and Network', description: 'Filesystem usage and traffic.' }",
    "  };",
    "",
    "  const state = {",
    "    snapshot: null,",
    "    socket: null,",
    "    layout: loadLayout(),",
    "    theme: loadTheme(),",
    "    draggingId: null,",
    "    resizing: null",
    "  };",
    "",
    "  function byId(id) { return document.getElementById(id); }",
    "",
    "  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }",
    "",
    "  function fmtBytes(value) {",
    "    if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';",
    "    var units = ['B', 'KB', 'MB', 'GB', 'TB'];",
    "    var current = Number(value);",
    "    var index = 0;",
    "    while (current >= 1024 && index < units.length - 1) { current /= 1024; index += 1; }",
    "    return current.toFixed(current >= 100 ? 0 : current >= 10 ? 1 : 2) + ' ' + units[index];",
    "  }",
    "",
    "  function fmtPct(value) { return typeof value === 'number' ? value.toFixed(1) + '%' : 'n/a'; }",
    "  function fmtNum(value) { return typeof value === 'number' ? value.toFixed(value >= 10 ? 0 : 1) : 'n/a'; }",
    "  function severityClass(severity) { return severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : 'info'; }",
    "  function statusClass(percent) { if (typeof percent !== 'number') return 'warn'; if (percent >= 90) return 'bad'; if (percent >= 70) return 'warn'; return 'good'; }",
    "",
    "  function loadTheme() {",
    "    try {",
    "      var raw = window.localStorage.getItem(STORAGE_KEYS.theme);",
    "      var theme = raw ? Object.assign({}, DEFAULT_THEME, JSON.parse(raw)) : Object.assign({}, DEFAULT_THEME);",
    "      theme.panel = normalizeHex(theme.panel, DEFAULT_THEME.panel);",
    "      return theme;",
    "    } catch (_error) {",
    "      return Object.assign({}, DEFAULT_THEME);",
    "    }",
    "  }",
    "",
    "  function loadLayout() {",
    "    try {",
    "      var raw = window.localStorage.getItem(STORAGE_KEYS.layout);",
    "      if (!raw) return DEFAULT_LAYOUT.map(function (item) { return Object.assign({}, item); });",
    "      var parsed = JSON.parse(raw);",
    "      if (!Array.isArray(parsed)) return DEFAULT_LAYOUT.map(function (item) { return Object.assign({}, item); });",
    "      var byId = new Map(parsed.map(function (item) { return [item.id, item]; }));",
    "      return DEFAULT_LAYOUT.map(function (item) {",
    "        var saved = byId.get(item.id) || {};",
    "        return {",
    "          id: item.id,",
    "          cols: clamp(Number(saved.cols || item.cols), 2, 12),",
    "          rows: clamp(Number(saved.rows || item.rows), 2, 8)",
    "        };",
    "      });",
    "    } catch (_error) {",
    "      return DEFAULT_LAYOUT.map(function (item) { return Object.assign({}, item); });",
    "    }",
    "  }",
    "",
    "  function saveTheme() { window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(state.theme)); }",
    "  function saveLayout() { window.localStorage.setItem(STORAGE_KEYS.layout, JSON.stringify(state.layout)); }",
    "",
    "  function toggleAppearancePanel(force) {",
    "    var panel = byId('appearance-panel');",
    "    var toggle = byId('appearance-toggle');",
    "    if (!panel || !toggle) return;",
    "    var shouldShow = typeof force === 'boolean' ? force : panel.classList.contains('is-hidden');",
    "    panel.classList.toggle('is-hidden', !shouldShow);",
    "    toggle.setAttribute('aria-expanded', String(shouldShow));",
    "  }",
    "",
    "  function applyTheme() {",
    "    var root = document.documentElement;",
    "    root.style.setProperty('--bg', state.theme.bg);",
    "    root.style.setProperty('--panel', hexToRgba(state.theme.panel, 0.88));",
    "    root.style.setProperty('--accent', state.theme.accent);",
    "    root.style.setProperty('--accent-2', state.theme.accent2);",
    "    root.style.setProperty('--text', state.theme.text);",
    "    root.style.setProperty('--muted', state.theme.muted);",
    "    root.style.setProperty('--radius', String(state.theme.radius) + 'px');",
    "  }",
    "",
    "  function setTheme(theme) {",
    "    state.theme = Object.assign({}, state.theme, theme);",
    "    applyTheme();",
    "    saveTheme();",
    "    syncThemeControls();",
    "  }",
    "",
    "  function syncThemeControls() {",
    "    byId('theme-bg').value = state.theme.bg;",
    "    byId('theme-panel').value = state.theme.panel;",
    "    byId('theme-accent').value = state.theme.accent;",
    "    byId('theme-accent-2').value = state.theme.accent2;",
    "    byId('theme-text').value = state.theme.text;",
    "    byId('theme-muted').value = state.theme.muted;",
    "    byId('theme-radius').value = String(state.theme.radius);",
    "  }",
    "",
    "  function normalizeHex(value, fallback) {",
    "    return typeof value === 'string' && /^#([0-9a-fA-F]{6})$/.test(value) ? value : fallback;",
    "  }",
    "",
    "  function hexToRgba(hex, alpha) {",
    "    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) return 'rgba(12, 21, 36, ' + alpha + ')';",
    "    var normalized = hex.slice(1);",
    "    var red = parseInt(normalized.slice(0, 2), 16);",
    "    var green = parseInt(normalized.slice(2, 4), 16);",
    "    var blue = parseInt(normalized.slice(4, 6), 16);",
    "    return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';",
    "  }",
    "",
    "  function normalizedLayout() {",
    "    return state.layout.slice().sort(function (left, right) { return DEFAULT_LAYOUT.findIndex(function (item) { return item.id === left.id; }) - DEFAULT_LAYOUT.findIndex(function (item) { return item.id === right.id; }); });",
    "  }",
    "",
    "  function moveWidget(id, delta) {",
    "    var index = state.layout.findIndex(function (item) { return item.id === id; });",
    "    if (index < 0) return;",
    "    var nextIndex = clamp(index + delta, 0, state.layout.length - 1);",
    "    if (nextIndex === index) return;",
    "    var item = state.layout.splice(index, 1)[0];",
    "    state.layout.splice(nextIndex, 0, item);",
    "    saveLayout();",
    "    render();",
    "  }",
    "",
    "  function resizeWidget(id, colsDelta, rowsDelta) {",
    "    var item = state.layout.find(function (entry) { return entry.id === id; });",
    "    if (!item) return;",
    "    item.cols = clamp(item.cols + colsDelta, 2, 12);",
    "    item.rows = clamp(item.rows + rowsDelta, 2, 8);",
    "    saveLayout();",
    "    render();",
    "  }",
    "",
    "  function makeMetric(label, value, sub, tone) {",
    "    return '<article class=\"metric ' + tone + '\"><div class=\"label\">' + label + '</div><div class=\"value\">' + value + '</div><div class=\"sub\">' + sub + '</div></article>';",
    "  }",
    "",
    "  function renderOverview(snapshot) {",
    "    var cpu = snapshot.cpu || {};",
    "    var ram = snapshot.ram || {};",
    "    var swap = snapshot.swap || {};",
    "    var gpu = snapshot.gpu || {};",
    "    var temp = snapshot.temperatures || {};",
    "    var network = snapshot.network || {};",
    "    var disk = snapshot.disk || { filesystems: [] };",
    "    var bestFilesystem = disk.filesystems && disk.filesystems[0];",
    "    var cards = [",
    "      makeMetric('CPU', fmtPct(cpu.usage), String(cpu.cores || 'n/a') + ' cores · ' + String(cpu.frequencyMhz || 'n/a') + ' MHz', statusClass(cpu.usage)),",
    "      makeMetric('Memory', fmtPct(ram.usagePercent), fmtBytes(ram.usedBytes) + ' / ' + fmtBytes(ram.totalBytes), statusClass(ram.usagePercent)),",
    "      makeMetric('Swap', fmtPct(swap.usagePercent), fmtBytes(swap.usedBytes) + ' / ' + fmtBytes(swap.totalBytes), statusClass(swap.usagePercent)),",
    "      makeMetric('GPU', fmtPct(gpu.usagePercent), String(gpu.vendor || 'n/a') + ' · ' + String(gpu.model || 'n/a'), statusClass(gpu.usagePercent)),",
    "      makeMetric('VRAM', gpu.vram && gpu.vram.totalBytes ? fmtPct((gpu.vram.usedBytes || 0) / gpu.vram.totalBytes * 100) : 'n/a', fmtBytes(gpu.vram && gpu.vram.usedBytes) + ' / ' + fmtBytes(gpu.vram && gpu.vram.totalBytes), statusClass(gpu.usagePercent)),",
    "      makeMetric('Temperature', typeof temp.cpuCelsius === 'number' ? temp.cpuCelsius.toFixed(1) + ' C' : typeof temp.gpuCelsius === 'number' ? temp.gpuCelsius.toFixed(1) + ' C' : 'n/a', String(temp.fanRpm || 'n/a') + ' RPM', typeof temp.gpuCelsius === 'number' && temp.gpuCelsius >= 85 ? 'bad' : 'good'),",
    "      makeMetric('Network', fmtNum(network.totalRxBytesPerSec) + ' B/s down', fmtNum(network.totalTxBytesPerSec) + ' B/s up · ' + String(network.hostname || 'n/a'), 'good'),",
    "      makeMetric('Disk', bestFilesystem ? fmtPct(bestFilesystem.usagePercent) : 'n/a', bestFilesystem ? String(bestFilesystem.mount) + ' · ' + fmtBytes(bestFilesystem.usedBytes) + ' / ' + fmtBytes(bestFilesystem.totalBytes) : 'no data', statusClass(bestFilesystem && bestFilesystem.usagePercent))",
    "    ];",
    "    return '<div class=\"metric-grid\">' + cards.join('') + '</div>';",
    "  }",
    "",
    "  function renderAnalysis(snapshot) {",
    "    var list = snapshot.analysis || [];",
    "    if (!list.length) {",
    "      return '<div class=\"finding info\"><div><div class=\"title\">No alerts</div><div class=\"desc\">No meaningful pressure was detected.</div></div></div>';",
    "    }",
    "    return list.map(function (finding) {",
    "      return '<div class=\"finding ' + severityClass(finding.severity) + '\"><div><div class=\"title\">' + finding.message + '</div><div class=\"desc\">' + (finding.suggestion || finding.source) + '</div></div><div class=\"mini\">' + String(finding.severity).toUpperCase() + '</div></div>';",
    "    }).join('');",
    "  }",
    "",
    "  function renderTrendCanvases() {",
    "    return '<div class=\"chart-grid\"><canvas id=\"chart-cpu\" width=\"640\" height=\"180\"></canvas><canvas id=\"chart-ram\" width=\"640\" height=\"180\"></canvas><canvas id=\"chart-gpu\" width=\"640\" height=\"180\"></canvas><canvas id=\"chart-temp\" width=\"640\" height=\"180\"></canvas></div>';",
    "  }",
    "",
    "  function renderTable(containerId, columns, rows) {",
    "    var container = byId(containerId);",
    "    if (!container) return;",
    "    if (!rows.length) {",
    "      container.innerHTML = '<div class=\"bar\"><div class=\"mini\">No data</div></div>';",
    "      return;",
    "    }",
    "    container.innerHTML = '<table><thead><tr>' + columns.map(function (column) { return '<th>' + column + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (row) { return '<tr>' + row.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';",
    "  }",
    "",
    "  function renderOllama(snapshot) {",
    "    var running = snapshot.ollama && snapshot.ollama.running || [];",
    "    var installed = snapshot.ollama && snapshot.ollama.installed || [];",
    "    return [",
    "      '<div class=\"table-wrap\" id=\"ollama-running\"></div>',",
    "      '<div class=\"table-wrap\" id=\"ollama-installed\"></div>'",
    "    ].join('');",
    "  }",
    "",
    "  function renderProcesses(snapshot) {",
    "    return '<div class=\"table-wrap\" id=\"processes-table\"></div>';",
    "  }",
    "",
    "  function renderResources(snapshot) {",
    "    var disk = snapshot.disk && snapshot.disk.filesystems || [];",
    "    var network = snapshot.network && snapshot.network.traffic || [];",
    "    var diskMarkup = disk.length ? disk.map(function (item) {",
    "      var percent = typeof item.usagePercent === 'number' ? clamp(item.usagePercent, 0, 100) : 0;",
    "      return '<div class=\"bar\"><div>' + item.mount + '</div><div class=\"track\"><div class=\"fill\" style=\"width:' + percent + '%\"></div></div><div class=\"mini\">' + fmtPct(item.usagePercent) + '</div></div>';",
    "    }).join('') : '<div class=\"bar\"><div class=\"mini\">No data</div></div>';",
    "    var networkMarkup = network.length ? network.map(function (item) {",
    "      return '<div class=\"bar\"><div>' + item.interface + '</div><div class=\"track\"><div class=\"fill\" style=\"width:' + clamp(item.rxBytesPerSec / 1000000 * 10, 0, 100) + '%; background: linear-gradient(90deg, var(--accent-2), var(--accent));\"></div></div><div class=\"mini\">' + fmtNum(item.rxBytesPerSec) + ' B/s</div></div>';",
    "    }).join('') : '<div class=\"bar\"><div class=\"mini\">No data</div></div>';",
    "    return '<div class=\"stack\"><div class=\"table-wrap\"><div class=\"mini\" style=\"padding:10px 12px;\">Disk usage</div>' + diskMarkup + '</div><div class=\"table-wrap\"><div class=\"mini\" style=\"padding:10px 12px;\">Network traffic</div>' + networkMarkup + '</div></div>';",
    "  }",
    "",
    "  function widgetShell(item, content) {",
    "    var meta = WIDGETS[item.id];",
    "    return '<article class=\"widget\" draggable=\"true\" data-id=\"' + item.id + '\" data-cols=\"' + item.cols + '\" data-rows=\"' + item.rows + '\">' +",
    "      '<header class=\"widget-header\">' +",
    "      '<div class=\"drag-handle\" title=\"Drag to reorder\">&#8942;&#8942;</div>' +",
    "      '<div class=\"widget-title\"><h3>' + meta.title + '</h3><p>' + meta.description + '</p></div>' +",
    "      '<div class=\"widget-actions\">' +",
    "      '<button type=\"button\" data-action=\"left\" aria-label=\"Move left\">&#8592;</button>' +",
    "      '<button type=\"button\" data-action=\"right\" aria-label=\"Move right\">&#8594;</button>' +",
    "      '<button type=\"button\" data-action=\"shrink\" aria-label=\"Shrink\">&#8722;</button>' +",
    "      '<button type=\"button\" data-action=\"grow\" aria-label=\"Grow\">&#43;</button>' +",
    "      '<button type=\"button\" data-action=\"shorter\" aria-label=\"Shorter\">&#8595;</button>' +",
    "      '<button type=\"button\" data-action=\"taller\" aria-label=\"Taller\">&#8593;</button>' +",
    "      '</div>' +",
    "      '</header>' +",
    "      '<div class=\"widget-body\">' + content + '</div>' +",
    "      '<div class=\"resize-handle\" title=\"Resize\"></div>' +",
    "    '</article>';",
    "  }",
    "",
    "  function renderWidget(item, snapshot) {",
    "    if (item.id === 'overview') return widgetShell(item, renderOverview(snapshot));",
    "    if (item.id === 'analysis') return widgetShell(item, renderAnalysis(snapshot));",
    "    if (item.id === 'trends') return widgetShell(item, renderTrendCanvases());",
    "    if (item.id === 'ollama') {",
    "      var runningRows = (snapshot.ollama && snapshot.ollama.running || []).map(function (entry) { return [entry.name, fmtPct(entry.cpuPercent), fmtPct(entry.gpuPercent), entry.context || 'n/a', entry.contextLength || 'n/a', entry.size || 'n/a', entry.expiresAt || 'n/a']; });",
    "      var installedRows = (snapshot.ollama && snapshot.ollama.installed || []).map(function (entry) { return [entry.name, entry.contextLength || 'n/a', entry.quantization || 'n/a', entry.architecture || 'n/a', entry.license || 'n/a']; });",
    "      return widgetShell(item, '<div class=\"table-wrap\" id=\"ollama-running\"></div><div class=\"table-wrap\" id=\"ollama-installed\"></div>');",
    "    }",
    "    if (item.id === 'processes') return widgetShell(item, '<div class=\"table-wrap\" id=\"processes-table\"></div>');",
    "    if (item.id === 'resources') return widgetShell(item, renderResources(snapshot));",
    "    return widgetShell(item, '<div class=\"mini\">No renderer available.</div>');",
    "  }",
    "",
    "  function drawChart(canvas, points, key, color) {",
    "    if (!canvas || !points.length) return;",
    "    var ratio = window.devicePixelRatio || 1;",
    "    var width = canvas.clientWidth * ratio;",
    "    var height = canvas.clientHeight * ratio;",
    "    canvas.width = width;",
    "    canvas.height = height;",
    "    var ctx = canvas.getContext('2d');",
    "    if (!ctx) return;",
    "    ctx.clearRect(0, 0, width, height);",
    "    ctx.fillStyle = 'rgba(4, 10, 18, 0.7)';",
    "    ctx.fillRect(0, 0, width, height);",
    "    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';",
    "    ctx.lineWidth = 1;",
    "    for (var i = 0; i <= 4; i += 1) {",
    "      var yGrid = (height / 4) * i;",
    "      ctx.beginPath();",
    "      ctx.moveTo(0, yGrid);",
    "      ctx.lineTo(width, yGrid);",
    "      ctx.stroke();",
    "    }",
    "    var values = points.map(function (point) { return typeof point[key] === 'number' ? Number(point[key]) : null; }).filter(function (value) { return value !== null; });",
    "    if (!values.length) return;",
    "    var max = Math.max.apply(Math, values.concat([1]));",
    "    var min = Math.min.apply(Math, values.concat([0]));",
    "    var span = Math.max(1, max - min);",
    "    ctx.strokeStyle = color;",
    "    ctx.lineWidth = 2 * ratio;",
    "    ctx.beginPath();",
    "    points.forEach(function (point, index) {",
    "      var value = typeof point[key] === 'number' ? Number(point[key]) : min;",
    "      var x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;",
    "      var y = height - ((value - min) / span) * (height - 24) - 12;",
    "      if (index === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }",
    "    });",
    "    ctx.stroke();",
    "  }",
    "",
    "  function renderCharts(snapshot) {",
    "    var points = snapshot.history && snapshot.history.last10Minutes || [];",
    "    drawChart(byId('chart-cpu'), points, 'cpuUsage', '#7dd3fc');",
    "    drawChart(byId('chart-ram'), points, 'ramUsedBytes', '#34d399');",
    "    drawChart(byId('chart-gpu'), points, 'gpuUsagePercent', '#8b5cf6');",
    "    drawChart(byId('chart-temp'), points, 'temperatureCelsius', '#f59e0b');",
    "  }",
    "",
    "  function renderTables(snapshot) {",
    "    renderTable('ollama-running', ['Model', 'CPU %', 'GPU %', 'Context', 'Limit', 'Size', 'Expires'], (snapshot.ollama && snapshot.ollama.running || []).map(function (item) { return [item.name, fmtPct(item.cpuPercent), fmtPct(item.gpuPercent), item.context || 'n/a', item.contextLength || 'n/a', item.size || 'n/a', item.expiresAt || 'n/a']; }));",
    "    renderTable('ollama-installed', ['Model', 'Context', 'Quantization', 'Architecture', 'License'], (snapshot.ollama && snapshot.ollama.installed || []).map(function (item) { return [item.name, item.contextLength || 'n/a', item.quantization || 'n/a', item.architecture || 'n/a', item.license || 'n/a']; }));",
    "    renderTable('processes-table', ['PID', 'Process', 'CPU', 'RAM', 'GPU'], (snapshot.processes && snapshot.processes.processes || []).map(function (item) { return [item.pid, item.command, fmtPct(item.cpuPercent), fmtBytes(item.ramBytes), item.gpuPercent === null || item.gpuPercent === undefined ? 'n/a' : fmtPct(item.gpuPercent)]; }));",
    "  }",
    "",
    "  function renderWidgets(snapshot) {",
    "    var grid = byId('dashboard-grid');",
    "    grid.innerHTML = state.layout.map(function (item) { return widgetShell(item, item.id === 'overview' ? renderOverview(snapshot) : item.id === 'analysis' ? renderAnalysis(snapshot) : item.id === 'trends' ? renderTrendCanvases() : item.id === 'resources' ? renderResources(snapshot) : item.id === 'ollama' ? '<div class=\"table-wrap\" id=\"ollama-running\"></div><div class=\"table-wrap\" id=\"ollama-installed\"></div>' : item.id === 'processes' ? '<div class=\"table-wrap\" id=\"processes-table\"></div>' : '<div class=\"mini\">No renderer available.</div>'); }).join('');",
    "    renderCharts(snapshot);",
    "    renderTables(snapshot);",
    "    attachInteractions();",
    "  }",
    "",
    "  function updateStatus(snapshot) {",
    "    var analysis = snapshot.analysis || [];",
    "    var pill = byId('connection-pill');",
    "    var bad = analysis.some(function (item) { return item.severity === 'critical'; });",
    "    var warn = analysis.some(function (item) { return item.severity === 'warning'; });",
    "    pill.className = 'pill ' + (bad ? 'pill-bad' : warn ? 'pill-warn' : 'pill-ok');",
    "    pill.textContent = bad ? 'critical' : warn ? 'warning' : 'ok';",
    "    byId('updated-at').textContent = 'updated ' + new Date(snapshot.timestamp).toLocaleString('en-US');",
    "  }",
    "",
    "  function render(snapshot) {",
    "    state.snapshot = snapshot;",
    "    updateStatus(snapshot);",
    "    renderWidgets(snapshot);",
    "  }",
    "",
    "  function connect() {",
    "    var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';",
    "    var socket = new WebSocket(protocol + '//' + window.location.host + '/ws');",
    "    state.socket = socket;",
    "    socket.onopen = function () { byId('connection-pill').className = 'pill pill-ok'; byId('connection-pill').textContent = 'online'; };",
    "    socket.onclose = function () { byId('connection-pill').className = 'pill pill-warn'; byId('connection-pill').textContent = 'reconnecting'; setTimeout(connect, 1500); };",
    "    socket.onerror = function () { byId('connection-pill').className = 'pill pill-bad'; byId('connection-pill').textContent = 'error'; };",
    "    socket.onmessage = function (event) { try { render(JSON.parse(event.data)); } catch (_error) {} };",
    "  }",
    "",
    "  function bootstrapThemeControls() {",
    "    syncThemeControls();",
    "    byId('appearance-toggle').addEventListener('click', function () { toggleAppearancePanel(); });",
    "    byId('theme-bg').addEventListener('input', function (event) { setTheme({ bg: event.target.value }); });",
    "    byId('theme-panel').addEventListener('input', function (event) { setTheme({ panel: event.target.value }); });",
    "    byId('theme-accent').addEventListener('input', function (event) { setTheme({ accent: event.target.value }); });",
    "    byId('theme-accent-2').addEventListener('input', function (event) { setTheme({ accent2: event.target.value }); });",
    "    byId('theme-text').addEventListener('input', function (event) { setTheme({ text: event.target.value }); });",
    "    byId('theme-muted').addEventListener('input', function (event) { setTheme({ muted: event.target.value }); });",
    "    byId('theme-radius').addEventListener('input', function (event) { setTheme({ radius: Number(event.target.value) }); });",
    "    byId('preset-midnight').addEventListener('click', function () { setTheme({ bg: '#07111f', panel: '#0c1524', accent: '#7dd3fc', accent2: '#8b5cf6', text: '#e5eefb', muted: '#8ea0bd', radius: 14 }); });",
    "    byId('preset-contrast').addEventListener('click', function () { setTheme({ bg: '#050816', panel: '#111827', accent: '#22d3ee', accent2: '#f472b6', text: '#f8fafc', muted: '#cbd5e1', radius: 10 }); });",
    "    byId('restore-defaults').addEventListener('click', function () { state.theme = Object.assign({}, DEFAULT_THEME); state.layout = DEFAULT_LAYOUT.map(function (item) { return Object.assign({}, item); }); applyTheme(); saveTheme(); saveLayout(); syncThemeControls(); if (state.snapshot) render(state.snapshot); });",
    "    byId('reset-theme').addEventListener('click', function () { state.theme = Object.assign({}, DEFAULT_THEME); applyTheme(); saveTheme(); syncThemeControls(); });",
    "    byId('reset-layout').addEventListener('click', function () { state.layout = DEFAULT_LAYOUT.map(function (item) { return Object.assign({}, item); }); saveLayout(); if (state.snapshot) render(state.snapshot); });",
    "  }",
    "",
    "  function attachInteractions() {",
    "    var grid = byId('dashboard-grid');",
    "    grid.querySelectorAll('.widget').forEach(function (widget) {",
    "      var id = widget.getAttribute('data-id');",
    "      var header = widget.querySelector('.drag-handle');",
    "      var resizeHandle = widget.querySelector('.resize-handle');",
    "      widget.querySelectorAll('button[data-action]').forEach(function (button) {",
    "        button.addEventListener('click', function () {",
    "          var action = button.getAttribute('data-action');",
    "          if (action === 'left') moveWidget(id, -1);",
    "          if (action === 'right') moveWidget(id, 1);",
    "          if (action === 'shrink') resizeWidget(id, -1, 0);",
    "          if (action === 'grow') resizeWidget(id, 1, 0);",
    "          if (action === 'shorter') resizeWidget(id, 0, -1);",
    "          if (action === 'taller') resizeWidget(id, 0, 1);",
    "        });",
    "      });",
    "",
    "      widget.addEventListener('dragover', function (event) { event.preventDefault(); widget.classList.add('drag-over'); });",
    "      widget.addEventListener('dragleave', function () { widget.classList.remove('drag-over'); });",
    "      widget.addEventListener('drop', function (event) {",
    "        event.preventDefault();",
    "        widget.classList.remove('drag-over');",
    "        var draggedId = event.dataTransfer.getData('text/plain');",
    "        if (!draggedId || draggedId === id) return;",
    "        var targetIndex = state.layout.findIndex(function (entry) { return entry.id === id; });",
    "        var draggedIndex = state.layout.findIndex(function (entry) { return entry.id === draggedId; });",
    "        if (targetIndex < 0 || draggedIndex < 0) return;",
    "        var dragged = state.layout.splice(draggedIndex, 1)[0];",
    "        var rect = widget.getBoundingClientRect();",
    "        var before = event.clientY < rect.top + rect.height / 2;",
    "        var insertIndex = before ? targetIndex : targetIndex + (draggedIndex < targetIndex ? 0 : 1);",
    "        if (draggedIndex < targetIndex) insertIndex -= 1;",
    "        state.layout.splice(clamp(insertIndex, 0, state.layout.length), 0, dragged);",
    "        saveLayout();",
    "        if (state.snapshot) render(state.snapshot);",
    "      });",
    "",
    "      widget.addEventListener('dragstart', function (event) {",
    "        state.draggingId = id;",
    "        event.dataTransfer.effectAllowed = 'move';",
    "        event.dataTransfer.setData('text/plain', id);",
    "      });",
    "      widget.addEventListener('dragend', function () { state.draggingId = null; widget.classList.remove('drag-over'); });",
    "",
    "      resizeHandle.addEventListener('pointerdown', function (event) {",
    "        event.preventDefault();",
    "        var item = state.layout.find(function (entry) { return entry.id === id; });",
    "        if (!item) return;",
    "        var gridRect = grid.getBoundingClientRect();",
    "        var gridStyles = window.getComputedStyle(grid);",
    "        var columnGap = Number.parseFloat(gridStyles.columnGap || gridStyles.gridColumnGap || '0') || 0;",
    "        var rowGap = Number.parseFloat(gridStyles.rowGap || gridStyles.gridRowGap || '0') || 0;",
    "        var columnStep = (gridRect.width - columnGap * 11) / 12 + columnGap;",
    "        var rowStep = Number.parseFloat(gridStyles.gridAutoRows || '36') + rowGap;",
    "        state.resizing = {",
    "          id: id,",
    "          startX: event.clientX,",
    "          startY: event.clientY,",
    "          startCols: item.cols,",
    "          startRows: item.rows,",
    "          cellWidth: columnStep,",
    "          cellHeight: rowStep",
    "        };",
    "        resizeHandle.setPointerCapture(event.pointerId);",
    "      });",
    "    });",
    "",
    "    document.addEventListener('pointermove', function (event) {",
    "      if (!state.resizing) return;",
    "      var item = state.layout.find(function (entry) { return entry.id === state.resizing.id; });",
    "      if (!item) return;",
    "      var colsDelta = Math.round((event.clientX - state.resizing.startX) / state.resizing.cellWidth);",
    "      var rowsDelta = Math.round((event.clientY - state.resizing.startY) / state.resizing.cellHeight);",
    "      item.cols = clamp(state.resizing.startCols + colsDelta, 2, 12);",
    "      item.rows = clamp(state.resizing.startRows + rowsDelta, 2, 8);",
    "      saveLayout();",
    "      if (state.snapshot) render(state.snapshot);",
    "    });",
    "",
    "    document.addEventListener('pointerup', function () { state.resizing = null; });",
    "  }",
    "",
    "  function bootstrap() {",
    "    applyTheme();",
    "    bootstrapThemeControls();",
    "    toggleAppearancePanel(false);",
    "    render({",
    "      timestamp: new Date().toISOString(),",
    "      cpu: null, ram: null, swap: null, gpu: null, disk: null, network: null, temperatures: null, ollama: null, llamacpp: null, processes: null, history: { last60Seconds: [], last10Minutes: [], lastHour: [] }, analysis: []",
    "    });",
    "    fetch('/metrics', { cache: 'no-store' }).then(function (response) { return response.ok ? response.json() : null; }).then(function (payload) { if (payload) render(payload); }).catch(function () {});",
    "    connect();",
    "  }",
    "",
    "  bootstrap();",
    "})();"
  ].join('\n');
}
