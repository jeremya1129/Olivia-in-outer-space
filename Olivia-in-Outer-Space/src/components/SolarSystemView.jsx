import React, { useState, useRef } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import CartoonCelestialBody from './CartoonCelestialBody';
import FlyingToyRocket from './FlyingToyRocket';
import ReadAlongStory from './ReadAlongStory';
import { Rocket, Sparkles, ArrowLeft, Orbit, Camera } from 'lucide-react';

/**
 * Left-to-Right Solar System Order & Specifications
 * The Sun is vertically centered as the anchor.
 * The other planets are gently staggered closer to the center line.
 */
const SOLAR_SYSTEM_ORDER = [
  {
    id: 'sun',
    name: 'Sun',
    bodyType: 'Star',
    distanceOrder: 0,
    cartoonSize: 68,
    color: '#FFD700',
    tagline: 'Big, bright, and super warm!',
    emoji: '☀️',
    moonIds: [],
    verticalAlign: 'center', // Sun is centered!
  },
  {
    id: 'mercury',
    name: 'Mercury',
    bodyType: '1st Planet',
    distanceOrder: 1,
    cartoonSize: 34,
    color: '#A0A0A0',
    tagline: 'Fastest runner near the sun!',
    emoji: '⚡',
    moonIds: [],
    verticalAlign: 'low',
  },
  {
    id: 'venus',
    name: 'Venus',
    bodyType: '2nd Planet',
    distanceOrder: 2,
    cartoonSize: 44,
    color: '#F59E0B',
    tagline: 'Warm and cloudy yellow!',
    emoji: '💛',
    moonIds: [],
    verticalAlign: 'high',
  },
  {
    id: 'earth',
    name: 'Earth',
    bodyType: '3rd Planet (Home)',
    distanceOrder: 3,
    cartoonSize: 48,
    color: '#38BDF8',
    tagline: 'Blue oceans & green land!',
    emoji: '🌍',
    moonIds: ['moon'],
    verticalAlign: 'low',
  },
  {
    id: 'mars',
    name: 'Mars',
    bodyType: '4th Planet',
    distanceOrder: 4,
    cartoonSize: 40,
    color: '#EF4444',
    tagline: 'Dusty red with big rocks!',
    emoji: '🔴',
    moonIds: ['phobos', 'deimos'],
    verticalAlign: 'high',
  },
  {
    id: 'ceres',
    name: 'Ceres',
    subTitle: 'Asteroid Belt',
    bodyType: 'Asteroid Belt',
    distanceOrder: 5,
    cartoonSize: 32,
    color: '#94A3B8',
    tagline: 'Rocky dwarf world in the belt!',
    emoji: '🪨',
    isAsteroidBelt: true,
    moonIds: [],
    verticalAlign: 'low',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    bodyType: '5th Planet (Gas Giant)',
    distanceOrder: 6,
    cartoonSize: 62,
    color: '#FB923C',
    tagline: 'Giant spinning storm world!',
    emoji: '🌀',
    moonIds: ['europa', 'ganymede', 'callisto'],
    verticalAlign: 'high',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    bodyType: '6th Planet (Ringed Giant)',
    distanceOrder: 7,
    cartoonSize: 56,
    color: '#FDE047',
    tagline: 'Wearing giant hula hoops!',
    emoji: '🪐',
    hasRings: true,
    moonIds: ['titan', 'enceladus'],
    verticalAlign: 'low',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    bodyType: '7th Planet (Ice Giant)',
    distanceOrder: 8,
    cartoonSize: 46,
    color: '#22D3EE',
    tagline: 'Chilly blue ice ball rolling on its side!',
    emoji: '❄️',
    hasRings: true,
    moonIds: [],
    verticalAlign: 'high',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    bodyType: '8th Planet (Windy Giant)',
    distanceOrder: 9,
    cartoonSize: 46,
    color: '#3B82F6',
    tagline: 'Deep blue and windy ice world!',
    emoji: '🌊',
    moonIds: ['triton'],
    verticalAlign: 'low',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    subTitle: 'Kuiper Belt',
    bodyType: 'Kuiper Belt',
    distanceOrder: 10,
    cartoonSize: 32,
    color: '#FDBA74',
    tagline: 'Tiny frozen world with a heart!',
    emoji: '🤍',
    isKuiperBelt: true,
    moonIds: [],
    verticalAlign: 'high',
  },
];

export default function SolarSystemView({ celestialBodies = [], onSelectDestination, usePhotoFace = false }) {
  const { triggerSynth, speak } = useSpaceAudio();

  // View state: 'solarsystem' (Left-to-Right panoramic track) | 'planetary' (Specific planet + moons view)
  const [viewLevel, setViewLevel] = useState('solarsystem');
  const [selectedPlanetId, setSelectedPlanetId] = useState('earth');
  const [selectedSubBodyId, setSelectedSubBodyId] = useState(null);
  const [showRealPhoto, setShowRealPhoto] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const scrollContainerRef = useRef(null);

  // Map bodies by ID for O(1) metadata lookup
  const bodyMap = React.useMemo(() => {
    const map = {};
    celestialBodies.forEach((b) => {
      map[b.id] = b;
    });
    return map;
  }, [celestialBodies]);

  // Selected planet config and celestial body details
  const activePlanetConfig = SOLAR_SYSTEM_ORDER.find((p) => p.id === selectedPlanetId) || SOLAR_SYSTEM_ORDER[3];
  const activePlanetBody = bodyMap[activePlanetConfig.id] || bodyMap['earth'] || {};
  const companionMoons = (activePlanetConfig.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

  // Active focus body (parent planet or selected companion moon)
  const activeFocusBody = (selectedSubBodyId && bodyMap[selectedSubBodyId]) || activePlanetBody;

  // Jump directly to a planet on the horizontal track
  const handleJumpToPlanet = (planetId) => {
    const el = document.getElementById(`planet-card-${planetId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      triggerSynth('beep');
    }
  };

  // Tap a planet to enter its Planetary System View
  const handleOpenPlanetarySystem = (planetConfig) => {
    setSelectedPlanetId(planetConfig.id);
    setSelectedSubBodyId(null);
    setViewLevel('planetary');
    triggerSynth('beep');

    const body = bodyMap[planetConfig.id];
    const moonCount = (planetConfig.moonIds || []).length;
    if (moonCount > 0) {
      speak(`${body?.name || planetConfig.name} System! Found ${moonCount} companion ${moonCount === 1 ? 'moon' : 'moons'}! Tap to explore!`);
    } else {
      speak(`${body?.name || planetConfig.name}! ${body?.tagline || ''}`);
    }
  };

  // Return from Planetary System to Left-to-Right Solar System
  const handleBackToSolarSystem = () => {
    setSelectedSubBodyId(null);
    setViewLevel('solarsystem');
    triggerSynth('twinkle');
    speak('Back to the Solar System Highway!');
  };

  // Blast off to any destination (planet or companion moon)
  const handleBlastOff = (destinationBody) => {
    triggerSynth('blastoff');
    speak(`Plotting course for ${destinationBody.name}! 3, 2, 1, Blast off!`);
    onSelectDestination(destinationBody);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-space-dark text-white">
      
      {/* ======================================================== */}
      {/* LEVEL 1: LEFT-TO-RIGHT SOLAR SYSTEM PANORAMIC VIEW       */}
      {/* ======================================================== */}
      {viewLevel === 'solarsystem' ? (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Top Quick Jump Ribbon */}
          <div className="relative z-20 w-full px-3 py-1 flex items-center justify-between gap-2 bg-gradient-to-b from-slate-900/90 to-transparent">
            <div className="flex items-center gap-1.5 text-cyan-300 font-black text-xs">
              <Orbit className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span className="hidden sm:inline">Solar Highway</span>
            </div>

            {/* Quick World Jump Chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
              {SOLAR_SYSTEM_ORDER.map((item) => (
                <button
                  key={`chip-${item.id}`}
                  onClick={() => handleJumpToPlanet(item.id)}
                  style={{ touchAction: 'manipulation' }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shrink-0 transition-all flex items-center gap-1"
                >
                  <span>{item.emoji}</span>
                  <span className="hidden lg:inline">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Panoramic Highway Canvas (Centered Sun & Moderate Stagger) */}
          <div
            ref={scrollContainerRef}
            className="relative flex-1 w-full h-full flex items-center overflow-x-auto overflow-y-hidden pl-16 sm:pl-24 md:pl-28 lg:pl-32 pr-10 sm:pr-14 md:pr-16 gap-3 sm:gap-4 md:gap-5 pointer-events-auto scrollbar-none"
            style={{ touchAction: 'pan-x' }}
          >
            {/* Ambient Cosmic Starry Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Glowing Distance Axis Line running horizontally right through the center */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-yellow-400/35 via-cyan-400/25 to-indigo-500/30 pointer-events-none" />

            {/* CELESTIAL BODIES FROM SUN TO PLUTO (MODERATE STAGGER & CENTERED SUN) */}
            {SOLAR_SYSTEM_ORDER.map((item) => {
              const body = bodyMap[item.id];
              if (!body) return null;
              const moonList = (item.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

              // Moderate vertical displacement: Sun centered, others moderately above or below center
              const staggerClass =
                item.verticalAlign === 'center'
                  ? 'translate-y-0'
                  : item.verticalAlign === 'high'
                  ? '-translate-y-7 sm:-translate-y-9 md:-translate-y-10'
                  : 'translate-y-7 sm:translate-y-9 md:translate-y-10';

              return (
                <React.Fragment key={`panoramic-item-${item.id}`}>
                  
                  {/* Asteroid Belt Divider (Between Mars & Jupiter) */}
                  {item.id === 'jupiter' && (
                    <div className="shrink-0 flex flex-col items-center justify-center px-1.5 py-2 relative self-center">
                      <div className="h-32 sm:h-40 w-7 border-x border-dashed border-slate-600/40 rounded-xl flex flex-col items-center justify-around py-1 bg-slate-900/25">
                        <span className="text-[10px] animate-pulse">🪨</span>
                        <span className="text-[8px]">✨</span>
                        <span className="text-[10px]">🪨</span>
                        <span className="text-[8px]">✨</span>
                        <span className="text-[10px]">🪨</span>
                      </div>
                      <span className="text-[7px] font-black tracking-widest text-slate-400 uppercase mt-0.5 whitespace-nowrap">
                        Belt
                      </span>
                    </div>
                  )}

                  {/* Planet Column */}
                  <div
                    id={`planet-card-${item.id}`}
                    onClick={() => handleOpenPlanetarySystem(item)}
                    style={{ touchAction: 'manipulation' }}
                    className={`relative shrink-0 flex flex-col items-center w-[84px] sm:w-[98px] md:w-[110px] cursor-pointer group transition-all duration-300 select-none ${staggerClass}`}
                  >
                    {/* Adventure Rocket Floating Directly Centered Above Earth */}
                    {item.id === 'earth' && (
                      <div className="absolute -top-24 sm:-top-28 md:-top-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                        <FlyingToyRocket isBlasting={false} usePhotoFace={usePhotoFace} />
                      </div>
                    )}
                    {/* Planet Interactive Visual Card */}
                    <div className="flex flex-col items-center text-center p-1.5 rounded-2xl bg-slate-900/40 group-hover:bg-slate-900/80 border border-transparent group-hover:border-yellow-300/60 transition-all duration-200 shadow-md group-hover:scale-105 active:scale-95 w-full">
                      
                      {/* Companion Moons Preview Badge */}
                      {moonList.length > 0 && (
                        <div className="mb-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-950 border border-yellow-300/70 shadow-sm">
                          <span className="text-[9px]">🌙</span>
                          <span className="text-[8px] font-black text-yellow-300">
                            {moonList.length}
                          </span>
                        </div>
                      )}

                      {/* Cartoon Vector Illustration with Aura */}
                      <div className="relative rounded-full p-1 flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full blur-sm opacity-30 group-hover:opacity-75 transition-opacity"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="relative z-10 flex items-center justify-center drop-shadow-md">
                          <CartoonCelestialBody id={item.id} size={item.cartoonSize} />
                        </div>
                      </div>

                      {/* Planet Name */}
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-tight truncate">
                          {body.name}
                        </span>
                      </div>

                      {/* Body Type Tag */}
                      <span className="text-[8px] text-cyan-300 font-extrabold uppercase tracking-tight truncate max-w-full">
                        {item.bodyType}
                      </span>

                      {/* Explore Button */}
                      <div className="mt-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 group-hover:from-yellow-400 group-hover:to-amber-500 text-slate-300 group-hover:text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-0.5 transition-all">
                        <span>Explore</span>
                        <Rocket className="w-2.5 h-2.5" />
                      </div>
                    </div>

                  </div>
                </React.Fragment>
              );
            })}

          </div>

          {/* Gentle Footer Hint */}
          <div className="relative z-20 w-full py-0.5 text-center text-[10px] font-bold text-slate-400 bg-gradient-to-t from-slate-950 to-transparent">
            👉 Tap any cartoon world above to explore its planetary system!
          </div>

        </div>
      ) : (
        /* ======================================================== */
        /* LEVEL 2: PLANETARY SYSTEM VIEW (Parent World + Moons)    */
        /* ======================================================== */
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden p-2 sm:p-4 md:p-6 bg-space-dark stars-bg select-none">
          
          {/* Top Breadcrumbs & Mode Controls */}
          <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
            <button
              onClick={handleBackToSolarSystem}
              style={{ touchAction: 'manipulation' }}
              className="cockpit-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Solar System</span>
            </button>

            {/* View Mode Toggle: Real Spacecraft Photo vs Cartoon (Action if pressed) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  triggerSynth('beep');
                  setShowRealPhoto((prev) => !prev);
                  speak(showRealPhoto ? 'Cartoon art mode' : 'NASA Spacecraft Photo');
                }}
                style={{ touchAction: 'manipulation' }}
                title={showRealPhoto ? "Switch to Cartoon Art" : "Switch to NASA Spacecraft Photo"}
                className="cockpit-btn px-3 py-1 rounded-full bg-slate-900/90 border border-slate-600 text-xs font-bold text-yellow-300 flex items-center gap-1.5 shadow-md hover:border-yellow-300/80 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-300" />
                <span>{showRealPhoto ? '🎨 Cartoon Art' : '📸 Real Photo'}</span>
              </button>
            </div>
          </div>

          {/* Main Stage: Planet Centered as Much as Possible */}
          <div className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-start py-2 px-2 overflow-y-auto">
            
            {/* 1 & 2: OBJECT SPOTLIGHT + READ-ALONG STORY COMBINATION (Side-by-Side, Centered Horizontally) */}
            <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 my-1 sm:my-2 px-2 z-20">
              
              {/* Left: Main Object Spotlight */}
              <div className="flex flex-col items-center text-center shrink-0 w-full md:w-64 lg:w-72">
                
                {/* Planetary Orb */}
                <div className="relative flex items-center justify-center my-1 sm:my-2">
                  <div
                    onClick={() => {
                      setSelectedSubBodyId(null);
                      triggerSynth('twinkle');
                    }}
                    className={`cockpit-btn relative ${
                      companionMoons.length > 0
                        ? 'w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44'
                        : 'w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56'
                    } rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-200 overflow-hidden cursor-pointer shadow-2xl ${
                      activeFocusBody.id === activePlanetBody.id ? 'ring-4 ring-yellow-400' : 'ring-2 ring-white/20'
                    }`}
                    style={{
                      backgroundColor: activePlanetBody.color || '#38bdf8',
                      boxShadow: `0 0 60px ${activePlanetBody.color || '#38bdf8'}99, inset 0 0 30px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {showRealPhoto && activePlanetBody.real_image_path && !imageErrorMap[activePlanetBody.id] ? (
                      <img
                        src={activePlanetBody.real_image_path}
                        alt={activePlanetBody.name}
                        onError={() => setImageErrorMap((prev) => ({ ...prev, [activePlanetBody.id]: true }))}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3">
                        <CartoonCelestialBody
                          id={activePlanetConfig.id}
                          size={companionMoons.length > 0 ? 120 : 150}
                        />
                      </div>
                    )}

                    {/* Inner Atmospheric Rim Glow */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 pointer-events-none" />
                  </div>
                </div>

                {/* Title & Tagline */}
                <div className="flex items-center gap-1.5 mt-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                    {activePlanetBody.name}
                  </h2>
                  <span className="text-xl">{activePlanetBody.emoji}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-cyan-300 font-extrabold uppercase tracking-widest">
                  {activePlanetBody.body_type}
                </span>
                <p className="text-xs sm:text-sm text-yellow-200 font-bold mt-0.5 max-w-xs px-2 line-clamp-2">
                  "{activePlanetBody.tagline}"
                </p>

                {/* Blast Off Button to Main Planet */}
                <button
                  onClick={() => handleBlastOff(activePlanetBody)}
                  style={{ touchAction: 'manipulation' }}
                  className="cockpit-btn mt-2 px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Fly to {activePlanetBody.name}!</span>
                </button>
              </div>

              {/* Right: Toddler Read-Along Storybook (To the right of the object, centered horizontally together) */}
              <div className="w-full md:flex-1 max-w-xl flex items-center justify-center">
                <ReadAlongStory body={activeFocusBody} className="w-full" />
              </div>

            </div>

            {/* 3. COMPANION MOONS HIGHWAY (Modeled Like Solar System View) */}
            {companionMoons.length > 0 ? (
              <div className="relative w-full max-w-4xl mt-3 sm:mt-4 pt-2 pb-1 flex flex-col items-center z-10 shrink-0">
                
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base sm:text-lg">🌙</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase text-yellow-300 tracking-wider">
                    Companion Moons of {activePlanetBody.name} ({companionMoons.length})
                  </h3>
                  <span className="text-[10px] text-cyan-300 font-bold hidden sm:inline">
                    (Tap card to read story, or tap Visit to blast off!)
                  </span>
                </div>

                {/* Moons Orbital Track Canvas - modeled just like Solar System View */}
                <div className="relative w-full flex items-center justify-center overflow-x-auto py-2 px-4 gap-3 sm:gap-5 md:gap-6 scrollbar-none">
                  {/* Glowing Orbital Axis Line running horizontally across the track */}
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-yellow-400/20 via-cyan-400/40 to-indigo-500/20 pointer-events-none" />

                  {companionMoons.map((moon) => {
                    const isMoonFocused = activeFocusBody.id === moon.id;

                    return (
                      <div
                        key={`planetary-moon-${moon.id}`}
                        onClick={() => {
                          setSelectedSubBodyId(moon.id);
                          triggerSynth('twinkle');
                        }}
                        style={{ touchAction: 'manipulation' }}
                        className={`relative z-10 flex flex-col items-center w-[124px] sm:w-[144px] md:w-[160px] p-2 sm:p-2.5 rounded-2xl transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 cursor-pointer group shrink-0 select-none text-center ${
                          isMoonFocused
                            ? 'bg-slate-900 border-2 border-yellow-400 ring-4 ring-yellow-400/40 scale-105'
                            : 'bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 hover:border-yellow-300'
                        }`}
                      >
                        {/* Moon Circular Visual Orb (Real Photo / Cartoon) */}
                        <div
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex items-center justify-center mb-1.5 transition-transform group-hover:rotate-6"
                          style={{
                            backgroundColor: moon.color || '#e0e0e0',
                            boxShadow: `0 0 24px ${moon.color || '#e0e0e0'}77`,
                          }}
                        >
                          {showRealPhoto && moon.real_image_path && !imageErrorMap[moon.id] ? (
                            <img
                              src={moon.real_image_path}
                              alt={moon.name}
                              onError={() => setImageErrorMap((prev) => ({ ...prev, [moon.id]: true }))}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-1">
                              <CartoonCelestialBody id={moon.id} size={54} />
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
                        </div>

                        {/* Moon Name */}
                        <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate w-full">
                          {moon.name}
                        </span>

                        {/* Moon Tagline */}
                        <span className="text-[9px] sm:text-[10px] text-yellow-300/90 font-bold line-clamp-1 w-full my-0.5">
                          {moon.tagline}
                        </span>

                        {/* Visit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlastOff(moon);
                          }}
                          style={{ touchAction: 'manipulation' }}
                          className="mt-1 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md flex items-center gap-1 transition-all"
                        >
                          <span>Visit</span>
                          <Rocket className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              /* Solo World Info Card (Centered when no companion moons exist) */
              <div className="mt-2 sm:mt-3 p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-sm sm:max-w-md shadow-lg z-10">
                <span className="text-[10px] sm:text-xs font-black uppercase text-cyan-300 tracking-widest block mb-1">
                  ✨ Solo World Explorer
                </span>
                <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                  {activePlanetBody.name} travels peacefully through deep space all on its own! Tap the green button above to blast off and explore!
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-yellow-300">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700">
                    🌡️ {activePlanetBody.mean_temp_celsius}°C
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700">
                    ⚖️ {activePlanetBody.gravity_m_s2} m/s² Gravity
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
