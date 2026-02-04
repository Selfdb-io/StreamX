import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Loader2, Music, Heart, ChevronDown, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { selfdb, BUCKETS } from '../lib/selfdb';
import { useMediaSession } from '../hooks/usePlayback';
import { playbackStore } from '../lib/playbackStore';
import { isFavorite, toggleFavorite, ensureFavoritesLoaded } from '../lib/favorites';
import { mediaCache } from '../lib/mediaCache';
import type { MediaItem } from '../lib/playbackStore';

interface AudioPlayerProps {
  item: MediaItem | null;
  allItems: MediaItem[];
  onClose: () => void;
  onTrackChange?: (item: MediaItem) => void;
}

export const AudioPlayer = ({ item, allItems, onTrackChange }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(() => playbackStore.getState().volume);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(() => playbackStore.getState().shuffle);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>(() => playbackStore.getState().repeat);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load favorites and check if current item is liked
  useEffect(() => {
    ensureFavoritesLoaded().then(() => {
      if (item?.id) {
        setIsLiked(isFavorite(item.id));
      }
    });
  }, [item?.id]);

  // Handle like toggle
  const handleLikeToggle = useCallback(async () => {
    if (!item?.id) return;
    const newState = await toggleFavorite(item.id);
    setIsLiked(newState);
  }, [item?.id]);

  // Subscribe to playback store
  useEffect(() => {
    const unsubscribe = playbackStore.subscribe((state) => {
      setShuffle(state.shuffle);
      setRepeat(state.repeat);
      setVolume(state.volume);
    });
    return unsubscribe;
  }, []);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get MIME type from file extension
  const getMimeType = (url: string): string => {
    const ext = url.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'wav': return 'audio/wav';
      case 'ogg': return 'audio/ogg';
      case 'flac': return 'audio/flac';
      case 'm4a': return 'audio/mp4';
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      default: return 'audio/mpeg';
    }
  };

  // Download file from SelfDB with caching
  const downloadAndPlay = useCallback(async (mediaItem: MediaItem) => {
    setIsLoading(true);
    setError(null);

    try {
      let blobUrl: string = '';
      const cacheKey = mediaItem.id || mediaItem.url;

      // For external URLs, use directly
      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        blobUrl = mediaItem.url;
      } else {
        // Try cache first
        try {
          const cached = await mediaCache.get(cacheKey);
          
          if (cached && cached.blob && cached.blob.size > 0) {
            console.log('[AudioPlayer] Using cached audio:', cacheKey, `(${(cached.blob.size / 1024 / 1024).toFixed(2)}MB)`);
            blobUrl = URL.createObjectURL(cached.blob);
          }
        } catch (cacheErr) {
          console.warn('[AudioPlayer] Cache read failed:', cacheErr);
        }
        
        // If no valid cache, download from SelfDB
        if (!blobUrl) {
          console.log('[AudioPlayer] Downloading from SelfDB:', mediaItem.url);
          const fileData = await selfdb.storage.files.download({
            bucketName: BUCKETS.MEDIA,
            path: mediaItem.url
          });

          const mimeType = getMimeType(mediaItem.url);
          const blob = new Blob([fileData], { type: mimeType });
          
          if (blob.size === 0) {
            throw new Error('Downloaded file is empty');
          }
          
          blobUrl = URL.createObjectURL(blob);

          // Cache for future use (don't await - cache in background)
          mediaCache.set(cacheKey, mediaItem.url, blob, mimeType).catch(err => {
            console.warn('[AudioPlayer] Failed to cache:', err);
          });
        }
      }

      setMediaUrl(blobUrl);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to load audio');
      setIsLoading(false);
    }
  }, []);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (mediaUrl && mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  // Load media when item changes
  useEffect(() => {
    if (!item) {
      setMediaUrl('');
      setError(null);
      return;
    }

    playbackStore.play(item, allItems);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    downloadAndPlay(item);
  }, [item, downloadAndPlay]);

  // Auto-play when URL is set
  useEffect(() => {
    if (!mediaUrl || !audioRef.current) return;
    
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
    audioRef.current.play().catch(console.error);
  }, [mediaUrl]);

  // Periodic save
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      playbackStore.savePosition();
    }, 5000);
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      playbackStore.pause();
    } else {
      audioRef.current.play().catch(console.error);
      playbackStore.resume();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    const nextTrack = playbackStore.next();
    if (nextTrack && onTrackChange) {
      onTrackChange(nextTrack);
      // Ensure playback continues
      setIsPlaying(true);
    }
  }, [onTrackChange]);

  const handlePrevious = useCallback(() => {
    const prevTrack = playbackStore.previous();
    if (prevTrack && onTrackChange) {
      onTrackChange(prevTrack);
      // Ensure playback continues
      setIsPlaying(true);
    }
  }, [onTrackChange]);

  const handleShuffle = useCallback(() => playbackStore.toggleShuffle(), []);
  const handleRepeat = useCallback(() => playbackStore.cycleRepeat(), []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    playbackStore.setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  }, [isMuted]);

  const toggleMute = useCallback(() => setIsMuted(!isMuted), [isMuted]);

  // Unified seek handler for both mouse and touch
  const seekToPosition = useCallback((clientX: number, element: HTMLElement) => {
    if (!duration || !audioRef.current) return;
    const rect = element.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent * 100);
    playbackStore.seek(newTime);
  }, [duration]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    seekToPosition(e.clientX, e.currentTarget);
  }, [seekToPosition]);

  // Touch handlers for mobile scrubbing
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    seekToPosition(touch.clientX, e.currentTarget);
  }, [seekToPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    seekToPosition(touch.clientX, e.currentTarget);
  }, [seekToPosition]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const { currentTime: time, duration: dur } = audioRef.current;
    if (dur) {
      setProgress((time / dur) * 100);
      setCurrentTime(time);
      setDuration(dur);
      playbackStore.updatePosition(time);
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (repeat === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else {
      handleNext();
    }
  }, [repeat, handleNext]);

  // Media Session API (for lock screen, CarPlay, and notification controls)
  const { updatePositionState } = useMediaSession(
    item,
    isPlaying,
    () => { audioRef.current?.play(); setIsPlaying(true); playbackStore.resume(); },
    () => { audioRef.current?.pause(); setIsPlaying(false); playbackStore.pause(); },
    handleNext,
    handlePrevious,
    (time) => { 
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
        playbackStore.seek(time);
      }
    }
  );

  useEffect(() => {
    if (duration > 0) updatePositionState(currentTime, duration);
  }, [currentTime, duration, updatePositionState]);

  if (!item) return null;

  return (
    <>
      {/* Hidden audio element */}
      {mediaUrl && (
        <audio 
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={handleEnded}
          onError={() => setError('Failed to play audio')}
        />
      )}

      {/* Expanded Fullscreen Player - Mobile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-gradient-to-b from-surface-muted to-surface md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 safe-area-top-min">
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-2 -ml-2 text-foreground-muted"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <span className="text-xs text-foreground-subtle uppercase tracking-wider font-medium">Now Playing</span>
              <button className="p-2 -mr-2 text-foreground-muted">
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center px-8 py-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-elevated"
              >
                {item.cover ? (
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-lighter flex items-center justify-center">
                    <Music className="w-24 h-24 text-accent" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Track Info */}
            <div className="px-8 mb-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-foreground truncate">{item.title}</h2>
                  <p className="text-sm text-foreground-muted truncate">{item.artist}</p>
                </div>
                <button 
                  onClick={handleLikeToggle}
                  className={`p-3 transition-colors ${isLiked ? 'text-accent' : 'text-foreground-subtle'}`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 mb-4">
              <div 
                onClick={handleSeek}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className="h-8 flex items-center cursor-pointer touch-none"
              >
                <div className="w-full h-1.5 bg-border rounded-full relative">
                  <div 
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-surface rounded-full shadow-card border-2 border-accent"
                    style={{ left: `calc(${progress}% - 10px)` }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-foreground-subtle font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="px-8 mb-8">
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleShuffle}
                  className={`p-3 transition-colors ${shuffle ? 'text-accent' : 'text-foreground-subtle'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={handlePrevious}
                  className="p-3 text-foreground"
                >
                  <SkipBack className="w-8 h-8 fill-current" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  disabled={isLoading || !mediaUrl}
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-accent disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 text-foreground-inverted animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8 text-foreground-inverted fill-current" />
                  ) : (
                    <Play className="w-8 h-8 text-foreground-inverted fill-current ml-1" />
                  )}
                </button>
                
                <button 
                  onClick={handleNext}
                  className="p-3 text-foreground"
                >
                  <SkipForward className="w-8 h-8 fill-current" />
                </button>
                
                <button 
                  onClick={handleRepeat}
                  className={`p-3 transition-colors ${repeat !== 'off' ? 'text-accent' : 'text-foreground-subtle'}`}
                >
                  {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Volume (optional on expanded) */}
            <div className="px-8 pb-12 safe-area-bottom">
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-foreground-subtle">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden relative">
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="h-full bg-foreground-subtle rounded-full"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-card safe-area-bottom"
      >
        {/* Progress bar at very top - Desktop only */}
        <div 
          onClick={handleSeek}
          className="hidden md:block absolute top-0 left-0 right-0 h-1 bg-border cursor-pointer group hover:h-1.5 transition-all"
        >
          <div 
            className="h-full bg-accent relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-card" />
          </div>
        </div>

        {/* Mobile Layout - 3 stacked rows */}
        <div className="flex md:hidden flex-col px-4 pt-3 pb-3 gap-2">
          {/* Row 1: Cover + Track Info */}
          <div 
            className="flex items-center gap-3"
            onClick={() => setIsExpanded(true)}
          >
            {/* Cover */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-muted shadow-soft">
              {item.cover ? (
                <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent-lighter flex items-center justify-center">
                  <Music className="w-5 h-5 text-accent" />
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                </div>
              )}
            </div>
            
            {/* Title & Artist */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">{item.title}</h4>
              <p className="text-xs text-foreground-muted truncate">{item.artist}</p>
            </div>

            {/* Like Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleLikeToggle(); }}
              className={`p-2 flex-shrink-0 transition-colors ${isLiked ? 'text-accent' : 'text-foreground-subtle'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Row 2: Progress Bar - Mobile */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-foreground-subtle font-mono w-10 text-right">{formatTime(currentTime)}</span>
            <div 
              onClick={handleSeek}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="flex-1 h-8 flex items-center cursor-pointer touch-none"
            >
              <div className="w-full h-1.5 bg-border rounded-full relative">
                <div 
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-surface rounded-full shadow-card border-2 border-accent"
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-foreground-subtle font-mono w-10">{formatTime(duration)}</span>
          </div>

          {/* Row 3: All Controls */}
          <div className="flex items-center justify-between">
            <button 
              onClick={handleShuffle}
              className={`p-2 transition-colors ${shuffle ? 'text-accent' : 'text-foreground-subtle'}`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handlePrevious}
              className="p-2 text-foreground"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            
            <button 
              onClick={togglePlay}
              disabled={isLoading || !mediaUrl}
              className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-accent disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-foreground-inverted animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-foreground-inverted fill-current" />
              ) : (
                <Play className="w-6 h-6 text-foreground-inverted fill-current ml-0.5" />
              )}
            </button>
            
            <button 
              onClick={handleNext}
              className="p-2 text-foreground"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
            
            <button 
              onClick={handleRepeat}
              className={`p-2 transition-colors ${repeat !== 'off' ? 'text-accent' : 'text-foreground-subtle'}`}
            >
              {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between h-20 px-4 pt-1">
          {/* Left: Track Info */}
          <div className="flex items-center gap-4 w-[30%] min-w-0">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-muted shadow-soft">
              {item.cover ? (
                <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent-lighter flex items-center justify-center">
                  <Music className="w-6 h-6 text-accent" />
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-surface/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate hover:underline cursor-pointer">
                {item.title}
              </h4>
              <p className="text-xs text-foreground-muted truncate hover:underline cursor-pointer">
                {item.artist}
              </p>
            </div>

            <button 
              onClick={handleLikeToggle}
              className={`p-2 transition-colors ${isLiked ? 'text-accent' : 'text-foreground-subtle hover:text-foreground'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center: Controls */}
          <div className="flex flex-col items-center gap-1 w-[40%]">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShuffle}
                className={`p-2 transition-colors ${shuffle ? 'text-accent' : 'text-foreground-subtle hover:text-foreground'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handlePrevious}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                disabled={isLoading || !mediaUrl}
                className="w-9 h-9 bg-accent rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-foreground-inverted animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 text-foreground-inverted fill-current" />
                ) : (
                  <Play className="w-5 h-5 text-foreground-inverted fill-current ml-0.5" />
                )}
              </button>
              
              <button 
                onClick={handleNext}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
              
              <button 
                onClick={handleRepeat}
                className={`p-2 transition-colors ${repeat !== 'off' ? 'text-accent' : 'text-foreground-subtle hover:text-foreground'}`}
              >
                {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Time display */}
            <div className="flex items-center gap-2 text-[11px] text-foreground-muted font-mono">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <span>/</span>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume & Actions */}
          <div className="flex items-center justify-end gap-3 w-[30%]">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="text-foreground-subtle hover:text-foreground transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-24 h-1 bg-border rounded-full overflow-hidden group cursor-pointer relative">
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="h-full bg-foreground-subtle group-hover:bg-accent rounded-full transition-colors"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-error/20 border border-error/30 rounded-lg text-error text-xs">
            {error}
          </div>
        )}
      </motion.div>
    </>
  );
};
