import { Play, MoreVertical, Heart, Plus, ListMusic } from 'lucide-react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { useState } from 'react';
import type { VideoResult } from '../services/youtubeService';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../lib/utils';

interface VideoCardProps {
  video: VideoResult;
  onSelect: (video: VideoResult) => void;
  index: number;
}

export const VideoCard: FC<VideoCardProps> = ({ video, onSelect, index }) => {
  const { toggleFavorite, favorites, playlists, addToPlaylist } = usePlayer();
  const [showMenu, setShowMenu] = useState(false);
  const isFavorite = favorites.some(f => f.videoId === video.videoId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-900/20"
    >
      {/* Thumbnail & Play Overlay */}
      <div 
        className="aspect-video relative overflow-hidden cursor-pointer"
        onClick={() => onSelect(video)}
      >
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-4 relative">
        <div className="pr-8">
          <h3 className="font-medium text-white line-clamp-1 mb-1 group-hover:text-indigo-400 transition-colors" title={video.title}>
            {video.title}
          </h3>
          <p className="text-sm text-white/50 truncate">
            {video.channelTitle}
          </p>
        </div>

        {/* Action Menu Trigger */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-4 right-2 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Context Menu */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)} 
            />
            <div className="absolute right-2 top-10 z-20 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => {
                  toggleFavorite(video);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-sm text-left text-white/80 hover:bg-white/10 flex items-center gap-2"
              >
                <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              </button>
              
              <div className="px-4 py-2 text-xs font-bold text-white/30 uppercase tracking-wider">
                Add to Playlist
              </div>
              
              {playlists.length === 0 ? (
                <div className="px-4 py-2 text-xs text-white/50 italic">
                  No playlists created
                </div>
              ) : (
                playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      addToPlaylist(playlist.id, video);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-white/70 hover:bg-white/10 flex items-center gap-2 truncate"
                  >
                    <ListMusic className="w-3 h-3" />
                    {playlist.name}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
