---
name: cicrus-design
description: This skill should be used when the user explicitly says "Cicrus style", "Cicrus design", "/cicrus-design", or directly asks to use/apply the Cicrus design system. NEVER trigger automatically for generic UI or design tasks.
version: 1.0.0
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Cicrus — Operator-Console Design System

A senior product designer's toolkit for building **operator consoles, dashboards, and internal tools**. Nothing-inspired (Swiss typography, industrial restraint, monochromatic canvas) but grounded in the concrete components of the Cicrus prototype: kanban boards, timelines, service dashboards, knowledge indexes. Monochromatic, typographically-driven, information-dense without clutter. Dark and light mode with equal rigor, WCAG-clean out of the box.

**Before any design work:**
1. Declare Google Fonts required and how to load them (see `references/tokens.md` §1).
2. Ask which mode to start with — dark or light. Neither is "derived."

---

## 1. DESIGN PHILOSOPHY

- **Subtract, don't add.** Every element earns its pixel. Default to removal.
- **Structure is ornament.** Expose the grid, the data, the hierarchy itself.
- **Monochrome is the canvas.** Color is an event, not a default — except when encoding data status.
- **Type does the heavy lifting.** Scale, weight, spacing create hierarchy — not color, not icons.
- **Labels are instrument labels.** ALL CAPS, Space Mono, 11px, 0.08em tracking — like hardware panel stencils.
- **Both modes are first-class.** Dark = OLED instrument panel. Light = printed technical manual. Full design attention on each.
- **Industrial warmth.** Technical and precise, but never cold. A human hand should be felt.
- **Accessibility is part of craft.** Every text color clears WCAG AA on its background. No exceptions for "aesthetic" muted text.
- **Tufte-aligned.** *The Visual Display of Quantitative Information* is part of the lineage. For anything quantitative — charts, dashboards, tables, sparklines — read [`references/data-graphics.md`](./references/data-graphics.md). Maximize the data-ink ratio. Erase what isn't data. No 3D, no pie charts, no chartjunk, no dual-axis line plots.

---

## 2. CRAFT RULES — HOW TO COMPOSE

### 2.1 The Three-Layer Rule

Every screen has exactly **three layers of importance.** Not two, not five. Three.

| Layer | What | How |
|-------|------|-----|
| **Primary** | The ONE thing the user sees first. A number, a headline, a state. | Doto or display font at 36–72px. `--text-display`. Breathing room around it. |
| **Secondary** | Supporting context. Labels, descriptions, related data. | `--body` / `--body-sm`. `--text-primary`. Grouped tight (8–16px) to primary. |
| **Tertiary** | Metadata, navigation, system info. Visible but never competing. | Space Mono `--label` ALL CAPS. `--text-secondary` or `--text-disabled`. Pushed to edges. |

**The squint test:** Squint at the screen. Can you still tell what's most important? If two elements compete, one needs to shrink, fade, or move.

**Common mistake:** Making everything "secondary." Evenly-sized elements with even spacing = visual flatness. Be brave — make the primary absurdly large and the tertiary absurdly small. The contrast IS the hierarchy.

### 2.2 Font Discipline

Per screen, maximum:
- **2 font families** — Space Grotesk + Space Mono. Doto reserved for hero moments only.
- **3 font sizes** — one large, one medium, one small.
- **2 font weights** — Regular + one other (usually Light 300 or Medium 500, rarely Bold 700).

Think of it as a budget. Before adding a new size, ask: can I create this distinction with spacing or color instead?

| Decision | Size | Weight | Color |
|----------|:----:|:------:|:-----:|
| Heading vs. body | Yes | No | No |
| Label vs. value | No | No | Yes |
| Active vs. inactive nav | No | No | Yes |
| Hero number vs. unit | Yes | No | No |
| Section title vs. content | Yes | Optional | No |

**Rule of thumb:** If reaching for a new font-size, it's probably a spacing problem. Add distance instead.

### 2.3 Spacing as Meaning

Spacing is the primary tool for communicating relationships.

```
Tight (4–8px)    = "These belong together"        (icon+label, number+unit)
Medium (16px)    = "Same group, different items"  (list rows, form fields)
Wide (32–48px)   = "New group starts here"        (section breaks)
Vast (64–96px)   = "This is a new context"        (hero → content, major divisions)
```

**If a divider line is needed, the spacing is probably wrong.** Dividers are a symptom of insufficient spacing contrast. Use them only in data-dense lists (timeline, knowledge-item lists) where items are structurally identical and a visual rail helps scanning.

### 2.4 Container Strategy (prefer top)

1. **Spacing alone** — proximity groups items.
2. A single divider line.
3. A subtle border outline.
4. A surface card with background change.

Each step down adds visual weight. Use the lightest tool that works. Never box the most important element — let it float on the background.

### 2.5 Color as Hierarchy

In a monochrome system, the gray scale IS the hierarchy. Max 4 levels per screen:

```
--text-display (100%) → Hero numbers. Sparingly — one focal per screen.
--text-primary (90%)  → Body text, card titles.
--text-secondary (70%) → Labels, captions, metadata — MUST be readable, not "ghosted."
--text-disabled (55%) → Tertiary meta, timestamps, nav default, placeholders.
```

**Minimum contrast targets (WCAG AA):**
- `--text-primary` on any surface: **≥ 7:1**
- `--text-secondary`: **≥ 4.5:1** on its default background
- `--text-disabled`: **≥ 3:1** — reserved for non-content (placeholders, disabled controls, purely decorative meta)

Verify every palette change against these. "Muted" is not an excuse for unreadable.

**Red (#D71921) is not part of the hierarchy.** It's an interrupt — "look HERE, NOW." Reserved for alerts, destructive actions, failures, and the one-and-only accent moment per screen.

**Category colors** (badge taxonomy, see `references/components.md` §7): `--interactive` (blue) for resources, `--warning` (amber) for monitors, `--success` (green) for step counts, neutral for everything else. Apply color to the **label text**, not the background fill.

### 2.6 Consistency vs. Variance

**Be consistent in:** font families, label treatment (Space Mono ALL CAPS 0.08em), spacing rhythm, color roles, corner radii (8px cards, 999px pills, 4px technical), alignment.

**Break the pattern in exactly ONE place per screen:** an oversized hero number, a circular widget among rectangles, a single red accent among grays, a Doto headline, a vast gap where everything else is tight.

This single break IS the design. Without it: sterile grid. With more than one: visual chaos.

### 2.7 Compositional Balance

**Asymmetry > symmetry.** Centered layouts feel generic. Favor deliberately unbalanced composition:
- **Large left, small right:** Hero metric + metadata stack.
- **Top-heavy:** Big headline near top, sparse content below.
- **Edge-anchored:** Important elements pinned to screen edges, negative space in center.

Balance heavy elements with more empty space, not with more heavy elements.

### 2.8 The Cicrus Vibe

1. **Confidence through emptiness.** Large uninterrupted background areas. Resist filling space.
2. **Precision in the small things.** Letter-spacing, exact gray values, 4px gaps. Micro-decisions compound into craft.
3. **Data as beauty.** `36GB/s` in Space Mono at 48px IS the visual. No illustrations needed.
4. **Mechanical honesty.** A toggle looks like a physical switch. A gauge looks like an instrument. A status dot is a signal light — not a checkmark icon.
5. **One moment of surprise.** A dot-matrix headline. A circular widget. A red dot in a sea of white. Restraint makes the one expressive moment powerful.
6. **Percussive, not fluid.** Imagine UI sounds: click not swoosh, tick not chime. Design transitions that feel mechanical and precise — never springy, never bouncy.

### 2.9 Visual Variety in Data-Dense Screens

When 3+ data sections appear on one screen, vary the visual form:

| Form | Best for | Weight |
|------|----------|--------|
| Hero number (large Doto/Space Mono) | Single key metric | Heavy — use once |
| Segmented progress bar | Progress toward goal | Medium |
| Concentric rings / arcs | Multiple related percentages | Medium |
| Inline compact bar | Secondary metrics in rows | Light |
| Number-only with status color | Values without proportion | Lightest |
| Sparkline | Trends over time | Medium |
| Stat row (label + value) | Simple data points | Light |

Lead section → heaviest treatment. Secondary → different form. Tertiary → lightest. The FORM varies, the VOICE stays the same.

---

## 3. ANTI-PATTERNS — WHAT TO NEVER DO

- No gradients in UI chrome.
- No shadows on dark mode. Subtle layered shadows allowed on light mode cards (one-level elevation max).
- No skeleton loading screens. Use `[LOADING...]` text or a segmented spinner.
- No toast popups. Use inline status text: `[SAVED]`, `[ERROR: ...]`.
- No sad-face illustrations, cute mascots, or multi-paragraph empty states.
- No zebra striping in tables.
- No filled icons, multi-color icons, or emoji as UI.
- No parallax, scroll-jacking, gratuitous animation.
- No spring/bounce easing. Use `cubic-bezier(0.25, 0.1, 0.25, 1)` ease-out only.
- No border-radius > 16px on cards. Buttons are pill (999px) or technical (4–8px). Badges are pill (999px).
- No muted text below 4.5:1 contrast for anything a user needs to read.
- No label text in sentence case. Labels are ALL CAPS Space Mono.
- Data visualization: differentiate with **opacity** (100%/60%/30%) or **pattern** (solid/striped/dotted) before introducing color.
- **Schematics:** no moving particles along traces (the line itself encodes flow via dashed animation). No border flash on event arrival; state changes via colour, not motion. No text flicker on metric refresh; numbers just change. No marching dashed borders — only trace *lines* may flow, never card *borders*.
- **Data graphics (per `references/data-graphics.md`):** no 3D charts, no pie charts (single-arc gauge is the one exception), no dual-axis line plots, no moiré / hatching / striped fills, no truncated y-axes on bar charts, no "ducks," no legends inside plot areas (label in place), no decorative frames or filled grids around plots. Maximize the data-ink ratio. When in doubt, erase.

---

## 4. WORKFLOW

1. **Declare fonts** — tell the user which Google Fonts to load (see `references/tokens.md` §1). Default stack: `Space Grotesk`, `Space Mono`, `Doto`.
2. **Ask mode** — dark or light? Neither is default. Both must be supported from day one.
3. **Sketch hierarchy** — identify the 3 layers before writing any code.
4. **Compose** — apply craft rules (§2.1–2.9).
5. **Check tokens** — consult `references/tokens.md` for exact values.
6. **Build components** — consult `references/components.md` for patterns. Prefer existing component types.
7. **Assemble screens** — consult `references/patterns.md` for screen-level compositions (board, feed, dashboard, index).
8. **Adapt to platform** — consult `references/platform-mapping.md` for output conventions.
9. **Verify contrast** — every text color vs. its background. Reject anything below the targets in §2.5.

---

## 5. REFERENCE FILES

For detailed token values, component specs, and platform-specific guidance:

- **`references/tokens.md`** — Fonts, type scale, color system (dark + light with WCAG ratios), spacing scale, grid, motion, iconography, dot-matrix motif, badge taxonomy.
- **`references/components.md`** — Nav, mode toggle, view header, badges, filter buttons, inputs, cards (task, service, stat), kanban column, timeline item, knowledge column, alert banner, status dot, theme bar, segmented progress, toggles, scrollbar.
- **`references/patterns.md`** — Screen-level compositions: kanban board, timeline feed, agent timeline, notification inbox, service dashboard, knowledge index, stats grid, empty/error/loading states.
- **`references/platform-mapping.md`** — HTML/CSS, React/Tailwind, SwiftUI output conventions.
- **`references/schematics.md`** — Operator-console architecture diagrams. Layered cards as modules, SVG traces as connectors, animation grammar where flow speed encodes link load and breathing dots encode liveness.
- **`references/data-graphics.md`** — Tufte applied to Cicrus. Sparklines, dot plots, range bars, small multiples, slopegraphs, gauges. Data-ink discipline, lie factor, chartjunk anti-patterns, and a pre-ship checklist for any quantitative graphic.
- **`references/glyphs.md`** — Animated state glyphs (idle, thinking, error). Pixel-grid canvas renderers for one "thinking object" entity in three states, with `mountGlyph` API and embed snippets.
- **`references/glyphs-starter.html`** — Worked example showing the three glyphs side by side, loading the renderer module from `references/glyphs/cicrus-glyphs.js`.
- **`references/starter.html`** — Copy-pasteable single-file starter with full dark+light token set, mode toggle, sample nav, and one worked screen.
- **`/colors_and_type.css`** (repo root) — Drop-in token sheet. Imports Google Fonts, defines all design tokens (colors, type, spacing, radii) and a `body.light` override for light mode. Pair with `cicrus.css` (the component sheet, which expects these tokens in scope).
- **`/cards/`** (repo root) — 16 single-topic preview cards, one per design subject (badges, buttons, inputs, color modes, type scale + philosophy, surfaces, status signals, state glyphs, timeline row, dot-matrix motif, brand wordmark, nav + mode toggle, spacing/radius). Visual quick-references when applying a specific token or component.
- **`/ui_kits/operator-console.html`** (repo root) — Comprehensive UI kit demonstrating most components on a single page.
- **`/Agent Chat.html`** and **`/Task Board.html`** (repo root) — Full-screen prototypes built from the system: an agent chat view with knowledge sidebar, and a task management board where clicking a card opens a right-side detail panel with backdrop.
- **`/Icarus Logo.html`** + **`/icarus-logos.jsx`** + **`/design-canvas.jsx`** (repo root) — Identity exploration for the Icarus project: a lowercase wordmark whose "i" dot is replaced by a perfectly round solar disc, plus a sun-on-horizon pictorial mark and an assortment of lockups, app icons, and a construction drawing. Rendered via React-from-Babel-standalone (`Icarus Logo.html` is the artboard surface, the two `.jsx` files are the component library and the `DesignCanvas` wrapper).
- **`/LMS Elements.html`** (repo root) — Worked example of Cicrus tokens applied to long-form course content: sticky topbar, three-column shell (TOC rail · prose · margin notes), sticky bottom progress, and every LMS content element in flowing context — lesson hero, callouts (Note · Tip · Warning · Example), definition list, figure with caption, data table, pull quote, numbered steps, do/don't comparison panel, code block with line numbers + copy, inline sparkline, worked example, lab block, reveal/spoiler. Reach for this when applying Cicrus to documentation, lessons, runbooks, or any text-heavy page.
