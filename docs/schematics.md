# Schematics — Operator-Console System Diagrams

Architecture diagrams, service topology boards, agent stacks, anything that visualises N modules and how they connect — rendered in Cicrus.

## When to use

Reach for a schematic when you're showing:
- A system architecture across multiple layers (ingress → scheduler → workers → storage)
- A service topology with real-time status per node
- An agent stack — orchestrator, workers, tool registry, memory

Do **not** reach for a schematic when:
- The audience is end users → that's a service dashboard, see `components.md`
- The relationships are entities and foreign keys → that's an ERD, use Mermaid
- The output is a marketing diagram → wrong design system entirely

## Structure

Top-down topology. Each row is one abstraction layer; cards in a row are siblings of the same kind. Traces between rows show data flow direction. The eye reads downward; never sideways.

Five rows is plenty. More than that, split into two diagrams.

Layer labels are stencil-cut: Space Mono, ALL CAPS, 10px, 0.18em tracking, `--text-disabled` colour. A thin `--rule` line runs beside the label, suggesting an instrument-bay header.

Board width: 680px. Height: whatever the content needs. Don't constrain.

## Cards (modules)

Each module is a 200px-wide card (240px when wider, 680px for a bus). 68px tall standard, 76–88px for a bus or multi-metric card.

Inside a card, top to bottom:
1. **Title** — Space Mono 11px ALL CAPS 0.10em, `--text-primary`
2. **Signal-light dot** — top-right corner, 4px radius
3. **Primary metric** — Space Mono 13px tabular-nums, `--text-primary`, with secondary stat label beside it (9.5px, `--text-secondary`)
4. **Footer rule** — dashed `--rule` line, separates metrics from descriptor
5. **Sub-descriptor** — Space Mono 9.5px, `--text-disabled`, says what the module *is*

Never centre card content. Left-align everything; use the right-edge for the dot only.

## States

Every card is in exactly one of four states. State is encoded entirely by border + dot — never by background fill, never by motion.

| State        | Border                                                          | Dot                                          | Dot rhythm     |
|--------------|-----------------------------------------------------------------|----------------------------------------------|----------------|
| Healthy      | `--border-strong`, 1px solid                                    | filled `--success`                           | 2.8s breathe   |
| Under load   | `--warning`, 1px solid                                          | filled `--warning`                           | 1.6s breathe   |
| Idle         | `--text-disabled`, 0.75px, `stroke-dasharray: 1 5`, opacity 0.55 | hollow ring `--text-disabled`                | none           |
| Error        | `--danger`, 1.4px solid                                         | filled `--danger`                            | 0.9s breathe   |

Idle cards keep their text fully readable — never drop opacity on the whole group, only on the border.

## Traces (connectors)

Static SVG paths between rows. Continuous dashed-line flow encodes link traffic. The line itself flows; nothing else moves on or above it.

```css
.trace-line {
  fill: none;
  stroke: var(--trace);
  stroke-width: 0.8;
  stroke-dasharray: 3 7;
  animation: flow var(--flow-dur, 2.4s) linear infinite;
}
.trace-line.warm  { stroke: var(--warning); stroke-width: 1; }
.trace-faint      { fill: none; stroke: var(--trace-faint); stroke-width: 0.5; stroke-dasharray: 1 4; }
.trace-rail       { fill: none; stroke: var(--trace); stroke-width: 0.5; opacity: 0.5; }

@keyframes flow { to { stroke-dashoffset: -20; } }
```

`--flow-dur` is the load encoding. Set per-trace with an inline style.

| Link load    | `--flow-dur` | Class                  |
|--------------|--------------|------------------------|
| Dormant      | —            | `.trace-faint` (no animation) |
| Background   | 4.4s         | `.trace-line`          |
| Steady       | 2.4–2.8s     | `.trace-line`          |
| Active       | 1.4–2.0s     | `.trace-line`          |
| Hot          | 1.2–1.6s     | `.trace-line.warm`     |

Junctions where a trace meets a card edge get a 1.6px-radius `via` dot. Lateral rails between siblings (e.g. worker-to-worker cross-talk) use `.trace-rail` — static, no flow.

Routing rule: orthogonal only. L-bends are fine. No curves, no diagonals.

## Animation grammar

Four channels. Every motion in a Cicrus schematic must fit one of these — if it doesn't, delete it.

| Channel             | Encodes                              | Continuous? |
|---------------------|--------------------------------------|-------------|
| Trace flow speed    | Relative traffic on that link         | Yes         |
| Dot breathe         | Module liveness probe                 | Yes, soft   |
| Static border color | Current health state                  | At rest     |
| Silent number tick  | Real-time measurement updating        | On change   |

The board should hum. It should not flash, flicker, or chirp. A user looking away and looking back should not have missed anything decorative — only data.

## Tokens

Add to `tokens.md` if not present.

```css
:root {
  --trace:       rgba(255,255,255,0.32);
  --trace-faint: rgba(255,255,255,0.08);
}
html.light {
  --trace:       rgba(0,0,0,0.40);
  --trace-faint: rgba(0,0,0,0.08);
}
```

## Anti-patterns (schematic-specific)

- **No moving particles** — no balls, packets, or sprites traveling traces. The line conducts itself via dashed flow.
- **No border flash** on event arrival. State changes via colour, not motion.
- **No text flicker** when metrics refresh. Numbers just change.
- **No marching dashed borders.** Borders are static. (Dashed *trace lines* flow; dashed *card borders* don't.)
- **No glow, drop-shadow, blur, halo.** None.
- **No spring or bounce.** Linear easing for flow, ease-in-out for breathe. That's it.
- **No background fills on cards** to encode state. Border + dot do all the work.

## Layout reference (680px board)

- 3-column row: card 200px + gutter 40px + card 200px + gutter 40px + card 200px = 680
- 2-column row: card 240px + gutter 200px + card 240px = 680
- Full-width bus: 680px, height 76–88px
- Section label sits 12px above its row, with a 0.5px `--rule` line filling the remaining width
- Standard card height 68px; bus card 76–88px; storage card 68px

## Worked example

See `../examples/schematic-demo.html` in this folder for a minimal three-module schematic demonstrating all states and a connector trace.
