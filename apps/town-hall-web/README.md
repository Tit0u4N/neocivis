# Town Hall Web

Next.js application that powers the municipal-facing portal. It is designed for
desktop browsers but reuses the shared `@repo/ui` package and `react-native-web`
to stay consistent with the citizen experiences.

## Prerequisites

- Node.js 24+ and Yarn 1 (the repo uses workspaces)
- All commands run from the monorepo root (`/Users/titouanlacombe--fabre/MIAGE/tpi-neocivis`)
- Environment variables (if any) loaded through `.env.local`

Install dependencies once at the root:

```bash
yarn install
```

## Local development

Use Turborepo filters to run only this app:

```bash
yarn turbo dev --filter=town-hall-web
```

Alternatively, `cd apps/town-hall-web` and run `yarn dev` to start the Next.js
dev server on http://localhost:3000.

## Building and previewing

```bash
yarn turbo build --filter=town-hall-web
yarn turbo start --filter=town-hall-web
```

`turbo build` runs `next build` and caches the resulting `.next` artifacts under
`apps/town-hall-web/.next`. `turbo start` maps to `next start` and serves the
production build.

## Linting

```bash
yarn turbo lint --filter=town-hall-web
```

This runs `next lint` with the shared ESLint config from the repo.

## Architecture notes

- Webpack aliases `react-native` to `react-native-web` (see `next.config.js`),
  enabling component reuse across mobile and web surfaces.
- Imports `@repo/ui` from the shared workspace to keep styles consistent.
- Build outputs are tracked by Turborepo (`.next/**`) for reproducible CI runs.

