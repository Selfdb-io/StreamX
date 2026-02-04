/**
 * StreamX usePlayback Hook
 * React hook for accessing and controlling playback state
 */

import { useState, useEffect, useCallback } from 'react';
import { playbackStore } from '../lib/playbackStore';
import type { PlaybackState, MediaItem } from '../lib/playbackStore';

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>(playbackStore.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = playbackStore.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Play a track
  const play = useCallback((track: MediaItem, allItems?: MediaItem[]) => {
    playbackStore.play(track, allItems);
  }, []);

  // Pause
  const pause = useCallback(() => {
    playbackStore.pause();
  }, []);

  // Resume
  const resume = useCallback(() => {
    playbackStore.resume();
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    playbackStore.togglePlayPause();
  }, []);

  // Next track
  const next = useCallback(() => {
    return playbackStore.next();
  }, []);

  // Previous track
  const previous = useCallback(() => {
    return playbackStore.previous();
  }, []);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    playbackStore.toggleShuffle();
  }, []);

  // Cycle repeat
  const cycleRepeat = useCallback(() => {
    playbackStore.cycleRepeat();
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    playbackStore.setVolume(volume);
  }, []);

  // Update position
  const updatePosition = useCallback((seconds: number) => {
    playbackStore.updatePosition(seconds);
  }, []);

  // Seek
  const seek = useCallback((seconds: number) => {
    playbackStore.seek(seconds);
  }, []);

  // Save position
  const savePosition = useCallback(() => {
    playbackStore.savePosition();
  }, []);

  // Add to queue
  const addToQueue = useCallback((item: MediaItem) => {
    playbackStore.addToQueue(item);
  }, []);

  // Play next
  const playNext = useCallback((item: MediaItem) => {
    playbackStore.playNext(item);
  }, []);

  // Remove from queue
  const removeFromQueue = useCallback((index: number) => {
    playbackStore.removeFromQueue(index);
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    playbackStore.clearQueue();
  }, []);

  // Close player
  const close = useCallback(() => {
    playbackStore.close();
  }, []);

  // Watch progress
  const updateWatchProgress = useCallback((mediaId: string, position: number, duration: number) => {
    playbackStore.updateWatchProgress(mediaId, position, duration);
  }, []);

  const getWatchProgress = useCallback((mediaId: string) => {
    return playbackStore.getWatchProgress(mediaId);
  }, []);

  const getContinueWatching = useCallback(() => {
    return playbackStore.getContinueWatching();
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    play,
    pause,
    resume,
    togglePlayPause,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    updatePosition,
    seek,
    savePosition,
    addToQueue,
    playNext,
    removeFromQueue,
    clearQueue,
    close,
    
    // Watch progress
    updateWatchProgress,
    getWatchProgress,
    getContinueWatching,
  };
}

/**
 * Custom hook for Media Session API integration
 * Provides lock screen, CarPlay, and notification controls
 */
export function useMediaSession(
  currentTrack: MediaItem | null,
  isPlaying: boolean,
  onPlay: () => void,
  onPause: () => void,
  onNext: () => void,
  onPrevious: () => void,
  onSeek?: (time: number) => void
) {
  const hasMediaSession = 'mediaSession' in navigator;

  useEffect(() => {
    if (!hasMediaSession || !currentTrack) return;

    // Update metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: 'StreamX Library',
      artwork: currentTrack.cover ? [
        { src: currentTrack.cover, sizes: '96x96', type: 'image/jpeg' },
        { src: currentTrack.cover, sizes: '128x128', type: 'image/jpeg' },
        { src: currentTrack.cover, sizes: '192x192', type: 'image/jpeg' },
        { src: currentTrack.cover, sizes: '256x256', type: 'image/jpeg' },
        { src: currentTrack.cover, sizes: '384x384', type: 'image/jpeg' },
        { src: currentTrack.cover, sizes: '512x512', type: 'image/jpeg' },
      ] : [],
    });

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [currentTrack, isPlaying, hasMediaSession]);

  useEffect(() => {
    if (!hasMediaSession) return;

    // Set up action handlers
    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);
    
    // Seek to specific time (used by CarPlay scrubber)
    if (onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          onSeek(details.seekTime);
        }
      });
    }

    // Stop handler (some car systems use this)
    navigator.mediaSession.setActionHandler('stop', () => {
      onPause();
    });

    // Cleanup
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [hasMediaSession, onPlay, onPause, onNext, onPrevious, onSeek]);

  // Update position state
  const updatePositionState = useCallback((position: number, duration: number) => {
    if (hasMediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(position, duration),
        });
      } catch (e) {
        // Ignore errors (some browsers don't support this)
      }
    }
  }, [hasMediaSession]);

  return { updatePositionState };
}
