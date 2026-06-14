# Cicrus — Motion

How Cicrus moves. Shipped in [`../src/motion.css`](../src/motion.css); tokens in
[`../src/tokens.css`](../src/tokens.css) (`--ease`, `--dur-micro/-switch/-view/-data`).
Live demo: [`../examples/previews/motion/motion-demo.html`](../examples/previews/motion/motion-demo.html).

## 1. PRINCIPLES

1. **Percussive, not fluid.** Imagine UI sounds: click, not swoosh; tick, not chime.
   One curve — `var(--ease)` (`cubic-bezier(0.25, 0.1, 0.25, 1)`) — never spring,
   never bounce. Signals blink with `steps()`, they don't fade.
2. **Motion is information.** An entrance orients; a sweep shows a value arriving; a
   blink signals liveness; a tick marks a change. If a motion encodes nothing, cut it.
3. **High frame rate by construction.** Entrances animate **opacity + transform**
   (compositor-friendly — no layout, no paint storms, no blanket `will-change`).
   Sanctioned bounded exceptions, all small: SVG stroke draw (`c-draw`), registered
   custom-prop sweeps (`--v`, `--p`), the grid-rows disclosure used by `.doc-reveal`
   and `.c-resize` (accurate height beats a capped `max-height` lie), a thread of
   blur (≤4px) on one-shot state transitions, and the skeleton/shimmer sweeps
   (translate, not background-position).
4. **Four durations.** `--dur-micro` 150ms (hover, focus, small flips) ·
   `--dur-switch` 300ms (toggles, reveals, ticks) · `--dur-view` 400ms (view and panel
   entrances) · `--dur-data` 600ms (data sweeps: progress fills, sparkline draws, gauge
   arcs — data is allowed to take its time). Nothing slower than `--dur-data`; loops
   (pulse, glow) are the only long-period motion.
5. **End-state is the base style.** Every entrance animates *from* hidden inside
   `@media (prefers-reduced-motion: no-preference)` — print, export, and
   reduced-motion users always see finished content. A global reduced-motion
   kill-switch also stops every loop in the system.

## 2. CLASSES

| Class | Motion | Use |
|-------|--------|-----|
| `.c-rise` | Fade-up entrance, 400ms | A view, a card, a late-arriving block. |
| `.c-stagger` | Children rise 35ms apart (caps at 12) | Card grids, list loads, board columns. |
| `.c-slide-in` | Short slide from the right, 400ms | Side panels, drawers. |
| *(automatic)* `c-settle` | Opened `.c-item` detail fades down 150ms | Softens the mechanical snap-open of `.c-item.is-open` — applied by the system, not opt-in. |
| `.c-data-enter` | Scoped data entrances (on a parent) | Bars sweep from zero (origin left — honest scale); sparkbar columns rise 20ms apart; sparklines draw if the `<polyline>` has `pathLength="1"`. |
| `.c-caret` | Appends a hard-blinking `_` | Terminal/console lines. |
| `.c-blink` | Hard on/off blink (steps, 1.1s loop) | Any liveness signal. |
| `.c-loading--live` | Cycling dots on `.c-loading`, fixed width | Loading stubs. |
| `.c-tick` | One-shot relay-flip (half-dim → full, 2 steps) | A value that just changed — re-add the class from JS. |
| `.c-skeleton` | Looping sheen (a highlight pseudo translates across) | Loading placeholders — give the block a size; it greys and shimmers. |
| `.c-shimmer` | A bright band sweeps the text (2.4s loop) | A live "thinking / planning…" cue; pairs with the glyph running state. |

Already-shipped motion that composes with these: `.c-view` fade-in, `.c-dot--down` /
`.c-status-dot--running` pulse, `.c-item--running` breathing glow, `.c-panel-timeline`
pulse-ring, `.c-item-progress` / `.c-panel-progress` meter transitions.

### One-shot state transitions

Each blurs only a hair (≤4px) and settles hard on the one curve — percussive, never
spring, no rotate flourishes. Re-trigger from JS with the class-yank idiom (§3).

| Class | Motion | Use |
|-------|--------|-----|
| `.c-flip` | Digit drops in from above through blur, lands | A number arriving — the upgrade over `.c-tick` for stat values, bar/dotplot values, gauge centre, counts. |
| `.c-swap` | Blur-dissolve in | A label changing meaning (RUN → RUNNING → DONE), button labels, panel pills. |
| `.c-shake` | Three hard lateral knocks (~5px), then still | A rejected submit — pair with `.c-input--error` / `.c-btn--danger`. |
| `.c-check` | Scale up from 0.7 through blur | A completion landing — a check revealed in `.c-status-dot--done` / a done badge. |
| `.c-icon-swap` | Scale + blur in (150ms) | A glyph replaced in place. |
| `.c-badge-in` | Quick scale + fade (150ms) | A count or label arriving on `.c-badge`. |
| `.c-dissolve` | Blur + fade out, holds end-state (`forwards`) | Clearing an input or removing a chip — drop the node on `animationend`. |

### Disclosure, layout & overlay

These carry their **end-state as a base rule** (so it holds under reduced motion); only
the transition is gated.

| Class | Motion | Use |
|-------|--------|-----|
| `.c-chevron` | Rotates 180° when its control opens | A disclosure caret — toggles on `[aria-expanded="true"]` or `.c-chevron--open`. |
| `.c-resize` | Height reveal via a `0fr → 1fr` grid track (no magic pixel value) | Wrap collapsible content; toggle `.is-open`. |
| `.c-modal` | Scrim fades, dialog scales up from 0.96 + blur, settles | A centred dialog (`.c-modal-overlay > .c-modal`); add `.is-closing` to the overlay to play the reverse, then remove on `animationend`. Liquid mode renders it as heavy occluding glass. |

## 3. JS HOOKS

**Replay an entrance** (the class-yank idiom):

```js
el.classList.remove('c-stagger');
void el.offsetWidth;            // force reflow
el.classList.add('c-stagger');
```

**Animate a gauge** — `--v` is a registered property; setting it transitions the ring:

```js
gauge.style.setProperty('--v', 64);   // sweeps to 64% over var(--dur-data) (0.6s)
```

**Tick a changed value** (or `.c-flip` for the blur-drop variant — same shape, harder
visual):

```js
valueEl.textContent = next;
valueEl.classList.remove('c-flip');
void valueEl.offsetWidth;
valueEl.classList.add('c-flip');
```

**Open a modal** (entrance animates; `.is-closing` plays the reverse):

```js
const overlay = root.firstElementChild;        // .c-modal-overlay
function close() {
  overlay.classList.add('is-closing');
  overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
}
overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
```

## 4. WHEN *NOT* TO ANIMATE

- Theme switching. Mode flips are instant by design (and a `body` background
  transition triggers a Chromium custom-property bug: a transition watching a
  `var()`-driven property freezes it at its initial value when only the custom
  property changes at theme switch).
- Layout properties (`width`, `height`, `top`, `margin`) — reflow per frame.
- Scroll (no parallax, no scroll-jacking), hover transforms (no lift/scale — the
  hover language is border-color), and anything infinite that isn't a status signal.
- Charts beyond their entrance. Data comparison happens through space, not time.
