# Cicrus Design System — Icarus Hub reference integration

*Adopted: 2026-04-21*

> **What this doc is:** a worked example of Cicrus integrated into a real Phoenix / LiveView application ([Icarus Hub](https://github.com/marcelolebre/icarus)). Paths like `apps/icarus_hub/...` refer to that app, not to this repo. Use it as a template for wiring Cicrus into your own stack — mode toggle, font loading, token overrides, legacy aliases.
>
> **What this doc isn't:** the design system itself. For that, read [`skill/SKILL.md`](./skill/SKILL.md) and [`skill/references/`](./skill/references/).

The Icarus Hub UI is built on **Cicrus** — a monochromatic, typography-first operator-console design system. Dark and light modes are both first-class. Every page uses the same token set; switching modes is a single class on `<body>`.

---

## TL;DR

- CSS tokens define every color, space, font, and radius
- Dark mode is the default; `body.light` overrides for light mode
- Mode persists via `localStorage` (`icarus.mode`), no flash on reload
- Three fonts from Google Fonts CDN: Space Grotesk, Space Mono, Doto
- Two class namespaces coexist: `.c-*` (shared Cicrus components) and page-local (`.t-*`, `.msg-*`, `.tl-*`, etc.)
- Legacy `--ic-*` variables are aliased to Cicrus tokens so old pages keep working

---

## File layout

| Path | Purpose |
|------|---------|
| `apps/icarus_hub/priv/static/assets/cicrus.css` | Shared component styles (`.c-view`, `.c-view-header`, `.c-view-title`, `.c-section-title`, `.c-kv`, `.c-caps`) |
| `apps/icarus_hub/lib/icarus_hub_web/components/layouts.ex` | Root layout: Google Fonts CDN, token definitions, mode toggle hook, nav bar |
| `apps/icarus_hub/lib/icarus_hub_web/live/settings_live.ex` | `/settings` page with the dark/light segmented picker |
| `skills/cicrus-design/SKILL.md` | Skill entry point (read-gated: explicit invocation required) |
| `skills/cicrus-design/references/tokens.md` | Complete token definitions (fonts, colors, spacing, radius, shadows) |
| `skills/cicrus-design/references/components.md` | Component patterns (badges, cards, kanban, forms, tables) |
| `skills/cicrus-design/references/patterns.md` | Layout patterns (views, headers, navigation) |

---

## Tokens

Defined in `layouts.ex` as CSS custom properties on `:root` (dark) and `body.light` (light override).

### Font stack

```css
--font-display: 'Doto', monospace;              /* hero titles, dot-matrix aesthetic */
--font-body:    'Space Grotesk', system-ui, sans-serif;   /* body copy, tile labels, data */
--font-mono:    'Space Mono', 'SF Mono', monospace;       /* ALL-CAPS labels, clock, numbers */
```

Loaded from `fonts.googleapis.com` in the root layout `<head>`. No self-hosting today; if offline operation matters later, mirror into `priv/static/fonts/`.

### Color tokens (semantic)

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `--black` | `#000` | `#000` | True-black anchor (rare) |
| `--surface` | `#0a0a0a` | `#fff` | Page background |
| `--surface-raised` | `#141414` | `#f7f7f4` | Cards, panels, note backgrounds |
| `--border` | `#1a1a1a` | `#e6e3de` | Hairlines between surfaces |
| `--border-visible` | `#2a2a2a` | `#c8c4bc` | Hover borders, focus states |
| `--text-display` | `#fff` | `#111` | Hero titles, Doto output, button text |
| `--text-primary` | `#e8e6df` | `#1f1d1a` | Body copy, data values |
| `--text-secondary` | `#a09d95` | `#5a5651` | Subtitles, meta rows |
| `--text-disabled` | `#5a5751` | `#9a968f` | Tertiary labels, archived items |
| `--text-faint` | `#3a3833` | `#b8b3ab` | Placeholders, subtle hints |
| `--accent` | `#d71921` | `#d71921` | Destructive, errors, failed states |
| `--accent-subtle` | `rgba(215,25,33,0.08)` | `rgba(215,25,33,0.08)` | Tinted error background |
| `--success` | `#4a9e5c` | `#2e7d32` | Done, ok, healthy |
| `--warning` | `#d4a843` | `#b59a5a` | Triage, in-progress, pending |
| `--interactive` | `#5b9bf6` | `#1a5fb4` | Links, dispatch, info |

### Spacing

All spacing is on an 8px grid:

```css
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  32px;
--space-2xl: 48px;
--space-4xl: 96px;
```

### Radius

```css
--radius-sm:   4px;
--radius:      6px;
--radius-pill: 999px;
```

### Shadows

```css
--hover-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
```

---

## Dark/light mode

### How it works

1. Root layout sets `<body class={...}>` based on `localStorage.getItem('icarus.mode')` via an inline script in `<head>` (runs before paint to avoid flash).
2. Default is dark. `body.light` overrides the tokens via a second block in `layouts.ex`.
3. Top-right toggle in the nav and a segmented picker at `/settings` both write to `localStorage` and update the `<body>` class without a reload.
4. Mode persists across reloads, tabs, and page navigation.

### Adding new pages

Every new LiveView page should:

- Use Cicrus tokens (`var(--text-primary)`, not `#333`)
- Never hardcode colors that might differ per mode
- Use shared `.c-*` classes for view wrappers, headers, and KV lists (see `cicrus.css`)
- Only introduce page-local `.*-*` class prefixes for page-specific widgets

### Adding new tokens

If you need a new semantic color, add it to **both** the `:root` and `body.light` blocks in `layouts.ex`. Never add a one-off hex. Example:

```css
:root {
  --metric-positive: #4a9e5c;  /* dark */
}
body.light {
  --metric-positive: #2e7d32;  /* light */
}
```

---

## Component library (`cicrus.css`)

Shared Cicrus components live in `apps/icarus_hub/priv/static/assets/cicrus.css`. Current classes:

| Class | Purpose |
|-------|---------|
| `.c-view` | Main page wrapper with consistent margin + max-width |
| `.c-view-header` | Hero row at the top of a page |
| `.c-view-title` | Display-font page title (Doto or Space Grotesk) |
| `.c-section-title` | `tracking-wide ALL-CAPS` section label |
| `.c-kv` | Key/value row for metadata blocks |
| `.c-caps` | Utility: ALL CAPS mono label |

Use these first; add new `.c-*` classes before duplicating page-local styles.

---

## Page inventory

| Route | LiveView | Cicrus status |
|-------|----------|---------------|
| `/` | `HomeLive` | Full Cicrus redesign (Doto hero, numbered tile grid) |
| `/status` | `StatusLive` | Token-migrated |
| `/timeline` | `TimelineLive` | Token-migrated |
| `/tasks` | `TasksLive` | Token-migrated (kanban, sidebar, modals) |
| `/tasks/archived` | `ArchivedTasksLive` | Token-migrated |
| `/messages` | `MessagesLive` | Token-migrated |
| `/inbox` | `InboxLive` | Token-migrated (avatars, outbound tinting) |
| `/schedules` | `SchedulesLive` | Token-migrated |
| `/knowledge` | `WikiLive` | Token-migrated (graph canvas uses `--black`) |
| `/blog` | `BlogLive` | Token-migrated |
| `/settings` | `SettingsLive` | Native Cicrus (new page) |

Every page returns HTTP 200 in both dark and light mode.

### Known raw hex exceptions

Two intentional `#b8151c` hovers remain in `tasks_live.ex` (destructive button `:hover` states). These are "darker variant of `--accent`" — the token set doesn't have an `--accent-pressed` yet. If a second destructive-hover case emerges, promote this to a token.

---

## Migration history

Shipped 2026-04-21 across five phased commits:

| Phase | Commit | Scope |
|-------|--------|-------|
| 0 | `ef6bd50` | Fonts + tokens + mode toggle + `/settings` page |
| 1 | `717725f` | Shared component library (`cicrus.css`) + legacy `--ic-*` aliases |
| 2 | `f4dbdbc` | `/tasks` — 72 hex → tokens (status pills, agent tags, kanban lanes, buttons) |
| 3 | `1ec981a` | `/`, `/status`, `/schedules`, `/timeline` (home fully redesigned, rest token-migrated) |
| 4 | `cc348da` | `/wiki`, `/inbox`, `/messages`, `/archived-tasks`, `/blog` |

### Migration approach

**Token substitution, not template rewrite.** Across ~7,300 lines of LiveView templates, raw hex colors were replaced with CSS custom properties via surgical `Edit` passes. Existing class names (`.t-card-del`, `.msg-m-val`, `.thread-unread-dot`) and render structure were preserved; only the color layer moved to tokens. Automatic dark/light mode support fell out for free.

Only the home page got a full redesign — it's the entry point and deserved the design statement. Every other page preserves muscle memory.

---

## Long-term cleanup

Not urgent, tracked for future:

- **Legacy `.ic-*` classes** still exist on most pages, aliased via `--ic-*` tokens. Long-term: migrate page-local classes to shared `.c-*` components. Multi-week stream.
- **Visual regression tests** — screenshots are eyeball-verified today. Playwright + pixel-diff would catch mode-specific regressions.
- **Self-hosted fonts** — Google Fonts CDN is fine for LAN operation; mirror into `priv/static/fonts/` if offline requirement emerges.

---

## Related

- [`skill/SKILL.md`](./skill/SKILL.md) — design system source of truth
- [Icarus repo](https://github.com/marcelolebre/icarus) — the reference application consuming Cicrus
