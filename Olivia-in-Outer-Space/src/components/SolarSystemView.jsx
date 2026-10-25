import React, { useState } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { Sparkles, Compass, Rocket, Orbit, ListFilter, ArrowRight } from 'lucide-react';

// Coordinates for top-down concentric orbital view (centered at cx=400, cy=350)
const ORBIT_CONFIG = [
  { id: 'sun', radius: 0, angle: 0, size: 54 },
  { id: 'mercury', radius: 55, angle: 30, size: 20 },
  { id: 'venus', radius: 95, angle: 110, size: 26 },
  { id: 'earth', radius: 140, angle: 200, size: 30, moonIds: ['moon'] },
  { id: 'mars', radius: 185, angle: 305, size: 24, moonIds: ['phobos', 'deimos'] },
  { id: 'ceres', radius: 220, angle: 70, size: 16 }, // Asteroid belt
  { id: 'jupiter', radius: 265, angle: 160, size: 42, moonIds: ['europa', 'ganymede', 'callisto'] },
  { id: 'saturn', radius: 315, angle: 265, size: 38, moonIds: ['titan', 'enceladus'] },
  { id: 'uranus', radius: 360, angle: 15, size: 28 },
  { id: 'neptune', radius: 405, angle: 125, size: 28, moonIds: ['triton'] },
  { id: 'pluto', radius: 450, angle: 225, size: 16 },
];

export default function SolarSystemView({ celestialBodies = [], onSelectDestination }) {
  const { triggerSynth, speak } = useSpaceAudio();
  const [selectedSystemId, setSelectedSystemId] = useState('earth');
  const [viewMode, setViewMode] = useState('orrery'); // 'orrery' | 'highway'

  // Map bodies by ID for O(1) lookup
  const bodyMap = {};
  celestialBodies.forEach((b) => {
    bodyMap[b.id] = b;
  });

  // Active selected system
  const activeSystem = ORBIT_CONFIG.find((s) => s.id === selectedSystemId) || ORBIT_CONFIG[3]; // Earth default
  const activeParentBody = bodyMap[activeSystem.id] || bodyMap['earth'];
  const activeMoons = (activeSystem.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

  const handleSystemTap = (sysConfig) => {
    const body = bodyMap[sysConfig.id];
    if (!body) return;

    setSelectedSystemId(sysConfig.id);
    triggerSynth('beep');
    const moonCount = (sysConfig.moonIds || []).length;
    if (moonCount > 0) {
      speak(`${body.name} system! Found ${moonCount} companion ${moonCount === 1 ? 'moon' : 'moons'}! Tap to explore!`);
    } else {
      speak(`${body.name}! ${body.tagline || ''}`);
    }
  };

  const handleLaunch = (body) => {
    triggerSynth('blastoff');
    speak(`Course plotted for ${body.name}! Ready for launch!`);
    onSelectDestination(body);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      
      {/* Top Map HUD Controls: View Mode & Mission Guidance */}
      <div className="relative z-20 w-full px-4 pt-2 pb-1 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
            <Orbit className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>Top-Down Solar System</span>
          </div>
        </div>

        {/* View Mode Switcher (Top-Down Orrery vs Solar Highway) */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-700 shadow-md">
          <button
            onClick={() => {
              triggerSynth('beep');
              setViewMode('orrery');
            }}
            style={{ touchAction: 'manipulation' }}
            className={`cockpit-btn px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition-all ${
              viewMode === 'orrery'
                ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🪐 Orbit Map
          </button>
          <button
            onClick={() => {
              triggerSynth('beep');
              setViewMode('highway');
            }}
            style={{ touchAction: 'manipulation' }}
            className={`cockpit-btn px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition-all ${
              viewMode === 'highway'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚀 Solar Highway
          </button>
        </div>
      </div>

      {/* Main Interactive Solar System Map Area */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        
        {/* ======================================================== */}
        {/* MODE 1: TOP-DOWN CONCENTRIC ORBIT MAP (ORRERY)           */}
        {/* ======================================================== */}
        {viewMode === 'orrery' ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-2">
            
            {/* SVG Orbit Tracks & Concentric Paths */}
            <svg
              viewBox="0 0 800 700"
              className="w-full h-full max-w-[850px] max-h-[600px] pointer-events-none drop-shadow-2xl"
            >
              <defs>
                {/* Sun Radial Glow */}
                <radialGradient id="sun-radial-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#fde047" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Orbital Circles */}
              {ORBIT_CONFIG.filter((o) => o.radius > 0).map((orb) => {
                const isSelected = selectedSystemId === orb.id;
                const isAsteroidBelt = orb.id === 'ceres';

                return (
                  <ellipse
                    key={`track-${orb.id}`}
                    cx="400"
                    cy="350"
                    rx={orb.radius * 0.88}
                    ry={orb.radius * 0.72}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : isAsteroidBelt ? '#94a3b8' : '#334155'}
                    strokeWidth={isSelected ? '2.5' : isAsteroidBelt ? '1.5' : '1'}
                    strokeDasharray={isAsteroidBelt ? '3 5' : isSelected ? '4 2' : 'none'}
                    opacity={isSelected ? 0.9 : 0.45}
                  />
                );
              })}

              {/* Sun Ambient Light Rays */}
              <circle cx="400" cy="350" r="90" fill="url(#sun-radial-glow)" opacity="0.65" />
            </svg>

            {/* Interactive Celestial Body Nodes Positioned on Orbits */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[800px] h-[700px] max-w-full max-h-full">
                
                {/* 1. The Sun at the center */}
                <div
                  onClick={() => handleSystemTap(ORBIT_CONFIG[0])}
                  style={{ touchAction: 'manipulation' }}
                  className="cockpit-btn absolute left-[400px] top-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer pointer-events-auto z-20 group transition-transform hover:scale-110 active:scale-95"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_50px_rgba(250,204,21,0.9)] border-2 border-white flex flex-col items-center justify-center text-center">
                    <span className="text-xl sm:text-2xl filter drop-shadow">☀️</span>
                    <span className="text-[9px] font-black uppercase text-slate-950 tracking-wider">Sun</span>
                  </div>
                </div>

                {/* 2. Planetary Systems along orbits */}
                {ORBIT_CONFIG.filter((o) => o.radius > 0).map((orb) => {
                  const body = bodyMap[orb.id];
                  if (!body) return null;

                  const isSelected = selectedSystemId === orb.id;
                  const rad = (orb.angle * Math.PI) / 180;
                  // Map along elliptical orbit
                  const x = 400 + Math.cos(rad) * (orb.radius * 0.88);
                  const y = 350 + Math.sin(rad) * (orb.radius * 0.72);
                  const moonList = (orb.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

                  return (
                    <div
                      key={`node-${orb.id}`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        touchAction: 'manipulation',
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 flex flex-col items-center"
                    >
                      {/* Planet Button Node */}
                      <button
                        onClick={() => handleSystemTap(orb)}
                        aria-label={`Select ${body.name}`}
                        className={`cockpit-btn relative rounded-full p-0.5 border-2 transition-all duration-200 group flex items-center justify-center ${
                          isSelected
                            ? 'ring-4 ring-yellow-300 scale-125 z-30 shadow-[0_0_35px_rgba(56,189,248,0.9)]'
                            : 'hover:scale-115 active:scale-95 shadow-md'
                        }`}
                        style={{
                          borderColor: body.color || '#38bdf8',
                          backgroundColor: '#0f172a',
                        }}
                      >
                        {/* Real NASA Photo Thumbnail */}
                        {body.thumbnail_image_path ? (
                          <img
                            src={body.thumbnail_image_path}
                            alt={body.name}
                            style={{
                              width: `${Math.max(orb.size, 26)}px`,
                              height: `${Math.max(orb.size, 26)}px`,
                            }}
                            className="rounded-full object-cover border border-white/60"
                          />
                        ) : (
                          <span className="text-lg filter drop-shadow">{body.emoji || '🪐'}</span>
                        )}

                        {/* Saturn Ring Graphic on map */}
                        {orb.id === 'saturn' && (
                          <div className="absolute w-[170%] h-[55%] border-2 border-amber-200/80 rounded-[100%] rotate-[22deg] pointer-events-none" />
                        )}

                        {/* Mini Moon Satellite Badges Grouped around Parent Planet */}
                        {moonList.length > 0 && (
                          <div className="absolute -top-1 -right-2 px-1 rounded-full bg-slate-900 border border-yellow-300 text-[8px] font-black text-yellow-300 flex items-center gap-0.5 shadow-md">
                            <span>🌙</span>
                            <span>{moonList.length}</span>
                          </div>
                        )}
                      </button>

                      {/* Planet Name Pill */}
                      <div
                        className={`mt-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-md pointer-events-none transition-all ${
                          isSelected
                            ? 'bg-yellow-400 text-slate-950 scale-110 font-extrabold border border-slate-900'
                            : 'bg-slate-900/90 text-white/90 border border-slate-700'
                        }`}
                      >
                        {body.name}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* MODE 2: SOLAR HIGHWAY (LINEAR DISTANCE TRACK)             */
          /* ======================================================== */
          <div className="w-full h-full flex items-center overflow-x-auto px-6 py-4 gap-4 pointer-events-auto scrollbar-thin">
            {ORBIT_CONFIG.map((orb) => {
              const body = bodyMap[orb.id];
              if (!body) return null;
              const isSelected = selectedSystemId === orb.id;
              const moonList = (orb.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

              return (
                <div
                  key={`highway-${orb.id}`}
                  onClick={() => handleSystemTap(orb)}
                  style={{
                    touchAction: 'manipulation',
                    borderColor: isSelected ? '#fde047' : body.color || '#475569',
                  }}
                  className={`cockpit-btn min-w-[150px] sm:min-w-[170px] p-3 rounded-3xl border-3 flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-yellow-300 ring-4 ring-yellow-400/50 scale-105 shadow-2xl'
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">
                    {body.body_type}
                  </div>

                  {/* Body Image */}
                  <div className="relative my-2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-1 bg-slate-950 shadow-inner">
                    {body.thumbnail_image_path ? (
                      <img
                        src={body.thumbnail_image_path}
                        alt={body.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white/80 shadow-md"
                      />
                    ) : (
                      <span className="text-4xl">{body.emoji}</span>
                    )}

                    {orb.id === 'saturn' && (
                      <div className="absolute w-[150%] h-[50%] border-2 border-amber-200/80 rounded-[100%] rotate-[20deg] pointer-events-none" />
                    )}
                  </div>

                  <div className="text-base font-black text-white">{body.name}</div>
                  <div className="text-[10px] font-bold text-yellow-300 line-clamp-1 mt-0.5">
                    {body.tagline}
                  </div>

                  {/* Moons Indicator */}
                  {moonList.length > 0 ? (
                    <div className="mt-2 px-2 py-0.5 rounded-full bg-slate-800 border border-yellow-300/60 text-[10px] font-extrabold text-yellow-200 flex items-center gap-1">
                      <span>🌙</span>
                      <span>{moonList.length} Companion {moonList.length === 1 ? 'Moon' : 'Moons'}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-[9px] text-slate-400 font-semibold">
                      Solo Traveler
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* BOTTOM CONSOLE: SELECTED PLANET & GROUPED MOONS TRAY     */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 border-t-4 border-slate-700 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] px-3 sm:px-6 pt-2 pb-3 pointer-events-auto">
        
        {/* System Header Info */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeParentBody.emoji || '🪐'}</span>
            <div>
              <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                {activeParentBody.name} System
              </span>
              <span className="text-xs text-yellow-300 font-bold ml-2">
                "{activeParentBody.tagline}"
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-cyan-300 font-black">
            <span>SELECT DESTINATION TO FLY!</span>
            <ArrowRight className="w-4 h-4 text-yellow-300" />
          </div>
        </div>

        {/* Grouped Destination Buttons: Parent Planet + Its Moons */}
        <div className="w-full max-w-5xl mx-auto flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3.5 overflow-x-auto pb-1">
          
          {/* 1. Parent Planet Big Push Button */}
          <button
            onClick={() => handleLaunch(activeParentBody)}
            style={{
              touchAction: 'manipulation',
              borderColor: activeParentBody.color || '#38bdf8',
            }}
            className="cockpit-btn flex-1 min-w-[160px] min-h-[88px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border-3 flex items-center justify-between gap-3 shadow-xl hover:scale-[1.02] active:scale-95 group transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={activeParentBody.thumbnail_image_path}
                alt={activeParentBody.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/90 shadow-md shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="text-base sm:text-lg font-black uppercase text-white">
                  {activeParentBody.name}
                </span>
                <span className="text-[10px] text-cyan-300 font-bold uppercase">
                  {activeParentBody.body_type} Base
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shrink-0">
              🚀 Fly!
            </div>
          </button>

          {/* 2. Grouped Moons (If Any) */}
          {activeMoons.map((moon) => (
            <button
              key={moon.id}
              onClick={() => handleLaunch(moon)}
              style={{
                touchAction: 'manipulation',
                borderColor: moon.color || '#e2e8f0',
              }}
              className="cockpit-btn flex-1 min-w-[160px] min-h-[88px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/80 text-white border-2 flex items-center justify-between gap-3 shadow-lg hover:scale-[1.02] active:scale-95 group transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={moon.thumbnail_image_path}
                  alt={moon.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0"
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-sm sm:text-base font-black uppercase text-white">
                      {moon.name}
                    </span>
                    <span className="text-xs">{moon.emoji || '🌙'}</span>
                  </div>
                  <span className="text-[10px] text-yellow-300 font-bold line-clamp-1">
                    {moon.tagline}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shrink-0">
                🌙 Visit
              </div>
            </button>
          ))}

        </div>

      </div>

    </div>
  );
}
