import React, { useState, useRef } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import CartoonCelestialBody from './CartoonCelestialBody';
import { Rocket, Sparkles, ChevronLeft, ChevronRight, ArrowLeft, Orbit } from 'lucide-react';

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
      const scrollAmount = direction === 'left' ? -280 : 280;
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

          {/* Left / Right Scroll Buttons (Helpful on narrower screens) */}
          <button
            onClick={() => handleScroll('left')}
            style={{ touchAction: 'manipulation' }}
            aria-label="Scroll Sunward"
            className="cockpit-btn absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/60 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-yellow-300" />
          </button>

          <button
            onClick={() => handleScroll('right')}
            style={{ touchAction: 'manipulation' }}
            aria-label="Scroll to Deep Space"
            className="cockpit-btn absolute right-1.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/60 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 text-yellow-300" />
          </button>

          {/* Main Panoramic Highway Canvas (Centered Sun & Moderate Stagger) */}
          <div
            ref={scrollContainerRef}
            className="relative flex-1 w-full h-full flex items-center overflow-x-auto overflow-y-hidden px-6 sm:px-10 gap-2 sm:gap-3 md:gap-4 pointer-events-auto scrollbar-none"
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
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden p-3 sm:p-5">
          
          {/* Top Breadcrumbs & Back Navigation */}
          <div className="relative z-20 w-full flex items-center justify-between pb-2 border-b border-slate-800">
            <button
              onClick={handleBackToSolarSystem}
              style={{ touchAction: 'manipulation' }}
              className="cockpit-btn px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
              <span>Solar System</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl">{activePlanetBody.emoji || '🪐'}</span>
              <div className="text-right">
                <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-widest block">
                  Solar System &gt; Planetary System
                </span>
                <span className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  {activePlanetBody.name} System
                </span>
              </div>
            </div>
          </div>

          {/* Main Stage: Cartoon Parent Planet & Cartoon Companion Moons */}
          <div className="relative flex-1 w-full flex flex-col md:flex-row items-center justify-around gap-4 sm:gap-6 py-2 overflow-y-auto">
            
            {/* 1. PARENT PLANET SPOTLIGHT (Cartoon Art) */}
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative p-2 flex items-center justify-center">
                <CartoonCelestialBody
                  id={activePlanetConfig.id}
                  size={activePlanetConfig.id === 'saturn' ? 120 : 100}
                />
              </div>

              {/* Title & Tagline */}
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide mt-1">
                {activePlanetBody.name}
              </h2>
              <span className="text-[11px] text-cyan-300 font-extrabold uppercase tracking-wider">
                {activePlanetBody.body_type}
              </span>
              <p className="text-xs text-yellow-200 font-bold mt-0.5 max-w-xs">
                "{activePlanetBody.tagline}"
              </p>

              {/* Blast Off to Parent Planet Button */}
              <button
                onClick={() => handleBlastOff(activePlanetBody)}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn mt-3 w-full min-h-[52px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <Rocket className="w-5 h-5" />
                <span>Fly to {activePlanetBody.name}!</span>
              </button>
            </div>

            {/* 2. COMPANION MOONS (Cartoon Art) */}
            <div className="flex-1 w-full max-w-md flex flex-col items-center md:items-start">
              {companionMoons.length > 0 ? (
                <div className="w-full">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-lg">🌙</span>
                    <h3 className="text-sm sm:text-base font-black uppercase text-yellow-300 tracking-wider">
                      Companion Moons ({companionMoons.length})
                    </h3>
                  </div>

                  {/* Moons Selection List with Cartoon Art */}
                  <div className="flex flex-col gap-2 w-full">
                    {companionMoons.map((moon) => (
                      <div
                        key={`system-moon-${moon.id}`}
                        className="w-full p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-yellow-300 flex items-center justify-between gap-3 shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Cartoon Moon Icon */}
                          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0">
                            <CartoonCelestialBody id={moon.id} size={42} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-black uppercase text-white">
                              {moon.name}
                            </span>
                            <span className="text-[11px] text-yellow-300 font-bold line-clamp-1">
                              {moon.tagline}
                            </span>
                          </div>
                        </div>

                        {/* Blast off to Moon Button */}
                        <button
                          onClick={() => handleBlastOff(moon)}
                          style={{ touchAction: 'manipulation' }}
                          className="cockpit-btn px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1 shrink-0 transition-transform hover:scale-105 active:scale-95"
                        >
                          <span>Visit</span>
                          <Rocket className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Solo Body Info */
                <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-center md:text-left shadow-lg">
                  <span className="text-[11px] font-black uppercase text-cyan-300 tracking-widest block mb-1">
                    Solo Explorer World
                  </span>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    {activePlanetBody.name} travels through outer space without companion moons! Tap the green button above to blast off and explore authentic NASA spacecraft photos, gravity, and toddler adventures!
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-yellow-300">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-600">
                      🌡️ {activePlanetBody.mean_temp_celsius}°C
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-600">
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
