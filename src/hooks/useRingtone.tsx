import { useRef, useCallback } from 'react';

// Generate a ringtone using Web Audio API
const createRingtoneBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 2; // 2 seconds
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Create a phone-like ringtone pattern
  const frequencies = [440, 480]; // A4 and slightly higher - classic phone ring
  
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const ringPattern = Math.sin(2 * Math.PI * 20 * t) > 0 ? 1 : 0; // Ring pattern
    
    let sample = 0;
    for (const freq of frequencies) {
      sample += Math.sin(2 * Math.PI * freq * t) * 0.3;
    }
    
    // Apply envelope for each ring burst
    const burstDuration = 0.4;
    const silenceDuration = 0.2;
    const cycleTime = t % (burstDuration + silenceDuration);
    const envelope = cycleTime < burstDuration ? 
      Math.sin(Math.PI * cycleTime / burstDuration) : 0;
    
    data[i] = sample * envelope * ringPattern;
  }
  
  return buffer;
};

export const useRingtone = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRingtone = useCallback(async () => {
    // Stop any existing ringtone first
    if (isPlayingRef.current) {
      stopRingtone();
      // Wait a bit before starting new one
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      // Create ringtone buffer (cache it)
      if (!bufferRef.current) {
        bufferRef.current = await createRingtoneBuffer(audioContext);
      }
      const buffer = bufferRef.current;
      
      const playRing = () => {
        if (!audioContextRef.current || !isPlayingRef.current) return;
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.5;
        
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        source.start();
        sourceRef.current = source;
        gainNodeRef.current = gainNode;
      };
      
      isPlayingRef.current = true;
      playRing();
      
      // Loop the ringtone
      intervalRef.current = setInterval(() => {
        if (isPlayingRef.current) {
          playRing();
        }
      }, 2500); // Play every 2.5 seconds
      
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    // Clear any pending stop timeout
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    isPlayingRef.current = false;
    
    // Clear interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop all sources
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
      sourceRef.current = null;
    }

    // Mute gain node
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current?.currentTime || 0);
      } catch (e) {
        // Gain node might be disconnected
      }
      gainNodeRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      try {
        const context = audioContextRef.current;
        if (context.state !== 'closed') {
          // Resume context if suspended
          if (context.state === 'suspended') {
            context.resume().catch(() => {});
          }
          
          // Close the context
          context.close().catch(() => {});
        }
      } catch (e) {
        // Context might already be closed
      }
      audioContextRef.current = null;
    }

    // Clear buffer
    bufferRef.current = null;
  }, []);

  return { startRingtone, stopRingtone };
};
