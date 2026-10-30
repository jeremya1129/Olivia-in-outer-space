import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Volume2, VolumeX, Sparkles, Bot, Smile } from 'lucide-react';

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

  playRobotBeep() {
    try {
      this.init();
      if (!this.ctx) return;
      // High-tech sci-fi dual blip: square/sawtooth wave jump for Astro-Bot droid
      [660, 1320, 990].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.045);
        gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.045 + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.045);
        osc.stop(this.ctx.currentTime + idx * 0.045 + 0.04);
      });
    } catch (e) {
      console.warn('Robot beep error:', e);
    }
  }

  playChildChime() {
    try {
      this.init();
      if (!this.ctx) return;
      // Sweet cheerful ascending chime for Captain Olivia & Navigator Anna
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.15);
      });
    } catch (e) {
      console.warn('Child chime error:', e);
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
  const [voiceMode, setVoiceMode] = useState(() => {
    try {
      return localStorage.getItem('olivia_voice_mode') || 'child';
    } catch {
      return 'child';
    }
  });
  const [voices, setVoices] = useState([]);

  // Load available system/browser voices dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Find best matched voice profile for the active mode
  const getVoiceForMode = useCallback(
    (mode) => {
      if (!voices || voices.length === 0) return null;

      const englishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
      const pool = englishVoices.length > 0 ? englishVoices : voices;

      if (mode === 'robot') {
        // 1. Look for OS novelty robot voices
        const noveltyRobot = pool.find((v) => {
          const name = v.name.toLowerCase();
          return name.includes('robot') || name.includes('zarvox') || name.includes('trinoids') || name.includes('fred');
        });
        if (noveltyRobot) return noveltyRobot;

        // 2. Look for deeper male or synthetic voices that sound great pitch-shifted down
        const deepVoice = pool.find((v) => {
          const name = v.name.toLowerCase();
          return (
            name.includes('david') ||
            name.includes('guy') ||
            name.includes('george') ||
            name.includes('alex') ||
            name.includes('daniel') ||
            (name.includes('male') && !name.includes('female'))
          );
        });
        if (deepVoice) return deepVoice;

        return pool[0];
      } else {
        // mode === 'child'
        // 1. Explicit child / kid voices (e.g. Microsoft Ana is specifically a child)
        const explicitChild = pool.find((v) => {
          const name = v.name.toLowerCase();
          return name.includes('ana') || name.includes('child') || name.includes('kid') || name.includes('junior') || name.includes('young');
        });
        if (explicitChild) return explicitChild;

        // 2. High-quality natural female voices which pitch-shift into sweet toddler voice
        const naturalFemale = pool.find((v) => {
          const name = v.name.toLowerCase();
          return name.includes('natural') && (name.includes('jenny') || name.includes('aria') || name.includes('female'));
        });
        if (naturalFemale) return naturalFemale;

        // 3. Clear female voices (Zira, Samantha, Victoria, Karen, Google US English)
        const standardFemale = pool.find((v) => {
          const name = v.name.toLowerCase();
          return (
            name.includes('zira') ||
            name.includes('samantha') ||
            name.includes('victoria') ||
            name.includes('karen') ||
            name.includes('google us') ||
            (name.includes('female') && !name.includes('male'))
          );
        });
        if (standardFemale) return standardFemale;

        return pool[0];
      }
    },
    [voices]
  );

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

  const triggerSynth = useCallback((key) => {
    if (isMuted) return;
    const lower = (key || '').toLowerCase();
    if (lower.includes('robot')) {
      synth.playRobotBeep();
    } else if (lower.includes('child')) {
      synth.playChildChime();
    } else if (lower.includes('chirp') || lower.includes('bird')) {
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
  }, [isMuted]);

  const speak = useCallback(
    (text, overrideMode) => {
      if (isMuted || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const activeMode = overrideMode || voiceMode;

      // Play signature cue sound before speech
      if (activeMode === 'robot') {
        synth.playRobotBeep();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = getVoiceForMode(activeMode);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      if (activeMode === 'robot') {
        // Robot Voice: steady, robotic cadence with low metallic resonance
        const isNoveltyRobot = selectedVoice && /(robot|zarvox|trinoids|fred)/i.test(selectedVoice.name);
        utterance.pitch = isNoveltyRobot ? 1.0 : 0.65;
        utterance.rate = 0.90;
      } else {
        // Child Voice: high pitch formant, energetic toddler pacing
        const isNativeChild = selectedVoice && /(ana|child|kid|junior)/i.test(selectedVoice.name);
        utterance.pitch = isNativeChild ? 1.15 : 1.50;
        utterance.rate = 1.04;
      }

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, voiceMode, getVoiceForMode]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakWord = useCallback(
    (word) => {
      if (isMuted || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      const selectedVoice = getVoiceForMode(voiceMode);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.pitch = voiceMode === 'robot' ? 0.7 : 1.5;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, voiceMode, getVoiceForMode]
  );

  const readStory = useCallback(
    (text, { onBoundary, onEnd, onStart, onError } = {}) => {
      if (isMuted || !('speechSynthesis' in window)) return null;
      window.speechSynthesis.cancel();

      if (voiceMode === 'robot') {
        synth.playRobotBeep();
      } else {
        synth.playChildChime();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = getVoiceForMode(voiceMode);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      if (voiceMode === 'robot') {
        const isNoveltyRobot = selectedVoice && /(robot|zarvox|trinoids|fred)/i.test(selectedVoice.name);
        utterance.pitch = isNoveltyRobot ? 1.0 : 0.65;
        utterance.rate = 0.88; // Measured reading pace for early readers
      } else {
        const isNativeChild = selectedVoice && /(ana|child|kid|junior)/i.test(selectedVoice.name);
        utterance.pitch = isNativeChild ? 1.15 : 1.48;
        utterance.rate = 0.94; // Clear, joyful storybook tempo
      }

      if (onBoundary) {
        utterance.onboundary = (e) => {
          if (e.name === 'word' || typeof e.charIndex === 'number') {
            onBoundary(e.charIndex, e.charLength);
          }
        };
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        setIsSpeaking(false);
        if (onError) onError(err);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    },
    [isMuted, voiceMode, getVoiceForMode]
  );

  const toggleVoiceMode = useCallback(() => {
    setVoiceMode((prev) => {
      const next = prev === 'child' ? 'robot' : 'child';
      try {
        localStorage.setItem('olivia_voice_mode', next);
      } catch (e) {
        // ignore storage errors
      }

      if (!isMuted) {
        if (next === 'robot') {
          synth.playRobotBeep();
          setTimeout(() => {
            speak('Robot voice activated! Beep boop!', 'robot');
          }, 80);
        } else {
          synth.playChildChime();
          setTimeout(() => {
            speak('Child voice activated! Captain Olivia and Navigator Anna ready for space!', 'child');
          }, 80);
        }
      }

      return next;
    });
  }, [isMuted, speak]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  return (
    <AudioContextState.Provider
      value={{
        isMuted,
        toggleMute,
        playTrackOrSfx,
        triggerSynth,
        speak,
        readStory,
        stopSpeaking,
        speakWord,
        isSpeaking,
        voiceMode,
        setVoiceMode,
        toggleVoiceMode,
      }}
    >
      {children}
    </AudioContextState.Provider>
  );
};

export default function AudioPlayer() {
  const { isMuted, toggleMute, triggerSynth, isSpeaking, voiceMode, toggleVoiceMode } = useSpaceAudio();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-900/80 border border-cyan-400/50 text-cyan-200 text-xs font-bold animate-pulse shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-[11px]">{voiceMode === 'robot' ? '🤖 Droid...' : '👧 Olivia...'}</span>
        </div>
      )}

      {/* Voice Mode Toggle Button (Action if pressed) */}
      <button
        onClick={toggleVoiceMode}
        aria-label={`Switch to ${voiceMode === 'robot' ? 'Child Voice' : 'Robot Voice'}`}
        title={`Switch to ${voiceMode === 'robot' ? 'Child Voice' : 'Robot Voice'}`}
        style={{ touchAction: 'manipulation' }}
        className={`cockpit-btn px-2 sm:px-2.5 py-1 rounded-xl flex items-center gap-1.5 border shadow-md transition-all text-xs font-black ${
          voiceMode === 'robot'
            ? 'bg-amber-950/90 hover:bg-amber-900 text-amber-200 border-amber-400/60'
            : 'bg-purple-950/90 hover:bg-purple-900 text-purple-200 border-purple-400/60'
        }`}
      >
        <span className="text-sm">{voiceMode === 'robot' ? '👧' : '🤖'}</span>
        <span className="hidden sm:inline">
          {voiceMode === 'robot' ? 'Child' : 'Robot'}
        </span>
      </button>

      {/* Master Mute / Unmute Button (Action if pressed) */}
      <button
        onClick={() => {
          toggleMute();
          if (isMuted) triggerSynth('beep');
        }}
        aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        style={{ touchAction: 'manipulation' }}
        className="cockpit-btn px-2 sm:px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-600 rounded-xl flex items-center gap-1.5 shadow-md text-xs font-bold"
      >
        {isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        <span className="text-[11px] font-black uppercase tracking-wider hidden md:inline">
          {isMuted ? 'Unmute' : 'Mute'}
        </span>
      </button>
    </div>
  );
}
