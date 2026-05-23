# Data Graphics — Tufte applied to Cicrus

*Adopted: 2026-05-23. Derived from Edward Tufte, *The Visual Display of Quantitative Information* (1983). The book is canonical; this document is its translation into Cicrus tokens, components, and code.*

Cicrus is already deeply Tufte-aligned: monochrome canvas, typography-first, "subtract don't add," structure as ornament. That alignment is not an accident — it's the same lineage. What was missing was an explicit data-graphics reference. This is it.

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
- **No filled grids.** A faint dot grid (per `--dot-grid-bg`) may help reading, but a heavy ruled grid competes with the data and is forbidden.
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

**Implementation:** inline `<svg>` with one `<polyline>`. No `<g>`, no `<defs>`.

```html
<svg class="cic-sparkline" viewBox="0 0 100 24" preserveAspectRatio="none"
     width="100" height="24" aria-label="Trend: 12 → 18 over 30 days">
  <polyline points="0,18 6,16 12,15 ..." fill="none"
            stroke="currentColor" stroke-width="1" />
  <!-- Optional end-dot at the latest value -->
  <circle cx="100" cy="6" r="1.6" fill="currentColor" />
</svg>
```

```css
.cic-sparkline {
  display: inline-block;
  vertical-align: middle;
  color: var(--text-primary);
  overflow: visible; /* let the end-dot extend past the box */
}
```

### 4.2 Sparkbar

The bar-chart sibling of a sparkline. Tiny vertical bars at body-text height. For categorical counts or short discrete histograms inline with text.

**Discipline:** no axes, no labels, no gaps that distort the visual count. Gap = 1px between bars. Bar fill = `currentColor`. Floor (baseline) = visual zero, not drawn.

### 4.3 Dot plot (preferred replacement for the bar chart)

A single dot per value on a horizontal scale. Tufte's recommended replacement for stubby bar charts when the categorical axis has many entries. Reads faster than bars because the eye locks on the dot, not the bar mass.

**Discipline:**
- Dot diameter 6–8px, fill `--text-primary`.
- Category labels on the left, Space Mono 12px right-aligned.
- A single dotted x-axis at the bottom OR a faint vertical reference rule at a meaningful value (target, median, zero) — never both.
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
- Panel header: Space Mono 11px ALL CAPS, the differing dimension only (year, region, team).
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

**Discipline:** see `references/components.md` for the KV row. Numbers in Space Mono, tabular-nums, right-aligned. No icons. No bars beside numbers (the number IS the bar; the digit count is its visual length).

### 4.9 Gauge (single arc)

The ONE acceptable circular chart. A single arc encoding one ratio (utilization, capacity, completion). Center holds the value as a Doto/Space Mono numeral.

**Discipline:**
- Arc thickness 4px. Track color `--border`. Fill `--text-display`, or status colour when threshold-crossing.
- Center number: hero size. Unit (`%`, `GB/s`) at `--label` size, baseline-aligned to the bottom of the numeral.
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
- A dashboard tile: 1–5 key numbers, each readable at a glance, plus a sparkline of recent history. Density = ~20 numbers + 30 data points across a single `tb-card`.
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
- **Maps & schematics:** see `references/schematics.md`. Labels touch the thing they label; no leader lines if avoidable.

Tufte: *"Words and labels and pictures of words can fully utilize the powerful and content-rich method of communication used by the printed word."* Captions, footnotes, and inline labels are part of the graphic — design them with the same care as the data.

---

## 10. CHECKLIST (USE BEFORE SHIPPING ANY CHART)

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

---

## 11. WHEN NOT TO MAKE A CHART

Some data is better as text. Use prose or a labeled table when:

- The data is **1–4 numbers**. Big numbers in Doto / Space Mono are more legible than any chart.
- The data is **a ranking with no proportional information** (top 5 fastest jobs). A list is sufficient.
- The data is **a single percentage that fits in a sentence.** Just say it: "98.7% uptime over the last 30 days."
- The reader needs **exact values, not patterns.** A table beats a chart every time for lookup.

A chart is for *pattern, trend, comparison, distribution, anomaly.* Anything else → text or table.

---

## 12. FURTHER READING

- Tufte, *The Visual Display of Quantitative Information* (1983) — the source.
- Tufte, *Envisioning Information* (1990) — layering, color, micro/macro readings.
- Tufte, *Beautiful Evidence* (2006) — sparklines defined; "presentations of evidence."

When in doubt, ask: would Tufte erase this? If yes, erase it.
