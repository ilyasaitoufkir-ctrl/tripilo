import { useState } from 'react';
import {
  MapPin, Euro, Calendar, Hotel, Lightbulb, AlertTriangle,
  Sun, Coffee, Moon, Bookmark, RefreshCw, ChevronDown, ChevronUp, Train
} from 'lucide-react';
import type { TripPlan, TripInput } from '../types';

interface Props {
  plan: TripPlan;
  input: TripInput;
  onSave: () => void;
  onNew: () => void;
  isSaved: boolean;
}

export function PlanScreen({ plan, input, onSave, onNew, isSaved }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const totalBudget = Object.values(plan.budget_breakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Hero Header */}
        <div
          className="relative rounded-3xl p-8 overflow-hidden animate-fade-in"
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.2))', border: '1px solid rgba(108,99,255,0.2)' }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: '#6c63ff' }} />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: '#ff6584' }} />
          </div>
          <div className="relative z-10">
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
              { key: 'hotel', label: 'Hotel', icon: '🏨' },
              { key: 'essen', label: 'Essen', icon: '🍽️' },
              { key: 'aktivitaeten', label: 'Aktivitäten', icon: '🎯' },
              { key: 'transport', label: 'Transport', icon: '✈️' },
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
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6c63ff, #ff6584)' }}
                    />
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
                    <p className="font-semibold text-sm mb-1">{day.morning.activity}</p>
                    <p className="text-xs mb-2" style={{ color: '#8888aa' }}>{day.morning.description}</p>
                    {day.morning.tip && (
                      <div className="flex items-start gap-1.5 text-xs" style={{ color: '#6c63ff' }}>
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
                    <p className="font-semibold text-sm mb-1">{day.lunch.restaurant}</p>
                    <p className="text-xs mb-2" style={{ color: '#8888aa' }}>{day.lunch.description}</p>
                    {day.lunch.tip && (
                      <div className="flex items-start gap-1.5 text-xs" style={{ color: '#ff6584' }}>
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
                    <p className="font-semibold text-sm mb-1">{day.evening.activity}</p>
                    <p className="text-xs mb-2" style={{ color: '#8888aa' }}>{day.evening.description}</p>
                    {day.evening.tip && (
                      <div className="flex items-start gap-1.5 text-xs" style={{ color: '#ffd700' }}>
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
          {plan.hotel_empfehlung.tipp && (
            <div className="flex items-start gap-2 text-sm p-3 rounded-xl" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff' }}>
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
