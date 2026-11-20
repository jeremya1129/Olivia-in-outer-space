import React, { useId } from 'react';
import { getAssetUrl } from '../utils/assets';

const WARP_STREAKS = [
  { left: '8%', height: '90px', delay: '0s', duration: '0.55s', color: 'from-cyan-300/80' },
  { left: '19%', height: '130px', delay: '0.2s', duration: '0.68s', color: 'from-yellow-200/85' },
  { left: '31%', height: '75px', delay: '0.4s', duration: '0.52s', color: 'from-white/80' },
  { left: '47%', height: '115px', delay: '0.1s', duration: '0.64s', color: 'from-sky-300/85' },
  { left: '63%', height: '140px', delay: '0.32s', duration: '0.7s', color: 'from-amber-200/80' },
  { left: '76%', height: '85px', delay: '0.15s', duration: '0.58s', color: 'from-cyan-200/85' },
  { left: '89%', height: '120px', delay: '0.38s', duration: '0.62s', color: 'from-white/85' },
];

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
export default function FlyingToyRocket({ isBlasting, targetName, usePhotoFace = false }) {
  const uid = useId().replace(/:/g, '');
  const idleClipId = `rocket-porthole-clip-idle-${uid}`;
  const blastClipId = `rocket-porthole-clip-blasting-${uid}`;

  const rocketFaceSrc = getAssetUrl(
    usePhotoFace
      ? '/assets/cartoons/characters/olivia_photo_face.png'
      : '/assets/cartoons/characters/olivia_cartoon_circle.webp'
  );

  if (!isBlasting) {
    return (
      <div className="relative w-20 h-24 md:w-24 md:h-28 animate-float pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
        <svg viewBox="0 0 160 190" className="w-full h-full rotate-12">
          <defs>
            <clipPath id={idleClipId}>
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
          <g clipPath={`url(#${idleClipId})`}>
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
          <path
            d="M72,168 Q80,188 88,168 Q80,178 72,168 Z"
            fill="#f59e0b"
            className="animate-thruster"
            style={{ transformOrigin: '80px 168px' }}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
    >
      {/* Pure-CSS Warp Speed Space Streaks */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {WARP_STREAKS.map((streak, i) => (
          <div
            key={`warp-${i}`}
            className={`absolute top-0 w-[2px] rounded-full bg-gradient-to-b ${streak.color} to-transparent animate-warp-streak`}
            style={{
              left: streak.left,
              height: streak.height,
              animationDelay: streak.delay,
              animationDuration: streak.duration,
            }}
          />
        ))}
      </div>

      {/* Zooming Rocket */}
      <div className="relative flex flex-col items-center animate-[zoomForward_1.8s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
        <div className="text-sm md:text-base font-black px-5 py-1.5 rounded-full bg-yellow-400 text-slate-950 shadow-2xl mb-3 animate-bounce uppercase tracking-widest border-2 border-slate-900">
          🚀 Destination: {targetName || 'Space'}!
        </div>
        <svg aria-hidden="true" viewBox="0 0 160 220" className="w-44 h-56 md:w-56 md:h-72 drop-shadow-[0_0_60px_rgba(250,204,21,0.95)]">
          <defs>
            <clipPath id={blastClipId}>
              <circle cx="80" cy="102" r="26" />
            </clipPath>
          </defs>

          {/* Roaring Rocket Thruster Flames */}
          <g className="animate-thruster" style={{ transformOrigin: '80px 160px' }}>
            <path
              d="M55,160 Q80,240 105,160 Q92,195 80,225 Q68,195 55,160 Z"
              fill="#ef4444"
            />
            <path
              d="M62,160 Q80,215 98,160 Q88,188 80,205 Q72,188 62,160 Z"
              fill="#f59e0b"
            />
            <path
              d="M68,160 Q80,190 92,160 Q85,178 80,188 Q75,178 68,160 Z"
              fill="#fef08a"
            />
          </g>

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
          <g clipPath={`url(#${blastClipId})`}>
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
