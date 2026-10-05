/*
 * 3D particle mark — Canvas 2D, zero dependencies.
 *
 * How it works:
 *   1. The logo is a vector path, filled once into an offscreen canvas (the "mask").
 *   2. The mask is read back with getImageData and scanned on a grid; every opaque
 *      pixel becomes a particle. Each one gets a random Z inside a slab, so the flat
 *      silhouette turns into an extruded volume.
 *   3. The cloud is rotated (yaw + pitch) and projected with a perspective divide.
 *      It rocks gently around the front view and never turns past a three-quarter
 *      angle, so the mark stays readable; the pointer steers it within that range.
 *   4. Particles are drawn as tiny squares, sorted into opacity buckets by depth, so
 *      a full frame costs ~8 fillStyle changes instead of 12 000 — and the buckets
 *      double as the depth cue.
 */

const CONFIG = {
  background: '#000000',
  color: [254, 114, 65],      // #FE7241 — Uprising orange

  // shape
  margin: 0.93,               // free space left around the cloud, 1 = touch the edges
  maxFill: 0.72,              // never let the mark get wider than this share of the viewport
  step: 1.5,                  // sampling grid in px — lower = denser = more particles
  maxParticles: 30000,        // safety cap; the grid relaxes until it fits
  maxParticlesMobile: 14000,  // phones get a smaller budget — same look, fewer draws
  jitter: 0.85,               // random offset off the grid, kills the "screen door" look
  depth: 0.22,                // extrusion thickness, as a fraction of the mark's height

  // look
  sizeMin: 1.0,
  sizeMax: 2.0,
  alphaMin: 0.26,
  alphaMax: 1.0,
  buckets: 8,                 // depth / opacity levels (draw calls per frame)
  focal: 900,                 // perspective strength — smaller = wider lens
  glow: 0.14,                 // soft radial bloom behind the mark, 0 to disable

  // motion — the mark must stay readable, so it never turns past three-quarter view
  swayYaw: 0.26,              // idle rocking around the front view, radians
  swayPitch: 0.07,
  swayPeriodA: 11000,         // two periods beat against each other so it never looks looped
  swayPeriodB: 7300,
  steerYaw: 0.30,             // how far the pointer may turn it, radians
  steerPitch: 0.20,
  steerEase: 0.055,
  nudge: 0.15,                // extra turn on click / tap, eases back out
  nudgeDecay: 0.975,

  // life inside the shape
  swirl: 5.0,                 // wobble amplitude in model px
  swirlSpeed: 0.0022,

  // intro
  introDuration: 1500,
  introStagger: 700
};

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d', { alpha: false });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mark geometry, lifted straight from logo.svg (the orange sign only, no wordmark).
const MARK = {
  width: 24.1506,
  height: 36.2951,
  offsetX: 0,
  offsetY: 2.4,
  paths: [
    'M11.7367 29.0086C11.1733 29.6003 10.2295 29.6003 9.66611 29.0086L7.4497 26.6811C6.9022 26.1061 5.99108 26.0874 5.42045 26.6395L0.43561 31.4617C0.157195 31.731 0 32.1018 0 32.4892V37.2441C0 38.507 1.51789 39.1496 2.42468 38.2705L5.59023 35.2015C6.16069 34.6484 7.07268 34.6666 7.62061 35.242L9.83593 37.5684C10.3993 38.1601 11.3431 38.1601 11.9065 37.5684L23.7563 25.1244C24.0094 24.8586 24.1506 24.5056 24.1506 24.1385V19.5465C24.1506 18.256 22.5757 17.6261 21.6858 18.5607L11.7367 29.0086Z',
    'M11.7367 12.3831C11.173 12.9735 10.2303 12.9729 9.66739 12.3818L7.4913 10.0966C6.9279 9.50493 5.98412 9.50492 5.42072 10.0966L0.601173 15.1578C0.348055 15.4236 0.206875 15.7766 0.206875 16.1437V20.7357C0.206875 22.0262 1.78178 22.6561 2.67175 21.7215L5.59054 18.6564C6.15393 18.0647 7.09771 18.0647 7.66111 18.6564L9.83722 20.9416C10.4001 21.5327 11.3429 21.5334 11.9065 20.943L22.9 9.42816C23.1539 9.16221 23.2956 8.80866 23.2956 8.44097V3.8434C23.2956 2.55374 21.7226 1.92341 20.832 2.85622L11.7367 12.3831Z'
  ]
};

let width = 0;
let height = 0;
let dpr = 1;
let halfDepth = 0;

let particles = [];
let buckets = [];
let bucketStyles = [];

const PITCH_BASE = 0.10;

let targetYaw = 0;
let targetPitch = 0;
let steerYaw = 0;
let steerPitch = 0;
let nudgeYaw = 0;
let nudgePitch = 0;

let introStart = 0;
let glowSprite = null;
let lastTime = 0;

/* ------------------------------------------------------------------ build */

/*
 * The cloud is a rotating box, not a flat picture: at some angles it is wider than the
 * mark itself. So the scale is solved from the worst-case projected extents — half the
 * mark plus half the extrusion, tilted by the maximum pitch and pushed by perspective —
 * which is what keeps it inside a tall phone screen instead of getting cropped.
 */
function fitScale() {
  const uw = MARK.width / 2;                       // per unit of scale
  const uh = MARK.height / 2;
  const ud = (MARK.height * CONFIG.depth) / 2;

  const maxYaw = CONFIG.swayYaw + CONFIG.steerYaw + CONFIG.nudge * 2;
  const maxPitch = Math.abs(PITCH_BASE) + CONFIG.swayPitch
    + CONFIG.steerPitch + CONFIG.nudge * 2;

  // walk the rotation range the mark can actually reach and keep the widest projection
  let ux = 0;
  let uy = 0;
  for (let y = 0; y <= maxYaw + 1e-6; y += maxYaw / 12 || 1) {
    const ex = uw * Math.cos(y) + ud * Math.sin(y);
    const ez = ud * Math.cos(y) + uw * Math.sin(y);
    if (ex > ux) ux = ex;
    for (let p = 0; p <= maxPitch + 1e-6; p += maxPitch / 8 || 1) {
      const ey = uh * Math.cos(p) + ez * Math.sin(p);
      if (ey > uy) uy = ey;
    }
  }

  const perspective = 1.22;                        // worst-case near-side magnification

  const fit = Math.min(
    (width / 2) / (ux * perspective),
    (height / 2) / (uy * perspective)
  ) * CONFIG.margin;

  const cap = (Math.min(width, height) * CONFIG.maxFill) / (uw * 2);

  return Math.min(fit, cap);
}

function buildMask() {
  const mask = document.createElement('canvas');
  mask.width = Math.max(1, Math.floor(width));
  mask.height = Math.max(1, Math.floor(height));
  const m = mask.getContext('2d', { willReadFrequently: true });

  const scale = fitScale();

  m.save();
  m.translate(width / 2, height / 2);
  m.scale(scale, scale);
  m.translate(-MARK.width / 2 - MARK.offsetX, -MARK.height / 2 - MARK.offsetY);
  m.fillStyle = '#fff';
  for (const d of MARK.paths) m.fill(new Path2D(d));
  m.restore();

  return { image: m.getImageData(0, 0, mask.width, mask.height), scale };
}

function sample(image, step) {
  const data = image.data;
  const w = image.width;
  const h = image.height;
  const points = [];

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const px = Math.min(w - 1, Math.round(x));
      const py = Math.min(h - 1, Math.round(y));
      if (data[(py * w + px) * 4 + 3] > 128) points.push(x, y);
    }
  }
  return points;
}

function build() {
  const { image, scale } = buildMask();

  const budget = Math.min(width, height) < 700
    ? CONFIG.maxParticlesMobile
    : CONFIG.maxParticles;

  let step = CONFIG.step;
  let points = sample(image, step);
  for (let guard = 0; points.length / 2 > budget && guard < 40; guard++) {
    step *= 1.15;
    points = sample(image, step);
  }

  halfDepth = (MARK.height * scale * CONFIG.depth) / 2;

  const cx = width / 2;
  const cy = height / 2;
  const spread = Math.hypot(width, height) * 0.45;

  particles = new Array(points.length / 2);

  for (let i = 0, p = 0; i < points.length; i += 2, p++) {
    const j = step * 2 * CONFIG.jitter;

    particles[p] = {
      // home position in model space, origin at the centre of the mark
      hx: points[i] - cx + (Math.random() - 0.5) * j,
      hy: points[i + 1] - cy + (Math.random() - 0.5) * j,
      hz: (Math.random() - 0.5) * 2 * halfDepth,

      // where it flies in from
      sx: (Math.random() - 0.5) * 2 * spread,
      sy: (Math.random() - 0.5) * 2 * spread,
      sz: (Math.random() - 0.5) * 2 * spread,

      size: CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin),
      phase: Math.random() * Math.PI * 2,
      speed: 0.55 + Math.random() * 1.1,

      delay: Math.random() * CONFIG.introStagger,

      // filled in every frame
      px: 0, py: 0, ps: 1, bucket: 0
    };
  }

  buckets = Array.from({ length: CONFIG.buckets }, () => []);
  bucketStyles = Array.from({ length: CONFIG.buckets }, (_, i) => {
    const t = CONFIG.buckets === 1 ? 1 : i / (CONFIG.buckets - 1);
    const a = CONFIG.alphaMin + t * (CONFIG.alphaMax - CONFIG.alphaMin);
    return `rgba(${CONFIG.color[0]},${CONFIG.color[1]},${CONFIG.color[2]},${a.toFixed(3)})`;
  });

  buildGlow();
  introStart = performance.now();
  lastTime = introStart;
}

function buildGlow() {
  if (!CONFIG.glow) { glowSprite = null; return; }
  const r = Math.min(width, height) * 0.55;
  const g = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, r);
  const [cr, cg, cb] = CONFIG.color;
  g.addColorStop(0, `rgba(${cr},${cg},${cb},${CONFIG.glow})`);
  g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${CONFIG.glow * 0.25})`);
  g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  glowSprite = g;
}

/* ------------------------------------------------------------------- loop */

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function update(now) {
  const dt = Math.min(64, now - lastTime);
  lastTime = now;

  // camera — a slow sway around the front view, plus whatever the pointer asks for
  steerYaw += (targetYaw - steerYaw) * CONFIG.steerEase;
  steerPitch += (targetPitch - steerPitch) * CONFIG.steerEase;

  const decay = Math.pow(CONFIG.nudgeDecay, dt / 16.67);
  nudgeYaw *= decay;
  nudgePitch *= decay;

  let swayY = 0;
  let swayP = 0;
  if (!reduceMotion) {
    const a = Math.sin((now * Math.PI * 2) / CONFIG.swayPeriodA);
    const b = Math.sin((now * Math.PI * 2) / CONFIG.swayPeriodB);
    swayY = (a * 0.72 + b * 0.28) * CONFIG.swayYaw;
    swayP = (b * 0.72 - a * 0.28) * CONFIG.swayPitch;
  }

  const ry = swayY + steerYaw + nudgeYaw;
  const rx = PITCH_BASE + swayP + steerPitch + nudgePitch;

  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const cosX = Math.cos(rx), sinX = Math.sin(rx);

  const cx = width / 2;
  const cy = height / 2;
  const focal = CONFIG.focal;

  // depth range used to pick an opacity bucket
  const zSpan = Math.max(1, Math.hypot(width, height) * 0.35);
  const last = CONFIG.buckets - 1;

  const intro = Math.min(1, (now - introStart) / (CONFIG.introDuration + CONFIG.introStagger));
  const swirl = reduceMotion ? 0 : CONFIG.swirl;

  for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    let x = p.hx, y = p.hy, z = p.hz;

    if (swirl) {
      const t = now * CONFIG.swirlSpeed * p.speed;
      x += Math.sin(t + p.phase) * swirl;
      y += Math.cos(t * 0.82 + p.phase * 1.7) * swirl;
      z += Math.sin(t * 1.14 + p.phase * 2.3) * swirl;
    }

    if (intro < 1) {
      const t = Math.max(0, Math.min(1, (now - introStart - p.delay) / CONFIG.introDuration));
      const e = easeOutCubic(t);
      x = p.sx + (x - p.sx) * e;
      y = p.sy + (y - p.sy) * e;
      z = p.sz + (z - p.sz) * e;
    }

    // yaw around Y, then pitch around X
    const x1 = x * cosY + z * sinY;
    const z1 = z * cosY - x * sinY;
    const y1 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const f = focal / (focal + z2);
    p.px = cx + x1 * f;
    p.py = cy + y1 * f;
    p.ps = p.size * f;

    let d = 0.5 - z2 / zSpan;              // 1 = nearest, 0 = farthest
    d = d < 0 ? 0 : d > 1 ? 1 : d;
    const bucket = (d * last) | 0;
    buckets[bucket].push(p);
  }
}

function render() {
  if (!width || !height) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = CONFIG.background;
  ctx.fillRect(0, 0, width, height);

  if (glowSprite) {
    ctx.fillStyle = glowSprite;
    ctx.fillRect(0, 0, width, height);
  }

  // back to front, so near particles sit on top
  for (let i = 0; i < buckets.length; i++) {
    const list = buckets[i];
    if (!list.length) continue;
    ctx.fillStyle = bucketStyles[i];
    for (let j = 0; j < list.length; j++) {
      const p = list[j];
      ctx.fillRect(p.px, p.py, p.ps, p.ps);
    }
  }
}

function frame(now) {
  update(now);
  render();
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------- lifecycle */

function resize() {
  const rect = canvas.getBoundingClientRect();
  const w = Math.round(rect.width) || canvas.clientWidth || window.innerWidth;
  const h = Math.round(rect.height) || canvas.clientHeight || window.innerHeight;
  if (w < 2 || h < 2) return false;          // container not laid out yet
  if (w === width && h === height) return true;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = w;
  height = h;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  build();
  return true;
}

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const nx = (e.clientX - rect.left) / rect.width - 0.5;
  const ny = (e.clientY - rect.top) / rect.height - 0.5;
  targetYaw = nx * CONFIG.steerYaw;
  targetPitch = -ny * CONFIG.steerPitch;
});

canvas.addEventListener('pointerleave', () => {
  targetYaw = 0;
  targetPitch = 0;
});

// A tap leans the mark towards the point that was touched, then it drifts back.
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const nx = (e.clientX - rect.left) / rect.width - 0.5;
  const ny = (e.clientY - rect.top) / rect.height - 0.5;
  nudgeYaw = nx * 2 * CONFIG.nudge;
  nudgePitch = -ny * 2 * CONFIG.nudge;
  targetYaw = nx * CONFIG.steerYaw;
  targetPitch = -ny * CONFIG.steerPitch;
});

let resizeTimer = null;
function scheduleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 180);
}

window.addEventListener('resize', scheduleResize);

// The canvas can start at zero size (hidden container, iframe, lazy section),
// so watch the element itself instead of relying on window resize alone.
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(scheduleResize).observe(canvas);
}

if (!resize()) {
  const retry = setInterval(() => { if (resize()) clearInterval(retry); }, 100);
  setTimeout(() => clearInterval(retry), 5000);
}

requestAnimationFrame(frame);
