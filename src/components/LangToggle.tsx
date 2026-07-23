import { useLanguage } from '../context/LanguageContext';

export function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
      <button
        onClick={() => setLang('de')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          color: lang === 'de' ? '#2d8b7a' : '#9bb5b0',
          fontWeight: lang === 'de' ? 700 : 500,
          fontSize: '13px',
        }}
      >
        DE
      </button>
      <span style={{ color: '#e0eeec', lineHeight: 1 }}>|</span>
      <button
        onClick={() => setLang('en')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          color: lang === 'en' ? '#2d8b7a' : '#9bb5b0',
          fontWeight: lang === 'en' ? 700 : 500,
          fontSize: '13px',
        }}
      >
        EN
      </button>
    </div>
  );
}
