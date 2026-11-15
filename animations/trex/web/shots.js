// ---------- characters ----------
const YOU = { cols: PAL.blue, hat: 'none', belt: false };
const SCI = { cols: PAL.green, hat: 'none', belt: false };
const FAST = { cols: PAL.yellow, hat: 'none', belt: false };
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const runLegs = (t, sp = 16, amp = .8) => ({ L: [Math.sin(t * sp) * amp + .1, -Math.max(0, Math.sin(t * sp + 1)) * 1.2], R: [-Math.sin(t * sp) * amp + .1, -Math.max(0, -Math.sin(t * sp + 1)) * 1.2] });
const runArms = (t, sp = 16, amp = .9) => ({ L: [.5 - Math.sin(t * sp) * amp, -1.2], R: [.5 + Math.sin(t * sp) * amp, -1.2] });
const stomp = (t, sp) => Math.pow(Math.max(0, Math.cos(t * sp)), 12); // spikes at each footfall

const SHOTS = [];
// A: hook. T. rex chases you down a jungle road
SHOTS.push({ start: 0, end: 3.52, tr: 'whip', draw(ctx, lt, t) {
  const sh = shake(t, 3 + 10 * stomp(t, 5), 3, 1);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 };
  drawJungle(ctx, t, cam, t * 600);
  applyCam(ctx, cam, 1);
  drawRex(ctx, 60 + Math.sin(t * 2) * 20, 1240, .95, t * 5, { jaw: .5 + .5 * Math.sin(t * 6), look: 1 });
  drawStick(ctx, C(YOU, { x: 860, y: 1240, s: 330, lean: .2, legs: runLegs(t), arms: runArms(t), face: { eyes: 'wide', mouth: 'o', look: [-1, 0] } }));
  sweat(ctx, 800, 890, 30, 1);
  speedLines(ctx, t, 8, 500, 1200, -1, .4);
} });
// B: in the movie it keeps up with a speeding jeep
SHOTS.push({ start: 3.52, end: 6.16, tr: 'cut', draw(ctx, lt, t) {
  const sh = shake(t, 4 + 6 * stomp(t, 6), 3, 2);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 };
  drawJungle(ctx, t, cam, t * 1300, { skyTop: '#ffb36b', skyBot: '#ffe6b8' });
  applyCam(ctx, cam, 1);
  drawCarSide(ctx, 760, 1240, .75, { col: '#3fa35b', spin: t * 20 });
  drawRex(ctx, 40, 1240, .82, t * 6, { jaw: .6, look: 1 });
  speedLines(ctx, t, 12, 400, 1200, -1, .6);
  const f = inv(5.2 - 3.52, 5.5 - 3.52, lt); if (f > 0) text(ctx, 'movie magic?', 540, 420, 84 * backOut(f), '#fff', INK, 12);
} });
// C: 2017, scientists model the skeleton on a computer
SHOTS.push({ start: 6.16, end: 10.96, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .02 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#e8e1d4', '#d3c7b1', -600, 1600);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#9a6a3e'; ctx.fillRect(-600, 1180, 2400, 1000);
  const draw = inv(9.12 - 6.16, 10.3 - 6.16, lt);
  drawComputer(ctx, 540, 330, 860, 560, () => {
    ctx.save(); ctx.translate(540, 830); ctx.scale(.62, .62); ctx.globalAlpha = Math.min(1, draw * 1.5);
    ctx.beginPath(); ctx.rect(-700, -700, 1400 * draw, 900); ctx.clip();
    drawRex(ctx, 0, 0, 1, 0, { bones: true }); ctx.restore();
  });
  const y = inv(6.4 - 6.16, 6.9 - 6.16, lt); if (y > 0) text(ctx, '2017', 900, 300, 90 * backOut(y), '#ffe14d', INK, 14);
  drawStick(ctx, C(SCI, { x: 300, y: 1240, s: 360, arms: { L: [.3, -.1], R: { ik: [.42, -.9] } }, face: { eyes: 'normal', look: [.7, -.6], mouth: 'smile', browUp: 1 } }));
  drawStick(ctx, C(SCI, { x: 800, y: 1240, s: 360, cols: PAL.purple, arms: { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: 'normal', look: [-.5, -.8], mouth: 'o' } }));
} });
// D: if it tried to run, its leg bones would likely break
SHOTS.push({ start: 10.96, end: 15.2, tr: 'whip', draw(ctx, lt, t) {
  const brk = 13.68 - 10.96;
  const sh = shake(t, lt > brk ? 16 * Math.exp(-(lt - brk) * 4) : 2, 3, 3);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 + lt * .03 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#0f1a2e', '#1d3557', -600, 1600);
  applyCam(ctx, cam, 1);
  ctx.strokeStyle = 'rgba(80,200,255,.12)'; ctx.lineWidth = 2; for (let gx = -600; gx < 1700; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, -600); ctx.lineTo(gx, 2400); ctx.stroke(); }
  const ph = lt < brk ? t * 9 : brk * 9;
  drawRex(ctx, 560, 1180, .7, ph, { bones: true, crack: inv(brk, brk + .15, lt) });
  if (lt > brk && lt < brk + .4) burst(ctx, 650, 1010, 120 * inv(brk, brk + .1, lt), 10, '#ff4a3d', 5);
  const r = inv(11.68 - 10.96, 12.0 - 10.96, lt); if (r > 0 && lt < brk) text(ctx, 'run!', 540, 380, 110 * backOut(r), '#fff', INK, 14);
  const k = inv(brk, brk + .25, lt); if (k > 0) text(ctx, 'crack', 540, 380, 120 * backOut(k), '#ff4a3d', INK, 16);
} });
// E: so it could only walk
SHOTS.push({ start: 15.2, end: 18.32, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 };
  drawJungle(ctx, t, cam, lt * 120);
  applyCam(ctx, cam, 1);
  const s = inv(.3, .7, lt); if (s > 0) drawSign(ctx, 860, 1100, .9 * backOut(s), 'NO', 'RUNNING');
  drawRex(ctx, 330, 1240, .9, t * 2.4, { jaw: .1, look: 1 });
} });
// F: but its legs were huge: stride comparison + 28 km/h
SHOTS.push({ start: 18.32, end: 25.44, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 };
  const go = inv(21.36 - 18.32, 22.0 - 18.32, lt);
  drawJungle(ctx, t, cam, t * 500 * go);
  applyCam(ctx, cam, 1);
  drawRex(ctx, 360, 1240, .95, t * (2.4 + 1.6 * go), { jaw: .2, look: 1 });
  const L = inv(19.92 - 18.32, 20.4 - 18.32, lt);
  if (L > 0 && go < .5) { ctx.save(); ctx.globalAlpha = L * (1 - go * 2); line(ctx, 220, 1262, 700, 1262, 8, '#ffe14d'); line(ctx, 220, 1236, 220, 1288, 8, '#ffe14d'); line(ctx, 700, 1236, 700, 1288, 8, '#ffe14d'); text(ctx, 'huge stride', 500, 1200 - 600, 70, '#fff', INK, 12); ctx.restore(); }
  drawStick(ctx, C(YOU, { x: 940, y: 1240, s: 230, face: { eyes: 'wide', mouth: 'o', look: [-1, -.4] } }));
  const v = go * 28 * inv(22.4 - 18.32, 23.6 - 18.32, lt);
  if (go > 0) drawGauge(ctx, 820, 470, 160, v, 50, Math.round(v) + ' km/h');
} });
// G: most people sprint about 25, for a few seconds
SHOTS.push({ start: 25.44, end: 29.92, tr: 'whip', draw(ctx, lt, t) {
  const tired = inv(28.72 - 25.44, 29.4 - 25.44, lt);
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 };
  drawJungle(ctx, t, cam, t * 500 * (1 - tired * .7));
  applyCam(ctx, cam, 1);
  const sp = 16 - tired * 9;
  drawStick(ctx, C(YOU, { x: 520, y: 1240, s: 420, lean: .2 - tired * .25, legs: runLegs(t, sp, .8 - tired * .4), arms: tired > .5 ? { L: [.2, -.1], R: [.2, -.1] } : runArms(t, sp), face: { eyes: tired > .5 ? 'squint' : 'normal', mouth: tired > .5 ? 'o' : 'grin' } }));
  if (tired > .3) { sweat(ctx, 650, 760, 34, tired); sweat(ctx, 400, 800, 28, tired); }
  const v = 25 * inv(.2, 1.6, lt) * (1 - tired * .6);
  drawGauge(ctx, 820, 470, 160, v, 50, Math.round(v) + ' km/h');
} });
// H: Usain Bolt topped out at about 45
SHOTS.push({ start: 29.92, end: 32.48, tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1.0 };
  drawJungle(ctx, t, cam, t * 1400, { skyTop: '#ffd166', skyBot: '#fff1c4' });
  applyCam(ctx, cam, 1);
  speedLines(ctx, t, 14, 400, 1200, -1, .7);
  drawStick(ctx, C(FAST, { x: 560, y: 1240, s: 420, lean: .28, legs: runLegs(t, 24, .95), arms: runArms(t, 24), face: { eyes: 'normal', mouth: 'grin' } }));
  const v = 45 * inv(.3, 1.8, lt);
  const b = inv(31.76 - 29.92, 32.0 - 29.92, lt); if (b > 0) burst(ctx, 820, 470, 230 * b, 12, '#ffe14d', 6);
  drawGauge(ctx, 820, 470, 160, v, 50, Math.round(v) + ' km/h');
} });
// I: Bolt escapes easily, the T. rex is left in the dust
SHOTS.push({ start: 32.48, end: 34.32, tr: 'cut', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1.0 };
  drawJungle(ctx, t, cam, 0);
  applyCam(ctx, cam, 1);
  const bx = lerp(620, 1500, easeIn(inv(.2, 1.0, lt)));
  drawStick(ctx, C(FAST, { x: bx, y: 1240, s: 300, lean: .28, legs: runLegs(t, 24), arms: runArms(t, 24), face: { mouth: 'grin' } }));
  for (let i = 0; i < 4; i++) puff(ctx, bx - 160 - i * 80, 1230, 30 + i * 10, t, '#f3efe6', 3 + i, Math.max(0, .7 - i * .15));
  drawRex(ctx, 150, 1240, .8, 0, { jaw: .05, look: 1 });
  const q = inv(.9, 1.2, lt); if (q > 0) text(ctx, '?', 400, 520, 200 * backOut(q), '#ffe14d', INK, 20);
} });
// J: payoff. You'd better find a really good hiding spot
SHOTS.push({ start: 34.32, end: 37.5, tr: 'cut', draw(ctx, lt, t) {
  const peek = inv(35.84 - 34.32, 36.6 - 34.32, lt);
  const sh = shake(t, 2 + 6 * stomp(t, 3) * (1 - peek), 3, 4);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 + lt * .03 };
  drawJungle(ctx, t, cam, 0);
  applyCam(ctx, cam, 1);
  drawRex(ctx, lerp(-320, 60, easeOut(peek)), 1240, .9, t * 1.2 * (1 - peek), { jaw: 0, look: 1 });
  const tr = Math.sin(t * 40) * .02;
  drawStick(ctx, C(YOU, { x: 800, y: 1240, s: 330, squash: .82, legs: { L: [.6 + tr, -1.0], R: [.6 - tr, -1.0] }, arms: { L: [1.6, -2.4], R: [1.6, -2.4] }, face: { eyes: 'wide', mouth: 'frown', look: [-1, 0] } }));
  for (const [bx, r] of [[690, 110], [800, 130], [910, 110], [745, 100], [860, 105]]) { circle(ctx, bx, 1255 - (r - 100) * .5, r); fillStroke(ctx, '#3fa35b', 7); }
  sweat(ctx, 800, 960, 30, 1);
} });
