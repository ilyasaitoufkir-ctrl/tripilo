import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  destination?: string;
}

const stepsDE = [
  { text: 'Reiseziel analysieren', pct: 12 },
  { text: 'Geheimtipps suchen', pct: 28 },
  { text: 'Tagesplan erstellen', pct: 46 },
  { text: 'Budget optimieren', pct: 62 },
  { text: 'Hotel auswählen', pct: 75 },
  { text: 'Lokale Empfehlungen', pct: 88 },
  { text: 'Plan wird fertiggestellt', pct: 96 },
];
const stepsEN = [
  { text: 'Analyzing destination', pct: 12 },
  { text: 'Finding hidden gems', pct: 28 },
  { text: 'Creating daily plan', pct: 46 },
  { text: 'Optimizing budget', pct: 62 },
  { text: 'Selecting hotel', pct: 75 },
  { text: 'Local recommendations', pct: 88 },
  { text: 'Finalizing your plan', pct: 96 },
];

const TRAVEL_ICONS = ['✈️', '🌍', '🗺️', '🧳', '🏨', '🍽️', '📸', '🎯'];
const RING_SIZE = 148;
const RING_RADIUS = 64;

export function LoadingScreen({ destination }: Props) {
  const { lang, t } = useLanguage();
  const steps = lang === 'en' ? stepsEN : stepsDE;
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(steps[0].pct);
  const [iconIdx, setIconIdx] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIdx((i) => {
        const next = Math.min(i + 1, steps.length - 1);
        setProgress(steps[next].pct);
        return next;
      });
    }, 1800);
    const iconTimer = setInterval(() => {
      setIconIdx((i) => (i + 1) % TRAVEL_ICONS.length);
    }, 600);
    return () => {
      clearInterval(stepTimer);
      clearInterval(iconTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#f0f7f6' }}>
      <style>{`
        @keyframes tripsilo-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="w-full max-w-xs text-center">
        <p className="mb-2" style={{ fontSize: '11px', fontWeight: 700, color: '#2d8b7a', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          Tripsilo
        </p>

        {destination && (
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a2e2b', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            {destination}
          </h2>
        )}

        <p className="mb-8" style={{ fontSize: destination ? '15px' : '22px', fontWeight: destination ? 400 : 700, color: destination ? '#6b8a85' : '#1a2e2b' }}>
          {t.loading}
        </p>

        {/* Progress ring with orbiting plane + cycling center icon */}
        <div className="relative mx-auto mb-8" style={{ width: `${RING_SIZE}px`, height: `${RING_SIZE}px` }}>
          <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} style={{ width: `${RING_SIZE}px`, height: `${RING_SIZE}px`, transform: 'rotate(-90deg)' }}>
            <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke="#e0eeec" strokeWidth="4" />
            <circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none"
              stroke="#2d8b7a" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * RING_RADIUS}`}
              strokeDashoffset={`${2 * Math.PI * RING_RADIUS * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
            />
          </svg>

          {/* Orbiting plane */}
          <div
            className="absolute"
            style={{
              top: '50%', left: '50%',
              width: `${RING_SIZE}px`, height: `${RING_SIZE}px`,
              marginTop: `${-RING_SIZE / 2}px`, marginLeft: `${-RING_SIZE / 2}px`,
              animation: 'tripsilo-orbit 3.2s linear infinite',
            }}
          >
            <div style={{ position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%) rotate(90deg)', fontSize: '18px' }}>
              ✈️
            </div>
          </div>

          {/* Cycling center icon */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: '32px', transition: 'opacity 0.2s ease' }}
          >
            {TRAVEL_ICONS[iconIdx]}
          </div>
        </div>

        <p className="mb-1 transition-all duration-500" style={{ fontSize: '15px', fontWeight: 500, color: '#1a2e2b' }}>
          {steps[stepIdx].text}
        </p>
        <p style={{ fontSize: '13px', color: '#9bb5b0', marginBottom: '32px' }}>
          {lang === 'en' ? 'Just a moment' : 'Bitte einen Moment Geduld'}
        </p>

        <div className="w-full" style={{ maxWidth: '280px', height: '4px', background: '#e0eeec', borderRadius: '2px', overflow: 'hidden', margin: '0 auto' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #2d8b7a, #3aa896)',
              borderRadius: '2px',
              transition: 'width 0.7s ease-out',
            }}
          />
        </div>
        <p style={{ fontSize: '13px', color: '#9bb5b0', marginTop: '8px' }}>{progress}%</p>

        <div className="flex justify-center gap-1.5 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === stepIdx ? '20px' : '6px',
                height: '6px',
                background: i <= stepIdx ? '#2d8b7a' : '#e0eeec',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
