type CacheKeyOptions = {
  prefix?: string;
  parts?: (string | number | boolean | null | undefined)[];
};

const DEFAULT_PREFIX = process.env.CACHE_PREFIX || "app";

function sanitize(value: unknown): string {
  if (value === null || value === undefined) return "null";
  return String(value).replace(/\s+/g, "_");
}

export function buildNamespacedKey(
  base: string,
  options?: CacheKeyOptions,
): string {
  const prefix = options?.prefix || DEFAULT_PREFIX;

  const parts = options?.parts
    ?.filter((p) => p !== undefined)
    .map((p) => sanitize(p));

  return [prefix, base, ...(parts || [])].join(":");
}

export const cacheKeys = {
  user: (id: string) => buildNamespacedKey("user", { parts: [id] }),

  booking: (id: string) => buildNamespacedKey("booking", { parts: [id] }),

  trustedDevice: (userId: string, deviceId: string) =>
    buildNamespacedKey("trusted_device", {
      parts: [userId, deviceId],
    }),
};
