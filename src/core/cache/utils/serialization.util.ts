export function safeStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("[Cache Serialization] stringify failed", error);
    return null;
  }
}

export function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("[Cache Serialization] parse failed", error);
    return null;
  }
}

/**
 * Optional: Buffer serialization (future Redis optimization)
 */
export function serializeToBuffer(value: unknown): Buffer | null {
  const str = safeStringify(value);
  return str ? Buffer.from(str) : null;
}

export function deserializeFromBuffer<T>(buffer: Buffer | null): T | null {
  if (!buffer) return null;
  return safeParse<T>(buffer.toString());
}
