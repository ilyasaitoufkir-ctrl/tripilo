import { Plane, Bookmark, Star } from 'lucide-react';
import type { Screen } from '../types';

interface Props {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  savedCount: number;
  ratingsCount: number;
}

const tabs = [
  {
    id: 'input' as Screen,
    label: 'Planen',
    icon: Plane,
    activeOn: ['input', 'plan', 'loading'] as Screen[],
  },
  {
    id: 'saved' as Screen,
    label: 'Gespeichert',
    icon: Bookmark,
    activeOn: ['saved'] as Screen[],
  },
  {
    id: 'rating' as Screen,
    label: 'Bewertungen',
    icon: Star,
    activeOn: ['rating'] as Screen[],
  },
] as const;

export function BottomNav({ screen, onNavigate, savedCount, ratingsCount }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 24px rgba(91,79,255,0.06)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-4 py-2">
        {tabs.map(({ id, label, icon: Icon, activeOn }) => {
          const isActive = activeOn.includes(screen);
          const badge = id === 'saved' ? savedCount : id === 'rating' ? ratingsCount : 0;

          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center gap-1 py-2 px-5 rounded-2xl transition-all"
              style={{
                background: isActive ? '#ede9ff' : 'transparent',
                color: isActive ? '#5b4fff' : '#9ca3af',
              }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 w-4 h-4 rounded-full text-white flex items-center justify-center"
                    style={{ background: '#5b4fff', fontSize: '9px', fontWeight: 700 }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
