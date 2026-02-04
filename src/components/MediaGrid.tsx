
import { Play, Pause, MoreHorizontal, Music, Film, ListPlus, PlayCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { playbackStore } from '../lib/playbackStore';
import { useState } from 'react';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  type: 'audio' | 'video';
  cover: string | null;
  duration: number;
  url: string;
  album?: string;
  addedAt?: string;
}

interface MediaGridProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  currentlyPlaying?: MediaItem | null;
}

// Format duration from seconds to mm:ss or hh:mm:ss
const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Audio List Item - Spotify-like row
const AudioListItem = ({ 
  item, 
  index, 
  onSelect, 
  isPlaying,
  onAddToQueue
}: { 
  item: MediaItem; 
  index: number;
  onSelect: () => void;
  isPlaying: boolean;
  onAddToQueue: (e: React.MouseEvent) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`group flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-2 rounded-lg cursor-pointer transition-all ${
        isPlaying ? 'bg-accent-subtle' : 'hover:bg-accent-subtle/50'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Index / Play Button - Hidden on mobile */}
      <div className="hidden md:flex w-8 h-8 items-center justify-center flex-shrink-0">
        {isHovered || isPlaying ? (
          <button className="text-foreground hover:scale-110 transition-transform">
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-accent text-accent" />
            ) : (
              <Play className="w-4 h-4 fill-foreground" />
            )}
          </button>
        ) : (
          <span className={`text-sm font-mono ${isPlaying ? 'text-accent' : 'text-foreground-subtle'}`}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded overflow-hidden flex-shrink-0 bg-surface">
        {item.cover ? (
          <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-accent-lighter flex items-center justify-center">
            <Music className="w-5 h-5 md:w-4 md:h-4 text-accent" />
          </div>
        )}
        {/* Mobile play indicator */}
        {isPlaying && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center md:hidden">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <Pause className="w-3 h-3 text-foreground-inverted fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Title & Artist - Takes remaining space */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isPlaying ? 'text-accent' : 'text-foreground'}`}>
          {item.title}
        </p>
        <p className="text-xs text-foreground-muted truncate">
          {item.artist}
        </p>
      </div>

      {/* Duration - Always visible */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs md:text-sm text-foreground-subtle font-mono">
          {formatDuration(item.duration)}
        </span>
        
        {/* Desktop only actions */}
        <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <button 
            onClick={onAddToQueue}
            className="p-1.5 text-foreground-subtle hover:text-foreground transition-colors"
            title="Add to queue"
          >
            <ListPlus className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1 text-foreground-subtle hover:text-foreground transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Video Card - Netflix-style
const VideoCard = ({ 
  item, 
  index, 
  onSelect,
  onPlayNext,
  onAddToQueue
}: { 
  item: MediaItem; 
  index: number;
  onSelect: () => void;
  onPlayNext: (e: React.MouseEvent) => void;
  onAddToQueue: (e: React.MouseEvent) => void;
}) => {
  const watchProgress = playbackStore.getWatchProgress(item.id);
  const progressPercent = watchProgress && item.duration 
    ? (watchProgress.positionSeconds / item.duration) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group cursor-pointer card-hover p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm"
      onClick={onSelect}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg md:rounded-xl mb-3 md:mb-4 elevated">
        {/* Cover image or fallback */}
        {item.cover ? (
          <img 
            src={item.cover} 
            alt={item.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 brightness-90"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
            <Film className="w-12 h-12 md:w-16 md:h-16 text-foreground-subtle" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center glow-accent"
          >
            <Play className="fill-foreground-inverted text-foreground-inverted w-6 h-6 md:w-7 md:h-7 ml-1" />
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAddToQueue}
            className="p-2 bg-foreground/60 backdrop-blur-md rounded-full text-foreground-inverted border border-foreground-inverted/20 hover:bg-foreground/80"
            title="Add to queue"
          >
            <ListPlus className="w-4 h-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPlayNext}
            className="p-2 bg-foreground/60 backdrop-blur-md rounded-full text-foreground-inverted border border-foreground-inverted/20 hover:bg-foreground/80"
            title="Play next"
          >
            <PlayCircle className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-foreground/80 backdrop-blur-sm rounded text-xs font-medium text-foreground-inverted font-mono">
          {formatDuration(item.duration)}
        </div>

        {/* Watch progress bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground-inverted/20">
            <div 
              className="h-full bg-accent transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-0.5 md:px-1">
        <h3 className="font-bold text-foreground truncate text-sm mb-1 group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        <p className="text-xs font-medium text-foreground-muted truncate">
          {item.artist}
        </p>
      </div>
    </motion.div>
  );
};

export const MediaGrid = ({ items, onSelect, currentlyPlaying }: MediaGridProps) => {
  const audioItems = items.filter(item => item.type === 'audio');
  const videoItems = items.filter(item => item.type === 'video');

  const handlePlayNext = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    playbackStore.playNext(item);
  };

  const handleAddToQueue = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    playbackStore.addToQueue(item);
  };

  // Mixed view - show both
  if (audioItems.length > 0 && videoItems.length > 0) {
    return (
      <div className="space-y-12">
        {/* Audio Section - List View */}
        {audioItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-foreground">Tracks</h3>
              <span className="text-sm text-foreground-subtle">({audioItems.length})</span>
            </div>
            
            {/* Table Header - Desktop Only */}
            <div className="hidden md:grid grid-cols-[40px_4fr_3fr_2fr_minmax(80px,1fr)] gap-4 px-4 py-2 border-b border-border text-xs text-foreground-subtle uppercase tracking-wider">
              <div>#</div>
              <div>Title</div>
              <div>Album</div>
              <div>Added</div>
              <div className="flex justify-end">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-2">
              {audioItems.map((item, index) => (
                <AudioListItem
                  key={item.id}
                  item={item}
                  index={index}
                  onSelect={() => onSelect(item)}
                  isPlaying={currentlyPlaying?.id === item.id}
                  onAddToQueue={(e) => handleAddToQueue(e, item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Video Section - Card Grid */}
        {videoItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-foreground">Videos</h3>
              <span className="text-sm text-foreground-subtle">({videoItems.length})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {videoItems.map((item, index) => (
                <VideoCard
                  key={item.id}
                  item={item}
                  index={index}
                  onSelect={() => onSelect(item)}
                  onPlayNext={(e) => handlePlayNext(e, item)}
                  onAddToQueue={(e) => handleAddToQueue(e, item)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Audio only - List View
  if (audioItems.length > 0) {
    return (
      <div>
        {/* Table Header - Desktop Only */}
        <div className="hidden md:grid grid-cols-[40px_4fr_3fr_2fr_minmax(80px,1fr)] gap-4 px-4 py-2 border-b border-border text-xs text-foreground-subtle uppercase tracking-wider">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Added</div>
          <div className="flex justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-2">
          {audioItems.map((item, index) => (
            <AudioListItem
              key={item.id}
              item={item}
              index={index}
              onSelect={() => onSelect(item)}
              isPlaying={currentlyPlaying?.id === item.id}
              onAddToQueue={(e) => handleAddToQueue(e, item)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Video only - Card Grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {videoItems.map((item, index) => (
        <VideoCard
          key={item.id}
          item={item}
          index={index}
          onSelect={() => onSelect(item)}
          onPlayNext={(e) => handlePlayNext(e, item)}
          onAddToQueue={(e) => handleAddToQueue(e, item)}
        />
      ))}
    </div>
  );
};







