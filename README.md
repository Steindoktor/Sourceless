# Connect The World - 3D Browser Game

Ein Third-Person 3D-Browserspiel, entwickelt mit React, Three.js und FastAPI.

## Spielbeschreibung

**Kernidee**: Du läufst in Third-Person-Ansicht durch eine Stadt und bringst Internet-Kästen an Häusern an. Jedes angeschlossene Haus erhöht deinen Score. Ziel ist es, die Versorgung auszubauen: von einer Straße zur Stadt, dann zum Land und schließlich zur ganzen Welt - aber Vorsicht vor den Regierungsbeamten!

## Features

### Gameplay
- **Third-Person Steuerung**: WASD für Bewegung, Maus zum Umsehen
- **Platzierungsmechanik**: Drücke E in der Nähe eines Hauses, um einen Internet-Kasten anzubringen
- **Progression-System**: 4 Level (Straße → Stadt → Land → Welt)
- **NPC-AI**: Regierungsbeamte mit Patrol, Chase und Arrest States
- **Echtzeit-Feedback**: Häuser leuchten grün wenn online, visuelle Highlights für Interaktion

### Levels
1. **STRASSE**: 20 Häuser, 1 Beamter (Tutorial-Level)
2. **STADT**: 200 Häuser, 3 Beamte (Mittelschwer)
3. **LAND**: 2000 Häuser, 8 Beamte (Schwer)
4. **WELT**: 20000 Häuser, 15+ Beamte (Endlevel)

### Technische Features
- Modernes UI mit grünem Neon-Design (inspiriert von SourceLess)
- Responsive Design (Desktop + Mobile-ready)
- Score-Tracking API mit FastAPI + MongoDB
- Prozedural generierte Häuseranordnung
- Optimierte 3D-Performance

## Steuerung

### Desktop
- **WASD**: Bewegung (Vorwärts, Links, Rückwärts, Rechts)
- **Maus**: Kamera drehen (nach Pointer-Lock)
- **Shift**: Sprint
- **E**: Internet-Kasten anbringen
- **ESC**: Pause-Menü

## Technologie-Stack

### Frontend
- **React 19**: UI Framework
- **Three.js + @react-three/fiber**: 3D-Rendering
- **@react-three/drei**: 3D-Helpers
- **Tailwind CSS**: Styling
- **Shadcn/UI**: UI-Komponenten

### Backend
- **FastAPI**: REST API
- **MongoDB**: Datenbank für Scores
- **Motor**: Async MongoDB Driver

## API Endpoints

### GET /api/
Healthcheck - Status der API

### POST /api/scores
Neuen Score speichern

### GET /api/scores?limit=10
Top High Scores abrufen

### GET /api/stats
Spiel-Statistiken

---

**Viel Spaß beim Vernetzen der Welt! 🌍🔌**
