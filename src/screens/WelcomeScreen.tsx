import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onStart: () => void;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=90',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=90',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=90',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=90',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=90',
];

const SLIDE_MS = 4500;
const FADE_MS = 600;

export function WelcomeScreen({ onStart }: Props) {
  const { lang, setLang, t } = useLanguage();
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
        setVisible(true);
      }, FADE_MS);
    }, SLIDE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" style={{ minHeight: '100%', height: '100vh', overflow: 'hidden', touchAction: 'none', background: '#0a1628' }}>
      {/* Full-bleed hero slideshow */}
      <div style={{ position: 'absolute', inset: 0, opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}>
        <img src={HERO_IMAGES[current]} alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(10,20,18,0.15) 0%, rgba(10,20,18,0.10) 30%, rgba(10,20,18,0.55) 62%, rgba(8,16,14,0.94) 100%)' }}
      />

      {/* Slide indicator dots */}
      <div
        className="absolute left-1/2 flex"
        style={{ top: 'calc(env(safe-area-inset-top) + 18px)', transform: 'translateX(-50%)', gap: '6px', zIndex: 10 }}
      >
        {HERO_IMAGES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? '#ffffff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div
        className="absolute left-6 right-6 flex items-center justify-between"
        style={{ top: 'calc(env(safe-area-inset-top) + 40px)' }}
      >
        <div className="flex items-center" style={{ gap: '8px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '30px', height: '30px', background: '#2d8b7a', borderRadius: '9px', fontSize: '15px' }}
          >
            ✈️
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.90)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Tripsilo
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {(['de', 'en'] as const).map((l, i) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '0 2px' }}>|</span>}
              <button
                onClick={() => setLang(l)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                  fontSize: '13px', fontWeight: lang === l ? 700 : 400,
                  color: lang === l ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
              >
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom content, anchored over the darkened base of the image */}
      <div
        className="absolute left-0 right-0 bottom-0 px-7"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}
      >
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>
          {t.welcomeTagline}
        </p>
        <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#ffffff', lineHeight: 1.08, letterSpacing: '-0.7px', margin: '0 0 14px' }}>
          {t.welcomeHero}
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.70)', marginBottom: '32px', lineHeight: 1.5, fontWeight: 300 }}>
          {t.welcomeSubtitle}
        </p>
        <button
          onClick={onStart}
          className="transition-all active:scale-[0.98]"
          style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #2d8b7a, #3aa896)',
            color: '#ffffff',
            borderRadius: '16px',
            fontSize: '17px',
            fontWeight: 700,
            letterSpacing: '-0.2px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(45,139,122,0.45)',
          }}
        >
          {t.planTrip}
        </button>
      </div>
    </div>
  );
}
