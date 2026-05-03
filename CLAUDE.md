# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Reference Documents

- **Always read before any task**: [`agent/project-context.md`](agent/project-context.md) — complete rules, stack versions, architecture patterns, and critical anti-patterns for the entire project
- **Read before any frontend task** (`town-hall-web`, `citizen-app`, `keycloak-theme`): [`agent/design-system.md`](agent/design-system.md) — design tokens, brand guidelines, component specs, motion rules, and DO/DON'Ts for both the `citizen` and `town-hall` brands
- **Read before any api test task**: [`agent/api-bruno-instructions.md`](agent/api-bruno-instructions.md) — instructions for using Bruno API client to test the backend API endpoints

## Project Overview

NeoCivis is a monorepo for a municipal services platform (TPI - MIAGE MBDS 2025-2026). It contains:
- **town-hall-web**: Next.js 16 web app for municipal staff (web and desktop)
- **citizen-app**: Expo/React Native app for citizens (mobile + web)
- **backend**: Hono API on Azure Functions v4 (serverless REST API)

## Commands

All commands run from monorepo root unless noted otherwise.

```bash
# Development (all apps)
bun turbo dev

# Development (single app)
bun turbo dev --filter=town-hall-web
bun turbo dev --filter=citizen-app
bun turbo dev --filter=backend

# Build
bun turbo build --filter=town-hall-web
bun turbo build --filter=citizen-app
bun turbo build --filter=backend

# Lint with Biome
bun lint

# Format with Biome
bun format

# Lint with ESLint (Next.js app only)
bun turbo lint --filter=town-hall-web

# Clean all
bun clean
```

For quick local development, you can also run `bun dev` directly from an app directory.

## Monorepo Architecture

```
apps/
├── town-hall-web/          # Next.js 16 + React 19 (municipal portal)
│   └── src/
│       ├── app/            # Next.js App Router
│       ├── components/ui/  # shadcn/ui components (base-mira style)
│       └── lib/utils.ts    # cn() helper
├── citizen-app/            # Expo 54 + React Native (citizen mobile app)
│   └── src/
│       ├── app/            # Expo Router
│       └── components/
└── backend/                # Hono + Azure Functions v4 (REST API)
    └── src/
        ├── index.ts        # Azure Functions entry point (2 HTTP triggers)
        ├── gateways/       # citizen/ and municipality/ — one Hono app each
        │   ├── citizen/
        │   │   ├── citizen.gateway.ts
        │   │   └── controllers/
        │   └── municipality/
        │       ├── municipality.gateway.ts
        │       └── controllers/
        ├── modules/        # Business logic par module (voir structure ci-dessous)
        └── middleware/     # Hono middleware (auth, errors, logging, CORS)

packages/
├── frontend/
│   ├── frontend-core/      # @repo/frontend-core - shared frontend utilities (tsup build)
│   ├── frontend-services/  # @repo/frontend-services - shared business logic services (tsup build)
│   └── ui/                 # Shared UI components (WIP)
└── shared/
    ├── typescript-config/  # @repo/typescript-config - shared TS configs
    ├── metro-cache-key/    # Metro bundler cache key
    └── shared/             # @repo/shared - Zod schemas + types shared by backend AND frontend (to be created)
```

## Key Technologies

| App | Framework | UI Library | Styling |
|-----|-----------|------------|---------|
| town-hall-web | Next.js 16, React 19 | shadcn/ui + @base-ui/react | Tailwind CSS v4 |
| citizen-app | Expo 54, React Native | Custom UI components | React Native StyleSheet + theme system |
| backend | Hono v4, Azure Functions v4 | — | — |

Both frontend apps share `@repo/frontend-core` for common utilities. Backend and frontend share `@repo/shared` for Zod schemas and types.

## Frontend Architecture (MVVM)

Components follow the MVVM pattern with clear separation of concerns:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Model (Service)** | `packages/frontend/` | Data fetching, API calls, business logic services |
| **ViewModel** | `useComponentName.ts` hook | Business logic, state management, exposes data/actions to View |
| **View** | `ComponentName.tsx` | Render only - JSX, animations, no business logic |

### File Structure Example
```
components/
└── UserProfile/
    ├── UserProfile.tsx        # View - render function only
    └── useUserProfile.ts      # ViewModel - business logic hook
```

### Guidelines
- **View (.tsx)**: Only contains the render function and animation logic. All data and handlers come from the ViewModel hook's return value.
- **ViewModel (hook)**: Contains all business logic ("métier"), state, effects, and event handlers. Returns everything the View needs.
- **Model (services)**: Shared services in `packages/frontend/` for data access and reusable business logic.

```tsx
// useUserProfile.ts (ViewModel)
export function useUserProfile(userId: string) {
	const [user, setUser] = useState<User | null>(null);
	const handleUpdate = async (data: UserData) => { /* ... */ };
	return { user, handleUpdate, isLoading };
}

// UserProfile.tsx (View)
export function UserProfile({ userId }: Props) {
	const { user, handleUpdate, isLoading } = useUserProfile(userId);
	return <div>...</div>;
}
```

## Code Style

- **Formatter/Linter**: Biome (2 spaces, 120 char lines, single quotes, semicolons)
- **Import organization**: Automatic via Biome
- **Default exports**: Only for Next.js pages/layouts (use `// biome-ignore lint/style/noDefaultExport`)
- **Path aliases**: `@/*` maps to `./src/*` in both apps
- **Language**: French locale (`lang="fr"` in root layouts)

## Git Workflow

- **Branches**: `main` (production), `develop` (integration), `dev/#issue-name` (features), `fix/#issue-name` (bugs)
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **PRs**: Target `develop`, require 2 reviewers

## Backend Architecture (Gateway/Controller/Service/Repository)

The backend follows a strict 4-layer architecture:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Gateway** | `src/gateways/{module}/` | Azure Function entry, Hono routing, DI wiring |
| **Controller** | `src/gateways/{module}/controllers/` | Route handlers, request validation, no business logic |
| **Service** | `src/modules/{module}/service/` | All business logic |
| **Repository** | `src/modules/{module}/repository/` | Data access only (in-memory now, ORM later) |

### Structure d'un module (référence: `users`)

Les “modules” backend sont organisés **par domaine** (ex: `users`, `article`, `upload`) et contiennent la logique métier, la persistance, et (optionnellement) le seed.

Structure typique:

```
apps/backend/src/modules/
└── users/
    ├── repository/
    │   ├── user.repository.interface.ts   # contrat du repository (port)
    │   ├── user.inmemory.repository.ts    # impl in-memory (dev/tests)
    │   ├── user.{DB impl}.repository.ts   # impl DB (drizzle ou cosmos)
    │   └── user.table.ts                  # mapping/table/schema DB (optionel)
    ├── service/
    │   ├── user.service.ts                # logique métier (use-cases)
    │   └── user.service.test.ts           # tests de service
    ├── seed/
    │   ├── user.seed.ts                   # source des données de seed (dev)
    │   └── user.seeder.ts                 # orchestrateur de seed (impl `ISeeder`)
    └── user.types.ts                      # types domaine (ex: `User`, `BaseUserRole`)
```

Guidelines:
- **Controllers**: validation/format d'entrée + mapping DTO → service. Zéro logique métier.
- **Services**: logique métier pure (use-cases), dépend de `repository` et éventuellement d'autres services (ex: `IAMService`).
- **Repositories**: accès données uniquement. Plusieurs implémentations possibles (in-memory, drizzle, etc.).
- **Seeders**: un `*.seeder.ts` par module si besoin, branché dans l'auto-seed global.

### Rules
- **EXACTLY 2 gateways**: `citizen` (`/api/citizen/*`) and `municipality` (`/api/municipality/*`) — never create a 3rd
- **Auth**: JWT Bearer tokens via Keycloak — validated in `src/middleware/`, never trust client-sent identity
- **Validation**: Zod schemas in `packages/shared` — validate all request input in controllers via `safeParse()`
- **Errors**: All errors returned as JSON to the frontend — error middleware in `src/middleware/`
- **Réponses HTTP (contrôleurs)** : tout corps JSON renvoyé par un contrôleur doit être typé comme un **DTO défini dans `@repo/contracts`** (types exportés par le package `packages/shared/contracts`, ex. schémas Zod + `z.infer`, ou fichiers `*.dto.ts`). Ne pas exposer directement des entités domaine ou des types internes au backend. Chaque handler de contrôleur doit avoir un **type de retour explicite** : utiliser `Promise<ControllerJson<…>>` (`src/gateways/controller-json-response.ts`) — succès (`T` + code HTTP) **et** erreurs `ApiErrorDto` sur les codes client prévus par défaut ; passer `readonly []` comme 3ᵉ paramètre de `ControllerJson` si le handler ne renvoie jamais d’erreur JSON. Pour les succès, garder une variable ou annotation du **DTO de contrat** (ex. `const body: Article = …; return c.json(body)`).

### Backend Commands
```bash
# From monorepo root
bun turbo dev --filter=backend
bun turbo build --filter=backend
bun turbo test --filter=backend

# From apps/backend/ directly
bun run dev       # watch + func start
bun run build
bun run test
bru run --env local   # API tests (Bruno)
```

## Package Dependencies

When adding shared functionality:
- **Frontend only**: Add to `@repo/frontend-core` or `@repo/frontend-services`
- **Backend + Frontend (types, Zod schemas)**: Add to `@repo/shared`
- **Backend only**: Add directly to `apps/backend`

After any package change: `bun turbo build --filter=@repo/<package-name>`