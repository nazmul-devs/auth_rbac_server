import Redis from "ioredis";
import { CacheOptions, ICacheProvider } from "../cache.types";

type RedisCacheOptions = CacheOptions;

export class RedisCacheProvider implements ICacheProvider {
  private client: Redis;
  private defaultTTL: number;
  private keyPrefix?: string;

  constructor(redisClient: Redis, options?: RedisCacheOptions) {
    this.client = redisClient;
    this.defaultTTL = options?.ttl ?? 60;
    this.keyPrefix = options?.prefix;
  }

  // ---------- Helpers ----------

  private buildKey(key: string) {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private safeParse<T>(data: string | null): T | null {
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (err) {
      console.error("[RedisCache] JSON parse failed:", err);
      return null;
    }
  }

  private safeStringify(data: unknown) {
    try {
      return JSON.stringify(data);
    } catch (err) {
      console.error("[RedisCache] JSON stringify failed:", err);
      return null;
    }
  }

  // ---------- Core Methods ----------

  async get<T>(key: string): Promise<T | null> {
    const finalKey = this.buildKey(key);

    try {
      const result = await this.client.get(finalKey);
      return this.safeParse<T>(result);
    } catch (error) {
      console.error("[RedisCache] GET failed:", {
        key: finalKey,
        error,
      });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const finalKey = this.buildKey(key);
    const serialized = this.safeStringify(value);

    if (!serialized) return;

    try {
      const expire = ttl ?? this.defaultTTL;

      if (expire > 0) {
        await this.client.set(finalKey, serialized, "EX", expire);
      } else {
        await this.client.set(finalKey, serialized);
      }
    } catch (error) {
      console.error("[RedisCache] SET failed:", {
        key: finalKey,
        ttl,
        error,
      });
    }
  }

  async delete(key: string): Promise<void> {
    const finalKey = this.buildKey(key);

    try {
      await this.client.del(finalKey);
    } catch (error) {
      console.error("[RedisCache] DELETE failed:", {
        key: finalKey,
        error,
      });
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.keyPrefix) {
        // safer: delete only prefixed keys
        const stream = this.client.scanStream({
          match: `${this.keyPrefix}:*`,
          count: 100,
        });

        stream.on("data", async (keys: string[]) => {
          if (keys.length) {
            await this.client.del(...keys);
          }
        });
      } else {
        // dangerous in shared redis — use carefully
        await this.client.flushdb();
      }
    } catch (error) {
      console.error("[RedisCache] CLEAR failed:", error);
    }
  }
}
