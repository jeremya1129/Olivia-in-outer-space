import React, { useState } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import CartoonCelestialBody from './CartoonCelestialBody';
import { ArrowLeft, Sparkles, Volume2, Music, Camera, Compass, Thermometer, Weight, Moon, X, RotateCcw, Rocket } from 'lucide-react';

export default function PlanetView({ planet, onReturnToCockpit }) {
  const { playTrackOrSfx, triggerSynth, speak } = useSpaceAudio();
  const [activeActionCheer, setActiveActionCheer] = useState(null);
  const [showRealPhoto, setShowRealPhoto] = useState(false);
  const [showActionGifModal, setShowActionGifModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sensory action info from enriched dataset with safe defaults
  const actionEmoji = planet.action_emoji || '✨';
  const actionTitle = planet.action_title || 'Sensory Fun!';
  const actionPrompt = planet.action_prompt || 'Explore and touch the planet!';
  const actionCheer = planet.action_cheer || `Yay! Captain Olivia and Navigator Anna landed safely on ${planet.name}!`;

  // Toddler-friendly physical interpretation
  const getGravityText = (g) => {
    if (g < 1.0) return '🎈 Feather light gravity! One tiny hop and you float into the sky!';
    if (g < 4.5) return '🦘 Super bouncy! You can jump way higher than on Earth!';
    if (g <= 12.0) return '🏃 Regular bounce! Perfect for running and skipping!';
    return '🐻 Giant heavy gravity! Feels like a big, cozy space bear hug!';
  };

  const getTempText = (t) => {
    if (t > 100) return `🔥 ${t}°C — Super-duper hot! Hotter than boiling soup!`;
    if (t >= 0) return `☀️ ${t}°C — Nice and cozy, just right for space explorers!`;
    if (t >= -100) return `❄️ ${t}°C — Brrr chilly! Put on your cozy astronaut mittens!`;
    return `🧊 ${t}°C — Super frozen ice-cream cold! Brrrrr!`;
  };

  const getMoonsText = (m, type) => {
    if (type === 'Moon') return `Orbiting around parent planet ${planet.parent_body}!`;
    if (m === 0) return 'Traveling through space peacefully all on its own!';
    if (m === 1) return 'Has 1 glowing companion moon shining bright!';
    return `Has ${m} dancing moons dancing in circles around it!`;
  };

  const handlePlayVoice = () => {
    triggerSynth('chime');
    playTrackOrSfx(planet.factAudio, 'chime');
    speak(`${planet.name}! ${planet.tagline}. Gravity: ${getGravityText(planet.gravity_m_s2)}`);
  };

  const handlePlaySfx = () => {
    triggerSynth(planet.sfx || 'twinkle');
    playTrackOrSfx(planet.sfx, planet.sfx);
  };

  const handleDoAction = () => {
    triggerSynth(planet.sfx || 'twinkle');
    setActiveActionCheer(actionCheer);
    setShowActionGifModal(true);
    speak(actionCheer);
  };

  const handleBack = () => {
    triggerSynth('beep');
    speak('Back to the cockpit with Captain Olivia and Navigator Anna!');
    onReturnToCockpit();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-space-dark stars-bg p-3 sm:p-6 md:p-8 select-none">
      
      {/* Top Navigation & Status Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-20 pb-2">
        <button
          onClick={handleBack}
          style={{ touchAction: 'manipulation' }}
          className="cockpit-btn px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-black rounded-2xl border-2 border-cyan-500/50 flex items-center gap-2 text-sm md:text-base shadow-xl"
        >
          <ArrowLeft className="w-5 h-5 text-yellow-300" />
          <span>Cockpit</span>
        </button>

        {/* View Mode Toggle: Spacecraft Photo vs Cartoon */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerSynth('beep');
              const nextMode = !showRealPhoto;
              setShowRealPhoto(nextMode);
              speak(nextMode ? 'NASA Spacecraft Photograph' : 'Cartoon Art illustration');
            }}
            style={{ touchAction: 'manipulation' }}
            className="cockpit-btn px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-600 text-xs font-bold text-yellow-300 flex items-center gap-1.5 shadow-md"
          >
            <Camera className="w-4 h-4 text-cyan-300" />
            <span>{showRealPhoto ? '📸 NASA Photo' : '🎨 Cartoon Art'}</span>
          </button>
        </div>
      </div>

      {/* Main Celestial Landing Stage */}
      <div className="relative flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center z-10 py-2">
        
        {/* Planet Visual Presentation (NASA Photo / Cartoon Illustration) */}
        <div className="relative my-2 sm:my-4 flex items-center justify-center">
          
          {/* Saturn Ring Arc for Real Photo */}
          {planet.id === 'saturn' && showRealPhoto && (
            <div className="absolute w-72 h-20 sm:w-96 sm:h-28 border-[14px] sm:border-[18px] border-amber-200/60 rounded-[100%] rotate-[22deg] shadow-[0_0_55px_rgba(228,197,104,0.45)] pointer-events-none z-10" />
          )}

          <div
            onClick={handlePlayVoice}
            className="cockpit-btn relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-200 overflow-hidden cursor-pointer"
            style={{
              backgroundColor: planet.color || '#38bdf8',
              boxShadow: `0 0 75px ${planet.color}aa, inset 0 0 30px rgba(0,0,0,0.4)`,
            }}
          >
            {showRealPhoto && planet.real_image_path ? (
              <img
                src={planet.real_image_path}
                alt={planet.name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-80'
                }`}
              />
            ) : (
              /* Cartoon Vector Illustration View */
              <div className="w-full h-full flex flex-col items-center justify-center relative p-4">
                <CartoonCelestialBody id={planet.id} size={200} />
              </div>
            )}

            {/* Inner Atmospheric Rim Glow */}
            <div className="absolute inset-0 rounded-full border-4 border-white/25 pointer-events-none" />
          </div>
        </div>

        {/* NASA Image Mission Credit Pill */}
        {showRealPhoto && planet.nasa_asset_id && (
          <div className="text-[11px] sm:text-xs text-slate-300 font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 mb-2">
            🚀 NASA Authentic Spacecraft Observation ID: <span className="text-yellow-300">{planet.nasa_asset_id}</span>
          </div>
        )}

        {/* Planet Name & Toddler Hook */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wide">
          {planet.name}
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-yellow-300 font-extrabold mt-1 max-w-xl px-2">
          "{planet.tagline}"
        </p>

        {/* Toddler Sensory Action Card */}
        <div className="mt-3 sm:mt-5 p-4 sm:p-5 w-full max-w-xl rounded-3xl bg-slate-900/90 border-2 border-slate-700 backdrop-blur-md shadow-2xl flex flex-col items-center gap-3">
          <div className="text-sm sm:text-base text-cyan-200 font-bold flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">{actionEmoji}</span>
            <span>{actionPrompt}</span>
          </div>

          {/* Action Push-Button */}
          <button
            onClick={handleDoAction}
            style={{ touchAction: 'manipulation' }}
            className="cockpit-btn min-h-[64px] w-full px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white font-black text-base sm:text-lg rounded-2xl border-2 border-yellow-300 shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">{actionEmoji}</span>
            <span>{actionTitle}</span>
          </button>

          {/* If Action was triggered: Show interactive cartoon GIF & cheer */}
          {activeActionCheer && (
            <div className="flex flex-col items-center gap-2 w-full pt-1 animate-in fade-in duration-300">
              <div
                onClick={() => {
                  triggerSynth('twinkle');
                  setShowActionGifModal(true);
                }}
                className="cursor-pointer group relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.35)] transition-transform hover:scale-105 active:scale-95 bg-slate-950"
              >
                <img
                  src={`/assets/cartoons/interactions/${planet.id}.gif`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/cartoons/interactions/default.gif';
                  }}
                  alt={`${planet.name} interaction with Olivia and Anna`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 border border-yellow-300 text-[10px] font-black text-yellow-300 flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>Olivia & Anna</span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/75 text-[10px] font-bold text-white flex items-center gap-1 border border-white/20">
                  <span>Tap to expand 🔍</span>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-fuchsia-950/90 border-2 border-fuchsia-400 text-fuchsia-200 text-sm sm:text-base font-black shadow-lg text-center">
                {activeActionCheer}
              </div>
            </div>
          )}
        </div>

        {/* Toddler-Friendly Science Metric Cards */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
          {/* Gravity Card */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-extrabold uppercase">
              <Weight className="w-3.5 h-3.5 text-sky-400" />
              <span>Gravity Bounciness</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              {getGravityText(planet.gravity_m_s2)}
            </div>
          </div>

          {/* Temperature Card */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-extrabold uppercase">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Temperature</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              {getTempText(planet.mean_temp_celsius)}
            </div>
          </div>

          {/* Moons Card */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs text-purple-300 font-extrabold uppercase">
              <Moon className="w-3.5 h-3.5 text-purple-400" />
              <span>Moons & Neighbors</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              {getMoonsText(planet.number_of_moons, planet.body_type)}
            </div>
          </div>
        </div>

        {/* Big Audio Push-Buttons */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
          {/* Hear Story Button */}
          <button
            onClick={handlePlayVoice}
            style={{ touchAction: 'manipulation' }}
            className="cockpit-btn min-h-[56px] flex-1 min-w-[150px] px-4 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-sm sm:text-base rounded-2xl border-2 border-cyan-400/60 flex items-center justify-center gap-2 shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-yellow-300" />
            <span>Hear Story</span>
          </button>

          {/* Play Sound Button */}
          <button
            onClick={handlePlaySfx}
            style={{ touchAction: 'manipulation' }}
            className="cockpit-btn min-h-[56px] flex-1 min-w-[150px] px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm sm:text-base rounded-2xl border-2 border-amber-300/60 flex items-center justify-center gap-2 shadow-lg"
          >
            <Music className="w-5 h-5 text-yellow-200" />
            <span>Play Sound</span>
          </button>
        </div>

      </div>

      {/* Cartoon Action Celebration Modal */}
      {showActionGifModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowActionGifModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-4 border-yellow-300 rounded-3xl p-5 shadow-[0_0_60px_rgba(250,204,21,0.45)] flex flex-col items-center text-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowActionGifModal(false)}
              className="cockpit-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-yellow-300" />
            </button>

            {/* Action Title & Emoji */}
            <div className="flex items-center gap-2 mb-2 pr-8">
              <span className="text-3xl sm:text-4xl">{actionEmoji}</span>
              <h2 className="text-xl sm:text-2xl font-black text-yellow-300 tracking-wide">
                {actionTitle}
              </h2>
            </div>

            {/* Animated Cartoon GIF */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-4 border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.4)] bg-slate-950 flex items-center justify-center my-2">
              <img
                src={`/assets/cartoons/interactions/${planet.id}.gif`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/cartoons/interactions/default.gif';
                }}
                alt={`${planet.name} with Olivia and Anna`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Olivia & Anna Adventure</span>
              </div>
            </div>

            {/* Cheer Announcement */}
            <p className="text-base sm:text-lg font-extrabold text-white mt-2 px-2 leading-snug">
              {actionCheer}
            </p>

            {/* Toddler Controls */}
            <div className="flex items-center gap-3 w-full mt-4">
              <button
                onClick={() => {
                  triggerSynth(planet.sfx || 'twinkle');
                  speak(actionCheer);
                }}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 text-white font-black text-sm sm:text-base border-2 border-yellow-300 shadow-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-yellow-300" />
                <span>Play Again 🔄</span>
              </button>
              <button
                onClick={() => setShowActionGifModal(false)}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-sm sm:text-base border-2 border-cyan-500/60 shadow-xl flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4 text-yellow-300" />
                <span>Yay! Done 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
