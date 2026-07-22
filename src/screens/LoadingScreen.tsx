import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

const steps = [
  { text: 'Reiseziel analysieren...', pct: 15 },
  { text: 'Geheimtipps suchen...', pct: 30 },
  { text: 'Tagesplan erstellen...', pct: 50 },
  { text: 'Budget optimieren...', pct: 65 },
  { text: 'Hotel auswählen...', pct: 78 },
  { text: 'Lokale Empfehlungen...', pct: 88 },
  { text: 'Fast fertig...', pct: 95 },
];

export function LoadingScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => {
        const next = Math.min(i + 1, steps.length - 1);
        setProgress(steps[next].pct);
        return next;
      });
    }, 1800);
    setProgress(steps[0].pct);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #ede9ff 0%, #f8f9ff 60%)' }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Logo animation */}
        <div className="relative inline-block mb-12">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-[2.5rem] animate-spin-slow"
            style={{
              margin: '-12px',
              border: '2px dashed rgba(91,79,255,0.25)',
              borderRadius: '2.5rem',
            }}
          />
          {/* Card */}
          <div
            className="w-32 h-32 rounded-[2rem] flex items-center justify-center animate-pulse-ring"
            style={{
              background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)',
              boxShadow: '0 20px 60px rgba(91,79,255,0.35)',
            }}
          >
            <Plane size={60} className="text-white animate-float" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-3xl font-black mb-1" style={{ color: '#1a1a2e' }}>
          KI plant deine
        </h2>
        <p className="text-3xl font-black mb-8 gradient-text">Traumreise</p>

        {/* Progress track */}
        <div
          className="w-full h-2.5 rounded-full overflow-hidden mb-3"
          style={{ background: '#e5e7eb' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #5b4fff, #8b5cf6)',
              boxShadow: '0 0 12px rgba(91,79,255,0.5)',
            }}
          />
        </div>

        <p className="text-sm font-medium transition-all duration-500" style={{ color: '#5b4fff' }}>
          {steps[stepIdx].text}
        </p>

        {/* Bouncing dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#5b4fff',
                animation: `float 1.2s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
