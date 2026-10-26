import React, { useState } from 'react';
import celestialData from './data/celestialData.json';
import Launchpad from './components/Launchpad';
import Cockpit from './components/Cockpit';
import PlanetView from './components/PlanetView';
import AudioPlayer, { AudioProvider, useSpaceAudio } from './components/AudioPlayer';
import { Rocket, Sparkles, Radio, ArrowLeft } from 'lucide-react';

function SpaceApp() {
  const { triggerSynth, speak } = useSpaceAudio();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [currentView, setCurrentView] = useState('launchpad'); // 'launchpad' | 'cockpit' | 'planet'
  const [isLaunching, setIsLaunching] = useState(false);
  const [cockpitViewMode, setCockpitViewMode] = useState('solarsystem'); // 'solarsystem' | 'earth'
  const [usePhotoFace, setUsePhotoFace] = useState(true); // Default to personalized real photos!

  const handleBlastOffFromEarth = () => {
    setCurrentView('cockpit');
  };

  const handleSelectDestination = (planet) => {
    setSelectedPlanet(planet);
    setCurrentView('planet');
  };

  const handleGenericLaunch = () => {
    const nextPlanet = selectedPlanet 
      ? celestialData[(celestialData.findIndex(p => p.id === selectedPlanet.id) + 1) % celestialData.length]
      : celestialData[1]; // default to Moon
    handleSelectDestination(nextPlanet);
  };

  const handleReturnToCockpit = () => {
    setCurrentView('cockpit');
  };

  const handleReturnToEarth = () => {
    setCurrentView('launchpad');
  };

  const handleRadioCheck = () => {
    triggerSynth('twinkle');
    speak('Mission Control to Captain Olivia and Navigator Anna: All systems are GO for space exploration!');
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-space-dark text-white select-none">
      
      {/* ======================================================== */}
      {/* SINGLE UNIFIED TOP MISSION CONTROL PANEL                 */}
      {/* ======================================================== */}
      <header className="relative z-30 w-full h-14 px-3 sm:px-5 bg-slate-900/95 border-b border-slate-700/80 backdrop-blur-md flex items-center justify-between shadow-xl shrink-0">
        
        {/* Left: Branding & Current Station Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <span className="text-lg">👩‍🚀</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 leading-tight">
              Olivia in Outer Space
            </h1>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="hidden sm:inline">ANNA &amp; OLIVIA ASTRO-LAB •</span>
              <span className="text-cyan-300 font-extrabold">
                {currentView === 'launchpad' && 'EARTH SPACEPORT'}
                {currentView === 'cockpit' && 'FLIGHT DECK'}
                {currentView === 'planet' && (selectedPlanet?.name || 'DESTINATION')}
              </span>
            </div>
          </div>
        </div>

        {/* Center: In Cockpit Mode -> View Switcher Toggle */}
        {currentView === 'cockpit' && (
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-cyan-500/40 shadow-inner">
            <button
              onClick={() => {
                triggerSynth('beep');
                setCockpitViewMode('solarsystem');
                speak('Solar System Highway!');
              }}
              style={{ touchAction: 'manipulation' }}
              className={`cockpit-btn px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition-all ${
                cockpitViewMode === 'solarsystem'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🪐 Solar System
            </button>
            <button
              onClick={() => {
                triggerSynth('beep');
                setCockpitViewMode('earth');
                speak('Earth Orbit View!');
              }}
              style={{ touchAction: 'manipulation' }}
              className={`cockpit-btn px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition-all ${
                cockpitViewMode === 'earth'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌍 Earth Orbit
            </button>
          </div>
        )}

        {/* Right: Unified Controls (Photos, Radio, Back/Earth Start, Audio) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentView === 'cockpit' && (
            <>
              {/* Personalized Real Photo vs Cartoon Pilot Face Toggle */}
              <button
                onClick={() => {
                  triggerSynth('twinkle');
                  setUsePhotoFace((prev) => !prev);
                  speak(usePhotoFace ? 'Cartoon faces!' : "Olivia and Anna's photo faces!");
                }}
                style={{ touchAction: 'manipulation' }}
                title="Toggle astronaut photos vs cartoon faces"
                className="cockpit-btn px-2 sm:px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-400/50 rounded-xl flex items-center gap-1 text-[11px] font-black shadow-md"
              >
                <span>{usePhotoFace ? '📸 Photos' : '🎨 Cartoon'}</span>
              </button>

              {/* Crew Radio Check */}
              <button
                onClick={handleRadioCheck}
                style={{ touchAction: 'manipulation' }}
                title="Radio check with Astro-Lab Mission Control"
                className="cockpit-btn px-2 sm:px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-cyan-200 border border-indigo-400/50 rounded-xl flex items-center gap-1 text-[11px] font-black shadow-md"
              >
                <Radio className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span className="hidden md:inline">Radio</span>
              </button>
            </>
          )}

          {/* Destination View: Return to Cockpit Shortcut */}
          {currentView === 'planet' && (
            <button
              onClick={handleReturnToCockpit}
              style={{ touchAction: 'manipulation' }}
              className="cockpit-btn px-2.5 sm:px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-black rounded-xl border border-cyan-400/50 flex items-center gap-1 shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-300" />
              <span>Cockpit</span>
            </button>
          )}

          {/* Return to Earth Launchpad Start (Present only once!) */}
          {currentView !== 'launchpad' && (
            <button
              onClick={handleReturnToEarth}
              style={{ touchAction: 'manipulation' }}
              title="Return to Earth launchpad start screen"
              className="cockpit-btn px-2 sm:px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-black rounded-xl border border-emerald-400/50 flex items-center gap-1 shadow-md"
            >
              <span>🌍</span>
              <span className="hidden sm:inline">Earth Start</span>
            </button>
          )}

          {/* Master Audio Controller */}
          <AudioPlayer />
        </div>
      </header>

      {/* Main View Area (Fills remaining height) */}
      <main className="relative flex-1 w-full h-[calc(100%-56px)] overflow-hidden">
        {/* Full-screen Hyper-Drive Blast Off Transition */}
        {isLaunching && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center animate-pulse">
            <div className="text-7xl md:text-8xl animate-bounce mb-4">🚀</div>
            <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300 tracking-widest uppercase">
              WARP SPEED!
            </div>
            <div className="text-base md:text-lg text-cyan-200 mt-2 font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <span>Traveling to {selectedPlanet?.name || 'deep space'}...</span>
            </div>
          </div>
        )}

        {/* View Routing */}
        {currentView === 'launchpad' && (
          <Launchpad onBlastOff={handleBlastOffFromEarth} />
        )}

        {currentView === 'cockpit' && (
          <Cockpit
            celestialBodies={celestialData}
            onSelectDestination={handleSelectDestination}
            onLaunchSequence={handleGenericLaunch}
            onReturnToEarth={handleReturnToEarth}
            cockpitViewMode={cockpitViewMode}
            usePhotoFace={usePhotoFace}
          />
        )}

        {currentView === 'planet' && (
          <PlanetView
            planet={selectedPlanet || celestialData[0]}
            onReturnToCockpit={handleReturnToCockpit}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <SpaceApp />
    </AudioProvider>
  );
}
