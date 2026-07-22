import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

const messages = [
  'Analysiere dein Ziel...',
  'Suche versteckte Geheimtipps...',
  'Plane den perfekten Tagesablauf...',
  'Berechne Budget-Optimierungen...',
  'Wähle das beste Hotel aus...',
  'Füge lokale Empfehlungen hinzu...',
  'Fast fertig...',
];

export function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, messages.length - 1));
    }, 1800);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 4;
      });
    }, 200);
    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Animated Logo */}
        <div className="relative mb-12 inline-block">
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #ff6584)' }}
          >
            <Plane size={64} className="text-white animate-float" strokeWidth={1.5} />
          </div>

          {/* Orbit rings */}
          <div
            className="absolute inset-0 rounded-3xl animate-spin-slow"
            style={{
              border: '2px solid transparent',
              background: 'linear-gradient(#0f1117, #0f1117) padding-box, linear-gradient(135deg, #6c63ff, transparent) border-box',
            }}
          />
          <div
            className="absolute -inset-4 rounded-[2.5rem] animate-spin-slow"
            style={{
              border: '1px solid rgba(108, 99, 255, 0.2)',
              animationDirection: 'reverse',
              animationDuration: '12s',
            }}
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black mb-2 gradient-text">Tripilo plant</h2>
        <p className="text-lg mb-2 font-light" style={{ color: '#8888aa' }}>deine Traumreise</p>

        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full mt-8 mb-3 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6c63ff, #ff6584)',
              boxShadow: '0 0 10px rgba(108,99,255,0.6)',
            }}
          />
        </div>

        {/* Status message */}
        <p
          className="text-sm min-h-[20px] transition-all duration-500"
          style={{ color: '#6c63ff' }}
        >
          {messages[msgIndex]}
        </p>

        {/* Dots animation */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#6c63ff',
                animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
