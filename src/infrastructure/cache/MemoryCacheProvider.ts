interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCacheProvider {
  private readonly store = new Map<string, Entry<unknown>>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs = 60_000) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async del(key: string) {
    this.store.delete(key);
  }
}

export const cache = new MemoryCacheProvider();
