import type { TripInput, TripPlan } from './types';

const travelTypeLabels: Record<string, string> = {
  strand: '🏖️ Strand & Meer',
  natur: '🏔️ Natur & Abenteuer',
  kultur: '🏛️ Kultur & Geschichte',
  party: '🎉 Party & Nightlife',
  food: '🍽️ Food & Genuss',
  familie: '👨‍👩‍👧 Familie',
};

export async function generateTripPlan(input: TripInput): Promise<TripPlan> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_KEY ist nicht gesetzt. Bitte .env Datei prüfen.');
  }

  // Support both legacy travelType (single) and new travelTypes (array)
  const types = input.travelTypes?.length
    ? input.travelTypes
    : input.travelType
      ? [input.travelType]
      : ['strand'];

  const travelLabel = types.map(t => travelTypeLabels[t] || t).join(', ');

  const prompt = `Erstelle einen detaillierten Reiseplan auf Deutsch:

Ziel: ${input.destination}
Budget: ${input.budget}€ für ${input.persons} Person(en)
Dauer: ${input.days} Tage
Reiseart: ${travelLabel}

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
