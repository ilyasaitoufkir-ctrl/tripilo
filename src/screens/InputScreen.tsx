import { useState } from 'react';
import { Plane, ChevronLeft, Shuffle, CalendarDays, Loader, Search, Star } from 'lucide-react';
import type { TripInput } from '../types';
import { getDestinationImage } from '../services/images';
import { useLanguage } from '../context/LanguageContext';
import { LangToggle } from '../components/LangToggle';

interface Props {
  onSubmit: (input: TripInput) => void;
}

const TOTAL_STEPS = 6;

const surpriseDestinations = [
  'Barcelona', 'Bali', 'Bangkok', 'New York', 'Tokyo', 'Lissabon',
  'Marokko', 'Santorini', 'Island', 'Dubai', 'Rom', 'Amsterdam',
  'Singapur', 'Kapstadt', 'Miami', 'Sydney', 'Kopenhagen', 'Phuket',
  'Venedig', 'Paris', 'Istanbul', 'Rio de Janeiro',
];

const travelTypeOptions = [
  { key: 'strand',      label: 'Strand & Meer' },
  { key: 'natur',       label: 'Berge & Natur' },
  { key: 'staedte',     label: 'Städtetrip' },
  { key: 'kultur',      label: 'Kultur' },
  { key: 'party',       label: 'Party & Nightlife' },
  { key: 'food',        label: 'Food & Genuss' },
  { key: 'sport',       label: 'Sporturlaub' },
  { key: 'sportevents', label: 'Sport Events' },
  { key: 'wellness',    label: 'Wellness & Spa' },
  { key: 'abenteuer',   label: 'Abenteuer' },
  { key: 'roadtrip',    label: 'Roadtrip' },
  { key: 'familie',     label: 'Familienurlaub' },
  { key: 'romantik',    label: 'Romantik' },
  { key: 'festival',    label: 'Festival' },
  { key: 'backpacking', label: 'Backpacking' },
  { key: 'luxus',       label: 'Luxusurlaub' },
  { key: 'tauchen',     label: 'Tauchen' },
  { key: 'ski',         label: 'Skiurlaub' },
];

const cuisineOptions = [
  'Authentische Küche', 'Street Food', 'Fine Dining', 'Vegetarisch',
  'Seafood', 'Fast Food', 'Sushi', 'Halal',
];

const accommodationOptions = [
  'Luxushotel', 'Boutique Hotel', 'Budget Hotel', 'Hostel', 'Airbnb', 'Resort',
];

const avoidOptions = [
  'Touristenfallen', 'Volle Orte', 'Teure Restaurants', 'Partys & Lärm',
  'Lange Fußwege', 'Straßenessen',
];

const departureCities = ['Hamburg', 'Berlin', 'München', 'Frankfurt', 'Köln', 'Wien', 'Zürich'];

const POPULAR_DESTINATIONS = [
  { city: 'Tokyo', country: 'Japan', rating: 4.8 },
  { city: 'Paris', country: 'Frankreich', rating: 4.7 },
  { city: 'Bali', country: 'Indonesien', rating: 4.9 },
  { city: 'Dubai', country: 'VAE', rating: 4.6 },
  { city: 'Barcelona', country: 'Spanien', rating: 4.8 },
  { city: 'New York', country: 'USA', rating: 4.7 },
];

// ── Small helpers ──────────────────────────────────────────────────────────────
function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a2e2b', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '24px' }}>
      {children}
    </h2>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-3 py-2 rounded-xl transition-all active:scale-95"
      style={{
        background: active ? '#e8f5f3' : '#f0f5f4',
        border: `1.5px solid ${active ? '#a3d4ce' : '#e0eeec'}`,
        color: active ? '#2d8b7a' : '#6b8a85',
        fontSize: '13px',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function Stepper({
  value, min, max, onChange, label, unit,
}: {
  value: number; min: number; max: number; onChange: (v: number) => void;
  label: string; unit: string;
}) {
  return (
    <div className="card p-5">
      <p className="section-label mb-4">{label}</p>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#f0f5f4', border: '1px solid #e0eeec', color: '#1a2e2b', fontSize: '20px', fontWeight: 300 }}
        >
          −
        </button>
        <div className="text-center">
          <span style={{ fontSize: '44px', fontWeight: 300, color: '#1a2e2b', letterSpacing: '-2px' }}>{value}</span>
          <span style={{ fontSize: '18px', fontWeight: 300, color: '#6b8a85', marginLeft: '6px' }}>{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#f0f5f4', border: '1px solid #e0eeec', color: '#1a2e2b', fontSize: '20px', fontWeight: 300 }}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface Suggestion {
  city: string;
  country: string;
  reason: string;
  highlight: string;
  estimated_cost: number;
}

// ── Main component ─────────────────────────────────────────────────────────────
export function InputScreen({ onSubmit }: Props) {
  const { t, lang } = useLanguage();
  const [step, setStep]           = useState(1);
  const [dir, setDir]             = useState<'fwd' | 'back'>('fwd');

  // Form state
  const [destination, setDestination]     = useState('');
  const [departureCity, setDepartureCity] = useState('Hamburg');
  const [customCity, setCustomCity]       = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate]       = useState('');
  const [days, setDays]                   = useState(7);
  const [persons, setPersons]             = useState(2);
  const [age, setAge]                     = useState(25);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [cuisines, setCuisines]           = useState<string[]>([]);
  const [accommodation, setAccommodation] = useState('');
  const [budget, setBudget]               = useState(2000);
  const [avoid, setAvoid]                 = useState<string[]>([]);
  const [suggestions, setSuggestions]     = useState<Suggestion[]>([]);
  const [loadingSugg, setLoadingSugg]     = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSurpriseMe = async () => {
    setLoadingSugg(true);
    setSuggestions([]);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `Schlage 3 perfekte Reiseziele vor. Budget: ${budget}€, Dauer: ${days} Tage, Personen: ${persons}, Reiseart: ${selectedTypes.join(', ') || 'allgemein'}, Abflug: ${departureCity}. Antworte NUR als JSON ohne Markdown:\n{"destinations":[{"city":"Porto","country":"Portugal","reason":"Perfekt für dein Budget","highlight":"Douro Tal Weinprobe","estimated_cost":450}]}`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? '{}';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setSuggestions(parsed.destinations ?? []);
    } catch {
      // silently fall through to random fallback
      const r = surpriseDestinations[Math.floor(Math.random() * surpriseDestinations.length)];
      setDestination(r);
    } finally {
      setLoadingSugg(false);
    }
  };

  const toggleMulti = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const canProceed = () => {
    if (step === 1) return destination.trim().length > 0;
    if (step === 4) return selectedTypes.length > 0;
    return true;
  };

  const go = (direction: 'fwd' | 'back') => {
    setDir(direction);
    setStep((s) => s + (direction === 'fwd' ? 1 : -1));
  };

  const handleSubmit = () => {
    onSubmit({
      destination: destination.trim(),
      budget,
      days,
      persons,
      travelTypes: selectedTypes,
      ageGroup: String(age),
      cuisines: cuisines.length ? cuisines : undefined,
      accommodation: accommodation || undefined,
      avoid: avoid.length ? avoid : undefined,
      departureCity: (departureCity === 'Andere' ? customCity : departureCity) || undefined,
      departureDate: departureDate || undefined,
      returnDate: returnDate || undefined,
    });
  };

  // ── Step content ──────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ margin: '-28px -16px 0', paddingBottom: '140px' }}>
            {/* ── Header ── */}
            <div className="px-5 pt-14 pb-5" style={{ background: '#f0f7f6' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p style={{ fontSize: '11px', color: '#6b8a85', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                    {t.yourLocation}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a2e2b' }}>Hamburg, DE</p>
                </div>
                <div className="flex items-center gap-3">
                  <LangToggle />
                  <div className="avatar"><span>IL</span></div>
                </div>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a2e2b', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: '20px' }}>
                {t.findPlace.split(' ').slice(0, 2).join(' ')}<br />{t.findPlace.split(' ').slice(2).join(' ')}
              </h2>

              {/* Search bar */}
              <div className="search-bar mb-1">
                <Search size={18} strokeWidth={1.5} style={{ color: '#9bb5b0', flexShrink: 0 }} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canProceed() && go('fwd')}
                  placeholder={t.searchPlaceholder}
                  className="w-full outline-none"
                  style={{ fontSize: '15px', color: '#1a2e2b', background: 'transparent', border: 'none' }}
                  autoFocus
                />
                {destination && (
                  <button onClick={() => setDestination('')} style={{ color: '#9bb5b0', background: 'none', border: 'none', cursor: 'pointer', padding: '0', fontSize: '18px', lineHeight: 1 }}>×</button>
                )}
              </div>
            </div>

            {/* ── Suggestion cards ── */}
            {suggestions.length > 0 && (
              <div className="px-4 py-3 space-y-2" style={{ background: '#f0f7f6' }}>
                <p className="section-label px-1">Vorschläge für dich</p>
                {suggestions.map((s) => (
                  <button
                    key={s.city}
                    onClick={() => { setDestination(`${s.city}, ${s.country}`); setSuggestions([]); }}
                    className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
                    style={{ border: '1.5px solid #e0eeec', background: '#fff' }}
                  >
                    <img
                      src={getDestinationImage(s.city)}
                      alt={s.city}
                      className="w-full object-cover"
                      style={{ height: '100px' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a2e2b' }}>{s.city}</p>
                          <p style={{ fontSize: '12px', color: '#9bb5b0' }}>{s.country}</p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2d8b7a', flexShrink: 0 }}>
                          ca. {s.estimated_cost}€
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b8a85', marginTop: '4px' }}>{s.reason}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Popular destinations ── */}
            <div className="px-4 pt-5 pb-2" style={{ background: '#f0f7f6' }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#1a2e2b' }}>{t.forYou}</p>
                <button
                  onClick={handleSurpriseMe}
                  disabled={loadingSugg}
                  className="flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                  style={{ color: '#2d8b7a', fontSize: '13px', fontWeight: 500, background: 'none', border: 'none', cursor: loadingSugg ? 'default' : 'pointer', padding: 0 }}
                >
                  {loadingSugg
                    ? <Loader size={13} strokeWidth={1.5} className="animate-spin" />
                    : <Shuffle size={13} strokeWidth={1.5} />
                  }
                  {loadingSugg ? t.searching : t.surpriseMe}
                </button>
              </div>

              {/* 2-column card grid */}
              <div className="grid grid-cols-2 gap-3">
                {POPULAR_DESTINATIONS.map(({ city, country, rating }) => (
                  <button
                    key={city}
                    onClick={() => setDestination(`${city}, ${country}`)}
                    className="destination-card text-left transition-all active:scale-[0.97]"
                    style={{ border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
                  >
                    <img
                      src={getDestinationImage(city)}
                      alt={city}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=70';
                      }}
                    />
                    <div className="destination-card-overlay">
                      <p className="destination-card-name">{city}</p>
                      <div className="destination-card-rating">
                        <span className="rating-badge">
                          <Star size={10} fill="white" strokeWidth={0} />
                          {rating}
                        </span>
                      </div>
                    </div>
                    {destination === `${city}, ${country}` && (
                      <div
                        className="absolute inset-0 rounded-2xl"
                        style={{ border: '2.5px solid #2d8b7a', borderRadius: '16px' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <>
            <StepTitle>{t.whenTravel}</StepTitle>

            {/* Departure city */}
            <div className="card p-5 mb-3">
              <p className="section-label mb-3">Abflugstadt</p>
              <div className="flex flex-wrap gap-2">
                {departureCities.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    active={departureCity === c}
                    onClick={() => { setDepartureCity(c); setCustomCity(''); }}
                  />
                ))}
                <Chip
                  label="Andere"
                  active={departureCity === 'Andere'}
                  onClick={() => setDepartureCity('Andere')}
                />
              </div>
              {departureCity === 'Andere' && (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Stadt eingeben..."
                  className="w-full outline-none mt-3"
                  style={{ fontSize: '15px', color: '#1a2e2b', background: 'transparent', border: 'none', borderBottom: '1px solid #e0eeec', paddingBottom: '6px' }}
                />
              )}
            </div>

            {/* Dates */}
            <div className="card p-5 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={13} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
                <p className="section-label">Reisedaten (optional)</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={{ fontSize: '11px', color: '#9bb5b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hinreise</p>
                  <input
                    type="date" value={departureDate} min={today}
                    onChange={(e) => { setDepartureDate(e.target.value); if (returnDate && returnDate < e.target.value) setReturnDate(''); }}
                    className="w-full outline-none"
                    style={{ fontSize: '14px', color: '#1a2e2b', background: 'transparent', border: '1px solid #e0eeec', borderRadius: '10px', padding: '8px 10px' }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#9bb5b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rückreise</p>
                  <input
                    type="date" value={returnDate} min={departureDate || today}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full outline-none"
                    style={{ fontSize: '14px', color: '#1a2e2b', background: 'transparent', border: '1px solid #e0eeec', borderRadius: '10px', padding: '8px 10px' }}
                  />
                </div>
              </div>
            </div>

            {/* Days */}
            <Stepper value={days} min={1} max={30} onChange={setDays} label="Wie viele Tage?" unit={days === 1 ? 'Tag' : 'Tage'} />
          </>
        );

      case 3:
        return (
          <>
            <StepTitle>{t.whoTravels}</StepTitle>
            <div className="space-y-3">
              <Stepper value={persons} min={1} max={20} onChange={setPersons} label="Personen" unit={persons === 1 ? 'Person' : 'Personen'} />
              <Stepper value={age} min={16} max={99} onChange={setAge} label="Dein Alter" unit="Jahre" />
            </div>
          </>
        );

      case 4:
        return (
          <>
            <StepTitle>{t.tripType}</StepTitle>
            <p style={{ fontSize: '13px', color: '#9bb5b0', marginBottom: '16px', marginTop: '-16px' }}>{lang === 'en' ? 'Multiple allowed' : 'Mehrere möglich'}</p>
            <div className="grid grid-cols-2 gap-2">
              {travelTypeOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  active={selectedTypes.includes(key)}
                  onClick={() => toggleMulti(selectedTypes, key, setSelectedTypes)}
                />
              ))}
            </div>
            {selectedTypes.length === 0 && (
              <p className="text-center mt-4" style={{ fontSize: '13px', color: '#f472b6' }}>
                Mindestens eine Reiseart wählen
              </p>
            )}
          </>
        );

      case 5:
        return (
          <>
            <StepTitle>{t.foodAccom}</StepTitle>

            <div className="card p-5 mb-3">
              <p className="section-label mb-3">Was magst du essen?</p>
              <div className="grid grid-cols-2 gap-2">
                {cuisineOptions.map((c) => (
                  <Chip key={c} label={c} active={cuisines.includes(c)} onClick={() => toggleMulti(cuisines, c, setCuisines)} />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="section-label mb-3">Unterkunft</p>
              <div className="grid grid-cols-2 gap-2">
                {accommodationOptions.map((a) => (
                  <Chip key={a} label={a} active={accommodation === a} onClick={() => setAccommodation(accommodation === a ? '' : a)} />
                ))}
              </div>
            </div>
          </>
        );

      case 6:
        return (
          <>
            <StepTitle>{t.budgetPrefs}</StepTitle>

            <div className="card p-5 mb-3">
              <p className="section-label mb-4">Dein Budget</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span style={{ fontSize: '40px', fontWeight: 300, color: '#1a2e2b', letterSpacing: '-1px' }}>
                  {budget.toLocaleString('de-DE')}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 300, color: '#6b8a85' }}>€</span>
                {persons > 1 && (
                  <span style={{ fontSize: '13px', color: '#9bb5b0', marginLeft: 'auto', paddingBottom: '4px' }}>
                    ≈ {Math.round(budget / persons).toLocaleString('de-DE')}€ / Person
                  </span>
                )}
              </div>
              <input
                type="range" min={100} max={10000} step={100}
                value={budget} onChange={(e) => setBudget(Number(e.target.value))}
              />
              <div className="flex justify-between mt-2">
                <span style={{ fontSize: '12px', color: '#9bb5b0' }}>100€</span>
                <span style={{ fontSize: '12px', color: '#9bb5b0' }}>10.000€</span>
              </div>
            </div>

            <div className="card p-5">
              <p className="section-label mb-3">Was möchtest du vermeiden?</p>
              <div className="grid grid-cols-2 gap-2">
                {avoidOptions.map((a) => (
                  <Chip key={a} label={a} active={avoid.includes(a)} onClick={() => toggleMulti(avoid, a, setAvoid)} />
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#f0f7f6' }}>
      {/* Header + progress — only for steps 2+ */}
      {step > 1 && (
        <div className="px-5 pt-14 pb-2" style={{ borderBottom: '1px solid #e0eeec', background: '#ffffff' }}>
          <p className="section-label mb-3">Tripsilo</p>
          <div style={{ height: '3px', background: '#e0eeec', borderRadius: '2px', marginBottom: '8px' }}>
            <div
              style={{
                height: '100%',
                width: `${(step / TOTAL_STEPS) * 100}%`,
                background: '#2d8b7a',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#9bb5b0', paddingBottom: '12px' }}>
            {t.stepOf} {step} {t.of} {TOTAL_STEPS}
          </p>
        </div>
      )}

      {/* Step content */}
      <div
        key={step}
        className={dir === 'fwd' ? 'step-enter' : 'step-enter-back'}
        style={{ padding: step === 1 ? '0' : '28px 16px 160px' }}
      >
        {renderStep()}
      </div>

      {/* Navigation buttons — fixed above BottomNav */}
      <div
        className="fixed left-0 right-0"
        style={{
          bottom: '64px',
          padding: '16px 16px 8px',
          background: 'linear-gradient(to bottom, transparent, #f0f7f6 40%)',
        }}
      >
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => go('back')}
              className="flex items-center justify-center py-3.5 rounded-xl transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1.5px solid #e0eeec', color: '#6b8a85', cursor: 'pointer', width: '52px', flexShrink: 0, borderRadius: '14px' }}
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
          )}
          <button
            onClick={step === TOTAL_STEPS ? handleSubmit : () => go('fwd')}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              background: canProceed() ? '#2d8b7a' : '#e0eeec',
              color: canProceed() ? '#ffffff' : '#9bb5b0',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              borderRadius: '14px',
              boxShadow: canProceed() ? '0 4px 16px rgba(45,139,122,0.30)' : 'none',
            }}
          >
            {step === TOTAL_STEPS ? (
              <>
                <Plane size={16} strokeWidth={1.5} />
                {t.createPlan}
              </>
            ) : (
              t.next
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
