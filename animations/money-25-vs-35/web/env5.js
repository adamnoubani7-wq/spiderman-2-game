// ---------- Stickonomics 16:9 scene library ----------
// Brand: mint graph paper, ink outlines, gold coins, money green. Canvas is 1920x1080 (lib.js W/H).
const MINT = '#dff4e6', MINT_LINE = 'rgba(15,90,50,.10)', GREEN = '#1f8a4c', GREEN_D = '#0f5a32',
  GOLD = '#f5c542', GOLD_D = '#c9971c', SAMC = '#2f63c9', ALEXC = '#f28c28', REDC = '#d8312b', PAPER = '#fffaf0';
const SAM = { cols: [SAMC, SAMC], hat: 'none', belt: false };
const ALEX = { cols: [ALEXC, ALEXC], hat: 'none', belt: false };

// --- money maths (same formula as the script: monthly deposits, monthly compounding) ---
function balanceAt(monthly, rate, years) { const i = rate / 12, n = Math.round(years * 12); return rate === 0 ? monthly * n : monthly * (Math.pow(1 + i, n) - 1) / i; }
// value at a given age for a saver who deposits `monthly` from ageStart until ageStop, at `rate`
function valueAtAge(age, o) {
  const { monthly = 100, rate = .07, start = 25, stop = 65 } = o;
  if (age <= start) return 0;
  const paid = Math.min(age, stop) - start;
  let v = balanceAt(monthly, rate, paid);
  if (age > stop) v *= Math.pow(1 + rate / 12, Math.round((age - stop) * 12));
  return v;
}
const money = v => '$' + Math.round(v).toLocaleString('en-US');
const moneyK = v => v >= 1000 ? '$' + Math.round(v / 1000).toLocaleString('en-US') + 'k' : money(v);

// --- camera + background ---
function cam(ctx, c) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(960, 540); ctx.scale(c.z || 1, c.z || 1); ctx.rotate(c.r || 0); ctx.translate(-(c.x || 960), -(c.y || 540)); }
function paper(ctx, c, col = MINT, line = MINT_LINE) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  cam(ctx, c); ctx.strokeStyle = line; ctx.lineWidth = 2;
  for (let x = -480; x <= 2400; x += 48) { ctx.beginPath(); ctx.moveTo(x, -400); ctx.lineTo(x, 1500); ctx.stroke(); }
  for (let y = -384; y <= 1500; y += 48) { ctx.beginPath(); ctx.moveTo(-500, y); ctx.lineTo(2500, y); ctx.stroke(); }
}
function floorLine(ctx, y = 900) { ctx.fillStyle = 'rgba(15,90,50,.08)'; ctx.fillRect(-500, y, 3000, 600); line(ctx, -500, y, 2500, y, 6, INK); }
function drift(t, lt, z0 = 1, z1 = 1.04, dur = 6) { const hh = shake(t * .35, 3, 1, 2); return { x: 960 + hh[0], y: 540 + hh[1], z: lerp(z0, z1, clamp(lt / dur)) }; }

// --- props ---
function coin(ctx, x, y, r, tilt = 0, a = 1) {
  if (r <= 0 || a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(tilt);
  ellipse(ctx, 0, r * .12, r, r); fillStroke(ctx, GOLD_D, r * .09);
  circle(ctx, 0, 0, r); fillStroke(ctx, GOLD, r * .09);
  circle(ctx, 0, 0, r * .74); ctx.lineWidth = r * .05; ctx.strokeStyle = GOLD_D; ctx.stroke();
  ctx.font = `700 ${r * 1.05}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = GOLD_D; ctx.fillText('$', 0, r * .06);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ellipse(ctx, -r * .35, -r * .45, r * .28, r * .12, -.6); ctx.fill(); ctx.restore();
}
function coinStack(ctx, x, base, n, r) { for (let i = 0; i < n; i++) { ellipse(ctx, x, base - i * r * .34, r, r * .32); fillStroke(ctx, i % 2 ? GOLD : '#f7d36a', Math.max(3, r * .08)); } }
function bill(ctx, x, y, w, rot = 0, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); const h = w * .46;
  rrect(ctx, -w / 2, -h / 2, w, h, w * .05); fillStroke(ctx, '#8fd19e', Math.max(3, w * .025));
  rrect(ctx, -w / 2 + w * .07, -h / 2 + h * .14, w * .86, h * .72, w * .03); ctx.lineWidth = Math.max(2, w * .015); ctx.strokeStyle = GREEN_D; ctx.stroke();
  circle(ctx, 0, 0, h * .26); fillStroke(ctx, '#c8ecd0', Math.max(2, w * .015));
  ctx.font = `700 ${h * .34}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = GREEN_D; ctx.fillText('$', 0, h * .02); ctx.restore();
}
function tag(ctx, x, y, txt, bg = '#fff', fg = INK, size = 44) {
  ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.6;
  rrect(ctx, x - w / 2, y - h / 2, w, h, h / 2); fillStroke(ctx, bg, 5); text(ctx, txt, x, y + size * .04, size, fg, INK, 0);
}
function card(ctx, x, y, w, h, fill = PAPER) { ctx.save(); ctx.shadowColor = 'rgba(34,28,34,.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; rrect(ctx, x, y, w, h, 28); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); rrect(ctx, x, y, w, h, 28); fillStroke(ctx, null, 6); }
function bigNum(ctx, x, y, v, size, col = INK, prog = 1, from = 0) { text(ctx, money(lerp(from, v, easeOut(clamp(prog)))), x, y, size, col, INK, col === INK ? 0 : size * .1); }
function label(ctx, txt, x, y, size = 56, col = INK) { text(ctx, txt, x, y, size, col, INK, 0); }
function popIn(lt, t0, d = .35) { return backOut(clamp((lt - t0) / d)); }
function arrowR(ctx, x1, y, x2, w = 26, col = GREEN) { arrow(ctx, x1, y, x2, y, w, col); }
function mattressBed(ctx, x, y, s, lift = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -330, -40, 660, 60, 12); fillStroke(ctx, '#9a5a2a', 7); for (const lx of [-310, 290]) { rrect(ctx, lx, 10, 22, 70, 6); fillStroke(ctx, '#7a4520', 6); }
  ctx.save(); ctx.translate(0, -lift); rrect(ctx, -320, -150, 640, 110, 30); fillStroke(ctx, '#f3efe6', 7);
  for (let i = -2; i <= 2; i++) circle(ctx, i * 110, -95, 6), ctx.fillStyle = '#c9c2b6', ctx.fill();
  rrect(ctx, 150, -200, 150, 60, 24); fillStroke(ctx, '#ffffff', 6); ctx.restore(); ctx.restore();
}
function bankBuilding(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  path(ctx, [[-230, -300], [0, -400], [230, -300]]); fillStroke(ctx, '#e8e3d7', 7);
  rrect(ctx, -220, -300, 440, 40, 6); fillStroke(ctx, '#d9d3c5', 6);
  for (let i = 0; i < 4; i++) { rrect(ctx, -180 + i * 110, -255, 50, 230, 6); fillStroke(ctx, '#f3efe6', 6); }
  rrect(ctx, -240, -25, 480, 40, 6); fillStroke(ctx, '#d9d3c5', 6);
  text(ctx, 'BANK', 0, -345, 40, INK, INK, 0); ctx.restore();
}
function snowball(ctx, x, y, r, spin) {
  circle(ctx, x, y, r); fillStroke(ctx, '#ffffff', Math.max(4, r * .06));
  ctx.save(); circle(ctx, x, y, r); ctx.clip(); ctx.fillStyle = 'rgba(120,170,220,.25)'; ctx.fillRect(x, y - r, r, 2 * r);
  for (let k = 0; k < 5; k++) { const a = spin + k * 1.26; ellipse(ctx, x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .14, r * .09, a); ctx.fillStyle = 'rgba(140,180,220,.45)'; ctx.fill(); }
  ctx.restore(); coin(ctx, x + Math.cos(spin) * r * .45, y + Math.sin(spin) * r * .45, r * .2, spin);
}
function indexBasket(ctx, x, y, s, n = 12, fill = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const cols = ['#e9725b', '#7a8fd6', '#5fbf9a', '#f2b75a', '#c97bd1', '#5aa9e6'];
  for (let i = 0; i < n; i++) { const a = clamp(fill * n - i); if (a <= 0) continue; const bx = -240 + (i % 6) * 96, by = -150 - Math.floor(i / 6) * 120;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(bx, by + (1 - a) * -60); rrect(ctx, -36, -90, 72, 90 + (i % 3) * 20, 6); fillStroke(ctx, cols[i % 6], 5);
    for (let k = 0; k < 3; k++) { ctx.fillStyle = '#fff4c9'; ctx.fillRect(-22, -76 + k * 26, 14, 14); ctx.fillRect(8, -76 + k * 26, 14, 14); } ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-300, -40); ctx.lineTo(300, -40); ctx.lineTo(250, 120); ctx.lineTo(-250, 120); ctx.closePath(); fillStroke(ctx, '#c99a5e', 8);
  for (let k = -3; k <= 3; k++) line(ctx, k * 70, -30, k * 62, 110, 5, 'rgba(34,28,34,.35)');
  text(ctx, 'INDEX FUND', 0, 50, 44, '#fff', INK, 8); ctx.restore();
}
function bucket(ctx, x, y, s, level, leak) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-170, -260); ctx.lineTo(170, -260); ctx.lineTo(130, 0); ctx.lineTo(-130, 0); ctx.closePath();
  ctx.save(); ctx.clip(); ctx.fillStyle = GOLD; ctx.fillRect(-200, -260 * level, 400, 300); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-200, -260 * level, 400, 14); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-170, -260); ctx.lineTo(170, -260); ctx.lineTo(130, 0); ctx.lineTo(-130, 0); ctx.closePath(); fillStroke(ctx, null, 9);
  ellipse(ctx, 0, -260, 170, 24); fillStroke(ctx, null, 9);
  if (leak > 0) { circle(ctx, 110, -60, 12); ctx.fillStyle = INK; ctx.fill(); for (let k = 0; k < 4; k++) coin(ctx, 150 + k * 20, -40 + ((leak * 300 + k * 70) % 260), 20, k); }
  ctx.restore();
}

// --- the growth chart (ages 25 to 65) ---
const CH = { x0: 300, x1: 1640, y0: 860, y1: 200, a0: 25, a1: 65, vmax: 280000 };
const ax = a => lerp(CH.x0, CH.x1, (a - CH.a0) / (CH.a1 - CH.a0));
const vy = v => lerp(CH.y0, CH.y1, v / CH.vmax);
function chartFrame(ctx, a = 1, vmax) {
  if (vmax) CH.vmax = vmax;
  ctx.save(); ctx.globalAlpha = a;
  card(ctx, CH.x0 - 170, CH.y1 - 90, CH.x1 - CH.x0 + 260, CH.y0 - CH.y1 + 200);
  for (const v of [0, 50000, 100000, 150000, 200000, 250000]) { if (v > CH.vmax) continue; line(ctx, CH.x0, vy(v), CH.x1, vy(v), 2, 'rgba(34,28,34,.12)'); text(ctx, moneyK(v), CH.x0 - 24, vy(v), 30, '#5f5862', INK, 0, 'Poppins', 700, 'right'); }
  for (let age = 25; age <= 65; age += 10) { line(ctx, ax(age), CH.y0, ax(age), CH.y0 + 14, 5); text(ctx, 'age ' + age, ax(age), CH.y0 + 44, 30, '#5f5862', INK, 0); }
  line(ctx, CH.x0, CH.y0, CH.x1, CH.y0, 6); line(ctx, CH.x0, CH.y0, CH.x0, CH.y1 - 20, 6);
  ctx.restore();
}
function chartSeries(ctx, o, upTo, col, lw = 12, dash) {
  const pts = []; for (let age = o.start; age <= Math.min(upTo, 65) + 1e-6; age += .25) pts.push([ax(age), vy(valueAtAge(age, o))]);
  if (pts.length < 2) return null;
  ctx.save(); if (dash) ctx.setLineDash(dash); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [c, w] of [[INK, lw + 8], [col, lw]]) { path(ctx, pts, false); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
  ctx.restore(); const end = pts[pts.length - 1]; circle(ctx, end[0], end[1], lw * .9); fillStroke(ctx, col, 5); return end;
}
function endTag(ctx, end, txt, col, dy = -50, a = 1) { if (!end || a <= 0) return; ctx.save(); ctx.globalAlpha = a; tag(ctx, end[0] - 20, end[1] + dy, txt, col, '#fff', 40); ctx.restore(); }

// --- year-by-year bars: what Sam puts in vs what the money earns ---
function yearBars(ctx, years, highlight) {
  const x0 = 260, x1 = 1660, y0 = 860, hmax = 560, vmax = 18000, bw = (x1 - x0) / 40 * .7;
  card(ctx, 140, 160, 1640, 840);
  for (let y = 1; y <= Math.min(40, years); y++) {
    const growth = valueAtAge(25 + y, { start: 25 }) - valueAtAge(25 + y - 1, { start: 25 }) - 1200;
    const bx = x0 + (y - .5) * (x1 - x0) / 40;
    const hc = 1200 / vmax * hmax, hg = Math.max(0, growth) / vmax * hmax;
    rrect(ctx, bx - bw / 2, y0 - hc, bw, hc, 3); fillStroke(ctx, SAMC, 3);
    rrect(ctx, bx - bw / 2, y0 - hc - hg, bw, hg, 3); fillStroke(ctx, y === highlight ? '#ffe14d' : GOLD, 3);
  }
  line(ctx, x0, y0, x1, y0, 6);
  for (const y of [1, 10, 20, 30, 40]) text(ctx, 'year ' + y, x0 + (y - .5) * (x1 - x0) / 40, y0 + 40, 28, '#5f5862', INK, 0);
  rrect(ctx, 300, 210, 34, 34, 6); fillStroke(ctx, SAMC, 4); text(ctx, 'what Sam puts in ($1,200 a year)', 350, 228, 34, INK, INK, 0, 'Poppins', 700, 'left');
  rrect(ctx, 300, 266, 34, 34, 6); fillStroke(ctx, GOLD, 4); text(ctx, 'what the money earns by itself', 350, 284, 34, INK, INK, 0, 'Poppins', 700, 'left');
}

// --- section title, recap list, disclaimer, end screen ---
function sectionTitle(ctx, lt, t, kicker, title) {
  paper(ctx, drift(t, lt));
  const p = popIn(lt, .05, .4);
  ctx.save(); ctx.translate(960, 520); ctx.scale(p, p);
  // long titles wrap onto two balanced lines so nothing runs off the edge (max width 1500 px)
  ctx.font = '700 120px Poppins'; let lines = [title];
  if (ctx.measureText(title).width > 1500) { const w = title.split(' '); let best = 1, bd = 1e9;
    for (let k = 1; k < w.length; k++) { const d = Math.abs(ctx.measureText(w.slice(0, k).join(' ')).width - ctx.measureText(w.slice(k).join(' ')).width); if (d < bd) { bd = d; best = k; } }
    lines = [w.slice(0, best).join(' '), w.slice(best).join(' ')]; }
  const two = lines.length > 1, size = two ? 110 : 120;
  text(ctx, kicker, 0, two ? -175 : -110, 46, GREEN_D, INK, 0);
  lines.forEach((l, k) => text(ctx, l, 0, two ? -65 + k * 130 : 10, size, INK, INK, 0));
  ctx.restore();
  const uy = two ? 685 : 620, u = clamp((lt - .3) / .5); line(ctx, 960 - 340 * u, uy, 960 + 340 * u, uy, 14, GOLD);
}
function endScreen(ctx, lt, t) {
  paper(ctx, { x: 960, y: 540, z: 1 });
  // two blank slots + subscribe circle are where YouTube's end-screen elements go
  for (const x of [250, 1010]) { rrect(ctx, x, 260, 660, 372, 26); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); ctx.setLineDash([16, 12]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(34,28,34,.35)'; ctx.stroke(); ctx.setLineDash([]); }
  text(ctx, 'Next: more money questions', 960, 170, 64, INK, INK, 0);
  text(ctx, 'Stickonomics', 960, 760, 96, INK, INK, 0); text(ctx, 'Money explained by stick figures.', 960, 850, 44, GREEN_D, INK, 0);
  drawStick(ctx, C(SAM, { x: 160, y: 1000, s: 260, arms: { L: [2.6, .2], R: [2.6, .2] }, face: { eyes: 'happy', mouth: 'grin' } }));
  drawStick(ctx, C(ALEX, { x: 1760, y: 1000, s: 260, arms: { L: [.3, -.1], R: [2.4, .3] }, face: { eyes: 'happy', mouth: 'smile' } }));
}
