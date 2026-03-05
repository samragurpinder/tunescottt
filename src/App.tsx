import { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { VideoCard } from './components/VideoCard';
import { Player } from './components/Player';
import { MiniPlayer } from './components/MiniPlayer';
import { GlobalPlayer } from './components/GlobalPlayer';
import { Discovery } from './components/Discovery';
import { PlaylistSidebar } from './components/PlaylistSidebar';
import { searchYouTube, type VideoResult } from './services/youtubeService';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Sparkles, Menu, X } from 'lucide-react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { cn } from './lib/utils';

function AppContent() {
  const { playSong, currentSong, isMiniPlayerVisible } = usePlayer();
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = async (song: string, singer: string, keywords: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setVideos([]); // Clear previous results
    
    try {
      const results = await searchYouTube(song, singer, keywords);
      setVideos(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Global Hidden Player */}
      <GlobalPlayer />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      {/* Sidebar (Mobile Drawer / Desktop Fixed) */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#121212] border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Music2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">TuneScout</h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden ml-auto p-1 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <PlaylistSidebar />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 md:pl-64 min-h-screen flex flex-col">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex items-center justify-between sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white/70">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold">TuneScout</span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          
          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto mb-16">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Find your rhythm</h2>
              <p className="text-white/40">Search for any song, artist, or vibe.</p>
            </motion.div>
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-white/30"
              >
                <Sparkles className="w-8 h-8 mb-4 animate-spin-slow text-indigo-400" />
                <p>Scouting for tunes...</p>
              </motion.div>
            ) : hasSearched && videos.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Search Results</h3>
                  <button 
                    onClick={() => { setHasSearched(false); setVideos([]); }}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <VideoCard 
                      key={video.videoId} 
                      video={video} 
                      index={index} 
                      onSelect={playSong} 
                    />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Discovery Section (Only show if not searching or no results) */}
          {(!hasSearched || videos.length === 0) && !isLoading && (
            <Discovery onSelectVideo={playSong} />
          )}

          {/* Spacer for MiniPlayer */}
          <div className="h-24" />
        </div>
      </div>

      {/* Players */}
      <MiniPlayer />
      <AnimatePresence>
        {currentSong && !isMiniPlayerVisible && (
          <Player />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
