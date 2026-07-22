# Tripsilo — KI Reiseplaner

Tripsilo ist ein KI-gestützter Reiseplaner powered by Claude AI. Gib Reiseziel, Budget, Dauer und Reiseart ein — Tripsilo generiert einen vollständigen Tagesplan inkl. Restaurants, Aktivitäten, Geheimtipps und Hotelempfehlung.

## Features

- KI-Reiseplan via Claude Haiku
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

React · TypeScript · Vite · Tailwind CSS v4 · Lucide Icons · Claude Haiku · Google Places API · PWA
