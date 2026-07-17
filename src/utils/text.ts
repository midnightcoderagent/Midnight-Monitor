export function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

export function toLines(input: string): string[] {
  return input.split(/\r?\n/).map((line) => line.trimEnd());
}

export function parsePercent(input: string): number | null {
  const match = input.match(/(-?\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}

export function parseBytes(input: string): number | null {
  const trimmed = input.trim();
  const match = trimmed.match(/(-?\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB|KiB|MiB|GiB|TiB)?/i);
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  const unit = (match[2] ?? "B").toUpperCase();
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    TB: 1000 ** 4,
    KIB: 1024,
    MIB: 1024 ** 2,
    GIB: 1024 ** 3,
    TIB: 1024 ** 4
  };
  return Math.round(value * (multipliers[unit] ?? 1));
}

export function splitColumns(line: string): string[] {
  return line.trim().split(/\s{2,}|\t+/).filter((value) => value.length > 0);
}

