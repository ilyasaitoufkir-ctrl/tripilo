const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY;
const PROXY = 'https://api.allorigins.win/raw?url=';

export interface PlaceInfo {
  name: string;
  address: string;
  rating: number | null;
  total_ratings: number | null;
  price_level: number | null;
  photo: string | null;
  maps_url: string;
  navigation_url: string;
  phone?: string;
  website?: string;
  opening_hours?: string[];
}

// Cache city coords so geocoding only runs once per city per session
const coordsCache: Record<string, { lat: number; lng: number }> = {};

const getCityCoords = async (city: string): Promise<{ lat: number; lng: number } | null> => {
  if (coordsCache[city]) return coordsCache[city];
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`;
    const res = await fetch(PROXY + encodeURIComponent(url));
    const data = await res.json();
    const loc = data.results?.[0]?.geometry?.location;
    if (!loc) return null;
    coordsCache[city] = { lat: loc.lat, lng: loc.lng };
    return coordsCache[city];
  } catch {
    return null;
  }
};

export const searchPlace = async (query: string, destination: string): Promise<PlaceInfo | null> => {
  try {
    // Get city coordinates for location-biased search
    const coords = await getCityCoords(destination);

    const params = new URLSearchParams({
      query: `${query} ${destination}`,
      key: API_KEY,
      language: 'de',
    });
    if (coords) {
      params.set('location', `${coords.lat},${coords.lng}`);
      params.set('radius', '20000');
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    const res = await fetch(PROXY + encodeURIComponent(url));
    const data = await res.json();

    const cityLower = destination.toLowerCase();

    // Prefer results whose address contains the city
    const place = data.results?.find(
      (r: { formatted_address?: string }) =>
        r.formatted_address?.toLowerCase().includes(cityLower)
    );

    // If nothing matches the city, reject
    if (!place) {
      console.log(`❌ No place in ${destination} for: ${query}`);
      return null;
    }

    console.log(`✅ Found in ${destination}: ${place.name}`);

    const mapsQuery = encodeURIComponent(`${place.name} ${destination}`);
    const info: PlaceInfo = {
      name: place.name,
      address: place.formatted_address,
      rating: place.rating ?? null,
      total_ratings: place.user_ratings_total ?? null,
      price_level: place.price_level ?? null,
      photo: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : null,
      maps_url: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      navigation_url: `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`,
    };

    // Enrich with phone / website / hours via Place Details
    if (place.place_id) {
      try {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours&key=${API_KEY}&language=de`;
        const detailRes = await fetch(PROXY + encodeURIComponent(detailUrl));
        const detailData = await detailRes.json();
        const d = detailData.result;
        if (d) {
          if (d.formatted_phone_number) info.phone = d.formatted_phone_number;
          if (d.website) info.website = d.website;
          if (d.opening_hours?.weekday_text) info.opening_hours = d.opening_hours.weekday_text;
        }
      } catch {
        // Details are optional
      }
    }

    return info;
  } catch (error) {
    console.error('Places error:', error);
    return null;
  }
};

export const priceLevelLabel = (level: number | null): string => {
  if (level === null) return '';
  return ['', '€', '€€', '€€€', '€€€€'][level] ?? '';
};
