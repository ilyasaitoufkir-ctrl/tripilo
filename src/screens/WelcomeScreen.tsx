import { Sparkles, MapPin, Star, Plane } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const features = [
  { icon: Sparkles, label: 'KI-gestützt', color: '#5b4fff' },
  { icon: MapPin,   label: 'Personalisiert', color: '#ff6584' },
  { icon: Star,     label: 'Geheimtipps', color: '#f59e0b' },
];

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-8"
      style={{ background: 'linear-gradient(160deg, #ede9ff 0%, #f8f9ff 45%, #fff0f3 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-30 blur-3xl"
             style={{ background: '#8b5cf6' }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-20 blur-3xl"
             style={{ background: '#ff6584' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8 inline-block animate-float">
          <div
            className="w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse-ring"
            style={{
              background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)',
              boxShadow: '0 16px 48px rgba(91,79,255,0.35)',
            }}
          >
            <Plane size={56} className="text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-7xl font-black mb-2 tracking-tight" style={{ color: '#1a1a2e' }}>
          Tri<span className="gradient-text">pilo</span>
        </h1>
        <p className="text-base font-medium mb-10" style={{ color: '#6b7280' }}>
          Dein KI-Reiseplaner
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-fade-in"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#1a1a2e', boxShadow: '0 2px 8px rgba(91,79,255,0.06)' }}
            >
              <Icon size={14} style={{ color }} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.97] animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)',
            boxShadow: '0 8px 28px rgba(91,79,255,0.4)',
            animationDelay: '0.2s',
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <Plane size={22} />
            Reise planen
          </span>
        </button>

        <p className="mt-6 text-xs" style={{ color: '#9ca3af' }}>
          Powered by Claude AI ✨
        </p>
      </div>
    </div>
  );
}
