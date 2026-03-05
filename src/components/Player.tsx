import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Minimize2, SkipBack, SkipForward, Shuffle, Repeat, Heart, ListMusic, Moon, Mic2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { usePlayer } from '../context/PlayerContext';

export function Player() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    nextSong, 
    prevSong,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    toggleFavorite,
    favorites,
    toggleMiniPlayer,
    sleepTimer,
    setSleepTimer,
    isMiniPlayerVisible
  } = usePlayer();

  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);

  // If mini player is visible, we hide this full player (or unmount it from parent)
  // But the parent controls mounting. Here we assume this component is only rendered when full player is open.
  // Actually, context has `isMiniPlayerVisible`. If true, this should be hidden/closed.
  
  if (!currentSong || isMiniPlayerVisible) return null;

  const isFavorite = favorites.some(f => f.videoId === currentSong.videoId);

  const handleShare = () => {
    const url = `${window.location.origin}?song=${currentSong.videoId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-[#121212] md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row">
        
        {/* Main Content (Video/Visualizer) */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-[60vh]">
          
          {/* Header (Mobile) */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent md:hidden">
            <button onClick={toggleMiniPlayer} className="p-2 text-white/70 hover:text-white">
              <Minimize2 className="w-6 h-6" />
            </button>
            <h2 className="text-white font-medium truncate px-4 text-sm">{currentSong.title}</h2>
            <button onClick={() => setMode(m => m === 'video' ? 'audio' : 'video')} className="p-2 text-white/70">
              {mode === 'video' ? <ListMusic className="w-6 h-6" /> : <Mic2 className="w-6 h-6" />}
            </button>
          </div>

          {/* Video Embed (Visible in Video Mode) */}
          <div className={cn(
            "w-full h-full transition-opacity duration-500 absolute inset-0",
            mode === 'audio' ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
             {/* We use an iframe here just for display if we want, OR we rely on GlobalPlayer. 
                 Since GlobalPlayer is hidden, we need to show something here.
                 Actually, react-youtube cannot be moved easily without reloading.
                 
                 STRATEGY CHANGE: 
                 The GlobalPlayer should be HERE when full screen, and moved to MiniPlayer when minimized?
                 Or we just show the Video in Full Screen and hide GlobalPlayer?
                 
                 If we have two YouTube components, they will conflict or double play.
                 
                 BETTER STRATEGY:
                 The `GlobalPlayer` is the ONLY player. It is fixed in the DOM tree.
                 We use CSS Portal or just absolute positioning to move it visually? No, that's hard.
                 
                 Alternative: The GlobalPlayer is always hidden. 
                 In "Video Mode", we show a SECOND player synced to the same time? No, that wastes bandwidth.
                 
                 Correct Strategy for "Video Mode":
                 The GlobalPlayer IS the visual player. 
                 When "MiniPlayer" is active, the GlobalPlayer component is rendered in the MiniPlayer container.
                 When "FullPlayer" is active, it is rendered here.
                 
                 This requires `GlobalPlayer` to be movable or rendered in a Portal.
                 Let's stick to a simpler approach for now:
                 
                 The `GlobalPlayer` component I created earlier was "hidden". 
                 Let's make `GlobalPlayer` the actual visual component and place it in `App.tsx` with absolute positioning 
                 that changes based on state (Full vs Mini).
                 
                 So `Player.tsx` (this file) becomes just the CONTROLS overlay, and the video sits behind it or in a specific container.
             */}
             <div id="video-container-placeholder" className="w-full h-full bg-black/50 flex items-center justify-center">
                <p className="text-white/30 text-sm">Video playing in background...</p>
             </div>
          </div>

          {/* Audio Mode Visualizer */}
          <AnimatePresence>
            {mode === 'audio' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/20 to-black backdrop-blur-sm"
              >
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-[spin_30s_linear_infinite]" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                  <img 
                    src={currentSong.thumbnailUrl} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black rounded-full border-2 border-white/20" />
                  </div>
                </div>

                {/* Visualizer Bars */}
                <div className="flex items-end justify-center gap-1.5 h-24 mt-12">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-full"
                      style={{
                        height: isPlaying ? `${Math.random() * 100}%` : '10%',
                        transition: 'height 0.15s ease',
                        animation: isPlaying ? `bounce 0.4s infinite ${i * 0.05}s alternate` : 'none'
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Controls Area */}
        <div className="w-full md:w-96 bg-[#18181b] border-l border-white/5 flex flex-col h-1/2 md:h-auto">
          
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-6 border-b border-white/5">
             <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">Now Playing</h3>
             <div className="flex gap-2">
                <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Share">
                  <Share2 className="w-4 h-4 text-white/60" />
                </button>
                <button onClick={toggleMiniPlayer} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Minimize2 className="w-4 h-4 text-white/60" />
                </button>
             </div>
          </div>

          {/* Song Info */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
             <div className="mb-6">
               <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{currentSong.title}</h2>
               <p className="text-lg text-white/50">{currentSong.channelTitle}</p>
             </div>

             {/* Progress Bar (Fake for now as we don't have real-time sync yet) */}
             <div className="w-full bg-white/10 h-1.5 rounded-full mb-2 overflow-hidden">
               <div className="bg-indigo-500 h-full w-1/3 relative">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
               </div>
             </div>
             <div className="flex justify-between text-xs text-white/30 font-mono mb-8">
               <span>1:23</span>
               <span>3:45</span>
             </div>

             {/* Main Controls */}
             <div className="flex items-center justify-between mb-8">
               <button onClick={toggleShuffle} className={cn("p-2 transition-colors", isShuffle ? "text-indigo-400" : "text-white/30 hover:text-white")}>
                 <Shuffle className="w-5 h-5" />
               </button>
               
               <button onClick={prevSong} className="p-2 text-white hover:text-indigo-400 transition-colors">
                 <SkipBack className="w-8 h-8 fill-current" />
               </button>

               <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-white/10"
               >
                 {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
               </button>

               <button onClick={nextSong} className="p-2 text-white hover:text-indigo-400 transition-colors">
                 <SkipForward className="w-8 h-8 fill-current" />
               </button>

               <button onClick={toggleRepeat} className={cn("p-2 transition-colors", repeatMode !== 'off' ? "text-indigo-400" : "text-white/30 hover:text-white")}>
                 <Repeat className="w-5 h-5" />
                 {repeatMode === 'one' && <span className="absolute text-[8px] font-bold top-0 right-0">1</span>}
               </button>
             </div>

             {/* Secondary Controls */}
             <div className="flex items-center justify-between px-4">
                <button onClick={() => toggleFavorite(currentSong)} className={cn("p-2 transition-colors", isFavorite ? "text-red-500" : "text-white/30 hover:text-white")}>
                  <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                </button>

                <div className="flex items-center gap-2 flex-1 mx-4">
                  <button onClick={toggleMute} className="text-white/50 hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowSleepTimer(!showSleepTimer)}
                    className={cn("p-2 transition-colors", sleepTimer ? "text-indigo-400" : "text-white/30 hover:text-white")}
                  >
                    <Moon className="w-5 h-5" />
                  </button>
                  {showSleepTimer && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#2a2a2a] rounded-xl p-2 min-w-[120px] shadow-xl border border-white/10">
                      {[15, 30, 45, 60].map(min => (
                        <button 
                          key={min}
                          onClick={() => { setSleepTimer(min); setShowSleepTimer(false); }}
                          className="block w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg"
                        >
                          {min} min
                        </button>
                      ))}
                      <button 
                        onClick={() => { setSleepTimer(null); setShowSleepTimer(false); }}
                        className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded-lg border-t border-white/5 mt-1"
                      >
                        Off
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Mode Switcher (Desktop) */}
          <div className="hidden md:flex p-4 border-t border-white/5 bg-black/20">
            <button 
              onClick={() => setMode('video')}
              className={cn("flex-1 py-3 text-sm font-medium rounded-l-xl transition-colors", mode === 'video' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5")}
            >
              Video
            </button>
            <button 
              onClick={() => setMode('audio')}
              className={cn("flex-1 py-3 text-sm font-medium rounded-r-xl transition-colors", mode === 'audio' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5")}
            >
              Audio
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
