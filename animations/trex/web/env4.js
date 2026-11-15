// ---------- T. rex, jungle, computer, sign ----------
// cartoon T. rex facing right; (x, y) = ground under the hips; phase drives the stride; o.bones = X-ray skeleton
function drawRex(ctx, x, y, s, phase, o = {}) {
  const col = o.col || '#4f9a5c', belly = '#9fd08a', jaw = o.jaw || 0, bones = !!o.bones, crack = o.crack || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip || 1), s);
  const lift = Math.abs(Math.sin(phase)) * 14;
  ctx.translate(0, -lift);
  const legs = [[Math.sin(phase) * .5, -1], [Math.sin(phase + Math.PI) * .5, 1]];
  const ink = bones ? '#e8f4ff' : INK;
  const leg = (a, front) => {
    const hx = front ? 20 : -10, hy = -330;
    const kx = hx + Math.sin(a) * 150 + 40, ky = hy + Math.cos(a) * 150;
    const fx = kx + Math.sin(a - .9) * 170 - 40, fy = ky + Math.cos(a - .9) * 170 + lift;
    if (bones) {
      line(ctx, hx, hy, kx, ky, 12, ink); line(ctx, kx, ky, fx, fy, 10, ink); circle(ctx, kx, ky, 12); ctx.fillStyle = ink; ctx.fill();
      if (front && crack > 0) { ctx.save(); ctx.globalAlpha = crack; const mx = (kx + fx) / 2, my = (ky + fy) / 2; path(ctx, [[mx - 30, my - 30], [mx - 6, my - 6], [mx - 22, my + 4], [mx + 4, my + 26], [mx - 2, my + 6], [mx + 18, my]], false); ctx.lineWidth = 9; ctx.strokeStyle = '#ff4a3d'; ctx.stroke(); ctx.restore(); }
      line(ctx, fx, fy, fx + 60, fy + 4, 8, ink); return;
    }
    ctx.beginPath(); ctx.moveTo(hx - 70, hy - 30); ctx.quadraticCurveTo(hx + 90, hy - 20, kx + 30, ky); ctx.lineTo(kx - 20, ky + 10); ctx.quadraticCurveTo(hx - 60, hy + 80, hx - 70, hy - 30); fillStroke(ctx, front ? col : mix(col, '#000000', .18), 8);
    line(ctx, kx, ky, fx, fy, 34, INK); line(ctx, kx, ky, fx, fy, 22, front ? col : mix(col, '#000000', .18));
    ellipse(ctx, fx + 30, fy, 52, 18); fillStroke(ctx, front ? col : mix(col, '#000000', .18), 7);
  };
  leg(legs[1][0], false);
  if (bones) {
    // spine, tail, ribs, skull
    ctx.beginPath(); ctx.moveTo(-520, -380); ctx.quadraticCurveTo(-200, -470, 120, -440); ctx.quadraticCurveTo(200, -440, 240, -520); ctx.lineWidth = 12; ctx.strokeStyle = ink; ctx.stroke();
    for (let i = 0; i < 7; i++) { const rx = -60 + i * 28; ctx.beginPath(); ctx.moveTo(rx, -455 + i * 2); ctx.quadraticCurveTo(rx + 20, -360, rx - 6, -300); ctx.lineWidth = 7; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(210, -600); ctx.lineTo(400, -590); ctx.lineTo(420, -540); ctx.lineTo(240, -500); ctx.closePath(); ctx.lineWidth = 9; ctx.stroke();
    circle(ctx, 330, -575, 16); ctx.stroke();
  } else {
    const body = () => { ctx.beginPath(); ctx.moveTo(-560, -390); ctx.quadraticCurveTo(-300, -500, -40, -470); ctx.quadraticCurveTo(150, -460, 210, -540); ctx.lineTo(250, -470); ctx.quadraticCurveTo(200, -300, 0, -280); ctx.quadraticCurveTo(-250, -280, -560, -370); ctx.closePath(); };
    body(); fillStroke(ctx, col, 8);
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = belly; ellipse(ctx, -20, -290, 200, 60); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.1)'; for (let i = 0; i < 6; i++) { ellipse(ctx, -380 + i * 90, -440, 22, 14); ctx.fill(); } ctx.restore();
    body(); fillStroke(ctx, null, 8);
    // tiny arm
    line(ctx, 140, -420, 190, -380, 20, INK); line(ctx, 140, -420, 190, -380, 11, col); line(ctx, 190, -380, 214, -372, 8, INK);
    // head with jaw
    ctx.save(); ctx.translate(230, -560);
    ctx.save(); ctx.rotate(jaw * .45); rrect(ctx, -10, 10, 210, 50, 22); fillStroke(ctx, col, 8); for (let i = 0; i < 5; i++) { path(ctx, [[30 + i * 34, 12], [44 + i * 34, -8], [58 + i * 34, 12]]); fillStroke(ctx, '#fff', 4); } ctx.restore();
    rrect(ctx, -40, -80, 280, 100, 40); fillStroke(ctx, col, 8);
    for (let i = 0; i < 5; i++) { path(ctx, [[60 + i * 34, 18], [74 + i * 34, 40], [88 + i * 34, 18]]); fillStroke(ctx, '#fff', 4); }
    circle(ctx, 70, -40, 22); fillStroke(ctx, '#fff', 6); circle(ctx, 76 + (o.look || 0) * 6, -40, 10); ctx.fillStyle = INK; ctx.fill();
    line(ctx, 40, -72, 100, -62, 9, INK); circle(ctx, 225, -50, 6); ctx.fillStyle = INK; ctx.fill();
    ctx.restore();
  }
  leg(legs[0][0], true);
  ctx.restore();
}
function drawJungle(ctx, t, cam, scroll = 0, o = {}) {
  applyCam(ctx, cam, .1); drawSky(ctx, o.skyTop || '#7fd0e8', o.skyBot || '#e8f7d4', -900, 1250);
  applyCam(ctx, cam, .3); ctx.save(); ctx.translate(-((scroll * .2) % 900), 0); ctx.fillStyle = '#7bbf6a'; for (let i = -2; i < 8; i++) { circle(ctx, i * 260, 980, 220); ctx.fill(); } ctx.restore();
  applyCam(ctx, cam, .6); ctx.save(); ctx.translate(-((scroll * .5) % 1200), 0); for (let i = -2; i < 8; i++) drawTree(ctx, i * 300 + 60, 1080, 1.8); ctx.restore();
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#c99a5e'; ctx.fillRect(-1400, 1080, 4000, 1500); line(ctx, -1400, 1080, 2600, 1080, 6);
  ctx.fillStyle = 'rgba(80,50,20,.25)'; for (let x = -1400 - ((scroll % 300) + 300) % 300; x < 2600; x += 300) { ellipse(ctx, x, 1330, 60, 12); ctx.fill(); }
}
function drawComputer(ctx, x, y, w, h, draw) {
  rrect(ctx, x - w / 2 - 20, y - 20, w + 40, h + 40, 24); fillStroke(ctx, '#3a3340', 8);
  rrect(ctx, x - w / 2, y, w, h, 10); fillStroke(ctx, '#0f1a2e', 5);
  ctx.save(); rrect(ctx, x - w / 2, y, w, h, 10); ctx.clip(); ctx.strokeStyle = 'rgba(80,200,255,.12)'; ctx.lineWidth = 2; for (let gx = x - w / 2; gx < x + w / 2; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); } for (let gy = y; gy < y + h; gy += 40) { ctx.beginPath(); ctx.moveTo(x - w / 2, gy); ctx.lineTo(x + w / 2, gy); ctx.stroke(); }
  if (draw) draw(); ctx.restore();
  rrect(ctx, x - 50, y + h + 20, 100, 70, 6); fillStroke(ctx, '#3a3340', 7); rrect(ctx, x - 160, y + h + 86, 320, 28, 12); fillStroke(ctx, '#3a3340', 7);
}
function drawSign(ctx, x, y, s, l1, l2) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -12, -40, 24, 260, 6); fillStroke(ctx, '#9a5a2a', 6);
  rrect(ctx, -170, -230, 340, 200, 18); fillStroke(ctx, '#fff6d6', 8);
  text(ctx, l1, 0, -170, 52, '#e0392f', INK, 0); text(ctx, l2, 0, -100, 52, INK, INK, 0);
  ctx.restore();
}
