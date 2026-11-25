// ---------- $100 a Month: Start at 25 vs 35 (Stickonomics, 16:9) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const LS = i => { const w = WORDS.find(x => x.line === i); return w ? w.s : 0; };   // line start (s)
const LE = i => { const ws = WORDS.filter(x => x.line === i); return ws.length ? ws[ws.length - 1].e : 0; };
const WS = (i, w) => { const x = WORDS.find(o => o.line === i && o.w.toLowerCase().startsWith(w)); return { t: x ? x.s : LS(i) }; };   // a word's start in line i
const VO_END = 468.75, END_DUR = 12;
const SHOTS = [];
let _plan = [];
function shot(line, tr, draw) { _plan.push({ line, tr, draw }); }
function finalize() {
  _plan.forEach((p, k) => {
    const T0 = l => (l === 'end' ? VO_END + .35 : typeof l === 'object' ? l.t : LS(l));
    const start = k === 0 ? 0 : T0(p.line);
    const next = _plan[k + 1];
    const end = next ? T0(next.line) : VO_END + .35 + END_DUR;
    const base = start;
    SHOTS.push({ start, end, tr: p.tr, draw: (ctx, lt, t) => p.draw(ctx, lt, t, i => (typeof i === 'number' ? LS(i) : typeof i === 'object' ? i.t : i) - base) });
  });
}
const walk = (t, sp = 9, amp = .5) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const wave = t => ({ L: [.3, -.1], R: [2.5 + Math.sin(t * 8) * .25, .3] });
const cheer = { L: [2.6, .2], R: [2.6, .2] };
const shrug = { L: [1.3, -2.2], R: [1.3, -2.2] };
const hips = { L: [.9, -2.2], R: [.9, -2.2] };
function duoBG(ctx, lt, t) { paper(ctx, drift(t, lt)); floorLine(ctx, 900); }
function coffee(ctx, x, y) { rrect(ctx, x - 22, y - 40, 44, 52, 8); fillStroke(ctx, '#fff', 5); rrect(ctx, x - 24, y - 48, 48, 14, 6); fillStroke(ctx, '#9a5a2a', 5); }
function jar(ctx, x, y, s, fill, coins = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -90, -220, 180, 220, 30); ctx.save(); ctx.clip(); ctx.fillStyle = GOLD; ctx.fillRect(-100, -220 * fill, 200, 230); ctx.restore();
  rrect(ctx, -90, -220, 180, 220, 30); fillStroke(ctx, 'rgba(255,255,255,.25)', 7); rrect(ctx, -70, -250, 140, 34, 8); fillStroke(ctx, '#9aa3ad', 6);
  for (let k = 0; k < coins; k++) coin(ctx, -40 + (k % 3) * 40, -30 - Math.floor(k / 3) * 34, 22, k);
  ctx.restore();
}
function gantt(ctx, lt, row, start, end, col, name, prog) {
  const y = 380 + row * 230, x0 = ax(start), x1 = lerp(x0, ax(end), easeOut(clamp(prog)));
  rrect(ctx, x0, y, Math.max(1, x1 - x0), 90, 45); fillStroke(ctx, col, 6);
  if (prog > .6) text(ctx, `${name}: ${end - start} years`, (x0 + x1) / 2, y + 47, 44, '#fff', INK, 8);
}

// 1. hook ----------------------------------------------------------------------------------------
shot(0, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 640, y: 900, s: 360, arms: wave(t), face: { eyes: 'happy', mouth: 'smile' } }));
  drawStick(ctx, C(ALEX, { x: 1280, y: 900, s: 360, arms: { L: [2.5 + Math.sin(t * 8 + 1) * .25, .3], R: [.3, -.1] }, face: { eyes: 'happy', mouth: 'smile' } }));
  const p = popIn(lt, .2); if (p > 0) { tag(ctx, 640, 380, 'Sam', SAMC, '#fff', 50 * p); tag(ctx, 1280, 380, 'Alex', ALEXC, '#fff', 50 * p); } });
shot(1, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  for (const [x, P] of [[640, SAM], [1280, ALEX]]) { drawStick(ctx, C(P, { x, y: 900, s: 360, arms: { L: [.3, -.1], R: { ik: [.32, -.62] } }, face: { eyes: 'normal', mouth: 'smile' } })); coffee(ctx, x + 125, 690); }
  ['same job', 'same salary', 'same coffee'].forEach((s, k) => { const p = popIn(lt, .1 + k * .9); if (p > 0) tag(ctx, 960, 280 + k * 0, s, '#fff', INK, 50 * p * (lt < .1 + (k + 1) * .9 || k === 2 ? 1 : 0)); }); });
shot(2, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 520, y: 900, s: 330, arms: { L: [.3, -.1], R: [1.4, -.3] } })); drawStick(ctx, C(ALEX, { x: 1400, y: 900, s: 330, flip: -1, arms: { L: [.3, -.1], R: [1.4, -.3] } }));
  for (const x of [760, 1160]) { jar(ctx, x, 900, 1, clamp(lt / 3.5) * .5); const f = (lt * 1.3) % 1; bill(ctx, x, lerp(420, 720, f), 120, f * 2, 1 - f); }
  const p = popIn(lt, .4); if (p > 0) tag(ctx, 960, 300, '$100 a month each', GREEN, '#fff', 54 * p); });
shot(3, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 520, y: 900, s: 330, arms: shrug, face: { eyes: 'normal', mouth: 'flat', browUp: 1 } })); drawStick(ctx, C(ALEX, { x: 1400, y: 900, s: 330, arms: shrug, face: { eyes: 'normal', mouth: 'flat', browUp: 1 } }));
  const p = popIn(lt, .3); if (p > 0) { ctx.save(); ctx.translate(960, 420); ctx.scale(p, p); text(ctx, 'when they start', 0, 0, 90, INK, INK, 0); ctx.restore(); }
  const q = popIn(lt, 1.2); if (q > 0) text(ctx, '?', 960, 620, 200 * q, GOLD, INK, 16); });
shot(4, 'whip', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 760, y: 900, s: 380, arms: cheer, face: { eyes: 'happy', mouth: 'grin' } })); jar(ctx, 1080, 900, 1.1, .2, 2);
  const p = popIn(lt, .2); if (p > 0) { ctx.save(); ctx.translate(760, 300); ctx.scale(p, p); text(ctx, '25', 0, 0, 170, SAMC, INK, 14); ctx.restore(); text(ctx, 'starts at', 760, 170, 50 * p, INK, INK, 0); } });
shot(5, 'whip', (ctx, lt, t) => { duoBG(ctx, lt, t);
  rrect(ctx, 920, 700, 520, 140, 40); fillStroke(ctx, '#7a8fd6', 7); rrect(ctx, 900, 620, 80, 220, 30); fillStroke(ctx, '#6a7ec4', 7); rrect(ctx, 1380, 620, 80, 220, 30); fillStroke(ctx, '#6a7ec4', 7);
  drawStick(ctx, C(ALEX, { x: 1180, y: 860, s: 330, legs: { L: [1.4, -1.4], R: [1.3, -1.3] }, arms: { L: [1.7, -2.4], R: [1.7, -2.4] }, face: { eyes: 'happy', mouth: 'smile' } }));
  const p = popIn(lt, .2); if (p > 0) { ctx.save(); ctx.translate(560, 380); ctx.scale(p, p); text(ctx, '35', 0, 0, 170, ALEXC, INK, 14); ctx.restore(); text(ctx, 'waits until', 560, 250, 50 * p, INK, INK, 0); } });
shot(6, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const u = easeOut(clamp(lt / .8)); line(ctx, 460, 560, lerp(460, 1460, u), 560, 14, INK);
  for (const [a, x] of [[25, 460], [35, 1460]]) if (u > (x - 460) / 1000 - .01) { circle(ctx, x, 560, 26); fillStroke(ctx, a === 25 ? SAMC : ALEXC, 6); text(ctx, 'age ' + a, x, 480, 50, INK, INK, 0); }
  const p = popIn(lt, .9); if (p > 0) tag(ctx, 960, 680, '10 years', '#fff', INK, 56 * p);
  drawStick(ctx, C(ALEX, { x: 1700, y: 900, s: 260, arms: shrug, face: { eyes: 'half', mouth: 'smirk' } })); });
shot(7, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const g = easeOut(clamp((lt - .6) / 3.5));
  coinStack(ctx, 760, 890, Math.round(2 + 18 * g), 70); coinStack(ctx, 1160, 890, Math.round(2 + 7 * g), 70);
  drawStick(ctx, C(SAM, { x: 520, y: 900, s: 330, arms: lt > 4 ? cheer : { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: lt > 4 ? 'happy' : 'normal', mouth: 'grin' } }));
  drawStick(ctx, C(ALEX, { x: 1400, y: 900, s: 330, arms: { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: lt > 4 ? 'wide' : 'normal', mouth: lt > 4 ? 'o' : 'smile' } }));
  const p = popIn(lt, .2); if (p > 0) tag(ctx, 960, 200, 'both at 65', '#fff', INK, 50 * p);
  const q = popIn(lt, 4.3); if (q > 0) tag(ctx, 760, 320, 'more than 2x', GREEN, '#fff', 46 * q); });
shot(8, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  coinStack(ctx, 760, 890, 20, 70); coinStack(ctx, 1160, 890, 9, 70);
  const b = easeOut(clamp(lt / .6)); line(ctx, 1260, lerp(610, 230, b), 1260, 610, 10, REDC); line(ctx, 1230, 610, 1290, 610, 10, REDC); line(ctx, 1230, lerp(610, 230, b), 1290, lerp(610, 230, b), 10, REDC);
  const p = popIn(lt, .7); if (p > 0) { ctx.save(); ctx.translate(1530, 420); ctx.scale(p, p); text(ctx, '$140,000', 0, 0, 120, REDC, INK, 12); text(ctx, 'gap', 0, 90, 56, INK, INK, 0); ctx.restore(); } });
shot(9, 'whip', (ctx, lt, t) => { sectionTitle(ctx, lt, t, 'Stickonomics', 'Start at 25 vs 35');
  drawStick(ctx, C(SAM, { x: 330, y: 1000, s: 300, arms: cheer, face: { eyes: 'happy', mouth: 'grin' } })); drawStick(ctx, C(ALEX, { x: 1590, y: 1000, s: 300, arms: hips, face: { eyes: 'normal', mouth: 'smirk' } })); });

// 2. mattress, inflation, savings ------------------------------------------------------------------
shot(11, 'whip', (ctx, lt, t) => sectionTitle(ctx, lt, t, 'Part 1', 'What does $100 a month add up to?'));
shot(12, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const lift = lt < 1.2 ? 40 * Math.sin(clamp(lt / 1.2) * Math.PI) : 0; mattressBed(ctx, 1060, 880, 1.2, lift);
  for (let k = 0; k < Math.min(10, Math.floor(lt * 3)); k++) bill(ctx, 820 + k * 50, 810 - (k % 2) * 6, 110, (k % 3 - 1) * .1);
  drawStick(ctx, C(SAM, { x: 460, y: 900, s: 330, arms: { L: [.3, -.1], R: [1.5, -.2] }, face: { eyes: 'happy', mouth: 'smirk' } }));
  card(ctx, 1260, 180, 520, 230); text(ctx, '40 years', 1520, 240, 44, '#5f5862', INK, 0); bigNum(ctx, 1520, 330, 48000, 96, INK, (lt - .6) / 3); });
shot(13, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const yrs = 40 * clamp((lt - .4) / 5.5), price = 10 * Math.pow(1.03, yrs);
  rrect(ctx, 760, 460, 400, 400, 30); fillStroke(ctx, '#e9d3a8', 7);
  for (const [x, c] of [[860, '#e9725b'], [960, '#5fbf9a'], [1060, '#f2b75a']]) { circle(ctx, x, 470, 50); fillStroke(ctx, c, 6); }
  tag(ctx, 960, 640, '$' + price.toFixed(2), '#fff', INK, 60); text(ctx, 'the same groceries, ' + Math.round(yrs) + ' years from now', 960, 300, 44, INK, INK, 0);
  const p = popIn(lt, 3.5); if (p > 0) tag(ctx, 1500, 300, 'inflation: about 3% a year', REDC, '#fff', 42 * p);
  drawStick(ctx, C(SAM, { x: 400, y: 900, s: 320, arms: shrug, face: { eyes: 'wide', mouth: 'o' } })); });
shot(15, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const sh = 1 - .69 * easeOut(clamp((lt - 1.5) / 3));
  card(ctx, 380, 200, 1160, 600);
  ctx.save(); ctx.translate(960, 520); ctx.scale(sh, sh); for (let k = 0; k < 5; k++) bill(ctx, -10 + k * 6, 20 - k * 14, 420, -.05 + k * .02); ctx.restore();
  text(ctx, '$48,000 in 40 years', 960, 280, 56, INK, INK, 0);
  const p = popIn(lt, 3.6); if (p > 0) tag(ctx, 960, 720, 'buys what $15,000 buys today', REDC, '#fff', 48 * p); });
shot(16, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t); mattressBed(ctx, 960, 880, 1.3, 0);
  drawStick(ctx, C(SAM, { x: 520, y: 900, s: 330, arms: hips, face: { eyes: 'squint', mouth: 'frown' } }));
  const p = popIn(lt, .4); if (p > 0) tag(ctx, 960, 360, 'not saving: shrinking', REDC, '#fff', 56 * p); });
shot(17, 'cut', (ctx, lt, t, at) => { duoBG(ctx, lt, t); bankBuilding(ctx, 1260, 900, 1.15);
  drawStick(ctx, C(SAM, { x: 520, y: 900, s: 330, arms: { L: [.3, -.1], R: [1.3, -.3] }, face: { eyes: 'normal', mouth: 'smile' } }));
  const p = popIn(lt, .6); if (p > 0) { card(ctx, 330, 200, 560, 220); text(ctx, 'sitting in the bank', 610, 250, 40, '#5f5862', INK, 0); text(ctx, '$48,000', 610, 340, 88 * p, INK, INK, 0); }
  const q = popIn(lt, at(18) + 1.2); if (q > 0) tag(ctx, 1260, 220, 'prices keep going up  ↑', REDC, '#fff', 44 * q);
  const r = popIn(lt, at(19) + .8); if (r > 0) tag(ctx, 960, 110, 'your money has to work', GREEN, '#fff', 54 * r); });
shot(20, 'whip', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 760, y: 900, s: 380, arms: { L: [.3, -.1], R: { ik: [.18, -.82] } }, headTilt: .12, face: { eyes: 'normal', look: [.6, -.7], mouth: 'flat' } }));
  const p = popIn(lt, .3); if (p > 0) text(ctx, '?', 1120, 420, 260 * p, GOLD, INK, 18); });

// 3. the market ----------------------------------------------------------------------------------
function marketLine(ctx, x0, x1, ybase, amp, prog, crash) {
  const pts = []; const n = 120;
  for (let k = 0; k <= n * clamp(prog); k++) { const f = k / n; let v = f * f * .8 + f * .2 + Math.sin(f * 37) * .025 + Math.sin(f * 11) * .03;
    if (crash) v -= Math.exp(-Math.pow((f - crash) * 28, 2)) * .32; pts.push([lerp(x0, x1, f), ybase - v * amp]); }
  if (pts.length < 2) return pts;
  ctx.lineJoin = 'round'; for (const [c, w] of [[INK, 20], [GREEN, 12]]) { path(ctx, pts, false); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); } return pts;
}
shot(21, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt));
  card(ctx, 200, 150, 1520, 720); line(ctx, 280, 800, 1640, 800, 6);
  const pts = marketLine(ctx, 290, 1620, 790, 560, (lt - .2) / 5);
  text(ctx, '1928', 290, 840, 36, '#5f5862', INK, 0); text(ctx, 'today', 1620, 840, 36, '#5f5862', INK, 0);
  const p = popIn(lt, 3.6); if (p > 0) tag(ctx, 720, 250, 'stock market: about 10% a year', GREEN, '#fff', 48 * p);
  const q = popIn(lt, 7.2); if (q > 0) tag(ctx, 720, 350, 'after inflation: about 7%', SAMC, '#fff', 48 * q); });
shot(24, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const p = popIn(lt, .1); ctx.save(); ctx.translate(960, 430); ctx.scale(p, p); text(ctx, '7%', 0, 0, 280, GREEN, INK, 22); ctx.restore();
  const q = popIn(lt, 2.2); if (q > 0) tag(ctx, 960, 690, 'every number = today\'s money', '#fff', INK, 50 * q); });
shot(25, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt)); card(ctx, 200, 150, 1520, 720); line(ctx, 280, 800, 1640, 800, 6);
  const pts = marketLine(ctx, 290, 1620, 790, 560, .25 + lt / 4.5, .72);
  const p = popIn(lt, 3.9); if (p > 0) { const x = lerp(290, 1620, .72); line(ctx, x, 260, x, 760, 4, REDC); tag(ctx, x, 230, '2008: about -37%', REDC, '#fff', 46 * p); }
  const q = popIn(lt, .1); if (q > 0) tag(ctx, 560, 240, 'an average, not every year', '#fff', INK, 40 * q); });
shot(28, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt)); card(ctx, 200, 150, 1520, 720); line(ctx, 280, 800, 1640, 800, 6);
  marketLine(ctx, 290, 1620, 790, 560, 1, .72);
  const u = clamp(lt / 1.5); ctx.save(); ctx.setLineDash([22, 16]); line(ctx, 290, 780, lerp(290, 1620, u), lerp(780, 230, u), 8, SAMC); ctx.restore();
  const p = popIn(lt, 1.6); if (p > 0) tag(ctx, 1240, 330, 'long-run trend, not a promise', SAMC, '#fff', 42 * p); });
shot(29, 'whip', (ctx, lt, t, at) => { duoBG(ctx, lt, t); indexBasket(ctx, 1150, 760, 1.1, 12, clamp((lt - .5) / 7));
  drawStick(ctx, C(SAM, { x: 480, y: 900, s: 330, arms: { L: [.3, -.1], R: [1.5, -.3] }, face: { eyes: 'happy', mouth: 'smile' } }));
  const p = popIn(lt, .4); if (p > 0) tag(ctx, 960, 170, 'tiny pieces of lots of companies', '#fff', INK, 46 * p);
  const q = popIn(lt, at(30) + 5.4); if (q > 0) tag(ctx, 1150, 300, 'one bad company can\'t sink you', GREEN, '#fff', 40 * q); });
shot(31, 'cut', (ctx, lt, t, at) => { paper(ctx, drift(t, lt)); card(ctx, 330, 130, 1260, 740);
  text(ctx, 'A good index fund', 960, 230, 64, INK, INK, 0); const ul = popIn(lt, .2); if (ul > 0) line(ctx, 960 - 260 * ul, 285, 960 + 260 * ul, 285, 10, GOLD);
  [['ok', 'Low fees', 'fee'], ['ok', 'Real products and services', 'real'], ['no', 'No gambling', 'gambling'], ['no', 'No alcohol', 'alcohol'], ['no', 'No lending money at interest', 'lending']].forEach(([k, s, w], i) => {
    const p = popIn(lt, at(WS(31, w)) - .1); if (p <= 0) return; const y = 360 + i * 105;
    circle(ctx, 500, y, 34 * p); fillStroke(ctx, k === 'ok' ? GREEN : REDC, 6); text(ctx, k === 'ok' ? '✓' : '✕', 500, y + 2, 40 * p, '#fff', INK, 0);
    text(ctx, s, 570, y + 2, 50 * p, INK, INK, 0, 'Poppins', 700, 'left'); }); });
shot(WS(31, 'when'), 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const g = easeOut(clamp(lt / 3.5)); ctx.save(); ctx.translate(1150, 760); ctx.scale(1.1, 1.1 + .25 * g); ctx.translate(-1150, -760); indexBasket(ctx, 1150, 760, 1, 12, 1); ctx.restore();
  for (let k = 0; k < 6; k++) { const f = clamp((lt - .5 - k * .4) / 1.2); coin(ctx, 900 + k * 90, lerp(520, 300, f), 34, k, f > 0 && f < 1 ? 1 : 0); }
  drawStick(ctx, C(SAM, { x: 480, y: 900, s: 330, arms: cheer, face: { eyes: 'happy', mouth: 'grin' } })); });

// 4. compound growth ----------------------------------------------------------------------------
shot(32, 'whip', (ctx, lt, t) => sectionTitle(ctx, lt, t, 'Part 2', 'Compound growth'));
shot(34, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  jar(ctx, 960, 880, 1.6, .25, 0); const p = popIn(lt, .4); if (p > 0) tag(ctx, 960, 300, 'year 1: $1,200 in', SAMC, '#fff', 52 * p);
  const c = clamp((lt - 3) / .6); if (c > 0) { coin(ctx, 1260, lerp(400, 640, easeOut(c)), 40, 0); tag(ctx, 1400, 560, '+ a little growth', GOLD, INK, 38); }
  drawStick(ctx, C(SAM, { x: 520, y: 900, s: 320, arms: { L: [.3, -.1], R: [1.2, -.4] } })); });
shot(35, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  card(ctx, 380, 170, 1160, 660);
  const rows = [['your money', SAMC, 0], ['growth on it', GOLD, 1.6], ['growth on the growth', '#ffe14d', 3.6]];
  rows.forEach(([s, c, t0], k) => { const p = popIn(lt, t0); if (p <= 0) return; const w = [520, 160, 60][k];
    rrect(ctx, 480, 260 + k * 170, w * p, 110, 18); fillStroke(ctx, c, 6); text(ctx, s, 480 + w * p + 30, 315 + k * 170, 44, INK, INK, 0, 'Poppins', 700, 'left'); }); });
shot(36, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const n = Math.min(32, Math.pow(2, Math.floor(lt / .45)));
  for (let k = 0; k < n; k++) { const col = k % 8, row = Math.floor(k / 8); coin(ctx, 640 + col * 92, 330 + row * 120, 38, k * .3, popIn(lt, Math.floor(Math.log2(Math.max(1, k))) * .45 + .05, .25)); }
  const p = popIn(lt, .2); if (p > 0) tag(ctx, 960, 180, 'money earning money', GREEN, '#fff', 52 * p); });
shot(37, 'whip', (ctx, lt, t) => { paper(ctx, drift(t, lt));
  ctx.beginPath(); ctx.moveTo(-100, 260); ctx.quadraticCurveTo(900, 500, 2100, 940); ctx.lineTo(2100, 1200); ctx.lineTo(-100, 1200); ctx.closePath(); fillStroke(ctx, '#f4f8ff', 8);
  const f = clamp(lt / 11), x = lerp(120, 1700, f), y = (() => { const tt = (x + 100) / 2200; return (1 - tt) * (1 - tt) * 260 + 2 * (1 - tt) * tt * 500 + tt * tt * 940; })();
  const r = lerp(28, 190, f * f); snowball(ctx, x, y - r + 6, r, lt * 4);
  const p = popIn(lt, 5.4); if (p > 0) tag(ctx, 560, 160, 'bigger = faster', SAMC, '#fff', 50 * p); });
shot(40, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt, 1, 1.02)); yearBars(ctx, Math.min(10, Math.floor(1 + lt * 2.5)), 0);
  const p = popIn(lt, 6); if (p > 0) { tag(ctx, 640, 420, 'put in: $12,000', SAMC, '#fff', 44 * p); tag(ctx, 640, 520, 'worth: about $17,000', GREEN, '#fff', 44 * p); } });
shot(42, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt, 1, 1.02)); const yrs = lt < 2.5 ? 11 : Math.min(40, 11 + Math.floor((lt - 2.5) * 6)); yearBars(ctx, yrs, 11);
  const p = popIn(lt, .2); if (p > 0) { const x = 260 + 10.5 * 1400 / 40; tag(ctx, x + 40, 430, 'year 11: growth beats deposits', GOLD, INK, 40 * p); }
  const q = popIn(lt, 7.6); if (q > 0) tag(ctx, 1200, 520, 'the snowball does the work', GREEN, '#fff', 44 * q); });

// 5. the race ------------------------------------------------------------------------------------
shot(45, 'whip', (ctx, lt, t) => sectionTitle(ctx, lt, t, 'Part 3', 'The race'));
shot(46, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt)); card(ctx, 130, 230, 1660, 640);
  line(ctx, ax(25), 820, ax(65), 820, 6); for (let age = 25; age <= 65; age += 10) { line(ctx, ax(age), 820, ax(age), 838, 5); text(ctx, 'age ' + age, ax(age), 860, 32, '#5f5862', INK, 0); }
  gantt(ctx, lt, 0, 25, 65, SAMC, 'Sam', lt / 2); gantt(ctx, lt, 1, 35, 65, ALEXC, 'Alex', (lt - (LS(47) - LS(46))) / 2); });
shot(48, 'cut', (ctx, lt, t, at) => { duoBG(ctx, lt, t);
  const ps = popIn(lt, .2), pa = popIn(lt, at(49));
  coinStack(ctx, 760, 890, Math.round(16 * ps), 70); if (pa > 0) coinStack(ctx, 1160, 890, Math.round(12 * pa), 70);
  if (ps > 0) tag(ctx, 760, 260, 'Sam: $48,000', SAMC, '#fff', 46); if (pa > 0) tag(ctx, 1160, 380, 'Alex: $36,000', ALEXC, '#fff', 46);
  const d = popIn(lt, at(50)); if (d > 0) tag(ctx, 960, 150, 'only $12,000 more', '#fff', INK, 52 * d);
  drawStick(ctx, C(SAM, { x: 460, y: 900, s: 300 })); drawStick(ctx, C(ALEX, { x: 1460, y: 900, s: 300 })); });
function raceChart(ctx, lt, t, upToSam, upToAlex, tags) {
  paper(ctx, drift(t, lt, 1, 1.02)); chartFrame(ctx, 1, 280000);
  const es = chartSeries(ctx, { start: 25 }, upToSam, SAMC); const ea = upToAlex > 35 ? chartSeries(ctx, { start: 35 }, upToAlex, ALEXC) : null;
  (tags || []).forEach(([age, who, a]) => { if (a <= 0) return; const o = who === 'sam' ? { start: 25 } : { start: 35 }; const v = valueAtAge(age, o);
    const x = ax(age), y = vy(v); circle(ctx, x, y, 14); fillStroke(ctx, who === 'sam' ? SAMC : ALEXC, 5);
    ctx.save(); ctx.globalAlpha = a; tag(ctx, x + (who === 'sam' ? -10 : 60), y + (who === 'sam' ? -60 : 50), moneyK(v), who === 'sam' ? SAMC : ALEXC, '#fff', 36); ctx.restore(); });
  return [es, ea];
}
shot(51, 'cut', (ctx, lt, t, at) => { const a35 = clamp(lt / 1.5), age = lt < at(53) ? lerp(25, 35, easeOut(clamp(lt / 3))) : lerp(35, 45, easeOut(clamp((lt - at(53)) / 2)));
  raceChart(ctx, lt, t, age, age, [[35, 'sam', popIn(lt, at(52))], [45, 'sam', popIn(lt, at(53) + 1)], [45, 'alex', popIn(lt, at(53) + 3)]]);
  const p = popIn(lt, at(52) + 3); if (p > 0 && lt < at(53)) tag(ctx, ax(35) + 300, vy(0) - 170, 'Alex: $0, just starting', ALEXC, '#fff', 34 * p); });
shot(54, 'cut', (ctx, lt, t, at) => { const age = lerp(45, 55, easeOut(clamp(lt / 2)));
  raceChart(ctx, lt, t, age, age, [[55, 'sam', popIn(lt, 1.2)], [55, 'alex', popIn(lt, 4)]]);
  const p = popIn(lt, at(55)); if (p > 0) { ctx.save(); ctx.setLineDash([14, 12]); line(ctx, ax(45), vy(valueAtAge(45, { start: 25 })), ax(55), vy(valueAtAge(55, { start: 35 })), 6, '#5f5862'); ctx.restore(); tag(ctx, ax(50), vy(80000) - 40, 'always 10 years behind', '#fff', INK, 38 * p); } });
shot(56, 'cut', (ctx, lt, t) => { raceChart(ctx, lt, t, lerp(55, 60, clamp(lt / 6)), lerp(55, 60, clamp(lt / 6)), []);
  const p = popIn(lt, .4); if (p > 0) { ctx.save(); ctx.globalAlpha = .25 * p; ctx.fillStyle = GOLD; ctx.fillRect(ax(55), CH.y1 - 40, ax(65) - ax(55), CH.y0 - CH.y1 + 40); ctx.restore(); tag(ctx, ax(60), CH.y1 - 10, 'the last 10 years', GOLD, INK, 40 * p); } });
shot(58, 'cut', (ctx, lt, t, at) => { const aa = lerp(60, 65, easeOut(clamp(lt / 1.6))), sa = lt < at(61) ? 60 : lerp(60, 65, easeOut(clamp((lt - at(61)) / 1.6)));
  const [es, ea] = raceChart(ctx, lt, t, sa, aa, []);
  endTag(ctx, ea, '$122,000', ALEXC, 50, popIn(lt, at(59))); endTag(ctx, es, '$262,000', SAMC, -55, popIn(lt, at(61) + 1.2));
  const g = popIn(lt, at(62)); if (g > 0 && es && ea) { line(ctx, ax(65) + 50, es[1], ax(65) + 50, ea[1], 10, REDC); tag(ctx, ax(65) - 220, (es[1] + ea[1]) / 2, 'gap: $140,000', REDC, '#fff', 46 * g); } });
shot(63, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const p = popIn(lt, .1); if (p > 0) { coinStack(ctx, 560, 820, 4, 80); tag(ctx, 560, 380, '$12,000 extra', SAMC, '#fff', 52 * p); }
  const a = clamp((lt - 1) / 1); arrowR(ctx, 760, 620, lerp(760, 1080, easeOut(a)), 40, GREEN);
  const q = popIn(lt, 2); if (q > 0) { coinStack(ctx, 1340, 820, 18, 80); tag(ctx, 1340, 200, '$140,000', GREEN, '#fff', 64 * q); } });
shot(64, 'whip', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 960, y: 900, s: 400, arms: hips, face: { eyes: 'normal', mouth: 'smirk', browOne: 1 } }));
  const p = popIn(lt, .2); if (p > 0) text(ctx, 'it gets stranger', 960, 250, 90 * p, INK, INK, 0); });
shot(65, 'cut', (ctx, lt, t, at) => { paper(ctx, drift(t, lt, 1, 1.02)); chartFrame(ctx, 1, 280000);
  const stop = { start: 25, stop: 35 }; const up = lt < at(67) ? lerp(25, 35, easeOut(clamp(lt / 4))) : lerp(35, 65, clamp((lt - at(67)) / 8));
  const e = chartSeries(ctx, stop, up, SAMC, 12, up > 35 ? [24, 14] : null);
  const p = popIn(lt, at(66)); if (p > 0) tag(ctx, ax(35), vy(valueAtAge(35, stop)) - 90, 'stops at 35: $12,000 in', SAMC, '#fff', 36 * p);
  endTag(ctx, up >= 64.5 ? e : null, '$140,000', SAMC, -55, popIn(lt, at(68) + .5)); });
shot(69, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt)); card(ctx, 330, 170, 1260, 700);
  const s = easeOut(clamp(lt / 1.2)), a = easeOut(clamp((lt - .6) / 1.2));
  rrect(ctx, 560, 780 - 500 * s, 300, 500 * s, 20); fillStroke(ctx, SAMC, 7); rrect(ctx, 1060, 780 - 435 * a, 300, 435 * a, 20); fillStroke(ctx, ALEXC, 7);
  line(ctx, 460, 780, 1460, 780, 7); text(ctx, 'Sam: saved 10 years', 710, 830, 36, INK, INK, 0); text(ctx, 'Alex: saved 30 years', 1210, 830, 36, INK, INK, 0);
  if (s > .9) tag(ctx, 710, 250, '$140,000', SAMC, '#fff', 44); if (a > .9) tag(ctx, 1210, 315, '$122,000', ALEXC, '#fff', 44); });
shot(70, 'whip', (ctx, lt, t) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(ALEX, { x: lerp(500, 1300, clamp(lt / 1.6)), y: 900, s: 360, lean: .25, legs: walk(t, 16, .8), arms: { L: [.8 - Math.sin(t * 16), -1.2], R: [.8 + Math.sin(t * 16), -1.2] }, face: { eyes: 'squint', mouth: 'teeth' } }));
  const p = popIn(lt, .2); if (p > 0) text(ctx, 'can Alex catch up?', 960, 260, 84 * p, INK, INK, 0); });
shot(71, 'cut', (ctx, lt, t, at) => { paper(ctx, drift(t, lt, 1, 1.02)); chartFrame(ctx, 1, 280000);
  const es = chartSeries(ctx, { start: 25 }, 65, SAMC); endTag(ctx, es, '$262,000', SAMC, -55, 1);
  const ea = chartSeries(ctx, { start: 35, monthly: 200 }, lerp(35, 65, easeOut(clamp((lt - .4) / 3))), ALEXC);
  const p = popIn(lt, .2); if (p > 0) tag(ctx, ax(45), vy(230000), 'Alex at $200 a month', ALEXC, '#fff', 40 * p);
  if (lt > at(72)) endTag(ctx, ea, '$244,000', ALEXC, 55, popIn(lt, at(72) + .4));
  const q = popIn(lt, at(73)); if (q > 0) tag(ctx, ax(45), vy(170000), 'puts in $72,000', '#fff', INK, 38 * q);
  const r = popIn(lt, at(74)); if (r > 0) tag(ctx, ax(45), vy(110000), 'needs $215 a month to tie', REDC, '#fff', 40 * r); });
shot(75, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const tilt = -.18 * easeOut(clamp(lt / 1.2)); ctx.save(); ctx.translate(960, 560); ctx.rotate(tilt); line(ctx, -420, 0, 420, 0, 16, INK);
  circle(ctx, -380, -90, 80); fillStroke(ctx, '#fff', 8); line(ctx, -380, -90, -380, -140, 8); line(ctx, -380, -90, -345, -80, 8); text(ctx, 'time', -380, 30, 44, INK, INK, 0);
  coinStack(ctx, 380, -10, 3, 60); text(ctx, 'money', 380, 30, 44, INK, INK, 0); ctx.restore();
  path(ctx, [[960, 560], [920, 860], [1000, 860]]); fillStroke(ctx, '#9aa3ad', 7); });

// 6. rule of 72 ----------------------------------------------------------------------------------
shot(76, 'whip', (ctx, lt, t) => sectionTitle(ctx, lt, t, 'Part 4', 'The rule of 72'));
shot(78, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t); card(ctx, 460, 200, 1000, 500);
  const p = popIn(lt, .3); if (p > 0) text(ctx, '72 ÷ 7% ≈ 10', 960, 400, 130 * p, INK, INK, 0);
  const q = popIn(lt, 3.2); if (q > 0) text(ctx, 'years to double', 960, 570, 60 * q, GREEN_D, INK, 0); });
shot(79, 'cut', (ctx, lt, t, at) => { duoBG(ctx, lt, t);
  const dbl = Math.min(4, Math.floor(lt / 1.4) + 1);
  for (let k = 0; k < 4; k++) { const n = Math.pow(2, k); const a = k < dbl ? 1 : 0; if (!a) continue; coinStack(ctx, 520 + k * 300, 860, n * 2, 52); text(ctx, 'x' + n, 520 + k * 300, 900 - n * 2 * 18 - 70, 50, GREEN_D, INK, 0); }
  const p = popIn(lt, at(80)); if (p > 0) { tag(ctx, 960, 170, 'Sam: 4 doublings   Alex: 3', '#fff', INK, 48 * p); } });
shot(82, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  const a = easeOut(clamp(lt / 1.5)), b = easeOut(clamp((lt - 3) / 1.5));
  rrect(ctx, 420, 860 - 300 * a, 160, 300 * a, 14); fillStroke(ctx, GOLD, 6); rrect(ctx, 620, 860 - 600 * a, 160, 600 * a, 14); fillStroke(ctx, GOLD, 6);
  if (a > .8) { text(ctx, '$130k', 500, 520, 40, INK, INK, 0); text(ctx, '$260k', 700, 220, 40, INK, INK, 0); tag(ctx, 600, 140, '+$130,000', GREEN, '#fff', 44); }
  rrect(ctx, 1240, 860 - 3 * b, 160, 3 * b + 2, 4); fillStroke(ctx, GOLD, 6); rrect(ctx, 1440, 860 - 6 * b, 160, 6 * b + 2, 4); fillStroke(ctx, GOLD, 6);
  if (b > .8) { text(ctx, '$1k', 1320, 810, 40, INK, INK, 0); text(ctx, '$2k', 1520, 800, 40, INK, INK, 0); tag(ctx, 1420, 680, '+$1,000', '#fff', INK, 44); } });
shot(83, 'cut', (ctx, lt, t) => { paper(ctx, drift(t, lt)); chartFrame(ctx, 1, 280000);
  const es = chartSeries(ctx, { start: 25 }, 65, SAMC); const ea = chartSeries(ctx, { start: 35 }, 65, ALEXC);
  const p = popIn(lt, 2.2); if (p > 0) { ctx.save(); ctx.globalAlpha = .28 * p; ctx.fillStyle = REDC; ctx.fillRect(ax(55), CH.y1 - 40, ax(65) - ax(55), CH.y0 - CH.y1 + 40); ctx.restore(); tag(ctx, ax(52), CH.y1 - 10, 'it costs you the ending', REDC, '#fff', 42 * p); } });

// 7. fees, crashes, $3.30 ------------------------------------------------------------------------
shot(84, 'whip', (ctx, lt, t) => sectionTitle(ctx, lt, t, 'Part 5', 'The quiet leak: fees'));
shot(86, 'cut', (ctx, lt, t, at) => { duoBG(ctx, lt, t); bucket(ctx, 960, 860, 1.3, .7, lt > at(87) ? lt : 0);
  const p = popIn(lt, .4); if (p > 0) tag(ctx, 1420, 300, '1% a year', REDC, '#fff', 50 * p);
  const q = popIn(lt, at(87) + .6); if (q > 0) tag(ctx, 520, 300, '7%  →  6%', '#fff', INK, 60 * q); });
shot(88, 'cut', (ctx, lt, t, at) => { paper(ctx, drift(t, lt, 1, 1.02)); chartFrame(ctx, 1, 280000);
  const up = lerp(25, 65, easeOut(clamp(lt / 3))); const es = chartSeries(ctx, { start: 25 }, up, SAMC); const ef = chartSeries(ctx, { start: 25, rate: .06 }, up, REDC, 10, [20, 12]);
  endTag(ctx, es, '$262,000', SAMC, -55, popIn(lt, 3)); endTag(ctx, ef, '$199,000 with a 1% fee', REDC, 60, popIn(lt, 4.5));
  const g = popIn(lt, at(89)); if (g > 0) tag(ctx, ax(45), vy(200000), 'over $60,000 gone', REDC, '#fff', 46 * g); });
shot(90, 'whip', (ctx, lt, t, at) => { paper(ctx, drift(t, lt)); card(ctx, 200, 150, 1520, 720);
  const months = 12, prices = Array.from({ length: months }, (_, k) => 1 - .45 * Math.exp(-Math.pow((k - 4) / 2.2, 2)) + k * .02);
  for (let k = 0; k < months; k++) { const x = 330 + k * 115, y = 720 - prices[k] * 420; if (k) line(ctx, x - 115, 720 - prices[k - 1] * 420, x, y, 12, GREEN); circle(ctx, x, y, 12); fillStroke(ctx, GREEN, 4);
    const shown = lt > at(92) ? clamp((lt - at(92) - k * .35) / .4) : 0; if (shown > 0) { const n = Math.round(3 / prices[k]); for (let j = 0; j < n; j++) coin(ctx, x, 830 - j * 16, 20, 0, shown); } }
  const p = popIn(lt, .3) * (1 - clamp((lt - at(92)) / .25)); if (p > 0) tag(ctx, 960, 230, 'a crash right after you start', REDC, '#fff', 42 * p);
  const q = popIn(lt, at(92) + .3); if (q > 0) tag(ctx, 960, 230, '$100 buys more when prices drop', GREEN, '#fff', 40 * q);
  const r = popIn(lt, at(93) + 1); if (r > 0) tag(ctx, 960, 340, 'dollar cost averaging', SAMC, '#fff', 48 * r); });
shot(95, 'whip', (ctx, lt, t, at) => { duoBG(ctx, lt, t);
  const o = popIn(lt, .2) * (1 - clamp((lt - at(96) + .2) / .2)); if (o > 0) { ctx.save(); ctx.translate(960, 400); ctx.scale(o, o); text(ctx, '$100 a month?', 0, 0, 130, INK, INK, 0); ctx.restore(); }
  const p = popIn(lt, at(96)); if (p > 0) { ctx.save(); ctx.translate(960, 330); ctx.scale(p, p); text(ctx, '$3.30 a day', 0, 0, 130, GREEN, INK, 12); ctx.restore(); }
  const items = [['one takeaway', 'a week', '#e9725b'], ['a forgotten', 'subscription', '#7a8fd6'], ['a slice of', 'your raise', '#5fbf9a']];
  items.forEach(([a, b, c], k) => { const q = popIn(lt, at(97) + k * 2.2); if (q > 0) { const cx = 480 + k * 480; ctx.save(); ctx.translate(cx, 640); ctx.scale(q, q); rrect(ctx, -210, -100, 420, 200, 24); fillStroke(ctx, c, 6); text(ctx, a, 0, -28, 44, '#fff', INK, 8); text(ctx, b, 0, 32, 44, '#fff', INK, 8); ctx.restore(); } });
  const r = popIn(lt, at(98)); if (r > 0) tag(ctx, 960, 820, 'starting matters more than the amount', '#fff', INK, 42 * r); });

// 8. recap, disclaimer, CTA ----------------------------------------------------------------------
shot(99, 'whip', (ctx, lt, t) => sectionTitle(ctx, lt, t, 'Recap', 'What does this all mean?'));
shot(100, 'cut', (ctx, lt, t, at) => { paper(ctx, drift(t, lt)); card(ctx, 360, 150, 1200, 720);
  [['1', 'Start as early as you can', 100], ['2', 'Keep it going every month', 102], ['3', 'Watch your fees', 103]].forEach(([n, s, li], k) => { const p = popIn(lt, at(li)); if (p <= 0) return;
    circle(ctx, 500, 290 + k * 200, 60 * p); fillStroke(ctx, GOLD, 7); text(ctx, n, 500, 292 + k * 200, 64 * p, INK, INK, 0); text(ctx, s, 600, 292 + k * 200, 64 * p, INK, INK, 0, 'Poppins', 700, 'left'); });
  const q = popIn(lt, at(101) + .3); if (q > 0 && lt < at(102)) tag(ctx, 1280, 390, 'early > double the money', GREEN, '#fff', 34 * q); });
shot(104, 'cut', (ctx, lt, t, at) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(ALEX, { x: 700, y: 900, s: 360, arms: lt > at(105) ? cheer : shrug, face: { eyes: lt > at(105) ? 'happy' : 'wide', mouth: lt > at(105) ? 'grin' : 'o' } }));
  rrect(ctx, 1080, 300, 420, 420, 30); fillStroke(ctx, '#fff', 8); rrect(ctx, 1080, 300, 420, 110, 30); fillStroke(ctx, REDC, 8);
  text(ctx, 'TODAY', 1290, 357, 56, '#fff', INK, 0); const p = popIn(lt, at(105) + .3); if (p > 0) { ctx.save(); ctx.translate(1290, 560); ctx.rotate(-.1); text(ctx, 'START', 0, 0, 96 * p, GREEN, INK, 0); ctx.restore(); } });
shot(106, 'whip', (ctx, lt, t) => { paper(ctx, drift(t, lt)); card(ctx, 320, 170, 1280, 680);
  text(ctx, 'For education only', 960, 270, 70, INK, INK, 0);
  ['Not financial advice.', 'Markets can go down as well as up.', 'Assumes 7% a year after inflation,', 'with $100 added every month.'].forEach((s, k) => { const p = popIn(lt, .4 + k * 1.6); if (p > 0) text(ctx, s, 960, 410 + k * 95, 50 * p, k < 2 ? REDC : '#3b3540', INK, 0); }); });
shot(109, 'cut', (ctx, lt, t) => { duoBG(ctx, lt, t);
  coin(ctx, 960, 380, 150, Math.sin(t * 2) * .1); text(ctx, 'Stickonomics', 960, 620, 110, INK, INK, 0);
  const p = popIn(lt, 3.2); if (p > 0) { rrect(ctx, 960 - 230 * p, 700, 460 * p, 110, 55); fillStroke(ctx, REDC, 7); text(ctx, 'SUBSCRIBE', 960, 757, 54 * p, '#fff', INK, 0); } });
shot(110, 'cut', (ctx, lt, t, at) => { duoBG(ctx, lt, t);
  drawStick(ctx, C(SAM, { x: 600, y: 900, s: 380, arms: cheer, face: { eyes: 'happy', mouth: 'grin' } })); tag(ctx, 600, 260, 'Sam: started at 25', SAMC, '#fff', 44);
  const p = popIn(lt, 1.4); if (p > 0) { ctx.save(); ctx.translate(1300, 520); ctx.scale(p, p); text(ctx, 'When are', 0, -70, 96, INK, INK, 0); text(ctx, 'you starting?', 0, 50, 96, GREEN, INK, 0); ctx.restore(); } });
shot('end', 'cut', (ctx, lt, t) => endScreen(ctx, lt, t));
finalize();
