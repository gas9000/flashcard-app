# Flashcard Study App

A modern flashcard application with spaced repetition learning powered by the SM-2 algorithm.

## Features

- **Smart Spaced Repetition**: Uses the proven SuperMemo-2 (SM-2) algorithm for optimal review scheduling
- **Deck Management**: Organize cards into decks with categories
- **Study Mode**: Interactive study sessions with quality-based feedback
- **Progress Tracking**: Detailed statistics on learning progress
- **Modern UI**: Built with React 19, TailwindCSS v4, and Shadcn UI
- **Type-Safe**: Full TypeScript support throughout

## Tech Stack

### Frontend
- **React 19** - Latest React with new features
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **Tailwind CSS v4** - Modern utility-first CSS
- **Shadcn UI** - Beautiful component library
- **Better-auth** - Authentication

### Backend
- **Bun** - Fast JavaScript runtime and package manager
- **Better-auth** - Email/password authentication
- **Drizzle ORM** - Type-safe SQL ORM
- **SQLite** - Lightweight database
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Bun v1.0+ (https://bun.sh)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up the database:
```bash
bun run src/server/db/migrate.ts
```

### Development

Run the backend server:
```bash
bun run src/server/index.ts
```

In another terminal, run the frontend dev server:
```bash
bun run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Build

Build the frontend:
```bash
bun run build
```

### API Documentation

See [API.md](./API.md) for complete API documentation.

## How It Works

### Spaced Repetition (SM-2 Algorithm)

The app uses the SuperMemo-2 algorithm to schedule card reviews:

1. **Quality Ratings (0-5)**:
   - 0: Complete blackout
   - 1: Incorrect, but recognized
   - 2: Incorrect, but seemed easy
   - 3: Correct with difficulty
   - 4: Correct with hesitation
   - 5: Perfect recall

2. **Scheduling**:
   - First review: 1 day
   - Second review: 6 days
   - Subsequent reviews: Based on easiness factor (EF)
   - Failed reviews (quality < 3): Reset to day 1

3. **Easiness Factor**:
   - Starts at 2.5
   - Adjusts based on quality ratings
   - Minimum of 1.3
   - Higher EF = longer intervals between reviews

## License

MIT
