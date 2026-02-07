import { CacheServiceOptions, ICacheProvider } from "./cache.types";

export class CacheService {
  private defaultTTL: number;

  constructor(
    private provider: ICacheProvider,
    options?: CacheServiceOptions,
  ) {
    this.defaultTTL = options?.defaultTTL ?? 60;
  }

  // ---------- BASIC OPS ----------

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.provider.get<T>(key);
    } catch (error) {
      console.error("[CacheService] GET failed:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.provider.set(key, value, ttl ?? this.defaultTTL);
    } catch (error) {
      console.error("[CacheService] SET failed:", error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.provider.delete(key);
    } catch (error) {
      console.error("[CacheService] DELETE failed:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.provider.clear) {
        await this.provider.clear();
      }
    } catch (error) {
      console.error("[CacheService] CLEAR failed:", error);
    }
  }

  // ---------- PRODUCTION LEVEL ----------

  /**
   * Remember pattern (Read-through cache)
   * If cache miss → fetch → store → return
   */
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;

      const fresh = await fetcher();

      await this.set(key, fresh, ttl ?? this.defaultTTL);

      return fresh;
    } catch (error) {
      console.error("[CacheService] REMEMBER failed:", error);
      return fetcher(); // fallback: still return data
    }
  }

  // ---------- BULK OPS (OPTIONAL BUT GOOD) ----------

  async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};

    await Promise.all(
      keys.map(async (k) => {
        result[k] = await this.get<T>(k);
      }),
    );

    return result;
  }

  async setMany<T>(entries: Record<string, T>, ttl?: number): Promise<void> {
    await Promise.all(
      Object.entries(entries).map(([k, v]) => this.set(k, v, ttl)),
    );
  }

  async delMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.del(k)));
  }
}
