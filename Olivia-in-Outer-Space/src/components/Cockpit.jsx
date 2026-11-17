import React, { useState, useRef, useEffect } from 'react';
import { useSpaceAudio } from './AudioPlayer';
import SolarSystemView from './SolarSystemView';
import FlyingToyRocket from './FlyingToyRocket';

/**
 * Flight Deck Cockpit frame hosting the SolarSystemView and blast-off rocket transition.
 */
export default function Cockpit({
  celestialBodies = [],
  onSelectDestination,
  usePhotoFace = false,
}) {
  const { triggerSynth, speak } = useSpaceAudio();
  const [blastingTarget, setBlastingTarget] = useState(null);
  const [isBlasting, setIsBlasting] = useState(false);
  const blastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (blastTimeoutRef.current) {
        clearTimeout(blastTimeoutRef.current);
      }
    };
  }, []);

  // Big push-button click handler
  const handleDestinationTap = (body) => {
    if (isBlasting) return;

    setBlastingTarget(body);
    setIsBlasting(true);

    // 1. Rocket sound cue & audio announcement
    triggerSynth('blastoff');
    speak(`Blast off to ${body.name}! Here we go!`);

    // 2. Transition rocket toward that body after rumble effect (~1.8s)
    if (blastTimeoutRef.current) {
      clearTimeout(blastTimeoutRef.current);
    }
    blastTimeoutRef.current = setTimeout(() => {
      setIsBlasting(false);
      if (onSelectDestination) {
        onSelectDestination(body);
      }
    }, 1800);
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-space-dark stars-bg select-none ${
        isBlasting ? 'animate-rumble' : ''
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Fullscreen Cockpit Windshield & Canopy Struts */}
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

        {/* Solar System Home Selection View */}
        <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
          <SolarSystemView
            celestialBodies={celestialBodies}
            onSelectDestination={handleDestinationTap}
            usePhotoFace={usePhotoFace}
          />
        </div>
      </div>

      {/* Blast-Off Event: Zooming Toy Rocket Transition */}
      {isBlasting && (
        <FlyingToyRocket isBlasting={true} targetName={blastingTarget?.name} usePhotoFace={usePhotoFace} />
      )}
    </div>
  );
}
