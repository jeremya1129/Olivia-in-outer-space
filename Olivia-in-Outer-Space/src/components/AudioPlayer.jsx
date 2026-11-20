import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  createContext,
  useContext,
} from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import {
  detectLinuxPlatform,
  selectBestVoice,
  getSpeechProfile,
} from '../utils/voiceEngine';
import { parseStoryIntoSentences } from '../utils/readAlongTiming';

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
 * Routes all nodes through a masterGain node with smooth attack/release ramps
 * to avoid pops/clicks and allow instant mute silencing.
 */
class SynthesizedSoundFX {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this._noiseBuffer = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.muted ? 0.0001 : 1.0,
          this.ctx.currentTime
        );
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(
        Math.max(0.0001, this.masterGain.gain.value),
        now
      );
      this.masterGain.gain.linearRampToValueAtTime(
        this.muted ? 0.0001 : 1.0,
        now + 0.02
      );
    } catch {
      this.masterGain.gain.value = this.muted ? 0.0001 : 1.0;
    }
  }

  _getNoiseBuffer() {
    if (!this.ctx) return null;
    if (this._noiseBuffer && this._noiseBuffer.sampleRate === this.ctx.sampleRate) {
      return this._noiseBuffer;
    }
    const length = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this._noiseBuffer = buffer;
    return buffer;
  }

  /**
   * Schedules a sequence of oscillator tones using smooth attack/release envelopes.
   */
  _playNotes(
    freqs,
    { type = 'sine', volume = 0.12, step = 0.05, duration = 0.15, filterFreq = null } = {}
  ) {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    freqs.forEach((freq, idx) => {
      const start = now + idx * step;
      const attack = Math.min(0.008, duration * 0.25);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(volume, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      if (filterFreq) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, start);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + duration + 0.01);
    });
  }

  playBeep(freq = 520, duration = 0.12) {
    try {
      this._playNotes([freq], { type: 'sine', volume: 0.18, step: 0, duration });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playCountdownBeep(step = 3) {
    try {
      const freqMap = { 3: 440, 2: 554.37, 1: 659.25 };
      const freq = freqMap[step] || 440;
      this._playNotes([freq], { type: 'triangle', volume: 0.16, step: 0, duration: 0.16 });
    } catch (e) {
      console.warn('Countdown beep error:', e);
    }
  }

  playRobotBeep() {
    try {
      this._playNotes([740, 1180, 920], {
        type: 'sawtooth',
        volume: 0.08,
        step: 0.042,
        duration: 0.045,
        filterFreq: 2400,
      });
    } catch (e) {
      console.warn('Robot beep error:', e);
    }
  }

  playChildChime() {
    try {
      this._playNotes([523.25, 659.25, 783.99, 1046.5], {
        type: 'sine',
        volume: 0.12,
        step: 0.05,
        duration: 0.15,
      });
    } catch (e) {
      console.warn('Child chime error:', e);
    }
  }

  playTwinkle() {
    try {
      this._playNotes([659.25, 783.99, 1046.5, 1318.5], {
        type: 'triangle',
        volume: 0.14,
        step: 0.085,
        duration: 0.28,
      });
    } catch (e) {
      console.warn('Twinkle error:', e);
    }
  }

  playBirdChirp() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.muted) return;
      const base = this.ctx.currentTime;
      [1800, 2400, 2100].forEach((freq, idx) => {
        const start = base + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq + 400, start + 0.05);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.11, start + 0.007);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 0.06);
      });
    } catch (e) {
      console.warn('Bird chirp error:', e);
    }
  }

  playRoverBeep() {
    try {
      this._playNotes([440, 554.37, 659.25, 880], {
        type: 'square',
        volume: 0.075,
        step: 0.07,
        duration: 0.06,
        filterFreq: 2600,
      });
    } catch (e) {
      console.warn('Rover beep error:', e);
    }
  }

  playWhoosh() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.muted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.22);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.48);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.17, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('Whoosh error:', e);
    }
  }

  playBlastoff() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.muted) return;
      const now = this.ctx.currentTime;

      // 1. Sub-bass triangle rumble
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.9);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.22, now + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.92);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.95);

      // 2. Bandpass-filtered rocket thrust roar
      const noiseBuf = this._getNoiseBuffer();
      if (noiseBuf) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(480, now);
        filter.frequency.exponentialRampToValueAtTime(140, now + 0.92);
        filter.Q.setValueAtTime(1.2, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.94);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.96);
      }
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

  const isLinux = useMemo(() => detectLinuxPlatform(), []);
  const voicesRef = useRef([]);
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const voiceToggleTimeoutRef = useRef(null);
  const speakDelayTimerRef = useRef(null);
  const speechTokenRef = useRef(0);
  const activeUtterancesRef = useRef([]);
  const activePromiseResolveRef = useRef(null);
  const activeAudiosRef = useRef(new Set());

  const resolveVoices = useCallback(() => {
    if (voicesRef.current && voicesRef.current.length > 0) {
      return voicesRef.current;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const live = window.speechSynthesis.getVoices();
      if (live && live.length > 0) {
        voicesRef.current = live;
        return live;
      }
    }
    return [];
  }, []);

  const stopAllHtmlAudio = useCallback(() => {
    activeAudiosRef.current.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore audio cleanup errors
      }
    });
    activeAudiosRef.current.clear();
  }, []);

  const cancelSpeechInternal = useCallback(() => {
    if (speakDelayTimerRef.current) {
      clearTimeout(speakDelayTimerRef.current);
      speakDelayTimerRef.current = null;
    }
    if (activePromiseResolveRef.current) {
      const resolvePrev = activePromiseResolveRef.current;
      activePromiseResolveRef.current = null;
      resolvePrev();
    }
    activeUtterancesRef.current = [];

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    const ss = window.speechSynthesis;
    const wasActive = Boolean(ss && (ss.speaking || ss.pending));
    if (wasActive) {
      ss.cancel();
    }
    return wasActive;
  }, []);

  // Clean up any pending timers, HTML audio, or speech on unmount
  useEffect(() => {
    return () => {
      if (voiceToggleTimeoutRef.current) {
        clearTimeout(voiceToggleTimeoutRef.current);
      }
      speechTokenRef.current += 1;
      cancelSpeechInternal();
      stopAllHtmlAudio();
    };
  }, [cancelSpeechInternal, stopAllHtmlAudio]);

  // Load available system/browser voices dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        voicesRef.current = v;
        setVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  const getVoiceForMode = useCallback(
    (mode) => {
      const pool = voices.length > 0 ? voices : resolveVoices();
      const userLang =
        typeof navigator !== 'undefined' && navigator.language
          ? navigator.language
          : 'en-US';
      return selectBestVoice(pool, mode, userLang);
    },
    [voices, resolveVoices]
  );

  const triggerSynth = useCallback(
    (key) => {
      if (isMutedRef.current) return;
      const lower = (key || '').toLowerCase();
      if (lower.includes('countdown_3')) {
        synth.playCountdownBeep(3);
      } else if (lower.includes('countdown_2')) {
        synth.playCountdownBeep(2);
      } else if (lower.includes('countdown_1')) {
        synth.playCountdownBeep(1);
      } else if (lower.includes('robot')) {
        synth.playRobotBeep();
      } else if (lower.includes('child')) {
        synth.playChildChime();
      } else if (lower.includes('chirp') || lower.includes('bird')) {
        synth.playBirdChirp();
      } else if (lower.includes('twinkle') || lower.includes('chime')) {
        synth.playTwinkle();
      } else if (lower.includes('rover') || lower.includes('beep')) {
        synth.playRoverBeep();
      } else if (
        lower.includes('whoosh') ||
        lower.includes('hula') ||
        lower.includes('spin')
      ) {
        synth.playWhoosh();
      } else if (lower.includes('blastoff') || lower.includes('rocket')) {
        synth.playBlastoff();
      } else {
        synth.playBeep();
      }
    },
    []
  );

  // Plays an audio file with procedural synth fallback
  const playTrackOrSfx = useCallback(
    (audioPath, fallbackKey) => {
      if (isMutedRef.current) return;

      const isAudioFile =
        typeof audioPath === 'string' &&
        /\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i.test(audioPath);
      if (isAudioFile) {
        const audio = new Audio(getAssetUrl(audioPath));
        activeAudiosRef.current.add(audio);
        const cleanup = () => activeAudiosRef.current.delete(audio);
        audio.addEventListener('ended', cleanup, { once: true });
        audio.addEventListener('error', cleanup, { once: true });
        audio.play().catch(() => {
          cleanup();
          triggerSynth(fallbackKey || audioPath);
        });
        return;
      }

      triggerSynth(fallbackKey || audioPath);
    },
    [triggerSynth]
  );

  const speak = useCallback(
    (text, optionsOrMode) => {
      if (
        isMutedRef.current ||
        !text ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        return { token: null, promise: Promise.resolve() };
      }

      const options =
        typeof optionsOrMode === 'string'
          ? { mode: optionsOrMode }
          : optionsOrMode || {};
      const activeMode = options.mode || voiceMode;
      const shouldPlayCue = options.playCue ?? activeMode === 'robot';

      const token = ++speechTokenRef.current;
      const wasActive = cancelSpeechInternal();

      const selectedVoice = getVoiceForMode(activeMode);
      const profile = getSpeechProfile(activeMode, selectedVoice, 'speak', isLinux);

      if (shouldPlayCue) {
        synth.playRobotBeep();
      }
      const delayMs = shouldPlayCue ? 155 : wasActive ? 45 : 0;

      const promise = new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (activePromiseResolveRef.current === finish) {
            activePromiseResolveRef.current = null;
          }
          resolve();
        };
        activePromiseResolveRef.current = finish;

        const startUtterance = () => {
          speakDelayTimerRef.current = null;
          if (speechTokenRef.current !== token || isMutedRef.current) {
            finish();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(text);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          utterance.lang = selectedVoice?.lang || 'en-US';
          utterance.pitch = profile.pitch;
          utterance.rate = profile.rate;

          activeUtterancesRef.current = [utterance];
          let started = false;

          utterance.onstart = () => {
            if (speechTokenRef.current !== token || started) return;
            started = true;
            setIsSpeaking(true);
            options.onStart?.();
          };

          utterance.onend = () => {
            if (speechTokenRef.current !== token) {
              finish();
              return;
            }
            activeUtterancesRef.current = [];
            setIsSpeaking(false);
            options.onEnd?.();
            finish();
          };

          utterance.onerror = () => {
            if (speechTokenRef.current !== token) {
              finish();
              return;
            }
            activeUtterancesRef.current = [];
            setIsSpeaking(false);
            finish();
          };

          setIsSpeaking(true);
          window.speechSynthesis.speak(utterance);
        };

        if (delayMs > 0) {
          speakDelayTimerRef.current = setTimeout(startUtterance, delayMs);
        } else {
          startUtterance();
        }
      });

      return { token, promise };
    },
    [voiceMode, getVoiceForMode, isLinux, cancelSpeechInternal]
  );

  const stopSpeaking = useCallback(
    (onlyToken) => {
      if (onlyToken !== undefined && speechTokenRef.current !== onlyToken) {
        return;
      }
      speechTokenRef.current += 1;
      cancelSpeechInternal();
      setIsSpeaking(false);
    },
    [cancelSpeechInternal]
  );

  const speakWord = useCallback(
    (word) => {
      if (
        isMutedRef.current ||
        !word ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        return { token: null, promise: Promise.resolve() };
      }

      const token = ++speechTokenRef.current;
      const wasActive = cancelSpeechInternal();
      const selectedVoice = getVoiceForMode(voiceMode);
      const profile = getSpeechProfile(voiceMode, selectedVoice, 'word', isLinux);
      const delayMs = wasActive ? 45 : 0;

      const promise = new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (activePromiseResolveRef.current === finish) {
            activePromiseResolveRef.current = null;
          }
          resolve();
        };
        activePromiseResolveRef.current = finish;

        const startWord = () => {
          speakDelayTimerRef.current = null;
          if (speechTokenRef.current !== token || isMutedRef.current) {
            finish();
            return;
          }
          const utterance = new SpeechSynthesisUtterance(word);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          utterance.lang = selectedVoice?.lang || 'en-US';
          utterance.pitch = profile.pitch;
          utterance.rate = profile.rate;

          activeUtterancesRef.current = [utterance];
          utterance.onend = () => {
            if (speechTokenRef.current === token) {
              activeUtterancesRef.current = [];
              setIsSpeaking(false);
            }
            finish();
          };
          utterance.onerror = () => {
            if (speechTokenRef.current === token) {
              activeUtterancesRef.current = [];
              setIsSpeaking(false);
            }
            finish();
          };

          setIsSpeaking(true);
          window.speechSynthesis.speak(utterance);
        };

        if (delayMs > 0) {
          speakDelayTimerRef.current = setTimeout(startWord, delayMs);
        } else {
          startWord();
        }
      });

      return { token, promise };
    },
    [voiceMode, getVoiceForMode, isLinux, cancelSpeechInternal]
  );

  const readStory = useCallback(
    (
      text,
      {
        startSentenceIndex = 0,
        playCue = true,
        onBoundary,
        onSentenceStart,
        onSentenceEnd,
        onEnd,
        onStart,
        onError,
      } = {}
    ) => {
      if (
        isMutedRef.current ||
        !text ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        return null;
      }

      const sentences = parseStoryIntoSentences(text);
      if (sentences.length === 0) return null;

      const safeStartIdx = Math.max(
        0,
        Math.min(startSentenceIndex, sentences.length - 1)
      );

      const token = ++speechTokenRef.current;
      const wasActive = cancelSpeechInternal();

      const selectedVoice = getVoiceForMode(voiceMode);
      const profile = getSpeechProfile(voiceMode, selectedVoice, 'story', isLinux);

      if (playCue) {
        if (voiceMode === 'robot') {
          synth.playRobotBeep();
        } else {
          synth.playChildChime();
        }
      }

      const delayMs = playCue ? 160 : wasActive ? 45 : 0;
      let startedOnce = false;

      const speakSentence = (sIdx) => {
        speakDelayTimerRef.current = null;
        if (speechTokenRef.current !== token || isMutedRef.current) {
          return;
        }
        if (sIdx >= sentences.length) {
          activeUtterancesRef.current = [];
          setIsSpeaking(false);
          onEnd?.();
          return;
        }

        const sentence = sentences[sIdx];
        const utterance = new SpeechSynthesisUtterance(sentence.text);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.lang = selectedVoice?.lang || 'en-US';
        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;

        activeUtterancesRef.current = [utterance];
        let sentenceStarted = false;

        utterance.onstart = () => {
          if (speechTokenRef.current !== token || sentenceStarted) return;
          sentenceStarted = true;
          setIsSpeaking(true);
          if (!startedOnce) {
            startedOnce = true;
            onStart?.();
          }
          onSentenceStart?.(sIdx, sentence);
        };

        if (onBoundary) {
          utterance.onboundary = (e) => {
            if (speechTokenRef.current !== token) return;
            if ((e.name === 'word' || !e.name) && typeof e.charIndex === 'number') {
              onBoundary(sentence.startCharOffset + e.charIndex, e.charLength);
            }
          };
        }

        utterance.onend = () => {
          if (speechTokenRef.current !== token) return;
          onSentenceEnd?.(sIdx, sentence);
          speakSentence(sIdx + 1);
        };

        utterance.onerror = (err) => {
          if (speechTokenRef.current !== token) return;
          if (err?.error === 'canceled' || err?.error === 'interrupted') {
            return;
          }
          activeUtterancesRef.current = [];
          setIsSpeaking(false);
          onError?.(err);
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      };

      if (delayMs > 0) {
        speakDelayTimerRef.current = setTimeout(
          () => speakSentence(safeStartIdx),
          delayMs
        );
      } else {
        speakSentence(safeStartIdx);
      }

      return {
        token,
        rate: profile.rate,
        isLocalVoice: Boolean(selectedVoice?.localService),
      };
    },
    [voiceMode, getVoiceForMode, isLinux, cancelSpeechInternal]
  );

  const toggleVoiceMode = useCallback(() => {
    const next = voiceMode === 'child' ? 'robot' : 'child';
    setVoiceMode(next);

    try {
      localStorage.setItem('olivia_voice_mode', next);
    } catch {
      // ignore storage errors
    }

    if (voiceToggleTimeoutRef.current) {
      clearTimeout(voiceToggleTimeoutRef.current);
      voiceToggleTimeoutRef.current = null;
    }

    if (!isMutedRef.current) {
      if (next === 'robot') {
        synth.playRobotBeep();
        voiceToggleTimeoutRef.current = setTimeout(() => {
          speak('Robot voice activated! Beep boop!', {
            mode: 'robot',
            playCue: false,
          });
        }, 160);
      } else {
        synth.playChildChime();
        voiceToggleTimeoutRef.current = setTimeout(() => {
          speak(
            'Child voice activated! Captain Olivia and Navigator Anna ready for space!',
            { mode: 'child', playCue: false }
          );
        }, 160);
      }
    }
  }, [voiceMode, speak]);

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;
    setIsMuted(next);
    synth.setMuted(next);

    if (next) {
      if (voiceToggleTimeoutRef.current) {
        clearTimeout(voiceToggleTimeoutRef.current);
        voiceToggleTimeoutRef.current = null;
      }
      stopAllHtmlAudio();
      speechTokenRef.current += 1;
      cancelSpeechInternal();
      setIsSpeaking(false);
    } else {
      synth.playBeep();
    }
  }, [cancelSpeechInternal, stopAllHtmlAudio]);

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
      toggleVoiceMode,
    ]
  );

  return (
    <AudioContextState.Provider value={contextValue}>
      {children}
    </AudioContextState.Provider>
  );
};

export default function AudioPlayer() {
  const { isMuted, toggleMute, isSpeaking, voiceMode, toggleVoiceMode } =
    useSpaceAudio();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Speaking Indicator with animated mini equalizer */}
      {isSpeaking && (
        <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-900/80 border border-cyan-400/50 text-cyan-200 text-xs font-bold shadow-sm">
          <div className="flex items-end gap-[2px] h-3" aria-hidden="true">
            <span
              className="w-[3px] bg-yellow-300 rounded-full animate-eq-bar"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-[3px] bg-cyan-300 rounded-full animate-eq-bar"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-[3px] bg-yellow-300 rounded-full animate-eq-bar"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="text-[11px]">
            {voiceMode === 'robot' ? '🤖 Droid...' : '👧 Olivia...'}
          </span>
        </div>
      )}

      {/* Voice Mode Toggle Button (Action if pressed) */}
      <button
        type="button"
        onClick={toggleVoiceMode}
        aria-label={`Switch to ${
          voiceMode === 'robot' ? 'Child Voice' : 'Robot Voice'
        }`}
        title={`Switch to ${
          voiceMode === 'robot' ? 'Child Voice' : 'Robot Voice'
        }`}
        style={{ touchAction: 'manipulation' }}
        className={`cockpit-btn min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 border shadow-md transition-all text-xs font-black ${
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
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        style={{ touchAction: 'manipulation' }}
        className="cockpit-btn min-h-[40px] min-w-[40px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-600 rounded-xl flex items-center justify-center gap-1.5 shadow-md text-xs font-bold"
      >
        {isMuted ? (
          <Volume2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <VolumeX className="w-4 h-4 text-slate-400" />
        )}
        <span className="text-[11px] font-black uppercase tracking-wider hidden md:inline">
          {isMuted ? 'Unmute' : 'Mute'}
        </span>
      </button>
    </div>
  );
}
