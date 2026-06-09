# Changelog

All notable changes to Cicrus are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com); versioning is
[Semantic Versioning](https://semver.org).

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
