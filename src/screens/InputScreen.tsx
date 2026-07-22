import { useState } from 'react';
import {
  MapPin, Users, Plane,
  Waves, Mountain, Landmark, Music2, UtensilsCrossed
} from 'lucide-react';
import type { TripInput, TravelType } from '../types';

interface Props {
  onSubmit: (input: TripInput) => void;
}

const travelTypes: { type: TravelType; label: string; icon: React.ElementType }[] = [
  { type: 'strand',  label: 'Strand',   icon: Waves },
  { type: 'natur',   label: 'Natur',    icon: Mountain },
  { type: 'kultur',  label: 'Kultur',   icon: Landmark },
  { type: 'party',   label: 'Party',    icon: Music2 },
  { type: 'food',    label: 'Food',     icon: UtensilsCrossed },
  { type: 'familie', label: 'Familie',  icon: Users },
];

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card p-5">{children}</div>;
}

function FieldLabel({ text }: { text: string }) {
  return (
    <p className="section-label mb-3">{text}</p>
  );
}

export function InputScreen({ onSubmit }: Props) {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(7);
  const [selectedTypes, setSelectedTypes] = useState<TravelType[]>(['strand']);
  const [persons, setPersons] = useState(2);

  const toggleType = (type: TravelType) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const canSubmit = destination.trim().length > 0 && selectedTypes.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ destination: destination.trim(), budget, days, travelTypes: selectedTypes, persons });
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Page header */}
      <div className="px-5 pt-14 pb-6">
        <p className="section-label mb-1">Tripsilo</p>
        <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Reise planen
        </h1>
      </div>

      <div className="px-4 space-y-3">
        {/* Destination */}
        <Card>
          <FieldLabel text="Wohin?" />
          <div className="flex items-center gap-3">
            <MapPin size={18} strokeWidth={1.5} style={{ color: '#8b7cf8', flexShrink: 0 }} />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="z.B. Barcelona, Bali, New York..."
              className="w-full outline-none"
              style={{
                fontSize: '16px',
                fontWeight: 400,
                color: '#1c1c1e',
                background: 'transparent',
                border: 'none',
              }}
            />
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <FieldLabel text="Budget" />
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span style={{ fontSize: '36px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px' }}>
                {budget.toLocaleString('de-DE')}
              </span>
              <span style={{ fontSize: '18px', fontWeight: 300, color: '#6e6e73' }}>€</span>
            </div>
            {persons > 1 && (
              <span style={{ fontSize: '13px', color: '#aeaeb2', paddingBottom: '4px' }}>
                {Math.round(budget / persons).toLocaleString('de-DE')}€ / Person
              </span>
            )}
          </div>
          <input
            type="range" min={100} max={10000} step={100}
            value={budget} onChange={(e) => setBudget(Number(e.target.value))}
          />
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: '12px', color: '#aeaeb2' }}>100€</span>
            <span style={{ fontSize: '12px', color: '#aeaeb2' }}>10.000€</span>
          </div>
        </Card>

        {/* Days */}
        <Card>
          <FieldLabel text="Dauer" />
          <div className="flex items-baseline gap-2 mb-4">
            <span style={{ fontSize: '36px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px' }}>
              {days}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 300, color: '#6e6e73' }}>
              {days === 1 ? 'Tag' : 'Tage'}
            </span>
          </div>
          <input
            type="range" min={1} max={30} step={1}
            value={days} onChange={(e) => setDays(Number(e.target.value))}
          />
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: '12px', color: '#aeaeb2' }}>1 Tag</span>
            <span style={{ fontSize: '12px', color: '#aeaeb2' }}>30 Tage</span>
          </div>
        </Card>

        {/* Travel type */}
        <Card>
          <FieldLabel text="Reiseart" />
          <div className="grid grid-cols-3 gap-2">
            {travelTypes.map(({ type, label, icon: Icon }) => {
              const active = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                  style={{
                    background: active ? '#f0eeff' : '#fafafa',
                    border: `1px solid ${active ? '#c4b5fd' : '#e8e8ed'}`,
                    color: active ? '#8b7cf8' : '#6e6e73',
                    fontSize: '13px',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {label}
                </button>
              );
            })}
          </div>
          {selectedTypes.length === 0 && (
            <p className="text-center mt-3" style={{ fontSize: '13px', color: '#f472b6' }}>
              Mindestens eine Reiseart wählen
            </p>
          )}
        </Card>

        {/* Persons */}
        <Card>
          <FieldLabel text="Personen" />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPersons(Math.max(1, persons - 1))}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', color: '#1c1c1e', fontSize: '18px', fontWeight: 300 }}
            >
              −
            </button>
            <div className="text-center">
              <div style={{ fontSize: '40px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px' }}>
                {persons}
              </div>
              <div style={{ fontSize: '12px', color: '#aeaeb2' }}>
                {persons === 1 ? 'Person' : 'Personen'}
              </div>
            </div>
            <button
              onClick={() => setPersons(Math.min(10, persons + 1))}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', color: '#1c1c1e', fontSize: '18px', fontWeight: 300 }}
            >
              +
            </button>
          </div>
        </Card>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full transition-all active:scale-[0.98]"
          style={{
            background: canSubmit ? '#8b7cf8' : '#e8e8ed',
            color: canSubmit ? '#ffffff' : '#aeaeb2',
            borderRadius: '12px',
            padding: '15px',
            fontSize: '15px',
            fontWeight: 500,
            border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            letterSpacing: '-0.1px',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Plane size={17} strokeWidth={1.5} />
            Plan erstellen
          </span>
        </button>
      </div>
    </div>
  );
}
