import type { TripInput, TripPlan } from './types';
import type { Language } from './i18n/translations';

const travelTypeLabels: Record<string, string> = {
  strand:      'Strand & Meer',
  natur:       'Natur & Landschaft',
  kultur:      'Kultur & Geschichte',
  staedte:     'Städtetrip',
  food:        'Food & Genuss',
  party:       'Party & Nightlife',
  abenteuer:   'Abenteuer & Outdoor',
  wellness:    'Wellness & Erholung',
  sport:       'Sport & Aktivitäten',
  shopping:    'Shopping',
  romantik:    'Romantik',
  roadtrip:    'Road Trip',
  backpacking: 'Backpacking',
  luxus:       'Luxusreise',
  trekking:    'Trekking & Wandern',
  familie:     'Familienurlaub',
  winter:      'Winterurlaub',
  kreuzfahrt:  'Kreuzfahrt',
  fotografie:  'Fotografie & Natur',
  yoga:        'Yoga & Retreat',
};

export async function generateTripPlan(input: TripInput, language: Language = 'de'): Promise<TripPlan> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_KEY ist nicht gesetzt. Bitte .env Datei prüfen.');
  }

  const types = input.travelTypes?.length
    ? input.travelTypes
    : input.travelType
      ? [input.travelType]
      : ['strand'];

  const travelLabel = types.map((t) => travelTypeLabels[t] || t).join(', ');

  const lines = [
    `Ziel: ${input.destination}`,
    `Budget: ${input.budget}€ für ${input.persons} Person(en)`,
    `Dauer: ${input.days} Tage`,
    `Reisearten: ${travelLabel}`,
  ];
  if (input.ageGroup)          lines.push(`Altersgruppe: ${input.ageGroup} Jahre`);
  if (input.cuisines?.length)  lines.push(`Küchenpräferenzen: ${input.cuisines.join(', ')}`);
  if (input.accommodation)     lines.push(`Unterkunft: ${input.accommodation}`);
  if (input.avoid?.length)     lines.push(`Bitte vermeiden: ${input.avoid.join(', ')}`);

  const isFitness = types.some((t) => ['sport', 'sportevents', 'trekking'].includes(t));
  const fitnessContext = isFitness ? `

Fitness-Integration (Pflicht da Sporturlaub gewählt):
- Morgens IMMER eine sportliche Aktivität (Laufen, Schwimmen, Radfahren, Yoga, Workout)
- Konkrete Laufstrecken oder Sportstätten in ${input.destination} empfehlen
- Fitnessstudios, Outdoor-Sport-Spots und Yoga-Studios nennen
- Restaurants bevorzugen die gesunde Bowls, Smoothies, hochwertige Proteinmahlzeiten anbieten
- Abendaktivitäten sportlich halten (Yoga, Stretching, leichte Wanderung)
- Beispiele Morgen: "Laufen entlang der Promenade (8km)", "Outdoor CrossFit am Strand", "Schwimmen im Meer"` : '';

  const langInstruction = language === 'en'
    ? 'Respond entirely in English.'
    : 'Antworte vollständig auf Deutsch.';

  const prompt = `${langInstruction}

Erstelle einen detaillierten, personalisierten Reiseplan:

${lines.join('\n')}${fitnessContext}

Erstelle einen Plan als JSON:
{
  "destination": "Stadtname",
  "country": "Land",
  "budget_breakdown": {
    "hotel": 0,
    "essen": 0,
    "aktivitaeten": 0,
    "transport": 0
  },
  "geheimtipps": ["tipp1", "tipp2", "tipp3"],
  "days": [
    {
      "day": 1,
      "title": "Ankunft & erste Erkundung",
      "morning": {
        "activity": "Aktivität",
        "description": "Beschreibung",
        "cost": 0,
        "tip": "Geheimtipp"
      },
      "lunch": {
        "restaurant": "Name",
        "description": "Was essen",
        "cost": 0,
        "tip": "Bestell das!"
      },
      "evening": {
        "activity": "Aktivität",
        "description": "Beschreibung",
        "cost": 0,
        "tip": "Tipp"
      }
    }
  ],
  "hotel_empfehlung": {
    "name": "Hotel Name",
    "beschreibung": "Warum dieses Hotel",
    "preis_pro_nacht": 0,
    "tipp": "Buchungstipp"
  },
  "transport_tipps": ["tipp1", "tipp2"],
  "beste_reisezeit": "Monat",
  "warnung": "Was vermeiden"
}

Erstelle genau ${input.days} Tage im "days" Array. Budget-Breakdown soll zusammen ca. ${input.budget}€ ergeben.
Passe alle Empfehlungen an die Reisearten, Präferenzen und Altersgruppe an.
Nur JSON zurückgeben, kein Text davor oder danach!`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Fehler ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text: string = data.content[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Kein JSON in der Antwort gefunden.');

  return JSON.parse(jsonMatch[0]) as TripPlan;
}
