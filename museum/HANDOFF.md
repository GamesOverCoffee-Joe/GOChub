# GOQ Museum: handoff and the "one building" plan

Written 2026-10-05. Branch: `experiments-1` (PR #5).

This document has three parts:

1. **What we have now.** The museum as it is on `main` (engine version `2026-10-06 life 4`).
2. **What we're changing it into.** A single connected layout instead of floors.
3. **Phases.** The order we'll build it in.

The wings experiment (commit `782f8e7` on `experiments-1`) is finished and is **not** part of the plan. It gets reverted at the start of Phase 1. Two small pieces from it are worth keeping and are listed under Phase 3.

---

## Part 1: What we have now

### Files

| File | What it is |
|---|---|
| `museum/museum-engine.js` | The whole game in one file (~4,100 lines): art generators, room data, text, and the `Game` class. Kept as one file on purpose. |
| `museum/museum-pack.json` | The curator's saved museum: art overrides, settings, rooms, pieces. Anything in here replaces the built-in default. |
| `museum/museum.html` | The game page. Sets `window.GOQ_WANT`, which must match the engine's `VERSION` or the page refuses to load a stale engine. Has the iOS zoom protections. |
| `museum/curator.html` | The editor: Art, Pieces, Rooms (tile editor), Staff, Visitors, Text, settings, and a live preview with test tools. Sets its own `GOQ_WANT`. |
| `museum.html` (site root) | The iframe wrapper page, with touch-only zoom protection. |
| `references/` | Supabase setup SQL and guide (online staff leaderboard, duties). Not affected by this plan. |
| `transcripts/` | 32 episode transcripts. The source of the visitor mindsets. |

### How the engine works

- **Screen:** 240×160 pixels, made of 16px tiles (15×10 tiles visible). The camera follows the player when a room is bigger than the screen.
- **Rooms are separate maps.** Moving between rooms is a warp: the screen fades and the player appears in the next map. Door types: `D/d` door in the top wall, `B` door in the bottom wall, `H` door in a side wall, `E` front doors, stair steps, and the elevator.
- **Map letters:** `#` wall top, `^` upper wall row, `v` lower wall row, `.` floor, `=` lobby runner. Every room's back wall is 3 rows tall (`#`, `^`, `v`).
- **Size limits:** `normalizeRoom` limits a room to 6–48 tiles wide and 6–24 tall. The curator's resize controls limit it to 8–40 × 8–20.
- **Drawing:** every frame loops over every tile and skips the ones off screen. This is fine for rooms this size.
- **Pathfinding:** tap-to-walk and NPC walking search the whole room (BFS). NPC paths are cut off at 40 steps.

### The rooms today

| Room | Size | What's in it | Connects to |
|---|---|---|---|
| Lobby | 15×10 | Front desk/usher, runner, windows, Employee of the Month, rules, intercom, light switch | Gallery One (top door), Staff Room (top-right door), Gift Shop & Café (right door), front doors |
| Gallery One (1F) | 27×14 | 15 cases, 8 painting spots | Lobby, Elevator, Stairwell 1F |
| Gallery Two (2F) | 25×17 | 15 cases, 8 spots | Elevator, Stairwell 2F |
| Gallery Three (3F) | 29×14 | 15 cases, 8 spots | Elevator, Stairwell 3F |
| Gift Shop & Café | 22×12 | Counter, racks/stands, café seating, featured piece, bunting | Lobby |
| Staff Room | 17×10 | Lockers (with photo frame), corkboard, time clock, leaderboard, microwave | Lobby |
| B1 Storage | 15×10 | Someone's PC (the archive), magazines, workbench | Elevator, Stairwell B1 |
| Stairwells B1/1F/2F/3F | 9×10 each | Zigzag stairs, floor sign, oddities | Each other and their floor |
| Elevator | 7×7 | Floor panel | Every floor with an elevator stop |

### Systems and where they hang off the rooms

- **Pieces.** Episodes go in display cases (45 case slots across the 3 galleries). Community pieces hang on painting spots on top walls; you read one standing 2 tiles below it. When there are more episodes than cases, the overflow is archived on Someone's PC in B1 (`archiveSplit`).
- **Chores (staff).** Dust, straighten, water plants, collect mugs, wipe cases, help visitors, close the museum (worth 3). Points go to the online leaderboard.
- **Closing.** Every room with a light switch has to be dark before you can close. Turning lights back on doesn't re-award points (exploit fixed).
- **Curious visitors.** A random set each day (setting: `curious.perDay`), each with a mindset drawn from a shuffled deck. They wait in rooms with art. You can talk to them, have them follow you (including through doors), and recommend a piece. They come back the next day with a verdict and a reaction. Patreon members appear in the Staff Room instead.
- **Mindsets** (editable in the curator's Visitors tab): Hands-on, Systems, Tinkerer, Unhurried, Thrill, Story, One-more. Pieces are tagged with mindsets in the Pieces tab.
- **Museum life.** Crowd visitors stroll, sit, order drinks or carry a gift bag (never both), snap photos of art, and throw cups away. Rates are curator sliders.
- **Cat, mugs, magazines, Segway, the shirt quest, the figure in the dark, stamp card, gift shop, photo album, locker photo frame, achievements.**
- **Room-specific bits** (these matter for the redesign):
  - `NIGHT_DIM` is a table keyed by room id.
  - Lights are tracked per room (`lightsOff` is a set of room ids).
  - The room name toast appears on `enterRoom`.
  - The "Wayfinder" achievement counts rooms visited (target 10).
  - The shirt quest has steps `elevatorB1`, `stairsTo2F` and `nap2F`.
  - Usher lines mention "the elevator and the stairs" and "the door on the right."
  - Stairwell oddities and the elevator ride have their own text.
  - Saved games remember the room and tile you were standing on (`progress.where`).

---

## Part 2: What we're changing it into

### The idea

One building, no floors. You walk out of the lobby, up a hallway, and into a café at the center of everything. Long hallways lead from the café to four genre rooms. Visitors cross the café and head down the hallways, and you can see rooms ahead of you before you reach them.

### Layout

Rough proportions only. Final numbers get tuned while walking it in Phase 1.

```
  ┌────────┐                                              ┌──────────┐
  │ PUZZLE │════════════ top hallway (25+) ══════════════│ STRATEGY │
  └───┬────┘                                              └────┬─────┘
      ║   ╚═══════╗                              ╔═══════╝     ║
      ║           ║                              ║             ║
      ║        ┌──┴──────────────────────────────┴──┐          ║
  ┌───┴────┐   │                                    │      ┌───┴────┐
  │ ACTION │═══│     CAFÉ  +  GIFT SHOP (center)    │══════│ STORY  │
  └───┬────┘   │                                    │      └───┬────┘
      ║        └────────────────────────────────────┘          ║
      ║                                                        ║
      ╚════════════ lower hallway (25+) ══╦═══ lower hallway ══╝
                                          ║  8 long
                                     ┌────┴────┐
                                     │  LOBBY  │──(top-right door)── Staff Room
                                     └─────────┘
                    Basement stairs → B1 Storage (stays a separate map)
```

Hallways in the sketch:

- **Top:** Puzzle ↔ Strategy
- **Upper L-shapes:** Puzzle ↔ Café, Strategy ↔ Café (they replace the diagonals)
- **Side halls off the café:** Café ↔ Action (left), Café ↔ Story (right)
- **Verticals:** Puzzle ↔ Action (left edge), Strategy ↔ Story (right edge)
- **Lower:** Action ↔ Story, running below the café and joined at the middle by the lobby hallway

### Rules we agreed on

- **Hallway sizes:** the long hallways are at least **25 tiles**. The lobby hallway is **8 tiles**. Every hallway is at least **2 tiles wide** (floor), plus its walls.
- **Hallway shape:** straight or **L-shaped**, never diagonal.
- **Paintings (community pieces)** hang on the back wall of every horizontal hallway or horizontal leg: the top hallway, the lower hallway, the two side halls off the café, and the horizontal legs of the L-shapes. A painting spot needs a top wall, so vertical hallways don't get any. They get benches, plants and windows instead.
- **Lobby:** stays as it is, except for the doorway changes. Its top door now opens onto the lobby hallway, and the right-side café door is walled up. The staff door, front doors and everything else are unchanged.
- **Staff Room:** unchanged, still through the lobby.
- **Café + gift shop:** together in the center room.
- **Basement:** B1 Storage stays as its own map (archive PC and all), reached by one staircase. **A rooftop is possible later**, the same way.
- **Removed:** the three gallery floors, the four stairwells and the elevator.

### Rooms: genres and mindsets

Rooms are genres. Mindsets stay as visitor personalities. Each genre lists the mindsets it welcomes, and **both lists are editable in the curator**:

| Room | Mindsets (starting point) |
|---|---|
| Action | Thrill, Hands-on, One-more |
| Puzzle | Tinkerer |
| Strategy | Systems |
| Story | Story, Unhurried |

- **Episodes** go in the cases of the room their genre points to. You can set a room for a piece by hand, otherwise it follows the piece's first mindset. Overflow still goes to the archive.
- **Curious visitors** lean toward the room that matches their mindset, so you'll see a thrill-seeker heading for Action.
- **New settings field:** `settings.genres: [{ id, name, color, minds: [...] }]`. The Visitors tab gets a small editor for it, next to the mindsets.

### How it's built: one big map, drawn from a blueprint

The four genre rooms, the café and the hallways all become **one map** called "museum". The lobby, Staff Room and B1 stay as separate maps joined by doors. Leaving the lobby is a nice moment to have a fade, and it lets us keep the lobby exactly as it is.

Instead of hand-painting a ~75×60 tile map, the museum is described as a **blueprint**:

```json
"layout": {
  "rooms": [
    { "id": "cafe", "name": "Café & Gift Shop", "x": 28, "y": 16, "w": 22, "h": 16, "art": { ... } },
    { "id": "action", "name": "Action", "genre": "action", "x": 2, "y": 26, "w": 16, "h": 13, "art": { ... } }
  ],
  "halls": [
    { "id": "top", "name": "North Hall", "from": "puzzle", "to": "strategy", "via": [], "width": 2 },
    { "id": "puzzle-cafe", "from": "puzzle", "to": "cafe", "via": [[22, 9]], "width": 2 }
  ],
  "details": { "action": ["...per-room tile tweaks: alcoves, nooks, bump-outs..."] }
}
```

The engine **carves** the map from this blueprint:

1. Draw each room's rectangle with a 3-row back wall and side walls.
2. Run each hallway from room to room, with an optional bend point (`via`) to make the L.
3. Open the walls where a hallway meets a room.
4. Apply each room's detail tweaks.

Detail tweaks are stored **relative to their room**, so they move with it when the room moves or is resized.

**Zones.** Every room and hallway is a zone. Each zone has:

- a name, shown as a toast when you walk into it, the same as entering a room today
- its own wall and floor art
- its own night dimness
- optionally a light switch, so closing works per zone instead of per map

### Easy resizing (curator)

The Rooms tab gets a **Layout** view of the museum:

- **Rooms:** drag a room's edges to resize it, or drag the room itself to move it.
- **Hallways:** stay attached to their rooms automatically. Drag the bend point to change where an L turns.
- **Lengths:** each hallway shows its length and width live, and turns red when it breaks a rule (under 25 for a long hallway, under 8 for the lobby hallway, under 2 wide).
- **Details:** the existing tile brush still works for alcoves, nooks and furniture, painted inside a room.
- **Other rooms:** the lobby, Staff Room and B1 keep the current tile editor.

### What else changes

- **Engine limits:** raise the map size cap (for example to 96×80). Draw only the tiles in view instead of looping over all of them. Pathfinding is fine at this size.
- **Lights and closing:** per zone instead of per room. "Close the museum" lists the zones still lit.
- **Room toasts, `NIGHT_DIM`, the Wayfinder achievement:** use zones. Wayfinder counts rooms visited (5 museum rooms + lobby + staff + B1 = 8), and its target becomes editable in the curator.
- **Curious visitors and following:** much simpler. There are no floors to cross, so a visitor simply follows you down the hall. "Go back to their floor" becomes "go back to their room."
- **Crowd visitors:** spread across the café and rooms, walk the hallways between them, and leave through the lobby hallway.
- **Cat spots, mug spots, café drinks, the shop counter and the featured piece:** move into the café or rooms as zone coordinates.
- **Shirt quest:** `elevatorB1` → "take the stairs to B1". `stairsTo2F` and `nap2F` → new steps in the new rooms (for example "nap on the bench in the North Hall").
- **Text:** usher directions, the directory, stairwell oddities and the elevator lines get rewritten or removed. The lobby directory becomes a little map of the building.
- **Saved games:** if a save points to a room that no longer exists, the player starts at the lobby. Everything else in progress carries over.
- **Version:** bump `VERSION` and both `GOQ_WANT` values.
- **No change:** Supabase, the online leaderboard and the staff duties.

### Rough size

- **Engine:** roughly +250–400 lines (blueprint carving, zones, the genre setting), offset by about 100–150 lines removed (elevator, stairwells, floor signs, oddities).
- **Curator:** +250–350 lines for the Layout view.
- **Pack:** the gallery, stairwell and elevator rooms are replaced by one blueprint.

---

## Part 3: Phases

Each phase ends with you play-testing it and saying go before the next one starts.

### Phase 1: Layout and movement

Goal: an empty building you can walk through, with the right proportions.

1. Revert the wings commit on `experiments-1`.
2. Blueprint data, carving and zones in the engine. Raise the size cap and draw only what's in view.
3. A starting blueprint matching the sketch: 4 genre rooms, the café, every hallway at the agreed sizes. Placeholder wall and floor art per zone so each one reads differently.
4. Lobby: top door → lobby hallway, café door walled up. Basement staircase → B1. Remove the old galleries, stairwells and elevator.
5. Zone name toasts. Per-zone lights so closing still works.
6. Curator Layout view: drag to resize and move, hallway length readouts and rule warnings, teleport to any zone in the preview.
7. NPCs, cases and paintings stay **off** in the museum map for this phase, so we're only judging space and movement.
8. Test:
   - walk every hallway by keyboard, D-pad and tap-to-walk
   - camera at map edges and corners
   - transitions lobby ↔ museum ↔ B1
   - performance on an iPhone
   - old saves landing safely

**Done when:** walking around feels like a building, the hallways feel long but not tedious, and resizing in the curator is easy.

**Status (2026-10-08): built, waiting on your play-test.**

What's in:
- **The museum map** (your layout from `museum-pack-maps.json`, 2026-10-05). Rooms: Café and Gift Shop in the middle (16×10), and Puzzle, Strategy, Action and Story in the corners (12×10 each). Hallways: Upper Hall and Lower Hall (24 tiles each, kept at 24 on purpose), Lobby Hall (8), Puzzle↔Action and Strategy↔Story down the sides (13 each), and a spur off the Lower Hall with the stairs down to B1. The café opens on all four sides: west to the Puzzle↔Action hall (9), north to the Upper Hall (6), east to the Strategy↔Story hall (9) and south to the Lower Hall junction (10). The whole map is 55×49 tiles.
- **Art per zone.** Placeholder art only: the café uses the old gift-shop tiles, Puzzle/Strategy/Action use the old gallery 1/2/3 tiles, Story uses the staff-room tiles, and hallways use the lobby marble.
- **Room names.** Walking into a room shows its name; hallways stay quiet. Visiting a museum room counts toward Wayfinder, which now needs 8 rooms (5 museum rooms + lobby, staff room, B1).
- **Lights.** Each museum room has its own switch, by the left end of its back wall. Hallways go dark once every room is off. A dark room looks dark from the hallway too. Closing needs the lobby plus all 5 museum rooms off.
- **Lobby.** The top door leads into the Lobby Hall, the right-side café door is walled up, and the gift shop and directory signs and the usher's directions are updated.
- **B1.** Reached by the stairs at the end of the spur. B1's right-hand door leads back up; its elevator door is walled up.
- **Curator → Rooms → Museum → Layout tool.**
  - Drag rooms to move them, or their walls to resize them.
  - Drag hallways sideways, or the round corner of an L.
  - Each hallway shows its length, turns red when it's under its minimum, and has width and minimum settings.
  - You can add a room or a hallway, and set art per room or hallway.
  - Undo works.
  - The preview's "Go to room" list includes every museum room and hallway.
- **Old drafts.** A browser draft or imported pack from before the change asks once, then drops the old floors and rewires the doors.

Left for later, on purpose:
- **Display and the café:** no cases, paintings, café counter or gift shop yet (Phase 2). All episodes sit in the archive on Someone's PC until there are cases.
- **Floor-era code:** the old elevator and stairwell code and text are still in the engine, unused. They come out in Phase 3 along with the shirt-quest rewrite (its elevator and 2F steps can't be done right now).

### Phase 2: Furnishing

Goal: the rooms feel like rooms.

- Display cases in the genre rooms. Episodes assigned by genre, overflow to the archive.
- Painting spots along the horizontal hallways.
- The café and gift shop moved into the center room: counter, racks, seating, featured piece, bunting.
- Room shapes made less boxy with detail tweaks: alcoves, bump-outs, reading nooks. Each genre room gets its own floor, wall color and furniture style.
- Benches, plants, windows and lamps along the hallways, especially the vertical ones. Plants and frames become chores again.
- Cat spots and mug spots.
- Genre editor in the curator (genres ↔ mindsets), and "Exhibited in" set per room.

**Status (2026-10-09): built, waiting on your play-test.**

What's in:
- **Genres.**
  - Action, Puzzle, Strategy and Story, each with the mindsets it welcomes. Edit them in Visitors → Genres: add, remove, rename, recolor, tick mindsets.
  - Each genre room has its genre set in Rooms → Museum → Layout (tap the room).
  - An episode goes to the first genre that welcomes one of its ticked mindsets. You can override that per piece with **Exhibited in** (Pieces tab).
  - The Pieces tab shows where each piece ended up (for example "PUZZLE, CASE 3").
- **Cases.**
  - 8 per genre room (32 total). Newest episodes first: each fills a case in its genre's room. If that room is full, it takes a spare case elsewhere.
  - Anything that still doesn't fit goes to the archive on Someone's PC. With today's 31 episodes, nothing is archived.
- **Paintings.**
  - 16 wall spots: 6 along the Upper Hall, 6 along the Lower Hall, and 2 each on the café's west and east halls.
  - Wall spots and wall art can now hang on any back wall in the museum, not just the top row. Place them on a wall in the Rooms editor; dragging moves them along the wall, or onto another back wall.
- **Café and Gift Shop.**
  - Gift shop half (left): the four shelving units (one per shop item), postcard spinner, the shop counter, a basket and the cat bed. Wall shelves and posters hang on the back wall.
  - Café half (right): the café counter with its bus tub, two tables with stools on rugs, the magazine rack, two lamps, planters and the café fern. The menu and mug shelf hang on the back wall.
  - The featured item stand sits by the west door.
  - The middle aisles stay clear between all four doors.
- **Genre rooms.** Each has a sign explaining its genre, a plant (a watering chore), and a bench facing the cases.
  - Shape tweaks so they aren't plain boxes: Puzzle and Strategy have a notched corner, and Action and Story each have an alcove off the side.
- **Hallways.** A bench in the Upper and Lower Halls facing the paintings, and a plant in each side hallway.
- **Cat and mug.** The cat can nap on the café's cat bed, in the café, or in Puzzle. The mug can turn up in the café, the halls or Strategy.
- **Curator → Rooms → Museum → Shape tool.**
  - Paint **Add floor** (alcoves, bump-outs) or **Add wall** (pillars, notches) in or next to a room. **Back to the plan** removes a tweak.
  - Tweaks are stored from the room's corner, so they move with it. A room's settings can reset it to a plain rectangle.
- **Moving things along.** Dragging a room in the Layout tool brings its furniture, cases, paintings, lamps and cat/mug spots with it. Dragging a straight stretch of hallway brings its paintings and benches.
- **B1 stairs.** They're now measured from the end of their hallway, so they stay at the dead end when the hallway moves.

Left for later, on purpose:
- **Bunting:** not in the museum yet. The old version ran across the top of the whole map; it needs per-room support (Phase 4).
- **Staff:** the café and shop staff aren't back yet (Phase 3). Their counters already work without them.
- **Windows:** none in the hallways yet. The engine allows one window per room, so hallway windows wait for Phase 4 decoration.

### Phase 3: NPCs back in

Goal: the building feels lived in, and you envy the visitors.

- Crowd visitors: spawn by zone, cross the café, walk the hallways, sit, order drinks, carry bags, snap photos.
- Curious visitors placed in the room that matches their mindset. Following and recommending tested over long walks.
- Patreon members in the Staff Room (unchanged). Usher, shopkeeper, barista and night guard (guard rounds along the hallways).
- Shirt quest steps rewritten. Usher directions and text updated. The lobby directory as a map. Figure-in-the-dark spots chosen along the dark hallways.
- From the wings work, worth keeping: the lobby directory event, and the `addVisitor`/`freeSpot` placement fix.

**Status (2026-10-10): built, waiting on your play-test.** First, three fixes from the Phase 2 play-test:
- **Cases stay in their genre.** An episode only goes in its own genre's room. If that room is full, the oldest of that genre wait in the archive, and adding a case to the room brings the next one out. Episodes with no genre only go in rooms with no genre. The Pieces tab lists episodes, cases and archived per genre.
- **The B1 stairs are in the lobby**, where the café door used to be. The spur off the Lower Hall is gone.
- **Dragging in the curator is smooth.** Every drag step used to rebuild the whole museum, about 75 ms on a desktop and more on a phone. Now the map updates when you let go, and the thing you're dragging is drawn where it's going.

What's in:
- **Visitors in every room.** Two per genre room (three on busy days, fewer at night), plus whoever is placed in the editor.
  - Each visitor belongs to a room and strolls there, often stopping in front of a case.
  - Now and then one wanders down a hallway to another room or to the café, and you see them walking the halls.
  - In the café: one person browsing the wall shelves, one sitting at a stool, one more on busy days.
  - Visitors who wander into the café sometimes leave with a drink. The drink and bag sliders still apply, and nobody carries both.
- **Curious visitors** wait in the room whose genre welcomes their mindset, so a thrill-seeker is in Action.
  - Follow works anywhere in the building.
  - If you say "never mind", they walk back to their own room. In the lobby, they head back into the museum.
- **Staff.** The shopkeeper stands by the shop counter and the barista behind the café counter. At night, two guards walk the Upper and Lower Halls with flashlights. The usher and the B1 conservator are unchanged.
- **The lobby directory.** It lists the café in the middle, each genre room with its compass direction and the mindsets it suits, and the B1 stairs. It's built from the layout, so it stays right when you move rooms.
- **Shirt quest.** "Ride the elevator down" is now "take the lobby stairs down to B1". "Climb to the second floor" is now "walk the Upper Hall from Puzzle to Strategy". "Nap up there" is now "nap on the Upper Hall bench". Magazine 3's riddle is updated to match.
- **Floor-era cleanup.** The elevator and stairwell code, art slots and text are gone, along with the curator's elevator options.
- **Speed.** Rebuilding the whole museum got faster (about 7 ms on a desktop, was about 25 ms), so opening and Apply to preview are snappier.
- **Figure in the dark.** No changes needed: once every room's lights are off, the hallways are dark too, so it can turn up there.


### Phase 4: Decoration

Goal: character.

- Placeholder murals and wall art per genre room (you'll replace them with real art eventually).
- Signs over each room's entrance and hallway names.
- Lighting moods per zone (warm café, dim Story room, bright Action room), and night dimness per zone.
- Sound or ambience hooks if wanted. Small details and secrets along the long hallways.
- Later, if the layout works: the **rooftop**.

**Phase 4 is going room by room. Hallways, step 1 (2026-10-11): built, waiting on your look.**
- **Carpet runners.** Tile pieces in two directions, each with a start, a middle and an end. Paint them with the new **Carpet** tool in Rooms (any room). They're laid along every hallway, and they move with a dragged room or hallway. The art is replaceable in Art → Hallways.
- **Accent lights.** Small brass wall lights with a warm glow, eight of them along the back walls of the horizontal hallways. Place more with Place → Hallways → Accent light. They go dark with the lights.
- **Arrow signs.** A big arrow across the wall, in its genre's color with the genre's name on it.
  - The first one is in the Lower Hall, left of the café's south door: four tiles, pointing left, "ACTION" in soft red. Action's genre color is now soft red (#e0817a).
  - Place more with Place → Hallways → Arrow sign; then set the room, direction, length and optional words or color.
  - Looking at one says "This way to Action."
  - The Lower Hall's two left-hand painting spots moved over (to columns 17 and 20) to make room.


### Open questions (can be decided during Phase 1)

- Where the basement staircase goes. Default: a small stair nook off the lower hallway, near the lobby hallway junction.
- Names for the hallways (for example "North Hall"). Default: plain names, editable in the Layout view.
