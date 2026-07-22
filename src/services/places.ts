const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY;

export interface PlaceInfo {
  name: string;
  address: string;
  rating: number | null;
  total_ratings: number | null;
  price_level: number | null;
  photo: string | null;
  maps_url: string;
}

export const searchPlace = async (query: string): Promise<PlaceInfo | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=de`;
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxy);
    const data = await response.json();
    const place = data.results?.[0];

    if (!place) return null;

    return {
      name: place.name,
      address: place.formatted_address,
      rating: place.rating ?? null,
      total_ratings: place.user_ratings_total ?? null,
      price_level: place.price_level ?? null,
      photo: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : null,
      maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    };
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
