import React, { useState, useEffect } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import { Sparkles, Camera, Play, Volume2, Compass, ArrowRight } from 'lucide-react';

/**
 * Cartoon Astronaut Avatar for the Launchpad
 */
function EarthAstronaut({ name, isOlivia, isWalking, isCheering, usePhotoFace = false, onClick }) {
  const suitAccent = isOlivia ? '#38bdf8' : '#c084fc';
  const visorTint = isOlivia ? 'rgba(56, 189, 248, 0.25)' : 'rgba(216, 180, 254, 0.25)';
  const photoSrc = isOlivia
    ? '/assets/cartoons/characters/olivia_photo_face.png'
    : '/assets/cartoons/characters/anna_photo_face.png';
  const cartoonSrc = isOlivia
    ? '/assets/cartoons/characters/olivia_cartoon_circle.png'
    : '/assets/cartoons/characters/anna_cartoon_circle.png';

  const clipId = `earth-visor-${name.toLowerCase()}`;

  return (
    <div
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-300 ${
        isWalking ? 'animate-bounce' : isCheering ? 'scale-110 -translate-y-4' : 'hover:scale-105'
      }`}
    >
      {/* Speech Bubble Prompt */}
      <div className="mb-2 px-3 py-1 bg-white text-slate-900 font-black text-xs sm:text-sm rounded-2xl shadow-lg border-2 border-slate-900 relative animate-pulse whitespace-nowrap">
        {isOlivia ? "I'm Captain Olivia! 🚀" : "I'm Navigator Anna! 🧭"}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
      </div>

      {/* SVG Character */}
      <svg viewBox="0 0 170 210" className="w-28 h-36 sm:w-36 sm:h-44 md:w-44 md:h-52 drop-shadow-xl">
        <defs>
          <clipPath id={clipId}>
            <ellipse cx="85" cy="72" rx="41" ry="36" />
          </clipPath>
        </defs>

        {/* Backpack Life Support */}
        <rect x="52" y="112" width="66" height="58" rx="14" fill="#cbd5e1" stroke="#334155" strokeWidth="4" />
        <rect x="62" y="122" width="46" height="10" rx="4" fill={suitAccent} />

        {/* Helmet Outer Shell */}
        <circle cx="85" cy="72" r="52" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
        <circle cx="85" cy="72" r="50" fill="#e2e8f0" />

        {/* Helmet Collar Ring */}
        <ellipse cx="85" cy="120" rx="38" ry="11" fill={suitAccent} stroke="#1e293b" strokeWidth="3" />

        {/* Helmet Bubble Glass Visor */}
        <ellipse cx="85" cy="72" rx="43" ry="38" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />

        {/* Face Content: Real Photo Cutout or New Cartoon Face */}
        {usePhotoFace ? (
          <g clipPath={`url(#${clipId})`}>
            <rect x="40" y="32" width="90" height="80" fill="#0f172a" />
            <image
              href={photoSrc}
              x={isOlivia ? "40" : "41"}
              y={isOlivia ? "31" : "32"}
              width="90"
              height="80"
              preserveAspectRatio="xMidYMid slice"
            />
            <ellipse cx="85" cy="72" rx="41" ry="36" fill={visorTint} />
          </g>
        ) : (
          <g clipPath={`url(#${clipId})`}>
            <rect x="40" y="32" width="90" height="80" fill="#0f172a" />
            {/* New illustrated cartoon face from reference */}
            <image
              href={cartoonSrc}
              x="42"
              y="32"
              width="86"
              height="80"
              preserveAspectRatio="xMidYMid slice"
            />
            <ellipse cx="85" cy="72" rx="41" ry="36" fill={visorTint} />
          </g>
        )}

        {/* Visor Glare / Curved Glass Highlight */}
        <path
          d="M58,50 Q85,38 112,46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="116" cy="48" r="2" fill="#ffffff" opacity="0.5" />

        {/* Spacesuit Body & Arms */}
        <path d="M54,124 Q40,140 34,168 Q44,174 54,152 L54,180 L116,180 L116,152 Q126,174 136,168 Q130,140 116,124 Z" fill="#ffffff" stroke="#334155" strokeWidth="4" />
        
        {/* Mission Patch */}
        <circle cx="85" cy="144" r="10" fill={suitAccent} stroke="#1e293b" strokeWidth="2" />
        <polygon points="85,137 88,143 94,144 90,148 91,154 85,150 79,154 80,148 76,144 82,143" fill="#fbbf24" />

        {/* Astronaut Boots */}
        <rect x="54" y="180" width="26" height="24" rx="8" fill={suitAccent} stroke="#1e293b" strokeWidth="3" />
        <rect x="90" y="180" width="26" height="24" rx="8" fill={suitAccent} stroke="#1e293b" strokeWidth="3" />
      </svg>
    </div>
  );
}

/**
 * Animated Boarding & Blast-off Cinematic Sequence
 */
function BoardingCinematic({ usePhotoFace, onComplete, onSkip }) {
  const { triggerSynth, playTrackOrSfx, speak } = useSpaceAudio();
  const [phase, setPhase] = useState('boarding'); // 'boarding' | 'countdown' | 'liftoff'
  const [count, setCount] = useState(3);

  useEffect(() => {
    // 1. Boarding Phase
    speak("All aboard the Adventure Rocket! Captain Olivia and Navigator Anna are climbing inside!");
    triggerSynth('twinkle');

    const countdownTimer = setTimeout(() => {
      setPhase('countdown');
      speak("Ready for ignition! 3...");
      triggerSynth('beep');
    }, 2800);

    return () => clearTimeout(countdownTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;

    if (count === 3) {
      const t = setTimeout(() => {
        setCount(2);
        speak("2...");
        triggerSynth('beep');
      }, 1000);
      return () => clearTimeout(t);
    }
    if (count === 2) {
      const t = setTimeout(() => {
        setCount(1);
        speak("1...");
        triggerSynth('beep');
      }, 1000);
      return () => clearTimeout(t);
    }
    if (count === 1) {
      const t = setTimeout(() => {
        setPhase('liftoff');
        speak("BLAST OFF! Into Outer Space!");
        triggerSynth('blastoff');
        playTrackOrSfx(null, 'blastoff');
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [phase, count]);

  useEffect(() => {
    if (phase === 'liftoff') {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 3200);
      return () => clearTimeout(finishTimer);
    }
  }, [phase]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Skip Button */}
      <button
        onClick={onSkip}
        style={{ touchAction: 'manipulation' }}
        className="absolute top-6 right-6 z-50 px-4 py-2 bg-slate-800/90 text-yellow-300 font-black rounded-2xl border-2 border-yellow-400 flex items-center gap-1.5 shadow-2xl"
      >
        <span>Skip</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* PHASE 1: BOARDING THE ROCKET */}
      {phase === 'boarding' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          {/* Sunny Earth Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 -z-10" />

          {/* Banner */}
          <div className="px-6 py-2 rounded-full bg-slate-900/90 border-2 border-yellow-300 text-yellow-300 text-lg md:text-2xl font-black mb-6 shadow-2xl animate-bounce">
            🪜 BOARDING THE ADVENTURE ROCKET!
          </div>

          {/* Launch Pad Scene */}
          <div className="relative flex items-end justify-center gap-4 sm:gap-8 max-w-2xl w-full">
            {/* Olivia & Anna Climbing Ramp */}
            <div className="flex items-end gap-2 animate-[slideRight_2.4s_ease-in-out_forwards]">
              <EarthAstronaut
                name="Olivia"
                isOlivia={true}
                isWalking={true}
                usePhotoFace={usePhotoFace}
              />
              <EarthAstronaut
                name="Anna"
                isOlivia={false}
                isWalking={true}
                usePhotoFace={usePhotoFace}
              />
            </div>

            {/* Standing Adventure Rocket */}
            <div className="relative flex flex-col items-center">
              <div className="text-6xl sm:text-7xl animate-pulse">🚀</div>
              <div className="w-24 h-4 bg-slate-800 rounded-full mt-2 opacity-50" />
            </div>
          </div>

          <div className="mt-8 text-white font-extrabold text-base sm:text-xl drop-shadow-md">
            Fasten your seatbelts, Astronauts! 🌟
          </div>
        </div>
      )}

      {/* PHASE 2: COUNTDOWN */}
      {phase === 'countdown' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900">
          <div className="text-xl sm:text-3xl font-black text-cyan-300 uppercase tracking-widest mb-4">
            MISSION COUNTDOWN
          </div>

          {/* Giant Countdown Number */}
          <div className="text-9xl sm:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 animate-ping">
            {count}
          </div>

          <div className="text-lg sm:text-2xl font-black text-white mt-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
            <span>Engines warming up...</span>
          </div>
        </div>
      )}

      {/* PHASE 3: LIFTOFF & ASCENT */}
      {phase === 'liftoff' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden animate-rumble">
          {/* Space Horizon Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-space-dark via-slate-950 to-indigo-950 stars-bg -z-10" />

          {/* Soaring Rocket with Plume */}
          <div className="relative flex flex-col items-center animate-[zoomForward_2.8s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
            <div className="px-6 py-2 rounded-full bg-red-600 text-white font-black text-xl sm:text-3xl shadow-[0_0_50px_rgba(239,68,68,0.8)] border-2 border-yellow-300 uppercase tracking-widest mb-4">
              🔥 BLAST OFF! 🔥
            </div>

            {/* Giant Rocket SVG */}
            <svg viewBox="0 0 160 260" className="w-56 h-80 sm:w-72 sm:h-96 drop-shadow-[0_0_70px_rgba(250,204,21,0.9)]">
              <defs>
                <clipPath id="launch-porthole-clip">
                  <circle cx="80" cy="102" r="26" />
                </clipPath>
              </defs>

              {/* Mega Thruster Plumes */}
              <path d="M50,160 Q80,260 110,160 Q94,210 80,250 Q66,210 50,160 Z" fill="#ef4444" className="animate-pulse" />
              <path d="M60,160 Q80,230 100,160 Q90,195 80,225 Q70,195 60,160 Z" fill="#f59e0b" />
              <path d="M68,160 Q80,200 92,160 Q85,185 80,198 Q75,185 68,160 Z" fill="#fef08a" />

              {/* Base */}
              <ellipse cx="80" cy="160" rx="46" ry="14" fill="#475569" stroke="#1e293b" strokeWidth="3" />

              {/* Hull */}
              <path d="M80,24 C112,52 126,112 122,160 L38,160 C34,112 48,52 80,24 Z" fill="#ffffff" stroke="#475569" strokeWidth="4" />
              
              {/* Nosecone */}
              <path d="M80,24 C96,40 103,58 105,66 L55,66 C57,58 64,40 80,24 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />

              {/* Olivia inside the porthole */}
              <circle cx="80" cy="102" r="30" fill="#ffffff" stroke="#94a3b8" strokeWidth="3.5" />
              <g clipPath="url(#launch-porthole-clip)">
                <circle cx="80" cy="102" r="26" fill="#3b0764" />
                <image
                  href={usePhotoFace ? "/assets/cartoons/characters/olivia_photo_face.png" : "/assets/cartoons/characters/olivia_cartoon_circle.png"}
                  x="54"
                  y="76"
                  width="52"
                  height="52"
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>

              {/* Red Badge */}
              <rect x="108" y="96" width="16" height="10" rx="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
              <text x="116" y="103" fontSize="4.5" fontWeight="900" fill="#ffffff" textAnchor="middle">OLIVIA</text>
            </svg>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Main Launchpad / Start Screen Component
 */
export default function Launchpad({ onBlastOff, usePhotoFace = false, onTogglePhotoFace }) {
  const { triggerSynth, speak } = useSpaceAudio();
  const [internalPhotoFace, setInternalPhotoFace] = useState(false);
  const activePhotoFace = onTogglePhotoFace !== undefined ? usePhotoFace : internalPhotoFace;
  const togglePhotoFace = () => {
    if (onTogglePhotoFace) {
      onTogglePhotoFace();
    } else {
      setInternalPhotoFace(p => !p);
    }
  };
  const [isCinematicActive, setIsCinematicActive] = useState(false);

  const handleTapOlivia = () => {
    triggerSynth('twinkle');
    speak("Captain Olivia reporting for duty! All systems ready for space!");
  };

  const handleTapAnna = () => {
    triggerSynth('twinkle');
    speak("Navigator Anna is excited! Look at the big rocket!");
  };

  const handleTapRocket = () => {
    triggerSynth('rover_beep');
    speak("The Adventure Rocket is fueled and ready to blast off!");
  };

  const handleStartBlastOff = () => {
    triggerSynth('blastoff');
    setIsCinematicActive(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400">
      
      {/* Cinematic Modal when Blast Off is clicked */}
      {isCinematicActive && (
        <BoardingCinematic
          usePhotoFace={activePhotoFace}
          onComplete={onBlastOff}
          onSkip={onBlastOff}
        />
      )}

      {/* Top Controls: Photo Toggle & Mission Welcome */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 pt-3 flex items-center justify-between">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-yellow-300 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>Earth Spaceport Launchpad</span>
        </div>

        {/* Toggle Photo Face */}
        <button
          onClick={() => {
            triggerSynth('twinkle');
            togglePhotoFace();
            speak(activePhotoFace ? "Cartoon art mode!" : "Olivia and Anna's photo mode!");
          }}
          style={{ touchAction: 'manipulation' }}
          className="cockpit-btn px-3.5 py-1.5 bg-slate-900/85 hover:bg-slate-800 text-yellow-300 border-2 border-yellow-400/60 rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-xl backdrop-blur-md"
        >
          <Camera className="w-4 h-4 text-cyan-300" />
          <span>{activePhotoFace ? '📸 Real Photo Face' : '🎨 Cartoon Face'}</span>
        </button>
      </div>

      {/* Main Ground Stage: Earth Hills, Rocket, and Astronauts */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-end pb-4 sm:pb-6 z-10 px-4">
        
        {/* Sky Elements: Fluffy Clouds & Sun */}
        <div className="absolute top-8 left-8 w-28 sm:w-36 h-12 bg-white/70 rounded-full blur-[1px] -z-10 animate-float" />
        <div className="absolute top-16 right-12 w-32 sm:w-44 h-14 bg-white/75 rounded-full blur-[1px] -z-10 animate-float" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-yellow-300 shadow-[0_0_60px_rgba(253,224,71,0.8)] -z-20" />

        {/* The Adventure Rocket & Boarding Platform */}
        <div className="relative w-full flex items-end justify-center gap-6 sm:gap-12 mb-3">
          
          {/* Captain Olivia (Standing Left) */}
          <EarthAstronaut
            name="Olivia"
            isOlivia={true}
            usePhotoFace={activePhotoFace}
            onClick={handleTapOlivia}
          />

          {/* Little Tikes Adventure Rocket Standing on Launchpad */}
          <div
            onClick={handleTapRocket}
            style={{ touchAction: 'manipulation' }}
            className="cockpit-btn relative flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200"
          >
            {/* Launch Gantry / Boarding Stairs */}
            <div className="absolute -left-8 sm:-left-12 bottom-6 w-10 sm:w-14 h-24 border-r-4 border-slate-600 bg-slate-700/60 flex flex-col justify-between py-2 -z-10">
              <div className="w-full h-1 bg-yellow-400" />
              <div className="w-full h-1 bg-yellow-400" />
              <div className="w-full h-1 bg-yellow-400" />
            </div>

            {/* Standing Rocket SVG */}
            <svg viewBox="0 0 160 240" className="w-36 h-56 sm:w-48 sm:h-72 drop-shadow-2xl">
              <defs>
                <clipPath id="earth-rocket-porthole">
                  <circle cx="80" cy="100" r="26" />
                </clipPath>
              </defs>

              {/* Fins */}
              <path d="M42,152 L12,185 L42,182 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <path d="M118,152 L148,185 L118,182 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />

              {/* Scalloped Base */}
              <ellipse cx="80" cy="180" rx="44" ry="12" fill="#475569" stroke="#334155" strokeWidth="2.5" />

              {/* Main White Bulbous Hull */}
              <path d="M80,24 C108,50 120,110 118,165 L42,165 C40,110 52,50 80,24 Z" fill="#ffffff" stroke="#64748b" strokeWidth="3.5" />

              {/* Nosecone */}
              <path d="M80,24 C94,40 101,56 103,64 L57,64 C59,56 66,40 80,24 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />

              {/* Red Crayon Scribbles */}
              <path d="M54,76 Q60,68 68,76 T78,70 T88,75" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
              <path d="M52,90 Q62,84 58,96 T70,92" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />

              {/* Purple Bubble Porthole */}
              <circle cx="80" cy="100" r="28" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
              <g clipPath="url(#earth-rocket-porthole)">
                <circle cx="80" cy="100" r="24" fill="#3b0764" />
                <circle cx="73" cy="94" r="2" fill="#ffffff" />
                <circle cx="88" cy="98" r="1.5" fill="#ffffff" />
                <circle cx="82" cy="108" r="1.5" fill="#fde047" />
              </g>

              {/* Red Badge */}
              <rect x="104" y="94" width="14" height="9" rx="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
              <text x="111" y="100" fontSize="4" fontWeight="900" fill="#ffffff" textAnchor="middle">OLIVIA</text>

              {/* Orange Handle */}
              <rect x="108" y="74" width="5" height="12" rx="2.5" fill="#f97316" />
            </svg>

            {/* Launchpad Base Platform */}
            <div className="w-48 sm:w-64 h-5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-xl border-2 border-slate-500 shadow-xl flex items-center justify-around px-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[9px] font-black tracking-widest text-yellow-300 uppercase">
                LAUNCH PAD 01
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>

          {/* Navigator Anna (Standing Right) */}
          <EarthAstronaut
            name="Anna"
            isOlivia={false}
            usePhotoFace={activePhotoFace}
            onClick={handleTapAnna}
          />

        </div>

      </div>

      {/* Bottom Command Bar: GIANT BLAST OFF BUTTON */}
      <div className="relative z-30 w-full bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/90 border-t-8 border-slate-700 px-4 py-4 sm:py-5 shadow-[0_-15px_35px_rgba(0,0,0,0.6)] flex flex-col items-center">
        
        {/* Giant Tactile Blast Off Push-Button */}
        <button
          onClick={handleStartBlastOff}
          style={{ touchAction: 'manipulation' }}
          className="cockpit-btn min-h-[96px] w-full max-w-lg px-8 py-4 rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-2xl sm:text-3xl tracking-widest uppercase border-4 border-yellow-300 shadow-[0_0_40px_rgba(245,158,11,0.7)] flex items-center justify-center gap-4 transition-transform hover:scale-[1.03] active:scale-95 group"
        >
          <span className="text-4xl sm:text-5xl group-hover:animate-bounce">🚀</span>
          <span className="drop-shadow-md">BLAST OFF!</span>
          <span className="text-4xl sm:text-5xl group-hover:animate-bounce">🔥</span>
        </button>

        <div className="text-xs sm:text-sm font-extrabold text-cyan-200 mt-2 tracking-wide text-center">
          Tap the big button to board the rocket and blast off into space!
        </div>
      </div>

    </div>
  );
}
