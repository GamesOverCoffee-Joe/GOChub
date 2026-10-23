const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const pg = await b.newPage();
  await pg.addInitScript(() => { let g; Object.defineProperty(window, 'GOQ', { configurable: true, get() { return g; }, set(v) { const G = v.Game; v.Game = class extends G { constructor(...a) { super(...a); window.__game = this; } }; g = v; } }); });
  await pg.goto('http://localhost:8765/museum/museum.html?time=day'); await pg.waitForFunction(() => window.__game && window.__game.ready); await pg.waitForTimeout(3000);
  const out = await pg.evaluate(() => { const g = window.__game, o = {}; for (const id of ['museum', 'lobby', 'staff', 'office', 'storage', 'screening', 'outside', 'dock']) { const r = g.rooms[id]; if (!r) continue; const c = g.renderRoomFull(id, true); o[id] = { w: r.w, h: r.h, name: r.name, png: c.toDataURL() }; } return o; });
  const fs = require('fs'); for (const [id, v] of Object.entries(out)) { fs.writeFileSync(process.argv[2] + '/' + id + '.png', Buffer.from(v.png.split(',')[1], 'base64')); delete v.png; }
  fs.writeFileSync(process.argv[2] + '/../rooms.json', JSON.stringify(out)); console.log(JSON.stringify(out)); await b.close(); })();
