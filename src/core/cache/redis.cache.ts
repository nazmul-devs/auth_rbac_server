import Redis from "ioredis";
import { config } from "../config/env.config";
import { throwValidation } from "../errors/errors";
import { logger } from "../utils/logger";

// Create Redis client
const redis = new Redis(config.redis.url, {
  retryStrategy: (times: number) => Math.min(times * 50, 2000), // retry delay up to 2s
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      return true;
    }
    return false;
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("[Redis] ✅ Connected successfully");
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err);
});

redis.on("close", () => {
  console.warn("[Redis] Connection closed");
});

// Utility wrapper
class RedisCache {
  private readonly defaultTTL = 3600; // 1 hour
  private readonly maxValueSize = 1024 * 1024; // 1MB

  /**
   * Set with enhanced error handling and metrics
   */
  async set<T = any>(
    key: string,
    value: T,
    options: {
      ttl?: number;
      namespace?: string;
      onlyIfNew?: boolean;
    } = {}
  ): Promise<boolean> {
    // const start = performance.now();
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;

    try {
      const serialized = this.serialize(value);

      this.validateSize(serialized);

      const result = await (options.onlyIfNew
        ? redis.set(fullKey, serialized, "EX", options.ttl ?? this.defaultTTL)
        : options.ttl
        ? redis.set(fullKey, serialized, "EX", options.ttl)
        : redis.set(fullKey, serialized));

      return result === "OK";
    } catch (error) {
      this.handleError("set", error, { key: fullKey });
      return false;
    }
  }

  /**
   * Get with automatic deserialization and cache-hit metrics
   */
  async get<T = any>(
    key: string,
    options: { namespace?: string } = {}
  ): Promise<T | null> {
    // const start = performance.now();
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;

    try {
      const data = await redis.get(fullKey);

      if (data === null) {
        return null;
      }

      return this.deserialize<T>(data);
    } catch (error) {
      this.handleError("get", error, { key: fullKey });
      return null;
    }
  }

  /**
   * Delete with pattern matching support
   */
  async delete(
    pattern: string,
    options: { namespace?: string } = {}
  ): Promise<number> {
    const fullPattern = options.namespace
      ? `${options.namespace}:${pattern}`
      : pattern;

    try {
      // Handle both exact keys and patterns
      const keys = await redis.keys(fullPattern);
      if (keys.length === 0) return 0;

      const count = await redis.del(keys);

      return count;
    } catch (error) {
      this.handleError("delete", error, { pattern: fullPattern });
      return 0;
    }
  }
  async del(
    pattern: string,
    options: { namespace?: string } = {}
  ): Promise<number> {
    const fullPattern = options.namespace
      ? `${options.namespace}:${pattern}`
      : pattern;

    try {
      // Handle both exact keys and patterns
      const keys = await redis.keys(fullPattern);
      if (keys.length === 0) return 0;

      const count = await redis.del(keys);

      return count;
    } catch (error) {
      this.handleError("delete", error, { pattern: fullPattern });
      return 0;
    }
  }
  async delByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.getAllKeys(pattern);
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      this.handleError("deleteByPattern", error, { pattern });
      return 0;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async getKeys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      this.handleError("keys", error, { pattern });
      return [];
    }
  }

  /**
   * Atomic increment with TTL refresh
   */
  async increment(
    key: string,
    options: {
      by?: number;
      ttl?: number;
      namespace?: string;
    } = {}
  ): Promise<number | null> {
    const fullKey = options.namespace ? `${options.namespace}:${key}` : key;

    try {
      const result = await redis.incrby(fullKey, options.by ?? 1);

      // Refresh TTL on increment
      if (options.ttl) {
        await redis.expire(fullKey, options.ttl);
      }

      return result;
    } catch (error) {
      this.handleError("increment", error, { key: fullKey });
      return null;
    }
  }

  /**
   * Health check for BaseService integration
   */
  async healthCheck() {
    try {
      const start = performance.now();
      await redis.ping();
      return {
        healthy: true,
        latency: performance.now() - start,
      };
    } catch (error) {
      return {
        healthy: false,
        error: this.isRedisError(error) ? error.message : "Unknown error",
      };
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error("Error disconnecting from Redis:", error);
      this.client.disconnect();
      throw error;
    }
  }

  // --- Utility Methods ---
  private serialize<T>(value: T): string {
    return typeof value === "string" ? value : JSON.stringify(value);
  }

  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  private validateSize(serialized: string): void {
    if (serialized.length > this.maxValueSize) {
      return throwValidation(
        `Value exceeds maximum size of ${this.maxValueSize} bytes`
      );
    }
  }

  private handleError(
    operation: string,
    error: unknown,
    context: Record<string, any> = {}
  ) {
    const errorMessage = this.isRedisError(error)
      ? `Redis ${operation} failed: ${error.message}`
      : `Unexpected error during ${operation}`;

    logger.error(errorMessage, {
      operation,
      ...context,
      error,
    });
  }

  isRedisError(error: unknown): error is Error & { code?: string } {
    return error instanceof Error && error.message.includes("Redis");
  }

  // Expose raw client for advanced use cases
  getClient(): Redis {
    return redis;
  }

  get client() {
    return redis;
  }

  async flush(namespace?: string): Promise<boolean> {
    try {
      if (namespace) {
        // Only remove keys under this namespace
        const pattern = `${namespace}:*`;
        const keys = await redis.keys(pattern);

        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Flush all keys (careful!)
        await redis.flushdb();
      }

      return true;
    } catch (error) {
      this.handleError("flush", error, { namespace });
      return false;
    }
  }

  async getAllKeys(namespace?: string): Promise<string[]> {
    try {
      const pattern = namespace ? `${namespace}:*` : "*";
      const keys = await redis.keys(pattern);
      return keys;
    } catch (error) {
      this.handleError("getAllKeys", error, { namespace });
      return [];
    }
  }
}

export default RedisCache;
