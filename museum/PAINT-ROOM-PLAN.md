# Paint Room: plan and handoff

Written 2026-10-13. Branch: `paint-prog`. Scope: the `museum/` folder only.

This is both the spec and the handoff. If a session gets cut off, a new one should be able to read this file, check **Progress** at the bottom, and pick up where we left off. Keep **Progress** and **Decisions log** current with every commit.

---

## What we're building

`museum/paint-room.html`: a phone-first pixel painter for every replaceable sprite in the museum game. It's a sibling of `writers-room.html`. The Writers' Room has you write the museum's lines one a day; the Paint Room has you repaint its sprites one a day.

- Every sprite slot the game can replace is listed, searchable and grouped. There are **197 slots in 24 groups** today, read live from `GOQ.SLOTS`, so new slots show up on their own.
- For each slot you either **paint a replacement** or **keep the original**. The goal is every slot done one way or the other.
- It's a daily journal. Saving a sprite (painted or kept) stamps the day on a monthly punch card, groups light up as they fill, and finishing a group earns a badge.
- The editor is simple, like Animal Crossing's pattern maker: a grid, a palette, a few tools and a live preview.
- **Art only, never anything else.** The Paint Room keeps its own library of your sprites. When it makes a pack, it starts from the **newest `museum-pack.json` in the folder** and changes only the `assets` entries for sprites you painted here. Rooms, pieces, settings, text and other people's art are copied through untouched. See **Art-only safety** below. There's also a ZIP of PNGs as a backup and for use outside the game.
- Previews: quick mockups inside the editor, plus a "See it in the museum" button that runs the real engine with your art.

### Out of scope

- Room lighting, text and pieces (the curator and Writers' Room cover those).
- Clip thumbnails in `images/` and `thumbs/` (those are photos, not sprite slots).
- Engine changes. The Paint Room reads the engine; it shouldn't need to change it. If it does, the four version strings must be bumped (see `UPDATING.md`).

---

## How the game's art works (what we learned)

- **Slots** are defined in `museum-engine.js` (`const SLOTS = [...]`, around line 1184). Each has `key`, `label`, `group`, `w`, `h`, plus optional `frames`, `layout: "char"` and a `note` (for example "leave everything outside the door transparent").
- **Sheet size**: `GOQ.sheetGrid(slot)` gives the columns and rows. A normal slot is `frames` columns by 1 row. A `"char"` slot is 3 columns (standing, left step, right step) by 4 rows (facing down, up, left, right), so each frame is 16×16 and the sheet is 48×64.
- **Original art**: `GOQ.placeholder(key)` returns a canvas of the built-in art at sheet size.
- **Art in use**: `game.sheet(key)` returns a canvas of the custom art if there is any, otherwise the built-in.
- **Custom art lives in the pack**, not in files: `museum-pack.json` → `assets[key] = { src: "data:image/png;base64,..." }`. Today it holds `joe`, `goq_shades` and `goq_hat`. The game never reads loose PNGs.
- **The shared draft**: `localStorage["goq-curator-draft"]` is the pack being edited in this browser. The curator and the Writers' Room both use it, along with `goq-curator-base`, which records which folder pack the draft came from. The Writers' Room's own progress is under `goq-writers-room`.
- **Loading the engine**: the Writers' Room fetches `version.json` and loads `museum-engine.js?v=<version>`, so it never needs its own version bump. The Paint Room does the same.
- **The curator's atlas** (`curator.html`, `atlasLayout()`) puts every slot on one 352-wide sheet. Its import compares pixels against the in-use and built-in art. We may also export that atlas format (optional, Phase 6).
- **Special slots** to handle with care:
  - `visitor_shirt`: gray only, because the game tints it per visitor. It's only drawn over visitor sheets that haven't been replaced.
  - Door and overlay slots: transparency matters (`OVER_NOTE`).
  - Big ones: the murals are 256×16, `theater_screen` is 96×48 with 2 frames, and there are several 48×32 pieces. The grid has to zoom and pan.
  - Tiny ones: `aisle_light` is 4×3, and many are 8×8.
- **Rooms** for the real-engine preview (from `GOQ.ROOMS`): outside, lobby, museum, storage, staff, office, screening (plus tutorial rooms). `game.teleport(id)` jumps there.

---

## Screens

The look follows the Writers' Room: same fonts (Press Start 2P for headings, Atkinson Hyperlegible for body), same colors and light/dark themes, a 560px column, big touch targets and a bottom dock.

### 1. Home ("the journal")

- **Today's sprite**: a card suggesting the next one to do (unfinished groups first, small sprites before huge ones), with **Paint it** and **Keep original** buttons. After the day is stamped it reads "Stamped for today", with a "One more" button.
- **Punch card**: the current month's calendar. Days you saved at least one sprite are stamped. A footer shows the total so far.
- **Gallery wings**: one row per group with a little "window" that fills as the group's slots get done (like the Writers' Room's rooms lighting up). A finished group shows its badge.
- **Overall bar**: "X of 199 sprites painted or kept."

### 2. Find (the searchable list)

- A search box that matches label, key, group and note. It also supports `is:painted`, `is:kept`, `is:todo` and `is:animated`.
- Filter chips: group, status (To do / Painted / Kept / In progress) and size.
- Each slot is a tile with its thumbnail (animated ones play on tap), name, size and a status dot.

### 3. Editor (the pattern maker)

From top to bottom on a phone:

1. **Header**: the slot's name, its size, the frame count and the slot note (collapsible). Buttons: back, and **Save** (the main one).
2. **Live preview**: the sprite at 1×, 2× and 4× on a checkerboard (or a chosen background), always visible. Animated sprites play at game speed.
3. **Grid**: the canvas, pinch to zoom and two fingers to pan, with optional grid lines (and lines every 8 or 16 pixels). Mirror guide lines when mirror is on.
4. **Frame strip** (only for slots with more than one frame): thumbnails of every frame. Character sheets are labeled by direction and step. Buttons for copy to next, paste, clear frame, onion skin on/off (a faint ghost of the previous frame), and play.
5. **Tools**: pencil, eraser, fill, eyedropper, line, rectangle (outline and filled), circle (outline and filled), select (move, flip horizontally or vertically, rotate 90°), mirror horizontal or vertical, undo and redo.
6. **Palette**: see below.
7. **More**: load the original (resets the grid to built-in art, undoable); load what's in use; import a PNG or photo as a **trace layer** (faint, under the grid, adjustable opacity, scale and offset; never saved); import a PNG as pixels (must match the size or a clean 2×/3×/4× of it, same rule as the curator); background for the preview; **Scenes** (below).

**Editing starts from the art in use**: your custom art if you've saved some, otherwise the original.

### Palette

- **Sprite colors**: pulled automatically from the sprite's original art (every distinct color, transparent first). Tap to paint; long-press to change the color. Changing a swatch's color can optionally recolor every pixel of that color in the sprite, the way Animal Crossing's palette edit does.
- **My swatches**: a list you grow yourself. Each swatch has a **name** ("Joe's hoodie", "café wood") and a color. Add, rename, recolor, reorder and delete. It's saved across all sprites, so you can reuse colors anywhere.
- A color picker (hue/saturation/value plus a hex field) for any swatch at any time.
- A transparent swatch is always there.

### Scenes (preview)

**Quick mockups** draw instantly with the current unsaved pixels:

- **Tile**: the sprite repeated 3×3, for floors, walls and carpets.
- **In a room**: on a matching floor and wall, using the room's current floor and wall art.
- **On a shelf / table / counter**: for 8×8 and small items (cups, trinkets, items).
- **In a hand**: held by the player sprite, for `held_items`, the phone and cups.
- **Walk cycle**: character sheets walking in all four directions; animated slots looping.
- **Day / sunset / night** tint, so you can see it under the game's lighting.

**See it in the museum** opens the real engine (`new GOQ.Game(..., { curator: true, saveKey: null })`, like the curator's preview) on the folder's current pack, with your library art and the unsaved sprite layered on in memory only (nothing is saved). It teleports to the room where that slot appears, from a slot-to-room map we keep in the page (falling back to the lobby). It's heavier, so it only loads when asked.

### 4. Export

- **Export pack (art only)**: fetches the folder's current `museum-pack.json` fresh (no cache), adds your art into `assets`, and downloads it. A summary screen comes first (see **Art-only safety**). This is how art reaches players: replace `museum/museum-pack.json` in the repo and merge to main.
- **Download PNGs (ZIP)**: `paint-room-<date>.zip` containing
  ```
  sprites/<group-slug>/<slot_key>.png   one full sheet per slot you've painted
  sprites/manifest.json                 key, label, group, w, h, frames, layout, status, savedAt
  ```
  An "include originals" option adds every untouched slot too. The ZIP is written by a small built-in store-only ZIP writer, with no library.
- **Single PNG**: from the editor, download the current slot as `<slot_key>.png`.
- (Optional) **Curator atlas**: the same 352-wide atlas the curator imports.

---

## Data and saving

| What | Where | Notes |
|---|---|---|
| **Your art library** (the source of truth) | IndexedDB `goq-paint-room` → `art[key]` | `{ png, w, h, frames, layout, savedAt, origHash }`. Lives only in the Paint Room, so a pack refresh can't wipe it. |
| Keep original | Same store, `kept[key]` | Not in the pack. The game already uses the original. |
| Work in progress (unsaved pixels, per slot) and my swatches | Same store | Kept out of localStorage so it doesn't crowd the curator's draft (the pack alone is about 1.7 MB; localStorage holds about 5 MB). |
| Daily stamps, totals, badges, last group | `localStorage["goq-paint-room"]` | Same shape as the Writers' Room (`days`, `total`, ...). |

- **Save** writes the PNG into the art library, marks the slot **Painted**, stamps today and clears that slot's work in progress. It doesn't touch any pack.
- **Use the original again** removes the slot from the library and marks it **To do**. The next art-only export then removes that slot's `assets` entry, but only if the entry is the one the Paint Room put there.
- A sprite that's identical to the original after editing is treated as **Keep original**, not as custom art, so the pack stays small.

## Art-only safety

You update the game often. A newer build may drop sprites, add new ones, resize them or change rooms. The Paint Room must never overwrite anything but the art you painted in it.

**Rules**

1. **The Paint Room never exports the browser draft.** Every pack it makes is built on the folder's current `museum-pack.json`, fetched fresh at that moment. Every key except `assets` (and `savedAt`, set to now so the curator treats it as newer) is copied byte for byte.
2. **It only writes `assets` entries for slots it owns**: slots with art in its library. Assets it didn't make (Joe, the GOQ shades and hat today, or anything added in the curator) are left exactly as they are.
3. **The slot list comes from the engine the folder serves now** (`GOQ.SLOTS`), never from a saved copy. Each library sprite is checked against it at export:

| Check | What happens |
|---|---|
| Slot still exists, same size and frames | Written into `assets`. |
| Slot no longer exists in this build | **Skipped.** Kept in the library under "Not in this build", in case it comes back. |
| Slot exists but its size or frame count changed | **Skipped.** Flagged "Size changed: redo or resize". The editor offers to place the old art on the new grid as a starting point. |
| The pack already has different art for that slot (from the curator or elsewhere) | **Not overwritten** unless you tick it on the summary screen. The default keeps the pack's. |
| The original built-in art changed since you painted it (`origHash` differs) | Still exported, but flagged "Original updated" on Find so you can look again. |

4. **The summary screen before download** lists what will be added, replaced, removed and skipped, and says "Nothing else in the pack changes." Nothing downloads without it.
5. **Offline or opened as a file** (no folder pack to fetch): no pack export. You can choose your own `museum-pack.json` from your device to build on instead, with the same rules, or download the ZIP / an art-only file.
6. **Art-only file**: `museum-art.json` (`{ format: "goq-art", savedAt, assets: {...} }`) holds only your sprites. Phase 6 adds a matching **Import art** button to the curator that merges it into its draft by the same rules, so art can reach the curator without anything else coming along.
7. **The curator's draft is optional and art-only too.** A "Send to the curator" button re-reads `goq-curator-draft` from storage at that moment, changes only `assets[key]` for owned slots (with the same checks), and writes it back. It never rewrites rooms or settings, and it's never needed to get art into the game.

---

## Build order (phases)

1. **Skeleton**: `paint-room.html`, engine loading via `version.json`, the art library (IndexedDB), the Home and Find screens with real slot data and thumbnails, a link from the curator's menu next to the Writers' Room.
2. **Core editor**: the grid with zoom and pan, pencil, eraser, fill, eyedropper, undo and redo, the live preview, sprite colors pulled from the original, Save to the library, Keep original.
3. **Frames**: the frame strip, onion skin, copy and paste a frame, animation playback, character-sheet labels.
4. **Palette and tools**: named swatches (IndexedDB), the color picker, recolor-all, line, rectangle, circle, select (move, flip, rotate), mirror, the trace layer.
5. **Journal**: punch card, Today's sprite, wings lighting up, badges, totals.
6. **Export**: the art-only pack export (fresh folder pack, slot checks, summary screen), the art-only file plus the curator's **Import art** button, Send to the curator, the ZIP of PNGs plus manifest, single PNG, (optional) atlas.
7. **Scenes**: quick mockups, then "See it in the museum" with the slot-to-room map.
8. **Polish and test**: test on a phone-sized screen (Playwright at 390×844), dark mode, check the curator sees saved art, update `UPDATING.md` with a Paint Room section.

---

## Decisions log

- 2026-10-13: Name **Paint Room** (`paint-room.html`). (Joe)
- 2026-10-13: Saving goes both ways: a pack export is the game's route, and a ZIP of PNGs is the backup. (Joe)
- 2026-10-13: **Art only.** The pack changes often between builds, so the Paint Room keeps its own art library, builds every export on the folder's fresh `museum-pack.json`, and changes only `assets` entries it owns. Retired or resized slots are skipped, not forced in, and there's a summary before every download. This replaces "save into the shared draft". (Joe)
- 2026-10-13: Palette starts with the original's colors; named, growable swatches can take any color at any time. (Joe)
- 2026-10-13: Scenes include both quick mockups and the real engine. (Joe)
- 2026-10-13: Multi-frame slots use a frame strip with onion skin. (Joe)
- 2026-10-13: Rewards work like the Writers' Room: painted or kept stamps the day, groups light up, and finishing a group earns a badge. The punch card is separate from the Writers' Room's. (Joe)
- 2026-10-13: Extra tools: line, rectangle and circle; select with move, flip and rotate; trace a photo or PNG. (Joe)
- 2026-10-13: Slots that already have custom art in the folder pack (made elsewhere, like Joe) show as **In the pack** and count as done. They have no "Keep original" button. Painting one is allowed, but export won't replace the pack's art unless it's ticked. (Claude)
- 2026-10-13: Added a **Move** tool (one-finger or mouse pan), so desktop and one-handed use can get around long sprites like the murals. (Claude)
- 2026-10-13: Context preview is a live crop from the real engine instead of a hand-kept slot-to-room map, so it follows new builds and rooms by itself. (Joe asked; Claude chose the method)
- 2026-10-13: Multi-frame slots can be previewed as an animation or as separate pictures, with a custom play order; this is preview-only because the engine decides frame timing. (Joe asked; Claude chose the defaults from the engine notes)
- 2026-10-13: Work in progress and swatches go in IndexedDB, not localStorage, because of storage limits. (Claude)

---

## Progress

Check items off as they land, and note the commit.

### Phase 0: Planning
- [x] Create the `paint-prog` branch, sparse checkout to `museum/`
- [x] Survey the atlas, slots, pack assets and the Writers' Room
- [x] Questions answered
- [x] This plan written

### Phase 1: Skeleton
- [x] `paint-room.html` loads the engine via `version.json`
- [x] Art library in IndexedDB (stores: art, kept, wip, misc), with a memory fallback and a warning
- [x] Home screen layout
- [x] Find screen: search (plus `is:` words), group picker, status and size chips, thumbnails, status dots
- [x] Slot page: original vs in use (animated), notes, facts, Keep original / Undo keep
- [x] Link from the curator's menu (More, next to Writers' Room)

### Phase 2: Core editor
- [x] Grid render, zoom and pan (pinch, two fingers, mouse wheel, −/Fit/+ buttons, grid lines with a stronger line every 8)
- [x] Pencil (with lines between touch points), eraser, fill (within the frame), eyedropper ("Pick")
- [x] **Move** tool (pan with one finger or a mouse) and wide-sprite fit (murals open zoomed in on the left end)
- [x] Undo and redo (buttons; Ctrl/Cmd+Z, Ctrl+Y, Shift+Ctrl+Z; up to 150 steps)
- [x] Live preview (1×, 2×, 4× where they fit, plus a playing animation for multi-frame slots)
- [x] Sprite colors from the original (most used first), then any other colors in the art; "+" opens the system color picker
- [x] Save to the library; painting back to the exact original counts as Keep original; Use original (slot page) removes the painting
- [x] Work-in-progress autosave (IndexedDB, 0.6 s after each change and when leaving), resumed on reopen, "Start over" under More
- [x] More: load the original, load your saved or the pack's version, clear this frame, download PNG

### Phase 3: Frames
- [x] Frame strip (character labels for `char` slots), done early in Phase 2 because the editor needs it to reach other frames
- [x] Onion skin (**Ghost**, remembered): a walk-sheet step ghosts its standing pose, a standing pose ghosts facing down; strips ghost the frame before (the first ghosts the last, for loops). Drawn at about a third strength behind the frame.
- [x] Copy, paste, **Copy to next**, **Flip ↔** and clear a frame. The copied frame stays while the page is open, so it can be pasted into another sprite of the same size. Single-frame sprites get Copy and Paste under More.
- [x] Animation playback in the preview (characters walk in the direction of the current frame)
- [x] **Plays as** (Joe 10/13): any multi-frame slot can be an **Animation** or **Separate pictures** (a set the game picks one from, like the reactions, cups, litter and carpet pieces, or states it switches between, like TV off/on and the keypad). Defaults follow the engine (`FRAME_SETS`). Separate pictures preview side by side; animations get a custom **play order** (+1, +2, ⌫, Reset) and **speed**. Saved per slot in DB misc `frameModes`. Frame names where the game gives them (`FRAME_NAMES`). Preview only: the game decides which frame shows when.

### Phase 4: Palette and tools
- [x] Named swatches ("My swatches"): add, rename, delete, **recolor and reorder** (Edit → tap a swatch: name, color, ‹ Earlier / Later ›)
- [x] Color sheet instead of the system picker: hue, saturation, brightness, **see-through** sliders plus a hex box (`#RRGGBB` or `#RRGGBBAA`)
- [x] Recolor-all: tap the big current swatch → "Also repaint every pixel of this color, in every frame" (on by default when the color is used)
- [x] Line, Box and Oval; tap Box or Oval again for **Solid**
- [x] Select: drag a box, drag inside it to move; Flip ↔ / ↕, Turn ↻, Copy, Paste selection (where it was copied, so it carries between frames), Delete, Done
- [x] Mirror painting: tap to cycle ↔, ↕, ✣ (all four), off; gold guide lines; works for pencil, eraser, shapes and fill
- [x] Trace layer (More → Trace a picture…): strength, size, Move picture, On top, Remove. Never saved; kept per sprite while the page is open
- [x] Import a PNG as pixels (More): the whole sheet or one frame, at size or any clean whole-number upscale

### Phase 5: Journal
- [x] Punch card (done early, in Phase 1)
- [x] Today's sprite suggestion (in progress first, then your last group, small before big; "Another" skips)
- [x] Wings light up per group, with a ★ when a group is full
- [ ] Group badges: a proper badge shelf, beyond the ★ (totals are done)

### Phase 6: Export
- [x] Art-only pack export (Home → **Put my art in the game**): fresh folder pack; only owned `assets` change. Verified byte-identical outside `assets` and `savedAt`
- [x] Slot checks: not in this build, size changed (skipped); already has other art ("clash", unticked by default); original updated (note). Ownership is DB misc `exported`: key → hashes of what the Paint Room wrote, so it can replace or remove its own earlier art
- [x] Summary screen before download (Add / Replace / Remove / Already has other art / Skipped / Worth a look)
- [x] Offline or no folder pack: build on a museum-pack.json picked from the device
- [x] `museum-art.json` art-only file (`{ format: "goq-art", assets, ours, remove }`) plus the curator's **Import art** (More menu), same rules
- [x] "Send to the curator": re-reads `goq-curator-draft` at that moment, changes only `assets`, marks `goq-curator-base` edited so the curator asks before swapping it for the site's pack
- [x] ZIP of PNGs plus `manifest.json` (built-in stored ZIP writer), with "include the rest"
- [x] Single PNG download (painter → More)
- [ ] (Optional) curator atlas export

### Phase 7: Scenes
- [ ] Tile mockup
- [ ] Room floor and wall mockup
- [ ] Shelf, table and counter mockup
- [ ] In-hand mockup
- [ ] Walk cycle and loop
- [ ] Day, sunset and night tint
- [x] **In the game** window in the painter (done early, Joe asked 10/13): a hidden headless engine draws each room whole, finds where the sprite lands, and shows a live crop around it while you paint. "Next" steps through spots. Hide/Show is remembered. Replaces the hand-kept slot-to-room map.
- [ ] Bigger "See it in the museum" (walk around with your art), if still wanted after the window

### Phase 8: Polish and test
- [ ] Phone-size test (Playwright 390×844), light and dark
- [ ] The curator shows art saved in the Paint Room
- [ ] `UPDATING.md`: Paint Room section
- [ ] Handoff notes below are up to date

### Handoff notes (latest state)

- 2026-10-13: Frame modes added (see Phase 3). `frameSettings(s)` / `setFrameSettings(key, patch)` are module-level; `animated()` (slot page, Today) and the painter's preview (`paintFs()`, the `tick` timeout chain, the `setC` row) follow them. Walk sheets (`layout: "char"`) are fixed and get no panel. Tested: reactions default to separate pictures with names; switching to Animation with order 1,2,1,3 survives a reload; the cat defaults to 1,2.

- 2026-10-13, Phase 6 done: `renderExport()` with `planArt()` / `applyArt()` / `planView()`, `noteExported()`, `zip()`. The curator got **Import art** (`#artFile`, art-only merge with the same rules). Version strings bumped to `2026-11-18 paint 41` in all four places (engine, museum.html, curator.html, version.json). `UPDATING.md` has a Paint Room section. Tested end to end in Playwright: first export adds the cat, leaves Joe (clash) and skips a stale wrong-size sprite, with everything else in the pack byte-identical; after "committing" that pack, a repaint is **Replace** and Use original is **Remove**; curator Import art asks before replacing Joe; Send to the curator; the ZIP opens (197 files, valid PNGs). Next: Phase 5's badge shelf, Phase 7 (scene mockups), Phase 8 (polish).

- 2026-10-13, Phase 4 done. In `renderPaint()`: `plot()` paints through the mirror (`mirror` is "", "x", "y" or "xy"); `shape()` draws line, box and oval while dragging (from `stroke.before` each move); selection state `sel` with `lift()` / `restamp()` / `selDo()` / `selCopy()` / `selPaste()` (undo, frame changes, tool changes and Done drop it, see `dropSel()`); `colorSheet(o)` is the color dialog (used by `changeColor()`, the + swatch and `editSwatch()`); `recolor(from, to)`; the trace lives in the module-level `traceBySlot`. Keys: L line, R box, C oval, S select, X mirror, Esc deselect, Delete clears a selection, Ctrl/Cmd+C/V copy a selection when there is one. Tested on the 8×8 heart: box, solid oval, mirrored line, selection move, flip and paste, repaint-all, swatch reorder, PNG import (4× shrink), trace move (no undo step). Next: **Phase 5 polish (group badges) and Phase 6 (export)**.

- 2026-10-13: Fixed the zoom snapping back when scrolling on a phone (Joe). The address bar sliding in and out resized the window, and the resize handler re-fit the grid. Now the grid is sized with `svh` (which ignores the address bar), a `ResizeObserver` on the grid box replaces the window resize listener, and a resize keeps the zoom and the centered spot. Only the first layout and the Fit button fit the sprite.

- 2026-10-13, Phase 3 done. In `renderPaint()`: `goFrame()` (switching frames keeps the zoom, so frames line up), `ghostOf(f)`, `readFrame()` / `writeFrame()` (one frame's pixels in and out of `px`), `copyFrame()` / `pasteFrame()` with the page-wide `frameClip`. Keys: `,` `.` (or `[` `]`) change frames, `o` toggles the ghost, Ctrl/Cmd+C and V copy and paste a frame. Tested on the player: copying facing right onto facing left and flipping gives back the original left frame exactly; Copy to next and three undos restore it. Next: **Phase 4** (shape tools, select with move, flip and rotate, mirror painting, trace layer, import a PNG, recolor and reorder swatches).

- 2026-10-13, after Phase 2 (Joe's asks): **My swatches** and the **In the game** window.
  - Swatches live in `DB.data.misc.swatches` (`[{ id, name, color }]`, color is packed RGBA). Code: `addSwatch()`, `paintPalette()` in `renderPaint()`.
  - In the game: `contextGame()` (one hidden `GOQ.Game`, headless, the folder pack plus library art), `findSpots(key)` (wraps `CanvasRenderingContext2D.prototype.drawImage` only while `renderRoomFull()` runs, and records where the sprite's art, or a tinted copy of it, is drawn), and `ctxDraw()` (puts the live canvas in as the sprite's override and redraws the room). `STAND_INS` covers sprites the engine swaps on the same spot (plant ↔ thirsty plant, trash can ↔ full can). `YOU` sprites (player outfits) are drawn on a stand-in of you in the lobby, since whole-room renders leave the player out. Not found (held items, emotes, UI, night-only, Tuesday-only): a message instead. `ctxClose()` puts the real art back.
  - Reloading (which phones do to background tabs) now reopens the same screen; a fresh visit starts at Home.
  - `fullRoom(g, id)`: `renderRoomFull()` stops before the engine's lighting pass (`if (full) return;` in `draw()`), which skipped the hallway floor lights, the marquee, the LED sign and colored glows. `fullRoom` dims the room by its `lighting.dim` and then runs `drawMarquee(r, 0, 0)` on the whole-room canvas. Spotlights on pieces aren't copied. (Joe spotted the missing floor light, 10/13.)
  - Tested: the cat (Staff Room), the front desk and plant (Lobby, 5 spots), the player (Lobby); the crop updates as you paint; swatch add, rename, delete and reload.

- 2026-10-13, Phase 2 done: the painter (`renderPaint()`, view `{ name: "paint", key, frame }`). The whole sheet is one RGBA array `px`; tools write into the current frame via `getPx` / `setPx` (frame-relative coordinates). Strokes push a copy of `px` onto `undo`. `editor.close()` (called from `render()`) flushes work in progress. Tested in Playwright (390×844): paint a stroke, fill, switch frames, undo, leave and resume, save → the tile shows the painted art. A synthetic two-finger pinch zooms without painting. The mural (256×16) and the 4×3 aisle light both open usable. Desktop keys: B/P pencil, E eraser, F/G fill, I pick, H/M move. Next: **Phase 3 (onion skin, copy and paste a frame)**, then Phase 4.

- 2026-10-13, Phase 1 done: `paint-room.html` is up, linked from the curator. Tested in Playwright at 390×844, light and dark, with no page errors: Home, Find, search, the slot page, Keep original → stamp → reload keeps it. "Paint it" is a disabled button until Phase 2. Next: **Phase 2, the core editor**. The editor should open from `renderSlot()`'s "Paint it" as a new view (`{ name: "paint", key }`), start from `inUse(key)`, and save into `DB.put("art", key, { png, w, h, cols, rows, savedAt, origHash: pixelHash(original(key)) })`.
- Code map (`paint-room.html`): `DB` (IndexedDB wrapper; `DB.data` is the in-memory copy), `pack` / `packAssets` (the folder pack, read only), `original(key)` (built-in art), `inUse(key)` (library, then pack, then built-in), `status(key)`, `nextSlot()`, `renderHome` / `renderFind` / `renderSlot`, `celebrate()`.

- 2026-10-13: Only the plan exists (now with the art-only safety rules). Next step: Phase 1. To test locally, serve the folder (`python3 -m http.server` in `museum/`) and open `paint-room.html`. The engine can also load headlessly in Node with a stubbed `window` and `document`, which is handy for checking slot data.
