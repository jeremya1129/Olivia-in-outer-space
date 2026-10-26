import React, { useState } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import SolarSystemView from './SolarSystemView';
import { Sparkles, Radio, Rocket, Orbit, Globe } from 'lucide-react';

/**
 * Cartoon Astronaut Character Component (Olivia or Anna)
 * Framed inside an authentic sci-fi astronaut suit with bubble helmet.
 * Supports both:
 * 1. Real photo cutout face (personalized, 100% authentic)
 * 2. Hand-crafted illustrated cartoon face with matching hair and expressions
 */
function CartoonAstronaut({ name, role, isDriver, isCheering, usePhotoFace = false }) {
  const isOlivia = name.toLowerCase().includes('olivia');
  const suitAccent = isOlivia ? '#38bdf8' : '#c084fc'; // Cyan for Olivia, Lilac/Purple for Anna
  const visorTint = isOlivia ? 'rgba(56, 189, 248, 0.2)' : 'rgba(216, 180, 254, 0.2)';
  const photoSrc = isOlivia
    ? '/assets/cartoons/characters/olivia_photo_face.png'
    : '/assets/cartoons/characters/anna_photo_face.png';
  const cartoonSrc = isOlivia
    ? '/assets/cartoons/characters/olivia_cartoon_circle.png'
    : '/assets/cartoons/characters/anna_cartoon_circle.png';

  const clipId = `visor-clip-${name.toLowerCase()}`;

  return (
    <div className={`relative flex flex-col items-center select-none transition-transform duration-300 ${isCheering ? 'scale-110 -translate-y-3' : 'animate-float'}`}>
      {/* Sci-Fi Bucket Seat Headrest */}
      <div className="absolute -top-4 w-32 md:w-44 h-40 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl border-2 border-slate-600 shadow-xl -z-10 flex flex-col items-center pt-1.5">
        <div className="w-16 h-2 bg-slate-700 rounded-full mb-1" />
        <div className="w-20 h-1 bg-slate-600 rounded-full" />
      </div>

      {/* SVG Cartoon Astronaut Body */}
      <svg
        viewBox="0 0 170 190"
        className="w-32 h-36 sm:w-40 sm:h-44 md:w-48 md:h-52 drop-shadow-2xl"
      >
        <defs>
          <clipPath id={clipId}>
            <ellipse cx="85" cy="72" rx="41" ry="36" />
          </clipPath>
        </defs>

        {/* Helmet Outer Shell */}
        <circle cx="85" cy="72" r="52" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
        <circle cx="85" cy="72" r="50" fill="#e2e8f0" />

        {/* Helmet Collar Ring */}
        <ellipse cx="85" cy="120" rx="38" ry="11" fill={suitAccent} stroke="#1e293b" strokeWidth="3" />

        {/* Helmet Bubble Glass Visor Frame */}
        <ellipse cx="85" cy="72" rx="43" ry="38" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />

        {/* Visor Content: Real Photo Cutout or New Cartoon Face */}
        {usePhotoFace ? (
          <g clipPath={`url(#${clipId})`}>
            {/* Background tint inside helmet */}
            <rect x="40" y="32" width="90" height="80" fill="#0f172a" />
            {/* Real photo image */}
            <image
              href={photoSrc}
              x={isOlivia ? "40" : "41"}
              y={isOlivia ? "31" : "32"}
              width="90"
              height="80"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Subtle blue space reflection overlay */}
            <ellipse cx="85" cy="72" rx="41" ry="36" fill={visorTint} />
          </g>
        ) : (
          /* High-fidelity Illustrated Cartoon Face from references */
          <g clipPath={`url(#${clipId})`}>
            {/* Background tint inside helmet */}
            <rect x="40" y="32" width="90" height="80" fill="#0f172a" />
            {/* New cartoon face image */}
            <image
              href={cartoonSrc}
              x="42"
              y="32"
              width="86"
              height="80"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Subtle blue space reflection overlay */}
            <ellipse cx="85" cy="72" rx="41" ry="36" fill={visorTint} />
          </g>
        )}

        {/* Visor Glare / Curved Glass Highlight (Overlays on top of face) */}
        <path
          d="M58,50 Q85,38 112,46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="116" cy="48" r="2" fill="#ffffff" opacity="0.5" />

        {/* Shoulders & Spacesuit */}
        <path
          d="M38,128 Q85,112 132,128 L144,185 Q85,195 26,185 Z"
          fill="#f1f5f9"
          stroke="#334155"
          strokeWidth="4"
        />

        {/* Mint-Green Ladybug Mission Patch (matching real dresses) */}
        <g id="ladybug-mission-patch" transform="translate(63, 134)">
          <rect x="0" y="0" width="44" height="22" rx="6" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
          <circle cx="12" cy="11" r="6.5" fill="#ef4444" />
          <circle cx="12" cy="7.5" r="3" fill="#0f172a" />
          <circle cx="10" cy="10" r="1.4" fill="#0f172a" />
          <circle cx="14" cy="10" r="1.4" fill="#0f172a" />
          <circle cx="12" cy="14" r="1.4" fill="#0f172a" />
          <text
            x="30"
            y="14.5"
            textAnchor="middle"
            fontSize="7"
            fontWeight="900"
            fill={isOlivia ? '#0284c7' : '#9333ea'}
            fontFamily="system-ui, sans-serif"
          >
            {isOlivia ? 'PILOT' : 'NAV'}
          </text>
        </g>

        {/* Astronaut Name Tag */}
        <rect x="65" y="160" width="40" height="9" rx="3" fill="#0f172a" />
        <text
          x="85"
          y="167"
          textAnchor="middle"
          fontSize="7"
          fontWeight="900"
          fill={suitAccent}
          fontFamily="system-ui, sans-serif"
        >
          {name.toUpperCase()}
        </text>

        {/* Steering Wheel or Navigator Radar Tablet */}
        {isDriver ? (
          <g id="steering-hands">
            <path d="M42,168 Q85,152 128,168" fill="none" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
            <circle cx="52" cy="165" r="7.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
            <circle cx="118" cy="165" r="7.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
          </g>
        ) : (
          <g id="nav-tablet">
            <rect x="58" y="160" width="54" height="22" rx="4" fill="#022c22" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="85" cy="171" r="6" fill="none" stroke="#34d399" strokeWidth="1.5" />
            <line x1="85" y1="165" x2="85" y2="177" stroke="#34d399" strokeWidth="1.5" />
            <line x1="79" y1="171" x2="91" y2="171" stroke="#34d399" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {/* Role Pill */}
      <div className="mt-1 px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-600 shadow-md">
        <span className="text-[10px] md:text-xs font-black tracking-wider uppercase" style={{ color: suitAccent }}>
          {role}
        </span>
      </div>
    </div>
  );
}

/**
 * Olivia's Animated Flying Toy Rocket
 * Exact replica of the Little Tikes Adventure Rocket:
 * - Bulbous white capsule body with dark nose cone
 * - Big purple starry bubble dome porthole with bolted ring
 * - Red "OLIVIA" Little Tikes style oval badge
 * - Orange telescope nozzle & orange ribbed handle
 * - Blue hatch steering wheel
 * - Olivia's authentic red crayon scribbles on hull!
 * - Scalloped charcoal launch booster base
 */
function FlyingToyRocket({ isBlasting, targetName, usePhotoFace = false }) {
  const rocketFaceSrc = usePhotoFace
    ? '/assets/cartoons/characters/olivia_photo_face.png'
    : '/assets/cartoons/characters/olivia_cartoon_circle.png';

  if (!isBlasting) {
    return (
      <div className="relative w-20 h-24 md:w-24 md:h-28 animate-float pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
        <svg viewBox="0 0 160 190" className="w-full h-full rotate-12">
          <defs>
            <clipPath id="rocket-porthole-clip-idle">
              <circle cx="80" cy="96" r="22" />
            </clipPath>
          </defs>

          {/* Scalloped Charcoal Base */}
          <ellipse cx="80" cy="168" rx="42" ry="12" fill="#475569" stroke="#334155" strokeWidth="2.5" />
          
          {/* Main White Bulbous Hull */}
          <path d="M80,24 C108,50 120,105 118,152 L42,152 C40,105 52,50 80,24 Z" fill="#ffffff" stroke="#64748b" strokeWidth="3" />
          
          {/* Dark Charcoal Nosecone */}
          <path d="M80,24 C94,40 101,56 103,64 L57,64 C59,56 66,40 80,24 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />

          {/* Red Crayon Scribbles by Olivia! */}
          <path d="M54,76 Q60,68 68,76 T78,70 T88,75" fill="none" stroke="#ef4444" strokeWidth="1.8" opacity="0.8" />
          <path d="M52,90 Q62,84 58,96 T70,92" fill="none" stroke="#ef4444" strokeWidth="1.8" opacity="0.8" />
          <path d="M102,78 Q110,86 104,96" fill="none" stroke="#ef4444" strokeWidth="1.8" opacity="0.8" />

          {/* Purple Starry Bubble Porthole with Olivia Looking Out */}
          <circle cx="80" cy="96" r="26" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
          <g clipPath="url(#rocket-porthole-clip-idle)">
            <circle cx="80" cy="96" r="22" fill="#3b0764" />
            <image
              href={rocketFaceSrc}
              x="58"
              y="74"
              width="44"
              height="44"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <path d="M68,86 Q80,80 92,85" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />

          {/* Red Little Tikes Style Oval Badge */}
          <rect x="104" y="90" width="14" height="9" rx="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
          <text x="111" y="96.5" fontSize="4" fontWeight="900" fill="#ffffff" textAnchor="middle">OLIVIA</text>

          {/* Orange Telescope & Handle */}
          <rect x="108" y="72" width="5" height="12" rx="2.5" fill="#f97316" />
          <path d="M48,128 L36,134 L36,142 L48,138 Z" fill="#f97316" />

          {/* Blue Steering Wheel */}
          <circle cx="103" cy="136" r="7" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1.5" />

          {/* Idle Thruster Flame */}
          <path d="M72,168 Q80,186 88,168 Q80,178 72,168 Z" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Zooming Rocket */}
      <div className="relative flex flex-col items-center animate-[zoomForward_1.8s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
        <div className="text-sm md:text-base font-black px-5 py-1.5 rounded-full bg-yellow-400 text-slate-950 shadow-2xl mb-3 animate-bounce uppercase tracking-widest border-2 border-slate-900">
          🚀 Destination: {targetName}!
        </div>
        <svg viewBox="0 0 160 220" className="w-44 h-56 md:w-56 md:h-72 drop-shadow-[0_0_60px_rgba(250,204,21,0.95)]">
          <defs>
            <clipPath id="rocket-porthole-clip-blasting">
              <circle cx="80" cy="102" r="26" />
            </clipPath>
          </defs>

          {/* Roaring Rocket Thruster Flames */}
          <path
            d="M55,160 Q80,240 105,160 Q92,195 80,225 Q68,195 55,160 Z"
            fill="#ef4444"
            className="animate-pulse"
          />
          <path
            d="M62,160 Q80,215 98,160 Q88,188 80,205 Q72,188 62,160 Z"
            fill="#f59e0b"
          />
          <path
            d="M68,160 Q80,190 92,160 Q85,178 80,188 Q75,178 68,160 Z"
            fill="#fef08a"
          />

          {/* Scalloped Launch Base */}
          <ellipse cx="80" cy="160" rx="46" ry="14" fill="#475569" stroke="#1e293b" strokeWidth="3" />

          {/* Bulbous White Hull */}
          <path d="M80,24 C112,52 126,112 122,160 L38,160 C34,112 48,52 80,24 Z" fill="#ffffff" stroke="#475569" strokeWidth="4" />

          {/* Charcoal Nosecone */}
          <path d="M80,24 C96,40 103,58 105,66 L55,66 C57,58 64,40 80,24 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />

          {/* Red Toddler Crayon Scribbles */}
          <path d="M52,80 Q60,72 70,80 T82,74 T92,80" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.85" />
          <path d="M50,96 Q62,88 56,102 T70,96" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.85" />
          <path d="M106,84 Q116,92 108,104" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.85" />

          {/* Purple Starry Bubble Porthole with Olivia's Face inside */}
          <circle cx="80" cy="102" r="30" fill="#ffffff" stroke="#94a3b8" strokeWidth="3.5" />
          <g clipPath="url(#rocket-porthole-clip-blasting)">
            <circle cx="80" cy="102" r="26" fill="#3b0764" />
            <image
              href={rocketFaceSrc}
              x="54"
              y="76"
              width="52"
              height="52"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>

          {/* Glass Bubble Glare */}
          <path d="M66,92 Q80,84 94,90" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />

          {/* Red Oval Badge */}
          <rect x="108" y="96" width="16" height="10" rx="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
          <text x="116" y="103" fontSize="4.5" fontWeight="900" fill="#ffffff" textAnchor="middle">OLIVIA</text>

          {/* Orange Handle & Telescope */}
          <rect x="112" y="74" width="6" height="15" rx="3" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
          <path d="M44,134 L30,142 L30,152 L44,146 Z" fill="#f97316" stroke="#c2410c" strokeWidth="2" />

          {/* Blue Steering Wheel */}
          <circle cx="106" cy="142" r="8" fill="#1d4ed8" stroke="#1e40af" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

export default function Cockpit({
  celestialBodies = [],
  onSelectDestination,
  onReturnToEarth,
  cockpitViewMode = 'solarsystem',
  usePhotoFace = false,
}) {
  const { playTrackOrSfx, triggerSynth, speak } = useSpaceAudio();
  const [blastingTarget, setBlastingTarget] = useState(null);
  const [isBlasting, setIsBlasting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'planets' | 'moons' | 'sun_dwarf'

  // Big push-button click handler
  const handleDestinationTap = (body) => {
    if (isBlasting) return;

    setBlastingTarget(body);
    setIsBlasting(true);

    // 1. Rocket sound cue & audio announcement
    playTrackOrSfx(null, 'blastoff');
    triggerSynth('blastoff');
    speak(`Blast off to ${body.name}! Here we go!`);

    // 2. Transition rocket toward that body after rumble effect (~1.8s)
    setTimeout(() => {
      setIsBlasting(false);
      if (onSelectDestination) {
        onSelectDestination(body);
      }
    }, 1800);
  };

  const handleRadioCheck = () => {
    triggerSynth('twinkle');
    speak('Mission Control to Captain Olivia and Navigator Anna: All systems are GO for blast off!');
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-space-dark stars-bg select-none ${
        isBlasting ? 'animate-rumble' : ''
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* ======================================================== */}
      {/* 1. FRAME: Fullscreen Cockpit Windshield & Canopy Struts */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* Angled Left & Right Windshield Frame Pillars */}
        <div className="absolute left-0 inset-y-0 w-3 sm:w-8 md:w-12 bg-gradient-to-r from-slate-900 via-slate-800 to-transparent border-r border-slate-700/60 z-20 pointer-events-none flex flex-col justify-around py-16 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        </div>
        <div className="absolute right-0 inset-y-0 w-3 sm:w-8 md:w-12 bg-gradient-to-l from-slate-900 via-slate-800 to-transparent border-l border-slate-700/60 z-20 pointer-events-none flex flex-col justify-around py-16 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        </div>

        {/* Cockpit Glass Tint & Cross-Reflections */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/15 via-transparent to-indigo-950/20 pointer-events-none z-10" />

        {/* ======================================================== */}
        {/* VIEW 1: SOLAR SYSTEM HOME SELECTION VIEW                 */}
        {/* ======================================================== */}
        {cockpitViewMode === 'solarsystem' ? (
          <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
            <SolarSystemView
              celestialBodies={celestialBodies}
              onSelectDestination={handleDestinationTap}
            />

            {/* Flying Toy Rocket cruising through Space in Solar System Selection View */}
            <div className="absolute top-2 right-4 sm:right-10 z-20 pointer-events-auto">
              <FlyingToyRocket isBlasting={false} usePhotoFace={usePhotoFace} />
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: CLASSIC ROTATING EARTH ORBIT VIEW                */
          /* ======================================================== */
          <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden pt-8 pb-4">
            {/* Animated Stars in Horizon */}
            <div className="absolute inset-0 stars-bg opacity-75" />

            {/* ROTATING CARTOON EARTH (Windshield Centerpiece) */}
            <div className="relative flex flex-col items-center z-10 my-auto">
              {/* Atmospheric Blue Glow Ring */}
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center shadow-[0_0_90px_rgba(56,189,248,0.55)] border-4 border-cyan-400/50 bg-gradient-to-b from-[#1e40af] via-[#0284c7] to-[#0369a1] overflow-hidden">
                {/* Rotating Cartoon Continents & Landmass Layer */}
                <div className="absolute inset-0 animate-spin-slow opacity-95">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <path
                      d="M40,55 Q65,40 85,60 Q110,50 120,80 Q95,110 70,95 Q45,100 40,55 Z"
                      fill="#22c55e"
                      stroke="#16a34a"
                      strokeWidth="3"
                    />
                    <path
                      d="M125,100 Q155,90 170,120 Q160,150 135,160 Q110,140 125,100 Z"
                      fill="#22c55e"
                      stroke="#16a34a"
                      strokeWidth="3"
                    />
                    <circle cx="50" cy="130" r="7" fill="#4ade80" />
                    <circle cx="150" cy="50" r="6" fill="#4ade80" />
                    <circle cx="95" cy="140" r="9" fill="#4ade80" />
                  </svg>
                </div>

                {/* Swirling Semi-Transparent Clouds */}
                <div className="absolute inset-0 animate-[spin_45s_linear_infinite_reverse] pointer-events-none opacity-60">
                  <div className="absolute top-8 left-6 w-28 h-10 rounded-full bg-white/50 blur-[2px] rotate-6" />
                  <div className="absolute bottom-12 right-6 w-36 h-12 rounded-full bg-white/45 blur-[2px] -rotate-12" />
                  <div className="absolute top-28 right-12 w-20 h-7 rounded-full bg-white/40 blur-[1px]" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/35 rounded-full pointer-events-none" />

                <div className="z-10 text-center pointer-events-none select-none">
                  <div className="text-3xl md:text-4xl filter drop-shadow">🌍</div>
                  <div className="text-xs md:text-sm font-black text-white uppercase tracking-wider drop-shadow-md">
                    Earth Orbit View
                  </div>
                </div>
              </div>

              {/* Toy Rocket in Orbit */}
              <div className="absolute -top-4 right-6 sm:right-16 z-20">
                <FlyingToyRocket isBlasting={false} usePhotoFace={usePhotoFace} />
              </div>
            </div>

            {/* Astronaut Characters at bottom of Earth view */}
            <div className="w-full max-w-5xl px-6 md:px-12 flex justify-between items-end z-20 pointer-events-auto mb-6">
              <CartoonAstronaut
                name="Olivia"
                role="Pilot 🚀"
                isDriver={true}
                isCheering={isBlasting}
                usePhotoFace={usePhotoFace}
              />

              {/* Jump to Solar System Button in Earth view */}
              <button
                onClick={() => {
                  triggerSynth('beep');
                  setCockpitViewMode('solarsystem');
                  speak('Opening the Solar System Highway!');
                }}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
              >
                <span>🪐 Explore Solar System</span>
                <Rocket className="w-5 h-5" />
              </button>

              <CartoonAstronaut
                name="Anna"
                role="Navigator 🧭"
                isDriver={false}
                isCheering={isBlasting}
                usePhotoFace={usePhotoFace}
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. BLAST-OFF EVENT: Zooming Toy Rocket Transition        */}
      {/* ======================================================== */}
      {isBlasting && (
        <FlyingToyRocket isBlasting={true} targetName={blastingTarget?.name} usePhotoFace={usePhotoFace} />
      )}
    </div>
  );
}
