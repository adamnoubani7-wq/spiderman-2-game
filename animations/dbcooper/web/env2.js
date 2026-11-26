// ---------- city, subway, webs, lab props ----------
const BCOLS = ['#e9725b', '#f2b75a', '#7a8fd6', '#5fbf9a', '#c97bd1', '#5aa9e6'];
function building(ctx, x, base, w, h, col, seed, haze = 0) {
  const R = rng(seed);
  const shape = () => rrect(ctx, x, base - h, w, h, 6);
  shape(); fillStroke(ctx, haze ? mix(col, '#cfe9f8', haze) : col, 6);
  ctx.fillStyle = haze ? mix('#fff4c9', '#cfe9f8', haze) : '#fff4c9';
  const cw = 22, ch = 30, gx = 40, gy = 52;
  for (let yy = base - h + 28; yy < base - 50; yy += gy) for (let xx = x + 16; xx < x + w - cw - 10; xx += gx) if (R() < .7) ctx.fillRect(xx, yy, cw, ch);
  shadeShape(ctx, shape, 1, .16, .3, [x, base - h, w, h]);
  shape(); fillStroke(ctx, null, 6);
  if (R() < .4) { rrect(ctx, x + w * .3, base - h - 40, w * .25, 40, 4); fillStroke(ctx, haze ? mix('#8a7f8e', '#cfe9f8', haze) : '#8a7f8e', 5); }
}
function drawSkyline(ctx, base, seed = 1, sc = 1, x0 = -900, x1 = 2000, haze = 0) {
  const R = rng(seed); let x = x0, i = 0;
  while (x < x1) { const w = (120 + R() * 130) * sc, h = (320 + R() * 620) * sc; building(ctx, x, base, w, h, BCOLS[(i + seed) % BCOLS.length], seed * 31 + i, haze); x += w + (14 + R() * 30) * sc; i++; }
}
// elevated track seen from the side, rail top at y
function drawTrack(ctx, y, x0 = -900, x1 = 2000, off = 0) {
  for (let x = x0 - ((off % 360) + 360) % 360; x < x1; x += 360) { rrect(ctx, x, y + 70, 56, 1400, 0); fillStroke(ctx, '#6d6372', 6); }
  rrect(ctx, x0, y, x1 - x0, 74, 0); fillStroke(ctx, '#8a7f8e', 6);
  for (let x = x0 - ((off % 64) + 64) % 64; x < x1; x += 64) line(ctx, x, y + 12, x + 44, y + 62, 5, '#5d5262');
  line(ctx, x0, y + 2, x1, y + 2, 8, INK);
}
// subway car seen from the side; (x, y) = left end at rail top
function drawCar(ctx, x, y, len = 460, o = {}) {
  const h = 200;
  const body = () => rrect(ctx, x, y - h - 30, len, h, 24);
  body(); fillStroke(ctx, '#cfd4dc', 7);
  ctx.save(); body(); ctx.clip();
  ctx.fillStyle = '#d8312b'; ctx.fillRect(x, y - 92, len, 24);
  ctx.fillStyle = 'rgba(30,10,40,.14)'; ctx.fillRect(x, y - 68, len, 40);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, y - h - 24, len, 14);
  ctx.restore();
  const n = 4, gw = (len - 70) / n;
  for (let i = 0; i < n; i++) { rrect(ctx, x + 35 + i * gw + 8, y - h - 6, gw - 16, 76, 10); fillStroke(ctx, '#33476b', 5); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x + 35 + i * gw + 18, y - h + 2, 12, 56); }
  body(); fillStroke(ctx, null, 7);
  for (const wx of [x + 70, x + 135, x + len - 135, x + len - 70]) { circle(ctx, wx, y - 16, 22); fillStroke(ctx, '#3a3340', 6); circle(ctx, wx, y - 16, 7); ctx.fillStyle = '#b9b2bd'; ctx.fill(); }
  if (o.front) { const fx = o.front > 0 ? x + len - 14 : x + 14; circle(ctx, fx, y - 120, 15); fillStroke(ctx, '#fff6b0', 5); }
}
// train seen head-on; (cx, by) = bottom centre
function drawTrainFront(ctx, cx, by, s, t, lights = 1) {
  ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
  if (lights > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const hx of [-150, 150]) { const g = ctx.createRadialGradient(hx, -110, 10, hx, -110, 260); g.addColorStop(0, `rgba(255,245,190,${.75 * lights})`); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.fillRect(hx - 260, -370, 520, 520); } ctx.restore(); }
  const body = () => rrect(ctx, -230, -500, 460, 500, 56);
  body(); fillStroke(ctx, '#cfd4dc', 8);
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = '#d8312b'; ctx.fillRect(-240, -215, 480, 42); ctx.fillStyle = 'rgba(30,10,40,.16)'; ctx.fillRect(110, -520, 200, 560); ctx.restore();
  body(); fillStroke(ctx, null, 8);
  for (const wx of [-195, 25]) { rrect(ctx, wx, -440, 170, 150, 20); fillStroke(ctx, '#33476b', 7); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(wx + 20, -428, 22, 120); }
  rrect(ctx, -95, -486, 190, 36, 8); fillStroke(ctx, '#221c22', 5); text(ctx, 'EXPRESS', 0, -468, 25, '#ffb52a', INK, 0);
  for (const hx of [-150, 150]) { circle(ctx, hx, -110, 32); fillStroke(ctx, '#fff8c8', 6); }
  rrect(ctx, -250, -46, 500, 46, 12); fillStroke(ctx, '#3a3340', 7);
  ctx.restore();
}
// train seen from above (for the mechanism shot); (cx, cy) = nose centre, pointing up
function drawTrainTop(ctx, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  for (let i = 0; i < 2; i++) {
    const y0 = i * 520;
    rrect(ctx, -110, y0, 220, 500, i === 0 ? [90, 90, 20, 20] : 20); fillStroke(ctx, '#cfd4dc', 7);
    rrect(ctx, -60, y0 + 70, 120, 360, 14); fillStroke(ctx, '#b4bac4', 5);
    for (let k = 0; k < 4; k++) { rrect(ctx, -30, y0 + 100 + k * 85, 60, 40, 8); fillStroke(ctx, '#8d94a0', 4); }
    ctx.fillStyle = 'rgba(30,10,40,.14)'; ctx.fillRect(40, y0 + 10, 66, 480);
  }
  ctx.restore();
}
// silk strand: ink outline + white core
function webLine(ctx, x1, y1, x2, y2, sag = 0, lw = 6) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
  for (const [c, w] of [[INK, lw + 6], ['#fbfbff', lw]]) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function webPath(ctx, pts, lw = 6) {
  for (const [c, w] of [[INK, lw + 6], ['#fbfbff', lw]]) { path(ctx, pts, false); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function webSplat(ctx, x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + .3; line(ctx, x, y, x + Math.cos(an) * r, y + Math.sin(an) * r, 9, INK); line(ctx, x, y, x + Math.cos(an) * r, y + Math.sin(an) * r, 4, '#fbfbff'); }
  ctx.beginPath(); ctx.arc(x, y, r * .55, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = '#fbfbff'; ctx.stroke();
  ctx.restore();
}
// orb web: radial threads + spiral
function orbWeb(ctx, cx, cy, r, p = 1, alpha = .9) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r * p, cy + Math.sin(a) * r * p); ctx.stroke(); }
  ctx.beginPath(); const turns = 9 * p;
  for (let a = 0; a < turns * TAU; a += .08) { const rr = r * .1 + (r * .9) * (a / (9 * TAU)); const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
// cartoon spider; (x, y) = body centre
function drawSpider(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  const col = o.col || '#7a5236', wig = o.wiggle == null ? 1 : o.wiggle;
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
    const w = Math.sin(t * 7 + i * 1.4 + side) * 12 * wig;
    const sx = side * 34, sy = -40 + i * 20, kx = side * (120 + i * 6), ky = -120 + i * 55 + w, fx = side * (170 + i * 12), fy = 30 + i * 55 + w * .5;
    for (const [c, lw] of [[INK, 20], [col, 11]]) { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
  }
  ellipse(ctx, 0, 70, 88, 100); fillStroke(ctx, col, 8);
  ctx.save(); ellipse(ctx, 0, 70, 88, 100); ctx.clip(); ctx.fillStyle = 'rgba(255,230,200,.35)'; for (let i = 0; i < 3; i++) { ellipse(ctx, 0, 40 + i * 42, 46 - i * 10, 10); ctx.fill(); } ctx.fillStyle = 'rgba(30,10,0,.22)'; ctx.fillRect(30, -40, 80, 220); ctx.restore();
  ellipse(ctx, 0, 70, 88, 100); fillStroke(ctx, null, 8);
  ellipse(ctx, 0, -40, 58, 50); fillStroke(ctx, mix(col, '#000000', .15), 8);
  const look = o.look || [0, 0], er = o.eyeR || 19;
  for (const side of [-1, 1]) { circle(ctx, side * 22, -50, er); fillStroke(ctx, '#fff', 5); circle(ctx, side * 22 + look[0] * 6, -50 + look[1] * 6, er * .45); ctx.fillStyle = INK; ctx.fill(); }
  for (const side of [-1, 1]) { circle(ctx, side * 44, -70, 6); ctx.fillStyle = INK; ctx.fill(); }
  if (o.smile) { ctx.beginPath(); ctx.arc(0, -28, 16, .4, Math.PI - .4); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function drawBoard(ctx, x, y, w, h) {
  rrect(ctx, x - 18, y - 18, w + 36, h + 36, 16); fillStroke(ctx, '#9a5a2a', 7);
  rrect(ctx, x, y, w, h, 6); fillStroke(ctx, '#2f5d46', 6);
  ctx.save(); rrect(ctx, x, y, w, h, 6); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 5; i++) { ellipse(ctx, x + w * (.2 + i * .17), y + h * (.3 + (i % 2) * .4), 120, 40, .3); ctx.fill(); } ctx.restore();
}
// chalk writing revealed left to right
function chalk(ctx, str, x, y, size, p = 1, col = '#f4f1e6', align = 'left') {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px Lora`; const wd = ctx.measureText(str).width; const left = align === 'center' ? x - wd / 2 : align === 'right' ? x - wd : x;
  ctx.beginPath(); ctx.rect(left - 6, y - size, wd * clamp(p) + 12, size * 2); ctx.clip();
  text(ctx, str, x, y, size, col, INK, 0, 'Lora', 700, align); ctx.restore();
}
function drawWeight(ctx, x, y, s, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, -230, 62, Math.PI, 0); ctx.lineWidth = 34; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 20; ctx.strokeStyle = '#5c5562'; ctx.stroke();
  const sh = () => { ctx.beginPath(); ctx.moveTo(-175, 0); ctx.lineTo(175, 0); ctx.lineTo(125, -235); ctx.lineTo(-125, -235); ctx.closePath(); };
  sh(); fillStroke(ctx, '#4a4450', 8); shadeShape(ctx, sh, 1, .25, .35, [-175, -235, 350, 235]); sh(); fillStroke(ctx, null, 8);
  text(ctx, label, 0, -112, 96, '#fff', INK, 12);
  ctx.restore();
}
function checkMark(ctx, x, y, s, p) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * backOut(clamp(p)), s * backOut(clamp(p)));
  circle(ctx, 0, 0, 100); fillStroke(ctx, '#3fa35b', 10);
  ctx.beginPath(); ctx.moveTo(-48, 2); ctx.lineTo(-12, 40); ctx.lineTo(52, -38); ctx.lineWidth = 26; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
function speedLines(ctx, t, n = 14, y0 = 300, y1 = 1500, dir = -1, a = .7) {
  const R = rng(9); ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) { const y = y0 + R() * (y1 - y0), L = 160 + R() * 260, sp = 2400 + R() * 1200; const x = (((R() * 2400 + t * sp) % 2400) + 2400) % 2400 - 600; const xx = dir < 0 ? 1080 - x : x; line(ctx, xx, y, xx - dir * L, y, 6, 'rgba(255,255,255,.85)'); }
  ctx.restore();
}
function drawTree(ctx, x, base, s) {
  rrect(ctx, x - 14 * s, base - 160 * s, 28 * s, 160 * s, 6); fillStroke(ctx, '#7a4f2c', 5);
  for (const [dx, dy, r] of [[-40, -190, 70], [40, -200, 75], [0, -260, 85]]) { circle(ctx, x + dx * s, base + dy * s, r * s); fillStroke(ctx, '#3fa35b', 6); }
}
