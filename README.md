# PokéBloqIt

A Pokédex-style web application built with React, TypeScript, and IndexedDB.
Users can browse Pokémon, view detailed data, catch/release them, and retain
knowledge of previously seen Pokémon — even offline.

## Features

- Browse Pokémon with pagination
- Grid and table views
- Filter by name, type, and caught status
- Sort Pokémon by ID, name, type, height, weight, or caught date
- View detailed Pokémon data in a modal
- Catch and release Pokémon
- Attach a free-text Note to each caught Pokémon
- Persistent Pokédex using IndexedDB
- Offline support with queued actions
- Retains Pokémon data once seen (Pokédex memory)

## Tech Stack

- **React** + **TypeScript**
- **React Router** for routing
- **@tanstack/react-query** for data fetching and caching
- **IndexedDB** (via `idb`) for persistence
- **Tailwind CSS** for styling
- **tailwind-merge + clsx** for class composition
- **Service Worker** for runtime caching

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/Vascoide/pokebloqit.git
cd pokebloqit
npm install
```

### Running the app

```bash
npm run dev
```

### Then open

```bash
http://localhost:5173
```

## 6️⃣ Project structure (high-level)

This helps people understand your mental model.

```md
## Project Structure

src/
├─ components/ # UI components (grid, table, modals)
├─ hooks/ # Custom hooks (dex, queries, offline sync)
├─ libs/ # IndexedDB, helpers, service worker utils
├─ types/ # Shared TypeScript types
├─ queryClient.ts # React Query configuration
└─ App.tsx

## Architectural Decisions

### Pokédex persistence

Caught Pokémon and previously seen Pokémon data are persisted in IndexedDB.
This allows the app to emulate a real Pokédex experience where knowledge is
retained once discovered.

### Data fetching

React Query is used to manage API requests, caching, and background updates.
Detailed Pokémon data is fetched lazily when a Pokémon is opened.

### Offline support

User actions such as catching or releasing Pokémon are queued when offline
and replayed once connectivity is restored.

### Sorting & filtering

Filtering, sorting, and pagination are handled in a specific order:

1. Filter full dataset
2. Sort filtered results
3. Paginate the sorted list

This ensures consistent behavior across pages.
```

## Assignment

The original exercise description can be found in
[ASSIGNMENT.md](./ASSIGNMENT.md).
