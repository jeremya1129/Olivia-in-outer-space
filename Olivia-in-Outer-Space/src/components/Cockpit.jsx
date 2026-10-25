import React, { useState } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { Sparkles, Radio, Rocket } from 'lucide-react';

/**
 * Cartoon Astronaut Character Component (Olivia or Anna)
 * Framed inside an authentic sci-fi astronaut suit with bubble helmet.
 * Supports both:
 * 1. Real photo cutout face (personalized, 100% authentic)
 * 2. Hand-crafted illustrated cartoon face with matching hair and expressions
 */
function CartoonAstronaut({ name, role, isDriver, isCheering, usePhotoFace = true }) {
  const isOlivia = name.toLowerCase().includes('olivia');
  const suitAccent = isOlivia ? '#38bdf8' : '#c084fc'; // Cyan for Olivia, Lilac/Purple for Anna
  const visorTint = isOlivia ? 'rgba(56, 189, 248, 0.2)' : 'rgba(216, 180, 254, 0.2)';
  const photoSrc = isOlivia
    ? '/assets/cartoons/characters/olivia_photo_face.png'
    : '/assets/cartoons/characters/anna_photo_face.png';

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

        {/* Hair Layer: Behind Helmet */}
        {isOlivia ? (
          /* Olivia's Bouncy Golden-Caramel Curls Cascading Behind Helmet */
          <g id="olivia-curls-back">
            <circle cx="50" cy="80" r="18" fill="#d97706" />
            <circle cx="44" cy="100" r="16" fill="#b45309" />
            <circle cx="48" cy="118" r="15" fill="#d97706" />
            <circle cx="120" cy="80" r="18" fill="#d97706" />
            <circle cx="126" cy="100" r="16" fill="#b45309" />
            <circle cx="122" cy="118" r="15" fill="#d97706" />
          </g>
        ) : (
          /* Anna's Straight Flaxen Blonde Bob Behind Helmet */
          <g id="anna-bob-back">
            <path d="M42,75 L40,122 Q54,132 64,118 L64,75 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <path d="M128,75 L130,122 Q116,132 106,118 L106,75 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
          </g>
        )}

        {/* Helmet Outer Shell */}
        <circle cx="85" cy="72" r="52" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
        <circle cx="85" cy="72" r="50" fill="#e2e8f0" />

        {/* Helmet Collar Ring */}
        <ellipse cx="85" cy="120" rx="38" ry="11" fill={suitAccent} stroke="#1e293b" strokeWidth="3" />

        {/* Helmet Bubble Glass Visor Frame */}
        <ellipse cx="85" cy="72" rx="43" ry="38" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />

        {/* Visor Content: Real Photo Cutout or Stylized Cartoon */}
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
          /* Hand-crafted Illustrated Face */
          <g id="illustrated-face">
            <ellipse cx="85" cy="72" rx="41" ry="36" fill={visorTint} />
            {isOlivia ? (
              <g id="olivia-curly-fringe">
                <path d="M58,54 Q72,42 85,50 Q98,42 112,54 Q105,48 85,46 Q65,48 58,54 Z" fill="#d97706" />
                <circle cx="62" cy="58" r="8" fill="#f59e0b" />
                <circle cx="76" cy="52" r="7" fill="#d97706" />
                <circle cx="94" cy="52" r="7" fill="#d97706" />
                <circle cx="108" cy="58" r="8" fill="#f59e0b" />
              </g>
            ) : (
              <g id="anna-straight-bangs">
                <path d="M56,54 L56,66 Q70,70 85,67 Q100,70 114,66 L114,54 Z" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
              </g>
            )}

            {/* Eyes */}
            <ellipse cx="71" cy="73" rx="5" ry="7" fill="#451a03" />
            <ellipse cx="99" cy="73" rx="5" ry="7" fill="#451a03" />
            <circle cx="73" cy="71" r="2.2" fill="#ffffff" />
            <circle cx="101" cy="71" r="2.2" fill="#ffffff" />

            {/* Nose & Mouth */}
            <ellipse cx="85" cy="80" rx="2.5" ry="1.6" fill="#f43f5e" opacity="0.45" />
            {isOlivia ? (
              <g id="tongue-out">
                <path d="M77,86 Q85,91 93,86" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M81,87 C81,98 89,98 89,87 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
              </g>
            ) : (
              <path d="M78,87 Q85,94 92,87" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            )}

            {/* Rosy Cheeks */}
            <circle cx="63" cy="82" r="6" fill="#f43f5e" opacity="0.6" />
            <circle cx="107" cy="82" r="6" fill="#f43f5e" opacity="0.6" />
          </g>
        )}

        {/* Visor Glare / Curved Glass Highlight (Overlays on top of photo) */}
        <path
          d="M54,58 Q80,44 112,52"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="118" cy="60" r="2.5" fill="#ffffff" opacity="0.75" />

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
function FlyingToyRocket({ isBlasting, targetName, usePhotoFace = true }) {
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
            {usePhotoFace ? (
              <image
                href="/assets/cartoons/characters/olivia_photo_face.png"
                x="58"
                y="74"
                width="44"
                height="44"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <g>
                <circle cx="73" cy="90" r="1.5" fill="#ffffff" />
                <circle cx="88" cy="94" r="1.5" fill="#ffffff" />
                <circle cx="82" cy="104" r="1.2" fill="#fde047" />
              </g>
            )}
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
            {usePhotoFace ? (
              <image
                href="/assets/cartoons/characters/olivia_photo_face.png"
                x="54"
                y="76"
                width="52"
                height="52"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <g>
                <circle cx="80" cy="100" r="12" fill="#fcd34d" />
                <circle cx="76" cy="98" r="2" fill="#0f172a" />
                <circle cx="84" cy="98" r="2" fill="#0f172a" />
                <path d="M78,103 Q80,107 82,103" fill="none" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            )}
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

export default function Cockpit({ celestialBodies = [], onSelectDestination }) {
  const { playTrackOrSfx, triggerSynth, speak } = useSpaceAudio();
  const [blastingTarget, setBlastingTarget] = useState(null);
  const [isBlasting, setIsBlasting] = useState(false);
  const [usePhotoFace, setUsePhotoFace] = useState(true); // Default to personalized real photos!

  // Big push-button click handler
  const handleDestinationTap = (body) => {
    if (isBlasting) return;

    setBlastingTarget(body);
    setIsBlasting(true);

    // 1. Rocket sound cue & audio announcement
    playTrackOrSfx(null, 'blastoff');
    triggerSynth('blastoff');
    speak(`Blast off to ${body.name}! Hang on tight!`);

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
        
        {/* Cockpit Canopy Top Arc / Metallic Hull Frame */}
        <div className="absolute top-0 inset-x-0 h-10 md:h-14 bg-gradient-to-b from-slate-900 via-slate-800 to-transparent border-b-2 border-slate-700/80 z-20 flex items-center justify-between px-6 pointer-events-none">
          {/* Rivets and Bolt Details */}
          <div className="flex gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          </div>
          <div className="text-[11px] md:text-xs font-black tracking-widest text-cyan-300 uppercase px-3 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/40">
            Astro-Lab Starship MK-IV
          </div>
          <div className="flex gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          </div>
        </div>

        {/* Angled Left & Right Windshield Frame Pillars */}
        <div className="absolute left-0 inset-y-0 w-5 sm:w-10 md:w-14 bg-gradient-to-r from-slate-900 via-slate-800 to-transparent border-r border-slate-700/60 z-20 pointer-events-none flex flex-col justify-around py-16 items-center">
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        </div>
        <div className="absolute right-0 inset-y-0 w-5 sm:w-10 md:w-14 bg-gradient-to-l from-slate-900 via-slate-800 to-transparent border-l border-slate-700/60 z-20 pointer-events-none flex flex-col justify-around py-16 items-center">
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        </div>

        {/* Cockpit Glass Tint & Cross-Reflections */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />
        <div className="absolute top-10 left-12 w-64 h-96 bg-white/[0.03] -rotate-12 blur-sm pointer-events-none z-10" />

        {/* Windshield Viewport (Deep Space Looking Down at Rotating Cartoon Earth) */}
        <div className="relative flex-1 w-full flex flex-col items-center justify-center overflow-hidden pt-8 pb-4">
          
          {/* Animated Stars in Horizon */}
          <div className="absolute inset-0 stars-bg opacity-75" />

          {/* ROTATING CARTOON EARTH (Windshield Centerpiece) */}
          <div className="relative flex flex-col items-center z-10">
            {/* Atmospheric Blue Glow Ring */}
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center shadow-[0_0_90px_rgba(56,189,248,0.55)] border-4 border-cyan-400/50 bg-gradient-to-b from-[#1e40af] via-[#0284c7] to-[#0369a1] overflow-hidden">
              
              {/* Rotating Cartoon Continents & Landmass Layer */}
              <div className="absolute inset-0 animate-spin-slow opacity-95">
                {/* SVG Cartoon Landmasses */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Continent 1 */}
                  <path
                    d="M40,55 Q65,40 85,60 Q110,50 120,80 Q95,110 70,95 Q45,100 40,55 Z"
                    fill="#22c55e"
                    stroke="#16a34a"
                    strokeWidth="3"
                  />
                  {/* Continent 2 */}
                  <path
                    d="M125,100 Q155,90 170,120 Q160,150 135,160 Q110,140 125,100 Z"
                    fill="#22c55e"
                    stroke="#16a34a"
                    strokeWidth="3"
                  />
                  {/* Cute Islands */}
                  <circle cx="50" cy="130" r="7" fill="#4ade80" />
                  <circle cx="150" cy="50" r="6" fill="#4ade80" />
                  <circle cx="95" cy="140" r="9" fill="#4ade80" />
                </svg>
              </div>

              {/* Swirling Semi-Transparent Cartoon Clouds */}
              <div className="absolute inset-0 animate-[spin_45s_linear_infinite_reverse] pointer-events-none opacity-60">
                <div className="absolute top-8 left-6 w-28 h-10 rounded-full bg-white/50 blur-[2px] rotate-6" />
                <div className="absolute bottom-12 right-6 w-36 h-12 rounded-full bg-white/45 blur-[2px] -rotate-12" />
                <div className="absolute top-28 right-12 w-20 h-7 rounded-full bg-white/40 blur-[1px]" />
              </div>

              {/* Atmospheric Sunlight Arc */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/35 rounded-full pointer-events-none" />

              {/* Earth Orbit Label */}
              <div className="z-10 text-center pointer-events-none select-none">
                <div className="text-3xl md:text-4xl filter drop-shadow">🌍</div>
                <div className="text-xs md:text-sm font-black text-white uppercase tracking-wider drop-shadow-md">
                  Orbit View
                </div>
              </div>
            </div>

            {/* Toy Rocket In Orbit (Idle State) */}
            <div className="absolute -top-4 right-6 sm:right-16 z-20">
              <FlyingToyRocket isBlasting={false} usePhotoFace={usePhotoFace} />
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. CHARACTERS: Cartoon Olivia (Driver) & Anna (Navigator) */}
          {/* ======================================================== */}
          <div className="w-full max-w-5xl px-6 md:px-12 flex justify-between items-end z-20 pointer-events-auto">
            {/* Driver Seat: Captain Olivia (Left) */}
            <div className="flex flex-col items-center">
              <CartoonAstronaut
                name="Olivia"
                role="Pilot 🚀"
                isDriver={true}
                isCheering={isBlasting}
                usePhotoFace={usePhotoFace}
              />
            </div>

            {/* Radio / Intercom & Photo Mode Controls (Center Console HUD) */}
            <div className="mb-4 flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  triggerSynth('twinkle');
                  setUsePhotoFace(prev => !prev);
                  speak(usePhotoFace ? "Cartoon art mode!" : "Olivia and Anna's photo mode!");
                }}
                style={{ touchAction: 'manipulation' }}
                title="Toggle between real photo faces and cartoon illustrations"
                className="cockpit-btn px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-yellow-300 border-2 border-yellow-400/50 rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-lg"
              >
                <span>{usePhotoFace ? '📸 Real Photo Face' : '🎨 Cartoon Face'}</span>
              </button>

              <button
                onClick={handleRadioCheck}
                style={{ touchAction: 'manipulation' }}
                className="cockpit-btn px-4 py-2 bg-indigo-900/90 hover:bg-indigo-800 text-cyan-200 border-2 border-indigo-400/60 rounded-2xl flex items-center gap-2 text-xs font-black shadow-lg"
              >
                <Radio className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Radio Intercom</span>
              </button>
            </div>

            {/* Navigator Seat: Co-Pilot Anna (Right) */}
            <div className="flex flex-col items-center">
              <CartoonAstronaut
                name="Anna"
                role="Navigator 🧭"
                isDriver={false}
                isCheering={isBlasting}
                usePhotoFace={usePhotoFace}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2 & 5. DASHBOARD: Oversized High-Contrast Push Buttons     */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 border-t-8 border-slate-700 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] px-3 sm:px-6 pt-3 pb-4">
        
        {/* Hazard Caution Stripes Banner */}
        <div className="w-full max-w-6xl mx-auto mb-2 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-yellow-300">
              ⚡ DESTINATION CONSOLE: CHOOSE WHERE TO FLY! ⚡
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-300 font-extrabold">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>TOUCH BUTTON TO LAUNCH</span>
          </div>
        </div>

        {/* Oversized High-Contrast Destination Push Buttons */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {celestialBodies.map((body) => {
            // High contrast button styling tailored for toddlers
            const isEarth = body.id === 'earth';
            const isMoon = body.id === 'moon';
            const isMars = body.id === 'mars';
            const isSaturn = body.id === 'saturn';

            // Distinctive high-contrast background & border palette
            let bgClass = 'bg-slate-800 text-white border-slate-500';
            let iconEmoji = '🪐';

            if (isEarth) {
              bgClass = 'bg-gradient-to-b from-sky-500 to-blue-700 text-white border-cyan-200';
              iconEmoji = '🌍';
            } else if (isMoon) {
              bgClass = 'bg-gradient-to-b from-slate-100 to-slate-300 text-slate-950 border-white font-black';
              iconEmoji = '🌕';
            } else if (isMars) {
              bgClass = 'bg-gradient-to-b from-orange-500 to-red-600 text-white border-yellow-200';
              iconEmoji = '🔴';
            } else if (isSaturn) {
              bgClass = 'bg-gradient-to-b from-amber-400 to-yellow-600 text-slate-950 border-amber-100 font-black';
              iconEmoji = '🪐';
            }

            return (
              <button
                key={body.id}
                onClick={() => handleDestinationTap(body)}
                disabled={isBlasting}
                style={{ touchAction: 'manipulation' }}
                aria-label={`Blast off to ${body.name}`}
                className={`cockpit-btn min-h-[96px] p-3 sm:p-4 rounded-3xl border-4 flex flex-col items-center justify-center gap-1 transition-all transform hover:scale-[1.03] active:scale-95 ${bgClass} ${
                  isBlasting && blastingTarget?.id === body.id ? 'ring-4 ring-yellow-300 animate-pulse' : ''
                }`}
              >
                {/* Giant High-Contrast Emoji / Icon */}
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl filter drop-shadow">
                    {iconEmoji}
                  </span>
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                    {body.name}
                  </span>
                </div>

                {/* Toddler Sensory Tagline */}
                <span className="text-xs sm:text-sm font-bold opacity-90 truncate max-w-full">
                  {body.tagline || 'Explore now!'}
                </span>
              </button>
            );
          })}
        </div>

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
