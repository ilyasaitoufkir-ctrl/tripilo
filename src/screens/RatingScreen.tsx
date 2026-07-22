import { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import type { SavedTrip, TripRating } from '../types';

interface Props {
  target: SavedTrip | null;
  ratings: TripRating[];
  onSubmit: (rating: TripRating) => void;
}

const ratingLabels = ['', 'Enttäuschend', 'War okay', 'Gut', 'Sehr gut', 'Fantastisch'];

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-3 justify-center py-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform active:scale-90"
        >
          <Star
            size={36}
            fill={s <= active ? '#f59e0b' : 'none'}
            style={{ color: s <= active ? '#f59e0b' : '#e8e8ed' }}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function Textarea({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <p className="section-label mb-2">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl p-3 resize-none outline-none transition-all"
        style={{
          background: '#fafafa',
          border: '1px solid #e8e8ed',
          fontSize: '14px',
          color: '#1c1c1e',
          lineHeight: 1.6,
        }}
        onFocus={(e) => { e.target.style.borderColor = '#8b7cf8'; }}
        onBlur={(e) => { e.target.style.borderColor = '#e8e8ed'; }}
      />
    </div>
  );
}

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
      rating, liked, improved,
      ratedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e8e8ed' }}>
        <p className="section-label mb-1">Tripilo</p>
        <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.5px' }}>
          Bewertungen
        </h1>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Form */}
        {target && !submitted ? (
          <div className="card p-6 space-y-5">
            <div className="text-center pb-2">
              <p style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '4px' }}>
                Wie war deine Reise nach
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.3px' }}>
                {target.plan.destination}
              </h2>
            </div>

            <div>
              <StarRow value={rating} onChange={setRating} />
              <p className="text-center mt-1 transition-all" style={{ fontSize: '14px', fontWeight: 400, color: '#8b7cf8', minHeight: '20px' }}>
                {ratingLabels[rating]}
              </p>
            </div>

            <Textarea
              label="Was hat dir gefallen?"
              value={liked}
              onChange={setLiked}
              placeholder="Tolle Restaurants, schöne Route, gute Geheimtipps..."
            />
            <Textarea
              label="Was können wir verbessern?"
              value={improved}
              onChange={setImproved}
              placeholder="Dein Feedback hilft uns, bessere Pläne zu erstellen..."
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full transition-all active:scale-[0.98]"
              style={{
                background: rating > 0 ? '#8b7cf8' : '#e8e8ed',
                color: rating > 0 ? '#ffffff' : '#aeaeb2',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 500,
                border: 'none',
                cursor: rating > 0 ? 'pointer' : 'default',
              }}
            >
              Bewertung abschicken
            </button>
          </div>
        ) : submitted ? (
          <div className="card p-8 text-center animate-fade-in space-y-3">
            <div className="flex justify-center">
              <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
            </div>
            <p style={{ fontSize: '17px', fontWeight: 500, color: '#1c1c1e' }}>Danke für dein Feedback</p>
            <p style={{ fontSize: '14px', color: '#6e6e73' }}>
              Deine Bewertung hilft uns, bessere Reisepläne zu erstellen.
            </p>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#f0eeff' }}
            >
              <Star size={22} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#1c1c1e', marginBottom: '6px' }}>
              Reise bewerten
            </p>
            <p style={{ fontSize: '14px', color: '#aeaeb2' }}>
              Öffne eine gespeicherte Reise und tippe auf Bewerten.
            </p>
          </div>
        )}

        {/* Past ratings */}
        {ratings.length > 0 && (
          <div>
            <p className="section-label mb-3 px-1">Meine Bewertungen</p>
            <div className="space-y-2">
              {ratings.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: '#1c1c1e' }}>{r.destination}</p>
                      <p style={{ fontSize: '12px', color: '#aeaeb2' }}>
                        {new Date(r.ratedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= r.rating ? '#f59e0b' : 'none'}
                          style={{ color: s <= r.rating ? '#f59e0b' : '#e8e8ed' }}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  {r.liked && (
                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                      <span style={{ color: '#6e6e73' }}>Gefallen: </span>{r.liked}
                    </p>
                  )}
                  {r.improved && (
                    <p style={{ fontSize: '13px', color: '#374151' }}>
                      <span style={{ color: '#6e6e73' }}>Verbesserung: </span>{r.improved}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
