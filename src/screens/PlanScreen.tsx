import { useState, useEffect } from 'react';
import {
  Euro, Calendar, Lightbulb, AlertCircle,
  Sun, Coffee, Moon, Bookmark, RefreshCw, ChevronDown, ChevronUp,
  Train, ExternalLink, Star, Share2, Check, Hotel,
  Building2, UtensilsCrossed, Compass, Plane,
  Phone, Globe, Navigation, MapPin, Package, Download,
} from 'lucide-react';
import type { TripPlan, TripInput, DayPlan } from '../types';
import { searchPlace, priceLevelLabel, type PlaceInfo } from '../services/places';
import { getFlightLinks, getHotelLinks, getFlightFallback } from '../services/booking';
import { getActivityImage, getDestinationImage, getMatchingImage, getRestaurantImage, getHotelImage } from '../services/images';
import { openDayRoute } from '../components/MapView';

interface Weather {
  temp: number;
  desc: string;
  icon: string;
  wind: number;
}

interface Props {
  plan: TripPlan;
  input: TripInput;
  onSave: () => void;
  onNew: () => void;
  onRate: () => void;
  onPacking: () => void;
  isSaved: boolean;
}

type SlotKey = string;
const placeKey = (day: number, slot: 'morning' | 'lunch' | 'evening') => `${day}-${slot}`;
const slotQuery = (day: DayPlan, slot: 'morning' | 'lunch' | 'evening') =>
  slot === 'lunch' ? day.lunch.restaurant : day[slot].activity;

function Divider() {
  return <div style={{ height: '1px', background: '#f5f5f7', margin: '12px 0' }} />;
}

// ── Place card ─────────────────────────────────────────────────────────────────
function PlaceCard({
  place, loading, showActions = false, fallbackSrc,
}: {
  place: PlaceInfo | null | undefined;
  loading: boolean;
  showActions?: boolean;
  fallbackSrc?: string;
}) {
  if (loading) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden">
        <div className="skeleton h-24 w-full" />
        <div className="p-3 space-y-2">
          <div className="skeleton h-2.5 w-1/2" />
          <div className="skeleton h-2.5 w-1/3" />
        </div>
      </div>
    );
  }
  if (!place) return null;

  const todayText = place.opening_hours?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid #e8e8ed' }}>
      {(place.photo ?? fallbackSrc) && (
        <img
          src={place.photo ?? fallbackSrc}
          alt={place.name}
          className="w-full h-36 object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1e' }}>{place.name}</p>
          {place.price_level !== null && (
            <span style={{ fontSize: '12px', color: '#8b7cf8', fontWeight: 500, flexShrink: 0 }}>
              {priceLevelLabel(place.price_level)}
            </span>
          )}
        </div>

        {place.rating !== null && (
          <div className="flex items-center gap-1">
            <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} strokeWidth={0} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#1c1c1e' }}>
              {place.rating.toFixed(1)}
            </span>
            {place.total_ratings !== null && (
              <span style={{ fontSize: '12px', color: '#aeaeb2' }}>
                ({place.total_ratings.toLocaleString('de-DE')} Bewertungen)
              </span>
            )}
          </div>
        )}

        {place.address && (
          <div className="flex items-start gap-1">
            <MapPin size={11} strokeWidth={1.5} style={{ color: '#aeaeb2', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: '#6e6e73' }}>{place.address}</p>
          </div>
        )}

        {place.phone && (
          <div className="flex items-center gap-1">
            <Phone size={11} strokeWidth={1.5} style={{ color: '#aeaeb2' }} />
            <a
              href={`tel:${place.phone}`}
              style={{ fontSize: '12px', color: '#6e6e73', textDecoration: 'none' }}
            >
              {place.phone}
            </a>
          </div>
        )}

        {todayText && (
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '11px', color: '#aeaeb2' }}>Heute:</span>
            <span style={{ fontSize: '11px', color: '#6e6e73' }}>
              {todayText.replace(/^[^:]+:\s*/, '')}
            </span>
          </div>
        )}

        {/* Action buttons */}
        {showActions ? (
          <div className="flex gap-2 pt-1">
            <a
              href={place.navigation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all active:scale-95"
              style={{ background: '#f0eeff', border: '1px solid #c4b5fd', color: '#8b7cf8', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
            >
              <Navigation size={12} strokeWidth={1.5} />
              Navigation
            </a>
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all active:scale-95"
                style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', color: '#6e6e73', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
              >
                <Phone size={12} strokeWidth={1.5} />
                Anrufen
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all active:scale-95"
                style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', color: '#6e6e73', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
              >
                <Globe size={12} strokeWidth={1.5} />
                Website
              </a>
            )}
          </div>
        ) : (
          <a
            href={place.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-0.5"
            style={{ fontSize: '12px', fontWeight: 500, color: '#8b7cf8', textDecoration: 'none' }}
          >
            <ExternalLink size={11} strokeWidth={1.5} />
            In Google Maps öffnen
          </a>
        )}
      </div>
    </div>
  );
}

// ── Activity slot ──────────────────────────────────────────────────────────────
function SlotBlock({
  icon: Icon, label, labelColor, cost, name, description, tip,
  placeData, placeLoading, bg, isRestaurant, imageSrc, placeFallbackSrc,
}: {
  icon: React.ElementType; label: string; labelColor: string; cost: number;
  name: string; description: string; tip?: string;
  placeData: PlaceInfo | null | undefined; placeLoading: boolean; bg: string;
  isRestaurant?: boolean; imageSrc?: string; placeFallbackSrc?: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={name}
          className="w-full object-cover"
          style={{ height: '140px' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="p-4" style={{ background: bg }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon size={15} strokeWidth={1.5} style={{ color: labelColor }} />
            <span className="section-label" style={{ color: labelColor }}>{label}</span>
          </div>
          <span style={{ fontSize: '13px', color: '#aeaeb2' }}>{cost}€</span>
        </div>
        <p style={{ fontSize: '15px', fontWeight: 500, color: '#1c1c1e', marginBottom: '2px' }}>{name}</p>
        <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: 1.5 }}>{description}</p>
        <PlaceCard place={placeData} loading={placeLoading} showActions={isRestaurant} fallbackSrc={placeFallbackSrc} />
        {tip && (
          <div
            className="flex items-start gap-2 mt-3 p-2.5 rounded-xl"
            style={{ background: 'rgba(139,124,248,0.06)' }}
          >
            <Lightbulb size={13} strokeWidth={1.5} style={{ color: '#8b7cf8', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: 1.5 }}>{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Booking link button ────────────────────────────────────────────────────────
function BookingLink({
  href, label, icon: Icon,
}: {
  href: string; label: string; icon: React.ElementType;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
      style={{ background: '#fafafa', border: '1px solid #e8e8ed', textDecoration: 'none' }}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
        <span style={{ fontSize: '14px', color: '#1c1c1e', fontWeight: 400 }}>{label}</span>
      </div>
      <ExternalLink size={13} strokeWidth={1.5} style={{ color: '#aeaeb2' }} />
    </a>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function PlanScreen({ plan, input, onSave, onNew, onRate, onPacking, isSaved }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [placesData, setPlacesData] = useState<Record<SlotKey, PlaceInfo | null>>({});
  const [placesLoading, setPlacesLoading] = useState(true);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [heroImage, setHeroImage] = useState<string>(() => getDestinationImage(plan.destination));
  const [weather, setWeather] = useState<Weather | null>(null);
  const [slotImages, setSlotImages] = useState<Record<string, string>>({});

  const totalBudget = Object.values(plan.budget_breakdown).reduce((a, b) => a + b, 0);
  const dest = plan.destination;

  // Booking — always compute dates; fall back to today + trip length when not entered
  const from = input.departureCity;
  const checkin = input.departureDate || new Date().toISOString().split('T')[0];
  const checkout = input.returnDate || (() => {
    const d = new Date(checkin);
    d.setDate(d.getDate() + input.days);
    return d.toISOString().split('T')[0];
  })();

  // Hotels always have dates; flights need a departure city
  const hotelLinks = getHotelLinks(dest, checkin, checkout, input.persons);
  const flightLinks = from
    ? getFlightLinks(from, dest, checkin, checkout, input.persons)
    : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });

  // Load async hero image via Unsplash search
  useEffect(() => {
    getMatchingImage(dest, dest, 'city').then(setHeroImage);
  }, [dest]);

  // Load all slot images in parallel via Unsplash search
  useEffect(() => {
    type Entry = { key: string; subject: string; type: 'activity' | 'restaurant' | 'hotel' | 'city' };
    const entries: Entry[] = [];
    plan.days.forEach((day) => {
      entries.push({ key: `morning-${day.day}`, subject: day.morning.activity, type: 'activity' });
      entries.push({ key: `lunch-${day.day}`,   subject: day.lunch.restaurant,  type: 'restaurant' });
      entries.push({ key: `evening-${day.day}`, subject: day.evening.activity,  type: 'activity' });
    });
    plan.geheimtipps.forEach((tip, i) => {
      entries.push({ key: `geheimtipp-${i}`, subject: tip, type: 'activity' });
    });
    entries.push({ key: 'hotel', subject: plan.hotel_empfehlung.name, type: 'hotel' });

    Promise.all(
      entries.map(({ key, subject, type }) =>
        getMatchingImage(subject, dest, type).then((url) => ({ key, url }))
      )
    ).then((results) => {
      setSlotImages(Object.fromEntries(results.map(({ key, url }) => [key, url])));
    });
  }, [plan, dest]);

  // Load weather
  useEffect(() => {
    const key = import.meta.env.VITE_WEATHER_KEY as string;
    if (!key) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(dest)}&appid=${key}&units=metric&lang=de`)
      .then((r) => r.json())
      .then((data) => {
        if (data.weather?.[0]) {
          setWeather({
            temp: Math.round(data.main.temp),
            desc: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            wind: Math.round(data.wind.speed),
          });
        }
      })
      .catch(() => {});
  }, [dest]);

  // Story export
  const exportAsStory = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      // Overlay
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, 1080, 1920);
      // Logo
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '400 36px Arial, sans-serif';
      ctx.fillText('Tripsilo', 80, 120);
      // Destination
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${dest.length > 10 ? '80' : '100'}px Arial, sans-serif`;
      ctx.fillText(dest, 80, 360);
      // Country
      ctx.font = '400 44px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(plan.country, 80, 430);
      // Highlights
      ctx.font = '400 38px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      plan.days.slice(0, 4).forEach((day, i) => {
        ctx.fillText(`→ ${day.morning.activity}`, 80, 600 + i * 90);
      });
      // Budget badge
      ctx.fillStyle = '#8b7cf8';
      ctx.beginPath();
      ctx.roundRect(80, 1680, 500, 80, 40);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 36px Arial, sans-serif';
      ctx.fillText(`${input.budget.toLocaleString('de-DE')}€ · ${input.days} Tage`, 110, 1730);
      // Download
      const link = document.createElement('a');
      link.download = `tripsilo-${dest.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Scale + center crop
      const scale = Math.max(1080 / img.width, 1920 / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (1080 - sw) / 2, (1920 - sh) / 2, sw, sh);
      draw();
    };
    img.onerror = () => {
      ctx.fillStyle = '#1c1c1e';
      ctx.fillRect(0, 0, 1080, 1920);
      draw();
    };
    img.src = heroImage;
  };

  useEffect(() => {
    const queries: { key: SlotKey; query: string }[] = [];
    plan.days.forEach((day) => {
      queries.push({ key: placeKey(day.day, 'morning'), query: slotQuery(day, 'morning') });
      queries.push({ key: placeKey(day.day, 'lunch'),   query: slotQuery(day, 'lunch') });
      queries.push({ key: placeKey(day.day, 'evening'), query: slotQuery(day, 'evening') });
    });
    queries.push({ key: 'hotel', query: plan.hotel_empfehlung.name });
    Promise.allSettled(
      queries.map(({ key, query }) => searchPlace(query, dest).then((r) => ({ key, result: r })))
    ).then((results) => {
      const map: Record<SlotKey, PlaceInfo | null> = {};
      results.forEach((r) => { if (r.status === 'fulfilled') map[r.value.key] = r.value.result; });
      setPlacesData(map);
      setPlacesLoading(false);
    });
  }, [plan, dest]);

  const isLoading = (key: SlotKey) => placesLoading && !(key in placesData);

  const handleShare = async () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify({ plan, input })));
      const url = `${window.location.origin}${window.location.pathname}#share/${encoded}`;
      if (navigator.share) {
        await navigator.share({ title: `Reiseplan: ${dest}`, text: `Mein Tripsilo-Plan für ${dest}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2500);
      }
    } catch { /* cancelled */ }
  };

  const getDayActivities = (day: DayPlan) =>
    [day.morning.activity, day.lunch.restaurant, day.evening.activity];

  const budgetItems = [
    { key: 'hotel', label: 'Hotel', icon: Building2 },
    { key: 'essen', label: 'Essen', icon: UtensilsCrossed },
    { key: 'aktivitaeten', label: 'Aktivitäten', icon: Compass },
    { key: 'transport', label: 'Transport', icon: Plane },
  ] as const;

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Hero photo */}
      <img
        src={heroImage}
        alt={dest}
        className="w-full object-cover"
        style={{ height: '220px' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />

      {/* Destination info */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #e8e8ed' }}>
        <p style={{ fontSize: '13px', color: '#aeaeb2', marginBottom: '2px' }}>{plan.country}</p>
        <div className="flex items-start justify-between gap-3">
          <h1 style={{ fontSize: '28px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.5px', marginBottom: '10px' }}>
            {plan.destination}
          </h1>
          {weather && (
            <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
              <img src={weather.icon} alt={weather.desc} style={{ width: '36px', height: '36px' }} />
              <div>
                <p style={{ fontSize: '18px', fontWeight: 500, color: '#1c1c1e', lineHeight: 1 }}>{weather.temp}°</p>
                <p style={{ fontSize: '11px', color: '#aeaeb2', marginTop: '1px' }}>{weather.desc}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Calendar, text: `${input.days} ${input.days === 1 ? 'Tag' : 'Tage'}` },
            { icon: Euro, text: `${totalBudget.toLocaleString('de-DE')}€` },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: '#f0eeff', fontSize: '13px', fontWeight: 400, color: '#8b7cf8' }}
            >
              <Icon size={13} strokeWidth={1.5} />
              {text}
            </span>
          ))}
          <span
            className="px-3 py-1 rounded-full"
            style={{ background: '#f5f5f7', fontSize: '13px', color: '#6e6e73' }}
          >
            {plan.beste_reisezeit}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Actions row 1 */}
        <div className="flex gap-2">
          {[
            {
              label: isSaved ? 'Gespeichert' : 'Speichern',
              icon: Bookmark,
              onClick: onSave,
              disabled: isSaved,
              bg: isSaved ? '#f0eeff' : '#fafafa',
              color: '#8b7cf8',
              border: '#c4b5fd',
            },
            {
              label: shareState === 'copied' ? 'Kopiert' : 'Teilen',
              icon: shareState === 'copied' ? Check : Share2,
              onClick: handleShare,
              disabled: false,
              bg: '#fafafa',
              color: '#6e6e73',
              border: '#e8e8ed',
            },
            {
              label: 'Bewerten',
              icon: Star,
              onClick: onRate,
              disabled: false,
              bg: '#fafafa',
              color: '#6e6e73',
              border: '#e8e8ed',
            },
          ].map(({ label, icon: Icon, onClick, disabled, bg, color, border }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
              style={{ background: bg, border: `1px solid ${border}`, color, fontSize: '13px', fontWeight: 400, cursor: disabled ? 'default' : 'pointer' }}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        {/* Actions row 2 */}
        <div className="flex gap-2">
          <button
            onClick={onPacking}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: '#f0eeff', border: '1px solid #c4b5fd', color: '#8b7cf8', fontSize: '13px', fontWeight: 400, cursor: 'pointer' }}
          >
            <Package size={15} strokeWidth={1.5} />
            Packliste
          </button>
          <button
            onClick={exportAsStory}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: '#fafafa', border: '1px solid #e8e8ed', color: '#6e6e73', fontSize: '13px', fontWeight: 400, cursor: 'pointer' }}
          >
            <Download size={15} strokeWidth={1.5} />
            Story Export
          </button>
        </div>

        {/* Budget */}
        <div className="card p-5">
          <p className="section-label mb-4">Budget</p>
          <div className="grid grid-cols-2 gap-2">
            {budgetItems.map(({ key, label, icon: Icon }) => {
              const amount = plan.budget_breakdown[key as keyof typeof plan.budget_breakdown];
              const pct = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
              return (
                <div key={key} className="p-3 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f0f0f5' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={13} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
                    <span style={{ fontSize: '12px', color: '#6e6e73' }}>{label}</span>
                    <span className="ml-auto" style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1e' }}>
                      {amount.toLocaleString('de-DE')}€
                    </span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: '3px', background: '#e8e8ed' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#8b7cf8' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Days */}
        <div>
          <p className="section-label mb-3 px-1">Tagesplan</p>
          <div className="space-y-2">
            {plan.days.map((day, idx) => (
              <div
                key={day.day}
                className="card overflow-hidden animate-fade-in"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0eeff' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#8b7cf8' }}>{day.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '11px', color: '#aeaeb2', marginBottom: '1px' }}>Tag {day.day}</p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1c1c1e' }} className="truncate">{day.title}</p>
                  </div>
                  {expandedDay === idx
                    ? <ChevronUp size={16} strokeWidth={1.5} style={{ color: '#aeaeb2', flexShrink: 0 }} />
                    : <ChevronDown size={16} strokeWidth={1.5} style={{ color: '#aeaeb2', flexShrink: 0 }} />
                  }
                </button>

                {expandedDay === idx && (
                  <div className="px-4 pb-4 space-y-2">
                    {/* Tagesroute */}
                    <button
                      onClick={() => openDayRoute(getDayActivities(day), dest)}
                      className="w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98]"
                      style={{ background: '#fafafa', border: '1px solid #e8e8ed' }}
                    >
                      <span style={{ fontSize: '13px', color: '#6e6e73' }}>Tagesroute öffnen</span>
                      <span className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 500, color: '#8b7cf8' }}>
                        <Navigation size={12} strokeWidth={1.5} />
                        Google Maps
                      </span>
                    </button>

                    <SlotBlock
                      icon={Sun} label="Morgen" labelColor="#8b7cf8" bg="#f0eeff"
                      cost={day.morning.cost} name={day.morning.activity}
                      description={day.morning.description} tip={day.morning.tip}
                      placeData={placesData[placeKey(day.day, 'morning')]}
                      placeLoading={isLoading(placeKey(day.day, 'morning'))}
                      imageSrc={slotImages[`morning-${day.day}`] ?? getActivityImage(day.morning.activity, dest)}
                    />
                    <SlotBlock
                      icon={Coffee} label="Mittag" labelColor="#f472b6" bg="#fce7f3"
                      cost={day.lunch.cost} name={day.lunch.restaurant}
                      description={day.lunch.description} tip={day.lunch.tip}
                      placeData={placesData[placeKey(day.day, 'lunch')]}
                      placeLoading={isLoading(placeKey(day.day, 'lunch'))}
                      isRestaurant
                      placeFallbackSrc={slotImages[`lunch-${day.day}`] ?? getRestaurantImage(day.lunch.restaurant, dest)}
                    />
                    <SlotBlock
                      icon={Moon} label="Abend" labelColor="#6e6e73" bg="#f5f5f7"
                      cost={day.evening.cost} name={day.evening.activity}
                      description={day.evening.description} tip={day.evening.tip}
                      placeData={placesData[placeKey(day.day, 'evening')]}
                      placeLoading={isLoading(placeKey(day.day, 'evening'))}
                      imageSrc={slotImages[`evening-${day.day}`] ?? getActivityImage(day.evening.activity, dest)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hotel */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Hotel size={16} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
            <p className="section-label">Hotel</p>
          </div>
          <div className="flex items-start justify-between mb-1">
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#1c1c1e' }}>{plan.hotel_empfehlung.name}</p>
            <div className="text-right">
              <p style={{ fontSize: '18px', fontWeight: 500, color: '#8b7cf8' }}>{plan.hotel_empfehlung.preis_pro_nacht}€</p>
              <p style={{ fontSize: '11px', color: '#aeaeb2' }}>/ Nacht</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: 1.5 }}>{plan.hotel_empfehlung.beschreibung}</p>
          <PlaceCard place={placesData['hotel']} loading={isLoading('hotel')} showActions fallbackSrc={slotImages['hotel'] ?? getHotelImage(dest)} />
          {plan.hotel_empfehlung.tipp && (
            <div className="flex items-start gap-2 mt-3 p-2.5 rounded-xl" style={{ background: '#f0eeff' }}>
              <Lightbulb size={13} strokeWidth={1.5} style={{ color: '#8b7cf8', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#6e6e73' }}>{plan.hotel_empfehlung.tipp}</p>
            </div>
          )}
          {/* Booking links */}
          <div className="space-y-2 mt-3">
            <BookingLink href={hotelLinks.booking} label="Auf Booking.com suchen" icon={Hotel} />
            <BookingLink href={hotelLinks.hotels} label="Auf Hotels.com suchen" icon={Building2} />
            <BookingLink href={hotelLinks.trivago} label="Auf Trivago vergleichen" icon={Compass} />
          </div>
        </div>

        {/* Geheimtipps */}
        {plan.geheimtipps.length > 0 && (
          <div className="card p-5">
            <p className="section-label mb-4">Geheimtipps</p>
            <div className="space-y-3">
              {plan.geheimtipps.map((tip, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8e8ed' }}>
                  <img
                    src={slotImages[`geheimtipp-${i}`] ?? getActivityImage(tip, dest)}
                    alt={tip}
                    className="w-full object-cover"
                    style={{ height: '120px' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex items-start gap-3 p-3">
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#8b7cf8', flexShrink: 0, marginTop: '2px', width: '14px' }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport */}
        {plan.transport_tipps.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Train size={15} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
              <p className="section-label">Transport</p>
            </div>
            <div className="space-y-2">
              {plan.transport_tipps.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: '#8b7cf8', fontSize: '14px', flexShrink: 0 }}>–</span>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        {plan.warnung && (
          <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <AlertCircle size={16} strokeWidth={1.5} style={{ color: '#f472b6', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#f472b6', marginBottom: '2px' }}>Hinweis</p>
              <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: 1.5 }}>{plan.warnung}</p>
            </div>
          </div>
        )}

        {/* Booking summary */}
        <div className="card p-5">
          <p className="section-label mb-4">Reise buchen</p>

          {/* Flights */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Plane size={13} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1e' }}>Flüge</p>
            </div>
            {from && (
              <p style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '2px' }}>
                {from} → {dest}
              </p>
            )}
            {checkin && checkout && (
              <p style={{ fontSize: '12px', color: '#aeaeb2', marginBottom: '10px' }}>
                {formatDate(checkin)} – {formatDate(checkout)} · {input.persons} {input.persons === 1 ? 'Person' : 'Personen'}
              </p>
            )}
            <div className="space-y-2">
              <BookingLink
                href={flightLinks?.google ?? getFlightFallback(dest, input.persons)}
                label="Google Flights"
                icon={Plane}
              />
              {flightLinks ? (
                <>
                  <BookingLink href={flightLinks.skyscanner} label="Skyscanner" icon={Compass} />
                  <BookingLink href={flightLinks.kayak} label="Kayak" icon={Navigation} />
                </>
              ) : (
                <p style={{ fontSize: '12px', color: '#aeaeb2', paddingTop: '4px' }}>
                  Abflugstadt und Reisedaten eingeben für mehr Optionen
                </p>
              )}
            </div>
          </div>

          <Divider />

          {/* Hotel */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Hotel size={13} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1c1c1e' }}>Hotels</p>
            </div>
            <p style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '2px' }}>
              {dest}
              {checkin && checkout && ` · ${input.days} ${input.days === 1 ? 'Nacht' : 'Nächte'}`}
              {` · ${input.persons} ${input.persons === 1 ? 'Person' : 'Personen'}`}
            </p>
            {checkin && checkout && (
              <p style={{ fontSize: '12px', color: '#aeaeb2', marginBottom: '10px' }}>
                {formatDate(checkin)} – {formatDate(checkout)}
              </p>
            )}
            <div className="space-y-2">
              <BookingLink href={hotelLinks.booking} label="Booking.com" icon={Hotel} />
              <BookingLink href={hotelLinks.hotels} label="Hotels.com" icon={Building2} />
              <BookingLink href={hotelLinks.trivago} label="Trivago" icon={Compass} />
            </div>
          </div>

          <Divider />

          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={isSaved}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              style={{ background: isSaved ? '#f0eeff' : '#fafafa', border: '1px solid #c4b5fd', color: '#8b7cf8', fontSize: '13px', fontWeight: 400, cursor: isSaved ? 'default' : 'pointer' }}
            >
              <Bookmark size={14} strokeWidth={1.5} />
              {isSaved ? 'Gespeichert' : 'Speichern'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ background: '#fafafa', border: '1px solid #e8e8ed', color: '#6e6e73', fontSize: '13px', fontWeight: 400, cursor: 'pointer' }}
            >
              {shareState === 'copied' ? <Check size={14} strokeWidth={1.5} /> : <Share2 size={14} strokeWidth={1.5} />}
              {shareState === 'copied' ? 'Kopiert' : 'Teilen'}
            </button>
          </div>
        </div>

        <Divider />

        {/* New trip */}
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: '#fafafa', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 400, color: '#6e6e73', cursor: 'pointer' }}
        >
          <RefreshCw size={15} strokeWidth={1.5} />
          Neue Reise planen
        </button>
      </div>
    </div>
  );
}
