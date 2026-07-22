import { useState, useEffect } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { InputScreen } from './screens/InputScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { PlanScreen } from './screens/PlanScreen';
import { SavedTripsScreen } from './screens/SavedTripsScreen';
import { RatingScreen } from './screens/RatingScreen';
import { BottomNav } from './components/BottomNav';
import { generateTripPlan } from './api';
import type { Screen, TripInput, TripPlan, SavedTrip, TripRating } from './types';

const TRIPS_KEY   = 'tripsilo_saved_trips';
const RATINGS_KEY = 'tripsilo_ratings';

const load = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};

const BOTTOM_NAV_SCREENS: Screen[] = ['input', 'plan', 'saved', 'rating'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentInput, setCurrentInput]     = useState<TripInput | null>(null);
  const [currentPlan, setCurrentPlan]       = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips]         = useState<SavedTrip[]>(() => load(TRIPS_KEY, []));
  const [ratings, setRatings]               = useState<TripRating[]>(() => load(RATINGS_KEY, []));
  const [error, setError]                   = useState<string | null>(null);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);
  const [ratingTarget, setRatingTarget]     = useState<SavedTrip | null>(null);

  // Persist trips + ratings
  useEffect(() => { localStorage.setItem(TRIPS_KEY, JSON.stringify(savedTrips)); }, [savedTrips]);
  useEffect(() => { localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings)); }, [ratings]);

  // Parse shared plan from URL hash (#share/BASE64)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share/')) {
      try {
        const encoded = hash.slice(7);
        const data = JSON.parse(decodeURIComponent(atob(encoded)));
        setCurrentPlan(data.plan);
        setCurrentInput(data.input);
        setIsCurrentSaved(false);
        setScreen('plan');
        history.replaceState(null, '', window.location.pathname);
      } catch {
        // invalid share link – ignore
      }
    }
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
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

  const handleDeleteTrip = (id: string) => setSavedTrips((prev) => prev.filter((t) => t.id !== id));

  const handleSelectSavedTrip = (trip: SavedTrip) => {
    setCurrentInput(trip.input);
    setCurrentPlan(trip.plan);
    setIsCurrentSaved(true);
    setScreen('plan');
  };

  const handleRateTrip = (trip: SavedTrip) => {
    setRatingTarget(trip);
    setScreen('rating');
  };

  const handleSubmitRating = (rating: TripRating) => {
    setRatings((prev) => [rating, ...prev]);
    setRatingTarget(null);
  };

  const handleBottomNav = (target: Screen) => {
    if (target === 'input') { setScreen('input'); return; }
    if (target === 'rating') { setRatingTarget(null); }
    setScreen(target);
  };

  const showBottomNav = BOTTOM_NAV_SCREENS.includes(screen);

  return (
    <div style={{ background: '#f8f9ff', minHeight: '100vh' }}>
      {/* Error toast */}
      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-medium max-w-sm text-center animate-fade-in"
          style={{ background: '#fff0f3', border: '1px solid #ffc9d4', color: '#ff6584', boxShadow: '0 4px 16px rgba(255,101,132,0.2)' }}
        >
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Screens */}
      {screen === 'welcome' && (
        <WelcomeScreen onStart={() => setScreen('input')} />
      )}

      {screen === 'input' && (
        <InputScreen onSubmit={handleStart} />
      )}

      {screen === 'loading' && <LoadingScreen />}

      {screen === 'plan' && currentPlan && currentInput && (
        <PlanScreen
          plan={currentPlan}
          input={currentInput}
          onSave={handleSave}
          onNew={() => setScreen('input')}
          onRate={() => {
            // Create a temporary SavedTrip for rating if not yet saved
            const trip: SavedTrip = {
              id: 'temp-' + Date.now(),
              input: currentInput,
              plan: currentPlan,
              savedAt: new Date().toISOString(),
            };
            handleRateTrip(trip);
          }}
          isSaved={isCurrentSaved}
        />
      )}

      {screen === 'saved' && (
        <SavedTripsScreen
          savedTrips={savedTrips}
          onSelect={handleSelectSavedTrip}
          onDelete={handleDeleteTrip}
          onRate={handleRateTrip}
        />
      )}

      {screen === 'rating' && (
        <RatingScreen
          target={ratingTarget}
          ratings={ratings}
          onSubmit={handleSubmitRating}
        />
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNav
          screen={screen}
          onNavigate={handleBottomNav}
          savedCount={savedTrips.length}
          ratingsCount={ratings.length}
        />
      )}
    </div>
  );
}
