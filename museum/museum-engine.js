/* GOQ Museum engine (museum-engine.js). Shared by museum.html and curator.html.
   Built on the same foundations as The Karman Line Theater: 16px tiles, a 240x160 screen,
   nine-slice text boxes, keyboard + touch controls, and swappable art.
   Every piece of art is a named slot (see SLOTS). The built-in art is drawn in code as a placeholder;
   a museum pack (JSON) can replace any slot with an image, and add the museum's pieces. */
(function () {
"use strict";
const T = 16, VW = 15, VH = 10, SW = VW * T, SH = VH * T;
const PACK_FORMAT = "goq-museum-pack";

/* ---------- Placeholder colors ----------
   Game Boy Color in spirit: a few flat shades per thing, darkest = outline.
   Not limited to four. Custom art can use any colors. */
const PAL = {
  lobby:   ["#f6eedc", "#d8c8a4", "#9c7c58", "#2e2218", "#fffaf0"],
  gallery: ["#ece8f4", "#8c7cc0", "#4a3c7c", "#1a1430", "#b4a8dc"],
  wood:    ["#f0dcc0", "#c08858", "#784830", "#2c1810", "#a06c44"],
  gold:    ["#fff6cc", "#f0c040", "#b07818", "#3c2408", "#c8d8e8", "#a8bcd0"],
  plant:   [null, "#9ccc68", "#4c8c3c", "#1e2418", "#c8784c", "#8a4428", "#a89048"],
  dust:    ["#e8e0d0", "#b8b0a0"],
  mug:     ["#f8f4ec", "#e8e4dc", "#3a2418", "#181820"], // 0 is the mug's body: it used to be see-through, so the floor showed through the mug
  switchp: ["#f4f0e8", "#e8b24a", "#505068", "#181820"],
  door:    [null, "#3a2c4c", "#6a5878", "#120c18", "#f4d888", "#b88a38"],
  mat:     [null, "#c85848", "#8a3028", "#2a1010", "#e8b24a"],
  cloth:   ["#f4f0e8", "#d8d0c4", "#a89c8c", "#3a3430"],
  staffrm: ["#eef0e4", "#c4ccb4", "#7c8a6c", "#20261c", "#e2e6d4"],
  locker:  ["#e8eef4", "#9fb4c8", "#5a7088", "#1a2230", "#e8b24a"],
  medal:   ["#d84040", "#902828", "#f0c840", "#b07818", "#2a1408", "#fff4c0"],
  chalk:   ["#eef2e6", "#2e5a44", "#7a4a28", "#1a120c", "#f0d050", "#c8d8c8"],
  cork:    ["#f8f0d8", "#c89860", "#8a5a30", "#2a1a10", "#e05050", "#5080c8", "#f0d050"],
  staff:   [null, "#f8e0c0", "#2f6b4f", "#181820", "#f8f0c0"],
  shadow:  [null, "#e8f0ff", "#06040c"],
  board:   ["#fbfbf6", "#c4ccd4", "#505868", "#181820", "#e05050", "#2f6b4f"],
  shop:    ["#f8e4c4", "#e0a868", "#9a5a34", "#2a160c", "#f0c890", "#c87848"],
  shopfl:  ["#e0ae74", "#d29e64", "#a8723f", "#3a200e", "#ecc088"],
  trinket: [null, "#f8f0e0", "#e06848", "#f0b840", "#58a868", "#5878c8", "#b868b8", "#8a5a34", "#2a160c", "#f8c8c8", "#78c8c8"],
  rug:     ["#f0d8b0", "#c84848", "#e8a040", "#3a6888", "#2a160c"],
  carpet:  ["#e8c070", "#9a3040", "#7c2434", "#4a1420", "#f4dca0"],
  darkwood: ["#8a5e3e", "#5e3c26", "#43291a", "#1c100a", "#704a30"],
  plush:   ["#8c8c8c", "#7e7e7e", "#727272", "#9a9a9a"],
  m_dusk:  ["#2a1838", "#6a2850", "#c84e48", "#f0904a", "#f8d070", "#1c1428", "#3a2440", "#fff0c0"],
  m_canyon: ["#7ab8e0", "#a8d4ec", "#f4f8fc", "#c85a38", "#9a3c24", "#e8b878", "#4a4048", "#f0e0a0"],
  m_storm: ["#48506a", "#6a7490", "#9aa4bc", "#f8f4c0", "#4a7a3a", "#2e5428", "#7aa050", "#d8e0e8"],
  m_volcano: ["#140c24", "#2a1a40", "#fff6d0", "#3a2a30", "#e05030", "#f8a040", "#5a3a3a", "#ffd870"],
  screen:  ["#1a2030", "#3a4a68", "#7ad0e8", "#d0f4ff", "#6a5240", "#4a382a", "#2a1e16", "#e8b24a", "#6a1a26", "#9a2c3a"],
  m_isles: ["#bfe6e0", "#e8f6f2", "#5aa890", "#3c7a68", "#8a7058", "#a8dcf0", "#ffffff", "#f0d890"],
  m_castle: ["#9cc4e8", "#d8ecf8", "#6a8a4a", "#4a6a38", "#8a8c98", "#5c5e6c", "#c84040", "#e8d8a0"],
  m_forest: ["#1a2240", "#2c3660", "#f4ecc0", "#1e3a2e", "#2c5440", "#f0b860", "#4a3a5a", "#9ab0d8"],
  sconce:  ["#fff0b8", "#f0b850", "#9a6c34", "#3a2414"],
  cat:     [null, "#f0a050", "#c87028", "#2a1810", "#f8f0e0", "#f88898", "#a05018"],
  apron:   [null, "#f0d0b0", "#c86848", "#181820", "#f8f0c0"],
  guard:   [null, "#e8c098", "#283c64", "#181820", "#f0c040"],
  sky:     ["#f8f8ff", "#a8d8f8", "#78b8e8", "#4878b8", "#ffffff", "#ffe080", "#f89850", "#d05878", "#683878", "#181838", "#283058", "#f8f0c8"],
  shutter: [null, "#b8c0c8", "#7c8894", "#2a3038"],
  cafe:    ["#fbf3e6", "#d8a878", "#8a5a38", "#2a1810", "#5a9850", "#e86868", "#f0c060"],
  cups:    [null, "#f8f8f0", "#5a3420", "#181820", "#c89040", "#a06040", "#f8e8d8", "#c8c8d0"],
  glass:   ["#f4fbff", "#c8a878", "#7c5a3a", "#2a1a10", "#a8d0e8"],
  usher:   [null, "#e8c098", "#8a2a3a", "#181820", "#f0c040"],
  g2:      ["#e4f0ec", "#7ab0a0", "#3a6a60", "#14261f", "#a8d0c4"],
  g2fl:    ["#d8c8b0", "#b8a080", "#8a6c48", "#2a1e12", "#e8dcc8"],
  g3:      ["#f4ece0", "#d8c4a4", "#9a7e5a", "#2a2018", "#e8dcc4"],
  g3fl:    ["#c89868", "#a87848", "#7a5030", "#2a1a0e", "#dcb080"],
  pc:      [null, "#d8d8d0", "#909098", "#303038", "#68a8d8", "#c8f0ff"],
  shelf:   [null, "#e8e4dc", "#7c7c80", "#181820", "#fbf6ea"],
  tdoor:   [null, "#08060c", "#141018", "#221a28", "#5a1a26", "#6a4a24", "#a8823c", "#e0c070"],
  bulbs:   [null, "#5a4020", "#ffd060", "#fff8e0", "#3a2a18"],
  hposter: [null, "#3a2a20", "#16121a", "#3a2030", "#22303a"],
  aisle:   [null, "#3a2a18", "#ffc860", "#fff2c8"],
  ledsign: [null, "#0a080c", "#2a2630", "#55505e", "#1c0808"],
  arcade:  [null, "#1a1424", "#3a2a5a", "#5a48a0", "#101018", "#40d0c0", "#f0c040", "#e05050", "#5878c8"],
  mags:    [null, "#f8f0e0", "#8a5a38", "#2a160c", "#e05050", "#5878c8", "#f0c040", "#58a868"],
  segway:  [null, "#f8f8f0", "#b0b0c0", "#181820"],
  goqshirt:[null, "#f8e0c0", "#2a2030", "#181820", "#e8b24a"],
  kitchen: [null, "#e8eef4", "#9fb4c8", "#1a2230", "#e05050", "#58a868", "#d8a050"],
  plaque:  [null, "#e8c870", "#7a4a28", "#2a160c", "#f8f0c0"],
  ui:      ["#f8f8f0", "#b0b0c0", "#505068", "#181820"],
  emote:   ["#f8f8f0", "#e05a6a", "#181820", "#e8b030", "#7a7a90", "#f29ab0"],
  bag:     [null, "#8a2a3a", "#5a1824", "#181820", "#e8b24a"],
  player:  [null, "#f8e0c0", "#3878c8", "#181820"],
  visitorA:[null, "#e8c098", "#c83838", "#181820"],
  visitorB:[null, "#c89060", "#8850c0", "#181820"],
  visitorC:[null, "#f8e0c0", "#58a048", "#181820"],
  shirt:   [null, null, "#d8d8d8", null], // just the shirt pixels of the visitor sprites, gray so they tint to any color
};

/* ---------- Pixel helpers (from the Theater) ---------- */
function mk(w, h, v) { const a = []; for (let y = 0; y < h; y++) a.push(new Array(w).fill(v === undefined ? -1 : v)); return a; }
function fillFn(a, fn) { for (let y = 0; y < a.length; y++) for (let x = 0; x < a[0].length; x++) { const v = fn(x, y, a[y][x]); if (v !== undefined) a[y][x] = v; } return a; }
function rect(a, x, y, w, h, v) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (a[j] && i >= 0 && i < a[j].length) a[j][i] = v; return a; }
function px(a, x, y, v) { if (a[y] && x >= 0 && x < a[y].length) a[y][x] = v; }
function circ(a, cx, cy, r, v) { fillFn(a, (x, y) => ((x - cx) ** 2 + (y - cy) ** 2 <= r * r ? v : undefined)); }
function outline(a, v) {
  if (v === undefined) v = 3;
  const h = a.length, w = a[0].length, b = a.map(r => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (a[y][x] < 0) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const yy = y + dy, xx = x + dx; return yy < 0 || yy >= h || xx < 0 || xx >= w || a[yy][xx] < 0; })) b[y][x] = v;
  }
  return b;
}
function rows(r) { return r.map(s => [...s].map(c => (c === "." ? -1 : +c))); }
function mirror(a) { return a.map(r => r.slice().reverse()); }
function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
function strSeed(s) { let h = 7; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function hexRgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
const isHex = c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c);

/* Turn index grids into a canvas. frames are laid out in `cols` columns. */
function paint(frames, w, h, cols, pal) {
  const rgb = pal.map(c => (c ? hexRgb(c) : null)), rws = Math.ceil(frames.length / cols);
  const c = document.createElement("canvas"); c.width = w * cols; c.height = h * rws;
  const ctx = c.getContext("2d"), img = ctx.createImageData(c.width, c.height);
  frames.forEach((a, f) => {
    const ox = (f % cols) * w, oy = Math.floor(f / cols) * h;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = a[y][x]; if (v < 0 || !rgb[v]) continue;
      const i = ((oy + y) * c.width + ox + x) * 4, col = rgb[v];
      img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = 255;
    }
  });
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ---------- Characters (same 16x16 sprites as the Theater) ---------- */
const HEAD_DOWN = ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3311111133...", "...3111111113...", "...3131111313...", "...3111111113...", "....31111113....", ".....333333....."];
const HEAD_UP = ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333333333...", "...3333333333...", "...3333333333...", "...3133333313...", "....31111113....", ".....333333....."];
const HEAD_LEFT = ["................", "......333333....", ".....33333333...", "....3333333333..", "....3111133333..", "...31111113333..", "...31311113333..", "...31111111333..", "....311111133...", ".....3333333...."];
const BODY_FRONT = ["....32222223....", "...3122222213...", "...3122222213...", "....32222223...."];
const DOWN0 = rows([...HEAD_DOWN, ...BODY_FRONT, "....33333333....", ".....33..33....."]);
const DOWNA = rows([...HEAD_DOWN, ...BODY_FRONT, "....333.3333....", "....33.....3...."]);
const UP0 = rows([...HEAD_UP, ...BODY_FRONT, "....33333333....", ".....33..33....."]);
const UPA = rows([...HEAD_UP, ...BODY_FRONT, "....333.3333....", "....33.....3...."]);
const LEFT0 = rows([...HEAD_LEFT, ".....3222223....", ".....3212223....", ".....3212223....", ".....3222223....", ".....3333333....", ".....33..33....."]);
const LEFTA = rows([...HEAD_LEFT, ".....3222223....", ".....3212223....", ".....3212223....", ".....3222223....", ".....3333333....", "....33.....33..."]);
const LEFTB = rows([...HEAD_LEFT, ".....3222223....", ".....3222123....", ".....3222123....", ".....3222223....", ".....3333333....", "......333......."]);
const CHAR_FRAMES = [DOWN0, DOWNA, mirror(DOWNA), UP0, UPA, mirror(UPA), LEFT0, LEFTA, LEFTB, mirror(LEFT0), mirror(LEFTA), mirror(LEFTB)];
const DIR_ROW = { down: 0, up: 1, left: 2, right: 3 };

/* ---------- Placeholder drawings ---------- */
const GEN = {
  character: f => CHAR_FRAMES[f],
  floor_marble: () => fillFn(mk(16, 16), (x, y) => (x === 0 || y === 0 || hash(x, y) % 31 === 0 ? 2 : ((x >> 3) + (y >> 3)) % 2 ? 1 : 0)),
  runner: () => fillFn(mk(16, 16), (x, y) => (x <= 1 || x >= 14 ? 3 : (x === 3 || x === 12) ? 1 : (x + y) % 6 === 0 ? 1 : 2)),
  floor_wood: () => fillFn(mk(16, 16), (x, y) => {
    if (y % 4 === 3) return 2;
    const plank = y >> 2; if (x === (plank * 7) % 16) return 2;
    return hash(x >> 2, y + plank * 5) % 13 === 0 && y % 4 === 1 ? 4 : 1;
  }),
  wall_top: () => fillFn(mk(16, 16), (x, y) => (y === 15 ? 2 : 3)),
  wall_upper: () => fillFn(mk(16, 16), (x, y) => (y === 0 ? 3 : y === 3 ? 2 : y === 4 ? 4 : y === 2 ? 0 : 1)),
  wall_lower: () => fillFn(mk(16, 16), (x, y) => (y === 12 ? 4 : y === 13 ? 0 : y >= 14 ? (y === 15 ? 3 : 2) : 1)),
  // Doors are drawn over the wall, so everything outside the door is see-through.
  doorway_upper: () => fillFn(mk(16, 16), (x, y) => (y >= 4 && x >= 1 && x <= 14 ? (x <= 2 || x >= 13 || y <= 5 ? (x === 1 || x === 14 || y === 4 ? 5 : 4) : y >= 7 ? 3 : 1) : undefined)),
  doorway_lower: () => fillFn(mk(16, 16), (x, y) => (x >= 1 && x <= 14 ? (x <= 2 || x >= 13 ? (x === 1 || x === 14 ? 5 : 4) : y >= 14 ? 4 : 3) : undefined)),
  staff_upper: () => fillFn(mk(16, 16), (x, y) => (x >= 3 && x <= 12 && y >= 5 ? (x === 3 || x === 12 || y === 5 ? 3 : y === 9 && x >= 5 && x <= 10 ? 0 : 2) : undefined)),
  staff_lower: () => fillFn(mk(16, 16), (x, y) => (x >= 3 && x <= 12 ? (x === 3 || x === 12 || y === 15 ? 3 : x === 10 && (y === 3 || y === 4) ? 0 : 2) : undefined)),
  exit_door: () => fillFn(mk(16, 16), (x, y) => (x >= 2 && x <= 13 && y >= 1 ? (x === 2 || x === 13 || y === 1 || x === 7 || x === 8 ? 2 : (x - y + 32) % 7 === 0 ? 4 : 1) : undefined)),
  // Seen from above, a doorway in a side wall: the frame runs across (top and bottom), the opening goes through the wall.
  doorway_side: () => fillFn(mk(16, 16), (x, y) => (y >= 1 && y <= 14 ? (y <= 2 || y >= 13 ? (y === 1 || y === 14 ? 5 : 4) : x <= 1 || x >= 14 ? 4 : 3) : undefined)),
  doorway_bottom: () => fillFn(mk(16, 16), (x, y) => (x >= 1 && x <= 14 ? (x <= 2 || x >= 13 ? (x === 1 || x === 14 ? 5 : 4) : y <= 1 ? 4 : 3) : undefined)),
  plant: () => {
    let a = mk(16, 16);
    [[8, 5, 4.2], [4.5, 8, 3.2], [11.5, 8, 3.2], [8, 9, 3]].forEach(([cx, cy, r]) => circ(a, cx, cy, r, 1));
    fillFn(a, (x, y, v) => (v === 1 && hash(x, y) % 4 === 0 ? 2 : undefined));
    rect(a, 3, 11, 10, 1, 5); rect(a, 4, 12, 8, 4, 4); rect(a, 10, 12, 1, 4, 5);
    return outline(a);
  },
  bench: () => {
    let a = mk(32, 16);
    rect(a, 1, 4, 30, 2, 1); rect(a, 1, 6, 30, 4, 2); rect(a, 1, 6, 30, 1, 4);
    rect(a, 3, 10, 2, 4, 2); rect(a, 27, 10, 2, 4, 2);
    return outline(a);
  },
  desk: () => {
    let a = mk(48, 16);
    rect(a, 0, 3, 48, 3, 1); rect(a, 0, 3, 48, 1, 0); rect(a, 1, 6, 46, 9, 2);
    for (let x = 6; x < 48; x += 12) rect(a, x, 7, 1, 7, 4);
    rect(a, 18, 0, 12, 4, 0); rect(a, 18, 0, 12, 1, 2); rect(a, 23, 0, 1, 4, 2);
    return outline(a);
  },
  sign: () => {
    let a = mk(16, 16);
    rect(a, 2, 1, 12, 9, 0); rect(a, 4, 3, 8, 1, 2); rect(a, 4, 5, 6, 1, 2); rect(a, 4, 7, 7, 1, 2);
    rect(a, 7, 10, 2, 4, 2); rect(a, 5, 14, 6, 2, 2);
    return outline(a);
  },
  // A piece on the wall: frame with a see-through window (4,4 to 27,21) where the art shows, and a placard plate.
  wall_frame_gold: () => fillFn(mk(32, 32), (x, y) => {
    if (y <= 25) { const d = Math.min(x, y, 31 - x, 25 - y); return d === 0 ? 3 : d === 1 ? 1 : d === 2 ? ((x + y) % 3 ? 0 : 2) : d === 3 ? 2 : undefined; }
    if (y >= 27 && y <= 30 && x >= 11 && x <= 20) return y === 27 || y === 30 || x === 11 || x === 20 ? 3 : y === 28 && x > 12 && x < 19 && x % 2 ? 2 : 0;
  }),
  wall_frame_wood: () => fillFn(mk(32, 32), (x, y) => {
    if (y <= 25) { const d = Math.min(x, y, 31 - x, 25 - y); return d === 0 ? 3 : d <= 2 ? (hash(x, y) % 5 === 0 ? 2 : 1) : d === 3 ? 2 : undefined; }
    if (y >= 27 && y <= 30 && x >= 11 && x <= 20) return y === 27 || y === 30 || x === 11 || x === 20 ? 3 : y === 28 && x > 12 && x < 19 && x % 2 ? 2 : 0;
  }),
  // Covers a piece until its unveil date (what visitors see).
  sheet: () => {
    const a = mk(32, 32);
    fillFn(a, (x, y) => {
      const hem = 27 + Math.round(Math.sin(x / 2.5) * 1.5);
      if (y < 1 || y > hem) return;
      if (y <= 3 && (x < 3 + (3 - y) || x > 28 - (3 - y))) return;
      return (x + Math.round(y / 3)) % 7 === 0 ? 2 : (x + Math.round(y / 4)) % 7 === 1 ? 1 : 0;
    });
    return outline(a);
  },
  // A packed piece waiting to be hung (curator mode). Sits at the foot of the wall.
  crate: () => {
    const a = mk(32, 32);
    rect(a, 9, 9, 14, 10, 4); rect(a, 10, 10, 12, 8, 1); // the frame peeking out of the straw
    rect(a, 4, 17, 24, 2, 2); for (let x = 5; x < 27; x += 3) rect(a, x, 15 + (x % 2), 1, 3, 2);
    rect(a, 3, 19, 26, 13, 1);
    for (let y = 22; y < 32; y += 4) rect(a, 3, y, 26, 1, 2);
    rect(a, 3, 19, 2, 13, 2); rect(a, 27, 19, 2, 13, 2);
    rect(a, 13, 25, 6, 3, 0);
    return outline(a);
  },
  sparkle: f => {
    const a = mk(16, 16), r = [2, 4, 6, 3][f];
    for (let i = -r; i <= r; i++) { const v = Math.abs(i) <= 1 ? 0 : 1; px(a, 8 + i, 8, v); px(a, 8, 8 + i, v); }
    if (f >= 1) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => px(a, 8 + dx, 8 + dy, f === 2 ? 0 : 1));
    return outline(a);
  },
  // Cozy loop
  dust: () => fillFn(mk(32, 32), (x, y) => (y <= 25 && hash(x * 3, y * 7) % 9 === 0 ? (hash(x, y) % 3 ? 0 : 1) : undefined)),
  plant_thirsty: () => {
    let a = mk(16, 16);
    // Leaves droop over the rim and go yellow-brown until watered.
    [[8, 8, 3], [5, 10, 2.4], [11, 10, 2.4]].forEach(([cx, cy, r]) => circ(a, cx, cy, r, 6));
    [[3, 11], [2, 12], [2, 13], [12, 11], [13, 12], [13, 13], [8, 5], [8, 4]].forEach(([x, y]) => px(a, x, y, 6));
    fillFn(a, (x, y, v) => (v === 6 && hash(x, y) % 4 === 0 ? 5 : undefined));
    rect(a, 3, 11, 10, 1, 5); rect(a, 4, 12, 8, 4, 4); rect(a, 10, 12, 1, 4, 5);
    return outline(a);
  },
  mug: () => {
    let a = mk(16, 16);
    rect(a, 4, 7, 7, 7, 0); rect(a, 4, 7, 7, 1, 2); rect(a, 5, 8, 5, 1, 3); rect(a, 4, 12, 7, 2, 1);
    rect(a, 11, 8, 2, 1, 0); rect(a, 12, 9, 1, 3, 0); rect(a, 11, 11, 2, 1, 0);
    px(a, 6, 4, 1); px(a, 7, 3, 1); px(a, 8, 5, 1); px(a, 9, 4, 1);
    return outline(a);
  },
  light_switch: () => {
    let a = mk(16, 16);
    rect(a, 5, 4, 6, 9, 0); rect(a, 7, 6, 2, 5, 2); rect(a, 7, 6, 2, 2, 1);
    return outline(a);
  },
  intercom: () => {
    let a = mk(16, 16);
    rect(a, 4, 3, 8, 10, 2); rect(a, 5, 4, 6, 5, 1);
    for (let y = 5; y < 9; y += 2) rect(a, 6, y, 4, 1, 3);
    rect(a, 6, 10, 4, 2, 0); px(a, 7, 10, 1);
    return outline(a);
  },
  staff_uniform: f => {
    const a = CHAR_FRAMES[f].map(r => r.slice());
    if (f < 3) { a[11][5] = 4; a[11][6] = 4; } // name tag on the front-facing frames
    return a;
  },
  floor_lino: () => fillFn(mk(16, 16), (x, y) => (x === 0 || y === 0 ? 2 : ((x >> 3) + (y >> 3)) % 2 ? 4 : 0)),
  lockers: () => {
    const a = mk(16, 32);
    rect(a, 1, 2, 14, 30, 1); rect(a, 1, 2, 1, 30, 0); rect(a, 14, 2, 1, 30, 2);
    for (let y = 5; y < 11; y += 2) rect(a, 4, y, 8, 1, 2);
    rect(a, 11, 16, 2, 5, 3); rect(a, 6, 13, 4, 2, 0);
    rect(a, 1, 29, 14, 3, 2);
    return outline(a);
  },
  corkboard: () => {
    const a = mk(32, 32);
    rect(a, 1, 3, 30, 24, 2); rect(a, 3, 5, 26, 20, 1);
    fillFn(a, (x, y, v) => (v === 1 && hash(x, y) % 7 === 0 ? 2 : undefined));
    rect(a, 5, 7, 8, 7, 0); rect(a, 6, 9, 6, 1, 2); rect(a, 6, 11, 4, 1, 2); px(a, 9, 7, 4);
    rect(a, 16, 8, 9, 6, 6); rect(a, 17, 10, 7, 1, 2); px(a, 20, 8, 5);
    rect(a, 9, 16, 10, 7, 0); rect(a, 10, 18, 8, 1, 2); rect(a, 10, 20, 6, 1, 2); px(a, 14, 16, 4);
    rect(a, 21, 16, 5, 5, 4);
    return outline(a);
  },
  pick_medal: () => {
    const a = mk(8, 12);
    rect(a, 0, 5, 4, 6, 4); rect(a, 4, 5, 4, 6, 4); rect(a, 1, 5, 2, 5, 0); rect(a, 5, 5, 2, 5, 0); rect(a, 2, 5, 1, 5, 1); rect(a, 5, 5, 1, 5, 1);
    px(a, 0, 11, 4); px(a, 3, 11, 4); px(a, 4, 11, 4); px(a, 7, 11, 4); px(a, 1, 10, 0); px(a, 6, 10, 0);
    circ(a, 3.5, 3.2, 3.4, 4); circ(a, 3.5, 3.2, 2.5, 2); circ(a, 3.5, 3.2, 1.2, 3); px(a, 2, 2, 5); px(a, 3, 1, 5);
    return a;
  },
  leaderboard: () => {
    const a = mk(32, 32);
    rect(a, 1, 3, 30, 24, 2); rect(a, 3, 5, 26, 20, 1);
    rect(a, 7, 7, 18, 1, 0); px(a, 26, 6, 4); px(a, 25, 7, 4); px(a, 27, 7, 4); px(a, 26, 8, 4);
    [16, 13, 11, 9].forEach((w, i) => { const y = 11 + i * 3; rect(a, 6, y, 2, 2, i === 0 ? 4 : 5); rect(a, 10, y, w, 1, 0); });
    rect(a, 8, 27, 16, 2, 2);
    return outline(a);
  },
  time_clock: () => {
    const a = mk(16, 16);
    rect(a, 3, 2, 10, 12, 1); rect(a, 4, 3, 8, 5, 0); px(a, 8, 4, 3); px(a, 8, 5, 3); px(a, 9, 5, 3);
    rect(a, 5, 10, 6, 2, 3); rect(a, 6, 9, 4, 1, 2);
    return outline(a);
  },
  eotm_frame: () => fillFn(mk(32, 32), (x, y) => {
    if (y <= 27) {
      const d = Math.min(x, y, 31 - x, 27 - y);
      if (d === 0) return 3; if (d === 1) return 1; if (d === 2) return (x + y) % 3 ? 0 : 2; if (d === 3) return 2;
      if (x >= 7 && x <= 24 && y >= 4 && y <= 22) return y < 14 ? 4 : 5; // backdrop; the staff portrait is drawn on it
      return 0;
    }
    if (y >= 28 && y <= 31 && x >= 6 && x <= 25) return y === 28 || y === 31 || x === 6 || x === 25 ? 3 : 1;
  }),
  break_table: () => {
    const a = mk(32, 16);
    rect(a, 2, 4, 28, 5, 1); rect(a, 2, 4, 28, 1, 0); rect(a, 4, 9, 2, 6, 2); rect(a, 26, 9, 2, 6, 2);
    rect(a, 8, 2, 4, 3, 0); rect(a, 19, 3, 5, 2, 4);
    return outline(a);
  },
  coffee_counter: () => {
    const a = mk(32, 16);
    rect(a, 0, 5, 32, 11, 2); rect(a, 0, 5, 32, 2, 1); rect(a, 0, 5, 32, 1, 0);
    rect(a, 3, 0, 8, 5, 3); rect(a, 4, 1, 6, 2, 1); rect(a, 6, 3, 2, 2, 0);
    for (let x = 4; x < 30; x += 8) rect(a, x, 9, 6, 6, 4);
    return outline(a);
  },
  shadow_figure: () => {
    const a = rows([...HEAD_DOWN, ...BODY_FRONT, "....33333333....", ".....33..33....."]).map(r => r.map(v => (v < 0 ? -1 : 2)));
    px(a, 5, 6, 1); px(a, 10, 6, 1); // two pale eyes
    return a;
  },
  whiteboard: () => {
    const a = mk(32, 32);
    rect(a, 1, 1, 30, 20, 3); rect(a, 2, 2, 28, 18, 0);
    rect(a, 4, 4, 12, 1, 5); for (let y = 7; y < 18; y += 3) { px(a, 4, y, 2); rect(a, 6, y, 6 + (hash(y, 3) % 14), 1, 2); }
    rect(a, 22, 15, 6, 2, 4); // marker tray
    rect(a, 2, 20, 28, 2, 1);
    rect(a, 5, 22, 2, 8, 2); rect(a, 25, 22, 2, 8, 2); rect(a, 3, 29, 6, 2, 3); rect(a, 23, 29, 6, 2, 3);
    return outline(a);
  },
  // Phase 6: gift shop, café, evening
  floor_shop: () => fillFn(mk(16, 16), (x, y) => { const d = (x + y) % 16, e = (x - y + 16) % 16; return d === 0 || e === 0 ? 1 : hash(x, y) % 23 === 0 ? 4 : 0; }),
  shop_counter: () => {
    const a = mk(48, 16);
    rect(a, 0, 3, 48, 13, 2); rect(a, 0, 3, 48, 3, 1); rect(a, 0, 3, 48, 1, 0);
    for (let x = 4; x < 44; x += 10) rect(a, x, 8, 7, 6, 4);
    rect(a, 36, 0, 8, 4, 3); rect(a, 37, 1, 6, 2, 0); // the till
    return outline(a);
  },
  shop_shelves: () => {
    const a = mk(32, 32);
    rect(a, 1, 2, 30, 30, 2); rect(a, 3, 4, 26, 26, 5);
    for (const y of [11, 20, 29]) rect(a, 2, y, 28, 2, 2);
    [[5, 6, 4, 5, 5], [11, 7, 5, 4, 1], [19, 5, 3, 6, 0], [24, 7, 4, 4, 5], [6, 15, 6, 5, 1], [15, 14, 4, 6, 0], [22, 16, 5, 4, 5], [5, 24, 4, 5, 0], [12, 23, 7, 6, 1], [22, 25, 4, 4, 5]]
      .forEach(([x, y, w, h, c]) => rect(a, x, y, w, h, c));
    return outline(a);
  },
  // A plain pedestal; the featured item sits on top of it (drawn at 2,2 to 13,13).
  featured_stand: () => {
    const a = mk(16, 32);
    rect(a, 2, 14, 12, 3, 1); rect(a, 2, 14, 12, 1, 0); rect(a, 3, 17, 10, 12, 2); rect(a, 4, 17, 1, 12, 1); rect(a, 2, 29, 12, 3, 3);
    rect(a, 6, 22, 4, 2, 4);
    return outline(a);
  },
  cafe_counter: () => {
    const a = mk(48, 16);
    rect(a, 0, 4, 48, 12, 2); rect(a, 0, 4, 48, 3, 1); rect(a, 0, 4, 48, 1, 0);
    rect(a, 4, 0, 10, 5, 3); rect(a, 5, 1, 8, 2, 0); rect(a, 7, 3, 2, 2, 0); // espresso machine
    rect(a, 30, 1, 3, 4, 0); rect(a, 35, 2, 3, 3, 5); rect(a, 40, 1, 4, 4, 4); // cups and a cake stand
    for (let x = 3; x < 46; x += 6) rect(a, x, 9, 3, 5, 1);
    return outline(a);
  },
  cafe_menu: () => {
    const a = mk(32, 32);
    rect(a, 2, 3, 28, 24, 3); rect(a, 3, 4, 26, 22, 2);
    for (let y = 8; y < 24; y += 4) { rect(a, 6, y, 10 + (hash(y, 1) % 6), 1, 0); rect(a, 23, y, 3, 1, 1); }
    rect(a, 6, 5, 14, 1, 1);
    return outline(a);
  },
  cafe_table: () => {
    const a = mk(16, 16);
    circ(a, 7.5, 6, 6, 1); circ(a, 7.5, 6, 5, 0); rect(a, 7, 11, 2, 4, 2); rect(a, 5, 14, 6, 2, 2);
    rect(a, 7, 2, 2, 4, 4); px(a, 7, 1, 5); px(a, 8, 1, 5); // a tiny vase with a flower
    return outline(a);
  },
  cafe_stool: () => {
    const a = mk(16, 16);
    circ(a, 7.5, 8, 4.5, 5); circ(a, 7.5, 7.5, 3.5, 0); px(a, 6, 6, 5);
    rect(a, 4, 12, 2, 3, 2); rect(a, 10, 12, 2, 3, 2);
    return outline(a);
  },
  shutter: () => fillFn(mk(16, 16), (x, y) => (y % 3 === 2 ? 2 : y === 15 ? 3 : 1)),
  window_frame: () => fillFn(mk(32, 32), (x, y) => {
    if (y >= 27) return y <= 28 ? 0 : y === 29 ? 1 : undefined;      // sill
    const d = Math.min(x, y, 31 - x, 26 - y);
    if (d === 0) return 3; if (d <= 2) return d === 1 ? 1 : 2;
    if (x === 15 || x === 16 || y === 14) return 1;                  // mullions
    return undefined;                                                  // glass: the sky shows through
  }),
  sky_day: () => fillFn(mk(28, 24), (x, y) => {
    if ([[6, 6, 4], [10, 5, 3], [19, 12, 3], [22, 11, 4], [15, 18, 3]].some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 * 2.2 <= r * r)) return 0;
    return y < 8 ? 3 : y < 16 ? 2 : 1;
  }),
  sky_sunset: () => fillFn(mk(28, 24), (x, y) => {
    if ((x - 19) ** 2 + (y - 19) ** 2 <= 16 && y < 21) return 5;
    if (y >= 21) return 8;
    return y < 5 ? 8 : y < 10 ? 7 : y < 15 ? 6 : 5;
  }),
  sky_night: () => fillFn(mk(28, 24), (x, y) => {
    if ((x - 20) ** 2 + (y - 6) ** 2 <= 12 && !((x - 22) ** 2 + (y - 5) ** 2 <= 10)) return 11;
    if (hash(x, y) % 37 === 0) return 0;
    return y < 12 ? 9 : 10;
  }),
  cups: f => {
    const a = mk(8, 8), body = [2, 4, 5][f];
    rect(a, 1, 2, 5, 5, 1); rect(a, 2, 2, 3, 1, body); px(a, 6, 3, 1); px(a, 6, 4, 1);
    if (f === 2) rect(a, 1, 1, 5, 1, 6); // a cocoa cloud of cream
    return outline(a);
  },
  steam: f => { const a = mk(8, 8); [[3, 6 - f], [4, 5 - f], [3, 4 - f], [4, 3 - f]].forEach(([x, y]) => px(a, x, y, 7)); return a; },
  // Shop redesign: warm, cluttered, full of things worth redrawing
  floor_planks: () => fillFn(mk(16, 16), (x, y) => {
    const plank = y >> 3; if (y % 8 === 7) return 2;            // wide planks, soft seams
    if (x === (plank * 9 + 5) % 16) return 2;                     // staggered plank ends
    return hash(x >> 2, y + plank * 7) % 11 === 0 ? 4 : (x + plank * 3) % 7 === 0 ? 1 : 0;
  }),
  shop_wall_hi: () => fillFn(mk(16, 16), (x, y) => (y === 0 ? 3 : y === 3 ? 2 : y === 4 ? 4 : (x + y * 3) % 8 === 0 ? 4 : 1)),
  shop_wall_lo: () => fillFn(mk(16, 16), (x, y) => (y >= 10 ? (y === 10 ? 4 : y === 15 ? 3 : (x % 8 === 0 ? 3 : 2)) : (x + y * 3) % 8 === 0 ? 4 : 1)),
  item_rack: () => {
    const a = mk(32, 32);
    rect(a, 1, 1, 2, 30, 7); rect(a, 29, 1, 2, 30, 7);                 // posts
    rect(a, 1, 1, 30, 2, 7); rect(a, 4, 3, 1, 2, 7); rect(a, 27, 3, 1, 2, 7); // header with hooks
    rect(a, 3, 3, 26, 11, 1); rect(a, 3, 16, 26, 11, 1);                // backing
    rect(a, 2, 13, 28, 2, 7); rect(a, 2, 26, 28, 2, 7);                 // shelves (items stand on these)
    rect(a, 1, 29, 30, 3, 8);                                           // base
    rect(a, 12, 0, 8, 3, 3);                                            // price sign
    return outline(a, 8);
  },
  trinkets: f => {
    const a = mk(8, 8);
    [() => { circ(a, 3.5, 4, 3, 2); px(a, 3, 0, 4); px(a, 4, 1, 4); },                       // apple
     () => { rect(a, 1, 2, 6, 5, 5); rect(a, 2, 1, 4, 1, 5); px(a, 3, 4, 1); px(a, 4, 4, 1); }, // tiny robot
     () => { circ(a, 3.5, 3.5, 3, 3); circ(a, 3.5, 3.5, 1.5, 2); },                          // badge
     () => { rect(a, 2, 1, 4, 6, 6); rect(a, 3, 0, 2, 1, 6); rect(a, 2, 3, 4, 1, 1); },      // potion bottle
     () => { rect(a, 1, 3, 6, 4, 9); px(a, 1, 2, 9); px(a, 6, 2, 9); px(a, 2, 4, 8); px(a, 5, 4, 8); }, // cat plush
     () => { rect(a, 0, 2, 8, 5, 10); rect(a, 1, 3, 2, 1, 1); rect(a, 5, 3, 2, 1, 1); },      // little cassette
     () => { rect(a, 3, 0, 2, 7, 4); circ(a, 3.5, 2, 2.5, 4); px(a, 3, 7, 7); px(a, 4, 7, 7); }, // cactus
     () => { rect(a, 1, 1, 6, 6, 3); rect(a, 2, 2, 4, 4, 1); px(a, 3, 3, 2); px(a, 4, 4, 2); }, // dice
    ][f]();
    return outline(a, 8);
  },
  bunting: () => {
    const a = mk(16, 16);
    for (let x = 0; x < 16; x++) px(a, x, 1 + Math.round(Math.sin((x / 16) * Math.PI) * 1.5), 8);
    [[2, 2], [7, 4], [12, 3]].forEach(([x0, c], i) => { for (let j = 0; j < 4; j++) rect(a, x0 + j / 2 | 0, 3 + j, 4 - j, 1, c); });
    return a;
  },
  shop_posters: () => {
    const a = mk(32, 32);
    rect(a, 1, 4, 14, 18, 8); rect(a, 2, 5, 12, 16, 1); circ(a, 8, 11, 4, 2); rect(a, 4, 17, 8, 2, 7);
    rect(a, 17, 7, 14, 16, 8); rect(a, 18, 8, 12, 14, 10); rect(a, 20, 15, 8, 6, 4); circ(a, 26, 11, 2, 3);
    return outline(a, 8);
  },
  mug_shelf: () => {
    const a = mk(32, 32);
    for (const y of [12, 22]) { rect(a, 1, y, 30, 2, 7); rect(a, 3, y + 2, 2, 3, 7); rect(a, 27, y + 2, 2, 3, 7); }
    [[3, 2], [10, 5], [17, 4], [24, 6]].forEach(([x, c]) => { rect(a, x, 6, 5, 6, c); px(a, x + 5, 8, c); px(a, x + 5, 9, c); });
    [[5, 9], [13, 3], [21, 2]].forEach(([x, c]) => { rect(a, x, 16, 5, 6, c); px(a, x + 5, 18, c); px(a, x + 5, 19, c); });
    return outline(a, 8);
  },
  postcard_spinner: () => {
    const a = mk(16, 32);
    rect(a, 7, 6, 2, 22, 7); rect(a, 3, 28, 10, 3, 8);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) rect(a, 2 + c * 7, 2 + r * 8, 5, 6, [2, 4, 5, 6, 10, 3][r * 2 + c]);
    return outline(a, 8);
  },
  floor_lamp: () => {
    const a = mk(16, 32);
    fillFn(a, (x, y) => (y >= 2 && y <= 9 && Math.abs(x - 7.5) <= 2 + (y - 2) * 0.6 ? 3 : undefined));
    rect(a, 7, 10, 2, 18, 7); rect(a, 4, 28, 8, 3, 8);
    return outline(a, 8);
  },
  basket: () => {
    const a = mk(16, 16);
    [[4, 6, 4], [7, 4, 2], [10, 6, 9], [6, 5, 5]].forEach(([x, y, c]) => circ(a, x, y, 2.5, c));
    rect(a, 2, 8, 12, 7, 7); for (let x = 3; x < 14; x += 3) rect(a, x, 9, 1, 5, 3);
    return outline(a, 8);
  },
  // A small touch screen on its own pedestal: a room's extra pieces live on it.
  overflow_screen: () => {
    const a = mk(16, 32);
    rect(a, 5, 14, 6, 15, 4); rect(a, 6, 14, 1, 15, 5); rect(a, 3, 28, 10, 3, 5); rect(a, 3, 31, 10, 1, 6); // the pedestal and its foot
    rect(a, 2, 5, 12, 10, 0); rect(a, 3, 6, 10, 7, 1); rect(a, 4, 7, 8, 5, 2); rect(a, 4, 7, 3, 1, 3);     // the screen, tilted to you
    rect(a, 5, 9, 2, 2, 3); rect(a, 9, 9, 2, 2, 3); px(a, 7, 13, 7);                                         // little tiles of art, a power light
    return outline(a, 6);
  },
  // Plush carpet for a room's floor. Gray, so a room's floor color (Rooms, Layout) tints it any color.
  carpet_floor: () => fillFn(mk(16, 16), (x, y) => { const h = hash(x, y) % 9; return h === 0 ? 2 : h === 1 ? 3 : (x + y * 3) % 8 === 0 ? 2 : (x * 3 + y) % 11 === 0 ? 0 : 1; }),
  /* Murals: landscapes painted along the top row of a wall (256×16; a wall shorter than that shows the middle of it). */
  mural_dusk: () => { // a red sunset behind jagged peaks
    const a = fillFn(mk(256, 16), (x, y) => (y < 2 ? 0 : y < 5 ? 1 : y < 8 ? 2 : y < 11 ? 3 : 4));
    [[52, 9], [170, 8]].forEach(([cx, cy]) => circ(a, cx, cy, 3.5, 7));
    fillFn(a, (x, y) => (y > 6 + Math.abs(((x * 5) % 46) - 23) / 4.5 + 2 * Math.sin(x / 13) ? 6 : undefined));
    fillFn(a, (x, y) => (y > 12 + Math.round(1.5 * Math.sin(x / 9)) ? 5 : undefined));
    return a;
  },
  mural_canyon: () => { // red mesas, a clear sky, a road running off into the distance
    const a = fillFn(mk(256, 16), (x, y) => (y < 4 ? 0 : 1));
    [[30, 2], [118, 3], [200, 2]].forEach(([cx, cy]) => { circ(a, cx, cy, 2, 2); circ(a, cx + 3, cy, 2.5, 2); circ(a, cx + 6, cy + 1, 1.5, 2); });
    [[10, 40, 5], [70, 96, 6], [140, 182, 4], [214, 250, 6]].forEach(([x0, x1, top]) => { rect(a, x0, top, x1 - x0, 12 - top, 3); rect(a, x0, top, x1 - x0, 1, 4); rect(a, x0 + 3, top + 3, x1 - x0 - 6, 1, 4); });
    rect(a, 0, 11, 256, 5, 5); rect(a, 0, 13, 256, 2, 6); for (let x = 2; x < 256; x += 8) rect(a, x, 13, 4, 1, 7);
    return a;
  },
  mural_storm: () => { // a storm rolling over green plains, lightning far off
    const a = fillFn(mk(256, 16), (x, y) => (y < 3 ? 0 : y < 7 ? 1 : 2));
    for (let i = 0; i < 10; i++) { const cx = (i * 29 + 7) % 256; circ(a, cx, 2, 3.5, 1); circ(a, cx + 5, 3, 3, 0); }
    [[64, 0], [190, 1]].forEach(([x0]) => { let x = x0; for (let y = 2; y < 10; y++) { px(a, x, y, 3); x += y % 3 ? 1 : -1; } });
    fillFn(a, (x, y) => (y > 9 + Math.round(1.5 * Math.sin(x / 17)) ? 4 : undefined));
    fillFn(a, (x, y) => (y > 12 + Math.round(Math.sin(x / 7 + 1)) ? 5 : undefined));
    for (let x = 4; x < 256; x += 11) px(a, x, 11 + (x % 3), 6);
    return a;
  },
  mural_volcano: () => { // a volcano glowing under the stars
    const a = fillFn(mk(256, 16), (x, y) => (y < 6 ? 0 : 1));
    for (let i = 0; i < 26; i++) px(a, (i * 37 + 11) % 256, (i * 7) % 7, 2);
    [[90, 4], [210, 6]].forEach(([cx, top]) => {
      fillFn(a, (x, y) => (y >= top && Math.abs(x - cx) <= (y - top) * 2.4 + 2 ? 3 : undefined));
      rect(a, cx - 2, top, 5, 1, 7); for (let y = top + 1; y < 13; y++) px(a, cx + Math.round(Math.sin(y) * 2), y, y < top + 4 ? 5 : 4);
    });
    fillFn(a, (x, y) => (y > 12 + Math.round(Math.sin(x / 11)) ? 6 : undefined));
    return a;
  },
  mural_isles: () => { // floating islands over a misty sea, a waterfall falling off one
    const a = fillFn(mk(256, 16), (x, y) => (y < 9 ? 0 : y < 12 ? 1 : 5));
    for (let x = 0; x < 256; x += 5) px(a, x + (x % 3), 13 + (x % 2), 6);
    [[34, 4, 14], [100, 6, 10], [168, 3, 16], [228, 5, 9]].forEach(([cx, top, r]) => {
      rect(a, cx - r, top, r * 2, 2, 2); rect(a, cx - r + 1, top, r * 2 - 2, 1, 3);
      for (let k = 0; k < r; k++) rect(a, cx - r + k, top + 2 + (k >> 1), (r - k) * 2, 1, 4);
      circ(a, cx - r / 2, top - 1, 1.5, 3); circ(a, cx + r / 3, top - 1, 2, 3);
    });
    for (let y = 6; y < 16; y++) px(a, 170, y, y % 2 ? 6 : 1); circ(a, 60, 2, 1.5, 7);
    return a;
  },
  mural_castle: () => { // a castle on a hill, banners flying, fields below
    const a = fillFn(mk(256, 16), (x, y) => (y < 5 ? 1 : 0));
    fillFn(a, (x, y) => (y > 8 + Math.round(2 * Math.sin(x / 23)) ? 2 : undefined));
    fillFn(a, (x, y) => (y > 12 + Math.round(Math.sin(x / 9)) ? 3 : undefined));
    [[70, 2], [190, 3]].forEach(([cx, top]) => {
      rect(a, cx - 10, top + 3, 20, 7, 4); rect(a, cx - 12, top, 4, 10, 5); rect(a, cx + 8, top, 4, 10, 5); rect(a, cx - 2, top - 1, 4, 11, 5);
      for (let i = -10; i < 10; i += 3) px(a, cx + i, top + 2, 4); rect(a, cx - 1, top + 6, 2, 4, 5);
      px(a, cx, top - 3, 6); px(a, cx + 1, top - 3, 6); px(a, cx, top - 2, 5);
    });
    for (let x = 6; x < 256; x += 13) px(a, x, 14, 7);
    return a;
  },
  mural_forest: () => { // a moonlit forest with a village's lights between the trees
    const a = fillFn(mk(256, 16), (x, y) => (y < 6 ? 0 : 1));
    circ(a, 210, 3, 2.5, 2); for (let i = 0; i < 18; i++) px(a, (i * 41 + 5) % 256, (i * 5) % 6, 7);
    for (let i = 0; i < 40; i++) { const cx = (i * 13 + (i % 3) * 4) % 256, h = 6 + (i * 7) % 5; for (let k = 0; k < h; k++) rect(a, cx - (k >> 1), 15 - h + k, (k >> 1) * 2 + 1, 1, i % 2 ? 3 : 4); }
    [[40, 12], [44, 12], [120, 13], [150, 12], [156, 13]].forEach(([x, y]) => { rect(a, x - 1, y, 3, 2, 6); px(a, x, y, 5); });
    return a;
  },
  // Hallway carpet runner, one tile at a time: 3 frames (start, middle, end). Across: start is the left end. Down: start is the top.
  carpet_h: f => fillFn(mk(16, 16), (x, y) => {
    if (y < 3 || y > 12) return undefined;
    if (f === 0 && x < 3) return x === 1 && y % 2 === 0 && y > 3 && y < 12 ? 0 : x === 2 ? 3 : undefined; // tassels, then the edge
    if (f === 2 && x > 12) return x === 14 && y % 2 === 0 && y > 3 && y < 12 ? 0 : x === 13 ? 3 : undefined;
    if (y === 3 || y === 12) return 3;
    if (y === 4 || y === 11 || (f === 0 && x === 3) || (f === 2 && x === 12)) return 0;
    if (y === 5 || y === 10) return 1;
    const dx = (x + 4) % 8 - 3.5, dy = y - 7.5; // a little diamond every half tile
    return Math.abs(dx) + Math.abs(dy) < 2.5 ? (Math.abs(dx) + Math.abs(dy) < 1.2 ? 4 : 2) : 1;
  }),
  carpet_v: f => { const a = GEN.carpet_h(f); return a[0].map((_, x) => a.map(row => row[x])); },
  // A little brass wall light with a warm shade, hung on the upper wall row.
  wall_sconce: () => {
    const a = mk(16, 16);
    rect(a, 7, 9, 2, 5, 2); rect(a, 5, 13, 6, 2, 2);                 // stem and wall plate
    for (let y = 2; y < 9; y++) rect(a, 8 - Math.floor((y + 1) / 2), y, Math.floor((y + 1) / 2) * 2, 1, y < 4 ? 0 : 1); // the shade, lit from inside
    return outline(a, 3);
  },
  rug: () => fillFn(mk(48, 32), (x, y) => {
    const d = Math.min(x, y, 47 - x, 31 - y);
    if (d === 0) return (x + y) % 2 ? 4 : 2;
    if (d === 1 || d === 4) return 1;
    if (d < 4) return 0;
    return ((x >> 2) + (y >> 2)) % 2 ? 1 : (Math.abs(x - 24) + Math.abs(y - 16)) % 6 < 2 ? 3 : 2;
  }),
  planter: () => {
    const a = mk(16, 16);
    [[4, 5, 3], [8, 3, 3.5], [12, 5, 3], [6, 7, 2.5], [10, 7, 2.5]].forEach(([x, y, r]) => circ(a, x, y, r, 4));
    fillFn(a, (x, y, v) => (v === 4 && hash(x, y) % 4 === 0 ? 7 : undefined));
    rect(a, 1, 9, 14, 6, 7); rect(a, 1, 9, 14, 1, 3);
    return outline(a, 8);
  },
  // The screening nook's big screen: six tiles wide and three tall (the wall rows and the cap above), between red curtains.
  // The picture is 80×45 at (8, 2); the episode playing this hour shows there when it can, the flicker when it can't.
  theater_screen: f => {
    const a = mk(96, 48);
    rect(a, 0, 0, 96, 48, 6);
    for (const x0 of [0, 88]) for (let x = x0; x < x0 + 8; x++) rect(a, x, 0, 1, 48, (x - x0) % 3 === 2 ? 8 : 9); // the curtains
    rect(a, 0, 0, 96, 2, 8); rect(a, 0, 1, 96, 1, 7);                                                              // the valance
    rect(a, 8, 2, 80, 45, 1);
    fillFn(a, (x, y, v) => (v === 1 && y >= 3 && y <= 45 && x >= 9 && x <= 86 ? ((x * 7 + y * 3 + f * 5) % 23 === 0 ? 3 : (y + f) % 6 === 0 ? 2 : 1) : undefined));
    rect(a, 40, 18, 16, 10, 2); for (let k = 0; k < 5; k++) rect(a, 46, 20 + k, k < 3 ? k + 1 : 5 - k, 1, 3); // a play symbol
    rect(a, 8, 47, 80, 1, 5);
    return a;
  },
  // The screening nook's doorway from the café hall: one big dark doorway, two tiles wide, in a square gold frame.
  theater_door: () => fillFn(mk(32, 32), (x, y) => {
    if (x < 1 || x > 30 || y < 1) return undefined;
    const band = Math.min(x - 1, 30 - x, y - 1);                                 // how far into the frame
    if (band < 4 && !(x >= 5 && x <= 26 && y >= 5)) return band === 0 ? 5 : band === 3 ? 7 : 6;
    const edge = Math.min(x - 5, 26 - x, y - 5);
    if (y >= 20 && Math.abs(x - 15.5) < (y - 17) * 0.55) return 4;               // a red carpet running into the dark
    return edge < 1 ? 3 : edge < 3 ? 2 : y > 26 ? 2 : 1;
  }),
  // Marquee bulbs around the frame: 2 frames, every other bulb lit, so they chase. Drawn over the dark, so they glow.
  marquee_lights: f => {
    const a = mk(32, 32), pts = [];
    for (const y of [26, 20, 14, 8]) pts.push([2, y]);
    for (const x of [2, 7, 12, 18, 23, 28]) pts.push([x, 2]);
    for (const y of [8, 14, 20, 26]) pts.push([28, y]);
    pts.forEach(([bx, by], i) => { const on = (i + f) % 2 === 0; rect(a, bx, by, 2, 2, on ? 2 : 1); if (on) px(a, bx, by, 3); });
    return a;
  },
  // The black LED board for NOW PLAYING: four tiles wide, one line tall. The red letters are drawn on it as they scroll.
  led_sign: () => {
    const a = mk(64, 12);
    rect(a, 0, 0, 64, 12, 3); rect(a, 1, 1, 62, 10, 2); rect(a, 2, 2, 60, 8, 1);
    fillFn(a, (x, y, v) => (v === 1 && x >= 3 && x <= 60 && y >= 3 && y <= 8 && (x + y) % 2 === 0 ? 4 : undefined)); // the unlit LEDs
    return a;
  },
  // The café's arcade cabinet: a lit marquee, a little attract screen (2 frames), a joystick and two buttons.
  arcade_cabinet: f => {
    const a = mk(16, 32);
    rect(a, 2, 1, 12, 30, 2); rect(a, 2, 1, 1, 30, 3); rect(a, 13, 1, 1, 30, 1);
    rect(a, 3, 2, 10, 4, 6); rect(a, 4, 3, 2, 2, 7); rect(a, 7, 3, 2, 2, 8); rect(a, 10, 3, 2, 2, 7); // the marquee
    rect(a, 3, 7, 10, 10, 4);
    fillFn(a, (x, y) => (x >= 4 && x <= 11 && y >= 8 && y <= 15 ? ((x + y * 3 + f * 2) % 7 === 0 ? 5 : y === 12 - f && x > 5 && x < 10 ? 6 : (x * 5 + y + f) % 11 === 0 ? 7 : 4) : undefined));
    rect(a, 1, 17, 14, 4, 3); rect(a, 1, 20, 14, 1, 1); // the control panel
    rect(a, 4, 16, 2, 2, 7); px(a, 4, 18, 4); px(a, 5, 18, 4); px(a, 9, 18, 7); px(a, 11, 18, 8);
    rect(a, 6, 23, 4, 4, 1); px(a, 7, 24, 6); px(a, 8, 24, 6); px(a, 7, 25, 7); px(a, 8, 25, 7); // the coin door
    rect(a, 2, 30, 12, 1, 1);
    return outline(a);
  },
  // A movie poster on the theater hallway's side wall, seen edge on in the dark: a thin frame, two tiles tall (left wall; mirrored on the right).
  hall_poster: () => {
    const a = mk(16, 32);
    rect(a, 11, 2, 5, 28, 1); rect(a, 12, 3, 4, 26, 2); rect(a, 13, 5, 2, 9, 3); rect(a, 13, 16, 2, 6, 4); px(a, 13, 25, 3);
    return a;
  },
  // A little light on the hallway floor, by the wall: lit even in the dark (left side; mirrored on the right).
  aisle_light: () => { const a = mk(4, 3); rect(a, 0, 0, 4, 3, 1); rect(a, 1, 0, 2, 2, 2); px(a, 1, 0, 3); return a; },
  // A long planter box, two tiles wide: a leafy row with a few flowers.
  planter_wide: () => {
    const a = mk(32, 16);
    [[4, 5, 3], [9, 3, 3.5], [14, 5, 3], [19, 3, 3.5], [24, 5, 3], [28, 4, 3], [7, 7, 2.5], [12, 7, 2.5], [17, 7, 2.5], [22, 7, 2.5], [26, 7, 2.5]].forEach(([x, y, r]) => circ(a, x, y, r, 4));
    fillFn(a, (x, y, v) => (v === 4 && hash(x, y) % 4 === 0 ? 7 : undefined));
    [[6, 3, 2], [16, 2, 9], [25, 3, 3], [11, 5, 9], [21, 5, 2]].forEach(([x, y, c]) => { px(a, x, y, c); px(a, x + 1, y, c); px(a, x, y + 1, c); px(a, x + 1, y + 1, c); }); // flowers
    rect(a, 1, 9, 30, 6, 7); rect(a, 1, 9, 30, 1, 3); rect(a, 15, 10, 2, 5, 8);
    return outline(a, 8);
  },
  cat_bed: () => {
    const a = mk(16, 16);
    fillFn(a, (x, y) => ((x - 7.5) ** 2 / 49 + (y - 10) ** 2 / 20 <= 1 ? 1 : undefined));
    fillFn(a, (x, y) => ((x - 7.5) ** 2 / 30 + (y - 10) ** 2 / 9 <= 1 ? 2 : undefined));
    return outline(a, 4);
  },
  cat: f => {
    const a = mk(16, 16);
    if (f < 2) { // curled up asleep, breathing
      fillFn(a, (x, y) => ((x - 8) ** 2 / (25 + f * 2) + (y - 10.5 + f * 0.3) ** 2 / (12 + f) <= 1 ? 1 : undefined));
      rect(a, 2, 8, 4, 3, 1); px(a, 2, 7, 1); px(a, 5, 7, 1);           // head tucked in, ears
      for (let x = 7; x < 13; x += 2) px(a, x, 9, 2);                   // stripes
      rect(a, 9, 12, 5, 1, 2); px(a, 3, 9, 3); px(a, 4, 10, 5);          // tail, closed eye, nose
    } else {     // awake for a pet
      fillFn(a, (x, y) => ((x - 9) ** 2 / 20 + (y - 11) ** 2 / 10 <= 1 ? 1 : undefined));
      circ(a, 4.5, 7, 3, 1); px(a, 2, 3, 1); px(a, 2, 4, 1); px(a, 6, 3, 1); px(a, 6, 4, 1);
      px(a, 3, 7, 3); px(a, 6, 7, 3); px(a, 4, 8, 5); rect(a, 13, 6, 1, 5, 1); px(a, 12, 6, 1);
      for (let x = 8; x < 13; x += 2) px(a, x, 9, 2);
    }
    return outline(a, 3);
  },
  heart: () => { const a = mk(8, 8); rows(["........", ".11.11..", "1111111.", "1111111.", ".11111..", "..111...", "...1....", "........"]).forEach((r, y) => r.forEach((v, x) => { if (v > 0) a[y][x] = 5; })); return outline(a, 3); },
  collection_cabinet: () => {
    const a = mk(48, 32);
    rect(a, 0, 0, 48, 32, 2); rect(a, 2, 2, 44, 26, 7);                    // wood frame, glass
    for (const y of [10, 19]) rect(a, 2, y, 44, 1, 1);                    // shelves
    rect(a, 23, 2, 1, 26, 1);                                             // door split
    px(a, 21, 14, 4); px(a, 26, 14, 4);                                   // handles
    rect(a, 0, 28, 48, 4, 3); rect(a, 16, 29, 16, 2, 4);                  // base and name plate
    px(a, 4, 4, 0); px(a, 5, 5, 0); px(a, 27, 4, 0); px(a, 28, 5, 0);     // glass glints
    return outline(a);
  },
  // An episode's display case: glass on a pedestal. The game's art shows through the glass (2,3 to 13,13).
  display_case: () => {
    const a = mk(16, 32);
    fillFn(a, (x, y) => {
      if (y >= 1 && y <= 15 && x >= 1 && x <= 14) {
        if (x === 1 || x === 14 || y === 1 || y === 15) return 3;           // frame
        if ((x - y + 20) % 9 === 0 && y < 9) return 0;                       // glint
        return y === 2 ? 4 : undefined;                                      // see-through glass
      }
      if (y >= 16 && y <= 30 && x >= 2 && x <= 13) return x === 2 || x === 13 || y === 30 ? 3 : y === 16 ? 0 : y === 23 ? 2 : 1; // pedestal
    });
    rect(a, 5, 19, 6, 2, 4); // little placard on the front
    return a;
  },
  closeup_case: () => fillFn(mk(24, 24), (x, y) => { const d = Math.min(x, y, 23 - x, 23 - y); return d === 0 ? 3 : d <= 1 ? 2 : d <= 3 ? 4 : d <= 5 ? 0 : d === 6 ? 2 : 3; }),
  cup_empty: () => { const a = mk(8, 8); rect(a, 1, 2, 5, 5, 1); rect(a, 2, 2, 3, 1, 3); px(a, 6, 3, 1); px(a, 6, 4, 1); return outline(a); },
  bus_tub: () => {
    const a = mk(16, 16);
    rect(a, 1, 8, 14, 7, 2); rect(a, 1, 8, 14, 1, 1);
    [[3, 4], [7, 3], [11, 5]].forEach(([x, y]) => { rect(a, x, y, 3, 5, 1); px(a, x + 3, y + 1, 1); }); // cups waiting to be washed
    return outline(a);
  },
  trash_can: () => {
    const a = mk(16, 16);
    rect(a, 3, 4, 10, 11, 2); rect(a, 2, 3, 12, 2, 1); for (let x = 5; x < 12; x += 3) rect(a, x, 6, 1, 7, 1);
    return outline(a);
  },
  fingerprints: f => {
    const a = mk(16, 16), spots = [[4, 6], [10, 9], [6, 11], [11, 4], [3, 9], [8, 6]].slice(0, 2 + f * 2);
    spots.forEach(([x, y]) => { circ(a, x, y, 1.6, 0); px(a, x, y, -1); });
    return a;
  },
  // A visitor's reaction when you photograph them: ! heart peace star dots wave shy annoyed.
  emote: f => {
    const a = rows(["........", ".000000.", "00000000", "00000000", "00000000", ".000000.", "...00...", "....0..."]);
    const G = [
      [[4, 1, 2], [4, 2, 2], [4, 3, 2], [4, 5, 2]],
      [[2, 1, 1], [3, 1, 1], [5, 1, 1], [6, 1, 1], [2, 2, 1], [3, 2, 1], [4, 2, 1], [5, 2, 1], [6, 2, 1], [3, 3, 1], [4, 3, 1], [5, 3, 1], [4, 4, 1]],
      [[3, 1, 2], [5, 1, 2], [3, 2, 2], [5, 2, 2], [3, 3, 2], [4, 3, 2], [5, 3, 2], [3, 4, 2], [4, 4, 2], [5, 4, 2]],
      [[4, 1, 3], [3, 2, 3], [4, 2, 3], [5, 2, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3], [5, 3, 3], [6, 3, 3], [3, 4, 3], [5, 4, 3], [2, 5, 3], [6, 5, 3]],
      [[2, 3, 4], [4, 3, 4], [6, 3, 4]],
      [[2, 1, 3], [4, 1, 3], [6, 1, 3], [2, 2, 3], [3, 2, 3], [4, 2, 3], [5, 2, 3], [6, 2, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3], [5, 3, 3], [6, 3, 3], [3, 4, 3], [4, 4, 3], [5, 4, 3]],
      [[2, 2, 2], [6, 2, 2], [1, 4, 5], [2, 4, 5], [6, 4, 5], [7, 4, 5], [3, 3, 5], [5, 3, 5]],
      [[3, 1, 1], [5, 1, 1], [2, 2, 1], [3, 2, 1], [4, 2, 1], [5, 2, 1], [6, 2, 1], [3, 3, 1], [5, 3, 1], [2, 4, 1], [3, 4, 1], [4, 4, 1], [5, 4, 1], [6, 4, 1], [3, 5, 1], [5, 5, 1]],
    ][f] || [];
    G.forEach(([x, y, c]) => px(a, x, y, c));
    return outline(a, 2);
  },
  bubble: f => {
    const a = rows(["........", ".000000.", "00000000", "00000000", "00000000", ".000000.", "...00...", "....0..."]);
    (f === 0 ? [[3, 1], [4, 1], [5, 2], [4, 3], [4, 5]] : [[4, 1], [4, 2], [4, 3], [4, 5]]).forEach(([x, y]) => px(a, x, y, 3));
    return outline(a, 3);
  },
  stairs_up: () => fillFn(mk(32, 32), (x, y) => (x < 2 || x > 29 ? 3 : y % 6 === 0 ? 2 : y % 6 === 1 ? 0 : 1)),
  stairs_down: () => fillFn(mk(32, 32), (x, y) => (x < 2 || x > 29 ? 3 : y % 6 === 5 ? 3 : y % 6 === 4 ? 2 : (y < 12 ? 1 : 2))),
  storage_shelves: () => {
    const a = mk(32, 32);
    rect(a, 1, 1, 2, 30, 2); rect(a, 29, 1, 2, 30, 2);
    for (const y of [9, 19, 29]) rect(a, 1, y, 30, 2, 2);
    [[4, 3, 8, 6], [13, 4, 7, 5], [21, 2, 7, 7], [4, 13, 10, 6], [16, 14, 6, 5], [23, 12, 5, 7], [5, 23, 6, 6], [13, 22, 9, 7]].forEach(([x, y, w, h]) => { rect(a, x, y, w, h, 1); rect(a, x, y + 1, w, 1, 4); });
    return outline(a);
  },
  box_stack: () => {
    const a = mk(16, 32);
    rect(a, 2, 18, 12, 13, 1); rect(a, 3, 8, 10, 10, 1); rect(a, 4, 1, 8, 7, 1);
    [[2, 18, 12], [3, 8, 10], [4, 1, 8]].forEach(([x, y, w]) => { rect(a, x, y, w, 1, 2); rect(a, x + (w >> 1), y, 1, 3, 4); });
    return outline(a);
  },
  workbench: () => {
    const a = mk(48, 16);
    rect(a, 0, 4, 48, 3, 1); rect(a, 2, 7, 3, 8, 2); rect(a, 43, 7, 3, 8, 2); rect(a, 2, 11, 44, 1, 2);
    rect(a, 8, 0, 14, 4, 4); rect(a, 14, 0, 2, 4, 2); rect(a, 30, 1, 6, 3, 3); px(a, 40, 2, 0); px(a, 41, 1, 0);
    return outline(a);
  },
  // Pokémon-style stairs: one tile you step onto.
  stair_up: () => fillFn(mk(16, 16), (x, y) => (x === 0 || x === 15 ? 3 : y % 4 === 3 ? 2 : y < 4 ? 0 : y < 8 ? 4 : 1)),
  stair_down: () => fillFn(mk(16, 16), (x, y) => (x === 0 || x === 15 ? 3 : y % 4 === 0 ? 2 : y > 11 ? 3 : y > 7 ? 2 : 1)),
  railing: () => { const a = mk(16, 16); rect(a, 0, 5, 16, 2, 1); rect(a, 0, 7, 16, 1, 2); [1, 8, 14].forEach(x => rect(a, x, 7, 1, 7, 2)); rect(a, 0, 13, 16, 1, 2); return outline(a); },
  // A museum shop bag: deep red, rope handle, the gold question mark from the shop's pin.
  shop_bag: () => { const a = mk(8, 8); rect(a, 1, 3, 6, 5, 1); rect(a, 1, 7, 6, 1, 2); px(a, 2, 1, 3); px(a, 2, 2, 3); px(a, 5, 1, 3); px(a, 5, 2, 3); px(a, 3, 0, 3); px(a, 4, 0, 3);
    px(a, 3, 4, 4); px(a, 4, 4, 4); px(a, 4, 5, 4); px(a, 3, 6, 4); return outline(a); },
  phone: () => { const a = mk(8, 8); rect(a, 2, 0, 4, 7, 3); rect(a, 3, 1, 2, 4, 0); px(a, 3, 5, 1); return a; },
  someones_pc: () => {
    const a = mk(16, 16);
    rect(a, 1, 9, 14, 7, 2); rect(a, 1, 9, 14, 1, 1);                 // desk
    rect(a, 3, 1, 10, 8, 1); rect(a, 4, 2, 8, 5, 3); rect(a, 5, 3, 6, 3, 4); rect(a, 5, 3, 2, 1, 5); // monitor and screen
    rect(a, 6, 7, 4, 2, 2); rect(a, 4, 11, 8, 2, 1); px(a, 13, 12, 4); // stand, keyboard, power light
    return outline(a, 3);
  },
  // A shop shelving unit: two shelves, three stacks of goods on each (the goods are drawn on top).
  shelf_unit: () => {
    const a = mk(48, 32);
    rect(a, 0, 0, 48, 32, 3); rect(a, 1, 1, 46, 3, 0); rect(a, 1, 4, 46, 11, 4); rect(a, 1, 18, 46, 11, 4);
    rect(a, 1, 13, 46, 2, 1); rect(a, 1, 15, 46, 3, 2); rect(a, 1, 27, 46, 2, 1); rect(a, 1, 29, 46, 2, 2);
    rect(a, 2, 5, 1, 9, 1); rect(a, 45, 5, 1, 9, 1);
    return a;
  },
  magazine_rack: () => {
    const a = mk(16, 32);
    rect(a, 2, 4, 12, 26, 2); rect(a, 2, 30, 12, 2, 3);
    [[3, 5, 5], [8, 6, 6], [3, 13, 7], [8, 12, 1], [3, 21, 6], [8, 20, 5]].forEach(([x, y, c]) => { rect(a, x, y, 5, 7, c); rect(a, x + 1, y + 1, 3, 1, 0); });
    for (const y of [11, 19, 27]) rect(a, 2, y, 12, 1, 3);
    return outline(a);
  },
  segway: () => { const a = mk(16, 16); rect(a, 7, 2, 2, 10, 3); rect(a, 5, 1, 6, 2, 3); rect(a, 2, 12, 12, 2, 2); circ(a, 3.5, 13.5, 2, 3); circ(a, 12.5, 13.5, 2, 3); px(a, 3, 13, 0); px(a, 12, 13, 0); return a; },
  fridge: () => {
    const a = mk(16, 32);
    rect(a, 1, 1, 14, 30, 0); rect(a, 1, 11, 14, 1, 2); rect(a, 12, 4, 1, 5, 2); rect(a, 12, 14, 1, 8, 2);
    rect(a, 3, 15, 4, 4, 4); rect(a, 4, 3, 3, 3, 5); px(a, 8, 17, 6); // a drawing and a magnet
    rect(a, 2, 29, 12, 2, 2);
    return outline(a, 3);
  },
  microwave_counter: f => {
    const a = mk(32, 16);
    rect(a, 0, 6, 32, 10, 2); rect(a, 0, 6, 32, 2, 1); rect(a, 0, 6, 32, 1, 0);
    rect(a, 2, 0, 17, 7, 1); rect(a, 3, 1, 11, 5, f ? 6 : 3); rect(a, 15, 1, 3, 5, 2); px(a, 16, 2, 4); px(a, 16, 4, 0);
    if (f) { px(a, 4, 2, 4); px(a, 7, 3, 5); px(a, 10, 2, 4); px(a, 12, 4, 5); px(a, 5, 5, 5); } // the aftermath
    rect(a, 23, 2, 6, 5, 4); rect(a, 24, 1, 4, 1, 4); // a lunchbox waiting its turn
    for (let x = 4; x < 30; x += 8) rect(a, x, 10, 5, 5, 1);
    return outline(a, 3);
  },
  patron_board: () => {
    const a = mk(32, 32);
    rect(a, 1, 1, 30, 22, 3); rect(a, 2, 2, 28, 20, 2); rect(a, 4, 3, 24, 3, 4);
    for (let y = 8; y < 21; y += 4) for (let x = 4; x < 28; x += 8) rect(a, x, y, 6, 2, 1); // name plates
    rect(a, 6, 23, 3, 7, 2); rect(a, 23, 23, 3, 7, 2); rect(a, 3, 29, 26, 2, 3);
    return outline(a);
  },
  doormat: () => fillFn(mk(16, 16), (x, y) => (x >= 2 && x <= 13 && y >= 3 && y <= 12 ? (x === 2 || x === 13 || y === 3 || y === 12 ? 2 : (x + y) % 4 === 0 ? 4 : 1) : undefined)),
  textbox: () => fillFn(mk(24, 24), (x, y) => {
    const d = Math.min(x, y, 23 - x, 23 - y);
    if (Math.min(x, 23 - x) + Math.min(y, 23 - y) < 2) return -1;
    return d <= 1 ? 3 : d === 2 ? 0 : d === 3 ? 2 : 0;
  }),
  closeup_gold: () => fillFn(mk(24, 24), (x, y) => { const d = Math.min(x, y, 23 - x, 23 - y); return d === 0 ? 3 : d <= 2 ? 1 : d <= 4 ? ((x + y) % 4 < 2 ? 0 : 2) : d <= 6 ? 1 : 3; }),
  closeup_wood: () => fillFn(mk(24, 24), (x, y) => { const d = Math.min(x, y, 23 - x, 23 - y); return d === 0 ? 3 : d <= 5 ? (hash(x, y) % 5 === 0 ? 2 : 1) : d === 6 ? 2 : 3; }),
};

/* ---------- Art slots ----------
   Every slot can be replaced by an image in a museum pack, at exactly w x h per frame.
   Animated slots: frames side by side. Characters ("char"): 3 columns (standing, step, step) by 4 rows (down, up, left, right). */
const CHAR_NOTE = "48×64 sheet of 16×16 frames: 3 columns (standing, left step, right step) by 4 rows (facing down, up, left, right).";
const OVER_NOTE = "Drawn on top of the wall, so leave everything outside the door transparent.";
const SLOTS = [
  { key: "player", label: "Player", group: "Characters", w: 16, h: 16, layout: "char", pal: "player", gen: GEN.character, note: CHAR_NOTE },
  { key: "visitor_a", label: "Visitor A", group: "Characters", w: 16, h: 16, layout: "char", pal: "visitorA", gen: GEN.character, note: CHAR_NOTE },
  { key: "visitor_b", label: "Visitor B", group: "Characters", w: 16, h: 16, layout: "char", pal: "visitorB", gen: GEN.character, note: CHAR_NOTE },
  { key: "visitor_shirt", label: "Visitor shirt (placeholder)", group: "Characters", w: 16, h: 16, layout: "char", pal: "shirt", gen: GEN.character, note: "Drawn over Visitors A, B and C in each visitor's shirt color (Visitors tab, Shirt colors). Only the shirt; gray, so it tints. Skipped for a visitor sheet you've replaced with your own art. " + CHAR_NOTE },
  { key: "visitor_c", label: "Visitor C", group: "Characters", w: 16, h: 16, layout: "char", pal: "visitorC", gen: GEN.character, note: CHAR_NOTE },

  { key: "lobby_floor", label: "Lobby floor", group: "Lobby", w: 16, h: 16, pal: "lobby", gen: GEN.floor_marble, note: "Tiles seamlessly in every direction." },
  { key: "lobby_runner", label: "Lobby runner", group: "Lobby", w: 16, h: 16, pal: "rug", gen: GEN.runner, note: "One tile wide, from the entrance to the gallery doorway." },
  { key: "lobby_wall_top", label: "Lobby wall top", group: "Lobby", w: 16, h: 16, pal: "lobby", gen: GEN.wall_top },
  { key: "lobby_wall_upper", label: "Lobby wall, upper row", group: "Lobby", w: 16, h: 16, pal: "lobby", gen: GEN.wall_upper },
  { key: "lobby_wall_lower", label: "Lobby wall, lower row", group: "Lobby", w: 16, h: 16, pal: "lobby", gen: GEN.wall_lower },

  { key: "gallery_floor", label: "Gallery floor", group: "Gallery", w: 16, h: 16, pal: "wood", gen: GEN.floor_wood, note: "Tiles seamlessly in every direction." },
  { key: "gallery_wall_top", label: "Gallery wall top", group: "Gallery", w: 16, h: 16, pal: "gallery", gen: GEN.wall_top },
  { key: "gallery_wall_upper", label: "Gallery wall, upper row", group: "Gallery", w: 16, h: 16, pal: "gallery", gen: GEN.wall_upper, note: "Pieces hang across this row and the one below." },
  { key: "gallery_wall_lower", label: "Gallery wall, lower row", group: "Gallery", w: 16, h: 16, pal: "gallery", gen: GEN.wall_lower },

  { key: "doorway_upper", label: "Doorway, upper half", group: "Doors", w: 16, h: 16, pal: "door", gen: GEN.doorway_upper, note: OVER_NOTE },
  { key: "doorway_lower", label: "Doorway, lower half", group: "Doors", w: 16, h: 16, pal: "door", gen: GEN.doorway_lower, note: OVER_NOTE },
  { key: "doorway_bottom", label: "Doorway in a bottom wall", group: "Doors", w: 16, h: 16, pal: "door", gen: GEN.doorway_bottom, note: OVER_NOTE },
  { key: "staff_door_upper", label: "Staff door, upper half", group: "Doors", w: 16, h: 16, pal: "wood", gen: GEN.staff_upper, note: OVER_NOTE },
  { key: "staff_door_lower", label: "Staff door, lower half", group: "Doors", w: 16, h: 16, pal: "wood", gen: GEN.staff_lower, note: OVER_NOTE },
  { key: "exit_door", label: "Front doors", group: "Doors", w: 16, h: 16, pal: "lobby", gen: GEN.exit_door, note: "Sits in the lobby's bottom wall. " + OVER_NOTE },

  { key: "plant", label: "Potted plant", group: "Furniture", w: 16, h: 16, pal: "plant", gen: GEN.plant },
  { key: "bench", label: "Bench", group: "Furniture", w: 32, h: 16, pal: "wood", gen: GEN.bench },
  { key: "front_desk", label: "Front desk with guestbook", group: "Furniture", w: 48, h: 16, pal: "wood", gen: GEN.desk },
  { key: "sign_stand", label: "Sign stand", group: "Furniture", w: 16, h: 16, pal: "wood", gen: GEN.sign },

  { key: "wall_frame_gold", label: "Gold frame on the wall", group: "Frames", w: 32, h: 32, pal: "gold", gen: GEN.wall_frame_gold, note: "Episode pieces. Leave the window from (4,4) to (27,21) transparent; the art shows through it. The plate below is the placard." },
  { key: "wall_frame_wood", label: "Wood frame on the wall", group: "Frames", w: 32, h: 32, pal: "wood", gen: GEN.wall_frame_wood, note: "Community pieces. Same window as the gold frame." },
  { key: "closeup_gold", label: "Gold frame, close-up", group: "Frames", w: 24, h: 24, pal: "gold", gen: GEN.closeup_gold, note: "Nine-slice: the outer 8 pixels on each side become the border around the art." },
  { key: "closeup_wood", label: "Wood frame, close-up", group: "Frames", w: 24, h: 24, pal: "wood", gen: GEN.closeup_wood, note: "Nine-slice, like the gold close-up frame." },
  { key: "textbox", label: "Text box border", group: "Frames", w: 24, h: 24, pal: "ui", gen: GEN.textbox, note: "Nine-slice: the outer 8 pixels on each side become the border; the middle stretches." },
  { key: "sheet_cover", label: "Sheet over an unveiling piece", group: "Unveiling", w: 32, h: 32, pal: "cloth", gen: GEN.sheet, note: "Visitors see this in a piece's spot until its unveil date." },
  { key: "crate", label: "Crate with a new piece", group: "Unveiling", w: 32, h: 32, pal: "wood", gen: GEN.crate, note: "Curator mode only: waits in an empty spot until you hang the piece." },
  { key: "sparkle", label: "Sparkle", group: "Unveiling", w: 16, h: 16, frames: 4, fps: 10, pal: "gold", gen: GEN.sparkle, note: "4 frames side by side (64×16 sheet). Plays around a piece as it's hung." },
  { key: "dust", label: "Dust on a frame", group: "Cozy loop", w: 32, h: 32, pal: "dust", gen: GEN.dust, note: "Drawn over a dusty piece. Mostly transparent; just the specks." },
  { key: "plant_thirsty", label: "Thirsty plant", group: "Cozy loop", w: 16, h: 16, pal: "plant", gen: GEN.plant_thirsty, note: "Replaces the potted plant until it's watered for the day." },
  { key: "mug", label: "The curator's coffee mug", group: "Cozy loop", w: 16, h: 16, pal: "mug", gen: GEN.mug, note: "Left somewhere new each day." },
  { key: "light_switch", label: "Light switch", group: "Cozy loop", w: 16, h: 16, pal: "switchp", gen: GEN.light_switch, note: "On the wall. " + OVER_NOTE },
  { key: "intercom", label: "Intercom", group: "Cozy loop", w: 16, h: 16, pal: "switchp", gen: GEN.intercom, note: "In the lobby. Makes the closing announcement. " + OVER_NOTE },
  { key: "player_staff", label: "Player in staff uniform", group: "Staff", w: 16, h: 16, layout: "char", pal: "staff", gen: GEN.staff_uniform, note: "Used while clocked in. " + CHAR_NOTE },
  { key: "staff_floor", label: "Staff room floor", group: "Staff", w: 16, h: 16, pal: "staffrm", gen: GEN.floor_lino, note: "Tiles seamlessly in every direction." },
  { key: "staff_wall_top", label: "Staff room wall top", group: "Staff", w: 16, h: 16, pal: "staffrm", gen: GEN.wall_top },
  { key: "staff_wall_upper", label: "Staff room wall, upper row", group: "Staff", w: 16, h: 16, pal: "staffrm", gen: GEN.wall_upper },
  { key: "staff_wall_lower", label: "Staff room wall, lower row", group: "Staff", w: 16, h: 16, pal: "staffrm", gen: GEN.wall_lower },
  { key: "lockers", label: "Locker", group: "Staff", w: 16, h: 32, pal: "locker", gen: GEN.lockers, note: "One locker, standing against the wall across both wall rows. Six stand side by side." },
  { key: "corkboard", label: "Corkboard", group: "Staff", w: 32, h: 32, pal: "cork", gen: GEN.corkboard, note: "Hangs across both wall rows. Holds your notes for upcoming episodes." },
  { key: "time_clock", label: "Time clock", group: "Staff", w: 16, h: 16, pal: "locker", gen: GEN.time_clock, note: "Where staff clock out. " + OVER_NOTE },
  { key: "eotm_frame", label: "Employee of the Month frame", group: "Staff", w: 32, h: 32, pal: "gold", gen: GEN.eotm_frame, note: "In the lobby. The staff uniform sprite stands in the window from (8,5) to (23,21)." },
  { key: "break_table", label: "Break table", group: "Staff", w: 32, h: 16, pal: "wood", gen: GEN.break_table },
  { key: "coffee_counter", label: "Coffee counter", group: "Staff", w: 32, h: 16, pal: "locker", gen: GEN.coffee_counter, note: "The curator's mug sits here once it's been found for the day." },
  { key: "shadow_figure", label: "Something in the dark", group: "Cozy loop", w: 16, h: 16, pal: "shadow", gen: GEN.shadow_figure, note: "Rarely seen after closing. Drawn faintly over the darkness, so keep it mostly black with something pale for eyes." },
  { key: "whiteboard", label: "Staff rules whiteboard", group: "Staff", w: 32, h: 32, pal: "board", gen: GEN.whiteboard, note: "A portable whiteboard on legs, just inside the staff room door. Two tiles wide; it stands on the bottom tile row and rises one tile above it." },
  { key: "shop_floor", label: "Gift shop floor", group: "Gift shop and café", w: 16, h: 16, pal: "shopfl", gen: GEN.floor_planks, note: "Tiles seamlessly in every direction." },
  { key: "shop_wall_top", label: "Gift shop wall top", group: "Gift shop and café", w: 16, h: 16, pal: "shop", gen: GEN.wall_top },
  { key: "shop_wall_upper", label: "Gift shop wall, upper row", group: "Gift shop and café", w: 16, h: 16, pal: "shop", gen: GEN.shop_wall_hi },
  { key: "shop_wall_lower", label: "Gift shop wall, lower row", group: "Gift shop and café", w: 16, h: 16, pal: "shop", gen: GEN.shop_wall_lo },
  { key: "shop_counter", label: "Shop counter", group: "Gift shop and café", w: 48, h: 16, pal: "shop", gen: GEN.shop_counter },
  { key: "shop_shelves", label: "Souvenir shelves", group: "Gift shop and café", w: 32, h: 32, pal: "shop", gen: GEN.shop_shelves, note: "Wall shelves of souvenirs, across both wall rows." },
  { key: "featured_stand", label: "Featured item stand", group: "Gift shop and café", w: 16, h: 32, pal: "cups", gen: GEN.featured_stand, note: "A pedestal with a glass dome. The featured item's icon is drawn inside the dome, at (4,8) to (11,15)." },
  { key: "cafe_counter", label: "Café counter", group: "Gift shop and café", w: 48, h: 16, pal: "cafe", gen: GEN.cafe_counter },
  { key: "cafe_menu", label: "Café menu board", group: "Gift shop and café", w: 32, h: 32, pal: "cafe", gen: GEN.cafe_menu, note: "Across both wall rows, behind the barista." },
  { key: "cafe_table", label: "Café table", group: "Gift shop and café", w: 16, h: 16, pal: "cafe", gen: GEN.cafe_table },
  { key: "cafe_stool", label: "Café stool", group: "Gift shop and café", w: 16, h: 16, pal: "cafe", gen: GEN.cafe_stool, note: "You can sit here. The player is drawn on top." },
  { key: "shop_staff", label: "Shopkeeper and barista", group: "Gift shop and café", w: 16, h: 16, layout: "char", pal: "apron", gen: GEN.staff_uniform, note: CHAR_NOTE },
  { key: "cups", label: "Drinks in hand", group: "Gift shop and café", w: 8, h: 8, frames: 3, pal: "cups", gen: GEN.cups, note: "3 frames side by side (24×8): coffee, tea, cocoa." },
  { key: "steam", label: "Steam", group: "Gift shop and café", w: 8, h: 8, frames: 3, pal: "cups", gen: GEN.steam, note: "3 frames side by side (24×8), rising." },
  { key: "shutter", label: "Shutter (no longer used)", group: "Retired", retired: true, w: 16, h: 16, pal: "shutter", gen: GEN.shutter, note: "Kept only so older atlases still line up." },
  { key: "window_frame", label: "Lobby window", group: "Evening", w: 32, h: 32, pal: "wood", gen: GEN.window_frame, note: "Across both wall rows. Leave the glass (3,3 to 28,23) transparent: the sky shows through." },
  { key: "sky_day", label: "Sky: day", group: "Evening", w: 28, h: 24, pal: "sky", gen: GEN.sky_day, note: "Seen through the lobby window, 7 am to 5 pm in the visitor's own time." },
  { key: "sky_sunset", label: "Sky: sunset", group: "Evening", w: 28, h: 24, pal: "sky", gen: GEN.sky_sunset, note: "5 to 7 pm, and 6 to 7 am." },
  { key: "sky_night", label: "Sky: night", group: "Evening", w: 28, h: 24, pal: "sky", gen: GEN.sky_night, note: "7 pm to 6 am." },
  { key: "guard", label: "Security guard", group: "Evening", w: 16, h: 16, layout: "char", pal: "guard", gen: GEN.staff_uniform, note: "Does rounds in the gallery at night with a flashlight. " + CHAR_NOTE },
  { key: "item_rack", label: "Item rack", group: "Gift shop and café", w: 32, h: 32, pal: "trinket", gen: GEN.item_rack, note: "Stands two tiles tall. Items for sale are drawn on its two shelves, three per shelf, as 8×8 icons: top row at y 5, bottom row at y 18, x at 3, 12 and 21." },
  { key: "trinkets", label: "Trinkets", group: "Gift shop and café", w: 8, h: 8, frames: 8, pal: "trinket", gen: GEN.trinkets, note: "8 little knickknacks side by side (64×8). They fill empty rack spots so the racks never look bare." },
  { key: "bunting", label: "Bunting", group: "Gift shop and café", w: 16, h: 16, pal: "trinket", gen: GEN.bunting, note: "Drawn along the top of the shop walls, one tile at a time, so it should tile left to right. Mostly transparent." },
  { key: "shop_posters", label: "Shop posters", group: "Gift shop and café", w: 32, h: 32, pal: "trinket", gen: GEN.shop_posters, note: "On the wall, across both wall rows." },
  { key: "mug_shelf", label: "Mug shelf", group: "Gift shop and café", w: 32, h: 32, pal: "trinket", gen: GEN.mug_shelf, note: "On the café wall, across both wall rows." },
  { key: "postcard_spinner", label: "Postcard spinner", group: "Gift shop and café", w: 16, h: 32, pal: "trinket", gen: GEN.postcard_spinner, note: "Stands two tiles tall." },
  { key: "floor_lamp", label: "Floor lamp", group: "Gift shop and café", w: 16, h: 32, pal: "trinket", gen: GEN.floor_lamp, note: "Stands two tiles tall and casts a warm glow." },
  { key: "basket", label: "Basket of goodies", group: "Gift shop and café", w: 16, h: 16, pal: "trinket", gen: GEN.basket },
  { key: "overflow_screen", label: "Touch screen on a pedestal", group: "Rooms", w: 16, h: 32, pal: "screen", gen: GEN.overflow_screen, note: "Two tiles tall. Holds the room's extra pieces: the ones of its genre that don't fit in its cases." },
  { key: "hall_floor", label: "Hallway floor (dark wood)", group: "Hallways", w: 16, h: 16, pal: "darkwood", gen: GEN.floor_wood, note: "Tiles seamlessly in every direction." },
  { key: "carpet_floor", label: "Carpet floor", group: "Rooms", w: 16, h: 16, pal: "plush", gen: GEN.carpet_floor, note: "Gray on purpose: a room's floor color tints it (Rooms, Museum, Layout). Tiles seamlessly." },
  { key: "mural_dusk", label: "Mural: dusk peaks", group: "Murals", w: 256, h: 16, pal: "m_dusk", gen: GEN.mural_dusk, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "mural_canyon", label: "Mural: canyon road", group: "Murals", w: 256, h: 16, pal: "m_canyon", gen: GEN.mural_canyon, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "mural_storm", label: "Mural: storm plains", group: "Murals", w: 256, h: 16, pal: "m_storm", gen: GEN.mural_storm, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "mural_volcano", label: "Mural: volcano night", group: "Murals", w: 256, h: 16, pal: "m_volcano", gen: GEN.mural_volcano, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "mural_isles", label: "Mural: floating isles", group: "Murals", w: 256, h: 16, pal: "m_isles", gen: GEN.mural_isles, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "mural_castle", label: "Mural: castle hill", group: "Murals", w: 256, h: 16, pal: "m_castle", gen: GEN.mural_castle, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "mural_forest", label: "Mural: moonlit forest", group: "Murals", w: 256, h: 16, pal: "m_forest", gen: GEN.mural_forest, note: "Painted along the top row of a wall. A shorter wall shows the middle of it." },
  { key: "carpet_h", label: "Carpet runner, across", group: "Hallways", w: 16, h: 16, frames: 3, pal: "carpet", gen: GEN.carpet_h, note: "3 frames side by side (48×16): the left end, a middle piece, the right end. Painted one tile at a time with the Carpet tool in Rooms." },
  { key: "carpet_v", label: "Carpet runner, down", group: "Hallways", w: 16, h: 16, frames: 3, pal: "carpet", gen: GEN.carpet_v, note: "3 frames side by side (48×16): the top end, a middle piece, the bottom end." },
  { key: "wall_sconce", label: "Accent light", group: "Hallways", w: 16, h: 16, pal: "sconce", gen: GEN.wall_sconce, note: "A small wall light, hung on the upper wall row. It glows with the lights on." },
  { key: "rug", label: "Rug", group: "Gift shop and café", w: 48, h: 32, pal: "rug", gen: GEN.rug, note: "Lies on the floor under everything else; you walk over it." },
  { key: "theater_door", label: "Screening nook doorway", group: "Screening nook", w: 32, h: 32, pal: "tdoor", gen: GEN.theater_door, note: "One big dark doorway in a square frame, across both doorway tiles in the café hall (both wall rows)." },
  { key: "marquee_lights", label: "Marquee bulbs", group: "Screening nook", w: 32, h: 32, frames: 2, fps: 3, pal: "bulbs", gen: GEN.marquee_lights, note: "2 frames (64×32), drawn over the doorway and lit even in the dark. Every other bulb lit, so they chase." },
  { key: "led_sign", label: "NOW PLAYING board", group: "Screening nook", w: 64, h: 12, pal: "ledsign", gen: GEN.led_sign, note: "The black board, four tiles wide and one line tall, centered on the wall. The red letters scroll across it from right to left (rows 3 to 7, between x 3 and 60)." },
  { key: "arcade_cabinet", label: "Arcade cabinet", group: "Gift shop and café", w: 16, h: 32, frames: 2, fps: 2, pal: "arcade", gen: GEN.arcade_cabinet, note: "2 frames (32×32), the attract screen flickering. Two tiles tall. Plays the games that have a Play link." },
  { key: "hall_poster", label: "Theater hallway poster", group: "Screening nook", w: 16, h: 32, pal: "hposter", gen: GEN.hall_poster, note: "On the hallway's left wall, seen edge on (mirrored for the right wall). Two tiles tall. It's dark in there; keep it dim." },
  { key: "aisle_light", label: "Hallway floor light", group: "Screening nook", w: 4, h: 3, pal: "aisle", gen: GEN.aisle_light, note: "A little light by the wall along the theater hallway's floor (mirrored on the right). Drawn over the dark, with a soft glow." },
  { key: "theater_screen", label: "Screening nook screen", group: "Screening nook", w: 96, h: 48, frames: 2, pal: "screen", gen: GEN.theater_screen, note: "2 frames (192×48), six tiles wide and three tall (both wall rows and the wall cap above). The picture is the 80×45 window at (8, 2): the episode playing this hour shows there, muted, when it can; otherwise it flickers softly between the frames." },
  { key: "planter_wide", label: "Long planter", group: "Furniture", w: 32, h: 16, pal: "trinket", gen: GEN.planter_wide, note: "Two tiles wide. A leafy planter box with a few flowers, for dividing a room or blocking a spot." },
  { key: "planter", label: "Planter", group: "Gift shop and café", w: 16, h: 16, pal: "trinket", gen: GEN.planter, note: "A row of these divides the shop from the café." },
  { key: "cat_bed", label: "Cat bed", group: "The cat", w: 16, h: 16, pal: "cat", gen: GEN.cat_bed },
  { key: "cat", label: "The museum cat", group: "The cat", w: 16, h: 16, frames: 3, pal: "cat", gen: GEN.cat, note: "3 frames side by side (48×16): asleep, asleep breathing in, awake for a pet." },
  { key: "heart", label: "Heart", group: "The cat", w: 8, h: 8, pal: "cat", gen: GEN.heart, note: "Floats up when you pet the cat." },
  { key: "collection_cabinet", label: "Collection cabinet", group: "Staff", w: 48, h: 32, pal: "locker", gen: GEN.collection_cabinet, note: "In the staff room. Stands two tiles tall. Everything you've bought sits on its three shelves, four per shelf, as 8×8 icons: rows at y 2, 11 and 20; x at 4, 13, 27 and 36." },
  { key: "display_case", label: "Episode display case", group: "Pieces", w: 16, h: 32, pal: "glass", gen: GEN.display_case, note: "Stands two tiles tall in the middle of a room. The game's art is drawn behind the glass at (2,3) to (13,13), so leave the glass see-through. The front is the bottom side." },
  { key: "doorway_side", label: "Doorway in a side wall", group: "Doors", w: 16, h: 16, pal: "door", gen: GEN.doorway_side, note: "In the left or right wall. " + OVER_NOTE },
  { key: "cup_empty", label: "Empty cup in hand", group: "Gift shop and café", w: 8, h: 8, pal: "cups", gen: GEN.cup_empty, note: "What you're left holding after the last sip." },
  { key: "bus_tub", label: "Bus tub", group: "Gift shop and café", w: 16, h: 16, pal: "cups", gen: GEN.bus_tub, note: "Where empty cups go." },
  { key: "trash_can", label: "Trash can", group: "Furniture", w: 16, h: 16, pal: "locker", gen: GEN.trash_can, note: "Takes empty cups too." },
  { key: "fingerprints", label: "Fingerprints on glass", group: "Pieces", w: 16, h: 16, frames: 3, pal: "glass", gen: GEN.fingerprints, note: "3 frames side by side (48×16): a few smudges, more, lots. Drawn over a case's glass." },
  { key: "emote", label: "Photo reactions", group: "People", w: 8, h: 8, frames: 8, pal: "emote", gen: GEN.emote, note: "8 frames (64×8), shown over someone you photograph: ! (startled), heart, peace sign, star (posing), ... (busy), wave, shy, annoyed." },
  { key: "bubble", label: "Visitor's thought bubble", group: "People", w: 8, h: 8, frames: 2, pal: "ui", gen: GEN.bubble, note: "2 frames (16×8): \"?\" over a curious visitor, \"!\" over one who came back to tell you how a game went." },
  { key: "stairs_up", label: "Stairs going up", group: "Floors", w: 32, h: 32, pal: "staffrm", gen: GEN.stairs_up, note: "No longer used: stairs are one tile now." , retired: true },
  { key: "stairs_down", label: "Stairs going down", group: "Floors", w: 32, h: 32, pal: "staffrm", gen: GEN.stairs_down, note: "No longer used: stairs are one tile now.", retired: true },
  { key: "storage_shelves", label: "Storage shelves", group: "Floors", w: 32, h: 32, pal: "wood", gen: GEN.storage_shelves, note: "Two tiles tall." },
  { key: "box_stack", label: "Stack of boxes", group: "Floors", w: 16, h: 32, pal: "wood", gen: GEN.box_stack, note: "Two tiles tall; you can walk behind the top." },
  { key: "workbench", label: "Workbench", group: "Floors", w: 48, h: 16, pal: "wood", gen: GEN.workbench, note: "In the storage room. Lists the crates for upcoming pieces." },
  { key: "stair_up", label: "Stairs up (one tile)", group: "Floors", w: 16, h: 16, pal: "staffrm", gen: GEN.stair_up, note: "Step on it to go up a floor." },
  { key: "stair_down", label: "Stairs down (one tile)", group: "Floors", w: 16, h: 16, pal: "staffrm", gen: GEN.stair_down, note: "Step on it to go down a floor." },
  { key: "railing", label: "Railing", group: "Floors", w: 16, h: 16, pal: "wood", gen: GEN.railing, note: "Blocks the way, like a low rail in front of something." },
  { key: "shop_bag", label: "Museum shop bag", group: "People", w: 8, h: 8, pal: "bag", gen: GEN.shop_bag, note: "Carried by some visitors. Held at their side, so draw it hanging from its handle." },
  { key: "phone", label: "Phone (taking a photo)", group: "People", w: 8, h: 8, pal: "ui", gen: GEN.phone, note: "Held up in front of you for a moment when you take a photo." },
  { key: "usher", label: "Usher", group: "People", w: 16, h: 16, layout: "char", pal: "usher", gen: GEN.staff_uniform, note: "Behind the front desk. " + CHAR_NOTE },
  { key: "g2_floor", label: "Gallery Two floor", group: "Gallery Two", w: 16, h: 16, pal: "g2fl", gen: GEN.floor_wood, note: "Tiles seamlessly in every direction." },
  { key: "g2_wall_top", label: "Gallery Two wall top", group: "Gallery Two", w: 16, h: 16, pal: "g2", gen: GEN.wall_top },
  { key: "g2_wall_upper", label: "Gallery Two wall, upper row", group: "Gallery Two", w: 16, h: 16, pal: "g2", gen: GEN.wall_upper, note: "Paintings hang across this row and the one below." },
  { key: "g2_wall_lower", label: "Gallery Two wall, lower row", group: "Gallery Two", w: 16, h: 16, pal: "g2", gen: GEN.wall_lower },
  { key: "g3_floor", label: "Gallery Three floor", group: "Gallery Three", w: 16, h: 16, pal: "g3fl", gen: GEN.floor_wood, note: "Tiles seamlessly in every direction." },
  { key: "g3_wall_top", label: "Gallery Three wall top", group: "Gallery Three", w: 16, h: 16, pal: "g3", gen: GEN.wall_top },
  { key: "g3_wall_upper", label: "Gallery Three wall, upper row", group: "Gallery Three", w: 16, h: 16, pal: "g3", gen: GEN.wall_upper, note: "Paintings hang across this row and the one below." },
  { key: "g3_wall_lower", label: "Gallery Three wall, lower row", group: "Gallery Three", w: 16, h: 16, pal: "g3", gen: GEN.wall_lower },
  { key: "someones_pc", label: "Someone's PC", group: "Floors", w: 16, h: 16, pal: "pc", gen: GEN.someones_pc, note: "In Storage. Holds the archive of pieces no longer on display." },
  { key: "shelf_unit", label: "Shop shelving unit", group: "Gift shop and café", w: 48, h: 32, pal: "shelf", gen: GEN.shelf_unit, note: "Two shelves, three stacks of goods per shelf. Goods are drawn on top: stacks centered at x 9, 24 and 39, shelves at y 4 and 18." },
  { key: "magazine_rack", label: "Magazine stand", group: "Gift shop and café", w: 16, h: 32, pal: "mags", gen: GEN.magazine_rack, note: "In the café. Two tiles tall." },
  { key: "segway", label: "Segway (secret)", group: "People", w: 16, h: 16, pal: "segway", gen: GEN.segway, note: "Drawn under you when you've entered a certain famous code." },
  { key: "player_goq_shirt", label: "Player in the GOQ shirt (secret)", group: "People", w: 16, h: 16, layout: "char", pal: "goqshirt", gen: GEN.staff_uniform, note: "Worn after unlocking the discontinued GOQ shirt. " + CHAR_NOTE },
  { key: "fridge", label: "Staff fridge", group: "Staff", w: 16, h: 32, pal: "kitchen", gen: GEN.fridge, note: "Two tiles tall." },
  { key: "microwave_counter", label: "Counter with microwave", group: "Staff", w: 32, h: 16, frames: 2, pal: "kitchen", gen: GEN.microwave_counter, note: "2 frames (64×16): clean, and after the incident." },
  { key: "patron_board", label: "Patron Board", group: "Lobby", w: 32, h: 32, pal: "plaque", gen: GEN.patron_board, note: "A standing board in the lobby that lists every Patreon member. Two tiles wide, two tall." },
  { key: "doormat", label: "Doormat", group: "Doors", w: 16, h: 16, pal: "mat", gen: GEN.doormat, note: "Drawn on the floor just inside every doorway, so doors are easy to spot. Leave the edges transparent." },
  { key: "closeup_case", label: "Case close-up frame", group: "Pieces", w: 24, h: 24, pal: "glass", gen: GEN.closeup_case, note: "Nine-slice around the art when you look into a case." },
  { key: "pick_medal", label: "Curator's pick medal", group: "Pieces", w: 8, h: 12, pal: "medal", gen: GEN.pick_medal, note: "A ribbon rosette pinned to the front corner of a curator's pick (cases and paintings), and shown by its title in the placard panel and the archive. Leave the background transparent." },
  { key: "leaderboard", label: "Staff leaderboard", group: "Staff", w: 32, h: 32, pal: "chalk", gen: GEN.leaderboard, note: "Hangs across both wall rows in the staff room. Lists this month's top staff." },
];
/* New slots are only ever added to the end of this list, so atlases made earlier keep lining up. */
const SLOT = {}; SLOTS.forEach(s => { s.frames = s.frames || 1; s.fps = s.fps || 0; SLOT[s.key] = s; });
function sheetGrid(s) { return s.layout === "char" ? { cols: 3, rows: 4 } : { cols: s.frames, rows: 1 }; }
function placeholder(key) {
  const s = SLOT[key], g = sheetGrid(s), frames = [];
  for (let f = 0; f < g.cols * g.rows; f++) frames.push(s.gen(f));
  return paint(frames, s.w, s.h, g.cols, PAL[s.pal]);
}

/* ---------- Pieces ----------
   Sample pieces for testing. A museum pack's "pieces" list replaces these entirely.
   kind "episode" = gold frame with Observation + Intention.
   kind "community" = wood frame with a guest note.
   image (optional) = the art, as a data URL or a path next to the page. Without one, a placeholder is painted from colors + style. */
const SAMPLE_PIECES = [
  { id: "sample-1", kind: "episode", title: "Lantern Keeper", developer: "Mira Okafor", colors: ["#f8e8b0", "#e0a040", "#70508c", "#201830"], style: "hills",
    hint: "the one where you can choose not to light the last lantern",
    observation: "I kept refusing to light the last lantern. Leaving one dark felt like the only choice the game let me make for myself.",
    intention: "The last lantern is optional on purpose. Mira wanted players to notice they were allowed to stop." },
  { id: "sample-2", kind: "episode", title: "Second Breakfast", developer: "Tom Ruiz", colors: ["#f0f0d8", "#88c870", "#c85848", "#281818"], style: "blocks",
    hint: "the one where the clock never ran out but I still rushed",
    observation: "The timer never ran out, but I rushed anyway. Why did a clock that never mattered make me so nervous?",
    intention: "The clock is decoration. Tom added it late, and playtesters' panic made him keep it." },
  { id: "sample-3", kind: "community", title: "Tidepool", developer: "kelpcat", colors: ["#e0f4f0", "#78c8c0", "#3870a0", "#102030"], style: "waves",
    guestWriter: "Sam (Discord)", hint: "the quiet one with the rocks and the water",
    guestNote: "Nothing in Tidepool tells you what to do, and somehow that made me look closer at every rock." },
  { id: "sample-4", kind: "episode", title: "The Long Hallway", developer: "Ines Varga", colors: ["#f0e0e8", "#c890a8", "#584068", "#180c18"], style: "moon",
    hint: "the one with the hallway that keeps getting shorter",
    observation: "The hallway got shorter every time I walked it. I only noticed because I was bored, and the boredom was the clue.",
    intention: "Ines shrank it a few steps each loop so the repetition itself would become the puzzle." },
  { id: "sample-5", kind: "community", title: "Mushroom Mail", developer: "Arlo Bea", colors: ["#f8f0e0", "#d8a060", "#788838", "#202010"], style: "hills",
    guestWriter: "Priya (Discord)", hint: "the one where you deliver letters to mushrooms",
    guestNote: "Delivering letters to mushrooms shouldn't feel this heavy, but every reply made me want to write back." },
  { id: "sample-6", kind: "episode", title: "Echo Quarry", developer: "Dee Lam", colors: ["#e8f0f8", "#90a8c8", "#a85838", "#18181c"], style: "blocks",
    hint: "the mining one with the echo",
    observation: "I mined slower than I needed to, just to hear the echo. Was the sound design quietly setting my pace?",
    intention: "Yes. Dee tuned each echo's length so careful players would settle into a rhythm." },
];
const STYLES = ["hills", "waves", "moon", "blocks"];
/* Sample corkboard notes. The host replaces these in the curator's Staff tab. */
const DEFAULT_CORKBOARD = [
  "Episode idea: why do save rooms feel safe even when nothing in them changes?",
  "Remember: there are no bad mechanics, only mechanics in the wrong game.",
  "Ask the Long Hallway dev how many steps they cut each loop!!",
];
/* Sample gift shop items. The host replaces these in the curator's Shop tab. */
const SAMPLE_ITEMS = [
  { id: "pin", name: "Question mark pin", price: 3, description: "A tiny gold enamel pin shaped like a question mark." },
  { id: "tote", name: "Qualia tote bag", price: 6, description: "Holds snacks, notebooks, and unresolved thoughts." },
  { id: "mug", name: "\"Wait, why?\" mug", price: 5, description: "Just like the curator's. Please don't leave it lying around." },
  { id: "postcards", name: "Gallery postcard set", price: 4, description: "Every piece in Gallery One, small enough to mail." },
];
const DRINKS = [{ id: "coffee", name: "Coffee" }, { id: "tea", name: "Tea" }, { id: "cocoa", name: "Cocoa" }];
/* Mindsets: how a visitor likes to play. Each game is tagged with the mindsets it suits (curator, Pieces tab), and the
   curator's Visitors tab edits the list. ask: what a curious visitor is looking for, starting "Something...". loved / liked / nope: what they say the next
   day about the game you recommended ({title} is the game). These defaults come from how the host talks about games. */
const SAMPLE_MINDS = [
  { id: "hands-on", name: "Hands-on", ask: ["Something that feels really good in my hands.", "Something where I can feel every hit.", "Something where just moving around is fun."],
    loved: ["{title} felt SO good to play. Every move felt like it mattered.", "I played {title} way too late last night. It just feels great in your hands."],
    liked: ["{title} had some moments that felt really good to play."],
    nope: ["{title} wasn't for me. It was all numbers, and I never felt like I was really doing anything.", "I tried {title}, but I couldn't feel my actions. It all felt far away."] },
  { id: "systems", name: "System builder", ask: ["Something where everything starts working together.", "Something with upgrades that combo off each other.", "Something I can plan a build in."],
    loved: ["{title}! I found a combo that broke everything. I loved it.", "I've been thinking about my {title} build all day."],
    liked: ["{title} had some neat systems in it. I liked poking at them."],
    nope: ["{title} was nice, but there wasn't much under the hood for me to dig into.", "I tried {title}. It was pretty, but I kept waiting for the systems to open up."] },
  { id: "tinkerer", name: "Tinkerer", ask: ["Something I can just mess around in, like a toy box.", "Something that lets me experiment and see what happens.", "Something where I can try weird stuff."],
    loved: ["{title} was a toy box! I spent an hour just trying stuff.", "I did something in {title} I don't think anyone's done before. That one was mine."],
    liked: ["{title} let me mess around a little. That was fun."],
    nope: ["{title} wanted me to do things one specific way. I just wanted to play.", "I tried {title}, but there wasn't much room to experiment."] },
  { id: "unhurried", name: "Unhurried", ask: ["Something I can play at my own pace.", "Something calm I can sit with for a while.", "Something relaxing. Nothing stressful, please."],
    loved: ["{title} was so calm. I just sat with it for hours.", "I played {title} with a cup of tea. Perfect evening."],
    liked: ["{title} had some quiet moments I really liked."],
    nope: ["{title} kept pushing me to hurry. I wanted to breathe.", "I tried {title}, but my heart was racing the whole time. Not what I needed."] },
  { id: "thrill", name: "Thrill seeker", ask: ["Something with real stakes.", "Something that makes me nervous, in a good way.", "Something with a thing breathing down my neck."],
    loved: ["{title} had me on the edge of my seat! I yelled at my screen.", "My hands were sweating the whole time I played {title}. Loved it."],
    liked: ["{title} had a couple of tense moments. I'll take it."],
    nope: ["{title} was nice, but nothing ever pushed me.", "I tried {title}, but I never felt any danger. I got a little bored."] },
  { id: "story", name: "Story seeker", ask: ["Something with a character I can care about.", "Something with a story that sneaks up on me.", "Something that makes me feel something."],
    loved: ["{title} got me. I'm still thinking about it.", "I didn't expect {title} to hit me that hard. Thank you."],
    liked: ["{title} had a little story in it that I liked."],
    nope: ["{title} was fun, but I didn't really feel anything.", "I tried {title}. It's cool, but there wasn't anyone in it for me to care about."] },
  { id: "one-more", name: "One more run", ask: ["Something I get a little better at every time.", "Something I keep saying \"one more\" to.", "Something with a high score to chase."],
    loved: ["\"Just one more\" in {title} turned into three hours. Oops.", "I beat my best score in {title} like ten times last night!"],
    liked: ["I went back to {title} a few times. It's got something."],
    nope: ["{title} was a nice one-time thing, but I didn't feel the pull to go again.", "I tried {title}, but there wasn't much to get better at."] },
];
const VISITOR_NAMES = ["Ada", "Bea", "Cal", "Dot", "Eli", "Fern", "Gus", "Hana", "Ivo", "June", "Kit", "Lou", "Mae", "Nico", "Oona", "Pip", "Quinn", "Rosa", "Sol", "Tess",
  "Uma", "Vic", "Wren", "Yuki", "Arlo", "Bram", "Cleo", "Dex", "Esme", "Finn", "Gio", "Hal", "Iris", "Jude", "Kai", "Lark", "Milo", "Nell", "Otis", "Pia"];
/* Offline staff badge for testing. Real badges live in Supabase (see supabase-setup.sql).
   Never put real badge keys in this file or in a museum pack: both are public on the site. */
/* Chores that count toward staff points (a visitor who loved your recommendation, and closing up, are worth 3). */
const pts = n => n + " point" + (n === 1 ? "" : "s");
const POINT_KINDS = ["dusted", "straightened", "watered", "mugs", "wiped", "helped", "closings"];
const chorePoints = k => (k === "helped" || k === "closings" ? 3 : 1);
const TEST_BADGES = [{ badge: "0001", key: "QQQQQQ", name: "Test Staff" }];
/* The test badge only works where its hint is shown (showTestBadge): locally, with ?test, or in the curator. */
/* Badge keys are six characters from an alphabet without look-alikes (no O/0, no I/1), shown as QQQ-QQQ.
   Typed keys are normalized: uppercase, dashes and spaces dropped. */
const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const normKey = k => String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const safeUrl = v => (typeof v === "string" && /^https?:\/\/\S+$/i.test(v.trim()) ? v.trim().slice(0, 400) : "");
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max || 600) : "");
function shuffled(list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function normalizeMinds(list) {
  const lines = v => (Array.isArray(v) ? v : []).map(x => str(x, 240)).filter(Boolean).slice(0, 8), seen = new Set();
  return (Array.isArray(list) ? list : SAMPLE_MINDS).slice(0, 16).map((m, i) => {
    let id = str(m && m.id, 30).toLowerCase().replace(/[^a-z0-9-]/g, "") || "mind-" + (i + 1);
    while (seen.has(id)) id += "-2";
    seen.add(id);
    return { id, name: str(m && m.name, 40) || "Mindset " + (i + 1), ask: lines(m && m.ask), loved: lines(m && m.loved), liked: lines(m && m.liked), nope: lines(m && m.nope) };
  });
}
/* Genres: one per museum room that shows episodes. minds: the mindsets that room is for (a piece follows its first ticked mindset). */
const SAMPLE_GENRES = [
  { id: "dark", name: "The Shape in the Dark", short: "Dark", color: "#8a7ab8", minds: ["thrill"] },
  { id: "mastery", name: "The Long Road to Mastery", short: "Mastery", color: "#e0817a", minds: ["hands-on", "one-more"] },
  { id: "whispers", name: "Whispers of a Larger World", short: "Whispers", color: "#4caf9a", minds: ["unhurried"] },
  { id: "experiment", name: "Mad Scientist", short: "Mad Scientist", color: "#6a8ad8", minds: ["systems", "tinkerer"] },
  { id: "stories", name: "Stories", short: "Stories", color: "#c878b0", minds: ["story"] },
];
function normalizeGenres(list, mids) {
  if (!Array.isArray(list)) list = JSON.parse(JSON.stringify(SAMPLE_GENRES));
  const seen = new Set();
  return list.filter(g => g && typeof g === "object").slice(0, 12).map((g, i) => {
    let id = str(g.id, 30).toLowerCase().replace(/[^a-z0-9_-]/g, "") || "genre-" + i; while (seen.has(id)) id += "2"; seen.add(id);
    return { id, name: str(g.name, 40) || "Genre", short: str(g.short, 16), color: isHex(g.color) ? g.color : "#a08868", minds: (Array.isArray(g.minds) ? g.minds : []).map(x => str(x, 30)).filter(m => !mids || mids.has(m)) };
  });
}
/* Which room a piece belongs in: picked by hand, or the first genre that welcomes one of its mindsets (in the order they're ticked). */
function genreOf(p, genres) {
  if (p.genre && genres.some(g => g.id === p.genre)) return p.genre;
  for (const m of p.minds || []) { const g = genres.find(g => g.minds.includes(m)); if (g) return g.id; }
  return "";
}
/* Episodes in cases. Newest first, each goes to a free case in its genre's room, and only there: add cases to a room
   and more of its genre come out of the archive; take some away and its oldest go back in. Episodes with no genre go in
   rooms with no genre. Whatever doesn't fit is archived on Someone's PC. Returns the piece in each case, room by room. */
function assignCases(pieces, genres) {
  const slots = [];
  for (const id in ROOMS) {
    const def = ROOMS[id], lay = layoutOf(def);
    (def.cases || []).forEach(([x, y], i) => {
      const z = lay && lay.zoneAt[y] ? lay.zoneAt[y][x] : -1, zone = z >= 0 ? lay.zones[z] : null;
      slots.push({ room: id, i, genre: zone && zone.rect && zone.rect.genre || "", where: zone ? zone.name : def.name, p: null });
    });
  }
  const eps = pieces.filter(p => p.kind === "episode"), newest = eps.slice().reverse(), placed = new Set();
  for (const p of newest) { const g = genreOf(p, genres), s = slots.find(s => !s.p && s.genre === g); if (s) { s.p = p; placed.add(p.id); } }
  const byRoom = {}; slots.forEach(s => ((byRoom[s.room] = byRoom[s.room] || [])[s.i] = s.p));
  return { byRoom, slots, archived: eps.filter(p => !placed.has(p.id)) };
}
function normalizePiece(p, i) {
  p = p && typeof p === "object" ? p : {};
  const colors = Array.isArray(p.colors) ? p.colors.filter(isHex).slice(0, 8) : [];
  return {
    id: str(p.id, 60) || "piece-" + (i + 1), kind: p.kind === "community" ? "community" : "episode",
    title: str(p.title, 80) || "Untitled", developer: str(p.developer, 80) || "Unknown developer",
    observation: str(p.observation), intention: str(p.intention), guestWriter: str(p.guestWriter, 80), guestNote: str(p.guestNote),
    episodeUrl: safeUrl(p.episodeUrl), gameUrl: safeUrl(p.gameUrl), image: str(p.image, 20000000) || null,
    unveil: /^\d{4}-\d{2}-\d{2}$/.test(p.unveil || "") ? p.unveil : "",
    hint: str(p.hint, 160), pick: !!p.pick, minds: Array.isArray(p.minds) ? p.minds.map(x => str(x, 30)).filter(Boolean).slice(0, 8) : [], genre: str(p.genre, 30), blend: str(p.blend, 30), // blend: a second category it also belongs to
    colors: colors.length >= 2 ? colors : ["#f0ecf8", "#a898d0", "#584a88", "#1a1430"],
    style: STYLES.includes(p.style) ? p.style : STYLES[strSeed(str(p.title, 80) || String(i)) % STYLES.length],
  };
}
function normalizePack(p) {
  p = p && typeof p === "object" ? p : {};
  const assets = {};
  if (p.assets && typeof p.assets === "object") for (const k in p.assets) {
    const v = p.assets[k], src = typeof v === "string" ? v : v && v.src;
    if (SLOT[k] && typeof src === "string" && src) assets[k] = { src };
  }
  const pieces = (Array.isArray(p.pieces) ? p.pieces : SAMPLE_PIECES).map(normalizePiece);
  const guestbook = (Array.isArray(p.guestbook) ? p.guestbook : []).slice(0, 60)
    .map(g => ({ name: str(g && g.name, 40), note: str(g && g.note, 200) })).filter(g => g.note);
  const lighting = {}, lin = (p.settings && p.settings.lighting) || {};
  applyRooms(p.rooms);
  // (Extra pieces beyond the cases and wall spots go to the archive on Someone's PC.)
  for (const id in ROOMS) {
    const d = ROOMS[id].light || { dim: 0, spots: 0 }, v = lin[id] || {}, num = (x, lo, hi, def) => (typeof x === "number" && isFinite(x) ? Math.min(hi, Math.max(lo, x)) : def);
    lighting[id] = { dim: num(v.dim, 0, 0.8, d.dim), spots: num(v.spots, 0, 1, d.spots) };
  }
  const sin = (p.settings && p.settings.staff) || {}, eo = sin.eotm || {};
  const staff = {
    catName: str(sin.catName, 30) || "Pixel",
    fingerprints: typeof sin.fingerprints === "number" && isFinite(sin.fingerprints) ? Math.max(0, Math.min(1, sin.fingerprints)) : 0.15,
    patronSpeed: typeof sin.patronSpeed === "number" && isFinite(sin.patronSpeed) ? Math.max(0.2, Math.min(1, sin.patronSpeed)) : 0.45,
    // Pieces you haven't read yet: a slow sparkle or a soft green glow (or off), and how strong (0 to 1).
    readStyle: ["sparkle", "glow", "off"].includes(sin.readStyle) ? sin.readStyle : "sparkle",
    readStrength: typeof sin.readStrength === "number" && isFinite(sin.readStrength) ? Math.max(0, Math.min(1, sin.readStrength)) : 0.4,
    eotm: { name: str(eo.name, 40), note: str(eo.note, 200) },
    // Patreon members: they visit the museum as named visitors, and are all listed on the Patron Board.
    members: (Array.isArray(sin.members) ? sin.members : []).slice(0, 1000).map(m => ({ name: str(m && m.name, 32), badge: str(m && m.badge, 12).replace(/\D/g, "") })).filter(m => m.name),
    corkboard: (Array.isArray(sin.corkboard) ? sin.corkboard : DEFAULT_CORKBOARD).map(n => str(n, 300)).filter(Boolean).slice(0, 12),
  };
  const shin = (p.settings && p.settings.shop) || {};
  const items = (Array.isArray(shin.items) ? shin.items : SAMPLE_ITEMS).slice(0, 40).map((it, i) => ({
    id: str(it && it.id, 60) || "item-" + (i + 1), name: str(it && it.name, 60) || "Untitled item",
    price: Math.max(0, Math.min(999, Math.round(+(it && it.price) || 0))), description: str(it && it.description, 240), image: str(it && it.image, 2000000) || null,
  }));
  const stampSize = Math.max(3, Math.min(40, Math.round(+shin.stampSize || 10)));
  const stampItems = (Array.isArray(shin.stampItems) ? shin.stampItems : []).filter(id => items.some(it => it.id === id));
  const shop = { items, stampSize, stampItems, featured: items.some(it => it.id === shin.featured) ? shin.featured : (items[0] ? items[0].id : ""),
    drinkPrice: Math.max(0, Math.min(99, Math.round(+shin.drinkPrice || 0))), arcadePrice: Math.max(0, Math.min(99, Math.round(shin.arcadePrice === undefined ? 1 : +shin.arcadePrice || 0))) };
  const rooms = p.rooms && typeof p.rooms === "object" ? p.rooms : {};
  const vlist = v => (Array.isArray(v) ? v.filter(Array.isArray).map(pg => pg.map(x => str(x, 400)).filter(Boolean)).filter(pg => pg.length).slice(0, 30) : null);
  const textIn = (p.settings && p.settings.text) || {}, text = {};
  for (const k in textIn) if (TEXT[k]) { const v = vlist(textIn[k]); if (v && v.length) text[k] = v; }
  const talkIn = (p.settings && p.settings.talk) || {}, talk = {};
  for (const r in TALK_ROLES) talk[r] = Array.isArray(talkIn[r]) ? talkIn[r].filter(e => (Array.isArray(e && e.when) ? e.when : []).every(w => TALK_WHEN[w])).map(e => ({ when: (Array.isArray(e && e.when) ? e.when : ["always"]).slice(0, 2), v: vlist(e && e.v) || [] })).filter(e => e.v.length) : JSON.parse(JSON.stringify(TALK_DEFAULTS[r]));
  const achIn = p.settings && Array.isArray(p.settings.achievements) ? p.settings.achievements : SAMPLE_ACH;
  const achievements = achIn.slice(0, 100).map((a, i) => ({ id: str(a && a.id, 40) || "ach-" + (i + 1), name: str(a && a.name, 50) || "Achievement", desc: str(a && a.desc, 160),
    stat: ACH_STATS[a && a.stat] ? a.stat : "dusted", target: Math.max(1, Math.min(9999, Math.round(+(a && a.target) || 1))), secret: !!(a && a.secret) }));
  // Online staff (Supabase): the project address and its public key. Both are meant to be public.
  const oin = (p.settings && p.settings.online) || {}, ourl = str(oin.url, 200).replace(/\/+$/, "");
  const online = { url: /^https:\/\/[^\s/]+$/i.test(ourl) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(ourl) ? ourl : "", key: str(oin.key, 400).replace(/\s/g, "") };
  // Curious visitors: the mindsets, and how many curious visitors come each day. Tags for mindsets that no longer exist are dropped.
  const mindsets = normalizeMinds(p.settings && p.settings.mindsets), mids = new Set(mindsets.map(m => m.id));
  pieces.forEach(pc => (pc.minds = pc.minds.filter(id => mids.has(id))));
  const cin = (p.settings && p.settings.curious) || {}, curious = { perDay: Math.max(0, Math.min(10, Math.round(cin.perDay === undefined ? 3 : +cin.perDay || 0))) };
  // Museum life: the chance (0 to 100) that a visitor has a drink (lobby and café), carries a shop bag, or photographs a piece they stop at.
  const lin2 = (p.settings && p.settings.life) || {}, pct = (v, d) => Math.max(0, Math.min(100, Math.round(v === undefined ? d : +v || 0)));
  const shirts = (Array.isArray(lin2.shirts) ? lin2.shirts.filter(isHex) : []).slice(0, 10);
  const life = { drinks: pct(lin2.drinks, 30), bags: pct(lin2.bags, 20), photos: pct(lin2.photos, 8),
    shirtsOn: lin2.shirtsOn !== false, shirts: shirts.length ? shirts : SHIRT_COLORS.slice() }; // visitors' shirt colors: one is picked at random for each
  // Genres: the museum's rooms (Action, Puzzle...), each welcoming some mindsets. A piece's genre is set by hand, or follows its mindsets.
  const genres = normalizeGenres(p.settings && p.settings.genres, mids), gids = new Set(genres.map(g => g.id));
  pieces.forEach(pc => { if (!gids.has(pc.genre)) pc.genre = ""; if (!gids.has(pc.blend) || pc.blend === pc.genre) pc.blend = ""; });
  return { format: PACK_FORMAT, version: 1, assets, pieces, guestbook, rooms, settings: { lighting, staff, shop, text, talk, achievements, online, mindsets, curious, life, genres }, samples: !Array.isArray(p.pieces) };
}
/* The curator's "Skip to tomorrow" moves every daily system forward together. */
let DAY_SHIFT = 0;
function todayISO() { const d = new Date(Date.now() + DAY_SHIFT * 864e5); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function daysBetween(a, b) { const t = s => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((t(b) - t(a)) / 864e5); }
function niceDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1] + " " + d + ", " + y;
}
/* Images by their address, decoded once: a pack's art and piece images are reused every time the pack is applied. */
const IMAGES = new Map();
function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (IMAGES.has(src)) return IMAGES.get(src);
  const pr = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => { IMAGES.delete(src); res(null); }; i.src = src; });
  if (IMAGES.size > 400) IMAGES.clear();
  IMAGES.set(src, pr); return pr;
}

/* Placeholder art for a piece without an image, 24x18, painted from its colors. */
function paintingGrid(p) {
  const s = strSeed(p.id + p.title), n = p.colors.length, c = k => Math.min(n - 1, k), a = mk(24, 18, 0);
  if (p.style === "hills") {
    circ(a, 6 + (s % 12), 5, 3, c(1));
    fillFn(a, (x, y) => (y > 10 + Math.round(2 * Math.sin(x / 3 + s)) ? c(2) : undefined));
    fillFn(a, (x, y) => (y > 13 + Math.round(1.5 * Math.sin(x / 2 + s * 3)) ? c(3) : undefined));
  } else if (p.style === "waves") {
    fillFn(a, (x, y) => (y > 6 ? ((y + Math.round(1.5 * Math.sin(x / 2 + y))) % 4 === 0 ? 0 : y > 12 ? c(3) : c(2)) : undefined));
    circ(a, 18, 3, 2, c(1));
  } else if (p.style === "moon") {
    rect(a, 0, 0, 24, 18, c(3)); circ(a, 16, 5, 3.5, 0); circ(a, 17.5, 4, 3, c(3));
    for (let i = 0; i < 8; i++) px(a, hash(i, s) % 24, hash(s, i) % 10, c(1));
    rect(a, 0, 14, 24, 4, c(2)); for (let x = 2; x < 24; x += 5) rect(a, x, 11, 2, 3, c(2));
  } else {
    for (let i = 0; i < 6; i++) { const h = hash(i, s); rect(a, h % 18, (h >> 5) % 13, 3 + ((h >> 9) % 7), 3 + ((h >> 13) % 5), c(1 + ((h >> 17) % 3))); }
  }
  return a;
}

/* ---------- Rooms ----------
   Map legend: # wall top  ^ upper wall  v lower wall  . floor  = runner
               D/d doorway  S/s staff door  E front doors  B doorway in the bottom wall */
const ROOMS = {
  lobby: {
    name: "Lobby", art: { top: "lobby_wall_top", upper: "lobby_wall_upper", lower: "lobby_wall_lower", floor: "lobby_floor", runner: "lobby_runner" },
    map: [
      "###############",
      "#^^^^^^D^^^^S^#",
      "#vvvvvvdvvvvsv#",
      "#......=......#",
      "#......=......#",
      "#......=......#",
      "H......=......#",
      "#......=......#",
      "#......=......#",
      "#######E#######",
    ],
    spawn: [7, 8, "up"],
    windowAt: [3, 1],
    props: [
      { key: "sign_stand", x: 13, y: 6, say: ["GIFT SHOP AND CAFE", "Straight up the hall, in the middle of the museum. Souvenirs, coffee, and somewhere to sit."] },
      { key: "trash_can", x: 13, y: 4, event: { trash: true } },
      { key: "patron_board", x: 4, y: 8, tall: true, blockTop: true, event: { patronBoard: true } },
      { key: "front_desk", x: 2, y: 4, say: ["A guestbook lies open on the front desk.", "The first page is still blank."] },
      { key: "sign_stand", x: 9, y: 3, event: { directory: true } },
      { key: "plant", plant: "fern-left", name: "fern", x: 1, y: 3 },
      { key: "plant", plant: "fern-right", name: "other fern", x: 13, y: 3 },
      { key: "plant", plant: "rubber", name: "rubber plant", x: 1, y: 8 },
      { key: "plant", plant: "palm", name: "little palm", x: 13, y: 8 },
      { key: "bench", x: 10, y: 6, sit: "down", say: ["A bench for resting before the museum."] },
      { key: "sign_stand", x: 1, y: 5, say: ["TUTORIAL", "Staff training, through this door. Anyone's welcome to take it again."] },
    ],
    events: [
      { x: 7, y: 2, warp: ["museum", "@lobby", 0, "up"] },
      { x: 12, y: 2, staffDoor: true, warp: ["staff", 7, 8, "up"] },
      { x: 9, y: 2, eotm: true }, { x: 10, y: 2, eotm: true },
      { x: 7, y: 9, frontDoor: true, bump: true },
      { x: 3, y: 2, window: true }, { x: 4, y: 2, window: true },
      { x: 0, y: 6, tutorial: true, bump: true },
    ],
    stairs: [{ x: 13, y: 5, kind: "down", to: ["storage", 13, 5, "left"] }], // down to B1 Storage, where the café door used to be
    lightSwitch: [5, 2], intercom: [2, 2], exitTo: [7, 8],
    eotmAt: [9, 1],
    light: { dim: 0, spots: 0 }, // dim: how dark the room is with the lights on (0 to 0.8); spots: spotlight strength on pieces (0 to 1)
    mugSpots: [[5, 5], [11, 4], [3, 7], [9, 8], [12, 5]],
    catSpots: [[6, 7], [12, 7]],
    crowd: true,
    visitors: [{ sheet: "visitor_a", x: 4, y: 6, lines: [["I came in for the gift shop.", "Is it through there?"]] },
      { sheet: "usher", x: 3, y: 3, still: true, usher: true, lines: [["Welcome!"]] }],
  },
  /* The museum itself: one building, drawn from a blueprint (see "The museum's layout" below). Rooms and hallways are
     rectangles of floor; the walls, doorways and stairs are worked out from them, so the curator can drag a room bigger
     and its hallways stay attached. */
  museum: {
    name: "Museum", art: { top: "lobby_wall_top", upper: "lobby_wall_upper", lower: "lobby_wall_lower", floor: "lobby_floor" },
    layout: {
      hallArt: { top: "lobby_wall_top", upper: "lobby_wall_upper", lower: "lobby_wall_lower", floor: "lobby_floor" },
      rooms: [
        { id: "cafe", name: "Café and Gift Shop", x: 21, y: 17, w: 16, h: 10, art: { top: "shop_wall_top", upper: "shop_wall_upper", lower: "shop_wall_lower", floor: "shop_floor" }, light: true },
        { id: "puzzle", name: "Wolpaw Wing", x: 5, y: 6, w: 12, h: 10, art: { top: "gallery_wall_top", upper: "gallery_wall_upper", lower: "gallery_wall_lower", floor: "gallery_floor" }, light: true },
        { id: "strategy", name: "Meier Wing", x: 41, y: 6, w: 12, h: 10, art: { top: "g2_wall_top", upper: "g2_wall_upper", lower: "g2_wall_lower", floor: "g2_floor" }, light: true },
        { id: "action", name: "Nishikado Wing", x: 5, y: 29, w: 12, h: 10, art: { top: "g3_wall_top", upper: "g3_wall_upper", lower: "g3_wall_lower", floor: "g3_floor" }, light: true },
        { id: "story", name: "Roberta Williams Wing", x: 41, y: 29, w: 12, h: 10, art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "staff_floor" }, light: true },
      ],
      halls: [
        { id: "upper", name: "North Hall", path: [[15, 9], [42, 9]], width: 2, min: 24 },
        { id: "lower", name: "South Hall", path: [[14, 37], [42, 37]], width: 2, min: 24 },
        { id: "lobbyhall", name: "Lobby Hall", path: [[28, 37], [28, 45]], width: 2, min: 8 },
        { id: "cafe-south", name: "Café, south", path: [[28, 25], [28, 37]], width: 2, min: 0 },
        { id: "cafe-west", name: "Café, west", path: [[21, 21], [10, 21]], width: 2, min: 0 },
        { id: "cafe-north", name: "Café, north", path: [[28, 17], [28, 9]], width: 2, min: 0 },
        { id: "cafe-east", name: "Café, east", path: [[35, 21], [46, 21]], width: 2, min: 0 },
        { id: "puzzle-action", name: "West Hall", path: [[10, 14], [10, 29]], width: 2, min: 0 },
        { id: "strategy-story", name: "East Hall", path: [[46, 14], [46, 30]], width: 2, min: 0 },
      ],
      doors: [{ id: "lobby", zone: "lobbyhall", side: "bottom", at: 0, warp: ["lobby", 7, 3, "down"] }],
      stairs: [],
      spawn: "lobby",
    },
    light: { dim: 0, spots: 0 },
    visitors: [],
  },
  storage: {
    name: "B1  Storage", art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "staff_floor" },
    map: [
      "###############",
      "#^^^^^^^^^^^^^#",
      "#vvvvvvvvvvvvv#",
      "#.............#",
      "#.............#",
      "#.............H",
      "#.............#",
      "#.............#",
      "#.............#",
      "###############",
    ],
    spawn: [7, 4, "down"],
    stairs: [],
    glows: [[6, 5]],
    props: [
      { key: "storage_shelves", x: 2, y: 4, tall: true, blockTop: true, say: ["Shelves of boxed games, labeled in three different handwritings."] },
      { key: "storage_shelves", x: 10, y: 4, tall: true, blockTop: true, say: ["A shelf of spare frames, glass panes, and one lonely controller."] },
      { key: "workbench", x: 5, y: 6, event: { upcoming: true } },
      { key: "box_stack", x: 13, y: 4, tall: true, say: ["A box labeled ESCORT MISSIONS.", "\"Fragile. Handle with patience.\""] },
      { key: "box_stack", x: 2, y: 8, tall: true, say: ["A box labeled INVENTORY LIMITS.", "\"Some assembly required. Not all of it fits.\""] },
      { key: "box_stack", x: 12, y: 8, tall: true, say: ["A box labeled UNSKIPPABLE CUTSCENES.", "\"Do not open. It takes forever.\""] },
      { key: "box_stack", x: 9, y: 8, tall: true, say: ["A box labeled FALL DAMAGE.", "\"This side up. Seriously.\""] },
      { key: "trash_can", x: 4, y: 3, event: { trash: true } },
      { key: "someones_pc", x: 12, y: 3, event: { pc: true } },
    ],
    events: [{ x: 14, y: 5, warp: ["lobby", 13, 5, "left"] }],
    light: { dim: 0.35, spots: 0 },
    catSpots: [[12, 6]],
    visitors: [{ sheet: "shop_staff", x: 7, y: 7, still: true, staff: true, role: "conservator", lines: [
      ["I'm the conservator. These games came in without instructions.", "I'm figuring out what they wanted to be."],
      ["The boxes over there? Abandoned mechanics.", "There are no bad mechanics. Just ones that haven't found the right game yet."]] }],
  },
  staff: {
    name: "Staff Room", art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "staff_floor" },
    map: [
      "###############",
      "#^^^^^^^^^^^^^#",
      "#vvvvvvvvvvvvv#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#.............#",
      "#######B#######",
    ],
    spawn: [7, 8, "up"],
    lockers: [1, 2, 3, 4, 5, 6],
    catSpots: [[13, 3], [4, 8]],
    corkboardAt: [9, 1], leaderboardAt: [7, 1], timeClock: [12, 2],
    props: [
      { key: "whiteboard", x: 6, y: 6, rules: true },
      { key: "break_table", x: 2, y: 6, say: ["The break table. Someone left a half-finished crossword."] },
      { key: "coffee_counter", x: 9, y: 4, say: ["The staff coffee maker. It makes one cup at a time, slowly."], mugShelf: true },
      { key: "microwave_counter", x: 11, y: 4, event: { microwave: true } },
      { key: "fridge", x: 13, y: 4, tall: true, blockTop: true, event: { fridge: true } },
      { key: "collection_cabinet", x: 9, y: 7, tall: true, collection: true, blockTop: true },
      { key: "plant", plant: "staff-plant", name: "staff room spider plant", x: 13, y: 8 },
    ],
    events: [{ x: 7, y: 9, warp: ["lobby", 12, 3, "down"] }],
    light: { dim: 0, spots: 0 },
    visitors: [],
  },
  // The screening nook: a little theater off the café's east hallway. Sit down to watch an episode on the big screen.
  screening: {
    name: "Screening Nook",
    art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "carpet_floor" },
    tint: { floor: "#3a2430", wall: "#2c2630" },
    // The nook up top; below it, the long dark hallway from the marquee door (20 tiles, trash can alcoves, posters too dark
    // to make out, little lights along the floor). One room, so you walk straight in, and the episode has started loading
    // by the time the screen scrolls into view.
    map: [
      "############",
      "#^^^^^^^^^^#",
      "#vvvvvvvvvv#",
      "#..........#",
      "#..........#",
      "#..........#",
      "#..........#",
      "#..........#",
      "#####...####", "    #...#   ", "    #...#   ", "    #...#   ",
      "   #....#   ",                                 // a trash can alcove
      "    #...#   ", "    #...#   ", "    #...#   ", "    #...#   ",
      "    #....#  ",                                 // and another
      "    #...#   ", "    #...#   ", "    #...#   ", "    #...#   ",
      "   #....#   ",
      "    #...#   ", "    #...#   ", "    #...#   ", "    #...#   ", "    #...#   ",
      "    ##B##   ",
    ],
    spawn: [6, 27, "up"], screenAt: [3, 1], camAt: 0.75, // the camera keeps you low on the screen, so you see ahead (and the whole screen from the seats)
    props: [
      { key: "bench", x: 2, y: 4, sit: "up" }, { key: "bench", x: 8, y: 4, sit: "up" },
      { key: "bench", x: 2, y: 6, sit: "up" }, { key: "bench", x: 8, y: 6, sit: "up" },
      { key: "planter", x: 1, y: 3, say: ["A planter. It's seen every episode."] }, { key: "planter", x: 10, y: 3, say: ["A planter, facing the screen. Of course."] },
      { key: "trash_can", x: 4, y: 12, event: { trash: true } }, { key: "trash_can", x: 8, y: 17, event: { trash: true } }, { key: "trash_can", x: 4, y: 22, event: { trash: true } },
    ],
    posters: [[4, 9, "l"], [8, 10, "r"], [4, 15, "l"], [8, 13, "r"], [4, 18, "l"], [8, 20, "r"], [4, 24, "l"], [8, 24, "r"]],
    floorLights: [9, 11, 13, 15, 17, 19, 21, 23, 25, 27].flatMap(y => [[5, y, "l"], [7, y, "r"]]),
    events: [{ x: 6, y: 28, warp: ["museum", 40, 30, "down"] }],
    light: { dim: 0.4, spots: 0 },
    visitors: [],
  },
  // The tutorial (see "the tutorial" in the Game class): the staff office, then two small training rooms.
  tut_office: {
    name: "Staff Office", tutorial: true,
    art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "staff_floor" },
    map: [
      "#############",
      "#^^^^^^^^^D^#",
      "#vvvvvvvvvdv#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "######E######",
    ],
    spawn: [6, 8, "up"], intercom: [2, 2],
    props: [
      { key: "front_desk", x: 5, y: 4 },
      { key: "plant", plant: "tut-office-fern", name: "office fern", x: 1, y: 3 },
      { key: "plant", plant: "tut-office-palm", name: "office palm", x: 11, y: 8 },
    ],
    events: [{ x: 10, y: 2, tutDoor: "office-r1", bump: true }, { x: 6, y: 9, tutDoor: "glass", bump: true }],
    light: { dim: 0, spots: 0 },
    visitors: [{ sheet: "usher", x: 6, y: 3, still: true, usher: true, lines: [["Welcome!"]] }],
  },
  tut_room1: {
    name: "Training Room A", tutorial: true,
    art: { top: "gallery_wall_top", upper: "gallery_wall_upper", lower: "gallery_wall_lower", floor: "gallery_floor" },
    map: [
      "###########",
      "#^^^^D^^^^#",
      "#vvvvdvvvv#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#####B#####",
    ],
    spawn: [5, 8, "up"], lightSwitch: [2, 2],
    props: [ // planters block the purple game's front and the green game's back
      { key: "planter_wide", x: 2, y: 6, say: ["A long planter, right in front of the purple case.", "You can't read this side from here."] }, // its right half blocks the front
      { key: "planter_wide", x: 7, y: 4, say: ["A long planter, pushed right up behind the green case.", "No reading the back of this one."] }, // half of it shows past the case
    ],
    events: [{ x: 5, y: 2, tutDoor: "r1-r2", bump: true }, { x: 5, y: 9, tutDoor: "r1-office", bump: true }],
    light: { dim: 0, spots: 0.5 },
    visitors: [],
  },
  tut_room2: {
    name: "Training Room B", tutorial: true,
    art: { top: "gallery_wall_top", upper: "gallery_wall_upper", lower: "gallery_wall_lower", floor: "gallery_floor" },
    map: [
      "#########",
      "#^^^^^^^#",
      "#vvvvvvv#",
      "#.......#",
      "#.......#",
      "#.......#",
      "#.......#",
      "####B####",
    ],
    spawn: [4, 6, "up"], lightSwitch: [2, 2],
    props: [
      { key: "plant", plant: "tut-room2-fern", name: "fern", x: 7, y: 3 },
      { key: "bench", x: 1, y: 5, sit: "right", say: ["A bench for waiting on a recommendation."] },
    ],
    events: [{ x: 4, y: 7, tutDoor: "r2-r1", bump: true }],
    light: { dim: 0, spots: 0.5 },
    visitors: [],
  },
};
const TUT_ROOMS = ["tut_office", "tut_room1", "tut_room2"];
/* The note card's keyboard for controllers: three rows of ten, then Caps, ', Space, Delete and Done. col/span place it on the grid. */
const NOTE_KEYS = [..."abcdefghijklmnopqrstuvwxyz.,!?"].map((k, i) => ({ k, col: i % 10, span: 1 }))
  .concat([{ k: "CAPS", label: "Caps", col: 0, span: 2 }, { k: "'", col: 2, span: 1 }, { k: " ", label: "Space", col: 3, span: 3 }, { k: "DEL", label: "Del", col: 6, span: 2 }, { k: "DONE", label: "Done", col: 8, span: 2 }]);
/* The ten starting shirt colors for visitors (Visitors tab). */
const SHIRT_COLORS = ["#c83838", "#e07830", "#e8c040", "#58a048", "#3a9a98", "#3a68c8", "#8850c0", "#e070a8", "#8a5a34", "#808898"];
/* The tutorial's three games, in a row: just a color each. A planter blocks purple's front and another green's back;
   red stands free. Their words are in Words, Tutorial. */
const TUT_GAMES = [
  { id: "tut-purple", key: "purple", color: "purple", colors: ["red", "blue", "purple"], art: "#8a4ad0", room: "tut_room1", x: 3, y: 5 },
  { id: "tut-red", key: "red", color: "red", colors: ["red"], art: "#d84040", room: "tut_room1", x: 5, y: 5 },
  { id: "tut-green", key: "green", color: "green", colors: ["green"], art: "#48a850", room: "tut_room1", x: 7, y: 5 },
];
const TUT_SPOTS = { r1Exit: [5, 8], glass: [6, 8], office: { rosie: [3, 6], skye: [9, 6], onyx: [8, 8] } };

/* ---------- Words ----------
   Every line the museum says (that isn't already part of a piece, a room or a shop item) lives here, so the curator's Words tab can change it.
   Each entry is a list of variants; each variant is a list of pages. When there are several variants, they take turns (or one is picked at random).
   Placeholders: {name} (who's clocked in, or "friend"), {cat}, {catRoom}, {title}, {date}, {drink}, {n}, {room}, {hint}, {floor}, {locker}. */
const TEXT = {
  "case.empty":        { g: "Pieces", l: "Empty display case", v: [["An empty display case, waiting for a game."]] },
  "case.covered":      { g: "Pieces", l: "Case under a cloth (unveiling soon)", v: [["Something is under a cloth in this case.", "The card says it will be unveiled on {date}."]] },
  "painting.covered":  { g: "Pieces", l: "Painting under a sheet (unveiling soon)", v: [["Something is hanging under a sheet.", "The card says it will be unveiled on {date}."]] },
  "case.ends":         { g: "Pieces", l: "Reading a case from the side", v: [["The placards are on the front and the back. Walk around to read them."]] },
  "case.obsLabel":     { g: "Pieces", l: "Heading over the observation (one line)", v: [["THE CURATOR'S OBSERVATION"]] },
  "case.obsNote":      { g: "Pieces", l: "Under every observation: whose view it is", v: [["(These are my own impressions as the curator, from playing it myself. Not the developer's view, and not a verdict on the game.)"]] },
  "case.intLabel":     { g: "Pieces", l: "Heading over the developer's intention (one line)", v: [["THE DEVELOPER'S INTENTION"]] },
  "tut.hello":         { g: "Tutorial", l: "The usher, when you reach the desk (the last page asks for your badge)", v: [["Oh, hey! You must be the new hire.", "I'm happy to train you.", "First things first: can I get your badge number and key code?"]] },
  "tut.already":       { g: "Tutorial", l: "The usher, if you're already clocked in ({name})", v: [["Oh, hey, {name}! You're already clocked in, so we can skip the paperwork."]] },
  "tut.badgeOk":       { g: "Tutorial", l: "The usher, after a badge works", v: [["Perfect. You're all signed in."]] },
  "tut.patreon":       { g: "Tutorial", l: "The usher, if you don't have a badge", v: [["Oh. Aren't you a Patreon member?"]] },
  "tut.volunteer":     { g: "Tutorial", l: "The usher, if you're not a Patreon member", v: [["Oh. Well, that's okay. You don't need a badge to do training.", "You'll just be a volunteer."]] },
  "tut.email":         { g: "Tutorial", l: "The usher, if you're a Patreon member without a badge (the last page asks)", v: [["Email info@gamesover.coffee and tell them you're a Patreon member and need a code.", "You wanna continue?"]] },
  "tut.go":            { g: "Tutorial", l: "The usher sends you in (a page of just ... is a pause)", v: [["Just step right into that door there.", "...", "What?", "Oh yeah, I'm training you. But you'll be by yourself.", "...", "Yeah, well, the curator thinks gamification is the best way to train people.", "So off you go."]] },
  "tut.usher.wait":    { g: "Tutorial", l: "The usher, if you try the door before signing in", v: [["Hang on! Let's get you signed in first."]] },
  "tut.usher.go":      { g: "Tutorial", l: "The usher, while you're training", v: [["Go on, the door's right over there."]] },
  "tut.usher.feedback": { g: "Tutorial", l: "The usher, while your visitors wait to tell you about their games", v: [["Sounds like your visitors have some thoughts. Go hear them out!"]] },
  "tut.usher.closing": { g: "Tutorial", l: "The usher, before the closing announcement", v: [["The intercom's on the wall. Go on, make the announcement."]] },
  "tut.usher.lights":  { g: "Tutorial", l: "The usher, while you turn off the lights", v: [["Lights off in both training rooms, then you're free to go."]] },
  "tut.speaker":       { g: "Tutorial", l: "The speaker crackling on (before each speaker line)", v: [["*krrst* ...ding dong..."]] },
  "tut.locked":        { g: "Tutorial", l: "A locked door", v: [["It's locked."]] },
  "tut.lockedStart":   { g: "Tutorial", l: "The speaker, when you try the way you came in", v: [["Yeah, ok, don't panic. This is part of the training."]] },
  "tut.unlocked":      { g: "Tutorial", l: "The far door unlocking (one line)", v: [["*click* The far door unlocked."]] },
  "tut.recommendFirst": { g: "Tutorial", l: "The speaker, when you try a door with visitors still waiting", v: [["You've still got visitors waiting on a recommendation. Help them out first."]] },
  "tut.ask":           { g: "Tutorial", l: "A visitor asking for a game ({color}; the last page asks to follow)", v: [["Oh! Do you work here?", "Could you recommend me a game? I'm in the mood for... a {color} game."]] },
  "tut.follow":        { g: "Tutorial", l: "A visitor, following you", v: [["Lead the way!"]] },
  "tut.remind":        { g: "Tutorial", l: "A visitor, reminding you what they want ({color})", v: [["I'm looking for a {color} game."]] },
  "tut.oneAtATime":    { g: "Tutorial", l: "Trying to lead two visitors at once", v: [["One visitor at a time! Finish helping the one you're with first."]] },
  "tut.thanks":        { g: "Tutorial", l: "A visitor, after your recommendation ({title})", v: [["Ooh, {title}? I'll go check it out. Thanks!"]] },
  "tut.loved":         { g: "Tutorial", l: "A visitor who got their color ({title}, {color})", v: [["I LOVED {title}! It was so {color}!"]] },
  "tut.liked":         { g: "Tutorial", l: "A visitor whose color was in it, but wasn't the point ({title}, {color})", v: [["{title} was pretty good. There was some {color} in it, at least."]] },
  "tut.nope":          { g: "Tutorial", l: "A visitor whose color wasn't in it at all ({title}, {color})", v: [["Hmm. {title} didn't have anything {color} in it at all..."]] },
  "tut.after":         { g: "Tutorial", l: "A visitor, after telling you", v: [["Thanks again for the recommendation!"]] },
  "tut.closeUp":       { g: "Tutorial", l: "The speaker, after every visitor has told you", v: [["Nice work! That's pretty much the job.", "Last thing: make the closing announcement on the intercom, then turn off the lights in both training rooms before you head out."]] },
  "tut.intercomEarly": { g: "Tutorial", l: "The intercom, before it's time", v: [["The office intercom. Not yet, though."]] },
  "tut.announce":      { g: "Tutorial", l: "The tutorial's closing announcement", v: [["*ding-dong*", "Attention, visitors: the museum is closing for the night. Thanks for coming!"]] },
  "tut.lightsEarly":   { g: "Tutorial", l: "A light switch, before it's time", v: [["Better leave the lights on while there's still training to do."]] },
  "tut.allDark":       { g: "Tutorial", l: "Both training rooms dark", v: [["That's both rooms. Head out the glass door when you're ready."]] },
  "tut.lightsFirst":   { g: "Tutorial", l: "The speaker, at the glass door with lights still on", v: [["Lights, please! Both training rooms, before you go."]] },
  "tut.waitVisitors":  { g: "Tutorial", l: "The glass door while visitors are still leaving", v: [["Let the visitors head out first."]] },
  "tut.notYet":        { g: "Tutorial", l: "The glass door in the middle of training", v: [["You can't leave in the middle of training!"]] },
  "tut.done":          { g: "Tutorial", l: "The speaker, as you leave", v: [["And that's training! Welcome to the team.", "The museum's all yours."]] },
  "tut.welcome":       { g: "Tutorial", l: "Arriving in the lobby after training", v: [["Welcome to the GOQ Museum."]] },
  "tut.photo":         { g: "Tutorial", l: "Taking your first photo in the tutorial", v: [["Oh yeah, you can take photos.", "They don't help you here, though."]] },
  "tut.door":          { g: "Tutorial", l: "The lobby's Tutorial door", v: [["A door marked TUTORIAL. Take the training again?"]] },
  "tut.red.title":     { g: "Tutorial", l: "The red game's title", v: [["Big Red Racer"]] },
  "tut.red.front":     { g: "Tutorial", l: "The red game's front placard", v: [["This game has a lot of red stuff. There's red cars, red roads, and red trees."]] },
  "tut.red.back":      { g: "Tutorial", l: "The red game's back placard", v: [["The developer wanted it to feel like the reddest game ever made: red skies, red music (somehow), red everything."]] },
  "tut.purple.title":  { g: "Tutorial", l: "The purple game's title", v: [["Twilight Garden"]] },
  "tut.purple.front":  { g: "Tutorial", l: "The purple game's front placard (blocked, so nobody reads it)", v: [["This game has red stuff and blue stuff: red apples, blue rivers, and red birds flying through blue skies."]] },
  "tut.purple.back":   { g: "Tutorial", l: "The purple game's back placard", v: [["The developer wanted red things and blue things to mix until the whole game felt purple: red apples, blue rivers, red birds in blue skies."]] },
  "tut.green.title":   { g: "Tutorial", l: "The green game's title", v: [["Meadow Mayhem"]] },
  "tut.green.front":   { g: "Tutorial", l: "The green game's front placard", v: [["This game has a lot of green stuff. There's green hills, green frogs, and green trees."]] },
  "tut.green.back":    { g: "Tutorial", l: "The green game's back placard (blocked, so nobody reads it)", v: [["The developer wanted every corner of it to feel fresh and green, like a spring morning."]] },
  "patron.enjoyed":    { g: "Staff", l: "A Patreon member mentioning a game they enjoyed ({title}: a random game; one picked at random)", v: [["I played {title} last week. Really enjoyed it."], ["Have you tried {title}? I keep thinking about it."], ["{title} was so good. No notes."], ["I finally got around to {title}. Worth it."], ["Okay, {title}. Why didn't anyone tell me sooner?"]] },
  "screen.guest":      { g: "Screening nook", l: "Someone sitting in the screening nook (takes turns)", v: [["Shh. It's getting to the good part."], ["I've seen this one four times."], ["The host talks fast. I like it."], ["Is there popcorn? There should be popcorn."], ["I came in for five minutes. That was an hour ago."]] },
  "screen.ask":        { g: "Screening nook", l: "Sitting down or looking at the screen ({title}: what's playing this hour)", v: [["Now playing: {title}. Stay for it?"]] },
  "screen.marquee":    { g: "Screening nook", l: "The red LED sign out front, before the title (letters, numbers and : - . ! ? ' & , / only)", v: [["NOW PLAYING:"]] },
  "screen.sign":       { g: "Screening nook", l: "Looking at the LED sign out front ({title}: what's playing this hour)", v: [["NOW PLAYING: {title}.", "It changes every hour. The sign is very proud of this."]] },
  "screen.enter":      { g: "Screening nook", l: "The little notice walking in ({title})", v: [["Now playing: {title}"]] },
  "hall.poster":       { g: "Screening nook", l: "Looking at a movie poster in the dark theater hallway (picks one at random)", v: [["[Movie poster in the dark hallway: too dark to make out, so describe what you can almost see]"]] },
  "arcade.title":      { g: "Arcade", l: "The arcade cabinet's list title", v: [["INSERT COIN"]] },
  "arcade.intro":      { g: "Arcade", l: "Walking up to the arcade cabinet ({n}: tokens per play)", v: [["[Arcade intro: what the cabinet is, that it opens a museum game in a new tab, and that a play costs {n} token(s)]"]] },
  "arcade.free":       { g: "Arcade", l: "Walking up to the arcade cabinet when plays are free (Gift shop: arcade price 0)", v: [["[Arcade intro when it's free: what the cabinet is, and that it opens a museum game in a new tab]"]] },
  "arcade.broke":      { g: "Arcade", l: "Not enough tokens to play ({n}: tokens per play, {have}: tokens you have)", v: [["[Not enough tokens: a play costs {n}, you have {have}; chores earn tokens]"]] },
  "arcade.go":         { g: "Arcade", l: "Starting a game ({title})", v: [["[Starting a game: the token goes in and {title} opens in a new tab]"]] },
  "arcade.blocked":    { g: "Arcade", l: "The browser blocked the new tab ({title})", v: [["The cabinet blinks. Tap PLAY to start {title}."]] },
  "arcade.none":       { g: "Arcade", l: "No games with a Play link", v: [["The screen says GAME OVER. It's been saying that all day."]] },
  "screen.none":       { g: "Screening nook", l: "No episodes to show", v: [["Nothing's queued up. The screen just hums."]] },
  "screen.look":       { g: "Screening nook", l: "Looking at the screen", v: [["The big screen. Have a seat to watch something."]] },
  "react.startled":    { g: "Photo reactions", l: "Someone looking at a piece: startled, then a peace sign ({who})", v: [["{who} jumped, then threw up a peace sign."]] },
  "react.snapback":    { g: "Photo reactions", l: "Someone taking their own photo: they photograph you back ({who})", v: [["{who} took a photo of you right back."]] },
  "react.pose":        { g: "Photo reactions", l: "Someone walking around: they stop and pose ({who})", v: [["{who} stopped and struck a pose."]] },
  "react.wave":        { g: "Photo reactions", l: "Someone sitting down: a little wave ({who})", v: [["{who} gave you a little wave."]] },
  "react.shy":         { g: "Photo reactions", l: "A curious visitor waiting for a recommendation: shy ({who})", v: [["{who} got shy and hid their face."]] },
  "react.heart":       { g: "Photo reactions", l: "Someone following you: a heart ({who})", v: [["{who} made a little heart with their hands."]] },
  "react.bow":         { g: "Photo reactions", l: "The usher: a polite bow ({who})", v: [["{who} gave a polite little bow."]] },
  "react.busy":        { g: "Photo reactions", l: "The conservator: too busy to look up ({who})", v: [["{who} didn't even look up. Busy."]] },
  "react.guard":       { g: "Photo reactions", l: "The night guard, startled ({who})", v: [["{who} jumped. \"Oh! It's just you.\""]] },
  "react.annoyed":     { g: "Photo reactions", l: "The third photo of the same person in a row ({who})", v: [["{who} sighed. \"Okay, that's enough photos.\""]] },
  "note.anon":         { g: "Visitor notes", l: "Heading over a visitor's note without a name", v: [["A VISITOR'S NOTE"]] },
  "note.from":         { g: "Visitor notes", l: "Heading over a visitor's note with a name ({who})", v: [["A NOTE FROM {who}"]] },
  "note.mine":         { g: "Visitor notes", l: "On the placard while your own note waits for the curator", v: [["(Your note is with the curator. It shows up here once they've read it.)"]] },
  "note.prompt":       { g: "Visitor notes", l: "At the top of the note card ({title})", v: [["How did {title} make you feel? The curator reads every note before it goes up."]] },
  "note.empty":        { g: "Visitor notes", l: "Sending an empty note", v: [["Write a few words first."]] },
  "note.thanks":       { g: "Visitor notes", l: "After sending a note", v: [["You tucked your note into the little card holder under the placard.", "The curator will read it soon."]] },
  "note.slow":         { g: "Visitor notes", l: "Too many notes at once", v: [["The card holder is full for now. Try again a little later."]] },
  "note.fail":         { g: "Visitor notes", l: "A note that didn't send", v: [["Your note didn't send. Check your connection and try again."]] },
  "case.frontNote":    { g: "Pieces", l: "After the front placard", v: [["(The developer's intention is on the other side of the case.)"]] },
  "case.backNote":     { g: "Pieces", l: "After the back placard", v: [["(The curator's observation is on the other side of the case.)"]] },
  "intercom.ask":      { g: "Closing up", l: "Intercom question", v: [["The intercom. Make the closing announcement?"]] },
  "intercom.announce": { g: "Closing up", l: "Closing announcement", v: [["*ding-dong*", "Attention, visitors: the museum is closing for the night.", "Please make your way to the exit. Thank you for visiting!"]] },
  "intercom.again":    { g: "Closing up", l: "Intercom after announcing", v: [["The announcement already went out."]] },
  "lights.early":      { g: "Closing up", l: "Lights off before announcing (takes turns)", v: [["Click. From somewhere in the dark: \"Hey!\"", "You flick the lights right back on."], ["Click. A visitor keeps reading the placard by phone light.", "You turn the lights back on. Maybe announce closing first."], ["Click. Someone gasps like it's part of the exhibit.", "Click. Sorry, sorry."]] },
  "lights.wait":       { g: "Closing up", l: "Lights off while visitors leave", v: [["Hang on, a few people are still on their way out."]] },
  "lights.closed":     { g: "Closing up", l: "Every light is off", v: [["That's every light.", "The museum is closed for the night. Head out the front doors."]] },
  "door.open":         { g: "Closing up", l: "Front doors while open", v: [["The museum just opened.", "Stay a while."]] },
  "door.lockUp":       { g: "Closing up", l: "Front doors with lights still on ({rooms} lists them)", v: [["The lights are still on in: {rooms}.", "Turn them off before you lock up."]] },
  "spooky.intercom":   { g: "Closing up", l: "The intercom crackles by itself", v: [["*krrsh*", "...ding......\n.........dong...", "*krrsh*"]] },
  "stairs.roof":       { g: "Floors", l: "Stairs to the roof (if a room has some)", v: [["I don't need to go to the roof."]] },
  "move.ok":           { g: "Visitors", l: "A visitor stepping aside when you ask (one at random)", v: [["Oh! Sorry, go ahead."], ["My bad. All yours."], ["Oops, didn't see you there."]] },
  "move.stuck":        { g: "Visitors", l: "A boxed-in visitor, before they teleport (one at random)", v: [["Oh, I'd love to, but I'm a little stuck..."], ["Move? Where? There's nowhere to... oh."]] },
  "move.teleport":     { g: "Visitors", l: "You, after a boxed-in visitor teleports away (one at random)", v: [["...Did they just teleport?", "I'm going to pretend I didn't see that."], ["They're gone. Just gone.", "I should ask the curator what's in the coffee here."], ["*blink*", "Okay. Sure. People can just do that here, apparently."], ["Huh. I've played games with worse pathfinding."]] },
  "workbench.empty":   { g: "Floors", l: "Workbench with nothing coming", v: [["The conservation workbench. Tools, gloves, a magnifying lamp.", "Nothing new in the pipeline... yet."]] },
  "workbench.intro":   { g: "Floors", l: "Workbench, before the list of crates", v: [["The conservation workbench. Crates waiting to go upstairs:"]] },
  "window.day":        { g: "Lobby", l: "Window, daytime", v: [["Sunlight pours in. A perfect museum day."]] },
  "window.sunset":     { g: "Lobby", l: "Window, sunset", v: [["The sky is going orange and pink.", "Closing time isn't far off."]] },
  "window.night":      { g: "Lobby", l: "Window, night", v: [["It's dark out. The moon is keeping an eye on the museum."]] },
  "guestbook.empty":   { g: "Lobby", l: "Guestbook with no entries", v: [["A guestbook lies open on the front desk.", "The first page is still blank."]] },
  "guestbook.intro":   { g: "Lobby", l: "Guestbook, before the entries", v: [["A guestbook lies open on the front desk."]] },
  "eotm.empty":        { g: "Staff", l: "Employee of the Month, no winner", v: [["EMPLOYEE OF THE MONTH", "The frame is empty. Maybe it'll be you."]] },
  "cork.intro":        { g: "Staff", l: "Corkboard, before the notes", v: [["The corkboard. Notes for upcoming episodes, in the curator's handwriting."]] },
  "board.title":       { g: "Staff", l: "Staff leaderboard, heading ({month})", v: [["STAFF LEADERBOARD: {month}"]] },
  "board.empty":       { g: "Staff", l: "Staff leaderboard, nobody yet", v: [["Nobody has any points this month yet.", "Clock in and do a chore to get on the board."]] },
  "board.offline":     { g: "Staff", l: "Staff leaderboard, staff office not set up", v: [["The board is blank. The staff office isn't open yet, so only this browser keeps a tally."]] },
  "board.down":        { g: "Staff", l: "Staff leaderboard, can't reach the staff office", v: [["The board is blank today. The staff office must be closed.", "Chores won't count toward the board until it opens again."]] },
  "board.you":         { g: "Staff", l: "Staff leaderboard, your place ({rank}, {points})", v: [["You're number {rank} with {points} points."]] },
  "eotm.auto":         { g: "Staff", l: "Employee of the Month, picked from last month ({name}, {points}, {month})", v: [["EMPLOYEE OF THE MONTH", "{name}. Top of the staff in {month} with {points} points."]] },
  "eotm.sofar":        { g: "Staff", l: "Employee of the Month, nobody last month ({name}, {points}, {month})", v: [["EMPLOYEE OF THE MONTH", "{name}, leading {month} so far with {points} points."]] },
  "badge.wrong":       { g: "Staff", l: "Badge number or key not right", v: [["That badge didn't work. Check the number and key."]] },
  "badge.locked":      { g: "Staff", l: "Badge locked after too many tries", v: [["Too many tries with that badge. Wait 15 minutes, then try again."]] },
  "badge.inactive":    { g: "Staff", l: "Badge turned off", v: [["That badge has been turned off. Ask the curator if that's a mistake."]] },
  "badge.down":        { g: "Staff", l: "Can't reach the staff office to check a badge", v: [["Couldn't reach the staff office. Check your connection, or try again later."]] },
  "badge.expired":     { g: "Staff", l: "Clocked out because the badge stopped working", v: [["The staff office didn't recognize your badge anymore, so you've been clocked out.", "Clock in again with your badge number and key."]] },
  "net.down":          { g: "Staff", l: "Notice: chores can't reach the staff office", v: [["Staff office unreachable: chores won't count for now"]] },
  "cork.empty":        { g: "Staff", l: "Corkboard with no notes", v: [["The corkboard is bare. Just pins."]] },
  "rules":             { g: "Staff", l: "Staff rules whiteboard", v: [["STAFF RULES", "1. Clock in at the staff door or the time clock. The ON SHIFT tag means you're working.", "2. On shift, every chore is a point: dusting, straightening, watering, finding the mug, wiping cases. A visitor who loves your recommendation, and closing up, are worth 3.", "3. Chores earn tokens for the gift shop, and staff tallies decide Employee of the Month.", "4. Clock out at the time clock. Leaving at closing clocks you out too.", "5. Do not touch anyone's yogurt."]] },
  "locker.mine":       { g: "Staff", l: "Your locker", v: [["Locker {locker}: {name}.", "Just your coat in here. Your gift shop finds are on display in the collection cabinet."]] },
  "locker.others":     { g: "Staff", l: "Other lockers (one per locker, in order)", v: [["A sticky note: \"Do not touch my yogurt.\""], ["Locked. It hums faintly."], ["Someone taped a pixel-art cat to this one."], ["Empty. It smells like old coffee."], ["A note in big letters: \"WAIT. WHY DID THAT HAPPEN?\""], ["Locked. There's a dent shaped like a controller."]] },
  "clock.out":         { g: "Staff", l: "Clocking out", v: [["You clock out. See you next shift, {name}.", "Chores won't count toward your staff tally until you clock in again."]] },
  "clock.curator":     { g: "Staff", l: "Time clock in curator mode", v: [["The time clock.", "You're the curator. You don't need to clock in."]] },
  "cabinet.empty":     { g: "Staff", l: "Collection cabinet, nothing bought yet", v: [["The collection cabinet. Glass shelves, waiting for things.", "Whatever you buy at the gift shop goes on display here."]] },
  "cabinet.intro":     { g: "Staff", l: "Collection cabinet, before the list", v: [["The collection cabinet. Everything you've bought at the gift shop, on display."]] },
  "plant.water":       { g: "Chores", l: "Watering a plant", v: [["You water the {room}.", "It perks right up."]] },
  "plant.done":        { g: "Chores", l: "Plant already watered", v: [["The {room} has had enough water for today."]] },
  "mug.found":         { g: "Chores", l: "Finding the curator's mug", v: [["The curator's coffee mug, left behind again.", "It's still warm. You put it back in the staff room."]] },
  "cat.pet":           { g: "The cat", l: "Petting the cat (takes turns)", v: [["You pet {cat}.", "Purrrrr. Back to sleep."], ["{cat} stretches, blinks at you, and curls up tighter."], ["You scratch {cat} behind the ears.", "A tiny, approving mrrp."]] },
  "bench.wake":        { g: "Sitting", l: "Waking up on a bench", v: [["You wake up with a start.", "How long were you out?"]] },
  "drink.served":      { g: "Café", l: "Barista hands you a drink", v: [["Here's your {drink}. Careful, it's hot.", "Grab a seat if you like."]] },
  "drink.finished":    { g: "Café", l: "Last sip", v: [["You finish your {drink}. Lovely.", "Now you're holding an empty cup."]] },
  "drink.refill":      { g: "Café", l: "Refill", v: [["Here you go. Refills are on the house."]] },
  "drink.noRefill":    { g: "Café", l: "Turning down a refill", v: [["The bus tub is at the end of the counter."]] },
  "drink.still":       { g: "Café", l: "Ordering while you still have one", v: [["You've still got your {drink}.", "Find a seat and enjoy it."]] },
  "bin.tub":           { g: "Café", l: "Empty cup into the bus tub", v: [["You set the cup in the bus tub. Clink."]] },
  "bin.trash":         { g: "Café", l: "Empty cup into a trash can", v: [["You drop the cup in the trash. Thunk."]] },
  "bin.full":          { g: "Café", l: "Bin while your drink isn't finished", v: [["Finish your {drink} first."]] },
  "bin.lookTub":       { g: "Café", l: "Looking at the bus tub", v: [["A bus tub full of cups waiting to be washed."]] },
  "bin.lookTrash":     { g: "Café", l: "Looking at a trash can", v: [["A trash can. Mostly napkins and one sad receipt."]] },
  "cafe.closed":       { g: "Café", l: "Café after closing", v: [["The café is closed. The espresso machine is cooling down."]] },
  "shop.closed":       { g: "Gift shop", l: "Counter after closing", v: [["The register is closed for the night.", "Nobody's behind the counter."]] },
  "shop.bye":          { g: "Gift shop", l: "Leaving the shop menu", v: [["Thanks for stopping by!"]] },
  "rack.empty":        { g: "Gift shop", l: "A stand with nothing for sale", v: [["A stand of little knickknacks.", "Nothing on this one is for sale. They're just here to keep you company."]] },
  "rack.available":    { g: "Gift shop", l: "Stand close-up: for sale", v: [["{n} tokens. Available to buy at the counter up front."]] },
  "cur.hello":         { g: "Curious visitors", l: "When you walk up to them (takes turns)", v: [["Oh, hello!"], ["Oh! Hi there."], ["Hm? Oh, hello!"]] },
  "cur.help":          { g: "Curious visitors", l: "After \"Do you need help?\" (what they're looking for comes next, from their mindset)", v: [["Actually, yes! My name is {name}, and I was looking for a game recommendation."]] },
  "cur.busy":          { g: "Curious visitors", l: "After \"Sorry, I'm busy.\"", v: [["Oh, no worries! I'll keep looking around."]] },
  "cur.also":          { g: "Curious visitors", l: "Before the second thing they like (joined to that line)", v: [["Oh, and"]] },
  "cur.follow":        { g: "Curious visitors", l: "They start following you", v: [["Lead the way! I'm right behind you."]] },
  "cur.lead":          { g: "Curious visitors", l: "Talking to them while they follow you", v: [["Where are we headed?"]] },
  "cur.remind":        { g: "Curious visitors", l: "You ask what they were looking for again (what they want comes next)", v: [["Oh, right! Like I said:"], ["Sure! I'm after this:"]] },
  "cur.release":       { g: "Curious visitors", l: "You tell them never mind", v: [["No worries. I'll keep looking around."]] },
  "cur.staffOnly":     { g: "Curious visitors", l: "You go into the staff room while they follow you", v: [["(From the other side of the door:) Staff only? I'll wait right here!"]] },
  "cur.closing":       { g: "Curious visitors", l: "Closing time while they follow you", v: [["Oh! Closing time already?", "I'll come back tomorrow. Save me a good one!"]] },
  "cur.recommend":     { g: "Curious visitors", l: "Question: recommend this piece?", v: [["Recommend {title} to {name}?"]] },
  "cur.unread":        { g: "Curious visitors", l: "Question: recommend a case you haven't read both sides of?", v: [["You haven't read both sides of {title} yet. Recommend it to {name} anyway?"]] },
  "cur.unreadNote":    { g: "Curious visitors", l: "Question: recommend a painting whose note you haven't read?", v: [["You haven't read the note on {title} yet. Recommend it to {name} anyway?"]] },
  "cur.thanks":        { g: "Curious visitors", l: "After you recommend a piece", v: [["Ooh, {title}. I'll try it tonight!", "I'll come back and tell you how it went."]] },
  "cur.back":          { g: "Curious visitors", l: "Coming back the next day ({hint} is \", the one where...\" from the piece)", v: [["Hey, it's me, {name}! I tried {title}{hint}."]] },
  "cur.beat":          { g: "Curious visitors", l: "The pause before they say what they thought (takes turns)", v: [["And honestly..."], ["So..."], ["Okay, so..."]] },
  "cur.liked":         { g: "Curious visitors", l: "Next day, about a game with no mindsets ticked", v: [["It was pretty good! Not my favorite, but I'm glad I tried it."]] },
  "cur.loved":         { g: "Curious visitors", l: "Next day: loved it, if their mindset has no lines of its own", v: [["I loved it. Thank you so much!"]] },
  "cur.nope":          { g: "Curious visitors", l: "Next day: not for them, if their mindset has no lines of its own", v: [["Honestly, it wasn't really for me. Thanks for trying, though!"]] },
  "cur.after":         { g: "Curious visitors", l: "Talking to them again after they told you (takes turns)", v: [["Thanks again for the recommendation!"], ["I might come ask you for another one sometime."]] },
  "pc.boot":           { g: "Storage", l: "Turning on Someone's PC (before the stats)", v: [["Someone's PC whirs to life.", "There's one program on the desktop: PLAYER_STATS.EXE. It's about you. Somehow."]] },
  "end.stats":         { g: "Closing up", l: "On the closing screen, after a few of your stats", v: [["All your stats are on the old PC in the basement."]] },
  "title.cat":         { g: "Staff profile titles", l: "Petting the cat a lot (variants take turns by day)", v: [["Cat Person (Diagnosed)"], ["Allergies Be Damned"]] },
  "title.naps":        { g: "Staff profile titles", l: "Bench naps", v: [["Narcoleptic Intern"], ["Sleeps on the Job, Literally"]] },
  "title.closer":      { g: "Staff profile titles", l: "Closing the museum often", v: [["Night Shift Goblin"], ["Turns Off Lights Professionally"]] },
  "title.matchmaker":  { g: "Staff profile titles", l: "Recommendations visitors loved", v: [["Matchmaker"], ["Knows What You Want Better Than You"]] },
  "title.wrong":       { g: "Staff profile titles", l: "Recommendations that missed", v: [["Confidently Wrong"], ["Taste Is Subjective, Apparently"]] },
  "title.paparazzo":   { g: "Staff profile titles", l: "Lots of photos", v: [["Paparazzo"], ["Has 400 Photos of a Bench"]] },
  "title.creep":       { g: "Staff profile titles", l: "Photographing the same person over and over", v: [["Kind of a Creep, Honestly"]] },
  "title.walls":       { g: "Staff profile titles", l: "Walking into walls ({n}: how many times)", v: [["Walls: {n}, You: 0"], ["Spatially Challenged"]] },
  "title.intern":      { g: "Staff profile titles", l: "Dusting, straightening, wiping, watering", v: [["Unpaid Intern"], ["Clean Freak (Derogatory)"]] },
  "title.nerd":        { g: "Staff profile titles", l: "Reading (nearly) every placard", v: [["Reads the Placards. All of Them."], ["Nerrrrrd"]] },
  "title.vibes":       { g: "Staff profile titles", l: "Visiting a lot, reading almost nothing", v: [["Here for the Vibes"], ["Skims"]] },
  "title.caffeine":    { g: "Staff profile titles", l: "Lots of drinks", v: [["Over-Caffeinated"], ["The Barista Knows Your Name. Not in a Good Way."]] },
  "title.mug":         { g: "Staff profile titles", l: "Finding the curator's mug", v: [["Mug Bloodhound"]] },
  "title.fire":        { g: "Staff profile titles", l: "The microwave", v: [["Fire Hazard"]] },
  "title.segway":      { g: "Staff profile titles", l: "Segway rides", v: [["Segway Menace"]] },
  "title.dark":        { g: "Staff profile titles", l: "Time in the dark after closing", v: [["Afraid of Nothing (Lying)"]] },
  "title.laps":        { g: "Staff profile titles", l: "Lots of steps", v: [["Walks Laps for Fun"]] },
  "title.streak":      { g: "Staff profile titles", l: "Visiting days in a row", v: [["Lives Here Now"], ["Please Go Outside"]] },
  "title.notes":       { g: "Staff profile titles", l: "Leaving notes", v: [["Has Opinions"]] },
  "title.shirt":       { g: "Staff profile titles", l: "Having the GOQ shirt", v: [["Big Goron Energy"]] },
  "title.new":         { g: "Staff profile titles", l: "Brand new (nothing earned yet)", v: [["Just Got Here"], ["Still Looking for the Bathroom"]] },
  "pc.idle":           { g: "Storage", l: "Someone's PC (waiting for its new job)", v: [["Someone's PC hums quietly.", "A sticky note on the monitor: RESERVED FOR SOMETHING NEW."]] },
  "screen.empty":      { g: "Rooms", l: "A room's touch screen when every piece fits in the cases ({room})", v: [["The little screen glows.", "EVERY PIECE IN {room} IS ON DISPLAY. Nothing waiting here."]] },
  "pc.on":             { g: "Floors", l: "Turning on Someone's PC", v: [["You turned on Someone's PC.", "Accessed the museum archive."]] },
  "pc.empty":          { g: "Floors", l: "The archive is empty", v: [["The archive is empty.", "Every piece is on display right now."]] },
  "mag.1":             { g: "Magazines", l: "Magazine 1 (first line is the title; each line after is a paragraph)", v: [["Pixel Monthly", "This month: why every menu in a cozy game should make a little sound when you open it. We asked twelve players. Eleven said yes. The twelfth asked what a menu was.", "Also inside: the case for walking slower. Games that let you stroll tend to get remembered as places, not as tasks. Something to think about next time a game hands you a sprint button."]] },
  "mag.2":             { g: "Magazines", l: "Magazine 2", v: [["Curator's Digest", "Ten things museum staff wish visitors knew. Number one: the backs of the display cases are not the boring side. Number four: the cat is not an exhibit, but she does accept compliments.", "Letters page: a reader asks whether there are bad mechanics. Our editor replies that there are only mechanics in the wrong game, and then goes back to wiping fingerprints off the glass."]] },
  "mag.3":             { g: "Magazines", l: "Magazine 3 (holds the secret shirt riddle)", v: [["Thread Count Quarterly", "FASHION: THE SHIRT THAT GOT AWAY. Years ago the museum shop sold a GOQ shirt. Then, one day, it didn't. The shopkeeper won't say why. But the shopkeeper still has one, and rumor says it goes to whoever proves they've lived the full museum day, in order:", "First, something sweet and brown from the café. Drink it all, sitting on a stool, not a bench. Throw the cup out by the front doors, not in the tub. Give a plant a drink of its own. Photograph the cat. Take the lobby stairs all the way down, and wake up the old PC. Walk the {room:upper} from the {room:puzzle} to the {room:strategy}. Sleep on the bench in that hall. Then visit the shopkeeper and just chat. Three times. In a row.", "Do it out of order, and you'll have to start over. The shopkeeper notices everything."]] },
  "mag.4":             { g: "Magazines", l: "Magazine 4", v: [["Café Society", "A field guide to museum café seating. The stool by the lamp is for people who are about to have an idea. The stool by the window is for people who already had one. The bench in the gallery is for people who need a nap first.", "Recipe corner: cocoa, but you stare at a painting while it cools."]] },
  "mag.intro":         { g: "Magazines", l: "Magazine stand question", v: [["A rack of magazines. Read one?"]] },
  "shirt.tease":       { g: "Secret shirt", l: "The discontinued shirt in the shop menu", v: [["DISCONTINUED. The GOQ shirt. We don't sell these anymore. Don't ask. (People ask.)"]] },
  "shirt.owned":       { g: "Secret shirt", l: "The shirt in the shop menu once you have it", v: [["Yours now. The shopkeeper pretends not to remember giving it to you."]] },
  "shirt.reveal":      { g: "Secret shirt", l: "The shopkeeper hands over the shirt", v: [["...", "You did the whole thing, didn't you. The cocoa. The stool. The trash can. The nap.", "Fine. FINE. Here.", "You got the GOQ shirt! Wear it from the Start menu, under Wardrobe."]] },
  "stamp.howto":       { g: "Stamp card", l: "Stamp card, not full yet", v: [["Read both sides of a display case (or a painting's note) to collect a stamp. Each piece stamps once per card. Trade a full card at the gift shop."]] },
  "stamp.full":        { g: "Stamp card", l: "Stamp card, full", v: [["Your card is full! Trade it at the gift shop counter for one prize item."]] },
  "stamp.traded":      { g: "Stamp card", l: "After trading a card", v: [["The shopkeeper punches a hole in your card with great ceremony.", "You got {title}! Here's a fresh stamp card."]] },
  "stamp.noPrizes":    { g: "Stamp card", l: "No prizes left to trade for", v: [["You already have every prize. The shopkeeper is impressed and a little worried."]] },
  "respawn.quip":      { g: "Menu", l: "After respawning (one at random)", v: [["*bzzt*", "...Did you see that? I just teleported.", "Let's not tell the curator."], ["Okay, so, I can do that now, apparently.", "Don't think about it too hard. I'm not going to."], ["Whoa. Head rush.", "If anyone asks, I took the stairs."]] },
  "respawn.no":        { g: "Menu", l: "Respawn after closing", v: [["Teleporting around an empty, dark museum? Hard pass."]] },
  "fridge":            { g: "Staff", l: "The staff fridge (one at random)", v: [["A note on the fridge: LABEL YOUR FOOD.", "Below it, a yogurt labeled NOT YOURS. Underlined twice."], ["Inside: three condiments, one sad lemon, and a sandwich older than some of the exhibits."], ["A drawing on the fridge door: the cat, rendered lovingly in crayon."]] },
  "microwave.ask":     { g: "Staff", l: "Microwave question", v: [["The staff microwave. Heat up someone's lunch?"]] },
  "microwave.boom":    { g: "Staff", l: "The microwave goes off (one at random)", v: [["*mmmm-mm-BWOMP*", "Whatever was in there has achieved a resonance cascade.", "The door is still closed. Nobody needs to know."], ["*BANG*", "That was a burrito. It is now a burrito-shaped memory.", "Someone, somewhere, felt that."]] },
  "microwave.after":   { g: "Staff", l: "Microwave after the incident", v: [["The inside of the microwave is a crime scene.", "Nobody is going to clean that today."]] },
  "patrons.intro":     { g: "Lobby", l: "Patron Board, before the names", v: [["Games Over Qualia is made possible by these wonderful people. Some of them are probably in the museum right now."]] },
  "patrons.empty":     { g: "Lobby", l: "Patron Board with no names yet", v: [["The Patron Board. The name plates are polished and waiting."]] },
  "frame.ask":         { g: "Staff", l: "Your locker's photo frame, with your own photo", v: [["A little frame on your locker door, with a photo of you in it."]] },
  "frame.has":         { g: "Staff", l: "Your locker's photo frame, with one of your photos", v: [["The little frame on your locker door."]] },
  "frame.self":        { g: "Staff", l: "Looking at your own photo in the frame", v: [["You, on your first day. Not bad."]] },
  "frame.back":        { g: "Staff", l: "Putting your own photo back (the framed one is erased)", v: [["Put your own photo back? The photo in the frame now will be erased."]] },
  "frame.warn":        { g: "Staff", l: "Putting a photo in the frame (it moves out of your album)", v: [["Put this photo in your locker frame? It moves out of your album."]] },
  "frame.replace":     { g: "Staff", l: "Swapping the photo in the frame", v: [["Swap it in? The photo in the frame now will be erased, and this one moves out of your album."]] },
  "frame.done":        { g: "Staff", l: "After framing a photo", v: [["You slide the photo into the little frame. Perfect."]] },
  "figure.photo":      { g: "Closing up", l: "Photo album description of the figure", v: [["Something in the dark, staring back. When you look up from the phone, it's gone."]] },
  "photos.none":       { g: "Menu", l: "Photo album, empty", v: [["No photos yet.", "Press B to take a photo of whatever's in front of you."]] },
  "menu.saved":        { g: "Menu", l: "After saving", v: [["Saved. You'll pick up right here next time."]] },
};
/* Staff you can chat with. Each line has up to two conditions; a chat plays one matching line, taking turns.
   The curator's Words tab edits these. */
const TALK_ROLES = { usher: "Usher (front desk)", shopkeeper: "Shopkeeper", barista: "Barista", conservator: "Conservator (storage)", guard: "Night guard", member: "Patreon members on shift (staff room)" };
const TALK_WHEN = { always: "Any time", visitor: "You're a visitor (not clocked in)", staff: "You're on shift", day: "Daytime", sunset: "Sunset", night: "Night",
  medium: "Medium day", heavy: "Busy day", reveal: "Reveal day", closing: "After the closing announcement", drink: "You're holding a drink",
  photos: "You've taken photos", helped: "A visitor loved your recommendation", cat: "The cat is in this room", shirt: "You're wearing the GOQ shirt (always wins)" };
const TALK_DEFAULTS = {
  usher: [
    { when: ["shirt"], v: [["Welcome to the GOQ... oh my gosh. Is that THE shirt?", "Can I... can I touch the sleeve? No. Sorry. Professionalism."], ["Everyone on staff has been talking about your shirt.", "Some of us are not handling it well."]] },
    { when: ["visitor", "medium"], v: [["Welcome to the GOQ Museum! A nice steady crowd today."]] },
    { when: ["visitor", "heavy"], v: [["Welcome to the GOQ Museum! We're busy today. Take your time."]] },
    { when: ["visitor", "reveal"], v: [["Welcome! Big day today: something new is being unveiled!"]] },
    { when: ["visitor"], v: [["Straight up the hall and you're in the museum. The café is right in the middle."], ["The gift shop is part of the café now, right in the middle of everything."], ["Read both sides of the glass cases. It's worth it."], ["If someone looks curious, they might want a recommendation."]] },
    { when: ["staff"], v: [["Hey, {name}! Good to see you on shift."], ["{cat} is napping in {catRoom} today."], ["Someone left fingerprints on every case again."], ["Don't forget to clock out before you head home."]] },
    { when: ["staff", "heavy"], v: [["Packed today, {name}. Hope you brought your walking shoes."]] },
    { when: ["staff", "reveal"], v: [["It's reveal day. We're slammed!"]] },
    { when: ["closing"], v: [["We're closed for the night. Goodnight!"]] },
  ],
  shopkeeper: [{ when: ["shirt"], v: [["Oh. You're wearing it. In MY shop.", "I'm fine. This is fine."], ["People keep coming in asking where you got that.", "I tell them we're out. Because we are. Because of you."]] }, { when: ["always"], v: [["Everything on the shelves is one of a kind. Well, one of a few."], ["The featured item? The curator picks it. Don't ask me why."], ["The GOQ shirt? We don't sell those anymore.", "...Who told you about the shirt?"]] }, { when: ["staff"], v: [["Staff discount? Nice try, {name}."]] }],
  barista: [{ when: ["shirt"], v: [["Hold on, I'm going to write your name on the cup in really nice handwriting.", "For the shirt."], ["I'd trade every espresso machine in this building for that shirt.", "Don't tell the espresso machine."]] }, { when: ["always"], v: [["The curator? Always leaving their mug around. It's one of ours, you know."], ["Best seat's by the lamp. Don't tell anyone."]] }, { when: ["drink"], v: [["How's the {drink}?"]] }],
  conservator: [{ when: ["shirt"], v: [["A first-run GOQ shirt. In the wild.", "Please never wash it. I'm begging you, from a preservation standpoint."]] }, { when: ["always"], v: [["I'm the conservator. These games came in without instructions.", "I'm figuring out what they wanted to be."], ["The boxes over there? Abandoned mechanics.", "There are no bad mechanics. Just ones that haven't found the right game yet."]] }],
  member: [{ when: ["always"], v: [["Oh, hey! Busy shift?"], ["{cat} was in here earlier. Stole half my sandwich."], ["I recommended a game to someone yesterday. Fingers crossed they liked it."], ["Best break room I've ever had. Don't tell the curator."]] },
    { when: ["staff"], v: [["Hey, {name}! Grab a coffee, it's a long one."]] }, { when: ["closing"], v: [["Almost time to go home. Good shift, everyone."]] }],
  guard: [{ when: ["shirt"], v: [["Is that... the GOQ shirt?", "I've worked nights here for six years and I've never even SEEN one."], ["Don't mind me. Just guarding the shirt now. I mean the museum."]] }, { when: ["always"], v: [["Evening. Don't mind me, just doing my rounds."], ["Funny thing about this place at night.", "Sometimes the intercom crackles when nobody's touching it."], ["If you see a pair of eyes in the dark...", "That's not me. I'd have said hello."]] }, { when: ["closing"], v: [["Everyone's gone. Just us and the art now."]] }],
};

/* ---------- Achievements ----------
   Pure data: each one is a name, a description, one of these stats and a target. The curator's Achievements tab edits them. */
const ACH_STATS = {
  dusted: "Frames dusted", straightened: "Frames straightened", watered: "Plants watered", mugs: "Mugs found", wiped: "Cases wiped",
  helped: "Visitors who loved your recommendation", recs: "Games recommended to visitors", pets: "Times petting the cat", closings: "Times closing the museum", photos: "Photos taken",
  bothSides: "Cases read on both sides", stamps: "Stamps collected", cards: "Stamp cards traded", items: "Gift shop items owned",
  drinks: "Drinks ordered", naps: "Bench naps", rooms: "Different rooms visited", microwave: "Microwave incidents", segway: "Segway rides",
  reactions: "Different photo reactions caught", episodes: "Episodes watched in the screening nook", arcade: "Games started at the café arcade", shirt: "Has the GOQ shirt (1 = yes)", shifts: "Times clocking in", figure: "Photographed the figure in the dark (1 = yes)",
};
const SAMPLE_ACH = [
  { id: "first-dust", name: "Elbow Grease", desc: "Dust a frame for the first time.", stat: "dusted", target: 1 },
  { id: "helper", name: "Right This Way", desc: "Recommend games that 5 visitors love.", stat: "helped", target: 5 },
  { id: "both-sides", name: "Both Sides Now", desc: "Read both sides of 10 display cases.", stat: "bothSides", target: 10 },
  { id: "cat", name: "Cat Person", desc: "Pet the cat 10 times.", stat: "pets", target: 10 },
  { id: "explorer", name: "Wayfinder", desc: "Visit every room in the museum.", stat: "rooms", target: 8 },
  { id: "closer", name: "Lights Out", desc: "Close the museum for the night.", stat: "closings", target: 1 },
  { id: "card", name: "Punch Card Pro", desc: "Trade in a full stamp card.", stat: "cards", target: 1 },
  { id: "resonance", name: "Resonance Cascade", desc: "Use the staff microwave.", stat: "microwave", target: 1, secret: true },
  { id: "zoom", name: "Up Up Down Down", desc: "Find the Segway.", stat: "segway", target: 1, secret: true },
  { id: "figure", name: "Say Cheese", desc: "Photograph the figure in the dark.", stat: "figure", target: 1, secret: true },
  { id: "shirt", name: "The Shirt That Got Away", desc: "Get the discontinued GOQ shirt.", stat: "shirt", target: 1, secret: true },
  { id: "paparazzi", name: "Paparazzi", desc: "Catch 10 different reactions on camera.", stat: "reactions", target: 10 },
  { id: "couch", name: "Couch Critic", desc: "Watch 5 episodes in the screening nook.", stat: "episodes", target: 5 },
  { id: "quarters", name: "Quarter Muncher", desc: "Start 3 games at the café arcade.", stat: "arcade", target: 3 },
];
/* Rugs you can size: a border band and corner designs around a plain middle, in any colors (Rooms, select a rug).
   A rug decal: { key: "rug", x, y, w, h, pattern (border style), motif (corner design), field, border, accent, corner (colors) }. */
const RUG_BORDERS = { band: "Wide band", double: "Double line", zigzag: "Woven zigzag" };
const RUG_CORNERS = { diamond: "Diamond", flower: "Flower", knot: "Knot", none: "No corners" };
const RUG_PRESETS = {
  "Deep red": { field: "#7a2430", border: "#e2c48c", accent: "#4a1820", corner: "#e8a040" },
  "Sage": { field: "#6f8a6a", border: "#e8e0c8", accent: "#3e5440", corner: "#c8a060" },
  "Navy and gold": { field: "#23345e", border: "#d8b45a", accent: "#141f3c", corner: "#f0d080" },
  "Café brown": { field: "#6a4630", border: "#e8d0a8", accent: "#3e2818", corner: "#c87848" },
  "Dusk purple": { field: "#4a3a6a", border: "#d8b8e0", accent: "#2a1e40", corner: "#f0a0b0" },
};
/* The secret shirt: the museum day from the third magazine, in order. */
const SHIRT_STEPS = ["cocoa", "finishOnStool", "lobbyTrash", "water", "catPhoto", "stairsB1", "pc", "upperHall", "napUpper", "chat", "chat", "chat"];
/* A tiny 3×5 pixel font for signs (capitals and digits). */
const PIXEL_FONT = (() => {
  const g = "A:010101111101101 B:110101110101110 C:011100100100011 D:110101101101110 E:111100110100111 F:111100110100100 G:011100101101011 H:101101111101101 I:111010010010111 J:001001001101010 K:101101110101101 L:100100100100111 M:101111111101101 N:110101101101101 O:010101101101010 P:110101110100100 Q:010101101110011 R:110101110101101 S:011100010001110 T:111010010010010 U:101101101101111 V:101101101101010 W:101101111111101 X:101101010101101 Y:101101010010010 Z:111001010100111 0:111101101101111 1:010110010010111 2:110001010100111 3:110001010001110 4:101101111001001 5:111100110001110 6:011100111101111 7:111001010010010 8:111101111101111 9:111101111001110";
  const out = { " ": ["000", "000", "000", "000", "000"], ":": ["000", "010", "000", "010", "000"], "-": ["000", "000", "111", "000", "000"], ".": ["000", "000", "000", "000", "010"],
    "!": ["010", "010", "010", "000", "010"], "?": ["110", "001", "010", "000", "010"], "'": ["010", "010", "000", "000", "000"], "&": ["010", "101", "010", "101", "011"], ",": ["000", "000", "000", "010", "100"], "/": ["001", "001", "010", "100", "100"] };
  g.split(" ").forEach(e => { const [k, b] = e.split(":"); out[k] = [0, 1, 2, 3, 4].map(i => b.slice(i * 3, i * 3 + 3)); });
  return out;
})();
const KONAMI = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a", "start"];
const REDUCED_MOTION = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const BROWSE_LINES = [["Hmm. Hmm hmm hmm."], ["Should I get the mug? I should get the mug.", "...Or the tote."], ["I've been standing here a while.", "I'm very close to deciding."], ["Don't rush me. This is a big decision."]];
const SIT_LINES = [["Best seat in the house."], ["I come here for the café. The art is a bonus."], ["Shh. I'm people-watching."]];
const CROWD_LINES = [["What a nice museum."], ["I come here on my lunch break."], ["Have you seen the cat today?"], ["I always read both sides of the cases."],
  ["My friend told me about this place."], ["Honestly, I'm mostly here for the café."], ["Is it me, or is it busy today?"], ["I didn't know games could go in museums."],
  ["I've been standing here a while.", "I think I get it now. Maybe."], ["The café smells amazing from here."]];
/* Extra dimness per room after dark, on top of the room's own lighting. */
const NIGHT_DIM = { lobby: 0.2, museum: 0.12, staff: 0.08, storage: 0.05 };
/* ---------- The museum's layout ----------
   A room with a "layout" is drawn from a blueprint instead of by hand:
     rooms: [{ id, name, x, y, w, h, art, light }]   rectangles of floor (x, y is the top-left floor tile). light: false = no switch.
     halls: [{ id, name, path: [[x, y], ...], width, min }]   straight or L-shaped runs of floor. Each point is the top-left of
            the hallway's width; the first and last points sit inside the rooms (or the hallway) it joins. min: the shortest it
            should be, for the curator's warnings.
     doors: [{ id, zone, side, at, warp }]   a doorway in a room or hallway's wall (side: top, bottom, left or right; at: how far
            along). Other rooms can lead here with ["museum", "@id"].
     stairs: [{ id, zone, at: [dx, dy], kind, arrive, to }]   stairs on the floor of a room (from its top-left floor tile) or a
            hallway (from its last point).
   Walls are worked out from the floor: three rows of wall behind (above) every stretch of floor, a wall top all around.
   Every room and hallway is a "zone": its own art, its own name (rooms say theirs when you walk in) and, for rooms, a light switch. */
const DIRS_LIST = ["up", "down", "left", "right"];
const LAYOUT_MAX_W = 120, LAYOUT_MAX_H = 100, LAYOUT_SIDES = ["top", "bottom", "left", "right"];
const hexOr = c => (/^#[0-9a-f]{6}$/i.test(c || "") ? c.toLowerCase() : "");
function normalizeLayout(L) {
  L = L && typeof L === "object" ? L : {};
  const n = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.max(lo, Math.min(hi, Math.round(+v))) : d), zoneIds = new Set(), spotIds = new Set();
  const uid = ids => (v, d) => { let k = String(v || d).toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30) || d; while (ids.has(k)) k += "2"; ids.add(k); return k; };
  const id = uid(zoneIds), sid = uid(spotIds); // rooms and hallways share one set of names; doorways and stairs another
  const art = a => (a && typeof a === "object" ? Object.fromEntries(Object.entries(a).filter(([k, v]) => ["top", "upper", "lower", "floor"].includes(k) && SLOT[v])) : {});
  const out = { hallArt: art(L.hallArt), rooms: [], halls: [], doors: [], stairs: [] };
  (Array.isArray(L.rooms) ? L.rooms : []).slice(0, 40).forEach((r, i) => { if (!r) return;
    out.rooms.push({ id: id(r.id, "room" + i), name: str(r.name, 40) || "Room", x: n(r.x, 1, LAYOUT_MAX_W - 4, 2), y: n(r.y, 3, LAYOUT_MAX_H - 4, 3), w: n(r.w, 2, 60, 8), h: n(r.h, 2, 60, 6), art: art(r.art), light: r.light !== false, genre: str(r.genre, 30), color: hexOr(r.color), tint: { floor: hexOr(r.tint && r.tint.floor), wall: hexOr(r.tint && r.tint.wall) },
      edits: (Array.isArray(r.edits) ? r.edits : []).slice(0, 400).filter(e => Array.isArray(e) && (e[2] === "." || e[2] === "#")).map(e => [n(e[0], -30, 90, 0), n(e[1], -30, 90, 0), e[2]]) }); });
  (Array.isArray(L.halls) ? L.halls : []).slice(0, 60).forEach((h, i) => { if (!h) return;
    const path = (Array.isArray(h.path) ? h.path : []).slice(0, 8).map(p => [n(p && p[0], 1, LAYOUT_MAX_W - 3, 1), n(p && p[1], 3, LAYOUT_MAX_H - 3, 3)]);
    const wl = h.walls && typeof h.walls === "object" ? h.walls : {};
    if (path.length) out.halls.push({ id: id(h.id, "hall" + i), name: str(h.name, 40) || "Hallway", path, width: n(h.width, 2, 6, 2), min: n(h.min, 0, 99, 0), art: art(h.art),
      walls: { mode: ["auto", "custom", "plain"].includes(wl.mode) ? wl.mode : "auto", from: hexOr(wl.from), to: hexOr(wl.to) } }); });
  (Array.isArray(L.doors) ? L.doors : []).slice(0, 20).forEach((d, i) => { if (d && Array.isArray(d.warp))
    out.doors.push({ id: sid(d.id, "door" + i), zone: String(d.zone || ""), side: LAYOUT_SIDES.includes(d.side) ? d.side : "bottom", at: n(d.at, 0, 60, 0), warp: d.warp.slice(0, 4) }); });
  (Array.isArray(L.stairs) ? L.stairs : []).slice(0, 10).forEach((st, i) => { if (st && Array.isArray(st.to))
    out.stairs.push({ id: sid(st.id, "stairs" + i), zone: String(st.zone || ""), at: [n(st.at && st.at[0], -60, 60, 0), n(st.at && st.at[1], -60, 60, 0)], kind: st.kind === "up" ? "up" : "down", arrive: DIRS_LIST.includes(st.arrive) ? st.arrive : "up", to: st.to.slice(0, 4) }); });
  out.spawn = typeof L.spawn === "string" ? L.spawn : (out.doors[0] || {}).id || "";
  return out;
}
/* The floor of a hallway, as rectangles: one per straight piece. */
function hallRects(h) {
  const w = Math.max(2, h.width | 0), out = [], p = h.path;
  if (p.length === 1) return [{ x: p[0][0], y: p[0][1], w, h: w }];
  for (let i = 0; i < p.length - 1; i++) {
    const [x1, y1] = p[i], [x2, y2] = p[i + 1];
    out.push({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) + w, h: Math.abs(y2 - y1) + w });
  }
  return out;
}
const inRect = (r, x, y) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
/* How long a hallway is: the tiles along it that aren't inside a room, or inside the hallway it starts or ends in. */
function hallLength(L, h) {
  const rects = hallRects(h), ends = [h.path[0], h.path[h.path.length - 1]];
  const skip = L.halls.filter(o => o !== h && ends.some(([x, y]) => hallRects(o).some(r => inRect(r, x, y)))).flatMap(hallRects).concat(L.rooms);
  let n = 0; const seen = new Set();
  for (const r of rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
    const k = x + "," + y; if (seen.has(k)) continue; seen.add(k);
    if (!skip.some(o => inRect(o, x, y))) n++;
  }
  return Math.round(n / Math.max(2, h.width | 0));
}
/* Turn a blueprint into a map. Cached, since the same blueprint is carved by every copy of a room. */
const CARVED = new Map();
function carveLayout(L) {
  const key = JSON.stringify(L); if (CARVED.has(key)) return CARVED.get(key);
  const zones = [], rects = [];
  L.rooms.forEach(r => { zones.push({ id: r.id, name: r.name, kind: "room", art: r.art, light: r.light, rect: r }); rects.push(Object.assign({ z: zones.length - 1 }, r)); });
  L.halls.forEach(h => { const rs = hallRects(h); zones.push({ id: h.id, name: h.name, kind: "hall", art: Object.keys(h.art || {}).length ? h.art : L.hallArt, hall: h, rects: rs }); rs.forEach(r => rects.push(Object.assign({ z: zones.length - 1, hall: true }, r))); });
  let W = 8, H = 8;
  for (const r of rects) { W = Math.max(W, r.x + r.w + 2); H = Math.max(H, r.y + r.h + 2); }
  L.rooms.forEach(r => (r.edits || []).forEach(([dx, dy, c]) => { if (c === ".") { W = Math.max(W, r.x + dx + 3); H = Math.max(H, r.y + dy + 3); } }));
  W = Math.min(LAYOUT_MAX_W, W); H = Math.min(LAYOUT_MAX_H, H);
  const zf = mk(W, H, -1); // the zone of each floor tile; rooms first, so a hallway's end inside a room is the room's
  for (const r of rects.filter(r => !r.hall).concat(rects.filter(r => r.hall)))
    for (let y = Math.max(3, r.y); y < Math.min(H - 1, r.y + r.h); y++) for (let x = Math.max(1, r.x); x < Math.min(W - 1, r.x + r.w); x++) if (zf[y][x] < 0) zf[y][x] = r.z;
  // Each room's shape tweaks, measured from its top-left floor tile: "." adds floor (an alcove, a bump-out), "#" takes it away (a pillar, a notch).
  L.rooms.forEach((r, z) => (r.edits || []).forEach(([dx, dy, c]) => {
    const x = r.x + dx, y = r.y + dy; if (x < 1 || y < 3 || x >= W - 1 || y >= H - 1) return;
    zf[y][x] = c === "." ? (zf[y][x] >= 0 && zones[zf[y][x]].kind === "hall" ? zf[y][x] : z) : -1;
  }));
  const fl = (x, y) => y >= 0 && y < H && x >= 0 && x < W && zf[y][x] >= 0;
  const ch = mk(W, H, " "), za = mk(W, H, -1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (fl(x, y)) { ch[y][x] = "."; za[y][x] = zf[y][x]; }
    else if (fl(x, y + 1)) { ch[y][x] = "v"; za[y][x] = zf[y + 1][x]; }
    else if (fl(x, y + 2)) { ch[y][x] = "^"; za[y][x] = zf[y + 2][x]; }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (ch[y][x] !== " ") continue;
    for (let dy = -1; dy <= 1 && ch[y][x] === " "; dy++) for (let dx = -1; dx <= 1; dx++) {
      const c = ch[y + dy] && ch[y + dy][x + dx]; if (c === "." || c === "v" || c === "^") { ch[y][x] = "#"; za[y][x] = za[y + dy][x + dx]; break; }
    }
  }
  const zoneOf = id => zones.find(z => z.id === id), box = z => {
    if (z.rect) return z.rect;
    const rs = z.rects, x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y));
    return { x, y, w: Math.max(...rs.map(r => r.x + r.w)) - x, h: Math.max(...rs.map(r => r.y + r.h)) - y };
  };
  const anchors = {}, doors = [], stairs = [], lights = [], put = (x, y, c) => { if (ch[y] && ch[y][x] !== undefined) ch[y][x] = c; };
  for (const d of L.doors) {
    const z = zoneOf(d.zone); if (!z) continue;
    const b = box(z), side = d.side; let ex, ey, ax, ay, dir;
    if (side === "top") { ex = b.x + Math.min(d.at, b.w - 1); ey = b.y - 1; put(ex, ey - 1, "D"); put(ex, ey, "d"); ax = ex; ay = b.y; dir = "down"; }
    else if (side === "bottom") { ex = b.x + Math.min(d.at, b.w - 1); ey = b.y + b.h; put(ex, ey, "B"); ax = ex; ay = ey - 1; dir = "up"; }
    else { ey = b.y + Math.min(d.at, b.h - 1); ex = side === "left" ? b.x - 1 : b.x + b.w; put(ex, ey, "H"); ax = side === "left" ? ex + 1 : ex - 1; ay = ey; dir = side === "left" ? "right" : "left"; }
    if (ey < 0 || ey >= H || ex < 0 || ex >= W) continue;
    doors.push({ x: ex, y: ey, warp: d.warp }); anchors[d.id] = { x: ax, y: ay, dir };
  }
  for (const st of L.stairs) {
    const z = zoneOf(st.zone); if (!z) continue;
    // In a room: measured from its top-left floor tile. In a hallway: from its last point (usually a dead end), so it stays put at the end.
    const e = z.hall ? z.hall.path[z.hall.path.length - 1] : [z.rect.x, z.rect.y], x = e[0] + st.at[0], y = e[1] + st.at[1]; if (!fl(x, y)) continue;
    stairs.push({ x, y, kind: st.kind, to: st.to }); anchors[st.id] = { x, y, dir: st.arrive };
  }
  zones.forEach((z, i) => {
    if (z.kind !== "room" || !z.light) return;
    const r = z.rect; for (let x = r.x + 1; x < r.x + r.w - 1; x++) if (ch[r.y - 1] && ch[r.y - 1][x] === "v" && za[r.y - 1][x] === i) { lights.push({ zone: z.id, x, y: r.y - 1 }); break; }
  });
  const a = anchors[L.spawn] || Object.values(anchors)[0];
  let spawn = a ? [a.x, a.y, a.dir] : null;
  if (!spawn) for (let y = 0; y < H && !spawn; y++) for (let x = 0; x < W; x++) if (fl(x, y)) { spawn = [x, y, "down"]; break; }
  const out = { w: W, h: H, map: ch.map(r => r.join("")), zones, zoneAt: za, anchors, doors, stairs, lights, spawn: spawn || [1, 3, "down"] };
  if (CARVED.size > 40) CARVED.clear();
  CARVED.set(key, out);
  return out;
}
function layoutOf(def) { return def && def.layout ? carveLayout(def.layout) : null; }
/* A room with a blueprint gets its map (and start spot) from it. */
function prepLayoutRoom(def) {
  def.layout = normalizeLayout(def.layout);
  const c = carveLayout(def.layout); def.map = c.map.slice(); def.spawn = c.spawn.slice();
  return def;
}
prepLayoutRoom(ROOMS.museum);
/* A pristine copy of the built-in rooms. A pack's "rooms" replaces any of these or adds new ones;
   the level editor in curator.html writes them. Rooms are plain data, so a deep copy is enough. */
const BUILTIN_ROOMS = JSON.parse(JSON.stringify(ROOMS));
const ROOM_KEYS = ["name", "art", "map", "layout", "spawn", "props", "events", "visitors", "light", "spots", "cases", "stairs", "crowd", "runners", "lamps", "arrows", "murals", "tint", "windowAt", "intercom", "lightSwitch", "eotmAt",
  "lockers", "corkboardAt", "leaderboardAt", "timeClock", "featuredAt", "wallArt", "decals", "glows", "bunting", "catSpots", "mugSpots", "exitTo", "tutorial", "screenAt", "marqueeAt", "nowPlayingAt", "posters", "floorLights", "camAt"];
/* Light checks so a hand-edited or damaged pack can't break the game: rectangular map, sane size, a spawn on the map. */
function normalizeRoom(id, d) {
  if (d && typeof d === "object" && d.layout) { d = Object.assign({}, d); prepLayoutRoom(d); }
  if (!d || typeof d !== "object" || !Array.isArray(d.map) || !d.map.length) return null;
  const big = !!d.layout, h = Math.min(big ? LAYOUT_MAX_H : 24, Math.max(6, d.map.length)), w = Math.min(big ? LAYOUT_MAX_W : 48, Math.max(6, String(d.map[0]).length));
  const map = []; for (let y = 0; y < h; y++) map.push(String(d.map[y] || "").padEnd(w, "#").slice(0, w).replace(/[^#^v.=DdSsEBH ]/g, "."));
  const out = {}; ROOM_KEYS.forEach(k => { if (d[k] !== undefined) out[k] = JSON.parse(JSON.stringify(d[k])); });
  out.map = map; out.name = str(d.name, 40) || id;
  out.art = Object.assign({ top: "gallery_wall_top", upper: "gallery_wall_upper", lower: "gallery_wall_lower", floor: "gallery_floor" }, out.art || {});
  for (const k in out.art) if (!SLOT[out.art[k]]) delete out.art[k];
  const sp = Array.isArray(out.spawn) ? out.spawn : [1, 3, "down"];
  out.spawn = [Math.min(w - 2, Math.max(1, sp[0] | 0)), Math.min(h - 2, Math.max(1, sp[1] | 0)), DIRS_LIST.includes(sp[2]) ? sp[2] : "down"];
  out.light = Object.assign({ dim: 0, spots: 0 }, out.light || {});
  ["props", "events", "visitors"].forEach(k => { out[k] = Array.isArray(out[k]) ? out[k].filter(Boolean) : []; });
  out.props = out.props.filter(p => SLOT[p.key] && p.x >= 0 && p.y >= 0 && p.x < w && p.y < h);
  out.wallArt = (out.wallArt || []).filter(a => SLOT[a.key]);
  out.decals = (out.decals || []).filter(a => SLOT[a.key]);
  out.visitors = out.visitors.filter(v => SLOT[v.sheet]);
  return out;
}
/* The newest pieces are on display; when there are more than the museum has places for, the oldest (highest in the
   Pieces list) move to the archive on Someone's PC. Episodes and community pieces are counted separately. */
function archiveSplit(pieces) {
  const caps = { cases: 0, spots: 0 }; for (const id in ROOMS) { caps.cases += (ROOMS[id].cases || []).length; caps.spots += (ROOMS[id].spots || []).length; }
  const eps = pieces.filter(p => p.kind === "episode"), com = pieces.filter(p => p.kind !== "episode");
  const oldE = Math.max(0, eps.length - caps.cases), oldC = Math.max(0, com.length - caps.spots);
  return { episodes: eps.slice(oldE), community: com.slice(oldC), archived: [...eps.slice(0, oldE), ...com.slice(0, oldC)], caps };
}
function applyRooms(rooms) {
  for (const id of Object.keys(ROOMS)) delete ROOMS[id];
  const base = JSON.parse(JSON.stringify(BUILTIN_ROOMS));
  for (const id in base) ROOMS[id] = base[id];
  if (rooms && typeof rooms === "object") for (const id in rooms) {
    if (!/^[a-z0-9_-]{1,40}$/.test(id)) continue;
    const r = normalizeRoom(id, rooms[id]); if (r) ROOMS[id] = r;
  }
}
const MAP_TILE = { " ": [null], "#": ["top"], "^": ["upper"], "v": ["lower"], ".": ["floor"], "=": ["runner"],
  "D": ["upper", "doorway_upper"], "d": ["lower", "doorway_lower"], "S": ["upper", "staff_door_upper"], "s": ["lower", "staff_door_lower"],
  "E": ["top", "exit_door"], "B": ["top", "doorway_bottom"], "H": ["top", "doorway_side"] };

/* A piece's state in its spot: "wall" (hanging), "covered" (sheet, before its unveil date),
   or "crate" (curator mode, before its unveil date, until the curator hangs it). */
function spotState(p, o) {
  if (!p.unveil || p.unveil <= o.today) return "wall";
  if (o.curator && o.hung.has(p.id)) return "wall";
  return o.curator ? "crate" : "covered";
}
/* Floor tiles where a visitor can stand without being in the way, checked one at a time so that, with everyone placed,
   every open tile can still reach every other. */
/* Tiles wandering visitors never step on: doorways and stairs, the floor right next to them, and the start spot. */
function noWanderTiles(id, r, def) {
  const out = new Set(), add = (x, y) => { out.add(x + "," + y); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) out.add((x + dx) + "," + (y + dy)); };
  for (const k in r.events) { const e = r.events[k]; if (e.warp || e.bump || e.step || e.frontDoor) { const [x, y] = k.split(",").map(Number); add(x, y); } }
  for (const st of r.stairs || []) add(st.x, st.y);
  add(def.spawn[0], def.spawn[1]);
  for (const c of r.cases || []) out.add(c.x + "," + (c.y - 1)); // a case is drawn two tiles tall: visitors keep off its top half (you can still stand there to read the back)
  return out;
}
function safeSpots(r, def, inZone, limit) {
  const W = r.w, H = r.h, avoid = new Set(), key = (x, y) => x + "," + y;
  for (const k in r.events) { const [x, y] = k.split(",").map(Number); for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) avoid.add(key(x + dx, y + dy)); }
  for (const c of r.cases || []) { avoid.add(key(c.x, c.y - 1)); avoid.add(key(c.x, c.y + 1)); }
  for (const h of r.hung || []) { avoid.add(key(h.x, h.y + 2)); avoid.add(key(h.x + 1, h.y + 2)); }
  for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) avoid.add(key(def.spawn[0] + dx, def.spawn[1] + dy));
  for (const st of r.stairs || []) for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) avoid.add(key(st.x + dx, st.y + dy));
  // Staff who stand still count as obstacles while checking.
  const fixed = (def.visitors || []).filter(v => (v.still || v.usher || v.role) && !v.patrol && r.solid[v.y] && !r.solid[v.y][v.x]);
  fixed.forEach(v => (r.solid[v.y][v.x] = true));
  safeSpots.lastAvoid = avoid;
  const cands = [];
  for (let y = 3; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!r.solid[y][x] && !avoid.has(key(x, y)) && (!inZone || inZone(x, y))) cands.push([x, y]);
  // Keep a spot only if blocking it leaves the rest of the floor you can reach (from the start spot) still in one piece.
  // A typed-array flood fill: the museum is big, and this runs for every candidate.
  const seen = new Uint8Array(W * H), q = new Int32Array(W * H), open = (x, y) => y >= 3 && y < H - 1 && x >= 1 && x < W - 1 && !r.solid[y][x];
  const fill = () => {
    seen.fill(0); let sx = def.spawn[0], sy = def.spawn[1];
    if (!open(sx, sy)) { const f = cands.find(([x, y]) => !r.solid[y][x]); if (!f) return 0; [sx, sy] = f; }
    let head = 0, tail = 0, n = 0; q[tail++] = sy * W + sx; seen[sy * W + sx] = 1;
    while (head < tail) { const c = q[head++], x = c % W, y = (c / W) | 0; n++;
      for (const k of [c + 1, c - 1, c + W, c - W]) { const nx = k % W, ny = (k / W) | 0; if (!seen[k] && open(nx, ny)) { seen[k] = 1; q[tail++] = k; } } }
    return n;
  };
  let base = fill(); const reach = seen.slice();
  for (let i = cands.length - 1; i >= 0; i--) if (!reach[cands[i][1] * W + cands[i][0]]) cands.splice(i, 1); // only floor you can get to
  const connected = () => fill() === base - 1;
  const out = [];
  for (let i = cands.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]]; }
  for (const [x, y] of cands) {
    if (out.length >= (limit || 40)) break;
    r.solid[y][x] = true;
    if (connected()) { out.push([x, y]); base--; } else r.solid[y][x] = false;
  }
  for (const [x, y] of out) r.solid[y][x] = false;
  fixed.forEach(v => (r.solid[v.y][v.x] = false));
  return out;
}
/* Runner tiles: [x, y, "h0".."v2", width in pixels]. In a hallway (up to 3 tiles of floor across) a runner sits in the middle
   of the floor, whichever row (or column) it was painted on; in a room it sits on its own tile. */
function runnerTiles(def) {
  const isFloor = (x, y) => def.map[y] && (def.map[y][x] === "." || def.map[y][x] === "=");
  const out = (def.runners || []).filter(t => Array.isArray(t) && /^([hv][012]|c[0-3])$/.test(t[2]) && isFloor(t[0], t[1])).map(([x, y, k, wd]) => {
    if (k[0] === "c") return { x, y, k, w: Math.max(10, Math.min(32, wd | 0 || 16)) }; // a corner: its arms line up with its neighbors (below)
    const across = k[0] === "h"; let a = across ? y : x, b = a;
    while (b - a < 6 && (across ? isFloor(x, a - 1) : isFloor(a - 1, y))) a--;
    while (b - a < 6 && (across ? isFloor(x, b + 1) : isFloor(b + 1, y))) b++;
    const ok = b - a + 1 <= 3, mid = ok ? (a + b + 1) * T / 2 : ((across ? y : x) + 0.5) * T;
    return { x, y, k, w: Math.max(10, Math.min(48, wd | 0 || 20)), mid, a, b, ok };
  });
  const at = new Map(out.map(t => [t.x + "," + t.y, t]));
  // A straight run of runner shares one line: in the middle of a hallway's floor if any of it is in one (so it carries on
  // straight into a room, and through crossings), otherwise down the middle of its tiles.
  const seen = new Set();
  out.forEach(t => {
    if (t.k[0] === "c" || seen.has(t)) return;
    const across = t.k[0] === "h", run = [], q = [t]; seen.add(t);
    while (q.length) {
      const c = q.pop(); run.push(c);
      // the next tile along, on the same line; in a hallway, anywhere across its floor counts as the same line
      out.forEach(o => {
        if (seen.has(o) || o.k[0] !== t.k[0]) return;
        const next = across ? Math.abs(o.x - c.x) === 1 : Math.abs(o.y - c.y) === 1, op = across ? o.y : o.x, cp = across ? c.y : c.x;
        if (next && (op === cp || (o.ok && o.a <= cp && cp <= o.b) || (c.ok && c.a <= op && op <= c.b))) { seen.add(o); q.push(o); }
      });
    }
    const c = run.find(r => r.ok); if (c) run.forEach(r => { r.mid = c.mid; r.ok = true; });
  });
  // Corners: the arm across lines up with the runner beside it, the arm up or down with the runner above or below it.
  out.forEach(t => {
    if (t.k[0] !== "c") return;
    const side = t.k === "c0" || t.k === "c2" ? 1 : -1, vert = t.k === "c0" || t.k === "c1" ? 1 : -1;
    const h = at.get((t.x + side) + "," + t.y), v = at.get(t.x + "," + (t.y + vert));
    t.ay = h && h.k[0] === "h" ? h.mid : (t.y + 0.5) * T; t.wh = h && h.k[0] === "h" ? Math.min(32, h.w) : t.w;
    t.ax = v && v.k[0] === "v" ? v.mid : (t.x + 0.5) * T; t.wv = v && v.k[0] === "v" ? Math.min(32, v.w) : t.w;
  });
  return out;
}
/* A room's theme color: its own, else its genre's. */
function themeOf(zone, genres) {
  const r = zone && zone.rect; if (!r) return "";
  if (r.color) return r.color;
  const g = (genres || []).find(g => g.id === r.genre); return g ? hexOr(g.color) : "";
}
function mixHex(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
/* The tint for a floor or wall tile, or "" for none. */
function tintAt(def, lay, z, part, x, y, genres) {
  if (!lay) return hexOr(def.tint && def.tint[part]);
  const zone = z >= 0 ? lay.zones[z] : null; if (!zone) return "";
  if (zone.kind === "room") return hexOr(zone.rect.tint && zone.rect.tint[part]);
  if (part !== "wall") return "";
  const h = zone.hall, wl = h.walls || { mode: "auto" }; if (wl.mode === "plain") return "";
  const ends = hallEndColors(lay, h, genres), from = wl.mode === "custom" && wl.from ? wl.from : ends[0], to = wl.mode === "custom" && wl.to ? wl.to : ends[1];
  // Muted a little toward warm gray, so arrows and lights in the room's full color stand out against it.
  const soften = c => mixHex(c, "#5a4c44", 0.4);
  if (!from && !to) return ""; if (!from || !to || from === to) return soften(from || to);
  // How far along the hallway this tile is (0 at the first end, 1 at the last), in steps so neighbors share a color.
  const p = h.path; let total = 0, best = Infinity, at = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [x1, y1] = p[i], [x2, y2] = p[i + 1], len = Math.abs(x2 - x1) + Math.abs(y2 - y1);
    const tx = Math.max(Math.min(x1, x2), Math.min(Math.max(x1, x2), x)), ty = Math.max(Math.min(y1, y2), Math.min(Math.max(y1, y2), y)), dd = Math.abs(tx - x) + Math.abs(ty - y);
    if (dd < best) { best = dd; at = total + Math.abs(tx - x1) + Math.abs(ty - y1); }
    total += len;
  }
  const t = total ? Math.round((at / total) * 12) / 12 : 0;
  return soften(mixHex(from, to, t));
}
/* The theme colors at each end of a hallway: the room it ends in, or (ending in another hallway) the middle of that hallway's colors. */
function hallEndColors(lay, h, genres, depth) {
  const p = [h.path[0], h.path[h.path.length - 1]];
  return p.map(([x, y]) => {
    const room = lay.zones.find(z => z.kind === "room" && x >= z.rect.x && y >= z.rect.y && x < z.rect.x + z.rect.w && y < z.rect.y + z.rect.h);
    if (room) return themeOf(room, genres);
    if (depth) return "";
    const other = lay.zones.find(z => z.kind === "hall" && z.hall !== h && z.rects.some(r => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h));
    if (!other) return "";
    const [a, b] = hallEndColors(lay, other.hall, genres, 1); return a && b ? mixHex(a, b, 0.5) : a || b;
  });
}
/* A runner corner (c0 joins right and down, c1 left and down, c2 right and up, c3 left and up), any width up to a tile,
   in the colors of the straight runner art (its border, trim and field), so it matches replaced art too. */
const CORNERS = new WeakMap();
function runnerCorner(img, ru) {
  const iw = img.naturalWidth || img.width; if (!iw) return null;
  let per = CORNERS.get(img); if (!per) { per = {}; CORNERS.set(img, per); }
  const k = ru.k, P = T; // drawn on a 3×3-tile canvas, the corner's own tile in the middle
  const fx = k === "c1" || k === "c3", fy = k === "c2" || k === "c3";
  // in the corner's own frame (c0: arms going right and down), measured from the tile's top-left
  const lx = ru.ax - ru.x * T, ly = ru.ay - ru.y * T, ax = fx ? T - lx : lx, ay = fy ? T - ly : ly;
  const key = [k, ax, ay, ru.wh, ru.wv].join(","); if (per[key]) return per[key];
  const s = document.createElement("canvas"); s.width = iw; s.height = T; const sx = s.getContext("2d"); sx.drawImage(img, 0, 0);
  const col = r => { const d = sx.getImageData(T + 8, r, 1, 1).data; return "rgba(" + d[0] + "," + d[1] + "," + d[2] + "," + d[3] / 255 + ")"; };
  const cols = [col(3), col(4), col(5)], N = T + 2 * P, c = document.createElement("canvas"); c.width = N; c.height = N; const x = c.getContext("2d");
  const y0 = Math.round(ay - ru.wh / 2), y1 = y0 + ru.wh, x0 = Math.round(ax - ru.wv / 2), x1 = x0 + ru.wv;
  // the arm across runs right to the tile's edge (and on, into the next tile); the arm down runs to the bottom edge
  const inside = (X, Y) => (Y >= y0 && Y < y1 && X >= x0 && X < T + P) || (X >= x0 && X < x1 && Y >= y0 && Y < T + P);
  const open = (X, Y) => (X >= T && Y >= y0 && Y < y1) || (Y >= T && X >= x0 && X < x1); // where an arm carries on into the next tile: no border
  for (let Y = -P; Y < T + P; Y++) for (let X = -P; X < T + P; X++) {
    if (!inside(X, Y)) continue;
    let d = 3;
    for (let r = 0; r < 3 && d === 3; r++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = X + dx * (r + 1), ny = Y + dy * (r + 1); if (!inside(nx, ny) && !open(nx, ny)) { d = r; break; } }
    x.fillStyle = cols[Math.min(2, d)];
    x.fillRect((fx ? T - 1 - X : X) + P, (fy ? T - 1 - Y : Y) + P, 1, 1);
  }
  return (per[key] = c);
}
/* One runner tile, any width: the art's border rows top and bottom, its plain field stretched between, and its pattern row
   in the middle. (Down runners are the same, sideways.) img: the carpet_h or carpet_v sheet. */
function drawRunner(ctx, img, ru, cx, cy) {
  if (ru.k[0] === "c") { if (ru.ax === undefined) { ru.ax = (ru.x + 0.5) * T; ru.ay = (ru.y + 0.5) * T; ru.wh = ru.wv = ru.w; } const c = runnerCorner(img, ru); if (c) ctx.drawImage(c, ru.x * T - T - cx, ru.y * T - T - cy); return; }
  const across = ru.k[0] === "h", f = +ru.k[1] * T, w = ru.w;
  const at = Math.round(ru.mid - w / 2), body = w - 6, pat = Math.min(4, body), gap = body - pat, g1 = gap >> 1;
  // pieces of the art, measured across the runner: border 3..5, plain field row 5, pattern 6..9, border 10..12
  const strip = (from, len, to, size) => { if (size <= 0) return; if (across) ctx.drawImage(img, f, from, T, len, ru.x * T - cx, to - cy, T, size); else ctx.drawImage(img, f + from, 0, len, T, to - cx, ru.y * T - cy, size, T); };
  strip(3, 3, at, 3); strip(5, 1, at + 3, g1); strip(6, pat, at + 3 + g1, pat); strip(5, 1, at + 3 + g1 + pat, gap - g1); strip(10, 3, at + w - 3, 3);
}
function buildRoom(id, pieces, o) {
  const def = ROOMS[id], h = def.map.length, w = def.map[0].length, lay = layoutOf(def);
  const r = { id, name: def.name, w, h, tiles: mk(w, h, null), over: mk(w, h, null), solid: mk(w, h, false), events: {}, props: [], hung: [], npcs: [] };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = def.map[y][x], m = MAP_TILE[ch] || ["floor"], z = lay && lay.zoneAt[y] ? lay.zoneAt[y][x] : -1, art = z >= 0 ? Object.assign({}, def.art, lay.zones[z].art) : def.art;
    r.tiles[y][x] = m[0] === null ? null : art[m[0]] || art.floor; r.over[y][x] = m[1] || null;
    // Colors: a room's floor and wall tints, and a hallway's walls blending from the room at one end to the room at the other.
    const part = m[0] === "floor" ? "floor" : m[0] === "upper" || m[0] === "lower" ? "wall" : null;
    if (part && r.tiles[y][x]) { const t = tintAt(def, lay, z, part, x, y, o.genres); if (t) r.tiles[y][x] += "@" + t; }
    r.solid[y][x] = ch !== "." && ch !== "=";
  }
  (def.props || []).forEach(p => {
    r.props.push({ key: p.key, x: p.x, y: p.y, plant: p.plant, mugShelf: p.mugShelf, sit: p.sit, rack: p.rack, unit: p.unit, collection: p.collection, catBed: p.catBed, tall: p.tall });
    for (let i = 0; i < SLOT[p.key].w / T; i++) {
      r.solid[p.y][p.x + i] = true;
      // Tall things: you can walk behind the top row (and are hidden by it) unless it's marked blockTop, like racks and cabinets.
      if (p.tall && p.blockTop) { r.solid[p.y - 1][p.x + i] = true; }
      const ev = p.unit !== undefined ? { unit: p.unit } : p.rack !== undefined ? { rack: p.rack } : p.collection ? { collection: true } : null;
      if (ev) { r.events[(p.x + i) + "," + p.y] = ev; if (p.tall && p.blockTop) r.events[(p.x + i) + "," + (p.y - 1)] = ev; continue; }
      if (p.tall && p.blockTop && p.say) r.events[(p.x + i) + "," + (p.y - 1)] = { say: p.say };
      if (p.plant) r.events[(p.x + i) + "," + p.y] = { plant: p.plant, name: p.name };
      else if (p.key === "front_desk") r.events[(p.x + i) + "," + p.y] = i === 1 ? { usher: true } : { guestbook: true };
      else if (p.rules) r.events[(p.x + i) + "," + p.y] = { rules: true };
      else if (p.sit) r.events[(p.x + i) + "," + p.y] = { sit: p.sit, x: p.x + i, y: p.y, say: p.say, bench: p.key === "bench" };
      else if (p.event) { r.events[(p.x + i) + "," + p.y] = Object.assign({}, p.event); if (p.tall && p.blockTop) r.events[(p.x + i) + "," + (p.y - 1)] = Object.assign({}, p.event); }
      else if (p.say) r.events[(p.x + i) + "," + p.y] = { say: p.say };
    }
  });
  if (def.lightSwitch) { const [x, y] = def.lightSwitch; r.switchAt = { x, y }; r.events[x + "," + y] = { lights: true, key: id }; }
  if (def.lockers) def.lockers.forEach((x, i) => { r.events[x + ",2"] = { locker: i }; });
  if (def.corkboardAt) { const [x] = def.corkboardAt; r.corkAt = { x, y: 1 }; r.events[x + ",2"] = r.events[(x + 1) + ",2"] = { corkboard: true }; }
  if (def.leaderboardAt) { const [x] = def.leaderboardAt; r.boardAt = { x, y: 1 }; r.events[x + ",2"] = r.events[(x + 1) + ",2"] = { leaderboard: true }; }
  if (def.timeClock) { const [x, y] = def.timeClock; r.clockAt = { x, y }; r.events[x + "," + y] = { timeClock: true }; }
  if (def.eotmAt) r.eotmAt = { x: def.eotmAt[0], y: def.eotmAt[1] };
  if (def.screenAt) { const [x, y] = def.screenAt; r.screenAt = { x, y }; for (let i = 0; i < SLOT.theater_screen.w / T; i++) r.events[(x + i) + "," + (y + 1)] = { screen: true }; }
  if (def.posters) { r.posters = def.posters.map(([x, y, side]) => ({ x, y, side })); r.posters.forEach(p => { r.events[p.x + "," + p.y] = r.events[p.x + "," + (p.y + 1)] = { poster: true }; }); }
  if (def.floorLights) r.floorLights = def.floorLights.map(([x, y, side]) => ({ x, y, side }));
  if (def.marqueeAt) { const [x, y] = def.marqueeAt; r.marquee = { x, y }; } // a big arched doorway over two doorway tiles (the screening nook's)
  if (def.nowPlayingAt) { const [x, y] = def.nowPlayingAt; r.nowSign = { x, y }; for (let i = 0; i < SLOT.led_sign.w / T; i++) r.events[(x + i) + "," + (y + 1)] = { nowPlaying: true }; }
  if (def.intercom) { const [x, y] = def.intercom; r.intercomAt = { x, y }; r.events[x + "," + y] = { announce: true }; }
  if (def.wallArt) {
    r.wallArt = def.wallArt;
    def.wallArt.forEach(w => { for (let i = 0; i < SLOT[w.key].w / T; i++) r.events[(w.x + i) + "," + ((w.y || 1) + 1)] = w.cafe && w.key !== "cafe_menu" ? { cafe: true } : { say: w.say || ["The café menu."] }; });
  }
  r.decals = def.decals || []; r.glows = def.glows || []; r.bunting = !!def.bunting;
  // Hallway dressing: carpet runner tiles [x, y, "h0".."v2"], accent lights on the wall [x, y], and arrow signs pointing the way.
  r.runners = runnerTiles(def);
  r.lamps = (def.lamps || []).filter(Array.isArray);
  r.arrows = (def.arrows || []).filter(a => a && typeof a === "object");
  r.murals = (def.murals || []).filter(m => m && SLOT[m.key]).map(m => ({ x: m.x | 0, y: m.y | 0, w: Math.max(1, m.w | 0 || 1), key: m.key, at: Number.isFinite(m.at) ? Math.max(0, m.at | 0) : -1 })); // at: which part of the art (pixels from its left)
  r.arrows.forEach(a => { for (let i = 0; i < (a.w || 4); i++) { const k = (a.x + i) + "," + ((a.y || 1) + 1); if (!r.events[k]) r.events[k] = { arrow: a }; } });
  if (def.catSpots && o.catRoom === id) {
    const [x, y] = def.catSpots[o.catIndex % def.catSpots.length];
    if (!r.solid[y][x] || r.props.some(p => p.catBed && p.x === x && p.y === y)) { r.cat = { x, y }; r.solid[y][x] = true; r.events[x + "," + y] = { cat: true }; }
  }
  if (def.featuredAt) { const [x, y] = def.featuredAt; r.featuredAt = { x, y }; r.solid[y][x] = true; r.events[x + "," + y] = { featured: true }; }
  if (def.mugSpots && o.mugRoom === id) {
    let [x, y] = def.mugSpots[o.mugIndex % def.mugSpots.length];
    if (r.cat && r.cat.x === x && r.cat.y === y) [x, y] = def.mugSpots[(o.mugIndex + 1) % def.mugSpots.length];
    r.mug = { x, y }; r.solid[y][x] = true; r.events[x + "," + y] = { mug: true, x, y };
  }
  (def.spots || []).forEach((s, i) => { // a painting spot: its column (the top wall), or [x, y] on any wall (y: the upper wall row)
    const p = o.community[(o.spotStart[id] || 0) + i]; if (!p) return;
    const x = Array.isArray(s) ? s[0] : s, y = Array.isArray(s) ? s[1] : 1;
    const spot = { x, y, piece: p, state: spotState(p, o) };
    r.hung.push(spot);
    r.events[x + "," + (y + 1)] = r.events[(x + 1) + "," + (y + 1)] = { spot };
  });
  r.cases = [];
  (def.cases || []).forEach(([x, y], i) => {
    if (!r.solid[y]) return;
    r.solid[y][x] = true;
    const p = (o.caseFor[id] || [])[i];
    const c = { x, y, piece: p || null, state: p ? spotState(p, o) : "empty", isCase: true };
    r.cases.push(c); r.events[x + "," + y] = { caseAt: c };
  });
  (def.events || []).forEach(e => (r.events[e.x + "," + e.y] = Object.assign({ bump: !!e.warp }, e)));
  if (lay) { // the museum: zones, a light switch in each room, doorways and stairs from the blueprint
    r.zones = lay.zones; r.zoneAt = lay.zoneAt;
    r.switches = lay.lights.map(l => ({ x: l.x, y: l.y, key: id + ":" + l.zone }));
    r.switches.forEach(sw => (r.events[sw.x + "," + sw.y] = { lights: true, key: sw.key }));
    lay.doors.forEach(d => (r.events[d.x + "," + d.y] = { bump: true, warp: d.warp }));
  }
  if (def.windowAt) r.windowAt = { x: def.windowAt[0], y: def.windowAt[1] };
  r.stairs = [];
  (def.stairs || []).concat(lay ? lay.stairs : []).forEach(st => {
    if (!r.solid[st.y]) return;
    r.stairs.push(st); r.solid[st.y][st.x] = false;
    if (st.roof) { r.solid[st.y][st.x] = true; r.events[st.x + "," + st.y] = { roofStairs: true, bump: true }; }
    else if (st.to) r.events[st.x + "," + st.y] = { warp: st.to, step: true };
  });
  // A crowd: extra visitors on medium and heavy days (more on reveal days, fewer at night), placed on free floor.
  const extra = [];
  // The museum: visitors stand around in its rooms (not the hallways); each belongs to a room and strolls there.
  const zoneIdAt = (x, y) => (lay && lay.zoneAt[y] && lay.zoneAt[y][x] >= 0 ? lay.zones[lay.zoneAt[y][x]].id : null);
  const roomZone = (x, y) => { const z = lay && lay.zoneAt[y] ? lay.zoneAt[y][x] : -1; return z >= 0 && lay.zones[z].kind === "room"; };
  // How many people: a gallery holds at most 5 (3 on medium days), the lobby at most 1, counting visitors placed in the editor.
  // The shop is special (below). Nights are quieter.
  const wanderers = (def.visitors || []).filter(v => !(v.still || v.staff || v.patrol || v.usher || v.role) && (!v.day || o.tod !== "night") && (!v.night || o.tod === "night")).length;
  const isGallery = (def.cases || []).length || (def.spots || []).length, isShop = (def.props || []).some(p => p.key === "shop_counter" || p.key === "cafe_counter");
  const someone = () => ({ sheet: ["visitor_a", "visitor_b", "visitor_c"][Math.floor(Math.random() * 3)], x: 0, y: 0, random: true, lines: [CROWD_LINES[Math.floor(Math.random() * CROWD_LINES.length)]] });
  if (def.crowd && !o.closing && lay) {
    // Two or three per room with cases (fewer at night), plus whoever the curator placed there.
    lay.zones.filter(z => z.kind === "room" && (def.cases || []).some(([x, y]) => zoneIdAt(x, y) === z.id)).forEach(z => {
      let cap = o.crowd === "heavy" ? 3 : 2; if (o.tod === "night") cap = Math.ceil(cap / 2);
      const here = (def.visitors || []).filter(v => !(v.still || v.staff || v.patrol || v.usher || v.role) && zoneIdAt(v.x, v.y) === z.id).length;
      for (let i = 0; i < cap - here; i++) extra.push(Object.assign(someone(), { zone: z.id }));
    });
  } else if (def.crowd && !o.closing && !isShop) {
    let cap = isGallery ? (o.crowd === "heavy" ? 5 : 3) : 1;
    if (o.tod === "night") cap = Math.ceil(cap / 2);
    for (let i = 0; i < cap - wanderers; i++) extra.push(someone());
  }
  // Wandering visitors (not staff) start somewhere random each time: never on a doorway, a case's front or back,
  // in front of a painting, beside the start spot, or anywhere that would cut one part of the room off from another.
  const okSpots = lay ? safeSpots(r, def, roomZone, 80) : safeSpots(r, def);
  r.noWander = noWanderTiles(id, r, def);
  (def.visitors || []).concat(extra).forEach(v => { delete v._x; delete v._y; });
  (def.visitors || []).concat(extra).forEach(v => {
    if (v.still || v.staff || v.patrol || v.usher || v.role) return;
    const placed = (def.visitors || []).concat(extra).filter(o => o._x !== undefined && o !== v);
    if (lay) v.zone = v.zone || zoneIdAt(v.x, v.y); // in the museum, each visitor starts in (and belongs to) a room
    const pool = lay && v.zone ? okSpots.filter(([x, y]) => zoneIdAt(x, y) === v.zone) : okSpots;
    const spread = pool.filter(([x, y]) => placed.every(o => Math.abs(o._x - x) + Math.abs(o._y - y) >= 3));
    const from = spread.length ? spread : pool, pick = from.length ? from[Math.floor(Math.random() * from.length)] : null;
    if (pick) { okSpots.splice(okSpots.indexOf(pick), 1); v._x = pick[0]; v._y = pick[1]; r.solid[pick[1]][pick[0]] = true; }
  });
  (def.visitors || []).concat(extra).forEach(v => { if (v._x !== undefined) r.solid[v._y][v._x] = false; });
  // The shop: one person frozen in front of a decorative wall shelf, forever deciding; in the café, one sitting on a
  // random stool and (on busy days) one wandering near the café.
  if (def.crowd && !o.closing && isShop && o.tod !== "night") {
    const cc = lay && (def.props || []).find(p => p.key === "cafe_counter" || p.key === "shop_counter"), cz = cc ? zoneIdAt(cc.x, cc.y) : null; // the museum: the café's own room
    const free = (x, y) => r.solid[y] && !r.solid[y][x] && !r.events[x + "," + y] && !extra.some(v => v._x === x && v._y === y) && (!cz || zoneIdAt(x, y) === cz);
    const cafeX = Math.min(...(def.props || []).filter(p => /^cafe_/.test(p.key)).map(p => p.x).concat([r.w]));
    const shelves = (def.wallArt || []).filter(w => w.key === "shop_shelves" && w.x < cafeX - 2), spots = [];
    shelves.forEach(w => { for (let i = 0; i < SLOT[w.key].w / T; i++) if (free(w.x + i, (w.y || 1) + 2)) spots.push([w.x + i, (w.y || 1) + 2]); });
    if (spots.length) { const [x, y] = spots[Math.floor(Math.random() * spots.length)]; extra.push(Object.assign(someone(), { _x: x, _y: y, still: true, dir: "up", lines: BROWSE_LINES, zone: cz })); }
    const stools = (def.props || []).filter(p => p.key === "cafe_stool" && p.sit);
    if (stools.length) { const st = stools[Math.floor(Math.random() * stools.length)]; extra.push(Object.assign(someone(), { _x: st.x, _y: st.y, still: true, sitting: true, dir: st.sit, lines: SIT_LINES, zone: cz })); }
    if (o.crowd === "heavy") {
      let cands = okSpots.filter(([x, y]) => x >= cafeX - 1 && (!cz || zoneIdAt(x, y) === cz));
      if (!cands.length) for (let y = 3; y < r.h - 1; y++) for (let x = cafeX - 1; x < r.w - 1; x++) if (free(x, y) && !(r.noWander && r.noWander.has(x + "," + y))) cands.push([x, y]);
      if (!cands.length) for (let y = 3; y < r.h - 1; y++) for (let x = cafeX - 1; x < r.w - 1; x++) if (free(x, y)) cands.push([x, y]);
      if (cands.length) { const [x, y] = cands[Math.floor(Math.random() * cands.length)]; extra.push(Object.assign(someone(), { _x: x, _y: y, zone: cz })); }
    }
  }
  const who = (def.visitors || []).concat(extra).filter(v => (!v.day || o.tod !== "night") && (!v.night || o.tod === "night") && (!o.closing || v.staff));
  r.npcs = who.filter(v => !v.random || v._x !== undefined).map(v => ({ sitting: !!v.sitting, still: v.still, staff: v.staff, patrol: v.patrol, usher: v.usher, role: v.role || (v.usher ? "usher" : undefined), slow: v.slow, goRight: true, pause: 0, stuck: 0,
    sheet: v.sheet, x: v._x !== undefined ? v._x : v.x, y: v._y !== undefined ? v._y : v.y, dir: DIRS_LIST.includes(v.dir) ? v.dir : "down", moving: false, prog: 0, step: false, bumpT: 0, timer: 60 + Math.random() * 120, lines: v.lines, lineI: -1,
    random: !!v.random, zone: v.zone || null,
  }));
  return r;
}

/* ---------- Game ---------- */
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: "down", down: "up", left: "right", right: "left" };
const KEYMAP = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  KeyZ: "a", Space: "a", KeyJ: "a", KeyX: "b", Escape: "start", Backspace: "bk", KeyK: "b", Enter: "start", KeyP: "start" }; // bk: back in menus, never a photo

class Game {
  constructor(wrap, pack, opts) {
    opts = opts || {};
    this.headless = !!opts.headless; this.curator = !!opts.curator; this.capture = opts.capture || "always"; this.hungNow = new Set();
    this.saveKey = opts.saveKey === undefined ? "goq-museum-progress" : opts.saveKey; // null = don't remember (the curator preview)
    this.progress = this.loadProgress(); this.lightsOff = new Set(); this.chore = null; this.closing = false; this.closed = false; this.flickI = 0; this.shift = {};
    this.forcedCrooked = new Set(); this.spook = null; this.figure = null; this.forceSpook = !!opts.spooky;
    this.tapWalk = !!opts.tapWalk; this.path = null; this.pathAct = null; this.camX = 0; this.camY = 0; this.haptics = opts.haptics !== false;
    this.timeOverride = ["day", "sunset", "night"].includes(opts.time) ? opts.time : null; this.lastTod = null; this.drink = null; this.sip = null;
    this.showTestBadge = !!opts.showTestBadge;
    this.board = null; this.boardAt = 0; this.boardErr = false; this.netWarned = false;
    this.dayStart = Object.assign({}, this.progress.tally); // what this visit added, for the ending screen
    this.wrap = wrap; wrap.classList.add("gt-wrap"); wrap.tabIndex = 0;
    this.canvas = document.createElement("canvas"); this.canvas.width = SW; this.canvas.height = SH; wrap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d"); this.ctx.imageSmoothingEnabled = false;
    this.t = 0; this.held = []; this.virt = []; this.queue = []; this.mode = "walk"; this.fade = 0; this.inputLock = false;
    this.cache = {}; this.overrides = {}; this.pieceImgs = {}; this.itemImgs = {}; this.packToken = 0;
    this.player = { sheet: "player", x: 0, y: 0, dir: "up", moving: false, prog: 0, step: false, bumpT: 0, turnT: 0, walking: false };
    this.buildDom(); this.bindInput();
    this.pack = normalizePack(pack); this.buildWorld();
    this.ready = null;
    // Pick up where you saved (Start, then Save), otherwise at the front doors.
    const w = this.saveKey && this.progress.where;
    if (w && this.rooms[w.room] && this.rooms[w.room].solid[w.y] && this.rooms[w.room].solid[w.y][w.x] === false) this.enterRoom(w.room, w.x, w.y, w.dir, true);
    else { const sp = ROOMS.lobby.spawn; this.enterRoom("lobby", sp[0], sp[1], sp[2], true); }
    this.ready = this.setPack(pack); this.updateHud();
    this.ready.then(() => { if (this.needTutorial()) this.startTutorial(); }); // a new player starts with the tutorial
    this.markDay();
    setTimeout(() => { if (!this.tut && !this.needTutorial()) this.showLoc("GOQ Museum: " + (this.zone ? this.zone.name : this.room.name)); }, 400);
    this.last = performance.now(); this.acc = 0;
    const tick = now => {
      this.acc += Math.min(100, now - this.last); this.last = now; this.pollPad();
      while (this.acc >= 1000 / 60) { this.update(); this.acc -= 1000 / 60; }
      this.draw(); requestAnimationFrame(tick);
    };
    if (!opts.headless) requestAnimationFrame(tick); // headless: drawn only when asked (the curator's map editor)
  }
  /* fine: quarter steps (touch layouts); otherwise whole steps from 2x up, like the Theater. Never below 1x unless the screen is narrower than the game. */
  fit(maxW, maxH, fine) {
    let s = Math.min(maxW / SW, maxH / SH);
    if (this.sharp) s = s >= 1 ? Math.floor(s) : Math.max(0.5, s); // Settings: Sharp pixels (whole numbers; smaller than 1x only if the screen is)
    else s = fine ? (s >= 1 ? Math.floor(s * 4) / 4 : Math.max(0.75, s)) : s >= 2 ? Math.floor(s) : Math.max(0.75, Math.floor(s * 8) / 8);
    this.wrap.style.setProperty("--s", s); this.scale = s;
  }

  /* ----- art ----- */
  async setPack(p) {
    const pack = normalizePack(p), token = ++this.packToken, ov = {}, pi = {}, ii = {};
    await Promise.all([
      ...Object.keys(pack.assets).map(async k => { const img = await loadImage(pack.assets[k].src); if (img) ov[k] = img; }),
      ...pack.pieces.filter(x => x.image).map(async x => { const img = await loadImage(x.image); if (img) pi[x.id] = img; }),
      ...pack.settings.shop.items.filter(x => x.image).map(async x => { const img = await loadImage(x.image); if (img) ii[x.id] = img; }),
    ]);
    this.itemImgs = ii;
    if (token !== this.packToken) return;
    // Keep the art already drawn (tiles, tints, murals) when the pack's art hasn't changed; redraw piece art either way.
    const sig = Object.keys(pack.assets).sort().map(k => k + ":" + pack.assets[k].src.length + pack.assets[k].src.slice(-24)).join("|");
    if (sig !== this.assetSig) { this.cache = {}; this.assetSig = sig; } else for (const k in this.cache) if (k.includes("|")) delete this.cache[k];
    this.pack = pack; this.overrides = ov; this.pieceImgs = pi;
    this.rebuild(); this.refreshBoard(true); this.refreshNotes(true);
    const tb = `url("${this.src("textbox")}")`;
    [this.el.text, this.el.choice, this.el.badgeForm, this.el.noteForm, this.el.shop, this.el.album, this.el.reader].forEach(e => (e.style.borderImageSource = tb));
  }
  /* The curator's room editor: new rooms only (nothing else in the pack changed), without reloading any art. */
  quickRooms(rooms) { if (!this.pack) return; applyRooms(rooms); this.pack.rooms = rooms; this.rebuild(); }
  rebuild() {
    const where = this.room ? [this.room.id, this.player.x, this.player.y, this.player.dir] : null;
    this.buildWorld();
    if (where) this.enterRoom(...where, true);
  }
  setCurator(on) { this.curator = !!on; this.rebuild(); }
  /* Put every piece with a future unveil date back in its crate (curator mode), to record the hang again. */
  resetHangs() { this.hungNow.clear(); this.hanging = null; this.rebuild(); }
  teleport(id) { // a room's id, or "museum:puzzle" for the middle of one of the museum's rooms or hallways
    const [room, zid] = String(id).split(":"), lay = zid && layoutOf(ROOMS[room]), z = lay && lay.zones.find(z => z.id === zid), b = z && (z.rect || z.rects[0]);
    const sp = b ? [b.x + (b.w >> 1), b.y + (b.h >> 1), "down"] : ROOMS[room].spawn;
    this.closeAll(); this.warp(room, sp[0], sp[1], sp[2]);
  }
  closeAll() { this.el.text.style.display = "none"; this.el.cu.style.display = "none"; this.txt = null; this.mode = "walk"; }
  sheet(key) {
    if (key.includes("@")) return this.cache[key] || this.tinted(key);
    return this.overrides[key] || this.cache[key] || (this.cache[key] = placeholder(key));
  }
  /* "lobby_wall_upper@#4a4a50": the art recolored to that color, keeping its light and shade (its average lands on the color). */
  tinted(key) {
    const [base, hex] = key.split("@"), src = this.sheet(base), w = src.naturalWidth || src.width, h = src.naturalHeight || src.height;
    if (!w || !h) return src;
    const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.drawImage(src, 0, 0);
    const img = x.getImageData(0, 0, w, h), d = img.data, [cr, cg, cb] = hexRgb(hex);
    let sum = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { sum += (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255; n++; }
    const mean = n ? sum / n : 0.5;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const l = Math.max(0, Math.min(1, 0.5 + ((0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255 - mean) * 1.2));
      const f = v => (l < 0.5 ? v * l * 2 : v + (255 - v) * (l * 2 - 1));
      d[i] = f(cr); d[i + 1] = f(cg); d[i + 2] = f(cb);
    }
    x.putImageData(img, 0, 0); return (this.cache[key] = c);
  }
  src(key) { return this.pack.assets[key] && this.overrides[key] ? this.pack.assets[key].src : this.sheet(key).toDataURL(); }
  frame(key) { const s = SLOT[key.split("@")[0]]; return s.frames > 1 && s.fps ? Math.floor((this.t / 60) * s.fps) % s.frames : 0; }
  drawSlot(key, col, row, dx, dy) {
    const s = SLOT[key.split("@")[0]], img = this.sheet(key), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const sx = col * s.w, sy = row * s.h, w = Math.min(s.w, iw - sx), h = Math.min(s.h, ih - sy);
    if (w > 0 && h > 0) this.ctx.drawImage(img, sx, sy, w, h, dx, dy, w, h);
  }
  /* A piece's art: its image if the pack has one, otherwise a placeholder painting. */
  pieceArt(p) {
    if (this.pieceImgs[p.id]) return this.pieceImgs[p.id];
    if (p.tut) { const ck = "tutart|" + p.art; if (!this.cache[ck]) { const c = document.createElement("canvas"); c.width = 24; c.height = 18; const x = c.getContext("2d"); x.fillStyle = p.art; x.fillRect(0, 0, 24, 18); this.cache[ck] = c; } return this.cache[ck]; } // the tutorial's games: just a color
    const ck = "paint|" + p.id; return this.cache[ck] || (this.cache[ck] = paint([paintingGrid(p)], 24, 18, 1, p.colors));
  }
  /* The piece as it hangs: art scaled into the frame's window, then the frame on top. */
  pieceOnWall(p) {
    const ck = "wall|" + p.id; if (this.cache[ck]) return this.cache[ck];
    const c = document.createElement("canvas"); c.width = 32; c.height = 32;
    const x = c.getContext("2d"), img = this.pieceArt(p), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const k = Math.max(24 / iw, 18 / ih), sw = 24 / k, sh = 18 / k;
    x.imageSmoothingEnabled = iw > 48; x.imageSmoothingQuality = "high";
    x.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 4, 4, 24, 18);
    x.imageSmoothingEnabled = false;
    const fk = p.kind === "episode" ? "wall_frame_gold" : "wall_frame_wood", f = this.sheet(fk);
    x.drawImage(f, 0, 0, 32, 32, 0, 0, 32, 32);
    if (p.pick) x.drawImage(this.sheet("pick_medal"), 0, 0, 8, 12, 24, 15, 8, 12); // curator's pick: pinned to the frame's front corner
    return (this.cache[ck] = c);
  }

  /* ----- input ----- */
  bindInput() {
    const isField = t => t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    window.addEventListener("keydown", e => {
      // Typing on a real keyboard while the note card shows its on-screen one: switch to typing for real.
      if (this.nkb && e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !isField(e.target)) { e.preventDefault(); this.nkbToNative(e.key); return; }
      const k = KEYMAP[e.code]; if (!k || isField(e.target) || e.target.tagName === "BUTTON" && (k === "a" || k === "start")) return;
      if (this.capture === "focus" && document.activeElement !== this.wrap) return;
      e.preventDefault(); if (e.repeat) return;
      this.lastInput = "keyboard";
      const ka = this.swapAB && (k === "a" || k === "b") ? (k === "a" ? "b" : "a") : k;
      if (ka === "a" && this.mode === "read" && this.rd && this.rd.sel >= 0) { this.rdUse(); return; }
      if (DIRS[k]) { this.held = this.held.filter(d => d !== k); this.held.push(k); }
      this.queue.push(this.swapAB && (k === "a" || k === "b") ? (k === "a" ? "b" : "a") : k); // Settings: Swap A and B
    });
    window.addEventListener("keyup", e => { const k = KEYMAP[e.code]; if (k && DIRS[k]) this.held = this.held.filter(d => d !== k); });
    window.addEventListener("blur", () => { this.held = []; this.virt = []; });
    this.wrap.addEventListener("pointerdown", e => {
      this.wrap.focus({ preventScroll: true });
      if (e.target === this.canvas) this.tapStart = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    // A short tap on the game screen (not a drag): advance text, or walk there if tap to walk is on.
    this.canvas.addEventListener("pointerup", e => {
      const st = this.tapStart; this.tapStart = null;
      if (!st || Math.hypot(e.clientX - st.x, e.clientY - st.y) > 12 || performance.now() - st.t > 600) return;
      if (this.mode === "text" || this.mode === "ended") { this.press("a"); return; }
      if (this.tapWalk) this.tapAt(e.clientX, e.clientY);
    });
  }
  /* ----- tap to walk -----
     Tap the floor to walk there. Tap a piece, person, prop or door to walk next to it, face it, and use it.
     Any D-pad or arrow key press takes back control. */
  tapAt(clientX, clientY) {
    if (this.mode !== "walk") return;
    const r = this.canvas.getBoundingClientRect();
    const gx = ((clientX - r.left) / r.width) * SW + this.camX, gy = ((clientY - r.top) / r.height) * SH + this.camY;
    let tx = Math.floor(gx / T), ty = Math.floor(gy / T); const room = this.room;
    if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return;
    // Tapping high on a wall piece or a tall prop means the thing itself.
    if (ty <= 1 && room.events[tx + ",2"]) ty = 2;
    if (!room.events[tx + "," + ty] && room.events[tx + "," + (ty + 1)] && room.solid[ty][tx]) ty += 1;
    const p = this.player;
    if (p.sitting) this.standUp(p.dir);
    const npc = room.npcs.find(n => n.x === tx && n.y === ty);
    const ev = room.events[tx + "," + ty];
    this.tapMark = { x: tx, y: ty, t: 40 };
    if (!npc && !room.solid[ty][tx]) { const path = this.findPath(p.x, p.y, tx, ty); if (path) { this.path = path; this.pathAct = null; this.pathTries = 0; } return; }
    if (!npc && !ev) return;
    // Walk to the best tile next to it, then face it.
    let best = null;
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      const sx = tx - dx, sy = ty - dy;
      if (sx < 0 || sy < 0 || sx >= room.w || sy >= room.h) continue;
      if (!(sx === p.x && sy === p.y) && this.blocked(sx, sy, p)) continue;
      const path = sx === p.x && sy === p.y ? [] : this.findPath(p.x, p.y, sx, sy);
      if (path && (!best || path.length < best.path.length)) best = { path, face: d };
    }
    if (!best) return;
    this.path = best.path; this.pathAct = { face: best.face, bump: !!(ev && ev.bump) }; this.pathTries = 0;
  }
  /* Shortest route on the room grid, around walls, props and people. Returns a list of directions. */
  findPath(sx, sy, tx, ty) {
    const r = this.room, W = r.w, prev = new Map(), start = sy * W + sx, goal = ty * W + tx, q = [start];
    prev.set(start, -1);
    for (let qi = 0; qi < q.length; qi++) {
      const c = q[qi]; if (c === goal) break;
      const cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = cx + dx, ny = cy + dy, k = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= r.h || prev.has(k)) continue;
        if (k !== goal && this.blocked(nx, ny, this.player)) continue;
        if (k === goal && r.solid[ny][nx]) continue;
        prev.set(k, c); q.push(k);
      }
    }
    if (!prev.has(goal)) return null;
    const out = []; let c = goal;
    while (prev.get(c) !== -1) {
      const pc = prev.get(c), dx = (c % W) - (pc % W), dy = ((c / W) | 0) - ((pc / W) | 0);
      out.unshift(dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up"); c = pc;
    }
    return out;
  }
  followPath() {
    const p = this.player;
    if (this.path.length) {
      const d = this.path[0];
      if (this.tryMove(p, d)) { this.path.shift(); p.walking = true; return; }
      // Someone stepped in the way: find a new route to the same place, a couple of times.
      if (++this.pathTries > 3) { this.path = null; this.pathAct = null; return; }
      let x = p.x, y = p.y; this.path.forEach(k => { x += DIRS[k][0]; y += DIRS[k][1]; });
      this.path = this.findPath(p.x, p.y, x, y) || [];
      if (!this.path.length) { this.path = null; this.pathAct = null; }
      return;
    }
    const act = this.pathAct; this.path = null; this.pathAct = null; p.walking = false;
    if (!act) return;
    p.dir = act.face;
    if (act.bump) this.tryMove(p, act.face); else this.interact();
  }
  hold(dir, on, src) { this.virt = this.virt.filter(d => d !== dir); if (on) { this.lastInput = src || "touch"; this.virt.push(dir); this.queue.push(dir); } }
  press(btn, src) { this.lastInput = src || "touch"; this.queue.push(btn); }
  /* A game controller (standard layout): D-pad or left stick to move, bottom button A, right button B, Start or Select to pause.
     It goes through the same path as the on-screen buttons, so every menu, placard and keypad works with it. */
  pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [], gp = [...(pads || [])].find(g => g && g.connected && g.buttons && g.buttons.length >= 10);
    const was = this.padDirs || [];
    if (!gp) { was.forEach(d => this.hold(d, false)); this.padDirs = []; this.padPrev = {}; return; }
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, dirs = [];
    if (b(12) || ay < -0.5) dirs.push("up"); if (b(13) || ay > 0.5) dirs.push("down");
    if (b(14) || ax < -0.5) dirs.push("left"); if (b(15) || ax > 0.5) dirs.push("right");
    was.filter(d => !dirs.includes(d)).forEach(d => this.hold(d, false));
    dirs.filter(d => !was.includes(d)).forEach(d => this.hold(d, true, "pad"));
    this.padDirs = dirs;
    const now = { a: b(this.swapAB ? 1 : 0), b: b(this.swapAB ? 0 : 1), start: b(9) || b(8) }, prev = this.padPrev || {};
    for (const k in now) if (now[k] && !prev[k]) this.press(k, "pad");
    if (!this.padSeen && (dirs.length || now.a || now.b || now.start)) { this.padSeen = true; this.showLoc("Controller connected"); }
    this.padPrev = now;
  }
  heldDir() { const all = this.held.concat(this.virt); return all.length ? all[all.length - 1] : null; }

  /* ----- UI ----- */
  buildDom() {
    const h = (cls, parent, tag) => { const e = document.createElement(tag || "div"); e.className = cls; (parent || this.wrap).appendChild(e); return e; };
    const el = this.el = {};
    el.loc = h("gt-loc");
    el.cu = h("gt-closeup"); el.cuFrame = h("gt-cu-frame", el.cu); el.cuImg = h("", el.cuFrame, "img");
    el.cuLinks = h("gt-cu-links", el.cu);
    el.cuLinks.addEventListener("click", e => e.stopPropagation());
    el.text = h("gt-box gt-text"); el.textBody = h("gt-text-body", el.text); el.more = h("gt-more", el.text);
    el.text.addEventListener("click", () => this.press("a"));
    el.choice = h("gt-box gt-choice");
    el.hud = h("gt-shift");
    el.shop = h("gt-box gt-shop");
    el.album = h("gt-box gt-shop gt-album");
    el.reader = h("gt-box gt-reader");
    el.reader.addEventListener("click", e => { if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return; e.stopPropagation(); if (this.rd && this.rd.sel >= 0) this.rdUse(); else this.press("a"); });
    el.badgeWrap = h("gt-badgewrap");
    el.badgeForm = h("gt-box gt-badge", el.badgeWrap, "form");
    el.badgeForm.innerHTML = '<div class="gt-badge-main"><p class="gt-badge-title">STAFF ENTRANCE</p>' +
      '<p class="gt-badge-sub">Patreon members get a staff badge. On shift, your chores count toward Employee of the Month.</p>' +
      '<label>Badge number<input name="badge" autocomplete="off" inputmode="numeric" maxlength="12"></label>' +
      '<label>Badge key<input name="key" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="ABC-123"></label>' +
      '<p class="gt-badge-test">Offline test badge: 0001, key QQQ-QQQ</p>' +
      '<p class="gt-badge-err" role="alert"></p>' +
      '<div class="gt-badge-btns"><button type="submit">Clock in</button><button type="button" class="ghost">Not now</button></div>' +
      '<button type="button" class="gt-badge-native">Use my phone\'s keyboard</button><button type="button" class="gt-badge-kpback">Use the in-game keypad</button></div>' +
      '<div class="gt-keypad" role="group" aria-label="Keypad"></div>';
    el.keypad = el.badgeForm.querySelector(".gt-keypad");
    el.badgeForm.querySelector(".gt-badge-native").addEventListener("click", () => this.nativeKeyboard());
    el.badgeForm.querySelector(".gt-badge-kpback").addEventListener("click", () => this.useKeypad());
    // On the keypad, tapping a field picks which one you're typing into.
    ["badge", "key"].forEach(n => el.badgeForm[n].addEventListener("pointerdown", e => { if (this.kp) { e.preventDefault(); this.kpField(n); } }));
    el.badgeForm.key.addEventListener("input", e => { const t = e.target, v = normKey(t.value).slice(0, 6); t.value = v.length > 3 ? v.slice(0, 3) + "-" + v.slice(3) : v; });
    el.badgeForm.addEventListener("submit", e => { e.preventDefault(); this.submitBadge(); });
    el.badgeForm.querySelector(".ghost").addEventListener("click", () => this.closeBadge());
    el.badgeForm.addEventListener("focusin", () => el.badgeWrap.classList.add("kb"));
    el.badgeForm.addEventListener("focusout", () => setTimeout(() => { if (!el.badgeForm.contains(document.activeElement)) el.badgeWrap.classList.remove("kb"); }, 50));
    el.badgeForm.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); this.closeBadge(); } if (!this.kp) e.stopPropagation(); });
    // The note card: a visitor's note on a piece (it goes to the curator to approve first).
    el.noteWrap = h("gt-badgewrap gt-notewrap");
    el.noteForm = h("gt-box gt-badge gt-note", el.noteWrap, "form");
    el.noteForm.innerHTML = '<p class="gt-badge-title">LEAVE A NOTE</p><p class="gt-badge-sub"></p>' +
      '<label>Your note<textarea name="note" maxlength="200" rows="3" spellcheck="true"></textarea></label><p class="gt-note-count"></p>' +
      '<label>Your name (optional)<input name="who" maxlength="24" autocomplete="nickname"></label>' +
      '<p class="gt-badge-err" role="alert"></p>' +
      '<div class="gt-notekb" hidden></div><p class="gt-notekb-hint">Start: pin it up \u00b7 B: delete \u00b7 <button type="button" class="gt-notekb-native">Type with my keyboard</button></p>' +
      '<div class="gt-badge-btns"><button type="submit">Pin it up</button><button type="button" class="ghost">Not now</button></div>';
    el.noteKb = el.noteForm.querySelector(".gt-notekb");
    el.noteForm.querySelector(".gt-notekb-native").addEventListener("click", e => { e.preventDefault(); this.nkbToNative(); });
    NOTE_KEYS.forEach((k, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = k.label || k.k; if (k.span > 1) b.style.gridColumn = "span " + k.span;
      b.addEventListener("pointerdown", e => e.preventDefault()); b.addEventListener("click", e => { e.preventDefault(); if (this.nkb) { this.nkb.i = i; this.nkbPress(); } }); el.noteKb.appendChild(b); });
    el.noteForm.note.addEventListener("input", () => this.noteCount());
    el.noteForm.addEventListener("submit", e => { e.preventDefault(); this.submitNote(); });
    el.noteForm.querySelector(".ghost").addEventListener("click", () => this.closeNote());
    el.noteForm.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); this.closeNote(); } e.stopPropagation(); });
    // The screening nook's video: the episode plays over the game; B, Start or the button closes it.
    el.tv = h("gt-tv"); el.tv.innerHTML = '<div class="gt-tv-bar"><span class="gt-tv-t"></span><a class="gt-tv-yt" target="_blank" rel="noopener">YouTube \u2197</a><button type="button" class="gt-tv-x">Close (B)</button></div><div class="gt-tv-box"></div>';
    el.tv.querySelector(".gt-tv-x").addEventListener("click", e => { e.stopPropagation(); this.closeTv(); });
    el.endWrap = h("gt-endwrap");
    el.end = h("gt-end", el.endWrap);
    el.end.innerHTML = '<p class="gt-end-sign">CLOSED</p><p class="gt-end-line">The museum is closed for the night.</p><p class="gt-end-sum"></p>' +
      '<button type="button" class="gt-end-btn">Open the museum again</button><p class="gt-end-hint">or refresh the page</p>';
    el.end.querySelector("button").addEventListener("click", () => this.reopen());
    if (!document.getElementById("gt-end-css")) {
      const st = document.createElement("style"); st.id = "gt-end-css";
      st.textContent = `.gt-endwrap{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;z-index:8}
.gt-end{box-sizing:border-box;width:calc(184px * var(--s));border-style:solid;border-width:calc(8px * var(--s));border-image-slice:8 fill;border-image-repeat:stretch;
  background:#f8f8f0;background-clip:padding-box;color:#181820;text-align:center;padding:calc(4px * var(--s)) calc(4px * var(--s)) calc(2px * var(--s));image-rendering:pixelated;
  animation:gtEndIn .5s steps(5) both}
.gt-end p{margin:0}
.gt-end-sign{font-size:calc(16px * var(--s));line-height:1.3;letter-spacing:.06em;color:#a33a22;margin-bottom:calc(6px * var(--s)) !important}
.gt-end-line,.gt-end-sum{font-size:calc(6px * var(--s));line-height:1.6}
.gt-end-sum{color:#505068;margin-top:calc(4px * var(--s)) !important;min-height:1.6em;white-space:pre-line}
.gt-end-btn{margin-top:calc(8px * var(--s));font-family:inherit;font-size:calc(6px * var(--s));padding:calc(4px * var(--s)) calc(6px * var(--s));background:#181820;color:#f8f8f0;
  border:calc(1px * var(--s)) solid #181820;cursor:pointer}
.gt-end-btn:hover,.gt-end-btn:focus-visible{background:#e8b24a;color:#181820;outline:none}
.gt-end-hint{font-size:calc(5px * var(--s));color:#505068;margin-top:calc(3px * var(--s)) !important}
.gt-shift{position:absolute;right:calc(3px * var(--s));top:calc(3px * var(--s));display:none;gap:calc(2px * var(--s));z-index:6;pointer-events:none}
.gt-shift .chip{padding:calc(2px * var(--s)) calc(3px * var(--s));font-size:calc(5px * var(--s));line-height:1.3;border:calc(1px * var(--s)) solid #f8f0c0;
  box-shadow:0 0 0 calc(1px * var(--s)) #181820;white-space:nowrap;opacity:.92}
.gt-shift .shift{background:#2f6b4f;color:#f8f0c0}
.gt-shift .tok{background:#7c5a0c;color:#fff6cc}
.gt-shift .pulse{animation:gtPulse .5s steps(3)}
@keyframes gtPulse{50%{transform:scale(1.25)}}
.gt-shift b{font-weight:normal;color:#fff;margin-right:calc(3px * var(--s))}
.gt-shop{left:calc(8px * var(--s));right:calc(8px * var(--s));top:calc(6px * var(--s));bottom:calc(6px * var(--s));padding:0 calc(4px * var(--s));z-index:7;
  display:none;font-size:calc(6px * var(--s));line-height:1.4;overflow:hidden}
.gt-shop-head{display:flex;justify-content:space-between;color:#7c5a0c;font-size:calc(7px * var(--s));margin:0 0 calc(3px * var(--s))}
.gt-shop-list{max-height:calc(80px * var(--s));overflow:auto}
.gt-shop-row{display:flex;align-items:center;gap:calc(4px * var(--s));padding:calc(1px * var(--s)) calc(2px * var(--s)) calc(1px * var(--s)) calc(8px * var(--s));position:relative;cursor:pointer}
.gt-shop-row.on::before{content:"";position:absolute;left:0;top:50%;margin-top:calc(-4px * var(--s));border-top:calc(4px * var(--s)) solid transparent;border-bottom:calc(4px * var(--s)) solid transparent;border-left:calc(5px * var(--s)) solid #181820}
.gt-shop-row img{width:calc(12px * var(--s));height:calc(12px * var(--s));image-rendering:pixelated;flex:none}
.gt-shop-row .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gt-shop-row .pr{color:#505068}
.gt-album{padding-top:calc(3px * var(--s)) !important}
.gt-reader{left:calc(6px * var(--s));right:calc(6px * var(--s));top:calc(4px * var(--s));bottom:calc(4px * var(--s));padding:0 calc(4px * var(--s));z-index:7;display:none;overflow:hidden}
.gt-rd-head{display:flex;gap:calc(5px * var(--s));align-items:center;padding-bottom:calc(3px * var(--s));border-bottom:calc(1px * var(--s)) solid #b0b0c0}
.gt-rd-head img{width:calc(40px * var(--s));height:calc(30px * var(--s));object-fit:cover;image-rendering:pixelated;border:calc(1px * var(--s)) solid #181820;flex:none;background:#000}
.gt-rd-head img.photo{image-rendering:auto}
.gt-rd-head img.item{object-fit:contain;background:#f8f4ec}
.gt-rd-links{display:flex;flex-direction:column;gap:calc(2px * var(--s));flex:none;margin-left:auto}
.gt-rd-links a{display:block;text-align:center;font-family:var(--pixel, monospace);font-size:calc(5px * var(--s));line-height:1;color:#fff8ec;text-decoration:none;padding:calc(3px * var(--s)) calc(4px * var(--s));border:calc(1px * var(--s)) solid #181820;border-radius:calc(1px * var(--s));box-shadow:0 calc(1px * var(--s)) 0 #181820;white-space:nowrap;cursor:pointer}
.gt-rd-links a.watch{background:#b8382c}.gt-rd-links a.play{background:#2f6f3a}
.gt-rd-pre .gt-rd-body{white-space:pre-wrap}
.gt-rd-links button.note{display:block;text-align:center;font-family:var(--pixel, monospace);font-size:calc(5px * var(--s));line-height:1;color:#181820;background:#f0c040;padding:calc(3px * var(--s)) calc(4px * var(--s));border:calc(1px * var(--s)) solid #181820;border-radius:calc(1px * var(--s));box-shadow:0 calc(1px * var(--s)) 0 #181820;white-space:nowrap;cursor:pointer;margin:0}
.gt-rd-links.three{gap:calc(1px * var(--s))}
.gt-rd-links.three a,.gt-rd-links.three button.note{padding:calc(2px * var(--s)) calc(4px * var(--s))} /* three buttons fit beside the picture */
.gt-rd-links .sel{outline:calc(1px * var(--s)) solid #181820;outline-offset:calc(1px * var(--s));filter:brightness(1.15)}
.gt-rd-links button.note:hover,.gt-rd-links button.note:focus-visible{filter:brightness(1.1);outline:calc(1px * var(--s)) solid #181820}
.gt-rd-links a:hover,.gt-rd-links a:focus-visible{filter:brightness(1.15);outline:calc(1px * var(--s)) solid #fff8ec}
.gt-rd-t{flex:1;min-width:0;font-size:calc(7px * var(--s));line-height:1.35;color:#181820}
.gt-pick{display:inline-flex;align-items:center;gap:calc(2px * var(--s));margin-top:calc(1.5px * var(--s));font-family:var(--pixel, monospace);font-size:calc(4.5px * var(--s));line-height:1;color:#9a5a10}
.gt-pick img{width:calc(5px * var(--s));height:calc(7.5px * var(--s));image-rendering:pixelated;flex:none}
.gt-shop-row .gt-pick.sm{margin:0 0 0 calc(2px * var(--s));flex:none}
.gt-rd-t small{display:block;font-size:calc(5.5px * var(--s));color:#505068;margin-top:calc(1px * var(--s))}
.gt-rd-body{font-family:'Atkinson Hyperlegible','Segoe UI',system-ui,sans-serif;font-size:calc(7.5px * var(--s));line-height:1.42;color:#202030;height:calc(76px * var(--s));overflow:hidden;margin-top:calc(3px * var(--s));white-space:pre-wrap}
.gt-rd-body b{display:block;font-family:var(--pixel, monospace);font-weight:normal;font-size:calc(5.5px * var(--s));color:#7c5a0c;letter-spacing:.04em;margin-bottom:calc(2px * var(--s))}
.gt-rd-foot{display:flex;justify-content:flex-end;align-items:center;font-size:calc(5.5px * var(--s));color:#505068;border-top:calc(1px * var(--s)) solid #b0b0c0;padding-top:calc(2px * var(--s))}
.gt-rd-foot a{color:#181820;margin-right:calc(5px * var(--s))}
.gt-album-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:calc(4px * var(--s));max-height:calc(86px * var(--s));overflow:auto;padding:calc(2px * var(--s))}
.gt-polaroid{background:#fffef8;border:calc(1px * var(--s)) solid #b0b0c0;padding:calc(2px * var(--s)) calc(2px * var(--s)) calc(5px * var(--s));cursor:pointer;transform:rotate(-1.5deg)}
.gt-polaroid:nth-child(2n){transform:rotate(1.5deg)}
.gt-polaroid img{display:block;width:100%;aspect-ratio:4/3;image-rendering:pixelated}
.gt-polaroid.on{outline:calc(2px * var(--s)) solid #e8b24a;transform:none}
.gt-shop-detail{margin:calc(3px * var(--s)) 0 0;padding-top:calc(3px * var(--s));border-top:calc(1px * var(--s)) solid #b0b0c0;color:#303048;min-height:3em}
.gt-choice{right:0;bottom:calc(48px * var(--s));min-width:calc(80px * var(--s));max-width:calc(236px * var(--s));max-height:calc(110px * var(--s));overflow:auto;padding:0 calc(6px * var(--s));z-index:6}
.gt-choice-item{position:relative;padding-left:calc(9px * var(--s));cursor:pointer;white-space:normal;line-height:1.5}
@media (pointer:coarse){.gt-choice-item{padding-top:calc(2px * var(--s));padding-bottom:calc(2px * var(--s))}.gt-shop-row{min-height:calc(15px * var(--s))}}
.gt-shift .chip{font-size:max(calc(5px * var(--s)), 8px) !important}
.gt-badge,.gt-shop{font-size:max(calc(6px * var(--s)), 9px) !important}
.gt-badgewrap.kb{align-items:flex-start;padding-top:calc(4px * var(--s))}
/* On small game screens the badge form breaks out to fill the phone screen, so it's easy to read and type in. */
.gt-badgewrap.big{position:fixed;inset:0;z-index:30;align-items:flex-start;padding-top:max(16px, env(safe-area-inset-top, 0px))}
.gt-badgewrap.big .gt-badge{--s:1.6;width:min(94vw,360px);max-height:calc(100dvh - 32px);font-size:10px !important}
.gt-choice-item.on::before{content:"";position:absolute;left:0;top:calc(4px * var(--s));border-top:calc(4px * var(--s)) solid transparent;border-bottom:calc(4px * var(--s)) solid transparent;border-left:calc(5px * var(--s)) solid #181820}
.gt-badgewrap{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,8,24,.7);z-index:7}
.gt-badge.kp:not(.big){width:calc(228px * var(--s))}
.gt-badge{position:relative;display:block;width:calc(212px * var(--s));max-height:calc(154px * var(--s));overflow:auto;padding:0 calc(4px * var(--s));line-height:1.4;font-size:calc(6px * var(--s))}
.gt-badge p{margin:0 0 calc(2px * var(--s))}
.gt-badge-title{font-size:calc(9px * var(--s));color:#2f6b4f}
.gt-badge-sub{color:#505068}
.gt-badge label{display:block;margin-top:calc(2px * var(--s))}
.gt-badge input{display:block;width:100%;box-sizing:border-box;margin-top:calc(1px * var(--s));font-family:inherit;font-size:calc(7px * var(--s));padding:calc(2px * var(--s)) calc(3px * var(--s));
  border:calc(1px * var(--s)) solid #181820;background:#fff;color:#181820;outline:none}
.gt-badge input:focus{box-shadow:0 0 0 calc(1px * var(--s)) #e8b24a}
.gt-badge textarea{display:block;width:100%;box-sizing:border-box;margin-top:calc(1px * var(--s));font-family:inherit;font-size:calc(7px * var(--s));line-height:1.3;padding:calc(2px * var(--s)) calc(3px * var(--s));
  border:calc(1px * var(--s)) solid #181820;background:#fff;color:#181820;outline:none;resize:none}
.gt-badge textarea:focus{box-shadow:0 0 0 calc(1px * var(--s)) #e8b24a}
.gt-note-count{text-align:right;color:#505068;font-size:.85em}
.gt-scr{position:absolute;overflow:hidden;pointer-events:none;background:#000}
.gt-scr iframe{position:absolute;left:-12%;top:-12%;width:124%;height:124%;border:0;filter:saturate(.85) brightness(.88) contrast(1.06)}
.gt-scr-fx{position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,0) 50%,rgba(0,0,0,.32) 50%),linear-gradient(90deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.12) 50%);background-size:100% calc(2px * var(--s)),calc(2px * var(--s)) 100%;box-shadow:inset 0 0 calc(5px * var(--s)) rgba(0,0,0,.65)}
.gt-tv{position:absolute;inset:0;display:none;flex-direction:column;background:#000;z-index:9}
.gt-tv-bar{display:flex;align-items:center;gap:calc(4px * var(--s));padding:calc(2px * var(--s)) calc(4px * var(--s));color:#f8f0e0;font-size:max(calc(6px * var(--s)), 10px);background:#141018}
.gt-tv-t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gt-tv-bar a,.gt-tv-bar button{font:inherit;color:#f8f0e0;background:#2c2630;border:1px solid #f8f0e0;padding:calc(1px * var(--s)) calc(4px * var(--s));text-decoration:none;cursor:pointer}
.gt-tv-box{flex:1;display:flex;align-items:center;justify-content:center;min-height:0}
.gt-tv-box iframe{width:100%;height:100%;border:0;aspect-ratio:16/9;max-height:100%}
.gt-notekb{display:grid;grid-template-columns:repeat(10,1fr);gap:calc(1px * var(--s));margin:calc(2px * var(--s)) 0}
.gt-notekb[hidden]{display:none}
.gt-notekb button{font-family:inherit;font-size:calc(6px * var(--s));line-height:1;padding:calc(2px * var(--s)) 0;background:#fff;color:#181820;border:calc(1px * var(--s)) solid #181820;cursor:pointer;min-width:0}
.gt-notekb button.on{background:#e8b24a}
.gt-note.kb .gt-badge-sub,.gt-note.kb .gt-note-count,.gt-note.kb .gt-badge-btns{display:none}
.gt-notekb-hint{display:none;color:#505068;font-size:.85em}.gt-note.kb .gt-notekb-hint{display:block}
.gt-note.kb .gt-badge-err:empty{min-height:0;margin:0 !important}
.gt-notekb-native{background:none;border:0;padding:0;font:inherit;color:#505068;text-decoration:underline;cursor:pointer}
.gt-note.kb textarea{height:calc(22px * var(--s))}
.gt-note.kb textarea.on,.gt-note.kb input.on{box-shadow:0 0 0 calc(1px * var(--s)) #e8b24a}
.gt-badge-test{color:#7c5a0c;margin-top:calc(3px * var(--s)) !important}
.gt-badge-err{color:#a33a22;min-height:1.5em}
.gt-badge-btns{display:flex;gap:calc(4px * var(--s))}
.gt-badge-btns button{font-family:inherit;font-size:calc(6px * var(--s));padding:calc(3px * var(--s)) calc(6px * var(--s));background:#181820;color:#f8f8f0;border:calc(1px * var(--s)) solid #181820;cursor:pointer}
.gt-badge-btns button.ghost{background:transparent;color:#181820}
.gt-badge-native{display:none;margin-top:calc(3px * var(--s));background:none;border:0;padding:0;font:inherit;font-size:.9em;color:#505068;text-decoration:underline;cursor:pointer}
/* In-game keypad (touch screens): no phone keyboard covering the game. */
.gt-badge.kp{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:calc(5px * var(--s));align-items:start}
.gt-badge.kp .gt-badge-native{display:inline-block}
.gt-badge-kpback{display:none;margin-top:calc(3px * var(--s));background:none;border:0;padding:0;font:inherit;font-size:.9em;color:#505068;text-decoration:underline;cursor:pointer}
.gt-badge.native .gt-badge-kpback{display:inline-block}
/* The overlay never greys out or blocks the on-screen D-pad and buttons. */
.gt-badgewrap.big{background:transparent;pointer-events:none}
.gt-badgewrap.big .gt-badge{pointer-events:auto;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.gt-cu-frame img.item{object-fit:contain;background:#f8f4ec;image-rendering:pixelated}
.gt-badgewrap:not(.big) .gt-badge.kp .gt-badge-sub{display:none}
.gt-badgewrap:not(.big) .gt-badge.kp .gt-badge-btns button[type=submit]{display:none}
.gt-badge.kp input{caret-color:transparent;cursor:pointer}
.gt-badge.kp input.on{box-shadow:0 0 0 calc(1px * var(--s)) #e8b24a;background:#fff8e0}
.gt-keypad{display:none;gap:calc(2px * var(--s))}
.gt-badge.kp .gt-keypad{display:grid}
.gt-keypad button{font-family:inherit;font-size:max(calc(7px * var(--s)), 11px);min-width:calc(14px * var(--s));min-height:calc(14px * var(--s));padding:0;background:#f8f8f0;color:#181820;
  border:calc(1px * var(--s)) solid #181820;cursor:pointer;touch-action:manipulation}
.gt-keypad button.on{background:#e8b24a}
.gt-keypad button.wide{grid-column:span 2}
.gt-keypad.num{grid-template-columns:repeat(3,calc(18px * var(--s)))}
.gt-keypad.num button{min-height:calc(18px * var(--s))}
.gt-keypad.abc{grid-template-columns:repeat(8,calc(13px * var(--s)))}
.gt-keypad.abc button{min-width:0}
/* Narrow screens: keypad goes under the fields. */
.gt-badgewrap.big .gt-badge.kp{grid-template-columns:1fr}
.gt-badgewrap.big .gt-keypad.num{grid-template-columns:repeat(3,1fr)}
.gt-badgewrap.big .gt-keypad.abc{grid-template-columns:repeat(8,1fr)}
.gt-badge-btns button:hover,.gt-badge-btns button:focus-visible{background:#e8b24a;color:#181820;outline:none}
@keyframes gtEndIn{from{opacity:0;transform:translateY(calc(-6px * var(--s)))}}
@media (prefers-reduced-motion: reduce){.gt-end{animation:none}}`;
      document.head.appendChild(st);
    }
    el.cu.addEventListener("click", () => this.press("a"));
  }
  /* Short notices (room names, "Stamp!", "Photo saved"...). They wait while a placard, menu or text box is open,
     then show one at a time. */
  showLoc(name) { (this.toastQ = this.toastQ || []).push(name); this.flushToasts(); }
  /* A menu is opening over a toast (an achievement, say): put it back at the front of the line to show once the menu closes. */
  holdToast() {
    if (!this.toastBusy) return;
    const el = this.el.loc; clearTimeout(this._locT); (this.toastQ = this.toastQ || []).unshift(el.textContent);
    el.classList.remove("on"); this.toastBusy = false;
  }
  flushToasts() {
    if (!this.toastQ || !this.toastQ.length || this.toastBusy || !(this.mode === "walk" || this.mode === "busy")) return;
    const el = this.el.loc; el.textContent = this.toastQ.shift(); el.classList.add("on"); this.toastBusy = true;
    clearTimeout(this._locT); this._locT = setTimeout(() => { el.classList.remove("on"); setTimeout(() => { this.toastBusy = false; this.flushToasts(); }, 300); }, 2000);
  }
  say(pages, done) {
    pages = this.paginate((pages || []).map(p => this.roomNames(p))); // what things say can name rooms with {room:id}
    if (!pages.length) { if (done) done(); return; }
    this.mode = "text"; this.txt = { pages, i: 0, n: 0, done };
    this.el.text.style.display = "block"; this.renderText();
  }
  /* Split any page that won't fit in the two-line text box into several pages. */
  paginate(pages) {
    const box = this.el.text, body = this.el.textBody, was = box.style.display, out = [];
    box.style.display = "block";
    for (const page of pages) {
      body.textContent = page;
      if (body.scrollHeight <= body.clientHeight + 1) { out.push(page); continue; }
      let cur = "";
      for (const w of page.split(/\s+/)) {
        const t = cur ? cur + " " + w : w; body.textContent = t;
        if (body.scrollHeight > body.clientHeight + 1 && cur) { out.push(cur); cur = w; } else cur = t;
      }
      if (cur) out.push(cur);
    }
    body.textContent = ""; box.style.display = was;
    return out;
  }
  renderText() {
    const tx = this.txt, page = tx.pages[tx.i] || "";
    this.el.textBody.textContent = page.slice(0, Math.floor(tx.n));
    this.el.more.style.display = tx.n >= page.length ? "block" : "none";
  }
  closeText() {
    this.el.text.style.display = "none"; const d = this.txt && this.txt.done; this.txt = null;
    this.mode = "walk"; this.inputLock = true; if (d) d();
  }
  /* Look at a piece: the art fills the top of the screen while its placard reads out below. */
  /* ----- the reading panel -----
     Long text (placards, magazines) in big paragraphs you page through: A or right for the next page, left to go back, B to close. */
  read(spec, done) {
    this.holdToast(); // a toast showing now waits until the placard closes
    const box = this.el.reader; box.style.display = "block"; this.mode = "read";
    box.innerHTML = '<div class="gt-rd-head"></div><div class="gt-rd-body"></div><div class="gt-rd-foot"><span class="gt-rd-n"></span></div>';
    box.classList.toggle("gt-rd-pre", !!spec.pre); // line breaks and indents kept (the stats)
    const head = box.querySelector(".gt-rd-head"), body = box.querySelector(".gt-rd-body");
    if (spec.img) { const im = document.createElement("img"); im.src = spec.img; im.alt = ""; if (spec.imgClass) im.className = spec.imgClass; head.appendChild(im); }
    const t = document.createElement("div"); t.className = "gt-rd-t"; t.textContent = spec.title || ""; if (spec.sub) { const sm = document.createElement("small"); sm.textContent = spec.sub; t.appendChild(sm); }
    if (spec.pick) t.appendChild(this.pickTag()); head.appendChild(t);
    const links = (spec.links || []).filter(l => l[0]);
    if (links.length || spec.note) {
      const lw = document.createElement("div"); lw.className = "gt-rd-links"; head.appendChild(lw);
      links.forEach(([href, label, short]) => { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = (short || label) + " \u2197"; a.setAttribute("aria-label", label + " (opens in a new tab)"); a.title = label + " (opens in a new tab)"; a.className = /watch/i.test(label) ? "watch" : "play"; a.addEventListener("click", e => e.stopPropagation()); lw.appendChild(a); });
      if (spec.note) { // a yellow button under Watch and Play: leave a note on this piece (Up does it too)
        const nb = document.createElement("button"); nb.type = "button"; nb.className = "note"; nb.textContent = "NOTE +";
        nb.setAttribute("aria-label", "Leave a note"); nb.title = "Leave a note for other visitors";
        nb.addEventListener("click", e => { e.stopPropagation(); this.noteFromReader(); }); lw.appendChild(nb);
      }
      if (lw.children.length > 2) lw.classList.add("three");
    }
    // Break each section into pages that fit the box, a word at a time.
    const pages = [], fits = () => body.scrollHeight <= body.clientHeight + 1;
    const put = (label, words) => { body.innerHTML = ""; if (label) { const b = document.createElement("b"); b.textContent = label; body.appendChild(b); } body.appendChild(document.createTextNode(words)); };
    const trim = spec.pre ? (x => x.replace(/^\n+/, "").replace(/\s+$/, "")) : (x => x.trim()); // the stats keep their indents
    for (const sec of spec.sections || []) {
      const words = String(sec.text || "").split(/(\s+)/); let cur = "", first = true;
      for (const w of words) {
        put(first ? sec.label : (sec.label ? sec.label + " (CONTINUED)" : ""), cur + w);
        if (!fits() && cur.trim()) { pages.push({ label: first ? sec.label : (sec.label ? sec.label + " (CONTINUED)" : ""), text: trim(cur) }); first = false; cur = spec.pre ? w.replace(/^\n+/, "") : w.trimStart(); }
        else cur += w;
      }
      if (cur.trim()) pages.push({ label: first ? sec.label : (sec.label ? sec.label + " (CONTINUED)" : ""), text: trim(cur) });
    }
    if (!pages.length) pages.push({ label: "", text: "" });
    this.rd = { pages, i: 0, done, note: spec.note || null, sel: -1 }; // note: a piece you can leave a note on (its NOTE button); sel: the highlighted button
    this.renderRead();
  }
  renderRead() {
    const r = this.rd, pg = r.pages[r.i], body = this.el.reader.querySelector(".gt-rd-body");
    body.innerHTML = ""; if (pg.label) { const b = document.createElement("b"); b.textContent = pg.label; body.appendChild(b); } body.appendChild(document.createTextNode(pg.text));
    this.el.reader.querySelector(".gt-rd-n").textContent = (r.pages.length > 1 ? (r.i + 1) + " / " + r.pages.length + "   " : "") + (r.sel >= 0 ? "A: open" : r.i < r.pages.length - 1 ? "A: next" : "A: done") + "   B: close" + (this.rdButtons().length ? "   \u2191\u2193: buttons" : "");
  }
  closeRead() { this.el.reader.style.display = "none"; const d = this.rd && this.rd.done; this.rd = null; this.mode = "walk"; this.inputLock = true; if (d) d(); }
  /* Up and Down highlight the placard's buttons (Watch, Play, Note) in turn; A uses the highlighted one. */
  rdButtons() { return this.rd ? [...this.el.reader.querySelectorAll(".gt-rd-links > *")] : []; }
  rdPick(d) {
    const r = this.rd, bs = this.rdButtons(); if (!bs.length) return;
    r.sel = r.sel === undefined || r.sel < 0 ? (d > 0 ? 0 : bs.length - 1) : r.sel + d;
    if (r.sel >= bs.length || r.sel < 0) r.sel = -1; // past the ends: nothing highlighted (A turns pages again)
    bs.forEach((b, i) => b.classList.toggle("sel", i === r.sel)); this.renderRead();
  }
  rdUse() { // a link opens in a new tab; if the browser blocks it (a controller press isn't a click), say so
    const r = this.rd, b = this.rdButtons()[r.sel]; if (!b) return;
    if (b.tagName === "BUTTON") { b.click(); return; }
    const w = window.open(b.href, "_blank", "noopener"); if (!w && !this.rdOpened) this.showLoc("The browser blocked the new tab. Click " + b.textContent + " to open it.");
  }
  /* The placard's yellow NOTE button: put the placard away and open the note card; whatever came after the placard waits. */
  noteFromReader() {
    const r = this.rd; if (!r || !r.note) return;
    const d = r.done; r.done = null; this.closeRead();
    this.openNote(r.note, () => { if (d) d(); });
  }
  /* The stamp card: each piece you read stamps it once per card. A full card trades for one prize item at the shop counter. */
  stamp(p) {
    const st = this.progress.stamps, size = this.pack.settings.shop.stampSize;
    if (st.includes(p.id) || st.length >= size) return;
    st.push(p.id); this.progress.tally.stamps = (this.progress.tally.stamps || 0) + 1; this.saveProgress();
    this.showLoc(st.length >= size ? "Stamp card full! Trade it at the gift shop." : "Stamp! " + st.length + " / " + size);
  }
  showStampCard() {
    const st = this.progress.stamps, size = this.pack.settings.shop.stampSize, full = st.length >= size;
    const titles = st.map(id => (this.pack.pieces.find(p => p.id === id) || { title: "a retired piece" }).title);
    const row = Array.from({ length: size }, (_, i) => (i < st.length ? "\u25CF" : "\u25CB")).join(" ");
    this.read({ title: "STAMP CARD", sub: st.length + " of " + size + " stamps",
      sections: [{ label: "", text: row }, { label: "", text: this.tx(full ? "stamp.full" : "stamp.howto").join(" ") }, ...(titles.length ? [{ label: "STAMPED", text: titles.join(", ") }] : [])] });
  }
  /* Items a full stamp card trades for: the ones ticked "Stamp card prize" in the curator, or any item when none are ticked. */
  stampPrize(it) { const sh = this.pack.settings.shop; return !sh.stampItems.length || sh.stampItems.includes(it.id); }
  tradeStampCard() {
    const sh = this.pack.settings.shop, prizes = sh.items.filter(it => this.stampPrize(it) && !this.progress.items.includes(it.id));
    if (!prizes.length) { this.shopMsg = this.tx("stamp.noPrizes").join(" "); this.renderShop(); return; }
    this.closeShop();
    this.choose("Trade your full stamp card for:", [...prizes.map(it => it.name), "Not yet"], i => {
      const it = prizes[i]; if (!it) return;
      this.progress.items.push(it.id); this.progress.stamps = []; this.progress.tally.cards = (this.progress.tally.cards || 0) + 1; this.saveProgress();
      this.say(this.tx("stamp.traded", { title: it.name }));
    });
  }
  viewPiece(p, side, stampAfter) {
    const gold = p.kind === "episode", img = this.pieceImgs[p.id], secs = [];
    // The observation is always framed as the curator's own view; the headings and that line are in Words, Pieces.
    const obs = () => { secs.push({ label: this.tx("case.obsLabel").join(" "), text: p.observation }); if (!p.tut) secs.push({ label: "", text: this.tx("case.obsNote").join(" ") }); };
    const int = () => secs.push({ label: this.tx("case.intLabel").join(" "), text: p.intention });
    if (side === "front") { if (p.observation) obs(); secs.push({ label: "", text: this.tx("case.frontNote").join(" ") }); }
    else if (side === "back") { if (p.intention) int(); secs.push({ label: "", text: this.tx("case.backNote").join(" ") }); }
    else if (side === "end") secs.push({ label: "", text: this.tx("case.ends").join(" ") });
    else if (gold) { if (p.observation) obs(); if (p.intention) int(); }
    else if (p.guestNote) secs.push({ label: p.guestWriter ? "GUEST NOTE BY " + p.guestWriter.toUpperCase() : "GUEST NOTE", text: p.guestNote });
    const notes = side !== "back" && side !== "end" && (this.online() || !!p.tut); // visitors' notes: under the front placard, or with the whole piece
    if (notes) { const ns = this.notesFor(p); if (side === "front") secs.splice(secs.length - 1, 0, ...ns); else secs.push(...ns); this.refreshNotes(); } // before the "other side" line
    this.read({ img: img ? p.image : this.pieceArt(p).toDataURL(), imgClass: img && img.naturalWidth > 160 ? "photo" : "", title: p.title.toUpperCase(), sub: "By " + p.developer,
      sections: secs, pick: p.pick, note: notes && !this.curator ? p : null, links: [[p.episodeUrl, "Watch the episode", "WATCH"], [p.gameUrl, "Play the game", "PLAY"]] }, () => {
      if (side === undefined) { const k = (this.progress.sides || (this.progress.sides = {}))[p.id] || (this.progress.sides[p.id] = {}); if (gold) k.front = k.back = 1; else k.note = 1; this.saveProgress(); }
      if (stampAfter) this.stamp(p);
    });
  }
  /* Episode cases have two placards. From the front (standing below it, facing up) you read the curator's observation;
     walk around to the back (facing down) for the developer's intention. From the ends, you're told to walk around. */
  useCase(c) {
    if (c.state === "empty") { this.say(this.tx("case.empty")); return; }
    if (c.state === "covered") { this.say(this.tx("case.covered", { date: niceDate(c.piece.unveil), title: c.piece.title })); return; }
    if (c.state === "crate") { this.hang(c); return; }
    if (c.state === "wall" && this.offerRecommend(c.piece, () => this.useCaseNow(c))) return;
    this.useCaseNow(c);
  }
  useCaseNow(c) {
    if (this.prints(c.piece) > 0) {
      (this.progress.wiped || (this.progress.wiped = {}))[c.piece.id] = todayISO(); (this.extraPrints || (this.extraPrints = {}))[c.piece.id] = 0;
      this.count("wiped", c.piece.id); this.saveProgress();
      this.mode = "busy"; this.chore = { spot: c, t: 0, kind: "wipe" }; this.showLoc("Wiped the glass"); return;
    }
    const d = this.player.dir, side = d === "up" ? "front" : d === "down" ? "back" : null;
    if (!side) { this.say(this.tx("case.ends")); return; }
    // Reading both sides of a case stamps your card (after the placard closes). The tutorial's games keep their own record.
    const tp = !!c.piece.tut, seen = tp ? (this.tut ? this.tut.sides : {}) : this.progress.sides || (this.progress.sides = {}), k = seen[c.piece.id] || (seen[c.piece.id] = {});
    k[side] = 1; if (!tp) this.saveProgress(); else this.tutRead();
    this.viewPiece(c.piece, side, !tp && !!(k.front && k.back));
  }
  /* Curator mode: lift a new piece out of its crate onto the wall, with sparkles, then read its placard. */
  hang(spot) {
    this.mode = "busy"; this.hanging = { spot, t: 0 };
    this.hungNow.add(spot.piece.id); spot.state = "lifting";
  }
  updateHang() {
    const h = this.hanging; if (!h) return;
    if (++h.t === 26) h.spot.state = "wall";
    if (h.t >= 72) { this.hanging = null; this.mode = "walk"; this.viewPiece(h.spot.piece, h.spot.isCase ? "front" : undefined); }
  }

  /* ----- cozy loop -----
     Progress is kept in this browser only: when each frame was dusted or straightened, when each plant was watered,
     whether today's mug was found, and running tallies. Staff badges add a per-badge tally on top (see count()). */
  loadProgress() {
    let p = null;
    try { if (this.saveKey) p = JSON.parse(localStorage.getItem(this.saveKey) || "null"); } catch (e) {}
    p = p && typeof p === "object" ? p : {};
    return { dusted: p.dusted || {}, straightened: p.straightened || {}, watered: p.watered || {}, mug: p.mug || "",
      tally: Object.assign({ dusted: 0, straightened: 0, watered: 0, mugs: 0, closings: 0 }, p.tally || {}),
      staff: p.staff && p.staff.badge ? p.staff : null,   // who is clocked in on this browser (never the key)
      staffTally: p.staffTally || {}, lastBadge: p.lastBadge || null,
      tutorial: typeof p.tutorial === "string" ? p.tutorial : "", // the day you finished (or skipped) the tutorial
      tokens: typeof p.tokens === "number" ? p.tokens : 0, items: Array.isArray(p.items) ? p.items : [], shirt: !!p.shirt, wearShirt: !!p.wearShirt, quest: p.quest || 0,
      ach: p.ach || {}, visited: Array.isArray(p.visited) ? p.visited.filter(v => !/^tut_/.test(v)) : [], // (tutorial rooms never count)
      photos: Array.isArray(p.photos) ? p.photos : [], stamps: Array.isArray(p.stamps) ? p.stamps : [], where: p.where || null, sides: p.sides || {}, wiped: p.wiped || {},
      myNotes: p.myNotes || {}, reactions: p.reactions || {},
      // For the stats on Someone's PC: days, streaks, time, steps, walls, the dark, favorite drink, plant and photo subject, verdicts by genre.
      stats: Object.assign({ days: 0, lastDay: "", streak: 0, best: 0, secs: 0, dark: 0, steps: 0, bumps: 0, drinks: {}, plants: {}, shots: {}, loved: {}, nope: 0 }, p.stats || {}), noteName: typeof p.noteName === "string" ? p.noteName : "", clientId: typeof p.clientId === "string" ? p.clientId : "" };                    // chores counted per badge while clocked in
  }
  saveProgress() { this.checkAchievements(); try { if (this.saveKey) localStorage.setItem(this.saveKey, JSON.stringify(this.progress)); } catch (e) {} }
  /* ----- achievements ----- */
  stat(k) {
    const p = this.progress, t = p.tally || {};
    if (k === "photos") return t.photos || 0;
    if (k === "bothSides") return Object.values(p.sides || {}).filter(v => v.front && v.back).length;
    if (k === "items") return (p.items || []).length;
    if (k === "rooms") return (p.visited || []).filter(v => { const [id, z] = v.split(":"), lay = layoutOf(ROOMS[id]); return ROOMS[id] && !ROOMS[id].tutorial && (lay ? lay.zones.some(q => q.id === z && q.kind === "room") : !z); }).length; // rooms that still exist (not the tutorial's)
    if (k === "shirt") return p.shirt ? 1 : 0;
    if (k === "reactions") return Object.keys(p.reactions || {}).length;
    return t[k] || 0;
  }
  checkAchievements() {
    if (!this.pack || !this.progress) return;
    const got = this.progress.ach || (this.progress.ach = {});
    for (const a of this.pack.settings.achievements) if (!got[a.id] && this.stat(a.stat) >= a.target) {
      got[a.id] = todayISO(); this.showLoc("Achievement: " + a.name);
    }
  }
  showAchievements() {
    const list = this.pack.settings.achievements, got = this.progress.ach || {}, n = list.filter(a => got[a.id]).length;
    const lines = list.map(a => got[a.id] ? "\u2605 " + a.name.toUpperCase() + ": " + a.desc
      : a.secret ? "\u2606 ???  (a secret)" : "\u2606 " + a.name + ": " + a.desc + " (" + Math.min(this.stat(a.stat), a.target) + "/" + a.target + ")");
    this.read({ title: "ACHIEVEMENTS", sub: n + " of " + list.length + " unlocked", sections: [{ label: "", text: lines.join("\n") }] });
  }
  resetProgress() { try { if (this.saveKey) localStorage.removeItem(this.saveKey); } catch (e) {} this.progress = this.loadProgress(); this.lightsOff.clear(); this.closing = false; this.closed = false; this.closingPaid = false; this.fol = null; this.dayStart = Object.assign({}, this.progress.tally); this.spook = null; this.figure = null; this.hideEnd(); this.updateHud(); this.rebuild(); }
  /* Dust settles back over a few real days. A piece that's never been dusted starts dusty about half the time. */
  isDusty(p) { const d = this.progress.dusted[p.id]; return d ? daysBetween(d, todayISO()) >= 3 : strSeed(p.id) % 2 === 0; }
  /* Each day, roughly one piece in five hangs a little crooked until someone nudges it level. */
  isCrooked(p) {
    if (this.forcedCrooked && this.forcedCrooked.has(p.id)) return true;
    const t = todayISO(); return this.progress.straightened[p.id] !== t && strSeed(t + p.id) % 5 === 0;
  }
  isThirsty(id) { return this.progress.watered[id] !== todayISO(); }
  /* One press, one chore: a dusty frame gets dusted; a crooked one (once clean) gets straightened. Returns false when there's nothing to do. */
  tidy(spot) {
    const p = spot.piece, t = todayISO();
    let kind = null;
    if (this.isDusty(p)) { kind = "dust"; this.progress.dusted[p.id] = t; this.count("dusted", p.id); }
    else if (this.isCrooked(p)) { this.forcedCrooked.delete(p.id); kind = "straighten"; this.progress.straightened[p.id] = t; this.count("straightened", p.id); }
    if (!kind) return false;
    this.saveProgress();
    this.mode = "busy"; this.chore = { spot, t: 0, kind };
    this.showLoc(kind === "dust" ? "Dusted" : "Straightened");
    return true;
  }
  updateChore() {
    const c = this.chore; if (!c) return;
    if (++c.t >= 26) { this.chore = null; this.mode = "walk"; this.inputLock = true; }
  }
  /* Closing up: the intercom announcement sends visitors home. Only then do the lights close the museum. */
  announce() {
    if (this.closing) {
      this.say(this.tx("intercom.again")); return; }
    this.choose(this.tx("intercom.ask").join(" "), ["Yes", "Not yet"], i => { if (i === 0) this.doAnnounce(); });
  }
  doAnnounce() {
    this.say(this.tx("intercom.announce"), () => {
      this.closing = true;
      const f = this.fol; // whoever was following you heads home (they'll be back tomorrow)
      if (f) { this.fol = null; f.follow = false; if (f.cur) { f.cur.state = "waiting"; f.cur.room = null; } this.saveProgress(); setTimeout(() => this.say(this.tx("cur.closing")), 300); }
      for (const id in this.rooms) if (this.rooms[id] !== this.room) this.rooms[id].npcs = this.rooms[id].npcs.filter(n => n.staff);
      this.room.npcs.filter(n => !n.staff).forEach((n, i) => { n.leaving = true; n.leaveT = -i * 6; n.alpha = 1; n.timer = 0; n.route = null; n.aside = null; });
    });
  }
  /* Lights. Each room has its own switch; in the museum, each of its rooms does (its "zone"). Hallways stay lit until
     every room's lights are off. Keys: a room's id, or "museum:action" for a zone. */
  switches() {
    const out = [];
    for (const id in ROOMS) {
      if (ROOMS[id].tutorial) continue; // the tutorial's rooms aren't part of closing the museum
      if (ROOMS[id].lightSwitch) out.push({ key: id, name: ROOMS[id].name.replace(/\s+/g, " ") });
      const lay = layoutOf(ROOMS[id]); if (lay) lay.lights.forEach(l => out.push({ key: id + ":" + l.zone, name: lay.zones.find(z => z.id === l.zone).name }));
    }
    return out;
  }
  zoneAt(r, x, y) { const z = r && r.zoneAt && r.zoneAt[y] ? r.zoneAt[y][x] : -1; return z >= 0 ? r.zones[z] : null; }
  lightKey(r, x, y) { const z = this.zoneAt(r, x, y); return z ? r.id + ":" + z.id : r.id; }
  isDark(r, x, y) {
    if (!r.zoneAt) return this.lightsOff.has(r.id);
    const z = this.zoneAt(r, x, y); if (!z) return false;
    const k = r.id + ":" + z.id; if (this.lightsOff.has(k)) return true;
    return !(z.kind === "room" && z.light) && r.switches.length > 0 && r.switches.every(sw => this.lightsOff.has(sw.key));
  }
  darkHere() { return this.isDark(this.room, this.player.x, this.player.y); }
  toggleLights(key) {
    const id = key || this.room.id;
    if (this.lightsOff.has(id)) { this.lightsOff.delete(id); this.closed = false; this.showLoc("Lights on"); return; }
    if (!this.closing) {
      // Visitors are still here: a quick, embarrassed flick.
      this.lightsOff.add(id);
      this.say(this.tx("lights.early"), () => this.lightsOff.delete(id));
      return;
    }
    if (this.room.npcs.some(n => !n.staff)) { this.say(this.tx("lights.wait")); return; }
    this.lightsOff.add(id); this.showLoc("Lights off");
    if (!this.spook) this.spook = { armed: this.forceSpook || Math.random() < 0.2, steps: 0, need: 10 + Math.floor(Math.random() * 12), done: false };
    if (this.switches().every(sw => this.lightsOff.has(sw.key))) {
      // Closing up pays once per opening: flicking a light back on and off again doesn't count twice.
      if (!this.closingPaid) { this.closingPaid = true; this.count("closings"); this.saveProgress(); }
      this.closed = true;
      setTimeout(() => this.say(this.tx("lights.closed")), 500);
    }
  }
  /* Something creepy, rarely: about one closing in five, after a while walking in the dark.
     One of three: eyes in the dark that vanish as you approach, a frame creaking crooked by itself,
     or the intercom crackling on its own. Curator option (or ?spooky) makes it happen every closing. */
  stepInDark() {
    const sp = this.spook; if (!sp || !sp.armed || sp.done || !this.darkHere()) return;
    if (++sp.steps < sp.need) return;
    const r = this.room, p = this.player, kinds = [];
    if (r.hung.some(h => h.state === "wall" && Math.abs(h.x + 0.5 - p.x) < 6)) kinds.push("creak");
    if (this.figureSpot()) kinds.push("figure");
    if (r.id !== "lobby") kinds.push("intercom");
    kinds.push("flicker");
    if (!kinds.length) return;
    sp.done = true;
    const k = kinds[Math.floor(Math.random() * kinds.length)];
    if (k === "flicker") { this.flickerT = 70; return; }
    if (k === "creak") {
      const near = r.hung.filter(h => h.state === "wall").sort((a, b) => Math.abs(a.x + 0.5 - p.x) - Math.abs(b.x + 0.5 - p.x))[0];
      this.forcedCrooked.add(near.piece.id); this.creakT = { id: near.piece.id, t: 0 }; this.showLoc("*creeeak*");
    } else if (k === "figure") {
      const f = this.figureSpot(); this.figure = { x: f[0], y: f[1], t: 0, alpha: 0 };
    } else {
      this.mode = "busy"; setTimeout(() => this.say(this.tx("spooky.intercom")), 400);
    }
  }
  /* Curator test: the figure appears now, beside or behind you (never straight ahead), in this room with the lights off.
     The lights come back on once it's gone. Returns false if there's nowhere to put it. */
  summonFigure() {
    const r = this.room, p = this.player, [dx, dy] = DIRS[p.dir], out = [];
    for (let y = 3; y < r.h - 1; y++) for (let x = 1; x < r.w - 1; x++) {
      const d = Math.abs(x - p.x) + Math.abs(y - p.y);
      if (d >= 3 && d <= 6 && (x - p.x) * dx + (y - p.y) * dy <= 0 && !r.solid[y][x] && !this.occupied(x, y)) out.push([x, y]);
    }
    if (!out.length) return false;
    const [x, y] = out[Math.floor(Math.random() * out.length)];
    if (!this.isDark(r, x, y)) { const k = this.lightKey(r, x, y); this.lightsOff.add(k); this.figureLights = k; }
    this.figure = { x, y, t: 0, alpha: 0 };
    return true;
  }
  /* Curator test: tomorrow. Every daily thing moves on (curious visitors come back, dust settles) and the museum opens again. */
  skipDay() { DAY_SHIFT++; this.reopen(); this.showLoc("The next day: " + niceDate(todayISO())); }
  /* A floor tile ahead of the player, at the edge of the light. */
  figureSpot() {
    const p = this.player, [dx, dy] = DIRS[p.dir], r = this.room;
    for (const dist of [5, 4, 6]) {
      const x = p.x + dx * dist, y = p.y + dy * dist;
      if (x > 0 && y > 2 && x < r.w - 1 && y < r.h - 1 && !r.solid[y][x] && !this.occupied(x, y)) return [x, y];
    }
    return null;
  }
  updateSpooks() {
    const f = this.figure;
    if (f) {
      f.t++;
      const near = Math.abs(f.x - this.player.x) + Math.abs(f.y - this.player.y) <= 2;
      if (near || f.t > 260) f.leaving = true;
      f.alpha = f.leaving ? f.alpha - 0.12 : Math.min(1, f.alpha + 0.04);
      if (f.leaving && f.alpha <= 0) { this.figure = null; if (this.figureLights) { this.lightsOff.delete(this.figureLights); this.figureLights = null; } }
    }
    if (this.creakT && ++this.creakT.t > 40) this.creakT = null;
  }
  /* The front doors: a friendly line while open; once closed, the way out to the ending screen. */
  frontDoor() {
    if (this.closed) { this.mode = "busy"; this.trans = { t: 0, dur: 24, switched: false, fn: () => this.showEnd(), hold: true }; return; }
    if (this.closing) {
      const on = this.switches().filter(sw => !this.lightsOff.has(sw.key)).map(sw => sw.name);
      this.say(this.tx("door.lockUp", { rooms: on.join(", ") || "nowhere, oddly" })); return;
    }
    this.say(this.tx("door.open"));
  }
  showEnd(kind) {
    this.endKind = kind || "closed";
    this.el.end.querySelector(".gt-end-sign").textContent = kind === "brb" ? "BE RIGHT BACK" : "CLOSED";
    this.el.end.querySelector(".gt-end-line").textContent = kind === "brb" ? "The museum is waiting right where you left it." : "The museum is closed for the night.";
    this.el.end.querySelector("button").textContent = kind === "brb" ? "Come back in" : "Open the museum again";
    const t = this.progress.tally, d = k => (t[k] || 0) - (this.dayStart[k] || 0), bits = [];
    const add = (n, one, many) => { if (n > 0) bits.push(n + " " + (n === 1 ? one : many)); };
    add(d("dusted"), "frame dusted", "frames dusted"); add(d("straightened"), "frame straightened", "frames straightened");
    add(d("watered"), "plant watered", "plants watered"); add(d("mugs"), "mug returned", "mugs returned");
    const e = this.el.end;
    let sum = bits.length ? "Tonight: " + bits.join(", ") + "." : "Thanks for visiting.";
    if (this.staff && kind !== "brb") { sum += " " + this.staff.name + " clocked out."; this.progress.staff = null; this.saveProgress(); this.updateHud(); }
    if (kind === "brb") sum = "Saved.";
    else { // three of your stats, at random, and where to find the rest
      const rows = this.statRows().filter(r => r[0] !== "READING" || !/ of \d/.test(String(r[2]))).sort(() => Math.random() - 0.5).slice(0, 3);
      if (rows.length) sum += "\n" + rows.map(r => r[1] + ": " + r[2]).join("\n") + "\n" + this.tx("end.stats").join(" ");
    }
    e.querySelector(".gt-end-sum").textContent = sum;
    e.style.borderImageSource = `url("${this.src("textbox")}")`;
    this.el.endWrap.style.display = "flex"; this.mode = "ended";
    const b = e.querySelector("button"); setTimeout(() => b.focus({ preventScroll: true }), 50);
  }
  hideEnd() { if (this.el.endWrap) this.el.endWrap.style.display = "none"; }
  /* Open again without reloading: visitors return, lights come on, you start at the front doors. */
  reopen() {
    this.lightsOff.clear(); this.closing = false; this.closed = false; this.closingPaid = false; this.dayStart = Object.assign({}, this.progress.tally);
    this.spook = null; this.figure = null; this.hideEnd(); this.trans = null; this.fade = 0; this.mode = "walk"; this.microwaved = false;
    this.rebuild();
    const w = this.endKind === "brb" && this.progress.where;
    if (w && this.rooms[w.room]) this.enterRoom(w.room, w.x, w.y, w.dir); else { const sp = ROOMS.lobby.spawn; this.enterRoom("lobby", sp[0], sp[1], sp[2]); }
    this.wrap.focus({ preventScroll: true });
    if (this.needTutorial()) this.startTutorial(); // quit in the middle of it: it starts over
    this.markDay();
  }
  /* ----- staff -----
     Clocking in uses a badge number and key: the offline test badge (locally), or a real badge checked by Supabase.
     Chores done while clocked in also count toward that badge's staff tally. */
  get staff() { return this.progress.staff; }
  /* The on-shift tag in the corner: who's clocked in and how many chores this shift. */
  updateHud(pulse) {
    // Someone clocked in or out: refresh who's visiting, so the person playing isn't also in the crowd.
    const sk = this.staff ? this.staff.badge + "|" + this.staff.name : "";
    if (this.rooms && this.lastStaffKey !== undefined && sk !== this.lastStaffKey) this.placeMembers();
    const h = this.el.hud, s = this.staff; if (!h) return;
    const tokens = this.progress.tokens || 0;
    h.innerHTML = "";
    if (s) {
      const n = this.staffChores(), c = document.createElement("span"); c.className = "chip shift";
      const b = document.createElement("b"); b.textContent = "ON SHIFT"; c.appendChild(b);
      c.appendChild(document.createTextNode(n + " pt" + (n === 1 ? "" : "s"))); c.title = s.name + " is on shift" + (s.token ? "" : " (offline test badge: points stay in this browser)"); h.appendChild(c);
    }
    if (tokens > 0 || (this.zone && this.zone.id === "cafe")) {
      const c = document.createElement("span"); c.className = "chip tok" + (pulse ? " pulse" : ""); c.textContent = tokens + " T"; c.title = tokens + " gift shop tokens"; h.appendChild(c);
    }
    h.style.display = h.children.length ? "flex" : "none";
  }
  /* Chores on this badge's tally. Kept in the browser, so closing up and reopening never resets it. */
  staffChores() {
    const s = this.staff, t = s && this.progress.staffTally[s.badge]; if (!t) return 0;
    return POINT_KINDS.reduce((a, k) => a + (t[k] || 0) * chorePoints(k), 0);
  }
  count(kind, target) {
    this.progress.tally[kind] = (this.progress.tally[kind] || 0) + 1;
    this.earn(kind === "closings" ? 3 : 1);
    const s = this.staff; if (!s) return;
    const t = this.progress.staffTally[s.badge] || (this.progress.staffTally[s.badge] = { name: s.name });
    t[kind] = (t[kind] || 0) + 1; t.name = s.name;
    this.shift[kind] = (this.shift[kind] || 0) + 1;
    if (POINT_KINDS.includes(kind)) this.sendDuty(kind, target);
    this.updateHud();
  }
  /* Returns { badge, name, token? } when the badge works, or { error: "badge.wrong" | "badge.locked" | ... }.
     The offline test badge is checked first (where it's allowed); everything else asks the staff office (Supabase). */
  async checkBadge(badge, key) {
    badge = String(badge || "").replace(/\D/g, ""); key = normKey(key);
    const b = this.showTestBadge ? TEST_BADGES.find(t => t.badge === badge && t.key === key) : null;
    if (b) return { badge: b.badge, name: b.name };
    if (!this.online()) return { error: "badge.wrong" };
    try {
      const r = await this.rpc("clock_in", { p_badge: badge, p_key: key });
      if (r && r.ok && r.token) return { badge: r.badge, name: r.name, token: r.token };
      return { error: r && r.reason === "locked" ? "badge.locked" : r && r.reason === "inactive" ? "badge.inactive" : "badge.wrong" };
    } catch (err) { return { error: "badge.down" }; }
  }
  /* ----- the staff office (Supabase) -----
     Set up in the curator's Staff tab: the project address and its public key, saved in the pack. Nothing private lives here:
     the database only lets the page clock in, log a chore, and read names and points. */
  online() { const o = this.pack && this.pack.settings.online; return o && o.url && o.key ? o : null; }
  async rpc(name, body) {
    const o = this.online(); if (!o) throw new Error("offline");
    const headers = { "Content-Type": "application/json", apikey: o.key };
    if (/^eyJ/.test(o.key)) headers.Authorization = "Bearer " + o.key; // older "anon" keys also go here; new publishable keys don't
    const ctl = typeof AbortController === "function" ? new AbortController() : null, tm = ctl && setTimeout(() => ctl.abort(), 9000);
    try {
      const res = await fetch(o.url + "/rest/v1/rpc/" + name, { method: "POST", headers, body: JSON.stringify(body || {}), signal: ctl && ctl.signal, cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } finally { if (tm) clearTimeout(tm); }
  }
  /* ----- the screening nook -----
     Sit down (or look at the screen) to pick an episode; it plays over the game until you close it. One or two visitors are
     often already sitting there. */
  episodes() { return this.pack.pieces.filter(p => p.episodeUrl).slice().reverse(); } // newest first
  ytId(url) { const m = String(url || "").match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/); return m ? m[1] : ""; }
  /* What the screening nook is showing this hour: a random episode, the same for everyone until the hour turns. */
  nowPlaying() {
    const eps = this.episodes(); if (!eps.length) return null;
    const d = new Date(); return eps[strSeed(todayISO() + ":" + d.getHours()) % eps.length];
  }
  /* The episode playing this hour, on the nook's screen itself: a muted YouTube player laid over the picture (80×45 at
     (8, 2) of the screen art), started part way in by the clock so it feels like you walked into the middle of it, with
     scanlines over it. Gone when you leave, during the full player, with Settings → Theater screen video off, or if the
     video won't embed. "Watch it" picks up the full player where the screen was. */
  syncScreen(r, cx, cy) {
    const on = r.screenAt && this.screenVideo !== false && !this.headless && !this.full && this.mode !== "tv" && typeof document !== "undefined";
    const p = on ? this.nowPlaying() : null, id = p ? this.ytId(p.episodeUrl) : "";
    if (!id || (this.scrBad && this.scrBad[id])) { this.dropScreen(); return; }
    if (!this.scr || this.scr.id !== id) this.makeScreen(id);
    // Where the picture is on screen (game pixels); the part outside the view is clipped, so down the hallway it's hidden.
    const scr = this.scr, s = this.scale || 1, gx = r.screenAt.x * T + 8 - cx, gy = (r.screenAt.y - 1) * T + 2 - cy;
    const ct = Math.max(0, -gy), cb = Math.max(0, gy + 45 - SH), cl = Math.max(0, -gx), cr = Math.max(0, gx + 80 - SW);
    const show = !this.trans && ct + cb < 45 && cl + cr < 80 && this.screenClean(), key = [gx, gy, s, show].join();
    if (scr.key !== key) {
      const st = scr.box.style; st.left = gx * s + "px"; st.top = gy * s + "px"; st.width = 80 * s + "px"; st.height = 45 * s + "px"; st.opacity = show ? 1 : 0;
      st.clipPath = ct + cb + cl + cr ? "inset(" + [ct, cr, cb, cl].map(v => v * s + "px").join(" ") + ")" : ""; scr.key = key;
    }
  }
  /* Ready to show: playing for 4 seconds since it last started or jumped (YouTube's title and play button have faded by
     then). Until then the screen art keeps flickering over it (it loads out of sight while you're down the hallway). If the player never
     answers at all, show it after 9 seconds anyway. */
  screenClean() {
    const scr = this.scr; if (!scr) return false;
    return scr.at ? !!scr.playT && scr.seeked && Date.now() - scr.playT > 4000 : Date.now() - scr.made > 9000;
  }
  makeScreen(id) {
    this.dropScreen();
    const box = document.createElement("div"); box.className = "gt-scr"; box.setAttribute("aria-hidden", "true"); box.style.opacity = 0;
    const f = document.createElement("iframe"); f.tabIndex = -1; f.allow = "autoplay; encrypted-media"; f.title = "Now playing";
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&playsinline=1&rel=0&iv_load_policy=3&cc_load_policy=0&loop=1&playlist=" + id + "&enablejsapi=1&origin=" + encodeURIComponent(location.origin);
    const fx = document.createElement("div"); fx.className = "gt-scr-fx";
    box.append(f, fx); this.canvas.after(box);
    const scr = this.scr = { id, box, f, key: "", cur: 0, at: 0, seeked: false, pings: 0, playT: 0, made: Date.now(), cc: 0 };
    // Ask the player to report its time, length and state (YouTube's embed messaging), until it answers.
    const ping = () => { if (this.scr !== scr || scr.at || scr.pings++ > 20) return; this.screenCmd("listening"); scr.ping = setTimeout(ping, 500); };
    f.addEventListener("load", ping);
    if (!this.scrMsg) { this.scrMsg = true; window.addEventListener("message", e => this.screenMessage(e)); }
  }
  screenCmd(func, args) {
    const scr = this.scr; if (!scr) return;
    const m = func === "listening" ? { event: "listening", id: 1, channel: "widget" } : { event: "command", func, args: args || [], id: 1, channel: "widget" };
    try { scr.f.contentWindow.postMessage(JSON.stringify(m), "*"); } catch (e) {}
  }
  screenMessage(e) {
    const scr = this.scr; if (!scr || e.source !== scr.f.contentWindow) return;
    let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (!d || typeof d !== "object") return;
    if (d.event === "onError") { (this.scrBad = this.scrBad || {})[scr.id] = 1; this.dropScreen(); return; } // won't embed: the flicker art stays
    const info = d.info; if (!info || typeof info !== "object") return;
    if (scr.cc < 6) { scr.cc++; this.screenCmd("unloadModule", ["captions"]); this.screenCmd("unloadModule", ["cc"]); } // captions off (they load a bit late, so a few times)
    if (typeof info.currentTime === "number") { scr.cur = info.currentTime; scr.at = Date.now(); }
    if (typeof info.playerState === "number") { if (info.playerState !== 1) scr.playT = 0; else if (!scr.playT) scr.playT = Date.now(); }
    if (!scr.seeked && info.duration > 0) { // into the middle of it: as far in as the hour is, around and around
      scr.seeked = true; if (info.duration <= 30) return;
      const h = new Date(); h.setMinutes(0, 0, 0); const off = ((Date.now() - h.getTime()) / 1000) % info.duration;
      scr.cur = off; scr.at = Date.now(); if (scr.playT) scr.playT = Date.now(); // wait out anything the jump brings up
      this.screenCmd("seekTo", [off, true]);
    }
  }
  dropScreen() { const scr = this.scr; if (!scr) return; clearTimeout(scr.ping); scr.box.remove(); this.scr = null; }
  /* Where the screen is in the episode right now (seconds), for picking up in the full player; 0 if it never said. */
  screenTime(p) { const scr = this.scr; return scr && scr.at && scr.id === this.ytId(p.episodeUrl) ? Math.max(0, scr.cur + (Date.now() - scr.at) / 1000) : 0; }
  /* Sitting down or looking at the screen: stay for what's playing, or pick something else. */
  screenAsk() {
    const p = this.nowPlaying(); if (!p) { this.say(this.tx("screen.none")); return; }
    this.ask(this.tx("screen.ask", { title: p.title }).join(" "), ["Watch it", "Pick another", "Not now"], i => { if (i === 0) this.playEpisode(p, this.screenTime(p)); else if (i === 1) this.pickEpisode(); }, 2);
  }
  /* The café's arcade cabinet: every game with a Play link, opened in a new tab. */
  arcade() {
    const games = this.pack.pieces.filter(p => p.gameUrl);
    if (!games.length) { this.say(this.tx("arcade.none")); return; }
    const n = this.pack.settings.shop.arcadePrice, have = this.progress.tokens || 0;
    const pages = this.tx(n ? "arcade.intro" : "arcade.free", { n }), last = pages.pop();
    this.say(pages, () => this.choose(last, [n ? "Insert " + n + " token" + (n > 1 ? "s" : "") : "Play", "Not now"], i => {
      if (i !== 0) return;
      if (have < n) { this.say(this.tx("arcade.broke", { n, have })); return; }
      this.openList(this.tx("arcade.title")[0], [...games.map(p => p.title), "CLOSE"], k => { const p = games[k]; if (p) this.playGame(p, n); });
    }, 1));
  }
  /* A token per play (Gift shop: arcade price), taken once you pick a game. */
  playGame(p, n) {
    if (n) { this.progress.tokens = Math.max(0, (this.progress.tokens || 0) - n); this.updateHud(true); }
    const st = this.progress.stats; st.arcade = (st.arcade || 0) + 1; this.progress.tally.arcade = (this.progress.tally.arcade || 0) + 1; this.saveProgress();
    let w = null; try { w = window.open(p.gameUrl, "_blank"); if (w) w.opener = null; } catch (e) { w = null; }
    if (w) this.say(this.tx("arcade.go", { title: p.title }));
    else this.read({ title: p.title.toUpperCase(), sub: "Arcade", sections: [{ label: "", text: this.tx("arcade.blocked", { title: p.title }).join(" ") }], links: [[p.gameUrl, "Play the game", "PLAY"]] });
  }
  pickEpisode() {
    const eps = this.episodes();
    this.openList("NOW SHOWING", [...eps.map(p => p.title), "CLOSE"], i => { const p = eps[i]; if (p) this.playEpisode(p); });
  }
  playEpisode(p, start) {
    const id = this.ytId(p.episodeUrl), tv = this.el.tv, box = tv.querySelector(".gt-tv-box");
    tv.querySelector(".gt-tv-t").textContent = p.title + " \u00b7 " + p.developer; tv.querySelector(".gt-tv-yt").href = p.episodeUrl;
    box.innerHTML = "";
    if (id) { const f = document.createElement("iframe"); f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0" + (start > 0 ? "&start=" + Math.floor(start) : ""); f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.title = p.title; box.appendChild(f); }
    else { const a = document.createElement("a"); a.href = p.episodeUrl; a.target = "_blank"; a.rel = "noopener"; a.textContent = "This one plays on its own page \u2197"; a.style.color = "#f8f0e0"; box.appendChild(a); }
    tv.style.display = "flex"; this.mode = "tv";
    const st = this.progress.stats; st.episodes = (st.episodes || 0) + 1; this.progress.tally.episodes = (this.progress.tally.episodes || 0) + 1; this.saveProgress();
  }
  closeTv() { const tv = this.el.tv; tv.style.display = "none"; tv.querySelector(".gt-tv-box").innerHTML = ""; this.mode = "walk"; this.inputLock = true; this.wrap.focus({ preventScroll: true }); }
  /* One or two visitors already in their seats (not after closing). */
  seatGuests() {
    const r = this.rooms && this.rooms.screening; if (!r || this.closing) return;
    const seats = []; r.props.filter(p => p.sit === "up").forEach(p => { for (let i = 0; i < SLOT[p.key].w / T; i++) seats.push([p.x + i, p.y]); });
    const n = Math.random() < 0.6 ? 1 : 2, lines = this.pack.settings.text["screen.guest"] || TEXT["screen.guest"].v;
    for (let k = 0; k < n && seats.length; k++) {
      const [x, y] = seats.splice(Math.floor(Math.random() * seats.length), 1)[0];
      r.npcs.push({ sheet: ["visitor_a", "visitor_b", "visitor_c"][Math.floor(Math.random() * 3)], x, y, dir: "up", moving: false, prog: 0, step: false, bumpT: 0, pause: 0, stuck: 0, timer: 9999,
        still: true, sitting: true, lines: lines.slice().sort(() => Math.random() - 0.5), lineI: -1 });
    }
  }
  /* ----- the tutorial -----
     Plays once for a new player, and again through the lobby's Tutorial door. You walk in through the staff office's glass
     door, the usher signs you in (or you train as a volunteer), and you train on your own: read the colored games in
     Training Room A (its far door opens once the red one is read front and back), bring a visitor from Training Room B back
     to them, help two more, hear what they thought out in the office, make the closing announcement, turn off both rooms'
     lights and leave by the glass door. Pausing offers only Skip or Save and quit (quitting starts it over next time).
     Nothing in it counts as real reading, stamps or notes. Every line is in Words, Tutorial. */
  needTutorial() { return !this.curator && !!this.saveKey && !this.headless && !this.progress.tutorial; }
  tutSaid(name, pages) { return pages.map(p => (p.trim() === "..." ? p : name + ": " + p)); }
  tutSpeak(key, vars) { return [...this.tx("tut.speaker"), ...this.tx(key, vars)]; }
  tutPerson(id, name, want, sheet, room, x, y) {
    return { tutId: id, member: name, tutWant: want, shirt: { red: "#d84040", blue: "#3a68c8", black: "#2c2c34" }[want], sheet, room, x, y, dir: "down", moving: false, prog: 0, step: false, bumpT: 0, pause: 0, stuck: 0, timer: 9999, still: true, lines: [["..."]], lineI: -1 };
  }
  tutGame(id) {
    const g = TUT_GAMES.find(q => q.id === id); if (!g) return null;
    return { id: g.id, kind: "episode", tut: true, tutColor: g.color, tutColors: g.colors, art: g.art, title: this.tx("tut." + g.key + ".title")[0], developer: "The Training Department",
      observation: this.tx("tut." + g.key + ".front").join(" "), intention: this.tx("tut." + g.key + ".back").join(" "), minds: [], hint: "", episodeUrl: "", gameUrl: "", pick: false };
  }
  /* After the rooms are built: the colored games in their cases, and the tutorial's visitors where they were. */
  tutDress() {
    for (const g of TUT_GAMES) {
      const r = this.rooms[g.room]; if (!r || !r.solid[g.y] || r.solid[g.y][g.x] !== false) continue;
      const c = { x: g.x, y: g.y, piece: this.tutGame(g.id), state: "wall", isCase: true };
      r.solid[g.y][g.x] = true; r.cases.push(c); r.events[g.x + "," + g.y] = { caseAt: c };
    }
    const t = this.tut; if (!t) return;
    for (const p of Object.values(t.people)) {
      if (p.gone || p === this.fol) continue;
      if (p.leaving && p.onGone) { const g = p.onGone; p.onGone = null; p.leaving = false; p.fading = false; p.alpha = 1; g(); if (p.gone) continue; }
      const r = this.rooms[p.room]; if (r && !r.npcs.includes(p)) r.npcs.push(p);
    }
  }
  startTutorial(replay) {
    if (this.tut) return;
    const f = this.fol; // whoever was following you waits for another day
    if (f) { this.fol = null; f.follow = false; if (f.cur && f.cur.state) { f.cur.state = "waiting"; f.cur.room = null; } this.saveProgress(); }
    TUT_ROOMS.forEach(k => this.lightsOff.delete(k));
    this.tut = { step: "intro", sides: {}, notes: {}, replay: !!replay, people: { rosie: this.tutPerson("rosie", "Rosie", "red", "visitor_b", "tut_room2", 4, 4) } };
    for (const k of TUT_ROOMS) if (this.rooms[k]) this.rooms[k].npcs = this.rooms[k].npcs.filter(n => !n.tutId);
    this.tutDress(); this.closeAll();
    this.warp("tut_office", ...ROOMS.tut_office.spawn, () => { if (!this.tut) return; this.path = ["up", "up", "up"]; this.pathAct = null; this.tut.cut = () => this.tutUsher(); });
  }
  cleanTutorial() {
    this.tut = null; if (this.fol && this.fol.tutId) this.fol = null;
    TUT_ROOMS.forEach(k => { this.lightsOff.delete(k); if (this.rooms[k]) this.rooms[k].npcs = this.rooms[k].npcs.filter(n => !n.tutId); });
  }
  endTutorial(skipped) {
    const t = this.tut; if (!t) return;
    this.cleanTutorial();
    if (!this.progress.tutorial) { this.progress.tutorial = todayISO(); this.saveProgress(); }
    const L = this.rooms.lobby, back = t.replay && L && L.solid[6] && L.solid[6][1] === false ? [1, 6, "right"] : ROOMS.lobby.spawn;
    this.closeAll();
    this.warp("lobby", ...back, () => { if (skipped) this.showLoc("Tutorial skipped"); else this.say(this.tx("tut.welcome")); });
  }
  /* The usher at the desk: sign in with your badge, or train as a volunteer; then off you go. */
  tutUsher() {
    const t = this.tut, U = pages => this.tutSaid("Usher", pages);
    if (!t) { this.say(["The training desk."]); return; }
    if (t.step !== "intro") { const k = { signin: "go", room1: "go", feedback: "feedback", closing: "closing", lights: "lights" }[t.step] || "go"; this.say(U(this.tx("tut.usher." + k))); return; }
    t.step = "signin";
    if (this.staff) { this.say(U(this.tx("tut.already", { name: this.staff.name })), () => this.tutGo()); return; }
    const hello = U(this.tx("tut.hello")), q = hello.pop();
    this.say(hello, () => this.ask(q, ["Here's my badge", "I don't have one"], i => (i === 0 ? this.tutBadge() : this.tutNoBadge()), 1));
  }
  tutBadge() {
    if (!this.tut) return;
    this.tut.onBadge = ok => { if (ok) this.say(this.tutSaid("Usher", this.tx("tut.badgeOk")), () => this.tutGo()); else this.tutNoBadge(); };
    this.openBadge();
  }
  tutNoBadge() {
    const U = pages => this.tutSaid("Usher", pages);
    this.ask(U(this.tx("tut.patreon")).join(" "), ["No", "Yes"], i => {
      if (i === 0) { this.say(U(this.tx("tut.volunteer")), () => this.tutGo()); return; }
      const e = U(this.tx("tut.email")), q = e.pop();
      this.say(e, () => this.ask(q, ["Continue anyway", "I have my badge"], k => (k === 1 ? this.tutBadge() : this.tutGo()), 0));
    }, 0);
  }
  tutGo() { const t = this.tut; if (!t) return; this.say(this.tutSaid("Usher", this.tx("tut.go")), () => { if (this.tut && this.tut.step === "signin") this.tut.step = "room1"; }); }
  tutRedRead() { const k = this.tut && this.tut.sides["tut-red"]; return !!(k && k.front && k.back); }
  tutRead() { const t = this.tut; if (t && !t.open && this.tutRedRead()) { t.open = true; this.showLoc(this.tx("tut.unlocked")[0]); } }
  tutAllShown() { const t = this.tut; return !!t && !!t.pair && Object.values(t.people).every(p => p.tutShown); }
  // Someone still waiting for a game who isn't with you (Rosie counts once you've met her).
  tutLeftBehind() { const t = this.tut; return !!t && Object.values(t.people).some(p => !p.tutShown && p !== this.fol && (p.tutId !== "rosie" || t.met2)); }
  tutFlush() { // visitors still walking out of Training Room A: they're in the office now
    const t = this.tut; if (!t) return;
    for (const p of Object.values(t.people)) if (p.leaving && p.onGone) { for (const id in this.rooms) this.rooms[id].npcs = this.rooms[id].npcs.filter(m => m !== p); const g = p.onGone; p.onGone = null; g(); }
  }
  tutPair() { // two more visitors waiting in Training Room A
    const t = this.tut; if (!t || t.pair) return;
    t.pair = true;
    t.people.skye = this.tutPerson("skye", "Skye", "blue", "visitor_a", "tut_room1", 1, 4);
    t.people.onyx = this.tutPerson("onyx", "Onyx", "black", "visitor_c", "tut_room1", 9, 7);
    const r = this.rooms.tut_room1; [t.people.skye, t.people.onyx].forEach(p => { if (r && !r.npcs.includes(p)) r.npcs.push(p); });
  }
  tutEvent(e) {
    const t = this.tut, say = (key, vars) => this.say(this.tx(key, vars)), speak = (key, vars) => this.say(this.tutSpeak(key, vars));
    if (e.tutDoor) {
      const go = (room, x, y, dir, after) => this.warp(room, x, y, dir, after);
      if (!t) { // just looking around (the curator): every door opens
        const to = { "office-r1": ["tut_room1", 5, 8, "up"], "r1-office": ["tut_office", 10, 3, "down"], "r1-r2": ["tut_room2", 4, 6, "up"], "r2-r1": ["tut_room1", 5, 3, "down"], glass: ["lobby", 1, 6, "right"] }[e.tutDoor];
        if (to) go(...to); return true;
      }
      const late = t.step === "feedback" || t.step === "closing" || t.step === "lights";
      if (e.tutDoor === "office-r1") { if (t.step === "intro" || t.step === "signin") this.say(this.tutSaid("Usher", this.tx("tut.usher.wait"))); else go("tut_room1", 5, 8, "up"); }
      else if (e.tutDoor === "r1-office") {
        if (late) go("tut_office", 10, 3, "down");
        else if (this.tutAllShown()) { this.tutFlush(); t.step = "feedback"; go("tut_office", 10, 3, "down"); }
        else if (t.met2) speak("tut.recommendFirst");
        else this.say([...this.tx("tut.locked"), ...this.tutSpeak("tut.lockedStart")]);
      }
      else if (e.tutDoor === "r1-r2") {
        if (!this.tutRedRead()) say("tut.locked");
        else if (!late && this.tutLeftBehind()) speak("tut.recommendFirst");
        else { t.met2 = true; go("tut_room2", 4, 6, "up"); }
      }
      else if (e.tutDoor === "r2-r1") { if (!late && this.tutLeftBehind()) speak("tut.recommendFirst"); else go("tut_room1", 5, 3, "down", () => { if (this.fol && this.fol.tutId === "rosie") this.tutPair(); }); }
      else if (e.tutDoor === "glass") {
        if (t.step !== "lights") this.say(this.room.id === "tut_office" ? this.tutSaid("Usher", this.tx("tut.notYet")) : this.tx("tut.notYet"));
        else if (Object.values(t.people).some(p => !p.gone)) say("tut.waitVisitors");
        else if (!this.lightsOff.has("tut_room1") || !this.lightsOff.has("tut_room2")) speak("tut.lightsFirst");
        else this.say(this.tutSpeak("tut.done"), () => this.endTutorial(false));
      }
      return true;
    }
    if (e.usher || e.guestbook) { if (t) { const u = this.room.npcs.find(n => n.usher); if (u) u.dir = "down"; this.tutUsher(); } else this.say(["The training desk."]); return true; }
    if (e.announce) {
      if (!t) { this.say(["The office intercom."]); return true; }
      if (t.step === "lights") say("intercom.again");
      else if (t.step !== "closing") say("tut.intercomEarly");
      else this.choose(this.tx("intercom.ask").join(" "), ["Yes", "Not yet"], i => {
        if (i !== 0) return;
        this.say(this.tx("tut.announce"), () => {
          t.step = "lights";
          Object.values(t.people).forEach((p, k) => { p.tutBack = false; p.leaving = true; p.leaveT = -k * 8; p.alpha = 1; p.timer = 0; p.route = null; p.leaveTo = TUT_SPOTS.glass; p.onGone = () => { p.gone = true; }; });
        });
      });
      return true;
    }
    if (e.lights && t) {
      if (t.step !== "lights") { say("tut.lightsEarly"); return true; }
      const k = e.key || this.room.id;
      if (this.lightsOff.has(k)) { this.lightsOff.delete(k); this.showLoc("Lights on"); return true; }
      this.lightsOff.add(k); this.showLoc("Lights off");
      if (this.lightsOff.has("tut_room1") && this.lightsOff.has("tut_room2")) setTimeout(() => say("tut.allDark"), 400);
      return true;
    }
    return false;
  }
  /* The tutorial's visitors: ask for a color, follow you, take your recommendation, then tell you how it went. */
  tutTalk(n) {
    const t = this.tut;
    if (n.usher && ROOMS[this.room.id] && ROOMS[this.room.id].tutorial) { this.tutUsher(); return true; }
    if (!n.tutId) return false;
    if (!t) return true;
    const S = pages => this.tutSaid(n.member, pages);
    if (n.tutBack) { this.tutFeedback(n); return true; }
    if (n.tutHeard || n.tutShown) { this.say(S(this.tx(n.tutHeard ? "tut.after" : "tut.thanks", { title: (this.tutGame(n.tutShown) || {}).title || "it" }))); return true; }
    if (n.follow) { this.choose(S(this.tx("tut.follow")).join(" "), ["Keep going", "What were you looking for?"], i => { if (i === 1) this.say(S(this.tx("tut.remind", { color: n.tutWant }))); }, 0); return true; }
    const pages = S(this.tx("tut.ask", { color: n.tutWant })), q = pages.pop();
    this.say(pages, () => this.ask(q, ["Follow me!", "Not yet"], i => {
      if (i !== 0) return;
      if (this.fol && this.fol !== n) { this.say(this.tx("tut.oneAtATime")); return; }
      n.follow = true; n.still = false; n.route = null; n.aside = null; n.lost = 0; n.cur = { name: n.member }; this.fol = n;
      this.say(S(this.tx("tut.follow")));
    }, 1));
    return true;
  }
  tutRecommend(n, piece) {
    this.fol = null; n.follow = false; n.still = true; n.tutShown = piece.id; n.cur = null; n.dir = OPP[this.player.dir];
    this.say(this.tutSaid(n.member, this.tx("tut.thanks", { title: piece.title })), () => {
      n.leaving = true; n.leaveT = 0; n.alpha = 1; n.route = null; n.leaveTo = TUT_SPOTS.r1Exit;
      n.onGone = () => { // out through the door they came in by, to wait in the office
        const s = TUT_SPOTS.office[n.tutId] || [3, 6], r = this.rooms.tut_office;
        Object.assign(n, { leaving: false, fading: false, alpha: 1, leaveTo: null, moving: false, prog: 0, x: s[0], y: s[1], dir: "down", room: "tut_office", still: true, tutBack: true });
        if (r && !r.npcs.includes(n)) r.npcs.push(n);
      };
    });
  }
  tutFeedback(n) {
    const t = this.tut, g = this.tutGame(n.tutShown); if (!t || !g) return;
    const how = g.tutColor === n.tutWant ? "loved" : g.tutColors.includes(n.tutWant) ? "liked" : "nope"; // their color matched, was in it, or wasn't
    n.tutBack = false; n.tutHeard = how; n.react = { how, t0: this.t }; n.dir = OPP[this.player.dir];
    this.say(this.tutSaid(n.member, this.tx("tut." + how, { title: g.title, color: n.tutWant })), () => {
      if (this.tut && this.tut.step === "feedback" && Object.values(this.tut.people).every(p => p.tutHeard)) { this.tut.step = "closing"; this.say(this.tutSpeak("tut.closeUp")); }
    });
  }
  /* ----- the player's stats (Someone's PC in the basement, and a taste on the closing screen) ----- */
  markDay() { // one visit a day; visits on days in a row make a streak
    if (!this.saveKey) return;
    const st = this.progress.stats, t = todayISO(); if (st.lastDay === t) return;
    st.streak = st.lastDay && daysBetween(st.lastDay, t) === 1 ? st.streak + 1 : 1; st.best = Math.max(st.best, st.streak);
    st.days++; st.lastDay = t; this.saveProgress();
  }
  tickStats() { // once a second: time in the museum, and time in the dark
    if (!this.saveKey || this.mode === "ended" || this.full || (typeof document !== "undefined" && document.hidden)) return;
    const st = this.progress.stats; st.secs++; if (this.closing && this.darkHere()) st.dark++;
    if (st.secs % 30 === 0) this.saveProgress();
  }
  bump(obj, key) { if (key) obj[key] = (obj[key] || 0) + 1; }
  topOf(obj) { let best = null, n = 0; for (const k in obj) if (obj[k] > n) { best = k; n = obj[k]; } return best ? [best, n] : null; }
  /* Everything the stats screen shows: [section, label, value] rows (only the ones with something to say). */
  statRows() {
    const p = this.progress, t = p.tally || {}, st = p.stats, rows = [], add = (sec, label, v) => { if (v !== null && v !== undefined && v !== "" && v !== 0) rows.push([sec, label, v]); };
    const hm = x => (x >= 3600 ? Math.floor(x / 3600) + "h " : "") + Math.floor((x % 3600) / 60) + "m", plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
    add("VISITS", "Days you've visited", st.days); add("VISITS", "Current streak", st.streak > 1 ? plural(st.streak, "day") : 0); add("VISITS", "Best streak", st.best > 1 ? plural(st.best, "day") : 0);
    add("VISITS", "Time in the museum", st.secs >= 60 ? hm(st.secs) : 0);
    const lay = layoutOf(ROOMS.museum), hall = lay && lay.zones.find(z => z.id === "upper"), hl = hall ? Math.max(1, (hall.rect || hall.rects[0] || { w: 24 }).w) : 24;
    add("VISITS", "Steps walked", st.steps ? st.steps + (st.steps >= hl * 2 ? " (the " + (hall ? hall.name : "long hall") + " " + Math.floor(st.steps / hl) + " times over)" : "") : 0);
    add("VISITS", "Times you walked into a wall", st.bumps);
    const sides = Object.values(p.sides || {}), read = sides.reduce((a, k) => a + (k.front ? 1 : 0) + (k.back ? 1 : 0) + (k.note ? 1 : 0), 0);
    add("READING", "Placards read", read); add("READING", "Cases read on both sides", this.stat("bothSides"));
    const r = this.rooms && this.rooms.museum;
    if (r && r.zones) {
      const per = r.zones.filter(z => z.kind === "room").map(z => { const cs = r.cases.filter(c => c.piece && this.zoneAt(r, c.x, c.y) === z); return [z.name, cs.length, cs.filter(c => this.isRead(c.piece)).length]; }).filter(x => x[1]);
      per.forEach(([name, all, done]) => add("READING", name, done + " of " + all + (done === all ? ", all of it" : "")));
      const fav = per.filter(x => x[2]).sort((a, b) => b[2] / b[1] - a[2] / a[1])[0]; if (fav) add("READING", "Most-read wing", fav[0]);
    }
    add("RECOMMENDING", "Games recommended", t.recs); add("RECOMMENDING", "Visitors who loved them", t.helped); add("RECOMMENDING", "Visitors who didn't", st.nope);
    const lg = this.topOf(st.loved), gn = lg && (this.pack.settings.genres || []).find(g => g.id === lg[0]); if (gn) add("RECOMMENDING", "Your best category", gn.name);
    add("CHORES", "Frames dusted", t.dusted); add("CHORES", "Frames straightened", t.straightened); add("CHORES", "Cases wiped", t.wiped); add("CHORES", "Plants watered", t.watered);
    const pl = this.topOf(st.plants); if (pl && pl[1] > 1) add("CHORES", "Favorite plant", "the " + pl[0] + " (watered " + pl[1] + " times)");
    add("CHORES", "Mugs found", t.mugs); add("CHORES", "Times you closed the museum", t.closings);
    add("LIFE", "Cat pets", t.pets); add("LIFE", "Photos taken", t.photos); add("LIFE", "Photo reactions caught", this.stat("reactions") ? this.stat("reactions") + " of 10" : 0);
    const sh = this.topOf(st.shots); if (sh && sh[1] > 1) add("LIFE", "Most photographed", sh[0] + " (" + sh[1] + " times)");
    add("LIFE", "Notes left", t.notes); add("LIFE", "Drinks ordered", t.drinks);
    const dr = this.topOf(st.drinks), dn = dr && DRINKS.find(d => d.id === dr[0]); if (dn && t.drinks > 1) add("LIFE", "Usual order", dn.name);
    add("LIFE", "Episodes watched", t.episodes); add("LIFE", "Arcade games started", t.arcade); add("LIFE", "Bench naps", t.naps); add("LIFE", "Microwave incidents", t.microwave); add("LIFE", "Segway rides", t.segway); add("LIFE", "Shifts clocked in", t.shifts);
    add("LIFE", "Time in the dark after closing", st.dark >= 60 ? hm(st.dark) : st.dark ? st.dark + "s" : 0);
    return rows;
  }
  /* Your staff profile: the titles you've earned, best first (each title's words are in Words, Staff profile titles). */
  profile() {
    const p = this.progress, t = p.tally || {}, st = p.stats, all = Object.keys(p.sides || {}).length, shotTop = this.topOf(st.shots);
    const cases = this.rooms && this.rooms.museum ? this.rooms.museum.cases.filter(c => c.piece).length : 0;
    const read = Object.values(p.sides || {}).reduce((a, k) => a + (k.front ? 1 : 0) + (k.back ? 1 : 0) + (k.note ? 1 : 0), 0);
    const score = {
      cat: (t.pets || 0) / 10, naps: (t.naps || 0) / 3, closer: (t.closings || 0) / 5, matchmaker: (t.helped || 0) / 5, wrong: st.nope / 3,
      paparazzo: (t.photos || 0) / 25, creep: shotTop ? shotTop[1] / 5 : 0, walls: st.bumps / 25,
      intern: ((t.dusted || 0) + (t.straightened || 0) + (t.wiped || 0) + (t.watered || 0)) / 30, nerd: cases ? this.stat("bothSides") / cases / 0.9 : 0,
      vibes: st.days >= 3 && read < 5 ? 1.5 : 0, caffeine: (t.drinks || 0) / 10, mug: (t.mugs || 0) / 5, fire: (t.microwave || 0) ? 1.05 : 0,
      segway: (t.segway || 0) / 3, dark: st.dark / 600, laps: st.steps / 3000, streak: st.streak / 5, notes: (t.notes || 0) / 3, shirt: p.shirt ? 1.2 : 0,
    };
    const day = strSeed(todayISO()), pick = key => { const v = this.pack.settings.text["title." + key] || TEXT["title." + key].v; return this.fmt(v[day % v.length][0], { n: st.bumps }); };
    const got = Object.keys(score).filter(k => score[k] >= 1).sort((a, b) => score[b] - score[a]);
    return got.length ? got.slice(0, 3).map(pick) : [pick("new")];
  }
  /* Someone's PC: it boots up and opens PLAYER_STATS.EXE. (Turning it on is still a step in the shirt riddle.) */
  showStats() {
    const pr = this.profile(), rows = this.statRows(), secs = [];
    secs.push({ label: "STAFF PROFILE", text: pr[0] + (pr.length > 1 ? ". Also known as: " + pr.slice(1).join("; ") + "." : ".") });
    for (const sec of ["VISITS", "READING", "RECOMMENDING", "CHORES", "LIFE"]) {
      const these = rows.filter(r => r[0] === sec); if (!these.length) continue;
      secs.push({ label: sec, text: these.map(r => "  " + r[1] + ": " + r[2]).join("\n") });
    }
    this.say(this.tx("pc.boot"), () => this.read({ title: "PLAYER_STATS.EXE", sub: "Someone's PC", sections: secs, pre: true }));
  }
  /* ----- visitor notes -----
     Anyone can leave a short note on a piece. It goes to Supabase and waits there until the curator approves it (curator,
     Notes tab); approved notes show under the piece's placard. Without Supabase there are no notes and nothing asks. */
  refreshNotes(force) {
    if (!this.online()) { this.notes = null; return; }
    const now = Date.now(); if (this.notesBusy || (!force && now - (this.notesAt || 0) < 300000)) return;
    this.notesBusy = true; this.notesAt = now;
    this.rpc("get_notes").then(j => { this.notes = j && typeof j === "object" && !Array.isArray(j) ? j : {}; }).catch(() => {}).finally(() => { this.notesBusy = false; });
  }
  notesFor(p) {
    const list = (!p.tut && this.notes && Array.isArray(this.notes[p.id]) ? this.notes[p.id] : []).slice(0, 6), secs = [];
    list.forEach(n => secs.push({ label: n.name ? this.tx("note.from", { who: String(n.name).toUpperCase() }).join(" ") : this.tx("note.anon").join(" "), text: String(n.note || "") }));
    const mine = p.tut ? this.tut && this.tut.notes[p.id] : this.progress.myNotes[p.id]; // your own note, until it's up (or two weeks pass)
    if (mine && Date.now() - mine.at < 14 * 864e5 && !list.some(n => n.note === mine.note)) secs.push({ label: "", text: this.tx("note.mine").join(" ") });
    return secs;
  }
  openNote(p, then) {
    const f = this.el.noteForm; this.mode = "form"; this.kp = false; this.noteFor = { p, then };
    f.reset(); f.querySelector(".gt-badge-err").textContent = "";
    f.querySelector(".gt-badge-sub").textContent = this.tx("note.prompt", { title: p.title }).join(" ");
    f.who.value = this.progress.noteName || (this.staff ? this.staff.name : ""); this.noteCount();
    // With a controller, a keyboard on the card: the D-pad picks a key, A types, B deletes, Start sends.
    const kb = this.lastInput === "pad"; this.nkb = kb ? { i: 0, caps: false, field: "note" } : null;
    f.classList.toggle("kb", kb); this.el.noteKb.hidden = !kb; f.note.readOnly = f.who.readOnly = kb;
    if (kb) this.nkbRender();
    const sc = parseFloat(getComputedStyle(this.wrap).getPropertyValue("--s")) || 1;
    this.el.noteWrap.classList.toggle("big", sc < 1.75 || matchMedia("(pointer:coarse)").matches);
    this.el.noteWrap.style.display = "flex";
    if (!kb) setTimeout(() => f.note.focus(), 30);
  }
  /* Put the on-screen keyboard away and type with a real one (the link under it, or just start typing). */
  nkbToNative(ch) {
    const n = this.nkb, f = this.el.noteForm; if (!n) return;
    const inp = n.field === "note" ? f.note : f.who; this.nkb = null;
    f.classList.remove("kb"); this.el.noteKb.hidden = true; f.note.readOnly = f.who.readOnly = false; f.note.classList.remove("on"); f.who.classList.remove("on");
    if (ch && inp.value.length < (inp === f.note ? 200 : 24)) inp.value += ch;
    this.noteCount(); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); // right away, so the next keys land in it
  }
  nkbRender() {
    const n = this.nkb, f = this.el.noteForm; if (!n) return;
    [...this.el.noteKb.children].forEach((b, i) => { b.classList.toggle("on", i === n.i); const k = NOTE_KEYS[i]; if (k.k.length === 1 && /[a-z]/.test(k.k)) b.textContent = n.caps ? k.k.toUpperCase() : k.k; else if (k.k === "CAPS") b.textContent = n.caps ? "CAPS" : "Caps"; });
    f.note.classList.toggle("on", n.field === "note"); f.who.classList.toggle("on", n.field === "who");
  }
  nkbMove(d) {
    const n = this.nkb, k = NOTE_KEYS[n.i], row = Math.min(3, Math.floor(n.i / 10));
    if (d === "left" || d === "right") n.i = Math.max(0, Math.min(NOTE_KEYS.length - 1, n.i + (d === "left" ? -1 : 1)));
    else { // up and down: the key in the next row that covers this column
      const col = k.col + Math.floor((k.span - 1) / 2), r2 = Math.max(0, Math.min(3, row + (d === "up" ? -1 : 1)));
      if (r2 !== row) n.i = r2 < 3 ? r2 * 10 + col : NOTE_KEYS.findIndex((q, j) => j >= 30 && col >= q.col && col < q.col + q.span);
    }
    this.nkbRender();
  }
  nkbPress() {
    const n = this.nkb, k = NOTE_KEYS[n.i], f = this.el.noteForm, inp = n.field === "note" ? f.note : f.who, max = n.field === "note" ? 200 : 24;
    if (k.k === "CAPS") n.caps = !n.caps;
    else if (k.k === "DEL") this.nkbDel(true);
    else if (k.k === "DONE") { if (n.field === "note") n.field = "who"; else this.submitNote(); }
    else if (inp.value.length < max) inp.value += n.caps ? k.k.toUpperCase() : k.k;
    this.noteCount(); this.nkbRender();
  }
  nkbDel(key) { // B, or the Del key: a letter back; on an empty name, back to the note; on an empty note (B only), put the card away
    const n = this.nkb, f = this.el.noteForm, inp = n.field === "note" ? f.note : f.who;
    if (inp.value) inp.value = inp.value.slice(0, -1);
    else if (n.field === "who") n.field = "note";
    else if (!key) { this.closeNote(); return; }
    this.noteCount(); this.nkbRender();
  }
  noteCount() { const f = this.el.noteForm; f.querySelector(".gt-note-count").textContent = f.note.value.length + " / 200"; }
  closeNote(sent) {
    this.nkb = null; this.el.noteWrap.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.wrap.focus({ preventScroll: true });
    const n = this.noteFor; this.noteFor = null;
    if (sent) this.say(this.tx("note.thanks"), () => n && n.then()); else if (n) n.then();
  }
  async submitNote() {
    const f = this.el.noteForm, err = f.querySelector(".gt-badge-err"), n = this.noteFor; if (!n || this.noteBusy) return;
    const note = f.note.value.replace(/\s+/g, " ").trim().slice(0, 200), who = f.who.value.replace(/\s+/g, " ").trim().slice(0, 24);
    if (note.length < 2) { err.textContent = this.tx("note.empty")[0]; f.note.focus(); return; }
    if (n.p.tut) { if (this.tut) this.tut.notes[n.p.id] = { note, at: Date.now() }; this.closeNote(true); return; } // the tutorial: it looks sent, but isn't
    if (!this.progress.clientId) this.progress.clientId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); // a random id for fair limits; not who you are
    this.noteBusy = true; err.textContent = "Sending...";
    let res = null;
    try { res = await this.rpc("submit_note", { p_piece: n.p.id, p_title: n.p.title, p_name: who, p_note: note, p_client: this.progress.clientId }); } catch (e) {} finally { this.noteBusy = false; }
    if (!res || !res.ok) { err.textContent = this.tx(res && /^(slow|busy|full)$/.test(res.reason) ? "note.slow" : res && res.reason === "short" ? "note.empty" : "note.fail")[0]; return; }
    this.progress.myNotes[n.p.id] = { note, at: Date.now() }; this.progress.noteName = who;
    this.progress.tally.notes = (this.progress.tally.notes || 0) + 1; this.saveProgress();
    this.closeNote(true);
  }
  /* The leaderboard and Employee of the Month: fetched on load and when you walk into the lobby or staff room (at most every 5 minutes). */
  refreshBoard(force) {
    if (!this.online()) { this.board = null; this.boardErr = false; return; }
    const now = Date.now(); if (this.boardBusy || (!force && now - this.boardAt < 300000)) return;
    this.boardBusy = true; this.boardAt = now;
    this.rpc("get_leaderboard").then(b => { this.board = b && Array.isArray(b.top) ? b : null; this.boardErr = !this.board; })
      .catch(() => { this.boardErr = true; }).finally(() => { this.boardBusy = false; });
  }
  /* Who's in the Employee of the Month frame: the name typed in the curator wins; otherwise it's picked from the board. */
  eotmInfo() {
    const e = this.pack.settings.staff.eotm;
    if (e.name) return { pages: [["EMPLOYEE OF THE MONTH", e.name + (e.note ? ". " + e.note : ".")]] };
    const a = this.board && this.board.eotm;
    if (a && a.name) return { pages: [this.tx(a.sofar ? "eotm.sofar" : "eotm.auto", { name: a.name, points: a.points, month: a.month })] };
    return null;
  }
  /* Send one chore to the staff office. If it can't be reached, say so once; if the badge stopped working, clock out. */
  sendDuty(kind, target) {
    const s = this.staff; if (!s || !s.token || !this.online()) return;
    this.rpc("log_duty", { p_token: s.token, p_duty: kind, p_target: String(target || "").slice(0, 60) }).then(r => {
      if (r && r.ok === false && (r.reason === "session" || r.reason === "inactive")) {
        if (this.staff && this.staff.token === s.token) { this.progress.staff = null; this.progress.lastBadge = null; this.saveProgress(); this.updateHud(); }
        const show = () => (this.mode === "walk" ? this.say(this.tx("badge.expired")) : setTimeout(show, 500)); show();
      } else if (r && r.counted) this.boardAt = 0;
    }).catch(() => { if (!this.netWarned) { this.netWarned = true; this.showLoc(this.tx("net.down")[0]); } });
  }
  readLeaderboard() {
    if (!this.online()) {
      const rows = Object.values(this.progress.staffTally || {}).map(t => ({ name: t.name, points: POINT_KINDS.reduce((a, k) => a + (t[k] || 0) * chorePoints(k), 0) })).filter(r => r.points > 0).sort((a, b) => b.points - a.points);
      this.say([...this.tx("board.offline"), ...rows.slice(0, 10).map((r, i) => (i + 1) + ". " + r.name + ", " + pts(r.points) + ".")]);
      return;
    }
    if (!this.board) { this.refreshBoard(true); this.say(this.tx("board.down")); return; }
    const b = this.board, top = b.top || [], pages = [...this.tx("board.title", { month: String(b.month || "").toUpperCase() })];
    if (!top.length) { this.say([...pages, ...this.tx("board.empty")]); this.refreshBoard(); return; }
    for (let i = 0; i < top.length; i += 2) pages.push(top.slice(i, i + 2).map((r, j) => (i + j + 1) + ". " + r.name + ", " + pts(r.points) + ".").join("  "));
    const s = this.staff, at = s && s.token ? top.findIndex(r => r.name === s.name) : -1;
    if (at >= 0) pages.push(...this.tx("board.you", { rank: at + 1, points: top[at].points }));
    this.say(pages); this.refreshBoard();
  }
  staffDoor(e) {
    const to = (e && e.warp) || ["staff", 7, 8, "up"];
    this.staffTo = to;
    if (this.staff || this.curator) { this.warp(...to); return; }
    const last = this.progress.lastBadge;
    if (last) {
      this.choose("Staff only. Clock in as " + last.name + "?", ["Clock in", "Different badge", "Not now"], i => {
        if (i === 0) { this.progress.staff = last; this.saveProgress(); this.updateHud(); this.showLoc("Clocked in: " + last.name); this.warp(...to); }
        else if (i === 1) this.openBadge();
      });
      return;
    }
    this.openBadge();
  }
  openBadge() {
    const f = this.el.badgeForm; this.mode = "form";
    f.reset(); f.querySelector(".gt-badge-err").textContent = "";
    this.kp = this.keypadUI !== undefined ? this.keypadUI : matchMedia("(pointer:coarse)").matches;
    f.classList.toggle("kp", !!this.kp); f.classList.remove("native");
    ["badge", "key"].forEach(n => { f[n].readOnly = !!this.kp; f[n].setAttribute("inputmode", this.kp ? "none" : n === "badge" ? "numeric" : "text"); });
    if (this.kp) { this.kpField("badge"); this.el.badgeWrap.classList.toggle("big", (parseFloat(getComputedStyle(this.wrap).getPropertyValue("--s")) || 1) < 1.75); this.el.badgeWrap.style.display = "flex"; return; }
    f.querySelector(".gt-badge-test").hidden = !this.showTestBadge;
    const sc = parseFloat(getComputedStyle(this.wrap).getPropertyValue("--s")) || 1;
    this.el.badgeWrap.classList.toggle("big", sc < 1.75);
    this.el.badgeWrap.style.display = "flex";
    setTimeout(() => f.querySelector("input").focus(), 30);
  }
  /* ----- the keypad -----
     A numpad for the badge number, a letter grid for the key. Tap keys, or move with the D-pad, A to type, B to delete. */
  kpField(name) {
    const f = this.el.badgeForm; this.kpOn = name; this.kpSel = 0;
    ["badge", "key"].forEach(n => f[n].classList.toggle("on", n === name));
    const keys = name === "badge" ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "DEL", "0", "NEXT"] : [...KEY_ALPHABET, "DEL", "BACK", "CLOCK IN"];
    this.kpKeys = keys;
    const pad = this.el.keypad; pad.className = "gt-keypad " + (name === "badge" ? "num" : "abc"); pad.innerHTML = "";
    keys.forEach((k, i) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = k === "DEL" ? "\u2190" : k === "BACK" ? "\u2191" : k === "NEXT" ? "OK" : k;
      b.setAttribute("aria-label", k === "DEL" ? "Delete" : k === "BACK" ? "Back to badge number" : k === "NEXT" ? "Next: badge key" : k === "CLOCK IN" ? "Clock in" : k);
      if (k === "CLOCK IN" || (name === "key" && (k === "DEL" || k === "BACK"))) b.className = k === "CLOCK IN" ? "wide" : "";
      if (k === "CLOCK IN") b.style.gridColumn = "span 6";
      b.addEventListener("pointerdown", e => e.preventDefault());
      b.addEventListener("click", e => { e.preventDefault(); this.kpSel = i; this.kpPress(k); });
      pad.appendChild(b);
    });
    this.kpRender();
  }
  kpRender() { [...this.el.keypad.children].forEach((b, i) => b.classList.toggle("on", i === this.kpSel)); }
  kpPress(k) {
    const f = this.el.badgeForm, inp = f[this.kpOn];
    if (navigator.vibrate && this.haptics) try { navigator.vibrate(6); } catch (e) {}
    if (k === "DEL") {
      if (this.kpOn === "key" && !normKey(inp.value)) { this.kpField("badge"); return; }
      const v = this.kpOn === "key" ? normKey(inp.value).slice(0, -1) : inp.value.slice(0, -1);
      inp.value = this.kpOn === "key" && v.length > 3 ? v.slice(0, 3) + "-" + v.slice(3) : v;
    } else if (k === "NEXT") this.kpField("key");
    else if (k === "BACK") this.kpField("badge");
    else if (k === "CLOCK IN") this.submitBadge();
    else if (this.kpOn === "badge") { if (inp.value.length < 8) inp.value += k; }
    else { const v = normKey(inp.value); if (v.length < 6) { const n = v + k; inp.value = n.length > 3 ? n.slice(0, 3) + "-" + n.slice(3) : n; } if (normKey(inp.value).length === 6) { this.kpSel = this.kpKeys.indexOf("CLOCK IN"); this.kpRender(); } }
  }
  kpMove(d) {
    const cols = this.kpOn === "badge" ? 3 : 8, n = this.kpKeys.length;
    let i = this.kpSel;
    if (d === "left") i = Math.max(0, i - 1); else if (d === "right") i = Math.min(n - 1, i + 1);
    else if (d === "up") i = i - cols >= 0 ? i - cols : i; else if (d === "down") i = Math.min(n - 1, i + cols);
    this.kpSel = i; this.kpRender();
  }
  /* The escape hatch: the phone's own keyboard (for pasting or a password manager). */
  nativeKeyboard() {
    const f = this.el.badgeForm; this.kp = false; f.classList.remove("kp"); f.classList.add("native");
    ["badge", "key"].forEach(n => { f[n].readOnly = false; f[n].classList.remove("on"); f[n].setAttribute("inputmode", n === "badge" ? "numeric" : "text"); });
    this.el.badgeWrap.classList.add("big");
    setTimeout(() => f.badge.focus(), 30);
  }
  useKeypad() {
    const f = this.el.badgeForm; this.kp = true; f.classList.remove("native"); f.classList.add("kp");
    ["badge", "key"].forEach(n => { f[n].readOnly = true; f[n].setAttribute("inputmode", "none"); f[n].blur(); });
    this.el.badgeWrap.classList.toggle("big", (parseFloat(getComputedStyle(this.wrap).getPropertyValue("--s")) || 1) < 1.75);
    this.kpField(f.badge.value && !normKey(f.key.value) ? "key" : "badge");
  }
  closeBadge() {
    this.el.badgeWrap.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.wrap.focus({ preventScroll: true });
    if (this.tut && this.tut.onBadge) { const f = this.tut.onBadge; this.tut.onBadge = null; f(false); } // "Not now" at the usher's desk
  }
  async submitBadge() {
    const f = this.el.badgeForm, err = f.querySelector(".gt-badge-err");
    if (this.badgeBusy) return; this.badgeBusy = true; err.textContent = this.online() ? "Checking your badge..." : "";
    let who; try { who = await this.checkBadge(f.badge.value, f.key.value); } finally { this.badgeBusy = false; }
    if (!who || who.error) { err.textContent = this.tx((who && who.error) || "badge.wrong")[0]; return; }
    this.progress.staff = who; this.shift = {}; this.saveProgress();
    this.progress.lastBadge = who; this.progress.tally.shifts = (this.progress.tally.shifts || 0) + 1; this.saveProgress();
    if (this.tut && this.tut.onBadge) { const f = this.tut.onBadge; this.tut.onBadge = null; this.closeBadge(); this.updateHud(); f(true); return; } // signing in with the usher
    this.closeBadge(); this.updateHud(); this.showLoc("Clocked in: " + who.name);
    const to = this.staffTo || ["staff", 7, 8, "up"];
    if (this.room.id !== to[0]) this.warp(...to);
  }
  timeClock() {
    if (this.curator && !this.staff) { this.say(this.tx("clock.curator")); return; }
    if (!this.staff) {
      const last = this.progress.lastBadge;
      this.choose("You're off shift." + (last ? " Clock in as " + last.name + "?" : " Clock in with your badge?"), ["Clock in", "Not now"], i => {
        if (i !== 0) return;
        if (!last) { this.openBadge(); return; }
        this.progress.staff = last; this.saveProgress(); this.updateHud(); this.showLoc("Clocked in: " + last.name);
      });
      return;
    }
    const n = this.staffChores();
    this.choose("On shift as " + this.staff.name + ". " + n + " point" + (n === 1 ? "" : "s") + " on your tally. Clock out?",
      ["Clock out", "Keep working"], i => {
        if (i !== 0) return;
        const name = this.staff.name; this.progress.staff = null; this.saveProgress(); this.updateHud();
        this.say(this.tx("clock.out", { name }));
      });
  }
  /* The photo in your locker frame: one you put there, or a snapshot of you (head and shoulders, in what you're wearing). */
  framePhoto() {
    const lp = this.progress.lockerPhoto; if (lp) return this.photoThumb(lp);
    const sheet = this.staff ? "player_staff" : this.progress.wearShirt ? "player_goq_shirt" : "player", ck = "selfie|" + sheet;
    if (this.cache[ck]) return this.cache[ck];
    const art = ROOMS.staff && ROOMS.staff.art ? ROOMS.staff.art : {};
    return (this.cache[ck] = this.photoThumb({ thumb: { slot: sheet, bg: art.floor || "staff_floor" }, desc: "selfie", tod: "day", seed: 7 }));
  }
  /* Which locker is yours: by badge when you're clocked in; the first one for the curator (to try the frame). -1 = none. */
  myLocker() { return this.staff ? strSeed(this.staff.badge) % 6 : this.curator ? 0 : -1; }
  locker(i) {
    if (this.myLocker() === i) {
      const lp = this.progress.lockerPhoto, has = !!lp, ph = this.progress.photos || [];
      this.say(this.tx("locker.mine", { locker: i + 1 }), () => {
        const opts = ["Look at the photo", ...(ph.length ? ["Change the photo"] : []), ...(has ? ["Put my own photo back"] : []), "Leave it"];
        this.choose(this.tx(has ? "frame.has" : "frame.ask").join(" "), opts, k => {
          const o = opts[k];
          if (o === "Look at the photo") {
            this.el.cuFrame.style.borderImageSource = `url("${this.src("closeup_wood")}")`;
            this.el.cuImg.src = this.framePhoto().toDataURL(); this.el.cuImg.alt = has ? lp.desc : "You"; this.el.cuImg.classList.remove("photo", "item");
            this.el.cuLinks.innerHTML = ""; this.el.cu.style.display = "flex";
            this.say(has ? [lp.desc] : this.tx("frame.self"), () => { this.el.cu.style.display = "none"; });
          } else if (o === "Put my own photo back") {
            this.ask(this.tx("frame.back").join(" "), ["Yes", "No"], y => { if (y === 0) { this.progress.lockerPhoto = null; this.saveProgress(); this.say(this.tx("frame.done")); } }, 1);
          } else if (o && o !== "Leave it") {
            this.albumPick = j => this.ask(this.tx(has ? "frame.replace" : "frame.warn").join(" "), ["Yes", "No"], y => {
              if (y !== 0) return;
              this.progress.lockerPhoto = ph.splice(j, 1)[0]; this.saveProgress();
              this.say(this.tx("frame.done"));
            }, 1);
            this.mode = "album"; this.albumSel = 0; this.el.album.style.display = "block"; this.renderAlbum();
          }
        }, opts.length - 1);
      });
      return;
    }
    const lines = ["A sticky note: \"Do not touch my yogurt.\"", "Locked. It hums faintly.", "Someone taped a pixel-art cat to this one.",
      "Empty. It smells like old coffee.", "A note in big letters: \"WAIT. WHY DID THAT HAPPEN?\"", "Locked. There's a dent shaped like a controller."];
    const v = this.pack.settings.text["locker.others"] || TEXT["locker.others"].v; this.say(v[i % v.length].map(p => this.fmt(p, this.baseVars())));
  }
  readRules() {
    this.say(this.tx("rules"));
  }
  readCorkboard() {
    const notes = this.pack.settings.staff.corkboard;
    this.say(notes.length ? [...this.tx("cork.intro"), ...notes] : this.tx("cork.empty"));
  }
  readEotm() {
    const e = this.eotmInfo();
    this.say(e ? e.pages[0] : this.tx("eotm.empty"));
  }
  /* A yes/no style choice: the question in the text box, options in a small box above it. */
  choose(question, options, done, cancelTo) {
    this.mode = "choice"; this.ch = { options, i: 0, done, cancelTo }; // cancelTo: what B picks (-1 = nothing); default the last option
    this.el.text.style.display = "block"; this.el.textBody.textContent = question; this.el.more.style.display = "none";
    this.el.choice.style.display = "block"; this.renderChoice();
  }
  renderChoice() {
    const c = this.ch, box = this.el.choice, top = box.scrollTop; box.innerHTML = "";
    c.options.forEach((o, i) => {
      const d = document.createElement("div"); d.className = "gt-choice-item" + (i === c.i ? " on" : ""); d.textContent = o;
      d.addEventListener("click", e => { e.stopPropagation(); c.i = i; this.endChoice(); });
      box.appendChild(d);
    });
    // A long list scrolls: keep the cursor's row in view (wrapping from the top to the bottom, or back).
    box.scrollTop = top; const on = box.children[c.i];
    if (on) { if (on.offsetTop < box.scrollTop) box.scrollTop = on.offsetTop; else if (on.offsetTop + on.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = on.offsetTop + on.offsetHeight - box.clientHeight; }
  }
  endChoice(cancel) {
    const c = this.ch; this.ch = null;
    this.el.choice.style.display = "none"; this.el.text.style.display = "none";
    this.mode = "walk"; this.inputLock = true;
    c.done(cancel ? (c.cancelTo !== undefined ? c.cancelTo : c.options.length - 1) : c.i);
  }
  readGuestbook() {
    const g = this.pack.guestbook;
    if (!g.length) { this.say(this.tx("guestbook.empty")); return; }
    const pages = this.tx("guestbook.intro").slice();
    g.slice(-6).reverse().forEach(e => pages.push((e.name ? e.name + ": " : "") + e.note));
    this.say(pages);
  }

  /* ----- words ----- */
  fmt(str, vars) { return this.roomNames(str).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined ? vars[k] : m)); }
  /* {room:upper} in any text: that room's or hallway's name right now (a museum room or hallway by its id, or a room like
     "lobby"), so renaming a room renames it everywhere it's mentioned. */
  roomNames(str) { return String(str).replace(/\{(room|ROOM):([\w-]+)\}/g, (m, k, id) => { const n = this.roomName(id); return n ? (k === "ROOM" ? n.toUpperCase() : n) : m; }); } // {ROOM:id}: in capitals
  roomName(id) {
    for (const rid in ROOMS) { const lay = layoutOf(ROOMS[rid]), z = lay && lay.zones.find(q => q.id === id); if (z) return z.name; }
    return ROOMS[id] ? ROOMS[id].name.replace(/\s+/g, " ") : "";
  }
  baseVars() {
    const catRoom = Object.values(this.rooms || {}).find(r => r.cat);
    return { name: this.staff ? this.staff.name : "friend", cat: this.pack.settings.staff.catName, catRoom: catRoom ? catRoom.name.replace(/\s+/g, " ") : "somewhere", drink: this.drink ? this.drink.name.toLowerCase() : "drink" };
  }
  /* The pages for one entry in the Words list, with its placeholders filled in. Several variants take turns; random: true picks one. */
  tx(key, vars, random) {
    const v = this.pack.settings.text[key] || (TEXT[key] && TEXT[key].v) || [[key]];
    this.txI = this.txI || {}; const i = random ? Math.floor(Math.random() * v.length) : (this.txI[key] = ((this.txI[key] === undefined ? -1 : this.txI[key]) + 1)) % v.length;
    const all = Object.assign(this.baseVars(), vars || {});
    return v[i % v.length].map(p => this.fmt(p, all));
  }
  /* Chatting with staff: pick a line whose conditions all hold, taking turns. */
  talkWhen(w) {
    const c = this.crowdToday(), tod = this.tod();
    return { always: true, visitor: !this.staff, staff: !!this.staff, day: tod === "day", sunset: tod === "sunset", night: tod === "night", medium: c === "medium",
      heavy: c === "heavy", reveal: this.pack.pieces.some(p => p.unveil === todayISO()), closing: this.closing, drink: !!this.drink, photos: !!(this.progress.photos || []).length,
      helped: !!this.progress.tally.helped, cat: !!(this.room && this.room.cat), shirt: !!this.progress.wearShirt && !this.staff }[w];
  }
  staffTalk(role, then, who) {
    let entries = (this.pack.settings.talk[role] || []).filter(e => (e.when.length ? e.when : ["always"]).every(w => this.talkWhen(w)));
    // Wearing the GOQ shirt overrides everything: staff can only talk about the shirt.
    if (entries.some(e => e.when.includes("shirt"))) entries = entries.filter(e => e.when.includes("shirt"));
    // Prefer the most specific lines: those with the most conditions that hold.
    const best = entries.length ? Math.max(...entries.map(e => e.when.filter(w => w !== "always").length)) : 0;
    const pool = []; entries.filter(e => e.when.filter(w => w !== "always").length >= Math.min(best, 1)).forEach(e => e.v.forEach(pg => pool.push(pg)));
    if (!pool.length) { this.say([(who ? who + ": " : "") + "..."], then); return; }
    this.talkI = this.talkI || {}; const i = (this.talkI[role] = ((this.talkI[role] === undefined ? -1 : this.talkI[role]) + 1)) % pool.length;
    const vars = this.baseVars(); this.say(pool[i].map((p, k) => (who && k === 0 ? who + ": " : "") + this.fmt(p, vars)), then);
  }

  /* ----- evening -----
     Real time in the visitor's own time zone: day 7 am to 5 pm, sunset 5 to 7 pm (and 6 to 7 am), night 7 pm to 6 am. */
  tod() {
    if (this.timeOverride) return this.timeOverride;
    const h = new Date().getHours();
    return h >= 19 || h < 6 ? "night" : h >= 17 || h === 6 ? "sunset" : "day";
  }
  /* How busy today is: medium or heavy, picked per day (about half each). Any day a piece is unveiled is heavy. */
  crowdToday() {
    const t = todayISO();
    if (this.pack && this.pack.pieces.some(p => p.unveil === t)) return "heavy";
    return strSeed("crowd" + t) % 2 ? "heavy" : "medium";
  }
  setTime(t) { this.timeOverride = t || null; this.lastTod = this.tod(); this.rebuild(); }
  lookOutWindow() {
    this.say(this.tx("window." + this.tod()));
  }

  /* ----- gift shop and café -----
     Every chore earns a token (closing up earns 3). Tokens buy souvenirs; drinks are free unless the host sets a price. */
  earn(n) { this.progress.tokens = (this.progress.tokens || 0) + n; this.updateHud(true); }
  shopDoor() {
    this.warp(...((arguments[0] && arguments[0].warp) || ["shop", 1, 5, "right"]));
  }
  shopCounter() {
    if (this.closing) { this.say(this.tx("shop.closed")); return; }
    if (this.room.npcs.some(n => n.role === "shopkeeper")) {
      this.choose("Welcome in! What can I do for you?", ["Browse the shop", "Just chatting", "Never mind"], i => {
        if (i === 0) this.openShop();
        else if (i === 1) {
          this.quest("chat");
          if (!this.progress.shirt && (this.progress.quest || 0) >= SHIRT_STEPS.length) { this.progress.shirt = true; this.progress.quest = 0; this.saveProgress(); this.say(this.tx("shirt.reveal")); }
          else this.staffTalk("shopkeeper");
        }
      });
      return;
    }
    this.openShop();
  }
  itemIcon(it) {
    const ck = "icon|" + it.id + "|" + (it.image ? it.image.length : 0);
    if (this.cache[ck]) return this.cache[ck];
    const c = document.createElement("canvas"); c.width = 16; c.height = 16; const x = c.getContext("2d");
    if (it.image && this.itemImgs[it.id]) {
      x.imageSmoothingEnabled = true; const im = this.itemImgs[it.id], k = Math.min(16 / im.width, 16 / im.height);
      x.drawImage(im, (16 - im.width * k) / 2, (16 - im.height * k) / 2, im.width * k, im.height * k);
    } else {
      const sd = strSeed(it.id + it.name), hue = sd % 360, a = mk(16, 16), nm = it.name.toLowerCase();
      // Pick a placeholder shape from the name when it gives a hint: pin, bag, mug, card.
      const kind = /pin|badge|button/.test(nm) ? 0 : /bag|tote|pouch/.test(nm) ? 1 : /mug|cup/.test(nm) ? 2 : /card|post|print|poster|sticker/.test(nm) ? 3 : sd % 4;
      if (kind === 0) { circ(a, 7.5, 7.5, 5, 1); circ(a, 7.5, 7.5, 3, 2); px(a, 7, 5, 0); }
      else if (kind === 1) { rect(a, 3, 6, 10, 8, 1); rect(a, 5, 3, 1, 4, 2); rect(a, 10, 3, 1, 4, 2); rect(a, 5, 3, 6, 1, 2); rect(a, 5, 9, 6, 2, 2); }
      else if (kind === 2) { rect(a, 3, 4, 8, 10, 1); rect(a, 11, 6, 2, 1, 1); rect(a, 12, 7, 1, 4, 1); rect(a, 11, 10, 2, 1, 1); rect(a, 4, 6, 6, 2, 2); }
      else { rect(a, 2, 4, 12, 9, 0); rect(a, 3, 5, 6, 7, 1); rect(a, 10, 6, 3, 1, 2); rect(a, 10, 8, 3, 1, 2); rect(a, 11, 5, 2, 1, 1); }
      const col = l => "hsl(" + hue + ",55%," + l + "%)";
      const toHex = css => { const t = document.createElement("canvas").getContext("2d"); t.fillStyle = css; t.fillRect(0, 0, 1, 1); const d = t.getImageData(0, 0, 1, 1).data; return "#" + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, "0")).join(""); };
      x.drawImage(paint([outline(a)], 16, 16, 1, ["#f8f4ec", toHex(col(62)), toHex(col(38)), "#181820"]), 0, 0);
    }
    return (this.cache[ck] = c);
  }
  openShop() {
    this.mode = "shop"; this.shopSel = 0; this.shopMsg = ""; this.shopConfirm = null;
    this.el.shop.style.display = "block"; this.renderShop();
  }
  closeShop() { this.el.shop.style.display = "none"; this.mode = "walk"; this.inputLock = true; }
  shopRows() {
    const sh = this.pack.settings.shop;
    const items = sh.items.slice().sort((a, b) => (b.id === sh.featured) - (a.id === sh.featured));
    const full = this.progress.stamps.length >= sh.stampSize && sh.items.length;
    return [...(full ? [{ trade: true }] : []), ...items.map(it => ({ item: it })), { shirt: true }, { collection: true }, { leave: true }];
  }
  renderShop() {
    const box = this.el.shop, rows = this.shopRows(), sh = this.pack.settings.shop, owned = this.progress.items;
    this.shopSel = Math.max(0, Math.min(rows.length - 1, this.shopSel));
    box.innerHTML = "";
    const head = document.createElement("div"); head.className = "gt-shop-head";
    const t1 = document.createElement("span"); t1.textContent = "GIFT SHOP";
    const t2 = document.createElement("span"); t2.textContent = "TOKENS " + (this.progress.tokens || 0);
    head.appendChild(t1); head.appendChild(t2); box.appendChild(head);
    const list = document.createElement("div"); list.className = "gt-shop-list"; box.appendChild(list);
    rows.forEach((r, i) => {
      const row = document.createElement("div"); row.className = "gt-shop-row" + (i === this.shopSel ? " on" : "");
      if (r.item) {
        const img = document.createElement("img"); img.src = this.itemIcon(r.item).toDataURL(); img.alt = ""; row.appendChild(img);
        const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = (r.item.id === sh.featured ? "* " : "") + r.item.name; row.appendChild(nm);
        const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = owned.includes(r.item.id) ? "OWNED" : r.item.price + " T" + (this.stampPrize(r.item) ? " or card" : ""); row.appendChild(pr);
      } else if (r.trade) {
        const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = "Trade your full stamp card"; row.appendChild(nm);
        const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = "FREE"; row.appendChild(pr);
      } else if (r.shirt) {
        const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = "GOQ shirt"; row.appendChild(nm);
        const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = this.progress.shirt ? "YOURS" : "DISCONTINUED"; row.appendChild(pr);
      } else { const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = r.collection ? "Your collection" : "Leave"; row.appendChild(nm); }
      row.addEventListener("click", e => { e.stopPropagation(); if (this.shopSel === i) this.shopSelect(); else { this.shopSel = i; this.shopConfirm = null; this.shopMsg = ""; this.renderShop(); } });
      list.appendChild(row);
    });
    const r = rows[this.shopSel], det = document.createElement("p"); det.className = "gt-shop-detail";
    det.textContent = this.shopMsg || (r.item ? (r.item.id === sh.featured ? "FEATURED. " : "") + (r.item.description || "") :
      r.trade ? "Pick one prize item, on the house." : r.shirt ? this.tx(this.progress.shirt ? "shirt.owned" : "shirt.tease").join(" ") : r.collection ? "See what you've bought." : "Head back out.");
    box.appendChild(det);
    const sel = list.children[this.shopSel]; if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }
  shopSelect() {
    const r = this.shopRows()[this.shopSel], t = this.progress.tokens || 0;
    if (r.leave) { this.closeShop(); this.say(this.tx("shop.bye")); return; }
    if (r.shirt) { this.shopMsg = this.tx(this.progress.shirt ? "shirt.owned" : "shirt.tease").join(" "); this.renderShop(); return; }
    if (r.trade) { this.tradeStampCard(); return; }
    if (r.collection) {
      const names = this.pack.settings.shop.items.filter(it => this.progress.items.includes(it.id)).map(it => it.name);
      const gone = this.progress.items.length - names.length;
      this.shopMsg = names.length ? "You have: " + names.join(", ") + (gone > 0 ? ", plus " + gone + " retired item" + (gone > 1 ? "s" : "") : "") + "." :
        gone > 0 ? "You have " + gone + " item" + (gone > 1 ? "s" : "") + " the shop no longer sells." : "Nothing yet. Chores earn tokens.";
      this.renderShop(); return;
    }
    const it = r.item;
    if (this.progress.items.includes(it.id)) this.shopMsg = "You already have this one.";
    else if (t < it.price) this.shopMsg = "You need " + (it.price - t) + " more token" + (it.price - t === 1 ? "" : "s") + ". Chores earn tokens.";
    else if (this.shopConfirm !== it.id) { this.shopConfirm = it.id; this.shopMsg = "Buy " + it.name + " for " + it.price + " tokens? Press A again."; }
    else {
      this.progress.tokens = t - it.price; this.progress.items.push(it.id); this.saveProgress(); this.updateHud();
      this.shopConfirm = null; this.shopMsg = "You bought " + it.name + "! " + (this.staff ? "It's in the staff room's collection cabinet." : "It's in your collection.");
    }
    this.renderShop();
  }
  /* Each stand (rack or shelving unit) shows one item, in Shop-tab order: stand 1 has item 1, and so on. A stand without an item gets trinkets. */
  unitGoods(u) { const it = this.pack.settings.shop.items[u], out = []; for (let k = 0; k < 6; k++) out.push(it ? { item: it } : { trinket: hash(u, k) % 8 }); return out; } // one item per stand, in menu order
  rackItems(i) { const items = this.pack.settings.shop.items; return [items[i] || null]; } // one item per stand, in menu order
  browseUnit(u) { this.browseRack(u); } // each stand shows its one item, same as a rack
  browseRack(i) {
    const items = this.rackItems(i).filter(Boolean);
    if (!items.length) { this.say(this.tx("rack.empty")); return; }
    const show = k => {
      const it = items[k]; if (!it) { this.el.cu.style.display = "none"; return; }
      this.el.cuFrame.style.borderImageSource = `url("${this.src("closeup_wood")}")`;
      const img = this.itemImgs[it.id];
      this.el.cuImg.src = img ? it.image : this.itemIcon(it).toDataURL(); this.el.cuImg.alt = it.name;
      this.el.cuImg.classList.toggle("photo", !!img); this.el.cuImg.classList.add("item");
      this.el.cuLinks.innerHTML = ""; this.el.cu.style.display = "flex";
      const owned = this.progress.items.includes(it.id);
      const note = this.closing ? this.tx("shop.closed")[0] : owned ? "You already have one of these." : this.tx("rack.available", { n: it.price }).join(" ");
      this.say([it.name.toUpperCase(), ...(it.description ? [it.description] : []), note], () => { this.el.cuImg.classList.remove("item"); show(k + 1); });
    };
    show(0);
  }
  ownedItems() { return this.pack.settings.shop.items.filter(it => this.progress.items.includes(it.id)); }
  viewCollection() {
    const own = this.ownedItems(), gone = this.progress.items.length - own.length, who = this.staff ? this.staff.name : "you";
    if (!own.length && !gone) { this.say(this.tx("cabinet.empty")); return; }
    const pages = this.tx("cabinet.intro").slice();
    own.forEach(it => pages.push(it.name + (it.description ? ": " + it.description : "")));
    if (own.length > 12) pages.push("The shelves only fit twelve. The rest are stacked carefully behind them.");
    if (gone) pages.push("Plus " + gone + " retired souvenir" + (gone > 1 ? "s" : "") + " the shop doesn't sell anymore.");
    this.say(pages);
  }
  /* The cat moves to a new nap spot every 20 minutes or so (real time), somewhere in any room with cat spots. */
  catBucket() { return Math.floor(Date.now() / (20 * 60 * 1000)); }
  moveCat() {
    for (const id in this.rooms) { const r = this.rooms[id]; if (!r.cat) continue; const { x, y } = r.cat; delete r.events[x + "," + y]; if (!r.props.some(p => p.catBed && p.x === x && p.y === y)) r.solid[y][x] = false; r.cat = null; }
    const ids = Object.keys(ROOMS).filter(id => ROOMS[id].catSpots && this.rooms[id]), cs = strSeed("cat" + todayISO() + this.catBucket());
    for (let k = 0; k < ids.length; k++) {
      const id = ids[(cs + k) % ids.length], r = this.rooms[id], spots = ROOMS[id].catSpots, [x, y] = spots[(cs >>> 5) % spots.length];
      const bed = r.props.some(p => p.catBed && p.x === x && p.y === y);
      if ((r.solid[y][x] && !bed) || this.occupied(x, y) || (r.mug && r.mug.x === x && r.mug.y === y)) continue;
      r.cat = { x, y }; r.solid[y][x] = true; r.events[x + "," + y] = { cat: true }; return;
    }
  }
  /* The museum cat naps somewhere different each day. */
  petCat() {
    this.petT = 70;
    this.progress.tally.pets = (this.progress.tally.pets || 0) + 1; this.saveProgress();
    this.say(this.tx("cat.pet"));
  }
  readFeatured() {
    const sh = this.pack.settings.shop, it = sh.items.find(i => i.id === sh.featured);
    if (!it) { this.say(["An empty pedestal under a glass dome."]); return; }
    this.say(["FEATURED: " + it.name, ...(it.description ? [it.description] : []), it.price + " tokens. Find it on the racks or ask at the counter."]);
  }
  cafe() {
    if (this.closing) { this.say(this.tx("cafe.closed")); return; }
    if (this.drink && this.drink.empty) {
      const n = this.drink.name.toLowerCase();
      this.choose("Finished? Want a refill on that " + n + "?", ["Refill, please", "No thanks"], i => {
        if (i === 0) { this.drink = { kind: this.drink.kind, name: this.drink.name, sips: 0 }; this.say(this.tx("drink.refill")); }
        else this.say(this.tx("drink.noRefill"));
      });
      return;
    }
    if (this.drink) { this.say(this.tx("drink.still")); return; }
    const price = this.pack.settings.shop.drinkPrice, tag = price ? " (" + price + " T)" : "";
    const lines = ["What can I get you?", "What'll it be?", "Something warm?"];
    this.cafeI = (this.cafeI || 0) + 1;
    this.choose(lines[this.cafeI % lines.length], [...DRINKS.map(d => d.name + tag), "Just chatting", "Nothing, thanks"], i => {
      if (i === DRINKS.length) { this.staffTalk("barista"); return; }
      if (i >= DRINKS.length) return;
      if (price && (this.progress.tokens || 0) < price) { this.say(["That's " + price + " token" + (price > 1 ? "s" : "") + ". Chores earn tokens."]); return; }
      if (price) { this.progress.tokens -= price; this.saveProgress(); this.updateHud(); }
      this.drink = { kind: i, name: DRINKS[i].name, sips: 0 };
      if (DRINKS[i].id === "cocoa") this.quest("cocoa");
      this.progress.tally.drinks = (this.progress.tally.drinks || 0) + 1; this.bump(this.progress.stats.drinks, DRINKS[i].id); this.saveProgress();
      this.say(this.tx("drink.served"));
    });
  }
  /* Empty cups go in the bus tub or a trash can. */
  bin(e) {
    if (this.drink && this.drink.empty) { this.drink = null; if (!e.tub && this.room.id === "lobby") this.quest("lobbyTrash"); else this.quest("otherBin"); this.say(this.tx(e.tub ? "bin.tub" : "bin.trash")); return; }
    if (this.drink) { this.say(this.tx("bin.full")); return; }
    this.say(this.tx(e.tub ? "bin.lookTub" : "bin.lookTrash"));
  }
  workbench() {
    const up = this.pack.pieces.filter(p => p.unveil && p.unveil > todayISO());
    if (!up.length) { this.say(this.tx("workbench.empty")); return; }
    this.say([...this.tx("workbench.intro"), ...up.map(p => "A crate labeled " + p.title.toUpperCase() + ". Unveiling " + niceDate(p.unveil) + ".")]);
  }
  /* Fingerprints on cases: they build up a little each day, and visitors who linger by a case leave more. */
  prints(p) {
    if (p.tut) return 0;
    // amount (0 to 1, set in the curator) is roughly the chance a case has picked up a smudge on a given day.
    const amt = this.pack.settings.staff.fingerprints, t = todayISO(), w = (this.progress.wiped || {})[p.id];
    const base = amt <= 0 ? 0 : w ? Math.min(3, Math.floor(daysBetween(w, t) * amt * 1.5)) : (strSeed(p.id + t) % 100 < amt * 100 ? 1 : 0);
    if (amt <= 0) return 0;
    return Math.min(3, base + ((this.extraPrints || {})[p.id] || 0));
  }
  /* ----- curious visitors -----
     A few curious visitors come in each day (curator, Visitors tab). Talk to one and they tell you how they like to play; they
     follow you anywhere in the building, until you stop at a piece and recommend it. The next day they come back to the lobby and
     say how it went: loved it if the game suits their mindset, liked it if it suits the second thing they mentioned (or has no
     mindsets ticked), otherwise not for them. A loved recommendation counts as a staff chore ("helped", worth 3). */
  mind(id) { return this.pack.settings.mindsets.find(m => m.id === id) || null; }
  pickLine(list, key) { return list[strSeed(key) % list.length]; }
  isRead(p) { const k = (p.tut ? this.tut && this.tut.sides : this.progress.sides || {})[p.id] || {}; return p.kind === "episode" ? !!(k.front && k.back) : !!k.note; }
  /* Today's curious visitors. Anyone not shown a game yet comes back tomorrow; new faces fill the rest. */
  curiousPlan() {
    const t = todayISO(), cv = this.progress.curious || (this.progress.curious = { day: "", list: [], back: [] });
    if (cv.day === t) return cv;
    // Random for every player and every day. Mindsets are dealt from a shuffled deck, so one day's visitors want different things.
    const minds = this.pack.settings.mindsets.filter(m => m.ask.length), per = this.pack.settings.curious.perDay, pick = a => a[Math.floor(Math.random() * a.length)];
    // Visitors you talked to but didn't get to show a game come back; the rest of the day's faces are new.
    const carry = cv.list.filter(v => v.met && v.state !== "recommended").slice(0, per).map(v => Object.assign(v, { state: "waiting", room: null }));
    const names = shuffled(VISITOR_NAMES.filter(n => ![...carry, ...cv.back].some(v => v.name === n))), list = carry.slice();
    let deck = shuffled(minds.filter(m => !carry.some(v => v.mind === m.id)));
    while (list.length < per && minds.length && names.length) {
      if (!deck.length) deck = shuffled(minds);
      const m = deck.pop(), others = minds.filter(x => x !== m);
      const m2 = others.length && Math.random() < 2 / 3 ? pick(others).id : ""; // two in three mention a second thing they like
      list.push({ id: "v" + t.replace(/-/g, "") + Math.random().toString(36).slice(2, 8), name: names.pop(), sheet: pick(["visitor_a", "visitor_b", "visitor_c"]), mind: m.id, mind2: m2, state: "waiting", room: null });
    }
    cv.day = t; cv.list = list; this.saveProgress();
    return cv;
  }
  /* Curious visitors wait in the museum room for their mindset; the ones coming back with news wait in the lobby. */
  placeCurious() {
    for (const id in this.rooms) this.rooms[id].npcs = this.rooms[id].npcs.filter(n => !n.cur && !n.back);
    if (this.closing) return;
    const cv = this.curiousPlan(), t = todayISO(), galleries = Object.keys(this.rooms).filter(id => this.rooms[id].cases.length || this.rooms[id].hung.length);
    cv.list.forEach((v, i) => {
      if (v.state === "following" && !(this.fol && this.fol.cur === v)) v.state = "waiting"; // reloaded mid-follow
      if (v.state !== "waiting") return;
      const mus = Object.keys(this.rooms).find(k => this.rooms[k].zoneAt), id = v.room && this.rooms[v.room] ? v.room : mus || galleries[i % galleries.length];
      if (!v.home || !this.rooms[v.home]) v.home = id; // where they came to see; they go back there if you leave them somewhere else
      if (id === mus && !v.zone) v.zone = this.zoneForMind(v.mind); // in the museum: the room for the way they like to play
      if (id) this.addVisitor(id, v, { cur: v, zone: id === mus ? v.zone : null });
    });
    cv.back.filter(v => v.day < t).slice(0, 6).forEach(v => this.addVisitor("lobby", v, { back: v }));
  }
  /* The museum room for a mindset: the room whose genre welcomes it (or any room with cases). */
  zoneForMind(mind) {
    const id = Object.keys(ROOMS).find(k => layoutOf(ROOMS[k])), lay = id && layoutOf(ROOMS[id]); if (!lay) return null;
    const g = (this.pack.settings.genres || []).find(g => g.minds.includes(mind)), z = g && lay.zones.find(z => z.rect && z.rect.genre === g.id);
    if (z) return z.id;
    const rooms = lay.zones.filter(z => z.rect && z.rect.genre); return rooms.length ? rooms[(Math.random() * rooms.length) | 0].id : null;
  }
  addVisitor(id, v, extra) {
    const r = this.rooms[id], s = r && (this.freeSpot(r, null, extra && extra.zone) || this.freeSpot(r)); if (!s) return null;
    const n = Object.assign({ sheet: v.sheet || "visitor_a", x: s[0], y: s[1], dir: "down", moving: false, prog: 0, step: false, bumpT: 0, pause: 0, stuck: 0,
      timer: 60 + Math.random() * 120, lines: [["..."]], lineI: -1, member: v.name }, extra);
    r.npcs.push(n); return n;
  }
  tileFree(r, x, y, self) {
    return x > 0 && y > 2 && x < r.w - 1 && y < r.h - 1 && !r.solid[y][x] && !r.npcs.some(c => c !== self && c.x === x && c.y === y) && !(r === this.room && this.player.x === x && this.player.y === y);
  }
  /* A random open floor tile, away from doorways and events. near: [x, y, distance] limits it to around that spot (doorways allowed). */
  freeSpot(r, near, zone) {
    const out = [];
    for (let y = 3; y < r.h - 1; y++) for (let x = 1; x < r.w - 1; x++) {
      if (!this.tileFree(r, x, y)) continue;
      if (zone && (this.zoneAt(r, x, y) || {}).id !== zone) continue;
      if (near ? Math.abs(x - near[0]) + Math.abs(y - near[1]) > near[2] : (r.events[x + "," + y] || (r.noWander && r.noWander.has(x + "," + y)))) continue;
      out.push([x, y]);
    }
    return out.length ? out[Math.floor(Math.random() * out.length)] : null;
  }
  curiousTalk(n) {
    const v = n.cur; v.met = true;
    const m = this.mind(v.mind), m2 = this.mind(v.mind2), low = t => (/^I\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
    const named = ps => ps.map(p => v.name + ": " + p), hello = named(this.tx("cur.hello", { name: v.name })), q = hello.pop();
    this.say(hello, () => this.choose(q, ["Do you need help?", "Can I get by you?", "Never mind"], i => {
      if (i === 1) { this.askToMove(n, named); return; }
      if (i !== 0) return;
      const pages = this.tx("cur.help", { name: v.name }).slice();
      if (m && m.ask.length) pages.push(this.pickLine(m.ask, v.id));
      if (m2 && m2.ask.length) pages.push(this.tx("cur.also")[0] + " " + low(this.pickLine(m2.ask, v.id + "+")));
      const last = named(pages).pop();
      this.say(named(pages).slice(0, -1), () => this.ask(last, ["Follow me!", "Sorry, I'm busy."], k => {
        if (k === 0) this.startFollow(n); else this.say(named(this.tx("cur.busy", { name: v.name })));
      }, 1));
    }, 2));
  }
  startFollow(n) {
    n.cur.state = "following"; n.follow = true; n.still = false; n.route = null; n.aside = null; n.lost = 0; this.fol = n; this.saveProgress();
    this.say(this.tx("cur.follow", { name: n.cur.name }));
  }
  followerTalk(n) {
    this.choose(n.member + ": " + this.tx("cur.lead", { name: n.member }).join(" "), ["Keep going", "What were you looking for?", "Never mind"], i => {
      if (i === 1) { // a reminder of what they asked for, in their words, then back to walking
        const v = n.cur, m = this.mind(v.mind), m2 = this.mind(v.mind2), low = t => (/^I\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1)), pages = [...this.tx("cur.remind", { name: v.name })];
        if (m && m.ask.length) pages.push(this.pickLine(m.ask, v.id));
        if (m2 && m2.ask.length) pages.push(this.tx("cur.also")[0] + " " + low(this.pickLine(m2.ask, v.id + "+")));
        this.say(pages.map(p => n.member + ": " + p)); return;
      }
      if (i !== 2) return;
      const v = n.cur, home = v.home && this.rooms[v.home] ? v.home : this.room.id;
      this.fol = null; n.follow = false; n.timer = 120; v.state = "waiting"; v.room = home; this.saveProgress();
      this.say(this.tx("cur.release", { name: n.member }).map((p, k) => (k ? p : n.member + ": " + p)), () => {
        if (home === this.room.id) { n.zone = v.zone || n.zone; n.goalT = null; n.route = null; return; } // they stroll back to their own room
        // Somewhere else: they head out the nearest way and go back to their own floor.
        n.leaving = true; n.leaveT = 0; n.alpha = 1; n.leaveTo = this.doorToward(home);
        n.onGone = () => { if (!Object.values(this.rooms).some(r => r.npcs.some(m => m.cur === v))) this.addVisitor(home, v, { cur: v, zone: v.zone }); };
      });
    }, 0);
  }
  /* Your follower comes with you into every room, except the staff room: there they wait by the door. */
  bringFollower() {
    const n = this.fol, r = this.room; if (!n || !r) return;
    if (r.id === "staff") { if (n.follow) { n.follow = false; n.still = true; n.waitStaff = true; this.afterTrans = () => this.say(this.tx("cur.staffOnly", { name: n.member })); } return; }
    const here = r.npcs.includes(n);
    if (n.waitStaff && here) { n.waitStaff = false; n.still = false; n.follow = true; n.lost = 0; return; } // back from the staff room: they walk over
    for (const id in this.rooms) this.rooms[id].npcs = this.rooms[id].npcs.filter(x => x !== n);
    n.waitStaff = false; n.still = false; n.follow = true; n.lost = 0; n.leaving = false;
    this.placeNear(n, r); r.npcs.push(n);
  }
  /* The floor tile in front of this room's doorway toward another room (null if there's no direct way). */
  doorToward(id) {
    const r = this.room;
    for (const k in r.events) {
      const e = r.events[k]; if (!(e.warp && e.warp[0] === id)) continue;
      const [x, y] = k.split(",").map(Number), f = Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy]).find(([a, b]) => r.solid[b] && r.solid[b][a] === false);
      if (f) return f;
    }
    return null;
  }
  placeNear(n, r) {
    const p = this.player, b = DIRS[OPP[p.dir]];
    const s = [[p.x + b[0], p.y + b[1]], ...Object.values(DIRS).map(([dx, dy]) => [p.x + dx, p.y + dy])].find(([x, y]) => this.tileFree(r, x, y, n)) || this.freeSpot(r, [p.x, p.y, 4]) || [p.x, p.y];
    n.x = s[0]; n.y = s[1]; n.moving = false; n.prog = 0; n.dir = p.dir;
  }
  /* Step onto the tile you just left; if they fell behind, find the way back to you; stuck for a while, they catch up. */
  followStep(n) {
    if (n.moving) { this.advance(n); return; }
    const p = this.player, d = Math.abs(n.x - p.x) + Math.abs(n.y - p.y), t = this.trail && this.trail.room === this.room.id ? this.trail : null;
    if (d <= 1 && !p.moving) { n.lost = 0; return; }
    let dir = null;
    if (t && Math.abs(t.x - n.x) + Math.abs(t.y - n.y) === 1) dir = t.x > n.x ? "right" : t.x < n.x ? "left" : t.y > n.y ? "down" : "up";
    else if (d > 1) {
      const goals = Object.values(DIRS).map(([dx, dy]) => [p.x + dx, p.y + dy]).filter(([x, y]) => this.tileFree(this.room, x, y, n) || (x === n.x && y === n.y))
        .sort((a, b) => Math.abs(a[0] - n.x) + Math.abs(a[1] - n.y) - (Math.abs(b[0] - n.x) + Math.abs(b[1] - n.y)));
      for (const [gx, gy] of goals) { const route = this.npcPath(n, gx, gy, true); if (route && route.length) { dir = route[0]; break; } }
    }
    if (dir && this.tryMove(n, dir)) { n.lost = 0; return; }
    if (d > 1 && ++n.lost > 90) { this.placeNear(n, this.room); n.lost = 0; }
  }
  /* With someone following you, looking at a piece on display asks whether to recommend it. Returns true when it asked. */
  offerRecommend(piece, otherwise) {
    const n = this.fol; if (!n || !n.follow || !piece) return false;
    const q = this.tx(this.isRead(piece) ? "cur.recommend" : piece.kind === "episode" ? "cur.unread" : "cur.unreadNote", { title: piece.title, name: n.member }).join(" ");
    this.ask(q, ["Recommend it", "Read the placard", "Not this one"], i => { if (i === 0) this.recommend(n, piece); else if (i === 1) otherwise(); }, 2);
    return true;
  }
  recommend(n, piece) {
    if (n.tutWant) { this.tutRecommend(n, piece); return; }
    const v = n.cur, cv = this.curiousPlan();
    this.fol = null; n.follow = false; n.cur = null;
    cv.list = cv.list.filter(x => x !== v); Object.assign(v, { state: "recommended", piece: piece.id, day: todayISO(), room: null }); cv.back.push(v);
    this.progress.tally.recs = (this.progress.tally.recs || 0) + 1; this.saveProgress();
    n.dir = OPP[this.player.dir];
    this.say(this.tx("cur.thanks", { title: piece.title, name: v.name }).map((p, k) => (k ? p : v.name + ": " + p)), () => { n.leaving = true; n.leaveT = 0; n.alpha = 1; });
  }
  /* How the game suited them: their mindset ticked on the piece = loved; their second one = liked; no mindsets ticked = liked. */
  verdict(v, p) {
    if (!p || !p.minds.length) return "liked";
    if (p.minds.includes(v.mind)) return "loved";
    return v.mind2 && p.minds.includes(v.mind2) ? "liked" : "nope";
  }
  backTalk(n) {
    const v = n.back, p = this.pieceById(v.piece), cv = this.curiousPlan(), how = this.verdict(v, p), title = p ? p.title : "that game";
    const m = how === "liked" && p && v.mind2 && p.minds.includes(v.mind2) ? this.mind(v.mind2) : this.mind(v.mind);
    const own = p && p.minds.length && m && m[how] && m[how].length ? m[how] : null; // a game with no mindsets ticked gets the general line
    const line = own ? this.fmt(this.pickLine(own, v.id + how), { title }) : this.tx("cur." + how, { title }).join(" ");
    cv.back = cv.back.filter(x => x !== v); n.back = null; n.lines = this.pack.settings.text["cur.after"] || TEXT["cur.after"].v; n.lineI = -1;
    this.saveProgress();
    const intro = [...this.tx("cur.back", { name: v.name, title, hint: p && p.hint ? ", " + p.hint : "" }), ...this.tx("cur.beat")].map((pg, k) => (k ? v.name + ": " + pg : pg));
    this.say(intro, () => {
      // The moment: the text box steps aside for a second so you see it (a happy hop and hearts, one heart, or a little sigh), then they say it.
      n.react = { how, t0: this.t }; n.dir = OPP[this.player.dir]; this.mode = "busy";
      if (how === "loved") { this.count("helped", v.id); this.updateHud(true); this.bump(this.progress.stats.loved, p ? genreOf(p, this.pack.settings.genres) : ""); }
      else if (how === "nope") this.progress.stats.nope++;
      setTimeout(() => { this.mode = "walk"; this.say([v.name + ": " + line], () => { if (how === "loved") this.showLoc(v.name + " loved it!"); }); }, how === "nope" ? 700 : 1100);
    });
  }
  pieceById(id) { return this.pack.pieces.find(p => p.id === id); }
  /* A question too long for the text box with the options open: the start reads out first, the end stays up with the options. */
  ask(q, options, done, cancelTo) {
    const pages = this.paginate([q]);
    if (pages.length <= 1) { this.choose(q, options, done, cancelTo); return; }
    this.say(pages.slice(0, -1), () => this.choose(pages[pages.length - 1], options, done, cancelTo));
  }
  /* Museum life, per the Visitors tab: some visitors carry a shop bag; in the lobby and café some have a drink, which they sip,
     finish, and drop in a bin. */
  giveLife() {
    const L = this.pack.settings.life;
    for (const id in this.rooms) for (const n of this.rooms[id].npcs) {
      if (n.staff || n.role || n.usher || n.patrol || n.patron) continue;
      n.bag = false; n.drink = null; // one thing in hand at a time: a drink or a bag
      if ((id === "lobby" || n.zone === "cafe") && Math.random() * 100 < L.drinks) n.drink = { kind: Math.floor(Math.random() * DRINKS.length), sips: 0, empty: false, t: 300 + Math.random() * 600 };
      else n.bag = Math.random() * 100 < L.bags;
    }
  }
  updateLife(n) {
    const d = n.drink;
    if (n.sipT > 0) n.sipT--;
    if (n.snapT > 0) n.snapT--;
    if (!d || this.mode !== "walk") return;
    if (!d.empty && --d.t <= 0) { n.sipT = 40; d.t = 500 + Math.random() * 700; if (++d.sips >= 4) d.empty = true; }
    else if (d.empty && (n.sitting || n.still) && --d.t <= 0) n.drink = null; // set it down somewhere
  }
  /* A visitor with an empty cup heads for the nearest bin and drops it in. Returns true while that's what they're doing. */
  binRun(n) {
    if (!n.drink || !n.drink.empty || n.sitting || n.still) return false;
    const r = this.room, bins = Object.keys(r.events).filter(k => r.events[k].trash).map(k => k.split(",").map(Number));
    if (!bins.length) { n.drink = null; return false; }
    const near = bins.find(([x, y]) => Math.abs(x - n.x) + Math.abs(y - n.y) === 1);
    if (near) { n.drink = null; n.dir = near[0] > n.x ? "right" : near[0] < n.x ? "left" : near[1] > n.y ? "down" : "up"; n.route = null; n.timer = 120; return true; }
    if (!n.route || !n.route.length) {
      for (const [bx, by] of bins) for (const [dx, dy] of Object.values(DIRS)) { const rt = this.tileFree(r, bx + dx, by + dy, n) && this.npcPath(n, bx + dx, by + dy, true); if (rt && rt.length) { n.route = rt; n.timer = 0; return true; } }
      n.drink = null; return false; // no way to a bin: they pocket it, somehow
    }
    return false;
  }
  /* Now and then, a visitor who stops in front of a piece takes a photo of it. */
  maybeSnap(n) {
    if (this.isDark(this.room, n.x, n.y) || Math.random() * 100 >= this.pack.settings.life.photos) return;
    const r = this.room, c = r.cases.find(c => c.piece && c.state === "wall" && c.x === n.x && Math.abs(c.y - n.y) === 1);
    const h = !c && r.hung.find(h => h.state === "wall" && n.y === h.y + 2 && (h.x === n.x || h.x + 1 === n.x));
    if (!c && !h) return;
    n.dir = c ? (c.y < n.y ? "up" : "down") : "up"; n.snapT = 70;
  }
  /* Patreon members on shift: two or three of them are in the staff room each day, never the one clocked in on this browser. */
  placeMembers() {
    const r = this.rooms && this.rooms.staff; if (!r) return;
    r.npcs = r.npcs.filter(n => !n.patron);
    const all = (this.pack.settings.staff.members || []).filter(m => !this.staff || (m.badge ? m.badge !== this.staff.badge : m.name.toLowerCase() !== this.staff.name.toLowerCase()));
    const seed = strSeed("members" + todayISO()), list = all.map((m, i) => ({ m, k: hash(seed, i) })).sort((a, b) => a.k - b.k).map(x => x.m);
    list.slice(0, 2 + seed % 2).forEach((m, i) => this.addVisitor("staff", { name: m.name, sheet: ["visitor_a", "visitor_b", "visitor_c"][(seed + i) % 3] }, { patron: true, staff: true }));
    this.lastStaffKey = this.staff ? this.staff.badge + "|" + this.staff.name : "";
  }
  /* The Patron Board: every member, always, and who's on shift in the staff room today. */
  readPatronBoard() {
    const names = (this.pack.settings.staff.members || []).map(m => m.name);
    if (!names.length) { this.say(this.tx("patrons.empty")); return; }
    const here = ((this.rooms.staff || {}).npcs || []).filter(n => n.patron).map(n => n.member);
    this.read({ title: "THANK YOU, PATRONS", sub: names.length + " supporter" + (names.length === 1 ? "" : "s"),
      sections: [{ label: "", text: this.tx("patrons.intro").join(" ") }, { label: "OUR PATRONS", text: names.join(" · ") },
        ...(here.length ? [{ label: "ON SHIFT TODAY", text: here.join(", ") }] : [])] });
  }
  /* ----- photos -----
     B lifts your phone and photographs whatever is right in front of you. The album holds descriptions, not pictures. */
  /* What's right in front of you, as a description plus what to draw in the album's little snapshot. */
  photoSubject() {
    const p = this.player, [dx, dy] = DIRS[p.dir], fx = p.x + dx, fy = p.y + dy, r = this.room, art = ROOMS[r.id].art || {};
    const e = r.events[fx + "," + fy] || r.events[fx + "," + (fy + 1)], dark = this.darkHere() ? " It's very dark." : "", dk = !!dark;
    const npc = r.npcs.find(n => n.x === fx && n.y === fy), fg = this.figure;
    // The figure in the dark: caught if it's straight ahead (a tile either side is fine) within seven tiles. Then it's gone.
    if (fg && !fg.leaving && fg.alpha > 0.25 && this.isDark(r, fg.x, fg.y)) {
      const ahead = (fg.x - p.x) * dx + (fg.y - p.y) * dy, side = Math.abs((fg.x - p.x) * dy) + Math.abs((fg.y - p.y) * dx);
      if (ahead >= 1 && ahead <= 7 && side <= 1) { fg.leaving = true; this.progress.tally.figure = 1; return { desc: this.tx("figure.photo").join(" "), thumb: { slot: "shadow_figure", bg: art.floor, dark: true } }; }
    }
    if (npc && npc.member) return { desc: npc.member + (npc.patron ? ", on a break in the staff room." : npc.follow ? ", following you around the museum." : npc.cur ? ", looking curious." : npc.back ? ", back to tell you how a game went." : ", enjoying the museum.") + dark, thumb: { slot: npc.sheet, bg: art.floor, dark: dk } };
    if (npc) return { desc: (npc.patrol ? "The night guard, mid-rounds. They gave a little wave." : npc.usher ? "The usher at the front desk, smiling politely." : npc.still && npc.staff ? "The conservator, busy with something delicate." : npc.sitting ? "A visitor relaxing at the café." : npc.still ? "A visitor, deep in thought about a purchase." : "A visitor admiring the museum.") + dark, thumb: { slot: npc.sheet, bg: art.floor, dark: dk } };
    if (r.cat && r.cat.x === fx && r.cat.y === fy) return { desc: this.pack.settings.staff.catName + ", napping. Adorable." + dark, thumb: { slot: "cat", bg: art.floor, dark: dk } };
    if (r.mug && r.mug.x === fx && r.mug.y === fy) return { desc: "The curator's coffee mug, abandoned again." + dark, thumb: { slot: "mug", bg: art.floor, dark: dk } };
    if (e && e.caseAt && e.caseAt.piece && e.caseAt.state === "wall") return { desc: e.caseAt.piece.title + ", in its glass case." + dark, piece: e.caseAt.piece.id, thumb: { piece: e.caseAt.piece.id, dark: dk } };
    if (e && e.spot && e.spot.piece && e.spot.state === "wall") return { desc: e.spot.piece.title + ", hanging on the wall." + dark, piece: e.spot.piece.id, thumb: { piece: e.spot.piece.id, dark: dk } };
    if (e && e.window) return { desc: "The sky through the lobby window, " + { day: "bright blue", sunset: "orange and pink", night: "full of stars" }[this.tod()] + ".", thumb: { slot: "sky_" + this.tod() } };
    if (e && (e.warp || e.frontDoor || e.shopDoor || e.staffDoor)) return { desc: e.frontDoor ? "The museum's front doors." : e.step ? "A staircase." : "A doorway." + dark, thumb: { slot: e.frontDoor ? "exit_door" : e.step ? "stair_up" : "doorway_lower", bg: e.step ? art.floor : art.lower, dark: dk } };
    const prop = r.props.find(q => { const s = SLOT[q.key]; return fx >= q.x && fx < q.x + s.w / T && (fy === q.y || (q.tall && fy === q.y - 1)); });
    if (prop) return { desc: "The " + SLOT[prop.key].label.toLowerCase().replace(/^(the|a|an) /, "") + "." + dark, thumb: { slot: prop.key, bg: art.floor, dark: dk } };
    if (r.solid[fy] && r.solid[fy][fx]) return { desc: "A wall. Nicely painted, at least." + dark, thumb: { slot: art.upper, tile: true, dark: dk } };
    return { desc: "A blurry photo of the floor. Very artsy." + dark, thumb: { slot: art.floor, tile: true, blur: true, dark: dk } };
  }
  photoSrc(ph) { return this.photoThumb(ph).toDataURL(); }
  /* Someone you photograph reacts, depending on what they're doing: a little pose and a bubble over their head for a moment,
     and the photo's description says what they did. The third photo of the same person in a row annoys them. */
  photoReact(n) {
    const p = this.player, now = this.t, dark = this.isDark(this.room, n.x, n.y);
    if (dark && !n.patrol) return null; // in the dark, only the night guard can be caught
    n.shots = n.lastShot && now - n.lastShot < 1800 ? (n.shots || 0) + 1 : 1; n.lastShot = now;
    const facesArt = !n.moving && (this.room.cases.some(c => c.piece && c.x === n.x && Math.abs(c.y - n.y) === 1) || this.room.hung.some(h => n.y === h.y + 2 && (h.x === n.x || h.x + 1 === n.x)));
    const kind = n.shots >= 3 ? "annoyed" : n.patrol ? "guard" : n.usher ? "bow" : n.still && n.staff && !n.patron ? "busy" : n.follow ? "heart"
      : n.cur && !n.back ? "shy" : n.snapT > 0 ? "snapback" : n.sitting || n.patron ? "wave" : facesArt ? "startled" : "pose";
    const who = n.member || (n.patrol ? "The night guard" : n.usher ? "The usher" : kind === "busy" ? "The conservator" : "A visitor");
    const face = OPP[p.dir], keep = n.homeDir !== undefined ? n.homeDir : n.dir;
    if (n.moving) { n.moving = false; n.prog = 0; } // mid-step (the guard on his rounds): they stop where they were, not step toward you
    if (kind === "busy") {} else if (kind === "shy") n.dir = p.dir; else n.dir = face; // the shy turn away; the busy don't look up
    if (n.still && kind !== "busy") { n.homeDir = keep; n.faceT = (kind === "startled" ? 110 : 90) + 150; } // and turn back a few seconds later
    if (kind === "snapback") n.snapT = 34; // their phone comes up and flashes at you
    n.route = null; n.pose = { kind, t0: now, dur: kind === "startled" ? 110 : 90 };
    this.progress.reactions[kind] = 1; if (who !== "A visitor") this.bump(this.progress.stats.shots, who);
    return this.tx("react." + kind, { who }).join(" ") + (dark ? " It's very dark." : "");
  }
  takePhoto() {
    const sub = this.photoSubject(), ph = this.progress.photos || (this.progress.photos = []);
    { const [dx, dy] = DIRS[this.player.dir], n = this.room.npcs.find(q => q.x === this.player.x + dx && q.y === this.player.y + dy && !q.leaving);
      const d = n && this.photoReact(n); if (d) sub.desc = d; }
    ph.unshift({ desc: sub.desc, piece: sub.piece || null, room: (this.room.zoneAt && this.zone ? this.zone.name : this.room.name).replace(/\s+/g, " "), /* the wing or hall, in the museum */ thumb: sub.thumb || null, tod: this.tod(), seed: (Math.random() * 1e9) | 0 });
    if (ph.length > 40) ph.length = 40;
    this.progress.tally.photos = (this.progress.tally.photos || 0) + 1;
    this.saveProgress(); this.phoneT = 34;
    if (!this.tut) this.showLoc("Photo saved");
    else if (!this.tut.photoTold) { this.tut.photoTold = true; setTimeout(() => { if (this.mode === "walk") this.say(this.tx("tut.photo")); }, 450); } // once per run, then no toast
    if (/napping/.test(sub.desc)) this.quest("catPhoto");
  }
  /* ----- the Start menu: photos, save, save and quit ----- */
  openMenu() {
    this.holdToast();
    if (this.tut) { // in the tutorial: skip it, or save and quit (it starts over next time)
      this.choose("PAUSED", ["Skip the tutorial", "Save and quit", "Back"], i => {
        if (i === 0) this.endTutorial(true);
        else if (i === 1) { this.cleanTutorial(); this.mode = "busy"; this.trans = { t: 0, dur: 24, switched: false, fn: () => this.showEnd("brb"), hold: true }; }
      });
      return;
    }
    const opts = ["My Stuff", "Controls", "Respawn", "Save", "Save and quit", "Back"];
    this.choose("PAUSED", opts, k => {
      const o = opts[k];
      if (o === "My Stuff") this.myStuff();
      else if (o === "Controls") this.showControls();
      else if (o === "Respawn") this.respawn();
      else if (o === "Save") { this.saveWhere(); this.say(this.tx("menu.saved")); }
      else if (o === "Save and quit") { this.saveWhere(); this.mode = "busy"; this.trans = { t: 0, dur: 24, switched: false, fn: () => this.showEnd("brb"), hold: true }; }
    });
  }
  /* My Stuff: photos, the stamp card, achievements, and (once you have the shirt) the wardrobe. Back returns to the pause menu. */
  myStuff() {
    const n = (this.progress.photos || []).length, sc = this.progress.stamps.length + "/" + this.pack.settings.shop.stampSize;
    const an = Object.keys(this.progress.ach || {}).length + "/" + this.pack.settings.achievements.length;
    const opts = ["Photos (" + n + ")", "Stamp card (" + sc + ")", "Achievements (" + an + ")", ...(this.progress.shirt ? ["Wardrobe"] : []), "Back"];
    this.choose("MY STUFF", opts, k => {
      const o = opts[k];
      if (o.startsWith("Photos")) { if (!n) this.say(this.tx("photos.none")); else this.openAlbum(); }
      else if (o.startsWith("Stamp card")) this.showStampCard();
      else if (o.startsWith("Achievements")) this.showAchievements();
      else if (o === "Wardrobe") this.choose("Wardrobe", [this.progress.wearShirt ? "Take off the GOQ shirt" : "Wear the GOQ shirt", "Back"], j => {
        if (j === 0) { this.progress.wearShirt = !this.progress.wearShirt; this.saveProgress(); this.showLoc(this.progress.wearShirt ? "Looking sharp." : "Back to the usual."); }
      });
      else this.openMenu();
    }, opts.length - 1);
  }
  /* Controls: keyboard, touch and controller, one page each. The one you're using comes first. */
  showControls() {
    const sw = this.swapAB, A = sw ? "B" : "A", B = sw ? "A" : "B";
    const pages = {
      keyboard: { label: "KEYBOARD", text: "Move: arrow keys or WASD. " + A + " (look, talk, read): Z, Space or J. " + B + " (photo, and back in menus): X. Back in menus: K or Backspace. Pause: Enter, Esc or P." + (sw ? " (A and B are swapped in Settings.)" : "") },
      touch: { label: "TOUCH", text: "Move with the on-screen pad. A looks, talks and reads. B takes a photo, and goes back in menus. START pauses. With Tap to walk on (Settings), tap where you want to go, or tap something to walk over and use it." },
      pad: { label: "CONTROLLER", text: "Move: D-pad or left stick. " + A + " (look, talk, read): the bottom button. " + B + " (photo, and back in menus): the right button. Pause: Start or Select. Writing a note shows a keyboard: the D-pad picks a key, A types it, B deletes, Start sends." + (sw ? " (A and B are swapped in Settings.)" : "") },
    };
    const first = this.lastInput === "pad" ? "pad" : this.lastInput === "touch" ? "touch" : "keyboard";
    this.read({ title: "CONTROLS", sections: [first, ...["keyboard", "touch", "pad"].filter(k => k !== first)].map(k => pages[k]) }, () => this.openMenu());
  }
  /* ----- the photo album -----
     A grid of little snapshots, newest first, with the selected photo's description underneath.
     Arrows (or tap) to choose, A to look closer or delete, B to close. */
  photoThumb(ph) {
    const ck = "thumb|" + JSON.stringify(ph.thumb || ph.piece || "x") + "|" + (ph.seed || ph.desc) + "|" + (ph.tod || "");
    if (this.cache[ck]) return this.cache[ck];
    const c = document.createElement("canvas"); c.width = 24; c.height = 18; const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    const th = ph.thumb || (ph.piece ? { piece: ph.piece } : null);
    x.fillStyle = "#d8d0c4"; x.fillRect(0, 0, 24, 18);
    const tileBg = key => { if (!SLOT[key]) return; const img = this.sheet(key); for (let yy = 0; yy < 18; yy += 16) for (let xx = 0; xx < 24; xx += 16) x.drawImage(img, 0, 0, 16, 16, xx - 4, yy - 7, 16, 16); };
    if (th && th.piece) {
      const p = this.pack.pieces.find(q => q.id === th.piece);
      if (p) { const art = this.pieceArt(p), iw = art.naturalWidth || art.width, ih = art.naturalHeight || art.height; x.imageSmoothingEnabled = iw > 48; x.drawImage(art, 0, 0, iw, ih, 0, 0, 24, 18); x.imageSmoothingEnabled = false; }
    } else if (th && th.slot && SLOT[th.slot]) {
      const s = SLOT[th.slot];
      if (th.tile) tileBg(th.slot);
      else if (/^sky_/.test(th.slot)) x.drawImage(this.sheet(th.slot), 0, 0, s.w, s.h, 0, 0, 24, 18);
      else {
        if (th.bg) tileBg(th.bg);
        const w = Math.min(s.w, 32), h = Math.min(s.h, 32), k = Math.min(1, 22 / w, 16 / h) * (s.w <= 16 && s.h <= 16 ? 1 : 1);
        x.drawImage(this.sheet(th.slot), 0, 0, w, h, Math.round(12 - (w * k) / 2), Math.round(17 - h * k), Math.round(w * k), Math.round(h * k));
      }
    } else { x.fillStyle = "#a8a098"; x.fillRect(4, 4, 16, 10); }
    if (th && th.blur) { x.globalAlpha = 0.45; x.drawImage(c, 1, 0); x.drawImage(c, -1, 1); x.globalAlpha = 1; }
    if (th && th.dark) { x.fillStyle = "rgba(10,8,24,.7)"; x.fillRect(0, 0, 24, 18); }
    // Like a real snapshot: never quite centered, the light of the hour, darker corners, a little grain.
    const sd = ph.seed || strSeed(ph.desc || ""), ox = (sd % 3) - 1, oy = ((sd >> 3) % 3) - 1;
    if (ox || oy) { const cp = document.createElement("canvas"); cp.width = 24; cp.height = 18; cp.getContext("2d").drawImage(c, 0, 0); x.drawImage(cp, ox, oy); }
    x.fillStyle = { day: "rgba(255,226,170,.10)", sunset: "rgba(255,150,90,.18)", night: "rgba(70,90,170,.20)" }[ph.tod] || "rgba(255,226,170,.10)"; x.fillRect(0, 0, 24, 18);
    const vg = x.createRadialGradient(12, 9, 6, 12, 9, 15); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,12,8,.42)"); x.fillStyle = vg; x.fillRect(0, 0, 24, 18);
    for (let i = 0; i < 14; i++) { const h = hash(sd, i); x.fillStyle = h & 1 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.14)"; x.fillRect(h % 24, (h >> 5) % 18, 1, 1); }
    return (this.cache[ck] = c);
  }
  openAlbum() { this.mode = "album"; this.albumSel = 0; this.el.album.style.display = "block"; this.renderAlbum(); }
  closeAlbum() { this.el.album.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.albumPick = null; }
  renderAlbum() {
    const box = this.el.album, ph = this.progress.photos || [];
    if (!ph.length) { this.closeAlbum(); return; }
    this.albumSel = Math.max(0, Math.min(ph.length - 1, this.albumSel));
    box.innerHTML = "";
    const head = document.createElement("div"); head.className = "gt-shop-head";
    const t1 = document.createElement("span"); t1.textContent = this.albumPick ? "PICK A PHOTO FOR YOUR LOCKER" : "PHOTOS"; const t2 = document.createElement("span"); t2.textContent = (this.albumSel + 1) + " / " + ph.length;
    head.appendChild(t1); head.appendChild(t2); box.appendChild(head);
    const grid = document.createElement("div"); grid.className = "gt-album-grid"; box.appendChild(grid);
    ph.forEach((p, i) => {
      const cell = document.createElement("button"); cell.type = "button"; cell.className = "gt-polaroid" + (i === this.albumSel ? " on" : "");
      const img = document.createElement("img"); img.src = this.photoSrc(p); img.alt = p.desc; cell.appendChild(img);
      cell.setAttribute("aria-label", "Photo " + (i + 1) + ": " + p.desc);
      cell.addEventListener("click", e => { e.stopPropagation(); if (this.albumSel === i) this.albumAct(); else { this.albumSel = i; this.renderAlbum(); } });
      grid.appendChild(cell);
    });
    const cur = ph[this.albumSel], det = document.createElement("p"); det.className = "gt-shop-detail";
    det.textContent = cur.desc + (cur.room ? "  (" + cur.room + ")" : "");
    box.appendChild(det);
    const sel = grid.children[this.albumSel]; if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }
  albumAct() {
    const ph = this.progress.photos, cur = ph[this.albumSel];
    this.el.album.style.display = "none";
    if (this.albumPick) { const pick = this.albumPick; this.albumPick = null; this.mode = "walk"; pick(this.albumSel); return; }
    this.choose("Photo " + (this.albumSel + 1) + " of " + ph.length + ".", ["Look closer", "Delete", "Back"], i => {
      const back = () => { this.mode = "album"; this.el.album.style.display = "block"; this.renderAlbum(); };
      if (i === 0) {
        this.el.cuFrame.style.borderImageSource = `url("${this.src("closeup_wood")}")`;
        this.el.cuImg.src = this.photoSrc(cur); this.el.cuImg.alt = cur.desc; this.el.cuImg.classList.remove("photo", "item");
        this.el.cuLinks.innerHTML = ""; this.el.cu.style.display = "flex";
        this.say([cur.desc], () => { this.el.cu.style.display = "none"; back(); });
      } else if (i === 1) { ph.splice(this.albumSel, 1); this.saveProgress(); if (ph.length) back(); else this.say(this.tx("photos.none")); }
      else back();
    });
  }
  /* Someone's PC: a list of every archived piece. Pick one to see its art and placards; LOG OFF to leave. */
  someonesPC() { this.quest("pc"); this.showStats(); }
  /* A room's touch screen: the pieces of its genre that don't fit in its cases, to browse (and recommend). */
  overflowScreen() {
    const p = this.player, [dx, dy] = DIRS[p.dir], z = this.zoneAt(this.room, p.x + dx, p.y + dy) || this.zone;
    const g = z && z.rect ? z.rect.genre : "", gen = (this.pack.settings.genres || []).find(x => x.id === g), list = (this.overflow && this.overflow[g]) || [];
    const title = (z ? z.name : gen ? gen.short || gen.name : "This room").toUpperCase(); // the wing's own name
    if (!list.length) { this.say(this.tx("screen.empty", { room: z ? z.name : gen ? gen.name : "this room" })); return; }
    const show = () => this.openList(title + ": MORE PIECES", [...list.map(q => (q.pick ? { text: q.title, pick: true } : q.title)), "CLOSE"], i => {
      const q = list[i]; if (!q) return;
      const read = () => { this.viewPiece(q); const done = this.rd && this.rd.done; this.rd.done = () => { if (done) done(); show(); }; };
      if (!this.offerRecommend(q, read)) read();
    });
    show();
  }
  /* The magazine stand: pick a magazine, read it in the reading panel. Magazines are in the Words tab. */
  magazines() {
    const keys = Object.keys(TEXT).filter(k => /^mag\.\d+$/.test(k)), mags = keys.map(k => (this.pack.settings.text[k] || TEXT[k].v)[0]).filter(m => m && m.length);
    this.choose(this.tx("mag.intro").join(" "), [...mags.map(m => m[0]), "Not now"], i => {
      const m = mags[i]; if (!m) return;
      this.read({ title: m[0].toUpperCase(), sub: "Magazine", sections: m.slice(1).map(p => ({ label: "", text: p })) }, () => this.magazines());
    });
  }
  /* ----- the secret GOQ shirt -----
     A very specific museum day, in order (see the third magazine). Anything on the list done out of order starts it over. */
  quest(step) {
    if (this.progress.shirt) return;
    const i = this.progress.quest || 0;
    if (SHIRT_STEPS[i] === step) this.progress.quest = i + 1;
    else this.progress.quest = SHIRT_STEPS[0] === step ? 1 : 0;
    this.saveProgress();
  }
  /* A simple list in the menu box: arrows to choose, A to pick, B to leave. */
  /* The curator's pick tag: the medal, plus the words unless it's squeezed into a list row. */
  pickTag(small) {
    const s = document.createElement("span"); s.className = "gt-pick" + (small ? " sm" : ""); s.title = "Curator's pick";
    const im = document.createElement("img"); im.src = this.src("pick_medal"); im.alt = small ? "Curator's pick" : ""; s.appendChild(im);
    if (!small) s.appendChild(document.createTextNode("CURATOR'S PICK"));
    return s;
  }
  openList(title, rows, pick) {
    this.mode = "list"; this.list = { title, rows, pick, i: 0 }; this.el.album.style.display = "block"; this.renderList();
  }
  renderList() {
    const L = this.list, box = this.el.album; box.innerHTML = "";
    const head = document.createElement("div"); head.className = "gt-shop-head"; head.textContent = L.title; box.appendChild(head);
    const wrap = document.createElement("div"); wrap.className = "gt-shop-list"; wrap.style.maxHeight = "calc(112px * var(--s))"; box.appendChild(wrap);
    L.rows.forEach((r, i) => {
      const row = document.createElement("div"); row.className = "gt-shop-row" + (i === L.i ? " on" : "");
      const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = typeof r === "object" ? r.text : r; row.appendChild(nm);
      if (r && r.pick) row.appendChild(this.pickTag(true));
      row.addEventListener("click", e => { e.stopPropagation(); if (L.i === i) this.listPick(); else { L.i = i; this.renderList(); } });
      wrap.appendChild(row);
    });
    const sel = wrap.children[L.i]; if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }
  listPick() { const L = this.list; this.el.album.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.list = null; L.pick(L.i); }
  /* The microwave runs once per opened museum. It does not go well. */
  microwave() {
    if (this.microwaved) { this.say(this.tx("microwave.after")); return; }
    this.choose(this.tx("microwave.ask").join(" "), ["Start it", "Better not"], i => {
      if (i !== 0) return;
      this.mode = "busy"; this.showLoc("*mmmmmmmmm*");
      setTimeout(() => { this.microwaved = true; this.progress.tally.microwave = (this.progress.tally.microwave || 0) + 1; this.saveProgress(); this.shakeT = 14; this.boomT = 30; this.mode = "walk"; this.say(this.tx("microwave.boom", null, true)); }, 1000);
    });
  }
  /* Respawn: back to this room's start spot (or the lobby's), with a little fourth-wall remark. Not after closing. */
  respawn() {
    if (this.closing) { this.say(this.tx("respawn.no")); return; }
    const r = ROOMS[this.room.id], [x, y, d] = r.spawn, free = !this.rooms[this.room.id].solid[y][x] && !this.occupied(x, y);
    const p = this.player; p.sitting = false; this.asleep = false; this.path = null;
    this.mode = "busy"; this.trans = { t: 0, dur: 10, switched: false, fn: () => { if (free) this.enterRoom(this.room.id, x, y, d, true); else { const s = ROOMS.lobby.spawn; this.enterRoom("lobby", s[0], s[1], s[2], true); } },
      after: () => this.say(this.tx("respawn.quip", null, true)) };
  }
  saveWhere() { const p = this.player; this.progress.where = { room: this.room.id, x: p.x, y: p.y, dir: p.dir }; this.saveProgress(); }
  /* The usher talks to visitors like visitors and to staff like coworkers. */
  usherTalk() { this.staffTalk("usher"); }
  talkTo(npc) {
    if (this.tutTalk(npc)) return;
    if (npc.usher) { this.usherTalk(); return; }
    if (npc.patron) { // now and then a member tells you about a game from the museum they enjoyed
      const eps = this.pack.pieces.filter(p => p.kind === "episode");
      if (eps.length && Math.random() < 0.4) { const p = eps[Math.floor(Math.random() * eps.length)]; this.say(this.tx("patron.enjoyed", { title: p.title }, true).map((x, k) => (k ? x : npc.member + ": " + x))); return; }
      this.staffTalk("member", null, npc.member); return;
    }
    if (npc.role) { this.staffTalk(npc.role); return; }
    if (npc.follow) { this.followerTalk(npc); return; }
    if (npc.cur) { this.curiousTalk(npc); return; }
    if (npc.back) { this.backTalk(npc); return; }
    const named = pages => (npc.member ? pages.map((p, k) => (k === 0 ? npc.member + ": " + p : p)) : pages);
    const chat = () => { npc.lineI = (npc.lineI + 1) % npc.lines.length; this.say(named(npc.lines[npc.lineI])); };
    if (npc.sitting) { chat(); return; }
    this.choose(npc.member ? npc.member + " smiles." : "They glance over.", ["Say hi", "Could I get by?"], i => { if (i === 0) chat(); else if (i === 1) this.askToMove(npc, named); }, -1);
  }
  /* Sitting: on a café stool or a bench. Any direction stands you back up. With a drink, you sip now and then. */
  sit(e) {
    if (this.room.npcs.some(n => n.x === e.x && n.y === e.y)) { this.say(["Someone's already sitting there."]); return; }
    const p = this.player;
    p.sitFrom = [p.x, p.y]; p.x = e.x; p.y = e.y; p.dir = e.sit; p.sitting = true; p.moving = false; this.sipClock = 60; this.inputLock = true;
    p.bench = !!e.bench; this.sitIdle = 0; this.asleep = false;
    if (!this.drink && e.say) this.say(e.say);
    else if (this.room.screenAt && this.episodes().length) this.screenAsk(); // the screening nook
  }
  standUp(d) {
    const p = this.player; [p.x, p.y] = p.sitFrom; p.sitting = false; p.dir = d || p.dir; this.sip = null; this.inputLock = true;
  }
  updateSipping() {
    const p = this.player;
    if (this.sip) {
      if (++this.sip.t >= 44) {
        this.sip = null;
        if (this.drink && ++this.drink.sips >= 4) { const n = this.drink.name.toLowerCase(); this.drink.empty = true; if (this.drink.name === "Cocoa" && this.player.sitting && !this.player.bench) this.quest("finishOnStool"); this.say(this.tx("drink.finished", { drink: n })); }
      }
      return;
    }
    if (p.sitting && this.drink && !this.drink.empty && this.mode === "walk" && --this.sipClock <= 0) { this.sip = { t: 0 }; this.sipClock = 170; }
  }

  /* ----- world ----- */
  buildWorld() {
    const today = todayISO(), rooms = Object.keys(ROOMS).filter(id => ROOMS[id].mugSpots), seed = strSeed("mug" + today);
    const catRooms = Object.keys(ROOMS).filter(id => ROOMS[id].catSpots), cs = strSeed("cat" + today + this.catBucket());
    const o = { genres: this.pack.settings.genres, curator: this.curator, today, hung: this.hungNow, tod: this.tod(), crowd: this.crowdToday(), catRoom: catRooms[cs % catRooms.length], catIndex: cs >>> 5,
      mugRoom: this.progress.mug === today ? null : rooms[seed % rooms.length], mugIndex: seed >>> 4, closing: this.closing };
    let n = 0, m = 0; o.spotStart = {}; o.caseStart = {};
    for (const id of Object.keys(ROOMS)) { o.spotStart[id] = n; n += (ROOMS[id].spots || []).length; o.caseStart[id] = m; m += (ROOMS[id].cases || []).length; }
    const split = archiveSplit(this.pack.pieces), cases = assignCases(this.pack.pieces, this.pack.settings.genres);
    o.caseFor = cases.byRoom; o.community = split.community; this.archived = [...cases.archived, ...split.archived.filter(p => p.kind !== "episode")];
    // A room's overflow (its genre's episodes that don't fit its cases) is on that room's touch screen.
    this.overflow = {}; cases.archived.forEach(p => { const g = genreOf(p, this.pack.settings.genres); (this.overflow[g] = this.overflow[g] || []).push(p); });
    this.rooms = {}; Object.keys(ROOMS).forEach(id => (this.rooms[id] = buildRoom(id, this.pack.pieces, o)));
    this.tutDress(); this.seatGuests();
    this.placeCurious(); this.placeMembers(); this.giveLife();
  }
  enterRoom(id, x, y, dir, quiet) {
    if (!this.rooms[id]) { id = "lobby"; [x, y, dir] = ROOMS.lobby.spawn; }
    if (typeof x === "string") { // a named doorway or stairs in the museum: ["museum", "@lobby"]
      const lay = layoutOf(ROOMS[id]), a = lay && lay.anchors[x.replace(/^@/, "")];
      if (a) { x = a.x; y = a.y; dir = a.dir; } else [x, y, dir] = ROOMS[id].spawn;
    }
    if (!this.rooms[id].solid[y] || this.rooms[id].solid[y][x] === undefined) [x, y, dir] = ROOMS[id].spawn;
    if (!this.rooms[id].zoneAt && !ROOMS[id].tutorial) this.visit(id); // the tutorial's rooms don't count as places in the museum
    this.room = this.rooms[id]; const p = this.player;
    if (id === "lobby" || id === "staff") this.refreshBoard();
    p.x = x; p.y = y; p.dir = dir; p.moving = false; p.prog = 0; p.sitting = false; this.sip = null; this.path = null; this.pathAct = null;
    this.updateHud();
    this.zone = null; if (this.room.zoneAt) { this.zoneCheck(quiet); quiet = true; }
    if (!quiet) this.showLoc(this.room.name.replace(/\s+/g, " "));
    this.bringFollower();
    if (this.fol && this.fol.tutId) this.fol.room = id;
  }
  visit(key) {
    if (!this.progress || this.saveKey === undefined || this.full) return;
    const v = this.progress.visited || (this.progress.visited = []); if (!v.includes(key)) { v.push(key); this.saveProgress(); }
  }
  /* Walking into one of the museum's rooms says its name (hallways stay quiet) and counts as visiting it. */
  zoneCheck(quiet) {
    const z = this.zoneAt(this.room, this.player.x, this.player.y); if (!z || z === this.zone) return;
    const was = this.zone; this.zone = z; this.updateHud();
    // The shirt quest: walk the upper hall (zone "upper") from the puzzle room to the strategy room (whatever they're called now).
    if (z.id === "upper") this.upperWalk = !!(was && (was.id === "puzzle" || (was.id === "upper" && this.upperWalk)));
    else { if (z.id === "strategy" && was && was.id === "upper" && this.upperWalk) this.quest("upperHall"); this.upperWalk = false; }
    if (z.kind !== "room") return;
    this.visit(this.room.id + ":" + z.id);
    if (!quiet) this.showLoc(z.name);
  }
  warp(to, x, y, dir, after) {
    if (to === "screening" && this.room && this.room.id === "museum") { const a = after, p = this.nowPlaying(); after = () => { if (p) this.showLoc(this.tx("screen.enter", { title: p.title })[0]); if (a) a(); }; }
    this.mode = "busy"; this.trans = { t: 0, dur: 14, switched: false, fn: () => this.enterRoom(to, x, y, dir), after }; }
  runEvent(e) {
    if (ROOMS[this.room.id] && ROOMS[this.room.id].tutorial && this.tutEvent(e)) return;
    if (e.tutorial) { this.choose(this.tx("tut.door").join(" "), ["Yes", "Not now"], i => { if (i === 0) this.startTutorial(true); }, 1); return; }
    if (e.staffDoor) { this.staffDoor(e); return; }
    if (e.shopDoor) { this.shopDoor(e); return; }
    if (e.warp) this.warp(...e.warp);
    else if (e.caseAt) this.useCase(e.caseAt);
    else if (e.spot) {
      const s = e.spot;
      if (s.state === "covered") this.say(this.tx("painting.covered", { date: niceDate(s.piece.unveil), title: s.piece.title }));
      else if (s.state === "crate") this.hang(s);
      else if (!(s.state === "wall" && this.offerRecommend(s.piece, () => { if (!this.tidy(s)) this.viewPiece(s.piece, undefined, true); })) && !this.tidy(s)) this.viewPiece(s.piece, undefined, true); // a painting has one side: one read stamps it
    }
    else if (e.plant) {
      if (!this.isThirsty(e.plant)) { this.say(this.tx("plant.done", { room: e.name })); return; }
      this.progress.watered[e.plant] = todayISO(); this.count("watered", this.room.id + ":" + e.plant); this.bump(this.progress.stats.plants, e.name || "plant"); this.saveProgress();
      this.quest("water");
      this.say(this.tx("plant.water", { room: e.name }));
    }
    else if (e.mug) {
      this.progress.mug = todayISO(); this.count("mugs"); this.saveProgress();
      this.room.mug = null; this.room.solid[e.y][e.x] = false; delete this.room.events[e.x + "," + e.y];
      this.say(this.tx("mug.found"));
    }
    else if (e.lights) this.toggleLights(e.key);
    else if (e.announce) this.announce();
    else if (e.frontDoor) this.frontDoor();
    else if (e.timeClock) this.timeClock();
    else if (e.locker !== undefined) this.locker(e.locker);
    else if (e.corkboard) this.readCorkboard();
    else if (e.leaderboard) this.readLeaderboard();
    else if (e.eotm) this.readEotm();
    else if (e.rules) this.readRules();
    else if (e.usher) { const u = this.room.npcs.find(n => n.usher); if (u) this.usherTalk(); else this.readGuestbook(); }
    else if (e.window) this.lookOutWindow();
    else if (e.shopCounter) this.shopCounter();
    else if (e.cafe) this.cafe();
    else if (e.trash) this.bin(e);
    else if (e.upcoming) this.workbench();
    else if (e.pc) this.someonesPC();
    else if (e.patronBoard) this.readPatronBoard();
    else if (e.fridge) this.say(this.tx("fridge", null, true));
    else if (e.microwave) this.microwave();
    else if (e.featured) this.readFeatured();
    else if (e.sit) this.sit(e);
    else if (e.rack !== undefined) this.browseRack(e.rack);
    else if (e.unit !== undefined) this.browseUnit(e.unit);
    else if (e.magazines) this.magazines();
    else if (e.collection) this.viewCollection();
    else if (e.cat) this.petCat();
    else if (e.guestbook) this.readGuestbook();
    else if (e.roofStairs) this.say(this.tx("stairs.roof"), () => { const p = this.player; p.dir = OPP[p.dir]; });
    else if (e.directory) this.readDirectory();
    else if (e.kiosk) this.overflowScreen();
    else if (e.screen) this.screenAsk();
    else if (e.nowPlaying) { const p = this.nowPlaying(); this.say(p ? this.tx("screen.sign", { title: p.title }) : this.tx("screen.none")); }
    else if (e.arcade) this.arcade();
    else if (e.poster) this.say(this.tx("hall.poster", null, true));
    else if (e.arrow) { const a = this.arrowInfo(e.arrow); this.say([a.label.toUpperCase() + " " + ({ left: "\u2190", right: "\u2192", up: "\u2191", down: "\u2193" }[e.arrow.dir] || ""), "This way to " + a.label + "."]); }
    else if (e.say) this.say(e.say);
  }
  /* An arrow sign's words and color: from its genre (Visitors, Genres), unless it has its own. */
  arrowInfo(a) {
    const g = (this.pack.settings.genres || []).find(g => g.id === a.genre);
    const lay = layoutOf(ROOMS[this.room ? this.room.id : "museum"]), z = g && lay && lay.zones.find(q => q.rect && q.rect.genre === g.id);
    return { label: a.label || (z ? z.name : g ? g.name : "This way"), color: /^#[0-9a-f]{6}$/i.test(a.color || "") ? a.color : g ? g.color : "#c8a070" };
  }
  /* A big arrow painted across the wall (both wall rows, w tiles long) with the room's name on it, in the room's color. */
  arrowArt(a) {
    const info = this.arrowInfo(a), w = Math.max(2, Math.min(8, a.w || 4)) * T, dir = a.dir === "left" ? "left" : "right", key = [w, dir, info.label, info.color].join("|");
    const cache = this.arrowCache || (this.arrowCache = new Map()); if (cache.has(key)) return cache.get(key);
    const c = document.createElement("canvas"); c.width = w; c.height = 2 * T; const x = c.getContext("2d");
    const [r0, g0, b0] = hexRgb(info.color), shade = k => "rgb(" + [r0, g0, b0].map(v => Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))).join(",") + ")";
    const head = Math.min(16, w / 3), inside = (px, py) => { const hx = w - 2 - px; if (hx < 0) return false; if (hx <= head) return Math.abs(py - 15.5) <= 13 * hx / head; return px >= 2 && py >= 9 && py <= 22; };
    for (let py = 0; py < 2 * T; py++) for (let px = 0; px < w; px++) {
      const qx = dir === "left" ? w - 1 - px : px; if (!inside(qx, py)) continue;
      const edge = !inside(qx - 1, py) || !inside(qx + 1, py) || !inside(qx, py - 1) || !inside(qx, py + 1);
      x.fillStyle = edge ? shade(0.5) : !inside(qx, py - 2) ? shade(1.35) : shade(1); x.fillRect(px, py, 1, 1);
    }
    // The name, in a little pixel font, centered on the arrow's shaft.
    const txt = info.label.toUpperCase().replace(/[^A-Z0-9 ]/g, ""), shaft = w - head - 8, sc = 1 /* every arrow's name the same size */, tw = txt.length * 4 * sc - sc;
    let tx = Math.round((dir === "left" ? head + 4 + (shaft - tw) / 2 : 4 + (shaft - tw) / 2)), ty = Math.round(15.5 - 2.5 * sc);
    x.fillStyle = "#fff8ec";
    for (const ch of txt) { const gl = PIXEL_FONT[ch] || []; gl.forEach((row, yy) => [...row].forEach((v, xx) => { if (v === "1") x.fillRect(tx + xx * sc, ty + yy * sc, sc, sc); })); tx += 4 * sc; }
    cache.set(key, c); return c;
  }
  /* The lobby directory: where everything is, worked out from the museum's layout. */
  readDirectory() {
    const id = Object.keys(ROOMS).find(k => layoutOf(ROOMS[k])), lay = id && layoutOf(ROOMS[id]);
    if (!lay) { this.say(["DIRECTORY", "Everything's through the door ahead."]); return; }
    const rooms = lay.zones.filter(z => z.kind === "room"), mid = rooms.find(z => z.id === "cafe") || rooms.find(z => !z.rect.genre) || rooms[0];
    const c = r => [r.x + r.w / 2, r.y + r.h / 2], [mx, my] = c(mid.rect), names = this.pack.settings.genres || [];
    const dirOf = r => { const [x, y] = c(r), dx = x - mx, dy = y - my, ns = Math.abs(dy) > 2 ? (dy < 0 ? "north" : "south") : "", ew = Math.abs(dx) > 2 ? (dx < 0 ? "west" : "east") : ""; return ns + ew || "next door"; };
    const pages = ["DIRECTORY", "Straight up the hall: " + mid.name + ", in the middle of the museum."];
    rooms.filter(z => z !== mid).forEach(z => { const g = names.find(g => g.id === z.rect.genre); pages.push(z.name.toUpperCase() + ": " + dirOf(z.rect) + " of the " + (mid.id === "cafe" ? "café" : mid.name) + "." + (g && g.minds.length ? " " + this.genreBlurb(g) : "")); });
    if ((ROOMS.lobby && ROOMS.lobby.stairs || []).some(st => st.to && st.to[0] === "storage")) pages.push("B1 STORAGE: down the stairs, right here in the lobby. Staff only, mostly.");
    this.say(pages);
  }
  genreBlurb(g) {
    const ms = g.minds.map(m => this.mind(m)).filter(Boolean).map(m => (m.title || m.name || "").toLowerCase()).filter(Boolean);
    return ms.length ? "Popular with: " + ms.join(", ") + "." : "";
  }
  occupied(x, y, self) {
    const f = this.fol, pl = this.player; // you and whoever is following you never block each other
    return [this.player, ...this.room.npcs].some(c => c !== self && !(f && ((self === pl && c === f) || (self === f && c === pl))) && ((c.x === x && c.y === y) || (c.moving && c.x + DIRS[c.dir][0] === x && c.y + DIRS[c.dir][1] === y)));
  }
  blocked(x, y, self) { const r = this.room; return x < 0 || y < 0 || x >= r.w || y >= r.h || r.solid[y][x] || this.occupied(x, y, self); }
  tryMove(c, d) {
    c.dir = d; const [dx, dy] = DIRS[d], nx = c.x + dx, ny = c.y + dy;
    if (this.blocked(nx, ny, c)) {
      if (c === this.player) {
        const e = this.room.events[nx + "," + ny];
        if (e && e.bump && !this.inputLock) { this.inputLock = true; c.walking = false; this.runEvent(e); return false; }
        if (c.bumpT <= 0) { c.bumpT = 16; c.step = !c.step; if (!this.full && this.progress.stats && !e) this.progress.stats.bumps++; } // walked into a wall
      }
      return false;
    }
    if (c === this.player) this.trail = { x: c.x, y: c.y, room: this.room.id }; // where a follower steps next
    c.moving = true; c.prog = 0; c.step = !c.step; return true;
  }
  advance(c) {
    if (c.bumpT > 0) c.bumpT--;
    if (!c.moving) return false;
    if (c.slow && (this.t & 1)) return false; // the night guard strolls at half speed
    if (c !== this.player && !c.slow && !c.follow && !c.leaving) { c.spd = (c.spd || 0) + this.pack.settings.staff.patronSpeed; if (c.spd < 1) return false; c.spd -= 1; } // patrons: slower than you
    if ((c.prog += c === this.player && this.segway ? 2 : 1) >= T) {
      c.x += DIRS[c.dir][0]; c.y += DIRS[c.dir][1]; c.prog = 0; c.moving = false;
      if (c === this.player) {
        if (!this.full && this.progress.stats) this.progress.stats.steps++;
        this.stepInDark(); this.zoneCheck();
        const e = this.room.events[c.x + "," + c.y];
        if (e && e.step && !this.trans) { this.path = null; this.pathAct = null; c.walking = false; if (e.warp[0] === "storage") this.quest("stairsB1"); this.runEvent(e); }
      }
      return true;
    }
    return false;
  }
  update() {
    this.t++;
    const q = this.queue.map(k => (k === "bk" ? (this.mode === "walk" ? null : "b") : k)).filter(Boolean); this.queue = []; // K / Backspace: back, but no photo
    // Up, up, down, down, left, right, left, right, B, A, Start: a Segway. Enter it again to park it. That Start doesn't open the menu.
    if (this.mode === "walk") for (const k of q) if (KONAMI.includes(k)) {
      (this.kbuf = this.kbuf || []).push(k); if (this.kbuf.length > KONAMI.length) this.kbuf.shift();
      if (this.kbuf.join() === KONAMI.join()) { this.kbuf = []; this.segway = !this.segway; if (this.segway) { this.progress.tally.segway = (this.progress.tally.segway || 0) + 1; this.saveProgress(); } this.konamiNow = true; this.showLoc(this.segway ? "SEGWAY UNLOCKED. Zoom zoom." : "Segway parked."); }
    }
    const has = k => q.includes(k);
    if (this.trans) {
      const tr = this.trans; tr.t++;
      if (tr.t <= tr.dur) this.fade = tr.t / tr.dur;
      else { if (!tr.switched) { tr.switched = true; tr.fn(); } this.fade = Math.max(0, 1 - (tr.t - tr.dur) / tr.dur); }
      if (tr.hold && tr.switched) { this.fade = 1; this.trans = null; }
      else if (tr.t >= tr.dur * 2) { this.trans = null; this.fade = 0; this.mode = "walk"; if (tr.after) tr.after(); if (this.afterTrans) { const fn = this.afterTrans; this.afterTrans = null; fn(); } }
    }
    this.updateHang(); this.updateChore(); this.updateSpooks(); this.updateSipping();
    if (this.petT > 0) this.petT--;
    if (this.t % 20 === 0) this.flushToasts();
    if (this.flickerT > 0) this.flickerT--;
    if (this.boomT > 0) this.boomT--;
    if (this.shakeT > 0) this.shakeT--;
    if (this.flash > 0) this.flash--;
    if (this.t % 60 === 0) this.tickStats();
    if (this.phoneT > 0) { this.phoneT--; if (this.phoneT === 16) this.flash = 6; } // the camera flash, timed in the update so a slow frame can't skip it
    if (this.t % 600 === 0 && this.mode === "walk") {
      const t = this.tod(); if (this.lastTod && t !== this.lastTod) this.rebuild(); this.lastTod = t;
      const b = this.catBucket(); if (this.lastCat !== undefined && b !== this.lastCat) this.moveCat(); this.lastCat = b;
    }
    if (this.mode === "read") {
      const r = this.rd;
      if (has("left") && r.i > 0) { r.i--; this.renderRead(); }
      else if ((has("up") || has("down")) && this.rdButtons().length) this.rdPick(has("up") ? -1 : 1);
      else if (has("a") && r.sel >= 0) this.rdUse();
      else if (has("a") || has("right")) { if (r.i < r.pages.length - 1) { r.i++; this.renderRead(); } else this.closeRead(); }
      else if (has("b") || has("start")) this.closeRead();
      return;
    }
    if (this.mode === "list") {
      const L = this.list, n = L.rows.length;
      if (has("up") || has("down")) { L.i = (L.i + (has("up") ? n - 1 : 1)) % n; this.renderList(); }
      if (has("a")) this.listPick(); else if (has("b") || has("start")) { this.el.album.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.list = null; }
      return;
    }
    if (this.mode === "album") {
      const n = (this.progress.photos || []).length, cols = 5;
      let i = this.albumSel;
      if (has("left")) i--; if (has("right")) i++; if (has("up")) i -= cols; if (has("down")) i += cols;
      if (i !== this.albumSel) { this.albumSel = Math.max(0, Math.min(n - 1, i)); this.renderAlbum(); }
      if (has("a")) this.albumAct(); else if (has("b") || has("start")) this.closeAlbum();
      return;
    }
    if (this.mode === "shop") {
      const n = this.shopRows().length;
      if (has("up") || has("down")) { this.shopSel = (this.shopSel + (has("up") ? n - 1 : 1)) % n; this.shopConfirm = null; this.shopMsg = ""; this.renderShop(); }
      if (has("a")) this.shopSelect(); else if (has("b")) this.closeShop();
      return;
    }
    if (this.mode === "form" && this.kp) {
      for (const d of ["up", "down", "left", "right"]) if (has(d)) this.kpMove(d);
      if (has("a")) this.kpPress(this.kpKeys[this.kpSel]);
      else if (has("b")) { if (this.el.badgeForm[this.kpOn].value) this.kpPress("DEL"); else if (this.kpOn === "key") this.kpField("badge"); else this.closeBadge(); }
      return;
    }
    if (this.mode === "tv") { if (has("b") || has("start")) this.closeTv(); return; }
    if (this.mode === "form" && this.nkb) { // the note card's keyboard, with a controller
      for (const d of ["up", "down", "left", "right"]) if (has(d)) this.nkbMove(d);
      if (has("a")) this.nkbPress(); else if (has("b")) this.nkbDel(); else if (has("start")) this.submitNote();
      return;
    }
    if (this.mode === "form") return; // typing in a form (the note card, the badge form on a keyboard)
    if (this.mode === "choice") {
      const c = this.ch;
      if (has("up")) c.i = (c.i + c.options.length - 1) % c.options.length;
      if (has("down")) c.i = (c.i + 1) % c.options.length;
      if (has("up") || has("down")) this.renderChoice();
      if (has("a")) this.endChoice(); else if (has("b") || has("start")) this.endChoice(true);
      return;
    }
    if (this.mode === "text") {
      const tx = this.txt, page = tx.pages[tx.i];
      if (tx.n < page.length) tx.n = Math.min(page.length, tx.n + 1.5);
      if (has("b") && this.el.cu.style.display === "flex") { this.closeText(); return; }
      if (has("a") || has("b")) {
        if (tx.n < page.length) tx.n = page.length;
        else if (tx.i < tx.pages.length - 1) { tx.i++; tx.n = 0; }
        else { this.closeText(); return; }
      }
      this.renderText();
    } else if (this.mode === "walk") {
      if (this.tut && this.tut.cut) { // the tutorial's opening: you walk up to the desk on your own
        const p = this.player;
        if (p.moving) { if (this.advance(p) && this.path) this.followPath(); }
        else if (this.path) this.followPath();
        else { const f = this.tut.cut; this.tut.cut = null; p.walking = false; p.dir = "up"; f(); }
        return;
      }
      if (this.konamiNow) { this.konamiNow = false; return; } // the code's last Start: no menu
      if (has("start") && !this.player.moving) { this.openMenu(); return; }
      const codeB = this.kbuf && this.kbuf.slice(-9).join() === KONAMI.slice(0, 9).join(); // the B in the code isn't a photo
      if (has("a") && this.kbuf && this.kbuf.slice(-10).join() === KONAMI.slice(0, 10).join()) return; // nor is its A a look
      if (has("b") && !codeB && !this.player.moving && !this.asleep) { this.takePhoto(); return; }
      this.updatePlayer(has("a"));
    }
    else if (this.mode === "ended" && (has("a") || has("start"))) this.reopen();
    if (this.mode === "walk" || this.mode === "busy") this.updateNpcs();
  }
  updatePlayer(pressA) {
    const p = this.player;
    if (p.sitting) {
      const d = this.heldDir();
      if (this.asleep) {
        if (d || pressA) { this.asleep = false; this.sitIdle = 0; this.inputLock = true; this.say(this.tx("bench.wake")); }
        return;
      }
      const awake = this.drink && !this.drink.empty; // a full drink keeps you awake
      if (p.bench && !d && !pressA && !awake && !this.sip) {
        this.sitIdle++;
        if (this.sitIdle === 420) this.showLoc("You're getting comfortable...");
        if (this.sitIdle > 720) { this.asleep = true; this.progress.tally.naps = (this.progress.tally.naps || 0) + 1; this.saveProgress(); this.showLoc("Zzz..."); if (this.zone && this.zone.id === "upper") this.quest("napUpper"); return; }
      }
      if (d || pressA) this.sitIdle = 0;
      if (!d) this.inputLock = false;
      if (d && !this.inputLock) { this.standUp(d); return; }
      if (pressA && this.drink && !this.drink.empty && !this.sip) { this.sip = { t: 0 }; this.sipClock = 170; }
      return;
    }
    if (p.moving) {
      if (pressA) this.bufA = true;
      if (this.path && this.heldDir()) { this.path = null; this.pathAct = null; }
      if (this.path) { if (this.advance(p) && this.path) this.followPath(); return; }
      if (this.advance(p)) { const d = this.heldDir(); if (d && !this.inputLock) this.tryMove(p, d); else p.walking = false; }
      return;
    }
    if (p.bumpT > 0) p.bumpT--;
    const d = this.heldDir();
    if (d || pressA) { this.path = null; this.pathAct = null; }
    if (this.path) { this.followPath(); return; }
    if (!d) { this.inputLock = false; p.turnT = 0; p.walking = false; }
    if (this.bufA) { this.bufA = false; if (!d) pressA = true; }
    if (pressA) { this.interact(); return; }
    if (!d || this.inputLock) return;
    if (d !== p.dir && !p.walking && p.turnT === 0) { p.dir = d; p.turnT = 6; return; }
    if (p.turnT > 1) { p.turnT--; return; }
    p.turnT = 0; p.walking = true; this.tryMove(p, d);
  }
  interact() {
    const p = this.player, [dx, dy] = DIRS[p.dir], fx = p.x + dx, fy = p.y + dy;
    let npc = this.room.npcs.find(n => n.x === fx && n.y === fy && !n.moving);
    if (!npc) { // someone mid-step: stepping onto the tile you face finishes the step; stepping off it, they stay put
      const into = this.room.npcs.find(n => n.moving && !n.leaving && n.x + DIRS[n.dir][0] === fx && n.y + DIRS[n.dir][1] === fy && !(fx === p.x && fy === p.y));
      const out = this.room.npcs.find(n => n.moving && !n.leaving && n.x === fx && n.y === fy);
      if (into) { into.x = fx; into.y = fy; into.moving = false; into.prog = 0; into.route = null; npc = into; }
      else if (out) { out.moving = false; out.prog = 0; out.route = null; npc = out; }
    }
    if (npc) { npc.timer = 180; if (!this.deskStaff(npc) && !npc.sitting) this.faceYou(npc, 240); if (npc.patrol) npc.pause = 120; this.talkTo(npc); return; }
    const e = this.room.events[fx + "," + fy]; if (e) this.runEvent(e);
  }
  /* Staff behind a desk or counter keep facing their customers. */
  deskStaff(n) { return !!(n.usher || n.role === "shopkeeper" || n.role === "barista"); }
  /* Turn to face you. Someone who stands still turns back the way they were facing after t frames (while you're walking). */
  faceYou(n, t) {
    if (n.still) { if (n.homeDir === undefined) n.homeDir = n.dir; n.faceT = t; }
    n.dir = OPP[this.player.dir];
  }
  updateNpcs() {
    const def = ROOMS[this.room.id];
    for (const n of this.room.npcs.slice()) {
      if (n.leaving) { this.walkOut(n, n.leaveTo || def.exitTo || ROOMS[this.room.id].spawn); continue; }
      this.updateLife(n);
      if (n.follow) { this.followStep(n); continue; } // a curious visitor following you around
      if (n.moving) { this.advance(n); continue; }
      if (n.aside) { this.stepAside(n); continue; }
      if (n.still) { if (n.faceT > 0 && this.mode === "walk" && --n.faceT <= 0 && n.homeDir !== undefined) { n.dir = n.homeDir; n.homeDir = undefined; } continue; }
      if (n.patrol) { this.patrol(n); continue; }
      if (n.bumpT > 0) n.bumpT--;
      if (this.mode !== "walk") continue;
      this.stroll(n);
    }
  }

  /* "Could I get by?": step to the nearest open tile that isn't straight ahead of you. Boxed in? They teleport. */
  askToMove(n, named) {
    const p = this.player, r = this.room, W = r.w, [fx, fy] = DIRS[p.dir], ahead = new Set();
    for (let k = 0; k <= 3; k++) ahead.add((p.x + fx * k) + "," + (p.y + fy * k));
    const prev = new Map([[n.y * W + n.x, -1]]), q = [[n.x, n.y, 0]]; let goal = null;
    const noGo = (x, y) => r.noWander && r.noWander.has(x + "," + y);
    while (q.length) {
      const [x, y, d] = q.shift();
      if (d > 0 && !ahead.has(x + "," + y) && !noGo(x, y)) { goal = y * W + x; break; }
      if (d >= 6) continue;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy, k = ny * W + nx;
        if (nx < 1 || ny < 3 || nx >= W - 1 || ny >= r.h - 1 || prev.has(k) || this.blocked(nx, ny, n)) continue;
        prev.set(k, y * W + x); q.push([nx, ny, d + 1]);
      }
    }
    if (goal !== null) {
      const out = []; let c = goal;
      while (prev.get(c) !== -1) { const pc = prev.get(c), dx = (c % W) - (pc % W), dy = ((c / W) | 0) - ((pc / W) | 0); out.unshift(dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up"); c = pc; }
      this.say(named(this.tx("move.ok", null, true)), () => { n.route = null; n.goal = null; n.aside = out; n.stepWait = 0; });
      return;
    }
    // Nowhere to step: somewhere open in this room, away from you.
    const spots = [];
    for (let y = 3; y < r.h - 1; y++) for (let x = 1; x < W - 1; x++) if (!this.blocked(x, y, n) && !noGo(x, y) && Math.abs(x - p.x) + Math.abs(y - p.y) >= 4) spots.push([x, y]);
    const to = spots[(Math.random() * spots.length) | 0];
    if (!to) { this.say(named(this.tx("move.stuck", null, true))); return; }
    this.say(named(this.tx("move.stuck", null, true)), () => {
      n.x = to[0]; n.y = to[1]; n.moving = false; n.prog = 0; n.route = null; n.aside = null; n.goal = null; n.timer = 240;
      this.flickerT = 16; this.say(this.tx("move.teleport", null, true));
    });
  }
  stepAside(n) {
    if (n.stepWait > 0) { n.stepWait--; return; }
    const d = n.aside.shift();
    if (!d || !this.tryMove(n, d)) { n.aside = null; return; }
    n.stepWait = 3;
    if (!n.aside.length) { n.aside = null; n.timer = 300; n.dir = OPP[this.player.dir] === d ? d : n.dir; }
  }
  /* Visitors stroll: pick somewhere open in the room, walk there, look around for a while, then pick somewhere else.
     They never step onto doorways, stairs, or the tiles where people arrive. */
  stroll(n) {
    if (n.stepWait > 0) { n.stepWait--; return; }
    { const p = this.player, [fx, fy] = DIRS[p.dir]; if (!p.moving && p.x + fx === n.x && p.y + fy === n.y) { n.route = null; return; } } // you're facing them: they wait
    if (n.arrived) { // just stepped onto the spot they were heading for
      n.arrived = false;
      // Wandered into the café: now and then they come away with a drink (never with a bag in the other hand).
      if (this.room.zoneAt && n.zone === "cafe" && !n.drink && !n.bag && !n.cur && Math.random() * 100 < this.pack.settings.life.drinks) n.drink = { kind: Math.floor(Math.random() * DRINKS.length), sips: 0, empty: false, t: 300 + Math.random() * 600 };
      else if (!this.binRun(n)) this.maybeSnap(n);
    }
    if (n.pose && this.t - n.pose.t0 < n.pose.dur) return; // reacting to your photo
    if (n.snapT > 0) return; // taking a photo: hold still
    if (n.timer > 0) { n.timer--; if (n.timer % 90 === 0 && Math.random() < 0.5) n.dir = DIRS_LIST[(Math.random() * 4) | 0]; return; }
    if (this.binRun(n) && n.timer > 0) return;
    const r = this.room, noGo = (x, y) => r.noWander && r.noWander.has(x + "," + y);
    if (!n.route || !n.route.length) {
      // The museum: visitors stroll around their own room, and now and then wander off down a hallway to another one.
      if (r.zoneAt && n.zone && !n.goalT && !n.cur && Math.random() < 0.15) {
        const others = r.zones.filter(z => z.kind === "room" && z.id !== n.zone);
        if (others.length) n.zone = others[(Math.random() * others.length) | 0].id;
      }
      const inZone = (x, y) => !r.zoneAt || !n.zone || (this.zoneAt(r, x, y) || {}).id === n.zone;
      const opts = [];
      for (let y = 3; y < r.h - 1; y++) for (let x = 1; x < r.w - 1; x++) if (!r.solid[y][x] && !noGo(x, y) && Math.abs(x - n.x) + Math.abs(y - n.y) > 2 && inZone(x, y)) opts.push([x, y]);
      // Often, somewhere in front of a piece: the front or back of a case, or under a painting.
      const views = opts.filter(([x, y]) => r.cases.some(c => c.piece && c.x === x && Math.abs(c.y - y) === 1) || r.hung.some(h => y === h.y + 2 && (h.x === x || h.x + 1 === x)));
      if (views.length && Math.random() < 0.5) opts.splice(0, opts.length, ...views);
      const t = n.goalT || opts[(Math.random() * opts.length) | 0]; // someone was in the way: try the same spot again
      n.goalT = t;
      n.route = t ? this.npcPath(n, t[0], t[1]) : null;
      if (!n.route || !n.route.length) { n.timer = 60 + Math.random() * 120; n.route = null; n.goalT = null; n.retry = 0; return; }
    }
    const d = n.route[0], [dx, dy] = DIRS[d];
    if (noGo(n.x + dx, n.y + dy) || !this.tryMove(n, d)) { // blocked: wait a moment and find a way around, up to three times
      n.route = null; n.dir = d; n.retry = (n.retry || 0) + 1;
      if (n.retry > 3) { n.goalT = null; n.retry = 0; n.timer = 30 + Math.random() * 60; } else n.timer = 20 + Math.random() * 20;
      return;
    }
    n.route.shift();
    if (n.route.length) { n.stepWait = Math.round(8 * (1 - this.pack.settings.staff.patronSpeed) / this.pack.settings.staff.patronSpeed); return; }
    // A long walk (another room) comes in stretches: keep going toward the same spot.
    if (n.goalT && (n.x + dx !== n.goalT[0] || n.y + dy !== n.goalT[1])) { n.timer = 6; return; }
    n.timer = 180 + Math.random() * 300; n.goalT = null; n.retry = 0; n.arrived = true; // arrived (once this last step lands): stay a while
    // Stopping right next to a case now and then leaves a fingerprint (not every time).
    const ax = n.x + dx, ay = n.y + dy, amt = this.pack.settings.staff.fingerprints;
    const near = this.room.cases.find(c => c.piece && c.state === "wall" && Math.abs(c.x - ax) + Math.abs(c.y - ay) === 1);
    if (near && amt > 0 && Math.random() < amt * 0.5) { const xp = this.extraPrints || (this.extraPrints = {}); xp[near.piece.id] = Math.min(3, (xp[near.piece.id] || 0) + 1); }
  }
  /* Shortest route for a visitor, around walls, furniture, people and no-go tiles (at most 40 steps). */
  npcPath(n, tx, ty, loose) { // loose: may cross the tiles visitors usually keep off (doorways), to leave or catch up
    const r = this.room, W = r.w, prev = new Map(), start = n.y * W + n.x, goal = ty * W + tx, q = [start];
    prev.set(start, -1);
    for (let qi = 0; qi < q.length; qi++) {
      const c = q[qi]; if (c === goal) break;
      const cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = cx + dx, ny = cy + dy, k = ny * W + nx;
        if (nx < 1 || ny < 3 || nx >= W - 1 || ny >= r.h - 1 || prev.has(k) || this.blocked(nx, ny, n) || (!loose && r.noWander && r.noWander.has(nx + "," + ny))) continue;
        prev.set(k, c); q.push(k);
      }
    }
    if (!prev.has(goal)) return null;
    const out = []; let c = goal;
    while (prev.get(c) !== -1) { const pc = prev.get(c), dx = (c % W) - (pc % W), dy = ((c / W) | 0) - ((pc / W) | 0); out.unshift(dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up"); c = pc; }
    return out.slice(0, 40);
  }
  /* The night guard walks the length of the room and back, pausing at each end. */
  patrol(n) {
    if (n.pause > 0) { n.pause--; return; }
    if (this.mode === "text" || this.mode === "choice") return;
    const target = n.goRight ? n.patrol[1] : n.patrol[0];
    if (n.x === target) { n.goRight = !n.goRight; n.pause = 100; n.dir = "up"; return; }
    const d = target > n.x ? "right" : "left";
    if (this.tryMove(n, d)) { n.stuck = 0; n.pause = 10; return; }
    n.pause = 24; if (++n.stuck > 2) { n.stuck = 0; n.goRight = !n.goRight; } // something's in the way: turn around
  }
  /* ----- drawing ----- */
  /* A leaving visitor heads for the room's exit, then fades away. */
  walkOut(n, to) {
    n.leaveT++;
    if (n.fading) { n.alpha -= 1 / 24; if (n.alpha <= 0) { this.room.npcs = this.room.npcs.filter(m => m !== n); if (n.onGone) n.onGone(); } return; }
    if (n.moving) { this.advance(n); return; }
    if (n.leaveT < 0 || n.leaveT % 2) return;
    const dx = Math.sign(to[0] - n.x), dy = Math.sign(to[1] - n.y);
    // The museum is big: there they get time to walk all the way out (to the lobby doors), and always find the way around.
    const far = !!this.room.zoneAt;
    if ((!dx && !dy) || n.leaveT > (far ? 3000 : 360)) { n.fading = true; n.dir = "down"; return; }
    if (n.leaveTo || far) { const rt = this.npcPath(n, to[0], to[1], true); if (rt && rt.length) { if (this.tryMove(n, rt[0])) return; n.leaveT += 6; return; } } // around people; someone in the way: wait a moment
    const tries = Math.abs(to[0] - n.x) >= Math.abs(to[1] - n.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
    tries.push([0, dy || 1], [0, -(dy || 1)], [dx || 1, 0]);
    for (const [ax, ay] of tries) {
      if (!ax && !ay) continue;
      const d = ax > 0 ? "right" : ax < 0 ? "left" : ay > 0 ? "down" : "up";
      if (!this.blocked(n.x + ax, n.y + ay, n)) { this.tryMove(n, d); return; }
    }
    if (n.leaveT > 120) n.fading = true;
  }
  /* Lighting. Lights on: the room's own dimness, with spotlights on the pieces.
     Lights off: nearly dark, the pieces glow, and a little light follows you. */
  drawLighting(r, cx, cy, pp) {
    const ctx = this.ctx, off = this.isDark(r, this.player.x, this.player.y), L = this.pack.settings.lighting[r.id] || ROOMS[r.id].light;
    const tod = this.tod(), nd = NIGHT_DIM[r.id] !== undefined ? NIGHT_DIM[r.id] : 0.12, extra = tod === "night" ? nd : tod === "sunset" ? nd / 3 : 0;
    const guards = r.npcs.filter(n => n.patrol);
    const lit = Math.min(0.85, L.dim + extra), dim = off ? 0.86 : lit, spots = off ? 0.9 : L.spots, zoned = r.zoneAt && this.lightsOff.size;
    if (dim <= 0.01 && !zoned) return;
    if (!this.darkC) { this.darkC = document.createElement("canvas"); this.darkC.width = SW; this.darkC.height = SH; }
    const d = this.darkC.getContext("2d");
    d.globalCompositeOperation = "source-over"; d.clearRect(0, 0, SW, SH);
    if (zoned) { // the museum: a dark room looks dark from the hallway too
      const tx0 = Math.floor(cx / T), ty0 = Math.floor(cy / T);
      for (let y = ty0; y <= ty0 + VH; y++) for (let x = tx0; x <= tx0 + VW; x++) {
        d.fillStyle = "rgba(10,8,24," + (this.isDark(r, x, y) ? 0.86 : lit) + ")"; d.fillRect(x * T - cx, y * T - cy, T, T);
      }
    } else { d.fillStyle = "rgba(10,8,24," + dim + ")"; d.fillRect(0, 0, SW, SH); }
    d.globalCompositeOperation = "destination-out";
    const hole = (x, y, rx, ry, a) => {
      d.save(); d.translate(x, y); d.scale(1, ry / rx);
      const g = d.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, "rgba(0,0,0," + a + ")"); g.addColorStop(0.55, "rgba(0,0,0," + a * 0.7 + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
      d.fillStyle = g; d.fillRect(-rx, -rx, rx * 2, rx * 2); d.restore();
    };
    if (off) hole(pp.x + 8 - cx, pp.y + 4 - cy, 26, 26, 0.75);
    if (spots > 0) for (const c of r.cases) hole(c.x * T + 8 - cx, c.y * T - 4 - cy, 14, 20, spots);
    if (spots > 0) for (const h of r.hung) {
      const x = h.x * T + 16 - cx, y = h.y * T + 14 - cy;
      hole(x, y, 22, 24, spots);           // the piece itself
      hole(x, y + 26, 16, 9, spots * 0.6); // the pool of light on the floor below
    }
    if (r.switchAt) hole(r.switchAt.x * T + 8 - cx, r.switchAt.y * T + 8 - cy, 9, 9, 0.7);
    for (const sw of r.switches || []) hole(sw.x * T + 8 - cx, sw.y * T + 8 - cy, 9, 9, 0.7);
    if (r.intercomAt) hole(r.intercomAt.x * T + 8 - cx, r.intercomAt.y * T + 8 - cy, 9, 9, 0.6);
    if (!off) for (const [gx, gy] of r.glows) hole(gx * T + 8 - cx, gy * T - cy, 30, 26, 0.85); // lamps go dark with the lights
    if (!off) for (const [lx, ly] of r.lamps) hole(lx * T + 8 - cx, ly * T + 10 - cy, 16, 18, 0.7);
    if (r.featuredAt && spots > 0) hole(r.featuredAt.x * T + 8 - cx, r.featuredAt.y * T - cy, 14, 22, spots);
    if (r.windowAt && tod !== "night") hole(r.windowAt.x * T + 16 - cx, r.windowAt.y * T + 14 - cy, 22, 20, 0.6);
    if (r.windowAt && tod === "night") hole(r.windowAt.x * T + 16 - cx, r.windowAt.y * T + 14 - cy, 16, 15, 0.35);
    for (const g of guards) { // flashlight beam in the direction they're facing
      const gp = this.pos(g), [dx, dy] = DIRS[g.dir];
      hole(gp.x + 8 + dx * 22 - cx, gp.y + 6 + dy * 18 - cy, 18, 13, off ? 0.85 : 0.5);
      hole(gp.x + 8 - cx, gp.y + 4 - cy, 10, 10, 0.4);
    }
    // With the lights off, doorways glow like the pieces so you can find your way out.
    const doors = off ? this.doorTiles(r) : [];
    for (const [x, y] of doors) { hole(x * T + 8 - cx, y * T + 8 - cy, 14, 14, 0.85); }
    ctx.drawImage(this.darkC, 0, 0);
    if (doors.length) {
      ctx.globalCompositeOperation = "lighter";
      for (const [x0, y0] of doors) {
        const x = x0 * T + 8 - cx, y = y0 * T + 8 - cy, g = ctx.createRadialGradient(x, y, 1, x, y, 16);
        g.addColorStop(0, "rgba(255,210,140,0.14)"); g.addColorStop(1, "rgba(255,210,140,0)"); ctx.fillStyle = g; ctx.fillRect(x - 16, y - 16, 32, 32);
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (r.lamps.length && !off) { // accent lights: a small warm pool on the wall and floor
      ctx.globalCompositeOperation = "lighter";
      for (const [lx, ly] of r.lamps) {
        const x = lx * T + 8 - cx, y = ly * T + 6 - cy; if (x < -30 || y < -30 || x > SW + 30 || y > SH + 30) continue;
        const g = ctx.createRadialGradient(x, y, 1, x, y + 8, 24); g.addColorStop(0, "rgba(255,200,120,0.28)"); g.addColorStop(1, "rgba(255,200,120,0)"); ctx.fillStyle = g; ctx.fillRect(x - 24, y - 20, 48, 52);
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (r.glows.length && !off) {
      ctx.globalCompositeOperation = "lighter";
      for (const [gx, gy] of r.glows) {
        const x = gx * T + 8 - cx, y = gy * T - cy, g = ctx.createRadialGradient(x, y, 2, x, y, 34);
        g.addColorStop(0, "rgba(255,190,110,0.22)"); g.addColorStop(1, "rgba(255,190,110,0)"); ctx.fillStyle = g; ctx.fillRect(x - 34, y - 34, 68, 68);
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (spots > 0) {
      ctx.globalCompositeOperation = "lighter";
      for (const h of r.hung) {
        const x = h.x * T + 16 - cx, y = h.y * T + 13 - cy, g = ctx.createRadialGradient(x, y, 2, x, y, 22);
        g.addColorStop(0, "rgba(255,210,140," + 0.16 * spots + ")"); g.addColorStop(1, "rgba(255,210,140,0)"); ctx.fillStyle = g; ctx.fillRect(x - 22, y - 22, 44, 44);
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }
  drawCase(c, cx, cy) {
    const ctx = this.ctx, x = c.x * T - cx, y = c.y * T - T - cy;
    if (c.piece && (c.state === "wall" || c.state === "lifting")) {
      const art = this.pieceArt(c.piece), iw = art.naturalWidth || art.width, ih = art.naturalHeight || art.height;
      const lift = c.state === "lifting" && this.hanging ? Math.round(10 * (1 - Math.min(1, this.hanging.t / 26))) : 0;
      ctx.imageSmoothingEnabled = iw > 48; ctx.drawImage(art, 0, 0, iw, ih, x + 2, y + 3 + lift, 12, 10); ctx.imageSmoothingEnabled = false;
    }
    this.drawSlot("display_case", 0, 0, x, y);
    if (c.piece && c.state === "wall") {
      const lv = this.chore && this.chore.spot === c ? 0 : this.prints(c.piece);
      if (lv > 0) this.drawSlot("fingerprints", lv - 1, 0, x, y);
      if (c.piece.pick) this.drawSlot("pick_medal", 0, 0, x + 9, y + 9); // curator's pick: pinned to the front corner of the glass
      if (this.chore && this.chore.spot === c && this.chore.t > 4) { const f = Math.floor((this.chore.t - 4) / 4); if (f < 4) { this.drawSlot("sparkle", f, 0, x - 4, y - 2); this.drawSlot("sparkle", (f + 2) % 4, 0, x + 6, y + 6); } }
    }
    if (c.state === "covered") ctx.drawImage(this.sheet("sheet_cover"), 0, 0, 32, 28, x, y, 16, 15);
    if (c.state === "crate") ctx.drawImage(this.sheet("crate"), 0, 14, 32, 18, x - 2, y + 20, 20, 11);
    if (this.hanging && this.hanging.spot === c && this.hanging.t > 18) {
      const t = this.hanging.t - 18;
      [[-6, 0, 0], [10, -4, 8], [12, 12, 16]].forEach(([dx, dy, d]) => { const f = Math.floor((t - d) / 4); if (f >= 0 && f < 4) this.drawSlot("sparkle", f, 0, x + dx, y + dy); });
    }
  }
  /* The lit bits out front of the screening nook, drawn over the room's lighting so they glow: the marquee bulbs and the
     red letters on the NOW PLAYING sign (the title scrolls when it's too long for the board). */
  drawMarquee(r, cx, cy) {
    const ctx = this.ctx;
    if (r.floorLights) {
      ctx.globalCompositeOperation = "lighter";
      for (const l of r.floorLights) {
        const x = l.x * T + (l.side === "r" ? 13 : 3) - cx, y = l.y * T + 9 - cy, g = ctx.createRadialGradient(x, y, 1, x, y, 9);
        g.addColorStop(0, "rgba(255,190,110,0.32)"); g.addColorStop(1, "rgba(255,190,110,0)"); ctx.fillStyle = g; ctx.fillRect(x - 9, y - 9, 18, 18);
      }
      ctx.globalCompositeOperation = "source-over";
      for (const l of r.floorLights) this.drawFlip("aisle_light", l.side === "r", l.x * T + (l.side === "r" ? 11 : 1) - cx, l.y * T + 8 - cy);
    }
    if (r.marquee) this.drawSlot("marquee_lights", REDUCED_MOTION ? 0 : this.frame("marquee_lights"), 0, r.marquee.x * T - cx, r.marquee.y * T - cy);
    if (!r.nowSign) return;
    // One line, scrolling right to left like an LED ticker: it jumps two columns at a time, a little chunky.
    const x0 = r.nowSign.x * T - cx, y0 = r.nowSign.y * T + 10 - cy, p = this.nowPlaying();
    const line = this.ledText((this.tx("screen.marquee")[0] || "") + " " + (p ? p.title : "")), win = 58, span = line.width + win;
    const o = REDUCED_MOTION ? win : Math.floor(this.t / 8) * 2 % span; // with reduced motion it holds still at the start
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 3, y0 + 2, win, 8); ctx.clip();
    ctx.drawImage(line, x0 + 3 + win - o, y0 + 2);
    ctx.restore();
  }
  drawFlip(key, flip, x, y) { // a slot mirrored left to right (one piece of art for both walls)
    if (!flip) { this.drawSlot(key, 0, 0, x, y); return; }
    const ctx = this.ctx; ctx.save(); ctx.translate(x + SLOT[key].w, 0); ctx.scale(-1, 1); this.drawSlot(key, 0, 0, 0, y); ctx.restore();
  }
  /* A line of glowing red LED letters (the pixel font, with a soft halo), cached. */
  ledText(s) {
    s = String(s).toUpperCase().replace(/[^A-Z0-9 :\-.!?'&,/]/g, "");
    const cache = this.ledCache || (this.ledCache = new Map()); if (cache.has(s)) return cache.get(s);
    const w = Math.max(1, s.length * 4 - 1), c = document.createElement("canvas"); c.width = w + 2; c.height = 7; const x = c.getContext("2d");
    const lit = new Set(); [...s].forEach((ch, i) => (PIXEL_FONT[ch] || []).forEach((row, yy) => [...row].forEach((v, xx) => { if (v === "1") lit.add((i * 4 + xx + 1) + "," + (yy + 1)); })));
    x.fillStyle = "rgba(255,40,24,0.28)";
    for (const k of lit) { const [px, py] = k.split(",").map(Number); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!lit.has((px + dx) + "," + (py + dy))) x.fillRect(px + dx, py + dy, 1, 1); }
    x.fillStyle = "#ff4030"; for (const k of lit) { const [px, py] = k.split(",").map(Number); x.fillRect(px, py, 1, 1); }
    cache.set(s, c); return c;
  }
  drawProp(p, cx, cy) {
    const ctx = this.ctx, k = p.plant && this.isThirsty(p.plant) ? "plant_thirsty" : p.key;
    const px0 = p.x * T - cx, py0 = p.y * T - (SLOT[k].h - T) - cy;
    this.drawSlot(k, k === "microwave_counter" ? (this.microwaved ? 1 : 0) : this.frame(k), 0, px0, py0);
    if (k === "microwave_counter" && this.boomT > 0) { const f = Math.floor((30 - this.boomT) / 5); if (f < 4) { this.drawSlot("sparkle", f, 0, px0 + 2, py0 - 8); this.drawSlot("sparkle", (f + 1) % 4, 0, px0 + 10, py0 - 4); } }
    if (p.unit !== undefined) this.unitGoods(p.unit).forEach((it, k) => {
      const cxs = px0 + [9, 24, 39][k % 3], top = py0 + (k < 3 ? 4 : 18);
      for (const [dx, dy] of [[-6, 2], [0, 0], [-3, 3], [3, 2]]) { // a little stack of the same thing
        if (it.item) ctx.drawImage(this.itemIcon(it.item), cxs - 5 + dx, top + dy, 10, 10); else this.drawSlot("trinkets", it.trinket, 0, cxs - 4 + dx, top + 1 + dy);
      }
    });
    if (p.rack !== undefined) {
      const it = this.rackItems(p.rack)[0];
      if (it) ctx.drawImage(this.itemIcon(it), px0 + 4, py0 + 3, 24, 24); // one item, big enough to fill both shelves
      else { this.drawSlot("trinkets", hash(p.rack, 1) % 8, 0, px0 + 12, py0 + 5); this.drawSlot("trinkets", hash(p.rack, 2) % 8, 0, px0 + 12, py0 + 18); }
    }
    if (p.collection) this.ownedItems().slice(0, 12).forEach((it, i) => {
      ctx.drawImage(this.itemIcon(it), px0 + [4, 13, 27, 36][i % 4], py0 + [2, 11, 20][Math.floor(i / 4)], 8, 8);
    });
  }
  drawFeatured(r, cx, cy) {
    const x = r.featuredAt.x * T - cx, y = r.featuredAt.y * T - T - cy, sh = this.pack.settings.shop, it = sh.items.find(i => i.id === sh.featured);
    this.drawSlot("featured_stand", 0, 0, x, y);
    if (it) this.ctx.drawImage(this.itemIcon(it), x + 2, y + 2, 12, 12);
    return;
    this.drawSlot("featured_stand", 0, 0, x, y);
  }
  /* ----- what you haven't read -----
     Unread pieces shine a little (Staff tab, Pieces you haven't read): a slow, eased sparkle, or a soft green glow that breathes.
     Reading one side of a case dims it; reading both sides (or a painting's placard) stops it. Nothing shines in the dark. */
  readLevel(p, isCase) {
    const k = p.tut ? (this.tut ? this.tut.sides[p.id] : { note: 1 }) : this.progress.sides[p.id]; if (!k) return 1;
    if (k.note || (k.front && k.back)) return 0;
    return isCase && (k.front || k.back) ? 0.45 : 1;
  }
  drawReadMarks(r, cx, cy) {
    const st = this.pack.settings.staff, s = st.readStrength; if (st.readStyle === "off" || s <= 0) return;
    const ctx = this.ctx, glow = st.readStyle === "glow";
    const mark = (p, isCase, x, y, w, h, tx, ty) => {
      const lv = this.readLevel(p, isCase); if (!lv || this.isDark(r, tx, ty)) return;
      const seed = strSeed(p.id);
      if (glow) { // a soft green outline (and the faintest wash) that slowly breathes
        const b = 0.5 + 0.5 * Math.sin((this.t + seed % 600) / 40), a = Math.min(1, lv * s * (0.55 + 0.45 * b));
        ctx.fillStyle = "#8be39a";
        ctx.globalAlpha = a * 0.45; ctx.fillRect(x - 2, y - 2, w + 4, 1); ctx.fillRect(x - 2, y + h + 1, w + 4, 1); ctx.fillRect(x - 2, y - 1, 1, h + 2); ctx.fillRect(x + w + 1, y - 1, 1, h + 2);
        ctx.globalAlpha = a; ctx.fillRect(x - 1, y - 1, w + 2, 1); ctx.fillRect(x - 1, y + h, w + 2, 1); ctx.fillRect(x - 1, y, 1, h); ctx.fillRect(x + w, y, 1, h);
        ctx.globalAlpha = a * 0.12; ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1; return;
      }
      // Sparkles: twinkles that ease in and out now and then, somewhere new each time. Half-read: one, fainter and rarer.
      const n = lv < 1 ? 1 : 2, period = Math.round((lv < 1 ? 1.7 : 1) * (600 - 380 * s)), life = 60;
      for (let i = 0; i < n; i++) {
        const off = hash(seed, i * 7) % period, tt = this.t + off, ph = tt % period; if (ph >= life) continue;
        const cyc = Math.floor(tt / period), e = Math.sin(Math.PI * ph / life), a = e * e * Math.min(1, 0.3 + 0.7 * s) * (lv < 1 ? 0.6 : 1);
        const px = Math.round(x + 1 + hash(seed + cyc, i * 13 + 1) % Math.max(1, w - 2)), py = Math.round(y + 1 + hash(seed + cyc, i * 13 + 2) % Math.max(1, h - 2));
        ctx.fillStyle = "#fff8dc";
        ctx.globalAlpha = a; ctx.fillRect(px, py, 1, 1);
        ctx.globalAlpha = a * 0.65; ctx.fillRect(px - 1, py, 3, 1); ctx.fillRect(px, py - 1, 1, 3);
        if (e > 0.7) { ctx.globalAlpha = a * 0.3; ctx.fillRect(px - 2, py, 5, 1); ctx.fillRect(px, py - 2, 1, 5); }
      }
      ctx.globalAlpha = 1;
    };
    for (const c of r.cases) if (c.piece && c.state === "wall") mark(c.piece, true, c.x * T - cx + 2, c.y * T - T - cy + 3, 12, 10, c.x, c.y);
    for (const h of r.hung) if (h.piece && h.state === "wall") mark(h.piece, false, h.x * T - cx + 4, h.y * T - cy + 4, 24, 18, h.x, h.y + 2);
  }
  resetRead() { this.progress.sides = {}; this.saveProgress(); }
  /* A sized rug: drawn from its border, corner and colors, or (if the Rug art was replaced) that art nine-sliced to fit,
     so its corners stay crisp and the edges and middle stretch. Custom art keeps its own colors. */
  rugArt(d) {
    const W = Math.max(1, Math.min(24, d.w | 0)) * T, H = Math.max(1, Math.min(24, (d.h | 0) || 1)) * T, hex = v => /^#[0-9a-f]{6}$/i.test(v || "");
    const pre = RUG_PRESETS["Deep red"], col = k => (hex(d[k]) ? d[k] : pre[k]), custom = this.overrides && this.overrides.rug;
    const key = "rug|" + [W, H, d.pattern, d.motif, col("field"), col("border"), col("accent"), col("corner"), custom ? "c" : ""].join("|");
    if (this.cache[key]) return this.cache[key];
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    if (custom) {
      const img = this.sheet("rug"), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.min(16, Math.floor(iw / 3), Math.floor(ih / 3), Math.floor(W / 2), Math.floor(H / 2));
      if (k < 2) x.drawImage(img, 0, 0, iw, ih, 0, 0, W, H);
      else [[0, k, 0, k], [k, iw - 2 * k, k, W - 2 * k], [iw - k, k, W - k, k]].forEach(([sx, sw, dx, dw]) => [[0, k, 0, k], [k, ih - 2 * k, k, H - 2 * k], [ih - k, k, H - k, k]].forEach(([sy, sh, dy, dh]) => { if (dw > 0 && dh > 0) x.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); }));
      return (this.cache[key] = c);
    }
    const put = (cl, px, py, w, h) => { x.fillStyle = cl; x.fillRect(px, py, w || 1, h || 1); };
    const frame = (cl, i, t) => { put(cl, i, i, W - 2 * i, t); put(cl, i, H - i - t, W - 2 * i, t); put(cl, i, i, t, H - 2 * i); put(cl, W - i - t, i, t, H - 2 * i); };
    put(col("field"), 0, 0, W, H);
    frame(col("accent"), 0, 1);
    const style = RUG_BORDERS[d.pattern] ? d.pattern : "band";
    if (style === "band") { frame(col("border"), 2, 3); frame(col("accent"), 5, 1); }
    else if (style === "double") { frame(col("border"), 2, 1); frame(col("border"), 4, 1); }
    else { // a woven zigzag inside a band
      frame(col("border"), 2, 4);
      for (let i = 2; i < W - 2; i++) { const z = Math.abs((i % 4) - 2); put(col("accent"), i, 3 + z % 3); put(col("accent"), i, H - 4 - z % 3); }
      for (let j = 2; j < H - 2; j++) { const z = Math.abs((j % 4) - 2); put(col("accent"), 3 + z % 3, j); put(col("accent"), W - 4 - z % 3, j); }
    }
    const corner = RUG_CORNERS[d.motif] ? d.motif : "diamond";
    if (corner !== "none" && W >= 24 && H >= 24) [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([fx, fy]) => {
      const ox = fx ? W - 10 : 2, oy = fy ? H - 10 : 2, cc = col("corner"), ac = col("accent"), m = (px, py, cl) => put(cl, ox + px, oy + py); // an 8×8 motif
      put(col("field"), ox, oy, 8, 8);
      if (corner === "diamond") { for (let j = 0; j < 7; j++) { const r = 3 - Math.abs(j - 3); for (let i = 3 - r; i <= 3 + r; i++) m(i + 0.5 | 0, j, cc); } m(3, 3, ac); }
      else if (corner === "flower") { [[3, 0], [3, 1], [3, 5], [3, 6], [0, 3], [1, 3], [5, 3], [6, 3], [2, 2], [4, 2], [2, 4], [4, 4]].forEach(([i, j]) => m(i, j, cc)); [[3, 2], [2, 3], [4, 3], [3, 4]].forEach(([i, j]) => m(i, j, ac)); m(3, 3, cc); }
      else { for (let i = 0; i < 7; i++) { m(i, 0, cc); m(i, 6, cc); m(0, i, cc); m(6, i, cc); m(3, i, ac); m(i, 3, ac); } m(3, 3, cc); }
    });
    return (this.cache[key] = c);
  }
  /* People walking behind something tall are hidden by its top: redraw the part above each tall thing's base after the people. */
  drawUppers(r, cx, cy) {
    const ctx = this.ctx, clip = (x, y, w, h, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); };
    for (const c of r.cases) clip(c.x * T - cx, c.y * T - T - cy, T, T, () => this.drawCase(c, cx, cy));
    for (const p of r.props) { const s = SLOT[p.key]; if (s && s.h > T) clip(p.x * T - cx, p.y * T - (s.h - T) - cy, s.w, s.h - T, () => this.drawProp(p, cx, cy)); }
    if (r.featuredAt) clip(r.featuredAt.x * T - cx, r.featuredAt.y * T - T - cy, T, T, () => this.drawFeatured(r, cx, cy));
  }
  /* A visitor telling you how your recommendation went: loved it = a happy hop, hearts and sparkles; liked it = one heart;
     not for them = a little gray sigh. Drawn over the next couple of seconds. */
  drawReaction(c, sx, sy) {
    const k = this.t - c.react.t0, ctx = this.ctx;
    if (k > 150) { c.react = null; return; }
    if (c.react.how === "loved") {
      for (let i = 0; i < 4; i++) { const t = k - i * 14; if (t < 0 || t > 70) continue; ctx.globalAlpha = Math.max(0, 1 - t / 70); this.drawSlot("heart", 0, 0, sx + 4 + [-7, 7, -2, 4][i] + Math.round(Math.sin(t / 6 + i) * 2), sy - 6 - Math.round(t * 0.4)); }
      ctx.globalAlpha = 1;
      [[-6, 0, 0], [16, 2, 10], [4, -10, 20], [14, -8, 32]].forEach(([dx, dy, d]) => { const f = Math.floor((k - d) / 5); if (f >= 0 && f < 4) this.drawSlot("sparkle", f, 0, sx + dx, sy + dy); });
    } else if (c.react.how === "liked") {
      if (k < 70) { ctx.globalAlpha = Math.max(0, 1 - k / 70); this.drawSlot("heart", 0, 0, sx + 4, sy - 6 - Math.round(k * 0.3)); ctx.globalAlpha = 1; }
    } else if (k < 110) { // a little sigh: three gray dots drifting up
      ctx.fillStyle = "rgba(200,200,210," + Math.max(0, 1 - k / 110).toFixed(2) + ")";
      for (let i = 0; i < 3; i++) if (k > i * 12) ctx.fillRect(sx + 3 + i * 4, sy - 4 - Math.round(k / 12), 2, 2);
    }
  }
  /* The drink in your hand; lifted to your mouth while sipping, with a little steam. */
  drawCup(sx, sy, c) {
    const me = c === this.player, d = me ? this.drink : c.drink, st = me ? (this.sip ? this.sip.t : 0) : c.sipT ? 46 - c.sipT : 0;
    const k = d.kind, up = st > 6 && st < 36;
    const x = up ? { down: 4, up: 4, left: 2, right: 6 }[c.dir] : { down: 11, up: 2, left: 1, right: 8 }[c.dir], y = up ? 6 : 9;
    if (d.empty) { this.drawSlot("cup_empty", 0, 0, sx + x, sy + y); return; }
    this.drawSlot("cups", k, 0, sx + x, sy + y);
    if (up || (c.sitting && this.t % 90 < 40)) this.drawSlot("steam", Math.floor(this.t / 8) % 3, 0, sx + x, sy + y - 7);
  }
  /* The floor tile just inside each doorway, for its mat. */
  doorMats(r) {
    if (r._mats) return r._mats;
    const out = [];
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const o = r.over[y][x]; if (!o) continue;
      const at = /doorway_lower|staff_door_lower/.test(o) ? [x, y + 1] : /doorway_bottom|exit_door/.test(o) ? [x, y - 1] : o === "doorway_side" ? [r.solid[y][x + 1] === false ? x + 1 : x - 1, y] : null;
      if (at && r.solid[at[1]] && !r.solid[at[1]][at[0]] && !this.underMarquee(r, x, y)) out.push(at);
    }
    return (r._mats = out);
  }
  underMarquee(r, x, y) { const m = r.marquee; return !!m && x >= m.x && x < m.x + 2 && y >= m.y && y < m.y + 2; }
  doorTiles(r) {
    if (r._doors) return r._doors;
    const out = [];
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (r.over[y][x] && /door|exit/.test(r.over[y][x])) out.push([x, y]);
    return (r._doors = out);
  }
  pos(c) { const [dx, dy] = DIRS[c.dir]; return { x: c.x * T + dx * c.prog, y: c.y * T + dy * c.prog }; }
  /* Draw one whole room, edge to edge, onto a new canvas: no player, no lighting. The level editor uses this. */
  renderRoomFull(id, noPeople) {
    const r = this.rooms[id]; if (!r) return null;
    const c = document.createElement("canvas"); c.width = r.w * T; c.height = r.h * T;
    const save = [this.ctx, this.room, this.full, this.camX, this.camY];
    this.ctx = c.getContext("2d"); this.ctx.imageSmoothingEnabled = false; this.room = r; this.full = { w: c.width, h: c.height, noPeople: !!noPeople };
    try { this.draw(); } finally { [this.ctx, this.room, this.full, this.camX, this.camY] = save; }
    return c;
  }
  draw() {
    const ctx = this.ctx, r = this.room, pp = this.pos(this.player), full = this.full;
    if (!full && this.shakeT > 0 && !this.shaking && !REDUCED_MOTION) { this.shaking = true; ctx.save(); ctx.translate(this.shakeT % 4 < 2 ? 1 : -1, 0); this.draw(); ctx.restore(); this.shaking = false; return; }
    const VWp = full ? full.w : SW, VHp = full ? full.h : SH;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, VWp, VHp);
    const rw = r.w * T, rh = r.h * T;
    const cx = full ? 0 : Math.round(rw <= SW ? (rw - SW) / 2 : Math.max(0, Math.min(rw - SW, pp.x + 8 - SW / 2)));
    const cy = full ? 0 : Math.round(rh <= SH ? (rh - SH) / 2 : Math.max(0, Math.min(rh - SH, pp.y + 8 - SH * (ROOMS[r.id].camAt || 0.5))));
    if (!full) { this.camX = cx; this.camY = cy; }
    const tx0 = Math.max(0, Math.floor(cx / T)), ty0 = Math.max(0, Math.floor(cy / T)), tx1 = Math.min(r.w - 1, Math.floor((cx + VWp) / T)), ty1 = Math.min(r.h - 1, Math.floor((cy + VHp) / T));
    for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
      const sx = x * T - cx, sy = y * T - cy;
      if (r.tiles[y][x]) this.drawSlot(r.tiles[y][x], this.frame(r.tiles[y][x]), 0, sx, sy);
      if (r.over[y][x] && !this.underMarquee(r, x, y)) this.drawSlot(r.over[y][x], this.frame(r.over[y][x]), 0, sx, sy);
    }
    for (const h of r.hung) {
      const x = h.x * T - cx, y = h.y * T - cy;
      if (h.state === "wall") {
        const c = this.chore && this.chore.spot === h ? this.chore : null;
        const ck = this.creakT && this.creakT.id === h.piece.id ? Math.min(1, this.creakT.t / 30) : 1;
        const tilt = c && c.kind === "straighten" ? 0.07 * Math.max(0, 1 - c.t / 12) * (c.t < 12 && c.t % 4 < 2 ? 1.2 : 1) : this.isCrooked(h.piece) ? -0.09 * ck * (ck < 1 && this.creakT.t % 6 < 3 ? 0.8 : 1) : 0;
        if (tilt) { ctx.save(); ctx.translate(x + 16, y + 2); ctx.rotate(tilt); ctx.drawImage(this.pieceOnWall(h.piece), -16, -2); ctx.restore(); }
        else ctx.drawImage(this.pieceOnWall(h.piece), x, y);
        const dustA = c && c.kind === "dust" ? Math.max(0, 1 - c.t / 16) : this.isDusty(h.piece) ? 1 : 0;
        if (dustA > 0) { ctx.globalAlpha = dustA; this.drawSlot("dust", 0, 0, x, y); ctx.globalAlpha = 1; }
        if (c && c.t > 6) [[-4, 4, 0], [26, 0, 6], [12, 18, 12]].forEach(([dx, dy, d]) => {
          const f = Math.floor((c.t - 6 - d) / 4); if (f >= 0 && f < 4) this.drawSlot("sparkle", f, 0, x + dx, y + dy);
        });
      }
      else if (h.state === "covered") this.drawSlot("sheet_cover", 0, 0, x, y);
      else if (h.state === "crate") this.drawSlot("crate", 0, 0, x, y);
      else if (h.state === "lifting" && this.hanging) {
        const e = Math.min(1, this.hanging.t / 26), k = 1 - (1 - e) * (1 - e);
        ctx.globalAlpha = 0.25 + 0.75 * k; ctx.drawImage(this.pieceOnWall(h.piece), x, Math.round(y + 14 * (1 - k))); ctx.globalAlpha = 1;
      }
      if (this.hanging && this.hanging.spot === h && this.hanging.t > 18) {
        const t = this.hanging.t - 18;
        [[-6, 2, 0], [28, 6, 8], [10, -6, 16], [24, 22, 24], [-4, 20, 30]].forEach(([dx, dy, d]) => {
          const f = Math.floor((t - d) / 4); if (f >= 0 && f < 4) this.drawSlot("sparkle", f, 0, x + dx, y + dy);
        });
      }
    }
    const def = ROOMS[r.id];
    if (def.lockers) def.lockers.forEach(x => this.drawSlot("lockers", 0, 0, x * T - cx, T - cy));
    const li = def.lockers ? this.myLocker() : -1;
    if (li >= 0 && def.lockers[li] !== undefined) { // a little frame on your locker door: a photo of you, or one of yours
      const fx = def.lockers[li] * T + 2 - cx, fy = T + 8 - cy, im = this.framePhoto();
      ctx.fillStyle = "#181820"; ctx.fillRect(fx, fy, 11, 9); ctx.fillStyle = "#e8b24a"; ctx.fillRect(fx + 1, fy + 1, 9, 7);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(im, 5, 3, 14, 10, fx + 2, fy + 2, 7, 5); ctx.imageSmoothingEnabled = false; // the middle, so it reads at this size
    }
    if (r.corkAt) this.drawSlot("corkboard", 0, 0, r.corkAt.x * T - cx, T - cy);
    if (r.boardAt) this.drawSlot("leaderboard", 0, 0, r.boardAt.x * T - cx, T - cy);
    if (r.clockAt) this.drawSlot("time_clock", 0, 0, r.clockAt.x * T - cx, r.clockAt.y * T - cy);
    if (r.eotmAt) {
      const x = r.eotmAt.x * T - cx, y = r.eotmAt.y * T - cy;
      this.drawSlot("eotm_frame", 0, 0, x, y);
      if (this.eotmInfo()) this.drawSlot("player_staff", 0, 0, x + 8, y + 6);
    }
    const tod = this.tod();
    if (r.windowAt) {
      const x = r.windowAt.x * T - cx, y = r.windowAt.y * T - cy;
      this.drawSlot("sky_" + tod, 0, 0, x + 2, y + 2); this.drawSlot("window_frame", 0, 0, x, y);
    }
    if (r.wallArt) r.wallArt.forEach(w => this.drawSlot(w.key, 0, 0, w.x * T - cx, (w.y || 1) * T - cy));
    if (r.bunting) for (let x = 1; x < r.w - 1; x++) this.drawSlot("bunting", 0, 0, x * T - cx, T - cy);
    if (r.switchAt) this.drawSlot("light_switch", 0, 0, r.switchAt.x * T - cx, r.switchAt.y * T - cy);
    for (const sw of r.switches || []) this.drawSlot("light_switch", 0, 0, sw.x * T - cx, sw.y * T - cy);
    if (r.intercomAt) this.drawSlot("intercom", 0, 0, r.intercomAt.x * T - cx, r.intercomAt.y * T - cy);
    for (const p of r.posters || []) this.drawFlip("hall_poster", p.side === "r", p.x * T - cx, p.y * T - cy);
    if (r.marquee) this.drawSlot("theater_door", 0, 0, r.marquee.x * T - cx, r.marquee.y * T - cy);
    if (r.nowSign) this.drawSlot("led_sign", 0, 0, r.nowSign.x * T - cx, r.nowSign.y * T + 10 - cy);
    if (r.screenAt) this.drawSlot("theater_screen", Math.floor(this.t / 45) % 2, 0, r.screenAt.x * T - cx, (r.screenAt.y - 1) * T - cy); // the big screen, flickering softly (the video goes over it)
    for (const d of r.decals) { if (d.key === "rug" && d.w) ctx.drawImage(this.rugArt(d), d.x * T - cx, d.y * T - cy); else this.drawSlot(d.key, 0, 0, d.x * T - cx, d.y * T - cy); }
    for (const ru of r.runners) drawRunner(ctx, this.sheet(ru.k[0] === "v" ? "carpet_v" : "carpet_h"), ru, cx, cy);
    for (const [x, y] of r.lamps) this.drawSlot("wall_sconce", 0, 0, x * T - cx, y * T - cy);
    for (const a of r.arrows) ctx.drawImage(this.arrowArt(a), a.x * T - cx, (a.y || 1) * T - cy);
    for (const m of r.murals) { // the middle of the mural's art, as wide as its wall (repeated if the wall is longer)
      const img = this.sheet(m.key), iw = img.naturalWidth || img.width, w = m.w * T; if (!iw) continue;
      for (let o = 0; o < w; o += iw) { const room = iw - Math.min(w, iw), sx = m.at >= 0 ? Math.min(room, m.at) : Math.max(0, Math.floor(room / 2)), sw = Math.min(iw - sx, w - o); ctx.drawImage(img, sx, 0, sw, T, m.x * T + o - cx, m.y * T - cy, sw, T); }
    }
    for (const [mx, my] of this.doorMats(r)) this.drawSlot("doormat", 0, 0, mx * T - cx, my * T - cy);
    for (const st of r.stairs) this.drawSlot(st.kind === "up" ? "stair_up" : "stair_down", 0, 0, st.x * T - cx, st.y * T - cy);
    for (const c of r.cases) this.drawCase(c, cx, cy);
    for (const p of r.props) this.drawProp(p, cx, cy);
    if (r.cat) {
      const pet = this.petT > 0, f = pet ? 2 : Math.floor(this.t / 50) % 2;
      this.drawSlot("cat", f, 0, r.cat.x * T - cx, r.cat.y * T - cy);
      if (pet) { const k = 1 - this.petT / 70; ctx.globalAlpha = Math.min(1, this.petT / 20); this.drawSlot("heart", 0, 0, r.cat.x * T + 4 - cx, r.cat.y * T - 6 - Math.round(k * 10) - cy); ctx.globalAlpha = 1; }
      else if (this.t % 160 < 80) { ctx.fillStyle = "rgba(255,255,255,.75)"; const zx = r.cat.x * T + 12 - cx, zy = r.cat.y * T + 2 - cy - Math.floor((this.t % 80) / 20); ctx.fillRect(zx, zy, 3, 1); ctx.fillRect(zx + 1, zy + 1, 1, 1); ctx.fillRect(zx, zy + 2, 3, 1); }
    }
    if (r.mug) this.drawSlot("mug", 0, 0, r.mug.x * T - cx, r.mug.y * T - cy);
    if (r.featuredAt) this.drawFeatured(r, cx, cy);
    const shelf = r.props.find(p => p.mugShelf);
    if (shelf && this.progress.mug === todayISO()) this.drawSlot("mug", 0, 0, (shelf.x + 1) * T + 2 - cx, shelf.y * T - 9 - cy);
    const chars = (full ? (full.noPeople ? [] : r.npcs.slice()) : [this.player, ...r.npcs]).sort((a, b) => this.pos(a).y - this.pos(b).y);
    for (const c of chars) {
      const p = this.pos(c), prog = c.moving ? c.prog : c.bumpT > 0 ? 16 - c.bumpT : -1;
      const col = prog >= 0 && prog < 8 ? (c.step ? 1 : 2) : 0;
      if (c.alpha !== undefined) ctx.globalAlpha = Math.max(0, c.alpha);
      const sheet = c === this.player ? (this.staff ? "player_staff" : this.progress.wearShirt ? "player_goq_shirt" : c.sheet) : c.sheet;
      if (c === this.player && this.segway && !c.sitting) { const pp3 = this.pos(c); this.drawSlot("segway", 0, 0, Math.round(pp3.x - cx), Math.round(pp3.y - cy - 1)); }
      const pk = c.pose ? this.t - c.pose.t0 : 999, jump = c.pose && /^(startled|guard|pose)$/.test(c.pose.kind) && pk < 14 ? Math.round(Math.sin(Math.PI * pk / 14) * 3) : 0; // a little jump when photographed
      const hop = (c.react && c.react.how === "loved" && this.t - c.react.t0 < 48 ? Math.round(Math.abs(Math.sin((this.t - c.react.t0) / 8)) * 4) : 0) + jump - (c.pose && c.pose.kind === "bow" && pk > 8 && pk < 50 ? 1 : 0); // a happy hop; the usher's bow dips
      const sx = Math.round(p.x - cx), sy = Math.round(p.y - cy - 4) + (c.sitting ? 2 : 0) - (c === this.player && this.segway && !c.sitting ? 4 : 0) - hop;
      const cup = c === this.player ? this.drink : c.drink, cupFirst = cup && c.dir === "up";
      const bagAt = c.bag && !c.sitting ? [sx + { down: 1, up: 9, left: 9, right: -1 }[c.dir], sy + 9] : null, bagFirst = bagAt && c.dir !== "down"; // a shop bag hangs at their side
      if (bagFirst) this.drawSlot("shop_bag", 0, 0, ...bagAt);
      if (cupFirst) this.drawCup(sx, sy, c);
      this.drawSlot(sheet, c.sitting ? 0 : col, DIR_ROW[c.dir], sx, sy);
      if (c !== this.player && /^visitor_[abc]$/.test(sheet) && !this.overrides[sheet]) { // their shirt, in their own color
        const L = this.pack.settings.life, hex = c.shirt || (L.shirtsOn && L.shirts.length ? (c.shirt = L.shirts[Math.floor(Math.random() * L.shirts.length)]) : null);
        if (hex) this.drawSlot("visitor_shirt@" + hex, c.sitting ? 0 : col, DIR_ROW[c.dir], sx, sy);
      }
      if (cup && !cupFirst) this.drawCup(sx, sy, c);
      if (bagAt && !bagFirst) this.drawSlot("shop_bag", 0, 0, ...bagAt);
      if (c !== this.player && c.snapT > 0) { // a visitor taking a photo of a piece: phone held up above their head, then a flash
        const ox = { down: 4, up: 4, left: 0, right: 8 }[c.dir], oy = c.dir === "up" ? -6 : 3;
        this.drawSlot("phone", 0, 0, sx + ox, sy + oy);
        if (c.snapT > 22 && c.snapT < 30) { const k = c.snapT > 26 ? 1 : 0.5, fx = sx + ox + 4, fy = sy + oy + (c.dir === "up" ? -1 : 3);
          ctx.fillStyle = "rgba(255,255,240," + (0.95 * k) + ")"; ctx.fillRect(fx - 1, fy - 4, 2, 8); ctx.fillRect(fx - 4, fy - 1, 8, 2); ctx.fillRect(fx - 2, fy - 2, 4, 4);
          ctx.fillStyle = "rgba(255,255,230," + (0.25 * k) + ")"; ctx.beginPath(); ctx.arc(fx, fy, 9, 0, 7); ctx.fill(); }
      }
      if (c === this.player && this.phoneT > 0) {
        const ox = { down: 4, up: 4, left: 0, right: 8 }[c.dir]; if (c.dir !== "up") this.drawSlot("phone", 0, 0, sx + ox, sy + 4);
      }
      if (c === this.player && this.asleep && this.t % 120 < 90) { const zy = Math.floor((this.t % 120) / 30); ctx.fillStyle = "#f8f8f0"; ctx.font = "6px monospace"; ctx.fillText("z", sx + 12 + zy, sy - zy * 3); }
      const bub = c.leaving || this.full ? -1 : c.tutId ? (c.tutBack ? 1 : !c.tutShown && !c.follow ? 0 : -1) : c.back ? 1 : c.cur && !c.follow ? 0 : -1; // "?" curious, "!" back to tell you how it went
      if (c.react && !this.full) this.drawReaction(c, sx, sy);
      if (c.pose && !this.full) { // the photo reaction's bubble, fading out at the end
        if (pk >= c.pose.dur) c.pose = null;
        else if (c.pose.kind !== "snapback") {
          const fr = { startled: pk < 40 ? 0 : 2, guard: 0, heart: 1, pose: 3, busy: 4, wave: 5, shy: 6, annoyed: 7, bow: 3 }[c.pose.kind];
          ctx.globalAlpha = Math.min(1, (c.pose.dur - pk) / 15) * (c.alpha !== undefined ? Math.max(0, c.alpha) : 1);
          this.drawSlot("emote", fr, 0, sx + 4, sy - 10 + (Math.floor(this.t / 20) % 2)); ctx.globalAlpha = c.alpha !== undefined ? Math.max(0, c.alpha) : 1;
        }
      }
      if (c.member && !c.leaving && !this.full && Math.abs(c.x - this.player.x) + Math.abs(c.y - this.player.y) <= 2) {
        ctx.font = "6px monospace"; const w = Math.ceil(ctx.measureText(c.member).width) + 4, nx = Math.round(sx + 8 - w / 2), ny = sy - (bub >= 0 ? 18 : 8);
        ctx.fillStyle = "rgba(24,24,32,.85)"; ctx.fillRect(nx, ny, w, 8); ctx.fillStyle = "#f8f0c0"; ctx.textBaseline = "top"; ctx.fillText(c.member, nx + 2, ny + 1);
      }
      if (bub >= 0) this.drawSlot("bubble", bub, 0, sx + 4, sy - 9 + (Math.floor(this.t / 20) % 2));
      ctx.globalAlpha = 1;
    }
    this.drawUppers(r, cx, cy);
    if (full) return;
    this.drawReadMarks(r, cx, cy);
    this.drawLighting(r, cx, cy, pp);
    this.drawMarquee(r, cx, cy);
    this.syncScreen(r, cx, cy);
    if (this.figure && this.isDark(r, this.figure.x, this.figure.y)) {
      ctx.globalAlpha = 0.55 * this.figure.alpha; this.drawSlot("shadow_figure", 0, 0, this.figure.x * T - cx, this.figure.y * T - cy - 4); ctx.globalAlpha = 1;
    }
    if (this.tapMark && this.tapMark.t > 0) { // little corner brackets where you tapped
      const m = this.tapMark, x = m.x * T - cx, y = m.y * T - cy, k = m.t % 10 < 5 ? 0 : 1; m.t--;
      ctx.fillStyle = "#f8f0c0";
      [[0, 0, 1, 1], [12, 0, -1, 1], [0, 12, 1, -1], [12, 12, -1, -1]].forEach(([ox, oy, sx, sy]) => {
        const bx = x + ox + (sx < 0 ? 3 : 0) - k * sx, by = y + oy + (sy < 0 ? 3 : 0) - k * sy;
        ctx.fillRect(bx, by + (sy < 0 ? 3 : 0), 4, 1); ctx.fillRect(bx + (sx < 0 ? 3 : 0), by, 1, 4);
      });
    }
    // The light dims softly twice, like a tired bulb (no strobing; skipped entirely with reduced motion).
    if (this.flickerT > 0 && !REDUCED_MOTION) { const k = this.flickerT, d = Math.max(0, 1 - Math.abs(k - 48) / 8, 1 - Math.abs(k - 22) / 8); if (d > 0) { ctx.fillStyle = "rgba(6,4,14," + (0.32 * d).toFixed(3) + ")"; ctx.fillRect(0, 0, SW, SH); } }
    // Camera flash: a small, soft glow in front of you rather than the whole screen.
    if (this.flash > 0) {
      const pp2 = this.pos(this.player), [fx, fy] = DIRS[this.player.dir], x0 = pp2.x + 8 + fx * 14 - cx, y0 = pp2.y + 4 + fy * 12 - cy, g = ctx.createRadialGradient(x0, y0, 1, x0, y0, 30);
      g.addColorStop(0, "rgba(255,255,240," + (0.45 * this.flash / 6).toFixed(3) + ")"); g.addColorStop(1, "rgba(255,255,240,0)");
      ctx.fillStyle = g; ctx.fillRect(x0 - 30, y0 - 30, 60, 60);
    }
    if (this.fade > 0) { ctx.globalAlpha = Math.min(1, this.fade); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1; }
  }
}

/* ---------- Touch controls (from the Theater) ---------- */
function mountControls(game, host) {
  host.classList.add("gt-controls");
  host.innerHTML = '<div class="gt-pad" role="group" aria-label="Directional pad"><span class="u"></span><span class="d"></span><span class="l"></span><span class="r"></span><i></i></div>' +
    '<button type="button" class="gt-start" data-k="start" aria-label="Start: menu">START</button>' +
    '<div class="gt-btns"><button type="button" class="gt-btn gt-btn-b" data-k="b" aria-label="B, go back or take a photo">B</button><button type="button" class="gt-btn gt-btn-a" data-k="a" aria-label="A, look or talk">A</button></div>';
  // iOS Safari double-tap zooms on quick taps here even though the pointer events below are cancelled; cancelling the touches stops it.
  ["touchstart", "touchend"].forEach(t => host.addEventListener(t, e => { if (e.cancelable) e.preventDefault(); }, { passive: false }));
  const pad = host.querySelector(".gt-pad"); let active = null;
  const set = d => { if (d === active) return; if (active) game.hold(active, false); active = d; if (d) game.hold(d, true); pad.dataset.dir = d || ""; };
  const dirAt = e => {
    const r = pad.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(x, y) < r.width * 0.1) return active;
    return Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : y > 0 ? "down" : "up";
  };
  const buzz = () => { if (game.haptics && navigator.vibrate) try { navigator.vibrate(8); } catch (err) {} };
  pad.addEventListener("pointerdown", e => { e.preventDefault(); pad.setPointerCapture(e.pointerId); buzz(); set(dirAt(e)); });
  pad.addEventListener("pointermove", e => { if (pad.hasPointerCapture(e.pointerId)) set(dirAt(e)); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(t => pad.addEventListener(t, () => set(null)));
  host.querySelectorAll(".gt-btn, .gt-start").forEach(b => {
    b.tabIndex = -1;
    const up = () => b.classList.remove("down");
    b.addEventListener("pointerdown", e => { e.preventDefault(); buzz(); game.press(b.dataset.k); b.classList.add("down"); clearTimeout(b._t); b._t = setTimeout(up, 150); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(t => b.addEventListener(t, up));
    b.addEventListener("contextmenu", e => e.preventDefault());
  });
  host.addEventListener("contextmenu", e => e.preventDefault());
}

/* Shared with curator.html. */
/* Bump this with every engine change. The pages show it, so it's easy to tell which engine file a browser actually loaded. */
const VERSION = "2026-10-27 one theater";
window.GOQ = { ACH_STATS, SHIRT_COLORS, RUG_BORDERS, RUG_CORNERS, RUG_PRESETS, SAMPLE_ACH, archiveSplit, VERSION, TEXT, TALK_ROLES, TALK_WHEN, TALK_DEFAULTS, DEFAULT_CORKBOARD, daysBetween, PACK_FORMAT, SLOTS, SLOT, sheetGrid, placeholder, normalizePack, normalizePiece, normalizeMinds, SAMPLE_MINDS, SAMPLE_PIECES, ROOMS, Game, mountControls, todayISO, niceDate,
  spotCount: () => Object.values(ROOMS).reduce((a, r) => a + (r.spots || []).length, 0),
  caseCount: () => Object.values(ROOMS).reduce((a, r) => a + (r.cases || []).length, 0),
  spotRooms: () => Object.keys(ROOMS).filter(id => (ROOMS[id].spots || []).length).map(id => ({ id, name: ROOMS[id].name, n: ROOMS[id].spots.length })),
  BUILTIN_ROOMS, applyRooms, normalizeRoom, SLOTS_BY_KEY: SLOT, normalizeLayout, carveLayout, hallRects, themeOf, hallEndColors, hallLength, layoutOf, LAYOUT_MAX_W, LAYOUT_MAX_H, SAMPLE_GENRES, genreOf, assignCases, runnerTiles, drawRunner,
  placeholderPainting: p => { const n = normalizePiece(p, 0); return paint([paintingGrid(n)], 24, 18, 1, n.colors); } };
})();
