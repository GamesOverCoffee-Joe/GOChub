# Weekly item art (the featured gift)

Each week a new game gets an exhibit, unveiled on the show. Its gift goes on sale in the gift shop at the same moment. You only know what the item is after you've played the game, so this is the quick path: ask Claude for the art, touch it up in your paint program, upload it in the curator, then push the update just before the show.

## The steps each week

1. Play the game and decide on the item: what it is, its colors, and anything about it that has to read at a glance.
2. Open a new chat on claude.ai and paste the prompt below, filled in. You'll get a page that shows the art large and at real size, with a download button for each version.
3. Ask for changes in plain words until it's close, for example "move the brain one pixel left" or "make the treads darker".
4. Download the PNG and tidy it up in your paint program. Keep it exactly 16 by 16, and keep the background see-through.
5. In the curator, open the Shop tab and add an item. Fill in its name, price and description, then use Choose image to add the PNG. Set Unveil gift for to the new exhibit.
6. Check it in the Preview tab, using Force stock if you need it on the shelf. Then save the pack and push it before the show goes live.

## The rules the art has to follow

| What | Rule |
|---|---|
| Size | Exactly 16 by 16 pixels. The game shows every shop item as a 16 by 16 icon. A bigger image gets shrunk and goes blurry, so draw at 16. |
| File | PNG with a transparent background. No white or colored box behind the item. |
| Edges | Hard pixels only: no anti-aliasing, no soft shadows, no gradients. |
| Outline | A 1-pixel outline all the way round, in the game's near-black, #181820. |
| Colors | 4 to 7 colors in all, counting the outline. Each part of the item gets 2 or 3 shades of its color: light, mid and dark. |
| Highlight | Highlights in the game's off-white, #f8f4ec, not pure white. One or two pixels is plenty. |
| Light | Light comes from the top left: lighter on top and left, darker on the bottom and right. |
| View | A slight three-quarter view, a little from above and from the side, the way Pokémon Red and Blue draw items and furniture. |
| Fit | Fill most of the square but leave a pixel or so of room at the edges, centered. Wide things such as a tank sit lower; tall things are centered. |
| Readability | It has to be recognizable at real size in a menu. Exaggerate the one thing that makes it this item (the brain, the logo, the shape) and leave out small detail. |

These shades were used for the Cognitanks pair, so you can reuse or match them:

| Use | Color |
|---|---|
| Outline | #181820 |
| Highlight | #f8f4ec |
| Toy green (light, mid, dark) | #9cc46a, #5f8f3e, #3a5a2a |
| Treads and wheels | #4a4a58, #a8aeb8 |
| Brain pink (light, mid, dark) | #f6b8c4, #e07a92, #a84a66 |

## The prompt to paste into claude.ai

Copy everything from "I'm making pixel art" down to the end of this section. Replace the parts in square brackets.

I'm making pixel art for a shop item in my game, the GOQ Museum: a cozy, top-down pixel game in the style of Pokémon Red and Blue, with a modern palette. Please draw the item and give it to me as an HTML artifact.

The item: [WHAT IT IS, e.g. a toy tank]. It's the gift for the exhibit of the game [GAME NAME]. Details that matter: [COLORS, PARTS, ANYTHING IT MUST SHOW]. Please make [NUMBER] versions: [DESCRIBE EACH VERSION, e.g. 1) a plain toy tank, 2) the same tank with half a brain on top of the turret, in the center, attached to it].

The rules:
- Exactly 16 by 16 pixels, on a transparent background.
- Hard pixels only: no anti-aliasing, gradients or soft shadows.
- A 1-pixel outline all the way round in #181820.
- 4 to 7 colors in all, counting the outline, with 2 or 3 shades per part (light, mid, dark). Highlights in #f8f4ec, never pure white.
- Light from the top left.
- A slight three-quarter view, a little from above and from the side, like items and furniture in Pokémon Red and Blue.
- Centered, with about a pixel of room at the edges. It must still be recognizable at real size, so exaggerate the defining feature and skip fine detail.

How to build it:
- Write each version as a grid of 16 strings of 16 characters, one character per pixel, with "." for transparent and a letter for each color, plus a small table of letters to hex colors. Keep the grids in the page's code so I can ask you to change single pixels.
- Show each version three ways: large (each pixel a 20-pixel square, on a light checkerboard so the transparent parts show), on a dark background, and at real size (16 by 16, and again at 2x).
- Give each version a "Download PNG" button that saves exactly 16 by 16 pixels with a transparent background, named after the item (for example toy-tank.png).
- Under each version, list the colors it uses.

After that I'll ask for small fixes, such as "move this one pixel" or "darken the treads". Change only what I ask, keep the same grid and colors otherwise, and update the page.

## This week: Cognitanks

Both versions are already drawn by Claude, in museum/item-art. They follow the rules above, and both were checked in the gift shop at real size.

| File | What it is |
|---|---|
| museum/item-art/toy-tank.png | A plain green toy tank |
| museum/item-art/cognitank.png | The same tank with half a brain on top of the turret, in the center |

To use one, download it from GitHub (or take it from the folder in your copy of the repo), tweak it if you like, then add it in the curator's Shop tab as in step 5.
