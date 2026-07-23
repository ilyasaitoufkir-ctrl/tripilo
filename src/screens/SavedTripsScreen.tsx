import {
  Bookmark, Trash2, Calendar, Euro, Plane, Star,
  Waves, Mountain, Landmark, Music2, UtensilsCrossed, Users,
  Zap, Sparkles, Trophy, ShoppingBag, Heart, Car, Backpack, Gem,
  Compass, Building2, Snowflake, Ship, Camera, Leaf,
} from 'lucide-react';
import type { SavedTrip } from '../types';

interface Props {
  savedTrips: SavedTrip[];
  onSelect: (trip: SavedTrip) => void;
  onDelete: (id: string) => void;
  onRate: (trip: SavedTrip) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  // current keys
  strand:       Waves,
  natur:        Mountain,
  kultur:       Landmark,
  staedte:      Building2,
  food:         UtensilsCrossed,
  party:        Music2,
  abenteuer:    Zap,
  wellness:     Sparkles,
  sport:        Trophy,
  sportevents:  Zap,
  shopping:     ShoppingBag,
  romantik:     Heart,
  roadtrip:     Car,
  backpacking:  Backpack,
  luxus:        Gem,
  trekking:     Compass,
  familie:      Users,
  festival:     Star,
  tauchen:      Waves,
  ski:          Snowflake,
  // legacy keys
  winter:       Snowflake,
  kreuzfahrt:   Ship,
  fotografie:   Camera,
  yoga:         Leaf,
};

const typeLabels: Record<string, string> = {
  strand:       'Strand & Meer',
  natur:        'Berge & Natur',
  kultur:       'Kultur',
  staedte:      'Städtetrip',
  food:         'Food & Genuss',
  party:        'Party & Nightlife',
  abenteuer:    'Abenteuer',
  wellness:     'Wellness & Spa',
  sport:        'Sporturlaub',
  sportevents:  'Sport Events',
  shopping:     'Shopping',
  romantik:     'Romantik',
  roadtrip:     'Roadtrip',
  backpacking:  'Backpacking',
  luxus:        'Luxusurlaub',
  trekking:     'Trekking',
  familie:      'Familienurlaub',
  festival:     'Festival',
  tauchen:      'Tauchen',
  ski:          'Skiurlaub',
  // legacy
  winter:       'Winter',
  kreuzfahrt:   'Kreuzfahrt',
  fotografie:   'Fotografie',
  yoga:         'Yoga',
};

export function SavedTripsScreen({ savedTrips, onSelect, onDelete, onRate }: Props) {
  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-end justify-between">
          <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.5px' }}>
            Meine Reisen
          </h1>
          <span style={{ fontSize: '13px', color: '#9bb5b0', paddingBottom: '4px' }}>
            {savedTrips.length} gespeichert
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {savedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: '#e8f5f3' }}
            >
              <Plane size={24} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#1a2e2b', marginBottom: '6px' }}>
              Noch keine Reisen
            </p>
            <p style={{ fontSize: '14px', color: '#9bb5b0' }}>
              Plane und speichere deine erste Reise.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedTrips.map((trip, idx) => {
              const types = (trip.input.travelTypes?.length
                ? trip.input.travelTypes
                : trip.input.travelType
                  ? [trip.input.travelType]
                  : []) as string[];
              return (
                <div
                  key={trip.id}
                  className="card overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <button onClick={() => onSelect(trip)} className="w-full p-5 text-left">
                    <div className="flex items-start justify-between mb-1">
                      <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
                        {trip.plan.destination}
                      </h2>
                      <Bookmark size={16} strokeWidth={1.5} fill="#2d8b7a" style={{ color: '#2d8b7a', flexShrink: 0, marginTop: '3px' }} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#9bb5b0', marginBottom: '12px' }}>
                      {trip.plan.country}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                        style={{ background: '#f0f5f4', fontSize: '12px', color: '#6b8a85' }}
                      >
                        <Calendar size={11} strokeWidth={1.5} />
                        {trip.input.days} {trip.input.days === 1 ? 'Tag' : 'Tage'}
                      </span>
                      <span
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                        style={{ background: '#f0f5f4', fontSize: '12px', color: '#6b8a85' }}
                      >
                        <Euro size={11} strokeWidth={1.5} />
                        {trip.input.budget.toLocaleString('de-DE')}€
                      </span>
                      {types.slice(0, 2).map((t) => {
                        const Icon = typeIcons[t];
                        return (
                          <span
                            key={t}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                            style={{ background: '#e8f5f3', fontSize: '12px', color: '#2d8b7a' }}
                          >
                            {Icon && <Icon size={11} strokeWidth={1.5} />}
                            {typeLabels[t] || t}
                          </span>
                        );
                      })}
                    </div>

                    <p style={{ fontSize: '12px', color: '#9bb5b0' }}>
                      {new Date(trip.savedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </button>

                  <div
                    className="flex gap-2 px-5 pb-4"
                    style={{ borderTop: '1px solid #f0f5f4', paddingTop: '12px' }}
                  >
                    <button
                      onClick={() => onRate(trip)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all active:scale-95"
                      style={{ background: '#f0f5f4', border: '1px solid #e0eeec', color: '#6b8a85', fontSize: '13px' }}
                    >
                      <Star size={14} strokeWidth={1.5} />
                      Bewerten
                    </button>
                    <button
                      onClick={() => onDelete(trip.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all active:scale-95"
                      style={{ background: '#fce7f3', border: '1px solid #fbcfe8', color: '#f472b6', fontSize: '13px' }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                      Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
