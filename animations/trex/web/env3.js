// ---------- street, car, gauges, barbell, bolts, arrows ----------
// side-view cartoon car facing right; (x, y) = point on the road under the car's centre; crush 0..1 squashes the nose
function drawCarSide(ctx, x, y, s, o = {}) {
  const col = o.col || '#2f9be0', crush = o.crush || 0, spin = o.spin || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 300, 22); ctx.fillStyle = 'rgba(40,20,30,.25)'; ctx.fill();
  const nose = 270 - crush * 90;
  const body = () => {
    ctx.beginPath(); ctx.moveTo(-280, -60); ctx.lineTo(-280, -150); ctx.quadraticCurveTo(-276, -170, -250, -172);
    ctx.lineTo(-180, -178); ctx.quadraticCurveTo(-120, -290, -40, -292); ctx.lineTo(70, -292); ctx.quadraticCurveTo(130, -290, 170, -200);
    ctx.lineTo(nose - 30, -185 + crush * 20); ctx.quadraticCurveTo(nose, -180 + crush * 20, nose, -140 + crush * 10);
    if (crush > 0) { for (let i = 0; i < 4; i++) ctx.lineTo(nose - (i % 2 ? 22 : 0) * crush, -120 + i * 18); }
    ctx.lineTo(nose, -60); ctx.closePath();
  };
  body(); fillStroke(ctx, col, 7);
  shadeShape(ctx, body, 1, .14, .25, [-280, -292, 560, 232]);
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(-280, -170, 560, 16); ctx.restore();
  // windows
  ctx.beginPath(); ctx.moveTo(-160, -182); ctx.quadraticCurveTo(-112, -270, -45, -272); ctx.lineTo(-10, -272); ctx.lineTo(-10, -182); ctx.closePath(); fillStroke(ctx, '#bfe6ff', 6);
  ctx.beginPath(); ctx.moveTo(10, -182); ctx.lineTo(10, -272); ctx.lineTo(62, -272); ctx.quadraticCurveTo(112, -270, 146, -192); ctx.closePath(); fillStroke(ctx, '#bfe6ff', 6);
  // lights, handle, bumper
  ellipse(ctx, nose - 18, -150 + crush * 10, 14, 18); fillStroke(ctx, crush > .3 ? '#ffd23a' : '#fff6b0', 5);
  rrect(ctx, -282, -150, 22, 32, 6); fillStroke(ctx, '#e0392f', 5);
  line(ctx, -60, -160, -30, -160, 8, INK);
  rrect(ctx, -295, -80, 30, 28, 8); fillStroke(ctx, '#9aa3ad', 5); rrect(ctx, nose - 12, -82, 28, 28, 8); fillStroke(ctx, '#9aa3ad', 5);
  // wheels
  for (const wx of [-170, 160]) {
    circle(ctx, wx, -50, 56); fillStroke(ctx, '#2b2630', 7); circle(ctx, wx, -50, 28); fillStroke(ctx, '#c9ced6', 5);
    for (let k = 0; k < 4; k++) { const a = spin + k * Math.PI / 2; line(ctx, wx, -50, wx + Math.cos(a) * 26, -50 + Math.sin(a) * 26, 5, '#6d6372'); }
  }
  ctx.restore();
}
function drawStreet(ctx, t, cam, scroll = 0, o = {}) {
  applyCam(ctx, cam, .1); drawSky(ctx, o.skyTop || '#4fb0f0', o.skyBot || '#dff3ff', -900, 1250);
  applyCam(ctx, cam, .15); drawCloud(ctx, 220 - scroll * .02, 260, 120, 1); drawCloud(ctx, 860 - scroll * .02, 180, 90, 2);
  applyCam(ctx, cam, .5); ctx.save(); ctx.translate(-((scroll * .2) % 1800), 0); drawSkyline(ctx, 1050, 5, .7, -900, 3200, .4); ctx.restore();
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#c9c2b6'; ctx.fillRect(-1400, 1000, 4000, 70); line(ctx, -1400, 1070, 2600, 1070, 6);
  ctx.fillStyle = '#5d5866'; ctx.fillRect(-1400, 1070, 4000, 1500);
  for (let x = -1400 - ((scroll % 260) + 260) % 260; x < 2600; x += 260) { rrect(ctx, x, 1300, 150, 18, 9); ctx.fillStyle = '#f2e9c9'; ctx.fill(); }
}
function arrow(ctx, x1, y1, x2, y2, w, col, label, lsize = 64) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); if (L < 4) return;
  const hl = Math.min(w * 2.6, L * .6);
  ctx.save(); ctx.translate(x1, y1); ctx.rotate(a);
  path(ctx, [[0, -w / 2], [L - hl, -w / 2], [L - hl, -w * 1.25], [L, 0], [L - hl, w * 1.25], [L - hl, w / 2], [0, w / 2]]); fillStroke(ctx, col, Math.max(5, w * .14));
  ctx.restore();
  if (label) text(ctx, label, (x1 + x2) / 2, (y1 + y2) / 2 - w * 1.5 - lsize * .2, lsize, '#fff', INK, lsize * .16);
}
function drawGauge(ctx, x, y, r, val, max, label) {
  circle(ctx, x, y, r); fillStroke(ctx, '#fffaf0', 8);
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (.8 + i * .14); line(ctx, x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, i % 5 ? 4 : 7, INK); }
  const a = Math.PI * (.8 + 1.4 * clamp(val / max)); line(ctx, x, y, x + Math.cos(a) * r * .72, y + Math.sin(a) * r * .72, 9, '#e0392f'); circle(ctx, x, y, 14); fillStroke(ctx, INK, 0);
  text(ctx, label, x, y + r * .48, r * .3, INK, INK, 0);
}
function drawBarbell(ctx, x, y, w, plates = 4) {
  line(ctx, x - w / 2, y, x + w / 2, y, 16, INK); line(ctx, x - w / 2, y, x + w / 2, y, 8, '#c9ced6');
  for (const s of [-1, 1]) for (let i = 0; i < plates; i++) { const px = x + s * (w / 2 - 40 - i * 34); rrect(ctx, px - 15, y - 120 + i * 6, 30, 240 - i * 12, 8); fillStroke(ctx, i % 2 ? '#e0392f' : '#2f63c9', 6); }
}
function drawBolt(ctx, x, y, s, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -16, -40, 32, 110, 6); fillStroke(ctx, '#9aa3ad', 6); for (let i = 0; i < 5; i++) line(ctx, -16, -20 + i * 18, 16, -12 + i * 18, 4, '#6d6372');
  path(ctx, [[-44, -40], [44, -40], [56, -62], [-56, -62]]); fillStroke(ctx, '#c9ced6', 6); rrect(ctx, -50, -84, 100, 26, 6); fillStroke(ctx, '#b4bac4', 6);
  ctx.restore();
}
function drawScale(ctx, x, y, w, readout) {
  rrect(ctx, x - w / 2, y, w, 70, 16); fillStroke(ctx, '#d9dde3', 7); rrect(ctx, x - 150, y + 90, 300, 110, 18); fillStroke(ctx, '#2b2630', 7);
  text(ctx, readout, x, y + 146, 76, '#7dff9a', INK, 0);
}
