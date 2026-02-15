import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: 'click' | 'success' | 'badge' | 'levelUp') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_STORAGE_KEY = 'aila_sound_enabled';

// Web Audio API sounds (lightweight, no external files needed)
const createSound = (type: 'click' | 'success' | 'badge' | 'levelUp'): void => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Very subtle, pleasant sounds
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
        
      case 'success':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
        
      case 'badge':
        // Magical chime sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1); // C#6
        oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.2); // E6
        oscillator.frequency.setValueAtTime(1760, audioContext.currentTime + 0.3); // A6
        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
        
      case 'levelUp':
        // Triumphant fanfare
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.45);
        gainNode.gain.setValueAtTime(0.07, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
        break;
    }
  } catch (e) {
    // Silently fail if audio is not supported
    console.log('Audio not supported');
  }
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false); // Disabled by default

  useEffect(() => {
    loadSoundPreference();
  }, []);

  const loadSoundPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(SOUND_STORAGE_KEY);
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    } catch (e) {
      console.error('Error loading sound preference:', e);
    }
  };

  const toggleSound = useCallback(async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      await AsyncStorage.setItem(SOUND_STORAGE_KEY, String(newValue));
      // Play a test sound when enabling
      if (newValue) {
        setTimeout(() => createSound('click'), 100);
      }
    } catch (e) {
      console.error('Error saving sound preference:', e);
    }
  }, [soundEnabled]);

  const playSound = useCallback((type: 'click' | 'success' | 'badge' | 'levelUp') => {
    if (soundEnabled) {
      createSound(type);
    }
  }, [soundEnabled]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    // Return a default implementation if not wrapped in provider
    return {
      soundEnabled: false,
      toggleSound: () => {},
      playSound: () => {},
    };
  }
  return context;
}
