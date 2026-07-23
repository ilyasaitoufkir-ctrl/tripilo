import { Plane, MapPin, Camera, HelpCircle, Mic } from 'lucide-react';
import type { Screen } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  savedCount: number;
  ratingsCount: number;
}

const tabDefs = [
  { id: 'input'      as Screen, key: 'planTrip',   icon: Plane,      activeOn: ['input', 'plan', 'loading', 'packing', 'saved', 'rating'] as Screen[] },
  { id: 'entdecken'  as Screen, key: 'discover',   icon: MapPin,     activeOn: ['entdecken'] as Screen[] },
  { id: 'translator' as Screen, key: 'translate',  icon: Camera,     activeOn: ['translator'] as Screen[] },
  { id: 'quiz'       as Screen, key: 'quiz',       icon: HelpCircle, activeOn: ['quiz'] as Screen[] },
  { id: 'guide'      as Screen, key: 'guide',      icon: Mic,        activeOn: ['guide'] as Screen[] },
] as const;

export function BottomNav({ screen, onNavigate }: Props) {
  const { t } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: '#ffffff', borderTop: '1px solid #e0eeec', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-1 py-2">
        {tabDefs.map(({ id, key, icon: Icon, activeOn }) => {
          const isActive = (activeOn as readonly Screen[]).includes(screen);
          const label = t[key as keyof typeof t] as string;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all"
              style={{
                background: isActive ? '#e8f5f3' : 'transparent',
                color: isActive ? '#2d8b7a' : '#9bb5b0',
                minWidth: '56px',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ fontSize: '9px', fontWeight: isActive ? 500 : 400 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
