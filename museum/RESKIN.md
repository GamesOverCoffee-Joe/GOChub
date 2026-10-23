# Reskin tracker

Swapping the museum's placeholder art for Joe's asset packs, one area at a time, picked in a live preview.
Lives on `experiments-1` only (notes never go to `main`). Update this file at the end of every step.

## Where we are

- **Switching to Tiled (Joe 10/23).** The picker's auto-sorting didn't match Joe's ideas, so rooms will be painted in Tiled and imported. Starter kit: `museum/GOQ-Tiled-starter.zip` (8 rooms as .tmj maps with the game's current look as a faded reference layer, layers Floor/Walls/Furniture/Details/Above people/Logic, tilesets: Room Builder + 26 Interiors themes, + 24 Exteriors themes on outside/dock). Next: Joe paints the lobby, sends the .tmj, and I write the importer (stage 1: art only, logic unchanged).

- **Round 1 (museum floor): done**, cards 180. Wing tint slider in the curator: cards 181.
- **Round 2 (café and gift shop, lobby, staff room, office, B1 Storage, screening nook): picker is live (version 3), waiting on Joe's picks.** 35 spots, built by `asset-tools/build_round2.py`.
- Next after that: round 3 (out front and out back, Exteriors pack), then the resize batch, then characters.

## What we did

**Round 1** (picks in the picker's db, collection `picks`, keys = slot names)
- In: `carpet_floor` (Room builder floor 54, tinted 30%), `hall_floor` (floor 63), wing walls A/B/C (`gallery`/`g2`/`g3`, walls 37/48/39), `lobby_wall` (wall 16), `shop_wall` (wall 26) (all walls 0% tint; the wall tops are still the old art), `bench` (School bench 1), `bench_side` (City bench 5, middle seat cut so it's 2 tiles), `display_case` (Joe's glass box on Museum #64's pedestal), `wall_frame_gold` (Museum #93) and `wall_frame_wood` (#91), moved up over the art window with Joe's plates, `plant_thirsty`/`plant`/`plant_full`/`plant_flower` (six Graveyard flower pots side by side, petals out for the leafy stages), `planter_wide` + `planter_wide_flower` (Flower bush 1).
- Kept: `staff_wall`, `sign_stand`, `velvet_rope`, `trash_can`, `overflow_screen`.
- Engine: `settings.artTint` {slot: 0..1} (wing color strength; normalizePack keeps it; the setPack cache key includes it). A plant whose art is several plants wide draws one per plant id.
- Curator: Art tab → any floor or wall slot has a **Wing color** slider (walls move upper and lower together). Plant slots accept art several plants wide.

**Round 2** (in progress)
- Spots: café and shop floor, café counter, espresso machine, café table and stool, gift shop counter and shelves, item rack, mug shelf, featured stand, postcard spinner, magazine rack, floor lamp, planter (+ its flowering version), basket; lobby floor, front desk; staff room floor, lockers, break table, coffee counter, fridge, collection cabinet, corkboard, whiteboard; office desk, PC tower, bookshelf, chair, camera, studio light, small table; storage shelves, box stack; popcorn stand.
- How the shortlists are made: every Interiors single from the themes that fit the spot (Kitchen, Grocery, Clothing, Museum, Living room, Conference, Classroom, Gym, TV studio, Basement…), sized to the spot (at least 70% as wide), up to 40 each. There's no name to go on, so some are odd (dumbbells in the lockers list). The live preview sorts that out.
- Counters and desks are one tile deep in the game and two in the pack, and the pack mostly builds counters from pieces. Only 7 single-piece options each, marked as needing a size change. Wide shelf unit and workbench: nothing fits as one piece, so they're left out for now (could be assembled from pieces later).
- Joe's own art in this round: front desk, café table, café stool, postcard spinner (marked "yours").

## Needs a size change (later, as one batch)

Picked or wanted, but bigger than its spot in the current layout. Each needs the slot size and the rooms around it changed.
- `velvet_rope`: the pack's posts are 2 tiles tall (Museum #71-85). Joe kept the old rope for now.
- `trash_can`: the pack's bins are 16x32 (City props Trashbin 1-13). Kept the old one for now.
- `sign_stand`: the pack's lecterns with signs are 16x32 (Museum #182-185, #31-35). Kept the old one.
- `bench_side`: the pack's sideways benches are 3 seats (16x48); we cut the middle seat. A real 3-seat bench needs the rooms changed.
- Tall plants (Museum #196 and #197, Living room #14 and #16, Potted plant 1-4): 2-3 tiles tall.
- Counters and desks (round 2): the pack's are 2 tiles deep.
- Frames: the pack's canvas is a little smaller than the art window (4,4)-(27,21), so the edges of an episode's art sit under the frame. Fine for now; a frame slot sized to the pack's frame would fix it.

## Plan

1. Round 2 picker → Joe picks → build with `build_assets.py` (add a section per slot) → screenshots → commit.
2. Round 3: out front (`lot_*`, `facade_*`, `glass_door_*`, `parked_car`, `museum_sign`) and out back (`dock_*`, `garage_*`, `truck_side`, dumpster), from Exteriors.
3. Resize batch (the list above).
4. Characters: GB Adventure pack (16x16, Game Boy grays): recolor to full color, rearrange into the game's 3x4 layout. Last, so the colors match the rooms.
5. Leftovers: wall tops still old art; multi-frame slots (arcade, microwave, staff TV, office TV, ship walls) not offered yet.

## Reference (to get going again fast)

- **Packs** (zips in `museum/` on experiments-1): `Modern_Exteriors_16x16.zip`, `moderninteriors-win-trimmed.zip`, `GB Adventure Characters – 16x16 Top-Down Sprite Pack.zip`. Unzip into the scratchpad as `mx/`, `mi/`, `gb/` (`mkdir -p DIR && cd DIR && unzip -qo ZIP`; the GB zip warns about its dash, which is harmless). Never use `rm -rf $VAR`: the safety check blocks it.
- **Useful pack folders:** `mi/1_Interiors/16x16/Theme_Sorter_Singles/<NN_Theme>_Singles/<Theme>_Singles_<n>.png` (numbered, no names), `mi/1_Interiors/16x16/Room_Builder_subfiles/Room_Builder_Floors_16x16.png` (styles are 3x2 blocks at x=0/64/128/192, y=32..608 step 32) and `Room_Builder_Walls_16x16.png` (x=0/176/352 groups, rows every 32 px; take the tile at x+16), `mx/Modern_Exteriors_16x16/ME_Theme_Sorter_16x16/<theme>/ME_Singles_<Theme>_16x16_<Name>.png` (named).
- **Checking sprites by number:** contact sheets mislead (I misread rows once). Render the exact numbers with `asset-tools/sheet.py OUT SCALE COLS files…` and look at each label.
- **Scripts** (`museum/asset-tools/`): `cur.js` grabs the game's current art for a list of slots into `current.json` (needs the local server); `build_picker.py` builds the picker's `data.js`; `picker.html` is the picker page; `build_assets.py` turns picks into `built/*.png` + `built.json`.
- **Picker:** https://claude.ai/artifact/N3ojdMwrfrSqi8FBCRPsny (one page; each round replaces `data.js`; picks of every round stay in the same `picks` collection, keyed by slot). Rooms outside the museum are found by prop, else by the spot's `room` (set per group in the builder). Publish from `scratchpad/picker/index.html` with `root` = the picker folder and `files` = data.js, museum-engine.js, museum-pack.json, pieces/* (copy the current engine, pack and pieces in first). Read picks with ArtifactData `list` on collection `picks` (fields: `choice` = candidate id or "keep", `from`, `path`, `note`, `tint`).
- **Putting art in the pack:** `assets` has one line per slot (`"key":{"src":"data:image/png;base64,…"}`). Edit lines with Python, keep the commas right, bump `savedAt`, then check with `json.load`.
- **Testing in the game:** the server is `python3 -m http.server 8765` from the repo root. Load `museum.html?time=day` (the test clock can be night, and the museum is dark at night). After `teleport`, wait about 2.5 s before a screenshot (the fade). Set `progress.modeAsked = 1` to skip the Normal/Busy/Chill question.
- **Tiled kit:** made by `asset-tools/tiled_refs.js` (renders each room with `renderRoomFull(id, true)` at `?time=day` into reference/ + rooms.json) and a Python step that writes one .tsx per sheet (columns = width/16) and one .tmj per room (external tilesets, firstgid cumulative in the order Room Builder, Interiors by number; Exteriors first for outside/dock). Maps carry a `room` property = the game's room id.
- **Gotchas:** wings tint floors and walls (`slot@#color` keys); the three "gallery floor" slots aren't used in the museum (wings use `carpet_floor`, halls use `hall_floor`). The curator's Art tab rejects art of the wrong size (except plants now).
