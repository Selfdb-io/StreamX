import { selfdb, TABLES, getTableId } from './selfdb';
import { generateUUID } from './uuid';

// Local cache of favorite media IDs for quick lookups
let favoritesCache: Map<string, string> = new Map(); // mediaId -> rowId
let cacheLoaded = false;

// Load all favorites from database
export async function loadFavorites(): Promise<Set<string>> {
  try {
    const tableId = await getTableId(TABLES.FAVORITES);
    const response = await selfdb.tables.data
      .query(tableId)
      .pageSize(1000)
      .execute();
    
    const favorites = (response?.data || []) as Array<{ id: string; media_id: string }>;
    favoritesCache = new Map(favorites.map(f => [f.media_id, f.id]));
    cacheLoaded = true;
    return new Set(favoritesCache.keys());
  } catch (error) {
    console.error('Failed to load favorites:', error);
    // Fall back to localStorage if DB fails
    const stored = localStorage.getItem('streamx_favorites');
    if (stored) {
      const ids = JSON.parse(stored) as string[];
      favoritesCache = new Map(ids.map(id => [id, '']));
    }
    cacheLoaded = true;
    return new Set(favoritesCache.keys());
  }
}

// Check if a media item is favorited
export function isFavorite(mediaId: string): boolean {
  return favoritesCache.has(mediaId);
}

// Get all favorite IDs (for filtering)
export function getFavoriteIds(): string[] {
  return Array.from(favoritesCache.keys());
}

// Add a media item to favorites
export async function addFavorite(mediaId: string): Promise<boolean> {
  try {
    const tableId = await getTableId(TABLES.FAVORITES);
    const rowId = generateUUID();
    await selfdb.tables.data.insert(tableId, {
      id: rowId,
      media_id: mediaId,
    });
    favoritesCache.set(mediaId, rowId);
    // Also persist to localStorage as backup
    localStorage.setItem('streamx_favorites', JSON.stringify(getFavoriteIds()));
    return true;
  } catch (error: any) {
    // Handle duplicate (already favorited)
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return true;
    }
    console.error('Failed to add favorite:', error);
    // Fallback to localStorage only
    favoritesCache.set(mediaId, '');
    localStorage.setItem('streamx_favorites', JSON.stringify(getFavoriteIds()));
    return false;
  }
}

// Remove a media item from favorites
export async function removeFavorite(mediaId: string): Promise<boolean> {
  try {
    const tableId = await getTableId(TABLES.FAVORITES);
    const rowId = favoritesCache.get(mediaId);
    
    if (rowId) {
      await selfdb.tables.data.deleteRow(tableId, rowId);
    }
    
    favoritesCache.delete(mediaId);
    localStorage.setItem('streamx_favorites', JSON.stringify(getFavoriteIds()));
    return true;
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    // Fallback to localStorage only
    favoritesCache.delete(mediaId);
    localStorage.setItem('streamx_favorites', JSON.stringify(getFavoriteIds()));
    return false;
  }
}

// Toggle favorite status
export async function toggleFavorite(mediaId: string): Promise<boolean> {
  if (isFavorite(mediaId)) {
    await removeFavorite(mediaId);
    return false;
  } else {
    await addFavorite(mediaId);
    return true;
  }
}

// Ensure cache is loaded
export async function ensureFavoritesLoaded(): Promise<void> {
  if (!cacheLoaded) {
    await loadFavorites();
  }
}
