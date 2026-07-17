import type { Cache, CacheEntry } from "../types/collector.js";

export class TTLCache implements Cache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  public get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlMs: number): void {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  public async getOrSet<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await producer();
    this.set(key, value, ttlMs);
    return value;
  }
}

