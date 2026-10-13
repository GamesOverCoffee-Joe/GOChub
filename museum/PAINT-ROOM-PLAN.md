# Paint Room: plan and handoff

Written 2026-10-13. Branch: `paint-prog`. Scope: the `museum/` folder only.

This is both the spec and the handoff. If a session gets cut off, a new one should be able to read this file, check **Progress** at the bottom, and pick up where we left off. Keep **Progress** and **Decisions log** current with every commit.

---

## What we're building

`museum/paint-room.html`: a phone-first pixel painter for every replaceable sprite in the museum game. It's a sibling of `writers-room.html`. The Writers' Room has you write the museum's lines one a day; the Paint Room has you repaint its sprites one a day.

- Every sprite slot the game can replace is listed, searchable and grouped. There are **199 slots in 25 groups** today, read live from `GOQ.SLOTS`, so new slots show up on their own.
- For each slot you either **paint a replacement** or **keep the original**. The goal is every slot done one way or the other.
- It's a daily journal. Saving a sprite (painted or kept) stamps the day on a monthly punch card, groups light up as they fill, and finishing a group earns a badge.
- The editor is simple, like Animal Crossing's pattern maker: a grid, a palette, a few tools and a live preview.
- Finished art goes into the game the same way the Writers' Room's lines do (the shared curator draft, then **Export pack**). There's also a ZIP of PNGs as a backup and for use outside the game.
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

**See it in the museum** opens the real engine (`new GOQ.Game(..., { curator: true, saveKey: null })`, like the curator's preview) with the draft plus your unsaved sprite applied. It teleports to the room where that slot appears, from a slot-to-room map we keep in the page (falling back to the lobby). It's heavier, so it only loads when asked.

### 4. Export

- **Export pack**: downloads `museum-pack.json` from the draft, the same as the Writers' Room. This is how art reaches players: replace `museum/museum-pack.json` in the repo and merge to main.
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
| Saved sprite art | Shared draft `goq-curator-draft` → `assets[key].src` | Exactly what the curator writes. It shows in the curator and the game preview right away. |
| Keep original | Paint Room's own record (`kept[key]`) | Not in the pack. The game already uses the original. |
| Daily stamps, totals, badges, last group | `localStorage["goq-paint-room"]` | Same shape as the Writers' Room (`days`, `total`, ...). |
| Work in progress (unsaved pixels, per slot) and my swatches | IndexedDB `goq-paint-room` | Kept out of localStorage so it doesn't crowd the draft. The pack alone is about 1.7 MB and localStorage holds about 5 MB. |

- **Save** writes the PNG into the draft, marks the slot **Painted**, stamps today and clears that slot's work in progress.
- **Use the original again** deletes `assets[key]` and marks the slot **To do**.
- The **draft freshness** check is the same as the Writers' Room's: if the folder's `museum-pack.json` is newer than this browser's draft, offer **Update my draft** before saving or exporting. It keeps the sprites saved here and takes everything else from the folder.
- A sprite that's identical to the original after editing is treated as **Keep original**, not as custom art, so the pack stays small.

---

## Build order (phases)

1. **Skeleton**: `paint-room.html`, engine loading via `version.json`, draft load and save plus the freshness check (ported from the Writers' Room), the Home and Find screens with real slot data and thumbnails, a link from the curator's menu next to the Writers' Room.
2. **Core editor**: the grid with zoom and pan, pencil, eraser, fill, eyedropper, undo and redo, the live preview, sprite colors pulled from the original, Save into the draft, Keep original.
3. **Frames**: the frame strip, onion skin, copy and paste a frame, animation playback, character-sheet labels.
4. **Palette and tools**: named swatches (IndexedDB), the color picker, recolor-all, line, rectangle, circle, select (move, flip, rotate), mirror, the trace layer.
5. **Journal**: punch card, Today's sprite, wings lighting up, badges, totals.
6. **Export**: Export pack, the ZIP of PNGs plus manifest, single PNG, (optional) atlas.
7. **Scenes**: quick mockups, then "See it in the museum" with the slot-to-room map.
8. **Polish and test**: test on a phone-sized screen (Playwright at 390×844), dark mode, check the curator sees saved art, update `UPDATING.md` with a Paint Room section.

---

## Decisions log

- 2026-10-13: Name **Paint Room** (`paint-room.html`). (Joe)
- 2026-10-13: Saving goes both ways: the shared draft plus Export pack is the game's route, and a ZIP of PNGs is the backup. (Joe)
- 2026-10-13: Palette starts with the original's colors; named, growable swatches can take any color at any time. (Joe)
- 2026-10-13: Scenes include both quick mockups and the real engine. (Joe)
- 2026-10-13: Multi-frame slots use a frame strip with onion skin. (Joe)
- 2026-10-13: Rewards work like the Writers' Room: painted or kept stamps the day, groups light up, and finishing a group earns a badge. The punch card is separate from the Writers' Room's. (Joe)
- 2026-10-13: Extra tools: line, rectangle and circle; select with move, flip and rotate; trace a photo or PNG. (Joe)
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
- [ ] `paint-room.html` loads the engine via `version.json`
- [ ] Draft load, save and freshness check (ported from the Writers' Room)
- [ ] Home screen layout
- [ ] Find screen: search, filters, thumbnails, status
- [ ] Link from the curator's menu

### Phase 2: Core editor
- [ ] Grid render, zoom and pan (pinch and two-finger)
- [ ] Pencil, eraser, fill, eyedropper
- [ ] Undo and redo
- [ ] Live preview (1×, 2×, 4×, checkerboard)
- [ ] Sprite colors from the original
- [ ] Save into the draft; Keep original; Use the original again
- [ ] Work-in-progress autosave (IndexedDB)

### Phase 3: Frames
- [ ] Frame strip (character labels for `char` slots)
- [ ] Onion skin
- [ ] Copy, paste and clear a frame
- [ ] Animation playback in the preview

### Phase 4: Palette and tools
- [ ] Named swatches: add, rename, recolor, reorder, delete
- [ ] Color picker (hue/saturation/value plus hex)
- [ ] Recolor-all option
- [ ] Line, rectangle and circle (outline and filled)
- [ ] Select: move, flip, rotate
- [ ] Mirror painting
- [ ] Trace layer (opacity, scale, offset)
- [ ] Import a PNG as pixels (size check plus clean-upscale shrink)

### Phase 5: Journal
- [ ] Punch card
- [ ] Today's sprite suggestion
- [ ] Wings light up per group
- [ ] Group badges, totals

### Phase 6: Export
- [ ] Export pack
- [ ] ZIP of PNGs plus `manifest.json` (built-in ZIP writer)
- [ ] Single PNG download
- [ ] (Optional) curator atlas export

### Phase 7: Scenes
- [ ] Tile mockup
- [ ] Room floor and wall mockup
- [ ] Shelf, table and counter mockup
- [ ] In-hand mockup
- [ ] Walk cycle and loop
- [ ] Day, sunset and night tint
- [ ] "See it in the museum" (real engine plus slot-to-room map)

### Phase 8: Polish and test
- [ ] Phone-size test (Playwright 390×844), light and dark
- [ ] The curator shows art saved in the Paint Room
- [ ] `UPDATING.md`: Paint Room section
- [ ] Handoff notes below are up to date

### Handoff notes (latest state)

- 2026-10-13: Only the plan exists. Next step: Phase 1. To test locally, serve the folder (`python3 -m http.server` in `museum/`) and open `paint-room.html`. The engine can also load headlessly in Node with a stubbed `window` and `document`, which is handy for checking slot data.
