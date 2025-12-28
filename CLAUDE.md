# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeoCivis is a monorepo for a municipal services platform (TPI - MIAGE MBDS 2025-2026). It contains:
- **town-hall-web**: Next.js 16 web app for municipal staff (web and desktop)
- **citizen-app**: Expo/React Native app for citizens (mobile + web)

## Commands

All commands run from monorepo root unless noted otherwise.

```bash
# Development (all apps)
yarn turbo dev

# Development (single app)
yarn turbo dev --filter=town-hall-web
yarn turbo dev --filter=citizen-app

# Build
yarn turbo build --filter=town-hall-web
yarn turbo build --filter=citizen-app

# Lint with Biome
yarn lint

# Format with Biome
yarn format

# Lint with ESLint (Next.js app only)
yarn turbo lint --filter=town-hall-web

# Clean all
yarn clean
```

For quick local development, you can also run `yarn dev` directly from an app directory.

## Monorepo Architecture

```
apps/
├── town-hall-web/          # Next.js 16 + React 19 (municipal portal)
│   └── src/
│       ├── app/            # Next.js App Router
│       ├── components/ui/  # shadcn/ui components (base-mira style)
│       └── lib/utils.ts    # cn() helper
└── citizen-app/            # Expo 54 + React Native (citizen mobile app)
    └── src/
        ├── app/            # Expo Router
        └── components/

packages/
├── frontend/
│   ├── frontend-core/      # @repo/frontend-core - shared frontend utilities (tsup build)
│   └── ui/                 # Shared UI components (WIP)
└── shared/
    ├── typescript-config/  # @repo/typescript-config - shared TS configs
    └── metro-cache-key/    # Metro bundler cache key
```

## Key Technologies

| App | Framework | UI Library | Styling |
|-----|-----------|------------|---------|
| town-hall-web | Next.js 16, React 19 | shadcn/ui + @base-ui/react | Tailwind CSS v4 |
| citizen-app | Expo 54, React Native | gluestack-ui | NativeWind + Tailwind CSS v4 |

Both apps share `@repo/frontend-core` for common utilities.

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

- **Formatter/Linter**: Biome (tabs, 120 char lines, double quotes, semicolons)
- **Import organization**: Automatic via Biome
- **Default exports**: Only for Next.js pages/layouts (use `// biome-ignore lint/style/noDefaultExport`)
- **Path aliases**: `@/*` maps to `./src/*` in both apps
- **Language**: French locale (`lang="fr"` in root layouts)

## Git Workflow

- **Branches**: `main` (production), `develop` (integration), `dev/#issue-name` (features), `fix/#issue-name` (bugs)
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **PRs**: Target `develop`, require 2 reviewers

## Package Dependencies

When adding shared functionality:
1. Add to `@repo/frontend-core` if used by both apps
2. Run `yarn turbo build --filter=@repo/frontend-core` after changes
3. Import from `@repo/frontend-core` in apps