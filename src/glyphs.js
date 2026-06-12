// cicrus state glyphs — the Icarus mark as a status light.
//
// One entity, three states. The mark is the app logo's 7×6
// dot-matrix — seven wing dots rising in a V toward one
// oversized sun dot — and the SUN carries the signal:
//
//   running — sun green (--success), breathing a slow glow,
//             drifting gently up and down. Alive, working.
//   stopped — sun follows the page colour (white on dark),
//             perfectly still. Healthy, at rest.
//   broken  — sun alarm-red, still. The climb has failed.
//
// Legacy state names from the pre-2.7 canvas glyphs are
// accepted: idle → stopped, thinking → running, error → broken.
//
// DOM + CSS only — animations run on transform/opacity (the
// compositor), honour prefers-reduced-motion, and pause via
// animation-play-state. No canvas, no RAF, no dependencies.

const PATTERN = [
  [0, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
];
const COLS = 7;
const GAP = 0.52; // gap as a fraction of dot size
const UNITS_W = COLS + (COLS - 1) * GAP; // 10.12 dot-units wide

const STATES = ['running', 'stopped', 'broken'];
const LEGACY = { idle: 'stopped', thinking: 'running', error: 'broken' };

const CSS = `
.c-glyph {
  display: grid;
  grid-template-columns: repeat(${COLS}, var(--gdot));
  gap: calc(var(--gdot) * ${GAP});
}
.c-glyph .gd {
  width: var(--gdot); height: var(--gdot);
  border-radius: 50%;
  background: currentColor;
  opacity: 0.08;
}
.c-glyph .gd.gw { opacity: 0.95; box-shadow: 0 0 calc(var(--gdot) * 0.55); }
.c-glyph .gd.gs {
  position: relative;
  opacity: 1;
  background: var(--gsun);
  transform: scale(1.45);
}
.c-glyph .gd.gs .gglow {
  position: absolute; inset: -60%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--gsun) 0%, transparent 70%);
  opacity: 0.40;
}
.c-glyph[data-state="running"] { --gsun: var(--success, #5EE596); }
.c-glyph[data-state="stopped"] { --gsun: currentColor; }
.c-glyph[data-state="broken"]  { --gsun: var(--accent, #FF5C5C); }
.c-glyph[data-state="running"] .gd.gs { animation: cicg-bob 3.2s ease-in-out infinite; }
.c-glyph[data-state="running"] .gd.gs .gglow { animation: cicg-glow 3.2s ease-in-out infinite; }
@keyframes cicg-bob {
  0%, 100% { transform: scale(1.45) translateY(10%); }
  50%      { transform: scale(1.45) translateY(-12%); }
}
@keyframes cicg-glow {
  0%, 100% { opacity: 0.25; transform: scale(0.88); }
  50%      { opacity: 0.70; transform: scale(1.18); }
}
.c-glyph.paused .gd.gs, .c-glyph.paused .gd.gs .gglow { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .c-glyph .gd.gs, .c-glyph .gd.gs .gglow { animation: none !important; }
}
`;

let styled = false;
function injectStyles() {
  if (styled || document.getElementById('cicrus-glyph-styles')) { styled = true; return; }
  const tag = document.createElement('style');
  tag.id = 'cicrus-glyph-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
  styled = true;
}

function normalize(state) {
  if (STATES.indexOf(state) !== -1) return state;
  if (LEGACY[state]) return LEGACY[state];
  if (state != null && typeof console !== 'undefined') {
    console.warn('cicrus-glyphs: unknown state "' + state + '" — rendering "stopped"');
  }
  return 'stopped';
}

// mountGlyph(target, options) → controller
//
//   target    — host element. The glyph element is appended to it.
//   options.state    — 'running' | 'stopped' | 'broken' (default 'stopped';
//                      legacy 'idle'/'thinking'/'error' accepted)
//   options.size     — displayed width in CSS px (default 200; height ≈ 0.85 × width)
//   options.autoplay — start animation on mount (default true)
//
// Returns { el, setState, pause, play, destroy }. Each instance is
// independent; mount as many as you need.
export function mountGlyph(target, options = {}) {
  if (!target || !target.appendChild) {
    throw new Error('cicrus-glyphs: mountGlyph(target) — target must be a DOM element');
  }
  injectStyles();

  if (target.querySelector(':scope > .c-glyph') && typeof console !== 'undefined') {
    console.warn('cicrus-glyphs: target already hosts a glyph — mounting another (mountGlyph is not idempotent; destroy() the old one first)');
  }

  const size = options.size || 200;
  let state = normalize(options.state || 'stopped');

  const el = document.createElement('div');
  el.className = 'c-glyph';
  el.style.setProperty('--gdot', (size / UNITS_W).toFixed(2) + 'px');
  el.dataset.state = state;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'status: ' + state);

  for (const row of PATTERN) {
    for (const v of row) {
      const d = document.createElement('span');
      d.className = v === 2 ? 'gd gs' : (v === 1 ? 'gd gw' : 'gd');
      if (v === 2) {
        const glow = document.createElement('i');
        glow.className = 'gglow';
        d.appendChild(glow);
      }
      el.appendChild(d);
    }
  }

  if (options.autoplay === false) el.classList.add('paused');
  target.appendChild(el);

  // Fallback: if the inherited colour resolved to the UA default
  // (pure black) over a dark backdrop — i.e. the host page never set
  // `color` — default to paper-white so the mark can't vanish.
  // Evaluated once at mount; backgrounds set by image or non-rgb()
  // syntax are treated as light (no override) — the UA canvas is
  // white, so an unresolved backdrop must be presumed light.
  if (getComputedStyle(el).color === 'rgb(0, 0, 0)') {
    let bg = '';
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const b = getComputedStyle(n).backgroundColor;
      if (b && b !== 'transparent' && b !== 'rgba(0, 0, 0, 0)') { bg = b; break; }
    }
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(bg);
    const lum = m ? (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) : 255;
    if (lum < 100) el.style.color = '#f5f5f5';
  }

  return {
    el,
    setState(next) {
      state = normalize(next);
      el.dataset.state = state;          // instant cut — states are events
      el.setAttribute('aria-label', 'status: ' + state);
    },
    pause() { el.classList.add('paused'); },
    play() { el.classList.remove('paused'); },
    destroy() { el.remove(); },
  };
}
