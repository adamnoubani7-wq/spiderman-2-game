const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/thumb.html'); await p.waitForFunction(() => document.title === 'ready', null, { timeout: 15000 });
  await (await p.$('#c')).screenshot({ path: __dirname + '/thumb-1920.png' }); await b.close(); })();
