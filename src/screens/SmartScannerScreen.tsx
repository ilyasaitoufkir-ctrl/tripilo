import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, RotateCcw } from 'lucide-react';

interface Props {
  destination: string;
}

const MAX_EDGE_PX = 1568; // Claude's optimal long-edge resolution; keeps the payload small
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

const SCANNER_PROMPT = `Du bist ein intelligenter Reise-Assistent.

Erkenne automatisch was auf dem Foto zu sehen ist:

GEBÄUDE/SEHENSWÜRDIGKEIT:
- Name & kurze Geschichte
- Interessantester Fakt
- Öffnungszeiten & Eintritt
- Insider Tipp

SPEISEKARTE (mehrere Gerichte):
- Alle Gerichte auf Deutsch übersetzen
- Kurze Erklärung pro Gericht
- 🌱 Vegetarisch · 🌶️ Scharf · ⚠️ Nüsse · 🐟 Fisch · 🥛 Laktose · 🌾 Gluten
- Welches Gericht empfiehlst du?

EINZELNES GERICHT/ESSEN:
- Name & Herkunft
- Zutaten & Geschmack
- Allergene markieren
- Probieren oder nicht?

GELD/MÜNZEN/GELDSCHEINE:
- Welche Währung & Land
- Wert in Euro
- Echtheitstipp

MEDIKAMENT/PACKUNG:
- Wirkstoff & deutsches Äquivalent
- Wofür ist es?
- Dosierung & Hinweise

TRANSPORT/FAHRPLAN/SCHILD:
- Übersetzung
- Was bedeutet es praktisch?
- Hilfreicher Tipp

PREISSCHILD:
- Preis in Euro
- Fair oder Touristenpreis?
- Verhandlungstipp

STECKDOSE:
- Typ & Länder
- Welcher Adapter nötig?

SONSTIGES SCHILD/TEXT:
- Übersetzung
- Bedeutung & Kontext

Antworte immer kurz, klar und praktisch auf Deutsch!`;

const fitDimensions = (width: number, height: number): [number, number] => {
  if (width <= MAX_EDGE_PX && height <= MAX_EDGE_PX) return [width, height];
  return width > height
    ? [MAX_EDGE_PX, Math.round((height / width) * MAX_EDGE_PX)]
    : [Math.round((width / height) * MAX_EDGE_PX), MAX_EDGE_PX];
};

const canvasToJpeg = (source: CanvasImageSource, srcWidth: number, srcHeight: number) => {
  const [width, height] = fitDimensions(srcWidth, srcHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas nicht verfügbar');
  ctx.drawImage(source, 0, 0, width, height);
  const preview = canvas.toDataURL('image/jpeg', 0.85);
  return { base64: preview.split(',')[1], preview };
};

const compressFile = (file: File): Promise<{ base64: string; preview: string }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const result = canvasToJpeg(img, img.naturalWidth, img.naturalHeight);
        URL.revokeObjectURL(img.src);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('Bild konnte nicht geladen werden')); };
    img.src = URL.createObjectURL(file);
  });

export function SmartScannerScreen({ destination }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Never leave the camera running when the user navigates away from this screen
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsScanning(true);
    } catch {
      setError('Kamerazugriff nicht möglich – bitte in den Browser-Einstellungen erlauben.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsScanning(false);
  };

  const analyze = async (base64: string) => {
    setLoading(true);
    setError('');
    setResult(null);

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
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
                { type: 'text', text: SCANNER_PROMPT },
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
        throw new Error('Keine Antwort erhalten. Bitte nochmal versuchen.');
      }
      setResult(data.content[0]?.text ?? 'Keine Antwort erhalten.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen. Bitte nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const { base64 } = canvasToJpeg(video, video.videoWidth, video.videoHeight);
      analyze(base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufnahme fehlgeschlagen.');
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_SOURCE_BYTES) {
      setError('Bild zu groß – bitte ein kleineres Foto wählen.');
      return;
    }
    setError('');
    try {
      const { base64, preview: compressedPreview } = await compressFile(file);
      setPreview(compressedPreview);
      analyze(base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bild konnte nicht verarbeitet werden.');
    }
  };

  const reset = () => {
    stopCamera();
    setPreview(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f3' }}>
              <Camera size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
                Smart Scanner
              </h1>
              {destination && <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{destination}</p>}
            </div>
          </div>
          {(isScanning || preview || result || error) && (
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
        {!isScanning && !preview && !result && (
          <>
            <button
              onClick={startCamera}
              className="w-full flex flex-col items-center gap-3 py-10 rounded-2xl transition-all active:scale-[0.98]"
              style={{ background: '#e8f5f3', border: '2px dashed #a3d4ce', cursor: 'pointer' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#2d8b7a' }}>
                <Camera size={30} strokeWidth={1.5} style={{ color: '#ffffff' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '17px', fontWeight: 500, color: '#2d8b7a' }}>Scanner starten</p>
                <p style={{ fontSize: '13px', color: '#4db8a4', marginTop: '3px' }}>
                  Gebäude, Speisekarte, Geld, Schilder u.v.m.
                </p>
              </div>
            </button>

            <button
              onClick={() => inputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1.5px solid #e0eeec', color: '#6b8a85', fontSize: '14px', cursor: 'pointer' }}
            >
              <Upload size={15} strokeWidth={1.5} />
              Aus Galerie wählen
            </button>

            <div className="card p-5 text-center">
              <p style={{ fontSize: '14px', color: '#9bb5b0', lineHeight: 1.65 }}>
                Ein Scanner für alles unterwegs: Gebäude &amp; Sehenswürdigkeiten, Speisekarten, Geldscheine,
                Medikamente, Schilder, Preisschilder und Steckdosen — Claude erkennt automatisch was du zeigst.
              </p>
            </div>
          </>
        )}

        {isScanning && (
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e0eeec' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', maxHeight: '50vh', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <button
              onClick={captureFromCamera}
              disabled={loading}
              className="btn-primary transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Analysiere…' : 'Scannen'}
            </button>
            <button
              onClick={stopCamera}
              className="w-full text-center py-2.5 transition-all active:scale-95"
              style={{ background: 'none', border: 'none', color: '#9bb5b0', fontSize: '13px', cursor: 'pointer' }}
            >
              Kamera stoppen
            </button>
          </div>
        )}

        {preview && !isScanning && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e0eeec' }}>
            <img
              src={preview}
              alt="Hochgeladen"
              className="w-full object-contain"
              style={{ maxHeight: '280px', background: '#f0f5f4' }}
            />
          </div>
        )}

        {loading && (
          <div className="card p-6 space-y-3">
            <p style={{ fontSize: '13px', color: '#9bb5b0', textAlign: 'center', marginBottom: '8px' }}>
              Claude analysiert…
            </p>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-3/5 rounded" />
          </div>
        )}

        {error && !loading && (
          <div className="card p-5" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p style={{ fontSize: '14px', color: '#f472b6', marginBottom: '10px' }}>{error}</p>
            <button
              onClick={() => (isScanning ? captureFromCamera() : inputRef.current?.click())}
              className="px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1px solid #fbcfe8', color: '#f472b6', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="card p-5">
            <p className="section-label mb-3">Scanner-Ergebnis</p>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result}</p>
            {isScanning && (
              <button
                onClick={() => { setResult(null); setError(''); }}
                className="flex items-center gap-1.5 mt-4 px-3 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: '#f0f5f4', color: '#6b8a85', fontSize: '13px', border: 'none', cursor: 'pointer' }}
              >
                <RotateCcw size={13} strokeWidth={1.5} /> Nächster Scan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
