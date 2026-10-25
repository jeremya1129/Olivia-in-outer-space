import React, { useState } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { Rocket, Sparkles, Orbit, ZoomIn, ZoomOut, Compass, ChevronRight, X, Globe, Star } from 'lucide-react';

/**
 * Astronomical Top-Down Solar System Configuration
 * All coordinates are in SVG viewBox (1100 x 1100), Center cx=550, cy=550
 * Progressive radial scale ensuring every orbit has ample breathing room,
 * zero collisions, and true concentric circular paths.
 */
const SYSTEM_BODIES = [
  {
    id: 'sun',
    orbitRadius: 0,
    angle: 0,
    visualRadius: 40,
    label: 'Sun',
    tag: 'Star',
    color: '#FFD700',
    moonIds: [],
  },
  {
    id: 'mercury',
    orbitRadius: 85,
    angle: 35,
    visualRadius: 15,
    label: 'Mercury',
    tag: '1st Planet',
    color: '#A0A0A0',
    moonIds: [],
  },
  {
    id: 'venus',
    orbitRadius: 130,
    angle: 125,
    visualRadius: 19,
    label: 'Venus',
    tag: '2nd Planet',
    color: '#F59E0B',
    moonIds: [],
  },
  {
    id: 'earth',
    orbitRadius: 180,
    angle: 215,
    visualRadius: 22,
    label: 'Earth',
    tag: '3rd Planet (Home)',
    color: '#38BDF8',
    moonIds: ['moon'],
    moonOffsets: [
      { id: 'moon', dist: 36, angle: 45, radius: 10, label: 'The Moon' }
    ]
  },
  {
    id: 'mars',
    orbitRadius: 230,
    angle: 320,
    visualRadius: 17,
    label: 'Mars',
    tag: '4th Planet',
    color: '#EF4444',
    moonIds: ['phobos', 'deimos'],
    moonOffsets: [
      { id: 'phobos', dist: 30, angle: 30, radius: 8, label: 'Phobos' },
      { id: 'deimos', dist: 32, angle: 210, radius: 7, label: 'Deimos' }
    ]
  },
  {
    id: 'ceres',
    orbitRadius: 275,
    angle: 70,
    visualRadius: 12,
    label: 'Ceres',
    tag: 'Asteroid Belt',
    color: '#94A3B8',
    moonIds: [],
    isAsteroidBelt: true
  },
  {
    id: 'jupiter',
    orbitRadius: 335,
    angle: 165,
    visualRadius: 32,
    label: 'Jupiter',
    tag: '5th Planet (Giant)',
    color: '#FB923C',
    moonIds: ['europa', 'ganymede', 'callisto'],
    moonOffsets: [
      { id: 'europa', dist: 46, angle: -35, radius: 10, label: 'Europa' },
      { id: 'ganymede', dist: 48, angle: 75, radius: 12, label: 'Ganymede' },
      { id: 'callisto', dist: 50, angle: 195, radius: 11, label: 'Callisto' }
    ]
  },
  {
    id: 'saturn',
    orbitRadius: 395,
    angle: 275,
    visualRadius: 26,
    label: 'Saturn',
    tag: '6th Planet (Rings)',
    color: '#FDE047',
    hasRings: true,
    moonIds: ['titan', 'enceladus'],
    moonOffsets: [
      { id: 'titan', dist: 54, angle: 40, radius: 11, label: 'Titan' },
      { id: 'enceladus', dist: 54, angle: 220, radius: 9, label: 'Enceladus' }
    ]
  },
  {
    id: 'uranus',
    orbitRadius: 450,
    angle: 15,
    visualRadius: 20,
    label: 'Uranus',
    tag: '7th Planet (Ice Giant)',
    color: '#22D3EE',
    hasRings: true,
    moonIds: [],
  },
  {
    id: 'neptune',
    orbitRadius: 495,
    angle: 105,
    visualRadius: 20,
    label: 'Neptune',
    tag: '8th Planet (Windy)',
    color: '#3B82F6',
    moonIds: ['triton'],
    moonOffsets: [
      { id: 'triton', dist: 38, angle: 45, radius: 10, label: 'Triton' }
    ]
  },
  {
    id: 'pluto',
    orbitRadius: 535,
    angle: 225,
    visualRadius: 12,
    label: 'Pluto',
    tag: 'Kuiper Belt',
    color: '#FDBA74',
    moonIds: [],
    isKuiperBelt: true
  }
];

// Pre-generated static Asteroid Belt particles for crisp, reproducible graphics
const ASTEROID_PARTICLES = Array.from({ length: 55 }, (_, i) => {
  const ang = (i * 360) / 55 + (i % 5) * 2;
  const rad = 265 + (i % 7) * 3;
  const x = 550 + Math.cos((ang * Math.PI) / 180) * rad;
  const y = 550 + Math.sin((ang * Math.PI) / 180) * rad;
  const r = (i % 3 === 0) ? 2.5 : (i % 2 === 0) ? 1.8 : 1.2;
  return { id: `ast-${i}`, x, y, r };
});

// Pre-generated Kuiper Belt icy particles
const KUIPER_PARTICLES = Array.from({ length: 45 }, (_, i) => {
  const ang = (i * 360) / 45 + ((i * 3) % 7);
  const rad = 525 + (i % 5) * 3.5;
  const x = 550 + Math.cos((ang * Math.PI) / 180) * rad;
  const y = 550 + Math.sin((ang * Math.PI) / 180) * rad;
  const r = (i % 2 === 0) ? 2 : 1.2;
  return { id: `kp-${i}`, x, y, r };
});

export default function SolarSystemView({ celestialBodies = [], onSelectDestination }) {
  const { triggerSynth, speak } = useSpaceAudio();

  // Selected planet system ID (null if browsing overview)
  const [selectedSystemId, setSelectedSystemId] = useState('earth');
  // Zoom mode: 'all' (full solar system) | 'inner' (rocky planets) | 'outer' (gas giants)
  const [zoomMode, setZoomMode] = useState('all');

  // Map bodies by id for O(1) metadata lookup
  const bodyMap = React.useMemo(() => {
    const map = {};
    celestialBodies.forEach((b) => {
      map[b.id] = b;
    });
    return map;
  }, [celestialBodies]);

  // Active highlighted system & companion moons
  const activeConfig = SYSTEM_BODIES.find((s) => s.id === selectedSystemId) || SYSTEM_BODIES[3]; // Earth default
  const activeParent = bodyMap[activeConfig.id] || bodyMap['earth'] || {};
  const companionMoons = (activeConfig.moonIds || []).map((id) => bodyMap[id]).filter(Boolean);

  // ViewBox dynamic coordinates based on zoomMode
  const currentViewBox = React.useMemo(() => {
    if (zoomMode === 'inner') {
      // Zoomed on Sun, Mercury, Venus, Earth + Moon, Mars + Moons, Asteroid Belt + Ceres
      return '240 240 620 620';
    }
    if (zoomMode === 'outer') {
      // Centered with wider view focusing on Asteroid belt out to Pluto
      return '70 70 960 960';
    }
    // Full solar system view (all 10 worlds)
    return '0 0 1100 1100';
  }, [zoomMode]);

  // Click handler for planet selection
  const handleSelectSystem = (sys) => {
    setSelectedSystemId(sys.id);
    triggerSynth('beep');
    const b = bodyMap[sys.id];
    const moonCount = (sys.moonIds || []).length;
    if (moonCount > 0) {
      speak(`${b?.name || sys.label} system! It has ${moonCount} companion ${moonCount === 1 ? 'moon' : 'moons'}!`);
    } else {
      speak(`${b?.name || sys.label}! ${b?.tagline || ''}`);
    }
  };

  // Launch handler directly into PlanetView destination
  const handleLaunchToDestination = (body) => {
    triggerSynth('blastoff');
    speak(`Plotting course for ${body.name}! Blasting off!`);
    onSelectDestination(body);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-slate-950">
      
      {/* ======================================================== */}
      {/* 1. TOP TOOLBAR: View Zoom & Mission Objective            */}
      {/* ======================================================== */}
      <div className="relative z-20 w-full px-3 sm:px-6 pt-2 pb-1.5 flex items-center justify-between gap-2 pointer-events-auto bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-transparent">
        
        {/* Left: Star Map Title */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg">
            <Orbit className="w-4 h-4 text-yellow-300 animate-spin" />
            <span className="tracking-wide">Solar System Star Map</span>
          </div>
          <span className="text-[11px] text-slate-400 font-bold hidden md:inline">
            Tap any planet or moon to fly!
          </span>
        </div>

        {/* Right: Zoom Presets */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-700 shadow-md">
          <button
            onClick={() => {
              triggerSynth('beep');
              setZoomMode('all');
              speak('Full solar system view!');
            }}
            style={{ touchAction: 'manipulation' }}
            className={`cockpit-btn px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              zoomMode === 'all'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌌 All Worlds
          </button>

          <button
            onClick={() => {
              triggerSynth('beep');
              setZoomMode('inner');
              speak('Zooming into rocky inner planets!');
            }}
            style={{ touchAction: 'manipulation' }}
            className={`cockpit-btn px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              zoomMode === 'inner'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌍 Rocky Inner
          </button>

          <button
            onClick={() => {
              triggerSynth('beep');
              setZoomMode('outer');
              speak('Zooming into outer gas giants!');
            }}
            style={{ touchAction: 'manipulation' }}
            className={`cockpit-btn px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              zoomMode === 'outer'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🪐 Gas Giants
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN TOP-DOWN SOLAR SYSTEM SVG CANVAS                 */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden p-1 sm:p-2">
        
        {/* Soft Background Starry Nebula Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />

        <svg
          viewBox={currentViewBox}
          className="w-full h-full max-w-[950px] max-h-[750px] transition-all duration-500 ease-out select-none drop-shadow-2xl"
          style={{ touchAction: 'manipulation' }}
        >
          <defs>
            {/* Sun Multi-Layer Radial Corona Glow */}
            <radialGradient id="sun-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#ea580c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="sun-outer-corona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Circular Clip Paths for Every Celestial Body to render real NASA WebP photos */}
            {celestialBodies.map((b) => (
              <clipPath key={`clip-${b.id}`} id={`clip-${b.id}`}>
                <circle cx="0" cy="0" r="100" />
              </clipPath>
            ))}
          </defs>

          {/* ---------------------------------------------------- */}
          {/* A. CONCENTRIC CIRCULAR ORBIT TRACKS                  */}
          {/* ---------------------------------------------------- */}
          {SYSTEM_BODIES.filter((s) => s.orbitRadius > 0).map((sys) => {
            const isSelected = selectedSystemId === sys.id;
            const isBelt = sys.isAsteroidBelt || sys.isKuiperBelt;

            return (
              <g key={`orbit-group-${sys.id}`}>
                {/* Main Circular Orbit Ring */}
                <circle
                  cx="550"
                  cy="550"
                  r={sys.orbitRadius}
                  fill="none"
                  stroke={isSelected ? '#38bdf8' : isBelt ? '#64748b' : '#334155'}
                  strokeWidth={isSelected ? '2.5' : isBelt ? '1.5' : '1.2'}
                  strokeDasharray={isBelt ? '3 6' : isSelected ? '5 3' : 'none'}
                  strokeOpacity={isSelected ? 0.95 : isBelt ? 0.5 : 0.4}
                  className="transition-colors duration-300"
                />

                {/* Subtle Orbit Glow when selected */}
                {isSelected && (
                  <circle
                    cx="550"
                    cy="550"
                    r={sys.orbitRadius}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="8"
                    strokeOpacity="0.18"
                  />
                )}
              </g>
            );
          })}

          {/* ---------------------------------------------------- */}
          {/* B. ASTEROID BELT (Between Mars and Jupiter)           */}
          {/* ---------------------------------------------------- */}
          <g id="asteroid-belt" opacity="0.8">
            <circle
              cx="550"
              cy="550"
              r="275"
              fill="none"
              stroke="#64748b"
              strokeWidth="24"
              strokeOpacity="0.08"
              strokeDasharray="4 8"
            />
            {ASTEROID_PARTICLES.map((ast) => (
              <circle
                key={ast.id}
                cx={ast.x}
                cy={ast.y}
                r={ast.r}
                fill="#94a3b8"
                opacity="0.65"
              />
            ))}
          </g>

          {/* ---------------------------------------------------- */}
          {/* C. KUIPER BELT (Outer Icy Dust Ring)                 */}
          {/* ---------------------------------------------------- */}
          <g id="kuiper-belt" opacity="0.65">
            <circle
              cx="550"
              cy="550"
              r="535"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="18"
              strokeOpacity="0.06"
              strokeDasharray="3 7"
            />
            {KUIPER_PARTICLES.map((kp) => (
              <circle
                key={kp.id}
                cx={kp.x}
                cy={kp.y}
                r={kp.r}
                fill="#7dd3fc"
                opacity="0.5"
              />
            ))}
          </g>

          {/* ---------------------------------------------------- */}
          {/* D. THE SUN (Central Star)                            */}
          {/* ---------------------------------------------------- */}
          <g
            id="node-sun"
            transform="translate(550, 550)"
            className="cursor-pointer group"
            onClick={() => handleSelectSystem(SYSTEM_BODIES[0])}
          >
            {/* Ambient Coronal Halo */}
            <circle cx="0" cy="0" r="105" fill="url(#sun-outer-corona)" />
            <circle cx="0" cy="0" r="70" fill="url(#sun-core-glow)" />

            {/* Glowing Selection Indicator Ring */}
            {selectedSystemId === 'sun' && (
              <circle
                cx="0"
                cy="0"
                r="48"
                fill="none"
                stroke="#fde047"
                strokeWidth="3.5"
                strokeDasharray="5 4"
                className="animate-spin"
              />
            )}

            {/* Sun Sphere with NASA SDO AIA 304 WebP Photo */}
            {bodyMap['sun']?.thumbnail_image_path ? (
              <g>
                <circle cx="0" cy="0" r="40" fill="#f59e0b" />
                <image
                  href={bodyMap['sun'].thumbnail_image_path}
                  x="-40"
                  y="-40"
                  width="80"
                  height="80"
                  clipPath="url(#clip-sun)"
                  preserveAspectRatio="xMidYMid slice"
                />
                <circle cx="0" cy="0" r="40" fill="none" stroke="#fde047" strokeWidth="2.5" />
              </g>
            ) : (
              <circle cx="0" cy="0" r="40" fill="url(#sun-core-glow)" stroke="#ffffff" strokeWidth="2" />
            )}

            {/* Sun Label */}
            <text
              x="0"
              y="58"
              textAnchor="middle"
              className="fill-yellow-300 font-black text-[12px] tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            >
              ☀️ Sun
            </text>

            {/* Generous touch target */}
            <circle cx="0" cy="0" r="50" fill="transparent" />
          </g>

          {/* ---------------------------------------------------- */}
          {/* E. PLANETS & GROUPED COMPANION MOONS                 */}
          {/* ---------------------------------------------------- */}
          {SYSTEM_BODIES.filter((s) => s.orbitRadius > 0).map((sys) => {
            const body = bodyMap[sys.id];
            if (!body) return null;

            const isSelected = selectedSystemId === sys.id;
            const rad = (sys.angle * Math.PI) / 180;
            // Exact coordinate on circular orbit
            const px = 550 + Math.cos(rad) * sys.orbitRadius;
            const py = 550 + Math.sin(rad) * sys.orbitRadius;

            return (
              <g key={`system-group-${sys.id}`}>
                
                {/* 1. COMPANION MOONS (Grouped directly with parent planet) */}
                {(sys.moonOffsets || []).map((mOff) => {
                  const moonBody = bodyMap[mOff.id];
                  if (!moonBody) return null;

                  const mRad = (mOff.angle * Math.PI) / 180;
                  const mx = px + Math.cos(mRad) * mOff.dist;
                  const my = py + Math.sin(mRad) * mOff.dist;
                  const isMoonSelected = selectedSystemId === mOff.id;

                  return (
                    <g
                      key={`moon-node-${mOff.id}`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSystem(sys);
                        triggerSynth('twinkle');
                        speak(`${moonBody.name}! Companion moon of ${body.name}!`);
                      }}
                    >
                      {/* Sub-orbit dashed ring around parent planet */}
                      <circle
                        cx={px}
                        cy={py}
                        r={mOff.dist}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="0.9"
                        strokeDasharray="2 3"
                        strokeOpacity="0.45"
                      />

                      {/* Line from Planet to Moon */}
                      <line
                        x1={px}
                        y1={py}
                        x2={mx}
                        y2={my}
                        stroke="#64748b"
                        strokeWidth="0.75"
                        strokeDasharray="1 3"
                        strokeOpacity="0.4"
                      />

                      {/* Moon Selection Ring */}
                      {isSelected && (
                        <circle
                          cx={mx}
                          cy={my}
                          r={mOff.radius + 4}
                          fill="none"
                          stroke="#fde047"
                          strokeWidth="1.8"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Moon Body with Real NASA Photo */}
                      {moonBody.thumbnail_image_path ? (
                        <g>
                          <circle cx={mx} cy={my} r={mOff.radius} fill="#334155" />
                          <image
                            href={moonBody.thumbnail_image_path}
                            x={mx - mOff.radius}
                            y={my - mOff.radius}
                            width={mOff.radius * 2}
                            height={mOff.radius * 2}
                            clipPath={`url(#clip-${moonBody.id})`}
                            preserveAspectRatio="xMidYMid slice"
                          />
                          <circle
                            cx={mx}
                            cy={my}
                            r={mOff.radius}
                            fill="none"
                            stroke={isMoonSelected ? '#fde047' : '#e2e8f0'}
                            strokeWidth="1.2"
                          />
                        </g>
                      ) : (
                        <circle
                          cx={mx}
                          cy={my}
                          r={mOff.radius}
                          fill="#cbd5e1"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      )}

                      {/* Moon Label Tag */}
                      <text
                        x={mx}
                        y={my + mOff.radius + 9}
                        textAnchor="middle"
                        className="fill-yellow-200 font-extrabold text-[8px] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                      >
                        {moonBody.name}
                      </text>

                      {/* Generous touch target for chubby toddler fingers */}
                      <circle cx={mx} cy={my} r="22" fill="transparent" />
                    </g>
                  );
                })}

                {/* 2. PARENT PLANET NODE */}
                <g
                  id={`node-${sys.id}`}
                  className="cursor-pointer group"
                  onClick={() => handleSelectSystem(sys)}
                >
                  {/* Planet Selection Radar Beacon */}
                  {isSelected && (
                    <g>
                      <circle
                        cx={px}
                        cy={py}
                        r={sys.visualRadius + 12}
                        fill="none"
                        stroke="#fde047"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        className="animate-spin"
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r={sys.visualRadius + 20}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1"
                        strokeOpacity="0.5"
                      />
                    </g>
                  )}

                  {/* Saturn's Rings (Rendered before planet sphere for authentic 3D overlap) */}
                  {sys.id === 'saturn' && (
                    <g transform={`rotate(-24 ${px} ${py})`}>
                      <ellipse
                        cx={px}
                        cy={py}
                        rx={sys.visualRadius * 1.85}
                        ry={sys.visualRadius * 0.65}
                        fill="none"
                        stroke="#fef08a"
                        strokeWidth="6"
                        strokeOpacity="0.75"
                      />
                      <ellipse
                        cx={px}
                        cy={py}
                        rx={sys.visualRadius * 2.15}
                        ry={sys.visualRadius * 0.78}
                        fill="none"
                        stroke="#ca8a04"
                        strokeWidth="3"
                        strokeOpacity="0.5"
                      />
                    </g>
                  )}

                  {/* Uranus Rings */}
                  {sys.id === 'uranus' && (
                    <ellipse
                      cx={px}
                      cy={py}
                      rx={sys.visualRadius * 0.45}
                      ry={sys.visualRadius * 1.55}
                      fill="none"
                      stroke="#a5f3fc"
                      strokeWidth="1.5"
                      strokeOpacity="0.45"
                    />
                  )}

                  {/* Planet Sphere with Real NASA Spacecraft Photo */}
                  {body.thumbnail_image_path ? (
                    <g>
                      <circle cx={px} cy={py} r={sys.visualRadius} fill="#1e293b" />
                      <image
                        href={body.thumbnail_image_path}
                        x={px - sys.visualRadius}
                        y={py - sys.visualRadius}
                        width={sys.visualRadius * 2}
                        height={sys.visualRadius * 2}
                        clipPath={`url(#clip-${body.id})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r={sys.visualRadius}
                        fill="none"
                        stroke={isSelected ? '#fde047' : body.color || '#38bdf8'}
                        strokeWidth={isSelected ? '3' : '2'}
                      />
                    </g>
                  ) : (
                    <circle
                      cx={px}
                      cy={py}
                      r={sys.visualRadius}
                      fill={body.color || '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}

                  {/* Planet Name Banner Tag */}
                  <g transform={`translate(${px}, ${py + sys.visualRadius + 14})`}>
                    <rect
                      x="-38"
                      y="-10"
                      width="76"
                      height="16"
                      rx="8"
                      fill={isSelected ? '#fde047' : '#0f172a'}
                      stroke={isSelected ? '#ca8a04' : '#475569'}
                      strokeWidth="1.2"
                      opacity="0.95"
                    />
                    <text
                      x="0"
                      y="1.5"
                      textAnchor="middle"
                      className={`text-[9px] font-black uppercase tracking-wider ${
                        isSelected ? 'fill-slate-950 font-extrabold' : 'fill-white'
                      }`}
                    >
                      {body.name}
                    </text>
                  </g>

                  {/* Moons Count Badge (if has moons) */}
                  {(sys.moonIds || []).length > 0 && (
                    <g transform={`translate(${px + sys.visualRadius - 2}, ${py - sys.visualRadius + 2})`}>
                      <circle cx="0" cy="0" r="9" fill="#0f172a" stroke="#fde047" strokeWidth="1.5" />
                      <text x="0" y="3" textAnchor="middle" className="fill-yellow-300 font-black text-[8px]">
                        🌙{sys.moonIds.length}
                      </text>
                    </g>
                  )}

                  {/* Generous touch target for toddlers */}
                  <circle cx={px} cy={py} r={Math.max(sys.visualRadius + 16, 32)} fill="transparent" />
                </g>
              </g>
            );
          })}

        </svg>

      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM MISSION CONTROL & GROUPED DESTINATION CARD     */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 border-t-2 border-cyan-500/30 shadow-[0_-15px_30px_rgba(0,0,0,0.85)] px-3 sm:px-6 pt-2 pb-3 pointer-events-auto">
        
        {/* System Overview Bar */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{activeParent.emoji || '🪐'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  {activeParent.name} System
                </span>
                <span className="text-[10px] text-cyan-300 font-extrabold px-2 py-0.5 rounded-full bg-slate-800 border border-cyan-500/40 uppercase">
                  {activeParent.body_type}
                </span>
              </div>
              <span className="text-xs text-yellow-300 font-bold line-clamp-1">
                "{activeParent.tagline}"
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-300 font-black">
            <span>CHOOSE DESTINATION TO FLY!</span>
            <Rocket className="w-4 h-4 text-yellow-300" />
          </div>
        </div>

        {/* Grouped Launch Action Buttons: Parent Planet + Companion Moons */}
        <div className="w-full max-w-5xl mx-auto flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          
          {/* Main Parent Planet Launch Button */}
          <button
            onClick={() => handleLaunchToDestination(activeParent)}
            style={{
              touchAction: 'manipulation',
              borderColor: activeParent.color || '#38bdf8',
            }}
            className="cockpit-btn flex-1 min-w-[180px] min-h-[76px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-2 flex items-center justify-between gap-3 shadow-xl hover:scale-[1.02] active:scale-95 group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={activeParent.thumbnail_image_path}
                alt={activeParent.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/90 shadow-md shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
                  {activeParent.name}
                </span>
                <span className="text-[10px] text-cyan-300 font-bold uppercase">
                  {activeParent.body_type} Base
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shrink-0 flex items-center gap-1">
              <span>🚀 Fly!</span>
            </div>
          </button>

          {/* Grouped Moons as Primary Companion Cards */}
          {companionMoons.map((moon) => (
            <button
              key={moon.id}
              onClick={() => handleLaunchToDestination(moon)}
              style={{
                touchAction: 'manipulation',
                borderColor: moon.color || '#fde047',
              }}
              className="cockpit-btn flex-1 min-w-[170px] min-h-[76px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 text-white border-2 flex items-center justify-between gap-2.5 shadow-lg hover:scale-[1.02] active:scale-95 group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={moon.thumbnail_image_path}
                  alt={moon.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-yellow-300/80 shadow-md shrink-0"
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-black uppercase text-white">
                      {moon.name}
                    </span>
                    <span className="text-xs">{moon.emoji || '🌙'}</span>
                  </div>
                  <span className="text-[10px] text-yellow-300 font-bold line-clamp-1">
                    {moon.tagline}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shrink-0">
                <span>🌙 Visit</span>
              </div>
            </button>
          ))}

        </div>

        {/* Quick Planet Selector Ribbon (Direct jump to any world) */}
        <div className="w-full max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-2 mt-1 border-t border-slate-800/80">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 mr-1 hidden sm:inline">
            Direct Orbit Jump:
          </span>
          {SYSTEM_BODIES.map((sys) => {
            const body = bodyMap[sys.id];
            if (!body) return null;
            const isSelected = selectedSystemId === sys.id;

            return (
              <button
                key={`ribbon-${sys.id}`}
                onClick={() => handleSelectSystem(sys)}
                style={{ touchAction: 'manipulation' }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-yellow-400 text-slate-950 scale-105 shadow-md'
                    : 'bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <span>{body.emoji || '🪐'}</span>
                <span>{body.name}</span>
                {(sys.moonIds || []).length > 0 && (
                  <span className="text-[8px] opacity-75">({sys.moonIds.length})</span>
                )}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
