/**
 * StreamX Playback Store
 * Manages queue, playback state, and localStorage persistence
 */

export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  type: 'audio' | 'video';
  cover: string | null;
  url: string;
  duration: number;
}

export interface PlaybackState {
  currentTrack: MediaItem | null;
  currentTrackId: string | null;
  positionSeconds: number;
  queue: MediaItem[];
  queueIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  volume: number;
  isPlaying: boolean;
}

export interface WatchProgress {
  mediaId: string;
  positionSeconds: number;
  completed: boolean;
  updatedAt: number;
}

const STORAGE_KEYS = {
  PLAYBACK_STATE: 'streamx_playback_state',
  WATCH_PROGRESS: 'streamx_watch_progress',
  QUEUE: 'streamx_queue',
};

// Default state
const defaultState: PlaybackState = {
  currentTrack: null,
  currentTrackId: null,
  positionSeconds: 0,
  queue: [],
  queueIndex: -1,
  shuffle: false,
  repeat: 'off',
  volume: 0.7,
  isPlaying: false,
};

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

class PlaybackStore {
  private state: PlaybackState;
  private listeners: Set<(state: PlaybackState) => void>;
  private originalQueue: MediaItem[]; // For un-shuffling
  private watchProgress: Map<string, WatchProgress>;

  constructor() {
    this.listeners = new Set();
    this.watchProgress = new Map();
    this.originalQueue = [];
    this.state = this.loadState();
    this.loadWatchProgress();
  }

  // Load state from localStorage
  private loadState(): PlaybackState {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYBACK_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed, isPlaying: false };
      }
    } catch (e) {
      console.warn('Failed to load playback state:', e);
    }
    return { ...defaultState };
  }

  // Save state to localStorage
  private saveState(): void {
    try {
      const toSave = {
        currentTrackId: this.state.currentTrackId,
        positionSeconds: this.state.positionSeconds,
        queue: this.state.queue,
        queueIndex: this.state.queueIndex,
        shuffle: this.state.shuffle,
        repeat: this.state.repeat,
        volume: this.state.volume,
        currentTrack: this.state.currentTrack,
      };
      localStorage.setItem(STORAGE_KEYS.PLAYBACK_STATE, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save playback state:', e);
    }
  }

  // Load watch progress from localStorage
  private loadWatchProgress(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.watchProgress = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.warn('Failed to load watch progress:', e);
    }
  }

  // Save watch progress to localStorage
  private saveWatchProgress(): void {
    try {
      const toSave = Object.fromEntries(this.watchProgress);
      localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save watch progress:', e);
    }
  }

  // Notify all listeners of state change
  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Subscribe to state changes
  subscribe(listener: (state: PlaybackState) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): PlaybackState {
    return { ...this.state };
  }

  // Play a specific track (also sets up queue if items provided)
  play(track: MediaItem, allItems?: MediaItem[]): void {
    if (allItems && allItems.length > 0) {
      this.originalQueue = [...allItems];
      const index = allItems.findIndex((item) => item.id === track.id);
      
      if (this.state.shuffle) {
        // Shuffle but keep current track at beginning
        const rest = allItems.filter((item) => item.id !== track.id);
        this.state.queue = [track, ...shuffleArray(rest)];
        this.state.queueIndex = 0;
      } else {
        this.state.queue = allItems;
        this.state.queueIndex = index >= 0 ? index : 0;
      }
    } else if (this.state.queue.length === 0) {
      // No queue, just play this single track
      this.state.queue = [track];
      this.state.queueIndex = 0;
      this.originalQueue = [track];
    } else {
      // Find in existing queue
      const index = this.state.queue.findIndex((item) => item.id === track.id);
      if (index >= 0) {
        this.state.queueIndex = index;
      } else {
        // Add to queue and play
        this.state.queue.push(track);
        this.state.queueIndex = this.state.queue.length - 1;
        this.originalQueue.push(track);
      }
    }

    this.state.currentTrack = track;
    this.state.currentTrackId = track.id;
    this.state.positionSeconds = 0;
    this.state.isPlaying = true;
    
    this.saveState();
    this.notify();
  }

  // Pause playback
  pause(): void {
    this.state.isPlaying = false;
    this.saveState();
    this.notify();
  }

  // Resume playback
  resume(): void {
    if (this.state.currentTrack) {
      this.state.isPlaying = true;
      this.notify();
    }
  }

  // Toggle play/pause
  togglePlayPause(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  // Skip to next track
  next(): MediaItem | null {
    if (this.state.queue.length === 0) return null;

    let nextIndex: number;

    if (this.state.repeat === 'one') {
      // Replay current
      nextIndex = this.state.queueIndex;
    } else if (this.state.queueIndex < this.state.queue.length - 1) {
      // Go to next
      nextIndex = this.state.queueIndex + 1;
    } else if (this.state.repeat === 'all') {
      // Loop back to start
      nextIndex = 0;
    } else {
      // End of queue
      this.state.isPlaying = false;
      this.notify();
      return null;
    }

    this.state.queueIndex = nextIndex;
    this.state.currentTrack = this.state.queue[nextIndex];
    this.state.currentTrackId = this.state.currentTrack.id;
    this.state.positionSeconds = 0;
    this.state.isPlaying = true;
    
    this.saveState();
    this.notify();
    
    return this.state.currentTrack;
  }

  // Skip to previous track
  previous(): MediaItem | null {
    if (this.state.queue.length === 0) return null;

    // If more than 3 seconds in, restart current track
    if (this.state.positionSeconds > 3) {
      this.state.positionSeconds = 0;
      this.saveState();
      this.notify();
      return this.state.currentTrack;
    }

    let prevIndex: number;

    if (this.state.queueIndex > 0) {
      prevIndex = this.state.queueIndex - 1;
    } else if (this.state.repeat === 'all') {
      prevIndex = this.state.queue.length - 1;
    } else {
      // Already at start
      this.state.positionSeconds = 0;
      this.saveState();
      this.notify();
      return this.state.currentTrack;
    }

    this.state.queueIndex = prevIndex;
    this.state.currentTrack = this.state.queue[prevIndex];
    this.state.currentTrackId = this.state.currentTrack.id;
    this.state.positionSeconds = 0;
    this.state.isPlaying = true;
    
    this.saveState();
    this.notify();
    
    return this.state.currentTrack;
  }

  // Toggle shuffle
  toggleShuffle(): void {
    this.state.shuffle = !this.state.shuffle;

    if (this.state.shuffle) {
      // Shuffle queue, keeping current track at current position
      const currentTrack = this.state.currentTrack;
      const beforeCurrent = this.state.queue.slice(0, this.state.queueIndex);
      const afterCurrent = this.state.queue.slice(this.state.queueIndex + 1);
      const shuffledRest = shuffleArray([...beforeCurrent, ...afterCurrent]);
      
      if (currentTrack) {
        this.state.queue = [currentTrack, ...shuffledRest];
        this.state.queueIndex = 0;
      }
    } else {
      // Restore original order
      if (this.originalQueue.length > 0 && this.state.currentTrack) {
        const currentIndex = this.originalQueue.findIndex(
          (item) => item.id === this.state.currentTrack?.id
        );
        this.state.queue = [...this.originalQueue];
        this.state.queueIndex = currentIndex >= 0 ? currentIndex : 0;
      }
    }

    this.saveState();
    this.notify();
  }

  // Cycle repeat mode
  cycleRepeat(): void {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(this.state.repeat);
    this.state.repeat = modes[(currentIndex + 1) % modes.length];
    
    this.saveState();
    this.notify();
  }

  // Set volume
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume));
    this.saveState();
    this.notify();
  }

  // Update playback position
  updatePosition(seconds: number): void {
    this.state.positionSeconds = seconds;
    // Don't save on every update to avoid performance issues
    // Save periodically instead
  }

  // Save position (call this periodically)
  savePosition(): void {
    this.saveState();
  }

  // Seek to position
  seek(seconds: number): void {
    this.state.positionSeconds = seconds;
    this.saveState();
    this.notify();
  }

  // Add to queue
  addToQueue(item: MediaItem): void {
    this.state.queue.push(item);
    this.originalQueue.push(item);
    this.saveState();
    this.notify();
  }

  // Play next (insert after current)
  playNext(item: MediaItem): void {
    const insertIndex = this.state.queueIndex + 1;
    this.state.queue.splice(insertIndex, 0, item);
    this.originalQueue.splice(insertIndex, 0, item);
    this.saveState();
    this.notify();
  }

  // Remove from queue
  removeFromQueue(index: number): void {
    if (index >= 0 && index < this.state.queue.length) {
      this.state.queue.splice(index, 1);
      
      // Adjust current index if needed
      if (index < this.state.queueIndex) {
        this.state.queueIndex--;
      } else if (index === this.state.queueIndex) {
        // Removed current track
        if (this.state.queue.length > 0) {
          this.state.queueIndex = Math.min(this.state.queueIndex, this.state.queue.length - 1);
          this.state.currentTrack = this.state.queue[this.state.queueIndex];
          this.state.currentTrackId = this.state.currentTrack.id;
        } else {
          this.state.currentTrack = null;
          this.state.currentTrackId = null;
          this.state.queueIndex = -1;
        }
      }
      
      this.saveState();
      this.notify();
    }
  }

  // Clear queue
  clearQueue(): void {
    this.state.queue = [];
    this.originalQueue = [];
    this.state.queueIndex = -1;
    this.state.currentTrack = null;
    this.state.currentTrackId = null;
    this.state.isPlaying = false;
    this.state.positionSeconds = 0;
    
    this.saveState();
    this.notify();
  }

  // Update watch progress for video
  updateWatchProgress(mediaId: string, positionSeconds: number, duration: number): void {
    const completed = duration > 0 && positionSeconds / duration >= 0.95;
    
    this.watchProgress.set(mediaId, {
      mediaId,
      positionSeconds: completed ? 0 : positionSeconds,
      completed,
      updatedAt: Date.now(),
    });
    
    this.saveWatchProgress();
  }

  // Get watch progress for a video
  getWatchProgress(mediaId: string): WatchProgress | undefined {
    return this.watchProgress.get(mediaId);
  }

  // Get all videos with progress (for "Continue Watching")
  getContinueWatching(): WatchProgress[] {
    return Array.from(this.watchProgress.values())
      .filter((p) => !p.completed && p.positionSeconds > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // Clear watch progress for a video
  clearWatchProgress(mediaId: string): void {
    this.watchProgress.delete(mediaId);
    this.saveWatchProgress();
  }

  // Close/stop playback
  close(): void {
    this.state.isPlaying = false;
    this.state.currentTrack = null;
    this.state.currentTrackId = null;
    this.saveState();
    this.notify();
  }
}

// Singleton instance
export const playbackStore = new PlaybackStore();
