import React, { useState, useCallback, createContext, useContext } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

const AudioContextState = createContext(null);

export const useSpaceAudio = () => {
  const context = useContext(AudioContextState);
  if (!context) {
    throw new Error('useSpaceAudio must be used within an AudioProvider');
  }
  return context;
};

/**
 * Procedural Web Audio API synthesizer for toddler-friendly sensory sound effects.
 * Acts as an instant fallback when recorded audio files are not yet present on disk!
 */
class SynthesizedSoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 520, duration = 0.12) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playTwinkle() {
    try {
      this.init();
      if (!this.ctx) return;
      [659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.3);
      });
    } catch (e) {
      console.warn('Twinkle error:', e);
    }
  }

  playBirdChirp() {
    try {
      this.init();
      if (!this.ctx) return;
      [1800, 2400, 2100].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        osc.frequency.exponentialRampToValueAtTime(freq + 400, this.ctx.currentTime + idx * 0.06 + 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.05);
      });
    } catch (e) {
      console.warn('Bird chirp error:', e);
    }
  }

  playRoverBeep() {
    try {
      this.init();
      if (!this.ctx) return;
      [440, 554, 659, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.06);
      });
    } catch (e) {
      console.warn('Rover beep error:', e);
    }
  }

  playWhoosh() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.25);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Whoosh error:', e);
    }
  }

  playBlastoff() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Blastoff error:', e);
    }
  }
}

const synth = new SynthesizedSoundFX();

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Plays an audio file with procedural synth fallback
  const playTrackOrSfx = useCallback((audioPath, fallbackKey) => {
    if (isMuted) return;

    if (audioPath) {
      const audio = new Audio(audioPath);
      audio.play().catch(() => {
        // Fall back to synth sound if file is not found
        triggerSynth(fallbackKey || audioPath);
      });
      return;
    }

    triggerSynth(fallbackKey);
  }, [isMuted]);

  const triggerSynth = (key) => {
    if (isMuted) return;
    const lower = (key || '').toLowerCase();
    if (lower.includes('chirp') || lower.includes('bird')) {
      synth.playBirdChirp();
    } else if (lower.includes('twinkle') || lower.includes('chime')) {
      synth.playTwinkle();
    } else if (lower.includes('rover') || lower.includes('beep')) {
      synth.playRoverBeep();
    } else if (lower.includes('whoosh') || lower.includes('hula') || lower.includes('spin')) {
      synth.playWhoosh();
    } else if (lower.includes('blastoff') || lower.includes('rocket')) {
      synth.playBlastoff();
    } else {
      synth.playBeep();
    }
  };

  const speak = useCallback((text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Cheerful toddler-friendly cadence
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (next && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  return (
    <AudioContextState.Provider value={{ isMuted, toggleMute, playTrackOrSfx, triggerSynth, speak, isSpeaking }}>
      {children}
    </AudioContextState.Provider>
  );
};

export default function AudioPlayer() {
  const { isMuted, toggleMute, triggerSynth, isSpeaking } = useSpaceAudio();

  return (
    <div className="flex items-center gap-2">
      {isSpeaking && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/70 border border-cyan-400/40 text-cyan-200 text-xs font-bold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Listening...</span>
        </div>
      )}
      <button
        onClick={() => {
          toggleMute();
          if (isMuted) triggerSynth('beep');
        }}
        aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        className="cockpit-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-600 rounded-xl flex items-center gap-1.5 shadow-md"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        <span className="text-xs font-bold uppercase tracking-wider">{isMuted ? 'Muted' : 'Audio On'}</span>
      </button>
    </div>
  );
}
