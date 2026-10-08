# GOQ Museum: handoff and the "one building" plan

Written 2026-10-05. Branch: `experiments-1` (PR #5).

## Pinned for later

Ideas and chores parked on purpose. Nothing here is built yet.

- **Weekly new-piece celebration.** When a new piece is unveiled: a short cutscene, an usher speech, bunting, a themed drink of the week, and visitors mentioning it.
- **Photo chain-of-events mystery.** A long-haul chain: the conservator's secret exhibit, unlocked step by step through photos.
- **What the figure is.** Still undecided.
- **Batch fill.** The curator's Batch fill button stays: `batch-fill.html` will be uploaded later and updated then.
- **An art version of the writing app.** The same one-a-day idea, for the art slots.

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
- **Carpet runners.** Tile pieces in two directions, each with a start, a middle and an end. In a hallway (up to 3 tiles across), a runner sits in the middle of the floor whichever row you paint it on, and lines up through crossings. Each tile has a width (10–32 px, default 20), set with the Carpet tool's slider; "Use this width for every runner here" changes them all at once. Paint them with the new **Carpet** tool in Rooms (any room). They're laid along every hallway, and they move with a dragged room or hallway. The art is replaceable in Art → Hallways.
- **Accent lights.** Small brass wall lights with a warm glow, eight of them along the back walls of the horizontal hallways. Place more with Place → Hallways → Accent light. They go dark with the lights.
- **Arrow signs.** A big arrow across the wall, in its genre's color with the genre's name on it.
  - The first one is in the Lower Hall, left of the café's south door: four tiles, pointing left, "ACTION" in soft red. Action's genre color is now soft red (#e0817a).
  - Place more with Place → Hallways → Arrow sign; then set the room, direction, length and optional words or color.
  - Looking at one says "This way to Action."
  - The Lower Hall's two left-hand painting spots moved over (to columns 17 and 20) to make room.


### Open questions (can be decided during Phase 1)

- Where the basement staircase goes. Default: a small stair nook off the lower hallway, near the lobby hallway junction.
- Names for the hallways (for example "North Hall"). Default: plain names, editable in the Layout view.

**Hallways, step 2, and the Action room (2026-10-12): built, waiting on your look.**
- **Hallway floors** are dark wood (new art: Art → Hallways → Hallway floor).
- **Hallway walls** blend from the theme color of the room at one end to the room at the other, muted a little so arrows and lights stand out.
  - Each hallway can blend between its rooms (the default), blend between two colors you pick, or keep the plain art (Layout → tap the hallway → Wall colors).
  - A hallway that ends in another hallway takes the middle of that hallway's colors.
- **Room colors** (Layout → tap a room):
  - **Theme color:** defaults to the room's genre color. The café's is brown (#8a5a3a).
  - **Floor color** and **Wall color:** tints that recolor whatever art is there while keeping its shading. Rooms outside the museum have Floor and Wall color in their room settings too.
- **The Action room:**
  - A deep red carpet floor: the new Carpet floor art, which is gray so the floor color decides it.
  - Dark gray walls (#4a4a50).
  - Three landscape murals with no words, one on each stretch of top wall. Dusk peaks is left of the doorway, canyon road is right of it, and a volcano night is in the alcove.
- **Murals.** New landscape art (dusk peaks, canyon road, storm plains, volcano night) along a wall's top row, so the wall color shows below. Replace any of them in Art → Murals.
  - Place → Hallways → Mural, then tap a wall: it fills that stretch.
  - Pick its art, its length, and which part of the landscape shows.

**Releases and caching.** Each release bumps three version strings, and they must all match: `VERSION` in museum-engine.js, `window.GOQ_WANT` in museum.html and curator.html, and `museum/version.json`. A page that finds a newer version in version.json reloads itself once to get fresh files.

**The four genre rooms (2026-10-13): built, waiting on your look.** Each room has a carpet path that winds from one doorway to the other, with its 8 cases spread along it (every case can still be read front or back).
- **Action:** the path starts at the north door, swings past the volcano alcove, and leaves by the Lower Hall door. Red carpet, dark gray walls, dusk, canyon and volcano murals.
- **Puzzle:** the twistiest path, from the Upper Hall door into a loop and out the bottom. Teal carpet (#1d5a50), slate walls (#3c4650), floating-isles mural.
- **Strategy:** an S-bend from the Upper Hall door down to the south door. Navy carpet (#1f2d5c), warm stone walls (#4a4840), castle-hill mural.
- **Story:** a slow wander from the north door to the Lower Hall door. Plum carpet (#5a2448), dusky walls (#463c46), moonlit-forest and isles murals, and a bench in the side alcove as a reading nook.
- **In every room:** a sign by a doorway, a bench by the path, and a plant or two.
- **Runner corners.** Four corner pieces (┌ ┐ └ ┘) for the Carpet tool, drawn in the straight runner art's own colors so they match replaced art. Corners go up to a tile wide; paths in rooms are 14 px wide.
- **Hallway arrows.**
  - Upper Hall: PUZZLE ← and STRATEGY →. Lower Hall: ACTION ← and STORY →. Each is in its genre's color, and all names are now the same size.
  - The café's hallways have no arrows, and the vertical hallways have no back wall to hang one on.
  - The paintings and lights on those two walls were rearranged around the arrows: 13 painting spots in all now.
- **New murals:** floating isles, castle hill and moonlit forest.

**Tweaks (2026-10-13, later):**
- **Curator speed.** After an edit, the map editor only rebuilds the museum's rooms instead of reloading the whole pack. It keeps the art it has already drawn, decodes images once, and doesn't run a hidden game loop. Saving to the browser waits until you pause. Applying an edit went from about 150 ms to about 25 ms on a desktop.
- **Runner corners line up.** A straight run of runner shares one line. If any of it is in a hallway, the whole run follows the hallway's center, so a hallway runner carries straight on into a room. Each corner lines its arms up with the runners beside it (centered or not) and takes their widths. The four room doorways now join their hallway runners into the room paths.
- **Leaving visitors** (after a recommendation) find their way through the halls and café to the lobby doors before fading out. Before, they bumped into walls and vanished.
- **Following visitors:** a new "What were you looking for?" option repeats what they asked for. Its intro line is in Words → Curious visitors.

**Fifth room (2026-10-14).**
- **The map** grew 9 rows (now 57×58), and everything in the museum moved down to match.
- **The North Room** (12×10, plain for now, with its own light switch) sits above the Upper Hall. The 5-tile North Hall runs up to it from the middle of the Upper Hall. The Upper Hall's center painting spot made way for the doorway, and its two lights now flank it.
- **Murals** are all cleared for a clean slate. The mural art is still in Art → Murals, and Place → Mural still works.
- (The five design categories were wired in on 2026-10-15; see below.)
- **Source of truth:** the museum layout lives in museum-pack.json. The engine's built-in fallback layout is older and only used if a pack has no museum.


**Five categories (2026-10-15).**
- **Genres are now the five design categories:** The Shape in the Dark (`dark`), The Long Road to Mastery (`mastery`), Whispers of a Larger World (`whispers`), Mad Scientist (`experiment`) and Stories (`stories`). Each has a short name (editable in Visitors → Genres) that goes on its touch screen.
- **Rooms:** North → Dark, Action room → Mastery, Puzzle room → Whispers, Strategy room → Mad Scientist, Story room → Stories. The room ids (`north`, `action`...) are unchanged; their names, genres and signs changed. Each sign reads the category's description, then its "In design terms" line. The hall arrows read WHISPERS, MAD SCIENTIST, MASTERY and STORIES.
- **The Dark room** has dark carpet (floor #231e2e, wall #2a2732), a winding runner that dead-ends at its touch screen, 8 cases, a sign, a bench and a fern.
- **Pieces:** every episode has its category set by hand. Six have a **blend** (a second category, `blend` on the piece, "Blends with" in Pieces): Cave Escape and Sneaky (Mastery), Hyperbaric (Stories), Ominoflux (Mad Scientist), Seeing Double and Enemies Within (Dark). A blend is for the record only; the piece is shown in its main room. "Monter Freaks!" was renamed "Monster Freaks!".
- **New drafts:** Hovershot (Yaniv) and Spacecat Solitaire (Grey Duck Games), in Mastery, with no images or links yet.
- **Touch screens replace the archive.** Each genre room has a small touch screen on a pedestal (`overflow_screen`, event `{kiosk: true}`, Place → Display → Touch screen). It lists that room's genre episodes that don't fit in its cases, to read or recommend. Mastery has 9 episodes for 8 cases, so Polariball (the oldest) is on its screen.
- **Someone's PC (B1)** is idle, waiting for its new job. Community finds that don't fit a wall spot aren't shown anywhere for now.

**Curator's view (2026-10-16).**
- Every observation placard is headed THE CURATOR'S OBSERVATION and followed by a line saying it is the curator's own impressions, not the developer's view and not a verdict. The back placard is headed THE DEVELOPER'S INTENTION. All three lines are editable in Words → Pieces (`case.obsLabel`, `case.obsNote`, `case.intLabel`).
- **version.json is required.** The pages check it to notice a stale cached engine. Keep it in step with `VERSION` and both `GOQ_WANT` lines.

**Visitor notes and Check version (2026-10-17).**
- **Visitor notes.** Reading a placard to the end with A now offers "Leave a note" (B still just closes, and the curator preview never asks). The note card takes up to 200 characters and an optional name. Notes go to Supabase as *pending*. Approved notes, the newest six per piece, show under the front placard (and with the whole piece on touch screens and walls). Your own note shows as "with the curator" until it's approved, for up to two weeks.
- **Fair limits (in SQL):** 3 notes an hour and 10 a day from one browser (a random id, not a person), 60 an hour from everyone, and at most 500 waiting. Turned-down notes are cleared after 30 days.
- **Moderation:** the curator's **Notes** tab. Sign in with a badge marked as a curator (`select goq.set_curator('0001', true);` in Supabase). Waiting, Approved and Turned down lists, with Approve, Turn down / Take down, and Delete. The login stays in that browser.
- **Supabase:** run the updated `references/supabase-setup.sql` once. It adds `goq.notes`, a `curator` flag on badges, and four website functions: `submit_note`, `get_notes`, `curator_notes`, `moderate_note`. Without Supabase there are no notes and nothing asks.
- **Words → Visitor notes** has every line: the offer, the card's prompt, the headings over notes, thanks and errors.
- **Check version (curator header).** Shows whether the engine matches this page and `version.json`, and whether your draft is this folder's `museum-pack.json`. It compares a fingerprint of the file your draft started from (remembered when you load the folder's pack, import or export) with the file there now, says if you've edited since, and offers **Load the folder's pack**, **Export my draft** and **Reload fresh** (reloads the page and the engine, skipping the cache). On start, a restored draft whose folder pack has changed gets a heads-up in the status line.
- **Exports are stamped** with `savedAt` (the export time), which Check version shows. Packs from before this have no date and still compare by fingerprint.

**Photo reactions, unread shine, Konami, sized rugs (2026-10-18).**
- **Photo reactions.** Photographing someone makes them react for a moment, with a bubble over their head (art slot *Photo reactions*, 8 frames), and the album says what they did (Words → Photo reactions). By what they're doing: looking at a piece → startled "!", then a peace sign; taking their own photo → photographs you back; walking → strikes a pose; sitting, or staff on break → a wave; curious visitor waiting → shy, turns away; following you → heart; usher → bow; conservator → "…" without looking up; night guard → startled. In the dark only the guard can be caught. The third photo of the same person within about 30 seconds annoys them. Each kind counts toward the new **Paparazzi** achievement (stat `reactions`, target 10; added to the pack too).
- **Unread pieces shine** (Staff tab → Pieces you haven't read): **Sparkle** (slow eased twinkles, somewhere new each time) or **Soft green highlight** (a breathing outline), or Off, with a Strength slider. One side read: dimmer and rarer; both sides (or a painting's placard): still. Nothing shines in the dark. Settings: `staff.readStyle`, `staff.readStrength`. Preview options → **Reset what I've read**.
- **Konami** is now ↑↑↓↓←→←→ B A **Start**. That Start counts only as the code (no menu), and the code's A doesn't look at what's in front of you. Any toast (achievements included) showing when the pause menu opens goes back in line and shows after the menu closes.
- **Sized rugs.** Place → Rug now makes a rug you can size (1–24 tiles each way) with a border style (wide band, double line, woven zigzag), corners (diamond, flower, knot, none), five color presets and four color pickers (middle, border, edge lines, corners). Rug decal fields: `w`, `h`, `pattern`, `motif`, `field`, `border`, `accent`, `corner`. Older rugs stay the fixed picture until you press **Make it sizable**. If the Rug art is replaced, sized rugs nine-slice that art (16-pixel corners stay crisp) and the color pickers no longer apply.
- **Camera flash fix (2026-10-18).** The flash was triggered in the draw loop on the exact frame the phone timer hit 16, so a slow frame (two updates per draw) could skip it. It's now started and faded in `update()`.

**Tutorial (2026-10-19).**
- **Plays once** for a new player (when `progress.tutorial` is empty; never in the curator preview), and again through the lobby's new **Tutorial** door (left wall, with a sign). Finishing or skipping stores the date in `progress.tutorial`.
- **Rooms** (built in, so they exist even if a pack doesn't list them; flagged `tutorial`): `tut_office` (Staff Office: glass door, the usher's desk, the intercom, the door to training), `tut_room1` (Training Room A: the three games, a light switch) and `tut_room2` (Training Room B: Rosie, a light switch). Their switches don't count toward closing the real museum.
- **Flow:** you walk in from the glass door to the desk. The usher asks for a badge (the real badge form; "Not now" means no badge), then "Aren't you a Patreon member?" (No: volunteer. Yes: email info@gamesover.coffee, continue anyway or enter a badge), then sends you in. In Room A, the far door says "It's locked." until the red game is read front and back; the way back says it's locked and the speaker says not to panic. The three games stand in a row: a long planter in front of purple (its right half) blocks its front, and a long planter behind green (new two-tile **Long planter**, also in Place → Furniture) blocks its back, half of it showing past the case; red stands free; each game is a plain color. Notes on them look sent but never go anywhere. In Room B, Rosie wants a red game; lead her back, and Skye (blue) and Onyx (black) are waiting. Recommended visitors walk out the way you came in. While anyone you've met still wants a game and isn't with you, either door gets the speaker's "help them first". In the office, each visitor reacts: their color = loved, in the game = liked, missing = didn't like (purple counts as red and blue). Then the speaker asks for the closing announcement (office intercom); the visitors leave; turn off both rooms' lights; leave by the glass door.
- **Pause** in the tutorial offers only Skip the tutorial, Save and quit (it starts over next time) or Back.
- **Words → Tutorial** has every line, including the three games' titles and placards. The tutorial's reading, stamps and notes are kept apart from real progress.
- **Tutorial rooms don't count as visited rooms** (the "rooms" achievement stat). They're never recorded, and any already saved are dropped when progress loads.

**Tweaks (2026-10-20).**
- **Menus:** a long list (the pause menu on a small screen) scrolls to keep the cursor in view, also when it wraps from top to bottom.
- **Toasts** showing when a placard opens wait until it closes (the tutorial's "*click* The far door unlocked." was hidden behind it).
- **Facing you:** everyone you talk to turns toward you except staff behind a desk or counter (usher, shopkeeper, barista) and people sitting down. Someone who stands still (staff included) turns back a few seconds later, after talking or after a photo.
- **Photos:** someone photographed mid-step stops where they were (the guard used to step into your tile). In the tutorial there's no "Photo saved"; the first photo says "Oh yeah, you can take photos. They don't help you here, though." (Words → Tutorial, `tut.photo`).
- **Tutorial:** the games' placards skip the "my own impressions" line. Visitors wanting a game show "?", and "!" once they're back in the office, cleared when they tell you. Rosie, Skye and Onyx wear red, blue and black shirts.
- **Shirt colors** (Visitors tab): each visitor wears one of ten colors at random (`life.shirtsOn`, `life.shirts`). A placeholder: the new *Visitor shirt* art (just the shirt pixels, gray) is drawn over Visitors A, B and C and tinted. A visitor sheet replaced with your own art keeps its own colors.

**Room names and the mug (2026-10-20).**
- **The mug** was see-through: its body used palette color 0, which was transparent. It's opaque cream now.
- **Live room names:** any text (Words, or what a prop says) can write `{room:ID}` for a museum room or hallway (its zone id, e.g. `upper`, `puzzle`) or a room (e.g. `lobby`), and it shows that place's current name. Magazine 3's shirt riddle and the two hall benches use it. Photo album entries now name the wing or hall, not just "Museum". The engine's built-in fallback layout uses the same names as the pack (Wolpaw, Meier, Nishikado, Roberta Williams Wings; North, South, West, East Halls). The curator's Go to room list refreshes once the pack loads.
- **Wing names everywhere (2026-10-20):** `{ROOM:id}` is the same as `{room:id}` in capitals; the five room signs open with it, so they always show the wing's current name. A room's touch screen is titled with the wing's name ("NISHIKADO WING: MORE PIECES"), and so is the curator's "ON THE NISHIKADO WING SCREEN". An arrow with no words of its own says the name of the wing for its genre.

**Note button (2026-10-21).** Leaving a note is now a yellow **NOTE +** button under WATCH and PLAY on a placard (Up does the same). The old "Leave a note?" question after the last page is gone (and its Words line, `note.ask`); A on the last page just closes the placard. With three buttons, they're drawn a little tighter so the placard's footer still fits.

**Controls, menus and stats (2026-10-21).**
- **Keys:** Esc pauses (like Enter and P). X is B: photos, and back in menus. K and Backspace go back in menus but never take a photo (they're the "bk" key, dropped while walking).
- **Controller** (Gamepad API, standard layout), polled every frame through the same path as the touch buttons: D-pad or left stick, bottom button A, right button B, Start or Select pauses. "Controller connected" shows on first use.
- **Settings (museum.html):** **Sharp pixels** (whole-number zoom only; default on with a mouse, off on touch) and **Swap A and B** (controllers, and the keyboard's Z/X).
- **Pause menu:** My Stuff (Photos, Stamp card, Achievements, Wardrobe), Controls (keyboard, touch and controller pages; the one you're using first), Respawn, Save, Save and quit, Back.
- **Notes with a controller:** the note card shows a keyboard (three rows of letters and . , ! ?, then Caps, ', Space, Del, Done). D-pad picks, A types, B deletes (on an empty note it puts the card away), Done moves to the name, Start sends. Only when the last input was a controller; phones keep their own keyboard.
- **Stats on Someone's PC (B1):** it boots PLAYER_STATS.EXE: a staff profile (up to three titles you've earned, best first), then Visits, Reading, Recommending, Chores and Life. New counters in `progress.stats`: days visited, streak and best streak, time in the museum, time in the dark after closing, steps, walking into walls, drinks and plants by kind, who you photograph most, loved recommendations by genre, misses. Turning the PC on still counts for the shirt riddle.
- **Profile titles** are in Words → Staff profile titles (variants take turns by day; `{n}` in the walls one is the count). Each has a threshold in `profile()`.
- **Closing screen:** three of your stats at random, then "All your stats are on the old PC in the basement." (Words → Closing up, `end.stats`).

**Cleanup (2026-11-12).** `.DS_Store` files and the `.vs/` folder are no longer tracked (`.vs/` added to `.gitignore`). The canvases the engine reads pixels back from are made with `willReadFrequently`, which clears the browser's slow-readback warning.

**Clip names (2026-11-12).** Clip file names in `clips/` are lowercase, and the engine lowercases a bare clip name before loading it (GitHub Pages is case-sensitive; a phone keyboard had capitalized five of them). The curator's Gameplay clip field has autocapitalize and autocorrect off.

**Day tweaks (2026-11-11).**
- **Sunday:** drinks are half price (rounded down, "half off" on the menu). With the drink price at 0 they stay free.
- **Monday:** the conservator says `mon.ask` version 1 the first time you talk to him that day, then version 2 every time after (`txAt`, counted in `progress.day.monTalks`). Box labels are gone (`mon.labels` removed).
- **Tuesday:** `tue.kid` uses one version per Tuesday, taking turns week to week (`weekNo()`). The per-place clues are gone: `{clue}` is just where his mom is ("the Strategy wing", "the café", "the Screening Nook"), and each line supplies its own "in" or "to". `tue.after` is now the kid's line the moment you bring him back, said before his mom's `tue.found`.
- **Wednesday:** the artist and his easel keep off the tiles where you read a case, front or back (`byExhibit`; `freeSpot` skips them too, so boxes, the kid and his mom do as well). His spot and the easel's are picked together (saved as `progress.day.art = { x, y, ex }`), so he always has his easel; a spot saved before a layout change is picked again. Looking at the easel says `wed.easel`.
- **Thursday:** you play by sitting in the one free seat at the café tables (`progress.day.thuSeat`, kept clear of other sitters): it asks `thu.seat`, then Play / Not now. Until you've played, the café counter (and the barista herself) says `thu.ask` (it's trivia night, take a seat), then the counter goes on to the drink menu. Trivia players sit on every café stool but one (the empty one is picked per day), day or night, but not after closing. Missing a question (wrong or out of time) says `thu.wrong` / `thu.time`, then one of them answers with `thu.steal` (a "!" over their head). Talking to them says `thu.crowd`.
- **Saturday:** the vendor is Bluu (his name on photos and in the stats).
- **Today's people keep their spots:** a wandering visitor standing on the artist's, mom's, kid's or a box's tile at a rebuild moves elsewhere instead of that person going missing (`dayTile`).

**Writers' Room (2026-11-10).** `museum/writers-room.html` (also in the curator's More menu): a phone-first page for writing the museum's text one line at a time.
- **Same draft as the curator.** It reads and writes `goq-curator-draft` in this browser, and the curator picks up changes even when it's open in another tab. With no draft yet, it starts one from the folder's `museum-pack.json`. It has its own Export pack (same file as the curator's) and shows the same "pack changed since your draft started" heads-up.
- **What's in it:** every Words line (`GOQ.TEXT`), every staff chat set, visitor mindset lines (ask, loved, liked, nope), achievement names and descriptions, shop item names and descriptions, genre names, the cat's name, nicknames and corkboard notes. **Placards** are their own category: observation, intention (or the guest note) and the visitor's one-liner, per piece.
- **Status:** "To write" if any bracketed placeholder is left (or it's empty), "Yours" if you edited it, "Kept" if you pressed Keep it, otherwise "Not reviewed" (lines Claude wrote). Keeps and marks are stored in `goq-writers-room`, with the punch card days.
- **The daily loop:** Today's line picks the next placeholder, staying in the area you last worked in, then lines to review. Saving, or keeping, stamps today on the punch card, then offers One more or Clock out. Skip moves on without penalty. On multi-entry lines (books, trivia, box labels) empty boxes keep their placeholder, so you can write one entry at a time.
- **Preview:** dialog lines render in the game's own text box (Press Start 2P, 240×48 box, the pack's textbox art) with the same page splitting as the engine, and sample values filled in for `{name}` and the like. LED lines show as the sign (and warn on letters it can't show); lists show as entries; placards as placard blocks.
- **The museum map:** one little room per area, lit by how much is done. Rooms with placeholders left come first; the rest fold behind "Show all rooms".
- No version string of its own: it loads the engine with the version from `version.json`.
- **Old drafts (2026-11-11):** if the draft didn't start from the folder's `museum-pack.json` (no base record, or a different fingerprint), the home screen says so and offers **Update my draft**: it takes the folder's pack and re-applies every line saved in the Writers' Room (`meta.marks` = "mine"). Export asks to do the same first. This came from an export made from an old phone draft, which put old rooms, pieces and settings back (restored in `ae8fb56`). Edits made in the curator on that device outside the Writers' Room aren't carried over by Update.

**Office outlines (2026-11-09).** The curator's office props now end with a near-black outline like the rest of the museum: desk, TV, shelf, chair, camera, Steam Deck table, PC tower, soft box and the floor clutter. The outline color is each palette's darkest; `tower`, `osoft` and `clutter` gained a `#141418` for it (index 7, 5 and 10). Lighting, walls and the clutter layout are unchanged on purpose. Joe uses the custom PNG in the pack, so his look is whatever that PNG is.

**How updates reach players:** see `museum/UPDATING.md` (caching, version strings, custom art and exporting). Keep it current when any of that changes.

**Curator tidy (2026-11-08).** A cleanup pass on curator.html; no pack or engine changes.
- **Header:** only the save status, **More** and **Export pack** stay out. More holds Check version, Import pack, Batch fill (local only, and `batch-fill.html` isn't in the repo) and the GOC link grabber.
- **Pieces fold:** each piece is a one-line row (thumb, title, developer, where it hangs, tags for Painting / Pick / Unveils / Clip / No episode link). Click to open. Which ones are open is kept for the tab session (`goq-open-pieces` in sessionStorage). There's a search box (title or developer) and Open all / Close all. A new piece opens itself and focuses its title. The tab went from about 43,600px tall to about 3,100px.
- **Intros:** a tab's opening paragraphs longer than 220 characters fold into a "How this works" toggle (`tidyTab()`, run after every render).
- **Jump chips:** tabs with four or more sections (Staff, Visitors) get chips at the top that scroll to each section. Rooms and Art are skipped.
- **Checkboxes:** they now sit beside their labels instead of above them.

**GOC link grabber (2026-11-07).** `museum/goc-links.html` (linked from Staff → Friday features) makes `Title | https://youtu.be/ID` lines.
- **Bookmark:** drag it to the bookmarks bar, then click it on a YouTube Videos tab or playlist. It copies every loaded video, skipping Shorts and duplicates, and shows the list to copy by hand if the clipboard is blocked.
- **Paste box:** finds video ids in any text and looks up titles through YouTube's oEmbed. A title that can't be fetched becomes "Games Over Coffee".
- **Pipes:** "|" in titles becomes "/" so the line format holds.

**Days of the week (2026-11-07).** Something small and different each day, by the player's local day of the week (`weekday()`, which follows `todayISO()` so Skip to tomorrow works). Today's progress is kept in `progress.day` (keyed by date and weekday), so reloading doesn't reshuffle it. `placeDay()` runs after every build; `dayTalk()` runs before the usual talk. All lines are bracketed placeholders in Words → Days of the week.
- **Day board** (`day_board`, 32×16): in the lobby at (5, 2), left of the museum door. Today's day is chalked on it (SUN., MON., TUES., WED., THURS., FRI., SAT.); looking at it reads `day.board.<0-6>`. The lobby light switch moved from (5, 2) to (1, 2) to make room.
- **Mon:** five misplaced boxes (`lost_box`) on random open floor in the museum. Talking to the conservator gives a hint (the wing one is in); after all five, 5 tokens.
- **Tue:** a lost kid (`kid`, a visitor shrunk to three quarters) somewhere in the museum. His mom is in the café, the screening nook or a wing (picked by the date). His clue for a wing names its *category*, not the wing. He follows you (`this.fol`, not offered recommendations); talk to his mom with him in tow for 3 tokens.
- **Wed:** the artist with an easel in a random wing. "Show a photo" opens the album (`albumTitle`) and pays by the photo's hidden `rarity`: 0 common (walls, props, signs) 1 token, 1 uncommon (people, the cat, pieces) 3, 2 rare (people reacting, the poster reveal) 6, 3 legendary (the figure, Joe) 12. His sketch of it shows on the staff corkboard for 7 days (`progress.sketch`, a grayscale close-up).
- **Thu:** trivia with the barista: 5 questions, 10 s each (a timer bar; running out counts as a miss). Generated from the pieces (who made it, which wing, which game is in a wing; templates in Words) plus your own (`thu.questions`: question, right answer, three wrong; entries starting with [ are skipped). 1 token per right answer, plus 2 for all five.
- **Fri:** the nook's NOW PLAYING comes from **Friday features** (curator Staff tab: one per line, title and link; `settings.friday`), and the sign says `screen.friday` ("FRIDAY FEATURE:"). They're also at the top of the nook's list.
- **Sat:** a pop-up table and vendor in the lobby, with three items the same for everyone that week: a shop item or a Joe doll, recolored, with a word from `sat.adjectives` ("limited edition x2" sets the price multiplier). Buy any or all. They're kept in `progress.popups` and show in your collection.
- **Sun:** someone from the staff at a café table: shopkeeper, barista, conservator or usher (2 each) or the curator (1) in a 9-slot draw. Sitting on the free stool across from them plays `sun.<role>`, then a quick fade and everyone's back at their post. While the barista or shopkeeper is out, their counter says `sun.break`. New `curator` character art.
- **Curator preview:** Day of the week: Auto / Mon to Sun (`setDay`).

**Nap fix (2026-11-06).** Leaving a seat any way other than walking off (changing rooms, respawning) left `asleep` on, so the Zzz followed you around. `standUp` and `enterRoom` now clear it, and the Zzz only draws while you're seated.

**Curators off the leaderboard (2026-11-06).** `get_leaderboard` (Supabase) leaves out curator badges (`not b.curator`), so the curator is never Employee of the Month or in the top ten. It needs the SQL run again.

**Photo perspective and preview options (2026-11-05).**
- **Photos are 48×36 now** (they were 24×18; the album and close-up showed them bigger anyway). Scenes are drawn at full size; older single-sprite photos are drawn at 24×18 and doubled, so they look as before. The locker frame crop scales with the size.
- **People** (`personScene`, built in `takePhoto` after they react): a classic close-up, drawn at 24×18 on the floor tile they stand on and then doubled (`thumb.close`). They face the camera (the shy turn their back), with their reaction bubble beside their head. Nothing behind them, so it reads as if the camera were right in front of them. (A backdrop of the walls, cases and furniture behind them was tried on 2026-11-05 and removed.)
- **Hallway posters:** the flash reveals a museum game on each poster (`poster:` layer, the same game per poster: `strSeed(room:x,y)`).
- **Joe:** photos of him come out as a full-frame scramble of bits of the museum's own sprites (`thumb.glitch`), MissingNo style.
- **Preview options** (curator):
  - Settings are segmented rows: View as Curator/Visitor, Time Clock/Day/Sunset/Night, Spooky Rare/Every closing, Test pieces Off/60 placeholders.
  - "Make it happen" holds the figure, **Joe** (`summonJoe()`: he appears near you, in any room) and Tomorrow.
  - "Start fresh" holds Re-crate upcoming, Unread everything, and **Start the visit over**. That button was "Reset chores", but it forgets everything done in the preview.
  - The menu opens in place under the buttons, and the preview no longer gets squashed.

**Photos drawn as little scenes again (2026-11-04).**
- **Back to scenes:** the screen-snapshot photos from 2026-11-03 are gone (`ph.shot` is dropped on load, so those photos are drawn from their subject again). Photos are composed scenes once more, built from the room as it is: `thumb.layers` (`[key, col, row, x, y, flip]`, drawn into a `w×h` box), plus `bg`, a tinted floor or wall tile.
- **What's in a scene:**
  - People: their sheet, turned toward you, with their shirt color.
  - Doors and stairs: the actual wall tiles with their door overlay. Side doors are mirrored, and two-tile doors show both halves.
  - Theater: the marquee doorway with its bulbs, and the NOW PLAYING board with the hour's title in LED letters.
  - Office and props: the keypad in its current state, the TV on or off, and any prop with its current art.
  - Also: the theater screen, hallway posters, café wall art, floor-Joe, the cat and the mug.
  - Walls and floors use the room's tinted tiles.
- **Unchanged:** pieces still show their art close up, and older photos with the old `slot` thumbs still draw.

**Photo, placard and cabinet fixes (2026-11-03).**
- **Photos are real snapshots:** a 36×27 crop of the screen around what you're facing (`snapshot`), saved with the photo as a small PNG (`ph.shot`, about 1 KB, so 40 photos is about 40 KB). Pieces still show their art close up. Older photos keep the old sprite-style picture.
- **Placards with the real pixel font:** the earlier tests used a fallback font, but Press Start 2P is far wider. On framed placards the title is now 5.5px and at most two lines (`.gt-rd-tt`), the developer is one line with an ellipsis, and the buttons are 4.5px. Every piece was checked at 1.5x to 5x with the real font, and none overflow. To check layouts, test with that font loaded.
- **Cabinet outline:** `outline()` paints palette color 3 by default, which is a light purple in the arcade's palette. The cabinet now outlines with color 4 (near black) and draws its lit front edge inside the outline.

**Keypad, wooden doors, free arcade (2026-11-02).**
- **Office keypad:** on B1 Storage's wall beside the office door (`keypadAt: [0, 4]`, a new room key, placeable and movable in Rooms; art *Office keypad*, 3 frames: dark before closing, red after hours, green once open). Using it works like the door.
- **Side doors:** every door in a side wall (`doorway_side`) is now a wooden door with a gold handle, mirrored on right-hand walls so the handle faces the room.
- **Hack resistance:** the code is never plain in the pack. `settings.office.lock` is a scrambled form (`officeLock` / `officeUnlock`, exported on GOQ for the curator; an old plain `code` is converted on load). Three wrong tries lock the keypad until tomorrow (`progress.keypad`, `office.lockout`). Someone with the browser's developer tools can still get in; nothing in the browser can stop that.
- **Arcade:** free. The token price, `arcade.free` and `arcade.broke` are gone, `arcade.intro` is a new placeholder, and the choice is Play / Not now. The game list shows the highlighted game's clip file (or its art) and developer beside it (`openList(..., preview)`, `listPreview`).
- **The cabinet:** redrawn seen from its right side, facing left.
- **Lists:** they keep their scroll position between moves (the cursor no longer jumps to the bottom when you go back up), and `closeList()` clears the list so a preview clip stops.

**Curator nicknames (2026-11-01).**
- **Nicknames:** with a curator badge clocked in, personal greetings call you one of `settings.office.nicknames` at random (curator Staff tab, "What people call you"; default DeVaughn, Boss, Mr. curator sir) via `callName()`. That covers the `{name}` in talk lines, Joe, the usher's "already clocked in", and clocking out.
- **Official name:** the HUD, "Clocked in:", leaderboard, lockers and Employee of the Month keep the badge's own name, which is set in Supabase (`goq.rename_badge`).

**The curator's office (2026-10-31).**
- **Room:** `office` (built in), off B1 Storage through a new door on Storage's left wall (0, 5), `officeDoor` event. Spaceship-panel walls (`ship_wall_upper/lower`, 2 frames, a few lights blink), purple-tinted carpet, dim 0.12, no light switch.
- **Furniture:** bookshelf (Words `office.books`: one book per entry, first line is the spine), desk with two monitors off, white PC tower with a purple glow (new room key `colorGlows: [x, y, color, radius]`, drawn over the lighting), TV (off until you turn it on), office chair (sit), Joe, a small table with a Steam Deck, the camera on its tripod (no light) and a soft box. Floor clutter decals: controllers, half-finished iced coffees, a yerba mate can. All of it is placeholder art under Art → Curator's office.
- **TV:** turned on, it plays every clip *file* (from `clips/`) one after another, muted, over its picture area. It follows Settings → Gameplay video.
- **Joe:** in the office he talks to you by your badge name (`office.joe`), or `office.joeAnon` when you're not clocked in. He can't be petted and has no photo reaction. Out in the museum, about one page load in three, he's standing somewhere on the floor. Talk to him and he glitches out (row slices jitter and fade) and is gone for that visit. Counts as `tally.joe` ("Glitchy robot sightings" on the PC).
- **Behind the Scenes** (secret achievement `office`):
  1. **Digits:** a wing's touch screen shows `office.digit` with that wing's digit once every piece in the wing is read front and back (`wingDone`, remembered in `progress.wingsDone`).
  2. **Order:** after 5 loved recommendations (`tally.helped`), the staff corkboard adds `office.callsheet` plus the list of wings in code order.
  3. **After hours:** the keypad only works when `this.closed` (announcement made, lights out). The entry pad is a list (1–9, 0, DELETE, CLOSE). The right code sets `progress.office`, and the door stays open after that.
  - **The code:** one shared code, `settings.office.code` (curator Staff tab, default 40917). The wing order is shuffled by the code (`wings()`), and each wing's digit is the code's digit at its position, so the code you type is the code itself.
- **Curator badge:** `clock_in` now returns `curator` (SQL updated; the guide says to re-run it), and `checkBadge` keeps it on `progress.staff.curator`. A curator badge always opens the office, and the game starts there on load. The office computer offers **Recording mode** (curator only, `progress.recording`): it hides toasts, the HUD chips and the touch controls (`html.goq-rec`), holds the time of day, and skips the tutorial. Spooky events stay.
- **Text:** all new text is bracketed placeholders in Words → Curator's office.
- **Old saved badges:** the one-press "Clock in as …?" reuse (`lastBadge()`) ignores a badge saved before curator support (an online badge with no `curator` field), so that badge asks for its key once and picks up its curator status.

**Framed placards (2026-10-30).**
- **Every piece's placard** now uses the side-by-side layout (`read({ frame: true })`). The frame shows the piece's art (photos smooth, pixel art pixelated) until the piece has a gameplay clip, so adding a clip later needs no other change. Other readers (magazines, stats, the stamp card) keep the old layout.
- **The developer's side** (the back of a case) is mirrored (`flip`): text on the left, frame and title on the right. Intention headings are red everywhere (`tone: "red"` on a section, carried through pagination).
- The note button reads "ADD NOTE +" on framed placards.
- On framed placards the CURATOR'S PICK tag sits on the screen's bottom-left corner, so it no longer pushes the buttons into the footer (frame image rules are scoped to `.gt-rd-clip > img`).

**Clip files (2026-10-29).**
- **Clip files:** the gameplay clip can be a video file in the repo's root `clips/` folder. The curator takes just its name (e.g. `acrobatic-car_1.webm`), and the engine loads `../clips/<name>` relative to `museum/`. Full https URLs to .webm or .mp4 files also work. A file plays in a muted, looping `<video>` that fades in over the pixel art as soon as it plays, with no crop, no scanlines and no YouTube chrome. It only downloads when its placard opens, and closing the placard stops it.
- **Acrobatic Car:** uses `acrobatic-car_1.webm` (320×180 VP9, about 17.5 s, 234 KB).
- **YouTube:** links still work as a fallback, with Clip loop; the overlay returns on each loop.
- **Making clips:** about 320×180, no audio, VP9 webm: `ffmpeg -ss A -to B -i src.mp4 -vf "scale=320:-2,fps=24" -an -c:v libvpx-vp9 -crf 40 -b:v 0 name.webm`.

**Gameplay on placards (2026-10-28), trial on Acrobatic Car.**
- **The fields:** a piece can have a gameplay clip, set in the curator (Pieces): `clipUrl` (YouTube) and `clipLoop` ("12:53-13:00"; empty = play from the start). Acrobatic Car is set to its episode, 12:53 to 13:00.
- **Layout:** a placard for such a piece switches to a side-by-side layout (`.gt-reader.clip`, a CSS grid). The clip frame is 112×63 at top left, with the title, developer and WATCH/PLAY/NOTE under it. The text is in the right column (6.5px, paged as before) and the footer spans both columns.
- **Playback:** the clip plays muted, with scanlines. The case's pixel art holds the frame until the clip has been playing for 3 s (8 s if the player never answers), then it fades in. At the end of the stretch it seeks back to the start. It stops when the placard closes. If the video won't embed, the pixel art stays.
- **Setting:** Settings "Theater screen video" is now "Gameplay video" and covers both (`screenVideo`).
- **Code:** `ytPost` and `listenYt` are shared by the screen and the clip. Untested against real YouTube (container can't reach it).

**One theater room (2026-10-27).**
- **Merged:** the hallway is now part of the `screening` room. The nook is on top (rows 0 to 7), and the 20-tile corridor runs below it (x 5 to 7, rows 8 to 27, alcoves at rows 12, 17 and 22), with black outside the corridor walls. `theater_hall` and `preScreen` are gone.
- **Doors:** the only door is at the bottom, (6, 28), out to the museum. The marquee doors arrive you at (6, 27) facing up.
- **Camera:** a new room key `camAt` (0.75 here) sets where the camera keeps you on screen, from the top (default 0.5). Here you're low on the screen, so you see the corridor ahead and the whole screen from anywhere in the nook.
- **Screen video:** it loads as soon as you enter, and is clipped (`clip-path`) to the part of the screen that's in view. It only shows once the screen is visible and clean.
- **Lighting:** dim 0.4 for the whole room.

**Theater hallway (2026-10-26).**
- **The room:** `theater_hall` (built in), a 3-wide, 20-tile dark corridor between the marquee door and the screening nook. The museum layout doors `screening-1/2` now warp to (3, 22) facing up, the top door leads into the nook, and the nook's doors lead back to (3, 3). It has 3 trash can alcoves, and 8 posters seen edge on (`posters: [x, y, "l"|"r"]`, art *Theater hallway poster*, mirrored for the right wall; looking at one reads `hall.poster`, a placeholder). Floor lights run every 2 tiles along both edges (`floorLights`, art *Hallway floor light*, drawn over the dark with a glow). Dim 0.55, no light switch.
- **Preload:** a room with `preScreen: true` (the hallway) loads the nook's video out of sight, so it's already playing on arrival (a walk is about 5 s). The screen only shows the video once it has been playing for 4 s since it started or jumped (`screenClean`); until then the flicker art stays. If the player never answers at all, the video shows after 9 s. Going in cold just flickers a few seconds.
- **Captions and crop:** captions are switched off by message (`unloadModule captions/cc`, plus `cc_load_policy=0`). The overscan crop is now 124%, to hide the title strip and the logo.
- The "Now playing" notice shows on entering the hallway from the museum.

**Live theater screen and plant names (2026-10-25).**
- **Theater screen video:** in the nook, the hour's NOW PLAYING episode plays muted on the screen itself. It's a YouTube embed (`.gt-scr`) laid over the screen art's 80×45 picture window and repositioned every frame (`syncScreen`). Over it: CSS scanlines, a light pixel grid, a vignette and a slight dim. The player ignores clicks.
- **Mid-episode start:** on load, YouTube's embed messaging (`listening` / `infoDelivery`) reports the length, and the player seeks to (seconds past the hour) mod length.
- **Watch it:** opens the full player at the screen's current time (`start=`), with sound and the scrub bar. The small player is removed while the full one is open and when you leave the room.
- **Fallbacks:** a video that won't embed (`onError`) falls back to the flicker art, as does Settings → Theater screen video (default on).
- **Untested against real YouTube:** it was tested in a container that can't reach YouTube, against a stand-in page that speaks the same messages. Check it on the live site.
- **Screen art:** now 96×48 (three rows tall, into the wall cap), with red curtains and a valance. It's still drawn from `screenAt` (one row up).
- **Plants:** the two museum plants named "plant" are now "snake plant" (29, 8) and "pothos" (30, 8). The PC's favorite plant reads "watered N times".

**Arcade tokens and sign tweaks (2026-10-24).**
- **Creative text rule (from the curator):** new creative lines go in as bracketed placeholders saying what the line is for, e.g. `[Arcade intro: ...]`. The curator writes the real text in Words.
- **Doorway:** a square gold frame instead of a round arch. The bulbs run up the sides and across the top.
- **NOW PLAYING sign:** half as tall (64×12, one line). `screen.marquee` (default "NOW PLAYING:") plus the title scroll right to left like an LED ticker, two columns at a time every 8 frames. With reduced motion it holds still.
- **Arcade:** walking up shows `arcade.intro` (or `arcade.free` when free) with Insert N token(s) / Not now. Without enough tokens you get `arcade.broke`. The token is taken when you pick a game. Price is set in Gift shop → "Café arcade costs" (`shop.arcadePrice`, default 1, 0 = free). `arcade.go` is now a placeholder too.
- The pixel font gained `/`.

**Now playing and the café arcade (2026-10-23).**
- **Screening nook door:** the two doorway tiles in the café east hall now draw as one big dark arch (`marqueeAt: [40, 28]` on the museum room; art *Screening nook doorway*) with chasing gold bulbs around it (*Marquee bulbs*, 2 frames, drawn over the room's lighting so they glow in the dark). The doorway overlays and doormats under it are skipped. The nook has no light switch anymore (it doesn't count toward closing).
- **NOW PLAYING sign:** a black board with red LED letters, four tiles across the hall wall (`nowPlayingAt: [42, 28]`; art *NOW PLAYING board*; letters glow in the dark). Top line from Words (`screen.marquee`), bottom line the episode playing this hour: a random pick from the pieces with episode links, the same for everyone until the hour turns (`nowPlaying()`); long titles scroll. Looking at it reads `screen.sign`. To make room, painting spot [42, 28] and the hall lamp [44, 28] were removed. Both are placeable/movable in Rooms → Spots.
- **In the nook:** walking in shows "Now playing: …" (`screen.enter`). Sitting down or looking at the screen asks `screen.ask` with Watch it / Pick another / Not now.
- **Arcade cabinet** in the café between the magazine stands (36, 35; the lower stand moved down one to 36, 37). Lists every piece with a Play link (title from `arcade.title`) and opens the game in a new tab; if the browser blocks it, a card with a PLAY button. Counts as `arcade`; new achievement **Quarter Muncher** (3). Words → Arcade.
- Pixel font gained : - . ! ? ' & , for signs.

**Screening nook and tweaks (2026-10-22).**
- **Screening nook** (`screening`, built in): a small theater through a wide two-tile door in the café east hallway's north wall (layout doors `screening-1/2` on zone `cafe-east`, at 5 and 6; the hall lamp there moved to x44). A big flickering screen (`screenAt`, art *Screening nook screen*), four benches facing it, dim lights, its own light switch (so closing up includes it). One or two visitors are usually already seated (Words → Screening nook). Sitting down, or looking at the screen, offers NOW SHOWING: every piece with an episode link, newest first. The episode plays over the game (privacy-friendly YouTube player) with a YouTube ↗ link and Close (B/Start). Counts as `episodes`; new achievement **Couch Critic** (5).
- **Placards:** Up and Down highlight WATCH, PLAY and NOTE in turn (past either end, nothing); A uses the highlighted one. A key press opens links directly; a controller press may be blocked by the browser, and then a toast says to click it.
- **Note keyboard:** "Type with my keyboard" under it, or just start typing on a real keyboard, switches to normal typing.
- **K** takes photos again (with X). Backspace still only goes back.
- **Patrons** now and then mention a game from the museum they enjoyed (Words → Staff, `patron.enjoyed`).
- **Stats** on the PC: one line each, indented (`read({ pre: true })` keeps line breaks and indents).
