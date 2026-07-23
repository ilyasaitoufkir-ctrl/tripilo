import { useState, useRef } from 'react';
import { Camera, Upload, RotateCcw } from 'lucide-react';

interface Props {
  destination: string;
}

export function TranslatorScreen({ destination }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    setTranslation(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setPreview(dataUrl);

      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

      try {
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
                    source: { type: 'base64', media_type: mediaType, data: base64 },
                  },
                  {
                    type: 'text',
                    text: `Du bist ein Reise-Übersetzer${destination ? ` spezialisiert auf ${destination}` : ''}.

Erkenne alle Texte in diesem Bild (Speisekarte, Schild, Menü, Beschriftung o.ä.) und übersetze alles vollständig ins Deutsche.

Für Speisekarten: Erkläre kurz was das Gericht ist und markiere:
🌱 vegetarisch/vegan · 🌶️ scharf · ⚠️ Nüsse/Allergene · 🐟 Meeresfrüchte

Format:
**[Original-Text]** → [Übersetzung]
[Kurze Erklärung falls nötig]

Falls kein Text erkennbar ist, schreibe: "Kein lesbarer Text im Bild gefunden."`,
                  },
                ],
              },
            ],
          }),
        });

        const data = await res.json();
        setTranslation(data.content?.[0]?.text ?? 'Übersetzung fehlgeschlagen.');
      } catch {
        setTranslation('Fehler beim Übersetzen. Bitte nochmal versuchen.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
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
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e8e8ed' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0eeff' }}>
              <Camera size={20} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.3px' }}>
                Übersetzer
              </h1>
              {destination && <p style={{ fontSize: '13px', color: '#aeaeb2' }}>{destination}</p>}
            </div>
          </div>
          {(preview || translation) && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: '#f5f5f7', color: '#6e6e73', fontSize: '13px', border: 'none', cursor: 'pointer' }}
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
              style={{ background: '#f0eeff', border: '2px dashed #c4b5fd', cursor: 'pointer' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#8b7cf8' }}
              >
                <Camera size={30} strokeWidth={1.5} style={{ color: '#ffffff' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '17px', fontWeight: 500, color: '#8b7cf8' }}>Foto aufnehmen</p>
                <p style={{ fontSize: '13px', color: '#a78bfa', marginTop: '3px' }}>
                  Speisekarte, Schild oder Menü fotografieren
                </p>
              </div>
            </button>

            <button
              onClick={triggerGallery}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e8e8ed',
                color: '#6e6e73',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Upload size={15} strokeWidth={1.5} />
              Aus Galerie wählen
            </button>

            <div className="card p-5 text-center">
              <p style={{ fontSize: '14px', color: '#aeaeb2', lineHeight: 1.65 }}>
                Fotografiere eine Speisekarte, ein Schild oder jeglichen Text — Claude übersetzt sofort ins Deutsche mit Erklärungen und Allergen-Markierungen.
              </p>
            </div>
          </>
        )}

        {/* Image preview */}
        {preview && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e8e8ed' }}>
            <img
              src={preview}
              alt="Uploaded"
              className="w-full object-contain"
              style={{ maxHeight: '280px', background: '#f5f5f7' }}
            />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="card p-6 space-y-3">
            <p style={{ fontSize: '13px', color: '#aeaeb2', textAlign: 'center', marginBottom: '8px' }}>
              Claude übersetzt…
            </p>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-3/5 rounded" />
            <div className="skeleton h-3 w-4/6 rounded" />
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
