# Cicrus Design System — Screen Patterns

Screen-level compositions observed in the prototype. These are the "blueprints" — each combines components from `components.md` into a coherent view. Use them as starting points; don't invent new layouts unless none fits.

---

## 1. KANBAN BOARD (Tasks view)

**Purpose:** Workflow with discrete states and moving cards.

### Structure

```
┌─ View Header ────────────────────────────────────┐
│  Tasks                                 LR:37     │
├─ Toolbar (horizontal row) ──────────────────────┤
│  [ ALL TASKS v ]  [ ALL ASSIGNEES v ]  ___search│
├─ Kanban Grid (4 columns) ───────────────────────┤
│  ┌ TODO ┐ ┌ IN PROGRESS ┐ ┌ REVIEW ┐ ┌ DONE ┐ │
│  │ col  │ │ col         │ │ col    │ │ col  │ │
│  │ card │ │ card        │ │ card   │ │ card │ │
│  │      │ │ card        │ │ card   │ │ card │ │
│  │      │ │ ...         │ │ ...    │ │ ...  │ │
│  └──────┘ └─────────────┘ └────────┘ └──────┘ │
└──────────────────────────────────────────────────┘
```

### Rules

- Exactly **4 columns** — TODO, IN PROGRESS, REVIEW, DONE. Don't split further. If you need more states, use a different pattern.
- Column titles ALL CAPS Space Mono 11px, 0.08em. Count right-aligned, `--text-disabled`.
- Column bg: `--surface`. Card bg: `--surface-raised`. One level of elevation contrast between them.
- Cards in a column: either **title-led** (with badges) **or** description-led (no title, just prose). Don't mix card types within one column arbitrarily — IN PROGRESS and DONE use title-led; REVIEW uses description-led (investigation prompts).
- Toolbar: 2 filter buttons + 1 search input. Left-aligned. Search max-width 260px — it's a filter, not a feature.
- Stagger fade-in by column: `0.03s / 0.08s / 0.13s / 0.18s` delays.

---

## 2. TIMELINE FEED (Timeline view)

**Purpose:** Chronological event log. High-density rows with consistent grid.

### Structure

```
┌─ View Header ──────────────────────────────┐
│  Timeline                          LR:58   │
├─ Timeline list (rows with 3-col grid) ────┤
│  2025-04-07 11:40:30  [STATUS]  Task #2079: running → in_progress │
│                       [DKR]     Make Monitor                       │
│  ─────────────────────────────────────────────────────────────── │
│  2025-04-07 11:40:30  [STATUS]  Task #2080: running → in_progress │
│                       [DKR]     Session Process                    │
│  ...                                                               │
└────────────────────────────────────────────┘
```

### Rules

- Grid: `160px auto 1fr`. Time column is fixed — prevents visual jitter as data varies.
- Time format: full ISO (`YYYY-MM-DD HH:MM:SS`). **No** relative times ("2 min ago").
- Badge column groups 1–2 badges. First = event type (`STATUS_CHANGE`), second = source tag (`DKR`, optional).
- Content column: primary text (Space Grotesk 14px, `--text-primary`) on top, sub-label (Space Mono 11px caps, `--text-disabled`) below with 2px gap.
- Arrow character is Unicode `→` (`→`), not `->`.
- Full-width 1px `--border` between rows. Hover reverses padding so the full-width bg extends to the edges of the view.

---

## 3. AGENT TIMELINE

**Purpose:** HUD-style chronological feed of system events anchored on `now`. Use for scheduler runs, automation logs, build pipelines, monitoring streams — places where multiple events cluster within a single minute and the present moment is the focal point.

Distinct from §2 Timeline Feed: that pattern is a flat ISO-timestamped event log with badges and source tags. This one strips to time + colored dot + agent name + result, anchored on a NOW marker with sub-minute clustering. Reads as a HUD readout, not a calendar agenda.

### When to use

- Reverse-chronological feed where multiple events share a minute
- Events have a status (success / info / error) and a short result string
- The `now` moment should anchor the view

### When NOT to use

- Events carry rich content → use task cards
- Fewer than 4–5 events → a plain list is enough
- Conversational user actions → use chat patterns

### Structure

```
17:32  ◯  now            ← ringed marker, pulsing radar ring
       │
14:50  ●── AgentName     result detail
       ●── AgentName     result detail
       ●── AgentName     result detail   +22s
       │
14:49  ●── AgentName     result detail
       │
       ▾                 ← tail arrow, "history continues"
```

### Layout

- 3-column grid: time `60px` right-aligned · rail `32px` centered · content `1fr`
- Monospace throughout (`var(--font-mono)`)
- Row min-height **26px**; body **13px**; time **11px** with **0.05em** letter-spacing
- A 1px vertical spine runs down the center of the rail column for the full content height
- Each event sits on the spine as a **7px** filled dot
- An **18px** horizontal tick extends from the dot into the content area (visual "branch")
- Time labels appear only on the **first event of each minute group**. Subsequent rows in the same minute keep their time cell with `visibility: hidden` so the column width and spine stay continuous

### NOW marker

- Hollow 9px circle: 1px border in `--success`, fill set to the host page background (`--black`) so it punches through the spine cleanly
- Pulsing overlay ring scales `0.9× → 2.2×`, opacity `0.9 → 0`, `2.2s` ease-out infinite — the radar ping
- Time displayed to the left at **17px / weight 500** (heavier than row times); lowercase `now` label to the right at **11px** with **0.22em** letter-spacing in `--text-disabled`
- The spine begins at the marker's vertical center and descends — it does **not** pass through the marker
- The NOW segment of the spine (between the marker and the first event below it) uses `--border-visible` instead of `--border`, so the "live" segment reads slightly stronger than the historical spine

### Event rows

Dot color encodes type:

| Event type                | Dot              |
|---------------------------|------------------|
| Success / completed run   | `--success`      |
| Audit / health / info     | `--interactive`  |
| Error                     | `--accent`       |

- Empty results render as a single muted word (`idle`) in `--text-disabled`. Never `"0 created, 0 errors"` noise.
- Sub-minute offsets shown as `+22s` suffix in `--text-disabled`, **only when non-zero**
- Two weights only: agent name **500** in `--text-primary`, result detail **400** in `--text-secondary`

### Tail

- Spine ends in a CSS triangle (4×5 px, `--text-disabled` border color)
- Spine stops 5px short of the tip so the line meets the arrowhead cleanly

### Strip ruthlessly

- No repeated date on every row
- No source tag (e.g. `scheduler`) when every row shares it
- No double prefixes (`EmailResponder: EmailResponder: …`) — name appears once
- No paired emoji + status pill — the colored dot is the only status signal
- Place the timeline on the page background, not inside a `--surface` card. If you must put it in a card, change the NOW marker fill from `var(--black)` to whatever the card background is (`--surface` / `--surface-raised`), or the marker won't punch through cleanly

### CSS skeleton

```css
.agent-timeline {
  display: grid;
  grid-template-columns: 60px 32px 1fr;
  font-family: var(--font-mono);
}
.atl-row { display: contents; }
.atl-row > .atl-time,
.atl-row > .atl-rail,
.atl-row > .atl-content {
  min-height: 26px;
  display: flex;
  align-items: center;
}

.atl-time {
  justify-content: flex-end;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--text-disabled);
  padding-right: var(--space-sm);
}
.atl-time.is-hidden { visibility: hidden; }

.atl-rail { position: relative; justify-content: center; }
.atl-rail::before {
  content: "";
  position: absolute;
  top: 0; bottom: 0; left: 50%;
  width: 1px;
  background: var(--border);
  transform: translateX(-0.5px);
}

.atl-dot {
  width: 7px; height: 7px; border-radius: 50%;
  position: relative; z-index: 1;
}
.atl-dot.success { background: var(--success); }
.atl-dot.info    { background: var(--interactive); }
.atl-dot.error   { background: var(--accent); }
.atl-dot::after {
  content: "";
  position: absolute;
  left: 100%; top: 50%;
  width: 18px; height: 1px;
  background: var(--border);
  transform: translateY(-0.5px);
}

.atl-content {
  font-size: 13px;
  gap: var(--space-sm);
  padding-left: var(--space-sm);
}
.atl-name   { color: var(--text-primary);   font-weight: 500; }
.atl-detail { color: var(--text-secondary); font-weight: 400; }
.atl-detail.muted { color: var(--text-disabled); }
.atl-offset { color: var(--text-disabled); margin-left: var(--space-xs); }

/* ── NOW marker ── */
.atl-row.is-now > .atl-time {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-primary);
}
.atl-row.is-now > .atl-rail::before {
  /* spine begins at marker center and descends, in stronger weight */
  top: 50%;
  background: var(--border-visible);
}
.atl-now-marker {
  width: 9px; height: 9px; border-radius: 50%;
  border: 1px solid var(--success);
  background: var(--black);
  position: relative; z-index: 2;
}
.atl-now-marker::after {
  content: "";
  position: absolute; inset: -1px;
  border-radius: 50%;
  border: 1px solid var(--success);
  animation: atl-pulse 2.2s ease-out infinite;
  transform-origin: center;
}
.atl-now-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: lowercase;
  color: var(--text-disabled);
}
@keyframes atl-pulse {
  from { transform: scale(0.9); opacity: 0.9; }
  to   { transform: scale(2.2); opacity: 0; }
}

/* ── Tail ── */
.atl-row.is-tail > .atl-rail { min-height: 24px; }
.atl-row.is-tail > .atl-rail::before {
  top: 0;
  bottom: 10px; /* stops 5px short of the 5px-tall arrow tip */
}
.atl-row.is-tail > .atl-rail::after {
  content: "";
  position: absolute;
  bottom: 0; left: 50%;
  width: 0; height: 0;
  border-left:  4px solid transparent;
  border-right: 4px solid transparent;
  border-top:   5px solid var(--text-disabled);
  transform: translateX(-50%);
}
```

### Anti-patterns (specific to this layout)

- Don't draw the spine **through** the NOW marker — the marker is the anchor; the spine descends from it.
- Don't render second-level precision on every timestamp. Minute granularity + sub-minute `+Ns` offset is the whole point.
- Don't replace the colored dot with an icon (`✓`, `⚠`) or a status pill — the dot **is** the status.
- Don't show repeated timestamps; group by minute and hide the duplicates' time cells with `visibility: hidden` (preserving column width — no layout shift).
- Don't animate the dots themselves. Only the NOW marker's overlay ring pulses. Other rows are still — the spine and ticks do all the work.

---

## 4. SERVICE DASHBOARD (Status view)

**Purpose:** Live infrastructure health. Banner + grid of service cards + failures list.

### Structure

```
┌─ View Header ──────────────────────────────────────┐
│  Status                                  LR:58     │
├─ Alert Banner (if errors) ─────────────────────────┤
│  ⚠  [ERROR] 2 ISSUES DETECTED: SVC_A DOWN · SVC_B  │
├─ SERVICES section ─────────────────────────────────┤
│  ┌ ● Svc A  ┐ ┌ ● Svc B ┐ ┌ ● Svc C ┐ ┌ ● Svc D ┐ │
│  │ details  │ │ details │ │ details │ │ details │ │
│  └──────────┘ └─────────┘ └─────────┘ └─────────┘ │
├─ RECENT FAILURES section ──────────────────────────┤
│  Title of failure #1                               │
│  error_message_in_space_mono_red                   │
│  ──────────────────────────────────────────────── │
│  Title of failure #2                               │
│  ...                                               │
└────────────────────────────────────────────────────┘
```

### Rules

- Banner appears only when `failures > 0`. Never leave it as a decorative permanent banner.
- Services grid is 4 columns regardless of count (pad with empty slots if < 4, never 3-wide).
- Each card leads with status dot + name on one row, then 3-line detail block in Space Mono 11px `--text-disabled`.
- `status-dot.down` pulses. `status-dot.up` is static. No `.warn` variant — use up or down.
- Failures list uses `failure-item` pattern (§13 in components). Detail text is `--accent` (red) — errors **are** the accent moment on this page.
- `.section-title` (`SERVICES`, `RECENT FAILURES`) separates blocks. `--space-2xl` gap between major sections.

---

## 5. KNOWLEDGE INDEX (Knowledge view)

**Purpose:** Browse a large tagged corpus. 3-column index with filter.

### Structure

```
┌─ View Header ─────────────────────────────────────┐
│  Knowledge                                        │
├─ Stats row ───────────────────────────────────────┤
│  417 PAGES    258 ENTITIES    139 CONCEPTS   88 DECISIONS │
├─ Filter input ────────────────────────────────────┤
│  FILTER PAGES...  (Space Mono placeholder)        │
├─ 3-column index ──────────────────────────────────┤
│  CONCEPTS         DECISIONS         ENTITIES       │
│  LISTING          LISTING           LISTING        │
│  ─────────        ─────────         ─────────      │
│  item-slug-a      decision-alpha    entity-foo     │
│  item-slug-b      decision-beta     entity-bar     │
│  ...              ...               ...            │
└───────────────────────────────────────────────────┘
```

### Rules

- Stats row before filter: big number (Doto 36px) over tiny caps label. No `#` prefix on numbers. No commas in 4-digit numbers below 10k.
- Column title bordered below with `--border-visible`. Subtitle ("LISTING") one row under, smaller, `--text-disabled`.
- Every item on its own row with a `--border` bottom divider. Padding 8px vertical — tight, scannable.
- Filter matches **item text case-insensitively**, hiding non-matches with `display: none`. No animation on filter — instant.
- **No counts** inside items. The stats row at the top is the only quantification.

---

## 6. STATS GRID (Dashboard pattern)

**Purpose:** 4–6 headline metrics at the top of a dashboard.

### Structure

```
┌ 37 ┐ ┌ 4 ┐ ┌ 11 ┐ ┌ 2 ┐ ┌ 58 ┐ ┌ 3 ┐
│ TO │ │ RE │ │ DO │ │ FAIL │ │ LR │ │ WARN│
│ DO │ │VIEW│ │ NE │ │  (red)│ │    │ │     │
└────┘ └────┘ └────┘ └──────┘ └────┘ └─────┘
```

### Rules

- Use **6 columns** when dense, 4 when headline-y. Never 5 — it reads lopsided.
- Each card: Doto 36px number on top, 10px ALL CAPS label below. Optional `.stat-bar` under the label.
- **One card at most** uses the `.danger` variant (red number). Breaking the rule is the design (see §2.6).
- No trend arrows unless there's an explicit previous-period comparison — otherwise they're decoration.

---

## 7. EMPTY / ERROR / LOADING STATES

### Empty state

Centered block, 96px+ vertical padding.

```html
<div class="empty-state">
  <h2>No tasks yet</h2>
  <p>Create one with the toolbar above.</p>
</div>
```

- `h2`: Space Grotesk 18px weight 300, `--text-secondary`.
- `p`: Space Mono 11px ALL CAPS, `--text-disabled`.
- **No illustrations.** Optional dot-matrix grid background if screen feels barren.

### Error state (full page)

Use alert banner (§9 components) at top + inline description. Never full-screen error modal.

### Loading state

```
[ LOADING... ]
```

Space Mono ALL CAPS with brackets, in `--text-secondary`. Or a segmented progress bar with percentage adjacent — no infinite spinners, no skeletons.

### Not-implemented state

```
[NOT YET IMPLEMENTED]
```

Space Mono ALL CAPS, `--text-disabled`, 12px, 48px top padding. The prototype uses this for stub views — keep it brutalist, don't hide behind "coming soon."

---

## 8. VIEW SWITCHING

Views are siblings, one `.view.active` at a time. Transition = `fadeIn 0.25s` on class add. Navigation = nav links that toggle `active` and the corresponding view.

```js
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.view;
    navLinks.forEach(l => l.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});
```

**Rules:**
- URL sync optional but recommended (`#tasks`, `#timeline`).
- Never cross-fade (both visible simultaneously) — it feels like a web transition, not an instrument panel.
- Back/forward nav is just another view switch — no special treatment.

---

## 9. COMPOSITION CHECKLIST

Before shipping any screen, verify:

- [ ] Three layers of hierarchy (primary / secondary / tertiary)
- [ ] Exactly one "break the pattern" moment
- [ ] Every text color clears WCAG AA on its background
- [ ] No more than 2 font families, 3 sizes, 2 weights visible
- [ ] No shadow in dark mode; shadows subtle if any in light mode
- [ ] All labels are Space Mono ALL CAPS with ≥ 0.06em tracking
- [ ] Meta/time data is full-format, not relative ("2 min ago")
- [ ] Badge count on any element ≤ 3
- [ ] One accent red element at most, or zero if nothing is urgent
- [ ] Spacing scale respected — no arbitrary px values
- [ ] 8px card radius, 999px pill radius, 4px technical radius — no others
