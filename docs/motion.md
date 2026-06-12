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
   Three sanctioned, bounded exceptions: SVG stroke draw (`c-draw`), registered
   custom-prop sweeps (`--v`, `--p`), and the `.doc-reveal` grid-rows disclosure
   (accurate height beats a capped `max-height` lie).
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

Already-shipped motion that composes with these: `.c-view` fade-in, `.c-dot-down` /
`.c-status-dot--running` pulse, `.c-item--running` breathing glow, `.c-panel-timeline`
pulse-ring, `.c-item-progress` / `.c-panel-progress` meter transitions.

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

**Tick a changed value:**

```js
valueEl.textContent = next;
valueEl.classList.remove('c-tick');
void valueEl.offsetWidth;
valueEl.classList.add('c-tick');
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
