# Contributing to Cicrus

Cicrus is plain CSS + design tokens. Keep it that way — no build step, no framework
dependency, no runtime JS for the core (the only `.js` is the optional glyph renderer).

## Architecture (ITCSS)

`src/cicrus.css` imports five layers, low → high specificity. Add code to the right one:

| Layer | File | What goes here |
|-------|------|----------------|
| 1 · Settings | `tokens.css` | Design tokens only (CSS custom properties). No selectors that paint. |
| 2 · Generic | `base.css` | Reset, bare element defaults, scrollbar. |
| 3 · Components | `components.css` | `.c-*` UI components. |
| 3b · Content | `content.css` | `.doc-*` long-form content components. |
| 4 · Utilities | `utilities.css` | Single-purpose `.c-*` helpers. Load last. |

## Rules

1. **Tokens, never literals.** Build every component from `var(--…)`. A raw hex in a
   component is a bug. Need a new color? Add it to *both* the dark (`body`) and light
   (`body.light`) blocks in `tokens.css`, then mirror it in `tokens.json`.
2. **Promote at 3.** A value used in 3+ places becomes a token.
3. **Naming is BEM-ish:** `.c-block`, `.c-block-elem`, `.c-block--modifier`. UI is
   `.c-*`; long-form content is `.doc-*`. Don't invent a third prefix for the core.
4. **Generic names.** Components describe *form*, not a product domain (`.c-board`, not
   `.c-kanban`; `.c-statuscard`, not `.c-service`). Sample copy in examples is generic.
5. **Both modes are first-class.** Verify any change in dark *and* light.
6. **Accessibility is non-negotiable.** Every text/background pair clears WCAG AA
   (targets in `docs/tokens.md` §2). `--text-disabled` (~3:1) is for non-content only.
7. **Keep the anti-patterns out** (see `docs/SKILL.md` §3): no gradients in chrome, no
   shadows in dark mode, no emoji/filled icons, no spring easing, no border-radius >16px
   on cards.

## Adding a component

1. Add the rules to `components.css` (or `content.css`) under the right section.
2. Add a standalone preview in `examples/previews/{ui,content}/<name>.html` that
   imports only `../../../src/cicrus.css`.
3. Document it in `docs/components.md` with the exact shipped class names.
4. Check it in both modes; confirm no token-free literals.

## Versioning

[Semantic Versioning](https://semver.org). A class rename or removal is a breaking
change (major). New components/tokens are minor. Fixes are patch. Record every change
in `CHANGELOG.md`.
