export function getFlagValue(args: string[], flags: string[]): string | null {
  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    for (const flag of flags) {
      if (current === flag && index + 1 < args.length) {
        return args[index + 1] ?? null;
      }
      if (current.startsWith(`${flag}=`)) {
        return current.slice(flag.length + 1);
      }
    }
  }
  return null;
}

export function getFlagNumber(args: string[], flags: string[]): number | null {
  const value = getFlagValue(args, flags);
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

