import React, { useState, Suspense, lazy } from 'react';
import celestialData from './data/celestialData.json';
import Launchpad from './components/Launchpad';
import AudioPlayer, { AudioProvider, useSpaceAudio } from './components/AudioPlayer';
import { Rocket, Radio, ArrowLeft, RotateCcw } from 'lucide-react';

const Cockpit = lazy(() => import('./components/Cockpit'));
const PlanetView = lazy(() => import('./components/PlanetView'));

/**
 * Top-level error boundary that catches runtime crashes and offers a full remount recovery.
 */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, resetCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-space-dark text-white p-6 text-center select-none">
          <div className="text-6xl mb-4">🛸</div>
          <h1 className="text-2xl font-black text-yellow-300 mb-2">Oops! Cosmic Hiccup!</h1>
          <p className="text-sm text-cyan-200 font-bold mb-6 max-w-sm">
            Captain Olivia and Navigator Anna need to restart the Adventure Rocket!
          </p>
          <button
            type="button"
            onClick={() =>
              this.setState((prev) => ({ hasError: false, resetCount: prev.resetCount + 1 }))
            }
            className="cockpit-btn px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black rounded-2xl border-2 border-yellow-200 flex items-center gap-2 shadow-xl"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Restart Rocket</span>
          </button>
        </div>
      );
    }
    return <React.Fragment key={this.state.resetCount}>{this.props.children}</React.Fragment>;
  }
}

/**
 * Main application shell managing view routing between Launchpad, Cockpit, and PlanetView.
 */
function SpaceApp() {
  const { triggerSynth, speak } = useSpaceAudio();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [currentView, setCurrentView] = useState('launchpad'); // 'launchpad' | 'cockpit' | 'planet'
  const [usePhotoFace, setUsePhotoFace] = useState(false); // Default to cartoon faces

  const handleBlastOffFromEarth = () => {
    setCurrentView('cockpit');
  };

  const handleSelectDestination = (planet) => {
    setSelectedPlanet(planet);
    setCurrentView('planet');
  };

  const handleReturnToCockpit = () => {
    triggerSynth('beep');
    speak('Back to the cockpit with Captain Olivia and Navigator Anna!');
    setCurrentView('cockpit');
  };

  const handleReturnToEarth = () => {
    triggerSynth('beep');
    speak('Returning to the Launchpad!');
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
              <span>ASTRO-LAB •</span>
              <span className="text-cyan-300 font-extrabold">
                {currentView === 'launchpad' && 'EARTH SPACEPORT'}
                {currentView === 'cockpit' && 'FLIGHT DECK'}
                {currentView === 'planet' && (selectedPlanet?.name || 'DESTINATION')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Unified Controls (Photos, Radio, Launchpad, Audio) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentView === 'cockpit' && (
            <>
              {/* Personalized Real Photo vs Cartoon Pilot Face Toggle (Action if pressed) */}
              <button
                type="button"
                onClick={() => {
                  triggerSynth('twinkle');
                  const next = !usePhotoFace;
                  setUsePhotoFace(next);
                  speak(next ? "Olivia and Anna's photo faces!" : 'Cartoon faces!');
                }}
                style={{ touchAction: 'manipulation' }}
                aria-label={usePhotoFace ? 'Switch to Cartoon faces' : 'Switch to Photo faces'}
                title={usePhotoFace ? 'Switch to Cartoon faces' : 'Switch to Photo faces'}
                className="cockpit-btn min-h-[40px] px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-400/50 rounded-xl flex items-center gap-1 text-[11px] font-black shadow-md"
              >
                <span>{usePhotoFace ? '🎨 Cartoon' : '📸 Photos'}</span>
              </button>

              {/* Crew Radio Check */}
              <button
                type="button"
                onClick={handleRadioCheck}
                style={{ touchAction: 'manipulation' }}
                aria-label="Radio check with Astro-Lab Mission Control"
                title="Radio check with Astro-Lab Mission Control"
                className="cockpit-btn min-h-[40px] min-w-[40px] px-2.5 sm:px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-cyan-200 border border-indigo-400/50 rounded-xl flex items-center justify-center gap-1 text-[11px] font-black shadow-md"
              >
                <Radio className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span className="hidden md:inline">Radio</span>
              </button>
            </>
          )}

          {/* Destination View: Return to Cockpit Shortcut */}
          {currentView === 'planet' && (
            <button
              type="button"
              onClick={handleReturnToCockpit}
              style={{ touchAction: 'manipulation' }}
              className="cockpit-btn min-h-[40px] px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-black rounded-xl border border-cyan-400/50 flex items-center gap-1 shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-300" />
              <span>Cockpit</span>
            </button>
          )}

          {/* Return to Launchpad */}
          {currentView !== 'launchpad' && (
            <button
              type="button"
              onClick={handleReturnToEarth}
              style={{ touchAction: 'manipulation' }}
              aria-label="Return to Launchpad"
              title="Return to Launchpad"
              className="cockpit-btn min-h-[40px] px-2.5 sm:px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-black rounded-xl border border-emerald-400/50 flex items-center gap-1.5 shadow-md"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-300" />
              <span>Launchpad</span>
            </button>
          )}

          {/* Master Audio Controller */}
          <AudioPlayer />
        </div>
      </header>

      {/* Main View Area (Fills remaining height) */}
      <main className="relative flex-1 w-full min-h-0 overflow-hidden">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-space-dark text-cyan-300 font-black text-lg">
              Preparing Rocket Deck... 🚀
            </div>
          }
        >
          {/* View Routing */}
          {currentView === 'launchpad' && (
            <Launchpad
              onBlastOff={handleBlastOffFromEarth}
              usePhotoFace={usePhotoFace}
              onTogglePhotoFace={() => setUsePhotoFace((prev) => !prev)}
            />
          )}

          {currentView === 'cockpit' && (
            <Cockpit
              celestialBodies={celestialData}
              onSelectDestination={handleSelectDestination}
              usePhotoFace={usePhotoFace}
            />
          )}

          {currentView === 'planet' && (
            <PlanetView
              planet={selectedPlanet || celestialData[0]}
              onReturnToCockpit={handleReturnToCockpit}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AudioProvider>
        <SpaceApp />
      </AudioProvider>
    </AppErrorBoundary>
  );
}
