import { useState } from 'react';
import { MapPin, Euro, Calendar, Users, Plane, ArrowLeft } from 'lucide-react';
import type { TripInput, TravelType } from '../types';

interface Props {
  onSubmit: (input: TripInput) => void;
  onBack: () => void;
}

const travelTypes: { type: TravelType; emoji: string; label: string }[] = [
  { type: 'strand', emoji: '🏖️', label: 'Strand & Meer' },
  { type: 'natur', emoji: '🏔️', label: 'Natur & Abenteuer' },
  { type: 'kultur', emoji: '🏛️', label: 'Kultur & Geschichte' },
  { type: 'party', emoji: '🎉', label: 'Party & Nightlife' },
  { type: 'food', emoji: '🍽️', label: 'Food & Genuss' },
  { type: 'familie', emoji: '👨‍👩‍👧', label: 'Familie' },
];

export function InputScreen({ onSubmit, onBack }: Props) {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(7);
  const [travelType, setTravelType] = useState<TravelType>('strand');
  const [persons, setPersons] = useState(2);

  const handleSubmit = () => {
    if (!destination.trim()) return;
    onSubmit({ destination: destination.trim(), budget, days, travelType, persons });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center transition-all hover:scale-110"
            style={{ color: '#8888aa' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Reise planen</h1>
            <p className="text-sm" style={{ color: '#8888aa' }}>Erzähl uns von deiner Traumreise</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Destination */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#8888aa' }}>
              <MapPin size={16} style={{ color: '#6c63ff' }} />
              WOHIN?
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="z.B. Barcelona, Bali, New York..."
              className="w-full bg-transparent text-xl font-medium outline-none placeholder:text-gray-600"
              style={{ color: '#ffffff' }}
            />
          </div>

          {/* Budget */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: '#8888aa' }}>
              <Euro size={16} style={{ color: '#6c63ff' }} />
              BUDGET
            </label>
            <div className="text-3xl font-black mb-4 gradient-text">{budget.toLocaleString('de-DE')}€</div>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-2" style={{ color: '#8888aa' }}>
              <span>100€</span>
              <span>10.000€</span>
            </div>
          </div>

          {/* Days */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: '#8888aa' }}>
              <Calendar size={16} style={{ color: '#6c63ff' }} />
              DAUER
            </label>
            <div className="text-3xl font-black mb-4 gradient-text">
              {days} {days === 1 ? 'Tag' : 'Tage'}
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-2" style={{ color: '#8888aa' }}>
              <span>1 Tag</span>
              <span>30 Tage</span>
            </div>
          </div>

          {/* Travel Type */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: '#8888aa' }}>
              <Plane size={16} style={{ color: '#6c63ff' }} />
              REISEART
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {travelTypes.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  onClick={() => setTravelType(type)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: travelType === type
                      ? 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(255,101,132,0.3))'
                      : 'rgba(255,255,255,0.03)',
                    border: travelType === type
                      ? '1px solid rgba(108,99,255,0.6)'
                      : '1px solid rgba(255,255,255,0.06)',
                    color: travelType === type ? '#ffffff' : '#8888aa',
                  }}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Persons */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: '#8888aa' }}>
              <Users size={16} style={{ color: '#6c63ff' }} />
              PERSONEN
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPersons(Math.max(1, persons - 1))}
                className="w-12 h-12 rounded-full glass-card text-xl font-bold transition-all hover:scale-110 flex items-center justify-center"
                style={{ color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)' }}
              >
                −
              </button>
              <span className="text-4xl font-black gradient-text w-16 text-center">{persons}</span>
              <button
                onClick={() => setPersons(Math.min(10, persons + 1))}
                className="w-12 h-12 rounded-full glass-card text-xl font-bold transition-all hover:scale-110 flex items-center justify-center"
                style={{ color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)' }}
              >
                +
              </button>
              <span className="text-sm ml-2" style={{ color: '#8888aa' }}>
                {persons === 1 ? 'Person' : 'Personen'}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!destination.trim()}
            className="w-full py-5 rounded-2xl text-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
              boxShadow: destination.trim() ? '0 0 30px rgba(108, 99, 255, 0.4)' : 'none',
              animationDelay: '0.35s',
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <Plane size={22} />
              Plan erstellen
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
