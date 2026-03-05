import { useState, type FormEvent } from 'react';
import { Plus, Trash2, Music, PlayCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../lib/utils';

export function PlaylistSidebar() {
  const { playlists, createPlaylist, deletePlaylist, playSong, addToQueue } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Playlists</h3>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="p-1.5 hover:bg-white/10 rounded-md text-white/70 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border-b border-white/5 bg-white/5">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist name..."
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {playlists.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm">
            No playlists yet
          </div>
        )}
        
        {playlists.map(playlist => (
          <div key={playlist.id} className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Music className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{playlist.name}</h4>
              <p className="text-white/40 text-xs">{playlist.songs.length} songs</p>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (playlist.songs.length > 0) {
                    playSong(playlist.songs[0]);
                    playlist.songs.slice(1).forEach(s => addToQueue(s));
                  }
                }}
                className="p-1.5 hover:text-indigo-400 text-white/50"
                title="Play Playlist"
              >
                <PlayCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete playlist?')) deletePlaylist(playlist.id);
                }}
                className="p-1.5 hover:text-red-400 text-white/50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
