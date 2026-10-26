import React from 'react';

/**
 * Cartoon Celestial Body Visuals
 * Delightful, high-contrast vector illustrations tailored for toddlers.
 * Used in selection views (Solar System Highway & Planetary System views),
 * while real spacecraft photography is showcased in the final destination view.
 */
export default function CartoonCelestialBody({ id, size = 64, className = '' }) {
  const s = size;

  switch (id) {
    case 'sun':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
          <defs>
            <radialGradient id="sun-grad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
            <filter id="sun-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Radiant Sunburst Flares */}
          <g filter="url(#sun-glow)" opacity="0.75" className="animate-spin-slow origin-center">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <polygon
                key={`flare-${deg}`}
                points="50,6 55,20 45,20"
                fill="#fde047"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
          </g>
          {/* Main Sun Body */}
          <circle cx="50" cy="50" r="34" fill="url(#sun-grad)" stroke="#fef08a" strokeWidth="2.5" />
          {/* Warm Sun Cheeks & Smile */}
          <circle cx="40" cy="52" r="3.5" fill="#ea580c" opacity="0.5" />
          <circle cx="60" cy="52" r="3.5" fill="#ea580c" opacity="0.5" />
          {/* Happy Eyes */}
          <circle cx="42" cy="45" r="3" fill="#78350f" />
          <circle cx="58" cy="45" r="3" fill="#78350f" />
          <circle cx="43" cy="44" r="1" fill="#ffffff" />
          <circle cx="59" cy="44" r="1" fill="#ffffff" />
          {/* Happy Smile */}
          <path d="M44,53 Q50,60 56,53" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'mercury':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="merc-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#merc-grad)" stroke="#cbd5e1" strokeWidth="2" />
          {/* Craters */}
          <circle cx="36" cy="38" r="7" fill="#64748b" opacity="0.5" />
          <circle cx="62" cy="44" r="9" fill="#64748b" opacity="0.6" />
          <circle cx="45" cy="65" r="6" fill="#64748b" opacity="0.5" />
          {/* Speedy little runner highlight */}
          <path d="M26,30 Q35,20 48,22" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </svg>
      );

    case 'venus':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="venus-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <clipPath id="venus-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#venus-grad)" stroke="#fef08a" strokeWidth="2" />
          {/* Swirling yellow cloud bands */}
          <g clipPath="url(#venus-clip)" opacity="0.55">
            <path d="M10,35 Q30,25 55,38 T95,30" fill="none" stroke="#fffbeb" strokeWidth="7" strokeLinecap="round" />
            <path d="M5,52 Q40,42 65,58 T95,50" fill="none" stroke="#fde047" strokeWidth="8" strokeLinecap="round" />
            <path d="M10,70 Q35,62 60,74 T95,68" fill="none" stroke="#d97706" strokeWidth="6" strokeLinecap="round" />
          </g>
          {/* Atmosphere shine */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />
        </svg>
      );

    case 'earth':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="earth-ocean" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
            <clipPath id="earth-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          {/* Deep Blue Oceans */}
          <circle cx="50" cy="50" r="38" fill="url(#earth-ocean)" stroke="#7dd3fc" strokeWidth="2.5" />
          {/* Green Continents */}
          <g clipPath="url(#earth-clip)">
            {/* North America */}
            <path d="M22,25 Q32,20 38,30 Q42,42 30,46 Q20,40 22,25 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
            {/* South America */}
            <path d="M34,50 Q44,48 40,68 Q34,76 28,66 Q30,55 34,50 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
            {/* Eurasia / Africa */}
            <path d="M54,22 Q75,18 80,35 Q85,50 68,52 Q58,38 54,22 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
            <path d="M62,50 Q76,55 70,72 Q58,74 60,56 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
            {/* Swirling White Clouds */}
            <path d="M15,38 Q35,32 55,42 Q75,34 90,40" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
            <path d="M25,62 Q50,56 70,64 T90,60" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
          </g>
          {/* Atmospheric Rim */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#bae6fd" strokeWidth="2" opacity="0.9" />
        </svg>
      );

    case 'moon':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="moon-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#moon-grad)" stroke="#f8fafc" strokeWidth="2" />
          {/* Craters */}
          <circle cx="36" cy="36" r="6" fill="#64748b" opacity="0.45" />
          <circle cx="62" cy="42" r="8" fill="#64748b" opacity="0.5" />
          <circle cx="46" cy="62" r="5" fill="#64748b" opacity="0.4" />
          <circle cx="30" cy="58" r="4" fill="#64748b" opacity="0.35" />
          {/* Gentle crescent nightlight shine */}
          <path d="M22,35 Q30,18 48,20" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'mars':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="mars-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <clipPath id="mars-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#mars-grad)" stroke="#fca5a5" strokeWidth="2" />
          {/* Polar Ice Cap & Red Planet details */}
          <g clipPath="url(#mars-clip)">
            {/* White North Polar Ice Cap */}
            <ellipse cx="50" cy="16" rx="16" ry="8" fill="#ffffff" opacity="0.9" />
            {/* Dark rusty canyons & craters */}
            <path d="M20,45 Q40,38 60,48 T85,42" fill="none" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
            <circle cx="35" cy="55" r="7" fill="#7f1d1d" opacity="0.45" />
            <circle cx="68" cy="60" r="9" fill="#7f1d1d" opacity="0.45" />
          </g>
        </svg>
      );

    case 'phobos':
    case 'deimos':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          {/* Space Potato Shape */}
          <path
            d="M30,25 Q65,18 78,35 Q90,55 75,75 Q55,88 32,78 Q15,65 18,42 Q20,28 30,25 Z"
            fill="#a8a29e"
            stroke="#d6d3d1"
            strokeWidth="2.5"
          />
          <circle cx="45" cy="40" r="6" fill="#78716c" opacity="0.6" />
          <circle cx="62" cy="56" r="7" fill="#78716c" opacity="0.6" />
          <circle cx="38" cy="65" r="5" fill="#78716c" opacity="0.5" />
        </svg>
      );

    case 'ceres':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="ceres-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#ceres-grad)" stroke="#94a3b8" strokeWidth="2" />
          {/* Famous bright white salt spots (Occator Crater) */}
          <circle cx="46" cy="48" r="4.5" fill="#ffffff" className="animate-pulse" />
          <circle cx="54" cy="45" r="3" fill="#ffffff" />
          <circle cx="50" cy="53" r="2.5" fill="#ffffff" />
          <circle cx="34" cy="60" r="5" fill="#475569" opacity="0.5" />
          <circle cx="68" cy="38" r="6" fill="#475569" opacity="0.5" />
        </svg>
      );

    case 'jupiter':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="jup-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
            <clipPath id="jup-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#jup-grad)" stroke="#fdba74" strokeWidth="2.5" />
          {/* Swirling gas cloud bands */}
          <g clipPath="url(#jup-clip)">
            <path d="M5,25 Q35,18 65,28 T95,22" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
            <path d="M5,36 Q40,30 70,40 T95,34" fill="none" stroke="#fff7ed" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            <path d="M5,48 Q35,42 65,52 T95,46" fill="none" stroke="#c2410c" strokeWidth="7" strokeLinecap="round" />
            <path d="M5,62 Q45,56 75,66 T95,60" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
            <path d="M5,74 Q35,68 65,78 T95,72" fill="none" stroke="#fff7ed" strokeWidth="5" strokeLinecap="round" opacity="0.9" />

            {/* Iconic Great Red Spot */}
            <ellipse cx="66" cy="64" rx="10" ry="7" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="66" cy="64" r="3.5" fill="#f87171" />
          </g>
          {/* Planetary Rim */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ffedd5" strokeWidth="1.5" opacity="0.8" />
        </svg>
      );

    case 'europa':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="europa-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </radialGradient>
            <clipPath id="europa-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#europa-grad)" stroke="#bae6fd" strokeWidth="2" />
          {/* Icy surface fracture lineae */}
          <g clipPath="url(#europa-clip)" stroke="#b45309" strokeWidth="1.5" opacity="0.6">
            <line x1="20" y1="30" x2="70" y2="65" />
            <line x1="60" y1="20" x2="35" y2="80" />
            <line x1="30" y1="65" x2="80" y2="45" />
          </g>
        </svg>
      );

    case 'ganymede':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="ganymede-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
            <clipPath id="gan-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#ganymede-grad)" stroke="#cbd5e1" strokeWidth="2" />
          <g clipPath="url(#gan-clip)">
            <path d="M20,30 Q45,25 60,45 T85,35" fill="none" stroke="#cbd5e1" strokeWidth="4" opacity="0.4" />
            <circle cx="40" cy="45" r="7" fill="#1e293b" opacity="0.5" />
            <circle cx="65" cy="60" r="9" fill="#1e293b" opacity="0.5" />
          </g>
        </svg>
      );

    case 'callisto':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="cal-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#cal-grad)" stroke="#94a3b8" strokeWidth="2" />
          {/* Sparkly impact craters */}
          <circle cx="35" cy="35" r="3.5" fill="#ffffff" opacity="0.9" />
          <circle cx="65" cy="42" r="4.5" fill="#ffffff" opacity="0.9" />
          <circle cx="48" cy="62" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="28" cy="58" r="2.5" fill="#ffffff" opacity="0.8" />
          <circle cx="72" cy="65" r="2" fill="#ffffff" opacity="0.7" />
        </svg>
      );

    case 'saturn':
      return (
        <svg width={s} height={s} viewBox="0 0 120 100" className={`overflow-visible ${className}`}>
          <defs>
            <radialGradient id="saturn-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
          </defs>
          {/* Saturn Giant Rings (Back Layer) */}
          <ellipse
            cx="60"
            cy="50"
            rx="52"
            ry="16"
            fill="none"
            stroke="#fde047"
            strokeWidth="9"
            strokeOpacity="0.85"
            transform="rotate(-20 60 50)"
          />
          <ellipse
            cx="60"
            cy="50"
            rx="56"
            ry="18"
            fill="none"
            stroke="#ca8a04"
            strokeWidth="3.5"
            strokeOpacity="0.65"
            transform="rotate(-20 60 50)"
          />

          {/* Golden Striped Sphere */}
          <circle cx="60" cy="50" r="30" fill="url(#saturn-grad)" stroke="#fef08a" strokeWidth="2" />

          {/* Saturn Giant Rings (Front Layer Overlap for 3D depth) */}
          <path
            d="M 12 50 A 52 16 0 0 0 108 50"
            fill="none"
            stroke="#fef08a"
            strokeWidth="8.5"
            strokeOpacity="0.9"
            transform="rotate(-20 60 50)"
          />
        </svg>
      );

    case 'titan':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="titan-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="55%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#titan-grad)" stroke="#fdba74" strokeWidth="2.5" />
          {/* Fuzzy Orange Atmospheric Glow */}
          <circle cx="50" cy="50" r="36" fill="none" stroke="#fff7ed" strokeWidth="3" opacity="0.4" />
        </svg>
      );

    case 'enceladus':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="enc-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#38bdf8" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#enc-grad)" stroke="#ffffff" strokeWidth="2.5" />
          {/* Sparkling ice stars */}
          <circle cx="38" cy="38" r="2.5" fill="#ffffff" />
          <circle cx="60" cy="52" r="3" fill="#ffffff" />
          <path d="M45,68 Q50,78 55,68" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
        </svg>
      );

    case 'uranus':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
          <defs>
            <radialGradient id="uranus-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#cffafe" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
          </defs>
          {/* Tilted vertical ring */}
          <ellipse cx="50" cy="50" rx="14" ry="48" fill="none" stroke="#a5f3fc" strokeWidth="3" opacity="0.6" transform="rotate(15 50 50)" />
          {/* Cyan Ice Sphere */}
          <circle cx="50" cy="50" r="35" fill="url(#uranus-grad)" stroke="#a5f3fc" strokeWidth="2" />
        </svg>
      );

    case 'neptune':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="nep-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </radialGradient>
            <clipPath id="nep-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#nep-grad)" stroke="#93c5fd" strokeWidth="2" />
          {/* White windy cloud streaks */}
          <g clipPath="url(#nep-clip)">
            <path d="M10,32 Q35,28 65,36 T95,30" fill="none" stroke="#dbeafe" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
            <path d="M5,55 Q40,48 70,58 T95,52" fill="none" stroke="#bfdbfe" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
            {/* Dark Storm Spot */}
            <ellipse cx="64" cy="46" rx="8" ry="5" fill="#172554" opacity="0.7" />
          </g>
        </svg>
      );

    case 'triton':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="triton-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="55%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#triton-grad)" stroke="#fbcfe8" strokeWidth="2" />
          <circle cx="42" cy="42" r="5" fill="#94a3b8" opacity="0.5" />
          <circle cx="62" cy="58" r="6" fill="#94a3b8" opacity="0.5" />
        </svg>
      );

    case 'pluto':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id="pluto-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="55%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
            <clipPath id="pluto-clip">
              <circle cx="50" cy="50" r="38" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#pluto-grad)" stroke="#fed7aa" strokeWidth="2" />
          {/* Famous Tombaugh Regio Heart! */}
          <g clipPath="url(#pluto-clip)">
            <path
              d="M 52 46 C 52 38, 42 32, 35 38 C 28 44, 32 54, 52 68 C 72 54, 76 44, 69 38 C 62 32, 52 38, 52 46 Z"
              fill="#ffffff"
              opacity="0.85"
            />
          </g>
        </svg>
      );

    default:
      return (
        <div
          style={{ width: s, height: s }}
          className={`rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white ${className}`}
        >
          <span className="text-xl">🪐</span>
        </div>
      );
  }
}
