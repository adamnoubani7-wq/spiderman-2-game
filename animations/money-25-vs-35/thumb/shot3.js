const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 3240 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log(m.text()));
  await p.goto('file://' + __dirname + '/options.html'); await p.waitForFunction(() => document.title === 'ready', null, { timeout: 15000 });
  for (const id of ['a', 'b', 'c']) await (await p.$('#' + id)).screenshot({ path: __dirname + '/opt-' + id + '.png' }); await b.close(); })();
