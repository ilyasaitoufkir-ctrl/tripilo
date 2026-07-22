import { useState, useEffect } from 'react';
import {
  MapPin, Euro, Calendar, Hotel, Lightbulb, AlertTriangle,
  Sun, Coffee, Moon, Bookmark, RefreshCw, ChevronDown, ChevronUp,
  Train, ExternalLink, Star, Share2, Check
} from 'lucide-react';
import type { TripPlan, TripInput, DayPlan } from '../types';
import { searchPlace, priceLevelLabel, type PlaceInfo } from '../services/places';
import { MapView, openDayRoute } from '../components/MapView';

interface Props {
  plan: TripPlan;
  input: TripInput;
  onSave: () => void;
  onNew: () => void;
  onRate: () => void;
  isSaved: boolean;
}

type SlotKey = string;

const placeKey = (day: number, slot: 'morning' | 'lunch' | 'evening'): SlotKey =>
  `${day}-${slot}`;

const slotQuery = (day: DayPlan, slot: 'morning' | 'lunch' | 'evening', dest: string): string =>
  slot === 'lunch'
    ? `${day.lunch.restaurant} ${dest}`
    : `${day[slot].activity} ${dest}`;

// ── Place enrichment card ─────────────────────────────────────────────────────
function PlaceCard({ place, loading }: { place: PlaceInfo | null | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden">
        <div className="skeleton h-28 w-full" />
        <div className="p-3 space-y-2">
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    );
  }
  if (!place) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden card">
      {place.photo && (
        <img
          src={place.photo}
          alt={place.name}
          className="w-full h-32 object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: '#5b4fff' }} className="shrink-0 mt-0.5" />
            <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{place.name}</span>
          </div>
          {place.price_level !== null && (
            <span className="text-xs font-semibold shrink-0" style={{ color: '#5b4fff' }}>
              {priceLevelLabel(place.price_level)}
            </span>
          )}
        </div>
        {place.rating !== null && (
          <div className="flex items-center gap-1 text-xs">
            <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
            <span className="font-bold" style={{ color: '#1a1a2e' }}>{place.rating.toFixed(1)}</span>
            {place.total_ratings !== null && (
              <span style={{ color: '#9ca3af' }}>
                ({place.total_ratings.toLocaleString('de-DE')} Bewertungen)
              </span>
            )}
          </div>
        )}
        {place.address && (
          <p className="text-xs" style={{ color: '#6b7280' }}>📮 {place.address}</p>
        )}
        <a
          href={place.maps_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg mt-1 transition-all hover:scale-105"
          style={{ background: '#ede9ff', color: '#5b4fff' }}
        >
          <ExternalLink size={11} />
          In Google Maps öffnen
        </a>
      </div>
    </div>
  );
}

// ── Slot section wrapper ──────────────────────────────────────────────────────
function SlotBlock({
  icon: Icon, label, accentColor, cost, name, description, tip, placeData, placeLoading,
}: {
  icon: React.ElementType; label: string; accentColor: string; cost: number;
  name: string; description: string; tip?: string;
  placeData: PlaceInfo | null | undefined; placeLoading: boolean;
}) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: `${accentColor}0d`, border: `1px solid ${accentColor}25` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: accentColor }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>{label}</span>
        <span className="ml-auto text-xs font-bold" style={{ color: '#9ca3af' }}>{cost}€</span>
      </div>
      <p className="font-semibold text-sm mb-0.5" style={{ color: '#1a1a2e' }}>{name}</p>
      <p className="text-xs mb-2" style={{ color: '#6b7280' }}>{description}</p>
      <PlaceCard place={placeData} loading={placeLoading} />
      {tip && (
        <div className="flex items-start gap-1.5 text-xs mt-3 p-2 rounded-lg" style={{ background: `${accentColor}10`, color: accentColor }}>
          <Lightbulb size={11} className="mt-0.5 shrink-0" />
          {tip}
        </div>
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function PlanScreen({ plan, input, onSave, onNew, onRate, isSaved }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [placesData, setPlacesData] = useState<Record<SlotKey, PlaceInfo | null>>({});
  const [placesLoading, setPlacesLoading] = useState(true);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [showMap, setShowMap] = useState(false);

  const totalBudget = Object.values(plan.budget_breakdown).reduce((a, b) => a + b, 0);
  const dest = plan.destination;

  // Fetch Places data for all activities
  useEffect(() => {
    const queries: { key: SlotKey; query: string }[] = [];
    plan.days.forEach((day) => {
      queries.push({ key: placeKey(day.day, 'morning'), query: slotQuery(day, 'morning', dest) });
      queries.push({ key: placeKey(day.day, 'lunch'),   query: slotQuery(day, 'lunch',   dest) });
      queries.push({ key: placeKey(day.day, 'evening'), query: slotQuery(day, 'evening', dest) });
    });
    queries.push({ key: 'hotel', query: `${plan.hotel_empfehlung.name} ${dest}` });

    Promise.allSettled(
      queries.map(({ key, query }) => searchPlace(query).then((r) => ({ key, result: r })))
    ).then((results) => {
      const map: Record<SlotKey, PlaceInfo | null> = {};
      results.forEach((r) => { if (r.status === 'fulfilled') map[r.value.key] = r.value.result; });
      setPlacesData(map);
      setPlacesLoading(false);
    });
  }, [plan, dest]);

  const isLoading = (key: SlotKey) => placesLoading && !(key in placesData);

  // Share plan
  const handleShare = async () => {
    try {
      const data = { plan, input };
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      const url = `${window.location.origin}${window.location.pathname}#share/${encoded}`;
      if (navigator.share) {
        await navigator.share({
          title: `Mein Reiseplan: ${plan.destination}`,
          text: `Schau dir meinen Tripilo-Plan für ${plan.destination} an!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2500);
      }
    } catch { /* user cancelled */ }
  };

  // Day route activities
  const getDayActivities = (day: DayPlan) => [day.morning.activity, day.lunch.restaurant, day.evening.activity];

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f8f9ff' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src={`https://source.unsplash.com/1600x700/?${encodeURIComponent(dest)},travel,city`}
          alt={dest}
          className="w-full h-56 object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.background = 'linear-gradient(135deg,#5b4fff,#8b5cf6)'; (e.currentTarget as HTMLImageElement).style.display = 'block'; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(91,79,255,0.1) 0%, rgba(26,26,46,0.75) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={13} className="text-white opacity-70" />
            <span className="text-sm text-white opacity-70">{plan.country}</span>
          </div>
          <h1 className="text-4xl font-black text-white">{plan.destination}</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { icon: Calendar, text: `${input.days} Tage` },
              { icon: Euro, text: `${totalBudget.toLocaleString('de-DE')}€` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                   style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <Icon size={11} />
                {text}
              </div>
            ))}
            <div className="px-3 py-1 rounded-full text-xs font-semibold"
                 style={{ background: 'rgba(255,215,0,0.25)', color: '#ffd700' }}>
              ✨ {plan.beste_reisezeit}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Action bar */}
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={isSaved}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60"
            style={{ background: isSaved ? '#fff7ed' : '#fff', border: '2px solid #f59e0b', color: '#f59e0b' }}
          >
            <Bookmark size={16} fill={isSaved ? '#f59e0b' : 'none'} />
            {isSaved ? 'Gespeichert' : 'Speichern'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{ background: shareState === 'copied' ? '#d1fae5' : '#ede9ff', color: shareState === 'copied' ? '#059669' : '#5b4fff' }}
          >
            {shareState === 'copied' ? <Check size={16} /> : <Share2 size={16} />}
            {shareState === 'copied' ? 'Link kopiert!' : 'Teilen'}
          </button>
          <button
            onClick={onRate}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{ background: '#fff0f3', color: '#ff6584', border: '2px solid #ffc9d4' }}
          >
            <Star size={16} />
            Bewerten
          </button>
        </div>

        {/* Budget breakdown */}
        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#6b7280' }}>
            <Euro size={13} style={{ color: '#5b4fff' }} />
            Budget Übersicht
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'hotel', label: 'Hotel', icon: '🏨' },
              { key: 'essen', label: 'Essen', icon: '🍽️' },
              { key: 'aktivitaeten', label: 'Aktivitäten', icon: '🎯' },
              { key: 'transport', label: 'Transport', icon: '✈️' },
            ].map(({ key, label, icon }) => {
              const amount = plan.budget_breakdown[key as keyof typeof plan.budget_breakdown];
              const pct = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
              return (
                <div key={key} className="p-3 rounded-xl" style={{ background: '#f8f9ff', border: '1px solid #e5e7eb' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs" style={{ color: '#6b7280' }}>{icon} {label}</span>
                    <span className="text-xs font-bold" style={{ color: '#1a1a2e' }}>{amount.toLocaleString('de-DE')}€</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #5b4fff, #8b5cf6)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map toggle */}
        <div className="card p-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#ede9ff' }}>
                <MapPin size={15} style={{ color: '#5b4fff' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>Karte anzeigen</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>{plan.destination} erkunden</p>
              </div>
            </div>
            {showMap ? <ChevronUp size={16} style={{ color: '#9ca3af' }} /> : <ChevronDown size={16} style={{ color: '#9ca3af' }} />}
          </button>
          {showMap && (
            <div className="mt-4">
              <MapView destination={dest} />
            </div>
          )}
        </div>

        {/* Day plans */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#6b7280' }}>
            <Calendar size={13} style={{ color: '#5b4fff' }} />
            Tagesplan
          </h3>
          <div className="space-y-3">
            {plan.days.map((day, idx) => (
              <div key={day.day} className="card overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                <button
                  onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white"
                         style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)' }}>
                      {day.day}
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: '#5b4fff' }}>TAG {day.day}</p>
                      <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{day.title}</p>
                    </div>
                  </div>
                  {expandedDay === idx
                    ? <ChevronUp size={16} style={{ color: '#9ca3af' }} />
                    : <ChevronDown size={16} style={{ color: '#9ca3af' }} />}
                </button>

                {expandedDay === idx && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Day map + route */}
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                      <div className="p-3 flex items-center justify-between" style={{ background: '#f8f9ff' }}>
                        <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>
                          Route für Tag {day.day}
                        </span>
                        <button
                          onClick={() => openDayRoute(getDayActivities(day), dest)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)', color: '#fff' }}
                        >
                          <ExternalLink size={11} />
                          In Maps öffnen
                        </button>
                      </div>
                    </div>

                    <SlotBlock
                      icon={Sun} label="Morgen" accentColor="#5b4fff" cost={day.morning.cost}
                      name={day.morning.activity} description={day.morning.description} tip={day.morning.tip}
                      placeData={placesData[placeKey(day.day, 'morning')]}
                      placeLoading={isLoading(placeKey(day.day, 'morning'))}
                    />
                    <SlotBlock
                      icon={Coffee} label="Mittagessen" accentColor="#ff6584" cost={day.lunch.cost}
                      name={day.lunch.restaurant} description={day.lunch.description} tip={day.lunch.tip}
                      placeData={placesData[placeKey(day.day, 'lunch')]}
                      placeLoading={isLoading(placeKey(day.day, 'lunch'))}
                    />
                    <SlotBlock
                      icon={Moon} label="Abend" accentColor="#f59e0b" cost={day.evening.cost}
                      name={day.evening.activity} description={day.evening.description} tip={day.evening.tip}
                      placeData={placesData[placeKey(day.day, 'evening')]}
                      placeLoading={isLoading(placeKey(day.day, 'evening'))}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hotel */}
        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#6b7280' }}>
            <Hotel size={13} style={{ color: '#5b4fff' }} />
            Hotel Empfehlung
          </h3>
          <div className="flex items-start justify-between mb-2">
            <p className="font-bold text-base" style={{ color: '#1a1a2e' }}>{plan.hotel_empfehlung.name}</p>
            <div className="text-right">
              <p className="font-black text-lg gradient-text">{plan.hotel_empfehlung.preis_pro_nacht}€</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>/ Nacht</p>
            </div>
          </div>
          <p className="text-sm mb-3" style={{ color: '#6b7280' }}>{plan.hotel_empfehlung.beschreibung}</p>
          <PlaceCard place={placesData['hotel']} loading={isLoading('hotel')} />
          {plan.hotel_empfehlung.tipp && (
            <div className="flex items-start gap-2 text-sm p-3 rounded-xl mt-3" style={{ background: '#ede9ff', color: '#5b4fff' }}>
              <Lightbulb size={14} className="shrink-0 mt-0.5" />
              {plan.hotel_empfehlung.tipp}
            </div>
          )}
        </div>

        {/* Geheimtipps */}
        {plan.geheimtipps.length > 0 && (
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>✨ Geheimtipps</h3>
            <div className="space-y-3">
              {plan.geheimtipps.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                       style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)' }}>
                    {i + 1}
                  </div>
                  <p className="text-sm" style={{ color: '#374151' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport */}
        {plan.transport_tipps.length > 0 && (
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#6b7280' }}>
              <Train size={13} style={{ color: '#5b4fff' }} />
              Transport Tipps
            </h3>
            <div className="space-y-2">
              {plan.transport_tipps.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="font-bold shrink-0" style={{ color: '#5b4fff' }}>→</span>
                  <span style={{ color: '#374151' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        {plan.warnung && (
          <div className="rounded-2xl p-4 flex items-start gap-3"
               style={{ background: '#fff0f3', border: '1px solid #ffc9d4' }}>
            <AlertTriangle size={16} style={{ color: '#ff6584' }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: '#ff6584' }}>Hinweis</p>
              <p className="text-sm" style={{ color: '#6b7280' }}>{plan.warnung}</p>
            </div>
          </div>
        )}

        {/* New trip button */}
        <button
          onClick={onNew}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)', boxShadow: '0 6px 20px rgba(91,79,255,0.3)' }}
        >
          <RefreshCw size={16} />
          Neue Reise planen
        </button>
      </div>
    </div>
  );
}
