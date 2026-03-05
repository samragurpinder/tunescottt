import { useState, useEffect } from 'react';
import { Sparkles, Flame, Smile, Frown, Heart, Zap, Coffee, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { getTrendingSongs, getMoodPlaylist, type VideoResult } from '../services/youtubeService';
import { VideoCard } from './VideoCard';

interface DiscoveryProps {
  onSelectVideo: (video: VideoResult) => void;
}

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'energetic', label: 'Energetic', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'focused', label: 'Focused', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'chill', label: 'Chill', icon: Moon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export function Discovery({ onSelectVideo }: DiscoveryProps) {
  const [trending, setTrending] = useState<VideoResult[]>([]);
  const [moodResults, setMoodResults] = useState<VideoResult[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setIsLoading(true);
    const results = await getTrendingSongs();
    setTrending(results);
    setIsLoading(false);
  };

  const handleMoodSelect = async (moodId: string) => {
    if (selectedMood === moodId) {
      setSelectedMood(null);
      setMoodResults([]);
      return;
    }
    
    setSelectedMood(moodId);
    setIsLoading(true);
    const results = await getMoodPlaylist(moodId);
    setMoodResults(results);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      
      {/* Mood Selector */}
      <section>
        <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Vibe Check
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;
            
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
                  isSelected 
                    ? `bg-white/10 border-white/20 scale-105 shadow-xl` 
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:scale-105"
                )}
              >
                <div className={cn("p-3 rounded-full mb-3", mood.bg)}>
                  <Icon className={cn("w-6 h-6", mood.color)} />
                </div>
                <span className="text-sm font-medium text-white/80">{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mood Results */}
        {selectedMood && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8"
          >
            <h3 className="text-lg font-medium text-white/60 mb-4 capitalize">
              {selectedMood} Vibes
            </h3>
            {isLoading && moodResults.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {moodResults.map((video, idx) => (
                  <VideoCard 
                    key={video.videoId} 
                    video={video} 
                    index={idx} 
                    onSelect={onSelectVideo} 
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Trending Section */}
      <section>
        <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Trending Now
        </h2>
        
        {isLoading && trending.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trending.map((video, idx) => (
              <VideoCard 
                key={video.videoId} 
                video={video} 
                index={idx} 
                onSelect={onSelectVideo} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Helper for className merging since we can't import utils inside this file easily if we don't have it
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
