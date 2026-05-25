# Backend (Hono on Azure Functions)

## Prerequisites
- Node.js 20 or later
- Azure Functions Core Tools
- Azure CLI
- An Azure account
- Docker

### Download and install Azure Functions Core Tools
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```
or check the [official documentation](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=windows%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-typescript) for installation instructions.

### Download and install Azure CLI
Consult the [official documentation](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) for installation instructions.


### Download and install Docker
Consult the [official documentation](https://docs.docker.com/get-docker/) for installation instructions depending on your operating system.

---

## Environment configuration

Two mechanisms apply depending on how you run the backend.

### `local.settings.json` (Azure Functions host locally)

Azure Functions Core Tools map the `Values` entries from `local.settings.json` into `process.env` when you run `func start` (or `bun run dev`).

1. Copy the example file to `local.settings.json` (that file is gitignored; see `.funcignore`):

   ```bash
   cp local-example.settings.json local.settings.json
   ```

   On PowerShell:

   ```powershell
   Copy-Item local-example.settings.json local.settings.json
   ```

2. Fill in secrets and URLs for your machine (Postgres, Cosmos or emulator, Keycloak, Azure Storage, and so on).

Useful keys (see `local-example.settings.json` and the source):

| Variable | Purpose |
|----------|---------|
| `FUNCTIONS_WORKER_RUNTIME` | Must stay `node` for this project. |
| `ENV_MODE` | e.g. `development`: enables certain local-only behavior (see `local-auth.middleware`). |
| `IN_MEMORY` | `true` / `1` / `yes` / `on`: in-memory storage (no Postgres or Cosmos for main data); real environment checks are relaxed. |
| `AUTO_SEED` (or `auto_seed`) | Runs a seed when gateways start; recognized values: `INSERT_ONLY`, `RESET_DATA` (see Seeding). |
| `DATABASE_URL` | Postgres connection (Drizzle / users). |
| `DATABASE_POOL_MAX` | Max pool size (default `5`). |
| `COSMOS_ENDPOINT`, `COSMOS_KEY` | Cosmos DB (articles in persisted mode). |
| `COSMOS_DATABASE_ID` | Optional, defaults to `neocivis`. |
| `COSMOS_DATABASE_THROUGHPUT` | Shared database RU/s for all containers (default `400`, clamped `400`–`1000`). Use this on accounts capped at 1000 RU/s so `articles` + `media` do not each reserve 400 RU/s. After changing, run `bun run db:reset -- --confirm --cosmos` once to recreate the database with shared throughput. |
| `KEYCLOAK_*` | Optional at startup but required for real IAM sync (`KEYCLOAK_BASE_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`). |
| `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_MEDIA_STORAGE_CONTAINER` | Required for media blobs and citizen report uploads. |
| `AZURE_STORAGE_BASE_URL` | Optional (derived public URLs). |

When **not** in `IN_MEMORY` mode, `assertBackendEnv()` at startup requires at least `DATABASE_URL`, `COSMOS_ENDPOINT`, and `COSMOS_KEY`.

### `.env` / `.env.local` (CLI scripts)

The `db:reset` and `db:seeding` scripts load the **first** file found, in order, among `.env.local` then `.env`, under `apps/backend` (the process current working directory).

Drizzle commands `db:generate`, `db:migrate`, `db:push`, and `db:studio` read `DATABASE_URL` from the process environment **without** loading those files automatically. Export `DATABASE_URL` in your shell, or run with an env file supported by Bun, for example:

```bash
bun --env-file=.env.local run db:migrate
```

---

## Seeding (development data)

Seeding fills **users** (via Keycloak when configured, otherwise fallback values) and **articles** (Cosmos or in-memory repository depending on mode).

### `INSERT_ONLY` and `RESET_DATA`

- **`INSERT_ONLY`**: runs `seed()` only on each seeder (users, articles). Existing data is not cleared first.
- **`RESET_DATA`**: for each seeder, calls `deleteAll()` first, then `seed()`. Useful to get a clean dataset without manual cleanup.

### Where these modes apply

1. **Gateway startup** (`citizen` / `municipality`): if `AUTO_SEED` (or `auto_seed`) is exactly `INSERT_ONLY` or `RESET_DATA`, the same pipeline runs once (except when in-memory already handled as in `auto-seed.ts`). A missing or unrecognized value disables auto-seed.

2. **Manual script** `bun run db:seeding`: defaults to `INSERT_ONLY`. Pass `--reset` for `RESET_DATA`:

   ```bash
   bun run db:seeding -- --reset
   ```

### Limitations

- With **`IN_MEMORY`** enabled, the `db:seeding` script **exits with an error** and refuses to run. Startup auto-seed can still run in memory for local development.

---

## Database commands (`package.json`)

Run these from `apps/backend`:

| Script | Description |
|--------|-------------|
| `bun run db:generate` | Generates Drizzle SQL migration files from the schema (`drizzle-kit generate`). Requires `DATABASE_URL` in the environment. |
| `bun run db:migrate` | Applies migrations from the `drizzle/` folder to Postgres (`migrate.ts`). Requires `DATABASE_URL`. |
| `bun run db:push` | Pushes the schema to the database without migration files (`drizzle-kit push`). Handy for local iteration; use with care on real data. |
| `bun run db:studio` | Opens Drizzle Studio (`drizzle-kit studio`). |
| `bun run db:reset` | **Destructive**: orchestrated reset of Postgres, Cosmos, and/or Azure Blob. Requires **`--confirm`**. Targets: `--drizzle` / `--postgres` / `--postgress` (typo alias accepted in code), `--cosmos` (also clears the media blob container when `AZURE_STORAGE_CONNECTION_STRING` is set), `--blob` / `--storage` (blob only), or `--all` / `--both` (Postgres + Cosmos + blob). With an interactive TTY and no target, the script prompts; without a TTY, the default is all three. Skips Cosmos or blob steps with a log line when not configured. Loads `.env.local` / `.env`. Example: `bun run db:reset -- --confirm --all` |
| `bun run db:seeding` | Runs seeders (see Seeding). `--reset` selects `RESET_DATA`. Loads `.env.local` / `.env`. Not compatible with `IN_MEMORY`. |

---

## Running the backend locally
To run the backend locally, follow these steps:
1. Navigate to the `apps/backend` directory.
2. Install the dependencies (if you haven't already during the setup of the global project):
```bash
bun install
```
3. Start the Azure Functions host:
```bash
func start
```
This will start the backend server locally, and you can access the API endpoints at `http://localhost:7071/api`.

### Webhook gateway (Keycloak)

A third Azure Function serves Keycloak event webhooks (no JWT / APIM auth):

| Route | Description |
|-------|-------------|
| `POST /api/webhook/post` | Receives Keycloak events (`access.REGISTER`, `access.UPDATE`, `access.DELETE`). Any body is accepted; invalid payloads are ignored with HTTP 200. Syncs the Postgres `users` table (soft delete on `access.DELETE`). |

Configure the webhook URL in Keycloak (see `scripts/setup-keycloak-webhook.ts` and `KEYCLOAK_WEBHOOK_URL`, e.g. `http://localhost:7071/api/webhook/post`).

**Local E2E (Bruno `scenarios/webhook`)** : set `IN_MEMORY` to `false` in `local.settings.json`. Each gateway is a separate Azure Function; in-memory repos are not shared across `citizen`, `municipality`, and `webhook`.

After schema changes, apply migrations: `bun --env-file=.env.local run db:migrate`.

### Running the backend in watch mode
To run the backend in watch mode, which automatically restarts the server when file changes are detected, use the following command:
```bash
bun run dev
```

### Note on prestart
The `prestart` script is used to build the TypeScript code before starting the Azure Functions host. This ensures that the latest changes are compiled and ready to be served when you run `func start`. The `prestart` script is automatically executed before the `start` script, so you don't need to run it manually.

## Testing

### Tests with Vitest
Vitest is a testing framework for JavaScript and TypeScript. It's used to run unit tests for the backend code.
All the tests are specified with the `.spec.ts` extension and are located in the `src` directory. To run the tests, execute the following command in the terminal:
```bash
bun run test
```

### Tests with Bruno
Bruno is a tool for testing APIs. Here it's used to test the backend API endpoints. The test files are located in the `api-tests` directory. Each test file corresponds to a specific API endpoint and contains tests to verify the functionality of that endpoint.

If you haven't already, make sure to install Bruno globally:
```bash
npm install -g @usebruno/cli
```

To run the tests, navigate to the `api-tests` directory and execute the following command:
```bash
bru run --env local
```

You can also open the Bruno UI to run and manage your tests.

If you need to run a specific test file, you can use the following command:
```bash
bru run --env local <path-to-test-file-or-directory>
```

You can also export the test results in JUnit format for integration with CI/CD pipelines:
```bash
bru run --env local --export-junit
```

You can also run the prod and dev environments tests by replacing `local` with `prod` or `dev` in the command:
```bash
bru run --env prod
```
```bash
bru run --env dev
```