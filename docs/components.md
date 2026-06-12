# Cicrus — Components

Every class ships in [`src/components.css`](../src/components.css) (`.c-*`, UI) or
[`src/content.css`](../src/content.css) (`.doc-*`, long-form). Pull the whole system
with one import:

```html
<link rel="stylesheet" href="src/cicrus.css">
<body><!-- dark (default); add class="light" for light mode --></body>
```

Naming is BEM-ish: `.c-block`, `.c-block-elem`, `.c-block--modifier`. Tokens
(`var(--text-primary)`, `var(--space-md)`, …) come from [`tokens.md`](./tokens.md).
Every live example is in [`../examples/previews/`](../examples/previews/).

---

## Shell & layout

| Class | Role |
|-------|------|
| `.c-view` | Page wrapper — `max-width:1280px`, centered, padded. Modifiers `--wide`, `--full`. |
| `.c-view-header` | Baseline-aligned title + meta row. |
| `.c-view-title` | Display-font page title (36px). `--sm` → 28px. |
| `.c-view-meta` | Mono ALL-CAPS code string, pushed right. |
| `.c-section` / `.c-section-title` | Content section + its mono ALL-CAPS label. |
| `.c-toolbar` | Flex row of controls. `--spread` justifies; `.c-toolbar-left/-right/-spacer` align groups. |
| `.c-divider` | 1px hairline rule (utility). |

## Chrome (top bar, tabs, sidebar, mode)

| Class | Role |
|-------|------|
| `.c-topbar` | Sticky 56-ish top bar: brand + tabs + mode. |
| `.c-brand` | Mono wordmark, wide-tracked. |
| `.c-tabs` / `.c-tab` | Tab strip; `.c-tab--active` underlines + brightens. |
| `.c-mode` | Segmented dark/light switch (`button.is-active`). |
| `.c-side` | Sidebar column. `.c-side-section-title`, `.c-side-list`, `.c-side-item` (`--active`, `--add`), `.c-side-count`, `.c-side-foot`, `.c-side-archive`. |
| `.c-head` | App header: `.c-head-title` (display 48px), `.c-head-sub`, `.c-head-meta`. |

## Buttons & inputs

| Class | Role |
|-------|------|
| `.c-btn` | Base button (mono caps, pill, min-height 44px). Variants `--primary`, `--secondary`, `--ghost`, `--danger`; size `--sm`. |
| `.c-filter-btn` | Toolbar button with optional chevron `svg`. |
| `.c-input` | Underline-style text input. `--error` turns the underline red. |
| `.c-input-pill` | Pill-framed input for prominent search. `.c-input-pill-prefix` for a leading label. |

## Badges

Border-only pills; color encodes category. Base `.c-badge` + one modifier:

| Modifier | Color | Use |
|----------|-------|-----|
| `--neutral` | secondary | default type tag |
| `--strong` | primary | emphasis / process |
| `--info` | interactive (blue) | reference / link-y |
| `--success` | green | counts, done |
| `--warning` | amber | monitor / attention |
| `--accent` | red | failure (rare) |
| `--muted` / `--subtle` | disabled | system / recurring meta |

Mono 10px, ALL-CAPS. Max 3 per surface. Apply color to text + border, never fill.

## Status signals

| Class | Role |
|-------|------|
| `.c-dot` | Health light. `.c-dot--up` (green), `.c-dot--down` (red, pulses), `.c-dot--warn` (amber), `.c-dot--idle`. Single-dash forms are deprecated aliases. |
| `.c-status-dot` | Process-state dot. `--todo`, `--running` (pulses), `--review`, `--done`, `--failed`. |
| `.c-alert` | Single-row inline banner. `--warning`, `--info`. Prefix copy with `[ERROR]` / `[WARN]` / `[INFO]`. |

## Cards & items

| Class | Role |
|-------|------|
| `.c-card` | **Generic surface.** `--raised` (lighter fill), `--clickable` (hover border). `.c-card-title`, `.c-card-desc`, `.c-card-meta`. |
| `.c-item` | **Rich board/list item.** `.c-item-body`, `.c-item-head`, `.c-item-heading`, `.c-item-id`, `.c-item-title`. Action button `.c-item-action` (`--running/--review/--done`). Progress `.c-item-progress` (`--warning/--success`) + `.c-item-meter`. Expandable `.c-item-detail-list`. States `.c-item--running` (animated glow), `.c-item--done`, `.is-open`. |
| `.c-statuscard` | Labeled status card (dot + name + detail). Grid `.c-statuscard-grid`. |

## Board, columns, stats

| Class | Role |
|-------|------|
| `.c-board` | Responsive column grid (4 → 2 → 1). |
| `.c-col` | A column: `.c-col-head`, `.c-col-title`, `.c-col-count`, `.c-col-empty`. |
| `.c-stats` / `.c-stat` | Stats strip + cell. `.c-stat-label`, `.c-stat-value` (`--danger/--success/--warning`), `.c-stat-bar` (segmented `span.on/.danger/.success/.warning`). |

## Timeline & detail panel

| Class | Role |
|-------|------|
| `.c-timeline-row` | Page event row: `.c-timeline-time`, `.c-timeline-badges`, `.c-timeline-content`, `.c-timeline-text`, `.c-timeline-sub`. |
| `.c-panel` | Slide-in detail panel. `.c-panel-head`, `.c-panel-eyebrow`, `.c-panel-close`, `.c-panel-body`, `.c-panel-title`, `.c-panel-pill` (`--running/--review/--done/--neutral`), `.c-panel-progress(-wrap)`, `.c-panel-meter`, `.c-panel-section`. |
| `.c-panel-timeline` | Run-log list (`li.is-done/.is-active/.is-pending`): `.c-panel-time`, `.c-panel-dot`, `.c-panel-step`. |
| `.c-panel-output` | Monospace log block. |
| `.c-panel-foot` / `.c-panel-btn` | Sticky footer + buttons (`--primary`, `--danger`). |

## Index & misc

| Class | Role |
|-------|------|
| `.c-index-cols` | 3-column link index. `.c-index-col-title`, `.c-index-col-sub`, `.c-index-item` (kebab-case slugs). |
| `.c-errorrow` | Failure row: `.c-errorrow-title`, `.c-errorrow-detail` (red, break-all). |
| `.c-kv` | Key/value metadata grid (`dt` / `dd`). |
| `.c-empty`, `.c-loading`, `.c-not-impl` | State stubs (`[LOADING...]`, `[NOT YET IMPLEMENTED]`). |

## Data graphics (`.c-*`, Tufte)

Quantitative-display components in [`dataviz.css`](../src/dataviz.css). Per-instance
values pass as **unitless 0–100** custom properties via inline `style`. Color
(`--success`/`--warning`/`--accent`) is a *signal* — threshold crossings only, never
decoration. Full rationale in [`data-graphics.md`](./data-graphics.md).

| Class | Role |
|-------|------|
| `.c-spark` | Word-sized sparkline. Wraps an inline `<svg><polyline></svg>`; mark latest with `<circle>`, extremes with `.c-spark-hi`/`.c-spark-lo`. Pair with its number via `.c-spark-pair` + `.c-spark-now`. |
| `.c-sparkbar` | Inline mini bar chart. Each `<i>` column height = `--v`. Status fills `.c-bar-hi`/`-warn`/`-alarm`. |
| `.c-bars` | Labeled horizontal bars (grid: label · track · value). `.c-bar-label`, `.c-bar-track`, `.c-bar-fill` (`--v` width; `--ctx`/`--over`/`--ok`/`--warn`), `.c-bar-value`. Bars start at 0 (lie factor 1.0). |
| `.c-dotplot` | Dot plot — Tufte's bar replacement. `.c-dotplot-label`, `.c-dotplot-track` (dot at `--v`; `--over`/`--ok`/`--ctx`; dashed reference at `--ref` via `.c-dot--ref`), `.c-dotplot-value`. |
| `.c-rangebar` | min · median · max in one channel. `.c-rangebar-track` spans `--lo`→`--hi` with a center dot at `--mid`. |
| `.c-multiples` | Small-multiples grid (`--cols`). Each `.c-multiple` holds `.c-multiple-label`, a chart, `.c-multiple-value`. Identical scales; comparison through space, not animation. |
| `.c-gauge` | The one acceptable circular chart — single ratio at `--v`. Variants `--ok`/`--warn`/`--alarm`. Center via `.c-gauge-wrap` > `.c-gauge-center` (`.c-gauge-num`, `.c-gauge-unit`). |
| `.c-delta` | Change indicator. Glyph = direction (`--up`/`--down`), color = good/bad (`--good`/`--bad`/`--warn`). |
| `.c-metrics` | Dashboard metric table: `.c-metric-name` · `.c-metric-spark` · `.c-metric-now` · delta. The canonical micro/macro tile. |

Live preview: [`../examples/previews/dataviz/`](../examples/previews/dataviz/).

## Motion (`.c-*`)

Opt-in animation classes in [`motion.css`](../src/motion.css) — percussive,
compositor-only (opacity + transform), all gated behind `prefers-reduced-motion`.
Full guide: [`motion.md`](./motion.md).

| Class | Role |
|-------|------|
| `.c-rise` | Fade-up entrance for one element. |
| `.c-stagger` | Children enter in reading order, 35ms apart. |
| `.c-slide-in` | Panel/drawer entrance from the right. |
| `.c-data-enter` | On a parent: bars sweep from zero, sparkbar columns rise, sparklines draw (`pathLength="1"`). |
| `.c-caret` / `.c-blink` | Hard `steps()` blink — terminal caret / liveness. |
| `.c-loading--live` | Cycling dots on `.c-loading` (fixed width). |
| `.c-tick` | One-shot relay-flip for a changed value (re-add from JS). |

Motion tokens: `--ease` (the one curve), `--dur-micro` 150ms, `--dur-switch` 300ms,
`--dur-view` 400ms, `--dur-data` 600ms (data sweeps). The gauge's `--v` is registered,
so JS updates sweep the ring.

## Utilities

`.c-mono`, `.c-display`, `.c-caps` (type) · `.c-muted`, `.c-secondary`, `.c-primary`,
`.c-display-c`, `.c-danger`, `.c-success`, `.c-warning` (color) · `.c-divider`,
`.c-dot-grid` (structure).

---

## Long-form content (`.doc-*`)

For documents, articles, and knowledge bases (see [`content.css`](../src/content.css)).
All under the non-colliding `.doc-*` namespace.

- **Type:** `.doc-eyebrow`, `.doc-title`, `.doc-deck`, `.doc-body` (`p`, `ul`, `ol`, `.lead`), `.doc-quote`.
- **Inline:** `code`, `kbd`, `.term`, `sup.fn` (footnote ref).
- **Callouts:** `.doc-callout` + `--tip/--warn/--danger/--example`; `.doc-prompt` (copy-to-clipboard prompt block).
- **Reference:** `.doc-defs`, `.doc-table`, `.doc-glossary`, `.doc-figure`, `.doc-footnotes`, `.doc-keylist` (titled scannable list).
- **Procedure:** `.doc-steps`/`.doc-step`, `.doc-compare` (`--do`/`--dont`), `.doc-code` (+ copy), `.doc-reveal` (disclosure).
- **Interactive:** `.doc-quiz` (question/options), `.doc-lab` (task input), `.doc-reflect` (free response).
- **Chrome & closing:** `.doc-crumb`, `.doc-toc`, `.doc-progress`, `.doc-mode-switch`, `.doc-summary`, `.doc-modnav`, `.margin-note`.

Each has a standalone preview in [`../examples/previews/content/`](../examples/previews/content/).
