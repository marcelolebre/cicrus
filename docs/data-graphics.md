# Data Graphics — Tufte applied to Cicrus

*Derived from Edward Tufte: *The Visual Display of Quantitative Information* (1983), *Envisioning Information* (1990), *Visual Explanations* (1997), and *Beautiful Evidence* (2006). The books are canonical; this document is their translation into Cicrus tokens, components, and code.*

Cicrus is already deeply Tufte-aligned: monochrome canvas, typography-first, "subtract don't add," structure as ornament. That alignment is not an accident — it's the same lineage. What was missing was an explicit data-graphics reference. This is it.

> **Shipped components.** The graphic types in §4 are real, plug-and-play classes in [`../src/dataviz.css`](../src/dataviz.css) (all `.c-*`): `.c-spark` (sparkline), `.c-sparkbar`, `.c-bars` (data bars), `.c-dotplot`, `.c-rangebar`, `.c-multiples` (small multiples), `.c-gauge`, `.c-delta`, `.c-metrics` (metric table). Per-instance values pass as unitless 0–100 custom properties via inline `style` (`--v`, `--lo`/`--hi`, `--ref`; the range bar's mid dot is opt-in via `.c-range--mid` + `--mid` — never defaulted, a fabricated median is a lie). Threshold/reference rules: `.c-bar--ref` (data bars) and `.c-dot--ref` (dot plots) draw a dashed rule at `--ref` — pair them with any threshold color so the state survives color-blindness; flagged sparkbar columns widen for the same reason. Catalogued in [`./components.md`](./components.md); live preview in [`../examples/previews/dataviz/`](../examples/previews/dataviz/).

> **Where this applies.** Any quantitative display: sparklines, dashboards, time series, tables of numbers, scatter plots, range bars, small multiples. Operator-console screens are 80% quantitative — read this before drawing anything with axes.

---

## 1. THE FIVE PRINCIPLES

Tufte's core in Cicrus voice:

### 1.1 Above all else, show the data
The data is the design. Anything that isn't data is suspect. Before drawing a frame, an axis, a gridline, or a legend — ask whether the data could carry the meaning on its own. Usually it can.

### 1.2 Maximize the data-ink ratio
**Data ink** is the non-erasable core of the graphic — the bars in a bar chart, the line in a line chart, the dots in a scatter. **Non-data ink** is everything else: gridlines, axis lines, tick marks, frames, legends, backgrounds.

Score every graphic by this ratio. If you can erase a pixel without losing information, erase it.

### 1.3 Erase non-data ink
- **No frames.** A graphic does not need a box around it. The data IS the boundary.
- **No filled grids.** A faint dot grid (the `.dot-grid-bg` utility) may help reading, but a heavy ruled grid competes with the data and is forbidden.
- **No background tint.** Plot area background = page background. Always.
- **No tick marks pointing inward AND outward.** One direction only, outward, only at labeled values.
- **No redundant axis lines.** If gridlines exist, axis lines repeat them.

### 1.4 Erase redundant data ink
Pie charts encode value three times: angle, arc length, area. Two of those are redundant. Bar charts encode value twice: length and area (bars of equal width). The length is sufficient.

When data ink itself is redundant, prefer the simpler encoding. **Length > area > angle > volume.** (Tufte, ranked.)

### 1.5 Revise and edit
A first-draft chart is always too loud. Pass through it three times:
1. Remove non-data ink (gridlines, frames, ticks, backgrounds).
2. Reduce data-ink redundancy (drop unnecessary encoding channels).
3. Tighten labels, units, alignment.

---

## 2. CHARTJUNK — THE FORBIDDEN

Per `SKILL.md` §3, Cicrus already bans gradients, sad-face illustrations, parallax, and skeleton loaders. To that list, for data graphics:

- **No 3D charts.** Ever. 3D bars distort length encoding by adding fake depth.
- **No moiré or hatching as fill.** Stripes, dots-as-fill, crosshatching for "texture" — visual noise per Tufte's diagnosis of chartjunk. Use solid fills with opacity steps instead (`100% / 60% / 30%`).
- **No "ducks."** A graphic shaped like its subject (a bar chart drawn as oil barrels). Inferior to neutral encoding.
- **No dual y-axes.** If two series belong on one chart, put them on the same scale or split into small multiples.
- **No pie charts.** Bar chart or dot plot for the same data. The only acceptable exception: a **single-arc gauge** showing one ratio (e.g., `78% utilized`) — and then only because the arc carries one channel, not many.
- **No legends inside the plot area.** Either label each series in-line where it lives, or omit the legend and rely on a caption.
- **No category color when opacity, weight, or pattern will do.** Color is a signal channel; spending it on "5 categories of equal importance" wastes it.
- **No truncated y-axes that exaggerate change.** Y-axes start at 0 for bar charts. Line charts may start anywhere if the lie factor (§5) is honest and labeled.

---

## 3. DATA-INK STRATEGY IN CICRUS

The Cicrus palette is already minimal. Use it like this:

| Role | Token | Use |
|------|-------|-----|
| **Plot data — primary series** | `--text-display` | The series the reader should focus on. |
| **Plot data — secondary / context** | `--text-disabled` | Comparison series, range, baseline. Quiet enough to recede. |
| **Reference rule** (median, target, zero) | `--border-visible`, 1px, dashed | A subtle horizontal/vertical rule the eye can find but doesn't fight. |
| **Annotation text** | `--text-secondary`, Space Mono 11px | In-plot callouts. Always typeset, never iconic. |
| **Status encoding** (over/under, alarm) | `--success`, `--warning`, `--accent` | When a value crosses a threshold. Not as decoration. |
| **Axis tick labels** | `--text-disabled`, Space Mono 10px | Always tabular-nums. ALL CAPS only for category labels, not numerals. |
| **Axis line** | None preferred. If absolutely needed: `--border` 1px. | Skip first. Add only when the chart genuinely loses meaning without it. |

**Color = signal.** Reserve the warning amber, success green, and accent red for **threshold crossings, alarms, deltas worth flagging.** Don't paint five categories five colors.

---

## 4. CORE DATA GRAPHIC TYPES

Each entry: what it is, when to use, the data-ink discipline, and the Cicrus implementation pattern.

### 4.1 Sparkline

A word-sized line chart — about the height of a line of body text. Tufte's most enduring contribution. Reads inline with prose or in dense tables.

**Use:** trends in tables; per-row history in lists; KPI cards under a single number.

**Discipline:**
- No axes, no gridlines, no labels (the surrounding context provides them).
- Last value optionally rendered as a dot, with its number to the right.
- Min/max may be dot-marked with `--accent` and `--success` if the *direction* is meaningful.
- Aspect ratio: roughly **4:1 to 5:1**. Height ≈ `1em` (~16px). Width = whatever fits.

**Implementation:** the `.c-spark` class wraps an inline `<svg>` with one `<polyline>`. No `<g>`, no `<defs>`. Mark the latest value with a `<circle>`; flag a max/min with `.c-spark-hi` / `.c-spark-lo`. Pair with its current number using `.c-spark-pair` + `.c-spark-now`.

```html
<span class="c-spark">
  <svg viewBox="0 0 100 24" preserveAspectRatio="none"
       aria-label="Trend: 12 → 18 over 30 days">
    <polyline points="0,18 6,16 12,15 ..." />
    <circle cx="100" cy="6" r="1.6" /><!-- latest value -->
  </svg>
</span>

<!-- inline with its number: 120 ▁▂▃▅▇ 132 -->
<span class="c-spark-pair">
  <span>120</span><span class="c-spark"><svg …>…</svg></span><span class="c-spark-now">132</span>
</span>
```

### 4.2 Sparkbar

The bar-chart sibling of a sparkline. Tiny vertical bars at body-text height. For categorical counts or short discrete histograms inline with text.

**Discipline:** no axes, no labels, no gaps that distort the visual count. Gap = 1px between bars. Bar fill = `currentColor`. Floor (baseline) = visual zero, not drawn.

### 4.3 Dot plot (preferred replacement for the bar chart)

A single dot per value on a horizontal scale. Tufte's recommended replacement for stubby bar charts when the categorical axis has many entries. Reads faster than bars because the eye locks on the dot, not the bar mass.

**Discipline:**
- Dot diameter 8px, fill `--text-display`.
- Category labels on the left, Space Mono at `--body-sm`.
- Each track carries a single faint baseline; add `.c-dot--ref` for a dashed vertical reference rule at a meaningful value (target, median, zero). The reference rule doubles as the color-blind-safe cue for threshold states — a flagged dot visibly sits past it.
- Sort by value, not alphabetically, unless category order has external meaning.

### 4.4 Range bar (range-frame)

For ranges (min/max, IQR, confidence interval): a thin horizontal bar from min to max, with a center dot at the median or mean. One channel, three values, zero decoration.

**Discipline:**
- Bar height: 3px. Center dot: 7px.
- Color: `--text-secondary` for the bar, `--text-display` for the dot.
- No whiskers. No caps. The dot is the center; the bar is the range.

### 4.5 Small multiples

A grid of small, identically-formatted charts — same axes, same scale, same encoding — varying only by one dimension (time, category, region). The reader's eye learns the format once and then scans differences across the grid at a glance.

**Discipline:**
- **Identical scales** across all panels. Never let a panel re-scale to its own data — comparison is destroyed.
- 3–8 columns. Below 3, use one larger chart. Above 8, consider whether 50 small panels read at all.
- Panel header: Space Mono at `--label-xs` ALL CAPS, the differing dimension only (year, region, team).
- No axes in inner panels; one axis on the leftmost and one on the bottom panel ("L-frame").
- Panel gap: `--space-md` (16px). No panel borders.

### 4.6 Slopegraph

Two parallel vertical scales with lines connecting matched values. Excellent for before/after comparisons across many categories.

**Discipline:**
- Two y-axes (start and end). No x-axis.
- Each category = one line + two endpoint labels.
- Use `--text-display` for lines whose slope tells the headline; `--text-disabled` for the rest.
- Label endpoints with the value AND category, right-aligned and left-aligned to the respective axis.

### 4.7 Range-frame scatter

A scatter plot in which the x and y axes are themselves range-frames: the axis line is drawn only across the range of observed data, not the full plot area. The frame *encodes* the marginal distribution.

**Discipline:**
- Point diameter 4–6px, `--text-primary`, opacity 0.8.
- Axis lines: 1px `--border-visible`, drawn only from min to max of that axis's data.
- Label only `min`, `median`, `max` on each axis. Tabular-nums.

### 4.8 Stem-and-leaf-style table

A table where the numbers themselves are the visualization. Right-aligned, tabular-nums, monospace. The shape of the digits forms the distribution.

**Discipline:** see `./components.md` for the KV row. Numbers in Space Mono, tabular-nums, right-aligned. No icons. No bars beside numbers (the number IS the bar; the digit count is its visual length).

### 4.9 Gauge (single arc)

The ONE acceptable circular chart. A single arc encoding one ratio (utilization, capacity, completion). Center holds the value as a Doto/Space Mono numeral.

**Discipline:**
- Arc thickness 5px. Track color `--border`. Fill `--text-display`, or status colour when threshold-crossing (pair it with the numeral — the number, not the hue, is the record).
- Center number: hero size. Unit (`%`, `GB/s`) at `--label-xs`, stacked beneath the numeral.
- No second arc. No nested gauges. If two ratios matter, use two gauges side by side, or a range bar.

---

## 5. LIE FACTOR

Every graphic encodes data into geometry. The **lie factor** is the ratio of `size of effect in graphic` to `size of effect in data`. Target: **1.0**. Tolerable: 0.95–1.05. Anything beyond = the graphic distorts.

Most common sources of lie:

| Cause | Effect | Cicrus rule |
|---|---|---|
| Truncated y-axis on a bar chart | Inflates change | Bar charts always start at 0. |
| Truncated y-axis on a line chart | May inflate or invert | Allowed only when zero would crush the signal; label the axis range explicitly. |
| Using area to encode 1D values | A 2× value drawn 2× wide AND 2× tall = 4× area | Always encode 1D values with 1D channels (length). |
| Mixing absolute and percent in the same chart | Reader can't tell which is which | Never. Two charts, or one with the other dimension labeled in plain text. |
| Multi-axis line chart with separate scales | Slope can be tuned arbitrarily | Forbidden (see §2). |

---

## 6. DATA DENSITY & RESOLUTION

Tufte: aim for **high data density** — many numbers per unit of screen real estate, made legible by good design.

Cicrus targets:
- A dashboard tile: 1–5 key numbers, each readable at a glance, plus a sparkline of recent history. Density = ~20 numbers + 30 data points across a single `.c-card`. The `.c-metrics` table (name · sparkline · now · delta) is the canonical dense tile.
- A small-multiples grid: 6–16 panels each with 30–100 points = 200–1600 data points on screen, all readable.
- A timeline or log: 30–60 rows visible, each row a small structured packet. Don't waste vertical space on row padding > 12px.

**Anti-pattern:** the "hero stat alone on a screen" trope. One number on a 1920×1080 surface is decorative, not informative. Pair every hero number with its context: trend, comparison, range, history.

---

## 7. LAYERING & SEPARATION

Tufte's later principle: layers should be visually distinguishable without color when possible.

In Cicrus this maps to **opacity steps** and **stroke weight**, not hue.

| Layer | Cicrus treatment |
|---|---|
| Foreground data | `currentColor` at 100%, stroke 1.2–1.6px |
| Secondary data | same color at 50–60% |
| Reference (zero, target, median) | `--border-visible` 1px **dashed** |
| Annotation | `--text-secondary` Space Mono 11px |
| Grid (if absolutely required) | `--border` 0.5px, opacity 0.4 |

**Rule:** if two layers cannot be distinguished by opacity + stroke alone, the chart has too many layers. Split it.

---

## 8. SMALL MULTIPLES OVER ANIMATION

Tufte argues strongly that **comparison through space (small multiples) is more powerful than comparison through time (animation).** A reader cannot hold a moving frame in memory; they CAN scan a grid of static frames.

Cicrus rule: when faced with a "time series with N categories," default to small multiples — N panels, identical scales, time on the x-axis. Resort to an animated single-frame display ONLY when the data is genuinely about motion in space (e.g., a live network map).

---

## 9. LABELING IN PLACE

Labels live where the data lives, not in a legend off to the side.

- **Line charts:** end-of-line labels. Series name flush against the last point. No legend box.
- **Bar charts:** value labels at the end of the bar (outside, right-aligned for horizontal bars; above for vertical). Categorical labels on the perpendicular axis.
- **Scatter plots:** label outliers in place. Don't label every point. Don't label none.
- **Maps & schematics:** see `./schematics.md`. Labels touch the thing they label; no leader lines if avoidable.

Tufte: *"Words and labels and pictures of words can fully utilize the powerful and content-rich method of communication used by the printed word."* Captions, footnotes, and inline labels are part of the graphic — design them with the same care as the data.

---

## 10. THE SIX PRINCIPLES OF ANALYTICAL DESIGN

From *Beautiful Evidence* — Tufte's most actionable framework, and it applies to any analytical display, not just charts. Walk all six in a critique; the lowest-scoring one is the biggest improvement opportunity.

1. **Show comparisons.** Every display answers “compared to what?” — a baseline, a target, a prior period, a peer. A number alone is not analysis. In Cicrus: pair every hero stat with a `.c-delta`, a `.c-spark`, or a reference rule.
2. **Show causality, mechanism, structure.** Move past description to the *why*. Annotate the mechanism on the data (see §14); pair a chart with the process diagram (`./schematics.md`) that explains it.
3. **Show multivariate data.** Real problems have more than one or two variables. Reducing to a single number hides interactions — prefer small multiples (`.c-multiples`) and dot plots that hold several dimensions at once.
4. **Integrate words, numbers, images, diagrams.** Don’t segregate by mode. Labels sit next to the data they describe (§9); units, sources, and annotations are part of the graphic, not a separate legend.
5. **Thoroughly describe the evidence.** Provenance, scales, sources, timestamps, authorship. Documentation is what earns trust. A `.c-view-meta` code string, a caption, a footnote — always say where the numbers came from.
6. **Content is paramount.** No amount of design rescues weak evidence. Quality, relevance, and integrity of the content decide whether the display stands. Design serves the data, never the reverse.

---

## 11. LAYERING & SEPARATION (1+1=3)

From *Envisioning Information*. Visually distinct elements can share the same space if they are *layered* — separated by value, weight, or transparency rather than by spatial isolation. Cicrus does this with opacity and stroke weight, not hue (see §7 for the layer table).

- **The 1+1=3 effect.** Two heavy lines next to each other create a phantom third line in the gap. Lighten one (drop to `--text-disabled`) to suppress the vibration. Any time two strong strokes sit adjacent — borders, bars, rules — watch for the ghost.
- **Whisper, don’t shout.** Grids, axes, and reference lines recede to `--border` at low opacity; the data stays at `--text-display`.
- **The squint test.** Squint at the graphic. The most important data should remain visible; chartjunk should disappear first. If a gridline survives the squint and the data doesn’t, the weights are inverted.

---

## 12. MICRO / MACRO READINGS

From *Envisioning Information*. A strong display tells **different stories at different viewing distances** — not a choice between overview and detail, but both at once.

- **Macro** (zoomed out, peripheral): overall pattern, shape, trend. Which rows are rising? Where is the cluster?
- **Micro** (close inspection): the individual value, label, exception. The exact number; the one outlier.

Canonical examples: a financial table with sparklines (macro = which rows trend up; micro = the actual values); the Vietnam Memorial (macro = the sweep of names; micro = one name). In Cicrus, the `.c-metrics` table is the everyday micro/macro object: scan the sparkline column for shape, read the `now` column for value. **Don’t choose between overview and detail — layer both.**

---

## 13. CONFECTIONS, PARALLELISM, NARRATIVE

From *Visual Explanations*.

- **Confections** — assemblages of disparate elements (data, map, text, diagram) into one explanatory composition. They work when *every* element serves the argument (Minard’s Napoleon march; Snow’s cholera map). On an operator console: a failure post-mortem that places the timeline, the metric that spiked, and the topology diagram in one frame.
- **Parallelism** — repeating visual structure to enable comparison. Small multiples are one form; it also means side-by-side before/after states and a consistent annotation style across panels. Identical structure is what lets the eye compare.
- **Narrative of space and time** — combine spatial and temporal dimensions in one frame (Minard encodes troop size, geography, direction, temperature, and time together). When a story is “what moved, where, and when,” resist splitting it across screens.

---

## 14. CAUSE AND EFFECT

From *Visual Explanations*. Causality is hard to show because it requires both the variables **and** the mechanism linking them.

- Show the intervention and the response **in the same frame**.
- Annotate the causal mechanism directly on the data — typeset, in place, not in a separate caption.
- Use sequence (small multiples through time) to imply mechanism.
- Pair the data display with a process diagram of the proposed cause.

**Worked example:** the Challenger O-ring decision. Plotted against temperature, the data showed catastrophic risk — but it was presented in a way that hid the causal relationship. The redesign makes the causality unavoidable. On a console, this is the difference between “latency spiked at 14:02” and a frame that shows the deploy marker, the latency line, and the rollback on one timeline.

---

## 15. CHECKLIST (USE BEFORE SHIPPING ANY CHART)

- [ ] Could the data be conveyed by a small, well-typeset table? If yes, prefer the table.
- [ ] Is there a frame around the plot area? Remove it.
- [ ] Are there gridlines? Remove or fade to `--border` 0.5px @ 0.4 opacity.
- [ ] Are there tick marks on unlabeled positions? Remove them.
- [ ] Is the y-axis truncated? If the chart is bars, fix it. If lines, label the range explicitly.
- [ ] Is the lie factor within 0.95–1.05?
- [ ] Are there ≥ 3 colors carrying categorical meaning? Reduce to one color + opacity steps, OR justify in a comment.
- [ ] Are series labels in-place rather than in a legend?
- [ ] Is the data density acceptable (≥ 5 distinct numbers per visible chart)?
- [ ] Does the chart **read** without its title? (It should — title is a caption, not a crutch.)
- [ ] In dark mode AND light mode — both rendered correctly?

**Extended test** (analytical design, §10–14):

- [ ] **Comparison:** does it answer “compared to what?” (baseline, target, prior, peer)
- [ ] **Causality:** is the mechanism visible, not just the pattern?
- [ ] **Multivariate:** are interactions shown, or has the problem been over-reduced to one number?
- [ ] **Integration:** are words, numbers, and images interleaved — not segregated into a legend?
- [ ] **Documentation:** can a stranger evaluate the evidence (sources, scales, timestamps)?
- [ ] **Layering:** does the primary data dominate and secondary recede? (squint test)
- [ ] **Micro/macro:** does it reward both a glance and a close read?

---

## 16. WHEN NOT TO MAKE A CHART

Some data is better as text. Use prose or a labeled table when:

- The data is **1–4 numbers**. Big numbers in Doto / Space Mono are more legible than any chart.
- The data is **a ranking with no proportional information** (top 5 fastest jobs). A list is sufficient.
- The data is **a single percentage that fits in a sentence.** Just say it: "98.7% uptime over the last 30 days."
- The reader needs **exact values, not patterns.** A table beats a chart every time for lookup.

A chart is for *pattern, trend, comparison, distribution, anomaly.* Anything else → text or table.

---

## 17. FURTHER READING

- Tufte, *The Visual Display of Quantitative Information* (1983) — the source.
- Tufte, *Envisioning Information* (1990) — layering, color, micro/macro readings.
- Tufte, *Beautiful Evidence* (2006) — sparklines defined; "presentations of evidence."

When in doubt, ask: would Tufte erase this? If yes, erase it.
