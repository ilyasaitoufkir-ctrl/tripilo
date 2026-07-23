import { useEffect, useState } from 'react';

const steps = [
  { text: 'Reiseziel analysieren', pct: 12 },
  { text: 'Geheimtipps suchen', pct: 28 },
  { text: 'Tagesplan erstellen', pct: 46 },
  { text: 'Budget optimieren', pct: 62 },
  { text: 'Hotel auswählen', pct: 75 },
  { text: 'Lokale Empfehlungen', pct: 88 },
  { text: 'Plan wird fertiggestellt', pct: 96 },
];

export function LoadingScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(steps[0].pct);

  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => {
        const next = Math.min(i + 1, steps.length - 1);
        setProgress(steps[next].pct);
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#f0f7f6' }}>
      <div className="w-full max-w-xs text-center">
        <p className="mb-2" style={{ fontSize: '11px', fontWeight: 700, color: '#2d8b7a', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          Tripsilo
        </p>
        <p className="mb-10" style={{ fontSize: '22px', fontWeight: 700, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
          Dein Plan wird erstellt
        </p>

        {/* SVG progress ring */}
        <div className="relative mx-auto mb-8" style={{ width: '88px', height: '88px' }}>
          <svg viewBox="0 0 88 88" style={{ width: '88px', height: '88px', transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r="38" fill="none" stroke="#e0eeec" strokeWidth="6" />
            <circle
              cx="44" cy="44" r="38" fill="none"
              stroke="#2d8b7a" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#2d8b7a' }}>{progress}%</span>
          </div>
        </div>

        <p className="mb-1 transition-all duration-500" style={{ fontSize: '15px', fontWeight: 500, color: '#1a2e2b' }}>
          {steps[stepIdx].text}
        </p>
        <p style={{ fontSize: '13px', color: '#9bb5b0' }}>Bitte einen Moment Geduld</p>

        <div className="flex justify-center gap-1.5 mt-8">
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
