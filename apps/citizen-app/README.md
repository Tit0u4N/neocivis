# Citizen App

Expo + React Native application for residents. The project targets web, iOS,
and Android, but the default build focuses on the web bundle because it runs in
every environment (local dev, CI, preview).

## Prerequisites

- Node.js 24+ and Yarn 1 (workspace root uses Yarn classic)
- Xcode / Android Studio installed when building native binaries
- Expo CLI via `npx expo` (already provided by dependencies)

Install dependencies from the monorepo root:

```bash
yarn install
```

## Local development

Start the Expo dev server (web target by default):

```bash
yarn turbo dev --filter=citizen-app
```

This runs `expo start --web`, which opens the Metro dashboard in your browser
and serves the web build. To run the native preview from the same dev server,
press `i` (iOS simulator) or `a` (Android emulator) in the Expo terminal.

## Building

The repo stores platform-specific build scripts in `package.json`:

```bash
# Web bundle (default)
yarn turbo build --filter=citizen-app

# Platform-specific exports
yarn turbo run build:web --filter=citizen-app
yarn turbo run build:android --filter=citizen-app
yarn turbo run build:ios --filter=citizen-app

# Full matrix (web + android + ios)
yarn turbo run build:all --filter=citizen-app
```


