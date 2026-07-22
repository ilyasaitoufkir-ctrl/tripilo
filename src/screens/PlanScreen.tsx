import { useState, useEffect } from 'react';
import {
  MapPin, Euro, Calendar, Hotel, Lightbulb, AlertTriangle,
  Sun, Coffee, Moon, Bookmark, RefreshCw, ChevronDown, ChevronUp,
  Train, ExternalLink, Star
} from 'lucide-react';
import type { TripPlan, TripInput, DayPlan } from '../types';
import { searchPlace, priceLevelLabel, type PlaceInfo } from '../services/places';

interface Props {
  plan: TripPlan;
  input: TripInput;
  onSave: () => void;
  onNew: () => void;
  isSaved: boolean;
}

type SlotKey = string; // e.g. "1-morning", "1-lunch", "1-evening", "hotel"

function placeKey(day: number, slot: 'morning' | 'lunch' | 'evening'): SlotKey {
  return `${day}-${slot}`;
}

function slotQuery(day: DayPlan, slot: 'morning' | 'lunch' | 'evening', destination: string): string {
  if (slot === 'lunch') return `${day.lunch.restaurant} ${destination}`;
  return `${day[slot].activity} ${destination}`;
}

// ── Place info card shown inside each activity block ──────────────────────────
function PlaceCard({ place, loading }: { place: PlaceInfo | null | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-28 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="p-3 space-y-2">
          <div className="h-3 w-2/3 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
            <MapPin size={11} style={{ color: '#6c63ff' }} className="shrink-0 mt-0.5" />
            <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{place.name}</span>
          </div>
          {place.price_level !== null && (
            <span className="text-xs shrink-0" style={{ color: '#ffd700' }}>
              {priceLevelLabel(place.price_level)}
            </span>
          )}
        </div>

        {place.rating !== null && (
          <div className="flex items-center gap-1 text-xs" style={{ color: '#ffd700' }}>
            <Star size={10} fill="#ffd700" />
            <span className="font-semibold">{place.rating.toFixed(1)}</span>
            {place.total_ratings !== null && (
              <span style={{ color: '#8888aa' }}>
                ({place.total_ratings.toLocaleString('de-DE')} Bewertungen)
              </span>
            )}
          </div>
        )}

        {place.address && (
          <div className="flex items-start gap-1.5 text-xs" style={{ color: '#8888aa' }}>
            <span className="shrink-0">📮</span>
            <span>{place.address}</span>
          </div>
        )}

        <a
          href={place.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg mt-1 transition-all hover:scale-105"
          style={{ background: 'rgba(108,99,255,0.2)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.25)' }}
        >
          <ExternalLink size={11} />
          In Google Maps öffnen
        </a>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function PlanScreen({ plan, input, onSave, onNew, isSaved }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [placesData, setPlacesData] = useState<Record<SlotKey, PlaceInfo | null>>({});
  const [placesLoading, setPlacesLoading] = useState(true);

  const totalBudget = Object.values(plan.budget_breakdown).reduce((a, b) => a + b, 0);
  const dest = plan.destination;

  // Fetch Places for every activity + hotel on mount
  useEffect(() => {
    const queries: { key: SlotKey; query: string }[] = [];

    plan.days.forEach((day) => {
      queries.push({ key: placeKey(day.day, 'morning'), query: slotQuery(day, 'morning', dest) });
      queries.push({ key: placeKey(day.day, 'lunch'),   query: slotQuery(day, 'lunch',   dest) });
      queries.push({ key: placeKey(day.day, 'evening'), query: slotQuery(day, 'evening', dest) });
    });
    queries.push({ key: 'hotel', query: `${plan.hotel_empfehlung.name} ${dest}` });

    Promise.allSettled(
      queries.map(({ key, query }) =>
        searchPlace(query).then((result) => ({ key, result }))
      )
    ).then((results) => {
      const map: Record<SlotKey, PlaceInfo | null> = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') map[r.value.key] = r.value.result;
      });
      setPlacesData(map);
      setPlacesLoading(false);
    });
  }, [plan, dest]);

  // Is a specific slot still loading?
  const isSlotLoading = (key: SlotKey) => placesLoading && !(key in placesData);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Hero Header */}
        <div
          className="relative rounded-3xl overflow-hidden animate-fade-in"
          style={{ border: '1px solid rgba(108,99,255,0.2)' }}
        >
          {/* Destination image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(dest)},travel`}
              alt={dest}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,17,23,0.1), rgba(15,17,23,0.9))' }} />
          </div>

          <div className="p-6" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.15))' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: '#8888aa' }}>
              <MapPin size={14} />
              <span className="text-sm">{plan.country}</span>
            </div>
            <h1 className="text-5xl font-black gradient-text mb-4">{plan.destination}</h1>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm glass-card" style={{ color: '#8888aa' }}>
                <Calendar size={13} style={{ color: '#6c63ff' }} />
                {input.days} {input.days === 1 ? 'Tag' : 'Tage'}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm glass-card" style={{ color: '#8888aa' }}>
                <Euro size={13} style={{ color: '#6c63ff' }} />
                {totalBudget.toLocaleString('de-DE')}€ geplant
              </div>
              <div className="px-3 py-1.5 rounded-full text-sm glass-card" style={{ color: '#ffd700' }}>
                ✨ {plan.beste_reisezeit}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#8888aa' }}>
            <Euro size={14} style={{ color: '#6c63ff' }} />
            BUDGET ÜBERSICHT
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'hotel',        label: 'Hotel',        icon: '🏨' },
              { key: 'essen',        label: 'Essen',        icon: '🍽️' },
              { key: 'aktivitaeten', label: 'Aktivitäten',  icon: '🎯' },
              { key: 'transport',    label: 'Transport',    icon: '✈️' },
            ].map(({ key, label, icon }) => {
              const amount = plan.budget_breakdown[key as keyof typeof plan.budget_breakdown];
              const pct = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
              return (
                <div key={key} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: '#8888aa' }}>{icon} {label}</span>
                    <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{amount.toLocaleString('de-DE')}€</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6c63ff, #ff6584)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Plans */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#8888aa' }}>
            <Calendar size={14} style={{ color: '#6c63ff' }} />
            TAGESPLAN
          </h3>
          {plan.days.map((day, idx) => (
            <div
              key={day.day}
              className="glass-card rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
            >
              <button
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: '#6c63ff' }}>TAG {day.day}</div>
                  <div className="text-base font-semibold" style={{ color: '#ffffff' }}>{day.title}</div>
                </div>
                {expandedDay === idx
                  ? <ChevronUp size={18} style={{ color: '#8888aa' }} />
                  : <ChevronDown size={18} style={{ color: '#8888aa' }} />
                }
              </button>

              {expandedDay === idx && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Morning */}
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun size={14} style={{ color: '#ffd700' }} />
                      <span className="text-xs font-semibold" style={{ color: '#ffd700' }}>MORGEN</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: '#8888aa' }}>{day.morning.cost}€</span>
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#ccccdd' }}>
                      {day.morning.activity}
                    </p>
                    <p className="text-xs mb-2" style={{ color: '#8888aa' }}>{day.morning.description}</p>
                    <PlaceCard
                      place={placesData[placeKey(day.day, 'morning')]}
                      loading={isSlotLoading(placeKey(day.day, 'morning'))}
                    />
                    {day.morning.tip && (
                      <div className="flex items-start gap-1.5 text-xs mt-3" style={{ color: '#6c63ff' }}>
                        <Lightbulb size={11} className="mt-0.5 shrink-0" />
                        {day.morning.tip}
                      </div>
                    )}
                  </div>

                  {/* Lunch */}
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee size={14} style={{ color: '#ff6584' }} />
                      <span className="text-xs font-semibold" style={{ color: '#ff6584' }}>MITTAGESSEN</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: '#8888aa' }}>{day.lunch.cost}€</span>
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#ccccdd' }}>
                      {day.lunch.restaurant}
                    </p>
                    <p className="text-xs mb-2" style={{ color: '#8888aa' }}>{day.lunch.description}</p>
                    <PlaceCard
                      place={placesData[placeKey(day.day, 'lunch')]}
                      loading={isSlotLoading(placeKey(day.day, 'lunch'))}
                    />
                    {day.lunch.tip && (
                      <div className="flex items-start gap-1.5 text-xs mt-3" style={{ color: '#ff6584' }}>
                        <Lightbulb size={11} className="mt-0.5 shrink-0" />
                        {day.lunch.tip}
                      </div>
                    )}
                  </div>

                  {/* Evening */}
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.12)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Moon size={14} style={{ color: '#ffd700' }} />
                      <span className="text-xs font-semibold" style={{ color: '#ffd700' }}>ABEND</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: '#8888aa' }}>{day.evening.cost}€</span>
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#ccccdd' }}>
                      {day.evening.activity}
                    </p>
                    <p className="text-xs mb-2" style={{ color: '#8888aa' }}>{day.evening.description}</p>
                    <PlaceCard
                      place={placesData[placeKey(day.day, 'evening')]}
                      loading={isSlotLoading(placeKey(day.day, 'evening'))}
                    />
                    {day.evening.tip && (
                      <div className="flex items-start gap-1.5 text-xs mt-3" style={{ color: '#ffd700' }}>
                        <Lightbulb size={11} className="mt-0.5 shrink-0" />
                        {day.evening.tip}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hotel Recommendation */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#8888aa' }}>
            <Hotel size={14} style={{ color: '#6c63ff' }} />
            HOTEL EMPFEHLUNG
          </h3>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-lg">{plan.hotel_empfehlung.name}</h4>
            <div className="text-right">
              <div className="font-black text-xl gradient-text">{plan.hotel_empfehlung.preis_pro_nacht}€</div>
              <div className="text-xs" style={{ color: '#8888aa' }}>/ Nacht</div>
            </div>
          </div>
          <p className="text-sm mb-3" style={{ color: '#8888aa' }}>{plan.hotel_empfehlung.beschreibung}</p>

          {/* Hotel Places Card */}
          <PlaceCard
            place={placesData['hotel']}
            loading={isSlotLoading('hotel')}
          />

          {plan.hotel_empfehlung.tipp && (
            <div className="flex items-start gap-2 text-sm p-3 rounded-xl mt-3" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff' }}>
              <Lightbulb size={14} className="mt-0.5 shrink-0" />
              {plan.hotel_empfehlung.tipp}
            </div>
          )}
        </div>

        {/* Geheimtipps */}
        {plan.geheimtipps.length > 0 && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#8888aa' }}>
              ✨ GEHEIMTIPPS
            </h3>
            <div className="space-y-3">
              {plan.geheimtipps.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #6c63ff, #ff6584)', color: '#fff' }}>
                    {i + 1}
                  </div>
                  <span style={{ color: '#ccccdd' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport Tips */}
        {plan.transport_tipps.length > 0 && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#8888aa' }}>
              <Train size={14} style={{ color: '#6c63ff' }} />
              TRANSPORT TIPPS
            </h3>
            <div className="space-y-2">
              {plan.transport_tipps.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#ccccdd' }}>
                  <span style={{ color: '#6c63ff' }}>→</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        {plan.warnung && (
          <div className="rounded-2xl p-5 flex items-start gap-3 animate-fade-in"
            style={{ background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.2)' }}>
            <AlertTriangle size={18} style={{ color: '#ff6584' }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#ff6584' }}>Hinweis</p>
              <p className="text-sm" style={{ color: '#8888aa' }}>{plan.warnung}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={onSave}
            disabled={isSaved}
            className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: isSaved ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.3)',
              color: '#ffd700',
            }}
          >
            <Bookmark size={16} fill={isSaved ? '#ffd700' : 'none'} />
            {isSaved ? 'Gespeichert' : 'Speichern'}
          </button>
          <button
            onClick={onNew}
            className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
              color: '#ffffff',
            }}
          >
            <RefreshCw size={16} />
            Neue Reise
          </button>
        </div>
      </div>
    </div>
  );
}
