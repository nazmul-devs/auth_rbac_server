import { CacheOptions, ICacheProvider } from "../cache.types";

type MemoryCacheOptions = CacheOptions & {
  maxItems?: number;
  cleanupIntervalMs?: number;
};

type CacheEntry = {
  value: string;
  expiresAt: number | null;
};

export class MemoryProvider implements ICacheProvider {
  private store = new Map<string, CacheEntry>();
  private defaultTTL: number;
  private maxItems: number;
  private keyPrefix?: string;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options?: MemoryCacheOptions) {
    this.defaultTTL = options?.ttl ?? 60;
    this.maxItems = options?.maxItems ?? 5000;
    this.keyPrefix = options?.prefix;

    const cleanupInterval = options?.cleanupIntervalMs ?? 30000;

    this.cleanupTimer = setInterval(
      () => this.cleanupExpired(),
      cleanupInterval,
    );

    this.cleanupTimer.unref?.();
  }

  // ---------- Helpers ----------

  private buildKey(key: string) {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private safeStringify(data: unknown): string | null {
    try {
      return JSON.stringify(data);
    } catch (err) {
      console.error("[MemoryCache] stringify failed:", err);
      return null;
    }
  }

  private safeParse<T>(data: string): T | null {
    try {
      return JSON.parse(data) as T;
    } catch (err) {
      console.error("[MemoryCache] parse failed:", err);
      return null;
    }
  }

  private evictIfNeeded() {
    if (this.store.size < this.maxItems) return;

    const firstKey = this.store.keys().next().value;
    if (firstKey) {
      this.store.delete(firstKey);
    }
  }

  private cleanupExpired() {
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }

  // ---------- Core Methods ----------

  async get<T>(key: string): Promise<T | null> {
    try {
      const finalKey = this.buildKey(key);
      const entry = this.store.get(finalKey);

      if (!entry) return null;

      if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        this.store.delete(finalKey);
        return null;
      }

      return this.safeParse<T>(entry.value);
    } catch (error) {
      console.error("[MemoryCache] GET failed:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const finalKey = this.buildKey(key);
      const serialized = this.safeStringify(value);
      if (!serialized) return;

      this.evictIfNeeded();

      const expire = ttl === undefined ? this.defaultTTL : ttl;

      const expiresAt = expire > 0 ? Date.now() + expire * 1000 : null;

      this.store.set(finalKey, {
        value: serialized,
        expiresAt,
      });
    } catch (error) {
      console.error("[MemoryCache] SET failed:", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const finalKey = this.buildKey(key);
      this.store.delete(finalKey);
    } catch (error) {
      console.error("[MemoryCache] DELETE failed:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.keyPrefix) {
        this.store.clear();
        return;
      }

      for (const key of this.store.keys()) {
        if (key.startsWith(`${this.keyPrefix}:`)) {
          this.store.delete(key);
        }
      }
    } catch (error) {
      console.error("[MemoryCache] CLEAR failed:", error);
    }
  }

  // ---------- Optional Production Metrics ----------

  size() {
    return this.store.size;
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}
