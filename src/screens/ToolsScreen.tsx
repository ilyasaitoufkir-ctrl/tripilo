import { Plane, ShieldAlert, Compass, Camera, Utensils, HelpCircle, Mic, ChevronRight } from 'lucide-react';
import type { Screen } from '../types';

interface Props {
  destination: string;
  onNavigate: (screen: Screen) => void;
}

const tools = [
  { screen: 'visa' as Screen, icon: Plane, label: 'Visa & Einreise', desc: 'Einreisebestimmungen & Impfungen' },
  { screen: 'notfall' as Screen, icon: ShieldAlert, label: 'Notfall Hilfe', desc: 'Sofort-Hilfe im Ernstfall' },
  { screen: 'kultur' as Screen, icon: Compass, label: 'Kultureller Kompass', desc: 'Etikette, Trinkgeld & Tabus' },
  { screen: 'ar' as Screen, icon: Camera, label: 'Stadtführer', desc: 'Kamera auf ein Gebäude richten' },
  { screen: 'translator' as Screen, icon: Utensils, label: 'Speisekarte übersetzen', desc: 'Menü fotografieren & verstehen' },
  { screen: 'quiz' as Screen, icon: HelpCircle, label: 'Stadt Quiz', desc: 'Teste dein Wissen' },
  { screen: 'guide' as Screen, icon: Mic, label: 'Reise-Guide fragen', desc: 'Sprich mit deinem Guide' },
];

export function ToolsScreen({ destination, onNavigate }: Props) {
  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1a2e2b', letterSpacing: '-0.3px' }}>Reise Tools</h1>
        {destination && <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{destination}</p>}
      </div>

      <div className="px-4 pt-5 space-y-2.5">
        {tools.map(({ screen, icon: Icon, label, desc }) => (
          <button
            key={screen}
            onClick={() => onNavigate(screen)}
            className="card w-full flex items-center gap-3 p-4 text-left transition-all active:scale-[0.98]"
            style={{ cursor: 'pointer' }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e8f5f3' }}>
              <Icon size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a2e2b' }}>{label}</p>
              <p style={{ fontSize: '12px', color: '#9bb5b0' }}>{desc}</p>
            </div>
            <ChevronRight size={18} strokeWidth={1.5} style={{ color: '#c5d9d5', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}
