// ---------- D.B. Cooper (mystery, 16:9) scene library ----------
// Look: night-navy graph paper for the story, sepia case-file paper for documents, ink outlines, amber + red accents.
const NIGHT = '#131a2a', NIGHT2 = '#24314d', GRIDN = 'rgba(255,255,255,.045)', SEPIA = '#f1e6cc', SEPIA_LINE = 'rgba(110,80,40,.12)',
  AMBER = '#f5b942', REDC = '#d8312b', TEAL = '#2a9d8f', FBIB = '#2f63c9', PAPER = '#fffaf0', GOLD = '#f5c542', GOLD_D = '#c9971c',
  BILL = '#a9d8b0', BILL_D = '#2e6b3e', SUIT = '#2c2c36', GREEN = '#2e8b57';
const C = (b, e) => Object.assign({}, b, e);

// --- camera + backgrounds ---
function cam(ctx, c) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(960, 540); ctx.scale(c.z || 1, c.z || 1); ctx.rotate(c.r || 0); ctx.translate(-(c.x || 960), -(c.y || 540)); }
function drift(t, lt, z0 = 1, z1 = 1.04, dur = 7) { const hh = shake(t * .35, 3, 1, 2); return { x: 960 + hh[0], y: 540 + hh[1], z: lerp(z0, z1, clamp(lt / dur)) }; }
function gridBG(ctx, c, top, bot, ln, step = 48) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  cam(ctx, c); ctx.strokeStyle = ln; ctx.lineWidth = 2;
  for (let x = -480; x <= 2400; x += step) { ctx.beginPath(); ctx.moveTo(x, -400); ctx.lineTo(x, 1500); ctx.stroke(); }
  for (let y = -384; y <= 1500; y += step) { ctx.beginPath(); ctx.moveTo(-500, y); ctx.lineTo(2500, y); ctx.stroke(); }
}
const night = (ctx, c) => gridBG(ctx, c, NIGHT, NIGHT2, GRIDN);
const filePaper = (ctx, c) => gridBG(ctx, c, '#f4ead2', '#e9dcbc', SEPIA_LINE);
const dayRoom = (ctx, c) => gridBG(ctx, c, '#dfe8ef', '#c9d6e1', 'rgba(30,60,90,.06)');
function floorBand(ctx, y = 900, col = 'rgba(0,0,0,.18)', lc = INK) { ctx.fillStyle = col; ctx.fillRect(-500, y, 3000, 700); line(ctx, -500, y, 2500, y, 6, lc); }
function stars(ctx, n = 60, seed = 3, a = .8) { const r = rng(seed); ctx.fillStyle = `rgba(255,255,255,${a})`; for (let i = 0; i < n; i++) { circle(ctx, r() * 1920, r() * 600, 1.5 + r() * 2.5); ctx.fill(); } }
function moon(ctx, x, y, r) { circle(ctx, x, y, r); fillStroke(ctx, '#f6efd2', 6); circle(ctx, x + r * .3, y - r * .2, r * .18); ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fill(); }
function rain(ctx, t, a = .55, n = 140, slant = .28, seed = 7) {
  const r = rng(seed); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = `rgba(190,215,255,${a})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x0 = r() * 2300 - 200, sp = 1400 + r() * 600, len = 30 + r() * 40, y = ((r() * 1200 + t * sp) % 1300) - 100, x = x0 - y * slant;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * slant, y + len); ctx.stroke(); }
  ctx.restore();
}
function vignetteDark(ctx, a = .5) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(960, 540, 300, 960, 540, 1150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function flash(ctx, a, col = '#fff') { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// --- small UI bits ---
function popIn(lt, t0, d = .35) { return backOut(clamp((lt - t0) / d)); }
function fadeIn(lt, t0, d = .4) { return clamp((lt - t0) / d); }
function tag(ctx, x, y, txt, bg = '#fff', fg = INK, size = 44) {
  if (size <= 0) return; ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.6;
  const m = ctx.getTransform(), sy = m.b * x + m.d * y + m.f, bot = sy + h / 2 * m.d; if (bot > 905 && m.d > 0) y -= (bot - 905) / m.d;
  rrect(ctx, x - w / 2, y - h / 2, w, h, h / 2); fillStroke(ctx, bg, 5); text(ctx, txt, x, y + size * .04, size, fg, INK, 0);
}
function card(ctx, x, y, w, h, fill = PAPER) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; rrect(ctx, x, y, w, h, 28); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); rrect(ctx, x, y, w, h, 28); fillStroke(ctx, null, 6); }
function stamp(ctx, x, y, txt, col = REDC, rot = -.12, p = 1, size = 90) {
  if (p <= 0) return; const s = lerp(2.2, 1, easeOut(clamp(p))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 1.5) * .92;
  ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(txt).width + size * .7, h = size * 1.35;
  rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.stroke(); text(ctx, txt, 0, size * .05, size, col, col, 0); ctx.restore();
}
function bigQ(ctx, x, y, size, col = AMBER, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; text(ctx, '?', x, y, size, col, INK, size * .08); ctx.restore(); }
function clockFace(ctx, x, y, r, h, m, col = '#fff') {
  circle(ctx, x, y, r); fillStroke(ctx, col, r * .08);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; line(ctx, x + Math.sin(a) * r * .78, y - Math.cos(a) * r * .78, x + Math.sin(a) * r * .9, y - Math.cos(a) * r * .9, r * .05); }
  const ah = ((h % 12) + m / 60) / 12 * TAU, am = m / 60 * TAU;
  line(ctx, x, y, x + Math.sin(ah) * r * .5, y - Math.cos(ah) * r * .5, r * .1); line(ctx, x, y, x + Math.sin(am) * r * .75, y - Math.cos(am) * r * .75, r * .07);
  circle(ctx, x, y, r * .08); ctx.fillStyle = INK; ctx.fill();
}
function timeStamp(ctx, x, y, label, p = 1) { if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); rrect(ctx, -170, -50, 340, 100, 20); fillStroke(ctx, '#111', 6); text(ctx, label, 0, 4, 58, AMBER, INK, 0, 'Poppins'); ctx.restore(); }
function calPage(ctx, x, y, s, month, day, year, p = 1) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * p, s * p);
  rrect(ctx, -150, -170, 300, 340, 22); fillStroke(ctx, '#fff', 7); ctx.save(); rrect(ctx, -150, -170, 300, 80, 22); ctx.clip(); ctx.fillStyle = REDC; ctx.fillRect(-160, -180, 320, 90); ctx.restore();
  rrect(ctx, -150, -170, 300, 340, 22); fillStroke(ctx, null, 7);
  text(ctx, month, 0, -128, 40, '#fff', INK, 0); if (day === '') text(ctx, String(year), 0, 40, 96, INK, INK, 0); else { text(ctx, String(day), 0, 10, 140, INK, INK, 0); text(ctx, String(year), 0, 120, 44, '#6b6470', INK, 0); } ctx.restore();
}

// --- people ---
const glasses = (ctx, hx, hy) => { for (const k of [-1, 1]) { rrect(ctx, hx + k * .072 - .052, hy - .04, .104, .07, .025); fillStroke(ctx, '#15151b', .012); } line(ctx, hx - .02, hy - .02, hx + .02, hy - .02, .012); };
const shirtTie = (tie = '#111', clip = true) => ctx => {
  path(ctx, [[-.055, -.62], [0, -.52], [.055, -.62]]); fillStroke(ctx, '#f6f6f6', .01);
  path(ctx, [[-.016, -.585], [.016, -.585], [.024, -.44], [0, -.41], [-.024, -.44]]); fillStroke(ctx, tie, .008);
  if (clip) { ctx.fillStyle = '#e8c04a'; ctx.fillRect(-.03, -.5, .06, .014); }
};
const hairBob = col => (ctx, hx, hy, hr) => {
  ctx.save(); ctx.beginPath(); ctx.rect(hx - hr * 1.4, hy - hr * 1.4, hr * 2.8, hr * .78); ctx.clip(); circle(ctx, hx, hy - .004, hr * 1.07); fillStroke(ctx, col, .012); ctx.restore();
  for (const k of [-1, 1]) { rrect(ctx, hx + k * hr * 1.0 - .026, hy - .07, .052, .17, .025); fillStroke(ctx, col, .01); }
};
const fedora = col => (ctx, hx, hy, hr) => { ellipse(ctx, hx, hy - hr * .72, hr * 1.35, hr * .2); fillStroke(ctx, col, .012); rrect(ctx, hx - hr * .75, hy - hr * 1.35, hr * 1.5, hr * .62, .05); fillStroke(ctx, col, .012); ctx.fillStyle = '#111'; ctx.fillRect(hx - hr * .75, hy - hr * .86, hr * 1.5, hr * .12); };
const pilotCap = (ctx, hx, hy, hr) => { rrect(ctx, hx - hr * .95, hy - hr * 1.25, hr * 1.9, hr * .5, .04); fillStroke(ctx, '#1d2c4f', .012); ellipse(ctx, hx + hr * .25, hy - hr * .72, hr * .75, hr * .13); fillStroke(ctx, '#111', .01); circle(ctx, hx, hy - hr * 1.02, hr * .12); fillStroke(ctx, GOLD, .008); };
const COOPER = { cols: [SUIT, SUIT], hat: 'none', belt: false, over: glasses, torsoOver: shirtTie() };
const COOPER_NOGL = { cols: [SUIT, SUIT], hat: 'none', belt: false, torsoOver: shirtTie() };
const FLO = { cols: [TEAL, TEAL], hat: 'none', belt: false, over: hairBob('#6b3f22') };
const TINA = { cols: [TEAL, TEAL], hat: 'none', belt: false, over: hairBob('#d9a441') };
const PILOT = { cols: ['#eef0f4', '#eef0f4'], hat: 'none', belt: false, over: pilotCap, torsoOver: shirtTie('#1d2c4f', false) };
const AGENT = { cols: ['#56627a', '#56627a'], hat: 'none', belt: false, over: fedora('#3b3f4a'), torsoOver: shirtTie('#7a1f1f', false) };
const AGENT2 = { cols: ['#6d6a60', '#6d6a60'], hat: 'none', belt: false, over: fedora('#4b4438'), torsoOver: shirtTie('#1d2c4f', false) };
const COP = { cols: ['#1d2c4f', '#1d2c4f'], hat: 'none', belt: true, over: pilotCap };
const BOY = { cols: ['#e9725b', '#f2b75a'], hat: 'none', belt: false };
const PAX = [['#7a8fd6', '#7a8fd6'], ['#e9725b', '#e9725b'], ['#5fbf9a', '#5fbf9a'], ['#c98bd6', '#c98bd6'], ['#f2b75a', '#f2b75a'], ['#8a9aa8', '#8a9aa8']].map(c => ({ cols: c, hat: 'none', belt: false }));
const sitLegs = { L: [1.45, -1.5], R: [1.4, -1.5] };
const walk = (t, sp = 7, amp = .5) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const cheer = { L: [2.6, .2], R: [2.6, .2] }, hips = { L: [.9, -2.2], R: [.9, -2.2] }, shrug = { L: [1.3, -2.2], R: [1.3, -2.2] }, handsHead = { L: [2.3, -2.3], R: [2.3, -2.3] }, armsDown = { L: [.2, -.05], R: [.2, -.05] };
function silhouette(ctx, x, y, s, col = '#0b0f18', o = {}) { drawStick(ctx, C({ cols: [col, col], hat: 'none', belt: false }, { x, y, s, sil: col, shadow: false, ...o })); }

// --- the Boeing 727 (side view, facing right). s = half length in px ---
function plane727(ctx, x, y, s, o = {}) {
  const { stairs = 0, gear = 0, t = 0, tilt = 0, lights = 1, dark = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s); const lw = 6 / s;
  // far wing
  path(ctx, [[.12, -.02], [-.18, -.28], [-.3, -.28], [-.12, -.02]]); fillStroke(ctx, dark ? '#9aa3b2' : '#c9ced8', lw);
  // aft stairs (behind fuselage bottom)
  if (stairs > 0) { ctx.save(); ctx.translate(-.84, .08); ctx.rotate(stairs * .75); rrect(ctx, -.34, -.02, .34, .045, .01); fillStroke(ctx, '#8b929e', lw);
    for (let k = 1; k < 6; k++) line(ctx, -k * .055, -.02, -k * .055, .025, lw * .6); ctx.restore(); }
  // tail fin + T stabiliser
  path(ctx, [[-.62, -.08], [-.9, -.52], [-1.04, -.52], [-.95, -.08]]); fillStroke(ctx, '#c8392b', lw);
  rrect(ctx, -1.12, -.56, .34, .06, .03); fillStroke(ctx, '#e8eaee', lw);
  // fuselage
  const body = () => { ctx.beginPath(); ctx.moveTo(-1.0, -.06); ctx.lineTo(.78, -.1); ctx.quadraticCurveTo(1.02, -.09, 1.03, .02); ctx.quadraticCurveTo(1.0, .1, .8, .1); ctx.lineTo(-.86, .1); ctx.quadraticCurveTo(-.98, .08, -1.0, -.06); ctx.closePath(); };
  body(); ctx.fillStyle = dark ? '#c4c9d2' : '#f4f5f7'; ctx.fill();
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = '#c8392b'; ctx.fillRect(-1.1, -.005, 2.2, .03); ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(-1.1, .05, 2.2, .1); ctx.restore();
  body(); fillStroke(ctx, null, lw);
  for (let k = 0; k < 22; k++) { const wx = -.62 + k * .062; rrect(ctx, wx, -.06, .028, .036, .012); ctx.fillStyle = lights ? (dark ? '#ffe9a8' : '#33415c') : '#33415c'; ctx.fill(); }
  path(ctx, [[.86, -.065], [.95, -.06], [.98, -.02], [.88, -.025]]); fillStroke(ctx, '#33415c', lw * .7);
  // rear engines
  for (const [ex, ey] of [[-.72, -.11]]) { rrect(ctx, ex - .14, ey - .05, .28, .1, .05); fillStroke(ctx, '#d5d9e0', lw); ellipse(ctx, ex + .14, ey, .02, .045); ctx.fillStyle = '#333'; ctx.fill(); }
  rrect(ctx, -.95, -.15, .2, .06, .03); fillStroke(ctx, '#d5d9e0', lw);
  // near wing
  path(ctx, [[.16, .05], [-.24, .4], [-.4, .4], [-.12, .05]]); fillStroke(ctx, dark ? '#b8bfcc' : '#e2e5eb', lw);
  // gear
  if (gear > 0) { for (const gx of [.7, -.12]) { line(ctx, gx, .09, gx, .09 + .12 * gear, lw * 1.4); circle(ctx, gx, .1 + .13 * gear, .035); fillStroke(ctx, '#222', lw * .7); } }
  // nav lights
  if (lights) { const bl = (Math.sin(t * 6) > .3) ? 1 : .25; circle(ctx, -.4, .4, .02); ctx.fillStyle = `rgba(255,60,60,${bl})`; ctx.fill(); circle(ctx, -1.05, -.53, .018); ctx.fillStyle = `rgba(255,255,255,${bl})`; ctx.fill(); }
  ctx.restore();
}
function planeIcon(ctx, x, y, r, ang = 0, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(r, r);
  path(ctx, [[1, 0], [.7, -.1], [.1, -.12], [-.2, -.75], [-.4, -.75], [-.25, -.12], [-.75, -.1], [-.95, -.4], [-1.08, -.4], [-1, 0], [-1.08, .4], [-.95, .4], [-.75, .1], [-.25, .12], [-.4, .75], [-.2, .75], [.1, .12], [.7, .1]]);
  fillStroke(ctx, col, 3 / r * 2); ctx.restore();
}
function cloudBank(ctx, y, t, col, speed = 120, seed = 4) { const r = rng(seed); for (let i = 0; i < 9; i++) { const x = ((r() * 2600 - t * speed * (.6 + r() * .6)) % 2600 + 2600) % 2600 - 300, yy = y + r() * 120 - 60, sz = 160 + r() * 120;
  cloudShape(ctx, x, yy, sz, i % 4 + 1); ctx.fillStyle = typeof col === 'string' ? col : (i % 2 ? '#3a4766' : '#2e3a56'); ctx.fill(); cloudShape(ctx, x, yy, sz, i % 4 + 1); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(10,14,24,.6)'; ctx.stroke(); } }

// --- cabin interior (side view). Seats drawn in front of seated people ---
function cabinBG(ctx, c, o = {}) {
  const { outside = '#2b3a5c', dim = 0 } = o;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#e7dcc4'; ctx.fillRect(0, 0, W, H); cam(ctx, c);
  ctx.fillStyle = '#d9ccaf'; ctx.fillRect(-400, 0, 2800, 170); line(ctx, -400, 170, 2400, 170, 6);
  for (let x = -200; x < 2300; x += 300) { rrect(ctx, x, 260, 130, 170, 60); fillStroke(ctx, outside, 7); rrect(ctx, x + 18, 278, 94, 134, 46); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke(); }
  ctx.fillStyle = '#7c6a58'; ctx.fillRect(-400, 900, 2800, 400); line(ctx, -400, 900, 2400, 900, 6);
  for (let x = -200; x < 2300; x += 90) { ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x, 900, 40, 400); }
  if (dim > 0) darkOver(ctx, dim);
}
function darkOver(ctx, a, col = '#05070d') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function seat(ctx, x, base, col = '#3b5b92') {
  rrect(ctx, x - 30, base - 360, 70, 300, 26); fillStroke(ctx, col, 6); rrect(ctx, x - 30, base - 380, 70, 70, 20); fillStroke(ctx, '#f2efe6', 5);
  rrect(ctx, x - 150, base - 120, 190, 50, 16); fillStroke(ctx, col, 6); line(ctx, x - 60, base - 70, x - 60, base, 10);
}
function seated(ctx, x, base, o) { drawStick(ctx, C(o, { x: x - 40, y: base - 30, s: o.s || 380, legs: sitLegs, shadow: false })); }

// --- props ---
function briefcase(ctx, x, y, s, open = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (open > 0) {
    rrect(ctx, -130, -10 - 190 * open, 260, 190 * open, 12); fillStroke(ctx, '#1b1b22', 6); rrect(ctx, -110, -10 - 170 * open, 220, 150 * open, 8); fillStroke(ctx, '#5a2a2a', 4);
    rrect(ctx, -130, -10, 260, 90, 12); fillStroke(ctx, '#3a2a22', 6);
    for (let k = 0; k < 6; k++) { rrect(ctx, -110 + k * 26, 0, 20, 62, 6); fillStroke(ctx, REDC, 4); }
    rrect(ctx, 50, 10, 60, 50, 8); fillStroke(ctx, '#9aa3ad', 4); text(ctx, '+', 80, 34, 30, INK, INK, 0);
    ctx.lineWidth = 4; for (const [c, a] of [['#f5c542', 0], ['#2f63c9', 1]]) { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(-100, 10 + a * 20); ctx.bezierCurveTo(-20, -40, 20, 70, 60, 20 + a * 10); ctx.stroke(); }
  } else { rrect(ctx, -130, -100, 260, 180, 14); fillStroke(ctx, '#1b1b22', 6); line(ctx, -130, -20, 130, -20, 4, '#3a3a46'); rrect(ctx, -40, -135, 80, 40, 14); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke(); for (const k of [-1, 1]) { ctx.fillStyle = GOLD; ctx.fillRect(k * 70 - 12, -30, 24, 18); } }
  ctx.restore();
}
function note(ctx, x, y, w, rot, lines = [], a = 1, size = 38) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); const h = w * .62;
  rrect(ctx, -w / 2, -h / 2, w, h, 10); fillStroke(ctx, '#fffdf4', 6);
  for (let k = 0; k < 5; k++) line(ctx, -w / 2 + 30, -h / 2 + 60 + k * (h - 80) / 4, w / 2 - 30, -h / 2 + 60 + k * (h - 80) / 4, 2, 'rgba(60,90,160,.25)');
  lines.forEach((l, k) => text(ctx, l, 0, -h / 2 + 70 + k * size * 1.35, size, '#26272f', INK, 0, 'Lora', 700));
  ctx.restore();
}
function ticketSlip(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rrect(ctx, -260, -120, 520, 240, 18); fillStroke(ctx, '#fff', 6); ctx.fillStyle = REDC; ctx.fillRect(-257, -117, 80, 234); line(ctx, -177, -120, -177, 120, 6);
  text(ctx, 'FLIGHT 305', 40, -70, 40, INK, INK, 0); text(ctx, 'PORTLAND → SEATTLE', 40, -15, 32, '#555', INK, 0); text(ctx, 'COOPER, DAN', 40, 40, 40, INK, INK, 0, 'Lora', 700); text(ctx, '$18.52', 40, 92, 40, REDC, INK, 0);
  ctx.restore();
}
function counterDesk(ctx, x, base, sign = 'TICKETS') {
  rrect(ctx, x - 330, base - 260, 660, 260, 16); fillStroke(ctx, '#b07a4a', 7); for (let k = 0; k < 4; k++) line(ctx, x - 300, base - 200 + k * 50, x + 300, base - 200 + k * 50, 3, 'rgba(0,0,0,.15)');
  rrect(ctx, x - 360, base - 290, 720, 40, 12); fillStroke(ctx, '#e9e2d0', 6);
  rrect(ctx, x - 230, 150, 460, 110, 16); fillStroke(ctx, '#1d2c4f', 7); text(ctx, sign, x, 208, 64, '#fff', INK, 0);
}
function drinkGlass(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); path(ctx, [[-28, -70], [28, -70], [22, 0], [-22, 0]]); fillStroke(ctx, 'rgba(255,255,255,.6)', 5); ctx.save(); path(ctx, [[-28, -70], [28, -70], [22, 0], [-22, 0]]); ctx.clip(); ctx.fillStyle = '#d99a4e'; ctx.fillRect(-30, -40, 60, 45); ctx.restore(); path(ctx, [[-28, -70], [28, -70], [22, 0], [-22, 0]]); fillStroke(ctx, null, 5); ctx.restore(); }
function cigarette(ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rrect(ctx, -40, -6, 80, 12, 6); fillStroke(ctx, '#fff', 3); ctx.fillStyle = '#e0a060'; ctx.fillRect(-40, -6, 20, 12); circle(ctx, 40, 0, 5); ctx.fillStyle = '#ff7a30'; ctx.fill();
  for (let k = 0; k < 3; k++) { const p = ((t * .5 + k / 3) % 1); circle(ctx, 45 + Math.sin(p * 9 + k) * 10, -10 - p * 90, 8 + p * 14); ctx.fillStyle = `rgba(220,220,230,${.4 * (1 - p)})`; ctx.fill(); } ctx.restore(); }
function bill20(ctx, x, y, w, rot = 0, a = 1, serial) {
  if (a <= 0 || w <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); const h = w * .43;
  rrect(ctx, -w / 2, -h / 2, w, h, w * .04); fillStroke(ctx, BILL, Math.max(3, w * .02));
  rrect(ctx, -w / 2 + w * .06, -h / 2 + h * .12, w * .88, h * .76, w * .03); ctx.lineWidth = Math.max(2, w * .012); ctx.strokeStyle = BILL_D; ctx.stroke();
  ellipse(ctx, 0, 0, h * .3, h * .34); fillStroke(ctx, '#d6efd9', Math.max(2, w * .012));
  text(ctx, '20', -w * .33, -h * .2, h * .26, BILL_D, INK, 0); text(ctx, '20', w * .33, h * .22, h * .26, BILL_D, INK, 0);
  if (serial) text(ctx, serial, w * .2, -h * .26, h * .14, '#2e6b3e', INK, 0);
  ctx.restore();
}
function bundle(ctx, x, y, w, rot = 0, old = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const h = w * .43;
  for (let k = 3; k >= 0; k--) { rrect(ctx, -w / 2 + k * 3, -h / 2 - k * 6, w, h, 8); fillStroke(ctx, old ? mix('#a9d8b0', '#8c8060', old) : BILL, 5); }
  ctx.fillStyle = old ? '#8a6a3a' : '#f2e6c8'; ctx.fillRect(-w * .08, -h / 2 - 20, w * .16, h + 22); rrect(ctx, -w * .08, -h / 2 - 20, w * .16, h + 22, 4); fillStroke(ctx, null, 4);
  if (old) { ctx.fillStyle = 'rgba(80,60,30,.25)'; for (let k = 0; k < 6; k++) { circle(ctx, -w * .3 + k * w * .12, (k % 2 ? -1 : 1) * h * .15, w * .05); ctx.fill(); } }
  ctx.restore();
}
function moneyBag(ctx, x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 3) * .03);
  ctx.beginPath(); ctx.moveTo(-40, -150); ctx.quadraticCurveTo(-150, -40, -120, 40); ctx.quadraticCurveTo(-100, 100, 0, 100); ctx.quadraticCurveTo(100, 100, 120, 40); ctx.quadraticCurveTo(150, -40, 40, -150); ctx.closePath(); fillStroke(ctx, '#c9b08a', 7);
  rrect(ctx, -50, -170, 100, 30, 12); fillStroke(ctx, '#8a6a3a', 6); text(ctx, '$', 0, 10, 110, '#6d5232', INK, 0); ctx.restore();
}
function chutePack(ctx, x, y, s, col = '#5a6b3a', label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rrect(ctx, -90, -120, 180, 220, 30); fillStroke(ctx, col, 7);
  line(ctx, -60, -120, -60, 100, 8, 'rgba(0,0,0,.35)'); line(ctx, 60, -120, 60, 100, 8, 'rgba(0,0,0,.35)'); rrect(ctx, -40, -40, 80, 50, 10); fillStroke(ctx, 'rgba(255,255,255,.2)', 5);
  if (label) text(ctx, label, 0, 150, 40, '#fff', INK, 8); ctx.restore();
}
function canopy(ctx, x, y, r, col = '#e9725b', open = 1, sway = 0) {
  if (open <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(sway); ctx.scale(open, open);
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); for (let k = 4; k >= 0; k--) ctx.quadraticCurveTo(-r + (k + .5) * r * .4, r * .14, -r + k * r * .4, 0); ctx.closePath(); fillStroke(ctx, col, 7);
  for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-r + k * r * .4, 0); ctx.quadraticCurveTo(-r + k * r * .4, -r * .7, 0, -r); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.stroke(); }
  for (let k = 0; k <= 5; k++) line(ctx, -r + k * r * .4, 0, 0, r * 1.3, 3, 'rgba(20,20,30,.7)'); ctx.restore();
}
function fuelTruck(ctx, x, base, s = 1) { ctx.save(); ctx.translate(x, base); ctx.scale(s, s); rrect(ctx, -260, -170, 340, 130, 60); fillStroke(ctx, '#e8e2d2', 7); text(ctx, 'FUEL', -90, -104, 54, REDC, INK, 0); rrect(ctx, 90, -190, 150, 150, 18); fillStroke(ctx, REDC, 7); rrect(ctx, 150, -170, 70, 60, 10); fillStroke(ctx, '#33415c', 5); ctx.fillStyle = '#555'; ctx.fillRect(-260, -45, 500, 16); for (const wx of [-180, 0, 170]) { circle(ctx, wx, -20, 36); fillStroke(ctx, '#222', 6); circle(ctx, wx, -20, 12); ctx.fillStyle = '#999'; ctx.fill(); } ctx.restore(); }
function cockpit(ctx, c, t, o = {}) {
  const { warn = 0, stormy = 1, curtain = 0 } = o;
  night(ctx, c); ctx.fillStyle = '#0b1220'; ctx.fillRect(-400, -300, 2800, 1000);
  if (stormy) { cloudBank(ctx, 420, t, 'rgba(60,70,95,.95)', 260, 5); }
  ctx.fillStyle = '#2a2f3a'; for (const [a, b] of [[-400, 120], [880, 1040], [1800, 2400]]) ctx.fillRect(a, -300, b - a, 1000);
  path(ctx, [[120, 150], [880, 150], [880, 640], [120, 640]]); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); path(ctx, [[1040, 150], [1800, 150], [1800, 640], [1040, 640]]); ctx.stroke();
  if (stormy) rain(ctx, t, .45, 90, .5);
  rrect(ctx, -200, 640, 2400, 600, 30); fillStroke(ctx, '#3a404c', 8);
  for (let k = 0; k < 9; k++) { const gx = 260 + k * 180; circle(ctx, gx, 780, 56); fillStroke(ctx, '#111', 6); line(ctx, gx, 780, gx + Math.cos(k + t * .3) * 40, 780 + Math.sin(k + t * .3) * 40, 5, '#fff'); }
  const on = warn > 0 && Math.sin(t * 10) > -.2; circle(ctx, 960, 930, 46); fillStroke(ctx, on ? '#ff3b30' : '#5a2020', 7);
  if (on) { ctx.save(); const g = ctx.createRadialGradient(960, 930, 10, 960, 930, 260); g.addColorStop(0, 'rgba(255,60,48,.55)'); g.addColorStop(1, 'rgba(255,60,48,0)'); ctx.fillStyle = g; ctx.fillRect(700, 680, 520, 500); ctx.restore(); }
  text(ctx, 'AFT STAIR', 960, 1015, 30, on ? '#ffb3ad' : '#9aa', INK, 0);
}
function curtain(ctx, x, top, h, w, open = 0) { const ww = w * (1 - open * .8); rrect(ctx, x, top, ww, h, 8); fillStroke(ctx, '#8a3b3b', 6); for (let k = 1; k < 7; k++) line(ctx, x + k * ww / 7, top + 10, x + k * ww / 7, top + h - 10, 4, 'rgba(0,0,0,.25)'); }

// --- map card (stylised; not to scale) ---
const MAP = { Seattle: [.55, .1], Tacoma: [.5, .24], Portland: [.42, .86], Jump: [.6, .6], Tena: [.33, .8] };
function mapCard(ctx, x, y, w, h, o = {}) {
  const { route = 0, jump = 0, search = 0, tena = 0, labels = 1, t = 0, circles = 0 } = o;
  card(ctx, x, y, w, h, '#efe4c6'); const X = u => x + u * w, Y = v => y + v * h;
  ctx.save(); rrect(ctx, x, y, w, h, 28); ctx.clip();
  ctx.fillStyle = '#9fc6d6'; ctx.beginPath(); ctx.moveTo(X(.35), Y(0)); ctx.bezierCurveTo(X(.42), Y(.1), X(.4), Y(.2), X(.46), Y(.3)); ctx.bezierCurveTo(X(.5), Y(.33), X(.47), Y(.15), X(.5), Y(0)); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 14; ctx.strokeStyle = '#9fc6d6'; ctx.beginPath(); ctx.moveTo(X(0), Y(.74)); ctx.bezierCurveTo(X(.25), Y(.76), X(.35), Y(.82), X(.5), Y(.8)); ctx.bezierCurveTo(X(.7), Y(.78), X(.85), Y(.82), X(1), Y(.8)); ctx.stroke();
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(X(.48), Y(.79)); ctx.bezierCurveTo(X(.55), Y(.7), X(.6), Y(.66), X(.75), Y(.62)); ctx.stroke();
  for (const [u, v] of [[.7, .4], [.78, .5], [.68, .52], [.82, .66], [.62, .45], [.74, .72], [.86, .4], [.55, .5]]) { path(ctx, [[X(u), Y(v) - 26], [X(u) + 16, Y(v) + 8], [X(u) - 16, Y(v) + 8]]); fillStroke(ctx, '#5f8f5a', 3); }
  ctx.restore();
  if (route > 0) { const p0 = MAP.Seattle, p1 = [.62, 1.05]; const u = clamp(route); ctx.save(); ctx.setLineDash([22, 16]); line(ctx, X(p0[0]), Y(p0[1]), X(lerp(p0[0], p1[0], u)), Y(lerp(p0[1], p1[1], u)), 8, REDC); ctx.restore(); planeIcon(ctx, X(lerp(p0[0], p1[0], u)), Y(lerp(p0[1], p1[1], u)), 30, Math.atan2(p1[1] - p0[1], (p1[0] - p0[0]) * w / h) , '#fff'); }
  if (jump > 0) { const [u, v] = MAP.Jump; circle(ctx, X(u), Y(v), 70 * easeOut(clamp(jump)) + (circles ? Math.sin(t * 4) * 6 : 0)); ctx.lineWidth = 7; ctx.strokeStyle = REDC; ctx.stroke(); text(ctx, '?', X(u), Y(v), 70 * clamp(jump), REDC, INK, 0); }
  if (search > 0) { const r = rng(9); for (let k = 0; k < Math.floor(search * 14); k++) { const u = MAP.Jump[0] + (r() - .5) * .3, v = MAP.Jump[1] + (r() - .5) * .3; circle(ctx, X(u), Y(v), 10); fillStroke(ctx, AMBER, 3); } }
  if (tena > 0) { const [u, v] = MAP.Tena; ctx.save(); ctx.translate(X(u), Y(v)); ctx.scale(tena, tena); path(ctx, [[0, 0], [-22, -40], [22, -40]]); fillStroke(ctx, GREEN, 5); circle(ctx, 0, -48, 22); fillStroke(ctx, GREEN, 5); ctx.restore(); }
  if (labels) for (const n of ['Seattle', 'Tacoma', 'Portland']) { const [u, v] = MAP[n]; circle(ctx, X(u), Y(v), 12); fillStroke(ctx, INK, 3); text(ctx, n, X(u) + 24, Y(v), 34, INK, INK, 0, 'Poppins', 700, 'left'); }
}

// --- forest, search, river ---
function pine(ctx, x, base, h, col = '#2f5d46', dark = 0) { const c = dark ? mix(col, '#0b1420', dark) : col; rrect(ctx, x - h * .05, base - h * .2, h * .1, h * .2, 4); fillStroke(ctx, '#5a3b26', 4);
  for (let k = 0; k < 3; k++) { const w = h * (.42 - k * .1), yb = base - h * .15 - k * h * .25; path(ctx, [[x, yb - h * .45], [x + w, yb], [x - w, yb]]); fillStroke(ctx, c, 5); } }
function forest(ctx, base, seed = 2, n = 16, hMin = 220, hMax = 420, dark = 0, x0 = -100, x1 = 2020) { const r = rng(seed); const arr = []; for (let i = 0; i < n; i++) arr.push([lerp(x0, x1, (i + r() * .6) / n), lerp(hMin, hMax, r())]); arr.sort((a, b) => a[1] - b[1]); for (const [x, h] of arr) pine(ctx, x, base + r() * 30, h, '#2f5d46', dark); }
function beam(ctx, x, y, ang, len, a = .35) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(255,240,180,${a})`); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(len, -len * .22); ctx.lineTo(len, len * .22); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); ctx.restore(); }
function helicopter(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ellipse(ctx, 0, 0, 110, 60); fillStroke(ctx, '#55606e', 7); rrect(ctx, 80, -16, 170, 26, 12); fillStroke(ctx, '#55606e', 6); ellipse(ctx, -40, -6, 50, 38); fillStroke(ctx, '#9fd0ff', 5); line(ctx, -30, 60, -30, 85, 6); line(ctx, 50, 60, 50, 85, 6); line(ctx, -80, 85, 90, 85, 8); line(ctx, 0, -60, 0, -84, 8); const sp = Math.sin(t * 40) * 200; line(ctx, -sp, -86, sp, -86, 10); circle(ctx, 250, -4, 30 * Math.abs(Math.sin(t * 30))); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
function water(ctx, y, t, col = '#5f8fae', x0 = -400, x1 = 2400) { ctx.fillStyle = col; ctx.fillRect(x0, y, x1 - x0, 1200); for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let x = x0; x <= x1; x += 40) ctx.lineTo(x, y + 30 + k * 50 + Math.sin(x * .01 + t * 2 + k) * 8); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke(); } line(ctx, x0, y, x1, y, 6); }
function sandBank(ctx, y, col = '#e2c898') { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-400, y); for (let x = -400; x <= 2400; x += 80) ctx.lineTo(x, y + Math.sin(x * .004) * 20); ctx.lineTo(2400, 1500); ctx.lineTo(-400, 1500); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); const r = rng(5); ctx.fillStyle = 'rgba(120,90,50,.25)'; for (let i = 0; i < 70; i++) { circle(ctx, r() * 2000, y + 40 + r() * 300, 3 + r() * 4); ctx.fill(); } }
function rake(ctx, x0, y0, x1, y1) { line(ctx, x0, y0, x1, y1, 10, '#8a5a2a'); ctx.save(); ctx.translate(x1, y1); ctx.rotate(Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2); line(ctx, -50, 0, 50, 0, 8); for (let k = -2; k <= 2; k++) line(ctx, k * 24, 0, k * 24, 24, 5); ctx.restore(); }

// --- case-file things ---
function corkBoard(ctx, x, y, w, h) { rrect(ctx, x - 20, y - 20, w + 40, h + 40, 20); fillStroke(ctx, '#7a5233', 8); rrect(ctx, x, y, w, h, 10); fillStroke(ctx, '#c79a63', 5); const r = rng(11); ctx.fillStyle = 'rgba(90,55,25,.18)'; for (let i = 0; i < 120; i++) { circle(ctx, x + r() * w, y + r() * h, 2 + r() * 3); ctx.fill(); } }
function pin(ctx, x, y, col = REDC) { circle(ctx, x, y, 13); fillStroke(ctx, col, 4); }
function polaroid(ctx, x, y, w, rot, who, label, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const h = w * 1.18; rrect(ctx, -w / 2, -h / 2, w, h, 6); fillStroke(ctx, '#fbfaf5', 5);
  const pw = w * .84; ctx.save(); rrect(ctx, -pw / 2, -h / 2 + w * .08, pw, pw, 4); ctx.clip(); ctx.fillStyle = o.bg || '#3d4a63'; ctx.fillRect(-pw / 2, -h / 2, pw, pw * 1.2);
  if (who) drawStick(ctx, C(who, { x: 0, y: -h / 2 + w * .08 + pw * 1.25, s: pw * 1.45, shadow: false, face: o.face || { eyes: 'normal', mouth: 'flat' } }));
  ctx.restore(); rrect(ctx, -pw / 2, -h / 2 + w * .08, pw, pw, 4); fillStroke(ctx, null, 4);
  if (label) text(ctx, label, 0, h / 2 - w * .12, w * .12, INK, INK, 0, 'Lora', 700); ctx.restore(); pin(ctx, x, y - h / 2 + 8);
}
function redString(ctx, pts, p = 1) { if (p <= 0) return; ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = '#c0262a'; ctx.beginPath(); ctx.moveTo(...pts[0]); const n = pts.length - 1, u = p * n; for (let k = 1; k <= n; k++) { const f = clamp(u - (k - 1)); if (f <= 0) break; ctx.lineTo(lerp(pts[k - 1][0], pts[k][0], f), lerp(pts[k - 1][1], pts[k][1], f)); } ctx.stroke(); ctx.restore(); }
function folder(ctx, x, y, w, h, label, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rrect(ctx, -w / 2, -h / 2 - 40, w * .38, 60, 14); fillStroke(ctx, '#d9b56a', 6); rrect(ctx, -w / 2, -h / 2, w, h, 16); fillStroke(ctx, '#e6c27a', 7); if (label) text(ctx, label, 0, -h / 2 + 80, w * .085, '#5a4320', INK, 0); ctx.restore(); }
function newspaper(ctx, x, y, w, rot, head, sub, hi = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const h = w * .72; rrect(ctx, -w / 2, -h / 2, w, h, 6); fillStroke(ctx, '#f4f0e4', 6);
  text(ctx, 'THE DAILY NEWS', 0, -h / 2 + 50, w * .045, '#333', INK, 0, 'Lora', 700); line(ctx, -w / 2 + 30, -h / 2 + 85, w / 2 - 30, -h / 2 + 85, 4);
  if (hi > 0) { ctx.font = `700 ${w * .085}px Poppins`; const tw = ctx.measureText(head).width; ctx.fillStyle = `rgba(245,197,66,${.85 * hi})`; ctx.fillRect(-tw / 2 - 10, -h / 2 + 115, (tw + 20) * hi, w * .1); }
  text(ctx, head, 0, -h / 2 + 165, w * .085, INK, INK, 0); if (sub) text(ctx, sub, 0, -h / 2 + 240, w * .04, '#444', INK, 0, 'Lora', 700);
  for (let k = 0; k < 6; k++) { line(ctx, -w / 2 + 40, -h / 2 + 300 + k * 30, -w / 2 + 40 + w * .42, -h / 2 + 300 + k * 30, 6, 'rgba(0,0,0,.18)'); line(ctx, 20, -h / 2 + 300 + k * 30, w / 2 - 40, -h / 2 + 300 + k * 30, 6, 'rgba(0,0,0,.18)'); }
  ctx.restore();
}
function tieProp(ctx, x, y, s, rot = 0, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 120, 20, 0, 120, 330); g.addColorStop(0, `rgba(245,185,66,${.45 * glow})`); g.addColorStop(1, 'rgba(245,185,66,0)'); ctx.fillStyle = g; ctx.fillRect(-340, -220, 680, 680); }
  path(ctx, [[-45, -150], [45, -150], [30, -95], [-30, -95]]); fillStroke(ctx, '#17171d', 7);
  path(ctx, [[-30, -95], [30, -95], [70, 300], [0, 370], [-70, 300]]); fillStroke(ctx, '#17171d', 7);
  rrect(ctx, -70, 20, 140, 22, 8); fillStroke(ctx, GOLD, 5); circle(ctx, 0, 31, 8); ctx.fillStyle = '#fff6e0'; ctx.fill(); ctx.restore();
}
function evidenceBox(ctx, x, base, w, h, label) { rrect(ctx, x - w / 2, base - h, w, h, 10); fillStroke(ctx, '#c49a62', 7); line(ctx, x - w / 2, base - h + 50, x + w / 2, base - h + 50, 5); rrect(ctx, x - w * .3, base - h * .55, w * .6, h * .3, 6); fillStroke(ctx, '#fff', 5); if (label) text(ctx, label, x, base - h * .4, h * .11, INK, INK, 0); }
function microscope(ctx, x, base, s) { ctx.save(); ctx.translate(x, base); ctx.scale(s, s); rrect(ctx, -150, -40, 300, 40, 12); fillStroke(ctx, '#3a404c', 7); ctx.save(); ctx.translate(-60, -40); ctx.rotate(-.35); rrect(ctx, -25, -330, 50, 330, 20); fillStroke(ctx, '#e8eaee', 7); ctx.restore(); rrect(ctx, -40, -330, 70, 200, 20); fillStroke(ctx, '#f4f5f7', 7); rrect(ctx, -20, -400, 40, 80, 10); fillStroke(ctx, '#3a404c', 6); rrect(ctx, -120, -170, 240, 26, 8); fillStroke(ctx, '#8b929e', 6); rrect(ctx, -30, -130, 30, 70, 8); fillStroke(ctx, '#3a404c', 5); ctx.restore(); }
function lens(ctx, x, y, r, t, n = 60, rare = 0) {
  ctx.save(); circle(ctx, x, y, r); ctx.fillStyle = '#121a26'; ctx.fill(); ctx.clip(); const q = rng(21);
  for (let i = 0; i < n; i++) { const a = q() * TAU, d = Math.sqrt(q()) * r, px = x + Math.cos(a) * d + Math.sin(t * .6 + i) * 8, py = y + Math.sin(a) * d + Math.cos(t * .5 + i) * 8; circle(ctx, px, py, 4 + q() * 8); ctx.fillStyle = `hsla(${200 + q() * 60},40%,${50 + q() * 30}%,.8)`; ctx.fill(); }
  for (let i = 0; i < 8 * rare; i++) { const a = q() * TAU, d = Math.sqrt(q()) * r * .8, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; star5(ctx, px, py, 14 + q() * 8, t + i, ['#ffd23a', '#7df3ff', '#ff7ad1'][i % 3]); }
  ctx.restore(); circle(ctx, x, y, r); ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.stroke();
}
function dnaHelix(ctx, x, y, h, t, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; for (let k = 0; k <= 20; k++) { const v = k / 20, yy = y - h / 2 + v * h, ph = v * TAU * 1.5 + t * 2, x1 = x + Math.sin(ph) * 80, x2 = x - Math.sin(ph) * 80; line(ctx, x1, yy, x2, yy, 5, k % 2 ? '#7df3ff' : '#ff7ad1'); circle(ctx, x1, yy, 10); fillStroke(ctx, AMBER, 3); circle(ctx, x2, yy, 10); fillStroke(ctx, '#9fd0ff', 3); } ctx.restore(); }
function hospitalBed(ctx, x, base) { rrect(ctx, x - 300, base - 190, 600, 60, 18); fillStroke(ctx, '#f4f5f7', 7); rrect(ctx, x - 320, base - 300, 40, 300, 12); fillStroke(ctx, '#9aa3ad', 6); rrect(ctx, x + 280, base - 240, 40, 240, 12); fillStroke(ctx, '#9aa3ad', 6); rrect(ctx, x - 270, base - 250, 160, 60, 24); fillStroke(ctx, '#fff', 6); line(ctx, x - 300, base - 130, x - 300, base, 8); line(ctx, x + 300, base - 130, x + 300, base, 8); }
function house(ctx, x, base, s = 1) { ctx.save(); ctx.translate(x, base); ctx.scale(s, s); rrect(ctx, -200, -260, 400, 260, 8); fillStroke(ctx, '#e9d3a8', 7); path(ctx, [[-240, -250], [0, -420], [240, -250]]); fillStroke(ctx, REDC, 7); rrect(ctx, -50, -150, 100, 150, 8); fillStroke(ctx, '#8a5a2a', 6); for (const k of [-1, 1]) { rrect(ctx, k * 130 - 45, -200, 90, 80, 6); fillStroke(ctx, '#9fd0ff', 5); } ctx.restore(); }
function metalDetector(ctx, x, base, s = 1, beepA = 0) { ctx.save(); ctx.translate(x, base); ctx.scale(s, s); rrect(ctx, -170, -460, 60, 460, 14); fillStroke(ctx, '#c9ced8', 7); rrect(ctx, 110, -460, 60, 460, 14); fillStroke(ctx, '#c9ced8', 7); rrect(ctx, -190, -500, 380, 60, 16); fillStroke(ctx, '#9aa3ad', 7); circle(ctx, 0, -470, 16); ctx.fillStyle = beepA > 0 ? '#ff3b30' : '#3a7a3a'; ctx.fill(); ctx.restore(); }
function xrayBelt(ctx, x, base, s = 1, t = 0) { ctx.save(); ctx.translate(x, base); ctx.scale(s, s); rrect(ctx, -420, -170, 840, 50, 14); fillStroke(ctx, '#3a404c', 7); rrect(ctx, -170, -420, 340, 260, 24); fillStroke(ctx, '#c9ced8', 7); rrect(ctx, -120, -330, 240, 140, 10); fillStroke(ctx, '#1b2b3b', 5); line(ctx, -400, -120, -400, 0, 10); line(ctx, 400, -120, 400, 0, 10); const bx = ((t * 120) % 900) - 450; rrect(ctx, bx - 70, -260, 140, 90, 12); fillStroke(ctx, bx > -170 && bx < 170 ? 'rgba(120,200,255,.6)' : '#7a5233', 6); ctx.restore(); }
function tailClose(ctx, x, y, s, stairs = 0, vane = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = () => { ctx.beginPath(); ctx.moveTo(-900, -130); ctx.lineTo(200, -130); ctx.quadraticCurveTo(330, -120, 370, 0); ctx.lineTo(380, 90); ctx.lineTo(-900, 120); ctx.closePath(); };
  path(ctx, [[60, -128], [330, -440], [470, -440], [340, -110]]); fillStroke(ctx, '#c8392b', 8); rrect(ctx, 250, -470, 300, 40, 18); fillStroke(ctx, '#e8eaee', 7);
  rrect(ctx, -90, -190, 300, 90, 45); fillStroke(ctx, '#d5d9e0', 7); ellipse(ctx, 210, -145, 16, 40); ctx.fillStyle = '#333'; ctx.fill();
  body(); ctx.fillStyle = '#f4f5f7'; ctx.fill(); ctx.save(); body(); ctx.clip(); ctx.fillStyle = '#c8392b'; ctx.fillRect(-950, -20, 1400, 26); ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(-950, 40, 1400, 100); ctx.restore(); body(); fillStroke(ctx, null, 8);
  for (let k = 0; k < 9; k++) { rrect(ctx, -860 + k * 95, -90, 40, 52, 18); ctx.fillStyle = '#33415c'; ctx.fill(); }
  ctx.save(); ctx.translate(300, 96); ctx.rotate(stairs * .7); rrect(ctx, -380, -14, 380, 34, 8); fillStroke(ctx, '#8b929e', 7); for (let k = 1; k < 7; k++) line(ctx, -k * 54, -14, -k * 54, 20, 4); ctx.restore();
  if (vane > 0) { ctx.save(); ctx.translate(-120, 112); ctx.rotate(lerp(1.3, 0, easeOut(clamp(vane)))); rrect(ctx, -6, -10, 26, 110, 8); fillStroke(ctx, AMBER, 6); ctx.restore(); }
  ctx.restore();
}

// --- titles + end ---
function sectionTitle(ctx, lt, t, kicker, title) {
  night(ctx, drift(t, lt)); stars(ctx, 40, 5, .35);
  const p = popIn(lt, .05, .4); ctx.save(); ctx.translate(960, 500); ctx.scale(p, p);
  ctx.font = '700 116px Poppins'; let lines = [title];
  if (ctx.measureText(title).width > 1500) { const w = title.split(' '); let best = 1, bd = 1e9;
    for (let k = 1; k < w.length; k++) { const d = Math.abs(ctx.measureText(w.slice(0, k).join(' ')).width - ctx.measureText(w.slice(k).join(' ')).width); if (d < bd) { bd = d; best = k; } }
    lines = [w.slice(0, best).join(' '), w.slice(best).join(' ')]; }
  const two = lines.length > 1, size = two ? 106 : 116;
  text(ctx, kicker.toUpperCase(), 0, two ? -175 : -110, 46, AMBER, INK, 0);
  lines.forEach((l, k) => text(ctx, l, 0, two ? -65 + k * 128 : 10, size, '#f4f1e8', INK, 0)); ctx.restore();
  const uy = two ? 685 : 620, u = clamp((lt - .3) / .5); line(ctx, 960 - 340 * u, uy, 960 + 340 * u, uy, 14, REDC);
}
function endScreen(ctx, lt, t) {
  night(ctx, { x: 960, y: 540, z: 1 }); stars(ctx, 50, 8, .4);
  for (const x of [250, 1010]) { rrect(ctx, x, 260, 660, 372, 26); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); ctx.setLineDash([16, 12]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke(); ctx.setLineDash([]); }
  text(ctx, 'More unsolved mysteries', 960, 170, 64, '#f4f1e8', INK, 0);
  text(ctx, 'Subscribe so you don\'t miss the next case', 960, 780, 52, AMBER, INK, 0);
  silhouette(ctx, 160, 1010, 300, '#0b0f18'); bigQ(ctx, 160, 640, 110, AMBER, .9);
  drawStick(ctx, C(COOPER, { x: 1770, y: 1010, s: 300, arms: { L: [.3, -.1], R: [2.4, .3] }, face: { eyes: 'normal', mouth: 'smirk' } }));
}
