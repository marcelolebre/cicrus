# Changelog

All notable changes to Cicrus are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com); versioning is
[Semantic Versioning](https://semver.org).

## [2.9.0] — 2026-06-12

Open-source quality pass: four adversarial design reviews (foundations, components,
data/motion layers, liquid mode, glyphs) executed and every finding fixed. Non-breaking
except where noted.

### Fixed — accessibility
- **Every text token now clears WCAG AA in every mode** (computed, not asserted):
  light mode gains `--success #2E7D32` / `--warning #8F6A00` overrides (it silently
  inherited dark values failing at 3.0:1 / 2.0:1); light `--interactive` deepens to
  `#0058CC` (5.9:1); light `--text-disabled` to `#6B6B6B`; liquid disabled alpha to
  0.50. Dark `--accent` brightens to `#F0353D` (4.5:1+ as text on black and `#111` —
  the same legibility move liquid makes); light keeps brand `#D71921`.
- The `:focus-visible` ring is no longer suppressed anywhere: `outline: none/0`
  removed from inputs; pills that clip the offset ring (`.c-mode`,
  `.doc-mode-switch`, `.doc-reveal-toggle`) draw it inset; liquid backs the 1px ring
  with a dark halo for light-desktop native contexts.
- `.c-btn` touch target raised to 44px (docs claimed it; code shipped 40px).
- Threshold states are no longer color-alone (WCAG 1.4.1): flagged sparkbar columns
  widen, `.c-bar--ref` (new) / `.c-dot--ref` draw dashed reference rules the flagged
  value visibly crosses, and the docs mandate the pairing.
- State glyphs: broken sun tracks the mode's `--accent` (deep red on paper, bright on
  dark/glass — `#FF5C5C` washed out at 2.5:1 on light); the no-`color` fallback no
  longer inverts on default white pages; unknown states warn instead of silently
  rendering healthy.

### Fixed — correctness
- `.c-item.is-open` actually reveals its detail list (the open-state `display` rule
  was missing — the expandable drawer was dead in pure CSS).
- `tokens.json` liquid values were stale v2.4 dark-smoked specs; reconciled to the
  shipped v2.8 milky-film values, with per-mode contrast figures that are now true.
- `examples/dashboard.html` and the brand-logo card consumed pre-2.8 glass tokens
  (`--glass-blur-chrome/-panel/-support`, `--glass-support-fill`) that no longer
  resolve — liquid rendered with zero blur on the flagship demo. Pointed at the
  consolidated tokens.
- Liquid: opaque `--black` children inside glass panes (`.c-stat`, `.c-panel-foot`,
  `.doc-quiz-opt`, `.doc-lab-input`) no longer occlude the material; `.doc-top` /
  `.doc-progress` join the chrome tier; alert/running variant borders are re-stated
  so semantic state survives the material; nesting no-double-blur is now structural
  (`:is()` lists) instead of an incomplete enumeration; `.c-view`'s opacity entrance
  is disabled in liquid (Chromium un-frosts every pane while an ancestor animates).
- `.c-bar--ref` (the data-bars reference rule) was a documented stub that rendered nothing — implemented.
- Dataviz demo told the truth badly: "sorted" dot plot was unsorted with a mislabeled
  median; "identical scale" small multiples mixed three units. Both now honest, and
  every shipped component/variant is demonstrated (spark-pair included).

### Changed
- **Motion discipline completed**: all transitions tokenized to
  `var(--dur-micro/-switch/-view/-data)` + `var(--ease)` (15 transitions were riding
  the UA default curve); new `--dur-data` 600ms token for data sweeps; `.c-view`
  entrance gated behind `prefers-reduced-motion: no-preference`; kill-switch zeroes
  delays; the caret glyph survives reduced motion (only its blink is gated);
  `@property --v` is `inherits: false` (per-element runtime data, matching `--p`).
- **Type scale enforced**: ~120 literal `font-size`/`letter-spacing` declarations
  across the component layers now reference the scale tokens.
- **Mode-aware tints**: the dark-tuned rgba literals in badges, alerts, item actions,
  and the running glow are now `color-mix()` over tokens, so they re-theme in light
  and liquid.
- `.doc-reveal` swaps the capped `max-height` hack for an accurate-height
  `grid-template-rows: 0fr → 1fr` disclosure (documented as a sanctioned
  non-compositor exception).
- ITCSS hygiene: body element styles moved to `base.css`; `.t-*` type classes and the
  dot-grid motif moved to `utilities.css` (tokens.css emits no selectors); `liquid.css`
  imports after `content.css` (it themes that layer); shadows tokenized onto cards
  (`--card-shadow` / `--hover-shadow` were defined but never applied).
- `.c-stats` gains responsive breakpoints (3 cols @900px, 2 @600px); `.c-panel` no
  longer forces 600px height on short viewports; timeline-row hover no longer mutates
  layout; data zones in liquid (`.doc-code`, `.c-panel-output`) read on the raised
  fill for mono-text legibility.
- BEM canonical forms with deprecated single-dash aliases extended to badges
  (`.c-badge--*`), health dots (`.c-dot--*`), and sparkbar flags (`.c-bar--*`);
  stray unprefixed content classes gain `.doc-*` aliases (`.doc-tok-*`,
  `.doc-margin-note`).
- `--error` is now an alias of `--accent` in every mode (was a dead dark-only token).

### Removed
- The nine dead pre-2.8 glass alias tokens (`--glass-blur-{chrome,panel,support,input}`,
  `--glass-support-fill`, `--glass-edge-{hi,lo}`, `--glass-lens`, `--glass-shadow`) —
  zero consumers after the demo fixes above. **Breaking only for code written against
  the 2.5–2.7 tier names**; `--glass-veil` and `--glass-fallback-fill` are now real
  tokens instead of hardcoded literals.

## [2.8.0] — 2026-06-11

Liquid glass respec'd from production feedback (Icarus macOS integration). Core
correction: **the material has no color of its own** — dark smoked fills were still
"painting the glass." Panes are now milky white films; the backdrop supplies the
color, the material supplies the frost.

### Changed
- **Milky-frost values** (iOS 26 / macOS Tahoe reference): `--surface`
  rgba(255,255,255,0.12), `--surface-raised` 0.18, chrome 0.10, borders white
  0.14/0.35, one shared `blur(24px) saturate(200%)`, specular top edge 0.35 +
  edge ring 0.18, float shadow 0 12px 40px. The white tint matters more than the
  blur; saturate keeps backdrop color glowing through instead of going gray.
- **Two rendering contexts.** `body.liquid.native`: transparent app-shell window, OS
  vibrancy supplies the backdrop (macOS: .hudWindow + behind-window — NOT
  .underWindowBackground), page paints only a faint veil rgba(10,10,20,0.15).
  Browser (default): opaque base + painted backdrop as a fallback — decoration, not
  material; never animated.
- **Floor discipline encoded**: the body is the floor; full-bleed wrappers stay
  transparent in liquid; only true surfaces (inputs, chips, thumbnails) carry
  `--surface-raised`; modals occlude via new `--glass-heavy-fill` rgba(13,13,22,0.82).
- **Radius softens in liquid only**: 16px cards / 12px technical (dark/light keep
  8px/4px console geometry).
- Support tier folded into panel; inputs are raised fills with no blur (one blur pass
  per stack). Pre-2.8 tier tokens alias to the new values — non-breaking.
- `docs/platform-mapping.md` gains §4 "Native macOS shell — liquid mode" (window +
  vibrancy setup, 92px traffic-light clearance, 28px drag strip).
- Token caveat documented: `--black` doubles as ink-on-light and must never go
  transparent; fix floor occlusions at the usage. (Future rev: split `--floor` /
  `--ink-on-light`.)

## [2.7.0] — 2026-06-11

State glyphs rebuilt around the app logo. The three states are now the Icarus mark
(wings rising toward a sun) used as a status light — the sun dot carries the signal.

### Changed
- `src/glyphs.js` rewritten: DOM + CSS dot-matrix renderer replaces the canvas
  blob/swirl engine. States: **running** (sun green via `--success`, slow breathing
  glow + gentle vertical drift), **stopped** (sun page-colour, perfectly still),
  **broken** (sun fixed alarm-red, still). Animations are `transform`/`opacity` only
  and honour `prefers-reduced-motion`; state changes stay instant cuts.
- `mountGlyph` API shape preserved (`setState`/`pause`/`play`/`destroy`); legacy state
  names map automatically (`idle → stopped`, `thinking → running`, `error → broken`).
- `docs/glyphs.md`, the State-glyphs brand card, and `examples/glyphs-demo.html`
  rewritten for the new states.

## [2.6.0] — 2026-06-11

Liquid mode corrected from glassmorphism to actual **Liquid Glass**. The previous cut
floated frosted panels over a forced vivid mesh — that's the 2020-era glassmorphism
look, not a glass material. Non-breaking (token names preserved; `--glass-edge-hi`
now aliases `--glass-specular`).

### Changed
- **No more forced wallpaper.** The vivid 8-gradient mesh is gone. Liquid now ships a
  calm, low-saturation ambient canvas so the glass has light to refract; the material
  is meant to reveal *real content* behind it, and apps override
  `body.liquid { background }` with their own content/imagery.
- **Specular rim added** — every pane now carries the bright refractive edge that
  catches light (`--glass-specular` + `--glass-hairline` + `--glass-lens`), composed as
  `--glass-rim`. This is the signature that separates Liquid Glass from a frosted card;
  inputs brighten the rim on focus.
- **Lighter blur, higher saturation** (blur 32→20 / 18→12 / 10→7 / 8→5 px; saturate up
  to 140–180%): light bends through the material and content colour spills onto it,
  instead of being scattered into opaque frost.
- **More translucent fills** (panel 0.62→0.55, support 0.84→0.72, chrome 0.50→0.44) so
  the backdrop genuinely reads through the glass.
- New tokens: `--glass-specular`, `--glass-hairline`, `--glass-lens`, `--glass-rim`.
  Dashboard page-local `.tb-*` block updated to match.

## [2.5.0] — 2026-06-11

Liquid mode rebuilt as a tiered material system. The first cut was "pragmatic
glassmorphism" — one alpha and one blur repeated on every surface. Real glass is a
ladder. Non-breaking (legacy `--glass-blur`/`--glass-shadow` alias the panel tier).

### Changed
- **Material tiers** replace the single material: *chrome* (bars — most transparent
  fill, heaviest blur), *panel* (floating panes — mid fill, moderate blur, float
  shadow), *support* (code/stats/output — nearly solid, lightest blur; reading beats
  refraction), *input* (lowest blur of all, so what's behind the field stays legible).
- **Blur scale lowered across the board** (48px → 8–32px by tier): saturation now does
  the vibrancy work, and backdrop detail survives the glass instead of washing out.
- **Edge light added**: every pane gets a top inner highlight + dark lower lip
  (directional light) — glass without an edge reads as a washed card. Inputs brighten
  the edge on focus, not the fill.
- Mesh backdrop gains small vivid details (mint/pink/amber spots) tuned to still
  register through panel blur — a built-in check that the blur isn't too heavy.
- New tokens: `--glass-{chrome,panel,support}-fill`, `--glass-blur-{chrome,panel,support,input}`,
  `--glass-edge-{hi,lo}`, `--glass-shadow-{float,rest}` — mirrored in `tokens.json`.
- Dashboard's page-local `.tb-*` liquid block re-tiered to match.

## [2.4.1] — 2026-06-11

### Fixed
- Liquid glass coverage extended to all standalone surfaces: board columns (`.c-col`)
  and the major long-form blocks (`.doc-quote`, `.doc-prompt`, `.doc-code`,
  `.doc-compare`, `.doc-figure-frame`, `.doc-quiz`, `.doc-lab`, `.doc-keylist`,
  `.doc-modnav a`) now blur the mesh like console panels (gentler shadow), with
  matching nested no-double-blur rules and `@supports` fallbacks. `.doc-quote` is
  deliberately excluded — it is a transparent border-left block; blurring without a
  fill reads as a smudge. Inline atoms
  (`code`, `kbd`, pills, hover fills) intentionally stay blur-free — they composite
  over already-blurred parents.
- `examples/dashboard.html` (page-local `.tb-*` surfaces) gains its own liquid block
  mirroring `liquid.css`, so the flagship demo shows glass in liquid mode.
- Finished de-branding the article code sample (`App.Report.Sync` / `App.Worker`).

## [2.4.0] — 2026-06-10

Liquid mode. A third first-class mode: dark smoked-glass panels floating over a vivid
blue/purple mesh. Non-breaking.

### Added
- `body.liquid` token set in `tokens.css`: translucent rgba surfaces, hairline white
  borders, white-alpha text scale (~74% base, full-white display), mint-cyan
  interactive/success (red keeps its interrupt role), `--glass-blur` /
  `--glass-shadow`, 14px card radius.
- `src/liquid.css` (new ITCSS layer 3e): the fixed gradient-mesh backdrop (overridable
  by the host), `backdrop-filter: blur(48px) saturate(140%)` on the ~10 major surfaces,
  flush chrome bars, no-double-blur rule for nested surfaces, accent-tinted dot-grid
  stipple, and an `@supports` fallback to near-opaque panels.
- Liquid values for every color token in `tokens.json` (`$metadata.modes` now
  dark/light/liquid) + a `glass` token group.
- "Liquid mode" card (Colors group) — `examples/previews/modes/liquid-demo.html`.
- Mode documentation in `docs/integration.md` §2 and README.

## [2.3.0] — 2026-06-09

Component-quality pass: keyboard accessibility + naming consistency. Non-breaking
(deprecations only).

### Added
- **Signature focus ring** in `base.css`: a single `:focus-visible` rule
  (`1px var(--text-display)` outline, 2px offset) covering every interactive element —
  buttons, tabs, sidebar items, inputs, quiz options, panel buttons, and future atoms.

### Changed
- `.c-item--done` no longer dims the whole card with `opacity: 0.7` (which pushed
  secondary text below AA contrast). It now dims via color tokens: title →
  `--text-secondary`, id/heading → `--text-disabled`; surfaces stay at full opacity.
- `.doc-reflect textarea:focus` no longer removes the outline.
- All examples/previews migrated to the canonical button names.

### Deprecated
- Single-dash button variants `.c-btn-primary/-secondary/-ghost/-danger/-sm`. The BEM
  forms `.c-btn--*` are canonical (matching every other component and the docs); the
  old names remain as aliases until 3.0.

### Removed
- Duplicate `.c-badge--success` / `.c-badge--warning` rules (artifact of the badge
  role-name consolidation).

## [2.2.0] — 2026-06-09

Motion layer. Subtle, high-frame-rate animation as a first-class part of the system.
Non-breaking.

### Added
- Motion tokens in `tokens.css`: `--ease` (the one percussive curve), `--dur-micro`
  150ms, `--dur-switch` 300ms, `--dur-view` 400ms — matching `tokens.json`'s motion set.
- `src/motion.css` (new ITCSS layer 3d) — opt-in classes: `.c-rise`, `.c-stagger`,
  `.c-slide-in`, `.c-data-enter` (bar sweep / sparkbar rise / sparkline draw),
  `.c-caret`, `.c-blink`, `.c-loading--live`, `.c-tick`. Compositor-only
  (opacity + transform), every entrance gated on `prefers-reduced-motion:
  no-preference` with the end-state as base style, plus a global reduced-motion
  kill-switch covering the system's loops.
- Gauge sweep: `--v` registered via `@property` (inherits: true — no behavior change),
  so `el.style.setProperty('--v', n)` animates the ring over 0.7s.
- `docs/motion.md` + Motion section in `docs/components.md`; motion demo card
  (`examples/previews/motion/motion-demo.html`).

### Changed
- All ~25 hardcoded `cubic-bezier(0.25, 0.1, 0.25, 1)` occurrences across
  `components.css`/`content.css` now reference `var(--ease)`.

### Fixed
- `.c-card` / `.c-statuscard` referenced undefined `--radius` and `.c-alert` undefined
  `--radius-sm`, rendering square corners. Now `var(--radius-card)` (8px) and
  `var(--radius-tech)` (4px).

## [2.1.0] — 2026-06-09

Data-graphics layer. Adds a Tufte-aligned quantitative-display toolkit and folds in the
extended analytical-design principles. Non-breaking.

### Added
- `src/dataviz.css` (new ITCSS layer 3c) — plug-and-play `.c-*` data graphics: `.c-spark`,
  `.c-sparkbar`, `.c-bars`, `.c-dotplot`, `.c-rangebar`, `.c-multiples`, `.c-gauge`,
  `.c-delta`, `.c-metrics`. Pure CSS; per-instance values via unitless 0–100 custom props.
  Color is a signal channel only (threshold crossings), never decoration.
- `examples/previews/dataviz/data-graphics.html` showcase (Design System "Data" card).
- `docs/data-graphics.md` extended with the later books — the Six Principles of
  Analytical Design, 1+1=3 layering, micro/macro readings, confections/parallelism/
  narrative, cause-and-effect, and the extended Tufte test.

### Changed
- `docs/data-graphics.md` code samples and class references now point at the real shipped
  classes (`.c-spark`, `.c-card`, `.dot-grid-bg`) instead of pre-release placeholders.
- `docs/components.md` gains a Data-graphics section.

### Fixed
- **Light mode now flips reliably.** Removed the `transition: background/color` on `body`:
  a Chromium bug froze those `var()`-driven properties at their dark values when only the
  underlying custom property changed at theme switch, leaving light-mode pages dark
  (black text on a black page). Mode switching is now instant and correct.

## [2.0.0] — 2026-05-29

First open-source release. A packaging + consolidation pass; the visual design is
unchanged. **Breaking** because class names, file paths, and structure all moved.

### Added
- `src/cicrus.css` single-import barrel (ITCSS layers: tokens → base → components →
  content → utilities).
- `tokens.json` — machine-readable tokens in W3C DTCG format, for tooling and agents.
- `LICENSE` (MIT + OFL font note), `CONTRIBUTING.md`, this changelog.
- `docs/integration.md` — generic "wire it into your stack" guide.
- Generic health-light (`.c-dot`) and process-state dot (`.c-status-dot`) now both ship.

### Changed
- **Repo restructured** into `src/` (library), `docs/` (brief + reference), and
  `examples/` (demos + per-component previews).
- **One canonical token set.** Locked to the `#111111`-dark / `#F5F5F5`-light values;
  the divergent set previously documented in the old integration doc is dropped.
- **One component layer.** The former `cicrus.css`, `elements/ui.css`, and
  `elements/doc.css` were merged into `components.css` + `content.css`, with all
  collisions resolved (one definition per class).
- **Docs match code.** `components.md` rewritten to the exact shipped `.c-*` / `.doc-*`
  class names (previously documented unprefixed names that didn't exist in the CSS).
- Every preview/demo now imports the single `src/cicrus.css`.

### Renamed (breaking)
| Old | New | Why |
|-----|-----|-----|
| rich card `.c-card*` (board item) | `.c-item*` | frees `.c-card` for the generic surface |
| `.c-kanban` | `.c-board` | domain-neutral |
| `.c-knowledge*` | `.c-index*` | domain-neutral |
| `.c-service*` | `.c-statuscard*` | domain-neutral |
| `.c-failure*` | `.c-errorrow*` | domain-neutral |
| `.c-badge-process/resource/monitor/steps/system/recurring/type` | `.c-badge--strong/--info/--warning/--success/--muted/--subtle/--neutral` | semantic BEM modifiers |

### Removed
- Internal reference-app material (routes, module names, commit history, page inventory).
- Duplicate glyph copies (now one: `src/glyphs.js`) and duplicate component indexes
  (now one: `examples/component-index.html`).
- Product-specific identity files and example copy naming real internal services.
