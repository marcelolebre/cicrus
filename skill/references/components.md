# Cicrus Design System — Components

Every component below is production-extracted from the Cicrus prototype. Specs include exact CSS where useful; use `references/tokens.md` for the token values they depend on.

---

## 1. NAVIGATION

Sticky top bar, 56px tall. Brand wordmark left, nav links center-left, mode toggle right.

```css
nav {
  display: flex;
  align-items: center;
  padding: 0 var(--space-xl);
  height: 56px;
  border-bottom: 1px solid var(--border);
  background: var(--black);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s ease-out, border-color 0.3s ease-out;
}

.brand {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 20px;
  letter-spacing: 0.04em;
  color: var(--text-display);
  margin-right: var(--space-2xl);
  text-transform: uppercase;
  user-select: none;
}

.nav-links { display: flex; gap: 0; height: 100%; flex: 1; }

.nav-link {
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  height: 100%;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-disabled);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease-out;
  cursor: pointer;
}
.nav-link:hover { color: var(--text-secondary); }
.nav-link.active {
  color: var(--text-display);
  border-bottom-color: var(--text-display);
}
```

**Rules:**
- Nav links are Space Mono ALL CAPS, 11px, 0.08em tracking.
- Default state uses `--text-disabled` (still reads at 4.6:1).
- Active state: text flips to `--text-display` + 2px underline.
- No icons in nav links. Text only.

---

## 2. MODE TOGGLE (DARK/LIGHT SWITCH)

Mechanical pill switch. Label reads the **current** mode, not the target.

```html
<div class="mode-toggle" id="mode-toggle">
  <span class="mode-toggle-label">DARK</span>
  <div class="mode-toggle-track">
    <div class="mode-toggle-thumb"></div>
  </div>
</div>
```

```css
.mode-toggle { display: flex; align-items: center; gap: var(--space-sm); margin-left: auto; cursor: pointer; }
.mode-toggle-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-disabled); }
.mode-toggle-track { width: 36px; height: 20px; border-radius: 999px; border: 1px solid var(--border-visible); position: relative; transition: border-color 0.2s ease-out; }
.mode-toggle-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--text-disabled); position: absolute; top: 2px; left: 2px; transition: transform 0.2s ease-out, background 0.2s ease-out; }
.light .mode-toggle-track { border-color: var(--text-primary); }
.light .mode-toggle-thumb { transform: translateX(16px); background: var(--text-primary); }
```

---

## 3. VIEW HEADER

Baseline-aligned title + meta on one row, 24px bottom margin.

```css
.view-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}
.view-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: var(--heading-weight);
  letter-spacing: var(--heading-ls);
  color: var(--text-display);
  line-height: 1.1;
}
.view-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-disabled);
  text-transform: uppercase;
}
```

Title uses Doto at 36px. Meta is a short code (`LR:37`) — no labels, no "Updated:" prefix. Density over clarity.

---

## 4. CARDS / SURFACES

Three card flavors, all with `border-radius: 8px` and `1px solid --border`. Padding `--space-md` (16px). **No shadows in dark mode; subtle `--card-shadow` allowed on light mode per theme.**

### Kanban column
- `background: var(--surface)` — the darker card flavor, fills the grid slot.
- `padding: var(--space-md)`, column layout with `gap: var(--space-sm)`.
- Header: `.col-header` row with `col-title` (Space Mono caps 11px, `--text-secondary`) + `col-count` (Space Mono 11px, `--text-disabled`), separated by 1px bottom border in `--border`.

### Task card
- `background: var(--surface-raised)` — slightly lighter, sits inside the kanban column.
- `padding: 12px var(--space-md)`.
- Hover: `border-color: var(--border-visible)`. No shadow change.
- `.task-card-title`: Space Grotesk 14px regular, `--text-primary`.
- `.task-card-desc`: Space Grotesk 13px **weight 300**, `--text-secondary`, line-height 1.5.
- `.task-card-tags`: flex-wrap, `gap: var(--space-xs)`.

### Service card (dashboard)
- `background: var(--surface)`.
- `.service-header`: flex row with `status-dot` + `service-name` (14px, weight 500, `--text-primary`).
- `.service-detail`: Space Mono 11px, `--text-disabled`, line-height 1.6. Use `<br>` for line breaks — multi-line but still label-y.

### Stat card
- `background: var(--surface)`, `padding: var(--space-md) var(--space-sm)`.
- `.stat-value`: Doto 36px, weight 400, letter-spacing -0.02em, `--text-display`. `.danger` modifier → `--accent`.
- `.stat-label`: Space Mono 10px ALL CAPS, `--text-disabled`, 0.08em tracking.
- Optional `.stat-bar` below value (see §12 Segmented Progress).

---

## 5. BUTTONS

| Variant | Background | Border | Text | Radius |
|---------|-----------|--------|------|--------|
| Primary | `--text-display` | none | `--black` | 999px (pill) |
| Secondary | transparent | `1px solid --border-visible` | `--text-primary` | 999px |
| Ghost | transparent | none | `--text-secondary` | 0 |
| Destructive | transparent | `1px solid --accent` | `--accent` | 999px |

All buttons: Space Mono, 13px, ALL CAPS, letter-spacing 0.06em, padding `12px 24px`. Min height 44px.

### Filter button (toolbar, with chevron)

```css
.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 8px 16px;
  border: 1px solid var(--border-visible);
  border-radius: 999px;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.2s ease-out;
}
.filter-btn:hover { border-color: var(--text-secondary); color: var(--text-primary); }
.filter-btn svg { width: 10px; height: 10px; opacity: 0.5; }
```

---

## 6. INPUTS

Underline style preferred. No border box.

```css
.task-search, .knowledge-search {
  flex: 1;
  max-width: 260px;
  padding: 8px 0;
  border: none;
  border-bottom: 1px solid var(--border-visible);
  font-size: 14px;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: transparent;
  outline: none;
  transition: border-color 0.2s ease-out;
}
.task-search::placeholder {
  color: var(--text-disabled);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.task-search:focus { border-color: var(--text-primary); }
```

- Placeholder is Space Mono ALL CAPS — it reads as a label, not helper text.
- Focus: underline promotes to `--text-primary`.
- Error: underline → `--accent`, message below in `--accent`.

---

## 7. BADGES / CHIPS

Border-only pill. Color encodes **category**, not state.

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid var(--border-visible);
  color: var(--text-secondary);
  background: transparent;
}
.badge-process   { color: var(--text-primary);   border-color: var(--text-secondary); }
.badge-resource  { color: var(--interactive);    border-color: rgba(91,155,246,0.3); }
.badge-monitor   { color: var(--warning);        border-color: rgba(212,168,67,0.3); }
.badge-system    { color: var(--text-disabled);  border-color: var(--border-visible); }
.badge-recurring { color: var(--text-disabled);  border-color: var(--border); }
.badge-steps     { color: var(--success);        border-color: rgba(74,158,92,0.3); }
.badge-type      { color: var(--text-secondary); border-color: var(--border-visible); }
```

**Mixing:** A task card can carry multiple badges (e.g. `SESSION_RESOURCE` + `RECURRING`). Category badge first, meta badges after. Max 3 per card.

---

## 8. STATUS DOT

Signal light, 8×8, absolute color. Animates when down.

```css
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot.up   { background: var(--success); }
.status-dot.down { background: var(--accent); animation: pulse-dot 2s infinite; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
```

**Never** use checkmark ✓ / cross ✗ icons. The dot IS the status.

---

## 9. ALERT BANNER

Single-row inline alert. Bordered, subtle-tinted background, icon + text on one line.

```html
<div class="alert-banner">
  <svg class="alert-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
    <path d="M8 2L14.5 14H1.5L8 2z"/>
    <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
    <line x1="8" y1="6.5" x2="8" y2="9.5"/>
  </svg>
  [ERROR] 2 ISSUES DETECTED: OPENCLAW GATEWAY DOWN · OLLAMA DOWN
</div>
```

```css
.alert-banner {
  display: flex; align-items: center; gap: var(--space-sm);
  padding: 12px var(--space-md);
  border-radius: 4px;
  border: 1px solid var(--accent);
  background: var(--accent-subtle);
  margin-bottom: var(--space-xl);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 0.02em;
}
.alert-icon { width: 16px; height: 16px; flex-shrink: 0; }
```

- Prefix with `[ERROR]`, `[WARN]`, `[INFO]` in brackets. Never `"Error:"`.
- Separator: middle dot `·` with spaces, not comma.
- Border radius is **4px** (technical surface), not 8px.

---

## 10. TIMELINE ITEM

Three-column grid: time, badges, content. Full-width divider between rows, reverse-padding hover.

```css
.timeline-item {
  display: grid;
  grid-template-columns: 160px auto 1fr;
  gap: var(--space-md);
  align-items: baseline;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease-out;
}
.timeline-item:hover {
  background: var(--surface);
  margin: 0 calc(-1 * var(--space-md));
  padding-left: var(--space-md);
  padding-right: var(--space-md);
}
.timeline-time { font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); white-space: nowrap; }
.timeline-badges { display: flex; gap: var(--space-xs); align-items: center; }
.timeline-content { display: flex; flex-direction: column; gap: 2px; }
.timeline-text { font-family: var(--font-body); font-size: 14px; color: var(--text-primary); }
.timeline-sub { font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); letter-spacing: 0.04em; text-transform: uppercase; }
```

- Time format: `YYYY-MM-DD HH:MM:SS` — full ISO, not "2 minutes ago."
- Sub is Space Mono caps, small — context like `Session Process`.

---

## 11. KNOWLEDGE COLUMN

Three-column index. Column title + subtitle + item list.

```css
.knowledge-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2xl); }
.knowledge-col-title {
  font-family: var(--font-mono); font-size: 11px; font-weight: 400;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-secondary);
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-visible);
}
.knowledge-col-sub {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text-disabled);
  margin-bottom: var(--space-md);
  text-transform: uppercase; letter-spacing: 0.08em;
}
.knowledge-item {
  display: block;
  padding: 8px 0;
  font-family: var(--font-mono); font-size: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 1px solid var(--border);
  transition: color 0.15s ease-out;
  cursor: pointer;
}
.knowledge-item:hover { color: var(--text-display); }
```

- Items are kebab-case slugs (`gateway-scale-socket-loop`). No bullets, no numbering.
- Hover promotes color straight to `--text-display` (skip intermediate).

### Knowledge stats row

`display: flex; gap: var(--space-2xl);` with per-stat `<div><span>417</span> PAGES</div>`.

```css
.knowledge-stats > div { font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); text-transform: uppercase; letter-spacing: 0.08em; }
.knowledge-stats span {
  font-family: var(--font-display); font-weight: 400;
  color: var(--text-display);
  font-size: 36px; letter-spacing: -0.02em;
  display: block; line-height: 1.1; margin-bottom: var(--space-xs);
}
```

---

## 12. SEGMENTED PROGRESS BAR

Discrete rectangular segments with 2px gaps — mechanical, instrument-like.

```css
.stat-bar { display: flex; gap: 2px; margin-top: var(--space-sm); height: 4px; }
.stat-bar .seg          { flex: 1; background: var(--border); }
.stat-bar .seg.filled   { background: var(--text-display); }
.stat-bar .seg.danger   { background: var(--accent); }
.stat-bar .seg.success  { background: var(--success); }
```

- Square ends, no radius.
- Neutral fill = `--text-display`. Status fill swaps to `--accent` / `--success` / `--warning`.
- Overflow: filled segments continue past "full" mark in status color (red = over limit).
- Sizes: hero 16–20px, standard 8–12px, compact 4–6px height.
- **Always pair** with a numeric readout. Bar = proportion, number = precision.

---

## 13. FAILURE ITEM (STATUS VIEW)

Row pattern for listing recent failures inline.

```css
.failure-item { padding: 14px 0; border-bottom: 1px solid var(--border); }
.failure-title { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: var(--space-xs); }
.failure-detail { font-family: var(--font-mono); font-size: 11px; color: var(--accent); line-height: 1.6; word-break: break-all; }
```

- Title = Space Grotesk medium. Detail = Space Mono in `--accent` (red), allowed to break-all for long error strings / URLs.

---

## 14. SECTION TITLE

Compact label above any content section.

```css
.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}
```

`SERVICES`, `RECENT FAILURES`, `ACTIVE SESSIONS` — plain ALL CAPS string, no dividers, no prefix.

---

## 15. FLOATING THEME BAR (optional)

Bottom-center floating pill with numbered variant switchers. Useful for multi-theme prototypes.

```css
.theme-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 4px; padding: 4px;
  background: var(--surface);
  border: 1px solid var(--border-visible);
  border-radius: 999px;
  z-index: 1000;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.theme-bar-btn {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  font-family: var(--font-mono); font-size: 12px;
  background: transparent; color: var(--text-disabled);
  cursor: pointer; transition: all 0.2s ease-out;
  display: flex; align-items: center; justify-content: center;
}
.theme-bar-btn:hover:not(.active):not(:disabled) { color: var(--text-primary); }
.theme-bar-btn.active { background: var(--text-display); color: var(--black); }
.theme-bar-btn:disabled { opacity: 0.2; cursor: default; }
```

Keep it to ≤ 5 buttons. Numbered, not named.

---

## 16. SCROLLBAR

Thin, unobtrusive. Match border color.

```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-visible); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-disabled); }
```

---

## 17. TOGGLES / SWITCHES

Same visual language as mode toggle. Pill track, circle thumb. 36×20 track, 14×14 thumb.

| State | Track | Thumb |
|-------|-------|-------|
| Off | `1px solid --border-visible`, transparent fill | `--text-disabled` |
| On | `1px solid --text-primary`, transparent fill | `--text-primary` |

Min touch target 44px (add transparent padding).

---

## 18. SEGMENTED CONTROL

- Container: `1px solid --border-visible`, 8px rounded or pill.
- Active: `--text-display` bg, `--black` text (inverted). Inactive: transparent, `--text-secondary`.
- Text: Space Mono ALL CAPS, 11px. Height 36–44px.
- Max 2–4 segments.

---

## 19. OVERLAYS & LAYERING

- **Modals:** Backdrop `rgba(0,0,0,0.8)`, dialog `--surface` + `1px solid --border-visible` + 8–16px radius, centered, max 480px. Close button `[ X ]` top-right, ghost style.
- **Bottom sheets:** `--surface`, 2px handle bar centered, 16px top radius, drag-to-dismiss.
- **Dropdowns:** `--surface-raised`, `1px solid --border-visible`, 8px radius, 44px items. Selected = left 2px `--accent` indicator. No shadow.
- **Toasts:** Not used. Replace with inline `[SAVED]` / `[ERROR: ...]` status in Space Mono near the trigger.

---

## 20. STATE PATTERNS

- **Error:** Input underline → `--accent`, message below in `--accent`. Form-level summary = alert banner (§9).
- **Empty:** Centered, 96px+ padding. Headline `--text-secondary`, one sentence description `--text-disabled`. Optional dot-matrix illustration. Never mascots.
- **Loading:** `[LOADING...]` bracket text in Space Mono, or segmented progress bar + percentage. No skeletons.
- **Disabled:** Opacity 0.4 or swap to `--text-disabled`. Borders fade to `--border`.
