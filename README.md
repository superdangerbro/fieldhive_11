# FieldHive

A sophisticated field data collection system with offline capabilities and geospatial features.

## Features

- Progressive Web App (PWA) for mobile data collection
- Offline-first architecture
- Sophisticated form system
- Custom map features (points, lines, polygons)
- Floor plan overlay capability
- 1:M relationship between map features and inspection records

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Material-UI (MUI)
- Mapbox GL JS
- Redux Toolkit
- React Query
- PWA with Workbox
- IndexedDB for offline storage

### Backend
- Node.js + Express
- PostgreSQL with PostGIS
- Prisma ORM
- JWT Authentication

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Configure your database and Mapbox token

3. Start development servers:
   ```bash
   # Frontend
   cd frontend
   pnpm run dev

   # Backend
   cd backend
   pnpm run dev
   ```

## Mobile Features

- Offline data collection
- GPS location tracking
- Camera integration
- Map basemap switching (Streets, Satellite, Night mode)
- Sync status indicators
- Touch-optimized UI

## Project Structure

```
fieldhive/
├── frontend/           # React PWA
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   └── ...
│   └── ...
├── backend/           # Express API
│   ├── src/
│   ├── prisma/
│   └── ...
└── ...
```

## License

MIT 