import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, 
  Repeat, Repeat1, Shuffle, Loader2, Music, Maximize2, Minimize2,
  ListMusic, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { selfdb, BUCKETS } from '../lib/selfdb';
import { useMediaSession } from '../hooks/usePlayback';
import { playbackStore } from '../lib/playbackStore';
import type { MediaItem } from '../lib/playbackStore';

interface PlayerProps {
  item: MediaItem | null;
  allItems: MediaItem[];
  onClose: () => void;
  onTrackChange?: (item: MediaItem) => void;
}

export const Player = ({ item, allItems, onClose, onTrackChange }: PlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Subscribe to playback store
  useEffect(() => {
    const unsubscribe = playbackStore.subscribe((state) => {
      setShuffle(state.shuffle);
      setRepeat(state.repeat);
      setVolume(state.volume);
      setQueue(state.queue);
      setQueueIndex(state.queueIndex);
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

  // Download file from SelfDB and create blob URL
  const downloadAndPlay = useCallback(async (mediaItem: MediaItem) => {
    setIsLoading(true);
    setError(null);

    try {
      let blobUrl: string;
      let detectedMimeType = '';

      // If it's already a full URL, use it directly
      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        blobUrl = mediaItem.url;
      } else {
        // Download from SelfDB
        const fileData = await selfdb.storage.files.download({
          bucketName: BUCKETS.MEDIA,
          path: mediaItem.url
        });

        // Determine mime type
        const ext = mediaItem.url.split('.').pop()?.toLowerCase();
        if (ext === 'mp3') detectedMimeType = 'audio/mpeg';
        else if (ext === 'wav') detectedMimeType = 'audio/wav';
        else if (ext === 'ogg') detectedMimeType = 'audio/ogg';
        else if (ext === 'flac') detectedMimeType = 'audio/flac';
        else if (ext === 'm4a') detectedMimeType = 'audio/mp4';
        else if (ext === 'mp4') detectedMimeType = 'video/mp4';
        else if (ext === 'webm') detectedMimeType = 'video/webm';
        else if (ext === 'mkv') detectedMimeType = 'video/x-matroska';
        else if (ext === 'mov') detectedMimeType = 'video/quicktime';
        else detectedMimeType = mediaItem.type === 'audio' ? 'audio/mpeg' : 'video/mp4';

        const blob = new Blob([fileData], { type: detectedMimeType });
        blobUrl = URL.createObjectURL(blob);
      }

      setMediaUrl(blobUrl);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to load media file');
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

    // Initialize playback in store
    playbackStore.play(item, allItems);
    
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    downloadAndPlay(item);

    // Check for saved watch progress (video)
    if (item.type === 'video') {
      const watchProgress = playbackStore.getWatchProgress(item.id);
      if (watchProgress && watchProgress.positionSeconds > 0) {
        // Will seek after media loads
        setCurrentTime(watchProgress.positionSeconds);
      }
    }
  }, [item, downloadAndPlay]);

  // Auto-play when media URL is set
  useEffect(() => {
    if (!mediaUrl) return;
    
    const media = item?.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.volume = volume;
      media.muted = isMuted;
      
      // Seek to saved position for video
      if (item?.type === 'video' && currentTime > 0) {
        media.currentTime = currentTime;
      }
      
      media.play().catch(err => {
        console.error('Autoplay failed:', err);
      });
    }
  }, [mediaUrl]);

  // Set up periodic save interval
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      playbackStore.savePosition();
    }, 5000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    const media = item?.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.volume = volume;
      media.muted = isMuted;
    }
  }, [volume, isMuted, item?.type]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const media = item?.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
        playbackStore.pause();
      } else {
        media.play().catch(console.error);
        playbackStore.resume();
      }
      setIsPlaying(!isPlaying);
    }
  }, [item?.type, isPlaying]);

  // Skip to next track
  const handleNext = useCallback(() => {
    const nextTrack = playbackStore.next();
    if (nextTrack && onTrackChange) {
      onTrackChange(nextTrack);
    }
  }, [onTrackChange]);

  // Skip to previous track
  const handlePrevious = useCallback(() => {
    const prevTrack = playbackStore.previous();
    if (prevTrack && onTrackChange) {
      onTrackChange(prevTrack);
    }
  }, [onTrackChange]);

  // Toggle shuffle
  const handleShuffle = useCallback(() => {
    playbackStore.toggleShuffle();
  }, []);

  // Cycle repeat mode
  const handleRepeat = useCallback(() => {
    playbackStore.cycleRepeat();
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    playbackStore.setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Seek functionality
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    const media = item?.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = newTime;
      playbackStore.seek(newTime);
    }
  }, [duration, item?.type]);

  // Time update handler
  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLMediaElement>) => {
    const media = e.currentTarget;
    const { currentTime: time, duration: dur } = media;
    
    if (dur) {
      setProgress((time / dur) * 100);
      setCurrentTime(time);
      setDuration(dur);
      playbackStore.updatePosition(time);

      // Update watch progress for video
      if (item?.type === 'video') {
        playbackStore.updateWatchProgress(item.id, time, dur);
      }
    }
  }, [item]);

  // Handle media end
  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      const media = item?.type === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        media.currentTime = 0;
        media.play().catch(console.error);
      }
    } else {
      handleNext();
    }
  }, [repeat, item?.type, handleNext]);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLMediaElement>) => {
    setDuration(e.currentTarget.duration);
    setIsLoading(false);
  }, []);

  // Handle media error
  const handleError = useCallback(() => {
    setError('Failed to load media. The file may be corrupted or unsupported.');
    setIsLoading(false);
  }, []);

  // Toggle fullscreen (video only)
  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Media Session API integration
  const { updatePositionState } = useMediaSession(
    item,
    isPlaying,
    () => {
      const media = item?.type === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        media.play().catch(console.error);
        setIsPlaying(true);
        playbackStore.resume();
      }
    },
    () => {
      const media = item?.type === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        media.pause();
        setIsPlaying(false);
        playbackStore.pause();
      }
    },
    handleNext,
    handlePrevious,
    (time) => {
      const media = item?.type === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        media.currentTime = time;
      }
    }
  );

  // Update position state for Media Session
  useEffect(() => {
    if (duration > 0) {
      updatePositionState(currentTime, duration);
    }
  }, [currentTime, duration, updatePositionState]);

  // Handle close
  const handleClose = useCallback(() => {
    playbackStore.savePosition();
    playbackStore.close();
    onClose();
  }, [onClose]);

  // Play from queue
  const playFromQueue = useCallback((queueItem: MediaItem) => {
    playbackStore.play(queueItem, queue);
    if (onTrackChange) {
      onTrackChange(queueItem);
    }
  }, [queue, onTrackChange]);

  if (!item) return null;

  const isVideo = item.type === 'video';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${isExpanded ? 'top-0' : ''}`}
      >
        {/* Expanded View */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-black/95 to-black backdrop-blur-3xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6">
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <span className="text-sm font-medium text-gray-400">Now Playing</span>
              <button 
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-xl transition-colors ${showQueue ? 'bg-accent/20 text-accent-light' : 'hover:bg-white/10'}`}
              >
                <ListMusic className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 p-6 overflow-hidden">
              {/* Album Art / Video */}
              <div className="w-full max-w-md aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
                {isVideo ? (
                  <video 
                    ref={videoRef}
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    onError={handleError}
                    onClick={togglePlay}
                  />
                ) : item.cover ? (
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent-hover/30 to-purple-600/30 flex items-center justify-center">
                    <Music className="w-32 h-32 text-white/30" />
                  </div>
                )}
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                  </div>
                )}
              </div>

              {/* Queue Panel */}
              {showQueue && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full md:w-80 h-96 bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold">Queue</h3>
                    <p className="text-sm text-gray-400">{queue.length} tracks</p>
                  </div>
                  <div className="overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar p-2">
                    {queue.map((queueItem, index) => (
                      <div 
                        key={`${queueItem.id}-${index}`}
                        onClick={() => playFromQueue(queueItem)}
                        className={`queue-item cursor-pointer ${index === queueIndex ? 'active' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          {queueItem.cover ? (
                            <img src={queueItem.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${index === queueIndex ? 'text-accent-light' : ''}`}>
                            {queueItem.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{queueItem.artist}</p>
                        </div>
                        {index === queueIndex && isPlaying && (
                          <div className="flex gap-0.5 items-end h-4">
                            <div className="w-0.5 bg-accent animate-pulse" style={{ height: '60%' }} />
                            <div className="w-0.5 bg-accent animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                            <div className="w-0.5 bg-accent animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Track Info & Controls */}
            <div className="p-6 md:p-8">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold truncate">{item.title}</h2>
                  <p className="text-gray-400">{item.artist}</p>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div 
                    ref={progressRef}
                    onClick={handleSeek}
                    className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all group-hover:from-accent-light group-hover:to-secondary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button 
                    onClick={handleShuffle}
                    className={`p-3 rounded-full transition-colors ${shuffle ? 'text-accent-light' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={handlePrevious}
                    className="p-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <SkipBack className="w-7 h-7 fill-current" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    disabled={isLoading || !mediaUrl}
                    className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    className="p-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <SkipForward className="w-7 h-7 fill-current" />
                  </button>
                  
                  <button 
                    onClick={handleRepeat}
                    className={`p-3 rounded-full transition-colors ${repeat !== 'off' ? 'text-accent-light' : 'text-gray-400 hover:text-white'}`}
                  >
                    {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            {/* Audio element (hidden) */}
            {!isVideo && mediaUrl && (
              <audio 
                ref={audioRef}
                src={mediaUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={handleError}
              />
            )}
          </motion.div>
        )}

        {/* Mini Player */}
        {!isExpanded && (
          <div className="px-4 pb-4 md:px-6 md:pb-6">
            <div className="relative max-w-7xl mx-auto glass-heavy rounded-2xl md:rounded-3xl overflow-hidden mobile-player">
              {/* Progress bar at top */}
              <div 
                ref={!isExpanded ? progressRef : undefined}
                onClick={handleSeek}
                className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer"
              >
                <div 
                  className="h-full bg-gradient-to-r from-accent to-accent-light"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="p-4 md:p-6 flex items-center gap-4">
                {/* Thumbnail */}
                <div 
                  onClick={() => setIsExpanded(true)}
                  className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
                >
                  {isVideo && mediaUrl ? (
                    <video 
                      ref={!isExpanded ? videoRef : undefined}
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      onError={handleError}
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    />
                  ) : item.cover ? (
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Music className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Expand icon on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ChevronUp className="w-6 h-6" />
                  </div>
                  
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                  )}
                </div>

                {/* Audio element */}
                {!isVideo && mediaUrl && !isExpanded && (
                  <audio 
                    ref={audioRef}
                    src={mediaUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    onError={handleError}
                  />
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsExpanded(true)}>
                  <h4 className="font-semibold truncate">{item.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                </div>

                {/* Error */}
                {error && (
                  <div className="hidden md:block text-red-400 text-xs max-w-[200px] truncate">
                    {error}
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Shuffle - hidden on mobile */}
                  <button 
                    onClick={handleShuffle}
                    className={`hidden md:flex p-2 rounded-lg transition-colors ${shuffle ? 'text-accent-light' : 'text-gray-500 hover:text-white'}`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handlePrevious}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    disabled={isLoading || !mediaUrl}
                    className="w-12 h-12 bg-gradient-to-br from-accent to-accent-hover text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all glow-accent disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>

                  {/* Repeat - hidden on mobile */}
                  <button 
                    onClick={handleRepeat}
                    className={`hidden md:flex p-2 rounded-lg transition-colors ${repeat !== 'off' ? 'text-accent-light' : 'text-gray-500 hover:text-white'}`}
                  >
                    {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  </button>

                  {/* Volume - hidden on mobile */}
                  <div className="hidden md:flex items-center gap-2 ml-2">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>

                  {/* Fullscreen for video - hidden on mobile */}
                  {isVideo && (
                    <button 
                      onClick={toggleFullscreen}
                      className="hidden md:flex p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                  )}

                  {/* Close button */}
                  <button 
                    onClick={handleClose}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
