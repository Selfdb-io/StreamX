/**
 * Media Cache Service
 * Caches audio/video files in IndexedDB for offline playback
 * and faster loading of previously played tracks
 */

const DB_NAME = 'streamx-media-cache';
const DB_VERSION = 2; // Bump version for ArrayBuffer migration
const STORE_NAME = 'media';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB max cache size

interface CachedMedia {
  id: string;
  url: string;
  data: ArrayBuffer; // Store as ArrayBuffer for better compatibility
  mimeType: string;
  size: number;
  cachedAt: number;
  lastAccessed: number;
}

class MediaCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        console.warn('[MediaCache] IndexedDB not supported');
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[MediaCache] Failed to open database:', request.error);
        resolve(); // Don't reject - cache is optional
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[MediaCache] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          console.log('[MediaCache] Object store created');
        }
      };
    });
  }

  private async ensureReady(): Promise<boolean> {
    await this.initPromise;
    return this.db !== null;
  }

  /**
   * Get a cached media file by its ID (usually the media URL path)
   */
  async get(id: string): Promise<{ blob: Blob; mimeType: string } | null> {
    if (!(await this.ensureReady())) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          const result = request.result as CachedMedia | undefined;
          if (result && result.data) {
            // Validate the data
            if (!(result.data instanceof ArrayBuffer) || result.data.byteLength === 0) {
              console.warn('[MediaCache] Invalid cached data, removing:', id);
              store.delete(id);
              resolve(null);
              return;
            }

            // Update last accessed time
            result.lastAccessed = Date.now();
            store.put(result);
            
            // Convert ArrayBuffer back to Blob
            const blob = new Blob([result.data], { type: result.mimeType });
            console.log('[MediaCache] Cache hit:', id, `(${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
            resolve({ blob, mimeType: result.mimeType });
          } else {
            console.log('[MediaCache] Cache miss:', id);
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error('[MediaCache] Error getting cached media:', request.error);
          resolve(null);
        };
      } catch (err) {
        console.error('[MediaCache] Transaction error:', err);
        resolve(null);
      }
    });
  }

  /**
   * Cache a media file
   */
  async set(id: string, url: string, blob: Blob, mimeType: string): Promise<void> {
    if (!(await this.ensureReady())) return;

    // Check if we need to evict old entries
    await this.evictIfNeeded(blob.size);

    // Convert Blob to ArrayBuffer for reliable storage
    const arrayBuffer = await blob.arrayBuffer();

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const entry: CachedMedia = {
          id,
          url,
          data: arrayBuffer,
          mimeType,
          size: blob.size,
          cachedAt: Date.now(),
          lastAccessed: Date.now()
        };

        const request = store.put(entry);

        request.onsuccess = () => {
          console.log('[MediaCache] Cached:', id, `(${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
          resolve();
        };

        request.onerror = () => {
          console.error('[MediaCache] Error caching media:', request.error);
          resolve();
        };
      } catch (err) {
        console.error('[MediaCache] Failed to cache:', err);
        resolve();
      }
    });
  }

  /**
   * Check if a media file is cached
   */
  async has(id: string): Promise<boolean> {
    if (!(await this.ensureReady())) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(IDBKeyRange.only(id));

      request.onsuccess = () => {
        resolve(request.result > 0);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  }

  /**
   * Get total cache size
   */
  async getCacheSize(): Promise<number> {
    if (!(await this.ensureReady())) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      
      let totalSize = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          totalSize += (cursor.value as CachedMedia).size;
          cursor.continue();
        } else {
          resolve(totalSize);
        }
      };

      request.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * Evict oldest entries if cache is too large
   */
  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    const currentSize = await this.getCacheSize();
    
    if (currentSize + newEntrySize <= MAX_CACHE_SIZE) {
      return;
    }

    console.log('[MediaCache] Cache full, evicting old entries...');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('lastAccessed');
      const request = index.openCursor();

      let freedSize = 0;
      const targetFreeSize = newEntrySize + (MAX_CACHE_SIZE * 0.1); // Free 10% extra

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && freedSize < targetFreeSize) {
          const entry = cursor.value as CachedMedia;
          freedSize += entry.size;
          console.log('[MediaCache] Evicting:', entry.id);
          cursor.delete();
          cursor.continue();
        } else {
          console.log('[MediaCache] Evicted', (freedSize / 1024 / 1024).toFixed(2), 'MB');
          resolve();
        }
      };

      request.onerror = () => {
        resolve();
      };
    });
  }

  /**
   * Clear all cached media
   */
  async clear(): Promise<void> {
    if (!(await this.ensureReady())) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[MediaCache] Cache cleared');
        resolve();
      };

      request.onerror = () => {
        resolve();
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ count: number; size: number; maxSize: number }> {
    if (!(await this.ensureReady())) {
      return { count: 0, size: 0, maxSize: MAX_CACHE_SIZE };
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();
      
      let count = 0;
      let size = 0;

      countRequest.onsuccess = () => {
        count = countRequest.result;
      };

      const cursorRequest = store.openCursor();
      
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          size += (cursor.value as CachedMedia).size;
          cursor.continue();
        } else {
          resolve({ count, size, maxSize: MAX_CACHE_SIZE });
        }
      };

      cursorRequest.onerror = () => {
        resolve({ count: 0, size: 0, maxSize: MAX_CACHE_SIZE });
      };
    });
  }
}

// Singleton instance
export const mediaCache = new MediaCacheService();
