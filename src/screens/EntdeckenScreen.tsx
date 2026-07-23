import { useState, useEffect } from 'react';
import { Star, Navigation, Clock, Gem } from 'lucide-react';

interface NearbyPlace {
  name: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  photos?: { photo_reference: string }[];
  opening_hours?: { open_now: boolean };
  place_id: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string;
const PROXY = 'https://api.allorigins.win/raw?url=';

const haversine = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number => {
  const R = 6371000;
  const dLat = (to.lat - from.lat) * (Math.PI / 180);
  const dLon = (to.lng - from.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from.lat * (Math.PI / 180)) *
      Math.cos(to.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const typeMap: Record<string, string> = {
  essen: 'restaurant',
  cafe: 'cafe',
  bar: 'bar',
  aktivität: 'tourist_attraction',
  museum: 'museum',
};

const getTimeSuggestion = (): { text: string; type: string } => {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return { text: 'Gutes Frühstück gefällig?', type: 'cafe' };
  if (h >= 11 && h < 15) return { text: 'Zeit fürs Mittagessen!', type: 'essen' };
  if (h >= 15 && h < 18) return { text: 'Kaffee & Kuchen?', type: 'cafe' };
  if (h >= 18 && h < 22) return { text: 'Abendessen in der Nähe?', type: 'essen' };
  return { text: 'Bar oder Club?', type: 'bar' };
};

export function EntdeckenScreen() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const timeSuggestion = getTimeSuggestion();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('GPS nicht verfügbar. Bitte Standortzugriff erlauben.')
    );
  }, []);

  const searchNearby = async (type: string, hiddenGems = false) => {
    if (!userLocation) return;
    setLoading(true);
    setSelectedType(type);
    setPlaces([]);
    setShowHidden(hiddenGems);

    const placeType = typeMap[type] ?? 'restaurant';
    const radius = hiddenGems ? 2000 : 1500;

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.lat},${userLocation.lng}&radius=${radius}&type=${placeType}&key=${API_KEY}&language=de&rankby=prominence`;
      const res = await fetch(PROXY + encodeURIComponent(url));
      const data = await res.json();
      const results: NearbyPlace[] = data.results ?? [];

      const filtered = hiddenGems
        ? results
            .filter((p) => p.rating >= 4.5 && p.user_ratings_total < 500 && p.user_ratings_total > 20)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4)
        : results
            .filter((p) => p.rating >= 4.0 && p.user_ratings_total >= 50)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

      setPlaces(filtered);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleHiddenGems = (checked: boolean) => {
    setShowHidden(checked);
    if (checked && selectedType) searchNearby(selectedType, true);
    else if (!checked && selectedType) searchNearby(selectedType, false);
  };

  const typeButtons = [
    { key: 'essen', label: 'Essen' },
    { key: 'cafe', label: 'Café' },
    { key: 'bar', label: 'Bar' },
    { key: 'aktivität', label: 'Sehenswürdigkeiten' },
    { key: 'museum', label: 'Museum' },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      {/* Header — location style like home */}
      <div className="px-5 pt-14 pb-5" style={{ background: '#ffffff', borderBottom: '1px solid #e0eeec' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: '11px', color: '#6b8a85', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
              Dein Standort
            </p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e2b' }}>
              {userLocation ? 'GPS aktiv ✓' : locationError ? 'Kein GPS' : 'Suche…'}
            </p>
          </div>
          <div className="avatar"><span>IL</span></div>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1a2e2b', letterSpacing: '-0.3px', margin: 0 }}>
          Was möchtest du?
        </h1>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {locationError && (
          <div className="p-4 rounded-2xl" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p style={{ fontSize: '14px', color: '#f472b6' }}>{locationError}</p>
          </div>
        )}

        {/* Time-based suggestion button */}
        <button
          onClick={() => searchNearby(timeSuggestion.type)}
          disabled={!userLocation}
          className="w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: '#2d8b7a', cursor: userLocation ? 'pointer' : 'default' }}
        >
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>
              <Clock size={11} strokeWidth={1.5} style={{ display: 'inline', marginRight: '4px' }} />
              Jetzt · {new Date().getHours()}:00 Uhr
            </p>
            <p style={{ fontSize: '17px', fontWeight: 500, color: '#ffffff' }}>{timeSuggestion.text}</p>
          </div>
          <Navigation size={22} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </button>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {typeButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => searchNearby(key, showHidden)}
              disabled={!userLocation}
              className="px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: selectedType === key ? '#2d8b7a' : '#f0f5f4',
                color: selectedType === key ? '#ffffff' : '#6b8a85',
                border: `1.5px solid ${selectedType === key ? '#2d8b7a' : '#e0eeec'}`,
                fontSize: '13px',
                fontWeight: selectedType === key ? 500 : 400,
                cursor: userLocation ? 'pointer' : 'default',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Hidden gems toggle */}
        <label
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
          style={{ background: '#fff8e7', border: '1px solid #fde68a' }}
        >
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => handleHiddenGems(e.target.checked)}
            disabled={!userLocation}
            style={{ accentColor: '#2d8b7a', width: '16px', height: '16px' }}
          />
          <Gem size={15} strokeWidth={1.5} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#92400e' }}>Versteckte Perlen</p>
            <p style={{ fontSize: '11px', color: '#b45309' }}>Hoch bewertet, aber wenig bekannt</p>
          </div>
        </label>

        {/* Loading */}
        {loading && (
          <div className="card p-6 flex items-center justify-center gap-3">
            <div className="skeleton w-5 h-5 rounded-full" />
            <p style={{ fontSize: '14px', color: '#9bb5b0' }}>Suche in deiner Nähe…</p>
          </div>
        )}

        {/* Results */}
        {!loading && places.length > 0 && (
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#1a2e2b', paddingTop: '4px' }}>
            In deiner Nähe
          </p>
        )}
        {!loading && places.map((place, i) => {
          const dist = userLocation ? haversine(userLocation, place.geometry.location) : null;
          const photoUrl = place.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`
            : null;

          return (
            <div key={i} className="card overflow-hidden flex" style={{ minHeight: '100px' }}>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={place.name}
                  className="object-cover flex-shrink-0"
                  style={{ width: '100px', height: '100px' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a2e2b', lineHeight: 1.3 }}>{place.name}</h3>
                    {place.opening_hours?.open_now !== undefined && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          flexShrink: 0,
                          color: place.opening_hours.open_now ? '#22c55e' : '#ef4444',
                          background: place.opening_hours.open_now ? '#dcfce7' : '#fee2e2',
                          borderRadius: '20px',
                          padding: '2px 7px',
                        }}
                      >
                        {place.opening_hours.open_now ? 'Geöffnet' : 'Geschlossen'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} strokeWidth={0} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a2e2b' }}>{place.rating}</span>
                    <span style={{ fontSize: '11px', color: '#9bb5b0' }}>({place.user_ratings_total})</span>
                    {dist !== null && (
                      <span style={{ fontSize: '11px', color: '#2d8b7a', fontWeight: 500 }}>
                        · {dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(1)} km`}
                      </span>
                  )}
                </div>
                  <p style={{ fontSize: '11px', color: '#9bb5b0', marginTop: '2px' }}>{place.vicinity}</p>
                </div>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}`
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all active:scale-95 self-start"
                  style={{
                    background: '#e8f5f3',
                    color: '#2d8b7a',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '6px',
                  }}
                >
                  <Navigation size={11} strokeWidth={1.5} />
                  Navigation
                </button>
              </div>
            </div>
          );
        })}

        {!loading && selectedType && places.length === 0 && (
          <div className="card p-6 text-center">
            <p style={{ fontSize: '14px', color: '#9bb5b0' }}>
              {showHidden
                ? 'Keine versteckten Perlen gefunden. Versuche einen anderen Typ.'
                : 'Keine Ergebnisse in deiner Nähe.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
