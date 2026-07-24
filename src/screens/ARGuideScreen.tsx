import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';

const MAX_EDGE_PX = 1568; // Claude's optimal long-edge resolution; keeps the captured-frame payload small

export function ARGuideScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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

  const captureAndAnalyze = async () => {
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let width = video.videoWidth;
      let height = video.videoHeight;
      if (width > MAX_EDGE_PX || height > MAX_EDGE_PX) {
        if (width > height) { height = Math.round((height / width) * MAX_EDGE_PX); width = MAX_EDGE_PX; }
        else { width = Math.round((width / height) * MAX_EDGE_PX); height = MAX_EDGE_PX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas nicht verfügbar');
      ctx.drawImage(video, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

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
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
                {
                  type: 'text',
                  text: `Du bist ein Reiseführer. Was siehst du auf diesem Foto?

Falls du ein Gebäude, Monument, Sehenswürdigkeit oder Ort erkennst:
- Name des Ortes
- Kurze Geschichte (2-3 Sätze)
- Interessantester Fakt
- Öffnungszeiten wenn bekannt
- Tipp für Besucher

Falls du nichts Spezifisches erkennst: "Kein bekanntes Wahrzeichen erkannt - versuche näher ranzugehen"

Antworte auf Deutsch, kurz und informativ wie ein Guide.`,
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
        throw new Error('Keine Antwort erhalten. Bitte nochmal versuchen.');
      }
      setResult(data.content[0]?.text ?? 'Keine Antwort erhalten.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen. Bitte nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#f0f7f6' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f3' }}>
            <Camera size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>Stadtführer</h1>
            <p style={{ fontSize: '13px', color: '#9bb5b0' }}>Kamera auf ein Gebäude richten</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {!isScanning && (
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
                <p style={{ fontSize: '17px', fontWeight: 500, color: '#2d8b7a' }}>Kamera starten</p>
                <p style={{ fontSize: '13px', color: '#4db8a4', marginTop: '3px' }}>
                  Richte die Kamera auf ein Gebäude oder Wahrzeichen
                </p>
              </div>
            </button>
            <div className="card p-5 text-center">
              <p style={{ fontSize: '14px', color: '#9bb5b0', lineHeight: 1.65 }}>
                Claude erkennt Sehenswürdigkeiten und erklärt dir Geschichte, Fakten und Tipps dazu.
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
              onClick={captureAndAnalyze}
              disabled={loading}
              className="btn-primary transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Analysiere…' : 'Foto & Erklärung'}
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

        {error && !loading && (
          <div className="card p-5" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p style={{ fontSize: '14px', color: '#f472b6', marginBottom: '10px' }}>{error}</p>
            <button
              onClick={isScanning ? captureAndAnalyze : startCamera}
              className="px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: '#ffffff', border: '1px solid #fbcfe8', color: '#f472b6', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="card p-5">
            <p className="section-label mb-3">Stadtführer sagt</p>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result}</p>
            <button
              onClick={() => { setResult(null); setError(''); }}
              className="flex items-center gap-1.5 mt-4 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: '#f0f5f4', color: '#6b8a85', fontSize: '13px', border: 'none', cursor: 'pointer' }}
            >
              <RotateCcw size={13} strokeWidth={1.5} /> Nächstes Foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
