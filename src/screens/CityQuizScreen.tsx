import { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

interface QuizQuestion {
  question: string;
  answers: string[];
  correct: number;
  fact: string;
}

interface Props {
  destination: string;
}

export function CityQuizScreen({ destination }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (destination) generateQuiz();
  }, [destination]);

  const generateQuiz = async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setAnswered(null);

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
          max_tokens: 1400,
          messages: [
            {
              role: 'user',
              content: `Erstelle 5 interessante Quizfragen über ${destination} auf Deutsch. Mix aus Geschichte, Kultur, Essen und Fakten.

Antworte NUR als reines JSON-Objekt (kein Markdown, kein Text davor/danach):
{"questions":[{"question":"Frage?","answers":["A","B","C","D"],"correct":0,"fact":"Interessanter Fakt dazu!"}]}

"correct" ist der Index (0-3) der richtigen Antwort. Erstelle genau 5 Fragen.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const raw = data.content?.[0]?.text ?? '';
      const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}';
      const parsed = JSON.parse(jsonStr);
      const qs: QuizQuestion[] = parsed.questions ?? [];
      if (qs.length === 0) throw new Error('Keine Fragen erhalten');
      setQuestions(qs);
    } catch {
      setError('Quiz konnte nicht geladen werden. Nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === questions[currentQ].correct) setScore((s) => s + 1);
    setTimeout(() => {
      setCurrentQ((q) => q + 1);
      setAnswered(null);
    }, 2400);
  };

  const getAnswerStyle = (i: number): React.CSSProperties => {
    if (answered === null)
      return { background: '#ffffff', border: '1.5px solid #e8e8ed', color: '#1c1c1e' };
    if (i === questions[currentQ]?.correct)
      return { background: '#dcfce7', border: '1.5px solid #22c55e', color: '#15803d' };
    if (i === answered)
      return { background: '#fce7f3', border: '1.5px solid #f472b6', color: '#be185d' };
    return { background: '#f9f9f9', border: '1.5px solid #e8e8ed', color: '#aeaeb2' };
  };

  const getResultEmoji = () => {
    if (score >= 4) return '🏆';
    if (score >= 2) return '😊';
    return '📚';
  };

  const getResultText = () => {
    if (score >= 4) return `Du bist bereit für ${destination}!`;
    if (score >= 2) return 'Gute Leistung! Du weißt schon einiges.';
    return 'Noch etwas üben — dann klappt es!';
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fafafa' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid #e8e8ed' }}>
        <p className="section-label mb-1">Tripsilo</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0eeff' }}>
            <HelpCircle size={20} strokeWidth={1.5} style={{ color: '#8b7cf8' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1c1c1e', letterSpacing: '-0.3px' }}>
              Stadt Quiz
            </h1>
            {destination && <p style={{ fontSize: '13px', color: '#aeaeb2' }}>{destination}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* No destination */}
        {!destination && (
          <div className="card p-7 text-center space-y-3">
            <div style={{ fontSize: '48px' }}>🗺️</div>
            <p style={{ fontSize: '16px', fontWeight: 500, color: '#1c1c1e' }}>Kein Reiseziel gewählt</p>
            <p style={{ fontSize: '14px', color: '#aeaeb2', lineHeight: 1.6 }}>
              Plane zuerst eine Reise — das Quiz wird dann automatisch für dein Reiseziel erstellt.
            </p>
          </div>
        )}

        {/* Error */}
        {error && destination && (
          <div className="card p-6 text-center space-y-4">
            <p style={{ fontSize: '14px', color: '#f472b6' }}>{error}</p>
            <button
              onClick={generateQuiz}
              className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: '#8b7cf8', color: '#ffffff', fontSize: '14px', border: 'none', cursor: 'pointer' }}
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card p-8 flex flex-col items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-full" />
            <p style={{ fontSize: '14px', color: '#aeaeb2' }}>Quiz wird erstellt für {destination}…</p>
          </div>
        )}

        {/* Result screen */}
        {!loading && !error && questions.length > 0 && currentQ >= questions.length && (
          <div className="card p-8 text-center space-y-5">
            <div style={{ fontSize: '72px' }}>{getResultEmoji()}</div>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: 600, color: '#1c1c1e', letterSpacing: '-1px' }}>
                {score}/{questions.length}
              </h2>
              <p style={{ fontSize: '17px', color: '#8b7cf8', fontWeight: 500, marginTop: '4px' }}>
                richtige Antworten
              </p>
            </div>
            <p style={{ fontSize: '15px', color: '#6e6e73', lineHeight: 1.5 }}>{getResultText()}</p>
            <button
              onClick={generateQuiz}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background: '#8b7cf8',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} strokeWidth={1.5} />
              Nochmal spielen
            </button>
          </div>
        )}

        {/* Active question */}
        {!loading && !error && questions.length > 0 && currentQ < questions.length && (() => {
          const q = questions[currentQ];
          return (
            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: '13px', color: '#6e6e73' }}>
                    Frage {currentQ + 1} von {questions.length}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#8b7cf8' }}>
                    {score} Punkte
                  </span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '4px', background: '#e8e8ed' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${((currentQ) / questions.length) * 100}%`,
                      background: 'linear-gradient(90deg, #8b7cf8, #a78bfa)',
                      transition: 'width 0.4s ease',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="card p-5">
                <p style={{ fontSize: '18px', fontWeight: 500, color: '#1c1c1e', lineHeight: 1.45 }}>
                  {q.question}
                </p>
              </div>

              {/* Answer buttons */}
              <div className="space-y-2">
                {q.answers.map((ans, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered !== null}
                    className="w-full text-left p-4 rounded-xl transition-all active:scale-[0.99] disabled:cursor-default"
                    style={{ ...getAnswerStyle(i), fontSize: '15px', cursor: answered !== null ? 'default' : 'pointer' }}
                  >
                    <span style={{ fontWeight: 600, marginRight: '10px', opacity: 0.5 }}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {ans}
                  </button>
                ))}
              </div>

              {/* Fact bubble */}
              {answered !== null && (
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: '#f0eeff', border: '1px solid #c4b5fd', animation: 'fadeIn 0.3s ease' }}
                >
                  <p style={{ fontSize: '13px', color: '#7c3aed', lineHeight: 1.65 }}>
                    💡 {q.fact}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
