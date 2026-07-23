import { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface Props {
  destination: string;
}

export function VoiceGuideScreen({ destination }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const askGuide = async (q: string) => {
    setLoading(true);
    setAnswer('');
    setError('');

    const getPosition = (): Promise<GeolocationPosition | null> =>
      new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null),
          { timeout: 5000 }
        );
      });

    const pos = await getPosition();
    const locationCtx = pos
      ? `Aktueller GPS-Standort: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}.`
      : '';

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
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Du bist ein persönlicher Reiseführer für ${destination || 'unbekanntes Ziel'}. ${locationCtx}\nFrage des Reisenden: "${q}"\n\nAntworte kurz, interessant und informativ auf Deutsch. Maximal 3 Sätze. Wie ein echter, begeisterter Guide!`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      if (!text) throw new Error('Keine Antwort');
      setAnswer(text);
      speak(text);
    } catch {
      setError('Antwort konnte nicht geladen werden. Nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Spracherkennung wird in diesem Browser nicht unterstützt (Chrome empfohlen).');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    setQuestion('');
    setAnswer('');
    setError('');

    recognition.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setQuestion(text);
      setIsListening(false);
      await askGuide(text);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setError('Spracherkennung fehlgeschlagen. Nochmal versuchen.');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen pb-28 flex flex-col" style={{ background: '#f0f7f6' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e0eeec' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f3' }}>
            <Mic size={20} strokeWidth={1.5} style={{ color: '#2d8b7a' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1a2e2b', letterSpacing: '-0.3px' }}>
              Reiseführer
            </h1>
            {destination && (
              <p style={{ fontSize: '13px', color: '#9bb5b0' }}>{destination}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pt-10">
        {/* Mic button */}
        <button
          onClick={startListening}
          disabled={loading || isListening}
          className="w-36 h-36 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:cursor-default mb-6"
          style={{
            background: isListening ? '#f472b6' : '#2d8b7a',
            boxShadow: isListening
              ? '0 0 0 20px rgba(244,114,182,0.12), 0 0 0 40px rgba(244,114,182,0.05)'
              : '0 8px 32px rgba(45,139,122,0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          {isListening
            ? <MicOff size={52} style={{ color: '#ffffff' }} strokeWidth={1.5} />
            : <Mic size={52} style={{ color: '#ffffff' }} strokeWidth={1.5} />
          }
        </button>

        <p style={{
          fontSize: '16px',
          color: isListening ? '#f472b6' : loading ? '#2d8b7a' : '#6b8a85',
          fontWeight: (isListening || loading) ? 500 : 400,
          marginBottom: '32px',
          textAlign: 'center',
          transition: 'color 0.2s',
        }}>
          {isListening ? 'Höre zu…' : loading ? 'Denke nach…' : 'Drücken und Frage stellen'}
        </p>

        {/* No destination hint */}
        {!destination && !question && !error && (
          <div className="card p-5 w-full text-center">
            <p style={{ fontSize: '14px', color: '#9bb5b0', lineHeight: 1.6 }}>
              Plane zuerst eine Reise, dann beantwortet dir dein Guide alle Fragen zum Reiseziel.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full p-4 rounded-2xl mb-3" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p style={{ fontSize: '14px', color: '#f472b6', textAlign: 'center' }}>{error}</p>
          </div>
        )}

        {/* Question */}
        {question && (
          <div className="w-full p-4 rounded-2xl mb-3" style={{ background: '#e8f5f3', border: '1px solid #a3d4ce' }}>
            <p style={{ fontSize: '11px', color: '#2d8b7a', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Deine Frage</p>
            <p style={{ fontSize: '15px', color: '#1a2e2b', fontStyle: 'italic' }}>„{question}"</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="card p-5 w-full space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-3/5 rounded" />
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="card p-5 w-full">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '11px', color: '#9bb5b0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Dein Guide</p>
              <button
                onClick={() => speak(answer)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95"
                style={{ background: '#e8f5f3', fontSize: '12px', color: '#2d8b7a', border: 'none', cursor: 'pointer' }}
              >
                <Volume2 size={12} strokeWidth={1.5} />
                Vorlesen
              </button>
            </div>
            <p style={{ fontSize: '15px', color: '#1a2e2b', lineHeight: 1.7 }}>{answer}</p>
          </div>
        )}

        {/* Example questions */}
        {destination && !question && !loading && (
          <div className="w-full mt-6">
            <p className="section-label mb-3 px-1">Beispiel-Fragen</p>
            <div className="space-y-2">
              {[
                `Was kann ich heute in ${destination} unternehmen?`,
                'Wo finde ich die besten lokalen Restaurants?',
                'Was sind die wichtigsten Sehenswürdigkeiten?',
                'Gibt es besondere Geheimtipps?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuestion(q); askGuide(q); }}
                  className="w-full text-left p-4 rounded-xl transition-all active:scale-[0.99]"
                  style={{ background: '#ffffff', border: '1px solid #e0eeec', fontSize: '14px', color: '#374151', cursor: 'pointer' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
