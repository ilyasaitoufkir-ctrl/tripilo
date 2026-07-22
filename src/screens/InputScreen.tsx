import { useState } from 'react';
import {
  MapPin, Plane, Waves, Mountain, Landmark, Music2, UtensilsCrossed, Users,
  Zap, Sparkles, Trophy, ShoppingBag, Heart, Car, Backpack, Gem,
  Compass, Building2, Snowflake, Ship, Camera, Leaf, CalendarDays,
} from 'lucide-react';
import type { TripInput } from '../types';

interface Props {
  onSubmit: (input: TripInput) => void;
}

const travelTypeOptions: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'strand',      label: 'Strand',      icon: Waves },
  { key: 'natur',       label: 'Natur',        icon: Mountain },
  { key: 'kultur',      label: 'Kultur',       icon: Landmark },
  { key: 'staedte',     label: 'Städtetrip',   icon: Building2 },
  { key: 'food',        label: 'Food',         icon: UtensilsCrossed },
  { key: 'party',       label: 'Party',        icon: Music2 },
  { key: 'abenteuer',   label: 'Abenteuer',    icon: Zap },
  { key: 'wellness',    label: 'Wellness',     icon: Sparkles },
  { key: 'sport',       label: 'Sport',        icon: Trophy },
  { key: 'shopping',    label: 'Shopping',     icon: ShoppingBag },
  { key: 'romantik',    label: 'Romantik',     icon: Heart },
  { key: 'roadtrip',    label: 'Road Trip',    icon: Car },
  { key: 'backpacking', label: 'Backpacking',  icon: Backpack },
  { key: 'luxus',       label: 'Luxus',        icon: Gem },
  { key: 'trekking',    label: 'Trekking',     icon: Compass },
  { key: 'familie',     label: 'Familie',      icon: Users },
  { key: 'winter',      label: 'Winter',       icon: Snowflake },
  { key: 'kreuzfahrt',  label: 'Kreuzfahrt',   icon: Ship },
  { key: 'fotografie',  label: 'Fotografie',   icon: Camera },
  { key: 'yoga',        label: 'Yoga & Retreat', icon: Leaf },
];

const ageGroups = ['16–25', '26–35', '36–50', '51–65', '65+'];

const cuisineOptions = [
  'Mediterran', 'Asiatisch', 'Japanisch', 'Indisch', 'Mexikanisch',
  'Amerikanisch', 'Französisch', 'Italienisch', 'Griechisch', 'Türkisch',
  'Arabisch', 'Vegan', 'Seafood', 'Lokal & Traditionell',
];

const avoidOptions = [
  'Touristenfallen', 'Massentourismus', 'Alkohol', 'Nachtleben',
  'Extremsport', 'Lange Fußwege', 'Überfüllte Orte', 'Tierattraktionen',
  'Kinderunfreundliches', 'Sprachbarrieren',
];

const accommodationOptions = [
  'Hotel', 'Hostel', 'Airbnb / Apartment', 'Resort',
  'Boutique Hotel', 'Camping', 'Glamping', 'Villa',
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="card p-5">{children}</div>;
}

function SectionLabel({ text }: { text: string }) {
  return <p className="section-label mb-3">{text}</p>;
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  label, active, onClick, icon: Icon,
}: {
  label: string; active: boolean; onClick: () => void; icon?: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95"
      style={{
        background: active ? '#f0eeff' : '#f5f5f7',
        border: `1px solid ${active ? '#c4b5fd' : '#e8e8ed'}`,
        color: active ? '#8b7cf8' : '#6e6e73',
        fontSize: '13px',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
      }}
    >
      {Icon && <Icon size={12} strokeWidth={1.5} />}
      {label}
    </button>
  );
}

export function InputScreen({ onSubmit }: Props) {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(7);
  const [persons, setPersons] = useState(2);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['strand']);
  const [ageGroup, setAgeGroup] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [accommodation, setAccommodation] = useState('');
  const [avoid, setAvoid] = useState<string[]>([]);
  const [departureCity, setDepartureCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const departureCities = ['Hamburg', 'Berlin', 'München', 'Frankfurt', 'Köln', 'Wien', 'Zürich'];

  const toggleMulti = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const canSubmit = destination.trim().length > 0 && selectedTypes.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      destination: destination.trim(),
      budget,
      days,
      persons,
      travelTypes: selectedTypes,
      ageGroup: ageGroup || undefined,
      cuisines: cuisines.length ? cuisines : undefined,
      accommodation: accommodation || undefined,
      avoid: avoid.length ? avoid : undefined,
      departureCity: (departureCity === 'Andere' ? customCity : departureCity) || undefined,
      departureDate: departureDate || undefined,
      returnDate: returnDate || undefined,
    });
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      <div className="px-5 pt-14 pb-6">
        <p className="section-label mb-1">Tripsilo</p>
        <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Reise planen
        </h1>
      </div>

      <div className="px-4 space-y-3">
        {/* Destination */}
        <SectionCard>
          <SectionLabel text="Wohin?" />
          <div className="flex items-center gap-3">
            <MapPin size={18} strokeWidth={1.5} style={{ color: '#8b7cf8', flexShrink: 0 }} />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="z.B. Barcelona, Bali, New York..."
              className="w-full outline-none"
              style={{ fontSize: '16px', fontWeight: 400, color: '#1c1c1e', background: 'transparent', border: 'none' }}
            />
          </div>
        </SectionCard>

        {/* Budget */}
        <SectionCard>
          <SectionLabel text="Budget" />
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
        </SectionCard>

        {/* Days + Persons */}
        <div className="grid grid-cols-2 gap-3">
          <SectionCard>
            <SectionLabel text="Dauer" />
            <div className="flex items-baseline gap-1 mb-3">
              <span style={{ fontSize: '32px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px' }}>{days}</span>
              <span style={{ fontSize: '16px', fontWeight: 300, color: '#6e6e73' }}>{days === 1 ? 'Tag' : 'Tage'}</span>
            </div>
            <input
              type="range" min={1} max={30} step={1}
              value={days} onChange={(e) => setDays(Number(e.target.value))}
            />
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: '11px', color: '#aeaeb2' }}>1</span>
              <span style={{ fontSize: '11px', color: '#aeaeb2' }}>30</span>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionLabel text="Personen" />
            <div className="flex flex-col items-center gap-2 pt-1">
              <span style={{ fontSize: '32px', fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px' }}>{persons}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPersons(Math.max(1, persons - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', color: '#1c1c1e', fontSize: '16px' }}
                >
                  −
                </button>
                <button
                  onClick={() => setPersons(Math.min(20, persons + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', color: '#1c1c1e', fontSize: '16px' }}
                >
                  +
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Travel Types */}
        <SectionCard>
          <SectionLabel text="Reiseart — mehrere wählbar" />
          <div className="grid grid-cols-3 gap-2">
            {travelTypeOptions.map(({ key, label, icon: Icon }) => {
              const active = selectedTypes.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleMulti(selectedTypes, key, setSelectedTypes)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                  style={{
                    background: active ? '#f0eeff' : '#fafafa',
                    border: `1px solid ${active ? '#c4b5fd' : '#e8e8ed'}`,
                    color: active ? '#8b7cf8' : '#6e6e73',
                    fontSize: '12px',
                    fontWeight: active ? 500 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={15} strokeWidth={1.5} />
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
        </SectionCard>

        {/* Age Group */}
        <SectionCard>
          <SectionLabel text="Altersgruppe (optional)" />
          <ChipGrid>
            {ageGroups.map((a) => (
              <Chip
                key={a}
                label={a}
                active={ageGroup === a}
                onClick={() => setAgeGroup(ageGroup === a ? '' : a)}
              />
            ))}
          </ChipGrid>
        </SectionCard>

        {/* Cuisine */}
        <SectionCard>
          <SectionLabel text="Küchenpräferenzen (optional)" />
          <ChipGrid>
            {cuisineOptions.map((c) => (
              <Chip
                key={c}
                label={c}
                active={cuisines.includes(c)}
                onClick={() => toggleMulti(cuisines, c, setCuisines)}
              />
            ))}
          </ChipGrid>
        </SectionCard>

        {/* Accommodation */}
        <SectionCard>
          <SectionLabel text="Unterkunft (optional)" />
          <ChipGrid>
            {accommodationOptions.map((a) => (
              <Chip
                key={a}
                label={a}
                active={accommodation === a}
                onClick={() => setAccommodation(accommodation === a ? '' : a)}
              />
            ))}
          </ChipGrid>
        </SectionCard>

        {/* Avoid */}
        <SectionCard>
          <SectionLabel text="Vermeiden (optional)" />
          <ChipGrid>
            {avoidOptions.map((a) => (
              <Chip
                key={a}
                label={a}
                active={avoid.includes(a)}
                onClick={() => toggleMulti(avoid, a, setAvoid)}
              />
            ))}
          </ChipGrid>
        </SectionCard>

        {/* Departure city */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <Plane size={13} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
            <SectionLabel text="Abflugstadt (optional)" />
          </div>
          <ChipGrid>
            {departureCities.map((c) => (
              <Chip
                key={c}
                label={c}
                active={departureCity === c}
                onClick={() => { setDepartureCity(departureCity === c ? '' : c); setCustomCity(''); }}
              />
            ))}
            <Chip
              label="Andere"
              active={departureCity === 'Andere'}
              onClick={() => setDepartureCity(departureCity === 'Andere' ? '' : 'Andere')}
            />
          </ChipGrid>
          {departureCity === 'Andere' && (
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="z.B. Stuttgart, Hannover..."
              className="w-full outline-none mt-3"
              style={{ fontSize: '15px', color: '#1c1c1e', background: 'transparent', border: 'none', borderBottom: '1px solid #e8e8ed', paddingBottom: '6px' }}
            />
          )}
        </SectionCard>

        {/* Travel dates */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={13} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
            <SectionLabel text="Reisedaten (optional)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p style={{ fontSize: '11px', color: '#aeaeb2', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hinflug</p>
              <input
                type="date"
                value={departureDate}
                min={today}
                onChange={(e) => {
                  setDepartureDate(e.target.value);
                  if (returnDate && returnDate < e.target.value) setReturnDate('');
                }}
                className="w-full outline-none"
                style={{ fontSize: '14px', color: '#1c1c1e', background: 'transparent', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '8px 10px' }}
              />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#aeaeb2', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rückflug</p>
              <input
                type="date"
                value={returnDate}
                min={departureDate || today}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full outline-none"
                style={{ fontSize: '14px', color: '#1c1c1e', background: 'transparent', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '8px 10px' }}
              />
            </div>
          </div>
        </SectionCard>

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
