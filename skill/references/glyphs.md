# State Glyphs — Animated Operator-Console Signals

Three pixel-grid canvas animations depicting one "thinking object" entity in three states. They are the operator-console equivalent of a status light — but where a `status-dot` (see `components.md` §8) is a flat 8×8 signal, a state glyph is a 36×36 pixel-grid sphere with character. Use them for any place a system component is performing real cognitive or background work and a static dot would be too quiet.

The renderer is `glyphs/cicrus-glyphs.js` — a single ES module, no dependencies, pure 2D canvas. See `glyphs-starter.html` for a worked example.

---

## When to use which

| State | Meaning | When to show |
|-------|---------|--------------|
| `idle` | Bright, dormant, at rest. The system is healthy and not currently doing anything. | Default resting state when an agent/worker is connected and waiting. Dashboards where you want a "breathing" presence indicator without implying activity. |
| `thinking` | Active, energetic — visibly working. | While a long-running task is in flight: agent reasoning, model generation, ingest pipeline processing, deploy in progress. |
| `error` | Compromised, alarm — the entity is recognizable but visibly damaged. | Failure states for the same component — task crashed, agent lost connection, pipeline halted. Pair with an alert banner (`components.md` §9) when a textual reason is available. |

Pick exactly one glyph per "thinking object" on a screen. They are the one expressive moment per §2.6 — having two glyphs of the same kind on one screen flattens the effect.

---

## Visual description

### Idle
Slow breathing putty blob — a continuous signed distance field, not particles. Whole-body drift on a ~14–20s cycle, radius breath on a ~10s cycle, smooth multi-frequency surface deformation so the silhouette is irregular and organically morphing. Bright (`#f0ede0`), high ambient, no ring. Looks asleep but alive.

### Thinking
Siri-style swirling sphere. ~360 particles distributed by Fibonacci-sphere over a tight outer shell, sloshed and rotated as a rigid body. Three independent swirl systems wrap the sphere with bright spiral bands (different axes, speeds, pitches) — they continuously combine and dissolve like cream poured into coffee. Around the sphere: a fine ink-line ring with uneven thickness, beating to a heartbeat envelope (lub-dub-rest, 1.4s period), with a traveling pulse that varies speed and direction. The pulse spawns sparks that fly off radially, an outer halo that bleeds energy outward, and occasional jagged arc-lightning across the ring's interior.

### Error
The thinking sphere, broken. The 360 particles are bound to 12 fragments (an "asteroid breakup"), each with its own permanent outward drift and oscillation — the body is no longer a sphere but a cloud of chunks that almost reassemble. Stuttering rotation (servos failing — yaw advances in 8 discrete steps/sec, pitch in 5, roll in 6). Periodic crashes every ~3s shoot fragments outward; disintegration events every ~7.3s scatter particles for ~200ms; brown-outs every ~4s briefly dim everything to 20% for ~130ms. Swirl phases occasionally jump backward. The ring is shattered — five permanent fixed gaps plus transient tears, heavy radius wobble, ~18% per-segment dropout, arrhythmic heartbeat. No sparks, no halo, no arc lightning — the electricity is gone. Color: warning red `#ff5c5c`.

---

## Visual contract

These values are non-negotiable — they are the design.

| | Value |
|---|---|
| Logical grid | 36 × 36 cells |
| Cell size | 5 px |
| Dot per cell | 3 × 3 px, offset (1, 1) inside the cell |
| Internal canvas | 180 × 180 px (scaled via CSS `image-rendering: pixelated`) |
| Background | `#060606` |
| Idle / thinking colour | `rgba(240, 237, 224, α)` (paper-white) |
| Error colour | `rgba(255, 92, 92, α)` (warning red) |
| Alpha quantization | 8 steps (rounded to nearest 1/8) |
| No pilot grid | The dim background dot grid was removed — do not reintroduce it |
| Anti-aliasing | None on the cell grid; `image-rendering: pixelated` is required |

**Sizing:** the displayed `size` (CSS pixels) can be anything, but multiples of 36 (180, 216, 252, 288) keep each cell on whole pixels for the sharpest result. Other sizes still render correctly via pixelated scaling but each cell straddles a fractional boundary.

---

## API

```js
import { mountGlyph } from './glyphs/cicrus-glyphs.js';

const glyph = mountGlyph(targetEl, {
  state: 'thinking',   // 'idle' | 'thinking' | 'error'  (default 'idle')
  size: 200,           // displayed CSS px (default 200)
  autoplay: true,      // start RAF loop on mount (default true)
});

glyph.setState('error');   // hot-swap state in place
glyph.pause();             // cancel RAF, freeze on current frame
glyph.play();              // resume from where it paused
glyph.destroy();           // cancel RAF and remove the canvas element
```

`mountGlyph` appends a `<canvas>` to the target element. The canvas is the only thing it touches; the host element keeps everything else.

Each `mountGlyph` call returns an independent controller — its own RAF loop, its own scratch buffers. Mount as many as you need on a page; pause the ones offscreen to save cycles.

---

## Embed snippet

```html
<div id="agent-state" style="width:200px;height:200px"></div>
<script type="module">
  import { mountGlyph } from '/path/to/glyphs/cicrus-glyphs.js';

  const glyph = mountGlyph(
    document.getElementById('agent-state'),
    { state: 'idle' }
  );

  // Later, when work begins:
  glyph.setState('thinking');

  // On failure:
  glyph.setState('error');
</script>
```

For a labeled three-up demo (`IDLE` / `THINKING` / `ERROR` side by side), copy `glyphs-starter.html` from this folder.

---

## Layout placement

Most natural placements:

- **Status header**, replacing or augmenting the lone status dot in `components.md` §8 — 32–48px size, baseline-aligned with the title.
- **Stat card hero**, taking the slot a `--display-md` number would otherwise occupy — 120–180px size, one per screen (the §2.6 "one moment of surprise").
- **Dashboard tile** for an agent/worker, 200px size, with a `t-title` label below.
- **Loading takeover**, 240–288px size, centered on a card that's currently fetching its content. Replaces `[LOADING...]` (`components.md` §20) when the operation is long-running enough to warrant atmospheric weight.

Always keep the background dark (`#060606` or `--black`). The glyph paints its own background and its silhouette only reads against near-black. **Do not place over `--surface` (#111) on dark mode** unless you accept that the glyph's own #060606 backing will be visible as a square — instead put the glyph on the page background, not inside a card.

**Light mode:** the glyph is dark-mode-only by design. Paper-white pixels on a #060606 backing don't translate to a printed-page surface. If you need a light-mode equivalent, use a static `status-dot` with a 2.8s breathe (see `schematics.md`).

---

## Anti-patterns

- **Don't recolor.** The two palettes (paper-white, warning red) and their state pairings are the design. No "blue thinking" or "amber warning" variants.
- **Don't soften the cell grid.** No CSS blur, no opacity ramps on the canvas element, no `image-rendering: auto`.
- **Don't reintroduce the pilot grid.** The faint background dots were removed deliberately — they fight the silhouette.
- **Don't run more than one of the same state on a screen.** One idle-blob is presence; two idle-blobs is confusion.
- **Don't animate transitions between states.** `setState` is an instant cut. State changes are events, not eases — see §2.8 "percussive, not fluid."
- **Don't scale the canvas with CSS transforms.** Use the `size` option; transforms break pixel snapping.
- **Don't pair an idle-glyph with a "loading" string.** The glyph already says "alive but at rest" — adding text dilutes it. Use the glyph or `[LOADING...]`, not both.
