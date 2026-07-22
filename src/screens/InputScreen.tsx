import { useState } from 'react';
import { MapPin, Euro, Calendar, Users, Plane } from 'lucide-react';
import type { TripInput, TravelType } from '../types';

interface Props {
  onSubmit: (input: TripInput) => void;
}

const travelTypes: { type: TravelType; emoji: string; label: string }[] = [
  { type: 'strand',  emoji: '🏖️', label: 'Strand & Meer' },
  { type: 'natur',   emoji: '🏔️', label: 'Natur' },
  { type: 'kultur',  emoji: '🏛️', label: 'Kultur' },
  { type: 'party',   emoji: '🎉', label: 'Party' },
  { type: 'food',    emoji: '🍽️', label: 'Food' },
  { type: 'familie', emoji: '👨‍👩‍👧', label: 'Familie' },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card p-5">
      {children}
    </div>
  );
}

function Label({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#ede9ff' }}>
        <Icon size={14} style={{ color: '#5b4fff' }} />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>{text}</span>
    </div>
  );
}

export function InputScreen({ onSubmit }: Props) {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(7);
  const [selectedTypes, setSelectedTypes] = useState<TravelType[]>(['strand']);
  const [persons, setPersons] = useState(2);

  const toggleType = (type: TravelType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = () => {
    if (!destination.trim() || selectedTypes.length === 0) return;
    onSubmit({
      destination: destination.trim(),
      budget,
      days,
      travelTypes: selectedTypes,
      persons,
    });
  };

  const canSubmit = destination.trim().length > 0 && selectedTypes.length > 0;

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f8f9ff' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)' }}
      >
        <p className="text-sm font-medium mb-1 opacity-80" style={{ color: '#ede9ff' }}>Tripilo</p>
        <h1 className="text-3xl font-black text-white mb-1">Traumreise planen</h1>
        <p className="text-sm opacity-70 text-white">KI erstellt deinen perfekten Plan</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Destination */}
        <SectionCard>
          <Label icon={MapPin} text="Wohin möchtest du?" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="z.B. Barcelona, Bali, New York..."
            className="w-full outline-none text-lg font-semibold placeholder:font-normal"
            style={{ color: '#1a1a2e', background: 'transparent', caretColor: '#5b4fff' }}
          />
        </SectionCard>

        {/* Budget */}
        <SectionCard>
          <Label icon={Euro} text="Budget" />
          <div className="flex items-end justify-between mb-3">
            <span className="text-4xl font-black gradient-text">
              {budget.toLocaleString('de-DE')}€
            </span>
            <span className="text-sm pb-1" style={{ color: '#9ca3af' }}>
              {persons > 1 ? `÷ ${persons} = ${Math.round(budget / persons).toLocaleString('de-DE')}€/P.` : 'gesamt'}
            </span>
          </div>
          <input
            type="range" min={100} max={10000} step={100}
            value={budget} onChange={(e) => setBudget(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs mt-2" style={{ color: '#9ca3af' }}>
            <span>100€</span><span>10.000€</span>
          </div>
        </SectionCard>

        {/* Days */}
        <SectionCard>
          <Label icon={Calendar} text="Reisedauer" />
          <div className="flex items-end justify-between mb-3">
            <span className="text-4xl font-black gradient-text">
              {days} {days === 1 ? 'Tag' : 'Tage'}
            </span>
          </div>
          <input
            type="range" min={1} max={30} step={1}
            value={days} onChange={(e) => setDays(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs mt-2" style={{ color: '#9ca3af' }}>
            <span>1 Tag</span><span>30 Tage</span>
          </div>
        </SectionCard>

        {/* Travel Types */}
        <SectionCard>
          <Label icon={Plane} text="Reiseart (mehrere möglich)" />
          <div className="grid grid-cols-3 gap-2">
            {travelTypes.map(({ type, emoji, label }) => {
              const active = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: active ? 'linear-gradient(135deg, #5b4fff, #8b5cf6)' : '#f8f9ff',
                    color: active ? '#ffffff' : '#6b7280',
                    border: active ? '2px solid #5b4fff' : '2px solid #e5e7eb',
                    boxShadow: active ? '0 4px 12px rgba(91,79,255,0.3)' : 'none',
                  }}
                >
                  <span className="text-xl">{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {selectedTypes.length === 0 && (
            <p className="text-xs mt-2 text-center" style={{ color: '#ff6584' }}>
              Bitte mindestens eine Reiseart wählen
            </p>
          )}
        </SectionCard>

        {/* Persons */}
        <SectionCard>
          <Label icon={Users} text="Personen" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPersons(Math.max(1, persons - 1))}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95"
              style={{ background: '#f0f2ff', color: '#5b4fff', border: '2px solid #e0dcff' }}
            >
              −
            </button>
            <div className="flex-1 text-center">
              <div className="text-5xl font-black gradient-text">{persons}</div>
              <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                {persons === 1 ? 'Person' : 'Personen'}
              </div>
            </div>
            <button
              onClick={() => setPersons(Math.min(10, persons + 1))}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95"
              style={{ background: '#f0f2ff', color: '#5b4fff', border: '2px solid #e0dcff' }}
            >
              +
            </button>
          </div>
        </SectionCard>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSubmit ? 'linear-gradient(135deg, #5b4fff, #8b5cf6)' : '#e5e7eb',
            color: canSubmit ? '#ffffff' : '#9ca3af',
            boxShadow: canSubmit ? '0 8px 28px rgba(91,79,255,0.35)' : 'none',
          }}
        >
          <span className="flex items-center justify-center gap-3">
            <Plane size={22} />
            KI-Plan erstellen
          </span>
        </button>
      </div>
    </div>
  );
}
