import { Plane, Sparkles, MapPin, Star } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ff6584, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6c63ff, #ff6584)' }}
        />
      </div>

      {/* Stars decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">
        {/* Logo Icon */}
        <div className="relative mb-8 animate-float">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #ff6584)' }}
          >
            <Plane size={48} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-yellow-900" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-7xl font-black mb-3 gradient-text tracking-tight">
          Tripilo
        </h1>
        <p className="text-xl font-light mb-2" style={{ color: '#8888aa' }}>
          Dein KI Reiseplaner
        </p>

        {/* Features */}
        <div className="flex gap-6 mt-8 mb-12 flex-wrap justify-center">
          {[
            { icon: Sparkles, text: 'KI-gestützt' },
            { icon: MapPin, text: 'Personalisiert' },
            { icon: Star, text: 'Geheimtipps' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm"
              style={{ color: '#8888aa' }}
            >
              <Icon size={14} style={{ color: '#6c63ff' }} />
              {text}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="relative group px-10 py-5 rounded-2xl text-xl font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            boxShadow: '0 0 30px rgba(108, 99, 255, 0.4)',
          }}
        >
          <span className="relative z-10 flex items-center gap-3">
            <Plane size={22} />
            Reise planen
          </span>
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #7c74ff, #ff7894)' }}
          />
        </button>

        <p className="mt-8 text-sm" style={{ color: '#8888aa' }}>
          Powered by Claude AI ✨
        </p>
      </div>
    </div>
  );
}
