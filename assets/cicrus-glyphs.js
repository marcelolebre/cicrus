// cicrus state glyphs — pixel-grid canvas renderers in the cicrus
// instrument-panel aesthetic. Three states of one "thinking object"
// entity: idle, thinking, error.
//
// Math and tuning ported verbatim from the cicrus_glyphs.html prototype.
// The exact frequencies, phases, amplitudes, and thresholds are the
// design — do not "clean up" or unify constants.

const TAU = Math.PI * 2;
const PHI_GOLD = Math.PI * (1 + Math.sqrt(5));
const GRID = 96;
const CELL = 2;
const SIZE = GRID * CELL;
const DOT = 2, DOT_OFF = 0;
const HALF = GRID / 2;

const COLORS = {
  paper: [240, 237, 224],   // thinking
  alarm: [255, 92, 92],     // error
};
const BG_RGB = [6, 6, 6];   // #060606 — fixed backing for thinking/error

// ────────────────────────────────────────────────────────────
// Shared utilities
// ────────────────────────────────────────────────────────────

// Heartbeat envelope: lub-dub then rest. One full beat per period.
// Returns intensity multiplier in [0, 1].
function heartbeat(t, period) {
  const ph = (t % period) / period;
  // Lub: sharp peak around ph=0.06, narrow.
  const lub = Math.exp(-Math.pow((ph - 0.06) / 0.035, 2));
  // Dub: smaller peak around ph=0.20, slightly wider.
  const dub = 0.55 * Math.exp(-Math.pow((ph - 0.20) / 0.055, 2));
  return Math.min(1, lub + dub);
}

function quantize(v) { return Math.round(v * 8) / 8; }

// Contrast lift applied to intensity before alpha quantization. Faint
// pixels (silhouette edge, atmospheric glow, ring tail-offs) are dim
// enough to disappear into both dark (#000) and light (#F5F5F5) page
// backgrounds at the raw intensity. A gamma < 1 brightens mid/low
// values without crushing highlights — pixels at intensity 0.10
// (the visibility threshold) lift to ~0.20, while peaks near 1.0
// stay at 1.0. Tunes how much "atmospheric haze" survives:
// lower = more solid, higher = more ghostly.
const CONTRAST_GAMMA = 0.7;

// Swirl axis as a 3D unit vector that drifts slowly over time.
function swirlAxis(t, t0, ph) {
  const tt = t * t0 * TAU + ph;
  const x = Math.sin(tt) * 0.6 + Math.sin(tt * 1.3) * 0.2;
  const y = 0.5 + Math.cos(tt * 0.6) * 0.4;
  const z = Math.cos(tt) * 0.6 + Math.cos(tt * 1.7) * 0.2;
  const L = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / L, y / L, z / L];
}

// Orthonormal basis (u, v) perpendicular to a given axis. Used to
// express body-local positions as (longitude_around_axis, latitude).
function basis(ax, ay, az) {
  let upx = 0, upy = 1, upz = 0;
  if (Math.abs(ay) > 0.95) { upx = 1; upy = 0; }
  // u = normalize(up × axis)
  let ux = upy * az - upz * ay;
  let uy = upz * ax - upx * az;
  let uz = upx * ay - upy * ax;
  const ulen = Math.sqrt(ux*ux + uy*uy + uz*uz) || 1;
  ux /= ulen; uy /= ulen; uz /= ulen;
  // v = axis × u
  const vx = ay * uz - az * uy;
  const vy = az * ux - ax * uz;
  const vz = ax * uy - ay * ux;
  return [ux, uy, uz, vx, vy, vz];
}

// Fractal lightning bolt via midpoint displacement. Starts with three
// anchors — the two endpoints and a midpoint pulled toward (cx, cy)
// by `curveAmt` so the bolt arcs across the ring's interior — then
// recursively subdivides each segment, perturbing each new midpoint
// perpendicular to its segment by an amount that decays per level.
// The result is a fixed jagged polyline with sharp angular jags at
// multiple scales. Generated once at spawn time, frozen for the bolt's
// lifetime — the flicker envelope only modulates intensity, not shape.
function generateBolt(p1x, p1y, p2x, p2y, cx, cy, curveAmt, initialDisp, levels) {
  const mx0 = (p1x + p2x) / 2;
  const my0 = (p1y + p2y) / 2;
  let pts = [
    { x: p1x, y: p1y },
    { x: mx0 + (cx - mx0) * curveAmt, y: my0 + (cy - my0) * curveAmt },
    { x: p2x, y: p2y },
  ];
  for (let lvl = 0; lvl < levels; lvl++) {
    const d = initialDisp * Math.pow(0.55, lvl);
    const next = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      next.push(a);
      const sdx = b.x - a.x, sdy = b.y - a.y;
      const slen = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
      const off = (Math.random() - 0.5) * 2 * d;
      next.push({
        x: (a.x + b.x) / 2 + (-sdy / slen) * off,
        y: (a.y + b.y) / 2 + (sdx / slen) * off,
      });
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

// Rasterize a polyline as a 1-cell-wide thin line by stepping each
// segment at 0.5-cell intervals and depositing a single dot per cell.
// Same max-blend as everywhere else: keeps the brightest sample at
// each cell index.
function rasterizeLine(ax, ay, bx, by, intensity, intensities) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return;
  const steps = Math.max(1, Math.ceil(len * 2));
  for (let s = 0; s <= steps; s++) {
    const u = s / steps;
    const ix = Math.round(ax + dx * u);
    const iy = Math.round(ay + dy * u);
    if (ix < 0 || ix >= GRID || iy < 0 || iy >= GRID) continue;
    const idx = iy * GRID + ix;
    if (intensity > intensities[idx]) intensities[idx] = intensity;
  }
}

// Seeded LCG — used at module load time to build deterministic
// particle pools and fragment layouts. Each pool gets its own seed
// so they don't share PRNG state.
function makeRand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ────────────────────────────────────────────────────────────
// IDLE — continuously wobbling putty blob (signed distance field)
//
//   Rendered as a continuous shape field, not particles. The surface
//   is the sum of: multi-frequency ripples, three traveling 3D bulges
//   that drift across the body, a slowly rotating squash axis, an
//   off-center pull that breaks symmetry, and a wobble drive built
//   from three non-commensurate sines (7.3s / 4.1s / 2.7s) with a
//   guaranteed floor — so the surface tension never goes silent.
//   Soap-bubble-in-wind: always asymmetric, always wobbling, varying
//   in intensity but never still. The dot color follows the host
//   page's inherited text color automatically (mode-aware).
// ────────────────────────────────────────────────────────────
const IDLE_R = 18;

function updateIdle(t, scene) {
  const intensities = scene.intensities;

  // ── Continuous wobble drive ──
  // Three non-commensurate sines (periods 7.3s, 4.1s, 2.7s), each in [0,1].
  // The 0.45 floor on totalTension guarantees the wobble never stops.
  const wobble1 = (1 + Math.sin(t * TAU / 7.3)) * 0.5;
  const wobble2 = (1 + Math.sin(t * TAU / 4.1)) * 0.5;
  const wobble3 = (1 + Math.sin(t * TAU / 2.7)) * 0.5;
  const totalTension = 0.55 + wobble1 * 0.75 + wobble2 * 0.65 + wobble3 * 0.45;
  const pullStrength = totalTension * 0.42;
  const bulgeMult = 1.2 + totalTension * 0.85;
  const squashMult = 1.4 + totalTension * 0.85;

  // ── Whole-body slosh translation (deeper, asymmetric) ──
  const sloshX = Math.sin(t * 0.05 * TAU) * 1.4 + Math.sin(t * 0.07 * TAU + 1.2) * 0.9;
  const sloshY = Math.sin(t * 0.06 * TAU + 2.0) * 1.4 + Math.cos(t * 0.04 * TAU) * 0.8;

  // ── Body breath (more dramatic) ──
  const breath =
    1 +
    Math.sin(t * 0.10 * TAU) * 0.22 +
    Math.sin(t * 0.17 * TAU + 0.7) * 0.08;
  const radius = IDLE_R * breath;
  const projR = radius * 1.6;

  // ── Light direction (screen frame, normalized) ──
  const LX = -0.40, LY = -0.45, LZ = 0.80;
  const Llen = Math.sqrt(LX*LX + LY*LY + LZ*LZ);
  const lx = LX / Llen, ly = LY / Llen, lz = LZ / Llen;

  // ── Surface ripple time multipliers ──
  const dt1 = t * 0.10;
  const dt2 = t * 0.14;
  const dt3 = t * 0.08;

  // ── Three traveling 3D bulges (each direction drifts independently) ──
  const [b1x, b1y, b1z] = swirlAxis(t, 0.04, 0.0);
  const [b2x, b2y, b2z] = swirlAxis(t, 0.05, 2.1);
  const [b3x, b3y, b3z] = swirlAxis(t, 0.07, 4.3);
  const B1_S = 0.20, B1_W = 0.70;
  const B2_S = 0.16, B2_W = 0.85;
  const B3_S = 0.14, B3_W = 0.95;
  const B1_K = 1 / (B1_W * B1_W * 0.5);
  const B2_K = 1 / (B2_W * B2_W * 0.5);
  const B3_K = 1 / (B3_W * B3_W * 0.5);

  // ── Drifting squash axis ──
  const [sax, say, saz] = swirlAxis(t, 0.08, 1.3);
  const squashFactor = Math.sin(t * 0.12 * TAU) * 0.16;

  // ── Off-center pull (3D direction drifts at 0.06 / 0.09 Hz) ──
  const pt1 = t * 0.06 * TAU;
  const pt2 = t * 0.09 * TAU;
  let pullX = Math.sin(pt1) * 0.7 + Math.sin(pt2 + 1.1) * 0.3;
  let pullY = Math.cos(pt2) * 0.7 + Math.sin(pt1 + 0.5) * 0.3;
  let pullZ = Math.cos(pt1 + 1.7) * 0.5 + Math.cos(pt2 * 1.3) * 0.5;
  const pLen = Math.sqrt(pullX*pullX + pullY*pullY + pullZ*pullZ) || 1;
  pullX /= pLen; pullY /= pLen; pullZ /= pLen;

  // ── Bbox (covers bulged surface + atmospheric glow) ──
  const cxC = HALF + sloshX;
  const cyC = HALF + sloshY;
  const bbox = Math.ceil(radius * (1 + 0.85) + 3);

  for (let gy = Math.max(0, Math.floor(cyC - bbox)); gy < Math.min(GRID, Math.ceil(cyC + bbox)); gy++) {
    for (let gx = Math.max(0, Math.floor(cxC - bbox)); gx < Math.min(GRID, Math.ceil(cxC + bbox)); gx++) {
      const dx = gx + 0.5 - cxC;
      const dy = gy + 0.5 - cyC;
      const r2D = Math.sqrt(dx * dx + dy * dy);

      const xN = dx / projR;
      const yN = dy / projR;
      const r2N = xN * xN + yN * yN;
      if (r2N > 1.15) continue;
      const zN = r2N < 1 ? Math.sqrt(1 - r2N) : 0;

      // ── Surface ripples (low-frequency only — high freq aliases with cell grid) ──
      const ripples =
        Math.sin(xN * 0.9 + dt1) * Math.cos(yN * 0.8 - dt1 * 0.7) * 0.10 +
        Math.sin(zN * 1.1 + dt2 * 0.9) * 0.08 +
        Math.cos(xN * 1.3 - yN * 1.0 + dt3) * 0.06 +
        Math.sin((xN + yN + zN) * 0.7 + dt2 * 1.3) * 0.05;

      // ── Three traveling bulges (only contribute on the near hemisphere) ──
      const d1 = xN * b1x + yN * b1y + zN * b1z;
      const d2 = xN * b2x + yN * b2y + zN * b2z;
      const d3 = xN * b3x + yN * b3y + zN * b3z;
      let bulges = 0;
      if (d1 > 0) bulges += B1_S * Math.exp(-(1 - d1) * (1 - d1) * B1_K);
      if (d2 > 0) bulges += B2_S * Math.exp(-(1 - d2) * (1 - d2) * B2_K);
      if (d3 > 0) bulges += B3_S * Math.exp(-(1 - d3) * (1 - d3) * B3_K);

      // ── Drifting squash ──
      const axisDot = xN * sax + yN * say + zN * saz;
      const squash = squashFactor * (axisDot * axisDot - 0.5);

      // ── Off-center pull ──
      const pullDot = xN * pullX + yN * pullY + zN * pullZ;
      const pull = pullDot * pullStrength;

      const def = ripples + bulges * bulgeMult + squash * squashMult + pull;
      const surfaceR = radius * (1 + def);
      const fieldDist = r2D - surfaceR;

      let intensity;
      if (fieldDist < -6.6) {
        const innerF = (-fieldDist - 6.6) / radius;
        intensity = 0.62 - innerF * 0.18;
      } else if (fieldDist < 0) {
        const tFD = -fieldDist / 6.6;
        intensity = 0.62 + (1 - tFD) * 0.18;
      } else {
        if (fieldDist / 4.8 > 1) continue;
        intensity = 0.80 * Math.exp(-fieldDist * fieldDist * 0.10);
      }

      // ── Lambertian shading ──
      const lambert = Math.max(0, xN * lx + yN * ly + zN * lz);
      const diffuse = Math.pow(lambert, 0.85);
      const ambient = 0.32;
      const shading = ambient + (1 - ambient) * diffuse;
      intensity *= shading;

      // ── Specular highlight ──
      if (lambert > 0.85) {
        intensity += Math.pow((lambert - 0.85) / 0.15, 2.5) * 0.18;
      }

      // ── Rim darkening ──
      intensity *= 0.78 + 0.22 * Math.pow(zN, 0.6);

      // ── Internal flow boost (only inside surface) ──
      if (fieldDist < 0) {
        const surfaceFlow =
          Math.sin(xN * 3.0 + dt1 * 1.2) * Math.cos(yN * 2.5 - dt2) +
          Math.sin(zN * 2.8 + dt2 * 0.8) * 0.7;
        if (surfaceFlow > 0.4) {
          intensity += Math.pow((surfaceFlow - 0.4) / 1.3, 1.4) * 0.16 * shading;
        }
      }

      if (intensity > 1) intensity = 1;
      if (intensity < 0.04) continue;
      const idx = gy * GRID + gx;
      if (intensity > intensities[idx]) intensities[idx] = intensity;
    }
  }
}

// ────────────────────────────────────────────────────────────
// THINKING — Siri water globe with heartbeat ring
//
//   Body: a volume of particles inside a sphere that sloshes
//   together like water in a glass orb (whole-body translation,
//   slow rotation, tiny per-particle wobble).
//
//   Ring: a fine circular outline tracing the silhouette of the
//   sphere, ink-like — uneven thickness. Pulses on a heartbeat
//   rhythm: sharp lub, smaller dub, then rest. Inspired by the
//   Arrival logogram.
// ────────────────────────────────────────────────────────────
const THINK_R = 24;
const THINK_N = 2400;

const THINK_PARTICLES = (() => {
  const arr = [];
  const rand = makeRand(91);
  for (let i = 0; i < THINK_N; i++) {
    const yNorm = 1 - 2 * (i + 0.5) / THINK_N;
    const ringR = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    const theta = PHI_GOLD * i;
    const u = rand();
    const r = 0.55 + Math.pow(u, 0.7) * 0.45;
    arr.push({
      hx: Math.cos(theta) * ringR * r,
      hy: yNorm * r,
      hz: Math.sin(theta) * ringR * r,
      wFreqX: 0.3 + rand() * 0.5,
      wFreqY: 0.3 + rand() * 0.5,
      wFreqZ: 0.3 + rand() * 0.5,
      wPhaseX: rand() * TAU,
      wPhaseY: rand() * TAU,
      wPhaseZ: rand() * TAU,
      tFreq: 0.20 + rand() * 0.50,
      tPhase: rand() * TAU,
      x: 0, y: 0, z: 0,
      bx: 0, by: 0, bz: 0,
    });
  }
  return arr;
})();

function updateThinking(t, scene, dt) {
  const intensities = scene.intensities;
  const ps = THINK_PARTICLES;

  // ── Body slosh (whole-body translation in 3D) ──
  const sloshX = Math.sin(t * 0.13 * TAU) * 0.13 + Math.sin(t * 0.07 * TAU) * 0.06;
  const sloshY = Math.sin(t * 0.10 * TAU + 1.2) * 0.13 + Math.sin(t * 0.17 * TAU) * 0.06;
  const sloshZ = Math.sin(t * 0.11 * TAU + 2.4) * 0.13 + Math.sin(t * 0.06 * TAU) * 0.06;

  const yaw = t * 0.05 * TAU;
  const pitch = Math.sin(t * 0.07 * TAU) * 0.18;
  const roll = Math.cos(t * 0.06 * TAU) * 0.12;
  const cyA = Math.cos(yaw), syA = Math.sin(yaw);
  const cpA = Math.cos(pitch), spA = Math.sin(pitch);
  const crA = Math.cos(roll), srA = Math.sin(roll);

  const breath = 1 + Math.sin(t * 0.09 * TAU) * 0.04;

  const LX = -0.40, LY = -0.45, LZ = 0.80;
  const Llen = Math.sqrt(LX*LX + LY*LY + LZ*LZ);
  const lx = LX / Llen, ly = LY / Llen, lz = LZ / Llen;

  for (const p of ps) {
    const wx = Math.sin(t * p.wFreqX * TAU + p.wPhaseX) * 0.025;
    const wy = Math.cos(t * p.wFreqY * TAU + p.wPhaseY) * 0.025;
    const wz = Math.sin(t * p.wFreqZ * TAU + p.wPhaseZ) * 0.025;

    const bx = (p.hx + wx) * breath;
    const by = (p.hy + wy) * breath;
    const bz = (p.hz + wz) * breath;
    p.bx = bx; p.by = by; p.bz = bz;

    let rx = bx, ry = by, rz = bz;
    let xn = rx * crA - ry * srA;
    let yn = rx * srA + ry * crA;
    rx = xn; ry = yn;
    yn = ry * cpA - rz * spA;
    let zn = ry * spA + rz * cpA;
    ry = yn; rz = zn;
    xn = rx * cyA + rz * syA;
    zn = -rx * syA + rz * cyA;
    rx = xn; rz = zn;

    p.x = rx + sloshX;
    p.y = ry + sloshY;
    p.z = rz + sloshZ;
  }

  const [s1ax, s1ay, s1az] = swirlAxis(t, 0.04, 0.0);
  const [s2ax, s2ay, s2az] = swirlAxis(t, 0.05, 1.7);
  const [s3ax, s3ay, s3az] = swirlAxis(t, 0.03, 3.4);

  const [u1x, u1y, u1z, v1x, v1y, v1z] = basis(s1ax, s1ay, s1az);
  const [u2x, u2y, u2z, v2x, v2y, v2z] = basis(s2ax, s2ay, s2az);
  const [u3x, u3y, u3z, v3x, v3y, v3z] = basis(s3ax, s3ay, s3az);

  const swirl1Phase = t * 0.45;
  const swirl2Phase = -t * 0.32;
  const swirl3Phase = t * 0.55;

  for (const p of ps) {
    const px = (HALF + p.x * THINK_R) | 0;
    const py = (HALF + p.y * THINK_R) | 0;
    if (px < 0 || px >= GRID || py < 0 || py >= GRID) continue;

    const lenL = Math.sqrt(p.bx * p.bx + p.by * p.by + p.bz * p.bz) || 1;
    const ux_ = p.bx / lenL, uy_ = p.by / lenL, uz_ = p.bz / lenL;

    const lenR = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
    const nrx = p.x / lenR, nry = p.y / lenR, nrz = p.z / lenR;
    const lambert = Math.max(0, nrx * lx + nry * ly + nrz * lz);
    const ambient = 0.18;
    const shading = ambient + (1 - ambient) * lambert;

    const s1lat = ux_ * s1ax + uy_ * s1ay + uz_ * s1az;
    const s1lonU = ux_ * u1x + uy_ * u1y + uz_ * u1z;
    const s1lonV = ux_ * v1x + uy_ * v1y + uz_ * v1z;
    const s1lon = Math.atan2(s1lonV, s1lonU);
    const s1band = Math.cos(s1lat * 4.0 + s1lon * 1.5 + swirl1Phase);
    const s1strength = Math.pow(Math.max(0, s1band), 4) * 0.55;

    const s2lat = ux_ * s2ax + uy_ * s2ay + uz_ * s2az;
    const s2lonU = ux_ * u2x + uy_ * u2y + uz_ * u2z;
    const s2lonV = ux_ * v2x + uy_ * v2y + uz_ * v2z;
    const s2lon = Math.atan2(s2lonV, s2lonU);
    const s2band = Math.cos(s2lat * 3.0 + s2lon * 2.0 + swirl2Phase);
    const s2strength = Math.pow(Math.max(0, s2band), 5) * 0.45;

    const s3lat = ux_ * s3ax + uy_ * s3ay + uz_ * s3az;
    const s3lonU = ux_ * u3x + uy_ * u3y + uz_ * u3z;
    const s3lonV = ux_ * v3x + uy_ * v3y + uz_ * v3z;
    const s3lon = Math.atan2(s3lonV, s3lonU);
    const s3band = Math.cos(s3lat * 2.5 + s3lon * 1.0 + swirl3Phase);
    const s3strength = Math.pow(Math.max(0, s3band), 4) * 0.40;

    const twinkle = 0.05 * (0.5 + 0.5 * Math.sin(t * p.tFreq * 0.5 * TAU + p.tPhase));

    let intensity = shading * 0.42 + s1strength + s2strength + s3strength + twinkle;

    if (intensity > 1) intensity = 1;
    if (intensity < 0.10) continue;
    const idx = py * GRID + px;
    if (intensity > intensities[idx]) intensities[idx] = intensity;
  }

  // ── Heartbeat ring with traveling pulse and energy field ──
  const cx = HALF + sloshX * THINK_R;
  const cy = HALF + sloshY * THINK_R;
  const ringR = (THINK_R + 14) * breath;

  const beat = heartbeat(t, 1.4);

  if (!scene.thinkRing) {
    scene.thinkRing = {
      pulseAngle: Math.random() * TAU,
      pulseSpeed: 1.6,
      pulseSpeedTarget: 1.6,
      nextSpeedChange: 1.0,
      sparks: [],
      nextSparkT: 0.3,
      arcs: [],
      nextArcT: 1.5,
    };
  }
  const ring = scene.thinkRing;
  if (t > ring.nextSpeedChange) {
    ring.pulseSpeedTarget = 1.0 + Math.random() * 1.6;
    if (Math.random() < 0.18) ring.pulseSpeedTarget *= -1;
    ring.nextSpeedChange = t + 1.0 + Math.random() * 1.5;
  }
  ring.pulseSpeed += (ring.pulseSpeedTarget - ring.pulseSpeed) * Math.min(1, dt * 1.2);
  ring.pulseAngle += ring.pulseSpeed * dt;
  const pulseAngle = ring.pulseAngle;
  const pulseWidth = 0.55;

  // Sparks
  if (t > ring.nextSparkT) {
    const ang = pulseAngle + (Math.random() - 0.5) * 0.4;
    const startX = cx + Math.cos(ang) * ringR;
    const startY = cy + Math.sin(ang) * ringR;
    const radialX = Math.cos(ang);
    const radialY = Math.sin(ang);
    const tangX = -Math.sin(ang);
    const tangY = Math.cos(ang);
    const outDir = Math.random() < 0.7 ? 1 : -1;
    const tangComp = (Math.random() - 0.5) * 0.6;
    const speed = 16 + Math.random() * 16;
    ring.sparks.push({
      x: startX, y: startY,
      vx: (radialX * outDir + tangX * tangComp) * speed,
      vy: (radialY * outDir + tangY * tangComp) * speed,
      life: 0,
      maxLife: 0.35 + Math.random() * 0.30,
      intensity: 0.65 + Math.random() * 0.25,
    });
    ring.nextSparkT = t + 0.04 + Math.random() * 0.10;
  }
  for (const sp of ring.sparks) {
    sp.life += dt;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.vx *= Math.exp(-1.4 * dt);
    sp.vy *= Math.exp(-1.4 * dt);
  }
  ring.sparks = ring.sparks.filter(sp => sp.life < sp.maxLife);

  // Arc lightning
  if (t > ring.nextArcT) {
    const a1 = Math.random() * TAU;
    const a2 = a1 + Math.PI * (0.4 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1);
    const p1x = cx + Math.cos(a1) * ringR;
    const p1y = cy + Math.sin(a1) * ringR;
    const p2x = cx + Math.cos(a2) * ringR;
    const p2y = cy + Math.sin(a2) * ringR;
    const curve = 0.35 + Math.random() * 0.25;
    const mainPath = generateBolt(p1x, p1y, p2x, p2y, cx, cy, curve, 2.0, 5);

    // Optional fork: branches off a random midpoint of the main bolt,
    // perpendicular to the local tangent, with a slight forward bias.
    const forks = [];
    if (Math.random() < 0.55) {
      const fIdx = Math.floor(mainPath.length * (0.30 + Math.random() * 0.35));
      const fStart = mainPath[fIdx];
      const fNext = mainPath[Math.min(fIdx + 4, mainPath.length - 1)];
      const tdx = fNext.x - fStart.x, tdy = fNext.y - fStart.y;
      const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
      const sign = Math.random() < 0.5 ? 1 : -1;
      const fLen = 6 + Math.random() * 12;
      const fEndX = fStart.x + (-tdy / tlen) * sign * fLen + (tdx / tlen) * fLen * 0.4;
      const fEndY = fStart.y + ( tdx / tlen) * sign * fLen + (tdy / tlen) * fLen * 0.4;
      forks.push(generateBolt(fStart.x, fStart.y, fEndX, fEndY, fStart.x, fStart.y, 0, 1.0, 3));
    }

    ring.arcs.push({
      spawnT: t,
      duration: 0.18 + Math.random() * 0.12,
      intensity: 0.75 + Math.random() * 0.25,
      mainPath,
      forks,
    });
    ring.nextArcT = t + 0.7 + Math.random() * 1.8;
  }
  ring.arcs = ring.arcs.filter(arc => t - arc.spawnT < arc.duration);

  // Halo
  const haloSteps = 80;
  const haloLevels = 4;
  for (let i = 0; i < haloSteps; i++) {
    const a = (i / haloSteps) * TAU;
    let dAng = a - pulseAngle;
    while (dAng > Math.PI) dAng -= TAU;
    while (dAng < -Math.PI) dAng += TAU;
    const pulseFall = Math.exp(-(dAng * dAng) / (pulseWidth * pulseWidth * 0.7));
    const localEnergy = 0.10 + beat * 0.18 + pulseFall * 0.45;
    if (localEnergy < 0.06) continue;
    const cosA = Math.cos(a), sinA = Math.sin(a);
    for (let lvl = 1; lvl <= haloLevels; lvl++) {
      const rOff = lvl * 2.26;
      const r = ringR + rOff;
      const px = cx + cosA * r;
      const py = cy + sinA * r;
      const ix = Math.round(px);
      const iy = Math.round(py);
      if (ix < 0 || ix >= GRID || iy < 0 || iy >= GRID) continue;
      const decay = Math.exp(-rOff * rOff * 0.30);
      const b = localEnergy * decay * 0.55;
      if (b < 0.10) continue;
      const idx = iy * GRID + ix;
      if (b > intensities[idx]) intensities[idx] = b;
    }
  }

  // Arc paths — render the precomputed jagged polyline as 1-cell-wide
  // line segments. The shape is fixed at spawn time; flicker only
  // modulates intensity.
  for (const arc of ring.arcs) {
    const age = t - arc.spawnT;
    const lifeProg = age / arc.duration;
    const flicker = lifeProg < 0.5
      ? Math.min(1, lifeProg * 4)
      : Math.pow(1 - (lifeProg - 0.5) * 2, 1.3);
    const arcB = arc.intensity * flicker;
    if (arcB < 0.10) continue;

    const main = arc.mainPath;
    for (let i = 0; i < main.length - 1; i++) {
      const a = main[i], b = main[i + 1];
      rasterizeLine(a.x, a.y, b.x, b.y, arcB, intensities);
    }
    const forkB = arcB * 0.65;
    if (forkB >= 0.10) {
      for (const fork of arc.forks) {
        for (let i = 0; i < fork.length - 1; i++) {
          const a = fork[i], b = fork[i + 1];
          rasterizeLine(a.x, a.y, b.x, b.y, forkB, intensities);
        }
      }
    }
  }

  // Sparks
  for (const sp of ring.sparks) {
    const lifeProg = sp.life / sp.maxLife;
    const fade = Math.pow(1 - lifeProg, 1.3);
    const b = sp.intensity * fade;
    if (b < 0.12) continue;
    const ix = Math.round(sp.x);
    const iy = Math.round(sp.y);
    if (ix < 0 || ix >= GRID || iy < 0 || iy >= GRID) continue;
    const idx = iy * GRID + ix;
    if (b > intensities[idx]) intensities[idx] = b;
  }

  // Ring with traveling pulse
  const STEPS = 580;
  const baseB = 0.14;
  const beatB = 0.30;
  const pulseB = 0.78;

  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * TAU;
    const r = ringR;

    let dAng = a - pulseAngle;
    while (dAng > Math.PI) dAng -= TAU;
    while (dAng < -Math.PI) dAng += TAU;
    const pulseFall = Math.exp(-(dAng * dAng) / (pulseWidth * pulseWidth * 0.5));

    const segB = baseB + beat * beatB + pulseFall * pulseB;
    if (segB < 0.10) continue;

    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    const ix = Math.round(px);
    const iy = Math.round(py);

    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        const gx = ix + dx - 1;
        const gy = iy + dy - 1;
        if (gx < 0 || gx >= GRID || gy < 0 || gy >= GRID) continue;
        const ddx = (gx + 0.5) - px;
        const ddy = (gy + 0.5) - py;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > 0.9) continue;
        const fall = Math.exp(-d2 * 1.5);
        const b = segB * fall;
        if (b < 0.10) continue;
        const idx = gy * GRID + gx;
        if (b > intensities[idx]) intensities[idx] = b;
      }
    }
  }
}

// ────────────────────────────────────────────────────────────
// ERROR — broken twitching version of thinking
//
//   Same swirling sphere body and heartbeat ring as thinking,
//   but corrupted: red color, stuttering rotation, glitched
//   swirls, ring tears, particle dropouts, periodic fragment
//   crashes. The thinking object is recognizable but visibly
//   damaged — fighting to maintain coherence.
// ────────────────────────────────────────────────────────────
const ERROR_R = 24;
const ERROR_N = 2400;
const ERROR_FRAG_COUNT = 12;

// Each fragment is a chunk of the sphere — an anchor direction on the
// unit sphere, an outward drift axis (where the chunk flies during a
// loss-of-cohesion event), and an independent tumble axis + speed so
// every chunk rotates on its own as it separates.
const ERROR_FRAGMENT_ANCHOR_R = 0.7;
const ERROR_FRAGMENTS = (() => {
  const rand = makeRand(555);
  const arr = [];
  for (let i = 0; i < ERROR_FRAG_COUNT; i++) {
    const yNorm = 1 - 2 * (i + 0.5) / ERROR_FRAG_COUNT;
    const ringR = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    const theta = PHI_GOLD * i + 1.7;
    const cx = Math.cos(theta) * ringR;
    const cy = yNorm;
    const cz = Math.sin(theta) * ringR;
    let dx = cx * (0.7 + rand() * 0.4) + (rand() - 0.5) * 0.4;
    let dy = cy * (0.7 + rand() * 0.4) + (rand() - 0.5) * 0.4;
    let dz = cz * (0.7 + rand() * 0.4) + (rand() - 0.5) * 0.4;
    const dlen = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    let tx = rand() - 0.5, ty = rand() - 0.5, tz = rand() - 0.5;
    const tlen = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
    tx /= tlen; ty /= tlen; tz /= tlen;
    arr.push({
      cx, cy, cz,
      ax: cx * ERROR_FRAGMENT_ANCHOR_R,
      ay: cy * ERROR_FRAGMENT_ANCHOR_R,
      az: cz * ERROR_FRAGMENT_ANCHOR_R,
      driftX: dx / dlen, driftY: dy / dlen, driftZ: dz / dlen,
      tumbleX: tx, tumbleY: ty, tumbleZ: tz,
      tumbleSpeed: (0.30 + rand() * 0.65) * (rand() < 0.5 ? 1 : -1),
      oscFreq: 0.08 + rand() * 0.18,
      oscPhase: rand() * TAU,
      baseDist: 0.06 + rand() * 0.10,
      maxDist:  0.55 + rand() * 0.55,
    });
  }
  return arr;
})();

const ERROR_PARTICLES = (() => {
  const arr = [];
  const rand = makeRand(233);
  for (let i = 0; i < ERROR_N; i++) {
    const yNorm = 1 - 2 * (i + 0.5) / ERROR_N;
    const ringR = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    const theta = PHI_GOLD * i;
    const u = rand();
    const r = 0.55 + Math.pow(u, 0.7) * 0.45;
    const px = Math.cos(theta) * ringR * r;
    const py = yNorm * r;
    const pz = Math.sin(theta) * ringR * r;
    let bestDot = -2, bestIdx = 0;
    const plen = Math.sqrt(px * px + py * py + pz * pz) || 1;
    for (let j = 0; j < ERROR_FRAG_COUNT; j++) {
      const f = ERROR_FRAGMENTS[j];
      const dot = (px * f.cx + py * f.cy + pz * f.cz) / plen;
      if (dot > bestDot) { bestDot = dot; bestIdx = j; }
    }
    const radial = plen;
    const fdx = px / radial * (0.6 + rand() * 0.5) + (rand() - 0.5) * 0.5;
    const fdy = py / radial * (0.6 + rand() * 0.5) + (rand() - 0.5) * 0.5;
    const fdz = pz / radial * (0.6 + rand() * 0.5) + (rand() - 0.5) * 0.5;
    const flen = Math.sqrt(fdx * fdx + fdy * fdy + fdz * fdz) || 1;
    arr.push({
      hx: px, hy: py, hz: pz,
      fragId: bestIdx,
      wFreqX: 0.3 + rand() * 0.5,
      wFreqY: 0.3 + rand() * 0.5,
      wFreqZ: 0.3 + rand() * 0.5,
      wPhaseX: rand() * TAU,
      wPhaseY: rand() * TAU,
      wPhaseZ: rand() * TAU,
      tFreq: 0.20 + rand() * 0.50,
      tPhase: rand() * TAU,
      fdx: fdx / flen, fdy: fdy / flen, fdz: fdz / flen,
      x: 0, y: 0, z: 0,
      bx: 0, by: 0, bz: 0,
    });
  }
  return arr;
})();

function updateError(t, scene, dt) {
  const intensities = scene.intensities;
  const ps = ERROR_PARTICLES;

  const sloshStep = Math.floor(t * 6) / 6;
  const twitchX = Math.sin(t * 0.13 * TAU) * 0.13 + Math.sin(sloshStep * 7.3) * 0.08;
  const twitchY = Math.sin(t * 0.10 * TAU + 1.2) * 0.13 + Math.cos(sloshStep * 5.7) * 0.08;
  const twitchZ = Math.sin(t * 0.11 * TAU + 2.4) * 0.13 + Math.sin(sloshStep * 9.1) * 0.06;
  const sloshX = twitchX;
  const sloshY = twitchY;
  const sloshZ = twitchZ;

  const yawStep = Math.floor(t * 8) / 8;
  const yaw = yawStep * 0.05 * TAU;
  const pitch = Math.sin(Math.floor(t * 5) / 5 * 0.7 * TAU) * 0.20;
  const roll = Math.cos(Math.floor(t * 6) / 6 * 0.6 * TAU) * 0.15;
  const cyA = Math.cos(yaw), syA = Math.sin(yaw);
  const cpA = Math.cos(pitch), spA = Math.sin(pitch);
  const crA = Math.cos(roll), srA = Math.sin(roll);

  const breath = 1 + Math.sin(t * 0.09 * TAU) * 0.04;

  // ── Cohesion cycle ──
  // Sphere is ~85% cohered for most of the period, then over ~1.4s
  // the chunks lose cohesion (drift far outward + tumble independently)
  // before snapping back. breakAmt = 0 (cohered) → 1 (max apart).
  const cohesionPeriod = 4.5;
  const cohT = (t + 1.0) % cohesionPeriod;
  let breakAmt = 0;
  if (cohT < 1.6) {
    const c = cohT / 1.6;
    breakAmt = Math.pow(Math.sin(c * Math.PI), 1.4) * 0.92;
  }

  // Crash event: every ~3s, fragments shoot outward briefly
  const crashPeriod = 3.0;
  const crashT = (t + 1.2) % crashPeriod;
  let crashAmt = 0;
  if (crashT < 0.40) {
    const cp = crashT / 0.40;
    crashAmt = (cp < 0.25 ? cp / 0.25 : 1 - (cp - 0.25) / 0.75) * 0.50;
  }

  // Disintegration event: every ~7s, particles randomly displace 180ms
  const disPeriod = 7.3;
  const disT = (t + 3.2) % disPeriod;
  const disActive = disT < 0.20;

  // Brown-out: every 4s, brief sphere dim 130ms
  const brownT = (t + 0.5) % 4.1;
  const brownLevel = brownT < 0.13 ? 0.20 : 1;

  const LX = -0.40, LY = -0.45, LZ = 0.80;
  const Llen = Math.sqrt(LX*LX + LY*LY + LZ*LZ);
  const lx = LX / Llen, ly = LY / Llen, lz = LZ / Llen;

  // ── Per-fragment frame data ──
  // Each chunk's outward drift scales with breakAmt. Tumble rotation is
  // built once per frame as a Rodrigues matrix around the chunk's tumble
  // axis; particles within the chunk rotate rigidly around the chunk's
  // anchor so the chunk reads as a coherent piece flying off.
  const fragData = ERROR_FRAGMENTS.map(f => {
    const wave = Math.sin(t * f.oscFreq * TAU + f.oscPhase);
    const dist = f.baseDist + breakAmt * (f.maxDist - f.baseDist) + Math.max(0, wave) * 0.05;
    const ang = f.tumbleSpeed * t * (0.25 + breakAmt * 1.4) * TAU;
    const c = Math.cos(ang), s = Math.sin(ang);
    const oneMc = 1 - c;
    const ux = f.tumbleX, uy = f.tumbleY, uz = f.tumbleZ;
    return {
      ax: f.ax, ay: f.ay, az: f.az,
      ox: f.driftX * dist, oy: f.driftY * dist, oz: f.driftZ * dist,
      m00: c + ux*ux*oneMc,    m01: ux*uy*oneMc - uz*s, m02: ux*uz*oneMc + uy*s,
      m10: uy*ux*oneMc + uz*s, m11: c + uy*uy*oneMc,    m12: uy*uz*oneMc - ux*s,
      m20: uz*ux*oneMc - uy*s, m21: uz*uy*oneMc + ux*s, m22: c + uz*uz*oneMc,
    };
  });

  for (const p of ps) {
    const wx = Math.sin(t * p.wFreqX * TAU + p.wPhaseX) * 0.025;
    const wy = Math.cos(t * p.wFreqY * TAU + p.wPhaseY) * 0.025;
    const wz = Math.sin(t * p.wFreqZ * TAU + p.wPhaseZ) * 0.025;

    const fd = fragData[p.fragId];

    // Particle position relative to its fragment's anchor.
    const lpx = p.hx - fd.ax;
    const lpy = p.hy - fd.ay;
    const lpz = p.hz - fd.az;
    // Tumble: rotate the local position by the fragment's tumble matrix.
    const rlx = fd.m00 * lpx + fd.m01 * lpy + fd.m02 * lpz;
    const rly = fd.m10 * lpx + fd.m11 * lpy + fd.m12 * lpz;
    const rlz = fd.m20 * lpx + fd.m21 * lpy + fd.m22 * lpz;

    let bx = (fd.ax + rlx + fd.ox + wx) * breath;
    let by = (fd.ay + rly + fd.oy + wy) * breath;
    let bz = (fd.az + rlz + fd.oz + wz) * breath;

    if (crashAmt > 0) {
      const mag = crashAmt * (Math.random() * 0.4 + 0.7);
      bx += p.fdx * mag;
      by += p.fdy * mag;
      bz += p.fdz * mag;
    }

    if (disActive) {
      bx += (Math.random() - 0.5) * 0.55;
      by += (Math.random() - 0.5) * 0.55;
      bz += (Math.random() - 0.5) * 0.55;
    }

    bx += (Math.random() - 0.5) * 0.025;
    by += (Math.random() - 0.5) * 0.025;

    p.bx = bx; p.by = by; p.bz = bz;

    let rx = bx, ry = by, rz = bz;
    let xn = rx * crA - ry * srA;
    let yn = rx * srA + ry * crA;
    rx = xn; ry = yn;
    yn = ry * cpA - rz * spA;
    let zn = ry * spA + rz * cpA;
    ry = yn; rz = zn;
    xn = rx * cyA + rz * syA;
    zn = -rx * syA + rz * cyA;
    rx = xn; rz = zn;

    p.x = rx + sloshX;
    p.y = ry + sloshY;
    p.z = rz + sloshZ;
  }

  const [s1ax, s1ay, s1az] = swirlAxis(t, 0.04, 0.0);
  const [s2ax, s2ay, s2az] = swirlAxis(t, 0.05, 1.7);
  const [u1x, u1y, u1z, v1x, v1y, v1z] = basis(s1ax, s1ay, s1az);
  const [u2x, u2y, u2z, v2x, v2y, v2z] = basis(s2ax, s2ay, s2az);

  // Glitched phase: occasionally jumps backward suddenly
  const glitchPeriod = 0.9;
  const glitchT = (t + 0.3) % glitchPeriod;
  const glitchActive = glitchT < 0.06;
  const phaseGlitchOff = glitchActive ? Math.random() * 2 : 0;
  const swirl1Phase = t * 0.45 + phaseGlitchOff;
  const swirl2Phase = -t * 0.32 + phaseGlitchOff * 0.7;

  for (const p of ps) {
    if (Math.random() < 0.06) continue;

    const px = (HALF + p.x * ERROR_R) | 0;
    const py = (HALF + p.y * ERROR_R) | 0;
    if (px < 0 || px >= GRID || py < 0 || py >= GRID) continue;

    const lenL = Math.sqrt(p.bx * p.bx + p.by * p.by + p.bz * p.bz) || 1;
    const ux_ = p.bx / lenL, uy_ = p.by / lenL, uz_ = p.bz / lenL;

    const lenR = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
    const nrx = p.x / lenR, nry = p.y / lenR, nrz = p.z / lenR;
    const lambert = Math.max(0, nrx * lx + nry * ly + nrz * lz);
    const ambient = 0.25;
    const shading = ambient + (1 - ambient) * lambert;

    const s1lat = ux_ * s1ax + uy_ * s1ay + uz_ * s1az;
    const s1lonU = ux_ * u1x + uy_ * u1y + uz_ * u1z;
    const s1lonV = ux_ * v1x + uy_ * v1y + uz_ * v1z;
    const s1lon = Math.atan2(s1lonV, s1lonU);
    const s1band = Math.cos(s1lat * 4.0 + s1lon * 1.5 + swirl1Phase);
    const s1strength = Math.pow(Math.max(0, s1band), 4) * 0.55;

    const s2lat = ux_ * s2ax + uy_ * s2ay + uz_ * s2az;
    const s2lonU = ux_ * u2x + uy_ * u2y + uz_ * u2z;
    const s2lonV = ux_ * v2x + uy_ * v2y + uz_ * v2z;
    const s2lon = Math.atan2(s2lonV, s2lonU);
    const s2band = Math.cos(s2lat * 3.0 + s2lon * 2.0 + swirl2Phase);
    const s2strength = Math.pow(Math.max(0, s2band), 5) * 0.45;

    const twinkle = 0.05 * Math.random();

    let intensity = (shading * 0.42 + s1strength + s2strength + twinkle) * brownLevel;

    if (crashAmt > 0.05) intensity = Math.max(intensity, 0.55 + crashAmt * 0.5);
    if (intensity > 1) intensity = 1;
    if (intensity < 0.10) continue;
    const idx = py * GRID + px;
    if (intensity > intensities[idx]) intensities[idx] = intensity;
  }

  // Shattered ring
  const cx = HALF + sloshX * ERROR_R;
  const cy = HALF + sloshY * ERROR_R;
  const ringR = (ERROR_R + 14) * breath;

  const beatBase = heartbeat(t, 1.4);
  const skipChance = Math.sin(t * 0.43) > 0.7 ? 0.0 : 1.0;
  const beat = beatBase * skipChance * brownLevel;

  if (!scene.errorRingShards) {
    const rand = makeRand(4242);
    const gaps = [];
    const N_GAPS = 5;
    for (let i = 0; i < N_GAPS; i++) {
      const center = (i / N_GAPS) * TAU + (rand() - 0.5) * 0.6;
      const width = 0.20 + rand() * 0.45;
      gaps.push({ center, width });
    }
    scene.errorRingShards = { gaps };
  }
  const shards = scene.errorRingShards;

  const tearT = (t + 0.7) % 1.4;
  let tearCenter = -99, tearWidth = 0;
  if (tearT < 0.22) {
    const tearSeed = Math.floor((t + 0.7) / 1.4);
    const r1 = ((tearSeed * 9301 + 49297) % 233280) / 233280;
    const r2 = ((tearSeed * 7919 + 12345) % 233280) / 233280;
    tearCenter = r1 * TAU;
    tearWidth = 0.4 + r2 * 0.6;
  }

  const STEPS = 580;
  const baseB = 0.10;
  const beatB = 0.34;

  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * TAU;

    let inGap = false;
    for (const g of shards.gaps) {
      let dG = a - g.center;
      while (dG > Math.PI) dG -= TAU;
      while (dG < -Math.PI) dG += TAU;
      if (Math.abs(dG) < g.width) { inGap = true; break; }
    }
    if (inGap) continue;

    if (tearCenter > -10) {
      let dTear = a - tearCenter;
      while (dTear > Math.PI) dTear -= TAU;
      while (dTear < -Math.PI) dTear += TAU;
      if (Math.abs(dTear) < tearWidth) continue;
    }

    const rWobble =
      Math.sin(a * 9 + t * 0.4) * 0.80 +
      Math.sin(a * 15 - t * 0.3) * 0.54 +
      Math.sin(a * 23 + t * 0.7) * 0.38 +
      Math.sin(a * 37 - t * 0.5) * 0.22;
    const r = ringR + rWobble;

    let segB = baseB + beat * beatB;
    const dropout = Math.random();
    if (dropout < 0.18) continue;
    if (dropout < 0.32) segB *= 0.35;
    segB *= brownLevel;

    if (segB < 0.10) continue;

    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    const ix = Math.round(px);
    const iy = Math.round(py);

    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        const gx = ix + dx - 1;
        const gy = iy + dy - 1;
        if (gx < 0 || gx >= GRID || gy < 0 || gy >= GRID) continue;
        const ddx = (gx + 0.5) - px;
        const ddy = (gy + 0.5) - py;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > 0.9) continue;
        const fall = Math.exp(-d2 * 1.5);
        const b = segB * fall;
        if (b < 0.10) continue;
        const idx = gy * GRID + gx;
        if (b > intensities[idx]) intensities[idx] = b;
      }
    }
  }
}

// ────────────────────────────────────────────────────────────
// Mode-aware color resolution (idle only)
//
// Idle's dot color and canvas backing are resolved per frame from
// the host page's actual computed styles, so the glyph follows
// dark/light mode automatically without any consumer-defined CSS
// variable. Foreground = the canvas's inherited `color`; background
// = the first opaque ancestor's background-color (then the document
// element, then a literal #060606 fallback). Thinking and error are
// fixed (paper-white / warning red on #060606).
// ────────────────────────────────────────────────────────────
function parseRgbString(s) {
  if (!s) return null;
  const m = s.match(/-?\d*\.?\d+/g);
  if (!m || m.length < 3) return null;
  return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])];
}

function effectiveTextColor(canvas) {
  return parseRgbString(getComputedStyle(canvas).color) || COLORS.paper;
}

function effectiveBgColor(canvas) {
  let node = canvas.parentElement;
  while (node && node.nodeType === 1) {
    const bg = getComputedStyle(node).backgroundColor;
    const m = bg ? bg.match(/-?\d*\.?\d+/g) : null;
    if (m && m.length >= 3) {
      const a = m.length >= 4 ? +m[3] : 1;
      if (a >= 0.99) {
        return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])];
      }
    }
    node = node.parentElement;
  }
  const docBg = parseRgbString(getComputedStyle(document.documentElement).backgroundColor);
  return docBg || BG_RGB;
}

// ────────────────────────────────────────────────────────────
// Render
// ────────────────────────────────────────────────────────────
// Hash-based noise dither. Bayer matrices have period 4 which
// constructively interferes with the body's surface-ripple
// frequencies, producing visible vertical/horizontal stripes.
// A position hash gives white noise — no periodicity, no stripes.
function hashDither(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) / 4294967295) - 0.5;
}

function renderScene(scene) {
  const ctx = scene.ctx;
  const bg = scene.bg;
  ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  const intensities = scene.intensities;
  const cR = scene.color[0], cG = scene.color[1], cB = scene.color[2];
  for (let i = 0; i < intensities.length; i++) {
    const v = intensities[i];
    if (v < 0.06) continue;
    const gx = i % GRID;
    const gy = (i / GRID) | 0;
    const lifted = Math.pow(v, CONTRAST_GAMMA);
    const dither = hashDither(gx, gy) * (1 / 8);
    const q = quantize(lifted + dither);
    if (q <= 0) continue;
    ctx.fillStyle = `rgba(${cR},${cG},${cB},${q > 1 ? 1 : q})`;
    ctx.fillRect(gx * CELL + DOT_OFF, gy * CELL + DOT_OFF, DOT, DOT);
  }
}

// Each STATES entry has: update fn, plus EITHER a fixed color/bg pair
// (thinking, error) OR resolveColor/resolveBg fns called per frame
// against the live canvas (idle).
const STATES = {
  idle: {
    update: updateIdle,
    resolveColor: effectiveTextColor,
    resolveBg: effectiveBgColor,
  },
  thinking: {
    update: updateThinking,
    resolveColor: effectiveTextColor,
    resolveBg: effectiveBgColor,
  },
  error: {
    update: updateError,
    color: COLORS.alarm,
    resolveBg: effectiveBgColor,
  },
};

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────
//
// mountGlyph(target, options) → controller
//
//   target    — host element. A <canvas> is appended to it.
//   options.state    — 'idle' | 'thinking' | 'error' (default 'idle')
//   options.size     — CSS pixel size of the displayed glyph (default 200).
//                      The internal canvas stays at 192×192 logical pixels
//                      (96×2) and is scaled via CSS with image-rendering:
//                      pixelated. For sharpest pixels, use a multiple of
//                      96 (192, 288, 384, 480).
//   options.autoplay — start the RAF loop on mount (default true)
//
// Returns:
//   { play(), pause(), setState(name), destroy(), canvas }
//
// Each instance owns its own animation state, RAF loop, and scratch
// buffers — multiple glyphs run independently.
export function mountGlyph(target, options = {}) {
  if (!target || !target.appendChild) {
    throw new Error('cicrus-glyphs: mountGlyph(target) — target must be a DOM element');
  }
  const stateName = options.state || 'idle';
  if (!STATES[stateName]) {
    throw new Error(`cicrus-glyphs: unknown state "${stateName}"`);
  }
  const size = options.size || 200;
  const autoplay = options.autoplay !== false;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.imageRendering = 'pixelated';
  target.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let active = STATES[stateName];

  const scene = {
    ctx,
    update: active.update,
    color: active.color || COLORS.paper,
    bg: active.bg || BG_RGB,
    intensities: new Float32Array(GRID * GRID),
  };

  let rafId = null;
  let lastTs = 0;
  let elapsed = 0;
  let paused = true;

  function resolveColors() {
    scene.color = active.color || active.resolveColor(canvas);
    scene.bg = active.bg || active.resolveBg(canvas);
  }

  function frame(ts) {
    if (paused) return;
    const dtSec = lastTs ? Math.min(0.1, Math.max(0, (ts - lastTs) / 1000)) : 0;
    lastTs = ts;
    elapsed += dtSec;
    scene.intensities.fill(0);
    scene.update(elapsed, scene, dtSec);
    resolveColors();
    renderScene(scene);
    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (!paused) return;
    paused = false;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    if (paused) return;
    paused = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function setState(name) {
    if (!STATES[name]) throw new Error(`cicrus-glyphs: unknown state "${name}"`);
    active = STATES[name];
    scene.update = active.update;
    delete scene.thinkRing;
    delete scene.errorRingShards;
  }

  function destroy() {
    pause();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  if (autoplay) play();

  return { play, pause, setState, destroy, canvas };
}
