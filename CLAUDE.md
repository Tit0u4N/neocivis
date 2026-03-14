# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
        ├── modules/        # Business logic: {feature}.service.ts / .repository.ts / .types.ts
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
| **Service** | `src/modules/{feature}/` | All business logic |
| **Repository** | `src/modules/{feature}/` | Data access only (in-memory now, ORM later) |

### Rules
- **EXACTLY 2 gateways**: `citizen` (`/api/citizen/*`) and `municipality` (`/api/municipality/*`) — never create a 3rd
- **Auth**: JWT Bearer tokens via Keycloak — validated in `src/middleware/`, never trust client-sent identity
- **Validation**: Zod schemas in `packages/shared` — validate all request input in controllers via `safeParse()`
- **Errors**: All errors returned as JSON to the frontend — error middleware in `src/middleware/`

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