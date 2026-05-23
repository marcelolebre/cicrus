/* ============================================================
   ICARUS — Identity exploration
   
   One concept, executed with precision and shown in the lockups
   an identity actually needs.

   Wordmark · lowercase "icarus" in Space Grotesk Light, wide
   tracked. The dot of the "i" is replaced by a perfectly round
   solar disc — the only ornament.

   Mark · a circle (sun) tangent to a single horizontal line
   (horizon / trajectory / wing — intentionally ambiguous). The
   point of contact is the design moment.

   All measurements are derived from a single base size so the
   marks scale cleanly. Stroke widths are tuned per scale.
   ============================================================ */

const PHI = (1 + Math.sqrt(5)) / 2; // golden ratio, used sparingly

// ────────────────────────────────────────────────────────────
// PICTORIAL MARK · sun + horizon, geometrically constructed
// ────────────────────────────────────────────────────────────
// Layout: a filled circle of radius R sits with its bottom
// edge exactly on a horizontal stroke that extends φ·R beyond
// the circle on each side (so total line width = 2R + 2φR).
// All in SVG units; outer size scales via width/height.
function MarkPrimary({
  size = 200,        // displayed width in CSS px
  ratio = 1.6,       // aspect ratio (width / height)
  sun = 'currentColor',
  line = 'currentColor',
  lineWeight = 0.6,  // in SVG units relative to circle radius
}) {
  const R = 12;
  const ext = R * PHI;             // line extension past circle
  const totalW = 2 * R + 2 * ext;  // ≈ 62.83
  const totalH = 2 * R + R * 0.4;  // a touch of headroom below for breathing
  // Center the circle horizontally; bottom at y = 2R
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`}
         width={size} height={size / ratio}
         preserveAspectRatio="xMidYMid meet"
         aria-label="Icarus mark — sun on horizon"
         style={{ overflow: 'visible' }}>
      <circle cx={totalW / 2} cy={R} r={R} fill={sun} />
      <line x1={0} y1={2 * R} x2={totalW} y2={2 * R}
            stroke={line} strokeWidth={lineWeight}
            strokeLinecap="butt" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Hollow variant — outline only. For places where filled sun
// would be too heavy (e.g. tiny app-icon corner, or as a watermark).
function MarkOutline({ size = 200, ratio = 1.6, color = 'currentColor' }) {
  const R = 12;
  const ext = R * PHI;
  const totalW = 2 * R + 2 * ext;
  const totalH = 2 * R + R * 0.4;
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`}
         width={size} height={size / ratio}
         preserveAspectRatio="xMidYMid meet"
         aria-label="Icarus mark — outline" style={{ overflow: 'visible' }}>
      <circle cx={totalW / 2} cy={R} r={R - 0.4}
              fill="none" stroke={color} strokeWidth="0.8"
              vectorEffect="non-scaling-stroke" />
      <line x1={0} y1={2 * R} x2={totalW} y2={2 * R}
            stroke={color} strokeWidth="0.6"
            vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// WORDMARK · lowercase "icarus" with custom sun-dot above the i
// ────────────────────────────────────────────────────────────
// Built as HTML so the metrics come from the live font (Space
// Grotesk Light). We use a dotless ı (U+0131) for the stem and
// position a perfect circle above it. Dot diameter and position
// are tuned per font size via a single derived ratio.
//
// Critical: the dot is OFFSET LEFT slightly to sit optically on
// the stem (live font metrics put it ~52% across the dotless ı
// glyph at this weight; we use 50% and adjust by an em-relative
// nudge).
function Wordmark({
  size = 96,            // font-size in px
  color = 'currentColor',
  background = null,    // optional bg behind the dot to mask the original
  weight = 300,
  tracking = '0.04em',  // letter-spacing
  dotScale = 0.20,      // dot diameter as fraction of em
  dotLift = 0.86,       // dot center distance above baseline, in em
  dotNudge = 0,         // horizontal nudge in em (positive = right)
}) {
  const dotD = size * dotScale;
  return (
    <span style={{
      fontFamily: 'var(--font-body)',
      fontWeight: weight,
      fontSize: `${size}px`,
      letterSpacing: tracking,
      lineHeight: 1,
      color,
      display: 'inline-flex',
      alignItems: 'baseline',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        position: 'relative',
        display: 'inline-block',
        letterSpacing: 0,  // critical: stop parent tracking from inflating the stem box
      }}>
        {/* dotless ı — U+0131 — provides the stem with no glyph dot */}
        ı
        <span style={{
          position: 'absolute',
          left: `calc(50% + ${dotNudge}em)`,
          bottom: `${dotLift}em`,
          width: `${dotD}px`,
          height: `${dotD}px`,
          borderRadius: '50%',
          background: color,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
      </span>
      <span>carus</span>
    </span>
  );
}

// All-caps wordmark — when the lockup needs the i-dot trick to
// translate up to capitals, we use a normal I and place the dot
// above the capital's apex instead. Wider tracking, heavier feel.
function WordmarkCaps({
  size = 64,
  color = 'currentColor',
  weight = 400,
  tracking = '0.32em',
  dotScale = 0.13,
  dotLift = 1.18,
}) {
  const dotD = size * dotScale;
  return (
    <span style={{
      fontFamily: 'var(--font-body)',
      fontWeight: weight,
      fontSize: `${size}px`,
      letterSpacing: tracking,
      lineHeight: 1,
      color,
      display: 'inline-flex',
      alignItems: 'baseline',
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
    }}>
      <span style={{
        position: 'relative',
        display: 'inline-block',
        letterSpacing: 0,  // critical: parent's wide tracking would push 50% off the stem
      }}>
        I
        <span style={{
          position: 'absolute',
          left: '50%',
          bottom: `${dotLift}em`,
          width: `${dotD}px`,
          height: `${dotD}px`,
          borderRadius: '50%',
          background: color,
          transform: 'translateX(-50%)',
        }} />
      </span>
      <span>carus</span>
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// COMPOSITIONS
// ────────────────────────────────────────────────────────────

function Tag({ children, color }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: color || 'inherit',
      opacity: 0.55,
    }}>{children}</span>
  );
}

function Hair({ width = 36, color = 'currentColor', opacity = 0.4 }) {
  return <span style={{
    display: 'inline-block', width, height: 1,
    background: color, opacity,
  }} />;
}

/* ── 01 — Primary lowercase wordmark, hero scale ─────────── */
function PrimaryHero() {
  return (
    <div className="ls">
      <Wordmark size={144} />
    </div>
  );
}

/* ── 02 — Lockup: pictorial mark above the wordmark ──────── */
function StackedLockup() {
  return (
    <div className="ls">
      <div className="col" style={{ gap: 36 }}>
        <MarkPrimary size={220} />
        <Wordmark size={72} />
      </div>
    </div>
  );
}

/* ── 03 — Horizontal lockup with hairline divider ────────── */
function HorizontalLockup() {
  return (
    <div className="ls">
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <MarkPrimary size={120} />
        <span style={{
          width: 1, height: 56, background: 'currentColor',
          opacity: 0.25,
        }} />
        <Wordmark size={64} />
      </div>
    </div>
  );
}

/* ── 04 — Caps wordmark with sun above the I ─────────────── */
function CapsLockup() {
  return (
    <div className="ls ls--surface">
      <div className="col" style={{ gap: 24 }}>
        <WordmarkCaps size={64} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Hair width={48} />
          <Tag>An operator console</Tag>
          <Hair width={48} />
        </div>
      </div>
    </div>
  );
}

/* ── 05 — App icon — mark in a perfect square, paper ground ─ */
function AppIconLight() {
  return (
    <div className="ls" style={{ padding: 0, background: 'transparent' }}>
      <div style={{
        width: 220, height: 220, background: '#F2EFE7',
        borderRadius: 44, display: 'grid', placeItems: 'center',
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        color: '#0A0A0A',
      }}>
        <MarkPrimary size={150} />
      </div>
    </div>
  );
}

/* ── 06 — App icon — sun field, dark ground ──────────────── */
function AppIconDark() {
  return (
    <div className="ls" style={{ padding: 0, background: 'transparent' }}>
      <div style={{
        width: 220, height: 220, background: '#0A0A0A',
        borderRadius: 44, display: 'grid', placeItems: 'center',
        color: '#F2EFE7',
      }}>
        <MarkPrimary size={150} />
      </div>
    </div>
  );
}

/* ── 07 — Stamp / spec plate ─────────────────────────────── */
function StampPlate() {
  return (
    <div className="ls ls--paper">
      <div style={{
        border: '1px solid #0A0A0A', padding: '22px 26px',
        display: 'flex', flexDirection: 'column', gap: 16,
        minWidth: 360, color: '#0A0A0A',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6,
        }}>
          <span>EST · MMXXVI</span>
          <span>OPS — 01</span>
        </div>
        <Wordmark size={64} />
        <div style={{ height: 1, background: '#0A0A0A' }}></div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', gap: 12,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#0A0A0A', opacity: 0.75, lineHeight: 1.5,
          }}>
            A console for<br/>the Cicrus system
          </div>
          <MarkPrimary size={64} />
        </div>
      </div>
    </div>
  );
}

/* ── 08 — Light-mode primary — paper ground ──────────────── */
function PrimaryLight() {
  return (
    <div className="ls ls--paper" style={{ color: '#0A0A0A' }}>
      <div className="col" style={{ gap: 30 }}>
        <MarkPrimary size={200} />
        <Wordmark size={64} color="#0A0A0A" />
      </div>
    </div>
  );
}

/* ── 09 — Inline meta lockup — for navbars & topbars ─────── */
function NavLockup() {
  return (
    <div className="ls">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 24px', border: '1px solid var(--border)',
        borderRadius: 999, background: 'var(--surface)',
      }}>
        <MarkPrimary size={28} />
        <Wordmark size={20} dotScale={0.22} dotLift={0.88} tracking="0.06em" />
        <span style={{
          width: 1, height: 14, background: 'var(--border-visible)',
          opacity: 0.6,
        }} />
        <Tag>OPS · 01</Tag>
      </div>
    </div>
  );
}

/* ── 10 — Scale study — same mark at 5 sizes ─────────────── */
function ScaleStudy() {
  const sizes = [240, 140, 80, 44, 24];
  return (
    <div className="ls">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
        {sizes.map(s => (
          <div key={s} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 14,
          }}>
            <MarkPrimary size={s} />
            <Tag>{s}px</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 11 — Construction drawing — exposed geometry ─────────── */
function ConstructionDrawing() {
  const R = 12, ext = R * PHI;
  const totalW = 2 * R + 2 * ext;
  const cx = totalW / 2, cy = R;
  return (
    <div className="ls">
      <svg viewBox={`-4 -4 ${totalW + 8} ${2 * R + R + 6}`} width="440"
           style={{ color: 'var(--text-disabled)', overflow: 'visible' }}>
        {/* Construction grid */}
        <g stroke="currentColor" strokeWidth="0.15" opacity="0.5" fill="none"
           vectorEffect="non-scaling-stroke">
          {/* Centerlines */}
          <line x1={cx} y1={-2} x2={cx} y2={2*R + 4} strokeDasharray="0.6 0.6" />
          <line x1={-2} y1={cy} x2={totalW + 2} y2={cy} strokeDasharray="0.6 0.6" />
          {/* Radius indicator */}
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} />
          <line x1={cx + R} y1={cy - 1} x2={cx + R} y2={cy + 1} />
        </g>
        {/* The mark itself, drawn in foreground colour */}
        <circle cx={cx} cy={cy} r={R} fill="var(--text-display)" />
        <line x1={0} y1={2*R} x2={totalW} y2={2*R}
              stroke="var(--text-display)" strokeWidth="0.6"
              vectorEffect="non-scaling-stroke" />
        {/* Dimension tags */}
        <g fontFamily="var(--font-mono)" fontSize="2"
           fill="var(--text-disabled)" letterSpacing="0.04em">
          <text x={cx + R + 1} y={cy + 0.6}>r</text>
          <text x={cx - 1.5} y={-1}>φ · r</text>
          <text x={totalW + 1} y={2*R}>tangent</text>
        </g>
      </svg>
    </div>
  );
}

/* ── 12 — Wordmark — Space Mono variant ──────────────────── */
function WordmarkMono() {
  return (
    <div className="ls">
      <div className="col" style={{ gap: 22 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontWeight: 400,
          fontSize: 56, letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'var(--text-display)',
          display: 'inline-flex', alignItems: 'baseline',
        }}>
          <span style={{ position: 'relative', display: 'inline-block', letterSpacing: 0 }}>
            I
            <span style={{
              position: 'absolute',
              left: '50%', bottom: '1.18em',
              width: 8, height: 8, borderRadius: '50%',
              background: 'currentColor',
              transform: 'translateX(-50%)',
            }} />
          </span>
          <span>CARUS</span>
        </span>
        <Tag>SPACE MONO · ALTERNATE</Tag>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// EXPOSE
// ────────────────────────────────────────────────────────────
Object.assign(window, {
  // marks
  MarkPrimary, MarkOutline,
  // wordmarks
  Wordmark, WordmarkCaps,
  // compositions
  PrimaryHero, StackedLockup, HorizontalLockup, CapsLockup,
  AppIconLight, AppIconDark, StampPlate, PrimaryLight,
  NavLockup, ScaleStudy, ConstructionDrawing, WordmarkMono,
});
