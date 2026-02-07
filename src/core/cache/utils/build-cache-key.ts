import crypto from "crypto";

type BuildCacheKeyInput =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | unknown[];

function hashValue(value: unknown): string {
  const str = typeof value === "string" ? value : JSON.stringify(value);

  return crypto.createHash("sha256").update(str).digest("hex").slice(0, 16);
}

export function buildCacheKey(
  base: string,
  ...parts: BuildCacheKeyInput[]
): string {
  const normalizedParts = parts.map((part) => {
    if (typeof part === "object" && part !== null) {
      return hashValue(part);
    }
    return String(part);
  });

  return [base, ...normalizedParts].join(":");
}
