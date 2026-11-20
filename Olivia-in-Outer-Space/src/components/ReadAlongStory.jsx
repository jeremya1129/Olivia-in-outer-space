import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { getStoryForBody } from '../data/planetStories';
import {
  tokenizeWords,
  parseStoryIntoSentences,
  estimateWordDurations,
  computeSentenceExpectedMs,
  clampSpeedScale,
  findWordIndexByChar,
  findSentenceIndexByWord,
} from '../utils/readAlongTiming';
import {
  BookOpen,
  RotateCcw,
  Sparkles,
  Pause,
  Play,
  Star,
} from 'lucide-react';

export default function ReadAlongStory({ body, className = '' }) {
  const {
    readStory,
    stopSpeaking,
    speakWord,
    triggerSynth,
    isMuted,
    voiceMode,
  } = useSpaceAudio();

  const story = useMemo(
    () => getStoryForBody(body?.id, body?.name),
    [body?.id, body?.name]
  );

  const words = useMemo(() => tokenizeWords(story?.text), [story?.text]);
  const sentences = useMemo(
    () => parseStoryIntoSentences(story?.text),
    [story?.text]
  );

  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tappedWordId, setTappedWordId] = useState(null);
  const [highlightedSightWord, setHighlightedSightWord] = useState(null);

  const playbackSessionRef = useRef(0);
  const storySpeechTokenRef = useRef(null);
  const wordTimerRef = useRef(null);
  const watchdogTimerRef = useRef(null);
  const startupTimerRef = useRef(null);
  const tapTimeoutRef = useRef(null);

  const pausedSentenceRef = useRef(0);
  const speedScaleRef = useRef(1.0);
  const sentenceStartTimeRef = useRef(0);
  const baseDurationsRef = useRef([]);
  const activeWordIndexRef = useRef(-1);
  const hasNativeBoundariesInSentenceRef = useRef(false);

  const stopSpeakingRef = useRef(stopSpeaking);
  stopSpeakingRef.current = stopSpeaking;
  const triggerSynthRef = useRef(triggerSynth);
  triggerSynthRef.current = triggerSynth;

  const clearAllPlaybackTimers = () => {
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (startupTimerRef.current) {
      clearTimeout(startupTimerRef.current);
      startupTimerRef.current = null;
    }
  };

  // Reset state and stop ONLY story-owned speech on body switch or unmount
  useEffect(() => {
    playbackSessionRef.current += 1;
    clearAllPlaybackTimers();
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
    if (storySpeechTokenRef.current != null) {
      stopSpeakingRef.current(storySpeechTokenRef.current);
      storySpeechTokenRef.current = null;
    }
    pausedSentenceRef.current = 0;
    speedScaleRef.current = 1.0;
    activeWordIndexRef.current = -1;
    setActiveWordIndex(-1);
    setTappedWordId(null);
    setHighlightedSightWord(null);
    setIsPlaying(false);
    setIsPaused(false);
    setIsFinished(false);

    return () => {
      playbackSessionRef.current += 1;
      clearAllPlaybackTimers();
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      if (storySpeechTokenRef.current != null) {
        stopSpeakingRef.current(storySpeechTokenRef.current);
        storySpeechTokenRef.current = null;
      }
    };
  }, [body?.id]);

  // Weighted recursive word timer bounded to a sentence span (or full story in visual fallback)
  const scheduleFromWord = (
    wordIdx,
    endWordIndex,
    sessionId,
    autoCompleteOnEnd
  ) => {
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    if (playbackSessionRef.current !== sessionId) return;

    if (wordIdx > endWordIndex || wordIdx >= words.length) {
      if (autoCompleteOnEnd) {
        storySpeechTokenRef.current = null;
        activeWordIndexRef.current = -1;
        pausedSentenceRef.current = 0;
        setActiveWordIndex(-1);
        setIsPlaying(false);
        setIsPaused(false);
        setIsFinished(true);
        triggerSynthRef.current(story.actionSound || 'twinkle');
      }
      return;
    }

    activeWordIndexRef.current = wordIdx;
    setActiveWordIndex(wordIdx);

    const rawDuration = baseDurationsRef.current[wordIdx] || 360;
    const durationMs = Math.max(
      120,
      Math.round(rawDuration * speedScaleRef.current)
    );

    if (wordIdx < endWordIndex) {
      wordTimerRef.current = setTimeout(() => {
        scheduleFromWord(
          wordIdx + 1,
          endWordIndex,
          sessionId,
          autoCompleteOnEnd
        );
      }, durationMs);
    } else if (autoCompleteOnEnd) {
      wordTimerRef.current = setTimeout(() => {
        if (playbackSessionRef.current !== sessionId) return;
        storySpeechTokenRef.current = null;
        activeWordIndexRef.current = -1;
        pausedSentenceRef.current = 0;
        setActiveWordIndex(-1);
        setIsPlaying(false);
        setIsPaused(false);
        setIsFinished(true);
        triggerSynthRef.current(story.actionSound || 'twinkle');
      }, durationMs);
    }
  };

  const handlePauseStory = () => {
    playbackSessionRef.current += 1;
    clearAllPlaybackTimers();
    pausedSentenceRef.current = findSentenceIndexByWord(
      sentences,
      activeWordIndexRef.current
    );
    if (storySpeechTokenRef.current != null) {
      stopSpeaking(storySpeechTokenRef.current);
      storySpeechTokenRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(true);
  };

  // Start or resume reading the story with hybrid boundary + syllable-weighted pacing
  const handlePlayStory = (forceFromStart = false) => {
    if (isPlaying && !forceFromStart) {
      handlePauseStory();
      return;
    }

    const startSentenceIdx =
      !forceFromStart && isPaused && !isFinished
        ? Math.min(pausedSentenceRef.current, Math.max(0, sentences.length - 1))
        : 0;

    if (startSentenceIdx === 0) {
      speedScaleRef.current = 1.0;
      pausedSentenceRef.current = 0;
    }

    const sessionId = ++playbackSessionRef.current;
    clearAllPlaybackTimers();
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    setTappedWordId(null);
    setHighlightedSightWord(null);

    if (words.length === 0) {
      storySpeechTokenRef.current = null;
      setIsPlaying(false);
      setIsPaused(false);
      setIsFinished(true);
      return;
    }

    const startWordIdx = sentences[startSentenceIdx]?.startWordIndex ?? 0;
    activeWordIndexRef.current = startWordIdx;
    setActiveWordIndex(startWordIdx);
    setIsPlaying(true);
    setIsPaused(false);
    setIsFinished(false);

    const defaultRate = voiceMode === 'robot' ? 0.88 : 0.92;
    baseDurationsRef.current = estimateWordDurations(words, defaultRate);

    // If muted or speechSynthesis unavailable, run weighted visual pacing to completion
    if (
      isMuted ||
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      storySpeechTokenRef.current = null;
      scheduleFromWord(startWordIdx, words.length - 1, sessionId, true);
      return;
    }

    let activeSentenceIdx = startSentenceIdx;

    const speechResult = readStory(story.text, {
      startSentenceIndex: startSentenceIdx,
      playCue: startSentenceIdx === 0,
      onStart: () => {
        if (playbackSessionRef.current !== sessionId) return;
        if (startupTimerRef.current) {
          clearTimeout(startupTimerRef.current);
          startupTimerRef.current = null;
        }
        setIsPlaying(true);
      },
      onSentenceStart: (sIdx, sentence) => {
        if (playbackSessionRef.current !== sessionId) return;
        if (startupTimerRef.current) {
          clearTimeout(startupTimerRef.current);
          startupTimerRef.current = null;
        }
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }
        activeSentenceIdx = sIdx;
        pausedSentenceRef.current = sIdx;
        hasNativeBoundariesInSentenceRef.current = false;
        sentenceStartTimeRef.current =
          typeof performance !== 'undefined' ? performance.now() : Date.now();
        scheduleFromWord(
          sentence.startWordIndex,
          sentence.endWordIndex,
          sessionId,
          false
        );
      },
      onBoundary: (charIndex) => {
        if (playbackSessionRef.current !== sessionId) return;
        const idx = findWordIndexByChar(words, charIndex);
        if (idx < 0) return;

        const curSentence = sentences[activeSentenceIdx];
        if (
          hasNativeBoundariesInSentenceRef.current &&
          idx < activeWordIndexRef.current &&
          curSentence &&
          idx >= curSentence.startWordIndex
        ) {
          return;
        }

        hasNativeBoundariesInSentenceRef.current = true;
        if (wordTimerRef.current) {
          clearTimeout(wordTimerRef.current);
          wordTimerRef.current = null;
        }
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }

        activeWordIndexRef.current = idx;
        setActiveWordIndex(idx);

        const endIdx = curSentence
          ? curSentence.endWordIndex
          : words.length - 1;
        if (idx < endIdx) {
          const waitMs = Math.max(
            1100,
            Math.round(
              (baseDurationsRef.current[idx] || 360) *
                speedScaleRef.current *
                2.2
            )
          );
          watchdogTimerRef.current = setTimeout(() => {
            if (playbackSessionRef.current !== sessionId) return;
            scheduleFromWord(idx + 1, endIdx, sessionId, false);
          }, waitMs);
        }
      },
      onSentenceEnd: (sIdx, sentence) => {
        if (playbackSessionRef.current !== sessionId) return;
        if (wordTimerRef.current) {
          clearTimeout(wordTimerRef.current);
          wordTimerRef.current = null;
        }
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }
        const now =
          typeof performance !== 'undefined' ? performance.now() : Date.now();
        const actualMs = now - sentenceStartTimeRef.current;
        const expectedMs = computeSentenceExpectedMs(
          baseDurationsRef.current,
          sentence.startWordIndex,
          sentence.endWordIndex
        );
        if (actualMs > 300 && expectedMs > 300) {
          const measured = actualMs / expectedMs;
          speedScaleRef.current = clampSpeedScale(
            speedScaleRef.current * 0.35 + measured * 0.65
          );
        }
      },
      onEnd: () => {
        if (playbackSessionRef.current !== sessionId) return;
        clearAllPlaybackTimers();
        storySpeechTokenRef.current = null;
        activeWordIndexRef.current = -1;
        pausedSentenceRef.current = 0;
        setActiveWordIndex(-1);
        setIsPlaying(false);
        setIsPaused(false);
        setIsFinished(true);
        triggerSynthRef.current(story.actionSound || 'twinkle');
      },
      onError: (err) => {
        if (playbackSessionRef.current !== sessionId) return;
        if (err?.error === 'canceled' || err?.error === 'interrupted') return;
        if (startupTimerRef.current) {
          clearTimeout(startupTimerRef.current);
          startupTimerRef.current = null;
        }
        storySpeechTokenRef.current = null;
        const resumeFrom = Math.max(startWordIdx, activeWordIndexRef.current);
        scheduleFromWord(resumeFrom, words.length - 1, sessionId, true);
      },
    });

    if (!speechResult) {
      storySpeechTokenRef.current = null;
      scheduleFromWord(startWordIdx, words.length - 1, sessionId, true);
      return;
    }

    storySpeechTokenRef.current = speechResult.token;
    baseDurationsRef.current = estimateWordDurations(words, speechResult.rate);

    // Startup watchdog: gracefully fall back if browser TTS fails to emit onstart
    startupTimerRef.current = setTimeout(() => {
      if (playbackSessionRef.current !== sessionId) return;
      storySpeechTokenRef.current = null;
      scheduleFromWord(startWordIdx, words.length - 1, sessionId, true);
    }, 1400);
  };

  const handleReplayStory = () => {
    handlePlayStory(true);
  };

  // Tap an individual word to hear it pronounced and highlighted
  const handleTapWord = (token, index) => {
    if (isPlaying) {
      handlePauseStory();
    }
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    setHighlightedSightWord(null);
    setTappedWordId(token.id);
    activeWordIndexRef.current = index;
    setActiveWordIndex(index);
    triggerSynth('beep');

    speakWord(token.cleanWord || token.word);

    tapTimeoutRef.current = setTimeout(() => {
      setTappedWordId((prev) => (prev === token.id ? null : prev));
      setActiveWordIndex((prev) => {
        if (prev === index) {
          activeWordIndexRef.current = -1;
          return -1;
        }
        return prev;
      });
    }, 750);
  };

  // Tap a sight word chip to hear it and illuminate matching words in the story
  const handleTapSightWord = (word) => {
    if (isPlaying) {
      handlePauseStory();
    }
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    const targetLower = String(word || '').toLowerCase();
    setTappedWordId(null);
    setHighlightedSightWord(targetLower);
    triggerSynth('beep');
    speakWord(word);

    tapTimeoutRef.current = setTimeout(() => {
      setHighlightedSightWord((prev) => (prev === targetLower ? null : prev));
    }, 800);
  };

  const progressPercent =
    words.length > 0 && activeWordIndex >= 0
      ? Math.round(((activeWordIndex + 1) / words.length) * 100)
      : isFinished
      ? 100
      : 0;

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto rounded-3xl bg-slate-900/90 border-2 border-yellow-400/50 p-3.5 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between select-none ${className}`}
      style={{
        boxShadow: `0 0 35px ${
          body?.color ? body.color + '44' : 'rgba(250,204,21,0.25)'
        }`,
      }}
    >
      {/* Top Header: Title, Sight Words Badge & Big Audio Controller */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                {story.title}
              </span>
              <span className="text-base">{story.emoji || '📖'}</span>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
              <Sparkles
                className={`w-3 h-3 text-yellow-300 ${
                  isPlaying ? 'animate-twinkle' : ''
                }`}
              />
              <span>Read-Along Story</span>
            </span>
          </div>
        </div>

        {/* Read to Me / Pause / Resume / Replay Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handlePlayStory(false)}
            style={{ touchAction: 'manipulation' }}
            aria-label={
              isPlaying
                ? 'Pause reading story'
                : isPaused && !isFinished
                ? 'Resume reading story'
                : 'Read story aloud'
            }
            className={`cockpit-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-yellow-200 animate-pulse'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isPaused && !isFinished ? 'Resume' : 'Read to Me'}
                </span>
              </>
            )}
          </button>

          {(isFinished || isPaused) && (
            <button
              type="button"
              onClick={handleReplayStory}
              style={{ touchAction: 'manipulation' }}
              aria-label="Read story again from beginning"
              title="Read from beginning"
              className="cockpit-btn min-h-[40px] min-w-[40px] p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-600 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Story Text (Word-by-Word Highlighting) */}
      <div className="relative py-2 px-1 text-left">
        <p className="text-base sm:text-lg md:text-xl font-bold leading-relaxed text-slate-200">
          {words.map((token, index) => {
            const isActive = activeWordIndex === index;
            const isTapped =
              tappedWordId === token.id ||
              (highlightedSightWord &&
                token.cleanWord.toLowerCase() === highlightedSightWord);

            return (
              <button
                type="button"
                key={token.id}
                onClick={() => handleTapWord(token, index)}
                style={{ touchAction: 'manipulation' }}
                title={`Tap to hear: "${token.cleanWord}"`}
                className={`inline-block mr-1.5 my-0.5 px-1.5 py-0.5 rounded-xl cursor-pointer transition-all duration-150 select-none border-0 bg-transparent font-inherit leading-inherit ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 font-black shadow-xl scale-110 ring-4 ring-yellow-200/90 z-20 -translate-y-0.5'
                    : isTapped
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-md scale-105 ring-2 ring-cyan-200'
                    : 'text-slate-100 hover:text-yellow-300 hover:bg-slate-800/80 active:scale-95'
                }`}
              >
                {token.word}
              </button>
            );
          })}
        </p>
      </div>

      {/* Bottom Educational Toolbar: Reading Progress & Sight Word Practice */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col gap-2 text-xs">
        {/* Progress Bar */}
        <div className="w-full min-w-0 flex items-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 shrink-0">
            {isPlaying
              ? 'Reading...'
              : isFinished
              ? 'Great Job!'
              : isPaused
              ? 'Paused'
              : 'Tap Words to Explore'}
          </span>
          <div className="flex-1 min-w-[60px] h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Highlighted Sight Words Chips */}
        {story.sightWords && story.sightWords.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            <span className="text-[10px] font-black uppercase text-amber-300/80 flex items-center gap-0.5 shrink-0">
              <Star className="w-2.5 h-2.5 fill-current text-yellow-300" />
              <span>Words:</span>
            </span>
            {story.sightWords.map((word) => (
              <button
                type="button"
                key={`sight-${word}`}
                onClick={() => handleTapSightWord(word)}
                style={{ touchAction: 'manipulation' }}
                title={`Practice word: "${word}"`}
                className="px-2.5 py-1.5 rounded-lg text-xs font-black uppercase bg-slate-800 hover:bg-amber-400 text-amber-200 hover:text-slate-950 border border-slate-700 hover:border-yellow-300 shrink-0 transition-all active:scale-95"
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
