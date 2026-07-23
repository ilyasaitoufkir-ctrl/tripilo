import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onStart: () => void;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
];

export function WelcomeScreen({ onStart }: Props) {
  const { lang, setLang, t } = useLanguage();
  const hero = useMemo(
    () => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)],
    []
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hero */}
      <div className="relative" style={{ height: '58vh', minHeight: '340px' }}>
        <img src={hero} alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(26,107,90,0.30) 0%, rgba(45,139,122,0.50) 55%, rgba(26,46,43,0.85) 100%)' }}
        />
        {/* Top bar */}
        <div className="absolute top-14 left-6 right-6 flex items-center justify-between">
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.90)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            Tripsilo
          </span>
          {/* Lang toggle — white variant for dark bg */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {(['de', 'en'] as const).map((l, i) => (
              <>
                {i > 0 && <span key="sep" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '0 2px' }}>|</span>}
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                    fontSize: '13px', fontWeight: lang === l ? 700 : 400,
                    color: lang === l ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              </>
            ))}
          </div>
        </div>
        {/* Headline */}
        <div className="absolute bottom-10 left-6 right-6">
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', marginBottom: '5px', fontWeight: 400 }}>
            {t.welcomeTagline}
          </p>
          <h1 style={{ fontSize: '38px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.5px', margin: 0 }}>
            {t.welcomeHero}
          </h1>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="flex flex-col px-6 pt-7 pb-10" style={{ background: '#f0f7f6', flex: 1 }}>
        <div className="flex justify-center mb-5">
          <div style={{ width: '36px', height: '4px', background: '#a3d4ce', borderRadius: '2px' }} />
        </div>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#2d8b7a', textTransform: 'uppercase', marginBottom: '5px' }}>
          Tripsilo
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1a2e2b', lineHeight: 1.25, letterSpacing: '-0.3px', margin: '0 0 6px' }}>
          Discover New<br />Travel Experiences
        </h2>
        <p style={{ fontSize: '14px', color: '#6b8a85', lineHeight: 1.65, marginBottom: '28px' }}>
          {t.welcomeSubtitle}
        </p>
        <button onClick={onStart} className="btn-primary transition-all active:scale-[0.98]">
          {t.planTrip}
        </button>
      </div>
    </div>
  );
}
