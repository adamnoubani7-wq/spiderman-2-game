// ---------- characters ----------
const YOU = { cols: PAL.blue, hat: 'none', belt: false };
const HERO = { cols: ['#d8312b', '#d8312b'], vest: '#2f63c9', belt: false, hat: 'mask' };
const STRONG = { cols: PAL.red, hat: 'none', belt: false };
const PROF = { cols: PAL.green, hat: 'none', belt: false };
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const pushArms = { L: [1.5, -.15], R: [1.45, -.1] }; // both arms straight out in front

const SHOTS = [];
// A: hook. A car speeds at you, you throw your hands up
SHOTS.push({ start: 0, end: 3.04, tr: 'whip', draw(ctx, lt, t) {
  const sh = shake(t, 2 + lt * 2, 2, 1);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 + lt * .05 };
  drawStreet(ctx, t, cam, lt * 300);
  applyCam(ctx, cam, 1);
  const cx = kf(lt, [[0, -700], [3.04, 330]], x => x);
  speedLines(ctx, t, 8, 750, 1150, 1, .5);
  drawCarSide(ctx, cx, 1240, 1.0, { col: '#2f9be0', spin: t * 14 });
  for (let i = 0; i < 3; i++) puff(ctx, cx - 300 - i * 60, 1220 - i * 10, 40 + i * 10, t, '#f3efe6', 3 + i, .5 - i * .15);
  const scared = lt > 1.5;
  drawStick(ctx, C(YOU, { x: 860, y: 1240, s: 420, flip: -1, arms: scared ? pushArms : { L: [.3, -.1], R: [.3, -.1] }, lean: scared ? .06 : 0,
    face: { eyes: scared ? 'wide' : 'normal', mouth: scared ? 'o' : 'smile', look: [-.8, 0] } }));
  if (scared) sweat(ctx, 760, 760, 36, inv(1.6, 1.9, lt));
} });
// B: movie hero plants his feet and the car crumples on his hands
SHOTS.push({ start: 3.04, end: 5.92, tr: 'cut', draw(ctx, lt, t) {
  const hit = 5.36 - 3.04;
  const sh = shake(t, lt > hit ? 14 * Math.exp(-(lt - hit) * 5) : 2, 3, 2);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.08 };
  drawStreet(ctx, t, cam, 0, { skyTop: '#ff9a5a', skyBot: '#ffe0a8' });
  applyCam(ctx, cam, 1);
  const cx = lt < hit ? kf(lt, [[0, -500], [hit, 300]], x => x) : 300;
  const crush = lt < hit ? 0 : kf(lt, [[hit, 0], [hit + .15, 1, backOut]]);
  drawCarSide(ctx, cx, 1240, 1.0, { col: '#e9725b', crush, spin: lt < hit ? t * 14 : 0 });
  drawStick(ctx, C(HERO, { x: 700, y: 1240, s: 430, flip: -1, arms: pushArms, legs: { L: [.5, -.4], R: [.2, -.1] }, lean: .05, face: { eyes: lt > hit + .3 ? 'happy' : 'normal' } }));
  if (lt > hit && lt < hit + .4) burst(ctx, 560, 1080, 140 * inv(hit, hit + .12, lt), 11, '#ffd23a', 4);
} });
// C: "let's do the math"
SHOTS.push({ start: 5.92, end: 7.12, tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1.0 + lt * .05 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#f3e4c8', '#e7d2ad', -600, 1600);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#c98a52'; ctx.fillRect(-600, 1180, 2400, 1200);
  drawBoard(ctx, 110, 250, 860, 560);
  chalk(ctx, 'F = ?', 540, 520, 150, inv(.2, .7, lt), '#ffe27a', 'center');
  drawStick(ctx, C(PROF, { x: 540, y: 1240, s: 400, squash: lerp(.6, 1, backOut(inv(0, .3, lt))), arms: { L: [.3, -.1], R: { ik: [.38, -1.05] } }, face: { eyes: 'normal', look: [.3, -1], mouth: 'grin', browUp: 1 } }));
} });
// D: a small car weighs about 1500 kg
SHOTS.push({ start: 7.12, end: 10.0, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#8fd3f7', '#e8f7ff', -600, 1500);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#d99a5e'; ctx.fillRect(-600, 1180, 2400, 1000);
  const drop = kf(lt, [[0, -900], [.5, 0, easeIn]]);
  const sq = lt > .5 ? 1 - .08 * Math.exp(-(lt - .5) * 8) * Math.abs(Math.sin((lt - .5) * 30)) : 1;
  drawScale(ctx, 540, 1000, 760, lt < .5 ? '0 kg' : Math.round(kf(lt, [[.5, 0], [1.36, 1500]])) + ' kg');
  ctx.save(); ctx.translate(540, 1000 + drop); ctx.scale(1, sq); drawCarSide(ctx, 0, 0, 1.15, { col: '#3fa35b' }); ctx.restore();
  if (lt > .5 && lt < .8) { puff(ctx, 180, 1000, 80 * inv(.5, .8, lt), t, '#f3efe6', 3, 1 - inv(.6, .8, lt)); puff(ctx, 900, 1000, 80 * inv(.5, .8, lt), t, '#f3efe6', 5, 1 - inv(.6, .8, lt)); }
} });
// E: the mechanism. 50 km/h, stop in 1 m, 145,000 newtons
SHOTS.push({ start: 10.0, end: 16.64, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 };
  const stop0 = 12.08 - 10, stop1 = 13.4 - 10;
  const v = lt < stop0 ? 1 : 1 - inv(stop0, stop1, lt);
  let scroll = 0; for (let x = 0; x < lt; x += .02) scroll += (x < stop0 ? 1 : 1 - inv(stop0, stop1, x)) * .02 * 900;
  drawStreet(ctx, t, cam, scroll);
  applyCam(ctx, cam, 1);
  drawGauge(ctx, 820, 470, 170, 50 * v, 120, Math.round(50 * v) + ' km/h');
  const carX = lt < stop0 ? 380 : 380 + 120 * easeOut(inv(stop0, stop1, lt));
  drawCarSide(ctx, carX, 1240, .9, { col: '#2f9be0', spin: scroll / 50 });
  if (v > .05) speedLines(ctx, t, 8, 800, 1150, -1, .5 * v);
  const m = inv(12.88 - 10, 13.3 - 10, lt);
  if (m > 0) { ctx.save(); ctx.globalAlpha = m; line(ctx, 500, 930, 740, 930, 8, '#ffe14d'); line(ctx, 500, 900, 500, 960, 8, '#ffe14d'); line(ctx, 740, 900, 740, 960, 8, '#ffe14d'); text(ctx, '1 m', 620, 870, 60, '#ffe14d', INK, 10); ctx.restore(); }
  const f = inv(14.08 - 10, 14.6 - 10, lt);
  if (f > 0) { arrow(ctx, 1080 - 30, 820, lerp(1080, 700, easeOut(f)), 820, 90, '#e0392f'); text(ctx, '145,000 N', 540, 680, 110 * backOut(f), '#fff', INK, 16); }
} });
// F: like holding up 15 tons
SHOTS.push({ start: 16.64, end: 18.72, tr: 'whip', draw(ctx, lt, t) {
  const drop = kf(lt, [[0, -700], [.25, 0, easeIn]]);
  const land = lt > .25 ? Math.exp(-(lt - .25) * 6) * Math.sin((lt - .25) * 30) : 0;
  const sh = shake(t, lt > .25 ? 3 + 10 * Math.exp(-(lt - .25) * 5) : 0, 3, 4);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 + lt * .04 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#ffcf6b', '#ffeccb', -600, 1500);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#d99a5e'; ctx.fillRect(-600, 1240, 2400, 1000); line(ctx, -600, 1240, 1800, 1240, 6);
  const sq = 1 - .12 * Math.abs(land) - (lt > .25 ? .07 : 0), tr = Math.sin(t * 40) * .02;
  drawStick(ctx, C(YOU, { x: 540, y: 1240, s: 620, squash: sq, legs: { L: [.6 + tr, -.9], R: [.6 - tr, -.9] }, arms: { L: { ik: [-.3, -1.22 + drop / 620] }, R: { ik: [.3, -1.22 + drop / 620] } }, face: { eyes: lt > .25 ? 'squint' : 'wide', mouth: lt > .25 ? 'teeth' : 'o' } }));
  drawWeight(ctx, 540, 1240 - 1.22 * 620 * sq + 30 + drop, .95, '15 t');
  sweat(ctx, 700, 700, 36, inv(.6, .8, lt)); sweat(ctx, 380, 760, 30, inv(1.1, 1.3, lt));
} });
// G: the deadlift record, then 30 times that
SHOTS.push({ start: 18.72, end: 25.04, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .015 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#20305c', '#3a4f8c', -600, 1600);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#2b2630'; ctx.fillRect(-600, 1240, 2400, 1000);
  const many = 23.52 - 18.72;
  if (lt < many - .2) {
    const lift = kf(lt, [[1.0, 0], [2.2, 1]]);
    const barY = lerp(1150, 900, lift);
    drawStick(ctx, C(STRONG, { x: 540, y: 1240, s: 560, squash: lerp(.82, 1, lift), legs: { L: [.4 - .3 * lift, -.5 + .4 * lift], R: [.4 - .3 * lift, -.5 + .4 * lift] }, arms: { L: { ik: [-.28, (barY - 1240) / 560] }, R: { ik: [.28, (barY - 1240) / 560] } }, face: { eyes: 'squint', mouth: 'teeth' } }));
    drawBarbell(ctx, 540, barY, 720, 5);
    const r = inv(20.32 - 18.72, 20.8 - 18.72, lt); if (r > 0) text(ctx, '510 kg', 540, 420, 150 * backOut(r), '#ffe14d', INK, 18);
    text(ctx, 'world record', 540, 560, 54, '#fff', INK, 9);
  } else {
    const p = inv(many - .2, many + .8, lt);
    for (let i = 0; i < 30; i++) { const a = clamp(p * 30 - i); if (a <= 0) continue; const cx = 160 + (i % 6) * 152, cy = 520 + Math.floor(i / 6) * 150;
      drawStick(ctx, C(STRONG, { x: cx, y: cy + 50, s: 120 * backOut(a), shadow: false, arms: { L: [2.6, .2], R: [2.6, .2] }, face: { eyes: 'squint', mouth: 'teeth' } })); }
    const x = inv(24.4 - 18.72, 24.7 - 18.72, lt); if (x > 0) text(ctx, 'x30', 540, 330, 170 * backOut(x), '#ffe14d', INK, 20);
  }
} });
// H: the twist
SHOTS.push({ start: 25.04, end: 27.68, tr: 'cut', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1.0 + lt * .06 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#7a4bc4', '#c97bd1', -600, 1600);
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(HERO, { x: 540, y: 1240, s: 700, arms: { L: [.9, -2.2], R: [.9, -2.2] }, face: { eyes: lt > 1.3 ? 'wide' : 'happy' } }));
  const q = inv(26.8 - 25.04, 27.0 - 25.04, lt); if (q > 0) text(ctx, '?', 820, 420, 260 * backOut(q), '#ffe14d', INK, 24);
  const tw = inv(.5, .8, lt); if (tw > 0 && lt < 1.3) text(ctx, 'twist', 540, 360, 130 * backOut(tw), '#fff', INK, 16);
} });
// I: the mechanism. Your grip is only as strong as your weight
SHOTS.push({ start: 27.68, end: 31.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2); const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 };
  drawStreet(ctx, t, cam, 0);
  applyCam(ctx, cam, 1);
  drawCarSide(ctx, 340, 1240, .9, { col: '#2f9be0' });
  drawStick(ctx, C(YOU, { x: 700, y: 1240, s: 430, flip: -1, arms: pushArms, legs: { L: [.5, -.4], R: [.2, -.1] }, lean: .08, face: { eyes: 'squint', mouth: 'teeth' } }));
  const w = inv(30.24 - 27.68, 30.6 - 27.68, lt); if (w > 0) { arrow(ctx, 880, 800, 880, lerp(800, 1150, easeOut(w)), 46, '#2f63c9'); text(ctx, 'weight', 880, 740, 54, '#fff', INK, 9); }
  const g = inv(28.56 - 27.68, 29.0 - 27.68, lt); if (g > 0) { arrow(ctx, 760, 1258, lerp(760, 650, easeOut(g)), 1258, 26, '#ffe14d'); text(ctx, 'grip', 560, 1250, 50, '#ffe14d', INK, 9); }
  const c = inv(31.0 - 27.68, 31.4 - 27.68, lt); if (c > 0) { arrow(ctx, 480, 1170, lerp(480, 1060, easeOut(c)), 1170, 80, '#e0392f'); if (c > .6) text(ctx, 'car', 800, 1170, 48, '#fff', INK, 9); }
} });
// J: the car shoves you down the street like a shopping cart
SHOTS.push({ start: 31.6, end: 34.88, tr: 'whip', draw(ctx, lt, t) {
  const sh = shake(t, 4, 2, 3); const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 };
  const go = inv(32.56 - 31.6, 32.9 - 31.6, lt);
  let scroll = 0; for (let x = 0; x < lt; x += .02) scroll += inv(32.56 - 31.6, 32.9 - 31.6, x) * .02 * 700;
  drawStreet(ctx, t, cam, scroll);
  applyCam(ctx, cam, 1);
  drawCarSide(ctx, 340, 1240, .9, { col: '#2f9be0', spin: scroll / 50 });
  drawStick(ctx, C(YOU, { x: 700, y: 1240, s: 430, flip: -1, arms: pushArms, legs: { L: [-.5, -.1], R: [-.3, -.05] }, lean: -.18 * go, face: { eyes: go > .5 ? 'spiral' : 'squint', mouth: 'o' }, t }));
  if (go > 0) { for (let i = 0; i < 4; i++) puff(ctx, 640 - i * 70 - ((t * 400) % 70), 1230, 34 + i * 6, t, '#f3efe6', 7 + i, .7 * go - i * .12); speedLines(ctx, t, 8, 750, 1150, -1, .5 * go); }
  const sc = inv(34.0 - 31.6, 34.3 - 31.6, lt);
  if (sc > 0) { ctx.save(); ctx.translate(880, 520); ctx.scale(backOut(sc), backOut(sc));
    rrect(ctx, -110, -70, 220, 120, 12); fillStroke(ctx, '#cfd4dc', 7); for (let i = 1; i < 5; i++) line(ctx, -110 + i * 44, -70, -110 + i * 44, 50, 4, '#8d94a0');
    line(ctx, -110, -70, -150, -110, 8, INK); for (const wx of [-80, 80]) { circle(ctx, wx, 76, 18); fillStroke(ctx, '#2b2630', 6); }
    ctx.restore(); }
} });
// K: payoff. Bolted to the road, the car stops
SHOTS.push({ start: 34.88, end: 39.9, tr: 'cut', draw(ctx, lt, t) {
  const bolt = 38.24 - 34.88, hit = bolt + .5;
  const sh = shake(t, lt > hit ? 12 * Math.exp(-(lt - hit) * 5) : 2, 3, 5);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.04 + lt * .01 };
  drawStreet(ctx, t, cam, 0);
  applyCam(ctx, cam, 1);
  const cx = lt < bolt ? 120 : kf(lt, [[bolt, 120], [hit, 300]], x => x);
  const crush = lt < hit ? 0 : kf(lt, [[hit, 0], [hit + .15, .8, backOut]]);
  drawCarSide(ctx, cx, 1240, .9, { col: '#e9725b', crush, spin: lt > bolt && lt < hit ? t * 14 : 0 });
  drawStick(ctx, C(HERO, { x: 700, y: 1240, s: 430, flip: -1, arms: lt > bolt ? pushArms : { L: [.9, -2.2], R: [.9, -2.2] }, legs: { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: lt > hit + .3 ? 'happy' : 'normal' } }));
  for (const [bx, d] of [[640, 0], [760, .12]]) { const b = inv(bolt + d, bolt + d + .15, lt); if (b > 0) { drawBolt(ctx, bx, lerp(900, 1230, easeIn(b)), .9, 1); if (b >= 1 && lt < bolt + d + .4) burst(ctx, bx, 1240, 70, 9, '#ffd23a', 9); } }
  const st = inv(36.8 - 34.88, 37.1 - 34.88, lt);
  if (st > 0 && lt < bolt) { ctx.save(); ctx.globalAlpha = 1 - inv(37.6 - 34.88, 37.8 - 34.88, lt); text(ctx, 'stronger', 540, 420, 110, '#fff', INK, 14); line(ctx, 300, 420, lerp(300, 780, inv(37.1 - 34.88, 37.4 - 34.88, lt)), 420, 14, '#e0392f'); ctx.restore(); }
  if (lt > hit) burst(ctx, 560, 1080, lt < hit + .3 ? 140 * inv(hit, hit + .12, lt) : 0, 11, '#ffd23a', 4);
} });
