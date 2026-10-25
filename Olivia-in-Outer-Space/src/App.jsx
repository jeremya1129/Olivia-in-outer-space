import React, { useState } from 'react';
import celestialData from './data/celestialData.json';
import Cockpit from './components/Cockpit';
import PlanetView from './components/PlanetView';
import AudioPlayer, { AudioProvider } from './components/AudioPlayer';
import { Rocket, Sparkles } from 'lucide-react';

function SpaceApp() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [currentView, setCurrentView] = useState('cockpit'); // 'cockpit' | 'planet'
  const [isLaunching, setIsLaunching] = useState(false);

  const handleSelectDestination = (planet) => {
    setSelectedPlanet(planet);
    setCurrentView('planet');
  };

  const handleGenericLaunch = () => {
    // Blast off to next celestial body
    const nextPlanet = selectedPlanet 
      ? celestialData[(celestialData.findIndex(p => p.id === selectedPlanet.id) + 1) % celestialData.length]
      : celestialData[1]; // default to Moon
    handleSelectDestination(nextPlanet);
  };

  const handleReturnToCockpit = () => {
    setCurrentView('cockpit');
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-space-dark text-white select-none">
      
      {/* Top Universal Mission Control Bar */}
      <header className="relative z-30 w-full px-4 py-2.5 bg-slate-900/90 border-b border-slate-700/80 backdrop-blur-md flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
            <span className="text-xl">👩‍🚀</span>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300">
              Olivia in Outer Space
            </h1>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Anna & Olivia Astro-Lab
            </div>
          </div>
        </div>

        {/* Audio Controller */}
        <AudioPlayer />
      </header>

      {/* Main View Area */}
      <main className="relative flex-1 w-full h-[calc(100%-57px)] overflow-hidden">
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

        {/* Active Screen */}
        {currentView === 'cockpit' ? (
          <Cockpit
            celestialBodies={celestialData}
            onSelectDestination={handleSelectDestination}
            onLaunchSequence={handleGenericLaunch}
          />
        ) : (
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
