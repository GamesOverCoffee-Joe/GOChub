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
  rug:     ["#f0d0b8", "#c05848", "#802830", "#2a1014"],
  wood:    ["#f0dcc0", "#c08858", "#784830", "#2c1810", "#a06c44"],
  gold:    ["#fff6cc", "#f0c040", "#b07818", "#3c2408", "#c8d8e8", "#a8bcd0"],
  plant:   [null, "#9ccc68", "#4c8c3c", "#1e2418", "#c8784c", "#8a4428", "#a89048"],
  dust:    ["#e8e0d0", "#b8b0a0"],
  mug:     [null, "#e8e4dc", "#3a2418", "#181820"],
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
  mags:    [null, "#f8f0e0", "#8a5a38", "#2a160c", "#e05050", "#5878c8", "#f0c040", "#58a868"],
  segway:  [null, "#f8f8f0", "#b0b0c0", "#181820"],
  goqshirt:[null, "#f8e0c0", "#2a2030", "#181820", "#e8b24a"],
  kitchen: [null, "#e8eef4", "#9fb4c8", "#1a2230", "#e05050", "#58a868", "#d8a050"],
  plaque:  [null, "#e8c870", "#7a4a28", "#2a160c", "#f8f0c0"],
  ui:      ["#f8f8f0", "#b0b0c0", "#505068", "#181820"],
  player:  [null, "#f8e0c0", "#3878c8", "#181820"],
  visitorA:[null, "#e8c098", "#c83838", "#181820"],
  visitorB:[null, "#c89060", "#8850c0", "#181820"],
  visitorC:[null, "#f8e0c0", "#58a048", "#181820"],
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
  bubble: f => {
    const a = rows(["........", ".000000.", "00000000", "00000000", "00000000", ".000000.", "...00...", "....0..."]);
    (f === 0 ? [[3, 1], [4, 1], [5, 2], [4, 3], [4, 5]] : [[4, 1], [4, 2], [4, 3], [4, 5]]).forEach(([x, y]) => px(a, x, y, 3));
    return outline(a, 3);
  },
  elevator_panel: () => {
    const a = mk(16, 16);
    rect(a, 4, 2, 8, 12, 1); rect(a, 5, 3, 6, 2, 3); px(a, 6, 3, 5); px(a, 9, 3, 5);
    [[6, 7], [9, 7], [6, 10], [9, 10]].forEach(([x, y]) => rect(a, x, y, 2, 2, 0));
    return outline(a);
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
  phone: () => { const a = mk(8, 8); rect(a, 2, 0, 4, 7, 3); rect(a, 3, 1, 2, 4, 0); px(a, 3, 5, 1); return a; },
  // The floor painted on a stairwell's back wall: B1, 1F, 2F, 3F, 4F, 5F.
  floor_sign: f => {
    const G = { B: ["110", "101", "110", "101", "110"], F: ["111", "100", "110", "100", "100"], 1: ["010", "110", "010", "010", "111"], 2: ["110", "001", "010", "100", "111"],
      3: ["110", "001", "010", "001", "110"], 4: ["101", "101", "111", "001", "001"], 5: ["111", "100", "110", "001", "110"] };
    const txt = ["B1", "1F", "2F", "3F", "4F", "5F"][f], a = mk(32, 16);
    [...txt].forEach((ch, i) => G[ch].forEach((row, y) => [...row].forEach((v, x) => { if (v === "1") rect(a, 8 + i * 9 + x * 2, 3 + y * 2, 2, 2, 2); })));
    return outline(a, 3);
  },
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
  { key: "rug", label: "Rug", group: "Gift shop and café", w: 48, h: 32, pal: "rug", gen: GEN.rug, note: "Lies on the floor under everything else; you walk over it." },
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
  { key: "bubble", label: "Visitor's thought bubble", group: "People", w: 8, h: 8, frames: 2, pal: "ui", gen: GEN.bubble, note: "2 frames (16×8): \"?\" when they're looking for a piece, \"!\" when you've asked." },
  { key: "elevator_panel", label: "Elevator panel", group: "Floors", w: 16, h: 16, pal: "switchp", gen: GEN.elevator_panel, note: "On the elevator's wall. " + OVER_NOTE },
  { key: "stairs_up", label: "Stairs going up", group: "Floors", w: 32, h: 32, pal: "staffrm", gen: GEN.stairs_up, note: "No longer used: stairs are one tile now." , retired: true },
  { key: "stairs_down", label: "Stairs going down", group: "Floors", w: 32, h: 32, pal: "staffrm", gen: GEN.stairs_down, note: "No longer used: stairs are one tile now.", retired: true },
  { key: "storage_shelves", label: "Storage shelves", group: "Floors", w: 32, h: 32, pal: "wood", gen: GEN.storage_shelves, note: "Two tiles tall." },
  { key: "box_stack", label: "Stack of boxes", group: "Floors", w: 16, h: 32, pal: "wood", gen: GEN.box_stack, note: "Two tiles tall; you can walk behind the top." },
  { key: "workbench", label: "Workbench", group: "Floors", w: 48, h: 16, pal: "wood", gen: GEN.workbench, note: "In the storage room. Lists the crates for upcoming pieces." },
  { key: "stair_up", label: "Stairs up (one tile)", group: "Floors", w: 16, h: 16, pal: "staffrm", gen: GEN.stair_up, note: "Step on it to go up a floor." },
  { key: "stair_down", label: "Stairs down (one tile)", group: "Floors", w: 16, h: 16, pal: "staffrm", gen: GEN.stair_down, note: "Step on it to go down a floor." },
  { key: "railing", label: "Railing", group: "Floors", w: 16, h: 16, pal: "wood", gen: GEN.railing, note: "Blocks the way, so a stairwell becomes a zigzag." },
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
  { key: "floor_sign", label: "Floor number on a stairwell wall", group: "Floors", w: 32, h: 16, frames: 6, pal: "staffrm", gen: GEN.floor_sign, note: "6 frames side by side (192×16): B1, 1F, 2F, 3F, 4F, 5F. Painted on the upper wall row, in the middle." },
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
/* Fancy drinks: they cost tokens, or a full quiz card. cup: which cup you hold (0 coffee, 1 tea, 2 cocoa). The host renames them in the Shop tab. */
const SAMPLE_FANCY = [{ id: "caramel", name: "Caramel latte", cup: 0 }, { id: "chai", name: "Honey chai", cup: 1 }, { id: "mocha", name: "Peppermint mocha", cup: 2 }];
/* Quiz cards: five games, one stamp each. A super stamp comes from a question about the episode video or the game's store page. */
const QUIZ_SIZE = 5;
/* Super questions, written per piece: { q, a, wrong: [...], from: "video" | "store" }. Three wrong answers are drawn from up to six. */
function normalizeQuiz(list) {
  return (Array.isArray(list) ? list : []).slice(0, 12).map(x => ({
    q: str(x && x.q, 240), a: str(x && x.a, 120), from: x && x.from === "store" ? "store" : "video",
    wrong: (Array.isArray(x && x.wrong) ? x.wrong : []).map(w => str(w, 120)).filter(Boolean).slice(0, 6),
  })).filter(x => x.q && x.a && x.wrong.length >= 1);
}
function shuffled(list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* Saves from before quiz cards: cases read on both sides, and pieces on the old stamp card, count as read. */
function oldRead(p) {
  const out = {}, d = todayISO();
  for (const id in p.sides || {}) if (p.sides[id] && p.sides[id].front && p.sides[id].back) out[id] = d;
  (Array.isArray(p.stamps) ? p.stamps : []).forEach(id => { if (typeof id === "string") out[id] = d; });
  return out;
}
/* The quiz card in a save: up to five slots, each a piece and its stamp (0 none, 1 stamp, 2 super stamp). */
function cleanCard(c) {
  const slots = c && Array.isArray(c.slots) ? c.slots : [];
  return { slots: slots.filter(s => s && typeof s.id === "string").slice(0, QUIZ_SIZE).map(s => ({
    id: s.id, stamp: [0, 1, 2].includes(s.stamp) ? s.stamp : 0, seen: Array.isArray(s.seen) ? s.seen.filter(k => typeof k === "string").slice(-20) : [],
    cur: s.cur && Array.isArray(s.cur.opts) && typeof s.cur.q === "string" && typeof s.cur.ans === "number" ? s.cur : null, miss: !!s.miss })) };
}
/* Offline staff badge for testing. Real badges live in Supabase (see supabase-setup.sql).
   Never put real badge keys in this file or in a museum pack: both are public on the site. */
/* Chores that count toward staff points (helping a visitor is worth 3). */
const pts = n => n + " point" + (n === 1 ? "" : "s");
const POINT_KINDS = ["dusted", "straightened", "watered", "mugs", "wiped", "helped"];
const TEST_BADGES = [{ badge: "0001", key: "QQQQQQ", name: "Test Staff" }];
/* The test badge only works where its hint is shown (showTestBadge): locally, with ?test, or in the curator. */
/* Badge keys are six characters from an alphabet without look-alikes (no O/0, no I/1), shown as QQQ-QQQ.
   Typed keys are normalized: uppercase, dashes and spaces dropped. */
const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const normKey = k => String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const safeUrl = v => (typeof v === "string" && /^https?:\/\/\S+$/i.test(v.trim()) ? v.trim().slice(0, 400) : "");
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max || 600) : "");
function normalizePiece(p, i) {
  p = p && typeof p === "object" ? p : {};
  const colors = Array.isArray(p.colors) ? p.colors.filter(isHex).slice(0, 8) : [];
  return {
    id: str(p.id, 60) || "piece-" + (i + 1), kind: p.kind === "community" ? "community" : "episode",
    title: str(p.title, 80) || "Untitled", developer: str(p.developer, 80) || "Unknown developer",
    observation: str(p.observation), intention: str(p.intention), guestWriter: str(p.guestWriter, 80), guestNote: str(p.guestNote),
    episodeUrl: safeUrl(p.episodeUrl), gameUrl: safeUrl(p.gameUrl), image: str(p.image, 20000000) || null,
    unveil: /^\d{4}-\d{2}-\d{2}$/.test(p.unveil || "") ? p.unveil : "",
    hint: str(p.hint, 160), pick: !!p.pick, quiz: normalizeQuiz(p.quiz),
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
  // (Automatic extra floors are off: the museum has three galleries, and extra pieces go to the archive on Someone's PC.)
  for (const id in ROOMS) {
    const d = ROOMS[id].light || { dim: 0, spots: 0 }, v = lin[id] || {}, num = (x, lo, hi, def) => (typeof x === "number" && isFinite(x) ? Math.min(hi, Math.max(lo, x)) : def);
    lighting[id] = { dim: num(v.dim, 0, 0.8, d.dim), spots: num(v.spots, 0, 1, d.spots) };
  }
  const sin = (p.settings && p.settings.staff) || {}, eo = sin.eotm || {};
  const staff = {
    catName: str(sin.catName, 30) || "Pixel",
    fingerprints: typeof sin.fingerprints === "number" && isFinite(sin.fingerprints) ? Math.max(0, Math.min(1, sin.fingerprints)) : 0.15,
    patronSpeed: typeof sin.patronSpeed === "number" && isFinite(sin.patronSpeed) ? Math.max(0.2, Math.min(1, sin.patronSpeed)) : 0.45,
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
  const fancy = (Array.isArray(shin.fancy) ? shin.fancy : SAMPLE_FANCY).slice(0, 6).map((d, i) => ({
    id: str(d && d.id, 40) || "fancy-" + (i + 1), name: str(d && d.name, 40) || "Fancy drink", cup: [0, 1, 2].includes(d && d.cup) ? d.cup : i % 3 })).filter(d => d.name);
  const shop = { items, fancy, featured: items.some(it => it.id === shin.featured) ? shin.featured : (items[0] ? items[0].id : ""),
    drinkPrice: Math.max(0, Math.min(99, Math.round(+shin.drinkPrice || 0))),
    fancyPrice: Math.max(0, Math.min(99, Math.round(shin.fancyPrice === undefined ? 4 : +shin.fancyPrice || 0))) };
  const rooms = p.rooms && typeof p.rooms === "object" ? p.rooms : {};
  const vlist = v => (Array.isArray(v) ? v.filter(Array.isArray).map(pg => pg.map(x => str(x, 400)).filter(Boolean)).filter(pg => pg.length).slice(0, 30) : null);
  const textIn = (p.settings && p.settings.text) || {}, text = {};
  for (const k in textIn) if (TEXT[k]) { const v = vlist(textIn[k]); if (v && v.length) text[k] = v; }
  const talkIn = (p.settings && p.settings.talk) || {}, talk = {};
  for (const r in TALK_ROLES) talk[r] = Array.isArray(talkIn[r]) ? talkIn[r].map(e => ({ when: (Array.isArray(e && e.when) ? e.when : ["always"]).filter(w => TALK_WHEN[w]).slice(0, 2), v: vlist(e && e.v) || [] })).filter(e => e.v.length) : JSON.parse(JSON.stringify(TALK_DEFAULTS[r]));
  const achIn = p.settings && Array.isArray(p.settings.achievements) ? p.settings.achievements : SAMPLE_ACH;
  const achievements = achIn.slice(0, 100).map((a, i) => ({ id: str(a && a.id, 40) || "ach-" + (i + 1), name: str(a && a.name, 50) || "Achievement", desc: str(a && a.desc, 160),
    stat: ACH_STATS[a && a.stat] ? a.stat : "dusted", target: Math.max(1, Math.min(9999, Math.round(+(a && a.target) || 1))), secret: !!(a && a.secret) }));
  // Online staff (Supabase): the project address and its public key. Both are meant to be public.
  const oin = (p.settings && p.settings.online) || {}, ourl = str(oin.url, 200).replace(/\/+$/, "");
  const online = { url: /^https:\/\/[^\s/]+$/i.test(ourl) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(ourl) ? ourl : "", key: str(oin.key, 400).replace(/\s/g, "") };
  return { format: PACK_FORMAT, version: 1, assets, pieces, guestbook, rooms, settings: { lighting, staff, shop, text, talk, achievements, online }, samples: !Array.isArray(p.pieces) };
}
function todayISO() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function daysBetween(a, b) { const t = s => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((t(b) - t(a)) / 864e5); }
function niceDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1] + " " + d + ", " + y;
}
function loadImage(src) {
  return new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
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
      "#......=......H",
      "#......=......#",
      "#......=......#",
      "#......=......#",
      "#######E#######",
    ],
    spawn: [7, 8, "up"],
    windowAt: [3, 1],
    props: [
      { key: "sign_stand", x: 13, y: 6, say: ["GIFT SHOP AND CAFE", "Right through this door. Souvenirs, coffee, and somewhere to sit."] },
      { key: "trash_can", x: 13, y: 4, event: { trash: true } },
      { key: "patron_board", x: 4, y: 8, tall: true, blockTop: true, event: { patronBoard: true } },
      { key: "front_desk", x: 2, y: 4, say: ["A guestbook lies open on the front desk.", "The first page is still blank."] },
      { key: "sign_stand", x: 9, y: 3, say: ["DIRECTORY", "North: Gallery One. Games Over Qualia episodes and community finds."] },
      { key: "plant", plant: "fern-left", name: "fern", x: 1, y: 3 },
      { key: "plant", plant: "fern-right", name: "other fern", x: 13, y: 3 },
      { key: "plant", plant: "rubber", name: "rubber plant", x: 1, y: 8 },
      { key: "plant", plant: "palm", name: "little palm", x: 13, y: 8 },
      { key: "bench", x: 10, y: 6, sit: "down", say: ["A bench for resting between galleries."] },
    ],
    events: [
      { x: 7, y: 2, warp: ["gallery", 13, 12, "up"] },
      { x: 12, y: 2, staffDoor: true, warp: ["staff", 7, 8, "up"] },
      { x: 9, y: 2, eotm: true }, { x: 10, y: 2, eotm: true },
      { x: 7, y: 9, frontDoor: true, bump: true },
      { x: 14, y: 5, shopDoor: true, warp: ["shop", 1, 5, "right"] },
      { x: 3, y: 2, window: true }, { x: 4, y: 2, window: true },
    ],
    lightSwitch: [5, 2], intercom: [2, 2], exitTo: [7, 8],
    eotmAt: [9, 1],
    light: { dim: 0, spots: 0 }, // dim: how dark the room is with the lights on (0 to 0.8); spots: spotlight strength on pieces (0 to 1)
    mugSpots: [[5, 5], [11, 4], [3, 7], [9, 8], [12, 5]],
    catSpots: [[6, 7], [12, 7]],
    crowd: true,
    visitors: [{ sheet: "visitor_a", x: 4, y: 6, lines: [["I came in for the gift shop.", "Is it through there?"]] },
      { sheet: "usher", x: 3, y: 3, still: true, usher: true, lines: [["Welcome!"]] }],
  },
  gallery: {"name": "Gallery One", "art": {"top": "gallery_wall_top", "upper": "gallery_wall_upper", "lower": "gallery_wall_lower", "floor": "gallery_floor"}, "map": ["###########################", "#^^^^^^^^^^^^^^^^^^^^^^^^^#", "#vvvvvvvvvvvvvvvvvvvvvvvvv#", "#.........................#", "#.........................#", "#.........................#", "#.........................#", "#.........................#", "H.........................H", "#.........................#", "#.........................#", "#.........................#", "#.........................#", "#############B#############"], "spawn": [13, 12, "up"], "spots": [2, 5, 8, 11, 14, 17, 20, 23], "cases": [[3, 6], [5, 6], [7, 6], [9, 6], [11, 6], [15, 6], [17, 6], [19, 6], [21, 6], [23, 6], [9, 10], [11, 10], [13, 10], [15, 10], [17, 10]], "stairs": [], "lightSwitch": [1, 2], "exitTo": [13, 12], "crowd": true, "floorSign": "1F", "elevatorStop": {"label": "1F  Gallery One", "order": 1, "x": 1, "y": 8, "dir": "right"}, "props": [{"key": "bench", "x": 3, "y": 10, "sit": "up", "say": ["A bench facing the first group of cases."]}, {"key": "bench", "x": 22, "y": 10, "sit": "up", "say": ["A bench facing the second group of cases."]}, {"key": "plant", "plant": "g1-plant-a", "name": "fiddle-leaf fig", "x": 1, "y": 12}, {"key": "plant", "plant": "g1-plant-b", "name": "snake plant", "x": 25, "y": 12}, {"key": "sign_stand", "x": 1, "y": 9, "say": ["ELEVATOR", "Down to Storage, up to Galleries Two and Three."]}, {"key": "sign_stand", "x": 25, "y": 9, "say": ["STAIRWELL 1F", "Through this door: stairs up to Galleries Two and Three, and down to Storage."]}, {"key": "sign_stand", "x": 12, "y": 12, "say": ["Glass cases hold Games Over Qualia episodes. Read the front, then walk around to the back.", "Paintings on the walls are community finds, with notes from guest writers."]}], "events": [{"x": 13, "y": 13, "warp": ["lobby", 7, 3, "down"]}, {"x": 0, "y": 8, "elevatorDoor": true, "bump": true}, {"x": 26, "y": 8, "warp": ["stairwell", 4, 8, "up"]}], "light": {"dim": 0.3, "spots": 0.85}, "catSpots": [[1, 11], [25, 11], [13, 8]], "mugSpots": [[12, 8], [2, 4], [20, 12]], "visitors": [{"sheet": "visitor_b", "x": 6, "y": 8, "lines": [["Walk all the way around the cases. The back is a whole different story."], ["I keep coming back to this floor."]]}, {"sheet": "visitor_c", "x": 19, "y": 8, "day": true, "lines": [["The wood frames are the community picks.", "I want mine up there someday."]]}, {"sheet": "guard", "x": 2, "y": 8, "night": true, "staff": true, "slow": true, "role": "guard", "patrol": [2, 24], "lines": [["Evening. Don't mind me, just doing my rounds."]]}]},
  shop: {
    name: "Gift Shop and Café", art: { top: "shop_wall_top", upper: "shop_wall_upper", lower: "shop_wall_lower", floor: "shop_floor" },
    map: [
      "######################",
      "#^^^^^^^^^^^^^^^^^^^^#",
      "#vvvvvvvvvvvvvvvvvvvv#",
      "#....................#",
      "#....................#",
      "H....................#",
      "#....................#",
      "#....................#",
      "#....................#",
      "#....................#",
      "#....................#",
      "######################",
    ],
    spawn: [1, 5, "right"],
    bunting: true,
    wallArt: [
      { key: "shop_shelves", x: 1, say: ["Shelves of knickknacks. A tiny ceramic frog stares back at you."] },
      { key: "shop_posters", x: 6, say: ["Posters for games that don't exist yet. You'd play all of them."] },
      { key: "shop_shelves", x: 9, say: ["More knickknacks. Somebody organized these by vibe."] },
      { key: "shop_shelves", x: 11, say: ["A shelf of snow globes. Each one has a tiny museum inside."] },
      { key: "cafe_menu", x: 15, say: ["The café menu. Coffee, tea, cocoa, and something called a \"Qualia Fog.\""] }, { key: "mug_shelf", x: 17, cafe: true }, { key: "shop_posters", x: 19, say: ["A poster that just says \"WAIT, WHY?\" in big friendly letters."] },
    ],
    decals: [{ key: "rug", x: 4, y: 6 }, { key: "rug", x: 15, y: 6 }],
    featuredAt: [8, 9],
    glows: [[1, 3], [12, 3], [20, 9], [16, 4]],
    props: [
      { key: "shelf_unit", x: 2, y: 5, unit: 0, tall: true, blockTop: true }, { key: "shelf_unit", x: 7, y: 5, unit: 1, tall: true, blockTop: true },
      { key: "shelf_unit", x: 4, y: 8, unit: 2, tall: true, blockTop: true },
      { key: "magazine_rack", x: 20, y: 7, tall: true, blockTop: true, event: { magazines: true } },
      { key: "shop_counter", x: 1, y: 9, event: { shopCounter: true } },
      { key: "floor_lamp", x: 1, y: 4, tall: true, say: ["A floor lamp with a fringed shade. Very warm, very cozy."] },
      { key: "postcard_spinner", x: 12, y: 4, tall: true, say: ["A squeaky postcard spinner. Every card is a different game."] },
      { key: "basket", x: 8, y: 3, say: ["A basket of stickers and enamel pins. None of them are for sale. They're just vibes."] },
      { key: "basket", x: 12, y: 10, say: ["A basket of tiny plush cats. One of them looks suspiciously like the real one."] },
      { key: "cat_bed", x: 9, y: 10, catBed: true, say: ["An empty cat bed. Still warm, and covered in orange fur."] },
      { key: "planter", x: 13, y: 6 }, { key: "planter", x: 13, y: 7 }, { key: "planter", x: 13, y: 8 },
      { key: "cafe_counter", x: 16, y: 4, event: { cafe: true } },
      { key: "bus_tub", x: 19, y: 4, event: { trash: true, tub: true } },
      { key: "cafe_table", x: 15, y: 7, say: ["A little café table. There's a flower in a tiny vase."] },
      { key: "cafe_stool", x: 14, y: 7, sit: "right" }, { key: "cafe_stool", x: 16, y: 7, sit: "left" },
      { key: "cafe_table", x: 19, y: 7, say: ["A little café table. Someone left a sugar packet."] },
      { key: "cafe_stool", x: 18, y: 7, sit: "right" }, { key: "cafe_stool", x: 20, y: 7, sit: "left" },
      { key: "cafe_table", x: 17, y: 9, say: ["A little café table by the lamp."] },
      { key: "cafe_stool", x: 16, y: 9, sit: "right" }, { key: "cafe_stool", x: 18, y: 9, sit: "left" },
      { key: "floor_lamp", x: 20, y: 10, tall: true, say: ["Another fringed lamp. The café's favorite."] },
      { key: "plant", plant: "shop-plant", name: "café fern", x: 20, y: 4 },
    ],
    events: [{ x: 0, y: 5, warp: ["lobby", 13, 5, "left"] }],
    light: { dim: 0.22, spots: 0.75 },
    lightSwitch: [5, 2],
    catSpots: [[9, 10], [14, 3]],
    exitTo: [1, 5], crowd: true,
    visitors: [
      { sheet: "shop_staff", x: 2, y: 10, still: true, role: "shopkeeper", lines: [["Welcome in! Browse the racks, or come to the counter."]] },
      { sheet: "shop_staff", x: 17, y: 3, still: true, role: "barista", lines: [["Coffee, tea, or cocoa? Step up to the counter."]] },
    ],
  },
  gallery2: {"name": "Gallery Two", "art": {"top": "g2_wall_top", "upper": "g2_wall_upper", "lower": "g2_wall_lower", "floor": "g2_floor"}, "map": ["#########################", "#^^^^^^^^^^^^^^^^^^^^^^^#", "#vvvvvvvvvvvvvvvvvvvvvvv#", "#.......................#", "#.......................#", "#.......................#", "H.......................H", "#.......................#", "#.......................#", "#.......................#", "#.......................#", "#.......................#", "#.......................#", "#.......................#", "#.......................#", "#.......................#", "#########################"], "spawn": [1, 6, "right"], "spots": [1, 4, 7, 10, 13, 16, 19, 22], "cases": [[7, 5], [9, 5], [11, 5], [13, 5], [15, 5], [17, 5], [8, 13], [10, 13], [12, 13], [14, 13], [16, 13], [4, 8], [4, 11], [20, 8], [20, 11]], "stairs": [], "lightSwitch": [12, 2], "exitTo": [1, 6], "crowd": true, "elevatorStop": {"label": "2F  Gallery Two", "order": 2, "x": 1, "y": 6, "dir": "right"}, "decals": [{"key": "rug", "x": 10, "y": 8}], "props": [{"key": "bench", "x": 10, "y": 10, "sit": "up", "say": ["A bench in the middle of everything."]}, {"key": "bench", "x": 13, "y": 8, "sit": "down", "say": ["A bench facing the other way. A different view."]}, {"key": "plant", "plant": "g2-plant-a", "name": "big monstera", "x": 12, "y": 9}, {"key": "plant", "plant": "g2-plant-b", "name": "trailing pothos", "x": 1, "y": 15}, {"key": "sign_stand", "x": 1, "y": 7, "say": ["ELEVATOR", "Down to Gallery One and Storage, up to Gallery Three."]}, {"key": "sign_stand", "x": 23, "y": 7, "say": ["STAIRWELL 2F", "Through this door: stairs up to Gallery Three, and down to Gallery One and Storage."]}], "events": [{"x": 0, "y": 6, "elevatorDoor": true, "bump": true}, {"x": 24, "y": 6, "warp": ["stairwell2", 4, 8, "up"]}], "light": {"dim": 0.25, "spots": 0.85}, "catSpots": [[2, 15], [12, 11]], "mugSpots": [[6, 10], [18, 10], [12, 7]], "visitors": [{"sheet": "visitor_a", "x": 7, "y": 9, "lines": [["I like sitting in the middle and just looking around."]]}, {"sheet": "visitor_b", "x": 17, "y": 10, "day": true, "lines": [["Walk all the way around the cases. The back is a whole different story."], ["I keep coming back to this floor."]]}]},
  gallery3: {"name": "Gallery Three", "art": {"top": "g3_wall_top", "upper": "g3_wall_upper", "lower": "g3_wall_lower", "floor": "g3_floor"}, "map": ["#############################", "#^^^^^^^^^^^^^^^^^^^^^^^^^^^#", "#vvvvvvvvvvvvvvvvvvvvvvvvvvv#", "#...........................#", "#...........................#", "#...........................#", "#...........................#", "#...........................#", "#...........................#", "#...........................#", "#...........................#", "H...........................H", "#...........................#", "#############################"], "spawn": [1, 11, "right"], "spots": [2, 5, 8, 11, 14, 17, 20, 23], "cases": [[2, 5], [4, 5], [3, 9], [7, 5], [9, 5], [8, 9], [12, 5], [14, 5], [13, 9], [17, 5], [19, 5], [18, 9], [22, 5], [24, 5], [23, 9]], "stairs": [], "lightSwitch": [26, 2], "exitTo": [1, 11], "crowd": true, "elevatorStop": {"label": "3F  Gallery Three", "order": 3, "x": 1, "y": 11, "dir": "right"}, "props": [{"key": "planter", "x": 5, "y": 4}, {"key": "planter", "x": 5, "y": 5}, {"key": "planter", "x": 5, "y": 6}, {"key": "planter", "x": 5, "y": 7}, {"key": "planter", "x": 5, "y": 8}, {"key": "planter", "x": 5, "y": 9}, {"key": "planter", "x": 10, "y": 4}, {"key": "planter", "x": 10, "y": 5}, {"key": "planter", "x": 10, "y": 6}, {"key": "planter", "x": 10, "y": 7}, {"key": "planter", "x": 10, "y": 8}, {"key": "planter", "x": 10, "y": 9}, {"key": "planter", "x": 15, "y": 4}, {"key": "planter", "x": 15, "y": 5}, {"key": "planter", "x": 15, "y": 6}, {"key": "planter", "x": 15, "y": 7}, {"key": "planter", "x": 15, "y": 8}, {"key": "planter", "x": 15, "y": 9}, {"key": "planter", "x": 20, "y": 4}, {"key": "planter", "x": 20, "y": 5}, {"key": "planter", "x": 20, "y": 6}, {"key": "planter", "x": 20, "y": 7}, {"key": "planter", "x": 20, "y": 8}, {"key": "planter", "x": 20, "y": 9}, {"key": "planter", "x": 25, "y": 4}, {"key": "planter", "x": 25, "y": 5}, {"key": "planter", "x": 25, "y": 6}, {"key": "planter", "x": 25, "y": 7}, {"key": "planter", "x": 25, "y": 8}, {"key": "planter", "x": 25, "y": 9}, {"key": "bench", "x": 8, "y": 12, "sit": "up", "say": ["A bench in the quiet loft."]}, {"key": "bench", "x": 18, "y": 12, "sit": "up", "say": ["Someone left a folded note here. It just says: \"stay a while.\""]}, {"key": "sign_stand", "x": 1, "y": 12, "say": ["ELEVATOR", "Back down to the other floors."]}, {"key": "sign_stand", "x": 26, "y": 11, "say": ["STAIRWELL 3F", "Through this door: stairs down to the other floors."]}], "events": [{"x": 0, "y": 11, "elevatorDoor": true, "bump": true}, {"x": 28, "y": 11, "warp": ["stairwell3", 4, 8, "up"]}], "light": {"dim": 0.38, "spots": 0.9}, "catSpots": [[27, 4], [13, 12]], "mugSpots": [[3, 11], [23, 11]], "visitors": [{"sheet": "visitor_c", "x": 13, "y": 11, "lines": [["It's so quiet up here.", "I can hear myself think about the games."]]}]},
  stairwell: {"name": "Stairwell 1F", "art": {"top": "staff_wall_top", "upper": "staff_wall_upper", "lower": "staff_wall_lower", "floor": "staff_floor"}, "map": ["#########", "#^^^^^^^#", "#vvvvvvv#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "####B####"], "spawn": [4, 8, "up"], "floorSign": "1F", "stairwell": true, "glows": [[4, 3]], "stairs": [{"x": 1, "y": 3, "kind": "up", "to": ["stairwell2", 1, 8, "right"]}, {"x": 7, "y": 8, "kind": "down", "to": ["stairwellB1", 7, 3, "left"]}], "props": [{"key": "railing", "x": 1, "y": 4}, {"key": "railing", "x": 2, "y": 4}, {"key": "railing", "x": 3, "y": 4}, {"key": "railing", "x": 4, "y": 4}, {"key": "railing", "x": 5, "y": 4}, {"key": "railing", "x": 3, "y": 6}, {"key": "railing", "x": 4, "y": 6}, {"key": "railing", "x": 5, "y": 6}, {"key": "railing", "x": 6, "y": 6}, {"key": "railing", "x": 7, "y": 6}], "events": [{"x": 4, "y": 9, "warp": ["gallery", 25, 8, "left"]}], "light": {"dim": 0.35, "spots": 0}, "visitors": []},
  stairwell2: {"name": "Stairwell 2F", "art": {"top": "staff_wall_top", "upper": "staff_wall_upper", "lower": "staff_wall_lower", "floor": "staff_floor"}, "map": ["#########", "#^^^^^^^#", "#vvvvvvv#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "####B####"], "spawn": [4, 8, "up"], "floorSign": "2F", "stairwell": true, "glows": [[4, 3]], "stairs": [{"x": 7, "y": 3, "kind": "up", "to": ["stairwell3", 7, 8, "left"]}, {"x": 1, "y": 8, "kind": "down", "to": ["stairwell", 1, 3, "right"]}], "props": [{"key": "railing", "x": 3, "y": 4}, {"key": "railing", "x": 4, "y": 4}, {"key": "railing", "x": 5, "y": 4}, {"key": "railing", "x": 6, "y": 4}, {"key": "railing", "x": 7, "y": 4}, {"key": "railing", "x": 1, "y": 6}, {"key": "railing", "x": 2, "y": 6}, {"key": "railing", "x": 3, "y": 6}, {"key": "railing", "x": 4, "y": 6}, {"key": "railing", "x": 5, "y": 6}], "events": [{"x": 4, "y": 9, "warp": ["gallery2", 23, 6, "left"]}], "light": {"dim": 0.35, "spots": 0}, "visitors": []},
  stairwell3: {"name": "Stairwell 3F", "art": {"top": "staff_wall_top", "upper": "staff_wall_upper", "lower": "staff_wall_lower", "floor": "staff_floor"}, "map": ["#########", "#^^^^^^^#", "#vvvvvvv#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "####B####"], "spawn": [4, 8, "up"], "floorSign": "3F", "stairwell": true, "glows": [[4, 3]], "stairs": [{"x": 1, "y": 3, "kind": "up", "roof": true}, {"x": 7, "y": 8, "kind": "down", "to": ["stairwell2", 7, 3, "left"]}], "props": [{"key": "railing", "x": 1, "y": 4}, {"key": "railing", "x": 2, "y": 4}, {"key": "railing", "x": 3, "y": 4}, {"key": "railing", "x": 4, "y": 4}, {"key": "railing", "x": 5, "y": 4}, {"key": "railing", "x": 3, "y": 6}, {"key": "railing", "x": 4, "y": 6}, {"key": "railing", "x": 5, "y": 6}, {"key": "railing", "x": 6, "y": 6}, {"key": "railing", "x": 7, "y": 6}], "events": [{"x": 4, "y": 9, "warp": ["gallery3", 27, 11, "left"]}], "light": {"dim": 0.35, "spots": 0}, "visitors": []},
  stairwellB1: {"name": "Stairwell B1", "art": {"top": "staff_wall_top", "upper": "staff_wall_upper", "lower": "staff_wall_lower", "floor": "staff_floor"}, "map": ["#########", "#^^^^^^^#", "#vvvvvvv#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "#.......#", "####B####"], "spawn": [4, 8, "up"], "floorSign": "B1", "stairwell": true, "glows": [[4, 3]], "stairs": [{"x": 7, "y": 3, "kind": "up", "to": ["stairwell", 7, 8, "left"]}], "props": [{"key": "railing", "x": 3, "y": 4}, {"key": "railing", "x": 4, "y": 4}, {"key": "railing", "x": 5, "y": 4}, {"key": "railing", "x": 6, "y": 4}, {"key": "railing", "x": 7, "y": 4}], "events": [{"x": 4, "y": 9, "warp": ["storage", 13, 5, "left"]}], "light": {"dim": 0.35, "spots": 0}, "visitors": []},
  storage: {
    name: "B1  Storage", art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "staff_floor" },
    map: [
      "###############",
      "#^^^^^^^^^^^^^#",
      "#vvvvvvvvvvvvv#",
      "#.............#",
      "#.............#",
      "H.............H",
      "#.............#",
      "#.............#",
      "#.............#",
      "###############",
    ],
    spawn: [7, 4, "down"],
    stairs: [],
    elevatorStop: { label: "B1  Storage", order: 0, x: 1, y: 5, dir: "right" },
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
    events: [{ x: 0, y: 5, elevatorDoor: true, bump: true }, { x: 14, y: 5, warp: ["stairwellB1", 4, 8, "up"] }],
    light: { dim: 0.35, spots: 0 },
    catSpots: [[12, 6]],
    visitors: [{ sheet: "shop_staff", x: 7, y: 7, still: true, staff: true, role: "conservator", lines: [
      ["I'm the conservator. These games came in without instructions.", "I'm figuring out what they wanted to be."],
      ["The boxes over there? Abandoned mechanics.", "There are no bad mechanics. Just ones that haven't found the right game yet."]] }],
  },
  elevator: {
    name: "Elevator", art: { top: "staff_wall_top", upper: "staff_wall_upper", lower: "staff_wall_lower", floor: "lobby_floor" },
    map: [
      "#######",
      "#^^^^^#",
      "#vvvvv#",
      "#.....#",
      "#.....#",
      "#.....#",
      "###B###",
    ],
    spawn: [3, 5, "up"],
    elevatorPanel: [5, 2],
    events: [{ x: 3, y: 6, elevatorExit: true, bump: true }],
    light: { dim: 0.05, spots: 0 },
    visitors: [],
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
};

/* ---------- Words ----------
   Every line the museum says (that isn't already part of a piece, a room or a shop item) lives here, so the curator's Words tab can change it.
   Each entry is a list of variants; each variant is a list of pages. When there are several variants, they take turns (or one is picked at random).
   Placeholders: {name} (who's clocked in, or "friend"), {cat}, {catRoom}, {title}, {date}, {drink}, {n}, {room}, {hint}, {floor}, {locker}. */
const TEXT = {
  "case.empty":        { g: "Pieces", l: "Empty display case", v: [["An empty display case, waiting for a game."]] },
  "case.covered":      { g: "Pieces", l: "Case under a cloth (unveiling soon)", v: [["Something is under a cloth in this case.", "The card says it will be unveiled on {date}."]] },
  "painting.covered":  { g: "Pieces", l: "Painting under a sheet (unveiling soon)", v: [["Something is hanging under a sheet.", "The card says it will be unveiled on {date}."]] },
  "case.ends":         { g: "Pieces", l: "Reading a case from the side", v: [["The placards are on the front and the back. Walk around to read them."]] },
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
  "stairs.roof":       { g: "Floors", l: "Roof stairs in the top stairwell", v: [["I don't need to go to the roof."]] },
  "move.ok":           { g: "Visitors", l: "A visitor stepping aside when you ask (one at random)", v: [["Oh! Sorry, go ahead."], ["My bad. All yours."], ["Oops, didn't see you there."]] },
  "move.stuck":        { g: "Visitors", l: "A boxed-in visitor, before they teleport (one at random)", v: [["Oh, I'd love to, but I'm a little stuck..."], ["Move? Where? There's nowhere to... oh."]] },
  "move.teleport":     { g: "Visitors", l: "You, after a boxed-in visitor teleports away (one at random)", v: [["...Did they just teleport?", "I'm going to pretend I didn't see that."], ["They're gone. Just gone.", "I should ask the curator what's in the coffee here."], ["*blink*", "Okay. Sure. People can just do that here, apparently."], ["Huh. I've played games with worse pathfinding."]] },
  "stairwell":         { g: "Floors", l: "Stairwell oddities (one at random)", v: [["You hear footsteps one floor up.", "Nobody's there."], ["A paper airplane is sitting on the landing.", "Written on the wing: WAIT, WHY?"], ["The light flickers twice.", "Politely."], ["Someone drew a tiny door on the wall in pencil.", "It's slightly ajar."], ["Faint elevator music is coming from... the stairwell?"], ["A pigeon. Inside.", "It looks at you like you're the strange one."], ["There's a sticky note on the railing: \"Count the steps going up. Then going down.\""], ["For a second, you could swear there was one more floor."]] },
  "elevator.ride":     { g: "Floors", l: "Elevator arriving", v: [["*whirrrr*", "*ding* {floor}."]] },
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
  "rules":             { g: "Staff", l: "Staff rules whiteboard", v: [["STAFF RULES", "1. Clock in at the staff door or the time clock. The ON SHIFT tag means you're working.", "2. On shift, every chore is a point: dusting, straightening, watering, finding the mug, wiping cases. Helping a lost visitor is worth 3.", "3. Chores earn tokens for the gift shop, and staff tallies decide Employee of the Month.", "4. Clock out at the time clock. Leaving at closing clocks you out too.", "5. Do not touch anyone's yogurt."]] },
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
  "help.ask":          { g: "Lost visitors", l: "They describe what they're looking for", v: [["Oh, thank you! I'm looking for {hint}.", "If you find it, could you snap a photo so I know it's the right one? (Press B to take a photo.)"]] },
  "help.right":        { g: "Lost visitors", l: "Showing the right photo", v: [["That's the one! Thank you so much.", "I'm going to go look at it right now."]] },
  "help.wrong":        { g: "Lost visitors", l: "Showing the wrong photo", v: [["Hmm, that's not it.", "I'm looking for {hint}."]] },
  "help.after":        { g: "Lost visitors", l: "Talking to them at their piece", v: [["I'm so glad I found this one."], ["Thanks again for helping me find it."]] },
  "pc.on":             { g: "Floors", l: "Turning on Someone's PC", v: [["You turned on Someone's PC.", "Accessed the museum archive."]] },
  "pc.empty":          { g: "Floors", l: "The archive is empty", v: [["The archive is empty.", "Every piece is on display right now."]] },
  "mag.1":             { g: "Magazines", l: "Magazine 1 (first line is the title; each line after is a paragraph)", v: [["Pixel Monthly", "This month: why every menu in a cozy game should make a little sound when you open it. We asked twelve players. Eleven said yes. The twelfth asked what a menu was.", "Also inside: the case for walking slower. Games that let you stroll tend to get remembered as places, not as tasks. Something to think about next time a game hands you a sprint button."]] },
  "mag.2":             { g: "Magazines", l: "Magazine 2", v: [["Curator's Digest", "Ten things museum staff wish visitors knew. Number one: the backs of the display cases are not the boring side. Number four: the cat is not an exhibit, but she does accept compliments.", "Letters page: a reader asks whether there are bad mechanics. Our editor replies that there are only mechanics in the wrong game, and then goes back to wiping fingerprints off the glass."]] },
  "mag.3":             { g: "Magazines", l: "Magazine 3 (holds the secret shirt riddle)", v: [["Thread Count Quarterly", "FASHION: THE SHIRT THAT GOT AWAY. Years ago the museum shop sold a GOQ shirt. Then, one day, it didn't. The shopkeeper won't say why. But the shopkeeper still has one, and rumor says it goes to whoever proves they've lived the full museum day, in order:", "First, something sweet and brown from the café. Drink it all, sitting on a stool, not a bench. Throw the cup out by the front doors, not in the tub. Give a plant a drink of its own. Photograph the cat. Ride the elevator all the way down, and wake up the old PC. Climb the first stairwell to the second floor. Sleep on a bench up there. Then visit the shopkeeper and just chat. Three times. In a row.", "Do it out of order, and you'll have to start over. The shopkeeper notices everything."]] },
  "mag.4":             { g: "Magazines", l: "Magazine 4", v: [["Café Society", "A field guide to museum café seating. The stool by the lamp is for people who are about to have an idea. The stool by the window is for people who already had one. The bench in the gallery is for people who need a nap first.", "Recipe corner: cocoa, but you stare at a painting while it cools."]] },
  "mag.intro":         { g: "Magazines", l: "Magazine stand question", v: [["A rack of magazines. Read one?"]] },
  "shirt.tease":       { g: "Secret shirt", l: "The discontinued shirt in the shop menu", v: [["DISCONTINUED. The GOQ shirt. We don't sell these anymore. Don't ask. (People ask.)"]] },
  "shirt.owned":       { g: "Secret shirt", l: "The shirt in the shop menu once you have it", v: [["Yours now. The shopkeeper pretends not to remember giving it to you."]] },
  "shirt.reveal":      { g: "Secret shirt", l: "The shopkeeper hands over the shirt", v: [["...", "You did the whole thing, didn't you. The cocoa. The stool. The trash can. The nap.", "Fine. FINE. Here.", "You got the GOQ shirt! Wear it from the Start menu, under Wardrobe."]] },
  "quiz.stop":         { g: "Quiz card", l: "The usher calls out the first time you head for a door", v: [["Hey! Wait up!"]] },
  "quiz.intro":        { g: "Quiz card", l: "The usher hands you your first quiz card", v: [["Before you head in, here's a quiz card.", "Read the placards. When you're ready, come find me and I'll quiz you on five games you've read.", "Every right answer gets a stamp. A full card is good for one fancy drink at the café.", "Answer questions about the episode video or the game's store page instead, and you get super stamps. Five super stamps get you any item in the gift shop.", "Each card only works once. Have fun!"]] },
  "quiz.got":          { g: "Quiz card", l: "Notice: you got a quiz card", v: [["Got a quiz card!"]] },
  "quiz.ask":          { g: "Quiz card", l: "Usher, asking what you'd like", v: [["What can I do for you?"]] },
  "quiz.howto":        { g: "Quiz card", l: "Quiz card, not full yet (shown on the card)", v: [["Read placards, then ask the usher to quiz you on five games you've read. One stamp per right answer. Questions about the episode video or the store page give super stamps. Miss one? Take another look at that game and come back."]] },
  "quiz.full":         { g: "Quiz card", l: "Quiz card, full (shown on the card)", v: [["Your card is full! Trade it at the café for one fancy drink."]] },
  "quiz.superFull":    { g: "Quiz card", l: "Quiz card, all super (shown on the card)", v: [["Five super stamps! Trade it at the gift shop for any one item, or at the café for a fancy drink. A card only works once."]] },
  "quiz.tooFew":       { g: "Quiz card", l: "Not enough games read yet ({n} read so far)", v: [["You've read {n} of the games so far. Read at least five (both sides of a case, or a painting's note), then come back and I'll quiz you."]] },
  "quiz.pickIntro":    { g: "Quiz card", l: "Before picking five games", v: [["Which five games do you want to talk about? These are the ones you've read.", "Games with a star have super questions, about the video or the store page."]] },
  "quiz.kind":         { g: "Quiz card", l: "Question: regular or super questions", v: [["Regular questions are about the placards. Super questions are about the episode video or the game's store page. Which kind?"]] },
  "quiz.right":        { g: "Quiz card", l: "A right answer (one at random)", v: [["That's right! Stamp."], ["Correct! *ka-chunk*"], ["Yep! Here's your stamp."]] },
  "quiz.rightSuper":   { g: "Quiz card", l: "A right answer to a super question (one at random)", v: [["You really watched it! Super stamp."], ["That's right! *KA-CHUNK* Super stamp."]] },
  "quiz.wrong":        { g: "Quiz card", l: "A wrong answer ({title})", v: [["Not quite.", "Take another look at {title}, and I'll ask you something different about it next time."]] },
  "quiz.done":         { g: "Quiz card", l: "End of a quiz ({n} new stamps)", v: [["That's the quiz! New stamps: {n}."]] },
  "quiz.locked":       { g: "Quiz card", l: "Every open question needs another look first", v: [["Go take another look at the games you missed, then come back and I'll ask you something new."]] },
  "quiz.isFull":       { g: "Quiz card", l: "Asking for a quiz with a full card", v: [["Your card's full! Spend it at the café for a fancy drink.", "If it's all super stamps, the gift shop will take it for any item too."]] },
  "quiz.spent":        { g: "Quiz card", l: "After spending a card ({title} is what you got)", v: [["*punch* That card's spent. Enjoy your {title}!", "Here's a fresh quiz card."]] },
  "quiz.spendSuper":   { g: "Quiz card", l: "Warning: using a super card on a drink", v: [["That's a super card. It could get you any item in the gift shop.", "Use it on a drink anyway? Cards only work once."]] },
  "quiz.noPrizes":     { g: "Quiz card", l: "Super card, but you already own every item", v: [["You already have everything in the shop. The shopkeeper is impressed and a little worried."]] },
  "respawn.quip":      { g: "Menu", l: "After respawning (one at random)", v: [["*bzzt*", "...Did you see that? I just teleported.", "Let's not tell the curator."], ["Okay, so, I can do that now, apparently.", "Don't think about it too hard. I'm not going to."], ["Whoa. Head rush.", "If anyone asks, I took the stairs."]] },
  "respawn.no":        { g: "Menu", l: "Respawn after closing", v: [["Teleporting around an empty, dark museum? Hard pass."]] },
  "fridge":            { g: "Staff", l: "The staff fridge (one at random)", v: [["A note on the fridge: LABEL YOUR FOOD.", "Below it, a yogurt labeled NOT YOURS. Underlined twice."], ["Inside: three condiments, one sad lemon, and a sandwich older than some of the exhibits."], ["A drawing on the fridge door: the cat, rendered lovingly in crayon."]] },
  "microwave.ask":     { g: "Staff", l: "Microwave question", v: [["The staff microwave. Heat up someone's lunch?"]] },
  "microwave.boom":    { g: "Staff", l: "The microwave goes off (one at random)", v: [["*mmmm-mm-BWOMP*", "Whatever was in there has achieved a resonance cascade.", "The door is still closed. Nobody needs to know."], ["*BANG*", "That was a burrito. It is now a burrito-shaped memory.", "Someone, somewhere, felt that."]] },
  "microwave.after":   { g: "Staff", l: "Microwave after the incident", v: [["The inside of the microwave is a crime scene.", "Nobody is going to clean that today."]] },
  "patrons.intro":     { g: "Lobby", l: "Patron Board, before the names", v: [["Games Over Qualia is made possible by these wonderful people. Some of them are probably in the museum right now."]] },
  "patrons.empty":     { g: "Lobby", l: "Patron Board with no names yet", v: [["The Patron Board. The name plates are polished and waiting."]] },
  "photos.none":       { g: "Menu", l: "Photo album, empty", v: [["No photos yet.", "Press B to take a photo of whatever's in front of you."]] },
  "menu.saved":        { g: "Menu", l: "After saving", v: [["Saved. You'll pick up right here next time."]] },
};
/* Staff you can chat with. Each line has up to two conditions; a chat plays one matching line, taking turns.
   The curator's Words tab edits these. */
const TALK_ROLES = { usher: "Usher (front desk)", shopkeeper: "Shopkeeper", barista: "Barista", conservator: "Conservator (storage)", guard: "Night guard" };
const TALK_WHEN = { always: "Any time", visitor: "You're a visitor (not clocked in)", staff: "You're on shift", day: "Daytime", sunset: "Sunset", night: "Night",
  slow: "Slow day", medium: "Medium day", heavy: "Busy day", reveal: "Reveal day", closing: "After the closing announcement", drink: "You're holding a drink",
  photos: "You've taken photos", helped: "You've helped a lost visitor", cat: "The cat is in this room", shirt: "You're wearing the GOQ shirt (always wins)" };
const TALK_DEFAULTS = {
  usher: [
    { when: ["shirt"], v: [["Welcome to the GOQ... oh my gosh. Is that THE shirt?", "Can I... can I touch the sleeve? No. Sorry. Professionalism."], ["Everyone on staff has been talking about your shirt.", "Some of us are not handling it well."]] },
    { when: ["visitor", "slow"], v: [["Welcome to the GOQ Museum! It's quiet today. You've got the place to yourself."]] },
    { when: ["visitor", "medium"], v: [["Welcome to the GOQ Museum! A nice steady crowd today."]] },
    { when: ["visitor", "heavy"], v: [["Welcome to the GOQ Museum! We're busy today. Take your time."]] },
    { when: ["visitor", "reveal"], v: [["Welcome! Big day today: something new is being unveiled!"]] },
    { when: ["visitor"], v: [["The elevator and the stairs are through Gallery One."], ["The gift shop and café are through the door on the right."], ["Read both sides of the glass cases. It's worth it."], ["If you see someone who looks lost, they might need a hand."]] },
    { when: ["staff"], v: [["Hey, {name}! Good to see you on shift."], ["{cat} is napping in {catRoom} today."], ["Someone left fingerprints on every case again."], ["Don't forget to clock out before you head home."]] },
    { when: ["staff", "heavy"], v: [["Packed today, {name}. Hope you brought your walking shoes."]] },
    { when: ["staff", "reveal"], v: [["It's reveal day. We're slammed!"]] },
    { when: ["closing"], v: [["We're closed for the night. Goodnight!"]] },
  ],
  shopkeeper: [{ when: ["shirt"], v: [["Oh. You're wearing it. In MY shop.", "I'm fine. This is fine."], ["People keep coming in asking where you got that.", "I tell them we're out. Because we are. Because of you."]] }, { when: ["always"], v: [["Everything on the shelves is one of a kind. Well, one of a few."], ["The featured item? The curator picks it. Don't ask me why."], ["The GOQ shirt? We don't sell those anymore.", "...Who told you about the shirt?"]] }, { when: ["staff"], v: [["Staff discount? Nice try, {name}."]] }],
  barista: [{ when: ["shirt"], v: [["Hold on, I'm going to write your name on the cup in really nice handwriting.", "For the shirt."], ["I'd trade every espresso machine in this building for that shirt.", "Don't tell the espresso machine."]] }, { when: ["always"], v: [["The curator? Always leaving their mug around. It's one of ours, you know."], ["Best seat's by the lamp. Don't tell anyone."]] }, { when: ["drink"], v: [["How's the {drink}?"]] }],
  conservator: [{ when: ["shirt"], v: [["A first-run GOQ shirt. In the wild.", "Please never wash it. I'm begging you, from a preservation standpoint."]] }, { when: ["always"], v: [["I'm the conservator. These games came in without instructions.", "I'm figuring out what they wanted to be."], ["The boxes over there? Abandoned mechanics.", "There are no bad mechanics. Just ones that haven't found the right game yet."]] }],
  guard: [{ when: ["shirt"], v: [["Is that... the GOQ shirt?", "I've worked nights here for six years and I've never even SEEN one."], ["Don't mind me. Just guarding the shirt now. I mean the museum."]] }, { when: ["always"], v: [["Evening. Don't mind me, just doing my rounds."], ["Funny thing about this place at night.", "Sometimes the intercom crackles when nobody's touching it."], ["If you see a pair of eyes in the dark...", "That's not me. I'd have said hello."]] }, { when: ["closing"], v: [["Everyone's gone. Just us and the art now."]] }],
};

/* ---------- Achievements ----------
   Pure data: each one is a name, a description, one of these stats and a target. The curator's Achievements tab edits them. */
const ACH_STATS = {
  dusted: "Frames dusted", straightened: "Frames straightened", watered: "Plants watered", mugs: "Mugs found", wiped: "Cases wiped",
  helped: "Lost visitors helped", pets: "Times petting the cat", closings: "Times closing the museum", photos: "Photos taken",
  bothSides: "Cases read on both sides", stamps: "Quiz stamps earned", supers: "Super stamps earned", cards: "Quiz cards spent", items: "Gift shop items owned",
  drinks: "Drinks ordered", naps: "Bench naps", rooms: "Different rooms visited", microwave: "Microwave incidents", segway: "Segway rides",
  shirt: "Has the GOQ shirt (1 = yes)", shifts: "Times clocking in",
};
const SAMPLE_ACH = [
  { id: "first-dust", name: "Elbow Grease", desc: "Dust a frame for the first time.", stat: "dusted", target: 1 },
  { id: "helper", name: "Right This Way", desc: "Help 5 lost visitors find their piece.", stat: "helped", target: 5 },
  { id: "both-sides", name: "Both Sides Now", desc: "Read both sides of 10 display cases.", stat: "bothSides", target: 10 },
  { id: "cat", name: "Cat Person", desc: "Pet the cat 10 times.", stat: "pets", target: 10 },
  { id: "explorer", name: "Wayfinder", desc: "Visit every room in the museum.", stat: "rooms", target: 10 },
  { id: "closer", name: "Lights Out", desc: "Close the museum for the night.", stat: "closings", target: 1 },
  { id: "card", name: "Punch Card Pro", desc: "Spend a full quiz card.", stat: "cards", target: 1 },
  { id: "resonance", name: "Resonance Cascade", desc: "Use the staff microwave.", stat: "microwave", target: 1, secret: true },
  { id: "zoom", name: "Up Up Down Down", desc: "Find the Segway.", stat: "segway", target: 1, secret: true },
  { id: "shirt", name: "The Shirt That Got Away", desc: "Get the discontinued GOQ shirt.", stat: "shirt", target: 1, secret: true },
];
/* Things the day's extra visitors say. */
const SHIRT_STEPS = ["cocoa", "finishOnStool", "lobbyTrash", "water", "catPhoto", "elevatorB1", "pc", "stairsTo2F", "nap2F", "chat", "chat", "chat"];
const KONAMI = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];
const REDUCED_MOTION = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const BROWSE_LINES = [["Hmm. Hmm hmm hmm."], ["Should I get the mug? I should get the mug.", "...Or the tote."], ["I've been standing here a while.", "I'm very close to deciding."], ["Don't rush me. This is a big decision."]];
const SIT_LINES = [["Best seat in the house."], ["I come here for the café. The art is a bonus."], ["Shh. I'm people-watching."]];
const CROWD_LINES = [["What a nice museum."], ["I come here on my lunch break."], ["Have you seen the cat today?"], ["I always read both sides of the cases."],
  ["My friend told me about this place."], ["Honestly, I'm mostly here for the café."], ["Is it me, or is it busy today?"], ["I didn't know games could go in museums."],
  ["I've been standing here a while.", "I think I get it now. Maybe."], ["The elevator music is a choice."]];
/* Extra dimness per room after dark, on top of the room's own lighting. */
const NIGHT_DIM = { lobby: 0.2, gallery: 0.12, shop: 0.15, staff: 0.08, gallery2: 0.15, gallery3: 0.15, stairwell: 0.1, stairwell2: 0.1, stairwell3: 0.1, stairwellB1: 0.1, storage: 0.05, elevator: 0 };
/* A pristine copy of the built-in rooms. A pack's "rooms" replaces any of these or adds new ones;
   the level editor in curator.html writes them. Rooms are plain data, so a deep copy is enough. */
const BUILTIN_ROOMS = JSON.parse(JSON.stringify(ROOMS));
const ROOM_KEYS = ["name", "art", "map", "spawn", "props", "events", "visitors", "light", "spots", "cases", "elevatorStop", "elevatorPanel", "stairwell", "stairs", "crowd", "floorSign", "windowAt", "intercom", "lightSwitch", "eotmAt",
  "lockers", "corkboardAt", "leaderboardAt", "timeClock", "featuredAt", "wallArt", "decals", "glows", "bunting", "catSpots", "mugSpots", "exitTo"];
/* Light checks so a hand-edited or damaged pack can't break the game: rectangular map, sane size, a spawn on the map. */
function normalizeRoom(id, d) {
  if (!d || typeof d !== "object" || !Array.isArray(d.map) || !d.map.length) return null;
  const h = Math.min(24, Math.max(6, d.map.length)), w = Math.min(48, Math.max(6, String(d.map[0]).length));
  const map = []; for (let y = 0; y < h; y++) map.push(String(d.map[y] || "").padEnd(w, "#").slice(0, w).replace(/[^#^v.=DdSsEBH]/g, "."));
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
const DIRS_LIST = ["up", "down", "left", "right"];
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
const MAP_TILE = { "#": ["top"], "^": ["upper"], "v": ["lower"], ".": ["floor"], "=": ["runner"],
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
  for (const k in r.events) { const e = r.events[k]; if (e.warp || e.bump || e.step || e.elevatorDoor || e.frontDoor) { const [x, y] = k.split(",").map(Number); add(x, y); } }
  for (const st of r.stairs || []) add(st.x, st.y);
  add(def.spawn[0], def.spawn[1]);
  return out;
}
function safeSpots(r, def) {
  const W = r.w, H = r.h, avoid = new Set(), key = (x, y) => x + "," + y;
  for (const k in r.events) { const [x, y] = k.split(",").map(Number); for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) avoid.add(key(x + dx, y + dy)); }
  for (const c of r.cases || []) { avoid.add(key(c.x, c.y - 1)); avoid.add(key(c.x, c.y + 1)); }
  for (const h of r.hung || []) { avoid.add(key(h.x, 3)); avoid.add(key(h.x + 1, 3)); }
  for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) avoid.add(key(def.spawn[0] + dx, def.spawn[1] + dy));
  for (const st of r.stairs || []) for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) avoid.add(key(st.x + dx, st.y + dy));
  // Staff who stand still count as obstacles while checking.
  const fixed = (def.visitors || []).filter(v => (v.still || v.usher || v.role) && !v.patrol && r.solid[v.y] && !r.solid[v.y][v.x]);
  fixed.forEach(v => (r.solid[v.y][v.x] = true));
  safeSpots.lastAvoid = avoid;
  const cands = [];
  for (let y = 3; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!r.solid[y][x] && !avoid.has(key(x, y))) cands.push([x, y]);
  // Keep a spot only if blocking it leaves all remaining open floor connected.
  const connected = () => {
    let start = null, total = 0;
    for (let y = 3; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!r.solid[y][x]) { total++; if (!start) start = [x, y]; }
    if (!start) return true;
    const seen = new Set([key(...start)]), q = [start];
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (ny >= 3 && ny < H - 1 && nx >= 1 && nx < W - 1 && !r.solid[ny][nx] && !seen.has(k)) { seen.add(k); q.push([nx, ny]); } } }
    return seen.size === total;
  };
  const out = [];
  for (let i = cands.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]]; }
  for (const [x, y] of cands) {
    if (out.length >= 40) break;
    r.solid[y][x] = true;
    if (connected()) out.push([x, y]); else r.solid[y][x] = false;
  }
  for (const [x, y] of out) r.solid[y][x] = false;
  fixed.forEach(v => (r.solid[v.y][v.x] = false));
  return out;
}
function buildRoom(id, pieces, o) {
  const def = ROOMS[id], h = def.map.length, w = def.map[0].length;
  const r = { id, name: def.name, w, h, tiles: mk(w, h, null), over: mk(w, h, null), solid: mk(w, h, false), events: {}, props: [], hung: [], npcs: [] };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = def.map[y][x], m = MAP_TILE[ch] || ["floor"];
    r.tiles[y][x] = def.art[m[0]] || def.art.floor; r.over[y][x] = m[1] || null;
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
      else if (p.key === "front_desk" && i === 1) r.events[(p.x + i) + "," + p.y] = { usher: true };
      else if (p.event) { r.events[(p.x + i) + "," + p.y] = Object.assign({}, p.event); if (p.tall && p.blockTop) r.events[(p.x + i) + "," + (p.y - 1)] = Object.assign({}, p.event); }
      else if (p.say) r.events[(p.x + i) + "," + p.y] = { say: p.say };
    }
  });
  if (def.lightSwitch) { const [x, y] = def.lightSwitch; r.switchAt = { x, y }; r.events[x + "," + y] = { lights: true }; }
  if (def.lockers) def.lockers.forEach((x, i) => { r.events[x + ",2"] = { locker: i }; });
  if (def.corkboardAt) { const [x] = def.corkboardAt; r.corkAt = { x, y: 1 }; r.events[x + ",2"] = r.events[(x + 1) + ",2"] = { corkboard: true }; }
  if (def.leaderboardAt) { const [x] = def.leaderboardAt; r.boardAt = { x, y: 1 }; r.events[x + ",2"] = r.events[(x + 1) + ",2"] = { leaderboard: true }; }
  if (def.timeClock) { const [x, y] = def.timeClock; r.clockAt = { x, y }; r.events[x + "," + y] = { timeClock: true }; }
  if (def.eotmAt) r.eotmAt = { x: def.eotmAt[0], y: def.eotmAt[1] };
  if (def.elevatorPanel) { const [x, y] = def.elevatorPanel; r.panelAt = { x, y }; r.events[x + "," + y] = { elevatorPanel: true }; }
  if (def.intercom) { const [x, y] = def.intercom; r.intercomAt = { x, y }; r.events[x + "," + y] = { announce: true }; }
  if (def.wallArt) {
    r.wallArt = def.wallArt;
    def.wallArt.forEach(w => { for (let i = 0; i < SLOT[w.key].w / T; i++) r.events[(w.x + i) + ",2"] = w.cafe && w.key !== "cafe_menu" ? { cafe: true } : { say: w.say || ["The café menu."] }; });
  }
  r.decals = def.decals || []; r.glows = def.glows || []; r.bunting = !!def.bunting;
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
  (def.spots || []).forEach((x, i) => {
    const p = o.community[(o.spotStart[id] || 0) + i]; if (!p) return;
    const spot = { x, y: 1, piece: p, state: spotState(p, o) };
    r.hung.push(spot);
    r.events[x + ",2"] = r.events[(x + 1) + ",2"] = { spot };
  });
  r.cases = [];
  (def.cases || []).forEach(([x, y], i) => {
    if (!r.solid[y]) return;
    r.solid[y][x] = true;
    const p = o.episodes[(o.caseStart[id] || 0) + i];
    const c = { x, y, piece: p || null, state: p ? spotState(p, o) : "empty", isCase: true };
    r.cases.push(c); r.events[x + "," + y] = { caseAt: c };
  });
  (def.events || []).forEach(e => (r.events[e.x + "," + e.y] = Object.assign({ bump: !!e.warp }, e)));
  if (def.windowAt) r.windowAt = { x: def.windowAt[0], y: def.windowAt[1] };
  r.stairs = [];
  (def.stairs || []).forEach(st => {
    if (!r.solid[st.y]) return;
    r.stairs.push(st); r.solid[st.y][st.x] = false;
    if (st.roof) { r.solid[st.y][st.x] = true; r.events[st.x + "," + st.y] = { roofStairs: true, bump: true }; }
    else if (st.to) r.events[st.x + "," + st.y] = { warp: st.to, step: true };
  });
  // A crowd: extra visitors on medium and heavy days (more on reveal days, fewer at night), placed on free floor.
  const extra = [];
  // How many people: a gallery holds at most 5 (3 on medium days), the lobby at most 1, counting visitors placed in the editor.
  // The shop is special (below). Nights are quieter.
  const wanderers = (def.visitors || []).filter(v => !(v.still || v.staff || v.patrol || v.usher || v.role) && (!v.day || o.tod !== "night") && (!v.night || o.tod === "night")).length;
  const isGallery = (def.cases || []).length || (def.spots || []).length, isShop = (def.props || []).some(p => p.key === "shop_counter" || p.key === "cafe_counter");
  const someone = () => ({ sheet: ["visitor_a", "visitor_b", "visitor_c"][Math.floor(Math.random() * 3)], x: 0, y: 0, random: true, lines: [CROWD_LINES[Math.floor(Math.random() * CROWD_LINES.length)]] });
  if (def.crowd && !o.closing && !isShop) {
    let cap = isGallery ? (o.crowd === "heavy" ? 5 : 3) : 1;
    if (o.tod === "night") cap = Math.ceil(cap / 2);
    for (let i = 0; i < cap - wanderers; i++) extra.push(someone());
  }
  // Wandering visitors (not staff) start somewhere random each time: never on a doorway, a case's front or back,
  // in front of a painting, beside the start spot, or anywhere that would cut one part of the room off from another.
  const okSpots = safeSpots(r, def);
  r.noWander = noWanderTiles(id, r, def);
  (def.visitors || []).concat(extra).forEach(v => { delete v._x; delete v._y; });
  (def.visitors || []).concat(extra).forEach(v => {
    if (v.still || v.staff || v.patrol || v.usher || v.role) return;
    const placed = (def.visitors || []).concat(extra).filter(o => o._x !== undefined && o !== v);
    const spread = okSpots.filter(([x, y]) => placed.every(o => Math.abs(o._x - x) + Math.abs(o._y - y) >= 3));
    const from = spread.length ? spread : okSpots, pick = from.length ? from[Math.floor(Math.random() * from.length)] : null;
    if (pick) { okSpots.splice(okSpots.indexOf(pick), 1); v._x = pick[0]; v._y = pick[1]; r.solid[pick[1]][pick[0]] = true; }
  });
  (def.visitors || []).concat(extra).forEach(v => { if (v._x !== undefined) r.solid[v._y][v._x] = false; });
  // The shop: one person frozen in front of a decorative wall shelf, forever deciding; in the café, one sitting on a
  // random stool and (on busy days) one wandering near the café.
  if (def.crowd && !o.closing && isShop && o.tod !== "night") {
    const free = (x, y) => r.solid[y] && !r.solid[y][x] && !r.events[x + "," + y] && !extra.some(v => v._x === x && v._y === y);
    const cafeX = Math.min(...(def.props || []).filter(p => /^cafe_/.test(p.key)).map(p => p.x).concat([r.w]));
    const shelves = (def.wallArt || []).filter(w => w.key === "shop_shelves" && w.x < cafeX - 2), spots = [];
    shelves.forEach(w => { for (let i = 0; i < SLOT[w.key].w / T; i++) if (free(w.x + i, 3)) spots.push([w.x + i, 3]); });
    if (spots.length) { const [x, y] = spots[Math.floor(Math.random() * spots.length)]; extra.push(Object.assign(someone(), { _x: x, _y: y, still: true, dir: "up", lines: BROWSE_LINES })); }
    const stools = (def.props || []).filter(p => p.key === "cafe_stool" && p.sit);
    if (stools.length) { const st = stools[Math.floor(Math.random() * stools.length)]; extra.push(Object.assign(someone(), { _x: st.x, _y: st.y, still: true, sitting: true, dir: st.sit, lines: SIT_LINES })); }
    if (o.crowd === "heavy") {
      let cands = okSpots.filter(([x]) => x >= cafeX - 1);
      if (!cands.length) for (let y = 3; y < r.h - 1; y++) for (let x = cafeX - 1; x < r.w - 1; x++) if (free(x, y) && !(r.noWander && r.noWander.has(x + "," + y))) cands.push([x, y]);
      if (!cands.length) for (let y = 3; y < r.h - 1; y++) for (let x = cafeX - 1; x < r.w - 1; x++) if (free(x, y)) cands.push([x, y]);
      if (cands.length) { const [x, y] = cands[Math.floor(Math.random() * cands.length)]; extra.push(Object.assign(someone(), { _x: x, _y: y })); }
    }
  }
  const who = (def.visitors || []).concat(extra).filter(v => (!v.day || o.tod !== "night") && (!v.night || o.tod === "night") && (!o.closing || v.staff));
  r.npcs = who.filter(v => !v.random || v._x !== undefined).map(v => ({ sitting: !!v.sitting, still: v.still, staff: v.staff, patrol: v.patrol, usher: v.usher, role: v.role || (v.usher ? "usher" : undefined), slow: v.slow, goRight: true, pause: 0, stuck: 0,
    sheet: v.sheet, x: v._x !== undefined ? v._x : v.x, y: v._y !== undefined ? v._y : v.y, dir: DIRS_LIST.includes(v.dir) ? v.dir : "down", moving: false, prog: 0, step: false, bumpT: 0, timer: 60 + Math.random() * 120, lines: v.lines, lineI: -1,
    random: !!v.random, box: { x0: Math.max(1, v.x - 2), y0: 3, x1: Math.min(w - 2, v.x + 2), y1: h - 2 },
  }));
  return r;
}

/* ---------- Game ---------- */
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: "down", down: "up", left: "right", right: "left" };
const KEYMAP = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  KeyZ: "a", Space: "a", KeyJ: "a", KeyX: "b", Escape: "b", Backspace: "b", KeyK: "b", Enter: "start", KeyP: "start" };

class Game {
  constructor(wrap, pack, opts) {
    opts = opts || {};
    this.curator = !!opts.curator; this.capture = opts.capture || "always"; this.hungNow = new Set();
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
    if (w && this.rooms[w.room] && !this.rooms[w.room].solid[w.y][w.x]) this.enterRoom(w.room, w.x, w.y, w.dir, true);
    else { const sp = ROOMS.lobby.spawn; this.enterRoom("lobby", sp[0], sp[1], sp[2], true); }
    this.ready = this.setPack(pack); this.updateHud();
    setTimeout(() => this.showLoc("GOQ Museum: " + this.room.name), 400);
    this.last = performance.now(); this.acc = 0;
    const tick = now => {
      this.acc += Math.min(100, now - this.last); this.last = now;
      while (this.acc >= 1000 / 60) { this.update(); this.acc -= 1000 / 60; }
      this.draw(); requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  /* fine: quarter steps (touch layouts); otherwise whole steps from 2x up, like the Theater. Never below 1x unless the screen is narrower than the game. */
  fit(maxW, maxH, fine) {
    let s = Math.min(maxW / SW, maxH / SH);
    s = fine ? (s >= 1 ? Math.floor(s * 4) / 4 : Math.max(0.75, s)) : s >= 2 ? Math.floor(s) : Math.max(0.75, Math.floor(s * 8) / 8);
    this.wrap.style.setProperty("--s", s);
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
    this.pack = pack; this.overrides = ov; this.pieceImgs = pi; this.cache = {};
    this.rebuild(); this.refreshBoard(true);
    const tb = `url("${this.src("textbox")}")`;
    [this.el.text, this.el.choice, this.el.badgeForm, this.el.shop, this.el.album, this.el.reader].forEach(e => (e.style.borderImageSource = tb));
  }
  rebuild() {
    const where = this.room ? [this.room.id, this.player.x, this.player.y, this.player.dir] : null;
    this.buildWorld();
    if (where) this.enterRoom(...where, true);
  }
  setCurator(on) { this.curator = !!on; this.rebuild(); }
  /* Put every piece with a future unveil date back in its crate (curator mode), to record the hang again. */
  resetHangs() { this.hungNow.clear(); this.hanging = null; this.rebuild(); }
  teleport(id) { const sp = ROOMS[id].spawn; this.closeAll(); this.warp(id, sp[0], sp[1], sp[2]); }
  closeAll() { this.el.text.style.display = "none"; this.el.cu.style.display = "none"; this.txt = null; this.mode = "walk"; }
  sheet(key) { return this.overrides[key] || this.cache[key] || (this.cache[key] = placeholder(key)); }
  src(key) { return this.pack.assets[key] && this.overrides[key] ? this.pack.assets[key].src : this.sheet(key).toDataURL(); }
  frame(key) { const s = SLOT[key]; return s.frames > 1 && s.fps ? Math.floor((this.t / 60) * s.fps) % s.frames : 0; }
  drawSlot(key, col, row, dx, dy) {
    const s = SLOT[key], img = this.sheet(key), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const sx = col * s.w, sy = row * s.h, w = Math.min(s.w, iw - sx), h = Math.min(s.h, ih - sy);
    if (w > 0 && h > 0) this.ctx.drawImage(img, sx, sy, w, h, dx, dy, w, h);
  }
  /* A piece's art: its image if the pack has one, otherwise a placeholder painting. */
  pieceArt(p) {
    if (this.pieceImgs[p.id]) return this.pieceImgs[p.id];
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
      const k = KEYMAP[e.code]; if (!k || isField(e.target) || e.target.tagName === "BUTTON" && (k === "a" || k === "start")) return;
      if (this.capture === "focus" && document.activeElement !== this.wrap) return;
      e.preventDefault(); if (e.repeat) return;
      if (DIRS[k]) { this.held = this.held.filter(d => d !== k); this.held.push(k); }
      this.queue.push(k);
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
    while (q.length) {
      const c = q.shift(); if (c === goal) break;
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
  hold(dir, on) { this.virt = this.virt.filter(d => d !== dir); if (on) { this.virt.push(dir); this.queue.push(dir); } }
  press(btn) { this.queue.push(btn); }
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
    el.reader.addEventListener("click", e => { if (e.target.tagName === "A") return; e.stopPropagation(); this.press("a"); });
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
.gt-end-sum{color:#505068;margin-top:calc(4px * var(--s)) !important;min-height:1.6em}
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
  /* Short notices (room names, "Got a quiz card!", "Photo saved"...). They wait while a placard, menu or text box is open,
     then show one at a time. */
  showLoc(name) { (this.toastQ = this.toastQ || []).push(name); this.flushToasts(); }
  flushToasts() {
    if (!this.toastQ || !this.toastQ.length || this.toastBusy || !(this.mode === "walk" || this.mode === "busy")) return;
    const el = this.el.loc; el.textContent = this.toastQ.shift(); el.classList.add("on"); this.toastBusy = true;
    clearTimeout(this._locT); this._locT = setTimeout(() => { el.classList.remove("on"); setTimeout(() => { this.toastBusy = false; this.flushToasts(); }, 300); }, 2000);
  }
  say(pages, done) {
    pages = this.paginate(pages);
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
    const box = this.el.reader; box.style.display = "block"; this.mode = "read";
    box.innerHTML = '<div class="gt-rd-head"></div><div class="gt-rd-body"></div><div class="gt-rd-foot"><span class="gt-rd-n"></span></div>';
    const head = box.querySelector(".gt-rd-head"), body = box.querySelector(".gt-rd-body");
    if (spec.img) { const im = document.createElement("img"); im.src = spec.img; im.alt = ""; if (spec.imgClass) im.className = spec.imgClass; head.appendChild(im); }
    const t = document.createElement("div"); t.className = "gt-rd-t"; t.textContent = spec.title || ""; if (spec.sub) { const sm = document.createElement("small"); sm.textContent = spec.sub; t.appendChild(sm); }
    if (spec.pick) t.appendChild(this.pickTag()); head.appendChild(t);
    const links = (spec.links || []).filter(l => l[0]);
    if (links.length) {
      const lw = document.createElement("div"); lw.className = "gt-rd-links"; head.appendChild(lw);
      links.forEach(([href, label, short]) => { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = (short || label) + " \u2197"; a.setAttribute("aria-label", label + " (opens in a new tab)"); a.title = label + " (opens in a new tab)"; a.className = /watch/i.test(label) ? "watch" : "play"; a.addEventListener("click", e => e.stopPropagation()); lw.appendChild(a); });
    }
    // Break each section into pages that fit the box, a word at a time.
    const pages = [], fits = () => body.scrollHeight <= body.clientHeight + 1;
    const put = (label, words) => { body.innerHTML = ""; if (label) { const b = document.createElement("b"); b.textContent = label; body.appendChild(b); } body.appendChild(document.createTextNode(words)); };
    for (const sec of spec.sections || []) {
      const words = String(sec.text || "").split(/(\s+)/); let cur = "", first = true;
      for (const w of words) {
        put(first ? sec.label : (sec.label ? sec.label + " (CONTINUED)" : ""), cur + w);
        if (!fits() && cur.trim()) { pages.push({ label: first ? sec.label : (sec.label ? sec.label + " (CONTINUED)" : ""), text: cur.trim() }); first = false; cur = w.trimStart(); }
        else cur += w;
      }
      if (cur.trim()) pages.push({ label: first ? sec.label : (sec.label ? sec.label + " (CONTINUED)" : ""), text: cur.trim() });
    }
    if (!pages.length) pages.push({ label: "", text: "" });
    this.rd = { pages, i: 0, done };
    this.renderRead();
  }
  renderRead() {
    const r = this.rd, pg = r.pages[r.i], body = this.el.reader.querySelector(".gt-rd-body");
    body.innerHTML = ""; if (pg.label) { const b = document.createElement("b"); b.textContent = pg.label; body.appendChild(b); } body.appendChild(document.createTextNode(pg.text));
    this.el.reader.querySelector(".gt-rd-n").textContent = (r.pages.length > 1 ? (r.i + 1) + " / " + r.pages.length + "   " : "") + (r.i < r.pages.length - 1 ? "A: next" : "A: done") + "   B: close";
  }
  closeRead() { this.el.reader.style.display = "none"; const d = this.rd && this.rd.done; this.rd = null; this.mode = "walk"; this.inputLock = true; if (d) d(); }
  /* ----- quiz cards -----
     Reading a piece (both sides of a case, a painting's note, or a piece on Someone's PC) marks it read; nothing is stamped yet.
     The usher quizzes you on five games you've read and pick: one stamp per right answer. Regular questions are built from the
     placards, with the wrong answers drawn from other pieces, so the whole question changes from one try to the next.
     Super questions come from each piece's own list (about the episode video or the store page) and give super stamps.
     A full card buys one fancy drink at the café; an all-super card also buys any one gift shop item. A card works once.
     Quizzes stay in this browser: they never count toward staff points or the staff office (the answers are in the public pack). */
  markRead(p) {
    const r = this.progress.read || (this.progress.read = {});
    if (!r[p.id]) { r[p.id] = todayISO(); this.saveProgress(); }
  }
  /* Looking at a piece again lets you retry the question you missed about it. */
  lookedAgain(p) {
    const s = this.card().slots.find(x => x.id === p.id && x.miss);
    if (s) { s.miss = false; this.saveProgress(); }
  }
  card() { return this.progress.card || (this.progress.card = { slots: [] }); }
  cardStamps(c) { return (c || this.card()).slots.filter(s => s.stamp > 0).length; }
  cardFull(c) { c = c || this.card(); return !!this.progress.quizIntro && c.slots.length === QUIZ_SIZE && c.slots.every(s => s.stamp > 0); }
  cardSuper(c) { c = c || this.card(); return this.cardFull(c) && c.slots.every(s => s.stamp === 2); }
  pieceById(id) { return this.pack.pieces.find(p => p.id === id); }
  /* Games you can be quizzed on: read, still in the museum, and unveiled. */
  quizzable() { const r = this.progress.read || {}, t = todayISO(); return this.pack.pieces.filter(p => r[p.id] && (!p.unveil || p.unveil <= t)); }
  showQuizCard() {
    if (!this.progress.quizIntro) { this.read({ title: "QUIZ CARD", sub: "None yet", sections: [{ label: "", text: "You don't have a quiz card yet. The usher at the front desk hands them out." }] }); return; }
    const c = this.card(), n = this.cardStamps(c), mark = s => (!s || !s.stamp ? "○" : s.stamp === 2 ? "★" : "●");
    const row = Array.from({ length: QUIZ_SIZE }, (_, i) => mark(c.slots[i])).join(" ");
    const games = c.slots.map(s => { const p = this.pieceById(s.id); return mark(s) + " " + (p ? p.title : "a retired piece") + (s.stamp === 2 ? " (super)" : !s.stamp && s.miss ? " (take another look)" : ""); });
    const how = this.tx(this.cardSuper(c) ? "quiz.superFull" : this.cardFull(c) ? "quiz.full" : "quiz.howto").join(" ");
    this.read({ title: "QUIZ CARD", sub: n + " of " + QUIZ_SIZE + " stamps" + (this.cardSuper(c) ? ", all super" : ""),
      sections: [{ label: "", text: row + "\n\n" + how }, ...(games.length ? [{ label: "GAMES", text: games.join("\n") }] : [])] });
  }
  /* The usher: a quiz, or a chat. Anyone who somehow missed the welcome gets their card here. */
  usherTalk() {
    if (this.closing) { this.staffTalk("usher"); return; }
    if (!this.progress.quizIntro) { this.giveQuizCard(); return; }
    this.choose(this.tx("quiz.ask").join(" "), ["Quiz me", "Just chatting", "Never mind"], i => {
      if (i === 0) this.startQuiz(); else if (i === 1) this.staffTalk("usher");
    }, 2);
  }
  giveQuizCard(then) {
    this.say(this.tx("quiz.intro"), () => {
      this.progress.quizIntro = true; this.card(); this.saveProgress(); this.showLoc(this.tx("quiz.got")[0]);
      if (then) then();
    });
  }
  /* The first time you head for a way out of the lobby, the usher calls you over... well, comes over, hands you a quiz card,
     and goes back to the desk. Returns true when it starts. */
  quizStopCheck() {
    if (this.progress.quizIntro || this.curator || this.closing || this.room.id !== "lobby" || this.mode !== "walk") return false;
    const u = this.room.npcs.find(n => n.usher); if (!u || u.cue) return false;
    const p = this.player, near = Object.keys(this.room.events).some(k => {
      const e = this.room.events[k]; if (!e.warp && !e.shopDoor && !e.staffDoor) return false;
      const [x, y] = k.split(",").map(Number); return Math.abs(x - p.x) + Math.abs(y - p.y) <= 1;
    });
    if (!near) return false;
    p.walking = false; this.path = null; this.pathAct = null; this.inputLock = true;
    this.say(this.tx("quiz.stop"), () => this.usherCome(u));
    return true;
  }
  usherCome(u) {
    const p = this.player, dist = ([x, y]) => Math.abs(x - u.x) + Math.abs(y - u.y);
    u.home = u.home || { x: u.x, y: u.y, dir: u.dir };
    // Stand beside the player, on the side nearest the desk.
    const spots = Object.values(DIRS).map(([dx, dy]) => [p.x + dx, p.y + dy]).filter(([x, y]) => (x === u.x && y === u.y) || !this.blocked(x, y, u)).sort((a, b) => dist(a) - dist(b));
    let to = null, route = null;
    for (const s of spots) { route = s[0] === u.x && s[1] === u.y ? [] : this.npcPath(u, s[0], s[1], true); if (route) { to = s; break; } }
    const handOver = () => {
      u.dir = p.x > u.x ? "right" : p.x < u.x ? "left" : p.y > u.y ? "down" : "up"; p.dir = OPP[u.dir];
      this.giveQuizCard(() => this.usherReturn(u));
    };
    if (!to) { handOver(); return; } // boxed in: just call it over
    this.mode = "busy";
    u.cue = { route, to, wait: 12, fails: 0, done: handOver };
  }
  usherReturn(u) {
    const h = u.home; if (!h) return;
    u.cue = { route: this.npcPath(u, h.x, h.y, true) || [], to: [h.x, h.y], wait: 20, fails: 0, patient: true, done: () => { u.dir = h.dir; } };
  }
  /* One step of a scripted walk. Someone in the way: wait, find another way. The usher heading home never gives up. */
  cueStep(n) {
    const c = n.cue;
    if (n.moving) { this.advance(n); return; }
    if (c.wait > 0) { c.wait--; return; }
    if ((n.x === c.to[0] && n.y === c.to[1]) || (!c.patient && c.fails > 6)) { n.cue = null; c.done(); return; }
    if (c.route.length && this.tryMove(n, c.route[0])) { c.route.shift(); c.wait = 2; return; }
    c.fails++; c.wait = 20; c.route = this.npcPath(n, c.to[0], c.to[1], true) || [];
  }
  /* A question whose text won't fit the text box with the options open: the start reads out first, the end stays up with the options. */
  ask(q, options, done, cancelTo) {
    const pages = this.paginate([q]);
    if (pages.length <= 1) { this.choose(q, options, done, cancelTo); return; }
    this.say(pages.slice(0, -1), () => this.choose(pages[pages.length - 1], options, done, cancelTo));
  }
  startQuiz() {
    const c = this.card();
    c.slots = c.slots.filter(s => s.stamp || this.pieceById(s.id)); // a game that left the museum before you answered: pick another
    if (c.slots.length < QUIZ_SIZE) {
      const need = QUIZ_SIZE - c.slots.length, pool = this.quizzable().filter(p => !c.slots.some(s => s.id === p.id));
      if (pool.length < need) { this.say(this.tx("quiz.tooFew", { n: this.quizzable().length })); return; }
      this.say(this.tx("quiz.pickIntro"), () => this.pickGames(pool, need, () => this.startQuiz()));
      return;
    }
    const reg = c.slots.filter(s => !s.stamp && !s.miss), sup = c.slots.filter(s => s.stamp < 2 && !s.miss && (this.pieceById(s.id) || { quiz: [] }).quiz.length);
    if (!reg.length && !sup.length) { this.say(this.tx(this.cardFull(c) ? "quiz.isFull" : "quiz.locked")); return; }
    if (!sup.length) { this.runQuiz(reg, false); return; }
    const opts = [...(reg.length ? ["Regular questions"] : []), "Super questions", "Not now"];
    this.ask(this.tx("quiz.kind").join(" "), opts, i => {
      if (opts[i] === "Regular questions") this.runQuiz(reg, false);
      else if (opts[i] === "Super questions") this.runQuiz(sup, true);
    }, opts.length - 1);
  }
  /* Pick the games for this card from the ones you've read. A picks or unpicks; DONE once there are enough. */
  pickGames(pool, need, done) {
    const chosen = new Set(), c = this.card();
    let note = "";
    const title = () => note || "PICK " + need + " GAME" + (need > 1 ? "S" : "") + " (" + chosen.size + "/" + need + ")";
    const rows = () => [...pool.map(p => ({ text: (chosen.has(p.id) ? "■ " : "□ ") + p.title + (p.quiz.length ? " ★" : ""), pick: p.pick })),
      chosen.size === need ? "DONE: QUIZ ME!" : "Pick " + (need - chosen.size) + " more", "Not now"];
    this.openList(title(), rows(), i => {
      const L = this.list; note = "";
      if (i < pool.length) {
        const id = pool[i].id;
        if (chosen.has(id)) chosen.delete(id); else if (chosen.size < need) chosen.add(id); else note = "THAT'S " + need + ". UNPICK ONE FIRST.";
        L.rows = rows(); L.title = title(); this.renderList(); return;
      }
      if (i === pool.length) {
        if (chosen.size < need) { note = "PICK " + (need - chosen.size) + " MORE FIRST."; L.title = title(); this.renderList(); return; }
        this.closeList();
        pool.filter(p => chosen.has(p.id)).forEach(p => c.slots.push({ id: p.id, stamp: 0, seen: [], cur: null, miss: false }));
        this.saveProgress(); done(); return;
      }
      this.closeList();
    }, true);
  }
  /* Ask each open slot one question, in card order. B on a question stops the quiz; that question waits for next time. */
  runQuiz(slots, sup) {
    let k = 0, got = 0;
    const tally = this.progress.tally;
    const next = () => {
      const s = slots[k++];
      if (!s) {
        this.saveProgress();
        this.say(this.tx("quiz.done", { n: got }), () => { if (this.cardFull()) this.showLoc(this.cardSuper() ? "Quiz card full: all super!" : "Quiz card full!"); });
        return;
      }
      const p = this.pieceById(s.id), q = p && this.quizQuestion(p, s, sup);
      if (!q) { next(); return; }
      this.saveProgress();
      const go = () => this.ask("(" + k + "/" + slots.length + ") " + q.q, q.opts, i => {
        if (i < 0 || i >= q.opts.length) { this.saveProgress(); this.say(["No problem. We'll pick this up later."]); return; }
        s.cur = null; s.seen = [...s.seen.filter(x => x !== q.key), q.key].slice(-20);
        if (i === q.ans) {
          s.stamp = Math.max(s.stamp, sup ? 2 : 1); got++;
          tally.stamps = (tally.stamps || 0) + 1; if (sup) tally.supers = (tally.supers || 0) + 1;
          this.saveProgress(); this.say(this.tx(sup ? "quiz.rightSuper" : "quiz.right", null, true), next);
        } else { s.miss = true; this.saveProgress(); this.say(this.tx("quiz.wrong", { title: p.title }), next); }
      }, -1);
      if (q.quote) this.say(["“" + q.quote + "”"], go); else go();
    };
    next();
  }
  /* The question for a slot: the one left waiting, else one not asked lately, with fresh wrong answers. */
  quizQuestion(p, s, sup) {
    if (s.cur && !!s.cur.sup === !!sup && Array.isArray(s.cur.opts)) return s.cur;
    const bank = sup ? this.superBank(p) : this.regularBank(p);
    if (!bank.length) return null;
    const fresh = bank.filter(b => !s.seen.includes(b.key)), from = fresh.length ? fresh : bank, b = from[Math.floor(Math.random() * from.length)];
    const near = shuffled(b.near.filter(n => b.wrong.includes(n))).slice(0, 2);
    const decoys = [...near, ...shuffled(b.wrong.filter(w => !near.includes(w)))].slice(0, 3), opts = shuffled([b.right, ...decoys]);
    return (s.cur = { key: b.key, sup: !!sup, q: b.q, quote: b.quote || "", opts, ans: opts.indexOf(b.right) });
  }
  /* Regular questions, built from what's already on the placards. Wrong answers come from the other pieces; when the answer is a
     title, some come from the other games on your card, so you can't just pick the one you chose. */
  regularBank(p) {
    const t = todayISO(), others = this.pack.pieces.filter(o => o.id !== p.id && (!o.unveil || o.unveil <= t)), mine = new Set(this.card().slots.map(x => x.id));
    const known = d => d && d !== "Unknown developer", same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
    const uniq = (list, not) => [...new Set(list.filter(Boolean))].filter(v => !same(v, not));
    const titles = uniq(others.map(o => o.title), p.title), near = uniq(others.filter(o => mine.has(o.id)).map(o => o.title), p.title);
    const out = [], add = (key, q, right, wrong, quote) => { if (right && wrong.length >= 3) out.push({ key, q, right, wrong, quote, near }); };
    if (known(p.developer)) {
      add("dev", "Who made " + p.title + "?", p.developer, uniq(others.map(o => o.developer).filter(known), p.developer));
      add("made", "Which game did " + p.developer + " make?", p.title, uniq(others.filter(o => !same(o.developer, p.developer)).map(o => o.title), p.title));
    }
    if (p.hint) add("hint", "Which game is “" + p.hint + "”?", p.title, titles);
    const quotes = (key, text, q) => this.excerpts(text, p).forEach((x, i) => add(key + i, q, p.title, titles, x));
    if (p.kind === "episode") {
      if (p.observation) quotes("obs", p.observation, "Which game's observation placard says that?");
      if (p.intention) quotes("int", p.intention, "Which game's intention placard says that?");
    } else {
      if (p.guestNote) quotes("note", p.guestNote, "Which painting's guest note says that?");
      if (p.guestWriter) add("writer", "Who wrote the guest note for " + p.title + "?", p.guestWriter, uniq(others.map(o => o.guestWriter), p.guestWriter));
    }
    return out;
  }
  superBank(p) { return p.quiz.map((x, i) => ({ key: "s" + i, q: x.q, right: x.a, wrong: x.wrong.filter(w => w.toLowerCase() !== x.a.toLowerCase()), near: [] })); }
  /* Up to two short passages from a placard, with the game's title and developer blanked out. */
  excerpts(text, p) {
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let t = text.replace(new RegExp(esc(p.title), "gi"), "this game");
    if (p.developer && p.developer !== "Unknown developer") t = t.replace(new RegExp(esc(p.developer), "gi"), "the developer");
    const sents = t.match(/[^.!?]+[.!?]+["'”)\]]*\s*|[^.!?]+$/g) || [t], out = [];
    let cur = "";
    for (const s of sents) { if (cur && (cur + s).length > 160) { out.push(cur.trim()); cur = ""; if (out.length >= 2) break; } cur += s; }
    if (cur.trim() && out.length < 2) out.push(cur.trim());
    return out.filter(x => x.length >= 25).map(x => (x.length > 180 ? x.slice(0, 177).replace(/\s+\S*$/, "") + "…" : x)).map(x => x[0].toUpperCase() + x.slice(1));
  }
  /* Spend the card (it works once) and hand over a fresh one. */
  spendCard(title, then) {
    this.progress.card = { slots: [] }; this.progress.tally.cards = (this.progress.tally.cards || 0) + 1; this.saveProgress();
    this.say(this.tx("quiz.spent", { title }), then);
  }
  tradeQuizCard() {
    const sh = this.pack.settings.shop, prizes = sh.items.filter(it => !this.progress.items.includes(it.id));
    if (!prizes.length) { this.shopMsg = this.tx("quiz.noPrizes").join(" "); this.renderShop(); return; }
    this.closeShop();
    this.choose("Trade your super quiz card for:", [...prizes.map(it => it.name), "Not yet"], i => {
      const it = prizes[i]; if (!it) return;
      this.progress.items.push(it.id); this.spendCard(it.name);
    });
  }
  viewPiece(p, side, readIt) {
    const gold = p.kind === "episode", img = this.pieceImgs[p.id], secs = [];
    if (side === "front") { if (p.observation) secs.push({ label: "OBSERVATION", text: p.observation }); secs.push({ label: "", text: this.tx("case.frontNote").join(" ") }); }
    else if (side === "back") { if (p.intention) secs.push({ label: "INTENTION", text: p.intention }); secs.push({ label: "", text: this.tx("case.backNote").join(" ") }); }
    else if (side === "end") secs.push({ label: "", text: this.tx("case.ends").join(" ") });
    else if (gold) { if (p.observation) secs.push({ label: "OBSERVATION", text: p.observation }); if (p.intention) secs.push({ label: "INTENTION", text: p.intention }); }
    else if (p.guestNote) secs.push({ label: p.guestWriter ? "GUEST NOTE BY " + p.guestWriter.toUpperCase() : "GUEST NOTE", text: p.guestNote });
    this.read({ img: img ? p.image : this.pieceArt(p).toDataURL(), imgClass: img && img.naturalWidth > 160 ? "photo" : "", title: p.title.toUpperCase(), sub: "By " + p.developer,
      sections: secs, pick: p.pick, links: [[p.episodeUrl, "Watch the episode", "WATCH"], [p.gameUrl, "Play the game", "PLAY"]] }, () => {
      // Reading it all (both sides of a case, a painting, a piece on the PC) counts it as read for quiz cards.
      if (readIt || side === undefined) this.markRead(p);
      if (side !== "end") this.lookedAgain(p);
    });
  }
  /* Episode cases have two placards. From the front (standing below it, facing up) you read the curator's observation;
     walk around to the back (facing down) for the developer's intention. From the ends, you're told to walk around. */
  useCase(c) {
    if (c.state === "empty") { this.say(this.tx("case.empty")); return; }
    if (c.state === "covered") { this.say(this.tx("case.covered", { date: niceDate(c.piece.unveil), title: c.piece.title })); return; }
    if (c.state === "crate") { this.hang(c); return; }
    if (this.prints(c.piece) > 0) {
      (this.progress.wiped || (this.progress.wiped = {}))[c.piece.id] = todayISO(); (this.extraPrints || (this.extraPrints = {}))[c.piece.id] = 0;
      this.count("wiped", c.piece.id); this.saveProgress();
      this.mode = "busy"; this.chore = { spot: c, t: 0, kind: "wipe" }; this.showLoc("Wiped the glass"); return;
    }
    const d = this.player.dir, side = d === "up" ? "front" : d === "down" ? "back" : null;
    if (!side) { this.say(this.tx("case.ends")); return; }
    // Reading both sides of a case counts it as read, for quiz cards (after the placard closes).
    const seen = this.progress.sides || (this.progress.sides = {}), k = seen[c.piece.id] || (seen[c.piece.id] = {});
    k[side] = 1; this.saveProgress();
    this.viewPiece(c.piece, side, !!(k.front && k.back));
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
     whether today's mug was found, and running tallies. Phase 5 adds staff badges on top of these tallies. */
  loadProgress() {
    let p = null;
    try { if (this.saveKey) p = JSON.parse(localStorage.getItem(this.saveKey) || "null"); } catch (e) {}
    p = p && typeof p === "object" ? p : {};
    return { dusted: p.dusted || {}, straightened: p.straightened || {}, watered: p.watered || {}, mug: p.mug || "",
      tally: Object.assign({ dusted: 0, straightened: 0, watered: 0, mugs: 0, closings: 0 }, p.tally || {}),
      staff: p.staff && p.staff.badge ? p.staff : null,   // who is clocked in on this browser (never the key)
      staffTally: p.staffTally || {}, lastBadge: p.lastBadge || null,
      tokens: typeof p.tokens === "number" ? p.tokens : 0, items: Array.isArray(p.items) ? p.items : [], shirt: !!p.shirt, wearShirt: !!p.wearShirt, quest: p.quest || 0,
      ach: p.ach || {}, visited: Array.isArray(p.visited) ? p.visited : [],
      photos: Array.isArray(p.photos) ? p.photos : [], where: p.where || null, sides: p.sides || {}, wiped: p.wiped || {},
      // Quiz cards: which pieces you've read, whether the usher has given you a card, and the card in your pocket.
      read: p.read && typeof p.read === "object" ? p.read : oldRead(p), quizIntro: !!p.quizIntro, card: cleanCard(p.card) };                    // chores counted per badge while clocked in
  }
  saveProgress() { this.checkAchievements(); try { if (this.saveKey) localStorage.setItem(this.saveKey, JSON.stringify(this.progress)); } catch (e) {} }
  /* ----- achievements ----- */
  stat(k) {
    const p = this.progress, t = p.tally || {};
    if (k === "photos") return t.photos || 0;
    if (k === "bothSides") return Object.values(p.sides || {}).filter(v => v.front && v.back).length;
    if (k === "items") return (p.items || []).length;
    if (k === "rooms") return (p.visited || []).length;
    if (k === "shirt") return p.shirt ? 1 : 0;
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
  resetProgress() { try { if (this.saveKey) localStorage.removeItem(this.saveKey); } catch (e) {} this.progress = this.loadProgress(); this.lightsOff.clear(); this.closing = false; this.closed = false; this.dayStart = Object.assign({}, this.progress.tally); this.spook = null; this.figure = null; this.hideEnd(); this.updateHud(); this.rebuild(); }
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
      for (const id in this.rooms) if (this.rooms[id] !== this.room) this.rooms[id].npcs = this.rooms[id].npcs.filter(n => n.staff);
      this.room.npcs.filter(n => !n.staff).forEach((n, i) => { n.leaving = true; n.leaveT = -i * 6; n.alpha = 1; n.timer = 0; n.route = null; n.aside = null; });
    });
  }
  toggleLights() {
    const id = this.room.id;
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
    if (Object.keys(ROOMS).every(r => !ROOMS[r].lightSwitch || this.lightsOff.has(r))) {
      this.count("closings"); this.saveProgress();
      this.closed = true;
      setTimeout(() => this.say(this.tx("lights.closed")), 500);
    }
  }
  /* Something creepy, rarely: about one closing in five, after a while walking in the dark.
     One of three: eyes in the dark that vanish as you approach, a frame creaking crooked by itself,
     or the intercom crackling on its own. Curator option (or ?spooky) makes it happen every closing. */
  stepInDark() {
    const sp = this.spook; if (!sp || !sp.armed || sp.done || !this.lightsOff.has(this.room.id)) return;
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
      f.alpha = f.leaving ? f.alpha - 0.12 : Math.min(1, f.alpha + 0.02);
      if (f.leaving && f.alpha <= 0) this.figure = null;
    }
    if (this.creakT && ++this.creakT.t > 40) this.creakT = null;
  }
  /* The front doors: a friendly line while open; once closed, the way out to the ending screen. */
  frontDoor() {
    if (this.closed) { this.mode = "busy"; this.trans = { t: 0, dur: 24, switched: false, fn: () => this.showEnd(), hold: true }; return; }
    if (this.closing) {
      const on = Object.keys(ROOMS).filter(id => ROOMS[id].lightSwitch && !this.lightsOff.has(id)).map(id => ROOMS[id].name.replace(/\s+/g, " "));
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
    e.querySelector(".gt-end-sum").textContent = sum;
    e.style.borderImageSource = `url("${this.src("textbox")}")`;
    this.el.endWrap.style.display = "flex"; this.mode = "ended";
    const b = e.querySelector("button"); setTimeout(() => b.focus({ preventScroll: true }), 50);
  }
  hideEnd() { if (this.el.endWrap) this.el.endWrap.style.display = "none"; }
  /* Open again without reloading: visitors return, lights come on, you start at the front doors. */
  reopen() {
    this.lightsOff.clear(); this.closing = false; this.closed = false; this.dayStart = Object.assign({}, this.progress.tally);
    this.spook = null; this.figure = null; this.hideEnd(); this.trans = null; this.fade = 0; this.mode = "walk"; this.microwaved = false;
    this.rebuild();
    const w = this.endKind === "brb" && this.progress.where;
    if (w && this.rooms[w.room]) this.enterRoom(w.room, w.x, w.y, w.dir); else { const sp = ROOMS.lobby.spawn; this.enterRoom("lobby", sp[0], sp[1], sp[2]); }
    this.wrap.focus({ preventScroll: true });
  }
  /* ----- staff -----
     Clocking in uses a badge number and key: the offline test badge (locally), or a real badge checked by Supabase.
     Chores done while clocked in also count toward that badge's staff tally. */
  get staff() { return this.progress.staff; }
  /* The on-shift tag in the corner: who's clocked in and how many chores this shift. */
  updateHud(pulse) {
    // Someone clocked in or out: refresh who's visiting, so the person playing isn't also in the crowd.
    const sk = this.staff ? this.staff.badge + "|" + this.staff.name : "";
    if (this.rooms && this.lastStaffKey !== undefined && sk !== this.lastStaffKey) this.assignMembers();
    const h = this.el.hud, s = this.staff; if (!h) return;
    const tokens = this.progress.tokens || 0;
    h.innerHTML = "";
    if (s) {
      const n = this.staffChores(), c = document.createElement("span"); c.className = "chip shift";
      const b = document.createElement("b"); b.textContent = "ON SHIFT"; c.appendChild(b);
      c.appendChild(document.createTextNode(n + " pt" + (n === 1 ? "" : "s"))); c.title = s.name + " is on shift" + (s.token ? "" : " (offline test badge: points stay in this browser)"); h.appendChild(c);
    }
    if (tokens > 0 || (this.room && this.room.id === "shop")) {
      const c = document.createElement("span"); c.className = "chip tok" + (pulse ? " pulse" : ""); c.textContent = tokens + " T"; c.title = tokens + " gift shop tokens"; h.appendChild(c);
    }
    h.style.display = h.children.length ? "flex" : "none";
  }
  /* Chores on this badge's tally. Kept in the browser, so closing up and reopening never resets it. */
  staffChores() {
    const s = this.staff, t = s && this.progress.staffTally[s.badge]; if (!t) return 0;
    return POINT_KINDS.reduce((a, k) => a + (t[k] || 0) * (k === "helped" ? 3 : 1), 0);
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
      const rows = Object.values(this.progress.staffTally || {}).map(t => ({ name: t.name, points: POINT_KINDS.reduce((a, k) => a + (t[k] || 0) * (k === "helped" ? 3 : 1), 0) })).filter(r => r.points > 0).sort((a, b) => b.points - a.points);
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
  closeBadge() { this.el.badgeWrap.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.wrap.focus({ preventScroll: true }); }
  async submitBadge() {
    const f = this.el.badgeForm, err = f.querySelector(".gt-badge-err");
    if (this.badgeBusy) return; this.badgeBusy = true; err.textContent = this.online() ? "Checking your badge..." : "";
    let who; try { who = await this.checkBadge(f.badge.value, f.key.value); } finally { this.badgeBusy = false; }
    if (!who || who.error) { err.textContent = this.tx((who && who.error) || "badge.wrong")[0]; return; }
    this.progress.staff = who; this.shift = {}; this.saveProgress();
    this.progress.lastBadge = who; this.progress.tally.shifts = (this.progress.tally.shifts || 0) + 1; this.saveProgress();
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
  locker(i) {
    const mine = this.staff && strSeed(this.staff.badge) % 6 === i;
    if (mine) {
      const names = this.ownedItems().map(it => it.name);
      this.say(this.tx("locker.mine", { locker: i + 1 }));
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
    const c = this.ch; this.el.choice.innerHTML = "";
    c.options.forEach((o, i) => {
      const d = document.createElement("div"); d.className = "gt-choice-item" + (i === c.i ? " on" : ""); d.textContent = o;
      d.addEventListener("click", e => { e.stopPropagation(); c.i = i; this.endChoice(); });
      this.el.choice.appendChild(d);
    });
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
  fmt(str, vars) { return str.replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined ? vars[k] : m)); }
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
    return { always: true, visitor: !this.staff, staff: !!this.staff, day: tod === "day", sunset: tod === "sunset", night: tod === "night", slow: c === "slow", medium: c === "medium",
      heavy: c === "heavy", reveal: this.pack.pieces.some(p => p.unveil === todayISO()), closing: this.closing, drink: !!this.drink, photos: !!(this.progress.photos || []).length,
      helped: !!this.progress.tally.helped, cat: !!(this.room && this.room.cat), shirt: !!this.progress.wearShirt && !this.staff }[w];
  }
  staffTalk(role, then) {
    let entries = (this.pack.settings.talk[role] || []).filter(e => (e.when.length ? e.when : ["always"]).every(w => this.talkWhen(w)));
    // Wearing the GOQ shirt overrides everything: staff can only talk about the shirt.
    if (entries.some(e => e.when.includes("shirt"))) entries = entries.filter(e => e.when.includes("shirt"));
    // Prefer the most specific lines: those with the most conditions that hold.
    const best = entries.length ? Math.max(...entries.map(e => e.when.filter(w => w !== "always").length)) : 0;
    const pool = []; entries.filter(e => e.when.filter(w => w !== "always").length >= Math.min(best, 1)).forEach(e => e.v.forEach(pg => pool.push(pg)));
    if (!pool.length) { this.say(["..."], then); return; }
    this.talkI = this.talkI || {}; const i = (this.talkI[role] = ((this.talkI[role] === undefined ? -1 : this.talkI[role]) + 1)) % pool.length;
    const vars = this.baseVars(); this.say(pool[i].map(p => this.fmt(p, vars)), then);
  }

  /* ----- evening -----
     Real time in the visitor's own time zone: day 7 am to 5 pm, sunset 5 to 7 pm (and 6 to 7 am), night 7 pm to 6 am. */
  tod() {
    if (this.timeOverride) return this.timeOverride;
    const h = new Date().getHours();
    return h >= 19 || h < 6 ? "night" : h >= 17 || h === 6 ? "sunset" : "day";
  }
  /* How busy today is: slow, medium or heavy, picked per day. Any day a piece is unveiled is heavy. */
  crowdToday() {
    const t = todayISO();
    if (this.pack && this.pack.pieces.some(p => p.unveil === t)) return "heavy";
    const r = strSeed("crowd" + t) % 10;
    return r < 5 ? "medium" : "heavy";
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
    return [...(this.cardSuper() ? [{ trade: true }] : []), ...items.map(it => ({ item: it })), { shirt: true }, { collection: true }, { leave: true }];
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
        const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = owned.includes(r.item.id) ? "OWNED" : r.item.price + " T"; row.appendChild(pr);
      } else if (r.trade) {
        const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = "Trade your super quiz card"; row.appendChild(nm);
        const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = "ANY ITEM"; row.appendChild(pr);
      } else if (r.shirt) {
        const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = "GOQ shirt"; row.appendChild(nm);
        const pr = document.createElement("span"); pr.className = "pr"; pr.textContent = this.progress.shirt ? "YOURS" : "DISCONTINUED"; row.appendChild(pr);
      } else { const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = r.collection ? "Your collection" : "Leave"; row.appendChild(nm); }
      row.addEventListener("click", e => { e.stopPropagation(); if (this.shopSel === i) this.shopSelect(); else { this.shopSel = i; this.shopConfirm = null; this.shopMsg = ""; this.renderShop(); } });
      list.appendChild(row);
    });
    const r = rows[this.shopSel], det = document.createElement("p"); det.className = "gt-shop-detail";
    det.textContent = this.shopMsg || (r.item ? (r.item.id === sh.featured ? "FEATURED. " : "") + (r.item.description || "") :
      r.trade ? "Five super stamps: pick any one item, on the house. The card is spent." : r.shirt ? this.tx(this.progress.shirt ? "shirt.owned" : "shirt.tease").join(" ") : r.collection ? "See what you've bought." : "Head back out.");
    box.appendChild(det);
    const sel = list.children[this.shopSel]; if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
  }
  shopSelect() {
    const r = this.shopRows()[this.shopSel], t = this.progress.tokens || 0;
    if (r.leave) { this.closeShop(); this.say(this.tx("shop.bye")); return; }
    if (r.shirt) { this.shopMsg = this.tx(this.progress.shirt ? "shirt.owned" : "shirt.tease").join(" "); this.renderShop(); return; }
    if (r.trade) { this.tradeQuizCard(); return; }
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
  /* Items on sale fill the racks in menu order, six per rack; spare spots get trinkets. */
  /* Each rack has two shelves, and each shelf holds one item (three of it). Items fill racks in menu order: rack 1 gets items 1 and 2, and so on.
     A shelf without an item gets a row of trinkets. */
  /* Shelving units hold six stacks each: items fill them in Shop-tab order (unit 1 has items 1 to 6). */
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
  buy(it) {
    this.progress.tokens = (this.progress.tokens || 0) - it.price; this.progress.items.push(it.id); this.saveProgress(); this.updateHud();
    this.say(["You bought " + it.name + "!", this.staff ? "It'll be waiting in the collection cabinet in the staff room." : "It's in your collection. Staff keep theirs in the staff room's collection cabinet."]);
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
    const name = this.pack.settings.staff.catName; this.petT = 70;
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
      const n = this.drink.name.toLowerCase(), plain = DRINKS[this.drink.kind] || DRINKS[0];
      // Refills are on the house, but a fancy drink refills as the plain one in the same cup.
      this.choose("Finished? Want a refill on that " + n + "?", [this.drink.fancy ? "A plain " + plain.name.toLowerCase() + ", please" : "Refill, please", "No thanks"], i => {
        if (i === 0) { this.drink = { kind: this.drink.kind, name: this.drink.fancy ? plain.name : this.drink.name, sips: 0 }; this.say(this.tx("drink.refill")); }
        else this.say(this.tx("drink.noRefill"));
      });
      return;
    }
    if (this.drink) { this.say(this.tx("drink.still")); return; }
    const sh = this.pack.settings.shop, price = sh.drinkPrice, tag = price ? " (" + price + " T)" : "";
    const ftag = " (" + (sh.fancyPrice ? sh.fancyPrice + " T" : "free") + (this.cardFull() ? " or card" : "") + ")";
    const lines = ["What can I get you?", "What'll it be?", "Something warm?"], nb = DRINKS.length, nf = sh.fancy.length;
    this.cafeI = (this.cafeI || 0) + 1;
    this.choose(lines[this.cafeI % lines.length], [...DRINKS.map(d => d.name + tag), ...sh.fancy.map(d => d.name + ftag), "Just chatting", "Nothing, thanks"], i => {
      if (i === nb + nf) { this.staffTalk("barista"); return; }
      if (i < 0 || i > nb + nf) return;
      if (i >= nb) { this.orderFancy(sh.fancy[i - nb]); return; }
      if (price && (this.progress.tokens || 0) < price) { this.say(["That's " + price + " token" + (price > 1 ? "s" : "") + ". Chores earn tokens."]); return; }
      if (price) { this.progress.tokens -= price; this.saveProgress(); this.updateHud(); }
      if (DRINKS[i].id === "cocoa") this.quest("cocoa");
      this.serve({ kind: i, name: DRINKS[i].name, sips: 0 });
    });
  }
  serve(d, quiet) {
    this.drink = d;
    this.progress.tally.drinks = (this.progress.tally.drinks || 0) + 1; this.saveProgress();
    if (!quiet) this.say(this.tx("drink.served"));
  }
  /* Fancy drinks: tokens, or a full quiz card. A super card could buy a gift shop item instead, so the barista checks first. */
  orderFancy(f) {
    const fp = this.pack.settings.shop.fancyPrice, t = this.progress.tokens || 0, d = { kind: f.cup, name: f.name, sips: 0, fancy: true };
    const pay = () => { if (fp) { this.progress.tokens = t - fp; this.saveProgress(); this.updateHud(); } this.serve(d); };
    if (!this.cardFull()) {
      if (t < fp) { this.say(["That's " + fp + " token" + (fp > 1 ? "s" : "") + ". Chores earn tokens, or bring a full quiz card."]); return; }
      pay(); return;
    }
    const useCard = () => this.spendCard(f.name, () => this.serve(d, true));
    const opts = [...(t >= fp ? [fp ? "Pay " + fp + " tokens" : "It's free"] : []), "Use my quiz card", "Never mind"];
    this.choose("How would you like to pay?", opts, k => {
      const o = opts[k];
      if (o === "Use my quiz card") {
        if (this.cardSuper()) this.ask(this.tx("quiz.spendSuper").join(" "), ["Use it on a drink", "Keep my card"], j => { if (j === 0) useCard(); }, 1);
        else useCard();
      } else if (o && o !== "Never mind") pay();
    }, opts.length - 1);
  }
  /* Empty cups go in the bus tub or a trash can. */
  bin(e) {
    if (this.drink && this.drink.empty) { this.drink = null; if (!e.tub && this.room.id === "lobby") this.quest("lobbyTrash"); else this.quest("otherBin"); this.say(this.tx(e.tub ? "bin.tub" : "bin.trash")); return; }
    if (this.drink) { this.say(this.tx("bin.full")); return; }
    this.say(this.tx(e.tub ? "bin.lookTub" : "bin.lookTrash"));
  }
  /* The elevator: one little room. The panel picks the floor; the door lets you out there. */
  elevatorPanel() {
    const stops = Object.keys(ROOMS).filter(id => ROOMS[id].elevatorStop).sort((a, b) => (ROOMS[b].elevatorStop.order || 0) - (ROOMS[a].elevatorStop.order || 0)); // top floor first
    const here = ROOMS[this.elevatorAt] && ROOMS[this.elevatorAt].elevatorStop ? this.elevatorAt : (stops.find(id => ROOMS[id].elevatorStop.order === 1) || stops[0]);
    this.elevatorAt = here;
    this.choose("Which floor? (You're on " + ROOMS[here].elevatorStop.label.replace(/\s+/g, " ") + ".)", [...stops.map(id => ROOMS[id].elevatorStop.label.replace(/\s+/g, " ")), "Stay here"], i => {
      const id = stops[i]; if (!id || id === here) return;
      this.elevatorAt = id;
      this.say(this.tx("elevator.ride", { floor: ROOMS[id].elevatorStop.label.replace(/\s+/g, " ") }));
    });
  }
  workbench() {
    const up = this.pack.pieces.filter(p => p.unveil && p.unveil > todayISO());
    if (!up.length) { this.say(this.tx("workbench.empty")); return; }
    this.say([...this.tx("workbench.intro"), ...up.map(p => "A crate labeled " + p.title.toUpperCase() + ". Unveiling " + niceDate(p.unveil) + ".")]);
  }
  /* The stairwell is a little strange sometimes. */
  stairwellOddity() {
    if (Math.random() > 0.3) return;
    if (Math.random() < 0.4) { setTimeout(() => { if (this.room.id === "stairwell" || ROOMS[this.room.id].stairwell) this.flickerT = 64; }, 500); return; }
    setTimeout(() => { if (this.mode === "walk" && ROOMS[this.room.id] && ROOMS[this.room.id].stairwell) this.say(this.tx("stairwell", null, true)); }, 700);
  }
  /* Fingerprints on cases: they build up a little each day, and visitors who linger by a case leave more. */
  prints(p) {
    // amount (0 to 1, set in the curator) is roughly the chance a case has picked up a smudge on a given day.
    const amt = this.pack.settings.staff.fingerprints, t = todayISO(), w = (this.progress.wiped || {})[p.id];
    const base = amt <= 0 ? 0 : w ? Math.min(3, Math.floor(daysBetween(w, t) * amt * 1.5)) : (strSeed(p.id + t) % 100 < amt * 100 ? 1 : 0);
    if (amt <= 0) return 0;
    return Math.min(3, base + ((this.extraPrints || {})[p.id] || 0));
  }
  /* ----- helping visitors find a piece -----
     Some visitors are looking for a piece. Ask, and they describe it with the piece's hint. Snap a photo of it with your phone,
     show them, and if it's right they go see it. Each one helped counts on your tally. */
  displayed() {
    const out = [];
    for (const id in this.rooms) {
      const r = this.rooms[id];
      r.cases.forEach(c => { if (c.piece && c.state === "wall") out.push({ piece: c.piece, room: id, x: c.x, y: c.y + 1 }); });
      r.hung.forEach(h => { if (h.state === "wall") out.push({ piece: h.piece, room: id, x: h.x, y: 3 }); });
    }
    return out;
  }
  /* Patreon members, shuffled fresh each day, become the day's visitors in room order. With more members than visitors,
     a different group comes each day. Whoever is clocked in right now is playing, so they don't also wander around. */
  assignMembers() {
    const all = (this.pack.settings.staff.members || []).filter(m => !this.staff || (m.badge ? m.badge !== this.staff.badge : m.name.toLowerCase() !== this.staff.name.toLowerCase()));
    const seed = strSeed("members" + todayISO()), list = all.map((m, i) => ({ m, k: hash(seed, i) })).sort((a, b) => a.k - b.k).map(x => x.m);
    let i = 0;
    for (const id of Object.keys(this.rooms)) for (const n of this.rooms[id].npcs) {
      if (n.staff || n.role || n.usher || n.patrol) continue;
      n.member = list[i] ? list[i].name : null; i++;
    }
    this.lastStaffKey = this.staff ? this.staff.badge + "|" + this.staff.name : "";
  }
  /* The Patron Board: every member, always, whether or not they're visiting today. */
  readPatronBoard() {
    const names = (this.pack.settings.staff.members || []).map(m => m.name);
    if (!names.length) { this.say(this.tx("patrons.empty")); return; }
    const here = Object.values(this.rooms).flatMap(r => r.npcs.filter(n => n.member).map(n => n.member));
    this.read({ title: "THANK YOU, PATRONS", sub: names.length + " supporter" + (names.length === 1 ? "" : "s"),
      sections: [{ label: "", text: this.tx("patrons.intro").join(" ") }, { label: "OUR PATRONS", text: names.join(" \u00B7 ") },
        ...(here.length ? [{ label: "VISITING TODAY", text: here.join(", ") }] : [])] });
  }
  giveRequests() {
    const all = this.displayed(); if (!all.length) return;
    // At most one lost visitor per gallery floor, each looking for a different piece on their floor.
    const openIn = {}, taken = new Set();
    for (const id in this.rooms) { openIn[id] = this.rooms[id].npcs.filter(n => n.req).length; this.rooms[id].npcs.forEach(n => { if (n.req) taken.add(n.req.piece.id); }); }
    for (const id in this.rooms) this.rooms[id].npcs.forEach((n, i) => {
      if (!(this.rooms[id].cases.length || this.rooms[id].hung.length)) return; // only gallery visitors get lost
      if (openIn[id] >= 1 || n.still || n.staff || n.patrol || n.req || n.helped || Math.random() < 0.6) return;
      const pool = all.filter(a => !taken.has(a.piece.id) && a.room === id), away = pool.filter(a => a.room !== id || Math.abs(a.x - n.x) + Math.abs(a.y - n.y) > 6);
      const from = away.length ? away : pool; if (!from.length) return;
      const pick = from[Math.floor(Math.random() * from.length)];
      taken.add(pick.piece.id); openIn[id]++;
      n.req = { piece: pick.piece, room: pick.room, x: pick.x, y: pick.y, asked: false };
    });
  }
  /* ----- photos -----
     B lifts your phone and photographs whatever is right in front of you. The album holds descriptions, not pictures. */
  /* What's right in front of you, as a description plus what to draw in the album's little snapshot. */
  photoSubject() {
    const p = this.player, [dx, dy] = DIRS[p.dir], fx = p.x + dx, fy = p.y + dy, r = this.room, art = ROOMS[r.id].art || {};
    const e = r.events[fx + "," + fy] || r.events[fx + "," + (fy + 1)], dark = this.lightsOff.has(r.id) ? " It's very dark." : "", dk = !!dark;
    const npc = r.npcs.find(n => n.x === fx && n.y === fy);
    if (npc && npc.member) return { desc: npc.member + (npc.req ? ", looking a little lost." : npc.sitting ? ", relaxing at the café." : npc.still ? ", deep in thought about a purchase." : ", enjoying the museum.") + dark, thumb: { slot: npc.sheet, bg: art.floor, dark: dk } };
    if (npc) return { desc: (npc.patrol ? "The night guard, mid-rounds. They gave a little wave." : npc.usher ? "The usher at the front desk, smiling politely." : npc.still && npc.staff ? "The conservator, busy with something delicate." : npc.req ? "A visitor who looks a little lost." : "A visitor admiring the museum.") + dark, thumb: { slot: npc.sheet, bg: art.floor, dark: dk } };
    if (r.cat && r.cat.x === fx && r.cat.y === fy) return { desc: this.pack.settings.staff.catName + ", napping. Adorable." + dark, thumb: { slot: "cat", bg: art.floor, dark: dk } };
    if (r.mug && r.mug.x === fx && r.mug.y === fy) return { desc: "The curator's coffee mug, abandoned again." + dark, thumb: { slot: "mug", bg: art.floor, dark: dk } };
    if (e && e.caseAt && e.caseAt.piece && e.caseAt.state === "wall") return { desc: e.caseAt.piece.title + ", in its glass case." + dark, piece: e.caseAt.piece.id, thumb: { piece: e.caseAt.piece.id, dark: dk } };
    if (e && e.spot && e.spot.piece && e.spot.state === "wall") return { desc: e.spot.piece.title + ", hanging on the wall." + dark, piece: e.spot.piece.id, thumb: { piece: e.spot.piece.id, dark: dk } };
    if (e && e.window) return { desc: "The sky through the lobby window, " + { day: "bright blue", sunset: "orange and pink", night: "full of stars" }[this.tod()] + ".", thumb: { slot: "sky_" + this.tod() } };
    if (e && (e.warp || e.elevatorDoor || e.frontDoor || e.shopDoor || e.staffDoor)) return { desc: e.frontDoor ? "The museum's front doors." : e.step ? "A staircase." : "A doorway." + dark, thumb: { slot: e.frontDoor ? "exit_door" : e.step ? "stair_up" : "doorway_lower", bg: e.step ? art.floor : art.lower, dark: dk } };
    const prop = r.props.find(q => { const s = SLOT[q.key]; return fx >= q.x && fx < q.x + s.w / T && (fy === q.y || (q.tall && fy === q.y - 1)); });
    if (prop) return { desc: "The " + SLOT[prop.key].label.toLowerCase().replace(/^(the|a|an) /, "") + "." + dark, thumb: { slot: prop.key, bg: art.floor, dark: dk } };
    if (r.solid[fy] && r.solid[fy][fx]) return { desc: "A wall. Nicely painted, at least." + dark, thumb: { slot: art.upper, tile: true, dark: dk } };
    return { desc: "A blurry photo of the floor. Very artsy." + dark, thumb: { slot: art.floor, tile: true, blur: true, dark: dk } };
  }
  takePhoto() {
    const sub = this.photoSubject(), ph = this.progress.photos || (this.progress.photos = []);
    ph.unshift({ desc: sub.desc, piece: sub.piece || null, room: this.room.name.replace(/\s+/g, " "), thumb: sub.thumb || null, tod: this.tod() });
    if (ph.length > 40) ph.length = 40;
    this.progress.tally.photos = (this.progress.tally.photos || 0) + 1;
    this.saveProgress(); this.phoneT = 34; this.showLoc("Photo saved");
    if (/napping/.test(sub.desc)) this.quest("catPhoto");
  }
  photoPieces() {
    const seen = new Set(), out = [];
    for (const ph of this.progress.photos || []) if (ph.piece && !seen.has(ph.piece)) { const p = this.pack.pieces.find(x => x.id === ph.piece); if (p) { seen.add(ph.piece); out.push(p); } }
    return out.slice(0, 5);
  }
  /* ----- the Start menu: photos, save, save and quit ----- */
  openMenu() {
    const n = (this.progress.photos || []).length;
    const sc = this.cardStamps() + "/" + QUIZ_SIZE;
    const an = Object.keys(this.progress.ach || {}).length + "/" + this.pack.settings.achievements.length;
    const opts = ["Photos (" + n + ")", "Quiz card (" + sc + ")", "Achievements (" + an + ")", ...(this.progress.shirt ? ["Wardrobe"] : []), "Respawn", "Save", "Save and quit", "Back"];
    this.choose("PAUSED", opts, k => {
      const o = opts[k];
      if (o === "Wardrobe") {
        this.choose("Wardrobe", [this.progress.wearShirt ? "Take off the GOQ shirt" : "Wear the GOQ shirt", "Back"], j => {
          if (j === 0) { this.progress.wearShirt = !this.progress.wearShirt; this.saveProgress(); this.showLoc(this.progress.wearShirt ? "Looking sharp." : "Back to the usual."); }
        });
        return;
      }
      if (o.startsWith("Quiz card")) { this.showQuizCard(); return; }
      if (o.startsWith("Achievements")) { this.showAchievements(); return; }
      if (o === "Respawn") { this.respawn(); return; }
      const i = o.startsWith("Photos") ? 0 : o === "Save" ? 1 : o === "Save and quit" ? 2 : 3;
      if (i === 0) {
        const ph = this.progress.photos || [];
        if (!ph.length) { this.say(this.tx("photos.none")); return; }
        this.openAlbum();
      } else if (i === 1) { this.saveWhere(); this.say(this.tx("menu.saved")); }
      else if (i === 2) { this.saveWhere(); this.mode = "busy"; this.trans = { t: 0, dur: 24, switched: false, fn: () => this.showEnd("brb"), hold: true }; }
    });
  }
  /* ----- the photo album -----
     A grid of little snapshots, newest first, with the selected photo's description underneath.
     Arrows (or tap) to choose, A to look closer or delete, B to close. */
  photoThumb(ph) {
    const ck = "thumb|" + JSON.stringify(ph.thumb || ph.piece || "x");
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
    return (this.cache[ck] = c);
  }
  openAlbum() { this.mode = "album"; this.albumSel = 0; this.el.album.style.display = "block"; this.renderAlbum(); }
  closeAlbum() { this.el.album.style.display = "none"; this.mode = "walk"; this.inputLock = true; }
  renderAlbum() {
    const box = this.el.album, ph = this.progress.photos || [];
    if (!ph.length) { this.closeAlbum(); return; }
    this.albumSel = Math.max(0, Math.min(ph.length - 1, this.albumSel));
    box.innerHTML = "";
    const head = document.createElement("div"); head.className = "gt-shop-head";
    const t1 = document.createElement("span"); t1.textContent = "PHOTOS"; const t2 = document.createElement("span"); t2.textContent = (this.albumSel + 1) + " / " + ph.length;
    head.appendChild(t1); head.appendChild(t2); box.appendChild(head);
    const grid = document.createElement("div"); grid.className = "gt-album-grid"; box.appendChild(grid);
    ph.forEach((p, i) => {
      const cell = document.createElement("button"); cell.type = "button"; cell.className = "gt-polaroid" + (i === this.albumSel ? " on" : "");
      const img = document.createElement("img"); img.src = this.photoThumb(p).toDataURL(); img.alt = p.desc; cell.appendChild(img);
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
    this.choose("Photo " + (this.albumSel + 1) + " of " + ph.length + ".", ["Look closer", "Delete", "Back"], i => {
      const back = () => { this.mode = "album"; this.el.album.style.display = "block"; this.renderAlbum(); };
      if (i === 0) {
        this.el.cuFrame.style.borderImageSource = `url("${this.src("closeup_wood")}")`;
        this.el.cuImg.src = this.photoThumb(cur).toDataURL(); this.el.cuImg.alt = cur.desc; this.el.cuImg.classList.remove("photo", "item");
        this.el.cuLinks.innerHTML = ""; this.el.cu.style.display = "flex";
        this.say([cur.desc], () => { this.el.cu.style.display = "none"; back(); });
      } else if (i === 1) { ph.splice(this.albumSel, 1); this.saveProgress(); if (ph.length) back(); else this.say(this.tx("photos.none")); }
      else back();
    });
  }
  /* Someone's PC: a list of every archived piece. Pick one to see its art and placards; LOG OFF to leave. */
  someonesPC() {
    const list = this.archived || []; this.quest("pc");
    this.say(this.tx("pc.on"), () => {
      if (!list.length) { this.say(this.tx("pc.empty")); return; }
      const show = () => this.openList("SOMEONE'S PC: ARCHIVE", [...list.map(p => (p.pick ? { text: p.title, pick: true } : p.title)), "LOG OFF"], i => {
        const p = list[i]; if (!p) return;
        this.viewPiece(p); const done = this.rd && this.rd.done;
        this.rd.done = () => { if (done) done(); show(); };
      });
      show();
    });
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
  /* keep: the list stays open after a pick (the pick closes it with closeList). */
  openList(title, rows, pick, keep) {
    this.mode = "list"; this.list = { title, rows, pick, i: 0, keep: !!keep }; this.el.album.style.display = "block"; this.renderList();
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
  listPick() { const L = this.list; if (L.keep) { L.pick(L.i); return; } this.closeList(); L.pick(L.i); }
  closeList() { this.el.album.style.display = "none"; this.mode = "walk"; this.inputLock = true; this.list = null; }
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
  talkTo(npc) {
    if (npc.usher) { this.usherTalk(); return; }
    if (npc.role) { this.staffTalk(npc.role); return; }
    const r = npc.req, opts = [], photos = r ? this.photoPieces() : [];
    if (r && photos.length) opts.push("Show a photo");
    if (r) opts.push(r.asked ? "What was it again?" : "Can I help?");
    const named = pages => (npc.member ? pages.map((p, k) => (k === 0 ? npc.member + ": " + p : p)) : pages);
    const MOVE = "Could I get by?", canMove = !npc.sitting;
    if (!opts.length) {
      const chat = () => { npc.lineI = (npc.lineI + 1) % npc.lines.length; this.say(named(npc.lines[npc.lineI])); };
      if (!canMove) { chat(); return; }
      this.choose(npc.member ? npc.member + " smiles." : "They glance over.", ["Say hi", MOVE], i => { if (i === 0) chat(); else if (i === 1) this.askToMove(npc, named); }, -1);
      return;
    }
    if (canMove) opts.push(MOVE);
    opts.push("Just saying hi");
    this.choose(r.asked ? (npc.member ? npc.member + ": " : "") + "Any luck finding it?" : (npc.member || "They") + (npc.member ? " looks" : " look") + " a little lost.", opts, i => {
      if (i < 0) return; // B: just walk away
      const o = opts[i], hint = r.piece.hint || ("a piece called " + r.piece.title);
      if (o === "Show a photo") {
        this.choose("Which photo?", [...photos.map(p => p.title), "Never mind"], k => {
          const p = photos[k]; if (!p) return;
          if (p.id === r.piece.id) {
            npc.req = null; this.count("helped", r.piece.id); this.updateHud();
            this.say(this.tx("help.right", { title: r.piece.title }), () => this.sendTo(npc, r));
          } else this.say(this.tx("help.wrong", { hint }));
        });
      } else if (o === MOVE) this.askToMove(npc, named);
      else if (o === "Just saying hi") { npc.lineI = (npc.lineI + 1) % npc.lines.length; this.say(named(npc.lines[npc.lineI])); }
      else { r.asked = true; this.say(this.tx("help.ask", { hint })); }
    }, -1);
  }
  sendTo(n, r) {
    if (r.room !== this.room.id) { n.leaving = true; n.leaveT = 0; n.alpha = 1; return; }
    n.goal = [r.x, r.y]; n.still = false; n.helped = true; n.baseLines = n.baseLines || n.lines;
    n.lines = this.pack.settings.text["help.after"] || TEXT["help.after"].v; n.lineI = -1;
  }
  walkTo(n) {
    if (n.moving) { this.advance(n); return; }
    if (n.leaveT === undefined) n.leaveT = 0;
    if (++n.leaveT % 2) return;
    const [gx, gy] = n.goal, dist = Math.abs(gx - n.x) + Math.abs(gy - n.y);
    // Close enough, someone's already standing there, or no progress for a while: stop and look.
    if (n.best === undefined || dist < n.best) { n.best = dist; n.stall = 0; } else n.stall = (n.stall || 0) + 1;
    if (dist === 0 || (dist <= 2 && this.blocked(gx, gy, n)) || n.stall > 10 || n.leaveT > 600) {
      n.goal = null; n.still = true; n.leaveT = undefined; n.best = undefined;
      if (n.helped) n.admireT = 1200 + Math.random() * 1200; // 20 to 40 seconds with their piece
      n.dir = gy < n.y ? "up" : gy > n.y ? "down" : gx < n.x ? "left" : gx > n.x ? "right" : "up"; return;
    }
    const dx = Math.sign(gx - n.x), dy = Math.sign(gy - n.y), tries = Math.abs(gx - n.x) >= Math.abs(gy - n.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
    tries.push([0, dy || 1], [0, -(dy || 1)], [dx || 1, 0], [-(dx || 1), 0]);
    for (const [ax, ay] of tries) { if (!ax && !ay) continue; const d = ax > 0 ? "right" : ax < 0 ? "left" : ay > 0 ? "down" : "up"; if (!this.blocked(n.x + ax, n.y + ay, n)) { this.tryMove(n, d); return; } }
  }
  /* Sitting: on a café stool or a bench. Any direction stands you back up. With a drink, you sip now and then. */
  sit(e) {
    if (this.room.npcs.some(n => n.x === e.x && n.y === e.y)) { this.say(["Someone's already sitting there."]); return; }
    const p = this.player;
    p.sitFrom = [p.x, p.y]; p.x = e.x; p.y = e.y; p.dir = e.sit; p.sitting = true; p.moving = false; this.sipClock = 60; this.inputLock = true;
    p.bench = !!e.bench; this.sitIdle = 0; this.asleep = false;
    if (!this.drink && e.say) this.say(e.say);
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
    const o = { curator: this.curator, today, hung: this.hungNow, tod: this.tod(), crowd: this.crowdToday(), catRoom: catRooms[cs % catRooms.length], catIndex: cs >>> 5,
      mugRoom: this.progress.mug === today ? null : rooms[seed % rooms.length], mugIndex: seed >>> 4, closing: this.closing };
    let n = 0, m = 0; o.spotStart = {}; o.caseStart = {};
    for (const id of Object.keys(ROOMS)) { o.spotStart[id] = n; n += (ROOMS[id].spots || []).length; o.caseStart[id] = m; m += (ROOMS[id].cases || []).length; }
    const split = archiveSplit(this.pack.pieces);
    o.episodes = split.episodes; o.community = split.community; this.archived = split.archived;
    this.rooms = {}; Object.keys(ROOMS).forEach(id => (this.rooms[id] = buildRoom(id, this.pack.pieces, o)));
    if (!this.closing) this.giveRequests();
    this.assignMembers();
  }
  enterRoom(id, x, y, dir, quiet) {
    if (!this.rooms[id]) { id = "lobby"; [x, y, dir] = ROOMS.lobby.spawn; }
    if (this.progress && this.saveKey !== undefined && !this.full) { const v = this.progress.visited || (this.progress.visited = []); if (!v.includes(id)) { v.push(id); this.saveProgress(); } }
    this.room = this.rooms[id]; const p = this.player;
    if (id === "lobby" || id === "staff") this.refreshBoard();
    p.x = x; p.y = y; p.dir = dir; p.moving = false; p.prog = 0; p.sitting = false; this.sip = null; this.path = null; this.pathAct = null;
    this.updateHud();
    if (!quiet) this.showLoc(this.room.name.replace(/\s+/g, " ") + (ROOMS[id] && ROOMS[id].stairwell && ROOMS[id].floorSign && !this.room.name.includes(ROOMS[id].floorSign) ? " (" + ROOMS[id].floorSign + ")" : ""));
    if (ROOMS[id] && ROOMS[id].stairwell && !quiet) this.stairwellOddity();
  }
  warp(to, x, y, dir, after) { this.mode = "busy"; this.trans = { t: 0, dur: 14, switched: false, fn: () => this.enterRoom(to, x, y, dir), after }; }
  runEvent(e) {
    if (e.elevatorDoor || e.elevatorExit) { e = Object.assign({}, e); delete e.warp; }
    if (e.staffDoor) { this.staffDoor(e); return; }
    if (e.shopDoor) { this.shopDoor(e); return; }
    if (e.warp) this.warp(...e.warp);
    else if (e.caseAt) this.useCase(e.caseAt);
    else if (e.spot) {
      const s = e.spot;
      if (s.state === "covered") this.say(this.tx("painting.covered", { date: niceDate(s.piece.unveil), title: s.piece.title }));
      else if (s.state === "crate") this.hang(s);
      else if (!this.tidy(s)) this.viewPiece(s.piece, undefined, true); // a painting has one side: one read counts
    }
    else if (e.plant) {
      if (!this.isThirsty(e.plant)) { this.say(this.tx("plant.done", { room: e.name })); return; }
      this.progress.watered[e.plant] = todayISO(); this.count("watered", this.room.id + ":" + e.plant); this.saveProgress();
      this.quest("water");
      this.say(this.tx("plant.water", { room: e.name }));
    }
    else if (e.mug) {
      this.progress.mug = todayISO(); this.count("mugs"); this.saveProgress();
      this.room.mug = null; this.room.solid[e.y][e.x] = false; delete this.room.events[e.x + "," + e.y];
      this.say(this.tx("mug.found"));
    }
    else if (e.lights) this.toggleLights();
    else if (e.announce) this.announce();
    else if (e.frontDoor) this.frontDoor();
    else if (e.staffDoor) this.staffDoor(e);
    else if (e.timeClock) this.timeClock();
    else if (e.locker !== undefined) this.locker(e.locker);
    else if (e.corkboard) this.readCorkboard();
    else if (e.leaderboard) this.readLeaderboard();
    else if (e.eotm) this.readEotm();
    else if (e.rules) this.readRules();
    else if (e.usher) { const u = this.room.npcs.find(n => n.usher); if (u) this.usherTalk(); else this.readGuestbook(); }
    else if (e.window) this.lookOutWindow();
    else if (e.shopDoor) this.shopDoor(e);
    else if (e.shopCounter) this.shopCounter();
    else if (e.cafe) this.cafe();
    else if (e.trash) this.bin(e);
    else if (e.elevatorDoor) { this.elevatorAt = this.room.id; this.warp("elevator", 3, 5, "up"); }
    else if (e.elevatorExit) { if (ROOMS[this.elevatorAt] && this.elevatorAt === "storage") this.quest("elevatorB1"); const id = ROOMS[this.elevatorAt] && ROOMS[this.elevatorAt].elevatorStop ? this.elevatorAt : (Object.keys(ROOMS).find(k => ROOMS[k].elevatorStop) || "lobby"), st = ROOMS[id].elevatorStop || { x: ROOMS[id].spawn[0], y: ROOMS[id].spawn[1], dir: ROOMS[id].spawn[2] }; this.warp(id, st.x, st.y, st.dir); }
    else if (e.elevatorPanel) this.elevatorPanel();
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
    else if (e.say) this.say(e.say);
  }
  occupied(x, y, self) {
    return [this.player, ...this.room.npcs].some(c => c !== self && ((c.x === x && c.y === y) || (c.moving && c.x + DIRS[c.dir][0] === x && c.y + DIRS[c.dir][1] === y)));
  }
  blocked(x, y, self) { const r = this.room; return x < 0 || y < 0 || x >= r.w || y >= r.h || r.solid[y][x] || this.occupied(x, y, self); }
  tryMove(c, d) {
    c.dir = d; const [dx, dy] = DIRS[d], nx = c.x + dx, ny = c.y + dy;
    if (this.blocked(nx, ny, c)) {
      if (c === this.player) {
        const e = this.room.events[nx + "," + ny];
        if (e && e.bump && !this.inputLock) { this.inputLock = true; c.walking = false; if (!this.quizStopCheck()) this.runEvent(e); return false; }
        if (c.bumpT <= 0) { c.bumpT = 16; c.step = !c.step; }
      }
      return false;
    }
    c.moving = true; c.prog = 0; c.step = !c.step; return true;
  }
  advance(c) {
    if (c.bumpT > 0) c.bumpT--;
    if (!c.moving) return false;
    if (c.slow && (this.t & 1)) return false; // the night guard strolls at half speed
    if (c !== this.player && !c.slow && !c.goal && !c.leaving && !c.cue) { c.spd = (c.spd || 0) + this.pack.settings.staff.patronSpeed; if (c.spd < 1) return false; c.spd -= 1; } // patrons: slower than you
    if ((c.prog += c === this.player && this.segway ? 2 : 1) >= T) {
      c.x += DIRS[c.dir][0]; c.y += DIRS[c.dir][1]; c.prog = 0; c.moving = false;
      if (c === this.player) {
        this.stepInDark();
        const e = this.room.events[c.x + "," + c.y];
        if (e && e.step && !this.trans) { this.path = null; this.pathAct = null; c.walking = false; if (this.room.id === "stairwell" && e.warp[0] === "stairwell2") this.quest("stairsTo2F"); this.runEvent(e); }
        else if (!this.trans) this.quizStopCheck();
      }
      return true;
    }
    return false;
  }
  update() {
    this.t++;
    const q = this.queue; this.queue = [];
    // Up, up, down, down, left, right, left, right, B, A: a Segway. Enter it again to park it.
    if (this.mode === "walk") for (const k of q) if (KONAMI.includes(k)) {
      (this.kbuf = this.kbuf || []).push(k); if (this.kbuf.length > 10) this.kbuf.shift();
      if (this.kbuf.join() === KONAMI.join()) { this.kbuf = []; this.segway = !this.segway; if (this.segway) { this.progress.tally.segway = (this.progress.tally.segway || 0) + 1; this.saveProgress(); } this.konamiNow = true; this.showLoc(this.segway ? "SEGWAY UNLOCKED. Zoom zoom." : "Segway parked."); }
    }
    const has = k => q.includes(k);
    if (this.trans) {
      const tr = this.trans; tr.t++;
      if (tr.t <= tr.dur) this.fade = tr.t / tr.dur;
      else { if (!tr.switched) { tr.switched = true; tr.fn(); } this.fade = Math.max(0, 1 - (tr.t - tr.dur) / tr.dur); }
      if (tr.hold && tr.switched) { this.fade = 1; this.trans = null; }
      else if (tr.t >= tr.dur * 2) { this.trans = null; this.fade = 0; this.mode = "walk"; if (tr.after) tr.after(); }
    }
    this.updateHang(); this.updateChore(); this.updateSpooks(); this.updateSipping();
    if (this.petT > 0) this.petT--;
    if (this.t % 20 === 0) this.flushToasts();
    if (this.flickerT > 0) this.flickerT--;
    if (this.boomT > 0) this.boomT--;
    if (this.shakeT > 0) this.shakeT--;
    if (this.phoneT > 0) this.phoneT--;
    if (this.t % 2700 === 0 && !this.closing) { this.reqRound = (this.reqRound || 0) + 1; this.giveRequests(); }
    if (this.t % 600 === 0 && this.mode === "walk") {
      const t = this.tod(); if (this.lastTod && t !== this.lastTod) this.rebuild(); this.lastTod = t;
      const b = this.catBucket(); if (this.lastCat !== undefined && b !== this.lastCat) this.moveCat(); this.lastCat = b;
    }
    if (this.mode === "read") {
      const r = this.rd;
      if (has("left") && r.i > 0) { r.i--; this.renderRead(); }
      else if (has("a") || has("right")) { if (r.i < r.pages.length - 1) { r.i++; this.renderRead(); } else this.closeRead(); }
      else if (has("b") || has("start")) this.closeRead();
      return;
    }
    if (this.mode === "list") {
      const L = this.list, n = L.rows.length;
      if (has("up") || has("down")) { L.i = (L.i + (has("up") ? n - 1 : 1)) % n; this.renderList(); }
      if (has("a")) this.listPick(); else if (has("b") || has("start")) this.closeList();
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
      if (has("start") && !this.player.moving) { this.openMenu(); return; }
      const codeB = this.kbuf && this.kbuf.slice(-9).join() === KONAMI.slice(0, 9).join(); // the B in the code isn't a photo
      if (this.konamiNow) { this.konamiNow = false; return; }
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
        if (this.sitIdle > 720) { this.asleep = true; this.progress.tally.naps = (this.progress.tally.naps || 0) + 1; this.saveProgress(); this.showLoc("Zzz..."); if (this.room.id === "gallery2") this.quest("nap2F"); return; }
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
    if (npc) { npc.timer = 180; if (!npc.still || npc.req) npc.dir = OPP[p.dir]; if (npc.patrol) npc.pause = 120; this.talkTo(npc); return; }
    const e = this.room.events[fx + "," + fy]; if (e) this.runEvent(e);
  }
  updateNpcs() {
    const def = ROOMS[this.room.id];
    for (const n of this.room.npcs.slice()) {
      if (n.cue) { this.cueStep(n); continue; } // the usher, walking over with a quiz card or back to the desk
      if (n.leaving) { this.walkOut(n, def.exitTo || ROOMS[this.room.id].spawn); continue; }
      if (n.goal) { this.walkTo(n); continue; }
      if (n.moving) { this.advance(n); continue; }
      if (n.aside) { this.stepAside(n); continue; }
      if (n.admireT > 0) {
        if (this.mode === "walk" && --n.admireT <= 0) { n.still = false; n.helped = false; n.lines = n.baseLines || n.lines; n.baseLines = null; n.lineI = -1; n.timer = 60 + Math.random() * 120; n.route = null; }
        continue;
      }
      if (n.still) continue;
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
    if (n.timer > 0) { n.timer--; if (n.timer % 90 === 0 && Math.random() < 0.5) n.dir = DIRS_LIST[(Math.random() * 4) | 0]; return; }
    const r = this.room, noGo = (x, y) => r.noWander && r.noWander.has(x + "," + y);
    if (!n.route || !n.route.length) {
      const opts = [];
      for (let y = 3; y < r.h - 1; y++) for (let x = 1; x < r.w - 1; x++) if (!r.solid[y][x] && !noGo(x, y) && Math.abs(x - n.x) + Math.abs(y - n.y) > 2) opts.push([x, y]);
      const t = opts[(Math.random() * opts.length) | 0];
      n.route = t ? this.npcPath(n, t[0], t[1]) : null;
      if (!n.route || !n.route.length) { n.timer = 60 + Math.random() * 120; n.route = null; return; }
    }
    const d = n.route[0], [dx, dy] = DIRS[d];
    if (noGo(n.x + dx, n.y + dy) || !this.tryMove(n, d)) { n.route = null; n.timer = 30 + Math.random() * 60; n.dir = d; return; }
    n.route.shift();
    if (n.route.length) { n.stepWait = Math.round(8 * (1 - this.pack.settings.staff.patronSpeed) / this.pack.settings.staff.patronSpeed); return; }
    n.timer = 180 + Math.random() * 300; // arrived: stay a while
    // Stopping right next to a case now and then leaves a fingerprint (not every time).
    const ax = n.x + dx, ay = n.y + dy, amt = this.pack.settings.staff.fingerprints;
    const near = this.room.cases.find(c => c.piece && c.state === "wall" && Math.abs(c.x - ax) + Math.abs(c.y - ay) === 1);
    if (near && amt > 0 && Math.random() < amt * 0.5) { const xp = this.extraPrints || (this.extraPrints = {}); xp[near.piece.id] = Math.min(3, (xp[near.piece.id] || 0) + 1); }
  }
  /* Shortest route for a visitor, around walls, furniture, people and no-go tiles (at most 40 steps). anywhere: no-go tiles are fine (staff on an errand). */
  npcPath(n, tx, ty, anywhere) {
    const r = this.room, W = r.w, prev = new Map(), start = n.y * W + n.x, goal = ty * W + tx, q = [start];
    prev.set(start, -1);
    while (q.length) {
      const c = q.shift(); if (c === goal) break;
      const cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = cx + dx, ny = cy + dy, k = ny * W + nx;
        if (nx < 1 || ny < 3 || nx >= W - 1 || ny >= r.h - 1 || prev.has(k) || this.blocked(nx, ny, n) || (!anywhere && r.noWander && r.noWander.has(nx + "," + ny))) continue;
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
    if (n.fading) { n.alpha -= 1 / 24; if (n.alpha <= 0) this.room.npcs = this.room.npcs.filter(m => m !== n); return; }
    if (n.moving) { this.advance(n); return; }
    if (n.leaveT < 0 || n.leaveT % 2) return;
    const dx = Math.sign(to[0] - n.x), dy = Math.sign(to[1] - n.y);
    if ((!dx && !dy) || n.leaveT > 360) { n.fading = true; n.dir = "down"; return; }
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
    const ctx = this.ctx, off = this.lightsOff.has(r.id), L = this.pack.settings.lighting[r.id] || ROOMS[r.id].light;
    const tod = this.tod(), nd = NIGHT_DIM[r.id] !== undefined ? NIGHT_DIM[r.id] : 0.12, extra = tod === "night" ? nd : tod === "sunset" ? nd / 3 : 0;
    const guards = r.npcs.filter(n => n.patrol);
    const dim = off ? 0.86 : Math.min(0.85, L.dim + extra), spots = off ? 0.9 : L.spots;
    if (dim <= 0.01) return;
    if (!this.darkC) { this.darkC = document.createElement("canvas"); this.darkC.width = SW; this.darkC.height = SH; }
    const d = this.darkC.getContext("2d");
    d.globalCompositeOperation = "source-over"; d.clearRect(0, 0, SW, SH);
    d.fillStyle = "rgba(10,8,24," + dim + ")"; d.fillRect(0, 0, SW, SH);
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
    if (r.intercomAt) hole(r.intercomAt.x * T + 8 - cx, r.intercomAt.y * T + 8 - cy, 9, 9, 0.6);
    if (!off) for (const [gx, gy] of r.glows) hole(gx * T + 8 - cx, gy * T - cy, 30, 26, 0.85); // lamps go dark with the lights
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
  /* People walking behind something tall are hidden by its top: redraw the part above each tall thing's base after the people. */
  drawUppers(r, cx, cy) {
    const ctx = this.ctx, clip = (x, y, w, h, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); };
    for (const c of r.cases) clip(c.x * T - cx, c.y * T - T - cy, T, T, () => this.drawCase(c, cx, cy));
    for (const p of r.props) { const s = SLOT[p.key]; if (s && s.h > T) clip(p.x * T - cx, p.y * T - (s.h - T) - cy, s.w, s.h - T, () => this.drawProp(p, cx, cy)); }
    if (r.featuredAt) clip(r.featuredAt.x * T - cx, r.featuredAt.y * T - T - cy, T, T, () => this.drawFeatured(r, cx, cy));
  }
  /* The drink in your hand; lifted to your mouth while sipping, with a little steam. */
  drawCup(sx, sy, c) {
    const k = this.drink.kind, s = this.sip, up = s && s.t > 6 && s.t < 36;
    const x = up ? { down: 4, up: 4, left: 2, right: 6 }[c.dir] : { down: 11, up: 2, left: 1, right: 8 }[c.dir], y = up ? 6 : 9;
    if (this.drink.empty) { this.drawSlot("cup_empty", 0, 0, sx + x, sy + y); return; }
    this.drawSlot("cups", k, 0, sx + x, sy + y);
    if (up || (c.sitting && this.t % 90 < 40)) this.drawSlot("steam", Math.floor(this.t / 8) % 3, 0, sx + x, sy + y - 7);
  }
  /* The floor tile just inside each doorway, for its mat. */
  doorMats(r) {
    if (r._mats) return r._mats;
    const out = [];
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const o = r.over[y][x]; if (!o) continue;
      const at = /doorway_lower|staff_door_lower/.test(o) ? [x, y + 1] : /doorway_bottom|exit_door/.test(o) ? [x, y - 1] : o === "doorway_side" ? [x === 0 ? 1 : x - 1, y] : null;
      if (at && r.solid[at[1]] && !r.solid[at[1]][at[0]]) out.push(at);
    }
    return (r._mats = out);
  }
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
    const cy = full ? 0 : Math.round(rh <= SH ? (rh - SH) / 2 : Math.max(0, Math.min(rh - SH, pp.y + 8 - SH / 2)));
    if (!full) { this.camX = cx; this.camY = cy; }
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const sx = x * T - cx, sy = y * T - cy; if (sx < -T || sx > VWp || sy < -T || sy > VHp) continue;
      this.drawSlot(r.tiles[y][x], this.frame(r.tiles[y][x]), 0, sx, sy);
      if (r.over[y][x]) this.drawSlot(r.over[y][x], this.frame(r.over[y][x]), 0, sx, sy);
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
    if (r.wallArt) r.wallArt.forEach(w => this.drawSlot(w.key, 0, 0, w.x * T - cx, T - cy));
    const fs = ROOMS[r.id] && ROOMS[r.id].floorSign, fi = ["B1", "1F", "2F", "3F", "4F", "5F"].indexOf(fs);
    if (fi >= 0 && ROOMS[r.id].stairwell) this.drawSlot("floor_sign", fi, 0, (Math.floor(r.w / 2) - 1) * T - cx, T - cy);
    if (r.bunting) for (let x = 1; x < r.w - 1; x++) this.drawSlot("bunting", 0, 0, x * T - cx, T - cy);
    if (r.switchAt) this.drawSlot("light_switch", 0, 0, r.switchAt.x * T - cx, r.switchAt.y * T - cy);
    if (r.intercomAt) this.drawSlot("intercom", 0, 0, r.intercomAt.x * T - cx, r.intercomAt.y * T - cy);
    if (r.panelAt) this.drawSlot("elevator_panel", 0, 0, r.panelAt.x * T - cx, r.panelAt.y * T - cy);
    for (const d of r.decals) this.drawSlot(d.key, 0, 0, d.x * T - cx, d.y * T - cy);
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
      const sx = Math.round(p.x - cx), sy = Math.round(p.y - cy - 4) + (c.sitting ? 2 : 0) - (c === this.player && this.segway && !c.sitting ? 4 : 0);
      const cupFirst = c === this.player && this.drink && c.dir === "up";
      if (cupFirst) this.drawCup(sx, sy, c);
      this.drawSlot(sheet, c.sitting ? 0 : col, DIR_ROW[c.dir], sx, sy);
      if (c === this.player && this.drink && !cupFirst) this.drawCup(sx, sy, c);
      if (c === this.player && this.phoneT > 0) {
        if (this.phoneT === 16) this.flash = 6;
        const ox = { down: 4, up: 4, left: 0, right: 8 }[c.dir]; if (c.dir !== "up") this.drawSlot("phone", 0, 0, sx + ox, sy + 4);
      }
      if (c === this.player && this.asleep && this.t % 120 < 90) { const zy = Math.floor((this.t % 120) / 30); ctx.fillStyle = "#f8f8f0"; ctx.font = "6px monospace"; ctx.fillText("z", sx + 12 + zy, sy - zy * 3); }
      if (c.member && !c.leaving && !this.full && Math.abs(c.x - this.player.x) + Math.abs(c.y - this.player.y) <= 2) {
        ctx.font = "6px monospace"; const w = Math.ceil(ctx.measureText(c.member).width) + 4, nx = Math.round(sx + 8 - w / 2), ny = sy - (c.req ? 18 : 8);
        ctx.fillStyle = "rgba(24,24,32,.85)"; ctx.fillRect(nx, ny, w, 8); ctx.fillStyle = "#f8f0c0"; ctx.textBaseline = "top"; ctx.fillText(c.member, nx + 2, ny + 1);
      }
      if (c.req && !c.leaving) this.drawSlot("bubble", c.req.asked ? 1 : 0, 0, sx + 4, sy - 9 + (Math.floor(this.t / 20) % 2));
      ctx.globalAlpha = 1;
    }
    this.drawUppers(r, cx, cy);
    if (full) return;
    this.drawLighting(r, cx, cy, pp);
    if (this.figure && this.lightsOff.has(r.id)) {
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
      ctx.fillStyle = g; ctx.fillRect(x0 - 30, y0 - 30, 60, 60); this.flash--;
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
const VERSION = "2026-10-04 quiz";
window.GOQ = { ACH_STATS, SAMPLE_ACH, archiveSplit, VERSION, TEXT, TALK_ROLES, TALK_WHEN, TALK_DEFAULTS, DEFAULT_CORKBOARD, daysBetween, PACK_FORMAT, SLOTS, SLOT, sheetGrid, placeholder, normalizePack, normalizePiece, normalizeQuiz, QUIZ_SIZE, SAMPLE_PIECES, ROOMS, Game, mountControls, todayISO, niceDate,
  spotCount: () => Object.values(ROOMS).reduce((a, r) => a + (r.spots || []).length, 0),
  caseCount: () => Object.values(ROOMS).reduce((a, r) => a + (r.cases || []).length, 0),
  spotRooms: () => Object.keys(ROOMS).filter(id => (ROOMS[id].spots || []).length).map(id => ({ id, name: ROOMS[id].name, n: ROOMS[id].spots.length })),
  BUILTIN_ROOMS, applyRooms, normalizeRoom, SLOTS_BY_KEY: SLOT,
  placeholderPainting: p => { const n = normalizePiece(p, 0); return paint([paintingGrid(n)], 24, 18, 1, n.colors); } };
})();
