---
project_name: 'tpi-neocivis'
user_name: 'Titouan'
date: '2026-03-05'
sections_completed: ['technology_stack', 'language_specific_rules', 'framework_specific_rules', 'backend_rules', 'testing_rules', 'code_quality_style', 'workflow_rules', 'critical_dont_miss']
status: 'complete'
rule_count: 115
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Monorepo
- **Package Manager**: bun — DO NOT use npm, pnpm, or yarn
- **Orchestrator**: Turborepo 2.6.1
- **Node**: >=20.9.0
- **Language**: TypeScript ~5.9.3 (strict mode enabled everywhere)

### town-hall-web (Municipal Portal)
- Next.js 16.0.10 (App Router) + React 19.2.1
- Tailwind CSS v4 + shadcn/ui (base-mira style) + @base-ui/react 1.0.0
- PostCSS with @tailwindcss/postcss (NOT tailwindcss CLI)
- Turbopack enabled (root: '../..')

### citizen-app (Citizen Mobile)
- Expo 54.0.30 + React Native 0.81.5 + React 19.2.1
- Expo Router 6.0.21 (file-based routing)
- New Architecture enabled, React Compiler enabled, Typed Routes enabled
- Custom UI components with React Native StyleSheet + theme system
- react-native-reanimated 4.1.6 for animations

### backend (API)
- Hono v4 on Azure Functions v4 (Node.js model v4)
- @marplex/hono-azurefunc-adapter: Bridges Hono with Azure Functions runtime
- Build: tsup (ESM output to dist/)
- Auth: JWT via Keycloak
- Validation: Zod (schemas in `packages/shared`, shared with frontend)

### Shared Packages
- @repo/frontend-core: Shared utilities (tsup build, ky 1.14.1 HTTP client)
- @repo/frontend-services: Business logic services (tsup build)
- @repo/typescript-config: Shared TypeScript configurations
- @repo/vitest-config: Shared Vitest configurations
- @repo/shared _(to be created)_: Zod schemas + shared types (used by backend AND frontend)

### Dev Tools
- Biome 2.3.8 (linting + formatting — replaces ESLint/Prettier for most rules)
- ESLint (Next.js specific rules only, via eslint-config-next)
- Vitest 4.0.16 (testing framework)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

**Import/Export:**
- ALWAYS use `import type` for type-only imports — Biome enforces `useImportType: error`
- ALWAYS use `export type` for type-only exports — Biome enforces `useExportType: error`
- NEVER use default exports except for Next.js pages/layouts (add `// biome-ignore lint/style/noDefaultExport`)
- Barrel files (`index.ts` re-exports) are discouraged — `noBarrelFile: warn`
- Import organization is automatic via Biome — do not manually organize

**Variable & Typing:**
- ALWAYS use `const` — `useConst: error`
- NEVER use `let` without implicit typing — `noImplicitAnyLet: error`
- NEVER use `any` in production code — `noExplicitAny: warn` (off in test files)
- Use shorthand array syntax (`string[]` not `Array<string>`) — `useConsistentArrayType: error`
- Template literals preferred over string concatenation — `useTemplate: error`

**Async/Await:**
- NEVER leave floating promises unhandled — `noFloatingPromises: error`
- EVERY async function MUST use `await` — `useAwait: error`

**Code Safety:**
- NEVER use `==` — always `===` — `noDoubleEquals: error`
- NEVER use `void` type — `noConfusingVoidType: error`
- NEVER use `eval()` — `noGlobalEval: error`
- NEVER use `delete` operator — `noDelete: warn`
- NEVER reassign function parameters — `noParameterAssign: warn`
- ALWAYS use block statements for if/else/for — `useBlockStatements: error`

**Naming Conventions (Biome enforced):**
- Variables: `camelCase`, `PascalCase`, or `CONSTANT_CASE`
- Functions: `camelCase` or `PascalCase`
- Types/Interfaces: `PascalCase`
- Enum members: `PascalCase` or `CONSTANT_CASE`
- Files: `camelCase`, `kebab-case`, or `PascalCase`

**Path Aliases:**
- ALWAYS use `@/*` alias for imports from `src/` in both apps

### Framework-Specific Rules

**MVVM Architecture (Both Apps):**
- Components with business logic MUST follow MVVM: `ComponentName.tsx` (View) + `useComponentName.ts` (ViewModel)
- View (.tsx): ONLY render function and animations — all data/handlers come from the ViewModel hook
- ViewModel (hook): ALL business logic, state, effects, event handlers — returns everything the View needs
- Model (services): Shared in `packages/frontend/frontend-services/` for data access
- UI primitives (buttons, cards, inputs) do NOT need MVVM — single file is fine

**Next.js (town-hall-web):**
- App Router ONLY — no pages/ directory
- Route files: `page.tsx`, `layout.tsx` (lowercase, default export with biome-ignore)
- Root layout: `lang="fr"` on `<html>` tag — French locale
- Styling: Use `cn()` from `@/lib/utils` for className merging (clsx + tailwind-merge)
- Tailwind class order: Biome enforces `useSortedClasses` — classes MUST be sorted
- Component variants: Use CVA (class-variance-authority) pattern matching shadcn/ui
- Icons: lucide-react — do NOT use other icon libraries
- React Strict Mode: Enabled

**Expo/React Native (citizen-app):**
- Expo Router file-based routing: `_layout.tsx` (layouts), `index.tsx` (screens), `+not-found.tsx` (special)
- Route groups use parentheses: `(tabs)/`, `(home)/`
- Platform-specific files: Use `.web.tsx` suffix for web-only implementations
- Theme system: Use `useColor()` hook from `@/hooks/useColor` — NOT hardcoded colors
- Colors defined in `@/theme/colors.ts` (light/dark variants via `Colors` object)
- Global constants in `@/theme/globals.ts` (HEIGHT, FONT_SIZE, BORDER_RADIUS, CORNERS)
- Animations: Use react-native-reanimated `useSharedValue` / `useAnimatedStyle`
- Components use `forwardRef` pattern with explicit `ViewStyle` / `TextStyle` types
- Icons: lucide-react-native — do NOT use lucide-react

**Shared Services (@repo/frontend-services):**
- Class-based services with inheritance (e.g., `AdminReportService extends ReportService`)
- Exports via package.json `exports` field: `"./report": "./src/report/report.service.ts"`
- Service files named: `{name}.service.ts`
- Import in apps: `import { ReportService } from '@repo/frontend-services/report'`

**Shared Utilities (@repo/frontend-core):**
- After ANY change: run `bun turbo build --filter=@repo/frontend-core` before testing in apps
- Same for @repo/frontend-services: `bun turbo build --filter=@repo/frontend-services`

### Backend Rules (apps/backend)

**Architecture — 4 Layers (strict):**
```
src/
├── index.ts                  # Azure Functions entry point — 2 HTTP triggers only
├── gateways/
│   ├── citizen/              # Citizen gateway (Azure Function)
│   │   ├── citizen.gateway.ts
│   │   └── controllers/      # Route handlers, no business logic
│   └── municipality/         # Municipality gateway (Azure Function)
│       ├── municipality.gateway.ts
│       └── controllers/
├── modules/                  # Business logic layer
│   └── {feature}/
│       ├── {feature}.service.ts      # Business logic
│       ├── {feature}.repository.ts   # Data access (in-memory for now)
│       └── {feature}.types.ts        # Types for this module
└── middleware/               # Hono middleware (auth, errors, logging, etc.)
```

**Gateway Rules:**
- EXACTLY 2 gateways: `citizen` and `municipality` — NEVER create a 3rd
- Each gateway is a separate Azure Function with its own Hono instance
- Gateway base paths: `/api/citizen` and `/api/municipality`
- Gateway instantiates repositories → services → controllers in order
- Gateway calls `app.route('/feature', controller.getRoutes())`

**Controller Rules:**
- Controllers are classes receiving service via constructor injection
- ALWAYS expose routes via `getRoutes(): Hono` method
- Route handlers: `(c: Context) => c.json(...)` — no business logic inline
- Error responses: `c.json({ error: string }, statusCode)`
- File naming: `{feature}.controller.ts` in the appropriate gateway's `controllers/`

**Service Rules:**
- All business logic lives in services — NEVER in controllers or repositories
- Services receive repository via constructor injection
- File naming: `{feature}.service.ts` in `src/modules/{feature}/`

**Repository Rules:**
- Repositories are the ONLY data access layer — services NEVER touch data directly
- Currently in-memory (hardcoded arrays) — ORM/ODM will be added later
- File naming: `{feature}.repository.ts` in `src/modules/{feature}/`
- Do NOT add an ORM without explicit instruction — data layer will evolve

**Types Rules:**
- Module-local types: `src/modules/{feature}/{feature}.types.ts`
- Shared types (frontend + backend): `packages/shared` — import from `@repo/shared`
- Zod schemas: ALWAYS defined in `packages/shared`, NOT in the backend app directly
- Import Zod-inferred types: `import type { MyType } from '@repo/shared/my-schema'`

**Authentication (JWT / Keycloak):**
- Auth is handled via JWT Bearer tokens issued by Keycloak
- Auth middleware lives in `src/middleware/` — applied at gateway level
- Extract and validate JWT in middleware, attach user context to Hono context
- NEVER trust client-sent user identity — always derive from validated JWT
- Azure Functions `authLevel: 'function'` is infrastructure-level only, NOT application auth

**Middleware (`src/middleware/`):**
- Place ALL Hono middleware here (auth guard, error handler, logger, CORS, etc.)
- Apply middleware at gateway level (in `*.gateway.ts`) using `app.use()`
- Error handling middleware MUST catch all thrown errors and return structured JSON
- Error response format (to be standardized): `{ error: string, code?: string, details?: unknown }`

**Validation (Zod):**
- Request body/params MUST be validated with Zod before processing
- Schemas defined in `packages/shared` — used by both backend and frontend
- Use `schema.safeParse()` in controllers — return 400 on validation failure
- NEVER trust unvalidated input from the request

**Backend Commands (from `apps/backend/`):**
- Dev: `bun run dev` (watch + func start)
- Build: `bun run build`
- Test (unit): `bun run test`
- Test (watch): `bun run test:watch`
- API tests: `bru run --env local` (Bruno collection in `api-tests/`)

**Backend Commands (from monorepo root):**
- Dev: `bun turbo dev --filter=backend`
- Build: `bun turbo build --filter=backend`
- Test: `bun turbo test --filter=backend`

**Testing (backend):**
- Unit tests: co-located with source as `{feature}.service.test.ts`
- API tests: Bruno collection in `api-tests/` — organized by module and resource
- Bruno environments: `local`, `dev`, `prod` (in `api-tests/environments/`)
- Run API tests: `bru run --env local` from `apps/backend/`

### Testing Rules

**Framework & Configuration:**
- Testing framework: Vitest 4.0.16 — NOT Jest
- Shared config via `@repo/vitest-config` (react config for apps, node config for packages)
- Each app/package has its own `vitest.config.ts` extending the shared config
- DOM environment: jsdom (for React component testing)

**Test Organization:**
- Tests are co-located next to implementation files with `.test.ts` / `.test.tsx` suffix
- Alternative: `__tests__/` directory (used in citizen-app)
- Test file naming: `{filename}.test.ts` or `{filename}.test.tsx`
- Service tests: `{name}.service.test.ts` (next to `{name}.service.ts`)

**Test Structure:**
- Use `describe` / `it` blocks (NOT `test`)
- Import from `vitest`: `import { describe, expect, it } from 'vitest'`
- React component testing: `@testing-library/react` (town-hall-web) or `@testing-library/react-native` (citizen-app)

**Biome Rules for Tests:**
- `noExplicitAny: off` — `any` is allowed in test files
- `noFocusedTests: error` — NEVER commit `.only` tests
- `noSkippedTests: warn` — Avoid `.skip` tests
- `noDuplicateTestHooks: error` — No duplicate beforeEach/afterEach
- `noExportsInTest: error` — NEVER export from test files

**Running Tests:**
- All tests: `bun turbo test`
- Single app: `bun turbo test --filter=town-hall-web`
- Watch mode: `bun turbo test:watch`
- Tests depend on package builds: Turbo handles `dependsOn: ["^build"]`

### Code Quality & Style Rules

**Biome Formatting (enforced):**
- Indentation: 2 spaces (NOT tabs)
- Line width: 120 characters
- Quotes: Single quotes for JS/TS, double quotes for JSX attributes
- Semicolons: Always
- Trailing commas: Always
- Arrow parentheses: Always (`(x) =>` not `x =>`)
- Bracket same line: false
- Line ending: LF
- Self-closing elements: Required (`<div />` not `<div></div>`)
- JSON: No trailing commas, 2 space indent

**Tailwind CSS (town-hall-web):**
- Class sorting enforced by Biome `useSortedClasses` — applies to `className`, `class`, `classList`
- Also applies inside utility functions: `clsx`, `cva`, `tw`, `cn`, `twMerge`, `twJoin`
- Use CSS custom properties via `@theme inline` — NOT arbitrary Tailwind values
- Dark mode: class-based via `.dark` class + CSS variables (oklch color space)

**Code Complexity:**
- Max cognitive complexity: 15 — `noExcessiveCognitiveComplexity: warn`
- Avoid `forEach` is NOT enforced (rule is off)
- Variable shadowing: `noShadow: warn` — avoid when possible

**Console & Debug:**
- `console.*` statements: `warn` in production code, allowed in `scripts/` and `cli/` directories
- `debugger` statements: `error` — NEVER commit
- `dangerouslySetInnerHTML`: `warn` — avoid unless absolutely necessary

**React-Specific Quality:**
- Hooks MUST be called at top level — `useHookAtTopLevel: error`
- Exhaustive dependency arrays — `useExhaustiveDependencies: warn`
- No array index as key is allowed (rule is off)

**Biome Ignore Pattern:**
- Single line: `// biome-ignore lint/rule/name: reason`
- Whole file: `/** biome-ignore-all lint/rule/name: reason */` at top
- ALWAYS provide a reason after the colon

### Development Workflow Rules

**Git Branching:**
- `main` — production branch
- `develop` — integration branch
- `dev/#issue-name` — feature branches (e.g., `dev/42-add-login`)
- `fix/#issue-name` — bug fix branches (e.g., `fix/15-broken-auth`)

**Commit Messages:**
- Conventional Commits format: `type: description`
- Types: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`, `perf:`, `ci:`
- Lowercase description, no period at end

**Pull Requests:**
- Target `develop` branch (NOT `main`)
- Require 2 reviewers

**Monorepo Commands (from root):**
- Dev all: `bun turbo dev`
- Dev single: `bun turbo dev --filter=town-hall-web`
- Build: `bun turbo build --filter=<app>`
- Lint: `bun lint` (Biome) or `bun turbo lint --filter=town-hall-web` (ESLint)
- Format: `bun format`
- Test: `bun turbo test`
- Clean: `bun clean`

**Adding Shared Functionality:**
1. Add code to `@repo/frontend-core`, `@repo/frontend-services`, or `@repo/shared`
2. Build the package: `bun turbo build --filter=@repo/frontend-core`
3. Import in apps from the package name
4. Turbo handles build ordering via `dependsOn: ["^build"]`

### Critical Don't-Miss Rules

**Anti-Patterns to Avoid:**
- NEVER install Prettier or ESLint plugins that conflict with Biome — Biome handles ALL formatting
- NEVER use `npm`, `pnpm`, or `yarn` commands — this project uses bun exclusively
- NEVER import from `react-native` in town-hall-web or from `react-dom` in citizen-app
- NEVER use `lucide-react` in citizen-app — use `lucide-react-native`
- NEVER use `lucide-react-native` in town-hall-web — use `lucide-react`
- NEVER hardcode colors in citizen-app — always use `useColor()` hook or `Colors` theme object
- NEVER use arbitrary Tailwind values in town-hall-web — use CSS custom properties
- NEVER create a `pages/` directory in town-hall-web — App Router only
- NEVER add `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` — only `bun.lock`
- NEVER create a 3rd Azure Function gateway — only `citizen` and `municipality`
- NEVER write business logic in controllers — it belongs in services
- NEVER access data directly from services — always go through repositories
- NEVER define Zod schemas in the backend app — put them in `packages/shared`
- NEVER trust unvalidated request input — always validate with Zod before processing
- NEVER derive user identity from the request body — always from the validated JWT

**Monorepo Gotchas:**
- Shared packages (`@repo/*`) must be BUILT before apps can use changes — `bun turbo build --filter=@repo/package-name`
- Turbopack in Next.js uses `root: '../..'` — path resolution is relative to monorepo root
- Dependencies shared between apps should go in shared packages, NOT duplicated

**React 19 Specifics:**
- React Compiler is enabled in citizen-app — manual `useMemo`/`useCallback` may be unnecessary
- React 19 `use()` API is available — can be used for promises and context
- `forwardRef` pattern is still used in citizen-app components (React 19 supports `ref` as prop but existing code uses forwardRef)

**Tailwind CSS v4 Specifics:**
- Import syntax: `@import "tailwindcss"` (NOT `@tailwind base/components/utilities`)
- Theme configuration: `@theme inline {}` block in CSS (NOT `tailwind.config.js`)
- Custom variants: `@custom-variant dark (&:is(.dark *))` syntax
- PostCSS plugin: `@tailwindcss/postcss` (NOT `tailwindcss` directly)

**Expo 54 Specifics:**
- New Architecture is enabled — native modules must be compatible
- Typed routes: Route paths are type-checked — use `href` typed from expo-router
- Web output is static (`"web": { "output": "static" }`)
- Platform-specific code: Use `.web.tsx` file suffix, NOT `Platform.OS` checks when possible

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-03-05
