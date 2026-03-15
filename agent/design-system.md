---
project: tpi-neocivis
document: design-system
version: '2.0'
date: '2026-03-15'
status: active
applies_to: [town-hall-web, citizen-app, keycloak-theme]
optimized_for_llm: true
---

# NeoCivis Design System

_This document defines the visual identity, design tokens, component behavior, and styling rules for all NeoCivis applications. AI agents MUST follow these rules when writing or modifying any UI code._

---

## Foundation: shadcn/ui

Both brands are **built on top of shadcn/ui**. This means:

- Use shadcn components directly — never reimplement what shadcn already provides
- Use **exact shadcn token names** — no custom names, no aliases
- Brand differentiation happens **only through token overrides** and font, not by reworking component internals
- In Tailwind v4, tokens live in `@theme inline` blocks as CSS custom properties

### Standard shadcn Token Set

These are the only token names used across both brands:

```
--background        --foreground
--card              --card-foreground
--popover           --popover-foreground
--primary           --primary-foreground
--secondary         --secondary-foreground
--muted             --muted-foreground
--accent            --accent-foreground
--destructive       --destructive-foreground
--border            --input            --ring
--radius
```

Tailwind utility mapping (examples): `bg-primary`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `ring-ring`, `rounded-[--radius]`.

---

## Two Brands

| Brand | Users | Identity |
|---|---|---|
| `citizen` | General public | Modern, welcoming — `--primary` is municipality-customizable |
| `town-hall` | Municipal staff | Institutional, accessible, flat — close to shadcn defaults |

---

## Citizen Brand

### Token Strategy

Only `--primary` and `--primary-foreground` are municipality-specific. They are **injected at runtime** (via a `<style>` tag or CSS custom property API set by the municipality configuration). All other tokens use **shadcn light theme defaults**.

| Token | Value | Note |
|---|---|---|
| `--primary` | Municipality color | Runtime-injected, default: blue |
| `--primary-foreground` | Contrast color against `--primary` | Runtime-injected, typically white |
| `--radius` | `0.75rem` | Rounded feel — override shadcn default |
| All others | shadcn light defaults | Do not override |

> Since only `--primary` changes, any shadcn component using `bg-primary` / `text-primary-foreground` is automatically branded. No extra work needed.

### Runtime Color Injection

The municipality color is injected as:

```html
<style>
  :root {
    --primary: <h> <s>% <l>%;         /* HSL values */
    --primary-foreground: 0 0% 100%;
  }
</style>
```

Never hardcode a primary color in component code — always use `bg-primary` / `text-primary-foreground`.

### Layout

- Full-page background: CSS gradient from `hsl(var(--primary))` to a darker/shifted hue variant
- Single centered white card, `max-w-sm`, `rounded-2xl shadow-lg` (large radius from `--radius`)
- Logo placeholder above card: icon in `lucide-react` (`Building2`), app name in white
- No sidebar, no split panel

### Typography

- Font: `system-ui, -apple-system, sans-serif` (system default)
- Title: `text-2xl font-semibold text-foreground`
- Labels: `text-sm font-medium text-muted-foreground`
- Help text: `text-sm text-muted-foreground leading-relaxed`
- Casing: sentence case everywhere

### Components

Use shadcn components unmodified. The large `--radius` and runtime `--primary` handle all branding.

- **Button primary**: `<Button>` — gradient override via CSS on `.bg-primary` if needed for the gradient look
- **Input**: `<Input>` — large radius from `--radius`, focus ring from `--ring`
- **Card**: `<Card>` — white surface, rounded corners
- **Alert**: `<Alert variant="destructive">` for errors, shadcn Alert for other states

---

## Town-Hall Brand

### Token Strategy

Town-hall overrides more tokens than citizen to establish its institutional identity. It stays **flat and close to shadcn defaults** — no split layouts, no decorative panels.

| Token | Value | Note |
|---|---|---|
| `--primary` | Institutional navy | Dark blue, close to `#0F1F3D` |
| `--primary-foreground` | White | |
| `--secondary` | Institutional gold | Use only for decorative accents and separators |
| `--secondary-foreground` | Dark navy | |
| `--muted` | Light grey | shadcn default range |
| `--muted-foreground` | Medium grey | shadcn default range |
| `--radius` | `0.125rem` | Sharp corners — institutional feel |
| `--font-sans` | `Marianne, system-ui, sans-serif` | Official French government typeface |

Dark mode is supported: override surface tokens in `.dark` so navy becomes the page background and white becomes card/field surfaces.

### Layout

- Flat layout: centered form on `bg-background`, no split panels
- shadcn `<Card>` for the form container
- Responsive and mobile-first — left panel concept from v1 is removed
- Logo placeholder: `lucide-react` `Landmark` icon, circular border in `secondary`

### Typography

- Font: **Marianne** (self-hosted or official source) — required for institutional identity
  - Fallback: `system-ui, -apple-system, sans-serif`
- Title: `text-2xl font-bold text-primary uppercase tracking-wide`
- Labels: `text-xs font-bold uppercase tracking-widest text-muted-foreground`
- Body / help text: `text-sm text-foreground`
- Button text: uppercase, wide letter-spacing — add via className override on `<Button>`
- Casing: labels and button text UPPERCASE; body sentence case

### Components

Use shadcn components. Sharp `--radius` and navy `--primary` handle the brand. Apply uppercase/tracking overrides on text elements only.

- **Button primary**: `<Button className="uppercase tracking-widest">`
- **Button outline**: `<Button variant="outline" className="uppercase tracking-widest">`
- **Input**: `<Input>` — minimal radius from `--radius`, focus ring from `--ring`
- **Card**: `<Card>` — flat, sharp corners
- **Alert**: shadcn Alert — sharp radius

---

## Icons

- Web apps: **lucide-react** — no other library
- Citizen mobile: **lucide-react-native** — no other library
- Relevant icons: `Building2` (citizen), `Landmark` (town-hall), `Eye` / `EyeOff` (password toggle), `Mail` (reset screens)
- Icon-only buttons: always add `aria-label`

---

## Motion & Animation

All animations MUST be gated on `prefers-reduced-motion`. Use Tailwind transition utilities first; add CSS keyframes only when needed.

### Citizen — Subtle entrance

```css
@media (prefers-reduced-motion: no-preference) {
  .animate-in {
    animation: fade-in-up 300ms ease-out;
  }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Interactive states: `transition-colors`, `active:scale-[0.98]`

### Town-Hall — Fade only

```css
@media (prefers-reduced-motion: no-preference) {
  .animate-in {
    animation: fade-in 200ms ease;
  }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

No translate or scale. Interactive states: `transition-colors` only.

### Under `prefers-reduced-motion: reduce`

Remove all animations including opacity transitions if motion-triggering.

---

## Accessibility

- **WCAG AA** minimum for all text/background pairs — AAA targeted for interactive elements
- Focus rings visible on all interactive elements — use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Form fields: associated `<Label>` with `htmlFor`, never rely on placeholder alone
- Error messages: linked via `aria-describedby` to their input
- All interactive elements keyboard-navigable
- Icon-only buttons: `aria-label` or visually-hidden text

---

## Implementation Notes

| | `town-hall-web` | `citizen-app` | `keycloak-theme` |
|---|---|---|---|
| Token definition | `@theme inline` in Tailwind v4 CSS | `Colors` object in `@/theme/colors.ts` via `useColor()` hook | CSS custom props in `global.css`, scoped to `.theme-citizen` / `.theme-town-hall` |
| `--primary` injection (citizen) | `<style>` tag from server/config at render | Config value passed into `Colors.primary` | CSS custom prop override in `global.css` |
| Font loading | `next/font` or `@font-face` | `useFonts()` from Expo | `@font-face` in `global.css` |
| Icons | `lucide-react` | `lucide-react-native` | `lucide-react` |
| Animation | Tailwind transitions + CSS keyframes | `react-native-reanimated` (`useSharedValue`, `useAnimatedStyle`) | Tailwind transitions + CSS keyframes |
| Class merging | `cn()` from `@/lib/utils` | N/A (StyleSheet) | `cn()` from `@/lib/utils` |

---

## Critical Rules

### DO
- Use shadcn token names exactly — `--primary`, `--muted-foreground`, `--border`, etc.
- Let shadcn components do the work — brand through tokens, not by rewriting components
- Use `bg-primary text-primary-foreground` for all primary actions in both brands
- Inject `--primary` / `--primary-foreground` at runtime for citizen — never hardcode
- Keep citizen corners rounded (`--radius` large), town-hall corners sharp (`--radius` minimal)
- Use Marianne font for all town-hall surfaces
- Guard all animations with `prefers-reduced-motion`
- Support dark mode for town-hall

### DON'T
- Don't invent token names outside the shadcn vocabulary
- Don't hardcode hex or HSL values in component code — always use CSS tokens
- Don't use arbitrary Tailwind values (`text-[#123456]`) — override tokens in `@theme`
- Don't use gradient backgrounds in town-hall
- Don't use a flat background for full citizen pages — gradient on `--primary` is required
- Don't use any icon library other than `lucide-react` / `lucide-react-native`
- Don't add motion without a `prefers-reduced-motion` guard
- Don't mix citizen and town-hall tokens in the same screen

---

## Open Decisions

| Decision | Status | Notes |
|---|---|---|
| Official logo / brand mark (SVG) | Pending | Using lucide icon placeholders |
| Municipality / city name | Pending | Currently "NeoCivis" across all apps |
| Marianne font hosting strategy | To implement | Self-host or official CDN |
| Town-hall dark mode implementation | To implement | Token overrides defined, UI not wired |
| Default `--primary` value for citizen preview/dev | Pending | Needs a sensible fallback blue |
