import { Plane, Cpu, MapPin, Star } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const features = [
  { icon: Cpu,   label: 'KI-gestützt' },
  { icon: MapPin, label: 'Personalisiert' },
  { icon: Star,  label: 'Geheimtipps' },
];

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: '#fafafa' }}
    >
      <div className="w-full max-w-xs text-center">
        {/* Icon */}
        <div className="mb-10 animate-float inline-flex">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#f0eeff' }}
          >
            <Plane size={28} style={{ color: '#8b7cf8' }} strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand */}
        <h1
          className="mb-2 tracking-tight"
          style={{ fontSize: '48px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px', lineHeight: 1.1 }}
        >
          Tripsilo
        </h1>
        <p className="mb-10" style={{ fontSize: '15px', color: '#6e6e73', fontWeight: 400 }}>
          Dein KI-Reiseplaner
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: '#ffffff',
                border: '1px solid #e8e8ed',
                color: '#6e6e73',
                fontSize: '13px',
                fontWeight: 400,
              }}
            >
              <Icon size={13} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full transition-all active:scale-[0.98]"
          style={{
            background: '#8b7cf8',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '15px',
            fontSize: '15px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.1px',
          }}
        >
          Reise planen
        </button>

        <p className="mt-6" style={{ fontSize: '12px', color: '#aeaeb2' }}>
          Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
