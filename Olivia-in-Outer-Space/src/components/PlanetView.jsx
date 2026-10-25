import React, { useState } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { ArrowLeft, Sparkles, Volume2, Music, Heart } from 'lucide-react';

const ACTION_MAP = {
  wave: {
    emoji: '👋',
    title: 'Wave Hello!',
    prompt: 'Wave your hands to everyone on Earth!',
    cheer: 'Yay! Earth is waving back to Captain Olivia!',
  },
  yawn: {
    emoji: '🥱',
    title: 'Sleepy Yawn!',
    prompt: 'Give a big, sleepy space yawn with the glowing Moon!',
    cheer: 'Ooooh! Night night, stars! Sweet space dreams!',
  },
  rover_drive: {
    emoji: '🚜',
    title: 'Drive the Rover!',
    prompt: 'Beep beep! Steer the Mars Rover over the red rocks!',
    cheer: 'Vroom vroom! Rover high-five to Captain Olivia!',
  },
  spin_rings: {
    emoji: '💫',
    title: 'Spin Like the Rings!',
    prompt: 'Stand up and do a gentle spin like Saturn’s giant rings!',
    cheer: 'Wheeeeee! Look at those glittery spinning rings!',
  },
};

export default function PlanetView({ planet, onReturnToCockpit }) {
  const { playTrackOrSfx, triggerSynth, speak } = useSpaceAudio();
  const [activeActionCheer, setActiveActionCheer] = useState(null);

  const actionInfo = ACTION_MAP[planet.action] || {
    emoji: '✨',
    title: 'Sensory Fun!',
    prompt: 'Explore and touch the planet!',
    cheer: 'Great job exploring space!',
  };

  const handlePlayVoice = () => {
    triggerSynth('chime');
    playTrackOrSfx(planet.factAudio, 'chime');
    speak(`${planet.name}! ${planet.tagline}`);
  };

  const handlePlaySfx = () => {
    playTrackOrSfx(planet.sfx, planet.sfx);
  };

  const handleDoAction = () => {
    triggerSynth(planet.sfx);
    setActiveActionCheer(actionInfo.cheer);
    speak(actionInfo.cheer);
  };

  const handleBack = () => {
    triggerSynth('beep');
    speak('Back to the cockpit!');
    onReturnToCockpit();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-space-dark stars-bg p-4 md:p-8">
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-20 pb-2">
        <button
          onClick={handleBack}
          className="cockpit-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold rounded-2xl border border-cyan-500/40 flex items-center gap-2 text-sm md:text-base shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-yellow-300" />
          <span>Cockpit</span>
        </button>

        <div className="px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-600 text-xs md:text-sm font-bold text-yellow-300 flex items-center gap-2 shadow-md">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Landing at {planet.name}</span>
        </div>
      </div>

      {/* Main Toddler Sensory Landing Stage */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 py-2">
        
        {/* Planet Visual Circle with Rings & Glow */}
        <div className="relative my-3 flex items-center justify-center">
          {planet.id === 'saturn' && (
            <div className="absolute w-72 h-20 md:w-96 md:h-28 border-[16px] border-amber-200/60 rounded-[100%] rotate-[22deg] shadow-[0_0_45px_rgba(228,197,104,0.4)] pointer-events-none" />
          )}

          <button
            onClick={handlePlayVoice}
            className="cockpit-btn relative w-48 h-48 md:w-60 md:h-60 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-200 overflow-hidden"
            style={{
              backgroundColor: planet.color,
              boxShadow: `0 0 65px ${planet.color}88`,
            }}
          >
            {/* Visual surface details */}
            {planet.id === 'earth' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 via-sky-500 to-emerald-400 opacity-90" />
            )}
            {planet.id === 'moon' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-400 to-slate-200 opacity-90">
                <div className="absolute top-8 left-10 w-8 h-8 rounded-full bg-slate-500/30" />
                <div className="absolute bottom-10 right-12 w-12 h-12 rounded-full bg-slate-500/25" />
              </div>
            )}
            {planet.id === 'mars' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-700 via-red-600 to-orange-500 opacity-90" />
            )}
            {planet.id === 'saturn' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-200 opacity-90" />
            )}

            <div className="z-10 text-6xl md:text-7xl drop-shadow-md">
              {planet.id === 'earth' && '🌍'}
              {planet.id === 'moon' && '🌕'}
              {planet.id === 'mars' && '🪐'}
              {planet.id === 'saturn' && '🪐'}
            </div>
          </button>
        </div>

        {/* Planet Name & Toddler Tagline */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide mt-2">
          {planet.name}
        </h1>
        <p className="text-lg md:text-2xl text-yellow-300 font-extrabold mt-1 max-w-lg">
          "{planet.tagline}"
        </p>

        {/* Sensory Action Card */}
        <div className="mt-4 p-4 md:p-5 w-full max-w-xl rounded-3xl bg-slate-900/85 border-2 border-slate-700 backdrop-blur-md shadow-2xl flex flex-col items-center gap-3">
          <div className="text-sm md:text-base text-cyan-200 font-bold flex items-center gap-2">
            <span className="text-2xl">{actionInfo.emoji}</span>
            <span>{actionInfo.prompt}</span>
          </div>

          {activeActionCheer && (
            <div className="px-4 py-2 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-400/60 text-fuchsia-200 text-sm md:text-base font-extrabold animate-bounce">
              {activeActionCheer}
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleDoAction}
            className="cockpit-btn w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-base md:text-lg rounded-2xl border-2 border-yellow-300 shadow-xl flex items-center justify-center gap-2"
          >
            <span>{actionInfo.emoji}</span>
            <span>{actionInfo.title}</span>
          </button>
        </div>

        {/* Toddler Audio Push-Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
          {/* Spoken Fact Audio Button */}
          <button
            onClick={handlePlayVoice}
            className="cockpit-btn flex-1 min-w-[150px] px-4 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-sm md:text-base rounded-2xl border border-cyan-400/50 flex items-center justify-center gap-2 shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-yellow-300" />
            <span>Hear Story</span>
          </button>

          {/* Sensory SFX Button */}
          <button
            onClick={handlePlaySfx}
            className="cockpit-btn flex-1 min-w-[150px] px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm md:text-base rounded-2xl border border-amber-300/50 flex items-center justify-center gap-2 shadow-lg"
          >
            <Music className="w-5 h-5 text-yellow-200" />
            <span>Play Sound</span>
          </button>
        </div>

      </div>
    </div>
  );
}
