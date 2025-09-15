import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/authentication';

type AudioType = 'flip-card' | 'game-over' | 'cashout';

export const useAudio = () => {
  const { soundEnabled } = useAuth();
  const audioRefs = useRef<Record<AudioType, HTMLAudioElement | null>>({
    'flip-card': null,
    'game-over': null,
    'cashout': null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio files
  useEffect(() => {
    const audioFiles: Record<AudioType, string> = {
      'flip-card': '/audio/flip-card.wav',
      'game-over': '/audio/game-over.wav',
      'cashout': '/audio/cashout.wav',
    };

    const currentAudioElements: HTMLAudioElement[] = [];

    // Create audio elements
    Object.entries(audioFiles).forEach(([type, src]) => {
      try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0.7;
        audioRefs.current[type as AudioType] = audio;
        currentAudioElements.push(audio);
        
        // Log when audio loads successfully
        audio.addEventListener('canplaythrough', () => {
          console.log(`Audio loaded: ${type}`);
        });
        
        audio.addEventListener('error', (e) => {
          console.error(`Failed to load audio: ${type}`, e);
        });
      } catch (error) {
        console.error(`Error creating audio for ${type}:`, error);
      }
    });

    setIsInitialized(true);
    console.log('Audio system initialized');

    return () => {
      // Cleanup using the captured array
      currentAudioElements.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  // Handle document visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause all audio when document becomes hidden
        Object.values(audioRefs.current).forEach((audio) => {
          if (audio && !audio.paused) {
            audio.pause();
          }
        });
      }
    };

    const handleBeforeUnload = () => {
      // Stop all audio before page unload
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Play audio function
  const playAudio = (type: AudioType, options?: { volume?: number; delay?: number }) => {
    console.log(`Attempting to play audio: ${type}, soundEnabled: ${soundEnabled}, isInitialized: ${isInitialized}`);
    
    // Check if we should play audio
    if (!soundEnabled) {
      console.log('Sound is disabled');
      return;
    }

    if (!isInitialized) {
      console.log('Audio not initialized yet');
      return;
    }

    if (document.hidden) {
      console.log('Document is hidden, not playing audio');
      return;
    }

    const audio = audioRefs.current[type];
    if (!audio) {
      console.warn(`Audio element not found: ${type}`);
      return;
    }

    const playSound = () => {
      try {
        // Reset audio to beginning
        audio.currentTime = 0;
        
        // Set volume if provided
        if (options?.volume !== undefined) {
          audio.volume = Math.max(0, Math.min(1, options.volume));
        }

        console.log(`Playing audio: ${type}`);
        
        // Play the audio
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Audio played successfully: ${type}`);
            })
            .catch(error => {
              console.error(`Audio play failed: ${type}`, error);
            });
        }
      } catch (error) {
        console.error(`Failed to play audio: ${type}`, error);
      }
    };

    // Play immediately or with delay
    if (options?.delay) {
      setTimeout(playSound, options.delay);
    } else {
      playSound();
    }
  };

  // Stop all audio function
  const stopAllAudio = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  };

  // Set volume for all audio
  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.volume = clampedVolume;
      }
    });
  };

  return {
    playAudio,
    stopAllAudio,
    setVolume,
    isInitialized,
    soundEnabled,
  };
};
