import { CacheOptions, ICacheProvider } from "../cache.types";

type MultiCacheOptions = CacheOptions & {
  l1TTL?: number; // memory ttl
  l2TTL?: number; // redis ttl
};

export class MultiCacheProvider implements ICacheProvider {
  constructor(
    private l1: ICacheProvider, // Memory
    private l2: ICacheProvider, // Redis
    private options?: MultiCacheOptions,
  ) {}

  private l1TTL() {
    return this.options?.l1TTL ?? 30;
  }

  private l2TTL() {
    return this.options?.l2TTL ?? 120;
  }

  // ---------- GET ----------
  async get<T>(key: string): Promise<T | null> {
    try {
      // 1️⃣ Try L1 Memory
      const l1Data = await this.l1.get<T>(key);
      if (l1Data !== null) {
        return l1Data;
      }

      // 2️⃣ Try L2 Redis
      const l2Data = await this.l2.get<T>(key);

      if (l2Data !== null) {
        // Backfill L1
        await this.l1.set(key, l2Data, this.l1TTL());
        return l2Data;
      }

      return null;
    } catch (error) {
      console.error("[MultiCache] GET failed:", error);
      return null;
    }
  }

  // ---------- SET ----------
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const l1TTL = ttl ?? this.l1TTL();
      const l2TTL = ttl ?? this.l2TTL();

      // Write to both
      await Promise.allSettled([
        this.l1.set(key, value, l1TTL),
        this.l2.set(key, value, l2TTL),
      ]);
    } catch (error) {
      console.error("[MultiCache] SET failed:", error);
    }
  }

  // ---------- DELETE ----------
  async delete(key: string): Promise<void> {
    try {
      await Promise.allSettled([this.l1.delete(key), this.l2.delete(key)]);
    } catch (error) {
      console.error("[MultiCache] DELETE failed:", error);
    }
  }

  // ---------- CLEAR ----------
  async clear(): Promise<void> {
    try {
      await Promise.allSettled([this.l1.clear?.(), this.l2.clear?.()]);
    } catch (error) {
      console.error("[MultiCache] CLEAR failed:", error);
    }
  }
}
