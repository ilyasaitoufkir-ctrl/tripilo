import { useState, useEffect } from 'react';
import { MapPin, Star, Navigation, Clock, Gem } from 'lucide-react';

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
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4" style={{ borderBottom: '1px solid #e8e8ed' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-end justify-between">
          <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.5px' }}>
            In deiner Nähe
          </h1>
          {userLocation && (
            <div className="flex items-center gap-1 pb-1" style={{ color: '#22c55e', fontSize: '12px' }}>
              <MapPin size={12} strokeWidth={2} />
              GPS aktiv
            </div>
          )}
        </div>
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
          style={{ background: '#8b7cf8', cursor: userLocation ? 'pointer' : 'default' }}
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
                background: selectedType === key ? '#8b7cf8' : '#f5f5f7',
                color: selectedType === key ? '#ffffff' : '#6e6e73',
                border: `1.5px solid ${selectedType === key ? '#8b7cf8' : '#e8e8ed'}`,
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
            style={{ accentColor: '#8b7cf8', width: '16px', height: '16px' }}
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
            <p style={{ fontSize: '14px', color: '#aeaeb2' }}>Suche in deiner Nähe…</p>
          </div>
        )}

        {/* Results */}
        {!loading && places.map((place, i) => {
          const dist = userLocation ? haversine(userLocation, place.geometry.location) : null;
          const photoUrl = place.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`
            : null;

          return (
            <div key={i} className="card overflow-hidden">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={place.name}
                  className="w-full object-cover"
                  style={{ height: '140px' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#1c1c1e' }}>{place.name}</h3>
                  {place.opening_hours?.open_now !== undefined && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        flexShrink: 0,
                        color: place.opening_hours.open_now ? '#22c55e' : '#f472b6',
                      }}
                    >
                      {place.opening_hours.open_now ? 'Geöffnet' : 'Geschlossen'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} strokeWidth={0} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1e' }}>{place.rating}</span>
                  <span style={{ fontSize: '12px', color: '#aeaeb2' }}>({place.user_ratings_total})</span>
                  {dist !== null && (
                    <span style={{ fontSize: '12px', color: '#aeaeb2' }}>
                      · {dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(1)} km`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#6e6e73', marginBottom: '12px' }}>{place.vicinity}</p>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
                  style={{
                    background: '#f0eeff',
                    color: '#8b7cf8',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Navigation size={13} strokeWidth={1.5} />
                  Navigation starten
                </button>
              </div>
            </div>
          );
        })}

        {!loading && selectedType && places.length === 0 && (
          <div className="card p-6 text-center">
            <p style={{ fontSize: '14px', color: '#aeaeb2' }}>
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
