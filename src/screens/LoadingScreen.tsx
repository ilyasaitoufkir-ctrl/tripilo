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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: '#fafafa' }}
    >
      <div className="w-full max-w-xs text-center">
        {/* Word mark */}
        <p
          className="mb-12"
          style={{ fontSize: '22px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-0.5px' }}
        >
          Tripilo
        </p>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden mb-4"
          style={{ height: '3px', background: '#e8e8ed' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, background: '#8b7cf8' }}
          />
        </div>

        {/* Status */}
        <p
          className="mb-1 transition-all duration-500"
          style={{ fontSize: '15px', fontWeight: 400, color: '#1c1c1e' }}
        >
          {steps[stepIdx].text}
        </p>
        <p style={{ fontSize: '13px', color: '#aeaeb2' }}>
          Bitte einen Moment Geduld
        </p>

        {/* Dot indicator */}
        <div className="flex justify-center gap-1.5 mt-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === stepIdx ? '20px' : '6px',
                height: '6px',
                background: i <= stepIdx ? '#8b7cf8' : '#e8e8ed',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
