import { useState, useRef } from 'react';
import { Camera, Upload, RotateCcw } from 'lucide-react';

interface Props {
  destination: string;
}

const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // reject absurdly large files before we even try to decode them
const MAX_EDGE_PX = 1568; // Claude's optimal long-edge resolution; larger images are downscaled server-side anyway

const compressImage = (file: File): Promise<{ base64: string; preview: string; mimeType: 'image/jpeg' }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_EDGE_PX || height > MAX_EDGE_PX) {
        if (width > height) { height = Math.round((height / width) * MAX_EDGE_PX); width = MAX_EDGE_PX; }
        else { width = Math.round((width / height) * MAX_EDGE_PX); height = MAX_EDGE_PX; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas nicht verfügbar')); return; }
      ctx.drawImage(img, 0, 0, width, height);

      const preview = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = preview.split(',')[1];
      URL.revokeObjectURL(img.src);
      resolve({ base64, preview, mimeType: 'image/jpeg' });
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('Bild konnte nicht geladen werden')); };
    img.src = URL.createObjectURL(file);
  });
};

export function TranslatorScreen({ destination }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_SOURCE_BYTES) {
      setError('Bild zu groß – bitte ein kleineres Foto wählen.');
      return;
    }

    setLoading(true);
    setTranslation(null);
    setError(null);

    try {
      const { base64, preview: compressedPreview, mimeType } = await compressImage(file);
      setPreview(compressedPreview);

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
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: { type: 'base64', media_type: mimeType, data: base64 },
                },
                {
                  type: 'text',
                  text: `Du bist ein Reise-Übersetzer${destination ? ` spezialisiert auf ${destination}` : ''}.

Erkenne alles auf diesem Bild und übersetze vollständig ins Deutsche.

Falls es eine Speisekarte oder ein Gericht ist, antworte in dieser Struktur:
1. ÜBERSETZUNG: Jeden Eintrag ins Deutsche übersetzen
2. ERKLÄRUNG: Kurz was das Gericht ist
3. ALLERGENE, wo zutreffend: 🌱 Vegetarisch · 🌿 Vegan · 🌶️ Scharf · ⚠️ Nüsse · 🐟 Fisch/Meeresfrüchte · 🥛 Laktose · 🌾 Gluten
4. EMPFEHLUNG: Welches Gericht empfiehlst du und warum?
5. PREIS-EINSCHÄTZUNG: Ist der Preis fair, falls Preise sichtbar sind?

Falls es ein Schild, Menü ohne Speisen oder sonstiger Text ist:
**[Original-Text]** → [Übersetzung]
[Kurze Erklärung falls nötig]

Antworte auf Deutsch, übersichtlich formatiert. Falls kein Text erkennbar ist, schreibe: "Kein lesbarer Text im Bild gefunden."`,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error?.message || `Fehler ${res.status}`);
      }

      const data = await res.json();
      if (data.stop_reason === 'refusal' || !data.content?.length) {
        throw new Error('Keine Übersetzung erhalten. Bitte nochmal versuchen.');
      }
      setTranslation(data.content[0]?.text ?? 'Übersetzung fehlgeschlagen.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Übersetzen. Bitte nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  };

  const triggerCamera = () => {
    if (!inputRef.current) return;
    inputRef.current.setAttribute('capture', 'environment');
    inputRef.current.click();
  };

  const triggerGallery = () => {
    if (!inputRef.current) return;
    inputRef.current.removeAttribute('capture');
    inputRef.current.click();
  };

  const reset = () => {
    setPreview(null);
    setTranslation(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f3' }}>
              <Camera size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
                Übersetzer
              </h1>
              {destination && <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{destination}</p>}
            </div>
          </div>
          {(preview || translation || error) && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: '#f0f5f4', color: '#6b8a85', fontSize: '13px', border: 'none', cursor: 'pointer' }}
            >
              <RotateCcw size={13} strokeWidth={1.5} />
              Neu
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      <div className="px-4 pt-5 space-y-4">
        {/* Upload buttons */}
        {!preview && (
          <>
            <button
              onClick={triggerCamera}
              className="w-full flex flex-col items-center gap-3 py-10 rounded-2xl transition-all active:scale-[0.98]"
              style={{ background: '#e8f5f3', border: '2px dashed #a3d4ce', cursor: 'pointer' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#2d8b7a' }}
              >
                <Camera size={30} strokeWidth={1.5} style={{ color: '#ffffff' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '17px', fontWeight: 500, color: '#2d8b7a' }}>Foto aufnehmen</p>
                <p style={{ fontSize: '13px', color: '#4db8a4', marginTop: '3px' }}>
                  Speisekarte, Schild oder Menü fotografieren
                </p>
              </div>
            </button>

            <button
              onClick={triggerGallery}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e0eeec',
                color: '#6b8a85',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Upload size={15} strokeWidth={1.5} />
              Aus Galerie wählen
            </button>

            <div className="card p-5 text-center">
              <p style={{ fontSize: '14px', color: '#9bb5b0', lineHeight: 1.65 }}>
                Fotografiere eine Speisekarte, ein Schild oder jeglichen Text — Claude übersetzt sofort ins Deutsche mit Erklärungen und Allergen-Markierungen.
              </p>
            </div>
          </>
        )}

        {/* Image preview */}
        {preview && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e0eeec' }}>
            <img
              src={preview}
              alt="Uploaded"
              className="w-full object-contain"
              style={{ maxHeight: '280px', background: '#f0f5f4' }}
            />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="card p-6 space-y-3">
            <p style={{ fontSize: '13px', color: '#9bb5b0', textAlign: 'center', marginBottom: '8px' }}>
              Claude übersetzt…
            </p>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-3/5 rounded" />
            <div className="skeleton h-3 w-4/6 rounded" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card p-5" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p style={{ fontSize: '14px', color: '#f472b6', marginBottom: '10px' }}>{error}</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1px solid #fbcfe8', color: '#f472b6', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {/* Translation result */}
        {translation && !loading && (
          <div className="card p-5">
            <p className="section-label mb-3">Übersetzung</p>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {translation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
