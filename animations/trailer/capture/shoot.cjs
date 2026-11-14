const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/shelf.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await p.screenshot({ path: __dirname + '/../public/textures/channel/shelf.png' }); await b.close(); })();
