import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Maximize, Minimize, X, Loader2, Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { selfdb, BUCKETS } from '../lib/selfdb';
import { playbackStore } from '../lib/playbackStore';
import type { MediaItem } from '../lib/playbackStore';

interface VideoPlayerProps {
  item: MediaItem | null;
  allItems: MediaItem[];
  onClose: () => void;
  onTrackChange?: (item: MediaItem) => void;
}

export const VideoPlayer = ({ item, allItems, onClose, onTrackChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Hide controls after inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) setShowControls(true);
  }, [isPlaying]);

  // Download file from SelfDB
  const downloadAndPlay = useCallback(async (mediaItem: MediaItem) => {
    setIsLoading(true);
    setError(null);

    try {
      let blobUrl: string;

      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        blobUrl = mediaItem.url;
      } else {
        const fileData = await selfdb.storage.files.download({
          bucketName: BUCKETS.MEDIA,
          path: mediaItem.url
        });

        const ext = mediaItem.url.split('.').pop()?.toLowerCase();
        let mimeType = 'video/mp4';
        if (ext === 'webm') mimeType = 'video/webm';
        else if (ext === 'ogg') mimeType = 'video/ogg';
        else if (ext === 'mkv') mimeType = 'video/x-matroska';

        const blob = new Blob([fileData], { type: mimeType });
        blobUrl = URL.createObjectURL(blob);
      }

      setMediaUrl(blobUrl);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to load video');
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
    
    // Resume from saved position
    const savedProgress = playbackStore.getWatchProgress(item.id);
    
    downloadAndPlay(item).then(() => {
      if (savedProgress && videoRef.current) {
        videoRef.current.currentTime = savedProgress.positionSeconds;
      }
    });
  }, [item, downloadAndPlay, allItems]);

  // Auto-play when URL is set
  useEffect(() => {
    if (!mediaUrl || !videoRef.current) return;
    
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;
    videoRef.current.play().catch(console.error);
  }, [mediaUrl]);

  // Periodic save
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      if (item && currentTime > 0 && duration > 0) {
        playbackStore.updateWatchProgress(item.id, currentTime, duration);
      }
      playbackStore.savePosition();
    }, 5000);
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [item, currentTime, duration]);

  // Volume sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (!isFullscreen) onClose();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted(!isMuted);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isPlaying, isMuted, isFullscreen]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      playbackStore.pause();
    } else {
      videoRef.current.play().catch(console.error);
      playbackStore.resume();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimer();
  }, [isPlaying, resetControlsTimer]);

  const handleNext = useCallback(() => {
    const nextTrack = playbackStore.next();
    if (nextTrack && onTrackChange) onTrackChange(nextTrack);
  }, [onTrackChange]);

  const handlePrevious = useCallback(() => {
    const prevTrack = playbackStore.previous();
    if (prevTrack && onTrackChange) onTrackChange(prevTrack);
  }, [onTrackChange]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    playbackStore.setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  }, [isMuted]);

  const toggleMute = useCallback(() => setIsMuted(!isMuted), [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [isFullscreen]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
    playbackStore.seek(percent * duration);
  }, [duration]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const { currentTime: time, duration: dur, buffered: buf } = videoRef.current;
    if (dur) {
      setProgress((time / dur) * 100);
      setCurrentTime(time);
      setDuration(dur);
      playbackStore.updatePosition(time);
      
      // Update buffered
      if (buf.length > 0) {
        setBuffered((buf.end(buf.length - 1) / dur) * 100);
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    // Clear watch progress on completion
    if (item) {
      playbackStore.updateWatchProgress(item.id, duration, duration);
    }
    handleNext();
  }, [item, duration, handleNext]);

  const handleClose = useCallback(() => {
    // Save progress before closing
    if (item && currentTime > 0 && duration > 0) {
      playbackStore.updateWatchProgress(item.id, currentTime, duration);
    }
    onClose();
  }, [item, currentTime, duration, onClose]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
        onMouseMove={resetControlsTimer}
        onClick={togglePlay}
      >
        {/* Video element */}
        {mediaUrl && (
          <video 
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={handleEnded}
            onError={() => setError('Failed to play video')}
            playsInline
          />
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="text-white/70">Loading video...</p>
            </div>
          </div>
        )}

        {/* No video placeholder */}
        {!mediaUrl && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Film className="w-24 h-24 text-white/20" />
          </div>
        )}

        {/* Controls overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute inset-0 flex flex-col pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top gradient & close button */}
          <div className="h-auto bg-gradient-to-b from-black/70 to-transparent flex items-start justify-between p-4 pointer-events-auto safe-area-top">
            <div className="min-w-0 pt-1">
              <h2 className="text-xl font-bold text-white truncate">{item.title}</h2>
              {item.artist && <p className="text-white/60 text-sm">{item.artist}</p>}
            </div>
            <button 
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Center play button */}
          {!isPlaying && !isLoading && (
            <div className="flex-1 flex items-center justify-center pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Play className="w-10 h-10 text-white fill-current ml-1" />
              </motion.button>
            </div>
          )}
          {(isPlaying || isLoading) && <div className="flex-1" />}

          {/* Bottom controls */}
          <div className="bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto safe-area-bottom">
            {/* Progress bar */}
            <div 
              ref={progressRef}
              onClick={handleSeek}
              className="h-1 bg-white/20 rounded-full cursor-pointer group hover:h-1.5 transition-all mb-3 relative"
            >
              {/* Buffered */}
              <div 
                className="absolute h-full bg-white/30 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div 
                className="absolute h-full bg-accent rounded-full"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Left: Time */}
              <div className="flex items-center gap-4">
                <span className="text-white/80 text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Center: Playback controls */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrevious}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-current" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
                </button>
                
                <button 
                  onClick={handleNext}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Right: Volume & Fullscreen */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleMute}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer relative">
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
                      className="h-full bg-white rounded-full transition-colors"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={toggleFullscreen}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center">
            <p className="font-semibold">Playback Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
