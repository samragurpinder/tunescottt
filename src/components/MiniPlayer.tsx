import { useState, useEffect } from 'react';
import { Play, Pause, X, Maximize2, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../context/PlayerContext';

export function MiniPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    closePlayer, 
    toggleMiniPlayer,
    nextSong,
    prevSong,
    isMiniPlayerVisible
  } = usePlayer();

  if (!currentSong || !isMiniPlayerVisible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-8 md:w-96"
    >
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-4">
        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer" onClick={toggleMiniPlayer}>
          <img 
            src={currentSong.thumbnailUrl} 
            alt={currentSong.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={toggleMiniPlayer}>
          <h4 className="text-white font-medium text-sm truncate">{currentSong.title}</h4>
          <p className="text-white/50 text-xs truncate">{currentSong.channelTitle}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={prevSong} className="p-1.5 text-white/70 hover:text-white transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button onClick={nextSong} className="p-1.5 text-white/70 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            className="p-1.5 text-white/50 hover:text-red-400 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
