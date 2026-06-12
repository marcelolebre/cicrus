# State Glyphs — The Icarus Mark as a Status Light

Three states of one entity: the app logo's dot-matrix mark — seven wing dots rising in a V toward one oversized sun — doubling as the operator-console status light. Where a `status-dot` (see `components.md`) is a peripheral signal, the glyph is the *presence* of the system itself: the brand mark, alive or not.

The renderer is `../src/glyphs.js` — a single ES module, no dependencies, DOM + CSS only. See `../examples/glyphs-demo.html` for a worked example; the mark's anatomy is documented on the **App logo** brand card.

---

## When to use which

| State | Sun | Motion | Meaning |
|-------|-----|--------|---------|
| `running` | Green (`--success`) | Slow breathing glow + a gentle vertical drift (~3.2s cycle) | Alive, working, in flight — a long-running task, an agent reasoning, a pipeline processing. |
| `stopped` | Page colour (white on dark), full opacity | None — perfectly still | Healthy and at rest. Connected, waiting, nothing in flight. |
| `broken` | Alarm red (`--accent`) | None — still | The climb has failed: task crashed, agent lost, pipeline halted. Pair with an alert that says why. |

Legacy names from the pre-2.7 canvas glyphs are accepted and mapped: `idle → stopped`, `thinking → running`, `error → broken`.

Pick exactly one glyph per "thinking object" on a screen. It is the one expressive moment per §2.6 — two of the same kind on one view flattens the effect.

---

## Visual contract

These values are non-negotiable — they are the design.

| Property | Value |
|----------|-------|
| Grid | 7×6 dot matrix; gap = 0.52 × dot; element width ≈ `size`, height ≈ 0.85 × `size` |
| Wings | 7 dots at `currentColor`, opacity 0.95, with a soft glow (`box-shadow: 0 0 0.55×dot`) — they follow the page text colour in every mode (if the host never sets `color` and a dark `rgb()` backdrop is detected, the renderer falls back to paper-white so the mark can't vanish; the check runs once at mount and reads solid `rgb()` backgrounds only — image or modern-syntax backdrops are presumed light) |
| Unlit grid | `currentColor` at opacity 0.08 — the matrix stays faintly visible so the mark reads as a display, not a drawing |
| Sun | One dot scaled 1.45×, plus a radial glow layer. Only the sun changes between states. |
| Running colour | `var(--success, #5EE596)` — mode-aware |
| Stopped colour | `currentColor` — white on dark, near-black on light |
| Broken colour | `var(--accent, #FF5C5C)` — the mode's alarm red (deep red on paper, bright red on dark/glass). Always red: the hue is the alarm signal; the exact shade tracks the mode for legibility, like every other interrupt in the system. |
| Animation | `transform`/`opacity` only (compositor-friendly, high frame rate); honours `prefers-reduced-motion: reduce` (running renders static) |
| State change | Instant cut via `data-state` — never an ease (§2.8 "percussive, not fluid") |

---

## API

```js
import { mountGlyph } from './../src/glyphs.js';

const glyph = mountGlyph(targetEl, {
  state: 'running',    // 'running' | 'stopped' | 'broken'  (default 'stopped')
  size: 200,           // displayed width in CSS px (default 200)
  autoplay: true,      // start the running animation on mount (default true)
});

glyph.setState('broken');  // hot-swap state in place — an instant cut
glyph.pause();             // freeze the running animation on its current frame
glyph.play();              // resume
glyph.destroy();           // remove the element
```

`mountGlyph` appends one `.c-glyph` element to the target and injects a single shared `<style id="cicrus-glyph-styles">` on first use (into `document.head` — inside a Shadow DOM, adopt the styles yourself or mount outside the shadow root). Each call returns an independent controller; mounting is **not idempotent** — a second mount on the same target stacks a second mark (the renderer warns). Unknown state names warn and render `stopped`. With `autoplay: false` the glyph stays paused across `setState('running')` until you call `play()`.

**Announcing state changes** — the glyph carries `role="img"` with an `aria-label` that tracks the state, which names it but does not announce changes. For operator consoles where a `broken` cut must be heard, pair the glyph with a visually-hidden `role="status"` live region you update alongside `setState` (don't put `aria-live` on the glyph itself — its 42-dot subtree makes that noisy).

---

## Embed snippet

```html
<div id="agent-state" style="width:200px"></div>
<script type="module">
  import { mountGlyph } from '/path/to/../src/glyphs.js';

  const glyph = mountGlyph(
    document.getElementById('agent-state'),
    { state: 'stopped' }
  );

  // When work begins:
  glyph.setState('running');

  // On failure:
  glyph.setState('broken');
</script>
```

For a labeled three-up demo (`RUNNING` / `STOPPED` / `BROKEN` side by side), copy `../examples/glyphs-demo.html` from this folder.

---

## Layout placement

- **Status header replacement**, 32–48px — the mark sits where a logo would, and *is* the health signal.
- **Stat-card hero**, 120–180px — one card per dashboard carries the glyph; the rest stay numeric.
- **Dashboard tile**, 200px — the system's presence on an overview screen.

The glyph composites over any surface: wings and the unlit grid follow the inherited `color`, the running sun follows `--success`, the broken sun follows `--accent` — red in every mode. No backing is painted — it sits directly on whatever is behind it, including liquid-mode glass.

---

## Anti-patterns

- **Don't recolor broken.** Alarm-red is the signal — no amber or blue variants. (The shade tracks the mode's `--accent` for legibility, but it is always red.)
- **Don't animate stopped or broken.** Stillness *is* the message; only running breathes.
- **Don't run more than one of the same state on a screen.** One mark is presence; two is confusion.
- **Don't animate transitions between states.** `setState` is an instant cut. State changes are events, not eases.
- **Don't rebuild the mark by hand at tiny sizes.** Below ~24px drop the unlit grid and keep the sun and wing-tips — see the App logo card's favicon guidance.
