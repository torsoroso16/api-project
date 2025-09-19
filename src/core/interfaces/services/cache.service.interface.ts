export interface CacheServiceInterface {
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  setex(key: string, seconds: number, value: string): Promise<void>;
}