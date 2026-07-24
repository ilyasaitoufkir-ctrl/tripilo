import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { askClaudeJSON } from '../services/aiJson';

interface Props {
  destination: string;
}

interface KulturInfo {
  begruessung: string;
  trinkgeld: { restaurants: string; hotels: string; taxis: string; hinweis: string };
  kleidung: { allgemein: string; tempel_kirchen: string; strand: string; restaurants: string };
  tabus: string[];
  etikette: string[];
  religion: { hauptreligion: string; besonderheiten: string; feiertage: string };
  essen: { besonderheiten: string; tabus: string; tischmanieren: string };
  positiv_ueberraschen: string[];
}

export function KulturKompassScreen({ destination }: Props) {
  const [kulturInfo, setKulturInfo] = useState<KulturInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getKulturInfo = async () => {
    if (!destination) return;
    setLoading(true);
    setError('');
    setKulturInfo(null);
    try {
      const info = await askClaudeJSON<KulturInfo>(
        `Kulturelle Tipps für ${destination} als JSON:

{
  "begruessung": "Wie begrüßt man sich?",
  "trinkgeld": {
    "restaurants": "10-15%",
    "hotels": "1-2€ pro Nacht",
    "taxis": "aufrunden",
    "hinweis": "..."
  },
  "kleidung": {
    "allgemein": "...",
    "tempel_kirchen": "...",
    "strand": "...",
    "restaurants": "..."
  },
  "tabus": [
    "Das niemals tun 1",
    "Das niemals tun 2"
  ],
  "etikette": [
    "Wichtige Regel 1",
    "Wichtige Regel 2"
  ],
  "religion": {
    "hauptreligion": "...",
    "besonderheiten": "...",
    "feiertage": "..."
  },
  "essen": {
    "besonderheiten": "...",
    "tabus": "...",
    "tischmanieren": "..."
  },
  "positiv_ueberraschen": [
    "Das mögen Einheimische wenn Touristen es tun"
  ]
}

Nur JSON! Praktische kulturelle Tipps für deutschen Touristen.`,
        1000
      );
      setKulturInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Kulturinfos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getKulturInfo(); }, [destination]);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f3' }}>
            <Compass size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
              Kultureller Kompass
            </h1>
            {destination && <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{destination}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {!destination && (
          <div className="card p-5 text-center">
            <p style={{ fontSize: '14px', color: '#9bb5b0' }}>Plane zuerst eine Reise, um kulturelle Tipps zu sehen.</p>
          </div>
        )}

        {loading && (
          <div className="card p-6 space-y-3">
            <p style={{ fontSize: '13px', color: '#9bb5b0', textAlign: 'center', marginBottom: '8px' }}>
              Kulturinfos werden geladen…
            </p>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
        )}

        {error && !loading && (
          <div className="card p-5" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p style={{ fontSize: '14px', color: '#f472b6', marginBottom: '10px' }}>{error}</p>
            <button
              onClick={getKulturInfo}
              className="px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1px solid #fbcfe8', color: '#f472b6', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {kulturInfo && !loading && (
          <>
            <div className="card p-5">
              <p className="section-label mb-2">Begrüßung</p>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{kulturInfo.begruessung}</p>
            </div>

            {kulturInfo.trinkgeld && (
              <div className="card p-5 space-y-2">
                <p className="section-label mb-1">Trinkgeld</p>
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: '13px', color: '#9bb5b0' }}>Restaurant</p>
                  <p style={{ fontSize: '14px', color: '#1a2e2b', fontWeight: 500 }}>{kulturInfo.trinkgeld.restaurants}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: '13px', color: '#9bb5b0' }}>Hotel</p>
                  <p style={{ fontSize: '14px', color: '#1a2e2b', fontWeight: 500 }}>{kulturInfo.trinkgeld.hotels}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: '13px', color: '#9bb5b0' }}>Taxi</p>
                  <p style={{ fontSize: '14px', color: '#1a2e2b', fontWeight: 500 }}>{kulturInfo.trinkgeld.taxis}</p>
                </div>
                {kulturInfo.trinkgeld.hinweis && (
                  <p style={{ fontSize: '13px', color: '#9bb5b0', marginTop: '6px' }}>{kulturInfo.trinkgeld.hinweis}</p>
                )}
              </div>
            )}

            {kulturInfo.kleidung && (
              <div className="card p-5 space-y-2">
                <p className="section-label mb-1">Kleidung</p>
                <p style={{ fontSize: '14px', color: '#374151' }}>{kulturInfo.kleidung.allgemein}</p>
                {kulturInfo.kleidung.tempel_kirchen && (
                  <p style={{ fontSize: '13px', color: '#6b8a85' }}>Tempel/Kirchen: {kulturInfo.kleidung.tempel_kirchen}</p>
                )}
                {kulturInfo.kleidung.strand && (
                  <p style={{ fontSize: '13px', color: '#6b8a85' }}>Strand: {kulturInfo.kleidung.strand}</p>
                )}
                {kulturInfo.kleidung.restaurants && (
                  <p style={{ fontSize: '13px', color: '#6b8a85' }}>Restaurants: {kulturInfo.kleidung.restaurants}</p>
                )}
              </div>
            )}

            {kulturInfo.essen && (
              <div className="card p-5 space-y-1.5">
                <p className="section-label mb-1">Essen & Tischmanieren</p>
                {kulturInfo.essen.besonderheiten && <p style={{ fontSize: '14px', color: '#374151' }}>{kulturInfo.essen.besonderheiten}</p>}
                {kulturInfo.essen.tischmanieren && <p style={{ fontSize: '13px', color: '#6b8a85' }}>{kulturInfo.essen.tischmanieren}</p>}
                {kulturInfo.essen.tabus && <p style={{ fontSize: '13px', color: '#f472b6' }}>Tabu: {kulturInfo.essen.tabus}</p>}
              </div>
            )}

            {kulturInfo.religion && (
              <div className="card p-5 space-y-1.5">
                <p className="section-label mb-1">Religion</p>
                <p style={{ fontSize: '14px', color: '#374151' }}>{kulturInfo.religion.hauptreligion}</p>
                {kulturInfo.religion.besonderheiten && <p style={{ fontSize: '13px', color: '#6b8a85' }}>{kulturInfo.religion.besonderheiten}</p>}
                {kulturInfo.religion.feiertage && <p style={{ fontSize: '13px', color: '#6b8a85' }}>Feiertage: {kulturInfo.religion.feiertage}</p>}
              </div>
            )}

            {kulturInfo.etikette?.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-3">Etikette</p>
                <div className="space-y-1.5">
                  {kulturInfo.etikette.map((e, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#374151' }}>· {e}</p>
                  ))}
                </div>
              </div>
            )}

            {kulturInfo.tabus?.length > 0 && (
              <div className="card p-5" style={{ background: '#fff8e7', border: '1px solid #fde68a' }}>
                <p className="section-label mb-3" style={{ color: '#92400e' }}>⚠️ Das niemals tun</p>
                <div className="space-y-1.5">
                  {kulturInfo.tabus.map((t, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#92400e' }}>✗ {t}</p>
                  ))}
                </div>
              </div>
            )}

            {kulturInfo.positiv_ueberraschen?.length > 0 && (
              <div className="card p-5" style={{ background: '#e8f5f3', border: '1px solid #a3d4ce' }}>
                <p className="section-label mb-3" style={{ color: '#2d8b7a' }}>✅ Einheimische begeistern</p>
                <div className="space-y-1.5">
                  {kulturInfo.positiv_ueberraschen.map((p, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#1a6b5a' }}>· {p}</p>
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
