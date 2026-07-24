import { useState } from 'react';
import { Phone } from 'lucide-react';
import { askClaudeJSON } from '../services/aiJson';

interface Props {
  destination: string;
}

interface EmergencyContact {
  name: string;
  nummer: string;
}

interface EmbassyContact {
  adresse: string;
  notfallnummer: string;
  oeffnungszeiten: string;
}

interface EmergencyInfo {
  sofort_massnahmen: string[];
  wichtige_nummern: EmergencyContact[];
  deutsche_botschaft: EmbassyContact;
  tipps: string[];
  was_nicht_tun: string[];
}

const emergencies = [
  { key: 'stolen', label: 'Geldbeutel gestohlen', icon: '👛' },
  { key: 'passport', label: 'Pass verloren', icon: '🛂' },
  { key: 'medical', label: 'Medizinischer Notfall', icon: '🏥' },
  { key: 'accident', label: 'Unfall', icon: '🚨' },
  { key: 'arrested', label: 'Rechtliche Probleme', icon: '⚖️' },
  { key: 'stranded', label: 'Gestrandet / Kein Geld', icon: '💸' },
] as const;

const emergencyLabel = (key: string) => emergencies.find((e) => e.key === key)?.label ?? key;

// Emergencies can't end in a dead "retry?" screen — if the AI call fails
// (network, refusal, unparseable response), fall back to baseline info that
// works anywhere rather than leaving the user with nothing.
const FALLBACK_INFO: EmergencyInfo = {
  sofort_massnahmen: [
    'Ruhig bleiben',
    'Europäischen Notruf 112 anrufen (Polizei, Rettung, Feuerwehr)',
    'Deutsche Botschaft oder Konsulat kontaktieren',
  ],
  wichtige_nummern: [
    { name: 'Europäischer Notruf', nummer: '112' },
    { name: 'Auswärtiges Amt (Bürgerservice)', nummer: '+49 30 5000 2000' },
  ],
  deutsche_botschaft: {
    adresse: 'Adresse variiert je nach Land – aktuelle Kontaktdaten auf auswaertiges-amt.de/de/aussenpolitik/laender prüfen',
    notfallnummer: '+49 30 5000 2000',
    oeffnungszeiten: '',
  },
  tipps: ['Reisedokumente digital (z.B. per E-Mail an dich selbst) und in Papierform separat aufbewahren'],
  was_nicht_tun: ['Nicht in Panik geraten'],
};

export function NotfallScreen({ destination }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [info, setInfo] = useState<EmergencyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const getEmergencyInfo = async (type: string) => {
    setSelected(type);
    setLoading(true);
    setUsedFallback(false);
    setInfo(null);
    try {
      const result = await askClaudeJSON<EmergencyInfo>(
        `Notfall "${emergencyLabel(type)}" in ${destination || 'einem Reiseland'} für deutschen Touristen.

Antworte als JSON:
{
  "sofort_massnahmen": [
    "Schritt 1",
    "Schritt 2"
  ],
  "wichtige_nummern": [
    { "name": "Polizei", "nummer": "110" },
    { "name": "Notruf", "nummer": "112" },
    { "name": "Deutsche Botschaft", "nummer": "+..." }
  ],
  "deutsche_botschaft": {
    "adresse": "...",
    "notfallnummer": "+...",
    "oeffnungszeiten": "..."
  },
  "tipps": ["Tipp 1", "Tipp 2"],
  "was_nicht_tun": ["Fehler 1", "Fehler 2"]
}

Nur JSON! Praktische Sofort-Hilfe für deutschen Touristen in ${destination || 'diesem Land'}.`,
        800
      );
      setInfo(result);
    } catch (err) {
      console.error('Notfall error:', err);
      setInfo(FALLBACK_INFO);
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
          🆘 Notfall Assistent
        </h1>
        <p style={{ fontSize: '13px', color: '#9bb5b0' }}>
          {destination ? `${destination} · Was ist passiert?` : 'Was ist passiert?'}
        </p>
      </div>

      <div className="px-4 pt-5 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {emergencies.map((e) => (
            <button
              key={e.key}
              onClick={() => getEmergencyInfo(e.key)}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all active:scale-95"
              style={{
                background: selected === e.key ? '#e8f5f3' : '#ffffff',
                border: `1.5px solid ${selected === e.key ? '#a3d4ce' : '#e0eeec'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '24px' }}>{e.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: selected === e.key ? '#2d8b7a' : '#6b8a85', textAlign: 'center' }}>
                {e.label}
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="card p-6 space-y-3">
            <p style={{ fontSize: '13px', color: '#9bb5b0', textAlign: 'center', marginBottom: '8px' }}>
              Hilfe wird geladen…
            </p>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
        )}

        {usedFallback && !loading && (
          <div className="card p-4" style={{ background: '#fff8e7', border: '1px solid #fde68a' }}>
            <div className="flex items-center justify-between gap-3">
              <p style={{ fontSize: '13px', color: '#92400e' }}>
                Passende Infos für {destination || 'dein Reiseland'} konnten nicht geladen werden – hier die wichtigsten Basis-Kontakte.
              </p>
              <button
                onClick={() => selected && getEmergencyInfo(selected)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                style={{ background: '#ffffff', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Nochmal
              </button>
            </div>
          </div>
        )}

        {info && !loading && (
          <>
            <div className="card p-5" style={{ background: '#fff0f3', border: '1px solid #ffc9d4' }}>
              <p className="section-label mb-3" style={{ color: '#ff6584' }}>Sofort tun</p>
              <div className="space-y-3">
                {info.sofort_massnahmen?.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ff6584', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {info.wichtige_nummern?.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-3">Wichtige Nummern</p>
                <div className="space-y-2">
                  {info.wichtige_nummern.map((num, i) => (
                    <a
                      key={i}
                      href={`tel:${num.nummer}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all active:scale-95"
                      style={{ background: '#f0f5f4', textDecoration: 'none' }}
                    >
                      <span className="flex items-center gap-2" style={{ fontSize: '14px', color: '#1a2e2b', fontWeight: 500 }}>
                        <Phone size={14} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
                        {num.name}
                      </span>
                      <span style={{ fontSize: '14px', color: '#2d8b7a', fontWeight: 600 }}>{num.nummer}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {info.deutsche_botschaft && (
              <div className="card p-5">
                <p className="section-label mb-3">Deutsche Botschaft</p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>{info.deutsche_botschaft.adresse}</p>
                {info.deutsche_botschaft.oeffnungszeiten && (
                  <p style={{ fontSize: '13px', color: '#9bb5b0', marginBottom: '10px' }}>{info.deutsche_botschaft.oeffnungszeiten}</p>
                )}
                {info.deutsche_botschaft.notfallnummer && (
                  <a
                    href={`tel:${info.deutsche_botschaft.notfallnummer}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg"
                    style={{ background: '#fff0f3', color: '#ff6584', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    <Phone size={13} strokeWidth={1.5} /> Notfall: {info.deutsche_botschaft.notfallnummer}
                  </a>
                )}
              </div>
            )}

            {info.was_nicht_tun?.length > 0 && (
              <div className="card p-5" style={{ background: '#fff8e7', border: '1px solid #fde68a' }}>
                <p className="section-label mb-3" style={{ color: '#92400e' }}>⚠️ Das niemals tun</p>
                <div className="space-y-1.5">
                  {info.was_nicht_tun.map((w, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#92400e' }}>✗ {w}</p>
                  ))}
                </div>
              </div>
            )}

            {info.tipps?.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-3">Tipps</p>
                <div className="space-y-1.5">
                  {info.tipps.map((tip, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#374151' }}>· {tip}</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
