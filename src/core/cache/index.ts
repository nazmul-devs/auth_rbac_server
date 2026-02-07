import Redis from "ioredis";

import { CacheService } from "./cache.service";
import { MemoryProvider } from "./providers/memory.cache";
import { MultiCacheProvider } from "./providers/multi.cache";
import { RedisCacheProvider } from "./providers/redis.cache";

// ---------- Redis Client ----------

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

// ---------- L1 Memory Cache ----------

const memoryProvider = new MemoryProvider({
  ttl: Number(process.env.CACHE_L1_TTL || 30),
  maxItems: 10000,
  prefix: process.env.CACHE_PREFIX || "app",
});

// ---------- L2 Redis Cache ----------

const redisProvider = new RedisCacheProvider(redisClient, {
  ttl: Number(process.env.CACHE_L2_TTL || 120),
  prefix: process.env.CACHE_PREFIX || "app",
});

// ---------- Multi Cache ----------

const multiCache = new MultiCacheProvider(memoryProvider, redisProvider, {
  l1TTL: Number(process.env.CACHE_L1_TTL || 30),
  l2TTL: Number(process.env.CACHE_L2_TTL || 120),
});

// ---------- Cache Service ----------

export const cacheService = new CacheService(multiCache, {
  defaultTTL: Number(process.env.CACHE_DEFAULT_TTL || 60),
});

// ---------- Export Raw Providers (Optional) ----------

export const cacheProviders = {
  memoryProvider,
  redisProvider,
  multiCache,
  redisClient,
};
