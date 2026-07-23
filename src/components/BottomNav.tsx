import { Plane, MapPin, Camera, HelpCircle, Mic } from 'lucide-react';
import type { Screen } from '../types';

interface Props {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  savedCount: number;
  ratingsCount: number;
}

const tabs = [
  { id: 'input'      as Screen, label: 'Planen',     icon: Plane,       activeOn: ['input', 'plan', 'loading', 'packing', 'saved', 'rating'] as Screen[] },
  { id: 'entdecken'  as Screen, label: 'Entdecken',  icon: MapPin,      activeOn: ['entdecken'] as Screen[] },
  { id: 'translator' as Screen, label: 'Übersetzer', icon: Camera,      activeOn: ['translator'] as Screen[] },
  { id: 'quiz'       as Screen, label: 'Quiz',       icon: HelpCircle,  activeOn: ['quiz'] as Screen[] },
  { id: 'guide'      as Screen, label: 'Guide',      icon: Mic,         activeOn: ['guide'] as Screen[] },
] as const;

export function BottomNav({ screen, onNavigate }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e0eeec',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-1 py-2">
        {tabs.map(({ id, label, icon: Icon, activeOn }) => {
          const isActive = (activeOn as readonly Screen[]).includes(screen);
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
