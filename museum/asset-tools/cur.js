const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const pg = await b.newPage();
  await pg.addInitScript(() => { let g; Object.defineProperty(window, 'GOQ', { configurable: true, get() { return g; }, set(v) { const G = v.Game; v.Game = class extends G { constructor(...a) { super(...a); window.__game = this; } }; g = v; } }); });
  await pg.goto('http://localhost:8765/museum/museum.html'); await pg.waitForFunction(() => window.__game && window.__game.ready); await pg.waitForTimeout(2500);
  const keys = process.argv[2].split(',');
  const out = await pg.evaluate(keys => { const g = window.__game, o = {}; for (const k of keys) { try { let c = g.sheet(k); if (!c.toDataURL) { const cv = document.createElement('canvas'); cv.width = c.naturalWidth || c.width; cv.height = c.naturalHeight || c.height; cv.getContext('2d').drawImage(c, 0, 0); c = cv; } o[k] = { src: c.toDataURL(), own: !!g.overrides[k], w: c.width, h: c.height }; } catch (e) { o[k] = { err: e.message }; } } return o; }, keys);
  require('fs').writeFileSync(process.argv[3], JSON.stringify(out)); console.log(Object.entries(out).map(([k, v]) => k + (v.own ? '(yours)' : '') + ' ' + v.w + 'x' + v.h + (v.err || '')).join(', ')); await b.close(); })();
