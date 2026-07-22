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

export const searchPlace = async (query: string): Promise<PlaceInfo | null> => {
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=de`;
    const res = await fetch(PROXY + encodeURIComponent(searchUrl));
    const data = await res.json();
    const place = data.results?.[0];
    if (!place) return null;

    const mapsQuery = encodeURIComponent(query);
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
        // Details are optional — ignore errors
      }
    }

    return info;
  } catch (error) {
    console.error('Places error:', error);
    return null;
  }
};

export const getDestinationImage = (destination: string): string => {
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)},travel`;
};

export const priceLevelLabel = (level: number | null): string => {
  if (level === null) return '';
  return ['', '€', '€€', '€€€', '€€€€'][level] ?? '';
};
