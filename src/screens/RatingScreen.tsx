import { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, Send, Inbox } from 'lucide-react';
import type { SavedTrip, TripRating } from '../types';

interface Props {
  target: SavedTrip | null;
  ratings: TripRating[];
  onSubmit: (rating: TripRating) => void;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-all hover:scale-110 active:scale-95"
        >
          <Star
            size={40}
            fill={star <= active ? '#f59e0b' : 'none'}
            style={{ color: star <= active ? '#f59e0b' : '#d1d5db' }}
            strokeWidth={star <= active ? 0 : 1.5}
          />
        </button>
      ))}
    </div>
  );
}

const ratingLabels = ['', 'Enttäuschend', 'Okay', 'Gut', 'Sehr gut', 'Fantastisch! 🎉'];

export function RatingScreen({ target, ratings, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState('');
  const [improved, setImproved] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!target || rating === 0) return;
    onSubmit({
      id: Date.now().toString(),
      tripId: target.id,
      destination: target.plan.destination,
      rating,
      liked,
      improved,
      ratedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f8f9ff' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #ff6584, #f97316)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Star size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Bewertungen</h1>
        </div>
        <p className="text-sm text-white opacity-70">
          Wie war deine Reise?
        </p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Rating form */}
        {target && !submitted ? (
          <div className="card p-6">
            {/* Destination */}
            <div className="text-center mb-6">
              <p className="text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>Wie war deine Reise nach</p>
              <h2 className="text-2xl font-black gradient-text">{target.plan.destination}?</h2>
            </div>

            {/* Stars */}
            <div className="mb-2">
              <StarRating value={rating} onChange={setRating} />
            </div>
            <p className="text-center text-sm font-semibold mb-6 min-h-[20px] transition-all" style={{ color: '#5b4fff' }}>
              {ratingLabels[rating]}
            </p>

            {/* Liked */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
                  <ThumbsUp size={12} style={{ color: '#16a34a' }} />
                </div>
                Was hat dir gefallen?
              </label>
              <textarea
                value={liked}
                onChange={(e) => setLiked(e.target.value)}
                placeholder="z.B. Tolle Restaurants, perfekte Route, gute Geheimtipps..."
                rows={3}
                className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-all"
                style={{
                  background: '#f8f9ff',
                  border: '2px solid #e5e7eb',
                  color: '#1a1a2e',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#5b4fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
              />
            </div>

            {/* Improved */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#fff0f3' }}>
                  <MessageCircle size={12} style={{ color: '#ff6584' }} />
                </div>
                Was können wir verbessern?
              </label>
              <textarea
                value={improved}
                onChange={(e) => setImproved(e.target.value)}
                placeholder="Dein Feedback hilft uns, bessere Reisepläne zu erstellen..."
                rows={3}
                className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-all"
                style={{
                  background: '#f8f9ff',
                  border: '2px solid #e5e7eb',
                  color: '#1a1a2e',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#5b4fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: rating > 0 ? 'linear-gradient(135deg, #5b4fff, #8b5cf6)' : '#e5e7eb',
                color: rating > 0 ? '#fff' : '#9ca3af',
                boxShadow: rating > 0 ? '0 6px 20px rgba(91,79,255,0.3)' : 'none',
              }}
            >
              <Send size={18} />
              Bewertung abschicken
            </button>
          </div>
        ) : submitted ? (
          <div className="card p-8 text-center animate-fade-in">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-black mb-2" style={{ color: '#1a1a2e' }}>Danke für dein Feedback!</h3>
            <p className="text-sm" style={{ color: '#6b7280' }}>Deine Bewertung hilft uns, bessere Reisepläne zu erstellen.</p>
          </div>
        ) : (
          /* No target selected */
          <div className="card p-8 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                 style={{ background: '#fff0f3' }}>
              <Star size={36} style={{ color: '#ff6584' }} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a2e' }}>Reise bewerten</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Öffne eine gespeicherte Reise und tippe auf „Bewerten".
            </p>
          </div>
        )}

        {/* Past ratings */}
        {ratings.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#6b7280' }}>
              <Inbox size={13} style={{ color: '#5b4fff' }} />
              Meine Bewertungen ({ratings.length})
            </h3>
            <div className="space-y-3">
              {ratings.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm gradient-text">{r.destination}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>
                        {new Date(r.ratedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= r.rating ? '#f59e0b' : 'none'}
                          style={{ color: s <= r.rating ? '#f59e0b' : '#d1d5db' }}
                          strokeWidth={s <= r.rating ? 0 : 1.5}
                        />
                      ))}
                    </div>
                  </div>
                  {r.liked && <p className="text-xs mb-1" style={{ color: '#374151' }}>👍 {r.liked}</p>}
                  {r.improved && <p className="text-xs" style={{ color: '#6b7280' }}>💬 {r.improved}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
