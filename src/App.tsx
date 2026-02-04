import { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MediaGrid } from './components/MediaGrid';
import { AudioPlayer } from './components/AudioPlayer';
import { VideoPlayer } from './components/VideoPlayer';
import { MobileUploadButton } from './components/MobileUploadButton';
import { Search, Filter, PlayCircle, Clock } from 'lucide-react';
import { selfdb, TABLES, getTableId } from './lib/selfdb';
import { playbackStore } from './lib/playbackStore';
import type { MediaItem } from './lib/playbackStore';
import localData from './data.json';
import { motion, AnimatePresence } from 'framer-motion';
import logoIcon from './assets/logo.svg';

function App() {
  const [mediaData, setMediaData] = useState<MediaItem[]>(localData as unknown as MediaItem[]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      
      const tableId = await getTableId(TABLES.MEDIA);
      
      const response = await selfdb.tables.data
        .query(tableId)
        .pageSize(100)
        .execute();
      
      if (response && response.data && response.data.length > 0) {
        setMediaData(response.data as unknown as MediaItem[]);
      }
    } catch (error) {
      console.error('Error fetching from SelfDB, falling back to local data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load continue watching data
  const loadContinueWatching = useCallback(() => {
    const progress = playbackStore.getContinueWatching();
    const videos = mediaData.filter(item => 
      item.type === 'video' && progress.some(p => p.mediaId === item.id)
    );
    setContinueWatching(videos);
  }, [mediaData]);

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    loadContinueWatching();
  }, [mediaData, loadContinueWatching]);

  const filteredData = useMemo(() => {
    return mediaData.filter((item) => {
      const matchesFilter = filter === 'all' || item.type === filter;
      const matchesSearch = (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.artist?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [mediaData, filter, searchQuery]);

  const handleMediaSelect = (item: MediaItem) => {
    setSelectedMedia(item);
    loadContinueWatching();
  };

  const handleTrackChange = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <Sidebar onMediaAdded={fetchMedia} />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-auto min-h-[4rem] md:min-h-[5rem] flex items-center justify-between px-4 md:px-8 bg-background z-10 border-b border-border safe-area-top">
          <div className="flex items-center gap-2 md:hidden py-2">
            <img src={logoIcon} alt="StreamX" className="w-8 h-8" />
            <span className="font-bold text-lg text-foreground">StreamX</span>
          </div>

          <div className="hidden md:flex items-center gap-4 glass px-5 py-3 rounded-2xl w-full max-w-md focus-within:shadow-card focus-within:border-accent/30 transition-all duration-300">
            <Search className="w-5 h-5 text-foreground-subtle" />
            <input 
              type="text" 
              placeholder="Search music, videos, artists..." 
              className="bg-transparent border-none outline-none w-full text-sm py-1 text-foreground placeholder:text-foreground-subtle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex items-center p-1 glass rounded-2xl">
              {(['all', 'audio', 'video'] as const).map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 ${filter === f ? 'bg-gradient-to-r from-accent to-accent-hover text-foreground-inverted shadow-accent' : 'text-foreground-muted hover:text-foreground'}`}
                >
                  {f === 'all' ? 'All' : f === 'audio' ? 'Music' : 'Videos'}
                </button>
              ))}
            </div>

          </div>
        </header>

        {/* Mobile Search */}
        <div className="md:hidden px-4 py-3 bg-background">
          <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2.5 rounded-xl">
            <Search className="w-4 h-4 text-foreground-subtle" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none w-full text-sm text-foreground placeholder:text-foreground-subtle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Filter Pills */}
        <div className="lg:hidden px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {(['all', 'audio', 'video'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-accent text-foreground-inverted shadow-accent' : 'bg-surface-muted text-foreground-muted'}`}
            >
              {f === 'all' ? 'All' : f === 'audio' ? 'Music' : 'Videos'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar ${selectedMedia?.type === 'audio' ? 'pb-48 md:pb-40' : selectedMedia ? 'pb-8' : ''}`}>
          {/* Continue Watching */}
          {continueWatching.length > 0 && filter !== 'audio' && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Continue Watching</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {continueWatching.slice(0, 4).map((item) => {
                  const progress = playbackStore.getWatchProgress(item.id);
                  const progressPercent = progress && item.duration 
                    ? (progress.positionSeconds / item.duration) * 100 
                    : 0;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group cursor-pointer card-hover p-3 rounded-xl"
                      onClick={() => handleMediaSelect(item)}
                    >
                      <div className="relative aspect-video overflow-hidden rounded-lg mb-3">
                        {item.cover ? (
                          <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-secondary/20" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
                          <div className="h-full bg-accent" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-surface/20 backdrop-blur-md rounded-full flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-foreground-inverted" />
                          </div>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm truncate text-foreground">{item.title}</h3>
                      <p className="text-xs text-foreground-muted">{progress ? `${Math.round(progressPercent)}% watched` : ''}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Main Library */}
          <section className="mb-12">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 md:mb-3 gradient-text">
                  {filter === 'all' ? 'Library' : filter === 'audio' ? 'Music' : 'Videos'}
                </h2>
                <div className="h-1 md:h-1.5 w-10 md:w-12 bg-accent rounded-full mb-2"></div>
                <p className="text-sm md:text-base text-foreground-muted font-medium">Your personal collection, curated by you.</p>
              </div>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-widest text-foreground-muted hover:text-foreground hover:bg-accent-subtle transition-all border border-border uppercase">
                <Filter className="w-3.5 h-3.5" />
                Sort: Recent
              </button>
            </div>

            <MediaGrid 
              items={filteredData} 
              onSelect={handleMediaSelect} 
              currentlyPlaying={selectedMedia}
            />
            
            {isLoading && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            )}
          </section>

          {/* Empty State */}
          {filteredData.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-accent-subtle rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">No results found</h3>
              <p className="text-foreground-muted">Try searching for something else or check your filters.</p>
            </div>
          )}
        </div>

        {/* Audio Player - Spotify-style bottom bar */}
        <AnimatePresence>
          {selectedMedia?.type === 'audio' && (
            <AudioPlayer 
              item={selectedMedia} 
              allItems={mediaData.filter(m => m.type === 'audio')}
              onClose={() => setSelectedMedia(null)}
              onTrackChange={handleTrackChange}
            />
          )}
        </AnimatePresence>

        {/* Video Player - Fullscreen cinematic experience */}
        <AnimatePresence>
          {selectedMedia?.type === 'video' && (
            <VideoPlayer 
              item={selectedMedia} 
              allItems={mediaData.filter(m => m.type === 'video')}
              onClose={() => { setSelectedMedia(null); loadContinueWatching(); }}
              onTrackChange={handleTrackChange}
            />
          )}
        </AnimatePresence>

        {/* Mobile Upload FAB */}
        <MobileUploadButton onMediaAdded={fetchMedia} hasAudioPlayer={selectedMedia?.type === 'audio'} />
      </main>
    </div>
  );
}

export default App;











