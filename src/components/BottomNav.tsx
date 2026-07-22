import { Plane, Bookmark, Star } from 'lucide-react';
import type { Screen } from '../types';

interface Props {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  savedCount: number;
  ratingsCount: number;
}

const tabs = [
  { id: 'input' as Screen, label: 'Planen',     icon: Plane,    activeOn: ['input', 'plan', 'loading'] as Screen[] },
  { id: 'saved' as Screen, label: 'Gespeichert', icon: Bookmark, activeOn: ['saved'] as Screen[] },
  { id: 'rating' as Screen, label: 'Bewertungen', icon: Star,    activeOn: ['rating'] as Screen[] },
] as const;

export function BottomNav({ screen, onNavigate, savedCount, ratingsCount }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e8e8ed',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
        {tabs.map(({ id, label, icon: Icon, activeOn }) => {
          const isActive = activeOn.includes(screen);
          const badge = id === 'saved' ? savedCount : id === 'rating' ? ratingsCount : 0;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all"
              style={{
                background: isActive ? '#f0eeff' : 'transparent',
                color: isActive ? '#8b7cf8' : '#aeaeb2',
              }}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white"
                    style={{ background: '#8b7cf8', fontSize: '9px', fontWeight: 500 }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', fontWeight: isActive ? 500 : 400 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
