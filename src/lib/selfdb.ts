import { SelfDB } from '@selfdb/js-sdk';

// VITE_SELFDB_URL from .env is the single source of truth - no fallbacks
const baseUrl = import.meta.env.VITE_SELFDB_URL;
const apiKey = import.meta.env.VITE_SELFDB_KEY || '';

if (!baseUrl) {
  throw new Error('VITE_SELFDB_URL is not set. Please configure it in your .env file.');
}

console.log('SelfDB Config:', { baseUrl, hasApiKey: !!apiKey });

export const selfdb = new SelfDB({
  baseUrl,
  apiKey,
});

export const TABLES = {
  MEDIA: 'media',
  WATCH_PROGRESS: 'watch_progress',
  PLAYBACK_STATE: 'playback_state',
  FAVORITES: 'favorites',
};

export const BUCKETS = {
  MEDIA: 'media-files',
  COVERS: 'covers',
};

const tableIdCache: Record<string, string> = {};
const bucketIdCache: Record<string, string> = {};

// Helper to extract data from response (API may wrap in { data: [...] })
function extractData<T>(response: unknown): T {
  const resp = response as { data?: T } & T;
  return (resp.data ?? response) as T;
}

// Load all table IDs at once for efficiency
export async function loadTableIds(): Promise<void> {
  const response = await selfdb.tables.list({ limit: 100 });
  const tables = extractData<Array<{ id: string; name: string }>>(response);
  console.log('Loaded tables:', tables.map(t => ({ id: t.id, name: t.name })));
  for (const table of tables) {
    tableIdCache[table.name] = table.id;
  }
}

export async function getTableId(tableName: string): Promise<string> {
  // Return from cache if available
  if (tableIdCache[tableName]) return tableIdCache[tableName];
  
  // Try loading all tables first
  await loadTableIds();
  
  if (tableIdCache[tableName]) return tableIdCache[tableName];
  
  throw new Error(`Table "${tableName}" not found. Available: ${Object.keys(tableIdCache).join(', ') || 'none'}`);
}

export async function getBucketId(bucketName: string): Promise<string> {
  if (bucketIdCache[bucketName]) return bucketIdCache[bucketName];
  
  const response = await selfdb.storage.buckets.list({ limit: 100 });
  const buckets = extractData<Array<{ id: string; name: string }>>(response);
  console.log('Loaded buckets:', buckets.map(b => ({ id: b.id, name: b.name })));
  
  for (const bucket of buckets) {
    bucketIdCache[bucket.name] = bucket.id;
  }
  
  if (bucketIdCache[bucketName]) return bucketIdCache[bucketName];
  
  throw new Error(`Bucket "${bucketName}" not found. Available: ${Object.keys(bucketIdCache).join(', ') || 'none'}`);
}



