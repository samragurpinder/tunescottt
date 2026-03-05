import type { VideoResult } from './services/youtubeService';

export interface Song extends VideoResult {
  addedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isMiniPlayerVisible: boolean;
  sleepTimer: number | null; // minutes
}

export type Mood = 'happy' | 'sad' | 'romantic' | 'focused' | 'energetic' | 'chill';
