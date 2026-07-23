const DESTINATION_IMAGES: Record<string, string> = {
  'paris':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
  'barcelona':      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
  'tokyo':          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
  'bali':           'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
  'hamburg':        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80',
  'berlin':         'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&q=80',
  'münchen':        'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200&q=80',
  'munich':         'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200&q=80',
  'rom':            'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
  'rome':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
  'london':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
  'new york':       'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80',
  'new york city':  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80',
  'amsterdam':      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80',
  'dubai':          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  'bangkok':        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
  'santorini':      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
  'wien':           'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80',
  'vienna':         'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80',
  'prag':           'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80',
  'prague':         'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80',
  'lissabon':       'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',
  'lisbon':         'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',
  'singapore':      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
  'singapur':       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
  'island':         'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=1200&q=80',
  'iceland':        'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=1200&q=80',
  'marokko':        'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=1200&q=80',
  'morocco':        'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=1200&q=80',
  'istanbul':       'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
  'miami':          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  'phuket':         'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80',
  'venedig':        'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80',
  'venice':         'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80',
  'kapstadt':       'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80',
  'cape town':      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80',
  'default':        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
};

const CATEGORY_IMAGES: Record<string, string> = {
  'strand':     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'beach':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'museum':     'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80',
  'restaurant': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'hotel':      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'natur':      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'wald':       'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'berg':       'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'hike':       'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'wandern':    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'stadt':      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
  'markt':      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
  'sport':      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  'essen':      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'food':       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'abend':      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'bar':        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
  'kirche':     'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&q=80',
  'kunst':      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80',
  'park':       'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80',
  'see':        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'lake':       'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'boot':       'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'shop':       'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  'spa':        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'ski':        'https://images.unsplash.com/photo-1517549082850-01e6b5ae28e1?w=800&q=80',
  'tauchen':    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  'dive':       'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  'default':    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
};

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY as string;

export const getFallbackImage = (type: string): string => getCategoryImage(type);

export const getCategoryImage = (text: string): string => {
  const lower = text.toLowerCase();
  const match = Object.keys(CATEGORY_IMAGES).find(k => k !== 'default' && lower.includes(k));
  return match ? CATEGORY_IMAGES[match] : CATEGORY_IMAGES['default'];
};

export const getDestinationImage = (destination: string): string => {
  const key = destination.toLowerCase();
  return DESTINATION_IMAGES[key] ?? DESTINATION_IMAGES['default'];
};

export const getActivityImage = (activity: string, _destination: string): string => {
  return getCategoryImage(activity);
};

export const getRestaurantImage = (_name: string, _destination: string): string => {
  return CATEGORY_IMAGES['restaurant'];
};

export const getHotelImage = (_destination: string): string => {
  return CATEGORY_IMAGES['hotel'];
};

// Async versions — use Unsplash API when key is set, fall back to static
export const getDestinationImageAsync = async (destination: string): Promise<string> => {
  if (UNSPLASH_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(destination + ' city travel')}&orientation=landscape&client_id=${UNSPLASH_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.urls?.regular) return data.urls.regular;
      }
    } catch { /* fall through */ }
  }
  return getDestinationImage(destination);
};

export const getActivityImageAsync = async (activity: string, destination: string): Promise<string> => {
  if (UNSPLASH_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(activity + ' ' + destination)}&orientation=landscape&client_id=${UNSPLASH_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.urls?.regular) return data.urls.regular;
      }
    } catch { /* fall through */ }
  }
  return getCategoryImage(activity);
};
