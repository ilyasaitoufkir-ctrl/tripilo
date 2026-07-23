import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Package, Check } from 'lucide-react';
import type { TripPlan, TripInput, PackingCategory, PackingItem } from '../types';

interface Props {
  plan: TripPlan;
  input: TripInput;
  onBack: () => void;
}

const STORAGE_KEY = (dest: string, days: number) => `tripsilo_packing_${dest}_${days}d`;

async function generatePackingList(plan: TripPlan, input: TripInput): Promise<PackingCategory[]> {
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
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `Erstelle eine Packliste für: ${plan.destination}, ${plan.country}. Dauer: ${input.days} Tage. Reiseart: ${input.travelTypes.join(', ')}. Jahreszeit: ${plan.beste_reisezeit}.
Antworte NUR als JSON ohne Markdown:
{"categories":[{"name":"Kleidung","items":[{"item":"T-Shirts","quantity":${Math.min(input.days, 5)},"essential":true}]},{"name":"Dokumente","items":[{"item":"Reisepass","quantity":1,"essential":true}]},{"name":"Hygiene","items":[{"item":"Zahnbürste","quantity":1,"essential":true}]},{"name":"Elektronik","items":[{"item":"Ladekabel","quantity":1,"essential":true}]}]}`,
      }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '{}';
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  return (parsed.categories ?? []).map((cat: { name: string; items: Omit<PackingItem, 'packed'>[] }) => ({
    ...cat,
    items: cat.items.map((item) => ({ ...item, packed: false })),
  }));
}

export function PackingListScreen({ plan, input, onBack }: Props) {
  const storageKey = STORAGE_KEY(plan.destination, input.days);

  const [categories, setCategories] = useState<PackingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCategories(parsed);
        setExpanded(Object.fromEntries(parsed.map((_: PackingCategory, i: number) => [i, i === 0])));
        return;
      } catch { /* regenerate */ }
    }
    setLoading(true);
    generatePackingList(plan, input)
      .then((cats) => {
        setCategories(cats);
        setExpanded(Object.fromEntries(cats.map((_, i) => [i, i === 0])));
        localStorage.setItem(storageKey, JSON.stringify(cats));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storageKey]);

  const toggle = (catIdx: number, itemIdx: number) => {
    setCategories((prev) => {
      const next = prev.map((cat, ci) =>
        ci !== catIdx ? cat : {
          ...cat,
          items: cat.items.map((it, ii) => ii !== itemIdx ? it : { ...it, packed: !it.packed }),
        }
      );
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const packedItems = categories.reduce((s, c) => s + c.items.filter((i) => i.packed).length, 0);
  const pct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const reset = () => {
    const next = categories.map((cat) => ({ ...cat, items: cat.items.map((it) => ({ ...it, packed: false })) }));
    setCategories(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e8e8ed' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-4 -ml-1" style={{ color: '#8b7cf8', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          Zurück
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0eeff' }}>
            <Package size={20} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
          </div>
          <div>
            <p className="section-label">Packliste</p>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.3px' }}>
              {plan.destination}
            </h1>
          </div>
        </div>

        {/* Progress */}
        {totalItems > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontSize: '13px', color: '#6e6e73' }}>{packedItems}/{totalItems} gepackt</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#8b7cf8' }}>{pct}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#e8e8ed' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#8b7cf8' }}
              />
            </div>
            {pct === 100 && (
              <p style={{ fontSize: '13px', color: '#22c55e', marginTop: '6px', fontWeight: 500 }}>
                Alles gepackt! Gute Reise! ✓
              </p>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && (
          <div className="card p-8 flex flex-col items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-full" />
            <p style={{ fontSize: '14px', color: '#aeaeb2' }}>Packliste wird erstellt…</p>
          </div>
        )}

        {!loading && categories.map((cat, ci) => (
          <div key={ci} className="card overflow-hidden">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [ci]: !prev[ci] }))}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="flex-1">
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#1c1c1e' }}>{cat.name}</p>
                <p style={{ fontSize: '12px', color: '#aeaeb2' }}>
                  {cat.items.filter((i) => i.packed).length}/{cat.items.length} gepackt
                </p>
              </div>
              {expanded[ci]
                ? <ChevronUp size={16} strokeWidth={1.5} style={{ color: '#aeaeb2', flexShrink: 0 }} />
                : <ChevronDown size={16} strokeWidth={1.5} style={{ color: '#aeaeb2', flexShrink: 0 }} />
              }
            </button>

            {expanded[ci] && (
              <div className="px-4 pb-3 space-y-1" style={{ borderTop: '1px solid #f5f5f7' }}>
                {cat.items.map((item, ii) => (
                  <button
                    key={ii}
                    onClick={() => toggle(ci, ii)}
                    className="w-full flex items-center gap-3 py-3 text-left transition-all active:scale-[0.99]"
                    style={{ borderBottom: ii < cat.items.length - 1 ? '1px solid #f5f5f7' : 'none' }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: item.packed ? '#8b7cf8' : '#ffffff',
                        border: `1.5px solid ${item.packed ? '#8b7cf8' : '#d1d5db'}`,
                      }}
                    >
                      {item.packed && <Check size={13} strokeWidth={2.5} style={{ color: '#ffffff' }} />}
                    </div>
                    <div className="flex-1">
                      <span style={{
                        fontSize: '14px',
                        color: item.packed ? '#aeaeb2' : '#1c1c1e',
                        textDecoration: item.packed ? 'line-through' : 'none',
                        fontWeight: item.essential ? 500 : 400,
                      }}>
                        {item.item}
                      </span>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: '12px', color: '#aeaeb2', marginLeft: '6px' }}>×{item.quantity}</span>
                      )}
                    </div>
                    {item.essential && !item.packed && (
                      <span className="px-1.5 py-0.5 rounded-md" style={{ fontSize: '10px', background: '#f0eeff', color: '#8b7cf8', fontWeight: 500 }}>
                        wichtig
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {!loading && totalItems > 0 && (
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl transition-all active:scale-95"
            style={{ background: '#fafafa', border: '1px solid #e8e8ed', color: '#aeaeb2', fontSize: '13px', cursor: 'pointer' }}
          >
            Liste zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
