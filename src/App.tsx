import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { InputScreen } from './screens/InputScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { PlanScreen } from './screens/PlanScreen';
import { SavedTripsScreen } from './screens/SavedTripsScreen';
import { generateTripPlan } from './api';
import type { Screen, TripInput, TripPlan, SavedTrip } from './types';

const STORAGE_KEY = 'tripilo_saved_trips';

function loadSavedTrips(): SavedTrip[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentInput, setCurrentInput] = useState<TripInput | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(loadSavedTrips);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrips));
  }, [savedTrips]);

  const handleStart = async (input: TripInput) => {
    setCurrentInput(input);
    setCurrentPlan(null);
    setIsCurrentSaved(false);
    setError(null);
    setScreen('loading');

    try {
      const plan = await generateTripPlan(input);
      setCurrentPlan(plan);
      setScreen('plan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setScreen('input');
    }
  };

  const handleSave = () => {
    if (!currentPlan || !currentInput || isCurrentSaved) return;
    const trip: SavedTrip = {
      id: Date.now().toString(),
      input: currentInput,
      plan: currentPlan,
      savedAt: new Date().toISOString(),
    };
    setSavedTrips((prev) => [trip, ...prev]);
    setIsCurrentSaved(true);
  };

  const handleDeleteTrip = (id: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectSavedTrip = (trip: SavedTrip) => {
    setCurrentInput(trip.input);
    setCurrentPlan(trip.plan);
    setIsCurrentSaved(true);
    setScreen('plan');
  };

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh' }}>
      {/* Saved trips button (visible on welcome + input) */}
      {(screen === 'welcome' || screen === 'input') && savedTrips.length > 0 && (
        <button
          onClick={() => setScreen('saved')}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full glass-card text-sm transition-all hover:scale-105"
          style={{ color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)' }}
        >
          <Bookmark size={14} fill="#ffd700" />
          {savedTrips.length}
        </button>
      )}

      {/* Error toast */}
      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm max-w-sm text-center animate-fade-in"
          style={{ background: 'rgba(255,101,132,0.15)', border: '1px solid rgba(255,101,132,0.3)', color: '#ff6584' }}
        >
          {error}
          <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {screen === 'welcome' && (
        <WelcomeScreen onStart={() => setScreen('input')} />
      )}

      {screen === 'input' && (
        <InputScreen
          onSubmit={handleStart}
          onBack={() => setScreen('welcome')}
        />
      )}

      {screen === 'loading' && <LoadingScreen />}

      {screen === 'plan' && currentPlan && currentInput && (
        <PlanScreen
          plan={currentPlan}
          input={currentInput}
          onSave={handleSave}
          onNew={() => setScreen('input')}
          isSaved={isCurrentSaved}
        />
      )}

      {screen === 'saved' && (
        <SavedTripsScreen
          savedTrips={savedTrips}
          onSelect={handleSelectSavedTrip}
          onDelete={handleDeleteTrip}
          onBack={() => setScreen('welcome')}
        />
      )}
    </div>
  );
}
