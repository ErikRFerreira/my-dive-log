# Dive Log

A full-stack scuba diving logbook app for recording dives, tracking locations, and reviewing personal dive history.

## Overview

Dive Log helps divers keep structured records of each dive (depth, duration, conditions, equipment, notes, and photos), then explore that data through filters, maps, and dashboard stats.

The app is built around a user-owned data model: each authenticated diver can manage only their own profile, dives, and locations.

## Core Features

- Email/password and Google authentication (Supabase Auth)
- Multi-step dive logging workflow with draft persistence
- Dive history with filtering, sorting, search, and pagination
- Location management with map visualization and favorites
- Dashboard statistics and charts
- Photo upload and gallery support for dives
- AI-assisted dive summary generation
- Account deletion flow with full user-data cleanup

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router
- Styling/UI: Tailwind CSS v4, Radix UI, Lucide icons
- State/Data: TanStack Query, React Hook Form, Zustand, Zod
- Backend services: Vercel Serverless Functions (`/api/*`)
- Data/Auth/Storage: Supabase (Postgres, Auth, Storage)
- ORM/Schema tooling: Prisma
- Testing: Vitest + Testing Library

## High-Level Architecture / Data Flow

High-level request flow:

1. The React app authenticates users with Supabase Auth.
2. Client-side features read/write core entities (dives, locations, profiles, photos) through Supabase.
3. For external integrations, the client calls protected Vercel API routes:
   - `/api/geocode-location` (Nominatim geocoding)
   - `/api/summarize-dive` (AI summary generation)
   - `/api/delete-account` (secure account/data deletion)
4. API routes validate bearer tokens, verify the user with Supabase, and then process the request.
5. Supabase Row Level Security (RLS) enforces per-user data access at the database layer.

## Security & Data Access

- Authentication is handled through Supabase Auth (JWT-based sessions).
- Authorization is enforced in two layers:
  - API layer: protected serverless endpoints require valid bearer tokens.
  - Database layer: Supabase RLS restricts user data access to resource owners.
- All user-facing data operations are designed around per-user isolation.

Detailed RLS policy definitions are documented separately in:

- [`docs/SUPABASE_RLS.md`](./docs/SUPABASE_RLS.md)

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- Supabase project (for Auth/DB/Storage)

### Install and run

```bash
npm install
```

Run frontend:

```bash
npm run dev:web
```

Run serverless API locally (separate terminal):

```bash
npm run dev:api
```

Notes:

- Vite runs the web app (default `http://localhost:5173`).
- `vercel dev` runs API routes on `http://localhost:3000`.
- Vite is configured to proxy `/api` requests to `http://localhost:3000`.

## Environment Variables

Documented names only (no values):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (server fallback)
- `SUPABASE_ANON_KEY` (server fallback)
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `NOMINATIM_USER_AGENT`
- `DATABASE_URL`

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:web` - Start Vite dev server (explicit web command)
- `npm run dev:api` - Start Vercel local API server on port 3000
- `npm run build` - Type-check and production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on `src/**/*.{ts,tsx}`
- `npm run format` - Format source/docs files with Prettier
- `npm run test` - Run test suite once
- `npm run test:watch` - Run tests in watch mode
- `npm run seed` - Run Prisma seed script

## Project Structure

```text
api/         Vercel serverless functions and auth utilities
docs/        Extended technical documentation
prisma/      Prisma schema and seed script
public/      Static assets
src/         React application code
```

Inside `src/`, feature modules are grouped under `src/features/` (authentication, dives, locations, dashboard, profile, settings, and log-dive flow).

## Documentation Index

Core references:

- [Supabase RLS policies](./docs/SUPABASE_RLS.md)
- [API authentication for serverless routes](./docs/security/api-authentication.md)
- [AI summary generation internals](./docs/ai-summary-generation.md)
- [Database schema / data model (Prisma)](./prisma/schema.prisma)
- [SQL maintenance script: cleanup unused locations](./docs/sql/cleanup-unused-locations.sql)
- [AI prompt notes](./docs/ai-prompts.md)

Architectural decisions:

- No formal ADR directory is present yet. Add ADRs under `docs/` as needed.

Detailed documentation is kept in `./docs` so this README remains easy to scan while deeper implementation details stay versioned and discoverable.

## Roadmap

- Add formal ADRs for key architecture decisions.
- Add usage/rate limiting on external-integration API routes.
- Expand operational documentation (monitoring, incident handling, backups).
