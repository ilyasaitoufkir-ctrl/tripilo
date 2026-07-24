import { useEffect, useState } from 'react';
import { Plane, Phone, ShieldCheck, ShieldAlert } from 'lucide-react';
import { askClaudeJSON } from '../services/aiJson';

interface Props {
  destination: string;
}

interface Vaccination {
  name: string;
  required: boolean;
  recommended: boolean;
}

interface Embassy {
  adresse: string;
  telefon: string;
  website: string;
}

interface VisaInfo {
  visa_required: boolean;
  visa_type: string;
  max_stay: string;
  passport_validity: string;
  cost: string;
  processing_time: string;
  apply_at: string;
  impfungen: Vaccination[];
  einreise_dokumente: string[];
  wichtige_hinweise: string[];
  botschaft_deutschland: Embassy;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{label}</p>
      <p style={{ fontSize: '14px', color: '#1a2e2b', fontWeight: 500 }}>{value}</p>
    </div>
  );
}

export function VisaCheckScreen({ destination }: Props) {
  const [visaInfo, setVisaInfo] = useState<VisaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkVisa = async () => {
    if (!destination) return;
    setLoading(true);
    setError('');
    setVisaInfo(null);
    try {
      const info = await askClaudeJSON<VisaInfo>(
        `Gib Einreiseinformationen für ${destination} für deutsche Staatsbürger als JSON:

{
  "visa_required": true/false,
  "visa_type": "Visum on Arrival / E-Visa / Kein Visum / Schengen",
  "max_stay": "90 Tage",
  "passport_validity": "Mindestens 6 Monate gültig",
  "cost": "0€ / 35€",
  "processing_time": "Sofort / 3-5 Tage",
  "apply_at": "Botschaft Berlin / Online / Bei Ankunft",
  "impfungen": [
    { "name": "Hepatitis A", "required": false, "recommended": true },
    { "name": "Typhus", "required": false, "recommended": true }
  ],
  "einreise_dokumente": [
    "Reisepass (6 Monate gültig)",
    "Rückflugticket",
    "Hotelbuchung"
  ],
  "wichtige_hinweise": [
    "Hinweis 1",
    "Hinweis 2"
  ],
  "botschaft_deutschland": {
    "adresse": "Adresse der Botschaft in Deutschland",
    "telefon": "+49...",
    "website": "https://..."
  }
}

Nur JSON! Aktuelle Informationen für deutsche Reisende.`,
        1000
      );
      setVisaInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Einreiseinfos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkVisa(); }, [destination]);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f3' }}>
            <Plane size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
              Einreise & Visa
            </h1>
            {destination && <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{destination} · Deutscher Reisepass</p>}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {!destination && (
          <div className="card p-5 text-center">
            <p style={{ fontSize: '14px', color: '#9bb5b0' }}>Plane zuerst eine Reise, um Einreiseinfos zu sehen.</p>
          </div>
        )}

        {loading && (
          <div className="card p-6 space-y-3">
            <p style={{ fontSize: '13px', color: '#9bb5b0', textAlign: 'center', marginBottom: '8px' }}>
              Einreiseinfos werden geladen…
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
              onClick={checkVisa}
              className="px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1px solid #fbcfe8', color: '#f472b6', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {visaInfo && !loading && (
          <>
            <div
              className="card p-5 flex items-center gap-3"
              style={{
                background: visaInfo.visa_required ? '#fff8e7' : '#e8f5f3',
                border: `1px solid ${visaInfo.visa_required ? '#fde68a' : '#a3d4ce'}`,
              }}
            >
              {visaInfo.visa_required
                ? <ShieldAlert size={22} strokeWidth={1.5} style={{ color: '#d97706', flexShrink: 0 }} />
                : <ShieldCheck size={22} strokeWidth={1.5} style={{ color: '#2d8b7a', flexShrink: 0 }} />}
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: visaInfo.visa_required ? '#92400e' : '#2d8b7a' }}>
                  {visaInfo.visa_required ? 'Visum erforderlich' : 'Kein Visum nötig'}
                </p>
                <p style={{ fontSize: '13px', color: visaInfo.visa_required ? '#b45309' : '#4db8a4' }}>{visaInfo.visa_type}</p>
              </div>
            </div>

            <div className="card p-5 space-y-2">
              <Row label="Max. Aufenthalt" value={visaInfo.max_stay} />
              <Row label="Reisepass" value={visaInfo.passport_validity} />
              {visaInfo.visa_required && (
                <>
                  <Row label="Kosten" value={visaInfo.cost} />
                  <Row label="Bearbeitungszeit" value={visaInfo.processing_time} />
                  <Row label="Beantragen bei" value={visaInfo.apply_at} />
                </>
              )}
            </div>

            {visaInfo.einreise_dokumente?.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-3">Benötigte Dokumente</p>
                <div className="space-y-1.5">
                  {visaInfo.einreise_dokumente.map((doc, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#374151' }}>· {doc}</p>
                  ))}
                </div>
              </div>
            )}

            {visaInfo.impfungen?.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-3">Impfempfehlungen</p>
                <div className="space-y-2">
                  {visaInfo.impfungen.map((imp, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p style={{ fontSize: '14px', color: '#374151' }}>{imp.name}</p>
                      <span
                        style={{
                          fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '20px',
                          background: imp.required ? '#fce7f3' : '#e8f5f3',
                          color: imp.required ? '#f472b6' : '#2d8b7a',
                        }}
                      >
                        {imp.required ? '⚠️ Pflicht' : '💉 Empfohlen'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visaInfo.wichtige_hinweise?.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-3">Wichtige Hinweise</p>
                <div className="space-y-1.5">
                  {visaInfo.wichtige_hinweise.map((h, i) => (
                    <p key={i} style={{ fontSize: '14px', color: '#374151' }}>· {h}</p>
                  ))}
                </div>
              </div>
            )}

            {visaInfo.botschaft_deutschland && (
              <div className="card p-5">
                <p className="section-label mb-3">Botschaft in Deutschland</p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  {visaInfo.botschaft_deutschland.adresse}
                </p>
                {visaInfo.botschaft_deutschland.telefon && (
                  <a
                    href={`tel:${visaInfo.botschaft_deutschland.telefon}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg"
                    style={{ background: '#e8f5f3', color: '#2d8b7a', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
                  >
                    <Phone size={13} strokeWidth={1.5} /> {visaInfo.botschaft_deutschland.telefon}
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
