import { useEffect, useRef, useState } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { usePlayer } from '../context/PlayerContext';
import { getRecommendations } from '../services/youtubeService';

export function GlobalPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    isMuted, 
    togglePlay, 
    nextSong,
    addToQueue,
    history,
    queue,
    playSong
  } = usePlayer();
  
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Sync Player with Context State
  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.setVolume(volume);
  }, [volume, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    if (isMuted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
    }
  }, [isMuted, isReady]);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsReady(true);
    event.target.setVolume(volume);
    if (isPlaying) event.target.playVideo();
  };

  const onStateChange: YouTubeProps['onStateChange'] = async (event) => {
    // 0 = Ended
    if (event.data === 0) {
      const currentIndex = queue.findIndex(s => s.videoId === currentSong.videoId);
      const isLast = currentIndex === queue.length - 1;

      if (isLast) {
        // We are at the end. Fetch recommendations.
        // Use current song and history for context
        const recommendations = await getRecommendations([currentSong, ...history]);
        
        if (recommendations.length > 0) {
          // Add all to queue
          recommendations.forEach(rec => addToQueue(rec));
          // Play the first new one immediately to continue playback
          playSong(recommendations[0]);
        }
      } else {
        // Just go to next song in queue
        nextSong();
      }
    }
    
    // 1 = Playing
    if (event.data === 1 && !isPlaying) {
       // Optional: Sync external play to context if needed
       // togglePlay(); 
    }
  };

  if (!currentSong) return null;

  return (
    <div className="hidden">
      <YouTube
        videoId={currentSong.videoId}
        opts={{
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
          },
        }}
        onReady={onPlayerReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
