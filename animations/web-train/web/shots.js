// ---------- characters ----------
const HERO = { cols: ['#d8312b', '#d8312b'], vest: '#2f63c9', belt: false, hat: 'mask' };
const STU1 = { cols: PAL.blue, hat: 'none', belt: false };
const STU2 = { cols: PAL.green, hat: 'none', belt: false };
const STU3 = { cols: PAL.purple, hat: 'none', belt: false };
const FAN1 = { cols: PAL.yellow, hat: 'none', belt: false };
const FAN2 = { cols: PAL.navy, hat: 'none', belt: false };
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
function handPos(o, k) {
  const s = o.s, side = k === 'L' ? -1 : 1, al = o.armLen || 1; const [a1, a2] = o.arms[k];
  const p = limbPts(side * .1, -.535, side, a1, a2, .14 * al, .13 * al);
  return [o.x + p[2][0] * s * (o.flip || 1), o.y + (p[2][1] + (o.bob || 0)) * s];
}
// side-on city with the elevated track (rail top at 1180)
function cityScene(ctx, t, cam, scroll, o = {}) {
  applyCam(ctx, cam, .1); drawSky(ctx, '#4fb0f0', '#dff3ff', -900, 1200);
  applyCam(ctx, cam, .15); drawCloud(ctx, 200 - scroll * .02, 260, 120, 1); drawCloud(ctx, 860 - scroll * .02, 170, 90, 2); drawCloud(ctx, 1200 - scroll * .02, 420, 70, 3, .9);
  if (o.behindFar) { applyCam(ctx, cam, .5); o.behindFar(ctx); }
  applyCam(ctx, cam, .5); ctx.save(); ctx.translate(-((scroll * .2) % 1800), 0); drawSkyline(ctx, 1150, 4, .75, -900, 3200, .45); ctx.restore();
  applyCam(ctx, cam, .75); ctx.save(); ctx.translate(-((scroll * .45) % 2400), 0); drawSkyline(ctx, 1260, 7, 1, -900, 4200, 0); ctx.restore();
  applyCam(ctx, cam, 1); drawTrack(ctx, 1180, -1400, 2600, scroll);
}

const SHOTS = [];
// A: hook. Train rushing at camera, hero bracing with webs
SHOTS.push({ start: 0, end: 3.36, tr: 'whip', draw(ctx, lt, t) {
  const sh = shake(t, 4 + lt * 3, 2.2, 1);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.04 + lt * .05, r: Math.sin(t * 9) * .004 };
  applyCam(ctx, cam, .2); drawSky(ctx, '#3a8fe0', '#bfe4fa', -600, 900);
  applyCam(ctx, cam, .4); drawSkyline(ctx, 900, 2, .8, -700, 1800, .35);
  applyCam(ctx, cam, 1);
  // deck in perspective
  ctx.beginPath(); ctx.moveTo(-600, 2400); ctx.lineTo(500, 900); ctx.lineTo(580, 900); ctx.lineTo(1680, 2400); ctx.closePath(); fillStroke(ctx, '#6d6372', 6);
  const sp = (t * 2.2) % 1;
  for (let i = 0; i < 14; i++) { const k = Math.pow((i + sp) / 14, 2.2); const y = 900 + k * 1400; const hw = 40 + k * 1100; line(ctx, 540 - hw, y, 540 + hw, y, 4 + k * 22, '#4d4352'); }
  for (const s of [-1, 1]) line(ctx, 540 + s * 14, 900, 540 + s * 520, 2400, 12, '#c9c2cc');
  const ts = kf(lt, [[0, .45], [3.36, 1.05]], x => x * x * .3 + x * .7);
  drawTrainFront(ctx, 540, lerp(1060, 1560, inv(.45, 1.05, ts)), ts, t, 1);
  speedLines(ctx, t, 10, 250, 1100, -1, .35);
  const hero = C(HERO, { x: 540, y: 1700, s: 860, lean: Math.sin(t * 7) * .02, legs: { L: [.45, -.3], R: [.45, -.3] }, arms: { L: [2.35, .25], R: [2.35, .25] },
    face: { eyes: lt < 1.6 ? 'wide' : 'squint' }, shadow: false });
  const hl = handPos(hero, 'L'), hr = handPos(hero, 'R');
  webLine(ctx, hl[0], hl[1], -140, 120, 30, 9); webLine(ctx, hr[0], hr[1], 1220, 120, 30, 9);
  drawStick(ctx, hero);
  sweat(ctx, 720, 700, 40, inv(1.8, 2.1, lt));
} });
// B: side view, hero on the front of the speeding train shoots webs
SHOTS.push({ start: 3.36, end: 8.16, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 560 + hh[0], y: 980 + hh[1], z: 1.0 + lt * .03 };
  const scroll = lt * 1100;
  cityScene(ctx, t, cam, scroll);
  applyCam(ctx, cam, 1);
  const bob = Math.sin(t * 20) * 3;
  drawCar(ctx, -330, 1180 + bob, 460); drawCar(ctx, 150, 1180 + bob, 460, { front: 1 });
  speedLines(ctx, t, 12, 300, 1150, -1, .6);
  const shoot1 = 5.5 - 3.36, shoot2 = 5.9 - 3.36;
  const hero = C(HERO, { x: 700, y: 1180 + bob, s: 300, lean: -.08, legs: { L: [.35, -.2], R: [.3, -.1] },
    arms: { L: lt > shoot1 ? [2.5, .1] : [.4, -.4], R: lt > shoot2 ? [2.2, .1] : [.4, -.4] }, face: { eyes: lt > shoot1 ? 'squint' : 'normal' } });
  for (const [ts, ax0, ay, k] of [[shoot1, 1020, 420, 'L'], [shoot2, 1180, 600, 'R']]) {
    if (lt < ts) continue;
    const hp = handPos(hero, k); const ext = clamp((lt - ts) / .18);
    const ax = ax0 - Math.max(0, lt - ts - .18) * 1100 * .45 * 1.6;
    const ex = lerp(hp[0], ax, ext), ey = lerp(hp[1], ay, ext);
    webLine(ctx, hp[0], hp[1], ex, ey, ext < 1 ? 0 : 20, 6);
    if (ext >= 1) webSplat(ctx, ax, ay, 34);
  }
  drawStick(ctx, hero);
} });
// C: movie theatre. "pure movie magic"
SHOTS.push({ start: 8.16, end: 10.40, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .04 };
  applyCam(ctx, cam, .2); drawSky(ctx, '#1d1030', '#3b2160', -600, 1600);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, 'rgba(160,200,255,.35)'); g.addColorStop(1, 'rgba(160,200,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(380, -100); ctx.lineTo(700, -100); ctx.lineTo(1300, 1300); ctx.lineTo(-200, 1300); ctx.closePath(); ctx.fill(); ctx.restore();
  applyCam(ctx, cam, 1);
  for (const sx of [330, 750]) { rrect(ctx, sx - 190, 620, 380, 520, 60); fillStroke(ctx, '#b83246', 7); rrect(ctx, sx - 210, 1000, 420, 150, 30); fillStroke(ctx, '#9a2639', 7); }
  const magic = lt > 1.6;
  const seat = { L: [.9, -1.6], R: [.9, -1.6] };
  drawStick(ctx, C(FAN1, { x: 330, y: 1150, s: 520, legs: seat, arms: { L: [.5, -.6], R: [1.1, -1.4] }, face: { eyes: magic ? 'half' : 'normal', look: magic ? [.5, -1] : [0, -.4], mouth: magic ? 'flat' : 'smile' } }));
  const wave = magic ? kf(lt, [[1.6, 1.4], [1.85, 2.7, backOut]]) : .5;
  drawStick(ctx, C(FAN2, { x: 750, y: 1150, s: 520, legs: seat, arms: { L: [.5, -.6], R: [wave, magic ? .3 : -.6] }, face: { eyes: magic ? 'smug' : 'normal', look: [0, -.4], mouth: magic ? 'smirk' : 'o' } }));
  // popcorn
  ctx.beginPath(); ctx.moveTo(470, 940); ctx.lineTo(610, 940); ctx.lineTo(590, 1120); ctx.lineTo(490, 1120); ctx.closePath(); fillStroke(ctx, '#fff', 6);
  ctx.save(); ctx.clip(); ctx.fillStyle = '#e0392f'; for (let i = 0; i < 4; i++) ctx.fillRect(478 + i * 36, 930, 18, 200); ctx.restore();
  ctx.beginPath(); ctx.moveTo(470, 940); ctx.lineTo(610, 940); ctx.lineTo(590, 1120); ctx.lineTo(490, 1120); ctx.closePath(); fillStroke(ctx, null, 6);
  for (let i = 0; i < 7; i++) { circle(ctx, 482 + i * 19, 930 - (i % 2) * 14, 18); fillStroke(ctx, '#fff2b8', 4); }
  if (magic) { const a = inv(1.6, 1.9, lt); const R = rng(4); for (let i = 0; i < 9; i++) { const an = R() * TAU, d = 80 + R() * 200 * a; star5(ctx, 870 + Math.cos(an) * d, 520 + Math.sin(an) * d, 18 + R() * 20, t * 3 + i, i % 2 ? '#ffe14d' : '#ff9de2'); } sparkle(ctx, 880, 520, 70 * a, a); }
} });
// D: three students at the chalkboard run the numbers
function classroom(ctx, t, cam) {
  applyCam(ctx, cam, .3); drawSky(ctx, '#f3e4c8', '#e7d2ad', -600, 1600);
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#c98a52'; ctx.fillRect(-600, 1180, 2400, 1200); line(ctx, -600, 1180, 1800, 1180, 6);
  drawBoard(ctx, 110, 250, 860, 600);
}
SHOTS.push({ start: 10.40, end: 14.64, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .02 };
  classroom(ctx, t, cam);
  chalk(ctx, '2012', 160, 350, 84, inv(.24, .9, lt), '#ffe27a');
  chalk(ctx, 'F = m × a', 160, 500, 72, inv(2.9, 3.4, lt));
  chalk(ctx, 'm = 4 subway cars', 160, 610, 56, inv(3.3, 3.8, lt));
  chalk(ctx, 'web = ?', 160, 720, 64, inv(3.7, 4.1, lt), '#ff9de2');
  const pops = [1.6, 1.8, 2.0];
  [[STU1, 260], [STU2, 540], [STU3, 820]].forEach(([who, x], i) => {
    const p = inv(pops[i], pops[i] + .3, lt); if (p <= 0) return;
    const writing = i === 1 && lt > 2.9;
    drawStick(ctx, C(who, { x, y: 1240, s: 400, squash: lerp(.6, 1, backOut(p)), arms: writing ? { L: [.3, -.1], R: { ik: [.38, -1.05] } } : { L: [.3, -.1], R: [.3, -.1] },
      face: { eyes: 'normal', look: lt > 2.6 ? [.3, -1] : [0, 0], browUp: 1, mouth: lt > 2.6 ? 'o' : 'smile' } }));
  });
} });
// E: four subway cars at full speed, 300,000 newtons to stop
SHOTS.push({ start: 14.64, end: 19.76, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 900 + hh[1], z: .56 + lt * .01 };
  const spd = lt2 => kf(lt2, [[1.36, 0], [1.7, 1], [4.4, 1], [4.95, 0]]);
  let scroll = 0; for (let x = 1.36; x < lt; x += .02) scroll += spd(x) * .02 * 1500;
  cityScene(ctx, t, cam, scroll);
  applyCam(ctx, cam, 1);
  const go = spd(lt), jig = Math.sin(t * 24) * 4 * go;
  const arrive = [0, .32, .8, .96];
  for (let i = 3; i >= 0; i--) {
    const p = inv(arrive[i], arrive[i] + .3, lt); if (p <= 0) continue;
    const x = 1020 - i * 480, y = 1180 - (1 - backOut(p)) * 420 + jig;
    ctx.save(); ctx.globalAlpha = clamp(p * 3); drawCar(ctx, x, y, 460, { front: i === 0 ? 1 : 0 }); ctx.restore();
    if (i < 3 && lt > arrive[i + 1] + .3) { rrect(ctx, x - 26, y - 150, 32, 70, 4); fillStroke(ctx, '#3a3340', 5); }
  }
  if (go > 0) speedLines(ctx, t, 10, 300, 1150, -1, .5 * go);
  // force arrow pushing back on the train
  const ap = inv(2.96, 3.5, lt);
  if (ap > 0) {
    const tip = lerp(1700, 260, easeOut(ap)), y = 560, tail = 1700;
    const pts = [[tip, y], [tip + 150, y - 130], [tip + 150, y - 55], [tail, y - 55], [tail, y + 55], [tip + 150, y + 55], [tip + 150, y + 130]];
    path(ctx, pts); fillStroke(ctx, '#d8312b', 12);
    ctx.save(); path(ctx, pts); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-500, y - 60, 3000, 30); ctx.restore();
    const ta = inv(3.2, 3.5, lt); ctx.save(); ctx.globalAlpha = ta; text(ctx, '300,000 N', lerp(1500, 960, easeOut(ap)), y, 120, '#fff', INK, 16); ctx.restore();
  }
  if (lt > 3.0 && lt < 3.3) { burst(ctx, 1470, 1050, 150 * inv(3.0, 3.15, lt), 11, '#ffd23a', 3); }
} });
// F: "like holding up over thirty tons"
SHOTS.push({ start: 19.76, end: 21.92, tr: 'whip', draw(ctx, lt, t) {
  const drop = kf(lt, [[0, -700], [.25, 0, easeIn]]);
  const land = lt > .25 ? Math.exp(-(lt - .25) * 6) * Math.sin((lt - .25) * 30) : 0;
  const sh = shake(t, lt > .25 ? 3 + 10 * Math.exp(-(lt - .25) * 5) : 0, 3, 4);
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 + lt * .04 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#ffcf6b', '#ffeccb', -600, 1500);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#d99a5e'; ctx.fillRect(-600, 1240, 2400, 1000); line(ctx, -600, 1240, 1800, 1240, 6);
  const sq = 1 - .12 * Math.abs(land) - (lt > .25 ? .05 : 0), tremble = Math.sin(t * 40) * .02;
  drawStick(ctx, C(FAN1, { x: 540, y: 1240, s: 620, squash: sq, legs: { L: [.6 + tremble, -.9], R: [.6 - tremble, -.9] },
    arms: { L: { ik: [-.3, -1.22 + drop / 620] }, R: { ik: [.3, -1.22 + drop / 620] } }, face: { eyes: lt > .25 ? 'squint' : 'wide', mouth: lt > .25 ? 'teeth' : 'o' } }));
  drawWeight(ctx, 540, 1240 - 1.22 * 620 * sq + 30 + drop, .95, '30 t');
  sweat(ctx, 700, 700, 36, inv(.6, .8, lt)); sweat(ctx, 380, 760, 30, inv(1.1, 1.3, lt));
  if (lt > .25 && lt < .5) puff(ctx, 300, 1240, 90 * inv(.25, .5, lt), t, '#f3efe6', 3, 1 - inv(.35, .5, lt)), puff(ctx, 780, 1240, 90 * inv(.25, .5, lt), t, '#f3efe6', 5, 1 - inv(.35, .5, lt));
} });
// G: mechanism. Top-down: the strand stretches and soaks up the crash
SHOTS.push({ start: 21.92, end: 25.84, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .02 };
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#7f8c99'; ctx.fillRect(-600, -600, 2400, 3200);
  ctx.fillStyle = '#a7b3bf'; for (let y = -600; y < 2600; y += 120) ctx.fillRect(390, y, 300, 20);
  for (const x of [400, 680]) line(ctx, x, -600, x, 2600, 8, '#5d5262');
  for (const [x, w, col] of [[-400, 570, '#e9725b'], [910, 600, '#7a8fd6']]) { rrect(ctx, x, 120, w, 1500, 10); fillStroke(ctx, col, 8); for (let i = 0; i < 4; i++) { rrect(ctx, x + (x < 0 ? 440 : 40), 260 + i * 300, 80, 80, 8); fillStroke(ctx, mix(col, '#000000', .2), 5); } }
  const contact = 1.84, ay = 640;
  const pull = lt < contact ? 0 : kf(lt, [[contact, 0], [3.2, 360, easeOut], [3.7, 330]]);
  const noseY = lt < contact ? lerp(1750, ay, lt / contact) : ay - pull;
  const twang = lt > 1.04 && lt < contact ? Math.sin((lt - 1.04) * 45) * 24 * Math.exp(-(lt - 1.04) * 4) : 0;
  drawTrainTop(ctx, 540, noseY, 1);
  if (lt < contact + .3) for (let i = 0; i < 6; i++) { const y = noseY + 300 + i * 160 + ((t * 900) % 160); line(ctx, 330, y, 330, y + 90, 6, 'rgba(255,255,255,.7)'); line(ctx, 750, y, 750, y + 90, 6, 'rgba(255,255,255,.7)'); }
  if (lt < contact) webLine(ctx, 170, ay, 910, ay, twang, 9);
  else webPath(ctx, [[170, ay], [450, noseY + 30], [540, noseY - 8], [630, noseY + 30], [910, ay]], 9);
  webSplat(ctx, 170, ay, 40); webSplat(ctx, 910, ay, 40);
  if (lt > contact && lt < contact + .35) burst(ctx, 540, noseY - 40, 110 * inv(contact, contact + .15, lt), 10, '#ffd23a', 6);
} });
// H: weight for weight, silk vs steel
SHOTS.push({ start: 25.84, end: 30.24, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 900 + hh[1], z: 1.0 + lt * .03 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#8fd3f7', '#e8f7ff', -600, 1500);
  applyCam(ctx, cam, 1);
  rrect(ctx, 140, 320, 800, 50, 10); fillStroke(ctx, '#9a5a2a', 7);
  text(ctx, 'silk', 340, 260, 64, '#fff', INK, 12); text(ctx, 'steel', 740, 260, 64, '#fff', INK, 12);
  drawSpider(ctx, 225, 300, .3, t, { smile: true, wiggle: .4 });
  const load = kf(lt, [[2.3, .45], [3.6, .62]]);
  const snap = 29.82 - 25.84;
  const sStretch = kf(lt, [[2.3, 0], [3.6, 50]]) + (lt > snap ? Math.sin((lt - snap) * 14) * 25 * Math.exp(-(lt - snap) * 3) : 0);
  const sy = 860 + sStretch;
  webLine(ctx, 340, 370, 340, sy - 292 * load + 5, 0, 5);
  drawWeight(ctx, 340, sy, load, '');
  if (lt < snap) { line(ctx, 740, 370, 740, 860 - 292 * load + 5, 9, INK); line(ctx, 740, 370, 740, 860 - 292 * load + 5, 4, '#b9c0c8'); drawWeight(ctx, 740, 860 + Math.sin(t * 50) * (lt > 3 ? 2 : 0), load, ''); }
  else {
    const dt = lt - snap, fall = 0.5 * 4000 * dt * dt, rec = Math.min(1, dt * 6);
    line(ctx, 740, 370, 740 + rec * 30, 560 - rec * 60, 9, INK); line(ctx, 740, 370, 740 + rec * 30, 560 - rec * 60, 4, '#b9c0c8');
    drawWeight(ctx, 740, 860 + fall, load, '');
    burst(ctx, 740, 580, 90 * clamp(1 - dt * 3), 9, '#ffd23a', 8);
  }
} });
// I1: Darwin's bark spider and its giant web over a river
SHOTS.push({ start: 30.24, end: 32.75, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 860 + hh[1], z: 1.0 + lt * .06 };
  applyCam(ctx, cam, .2); drawSky(ctx, '#5fbde8', '#e6f7e4', -600, 1100);
  applyCam(ctx, cam, .5); ctx.fillStyle = '#4f9a5c'; for (let i = 0; i < 9; i++) { circle(ctx, -200 + i * 190, 1010, 140); ctx.fill(); }
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#3aa0d8'; ctx.fillRect(-600, 1000, 2400, 1400);
  for (let i = 0; i < 8; i++) { const y = 1060 + i * 70, x = ((i * 233 + t * 60) % 1400) - 200; line(ctx, x, y, x + 120, y, 6, 'rgba(255,255,255,.6)'); }
  ctx.fillStyle = '#6fbf5a'; ctx.fillRect(-600, 980, 760, 60); ctx.fillRect(920, 980, 760, 60);
  drawTree(ctx, 90, 1000, 2.2); drawTree(ctx, 990, 1000, 2.2);
  const p = inv(0, 1.2, lt);
  for (const [x, y] of [[180, 520], [900, 520], [330, 980], [750, 980]]) { ctx.save(); ctx.globalAlpha = p; line(ctx, 540, 640, x, y, 3, 'rgba(255,255,255,.9)'); ctx.restore(); }
  orbWeb(ctx, 540, 640, 300, p, .95);
  drawSpider(ctx, 540, 610, .55 * backOut(inv(.4, .8, lt)), t, { smile: true, look: [0, .3] });
} });
// I2: toughness, Kevlar vs Darwin's bark spider silk
SHOTS.push({ start: 32.75, end: 34.96, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .02 };
  applyCam(ctx, cam, .3); drawSky(ctx, '#20305c', '#3a4f8c', -600, 1600);
  applyCam(ctx, cam, 1);
  text(ctx, 'toughness', 540, 320, 76, '#fff', INK, 12);
  line(ctx, 150, 1120, 930, 1120, 10, '#fff');
  const k = inv(.1, .4, lt), sp = inv(.65, 1.2, lt);
  const kh = 55 * backOut(k), shh = 560 * easeOut(sp);
  if (k > 0) { rrect(ctx, 230, 1120 - kh, 220, kh, 10); fillStroke(ctx, '#f2b52a', 8); }
  if (sp > 0) { rrect(ctx, 630, 1120 - shh, 220, shh, 10); fillStroke(ctx, '#e9725b', 8); }
  text(ctx, 'kevlar', 340, 1180, 50, '#fff', INK, 9);
  text(ctx, 'bark spider', 740, 1180, 50, '#fff', INK, 9);
  if (sp > 0) drawSpider(ctx, 740, 1120 - shh - 70, .32, t, { smile: true, wiggle: .5 });
  const tx = inv(1.0, 1.25, lt); if (tx > 0) { ctx.save(); ctx.translate(430, 720); ctx.scale(backOut(tx), backOut(tx)); text(ctx, '10x', 0, 0, 130, '#ffe14d', INK, 16); ctx.restore(); }
} });
// J: the students' number lands inside the bark spider's range
SHOTS.push({ start: 34.96, end: 37.92, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03 };
  classroom(ctx, t, cam);
  const X = v => 200 + v / 600 * 680;
  chalk(ctx, 'toughness  (MJ/m³)', 540, 330, 50, inv(0, .3, lt), '#f4f1e6', 'center');
  line(ctx, X(0), 560, X(600), 560, 7, '#f4f1e6');
  for (const v of [0, 200, 400, 600]) { line(ctx, X(v), 540, X(v), 580, 5, '#f4f1e6'); chalk(ctx, String(v), X(v), 620, 36, 1, '#f4f1e6', 'center'); }
  const band = inv(.3, .7, lt);
  if (band > 0) { ctx.save(); ctx.globalAlpha = .85; rrect(ctx, X(350), 535, (X(520) - X(350)) * band, 50, 10); fillStroke(ctx, '#5fbf9a', 4); ctx.restore(); chalk(ctx, 'bark spider', (X(350) + X(520)) / 2, 470, 44, band, '#bff0d2', 'center'); }
  const mk = inv(1.28, 1.6, lt);
  if (mk > 0) { const y = lerp(380, 520, easeOut(mk)); ctx.beginPath(); ctx.moveTo(X(500), y + 20); ctx.lineTo(X(500) - 26, y - 22); ctx.lineTo(X(500) + 26, y - 22); ctx.closePath(); fillStroke(ctx, '#ffe14d', 5); chalk(ctx, 'needed', X(500) - 30, 720, 52, inv(1.4, 1.8, lt), '#ffe27a', 'right'); }
  checkMark(ctx, 820, 720, .62, inv(2.4, 2.7, lt));
  const cheer = lt > 2.4;
  [[STU1, 260], [STU2, 540], [STU3, 820]].forEach(([who, x], i) => drawStick(ctx, C(who, { x, y: 1240, s: 400, bob: cheer ? -Math.abs(Math.sin(t * 9 + i)) * .04 : 0,
    arms: cheer ? { L: [2.6, .2], R: [2.6, .2] } : { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: cheer ? 'happy' : 'normal', look: [0, -1], mouth: cheer ? 'grin' : 'o' } })));
} });
// K: payoff. Train stopped, then the camera pulls back to a giant spider
SHOTS.push({ start: 37.92, end: 43.0, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const rev = 40.08 - 37.92;
  const pb = inv(rev, rev + 1.2, lt);
  const cam = { x: 560 + hh[0], y: lerp(980, 720, ease(pb)) + hh[1], z: lerp(1.08, .62, ease(pb)) };
  const sy = kf(lt, [[rev, 1150], [rev + 1.3, 330, easeOut]]);
  cityScene(ctx, t, cam, 0, { behindFar: c => { if (lt < rev - .1) return; c.save(); c.beginPath(); c.rect(-2000, -3000, 5000, 4150); c.clip(); drawSpider(c, 560, sy, 2.6, t, { smile: true, look: [-.3, 1], eyeR: 22, wiggle: .5 }); c.restore(); } });
  applyCam(ctx, cam, 1);
  drawCar(ctx, -330, 1180, 460); drawCar(ctx, 150, 1180, 460, { front: 1 });
  const hero = C(HERO, { x: 700, y: 1180, s: 300, arms: { L: [2.2, .2], R: [2.0, .3] }, legs: { L: [.15, -.05], R: [.15, -.05] },
    face: { eyes: lt > rev + .9 ? 'wide' : 'happy' }, headTilt: lt > rev + .9 ? -.15 : 0 });
  const hl = handPos(hero, 'L'), hr = handPos(hero, 'R');
  webLine(ctx, hl[0], hl[1], 120, 470, 25, 6); webLine(ctx, hr[0], hr[1], -160, 640, 30, 6);
  webSplat(ctx, 120, 470, 34);
  drawStick(ctx, hero);
  if (lt > rev + .9 && lt < rev + 1.5) { const a = inv(rev + .9, rev + 1.1, lt); text(ctx, '!', 820, 560, 120 * backOut(a), '#ffe14d', INK, 14); }
} });
