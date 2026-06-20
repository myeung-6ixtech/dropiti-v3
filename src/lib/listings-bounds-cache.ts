import type { Property } from '@/types';

type CacheEntry = {
  properties: Property[];
  fetchedAt: number;
};

const MAX_ENTRIES = 48;
const TTL_MS = 60_000;

/** In-memory LRU cache for map viewport listing fetches. */
class ListingsBoundsCache {
  private store = new Map<string, CacheEntry>();

  get(key: string): Property[] | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > TTL_MS) {
      this.store.delete(key);
      return null;
    }
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.properties;
  }

  set(key: string, properties: Property[]): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    }
    this.store.set(key, { properties, fetchedAt: Date.now() });
    while (this.store.size > MAX_ENTRIES) {
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const listingsBoundsCache = new ListingsBoundsCache();
