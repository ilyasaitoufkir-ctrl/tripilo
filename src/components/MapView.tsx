import { ExternalLink, Map } from 'lucide-react';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY;

interface Props {
  destination: string;
  /** Day activities for route button */
  activities?: string[];
}

export function openDayRoute(activities: string[], destination: string) {
  const places = activities.map((a) => `${a}, ${destination}`);
  const path = places.map(encodeURIComponent).join('/');
  window.open(`https://www.google.com/maps/dir/${path}`, '_blank');
}

export function MapView({ destination, activities }: Props) {
  const src = `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_KEY}&q=${encodeURIComponent(destination)}&zoom=12&language=de`;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <iframe
        title={`Karte: ${destination}`}
        width="100%"
        height="320"
        style={{ display: 'block', border: 'none' }}
        src={src}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {activities && activities.length > 0 && (
        <div className="p-3 flex items-center justify-between" style={{ background: '#f8f9ff', borderTop: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
            <Map size={14} style={{ color: '#5b4fff' }} />
            {activities.length} Aktivitäten heute
          </div>
          <button
            onClick={() => openDayRoute(activities, destination)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)', color: '#fff' }}
          >
            <ExternalLink size={12} />
            Route öffnen
          </button>
        </div>
      )}
    </div>
  );
}
