import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Repeat, Shuffle, Loader2, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { selfdb, BUCKETS } from '../lib/selfdb';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  type: 'audio' | 'video';
  cover: string | null;  // Can be null for fallback icons
  url: string;
}

interface PlayerProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const Player = ({ item, onClose }: PlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');

  // Download file from SelfDB and create blob URL
  const downloadAndPlay = useCallback(async (mediaItem: MediaItem) => {
    setIsLoading(true);
    setError(null);
    setMimeType('');

    try {
      let blobUrl: string;
      let detectedMimeType = '';

      // If it's already a full URL (http/https), use it directly
      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        blobUrl = mediaItem.url;
        // Try to determine mime type from extension
        const ext = mediaItem.url.split('.').pop()?.toLowerCase();
        if (ext === 'mp3') detectedMimeType = 'audio/mpeg';
        else if (ext === 'wav') detectedMimeType = 'audio/wav';
        else if (ext === 'mp4') detectedMimeType = 'video/mp4';
        else if (ext === 'webm') detectedMimeType = 'video/webm';
      } else {
        // It's a SelfDB storage path - download as blob
        console.log('Downloading from SelfDB:', mediaItem.url);
        
        // Download file using SelfDB SDK
        const fileData = await selfdb.storage.files.download({
          bucketName: BUCKETS.MEDIA,
          path: mediaItem.url
        });

        console.log('File downloaded, size:', fileData.byteLength);

        // Determine mime type from file extension in the path
        const ext = mediaItem.url.split('.').pop()?.toLowerCase();
        if (ext === 'mp3') detectedMimeType = 'audio/mpeg';
        else if (ext === 'wav' || ext === 'wave') detectedMimeType = 'audio/wav';
        else if (ext === 'ogg') detectedMimeType = 'audio/ogg';
        else if (ext === 'flac') detectedMimeType = 'audio/flac';
        else if (ext === 'm4a') detectedMimeType = 'audio/mp4';
        else if (ext === 'mp4') detectedMimeType = 'video/mp4';
        else if (ext === 'webm') detectedMimeType = 'video/webm';
        else if (ext === 'mkv') detectedMimeType = 'video/x-matroska';
        else if (ext === 'mov') detectedMimeType = 'video/quicktime';
        else {
          // Default based on type
          detectedMimeType = mediaItem.type === 'audio' ? 'audio/mpeg' : 'video/mp4';
        }

        console.log('Detected MIME type:', detectedMimeType);
        setMimeType(detectedMimeType);

        // Create blob from ArrayBuffer with proper mime type
        const blob = new Blob([fileData], { type: detectedMimeType });
        blobUrl = URL.createObjectURL(blob);
        console.log('Blob URL created:', blobUrl);
      }

      setMediaUrl(blobUrl);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to load media file');
      setIsLoading(false);
    }
  }, []);

  // Cleanup blob URL when component unmounts or item changes
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

    setIsPlaying(true);
    setProgress(0);
    downloadAndPlay(item);
  }, [item, downloadAndPlay]);

  const togglePlay = () => {
    const media = item?.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play().catch(err => {
          console.error('Play error:', err);
          setError('Failed to play media');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (e: any) => {
    const { currentTime, duration } = e.target;
    if (duration) {
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleLoadedMetadata = (e: any) => {
    console.log('Media loaded:', e.target.duration);
    setIsLoading(false);
  };

  const handleError = (e: any) => {
    console.error('Media error:', e);
    setError('Failed to load media. The file may be corrupted or in an unsupported format.');
    setIsLoading(false);
  };

  if (!item) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-10 md:pb-10 pointer-events-none"
    >
      <div className="relative max-w-7xl mx-auto bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto shadow-[0_20px_60px_rgba(249,115,22,0.15)] elevated">
        
        {/* Close Button - Positioned in top right corner */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-xl transition-all group active:scale-90 shadow-sm hover:shadow-red-500/20 z-10"
          aria-label="Close player"
        >
          <X className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/5 blur-md transition-all" />
        </button>

        {/* Thumbnail/Video Area */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-black">
          {item.type === 'video' ? (
            <video 
              ref={videoRef}
              src={mediaUrl}
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleError}
              className="w-full h-full object-cover"
              onClick={togglePlay}
            />
          ) : (
            <>
              {/* Cover image or fallback music icon */}
              {item.cover ? (
                <img 
                  src={item.cover} 
                  alt={item.title}
                  className={`w-full h-full object-cover ${isPlaying && !isLoading ? 'opacity-50' : 'opacity-100'}`} 
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${isPlaying && !isLoading ? 'opacity-50' : 'opacity-100'}`}>
                  <Music className="w-10 h-10 text-gray-600" />
                </div>
              )}
              {mediaUrl && (
                <audio 
                  ref={audioRef} 
                  src={mediaUrl} 
                  autoPlay 
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleError}
                />
              )}
              
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0 flex flex-col items-center md:items-start pr-4">
          <h4 className="font-bold text-lg truncate w-full text-center md:text-left">{item.title}</h4>
          <p className="text-sm text-gray-400 truncate w-full text-center md:text-left">{item.artist}</p>
          {mimeType && (
            <p className="text-xs text-gray-500 mt-1">{mimeType}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-16 left-6 right-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 w-full md:w-1/3">
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"><Shuffle className="w-4 h-4" /></button>
            <button className="text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"><SkipBack className="w-5 h-5 fill-current" /></button>
            
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              disabled={isLoading || !mediaUrl}
              className="w-14 h-14 bg-gradient-to-br from-accent to-accent-hover text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-accent/50 glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>
            
            <button className="text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"><SkipForward className="w-5 h-5 fill-current" /></button>
            <button className="text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"><Repeat className="w-4 h-4" /></button>
          </div>
          
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
               className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
               animate={{ width: `${progress}%` }}
               transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>
        </div>

        {/* Action area */}
        <div className="flex items-center gap-5 w-full md:w-48 justify-center md:justify-end">
          <div className="hidden md:flex items-center gap-5 flex-1 justify-end">
            <Volume2 className="w-5 h-5 text-gray-400 group hover:text-white transition-colors" />
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-gradient-to-r from-accent to-accent-light rounded-full shadow-lg shadow-accent/30" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
















