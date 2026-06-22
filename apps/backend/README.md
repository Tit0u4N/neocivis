# Backend — Hono sur Azure Functions v4

API REST de NeoCivis. Hono v4 exposé via Azure Functions Node.js model v4, TypeScript strict, build tsup.

---

## Stack

| Composant | Technologie |
|-----------|-------------|
| Runtime | Azure Functions v4 (Node.js model) |
| Framework HTTP | Hono v4 + `@marplex/hono-azurefunc-adapter` |
| Données relationnelles | PostgreSQL via Drizzle ORM |
| Données documentaires | Azure Cosmos DB (NoSQL) |
| Stockage fichiers | Azure Blob Storage |
| Auth | Keycloak (JWT Bearer) |
| Validation | Zod (schemas dans `@repo/contracts`) |
| IA | Groq SDK (analyse signalements) |
| Build | tsup (ESM → `dist/`) |
| Tests unitaires | Vitest |
| Tests API | Bruno |

---

## Architecture

Le backend suit une architecture stricte en 4 couches :

```
src/
├── index.ts                    # Point d'entrée : 3 Azure Function HTTP triggers
├── gateways/                   # Couche 1 : routing + DI
│   ├── citizen/                # /api/citizen/* (JWT requis)
│   │   ├── citizen.gateway.ts
│   │   └── controllers/        # article, city, config, establishment, report, thread, user
│   ├── municipality/           # /api/municipality/* (JWT + rôle agent/admin requis)
│   │   ├── municipality.gateway.ts
│   │   └── controllers/        # access, article, city, config, establishment, media, report, thread, user
│   └── webhook/                # /api/webhook/* (pas d'auth JWT — Keycloak uniquement)
│       ├── webhook.gateway.ts
│       └── controllers/
├── modules/                    # Couche 2 & 3 : service + repository
│   ├── access/                 # Gestion des permissions par ville
│   ├── article/                # Articles (Cosmos DB)
│   ├── city/                   # Villes (PostgreSQL)
│   ├── config/                 # Configuration applicative (Cosmos DB)
│   ├── establishment/          # Établissements (PostgreSQL)
│   ├── iam/                    # Gestion des comptes Keycloak
│   ├── media/                  # Médias liés aux articles (Cosmos DB + Blob)
│   ├── report/                 # Signalements citoyens (Cosmos DB + Groq AI)
│   ├── thread/                 # Fils de discussion sur signalements (PostgreSQL)
│   ├── upload/                 # Upload de fichiers vers Azure Blob
│   ├── users/                  # Utilisateurs (PostgreSQL)
│   └── webhook/                # Traitement des événements Keycloak
├── middlewares/                # Auth JWT, CORS, rôles, permissions, local-auth
├── infrastructure/             # Clients Azure (Blob, Cosmos), Drizzle, env
└── core/                       # Auto-seed, env-check, runtime-config, ISeeder
```

### Modules et stockage

| Module | Stockage principal | Notes |
|--------|--------------------|-------|
| `users` | PostgreSQL (Drizzle) | Synchronisé via webhook Keycloak |
| `access` | PostgreSQL (Drizzle) | Permissions par ville |
| `city` | PostgreSQL (Drizzle) | |
| `establishment` | PostgreSQL (Drizzle) | |
| `thread` | PostgreSQL (Drizzle) | Fils sur signalements |
| `article` | Azure Cosmos DB | |
| `config` | Azure Cosmos DB | |
| `media` | Azure Cosmos DB + Azure Blob | Métadonnées + fichiers |
| `report` | Azure Cosmos DB | Analyse IA via Groq |
| `iam` | Keycloak (API externe) | |
| `upload` | Azure Blob Storage | Upload direct |
| `webhook` | — | Stateless, traite les events Keycloak |

---

## Prérequis

- **Node.js** ≥ 20.9.0
- **Bun** (package manager — ne pas utiliser npm/pnpm/yarn)
- **Azure Functions Core Tools v4**
- **PostgreSQL** (local ou Docker)
- **Azurite** (émulateur Azure Storage local) ou compte Azure Storage réel
- **Azure Cosmos DB Emulator** ou compte Cosmos DB réel
- **Bruno CLI** (pour les tests API)

### Installer Azure Functions Core Tools

```bash
bun add -g azure-functions-core-tools@4
```

Ou via la [documentation officielle](https://learn.microsoft.com/fr-fr/azure/azure-functions/functions-run-local).

### Installer Bruno CLI

```bash
bun add -g @usebruno/cli
```

---

## Configuration de l'environnement

### `local.settings.json` (Azure Functions en local)

Azure Functions Core Tools injecte les entrées `Values` dans `process.env` au démarrage.

1. Copier le fichier d'exemple :

   ```bash
   cp local-example.settings.json local.settings.json
   ```

   Sous PowerShell :

   ```powershell
   Copy-Item local-example.settings.json local.settings.json
   ```

2. Renseigner les secrets selon votre environnement.

#### Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `FUNCTIONS_WORKER_RUNTIME` | Oui | Toujours `node` |
| `ENV_MODE` | Non | `development` active le mode local-auth (pas de vrai JWT requis) |
| `IN_MEMORY` | Non | `true` : tout en mémoire, aucune base de données requise |
| `AUTO_SEED` | Non | `INSERT_ONLY` ou `RESET_DATA` — seed automatique au démarrage |
| `DATABASE_URL` | Oui (hors IN_MEMORY) | URL de connexion PostgreSQL |
| `DATABASE_POOL_MAX` | Non | Taille max du pool (défaut : `5`) |
| `COSMOS_ENDPOINT` | Oui (hors IN_MEMORY) | Endpoint Cosmos DB |
| `COSMOS_KEY` | Oui (hors IN_MEMORY) | Clé Cosmos DB |
| `COSMOS_DATABASE_ID` | Non | Défaut : `neocivis` |
| `COSMOS_DATABASE_THROUGHPUT` | Non | RU/s partagé (défaut : `400`, max : `1000`). Après modification, relancer `bun run db:reset -- --confirm --cosmos`. |
| `KEYCLOAK_BASE_URL` | Oui | URL de base Keycloak |
| `KEYCLOAK_REALM` | Oui | Realm Keycloak |
| `KEYCLOAK_CLIENT_ID` | Oui | Client ID backend |
| `KEYCLOAK_CLIENT_SECRET` | Oui | Secret client backend |
| `KEYCLOAK_PASSWORD_SETUP_CLIENT_ID` | Non | Client pour le reset de mot de passe |
| `KEYCLOAK_PASSWORD_SETUP_REDIRECT_URI` | Non | URI de redirection pour reset mot de passe |
| `AZURE_STORAGE_CONNECTION_STRING` | Oui (médias/uploads) | Chaîne de connexion Azure Blob |
| `AZURE_MEDIA_STORAGE_CONTAINER` | Non | Nom du container (défaut : `media`) |
| `AZURE_STORAGE_BASE_URL` | Non | URL publique de base du Blob Storage |

### `.env` / `.env.local` (scripts CLI)

Les scripts `db:reset` et `db:seeding` chargent `.env.local` puis `.env` depuis `apps/backend/`.
Les commandes Drizzle (`db:generate`, `db:migrate`, `db:push`, `db:studio`) nécessitent `DATABASE_URL` dans l'environnement :

```bash
bun run db:migrate
```

---

## Mode IN_MEMORY

Définir `IN_MEMORY=true` dans `local.settings.json` permet de démarrer sans aucune base de données. Tous les repositories passent en mode mémoire. Idéal pour le développement rapide ou les tests d'intégration.

> Les repositories in-memory ne sont **pas partagés** entre les gateways (`citizen`, `municipality`, `webhook`) — ils sont des Azure Functions distinctes.

---

## Démarrage local

```bash
# Depuis apps/backend/ (watch tsup + func start en parallèle)
bun run start
```

L'API est accessible sur `http://localhost:7071/api`.

### Aperçu des routes

#### Gateway citizen (`/api/citizen/*`, JWT requis)

| Préfixe | Controller |
|---------|-----------|
| `/api/citizen/articles` | Lecture des articles |
| `/api/citizen/cities` | Villes disponibles |
| `/api/citizen/config` | Configuration applicative |
| `/api/citizen/establishments` | Établissements |
| `/api/citizen/reports` | Signalements (création + suivi) |
| `/api/citizen/threads` | Fils de discussion |
| `/api/citizen/users` | Profil utilisateur |

#### Gateway municipality (`/api/municipality/*`, JWT + rôle requis)

| Préfixe | Controller |
|---------|-----------|
| `/api/municipality/access` | Gestion des permissions par ville |
| `/api/municipality/articles` | CRUD articles |
| `/api/municipality/cities` | CRUD villes |
| `/api/municipality/config` | Configuration |
| `/api/municipality/establishments` | CRUD établissements |
| `/api/municipality/media` | Upload et gestion des médias |
| `/api/municipality/reports` | Gestion des signalements |
| `/api/municipality/threads` | Fils de discussion |
| `/api/municipality/users` | Gestion des utilisateurs |

#### Gateway webhook (`/api/webhook/*`, pas d'auth JWT)

| Route | Description |
|-------|-------------|
| `POST /api/webhook/post` | Événements Keycloak (`access.REGISTER`, `access.UPDATE`, `access.DELETE`). Corps invalide → 200 ignoré. Sync la table `users` PostgreSQL. |

Configurer l'URL webhook dans Keycloak (`KEYCLOAK_WEBHOOK_URL`, ex. `http://localhost:7071/api/webhook/post`). Voir `scripts/setup-keycloak-webhook.ts`.

---

## Commandes de base de données

Depuis `apps/backend/` :

| Script | Description |
|--------|-------------|
| `bun run db:generate` | Génère les fichiers de migration Drizzle à partir du schéma |
| `bun run db:migrate` | Applique les migrations depuis `drizzle/` vers PostgreSQL |
| `bun run db:push` | Push le schéma sans fichier de migration (itération locale rapide) |
| `bun run db:studio` | Ouvre Drizzle Studio |
| `bun run db:reset` | **Destructif** : reset PostgreSQL, Cosmos DB et/ou Azure Blob. Requiert `--confirm`. Cibles : `--drizzle`, `--cosmos`, `--blob`, `--all`. Ex : `bun run db:reset -- --confirm --all` |
| `bun run db:seeding` | Lance les seeders. `--reset` pour vider avant de re-seeder. Non compatible avec `IN_MEMORY`. |

---

## Seeding

Le seeding remplit `users` (via Keycloak si configuré, sinon valeurs de fallback) et les autres modules (articles, villes, établissements, config, médias, etc.).

### Modes

- **`INSERT_ONLY`** : insère sans vider. Données existantes conservées.
- **`RESET_DATA`** : vide (`deleteAll()`) puis insère. Dataset propre.

### Déclenchement

1. **Démarrage automatique** : `AUTO_SEED=INSERT_ONLY` ou `AUTO_SEED=RESET_DATA` dans `local.settings.json`
2. **Script manuel** : `bun run db:seeding` (défaut : `INSERT_ONLY`, ajouter `--reset` pour `RESET_DATA`)

> Avec `IN_MEMORY=true`, le script `db:seeding` refuse de s'exécuter (erreur). Le seed automatique au démarrage reste possible.

---

## Tests

### Tests unitaires (Vitest)

Les tests sont co-localisés avec les sources (`{name}.service.test.ts` à côté de `{name}.service.ts`) :

```bash
bun run test          # run once
bun run test:watch    # mode watch
```

### Tests API (Bruno)

Les tests Bruno sont dans `api-tests/`, organisés par module. Environnements disponibles : `local`, `dev`, `prod`.

```bash
# Depuis apps/backend/
bru run --env local                          # tous les tests
bru run --env local api-tests/article        # un module
bru run --env local --export-junit           # export JUnit (CI)
bru run --env dev                            # environnement dev
bru run --env prod                           # environnement prod
```

> Certains tests Bruno neccisetent des bdds fraichement seedées. Si vous avez des erreurs de type "not found" ou "permission denied", relancez `bun run db:reset -- --confirm --all` puis `bun run db:seeding`.
---

## Build

```bash
bun run build    # compile TypeScript → dist/ (ESM via tsup)
```

La configuration tsup est dans `tsup.config.ts`. Le build est déclenché automatiquement avant `func start` via le script `prestart`.

---

## Commandes depuis la racine du monorepo

```bash
bun turbo dev --filter=backend
bun turbo build --filter=backend
bun turbo test --filter=backend
```
