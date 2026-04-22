# Cicrus

**An operator-console design system.** Monochromatic canvas, typography-first hierarchy, dark and light modes both first-class. Built for dashboards, internal tools, and control-surface UIs — not marketing pages.

> Subtract, don't add. Structure is ornament. Color is an event.

---

## What's in here

| Path | What |
|------|------|
| [`cicrus.css`](./cicrus.css) | The stylesheet. Tokens (colors, spacing, radius, shadow, fonts), component classes (`.c-view`, `.c-view-header`, `.c-section-title`, `.c-kv`, `.c-caps`), and utilities. ~650 lines, no build step. |
| [`DESIGN.md`](./DESIGN.md) | How Cicrus is wired into a real app (Icarus Hub). Shows the Phoenix/LiveView wiring — mode toggle, font loading, token overrides, legacy aliases. Treat it as a worked example. |
| [`skill/SKILL.md`](./skill/SKILL.md) | Self-contained designer brief. Philosophy (three-layer rule, font discipline, color-as-event), craft rules, composition patterns, the "no cute tricks" section. Authored to be read by a human designer or an agent. |
| [`skill/references/tokens.md`](./skill/references/tokens.md) | The complete token reference — every CSS custom property, what it's for, when to use it. |
| [`skill/references/components.md`](./skill/references/components.md) | Component patterns with HTML: badges, cards, kanban columns, forms, tables, timelines. |
| [`skill/references/patterns.md`](./skill/references/patterns.md) | Layout patterns: view shells, headers, navigation, empty states. |
| [`skill/references/platform-mapping.md`](./skill/references/platform-mapping.md) | How the system maps to non-CSS surfaces (iOS, native, TUIs). |
| [`skill/references/starter.html`](./skill/references/starter.html) | A single-file HTML starter that drops in Cicrus, both modes, and the core components. Open it in a browser — no build. |

---

## Quick start

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&family=Doto:wght@400;700&display=swap" rel="stylesheet">
  <link href="cicrus.css" rel="stylesheet">
</head>
<body>
  <!-- default is dark; add class="light" on <body> for light mode -->
  <main class="c-view">
    <header class="c-view-header">
      <h1 class="c-view-title">Dashboard</h1>
      <span class="c-caps">online</span>
    </header>
    <!-- ... -->
  </main>
</body>
</html>
```

The whole system is driven by CSS custom properties. No build. No framework. No JS. Swap mode by toggling one class on `<body>`.

---

## Principles (the short version)

1. **Three layers of importance per screen.** Primary / secondary / tertiary. If two elements compete, one needs to shrink, fade, or move.
2. **Font budget: 2 families, 3 sizes, 2 weights.** Space Grotesk + Space Mono. Doto reserved for hero moments. Before adding a size, ask whether spacing or color could do it instead.
3. **Monochrome is the canvas.** Color means status, and only status: success (green), warning (amber), danger (red), interactive (blue). Never decoration.
4. **Both modes are first-class.** Dark = OLED instrument panel. Light = printed technical manual. Neither is derived from the other.
5. **Labels are instrument labels.** ALL CAPS, Space Mono, ~11px, 0.08em tracking. Like the stencil on a hardware panel.
6. **Accessibility is craft, not compliance.** Every text color clears WCAG AA on its background. No "aesthetic" muted text that fails contrast.

See [`skill/SKILL.md`](./skill/SKILL.md) for the long version, including the anti-patterns (fake-3D shadows, rainbow tags, drop-caps, skeuomorphic icons — all no).

---

## Who this is for

You're building a dashboard, a queue, a log viewer, an ops console, a CRUD admin, an agent control plane, a metrics wall, a status board. You want it to feel like a well-made instrument — restrained, legible, intentional. You don't want it to look like a landing page.

If you're building a marketing site or a consumer product with playful branding, **this isn't your design system.** Cicrus deliberately gives up warmth-per-pixel for information density and focus.

---

## Fonts

Three Google Fonts, CDN-loaded:

- **Space Grotesk** — body + display
- **Space Mono** — labels, metadata, instrument text
- **Doto** — hero-moment display only (big numbers, landing state)

Self-host them instead if you care about offline / privacy. The `cicrus.css` only references font families, not font files.

---

## Origin

Cicrus was carved out of the [Icarus Hub](https://github.com/marcelolebre/icarus) — a Phoenix/LiveView operator console for an autonomous agent stack. After a few iterations where the same patterns kept re-appearing (cards, kanban columns, timelines, status pills, kv lists), the tokens and components got named, written up, and extracted here.

The design brief in `skill/SKILL.md` is written to be readable by both humans and coding agents — the same text drives the designer's thinking and the agent's generation.

---

## License

MIT. See [`LICENSE`](./LICENSE).

---

*Cicrus — "circus" with a `c`. The operator console as the big top: disciplined performers, bare stage, one spotlight at a time.*
