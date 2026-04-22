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

## 3. SERVICE DASHBOARD (Status view)

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

## 4. KNOWLEDGE INDEX (Knowledge view)

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

## 5. STATS GRID (Dashboard pattern)

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

## 6. EMPTY / ERROR / LOADING STATES

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

## 7. VIEW SWITCHING

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

## 8. COMPOSITION CHECKLIST

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
