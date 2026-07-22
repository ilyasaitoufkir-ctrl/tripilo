# Tripsilo — Dein Reiseplaner

Tripsilo ist ein personalisierter Reiseplaner. Gib Reiseziel, Budget, Dauer, Reiseart, Altersgruppe und Präferenzen ein — Tripsilo generiert einen vollständigen Tagesplan inkl. Restaurants, Aktivitäten, Geheimtipps und Hotelempfehlung.

## Features

- Personalisierter Reiseplan
- 20 Reisearten (multi-select)
- Altersgruppe, Küchenpräferenzen, Unterkunftstyp, Avoid-Optionen
- Google Places API — echte Orte, Fotos, Bewertungen
- Interaktive Karte + Tages-Route
- Plan teilen (Native Share / Clipboard)
- Reisen speichern & bewerten
- PWA — installierbar, offline lesbar
- Minimales helles Design

## Setup

```bash
npm install
```

`.env` erstellen:

```
VITE_ANTHROPIC_KEY=sk-ant-...
VITE_GOOGLE_PLACES_KEY=...
```

```bash
npm run dev
```

## Tech Stack

React · TypeScript · Vite · Tailwind CSS v4 · Lucide Icons · Google Places API · PWA
