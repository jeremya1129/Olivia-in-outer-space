import React, { useState, useRef } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { Rocket, Sparkles, ChevronLeft, ChevronRight, ArrowLeft, Orbit, Compass, Radio, Star, Info } from 'lucide-react';

/**
 * Left-to-Right Solar System Order & Physical Specifications
 * From the Sun on the far left outward to the Kuiper Belt and Pluto.
 */
const SOLAR_SYSTEM_ORDER = [
  {
    id: 'sun',
    name: 'Sun',
    bodyType: 'Star',
    distanceOrder: 0,
    visualWidth: 'w-44 sm:w-56 md:w-64',
    visualHeight: 'h-44 sm:h-56 md:h-64',
    color: '#FFD700',
    tagline: 'Big, bright, and super warm!',
    emoji: '☀️',
    moonIds: [],
  },
  {
    id: 'mercury',
    name: 'Mercury',
    bodyType: '1st Planet',
    distanceOrder: 1,
    visualWidth: 'w-16 sm:w-20',
    visualHeight: 'h-16 sm:h-20',
    color: '#A0A0A0',
    tagline: 'Fastest little runner near the sun!',
    emoji: '⚡',
    moonIds: [],
  },
  {
    id: 'venus',
    name: 'Venus',
    bodyType: '2nd Planet',
    distanceOrder: 2,
    visualWidth: 'w-24 sm:w-28',
    visualHeight: 'h-24 sm:h-28',
    color: '#F59E0B',
    tagline: 'Super warm and cloudy yellow!',
    emoji: '💛',
    moonIds: [],
  },
  {
    id: 'earth',
    name: 'Earth',
    bodyType: '3rd Planet (Home)',
    distanceOrder: 3,
    visualWidth: 'w-26 sm:w-32',
    visualHeight: 'h-26 sm:h-32',
    color: '#38BDF8',
    tagline: 'Our home planet with blue oceans and green land!',
    emoji: '🌍',
    moonIds: ['moon'],
  },
  {
    id: 'mars',
    name: 'Mars',
    bodyType: '4th Planet',
    distanceOrder: 4,
    visualWidth: 'w-20 sm:w-24',
    visualHeight: 'h-20 sm:h-24',
    color: '#EF4444',
    tagline: 'The dusty red planet with big rocks!',
    emoji: '🔴',
    moonIds: ['phobos', 'deimos'],
  },
  {
    id: 'ceres',
    name: 'Ceres',
    subTitle: 'Asteroid Belt',
    bodyType: 'Asteroid Belt',
    distanceOrder: 5,
    visualWidth: 'w-14 sm:w-16',
    visualHeight: 'h-14 sm:h-16',
    color: '#94A3B8',
    tagline: 'A rocky dwarf world inside the asteroid belt!',
    emoji: '🪨',
    isAsteroidBelt: true,
    moonIds: [],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    bodyType: '5th Planet (Gas Giant)',
    distanceOrder: 6,
    visualWidth: 'w-36 sm:w-44 md:w-48',
    visualHeight: 'h-36 sm:h-44 md:h-48',
    color: '#FB923C',
    tagline: 'The giant planet with a giant spinning storm!',
    emoji: '🌀',
    moonIds: ['europa', 'ganymede', 'callisto'],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    bodyType: '6th Planet (Ringed Giant)',
    distanceOrder: 7,
    visualWidth: 'w-32 sm:w-38 md:w-40',
    visualHeight: 'h-32 sm:h-38 md:h-40',
    color: '#FDE047',
    tagline: 'The golden planet wearing giant hula hoops!',
    emoji: '🪐',
    hasRings: true,
    moonIds: ['titan', 'enceladus'],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    bodyType: '7th Planet (Ice Giant)',
    distanceOrder: 8,
    visualWidth: 'w-26 sm:w-30',
    visualHeight: 'h-26 sm:h-30',
    color: '#22D3EE',
    tagline: 'The chilly light-blue ice ball rolling on its side!',
    emoji: '❄️',
    hasRings: true,
    moonIds: [],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    bodyType: '8th Planet (Windy Giant)',
    distanceOrder: 9,
    visualWidth: 'w-26 sm:w-30',
    visualHeight: 'h-26 sm:h-30',
    color: '#3B82F6',
    tagline: 'Deep blue and windy ice world far, far away!',
    emoji: '🌊',
    moonIds: ['triton'],
  },
  {
    id: 'pluto',
    name: 'Pluto',
    subTitle: 'Kuiper Belt',
    bodyType: 'Kuiper Belt',
    distanceOrder: 10,
    visualWidth: 'w-14 sm:w-16',
    visualHeight: 'h-14 sm:h-16',
    color: '#FDBA74',
    tagline: 'A tiny frozen world at the edge of space!',
    emoji: '🤍',
    isKuiperBelt: true,
    moonIds: [],
  },
];

export default function SolarSystemView({ celestialBodies = [], onSelectDestination }) {
  const { triggerSynth, speak } = useSpaceAudio();

  // View state: 'solarsystem' (Left-to-Right panoramic track) | 'planetary' (Specific planet + moons view)
  const [viewLevel, setViewLevel] = useState('solarsystem');
  const [selectedPlanetId, setSelectedPlanetId] = useState('earth');

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

  // Scroll left/right along the panoramic solar highway
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -450 : 450;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      triggerSynth('whoosh');
    }
  };

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
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-slate-950 text-white">
      
      {/* ======================================================== */}
      {/* LEVEL 1: LEFT-TO-RIGHT SOLAR SYSTEM PANORAMIC VIEW       */}
      {/* ======================================================== */}
      {viewLevel === 'solarsystem' ? (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          
          {/* Top Mission Breadcrumb & Quick Jump Nav Bar */}
          <div className="relative z-20 w-full px-3 sm:px-6 pt-2 pb-1.5 flex items-center justify-between gap-2 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-transparent">
            {/* Mission Title */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg">
                <Orbit className="w-4 h-4 text-yellow-300 animate-spin" />
                <span>Solar System Highway</span>
              </div>
              <span className="text-[11px] text-slate-400 font-bold hidden md:inline">
                Left-to-right from Sun to Pluto • Tap any world to explore!
              </span>
            </div>

            {/* Quick World Jump Chips */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[55%] sm:max-w-[70%] py-0.5 scrollbar-none">
              {SOLAR_SYSTEM_ORDER.map((item) => (
                <button
                  key={`chip-${item.id}`}
                  onClick={() => handleJumpToPlanet(item.id)}
                  style={{ touchAction: 'manipulation' }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition-all flex items-center gap-1"
                >
                  <span>{item.emoji}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Left / Right Panoramic Scroll Buttons */}
          <button
            onClick={() => handleScroll('left')}
            style={{ touchAction: 'manipulation' }}
            aria-label="Scroll Sunward"
            className="cockpit-btn absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-2 border-cyan-400/60 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-7 h-7 text-yellow-300" />
          </button>

          <button
            onClick={() => handleScroll('right')}
            style={{ touchAction: 'manipulation' }}
            aria-label="Scroll to Deep Space"
            className="cockpit-btn absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-2 border-cyan-400/60 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-7 h-7 text-yellow-300" />
          </button>

          {/* Main Horizontal Panoramic Highway Canvas */}
          <div
            ref={scrollContainerRef}
            className="relative flex-1 w-full h-full flex items-center overflow-x-auto overflow-y-hidden px-10 sm:px-16 gap-6 sm:gap-10 pointer-events-auto scrollbar-none"
            style={{ touchAction: 'pan-x' }}
          >
            {/* Soft Ambient Cosmic Gradient & Twinkling Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Glowing Distance Axis Line running behind all planets */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-amber-400/40 via-cyan-400/30 to-indigo-500/30 pointer-events-none" />

            {/* 1. THE SUN (Leftmost Sovereign Anchor) */}
            <div
              id="planet-card-sun"
              className="relative shrink-0 flex flex-col items-center justify-center z-10 group"
            >
              {/* Radial Corona Aura Glow */}
              <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-r from-yellow-400/30 via-orange-500/20 to-transparent blur-3xl pointer-events-none animate-pulse" />

              {/* Sun Sphere Touch Target */}
              <div
                onClick={() => handleOpenPlanetarySystem(SOLAR_SYSTEM_ORDER[0])}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn relative w-44 sm:w-56 md:w-64 h-44 sm:h-56 md:h-64 rounded-full p-1 cursor-pointer transition-transform duration-300 group-hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(245,158,11,0.85)] border-4 border-yellow-200"
              >
                {bodyMap['sun']?.thumbnail_image_path ? (
                  <img
                    src={bodyMap['sun'].thumbnail_image_path}
                    alt="Sun"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-600" />
                )}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
              </div>

              {/* Sun Info Card */}
              <div className="mt-4 flex flex-col items-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-yellow-300 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-1.5">
                  <span>☀️</span>
                  <span>THE SUN</span>
                </span>
                <span className="text-xs text-amber-200 font-extrabold max-w-[200px] mt-0.5">
                  Big, bright, and super warm!
                </span>
                <button
                  onClick={() => handleOpenPlanetarySystem(SOLAR_SYSTEM_ORDER[0])}
                  style={{ touchAction: 'manipulation' }}
                  className="cockpit-btn mt-2.5 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1 transition-transform group-hover:scale-105"
                >
                  <span>Explore Sun</span>
                  <Rocket className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. THE PLANETS & BELTS FROM MERCURY TO PLUTO */}
            {SOLAR_SYSTEM_ORDER.slice(1).map((item) => {
              const body = bodyMap[item.id];
              if (!body) return null;
              const moonList = (item.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

              return (
                <React.Fragment key={`panoramic-item-${item.id}`}>
                  
                  {/* Asteroid Belt Graphic Divider (Between Mars & Jupiter) */}
                  {item.id === 'jupiter' && (
                    <div className="shrink-0 flex flex-col items-center justify-center px-4 py-8 relative">
                      <div className="h-64 sm:h-80 w-12 border-x-2 border-dashed border-slate-600/50 rounded-3xl flex flex-col items-center justify-around py-4 bg-slate-900/40">
                        <span className="text-base animate-pulse">🪨</span>
                        <span className="text-xs">✨</span>
                        <span className="text-base animate-bounce">🪨</span>
                        <span className="text-xs">✨</span>
                        <span className="text-base">🪨</span>
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-2 whitespace-nowrap">
                        Asteroid Belt
                      </span>
                    </div>
                  )}

                  {/* Celestial Body Card */}
                  <div
                    id={`planet-card-${item.id}`}
                    className="relative shrink-0 flex flex-col items-center justify-center group min-w-[190px] sm:min-w-[230px]"
                  >
                    {/* Companion Moons Preview Cluster (Floating above parent planet) */}
                    {moonList.length > 0 && (
                      <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-yellow-300/60 shadow-lg">
                        <span className="text-xs">🌙</span>
                        <span className="text-[11px] font-black text-yellow-300">
                          {moonList.length} {moonList.length === 1 ? 'Moon' : 'Moons'}
                        </span>
                        <div className="flex -space-x-1.5 ml-1">
                          {moonList.map((m) => (
                            <img
                              key={`preview-moon-${m.id}`}
                              src={m.thumbnail_image_path}
                              alt={m.name}
                              className="w-5 h-5 rounded-full object-cover border border-white/80"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Planet Interactive Sphere */}
                    <div
                      onClick={() => handleOpenPlanetarySystem(item)}
                      style={{ touchAction: 'manipulation' }}
                      className={`cockpit-btn relative ${item.visualWidth} ${item.visualHeight} rounded-full p-1 cursor-pointer transition-all duration-300 group-hover:scale-110 active:scale-95 flex items-center justify-center`}
                    >
                      {/* Saturn's Rings Graphic */}
                      {item.hasRings && item.id === 'saturn' && (
                        <div className="absolute w-[210%] h-[60%] border-4 border-yellow-200/80 rounded-[100%] rotate-[-22deg] pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.5)]" />
                      )}

                      {/* Uranus Vertical Rings Graphic */}
                      {item.hasRings && item.id === 'uranus' && (
                        <div className="absolute w-[60%] h-[190%] border-2 border-cyan-200/60 rounded-[100%] rotate-[10deg] pointer-events-none" />
                      )}

                      {/* Colored Atmosphere Glow */}
                      <div
                        className="absolute inset-0 rounded-full blur-md opacity-60 group-hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: item.color }}
                      />

                      {/* NASA Spacecraft WebP Photo */}
                      {body.thumbnail_image_path ? (
                        <img
                          src={body.thumbnail_image_path}
                          alt={body.name}
                          className="relative w-full h-full rounded-full object-cover border-2 border-white/90 shadow-2xl z-10"
                        />
                      ) : (
                        <div
                          className="relative w-full h-full rounded-full flex items-center justify-center border-2 border-white/90 shadow-2xl z-10"
                          style={{ backgroundColor: item.color }}
                        >
                          <span className="text-3xl">{body.emoji || '🪐'}</span>
                        </div>
                      )}
                    </div>

                    {/* Planet Text Plate & Action Button */}
                    <div className="mt-3 flex flex-col items-center text-center max-w-[210px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg sm:text-xl font-black text-white uppercase tracking-wider drop-shadow-md">
                          {body.name}
                        </span>
                        <span className="text-sm">{body.emoji}</span>
                      </div>

                      <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-wide">
                        {item.bodyType}
                      </span>

                      <span className="text-[11px] text-yellow-200 font-bold line-clamp-2 mt-1 leading-snug px-1">
                        "{body.tagline}"
                      </span>

                      {/* Direct Explore / Planetary System Button */}
                      <button
                        onClick={() => handleOpenPlanetarySystem(item)}
                        style={{
                          touchAction: 'manipulation',
                          borderColor: item.color,
                        }}
                        className="cockpit-btn mt-3 w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black text-xs uppercase tracking-wider border-2 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 group-hover:border-yellow-300"
                      >
                        <span>Explore {body.name}</span>
                        <Rocket className="w-3.5 h-3.5 text-yellow-300" />
                      </button>
                    </div>

                  </div>
                </React.Fragment>
              );
            })}

          </div>

          {/* Bottom Guidance Prompt Bar (Unobtrusive) */}
          <div className="relative z-20 w-full px-4 py-2 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
            <span className="text-yellow-300 animate-bounce">👉</span>
            <span>Tap any planet above to view its planetary system and companion moons!</span>
          </div>

        </div>
      ) : (
        /* ======================================================== */
        /* LEVEL 2: PLANETARY SYSTEM VIEW (Parent World + Moons)    */
        /* ======================================================== */
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden p-3 sm:p-6">
          
          {/* Top Navigation & Breadcrumbs */}
          <div className="relative z-20 w-full flex items-center justify-between pb-2 border-b border-slate-800">
            {/* Back to Solar System Button */}
            <button
              onClick={handleBackToSolarSystem}
              style={{ touchAction: 'manipulation' }}
              className="cockpit-btn px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back to Solar System</span>
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{activePlanetBody.emoji || '🪐'}</span>
              <div className="text-right">
                <span className="text-xs text-cyan-300 font-extrabold uppercase tracking-widest block">
                  Solar System &gt; Planetary System
                </span>
                <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  {activePlanetBody.name} System
                </span>
              </div>
            </div>
          </div>

          {/* Main Stage: Parent Planet & Companion Moon Family */}
          <div className="relative flex-1 w-full flex flex-col md:flex-row items-center justify-around gap-6 py-4 overflow-y-auto">
            
            {/* 1. PARENT PLANET SPOTLIGHT HERO */}
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="relative">
                {/* Saturn Ring in System View */}
                {activePlanetConfig.id === 'saturn' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-28 border-4 border-yellow-200/80 rounded-[100%] rotate-[-22deg] pointer-events-none shadow-[0_0_30px_rgba(253,224,71,0.6)]" />
                )}

                {/* Planet Image Sphere */}
                <div
                  className="w-40 h-40 sm:w-52 sm:h-52 rounded-full p-1.5 border-4 shadow-2xl relative z-10 flex items-center justify-center bg-slate-900"
                  style={{ borderColor: activePlanetBody.color || '#38bdf8' }}
                >
                  {activePlanetBody.thumbnail_image_path ? (
                    <img
                      src={activePlanetBody.thumbnail_image_path}
                      alt={activePlanetBody.name}
                      className="w-full h-full rounded-full object-cover shadow-inner"
                    />
                  ) : (
                    <span className="text-6xl">{activePlanetBody.emoji}</span>
                  )}
                </div>
              </div>

              {/* Title & Tagline */}
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-3">
                {activePlanetBody.name}
              </h2>
              <span className="text-xs text-cyan-300 font-extrabold uppercase tracking-widest">
                {activePlanetBody.body_type}
              </span>
              <p className="text-sm text-yellow-200 font-bold mt-1 max-w-xs">
                "{activePlanetBody.tagline}"
              </p>

              {/* Big Blast Off to Parent Planet Button */}
              <button
                onClick={() => handleBlastOff(activePlanetBody)}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn mt-4 w-full min-h-[64px] px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <Rocket className="w-6 h-6" />
                <span>Fly to {activePlanetBody.name}!</span>
              </button>
            </div>

            {/* 2. COMPANION MOONS / SATELLITES */}
            <div className="flex-1 w-full max-w-md flex flex-col items-center md:items-start">
              {companionMoons.length > 0 ? (
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🌙</span>
                    <h3 className="text-base sm:text-lg font-black uppercase text-yellow-300 tracking-wider">
                      Companion Moons ({companionMoons.length})
                    </h3>
                  </div>

                  {/* Moons Selection List */}
                  <div className="flex flex-col gap-3 w-full">
                    {companionMoons.map((moon) => (
                      <div
                        key={`system-moon-${moon.id}`}
                        className="w-full p-3 rounded-2xl bg-slate-900/90 border-2 border-slate-700 hover:border-yellow-300 flex items-center justify-between gap-3 shadow-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={moon.thumbnail_image_path}
                            alt={moon.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0"
                          />
                          <div className="flex flex-col text-left">
                            <span className="text-base font-black uppercase text-white">
                              {moon.name}
                            </span>
                            <span className="text-xs text-yellow-300 font-bold line-clamp-1">
                              {moon.tagline}
                            </span>
                          </div>
                        </div>

                        {/* Blast off to Moon Button */}
                        <button
                          onClick={() => handleBlastOff(moon)}
                          style={{ touchAction: 'manipulation' }}
                          className="cockpit-btn px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95"
                        >
                          <span>Visit</span>
                          <Rocket className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Solo Body Info (Sun, Mercury, Venus, Ceres, Uranus, Pluto) */
                <div className="w-full p-5 rounded-3xl bg-slate-900/80 border-2 border-slate-700 text-center md:text-left shadow-xl">
                  <span className="text-xs font-black uppercase text-cyan-300 tracking-widest block mb-1">
                    Solo Explorer World
                  </span>
                  <p className="text-sm text-slate-300 font-semibold leading-relaxed">
                    {activePlanetBody.name} travels through outer space without companion moons! Tap the big green button to blast off and explore its surface, gravity, and fun toddler adventures!
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-yellow-300">
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-600">
                      🌡️ {activePlanetBody.mean_temp_celsius}°C
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-600">
                      ⚖️ {activePlanetBody.gravity_m_s2} m/s² Gravity
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
