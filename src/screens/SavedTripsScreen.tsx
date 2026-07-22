import { Bookmark, Trash2, MapPin, Calendar, Euro, ArrowLeft, Plane } from 'lucide-react';
import type { SavedTrip } from '../types';

interface Props {
  savedTrips: SavedTrip[];
  onSelect: (trip: SavedTrip) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function SavedTripsScreen({ savedTrips, onSelect, onDelete, onBack }: Props) {
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
            <h1 className="text-2xl font-bold gradient-text">Gespeicherte Reisen</h1>
            <p className="text-sm" style={{ color: '#8888aa' }}>
              {savedTrips.length} {savedTrips.length === 1 ? 'Reise' : 'Reisen'} gespeichert
            </p>
          </div>
        </div>

        {savedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 opacity-30"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #ff6584)' }}
            >
              <Plane size={48} className="text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#8888aa' }}>Noch keine Reisen</h3>
            <p className="text-sm" style={{ color: '#555577' }}>
              Plane deine erste Reise und speichere sie hier.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedTrips.map((trip, idx) => (
              <div
                key={trip.id}
                className="glass-card rounded-2xl overflow-hidden animate-fade-in group"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <button
                  onClick={() => onSelect(trip)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-black gradient-text mb-0.5">{trip.plan.destination}</h3>
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: '#8888aa' }}>
                        <MapPin size={12} />
                        {trip.plan.country}
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6c63ff22, #ff658422)' }}
                    >
                      <Bookmark size={16} fill="#ffd700" style={{ color: '#ffd700' }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff' }}>
                      <Calendar size={11} />
                      {trip.input.days} {trip.input.days === 1 ? 'Tag' : 'Tage'}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff' }}>
                      <Euro size={11} />
                      {trip.input.budget.toLocaleString('de-DE')}€
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(108,99,255,0.1)', color: '#8888aa' }}>
                      {trip.input.persons} {trip.input.persons === 1 ? 'Person' : 'Personen'}
                    </div>
                  </div>

                  <p className="text-xs mt-3" style={{ color: '#555577' }}>
                    Gespeichert am {new Date(trip.savedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </button>

                <div className="flex justify-end px-6 pb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(trip.id);
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ color: '#ff6584', background: 'rgba(255,101,132,0.08)' }}
                  >
                    <Trash2 size={12} />
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
