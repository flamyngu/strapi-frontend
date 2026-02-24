# Strapi Articles Frontend

Ein modernes React + Vite Frontend für das Strapi CMS Article Listing.

## Voraussetzungen

- Node.js 18+
- Strapi läuft auf `http://localhost:1337`

## Setup

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Das Frontend läuft dann unter `http://localhost:5173`.

## Strapi Konfiguration

Stelle sicher, dass die `articles` Collection in Strapi öffentlich lesbar ist:

**Settings → Users & Permissions → Roles → Public → Article → find**

## Build

```bash
npm run build
npm run preview
```

## Projektstruktur

```
src/
├── components/
│   ├── Header.jsx        # Seitenkopf mit Titel & Datum
│   ├── Header.css
│   ├── ArticleCard.jsx   # Artikel-Kachel
│   └── ArticleCard.css
├── App.jsx               # Haupt-App mit Fetch-Logik
├── App.css
├── index.css             # Globale Styles
└── main.jsx              # Entry Point
```
