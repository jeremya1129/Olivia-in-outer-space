import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { getStoryForBody } from '../data/planetStories';
import { BookOpen, Volume2, RotateCcw, Sparkles, Pause, Play, Star } from 'lucide-react';

export default function ReadAlongStory({ body, className = '' }) {
  const { readStory, stopSpeaking, speakWord, triggerSynth, isMuted, voiceMode } = useSpaceAudio();

  const story = useMemo(() => getStoryForBody(body?.id, body?.name), [body?.id, body?.name]);

  // Parse words with character offsets for precise boundary mapping
  const words = useMemo(() => {
    if (!story?.text) return [];
    const list = [];
    const regex = /\S+/g;
    let match;
    let idx = 0;
    while ((match = regex.exec(story.text)) !== null) {
      list.push({
        id: `word-${idx++}`,
        word: match[0],
        cleanWord: match[0].replace(/[^\w]/g, ''),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return list;
  }, [story?.text]);

  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tappedWordId, setTappedWordId] = useState(null);

  const fallbackTimerRef = useRef(null);
  const hasNativeBoundaries = useRef(false);

  // Stop reading when unmounted or when the selected celestial body changes
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    };
  }, [body?.id, stopSpeaking]);

  // Reset playback state when celestial body changes
  useEffect(() => {
    stopSpeaking();
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    setActiveWordIndex(-1);
    setIsPlaying(false);
    setIsFinished(false);
  }, [body?.id]);

  // Find corresponding word index given character offset from speech synthesis
  const findWordIndexByChar = (charIndex) => {
    if (!words || words.length === 0) return -1;
    for (let i = 0; i < words.length; i++) {
      if (charIndex >= words[i].start && charIndex < words[i].end) {
        return i;
      }
      if (charIndex >= words[i].start && (i === words.length - 1 || charIndex < words[i + 1].start)) {
        return i;
      }
    }
    return words.length - 1;
  };

  // Start reading the story with synchronized word-by-word highlighting
  const handlePlayStory = () => {
    if (isPlaying) {
      handlePauseStory();
      return;
    }

    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    hasNativeBoundaries.current = false;
    setActiveWordIndex(0);
    setIsPlaying(true);
    setIsFinished(false);

    triggerSynth(story.actionSound || 'twinkle');

    // Read full story text
    readStory(story.text, {
      onStart: () => {
        setIsPlaying(true);
        // Start a fallback pacing timer in case the browser does not fire native onboundary
        let currentIdx = 0;
        const totalWords = words.length;
        const baseIntervalMs = voiceMode === 'robot' ? 440 : 380;

        fallbackTimerRef.current = setInterval(() => {
          if (hasNativeBoundaries.current) {
            clearInterval(fallbackTimerRef.current);
            return;
          }
          currentIdx++;
          if (currentIdx < totalWords) {
            setActiveWordIndex(currentIdx);
          } else {
            clearInterval(fallbackTimerRef.current);
          }
        }, baseIntervalMs);
      },
      onBoundary: (charIndex) => {
        hasNativeBoundaries.current = true;
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current);
        }
        const idx = findWordIndexByChar(charIndex);
        if (idx >= 0) {
          setActiveWordIndex(idx);
        }
      },
      onEnd: () => {
        if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
        setActiveWordIndex(-1);
        setIsPlaying(false);
        setIsFinished(true);
        triggerSynth(story.actionSound || 'twinkle');
      },
      onError: () => {
        // In environments without speech synthesis audio hardware (or if synthesis fails),
        // fallback to visual pacing so the child can still follow word highlights
        if (!fallbackTimerRef.current) {
          let currentIdx = 0;
          const totalWords = words.length;
          const baseIntervalMs = 280;
          fallbackTimerRef.current = setInterval(() => {
            currentIdx += 1;
            if (currentIdx < totalWords) {
              setActiveWordIndex(currentIdx);
            } else {
              clearInterval(fallbackTimerRef.current);
              setIsPlaying(false);
              setIsFinished(true);
            }
          }, baseIntervalMs);
        }
      },
    });
  };

  const handlePauseStory = () => {
    stopSpeaking();
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    setIsPlaying(false);
  };

  const handleReplayStory = () => {
    stopSpeaking();
    handlePlayStory();
  };

  // Tap an individual word to hear it pronounced and highlighted!
  const handleTapWord = (token, index) => {
    if (isPlaying) {
      handlePauseStory();
    }
    setTappedWordId(token.id);
    setActiveWordIndex(index);
    triggerSynth('beep');

    speakWord(token.cleanWord || token.word);

    // Keep highlight for 600ms then gently fade
    setTimeout(() => {
      setTappedWordId((prev) => (prev === token.id ? null : prev));
      setActiveWordIndex((prev) => (prev === index ? -1 : prev));
    }, 700);
  };

  // Calculate progress percentage
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
        boxShadow: `0 0 35px ${body?.color ? body.color + '44' : 'rgba(250,204,21,0.25)'}`,
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
              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
              <span>Read-Along Story</span>
            </span>
          </div>
        </div>

        {/* Read to Me / Pause / Replay Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePlayStory}
            style={{ touchAction: 'manipulation' }}
            aria-label={isPlaying ? 'Pause reading story' : 'Read story aloud'}
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
                <span>Read to Me</span>
              </>
            )}
          </button>

          {isFinished && (
            <button
              onClick={handleReplayStory}
              style={{ touchAction: 'manipulation' }}
              title="Read again"
              className="cockpit-btn p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-600 shadow-md transition-transform hover:scale-105 active:scale-95"
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
            const isTapped = tappedWordId === token.id;

            return (
              <span
                key={token.id}
                onClick={() => handleTapWord(token, index)}
                style={{ touchAction: 'manipulation' }}
                title={`Tap to hear: "${token.cleanWord}"`}
                className={`inline-block mr-1.5 my-0.5 px-1.5 py-0.5 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 font-black shadow-xl scale-110 ring-4 ring-yellow-200/90 z-20 -translate-y-0.5'
                    : isTapped
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-md scale-105 ring-2 ring-cyan-200'
                    : 'text-slate-100 hover:text-yellow-300 hover:bg-slate-800/80 active:scale-95'
                }`}
              >
                {token.word}
              </span>
            );
          })}
        </p>
      </div>

      {/* Bottom Educational Toolbar: Reading Progress & Sight Word Practice */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Progress Bar */}
        <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 shrink-0">
            {isPlaying ? 'Reading...' : isFinished ? 'Great Job!' : 'Tap Words to Explore'}
          </span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
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
                key={`sight-${word}`}
                onClick={() => {
                  triggerSynth('beep');
                  speakWord(word);
                }}
                style={{ touchAction: 'manipulation' }}
                title={`Practice word: "${word}"`}
                className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-slate-800 hover:bg-amber-400 text-amber-200 hover:text-slate-950 border border-slate-700 hover:border-yellow-300 shrink-0 transition-all active:scale-95"
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
