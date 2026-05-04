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
Continuously wobbling putty blob — a signed distance field, not particles. The surface is the sum of multi-frequency ripples, three traveling 3D bulges that drift across the body at independent rates, a slowly turning squash axis, an off-center radial pull, and a wobble drive built from three non-commensurate sines (periods 7.3s / 4.1s / 2.7s) with a guaranteed floor — so the surface tension never goes silent. Whole-body slosh on a ~14–20s cycle, radius breath on a ~10s cycle. Visibly asymmetric: the silhouette never settles into a clean sphere. Faint specular hot spot and rim darkening for 3D form. No ring. Soap bubble in wind: surface tension fighting drift, varying in intensity but never still. **Mode-aware** — the dot color follows the host page's inherited text color and the canvas backing follows its background, automatically, no consumer setup required.

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
| Background (all states) | Resolved per frame — first opaque ancestor's `background-color`, then the document element, then `#060606`. None of the states paint a fixed dark backing, so the glyph composites cleanly into any page surface. |
| Thinking colour | Resolved per frame — the canvas's inherited computed `color` (mode-aware, identical to idle) |
| Error colour | `rgba(255, 92, 92, α)` (warning red, fixed). Error is the one state that does **not** follow page text colour — a red dot is part of the alarm signal. |
| Idle colour | Resolved per frame — the canvas's inherited computed `color` (so it follows page text colour automatically; falls back to paper-white) |
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

**Thinking and error** paint a fixed `#060606` backing and read against near-black only — keep them on a dark page background. **Do not place them over `--surface` (#111) on dark mode** unless you accept that the glyph's own #060606 square will be visible — put them on the page background, not inside a card.

**All three states** are background-aware: they paint whatever opaque background-color they find walking up the ancestor chain, falling back to the document element and finally `#060606`. So a glyph mounted inside a `--surface` card picks up the card's background, and a glyph mounted on the page picks up the page's background — in both dark and light mode, without configuration.

**Idle and thinking** are also colour-aware: their dots use the canvas's inherited computed `color`, so they follow the page text colour. That makes them white on a dark cicrus page and near-black on a light cicrus page — the same legibility on both. **Error** keeps its fixed warning-red dots regardless of mode — the alarm signal is part of the meaning, and red reads as red on either background.

---

## Anti-patterns

- **Don't recolor error.** Warning-red is the alarm signal — no "amber warning" or "blue thinking" variants. (Idle and thinking are intentionally adaptive — they follow the page text colour — but error stays red on every surface.)
- **Don't soften the cell grid.** No CSS blur, no opacity ramps on the canvas element, no `image-rendering: auto`.
- **Don't reintroduce the pilot grid.** The faint background dots were removed deliberately — they fight the silhouette.
- **Don't run more than one of the same state on a screen.** One idle-blob is presence; two idle-blobs is confusion.
- **Don't animate transitions between states.** `setState` is an instant cut. State changes are events, not eases — see §2.8 "percussive, not fluid."
- **Don't scale the canvas with CSS transforms.** Use the `size` option; transforms break pixel snapping.
- **Don't pair an idle-glyph with a "loading" string.** The glyph already says "alive but at rest" — adding text dilutes it. Use the glyph or `[LOADING...]`, not both.
