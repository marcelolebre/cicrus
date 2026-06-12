# Cicrus Design System — Tokens

## 1. TYPOGRAPHY

### Font Stack

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| **Display** | `"Doto"` | `"Space Mono", monospace` | 400, 500, 700 — variable dot-size |
| **Body / UI** | `"Space Grotesk"` | `"DM Sans", system-ui, sans-serif` | Light 300, Regular 400, Medium 500, Bold 700 |
| **Data / Labels** | `"Space Mono"` | `"JetBrains Mono", "SF Mono", monospace` | Regular 400, Bold 700 |

**Google Fonts loader** — add before anything else:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&family=Doto:wght@400;500;700&display=swap" rel="stylesheet">
```

**Why these fonts:** Doto = variable dot-matrix (closest open-source analog to Nothing's NDot 57). Space Grotesk + Space Mono by Colophon Foundry — same foundry as Nothing's actual typefaces, shared design DNA.

### Type Scale

| Token | Size | Line Height | Letter Spacing | Use |
|-------|------|-------------|----------------|-----|
| `--display-xl` | 72px | 1.0 | -0.03em | Hero numbers, time displays |
| `--display-lg` | 48px | 1.05 | -0.02em | Section heroes, knowledge stat counts |
| `--display-md` | 36px | 1.1 | -0.02em | Page titles (view-title), stat values |
| `--heading` | 24px | 1.2 | -0.01em | Section headings |
| `--subheading` | 18px | 1.3 | 0 | Subsections |
| `--body` | 16px | 1.5 | 0 | Body text |
| `--body-sm` | 14px | 1.5 | 0.01em | Card titles, task cards, service names |
| `--caption` | 12px | 1.4 | 0.04em | Knowledge items, timestamps, descriptions |
| `--label` | 11px | 1.2 | 0.08em | ALL CAPS monospace labels, nav, column titles |
| `--label-xs` | 10px | 1.2 | 0.06–0.08em | Badges, stat-label, mode-toggle label |

### Typographic Rules

- **Doto:** 36px+ only, tight tracking, never for body text. Used for brand wordmark ("cicrus"), hero numbers. In dark mode `--heading-weight: 300` is acceptable for display; in light mode push to 400–500 for readability.
- **Labels:** Always Space Mono, ALL CAPS, 0.06–0.1em tracking, 10–11px. Think "instrument panel stencil."
- **Data/Numbers:** Always Space Mono. Units as `--label` size, slightly raised, adjacent.
- **Hierarchy:** display (Doto) > heading (Space Grotesk) > label (Space Mono caps) > body (Space Grotesk). Four levels max per screen.
- **Body paragraphs** (task card descriptions): Space Grotesk weight 300 for a slightly softer, more readable block — distinguishes from regular UI text.

---

## 2. COLOR SYSTEM

> All ratios computed per WCAG 2.1. Every role that carries readable text clears **AA**.

### Dark Mode (default)

| Token | Hex | Contrast on `--black` (#000) | Role |
|-------|-----|:-:|------|
| `--black` | `#000000` | — | Primary background (OLED) |
| `--surface` | `#111111` | — | Elevated surfaces, cards, nav, theme-bar |
| `--surface-raised` | `#1A1A1A` | — | Secondary elevation, task cards, dropdowns |
| `--border` | `#2E2E2E` | — | Subtle dividers, card outline (decorative) |
| `--border-visible` | `#555555` | 2.8:1 (non-text) | Intentional borders, filter-btn, input underline |
| `--text-disabled` | `#8F8F8F` | 6.5:1 | Nav default, timestamps, placeholders, col-count |
| `--text-secondary` | `#B8B8B8` | 10.6:1 | Labels, card descriptions, knowledge items |
| `--text-primary` | `#E8E8E8` | 17.1:1 | Body text, task titles, service names |
| `--text-display` | `#FFFFFF` | 21:1 | Headlines, hero numbers, active nav |

### Light Mode

| Token | Hex | Contrast on `--black` (#F5F5F5) | Role |
|-------|-----|:-:|------|
| `--black` | `#F5F5F5` | — | Primary background (neutral off-white, printed page) |
| `--surface` | `#FFFFFF` | — | Elevated surfaces, cards, nav |
| `--surface-raised` | `#F0F0F0` | — | Secondary elevation |
| `--border` | `#D9D9D9` | — | Subtle dividers |
| `--border-visible` | `#9E9E9E` | 2.5:1 (non-text) | Intentional borders |
| `--text-disabled` | `#6B6B6B` | 4.9:1 | Nav default, timestamps, placeholders |
| `--text-secondary` | `#595959` | 6.4:1 | Labels, card descriptions |
| `--text-primary` | `#1A1A1A` | 16.0:1 | Body text |
| `--text-display` | `#000000` | 21:1 | Headlines |

### Accent & Status (mode-aware — the role is identical, the shade tracks the mode for AA)

| Token | Dark | Light | Liquid | Usage |
|-------|------|-------|--------|-------|
| `--accent` | `#F0353D` (5.3:1) | `#D71921` (4.8:1) | `#FF5C5C` (4.9:1 on film) | Signal light: destructive, urgent, error banners. One per screen. Never decorative. Brand red `#D71921` is the print shade; dark/liquid brighten it because deep red fails AA as text on those floors. |
| `--accent-subtle` | `rgba(240,53,61,0.15)` | `rgba(215,25,33,0.08)` | `rgba(255,92,92,0.16)` | Accent tint backgrounds (alert banners) |
| `--success` | `#4A9E5C` (6.3:1) | `#2E7D32` (4.7:1) | `#5EE596` | Confirmed, completed, connected, "UP" services |
| `--warning` | `#D4A843` (9.5:1) | `#8F6A00` (4.6:1) | `#E8CC74` | Caution, pending, degraded |
| `--error` | — | — | — | Alias of `--accent` in every mode — errors ARE the accent moment |
| `--interactive` | `#5B9BF6` (7.5:1) | `#0058CC` (5.9:1) | `#7DE8D8` | Tappable text: links, picker values, resource badges. Not for buttons. |

### Data Status Colors

`--success` = good / in range  •  `--warning` = moderate / attention  •  `--accent` = bad / over limit  •  `--text-primary` = neutral.

Apply color to the **value**, not the label or row background. Labels stay `--text-secondary`. Trend arrows inherit the value color. Badge category colors are the one exception: tinted text on a bordered pill (see `components.md` §7).

### Mode Feel

- **Dark feel:** Instrument panel in a dark room. OLED black, white data glowing, red signal light when something needs attention.
- **Light feel:** Printed technical manual. Warm off-white page (#F5F5F5), black ink. Cards = `#FFFFFF` floating on the page — subtle elevation without shadows.

---

## 3. SPACING (8px base)

| Token | Value | Use |
|-------|-------|-----|
| `--space-2xs` | 2px | Optical adjustments, progress bar segment gaps |
| `--space-xs` | 4px | Icon-to-label gaps, tight padding, badge gaps |
| `--space-sm` | 8px | Component internal spacing, filter-btn icon gap |
| `--space-md` | 16px | Standard padding, kanban column gaps, grid gaps |
| `--space-lg` | 24px | Group separation, view padding vertical |
| `--space-xl` | 32px | Section margins, view horizontal padding |
| `--space-2xl` | 48px | Major section breaks, knowledge-stats gap |
| `--space-3xl` | 64px | Page-level vertical rhythm |
| `--space-4xl` | 96px | Hero breathing room, empty-state padding |

---

## 4. LAYOUT

### Grid

- **Max content width:** 1280px. Views centered or left-aligned with horizontal padding `--space-xl` (32px).
- **Kanban:** 4 columns, `grid-template-columns: repeat(4, 1fr)` with `--space-md` gap, min-height 520px.
- **Services grid:** 4 columns, `--space-md` gap.
- **Stats grid:** 6 columns, `--space-md` gap.
- **Knowledge columns:** 3 columns, `--space-2xl` gap.
- **Timeline row:** `grid-template-columns: 160px auto 1fr` — fixed time column, auto badges column, flexible content column.

### Nav

- Sticky top, `height: 56px`, `padding: 0 var(--space-xl)`, `border-bottom: 1px solid var(--border)`.
- Brand wordmark `--space-2xl` right margin from nav links.
- Mode toggle pinned `margin-left: auto`.

### Corners

| Element | Radius |
|---------|-------:|
| Cards (task, service, stat, kanban col) | **8px** |
| Technical surfaces (alert banner, modals) | **4–8px** |
| Pills (badges, filter-btn, theme-bar) | **999px** |
| Mode toggle track | 999px |
| Theme bar | 999px container, 50% thumb |
| Button (primary/secondary/destructive) | 999px |
| Inputs (underline style) | 0 |

Never exceed **16px** on cards.

---

## 5. MOTION & INTERACTION

- **Duration:** 150–200ms micro (hover, focus), 250–300ms mode/theme switches, 300–400ms view transitions.
- **Easing:** `cubic-bezier(0.25, 0.1, 0.25, 1)` — subtle ease-out, percussive. No spring, no bounce.
- **Prefer opacity over position.** Elements fade, don't slide.
- **Hover:** border/text brightens by one color step (e.g. `--border-visible` → `--text-secondary`). No scale, no shadows.
- **Active:** dot, underline, or inverted fill. Never just color change alone for nav.
- **View transitions:** `fadeIn 0.25s` on enter. Staggered `0.03s`/`0.08s`/`0.13s`/`0.18s` delays for column-sequence fade-ins.
- **Status pulse:** `.status-dot.down` animates `opacity 1 → 0.4 → 1` over 2s infinite. Subtle — no red flash.

---

## 6. ICONOGRAPHY

- Monoline, **1.5px stroke**, no fill. 24×24 base, 20×20 live area. Round caps/joins.
- Color inherits text color. Max 5–6 strokes per icon.
- **Preferred libraries:** Lucide (thin variant), Phosphor (thin weight). Never filled or multi-color.
- **Chevrons in filter-btn:** `10×10`, `opacity: 0.5`, `stroke-width: 1.5`.
- **Alert icon:** triangle with internal exclamation, 16×16, stroke `currentColor` (inherits `--accent`).

---

## 7. DOT-MATRIX MOTIF

**When to use:** Hero typography (Doto), decorative grid backgrounds, dot-grid data viz, loading indicators, empty-state illustrations.

```css
.dot-grid-bg {
  background-image: radial-gradient(circle, var(--border) 0.5px, transparent 0.5px);
  background-size: 16px 16px;
}
.dot-grid-strong {
  background-image: radial-gradient(circle, var(--border-visible) 1px, transparent 1px);
  background-size: 16px 16px;
}
```

Dots 0.5–2px, uniform 12–16px grid. Opacity 0.1–0.2 for backgrounds, full for data. Never as a container border or button style.

---

## 8. BADGE TAXONOMY

Badges are border-only pills (no fill). Color encodes **category**, not priority. Apply to text + border; keep background transparent.

| Class | Color token | Use | Example label |
|-------|-------------|-----|---------------|
| `.badge--strong` | `--text-primary` + border `--text-secondary` | Process / default emphasis | `SESSION_PROCESS` |
| `.badge--info` | `--interactive` + border `rgba(91,155,246,0.3)` | Resource / reference | `SESSION_RESOURCE` |
| `.badge--warning` | `--warning` + border `rgba(212,168,67,0.3)` | Monitor / observation | `MAKE_MONITOR` |
| `.badge--success` | `--success` + border `rgba(74,158,92,0.3)` | Step count, progress | `2 STEPS` |
| `.badge--muted` | `--text-disabled` + border `--border-visible` | System / infrastructure | `SYSTEM`, `DKR` |
| `.badge--subtle` | `--text-disabled` + border `--border` | Recurring / meta | `RECURRING` |
| `.badge--neutral` | `--text-secondary` + border `--border-visible` | Type tag in lists | `STATUS_CHANGE` |

All badges share: Space Mono 10px, 0.06em letter-spacing, UPPERCASE, `padding: 3px 10px`, `border-radius: 999px`, `border: 1px solid`.

---

## 9. FULL CSS TOKEN BLOCK

Drop-in starter. Mode switched by adding `.light` to `<body>`.

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  /* Spacing */
  --space-2xs: 2px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
}

/* ── Dark (default) ── */
body {
  --black: #000000;
  --surface: #111111;
  --surface-raised: #1A1A1A;
  --border: #2E2E2E;
  --border-visible: #555555;
  --text-disabled: #8F8F8F;
  --text-secondary: #B8B8B8;
  --text-primary: #E8E8E8;
  --text-display: #FFFFFF;
  --accent: #F0353D;          /* brand #D71921 brightened for AA on OLED black */
  --accent-subtle: rgba(240,53,61,0.15);
  --success: #4A9E5C;
  --warning: #D4A843;
  --error: var(--accent);
  --interactive: #5B9BF6;
  --font-body: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Space Mono', monospace;
  --font-display: 'Doto', 'Space Mono', monospace;
  --heading-weight: 300;
  --heading-ls: -0.02em;
  --card-shadow: none;
  /* No theme-switch transition on body — a Chromium bug freezes
     var()-driven properties when only the custom property changes. */
}

/* ── Light ── */
body.light {
  --black: #F5F5F5;
  --surface: #FFFFFF;
  --surface-raised: #F0F0F0;
  --border: #D9D9D9;
  --border-visible: #9E9E9E;
  --text-disabled: #6B6B6B;
  --text-secondary: #595959;
  --text-primary: #1A1A1A;
  --text-display: #000000;
  --accent: #D71921;          /* brand red holds AA on paper */
  --accent-subtle: rgba(215,25,33,0.08);
  --success: #2E7D32;
  --warning: #8F6A00;
  --interactive: #0058CC;
}

/* Liquid (body.liquid) adds the milky-film glass tokens —
   see src/tokens.css and the glass group in tokens.json. */
```
