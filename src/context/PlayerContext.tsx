import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Song, Playlist, PlayerState, RepeatMode } from '../types';

interface PlayerContextType extends PlayerState {
  playlists: Playlist[];
  favorites: Song[];
  history: Song[];
  
  // Actions
  playSong: (song: Song) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextSong: () => void;
  prevSong: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setSleepTimer: (minutes: number | null) => void;
  
  // Playlist & Favorites
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  toggleFavorite: (song: Song) => void;
  addToHistory: (song: Song) => void;
  
  // UI
  toggleMiniPlayer: () => void;
  closePlayer: () => void;
}

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  isPlaying: false,
  isMuted: false,
  volume: 100,
  progress: 0,
  duration: 0,
  repeatMode: 'off',
  isShuffle: false,
  isMiniPlayerVisible: false,
  sleepTimer: null,
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

type Action =
  | { type: 'SET_CURRENT_SONG'; payload: Song }
  | { type: 'TOGGLE_PLAY'; payload?: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'ADD_TO_QUEUE'; payload: Song }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_SLEEP_TIMER'; payload: number | null }
  | { type: 'TOGGLE_MINI_PLAYER' }
  | { type: 'CLOSE_PLAYER' }
  | { type: 'LOAD_DATA'; payload: { playlists: Playlist[]; favorites: Song[]; history: Song[] } }
  | { type: 'UPDATE_PLAYLISTS'; payload: Playlist[] }
  | { type: 'UPDATE_FAVORITES'; payload: Song[] }
  | { type: 'UPDATE_HISTORY'; payload: Song[] };

function playerReducer(state: PlayerState & { playlists: Playlist[]; favorites: Song[]; history: Song[] }, action: Action) {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return { ...state, currentSong: action.payload, isPlaying: true, isMiniPlayerVisible: true };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: action.payload ?? !state.isPlaying };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.payload] };
    case 'REMOVE_FROM_QUEUE':
      return { ...state, queue: state.queue.filter(s => s.videoId !== action.payload) };
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffle: !state.isShuffle };
    case 'TOGGLE_REPEAT':
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      return { ...state, repeatMode: modes[nextIndex] };
    case 'SET_SLEEP_TIMER':
      return { ...state, sleepTimer: action.payload };
    case 'TOGGLE_MINI_PLAYER':
      return { ...state, isMiniPlayerVisible: !state.isMiniPlayerVisible };
    case 'CLOSE_PLAYER':
      return { ...state, currentSong: null, isPlaying: false, isMiniPlayerVisible: false };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'UPDATE_PLAYLISTS':
      return { ...state, playlists: action.payload };
    case 'UPDATE_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'UPDATE_HISTORY':
      return { ...state, history: action.payload };
    default:
      return state;
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, {
    ...initialState,
    playlists: [],
    favorites: [],
    history: [],
  });

  // Sleep Timer Logic
  useEffect(() => {
    if (!state.sleepTimer) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'TOGGLE_PLAY', payload: false });
      dispatch({ type: 'SET_SLEEP_TIMER', payload: null });
    }, state.sleepTimer * 60 * 1000);

    return () => clearTimeout(timer);
  }, [state.sleepTimer]);

  // Load data from local storage
  useEffect(() => {
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    dispatch({ type: 'LOAD_DATA', payload: { playlists, favorites, history } });
  }, []);

  // Save data to local storage
  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(state.playlists));
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    localStorage.setItem('history', JSON.stringify(state.history));
  }, [state.playlists, state.favorites, state.history]);

  // Actions
  const playSong = (song: Song) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: song });
    addToHistory(song);
  };

  const togglePlay = () => dispatch({ type: 'TOGGLE_PLAY' });
  const setVolume = (vol: number) => dispatch({ type: 'SET_VOLUME', payload: vol });
  const toggleMute = () => dispatch({ type: 'TOGGLE_MUTE' });
  
  const nextSong = () => {
    if (state.queue.length === 0) return;
    const currentIndex = state.queue.findIndex(s => s.videoId === state.currentSong?.videoId);
    let nextIndex = currentIndex + 1;
    
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') nextIndex = 0;
      else return; // End of queue
    }
    
    playSong(state.queue[nextIndex]);
  };

  const prevSong = () => {
    if (state.queue.length === 0) return;
    const currentIndex = state.queue.findIndex(s => s.videoId === state.currentSong?.videoId);
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }
    
    playSong(state.queue[prevIndex]);
  };

  const addToQueue = (song: Song) => dispatch({ type: 'ADD_TO_QUEUE', payload: song });
  const removeFromQueue = (id: string) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id });
  const toggleShuffle = () => dispatch({ type: 'TOGGLE_SHUFFLE' });
  const toggleRepeat = () => dispatch({ type: 'TOGGLE_REPEAT' });
  const setSleepTimer = (min: number | null) => dispatch({ type: 'SET_SLEEP_TIMER', payload: min });
  const toggleMiniPlayer = () => dispatch({ type: 'TOGGLE_MINI_PLAYER' });
  const closePlayer = () => dispatch({ type: 'CLOSE_PLAYER' });

  // Playlist Actions
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      songs: [],
      createdAt: Date.now(),
    };
    dispatch({ type: 'UPDATE_PLAYLISTS', payload: [...state.playlists, newPlaylist] });
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    const updatedPlaylists = state.playlists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.videoId === song.videoId)) return p;
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    dispatch({ type: 'UPDATE_PLAYLISTS', payload: updatedPlaylists });
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = state.playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.videoId !== songId) };
      }
      return p;
    });
    dispatch({ type: 'UPDATE_PLAYLISTS', payload: updatedPlaylists });
  };

  const deletePlaylist = (playlistId: string) => {
    dispatch({ type: 'UPDATE_PLAYLISTS', payload: state.playlists.filter(p => p.id !== playlistId) });
  };

  const toggleFavorite = (song: Song) => {
    const isFav = state.favorites.some(s => s.videoId === song.videoId);
    let newFavs;
    if (isFav) {
      newFavs = state.favorites.filter(s => s.videoId !== song.videoId);
    } else {
      newFavs = [...state.favorites, song];
    }
    dispatch({ type: 'UPDATE_FAVORITES', payload: newFavs });
  };

  const addToHistory = (song: Song) => {
    const newHistory = [song, ...state.history.filter(s => s.videoId !== song.videoId)].slice(0, 50);
    dispatch({ type: 'UPDATE_HISTORY', payload: newHistory });
  };

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        setVolume,
        toggleMute,
        nextSong,
        prevSong,
        addToQueue,
        removeFromQueue,
        toggleShuffle,
        toggleRepeat,
        setSleepTimer,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        toggleFavorite,
        addToHistory,
        toggleMiniPlayer,
        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
