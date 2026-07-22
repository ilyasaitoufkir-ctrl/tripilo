import { Bookmark, Trash2, MapPin, Calendar, Euro, Plane, Star } from 'lucide-react';
import type { SavedTrip } from '../types';

interface Props {
  savedTrips: SavedTrip[];
  onSelect: (trip: SavedTrip) => void;
  onDelete: (id: string) => void;
  onRate: (trip: SavedTrip) => void;
}

const travelTypeEmojis: Record<string, string> = {
  strand: '🏖️', natur: '🏔️', kultur: '🏛️',
  party: '🎉', food: '🍽️', familie: '👨‍👩‍👧',
};

export function SavedTripsScreen({ savedTrips, onSelect, onDelete, onRate }: Props) {
  return (
    <div className="min-h-screen pb-28" style={{ background: '#f8f9ff' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #5b4fff, #8b5cf6)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Bookmark size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Meine Reisen</h1>
        </div>
        <p className="text-sm text-white opacity-70">
          {savedTrips.length} {savedTrips.length === 1 ? 'Reise' : 'Reisen'} gespeichert
        </p>
      </div>

      <div className="px-4 pt-4">
        {savedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                 style={{ background: 'linear-gradient(135deg, #ede9ff, #f0f2ff)' }}>
              <Plane size={40} style={{ color: '#5b4fff' }} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a2e' }}>Noch keine Reisen</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Plane deine erste Reise und speichere sie hier.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedTrips.map((trip, idx) => {
              const types = trip.input.travelTypes ?? (trip.input.travelType ? [trip.input.travelType] : []);
              return (
                <div
                  key={trip.id}
                  className="card overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Click area → show plan */}
                  <button onClick={() => onSelect(trip)} className="w-full p-5 text-left">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-black gradient-text mb-0.5">{trip.plan.destination}</h3>
                        <div className="flex items-center gap-1 text-sm" style={{ color: '#6b7280' }}>
                          <MapPin size={12} />
                          {trip.plan.country}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                           style={{ background: '#ede9ff' }}>
                        <Bookmark size={18} fill="#5b4fff" style={{ color: '#5b4fff' }} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                           style={{ background: '#f0f2ff', color: '#5b4fff' }}>
                        <Calendar size={11} />
                        {trip.input.days} {trip.input.days === 1 ? 'Tag' : 'Tage'}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                           style={{ background: '#f0f2ff', color: '#5b4fff' }}>
                        <Euro size={11} />
                        {trip.input.budget.toLocaleString('de-DE')}€
                      </div>
                      {types.map((t) => (
                        <div key={t} className="px-2 py-1 rounded-full text-xs font-medium"
                             style={{ background: '#f8f9ff', border: '1px solid #e5e7eb', color: '#6b7280' }}>
                          {travelTypeEmojis[t] ?? ''} {t}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {new Date(trip.savedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </button>

                  {/* Actions */}
                  <div className="flex gap-2 px-5 pb-4">
                    <button
                      onClick={() => onRate(trip)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                      style={{ background: '#fff0f3', color: '#ff6584', border: '1px solid #ffc9d4' }}
                    >
                      <Star size={13} />
                      Bewerten
                    </button>
                    <button
                      onClick={() => onDelete(trip.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                      style={{ background: '#fff5f5', color: '#ef4444', border: '1px solid #fecaca' }}
                    >
                      <Trash2 size={13} />
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
