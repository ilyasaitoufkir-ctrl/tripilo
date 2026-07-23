import { Plane, MapPin, Star } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  onStart: () => void;
}

const features = [
  { icon: MapPin, label: 'Personalisiert' },
  { icon: Star,   label: 'Geheimtipps' },
  { icon: Plane,  label: 'Tagesplanung' },
];

const BG_DESTINATIONS = ['paris', 'tokyo', 'bali', 'barcelona', 'new-york', 'santorini', 'dubai', 'rome'];

export function WelcomeScreen({ onStart }: Props) {
  const bgImage = useMemo(() => {
    const dest = BG_DESTINATIONS[Math.floor(Math.random() * BG_DESTINATIONS.length)];
    return `https://source.unsplash.com/1600x900/?${dest},travel,cityscape`;
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.92) 60%, rgba(255,255,255,0.97) 100%)' }}
      />

      <div className="w-full max-w-xs text-center relative z-10">
        {/* Icon */}
        <div className="mb-10 animate-float inline-flex">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#f0eeff', boxShadow: '0 4px 20px rgba(139,124,248,0.25)' }}
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
          Dein persönlicher Reiseplaner
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
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
            boxShadow: '0 4px 16px rgba(139,124,248,0.35)',
          }}
        >
          Reise planen
        </button>

        <p className="mt-6" style={{ fontSize: '12px', color: '#aeaeb2' }}>
          Tripsilo — Entdecke die Welt
        </p>
      </div>
    </div>
  );
}
