export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export type CacheOptions = {
  ttl?: number;
  prefix?: string;
};

export type CacheServiceOptions = {
  defaultTTL?: number;
};
