# Weekly item art (the featured gift)

Each week a new game gets an exhibit, unveiled on the show, and its gift goes on sale in the gift shop at the same moment. You only know what the item is after you've played the game. So the art comes from a claude.ai Project, you tidy it up in the Paint Room, and the Paint Room puts the new item into the curator for you.

Each week's gift is a new shop item. Don't repaint an old one: players who already have it would see their item change. Older gifts drop out of the gift shop when the next one is unveiled, and stay in players' collections and at Bluu's Saturday table.

## Setting up the Project (once)

The files are in museum/claude-project.

1. On claude.ai, make a new Project, for example "GOQ weekly items".
2. Open museum/claude-project/PROJECT-INSTRUCTIONS.md and paste all of it into the Project's instructions.
3. Add item-art-rules.md and item-style-reference.txt to the Project's files (knowledge).

On the free plan Projects have a size cap. These files are small text files, so they fit easily. If you ever lose them, re-upload them from the repo.

## Each week

1. In the Project, start a new chat and say what to draw, for example: "This week: Cognitanks. A toy tank with half a brain on top of the turret, in the center, attached to it. Make a plain version too."
2. Claude answers with a preview page (with a download button) and the art as text in a code block. Ask for small changes until it's close, for example "move the brain one pixel left".
3. Copy the code block (claude.ai has a copy button on it).
4. The quickest way: in the curator, open Episode day and start the episode. Paste Claude's code block into the gift's "Paste art from Claude" box and press Use it; fill in the piece, the gift's name and price, and add it all to the museum at once (steps 5 to 7 are the Paint Room way, for when you want to touch the art up first).
5. Or, in the Paint Room, open Shop items, then New weekly gift. Fill in the name, price and description, choose the exhibit, and check the unveil date.
6. Press Paint it, open More, choose Paste art from Claude, paste, and press Use it. If you pasted more than one version, pick one. Touch it up with the Paint Room's tools, then Save.
7. Press Send to the curator. (Or skip Send: Episode day's gift has a "From the Paint Room" list that takes the item straight in.) It adds the item to the curator's draft in that browser as the exhibit's gift, and sets the exhibit's unveil date. Nothing else changes.
8. Open the curator in the same browser, check it in the Preview tab, export the pack and push it before the show goes live.

To ask Claude for a change after you've edited it yourself, use More, then Copy as text in the Paint Room, and paste that into the chat.

Every few weeks, refresh the Project's style reference: in Shop items, press Download item-style-reference.txt, then replace the file in the Project. Claude then matches everything that's in the shop.

## If something's off

| What you see | What to do |
|---|---|
| Paste says a row uses a letter that isn't one of the colors | Claude made a typo. Ask it to check that picture against the rules and send it again. |
| Paste says it found the wrong number of rows | The picture isn't 16 by 16. Ask Claude to redo it at exactly 16 by 16. |
| Send says there's already a gift for that exhibit | Say OK to make yours the gift; the old one stays in the shop as a regular item. |
| Send says the shop has 40 items | That's the most a pack keeps. Remove an old regular item in the curator, then send again. |
| The curator doesn't show the item | Use the curator in the same browser as the Paint Room, and reload it after sending. |

## The rules the art follows

These are the same rules as in item-art-rules.md, the file Claude reads.

| What | Rule |
|---|---|
| Size | Exactly 16 by 16 pixels. The game shows every shop item as a 16 by 16 icon; a bigger image gets shrunk and goes blurry. |
| File | Transparent background. No white or colored box behind the item. |
| Edges | Hard pixels only: no anti-aliasing, no soft shadows, no gradients. |
| Outline | A 1-pixel outline all the way round, in the game's near-black, #181820. |
| Colors | 4 to 7 colors in all, counting the outline. Each part gets 2 or 3 shades of its color: light, mid and dark. |
| Highlight | The game's off-white, #f8f4ec, not pure white. One or two pixels is plenty. |
| Light | From the top left: lighter on top and left, darker on the bottom and right. |
| View | A slight three-quarter view, a little from above and from the side, the way Pokémon Red and Blue draw items and furniture. |
| Fit | Fill most of the square but leave a pixel or so of room at the edges, centered. |
| Readability | Recognizable at real size. Exaggerate the one thing that makes it this item and leave out small detail. |

## The art as text

The Paint Room and the Project share a simple text format called GOQ ART. A picture is a header line (GOQ ART, the name and 16x16), a line ". transparent", one line per color (a letter, a space and #rrggbb), then 16 rows of 16 characters, one per pixel. item-art-rules.md has the full description and an example. The Paint Room's paste is forgiving: it skips code fences, quotes, commas and any chat around the picture.

## This week: Cognitanks

Both versions are drawn already, in museum/item-art, and they're the first two pictures in the style reference.

| File | What it is |
|---|---|
| museum/item-art/toy-tank.png | A plain green toy tank |
| museum/item-art/cognitank.png | The same tank with half a brain on top of the turret, in the center |

To use one: copy its picture from museum/claude-project/item-style-reference.txt (from its GOQ ART line down to the last row) and paste it into a new weekly gift in the Paint Room. Or use Import a PNG as pixels with the PNG file.
